import { useRef } from "react";
import { Box, Button, FormHelperText } from "@mui/material";
import { FilePickerSection } from "components/sections/section.file.picker";
import { AideFieldProps } from "../aideform";
import { get } from "lodash";

const previewUrlCache = new WeakMap<File, string>();

function getPreviewUrl(file: File) {
  let url = previewUrlCache.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    previewUrlCache.set(file, url);
  }
  return url;
}

function revokePreviewUrl(file: File) {
  const url = previewUrlCache.get(file);
  if (url) {
    URL.revokeObjectURL(url);
    previewUrlCache.delete(file);
  }
}

/*-------------------------------------------
  LOCAL UPLOAD
--------------------------------------------*/

export const AideLocalUpload = <TFormData,>({
  field,
  error,
  showError,
  rawValue,
  uniqueId,
  name,
}: AideFieldProps<TFormData>) => {
  const { localUploadConfig: uploadCfg, testid, sx } = field;

  if (!uploadCfg) {
    console.warn("Missing localUploadConfig for local-upload field");
    return null;
  }

  const files = (rawValue as File[]) ?? [];
  const isErrored = !!showError;

  const isPreviewableImage = (f: File) =>
    /^image\/(png|jpe?g|svg\+xml|webp|gif)$/i.test(f.type) || /\.(png|jpe?g|svg|webp|gif)$/i.test(f.name);

  const handleRemove = (index: number) => {
    const f = files[index];
    if (f) revokePreviewUrl(f);
    uploadCfg.onRemove(index, name as keyof TFormData);
  };

  return (
    <Box key={uniqueId} id={uniqueId} data-testid={testid || uniqueId} sx={{ mb: 2, ...sx }}>
      <FilePickerSection
        onAddFile={(file) => uploadCfg.onAddFile(file, name as keyof TFormData)}
        onClose={uploadCfg.onClose ?? (() => {})}
        testid={testid ? testid : uniqueId}
      />

      {files.length === 0 ? (
        <Box
          data-testid={testid ? `${testid}--no-files` : `${uniqueId}--no-files`}
          mt={2}
          textAlign="center"
          sx={{ color: "var(--text-color)" }}
        >
          <b>No Files Selected</b>
        </Box>
      ) : (
        <>
          {/* File List */}
          <Box mt={2} data-testid={testid ? `${testid}--files` : `${uniqueId}--files`}>
            {files.map((file, index) => (
              <Box
                key={`${file.name}-${file.lastModified}-${index}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
                data-testid={testid ? `${testid}--${file.name}` : `${uniqueId}--${file.name}`}
                sx={{ color: "var(--text-color)" }}
              >
                <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pr: 2 }}>
                  {file.name}
                </Box>
                <Box
                  sx={{ cursor: "pointer", color: "var(--primary-color)", fontWeight: 500 }}
                  onClick={() => handleRemove(index)}
                >
                  Remove
                </Box>
              </Box>
            ))}
          </Box>

          {/* Image Previews */}
          {files.some(isPreviewableImage) && (
            <Box mt={2}>
              <Box mb={1} sx={{ fontSize: 14, opacity: 0.8, color: "var(--text-color)" }}>
                Preview
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {files.filter(isPreviewableImage).map((file, idx) => {
                  const objectUrl = getPreviewUrl(file);
                  return (
                    <Box
                      key={`${file.name}-${file.lastModified}-thumb-${idx}`}
                      sx={{
                        width: 200,
                        height: 150,
                        borderRadius: 1,
                        border: "1px solid var(--alt-border-color)",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--card-bg, #fafafa)",
                      }}
                    >
                      <img
                        src={objectUrl}
                        alt={`attachment-${idx}`}
                        style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </>
      )}

      {isErrored && (
        <Box
          mt={1}
          color="error.main"
          fontSize="0.875rem"
          data-testid={testid ? `${testid}-errors` : `${uniqueId}-errors`}
        >
          {error}
        </Box>
      )}
    </Box>
  );
};

/*-------------------------------------------
  SCREENSHOT UPLOAD (Restored)
--------------------------------------------*/
export const AideScreenshotUpload = <TFormData,>({
  field,
  error,
  showError,
  rawValue,
  uniqueId,
  label,
  name,
  handleChange,
  helper,
  startAdornment,
  formData,
}: AideFieldProps<TFormData>) => {
  const { sx, screenshotConfig, testid } = field;
  const { max, previewHeight = 150, capture } = screenshotConfig ?? {};
  const files = (rawValue as File[]) ?? [];

  // Use a local ref for the capture queue to prevent overlapping captures
  const captureQueueRef = useRef<Promise<void>>(Promise.resolve());

  const isPreviewable = (f: File) =>
    /^image\/(png|jpe?g|svg\+xml|webp|gif)$/i.test(f.type) || /\.(png|jpe?g|svg|webp|gif)$/i.test(f.name);

  const defaultCapture = async (): Promise<File> => {
    const { toPng } = await import("html-to-image");

    const dataUrl = await toPng(document.body, {
      cacheBust: true,
      pixelRatio: 2,
      skipAutoScale: true,
      filter: (node) => !(node instanceof Element && node.closest("[data-screenshot-exclude]")),
    });

    const [header, base64] = dataUrl.split(",");
    const mimeMatch = /^data:(.+);base64$/.exec(header);
    const mime = mimeMatch?.[1] ?? "image/png";

    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const blob = new Blob([bytes], { type: mime });
    const id = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

    return new File([blob], `bug-screenshot-${id}.png`, {
      type: mime,
      lastModified: Date.now(),
    });
  };

  const doCapture = async () => {
    const makeFile = capture ?? defaultCapture;

    await (captureQueueRef.current = captureQueueRef.current.then(async () => {
      try {
        const file = await makeFile();
        const currentFiles = (get(formData, String(name)) as File[]) ?? [];
        const next = max ? [...currentFiles, file].slice(-max) : [...currentFiles, file];

        handleChange(name as keyof TFormData, next);
      } catch (err) {
        if ((window as any).alertErrorMessage) {
          (window as any).alertErrorMessage("Screenshot capture failed");
        } else {
          console.error("Screenshot capture failed", err);
        }
      }
    }));
  };

  const removeAt = (idx: number) => {
    const f = files[idx];
    if (f) revokePreviewUrl(f);
    const next = files.filter((_, i) => i !== idx);
    handleChange(name as keyof TFormData, next);
  };

  const clearAll = () => {
    files.forEach(revokePreviewUrl);
    handleChange(name as keyof TFormData, []);
  };

  return (
    <Box key={uniqueId} id={uniqueId} data-testid={testid || uniqueId} sx={{ mb: 2, ...sx }}>
      {label && (
        <Box mb={1} display="flex" alignItems="center" gap={1} sx={{ color: "var(--text-color)", mb: 2 }}>
          {startAdornment}
          <Box component="span" sx={{ fontWeight: 600 }}>
            {label}
          </Box>
          {!!max && (
            <Box sx={{ ml: 1, opacity: 0.6, fontSize: 12 }}>
              ({files.length}/{max})
            </Box>
          )}
        </Box>
      )}

      <Box display="flex" gap={1} flexWrap="wrap">
        <Button
          variant="outlined"
          size="small"
          onClick={() => void doCapture()}
          data-testid={testid ? `${testid}--capture` : `${uniqueId}--capture`}
          disabled={!!max && files.length >= max}
        >
          Capture Screenshot
        </Button>
        {files.length > 0 && (
          <Button size="small" onClick={clearAll} data-testid={testid ? `${testid}--clear` : `${uniqueId}--clear`}>
            Clear All
          </Button>
        )}
      </Box>

      {helper && (
        <FormHelperText data-testid={`${uniqueId}-helper`} sx={{ mt: 0.5 }}>
          {helper}
        </FormHelperText>
      )}

      {files.length > 0 && (
        <Box mt={2}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, height: previewHeight + 35, overflow: "auto" }}>
            {files.map((file, idx) => {
              const url = getPreviewUrl(file);
              const ok = isPreviewable(file);
              const key = `${file.name}-${file.lastModified}-${idx}`;
              return (
                <Box key={key} sx={{ width: 220 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: previewHeight,
                      borderRadius: 1,
                      border: "1px solid var(--alt-border-color)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "var(--card-bg, #fafafa)",
                    }}
                  >
                    {ok ? (
                      <img
                        src={url}
                        alt={file.name}
                        style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }}
                      />
                    ) : (
                      <Box sx={{ p: 2, fontSize: 12, opacity: 0.8 }}>{file.name}</Box>
                    )}
                  </Box>

                  <Box mt={0.5} display="flex" justifyContent="space-between" alignItems="center">
                    <Box
                      sx={{
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 150,
                        color: "var(--text-color)",
                      }}
                    >
                      {file.name}
                    </Box>
                    <Button
                      size="small"
                      onClick={() => removeAt(idx)}
                      sx={{ fontSize: 12 }}
                      data-testid={testid ? `${testid}--remove-${idx}` : `${uniqueId}--remove-${idx}`}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {showError && (
        <FormHelperText data-testid={`${uniqueId}-error`} error sx={{ mt: 0.5 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

/*-------------------------------------------
  EXTERNAL UPLOAD
--------------------------------------------*/

export const AideExternalUpload = <TFormData,>({
  field,
  error,
  showError,
  rawValue,
  uniqueId,
  name,
  formData,
}: AideFieldProps<TFormData>) => {
  const { externalUploadConfig: uploadCfg, testid, sx } = field;

  if (!uploadCfg) {
    console.warn("Missing externalUploadConfig for external-upload field");
    return null;
  }

  const files = (rawValue as File[]) ?? [];
  const isErrored = !!showError;

  const isPreviewableImage = (f: File) =>
    /^image\/(png|jpe?g|svg\+xml|webp|gif)$/i.test(f.type) || /\.(png|jpe?g|svg|webp|gif)$/i.test(f.name);

  const handleRemove = (index: number) => {
    const f = files[index];
    if (f) revokePreviewUrl(f);
    uploadCfg.onRemove(index, name as keyof TFormData);
  };

  return (
    <Box key={uniqueId} id={uniqueId} data-testid={testid || uniqueId} sx={{ mb: 2, ...sx }}>
      <Button variant="contained" onClick={() => void uploadCfg.onFetchFile(name as keyof TFormData, formData)}>
        Fetch from External Source
      </Button>

      {files.length === 0 ? (
        <Box
          data-testid={testid ? `${testid}--no-files` : `${uniqueId}--no-files`}
          mt={2}
          textAlign="center"
          sx={{ color: "var(--text-color)" }}
        >
          <b>No Files Fetched</b>
        </Box>
      ) : (
        <>
          {/* File List Section */}
          <Box mt={2} data-testid={testid ? `${testid}--files` : `${uniqueId}--files`}>
            {files.map((file, index) => (
              <Box
                key={`${file.name}-${file.lastModified}-${index}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
                data-testid={testid ? `${testid}--${file.name}` : `${uniqueId}--${file.name}`}
                sx={{ color: "var(--text-color)" }}
              >
                <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pr: 2 }}>
                  {file.name}
                </Box>
                <Box
                  sx={{ cursor: "pointer", color: "var(--primary-color)", fontWeight: 500 }}
                  onClick={() => handleRemove(index)}
                >
                  Remove
                </Box>
              </Box>
            ))}
          </Box>

          {/* Image Previews Section */}
          {files.some(isPreviewableImage) && (
            <Box mt={2}>
              <Box mb={1} sx={{ fontSize: 14, opacity: 0.8, color: "var(--text-color)" }}>
                Preview
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {files.filter(isPreviewableImage).map((file, idx) => {
                  const objectUrl = getPreviewUrl(file);
                  return (
                    <Box
                      key={`${file.name}-${file.lastModified}-thumb-${idx}`}
                      sx={{
                        width: 200,
                        height: 150,
                        borderRadius: 1,
                        border: "1px solid var(--alt-border-color)",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--card-bg, #fafafa)",
                      }}
                    >
                      <img
                        src={objectUrl}
                        alt={`attachment-${idx}`}
                        style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </>
      )}

      {isErrored && (
        <Box
          mt={1}
          color="error.main"
          fontSize="0.875rem"
          data-testid={testid ? `${testid}-errors` : `${uniqueId}-errors`}
        >
          {error}
        </Box>
      )}
    </Box>
  );
};
