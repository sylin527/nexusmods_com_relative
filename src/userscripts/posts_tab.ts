/*
<div class="tabcontent tabcontent-mod-page" aria-live="assertive" role="status">
  <div id="comment-container">
    <!-- 有多少评论 -->
    <h2 id="comment-count" data-comment-count="6530">6530 comments</h2>
    <!-- 上方评论翻页 -->
    <div class="comment-nav clearfix head-nav"></div>
    <ol>
      <!-- 置顶评论 -->
      <li class="comment comment-sticky"></li>
      <li class="comment comment-sticky"></li>
      <li class="comment comment-sticky"></li>
      <!-- 非置顶评论 -->
      <li class="comment"></li>
    </ol>
    <!-- 下方评论翻页 -->
    <div class="comment-nav clearfix bottom-nav"></div>
  </div>
</div>
*/

import { showSpoilers, replaceYoutubeVideosToAnchor, replaceThumbnailUrlsToImageUrls } from "./shared.ts";

export const postsTabUrlRegexp = /((https|http):\/\/)((www.)?nexusmods.com)\/\w+\/mods\/[0-9]+(\?tab=posts)$/;

export function isPostsTab(tab: string): boolean {
  return tab === "posts";
}

export function simplify() {
  const container = document.getElementById("comment-container") as HTMLDivElement;
  container.querySelector("div.head-nav")?.remove();
  container.querySelector("div.bottom-nav")?.remove();

  // 置顶评论
  const stickyLis = container.querySelectorAll<HTMLLIElement>("ol>li.comment-sticky");
  for (let i = 0; i < stickyLis.length; i++) {
    showSpoilers(stickyLis[i]);
    replaceYoutubeVideosToAnchor(stickyLis[i]);
    replaceThumbnailUrlsToImageUrls(stickyLis[i]);
  }

  // 移除非置顶评论
  // :not() 反选
  const unstickyLis = container.querySelectorAll<HTMLLIElement>("ol>li:not(.comment-sticky)");
  for (let i = 0; i < unstickyLis.length; i++) {
    unstickyLis[i].remove();
  }
}
