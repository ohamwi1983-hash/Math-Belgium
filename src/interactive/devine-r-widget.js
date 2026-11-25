/* ================================================================
 * <devine-r-widget> — atelier « Devine r » (5e, ch. 6, § 5). Deux modes.
 * « Devine r » : un nuage de 12 à 30 points est tiré (corrélation visée
 * entre −1 et 1, puis r CALCULÉ sur les points tirés) ; l'élève estime r
 * au curseur (pas de 0,01), touche « Vérifier » : vraie valeur, écart,
 * interprétation selon le tableau du cours, droite des moindres carrés ;
 * ses derniers écarts restent affichés (sans note). « Fabrique un
 * nuage » : un r cible est donné ; l'élève ajoute, déplace, retire des
 * points (au moins 5) jusqu'à ce que r soit à 0,05 près de la cible ;
 * r est recalculé en direct. Une jauge de −1 à 1 montre l'estimation,
 * la cible et la valeur. Repère FIXE (0 à 10 sur chaque axe).
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import {
  CSS_STAT, el, texte, repereStat, pointNuage, nuageEditable, statistiques,
  arr, txt, tn, texR, txtR, phraseR, alea,
} from './statistique-deux-variables-commun.js'

var R = repereStat({ xMin: 0, xMax: 10, yMin: 0, yMax: 10, ux: 34, uy: 34, pasX: 1, pasY: 1, nomX: 'x', nomY: 'y', mg: 30, mb: 40 })
var CIBLES = [0.9, -0.8, 0.5, -0.3, 0, 0.99, -0.95, 0.7, -0.6, 0.3]
var JL = 340, JH = 64, JM = 18

function jx(r) { return JM + (r + 1) / 2 * (JL - 2 * JM) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT +
  '.jauge{display:flex;justify-content:center;margin:0 0 10px;}.jauge svg{width:100%;max-width:400px;height:auto;display:block;}' +
  '.j-axe{stroke:var(--ink-soft,#51626f);stroke-width:1.4;}.j-cible{fill:var(--good,#2f7a4f);fill-opacity:0.22;}' +
  '.j-est{fill:var(--accent,#b65c1f);}.j-vrai{fill:var(--ink,#182430);}.j-txt{font-size:11px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);}' +
  '.j-et{font-size:12px;font-weight:700;font-family:var(--sans,sans-serif);}.j-et-est{fill:var(--accent-ink,#7a3c11);}.j-et-vrai{fill:var(--ink,#182430);}.j-et-cible{fill:var(--good,#2f7a4f);}' +
  '</style>' +
  '<div class="rangee mode" role="group" aria-label="Mode">' +
  '<button class="btn" id="m-devine" aria-pressed="true">Devine r</button><button class="btn" id="m-fabrique" aria-pressed="false">Fabrique un nuage</button></div>' +
  '<div class="rangee mode" id="outils" role="group" aria-label="Que fait un toucher sur la figure ?" hidden>' +
  '<button class="btn" id="o-ajouter" aria-pressed="true">Ajouter / déplacer</button><button class="btn" id="o-retirer" aria-pressed="false">Retirer un point</button></div>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nuage de points"></svg></div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="jauge"><svg id="jauge" viewBox="0 0 ' + JL + ' ' + JH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jauge de r, de −1 à 1"></svg></div>' +
  '<div id="zone-devine">' + curseurHTML('est', 'Ton estimation de r', -1, 1, 0.01) +
  '<div class="rangee"><button class="btn" id="verifier">Vérifier</button><button class="btn" id="nouveau">Nouveau nuage</button></div></div>' +
  '<div class="rangee" id="zone-fabrique" hidden><button class="btn" id="defi">Autre r à fabriquer</button><button class="btn" id="vider">Repartir de 5 points</button></div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class DevineRWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._mode = 'devine'
    this._outil = 'ajouter'
    this._graine = 11
    this._est = 0
    this._verifie = false
    this._ecarts = []
    this._iCible = 0
    this._pts = this._tirerNuage()
    this._ptsFab = null
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.getElementById('m-devine').addEventListener('click', function () { self._mode = 'devine'; self._rendre() })
    sh.getElementById('m-fabrique').addEventListener('click', function () {
      self._mode = 'fabrique'
      if (!self._ptsFab) self._ptsFab = self._depart()
      self._rendre()
    })
    sh.getElementById('o-ajouter').addEventListener('click', function () { self._outil = 'ajouter'; self._rendre() })
    sh.getElementById('o-retirer').addEventListener('click', function () { self._outil = 'retirer'; self._rendre() })
    sh.getElementById('est').addEventListener('input', function (e) { self._regleEst(parseFloat(e.target.value)) })
    sh.getElementById('est-moins').addEventListener('click', function () { self._regleEst(self._est - 0.01) })
    sh.getElementById('est-plus').addEventListener('click', function () { self._regleEst(self._est + 0.01) })
    sh.getElementById('verifier').addEventListener('click', function () {
      if (self._verifie) return
      self._verifie = true
      var r = statistiques(self._pts).r
      self._ecarts.push(Math.abs(self._est - r))
      if (self._ecarts.length > 6) self._ecarts.shift()
      self._rendre()
    })
    sh.getElementById('nouveau').addEventListener('click', function () { self._pts = self._tirerNuage(); self._verifie = false; self._est = 0; self._rendre() })
    sh.getElementById('defi').addEventListener('click', function () { self._iCible = (self._iCible + 1) % CIBLES.length; self._ptsFab = self._depart(); self._rendre() })
    sh.getElementById('vider').addEventListener('click', function () { self._ptsFab = self._depart(); self._rendre() })
    nuageEditable(this, sh.getElementById('svg'), R, {
      points: function () { return self._mode === 'fabrique' ? self._ptsFab : [] },
      mode: function () { return self._outil },
      pasX: 0.5, pasY: 0.5, min: 2, max: 20,
      get ajoutInterdit() { return self._mode !== 'fabrique' },
      surChange: function () { self._rendre() },
    })
    this._rendre()
  }

  /** Nuage tiré : corrélation visée ρ, n de 12 à 30, x et y ramenés dans [1 ; 9] (r inchangé). */
  _tirerNuage() {
    var rnd = alea(this._graine++ * 2246822519 + 3)
    function normale() { var u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) }
    var choix = rnd(), rho
    if (choix < 0.15) rho = (rnd() < 0.5 ? -1 : 1) * (0.95 + 0.05 * rnd())
    else if (choix < 0.3) rho = (rnd() - 0.5) * 0.4
    else rho = (rnd() * 2 - 1) * 0.95
    var n = 12 + Math.floor(rnd() * 19), xs = [], ys = [], i
    for (i = 0; i < n; i++) xs.push(normale())
    for (i = 0; i < n; i++) ys.push(rho * xs[i] + Math.sqrt(Math.max(0, 1 - rho * rho)) * normale())
    function ramener(L) {
      var mn = Math.min.apply(null, L), mx = Math.max.apply(null, L), d = mx - mn || 1
      return L.map(function (v) { return 1 + 8 * (v - mn) / d })
    }
    xs = ramener(xs); ys = ramener(ys)
    var pts = xs.map(function (x, k) { return [arr(x, 2), arr(ys[k], 2)] })
    if (statistiques(pts).r === null) return this._tirerNuage()
    return pts
  }

  /** Point de départ du mode « fabrique » : 5 points dispersés. */
  _depart() { return [[2, 6], [3.5, 3], [5, 7.5], [6.5, 4], [8, 5.5]] }

  _regleEst(v) { if (this._verifie) return; this._est = arr(borner(Math.round(v * 100) / 100, -1, 1), 2); this._rendre() }

  _rendre() {
    var sh = this._sh, devine = this._mode === 'devine'
    var pts = devine ? this._pts : this._ptsFab
    var S = statistiques(pts), r = S.r
    sh.getElementById('m-devine').setAttribute('aria-pressed', String(devine))
    sh.getElementById('m-fabrique').setAttribute('aria-pressed', String(!devine))
    sh.getElementById('outils').hidden = devine
    sh.getElementById('o-ajouter').setAttribute('aria-pressed', String(this._outil === 'ajouter'))
    sh.getElementById('o-retirer').setAttribute('aria-pressed', String(this._outil === 'retirer'))
    sh.getElementById('zone-devine').hidden = !devine
    sh.getElementById('zone-fabrique').hidden = devine
    majCurseur(sh, 'est', this._est, '\\text{ton }r=' + tn(this._est, 2))
    sh.getElementById('est').disabled = this._verifie
    sh.getElementById('est-moins').disabled = this._verifie || this._est <= -1
    sh.getElementById('est-plus').disabled = this._verifie || this._est >= 1
    sh.getElementById('verifier').disabled = this._verifie
    var cible = CIBLES[this._iCible]
    sh.getElementById('consigne').textContent = devine
      ? 'Regarde le nuage, estime r avec le curseur, puis touche « Vérifier ».'
      : 'Fabrique un nuage de r = ' + txt(cible, 2) + ' (à 0,05 près, au moins 5 points) : touche une place vide pour ajouter un point, fais glisser un point pour le déplacer.'

    // ---------- Verdict et infos ----------
    var v = sh.getElementById('verdict'), h = ''
    if (devine) {
      if (!this._verifie) { v.className = 'verdict neutre'; v.textContent = 'n = ' + pts.length + ' points. Le nuage monte-t-il ou descend-il ? Les points sont-ils serrés autour d’une droite ?' }
      else {
        var ec = Math.abs(this._est - r)
        v.className = 'verdict ' + (ec <= 0.1 ? 'ok' : 'neutre')
        v.textContent = (ec <= 0.05 ? 'Excellent ! ' : ec <= 0.1 ? 'Bien vu ! ' : ec <= 0.25 ? 'Pas loin. ' : 'Assez loin. ') + 'Écart : ' + txt(ec, 2) + '.'
        h += '<p class="ligne">Vraie valeur : ' + tex('r' + texR(r)) + ' — ' + phraseR(r) + '.</p>'
        h += '<p class="ligne">Ton estimation : ' + tex(tn(this._est, 2)) + '.</p>'
        h += '<p class="note">Sur la jauge : au-dessus, ton estimation (orange) ; en dessous, la vraie valeur (noir).</p>'
      }
      if (this._ecarts.length) h += '<p class="note">Tes derniers écarts : ' + this._ecarts.map(function (e) { return txt(e, 2) }).join(' ; ') + '.</p>'
      if (!h) h = '<p class="note">Repères : |r| proche de 1, points serrés autour d’une droite ; r proche de 0, aucune tendance linéaire. Le signe de r donne le sens.</p>'
    } else {
      var ok = r !== null && pts.length >= 5 && Math.abs(r - cible) <= 0.05 + 1e-9
      v.className = 'verdict ' + (ok ? 'ok' : 'neutre')
      v.textContent = ok ? 'Réussi : r ' + txtR(r) + ' est à 0,05 près de ' + txt(cible, 2) + '. Essaie un autre r.' :
        pts.length < 5 ? 'Il faut au moins 5 points.' :
        r === null ? 'r n’est pas défini : tous les x, ou tous les y, sont égaux.' :
        'r ' + txtR(r) + ' : ' + (r < cible ? 'il faut l’augmenter' : 'il faut le diminuer') + ' pour atteindre ' + txt(cible, 2) + '.'
      h += '<p class="ligne">Cible : ' + tex('r=' + tn(cible, 2)) + ' (' + phraseR(cible) + ').</p>'
      h += '<p class="ligne">Ton nuage : n = ' + pts.length + (r === null ? '' : ', ' + tex('r' + texR(r))) + '.</p>'
      h += '<p class="note">Astuce : pour un r proche de ±1, aligne presque les points ; pour un r proche de 0, disperse-les sans tendance. Sur la jauge, la bande verte est la cible et le triangle noir (en dessous) la valeur de r de ton nuage.</p>'
    }
    sh.getElementById('infos').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 'cadre-dr')
    var g = R.groupe(svg, 'cadre-dr')
    if (S.a !== null && (!devine || this._verifie)) R.droite(g, S.a, S.b, 'trait-good pointille')
    pts.forEach(function (p, i) { pointNuage(svg, R, p[0], p[1], devine ? null : i, devine ? 'pt' : 'pt-acc', devine ? 4.2 : 5) })
    svg.setAttribute('aria-label', 'Nuage de ' + pts.length + ' points' + (!devine || this._verifie ? ', r ' + txtR(r) : ''))

    // ---------- Jauge ----------
    var J = sh.getElementById('jauge')
    J.innerHTML = ''
    el('line', { x1: JM, y1: 34, x2: JL - JM, y2: 34, class: 'j-axe' }, J)
    ;[-1, -0.5, 0, 0.5, 1].forEach(function (t) {
      el('line', { x1: jx(t), y1: 29, x2: jx(t), y2: 39, class: 'j-axe' }, J)
      texte(J, jx(t), 59, txt(t, 1), 'j-txt')
    })
    if (!devine) {
      el('rect', { x: jx(Math.max(-1, cible - 0.05)), y: 24, width: jx(Math.min(1, cible + 0.05)) - jx(Math.max(-1, cible - 0.05)), height: 20, class: 'j-cible' }, J)
      texte(J, Math.max(28, Math.min(JL - 28, jx(cible))), 14, 'cible', 'j-et j-et-cible')
    } else {
      el('path', { d: 'M' + jx(this._est) + ',34 l-6,-12 h12 z', class: 'j-est' }, J)
      texte(J, Math.max(20, Math.min(JL - 20, jx(this._est))), 14, 'toi', 'j-et j-et-est')
    }
    if (r !== null && (!devine || this._verifie)) {
      el('path', { d: 'M' + jx(r) + ',34 l-6,12 h12 z', class: 'j-vrai' }, J)
    }
    J.setAttribute('aria-label', 'Jauge de r de −1 à 1' + (devine ? ', ton estimation ' + txt(this._est, 2) : ', cible ' + txt(cible, 2)) + (r !== null && (!devine || this._verifie) ? ', valeur ' + txtR(r).replace(/^= /, '') : ''))
  }
}

if (!customElements.get('devine-r-widget')) customElements.define('devine-r-widget', DevineRWidget)
