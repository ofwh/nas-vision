import { generateKeyBetween } from 'fractional-indexing';

/**
 * 排序键：字典序即显示顺序。SQLite 的 text 默认按 BINARY 比较，与 JS 一致，建表不用指定 collation。
 * 键由 fractional-indexing 取邻居中点生成，所以移动只写一行、删除不用补位、两键之间永远能再插。
 */

/** 两侧 null 表示列表的头 / 尾。 */
export function rankBetween(prev: string | null, next: string | null): string {
  return generateKeyBetween(prev, next);
}

/** 空表传 null。 */
export function rankAfter(last: string | null): string {
  return generateKeyBetween(last, null);
}
