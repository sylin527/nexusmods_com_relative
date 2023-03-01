/**
 * 两种方案:
 *  1. 生成 markdown 文件. 描述不仅仅是纯文本, 较为复杂. 不推荐
 *  2. 原 tab=files 网页去掉不需要的内容. 推荐
 *
 * 暂时采用第二种.
 */

import { generateDownloadUrl } from "../api/download_api.ts"
import {
  getAllFileDescriptionDds,
  getAllFileDtAndDdMap,
  getAllFileHeaderDts,
  getAllSortByDivs,
  getDownloadButtonsUl,
  getFileArchiveSection,
  getFileDescriptionComponent,
  getFileId,
  getModFilesDiv,
  getOldFilesComponent,
  getPremiumBannerDiv,
  isFilesTab,
  setDownloadedRecord,
} from "./files_tab.ts"
import { clickTabLi, getCurrentTab, getGameDomainName, getGameId, getModId } from "./tabs_shared.ts"
import {
  containerManager,
  createActionComponent,
  headElement,
  highlightColor,
  highlightHoverColor,
  overPrimaryComponent,
  primaryColor,
  primaryHoverColor,
} from "../ui.ts"
import { toIsoLikeDateTimeString } from "../util.ts"
import {
  clickedTabContentLoaded,
  controlComponentDisplayAfterClickingTab,
  setTabsDivAsTopElement,
} from "./tabs_shared_actions.ts"
import { generateFileUrl } from "../api/mod_api.ts"
import { isSylin527 } from "../shared.ts"
import { simplifyDescriptionContent } from "../site_shared_actions.ts"

export function addShowRealFilenameToggle() {
  const modFilesDiv = getModFilesDiv()
  if (!modFilesDiv) return

  /*
    <input class="sylin527_show_toggle" type="checkbox" /><i class="sylin527_show_text"
      unchecked_text="Hide Real Filenames"
      checked_text="Show Real Filenames"
    ></i>
  */
  const input = document.createElement("input")
  input.className = "sylin527_show_toggle"
  input.setAttribute("type", "checkbox")
  input.checked = false
  const i = document.createElement("i")
  i.className = "sylin527_show_text"
  // input[type=checkbox] unchecked 时, 显示了所有的文件
  i.setAttribute("unchecked_text", "Hide Real Filenames")
  i.setAttribute("checked_text", "Show Real Filenames")

  modFilesDiv.insertBefore(i, modFilesDiv.firstChild)
  modFilesDiv.insertBefore(input, modFilesDiv.firstChild)
  const { styleSheets } = document
  const sheet = styleSheets[styleSheets.length - 1]
  let ruleIndex = sheet.insertRule(
    `
    input.sylin527_show_toggle,
    input.sylin527_show_toggle ~ i.sylin527_show_text,
    input.sylin527_show_toggle ~ i.sylin527_show_text::after {
      border: 0;
      cursor: pointer;
      box-sizing: border-box;
      display: block;
      height: 40px;
      width: 300px;
      z-index: 999;
      position: relative;
    }
    `,
  )
  // input[type=checkbox] 全透明, 但 z-index 最大
  sheet.insertRule(
    `
    input.sylin527_show_toggle {
      margin: 0 auto;
      z-index: 987654321;
      opacity: 0;
    }
    `,
    ++ruleIndex,
  )
  sheet.insertRule(
    `
  input.sylin527_show_toggle ~ i.sylin527_show_text {
    font-style: normal;
    font-size: 18px;
    text-align: center;
    line-height: 40px;
    border-radius: 5px;
    font-weight: 400;
    margin: -40px auto -60px auto;
  }
  `,
    ++ruleIndex,
  )
  // input[type=checkbox] unchecked 时, 显示了所有的文件
  sheet.insertRule(
    `
  input.sylin527_show_toggle ~ i.sylin527_show_text::after {
    background-color: ${primaryColor};
    content: attr(unchecked_text);
    border-radius: 3px;
  }
  `,
    ++ruleIndex,
  )
  // 因为 input[type=checkbox] 的 z-index 值最大, 所以 :hover 用在此 input 上
  sheet.insertRule(
    `
  input.sylin527_show_toggle:hover ~ i.sylin527_show_text::after {
    background-color: ${primaryHoverColor};
  }
  `,
    ++ruleIndex,
  )
  // input[type=checkbox] checked 时, 隐藏了所有的文件
  sheet.insertRule(
    `
  input.sylin527_show_toggle:checked ~ i.sylin527_show_text::after {
    background-color: ${highlightColor};
    content: attr(checked_text);
  }
  `,
    ++ruleIndex,
  )
  sheet.insertRule(
    `
  input.sylin527_show_toggle:hover:checked ~ i.sylin527_show_text::after {
    background-color: ${highlightHoverColor};
  }
  `,
    ++ruleIndex,
  )
  // 由于 SingFile 默认移除隐藏的内容, 必须先显示. 需要时在隐藏.
  sheet.insertRule(
    `
  input.sylin527_show_toggle:checked ~ div dd p.sylin527_real_filename {
    display: none;
  }
  `,
    ++ruleIndex,
  )
}

export function removePremiumBanner() {
  getPremiumBannerDiv()?.remove()
}

export function removeAllSortBys() {
  const divs = getAllSortByDivs()
  divs && Array.from(divs).forEach((sortByDiv) => sortByDiv.remove())
}

export function simplifyAllFileHeaders() {
  const fileHeaderDts = getAllFileHeaderDts()
  if (!fileHeaderDts) return
  for (const fileHeaderDt of fileHeaderDts) {
    // security 图标, 移除这个影响感官
    // fileHeaderDt.querySelector(" div > div.result.inline-flex")?.remove();

    // downloaded icon, 未下载时没有这个元素, 移除这个影响感官
    // fileHeaderDt.querySelector("div > i.material-icons")?.remove()

    // date downloaded, 未下载时没有这个元素, 移除这个影响感官
    // fileHeaderDt.querySelector("div > div.file-download-stats > ul > li.stat-downloaded")?.remove()

    // hide/show file description element, 移除这个影响感官
    // fileHeaderDt.querySelector("div > div.acc-status")?.remove()

    fileHeaderDt.style.background = "#2d2d2d"
  }
}

function getRealFilenameClassName() {
  return "sylin527_real_filename"
}

export function insertRealFilenamePStyle() {
  const newStyle = document.createElement("style")
  headElement.appendChild(newStyle)
  const sheet = newStyle.sheet
  // 由于 SingFileZ 默认移除隐藏的内容, 必须先显示. 需要时在隐藏.
  sheet?.insertRule(
    `
    p.${getRealFilenameClassName()} {
      color: #8197ec;
      margin-top: 20xp;
    }
    `,
    0,
  )
}

export function createRealFilenameP(realFilename: string, fileUrl: string) {
  const realFilenameP = document.createElement("p")
  realFilenameP.className = getRealFilenameClassName()
  const newFileUrlAnchor = document.createElement("a")
  newFileUrlAnchor.href = fileUrl
  newFileUrlAnchor.innerText = realFilename
  realFilenameP.appendChild(newFileUrlAnchor)
  return realFilenameP
}

/**
 * Simplify File Description
 */
export function simplifyAllFileDescriptions() {
  // <dd>
  const fileDescriptionDds = getAllFileDescriptionDds()
  if (!fileDescriptionDds) return
  insertRealFilenamePStyle()
  const gameDomainName = getGameDomainName()
  const modId = getModId()
  for (const fileDescriptionDd of fileDescriptionDds) {
    const { fileDescriptionDiv, downloadButtonContainerDiv, previewFileDiv, realFilename, fileId } =
      getFileDescriptionComponent(fileDescriptionDd)

    simplifyDescriptionContent(fileDescriptionDiv)
    downloadButtonContainerDiv.remove()

    // [sylin527]
    // 即便 mod 被 delete, 依然可以根据 file url (mod id 和 file id) 下载文件,
    // 这其实算是一个漏洞, 这导致有些不符合 nexusmods 协议的 mod 也可能被下载
    // 甚至有时候可以根据时间浏览器输入 url 请求暴力枚举 file id

    // append real filename to file description
    fileDescriptionDiv.append(createRealFilenameP(realFilename, generateFileUrl(gameDomainName, modId, fileId)))

    // Remove preview file button
    previewFileDiv.remove()

    // Show file description
    fileDescriptionDd.style.display = "block"
  }
  addShowRealFilenameToggle()
}

export function insertDownloadNoWaitComponent(
  fileHeaderDt: HTMLElement,
  fileDescriptionDd: HTMLElement,
): HTMLLIElement {
  const newLi = document.createElement("li")

  const newAnchor = document.createElement("a")
  newAnchor.className = "btn inline-flex"
  newAnchor.href = "#"
  newLi.appendChild(newAnchor)

  // [lyne408] 创建 SVGElement 用 createElementNS()
  const newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")

  newSvg.setAttribute("class", "icon icon-manual")
  newSvg.innerHTML = `<use xlink:href="https://www.nexusmods.com/assets/images/icons/icons.svg#icon-manual"></use>`
  newAnchor.appendChild(newSvg)

  const newSpan = document.createElement("span")
  newSpan.innerText = "Download No Wait"
  newSpan.className = "flex-label"
  // 关闭大小写转换
  newSpan.style.textTransform = "none"
  newAnchor.appendChild(newSpan)

  newAnchor.addEventListener("click", async (event) => {
    event.preventDefault()
    let latestDownloadUrl
    // 若使用者为 sylin527, 缓存下载链接 1 小时.
    if (isSylin527()) {
      const latestDownloadUrlAttr = "latest-download-url"
      const dateLastDownloadedAttr = "date-last-downloaded"
      latestDownloadUrl = fileDescriptionDd.getAttribute(latestDownloadUrlAttr)
      const dateLastDownloaded = fileDescriptionDd.getAttribute(dateLastDownloadedAttr)
      // 没有下载过, 或者下载过, 但下载链接超过 1 小时了, 都要重新获取下载链接
      if (!latestDownloadUrl || (dateLastDownloaded && Date.now() - parseInt(dateLastDownloaded) > 60 * 60 * 1000)) {
        latestDownloadUrl = await generateDownloadUrl(getGameId(), getFileId(fileDescriptionDd))
        fileDescriptionDd.setAttribute(latestDownloadUrlAttr, latestDownloadUrl)
        fileDescriptionDd.setAttribute(dateLastDownloadedAttr, Date.now().toString())
      }
    } else {
      latestDownloadUrl = await generateDownloadUrl(getGameId(), getFileId(fileDescriptionDd))
    }
    setDownloadedRecord(fileHeaderDt, toIsoLikeDateTimeString(new Date()))
    window.open(latestDownloadUrl, "_self")
  })

  getDownloadButtonsUl(fileDescriptionDd).appendChild(newLi)

  return newLi
}

/**
 * `insertDownloadNoWaitComponents` to files tab or archived files tab
 */
export function insertDownloadNoWaitComponents() {
  function _inner() {
    const modFilesDiv = getModFilesDiv()
    if (modFilesDiv) {
      const map = getAllFileDtAndDdMap()
      if (!map) return
      for (const [dt, dd] of map) {
        insertDownloadNoWaitComponent(dt, dd)
      }
    }
  }
  getCurrentTab() === "files" && isFilesTab() && _inner()
  clickTabLi(async (clickedTab) => {
    clickedTab === "files" && (await clickedTabContentLoaded()) === 0 && isFilesTab() && _inner()
  })
}

function insertRemoveOldFilesComponent() {
  const oldFilesComponent = getOldFilesComponent()
  if (!oldFilesComponent) return null
  const removeButton = document.createElement("button")
  removeButton.className = "btn inline-flex"
  removeButton.style.textTransform = "unset"
  removeButton.style.verticalAlign = "super"
  removeButton.style.borderRadius = '3px'
  removeButton.innerText = "Remove"
  overPrimaryComponent(removeButton)
  const { element, categoryHeaderDiv, sortByContainerDiv } = oldFilesComponent
  categoryHeaderDiv.insertBefore(removeButton, sortByContainerDiv)
  categoryHeaderDiv.insertBefore(document.createTextNode(" "), removeButton)
  removeButton.addEventListener("click", () => {
    element.remove()
  })
}

export function simplifyFilesTab() {
  removePremiumBanner()
  removeAllSortBys()
  simplifyAllFileHeaders()
  simplifyAllFileDescriptions()
  getFileArchiveSection()?.remove()
  containerManager.hideAll()
  setTabsDivAsTopElement()
}

export function createSimplifyFilesTabComponent() {
  const button = createActionComponent("Simplify Files Tab")
  button.addEventListener("click", () => {
    simplifyFilesTab()
  })

  isFilesTab() ? insertRemoveOldFilesComponent() : button.style.display = "none"
  controlComponentDisplayAfterClickingTab(
    button,
    async (clickedTab) => {
      const bFilesTab = clickedTab === "files" && (await clickedTabContentLoaded()) === 0 && isFilesTab()
      bFilesTab && insertRemoveOldFilesComponent()
      return bFilesTab
    },
  )
  return button
}
