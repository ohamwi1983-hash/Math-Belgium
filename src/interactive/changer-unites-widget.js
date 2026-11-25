/* ================================================================
 * <changer-unites-widget> — atelier « Changer d'unités » (5e, ch. 6,
 * § 5, démonstration 7). On remplace x par X = αx + β et y par
 * Y = γy + δ (α, γ > 0 : changement d'unité et/ou d'origine). Le nuage
 * reste EXACTEMENT le même dessin : seules les graduations changent.
 * Le panneau recalcule la droite des moindres carrés et r dans les
 * nouvelles unités : a′ = a·γ/α change, b′ aussi, r reste le même.
 * Deux séries : espérance de vie en Belgique 2000-2014 (Banque mondiale,
 * valeurs du document ; années brutes, depuis 2000, centrées sur 2007 ;
 * en années ou en mois) et taille / masse de six adolescents (valeurs
 * d'exemple ; cm ou m, kg ou g). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import {
  CSS_STAT, repereStat, pointNuage, statistiques, txt, tn, egal, texR, txtR,
} from './statistique-deux-variables-commun.js'

/** Nombre de décimales lisible selon l'ordre de grandeur. */
function dec(v) { var m = Math.abs(v); return m < 1 ? 4 : m < 10 ? 3 : m < 1000 ? 2 : 1 }
/** Espace des milliers (à partir de 10 000) dans un nombre déjà écrit : LaTeX « \\, », texte U+202F. */
function milliers(chaine, sep) {
  return chaine.replace(/\d{5,}/g, function (ent) { return ent.replace(/\B(?=(\d{3})+$)/g, sep) })
}
function tnm(v, d) { return milliers(tn(v, d), '\\,') }
function txtm(v, d) { return milliers(txt(v, d), '\u202f') }
/** Équation « Y = a′X + b′ » avec des décimales adaptées. */
function texEq(nomY, nomX, a, b) {
  var s = nomY + '=' + tnm(a, dec(a)) + nomX
  if (Math.abs(b) > 1e-9) s += (b < 0 ? '-' : '+') + tnm(Math.abs(b), dec(b))
  return s
}

var SERIES = {
  esperance: {
    nom: 'Espérance de vie',
    pts: [[2000, 77.72], [2002, 78.08], [2004, 78.88], [2006, 79.38], [2008, 79.68], [2010, 80.18], [2012, 80.39], [2014, 80.59]],
    o: { xMin: 1998, xMax: 2016, yMin: 77, yMax: 81.5, ux: 20, uy: 64, pasX: 4, grilleX: 1, pasY: 0.5, mg: 60, mb: 40, mh: 24 },
    ux: [
      { id: 'brut', nom: 'année', alpha: 1, beta: 0, txt: 'x' },
      { id: 'depuis2000', nom: 'années depuis 2000', alpha: 1, beta: -2000, txt: 'X = x − 2000' },
      { id: 'centre', nom: 'centrées sur 2007', alpha: 1, beta: -2007, txt: 'X = x − 2007' },
    ],
    uy: [
      { id: 'ans', nom: 'en années', gamma: 1, delta: 0, txt: 'y' },
      { id: 'mois', nom: 'en mois', gamma: 12, delta: 0, txt: 'Y = 12y' },
    ],
    nomX: 'année', nomY: 'espérance de vie',
    source: 'Données de la Banque mondiale (Belgique), reprises du document.',
  },
  taille: {
    nom: 'Taille et masse',
    pts: [[152, 44], [158, 49], [163, 52], [167, 57], [172, 60], [180, 68]],
    o: { xMin: 145, xMax: 185, yMin: 40, yMax: 72, ux: 9, uy: 9, pasX: 5, pasY: 4, mg: 60, mb: 40, mh: 24 },
    ux: [
      { id: 'cm', nom: 'en cm', alpha: 1, beta: 0, txt: 'x (cm)' },
      { id: 'm', nom: 'en m', alpha: 0.01, beta: 0, txt: 'X = x / 100 (m)' },
    ],
    uy: [
      { id: 'kg', nom: 'en kg', gamma: 1, delta: 0, txt: 'y (kg)' },
      { id: 'g', nom: 'en g', gamma: 1000, delta: 0, txt: 'Y = 1 000y (g)' },
    ],
    nomX: 'taille', nomY: 'masse',
    source: 'Valeurs d’exemple (six adolescents).',
  },
}
Object.keys(SERIES).forEach(function (k) { SERIES[k].S = statistiques(SERIES[k].pts) })
var L0 = 18 * 20 + 60 + 12, H0 = 4.5 * 64 + 64

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + '</style>' +
  '<div class="rangee presets" role="group" aria-label="Série">' +
  '<button class="btn" data-s="esperance">Espérance de vie</button><button class="btn" data-s="taille">Taille et masse</button></div>' +
  '<p class="consigne">Change les unités ou l’origine : le nuage ne bouge pas, seules les graduations changent.</p>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + L0 + ' ' + H0 + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nuage et droite des moindres carrés"></svg></div>' +
  '<div class="rangee" role="group" aria-label="Unité de x" id="choix-x"></div>' +
  '<div class="rangee" role="group" aria-label="Unité de y" id="choix-y"></div>' +
  '<p class="verdict ok" id="verdict" aria-live="polite"></p>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class ChangerUnitesWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._serie = 'esperance'
    this._ix = { esperance: 0, taille: 0 }
    this._iy = { esperance: 0, taille: 0 }
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelectorAll('[data-s]').forEach(function (b) { b.addEventListener('click', function () { self._serie = b.getAttribute('data-s'); self._rendre() }) })
    sh.getElementById('choix-x').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-ix]')
      if (b) { self._ix[self._serie] = +b.getAttribute('data-ix'); self._rendre() }
    })
    sh.getElementById('choix-y').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-iy]')
      if (b) { self._iy[self._serie] = +b.getAttribute('data-iy'); self._rendre() }
    })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, k = this._serie, D = SERIES[k], S = D.S
    var ux = D.ux[this._ix[k]], uy = D.uy[this._iy[k]]
    sh.querySelectorAll('[data-s]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-s') === k)) })
    sh.getElementById('choix-x').innerHTML = '<span class="etiquette">' + D.nomX + ' :</span>' + D.ux.map(function (u, i) { return '<button class="btn" data-ix="' + i + '" aria-pressed="' + (u === ux) + '">' + u.nom + '</button>' }).join('')
    sh.getElementById('choix-y').innerHTML = '<span class="etiquette">' + D.nomY + ' :</span>' + D.uy.map(function (u, i) { return '<button class="btn" data-iy="' + i + '" aria-pressed="' + (u === uy) + '">' + u.nom + '</button>' }).join('')
    var T = D.pts.map(function (p) { return [ux.alpha * p[0] + ux.beta, uy.gamma * p[1] + uy.delta] })
    var S2 = statistiques(T)
    var change = ux.alpha !== 1 || ux.beta !== 0 || uy.gamma !== 1 || uy.delta !== 0
    var nX = change && (ux.alpha !== 1 || ux.beta !== 0) ? 'X' : 'x', nY = change && (uy.gamma !== 1 || uy.delta !== 0) ? 'Y' : 'y'

    var v = sh.getElementById('verdict')
    v.className = 'verdict ' + (change ? 'ok' : 'neutre')
    v.textContent = change
      ? 'Même nuage, même r ' + (Math.abs(S2.r - S.r) < 1e-9 ? '(r ' + txtR(S.r) + ')' : '') + ' ; la pente, elle, a changé : elle dépend des unités, r n’en a pas.'
      : 'Unités de départ. Choisis une autre unité ou une autre origine ci-dessus.'

    var h = '<p class="titre-panneau">Dans les unités de départ</p>'
    h += '<p class="ligne">' + tex(texEq('y', 'x', S.a, S.b)) + ', ' + tex('r' + texR(S.r)) + '</p>'
    if (change) {
      h += '<p class="titre-panneau">Avec ' + ux.txt + ' et ' + uy.txt + '</p>'
      h += '<p class="liste">' + T.slice(0, 3).map(function (p) { return '(' + txtm(p[0], 4) + '\u00a0;\u00a0' + txtm(p[1], 4) + ')' }).join(', ') + '…</p>'
      h += '<p class="ligne">' + tex(texEq(nY, nX, S2.a, S2.b)) + ', ' + tex('r' + texR(S2.r)) + '</p>'
      var rap = uy.gamma / ux.alpha
      h += '<p class="ligne">' + texEgalites(["a'=a\\times\\frac{\\gamma}{\\alpha}", (Math.abs(S.a) < 1 ? tn(S.a, 5) : tn(S.a, 4)) + '\\times' + tnm(rap, 2)]) + ' ' + tex(egal(S2.a, dec(S2.a)).replace(/\d{5,}/g, function (e) { return e.replace(/\B(?=(\d{3})+$)/g, '\\,') })) +
        (rap === 1 ? ' : la pente ne change pas (seule l’origine a bougé).' : '') + '</p>'
      h += '<p class="note">Cov est multipliée par αγ, σx par α et σy par γ : dans r = Cov / (σx σy), tout se simplifie.</p>'
      if (ux.id === 'centre') h += '<p class="note">Années centrées sur x̄ = 2007 : b′ est alors ȳ (la droite passe par G), et les calculs à la main restent petits.</p>'
    }
    h += '<p class="note">' + D.source + '</p>'
    sh.getElementById('infos').innerHTML = h

    // ---------- Figure : même dessin, graduations transformées ----------
    var o = {}
    for (var c in D.o) o[c] = D.o[c]
    o.etiqX = function (t) { var x = ux.alpha * t + ux.beta; return txt(x, ux.alpha < 1 ? 2 : 0) }
    o.etiqY = function (t) { var y = uy.gamma * t + uy.delta; return uy.gamma >= 1000 ? txt(y, 0).replace(/(\d)(?=(\d{3})+$)/, '$1 ') : txt(y, uy.gamma === 1 ? 1 : 0) }
    o.nomX = ux.txt.indexOf('X') === 0 ? 'X' : 'x'
    o.nomY = uy.txt.indexOf('Y') === 0 ? 'Y' : 'y'
    o.nomX = (o.nomX === 'X' ? 'X : ' : 'x : ') + D.nomX + ' ' + (ux.id === 'brut' ? '' : ux.nom)
    o.nomY = (o.nomY === 'Y' ? 'Y : ' : 'y : ') + D.nomY + ' ' + uy.nom
    var R = repereStat(o)
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    svg.setAttribute('viewBox', '0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0))
    R.fond(svg, 'cadre-u')
    var g = R.groupe(svg, 'cadre-u')
    R.droite(g, S.a, S.b, 'trait-acc')
    D.pts.forEach(function (p) { pointNuage(svg, R, p[0], p[1], null, 'pt') })
    svg.setAttribute('aria-label', D.nom + ' : nuage de ' + D.pts.length + ' points et droite des moindres carrés, graduations ' + ux.nom + ' et ' + uy.nom)
  }
}

if (!customElements.get('changer-unites-widget')) customElements.define('changer-unites-widget', ChangerUnitesWidget)
