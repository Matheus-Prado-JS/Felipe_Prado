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
/* ================================
   Swipe dentro do modal
================================ */
(function() {

  const modal = document.getElementById("videoModal");
  const leftVideoBtn = modal.querySelector(".nav-arrow.left");
  const rightVideoBtn = modal.querySelector(".nav-arrow.right");

  let startX = 0;
  let endX = 0;

  modal.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  modal.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (Math.abs(diff) < 50) return; // swipe muito fraco, ignora

    if (diff > 0) {
      // arrastou para a direita = vídeo anterior
      leftVideoBtn?.click();
    } else {
      // arrastou para a esquerda = próximo vídeo
      rightVideoBtn?.click();
    }
  });

})();

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
// ===============================
// Elementos do card de informações do vídeo
// ===============================
const videoTitleEl = document.querySelector(".video-title");
const videoDescriptionEl = document.querySelector(".video-description");

let currentIndex = 0;
let workCards = []; // será atualizado conforme a seção
let sectionType = ""; // "horizontal" ou "vertical"
let player; // instância da API do YouTube
// ===============================
// Fullscreen – controle de visibilidade dos controles
// ===============================
let controlsTimeout = null;

function showControls() {
  const playerEl = document.querySelector(".custom-player");
  if (!playerEl) return;
  if (!playerEl.classList.contains("is-fullscreen")) return;

  playerEl.classList.add("show-controls");
  playerEl.classList.remove("hide-controls");

  clearTimeout(controlsTimeout);

  controlsTimeout = setTimeout(() => {
    playerEl.classList.remove("show-controls");
    playerEl.classList.add("hide-controls");
  }, 2500);
  
}

// ===============================
// Atualiza informações do vídeo (título e descrição)
// ===============================
function updateVideoInfo(card) {
  if (!card) return;

  const title = card.getAttribute("data-title");
  const description = card.getAttribute("data-description");

  videoTitleEl.textContent = title || "";
  videoDescriptionEl.textContent = description || "";
}

// ===============================
// Função chamada automaticamente pela API do YouTube
// ===============================
function onYouTubeIframeAPIReady() {}

// ===============================
// Função para carregar vídeo no modal (player customizado)
// ===============================
function loadVideo(index) {
  const card = workCards[index];
  if (!card) return;

  updateVideoInfo(card);

  const videoUrl = card.getAttribute("data-video");
  const orientation = card.getAttribute("data-orientation");
  const videoId = extractVideoId(videoUrl);
  if (!videoId) return;
  const videoContent = document.querySelector(".video-content");
  videoContent.classList.toggle("vertical", orientation === "vertical");


  const wrapper = document.querySelector(".video-wrapper");
  wrapper.classList.remove("vertical", "horizontal");
  wrapper.classList.add(orientation);
  modal.classList.toggle("is-vertical", orientation === "vertical");


  const customPlayer = wrapper.querySelector(".custom-player");
  customPlayer.innerHTML = `
  <div class="interaction-layer"></div>
    <div id="videoFrame"></div>

     <div class="pause-overlay">
    <button class="pause-overlay-btn">▶ Continuar</button>
  </div>

    <div class="controls">
      <button class="play-pause">
        <svg viewBox="0 0 24 24" class="icon play"><path d="M8 5v14l11-7z"/></svg>
        <svg viewBox="0 0 24 24" class="icon pause"><path d="M6 19h4V5H6zm8-14v14h4V5h-4z"/></svg>
      </button>
      <div class="progress-bar"><div class="progress"></div></div>
      <span class="time">0:00</span>
      <input type="range" class="volume" min="0" max="100" value="100" />
      <button class="fullscreen-btn" aria-label="Tela cheia">
      <svg viewBox="0 0 24 24" class="icon fullscreen" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
      <path d="M16 3h3a2 2 0 0 1 2 2v3"/>
      <path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
      <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
      </svg>

    </button>
    </div>
  `;
const pauseOverlay = customPlayer.querySelector(".pause-overlay");

function showPauseOverlay() {
  pauseOverlay.style.opacity = "1";
  pauseOverlay.style.pointerEvents = "auto";
}

function hidePauseOverlay() {
  pauseOverlay.style.opacity = "0";
  pauseOverlay.style.pointerEvents = "none";
}
  customPlayer.classList.add("playing");

  // Cria o player YouTube via API
  player = new YT.Player("videoFrame", {
    videoId,
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
    events: {
  onReady: setupCustomControls,
 onStateChange: (event) => {
  syncPlayPauseIcon(event);

  // 🔑 Estados onde o overlay NÃO deve aparecer
  if (
    event.data === YT.PlayerState.PLAYING ||
    event.data === YT.PlayerState.BUFFERING ||
    event.data === YT.PlayerState.UNSTARTED
  ) {
    hidePauseOverlay();
  }

  // 🔑 Estado onde o overlay DEVE aparecer
  if (event.data === YT.PlayerState.PAUSED) {
    showPauseOverlay();
  }

  // Loop infinito
  if (event.data === YT.PlayerState.ENDED) {
    hidePauseOverlay();
    player.seekTo(0);
    player.playVideo();
  }
}
,
},

  });
}

// ===============================
// Extrai ID de vídeo de várias URLs
// ===============================
function extractVideoId(url) {
  if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
  if (url.includes("shorts/")) return url.split("shorts/")[1].split("?")[0];
  if (url.includes("embed/")) return url.split("embed/")[1].split("?")[0];
  return null;
}


// ===============================
// Liga os controles customizados
// ===============================
function setupCustomControls() {
  const playPauseBtn = document.querySelector(".play-pause");
  const progressBar = document.querySelector(".progress-bar");
  const progress = document.querySelector(".progress");
  const timeLabel = document.querySelector(".time");
  const volumeControl = document.querySelector(".volume");

  playPauseBtn.addEventListener("click", () => {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  });

  // FullScreen Mode
const fullscreenBtn = document.querySelector(".fullscreen-btn");

document.addEventListener("fullscreenchange", () => {
  const playerEl = document.querySelector(".custom-player");
  if (!playerEl) return;

  if (document.fullscreenElement) {
    playerEl.classList.add("is-fullscreen");
    showControls(); // mostra ao entrar
  } else {
    playerEl.classList.remove(
      "is-fullscreen",
      "hide-controls",
      "show-controls"
    );
    clearTimeout(controlsTimeout);
  }
});
const interactionLayer = document.querySelector(".interaction-layer");

if (interactionLayer) {
  interactionLayer.addEventListener("mousemove", showControls);
  interactionLayer.addEventListener("touchstart", showControls);
}


fullscreenBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  const playerContainer = document.querySelector(".custom-player");
  if (!playerContainer) return;

  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    playerContainer.requestFullscreen?.();
    playerContainer.webkitRequestFullscreen?.(); // Safari
  } else {
    document.exitFullscreen?.();
    document.webkitExitFullscreen?.();
  }
});


  volumeControl.addEventListener("input", e => {
    player.setVolume(e.target.value);
  });
  // Atualiza progresso e tempo
  setInterval(() => {
    if (player && player.getDuration) {
      const current = player.getCurrentTime();
      const total = player.getDuration();
      if (total > 0) {
        const percent = (current / total) * 100;
        progress.style.width = percent + "%";
        timeLabel.textContent = formatTime(current);
      }
    }
  }, 500);

  // Clicar na barra para mudar o tempo
  progressBar.addEventListener("click", e => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * player.getDuration();
    player.seekTo(newTime, true);
  });
  const playerEl = document.querySelector(".custom-player");
const pauseBtn = document.querySelector(".pause-overlay-btn");

if (pauseBtn) {
  pauseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    player.playVideo();
  });
}
// ===============================
  // Pausar / despausar clicando no vídeo
  // ===============================
  const customPlayer = document.querySelector(".custom-player");

  const togglePlay = () => {
    if (!player) return;

    const state = player.getPlayerState();

    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  // Clique desktop
 customPlayer.addEventListener("click", (e) => {
  // Se clicou em algum controle, ignora
  if (e.target.closest(".controls")) return;

  togglePlay();
});

  // Touch mobile / Safari
  customPlayer.addEventListener("touchstart", (e) => {
  if (e.target.closest(".controls")) return;
  togglePlay();
}, { passive: true });

}
 // Garantir que Progress, Volume, Full não disparem o player por acidente
 document.querySelectorAll(".controls *").forEach(el => {
  el.addEventListener("click", e => {
    e.stopPropagation();
  });
});

// ===============================
// Atualiza ícone play/pause
// ===============================
function syncPlayPauseIcon(event) {
  const customPlayer = document.querySelector(".custom-player");

  if (event.data === YT.PlayerState.PLAYING) {
    customPlayer.classList.add("playing");
  } 
  
  if (event.data === YT.PlayerState.PAUSED) {
    customPlayer.classList.remove("playing");
  }
  
}


// ===============================
// Formata tempo (segundos → mm:ss)
// ===============================
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
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
  if (player) player.stopVideo();
});

// ===============================
// Fechar clicando fora do modal
// ===============================
modal.addEventListener("click", e => {
  if (e.target.id === "videoModal") {
    modal.style.display = "none";
    if (player) player.stopVideo();
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
