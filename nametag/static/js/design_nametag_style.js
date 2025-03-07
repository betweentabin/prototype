/**
 * 名札デザインJavaScript
 * 
 * このファイルは名札生成ツールの機能を実装するJavaScriptコードです。
 */



document.addEventListener('DOMContentLoaded', function() {
  // 行ごとの設定を保存するオブジェクト
  const lineSettings = {};
  
  // 初期設定を各行に適用
  for (let i = 1; i <= 10; i++) {
    lineSettings[i] = {
      'font-family': 'sans-serif',
      'font-size': '16',
      'font-color': '#000000',
      'text-align': 'center',
      'horizontal-position': '0',
      'vertical-position': '0',
      'cmyk': { c: 100, m: 100, y: 100, k: 0 }  // デフォルトを黒（CMY=100%, K=0%）に設定
    };
  }
  
  // QRコードの初期設定
  lineSettings['qr'] = {
    'qr-size': '100',
    'qr-color': '#000000',
    'horizontal-position': '0',
    'vertical-position': '0',
    'cmyk': { c: 100, m: 100, y: 100, k: 0 }
  };
  
  // タブ切り替え機能
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabLinks.forEach(link => {
    link.addEventListener('click', function() {
      // アクティブなタブリンクのクラスを削除
      tabLinks.forEach(item => item.classList.remove('active'));
      // クリックされたタブリンクにアクティブクラスを追加
      this.classList.add('active');
      
      // すべてのタブコンテンツを非表示
      tabContents.forEach(content => content.classList.remove('active'));
      // クリックされたタブに対応するコンテンツを表示
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // 行選択時の処理
  const lineSelectors = document.querySelectorAll('.line-selector');
  lineSelectors.forEach(selector => {
    selector.addEventListener('change', function() {
      const selectedLine = this.value;
      const tabId = this.closest('.tab-content').id;
      
      if (tabId === 'font') {
        // QRコード選択時の表示切り替え
        const textSettings = document.getElementById('text-settings');
        const qrSettings = document.getElementById('qr-settings');
        
        if (selectedLine === 'qr') {
          textSettings.style.display = 'none';
          qrSettings.style.display = 'block';
          
          // QRコードの設定を表示
          const settings = lineSettings['qr'];
          document.getElementById('qr-size').value = settings['qr-size'];
          document.getElementById('qr-color').value = settings['qr-color'];
          
          // CMYKスライダーを更新
          const cmyk = settings.cmyk;
          document.getElementById('qr-cyan').value = cmyk.c;
          document.getElementById('qr-magenta').value = cmyk.m;
          document.getElementById('qr-yellow').value = cmyk.y;
          document.getElementById('qr-black').value = cmyk.k;
          
          // 値の表示を更新
          document.querySelectorAll('#qr-cyan + .cmyk-value')[0].textContent = `${cmyk.c}%`;
          document.querySelectorAll('#qr-magenta + .cmyk-value')[0].textContent = `${cmyk.m}%`;
          document.querySelectorAll('#qr-yellow + .cmyk-value')[0].textContent = `${cmyk.y}%`;
          document.querySelectorAll('#qr-black + .cmyk-value')[0].textContent = `${cmyk.k}%`;
        } else {
          textSettings.style.display = 'block';
          qrSettings.style.display = 'none';
          
          if (selectedLine === 'all') {
            // All選択時は最後に選択されていた行のCMYK値を表示
            const lastSelectedLine = lineSettings[1];
            const cmyk = lastSelectedLine.cmyk;
            
            // CMYKスライダーを更新
            document.getElementById('font-cyan').value = cmyk.c;
            document.getElementById('font-magenta').value = cmyk.m;
            document.getElementById('font-yellow').value = cmyk.y;
            document.getElementById('font-black').value = cmyk.k;
            
            // 値の表示を更新
            document.querySelectorAll('#font-cyan + .cmyk-value')[0].textContent = `${cmyk.c}%`;
            document.querySelectorAll('#font-magenta + .cmyk-value')[0].textContent = `${cmyk.m}%`;
            document.querySelectorAll('#font-yellow + .cmyk-value')[0].textContent = `${cmyk.y}%`;
            document.querySelectorAll('#font-black + .cmyk-value')[0].textContent = `${cmyk.k}%`;
            
            // カラーピッカーも更新
            document.getElementById('font-color').value = lastSelectedLine['font-color'];
          } else {
            // 個別の行選択時は、その行の保存されているCMYK値を表示
            const settings = lineSettings[selectedLine];
            const cmyk = settings.cmyk;
            
            // CMYKスライダーを更新
            document.getElementById('font-cyan').value = cmyk.c;
            document.getElementById('font-magenta').value = cmyk.m;
            document.getElementById('font-yellow').value = cmyk.y;
            document.getElementById('font-black').value = cmyk.k;
            
            // 値の表示を更新
            document.querySelectorAll('#font-cyan + .cmyk-value')[0].textContent = `${cmyk.c}%`;
            document.querySelectorAll('#font-magenta + .cmyk-value')[0].textContent = `${cmyk.m}%`;
            document.querySelectorAll('#font-yellow + .cmyk-value')[0].textContent = `${cmyk.y}%`;
            document.querySelectorAll('#font-black + .cmyk-value')[0].textContent = `${cmyk.k}%`;
            
            // カラーピッカーも更新
            document.getElementById('font-color').value = settings['font-color'];
          }
        }
      }
      
      // その他の設定を表示
      updateSettingsDisplay(selectedLine, tabId);
    });
  });
  
  // 設定変更時の処理
  const lineSpecificSettings = document.querySelectorAll('.line-specific-setting');
  lineSpecificSettings.forEach(setting => {
    setting.addEventListener('change', function() {
      const settingType = this.getAttribute('data-setting-type');
      const tabId = this.closest('.tab-content').id;
      const lineSelector = document.querySelector(`#${tabId} .line-selector`);
      const selectedLine = lineSelector.value;
      
      // 設定を保存
      lineSettings[selectedLine][settingType] = this.value;
      
      // カラーピッカーの場合はプレビューも更新
      if (settingType === 'font-color') {
        const preview = document.getElementById('font-color-preview');
        if (preview) {
          preview.style.backgroundColor = this.value;
        }
      }
    });
  });
  
  // 選択された行の設定を表示する関数
  function updateSettingsDisplay(lineNumber, tabId) {
    if (lineNumber === 'all') return;
    
    const settings = lineSettings[lineNumber];
    
    // 該当タブ内の設定要素を更新
    const settingElements = document.querySelectorAll(`#${tabId} .line-specific-setting`);
    settingElements.forEach(element => {
      const settingType = element.getAttribute('data-setting-type');
      if (settings[settingType] !== undefined) {
        element.value = settings[settingType];
      }
    });
  }
  
  // CMYKからRGBへの変換関数
  function cmykToRgb(c, m, y, k) {
    // CMYK値を0-1の範囲に変換
    c = Math.min(100, Math.max(0, c)) / 100;
    m = Math.min(100, Math.max(0, m)) / 100;
    y = Math.min(100, Math.max(0, y)) / 100;
    k = Math.min(100, Math.max(0, k)) / 100;

    // RGB値を計算
    let r = Math.round(255 * (1 - c) * (1 - k));
    let g = Math.round(255 * (1 - m) * (1 - k));
    let b = Math.round(255 * (1 - y) * (1 - k));

    // 値の範囲を0-255に制限
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return { r, g, b };
  }

  // RGBからCMYKへの変換関数
  function rgbToCmyk(r, g, b) {
    // RGB値を0-1の範囲に変換
    let r1 = r / 255;
    let g1 = g / 255;
    let b1 = b / 255;

    // CMYKの計算
    let k = 1 - Math.max(r1, g1, b1);
    let c = k === 1 ? 0 : (1 - r1 - k) / (1 - k);
    let m = k === 1 ? 0 : (1 - g1 - k) / (1 - k);
    let y = k === 1 ? 0 : (1 - b1 - k) / (1 - k);

    // 値を0-100の範囲に変換し、小数点以下を四捨五入
    c = Math.round(Math.min(100, Math.max(0, c * 100)));
    m = Math.round(Math.min(100, Math.max(0, m * 100)));
    y = Math.round(Math.min(100, Math.max(0, y * 100)));
    k = Math.round(Math.min(100, Math.max(0, k * 100)));

    return { c, m, y, k };
  }

  // RGBをHEX形式に変換
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // HEXをRGB形式に変換
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // CMYKスライダーの更新処理
  function updateCmykSliders(prefix, hex, lineNumber = null) {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      
      if (prefix === 'font') {
        const selectedLine = lineNumber || document.getElementById('text-line-select-font').value;
        if (selectedLine === 'all') {
          // All選択時は全ての行のCMYK値を更新
          for (let i = 1; i <= 10; i++) {
            lineSettings[i].cmyk = cmyk;
            lineSettings[i]['font-color'] = hex;
          }
        } else {
          // 特定の行のCMYK値を更新
          lineSettings[selectedLine].cmyk = cmyk;
        }
      }

      // スライダーの値を更新
      document.getElementById(`${prefix}-cyan`).value = cmyk.c;
      document.getElementById(`${prefix}-magenta`).value = cmyk.m;
      document.getElementById(`${prefix}-yellow`).value = cmyk.y;
      document.getElementById(`${prefix}-black`).value = cmyk.k;

      // 値の表示を更新
      document.querySelectorAll(`#${prefix}-cyan + .cmyk-value`)[0].textContent = `${cmyk.c}%`;
      document.querySelectorAll(`#${prefix}-magenta + .cmyk-value`)[0].textContent = `${cmyk.m}%`;
      document.querySelectorAll(`#${prefix}-yellow + .cmyk-value`)[0].textContent = `${cmyk.y}%`;
      document.querySelectorAll(`#${prefix}-black + .cmyk-value`)[0].textContent = `${cmyk.k}%`;
    }
  }

  // カラーピッカーの初期化
  const bgColorPicker = document.getElementById('bg-color');
  const fontColorPicker = document.getElementById('font-color');
  
  // カラーピッカーのフォーマット設定
  [bgColorPicker, fontColorPicker].forEach(picker => {
    picker.addEventListener('click', function() {
      this.addEventListener('input', function() {
        // カラーピッカーのフォーマットメニューを取得
        const formatMenu = document.querySelector('.color-format-menu');
        if (formatMenu) {
          // HSLを削除し、HEXとRGBの順序を変更
          const formats = formatMenu.querySelectorAll('button');
          formats.forEach(format => {
            if (format.textContent.includes('HSL')) {
              format.style.display = 'none';
            }
          });
          // HEXとRGBの順序を変更
          const hexFormat = Array.from(formats).find(f => f.textContent.includes('HEX'));
          const rgbFormat = Array.from(formats).find(f => f.textContent.includes('RGB'));
          if (hexFormat && rgbFormat) {
            formatMenu.insertBefore(hexFormat, rgbFormat);
          }
        }
      }, { once: true });
    });
  });

  bgColorPicker.addEventListener('input', function(e) {
    const hex = e.target.value;
    updateCmykSliders('bg', hex);
  });

  // フォント色のCMYK制御
  fontColorPicker.addEventListener('input', function(e) {
    const hex = e.target.value;
    const selectedLine = document.getElementById('text-line-select-font').value;
    
    if (selectedLine === 'all') {
      // All選択時は全ての行の色を更新
      for (let i = 1; i <= 10; i++) {
        lineSettings[i]['font-color'] = hex;
        const cmyk = rgbToCmyk(hexToRgb(hex).r, hexToRgb(hex).g, hexToRgb(hex).b);
        lineSettings[i].cmyk = cmyk;
      }
    } else {
      // 個別の行の色のみ更新
      lineSettings[selectedLine]['font-color'] = hex;
    }
    updateCmykSliders('font', hex, selectedLine);
  });

  // CMYKスライダーの変更イベント処理
  ['bg', 'font'].forEach(prefix => {
    ['cyan', 'magenta', 'yellow', 'black'].forEach(color => {
      const slider = document.getElementById(`${prefix}-${color}`);
      slider.addEventListener('input', function(e) {
        const c = parseInt(document.getElementById(`${prefix}-cyan`).value);
        const m = parseInt(document.getElementById(`${prefix}-magenta`).value);
        const y = parseInt(document.getElementById(`${prefix}-yellow`).value);
        const k = parseInt(document.getElementById(`${prefix}-black`).value);

        const rgb = cmykToRgb(c, m, y, k);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

        if (prefix === 'bg') {
          bgColorPicker.value = hex;
        } else {
          const selectedLine = document.getElementById('text-line-select-font').value;
          if (selectedLine === 'all') {
            // All選択時は全ての行の色とCMYK値を更新
            for (let i = 1; i <= 10; i++) {
              lineSettings[i]['font-color'] = hex;
              lineSettings[i].cmyk = { c, m, y, k };
            }
          } else {
            // 個別の行の色とCMYK値のみ更新
            lineSettings[selectedLine]['font-color'] = hex;
            lineSettings[selectedLine].cmyk = { c, m, y, k };
          }
          fontColorPicker.value = hex;
        }

        // 値の表示を更新
        e.target.nextElementSibling.textContent = `${e.target.value}%`;
      });
    });
  });

  // 初期値の設定（デフォルトの黒を設定）
  const defaultCmyk = { c: 100, m: 100, y: 100, k: 0 };
  document.getElementById('font-cyan').value = defaultCmyk.c;
  document.getElementById('font-magenta').value = defaultCmyk.m;
  document.getElementById('font-yellow').value = defaultCmyk.y;
  document.getElementById('font-black').value = defaultCmyk.k;
  
  document.querySelectorAll('#font-cyan + .cmyk-value')[0].textContent = `${defaultCmyk.c}%`;
  document.querySelectorAll('#font-magenta + .cmyk-value')[0].textContent = `${defaultCmyk.m}%`;
  document.querySelectorAll('#font-yellow + .cmyk-value')[0].textContent = `${defaultCmyk.y}%`;
  document.querySelectorAll('#font-black + .cmyk-value')[0].textContent = `${defaultCmyk.k}%`;
  
  // テキスト入力の処理
  const lineTextInputs = document.querySelectorAll('.line-text');
  lineTextInputs.forEach(input => {
    input.addEventListener('input', function() {
      const lineNumber = this.getAttribute('data-line');
      const lineElement = document.querySelector(`.nametag-line[data-line="${lineNumber}"]`);
      if (lineElement) {
        lineElement.textContent = this.value;
      }
    });
  });
  
  // テキスト更新ボタンの処理
  const updateTextBtn = document.getElementById('update-text-btn');
  if (updateTextBtn) {
    updateTextBtn.addEventListener('click', function() {
      updateNametagText();
    });
  }
  
  // 名札のテキストを更新する関数
  function updateNametagText() {
    lineTextInputs.forEach(input => {
      const lineNumber = input.getAttribute('data-line');
      const lineElement = document.querySelector(`.nametag-line[data-line="${lineNumber}"]`);
      if (lineElement) {
        lineElement.textContent = input.value;
      }
    });
  }
  
  // プレビュー更新ボタンのイベントリスナー
  const previewBtn = document.getElementById('preview-btn');
  if (previewBtn) {
    previewBtn.addEventListener('click', function() {
      // プレビュー更新時のアニメーション
      const preview = document.querySelector('.nametag-preview');
      preview.classList.add('updating');
      setTimeout(() => {
        preview.classList.remove('updating');
      }, 500);
      
      // プレビューの更新処理
      updatePreview();
    });
  }
  
  // ダウンロードボタンのイベントリスナー
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      alert('名札のダウンロード機能は準備中です。');
    });
  }
  
  // プレビュー更新関数
  function updatePreview() {
    const nametagPreview = document.querySelector('.nametag-preview');
    const bgColor = document.getElementById('bg-color').value;
    
    // 背景色の更新
    nametagPreview.style.backgroundColor = bgColor;
    
    // 各行のスタイルを更新
    for (let i = 1; i <= 10; i++) {
      const lineElement = document.querySelector(`.nametag-line[data-line="${i}"]`);
      if (lineElement) {
        const settings = lineSettings[i];
        lineElement.style.fontFamily = settings['font-family'];
        lineElement.style.fontSize = settings['font-size'] + 'px';
        lineElement.style.color = settings['font-color'];
        lineElement.style.textAlign = settings['text-align'];
        lineElement.style.transform = `translate(${settings['horizontal-position']}px, ${settings['vertical-position']}px)`;
      }
    }
  }
  
  // 初期プレビューの更新
  updatePreview();
  updateNametagText();
}); 