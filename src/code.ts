// ===== Types =====
type UiToPlugin =
  | { type: 'ui-ready' }
  | { type: 'insert-icon-append'; name: string }
  | { type: 'open-url'; url: string };

const ICON_FONT_FAMILY = 'TutuIcons';
const ICON_REGULAR = 'Regular';
const ICON_BOLD = 'Bold';

// Окно плагина — строго 400×600
figma.showUI(__html__, { width: 400, height: 600, themeColors: true });

// ===== Helpers =====
async function loadIconFont(style: string) {
  await figma.loadFontAsync({ family: ICON_FONT_FAMILY, style });
}

async function loadAllFontsIn(node: TextNode) {
  if (node.characters.length === 0) return;
  const fonts = node.getRangeAllFontNames(0, node.characters.length);
  await Promise.all(fonts.map((f) => figma.loadFontAsync(f)));
}

// Определяем стиль текста на конце выделенной ноды
function detectStyleFromTextNode(node: TextNode): string {
  try {
    if (node.characters.length > 0) {
      const pos = Math.max(0, node.characters.length - 1);
      const f = node.getRangeFontName(pos, pos + 1);
      if (f !== figma.mixed) return (f as FontName).style;
    } else if (node.fontName !== figma.mixed) {
      return (node.fontName as FontName).style;
    }
  } catch {}
  return ICON_REGULAR;
}

// Маппинг «системного» стиля на стиль TutuIcons
function mapToIconStyle(textStyle: string): string {
  const map: Record<string, string> = {
    'Bold': ICON_BOLD,
    'DemiBold': ICON_BOLD,
    'SemiBold': ICON_BOLD,
    'Black': ICON_BOLD,
    'Heavy': ICON_BOLD,
    'Medium': ICON_REGULAR,
    'Regular': ICON_REGULAR,
    'Normal': ICON_REGULAR,
    'Light': ICON_REGULAR,
    'Thin': ICON_REGULAR,
  };
  return map[textStyle] ?? ICON_REGULAR;
}

async function createIconText(name: string, style: string) {
  await loadIconFont(style);
  const text = figma.createText();
  text.fontName = { family: ICON_FONT_FAMILY, style };
  text.characters = name;

  const { center } = figma.viewport;
  text.x = center.x;
  text.y = center.y;

  figma.currentPage.appendChild(text);
  return text;
}

async function appendIconToSelection(name: string) {
  const sel = figma.currentPage.selection[0];
  let node: TextNode | null =
    sel && sel.type === 'TEXT' ? (sel as TextNode) : null;

  // если нет выбранного текста — создаём новый
  if (!node) {
    const created = await createIconText(name, ICON_REGULAR);
    figma.currentPage.selection = [created];
    figma.viewport.scrollAndZoomIntoView([created]);
    return;
  }

  // грузим шрифты, уже используемые в ноде
  await loadAllFontsIn(node);

  // определяем стиль в ноде и транслируем в стиль TutuIcons
  const hostStyle = detectStyleFromTextNode(node);
  let desiredIconStyle = mapToIconStyle(hostStyle);

  // пробуем загрузить нужное начертание; если нет — откатываемся к Regular
  try {
    await loadIconFont(desiredIconStyle);
  } catch {
    desiredIconStyle = ICON_REGULAR;
    await loadIconFont(desiredIconStyle);
  }

  // вставляем и применяем шрифт к вставленному диапазону
  const start = node.characters.length;
  node.insertCharacters(start, name);
  node.setRangeFontName(start, start + name.length, {
    family: ICON_FONT_FAMILY,
    style: desiredIconStyle,
  });
}

// ===== Messages from UI =====
figma.ui.onmessage = async (msg: UiToPlugin) => {
  if (msg.type === 'ui-ready') {
    // Можно сделать что-то по готовности UI (не обязательно)
    return;
  }
  if (msg.type === 'insert-icon-append') {
    await appendIconToSelection(msg.name);
    return;
  }
  if (msg.type === 'open-url') {
    figma.openExternal(msg.url);
    return;
  }
};
