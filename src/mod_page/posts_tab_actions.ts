import { containerManager, createActionComponent } from "../ui.ts"
import {
  clickedTabContentLoaded,
  controlComponentDisplayAfterClickingTab,
  setTabsDivAsTopElement,
} from "./tabs_shared_actions.ts"
import { simplifyComment } from "../site_shared_actions.ts"
import { isPostsTab } from "./posts_tab.ts"
import { getCommentContainerComponent } from "../site_shared.ts"

export function hasStickyOrAuthorComments() {
  const commentContainerComponent = getCommentContainerComponent()
  if (!commentContainerComponent) return false
  const { authorCommentLis, stickyCommentLis } = commentContainerComponent
  return authorCommentLis.length + stickyCommentLis.length > 0
}

export function createSimplifyPostsTabComponent() {
  const button = createActionComponent("Simplify Posts Tab")
  button.addEventListener("click", () => {
    simplifyComment()
    containerManager.hideAll()
    setTabsDivAsTopElement()
  })
  ;(!isPostsTab() || (isPostsTab() && !hasStickyOrAuthorComments())) && (button.style.display = "none")
  controlComponentDisplayAfterClickingTab(
    button,
    async (clickedTab) =>
      clickedTab === "posts" && (await clickedTabContentLoaded()) === 0 && hasStickyOrAuthorComments(),
  )
  return button
}
