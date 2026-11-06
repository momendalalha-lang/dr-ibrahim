import type { SiteData } from '../types/content';
import { instagramProfile } from './reels';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONTENT — edit this file to publish new folders, Drive links and posts.
 *  Tip: use the "Add content snippet" button inside the Branches section to
 *  generate a ready-to-paste block, then paste it below.
 *
 *  NOTE: Replace every `drive.google.com/drive/folders/...` URL below with your
 *  real Google Drive folder/file links (Share → "Anyone with the link").
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DRIVE = 'https://drive.google.com/drive/folders';

export const siteData: SiteData = {
  profile: {
    name: 'Dr Ibrahim',
    subtitle: {
      en: 'Medical Doctor (M.D.) — Health & Educational Content',
      ar: 'دكتور في الطب — محتوى صحي تعليمي',
    },
    bio: {
      en: 'Welcome to my personal medical knowledge hub. Structured lecture folders, handouts, quizzes and study directions — everything in one calm, organized place. New reels and study tips drop on Instagram too.',
      ar: 'أهلًا بك في مركز المعرفة الطبية الشخصي. مجلدات محاضرات منظمة وملخصات واختبارات وإرشادات دراسية — كل شيء في مكان واحد هادئ ومنظّم. جديد الريلز ونصائح الدراسة على إنستغرام أيضًا.',
    },
    avatarSrc: 'assets/profile-reference.png',
    avatarMode: 'sprite',
    avatarSpriteSrc: 'assets/dr-ibrahim-mascot.png',
    statusLabel: {
      en: 'New uploads every week',
      ar: 'رفع جديد كل أسبوع',
    },
    socials: [
      { id: 'instagram', label: { en: 'Instagram', ar: 'إنستغرام' }, url: 'https://www.instagram.com/dr.ibrahem_musadaq/' },
    ],
    pinned: {
      title: {
        en: 'Session handouts are now live',
        ar: 'ملخصات الجلسة الجديدة متاحة الآن',
      },
      body: {
        en: 'New PDF packs and quiz banks for the current rotation have been uploaded. Open the Internal Medicine branch to grab them.',
        ar: 'تم رفع حزم PDF الجديدة وبنوك الاختبارات للدورة الحالية. افتح فرع الطب الباطني للحصول عليها.',
      },
      ctaLabel: { en: 'Go to Internal Medicine', ar: 'اذهب إلى الطب الباطني' },
      branchId: 'internal-medicine',
    },
  },

  branches: [
    {
      id: 'internal-medicine',
      title: { en: 'Internal Medicine', ar: 'الطب الباطني' },
      description: {
        en: 'Core lectures, case discussions and revision packs for internal medicine rotations.',
        ar: 'محاضرات أساسية ونقاشات حالات وحزم مراجعة لدورات الطب الباطني.',
      },
      icon: 'stethoscope',
      tags: ['lectures', 'handouts', 'cases'],
      directions: {
        en: 'Browse the sub-branches by organ system. Each folder contains the lecture slides first, followed by the handout pack. Download the whole folder as a ZIP if your connection is unstable.',
        ar: 'تصفّح الفروع الفرعية حسب الجهاز. يحتوي كل مجلد على شرائح المحاضرة أولًا ثم حزمة الملخصات. نزّل المجلد كاملًا كملف ZIP إذا كان اتصالك غير مستقر.',
      },
      children: [
        {
          id: 'cardiology',
          title: { en: 'Cardiology', ar: 'أمراض القلب' },
          description: {
            en: 'ECG basics, murmurs and heart failure lectures.',
            ar: 'أساسيات تخطيط القلب واللهمات وقصور القلب.',
          },
          icon: 'heart',
          tags: ['lectures', 'cases'],
          resources: [
            {
              id: 'ecg-session5',
              title: { en: 'ECG Interpretation — Session 5 Handout', ar: 'تفسير تخطيط القلب — ملخص الجلسة 5' },
              description: {
                en: 'Step-by-step ECG reading guide with practice strips.',
                ar: 'دليل خطوة بخطوة لقراءة تخطيط القلب مع شرائط تدريبية.',
              },
              type: 'drive-folder',
              url: `${DRIVE}/1AbCdEfGhIjKlMnOpQrStUvWxYzCardio05`,
              kindLabel: 'PDF Pack',
              sizeLabel: '~24 MB',
              updatedAt: '2026-10-28',
              tags: ['handouts'],
            },
            {
              id: 'cardio-lectures',
              title: { en: 'Cardiology Lecture Slides — Weeks 1–6', ar: 'شرائح محاضرات أمراض القلب — الأسابيع 1–6' },
              type: 'drive-file',
              url: `${DRIVE}/1AbCdEfGhIjKlMnOpQrStUvWxYzCardioSlides`,
              kindLabel: 'Slides',
              updatedAt: '2026-10-20',
              tags: ['lectures'],
            },
          ],
        },
        {
          id: 'nephrology',
          title: { en: 'Nephrology', ar: 'أمراض الكلى' },
          description: {
            en: 'AKI, CKD staging and electrolyte emergencies.',
            ar: 'القصور الكلوي الحاد ومراحلمرض الكلى المزمن وطوارئ الأيونات.',
          },
          icon: 'activity',
          tags: ['lectures', 'handouts'],
          resources: [
            {
              id: 'renal-cases',
              title: { en: 'Renal Case Files — Drive Folder', ar: 'ملفات الحالات الكلوية — مجلد Drive' },
              description: {
                en: 'Ten de-identified cases with discussion questions.',
                ar: 'عشر حالات مُخفّفة الهوية مع أسئلة نقاش.',
              },
              type: 'drive-folder',
              url: `${DRIVE}/1AbCdEfGhIjKlMnOpQrStUvWxYzRenalCases`,
              kindLabel: 'Case Bank',
              updatedAt: '2026-10-15',
              tags: ['cases'],
            },
          ],
        },
      ],
      resources: [
        {
          id: 'im-overview',
          title: { en: 'Internal Medicine Overview Pack', ar: 'حزمة نظرة عامة على الطب الباطني' },
          description: {
            en: 'Orientation document: how the rotation is organized and what to study first.',
            ar: 'مستند تعريفي: كيف يتم تنظيم الدورة وماذا تدرس أولًا.',
          },
          type: 'drive-file',
          url: `${DRIVE}/1AbCdEfGhIjKlMnOpQrStUvWxYzIMOverview`,
          kindLabel: 'PDF',
          sizeLabel: '~3 MB',
          updatedAt: '2026-10-01',
          tags: ['handouts'],
        },
      ],
    },
    {
      id: 'surgery',
      title: { en: 'Surgery', ar: 'الجراحة' },
      description: {
        en: 'Operative skills, OSCE checklists and surgical case logs.',
        ar: 'مهارات جراحية وقوائم تحقق OSCE وسجلات حالات.',
      },
      icon: 'scissors',
      tags: ['lectures', 'cases'],
      directions: {
        en: 'Start with the OSCE checklist pack, then move to the case log folder. Videos are streamed — no need to download.',
        ar: 'ابدأ بحزمة قوائم تحقق OSCE ثم انتقل إلى مجلد سجل الحالات. الفيديوهات تُبث مباشرة — لا حاجة للتنزيل.',
      },
      resources: [
        {
          id: 'osce-pack',
          title: { en: 'Surgery OSCE Checklist Pack', ar: 'حزمة قوائم تحقق جراحة OSCE' },
          type: 'drive-folder',
          url: `${DRIVE}/1AbCdEfGhIjKlMnOpQrStUvWxYzSurgOSCE`,
          kindLabel: 'PDF Pack',
          updatedAt: '2026-10-22',
          tags: ['handouts'],
        },
        {
          id: 'surg-media',
          title: { en: 'Surgical Skills Video Series', ar: 'سلسلة فيديوهات المهارات الجراحية' },
          type: 'external',
          url: 'https://example.com/surgical-skills',
          kindLabel: 'Video',
          updatedAt: '2026-09-30',
          tags: ['media'],
        },
      ],
    },
    {
      id: 'pediatrics',
      title: { en: 'Pediatrics', ar: 'طب الأطفال' },
      description: {
        en: 'Neonatal care, growth charts and common pediatric emergencies.',
        ar: 'رعاية حديثي الولادة ومخططات النمو وطوارئ الأطفال الشائعة.',
      },
      icon: 'baby',
      tags: ['handouts', 'cases'],
      resources: [
        {
          id: 'peds-vax',
          title: { en: 'Vaccination Schedule & Parent Handouts 2026', ar: 'جدول التطعيم وملخصات أولياء الأمور 2026' },
          type: 'drive-folder',
          url: `${DRIVE}/1AbCdEfGhIjKlMnOpQrStUvWxYzPedsVax`,
          kindLabel: 'PDF Pack',
          updatedAt: '2026-10-10',
          tags: ['handouts'],
        },
      ],
    },
    {
      id: 'obgyn',
      title: { en: 'Obstetrics & Gynecology', ar: 'النساء والتوليد' },
      description: {
        en: 'Antenatal care, labor guidelines and ultrasound basics.',
        ar: 'رعاية ما قبل الولادة وإرشادات الولادة وأساسيات الموجات فوق الصوتية.',
      },
      icon: 'users',
      tags: ['lectures', 'media'],
      resources: [
        {
          id: 'obgyn-us',
          title: { en: 'OBGYN Ultrasound Basics — Video Folder', ar: 'أساسيات موجات النساء والتوليد — مجلد فيديو' },
          type: 'drive-folder',
          url: `${DRIVE}/1AbCdEfGhIjKlMnOpQrStUvWxYzOBGYNUS`,
          kindLabel: 'Video',
          updatedAt: '2026-10-18',
          tags: ['media'],
        },
      ],
    },
    {
      id: 'pharmacology',
      title: { en: 'Pharmacology', ar: 'علم الأدوية' },
      description: {
        en: 'Drug classes, mechanisms and MCQ revision banks.',
        ar: 'فئات الأدوية وآليات عملها وبنوك أسئلة المراجعة.',
      },
      icon: 'pill',
      tags: ['handouts', 'quizzes'],
      directions: {
        en: 'The MCQ bank is a Google Sheet — open it directly, do not download. Answer keys are in the last tab.',
        ar: 'بنك الأسئلة عبارة عن جدول Google — افتحه مباشرة ولا تنزّله. مفاتيح الإجابات في آخر علامة تبويب.',
      },
      resources: [
        {
          id: 'pharm-mcq',
          title: { en: 'Pharmacology MCQ Bank — 500 Questions', ar: 'بنك أسئلة علم الأدوية — 500 سؤال' },
          type: 'drive-file',
          url: `${DRIVE}/1AbCdEfGhIjKlMnOpQrStUvWxYzPharmMCQ`,
          kindLabel: 'Quiz Bank',
          updatedAt: '2026-10-25',
          tags: ['quizzes'],
        },
        {
          id: 'pharm-notes',
          title: { en: 'High-Yield Drug Classes Notes', ar: 'ملخصات فئات الأدوية عالية الأهمية' },
          type: 'drive-file',
          url: `${DRIVE}/1AbCdEfGhIjKlMnOpQrStUvWxYzPharmNotes`,
          kindLabel: 'PDF',
          sizeLabel: '~8 MB',
          updatedAt: '2026-10-05',
          tags: ['handouts'],
        },
      ],
    },
    {
      id: 'pathology-radiology',
      title: { en: 'Pathology & Radiology', ar: 'الأمراض والتصوير' },
      description: {
        en: 'Histology slides, imaging interpretation and lab value guides.',
        ar: 'شرائح نسيجية وتفسير صور وأدلة قيم المختبر.',
      },
      icon: 'microscope',
      tags: ['cases', 'media'],
      resources: [
        {
          id: 'rad-cases',
          title: { en: 'Radiology Case Files — Drive Folder', ar: 'ملفات حالات الأشعة — مجلد Drive' },
          type: 'drive-folder',
          url: `${DRIVE}/1AbCdEfGhIjKlMnOpQrStUvWxYzRadCases`,
          kindLabel: 'Case Bank',
          updatedAt: '2026-10-12',
          tags: ['cases'],
        },
      ],
    },
  ],

  posts: [
    {
      id: 'welcome-hub',
      title: {
        en: 'Welcome to Dr Ibrahim’s Medical Knowledge Hub',
        ar: 'أهلًا بك في مركز الدكتور إبراهيم للمعرفة الطبية',
      },
      excerpt: {
        en: 'A new home for lectures, handouts and study directions — organized by branch, always one click away from Drive.',
        ar: 'موطن جديد للمحاضرات والملخصات وإرشادات الدراسة — منظّم حسب الفرع، وعلى بُعد نقرة واحدة من Drive.',
      },
      body: [
        {
          en: 'This site is my personal publishing space for medical education. Instead of scattering files across chats and drives, everything now lives here in structured branches.',
          ar: 'هذا الموقع هو مساحتي الشخصية للنشر في التعليم الطبي. فبدلًا من تشتيت الملفات بين المحادثات والسحابات، أصبح كل شيء هنا في فروع منظمة.',
        },
        {
          en: 'Each branch mirrors a subject area. Open a branch, read the short directions, then use the green Drive button to view or download the files directly.',
          ar: 'كل فرع يعكس مجالًا دراسيًا. افتح الفرع، اقرأ الإرشادات المختصرة، ثم استخدم زر Drive الأخضر لعرض الملفات أو تنزيلها مباشرة.',
        },
        {
          en: 'New uploads are announced in the News section below, and pinned directions at the top of the page always point to the most important current material.',
          ar: 'يتم الإعلان عن الرفع الجديد في قسم الأخبار بالأسفل، وتُشير الإرشادات المثبتة أعلى الصفحة دائمًا إلى أهم المواد الحالية.',
        },
      ],
      category: 'news',
      date: '2026-11-01',
      readMinutes: 2,
      pinned: true,
    },
    {
      id: 'session-handouts-live',
      title: {
        en: 'New Session Handouts & Quiz Banks Are Live',
        ar: 'ملخصات الجلسة الجديدة وبنوك الاختبارات متاحة',
      },
      excerpt: {
        en: 'Fresh PDF packs and MCQ banks for the current rotation — see exactly where to find them.',
        ar: 'حزم PDF جديدة وبنوك أسئلة للدورة الحالية — اكتشف بالضبط أين تجدها.',
      },
      body: [
        {
          en: 'The handout packs for this rotation are uploaded. Head to Internal Medicine → Cardiology for the ECG pack, and Pharmacology for the 500-question MCQ bank.',
          ar: 'تم رفع حزم الملخصات لهذه الدورة. توجه إلى الطب الباطني ← أمراض القلب لحزمة تخطيط القلب، وإلى علم الأدوية لبنك الأسئلة الذي يضم 500 سؤال.',
        },
        {
          en: 'Remember: inside every folder, read the directions box first — some resources are Google Sheets meant to be opened, not downloaded.',
          ar: 'تذكّر: داخل كل مجلد، اقرأ صندوق الإرشادات أولًا — بعض الموارد عبارة عن جداول Google يجب فتحها وليس تنزيلها.',
        },
      ],
      category: 'directions',
      date: '2026-11-04',
      readMinutes: 1,
      pinned: true,
      linkedBranchId: 'internal-medicine',
    },
    {
      id: 'evidence-lab-q3',
      title: {
        en: 'Evidence Lab — Q3 Schedule Update',
        ar: 'مختبر الأدلة — تحديث جدول الربع الثالث',
      },
      excerpt: {
        en: 'Journal-club sessions move to Thursdays at 6 PM. Slides and reading lists are inside the Media branch.',
        ar: 'انتقلت جلسات نادي المجلات إلى أيام الخميس الساعة 6 مساءً. الشرائح وقوائم القراءة داخل فرع الوسائط.',
      },
      body: [
        {
          en: 'Starting this month, Evidence Lab sessions run every Thursday at 6:00 PM. Each session opens with a 10-minute methods recap, then a critical appraisal of one paper.',
          ar: 'ابتداءً من هذا الشهر، تُعقد جلسات مختبر الأدلة كل خميس الساعة 6:00 مساءً. تبدأ كل جلسة بملخص منهجي لمدة 10 دقائق، ثم تقييم نقدي لورقة بحثية واحدة.',
        },
        {
          en: 'The slide decks and reading lists are published inside the Pathology & Radiology branch under the Media tag. Recordings will be posted to the same folder after each session.',
          ar: 'تم نشر عروض الشرائح وقوائم القراءة داخل فرع الأمراض والتصوير تحت وسم الوسائط. ستُنشر التسجيلات في المجلد نفسه بعد كل جلسة.',
        },
      ],
      category: 'update',
      date: '2026-10-30',
      readMinutes: 2,
    },
  ],

  instagram: instagramProfile,

  /*
   * Single-admin gate for the #/admin branch editor.
   * Change this PIN to something only you know. NOTE: this is a soft gate —
   * the PIN ships with the site code, so it deters casual visitors but is
   * not real authentication. For real security, add a backend later.
   */
  admin: { pin: 'ibrahim2026' },
};
