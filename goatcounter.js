/**
 * GoatCounter for the portfolio: simple, privacy-friendly visit counting.
 * No cookies and no personal data, so no consent banner is needed.
 *
 * SETUP: replace YOUR-CODE below with your GoatCounter code.
 * If you signed up as "raphael", your dashboard is raphael.goatcounter.com,
 * so the code is: raphael
 * Until you replace it, this file does nothing and the site works normally.
 */
(function () {
  "use strict";

  var CODE = "raphaelsevillano";
  var SHOW_VISIT_COUNTER = true;   // show "Total visits" in the footer (false to hide)

  if (CODE === "YOUR-CODE" || !/^[a-z0-9-]+$/i.test(CODE)) return;

  var base = "https://" + CODE + ".goatcounter.com";

  // 1) Load GoatCounter: it counts the page view automatically.
  var s = document.createElement("script");
  s.async = true;
  s.setAttribute("data-goatcounter", base + "/count");
  s.src = "https://gc.zgo.at/count.js";
  document.head.appendChild(s);

  // 2) Count clicks as events (CV, social links, projects, contact form).
  function track(path, title) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: path, title: title, event: true });
      }
    } catch (e) {}
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a");
    if (link) {
      var href = link.getAttribute("href") || "";
      if (/\.pdf(\?|#|$)/i.test(href)) {
        if (link.hasAttribute("download")) track("cv-download", "CV download");
        else track("cv-view", "CV view online");
      } else if (href.indexOf("linkedin.com") !== -1) track("click-linkedin", "LinkedIn click");
      else if (href.indexOf("github.com") !== -1) track("click-github", "GitHub click");
      else if (href.indexOf("mailto:") === 0) track("click-email", "Email click");
    }
    var project = e.target.closest("[data-project-id]");
    if (project) track("project-" + project.getAttribute("data-project-id"), "Project details opened");
  });

  document.addEventListener("submit", function (e) {
    if (e.target && e.target.hasAttribute("data-contact-form")) track("contact-form-sent", "Contact form sent");
  });

  // 3) Optional visit counter in the footer
  //    Needs GoatCounter -> Settings -> "Allow adding visitor counts on your website" turned on.
  //    If it is off, nothing is shown (no error).
  if (SHOW_VISIT_COUNTER) {
    var wrap = document.querySelector(".site-footer .wrap");
    if (wrap && window.fetch) {
      fetch(base + "/counter/TOTAL.json")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || d.count === undefined) return;
          var style = document.createElement("style");
          style.textContent = ".visit-count{font-size:.8rem;color:var(--text-dim);margin:.4rem 0 0}";
          document.head.appendChild(style);
          var p = document.createElement("p");
          p.className = "visit-count";
          p.textContent = "Total visits: " + d.count;
          wrap.appendChild(p);
        })
        .catch(function () {});
    }
  }
})();
