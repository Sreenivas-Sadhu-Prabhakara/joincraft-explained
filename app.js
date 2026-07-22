/* joincraft-explained — tiny progressive-enhancement layer.
   No network, no inline handlers (CSP: default-src 'self').
   Everything here is decorative: the page is fully legible with JS off,
   and all motion respects prefers-reduced-motion. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Scroll-progress rail.
  var fill = document.getElementById("scrollFill");
  if (fill) {
    var ticking = false;
    var updateRail = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max : 0;
      fill.style.width = (Math.max(0, Math.min(1, pct)) * 100).toFixed(2) + "%";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(updateRail); }
    }, { passive: true });
    window.addEventListener("resize", updateRail, { passive: true });
    updateRail();
  }

  // 2. Reveal sections on scroll. If reduced motion OR no IntersectionObserver,
  //    reveal everything immediately (the CSS already keeps content visible).
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var showAll = function () { reveals.forEach(function (el) { el.classList.add("is-in"); }); };

  if (reduce || typeof IntersectionObserver === "undefined") {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });

    // Safety net: if something never fires (e.g. very tall viewport), reveal after a beat.
    window.setTimeout(function () {
      reveals.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) { el.classList.add("is-in"); }
      });
    }, 1200);
  }
})();
