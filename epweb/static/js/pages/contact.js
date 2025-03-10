// お問い合わせフォームの処理
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // ここに送信処理を実装
      alert('お問い合わせありがとうございます。\n内容を確認次第、ご連絡させていただきます。');
      contactForm.reset();
    });
  }
}); 