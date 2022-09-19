/* 
<div class="tabcontent tabcontent-mod-page">
  <div id="tab-modtopics">
    <!-- 这个 <script> 作用未知 -->
    <span>
      <script></script>
    </span>
    <div id="comment-container">
      <!-- 标题 -->
      <h2 id="comment-count">Intentional clipping setup for No Grass In Objects (1 comment)</h2>
      <div class="comment-nav clearfix head-nav"></div>
      <ol>
        <!-- 作者的 comment, 边框颜色: #8197ec, 应保留 -->
        <li class="comment comment-author" id="comment-87548888"></li>
        <!-- 其它用户的 comment, 边框无色 -->
        <li class="comment " id="comment-76877078"></li>
      </ol>
      <div class="comment-nav clearfix bottom-nav"></div>
    </div>
  </div>
</div> 
*/

import { showSpoilers, replaceYoutubeVideosToAnchor, replaceThumbnailUrlsToImageUrls } from "./shared.ts";

export function isForumTab(tab: string): boolean {
  return tab === "forum";
}

export function simplify() {
  document.body.querySelector("#tab-modtopics > span")?.remove();
  const container = document.getElementById("comment-container") as HTMLDivElement;
  container.querySelector("div.head-nav")?.remove();
  container.querySelector("div.bottom-nav")?.remove();

  // 作者评论
  const authorComments = container.querySelectorAll<HTMLLIElement>("ol>li.comment-author");
  for (let i = 0; i < authorComments.length; i++) {
    replaceYoutubeVideosToAnchor(authorComments[i]);
    replaceThumbnailUrlsToImageUrls(authorComments[i]);
  }

  // 非作者评论
  // v0.1.2 不会移除 li.comment-sticky 内的 li:not(.comment-sticky)
  const nonAuthorComments = container.querySelectorAll<HTMLLIElement>(
    "div#comment-container>ol>li:not(.comment-author)"
  );
  for (let i = 0; i < nonAuthorComments.length; i++) {
    nonAuthorComments[i].remove();
  }
  showSpoilers(container);
}
