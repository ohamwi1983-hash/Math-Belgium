(function () {
  "use strict";

  /* ================================================================
   * <derangements-widget> — atelier « Lettres et enveloppes » (6e,
   * chapitre 6, section 2). n lettres glissées au hasard dans n enveloppes
   * (curseur 3 à 8). « Mélanger » montre UNE répartition (lettres bien placées
   * marquées) ; « Simuler 1 000 répartitions » accumule la distribution
   * OBSERVÉE du nombre de lettres bien placées, à côté de la distribution
   * EXACTE : effectif exact de « k bien placées » = (nombre de façons de choisir
   * les k lettres bien placées) × D(n − k), sur n! répartitions, avec la
   * récurrence D(n) = (n − 1)(D(n − 1) + D(n − 2)). P(aucune bien placée) =
   * D(n)/n! est comparée à 1/e ≈ 0,368. Pour n = 4 : les 9 dérangements listés.
   * Fenêtre du diagramme FIXE en hauteur (0 à 0,6) : seul n change le nombre
   * de colonnes.
   * ================================================================ */

  var N_MIN = 3, N_MAX = 8, N_DEFAUT = 4;
  var Y_MAX = 0.6, Y_PAS = 0.1;
  var L = 460, H = 330;
  var ENV_Y = 18, ENV_H = 58;                 // rangée des enveloppes
  var MG = 46, MD = 14, HAUT = 118, MB = 40;  // diagramme

  function nombreFr(x, d) {
    var s = x.toFixed(d);
    return s.replace(".", ",").replace("-", "−");
  }

  // Entier avec une espace pour séparer les milliers (14 833, 1 000).
  function entier(x) { return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function factorielle(n) { var f = 1; for (var i = 2; i <= n; i++) f *= i; return f; }

  // D(0) = 1, D(1) = 0, D(n) = (n − 1)(D(n − 1) + D(n − 2)).
  function derangements(n) {
    var d = [1, 0];
    for (var i = 2; i <= n; i++) d[i] = (i - 1) * (d[i - 1] + d[i - 2]);
    return d[n];
  }

  // Nombre de façons de choisir k objets parmi n (sans ordre), par produit.
  function nombreChoix(n, k) {
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }

  function effectifsExacts(n) {
    var e = [];
    for (var k = 0; k <= n; k++) e.push(nombreChoix(n, k) * derangements(n - k));
    return e;
  }

  function permutationAleatoire(n) {
    var p = [];
    for (var i = 1; i <= n; i++) p.push(i);
    for (var j = n - 1; j > 0; j--) {
      var r = Math.floor(Math.random() * (j + 1));
      var t = p[j]; p[j] = p[r]; p[r] = t;
    }
    return p;
  }

  function nombreBienPlacees(p) {
    var c = 0;
    for (var i = 0; i < p.length; i++) if (p[i] === i + 1) c++;
    return c;
  }

  // Tous les dérangements de 1..n, dans l'ordre lexicographique.
  function listeDerangements(n) {
    var res = [], cur = [], utilise = [];
    (function rec(pos) {
      if (pos > n) { res.push(cur.join("")); return; }
      for (var v = 1; v <= n; v++) {
        if (utilise[v] || v === pos) continue;
        utilise[v] = true; cur.push(v);
        rec(pos + 1);
        cur.pop(); utilise[v] = false;
      }
    })(1);
    return res;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none!important;}" +
    ".figure svg{display:block;width:100%;max-width:460px;height:auto;margin:0 auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}" +
    ".env{fill:var(--surface,#fff);stroke:var(--ink-faint,#9c9083);stroke-width:1.2;}" +
    ".env-ok{fill:var(--good-soft,#e2f0e7);stroke:var(--good,#2f7a4f);stroke-width:1.8;}" +
    ".rabat{fill:none;stroke:var(--ink-faint,#9c9083);stroke-width:1;}" +
    ".num-env{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}" +
    ".lettre{font-size:17px;font-weight:700;font-family:var(--serif,serif);}" +
    ".lettre-ok{fill:var(--good,#2f7a4f);}" +
    ".lettre-ko{fill:var(--accent-ink,#7a3212);}" +
    ".coche{font-size:12px;font-weight:700;fill:var(--good,#2f7a4f);}" +
    ".grille{stroke:var(--line-soft,#ece4d6);stroke-width:1;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".grad{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}" +
    ".titre-axe{font-size:11px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}" +
    ".barre-exacte{fill:var(--accent,#a8471f);}" +
    ".barre-obs{fill:var(--sky,#2f7fa8);opacity:0.75;}" +
    ".repere-e{stroke:var(--plan,#5b4ea3);stroke-width:1.3;stroke-dasharray:5 3;}" +
    ".txt-e{font-size:10px;font-family:var(--sans,sans-serif);fill:var(--plan-ink,#463c86);font-weight:600;}" +
    ".leg{font-size:10.5px;font-family:var(--sans,sans-serif);font-weight:600;}" +
    ".leg-ex{fill:var(--accent-ink,#7a3212);}" +
    ".leg-obs{fill:var(--sky-ink,#1d5a7a);}" +
    ".vide{font-size:12px;font-style:italic;fill:var(--ink-soft,#6b6055);}" +
    ".resume{text-align:center;font-weight:600;font-size:0.92rem;margin:10px 0 6px;}" +
    ".stats{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 10px;}" +
    ".stat{flex:1 1 140px;max-width:220px;background:var(--surface-2,#faf6f0);border:1px solid var(--line-soft,#ece4d6);border-radius:var(--radius,3px);padding:6px 8px;text-align:center;}" +
    ".stat-label{font-size:0.72rem;letter-spacing:0.04em;color:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}" +
    ".stat-val{font-size:1rem;font-weight:700;font-variant-numeric:tabular-nums;}" +
    ".table-zone{overflow-x:auto;margin:0 0 10px;}" +
    "table{border-collapse:collapse;margin:0 auto;font-size:0.84rem;font-variant-numeric:tabular-nums;}" +
    "th,td{border:1px solid var(--line,#ddd2c0);padding:4px 8px;text-align:center;white-space:nowrap;}" +
    "th{background:var(--surface-2,#faf6f0);font-weight:600;white-space:normal;max-width:120px;line-height:1.25;}" +
    "td.zero{color:var(--bad,#a8322f);}" +
    ".controles{display:flex;flex-direction:column;gap:10px;}" +
    ".curseur{display:flex;align-items:center;gap:10px;font-size:0.88rem;}" +
    ".curseur label{flex:0 0 150px;font-weight:600;}" +
    ".curseur input{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-width:0;}" +
    ".curseur span{min-width:30px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;}" +
    ".boutons{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}" +
    "button{font:inherit;font-size:0.86rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ddd2c0);background:var(--surface,#fff);color:var(--ink,#241f1a);cursor:pointer;}" +
    "button:hover{border-color:var(--accent,#a8471f);}" +
    "button.principal{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}" +
    ".liste{margin:4px 0 0;padding:8px 10px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);font-size:0.86rem;line-height:1.6;}" +
    ".liste code{font-family:var(--mono,monospace);font-size:0.95rem;background:var(--surface,#fff);border:1px solid var(--line-soft,#ece4d6);padding:1px 5px;border-radius:3px;margin:0 3px;display:inline-block;}" +
    "@media (max-width:480px){.curseur label{flex-basis:110px;font-size:0.8rem;}table{font-size:0.78rem;}th,td{padding:3px 5px;}}" +
    "</style>" +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + " " + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Répartition des lettres et distribution du nombre de lettres bien placées"></svg></div>' +
    '<p class="resume" id="resume"></p>' +
    '<div class="stats">' +
    '<div class="stat"><div class="stat-label">P(aucune bien placée)</div><div class="stat-val" id="p0"></div></div>' +
    '<div class="stat"><div class="stat-label">1/e</div><div class="stat-val" id="inv-e"></div></div>' +
    '<div class="stat"><div class="stat-label">répartitions simulées</div><div class="stat-val" id="nb-sim"></div></div>' +
    "</div>" +
    '<div class="table-zone"><table id="table"></table></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="n">nombre de lettres n</label><input type="range" id="n" min="' + N_MIN + '" max="' + N_MAX + '" step="1" value="' + N_DEFAUT + '"><span id="n-v"></span></div>' +
    '<div class="boutons">' +
    '<button type="button" id="melanger" class="principal">Mélanger</button>' +
    '<button type="button" id="simuler">Simuler 1 000 répartitions</button>' +
    '<button type="button" id="zero">Effacer la simulation</button>' +
    '<button type="button" id="voir">Voir les 9 dérangements</button>' +
    "</div>" +
    '<div class="liste" id="liste" hidden></div>' +
    "</div>";

  class DerangementsWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, s = this._s;
      s.getElementById("n").addEventListener("input", function () { self._changerN(); });
      s.getElementById("melanger").addEventListener("click", function () { self._melanger(); });
      s.getElementById("simuler").addEventListener("click", function () { self._simuler(1000); });
      s.getElementById("zero").addEventListener("click", function () { self._effacer(); self._rendre(); });
      s.getElementById("voir").addEventListener("click", function () {
        var liste = s.getElementById("liste");
        liste.hidden = !liste.hidden;
        s.getElementById("voir").textContent = liste.hidden ? "Voir les 9 dérangements" : "Masquer les 9 dérangements";
      });
      this._changerN();
    }

    _changerN() {
      this._n = parseInt(this._s.getElementById("n").value, 10);
      this._perm = null;
      this._effacer();
      var s = this._s, liste = s.getElementById("liste"), voir = s.getElementById("voir");
      voir.hidden = this._n !== 4;
      liste.hidden = true;
      voir.textContent = "Voir les 9 dérangements";
      if (this._n === 4) {
        liste.innerHTML = "Les 9 répartitions où <strong>aucune</strong> lettre n'est dans son enveloppe " +
          "(le chiffre en position i est la lettre glissée dans l'enveloppe i) :<br>" +
          listeDerangements(4).map(function (m) { return "<code>" + m + "</code>"; }).join(" ");
      }
      this._rendre();
    }

    _effacer() {
      this._obs = [];
      for (var k = 0; k <= this._n; k++) this._obs.push(0);
      this._total = 0;
    }

    _melanger() {
      this._perm = permutationAleatoire(this._n);
      this._rendre();
    }

    _simuler(combien) {
      for (var i = 0; i < combien; i++) this._obs[nombreBienPlacees(permutationAleatoire(this._n))]++;
      this._total += combien;
      this._rendre();
    }

    _rendre() {
      var s = this._s, n = this._n;
      var nf = factorielle(n), ex = effectifsExacts(n);
      s.getElementById("n-v").textContent = String(n);
      var p0 = ex[0] / nf;
      s.getElementById("p0").textContent = entier(ex[0]) + "/" + entier(nf) + " ≈ " + nombreFr(p0, 4);
      s.getElementById("inv-e").textContent = "≈ " + nombreFr(1 / Math.E, 4);
      s.getElementById("nb-sim").textContent = entier(this._total);

      var resume = s.getElementById("resume");
      if (this._perm) {
        var b = nombreBienPlacees(this._perm);
        resume.textContent = b === 0 ? "Aucune lettre n'est dans son enveloppe : c'est un dérangement."
          : b === 1 ? "1 lettre est dans son enveloppe." : b + " lettres sont dans leur enveloppe.";
      } else {
        resume.textContent = "Clique sur « Mélanger » pour glisser les " + n + " lettres au hasard dans les enveloppes.";
      }

      // Tableau (une ligne par k) : effectif exact sur n!, probabilité exacte, fréquence observée.
      var lignes = "<tr><th>bien placées</th><th>répartitions (sur " + entier(nf) + ")</th><th>probabilité exacte</th><th>fréquence observée</th></tr>";
      for (var k = 0; k <= n; k++) {
        var z = ex[k] === 0 ? ' class="zero"' : "";
        lignes += "<tr><td>" + k + "</td><td" + z + ">" + entier(ex[k]) + "</td><td" + z + ">" + nombreFr(ex[k] / nf, 3) +
          "</td><td>" + (this._total ? nombreFr(this._obs[k] / this._total, 3) : "—") + "</td></tr>";
      }
      s.getElementById("table").innerHTML = lignes;

      this._dessiner(n, nf, ex);
    }

    _dessiner(n, nf, ex) {
      var svg = this._s.getElementById("svg");
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marker = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marker.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marker);
      svg.appendChild(defs);

      // --- Rangée des enveloppes ---
      var largeurDispo = L - 24, pasEnv = largeurDispo / n, ew = Math.min(48, pasEnv - 8);
      for (var i = 0; i < n; i++) {
        var cx = 12 + pasEnv * (i + 0.5), x0 = cx - ew / 2;
        var lettre = this._perm ? this._perm[i] : null, ok = lettre === i + 1;
        svg.appendChild(svgEl("rect", { x: x0, y: ENV_Y, width: ew, height: ENV_H - 22, rx: 3, class: lettre !== null && ok ? "env-ok" : "env" }));
        svg.appendChild(svgEl("path", { d: "M" + x0 + " " + ENV_Y + " L" + cx + " " + (ENV_Y + 13) + " L" + (x0 + ew) + " " + ENV_Y, class: "rabat" }));
        var tn = svgEl("text", { x: cx, y: ENV_Y + ENV_H - 8, "text-anchor": "middle", class: "num-env" });
        tn.textContent = "env. " + (i + 1);
        svg.appendChild(tn);
        if (lettre !== null) {
          var tl = svgEl("text", { x: cx, y: ENV_Y + 30, "text-anchor": "middle", class: "lettre " + (ok ? "lettre-ok" : "lettre-ko") });
          tl.textContent = String(lettre);
          svg.appendChild(tl);
          if (ok) {
            var tc = svgEl("text", { x: x0 + ew - 3, y: ENV_Y + 11, "text-anchor": "end", class: "coche" });
            tc.textContent = "✓";
            svg.appendChild(tc);
          }
        } else {
          var tv = svgEl("text", { x: cx, y: ENV_Y + 28, "text-anchor": "middle", class: "num-env" });
          tv.textContent = "?";
          svg.appendChild(tv);
        }
      }

      // --- Diagramme : probabilité exacte et fréquence observée ---
      var bas = H - MB;
      var px0 = MG, px1 = L - MD;
      var py = function (v) { return bas - v / Y_MAX * (bas - HAUT); };
      for (var g = 0; g <= Y_MAX + 1e-9; g += Y_PAS) {
        svg.appendChild(svgEl("line", { x1: px0, x2: px1, y1: py(g), y2: py(g), class: "grille" }));
        if (g > Y_MAX - 1e-9) continue;
        var tg = svgEl("text", { x: px0 - 5, y: py(g) + 3.5, "text-anchor": "end", class: "grad" });
        tg.textContent = nombreFr(g, 1);
        svg.appendChild(tg);
      }
      var colonnes = n + 1, pasCol = (px1 - px0) / colonnes, bw = Math.min(22, pasCol * 0.36);
      for (var k = 0; k <= n; k++) {
        var c = px0 + pasCol * (k + 0.5);
        var pe = ex[k] / nf;
        svg.appendChild(svgEl("rect", { x: c - bw - 1, y: py(pe), width: bw, height: bas - py(pe), class: "barre-exacte" }));
        if (this._total) {
          var fo = this._obs[k] / this._total;
          svg.appendChild(svgEl("rect", { x: c + 1, y: py(Math.min(fo, Y_MAX)), width: bw, height: bas - py(Math.min(fo, Y_MAX)), class: "barre-obs" }));
        }
        var tk = svgEl("text", { x: c, y: bas + 14, "text-anchor": "middle", class: "grad" });
        tk.textContent = String(k);
        svg.appendChild(tk);
      }
      // Repère 1/e sur la colonne « 0 bien placée » (légende à part, pour ne jamais chevaucher les barres)
      var cx0 = px0 + pasCol * 0.5;
      svg.appendChild(svgEl("line", { x1: cx0 - bw - 5, x2: cx0 + bw + 5, y1: py(1 / Math.E), y2: py(1 / Math.E), class: "repere-e" }));
      // Axes
      svg.appendChild(svgEl("line", { x1: px0, x2: px1 + 6, y1: bas, y2: bas, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: px0, x2: px0, y1: bas, y2: HAUT - 12, class: "axe", "marker-end": "url(#fl)" }));
      var tx = svgEl("text", { x: px1, y: bas + 30, "text-anchor": "end", class: "titre-axe" });
      tx.textContent = "nombre de lettres bien placées";
      svg.appendChild(tx);
      var ty = svgEl("text", { x: px0 + 6, y: HAUT - 6, class: "titre-axe" });
      ty.textContent = "probabilité";
      svg.appendChild(ty);
      // Légende
      var lx = px1 - 4;
      var l1 = svgEl("text", { x: lx, y: HAUT + 2, "text-anchor": "end", class: "leg leg-ex" });
      l1.textContent = "■ probabilité exacte";
      svg.appendChild(l1);
      var l2 = svgEl("text", { x: lx, y: HAUT + 16, "text-anchor": "end", class: "leg leg-obs" });
      l2.textContent = this._total ? "■ fréquence observée" : "fréquence observée : lance une simulation";
      svg.appendChild(l2);
      svg.appendChild(svgEl("line", { x1: lx - 92, x2: lx - 78, y1: HAUT + 26, y2: HAUT + 26, class: "repere-e" }));
      var l3 = svgEl("text", { x: lx, y: HAUT + 30, "text-anchor": "end", class: "txt-e" });
      l3.textContent = "1/e ≈ 0,368";
      svg.appendChild(l3);
    }
  }

  if (!customElements.get("derangements-widget")) {
    customElements.define("derangements-widget", DerangementsWidget);
  }
})();
