/* ================================================================
 * <reduire-translation-widget> — atelier « Réduire par translation »
 * (6e, ch. 10, § 2). Équation mx² + ny² + rx + sy + t = 0 (pas de terme
 * en xy) ; m, n, r, s, t entiers réglés aux curseurs (t peut aussi être
 * posé à la valeur exacte qui annule le second membre). La méthode du
 * cours s'affiche pas à pas, en valeurs EXACTES (fractions, racines
 * simplifiées) : regroupement, carrés complétés, second membre K,
 * division par K, translation x′ = x − h, y′ = y − k, nature et
 * éléments dans le repère donné R₁. Tous les cas : ellipse (cercle si
 * m = n), hyperbole (axe focal selon le signe), cas dégénérés (un
 * point, vide, deux droites sécantes), parabole quand m ou n vaut 0
 * (convention Y² = 2pX : sommet, foyer à p/2, directrice), deux
 * droites parallèles, une droite double, et « pas une conique » si
 * m = n = 0. Figure : la courbe dans R₁, les axes translatés x′ et y′
 * (pointillés violets), centre ou sommet, foyers, asymptotes.
 * Préréglages, dont l'exemple résolu du cours
 * 16x² − 36y² + 80x + 252y − 197 = 0. Repère orthonormé à fenêtre FIXE.
 * Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX, placeurEtiquettes } from './lieux-geometriques-commun.js'
import { Q, qAdd, qSub, qMul, qDiv, qNeg, qNum, qSigne, texQ, texRacineQ, racineRationnelle, cheminPts, groupeCadre, ptsEllipse, ptsHyperbole, ptsParabole, CSS_CONIQUES } from './coniques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -10, xMax: 10, yMin: -8, yMax: 8 }
var R = G.repere(FEN, 17, 14)
var BORNES = { m: [-40, 40], n: [-40, 40], r: [-300, 300], s: [-300, 300], t: [-500, 500] }
var PRESETS = {
  cours: { nom: 'Exemple du cours', v: [16, -36, 80, 252, -197] },
  ellipse: { nom: 'Ellipse', v: [4, 9, -16, 18, -11] },
  cercle: { nom: 'Cercle', v: [1, 1, -4, 6, -12] },
  parabole: { nom: 'Parabole', v: [0, 1, -4, -2, 9] },
  point: { nom: 'Un point', v: [4, 9, -16, 18, 25] },
  vide: { nom: 'Vide', v: [4, 9, -16, 18, 40] },
  droites: { nom: 'Deux droites', v: [1, -4, -2, 8, -3] },
  paralleles: { nom: 'Droites parallèles', v: [0, 1, 0, -2, -8] },
}

/** « 16x^2-36y^2+80x+252y-197 » à partir de [coef (rationnel), monôme]. */
function texPolyQ(termes) {
  var s = ''
  termes.forEach(function (t) {
    var c = t[0], m = t[1]
    if (c.n === 0) return
    var abs = Q(Math.abs(c.n), c.d)
    var corps = m ? (abs.n === 1 && abs.d === 1 ? m : texQ(abs) + m) : texQ(abs)
    s += (s ? (c.n < 0 ? '-' : '+') : (c.n < 0 ? '-' : '')) + corps
  })
  return s || '0'
}
/** (x − h)² en LaTeX : « x^2 » si h = 0. */
function carre(v, h) {
  if (h.n === 0) return v + '^2'
  return '\\left(' + v + (h.n > 0 ? '-' : '+') + texQ(Q(Math.abs(h.n), h.d)) + '\\right)^2'
}
/** Coefficient devant une parenthèse : « », « - », « 16 », « -36 ». */
function coefPar(c) { return c === 1 ? '' : c === -1 ? '-' : String(c) }
/** Groupe c(v² + (l/c)v) en LaTeX. */
function groupe(c, l, v) {
  if (l === 0) return coefPar(c) + v + '^2'
  var q = Q(l, c)
  return coefPar(c) + '\\left(' + v + '^2' + (q.n < 0 ? '-' : '+') + (q.n === q.d || -q.n === q.d ? '' : texQ(Q(Math.abs(q.n), q.d))) + v + '\\right)'
}
/** Somme LaTeX « A + B » de deux morceaux dont le second peut commencer par « - ». */
function plus(a, b) { return b.charAt(0) === '-' ? a + b : a + '+' + b }
function coord(x, y) { return '\\left(' + x + '\\,;' + y + '\\right)' }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_CONIQUES +
  '.etapes p{line-height:2;margin:0 0 4px;}' +
  '.num{display:inline-block;min-width:1.6em;font-weight:700;color:var(--ink-soft,#51626f);}' +
  '</style>' +
  '<div class="rangee presets" role="group" aria-label="Exemples">' +
  Object.keys(PRESETS).map(function (k) { return '<button class="btn" data-p="' + k + '">' + PRESETS[k].nom + '</button>' }).join('') + '</div>' +
  '<p class="consigne">Règle les coefficients de mx² + ny² + rx + sy + t = 0 (pas de terme en xy).</p>' +
  '<p class="formule" id="equation"></p>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="La conique dans le repère donné, avec les axes translatés"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' +
  curseurHTML('m', 'Coefficient m', BORNES.m[0], BORNES.m[1], 1) + curseurHTML('n', 'Coefficient n', BORNES.n[0], BORNES.n[1], 1) +
  curseurHTML('r', 'Coefficient r', BORNES.r[0], BORNES.r[1], 1) + curseurHTML('s', 'Coefficient s', BORNES.s[0], BORNES.s[1], 1) +
  curseurHTML('t', 'Coefficient t', BORNES.t[0], BORNES.t[1], 1) + '</div>' +
  '<div class="rangee"><button class="btn" id="limite">Choisir t pour un second membre nul</button></div>' +
  '<div class="panneau etapes" id="etapes" aria-live="polite"></div>'

class ReduireTranslationWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._poser(PRESETS.cours.v)
  }

  _poser(v) { this._c = { m: v[0], n: v[1], r: v[2], s: v[3] }; this._t = Q(v[4]) }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () { self._poser(PRESETS[b.getAttribute('data-p')].v); self._rendre() })
    })
    ;['m', 'n', 'r', 's', 't'].forEach(function (k) {
      function regle(v) {
        v = borner(Math.round(v), BORNES[k][0], BORNES[k][1])
        if (k === 't') self._t = Q(v); else self._c[k] = v
        self._rendre()
      }
      function courant() { return k === 't' ? qNum(self._t) : self._c[k] }
      sh.getElementById(k).addEventListener('input', function (e) { regle(parseFloat(e.target.value)) })
      sh.getElementById(k + '-moins').addEventListener('click', function () { var c = courant(); regle(Number.isInteger(c) ? c - 1 : Math.floor(c)) })
      sh.getElementById(k + '-plus').addEventListener('click', function () { var c = courant(); regle(Number.isInteger(c) ? c + 1 : Math.ceil(c)) })
    })
    sh.getElementById('limite').addEventListener('click', function () {
      var L = self._limite()
      if (L) { self._t = L; self._rendre() }
    })
    this._rendre()
  }

  /** Valeur de t qui annule le second membre après complétion (null si sans objet). */
  _limite() {
    var c = this._c, z = Q(0)
    if (c.m === 0 && c.n === 0) return null
    if ((c.m === 0 && c.r !== 0) || (c.n === 0 && c.s !== 0)) return null // parabole : pas de second membre à annuler
    var v = z
    if (c.m !== 0) v = qAdd(v, Q(c.r * c.r, 4 * c.m))
    if (c.n !== 0) v = qAdd(v, Q(c.s * c.s, 4 * c.n))
    return v
  }

  /** Analyse complète : { lignes (LaTeX), verdict, cls, dessin }. */
  _analyse() {
    var c = this._c, m = c.m, n = c.n, r = c.r, s = c.s, t = this._t
    var A = { lignes: [], dessin: { type: 'rien' } }
    function L(txt) { A.lignes.push(txt) }
    if (m === 0 && n === 0) {
      A.cls = 'ko'; A.verdict = 'm = n = 0 : il n’y a plus de terme du second degré, ce n’est pas une conique.'
      if (r !== 0 || s !== 0) { L('Il reste ' + tex(texPolyQ([[Q(r), 'x'], [Q(s), 'y'], [t, '']]) + '=0') + ' : une droite.'); A.dessin = { type: 'droite', a: r, b: s, c: qNum(t) } }
      else { L('Il reste ' + tex(texQ(t) + '=0') + ' : ' + (t.n === 0 ? 'tout le plan.' : 'aucun point.')) }
      return A
    }
    // ---- m et n non nuls : centre (h ; k) ----
    if (m !== 0 && n !== 0) {
      var h = Q(-r, 2 * m), k = Q(-s, 2 * n)
      L('<span class="num">1)</span>' + tex(plus(groupe(m, r, 'x'), groupe(n, s, 'y')) + '=' + texQ(qNeg(t))))
      var morceaux = [qNeg(t), Q(r * r, 4 * m), Q(s * s, 4 * n)]
      var K = qAdd(qAdd(morceaux[0], morceaux[1]), morceaux[2])
      var membre = texQ(morceaux[0])
      if (r !== 0) membre = plus(membre, texQ(morceaux[1]))
      if (s !== 0) membre = plus(membre, texQ(morceaux[2]))
      L('<span class="num">2)</span>' + tex(plus(coefPar(m) + carre('x', h), coefPar(n) + carre('y', k))) + ' ' + tex('=' + membre) + (r === 0 && s === 0 ? '' : ' ' + tex('=' + texQ(K))) +
        ' <span class="note">(on ajoute aux deux membres ce qui complète chaque carré)</span>')
      L('<span class="num">3)</span>Translation ' + tex("x'=" + texPolyQ([[Q(1), 'x'], [qNeg(h), '']])) + ', ' + tex("y'=" + texPolyQ([[Q(1), 'y'], [qNeg(k), '']])) +
        ', nouvelle origine ' + tex("O'" + coord(texQ(h), texQ(k))) + ' : ' + tex(plus(coefPar(m) + "x'^2", coefPar(n) + "y'^2") + '=' + texQ(K)))
      A.centre = [qNum(h), qNum(k)]
      if (K.n === 0) {
        if (m * n > 0) {
          A.cls = 'neutre'; A.verdict = 'Second membre nul et m, n de même signe : un seul point, le centre O′. Cas dégénéré.'
          L('<span class="num">4)</span>Une somme de deux carrés de même signe est nulle seulement si les deux le sont : ' + tex("x'=y'=0") + ', le point ' + tex("O'" + coord(texQ(h), texQ(k))) + '.')
          A.dessin = { type: 'point' }
        } else {
          var q = Q(-m, n) // y'² = q x'²
          var rq = texRacineQ(q)
          A.cls = 'neutre'; A.verdict = 'Second membre nul et m, n de signes contraires : deux droites sécantes en O′. Cas dégénéré.'
          L('<span class="num">4)</span>' + tex("y'^2=" + texQ(q) + "x'^2") + ' ⟺ ' + tex("y'=" + rq + "x'") + ' ou ' + tex("y'=-" + rq + "x'") + ' : deux droites qui se coupent en ' + tex("O'") + '.')
          A.dessin = { type: 'secantes', pente: Math.sqrt(qNum(q)) }
        }
        return A
      }
      var dx = qDiv(K, Q(m)), dy = qDiv(K, Q(n)) // x'²/dx + y'²/dy = 1
      L('<span class="num">4)</span>On divise par ' + tex(texQ(K)) + (qSigne(K) < 0 ? ' <span class="c-attn">(un nombre négatif : les signes changent)</span>' : '') + ' : ' +
        tex("\\frac{x'^2}{" + texQ(dx) + "}+\\frac{y'^2}{" + texQ(dy) + '}=1'))
      if (qSigne(dx) < 0 && qSigne(dy) < 0) {
        A.cls = 'ko'; A.verdict = 'Les deux dénominateurs sont négatifs : aucun point (une somme de carrés ne peut pas être négative). Cas dégénéré : vide.'
        L('<span class="num">5)</span>' + tex(plus(coefPar(m) + "x'^2", coefPar(n) + "y'^2")) + ' est ' + (m > 0 ? 'positif ou nul' : 'négatif ou nul') + ', il ne vaut jamais ' + tex(texQ(K)) + ' : l’ensemble est vide.')
        return A
      }
      if (qSigne(dx) > 0 && qSigne(dy) > 0) {
        var horiz = qNum(dx) >= qNum(dy), a2 = horiz ? dx : dy, b2 = horiz ? dy : dx, c2 = qSub(a2, b2)
        var a = Math.sqrt(qNum(a2)), b = Math.sqrt(qNum(b2)), cc = Math.sqrt(qNum(c2))
        if (c2.n === 0) {
          A.cls = 'ok'; A.verdict = 'm = n : un cercle (une ellipse dont les deux foyers sont confondus au centre).'
          L('<span class="num">5)</span>Cercle de centre ' + tex("O'" + coord(texQ(h), texQ(k))) + ' et de rayon ' + tex('\\sqrt{' + texQ(a2) + '}=' + texRacineQ(a2)) + '.')
        } else {
          A.cls = 'ok'; A.verdict = 'Deux carrés additionnés égaux à 1 : une ellipse, d’axe focal ' + (horiz ? 'horizontal' : 'vertical') + ' (le plus grand dénominateur est sous ' + (horiz ? 'x′²' : 'y′²') + ').'
          L('<span class="num">5)</span>' + tex('a=' + texRacineQ(a2)) + ', ' + tex('b=' + texRacineQ(b2)) + ', ' + tex('c=\\sqrt{a^2-b^2}=' + texRacineQ(c2)) + '.')
          var tc = texRacineQ(c2)
          L('Dans ' + tex('R_1') + ' : centre ' + tex("O'" + coord(texQ(h), texQ(k))) + ', foyers ' +
            tex(horiz ? coord(texQ(h) + '\\pm' + tc, texQ(k)) : coord(texQ(h), texQ(k) + '\\pm' + tc)).replace(/\(0\\pm/, '(\\pm') + '.')
        }
        A.dessin = { type: 'ellipse', horiz: horiz, a: a, b: b, c: cc }
        return A
      }
      // hyperbole
      var horizH = qSigne(dx) > 0, a2h = horizH ? dx : dy, b2h = qNeg(horizH ? dy : dx), c2h = qAdd(a2h, b2h)
      var ah = Math.sqrt(qNum(a2h)), bh = Math.sqrt(qNum(b2h))
      A.cls = 'ok'; A.verdict = 'Deux carrés soustraits égaux à 1 : une hyperbole, d’axe focal ' + (horizH ? 'horizontal' : 'vertical') + ' (le carré positif est ' + (horizH ? 'x′²' : 'y′²') + ').'
      L('<span class="num">5)</span>' + tex(horizH ? "\\frac{x'^2}{" + texQ(a2h) + "}-\\frac{y'^2}{" + texQ(b2h) + '}=1' : "\\frac{y'^2}{" + texQ(a2h) + "}-\\frac{x'^2}{" + texQ(b2h) + '}=1') +
        ' : ' + tex('a=' + texRacineQ(a2h)) + ', ' + tex('b=' + texRacineQ(b2h)) + ', ' + tex('c=\\sqrt{a^2+b^2}=' + texRacineQ(c2h)) + '.')
      var pente = horizH ? qDiv(b2h, a2h) : qDiv(a2h, b2h) // carré de la pente des asymptotes
      var tp = texRacineQ(pente)
      L('Dans ' + tex('R_1') + ' : centre ' + tex("O'" + coord(texQ(h), texQ(k))) + ', foyers ' +
        tex(horizH ? coord(texQ(h) + '\\pm' + texRacineQ(c2h), texQ(k)) : coord(texQ(h), texQ(k) + '\\pm' + texRacineQ(c2h))) +
        ', asymptotes ' + tex("y'=\\pm" + tp + "\\,x'") + '.')
      A.dessin = { type: 'hyperbole', horiz: horizH, a: ah, b: bh, c: Math.sqrt(qNum(c2h)) }
      return A
    }
    // ---- un seul carré : parabole, droites parallèles ----
    var enX = m !== 0 // le carré porte sur x
    var cq = enX ? m : n, lq = enX ? r : s, lin = enX ? s : r, vq = enX ? 'x' : 'y', vl = enX ? 'y' : 'x'
    var hq = Q(-lq, 2 * cq)
    L('<span class="num">1)</span>' + tex(groupe(cq, lq, vq) + '=' + texPolyQ([[Q(-lin), vl], [qNeg(t), '']])))
    var droite = qAdd(qNeg(t), Q(lq * lq, 4 * cq)) // second membre constant après complétion
    L('<span class="num">2)</span>' + tex(coefPar(cq) + carre(vq, hq)) + ' ' + tex('=' + texPolyQ([[Q(-lin), vl], [droite, '']])))
    if (lin !== 0) {
      // c(v − hq)² = −lin (w − w0), w0 = droite/lin
      var w0 = qDiv(droite, Q(lin)), deuxP = Q(-lin, cq), p = Q(Math.abs(lin), 2 * Math.abs(cq))
      var Sx = enX ? hq : w0, Sy = enX ? w0 : hq
      L('<span class="num">3)</span>' + tex(carre(vq, hq) + '=' + texQ(deuxP) + '\\left(' + texPolyQ([[Q(1), vl], [qNeg(w0), '']]) + '\\right)') +
        ' ; translation vers le sommet ' + tex('S' + coord(texQ(Sx), texQ(Sy))) + ' : ' + tex(vq + "'^2=" + texQ(deuxP) + vl + "'"))
      var sens = qSigne(deuxP) > 0
      var dir = enX ? (sens ? 'le haut' : 'le bas') : (sens ? 'la droite' : 'la gauche')
      A.cls = 'ok'; A.verdict = 'Un seul carré, l’autre variable au premier degré : une parabole, ouverte vers ' + dir + '.'
      var demi = Q(p.n, 2 * p.d), sg = sens ? 1 : -1
      var Fx = enX ? Sx : qAdd(Sx, qMul(Q(sg), demi)), Fy = enX ? qAdd(Sy, qMul(Q(sg), demi)) : Sy
      var dirTex = enX ? 'y=' + texQ(qSub(Sy, qMul(Q(sg), demi))) : 'x=' + texQ(qSub(Sx, qMul(Q(sg), demi)))
      L('<span class="num">4)</span>' + tex('2p=' + texQ(Q(Math.abs(deuxP.n), deuxP.d))) + ', donc ' + tex('p=' + texQ(p)) + ' ; foyer ' + tex('F' + coord(texQ(Fx), texQ(Fy))) + ' à ' + tex('\\frac{p}{2}') + ' du sommet, directrice ' + tex('d\\equiv ' + dirTex) + '.')
      A.centre = [qNum(Sx), qNum(Sy)]
      A.dessin = { type: 'parabole', enX: enX, p: qNum(p), sens: sg, F: [qNum(Fx), qNum(Fy)] }
      return A
    }
    var val = qDiv(droite, Q(cq)) // (v − hq)² = val
    L('<span class="num">3)</span>' + tex(carre(vq, hq) + '=' + texQ(val)) + ' : l’autre variable a disparu.')
    if (val.n > 0) {
      var rv = texRacineQ(val), v1, v2
      if (racineRationnelle(val)) { var rq = Q(Math.round(Math.sqrt(val.n)), Math.round(Math.sqrt(val.d))); v1 = texQ(qAdd(hq, rq)); v2 = texQ(qSub(hq, rq)) }
      else { v1 = hq.n === 0 ? rv : texQ(hq) + '+' + rv; v2 = (hq.n === 0 ? '' : texQ(hq)) + '-' + rv }
      A.cls = 'neutre'; A.verdict = 'Un seul carré et plus aucun terme en ' + vl + ' : deux droites parallèles. Cas dégénéré.'
      L('<span class="num">4)</span>' + tex(vq + '=' + v1) + ' ou ' + tex(vq + '=' + v2) + ' : deux droites parallèles à l’axe des ' + (enX ? 'ordonnées' : 'abscisses') + '.')
      A.dessin = { type: 'paralleles', enX: enX, h: qNum(hq), e: Math.sqrt(qNum(val)) }
    } else if (val.n === 0) {
      A.cls = 'neutre'; A.verdict = 'Un carré nul : une seule droite (comptée deux fois). Cas dégénéré.'
      L('<span class="num">4)</span>' + tex(vq + '=' + texQ(hq)) + ' : une droite.')
      A.dessin = { type: 'paralleles', enX: enX, h: qNum(hq), e: 0 }
    } else {
      A.cls = 'ko'; A.verdict = 'Un carré égal à un nombre négatif : aucun point. Cas dégénéré : vide.'
      L('<span class="num">4)</span>Un carré n’est jamais négatif : l’ensemble est vide.')
    }
    return A
  }

  _rendre() {
    var sh = this._sh, c = this._c, t = this._t
    ;['m', 'n', 'r', 's'].forEach(function (k) { majCurseur(sh, k, c[k], k + '=' + c[k]) })
    majCurseur(sh, 't', borner(qNum(t), BORNES.t[0], BORNES.t[1]), 't=' + texQ(t))
    sh.getElementById('limite').disabled = !this._limite() || (this._limite() && this._limite().n === t.n && this._limite().d === t.d)
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      var v = PRESETS[b.getAttribute('data-p')].v
      b.setAttribute('aria-pressed', String(v[0] === c.m && v[1] === c.n && v[2] === c.r && v[3] === c.s && t.d === 1 && v[4] === t.n))
    })
    sh.getElementById('equation').innerHTML = tex(texPolyQ([[Q(c.m), 'x^2'], [Q(c.n), 'y^2'], [Q(c.r), 'x'], [Q(c.s), 'y'], [t, '']]) + '=0')
    var A = this._analyse()
    var v = sh.getElementById('verdict')
    v.className = 'verdict ' + A.cls; v.textContent = A.verdict
    sh.getElementById('etapes').innerHTML = '<p class="titre-panneau">La méthode du cours, pas à pas</p>' + A.lignes.map(function (l) { return '<p>' + l + '</p>' }).join('')

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 2)
    var g = groupeCadre(G, svg, R, 'cadre-red')
    var D = A.dessin, O = A.centre, pl = placeurEtiquettes(R.L, R.H), pts = []
    function trait(a, b, cc, cls) { R.traceDroite(g, a, b, cc, cls) }
    if (O) {
      trait(0, 1, -O[1], 'axe-trans'); trait(1, 0, -O[0], 'axe-trans')
    }
    if (D.type === 'droite') trait(D.a, D.b, D.c, 'conique')
    else if (D.type === 'ellipse') {
      G.el('path', { d: cheminPts(R, ptsEllipse(O[0], O[1], D.a, D.b, D.horiz ? 1 : 0, D.horiz ? 0 : 1)), class: 'conique' }, g)
      if (D.c > 0) pts.push([O[0] + (D.horiz ? D.c : 0), O[1] + (D.horiz ? 0 : D.c), 'F'], [O[0] - (D.horiz ? D.c : 0), O[1] - (D.horiz ? 0 : D.c), 'F′'])
    } else if (D.type === 'hyperbole') {
      var br = ptsHyperbole(O[0], O[1], D.a, D.b, D.horiz ? 1 : 0, D.horiz ? 0 : 1, 4.5)
      G.el('path', { d: cheminPts(R, br[0]), class: 'conique' }, g)
      G.el('path', { d: cheminPts(R, br[1]), class: 'conique' }, g)
      var sl = D.horiz ? D.b / D.a : D.a / D.b
      trait(sl, -1, O[1] - sl * O[0], 'asymptote'); trait(-sl, -1, O[1] + sl * O[0], 'asymptote')
      pts.push([O[0] + (D.horiz ? D.c : 0), O[1] + (D.horiz ? 0 : D.c), 'F'], [O[0] - (D.horiz ? D.c : 0), O[1] - (D.horiz ? 0 : D.c), 'F′'])
    } else if (D.type === 'parabole') {
      var ux = D.enX ? 0 : D.sens, uy = D.enX ? D.sens : 0
      G.el('path', { d: cheminPts(R, ptsParabole(O[0], O[1], D.p, ux, uy, 30, 400)), class: 'conique' }, g)
      // directrice : perpendiculaire à l'axe, à p/2 derrière le sommet
      if (D.enX) trait(0, 1, -(O[1] - D.sens * D.p / 2), 'directrice'); else trait(1, 0, -(O[0] - D.sens * D.p / 2), 'directrice')
      pts.push([D.F[0], D.F[1], 'F'])
    } else if (D.type === 'secantes') {
      trait(D.pente, -1, O[1] - D.pente * O[0], 'conique'); trait(-D.pente, -1, O[1] + D.pente * O[0], 'conique')
    } else if (D.type === 'paralleles') {
      if (D.enX) { trait(1, 0, -(D.h + D.e), 'conique'); trait(1, 0, -(D.h - D.e), 'conique') }
      else { trait(0, 1, -(D.h + D.e), 'conique'); trait(0, 1, -(D.h - D.e), 'conique') }
    }
    if (O && R.dansFenetre(O[0], O[1])) {
      var po = R.px(O[0], O[1]); pl.point(po[0], po[1], 6)
    }
    pts.forEach(function (q) { if (R.dansFenetre(q[0], q[1])) { var p = R.px(q[0], q[1]); pl.point(p[0], p[1], 6) } })
    if (O && R.dansFenetre(O[0], O[1])) {
      var p0 = R.px(O[0], O[1])
      G.el('circle', { cx: p0[0].toFixed(1), cy: p0[1].toFixed(1), r: D.type === 'point' ? 6 : 4.5, class: D.type === 'point' ? 'pt-acc' : 'pt-plan' }, svg)
      pl.poser(svg, p0[0], p0[1], D.type === 'parabole' ? 'S' : 'O′', D.type === 'point' ? 'et-acc' : 'et-plan', [3, 2, 1, 0])
    }
    pts.forEach(function (q) {
      if (!R.dansFenetre(q[0], q[1])) return
      var p = R.px(q[0], q[1])
      G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 4.5, class: 'pt-good' }, svg)
      pl.poser(svg, p[0], p[1], q[2], 'et-good', [0, 2])
    })
    if (O) {
      var ex = R.px(FEN.xMax - 0.4, O[1]), ey = R.px(O[0], FEN.yMax - 0.5)
      if (O[1] > FEN.yMin && O[1] < FEN.yMax) pl.poser(svg, ex[0], ex[1], 'x′', 'et-plan', [4, 5])
      if (O[0] > FEN.xMin && O[0] < FEN.xMax) pl.poser(svg, ey[0], ey[1], 'y′', 'et-plan', [6, 7])
    }
  }
}

if (!customElements.get('reduire-translation-widget')) customElements.define('reduire-translation-widget', ReduireTranslationWidget)
