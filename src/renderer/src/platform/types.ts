/**
 * 平台能力契约：任何"WebView 壳"（Capacitor / 鸿蒙 ArkWeb / 其它）只需要实现这几个能力，
 * 就能复用同一套 UI 与业务逻辑（src/core + src/renderer）。
 */

export interface HttpRequest {
  url: string
  headers: Record<string, string>
  /** JSON body（由调用方序列化前的对象） */
  data: unknown
  connectTimeout?: number
  readTimeout?: number
}

export interface HttpResponse {
  status: number
  /** 可能是对象（壳已解析 JSON）或字符串 */
  data: unknown
}

export interface PlatformHttp {
  /** 必须走原生网络栈，绕开 WebView 的 CORS 限制 */
  post(req: HttpRequest): Promise<HttpResponse>
}

export interface PlatformStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
}

export interface PlatformDict {
  /** 返回词典 JSONL 全文（每行一个词条） */
  load(): Promise<string>
}

export interface PlatformInfo {
  name: string
  version: string
}

export interface PlatformDeps {
  http: PlatformHttp
  storage: PlatformStorage
  dict: PlatformDict
  info(): Promise<PlatformInfo>
}
