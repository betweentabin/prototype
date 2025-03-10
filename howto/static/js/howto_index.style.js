/**
 * 使用方法ツール JavaScript
 * 
 * このファイルは使用方法ツールの機能を実装するJavaScriptコードです。
 * 主な機能:
 * - 目次生成から PDFツールまでの7つの機能の使い方を表示
 * 
 * 各機能はユーザーインターフェースと連携し、
 * コンテンツの表示などを処理します。
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== 機能カードのアクティブ状態の処理 =====
  const featureCards = document.querySelectorAll('.feature-card');
  
  // まず全てのカードからactiveクラスを削除
  featureCards.forEach(card => {
    card.classList.remove('active');
  });
  
  // 「使用方法」カードをアクティブにする
  const howToUseCard = document.getElementById('howtouse');
  if (howToUseCard) {
    howToUseCard.classList.add('active');
    // アクティブカードのクリックイベントを無効化
    howToUseCard.style.pointerEvents = 'none';
  }
  
  featureCards.forEach(card => {
    // 「使用方法」カード以外にのみクリックイベントを追加
    if (card.id !== 'howtouse') {
      card.addEventListener('click', function() {
        // クリック時のビジュアルフィードバック
        featureCards.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
      });
    }
  });

  // ===== 使用方法カードのクリックイベント処理 =====
  const functionCards = document.querySelectorAll('.pdf-function-card');
  
  functionCards.forEach(card => {
    card.addEventListener('click', function() {
      // クリック時のビジュアルフィードバック
      functionCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      // カードがクリックされたときのアニメーション（押し込まれる効果）
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 100);
    });
  });
});



/**
 * 使用方法カードをクリックしたときに対応するセクションを表示する関数
 * 
 * この関数は、ユーザーが使用方法カード（目次生成からPDFツールまで）をクリックしたときに
 * 対応する機能のUIセクションを表示し、他のセクションを非表示にします。
 * また、選択されたセクションにスムーズにスクロールし、一時的なハイライト効果を
 * 適用して、ユーザーの注目を集めます。
 * 
 * @param {string} toolType - 表示する使用方法の種類
 * ('index'=目次生成, 'proofreading'=文章校正, 'shift'=休憩シフト,
 *  'nametag'=名札生成, 'convert'=形式変換, 'compress'=圧縮転送, 'pdf'=PDFツール)
 */
function showPdfTool(toolType) {
  // 使用方法セクション全体を表示状態にする
  const toolSections = document.getElementById('pdf-tool-sections');
  toolSections.style.display = 'block';
  
  // すべての使用方法セクションを非表示にする（初期化）
  const allSections = document.querySelectorAll('.pdf-tool-section');
  allSections.forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });
  
  // 対応する使用方法セクションを表示
  const targetSection = document.getElementById(`pdf-${toolType}-section`);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.style.display = 'block';
    
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

