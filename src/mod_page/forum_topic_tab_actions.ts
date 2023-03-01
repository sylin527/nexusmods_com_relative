import { containerManager, createActionComponent } from "../ui.ts"
import { clickedTabContentLoaded, setTabsDivAsTopElement } from "./tabs_shared_actions.ts"
import { simplifyComment } from "../site_shared_actions.ts"
import { isForumTopicTab } from "./forum_topic_tab.ts"
import { clickTopicAnchor, isForumTab } from "./forum_tab.ts"
import { clickTabLi } from "./tabs_shared.ts"
import { modTopicsDivAddedDirectChildNodes } from "./forum_tab_actions.ts"
import { hasStickyOrAuthorComments } from "./posts_tab_actions.ts"

export function createSimplifyForumTopicTabComponent(): HTMLButtonElement {
  const button = createActionComponent("Simplify Forum Topic Tab")
  button.addEventListener("click", () => {
    simplifyComment()
    containerManager.hideAll()
    setTabsDivAsTopElement()
  }) // 切换 ForumTopicTab 与 ForumTab 不需要重载页面
  ;(!isForumTopicTab() || (isForumTopicTab() && !hasStickyOrAuthorComments())) &&
    (button.style.display = "none")

  function _addClickTopicAnchorEvent() {
    clickTopicAnchor(async () => {
      await modTopicsDivAddedDirectChildNodes()
      isForumTopicTab() && hasStickyOrAuthorComments() &&
        (button.style.display = "block")
    })
  }
  isForumTab() && _addClickTopicAnchorEvent()

  clickTabLi(async (clickedTab) => {
    button.style.display = "none"
    clickedTab === "forum" && (await clickedTabContentLoaded()) === 0 &&
      isForumTab() && _addClickTopicAnchorEvent()
  })
  return button
}
