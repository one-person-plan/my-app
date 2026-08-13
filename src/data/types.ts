export interface OogiriAnswer {
  id: string;
  answerer: string;
  text: string;
  impression: string; // 自分の感想
  favorite?: boolean;
  source?: 'event' | 'answer';
  createdAt: number;
}

export interface OogiriQuestion {
  id: string;
  text: string;
  imageUrl?: string; // optional photo
  answers: OogiriAnswer[];
}

export interface OogiriEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "18:00〜22:00"
  hashtag?: string;
  memo?: string;
  questions: OogiriQuestion[];
  createdAt: number;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

const todayISO = () => new Date().toISOString().slice(0, 10);
const offsetISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// ---- mock data ----
export const initialEvents: OogiriEvent[] = [
  {
    id: 'ev1',
    name: '月イチ大喜利会',
    date: offsetISO(-14),
    time: '19:00〜21:30',
    hashtag: '#月イチ大喜利',
    createdAt: Date.now() - 86400000 * 14,
    questions: [
      {
        id: 'q1',
        text: 'コンビニで一番売れてはいけないもの',
        answers: [
          {
            id: 'a1',
            answerer: '山田',
            text: '「明日の自分への謝罪文」',
            impression: '刺さった。企画に困ったら使い回せそう。',
            createdAt: Date.now() - 86400000 * 14,
          },
          {
            id: 'a2',
            answerer: '佐藤',
            text: '「やる気（賞味期限切れ）」',
            impression: '普遍的で誰が言っても笑える。',
            createdAt: Date.now() - 86400000 * 14,
          },
        ],
      },
      {
        id: 'q2',
        text: '初デートで言ってはいけない一言',
        answers: [
          {
            id: 'a3',
            answerer: '鈴木',
            text: '「ちなみに、僕の前の恋人は」',
            impression: '王道だけどテンポが良かった。',
            createdAt: Date.now() - 86400000 * 14,
          },
        ],
      },
    ],
  },
  {
    id: 'ev2',
    name: 'お試し大喜利ナイト',
    date: offsetISO(-3),
    time: '20:00〜22:00',
    hashtag: '#お試しNight',
    createdAt: Date.now() - 86400000 * 3,
    questions: [
      {
        id: 'q3',
        text: '学校の先生が絶対に言わないセリフ',
        answers: [
          {
            id: 'a4',
            answerer: '高橋',
            text: '「今日は宿題なし。っていうのは嘘。3倍ね」',
            impression: '落差が好き。リズム良く言えた。',
            createdAt: Date.now() - 86400000 * 3,
          },
        ],
      },
    ],
  },
  {
    id: 'ev3',
    name: '夏の大喜利祭り',
    date: offsetISO(10),
    time: '18:00〜22:00',
    hashtag: '#夏祭り大喜利',
    createdAt: Date.now() - 86400000 * 2,
    questions: [],
  },
];
