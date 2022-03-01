import { average, spend } from './test_util.ts'

/**
 * PrefixZero 与 PadZero 语义的不同.
 * Pad 有 padEnd(), padRight().
 */
type PrefixZero = (num: number, digits: number) => string

const prefixZero1: PrefixZero = function (num, n) {
  let result = num.toString()
  for (let len = result.length; len < n; len++) {
    result = '0' + result
  }
  return result
}

const prefixZero2: PrefixZero = function (num, n) {
  return (Array(n).join('0') + num).slice(-n)
}

const prefixZero3: PrefixZero = function (num, n) {
  /* 最多 9 个 0, 支持至多 10 位数 */
  return ('000000000' + num).slice(-n)
}

const prefixZero4: PrefixZero = function (num, n) {
  return (num / Math.pow(10, n)).toFixed(n).substring(2)
}

const prefixZero5: PrefixZero = function (num, n) {
  return num.toString().padStart(n, '0')
}

function main() {
  const times = 20
  const process = (prefixZero: PrefixZero) => {
    for (let i = 1; i <= 654321; i++) {
      prefixZero(i, 10)
    }
  }

  console.log(average(() => spend(() => process(prefixZero1)), times)) // 106.5
  console.log(average(() => spend(() => process(prefixZero2)), times)) // 243.95
  console.log(average(() => spend(() => process(prefixZero3)), times)) // 44.9
  console.log(average(() => spend(() => process(prefixZero4)), times)) // 381.05
  console.log(average(() => spend(() => process(prefixZero5)), times)) // 100.15
}

main()
