import { MOD_PAGE_URL_REGEXP } from './tabs_shared_content.ts'

import { delay } from '../util.ts'

/*
<div class="tabcontent tabcontent-mod-page">
  <div class="container tab-description">
    <!-- 
    About this mod
    ...
    Requirements
    ...
    Donate
    -->
  </div>
  <div class="container mod_description_container condensed">
    <!-- Mod author 自己写的描述 -->
  </div>
</div>
*/
export const DESCRIPTION_TAB_ROOT_SELECTOR = 'div.tabcontent.tabcontent-mod-page'

export const TAB_DESCRIPTION_CONTAINER_SELECTOR = 'div.container.tab-description'

/**
 * relative to `div.container.tab-description`
 */
export const ABOUT_THIS_MOD_RELATIVE_SELECTOR = 'h2#description_tab_h2'

/**
 * relative to `div.container.tab-description`
 */
export const DOWNLOADED_OR_NOT_RELATIVE_SELECTOR = 'div.modhistory'

export const REPORT_ABUSE_RELATIVE_SELECTOR = 'ul.actions'

/**
 * It's `<a>`.
 * relative to `div.container.tab-description`
 */
export const SHARE_BUTTON_RELATIVE_SELECTOR = 'a.btn.inline-flex.button-share'

/**
 * It is a <p>.
 * Like `<p> simple description</p>`.
 *
 * relative to `div.container.tab-description`
 */
export const BRIEF_OVERVIEW_RELATIVE_SELECTOR = 'p:nth-of-type(1)'

/**
 * It is a <dl>.
 *
 * relative to `div.container.tab-description`
 */
export const ACCORDION_RELATIVE_SELECTOR = 'dl.accordion'

export const MOD_DESCRIPTION_CONTAINER_SELECTOR = 'div.container.mod_description_container'

/*
<div class="bbc_spoiler">
	<div>....</div>
	<div style="display: none;"></div>
</div>
*/
export const SPOILER_RELATIVE_SELECTOR = 'div.bbc_spoiler'

export const HAS_DESCRIPTION_TAB_URL_REGEXP = MOD_PAGE_URL_REGEXP

let tabDescContainer: HTMLDivElement

/*
 避免这种风险就是 while() 循环:
 如: 
 while (!tabDescContainer) {
    await delay(333)
    tabDescContainer = getTabDescContainer()
  }
 */
function getTabDescContainer() {
  return tabDescContainer
    ? tabDescContainer
    : document.querySelector<HTMLDivElement>(TAB_DESCRIPTION_CONTAINER_SELECTOR)!
}

export function hasDescriptionTab(url: string): boolean {
  return HAS_DESCRIPTION_TAB_URL_REGEXP.test(url)
}

export async function getBriefOverview(): Promise<string> {
  // 从 other tabs 切换到 description tab, 等待description tab 的内容装载完成
  while (!tabDescContainer) {
    await delay(333)
    tabDescContainer = getTabDescContainer()
  }
  const sde = tabDescContainer.querySelector<HTMLParagraphElement>(BRIEF_OVERVIEW_RELATIVE_SELECTOR)
  // 需要 trim(), 右边多了 1 个空格
  return sde!.innerText.trimEnd()
}

/* remove mods requiring this mod */
function removeModsRequiringThis(accordion: HTMLDListElement) {
  // 如果有 Requirements, 则第一个 `<dt>` 就是
  const firstDt = accordion.querySelector<HTMLElement>('dt:nth-of-type(1)')
  const hasRequirementsDt = firstDt?.innerText.trim().startsWith('Requirements')
  if (hasRequirementsDt) {
    // divs.length 的值不一定. 有 Requirements, Mods requiring this, Nexus Requirements 等等
    const divs = accordion.querySelectorAll('dd:nth-of-type(1)>div.tabbed-block')
    if (divs)
      for (let i = 0; i < divs.length; i++) {
        const text = divs[i].querySelector<HTMLHeadingElement>('h3:nth-of-type(1)')!.innerText
        if (text === 'Mods requiring this file') divs[i].remove()
      }
  }
}

/* show all accordion <dd> */
function showAllAccordionDds(accordion: HTMLDListElement) {
  // <dt> 是标题
  const dts = accordion.querySelectorAll<HTMLElement>('dt')
  if (dts.length === 0) return
  // <dd> 是内容
  const dds = accordion.querySelectorAll<HTMLElement>('dd')

  /* __start__ 以 CSS 代码模拟 show/hide Requirements, Changelogs 等等 */
  const newStyle = document.createElement('style')
  document.head.appendChild(newStyle)
  const sheet = newStyle.sheet
  /*
  设 `top: 56px` 是因 Mod page 的 `<header>` 的 `height: 56px`
  设 `background: transparent;` 以避免突兀
  设 `margin: -44.5px 0 1px 0;` 是因原 DOM Tree 的 <dt> 的 下间距为 1px, 盒模型高度为 43.5px.
  */
  sheet?.insertRule(`
input.sylin527_show_toggle {
  cursor: pointer;
  display: block;
  height: 43.5px;
  margin: -44.5px 0 1px 0; 
  width: 100%;
  z-index: 999;
  position: relative;
  opacity: 0;
}
  `)
  // SingFileZ 保存时, <dd> 已经显示 (display: block;) 了
  // 所以点击 input[type="checkbox"] 时应隐藏 <dd>
  sheet?.insertRule(`
input.sylin527_show_toggle:checked ~ dd{
  display: none;
}
  `)
  for (let i = 0; i < dts.length; i++) {
    dts[i].style.background = '#2d2d2d'
    // 移除右边的小箭头. 保留一下, 观感好些
    // dts[i].querySelector('span.acc-status')?.remove()

    /*
    // 调整右边的箭头, 使其朝上.
    const originalClass = dds[i].getAttribute('class')
    dds[i].setAttribute('class', originalClass + ' accopen')
    */

    dds[i].style.display = 'block'
    dds[i].removeAttribute('style')

    // new parent element which not effect cuurent UI views
    const newPar = document.createElement('div')
    // HTML: <input class="sylin527_show_toggle" type="checkbox"/>
    const toggle = document.createElement('input')
    toggle.setAttribute('class', 'sylin527_show_toggle')
    toggle.setAttribute('type', 'checkbox')
    dds[i].parentElement!.insertBefore(toggle, dds[i])
    // Node.append() 相当于移动当前元素至某个元素内, 作为其子元素
    newPar.append(dts[i], toggle, dds[i])
    accordion.append(newPar)
  }
  /* __end__ 以 CSS 代码模拟 show/hide Requirements, Changelogs 等等 */
}

export function simplifyTabDescription() {
  tabDescContainer = getTabDescContainer()
  const tdc = tabDescContainer
  tdc.querySelector(ABOUT_THIS_MOD_RELATIVE_SELECTOR)?.remove()
  tdc.querySelector(DOWNLOADED_OR_NOT_RELATIVE_SELECTOR)?.remove()
  tdc.querySelector(REPORT_ABUSE_RELATIVE_SELECTOR)?.remove()
  tdc.querySelector(SHARE_BUTTON_RELATIVE_SELECTOR)?.remove()

  const accordion = tdc.querySelector<HTMLDListElement>(ACCORDION_RELATIVE_SELECTOR)

  if (accordion) {
    removeModsRequiringThis(accordion)
    showAllAccordionDds(accordion)
  }
}

let modDescContainer: HTMLDivElement

function getModDescContainer() {
  return modDescContainer
    ? modDescContainer
    : document.querySelector<HTMLDivElement>(MOD_DESCRIPTION_CONTAINER_SELECTOR)!
}

/*
 * 显示
 *	<div class="bbc_spoiler">
 *		<div>....</div>
 *		<div style="display: none;"></div>
 *	</div>
 */
export function showSpoilers(): void {
  modDescContainer = getModDescContainer()
  const contentDivs = modDescContainer.querySelectorAll<HTMLDivElement>('div.bbc_spoiler>div:nth-of-type(2)')
  for (let i = 0; i < contentDivs.length; i++) {
    contentDivs[i].style.display = 'block'
  }
}

/**
 * youtube 嵌入式链接 换成 外链接
 * 如 <div class="youtube_container"><iframe class="youtube_video" src="https://www.youtube.com/embed/KuO6ortp0ZY" ...></iframe></div>
 * 	换成 <a src="https://www.youtube.com/watch?v=KuO6ortp0ZY">https://www.youtube.com/watch?v=KuO6ortp0ZY</a>
 *
 * 技术需求: 替换元素, 文档位置不变
 */
export function replaceYoutubeVideosToUrls(): void {
  modDescContainer = getModDescContainer()
  const youtubeIframes = modDescContainer!.querySelectorAll('iframe.youtube_video')
  if (youtubeIframes.length === 0) return
  for (let i = 0; i < youtubeIframes.length; i++) {
    const embedUrl = youtubeIframes[i].getAttribute('src')
    const parts = embedUrl!.split('/')
    const videoId = parts[parts.length - 1]
    const watchA = document.createElement('a')
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
    watchA.setAttribute('href', watchUrl)
    watchA.innerText = watchUrl
    const parent = youtubeIframes[i].parentNode
    const grandparent = parent!.parentNode
    grandparent && grandparent.replaceChild(watchA, parent!)
  }
}

/**
 * 把 <img src="https://i.imgur.com/3lTo8Sz.png"> 换成
 * <a src="https://i.imgur.com/3lTo8Sz.png">https://i.imgur.com/3lTo8Sz.png</a>
 *
 * 中国大陆无法直接访问, 造成 SingleFileZ 保存网页耗时过多.
 *
 * 但是有些 mod author, 习惯用把图片作为分割线, Requirements, Changelogs 等, 以突出标题, 不推荐使用.
 */
export function replaceImgurToAnchor(): void {
  modDescContainer = getModDescContainer()
  const imgs = modDescContainer.querySelectorAll<HTMLImageElement>('img[src^="https://i.imgur.com/"]')
  for (let i = 0; i < imgs.length; i++) {
    const url = imgs[i].getAttribute('src')
    const anchor = document.createElement('a')
    anchor.setAttribute('href', url!)
    anchor.innerText = url!
    const parent = imgs[i].parentNode
    parent!.replaceChild(anchor, imgs[i])
  }
}
