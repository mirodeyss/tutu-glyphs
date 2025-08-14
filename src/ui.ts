// Обёртка для безопасной типизации window
declare global {
  interface Window {
    insertIcon: (el: HTMLElement | null, baseName?: string) => void;
    filterIcons: () => void;
    clearInput: () => void;
  }
}

export {}; // This makes the file a module

// Сообщаем main-коду, что UI готов (полезно, если захочешь реагировать)
parent.postMessage({ pluginMessage: { type: 'ui-ready' } }, '*');

// Показать контент и спрятать welcome
function showApp() {
  const welcome = document.getElementById('welcomeScreen');
  const app = document.getElementById('pluginContent');
  if (welcome) welcome.style.display = 'none';
  if (app) app.style.display = 'block';
  (document.getElementById('search') as HTMLInputElement | null)?.focus();
}

// Вставка иконки из inline onclick
function insertIcon(el: HTMLElement | null, baseName?: string) {
  const iconName =
    (el?.getAttribute('data-name') ?? '') || baseName || '';
  if (!iconName) return;

  // Имя отправляем «как есть». Если нужны _outline/_filled — добавляй здесь.
  const name = iconName;

  parent.postMessage(
    { pluginMessage: { type: 'insert-icon-append', name } },
    '*'
  );
}

// Фильтр по data-name
function filterIcons() {
  const input = document.getElementById('search') as HTMLInputElement | null;
  const q = (input?.value || '').toLowerCase();
  const items = Array.from(document.querySelectorAll<HTMLElement>('.icon-button'));
  let visible = 0;

  items.forEach((item) => {
    const n = (item.dataset?.name || '').toLowerCase();
    const show = n.includes(q);
    item.style.display = show ? 'grid' : 'none';
    if (show) visible++;
  });

  const empty = document.getElementById('noResults');
  if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
}

// Кнопка очистки для инпута
function toggleClearButton() {
  const input = document.getElementById('search') as HTMLInputElement | null;
  const btn = document.getElementById('clearButton') as HTMLButtonElement | null;
  if (!input || !btn) return;
  btn.style.display =
    document.activeElement === input && input.value.trim().length
      ? 'flex'
      : 'none';
}

function clearInput() {
  const input = document.getElementById('search') as HTMLInputElement | null;
  if (!input) return;
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
  toggleClearButton();
}

// Init на готовность DOM
document.addEventListener('DOMContentLoaded', () => {
  // start
  document.getElementById('startButton')?.addEventListener('click', showApp);

  // поиск
  const search = document.getElementById('search') as HTMLInputElement | null;
  search?.addEventListener('input', () => {
    filterIcons();
    toggleClearButton();
  });
  search?.addEventListener('focus', toggleClearButton);
  search?.addEventListener('blur', () => setTimeout(toggleClearButton, 150));

  // clear
  const clearBtn = document.getElementById('clearButton');
  clearBtn?.addEventListener('mousedown', (e) => e.preventDefault());
  clearBtn?.addEventListener('click', clearInput);
});

// Экспортируем функции для inline-атрибутов в ui.html
window.insertIcon = insertIcon;
window.filterIcons = filterIcons;
window.clearInput = clearInput;

