
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
    links.push('<button type="button" class="link-btn" data-project-id="' + esc(p.id) + '">Details →</button>');

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

    var lastKey = null;
    function applyFilters() {
      const q = (searchInput && searchInput.value || "").trim().toLowerCase();
      const cat = categorySelect && categorySelect.value;
      const yr = yearSelect && yearSelect.value;

      const key = q + "|" + cat + "|" + yr;
      if (key === lastKey) return;
      lastKey = key;

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


  /* ---------- Project details popup ---------- */
  function detailHTML(p, basePath) {
    var shots = (p.screenshots || []).map(function (s) {
      return '<figure class="detail-figure"><img src="' + basePath + esc(s.src) + '" alt="' + esc(s.alt || p.title) + '" loading="lazy" decoding="async" /></figure>';
    }).join("");
    var links = "";
    if (p.liveUrl) links += '<a class="btn btn-primary" href="' + esc(p.liveUrl) + '" target="_blank" rel="noopener">Live Site</a> ';
    if (p.githubUrl) links += '<a class="btn btn-outline" href="' + esc(p.githubUrl) + '" target="_blank" rel="noopener">GitHub</a>';
    return '<h2 id="project-dialog-title">' + esc(p.title) + "</h2>" +
      '<div class="project-meta"><span class="tag">' + esc(p.category) + '</span><span class="tag">' + esc(p.year) +
      '</span><span class="status">' + esc(p.status) + "</span></div>" +
      '<div class="detail-grid mt-2"><div>' +
      '<div class="detail-section" style="margin-top:0"><h3>Overview</h3><p>' + esc(p.description) + "</p></div>" +
      '<div class="detail-section"><h3>Problem</h3><p>' + esc(p.problem) + "</p></div>" +
      '<div class="detail-section"><h3>Solution</h3><p>' + esc(p.solution) + "</p></div>" +
      '<div class="detail-section"><h3>Features</h3><ul>' + p.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>" +
      (links ? '<div class="detail-section"><h3>Links</h3><div class="hero-actions">' + links + "</div></div>" : "") +
      "</div><aside>" +
      (shots ? '<div class="detail-section" style="margin-top:0"><h3>Screenshots</h3>' + shots + "</div>" : "") +
      '<div class="card"><dl class="info-list">' +
      "<div><dt>My role</dt><dd>" + esc(p.role) + "</dd></div>" +
      "<div><dt>Year</dt><dd>" + esc(p.year) + "</dd></div>" +
      "<div><dt>Status</dt><dd>" + esc(p.status) + "</dd></div></dl>" +
      '<h3 style="margin-top:1.25rem;font-size:1rem">Technologies used</h3>' +
      '<div class="project-meta">' + p.technologies.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div></div>" +
      "</aside></div>";
  }

  function initProjectDialog() {
    var dialog = document.getElementById("project-dialog");
    var body = document.getElementById("project-dialog-body");
    if (!dialog || !body || typeof PROJECTS === "undefined" || typeof dialog.showModal !== "function") return;
    var grid = document.querySelector("[data-project-grid]");
    var basePath = (grid && grid.getAttribute("data-base-path")) || "";

    function openProject(id) {
      var p = PROJECTS.filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      body.innerHTML = detailHTML(p, basePath);
      if (!dialog.open) dialog.showModal();
      try { history.replaceState(null, "", "#project-" + id); } catch (e) {}
    }

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-project-id]");
      if (btn) openProject(btn.getAttribute("data-project-id"));
    });
    dialog.querySelector("[data-close-dialog]").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", function () {
      if (location.hash.indexOf("#project-") === 0) {
        try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      }
    });
    if (location.hash.indexOf("#project-") === 0) openProject(location.hash.slice(9));
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
    initProjectDialog();
    initContactForm();
  });
})();
