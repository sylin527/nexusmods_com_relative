import { getNexusmodsUrl } from "../site_shared.ts"

export const isProduction = true

/**
 * 是否压缩代码
 */
export const isMinified = false

export function getAuthor() {
  return "sylin527"
}

export function getNamespace() {
  return getNexusmodsUrl()
}

export function getLicense() {
  return "GPLv3"
}



