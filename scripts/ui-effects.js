/* ===========================
   Tema claro: inicia em .trabalhos-verticais e termina depois de .servicos
   lógica: verifica posição do CENTRO da viewport (mais estável que thresholds)
=========================== */
function initThemeToggleBetweenSections() {
  const startEl = document.querySelector('.trabalhos-verticais');
  const endEl = document.querySelector('.servicos');

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

  window.addEventListener('resize', checkAndToggleTheme);

  checkAndToggleTheme();
}

/* ===========================
   Scroll reveal: .quem-sou-eu
=========================== */
function initQuemSouEuReveal() {
  const sections = document.querySelectorAll('.quem-sou-eu');
  if (!sections.length) return;

  function reveal() {
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top < window.innerHeight - 100) {
        sec.classList.add('show');
      }
    });
  }

  window.addEventListener('scroll', reveal);
  reveal(); // já revela se já estiver na tela
}
