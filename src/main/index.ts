import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join, dirname } from 'path'
import { appendFileSync, existsSync } from 'fs'
import { loadSettings, saveSettings } from './settings'
import { loadHistory, saveHistory } from './history'
import { loadVocab, saveVocab } from './vocab'
import { dictLookup, dictSuggest } from './dictionary'
import { generateArticle, queryAI } from './ai'
import type {
  AppInfo,
  ArticleRequest,
  AskAIResponse,
  DictLookupResult,
  HistoryEntry,
  Settings,
  VocabState
} from '../shared/types'

// 诊断日志：写到 exe 同目录，方便排查启动问题
const LOG_FILE = join(dirname(process.execPath), 'startup.log')
function log(msg: string): void {
  try {
    appendFileSync(LOG_FILE, `${new Date().toISOString()} [pid ${process.pid}] ${msg}\n`)
  } catch {
    /* 忽略日志写入失败 */
  }
}

log('=== boot ===')
try {
  log(`electron=${process.versions.electron} chrome=${process.versions.chrome} node=${process.versions.node}`)
  log(`process.type=${String(process.type)} platform=${process.platform}`)
  log(`ELECTRON_RUN_AS_NODE=${String(process.env.ELECTRON_RUN_AS_NODE)}`)
} catch (e) {
  log(`boot-log-error ${String(e)}`)
}

// 若被当成 Node 运行（ELECTRON_RUN_AS_NODE 生效），自动以 Electron 模式重启自身
if (process.type === undefined || String(process.type) !== 'browser') {
  log('ABORT: not running as Electron browser process (ELECTRON_RUN_AS_NODE may be set)')
  try {
    const { spawn } = require('child_process')
    const env = { ...process.env }
    delete env.ELECTRON_RUN_AS_NODE
    const child = spawn(process.execPath, process.argv.slice(1), {
      env,
      detached: true,
      stdio: 'ignore'
    })
    child.unref()
    log('relaunched in Electron mode')
  } catch (e) {
    log(`relaunch-failed ${String(e)}`)
  }
  process.exit(0)
}

function resolveIconPath(): string | undefined {
  const candidates = [
    join(process.resourcesPath || '', 'icon.ico'),
    join(app.getAppPath(), 'build', 'icon.ico')
  ]
  for (const p of candidates) {
    try {
      if (existsSync(p)) return p
    } catch {
      /* ignore */
    }
  }
  return undefined
}

function createWindow(): void {
  log('createWindow:start')
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 760,
    minWidth: 720,
    minHeight: 520,
    frame: false,
    show: true,
    autoHideMenuBar: true,
    title: 'deuu',
    icon: resolveIconPath(),
    backgroundColor: '#f6f7fb',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })
  log(`createWindow:created id=${mainWindow.id}`)

  // 禁用触控板捏合缩放，界面比例固定（Ctrl +/- 仍可调整）
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1).catch(() => undefined)

  mainWindow.webContents.on('did-finish-load', () => log('wc:did-finish-load'))
  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    log(`wc:did-fail-load code=${code} desc=${desc} url=${url}`)
  })
  mainWindow.webContents.on('render-process-gone', (_e, d) => {
    log(`wc:render-process-gone ${JSON.stringify(d)}`)
  })
  mainWindow.webContents.on('preload-error', (_e, p, err) => {
    log(`wc:preload-error path=${p} err=${err && err.message}`)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    log(`loading url ${process.env['ELECTRON_RENDERER_URL']}`)
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  log('createWindow:load-invoked')
}

function registerIpc(): void {
  ipcMain.handle('settings:get', (): Settings => loadSettings())

  ipcMain.handle('settings:save', (_event, settings: Settings): void => {
    saveSettings(settings)
  })

  ipcMain.handle('history:get', (): HistoryEntry[] => loadHistory())

  ipcMain.handle('history:save', (_event, entries: HistoryEntry[]): void => {
    saveHistory(entries)
  })

  ipcMain.handle('dict:lookup', (_event, word: string): DictLookupResult => {
    return dictLookup(word)
  })

  ipcMain.handle('dict:suggest', (_event, prefix: string): string[] => {
    return dictSuggest(prefix)
  })

  ipcMain.handle('vocab:get', (): VocabState => loadVocab())

  ipcMain.handle('vocab:save', (_event, state: VocabState): void => {
    saveVocab(state)
  })

  ipcMain.handle('app:info', (): AppInfo => ({ name: app.getName(), version: app.getVersion() }))

  ipcMain.handle('ai:query', async (_event, input: string): Promise<AskAIResponse> => {
    const text = typeof input === 'string' ? input.trim() : ''
    if (!text) {
      return { ok: false, error: { code: 'UNKNOWN', message: '输入不能为空' } }
    }

    const settings = loadSettings()
    if (!settings.apiKey.trim()) {
      return { ok: false, error: { code: 'NO_API_KEY', message: '请先在设置中填写 API Key' } }
    }
    if (!settings.baseUrl.trim() || !settings.model.trim()) {
      return { ok: false, error: { code: 'UNKNOWN', message: '请在设置中补全接口地址与模型名称' } }
    }

    try {
      const result = await queryAI(text, settings)
      return { ok: true, result }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, error: { code: 'AI_ERROR', message } }
    }
  })

  ipcMain.handle('ai:article', async (_event, req: ArticleRequest): Promise<AskAIResponse> => {
    const settings = loadSettings()
    if (!settings.apiKey.trim()) {
      return { ok: false, error: { code: 'NO_API_KEY', message: '请先在设置中填写 API Key' } }
    }
    if (!settings.baseUrl.trim() || !settings.model.trim()) {
      return { ok: false, error: { code: 'UNKNOWN', message: '请在设置中补全接口地址与模型名称' } }
    }

    try {
      const result = await generateArticle(req, settings)
      return { ok: true, result }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, error: { code: 'AI_ERROR', message } }
    }
  })

  // 无边框窗口的自定义窗口控制
  ipcMain.handle('window:minimize', (event): void => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle('window:toggle-maximize', (event): boolean => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
    return win.isMaximized()
  })

  ipcMain.handle('window:close', (event): void => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle('window:is-maximized', (event): boolean => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  log('registerIpc:done')
}

app.on('child-process-gone', (_e, details) => log(`app:child-process-gone ${JSON.stringify(details)}`))

log('registering whenReady')
app
  .whenReady()
  .then(() => {
    log('app:ready')
    registerIpc()
    createWindow()
    log('app:createWindow-called')
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  .catch((e) => log(`app:whenReady-error ${String(e)}`))

app.on('window-all-closed', () => {
  log('app:window-all-closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('before-quit', () => log('app:before-quit'))
