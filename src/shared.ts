import { getValue } from "./userscript_lib/mod.ts"

/**
 * 从 Userscript 的 Storage 里获取
 * @returns
 */
export function isSylin527(): boolean {
  const value = getValue("isSylin527")
  return typeof value === "boolean" ? value : false
}
