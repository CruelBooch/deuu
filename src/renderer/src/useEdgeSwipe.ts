import { useEffect, useRef } from 'react'

/** 从屏幕左边缘起算的触发区宽度 */
const EDGE_ZONE = 28
/** 横向滑动多少像素触发返回 */
const TRIGGER_DISTANCE = 64
/** 纵向漂移超过这个值就不算侧滑 */
const MAX_VERTICAL_DRIFT = 55

/**
 * 全局侧滑返回：从屏幕左边缘向右滑动手势。
 * 只在触摸设备上生效，纵向滚动不会误触。
 */
export function useEdgeSwipe(onBack: () => void, enabled: boolean): void {
  const cbRef = useRef(onBack)

  useEffect(() => {
    cbRef.current = onBack
  }, [onBack])

  useEffect(() => {
    if (!enabled) return undefined

    let active = false
    let startX = 0
    let startY = 0

    const onStart = (e: TouchEvent): void => {
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      if (t.clientX > EDGE_ZONE) return
      active = true
      startX = t.clientX
      startY = t.clientY
    }

    const onMove = (e: TouchEvent): void => {
      if (!active) return
      const t = e.touches[0]
      if (Math.abs(t.clientY - startY) > MAX_VERTICAL_DRIFT) {
        active = false
        return
      }
      if (t.clientX - startX >= TRIGGER_DISTANCE) {
        active = false
        cbRef.current()
      }
    }

    const onEnd = (): void => {
      active = false
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    window.addEventListener('touchcancel', onEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
    }
  }, [enabled])
}
