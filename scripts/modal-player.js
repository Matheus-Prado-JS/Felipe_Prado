/* ================================
   Swipe dentro do modal
================================ */
function initModalSwipe(modal) {
  if (!modal) return;

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

    if (Math.abs(diff) < 50) return;

    if (diff > 0) leftVideoBtn?.click();
    else rightVideoBtn?.click();
  });
}

/* ===============================
   Funções auxiliares
================================ */

// Extrai ID de vídeo de várias URLs
function extractVideoId(url) {
  if (!url) return null;

  if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
  if (url.includes("shorts/")) return url.split("shorts/")[1].split("?")[0];
  if (url.includes("embed/")) return url.split("embed/")[1].split("?")[0];

  return null;
}

// Formata tempo (segundos → mm:ss)
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ===============================
   INIT PRINCIPAL DO MODAL PLAYER
================================ */
function initVideoModal() {
  const modal = document.getElementById("videoModal");
  if (!modal) return;

  const prevBtn = modal.querySelector(".nav-arrow.left");
  const nextBtn = modal.querySelector(".nav-arrow.right");
  const closeBtn = modal.querySelector(".close-btn");

  const videoTitleEl = modal.querySelector(".video-title");
  const videoDescriptionEl = modal.querySelector(".video-description");

  let currentIndex = 0;
  let workCards = [];
  let player = null;

  let controlsTimeout = null;
  let progressInterval = null;

  // ativa swipe do modal
  initModalSwipe(modal);

  /* ===============================
     Mostrar controles no fullscreen
     (Agora respeita pause)
  =============================== */
  function showControls() {
    const playerEl = modal.querySelector(".custom-player");
    if (!playerEl) return;
    if (!playerEl.classList.contains("is-fullscreen")) return;

    playerEl.classList.add("show-controls");
    playerEl.classList.remove("hide-controls");

    clearTimeout(controlsTimeout);

    // Se estiver pausado, NÃO some com os controles
    if (player && player.getPlayerState) {
      const state = player.getPlayerState();

      if (state === YT.PlayerState.PAUSED) {
        return; // mantém sempre visível
      }
    }

    // Se estiver tocando, some depois de 2.5s
    controlsTimeout = setTimeout(() => {
      playerEl.classList.remove("show-controls");
      playerEl.classList.add("hide-controls");
    }, 2500);
  }

  /* ===============================
     Atualiza informações do vídeo
  =============================== */
  function updateVideoInfo(card) {
    if (!card) return;

    const title = card.getAttribute("data-title");
    const description = card.getAttribute("data-description");

    videoTitleEl.textContent = title || "";
    videoDescriptionEl.textContent = description || "";
  }

  /* ===============================
     Atualiza ícone play/pause
  =============================== */
  function syncPlayPauseIcon(state) {
    const customPlayer = modal.querySelector(".custom-player");
    if (!customPlayer) return;

    if (state === YT.PlayerState.PLAYING) {
      customPlayer.classList.add("playing");

      // se começar a tocar, deixa sumir de novo
      showControls();
    }

    if (state === YT.PlayerState.PAUSED) {
      customPlayer.classList.remove("playing");

      // se pausou, controles devem ficar sempre visíveis
      clearTimeout(controlsTimeout);

      customPlayer.classList.add("show-controls");
      customPlayer.classList.remove("hide-controls");
    }
  }

  /* ===============================
     Toggle play/pause
  =============================== */
  function togglePlay() {
    if (!player) return;

    const state = player.getPlayerState();

    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }

  /* ===============================
     Fullscreen toggle
  =============================== */
  function toggleFullscreen() {
    const playerContainer = modal.querySelector(".custom-player");
    if (!playerContainer) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      playerContainer.requestFullscreen?.();
      playerContainer.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.();
      document.webkitExitFullscreen?.();
    }
  }

  /* ===============================
     Atualiza barra de progresso
  =============================== */
  function startProgressLoop() {
    stopProgressLoop();

    progressInterval = setInterval(() => {
      if (!player || !player.getDuration) return;

      const progress = modal.querySelector(".progress");
      const timeLabel = modal.querySelector(".time");

      if (!progress || !timeLabel) return;

      const current = player.getCurrentTime();
      const total = player.getDuration();

      if (total > 0) {
        const percent = (current / total) * 100;
        progress.style.width = percent + "%";
        timeLabel.textContent = formatTime(current);
      }
    }, 500);
  }

  function stopProgressLoop() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  /* ===============================
     Detecta fullscreen (1 vez só)
  =============================== */
  document.addEventListener("fullscreenchange", () => {
    const playerEl = modal.querySelector(".custom-player");
    if (!playerEl) return;

    if (document.fullscreenElement) {
      playerEl.classList.add("is-fullscreen");
      showControls();
    } else {
      playerEl.classList.remove("is-fullscreen", "hide-controls", "show-controls");
      clearTimeout(controlsTimeout);
    }
  });

  /* ===============================
     Delegação de eventos (IMPORTANTE)
     Um listener só para todos botões.
  =============================== */
  modal.addEventListener("click", (e) => {
    // Fechar clicando fora
    if (e.target.id === "videoModal") {
      modal.style.display = "none";
      if (player) player.stopVideo();
      stopProgressLoop();
      return;
    }

    // Play/Pause botão
    if (e.target.closest(".play-pause")) {
      e.stopPropagation();
      togglePlay();
      return;
    }

    // Fullscreen botão
    if (e.target.closest(".fullscreen-btn")) {
      e.stopPropagation();
      toggleFullscreen();
      return;
    }

    // Barra de progresso
    if (e.target.closest(".progress-bar")) {
      if (!player) return;

      const progressBar = e.target.closest(".progress-bar");
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * player.getDuration();

      player.seekTo(newTime, true);
      return;
    }

    // Clique no vídeo (fora controles) = toggle play
    if (e.target.closest(".custom-player")) {
      if (e.target.closest(".controls")) return;
      togglePlay();
      return;
    }
  });

  /* ===============================
     Controle de volume (input range)
     Também via delegação
  =============================== */
  modal.addEventListener("input", (e) => {
    if (!player) return;

    if (e.target.matches(".volume")) {
      player.setVolume(e.target.value);
    }
  });

  /* ===============================
     Mostrar controles quando mexer
  =============================== */
document.addEventListener("mousemove", showControls);
document.addEventListener("touchstart", showControls);


  /* ===============================
     Carrega vídeo no modal
  =============================== */
  function loadVideo(index) {
    const card = workCards[index];
    if (!card) return;

    updateVideoInfo(card);

    const videoUrl = card.getAttribute("data-video");
    const orientation = card.getAttribute("data-orientation");
    const videoId = extractVideoId(videoUrl);

    if (!videoId) return;

    const videoContent = modal.querySelector(".video-content");
    videoContent?.classList.toggle("vertical", orientation === "vertical");

    const wrapper = modal.querySelector(".video-wrapper");
    if (!wrapper) return;

    wrapper.classList.remove("vertical", "horizontal");
    wrapper.classList.add(orientation);

    modal.classList.toggle("is-vertical", orientation === "vertical");

    const customPlayer = wrapper.querySelector(".custom-player");
    if (!customPlayer) return;

    // Se já existir player, destrói antes
    if (player && player.destroy) {
      player.destroy();
      player = null;
    }

    stopProgressLoop();

    customPlayer.innerHTML = `
      <div id="videoFrame"></div>

      <div class="controls">
        <button class="play-pause" type="button">
          <svg viewBox="0 0 24 24" class="icon play"><path d="M8 5v14l11-7z"/></svg>
          <svg viewBox="0 0 24 24" class="icon pause"><path d="M6 19h4V5H6zm8-14v14h4V5h-4z"/></svg>
        </button>

        <div class="progress-bar">
          <div class="progress"></div>
        </div>

        <span class="time">0:00</span>

        <input type="range" class="volume" min="0" max="100" value="100" />

        <button class="fullscreen-btn" type="button" aria-label="Tela cheia">
          <svg viewBox="0 0 24 24" class="icon fullscreen" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
            <path d="M16 3h3a2 2 0 0 1 2 2v3"/>
            <path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
            <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
          </svg>
        </button>
      </div>
    `;

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
        onReady: () => {
          startProgressLoop();
        },
        onStateChange: (event) => {
          syncPlayPauseIcon(event.data);

          // se acabar, reinicia
          if (event.data === YT.PlayerState.ENDED) {
            player.seekTo(0);
            player.playVideo();
          }
        },
      },
    });
  }

  /* ===============================
     Abrir modal clicando no card
  =============================== */
  document.querySelectorAll(".work-card").forEach((card) => {
    card.style.cursor = "pointer";

    card.addEventListener("click", () => {
      const parentSection = card.closest(".trabalhos");
      if (!parentSection) return;

      workCards = Array.from(parentSection.querySelectorAll(".work-card"));
      currentIndex = workCards.indexOf(card);

      modal.style.display = "flex";
      loadVideo(currentIndex);
    });
  });

  /* ===============================
     Fechar modal
  =============================== */
  closeBtn?.addEventListener("click", () => {
    modal.style.display = "none";
    if (player) player.stopVideo();
    stopProgressLoop();
  });

  /* ===============================
     Navegação pelas setas
  =============================== */
  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (workCards.length === 0) return;

    currentIndex = (currentIndex - 1 + workCards.length) % workCards.length;
    loadVideo(currentIndex);
  });

  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (workCards.length === 0) return;

    currentIndex = (currentIndex + 1) % workCards.length;
    loadVideo(currentIndex);
  });
}
