import { generateFileUrl, getFiles } from "../api/mod_api.ts"
import { getArchivedFilesContainerDiv, isArchivedFilesTab, isArchivedFilesUrl } from "./archived_files_tab.ts"
import {
  getAllFileDescriptionDds,
  getAllFileDtAndDdMap,
  getDownloadButtonContainerDiv,
  getFileDescriptionDiv,
  getFileId,
} from "./files_tab.ts"
import {
  addShowRealFilenameToggle,
  createRealFilenameP,
  insertDownloadNoWaitComponent,
  insertRealFilenamePStyle,
  removeAllSortBys,
  removePremiumBanner,
  simplifyAllFileHeaders,
} from "./files_tab_actions.ts"

import {
  clickTabLi,
  getCurrentTab,
  getGameDomainName,
  getModId,
  getModName,
  getModVersionWithDate,
} from "./tabs_shared.ts"
import {
  clickedTabContentLoaded,
  controlComponentDisplayAfterClickingTab,
  setTabsDivAsTopElement,
} from "./tabs_shared_actions.ts"
import { containerManager, createActionComponent, titleElement } from "../ui.ts"
import { simplifyDescriptionContent } from "../site_shared_actions.ts"
import { getValue } from "../userscript_lib/mod.ts";


/**
 * 无默认值
 * @returns 
 */
export function getApiKey() {
  return getValue("apikey") as string | undefined
}

/**
 * If not configure `apikey` value, return null
 * @param gameDomainName
 * @param modId
 * @returns
 */
async function getArchivedFileIdRealFilenameMap(
  gameDomainName: string,
  modId: number,
): Promise<Map<number, string> | null> {
  const apiKey = getApiKey()
  if (!apiKey || apiKey === "") return null
  const resultJson = await getFiles(gameDomainName, modId, apiKey)
  const { files } = resultJson
  const map = new Map<number, string>()
  for (const { file_id, category_id, file_name } of files) {
    category_id === 7 && map.set(file_id, file_name)
  }
  return map
}

/**
 * Simplify File Description
 */
export async function simplifyAllFileDescriptions() {
  const fileDescriptionDds = getAllFileDescriptionDds()
  if (!fileDescriptionDds) return
  insertRealFilenamePStyle()
  const gameDomainName = getGameDomainName()
  const modId = getModId()
  const oldFileIdRealFilenameMap = await getArchivedFileIdRealFilenameMap(gameDomainName, modId)

  for (const fileDescriptionDd of fileDescriptionDds) {
    const fileDescriptionDiv = getFileDescriptionDiv(fileDescriptionDd)
    simplifyDescriptionContent(fileDescriptionDiv)
    getDownloadButtonContainerDiv(fileDescriptionDd).remove()
    const fileId = getFileId(fileDescriptionDd)
    // 没有配置 API key, 则 realFilename 为 "File Link"
    const realFilename = oldFileIdRealFilenameMap ? oldFileIdRealFilenameMap.get(fileId)! : "File Link"
    fileDescriptionDiv.append(createRealFilenameP(realFilename, generateFileUrl(gameDomainName, modId, fileId)))

    fileDescriptionDd.style.display = "block"
  }
  addShowRealFilenameToggle()
}

export function tweakTitleIfArchivedFilesTab() {
  isArchivedFilesUrl(location.href) &&
    (titleElement.innerText = `${getModName()} ${getModVersionWithDate()} tab=archived_files`)
}

export function createSimplifyArchivedFilesTabComponent() {
  const button = createActionComponent("Simplify Archived Files Tab")
  button.addEventListener("click", async () => {
    removePremiumBanner()
    removeAllSortBys()
    simplifyAllFileHeaders()
    await simplifyAllFileDescriptions()
    containerManager.hideAll()
    setTabsDivAsTopElement()
  })

  !isArchivedFilesTab() && (button.style.display = "none")
  controlComponentDisplayAfterClickingTab(
    button,
    async (clickedTab) => clickedTab === "files" && (await clickedTabContentLoaded()) === 0 && isArchivedFilesTab(),
  )
  return button
}

/**
 * 在 archived_files_tab 也适用
 * 这样 reexport `export { insertDownloadNoWaitComponents } from "./files_tab_actions.ts`,
 * Deno 智能 import 提示没有
 */

export function insertDownloadNoWaitComponents() {
  function _inner() {
    const archivedFilesContainerDiv = getArchivedFilesContainerDiv()
    if (archivedFilesContainerDiv) {
      const map = getAllFileDtAndDdMap()
      if (!map) return
      for (const [dt, dd] of map) {
        insertDownloadNoWaitComponent(dt, dd)
      }
    }
  }
  getCurrentTab() === "files" && isArchivedFilesTab() && _inner()
  clickTabLi(async (clickedTab) => {
    clickedTab === "files" && (await clickedTabContentLoaded()) === 0 && isArchivedFilesTab() && _inner()
  })
}
