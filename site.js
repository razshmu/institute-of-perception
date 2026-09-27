// Comparison slider and step-through diagrams. Every page works without this file.
(function () {
  document.querySelectorAll(".compare").forEach(function (c) {
    var r = c.querySelector("input[type=range]");
    if (!r) return;
    var set = function () { c.style.setProperty("--pos", r.value + "%"); };
    r.addEventListener("input", set);
    set();
  });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var diagram = document.querySelector(".access-path[data-stepper]");
  var steps = document.querySelectorAll("[data-show-step]");
  if (!diagram || !steps.length || reduce || !("IntersectionObserver" in window)) return;

  var show = function (n) {
    diagram.classList.add("stepping");
    diagram.querySelectorAll(".ap-step").forEach(function (g) {
      g.classList.toggle("on", +g.dataset.step <= n);
    });
    steps.forEach(function (s) { s.classList.toggle("active", +s.dataset.showStep === n); });
  };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) show(+e.target.dataset.showStep); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  steps.forEach(function (s) { io.observe(s); });
  steps.forEach(function (s) {
    s.addEventListener("focusin", function () { show(+s.dataset.showStep); });
  });
})();

// Claim preview cards: hover or focus a claim link to see the claim and what would refute it.
(function () {
  var links = document.querySelectorAll("a.cref");
  if (!links.length || !window.fetch) return;
  var base = document.documentElement.getAttribute("data-base") || "";
  var data = null, loading = null;
  var tip = document.createElement("div");
  tip.className = "claim-tip"; tip.id = "claim-tip"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
  document.body.appendChild(tip);
  var load = function () {
    if (!loading) loading = fetch(base + "/claims.json").then(function (r) { return r.json(); })
      .then(function (j) { data = {}; j.claims.forEach(function (c) { data[c.id] = c; }); }).catch(function () {});
    return loading;
  };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
  var hideT = null;
  var show = function (a) {
    var m = a.getAttribute("href").match(/claims\/([\d.]+)\//);
    if (!m) return;
    load().then(function () {
      var c = data && data[m[1]];
      if (!c) return;
      var test = c.falsifier ? "<p class='k f'>Falsifier</p><p>" + esc(c.falsifier) + "</p>"
        : (c.counts_against ? "<p class='k ca'>Counts against</p><p>" + esc(c.counts_against) + "</p>" : "");
      tip.innerHTML = "<p class='k'>Claim " + c.id + " · " + esc(c.class) + "</p><p class='t'>" + esc(c.title) + "</p><p>" +
        esc(c.claim) + "</p>" + test;
      tip.hidden = false;
      var r = a.getBoundingClientRect(), w = Math.min(380, window.innerWidth - 24);
      tip.style.width = w + "px";
      var left = Math.max(12, Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - w - 12));
      var top = window.scrollY + r.bottom + 8;
      if (r.bottom + tip.offsetHeight + 16 > window.innerHeight) top = window.scrollY + r.top - tip.offsetHeight - 8;
      tip.style.left = left + "px"; tip.style.top = top + "px";
      a.setAttribute("aria-describedby", "claim-tip");
    });
  };
  var hide = function (a) { hideT = setTimeout(function () { tip.hidden = true; if (a) a.removeAttribute("aria-describedby"); }, 120); };
  links.forEach(function (a) {
    a.addEventListener("mouseenter", function () { clearTimeout(hideT); show(a); });
    a.addEventListener("mouseleave", function () { hide(a); });
    a.addEventListener("focus", function () { clearTimeout(hideT); show(a); });
    a.addEventListener("blur", function () { hide(a); });
  });
  tip.addEventListener("mouseenter", function () { clearTimeout(hideT); });
  tip.addEventListener("mouseleave", function () { hide(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") tip.hidden = true; });
})();

// Organism view toggle: remembers the reader's choice.
(function () {
  var btn = document.querySelector(".vision-toggle");
  var key = "iop-human-view";
  var apply = function (human) {
    document.body.classList.toggle("as-human", human);
    if (btn) {
      btn.setAttribute("aria-pressed", human ? "true" : "false");
      btn.textContent = human ? btn.dataset.animal : btn.dataset.human;
    }
  };
  var saved = false;
  try { saved = localStorage.getItem(key) === "1"; } catch (e) {}
  apply(saved);
  if (!btn) return;
  btn.addEventListener("click", function () {
    var human = !document.body.classList.contains("as-human");
    apply(human);
    try { localStorage.setItem(key, human ? "1" : "0"); } catch (e) {}
  });
})();

// Open a collapsed claim when the page is reached through its anchor (#c1.2).
(function () {
  function openTarget() {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    var d = el && el.querySelector("details");
    if (d) { d.open = true; el.scrollIntoView(); }
  }
  window.addEventListener("hashchange", openTarget);
  document.addEventListener("DOMContentLoaded", openTarget);
})();
