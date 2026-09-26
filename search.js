// Filter the claim list on /claims/ by text, register and class. The page works without it.
(function () {
  var q = document.getElementById("q"), reg = document.getElementById("reg"), cls = document.getElementById("cls");
  var count = document.getElementById("count");
  var items = Array.prototype.slice.call(document.querySelectorAll("li[data-text]"));
  var groups = Array.prototype.slice.call(document.querySelectorAll("[data-group]"));

  function apply() {
    var terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    var r = reg.value, c = cls.value, shown = 0;
    items.forEach(function (li) {
      var ok = (!r || li.dataset.reg === r) && (!c || li.dataset.cls === c) &&
        terms.every(function (t) { return li.dataset.text.indexOf(t) !== -1; });
      li.hidden = !ok;
      if (ok) shown++;
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector("li[data-text]:not([hidden])"); });
    count.textContent = shown === 1 ? "1 claim" : shown + " claims";
    var params = new URLSearchParams();
    if (q.value) params.set("q", q.value);
    if (r) params.set("register", r);
    if (c) params.set("class", c);
    history.replaceState(null, "", params.toString() ? "?" + params : location.pathname);
  }

  var p = new URLSearchParams(location.search);
  q.value = p.get("q") || "";
  reg.value = p.get("register") || "";
  cls.value = p.get("class") || "";
  [q, reg, cls].forEach(function (el) { el.addEventListener("input", apply); });
  apply();
})();
