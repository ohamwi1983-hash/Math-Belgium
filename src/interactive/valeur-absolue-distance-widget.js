/* ================================================================
 * <valeur-absolue-distance-widget> — atelier « Valeur absolue et
 * distance » (5e (6h), nombres réels, étape « valeur absolue »).
 * |x − a| est la distance entre x et a sur la droite des réels.
 * L'élève règle a et r, choisit le symbole (<, ≤, =, ≥, >) : les
 * solutions de |x − a| ◇ r s'allument sur la droite (segment vert,
 * bornes pleines si elles sont comprises, creuses sinon) et s'écrivent
 * en intervalles, avec la chaîne d'équivalences. Un point x se glisse
 * sur la droite (ou au curseur) : sa distance à a est mesurée et
 * comparée à r. Cas particuliers : r = 0 ({a}, ∅, ℝ, ℝ∖{a}) et r < 0
 * (une distance n'est jamais négative : ∅ ou ℝ). Droite FIXE de −10
 * à 10 ; a de −6 à 6, r de −2 à 6, x de −10 à 10, au pas de 0,5.
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, texIntervalle, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import { CSS_STAT, el, texte } from './statistique-deux-variables-commun.js'
import { CSS_RS, insecables, nb, texNb, droiteGraduee } from './nombres-reels-suites-commun.js'

var MIN = -10, MAX = 10, L = 460, H = 158, X0 = 22, X1 = 430, YD = 92
var SYMBOLES = [
  { id: 'lt', txt: '<', tex: '<', nom: 'strictement inférieure à' },
  { id: 'le', txt: '≤', tex: '\\leq ', nom: 'inférieure ou égale à' },
  { id: 'eq', txt: '=', tex: '=', nom: 'égale à' },
  { id: 'ge', txt: '≥', tex: '\\geq ', nom: 'supérieure ou égale à' },
  { id: 'gt', txt: '>', tex: '>', nom: 'strictement supérieure à' },
]
function px(v) { return X0 + (v - MIN) * (X1 - X0) / (MAX - MIN) }
function compare(d, s, r) {
  return s === 'lt' ? d < r - 1e-9 : s === 'le' ? d <= r + 1e-9 : s === 'eq' ? Math.abs(d - r) < 1e-9 : s === 'ge' ? d >= r - 1e-9 : d > r + 1e-9
}
/** |x − a| en LaTeX : |x|, |x − 2|, |x + 3{,}5|. */
function texAbs(a) { return a === 0 ? '|x|' : '|x' + (a > 0 ? '-' : '+') + texNb(Math.abs(a), 1) + '|' }
function txtAbs(a) { return a === 0 ? '|x|' : '|x ' + (a > 0 ? '− ' : '+ ') + nb(Math.abs(a), 1) + '|' }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + CSS_RS +
  '.figure svg{max-width:520px;}' +
  '.pt-a{fill:var(--accent,#b65c1f);}' +
  '.mesure{stroke:var(--sky,#2f6fb0);stroke-width:2;fill:none;}' +
  '.rayon{stroke:var(--accent,#b65c1f);stroke-width:1.4;fill:none;stroke-dasharray:4 3;}' +
  '.pt-x-ok{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
  '.pt-x-ko{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:1.5;}' +
  '.symb .btn{min-width:52px;font-size:1.05rem;}' +
  '</style>' +
  '<p class="consigne">Choisis le symbole, règle a et r : les solutions de l’inéquation s’allument en vert. Fais glisser le point x sur la droite.</p>' +
  '<div class="rangee symb" role="group" aria-label="Symbole" id="symboles">' +
  SYMBOLES.map(function (s) { return '<button class="btn" data-s="' + s.id + '" aria-label="' + s.nom + '">' + s.txt + '</button>' }).join('') + '</div>' +
  '<p class="formule grand" id="enonce"></p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + L + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Droite des réels"></svg></div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('a', 'Centre a', -6, 6, 0.5) + curseurHTML('r', 'Distance r', -2, 6, 0.5) + curseurHTML('x', 'Point x', MIN, MAX, 0.5) + '</div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class ValeurAbsolueDistanceWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._a = 3
    this._r = 2
    this._x = -1
    this._s = 'le'
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.getElementById('symboles').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-s]')
      if (b) { self._s = b.getAttribute('data-s'); self._rendre() }
    })
    function lier(id, cle, min, max) {
      function regler(v) { self[cle] = borner(Math.round(v * 2) / 2, min, max); self._rendre() }
      sh.getElementById(id).addEventListener('input', function (e) { regler(parseFloat(e.target.value)) })
      sh.getElementById(id + '-moins').addEventListener('click', function () { regler(self[cle] - 0.5) })
      sh.getElementById(id + '-plus').addEventListener('click', function () { regler(self[cle] + 0.5) })
    }
    lier('a', '_a', -6, 6)
    lier('r', '_r', -2, 6)
    lier('x', '_x', MIN, MAX)
    // glisser le point x (capture du pointeur sur la <svg>, qui survit aux rendus)
    var prise = false
    function valeur(e) {
      var ctm = svg.getScreenCTM()
      if (!ctm) return null
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY
      var q = pt.matrixTransform(ctm.inverse())
      return borner(Math.round((MIN + (q.x - X0) * (MAX - MIN) / (X1 - X0)) * 2) / 2, MIN, MAX)
    }
    svg.addEventListener('pointerdown', function (e) {
      var v = valeur(e)
      if (v === null) return
      e.preventDefault()
      prise = true
      try { svg.setPointerCapture(e.pointerId) } catch (err) { /* rien */ }
      self._x = v; self._rendre()
    })
    svg.addEventListener('pointermove', function (e) {
      if (!prise) return
      e.preventDefault()
      var v = valeur(e)
      if (v !== null && v !== self._x) { self._x = v; self._rendre() }
    })
    function fin(e) { if (!prise) return; prise = false; try { svg.releasePointerCapture(e.pointerId) } catch (err) { /* rien */ } }
    svg.addEventListener('pointerup', fin)
    svg.addEventListener('pointercancel', fin)
    this._rendre()
  }

  /** Ensemble des solutions : { morceaux: [[g, d, gFerme, dFerme]], points: [v], exclus: [v], vide, tout }. */
  _solutions() {
    var a = this._a, r = this._r, s = this._s
    var S = { morceaux: [], points: [], exclus: [] }
    if (r < 0) {
      if (s === 'ge' || s === 'gt') S.morceaux.push([-Infinity, Infinity, false, false]); else S.vide = true
      return S
    }
    if (r === 0) {
      if (s === 'lt') S.vide = true
      else if (s === 'le' || s === 'eq') S.points.push(a)
      else if (s === 'ge') S.morceaux.push([-Infinity, Infinity, false, false])
      else { S.morceaux.push([-Infinity, a, false, false], [a, Infinity, false, false]); S.exclus.push(a) }
      return S
    }
    var g = a - r, d = a + r
    if (s === 'le') S.morceaux.push([g, d, true, true])
    else if (s === 'lt') S.morceaux.push([g, d, false, false])
    else if (s === 'eq') S.points.push(g, d)
    else if (s === 'ge') S.morceaux.push([-Infinity, g, false, true], [d, Infinity, true, false])
    else S.morceaux.push([-Infinity, g, false, false], [d, Infinity, false, false])
    return S
  }

  /** L'ensemble des solutions en LaTeX. */
  _texSolutions(S) {
    var a = this._a, r = this._r, s = this._s
    if (S.vide) return '\\varnothing'
    if (r === 0 && s === 'gt') return '\\mathbb{R}\\setminus\\{' + texNb(a, 1) + '\\}'
    if (S.morceaux.length === 1 && S.morceaux[0][0] === -Infinity && S.morceaux[0][1] === Infinity) return '\\mathbb{R}'
    if (S.points.length) return '\\{' + S.points.map(function (v) { return texNb(v, 1) }).join('\\,;\\,') + '\\}'
    return S.morceaux.map(function (m) {
      return texIntervalle(m[0] === -Infinity ? '-\\infty' : texNb(m[0], 1), m[1] === Infinity ? '+\\infty' : texNb(m[1], 1), !m[2], !m[3])
    }).join('\\cup')
  }

  _rendre() {
    this._dessiner()
    insecables(this._sh)
  }

  _dessiner() {
    var sh = this._sh, a = this._a, r = this._r, x = this._x, s = this._s
    var sym = SYMBOLES.filter(function (o) { return o.id === s })[0]
    sh.querySelectorAll('[data-s]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-s') === s)) })
    majCurseur(sh, 'a', a, 'a=' + texNb(a, 1))
    majCurseur(sh, 'r', r, 'r=' + texNb(r, 1))
    majCurseur(sh, 'x', x, 'x=' + texNb(x, 1))
    var S = this._solutions(), d = Math.abs(x - a), ok = compare(d, s, r)
    sh.getElementById('enonce').innerHTML = tex(texAbs(a) + sym.tex + texNb(r, 1))

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    droiteGraduee(svg, { min: MIN, max: MAX, x0: X0, x1: X1, y: YD, pas: 1, etiqPas: 2, etiq: function (v) { return nb(v, 0) } })
    // solutions
    S.morceaux.forEach(function (m) {
      var g = m[0] === -Infinity ? X0 - 4 : px(m[0]), dd = m[1] === Infinity ? X1 + 4 : px(m[1])
      if (dd > g) el('line', { x1: g.toFixed(1), y1: YD, x2: dd.toFixed(1), y2: YD, class: 'segment-solution' }, svg)
    })
    S.morceaux.forEach(function (m) {
      if (m[0] !== -Infinity && !(r === 0 && s === 'gt')) el('circle', { cx: px(m[0]).toFixed(1), cy: YD, r: 5, class: m[2] ? 'point-inclus' : 'point-exclus' }, svg)
      if (m[1] !== Infinity && !(r === 0 && s === 'gt')) el('circle', { cx: px(m[1]).toFixed(1), cy: YD, r: 5, class: m[3] ? 'point-inclus' : 'point-exclus' }, svg)
    })
    S.exclus.forEach(function (v) { el('circle', { cx: px(v).toFixed(1), cy: YD, r: 5, class: 'point-exclus' }, svg) })
    S.points.forEach(function (v) { el('circle', { cx: px(v).toFixed(1), cy: YD, r: 5.5, class: 'point-inclus' }, svg) })
    // rayon r de part et d'autre de a (sous la droite)
    if (r > 0) {
      var yr = YD + 40
      ;[-1, 1].forEach(function (sg) {
        var p1 = px(a), p2 = px(a + sg * r)
        el('path', { d: 'M' + p1.toFixed(1) + ',' + (YD + 26) + ' V' + yr + ' H' + p2.toFixed(1) + ' V' + (YD + 26), class: 'rayon' }, svg)
        texte(svg, (p1 + p2) / 2, yr + 14, 'r', 'et et-acc et-petit')
      })
    }
    // centre a
    el('path', { d: 'M' + px(a).toFixed(1) + ',' + (YD - 7) + ' l-6,-10 h12 z', class: 'pt-a' }, svg)
    var droite = x >= a
    if (x === a) texte(svg, px(a) + 10, YD - 14, 'x = a', 'et et-acc', 'start')
    else {
      texte(svg, px(a) + (droite ? -9 : 9), YD - 13, 'a', 'et et-acc', droite ? 'end' : 'start')
      texte(svg, px(x) + (droite ? 11 : -11), YD - 13, 'x', 'et ' + (ok ? 'et-good' : 'et-bad'), droite ? 'start' : 'end')
    }
    // distance de x à a (au-dessus)
    var ym = 28, px1 = px(Math.min(a, x)), px2 = px(Math.max(a, x))
    el('path', { d: 'M' + px1.toFixed(1) + ',' + (ym + 6) + ' V' + ym + ' H' + px2.toFixed(1) + ' V' + (ym + 6), class: 'mesure' }, svg)
    var lab = 'distance ' + nb(d, 1), cx = (px1 + px2) / 2, demi = lab.length * 3.6
    texte(svg, Math.max(demi + 2, Math.min(L - demi - 2, cx)), ym - 7, lab, 'et et-sky et-petit')
    el('line', { x1: px(x).toFixed(1), y1: ym + 6, x2: px(x).toFixed(1), y2: YD - 8, class: 'trait-soft pointille fin' }, svg)
    el('circle', { cx: px(x).toFixed(1), cy: YD, r: 8, class: ok ? 'pt-x-ok' : 'pt-x-ko' }, svg)
    svg.setAttribute('aria-label', 'Droite des réels de −10 à 10 : a = ' + nb(a, 1) + ', r = ' + nb(r, 1) + ', point x = ' + nb(x, 1) + ' à distance ' + nb(d, 1) + ' de a')

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict')
    v.className = 'verdict ' + (ok ? 'ok' : 'ko')
    v.textContent = 'x = ' + nb(x, 1) + ' : ' + txtAbs(a).replace('x', nb(x, 1).charAt(0) === '−' ? '(' + nb(x, 1) + ')' : nb(x, 1)) + ' = ' + nb(d, 1) +
      (ok ? ', et ' + nb(d, 1) + ' ' + sym.txt + ' ' + nb(r, 1) + ' : x est solution.' : ', et ' + nb(d, 1) + ' ' + sym.txt + ' ' + nb(r, 1) + ' est faux : x n’est pas solution.')

    // ---------- Panneau ----------
    var h = '<p class="titre-panneau">Lecture en distance</p>'
    h += '<p class="ligne">' + tex(texAbs(a)) + (a === 0 ? ' est la distance entre ' + tex('x') + ' et ' + tex('0') : ' est la distance entre ' + tex('x') + ' et ' + tex(texNb(a, 1))) +
      (a < 0 ? ' (car ' + tex('x+' + texNb(-a, 1) + '=x-(' + texNb(a, 1) + ')') + ')' : '') + ' : on cherche les réels dont la distance à ' + tex(texNb(a, 1)) + ' est ' + sym.nom + ' ' + tex(texNb(r, 1)) + '.</p>'
    if (r < 0) {
      h += '<p class="ligne">Une distance n’est jamais négative : ' + tex(texAbs(a) + '\\geq 0>' + texNb(r, 1)) + ' pour tout réel ' + tex('x') + '.</p>'
    } else if (r === 0) {
      h += '<p class="ligne">' + tex(texAbs(a) + '=0') + ' seulement pour ' + tex('x=' + texNb(a, 1)) + ' ; partout ailleurs, la distance est strictement positive.</p>'
    } else {
      var ga = texNb(a - r, 1), da = texNb(a + r, 1), xa = a === 0 ? 'x' : 'x' + (a > 0 ? '-' : '+') + texNb(Math.abs(a), 1)
      if (s === 'le' || s === 'lt') {
        var rel = s === 'le' ? '\\leq ' : '<'
        h += '<p class="ligne">' + texEgalites([texAbs(a) + rel + texNb(r, 1), '\\iff ' + texNb(-r, 1) + rel + xa + rel + texNb(r, 1), '\\iff ' + ga + rel + 'x' + rel + da], ' ') + '</p>'
      } else if (s === 'eq') {
        h += '<p class="ligne">' + texEgalites([texAbs(a) + '=' + texNb(r, 1), '\\iff ' + xa + '=' + texNb(-r, 1) + '\\text{ ou }' + xa + '=' + texNb(r, 1), '\\iff x=' + ga + '\\text{ ou }x=' + da], ' ') + '</p>'
      } else {
        var rl = s === 'ge' ? '\\geq ' : '>', rg = s === 'ge' ? '\\leq ' : '<'
        h += '<p class="ligne">' + texEgalites([texAbs(a) + rl + texNb(r, 1), '\\iff ' + xa + rg + texNb(-r, 1) + '\\text{ ou }' + xa + rl + texNb(r, 1), '\\iff x' + rg + ga + '\\text{ ou }x' + rl + da], ' ') + '</p>'
      }
    }
    h += '<p class="ligne"><strong>Solutions :</strong> ' + tex('S=' + this._texSolutions(S)) + '</p>'
    if (r > 0) h += '<p class="note">Les bornes ' + tex('a-r') + ' et ' + tex('a+r') + ' sont ' + (s === 'le' || s === 'ge' || s === 'eq' ? 'comprises (point plein) : à ces endroits, la distance vaut exactement r.' : 'exclues (point creux) : à ces endroits, la distance vaut exactement r, ce que le symbole strict refuse.') + '</p>'
    sh.getElementById('infos').innerHTML = h
  }
}

if (!customElements.get('valeur-absolue-distance-widget')) customElements.define('valeur-absolue-distance-widget', ValeurAbsolueDistanceWidget)
