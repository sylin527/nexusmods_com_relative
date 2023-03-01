export function getNexusmodsUrl() {
  return `https://www.nexusmods.com`
}

/**
 * `div#mainContent`
 * @returns
 */
export function getMainContentDiv() {
  return document.getElementById("mainContent") as HTMLDivElement
}

/**
 * base info + description tab
 *
 * Contains game id and mod id.
 * 在 mod url, 有 `<section id="section" class="modpage" data-game-id="1704" data-mod-id="1089">`
 * 在 nexusmods url, 有 `<section class="static homeindex">`
 */
let _section: HTMLElement | null = null
export function getSection() {
  !_section && (_section = getMainContentDiv().querySelector(":scope > section") as HTMLElement)
  return _section
}

/**
 * `footer#rj-footer`
 */
export function getFooter() {
  return document.getElementById("rj-footer")
}

interface CommentContainerComponent {
  commentContainerDiv: HTMLDivElement
  commentCount: number
  headNavDiv: HTMLDivElement
  bottomNavDiv: HTMLDivElement
  // 置顶评论
  stickyCommentLis: HTMLLIElement[]
  // 作者评论
  authorCommentLis: HTMLLIElement[]
  // 非作者, 非作者评论
  otherCommentLis: HTMLLIElement[]
}

export function getCommentContainerComponent(
  commentContainerDiv = document.getElementById("comment-container") as HTMLDivElement | null
): CommentContainerComponent | null {
  if (!commentContainerDiv) return null
  const headNavDiv = commentContainerDiv.querySelector<HTMLDivElement>(":scope > div.head-nav")!
  const bottomNavDiv = commentContainerDiv.querySelector<HTMLDivElement>(":scope > div.bottom-nav")!

  const allCommentLis = commentContainerDiv.querySelectorAll<HTMLLIElement>(":scope > ol > li.comment")

  const stickyCommentLis: HTMLLIElement[] = []
  const authorCommentLis: HTMLLIElement[] = []
  const otherCommentLis: HTMLLIElement[] = []

  for (const commentLi of allCommentLis) {
    const classList = commentLi.classList
    if (classList.contains("comment-sticky")) {
      stickyCommentLis.push(commentLi)
    } else if (classList.contains("comment-author")) {
      authorCommentLis.push(commentLi)
    } else {
      otherCommentLis.push(commentLi)
    }
  }
  return {
    commentContainerDiv,
    get commentCount() {
      return parseInt(
        (document.getElementById("comment-count") as HTMLHeadingElement).getAttribute("data-comment-count")!
      )
    },
    headNavDiv,
    bottomNavDiv,
    stickyCommentLis,
    authorCommentLis,
    otherCommentLis
  }
}

export function getCommentContentTextDiv(commentLi: HTMLLIElement): HTMLDivElement {
  return commentLi.querySelector<HTMLDivElement>(":scope > div.comment-content > div.comment-content-text")!
}

