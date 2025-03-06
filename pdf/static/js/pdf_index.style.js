/**
 * PDF処理ツール JavaScript
 * 
 * このファイルはPDFツールの機能を実装するJavaScriptコードです。
 * 主な機能:
 * - PDF結合: 複数のPDFファイルを1つに結合
 * - PDF分割: PDFファイルを複数に分割
 * - PDF抽出: PDFから特定のページを抽出
 * - PDF削除: PDFから特定のページを削除
 * 
 * 各機能はユーザーインターフェースと連携し、PDFファイルの
 * プレビュー表示やページ選択、フォーム送信などを処理します。
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== 機能カードのアクティブ状態の処理 =====
  const featureCards = document.querySelectorAll('.feature-card');
  
  // まず全てのカードからactiveクラスを削除
  featureCards.forEach(card => {
    card.classList.remove('active');
  });
  
  // 7つ目のカード（インデックス6）だけをアクティブにする
  if (featureCards.length >= 7) {
    featureCards[6].classList.add('active');
    // アクティブカードのクリックイベントを無効化
    featureCards[6].style.pointerEvents = 'none';
  }
  
  featureCards.forEach((card, index) => {
    // 7番目のカード以外にのみクリックイベントを追加
    if (index !== 6) {
      card.addEventListener('click', function() {
        // クリック時のビジュアルフィードバック
        featureCards.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
      });
    }
  });

  // ===== PDF機能カードのクリックイベント処理 =====
  const pdfFunctionCards = document.querySelectorAll('.pdf-function-card');
  
  pdfFunctionCards.forEach(card => {
    card.addEventListener('click', function() {
      // クリック時のビジュアルフィードバック
      pdfFunctionCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      // カードがクリックされたときのアニメーション（押し込まれる効果）
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 100);
    });
  });

  // 現在のURLに基づいて、対応するPDF機能カードをアクティブにする
  const currentPath = window.location.pathname;
  pdfFunctionCards.forEach(card => {
    const cardLink = card.getAttribute('onclick');
    if (cardLink) {
      const linkPath = cardLink.match(/'([^']+)'/)[1];
      if (currentPath.includes(linkPath)) {
        card.classList.add('active');
      }
    }
  });

  // ===== PDFファイルのプレビュー処理 =====
  setupPdfPreview();
});

// ===== PDF結合用の変数 =====
let pdfFilesToCombine = [];

// ===== PDF分割用の変数 =====
let currentSplitPoints = new Set();
let totalPagesCount = 0;
let pdfGroups = [];
let lastUploadedSplitFile = null; // 最後にアップロードした分割用PDFファイルを保存
let splitPagesRendered = false; // 分割ページがレンダリング済みかどうかのフラグ
let splitLinesRemoved = false; // 分割線が削除されたかどうかのフラグ
let savedSplitLines = []; // 分割線を保存する配列

// ===== PDF抽出と削除用の変数 =====
let extractSelectedPages = new Set();
let deleteSelectedPages = new Set();

// ===== PDFファイルのプレビュー機能をセットアップ =====
function setupPdfPreview() {
  // PDF結合機能のファイル選択イベント
  const pdfUpload = document.getElementById('pdfUpload');
  if (pdfUpload) {
    pdfUpload.addEventListener('change', function(e) {
      if (this.files.length > 0) {
        console.log(`ファイル選択: ${this.files.length}個のファイルが選択されました`);
        
        // プレビューを表示
        const pdfPreview = document.getElementById('pdfPreview');
        if (pdfPreview) {
          pdfPreview.style.display = 'block';
        }
        
        // 選択されたすべてのファイルを処理（既存のリストに追加）
        for (let i = 0; i < this.files.length; i++) {
          addPdfToCombineList(this.files[i]);
        }
        
        // 入力フィールドをリセット（同じファイルを再度選択できるように）
        this.value = '';
      }
    });
  }

  // PDF分割機能
  const pdfFile = document.getElementById('pdfFile');
  if (pdfFile) {
    pdfFile.addEventListener('change', function(e) {
      if (this.files.length > 0) {
        const file = this.files[0];
        console.log(`PDF分割: ${file.name}を選択しました`);
        
        // 新しいファイルがアップロードされた場合、キャッシュをリセット
        if (!lastUploadedSplitFile || 
            lastUploadedSplitFile.name !== file.name || 
            lastUploadedSplitFile.size !== file.size) {
          splitPagesRendered = false;
          // 新しいファイルの場合は分割線削除フラグもリセット
          splitLinesRemoved = false;
        }
        
        // ファイル参照を保存
        lastUploadedSplitFile = file;
        
        // プレビューを表示
        const pagePreview = document.getElementById('pagePreview');
        if (pagePreview) {
          pagePreview.style.display = 'block';
          const fileNameElement = pagePreview.querySelector('.file-name');
          if (fileNameElement) {
            fileNameElement.textContent = file.name;
          }
        } else {
          console.error('pagePreview要素が見つかりません');
        }
        
        // 分割ポイントをリセット
        currentSplitPoints.clear();
        
        previewPdfPages(file, 'pageContainer', 'totalPages');
      }
    });
  } else {
    console.error('pdfFile要素が見つかりません');
  }

  // PDF抽出機能
  const extractFile = document.getElementById('extractFile');
  if (extractFile) {
    extractFile.addEventListener('change', function(e) {
      if (this.files.length > 0) {
        const file = this.files[0];
        console.log(`PDF抽出: ${file.name}を選択しました`);
        
        // プレビューを表示
        const extractPreview = document.getElementById('extractPreview');
        if (extractPreview) {
          extractPreview.style.display = 'block';
          const fileNameElement = extractPreview.querySelector('.file-name');
          if (fileNameElement) {
            fileNameElement.textContent = file.name;
          }
        } else {
          console.error('extractPreview要素が見つかりません');
        }
        
        previewPdfPages(file, 'extractPageContainer', 'extractTotalPages');
      }
    });
  } else {
    console.error('extractFile要素が見つかりません');
  }

  // PDF削除機能
  const deleteFile = document.getElementById('deleteFile');
  if (deleteFile) {
    deleteFile.addEventListener('change', function(e) {
      if (this.files.length > 0) {
        const file = this.files[0];
        console.log(`PDF削除: ${file.name}を選択しました`);
        
        // プレビューを表示
        const deletePreview = document.getElementById('deletePreview');
        if (deletePreview) {
          deletePreview.style.display = 'block';
          const fileNameElement = deletePreview.querySelector('.file-name');
          if (fileNameElement) {
            fileNameElement.textContent = file.name;
          }
        } else {
          console.error('deletePreview要素が見つかりません');
        }
        
        previewPdfPages(file, 'deletePageContainer', 'deleteTotalPages');
      }
    });
  } else {
    console.error('deleteFile要素が見つかりません');
  }

  // 全選択ボタンの処理
  setupSelectAllButtons();
  
  // PDF結合フォームの送信処理
  setupCombineFormSubmit();
}

// ===== PDFを結合リストに追加 =====
function addPdfToCombineList(file) {
  // ファイルをリストに追加
  pdfFilesToCombine.push(file);
  console.log(`ファイル追加: ${file.name} (合計: ${pdfFilesToCombine.length}個)`);
  
  // ファイル名を表示（1つの場合はファイル名、複数の場合は数を表示）
  const fileNameElement = document.querySelector('#pdfPreview .file-name');
  if (fileNameElement) {
    if (pdfFilesToCombine.length === 1) {
      fileNameElement.textContent = file.name;
    } else {
      fileNameElement.textContent = `${pdfFilesToCombine.length}個のファイルが選択されています`;
    }
  }
  
  // デバッグ情報
  console.log('PDF結合リスト:', pdfFilesToCombine.map(f => f.name));
  
  // PDFのプレビューを更新
  updatePdfCombinePreview();
}

// ===== PDF結合プレビューを更新 =====
function updatePdfCombinePreview() {
  const pdfList = document.querySelector('.pdf-list');
  if (!pdfList) {
    console.error('PDF結合リスト要素が見つかりません');
    return;
  }
  
  console.log(`プレビュー更新: ${pdfFilesToCombine.length}個のファイル`);
  
  // リストをクリア
  pdfList.innerHTML = '';
  
  // 各PDFファイルのプレビューを作成
  pdfFilesToCombine.forEach((file, index) => {
    console.log(`プレビュー作成: ${index + 1}. ${file.name}`);
    
    const fileItem = document.createElement('div');
    fileItem.className = 'pdf-file-item';
    fileItem.dataset.index = index; // インデックスをデータ属性として保存
    
    // ファイル情報
    const fileInfo = document.createElement('div');
    fileInfo.className = 'pdf-file-info';
    fileInfo.innerHTML = `
      <div class="pdf-file-name">${file.name}</div>
      <div class="pdf-file-size">${formatFileSize(file.size)}</div>
    `;
    
    // 削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.className = 'pdf-file-delete';
    deleteButton.innerHTML = '×';
    deleteButton.title = '削除';
    deleteButton.addEventListener('click', function(e) {
      e.stopPropagation(); // イベントの伝播を停止
      // ファイルオブジェクト自体を使って配列から削除
      const fileToRemove = file;
      const fileIndex = pdfFilesToCombine.indexOf(fileToRemove);
      if (fileIndex !== -1) {
        console.log(`ファイル削除前: ${pdfFilesToCombine.length}個, 削除するインデックス: ${fileIndex}`);
        pdfFilesToCombine.splice(fileIndex, 1);
        console.log(`ファイル削除後: ${pdfFilesToCombine.length}個`);
        updatePdfCombinePreview();
        
        // ファイル名表示を更新
        const fileNameElement = document.querySelector('#pdfPreview .file-name');
        if (fileNameElement) {
          if (pdfFilesToCombine.length === 0) {
            // ファイルがなくなった場合はプレビューを非表示
            document.getElementById('pdfPreview').style.display = 'none';
          } else if (pdfFilesToCombine.length === 1) {
            // 1つだけの場合はファイル名を表示
            fileNameElement.textContent = pdfFilesToCombine[0].name;
          } else {
            // 複数の場合は数を表示
            fileNameElement.textContent = `${pdfFilesToCombine.length}個のファイルが選択されています`;
          }
        }
      }
    });
    
    // プレビュー画像
    const previewContainer = document.createElement('div');
    previewContainer.className = 'pdf-file-preview';
    
    // PDFのプレビューを生成
    previewPdf(file, previewContainer);
    
    // 要素を組み立て
    fileItem.appendChild(previewContainer);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(deleteButton);
    
    // 順序番号（常に現在のインデックス+1を表示）
    const orderNumber = document.createElement('div');
    orderNumber.className = 'pdf-file-order';
    orderNumber.textContent = index + 1;
    fileItem.appendChild(orderNumber);
    
    pdfList.appendChild(fileItem);
  });
  
  // デバッグ情報
  console.log('PDF結合リスト要素の子要素数:', pdfList.children.length);
}

// ===== ファイルサイズをフォーマット =====
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

// ===== PDFファイルをプレビュー =====
function previewPdf(file, container) {
  // コンテナが文字列の場合はIDとして扱う
  if (typeof container === 'string') {
    container = document.getElementById(container);
  }
  
  if (!container) return;

  const fileReader = new FileReader();
  fileReader.onload = function() {
    const typedarray = new Uint8Array(this.result);
    
    // PDF.jsを使用してPDFを読み込む
    pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
      // 最初のページをプレビュー
      pdf.getPage(1).then(function(page) {
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // PDFをレンダリング
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        page.render(renderContext).promise.then(function() {
          // プレビューを表示
          if (typeof container === 'string') {
            // IDの場合は内容を置き換え
            const containerElement = document.getElementById(container);
            if (containerElement) {
              const previewDiv = document.createElement('div');
              previewDiv.className = 'pdf-preview-item';
              previewDiv.appendChild(canvas);
              
              containerElement.innerHTML = '';
              containerElement.appendChild(previewDiv);
            }
          } else {
            // 要素の場合は直接追加
            container.innerHTML = '';
            container.appendChild(canvas);
          }
        });
      });
    });
  };
  fileReader.readAsArrayBuffer(file);
}

// ===== PDFの全ページをプレビュー =====
function previewPdfPages(file, containerId, totalPagesId, restoreSplitPoints = false) {
  console.log(`PDFプレビュー開始: ファイル=${file.name}, コンテナID=${containerId}, 総ページ数ID=${totalPagesId}`);
  
  const container = document.getElementById(containerId);
  const totalPagesElement = document.getElementById(totalPagesId);
  
  if (!container) {
    console.error(`コンテナ要素が見つかりません: ${containerId}`);
    return;
  }
  
  if (!totalPagesElement) {
    console.error(`総ページ数要素が見つかりません: ${totalPagesId}`);
    return;
  }

  // 分割機能の場合、既にレンダリング済みかチェック
  if (containerId === 'pageContainer' && splitPagesRendered && lastUploadedSplitFile 
      && lastUploadedSplitFile.name === file.name && lastUploadedSplitFile.size === file.size) {
    console.log('分割ページは既にレンダリング済みです。再利用します。');
    
    // 分割ポイントを復元する場合は、グループ情報も更新
    if (restoreSplitPoints) {
      updatePdfGroups();
    }
    return;
  }

  // ローディング表示
  container.innerHTML = '<div class="loading">PDFを読み込み中...</div>';
  
  // 抽出・削除機能の場合のみ分割線を削除
  if (containerId === 'extractPageContainer' || containerId === 'deletePageContainer') {
    // 分割線が削除されたことを記録
    splitLinesRemoved = true;
    
    // 特定のコンテナ内の分割線を削除
    if (container) {
      const containerSplitLines = container.querySelectorAll('.split-line-container');
      containerSplitLines.forEach(line => line.remove());
    }
    
    // 親コンテナからも削除
    let parentContainer = null;
    if (containerId === 'extractPageContainer') {
      parentContainer = document.getElementById('pdfExtractPreview');
    } else if (containerId === 'deletePageContainer') {
      parentContainer = document.getElementById('pdfDeletePreview');
    }
    
    if (parentContainer) {
      const parentSplitLines = parentContainer.querySelectorAll('.split-line-container');
      parentSplitLines.forEach(line => line.remove());
    }
    
    // プレビュースクロールコンテナからも削除
    const previewScrolls = document.querySelectorAll('.preview-scroll');
    previewScrolls.forEach(scroll => {
      const scrollSplitLines = scroll.querySelectorAll('.split-line-container');
      scrollSplitLines.forEach(line => line.remove());
    });
  }

  // FileReaderでファイルを読み込む
  const fileReader = new FileReader();
  fileReader.onload = function() {
    console.log(`FileReader読み込み完了: ${file.name}`);
    const typedarray = new Uint8Array(this.result);
    
    // PDF.jsを使用してPDFを読み込む
    pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
      const numPages = pdf.numPages;
      console.log(`PDF読み込み完了: 総ページ数=${numPages}`);
      totalPagesElement.textContent = numPages;
      
      // 機能に応じて変数を初期化
      if (containerId === 'pageContainer') {
        totalPagesCount = numPages;
        // 分割ポイントを復元する場合は初期化しない
        if (!restoreSplitPoints) {
          currentSplitPoints.clear();
          pdfGroups = [];
        }
      } else if (containerId === 'extractPageContainer') {
        extractSelectedPages.clear();
      } else if (containerId === 'deletePageContainer') {
        deleteSelectedPages.clear();
      }
      
      // コンテナをクリア
      container.innerHTML = '';
      
      // 横スクロール用のコンテナを作成
      const rowContainer = document.createElement('div');
      rowContainer.className = 'page-container';
      
      // 機能タイプを明示的に設定
      if (containerId === 'extractPageContainer') {
        rowContainer.dataset.functionType = 'extract';
        container.dataset.functionType = 'extract';
      } else if (containerId === 'deletePageContainer') {
        rowContainer.dataset.functionType = 'delete';
        container.dataset.functionType = 'delete';
      } else if (containerId === 'pageContainer') {
        rowContainer.dataset.functionType = 'split';
        container.dataset.functionType = 'split';
        // 分割機能の場合、分割線が復元されるのでフラグをリセット
        splitLinesRemoved = false;
      }
      
      container.appendChild(rowContainer);
      
      // すべてのページを読み込むためのPromiseの配列
      const pagePromises = [];
      
      // 各ページの読み込みPromiseを作成
      for (let i = 1; i <= numPages; i++) {
        const pagePromise = pdf.getPage(i).then(function(page) {
          // ページをレンダリングするためのキャンバスを設定
          const viewport = page.getViewport({ scale: 0.2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // PDFをレンダリング
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };

          return page.render(renderContext).promise.then(function() {
            // プレビュー要素を作成
            const pageDiv = document.createElement('div');
            pageDiv.className = 'pdf-page-item';
            pageDiv.dataset.page = i;
            
            // 機能タイプを設定
            if (containerId === 'extractPageContainer') {
              pageDiv.dataset.functionType = 'extract';
            } else if (containerId === 'deletePageContainer') {
              pageDiv.dataset.functionType = 'delete';
            } else if (containerId === 'pageContainer') {
              pageDiv.dataset.functionType = 'split';
            }
            
            const pageNumDiv = document.createElement('div');
            pageNumDiv.className = 'page-number';
            pageNumDiv.textContent = i;
            
            pageDiv.appendChild(canvas);
            pageDiv.appendChild(pageNumDiv);
            
            // クリックイベントを追加（PDF分割以外の機能用）
            if (containerId !== 'pageContainer') {
              pageDiv.addEventListener('click', function() {
                this.classList.toggle('selected');
                
                // 選択状態を更新
                const pageNum = parseInt(this.dataset.page);
                if (containerId === 'extractPageContainer') {
                  if (this.classList.contains('selected')) {
                    extractSelectedPages.add(pageNum);
                  } else {
                    extractSelectedPages.delete(pageNum);
                  }
                  updateExtractInfo();
                } else if (containerId === 'deletePageContainer') {
                  if (this.classList.contains('selected')) {
                    deleteSelectedPages.add(pageNum);
                  } else {
                    deleteSelectedPages.delete(pageNum);
                  }
                  updateDeleteInfo();
                }
              });
            }
            
            return { pageDiv, pageNum: i };
          });
        });
        
        pagePromises.push(pagePromise);
      }
      
      // すべてのページが読み込まれた後に表示
      Promise.all(pagePromises).then(results => {
        console.log(`すべてのページのレンダリングが完了しました: ${results.length}ページ`);
        // ページ番号順にソート
        results.sort((a, b) => a.pageNum - b.pageNum);
        
        // ページとその間の分割線を追加
        results.forEach((result, index) => {
          rowContainer.appendChild(result.pageDiv);
          
          // PDF分割機能の場合のみ分割線を追加（最後のページ以外）
          if (containerId === 'pageContainer' && index < results.length - 1) {
            const splitLineContainer = document.createElement('div');
            splitLineContainer.className = 'split-line-container';
            splitLineContainer.dataset.afterPage = result.pageNum;
            splitLineContainer.dataset.functionType = 'split'; // 分割機能用の識別子を追加
            
            splitLineContainer.addEventListener('click', function() {
              if (this.classList.contains('active')) {
                this.classList.remove('active');
                currentSplitPoints.delete(result.pageNum);
              } else {
                this.classList.add('active');
                currentSplitPoints.add(result.pageNum);
              }
              updatePdfGroups();
            });
            
            // ページ間の視覚的な分割ライン（装飾用）
            const pageDivider = document.createElement('div');
            pageDivider.className = 'page-divider';
            
            // 分割線コンテナに分割ラインを追加
            splitLineContainer.appendChild(pageDivider);
            
            rowContainer.appendChild(splitLineContainer);
            
            // 保存されている分割ポイントを復元
            if (restoreSplitPoints && currentSplitPoints.has(result.pageNum)) {
              splitLineContainer.classList.add('active');
            }
          }
        });
        
        // 分割ポイントを復元する場合は、グループ情報も更新
        if (restoreSplitPoints && containerId === 'pageContainer') {
          updatePdfGroups();
        }
        
        // 分割機能の場合、レンダリング完了フラグを設定
        if (containerId === 'pageContainer') {
          splitPagesRendered = true;
        }
      }).catch(error => {
        console.error('PDFページの読み込み中にエラーが発生しました:', error);
        container.innerHTML = '<div class="error">PDFの読み込みに失敗しました。</div>';
      });
    }).catch(error => {
      console.error('PDFの読み込み中にエラーが発生しました:', error);
      container.innerHTML = '<div class="error">PDFの読み込みに失敗しました。</div>';
    });
  };
  fileReader.onerror = function(error) {
    console.error('FileReaderエラー:', error);
    container.innerHTML = '<div class="error">ファイルの読み込みに失敗しました。</div>';
  };
  fileReader.readAsArrayBuffer(file);
}

// ===== PDF分割グループを更新 =====
function updatePdfGroups() {
  const points = Array.from(currentSplitPoints).sort((a, b) => a - b);
  pdfGroups = [];
  let start = 1;
  
  points.forEach(point => {
    pdfGroups.push({
      start: start,
      end: point
    });
    start = point + 1;
  });

  if (start <= totalPagesCount) {
    pdfGroups.push({
      start: start,
      end: totalPagesCount
    });
  }

  // 分割情報の表示を更新
  const splitInfo = document.querySelector('.split-info');
  if (pdfGroups.length > 1) {
    splitInfo.innerHTML = '<p>分割後のPDF:</p>' + pdfGroups.map((group, index) => 
      `<div class="group-info">PDF ${index + 1}: ${group.start}ページ目 ～ ${group.end}ページ目</div>`
    ).join('');
  } else {
    splitInfo.innerHTML = '';
  }

  // ページグループのスタイルを更新
  document.querySelectorAll('.pdf-page-item').forEach(page => {
    const pageNum = parseInt(page.dataset.page);
    page.classList.remove('group-start', 'group-end');
    
    // 分割機能のページにのみグループスタイルを適用
    if (page.dataset.functionType === 'split') {
      pdfGroups.forEach(group => {
        if (pageNum === group.start) page.classList.add('group-start');
        if (pageNum === group.end) page.classList.add('group-end');
      });
    }
  });
}

// ===== 全選択ボタンの処理 =====
function setupSelectAllButtons() {
  // 全分割ボタン
  const selectAllSplit = document.getElementById('selectAllSplit');
  if (selectAllSplit) {
    selectAllSplit.addEventListener('click', function() {
      const splitLines = document.querySelectorAll('.split-line-container');
      splitLines.forEach(line => {
        line.classList.add('active');
        const pageNum = parseInt(line.dataset.afterPage);
        currentSplitPoints.add(pageNum);
      });
      updatePdfGroups();
    });
  }

  // 分割線リセットボタン
  const resetSplits = document.getElementById('resetSplits');
  if (resetSplits) {
    resetSplits.addEventListener('click', function() {
      const splitLines = document.querySelectorAll('.split-line-container');
      splitLines.forEach(line => {
        line.classList.remove('active');
      });
      currentSplitPoints.clear();
      updatePdfGroups();
    });
  }

  // 全選択ボタン（抽出）
  const selectAllExtract = document.getElementById('selectAllExtract');
  if (selectAllExtract) {
    selectAllExtract.addEventListener('click', function() {
      const pageItems = document.querySelectorAll('#extractPageContainer .pdf-page-item');
      pageItems.forEach(item => {
        item.classList.add('selected');
        const pageNum = parseInt(item.dataset.page);
        extractSelectedPages.add(pageNum);
      });
      updateExtractInfo();
    });
  }

  // 選択リセットボタン（抽出）
  const resetExtract = document.getElementById('resetExtract');
  if (resetExtract) {
    resetExtract.addEventListener('click', function() {
      const pageItems = document.querySelectorAll('#extractPageContainer .pdf-page-item');
      pageItems.forEach(item => {
        item.classList.remove('selected');
      });
      extractSelectedPages.clear();
      updateExtractInfo();
    });
  }

  // 全選択ボタン（削除）
  const selectAllDelete = document.getElementById('selectAllDelete');
  if (selectAllDelete) {
    selectAllDelete.addEventListener('click', function() {
      const pageItems = document.querySelectorAll('#deletePageContainer .pdf-page-item');
      pageItems.forEach(item => {
        item.classList.add('selected');
        const pageNum = parseInt(item.dataset.page);
        deleteSelectedPages.add(pageNum);
      });
      updateDeleteInfo();
    });
  }

  // 選択リセットボタン（削除）
  const resetDelete = document.getElementById('resetDelete');
  if (resetDelete) {
    resetDelete.addEventListener('click', function() {
      const pageItems = document.querySelectorAll('#deletePageContainer .pdf-page-item');
      pageItems.forEach(item => {
        item.classList.remove('selected');
      });
      deleteSelectedPages.clear();
      updateDeleteInfo();
    });
  }
}

// ===== PDF抽出情報を更新 =====
function updateExtractInfo() {
  const extractInfo = document.querySelector('.extract-info');
  if (!extractInfo) return;
  
  if (extractSelectedPages.size > 0) {
    const selectedPages = Array.from(extractSelectedPages).sort((a, b) => a - b);
    extractInfo.innerHTML = '<p>抽出するページ:</p>' + 
      `<div class="group-info">選択したページ: ${selectedPages.join(', ')} (合計: ${selectedPages.length}ページ)</div>`;
  } else {
    extractInfo.innerHTML = '';
  }
}

// ===== PDF削除情報を更新 =====
function updateDeleteInfo() {
  const deleteInfo = document.querySelector('.delete-info');
  if (!deleteInfo) return;
  
  if (deleteSelectedPages.size > 0) {
    const selectedPages = Array.from(deleteSelectedPages).sort((a, b) => a - b);
    deleteInfo.innerHTML = '<p>削除するページ:</p>' + 
      `<div class="group-info">選択したページ: ${selectedPages.join(', ')} (合計: ${selectedPages.length}ページ)</div>`;
  } else {
    deleteInfo.innerHTML = '';
  }
}

// ===== PDF結合フォームの送信処理 =====
function setupCombineFormSubmit() {
  const combineForm = document.getElementById('combineForm');
  if (combineForm) {
    combineForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (pdfFilesToCombine.length === 0) {
        alert('PDFファイルを選択してください');
        return;
      }
      
      console.log(`PDF結合処理開始: ${pdfFilesToCombine.length}個のファイル`);
      
      // FormDataオブジェクトを作成
      const formData = new FormData();
      
      // ファイル数をフォームデータに追加
      formData.append('file_count', pdfFilesToCombine.length);
      
      // 各ファイルをフォームデータに追加
      pdfFilesToCombine.forEach((file, index) => {
        formData.append(`pdf_file_${index}`, file);
      });
      
      // 送信中の表示
      const submitButton = combineForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = '処理中...';
      submitButton.disabled = true;
      
      // サーバーにPOSTリクエストを送信
      fetch('/combine', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('サーバーエラーが発生しました');
        }
        return response.blob();
      })
      .then(blob => {
        // ダウンロードリンクを作成
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'combined.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        // 処理完了後の表示を元に戻す
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        // 成功メッセージ
        alert('PDFの結合が完了しました');
      })
      .catch(error => {
        console.error('PDF結合エラー:', error);
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        alert('エラーが発生しました: ' + error.message);
      });
    });
  } else {
    console.error('combineForm要素が見つかりません');
  }
  
  // PDF分割フォームの送信処理
  const splitForm = document.getElementById('splitForm');
  if (splitForm) {
    splitForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (currentSplitPoints.size === 0) {
        alert('分割ポイントを選択してください');
        return;
      }
      
      console.log(`PDF分割処理開始: ${currentSplitPoints.size}個の分割ポイント`);
      
      // FormDataオブジェクトを作成
      const formData = new FormData();
      
      // PDFファイルを追加
      const pdfFile = document.getElementById('pdfFile').files[0];
      formData.append('pdf_file', pdfFile);
      
      // 分割ポイントを追加
      const splitPoints = Array.from(currentSplitPoints).sort((a, b) => a - b);
      splitPoints.forEach(point => {
        formData.append('split_points[]', point);
      });
      
      // 送信中の表示
      const submitButton = splitForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = '処理中...';
      submitButton.disabled = true;
      
      // サーバーにPOSTリクエストを送信
      fetch('/split', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('サーバーエラーが発生しました');
        }
        return response.blob();
      })
      .then(blob => {
        // ダウンロードリンクを作成
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'split_pdfs.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        // 処理完了後の表示を元に戻す
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        // 成功メッセージ
        alert('PDFの分割が完了しました');
      })
      .catch(error => {
        console.error('PDF分割エラー:', error);
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        alert('エラーが発生しました: ' + error.message);
      });
    });
  }
  
  // PDF抽出フォームの送信処理
  const extractForm = document.getElementById('extractForm');
  if (extractForm) {
    extractForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (extractSelectedPages.size === 0) {
        alert('抽出するページを選択してください');
        return;
      }
      
      console.log(`PDF抽出処理開始: ${extractSelectedPages.size}個のページを抽出`);
      
      // FormDataオブジェクトを作成
      const formData = new FormData();
      
      // PDFファイルを追加
      const pdfFile = document.getElementById('extractFile').files[0];
      formData.append('pdf_file', pdfFile);
      
      // 抽出するページを追加
      const extractPages = Array.from(extractSelectedPages).sort((a, b) => a - b);
      extractPages.forEach(page => {
        formData.append('extract_pages[]', page);
      });
      
      // 送信中の表示
      const submitButton = extractForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = '処理中...';
      submitButton.disabled = true;
      
      // サーバーにPOSTリクエストを送信
      fetch('/extract', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('サーバーエラーが発生しました');
        }
        return response.blob();
      })
      .then(blob => {
        // ダウンロードリンクを作成
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'extracted.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        // 処理完了後の表示を元に戻す
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        // 成功メッセージ
        alert('PDFの抽出が完了しました');
      })
      .catch(error => {
        console.error('PDF抽出エラー:', error);
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        alert('エラーが発生しました: ' + error.message);
      });
    });
  }
  
  // PDF削除フォームの送信処理
  const deleteForm = document.getElementById('deleteForm');
  if (deleteForm) {
    deleteForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (deleteSelectedPages.size === 0) {
        alert('削除するページを選択してください');
        return;
      }
      
      console.log(`PDF削除処理開始: ${deleteSelectedPages.size}個のページを削除`);
      
      // FormDataオブジェクトを作成
      const formData = new FormData();
      
      // PDFファイルを追加
      const pdfFile = document.getElementById('deleteFile').files[0];
      formData.append('pdf_file', pdfFile);
      
      // 削除するページを追加
      const deletePages = Array.from(deleteSelectedPages).sort((a, b) => a - b);
      deletePages.forEach(page => {
        formData.append('delete_pages[]', page);
      });
      
      // 送信中の表示
      const submitButton = deleteForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = '処理中...';
      submitButton.disabled = true;
      
      // サーバーにPOSTリクエストを送信
      fetch('/delete', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('サーバーエラーが発生しました');
        }
        return response.blob();
      })
      .then(blob => {
        // ダウンロードリンクを作成
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'modified.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        // 処理完了後の表示を元に戻す
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        // 成功メッセージ
        alert('PDFの編集が完了しました');
      })
      .catch(error => {
        console.error('PDF削除エラー:', error);
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        alert('エラーが発生しました: ' + error.message);
      });
    });
  }
}

// ===== HTMLから移動したPDF機能カード表示処理 =====
/**
 * PDF機能カードをクリックしたときに対応するセクションを表示する関数
 * 
 * この関数は、ユーザーがPDF機能カード（結合・分割・抽出・削除）をクリックしたときに
 * 対応する機能のUIセクションを表示し、他のセクションを非表示にします。
 * また、選択されたセクションにスムーズにスクロールし、一時的なハイライト効果を
 * 適用して、ユーザーの注目を集めます。
 * 
 * @param {string} toolType - 表示するPDF機能の種類 ('combine', 'split', 'extract', 'delete')
 */
function showPdfTool(toolType) {
  // PDF機能セクション全体を表示状態にする
  const toolSections = document.getElementById('pdf-tool-sections');
  toolSections.style.display = 'block';
  
  // すべてのPDF機能セクションを非表示にする（初期化）
  const allSections = document.querySelectorAll('.pdf-tool-section');
  allSections.forEach(section => {
    section.classList.remove('active');
    // 分割機能のプレビューは非表示にしない
    if (section.id === 'pdf-split-section' && lastUploadedSplitFile) {
      const pagePreview = document.getElementById('pagePreview');
      if (pagePreview) {
        // 非表示にせず、z-indexなどでUIから隠す
        pagePreview.style.visibility = toolType === 'split' ? 'visible' : 'hidden';
        pagePreview.style.position = toolType === 'split' ? 'relative' : 'absolute';
        pagePreview.style.zIndex = toolType === 'split' ? '1' : '-1';
      }
    } else {
      // 他の機能のプレビューは通常通り非表示
    }
  });
  
  // 分割機能から他の機能に移動する場合、分割線を保存
  if (toolType !== 'split' && lastUploadedSplitFile && !splitLinesRemoved) {
    console.log('分割機能から他の機能に移動します。分割線を保存します。');
    // 分割線を保存
    saveSplitLines();
    // 分割線が削除されたことを記録
    splitLinesRemoved = true;
  }
  
  // 抽出・削除機能の場合のみ分割線を削除
  if ((toolType === 'extract' || toolType === 'delete') && !splitLinesRemoved) {
    // 分割線が削除されたことを記録
    splitLinesRemoved = true;
    
    // 抽出と削除のコンテナ内の分割線のみを削除
    // 分割機能のコンテナ内の分割線は削除しない
    const extractContainer = document.getElementById('extractPageContainer');
    const deleteContainer = document.getElementById('deletePageContainer');
    
    if (extractContainer) {
      extractContainer.dataset.functionType = 'extract';
      const extractSplitLines = extractContainer.querySelectorAll('.split-line-container');
      extractSplitLines.forEach(line => line.remove());
    }
    
    if (deleteContainer) {
      deleteContainer.dataset.functionType = 'delete';
      const deleteSplitLines = deleteContainer.querySelectorAll('.split-line-container');
      deleteSplitLines.forEach(line => line.remove());
    }
    
    // 親コンテナからも削除（分割機能のコンテナは除く）
    const extractParent = document.getElementById('pdfExtractPreview');
    const deleteParent = document.getElementById('pdfDeletePreview');
    
    if (extractParent) {
      extractParent.dataset.functionType = 'extract';
      const extractParentSplitLines = extractParent.querySelectorAll('.split-line-container');
      extractParentSplitLines.forEach(line => line.remove());
    }
    
    if (deleteParent) {
      deleteParent.dataset.functionType = 'delete';
      const deleteParentSplitLines = deleteParent.querySelectorAll('.split-line-container');
      deleteParentSplitLines.forEach(line => line.remove());
    }
    
    // 機能タイプに基づいて親セクションにもデータ属性を設定
    const extractSection = document.getElementById('pdf-extract-section');
    const deleteSection = document.getElementById('pdf-delete-section');
    
    if (extractSection && toolType === 'extract') {
      extractSection.dataset.functionType = 'extract';
    }
    
    if (deleteSection && toolType === 'delete') {
      deleteSection.dataset.functionType = 'delete';
    }
  }
  
  // 分割機能に戻ったときに、前回のファイルと分割ポイントを復元
  if (toolType === 'split' && lastUploadedSplitFile) {
    // 前回のファイルがある場合は、プレビューを再表示
    const pagePreview = document.getElementById('pagePreview');
    if (pagePreview) {
      // 表示状態を元に戻す
      pagePreview.style.display = 'block';
      pagePreview.style.visibility = 'visible';
      pagePreview.style.position = 'relative';
      pagePreview.style.zIndex = '1';
      
      const fileNameElement = pagePreview.querySelector('.file-name');
      if (fileNameElement) {
        fileNameElement.textContent = lastUploadedSplitFile.name;
      }
      
      // ページコンテナを確認
      const pageContainer = document.getElementById('pageContainer');
      
      if (pageContainer) {
        // 分割線が削除されていて、保存された分割線がある場合は復元
        if (splitLinesRemoved && savedSplitLines.length > 0) {
          console.log('保存された分割線を復元します');
          restoreSplitLines(pageContainer);
          splitLinesRemoved = false;
        } 
        // 分割線が削除されたか、ページコンテナが空の場合は再レンダリング
        else if (splitLinesRemoved || !pageContainer.querySelector('.pdf-page-item') || pageContainer.children.length === 0) {
          console.log('分割線が削除されたか、ページコンテナが空のため、PDFを再レンダリングします');
          // ページプレビューを再生成
          previewPdfPages(lastUploadedSplitFile, 'pageContainer', 'totalPages', true);
          // 分割線が復元されたのでフラグをリセット
          splitLinesRemoved = false;
        } else {
          console.log('ページコンテナが既に内容を持っているため、グループスタイルのみ更新します');
          // コンテナが既に内容を持っている場合は、グループスタイルだけ更新
          updatePdfGroups();
        }
      }
    }
  }
  
  // 対応するPDF機能セクションを表示
  const targetSection = document.getElementById(`pdf-${toolType}-section`);
  if (targetSection) {
    targetSection.classList.add('active');
    
    // スムーズにスクロール（ユーザーの視線を誘導）
    setTimeout(() => {
      targetSection.scrollIntoView({ behavior: 'smooth' });
      
      // ハイライト効果を追加（一時的に注目を集める）
      targetSection.classList.add('highlight-section');
      setTimeout(() => {
        targetSection.classList.remove('highlight-section');
      }, 2000); // 2秒後にハイライト効果を削除
    }, 100);
  }
}

// ===== 分割線を保存する関数 =====
function saveSplitLines() {
  // 保存配列をクリア
  savedSplitLines = [];
  
  // 分割線を取得
  const pageContainer = document.getElementById('pageContainer');
  if (!pageContainer) return;
  
  const splitLines = pageContainer.querySelectorAll('.split-line-container');
  
  // 各分割線の情報を保存
  splitLines.forEach(line => {
    const pageNum = parseInt(line.dataset.afterPage);
    const isActive = line.classList.contains('active');
    
    // 分割線の情報を保存
    savedSplitLines.push({
      pageNum: pageNum,
      isActive: isActive
    });
  });
  
  console.log(`${savedSplitLines.length}個の分割線を保存しました`);
}

// ===== 分割線を復元する関数 =====
function restoreSplitLines(container) {
  if (!container || savedSplitLines.length === 0) return;
  
  // 既存の分割線を削除（念のため）
  const existingSplitLines = container.querySelectorAll('.split-line-container');
  existingSplitLines.forEach(line => line.remove());
  
  // ページコンテナを取得
  const pageContainer = container.querySelector('.page-container') || container;
  
  // ページアイテムを取得
  const pageItems = pageContainer.querySelectorAll('.pdf-page-item');
  const pageItemsArray = Array.from(pageItems);
  
  // 保存された分割線を復元
  savedSplitLines.forEach(savedLine => {
    // 対応するページを見つける
    const pageItem = pageItemsArray.find(item => parseInt(item.dataset.page) === savedLine.pageNum);
    if (!pageItem) return;
    
    // 新しい分割線を作成
    const splitLineContainer = document.createElement('div');
    splitLineContainer.className = 'split-line-container';
    splitLineContainer.dataset.afterPage = savedLine.pageNum;
    splitLineContainer.dataset.functionType = 'split';
    
    // アクティブ状態を復元
    if (savedLine.isActive) {
      splitLineContainer.classList.add('active');
      currentSplitPoints.add(savedLine.pageNum);
    }
    
    // クリックイベントを追加
    splitLineContainer.addEventListener('click', function() {
      if (this.classList.contains('active')) {
        this.classList.remove('active');
        currentSplitPoints.delete(savedLine.pageNum);
      } else {
        this.classList.add('active');
        currentSplitPoints.add(savedLine.pageNum);
      }
      updatePdfGroups();
    });
    
    // ページ間の視覚的な分割ライン（装飾用）
    const pageDivider = document.createElement('div');
    pageDivider.className = 'page-divider';
    
    // 分割線コンテナに分割ラインを追加
    splitLineContainer.appendChild(pageDivider);
    
    // ページの後に分割線を挿入
    pageContainer.insertBefore(splitLineContainer, pageItem.nextSibling);
  });
  
  console.log(`${savedSplitLines.length}個の分割線を復元しました`);
  
  // グループスタイルを更新
  updatePdfGroups();
}