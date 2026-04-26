const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const hero = document.querySelector(".hero");
const heroScenes = [...document.querySelectorAll("[data-hero-scene]")];
const heroShowcaseItems = [...document.querySelectorAll("[data-hero-stage]")];
const heroShowcaseButtons = [...document.querySelectorAll("[data-hero-stage-button]")];
const trustStrip = document.querySelector(".trust-strip");
const navLinks = [...document.querySelectorAll(".nav__link[href^='#']")];
const hashLinks = [...document.querySelectorAll("a[href^='#']")].filter((link) => {
  const href = link.getAttribute("href");
  return Boolean(href && href.length > 1);
});
const toggleableSections = [...document.querySelectorAll("main > section[id]")];
const toggleableElements = [trustStrip, ...toggleableSections].filter(Boolean);
const sectionById = new Map(toggleableSections.map((section) => [section.id, section]));
const revealElements = [...document.querySelectorAll("[data-reveal]")];
const counterElements = [...document.querySelectorAll("[data-counter]")];
const contactForm = document.querySelector("[data-contact-form]");
const yearTarget = document.querySelector("[data-year]");

const defaultRouteId = "inicio";
const hiddenSectionClass = "is-section-hidden";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsIntersectionObserver = "IntersectionObserver" in window;

const serviceSectionIds = [
  "obras-publicas",
  "servicios",
  "detalle-laboratorio",
  "detalle-calidad",
  "detalle-geotecnia",
  "detalle-implementacion",
  "ensayos",
  "proceso",
  "cobertura",
];

const projectSectionIds = [
  "proyectos",
  "clientes",
  "documentos",
  "reportes",
  "galeria",
];

const routeMap = {
  inicio: {
    activeNav: "inicio",
    visibleIds: ["inicio"],
    includeTrustStrip: true,
  },
  nosotros: {
    activeNav: "nosotros",
    visibleIds: ["nosotros"],
  },
  servicios: {
    activeNav: "servicios",
    visibleIds: serviceSectionIds,
  },
  "obras-publicas": {
    activeNav: "servicios",
    visibleIds: serviceSectionIds,
  },
  "detalle-laboratorio": {
    activeNav: "servicios",
    visibleIds: serviceSectionIds,
  },
  "detalle-calidad": {
    activeNav: "servicios",
    visibleIds: serviceSectionIds,
  },
  "detalle-geotecnia": {
    activeNav: "servicios",
    visibleIds: serviceSectionIds,
  },
  "detalle-implementacion": {
    activeNav: "servicios",
    visibleIds: serviceSectionIds,
  },
  ensayos: {
    activeNav: "servicios",
    visibleIds: serviceSectionIds,
  },
  proceso: {
    activeNav: "servicios",
    visibleIds: serviceSectionIds,
  },
  cobertura: {
    activeNav: "servicios",
    visibleIds: serviceSectionIds,
  },
  proyectos: {
    activeNav: "proyectos",
    visibleIds: projectSectionIds,
  },
  clientes: {
    activeNav: "proyectos",
    visibleIds: projectSectionIds,
  },
  documentos: {
    activeNav: "proyectos",
    visibleIds: projectSectionIds,
  },
  reportes: {
    activeNav: "proyectos",
    visibleIds: projectSectionIds,
  },
  galeria: {
    activeNav: "proyectos",
    visibleIds: projectSectionIds,
  },
  contacto: {
    activeNav: "contacto",
    visibleIds: ["contacto"],
  },
};

let revealObserver;
let counterObserver;
let heroStageIndex = 0;
let heroStageTimer;

const getSafeScrollBehavior = (behavior = "smooth") => {
  if (prefersReducedMotion) {
    return "auto";
  }

  return behavior;
};

const getHashId = (hashValue = "") => decodeURIComponent(hashValue.replace(/^#/, "")).trim();

const getHeroStageCount = () => Math.max(heroScenes.length, heroShowcaseItems.length, heroShowcaseButtons.length, 0);

const resolveRoute = (hashValue = "") => {
  const routeId = getHashId(hashValue) || defaultRouteId;
  return {
    requestedId: routeId,
    route: routeMap[routeId] || routeMap[defaultRouteId],
  };
};

const setHeroStage = (nextIndex) => {
  const totalStages = getHeroStageCount();

  if (totalStages === 0) {
    return;
  }

  heroStageIndex = ((nextIndex % totalStages) + totalStages) % totalStages;

  heroScenes.forEach((scene, sceneIndex) => {
    scene.classList.toggle("is-active", sceneIndex === heroStageIndex);
  });

  heroShowcaseItems.forEach((item, itemIndex) => {
    const isActive = itemIndex === heroStageIndex;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-hidden", String(!isActive));
  });

  heroShowcaseButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === heroStageIndex;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const stopHeroStageRotation = () => {
  if (!heroStageTimer) {
    return;
  }

  window.clearInterval(heroStageTimer);
  heroStageTimer = undefined;
};

const startHeroStageRotation = () => {
  const totalStages = getHeroStageCount();

  if (prefersReducedMotion || totalStages <= 1) {
    return;
  }

  stopHeroStageRotation();
  heroStageTimer = window.setInterval(() => {
    setHeroStage(heroStageIndex + 1);
  }, 4600);
};

const restartHeroStageRotation = () => {
  stopHeroStageRotation();
  startHeroStageRotation();
};

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

const toggleRouteSections = (route) => {
  const visibleElements = new Set(
    route.visibleIds
      .map((id) => sectionById.get(id))
      .filter(Boolean),
  );

  if (route.includeTrustStrip && trustStrip) {
    visibleElements.add(trustStrip);
  }

  toggleableElements.forEach((element) => {
    element.classList.toggle(hiddenSectionClass, !visibleElements.has(element));
  });
};

const refreshRevealObservers = () => {
  const visibleRevealElements = revealElements.filter((element) => {
    const parentSection = element.closest("section[id]");
    const parentIsVisible = !parentSection || !parentSection.classList.contains(hiddenSectionClass);
    const stripIsVisible = !trustStrip || !trustStrip.classList.contains(hiddenSectionClass);

    if (trustStrip && trustStrip.contains(element)) {
      return stripIsVisible;
    }

    return parentIsVisible;
  });

  if (revealObserver) {
    visibleRevealElements.forEach((element) => {
      if (!element.classList.contains("is-visible")) {
        revealObserver.observe(element);
      }
    });
  } else if (!supportsIntersectionObserver) {
    visibleRevealElements.forEach((element) => element.classList.add("is-visible"));
  }

  if (counterObserver) {
    counterElements.forEach((element) => {
      const parentSection = element.closest("section[id]");

      if (parentSection && parentSection.classList.contains(hiddenSectionClass)) {
        return;
      }

      if (element.dataset.counted !== "true") {
        counterObserver.observe(element);
      }
    });
  }
};

const scrollToRouteTarget = (requestedId, route, behavior = "smooth") => {
  const safeBehavior = getSafeScrollBehavior(behavior);
  const fallbackId = route.visibleIds[0];
  const targetId = sectionById.has(requestedId) ? requestedId : fallbackId;
  const target = targetId === "inicio" ? hero : sectionById.get(targetId);

  if (!target) {
    window.scrollTo({ top: 0, behavior: safeBehavior });
    return;
  }

  if (target === hero) {
    window.scrollTo({ top: 0, behavior: safeBehavior });
    return;
  }

  const headerOffset = header ? header.offsetHeight + 18 : 0;
  const targetTop = Math.max(target.getBoundingClientRect().top + window.scrollY - headerOffset, 0);
  window.scrollTo({ top: targetTop, behavior: safeBehavior });
};

const applyRoute = (hashValue, { behavior = "smooth" } = {}) => {
  const { requestedId, route } = resolveRoute(hashValue);
  toggleRouteSections(route);
  setActiveNavLink(route.activeNav);
  closeNav();

  window.requestAnimationFrame(() => {
    refreshRevealObservers();
    scrollToRouteTarget(requestedId, route, behavior);
  });
};

const updateHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const navigateToHash = (hashId) => {
  const normalizedHash = `#${hashId}`;

  if (window.location.hash === normalizedHash || (!window.location.hash && hashId === defaultRouteId)) {
    applyRoute(normalizedHash, { behavior: "smooth" });
    return;
  }

  window.location.hash = hashId;
};

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

  if (prefersReducedMotion) {
    hero.classList.add("hero--entered");
  } else {
    enterHero();
  }
}

if (getHeroStageCount() > 0) {
  setHeroStage(0);
  startHeroStageRotation();

  heroShowcaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextIndex = Number(button.dataset.heroStageButton || "0");
      setHeroStage(nextIndex);
      restartHeroStageRotation();
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopHeroStageRotation();
      return;
    }

    startHeroStageRotation();
  });
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.classList.toggle("is-active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });
}

hashLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const hashId = getHashId(link.getAttribute("href") || "");

    if (!hashId || (!routeMap[hashId] && !sectionById.has(hashId))) {
      return;
    }

    event.preventDefault();
    navigateToHash(hashId);
  });
});

updateHeaderState();
applyRoute(window.location.hash, { behavior: "auto" });

window.addEventListener("hashchange", () => {
  applyRoute(window.location.hash, { behavior: "smooth" });
});

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

if (supportsIntersectionObserver && revealElements.length > 0) {
  revealObserver = new IntersectionObserver((entries, currentObserver) => {
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

  revealElements.forEach((element) => revealObserver.observe(element));
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

if (supportsIntersectionObserver && counterElements.length > 0) {
  counterObserver = new IntersectionObserver((entries, currentObserver) => {
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

refreshRevealObservers();

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
      "Hola, quiero solicitar informacion.",
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
