import type { ResolvedCodeBlock, ResourceCodeBlock, ResourceRenderArgs } from "./resourceCard.types.js";

export function resolveCodeBlock<T extends object, C>(
  block: ResourceCodeBlock<T, C>,
  args: ResourceRenderArgs<T, C>
): ResolvedCodeBlock | null {
  const content = block.content(args);

  if (!content) {
    return null;
  }

  return {
    content,
    language: block.language,
    title: block.title
  };
}
