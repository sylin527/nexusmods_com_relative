// [lyne408]
// Infinity === Infinity 为 true
// NaN === NaN 为 false
// isNaN(parseInt('Infinity')) 为 true
// typeof NaN === typeof Infinity 为 true, 两者类型均为 "number"

// [lyne408]
// 为何命名为 gallery_of, 而非 images_of, author_images_of, preview_of?
// 预览图的代表性与作者关系不大.
// images 的范围太广, 是不是 mod 本身的资源 images 呢?
// preview 的范围也大, 有 image preview, video showcase.
// 而 gallery 就表示 image preview.

/*
[lyne408]

只为遍历与映射, 不用 Map. TypeScript 里可用具名 Tuple.

[具名Tuple] 或 [具名多多索引对应的 Array] 比 "老是查 API 才能判定哪个是 key, 哪个是 value" 的 Map 舒服多.

Map 中一般 value 是 重心, 不同人重心习惯不同, 不同业务重心也不同.

比如 JQuery 的 API 重心在 key, JavaScript API 重心在 value.

就比如 <img> 的 src, alt. 所以 src 与 alt 到底谁作为 key 呢?

动态语言, 如 Object 做 Map 有限制, 因为 Object 的 property 有类型限制. 静态语言, 被限制的机会都没有.

必须用 Map 的地方:
1. 高速查询映射
2. key 类型不为 number | string
*/

// [lyne408]
// HTML 文件理应设置一下编码, 避免编码出错.
// 比如 `01_Cɾιɱɱ·°` 可能显示 `01_CÉ¾Î¹É±É±Â·Â°`

// [lyne408]
// 用一维数组处理映射 (如 Map), 写代码可太费劲了, 不为性能没必要
// 比如 `gallery: string[]` 第奇数个元素为图片的 `title`, 第偶数个元素为图片的 `src`

/**
 * A `GalleryHtml` instance is an HTML page contains a gallery (at least some <img> elements).
 */
import { Image } from "./tabs_shared_actions.ts"

export function getDefaultStyle(): string {
  return `
    html, body {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        background: #222121;
    }
    body {
        padding: 8px;
    }
    img {
        max-width: calc(100% - 0px);
        border: 2px solid #959595;
        border-radius: 2px;
        box-sizing: border-box;
        margin-bottom: 8px;
    }
    img:last-child {
      margin-bottom: 0px;
    }
  `
}

function generateImgHtml(image: Image): string {
  const { url, name } = image
  return `<img alt="${name}" title="${name}" src="${url}"  />`
}

export function generateGalleryHtml(
  title: string,
  images: Image[],
  style = getDefaultStyle(),
): string {
  const htmlParts: string[] = []

  const encoding = '<meta charset="UTF-8">'

  htmlParts.push(encoding)
  const titleElem = `<title>${title}</title>`
  htmlParts.push(titleElem)
  const styleElem = `<style>${style}</style>`
  htmlParts.push(styleElem)
  const imgElements = images.map((image) => generateImgHtml(image))
  htmlParts.push(...imgElements)
  return htmlParts.join("\n")
}
