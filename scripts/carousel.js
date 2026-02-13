/* ===========================
   Carousels (suporta múltiplos carousels na página)
   =========================== */
function initCarousels() {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    if (!track) return;

    const container = carousel.closest('.container') || carousel.parentElement;
    const controls = container.querySelector('.carousel-controls');
    const prevBtn = controls ? controls.querySelector('.prev') : null;
    const nextBtn = controls ? controls.querySelector('.next') : null;

    const cards = Array.from(track.querySelectorAll('.work-card'));
    if (cards.length === 0) return;

    // calcula gap entre cards (fallback 24)
    const trackStyle = window.getComputedStyle(track);
    const gap = parseFloat(trackStyle.gap || trackStyle.columnGap || '24') || 24;

    const isVertical = carousel.classList.contains('trabalhos-verticais');
    const SNAP_INDEX = isVertical ? 3 : 2;
    let currentSnap = 0;
    function getCardPosition(cardIndex) {
  let pos = 0;
  for (let i = 0; i < cardIndex && i < cards.length; i++) {
    pos += cards[i].offsetWidth + gap;
  }
  return pos;
}
nextBtn?.addEventListener('click', () => {
  currentSnap++;
  const targetIndex = SNAP_INDEX * currentSnap;
  const translate = getCardPosition(targetIndex);
  track.style.transform = `translateX(-${translate}px)`;
});
prevBtn?.addEventListener('click', () => {
  currentSnap = Math.max(0, currentSnap - 1);
  const targetIndex = SNAP_INDEX * currentSnap;
  const translate = getCardPosition(targetIndex);
  track.style.transform = `translateX(-${translate}px)`;
});
window.addEventListener('resize', () => {
  const targetIndex = SNAP_INDEX * currentSnap;
  const translate = getCardPosition(targetIndex);
  track.style.transform = `translateX(-${translate}px)`;
});
  });
}

/* ================================
   Swipe para carrosséis (mobile)
================================ */
function initCarouselSwipe() {
  document.querySelectorAll('.carousel-track').forEach(track => {

    let startX = 0;
    let scrollLeft = 0;
    let isDown = false;

    track.addEventListener('touchstart', (e) => {
      isDown = true;
      startX = e.touches[0].pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - track.offsetLeft;
      const walk = (x - startX);
      track.scrollLeft = scrollLeft - walk;
    });

    track.addEventListener('touchend', () => {
      isDown = false;
    });

  });
}