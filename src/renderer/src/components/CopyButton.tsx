import { useCallback, useState } from 'react'
import { IconCheck, IconCopy } from './icons'

/** 复制到剪贴板，带「已复制」回显 */
export function useCopy(): { copied: boolean; copy: (text: string) => void } {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    const done = (): void => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
    try {
      await navigator.clipboard.writeText(text)
      done()
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        done()
      } catch {
        /* 忽略复制失败 */
      }
    }
  }, [])

  return { copied, copy }
}

export default function CopyButton({
  text,
  label = '复制',
  className = 'copy-btn'
}: {
  text: string
  label?: string
  className?: string
}): JSX.Element {
  const { copied, copy } = useCopy()
  return (
    <button className={`${className}${copied ? ' copied' : ''}`} type="button" onClick={() => copy(text)}>
      {copied ? <IconCheck /> : <IconCopy />}
      {copied ? '已复制' : label}
    </button>
  )
}
