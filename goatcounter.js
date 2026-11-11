/**
 * GoatCounter tracking for all portfolio pages.
 */
(function () {
  "use strict";

  var CODE = "raphaelsevillano";
  var SHOW_VISIT_COUNTER = true;

  if (!/^[a-z0-9-]+$/i.test(CODE)) return;

  var base = "https://" + CODE + ".goatcounter.com";

  // Load GoatCounter on every page
  var s = document.createElement("script");
  s.async = true;
  s.setAttribute("data-goatcounter", base + "/count");
  s.setAttribute("data-goatcounter-title", document.title || location.pathname);
  s.src = "https://gc.zgo.at/count.js";
  document.head.appendChild(s);

  // Track events
  function track(path, title) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({
          path: path,
          title: title,
          event: true
        });
      }
    } catch (e) {}
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a");

    if (link) {
      var href = link.getAttribute("href") || "";

      if (/\.pdf(\?|#|$)/i.test(href)) {
        if (link.hasAttribute("download")) {
          track("cv-download", "CV download");
        } else {
          track("cv-view", "CV view online");
        }
      } else if (href.indexOf("linkedin.com") !== -1) {
        track("click-linkedin", "LinkedIn click");
      } else if (href.indexOf("github.com") !== -1) {
        track("click-github", "GitHub click");
      } else if (href.indexOf("mailto:") === 0) {
        track("click-email", "Email click");
      }
    }

    var project = e.target.closest("[data-project-id]");

    if (project) {
      track(
        "project-" + project.getAttribute("data-project-id"),
        "Project details opened"
      );
    }
  });

  document.addEventListener("submit", function (e) {
    if (e.target && e.target.hasAttribute("data-contact-form")) {
      track("contact-form-sent", "Contact form sent");
    }
  });

  // Optional total visit counter
  if (SHOW_VISIT_COUNTER) {
    var wrap = document.querySelector(".site-footer .wrap");

    if (wrap && window.fetch) {
      fetch(base + "/counter/TOTAL.json")
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (d) {
          if (!d || d.count === undefined) return;

          var p = document.createElement("p");
          p.className = "visit-count";
          p.textContent = "Total visits: " + d.count;

          wrap.appendChild(p);
        })
        .catch(function () {});
    }
  }
})();
