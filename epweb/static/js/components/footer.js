// フッターコンポーネントの読み込みと機能の管理
class Footer {
  constructor() {
    this.loadFooter();
  }

  async loadFooter() {
    try {
      const response = await fetch('/templates/components/footer.html');
      const html = await response.text();
      
      // body要素の中身のみを抽出
      const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || '';
      
      // コメントと空白を除去して純粋なHTMLコンテンツのみを取得
      const cleanHtml = bodyContent.replace(/<!--[\s\S]*?-->/g, '').trim();
      document.getElementById('footer-container').innerHTML = cleanHtml;
    } catch (error) {
      console.error('フッターの読み込みに失敗しました:', error);
    }
  }
}

// フッターの初期化
document.addEventListener('DOMContentLoaded', () => {
  new Footer();
}); 