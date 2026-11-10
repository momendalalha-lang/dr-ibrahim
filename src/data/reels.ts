import type { LocalizedText } from '../types/content';

/**
 * Latest Instagram reels from @dr.ibrahem_musadaq.
 * Thumbnails are stored locally in /public/assets/reels so the marquee
 * never depends on expiring Instagram CDN links.
 * To refresh: re-run the oEmbed fetch and replace this list.
 */
export interface Reel {
  id: string;
  url: string;
  thumb: string;
  caption: LocalizedText;
}

const IG = 'https://www.instagram.com/dr.ibrahem_musadaq';
const reel = (code: string) => `${IG}/reel/${code}/`;

export const instagramProfile = {
  handle: 'dr.ibrahem_musadaq',
  url: IG,
  name: 'Dr.Ibrahem Hamza',
  followers: '3,370',
  following: '1',
  verified: true,
  bio: {
    en: 'M.D. — Health-awareness & educational content. Jordan · UAE · US.',
    ar: 'دكتور في الطب — محتوى صحي تثقيفي وتعليمي. الأردن · الإمارات · أمريكا.',
  },
};

export const reels: Reel[] = [
  {
    id: 'DfKrK6qg6qT',
    url: reel('DfKrK6qg6qT'),
    thumb: 'assets/reels/reel-01-DfKrK6qg6qT.jpg',
    caption: {
      en: 'Don\u2019t quit STEP 1 the moment it feels hard — keep going, you\u2019ll get there.',
      ar: 'لا تترك دراسة الـ STEP1 لمجرد أن بدأت تشعر بالإرهاق — كمل وصدقني ستنجح.',
    },
  },
  {
    id: 'Dd7MlfCAPVj',
    url: reel('Dd7MlfCAPVj'),
    thumb: 'assets/reels/reel-02-Dd7MlfCAPVj.jpg',
    caption: {
      en: 'Dubai — but make it medical. Presented research at ESIM 2026.',
      ar: 'دبي — بطابع طبي. قدّم بحثه في مؤتمر ESIM 2026.',
    },
  },
  {
    id: 'DfN8vbpID4a',
    url: reel('DfN8vbpID4a'),
    thumb: 'assets/reels/reel-03-DfN8vbpID4a.jpg',
    caption: { en: 'Trust in God', ar: 'التوكل على الله' },
  },
  {
    id: 'De6Ty1Tg7ok',
    url: reel('De6Ty1Tg7ok'),
    thumb: 'assets/reels/reel-04-De6Ty1Tg7ok.jpg',
    caption: { en: 'Greatness', ar: 'عظمة' },
  },
  {
    id: 'DexBZf6gOpH',
    url: reel('DexBZf6gOpH'),
    thumb: 'assets/reels/reel-05-DexBZf6gOpH.jpg',
    caption: {
      en: 'Psych case of the day: 25F, mood swings, relationships that end suddenly — what\u2019s the diagnosis?',
      ar: 'حالة نفسية لليوم: شابة 25 سنة، تقلبات مزاج وعلاقات تنتهي فجأة — ما التشخيص؟',
    },
  },
  {
    id: 'Dejzuk5gmDC',
    url: reel('Dejzuk5gmDC'),
    thumb: 'assets/reels/reel-06-Dejzuk5gmDC.jpg',
    caption: {
      en: 'Why med students overthink STEP prep — comment “STEP” for the study resources I used.',
      ar: 'لماذا يفرط طلاب الطب في التفكير قبل الـ STEP — اكتب STEP في التعليقات لأرسل لك القناة التي درست عليها.',
    },
  },
  {
    id: 'DecHY82AyF5',
    url: reel('DecHY82AyF5'),
    thumb: 'assets/reels/reel-07-DecHY82AyF5.jpg',
    caption: {
      en: 'New series: Round Questions — real questions from clinical rounds, explained one by one.',
      ar: 'سلسلة جديدة: أسئلة الراوندات — أسئلة حقيقية من الجولات السريرية مع الشرح.',
    },
  },
  {
    id: 'DeUc34MAp7U',
    url: reel('DeUc34MAp7U'),
    thumb: 'assets/reels/reel-08-DeUc34MAp7U.jpg',
    caption: { en: 'Medical school, in short', ar: 'دراسة الطب باختصار' },
  },
  {
    id: 'DeSQnT5A1MV',
    url: reel('DeSQnT5A1MV'),
    thumb: 'assets/reels/reel-09-DeSQnT5A1MV.jpg',
    caption: {
      en: 'Beware of anyone promising a “final diabetes cure” — diabetes needs evidence-based care, not miracle products.',
      ar: 'انتبهوا من كل من يروّج لعلاج نهائي للسكري — السكري يحتاج رعاية مبنية على الدليل العلمي.',
    },
  },
  {
    id: 'DePh567glgs',
    url: reel('DePh567glgs'),
    thumb: 'assets/reels/reel-10-DePh567glgs.jpg',
    caption: {
      en: 'Type 1 & 2 diabetes cured in two minutes? Never stop insulin because of a video.',
      ar: 'علاج السكري في دقيقتين؟ لا توقفوا الإنسولين أبدًا بسبب فيديو — السكري مرض مزمن يحتاج متابعة.',
    },
  },
];
