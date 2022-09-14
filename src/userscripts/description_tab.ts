import { modPageUrlRegexp } from "./tabs_shared.ts";
import { delay } from "./util.ts";

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

/**
 * 容器 of 官方预设的描述模板
 */
export const templateDescriptionContainerSelector =
  "div.container.tab-description";

/**
 * relative to `div.container.tab-description`
 */
export const aboutThisModRelativeSelector = "h2#description_tab_h2";

/**
 * relative to `div.container.tab-description`
 */
export const downloadedOrNotRelativeSelector = "div.modhistory";

export const reportAbuseRelativeSelector = "ul.actions";

/**
 * It's `<a>`.
 * relative to `div.container.tab-description`
 */
export const shareButtonRelativeSelector = "a.btn.inline-flex.button-share";

/**
 * It is a <p>.
 * Like `<p> simple description</p>`.
 *
 * relative to `div.container.tab-description`
 */
export const briefOverviewRelativeSelector = "p:nth-of-type(1)";

/**
 * It is a <dl>.
 *
 * relative to `div.container.tab-description`
 */
export const accordionRelativeSelector = "dl.accordion";

/**
 * 容器 of 作者自定义的描述
 */
export const authorDefinedDescriptionContainerSelector =
  "div.container.mod_description_container";

/*
<div class="bbc_spoiler">
	<div>....</div>
	<div style="display: none;"></div>
</div>
*/
export const spoilerRelativeSelector = "div.bbc_spoiler";

export const hasDescriptionTabUrlRegexp = modPageUrlRegexp;

export function isDescriptionTab(tab: string): boolean {
  return tab === "description";
}

let templateDescriptionContainer: HTMLDivElement | null = null;
let authorDefinedDescriptionContainer: HTMLDivElement | null = null;

/*
 避免这种风险就是 while() 循环:
 如:
 while (!tabDescContainer) {
    await delay(100)
    tabDescContainer = getTabDescContainer()
  }
 */
export async function getTemplateDescriptionContainer(
  tabContentContainer: HTMLDivElement,
  delayMs = 100
) {
  while (!templateDescriptionContainer) {
    await delay(delayMs);
    templateDescriptionContainer = tabContentContainer.querySelector<HTMLDivElement>(
      templateDescriptionContainerSelector
    );
  }
  return templateDescriptionContainer;
}

export function getAuthorDefinedDescriptionContainer(
  tabContentContainer: HTMLDivElement
) {
  if (!authorDefinedDescriptionContainer) {
    authorDefinedDescriptionContainer =
    tabContentContainer.querySelector<HTMLDivElement>(
        authorDefinedDescriptionContainerSelector
      ) as HTMLDivElement;
  }
  return authorDefinedDescriptionContainer;
}

// briefOverview cache
let briefOverview: string | null = null;

// mod 的 简述
export function getBriefOverview(
  templateDescriptionContainer: HTMLDivElement
): string {
  if (!briefOverview) {
    // 从 other tabs 切换到 description tab, 等待description tab 的内容装载完成
    const sde =
      templateDescriptionContainer.querySelector<HTMLParagraphElement>(
        briefOverviewRelativeSelector
      );
    // 需要 trim(), 右边多了 1 个空格
    briefOverview = sde!.innerText.trimEnd();
  }
  return briefOverview;
}

// remove "mods requiring this mod"
// 不建议使用, mods requiring this mod 代表 ecosystem
export function removeModsRequiringThis(accordion: HTMLDListElement) {
  // 如果有 Requirements, 则第一个 `<dt>` 就是
  const firstDt = accordion.querySelector<HTMLElement>("dt:nth-of-type(1)");
  const hasRequirementsDt = firstDt?.innerText
    .trim()
    .startsWith("Requirements");
  if (hasRequirementsDt) {
    // divs.length 的值不一定. 有 Requirements, Mods requiring this, Nexus Requirements 等等
    const divs = accordion.querySelectorAll(
      "dd:nth-of-type(1)>div.tabbed-block"
    );
    if (divs) {
      for (let i = 0; i < divs.length; i++) {
        const text =
          divs[i].querySelector<HTMLHeadingElement>(
            "h3:nth-of-type(1)"
          )!.innerText;
        if (text === "Mods requiring this file") divs[i].remove();
      }
    }
  }
}

// show all accordion <dd>
export function showAllAccordionDds(accordion: HTMLDListElement) {
  // <dt> 是标题
  const dts = accordion.querySelectorAll<HTMLElement>("dt");
  if (dts.length === 0) return;
  // <dd> 是内容
  const dds = accordion.querySelectorAll<HTMLElement>("dd");

  //=============== __START__ 以 CSS 代码模拟 show/hide Requirements, Changelogs 等等 =====================
  const newStyle = document.createElement("style");
  document.head.appendChild(newStyle);
  const sheet = newStyle.sheet!;
  /*
  设 `top: 56px` 是因 Mod page 的 `<header>` 的 `height: 56px`
  设 `background: transparent;` 以避免突兀
  设 `margin: -44.5px 0 1px 0;` 是因原 DOM Tree 的 <dt> 的 下间距为 1px, 盒模型高度为 43.5px.
  */
  let ruleIndex = sheet.insertRule(`
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
  `);
  // SingFileZ 保存时, <dd> 已经显示 (display: block;) 了
  // 所以点击 input[type="checkbox"] 时应隐藏 <dd>
  sheet.insertRule(
    `
    input.sylin527_show_toggle:checked ~ dd{
      display: none;
    }
  `,
    ++ruleIndex
  );
  for (let i = 0; i < dts.length; i++) {
    dts[i].style.background = "#2d2d2d";
    // 移除右边的小箭头. 保留一下, 观感好些
    // dts[i].querySelector('span.acc-status')?.remove()

    /*
    调整右边的箭头, 使其朝上.
    const originalClass = dds[i].getAttribute('class')
    dds[i].setAttribute('class', originalClass + ' accopen')
    */

    dds[i].style.display = "block";
    dds[i].removeAttribute("style");

    // new parent element which not effect cuurent UI views
    const newPar = document.createElement("div");
    // HTML: <input class="sylin527_show_toggle" type="checkbox"/>
    const toggle = document.createElement("input");
    toggle.setAttribute("class", "sylin527_show_toggle");
    toggle.setAttribute("type", "checkbox");
    dds[i].parentElement!.insertBefore(toggle, dds[i]);
    // Node.append() 相当于移动当前元素至某个元素内, 作为其子元素
    newPar.append(dts[i], toggle, dds[i]);
    accordion.append(newPar);
  }
  //=============== __END__ 以 CSS 代码模拟 show/hide Requirements, Changelogs 等等 =====================
}
