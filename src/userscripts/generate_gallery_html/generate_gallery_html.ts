import { generate as generateGalleryHtmlLib, IGallery } from "./gallery_html.ts";
import { getModName, getModVersion } from "../tabs_shared.ts";
import { getActionContainer } from "../ui.ts";
import { linkContent, replaceIllegalCharToMark } from "../util.ts";
const { body } = document;

function generateGallery(): IGallery {
  // [lyne408] LI, li, list item
  const liArrayLike = body.querySelectorAll<HTMLLIElement>("#sidebargallery>ul.thumbgallery>li.thumb");

  const descriptions: string[] = [];
  const urls: string[] = [];
  for (let i = 0; i < liArrayLike.length; i++) {
    const liElem = liArrayLike[i];
    const dataSrc = liElem.getAttribute("data-src");
    const innerImgElem = liElem.querySelector<HTMLImageElement>("figure>a>img");
    if (null !== innerImgElem) {
      // 如果有描述, 该 `<img>` 有 `alt`, `title` 属性. 若无, 则没有.
      const titleAttr = innerImgElem.getAttribute("title");
      // `getAttribute()` 找不到属性时返回 `null`
      if (titleAttr) {
        descriptions.push(titleAttr);
      } else {
        descriptions.push("");
      }
    }
    if (null !== dataSrc) {
      urls.push(dataSrc);
    }
  }
  return {
    descriptions,
    urls,
  };
}

/**
 * 生成 Gallery HTML 的网页文本内容
 * 
 * Why startIndex, endIndex?
 * 比如有个 mod A v1 时 gallery 有 400 张图片, 下载了 v1.
 * mod A v2 时更新, gallery 增加了 100 张图片, 共计 500 张, 这时候再下 500 张就比较耗费资源了.
 * 所以用 startIndex, endIndex 来增量下载.
 * startIndex, endIndex 对应 entry element 的属性.
 */
function generateGalleryHtmlInner(modGallery: IGallery, startIndex = 0, endIndex = Infinity): string {
  /*
    为何是 gallery_of, 而非 images_of, author_images_of, preview_of?

      预览图的代表性与作者关系不大.
      images 的范围太广, 是不是 mod 本身的资源 images 呢?
      preview 的范围也大, 有 image preview, video showcase.
      而 gallery 就表示 image preview.
    
    Image Picka 可以选取 current tab and right tabs.
    current tab 存有 author images, right tabs 存有 user images.
  */
  // 生成 Gallery HTML 的 page title, 便于 image picka 保存.
  const titleText = `_gallery_of_${getModName()}_${getModVersion()}`;

  // 需要: 1. 添加序号 2. 文件路径不允许的特殊字符处理
  const { descriptions, urls } = modGallery;
  const len = descriptions.length;

  let i = 0;
  let end = len;
  if (startIndex > 0) i = startIndex;
  if (endIndex !== Infinity) end = endIndex;
  // 按照 substring 习惯, 左闭区间, 右开区间
  for (; i < end; i++) {
    descriptions[i] = `${(i + 1).toString().padStart(len.toString().length, "0")}_${replaceIllegalCharToMark(
      descriptions[i]
    )}`;
  }
  return generateGalleryHtmlLib({ title: titleText, descriptions, urls });
}

function createEntryElement(): HTMLAnchorElement {
  const anchor = document.createElement("a");
  anchor.setAttribute("id", "generateGalleryHTML");
  anchor.setAttribute("startIndex", "0");
  anchor.setAttribute("endIndex", "Infinity");
  anchor.innerText = "Generate Gallery HTML";
  return anchor;
}

/**
 * 连接 Gallery HTML 的文本内容至 入口组件里的 <a>
 * @returns
 */
export function generateGalleryHtml() {
  const uiRoot = getActionContainer();
  const entryElem = createEntryElement();
  uiRoot.appendChild(entryElem);
  const startIndex = entryElem.getAttribute("startIndex") as string;
  const endIndex = entryElem.getAttribute("endIndex") as string;
  const htmlContent = generateGalleryHtmlInner(generateGallery(), parseInt(startIndex), parseInt(endIndex));
  linkContent(entryElem, htmlContent);
}
