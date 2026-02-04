// Copy email to clipboard (click)
// - Click: copy
// - Shift+Click: open mail client (mailto)
(function () {
  function showToast(toastEl) {
    toastEl.classList.add("show");
    clearTimeout(toastEl.__t);
    toastEl.__t = setTimeout(() => toastEl.classList.remove("show"), 1200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch (e2) {
        return false;
      }
    }
  }

  document.addEventListener("click", async (e) => {
    const el = e.target.closest(".copy-email");
    if (!el) return;

    const email = el.getAttribute("data-email");
    if (!email) return;

    // Shift+Click -> allow mailto open
    if (e.shiftKey) return;

    e.preventDefault();

    const ok = await copyText(email);

    const toast = el.parentElement && el.parentElement.querySelector(".copy-toast");
    if (toast) {
      toast.textContent = ok ? "Copied!" : "Copy failed";
      showToast(toast);
    }
  });
})();

// Project Carousel Navigation
function scrollCarousel(direction) {
  const carousel = document.getElementById('projectCarousel');
  if (!carousel) return;
  
  const cardWidth = carousel.querySelector('.carousel-card').offsetWidth;
  const gap = 14;
  const scrollAmount = (cardWidth + gap) * direction;
  
  carousel.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
}
