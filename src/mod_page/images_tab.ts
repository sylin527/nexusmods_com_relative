/**
 * 暂没使用
 */

/**
 * normal users change it will do nothing
 */
export function getImageAmountPerPage() {
  return 24
}

/**
 * `div#list-modimages-1`
 */
export function getAuthorImagesContainerDiv() {
  return document.getElementById("list-modimages-1") as HTMLDivElement
}

/**
 * `div#list-modimages-2`
 */
export function getUserImagesContainerDiv() {
  return document.getElementById("list-modimages-2") as HTMLDivElement
}

export const dataScriptSelector = "div.pagenav.clearfix.head-nav > script:first-child"
