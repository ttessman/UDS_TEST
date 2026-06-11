import { useState, type ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { ActionButton } from "../../button/resourceTypes/ActionButton.js";
import type { ResolvedCodeBlock } from "../../card/resourceTypes/resourceCard.types.js";
import { Modal } from "../Modal.js";

export function CodeDialog({
  blocks,
  modalId,
  title
}: {
  blocks: ResolvedCodeBlock[];
  modalId: string;
  title: ReactNode;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyBlock(block: { content: string; title: string }) {
    await navigator.clipboard.writeText(block.content);
    setCopied(block.title);
  }

  return (
    <Modal
      definition={{
        contentSx: { bgcolor: "var(--app-bg-default)" },
        maxWidth: "md",
        title
      }}
      modalId={modalId}
    >
      <Stack sx={{ gap: 2 }}>
        {blocks.map((block) => (
          <Box key={block.title}>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>{block.title}</Typography>
              <ActionButton
                icon="copy"
                label={copied === block.title ? "Copied" : "Copy"}
                onClick={() => void copyBlock(block)}
                variant="outlined"
              />
            </Stack>
            <Box component="pre" sx={{ m: 0 }}>
              <code>{block.content}</code>
            </Box>
          </Box>
        ))}
      </Stack>
    </Modal>
  );
}
