import { getSection } from "../site_shared.ts"
import { getPageTitleDiv } from "./tabs_shared.ts"

export function getArticleUrlRegExp() {
  return /^((https|http):\/\/(www.)?nexusmods.com\/[a-z0-9]+\/articles\/[0-9]+)/
}

export function isArticleUrl(url: string) {
  return getArticleUrlRegExp().test(url)
}

function getArticleContainerDiv() {
  return getSection().querySelector("div.container") as HTMLDivElement
}

export function getArticleElement() {
  return getArticleContainerDiv().querySelector(":scope > article") as HTMLElement
}

export function getArticleTitle() {
  return (getPageTitleDiv().querySelector(":scope > h1") as HTMLHeadingElement).innerText
}

export function getCommentContainerDiv() {
  return document.getElementById("comment-container") as HTMLDivElement | null
}
