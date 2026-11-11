(function () {
  "use strict";

  /* ================================================================
   * <trois-plans-widget> — atelier interactif (4e, ch. 8, § 6) :
   * positions de trois plans. Scène 3D qu'on fait tourner (glisser ou
   * boutons), trois plans dessinés comme des rectangles translucides et
   * leurs droites d'intersection en trait épais. Cas prêts :
   *  - « un point commun » : le coin d'une pièce (sol + deux murs) ;
   *  - « trois droites parallèles » : les trois faces d'un prisme
   *    triangulaire (une barre de Toblerone) ;
   *  - « une droite commune » : les pages d'un livre ouvert ;
   *  - contraste : deux plans parallèles coupés par un troisième.
   * Projection orthogonale calculée à la main, rendu SVG, aucune
   * bibliothèque. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var L = 300, H = 280, RAYON = 122;
  var YAW0 = -30, PITCH0 = 22;
  var TONS = ["p1", "p2", "p3"];
  var NOMS = ["α", "β", "γ"];

  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function norme(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }

  // Rectangle : origine o, deux côtés u et v (4 sommets o, o+u, o+u+v, o+v)
  function rect(o, u, v) { return [o, add(o, u), add(add(o, u), v), add(o, v)]; }

  // Plan contenant la droite (axe y) et la direction (cos a ; 0 ; sin a) : page de livre
  function page(aDeg, longueur, profondeur) {
    var a = aDeg * Math.PI / 180;
    var d = [Math.cos(a) * longueur, 0, Math.sin(a) * longueur];
    return rect([0, 0, 0], d, [0, profondeur, 0]);
  }
  // Plan contenant le segment [T1 T2] du plan (x, z) et la direction y, prolongé
  function bande(t1, t2, profondeur, debord) {
    var u = [t2[0] - t1[0], 0, t2[1] - t1[1]];
    var o = [t1[0] - u[0] * debord, 0, t1[1] - u[2] * debord];
    return rect(o, mul(u, 1 + 2 * debord), [0, profondeur, 0]);
  }

  var T1 = [0, 0], T2 = [2, 0], T3 = [1, 1.6];
  var CAS = {
    coin: {
      titre: "Un point commun",
      plans: [
        rect([0, 0, 0], [2, 0, 0], [0, 2, 0]),
        rect([0, 0, 0], [0, 2, 0], [0, 0, 1.8]),
        rect([0, 2, 0], [2, 0, 0], [0, 0, 1.8])
      ],
      droites: [[[0, 0, 0], [0, 2, 0]], [[0, 2, 0], [2, 2, 0]], [[0, 2, 0], [0, 2, 1.8]]],
      points: [{ p: [0, 2, 0], nom: "O" }],
      texte:
        "Le sol (α) et deux murs (β, γ) : chaque paire de plans se coupe suivant une droite. " +
        "Les trois droites d'intersection passent par un même point O, le coin de la pièce. " +
        "C'est le cas le plus courant : trois plans sécants deux à deux, avec un seul point commun."
    },
    prisme: {
      titre: "Trois droites parallèles",
      plans: [bande(T1, T2, 2.4, 0.25), bande(T2, T3, 2.4, 0.25), bande(T3, T1, 2.4, 0.25)],
      droites: [
        [[T1[0], 0, T1[1]], [T1[0], 2.4, T1[1]]],
        [[T2[0], 0, T2[1]], [T2[0], 2.4, T2[1]]],
        [[T3[0], 0, T3[1]], [T3[0], 2.4, T3[1]]]
      ],
      points: [],
      texte:
        "Les trois faces latérales d'un prisme triangulaire, comme une barre de Toblerone : " +
        "les plans sont sécants deux à deux, mais les trois droites d'intersection (les arêtes " +
        "du prisme) sont parallèles entre elles. Aucun point n'est commun aux trois plans."
    },
    livre: {
      titre: "Une droite commune",
      plans: [page(15, 1.7, 2.4), page(90, 1.7, 2.4), page(165, 1.7, 2.4)],
      droites: [[[0, 0, 0], [0, 2.4, 0]]],
      points: [],
      texte:
        "Les pages d'un livre ouvert : les trois plans passent tous par la même droite, la " +
        "reliure. Les trois « droites d'intersection » sont confondues en une seule droite " +
        "commune aux trois plans."
    },
    paralleles: {
      titre: "Deux plans parallèles et un sécant",
      plans: [
        rect([0, 0, 0], [2.2, 0, 0], [0, 2.2, 0]),
        rect([0, 0, 1.3], [2.2, 0, 0], [0, 2.2, 0]),
        bande([0.15, -0.25], [1.75, 1.55], 2.2, 0)
      ],
      droites: [[[0.3722, 0, 0], [0.3722, 2.2, 0]], [[1.5278, 0, 1.3], [1.5278, 2.2, 1.3]]],
      points: [],
      texte:
        "α et β sont parallèles : ils n'ont aucun point commun. Le plan γ les coupe tous les " +
        "deux, suivant deux droites parallèles (propriété de la section 5). Il n'y a que deux " +
        "droites d'intersection : ce n'est pas le cas de trois plans sécants deux à deux."
    }
  };
  var ORDRE = ["coin", "prisme", "livre", "paralleles"];

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '[hidden]{display:none !important;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:8px;}' +
    'svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);touch-action:pan-y;cursor:grab;}' +
    'svg.glisse{cursor:grabbing;}' +
    '.p1{fill:var(--accent,#b65c1f);stroke:var(--accent,#b65c1f);}' +
    '.p2{fill:var(--good,#2f7a4f);stroke:var(--good,#2f7a4f);}' +
    '.p3{fill:var(--plan,#5b4ea3);stroke:var(--plan,#5b4ea3);}' +
    '.plan{fill-opacity:0.16;stroke-width:1.4;stroke-opacity:0.8;stroke-linejoin:round;}' +
    '.inter{stroke:var(--ink,#182430);stroke-width:3.4;stroke-linecap:round;}' +
    '.pt{fill:var(--ink,#182430);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etiq{font-size:15px;font-weight:700;paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq.p1{fill:var(--accent-ink,#7a3212);stroke:var(--surface-2,#f7f9fb);}' +
    '.etiq.p2{fill:var(--good,#2f7a4f);stroke:var(--surface-2,#f7f9fb);}' +
    '.etiq.p3{fill:var(--plan,#5b4ea3);stroke:var(--surface-2,#f7f9fb);}' +
    '.etiq-noir{fill:var(--ink,#182430);}' +
    '.lecture{margin:0 auto 12px;max-width:620px;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.6;font-size:0.95rem;overflow-wrap:anywhere;}' +
    '.verdict{font-weight:700;font-size:1.05rem;color:var(--accent-ink,#7a3212);}' +
    '.note{font-size:0.85rem;color:var(--ink-soft,#51626f);margin-top:6px;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;max-width:620px;margin:0 auto;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;width:100%;text-align:center;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" role="img" aria-label="Trois plans dans l\'espace et leurs droites d\'intersection"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Choisis une situation</span>' +
    '<button class="btn" type="button" data-cas="coin">Un point commun</button>' +
    '<button class="btn" type="button" data-cas="prisme">Trois droites parallèles</button>' +
    '<button class="btn" type="button" data-cas="livre">Une droite commune</button>' +
    '<button class="btn" type="button" data-cas="paralleles">Deux plans parallèles + un sécant</button></div>' +
    '<div class="rangee"><span class="libelle">Tourner la scène (ou glisser sur la figure)</span>' +
    '<button class="btn" type="button" data-yaw="15" aria-label="Tourner vers la gauche">↺</button>' +
    '<button class="btn" type="button" data-yaw="-15" aria-label="Tourner vers la droite">↻</button>' +
    '<button class="btn" type="button" data-pitch="15" aria-label="Voir davantage le dessus">↑</button>' +
    '<button class="btn" type="button" data-pitch="-15" aria-label="Voir davantage le dessous">↓</button>' +
    '<button class="btn" type="button" id="depart">Vue de départ</button></div>' +
    '</div>';

  class TroisPlansWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = { cas: "coin", yaw: YAW0, pitch: PITCH0 };
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-cas]"), function (b) {
        ecoute(b, "click", function () { self._etat.cas = b.getAttribute("data-cas"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-yaw],[data-pitch]"), function (b) {
        ecoute(b, "click", function () {
          self._etat.yaw = self._borneYaw(self._etat.yaw + Number(b.getAttribute("data-yaw") || 0));
          self._etat.pitch = self._bornePitch(self._etat.pitch + Number(b.getAttribute("data-pitch") || 0));
          self._rendre();
        });
      });
      ecoute(sh.getElementById("depart"), "click", function () { self._etat.yaw = YAW0; self._etat.pitch = PITCH0; self._rendre(); });
      var drag = null;
      ecoute(this._svg, "pointerdown", function (ev) {
        drag = { x: ev.clientX, y: ev.clientY, id: ev.pointerId };
        try { self._svg.setPointerCapture(ev.pointerId); } catch (e) { /* rien */ }
        self._svg.classList.add("glisse");
      });
      ecoute(this._svg, "pointermove", function (ev) {
        if (!drag || ev.pointerId !== drag.id) return;
        var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) < 2) return;
        drag.x = ev.clientX; drag.y = ev.clientY;
        self._etat.yaw = self._borneYaw(self._etat.yaw - dx * 0.6);
        self._etat.pitch = self._bornePitch(self._etat.pitch + dy * 0.6);
        self._rendre();
      });
      function fin() { drag = null; self._svg.classList.remove("glisse"); }
      ecoute(this._svg, "pointerup", fin);
      ecoute(this._svg, "pointercancel", fin);
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (x) { x[0].removeEventListener(x[1], x[2]); });
      this._ecouteurs = [];
    }

    _borneYaw(v) { return Math.max(-150, Math.min(150, v)); }
    _bornePitch(v) { return Math.max(-10, Math.min(70, v)); }

    _rot(v) {
      var a = this._etat.yaw * Math.PI / 180, b = this._etat.pitch * Math.PI / 180;
      var x1 = v[0] * Math.cos(a) - v[1] * Math.sin(a);
      var y1 = v[0] * Math.sin(a) + v[1] * Math.cos(a);
      var z1 = v[2];
      return [x1, y1 * Math.cos(b) - z1 * Math.sin(b), y1 * Math.sin(b) + z1 * Math.cos(b)];
    }

    _rendre() {
      var self = this, svg = this._svg, cas = CAS[this._etat.cas];
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      // Centre et échelle FIXES pour la situation (indépendants de la rotation)
      var tous = [];
      cas.plans.forEach(function (r) { tous = tous.concat(r); });
      var mini = [1e9, 1e9, 1e9], maxi = [-1e9, -1e9, -1e9];
      tous.forEach(function (p) { for (var i = 0; i < 3; i++) { mini[i] = Math.min(mini[i], p[i]); maxi[i] = Math.max(maxi[i], p[i]); } });
      var c = mul(add(mini, maxi), 0.5);
      var rmax = 0;
      tous.forEach(function (p) { rmax = Math.max(rmax, norme(sub(p, c))); });
      var ech = RAYON / rmax;
      function proj(p) {
        var r = self._rot(sub(p, c));
        return { x: L / 2 + ech * r[0], y: H / 2 - ech * r[2], prof: r[1] };
      }
      // Plans : du plus lointain au plus proche (peintre)
      var ordre = cas.plans.map(function (r, i) {
        var pr = r.map(proj);
        return { i: i, pr: pr, prof: pr.reduce(function (s, q) { return s + q.prof; }, 0) / pr.length };
      });
      ordre.sort(function (a, b) { return b.prof - a.prof; });
      ordre.forEach(function (o) {
        el("polygon", { points: o.pr.map(function (q) { return q.x.toFixed(2) + "," + q.y.toFixed(2); }).join(" "), "class": "plan " + TONS[o.i] }, svg);
      });
      cas.droites.forEach(function (d) {
        var a = proj(d[0]), b = proj(d[1]);
        el("line", { x1: a.x.toFixed(2), y1: a.y.toFixed(2), x2: b.x.toFixed(2), y2: b.y.toFixed(2), "class": "inter" }, svg);
      });
      cas.points.forEach(function (p) {
        var q = proj(p.p);
        el("circle", { cx: q.x.toFixed(2), cy: q.y.toFixed(2), r: 5, "class": "pt" }, svg);
        var t = el("text", { x: (q.x + 9).toFixed(1), y: (q.y - 8).toFixed(1), "class": "etiq etiq-noir" }, svg);
        t.textContent = p.nom;
      });
      // Étiquettes des plans : au sommet projeté le plus éloigné du centre de l'image
      cas.plans.forEach(function (r, i) {
        var pr = r.map(proj), best = null, bd = -1;
        // milieu des deux sommets les plus « extérieurs » pour éviter les coins confondus
        pr.forEach(function (q) { var dd = Math.pow(q.x - L / 2, 2) + Math.pow(q.y - H / 2, 2); if (dd > bd) { bd = dd; best = q; } });
        var dx = best.x - L / 2, dy = best.y - H / 2, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var x = best.x - dx / l * 16, y = best.y - dy / l * 16 + 5;
        x = Math.max(12, Math.min(L - 12, x)); y = Math.max(16, Math.min(H - 6, y));
        var t = el("text", { x: x.toFixed(1), y: y.toFixed(1), "class": "etiq " + TONS[i], "text-anchor": "middle" }, svg);
        t.textContent = NOMS[i];
      });
      this._lecture.innerHTML = '<div class="carte"><div class="verdict">' + cas.titre + '</div><div>' + cas.texte + '</div>' +
        '<div class="note">Les plans sont infinis : seul un morceau rectangulaire de chacun est dessiné. Les droites d\'intersection sont en noir épais.</div></div>';
      var sh = this.shadowRoot, e = this._etat;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-cas]"), function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-cas") === e.cas));
      });
      sh.getElementById("depart").setAttribute("aria-pressed", String(e.yaw === YAW0 && e.pitch === PITCH0));
    }
  }

  if (!customElements.get("trois-plans-widget")) customElements.define("trois-plans-widget", TroisPlansWidget);
})();
