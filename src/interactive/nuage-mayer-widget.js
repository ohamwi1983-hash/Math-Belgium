/* ================================================================
 * <nuage-mayer-widget> — atelier « Nuage, point moyen et droite de
 * Mayer » (5e, ch. 6, § 1 et § 3). Repère FIXE (x de 0 à 10, y de 0 à
 * 20), valeurs aimantées au demi. On ajoute un point en touchant une
 * place vide, on le fait glisser, on le retire (mode « Retirer ») ; G,
 * G₁, G₂ et la droite de Mayer suivent en direct. Le panneau refait la
 * méthode du cours : couples triés selon x, deux groupes d'effectifs
 * égaux (à une unité près : le premier groupe a ⌊n/2⌋ points quand n
 * est impair), G₁ et G₂ (moyennes écrites), pente non arrondie, b,
 * équation, et la vérification que G est sur la droite (G est sur le
 * segment [G₁G₂], au milieu seulement si les groupes ont le même
 * effectif). Préréglages : exemple du cours (6 points), 7 points donnés
 * en désordre. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, CSS_BASE } from './katex-shadow.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import {
  CSS_STAT, el, repereStat, pointNuage, marquePointMoyen, nuageEditable, statistiques, mayer,
  tn, egal, couple, texEquation, txtEquation, texSomme, exact,
} from './statistique-deux-variables-commun.js'

var R = repereStat({ xMin: 0, xMax: 10, yMin: 0, yMax: 20, ux: 38, uy: 14, pasX: 1, pasY: 2, nomX: 'x', nomY: 'y' })
var COURS = [[1, 8], [2, 9], [3, 11], [4, 12], [5, 14], [6, 15]]
var IMPAIR = [[7, 10], [2, 5], [9, 14], [5, 8], [3, 7], [8, 13], [6, 11]]
var MAX = 14

/** « x̄₁ = (1+2+3)/3 » puis « = 2 » : deux morceaux KaTeX (la ligne peut se couper entre eux).
 * Au-delà de 6 valeurs, la somme est écrite calculée (la fraction resterait trop large sur téléphone). */
function texMoyenne(nom, vals, valeur) {
  var somme = 0
  vals.forEach(function (v) { somme += v })
  var num = vals.length <= 6 ? texSomme(vals, 1) : tn(somme, 1)
  return tex(nom + '=\\frac{' + num + '}{' + vals.length + '}') + ' ' + tex(egal(valeur, 2))
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + '</style>' +
  '<div class="rangee presets" role="group" aria-label="Séries prêtes">' +
  '<button class="btn" id="p-cours">Exemple du cours</button><button class="btn" id="p-impair">7 points en désordre</button>' +
  '<button class="btn" id="p-vide">Tout effacer</button></div>' +
  '<div class="rangee mode" role="group" aria-label="Que fait un toucher sur la figure ?">' +
  '<button class="btn" id="m-ajouter" aria-pressed="true">Ajouter / déplacer</button><button class="btn" id="m-retirer" aria-pressed="false">Retirer un point</button></div>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nuage de points, point moyen G, points moyens G1 et G2 et droite de Mayer"></svg></div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="rangee" role="group" aria-label="Affichage">' +
  '<button class="btn" id="v-g" aria-pressed="true">Point moyen G</button><button class="btn" id="v-mayer" aria-pressed="true">G₁, G₂ et droite de Mayer</button></div>' +
  '<div class="panneau" id="tri"></div>' +
  '<div class="panneau" id="calculs"></div>'

class NuageMayerWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._pts = COURS.map(function (p) { return p.slice() })
    this._mode = 'ajouter'
    this._voirG = true
    this._voirMayer = true
    this._message = ''
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    function charger(L) { self._pts = L.map(function (p) { return p.slice() }); self._message = ''; self._rendre() }
    sh.getElementById('p-cours').addEventListener('click', function () { charger(COURS) })
    sh.getElementById('p-impair').addEventListener('click', function () { charger(IMPAIR) })
    sh.getElementById('p-vide').addEventListener('click', function () { charger([]) })
    sh.getElementById('m-ajouter').addEventListener('click', function () { self._mode = 'ajouter'; self._rendre() })
    sh.getElementById('m-retirer').addEventListener('click', function () { self._mode = 'retirer'; self._rendre() })
    sh.getElementById('v-g').addEventListener('click', function () { self._voirG = !self._voirG; self._rendre() })
    sh.getElementById('v-mayer').addEventListener('click', function () { self._voirMayer = !self._voirMayer; self._rendre() })
    nuageEditable(this, sh.getElementById('svg'), R, {
      points: function () { return self._pts },
      mode: function () { return self._mode },
      pasX: 0.5, pasY: 0.5, min: 0, max: MAX,
      surChange: function (quoi) { self._message = quoi === 'plein' ? 'Au plus ' + MAX + ' points : retires-en un pour en ajouter un autre.' : ''; self._rendre() },
    })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, pts = this._pts, n = pts.length
    sh.getElementById('m-ajouter').setAttribute('aria-pressed', String(this._mode === 'ajouter'))
    sh.getElementById('m-retirer').setAttribute('aria-pressed', String(this._mode === 'retirer'))
    sh.getElementById('v-g').setAttribute('aria-pressed', String(this._voirG))
    sh.getElementById('v-mayer').setAttribute('aria-pressed', String(this._voirMayer))
    sh.getElementById('consigne').textContent = this._mode === 'ajouter'
      ? 'Touche une place vide pour ajouter un point, fais glisser un point pour le déplacer.'
      : 'Touche un point pour le retirer.'
    var S = statistiques(pts), M = mayer(pts)

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict')
    if (this._message) { v.className = 'verdict ko'; v.textContent = this._message }
    else if (n === 0) { v.className = 'verdict neutre'; v.textContent = 'Aucun point : touche la figure pour en ajouter.' }
    else if (n === 1) { v.className = 'verdict neutre'; v.textContent = 'Un seul point : G est ce point. Il en faut au moins deux pour la droite de Mayer.' }
    else if (M.a === null) { v.className = 'verdict ko'; v.textContent = 'G₁ et G₂ ont la même abscisse : la droite de Mayer serait verticale, elle ne s’écrit pas y = ax + b. Écarte les points en x.' }
    else if (n % 2) { v.className = 'verdict ok'; v.textContent = 'n = ' + n + ' est impair : groupes de ' + M.n1 + ' et ' + M.n2 + ' points (égaux à une unité près). G n’est pas le milieu de [G₁G₂], mais il est toujours sur la droite.' }
    else { v.className = 'verdict ok'; v.textContent = 'n = ' + n + ' est pair : deux groupes de ' + M.n1 + ' points. G est le milieu de [G₁G₂].' }

    // ---------- Tri et groupes ----------
    var t = '<p class="titre-panneau">Étapes 1 et 2 : trier selon x, puis partager</p>'
    if (n === 0) t += '<p class="note">Le nuage est vide.</p>'
    else {
      t += '<p class="liste">Dans l’ordre où ils ont été placés : ' + pts.map(function (p) { return couple(p[0], p[1], 1) }).join(', ') + '.</p>'
      if (M) {
        t += '<p class="liste"><span class="c-sky">Groupe 1 (' + M.n1 + ' points)</span> : ' + M.groupe1.map(function (p) { return couple(p[0], p[1], 1) }).join(', ') + '.</p>'
        t += '<p class="liste"><span class="c-plan">Groupe 2 (' + M.n2 + ' points)</span> : ' + M.groupe2.map(function (p) { return couple(p[0], p[1], 1) }).join(', ') + '.</p>'
        var desordre = pts.some(function (p, i) { return i > 0 && p[0] < pts[i - 1][0] })
        if (desordre) t += '<p class="note">Les couples n’étaient pas rangés selon x : sans le tri, les groupes seraient faux.</p>'
      }
    }
    sh.getElementById('tri').innerHTML = t

    // ---------- Calculs ----------
    var c = '<p class="titre-panneau">Étapes 3 à 5 : points moyens, pente, équation</p>'
    if (n >= 1) {
      c += '<p class="ligne"><span class="c-acc">Point moyen</span> ' +
        texMoyenne('\\bar{x}', pts.map(function (p) { return p[0] }), S.mx) + ' et ' +
        texMoyenne('\\bar{y}', pts.map(function (p) { return p[1] }), S.my) + '.</p>'
    }
    if (M) {
      c += '<p class="ligne"><span class="c-sky">' + tex('G_1') + '</span> : ' +
        texMoyenne('\\bar{x}_1', M.groupe1.map(function (p) { return p[0] }), M.G1.x) + ', ' +
        texMoyenne('\\bar{y}_1', M.groupe1.map(function (p) { return p[1] }), M.G1.y) + '</p>'
      c += '<p class="ligne"><span class="c-plan">' + tex('G_2') + '</span> : ' +
        texMoyenne('\\bar{x}_2', M.groupe2.map(function (p) { return p[0] }), M.G2.x) + ', ' +
        texMoyenne('\\bar{y}_2', M.groupe2.map(function (p) { return p[1] }), M.G2.y) + '</p>'
      if (M.a !== null) {
        c += '<p class="ligne">Pente : ' + tex('a=\\frac{\\bar{y}_2-\\bar{y}_1}{\\bar{x}_2-\\bar{x}_1}') + ' ' + tex(egal(M.a, 3)) +
          ' ; ' + tex('b=\\bar{y}_1-a\\,\\bar{x}_1') + ' ' + tex(egal(M.b, 3)) + '</p>'
        if (!exact(M.a, 4)) c += '<p class="note">b est calculé avec la pente gardée en mémoire, pas avec la pente arrondie.</p>'
        c += '<p class="formule">' + tex('\\text{Droite de Mayer : }' + texEquation(M.a, M.b, 3)) + '</p>'
        var verif = M.a * S.mx + M.b
        c += '<p class="ligne">G est-il sur la droite ? ' + tex('a\\,\\bar{x}+b') + ' ' + tex(egal(verif, 2)) +
          ' et ' + tex('\\bar{y}' + egal(S.my, 2)) + ' : <span class="ok">oui</span>' + '.</p>'
      }
    }
    if (n === 0) c += '<p class="note">Ajoute des points pour voir les calculs.</p>'
    sh.getElementById('calculs').innerHTML = c

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 'cadre-mayer')
    var g = R.groupe(svg, 'cadre-mayer')
    if (M && this._voirMayer) {
      // frontière entre les deux groupes (entre le dernier x du groupe 1 et le premier du groupe 2)
      var xa = M.groupe1[M.n1 - 1][0], xb = M.groupe2[0][0], xf = (xa + xb) / 2
      var pf = R.px(xf, 0)[0]
      el('line', { x1: pf.toFixed(1), y1: R.y0, x2: pf.toFixed(1), y2: R.y1, class: 'trait-soft pointille' }, g)
      if (M.a !== null) R.droite(g, M.a, M.b, 'trait-acc')
    }
    var groupeDe = {}
    if (M && this._voirMayer) {
      M.groupe1.forEach(function (p) { groupeDe[p[2]] = 1 })
      M.groupe2.forEach(function (p) { groupeDe[p[2]] = 2 })
    }
    pts.forEach(function (p, i) { pointNuage(svg, R, p[0], p[1], null, groupeDe[i] === 1 ? 'pt-g1' : groupeDe[i] === 2 ? 'pt-g2' : 'pt') })
    var etiquettes = []
    if (M && this._voirMayer) {
      marquePointMoyen(svg, R, M.G1.x, M.G1.y, 'g1')
      marquePointMoyen(svg, R, M.G2.x, M.G2.y, 'g2')
      etiquettes.push([M.G1.x, M.G1.y, 'G₁', 'et-sky'], [M.G2.x, M.G2.y, 'G₂', 'et-plan'])
    }
    if (S && this._voirG) {
      marquePointMoyen(svg, R, S.mx, S.my, '')
      etiquettes.push([S.mx, S.my, 'G', 'et-acc'])
    }
    // étiquettes : au-dessus à gauche de la marque (côté opposé à la droite croissante), gardées dans le cadre
    etiquettes.forEach(function (e) {
      var p = R.px(e[0], e[1]), dx = e[2] === 'G' ? 14 : -16, dy = e[2] === 'G' ? 16 : -10
      var x = Math.max(R.x0 + 10, Math.min(R.x1 - 10, p[0] + dx)), y = Math.max(R.y0 + 14, Math.min(R.y1 - 4, p[1] + dy))
      el('text', { x: x.toFixed(1), y: y.toFixed(1), class: 'et ' + e[3], 'text-anchor': 'middle' }, svg).textContent = e[2]
    })
    // prises au-dessus des marques (les points restent saisissables même sous G)
    pts.forEach(function (p, i) {
      var q = R.px(p[0], p[1])
      el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 17, class: 'prise', 'data-pt': String(i) }, svg)
    })
    svg.setAttribute('aria-label', 'Nuage de ' + n + ' points' + (S ? ', point moyen G' + couple(S.mx, S.my) : '') +
      (M && M.a !== null ? ', droite de Mayer ' + txtEquation(M.a, M.b, 3) : ''))
  }
}

if (!customElements.get('nuage-mayer-widget')) customElements.define('nuage-mayer-widget', NuageMayerWidget)
