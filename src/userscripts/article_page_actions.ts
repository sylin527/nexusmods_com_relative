import {
  showSpoilers,
  replaceThumbnailUrlsToImageUrls,
  replaceYoutubeVideosToAnchor,
  setSectionAsTopElement,
} from "./shared.ts";
import { getActionContainer, hideSylin527Ui } from "./ui.ts";
const { head } = document;

export const articlePageUrlRegexp = /^((https|http):\/\/(www.)?nexusmods.com\/[a-z0-9]+\/articles\/[0-9]+)/;

export function isArticlePageUrl(url: string) {
  return articlePageUrlRegexp.test(url);
}

function simplify() {
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

export function simplifyArticlePage() {
  const uiRoot = getActionContainer();
  const entryElem = createEntryElement();
  uiRoot.appendChild(entryElem);
  entryElem.addEventListener("click", () => {
    simplify();
    hideSylin527Ui();
  });
}
