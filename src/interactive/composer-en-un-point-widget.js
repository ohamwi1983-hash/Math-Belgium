/* ================================================================
 * <composer-en-un-point-widget> — atelier « Composer en un point »
 * (5e, ch. 1, § 2). Deux fonctions simples f et g (une racine ou un
 * dénominateur, pour qu'une composée puisse ne pas exister). L'élève
 * choisit a et l'ordre (f∘g ou g∘f) ; la première machine affiche sa
 * sortie, puis l'élève répond « existe / n'existe pas » AVANT de voir le
 * résultat : la valeur exacte (fraction, racine) ou la raison s'affiche
 * ensuite. Sans score : chaque essai est seulement reporté sur une droite
 * graduée (vert : existe, rouge : n'existe pas), où l'on peut finir par
 * afficher le domaine de la composée. Calculs EXACTS (rationnels et
 * r + s√m), jamais d'arrondi caché. Web Component (Shadow DOM), formules
 * en KaTeX (module partagé `katex-shadow.js`).
 * ================================================================ */
import { styleKatex, tex, texEgalites, texNombre, texIntervalle, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'

// ---------- rationnels ----------
function pgcd(a, b) {
  a = Math.abs(a); b = Math.abs(b)
  while (b) { var t = a % b; a = b; b = t }
  return a || 1
}
function Q(n, d) {
  if (d === undefined) d = 1
  if (d < 0) { n = -n; d = -d }
  var g = pgcd(n, d)
  return { n: n / g, d: d / g }
}
function qAdd(a, b) { return Q(a.n * b.d + b.n * a.d, a.d * b.d) }
function qMul(a, b) { return Q(a.n * b.n, a.d * b.d) }
function qInv(a) { return Q(a.d, a.n) }
function qNum(a) { return a.n / a.d }
function qZero(a) { return a.n === 0 }

// ---------- nombres exacts r + s√m (m sans facteur carré) ----------
function E(r) { return { r: r, s: Q(0), m: 1 } }
function norm(x) { return qZero(x.s) ? E(x.r) : x }
function eAff(x, k, c) { return norm({ r: qAdd(qMul(k, x.r), c), s: qMul(k, x.s), m: x.m }) }
function eCarre(x) {
  return norm({ r: qAdd(qMul(x.r, x.r), qMul(qMul(x.s, x.s), Q(x.m))), s: qMul(Q(2), qMul(x.r, x.s)), m: x.m })
}
function eInv(x) {
  if (qZero(x.s)) return E(qInv(x.r))
  var den = qAdd(qMul(x.r, x.r), qMul(Q(-1), qMul(qMul(x.s, x.s), Q(x.m))))
  var id = qInv(den)
  return norm({ r: qMul(x.r, id), s: qMul(Q(-1), qMul(x.s, id)), m: x.m })
}
function eRacine(x) { // x rationnel ≥ 0
  var q = x.r.d, b = x.r.n * x.r.d, a = 1
  for (var k = 2; k * k <= b; k++) while (b % (k * k) === 0) { b /= k * k; a *= k }
  return b === 1 ? E(Q(a, q)) : { r: Q(0), s: Q(a, q), m: b }
}
function eRationnel(x) { return qZero(x.s) }
function eNum(x) { return qNum(x.r) + qNum(x.s) * Math.sqrt(x.m) }

// Décimal (au plus 3 décimales) quand il est exact, fraction sinon.
function texQ(q) {
  for (var k = 0; k <= 3; k++) {
    var p = Math.pow(10, k)
    if ((q.n * p) % q.d === 0) return texNombre(q.n / q.d, k)
  }
  return (q.n < 0 ? '-' : '') + '\\frac{' + Math.abs(q.n) + '}{' + q.d + '}'
}
function texE(x) {
  if (eRationnel(x)) return texQ(x.r)
  var s = x.s, neg = s.n < 0, a = Math.abs(s.n), rad = (a === 1 ? '' : a) + '\\sqrt{' + x.m + '}'
  var radTex = s.d === 1 ? rad : '\\frac{' + rad + '}{' + s.d + '}'
  if (qZero(x.r)) return (neg ? '-' : '') + radTex
  return texQ(x.r) + (neg ? '-' : '+') + radTex
}
function estExactDecimal(x) { return eRationnel(x) && texQ(x.r).indexOf('frac') < 0 }
// « (−2) » : parenthèses autour d'une valeur négative ou composée, pour l'écrire dans f(…).
function texPar(x) {
  var t = texE(x)
  return t.charAt(0) === '-' ? '(' + t + ')' : t
}
function signe(k) { return k > 0 ? '+' + k : k < 0 ? '-' + Math.abs(k) : '' }

// ---------- les fonctions ----------
function fRacine(k) { // √(x + k)
  return {
    tex: '\\sqrt{x' + signe(k) + '}',
    dom: texIntervalle(texNombre(-k, 0), '+\\infty', false, true),
    appliquer: function (v) {
      var arg = eAff(v, Q(1), Q(k))
      if (qNum(arg.r) + qNum(arg.s) * Math.sqrt(arg.m) < -1e-12) return { ok: false, type: 'racine', arg: arg, k: k }
      return { ok: true, v: eRacine(arg) }
    },
  }
}
function fInverse(k) { // 1 / (x + k)
  return {
    tex: '\\frac{1}{x' + signe(k) + '}',
    dom: k === 0 ? '\\mathbb{R}\\setminus\\{0\\}' : '\\mathbb{R}\\setminus\\{' + texNombre(-k, 0) + '\\}',
    appliquer: function (v) {
      var arg = eAff(v, Q(1), Q(k))
      if (qZero(arg.r) && qZero(arg.s)) return { ok: false, type: 'inverse', arg: arg, k: k }
      return { ok: true, v: eInv(arg) }
    },
  }
}
function fCarre(alpha, beta, texte) { // α x² + β
  return {
    tex: texte, dom: '\\mathbb{R}',
    appliquer: function (v) { return { ok: true, v: eAff(eCarre(v), Q(alpha), Q(beta)) } },
  }
}
function fAffine(m, c, texte) {
  return {
    tex: texte, dom: '\\mathbb{R}',
    appliquer: function (v) { return { ok: true, v: eAff(v, Q(m), Q(c)) } },
  }
}

var INF = Infinity
// dom des deux composées, écrit à la main pour chaque couple (vérifié algébriquement).
var COUPLES = [
  {
    f: fRacine(0), g: fCarre(-1, 4, '4-x^2'),
    fog: { tex: '[-2\\,;\\,2]', parts: [[-2, 2, false, false]] },
    gof: { tex: '[0\\,;\\,+\\infty[', parts: [[0, INF, false, true]] },
  },
  {
    f: fInverse(0), g: fCarre(1, -4, 'x^2-4'),
    fog: { tex: '\\mathbb{R}\\setminus\\{-2\\,;\\,2\\}', parts: [[-INF, -2, true, true], [-2, 2, true, true], [2, INF, true, true]] },
    gof: { tex: '\\mathbb{R}\\setminus\\{0\\}', parts: [[-INF, 0, true, true], [0, INF, true, true]] },
  },
  {
    f: fRacine(-1), g: fAffine(-1, 3, '3-x'),
    fog: { tex: '\\mathopen{]}-\\infty\\,;\\,2]', parts: [[-INF, 2, true, false]] },
    gof: { tex: '[1\\,;\\,+\\infty[', parts: [[1, INF, false, true]] },
  },
  {
    f: fInverse(-2), g: fRacine(1),
    fog: { tex: '[-1\\,;\\,3\\mathclose{[}\\cup\\mathopen{]}3\\,;\\,+\\infty[', parts: [[-1, 3, false, true], [3, INF, true, true]] },
    gof: { tex: '\\mathopen{]}-\\infty\\,;\\,1]\\cup\\mathopen{]}2\\,;\\,+\\infty[', parts: [[-INF, 1, true, false], [2, INF, true, true]] },
  },
]

var A_MIN = -5, A_MAX = 5, PAS = 0.5
var LARG = 420, HAUT = 92, MG = 26, Y_AXE = 46

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  '.couple-formules{text-align:center;margin:0 0 12px;line-height:2;}' +
  '.couple-formules .sep{display:inline-block;width:18px;}' +
  '.chaine{display:flex;flex-direction:column;align-items:center;gap:2px;margin:0 0 12px;}' +
  '.case{min-height:44px;display:flex;align-items:center;justify-content:center;padding:6px 14px;border:1px solid var(--line,#ccd8e0);' +
  'border-radius:999px;background:var(--surface,#fff);min-width:150px;text-align:center;}' +
  '.case.mystere{border-style:dashed;border-color:var(--plan,#5b4ea3);color:var(--plan-ink,#443a80);}' +
  '.case.vide{border-color:var(--bad,#b23a3a);color:var(--bad,#b23a3a);}' +
  '.machine{display:flex;align-items:center;gap:8px;padding:6px 14px;min-height:44px;border:2px solid var(--accent,#b65c1f);' +
  'border-radius:var(--radius,3px);background:var(--accent-soft,#f4e3d1);color:var(--accent-ink,#7a3c11);font-weight:600;}' +
  '.machine .roue{font-size:0.78rem;font-weight:700;text-transform:none;opacity:0.85;}' +
  '.fl{color:var(--ink-faint,#8a97a1);font-size:1rem;line-height:1;}' +
  '.question{text-align:center;margin:0 0 8px;font-weight:600;}' +
  '.repondu{background:var(--surface-2,#f7f9fb);}' +
  '.essais-titre{text-align:center;font-size:0.85rem;color:var(--ink-soft,#51626f);margin:0 0 4px;}' +
  '.pt-oui{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
  '.pt-non{stroke:var(--bad,#b23a3a);stroke-width:2.6;stroke-linecap:round;}' +
  '.pt-courant{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2;}' +
  '.dom-bande{stroke:var(--plan,#5b4ea3);stroke-width:6;stroke-linecap:butt;opacity:0.85;}' +
  '.dom-plein{fill:var(--plan,#5b4ea3);}' +
  '.dom-creux{fill:var(--surface-2,#f7f9fb);stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
  '.legende{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 14px;font-size:0.82rem;color:var(--ink-soft,#51626f);margin:0 0 8px;}' +
  '.leg-oui::before{content:"";display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--good,#2f7a4f);margin-right:5px;}' +
  '.leg-non::before{content:"×";color:var(--bad,#b23a3a);font-weight:700;margin-right:5px;}' +
  '.dom-texte{text-align:center;margin:0 0 4px;color:var(--plan-ink,#443a80);}' +
  '</style>' +
  '<div class="rangee" id="couples" role="group" aria-label="Choix du couple de fonctions"></div>' +
  '<p class="couple-formules" id="formules"></p>' +
  '<div class="rangee" id="ordres" role="group" aria-label="Ordre de composition"></div>' +
  '<div class="curseur"><span class="nom" id="a-nom"></span>' +
  '<button class="btn" id="moins" aria-label="Diminuer a">−</button>' +
  '<input type="range" id="a" min="' + A_MIN + '" max="' + A_MAX + '" step="' + PAS + '" value="3" aria-label="Valeur de a">' +
  '<button class="btn" id="plus" aria-label="Augmenter a">+</button></div>' +
  '<div class="chaine" id="chaine"></div>' +
  '<p class="question" id="question"></p>' +
  '<div class="rangee" id="reponses">' +
  '<button class="btn" id="oui">existe</button><button class="btn" id="non">n’existe pas</button></div>' +
  '<div class="panneau" id="bilan" hidden></div>' +
  '<p class="essais-titre">Tes essais, reportés sur la droite des valeurs de a</p>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Essais déjà faits"></svg></div>' +
  '<div class="legende"><span class="leg-oui">existe</span><span class="leg-non">n’existe pas</span></div>' +
  '<p class="dom-texte" id="dom-texte" hidden></p>' +
  '<div class="rangee"><button class="btn" id="voir-dom" aria-pressed="false"></button></div>'

class ComposerEnUnPointWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._couple = 0
    this._ordre = 'fog'
    this._a = 3
    this._reponse = null
    this._essais = {}
    this._voirDom = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var zc = sh.getElementById('couples')
    COUPLES.forEach(function (_, i) {
      var b = document.createElement('button')
      b.className = 'btn'
      b.textContent = 'Couple ' + (i + 1)
      b.addEventListener('click', function () { self._couple = i; self._reinit() })
      zc.appendChild(b)
    })
    var zo = sh.getElementById('ordres')
    ;[['fog', '(f\\circ g)(a)'], ['gof', '(g\\circ f)(a)']].forEach(function (o) {
      var b = document.createElement('button')
      b.className = 'btn'
      b.dataset.ordre = o[0]
      b.innerHTML = tex(o[1])
      b.addEventListener('click', function () { self._ordre = o[0]; self._reinit() })
      zo.appendChild(b)
    })
    var curseur = sh.getElementById('a')
    var fixerA = function (v) {
      v = Math.max(A_MIN, Math.min(A_MAX, Math.round(v / PAS) * PAS))
      if (v === self._a) return
      self._a = v
      curseur.value = String(v)
      self._reponse = null
      self._rendre()
    }
    curseur.addEventListener('input', function () { fixerA(parseFloat(curseur.value)) })
    sh.getElementById('moins').addEventListener('click', function () { fixerA(self._a - PAS) })
    sh.getElementById('plus').addEventListener('click', function () { fixerA(self._a + PAS) })
    sh.getElementById('oui').addEventListener('click', function () { self._repondre(true) })
    sh.getElementById('non').addEventListener('click', function () { self._repondre(false) })
    sh.getElementById('voir-dom').addEventListener('click', function () { self._voirDom = !self._voirDom; self._rendre() })
    this._rendre()
  }

  _reinit() {
    this._reponse = null
    this._essais = {}
    this._voirDom = false
    this._rendre()
  }

  _noms() {
    return this._ordre === 'fog' ? { int: 'g', ext: 'f' } : { int: 'f', ext: 'g' }
  }

  _calcul() {
    var c = COUPLES[this._couple], n = this._noms()
    var fi = c[n.int], fe = c[n.ext]
    var a = E(Q(Math.round(this._a * 2), 2))
    var r1 = fi.appliquer(a)
    if (!r1.ok) return { a: a, r1: r1, existe: false }
    var r2 = fe.appliquer(r1.v)
    return { a: a, r1: r1, r2: r2, existe: r2.ok }
  }

  _repondre(dit) {
    var calc = this._calcul()
    this._reponse = dit
    this._essais[String(this._a)] = calc.existe
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, c = COUPLES[this._couple], n = this._noms(), self = this
    sh.querySelectorAll('#couples .btn').forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === self._couple)) })
    sh.querySelectorAll('#ordres .btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.ordre === self._ordre)) })
    sh.getElementById('formules').innerHTML =
      tex('f(x)=' + c.f.tex) + '<span class="sep"></span>' + tex('g(x)=' + c.g.tex)

    var calc = this._calcul()
    var aT = texE(calc.a), aP = texPar(calc.a)
    var compo = '(' + n.ext + '\\circ ' + n.int + ')(' + aT + ')'
    sh.getElementById('a-nom').innerHTML = tex('a=' + aT)

    // La chaîne des deux machines.
    var h = '<div class="case">' + tex('a=' + aT) + '</div><div class="fl">↓</div>'
    h += '<div class="machine"><span class="roue">machine</span>' + tex(n.int + '(x)=' + c[n.int].tex) + '</div><div class="fl">↓</div>'
    if (calc.r1.ok) h += '<div class="case">' + tex(n.int + '(' + aT + ')=' + texE(calc.r1.v)) + '</div>'
    else h += '<div class="case vide">' + tex(n.int + '(' + aT + ')') + '&nbsp;n’existe pas</div>'
    h += '<div class="fl">↓</div><div class="machine"><span class="roue">machine</span>' + tex(n.ext + '(x)=' + c[n.ext].tex) + '</div><div class="fl">↓</div>'
    if (this._reponse === null) h += '<div class="case mystere">' + tex(compo + '=\\;?') + '</div>'
    else if (calc.existe) h += '<div class="case">' + tex(compo + '=' + texE(calc.r2.v)) + '</div>'
    else h += '<div class="case vide">' + tex(compo) + '&nbsp;n’existe pas</div>'
    sh.getElementById('chaine').innerHTML = h

    var q = sh.getElementById('question')
    var bilan = sh.getElementById('bilan')
    var repondu = this._reponse !== null
    sh.getElementById('oui').disabled = repondu
    sh.getElementById('non').disabled = repondu
    sh.getElementById('oui').setAttribute('aria-pressed', String(this._reponse === true))
    sh.getElementById('non').setAttribute('aria-pressed', String(this._reponse === false))
    if (!repondu) {
      q.innerHTML = 'Avant de voir le résultat : ' + tex(compo) + ' existe-t-il ?'
      bilan.hidden = true
    } else {
      q.innerHTML = 'Tu as répondu : « ' + (this._reponse ? 'existe' : 'n’existe pas') + ' ».'
      bilan.hidden = false
      bilan.innerHTML = this._explication(calc, n, aT, aP, compo)
    }

    var bd = sh.getElementById('voir-dom')
    bd.innerHTML = this._voirDom ? 'Cacher le domaine' : 'Montrer ' + tex('\\operatorname{dom}(' + n.ext + '\\circ ' + n.int + ')')
    bd.setAttribute('aria-pressed', String(this._voirDom))
    var dt = sh.getElementById('dom-texte')
    dt.hidden = !this._voirDom
    if (this._voirDom) dt.innerHTML = tex('\\operatorname{dom}(' + n.ext + '\\circ ' + n.int + ')=' + c[this._ordre].tex)
    this._dessiner()
  }

  _explication(calc, n, aT, aP, compo) {
    var c = COUPLES[this._couple]
    var juste = this._reponse === calc.existe
    var h = '<p class="' + (juste ? 'ok' : 'ko') + '">' + (juste ? 'Bien vu !' : 'Pas tout à fait.') + '</p>'
    if (!calc.r1.ok) {
      h += '<p>' + tex(aT) + ' n’est pas dans ' + tex('\\operatorname{dom}' + n.int + '=' + c[n.int].dom) + ' : ' +
        this._raison(calc.r1, aP, n.int) + ' La première machine ne laisse rien sortir, donc ' + tex(compo) +
        ' n’existe pas.</p>'
      return h
    }
    var vT = texE(calc.r1.v), vP = texPar(calc.r1.v)
    if (!calc.existe) {
      h += '<p>' + tex(n.int + '(' + aT + ')=' + vT) + ' n’est pas dans ' + tex('\\operatorname{dom}' + n.ext + '=' + c[n.ext].dom) +
        ' : ' + this._raison(calc.r2, vP, n.ext) + ' Donc ' + tex(compo) + ' n’existe pas.</p>'
      return h
    }
    var val = calc.r2.v
    var ligne = [compo, n.ext + '(' + vP + ')', texE(val)]
    if (!estExactDecimal(val)) ligne.push('\\approx' + texNombre(eNum(val), 2))
    h += '<p>' + tex(n.int + '(' + aT + ')=' + vT) + ' est dans ' + tex('\\operatorname{dom}' + n.ext + '=' + c[n.ext].dom) +
      ' : la seconde machine accepte cette valeur.</p><p class="formule">' + texEgalites(ligne) + '</p>'
    return h
  }

  // Pourquoi une machine refuse la valeur reçue (t : valeur en LaTeX, entre parenthèses si négative).
  _raison(r, t, nom) {
    var argT = texE(r.arg)
    if (r.type === 'racine') {
      return 'sous la racine de ' + tex(nom) + ', on aurait ' + tex((r.k === 0 ? '' : t + signe(r.k) + '=') + argT + '<0') + '.'
    }
    return 'le dénominateur de ' + tex(nom) + ' vaudrait ' + tex(r.k === 0 ? '0' : t + signe(r.k) + '=0') + ' — on ne divise jamais par 0.'
  }

  _dessiner() {
    var svg = this._sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var px = function (v) { return MG + (v - (A_MIN - 0.5)) / (A_MAX - A_MIN + 1) * (LARG - 2 * MG) }
    svg.appendChild(svgEl('line', { x1: MG - 10, x2: LARG - MG + 12, y1: Y_AXE, y2: Y_AXE, class: 'axe', 'marker-end': 'url(#fleche)' }))
    var nomA = svgEl('text', { x: LARG - MG + 8, y: Y_AXE - 9, class: 'nom-axe', 'text-anchor': 'middle' })
    nomA.textContent = 'a'
    svg.appendChild(nomA)
    for (var v = A_MIN; v <= A_MAX + 1e-9; v += PAS) {
      var entier = Math.abs(v - Math.round(v)) < 1e-9
      var x = px(v)
      svg.appendChild(svgEl('line', { x1: x, x2: x, y1: Y_AXE - (entier ? 5 : 3), y2: Y_AXE + (entier ? 5 : 3), class: 'tick' }))
      if (entier) {
        var t = svgEl('text', { x: x, y: Y_AXE + 22, 'text-anchor': 'middle', class: 'tick-label' })
        t.textContent = String(Math.round(v)).replace('-', '−')
        svg.appendChild(t)
      }
    }
    if (this._voirDom) {
      var bas = A_MIN - 0.5, haut = A_MAX + 0.5, yb = Y_AXE - 14
      COUPLES[this._couple][this._ordre].parts.forEach(function (p) {
        var x0 = px(Math.max(p[0], bas)), x1 = px(Math.min(p[1], haut))
        svg.appendChild(svgEl('line', { x1: x0, x2: x1, y1: yb, y2: yb, class: 'dom-bande' }))
        if (isFinite(p[0])) svg.appendChild(svgEl('circle', { cx: x0, cy: yb, r: 4.5, class: p[2] ? 'dom-creux' : 'dom-plein' }))
        if (isFinite(p[1])) svg.appendChild(svgEl('circle', { cx: x1, cy: yb, r: 4.5, class: p[3] ? 'dom-creux' : 'dom-plein' }))
      })
    }
    var xa = px(this._a)
    svg.appendChild(svgEl('circle', { cx: xa, cy: Y_AXE, r: 9, class: 'pt-courant' }))
    var essais = this._essais
    Object.keys(essais).forEach(function (k) {
      var x = px(parseFloat(k))
      if (essais[k]) svg.appendChild(svgEl('circle', { cx: x, cy: Y_AXE, r: 5, class: 'pt-oui' }))
      else {
        svg.appendChild(svgEl('line', { x1: x - 4.5, x2: x + 4.5, y1: Y_AXE - 4.5, y2: Y_AXE + 4.5, class: 'pt-non' }))
        svg.appendChild(svgEl('line', { x1: x - 4.5, x2: x + 4.5, y1: Y_AXE + 4.5, y2: Y_AXE - 4.5, class: 'pt-non' }))
      }
    })
  }
}

if (!customElements.get('composer-en-un-point-widget')) {
  customElements.define('composer-en-un-point-widget', ComposerEnUnPointWidget)
}
