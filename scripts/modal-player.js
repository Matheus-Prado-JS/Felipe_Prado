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

// Atualiza ícone play/pause
function syncPlayPauseIcon(event) {
  const customPlayer = document.querySelector(".custom-player");
  if (!customPlayer) return;

  if (event.data === YT.PlayerState.PLAYING) {
    customPlayer.classList.add("playing");
  }

  if (event.data === YT.PlayerState.PAUSED) {
    customPlayer.classList.remove("playing");
  }
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
  let sectionType = "";
  let player = null;

  let controlsTimeout = null;

  // ativa swipe do modal
  initModalSwipe(modal);

  /* ===============================
     Fullscreen – controle visibilidade controles
  =============================== */
  function showControls() {
    const playerEl = modal.querySelector(".custom-player");
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
     Liga os controles customizados
  =============================== */
  function setupCustomControls() {
    const playPauseBtn = modal.querySelector(".play-pause");
    const progressBar = modal.querySelector(".progress-bar");
    const progress = modal.querySelector(".progress");
    const timeLabel = modal.querySelector(".time");
    const volumeControl = modal.querySelector(".volume");
    const fullscreenBtn = modal.querySelector(".fullscreen-btn");

    if (!playPauseBtn || !progressBar || !progress || !timeLabel || !volumeControl) {
      return;
    }

    playPauseBtn.addEventListener("click", () => {
      if (!player) return;

      if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    });

    volumeControl.addEventListener("input", (e) => {
      if (!player) return;
      player.setVolume(e.target.value);
    });

    // Atualiza progresso e tempo
    setInterval(() => {
      if (!player || !player.getDuration) return;

      const current = player.getCurrentTime();
      const total = player.getDuration();

      if (total > 0) {
        const percent = (current / total) * 100;
        progress.style.width = percent + "%";
        timeLabel.textContent = formatTime(current);
      }
    }, 500);

    // Clicar na barra para mudar o tempo
    progressBar.addEventListener("click", (e) => {
      if (!player) return;

      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * player.getDuration();

      player.seekTo(newTime, true);
    });

    // Fullscreen
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        const playerContainer = modal.querySelector(".custom-player");
        if (!playerContainer) return;

        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          playerContainer.requestFullscreen?.();
          playerContainer.webkitRequestFullscreen?.();
        } else {
          document.exitFullscreen?.();
          document.webkitExitFullscreen?.();
        }
      });
    }

    // Detecta fullscreen
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

    // movimento mostra controles
    const interactionLayer = modal.querySelector(".interaction-layer");
    if (interactionLayer) {
      interactionLayer.addEventListener("mousemove", showControls);
      interactionLayer.addEventListener("touchstart", showControls);
    }
  }

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

    customPlayer.innerHTML = `
      <div id="videoFrame"></div>
      <div class="controls">
        <button class="play-pause">
          <svg viewBox="0 0 24 24" class="icon play"><path d="M8 5v14l11-7z"/></svg>
          <svg viewBox="0 0 24 24" class="icon pause"><path d="M6 19h4V5H6zm8-14v14h4V5h-4z"/></svg>
        </button>

        <div class="progress-bar">
          <div class="progress"></div>
        </div>

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

    customPlayer.classList.add("playing");

    // Impede clique nos controles de pausar o vídeo
    customPlayer.querySelectorAll(".controls *").forEach((el) => {
      el.addEventListener("click", (e) => e.stopPropagation());
    });

    // Clique no vídeo = play/pause
    function togglePlay() {
      if (!player) return;

      const state = player.getPlayerState();

      if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }

    customPlayer.addEventListener("click", (e) => {
      if (e.target.closest(".controls")) return;
      togglePlay();
    });

    customPlayer.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".controls")) return;
      togglePlay();
    });


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

      sectionType = parentSection.classList.contains("trabalhos-verticais")
        ? "vertical"
        : "horizontal";

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
  });

  modal.addEventListener("click", (e) => {
    if (e.target.id === "videoModal") {
      modal.style.display = "none";
      if (player) player.stopVideo();
    }
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
