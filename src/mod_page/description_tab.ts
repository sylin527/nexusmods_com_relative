import { getCurrentTab, getTabContentDiv } from "./tabs_shared.ts"

export function isDescriptionTab() {
  return getCurrentTab() === "description"
}

/**
 * 容器 of 官方预设的描述模板
 * tab 内容未加载完成时, 返回 null
 */

export function getTabDescriptionContainerDiv() {
  return getTabContentDiv().querySelector<HTMLDivElement>(
    ":scope > div.container.tab-description",
  )
}

/**
 * getModDescriptionContainerDiv() 为 null 时, 返回 null
 * @returns
 */
export function getAboutThisModH2() {
  return document.getElementById("description_tab_h2") as HTMLHeadingElement | null
}

export function getModHistoryDiv() {
  const tabDescriptionContainerDiv = getTabDescriptionContainerDiv()
  return tabDescriptionContainerDiv
    ? tabDescriptionContainerDiv.querySelector<HTMLDivElement>(":scope > div.modhistory")
    : null
}

/**
 * `briefOverview` cache
 */
export function getBriefOverview(): string | null {
  const tabDescriptionContainerDiv = getTabDescriptionContainerDiv()
  if (!tabDescriptionContainerDiv) return null
  const briefOverviewP = tabDescriptionContainerDiv.querySelector<HTMLParagraphElement>(":scope > p:nth-of-type(1)")!
  // 需要 trim(), 右边多了 1 个空格, 可能包含换行
  return briefOverviewP.innerText.trimEnd()
}

/**
 * Has Report Abuse button, etc.
 * @returns
 */
export function getActionsUl() {
  const tabDescriptionContainerDiv = getTabDescriptionContainerDiv()
  return tabDescriptionContainerDiv
    ? tabDescriptionContainerDiv.querySelector<HTMLUListElement>(":scope > ul.actions")
    : null
}

export function getShareButtonAnchor() {
  const tabDescriptionContainerDiv = getTabDescriptionContainerDiv()
  return tabDescriptionContainerDiv
    ? tabDescriptionContainerDiv.querySelector<HTMLAnchorElement>(":scope > a.button-share")
    : null
}

export function getDescriptionDl() {
  const tabDescriptionContainerDiv = getTabDescriptionContainerDiv()
  return tabDescriptionContainerDiv
    ? tabDescriptionContainerDiv.querySelector<HTMLDListElement>(":scope > div.accordionitems > dl.accordion")
    : null
}

export function getDescriptionDtDdMap() {
  const descriptionDl = getDescriptionDl()
  if (!descriptionDl) return null
  const descriptionDtDdMap = new Map<HTMLElement, HTMLElement>()
  const children = descriptionDl.children
  for (let i = 0; i < children.length; i = i + 2) {
    descriptionDtDdMap.set(children[i] as HTMLElement, children[i + 1] as HTMLElement)
  }
  return descriptionDtDdMap
}

export function getModsRequiringThisDiv(): HTMLDivElement | null {
  const descriptionDtDdMap = getDescriptionDtDdMap()
  if (!descriptionDtDdMap) return null
  for (const [dt, dd] of descriptionDtDdMap) {
    if (dt.innerText.trim().startsWith("Requirements")) {
      // divs.length 的值不一定. 有 Requirements, Mods requiring this, Nexus Requirements 等等
      const tabbedBlockDivs = dd.querySelectorAll<HTMLDivElement>(":scope > div.tabbed-block")
      for (const tabbedBlockDiv of tabbedBlockDivs) {
        const text = tabbedBlockDiv.querySelector<HTMLHeadingElement>(":scope > h3:nth-of-type(1)")!.innerText
        if (text === "Mods requiring this file") {
          return tabbedBlockDiv
        }
      }
    }
  }
  return null
}

interface PermissionDescriptionComponent {
  titleDt: HTMLElement
  descriptionDd: HTMLElement
  permissionDiv: HTMLDivElement | null
  authorNotesDiv: HTMLDivElement | null
  authorNotesContentP: HTMLParagraphElement | null
  fileCreditsDiv: HTMLDivElement | null
  fileCreditsContentP: HTMLParagraphElement | null
  donationDiv: HTMLDivElement | null
}
export function getPermissionDescriptionComponent(): PermissionDescriptionComponent | null {
  const descriptionDtDdMap = getDescriptionDtDdMap()
  if (!descriptionDtDdMap) return null
  for (const [dt, dd] of descriptionDtDdMap) {
    if (dt.innerText.trim().startsWith("Permissions and credits")) {
      const tabbedBlockDivs = dd.querySelectorAll<HTMLDivElement>(":scope > div.tabbed-block")
      let permissionDiv = null,
        authorNotesDiv = null,
        authorNotesContentP = null,
        fileCreditsDiv = null,
        fileCreditsContentP = null,
        donationDiv = null
      for (const tabbedBlockDiv of tabbedBlockDivs) {
        const partTitle = (tabbedBlockDiv.querySelector(":scope > h3") as HTMLHeadingElement).innerText
        switch (partTitle) {
          case "Credits and distribution permission": {
            permissionDiv = tabbedBlockDiv
            break
          }
          case "Author notes": {
            authorNotesDiv = tabbedBlockDiv
            authorNotesContentP = authorNotesDiv.querySelector<HTMLParagraphElement>(":scope > p")
            break
          }
          case "File credits": {
            fileCreditsDiv = tabbedBlockDiv
            fileCreditsContentP = fileCreditsDiv.querySelector<HTMLParagraphElement>(":scope > p")
            break
          }
          case "Donation Points system": {
            donationDiv = tabbedBlockDiv
            break
          }
        }
      }
      return {
        titleDt: dt,
        descriptionDd: dd,
        permissionDiv,
        authorNotesDiv,
        authorNotesContentP,
        fileCreditsDiv,
        fileCreditsContentP,
        donationDiv,
      }
    }
  }
  return null
}

/**
 * 容器 of 作者自定义的描述
 * tab 内容未加载完成时, 返回 null
 */
export function getModDescriptionContainerDiv() {
  return getTabContentDiv().querySelector<HTMLDivElement>(
    ":scope > div.container.mod_description_container",
  )
}
