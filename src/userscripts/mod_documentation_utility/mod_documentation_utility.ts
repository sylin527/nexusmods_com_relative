import { simplifyFilesTab } from "../files_tab_actions.ts";
import { simplifyForumTab } from "../forum_tab_actions.ts";
import { generateGalleryHtml } from "../generate_gallery_html/generate_gallery_html.ts";

import {
  copyModNameAndVersion,
  simplifyModPage,
} from "../mod_page_actions.ts";
import { tweakTitle } from "../page_title_actions.ts";
import { simplifyPostsTab } from "../posts_tab_actions.ts";
import { isSylin527 } from "../util.ts";

function modDocumentationUtility() {
  tweakTitle()
  if (isSylin527) {
    generateGalleryHtml();
  }
  copyModNameAndVersion();
  simplifyModPage();
  simplifyFilesTab();
  simplifyPostsTab();
  simplifyForumTab();
}

function main () {
  modDocumentationUtility();
  const scriptInfo =
    "Load userscript: [sylin527] nexusmods.com Mod Documentation Utility";
  console.log("%c [Info] " + scriptInfo, "color: green");
};

main();
