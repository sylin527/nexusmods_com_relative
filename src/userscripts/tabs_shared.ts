import { mainContentMaxWidth } from "./shared.ts";
const { body, head } = document;
/**
 * 不描述 description, files, images 等 tab 的信息.
 * 仅描述 game name, mod name, version, gallery 等等.
 */

/**
 * <meta property="og:site_name" content="Nexus Mods :: Skyrim Special Edition">
 */
export const gameNameSelector = 'head>meta[property="og:site_name"]';
/**
 * 如 <meta property="og:title" content="Aspens Ablaze">
 * Aspens Ablaze 是 mod 名
 */
export const modNameSelector = 'head>meta[property="og:title"]';

export const headerSelector = "header#head";

export const mainContentSelector = "div#mainContent";

/**
 * base info + description tab
 *
 * Contains game id and mod id.
 * <section id="section" class="modpage" data-game-id="1704" data-mod-id="1089"> ...
 */
export const modInfoContainerSelector = "section#section";

export const galleryContainerSelector = "div#sidebargallery";

/**
 * relative to galleryContainerSelector
 */
export const galleryRelativeSelector = "ul.thumbgallery.gallery.clearfix";

export const modVersionSelector = "div#pagetitle>ul.stats.clearfix>li.stat-version>div.statitem>div.stat";

/*
 <ul class="modactions">
 <!-- Add media, Tracking, ... -->
 </ul>
 */
export const modActionsSelector = "div#pagetitle>ul.modactions";

/*
 <div class="tabs">
    <ul class="modtabs">...</ul>
    <div class="tabcontent tabcontent-mod-page"></div>
  <div>
*/
export const tabsContainerSelector = "div.tabs";

/*
 共用部分, 下方的 tab 导航

被点击(选中)时, li>a 的 class="selected"

<ul class="modtabs">
  <li id="mod-page-tab-description">
    <a href="/skyrimspecialedition/mods/55120?tab=description"
      data-target="/Core/Libs/Common/Widgets/ModDescriptionTab?id=55120&amp;game_id=1704">
      <span class="tab-label">Description</span>
    </a>
  </li>
  <li id="mod-page-tab-files">
    <a href="/skyrimspecialedition/mods/55120?tab=files"
      data-target="/Core/Libs/Common/Widgets/ModFilesTab?id=55120&amp;game_id=1704" class="selected">
      <span class="tab-label">Files</span>
      <span class="alert">2</span>
    </a>
  </li>
  <li id="mod-page-tab-images"></li>
  <li id="mod-page-tab-videos"></li>
  <li id="mod-page-tab-posts"></li>
  <li id="mod-page-tab-bugs"></li>
  <li id="mod-page-tab-actions"></li>
  <li id="mod-page-tab-stats"></li>
</ul>

 */
export const modTabsSelector = "#section div.tabs ul.modtabs";

/*
div.tabcontent.tabcontent-mod-page 是所有 tab 的容器, tab 只是其子元素

description tab 如下:

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

images tab 如下:

<div class="tabcontent tabcontent-mod-page">
  <div id="tab-modimages">...</div>
</div>
*/
export const tabContentContainerSelector = "div.tabcontent.tabcontent-mod-page";

/**
 * 位于 #mainContent 内部
 */
export const backToTopSelector = "div#rj-back-to-top";

export const footerSelector = "footer#rj-footer";

export const modPageUrlRegexp = /^((https|http):\/\/(www.)?nexusmods.com\/[a-z0-9]+\/mods\/[0-9]+)/;

export function isModPageUrl(url: string): boolean {
  return modPageUrlRegexp.test(url);
}

let modInfoContainer: HTMLElement | null = null;

export function getModInfoContainer() {
  if (!modInfoContainer) {
    modInfoContainer = body.querySelector<HTMLElement>(modInfoContainerSelector) as HTMLElement;
  }
  return modInfoContainer;
}

// modName cache
let modName: string | null = null;

export function getModName(): string {
  if (!modName) {
    const meta = head.querySelector<HTMLMetaElement>(`meta[property="og:title"]`);
    if (meta) {
      modName = meta.getAttribute("content")!;
    } else {
      const ul = document.getElementById("breadcrumb") as HTMLUListElement;
      const li = ul.querySelector("li:last-child") as HTMLLIElement;
      modName = li.innerText;
    }
  }
  return modName;
}

// modVersion cache
let modVersion: string | null = null;

/**
 * Mod version can be empty string???
 */
export function getModVersion(): string {
  if (!modVersion) {
    modVersion = body.querySelector<HTMLDivElement>(modVersionSelector)!.innerText;
  }
  return modVersion;
}

// modVersion cache
let modVersionWithDate: string | null = null;

export function getModVersionWithDate(): string {
  if (!modVersionWithDate) {
    const fileInfoDiv = document.getElementById("fileinfo") as HTMLDivElement;
    const dateTimeElement = fileInfoDiv.querySelector("div.timestamp:nth-of-type(1)>time") as HTMLTimeElement;
    const date = new Date(Date.parse(dateTimeElement.dateTime));
    modVersionWithDate = `${getModVersion()}(${date.getFullYear().toString().substring(2)}.${
      date.getMonth() + 1
    }.${date.getDate()})`;
  }
  return modVersionWithDate;
}

/**
 * Clean global background.
 * 覆盖 '::before' 的 background image 至, 无法减小 SingFile 保存文件的大小, 没必要使用
 */
export function clearBodyBackground(): void {
  // 仅可读
  // const beforePseudoElement = window.getComputedStyle(body, "::before");

  const newStyle = document.createElement("style");
  // 通常 document.styleSheets 的元素不止一个, 所以还是 新建一个 style 元素.
  head.appendChild(newStyle);
  const sheet = newStyle.sheet;
  // 仅仅是覆盖, 不是删除原 background-image
  // SingleFileZ 依然会把 'body::before { background-image: none}' 覆盖的 原 background-image 图片保存, 导致体积不减小.
  sheet?.insertRule("body::before { background-image: none;}", 0);

  // 浏览器开发工具 Inspector 里 找不到 body::before, SingleFileZ 保存后, 文件体积仍未减小.
  sheet?.insertRule(`body::before { content: none; display: none;}`, 0);
}

/**
 * 如果有 div#feature, 清除其 style 属性, 更改其 id 为 nofeature 以使用 nofeature 样式.
 *
 * 对比 div#feature, div#nofeature 样式为: 清除背景, 减小 height.
 */
export function removeFeature(modInfoContainer: HTMLElement): void {
  const featureDiv = modInfoContainer.querySelector<HTMLDivElement>("#feature");
  featureDiv?.removeAttribute("style");
  featureDiv?.setAttribute("id", "nofeature");
}

export function removeModActions(modInfoContainer: HTMLElement) {
  modInfoContainer.querySelector(modActionsSelector)?.remove();
}

export function removeModGallery(modInfoContainer: HTMLElement) {
  modInfoContainer.querySelector<HTMLDivElement>(galleryContainerSelector)?.remove();
}

export function simplifyModInfo() {
  const mic = getModInfoContainer();
  removeFeature(mic);
  removeModActions(mic);
  removeModGallery(mic);
}

export function setTabsContainerAsTopElement() {
  // 不删  <ul class="modtabs"></ul> 信息, 保留 mod url
  const tabsContainer = body.querySelector(tabsContainerSelector) as HTMLDivElement;
  // 后面有结构变化导致样式失效, 先修复
  const modtabs = tabsContainer.querySelector("ul.modtabs") as HTMLUListElement;
  modtabs.style.height = "45px";
  // body.new-head { margin-top: 56px;}
  body.classList.remove("new-head");
  body.style.margin = "0 auto";
  body.style.maxWidth = mainContentMaxWidth;

  const tabsBackup = tabsContainer.cloneNode(true);
  body.innerHTML = "";
  body.appendChild(tabsBackup);
}

let modTabs: HTMLUListElement | null = null;

export function getModTabs(): HTMLUListElement {
  if (modTabs === null) {
    modTabs = body.querySelector(modTabsSelector);
  }
  return modTabs as HTMLUListElement;
}

// mod page 中表示 tab 的 span 元素的子字符串元素是首字母大写的
// 但有 text-transform: uppercase, 所以 js 获取是全大写
// 统一转为小写
export function getCurrentTab(): string {
  const modTabs = getModTabs();
  const tabSpan = modTabs.querySelector("li a.selected span") as HTMLSpanElement;
  return tabSpan.innerText.toLowerCase();
}

export function clickModTabs(callback: (tab: string, e: Event) => any) {
  const modTabs = getModTabs();
  modTabs.addEventListener("click", (e) => {
    // HTMLAnchorElement or HTMLSpanElement
    // HTMLAnchorElement: 那个链接元素
    // HTMLSpanElement: tab 字符串 span or 数字 span
    const target = e.target as HTMLElement;
    let tabSpan: HTMLSpanElement;
    if (target instanceof HTMLAnchorElement) {
      tabSpan = target.querySelector("span:first-child") as HTMLSpanElement;
    } else {
      tabSpan = target.parentElement!.querySelector("span:first-child") as HTMLSpanElement;
    }
    const newTab = tabSpan.innerText.toLowerCase();
    callback(newTab, e);
  });
}

let tabContentContainer: HTMLDivElement | null = null;
export function getTabContentContainer() {
  if (!tabContentContainer) {
    tabContentContainer = body.querySelector<HTMLDivElement>(tabContentContainerSelector) as HTMLDivElement;
  }
  return tabContentContainer;
}
