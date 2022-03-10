
/**
 * 不描述 description, files, images 等 tab 的信息.
 * 仅描述 game name, mod name, version, gallery 等等.
 */

/**
 * <meta property="og:site_name" content="Nexus Mods :: Skyrim Special Edition">
 */
 export const gameNameSelector = 'head>meta[property="og:site_name"]'
 /**
  * 如 <meta property="og:title" content="Aspens Ablaze">
  * Aspens Ablaze 是 mod 名
  */
 export const modNameSelector = 'head>meta[property="og:title"]'
 
 export const headerSelector = 'header#head'
 
 export const mainContentSelector = 'div#mainContent'
 
 /**
  * base info + description tab
  *
  * Contains game id and mod id.
  * <section id="section" class="modpage" data-game-id="1704" data-mod-id="1089"> ...
  */
 export const modInfoContainerSelector = 'section#section'
 
 export const galleryContainerSelector = 'div#sidebargallery'
 
 /**
  * relative to galleryContainerSelector
  */
 export const galleryRelativeSelector = 'ul.thumbgallery.gallery.clearfix'
 
 export const modVersionSelector =
   'div#pagetitle>ul.stats.clearfix>li.stat-version>div.statitem>div.stat'
 
 /*
 <ul class="modactions">
 <!-- Add media, Tracking, ... -->
 </ul>
 */
 export const modActionsSelector = 'div#pagetitle>ul.modactions'
 
 /*
 共用部分, 下方的 tab 导航
 <ul class="modtabs">
   <li<span>Description</span></li>
   <li<span>Files</span></li>
   <li<span>Images</span></li>
   <li<span>Videos</span></li>
   <li<span>Posts</span></li>
   <li<span>Bugs</span></li>
   <li<span>Logs</span></li>
   <li<span>Stats</span></li>
 </ul>
 */
 export const modtabsSelector = '#section div.tabs ul.modtabs'
 
 /**
  * 位于 #mainContent 内部
  */
 export const backToTopSelector = 'div#rj-back-to-top'
 
 export const footerSelector = 'footer#rj-footer'
 
 export const modPageUrlRegexp = /((https|http):\/\/)((www.)?nexusmods.com)\/\w+\/mods\/([0-9]+(\/)?(\?)?(tab=description)?)$/

const modInfoContainer = document.querySelector<HTMLElement>(
  modInfoContainerSelector
)

export function getModName(): string {
  return document
    .querySelector<HTMLMetaElement>(modNameSelector)!
    .getAttribute('content')!
}

/**
 *
 * Mod version can be empty string???
 */
export function getModVersion(): string {
  return document
    .querySelector<HTMLDivElement>(modVersionSelector)!
    .innerText
}

/**
 * Clean global background.
 * 覆盖 '::before' 的 background image 至, 无法减小 SingFileZ 保存文件的大小, 不建议使用
 */
export function clearBodyBackground(): void {
  const bodyElement = document.querySelector('body')
  if (null !== bodyElement) {
    // 仅可读
    const beforePseudoElement = window.getComputedStyle(bodyElement, '::before')
  }

  const newStyle = document.createElement('style')
  // 通常 document.styleSheets 的元素不止一个, 所以还是 新建一个 style 元素.
  document.head.appendChild(newStyle)
  const sheet = newStyle.sheet
  // 仅仅是覆盖, 不是删除原 background-image
  // SingleFileZ 依然会把 'body::before { background-image: none}' 覆盖的 原 background-image 图片保存, 导致体积不减小.
  sheet?.insertRule('body::before { background-image: none;}', 0)

  // 浏览器开发工具 Inspector 里 找不到 body::before, SingleFileZ 保存后, 文件体积仍未减小.
  sheet?.insertRule(`body::before { content: none; display: none;}`, 0)
}

/**
 * 如果有 div#feature, 清除其 style 属性, 更改其 id 为 nofeature 以使用 nofeature 样式.
 *
 * 对比 div#feature, div#nofeature 样式为: 清除背景, 减小 height.
 */
export function removeFeature(): void {
  if (null === modInfoContainer) return
  const featureDiv = modInfoContainer.querySelector<HTMLDivElement>('#feature')
  featureDiv?.removeAttribute('style')
  featureDiv?.setAttribute('id', 'nofeature')
}

export function removeModActions() {
  document.querySelector(modActionsSelector)?.remove()
}

export function removeModGallery() {
  if (null === modInfoContainer) return
  modInfoContainer
    .querySelector<HTMLDivElement>(galleryContainerSelector)
    ?.remove()
}

export function setModInfoContainerAsTopElement() {
  if (null === modInfoContainer) return
  const body = document.querySelector('body')
  if (null !== body) {
    modInfoContainer.style.maxWidth = '1300px'
    modInfoContainer.style.margin = '0 auto'
    body.style.marginTop = '0'
    body.insertBefore(modInfoContainer, body.firstChild)
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

export function whenClickModTabs(handler: (event: MouseEvent) => unknown) {
  document
    .querySelector<HTMLUListElement>(modtabsSelector)
    ?.addEventListener('click', (event) => {
      handler(event)
    })
}

export function isModPage(url: string): boolean {
  return modPageUrlRegexp.test(url)
}
