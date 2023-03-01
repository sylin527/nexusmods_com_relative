import { generateDownloadUrl } from "../api/download_api.ts"
import { getDownloadButtonsTr, getFileIdFromUrl, isFileTab, isFileUrl } from "./file_tab.ts"
import { clickTabLi, getCurrentTab, getGameId, getModName, getModVersionWithDate } from "./tabs_shared.ts"
import { overPrimaryComponent, primaryColor, titleElement } from "../ui.ts"
import { isSylin527 } from "../shared.ts"
import { clickedTabContentLoaded } from "./tabs_shared_actions.ts"

/**
 * append 到 `downloadButtonsTr.cells[0]`
 * @returns
 */
function createDownloadNoWaitComponent() {
  const newAnchor = document.createElement("a")
  newAnchor.innerText = "Download No Wait"
  newAnchor.className = "rj-btn rj-btn-standard rj-btn-full"
  newAnchor.href = "#"
  newAnchor.style.textTransform = "none"
  newAnchor.style.border = "none"
  newAnchor.style.backgroundColor = primaryColor
  overPrimaryComponent(newAnchor)

  newAnchor.addEventListener("click", async (event) => {
    event.preventDefault()
    const fileId = getFileIdFromUrl(location.href)!
    const gameId = getGameId()
    let latestDownloadUrl
    // 若使用者为 sylin527, 缓存下载链接 1 小时.
    if (isSylin527()) {
      const latestDownloadUrlAttr = "latest-download-url"
      const dateLastDownloadedAttr = "date-last-downloaded"
      latestDownloadUrl = newAnchor.getAttribute(latestDownloadUrlAttr)
      const dateLastDownloaded = newAnchor.getAttribute(dateLastDownloadedAttr)
      // 没有下载过, 或者下载过, 但下载链接超过 1 小时了, 都要重新获取下载链接
      if (!latestDownloadUrl || (dateLastDownloaded && Date.now() - parseInt(dateLastDownloaded) > 60 * 60 * 1000)) {
        latestDownloadUrl = await generateDownloadUrl(gameId, fileId)
        newAnchor.setAttribute(latestDownloadUrlAttr, latestDownloadUrl)
        newAnchor.setAttribute(dateLastDownloadedAttr, Date.now().toString())
      }
    } else {
      latestDownloadUrl = await generateDownloadUrl(gameId, fileId)
    }
    window.open(latestDownloadUrl, "_self")
  })
  return newAnchor
}

export function insertDownloadNoWaitComponent() {
  function _inner() {
    const downloadButtonsTr = getDownloadButtonsTr()
    if (!downloadButtonsTr) return
    const firstCell = downloadButtonsTr.cells[0]
    if (firstCell.children.length > 0) return
    const newAnchor = createDownloadNoWaitComponent()
    firstCell.appendChild(newAnchor)
  }
  getCurrentTab() === "files" && isFileTab() && _inner()

  clickTabLi(async (clickedTab) => {
    clickedTab === "files" && (await clickedTabContentLoaded()) === 0 && isFileTab() && _inner()
  })
}

export function tweakTitleIfFileTab() {
  isFileUrl(location.href) &&
    (titleElement.innerText = `${getModName()} ${getModVersionWithDate()} file=${getFileIdFromUrl(location.href)}`)
}
