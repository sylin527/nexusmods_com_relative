import { getTopicsTabH2 } from "./forum_tab.ts"

import { getCurrentTab, isModUrl } from "./tabs_shared.ts"

/**
 * eg. `https://www.nexusmods.com/skyrimspecialedition/mods/198/?tab=forum&topic_id=6037653`
 * @param url
 * @returns
 */
export function isForumTopicUrl(url: string) {
  const searchParams = new URL(url).searchParams
  return isModUrl(url) && searchParams.get("tab") === "forum" && searchParams.has("topic_id")
}

/**
 * 可以通过打开 ForumTopicUrl 来进入 ForumTopicTab
 * 切换 ForumTopicTab 与 ForumTab 不需要重载页面
 * @returns
 */
export function isForumTopicTab() {
  return getCurrentTab() === "forum" && getTopicsTabH2() === null
}

