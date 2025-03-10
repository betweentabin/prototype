/**
 * ヘッダーコンポーネントの管理クラス
 * 
 * 主な機能：
 * - ヘッダーの読み込みと表示
 * - ハンバーガーメニューの開閉
 * - モーダルメニューの制御
 * - ページ遷移の処理
 * 
 * 対応するファイル：
 * - HTML: templates/components/header.html（ヘッダーの構造）
 * - CSS:  static/css/components/header.styles.css（ヘッダーのデザイン）
 * 
 * 処理の流れ：
 * 1. DOMContentLoadedイベントでHeaderクラスのインスタンスを作成
 * 2. ヘッダーのHTMLを非同期で読み込み
 * 3. 必要な要素の参照を取得
 * 4. 各種イベントリスナーを設定
 *   - メニューボタンのクリック処理
 *   - モーダルの開閉処理
 *   - ページ遷移の処理
 */

// ヘッダーコンポーネントの読み込みと機能の管理
class Header {
  constructor() {
    this.initialize();
  }

  async initialize() {
    await this.loadHeader();
    this.initializeElements();
    this.initializeEventListeners();
    this.initializeScrollHandler();
    
    // 特定のページでは即座にヘッダーの背景を白くする
    const currentPath = window.location.pathname;
    const alwaysColoredPages = ['/contact', '/terms', '/guidelines'];
    const header = document.querySelector('header');
    if (header && alwaysColoredPages.includes(currentPath)) {
      header.classList.add('scrolled');
    }
  }

  async loadHeader() {
    try {
      const response = await fetch('/templates/components/header.html');
      const html = await response.text();
      
      // body要素の中身のみを抽出
      const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || '';
      
      // コメントと空白を除去して純粋なHTMLコンテンツのみを取得
      const cleanHtml = bodyContent.replace(/<!--[\s\S]*?-->/g, '').trim();
      const headerContainer = document.getElementById('header-container');
      if (headerContainer) {
        headerContainer.innerHTML = cleanHtml;
      } else {
        console.error('header-containerが見つかりません');
      }
    } catch (error) {
      console.error('ヘッダーの読み込みに失敗しました:', error);
    }
  }

  initializeElements() {
    this.menuButton = document.getElementById('menuButton');
    this.modalMenu = document.getElementById('modalMenu');
    this.closeButton = document.getElementById('closeButton');
    this.contactLink = document.getElementById('contactLink');
    this.termsLink = document.querySelector('.footer-links a[href="/terms"]');
    this.guidelinesLink = document.querySelector('.footer-links a[href="/guidelines"]');
    this.logoLink = document.querySelector('.logo a');
    this.modalLogoLink = document.querySelector('.modal-logo img');
    this.modalLinks = document.querySelectorAll('.modal-nav a, .footer-links a');

    if (!this.menuButton || !this.modalMenu || !this.closeButton) {
      console.error('必要な要素が見つかりません:', {
        menuButton: !!this.menuButton,
        modalMenu: !!this.modalMenu,
        closeButton: !!this.closeButton
      });
    }
  }

  initializeEventListeners() {
    if (!this.menuButton || !this.modalMenu || !this.closeButton) {
      return;
    }

    // モーダル内のすべてのリンクにクリックイベントを追加
    this.modalLinks.forEach(link => {
      if (!link.matches('#contactLink, [href="/terms"], [href="/guidelines"]')) {
        link.addEventListener('click', () => {
          this.closeModal();
        });
      }
    });

    // ロゴクリックの処理（ヘッダーとモーダル両方）
    const handleLogoClick = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('/templates/pages/index.html');
        const html = await response.text();
        
        const mainContent = document.querySelector('main');
        if (mainContent) {
          this.closeModal();
          window.history.pushState({}, '', '/');
          document.title = 'Efficiency Expert';

          // ヘッダーの背景色を更新
          const header = document.querySelector('header');
          if (header) {
            header.classList.remove('scrolled');
          }

          // 他のページ固有のCSSを削除
          const contactCSS = document.querySelector('link[href="/static/css/pages/contact.styles.css"]');
          const termsCSS = document.querySelector('link[href="/static/css/pages/terms.styles.css"]');
          const guidelinesCSS = document.querySelector('link[href="/static/css/pages/guidelines.styles.css"]');
          
          if (contactCSS) contactCSS.remove();
          if (termsCSS) termsCSS.remove();
          if (guidelinesCSS) guidelinesCSS.remove();
          
          // メインコンテンツを更新
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          const newMainContent = tempDiv.querySelector('main');
          if (newMainContent) {
            mainContent.innerHTML = newMainContent.innerHTML;
            
            // index.style.jsの再初期化
            const indexScript = document.createElement('script');
            indexScript.src = '/static/js/pages/index.style.js';
            document.body.appendChild(indexScript);
          }
        }
      } catch (error) {
        console.error('インデックスページの読み込みに失敗しました:', error);
      }
    };

    // ヘッダーロゴのクリックイベント
    if (this.logoLink) {
      this.logoLink.addEventListener('click', handleLogoClick);
    }

    // モーダルロゴのクリックイベント
    if (this.modalLogoLink) {
      this.modalLogoLink.addEventListener('click', handleLogoClick);
      this.modalLogoLink.style.cursor = 'pointer'; // カーソルをポインターに変更
    }

    // モーダルメニューを開く
    this.menuButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openModal();
    });

    // モーダルメニューを閉じる
    this.closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeModal();
    });

    // モーダル外クリックで閉じる
    this.modalMenu.addEventListener('click', (e) => {
      if (e.target === this.modalMenu) {
        this.closeModal();
      }
    });

    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalMenu.classList.contains('active')) {
        this.closeModal();
      }
    });

    // お問い合わせリンクの処理
    if (this.contactLink) {
      this.contactLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('/templates/pages/contact.html');
          const html = await response.text();
          
          const mainContent = document.querySelector('main');
          if (mainContent) {
            this.closeModal();
            window.history.pushState({}, '', '/contact');
            document.title = 'お問い合わせ - Efficiency Expert';

            // ヘッダーの背景色を白に設定
            const header = document.querySelector('header');
            if (header) {
              header.classList.add('scrolled');
            }

            // contact.styles.cssが読み込まれていない場合は追加
            if (!document.querySelector('link[href="/static/css/pages/contact.styles.css"]')) {
              const contactCSS = document.createElement('link');
              contactCSS.rel = 'stylesheet';
              contactCSS.href = '/static/css/pages/contact.styles.css';
              document.head.appendChild(contactCSS);
            }
            
            // メインコンテンツを更新
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const newMainContent = tempDiv.querySelector('main');
            if (newMainContent) {
              mainContent.innerHTML = newMainContent.innerHTML;
              
              // contact.jsが読み込まれていない場合は追加
              if (!document.querySelector('script[src="/static/js/pages/contact.js"]')) {
                const contactScript = document.createElement('script');
                contactScript.src = '/static/js/pages/contact.js';
                document.body.appendChild(contactScript);
              } else {
                // すでに読み込まれている場合は、フォームの初期化を実行
                const contactForm = document.getElementById('contactForm');
                if (contactForm) {
                  contactForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    alert('お問い合わせありがとうございます。\n内容を確認次第、ご連絡させていただきます。');
                    contactForm.reset();
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('お問い合わせページの読み込みに失敗しました:', error);
        }
      });
    }

    // 利用規約リンクの処理
    if (this.termsLink) {
      this.termsLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('/templates/pages/terms.html');
          const html = await response.text();
          
          const mainContent = document.querySelector('main');
          if (mainContent) {
            this.closeModal();
            window.history.pushState({}, '', '/terms');
            document.title = '利用規約 - Efficiency Expert';

            // ヘッダーの背景色を白に設定
            const header = document.querySelector('header');
            if (header) {
              header.classList.add('scrolled');
            }

            // 他のページ固有のCSSを削除
            const contactCSS = document.querySelector('link[href="/static/css/pages/contact.styles.css"]');
            if (contactCSS) {
              contactCSS.remove();
            }

            // terms.styles.cssが読み込まれていない場合は追加
            if (!document.querySelector('link[href="/static/css/pages/terms.styles.css"]')) {
              const termsCSS = document.createElement('link');
              termsCSS.rel = 'stylesheet';
              termsCSS.href = '/static/css/pages/terms.styles.css';
              document.head.appendChild(termsCSS);
            }
            
            // メインコンテンツを更新
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const newMainContent = tempDiv.querySelector('main');
            if (newMainContent) {
              mainContent.innerHTML = newMainContent.innerHTML;
            }
          }
        } catch (error) {
          console.error('利用規約ページの読み込みに失敗しました:', error);
        }
      });
    }

    // ユーザーガイドラインリンクの処理
    if (this.guidelinesLink) {
      this.guidelinesLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('/templates/pages/guidelines.html');
          const html = await response.text();
          
          const mainContent = document.querySelector('main');
          if (mainContent) {
            this.closeModal();
            window.history.pushState({}, '', '/guidelines');
            document.title = 'ユーザーガイドライン - Efficiency Expert';

            // ヘッダーの背景色を白に設定
            const header = document.querySelector('header');
            if (header) {
              header.classList.add('scrolled');
            }

            // 他のページ固有のCSSを削除
            const contactCSS = document.querySelector('link[href="/static/css/pages/contact.styles.css"]');
            if (contactCSS) {
              contactCSS.remove();
            }

            // guidelines.styles.cssが読み込まれていない場合は追加
            if (!document.querySelector('link[href="/static/css/pages/guidelines.styles.css"]')) {
              const guidelinesCSS = document.createElement('link');
              guidelinesCSS.rel = 'stylesheet';
              guidelinesCSS.href = '/static/css/pages/guidelines.styles.css';
              document.head.appendChild(guidelinesCSS);
            }
            
            // メインコンテンツを更新
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const newMainContent = tempDiv.querySelector('main');
            if (newMainContent) {
              mainContent.innerHTML = newMainContent.innerHTML;
            }
          }
        } catch (error) {
          console.error('ユーザーガイドラインページの読み込みに失敗しました:', error);
        }
      });
    }
  }

  initializeScrollHandler() {
    const header = document.querySelector('header');
    const hero = document.querySelector('.hero');
    
    if (header && hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      
      // 初期状態のチェック
      this.updateHeaderBackground(header, heroBottom);

      // スクロール時のチェック
      window.addEventListener('scroll', () => {
        this.updateHeaderBackground(header, heroBottom);
      });
    }
  }

  updateHeaderBackground(header, heroBottom) {
    const currentPath = window.location.pathname;
    const alwaysColoredPages = ['/contact', '/terms', '/guidelines'];
    
    if (alwaysColoredPages.includes(currentPath)) {
      header.classList.add('scrolled');
    } else {
      if (window.scrollY > heroBottom - header.offsetHeight) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  openModal() {
    if (this.modalMenu) {
      this.modalMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    if (this.modalMenu) {
      this.modalMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

// ヘッダーの初期化
document.addEventListener('DOMContentLoaded', () => {
  new Header();
});