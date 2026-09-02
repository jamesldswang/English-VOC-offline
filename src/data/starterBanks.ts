import { WordCategory } from '../types';

export const DEFAULT_STARTER_BANK: WordCategory[] = [
  {
    id: 'starter_jobs',
    category: '💼 職場職務篇 (Jobs & Occupations)',
    list: [
      {
        en: 'software engineer / developer',
        ch: '軟體工程師 / 開發者',
        pos: 'n.',
        kk: '[ˈsɔːftwer ˌendʒɪˈnɪr]',
        icon: '💻',
        exampleEn: 'The software engineer optimized the query speed by forty percent.',
        exampleCh: '軟體工程師將查詢速度提升了百分之四十。'
      },
      {
        en: 'project manager',
        ch: '專案經理',
        pos: 'n.',
        kk: '[ˈprɑːdʒekt ˈmænɪdʒər]',
        icon: '📊',
        exampleEn: 'Our project manager coordinates tasks between design and engineering teams.',
        exampleCh: '我們的專案經理協調設計與工程團隊之間的任務。'
      },
      {
        en: 'entrepreneur',
        ch: '企業家 / 創業家',
        pos: 'n.',
        kk: '[ˌɑːntrəprəˈnɜːr]',
        icon: '🚀',
        exampleEn: 'The young entrepreneur secured venture capital funding for her startup.',
        exampleCh: '這位年輕的創業家為她的新創公司爭取到了創投資金。'
      },
      {
        en: 'accountant',
        ch: '會計師',
        pos: 'n.',
        kk: '[əˈkaʊntənt]',
        icon: '📈',
        exampleEn: 'The accountant carefully verified the quarterly financial audit report.',
        exampleCh: '會計師仔細核對了季度的財務審計報告。'
      },
      {
        en: 'architect',
        ch: '建築師',
        pos: 'n.',
        kk: '[ˈɑːrkɪtekt]',
        icon: '🏛️',
        exampleEn: 'The architect drew blueprints for the eco-friendly skyscraper.',
        exampleCh: '建築師為這座環保摩天大樓繪製了藍圖。'
      },
      {
        en: 'physician / doctor',
        ch: '醫師 / 內科醫生',
        pos: 'n.',
        kk: '[fɪˈzɪʃn]',
        icon: '🩺',
        exampleEn: 'The physician examined the patient thoroughly before prescribing medication.',
        exampleCh: '醫師在開處方藥之前仔細檢查了病患。'
      }
    ]
  },
  {
    id: 'starter_business',
    category: '📈 商務溝通與談判 (Business & Workplace)',
    list: [
      {
        en: 'negotiation',
        ch: '談判 / 協商',
        pos: 'n.',
        kk: '[nɪˌɡoʊʃiˈeɪʃn]',
        icon: '🤝',
        exampleEn: 'The contract negotiation lasted for three intensive weeks.',
        exampleCh: '這場合約談判持續了整整三個緊張的星期。'
      },
      {
        en: 'collaboration',
        ch: '合作 / 協作',
        pos: 'n.',
        kk: '[kəˌlæbəˈreɪʃn]',
        icon: '👥',
        exampleEn: 'Cross-functional collaboration is essential to product innovation.',
        exampleCh: '跨部門協作對於產品創新至關重要。'
      },
      {
        en: 'budget',
        ch: '預算',
        pos: 'n. / v.',
        kk: '[ˈbʌdʒɪt]',
        icon: '💰',
        exampleEn: 'We must allocate our marketing budget wisely across digital channels.',
        exampleCh: '我們必須在各數位管道間明智地分配行銷預算。'
      },
      {
        en: 'presentation',
        ch: '簡報 / 發表',
        pos: 'n.',
        kk: '[ˌpreznˈteɪʃn]',
        icon: '📑',
        exampleEn: 'She delivered an inspiring presentation to the board of directors.',
        exampleCh: '她向董事會發表了一場激勵人心的簡報。'
      },
      {
        en: 'efficiency',
        ch: '效率 / 效能',
        pos: 'n.',
        kk: '[ɪˈfɪʃnsi]',
        icon: '⚡',
        exampleEn: 'Automating repetitive workflows greatly increased team efficiency.',
        exampleCh: '將重複的工作流程自動化大幅提升了團隊效率。'
      }
    ]
  },
  {
    id: 'starter_tech',
    category: '🌐 科技與人工智慧 (Tech & AI)',
    list: [
      {
        en: 'artificial intelligence',
        ch: '人工智慧',
        pos: 'n.',
        kk: '[ˌɑːrtɪˈfɪʃl ɪnˈtelɪdʒəns]',
        icon: '🤖',
        exampleEn: 'Artificial intelligence is transforming modern medical diagnosis.',
        exampleCh: '人工智慧正在改變現代醫療診斷。'
      },
      {
        en: 'algorithm',
        ch: '演算法',
        pos: 'n.',
        kk: '[ˈælɡərɪðəm]',
        icon: '🧠',
        exampleEn: 'The recommendation algorithm personalizes content for every user.',
        exampleCh: '推薦演算法為每位使用者量身訂做個人化內容。'
      },
      {
        en: 'cybersecurity',
        ch: '資訊安全 / 網路安全',
        pos: 'n.',
        kk: '[ˌsaɪbərsɪˈkjʊrəti]',
        icon: '🛡️',
        exampleEn: 'Organizations invest heavily in cybersecurity to protect sensitive data.',
        exampleCh: '各機構大量投資於資訊安全以保護敏感資料。'
      },
      {
        en: 'database',
        ch: '資料庫',
        pos: 'n.',
        kk: '[ˈdeɪtəbeɪs]',
        icon: '🗄️',
        exampleEn: 'The distributed database handles millions of queries per second.',
        exampleCh: '這套分散式資料庫每秒能處理數百萬筆查詢。'
      }
    ]
  }
];
