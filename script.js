// CARROSSEL SUAVE
document.querySelectorAll(".carousel").forEach(carousel => {
  carousel.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    carousel.scrollBy({
      left: evt.deltaY < 0 ? -100 : 100,
      behavior: "smooth"
    });
  });
});

// MODAL DE VÍDEO
const modal = document.getElementById("videoModal");
const iframe = document.getElementById("videoFrame");
const modalContent = modal.querySelector(".modal-content");
const closeBtn = document.querySelector(".close");

// ABRIR VÍDEO AO CLICAR NO CARD
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const videoId = card.getAttribute("data-video");
    const orientation = card.getAttribute("data-orientation") || "horizontal";

    if(videoId) {
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      
      // Ajusta a classe do modal para orientação
      if(orientation === "vertical") {
        modalContent.classList.add("vertical");
      } else {
        modalContent.classList.remove("vertical");
      }

      modal.style.display = "flex";
    }
  });
});

// FECHAR MODAL
const closeModal = () => {
  iframe.src = "";
  modal.style.display = "none";
  modalContent.classList.remove("vertical");
};

closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if(e.target === modal) closeModal();
});
