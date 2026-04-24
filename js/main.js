const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const hero = document.querySelector(".hero");
const navLinks = [...document.querySelectorAll(".nav__link[href^='#']")];
const trackedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const revealElements = document.querySelectorAll("[data-reveal]");
const counterElements = document.querySelectorAll("[data-counter]");
const contactForm = document.querySelector("[data-contact-form]");
const yearTarget = document.querySelector("[data-year]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (hero) {
  hero.classList.add("hero--primed");

  const enterHero = () => {
    window.requestAnimationFrame(() => {
      hero.classList.add("hero--entered");
    });
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hero.classList.add("hero--entered");
  } else {
    enterHero();
  }
}

const closeNav = () => {
  if (!nav || !navToggle) {
    return;
  }

  nav.classList.remove("is-open");
  navToggle.classList.remove("is-active");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
};

const setActiveNavLink = (sectionId) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
      return;
    }

    link.removeAttribute("aria-current");
  });
};

const updateActiveNavLink = () => {
  if (trackedSections.length === 0) {
    return;
  }

  const headerHeight = header ? header.offsetHeight : 0;
  const threshold = headerHeight + 56;
  let activeSection = trackedSections[0];

  trackedSections.forEach((section) => {
    const rect = section.getBoundingClientRect();

    if (rect.top - threshold <= 0) {
      activeSection = section;
    }
  });

  setActiveNavLink(activeSection.id);
};

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.classList.toggle("is-active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNav();
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });
}

const updateHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeaderState();
updateActiveNavLink();
window.addEventListener("scroll", () => {
  updateHeaderState();
  updateActiveNavLink();
}, { passive: true });
window.addEventListener("resize", updateActiveNavLink);

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

    const whatsappNumber = "51920493433";
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
