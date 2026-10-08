/** 在全量列表内移动；其余项保持相对顺序。无效目标保持原顺序。 */
export function moveBefore<T extends { id: string }>(items: T[], id: string, beforeId: string | null): T[] {
  const item = items.find((entry) => entry.id === id);
  if (!item || id === beforeId || (beforeId !== null && !items.some((entry) => entry.id === beforeId))) return items;
  const remaining = items.filter((entry) => entry.id !== id);
  const index = beforeId === null ? remaining.length : remaining.findIndex((entry) => entry.id === beforeId);
  remaining.splice(index, 0, item);
  return remaining;
}
