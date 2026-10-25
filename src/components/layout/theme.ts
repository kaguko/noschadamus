export type Theme = 'dark' | 'light';
export const THEME_STORAGE_KEY = 'nd:theme';

/** Chạy trước hydrate để không nhấp nháy. Mặc định luôn là dark (docs/04 mục 1). */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;
