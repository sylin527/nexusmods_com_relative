import { simplifyFilesTab } from "../files_tab_actions.ts";
import { simplifyForumTab } from "../forum_tab_actions.ts";
import { generateGalleryHtml } from "../generate_gallery_html/generate_gallery_html.ts";
import { copyModNameAndVersion, simplifyModPage, tweakTitle } from "../mod_page_actions.ts";
import { simplifyPostsTab } from "../posts_tab_actions.ts";
import { isModPageUrl } from "../tabs_shared.ts";
import { isSylin527 } from "../util.ts";
import { isArticlePageUrl, simplifyArticlePage } from "../article_page_actions.ts";

function modDocumentationUtility() {
  const href = location.href;
  if (isModPageUrl(href)) {
    tweakTitle();
    if (isSylin527) {
      generateGalleryHtml();
      // showAllGalleryThumbnails();
    }
    copyModNameAndVersion();
    simplifyModPage();
    simplifyFilesTab();
    simplifyPostsTab();
    simplifyForumTab();
  } else if (isArticlePageUrl(href)) {
    simplifyArticlePage();
  }
}

function main() {
  modDocumentationUtility();
  const scriptInfo = "Load userscript: sylin527's Mod Documentations Utility";
  console.log("%c [Info] " + scriptInfo, "color: green");
  console.log("%c [Info] " + "URL: " + location.href, "color: green");
}

main();
