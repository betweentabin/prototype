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
      'vertical-position': '0'
    };
  }
  
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
      
      // 選択された行の設定を表示
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
    const settings = lineSettings[lineNumber];
    
    // 該当タブ内の設定要素を更新
    const settingElements = document.querySelectorAll(`#${tabId} .line-specific-setting`);
    settingElements.forEach(element => {
      const settingType = element.getAttribute('data-setting-type');
      if (settings[settingType] !== undefined) {
        element.value = settings[settingType];
        
        // カラーピッカーの場合はプレビューも更新
        if (settingType === 'font-color') {
          const preview = document.getElementById('font-color-preview');
          if (preview) {
            preview.style.backgroundColor = settings[settingType];
          }
        }
      }
    });
  }
  
  // カラーピッカーのプレビュー更新
  const bgColorInput = document.getElementById('bg-color');
  const bgColorPreview = document.getElementById('bg-color-preview');
  
  // 初期値を設定
  if (bgColorPreview && bgColorInput) {
    bgColorPreview.style.backgroundColor = bgColorInput.value;
  }
  
  bgColorInput.addEventListener('input', function() {
    bgColorPreview.style.backgroundColor = this.value;
  });
  
  const fontColorInput = document.getElementById('font-color');
  const fontColorPreview = document.getElementById('font-color-preview');
  
  // 初期値を設定
  if (fontColorPreview && fontColorInput) {
    fontColorPreview.style.backgroundColor = fontColorInput.value;
  }
  
  fontColorInput.addEventListener('input', function() {
    fontColorPreview.style.backgroundColor = this.value;
    
    // 現在選択されている行の設定を更新
    const tabId = this.closest('.tab-content').id;
    const lineSelector = document.querySelector(`#${tabId} .line-selector`);
    const selectedLine = lineSelector.value;
    lineSettings[selectedLine]['font-color'] = this.value;
  });
  
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