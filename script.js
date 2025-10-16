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
// ===============================
// MODAL DE VÍDEOS OTIMIZADO
// ===============================

// Seletores principais (pegos uma vez só)
const modal = document.getElementById("videoModal");
const frame = document.getElementById("videoFrame");
const wrapper = document.querySelector(".video-wrapper");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const closeBtn = document.querySelector(".close-btn");

let workCards = [];
let currentIndex = 0;
let sectionType = "";

// Função para carregar vídeo (com preview)
function loadVideo(index) {
  const card = workCards[index];
  if (!card) return;

  const videoUrl = card.getAttribute("data-video");
  const orientation = card.getAttribute("data-orientation");

  // Extrai o ID do vídeo
  let videoId = "";
  if (videoUrl.includes("embed/")) videoId = videoUrl.split("embed/")[1];
  else if (videoUrl.includes("watch?v=")) videoId = videoUrl.split("watch?v=")[1];
  else if (videoUrl.includes("shorts/")) videoId = videoUrl.split("shorts/")[1];
  videoId = videoId.split("?")[0];

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  // Atualiza o modal
  wrapper.classList.remove("vertical", "horizontal");
  wrapper.classList.add(orientation);
  frame.style.display = "none";
  frame.src = "";

  // Cria ou atualiza thumbnail + player customizado
  let customPlayer = wrapper.querySelector(".custom-player");
  let thumb = wrapper.querySelector(".video-thumb");

  if (!customPlayer) {
    customPlayer = document.createElement("div");
    customPlayer.className = "custom-player";
    thumb = document.createElement("img");
    thumb.className = "video-thumb";
    customPlayer.appendChild(thumb);
    const playIcon = document.createElement("div");
    playIcon.className = "play-icon";
    playIcon.innerHTML = "▶";
    customPlayer.appendChild(playIcon);
    wrapper.appendChild(customPlayer);
  }

  thumb.src = thumbUrl;
  thumb.style.opacity = "1";
  customPlayer.style.display = "flex";
  customPlayer.classList.remove("fade-out");

  // Clique para iniciar vídeo
  customPlayer.onclick = () => {
    customPlayer.classList.add("fade-out");
    setTimeout(() => {
      customPlayer.style.display = "none";
      frame.src = embedUrl;
      frame.style.display = "block";
    }, 400);
  };
}

// Abrir modal
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

// Fechar modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  frame.src = "";
});

// Fechar clicando fora
modal.addEventListener("click", (e) => {
  if (e.target.id === "videoModal") {
    modal.style.display = "none";
    frame.src = "";
  }
});

// Navegação pelas setas
prevBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + workCards.length) % workCards.length;
  loadVideo(currentIndex);
});

nextBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % workCards.length;
  loadVideo(currentIndex);
});

