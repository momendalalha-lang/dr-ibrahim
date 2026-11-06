import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang, LocalizedText } from './types/content';

const STORAGE_KEY = 'mus-site-lang';

const en = {
  // header / nav
  'nav.home': 'Home',
  'nav.branches': 'Branches',
  'nav.news': 'News & Updates',
  'nav.connect': 'Connect',
  'lang.toggle': 'العربية',
  'lang.label': 'Switch to Arabic',

  // hero
  'hero.badge': 'Medical Knowledge Hub',
  'hero.follow': 'Follow',
  'hero.share': 'Share Profile',
  'hero.copyLink': 'Copy Link',
  'hero.qr': 'QR Code',
  'hero.copied': 'Link copied to clipboard',
  'hero.shared': 'Shared successfully',
  'hero.shareFail': 'Could not share — link copied instead',
  'hero.qrTitle': 'Scan to open this site',
  'hero.qrHint': 'Point your camera at the code to open the hub on any device.',
  'hero.downloadQR': 'Download QR',
  'hero.close': 'Close',
  'hero.liveTag': 'LIVE',
  'hero.levelTag': 'LV.1',
  'hero.roleTag': 'MEDIC',
  'hero.mascotTag': 'Mascot emblem',

  // pinned banner
  'pinned.eyebrow': 'Pinned Directions',
  'pinned.cta': 'Open Branch',

  // explorer
  'explorer.eyebrow': 'Knowledge Base',
  'explorer.title': 'Medical Branches & Folders',
  'explorer.subtitle':
    'Pick a branch to open its folder tree. Inside each folder you will find directions and direct links to Google Drive for viewing or downloading.',
  'explorer.search': 'Search branches, files, directions…',
  'explorer.all': 'All',
  'explorer.lectures': 'Lectures',
  'explorer.handouts': 'Handouts & Quizzes',
  'explorer.quizzes': 'Quizzes',
  'explorer.cases': 'Clinical Cases',
  'explorer.media': 'Media & Audio',
  'explorer.back': 'Back',
  'explorer.root': 'All Branches',
  'explorer.items': 'items',
  'explorer.folders': 'folders',
  'explorer.resources': 'resources',
  'explorer.empty': 'Nothing here yet — check back soon.',
  'explorer.noResults': 'No matches found. Try a different keyword.',
  'explorer.openFolder': 'Open folder',
  'explorer.goUp': 'Up one level',
  'explorer.inBranch': 'in',
  'explorer.directionsTitle': 'Directions',
  'explorer.directionsHint': 'Read these instructions before downloading.',
  'explorer.addContent': 'Add content snippet',
  'explorer.resultsFor': 'Results for',
  'explorer.matchingBranches': 'Matching branches',
  'explorer.matchingFiles': 'Matching files & folders',

  // drive card
  'card.openDrive': 'Click Here to Open Google Drive Folder',
  'card.openLink': 'Click Here to Open Link',
  'card.copyLink': 'Copy Drive Link',
  'card.copied': 'Drive link copied',
  'card.updated': 'Updated',
  'card.type.folder': 'Drive Folder',
  'card.type.file': 'Drive File',
  'card.type.external': 'External Link',

  // news
  'news.eyebrow': 'Journal',
  'news.title': 'News, Directions & Updates',
  'news.subtitle': 'Announcements, study directions and articles from Dr Ibrahim.',
  'news.pinned': 'Pinned',
  'news.read': 'Read article',
  'news.readTime': 'min read',
  'news.empty': 'No posts in this category yet.',
  'news.goToBranch': 'Open related branch',
  'news.backToNews': 'Back to news',
  'news.postedOn': 'Posted',
  'news.cat.news': 'News',
  'news.cat.directions': 'Directions',
  'news.cat.update': 'Update',
  'news.cat.article': 'Article',

  // helper modal
  'helper.title': 'Content Snippet Generator',
  'helper.hint': 'Fill the form, copy the generated snippet, and paste it into src/data/siteData.ts.',
  'helper.kind': 'Content type',
  'helper.kind.branch': 'Folder / Branch',
  'helper.kind.resource': 'Drive resource',
  'helper.kind.post': 'News / Blog post',
  'helper.parent': 'Parent branch',
  'helper.root': 'Root (top level)',
  'helper.titleEn': 'Title (English)',
  'helper.titleAr': 'Title (Arabic)',
  'helper.descEn': 'Description (English, optional)',
  'helper.descAr': 'Description (Arabic, optional)',
  'helper.directionsEn': 'Directions (English, optional)',
  'helper.directionsAr': 'Directions (Arabic, optional)',
  'helper.url': 'Google Drive / external URL',
  'helper.resourceType': 'Link type',
  'helper.kindLabel': 'Badge label (e.g. PDF Pack)',
  'helper.icon': 'Icon',
  'helper.tags': 'Tags',
  'helper.bodyEn': 'Article body (English) — one paragraph per block',
  'helper.bodyAr': 'Article body (Arabic) — one paragraph per block',
  'helper.excerptEn': 'Excerpt (English)',
  'helper.excerptAr': 'Excerpt (Arabic)',
  'helper.category': 'Category',
  'helper.linkedBranch': 'Linked branch (optional)',
  'helper.generate': 'Generate snippet',
  'helper.copy': 'Copy snippet',
  'helper.copied': 'Snippet copied — paste it into src/data/siteData.ts',
  'helper.close': 'Close',

  // reels marquee
  'reels.eyebrow': 'Instagram Reels',
  'reels.followers': 'followers',
  'reels.badge': 'Reel',

  // admin panel
  'admin.eyebrow': 'Site Manager',
  'admin.title': 'Branch Manager',
  'admin.subtitle':
    'Add new folder branches with their Google Drive links. Changes appear on the site instantly in this browser — use the publish snippet to make them permanent for every visitor.',
  'admin.pinTitle': 'Admin access',
  'admin.pinHint': 'Enter the admin PIN to manage branches.',
  'admin.pin': 'PIN',
  'admin.unlock': 'Unlock',
  'admin.wrongPin': 'Incorrect PIN — try again',
  'admin.backToSite': 'Back to site',
  'admin.customCount': 'custom branches',
  'admin.newBranch': 'New branch',
  'admin.addBranch': 'Add branch',
  'admin.added': 'Branch added — it is live on the site now',
  'admin.customBranches': 'Branches you added',
  'admin.empty': 'No custom branches yet.',
  'admin.delete': 'Delete branch',
  'admin.deleteConfirm': 'Delete this branch? It will disappear from the site.',
  'admin.publishTitle': 'Publish permanently',
  'admin.publishNote':
    'Branches added here are saved only in this browser. To make one permanent for every visitor, copy the generated snippet and send it to be added to the site data.',
  'admin.copySnippet': 'Copy publish snippet',
  'admin.snippetCopied': 'Snippet copied — paste it into src/data/siteData.ts',
  'admin.publishHint': 'Add a branch first — the snippet appears here after you do.',
  'admin.totalBranches': 'total branches',
  'admin.onlyOne': 'single admin',

  // footer
  'footer.tagline': 'Structured medical education, published with care.',
  'footer.explore': 'Explore',
  'footer.connect': 'Connect',
  'footer.rights': 'All rights reserved.',
  'footer.madeWith': 'Crafted for learners, by learners.',
};

const ar: Record<keyof typeof en, string> = {
  'nav.home': 'الرئيسية',
  'nav.branches': 'الفروع',
  'nav.news': 'الأخبار والتحديثات',
  'nav.connect': 'تواصل',
  'lang.toggle': 'English',
  'lang.label': 'التبديل إلى الإنجليزية',

  'hero.badge': 'مركز المعرفة الطبية',
  'hero.follow': 'تابعني',
  'hero.share': 'مشاركة الملف',
  'hero.copyLink': 'نسخ الرابط',
  'hero.qr': 'رمز QR',
  'hero.copied': 'تم نسخ الرابط',
  'hero.shared': 'تمت المشاركة بنجاح',
  'hero.shareFail': 'تعذّرت المشاركة — تم نسخ الرابط بدلاً من ذلك',
  'hero.qrTitle': 'امسح الرمز لفتح الموقع',
  'hero.qrHint': 'وجّه الكاميرا نحو الرمز لفتح المركز على أي جهاز.',
  'hero.downloadQR': 'تنزيل الرمز',
  'hero.close': 'إغلاق',
  'hero.liveTag': 'مباشر',
  'hero.levelTag': 'م1',
  'hero.roleTag': 'طبيب',
  'hero.mascotTag': 'شعار التميمة',

  'pinned.eyebrow': 'إرشادات مثبتة',
  'pinned.cta': 'افتح الفرع',

  'explorer.eyebrow': 'قاعدة المعرفة',
  'explorer.title': 'الفروع والمجلدات الطبية',
  'explorer.subtitle':
    'اختر فرعًا لفتح شجرة مجلداته. داخل كل مجلد ستجد الإرشادات وروابط مباشرة إلى Google Drive للعرض أو التنزيل.',
  'explorer.search': 'ابحث في الفروع والملفات والإرشادات…',
  'explorer.all': 'الكل',
  'explorer.lectures': 'محاضرات',
  'explorer.handouts': 'ملخصات واختبارات',
  'explorer.quizzes': 'اختبارات',
  'explorer.cases': 'حالات سريرية',
  'explorer.media': 'وسائط وصوتيات',
  'explorer.back': 'رجوع',
  'explorer.root': 'كل الفروع',
  'explorer.items': 'عنصر',
  'explorer.folders': 'مجلدات',
  'explorer.resources': 'مصادر',
  'explorer.empty': 'لا يوجد شيء هنا بعد — عد قريبًا.',
  'explorer.noResults': 'لا توجد نتائج مطابقة. جرّب كلمة أخرى.',
  'explorer.openFolder': 'افتح المجلد',
  'explorer.goUp': 'المستوى السابق',
  'explorer.inBranch': 'داخل',
  'explorer.directionsTitle': 'الإرشادات',
  'explorer.directionsHint': 'اقرأ هذه التعليمات قبل التنزيل.',
  'explorer.addContent': 'مقتطف إضافة محتوى',
  'explorer.resultsFor': 'نتائج البحث عن',
  'explorer.matchingBranches': 'فروع مطابقة',
  'explorer.matchingFiles': 'ملفات ومجلدات مطابقة',

  'card.openDrive': 'اضغط هنا لفتح مجلد Google Drive',
  'card.openLink': 'اضغط هنا لفتح الرابط',
  'card.copyLink': 'نسخ رابط Drive',
  'card.copied': 'تم نسخ رابط Drive',
  'card.updated': 'آخر تحديث',
  'card.type.folder': 'مجلد Drive',
  'card.type.file': 'ملف Drive',
  'card.type.external': 'رابط خارجي',

  'news.eyebrow': 'اليوميات',
  'news.title': 'الأخبار والإرشادات والتحديثات',
  'news.subtitle': 'إعلانات وإرشادات دراسية ومقالات من الدكتور إبراهيم.',
  'news.pinned': 'مثبّت',
  'news.read': 'اقرأ المقال',
  'news.readTime': 'دقائق قراءة',
  'news.empty': 'لا توجد منشورات في هذه الفئة بعد.',
  'news.goToBranch': 'افتح الفرع المرتبط',
  'news.backToNews': 'العودة إلى الأخبار',
  'news.postedOn': 'نُشر في',
  'news.cat.news': 'خبر',
  'news.cat.directions': 'إرشادات',
  'news.cat.update': 'تحديث',
  'news.cat.article': 'مقال',

  'helper.title': 'مولّد مقتطفات المحتوى',
  'helper.hint': 'املأ النموذج، انسخ المقتطف الناتج، والصقه في src/data/siteData.ts.',
  'helper.kind': 'نوع المحتوى',
  'helper.kind.branch': 'مجلد / فرع',
  'helper.kind.resource': 'مورد Drive',
  'helper.kind.post': 'خبر / مقال',
  'helper.parent': 'الفرع الأب',
  'helper.root': 'الجذر (المستوى الأعلى)',
  'helper.titleEn': 'العنوان (إنجليزي)',
  'helper.titleAr': 'العنوان (عربي)',
  'helper.descEn': 'الوصف (إنجليزي، اختياري)',
  'helper.descAr': 'الوصف (عربي، اختياري)',
  'helper.directionsEn': 'الإرشادات (إنجليزي، اختياري)',
  'helper.directionsAr': 'الإرشادات (عربي، اختياري)',
  'helper.url': 'رابط Google Drive / خارجي',
  'helper.resourceType': 'نوع الرابط',
  'helper.kindLabel': 'تسمية الشارة (مثال: حزمة PDF)',
  'helper.icon': 'الأيقونة',
  'helper.tags': 'الوسوم',
  'helper.bodyEn': 'نص المقال (إنجليزي) — فقرة واحدة لكل كتلة',
  'helper.bodyAr': 'نص المقال (عربي) — فقرة واحدة لكل كتلة',
  'helper.excerptEn': 'المقتطف (إنجليزي)',
  'helper.excerptAr': 'المقتطف (عربي)',
  'helper.category': 'الفئة',
  'helper.linkedBranch': 'الفرع المرتبط (اختياري)',
  'helper.generate': 'إنشاء المقتطف',
  'helper.copy': 'نسخ المقتطف',
  'helper.copied': 'تم نسخ المقتطف — الصقه في src/data/siteData.ts',
  'helper.close': 'إغلاق',

  'reels.eyebrow': 'ريلز إنستغرام',
  'reels.followers': 'متابع',
  'reels.badge': 'ريل',

  'admin.eyebrow': 'إدارة الموقع',
  'admin.title': 'إدارة الفروع',
  'admin.subtitle':
    'أضف فروع مجلدات جديدة مع روابط Google Drive الخاصة بها. تظهر التغييرات على الموقع فورًا في هذا المتصفح — استخدم مقتطف النشر لجعلها دائمة لكل الزوار.',
  'admin.pinTitle': 'دخول المدير',
  'admin.pinHint': 'أدخل رمز PIN المدير لإدارة الفروع.',
  'admin.pin': 'رمز PIN',
  'admin.unlock': 'فتح',
  'admin.wrongPin': 'رمز غير صحيح — حاول مرة أخرى',
  'admin.backToSite': 'العودة إلى الموقع',
  'admin.customCount': 'فروع مخصصة',
  'admin.newBranch': 'فرع جديد',
  'admin.addBranch': 'إضافة الفرع',
  'admin.added': 'تمت إضافة الفرع — أصبح ظاهرًا على الموقع الآن',
  'admin.customBranches': 'الفروع التي أضفتها',
  'admin.empty': 'لا توجد فروع مخصصة بعد.',
  'admin.delete': 'حذف الفرع',
  'admin.deleteConfirm': 'حذف هذا الفرع؟ سيختفي من الموقع.',
  'admin.publishTitle': 'النشر الدائم',
  'admin.publishNote':
    'الفروع المضافة هنا تُحفظ في هذا المتصفح فقط. لجعل أحدها دائمًا لكل الزوار، انسخ المقتطف الناتج وأرسله لإضافته إلى بيانات الموقع.',
  'admin.copySnippet': 'نسخ مقتطف النشر',
  'admin.snippetCopied': 'تم نسخ المقتطف — الصقه في src/data/siteData.ts',
  'admin.publishHint': 'أضف فرعًا أولًا — سيظهر المقتطف هنا بعد ذلك.',
  'admin.totalBranches': 'إجمالي الفروع',
  'admin.onlyOne': 'مدير واحد',

  'footer.tagline': 'تعليم طبي منظم، يُنشر بعناية.',
  'footer.explore': 'استكشف',
  'footer.connect': 'تواصل',
  'footer.rights': 'جميع الحقوق محفوظة.',
  'footer.madeWith': 'صُنع للمتعلمين، من متعلمين.',
};

export type DictKey = keyof typeof en;

const dict: Record<Lang, Record<DictKey, string>> = { en, ar };

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey) => string;
  lt: (value: LocalizedText | string | undefined | null) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => dict[lang][key] ?? dict.en[key] ?? key,
      lt: (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value[lang] ?? value.en ?? '';
      },
    }),
    [lang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
