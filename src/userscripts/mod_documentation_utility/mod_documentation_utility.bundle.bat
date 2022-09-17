@echo off
: Version 1.2
chcp 65001
set script_name=mod_documentation_utility
del %script_name%.bundle.js

: -------------------------------------
: type 读取文件内容
: type 不要在 `>>` 两边多写空格

: --------------------------------------------
: meta 文件末尾需换行
: 需拆分 meta 和 script, deno bundle 会删掉注释.
type %script_name%.meta.ts>>%script_name%.bundle.js

: -----------------------------------------------------
: 加一个分号, 格式化 ts 时, Deno 不会加上分号, Prettier 会. 目前 Deno 的 format 功能太弱了, 不推荐. 还是建议 Prettier 格式化 typescript
: echo ;>>%script_name%.bundle.js

: -----------------------------------------------------
: deno 1.7 bundle 没有指定 output, 则使用默认输出流
: 因为 deno 1.22.2 的 deno bundle 仍会打包所有 enum, 换成 esbuild 了 
: deno bundle %script_name%.ts>>%script_name%.bundle.js
@echo on
esbuild %script_name%.ts --bundle>>%script_name%.bundle.js
pause

