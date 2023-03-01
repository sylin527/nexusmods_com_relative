import {
  createSimplifyArchivedFilesTabComponent,
  getApiKey,
  tweakTitleIfArchivedFilesTab,
} from "../../mod_page/archived_files_tab_actions.ts"
import { isArticleUrl } from "../../mod_page/article_page.ts"
import { createSimplifyArticlePageComponent } from "../../mod_page/article_page_actions.ts"
import { setLocationToModUrlIfDescriptionTab } from "../../mod_page/description_tab_actions.ts"
import { createSimplifyFilesTabComponent } from "../../mod_page/files_tab_actions.ts"
import { tweakTitleIfFileTab } from "../../mod_page/file_tab_actions.ts"
import { createSimplifyForumTopicTabComponent } from "../../mod_page/forum_topic_tab_actions.ts"
import { createSimplifyModPageComponent } from "../../mod_page/mod_page_actions.ts"
import { createSimplifyPostsTabComponent } from "../../mod_page/posts_tab_actions.ts"
import { isModUrl } from "../../mod_page/tabs_shared.ts"
import {
  createCopyModNameAndVersionComponent,
  createDownloadSelectedImagesComponent,
  createShowAllGalleryThumbnailsComponent,
  hideModActionsSylin527NotUse,
  tweakTitleAfterClickingTab,
} from "../../mod_page/tabs_shared_actions.ts"
import { isSylin527 } from "../../shared.ts"
import { insertActionContainer } from "../../ui.ts"
import { setValue } from "../../userscript_lib/mod.ts"
import { name, version } from "./userscript.header.ts"

/**
 * 仅初始化 `apikey` 为 `''`
 *
 * 没有初始化 `isSylin527`
 */
function initStorage() {
  const apiKey = getApiKey()
  !apiKey && setValue("apikey", "")
}

function initModDocumentationUtility() {
  initStorage()
  const href = location.href
  const actionContainer = insertActionContainer()
  if (isModUrl(href)) {
    tweakTitleAfterClickingTab()
    setLocationToModUrlIfDescriptionTab()

    actionContainer.append(createCopyModNameAndVersionComponent(), createShowAllGalleryThumbnailsComponent())
    if (isSylin527()) {
      actionContainer.appendChild(createDownloadSelectedImagesComponent())
      hideModActionsSylin527NotUse()
    }
    actionContainer.append(
      createSimplifyModPageComponent(),
      createSimplifyFilesTabComponent(),
      createSimplifyArchivedFilesTabComponent(),
      createSimplifyPostsTabComponent(),
      createSimplifyForumTopicTabComponent(),
    )

    tweakTitleIfFileTab()
    tweakTitleIfArchivedFilesTab()
  } else if (isArticleUrl(href)) {
    actionContainer.appendChild(createSimplifyArticlePageComponent())
  }
}

function main() {
  initModDocumentationUtility()
  const scriptInfo = `Load userscript: ${name} ${version}`
  console.log("%c [Info] " + scriptInfo, "color: green")
  console.log("%c [Info] " + "URL: " + location.href, "color: green")
}

main()
