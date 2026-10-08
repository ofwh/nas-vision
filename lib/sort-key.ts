import { generateKeyBetween } from 'fractional-indexing';

/**
 * 排序键：字典序即显示顺序。SQLite 的 text 默认按 BINARY 比较，与 JS 一致，建表不用指定 collation。
 * 新增在末尾生成键；移动时在事务内重新生成全量键，避免重复及键无限增长；删除无需补位。
 */

/** 空表传 null。 */
export function rankAfter(last: string | null): string {
  return generateKeyBetween(last, null);
}
