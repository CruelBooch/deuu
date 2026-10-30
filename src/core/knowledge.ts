/** 常用背记知识：动词三态、动词/形容词的介词搭配 */

export interface KnowledgeItem {
  id: string
  /** 词条或搭配 */
  de: string
  /** 中文释义 */
  zh: string
  /** 补充信息：三态、支配的格等 */
  detail?: string
  /** 加入生词本时使用的词性 */
  pos: string
}

export interface KnowledgeCategory {
  id: string
  title: string
  hint: string
  items: KnowledgeItem[]
}

const v = (id: string, de: string, zh: string, detail: string): KnowledgeItem => ({
  id,
  de,
  zh,
  detail,
  pos: '动词'
})

const vp = (id: string, de: string, zh: string, kasus: string): KnowledgeItem => ({
  id,
  de,
  zh,
  detail: kasus,
  pos: '动词搭配'
})

const ap = (id: string, de: string, zh: string, kasus: string): KnowledgeItem => ({
  id,
  de,
  zh,
  detail: kasus,
  pos: '形容词搭配'
})

export const KNOWLEDGE: KnowledgeCategory[] = [
  {
    id: 'verbs',
    title: '动词三态',
    hint: '原形 · 过去时 · 现在完成时，德语最常考的一组变化',
    items: [
      v('gehen', 'gehen', '走、去', 'ging · ist gegangen'),
      v('fahren', 'fahren', '乘车、驾驶', 'fuhr · ist gefahren'),
      v('kommen', 'kommen', '来', 'kam · ist gekommen'),
      v('sehen', 'sehen', '看见', 'sah · hat gesehen'),
      v('essen', 'essen', '吃', 'aß · hat gegessen'),
      v('trinken', 'trinken', '喝', 'trank · hat getrunken'),
      v('sprechen', 'sprechen', '说、讲', 'sprach · hat gesprochen'),
      v('schreiben', 'schreiben', '写', 'schrieb · hat geschrieben'),
      v('lesen', 'lesen', '读', 'las · hat gelesen'),
      v('nehmen', 'nehmen', '拿、取', 'nahm · hat genommen'),
      v('geben', 'geben', '给', 'gab · hat gegeben'),
      v('finden', 'finden', '找到、认为', 'fand · hat gefunden'),
      v('bleiben', 'bleiben', '停留、留下', 'blieb · ist geblieben'),
      v('schlafen', 'schlafen', '睡觉', 'schlief · hat geschlafen'),
      v('laufen', 'laufen', '跑、行走', 'lief · ist gelaufen'),
      v('bringen', 'bringen', '带来', 'brachte · hat gebracht'),
      v('denken', 'denken', '思考、认为', 'dachte · hat gedacht'),
      v('kennen', 'kennen', '认识、熟悉', 'kannte · hat gekannt'),
      v('wissen', 'wissen', '知道', 'wusste · hat gewusst'),
      v('verstehen', 'verstehen', '理解', 'verstand · hat verstanden')
    ]
  },
  {
    id: 'verbPrep',
    title: '动词 + 介词',
    hint: '德语搭配题的高频考点，介词后面接第几格要一起记',
    items: [
      vp('warten-auf', 'warten auf', '等待', '+ 第四格'),
      vp('sich-freuen-auf', 'sich freuen auf', '期待（将来）', '+ 第四格'),
      vp('sich-freuen-ueber', 'sich freuen über', '为（已发生的事）高兴', '+ 第四格'),
      vp('denken-an', 'denken an', '想到、想起', '+ 第四格'),
      vp('sich-interessieren-fuer', 'sich interessieren für', '对…感兴趣', '+ 第四格'),
      vp('sich-beschaeftigen-mit', 'sich beschäftigen mit', '从事、忙于', '+ 第三格'),
      vp('teilnehmen-an', 'teilnehmen an', '参加', '+ 第三格'),
      vp('abhaengen-von', 'abhängen von', '取决于', '+ 第三格'),
      vp('gehoeren-zu', 'gehören zu', '属于', '+ 第三格'),
      vp('sich-erinnern-an', 'sich erinnern an', '记得', '+ 第四格'),
      vp('bitten-um', 'bitten um', '请求', '+ 第四格'),
      vp('achten-auf', 'achten auf', '注意', '+ 第四格'),
      vp('sich-aergern-ueber', 'sich ärgern über', '为…生气', '+ 第四格'),
      vp('sprechen-ueber', 'sprechen über', '谈论（话题）', '+ 第四格'),
      vp('sprechen-von', 'sprechen von', '谈到（提及）', '+ 第三格'),
      vp('sorgen-fuer', 'sorgen für', '照顾、负责', '+ 第四格'),
      vp('sich-bewerben-um', 'sich bewerben um', '申请', '+ 第四格'),
      vp('leiden-unter', 'leiden unter', '受…之苦', '+ 第三格'),
      vp('sich-entscheiden-fuer', 'sich entscheiden für', '决定选择', '+ 第四格'),
      vp('sich-verabreden-mit', 'sich verabreden mit', '与…约好', '+ 第三格')
    ]
  },
  {
    id: 'adjPrep',
    title: '形容词 + 介词',
    hint: '写作和口语里很常用，记搭配也记格',
    items: [
      ap('interessiert-an', 'interessiert an', '对…感兴趣', '+ 第三格'),
      ap('zufrieden-mit', 'zufrieden mit', '对…满意', '+ 第三格'),
      ap('stolz-auf', 'stolz auf', '为…骄傲', '+ 第四格'),
      ap('abhaengig-von', 'abhängig von', '依赖于', '+ 第三格'),
      ap('bereit-zu', 'bereit zu', '准备好做…', '+ 第三格'),
      ap('verantwortlich-fuer', 'verantwortlich für', '对…负责', '+ 第四格'),
      ap('bekannt-fuer', 'bekannt für', '以…闻名', '+ 第四格'),
      ap('reich-an', 'reich an', '富有…', '+ 第三格'),
      ap('muede-von', 'müde von', '对…厌倦', '+ 第三格'),
      ap('nett-zu', 'nett zu', '对…友好', '+ 第三格'),
      ap('froh-ueber', 'froh über', '为…高兴', '+ 第四格'),
      ap('gespannt-auf', 'gespannt auf', '期待…', '+ 第四格')
    ]
  }
]

export function findKnowledge(id: string): KnowledgeItem | undefined {
  for (const c of KNOWLEDGE) {
    const hit = c.items.find((i) => i.id === id)
    if (hit) return hit
  }
  return undefined
}
