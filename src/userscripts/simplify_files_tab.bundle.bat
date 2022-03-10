chcp 65001
@echo off
set script_name=simplify_files_tab
del %script_name%.bundle.js
rem type 读取文件内容
rem type 不要在 `>>` 两边多写空格
type %script_name%.meta.ts>>%script_name%.bundle.js
echo ;(function(){>>%script_name%.bundle.js
rem deno 1.7 bundle 没有指定 output, 则使用默认输出流
@echo on
deno bundle %script_name%.ts>>%script_name%.bundle.js
@echo off
echo })()>>%script_name%.bundle.js
@echo on
pause

