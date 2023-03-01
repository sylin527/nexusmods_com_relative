import { getModFilesDiv } from "./files_tab.ts"
import { getCurrentTab, getTabContentDiv, isModUrl } from "./tabs_shared.ts"

export function isFileUrl(url: string): boolean {
  const searchParams = new URL(url).searchParams
  return isModUrl(url) && searchParams.get("tab") === "files" && searchParams.has("file_id")
}

function getPageLayoutDiv(): HTMLDivElement | null {
  return getTabContentDiv().querySelector<HTMLDivElement>(":scope > div.container > div.page-layout")
}

function getFileHeaderDiv(): HTMLDivElement | null {
  const pageLayoutDiv = getPageLayoutDiv()
  return pageLayoutDiv ? pageLayoutDiv.querySelector<HTMLDivElement>(":scope > div.header") : null
}

/**
 * 当点了 files tab, 且 tab content loaded 之后, 再执行此函数判断
 * 目前遇到的情况都是打开 file url 时, 才会进入 file tab
 */
export function isFileTab() {
  return getCurrentTab() === "files" && getModFilesDiv() === null && getFileHeaderDiv() !== null
}

export function getFileIdFromUrl(url: string): number | null {
  const fileId = new URL(url).searchParams.get("file_id")
  return fileId ? parseInt(fileId) : null
}

export function getDownloadButtonsTr(): HTMLTableRowElement | null {
  const pageLayoutDiv = getPageLayoutDiv()
  return pageLayoutDiv
    ? pageLayoutDiv.querySelector<HTMLTableRowElement>(":scope > div.table > table > tfoot > tr")
    : null
}
