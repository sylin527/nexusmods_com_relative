import { getCommentContainerComponent, getCommentContentTextDiv, getSection } from "./site_shared.ts"
import { bodyElement, headElement, highlightColor, mainContentMaxWidth, primaryColor } from "./ui.ts"
import { removeAllChildNodes } from "./util.ts"

/**
 * Clean global background.
 * 覆盖 '::before' 的 background image 至, 无法减小 SingFile 保存文件的大小, 没必要使用
 */
function clearBodyBackground(): void {
  // 仅可读
  // const beforePseudoElement = window.getComputedStyle(body, "::before");

  const newStyle = document.createElement("style")
  // 通常 document.styleSheets 的元素不止一个, 所以还是 新建一个 style 元素.
  headElement.appendChild(newStyle)
  const sheet = newStyle.sheet
  // 仅仅是覆盖, 不是删除原 background-image
  // SingleFileZ 依然会把 'body::before { background-image: none}' 覆盖的 原 background-image 图片保存, 导致体积不减小.
  sheet?.insertRule("body::before { background-image: none;}", 0)

  // 浏览器开发工具 Inspector 里 找不到 body::before, SingleFileZ 保存后, 文件体积仍未减小.
  sheet?.insertRule(`body::before { content: none; display: none;}`, 0)
}

/**
 * 设置 `div#mainContent > section` 为 `body` 顶层子元素
 * 注意: 涉及 DOM 的操作完成之后再使用
 */
export function setSectionAsTopElement() {
  bodyElement.classList.remove("new-head")
  bodyElement.style.margin = "0 auto"
  bodyElement.style.maxWidth = mainContentMaxWidth
  const sectionBackup = getSection().cloneNode(true)
  removeAllChildNodes(bodyElement)
  bodyElement.appendChild(sectionBackup)
}

function getSpoilerToggleClassName() {
  return "sylin527_show_spoiler_toggle"
}

let hasInsertedShowSpoilerToggleStyle = false

// 为何不通过变量来确认有没有添加过相关样式?
// 怕 SingFile 保存 description tab 后, 把其中一些样式删掉了. 在要保存 files tab 样式就不准确了.
function insertShowSpoilerToggleStyle() {
  if (hasInsertedShowSpoilerToggleStyle) return
  const newStyle = document.createElement("style")
  headElement.appendChild(newStyle)
  const sheet = newStyle.sheet!
  const showSpoilerToggle = getSpoilerToggleClassName()
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
  )

  sheet.insertRule(
    `
    input.${showSpoilerToggle} {
      margin-left: 1px;
      z-index: 987654321;
      opacity: 0;
    }
    `,
    ++ruleIndex
  )
  sheet.insertRule(
    `
    input.${showSpoilerToggle} ~ i.sylin527_show_text {
      font-style: normal;
      margin-left: -60px;
    }
    `,
    ++ruleIndex
  )
  sheet.insertRule(
    `
    input.${showSpoilerToggle} ~ i.sylin527_show_text::after {
      content: attr(unchecked_text);
      background-color: ${primaryColor};
      font-size: 12px;
      color: #E6E6E6;
      border-radius: 3px;
      font-weight: 400;
      line-height: 27px;
    }
    `,
    ++ruleIndex
  )
  sheet.insertRule(
    `
    input.${showSpoilerToggle}:checked ~ i.sylin527_show_text::after {
      content: attr(checked_text);
      background-color: ${highlightColor};
    }
    `,
    ++ruleIndex
  )
  sheet.insertRule(
    `
    input.${showSpoilerToggle}:checked ~ div.bbc_spoiler_content {
      display: none;
    }
    `,
    ++ruleIndex
  )
  // CSS 控制 div.bbc_spoiler_content 显示
  sheet.insertRule(
    `
    div.bbc_spoiler_content {
      display: block;
    }
    `,
    ++ruleIndex
  )
  hasInsertedShowSpoilerToggleStyle = true
}

// 显示 div.bbc_spoiler > div.bbc_spoiler_content
// 保存后可以隐藏/显示 div.bbc_spoiler > div.bbc_spoiler_content
// ---------------------------------
// 最好一个 tab 只执行一次, 避免多次 addShowSpoilerToggleStyle
function showSpoilers(container: HTMLElement) {
  insertShowSpoilerToggleStyle()
  const spoilers = container.querySelectorAll("div.bbc_spoiler")
  for (let i = 0; i < spoilers.length; i++) {
    const spoiler = spoilers[i]
    spoiler.querySelector("div.bbc_spoiler_show")?.remove()
    /*
    <input class="sylin527_show_spoiler_toggle" type="checkbox" /><i class="bbc_spoiler_show sylin527_show_text"
      checked_text="Show"
      unchecked_text="Hide"></i>
  */
    const input = document.createElement("input")
    input.className = getSpoilerToggleClassName()
    input.setAttribute("type", "checkbox")
    const iElement = document.createElement("i")
    iElement.setAttribute("class", "sylin527_show_text")
    // unchecked 时显示, checked 之后隐藏
    iElement.setAttribute("checked_text", "Show")
    iElement.setAttribute("unchecked_text", "Hide")
    const content = spoiler.querySelector("div.bbc_spoiler_content") as HTMLDivElement
    spoiler.insertBefore(input, content)
    spoiler.insertBefore(iElement, content)
    // js 控制的 style 属性比 css 优先级高
    // 为了 css 控制 div.bbc_spoiler_content 的 display 属性, 移除 style 属性
    content.removeAttribute("style")
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

/**
 * 获取 Youtube video iframe 的标题需要跨域, 暂不操作
 * @param container
 * @returns
 */
function replaceYoutubeVideosToAnchor(container: HTMLElement): void {
  const youtubeIframes = container.querySelectorAll("iframe.youtube_video")
  if (youtubeIframes.length === 0) return
  for (let i = 0; i < youtubeIframes.length; i++) {
    const embedUrl = youtubeIframes[i].getAttribute("src")
    const parts = embedUrl!.split("/")
    const videoId = parts[parts.length - 1]
    const watchA = document.createElement("a")
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
    // v0.1.2 修复多个 embedded YouTube videos 在一行的问题
    watchA.style.display = "block"
    watchA.setAttribute("href", watchUrl)
    watchA.innerText = watchUrl
    const parent = youtubeIframes[i].parentNode
    const grandparent = parent!.parentNode
    grandparent && grandparent.replaceChild(watchA, parent!)
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
function replaceThumbnailUrlsToImageUrls(container: HTMLElement): void {
  const imgs = container.querySelectorAll("img")
  for (let i = 0; i < imgs.length; i++) {
    const src = imgs[i].src
    if (src.startsWith("https://staticdelivery.nexusmods.com") && src.includes("thumbnails")) {
      imgs[i].src = src.replace("thumbnails/", "")
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
 *
 * 老老实实用国外服务器访问 Nexusmods
 */
function replaceImgurToAnchor(container: HTMLElement): void {
  const imgs = container.querySelectorAll<HTMLImageElement>('img[src^="https://i.imgur.com/"]')
  for (let i = 0; i < imgs.length; i++) {
    const url = imgs[i].getAttribute("src")
    const anchor = document.createElement("a")
    anchor.setAttribute("href", url!)
    anchor.innerText = url!
    const parent = imgs[i].parentNode
    parent!.replaceChild(anchor, imgs[i])
  }
}

export function simplifyDescriptionContent(contentContainerElement: HTMLElement) {
  replaceYoutubeVideosToAnchor(contentContainerElement)
  replaceThumbnailUrlsToImageUrls(contentContainerElement)
  showSpoilers(contentContainerElement)
}

export function simplifyComment() {
  const commentContainerComponent = getCommentContainerComponent()
  if (!commentContainerComponent) return
  const { headNavDiv, bottomNavDiv, stickyCommentLis, authorCommentLis, otherCommentLis } = commentContainerComponent

  headNavDiv.remove()
  bottomNavDiv.remove()

  for (const stickyCommentLi of stickyCommentLis) {
    const commentContentTextDiv = getCommentContentTextDiv(stickyCommentLi)
    simplifyDescriptionContent(commentContentTextDiv)
  }

  for (const authorCommentLi of authorCommentLis) {
    const commentContentTextDiv = getCommentContentTextDiv(authorCommentLi)
    simplifyDescriptionContent(commentContentTextDiv)
  }

  otherCommentLis.forEach((nonAuthorCommentLi) => nonAuthorCommentLi.remove())
}

