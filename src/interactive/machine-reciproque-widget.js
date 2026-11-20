(function () {
  "use strict";

  /* ================================================================
   * <machine-reciproque-widget> — atelier interactif (6e, ch. 1, § 1,
   * méthode 1 « décomposition en fonctions élémentaires »). La chaîne
   * d'opérations de f se lit de HAUT en BAS (colonne de gauche, l'aller) ;
   * la chaîne réciproque, qui défait chaque opération dans l'ordre inverse,
   * se lit de BAS en HAUT (colonne de droite, le retour). Une valeur x est
   * suivie dans les deux sens : sur chaque ligne, l'aller et le retour
   * affichent la même valeur, et le retour se termine sur le x de départ.
   * Valeur interdite (division par 0) signalée sans calcul. Web Component.
   * ================================================================ */

  var X = '<i>x</i>', Y = '<i>y</i>';
  function frac(n, d) { return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>'; }
  function par(c) { return '<span class="par">(</span>' + c + '<span class="par">)</span>'; }
  function rad(c, indice) { return '<span class="rad">' + (indice ? '<sup class="indice">' + indice + '</sup>' : '') + '√<span class="sous">' + c + '</span></span>'; }

  // Chaque machine : noeuds de l'aller (expressions en x), opérations de l'aller,
  // noeuds du retour (expressions en y, du bas vers le haut : y, …, f⁻¹(y)) et opérations
  // du retour (dans l'ordre du retour). La valeur de chaque noeud est calculée en
  // appliquant réellement les opérations, jamais lue dans une formule.
  var MACHINES = [
    {
      option: "f(x) = 2x + 1",
      f: "2" + X + " + 1",
      aller: [X, "2" + X, "2" + X + " + 1"],
      ops: [
        { nom: "multiplier par 2", fn: function (v) { return 2 * v; } },
        { nom: "ajouter 1", fn: function (v) { return v + 1; } },
      ],
      retour: [Y, Y + " − 1", frac(Y + " − 1", "2")],
      inv: [
        { nom: "soustraire 1", fn: function (v) { return v - 1; } },
        { nom: "diviser par 2", fn: function (v) { return v / 2; } },
      ],
      reciproque: frac(X + " − 1", "2"),
      xMin: -4, xMax: 4, pas: 0.5, xDefaut: 1.5,
    },
    {
      option: "f(x) = 5/(x − 1)",
      f: frac("5", X + " − 1"),
      aller: [X, X + " − 1", frac("1", X + " − 1"), frac("5", X + " − 1")],
      ops: [
        { nom: "soustraire 1", fn: function (v) { return v - 1; } },
        { nom: "inverser", fn: function (v) { return v === 0 ? null : 1 / v; }, interdit: "on ne peut pas inverser 0" },
        { nom: "multiplier par 5", fn: function (v) { return 5 * v; } },
      ],
      retour: [Y, frac(Y, "5"), frac("5", Y), "1 + " + frac("5", Y)],
      inv: [
        { nom: "diviser par 5", fn: function (v) { return v / 5; } },
        { nom: "inverser", fn: function (v) { return 1 / v; } },
        { nom: "ajouter 1", fn: function (v) { return v + 1; } },
      ],
      reciproque: "1 + " + frac("5", X),
      xMin: -4, xMax: 6, pas: 0.5, xDefaut: 3,
    },
    {
      option: "f(x) = (x − 3)³ + 2",
      f: "(" + X + " − 3)³ + 2",
      aller: [X, X + " − 3", "(" + X + " − 3)³", "(" + X + " − 3)³ + 2"],
      ops: [
        { nom: "soustraire 3", fn: function (v) { return v - 3; } },
        { nom: "élever au cube", fn: function (v) { return v * v * v; } },
        { nom: "ajouter 2", fn: function (v) { return v + 2; } },
      ],
      retour: [Y, Y + " − 2", rad(Y + " − 2", "3"), rad(Y + " − 2", "3") + " + 3"],
      inv: [
        { nom: "soustraire 2", fn: function (v) { return v - 2; } },
        { nom: "racine cubique", fn: function (v) { return Math.cbrt(v); } },
        { nom: "ajouter 3", fn: function (v) { return v + 3; } },
      ],
      reciproque: rad(X + " − 2", "3") + " + 3",
      xMin: 0, xMax: 6, pas: 0.5, xDefaut: 4.5,
    },
    {
      option: "f(x) = 2√x − 3 (x ≥ 0)",
      f: "2" + rad(X) + " − 3",
      aller: [X, rad(X), "2" + rad(X), "2" + rad(X) + " − 3"],
      ops: [
        { nom: "racine carrée", fn: function (v) { return Math.sqrt(v); } },
        { nom: "multiplier par 2", fn: function (v) { return 2 * v; } },
        { nom: "soustraire 3", fn: function (v) { return v - 3; } },
      ],
      retour: [Y, Y + " + 3", frac(Y + " + 3", "2"), par(frac(Y + " + 3", "2")) + "²"],
      inv: [
        { nom: "ajouter 3", fn: function (v) { return v + 3; } },
        { nom: "diviser par 2", fn: function (v) { return v / 2; } },
        { nom: "élever au carré", fn: function (v) { return v * v; } },
      ],
      reciproque: par(frac(X + " + 3", "2")) + "²",
      note: "Le carré défait la racine carrée seulement parce que √x est positif : f⁻¹ n’est définie que pour y ≥ −3, l’image de f.",
      xMin: 0, xMax: 9, pas: 0.25, xDefaut: 4,
    },
  ];

  function fmt(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}' +
    '.choix label{font-size:0.8rem;color:var(--ink-soft,#51626f);}' +
    'select{min-height:44px;font:inherit;font-size:0.95rem;padding:6px 10px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#182430);}' +
    '.fm{font-family:var(--serif,Georgia,serif);white-space:nowrap;}' +
    '.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.15;font-size:0.9em;}' +
    '.frac>span:first-child{border-bottom:1px solid currentColor;padding:0 3px 1px;}' +
    '.frac>span:last-child{padding:1px 3px 0;}' +
    '.fm i{margin-right:0.06em;}' +
    '.par{font-size:1.5em;line-height:1;vertical-align:-0.14em;font-weight:300;}' +
    '.rad{white-space:nowrap;}' +
    '.rad .sous{border-top:1px solid currentColor;padding:0 2px 0 1px;}' +
    '.rad .indice{font-size:0.62em;vertical-align:0.9em;margin-right:-0.35em;}' +
    '.titre-f{text-align:center;font-size:1.05rem;margin-bottom:10px;}' +
    '.machine{display:grid;grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr);align-items:center;row-gap:2px;}' +
    '.entete{font-size:0.8rem;font-weight:700;text-align:center;padding-bottom:6px;line-height:1.3;}' +
    '.entete-aller{color:var(--accent-ink,#7a3c11);}' +
    '.entete-retour{color:var(--good,#2f7a4f);}' +
    '.noeud{border:1.5px solid;border-radius:var(--radius,3px);padding:6px 4px;text-align:center;background:var(--surface,#fff);min-height:58px;display:flex;flex-direction:column;justify-content:center;gap:2px;}' +
    '.noeud-aller{border-color:var(--accent,#b65c1f);}' +
    '.noeud-retour{border-color:var(--good,#2f7a4f);}' +
    '.noeud .expr{font-size:1rem;}' +
    '.noeud .val{font-variant-numeric:tabular-nums;font-weight:700;font-size:0.92rem;}' +
    '.noeud-aller .val{color:var(--accent-ink,#7a3c11);}' +
    '.noeud-retour .val{color:var(--good,#2f7a4f);}' +
    '.noeud.vide{opacity:0.45;}' +
    '.egal{text-align:center;font-weight:700;color:var(--ink-faint,#8a97a1);}' +
    '.op{font-size:0.8rem;text-align:center;padding:3px 0;line-height:1.25;}' +
    '.op-aller{color:var(--accent-ink,#7a3c11);}' +
    '.op-retour{color:var(--good,#2f7a4f);}' +
    '.op b{font-size:1rem;display:block;}' +
    '.op.interdit{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:14px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3c11);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#b65c1f);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#51626f);min-width:64px;text-align:right;}' +
    '.lecture{margin-top:12px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.93rem;line-height:1.6;}' +
    '.bilan-ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.bilan-ko{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.note{margin-top:6px;color:var(--ink-soft,#51626f);}' +
    'select:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '</style>' +
    '<div class="choix"><label for="machine">Fonction à défaire</label><select id="machine"></select></div>' +
    '<div class="titre-f fm" id="titre"></div>' +
    '<div class="machine" id="machine-grille"></div>' +
    '<div class="curseur"><label for="x">x — valeur que l’on fait entrer dans la machine</label><div class="curseur-row">' +
    '<input type="range" id="x" min="0" max="10" step="1" value="0"><span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<div class="lecture" aria-live="polite"><div id="bilan"></div><div id="formule"></div><div class="note" id="note"></div></div>';

  class MachineReciproqueWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._select = shadow.getElementById("machine");
      this._inputX = shadow.getElementById("x");
      var self = this;
      MACHINES.forEach(function (m, i) {
        var o = document.createElement("option");
        o.value = String(i);
        o.textContent = m.option;
        self._select.appendChild(o);
      });
    }

    connectedCallback() {
      var self = this;
      this._onSelect = function () { self._choisir(parseInt(self._select.value, 10)); };
      this._onX = function () { self._i = parseInt(self._inputX.value, 10); self._rendre(); };
      this._select.addEventListener("change", this._onSelect);
      this._inputX.addEventListener("input", this._onX);
      this._choisir(0);
    }

    disconnectedCallback() {
      this._select.removeEventListener("change", this._onSelect);
      this._inputX.removeEventListener("input", this._onX);
    }

    _choisir(i) {
      var m = MACHINES[i];
      this._m = m;
      this._select.value = String(i);
      this._inputX.max = String(Math.round((m.xMax - m.xMin) / m.pas));
      this._i = Math.round((m.xDefaut - m.xMin) / m.pas);
      this._inputX.value = String(this._i);
      this._s.getElementById("titre").innerHTML = '<i>f</i>(<i>x</i>) = ' + m.f;
      this._s.getElementById("note").textContent = m.note || "";
      this._rendre();
    }

    _rendre() {
      var m = this._m;
      var x = Math.round((m.xMin + this._i * m.pas) * 1000) / 1000;
      var n = m.ops.length;

      // Aller : on applique réellement chaque opération.
      var va = [x], bloque = -1;
      for (var i = 0; i < n; i++) {
        var r = m.ops[i].fn(va[i]);
        if (r === null || !isFinite(r)) { bloque = i; break; }
        va.push(r);
      }
      // Retour : on part de f(x) et on applique les opérations inverses.
      var vr = [];
      if (bloque < 0) {
        vr[n] = va[n];
        for (var j = 0; j < n; j++) vr[n - 1 - j] = m.inv[j].fn(vr[n - j]);
      }

      var h = '<div class="entete entete-aller">Aller : f<br>(de haut en bas)</div><div></div>' +
        '<div class="entete entete-retour">Retour : f⁻¹<br>(de bas en haut)</div>';
      for (var k = 0; k <= n; k++) {
        var aOk = k < va.length, rOk = bloque < 0;
        h += '<div class="noeud noeud-aller' + (aOk ? '' : ' vide') + '"><span class="expr fm">' + m.aller[k] + '</span>' +
          '<span class="val">' + (aOk ? "= " + fmt(va[k], 3) : "—") + '</span></div>';
        h += '<div class="egal">' + (aOk && rOk ? "=" : "") + '</div>';
        h += '<div class="noeud noeud-retour' + (rOk ? '' : ' vide') + '"><span class="expr fm">' + m.retour[n - k] + '</span>' +
          '<span class="val">' + (rOk ? "= " + fmt(vr[k], 3) : "—") + '</span></div>';
        if (k < n) {
          var interdit = bloque === k;
          h += '<div class="op op-aller' + (interdit ? " interdit" : "") + '"><b>↓</b>' + m.ops[k].nom + (interdit ? " : impossible, " + m.ops[k].interdit : "") + '</div><div></div>';
          h += '<div class="op op-retour"><b>↑</b>' + m.inv[n - 1 - k].nom + '</div>';
        }
      }
      this._s.getElementById("machine-grille").innerHTML = h;

      this._s.getElementById("x-valeur").textContent = "x = " + fmt(x, 2);
      var bilan = this._s.getElementById("bilan");
      if (bloque >= 0) {
        bilan.innerHTML = '<span class="bilan-ko">x = ' + fmt(x, 2) + " n’a pas d’image</span> : la machine bloque à l’étape « " + m.ops[bloque].nom + " ». Cette valeur est hors du domaine de f.";
      } else {
        bilan.innerHTML = '<span class="fm"><i>f</i>(' + fmt(x, 2) + ') = ' + fmt(va[n], 3) + '</span>, puis <span class="fm"><i>f</i>⁻¹(' + fmt(va[n], 3) + ') = ' + fmt(vr[0], 3) +
          '</span> : <span class="bilan-ok">le retour rend exactement le x de départ.</span>';
      }
      this._s.getElementById("formule").innerHTML = 'En lisant le retour : <span class="fm"><i>f</i>⁻¹(<i>y</i>) = ' + m.retour[n] +
        '</span>, soit, avec la lettre <span class="fm"><i>x</i></span> : <span class="fm"><i>f</i>⁻¹(<i>x</i>) = ' + m.reciproque + '</span>.';
    }
  }

  if (!customElements.get("machine-reciproque-widget")) customElements.define("machine-reciproque-widget", MachineReciproqueWidget);
})();
