export type ShapeNode = {
  path: string;
  type: string;
};

export function describeShape(value: unknown, root = "root", depth = 0): ShapeNode[] {
  if (depth > 3) {
    return [{ path: root, type: "..." }];
  }

  if (Array.isArray(value)) {
    const first = value[0];
    return [
      { path: root, type: `array(${value.length})` },
      ...(first === undefined ? [] : describeShape(first, `${root}[]`, depth + 1))
    ];
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => [
      { path: `${root}.${key}`, type: readableType(child) },
      ...describeShape(child, `${root}.${key}`, depth + 1)
    ]);
  }

  return [{ path: root, type: readableType(value) }];
}

function readableType(value: unknown): string {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value === null) {
    return "null";
  }
  return typeof value;
}
