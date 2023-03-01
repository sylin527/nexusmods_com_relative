/**
 * Cache codes of other file, **No Comment**, **No Addition**
 */

import { isMinified, isProduction } from "../src/userscripts/userscripts_shared.ts"

const esbuildExec = "esbuild.cmd"

console.log(isProduction ? "Production Environment" : "Development Environment")
console.log(isMinified ? "Compress Codes" : "Not Compress Codes")

export async function build(mainPath: string, buildPath: string, header: string) {
  // 不判断 build path 的文件夹是否存在
  await Deno.writeTextFile(buildPath, header)

  const cmd = isMinified
    ? [esbuildExec, mainPath, "--bundle", "--minify", ">>", buildPath]
    : [esbuildExec, mainPath, "--bundle", ">>", buildPath]

  const process = Deno.run({ cmd })
  const status = await process.status()

  console.log(status)
}
