import type { GrammarTopic } from '../shared/types'

/**
 * 内置德语语法手册（离线数据，不消耗 API）。
 * 覆盖 A1–C1 的 28 个语法点，含变位 / 变格 / 对照表格。
 */
export const GRAMMAR_TOPICS: GrammarTopic[] = [
  // ================= A1 =================
  {
    id: 'artikel',
    level: 'A1',
    title: '名词的性与定冠词',
    summary: '德语名词都有语法性别：阳性 der、阴性 die、中性 das，必须和名词一起记。',
    points: [
      '所有德语名词首字母都要大写。',
      '语法性别与自然性别无关：das Mädchen（女孩）是中性，der Junge（男孩）是阳性。',
      '背单词时一定要连冠词一起背：der Tisch，而不是 Tisch。'
    ],
    tables: [
      {
        caption: '定冠词变格',
        headers: ['格', '阳性', '阴性', '中性', '复数'],
        rows: [
          ['第一格 Nominativ', 'der', 'die', 'das', 'die'],
          ['第二格 Genitiv', 'des', 'der', 'des', 'der'],
          ['第三格 Dativ', 'dem', 'der', 'dem', 'den'],
          ['第四格 Akkusativ', 'den', 'die', 'das', 'die']
        ],
        note: '只有阳性在第四格变成 den，其余三格才出现明显变化。'
      }
    ],
    examples: [
      { de: 'Der Tisch ist neu.', zh: '这张桌子是新的。' },
      { de: 'Die Lampe ist kaputt.', zh: '这盏灯坏了。' },
      { de: 'Das Buch gehört mir.', zh: '这本书是我的。' }
    ],
    pitfalls: [
      '不要按中文或英文去猜性别。',
      '常见规律：-ung / -heit / -keit / -schaft 多为阴性；-er / -en 多为阳性；-chen / -lein 为中性。'
    ]
  },
  {
    id: 'unbestimmt',
    level: 'A1',
    title: '不定冠词 ein / eine',
    summary: '第一次提到、不确定的人或物用 ein / eine。',
    points: [
      '阳性 ein、中性 ein、阴性 eine。',
      '复数没有不定冠词，直接用名词。',
      '否定不定冠词用 kein（见「否定」一节）。'
    ],
    tables: [
      {
        caption: '不定冠词变格',
        headers: ['格', '阳性', '阴性', '中性'],
        rows: [
          ['第一格', 'ein', 'eine', 'ein'],
          ['第二格', 'eines', 'einer', 'eines'],
          ['第三格', 'einem', 'einer', 'einem'],
          ['第四格', 'einen', 'eine', 'ein']
        ]
      }
    ],
    examples: [
      { de: 'Das ist ein Apfel.', zh: '这是一个苹果。' },
      { de: 'Ich habe eine Frage.', zh: '我有一个问题。' },
      { de: 'Wir brauchen noch ein Zimmer.', zh: '我们还需要一个房间。' }
    ]
  },
  {
    id: 'plural',
    level: 'A1',
    title: '名词复数',
    summary: '德语复数没有统一规则，要连同冠词一起记；复数定冠词永远是 die。',
    points: [
      '常见词尾：-e、-er、-n/-en、-s，少数不变。',
      '部分名词要变音：Apfel → Äpfel，Haus → Häuser。',
      '外来词多用 -s 结尾。'
    ],
    tables: [
      {
        caption: '常见复数类型',
        headers: ['类型', '示例', '说明'],
        rows: [
          ['-e', 'der Tisch → die Tische', '最常见，多为阳性'],
          ['-er', 'das Kind → die Kinder', '多为中性'],
          ['-n / -en', 'die Frau → die Frauen', '多为阴性'],
          ['-s', 'das Auto → die Autos', '外来词'],
          ['变音 + -e', 'der Apfel → die Äpfel', 'a / o / u 元音常变音'],
          ['不变', 'der Lehrer → die Lehrer', '多为 -er 结尾阳性']
        ]
      }
    ],
    examples: [
      { de: 'Die Kinder spielen im Garten.', zh: '孩子们在花园里玩。' },
      { de: 'Ich kaufe zwei Äpfel.', zh: '我买两个苹果。' }
    ]
  },
  {
    id: 'pronomen',
    level: 'A1',
    title: '人称代词',
    summary: '主格人称代词要跟动词变位一起背，同时记住第四格和第三格形式。',
    points: [
      '主格作主语，第四格作直接宾语，第三格作间接宾语。',
      'Sie（您 / 您们）在任何位置都大写。',
      '第三人称单数按名词的语法性别选 er / sie / es。'
    ],
    tables: [
      {
        caption: '人称代词三格对照',
        headers: ['人称', '主格', '第四格', '第三格'],
        rows: [
          ['我', 'ich', 'mich', 'mir'],
          ['你', 'du', 'dich', 'dir'],
          ['他', 'er', 'ihn', 'ihm'],
          ['她', 'sie', 'sie', 'ihr'],
          ['它（中性）', 'es', 'es', 'ihm'],
          ['我们', 'wir', 'uns', 'uns'],
          ['你们', 'ihr', 'euch', 'euch'],
          ['他们', 'sie', 'sie', 'ihnen'],
          ['您 / 您们', 'Sie', 'Sie', 'Ihnen']
        ]
      }
    ],
    examples: [
      { de: 'Ich komme aus China.', zh: '我来自中国。' },
      { de: 'Woher kommt ihr?', zh: '你们来自哪里？' },
      { de: 'Sie wohnt in Berlin.', zh: '她住在柏林。' }
    ]
  },
  {
    id: 'praesens',
    level: 'A1',
    title: '动词现在时变位',
    summary: '规则动词＝词干＋词尾，注意 du 和 er/sie/es 的特殊变化。',
    points: [
      '词尾：-e, -st, -t, -en, -t, -en。',
      '词干以 -t / -d 结尾时加 e：du arbeitest, er arbeitet。',
      '部分动词变音或换音：fahren → du fährst；nehmen → du nimmst。'
    ],
    tables: [
      {
        caption: '规则动词变形示例',
        headers: ['人称', 'lernen', 'fahren（变音）', 'arbeiten（加 e）'],
        rows: [
          ['ich', 'lerne', 'fahre', 'arbeite'],
          ['du', 'lernst', 'fährst', 'arbeitest'],
          ['er / sie / es', 'lernt', 'fährt', 'arbeitet'],
          ['wir', 'lernen', 'fahren', 'arbeiten'],
          ['ihr', 'lernt', 'fahrt', 'arbeitet'],
          ['sie / Sie', 'lernen', 'fahren', 'arbeiten']
        ]
      }
    ],
    examples: [
      { de: 'Ich lerne Deutsch.', zh: '我学德语。' },
      { de: 'Du arbeitest viel.', zh: '你工作很多。' },
      { de: 'Er fährt nach Hause.', zh: '他开车回家。' }
    ]
  },
  {
    id: 'sein-haben',
    level: 'A1',
    title: 'sein 与 haben',
    summary: '两个最常用的不规则动词，必须背熟；它们同时也是完成时的助动词。',
    points: ['sein 表示「是、存在」，haben 表示「有」。', '两者都是完成时助动词。'],
    tables: [
      {
        caption: '变位对照',
        headers: ['人称', 'sein', 'haben'],
        rows: [
          ['ich', 'bin', 'habe'],
          ['du', 'bist', 'hast'],
          ['er / sie / es', 'ist', 'hat'],
          ['wir', 'sind', 'haben'],
          ['ihr', 'seid', 'habt'],
          ['sie / Sie', 'sind', 'haben']
        ]
      }
    ],
    examples: [
      { de: 'Ich bin Student.', zh: '我是学生。' },
      { de: 'Hast du Zeit?', zh: '你有时间吗？' },
      { de: 'Wir sind müde.', zh: '我们累了。' }
    ]
  },
  {
    id: 'negation',
    level: 'A1',
    title: '否定：nicht 与 kein',
    summary: '否定名词用 kein，否定动作、形容词、整句用 nicht。',
    points: [
      'kein 按名词的性变化：kein / keine / kein，复数 keine。',
      'nicht 一般放在句末；否定某个成分时放在它前面。',
      '名词前是不定冠词时用 kein 否定，是定冠词或物主冠词时用 nicht。'
    ],
    tables: [
      {
        caption: '怎么选',
        headers: ['情况', '用哪个', '例句'],
        rows: [
          ['名词前是不定冠词 / 无冠词', 'kein', 'Ich habe kein Geld.'],
          ['名词前是定冠词 / 物主冠词', 'nicht', 'Das ist nicht mein Buch.'],
          ['否定动作、形容词', 'nicht（多放句末）', 'Er kommt nicht.'],
          ['否定某个特定成分', 'nicht 放在该成分前', 'Nicht er kommt, sondern sie.']
        ],
        note: 'kein 的变格跟 ein 一样：keinen / keine / kein / keine。'
      }
    ],
    examples: [
      { de: 'Ich habe kein Geld.', zh: '我没有钱。' },
      { de: 'Das ist nicht mein Buch.', zh: '这不是我的书。' },
      { de: 'Er kommt heute nicht.', zh: '他今天不来。' }
    ],
    pitfalls: ['不要说 „Ich habe nicht Geld“——名词要用 kein 否定。']
  },
  {
    id: 'wortstellung',
    level: 'A1',
    title: '陈述句语序：动词第二位',
    summary: '陈述句里，变位动词永远在第二位。',
    points: [
      '主语可以在第一位；把时间、地点放第一位时，动词仍在第二位，主语后移。',
      '多个状语的常见顺序：时间 → 方式 → 地点。',
      '否定词或副词放句首时，同样遵守「动词第二位」。'
    ],
    tables: [
      {
        caption: '位置安排',
        headers: ['成分', '位置', '示例'],
        rows: [
          ['主语', '第一位', 'Ich fahre morgen nach Berlin.'],
          ['时间 / 地点状语', '可换到第一位', 'Morgen fahre ich nach Berlin.'],
          ['变位动词', '第二位（固定）', 'Heute kommt er nicht.'],
          ['其他成分', '第三位起', '… nach Berlin / nicht.']
        ]
      }
    ],
    examples: [
      { de: 'Ich fahre morgen nach Berlin.', zh: '我明天去柏林。' },
      { de: 'Morgen fahre ich nach Berlin.', zh: '明天我去柏林。' },
      { de: 'Heute kommt er nicht.', zh: '他今天不来。' }
    ]
  },
  {
    id: 'frage',
    level: 'A1',
    title: '疑问句',
    summary: '一般疑问句把动词提到句首；特殊疑问句用 W-词开头，动词仍在第二位。',
    points: [
      '一般疑问句：动词 + 主语 …？回答 Ja / Nein。',
      '回答否定式一般疑问句时，肯定对方可用 doch。',
      'W-词问什么，就把疑问词放第一位，动词放第二位。'
    ],
    tables: [
      {
        caption: '常用 W- 疑问词',
        headers: ['疑问词', '含义', '示例'],
        rows: [
          ['was', '什么', 'Was machst du?'],
          ['wer', '谁', 'Wer ist das?'],
          ['wo', '在哪里', 'Wo wohnst du?'],
          ['wohin', '去哪里', 'Wohin gehst du?'],
          ['woher', '从哪里来', 'Woher kommst du?'],
          ['wann', '什么时候', 'Wann beginnt der Kurs?'],
          ['warum', '为什么', 'Warum lernst du Deutsch?'],
          ['wie', '怎么样', 'Wie geht es dir?']
        ]
      }
    ],
    examples: [
      { de: 'Kommst du mit?', zh: '你一起来吗？' },
      { de: 'Wo wohnst du?', zh: '你住哪儿？' },
      { de: 'Warum lernst du Deutsch?', zh: '你为什么学德语？' }
    ]
  },

  // ================= A2 =================
  {
    id: 'akkusativ',
    level: 'A2',
    title: '第四格（宾格）',
    summary: '直接宾语用第四格；只有阳性冠词会变形。',
    points: [
      '常见第四格动词：haben, kaufen, lesen, sehen, mögen, brauchen。',
      '人称代词第四格：mich, dich, ihn, sie, es, uns, euch, sie。',
      '介词 durch, für, gegen, ohne, um 后面固定接第四格。'
    ],
    tables: [
      {
        caption: '第四格冠词变化',
        headers: ['性', '定冠词', '不定冠词', '物主冠词 (mein)'],
        rows: [
          ['阳性', 'der → den', 'ein → einen', 'mein → meinen'],
          ['阴性', 'die → die', 'eine → eine', 'meine → meine'],
          ['中性', 'das → das', 'ein → ein', 'mein → mein'],
          ['复数', 'die → die', '—', 'meine → meine']
        ],
        note: '记住：只有阳性会变，其他三格原样不动。'
      }
    ],
    examples: [
      { de: 'Ich sehe den Mann.', zh: '我看见那个男人。' },
      { de: 'Kaufst du einen Tisch?', zh: '你买一张桌子吗？' },
      { de: 'Ich mag ihn.', zh: '我喜欢他。' }
    ]
  },
  {
    id: 'dativ',
    level: 'A2',
    title: '第三格（与格）',
    summary: '间接宾语、部分介词后、部分动词支配第三格。',
    points: [
      '常见三格动词：helfen, danken, gefallen, gehören, antworten。',
      '支配第三格的介词：aus, bei, mit, nach, seit, von, zu。',
      '复数名词在第三格要加 -n（die Kinder → den Kindern）。'
    ],
    tables: [
      {
        caption: '第三格冠词变化',
        headers: ['性', '定冠词', '不定冠词', '物主冠词'],
        rows: [
          ['阳性', 'dem', 'einem', 'meinem'],
          ['阴性', 'der', 'einer', 'meiner'],
          ['中性', 'dem', 'einem', 'meinem'],
          ['复数', 'den (+ n)', '—', 'meinen (+ n)']
        ]
      },
      {
        caption: '常接第三格的动词',
        headers: ['动词', '含义', '示例'],
        rows: [
          ['helfen', '帮助', 'Ich helfe dem Kind.'],
          ['danken', '感谢', 'Ich danke dir.'],
          ['gefallen', '喜欢（对某人而言）', 'Das gefällt mir.'],
          ['gehören', '属于', 'Das Buch gehört mir.'],
          ['antworten', '回答', 'Er antwortet dem Lehrer.']
        ]
      }
    ],
    examples: [
      { de: 'Ich helfe dem Kind.', zh: '我帮这个孩子。' },
      { de: 'Das Buch gehört mir.', zh: '这本书是我的。' },
      { de: 'Ich fahre mit dem Bus.', zh: '我坐公交车。' }
    ]
  },
  {
    id: 'possessiv',
    level: 'A2',
    title: '物主冠词',
    summary: 'mein / dein / sein / ihr / unser / euer / Ihr，词尾随后面的名词变化。',
    points: [
      '词干表示所属，词尾表示性、数、格。',
      '阳性第四格：meinen, deinen, seinen …',
      '第三格：meinem, meiner, meinem …'
    ],
    tables: [
      {
        caption: '各人称的物主冠词',
        headers: ['人称', '物主冠词', '含义'],
        rows: [
          ['ich', 'mein', '我的'],
          ['du', 'dein', '你的'],
          ['er / es', 'sein', '他的 / 它的'],
          ['sie', 'ihr', '她的'],
          ['wir', 'unser', '我们的'],
          ['ihr', 'euer', '你们的'],
          ['sie', 'ihr', '他们的'],
          ['Sie', 'Ihr', '您的']
        ],
        note: 'euer 在加词尾时省略中间的 e：eure, euren, eurem。'
      },
      {
        caption: '以 mein 为例的变格',
        headers: ['格', '阳性', '阴性', '中性', '复数'],
        rows: [
          ['第一格', 'mein', 'meine', 'mein', 'meine'],
          ['第二格', 'meines', 'meiner', 'meines', 'meiner'],
          ['第三格', 'meinem', 'meiner', 'meinem', 'meinen'],
          ['第四格', 'meinen', 'meine', 'mein', 'meine']
        ]
      }
    ],
    examples: [
      { de: 'Das ist mein Bruder.', zh: '这是我哥哥。' },
      { de: 'Ich liebe meine Familie.', zh: '我爱我的家人。' },
      { de: 'Wir besuchen unseren Lehrer.', zh: '我们去看望我们的老师。' }
    ]
  },
  {
    id: 'trennbar',
    level: 'A2',
    title: '可分动词',
    summary: '可分前缀在现在时和过去时被放到句末；从句里不分开。',
    points: [
      '完成时的 -ge- 插在前缀和词干之间：aufgestanden。',
      '在从句里，动词要还原成一个词放句末。',
      '不可分前缀（be-, ge-, er-, ver-, zer-, ent-, emp-）永远不分开。'
    ],
    tables: [
      {
        caption: '常见可分前缀',
        headers: ['前缀', '含义', '示例'],
        rows: [
          ['auf-', '向上 / 打开', 'aufstehen 起床'],
          ['an-', '接触 / 朝向', 'anrufen 打电话'],
          ['aus-', '出去 / 结束', 'ausgehen 外出'],
          ['ein-', '进入', 'einkaufen 采购'],
          ['mit-', '一起', 'mitkommen 一起来'],
          ['zu-', '关闭', 'zumachen 关上'],
          ['zurück-', '返回', 'zurückkommen 回来']
        ]
      },
      {
        caption: '同一动词的三种位置',
        headers: ['句型', '写法', '示例'],
        rows: [
          ['现在时', '前缀放句末', 'Ich stehe um sieben auf.'],
          ['完成时', '-ge- 插在中间', 'Ich bin früh aufgestanden.'],
          ['从句', '不分开，放句末', '…, weil ich früh aufstehe.']
        ]
      }
    ],
    examples: [
      { de: 'Ich stehe um sieben auf.', zh: '我七点起床。' },
      { de: 'Er ruft mich an.', zh: '他给我打电话。' },
      { de: 'Ich bin früh aufgestanden.', zh: '我起得很早。' }
    ]
  },
  {
    id: 'modalverben',
    level: 'A2',
    title: '情态动词',
    summary: 'können / müssen / wollen / sollen / dürfen / mögen + 实义动词不定式放句末。',
    points: [
      'ich 和 er / sie / es 形式没有词尾：kann, muss, will。',
      '变位的情态动词在第二位，实义动词以不定式放句末。',
      'möchten 是「想要」的礼貌说法。'
    ],
    tables: [
      {
        caption: '六个情态动词变位',
        headers: ['人称', 'können', 'müssen', 'wollen', 'sollen', 'dürfen', 'mögen'],
        rows: [
          ['ich', 'kann', 'muss', 'will', 'soll', 'darf', 'mag'],
          ['du', 'kannst', 'musst', 'willst', 'sollst', 'darfst', 'magst'],
          ['er / sie / es', 'kann', 'muss', 'will', 'soll', 'darf', 'mag'],
          ['wir', 'können', 'müssen', 'wollen', 'sollen', 'dürfen', 'mögen'],
          ['ihr', 'könnt', 'müsst', 'wollt', 'sollt', 'dürft', 'mögt'],
          ['sie / Sie', 'können', 'müssen', 'wollen', 'sollen', 'dürfen', 'mögen']
        ],
        note: '注意 ich 和 er 同形且无词尾，这是情态动词最大的特点。'
      },
      {
        caption: '礼貌说法 möchten',
        headers: ['人称', 'möchten', '含义'],
        rows: [
          ['ich', 'möchte', '我想要'],
          ['du', 'möchtest', '你想要'],
          ['er / sie / es', 'möchte', '他 / 她想要'],
          ['wir', 'möchten', '我们想要'],
          ['ihr', 'möchtet', '你们想要'],
          ['sie / Sie', 'möchten', '他们 / 您想要']
        ]
      },
      {
        caption: '含义对照',
        headers: ['情态动词', '含义', '示例'],
        rows: [
          ['können', '能够 / 可以', 'Ich kann schwimmen.'],
          ['müssen', '必须', 'Ich muss gehen.'],
          ['wollen', '想要（强意愿）', 'Ich will nach Hause.'],
          ['sollen', '应该（别人要求）', 'Du sollst mehr lernen.'],
          ['dürfen', '被允许', 'Hier darf man rauchen.'],
          ['mögen', '喜欢', 'Ich mag Kaffee.']
        ]
      }
    ],
    examples: [
      { de: 'Ich muss heute arbeiten.', zh: '我今天必须工作。' },
      { de: 'Kannst du mir helfen?', zh: '你能帮我吗？' },
      { de: 'Wir wollen nach Deutschland fahren.', zh: '我们想去德国。' }
    ]
  },
  {
    id: 'perfekt',
    level: 'A2',
    title: '现在完成时',
    summary: 'haben / sein + 过去分词，是口语里最常用的过去时。',
    points: [
      '多数动词用 haben；表示位置移动或状态变化的用 sein。',
      '规则动词过去分词：ge- … -t；不规则：ge- … -en。',
      '不可分动词和 -ieren 结尾的动词不加 ge-。'
    ],
    tables: [
      {
        caption: '过去分词构成',
        headers: ['动词类型', '构成', '示例'],
        rows: [
          ['规则（弱变化）', 'ge- … -t', 'machen → gemacht'],
          ['不规则（强变化）', 'ge- … -en', 'lesen → gelesen'],
          ['可分动词', '前缀 + ge + 词干', 'aufstehen → aufgestanden'],
          ['不可分动词', '不加 ge-', 'besuchen → besucht'],
          ['-ieren 结尾', '不加 ge-', 'studieren → studiert']
        ]
      },
      {
        caption: '助动词怎么选',
        headers: ['助动词', '用于', '示例'],
        rows: [
          ['haben', '绝大多数动词', 'Ich habe gelesen.'],
          ['sein', '位置移动 / 状态变化', 'Ich bin gegangen.'],
          ['sein', 'sein, werden, bleiben', 'Er ist geblieben.']
        ]
      }
    ],
    examples: [
      { de: 'Ich habe das Buch gelesen.', zh: '我读完了这本书。' },
      { de: 'Wir sind nach Hause gegangen.', zh: '我们回家了。' },
      { de: 'Er hat in Berlin studiert.', zh: '他在柏林上过大学。' }
    ]
  },
  {
    id: 'praepositionen',
    level: 'A2',
    title: '介词：静三动四',
    summary: '表示「在哪里」用第三格，表示「去哪里」用第四格。',
    points: [
      '九个双向介词：an, auf, in, über, unter, vor, hinter, neben, zwischen。',
      'wo? → 第三格；wohin? → 第四格。',
      '常见缩合：in dem = im，an dem = am，in das = ins。'
    ],
    tables: [
      {
        caption: '九个双向介词',
        headers: ['介词', 'wo?（第三格）', 'wohin?（第四格）'],
        rows: [
          ['in', 'im Zimmer', 'ins Zimmer'],
          ['an', 'an der Wand', 'an die Wand'],
          ['auf', 'auf dem Tisch', 'auf den Tisch'],
          ['über', 'über dem Bett', 'über das Bett'],
          ['unter', 'unter dem Stuhl', 'unter den Stuhl'],
          ['vor', 'vor der Tür', 'vor die Tür'],
          ['hinter', 'hinter dem Haus', 'hinter das Haus'],
          ['neben', 'neben dem Sofa', 'neben das Sofa'],
          ['zwischen', 'zwischen den Stühlen', 'zwischen die Stühle']
        ],
        note: '判断方法：句子能不能回答 wo（静止位置）还是 wohin（方向移动）。'
      },
      {
        caption: '固定搭配的介词',
        headers: ['格', '介词', '示例'],
        rows: [
          ['第三格', 'aus, bei, mit, nach, seit, von, zu', 'mit dem Bus'],
          ['第四格', 'durch, für, gegen, ohne, um', 'für den Freund']
        ]
      }
    ],
    examples: [
      { de: 'Das Buch liegt auf dem Tisch.', zh: '书在桌上。（静态，三格）' },
      { de: 'Ich lege das Buch auf den Tisch.', zh: '我把书放桌上。（动态，四格）' },
      { de: 'Wir gehen ins Kino.', zh: '我们去电影院。' }
    ]
  },
  {
    id: 'adjektiv',
    level: 'A2',
    title: '形容词词尾变化',
    summary: '形容词作定语时必须加词尾，取决于冠词类型、性、数、格。',
    points: [
      '定冠词后：以 -e、-en 为主。',
      '不定冠词后：混合变化。',
      '无冠词时用强变化，词尾独自承担全部语法信息。'
    ],
    tables: [
      {
        caption: '定冠词后（der gute …）',
        headers: ['格', '阳性', '阴性', '中性', '复数'],
        rows: [
          ['第一格', 'der gute Wein', 'die gute Suppe', 'das gute Brot', 'die guten Weine'],
          ['第二格', 'des guten Weins', 'der guten Suppe', 'des guten Brotes', 'der guten Weine'],
          ['第三格', 'dem guten Wein', 'der guten Suppe', 'dem guten Brot', 'den guten Weinen'],
          ['第四格', 'den guten Wein', 'die gute Suppe', 'das gute Brot', 'die guten Weine']
        ],
        note: '规律：第一格单数用 -e，其余几乎全是 -en。'
      },
      {
        caption: '不定冠词后（混合变化）',
        headers: ['格', '阳性', '阴性', '中性'],
        rows: [
          ['第一格', 'ein guter Wein', 'eine gute Suppe', 'ein gutes Brot'],
          ['第四格', 'einen guten Wein', 'eine gute Suppe', 'ein gutes Brot'],
          ['第三格', 'einem guten Wein', 'einer guten Suppe', 'einem guten Brot']
        ],
        note: '没有冠词时词尾要「接管」冠词的信息：guter Wein / gute Suppe / gutes Brot。'
      }
    ],
    examples: [
      { de: 'Das ist ein neues Auto.', zh: '这是一辆新车。' },
      { de: 'Ich habe den neuen Lehrer gesehen.', zh: '我见过那位新老师。' },
      { de: 'Ich trinke kalten Kaffee.', zh: '我喝冷咖啡。' }
    ]
  },

  // ================= B1 =================
  {
    id: 'nebensatz',
    level: 'B1',
    title: '从句：dass / weil / wenn',
    summary: '从句里变位动词放到句末。',
    points: [
      '主句 + 从句时，从句前要加逗号，动词放最后。',
      'weil 后是末位动词；denn 后是正常语序（动词第二位）。',
      '从句在前时，主句的变位动词紧跟在逗号后（主句动词仍在第二位）。'
    ],
    tables: [
      {
        caption: '常用连词与语序',
        headers: ['连词', '含义', '语序'],
        rows: [
          ['dass', '（宾语从句）', '动词句末'],
          ['weil', '因为', '动词句末'],
          ['denn', '因为', '正常语序（动词第二位）'],
          ['wenn', '如果 / 每当', '动词句末'],
          ['obwohl', '虽然', '动词句末'],
          ['als', '当…时（过去一次）', '动词句末'],
          ['damit', '为了', '动词句末']
        ],
        note: 'denn 是个例外：它后面仍是正常语序，所以不能和 weil 混用规则。'
      }
    ],
    examples: [
      { de: 'Ich weiß, dass er krank ist.', zh: '我知道他病了。' },
      { de: 'Ich bleibe zu Hause, weil es regnet.', zh: '因为下雨，我待在家里。' },
      { de: 'Wenn ich Zeit habe, komme ich.', zh: '我有时间就来。' }
    ]
  },
  {
    id: 'relativsatz',
    level: 'B1',
    title: '关系从句',
    summary: '关系代词的性、数跟先行词一致，格由它在从句中的作用决定。',
    points: [
      '关系代词变格同定冠词，但第二格和第三格复数特殊（deren / denen）。',
      '从句动词放在句末。',
      '介词 + 关系代词：mit dem, über die。'
    ],
    tables: [
      {
        caption: '关系代词变格',
        headers: ['格', '阳性', '阴性', '中性', '复数'],
        rows: [
          ['第一格', 'der', 'die', 'das', 'die'],
          ['第二格', 'dessen', 'deren', 'dessen', 'deren'],
          ['第三格', 'dem', 'der', 'dem', 'denen'],
          ['第四格', 'den', 'die', 'das', 'die']
        ],
        note: '第二格和第三格复数是重点：deren（其）、denen（给它们）。'
      },
      {
        caption: '怎么选格',
        headers: ['从句里的作用', '用什么格', '示例'],
        rows: [
          ['作主语', '第一格', 'Der Mann, der dort steht, …'],
          ['作直接宾语', '第四格', 'Das Buch, das ich lese, …'],
          ['作间接宾语', '第三格', 'Der Mann, dem ich helfe, …'],
          ['表所属', '第二格', 'Die Frau, deren Sohn …']
        ]
      }
    ],
    examples: [
      { de: 'Der Mann, der dort steht, ist mein Lehrer.', zh: '站在那儿的男人是我老师。' },
      { de: 'Das Buch, das ich lese, ist spannend.', zh: '我在读的这本书很有趣。' },
      { de: 'Die Frau, der ich helfe, ist nett.', zh: '我帮忙的那位女士很友好。' }
    ]
  },
  {
    id: 'passiv',
    level: 'B1',
    title: '被动语态',
    summary: 'werden + 过去分词；施动者用 von + 第三格。',
    points: [
      '施动者：von + 第三格；工具或手段：mit + 第三格。',
      '无人称被动：Es wird hier viel gearbeitet。',
      '被动里更强调动作本身，而不是谁做的。'
    ],
    tables: [
      {
        caption: '各个时态的被动',
        headers: ['时态', '构成', '示例'],
        rows: [
          ['现在时', 'werden + 过去分词', 'Das Haus wird gebaut.'],
          ['过去时', 'wurde + 过去分词', 'Das Haus wurde gebaut.'],
          ['现在完成时', 'ist + 过去分词 + worden', 'Das Haus ist gebaut worden.'],
          ['将来时', 'wird + 过去分词 + werden', 'Das Haus wird gebaut werden.'],
          ['带情态动词', '情态动词 + 过去分词 + werden', 'Das Haus muss gebaut werden.']
        ],
        note: '完成时用 worden（不是 geworden），这是被动特有的形式。'
      }
    ],
    examples: [
      { de: 'Das Haus wird gebaut.', zh: '房子正在建。' },
      { de: 'Das Buch wurde von Goethe geschrieben.', zh: '这本书是歌德写的。' }
    ]
  },
  {
    id: 'konjunktiv2',
    level: 'B1',
    title: '第二虚拟式',
    summary: '表达假设、愿望和礼貌请求。',
    points: [
      '最常用形式：würde + 不定式。',
      '高频形态：wäre（sein）、hätte（haben）、könnte（können）。',
      '非现实条件句：Wenn ich Zeit hätte, würde ich kommen。'
    ],
    tables: [
      {
        caption: '常用第二虚拟式形态',
        headers: ['原形', '第二虚拟式', '典型用法'],
        rows: [
          ['sein', 'wäre', '假设：Wenn ich reich wäre …'],
          ['haben', 'hätte', '愿望：Ich hätte gern …'],
          ['können', 'könnte', '礼貌：Könnten Sie …?'],
          ['müssen', 'müsste', '推测：Er müsste jetzt da sein.'],
          ['dürfen', 'dürfte', '推测：Das dürfte stimmen.'],
          ['werden', 'würde', '＋不定式：Ich würde kommen.'],
          ['其他动词', 'würde + 不定式', '最通用']
        ]
      }
    ],
    examples: [
      { de: 'Wenn ich reich wäre, würde ich reisen.', zh: '如果我有钱，我就去旅行。' },
      { de: 'Ich hätte gern einen Kaffee.', zh: '我想要一杯咖啡。' }
    ]
  },
  {
    id: 'infinitiv',
    level: 'B1',
    title: 'zu 不定式与 um … zu',
    summary: 'zu + 不定式可作宾语；um … zu 表示目的。',
    points: [
      '情态动词后不加 zu：Ich muss gehen。',
      '可分动词写成连写：aufzustehen（zu 插在中间）。',
      'um … zu 表目的；ohne … zu 表「没有做某事」。'
    ],
    tables: [
      {
        caption: '常见结构与含义',
        headers: ['结构', '含义', '示例'],
        rows: [
          ['zu + 不定式', '作宾语', 'Ich habe vergessen, ihn anzurufen.'],
          ['um … zu', '为了', 'Ich lerne Deutsch, um zu studieren.'],
          ['ohne … zu', '没有做', 'Er geht, ohne zu grüßen.'],
          ['情态动词后', '不加 zu', 'Ich muss gehen.'],
          ['可分动词', 'zu 插在中间', 'aufzustehen, anzurufen']
        ]
      }
    ],
    examples: [
      { de: 'Ich habe vergessen, ihn anzurufen.', zh: '我忘了给他打电话。' },
      { de: 'Ich lerne Deutsch, um in Deutschland zu studieren.', zh: '我学德语是为了在德国上学。' }
    ]
  },

  // ================= B2 =================
  {
    id: 'passiv-ersatz',
    level: 'B2',
    title: '被动语态的替代形式',
    summary: '书面语常用「sein + zu 不定式」「sich lassen」「-bar 形容词」表达被动。',
    points: [
      'sein + zu + 不定式：表示「能够被 / 必须被」，相当于 können / müssen + 被动。',
      'sich lassen + 不定式：表示「可以被」。',
      '这些形式比 werden 被动更简洁，常见于说明文与公文。'
    ],
    tables: [
      {
        caption: '三种替代形式',
        headers: ['形式', '含义', '示例'],
        rows: [
          ['sein + zu + 不定式', '能够被 / 必须被', 'Das ist leicht zu lösen.'],
          ['sich lassen + 不定式', '可以被', 'Das lässt sich ändern.'],
          ['-bar 形容词', '可…的', 'lesbar, lösbar, machbar'],
          ['-lich 形容词', '可…的', 'verständlich, erhältlich']
        ]
      }
    ],
    examples: [
      { de: 'Das Problem ist leicht zu lösen.', zh: '这个问题很容易解决。' },
      { de: 'Das lässt sich nicht ändern.', zh: '这没法改变。' },
      { de: 'Der Text ist schwer lesbar.', zh: '这篇文章很难读。' }
    ]
  },
  {
    id: 'nominalisierung',
    level: 'B2',
    title: '名词化与动名词',
    summary: '把动词或形容词变成名词，是德语书面语（学术、新闻）的核心特征。',
    points: [
      '动词不定式大写即名词化：das Lesen、das Essen。',
      '名词化后常用介词短语补充施动者或对象：die Lösung des Problems。',
      '名词化让句子更紧凑，但过多会显得生硬，口语里应还原成动词句。'
    ],
    tables: [
      {
        caption: '常见名词化后缀',
        headers: ['后缀', '词性', '示例'],
        rows: [
          ['-ung', '阴性', 'entwickeln → die Entwicklung'],
          ['-heit / -keit', '阴性', 'frei → die Freiheit；möglich → die Möglichkeit'],
          ['-tion', '阴性', 'informieren → die Information'],
          ['-nis', '中性 / 阴性', 'erleben → das Erlebnis'],
          ['不定式大写', '中性', 'lesen → das Lesen']
        ]
      }
    ],
    examples: [
      { de: 'Die Entwicklung der Technik verändert unser Leben.', zh: '技术的发展改变了我们的生活。' },
      { de: 'Nach dem Essen gehen wir spazieren.', zh: '吃完饭我们去散步。' }
    ],
    pitfalls: ['写作时不要整段名词化，读起来会像公文；适当用动词句更自然。']
  },
  {
    id: 'modal-subjektiv',
    level: 'B2',
    title: '情态动词的主观用法',
    summary: '情态动词除了「能够 / 必须」，还能表达说话人的推测与态度。',
    points: [
      '推测的强弱可以排成一条线：muss > dürfte > kann。',
      'soll 表示「据说」，wollen 表示「声称」。',
      '这一用法常见于新闻转述和日常推测。'
    ],
    tables: [
      {
        caption: '推测程度对照',
        headers: ['情态动词', '推测程度', '示例'],
        rows: [
          ['muss', '几乎可以肯定', 'Er muss krank sein.'],
          ['dürfte', '很可能', 'Er dürfte krank sein.'],
          ['kann', '有可能', 'Er kann krank sein.'],
          ['soll', '据说', 'Er soll krank sein.'],
          ['will', '声称', 'Er will nichts gewusst haben.']
        ]
      }
    ],
    examples: [
      { de: 'Sie muss den Zug verpasst haben.', zh: '她一定是错过火车了。' },
      { de: 'Das dürfte stimmen.', zh: '这大概是对的。' }
    ]
  },

  // ================= C1 =================
  {
    id: 'partizipial',
    level: 'C1',
    title: '分词结构与扩展定语',
    summary: '用分词短语代替关系从句，是德语书面语（论文、新闻）最典型的压缩手段。',
    points: [
      '现在分词（Partizip I）表主动、正在发生；过去分词（Partizip II）表被动、已完成。',
      '扩展定语：成分夹在冠词和名词之间。',
      '阅读时先定位名词，再把前面的分词结构「还原」成关系从句。'
    ],
    tables: [
      {
        caption: '分词构成',
        headers: ['形式', '构成', '含义 / 示例'],
        rows: [
          ['现在分词 Partizip I', '不定式 + d', 'laufend 正在跑的'],
          ['过去分词 Partizip II', 'ge-…-t / ge-…-en', 'gemacht 被做的'],
          ['扩展定语', '冠词 + 分词短语 + 名词', 'die von der Regierung beschlossenen Maßnahmen'],
          ['还原方法', '分词结构 → 关系从句', 'die Maßnahmen, die … beschlossen wurden']
        ]
      }
    ],
    examples: [
      { de: 'Die von der Regierung beschlossenen Maßnahmen treten morgen in Kraft.', zh: '政府通过的措施明天生效。' },
      { de: 'Die in Berlin studierenden Studenten wohnen oft in einer WG.', zh: '在柏林上学的学生常合租。' }
    ],
    pitfalls: ['扩展定语超过 4–5 个词时阅读会非常吃力，写作时建议拆回关系从句。']
  },
  {
    id: 'konjunktiv2-vergangenheit',
    level: 'C1',
    title: '第二虚拟式的过去时',
    summary: '表达「本来会 / 本该做却没做」的非现实过去。',
    points: [
      '形式：hätte / wäre + 过去分词。',
      '常与 gern、fast、beinahe 连用，表示遗憾或未实现的愿望。',
      '非现实条件句的过去：Wenn ich Zeit gehabt hätte, wäre ich gekommen。'
    ],
    tables: [
      {
        caption: '过去虚拟式构成',
        headers: ['原形', '过去虚拟式', '含义'],
        rows: [
          ['machen', 'hätte gemacht', '本来会做'],
          ['gehen', 'wäre gegangen', '本来会去'],
          ['sehen', 'hätte gesehen', '本来会看到'],
          ['können', 'hätte können', '本来能够'],
          ['helfen', 'hätte geholfen', '本来会帮忙']
        ],
        note: '判断助动词跟完成时一样：位置移动 / 状态变化用 wäre，其余用 hätte。'
      }
    ],
    examples: [
      { de: 'Ich hätte dir geholfen, aber du hast nicht gefragt.', zh: '我本来会帮你的，但你没问。' },
      { de: 'Beinahe wäre ich zu spät gekommen.', zh: '我差点就迟到了。' }
    ]
  },
  {
    id: 'konnektoren',
    level: 'C1',
    title: '连接副词与篇章衔接',
    summary: '掌握 dennoch / allerdings / folglich 这类副词，写作才有层次。',
    points: [
      '这类副词放句首时，变位动词仍在第二位，主语后移。',
      '它们让段落之间有明确的逻辑关系，是 C1 写作的关键。',
      '不要和连词（weil, obwohl）混用：连接副词后面是正常主句语序。'
    ],
    tables: [
      {
        caption: '按逻辑关系分类',
        headers: ['关系', '常用副词', '示例'],
        rows: [
          ['转折', 'dennoch, trotzdem, allerdings, jedoch', 'Es regnete, dennoch gingen wir spazieren.'],
          ['因果', 'daher, deshalb, folglich, infolgedessen', 'Er war krank, deshalb blieb er zu Hause.'],
          ['递进', 'zudem, außerdem, darüber hinaus', 'Zudem ist es deutlich billiger.'],
          ['对比', 'einerseits … andererseits', 'Einerseits ist es teuer, andererseits sehr gut.'],
          ['总结', 'insgesamt, zusammenfassend', 'Insgesamt ist das Konzept sinnvoll.']
        ]
      }
    ],
    examples: [
      { de: 'Das Angebot ist gut, allerdings ziemlich teuer.', zh: '这个报价不错，不过相当贵。' },
      { de: 'Es regnete stark, dennoch gingen wir spazieren.', zh: '雨下得很大，我们还是去散步了。' }
    ]
  }
]

export const GRAMMAR_LEVELS: Array<'A1' | 'A2' | 'B1' | 'B2' | 'C1'> = ['A1', 'A2', 'B1', 'B2', 'C1']

export function grammarByLevel(level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'): GrammarTopic[] {
  return GRAMMAR_TOPICS.filter((t) => t.level === level)
}
