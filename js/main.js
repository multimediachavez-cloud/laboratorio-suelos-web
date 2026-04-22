const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const hero = document.querySelector(".hero");
const revealElements = document.querySelectorAll("[data-reveal]");
const counterElements = document.querySelectorAll("[data-counter]");
const contactForm = document.querySelector("[data-contact-form]");
const yearTarget = document.querySelector("[data-year]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

const updateHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if (hero && window.matchMedia("(pointer:fine)").matches) {
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    hero.style.setProperty("--pointer-x", `${x}%`);
    hero.style.setProperty("--pointer-y", `${y}%`);
  });
}

if ("IntersectionObserver" in window && revealElements.length > 0) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.18,
  });

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const animateCounter = (element) => {
  if (element.dataset.counted === "true") {
    return;
  }

  const target = Number(element.dataset.counter || "0");
  const duration = 1400;
  const startTime = performance.now();

  const step = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));

    if (progress < 1) {
      window.requestAnimationFrame(step);
      return;
    }

    element.dataset.counted = "true";
    element.textContent = String(target);
  };

  window.requestAnimationFrame(step);
};

if ("IntersectionObserver" in window && counterElements.length > 0) {
  const counterObserver = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.7,
  });

  counterElements.forEach((element) => counterObserver.observe(element));
} else {
  counterElements.forEach((element) => animateCounter(element));
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const nombre = formData.get("nombre") || "";
    const empresa = formData.get("empresa") || "";
    const correo = formData.get("correo") || "";
    const servicio = formData.get("servicio") || "";
    const mensaje = formData.get("mensaje") || "";

    const whatsappNumber = "51975457825";
    const text = [
      "Hola, quiero solicitar información.",
      `Nombre: ${nombre}`,
      empresa ? `Empresa: ${empresa}` : "",
      `Correo: ${correo}`,
      `Servicio: ${servicio}`,
      mensaje ? `Detalle: ${mensaje}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
}
