// ===================================================================
// MÓDULO — Lookbook carousel
// ===================================================================

let lbCurrentIndex = 0;
const lbSlideCount = 4;
const lbSlideWidth = 33.333;

function updateLookbookPosition() {
  const track = document.getElementById('lookbookTrack');
  if (!track) return;
  const offset = -lbCurrentIndex * (lbSlideWidth + 0.667);
  track.style.transform = `translateX(calc(${offset}% + ${-lbCurrentIndex * 1}rem))`;

  document.querySelectorAll('.lb-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === lbCurrentIndex);
  });
}

window.lbNext = function() {
  lbCurrentIndex = (lbCurrentIndex + 1) % lbSlideCount;
  updateLookbookPosition();
};

window.lbPrev = function() {
  lbCurrentIndex = (lbCurrentIndex - 1 + lbSlideCount) % lbSlideCount;
  updateLookbookPosition();
};

window.lbGoTo = function(index) {
  if (index >= 0 && index < lbSlideCount) {
    lbCurrentIndex = index;
    updateLookbookPosition();
  }
};
