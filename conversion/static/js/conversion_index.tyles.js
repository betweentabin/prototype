/**
 * 形式変換 JavaScript
 * 
 * このファイルは形式変換ツールの機能を実装するJavaScriptコードです。
 */



document.addEventListener('DOMContentLoaded', () => {
    // ===== 機能カードのアクティブ状態の処理 =====
    const featureCards = document.querySelectorAll('.feature-card');
    
    // まず全てのカードからactiveクラスを削除
    featureCards.forEach(card => {
      card.classList.remove('active');
    });
    
    // 形式変換カードをIDで特定してアクティブにする
    const formatCard = document.getElementById('formatcard');
    if (formatCard) {
      formatCard.classList.add('active');
    }
    
    featureCards.forEach(card => {
      // 形式変換カード以外にのみクリックイベントを追加
      if (card.id !== 'formatcard') {
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
            // 処理完了後、変換オプション設定画面を表示
            showConversionOptions();
            
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
    
    // 変換オプション設定画面を表示する関数
    function showConversionOptions() {
      if (resultContainer) {
        // 結果コンテナを表示
        resultContainer.style.display = 'block';
        
        // スムーズにスクロール
        resultContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // 変換を実行するボタンのイベントリスナー
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        // 変換処理中の表示
        generateBtn.textContent = '変換中...';
        generateBtn.disabled = true;
        
        // 実際の変換処理はここに実装（現在はモック）
        setTimeout(() => {
          // 処理完了後
          alert('ファイルの変換が完了しました。ダウンロードを開始します。');
          
          // ダウンロード処理（実際の実装ではサーバーからのレスポンスを処理）
          // ここではモックとしてダミーのダウンロードリンクを作成
          const downloadLink = document.createElement('a');
          downloadLink.href = '#'; // 実際のダウンロードURLに置き換え
          downloadLink.download = '変換済みファイル.pdf'; // 実際のファイル名に置き換え
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          // ボタンを元に戻す
          generateBtn.textContent = '変換を実行';
          generateBtn.disabled = false;
        }, 2000); // 2秒後に完了（実際の処理では適切な時間に変更）
      });
    }
});
      