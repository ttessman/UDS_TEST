import { Box, Chip, Typography } from "@mui/material";
import { describeShape } from "../../../lib/shape.js";
import { Accordion, accordionTemplate } from "../../accordion/Accordion.js";

export function ShapeAccordion({ title, value }: { title: string; value: unknown }) {
  const shape = describeShape(value);

  if (value == null || shape.length === 0) {
    return null;
  }

  return (
    <Accordion>
      <accordionTemplate.summary>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      </accordionTemplate.summary>
      <accordionTemplate.details>
        <Box sx={{ display: "grid", gap: 0.75 }}>
          {shape.slice(0, 80).map((node) => (
            <Box key={`${node.path}-${node.type}`} sx={{ alignItems: "center", display: "flex", gap: 1 }}>
              <Typography component="code" sx={{ flex: 1, overflowWrap: "anywhere" }}>
                {node.path}
              </Typography>
              <Chip label={node.type} size="small" variant="outlined" />
            </Box>
          ))}
        </Box>
      </accordionTemplate.details>
    </Accordion>
  );
}
