// script.js (substituir inteiramente pelo conteúdo abaixo)
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado — iniciando scripts');
  initCarousels();
  initThemeToggleBetweenSections();
});

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

    let cardWidth = cards[0].getBoundingClientRect().width;
    let index = 0;

    function recalc() {
      cardWidth = cards[0].getBoundingClientRect().width;
      update(); // atualiza posição ao redimensionar
    }

    function getMaxTranslate() {
      const visibleWidth = carousel.clientWidth;
      const totalWidth = cards.length * cardWidth + gap * (cards.length - 1);
      return Math.max(0, totalWidth - visibleWidth);
    }

    function update() {
      const maxTranslate = getMaxTranslate();
      let translate = index * (cardWidth + gap);
      if (translate > maxTranslate) translate = maxTranslate;
      if (translate < 0) translate = 0;
      track.style.transform = `translateX(-${translate}px)`;
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        index++;
        // limite superior calculado por update()
        update();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        index = Math.max(0, index - 1);
        update();
      });
    }

    // Atualiza dimensões ao redimensionar a janela
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recalc, 120);
    });

    // inicializa
    recalc();
  });
}

/* ===========================
   Tema claro: inicia em .trabalhos-verticais e termina depois de .servicos
   lógica: verifica posição do CENTRO da viewport (mais estável que thresholds)
   =========================== */
function initThemeToggleBetweenSections() {
  const startEl = document.querySelector('.trabalhos-verticais');
  const endEl = document.querySelector('.servicos');

  // se faltar qualquer uma das seções, não faz nada
  if (!startEl || !endEl) return;

  function isCenterBetween(startTop, endBottom) {
    const centerY = window.scrollY + window.innerHeight / 2;
    return centerY >= startTop && centerY <= endBottom;
  }

  function checkAndToggleTheme() {
    const startTop = startEl.offsetTop;
    const endBottom = endEl.offsetTop + endEl.offsetHeight;

    if (isCenterBetween(startTop, endBottom)) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }

  // rAF-based scroll handler (performante)
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        checkAndToggleTheme();
        ticking = false;
      });
      ticking = true;
    }
  });

  // também checa ao redimensionar e no load
  window.addEventListener('resize', () => {
    checkAndToggleTheme();
  });

  // checagem inicial
  checkAndToggleTheme();
}
const sections = document.querySelectorAll('.quem-sou-eu');

window.addEventListener('scroll', () => {
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      sec.classList.add('show');
    }
  });
});
// Abre modal com o vídeo
document.querySelectorAll(".work-card").forEach(card => {
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    let videoUrl = card.getAttribute("data-video");
    const modal = document.getElementById("videoModal");
    const frame = document.getElementById("videoFrame");
    const wrapper = document.querySelector(".video-wrapper");

    if (videoUrl) {
      let embedUrl = "";

      // Se já for embed, usa direto
      if (videoUrl.includes("embed/")) {
        embedUrl = videoUrl + "?autoplay=1";
      } 
      // Se for Shorts no formato normal
      else if (videoUrl.includes("shorts/")) {
        let videoId = videoUrl.split("shorts/")[1].split("?")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      } 
      // Se for vídeo normal no formato watch
      else if (videoUrl.includes("watch?v=")) {
        let videoId = videoUrl.split("watch?v=")[1].split("&")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }

      frame.src = embedUrl;

      // Detecta se é vertical (Shorts) ou horizontal
      if (videoUrl.includes("shorts") || videoUrl.includes("embed/") && wrapper) {
        wrapper.classList.add("vertical");
      } else {
        wrapper.classList.remove("vertical");
      }

      modal.style.display = "flex";
    }
  });
});

// Fecha modal
document.querySelector(".close-btn").addEventListener("click", () => {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoFrame");
  modal.style.display = "none";
  frame.src = "";
});

// Fecha clicando fora
document.getElementById("videoModal").addEventListener("click", e => {
  if (e.target.id === "videoModal") {
    const modal = document.getElementById("videoModal");
    const frame = document.getElementById("videoFrame");
    modal.style.display = "none";
    frame.src = "";
  }
});
