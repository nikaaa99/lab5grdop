document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const nav = document.querySelector(".nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const backToTop = document.querySelector("#backToTop");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* =====================================
     1. ТОЧНАЯ ПЛАВНАЯ НАВИГАЦИЯ
  ===================================== */

  function getHeaderHeight() {
    return header ? header.offsetHeight : 0;
  }

  function closeMobileMenu() {
    if (!nav || !menuToggle) return;

    nav.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
  }

  function scrollToSection(target, updateAddress = true) {
    if (!target) return;

    const headerHeight = getHeaderHeight();

    const targetPosition =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      10;

    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: reduceMotion ? "instant" : "smooth"
    });

    if (updateAddress && target.id) {
      history.pushState(null, "", `#${target.id}`);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.getElementById(href.slice(1));

      if (!target) return;

      event.preventDefault();

      closeMobileMenu();
      scrollToSection(target);
    });
  });

  // Если страница открылась по ссылке с якорем
  if (window.location.hash) {
    const initialTarget = document.getElementById(
      window.location.hash.slice(1)
    );

    if (initialTarget) {
      requestAnimationFrame(() => {
        scrollToSection(initialTarget, false);
      });
    }
  }

  /* =====================================
     2. ПОДСВЕТКА АКТИВНОГО РАЗДЕЛА
  ===================================== */

  const navLinks = nav
    ? [...nav.querySelectorAll('a[href^="#"]')]
    : [];

  const observedSections = navLinks
    .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
    .filter(Boolean);

  function setActiveLink(sectionId) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length) {
          setActiveLink(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: `-${getHeaderHeight() + 10}px 0px -55% 0px`,
        threshold: [0, 0.15, 0.3, 0.5, 0.7]
      }
    );

    observedSections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  /* =====================================
     3. МОБИЛЬНОЕ МЕНЮ
  ===================================== */

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");

      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Закрыть меню" : "Открыть меню"
      );
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu =
        nav.contains(event.target) || menuToggle.contains(event.target);

      if (!clickedInsideMenu && nav.classList.contains("open")) {
        closeMobileMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) {
        closeMobileMenu();
      }
    });
  }

  /* =====================================
     4. ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ
  ===================================== */

  const revealElements = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -45px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  /* =====================================
     5. СВЕЧЕНИЕ ЗА КУРСОРОМ
  ===================================== */

  const cursorGlow = document.querySelector(".cursor-glow");

  if (finePointer && cursorGlow) {
    let glowFrame = null;

    window.addEventListener(
      "mousemove",
      (event) => {
        if (glowFrame) cancelAnimationFrame(glowFrame);

        glowFrame = requestAnimationFrame(() => {
          cursorGlow.style.left = `${event.clientX}px`;
          cursorGlow.style.top = `${event.clientY}px`;
          cursorGlow.style.opacity = "1";
        });
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      cursorGlow.style.opacity = "0";
    });
  }

  /* =====================================
     6. КНОПКА НАВЕРХ
  ===================================== */

  if (backToTop) {
    let scrollFrame = null;

    window.addEventListener(
      "scroll",
      () => {
        if (scrollFrame) return;

        scrollFrame = requestAnimationFrame(() => {
          backToTop.classList.toggle("visible", window.scrollY > 500);
          scrollFrame = null;
        });
      },
      { passive: true }
    );

    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "instant" : "smooth"
      });

      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    });
  }

  /* =====================================
     7. МАГНИТНЫЕ КНОПКИ
  ===================================== */

  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();

        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        button.style.setProperty("--mag-x", `${x * 0.045}px`);
        button.style.setProperty("--mag-y", `${y * 0.06}px`);
      });

      button.addEventListener("mouseleave", () => {
        button.style.setProperty("--mag-x", "0px");
        button.style.setProperty("--mag-y", "0px");
      });
    });
  }

  /* =====================================
     8. ИНТЕРАКТИВНАЯ ТАКСА
  ===================================== */

  const dogButton = document.querySelector("#dogButton");
  const dogBubble = document.querySelector("#dogBubble");
  const dogWidget = document.querySelector("#dogWidget");

  const dogPhrases = [
    "Привет! Давай знакомиться! 🐾",
    "Ой, как приятно! ❤️",
    "Я тут главный по хорошему настроению!",
    "Гав! Как тебе мой хвост?",
    "А можно ещё немного внимания?",
    "Не забудь немного отдохнуть!",
    "Я наблюдаю за тобой 👀",
    "У тебя всё обязательно получится!",
    "Кажется, я тебе нравлюсь!",
    "Пойдём создавать что-нибудь красивое?"
  ];

  let phraseIndex = 0;
  let bubbleTimeout = null;
  let petTimeout = null;
  let hoverTimeout = null;

  function showDogMessage(message, duration = 3000) {
    if (!dogBubble) return;

    dogBubble.textContent = message;
    dogBubble.classList.add("show");

    clearTimeout(bubbleTimeout);

    bubbleTimeout = setTimeout(() => {
      dogBubble.classList.remove("show");
    }, duration);
  }

  function petDog() {
    if (!dogButton) return;

    phraseIndex = (phraseIndex + 1) % dogPhrases.length;

    showDogMessage(dogPhrases[phraseIndex], 3500);

    dogButton.classList.remove("is-petted");

    // Перезапускаем анимацию поглаживания
    void dogButton.offsetWidth;

    dogButton.classList.add("is-petted");

    clearTimeout(petTimeout);

    petTimeout = setTimeout(() => {
      dogButton.classList.remove("is-petted");
    }, 1600);
  }

  if (dogButton) {
    dogButton.addEventListener("click", petDog);

    dogButton.addEventListener("mouseenter", () => {
      clearTimeout(hoverTimeout);

      hoverTimeout = setTimeout(() => {
        showDogMessage("Ой! Ты меня заметила? 🐶", 2500);
      }, 250);
    });

    dogButton.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout);
    });

    // Первое приветствие после загрузки
    window.addEventListener("load", () => {
      setTimeout(() => {
        if (!dogButton.matches(":hover")) {
          showDogMessage("Привет! Давай знакомиться! 🐾", 3500);
        }
      }, 1300);
    });
  }

  /* =====================================
     9. ТАКСА СЛЕДИТ ЗА КУРСОРОМ
  ===================================== */

  if (finePointer && dogWidget) {
    let lookFrame = null;

    document.addEventListener(
      "mousemove",
      (event) => {
        if (lookFrame) cancelAnimationFrame(lookFrame);

        lookFrame = requestAnimationFrame(() => {
          const rect = dogWidget.getBoundingClientRect();

          const dogCenterX = rect.left + rect.width / 2;
          const dogCenterY = rect.top + rect.height / 2;

          const distanceX = event.clientX - dogCenterX;
          const distanceY = event.clientY - dogCenterY;

          const distance = Math.sqrt(
            distanceX * distanceX + distanceY * distanceY
          );

          // Если курсор далеко, собака смотрит прямо
          if (distance > 450) {
            dogWidget.style.setProperty("--dog-look", "0deg");
            return;
          }

          // Поворачиваем голову в сторону курсора
          const lookAngle = Math.max(
            -9,
            Math.min(9, distanceX / 35)
          );

          dogWidget.style.setProperty(
            "--dog-look",
            `${lookAngle}deg`
          );
        });
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      dogWidget.style.setProperty("--dog-look", "0deg");
    });
  }
});
// ===== Открытие фотографий достижений =====

const photoModal = document.getElementById("photoModal");
const modalImage = document.getElementById("modalImage");
const modalClose = document.querySelector(".photo-modal__close");
const modalOverlay = document.querySelector(".photo-modal__overlay");

// Открытие фотографии
function openPhoto(src) {
    modalImage.src = src;
    photoModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// Закрытие фотографии
function closePhoto() {
    photoModal.classList.remove("active");
    document.body.style.overflow = "";

    setTimeout(() => {
        modalImage.src = "";
    }, 350);
}

// Нажатие на карточки
document.querySelectorAll(".achievement-card[data-photo]").forEach(card => {
    card.addEventListener("click", () => {
        openPhoto(card.dataset.photo);
    });
});

// Кнопка закрытия и фон
modalClose.addEventListener("click", closePhoto);
modalOverlay.addEventListener("click", closePhoto);

// Закрытие клавишей Escape
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && photoModal.classList.contains("active")) {
        closePhoto();
    }
});