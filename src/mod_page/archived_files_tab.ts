import { getModFilesDiv } from "./files_tab.ts"
import { getCurrentTab, isModUrl } from "./tabs_shared.ts"

/**
 * eg. `https://www.nexusmods.com/skyrimspecialedition/mods/2182/?tab=files&category=archived`
 */
export function isArchivedFilesUrl(url: string) {
  const searchParams = new URL(url).searchParams
  return isModUrl(url) && searchParams.get("tab") === "files" && searchParams.get("category") === "archived"
}

export function getArchivedFilesContainerDiv() {
  return document.getElementById("file-container-archived-files") as HTMLDivElement | null
}

/**
 * 暂且这样判断吧
 * @returns
 */
export function isArchivedFilesTab() {
  return getCurrentTab() === "files" && getModFilesDiv() !== null && getArchivedFilesContainerDiv() !== null
}
