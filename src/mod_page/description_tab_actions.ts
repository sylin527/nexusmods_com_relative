import {
  getAboutThisModH2,
  getActionsUl,
  getDescriptionDl,
  getDescriptionDtDdMap,
  getModDescriptionContainerDiv,
  getModsRequiringThisDiv,
  getPermissionDescriptionComponent,
  getShareButtonAnchor,
} from "./description_tab.ts"
import { headElement } from "../ui.ts"
import { simplifyDescriptionContent } from "../site_shared_actions.ts"
import { clickTabLi, getCurrentTab, getGameDomainName, getModId } from "./tabs_shared.ts"
import { clickedTabContentLoaded } from "./tabs_shared_actions.ts"
import { generateModUrl } from "../api/mod_api.ts"

export function showAllDescriptionDds() {
  const dtDdMap = getDescriptionDtDdMap()
  if (!dtDdMap || dtDdMap.size === 0) return

  //=============== __START__ 以 CSS 代码模拟 show/hide Requirements, Changelogs 等等 =====================
  const newStyle = document.createElement("style")
  headElement.appendChild(newStyle)
  const sheet = newStyle.sheet!
  const accordionToggle = "sylin527_show_accordion_toggle"
  /*
  设 `top: 56px` 是因 Mod page 的 `<header>` 的 `height: 56px`
  设 `background: transparent;` 以避免突兀
  设 `margin: -44.5px 0 1px 0;` 是因原 DOM Tree 的 <dt> 的 下间距为 1px, 盒模型高度为 43.5px.
  */
  let ruleIndex = sheet.insertRule(`
    input.${accordionToggle} {
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
  sheet.insertRule(
    `
    input.${accordionToggle}:checked ~ dd{
      display: none;
    }
  `,
    ++ruleIndex,
  )

  for (const [dt, dd] of dtDdMap) {
    dt.style.background = "#2d2d2d"
    // 移除右边的小箭头. 保留一下, 观感好些
    // dts[i].querySelector('span.acc-status')?.remove()

    // 调整右边的箭头, 使其朝上.
    // const originalClass = dds[i].getAttribute('class')
    // dds[i].setAttribute('class', originalClass + ' accopen')

    dd.style.display = "block"
    dd.removeAttribute("style")

    // new parent element which not effect current UI views
    const newPar = document.createElement("div")
    // HTML: <input class="${accordionToggle}" type="checkbox"/>
    const toggle = document.createElement("input")
    toggle.setAttribute("class", accordionToggle)
    toggle.setAttribute("type", "checkbox")
    dd.parentElement!.insertBefore(toggle, dd)
    // Node.append() 相当于移动当前元素至某个元素内, 作为其子元素
    newPar.append(dt, toggle, dd)
    getDescriptionDl()?.append(newPar)
  }

  //=============== __END__ 以 CSS 代码模拟 show/hide Requirements, Changelogs 等等 =====================
}

export function simplifyTabDescription() {
  getAboutThisModH2()?.remove()
  getActionsUl()?.remove()
  getShareButtonAnchor()?.remove()
  const descriptionDl = getDescriptionDl()
  if (descriptionDl) {
    getModsRequiringThisDiv()?.remove()
    const permissionDescriptionComponent = getPermissionDescriptionComponent()
    if (permissionDescriptionComponent) {
      const { authorNotesContentP, fileCreditsContentP } = permissionDescriptionComponent
      authorNotesContentP && simplifyDescriptionContent(authorNotesContentP)
      fileCreditsContentP && simplifyDescriptionContent(fileCreditsContentP)
    }
    showAllDescriptionDds()
  }
}

export function simplifyModDescription() {
  const modDescriptionContainerDiv = getModDescriptionContainerDiv()
  if (modDescriptionContainerDiv) {
    simplifyDescriptionContent(modDescriptionContainerDiv)
  }
}

/**
 * 目的: 点击 description tab 后, url 为 mod url, 而不是 description tab url
 * 便于书签管理
 */
export function setLocationToModUrlIfDescriptionTab() {
  const modUrl = generateModUrl(getGameDomainName(), getModId())
  getCurrentTab() === "description" && history.replaceState(null, "", modUrl)
  clickTabLi(async (clickedTab) => {
    clickedTab === "description" && (await clickedTabContentLoaded()) === 0 && history.replaceState(null, "", modUrl)
  })
}
