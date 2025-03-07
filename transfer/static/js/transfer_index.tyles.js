/**
 * 圧縮転送 JavaScript
 * 
 * このファイルは圧縮転送ツールの機能を実装するJavaScriptコードです。
 */



document.addEventListener('DOMContentLoaded', () => {
    // ===== 機能カードのアクティブ状態の処理 =====
    const featureCards = document.querySelectorAll('.feature-card');
    
    // まず全てのカードからactiveクラスを削除
    featureCards.forEach(card => {
      card.classList.remove('active');
    });
    
    // 圧縮転送カードをIDで特定してアクティブにする
    const compressCard = document.getElementById('compresscard');
    if (compressCard) {
      compressCard.classList.add('active');
    }
    
    featureCards.forEach(card => {
      // 圧縮転送カード以外にのみクリックイベントを追加
      if (card.id !== 'compresscard') {
        card.addEventListener('click', function() {
          // クリック時のビジュアルフィードバック
          featureCards.forEach(c => c.classList.remove('active'));
          this.classList.add('active');
        });
      }
    });


    // ===== 保存期間選択の処理 =====
    const retentionOptions = document.querySelectorAll('.retention-option');
    let selectedRetentionPeriod = '0.5'; // デフォルトは30分
    
    // 保存期間オプションのクリックイベント
    retentionOptions.forEach(option => {
      const radioInput = option.querySelector('input[type="radio"]');
      
      // 初期状態の設定
      if (radioInput.checked) {
        selectedRetentionPeriod = radioInput.value;
        option.classList.add('selected');
      }
      
      // クリックイベント
      option.addEventListener('click', () => {
        // 全てのオプションからselectedクラスを削除
        retentionOptions.forEach(opt => {
          opt.classList.remove('selected');
        });
        
        // クリックされたオプションにselectedクラスを追加
        option.classList.add('selected');
        
        // ラジオボタンをチェック
        radioInput.checked = true;
        
        // 選択された保存期間を更新
        selectedRetentionPeriod = radioInput.value;
        
        // ZIP共有情報が表示されている場合は期限を更新
        const zipShareInfo = document.querySelector('.zip-share-info');
        if (zipShareInfo && zipShareInfo.style.display !== 'none') {
          updateZipExpiryTime();
        }
      });
    });
    
    // 保存期間の値からテキスト表示を取得する関数
    function getRetentionPeriodText(value) {
      const periodMap = {
        '0.5': '30分',
        '1': '1時間',
        '6': '6時間',
        '12': '12時間',
        '24': '24時間',
        '48': '2日',
        '72': '3日'
      };
      return periodMap[value] || '不明';
    }
    
    
    // ===== ドラッグ&ドロップ機能の実装 =====
    const dragDropContainer = document.querySelector('.drag-drop-container');
    const fileInput = document.getElementById('file-upload');
    let selectedFiles = []; // 選択されたファイルを保存する配列
    
    // ドラッグ&ドロップコンテナをクリックしたらファイル選択ダイアログを開く
    if (dragDropContainer && fileInput) {
      dragDropContainer.addEventListener('click', () => {
        fileInput.click();
      });

      // ファイルが選択されたときの処理
      fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
          // 新しいファイルを追加（アップロード時間はnullで初期化）
          for (let i = 0; i < files.length; i++) {
            selectedFiles.push({
              file: files[i],
              uploadTime: null
            });
          }
          updateFileList();
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
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          // 新しいファイルを追加（アップロード時間はnullで初期化）
          for (let i = 0; i < files.length; i++) {
            selectedFiles.push({
              file: files[i],
              uploadTime: null
            });
          }
          updateFileList();
        }
      });
    }

    // 選択されたファイルリストを表示する関数
    function updateFileList() {
      if (selectedFiles.length > 0) {
        let fileListHTML = '<p>選択されたファイル:</p><ul class="file-list">';
        
        selectedFiles.forEach((fileObj) => {
          const fileSize = formatFileSize(fileObj.file.size);
          fileListHTML += `<li>${fileObj.file.name} <span class="file-size">(${fileSize})</span></li>`;
        });
        
        fileListHTML += '</ul>';
        dragDropContainer.innerHTML = fileListHTML;
      } else {
        dragDropContainer.innerHTML = '<p>ファイルをここにドラッグ&ドロップ</p>';
      }
    }

    // ファイルサイズを適切な単位に変換する関数
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }



    // ===== アップロードボタンの処理 =====
    const uploadButton = document.getElementById('upload-button');
    const resultContainer = document.getElementById('result-container');
    const generateBtn = document.getElementById('generate-btn');
    
    if (uploadButton) {
      uploadButton.addEventListener('click', () => {
        // ファイルが選択されているか確認
        if (fileInput && selectedFiles.length > 0) {
          // ファイルが選択されている場合、処理を開始
          
          // 処理中の表示
          uploadButton.textContent = '処理中...';
          uploadButton.disabled = true;

          // 未アップロードのファイルにのみアップロード時間を設定
          const uploadTime = new Date();
          selectedFiles = selectedFiles.map(fileObj => ({
            ...fileObj,
            uploadTime: fileObj.uploadTime || uploadTime
          }));
          
          // 実際のファイル処理はここに実装（現在はモック）
          setTimeout(() => {
            // 処理完了後、共有オプション設定画面を表示
            showSharingOptions();
            
            // ボタンを元に戻す
            uploadButton.textContent = 'アップロード';
            uploadButton.disabled = false;

            // ドラッグ&ドロップエリアをリセット
            dragDropContainer.innerHTML = '<p>ファイルをここにドラッグ&ドロップ</p>';
            selectedFiles = [];
          }, 1500); // 1.5秒後に結果を表示
        } else {
          // ファイルが選択されていない場合
          alert('共有するファイルを選択してください。');
          // ファイル選択ダイアログを開く
          if (fileInput) {
            fileInput.click();
          }
        }
      });
    }
    
    // 共有オプション設定画面を表示する関数
    function showSharingOptions() {
      if (resultContainer) {
        // 結果コンテナを表示
        resultContainer.style.display = 'block';
        
        // 結果コンテンツをクリア
        const resultContents = document.getElementById('result-contents');
        if (!resultContents.hasChildNodes()) {
          resultContents.innerHTML = '';
        }
        
        // 選択された保存期間（時間）を数値に変換
        const selectedRadio = document.querySelector('input[name="retention_period"]:checked');
        const retentionHours = parseFloat(selectedRadio.value);
        
        // ZIPファイル設定ボックスの表示/非表示を切り替え
        const zipContainer = document.getElementById('zip-container');
        if (zipContainer) {
          // 結果コンテンツ内のファイル数を数える
          const totalFiles = resultContents.querySelectorAll('.result-content').length + selectedFiles.length;
          
          // ファイルが2つ以上の場合はZIPファイル設定ボックスを表示
          if (totalFiles >= 2) {
            zipContainer.style.display = 'block';
            // ZIPファイル名の入力欄をクリア
            const zipFilenameInput = document.getElementById('zip-filename');
            if (zipFilenameInput) {
              zipFilenameInput.value = '';
            }
          }
        }
        
        // 各ファイルに対して.result-contentを生成
        selectedFiles.forEach((fileObj, index) => {
          const resultContent = document.createElement('div');
          resultContent.className = 'result-content';
          
          // 一意のIDを生成
          const uniqueId = `file-${index}-${Date.now()}`;
          
          // このファイルの期限時刻を計算
          const expiryTime = new Date(fileObj.uploadTime.getTime() + retentionHours * 60 * 60 * 1000);
          
          // 期限の表示形式を設定
          const expiryTimeString = expiryTime.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          resultContent.innerHTML = `
            <div class="form-group">
              <div class="uploaded-file-info">
                <div class="uploaded-filename">
                  ${fileObj.file.name}
                  <span style="font-size: 0.85rem; color: #666; margin-left: 10px;">
                    期限: ${expiryTimeString}
                  </span>
                </div>
              </div>
              
              <div class="position-inputs">
                <div class="input-wrapper">
                  <div class="input-group url-display">
                    <input type="text" class="form-control first-input share-url" id="share-url-${uniqueId}" readonly value="https://example.com/share/${generateRandomString(10)}" />
                    <button class="copy-btn copy-url-btn" data-target="share-url-${uniqueId}">コピー</button>
                  </div>
                </div>
              </div>
              
              <div class="position-inputs">
                <div class="input-wrapper">
                  <div class="input-group password-group">
                    <input type="text" class="form-control download-password" id="download-password-${uniqueId}" placeholder="パスワードを入力（任意）" />
                    <button class="generate-password-btn" data-target="download-password-${uniqueId}">設定</button>
                    <button class="copy-btn copy-password-btn" data-target="download-password-${uniqueId}">コピー</button>
                  </div>
                </div>
              </div>
              
              <div class="position-inputs">
                <div class="input-wrapper">
                  <div class="qr-container">
                    <button class="qr-display-btn" data-target="qr-${uniqueId}">QRコードを表示</button>
                    <div class="qr-code" id="qr-code-${uniqueId}" style="display: none;">
                      <div class="qr-placeholder">QRコードを生成中...</div>
                    </div>
                    <div class="qr-options" id="qr-options-${uniqueId}" style="display: none;">
                      <button class="qr-btn download-qr-btn" data-target="qr-${uniqueId}">QRコードを保存</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
          
          // 新しい要素をDOMに追加
          resultContents.appendChild(resultContent);
          
          // イベントリスナーを設定
          setupEventListeners(resultContent, uniqueId);
        });
        
        // スムーズにスクロール
        resultContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // 各要素のイベントリスナーを設定する関数
    function setupEventListeners(container, uniqueId) {
      // URLコピーボタン
      const copyUrlBtn = container.querySelector('.copy-url-btn');
      copyUrlBtn.addEventListener('click', function() {
        const shareUrlInput = document.getElementById(`share-url-${uniqueId}`);
        copyToClipboard(shareUrlInput, this);
      });

      // パスワード生成ボタン
      const generatePasswordBtn = container.querySelector('.generate-password-btn');
      generatePasswordBtn.addEventListener('click', function() {
        const passwordInput = document.getElementById(`download-password-${uniqueId}`);
        passwordInput.value = generateRandomPassword(8);
      });

      // パスワードコピーボタン
      const copyPasswordBtn = container.querySelector('.copy-password-btn');
      copyPasswordBtn.addEventListener('click', function() {
        const passwordInput = document.getElementById(`download-password-${uniqueId}`);
        if (passwordInput.value.trim() === '') {
          alert('コピーするパスワードがありません。パスワードを入力するか自動生成してください。');
          return;
        }
        copyToClipboard(passwordInput, this);
      });

      // QRコード表示/非表示ボタン
      const toggleQrBtn = container.querySelector('.qr-display-btn');
      const qrCode = document.getElementById(`qr-code-${uniqueId}`);
      const qrOptions = document.getElementById(`qr-options-${uniqueId}`);
      
      toggleQrBtn.addEventListener('click', function() {
        const isVisible = qrCode.style.display !== 'none';
        
        if (isVisible) {
          qrCode.style.display = 'none';
          qrOptions.style.display = 'none';
          this.textContent = 'QRコードを表示';
          this.classList.remove('active');
        } else {
          qrCode.style.display = 'block';
          qrOptions.style.display = 'flex';
          this.textContent = 'QRコードを非表示';
          this.classList.add('active');
          
          // QRコードを生成
          const shareUrl = document.getElementById(`share-url-${uniqueId}`).value;
          qrCode.innerHTML = `
            <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareUrl)}&size=120x120" 
                 alt="QRコード" width="120" height="120">
          `;
        }
      });

      // QRコードダウンロードボタン
      const downloadQrBtn = container.querySelector('.download-qr-btn');
      downloadQrBtn.addEventListener('click', function() {
        alert('QRコードの画像がダウンロードされました。');
      });
    }

    // クリップボードにコピーする汎用関数
    function copyToClipboard(input, button) {
      input.select();
      document.execCommand('copy');
      
      const originalText = button.textContent;
      button.textContent = 'コピー完了!';
      button.style.backgroundColor = '#28a745';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 2000);
    }

    // ===== QRコード表示の処理 =====
    const qrCodeContainer = document.getElementById('qr-code');
    const downloadQrBtn = document.getElementById('download-qr-btn');
    const printQrBtn = document.getElementById('print-qr-btn');
    
    // QRコードを生成する関数（実際の実装ではQRコードライブラリを使用）
    function generateQRCode() {
      if (qrCodeContainer) {
        // モック実装：QRコードの代わりに画像を表示
        qrCodeContainer.innerHTML = `
          <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareUrlInput.value)}&size=120x120" 
               alt="QRコード" width="120" height="120">
        `;
      }
    }
    
    // 共有リンク生成ボタンのイベントリスナー
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        // 処理中の表示
        generateBtn.textContent = '生成中...';
        generateBtn.disabled = true;
        
        // 実際の処理はここに実装（現在はモック）
        setTimeout(() => {
          // 共有URLを生成（実際の実装ではサーバーからのレスポンスを処理）
          const shareUrl = `https://share.example.com/${generateRandomString(10)}`;
          shareUrlInput.value = shareUrl;
          
          // QRコードを生成
          generateQRCode();
          
          // 処理完了のメッセージ
          const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
          
          let message = `${selectedFiles.length}個のファイルを共有用にアップロードしました。\n`;
          message += `合計サイズ: ${formatFileSize(totalSize)}\n`;
          message += `保存期間: ${getRetentionPeriodText(selectedRetentionPeriod)}\n\n`;
          
          if (downloadPasswordInput.value) {
            message += `パスワード: ${downloadPasswordInput.value}\n`;
            message += `※パスワードは大切に保管してください。`;
          } else {
            message += `共有URLが生成されました。URLをコピーして共有できます。`;
          }
          
          alert(message);
          
          // ボタンを元に戻す
          generateBtn.textContent = '共有リンク生成';
          generateBtn.disabled = false;
        }, 2000);
      });
    }
    
    // ランダムな文字列を生成する関数
    function generateRandomString(length) {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
      }
      
      return result;
    }
    
    // QRコードのダウンロードボタンのイベントリスナー
    if (downloadQrBtn) {
      downloadQrBtn.addEventListener('click', () => {
        // 実際の実装ではQRコード画像をダウンロード
        alert('QRコードの画像がダウンロードされました。');
      });
    }
    
    // QRコードの印刷ボタンのイベントリスナー
    if (printQrBtn) {
      printQrBtn.addEventListener('click', () => {
        // 印刷用ウィンドウを開く
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>QRコード印刷</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                h2 { margin-bottom: 20px; }
                .qr-container { margin: 20px auto; }
                .url { margin-top: 20px; word-break: break-all; color: #666; }
                .info { margin-top: 30px; font-size: 0.9rem; color: #888; }
              </style>
            </head>
            <body>
              <h2>共有ファイルQRコード</h2>
              <div class="qr-container">
                <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareUrlInput.value)}&size=200x200" 
                     alt="QRコード" width="200" height="200">
              </div>
              <div class="url">${shareUrlInput.value}</div>
              <div class="info">
                <p>保存期間: ${getRetentionPeriodText(selectedRetentionPeriod)}</p>
                <p>スキャンしてファイルにアクセス</p>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      });
    }

    // QRコード表示ボタンのイベントリスナー
    const toggleQrBtn = document.getElementById('toggle-qr-btn');
    const qrOptions = document.querySelector('.qr-options');

    if (toggleQrBtn && qrCode && qrOptions) {
      toggleQrBtn.addEventListener('click', () => {
        const isVisible = qrCode.style.display !== 'none';
        
        if (isVisible) {
          // QRコードを非表示にする
          qrCode.style.display = 'none';
          qrOptions.style.display = 'none';
          toggleQrBtn.textContent = 'QRコードを表示';
          toggleQrBtn.classList.remove('active');
        } else {
          // QRコードを表示する
          qrCode.style.display = 'block';
          qrOptions.style.display = 'flex';
          toggleQrBtn.textContent = 'QRコードを非表示';
          toggleQrBtn.classList.add('active');
        }
      });
    }

    // ===== ZIPファイル関連の処理 =====
    const zipCreateButton = document.getElementById('zip-create-button');
    const zipFilenameInput = document.getElementById('zip-filename');
    const zipDisplayFilename = document.getElementById('zip-display-filename');
    const zipExpiryTime = document.getElementById('zip-expiry-time');
    const zipShareInfo = document.querySelector('.zip-share-info');
    const zipShareUrl = document.getElementById('zip-share-url');
    const zipQrDisplayBtn = document.querySelector('[data-target="zip-qr"]');
    const zipQrCode = document.getElementById('zip-qr-code');
    const zipQrOptions = document.getElementById('zip-qr-options');

    // 自動ファイル名を生成する関数
    function generateDefaultZipFilename() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '');
        const timeStr = now.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/:/g, '');
        const randomStr = generateRandomString(4);
        return `archive_${dateStr}_${timeStr}_${randomStr}`;
    }

    // ZIPファイル名入力時の処理
    if (zipFilenameInput) {
        zipFilenameInput.addEventListener('input', (e) => {
            // 入力時のファイル名表示更新を削除
        });
    }

    // ZIPファイルのQRコード表示/非表示の処理
    if (zipQrDisplayBtn && zipQrCode && zipQrOptions) {
        zipQrDisplayBtn.addEventListener('click', () => {
            const isVisible = zipQrCode.style.display !== 'none';
            
            if (isVisible) {
                zipQrCode.style.display = 'none';
                zipQrOptions.style.display = 'none';
                zipQrDisplayBtn.textContent = 'QRコードを表示';
                zipQrDisplayBtn.classList.remove('active');
            } else {
                zipQrCode.style.display = 'block';
                zipQrOptions.style.display = 'flex';
                zipQrDisplayBtn.textContent = 'QRコードを非表示';
                zipQrDisplayBtn.classList.add('active');

                // QRコードを生成
                const shareUrl = document.getElementById('zip-share-url').value;
                if (shareUrl) {
                    zipQrCode.innerHTML = `
                        <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareUrl)}&size=120x120" 
                             alt="QRコード" width="120" height="120">
                    `;
                } else {
                    zipQrCode.innerHTML = '<div class="qr-placeholder">共有URLが生成されていません</div>';
                }
            }
        });

        // QRコードダウンロードボタンの処理
        const zipQrDownloadBtn = document.querySelector('[data-target="zip-qr"].download-qr-btn');
        if (zipQrDownloadBtn) {
            zipQrDownloadBtn.addEventListener('click', () => {
                const shareUrl = document.getElementById('zip-share-url').value;
                if (shareUrl) {
                    // 実際のダウンロード処理をここに実装
                    alert('QRコードの画像がダウンロードされました。');
                } else {
                    alert('共有URLが生成されていません。');
                }
            });
        }
    }

    // ZIPファイル作成ボタンのクリックイベント
    if (zipCreateButton) {
        zipCreateButton.addEventListener('click', () => {
            let filename = zipFilenameInput.value;
            
            // ファイル名が未入力の場合は自動生成
            if (!filename) {
                filename = generateDefaultZipFilename();
                zipFilenameInput.value = filename;
            }

            // ファイル名を表示
            if (zipDisplayFilename) {
                zipDisplayFilename.textContent = `${filename}.zip`;
            }

            // 共有情報セクションを表示
            if (zipShareInfo) {
                zipShareInfo.style.display = 'block';
            }

            // 期限とファイル数を更新
            if (zipExpiryTime) {
                // 全てのアップロードされたファイルの期限を取得
                const resultContents = document.getElementById('result-contents');
                const allExpiryTimes = [];
                
                // 既存のファイルの期限を収集
                resultContents.querySelectorAll('.uploaded-filename span').forEach(span => {
                    const expiryText = span.textContent;
                    if (expiryText && expiryText.includes('期限: ')) {
                        const dateStr = expiryText.replace('期限: ', '');
                        allExpiryTimes.push(new Date(dateStr));
                    }
                });

                // ファイル数を取得
                const totalFiles = resultContents.querySelectorAll('.result-content').length;

                // 最も早い期限を見つける
                if (allExpiryTimes.length > 0) {
                    const earliestExpiry = new Date(Math.min(...allExpiryTimes));
                    const expiryTimeString = earliestExpiry.toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    zipExpiryTime.textContent = `期限: ${expiryTimeString}　|　ファイル数: ${totalFiles}個`;
                }
            }

            // 共有URLを生成
            if (zipShareUrl) {
                zipShareUrl.value = `https://example.com/share/zip/${generateRandomString(10)}`;
            }
        });
    }
});
      