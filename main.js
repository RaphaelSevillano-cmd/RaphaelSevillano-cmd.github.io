
(function () {
  "use strict"; 

  /* ---------- Dark mode (persisted in localStorage) ---------- */
  const root = document.documentElement;
  const THEME_KEY = "rs-portfolio-theme";

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme"); 
    }
  } 

  try {
    applyTheme(localStorage.getItem(THEME_KEY));
  } catch (e) {
    /* localStorage unavailable (e.g. private browsing) — fall back to system theme */
  }

  function initThemeToggle() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const current =
        root.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
    });
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    const menuBtn = document.querySelector("[data-menu-toggle]");
    const links = document.querySelector("[data-nav-links]");
    if (!menuBtn || !links) return;
    menuBtn.addEventListener("click", function () {
      const isOpen = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Project rendering ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function thumbHTML(p, basePath) {
    if (p.image) {
      return (
        '<div class="project-thumb has-img thumb-' + (p.imageFit === "contain" ? "contain" : "cover") + '"' + (p.imageBg ? ' style="background:' + esc(p.imageBg) + '"' : "") + ">" +
        '<img src="' + basePath + p.image + '" alt="' + esc(p.imageAlt || p.title) + '" loading="lazy" decoding="async" />' +
        "</div>"
      );
    }
    var initials = p.title.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join("");
    return '<div class="project-thumb" aria-hidden="true">' + esc(initials) + "</div>";
  }

  function projectCardHTML(p, basePath) {
    const techTags = p.technologies
      .map(function (t) {
        return '<span class="tag">' + t + "</span>";
      })
      .join("");
    const links = [];
    if (p.liveUrl) links.push('<a href="' + p.liveUrl + '" target="_blank" rel="noopener">View Project</a>');
    if (p.githubUrl) links.push('<a href="' + p.githubUrl + '" target="_blank" rel="noopener">Source Code</a>');
    links.push('<a href="' + basePath + p.detailUrl + '">Details →</a>');

    return (
      '<article class="card project-card" data-category="' +
      p.category +
      '" data-year="' +
      p.year +
      '" data-tech="' +
      p.technologies.join(",").toLowerCase() +
      '" data-search="' +
      (p.title + " " + p.description + " " + p.technologies.join(" ")).toLowerCase() +
      '">' +
      thumbHTML(p, basePath) +
      '<div class="project-meta"><span class="tag">' +
      p.category +
      '</span><span class="tag">' +
      p.year +
      '</span><span class="status">' +
      p.status +
      "</span></div>" +
      "<h3>" +
      p.title +
      "</h3>" +
      "<p>" +
      p.description +
      "</p>" +
      '<div class="project-meta">' +
      techTags +
      "</div>" +
      '<div class="project-links">' +
      links.join("") +
      "</div>" +
      "</article>"
    );
  }

  function renderProjects(container, list, basePath) {
    if (!list.length) {
      container.innerHTML = '<div class="empty-state">No projects match your search or filters.</div>';
      return;
    }
    container.innerHTML = list.map(function (p) {
      return projectCardHTML(p, basePath);
    }).join("");
  }

  function initProjectGrid() {
    const grid = document.querySelector("[data-project-grid]");
    if (!grid || typeof PROJECTS === "undefined") return;

    const basePath = grid.getAttribute("data-base-path") || "";
    const featuredOnly = grid.getAttribute("data-featured-only") === "true";
    const source = featuredOnly ? PROJECTS.filter(function (p) { return p.featured; }) : PROJECTS;

    renderProjects(grid, source, basePath);
    if (featuredOnly) return; // no filter UI on the homepage

    const searchInput = document.querySelector("[data-project-search]");
    const categorySelect = document.querySelector("[data-project-category]");
    const yearSelect = document.querySelector("[data-project-year]");
    const countEl = document.querySelector("[data-project-count]");

    // Populate category + year filters from the data itself
    if (categorySelect) {
      const cats = Array.from(new Set(source.map(function (p) { return p.category; }))).sort();
      cats.forEach(function (c) {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        categorySelect.appendChild(opt);
      });
    }
    if (yearSelect) {
      const years = Array.from(new Set(source.map(function (p) { return p.year; }))).sort().reverse();
      years.forEach(function (y) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      });
    }

    function applyFilters() {
      const q = (searchInput && searchInput.value || "").trim().toLowerCase();
      const cat = categorySelect && categorySelect.value;
      const yr = yearSelect && yearSelect.value;

      const filtered = source.filter(function (p) {
        const matchesQuery =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.technologies.join(" ").toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        const matchesCategory = !cat || cat === "all" || p.category === cat;
        const matchesYear = !yr || yr === "all" || p.year === yr;
        return matchesQuery && matchesCategory && matchesYear;
      });

      renderProjects(grid, filtered, basePath);
      if (countEl) countEl.textContent = filtered.length + " project" + (filtered.length === 1 ? "" : "s");
    }

    [searchInput, categorySelect, yearSelect].forEach(function (el) {
      if (el) { el.addEventListener("input", applyFilters); el.addEventListener("change", applyFilters); }
    });

    if (countEl) countEl.textContent = source.length + " projects";
  }

  /* ---------- Contact form (static-hosting friendly) ---------- */
  function initContactForm() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      // Honeypot spam check
      const honeypot = form.querySelector(".hp-field input");
      if (honeypot && honeypot.value) {
        e.preventDefault();
        return;
      }
      // If no real backend/Formspree endpoint has been configured yet,
      // fall back to opening the user's email client instead of failing silently.
      const action = form.getAttribute("action") || "";
      if (action.includes("YOUR-FORM-ID")) {
        e.preventDefault();
        const name = form.querySelector("#name") ? form.querySelector("#name").value : "";
        const email = form.querySelector("#email") ? form.querySelector("#email").value : "";
        const subject = form.querySelector("#subject") ? form.querySelector("#subject").value : "New portfolio message";
        const message = form.querySelector("#message") ? form.querySelector("#message").value : "";
        const body = encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message);
        window.location.href =
          "mailto:rasevillano@ccc.edu.ph?subject=" +
          encodeURIComponent(subject) +
          "&body=" +
          body;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initThemeToggle();
    initMobileNav();
    initProjectGrid();
    initContactForm();
  });
})();
