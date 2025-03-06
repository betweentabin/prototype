/**
 * 目次生成 JavaScript
 * 
 * このファイルは目次生成ツールの機能を実装するJavaScriptコードです。
 */



document.addEventListener('DOMContentLoaded', () => {
    // ===== 機能カードのアクティブ状態の処理 =====
    const featureCards = document.querySelectorAll('.feature-card');
    
    // まず全てのカードからactiveクラスを削除
    featureCards.forEach(card => {
      card.classList.remove('active');
    });
    
    // 目次生成カードをIDで特定してアクティブにする
    const indexCard = document.getElementById('indexcard');
    if (indexCard) {
      indexCard.classList.add('active');
    }
    
    featureCards.forEach(card => {
      // 目次生成カード以外にのみクリックイベントを追加
      if (card.id !== 'indexcard') {
        card.addEventListener('click', function() {
          // クリック時のビジュアルフィードバック
          featureCards.forEach(c => c.classList.remove('active'));
          this.classList.add('active');
        });
      }
    });


    
    // ===== ドラッグ&ドロップ機能の実装 =====
    const dragDropContainer = document.querySelector('.drag-drop-container');
    const fileInput = document.getElementById('file-upload');

    // ドラッグ&ドロップコンテナをクリックしたらファイル選択ダイアログを開く
    if (dragDropContainer && fileInput) {
      dragDropContainer.addEventListener('click', () => {
        fileInput.click();
      });

      // ファイルが選択されたときの処理
      fileInput.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
          const fileName = event.target.files[0].name;
          dragDropContainer.innerHTML = `<p>選択されたファイル: ${fileName}</p>`;
        }
      });

      // ドラッグオーバー時のスタイル変更
      dragDropContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragDropContainer.style.borderColor = 'var(--secondary-color)';
        dragDropContainer.style.backgroundColor = '#f0f5ff';
      });

      // ドラッグリーブ時のスタイルを元に戻す
      dragDropContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragDropContainer.style.borderColor = '#ccc';
        dragDropContainer.style.backgroundColor = '#f9f9f9';
      });

      // ドロップ時のファイル処理
      dragDropContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDropContainer.style.borderColor = '#ccc';
        dragDropContainer.style.backgroundColor = '#f9f9f9';
        
        if (e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          // ファイル入力要素にファイルを設定
          fileInput.files = e.dataTransfer.files;
          dragDropContainer.innerHTML = `<p>選択されたファイル: ${file.name}</p>`;
        }
      });
    }



    // ===== アップロードボタンの処理 =====
    const uploadButton = document.getElementById('upload-button');
    const resultContainer = document.getElementById('result-container');
    const generateBtn = document.getElementById('generate-btn');
    
    if (uploadButton) {
      uploadButton.addEventListener('click', () => {
        // ファイルが選択されているか確認
        if (fileInput && fileInput.files.length > 0) {
          // ファイルが選択されている場合、処理を開始
          
          // 処理中の表示（オプション）
          uploadButton.textContent = '処理中...';
          uploadButton.disabled = true;
          
          // 実際のファイル処理はここに実装（現在はモック）
          setTimeout(() => {
            // 処理完了後、フォントサイズ設定画面を表示
            showFontSizeSettings();
            
            // ボタンを元に戻す
            uploadButton.textContent = 'アップロード';
            uploadButton.disabled = false;
          }, 1500); // 1.5秒後に結果を表示（実際の処理では適切な時間に変更）
        } else {
          // ファイルが選択されていない場合
          alert('アップロードするファイルを選択してください。');
          // ファイル選択ダイアログを開く
          if (fileInput) {
            fileInput.click();
          }
        }
      });
    }
    
    // フォントサイズ設定画面を表示する関数
    function showFontSizeSettings() {
      if (resultContainer) {
        // 結果コンテナを表示
        resultContainer.style.display = 'block';
        
        // スムーズにスクロール
        resultContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // フォントサイズを追加する関数
    const addPositionBtn = document.getElementById('add-position');
    const positionInputs = document.getElementById('position-inputs');
    
    if (addPositionBtn && positionInputs) {
      addPositionBtn.addEventListener('click', () => {
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';
        
        // 入力フィールドとプルダウンを含むグループを作成
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'form-control';
        input.placeholder = 'フォントサイズ（pt）';
        input.name = 'position_names';
        input.min = '1';
        input.max = '100';
        input.value = '';
        input.required = true;
        input.autocomplete = 'off';
        
        // 太字選択のプルダウンを作成
        const boldSelectDiv = document.createElement('div');
        boldSelectDiv.className = 'bold-select';
        
        const fontStyleSelect = document.createElement('select');
        fontStyleSelect.className = 'font-style-select';
        fontStyleSelect.name = 'font-style';
        
        // 通常オプション（デフォルト選択）
        const normalOption = document.createElement('option');
        normalOption.value = 'normal';
        normalOption.textContent = '通常';
        normalOption.selected = true; // 明示的に「通常」をデフォルトに設定
        
        // 太字オプション
        const boldOption = document.createElement('option');
        boldOption.value = 'bold';
        boldOption.textContent = '太字';
        
        fontStyleSelect.appendChild(normalOption);
        fontStyleSelect.appendChild(boldOption);
        
        boldSelectDiv.appendChild(fontStyleSelect);
        
        // 削除ボタンを作成
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => {
          inputWrapper.remove();
        });
        
        // 入力フィールドとプルダウンをグループに追加
        inputGroup.appendChild(input);
        inputGroup.appendChild(boldSelectDiv);
        
        // グループと削除ボタンをラッパーに追加
        inputWrapper.appendChild(inputGroup);
        inputWrapper.appendChild(removeBtn);
        
        positionInputs.appendChild(inputWrapper);
      });
    }
    
    // 目次生成ボタンの処理
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        // フォントサイズと太字設定を収集
        const fontSettings = [];
        const inputWrappers = document.querySelectorAll('.input-wrapper');
        
        inputWrappers.forEach(wrapper => {
          const sizeInput = wrapper.querySelector('.form-control');
          const styleSelect = wrapper.querySelector('.font-style-select');
          
          if (sizeInput) {
            const size = parseInt(sizeInput.value) || 16;
            const isBold = styleSelect ? styleSelect.value === 'bold' : false;
            
            fontSettings.push({
              size: size,
              bold: isBold
            });
          }
        });
        
        // 設定を表示（実際の実装では、この情報を使って目次を生成）
        console.log('フォント設定:', fontSettings);
        
        // 目次生成処理（モック）
        alert('目次を生成しています。この機能は現在開発中です。');
      });
    }
});
      