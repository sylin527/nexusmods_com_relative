/**
 * cache codes of other file
 * @param ms
 * @returns
 *
 * @see `file:///H:/Workspaces/@lyne408/ecmascript_lib/src/time_util.ts`
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * cache codes of other file
 * @see `file:///H:/Workspaces/@lyne408/ecmascript_lib/src/path_util.ts`
 */
const illegalCharReplacerMapping: { [key: string]: string } = {
  "?": "？",
  "*": "＊",
  ":": "：",
  "<": "＜",
  ">": "＞",
  '"': "＂",
  "/": " ∕ ",
  "\\": " ⧵ ",
  "|": "｜",
}

/**
 * cache codes of other file
 * @see `file:///H:/Workspaces/@lyne408/ecmascript_lib/src/path_util.ts`
 *
 * @param pathArg
 * @returns
 */
export function replaceIllegalChars(pathArg: string) {
  // 1. NTFS, File System Entity can not start width `space`, so trim left and right chars whose charCode <= 32
  pathArg = pathArg.trim()
  // 2. can't start width `?, *, :, ", <, >, \, /, |`.
  return pathArg.replace(
    /(\?)|(\*)|(:)|(<)|(>)|(")|(\/)|(\\)|(\|)/g,
    (found) => illegalCharReplacerMapping[found],
  )
}

/**
 * cache codes of other file
 * Date instance -> `YYYY-MM-DD` (如: `2022-05-12`)
 * @param date
 * @returns
 */
export function toIsoLikeDateString(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${
    date
      .getDate()
      .toString()
      .padStart(2, "0")
  }`
}

/**
 * cache codes of other file
 * @param date
 * @returns
 */
export function toIsoLikeDateTimeString(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${
    date
      .getDate()
      .toString()
      .padStart(2, "0")
  } ${date.toTimeString().substring(0, 8)}`
}

/**
 * cache codes of other file
 * 效果和 innerHTML = '' 类似
 *
 * ## 实现方式
 *
 * 当还存在子节点时, 删除第一个节点
 * @param node
 */
export function removeAllChildNodes(node: Node) {
  // 当还存在子节点时,循环继续
  while (node.hasChildNodes()) {
    // @ts-ignore 当还存在子节点时, firstChild 必然存在
    node.firstChild.remove()
  }
}

/**
 * cache codes of other file
 * @param targetNode
 * @param callback
 * @returns
 */
export function observeDirectChildNodes(
  targetNode: Node,
  callback: (
    mutationList: MutationRecord[],
    observer: MutationObserver,
  ) => unknown,
) {
  const observer = new MutationObserver((mutationList) => {
    callback(mutationList, observer)
  })
  observer.observe(targetNode, {
    childList: true,
    attributes: false,
    // Omit (or set to false) to observe only changes to the parent node
    subtree: false,
  })
  return observer
}

/**
 * cache codes of other file
 * @param targetNode
 * @param callback
 * @returns
 */
export function observeAddDirectChildNodes(
  targetNode: Node,
  callback: (
    mutationList: MutationRecord[],
    observer: MutationObserver,
  ) => unknown,
) {
  return observeDirectChildNodes(targetNode, (mutationList, observer) => {
    for (let index = 0; index < mutationList.length; index++) {
      const mutation = mutationList[index]
      const isAddNodesMutation = mutation.addedNodes.length > 0
      if (isAddNodesMutation) {
        callback(mutationList, observer)
        break
      }
    }
  })
}
