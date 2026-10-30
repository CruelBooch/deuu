type BackHandler = () => boolean

const handlers: BackHandler[] = []

/** 注册返回拦截（后注册的优先执行），返回取消函数 */
export function registerBackHandler(handler: BackHandler): () => void {
  handlers.push(handler)
  return () => {
    const i = handlers.indexOf(handler)
    if (i >= 0) handlers.splice(i, 1)
  }
}

/** 依次询问各处理器，返回是否被某层拦下 */
export function triggerBack(): boolean {
  for (let i = handlers.length - 1; i >= 0; i -= 1) {
    try {
      if (handlers[i]()) return true
    } catch {
      /* 单个处理器出错不影响其他层 */
    }
  }
  return false
}
