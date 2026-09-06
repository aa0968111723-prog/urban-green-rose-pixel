import type { Question } from "../types.ts";

export const QUESTIONS: readonly Question[] = [
  {
    id: 1,
    category: "社團危機",
    question: "你們明天就要交社團企劃，負責重要部分的組員突然整天不讀訊息。你會先怎麼做？",
    options: [
      {
        key: "A",
        text: "先把剩下工作拆開，確認今晚最低限度一定要完成哪些。",
        scores: { vision: 1, empathy: 0, decision: 3, crisis: 1 },
      },
      {
        key: "B",
        text: "先私訊問他是不是發生什麼事，確認狀況後再決定怎麼分工。",
        scores: { vision: 0, empathy: 3, decision: 1, crisis: 1 },
      },
      {
        key: "C",
        text: "直接想一個沒有他也能成立的備案，避免整個企劃被一個人卡住。",
        scores: { vision: 1, empathy: 0, decision: 1, crisis: 3 },
      },
      {
        key: "D",
        text: "趁這次重新整理整份企劃，看看是不是原本分工方式就有問題。",
        scores: { vision: 3, empathy: 1, decision: 1, crisis: 0 },
      },
    ],
  },
  {
    id: 2,
    category: "會議現場",
    question: "社團開會時，兩個幹部為了活動方向越講越火大，氣氛開始很僵。你最可能：",
    options: [
      {
        key: "A",
        text: "先讓雙方把真正介意的事情講完，確認兩邊其實在擔心什麼。",
        scores: { vision: 1, empathy: 3, decision: 0, crisis: 1 },
      },
      {
        key: "B",
        text: "把目前爭議整理成兩三個選項，直接決定今天一定要處理哪一個。",
        scores: { vision: 0, empathy: 1, decision: 3, crisis: 1 },
      },
      {
        key: "C",
        text: "提出第三種做法，看看能不能跳脫兩邊現在的選項。",
        scores: { vision: 1, empathy: 1, decision: 0, crisis: 3 },
      },
      {
        key: "D",
        text: "把討論拉回：「我們這場活動到底最想讓新生得到什麼？」",
        scores: { vision: 3, empathy: 1, decision: 1, crisis: 0 },
      },
    ],
  },
  {
    id: 3,
    category: "預算警報",
    question: "原本活動有 12,000 元，結果突然只剩 6,000 元。你第一反應會是：",
    options: [
      {
        key: "A",
        text: "重新排優先順序，哪些是活動核心、哪些其實可以拿掉。",
        scores: { vision: 3, empathy: 0, decision: 1, crisis: 1 },
      },
      {
        key: "B",
        text: "立刻重做預算表，先把能執行的版本定下來。",
        scores: { vision: 1, empathy: 0, decision: 3, crisis: 1 },
      },
      {
        key: "C",
        text: "開始找替代方案：借器材、換場地、合作、找免費資源。",
        scores: { vision: 1, empathy: 0, decision: 1, crisis: 3 },
      },
      {
        key: "D",
        text: "先跟大家討論，確認大家最不希望被犧牲的是哪一部分。",
        scores: { vision: 1, empathy: 3, decision: 1, crisis: 0 },
      },
    ],
  },
  {
    id: 4,
    category: "宣傳日常",
    question: "你們花很多時間做的活動貼文，發出去兩天互動還是超低。你會：",
    options: [
      {
        key: "A",
        text: "直接重做標題、首圖與宣傳方式，再測另一個版本。",
        scores: { vision: 1, empathy: 0, decision: 1, crisis: 3 },
      },
      {
        key: "B",
        text: "去問幾個真的屬於目標族群的同學：「你看到這篇會想參加嗎？為什麼？」",
        scores: { vision: 1, empathy: 3, decision: 0, crisis: 1 },
      },
      {
        key: "C",
        text: "重新思考：我們到底在吸引誰？活動賣點是不是一開始就沒講清楚？",
        scores: { vision: 3, empathy: 1, decision: 1, crisis: 0 },
      },
      {
        key: "D",
        text: "今天就排出新的宣傳行動，限動、班群、朋友轉發、現場宣傳一起做。",
        scores: { vision: 0, empathy: 1, decision: 3, crisis: 1 },
      },
    ],
  },
  {
    id: 5,
    category: "課業警報",
    question: "下週要辦你很期待的社團活動，結果教授突然宣布同一週要考很重的考試。你會：",
    options: [
      {
        key: "A",
        text: "立刻把接下來每天能用的時間排出來，先決定哪些事情必須今天開始做。",
        scores: { vision: 1, empathy: 0, decision: 3, crisis: 1 },
      },
      {
        key: "B",
        text: "重新看整週安排，找出課業和活動能不能重新分配優先順序。",
        scores: { vision: 3, empathy: 0, decision: 1, crisis: 1 },
      },
      {
        key: "C",
        text: "和夥伴說明自己的狀況，看看哪些工作能交換或一起完成。",
        scores: { vision: 1, empathy: 3, decision: 1, crisis: 0 },
      },
      {
        key: "D",
        text: "直接改變原本做法，把能簡化的事情全部簡化，先求兩邊都過關。",
        scores: { vision: 1, empathy: 0, decision: 1, crisis: 3 },
      },
    ],
  },
  {
    id: 6,
    category: "宿舍日常",
    question: "你的室友習慣半夜聊天、打遊戲，但你隔天常有早八。你比較可能：",
    options: [
      {
        key: "A",
        text: "找一個大家心情都還好的時間，談談彼此能接受的作息界線。",
        scores: { vision: 1, empathy: 3, decision: 1, crisis: 0 },
      },
      {
        key: "B",
        text: "直接提出一個具體方案，例如晚上 12 點後戴耳機、聊天去公共空間。",
        scores: { vision: 0, empathy: 1, decision: 3, crisis: 1 },
      },
      {
        key: "C",
        text: "先想替代做法，像耳塞、自習室、換位置，降低每天衝突。",
        scores: { vision: 0, empathy: 1, decision: 1, crisis: 3 },
      },
      {
        key: "D",
        text: "希望大家一起定一套長期生活規則，不要每次出問題才重新吵一次。",
        scores: { vision: 3, empathy: 1, decision: 1, crisis: 0 },
      },
    ],
  },
  {
    id: 7,
    category: "社博現場",
    question: "社博一整排社團都在招人，你覺得好多都很有趣，但時間有限。你會：",
    options: [
      {
        key: "A",
        text: "先想：我希望大學四年後的自己多會什麼、多認識什麼？",
        scores: { vision: 3, empathy: 1, decision: 1, crisis: 0 },
      },
      {
        key: "B",
        text: "直接挑幾個最有感覺的攤位去聊，聊完就決定要不要加入。",
        scores: { vision: 0, empathy: 1, decision: 3, crisis: 1 },
      },
      {
        key: "C",
        text: "觀察攤位上的人相處起來舒不舒服，因為你很在意一起做事的人。",
        scores: { vision: 1, empathy: 3, decision: 1, crisis: 0 },
      },
      {
        key: "D",
        text: "先每個有興趣的都掃 QR Code，回家再慢慢比較，保留最多可能性。",
        scores: { vision: 1, empathy: 0, decision: 1, crisis: 3 },
      },
    ],
  },
  {
    id: 8,
    category: "課堂分組",
    question: "老師突然說：「現在自由分組。」你環顧教室，一個熟人都沒有。你會：",
    options: [
      {
        key: "A",
        text: "直接走向看起來還缺人的組：「你們還缺人嗎？」",
        scores: { vision: 0, empathy: 1, decision: 3, crisis: 1 },
      },
      {
        key: "B",
        text: "先看看有沒有人也落單，主動找他一起。",
        scores: { vision: 0, empathy: 3, decision: 1, crisis: 1 },
      },
      {
        key: "C",
        text: "觀察一下每組看起來在做什麼，選一個自己真的想投入的方向。",
        scores: { vision: 3, empathy: 1, decision: 1, crisis: 0 },
      },
      {
        key: "D",
        text: "乾脆自己先開一組，再邀請其他還沒有組的人加入。",
        scores: { vision: 1, empathy: 0, decision: 1, crisis: 3 },
      },
    ],
  },
  {
    id: 9,
    category: "課業警報",
    question: "成績公布，你發現某科如果期中再考差，真的可能被當。你會：",
    options: [
      {
        key: "A",
        text: "今天就整理考試範圍，安排接下來每天要讀多少。",
        scores: { vision: 1, empathy: 0, decision: 3, crisis: 1 },
      },
      {
        key: "B",
        text: "先找同學、學長姐或助教，確認自己到底是哪裡沒有搞懂。",
        scores: { vision: 0, empathy: 3, decision: 1, crisis: 1 },
      },
      {
        key: "C",
        text: "重新設計自己的讀書方式，原本的方法沒用就直接換一套。",
        scores: { vision: 1, empathy: 0, decision: 1, crisis: 3 },
      },
      {
        key: "D",
        text: "回頭找這科最核心的概念，不要再只追著每週進度跑。",
        scores: { vision: 3, empathy: 0, decision: 1, crisis: 1 },
      },
    ],
  },
  {
    id: 10,
    category: "迎新現場",
    question:
      "迎新活動開始十分鐘，新生大家都坐得很安靜，主持人丟梗也沒什麼反應。如果你在工作人員裡，你會：",
    options: [
      {
        key: "A",
        text: "先找幾位比較害羞的新生聊天，讓大家慢慢有安全感。",
        scores: { vision: 0, empathy: 3, decision: 1, crisis: 1 },
      },
      {
        key: "B",
        text: "馬上換掉現在的流程，改成簡單、低壓力、人人都能參與的小活動。",
        scores: { vision: 0, empathy: 1, decision: 1, crisis: 3 },
      },
      {
        key: "C",
        text: "直接請工作人員分散加入各桌，把現場互動先帶起來。",
        scores: { vision: 0, empathy: 1, decision: 3, crisis: 1 },
      },
      {
        key: "D",
        text: "觀察大家為什麼冷，判斷是活動太陌生、太尷尬，還是現場氣氛和預期不同，再調整整體節奏。",
        scores: { vision: 3, empathy: 1, decision: 0, crisis: 1 },
      },
    ],
  },
];

export const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
