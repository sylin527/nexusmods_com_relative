type NextFunc<T> = (value: T) => void
type ErrorFunc = (err: Error) => void
type CompleteFunc = () => void
type Subscriber<T> = {
  next: NextFunc<T>
  error?: ErrorFunc
  complete?: CompleteFunc
}

type Executor<T> = (subscriber: Subscriber<T>) => void

export type Subscription = { unsubscribe: () => boolean }

/**
 * 简单 Observable 实现
 * 实现 API 有些问题, 暂时先这样吧
 */
export class Observable<T> {
  subscribers = new Set<Subscriber<T>>()
  constructor(exec: Executor<T>) {
    const subscribers = this.subscribers
    exec({
      /* 
       next && next(value)) 是代码简写, 等价于
        if (next) {
          next(value)) 
        }
        动态语言可以这样, 静态语言一般不行
       */
      next: (value) => subscribers.forEach(({ next }) => next && next(value)),
      error: (err) => subscribers.forEach(({ error }) => error && error(err)),
      complete: () =>
        subscribers.forEach(({ complete }) => complete && complete()),
    })
  }

  subscribe(subscriber: Subscriber<T>): Subscription {
    const subscribers = this.subscribers
    subscribers.add(subscriber)
    return {
      unsubscribe: () => subscribers.delete(subscriber),
    }
  }
}

/* sample
// Create an Observable instead of a Promise;
const interval = new Observable(({next}) => {
  setInterval(() => next("Hello"), 1000);
});

// Subscribe to that Observable
const subscription = interval.subscribe({ next: (data) => console.log(data) });

// Optionally use the returned subscription object to stop listening:
document.querySelector("button").addEventListener("click", subscription.unsubscribe);
*/
