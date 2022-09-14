const body = document.body;

// TODO TypeScript 怎么声明全局变量
// var sylin527SharedData: Sylin527SharedData
export type Sylin527SharedData = {
  gameName?: string;
  modName: string;
  modVersion: string;
  authorGallery?: string[];
  briefOverview?: string;
};

export const mainContentMaxWidth = '1340px'

export function setSectionAsTopElement() {
  const section = document.getElementById("section") as HTMLElement;
  body.classList.remove("new-head");
  body.style.margin = "0 auto";
  body.style.maxWidth = mainContentMaxWidth;
  const sectionBackup = section.cloneNode(true);
  body.innerHTML = "";
  body.appendChild(sectionBackup);
}

/*
 * 显示
 * <div class="bbc_spoiler">
 *   <div>....</div>
 *   <div style="display: none;"></div>
 * </div>
 */
export function showSpoilers(container: HTMLElement): void {
  const contentDivs = container.querySelectorAll<HTMLDivElement>("div.bbc_spoiler>div:nth-of-type(2)");
  for (let i = 0; i < contentDivs.length; i++) {
    contentDivs[i].style.display = "block";
  }
}

/**
 * youtube 嵌入式链接 换成 外链接
 * 如 <div class="youtube_container"><iframe class="youtube_video" src="https://www.youtube.com/embed/KuO6ortp0ZY" ...></iframe></div>
 * 	换成 <a src="https://www.youtube.com/watch?v=KuO6ortp0ZY">https://www.youtube.com/watch?v=KuO6ortp0ZY</a>
 *
 * 技术需求: 替换元素, 文档位置不变
 *
 */
// TODO 保留 title 和 url, 或者 YouTube: title  需要跨域, 懒得操作了
export function replaceYoutubeVideosToAnchor(container: HTMLElement): void {
  const youtubeIframes = container.querySelectorAll("iframe.youtube_video");
  if (youtubeIframes.length === 0) return;
  for (let i = 0; i < youtubeIframes.length; i++) {
    const embedUrl = youtubeIframes[i].getAttribute("src");
    const parts = embedUrl!.split("/");
    const videoId = parts[parts.length - 1];
    const watchA = document.createElement("a");
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    watchA.setAttribute("href", watchUrl);
    watchA.innerText = watchUrl;
    const parent = youtubeIframes[i].parentNode;
    const grandparent = parent!.parentNode;
    grandparent && grandparent.replaceChild(watchA, parent!);
  }
}

/*
22.9.12 打开 https://www.nexusmods.com/skyrim/mods/51602?tab=files,
发现某个文件描述是以下结构: <img> 的 src 竟然是预览

<div class="tabbed-block files-description">
  <p>
    <a href="https://staticdelivery.nexusmods.com/mods/1704/images/798/798-1538533464-1831227118.jpeg">
      <img src="https://staticdelivery.nexusmods.com/mods/1704/images/thumbnails/798/798-1538533464-1831227118.jpeg">
    </a>
  </p>
</div>
*/
export function replaceThumbnailUrlsToImageUrls(container: HTMLElement): void {
  const imgs = container.querySelectorAll("img");
  for (let i = 0; i < imgs.length; i++) {
    const src = imgs[i].src;
    if (src.startsWith("https://staticdelivery.nexusmods.com") && src.includes("thumbnails")) {
      imgs[i].src = src.replace("thumbnails/", "");
    }
  }
}

/**
 * 把 <img src="https://i.imgur.com/3lTo8Sz.png"> 换成
 * <a src="https://i.imgur.com/3lTo8Sz.png">https://i.imgur.com/3lTo8Sz.png</a>
 *
 * 中国大陆无法直接访问, 造成 SingleFileZ 保存网页耗时过多.
 *
 * 但是有些 mod author, 习惯用把图片作为分割线, Requirements, Changelogs 等, 以突出标题, 不推荐使用.
 */
export function replaceImgurToAnchor(container: HTMLElement): void {
  const imgs = container.querySelectorAll<HTMLImageElement>('img[src^="https://i.imgur.com/"]');
  for (let i = 0; i < imgs.length; i++) {
    const url = imgs[i].getAttribute("src");
    const anchor = document.createElement("a");
    anchor.setAttribute("href", url!);
    anchor.innerText = url!;
    const parent = imgs[i].parentNode;
    parent!.replaceChild(anchor, imgs[i]);
  }
}
