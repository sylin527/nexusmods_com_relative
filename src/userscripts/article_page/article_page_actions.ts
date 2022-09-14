import { replaceThumbnailUrlsToImageUrls, replaceYoutubeVideosToAnchor, setSectionAsTopElement } from "../shared.ts";
import { showSpoilers } from "../shared.ts";
import { getUiRootElement, hideSylin527Ui } from "../ui.ts";
const { head, body } = document;

function simplifyArticlePage() {
  const section = document.getElementById("section") as HTMLElement;
  const content = section.querySelector("div.container") as HTMLDivElement;
  showSpoilers(content);
  replaceYoutubeVideosToAnchor(content);
  replaceThumbnailUrlsToImageUrls(content);
  const pageTitle = document.getElementById("pagetitle") as HTMLDivElement;
  const titleH1 = pageTitle.querySelector("h1") as HTMLHeadingElement;
  // 修改 title
  head.querySelector("title")!.innerText = titleH1.innerText;
  // 移除 modactions
  pageTitle.querySelector("ul.modactions")?.remove();
  // 移除 comment
  document.getElementById("comment-container")?.remove();
  setSectionAsTopElement();
}

const createEntryElement = function (): HTMLButtonElement {
  const button = document.createElement("button");
  button.setAttribute("id", "simplifyArticlePage");
  button.innerText = "Simplify Article Page";
  return button;
};

function bindEvent() {
  const uiRoot = getUiRootElement();
  const entryElem = createEntryElement();
  uiRoot.appendChild(entryElem);
  entryElem.addEventListener("click", () => {
    simplifyArticlePage();
    hideSylin527Ui();
  });
}

function main() {
  bindEvent();
  const scriptInfo = "Load userscript: [sylin527] nexusmods.com Simplify Article Page for Saving";
  console.log("%c [Info] " + scriptInfo, "color: green");
}

main();
