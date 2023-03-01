import { getCurrentTab } from "./tabs_shared.ts"

export function getModTopicsDiv() {
  return document.getElementById("tab-modtopics") as HTMLDivElement | null
}

/**
 * ForumTab
 * @returns
 */
export function getTopicsTabH2() {
  return document.getElementById("topics_tab_h2") as HTMLHeadElement | null
}

export function isForumTab() {
  return getCurrentTab() === "forum" && getTopicsTabH2() !== null
}

export function getTopicTable() {
  return document.getElementById("mod_forum_topics") as HTMLTableElement | null
}

export function getAllTopicAnchors() {
  const topicTable = getTopicTable()
  if (!topicTable) return null
  const topicAnchorsOfTHead = topicTable.tHead!.querySelectorAll<HTMLAnchorElement>(
    ":scope > tr > td.table-topic > a.go-to-topic"
  )
  const topicAnchorsOfTBody = topicTable.tBodies[0].querySelectorAll<HTMLAnchorElement>(
    ":scope > tr > td.table-topic > a.go-to-topic"
  )
  return Array.from(topicAnchorsOfTHead).concat(Array.from(topicAnchorsOfTBody))
}

export function clickTopicAnchor(callback: (anchor: HTMLAnchorElement, event: Event) => unknown) {
  const allTopicAnchors = getAllTopicAnchors()
  if (allTopicAnchors) {
    for (const topicAnchor of allTopicAnchors) {
      topicAnchor.addEventListener("click", (event) => {
        callback(topicAnchor, event)
      })
    }
  }
}

