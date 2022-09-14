// file:///H:/Workspaces/@lyne408/ecmascript_lib/src/time_util.ts
export const delay = function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// file:///H:/Workspaces/@lyne408/browser_lib/src/dom_util.ts
export const linkContent = function (anchorElement: HTMLAnchorElement, content: BlobPart): HTMLAnchorElement {
  const blob = new Blob([content]);
  anchorElement.setAttribute("target", "_blank");
  anchorElement.setAttribute("href", URL.createObjectURL(blob));
  return anchorElement;
};

// "file:///H:/Workspaces/@lyne408/ecmascript_lib/src/path_util.ts";
const illegalCharMarkMapping: { [key: string]: string } = {
  "?": "[QUESTION_MARK]",
  "*": "[ASTERISK]",
  ":": "[COLON]",
  "<": "[LEFT_ANGLE_BRACKET]",
  ">": "[RIGHT_ANGLE_BRACKET]",
  '"': "[QUOTE]",
  "/": "[SLASH]",
  "\\": "[BACKSLASH]",
  "|": "[VERTICAL_BAR]",
};

// "file:///H:/Workspaces/@lyne408/ecmascript_lib/src/path_util.ts";
export const replaceIllegalCharToMark = function (entityName: string) {
  // 1. NTFS, File System Entity can not start width `space`, so trim left and right chars whose charCode <= 32
  entityName = entityName.trim();
  // 2. can't start width `?, *, :, ", <, >, \, /, |`.
  return entityName.replace(/(\?)|(\*)|(:)|(<)|(>)|(")|(\/)|(\\)|(\|)/g, (match) => illegalCharMarkMapping[match]);
};

export const isSylin527 = true;
