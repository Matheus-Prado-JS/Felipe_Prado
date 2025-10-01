// Pequeno script caso queira ligar funcionalidades no futuro
document.addEventListener('DOMContentLoaded', ()=>{
// Exemplo: trocar background facilmente via data attribute (pode ser usado posteriormente)
// document.querySelector('.hero').dataset.bg = 'url(...)'
console.log('Hero carregado');
});
// Carrossel Trabalhos
const track = document.querySelector(".carousel-track");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let index = 0;
const cardWidth = 304; // largura + gap
const totalCards = document.querySelectorAll(".work-card").length;

nextBtn.addEventListener("click", () => {
  if (index < totalCards - 1) {
    index++;
    track.style.transform = `translateX(-${index * cardWidth}px)`;
  }
});

prevBtn.addEventListener("click", () => {
  if (index > 0) {
    index--;
    track.style.transform = `translateX(-${index * cardWidth}px)`;
  }
});
// Detecta quando a seção "Serviços" entra na tela
const servicosSection = document.querySelector(".servicos");

if (servicosSection) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          document.body.classList.add("light-theme");
        } else {
          document.body.classList.remove("light-theme");
        }
      });
    },
    { threshold: 0.4 } // 40% da seção visível já ativa a troca
  );

  observer.observe(servicosSection);
}
