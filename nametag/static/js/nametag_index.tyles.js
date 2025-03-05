/**
 * 名札生成 JavaScript
 * 
 * このファイルは名札生成ツールの機能を実装するJavaScriptコードです。
 */



document.addEventListener('DOMContentLoaded', () => {
    // ===== 機能カードのアクティブ状態の処理 =====
    const featureCards = document.querySelectorAll('.feature-card');
    
    // まず全てのカードからactiveクラスを削除
    featureCards.forEach(card => {
      card.classList.remove('active');
    });
    
    // 名札生成カードをIDで特定してアクティブにする
    const nameCard = document.getElementById('namecard');
    if (nameCard) {
      nameCard.classList.add('active');
    }
    
    featureCards.forEach(card => {
      // 名札生成カード以外にのみクリックイベントを追加
      if (card.id !== 'namecard') {
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
    
    if (uploadButton) {
      uploadButton.addEventListener('click', () => {
        // ファイルが選択されているか確認
        if (fileInput && fileInput.files.length > 0) {
          alert('ファイルがアップロードされました。この機能は現在開発中です。');
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
    
    // ===== テンプレートダウンロードボタンの処理 =====
    const templateDownloadBtn = document.getElementById('template-download-btn');
    if (templateDownloadBtn) {
      templateDownloadBtn.addEventListener('click', () => {
        alert('テンプレートのダウンロード機能は現在開発中です。');
      });
    }
}); 