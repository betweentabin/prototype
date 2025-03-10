// インデックスページの機能
document.addEventListener('DOMContentLoaded', () => {
  // Exploreボタンのスクロール機能
  const exploreBtn = document.querySelector('.explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      const featuresSection = document.querySelector('.features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 機能カードのホバーエフェクト
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });
}); 