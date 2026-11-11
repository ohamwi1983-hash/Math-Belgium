(function () {
  "use strict";

  /* ================================================================
   * <cavaliere-reglage-widget> — atelier interactif (4e, ch. 8, § 1) :
   * un cube (4 cm) ou un pavé (6 × 4 × 4 cm) dessiné en perspective
   * cavalière. On règle l'angle de fuite α (boutons 30°, 45°, 60° ou
   * curseur) et le coefficient de réduction k des fuyantes (boutons 0,5,
   * 0,7, 1 ou curseur). Arêtes cachées en pointillés, faces avant et
   * arrière en vraie grandeur, faces de dessus et de côté en
   * parallélogrammes. Longueur dessinée d'une arête fuyante comparée à la
   * vraie longueur. Défaut : cube, α = 45°, k = 0,5.
   * Fenêtre FIXE (pire cas : pavé, k = 1, α extrême). Web Component.
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var CM = 26;              // pixels par cm
  var MARGE = 30;
  var LX_MAX = 6, PROF_MAX = 4, LZ = 4;
  var LARG = Math.round((LX_MAX + PROF_MAX) * CM + 2 * MARGE);
  var HAUT = Math.round((LZ + PROF_MAX) * CM + 2 * MARGE);
  var ALPHA_MIN = 15, ALPHA_MAX = 75, K_MIN = 0.3, K_MAX = 1;

  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fmt(x, d) {
    var f = Math.pow(10, d), r = Math.round(x * f) / f;
    var s = r.toFixed(d).replace(/0+$/, "").replace(/\.$/, "");
    return moins(s.replace(".", ","));
  }
  function exact(x, d) { var f = Math.pow(10, d); return Math.abs(Math.round(x * f) / f - x) < 1e-9; }

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
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin:0 0 10px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.face-avant{fill:var(--accent,#b65c1f);fill-opacity:0.10;}' +
    '.face-oblique{fill:var(--plan,#5b4ea3);fill-opacity:0.10;}' +
    '.arete{stroke:var(--ink,#182430);stroke-width:2;fill:none;stroke-linejoin:round;}' +
    '.arete-cachee{stroke:var(--ink-soft,#51626f);stroke-width:1.5;stroke-dasharray:6 5;fill:none;}' +
    '.fuyante{stroke:var(--good,#2f7a4f);stroke-width:3.4;stroke-linecap:round;}' +
    '.arc{stroke:var(--accent,#b65c1f);stroke-width:1.6;fill:none;}' +
    '.repere{stroke:var(--ink-soft,#51626f);stroke-width:1;stroke-dasharray:3 4;}' +
    '.pt{fill:var(--ink,#182430);}' +
    '.etiq{font-size:14px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-a{fill:var(--accent,#b65c1f);font-size:13px;}' +
    '.etiq-f{fill:var(--good,#2f7a4f);font-size:13px;}' +
    '.libelle{font-size:0.9rem;font-weight:600;color:var(--ink-soft,#51626f);}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.curseur{display:flex;align-items:center;gap:8px;width:100%;max-width:420px;margin:0 auto 10px;}' +
    '.curseur label{min-width:5.5em;}' +
    '.curseur input{flex:1 1 auto;min-width:0;height:44px;margin:0;accent-color:var(--accent,#b65c1f);}' +
    '.curseur output{min-width:3.2em;text-align:right;font-weight:700;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;margin:0 auto 10px;max-width:620px;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.alerte{border-color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dede);}' +
    '.ok{border-color:var(--good,#2f7a4f);background:var(--good-soft,#dcefe2);}' +
    '.mesure{font-variant-numeric:tabular-nums;}' +
    '.bas{display:flex;justify-content:center;}' +
    '</style>' +
    '<div class="rangee" role="group" aria-label="Solide"><span class="libelle">Solide :</span>' +
    '<button class="btn" type="button" data-solide="cube" aria-pressed="true">Cube 4 cm</button>' +
    '<button class="btn" type="button" data-solide="pave" aria-pressed="false">Pavé 6 × 4 × 4 cm</button></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" role="img" aria-label="Solide dessiné en perspective cavalière"></svg></div>' +
    '<div class="rangee" role="group" aria-label="Angle de fuite"><span class="libelle">Angle de fuite :</span>' +
    '<button class="btn" type="button" data-alpha="30">30°</button>' +
    '<button class="btn" type="button" data-alpha="45">45°</button>' +
    '<button class="btn" type="button" data-alpha="60">60°</button></div>' +
    '<div class="curseur"><label class="libelle" for="alpha">Angle α</label><input id="alpha" type="range" min="' + ALPHA_MIN + '" max="' + ALPHA_MAX + '" step="1" value="45"><output id="alpha-val"></output></div>' +
    '<div class="rangee" role="group" aria-label="Coefficient de réduction"><span class="libelle">Réduction :</span>' +
    '<button class="btn" type="button" data-k="0.5">0,5</button>' +
    '<button class="btn" type="button" data-k="0.7">0,7</button>' +
    '<button class="btn" type="button" data-k="1">1</button></div>' +
    '<div class="curseur"><label class="libelle" for="k">Coefficient k</label><input id="k" type="range" min="' + K_MIN + '" max="' + K_MAX + '" step="0.05" value="0.5"><output id="k-val"></output></div>' +
    '<div id="infos" aria-live="polite"></div>' +
    '<div class="bas"><button class="btn btn-reset" id="reset" type="button">Réinitialiser</button></div>';

  class CavaliereReglageWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._svg = sh.getElementById("svg");
      this._defauts();
    }

    _defauts() { this._solide = "cube"; this._alpha = 45; this._k = 0.5; }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, sh = this._sh;
      sh.querySelectorAll("[data-solide]").forEach(function (b) {
        b.addEventListener("click", function () { self._solide = b.getAttribute("data-solide"); self._rendre(); });
      });
      sh.querySelectorAll("[data-alpha]").forEach(function (b) {
        b.addEventListener("click", function () { self._alpha = Number(b.getAttribute("data-alpha")); self._rendre(); });
      });
      sh.querySelectorAll("[data-k]").forEach(function (b) {
        b.addEventListener("click", function () { self._k = Number(b.getAttribute("data-k")); self._rendre(); });
      });
      sh.getElementById("alpha").addEventListener("input", function (e) { self._alpha = Number(e.target.value); self._rendre(); });
      sh.getElementById("k").addEventListener("input", function (e) { self._k = Math.round(Number(e.target.value) * 100) / 100; self._rendre(); });
      sh.getElementById("reset").addEventListener("click", function () { self._defauts(); self._rendre(); });
      this._rendre();
    }

    _rendre() {
      var sh = this._sh, svg = this._svg;
      var lx = this._solide === "cube" ? 4 : 6, ly = 4, lz = 4;
      var a = this._alpha * Math.PI / 180, k = this._k;
      var dx = k * ly * Math.cos(a), dy = k * ly * Math.sin(a); // décalage des fuyantes (cm)
      // origine : coin avant-bas-gauche, centré dans la fenêtre fixe
      var largeurDessin = (lx + dx) * CM, hauteurDessin = (lz + dy) * CM;
      var ox = (LARG - largeurDessin) / 2, oy = HAUT - (HAUT - hauteurDessin) / 2;
      var P = function (x, y, z) { return { x: ox + (x + k * y * Math.cos(a)) * CM, y: oy - (z + k * y * Math.sin(a)) * CM }; };
      var S = {
        A: P(0, 0, 0), B: P(lx, 0, 0), C: P(lx, ly, 0), D: P(0, ly, 0),
        E: P(0, 0, lz), F: P(lx, 0, lz), G: P(lx, ly, lz), H: P(0, ly, lz)
      };
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var poly = function (noms, cls) { el("polygon", { points: noms.map(function (n) { return S[n].x.toFixed(1) + "," + S[n].y.toFixed(1); }).join(" "), "class": cls }, svg); };
      var seg = function (m, n, cls) { el("line", { x1: S[m].x.toFixed(1), y1: S[m].y.toFixed(1), x2: S[n].x.toFixed(1), y2: S[n].y.toFixed(1), "class": cls }, svg); };
      // faces visibles : dessus et côté droit (parallélogrammes), avant (vraie grandeur)
      poly(["E", "F", "G", "H"], "face-oblique");
      poly(["B", "C", "G", "F"], "face-oblique");
      poly(["A", "B", "F", "E"], "face-avant");
      // arêtes cachées : celles qui partent de D
      seg("D", "A", "arete-cachee"); seg("D", "C", "arete-cachee"); seg("D", "H", "arete-cachee");
      // arêtes visibles
      [["A", "B"], ["B", "F"], ["F", "E"], ["E", "A"], ["B", "C"], ["C", "G"], ["G", "F"], ["G", "H"], ["H", "E"]].forEach(function (p) { seg(p[0], p[1], "arete"); });
      // arête fuyante mesurée : [BC]
      seg("B", "C", "fuyante");
      // angle de fuite en B : horizontale de référence + arc
      var rr = 30;
      el("line", { x1: S.B.x.toFixed(1), y1: S.B.y.toFixed(1), x2: (S.B.x + rr + 18).toFixed(1), y2: S.B.y.toFixed(1), "class": "repere" }, svg);
      var ax = S.B.x + rr, ay = S.B.y, bx2 = S.B.x + rr * Math.cos(a), by2 = S.B.y - rr * Math.sin(a);
      el("path", { d: "M " + ax.toFixed(1) + " " + ay.toFixed(1) + " A " + rr + " " + rr + " 0 0 0 " + bx2.toFixed(1) + " " + by2.toFixed(1), "class": "arc" }, svg);
      var am = a / 2, ta = el("text", { x: (S.B.x + (rr + 12) * Math.cos(am)).toFixed(1), y: (S.B.y - (rr + 12) * Math.sin(am) + 5).toFixed(1), "class": "etiq etiq-a" }, svg);
      ta.textContent = "α";
      // étiquette de la fuyante
      var mx = (S.B.x + S.C.x) / 2, my = (S.B.y + S.C.y) / 2;
      var tf = el("text", { x: (mx + 10).toFixed(1), y: (my + 14).toFixed(1), "class": "etiq etiq-f" }, svg);
      tf.textContent = fmt(k * ly, 2) + " cm";
      // sommets
      var c = { x: (S.A.x + S.G.x) / 2, y: (S.A.y + S.G.y) / 2 };
      Object.keys(S).forEach(function (n) {
        var p = S[n];
        el("circle", { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 2.8, "class": "pt" }, svg);
        var vx = p.x - c.x, vy = p.y - c.y, l = Math.sqrt(vx * vx + vy * vy) || 1;
        var t = el("text", { x: (p.x + vx / l * 14).toFixed(1), y: (p.y + vy / l * 14 + 5).toFixed(1), "text-anchor": "middle", "class": "etiq" }, svg);
        t.textContent = n;
      });

      // contrôles
      var self = this;
      sh.querySelectorAll("[data-solide]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-solide") === self._solide)); });
      sh.querySelectorAll("[data-alpha]").forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-alpha")) === self._alpha)); });
      sh.querySelectorAll("[data-k]").forEach(function (b) { b.setAttribute("aria-pressed", String(Math.abs(Number(b.getAttribute("data-k")) - self._k) < 1e-9)); });
      sh.getElementById("alpha").value = String(this._alpha);
      sh.getElementById("k").value = String(this._k);
      sh.getElementById("alpha-val").textContent = this._alpha + "°";
      sh.getElementById("k-val").textContent = fmt(this._k, 2);

      // lecture
      var dessinee = k * ly, nomFace = this._solide === "cube" ? "un carré de 4 cm sur 4 cm" : "un rectangle de 6 cm sur 4 cm";
      var h = '<div class="carte"><div class="carte-titre">Arête fuyante [BC]</div>' +
        '<div class="mesure">Vraie longueur : 4 cm. Longueur dessinée : 4 × ' + fmt(k, 2) + ' ' + (exact(dessinee, 2) ? "=" : "≈") + ' <strong>' + fmt(dessinee, 2) + ' cm</strong>.</div>' +
        '<div>Une longueur en profondeur ne se lit donc jamais à la règle sur le dessin.</div></div>';
      h += '<div class="carte"><div class="carte-titre">Ce qui reste en vraie grandeur</div>' +
        'Les faces avant (ABFE) et arrière (DCGH) gardent leur vraie forme : ' + nomFace + '. Les faces du dessus et des côtés, qui contiennent la profondeur, deviennent des <strong>parallélogrammes</strong>.</div>';
      if (k >= 0.999) {
        h += '<div class="carte alerte"><div class="carte-titre">Coefficient 1</div>Sans réduction, le ' + (this._solide === "cube" ? "cube" : "pavé") + ' paraît étiré vers l\'arrière : la profondeur est dessinée en vraie grandeur, alors que l\'œil s\'attend à la voir raccourcie.</div>';
      } else if (Math.abs(k - 0.5) < 1e-9 && this._alpha === 45) {
        h += '<div class="carte ok"><div class="carte-titre">Convention du cours</div>Angle de fuite 45° et réduction de moitié : c\'est la convention utilisée pour tous les dessins de ce chapitre.</div>';
      } else if (k < 0.45) {
        h += '<div class="carte"><div class="carte-titre">Réduction forte</div>Avec une réduction aussi forte, le solide paraît écrasé en profondeur.</div>';
      }
      sh.getElementById("infos").innerHTML = h;
    }
  }

  if (!customElements.get("cavaliere-reglage-widget")) {
    customElements.define("cavaliere-reglage-widget", CavaliereReglageWidget);
  }
})();
