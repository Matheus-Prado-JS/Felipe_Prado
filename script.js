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
const modal = document.getElementById("videoModal");
const frame = document.getElementById("videoFrame");
const wrapper = document.querySelector(".video-wrapper");
const prevBtn = document.querySelector(".nav-arrow.left");
const nextBtn = document.querySelector(".nav-arrow.right");

let currentIndex = 0;
let workCards = []; // será atualizado conforme a seção
let sectionType = ""; // "horizontal" ou "vertical"

// ===============================
// Função para carregar vídeo no modal (player customizado)
// ===============================
function loadVideo(index) {
  const card = workCards[index];
  if (!card) return;

  const videoUrl = card.getAttribute("data-video");
  const orientation = card.getAttribute("data-orientation");

  // cria o iframe customizado com parâmetros que escondem o player padrão
  const embedUrl = videoUrl.includes("?")
    ? videoUrl + "&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
    : videoUrl + "?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3";

  const wrapper = document.querySelector(".video-wrapper");
  wrapper.classList.remove("vertical", "horizontal");
  wrapper.classList.add(orientation);

  const customPlayer = wrapper.querySelector(".custom-player");
  customPlayer.innerHTML = `
    <iframe id="videoFrame" src="${embedUrl}" allow="autoplay; fullscreen" frameborder="0"></iframe>
    <div class="controls">
      <button class="play-pause">
        <svg viewBox="0 0 24 24" class="icon play"><path d="M8 5v14l11-7z"/></svg>
        <svg viewBox="0 0 24 24" class="icon pause"><path d="M6 19h4V5H6zm8-14v14h4V5h-4z"/></svg>
      </button>
      <div class="progress-bar"><div class="progress"></div></div>
      <span class="time">0:00</span>
    </div>
  `;

  // marca o player como "tocando" (muda ícone)
  customPlayer.classList.add("playing");

  const playPauseBtn = customPlayer.querySelector(".play-pause");
  playPauseBtn.addEventListener("click", () => {
    const frame = document.getElementById("videoFrame");
    if (customPlayer.classList.contains("playing")) {
      customPlayer.classList.remove("playing");
      frame.contentWindow.postMessage(
        '{"event":"command","func":"pauseVideo","args":""}',
        "*"
      );
    } else {
      customPlayer.classList.add("playing");
      frame.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        "*"
      );
    }
  });
}

// ===============================
// Abrir modal
// ===============================
document.querySelectorAll(".work-card").forEach((card) => {
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    const parentSection = card.closest(".trabalhos");
    sectionType = parentSection.classList.contains("trabalhos-verticais")
      ? "vertical"
      : "horizontal";

    workCards = Array.from(parentSection.querySelectorAll(".work-card"));
    currentIndex = workCards.indexOf(card);

    modal.style.display = "flex";
    loadVideo(currentIndex);
  });
});

// ===============================
// Fechar modal
// ===============================
document.querySelector(".close-btn").addEventListener("click", () => {
  modal.style.display = "none";
  const frame = document.getElementById("videoFrame");
  if (frame) frame.src = "";
});

// Fechar clicando fora
modal.addEventListener("click", e => {
  if (e.target.id === "videoModal") {
    modal.style.display = "none";
    const frame = document.getElementById("videoFrame");
    if (frame) frame.src = "";
  }
});

// ===============================
// Navegação pelas setas
// ===============================
prevBtn.addEventListener("click", e => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + workCards.length) % workCards.length;
  loadVideo(currentIndex);
});

nextBtn.addEventListener("click", e => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % workCards.length;
  loadVideo(currentIndex);
});

