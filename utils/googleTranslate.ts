type Lang = 'ar' | 'en';
type TranslateOptions = {
  force?: boolean;
};

let isScriptLoading = false;
let isTranslatorReady = false;
let pendingLang: Lang | null = null;
let pendingForce = false;

const TRANSLATE_CONTAINER_ID = 'google_translate_element';

const ensureContainer = () => {
  if (document.getElementById(TRANSLATE_CONTAINER_ID)) return;
  const el = document.createElement('div');
  el.id = TRANSLATE_CONTAINER_ID;
  el.style.display = 'none';
  document.body.appendChild(el);
};

const initTranslator = () => {
  const googleObj = (window as any).google;
  if (!googleObj?.translate) return;

  isTranslatorReady = true;
  new googleObj.translate.TranslateElement(
    {
      pageLanguage: 'en', // Set base page language to English
      includedLanguages: 'ar,en',
      autoDisplay: false,
      layout: googleObj.translate.TranslateElement.InlineLayout.SIMPLE
    },
    TRANSLATE_CONTAINER_ID
  );

  // Apply pending language immediately
  if (pendingLang) {
    const langToApply = pendingLang;
    const forceApply = pendingForce;
    pendingLang = null;
    pendingForce = false;
    // Immediate translation
    setTimeout(() => translateTo(langToApply, { force: forceApply }), 100);
  } else {
    // Default to Arabic
    setTimeout(() => translateTo('ar', { force: true }), 100);
  }
};

export const loadGoogleTranslate = () => {
  if (isTranslatorReady || isScriptLoading) return;
  isScriptLoading = true;
  ensureContainer();

  // Global callback used by the Google script
  (window as any).googleTranslateElementInit = () => {
    isScriptLoading = false;
    initTranslator();
  };

  const script = document.createElement('script');
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.body.appendChild(script);
};

export const translateTo = (lang: Lang, options: TranslateOptions = {}) => {
  ensureContainer();

  const select = document.querySelector<HTMLSelectElement>(`#${TRANSLATE_CONTAINER_ID} select`);
  if (!select) {
    // Widget not ready yet; load and retry once it mounts
    pendingLang = lang;
    pendingForce = options.force === true;
    loadGoogleTranslate();
    return;
  }

  // Translate to Arabic or back to English
  const targetValue = lang === 'ar' ? 'ar' : 'en';
  const shouldForce = options.force === true;
  
  select.value = targetValue;
  select.dispatchEvent(new Event('change'));
  
  // Force a second trigger to ensure translation
  setTimeout(() => {
    if (select.value !== targetValue || shouldForce) {
      select.value = targetValue;
      select.dispatchEvent(new Event('change'));
    }
  }, 200);
};
