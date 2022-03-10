/// <reference lib="dom" />

import { footerSelector, headerSelector, mainContentSelector } from './tabs_shared_content.ts'

/**
 * files tab root element selector
 */
export const filesTabSelector = 'div.tabcontent.tabcontent-mod-page'

export const premiumBannerSelector = `${filesTabSelector} div.premium-banner.container`

export const modFilesSelector = 'div#mod_files'

export const sortBySelector = `${modFilesSelector} div.file-category-header>div:nth-of-type(1)`

/**
 * relative to modFilesSelector
 */
export const sortByRelativeSelector = `div.file-category-header>div:nth-of-type(1)`

/* --------------------------------- File Info ---------------------------- */
/**
 * relative to modFilesSelector
 */
export const fileDtRelativeSelector = 'dl.accordion>dt'

/**
 * relative to fileDtRelativeSelector
 */
export const securityIconRelativeSelector = 'div>div.result.inline-flex'

/**
 * relative to fileDtRelativeSelector
 *
 * 可能没有
 */
export const downloadedIconRelativeSelector = 'div>i.material-icons'

/**
 * relative to fileDtRelativeSelector
 *
 * 可能没有
 */
export const dateDownloadedRelativeSelector = 'div>div.file-download-stats>ul>li.stat-downloaded'

/**
 * relative to fileDtRelativeSelector
 */
export const toggleFileDdRelativeSelector = 'div>div.acc-status'

/* ----------- File Description, Download Buttons, Preview File ----------------- */

/**
 * relative to modFilesSelector
 */
export const fileDdRelativeSelector = 'dl.accordion>dd'
/**
 * relative to fileDdRelativeSelector
 * 如果没有任何文件描述, 就是这个空元素.
 */
export const fileDescriptionRelativeSelector = 'div.tabbed-block:nth-of-type(1)'

/**
 * relative to fileDdRelativeSelector
 */
export const downloadButtonsContainerRelativeSelector = `div.tabbed-block:nth-of-type(2)`

/**
 * relative to fileDdRelativeSelector
 */
export const previewFileRelativeSelector = 'div.tabbed-block:last-child'

export const filesTabUrlRegexp = /((https|http):\/\/)((www.)?nexusmods.com)\/\w+\/mods\/[0-9]+(\?tab=files)$/

let modFilesElem: HTMLDivElement | null = null

const getmodFilesElement = function (): HTMLDivElement {
  if (null === modFilesElem) {
    modFilesElem = document.querySelector<HTMLDivElement>(modFilesSelector)!
  }
  return modFilesElem
}

export const removePremiumBanner = function () {
  document.querySelector<HTMLDivElement>(premiumBannerSelector)?.remove()
}

export const removeAllSortBys = function () {
  modFilesElem = getmodFilesElement()
  const arrayLike = modFilesElem.querySelectorAll<HTMLDivElement>(sortByRelativeSelector)
  for (let i = 0; i < arrayLike.length; i++) {
    arrayLike[i].remove()
  }
}

export const simplifyFileDts = function () {
  modFilesElem = getmodFilesElement()
  // <dt>
  const dts = modFilesElem.querySelectorAll<HTMLElement>(fileDtRelativeSelector)
  for (let i = 0; i < dts.length; i++) {
    // 移除这个影响感官
    // dts[i].querySelector(securityIconRelativeSelector)?.remove();
    dts[i].querySelector(downloadedIconRelativeSelector)?.remove()
    dts[i].querySelector(dateDownloadedRelativeSelector)?.remove()
    // 移除这个影响感官
    // dts[i].querySelector(toggleFileDdRelativeSelector)?.remove()

    dts[i].style.background = '#2d2d2d'
  }
}

const addShowRealFilenameToggle = function () {
  /*
    <input class="sylin527_show_toggle" type="checkbox" /><i class="sylin527_show_text"
      checked_text="Show Real Filenames"
      unchecked_text="Hide Real Filenames"></i>
  */
  const input = document.createElement('input')
  input.setAttribute('class', 'sylin527_show_toggle')
  input.setAttribute('type', 'checkbox')
  const i = document.createElement('i')
  i.setAttribute('class', 'sylin527_show_text')
  // unchecked 时显示, checked 之后隐藏
  i.setAttribute('checked_text', 'Show Real Filenames')

  i.setAttribute('unchecked_text', 'Hide Real Filenames')

  modFilesElem = getmodFilesElement()
  modFilesElem.insertBefore(i, modFilesElem.firstChild)
  modFilesElem.insertBefore(input, modFilesElem.firstChild)

  const newStyle = document.createElement('style')
  document.head.appendChild(newStyle)
  const sheet = newStyle.sheet!
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
    `
  )

  sheet.insertRule(
    `
    input.sylin527_show_toggle {
      margin: 0 auto;
      z-index: 987654321;
      opacity: 0;
    }
    `,
    ++ruleIndex
  )
  sheet.insertRule(
    `
    i.sylin527_show_text {
      font-style: normal;
      font-size: 18px;
      background-color: #8197ec;
      text-align: center;
      line-height: 40px;
      border-radius: 5px;
      font-weight: 400;
      margin: -40px auto -60px auto;
    }
    `,
    ++ruleIndex
  )
  sheet.insertRule(
    `
    input.sylin527_show_toggle ~ i.sylin527_show_text::after {
      content: attr(unchecked_text);
    }
    `,
    ++ruleIndex
  )
  sheet.insertRule(
    `
    input.sylin527_show_toggle:checked ~ i.sylin527_show_text::after {
      content: attr(checked_text);
    }
    `,
    ++ruleIndex
  )
  // 由于 SingFileZ 默认移除隐藏的内容, 必须先显示. 需要时在隐藏.
  sheet.insertRule(
    `
    input.sylin527_show_toggle:checked ~ div dd p.sylin527_real_filename {
      display: none;
    }
    `,
    ++ruleIndex
  )
}

export const simplifyFileDds = function () {
  modFilesElem = getmodFilesElement()
  // <dd>
  const dds = modFilesElem.querySelectorAll<HTMLElement>(fileDdRelativeSelector)

  const realClass = 'sylin527_real_filename'

  const newStyle = document.createElement('style')
  document.head.appendChild(newStyle)
  const sheet = newStyle.sheet
  // 由于 SingFileZ 默认移除隐藏的内容, 必须先显示. 需要时在隐藏.
  sheet?.insertRule(
    `
    p.${realClass} {
      color: #8197ec;
      margin-top: 20xp;
    }
    `,
    0
  )

  for (let i = 0; i < dds.length; i++) {
    const previewFileElem = dds[i].querySelector<HTMLDivElement>(previewFileRelativeSelector)
    const realFilename = previewFileElem?.querySelector('a')?.getAttribute('data-url')
    const fileDescElem = dds[i].querySelector<HTMLParagraphElement>(fileDescriptionRelativeSelector)
    const realFilenameP = document.createElement('p')
    // 两个 style 属性, 没必要
    // realFilenameP.setAttribute('class','sylin527-real-filename')
    if (typeof realFilename === 'string') {
      realFilenameP.setAttribute('class', realClass)
      realFilenameP.innerText = realFilename
    }

    // append real filename to of file description.
    fileDescElem?.append(realFilenameP)

    /*
    [sylin527] 一定先用完在删除元素, 否则可能导致选择器不对.
    */
    // Remove all preview file buttons
    previewFileElem?.remove()

    // Remove all download buttons
    dds[i].querySelector<HTMLDivElement>(downloadButtonsContainerRelativeSelector)?.remove()

    // Show all file descriptions
    dds[i].style.display = 'block'
  }
  addShowRealFilenameToggle()
}

export const setFilesTabAsTopElement = function () {
  const filesTab = document.querySelector<HTMLDivElement>(filesTabSelector)
  const body = document.querySelector('body')
  if (null !== filesTab && null !== body) {
    filesTab.style.maxWidth = '1300px'
    filesTab.style.margin = '0 auto'
    body.style.marginTop = '0'
    body.insertBefore(filesTab, body.firstChild)
    document.querySelector<HTMLHeadElement>(headerSelector)?.remove()
    document.querySelector<HTMLDivElement>(mainContentSelector)?.remove()
    document.querySelector(footerSelector)?.remove()
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
  return filesTabUrlRegexp.test(url)
}
