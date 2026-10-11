(() => {
  "use strict";

  const header = document.querySelector("#siteHeader");
  const nav = document.querySelector("#mainNav");
  const menuButton = document.querySelector("#menuBtn");

  const closeMenu = () => {
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  };

  menuButton?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open") ?? false;
    menuButton.setAttribute("aria-expanded", String(open));
  });

  nav?.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("open")) {
      closeMenu();
      menuButton?.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) return;
    if (nav?.classList.contains("open") && !header?.contains(event.target)) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1040) closeMenu();
  });

  const filterGroup = document.querySelector("#publicationFilters");
  const yearBlocks = [...document.querySelectorAll("[data-publication-year]")];
  const publications = [...document.querySelectorAll("[data-publication-topics]")];
  const topicButtons = [...document.querySelectorAll("[data-topic-filter]")];
  const topicStatus = document.querySelector("#topicFilterStatus");
  const topicLabel = document.querySelector("#activeTopicLabel");
  const clearTopicButton = document.querySelector("[data-clear-topic]");
  const emptyState = document.querySelector("#publicationEmpty");
  let selectedYear = "all";
  let selectedTopic = "all";

  const setYear = (year) => {
    selectedYear = year;
    filterGroup?.querySelectorAll("[data-filter-year]").forEach((item) => {
      const active = item.dataset.filterYear === year;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
  };

  const updatePublicationVisibility = () => {
    let visibleCount = 0;
    publications.forEach((publication) => {
      const yearBlock = publication.closest("[data-publication-year]");
      const matchesYear = selectedYear === "all" || yearBlock?.dataset.publicationYear === selectedYear;
      const topics = publication.dataset.publicationTopics?.split(" ") ?? [];
      const matchesTopic = selectedTopic === "all" || topics.includes(selectedTopic);
      publication.hidden = !(matchesYear && matchesTopic);
      if (!publication.hidden) visibleCount += 1;
    });

    yearBlocks.forEach((block) => {
      block.hidden = !block.querySelector("[data-publication-topics]:not([hidden])");
    });
    if (emptyState instanceof HTMLElement) emptyState.hidden = visibleCount > 0;
  };

  filterGroup?.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("[data-filter-year]");
    if (!(button instanceof HTMLButtonElement)) return;

    setYear(button.dataset.filterYear ?? "all");
    updatePublicationVisibility();
  });

  topicButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedTopic = button.dataset.topicFilter ?? "all";
      setYear("all");
      topicButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      if (topicLabel) topicLabel.textContent = button.dataset.topicLabel ?? "";
      if (topicStatus instanceof HTMLElement) topicStatus.hidden = false;
      updatePublicationVisibility();
      document.querySelector("#publications")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  clearTopicButton?.addEventListener("click", () => {
    selectedTopic = "all";
    topicButtons.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
    if (topicStatus instanceof HTMLElement) topicStatus.hidden = true;
    updatePublicationVisibility();
  });

  const navLinks = [...document.querySelectorAll("#mainNav [data-section]")];
  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.section ?? ""))
    .filter((section) => section !== null);

  const setActiveSection = (sectionId) => {
    navLinks.forEach((link) => {
      const active = link.dataset.section === sectionId;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  let framePending = false;
  const updateActiveSection = () => {
    framePending = false;
    if (sections.length === 0) return;

    const marker = (header?.offsetHeight ?? 0) + 28;
    let activeSection = sections[0];

    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) activeSection = section;
      else break;
    }

    const atPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atPageEnd) activeSection = sections[sections.length - 1];
    setActiveSection(activeSection.id);
  };

  const requestUpdate = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateActiveSection);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("hashchange", requestUpdate);
  requestUpdate();

  const gallery = document.querySelector("[data-hero-gallery]");
  if (gallery) {
    const slides = [...gallery.querySelectorAll(".hero-slide")];
    const dots = [...gallery.querySelectorAll(".hero-dots button")];
    const caption = gallery.querySelector("[data-hero-caption]");
    let current = 0;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle("is-active", active);
        if (active) {
          slide.loading = "eager";
          slide.removeAttribute("aria-hidden");
        } else {
          slide.setAttribute("aria-hidden", "true");
        }
      });
      dots.forEach((dot, i) => dot.toggleAttribute("aria-current", i === current));
      if (caption) caption.textContent = slides[current].dataset.caption ?? "";
      // Warm up the next photo so it is ready before the click.
      slides[(current + 1) % slides.length].loading = "eager";
    };

    gallery.querySelector(".hero-prev")?.addEventListener("click", () => showSlide(current - 1));
    gallery.querySelector(".hero-next")?.addEventListener("click", () => showSlide(current + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => showSlide(i)));

    gallery.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showSlide(current - 1);
      if (event.key === "ArrowRight") showSlide(current + 1);
    });

    let touchX = null;
    gallery.addEventListener("touchstart", (event) => { touchX = event.touches[0].clientX; }, { passive: true });
    gallery.addEventListener("touchend", (event) => {
      if (touchX === null) return;
      const delta = event.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 40) showSlide(current + (delta < 0 ? 1 : -1));
      touchX = null;
    });

    gallery.querySelectorAll("[hidden]").forEach((element) => element.removeAttribute("hidden"));
  }

  document.querySelectorAll(".avatar img").forEach((image) => {
    image.addEventListener("error", () => {
      image.closest(".avatar")?.classList.remove("has-photo");
      image.remove();
    });
  });
})();
