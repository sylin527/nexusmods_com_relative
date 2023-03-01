import { getCurrentTab } from "./tabs_shared.ts"

export function getPostsTabUrlRegExp() {
  return /((https|http):\/\/)((www.)?nexusmods.com)\/\w+\/mods\/[0-9]+(\?tab=posts)/
}

export function isPostTabUrl(url: string) {
  return getPostsTabUrlRegExp().test(url)
}

export function isPostsTab() {
  return getCurrentTab() === "posts"
}
