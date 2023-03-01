import { getArticleElement, getArticleTitle, getCommentContainerDiv } from "./article_page.ts"

import { getModActionsUl } from "./tabs_shared.ts"
import { containerManager,  createActionComponent,  titleElement } from "../ui.ts"
import { setSectionAsTopElement, simplifyDescriptionContent } from "../site_shared_actions.ts"

function simplifyArticlePage() {
  simplifyDescriptionContent(getArticleElement())
  // 修改 title
  titleElement.innerText = getArticleTitle()
  // 移除 modactions
  getModActionsUl().remove()
  // 移除 comment
  getCommentContainerDiv()?.remove()
  setSectionAsTopElement()
}

export function createSimplifyArticlePageComponent() {
  const button = createActionComponent("Simplify Article Page")
  button.addEventListener("click", () => {
    simplifyArticlePage()
    containerManager.hideAll()
  })
  return button
}

