// Типы сообщений между UI и плагином
interface PluginMessage {
  type: 'insert-icon-append';
  name: string;
}

// Константы
const FONT_FAMILY = 'TutuIcons';
const FONT_STYLE = 'Regular';

// Функция для загрузки шрифтов
async function loadFonts() {
  try {
    await figma.loadFontAsync({ family: FONT_FAMILY, style: FONT_STYLE });
    console.log('Шрифт успешно загружен');
  } catch (err) {
    console.error('Ошибка загрузки шрифта:', err);
    figma.notify('Не удалось загрузить шрифт. Пожалуйста, убедитесь, что шрифт TutuIcons установлен в системе.');
  }
}

// Загружаем шрифты при инициализации плагина
loadFonts();

// Инициализация UI плагина
figma.showUI(__html__, { width: 300, height: 400 });

// Обработчик сообщений от UI
figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === 'insert-icon-append') {
    let node = figma.currentPage.selection[0] as TextNode | null;
    let insertAt = 0;

    // Если выбран текстовый слой, используем его, иначе создаем новый
    if (node && node.type === 'TEXT') {
      // Получаем позицию курсора, если есть выделение
      try {
        // Проверяем, есть ли выделение в текстовом узле
        const hasSelection = 'selectionStart' in node && 'selectionEnd' in node;
        
        if (hasSelection) {
          const textNode = node as any;
          // Если есть выделение, используем его конец как позицию вставки
          insertAt = textNode.selectionEnd || node.characters.length;
        } else {
          // Если нет выделения, вставляем в конец текста
          insertAt = node.characters.length;
        }
      } catch (e) {
        console.warn('Не удалось определить позицию курсора:', e);
        // В случае ошибки вставляем в конец текста
        insertAt = node.characters.length;
      }
    } else {
      // Создаем новый текстовый слой
      node = figma.createText();
      node.x = figma.viewport.center.x;
      node.y = figma.viewport.center.y;
      
      // Устанавливаем начальный шрифт
      await loadFonts();
      node.fontName = { family: FONT_FAMILY, style: FONT_STYLE };
      node.characters = '';
      
      // Добавляем на текущую страницу
      figma.currentPage.appendChild(node);
      figma.currentPage.selection = [node];
    }

    try {
      // Загружаем текущий шрифт, если есть текст
      if (node.characters.length > 0 && node.fontName !== figma.mixed) {
        await figma.loadFontAsync(node.fontName as FontName);
      } else {
        // Если текста нет, используем шрифт иконок
        await loadFonts();
        node.fontName = { family: FONT_FAMILY, style: FONT_STYLE };
      }

      // Вставляем иконку
      node.insertCharacters(insertAt, msg.name);

      // Назначаем шрифт только что вставленной иконке
      node.setRangeFontName(insertAt, insertAt + msg.name.length, {
        family: FONT_FAMILY,
        style: FONT_STYLE
      });
    } catch (err) {
      console.error("Ошибка вставки иконки:", err);
      figma.notify("Не удалось вставить иконку: " + (err as Error).message);
    }
  }
};
