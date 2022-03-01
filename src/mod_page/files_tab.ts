/// <reference lib="dom" />

import { FOOTER_SELECTOR, HEADER_SELECTOR, MAIN_CONTENT_SELECTOR } from "./tabs_shared_content.ts";

export const FILES_TAB_SELECTOR = 'div.tabcontent.tabcontent-mod-page'

export const PREMIUM_BANNER_SELECTOR = 'div.tabcontent div.premium-banner.container'

export const MOD_FILES_SELECTOR = 'div#mod_files'

export const SORT_BY_SELECTOR = `${MOD_FILES_SELECTOR} div.file-category-header>div:nth-of-type(1)`

/**
 * relative to MOD_FILES_SELECTOR
 */
export const SORT_BY_RELATIVE_SELECTOR = `div.file-category-header>div:nth-of-type(1)`

/**
 * relative to MOD_FILES_SELECTOR
 */
export const FILE_DT_RELATIVE_SELECTOR = 'dl.accordion>dt'

/**
 * relative to FILE_DT_RELATIVE_SELECTOR
 */
export const SECURITY_ICON_RELATIVE_SELECTOR = 'div>div.result.inline-flex'

/**
 * relative to FILE_DT_RELATIVE_SELECTOR
 *
 * 可能有, 可能没有
 */
export const DOWNLOADED_ICON_RELATIVE_SELECTOR = 'div>i.material-icons'

/**
 * relative to FILE_DT_RELATIVE_SELECTOR
 *
 * 可能有, 可能没有
 */
export const DATE_DOWNLOADED_RELATIVE_SELECTOR =
  'div>div.file-download-stats>ul>li.stat-downloaded'

/**
 * relative to FILE_DT_RELATIVE_SELECTOR
 */
export const TOGGLE_FILE_DD_RELATIVE_SELECTOR = 'div>div.acc-status'

/**
 * relative to MOD_FILES_SELECTOR
 */
export const FILE_DD_RELATIVE_SELECTOR = 'dl.accordion>dd'

/**
 * relative to FILE_DD_RELATIVE_SELECTOR
 * 如果没有任何文件描述, 就是这个空元素.
 */
export const FILE_DESCRIPTION_RELATIVE_SELECTOR =
  'div.tabbed-block:first-child'

/**
 * relative to FILE_DD_RELATIVE_SELECTOR
 */
export const DOWNLOAD_BUTTONS_CONTAINER_RELATIVE_SELECTOR = `div.tabbed-block:nth-of-type(2)`

/**
 * relative to FILE_DD_RELATIVE_SELECTOR
 */
export const PREVIEW_FILE_RELATIVE_SELECTOR = 'div.tabbed-block:last-child'

export const FILES_TAB_URL_REGEXP = /(?<schema>(https|http):\/\/)(?<domain>(www.)?nexusmods.com)\/\w+\/mods\/[0-9]+(\?tab=files)$/


const modFilesElem = document.querySelector<HTMLDivElement>(MOD_FILES_SELECTOR)

export const removePremiumBanner = function () {
  if (null == modFilesElem) return
  document.querySelector<HTMLDivElement>(
    PREMIUM_BANNER_SELECTOR
  )?.remove()
}

export const removeAllSortBys = function () {
  if (null == modFilesElem) return
  const arrayLike = modFilesElem.querySelectorAll<HTMLDivElement>(
    SORT_BY_RELATIVE_SELECTOR
  )
  for (let i = 0; i < arrayLike.length; i++) {
    arrayLike[i].remove()
  }
}

export const simplifyFileDts = function () {
  if (null == modFilesElem) return
  // <dt>
  const dts = modFilesElem.querySelectorAll<HTMLElement>(
    FILE_DT_RELATIVE_SELECTOR
  )
  for (let i = 0; i < dts.length; i++) {
    // 移除这个会影响感官
    // dts[i].querySelector(SECURITY_ICON_RELATIVE_SELECTOR)?.remove();
    dts[i].querySelector(DOWNLOADED_ICON_RELATIVE_SELECTOR)?.remove()
    dts[i].querySelector(DATE_DOWNLOADED_RELATIVE_SELECTOR)?.remove()
    dts[i].querySelector(TOGGLE_FILE_DD_RELATIVE_SELECTOR)?.remove()

    dts[i].style.background = '#2d2d2d'
  }
}

export const simplifyFileDds = function () {
  if (null == modFilesElem) return
  // <dd>
  const dds = modFilesElem.querySelectorAll<HTMLElement>(
    FILE_DD_RELATIVE_SELECTOR
  )

  for (let i = 0; i < dds.length; i++) {
    const previewFileElem = dds[i].querySelector<HTMLDivElement>(
      PREVIEW_FILE_RELATIVE_SELECTOR
    )
    const realFilename = previewFileElem
      ?.querySelector('a')
      ?.getAttribute('data-url')
    const fileDescElem = dds[i].querySelector<HTMLParagraphElement>(
      FILE_DESCRIPTION_RELATIVE_SELECTOR
    )
    const realFilenameP = document.createElement('p')
    // 两个 style 属性, 没必要
    // realFilenameP.setAttribute('class','sylin527-real-filename')
    if (typeof realFilename === 'string') {
      realFilenameP.innerText = realFilename
      realFilenameP.style.color = '#8197ec'
      realFilenameP.style.marginTop = '20px'
    }

    // append real filename to of file description.
    fileDescElem?.append(realFilenameP)

    /*
    [sylin527] 一定先用完在删除元素, 否则可能导致选择器不对.
    */
    // Remove all preview file buttons
    previewFileElem?.remove()

    // Remove all download buttons
    dds[i]
      .querySelector<HTMLParagraphElement>(
        DOWNLOAD_BUTTONS_CONTAINER_RELATIVE_SELECTOR
      )
      ?.remove()

    // Show all file descriptions
    dds[i].style.display = 'block'
  }
}

export const setFilesTabAsTopElement = function () {
  const filesTab = document.querySelector<HTMLDivElement>(FILES_TAB_SELECTOR)
  const body = document.querySelector('body')
  if (null !== filesTab && null !== body) {
    filesTab.style.maxWidth = '1300px'
    filesTab.style.margin = '0 auto'
    body.style.marginTop = '0'
    body.insertBefore(filesTab, body.firstChild)
    document.querySelector<HTMLHeadElement>(HEADER_SELECTOR)?.remove()
    document.querySelector<HTMLDivElement>(MAIN_CONTENT_SELECTOR)?.remove()
    document.querySelector(FOOTER_SELECTOR)?.remove()
    const scripts = document.querySelectorAll('script')
    for (let i = 0; i < scripts.length; i++) {
      scripts[i].remove()
    }
    const noscripts = document.querySelectorAll('noscript')
    for (let i = 0; i < noscripts.length; i++) {
      noscripts[i].remove()
    }
  }
}

export function isFilesTab(url: string): boolean {
  return FILES_TAB_URL_REGEXP.test(url)
}
