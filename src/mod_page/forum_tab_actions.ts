import { observeAddDirectChildNodes } from "../util.ts"
import { getModTopicsDiv } from "./forum_tab.ts"

/**
 * 点击 topicAnchor 后, Nexusmods 修改 modTopicsDiv 的 ChildNodes,
 * 没有修改 `div.tabcontent.tabcontent-mod-page` 的 ChildNodes
 * @returns
 */
export function modTopicsDivAddedDirectChildNodes(): Promise<0> {
  return new Promise((resolve) => {
    observeAddDirectChildNodes(getModTopicsDiv()!, (mutationList, observer) => {
      console.log("modTopicsDiv add childNodes mutationList:", mutationList)
      observer.disconnect()
      resolve(0)
    })
  })
}
