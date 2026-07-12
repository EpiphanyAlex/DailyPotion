// 哨兵文件：仅用于验证 Vitest + @/* alias 工具链。
// Phase 3 建立 lib/matching.ts 及其测试后，由 Phase 3 计划删除本文件与 sanity.test.ts。
export function add(a: number, b: number): number {
  return a + b
}
