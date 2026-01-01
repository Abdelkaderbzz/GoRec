import type { Translations } from './en';

export const ar: Translations = {
  // التنقل
  nav: {
    home: 'الرئيسية',
    recorder: 'المسجّل',
    getStarted: 'ابدأ الآن',
  },

  // الصفحة الرئيسية
  landing: {
    badge: 'مسجّل شاشة مجاني',
    headline: 'سجّل شاشتك',
    headlineHighlight: 'باحترافية',
    description:
      'التقط شاشتك وكاميرا الويب والصوت باستخدام مسجّلنا القوي المعتمد على المتصفح. بدون تحميل، بدون قيود، فقط اضغط تسجيل.',
    cta: 'ابدأ التسجيل الآن',
    ctaSecondary: 'اعرف المزيد',

    // الميزات
    features: {
      title: 'كل ما تحتاجه',
      subtitle: 'ميزات قوية في واجهة بسيطة',
      screen: {
        title: 'التقاط الشاشة',
        description: 'سجّل شاشتك بالكامل أو نافذة أو تبويب معين بجودة عالية.',
      },
      audio: {
        title: 'تسجيل الصوت',
        description:
          'التقط صوت الميكروفون والنظام. اجمع بين المصدرين لتسجيلات احترافية.',
      },
      webcam: {
        title: 'كاميرا الويب',
        description:
          'أضف عرض كاميرا الويب كنافذة صغيرة لإضفاء طابع شخصي على تسجيلاتك.',
      },
      controls: {
        title: 'تحكم كامل',
        description: 'أوقف مؤقتاً واستأنف وأدر تسجيلاتك بأدوات تحكم بديهية.',
      },
    },

    // الإحصائيات
    stats: {
      recordings: 'تسجيل تم',
      users: 'مستخدم سعيد',
      rating: 'تقييم المستخدمين',
    },

    // قسم الدعوة للعمل
    ctaSection: {
      title: 'هل أنت مستعد لبدء التسجيل؟',
    },

    // التذييل
    footer: {
      madeBy: 'صُنع بـ ❤️ بواسطة',
      rights: 'جميع الحقوق محفوظة.',
    },
  },

  // صفحة التسجيل
  recorder: {
    title: 'GoRec',
    subtitle: 'اضبط إعدادات التسجيل وابدأ الالتقاط',

    // الحالة
    status: {
      idle: 'جاهز للتسجيل',
      recording: 'جارٍ التسجيل',
      paused: 'متوقف مؤقتاً',
      stopped: 'اكتمل التسجيل',
    },

    // أدوات التحكم
    controls: {
      start: 'بدء التسجيل',
      stop: 'إيقاف',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف',
      download: 'تحميل',
      newRecording: 'تسجيل جديد',
      share: 'مشاركة',
      upload: 'رفع ومشاركة',
      uploading: 'جارٍ الرفع...',
    },

    // المشاركة
    share: {
      title: 'مشاركة التسجيل',
      description: 'شارك تسجيلك عبر رابط أو وسائل التواصل',
      linkLabel: 'رابط التسجيل',
      copyBtn: 'نسخ',
      copiedBtn: 'تم النسخ!',
      openInNewTab: 'فتح في تبويب جديد',
      copied: 'تم نسخ الرابط!',
      copyFailed: 'فشل نسخ الرابط',
      shareVia: 'شارك عبر وسائل التواصل',
      shareText: 'شاهد تسجيل الشاشة الخاص بي!',
      emailBody: 'سجلت لك هذا الفيديو:',
      uploadSuccess: 'تم رفع التسجيل بنجاح!',
      uploadFailed: 'فشل رفع التسجيل',
    },

    // السجل
    history: {
      title: 'التسجيلات الأخيرة',
      empty: 'لا توجد تسجيلات بعد. ابدأ التسجيل لرؤيتها هنا!',
      play: 'تشغيل',
      share: 'مشاركة',
    },

    // الإعدادات
    settings: {
      audio: 'إعدادات الصوت',
      microphone: 'الميكروفون',
      systemAudio: 'صوت النظام',
      selectMic: 'اختر الميكروفون',
      noMic: 'لم يتم العثور على ميكروفون',
      webcam: 'كاميرا الويب',
      enableWebcam: 'تفعيل كاميرا الويب',
      webcamPosition: 'الموضع',
      webcamSize: 'الحجم',
      positions: {
        topLeft: 'أعلى اليسار',
        topRight: 'أعلى اليمين',
        bottomLeft: 'أسفل اليسار',
        bottomRight: 'أسفل اليمين',
      },
      sizes: {
        small: 'صغير',
        medium: 'متوسط',
        large: 'كبير',
      },
    },

    // المؤقت
    timer: {
      label: 'المدة',
    },

    // الأخطاء
    errors: {
      screenDenied: 'تم رفض مشاركة الشاشة. يرجى السماح بالوصول للتسجيل.',
      micDenied: 'تم رفض الوصول للميكروفون. سيتم التسجيل بدون صوت.',
      webcamDenied: 'تم رفض الوصول لكاميرا الويب. سيتم التسجيل بدونها.',
      notSupported: 'تسجيل الشاشة غير مدعوم في هذا المتصفح.',
      generic: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    },

    // نصائح
    tips: {
      title: 'نصائح سريعة',
      tip1: "انقر على 'بدء التسجيل' للبدء",
      tip2: 'استخدم زر الإيقاف المؤقت للاستراحات',
      tip3: 'حمّل تسجيلك عند الانتهاء',
    },
  },

  // المصادقة
  auth: {
    welcome: 'مرحباً بك في ScreenRec',
    description: 'سجّل دخولك لحفظ ومشاركة تسجيلاتك',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signInSuccess: 'مرحباً بعودتك!',
    signUpSuccess: 'تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني للتأكيد.',
    signOut: 'تسجيل الخروج',
    loginRequired: 'يرجى تسجيل الدخول لرفع التسجيلات',
    continueWithGoogle: 'المتابعة مع Google',
    orContinueWith: 'أو المتابعة بالبريد الإلكتروني',
    verifying: 'جارٍ التحقق من حسابك...',
    confirmSuccess: 'تم تأكيد البريد الإلكتروني بنجاح!',
    confirmError: 'فشل تأكيد البريد الإلكتروني. يرجى المحاولة مرة أخرى.',
    redirecting: 'جارٍ إعادة التوجيه...',
  },

  // الملف الشخصي
  profile: {
    title: 'الملف الشخصي',
    editProfile: 'تعديل الملف الشخصي',
    editDescription: 'تحديث معلومات ملفك الشخصي',
    displayName: 'الاسم المعروض',
    displayNamePlaceholder: 'أدخل اسمك',
    noName: 'لم يتم تحديد اسم',
    verified: 'موثّق',
    memberSince: 'عضو منذ',
    emailProvider: 'بريد إلكتروني',
    emailCannotChange: 'لا يمكن تغيير البريد الإلكتروني',
    saveChanges: 'حفظ التغييرات',
    updateSuccess: 'تم تحديث الملف الشخصي بنجاح!',
    signOutSuccess: 'تم تسجيل خروجك.',
  },

  // عام
  common: {
    loading: 'جارٍ التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    close: 'إغلاق',
    on: 'مفعّل',
    off: 'معطّل',
  },
};
