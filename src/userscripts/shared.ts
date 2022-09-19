const body = document.body;


export const infoButtonBackground = '#8197ec'
export const warningButtonBackground = '#d98f40'


// TODO TypeScript 怎么声明全局变量
// var sylin527SharedData: Sylin527SharedData
export type Sylin527SharedData = {
  gameName?: string;
  modName: string;
  modVersion: string;
  authorGallery?: string[];
  briefOverview?: string;
};

export const mainContentMaxWidth = "1340px";

export function setSectionAsTopElement() {
  const section = document.getElementById("section") as HTMLElement;
  body.classList.remove("new-head");
  body.style.margin = "0 auto";
  body.style.maxWidth = mainContentMaxWidth;
  const sectionBackup = section.cloneNode(true);
  body.innerHTML = "";
  body.appendChild(sectionBackup);
}

const showSpoilerToggle = "sylin527_show_spoiler_toggle";
// 为何不通过变量来确认有没有添加过相关样式? 
// 怕 SingFile 保存 description tab 后, 把其中一些样式删掉了. 在要保存 files tab 样式就不准确了.
function addShowSpoilerToggleStyle() {
  const newStyle = document.createElement("style");
  document.head.appendChild(newStyle);
  const sheet = newStyle.sheet!;
  let ruleIndex = sheet.insertRule(
    `
    input.${showSpoilerToggle},
    input.${showSpoilerToggle} ~ i.sylin527_show_text,
    input.${showSpoilerToggle} ~ i.sylin527_show_text::after {
      border: 0;
      cursor: pointer;
      box-sizing: border-box;
      display: inline-block;
      height: 27px;
      width: 60px;
      z-index: 999;
      position: relative;
      vertical-align: middle;
      text-align: center;
    }
    `
  );

  sheet.insertRule(
    `
    input.${showSpoilerToggle} {
      margin-left: 1px;
      z-index: 987654321;
      opacity: 0;
    }
    `,
    ++ruleIndex
  );
  sheet.insertRule(
    `
    input.${showSpoilerToggle} ~ i.sylin527_show_text {
      font-style: normal;
      margin-left: -60px;
    }
    `,
    ++ruleIndex
  );
  sheet.insertRule(
    `
    input.${showSpoilerToggle} ~ i.sylin527_show_text::after {
      content: attr(unchecked_text);
      background-color: ${infoButtonBackground};
      font-size: 12px;
      color: #E6E6E6;
      border-radius: 3px;
      font-weight: 400;
      line-height: 27px;
    }
    `,
    ++ruleIndex
  );
  sheet.insertRule(
    `
    input.${showSpoilerToggle}:checked ~ i.sylin527_show_text::after {
      content: attr(checked_text);
      background-color: ${warningButtonBackground};
    }
    `,
    ++ruleIndex
  );
  sheet.insertRule(
    `
    input.${showSpoilerToggle}:checked ~ div.bbc_spoiler_content {
      display: none;
    }
    `,
    ++ruleIndex
  );
  // CSS 控制 div.bbc_spoiler_content 显示
  sheet.insertRule(
    `
    div.bbc_spoiler_content {
      display: block;
    }
    `,
    ++ruleIndex
  );
}

// 显示 div.bbc_spoiler > div.bbc_spoiler_content
// 保存后可以隐藏/显示 div.bbc_spoiler > div.bbc_spoiler_content
// ---------------------------------
// 最好一个 tab 只执行一次, 避免多次 addShowSpoilerToggleStyle
export function showSpoilers(container: HTMLElement) {
  addShowSpoilerToggleStyle();
  const spoilers = container.querySelectorAll("div.bbc_spoiler");
  for (let i = 0; i < spoilers.length; i++) {
    const spoiler = spoilers[i];
    spoiler.querySelector("div.bbc_spoiler_show")?.remove();
    /*
    <input class="sylin527_show_spoiler_toggle" type="checkbox" /><i class="bbc_spoiler_show sylin527_show_text"
      checked_text="Show"
      unchecked_text="Hide"></i>
  */
    const input = document.createElement("input");
    input.setAttribute("class", showSpoilerToggle);
    input.setAttribute("type", "checkbox");
    const iElement = document.createElement("i");
    iElement.setAttribute("class", "sylin527_show_text");
    // unchecked 时显示, checked 之后隐藏
    iElement.setAttribute("checked_text", "Show");
    iElement.setAttribute("unchecked_text", "Hide");
    const content = spoiler.querySelector("div.bbc_spoiler_content") as HTMLDivElement;
    spoiler.insertBefore(input, content);
    spoiler.insertBefore(iElement, content);
    // js 控制的 style 属性比 css 优先级高
    // 为了 css 控制 div.bbc_spoiler_content 的 display 属性, 移除 style 属性
    content.removeAttribute("style");
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
    // v0.1.2 修复多个 embedded YouTube videos 在一行的问题
    watchA.style.display = 'block'
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
