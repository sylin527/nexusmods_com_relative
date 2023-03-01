import { getArchivedFilesContainerDiv } from "./archived_files_tab.ts"
import { getCurrentTab, getTabContentDiv } from "./tabs_shared.ts"

/**
 * https://www.nexusmods.com/skyrimspecialedition/mods/14449?tab=files
 * https://www.nexusmods.com/skyrimspecialedition/mods/14449/?tab=files 可能是历史原因, 导致多了一个 '/'
 * 可能是历史原因, 甚至有时候切换 tab 时, url 不变...
 */

/**
 * 暂且这样判断吧
 * @returns
 */
export function isFilesTab() {
  return getCurrentTab() === "files" && getModFilesDiv() !== null && getArchivedFilesContainerDiv() === null
}

/**
 * `div#mod_files`
 */
export function getModFilesDiv(): HTMLDivElement | null {
  return document.getElementById("mod_files") as HTMLDivElement | null
}

// /**
//  * tab content 被刷新后, 要刷新元素
//  */
// export function clearElementCache() {
//   // 似乎 nexusmods.com 的开发人员设计是, 点击 tab 时,
//   // 先隐藏原来的 tab 内容 (如 `div#mod_files`), 等待获取内容完毕后, 再更新内容.
//   // DOM 释放资源要 remove()
//   // _modFilesDiv?.remove()
//   // _modFilesDiv = null
// }

/**
 * 获取 `div.premium-banner.container`
 */
export function getPremiumBannerDiv(): HTMLDivElement | null {
  const tabContentDiv = getTabContentDiv()
  return tabContentDiv.querySelector<HTMLDivElement>("div.premium-banner.container")
}

export function getAllSortByDivs() {
  const modFilesDiv = getModFilesDiv()
  return modFilesDiv
    ? modFilesDiv.querySelectorAll<HTMLDivElement>("div.file-category-header > div:nth-of-type(1)")
    : null
}

export function getAllFileDls() {
  const modFilesDiv = getModFilesDiv()
  return modFilesDiv
    ? modFilesDiv.querySelectorAll<HTMLElement>(":scope > div.files-tabs > div.accordionitems > dl.accordion")
    : null
}

export function getAllFileDtAndDdMap() {
  const fileDls = getAllFileDls()
  if (!fileDls) return null
  const map = new Map<HTMLElement, HTMLElement>()
  for (const fileDl of fileDls) {
    const children = fileDl.children
    for (let i = 0; i < children.length; i = i + 2) {
      map.set(children[i] as HTMLElement, children[i + 1] as HTMLElement)
    }
  }
  return map
}

export function getAllFileHeaderDts() {
  const modFilesDiv = getModFilesDiv()
  return modFilesDiv ? modFilesDiv.querySelectorAll<HTMLElement>("dl.accordion > dt") : null
}

/**
 * 修改下载图标和下载时间
 * @param fileHeaderDt
 * @param dateDownloadedText
 */
export function setDownloadedRecord(fileHeaderDt: HTMLElement, dateDownloadedText: string) {
  const fileHeaderDiv = fileHeaderDt.querySelector<HTMLDivElement>(":scope > div")!

  const downloadedIconI = fileHeaderDiv.querySelector<HTMLElement>(":scope > i.material-icons")
  const downloadStatsContainerDiv = fileHeaderDiv.querySelector<HTMLDivElement>(":scope > div.file-download-stats")!
  const downloadStatsUl = downloadStatsContainerDiv.querySelector<HTMLUListElement>(":scope > ul.stats")!
  const dateDownloadedLi = downloadStatsUl.querySelector<HTMLLIElement>(":scope > li.stat-downloaded")
  const dateUploadedLi = downloadStatsUl.querySelector<HTMLLIElement>(":scope > li.stat-uploaddate")!

  if (downloadedIconI) {
    downloadedIconI.setAttribute("title", `You downloaded this mod file on ${dateDownloadedText}`)
  } else {
    const newI = document.createElement("i")
    newI.className = "material-icons"
    newI.setAttribute("style", "margin-top: 3px")
    newI.setAttribute("title", `You downloaded this mod file on ${dateDownloadedText}`)
    newI.innerText = "cloud_download"
    fileHeaderDiv.insertBefore(newI, downloadStatsContainerDiv)
  }

  if (dateDownloadedLi) {
    const statDiv = dateUploadedLi.querySelector<HTMLDivElement>(":scope > div.statitem > div.stat")!
    statDiv.innerText = dateDownloadedText
  } else {
    const newLi = document.createElement("li")
    newLi.className = "stat-downloaded"
    newLi.innerHTML = `
<div class="statitem">
  <div class="titlestat">Downloaded</div>
  <div class="stat">${dateDownloadedText}</div>
</div>
`
    downloadStatsUl.insertBefore(newLi, dateUploadedLi)
  }
}
// interface FileHeaderComponent {
//   fileId: number
//   /**
//    * 显示的 name, 不是实际的文件名
//    */
//   name: string
//   /**
//    * 这里转为标准的 ms
//    */
//   date: number
//   size: number
//   version: string
//   // safeInfoContainerDiv: HTMLDivElement
//   // nameParagraph: HTMLParagraphElement
//   /**
//    * 未下载时没有
//    */
//   // downloadedIconI: HTMLElement | null
//  // downloadStatsContainerDiv: HTMLDivElement
//   // downloadStatsUl: HTMLUListElement
//   /**
//    * 未下载时没有
//    */
//   // dateDownloadedLi: HTMLLIElement | null
//   // dateUploadedLi: HTMLLIElement
// }

// export function getFileHeaderComponent(fileHeaderDt: HTMLElement): FileHeaderComponent {
//   return {
//     get fileId() {
//       return parseInt(fileHeaderDt.getAttribute("data-id")!)
//     },
//     get name() {
//       return fileHeaderDt.getAttribute("data-name")!
//     },
//     get date() {
//       return parseInt(fileHeaderDt.getAttribute("data-date")! + "000")
//     },
//     get size() {
//       return parseInt(fileHeaderDt.getAttribute("data-size")!)
//     },
//     get version() {
//       return fileHeaderDt.getAttribute("data-version")!
//     }
// }

export function getAllFileDescriptionDds() {
  const modFilesDiv = getModFilesDiv()
  return modFilesDiv ? modFilesDiv.querySelectorAll<HTMLElement>("dl.accordion > dd") : null
}

export function getDownloadButtonContainerDiv(fileDescriptionDd: HTMLElement) {
  return fileDescriptionDd.querySelector<HTMLDivElement>("div.tabbed-block:nth-of-type(2)")!
}

export function getDownloadButtonsUl(fileDescriptionDd: HTMLElement) {
  return getDownloadButtonContainerDiv(fileDescriptionDd).querySelector<HTMLUListElement>("ul.accordion-downloads")!
}

/**
 * @param headerDtOrDescriptionDd header `<dt>` 或 description `<dd>` 都有属性 `data-id`
 * @returns
 */
export function getFileId(headerDtOrDescriptionDd: HTMLElement) {
  return parseInt(headerDtOrDescriptionDd.getAttribute("data-id")!)
}

export function getFileDescriptionDiv(fileDescriptionDd: HTMLElement) {
  return fileDescriptionDd.querySelector<HTMLDivElement>("div.files-description")!
}

interface FileDescriptionComponent {
  fileId: number
  /**
   * 没有写文件描述时, 是否有 `fileDescriptionDiv` 呢?
   * 此时, 好像 `innerText === ''`
   */
  fileDescriptionDiv: HTMLDivElement
  downloadButtonContainerDiv: HTMLDivElement

  previewFileDiv: HTMLDivElement
  realFilename: string
}

export function getFileDescriptionComponent(fileDescriptionDd: HTMLElement): FileDescriptionComponent {
  const fileId = getFileId(fileDescriptionDd)
  const fileDescriptionDiv = getFileDescriptionDiv(fileDescriptionDd)
  const downloadButtonContainerDiv = getDownloadButtonContainerDiv(fileDescriptionDd)
  const previewFileDiv = fileDescriptionDd.querySelector<HTMLDivElement>("div.tabbed-block:last-child")!
  const realFilename = previewFileDiv.querySelector("a")!.getAttribute("data-url")!
  downloadButtonContainerDiv.querySelector("ul > li:last-child > a") as HTMLAnchorElement
  return {
    fileId,
    fileDescriptionDiv,
    downloadButtonContainerDiv,
    previewFileDiv,
    realFilename,
  }
}

interface OldFilesComponent {
  element: HTMLDivElement
  categoryHeaderDiv: HTMLDivElement
  headerH2: HTMLHeadingElement
  sortByContainerDiv: HTMLDivElement
}

export function getOldFilesComponent(): OldFilesComponent | null {
  const element = document.getElementById("file-container-old-files") as HTMLDivElement | null
  if (!element) return null
  const categoryHeaderDiv = element.querySelector(":scope > div.file-category-header") as HTMLDivElement

  return {
    element,
    categoryHeaderDiv,
    get headerH2() {
      return categoryHeaderDiv.querySelector(":scope > h2:first-child") as HTMLHeadingElement
    },
    get sortByContainerDiv() {
      return categoryHeaderDiv.querySelector(":scope > div:last-child") as HTMLDivElement
    },
  }
}

export function getFileArchiveSection() {
  return document.getElementById("files-tab-footer") as HTMLElement | null
}
