type Lang = 'ar' | 'en';

let isScriptLoading = false;
let isTranslatorReady = false;
let pendingLang: Lang | null = null;

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
      pageLanguage: 'ar',
      includedLanguages: 'ar,en',
      autoDisplay: false
    },
    TRANSLATE_CONTAINER_ID
  );

  if (pendingLang) {
    const langToApply = pendingLang;
    pendingLang = null;
    // Slight delay to let the widget render its select element
    setTimeout(() => translateTo(langToApply), 60);
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

export const translateTo = (lang: Lang) => {
  ensureContainer();

  const select = document.querySelector<HTMLSelectElement>(`#${TRANSLATE_CONTAINER_ID} select`);
  if (!select) {
    // Widget not ready yet; load and retry once it mounts
    pendingLang = lang;
    loadGoogleTranslate();
    return;
  }

  if (select.value === lang) return;
  select.value = lang;
  select.dispatchEvent(new Event('change'));
};
