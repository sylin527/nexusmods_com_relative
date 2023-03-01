import { simplifyModDescription, simplifyTabDescription } from "./description_tab_actions.ts"
import { setSectionAsTopElement } from "../site_shared_actions.ts"

import { getModName, getModVersionWithDate } from "./tabs_shared.ts"
import {
  clickedTabContentLoaded,
  controlComponentDisplayAfterClickingTab,
  removeFeature,
  removeModActions,
  removeModGallery,
} from "./tabs_shared_actions.ts"
import { containerManager, createActionComponent, titleElement } from "../ui.ts"
import { isDescriptionTab } from "./description_tab.ts"

function simplifyModPage () {
  removeFeature()
  removeModActions()
  removeModGallery()
  simplifyTabDescription()
  simplifyModDescription()
  titleElement.innerText = `${getModName()} ${getModVersionWithDate()}`
  containerManager.hideAll()
  setSectionAsTopElement()
}

/**
 * mod url page (has description tab)
 * @returns
 */
export function createSimplifyModPageComponent(): HTMLButtonElement {
  const button = createActionComponent("Simplify Mod Page")
  button.addEventListener("click", () => {
    simplifyModPage()
  })
  !isDescriptionTab() && (button.style.display = "none")
  /**
   * 似乎 mod page loaded (description tab) 加载之后,
   * `description tab <li>` 还是被 Nexusmods 的 JavaScript 代码 `click` 了一下,
   * 但没有刷新 tab content, 也就没有 childList MutationRecord.
   * 这时候再 `await clickedTabContentLoaded()` 就得不到返回值了.
   * 会导致首次点击其它的 tab, `Simplify Mod Page` button 还是显示.
   */
  let isNewPage = true
  controlComponentDisplayAfterClickingTab(button, async (clickedTab) => {
    if (isNewPage) {
      isNewPage = false
      return clickedTab === "description"
    } else {
      return clickedTab === "description" && (await clickedTabContentLoaded()) === 0
    }
  })
  return button
}
