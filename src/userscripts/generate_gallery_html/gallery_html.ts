/**
 * A [Gallery HTML] is an HTML page contains a gallery(at least some <img> elements).
 */

export interface IGallery {
  // 仅有 url, 无需 description. 语义化太差. 不建议.
  descriptions: string[];
  urls: string[];
}

export interface IGalleryHtmlInfo extends IGallery {
  title: string;
  // 默认值: getDefaultStyle()
  style: string;

  // 第奇数个元素为图片的 description, 第偶数个元素为图片的 url
  // [lyne408] 用一维数组处理 map, 写代码可太费劲了, 不为性能没必要.
  //gallery: string[];
}

export function getDefaultStyle(): IGalleryHtmlInfo["style"] {
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
  `;
}

export function generateImgElements(gallery: IGallery): string[] {
  const imgElements: string[] = [];
  const { descriptions, urls } = gallery;
  for (let i = 0; i < descriptions.length; i++) {
    imgElements.push(
      `<img alt="${descriptions[i]}" title="${descriptions[i]}" src="${urls[i]}"  />`
    );
  }

  /*
    [lyne408] 个人: 只为遍历与映射, 不用 Map. TypeScript 里可用用 具名Tuple.

    [具名Tuple] 或 [具名多多索引对应的 Array] 比 "老是查 API 才能判定哪个是 key, 哪个是 value" 的 Map 舒服多.

    Map 中一般 value 是 重心, 不同人重心习惯不同, 不同业务重心也不同.

    比如 JQuery 的 API 重心在 key, JavaScript API 重心在 value.

    就比如 <img> 的 src, alt. 所以 src 与 alt 到底谁作为 key 呢?

    动态语言, 如 Object 做 Map 有限制, 因为 Object 的 property 有类型限制. 静态语言, 被限制的机会都没有.

    必须用 Map 的地方:
    1. 高速查询映射
    2. key 类型不为 number | string

    */

  return imgElements;
}

export function generate({
  title,
  style = getDefaultStyle(),
  descriptions,
  urls,
}: {
  title: string;
  style?: string;
} & IGallery): string {
  const htmlParts: string[] = [];
  // [lyne408] 理应设置一下编码, 避免编码出错. 比如 "01_Cɾιɱɱ·°" 可能显示 "01_CÉ¾Î¹É±É±Â·Â°".
  const encoding = '<meta charset="UTF-8">';

  htmlParts.push(encoding);
  const titleElem = `<title>${title}</title>`;
  htmlParts.push(titleElem);
  const styleElem = `<style>${style}</style>`;
  htmlParts.push(styleElem);
  const imgElements = generateImgElements({ descriptions, urls });
  htmlParts.push(...imgElements);
  return htmlParts.join("\n");
}
