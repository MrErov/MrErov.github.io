const I18n = (function() {
  let currentLang = 'en';
  let translations = {};

  const langBtns = document.querySelectorAll('.lang-btn');
  const html = document.documentElement;

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      translations = await response.json();
      return translations;
    } catch (error) {
      console.error('i18n: Error loading translations:', error);
      return {};
    }
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = getNestedTranslation(key);
      if (translation) {
        if (el.tagName === 'TITLE') {
          document.title = translation;
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.hasAttribute('placeholder')) {
            el.placeholder = translation;
          } else {
            el.textContent = translation;
          }
        } else {
          el.textContent = translation;
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = getNestedTranslation(key);
      if (translation) {
        el.placeholder = translation;
      }
    });
  }

  function getNestedTranslation(key) {
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return null;
      }
    }
    return typeof result === 'string' ? result : null;
  }

  function setActiveLang(lang) {
    currentLang = lang;
    html.setAttribute('lang', lang);
    localStorage.setItem('preferred-lang', lang);

    langBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  async function switchLang(lang) {
    if (lang === currentLang) return;
    await loadTranslations(lang);
    applyTranslations();
    setActiveLang(lang);
  }

  function init() {
    const savedLang = localStorage.getItem('preferred-lang');
    const initialLang = (savedLang || 'en');

    loadTranslations(initialLang).then(() => {
      applyTranslations();
      setActiveLang(initialLang);
    });

    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        switchLang(btn.dataset.lang);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    switchLang,
    getCurrentLang: () => currentLang,
    t: (key) => getNestedTranslation(key)
  };
})();