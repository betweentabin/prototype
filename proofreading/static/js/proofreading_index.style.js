/**
 * 文章校正ツール JavaScript
 * 
 * このファイルは文章校正ツールの機能を実装するJavaScriptコードです。
 * 主な機能:
 * - ファイル校正: PowerPoint/Word/PDFファイルの文章を校正
 * - テキスト校正: 直接入力したテキストを校正
 * 
 * 各機能はユーザーインターフェースと連携し、
 * フォーム送信などを処理します。
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== 機能カードのアクティブ状態の処理 =====
  const featureCards = document.querySelectorAll('.feature-card');
  
  // まず全てのカードからactiveクラスを削除
  featureCards.forEach(card => {
    card.classList.remove('active');
  });
  
  // 2つ目のカード（インデックス1）だけをアクティブにする
  if (featureCards.length >= 2) {
    featureCards[1].classList.add('active');
    // アクティブカードのクリックイベントを無効化
    featureCards[1].style.pointerEvents = 'none';
  }
  
  featureCards.forEach((card, index) => {
    // 2番目のカード以外にのみクリックイベントを追加
    if (index !== 1) {
      card.addEventListener('click', function() {
        // クリック時のビジュアルフィードバック
        featureCards.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
      });
    }
  });

  // ===== 校正機能カードのクリックイベント処理 =====
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

  // 現在のURLに基づいて、対応する校正機能カードをアクティブにする
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
});

/**
 * 校正機能カードをクリックしたときに対応するセクションを表示する関数
 * 
 * この関数は、ユーザーが校正機能カード（ファイル校正・テキスト校正）をクリックしたときに
 * 対応する機能のUIセクションを表示し、他のセクションを非表示にします。
 * また、選択されたセクションにスムーズにスクロールし、一時的なハイライト効果を
 * 適用して、ユーザーの注目を集めます。
 * 
 * @param {string} toolType - 表示する校正機能の種類 ('combine'=ファイル校正, 'split'=テキスト校正)
 */
function showPdfTool(toolType) {
  // 校正機能セクション全体を表示状態にする
  const toolSections = document.getElementById('pdf-tool-sections');
  toolSections.style.display = 'block';
  
  // すべての校正機能セクションを非表示にする（初期化）
  const allSections = document.querySelectorAll('.pdf-tool-section');
  allSections.forEach(section => {
    section.classList.remove('active');
  });
  
  // 対応する文章校正セクションを表示
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

