chcp 65001
@echo off
set script_name=simplify_files_tab
del %script_name%.bundle.js
rem type 读取文件内容
rem type 不要在 `>>` 两边多写空格
type %script_name%.meta.ts>>%script_name%.bundle.js
echo ;(function(){>>%script_name%.bundle.js
rem deno bundle 没有指定 -c 就是默认配置, 无法打包 `/// <reference lib="dom" />
rem deno bundle 没有指定 output, 则使用默认输出流
rem 截止 deno 1.17.0, deno bundle 的 tree shaking 仍旧差劲
@echo on
deno bundle -c ../../deno.jsonc %script_name%.ts>>%script_name%.bundle.js
@echo off
echo })()>>%script_name%.bundle.js
@echo on
pause

