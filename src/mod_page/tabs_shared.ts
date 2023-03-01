/**
 * 不描述 description, files, images 等 tab 专有的信息.
 * 仅描述 tabs shared 的信息, 如 game name, mod name, version, gallery 等等.
 */

import { getSection } from "../site_shared.ts"
import { bodyElement, headElement } from "../ui.ts"

export function getModUrlRegExp() {
  return /^((https|http):\/\/(www.)?nexusmods.com\/[a-z0-9]+\/mods\/[0-9]+)/
}

export function isModUrl(url: string): boolean {
  return getModUrlRegExp().test(url)
}

let _gameId: number | null = null
export function getGameId() {
  _gameId ||= _gameId = parseInt(getSection().getAttribute("data-game-id")!)
  return _gameId
}

let _gameDomainName: string | null = null
export function getGameDomainName() {
  //  [ "", "skyrimspecialedition", "mods", "9005", "" ]
  _gameDomainName ||= _gameDomainName = new URL(location.href).pathname.split("/")[1]
  return _gameDomainName
}

let _modId: number | null = null
export function getModId() {
  _modId ||= _modId = parseInt(getSection().getAttribute("data-mod-id")!)
  return _modId
}

function getFeaturedBelowDiv() {
  return getSection().querySelector(":scope > div.wrap > div:nth-of-type(2).wrap") as HTMLDivElement
}

let _breadcrumbUl: HTMLUListElement | null = null
export function getBreadcrumbUl() {
  _breadcrumbUl ||= _breadcrumbUl = document.getElementById("breadcrumb") as HTMLUListElement
  return _breadcrumbUl
}

let _gameName: string | null = null

export function getGameName(): string {
  _gameName ||= (getBreadcrumbUl().querySelector(":scope > li:nth-of-type(2)") as HTMLLIElement).innerText
  return _gameName
}

/**
 * `div#pagetitle`
 */
let _pageTitleDiv: HTMLDivElement | null = null
export function getPageTitleDiv(): HTMLDivElement {
  _pageTitleDiv ||= _pageTitleDiv = document.getElementById("pagetitle") as HTMLDivElement
  return _pageTitleDiv
}

/**
 * `div#feature`
 *
 * 如果 modder 设定了 feature, 则有 `div#feature`,
 * 反之没有 `div#feature`, 有 `div#nofeature`
 */
let _featureDiv: HTMLDivElement | null = null
export function getFeatureDiv() {
  _featureDiv ||= _featureDiv = document.getElementById("feature") as HTMLDivElement | null
  return _featureDiv
}

export function getModStatsUl() {
  return getPageTitleDiv().querySelector(":scope > ul.stats") as HTMLUListElement
}

/**
 * `div#pagetitle>ul.modactions`
 */
let _modActionsUl: HTMLUListElement | null = null
export function getModActionsUl(): HTMLUListElement {
  _modActionsUl ||= _modActionsUl = getPageTitleDiv().querySelector(":scope > ul.modactions") as HTMLUListElement
  return _modActionsUl
}

interface ModActionsComponent {
  element: HTMLUListElement
  /**
   * 实测有些页面没有, 可能是作者不让 add media
   */
  addMediaLi: HTMLLIElement | null
  trackLi: HTMLLIElement
  untrackLi: HTMLLIElement
  // endorseLi: HTMLLIElement
  // voteLi: HTMLLIElement
  downloadLabelLi: HTMLLIElement
  /**
   * 实测有些页面没有
   */
  vortexLi: HTMLLIElement | null
  manualDownloadLi: HTMLLIElement
}

export function getModActionsComponent(): ModActionsComponent {
  const modActionsUl = getModActionsUl()
  return {
    element: modActionsUl,
    get addMediaLi() {
      return document.getElementById("action-media") as HTMLLIElement | null
    },
    get trackLi() {
      return modActionsUl.querySelector(":scope > li[id^=action-track]") as HTMLLIElement
    },
    get untrackLi() {
      return modActionsUl.querySelector(":scope > li[id^=action-untrack]") as HTMLLIElement
    },
    // get endorseLi() {
    //   return modActionsUl.querySelector(":scope > li.") as HTMLLIElement
    // },
    // get voteLi() {
    //   return modActionsUl.querySelector(":scope > li.") as HTMLLIElement
    // },
    get downloadLabelLi() {
      return modActionsUl.querySelector(":scope > li.dllabel") as HTMLLIElement
    },
    get vortexLi() {
      return document.getElementById("action-nmm") as HTMLLIElement | null
    },
    get manualDownloadLi() {
      return document.getElementById("action-manual") as HTMLLIElement
    },
  }
}

let _modName: string | null = null
export function getModName(): string {
  if (!_modName) {
    /**
     * 如 `<meta property="og:title" content="Aspens Ablaze">`
     * Aspens Ablaze 是 mod 名
     */
    const meta = headElement.querySelector<HTMLMetaElement>(`meta[property="og:title"]`)
    if (meta) {
      _modName = meta.getAttribute("content")!
    } else {
      _modName = (getBreadcrumbUl().querySelector(":scope > li:last-child") as HTMLLIElement).innerText
    }
  }
  return _modName
}

/**
 * `div#pagetitle > ul.stats.clearfix > li.stat-version > div.statitem > div.stat`
 */
let _modVersionDiv: HTMLDivElement | null = null
function getModVersionDiv(): HTMLDivElement {
  _modVersionDiv ||= _modVersionDiv = getModStatsUl().querySelector(
    ":scope > li.stat-version > div.statitem > div.stat",
  ) as HTMLDivElement
  return _modVersionDiv
}

/**
 * Mod version can be empty string???
 */
let _modVersion: string | null = null
export function getModVersion(): string {
  _modVersion ||= _modVersion = getModVersionDiv().innerText
  return _modVersion
}

export function getFileInfoDiv() {
  return document.getElementById("fileinfo") as HTMLDivElement
}

/**
 * `div#sidebargallery`
 * @returns
 */
export function getModGalleryDiv() {
  return document.getElementById("sidebargallery") as HTMLDivElement | null
}

export function getThumbnailGalleryUl() {
  const modGalleryDiv = getModGalleryDiv()
  return modGalleryDiv ? modGalleryDiv.querySelector(":scope > ul.thumbgallery") as HTMLUListElement : null
}

/**
 * Gallery Thumbnail `<li>`
 */
export interface ThumbnailComponent {
  element: HTMLLIElement
  originalImageSrc: string
  figure: HTMLElement
  anchor: HTMLAnchorElement
  img: HTMLImageElement
  title: string
  src: string
}

export function getThumbnailComponent(thumbnailLi: HTMLLIElement): ThumbnailComponent {
  return {
    element: thumbnailLi,
    get figure() {
      return thumbnailLi.querySelector(":scope > figure") as HTMLElement
    },
    get anchor() {
      return this.figure.querySelector(":scope > a") as HTMLAnchorElement
    },
    get img() {
      return this.anchor.querySelector(":scope > img") as HTMLImageElement
    },
    originalImageSrc: thumbnailLi.getAttribute("data-src")!,
    title: thumbnailLi.getAttribute("data-sub-html")!,
    src: thumbnailLi.getAttribute(" data-exthumbimage")!,
  }
}

interface ThumbnailGalleryComponent {
  element: HTMLDivElement
  fullscreenDiv: HTMLDivElement
  prevDiv: HTMLDivElement
  nextDiv: HTMLDivElement
  counterDiv: HTMLDivElement
  galleryUl: HTMLUListElement
  thumbnailComponents: ThumbnailComponent[]
}

let _modVersionWithDate: string | null = null
export function getModVersionWithDate(): string {
  if (!_modVersionWithDate) {
    const dateTimeElement = getFileInfoDiv().querySelector(
      ":scope > div.timestamp:nth-of-type(1) > time",
    ) as HTMLTimeElement
    const date = new Date(Date.parse(dateTimeElement.dateTime))
    _modVersionWithDate = `${getModVersion()}(${date.getFullYear().toString().substring(2)}.${
      date.getMonth() + 1
    }.${date.getDate()})`
  }
  return _modVersionWithDate
}

export function getTabsDiv() {
  return getFeaturedBelowDiv().querySelector(":scope > div:nth-of-type(2) > div.tabs") as HTMLDivElement
}

let _modTabsUl: HTMLUListElement | null = null
export function getModTabsUl(): HTMLUListElement {
  _modTabsUl ||= _modTabsUl = getTabsDiv().querySelector(":scope > ul.modtabs") as HTMLUListElement
  return _modTabsUl
}

export function getDescriptionTabAnchor() {
  return (document.getElementById("mod-page-tab-description") as HTMLLIElement).querySelector<HTMLAnchorElement>(
    ":scope > a",
  )!
}

/**
 * `div.tabcontent.tabcontent-mod-page`
 *
 * 设 `tabContentDiv` 为 `div.tabcontent.tabcontent-mod-page`
 * 切换 tab 时不会刷新 `tabContentDiv`,
 * 会修改 `tabContentDiv` 的 `innerHTML`
 */
let _tabContentDiv: HTMLDivElement | null = null
export function getTabContentDiv(): HTMLDivElement {
  return _tabContentDiv ||= _tabContentDiv = bodyElement.querySelector<HTMLDivElement>(
    "div.tabcontent.tabcontent-mod-page",
  ) as HTMLDivElement
}

/**
 * mod page 中表示 tab 的 `<span>` 的子字符串元素是首字母大写的
 * 但有 `text-transform: uppercase`, 所以 JavaScript 获取是全大写
 * 统一转为小写
 */
export type Tab = "description" | "files" | "images" | "videos" | "articles" | "forum" | "posts" | "bugs" | "logs"
export function getCurrentTab(): Tab {
  const modTabsUl = getModTabsUl()
  const tabSpan = modTabsUl.querySelector(":scope > li > a.selected > span.tab-label") as HTMLSpanElement
  return tabSpan.innerText.toLowerCase() as Tab
}

function getTabFromTabLi(tabLi: HTMLLIElement): Tab {
  const tabSpan = tabLi.querySelector(":scope > a[data-target] > span.tab-label") as HTMLSpanElement
  return tabSpan.innerText.toLowerCase() as Tab
}

export function clickTabLi(callback: (clickedTab: Tab, event: Event) => unknown) {
  const modTabsUl = getModTabsUl()
  const tabLis = modTabsUl.querySelectorAll<HTMLLIElement>(":scope > li[id^=mod-page-tab]")
  for (const tabLi of tabLis) {
    tabLi.addEventListener("click", (event) => {
      callback(getTabFromTabLi(tabLi), event)
    })
  }
}

/**
 * `div#rj-back-to-top`, 位于 #mainContent 内部
 */
export function getBackToTopDiv() {
  return document.getElementById("rj-back-to-top")
}
