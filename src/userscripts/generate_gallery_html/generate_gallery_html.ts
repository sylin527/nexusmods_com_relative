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
      if (null !== titleAttr) {
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
 * @returns string | null
 */
const generateGalleryHtmlInner = function (modGallery: IGallery): string {
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
  for (let i = 0; i < len; i++) {
    descriptions[i] = `${(i + 1).toString().padStart(len.toString().length, "0")}_${replaceIllegalCharToMark(
      descriptions[i]
    )}`;
  }
  return generateGalleryHtmlLib({ title: titleText, descriptions, urls });
};

const createEntryElement = function (): HTMLAnchorElement {
  const anchor = document.createElement("a");
  // anchor.setAttribute('id', 'generateGallery')
  anchor.innerText = "Generate Gallery HTML";
  return anchor;
};

/**
 * 连接 Gallery HTML 的文本内容至 入口组件里的 <a>
 * @returns
 */
export const generateGalleryHtml = function () {
  const uiRoot = getActionContainer();
  const entryElem = createEntryElement();
  uiRoot.appendChild(entryElem);
  const htmlContent = generateGalleryHtmlInner(generateGallery()!);
  if (null !== htmlContent) {
    linkContent(entryElem, htmlContent);
  }
};
