import type { ReactNode } from 'react';

/**
 * Honeycomb page: three rows laid out 4 / 5 / 4 across a 1200x624 canvas.
 * The outer rows are narrower than the middle one, so centering them inside the
 * column offsets each by half a cell (120px) and produces the honeycomb stagger.
 *
 * Slots are named and always rendered, for two reasons: a partly filled page
 * keeps every tile in its slot instead of re-centering the row, and a tile's
 * identity is the slot it sits in rather than its position in the items array.
 */
const ROWS = [
  { id: 'top', width: 'w-240', slots: ['top-0', 'top-1', 'top-2', 'top-3'] },
  { id: 'middle', width: 'w-300', slots: ['middle-0', 'middle-1', 'middle-2', 'middle-3', 'middle-4'] },
  { id: 'bottom', width: 'w-240', slots: ['bottom-0', 'bottom-1', 'bottom-2', 'bottom-3'] },
] as const;

/** How many items the rows before this one consume. */
const ROW_OFFSETS = ROWS.map((_, index) => ROWS.slice(0, index).reduce((total, row) => total + row.slots.length, 0));

/** App slots on one page: 4 + 5 + 4. */
export const APP_PAGE_CAPACITY = ROWS.reduce((total, row) => total + row.slots.length, 0);

export function AppPage({ items = [] }: { items?: ReactNode[] }) {
  return (
    <div className="flex h-156 w-300 flex-col items-center">
      {ROWS.map((row, rowIndex) => (
        <div key={row.id} className={`flex h-52 ${row.width}`}>
          {row.slots.map((slot, slotIndex) => (
            <div key={slot} className="flex h-52 w-60 flex-none items-center justify-center">
              {items[ROW_OFFSETS[rowIndex] + slotIndex]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
