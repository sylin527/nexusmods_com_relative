import { interval } from '../src/interval.ts'

function test() {
  const ms = 100
  let count = 0
  const inter = interval(() => {
    count++
    if (count <= 10) {
      console.log(count + ' times', Date.now())
    } else {
      inter.clear()
    }
  }, ms)
  
}


test()
