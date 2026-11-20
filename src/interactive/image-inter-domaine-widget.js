/* ================================================================
 * <image-inter-domaine-widget> — atelier « Image ∩ domaine » (5e, ch. 1,
 * § 3). On choisit la fonction intérieure g (appliquée d'abord) et la
 * fonction extérieure f parmi des fonctions simples (√, 1/x, x², −x², |x|,
 * affines…). Deux règles graduées : celle des VALEURS montre Im g (orange),
 * dom f (vert) et leur intersection (violet) ; celle des x montre dom g et
 * le domaine de f∘g qui s'en déduit : les x de dom g dont l'image tombe
 * dans la zone commune. Cas vide (Im g et dom f disjoints) et cas d'un seul
 * point commentés. Ensembles calculés EXACTEMENT (unions d'intervalles,
 * images réciproques écrites fonction par fonction), jamais par
 * échantillonnage. Web Component (Shadow DOM), formules en KaTeX.
 * ================================================================ */
import { styleKatex, tex, texEgalites, texNombre, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'

var INF = Infinity
function I(a, b, ao, bo) { return { a: a, b: b, ao: a === -INF ? true : ao, bo: b === INF ? true : bo } }
var R = [I(-INF, INF, true, true)]
var POSITIFS = [I(0, INF, false, true)]

// ---------- ensembles : unions d'intervalles ----------
function interInt(p, q) {
  var a, ao, b, bo
  if (p.a > q.a) { a = p.a; ao = p.ao } else if (q.a > p.a) { a = q.a; ao = q.ao } else { a = p.a; ao = p.ao || q.ao }
  if (p.b < q.b) { b = p.b; bo = p.bo } else if (q.b < p.b) { b = q.b; bo = q.bo } else { b = p.b; bo = p.bo || q.bo }
  if (a < b || (a === b && !ao && !bo)) return I(a, b, ao, bo)
  return null
}
function normaliser(S) {
  var L = S.filter(function (x) { return x && (x.a < x.b || (x.a === x.b && !x.ao && !x.bo)) })
  L.sort(function (p, q) { return p.a - q.a || (p.ao ? 1 : 0) - (q.ao ? 1 : 0) })
  var out = []
  L.forEach(function (x) {
    var der = out[out.length - 1]
    if (der && (x.a < der.b || (x.a === der.b && !(x.ao && der.bo)))) {
      if (x.b > der.b) { der.b = x.b; der.bo = x.bo } else if (x.b === der.b) der.bo = der.bo && x.bo
    } else out.push(I(x.a, x.b, x.ao, x.bo))
  })
  return out
}
function inter(S, T) {
  var out = []
  S.forEach(function (p) { T.forEach(function (q) { out.push(interInt(p, q)) }) })
  return normaliser(out)
}
function egaux(S, T) {
  if (S.length !== T.length) return false
  for (var i = 0; i < S.length; i++) {
    var p = S[i], q = T[i]
    if (p.a !== q.a || p.b !== q.b || p.ao !== q.ao || p.bo !== q.bo) return false
  }
  return true
}

// ---------- écriture des ensembles en LaTeX ----------
function texNb(v) {
  if (v === INF) return '+\\infty'
  if (v === -INF) return '-\\infty'
  if (Math.abs(v - Math.round(v)) < 1e-12) return texNombre(Math.round(v), 0)
  for (var d = 2; d <= 12; d++) {
    var n = v * d
    if (Math.abs(n - Math.round(n)) < 1e-9) return (v < 0 ? '-' : '') + '\\frac{' + Math.abs(Math.round(n)) + '}{' + d + '}'
  }
  return texNombre(v, 2)
}
function texInt(x) {
  if (x.a === x.b) return '\\{' + texNb(x.a) + '\\}'
  return (x.ao ? '\\mathopen{]}' : '[') + texNb(x.a) + '\\,;\\,' + texNb(x.b) + (x.bo ? '\\mathclose{[}' : ']')
}
function texEnsemble(S) {
  if (!S.length) return '\\varnothing'
  if (S[0].a === -INF && S[S.length - 1].b === INF) {
    // ℝ privé d'un nombre fini de points ?
    var pts = [], ok = true
    for (var i = 0; i < S.length - 1; i++) {
      if (S[i].b === S[i + 1].a && S[i].bo && S[i + 1].ao) pts.push(texNb(S[i].b)); else ok = false
    }
    if (ok) return pts.length ? '\\mathbb{R}\\setminus\\{' + pts.join('\\,;\\,') + '\\}' : '\\mathbb{R}'
  }
  return S.map(texInt).join('\\cup')
}

// ---------- fonctions intérieures : image et image réciproque exactes ----------
function preCarre(x, rac) { // { t : t² ∈ x } (rac = racine carrée) ou { t : |t| ∈ x } (rac = identité)
  var J = interInt(x, POSITIFS[0])
  if (!J) return []
  var sl = J.a === INF ? INF : rac(J.a), sh = J.b === INF ? INF : rac(J.b)
  if (J.a === 0 && !J.ao) return [I(-sh, sh, J.bo, J.bo)]
  return [I(-sh, -sl, J.bo, J.ao), I(sl, sh, J.ao, J.bo)]
}
function oppose(x) { return I(-x.b, -x.a, x.bo, x.ao) }
function decale(x, k) { return I(x.a + k, x.b + k, x.ao, x.bo) }
function preInverse(x) { // { t ≠ 0 : 1/t ∈ x }
  var out = []
  var P = interInt(x, I(0, INF, true, true))
  if (P) out.push(I(P.b === INF ? 0 : 1 / P.b, P.a === 0 ? INF : 1 / P.a, P.bo, P.ao))
  var N = interInt(x, I(-INF, 0, true, true))
  if (N) out.push(I(N.b === 0 ? -INF : 1 / N.b, N.a === -INF ? 0 : 1 / N.a, N.bo, N.ao))
  return out
}
var identite = function (v) { return v }

var INTERIEURES = [
  { tex: 'x^2', par: '(x^2)', dom: R, im: POSITIFS, pre: function (x) { return preCarre(x, Math.sqrt) } },
  { tex: '-x^2', par: '(-x^2)', dom: R, im: [I(-INF, 0, true, false)], pre: function (x) { return preCarre(oppose(x), Math.sqrt) } },
  { tex: '|x|', par: '|x|', dom: R, im: POSITIFS, pre: function (x) { return preCarre(x, identite) } },
  { tex: 'x^2+1', par: '(x^2+1)', dom: R, im: [I(1, INF, false, true)], pre: function (x) { return preCarre(decale(x, -1), Math.sqrt) } },
  {
    tex: '\\sqrt{x}', par: '(\\sqrt{x})', dom: POSITIFS, im: POSITIFS,
    pre: function (x) {
      var J = interInt(x, POSITIFS[0])
      return J ? [I(J.a * J.a, J.b === INF ? INF : J.b * J.b, J.ao, J.bo)] : []
    },
  },
  {
    tex: '\\frac{1}{x}', par: '\\left(\\frac{1}{x}\\right)', dom: [I(-INF, 0, true, true), I(0, INF, true, true)],
    im: [I(-INF, 0, true, true), I(0, INF, true, true)], pre: preInverse,
  },
  { tex: 'x-3', par: '(x-3)', dom: R, im: R, pre: function (x) { return [decale(x, 3)] } },
  { tex: '2-x', par: '(2-x)', dom: R, im: R, pre: function (x) { return [oppose(decale(x, -2))] } },
]

// Fonctions extérieures : domaine et gabarit de substitution (« # » = g(x), « @ » = g(x) entre parenthèses).
var EXTERIEURES = [
  { tex: '\\sqrt{x}', dom: POSITIFS, sub: '\\sqrt{#}' },
  { tex: '\\sqrt{x-1}', dom: [I(1, INF, false, true)], sub: '\\sqrt{#-1}' },
  { tex: '\\frac{1}{x}', dom: [I(-INF, 0, true, true), I(0, INF, true, true)], sub: '\\frac{1}{#}' },
  { tex: '\\frac{1}{x-1}', dom: [I(-INF, 1, true, true), I(1, INF, true, true)], sub: '\\frac{1}{#-1}' },
  { tex: 'x^2', dom: R, sub: '@^2' },
  { tex: '|x|', dom: R, sub: '\\left|#\\right|' },
  { tex: 'x+2', dom: R, sub: '#+2' },
]

function preimage(g, S) {
  var out = []
  S.forEach(function (x) { out = out.concat(g.pre(x)) })
  return inter(normaliser(out), g.dom)
}

var V0 = -6, V1 = 6
var LARG = 420, ML = 22, MR = 26, HAUT = 214, Y_VAL = 74, Y_X = 172
function px(v) { return ML + (Math.max(V0 - 0.6, Math.min(V1 + 0.6, v)) - (V0 - 0.6)) / (V1 - V0 + 1.2) * (LARG - ML - MR) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  '.choix-titre{text-align:center;margin:0 0 4px;}' +
  '.btn.fn{min-width:58px;}' +
  '.compo{text-align:center;margin:2px 0 10px;line-height:2.2;}' +
  '.b-im{stroke:var(--accent,#b65c1f);stroke-width:5;}.p-im{fill:var(--accent,#b65c1f);}' +
  '.b-dom{stroke:var(--good,#2f7a4f);stroke-width:5;}.p-dom{fill:var(--good,#2f7a4f);}' +
  '.b-domg{stroke:var(--sky,#2f6fb0);stroke-width:5;}.p-domg{fill:var(--sky,#2f6fb0);}' +
  '.b-res{stroke:var(--plan,#5b4ea3);stroke-width:8;opacity:0.9;}.p-res{fill:var(--plan,#5b4ea3);}' +
  '.creux{fill:var(--surface-2,#f7f9fb);stroke-width:2.2;}' +
  '.titre-regle{font-size:11.5px;font-weight:600;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);}' +
  '.sep{stroke:var(--line,#ccd8e0);stroke-width:1;stroke-dasharray:3 4;}' +
  '.vide{font-size:12px;font-weight:700;fill:var(--bad,#b23a3a);font-family:var(--sans,sans-serif);}' +
  '.legende{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 14px;font-size:0.9rem;margin:0 0 10px;}' +
  '.legende span{display:inline-flex;align-items:center;gap:5px;}' +
  '.legende i{display:inline-block;width:18px;height:5px;border-radius:2px;}' +
  '.l-im i{background:var(--accent,#b65c1f);}.l-dom i{background:var(--good,#2f7a4f);}' +
  '.l-domg i{background:var(--sky,#2f6fb0);}.l-res i{background:var(--plan,#5b4ea3);height:7px;}' +
  '.c-res{color:var(--plan-ink,#443a80);}' +
  '.alerte{border-left:4px solid var(--bad,#b23a3a);padding-left:8px;}' +
  '.note{border-left:4px solid var(--plan,#5b4ea3);padding-left:8px;}' +
  '</style>' +
  '<p class="choix-titre etiquette" id="titre-int"></p>' +
  '<div class="rangee" id="int" role="group" aria-label="Fonction intérieure"></div>' +
  '<p class="choix-titre etiquette" id="titre-ext"></p>' +
  '<div class="rangee" id="ext" role="group" aria-label="Fonction extérieure"></div>' +
  '<p class="compo" id="compo"></p>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Règle des valeurs et règle des x"></svg></div>' +
  '<div class="legende" id="legende"></div>' +
  '<div class="panneau" id="bilan"></div>'

class ImageInterDomaineWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._int = 0
    this._ext = 1
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var remplir = function (id, liste, cle, nom) {
      var zone = sh.getElementById(id)
      liste.forEach(function (fn, i) {
        var b = document.createElement('button')
        b.className = 'btn fn'
        b.innerHTML = tex(fn.tex)
        b.setAttribute('aria-label', nom + ' numéro ' + (i + 1))
        b.addEventListener('click', function () { self[cle] = i; self._rendre() })
        zone.appendChild(b)
      })
    }
    sh.getElementById('titre-int').innerHTML = 'Fonction intérieure ' + tex('g') + ' (appliquée d’abord)'
    sh.getElementById('titre-ext').innerHTML = 'Fonction extérieure ' + tex('f') + ' (appliquée ensuite)'
    remplir('int', INTERIEURES, '_int', 'Intérieure')
    remplir('ext', EXTERIEURES, '_ext', 'Extérieure')
    sh.getElementById('legende').innerHTML =
      '<span class="l-im"><i></i>' + tex('\\operatorname{Im} g') + '</span>' +
      '<span class="l-dom"><i></i>' + tex('\\operatorname{dom} f') + '</span>' +
      '<span class="l-domg"><i></i>' + tex('\\operatorname{dom} g') + '</span>' +
      '<span class="l-res"><i></i>zone commune, puis ' + tex('\\operatorname{dom}(f\\circ g)') + '</span>'
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, self = this
    var g = INTERIEURES[this._int], f = EXTERIEURES[this._ext]
    sh.querySelectorAll('#int .btn').forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === self._int)) })
    sh.querySelectorAll('#ext .btn').forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === self._ext)) })

    var formule = f.sub.replace('#', g.tex).replace('@', g.par)
    sh.getElementById('compo').innerHTML =
      tex('g(x)=' + g.tex) + '&nbsp;&nbsp; ' + tex('f(x)=' + f.tex) + '<br>' + texEgalites(['(f\\circ g)(x)', 'f\\big(g(x)\\big)', formule])

    var commun = inter(g.im, f.dom)
    var dom = preimage(g, commun)
    this._resultat = { commun: commun, dom: dom } // lu par la vérification automatique
    this._dessiner(g, f, commun, dom)

    var h = '<p>' + tex('\\operatorname{Im} g=' + texEnsemble(g.im)) + ' et ' + tex('\\operatorname{dom} f=' + texEnsemble(f.dom)) + '.</p>'
    h += '<p class="c-res">Zone commune : ' + texEgalites(['\\operatorname{Im} g\\cap\\operatorname{dom} f', texEnsemble(commun)]) + '</p>'
    if (!commun.length) {
      h += '<p class="alerte">' + tex('\\operatorname{Im} g') + ' et ' + tex('\\operatorname{dom} f') + ' ne se rencontrent jamais : ' +
        'aucune valeur ' + tex('g(x)') + ' ne peut entrer dans ' + tex('f') + '. La composée n’est définie nulle part : ' +
        tex('\\operatorname{dom}(f\\circ g)=\\varnothing') + '. Ce n’est pas une erreur de calcul, c’est une réponse valable.</p>'
      sh.getElementById('bilan').innerHTML = h
      return
    }
    h += '<p>On garde les ' + tex('x') + ' de ' + tex('\\operatorname{dom} g') + ' dont l’image tombe dans la zone commune : ' +
      texEgalites([g.tex, texEnsemble(commun)], '\\in') + '.</p>'
    h += '<p class="c-res"><strong>' + tex('\\operatorname{dom}(f\\circ g)=' + texEnsemble(dom)) + '</strong></p>'
    if (commun.length === 1 && commun[0].a === commun[0].b) {
      h += '<p class="note">Une seule valeur commune, ' + tex(texNb(commun[0].a)) + ' : on ne garde que les ' + tex('x') + ' pour lesquels ' +
        tex('g(x)=' + texNb(commun[0].a)) + '. Le domaine est réduit à ' + (dom.length === 1 && dom[0].a === dom[0].b ? 'un seul point' : 'quelques points') + '.</p>'
    } else if (egaux(commun, g.im)) {
      h += '<p class="note">Toute l’image de ' + tex('g') + ' est dans ' + tex('\\operatorname{dom} f') + ' : la seconde condition ne retire rien, ' +
        tex('\\operatorname{dom}(f\\circ g)=\\operatorname{dom} g') + '.</p>'
    } else {
      h += '<p class="note">Une partie de l’image de ' + tex('g') + ' sort de ' + tex('\\operatorname{dom} f') + ' : les ' + tex('x') + ' qui y mènent sont retirés de ' +
        tex('\\operatorname{dom} g') + '.</p>'
    }
    sh.getElementById('bilan').innerHTML = h
  }

  _bande(svg, S, y, cls, rayon) {
    S.forEach(function (x) {
      var x0 = px(x.a), x1 = px(x.b)
      if (x.a !== x.b) svg.appendChild(svgEl('line', { x1: x0, x2: x1, y1: y, y2: y, class: 'b-' + cls }))
      var bout = function (v, ouvert) {
        if (!isFinite(v) || v < V0 - 0.6 || v > V1 + 0.6) return
        svg.appendChild(svgEl('circle', { cx: px(v), cy: y, r: rayon, class: ouvert ? 'creux b-' + cls : 'p-' + cls }))
      }
      bout(x.a, x.ao)
      if (x.a !== x.b) bout(x.b, x.bo)
    })
  }

  _regle(svg, y, nom) {
    svg.appendChild(svgEl('line', { x1: ML - 8, x2: LARG - MR + 14, y1: y, y2: y, class: 'axe', 'marker-end': 'url(#fleche)' }))
    var n = svgEl('text', { x: LARG - MR + 10, y: y - 9, class: 'nom-axe', 'text-anchor': 'middle' })
    n.textContent = nom
    svg.appendChild(n)
    for (var v = V0; v <= V1; v++) {
      svg.appendChild(svgEl('line', { x1: px(v), x2: px(v), y1: y - 4, y2: y + 4, class: 'tick' }))
      var t = svgEl('text', { x: px(v), y: y + 30, 'text-anchor': 'middle', class: 'tick-label' })
      t.textContent = String(v).replace('-', '−')
      svg.appendChild(t)
    }
  }

  _dessiner(g, f, commun, dom) {
    var svg = this._sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var t1 = svgEl('text', { x: ML - 8, y: 20, class: 'titre-regle' })
    t1.textContent = 'Règle des valeurs (sorties de la fonction intérieure)'
    svg.appendChild(t1)
    this._regle(svg, Y_VAL, 'y')
    this._bande(svg, g.im, Y_VAL - 14, 'im', 4)
    this._bande(svg, f.dom, Y_VAL + 14, 'dom', 4)
    this._bande(svg, commun, Y_VAL, 'res', 5)
    svg.appendChild(svgEl('line', { x1: ML - 8, x2: LARG - MR + 14, y1: (Y_VAL + Y_X) / 2 + 4, y2: (Y_VAL + Y_X) / 2 + 4, class: 'sep' }))
    var t2 = svgEl('text', { x: ML - 8, y: Y_X - 32, class: 'titre-regle' })
    t2.textContent = 'Règle des x (entrées de la fonction intérieure)'
    svg.appendChild(t2)
    this._regle(svg, Y_X, 'x')
    this._bande(svg, g.dom, Y_X - 14, 'domg', 4)
    this._bande(svg, dom, Y_X, 'res', 5)
    if (!commun.length) {
      var v1 = svgEl('text', { x: LARG - MR - 2, y: Y_VAL - 28, 'text-anchor': 'end', class: 'vide' })
      v1.textContent = 'aucune valeur commune'
      svg.appendChild(v1)
    }
    if (!dom.length) {
      var v2 = svgEl('text', { x: LARG - MR - 2, y: Y_X - 32, 'text-anchor': 'end', class: 'vide' })
      v2.textContent = 'domaine vide'
      svg.appendChild(v2)
    }
  }
}

if (!customElements.get('image-inter-domaine-widget')) {
  customElements.define('image-inter-domaine-widget', ImageInterDomaineWidget)
}
