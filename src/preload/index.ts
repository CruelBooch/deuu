import { contextBridge, ipcRenderer } from 'electron'
import type {
  Api,
  AppInfo,
  ArticleRequest,
  DictLookupResult,
  HistoryEntry,
  Settings,
  VocabState
} from '../shared/types'

const api: Api = {
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: Settings): Promise<void> => ipcRenderer.invoke('settings:save', settings),
  askAI: (input: string) => ipcRenderer.invoke('ai:query', input),
  generateArticle: (req: ArticleRequest) => ipcRenderer.invoke('ai:article', req),
  windowMinimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  windowToggleMaximize: (): Promise<boolean> => ipcRenderer.invoke('window:toggle-maximize'),
  windowClose: (): Promise<void> => ipcRenderer.invoke('window:close'),
  windowIsMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
  getHistory: (): Promise<HistoryEntry[]> => ipcRenderer.invoke('history:get'),
  saveHistory: (entries: HistoryEntry[]): Promise<void> =>
    ipcRenderer.invoke('history:save', entries),
  getVocab: (): Promise<VocabState> => ipcRenderer.invoke('vocab:get'),
  saveVocab: (state: VocabState): Promise<void> => ipcRenderer.invoke('vocab:save', state),
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke('app:info'),
  dictLookup: (word: string): Promise<DictLookupResult> => ipcRenderer.invoke('dict:lookup', word),
  dictSuggest: (prefix: string): Promise<string[]> => ipcRenderer.invoke('dict:suggest', prefix)
}

contextBridge.exposeInMainWorld('api', api)
