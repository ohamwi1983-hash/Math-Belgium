/* ================================================================
 * <simulateur-jeu-esperance-widget> — atelier « Simulateur de jeu »
 * (6e, ch. 8, § 1, Jeux et gains). On choisit un jeu (le jeu favorable
 * du cours, le jeu à mise du cours, un dé), puis on joue 10, 100 ou
 * 1 000 parties d'un coup (jusqu'à 10 000 par série, 3 séries
 * superposées) : le gain moyen oscille au début puis se rapproche de
 * E(X). Un curseur de mise m (retirée de chaque gain) rend le jeu
 * favorable, équitable (E = 0 quand m = E(gain du jeu)) ou défavorable.
 * Les parties sont gardées en mémoire (sommes cumulées des gains du
 * jeu) : changer la mise recalcule tout sans rejouer (gain moyen − m).
 * Tableau des fréquences observées : le gain moyen est Σ xᵢ × fᵢ, la
 * même somme que E(X) avec les fréquences à la place des probabilités.
 * Figure : abscisse LOGARITHMIQUE fixe (1 à 10 000 parties, comme
 * `stabilisation-frequences-widget`), ordonnée = gain moyen, fenêtre du
 * plus petit au plus grand gain (ou « Loupe » : E ± 1 €). Couleurs :
 * E = accent (droite pointillée et texte), séries = bleu / violet / rose,
 * « 0 € » = gris. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'
import { arrondi, texCourt, txtCourt, txtFixe, pasJoli, curseurHTML, lierCurseur, majCurseur, borner } from './variables-aleatoires-commun.js'

var W = 400, H = 240, GX = 44, DX = 14, HY = 14, BY = 32
var N_MAX = 10000, SERIES_MAX = 3, M_MAX = 5
var JEUX = [
  { nom: 'Jeu du cours', sous: '−2 €, 3 €, 5 €', x: [-2, 3, 5], p: [0.4, 0.35, 0.25], pTex: ['0{,}4', '0{,}35', '0{,}25'] },
  { nom: 'Jeu avec mise', sous: '10 €, 4 €, −6 €', x: [10, 4, -6], p: [0.2, 0.3, 0.5], pTex: ['0{,}2', '0{,}3', '0{,}5'] },
  { nom: 'Dé', sous: '6 : 12 €, 5 : 3 €, sinon 0 €', x: [12, 3, 0], p: [1 / 6, 1 / 6, 4 / 6], pTex: ['\\tfrac{1}{6}', '\\tfrac{1}{6}', '\\tfrac{4}{6}'],
    issues: ['6', '5', '1 à 4'] },
]
var CLS_SERIES = ['s0', 's1', 's2']
var LMIN = 0, LMAX = 4 // log10 de 1 et de 10 000
function sx(n) { return GX + ((Math.log10(n) - LMIN) / (LMAX - LMIN)) * (W - GX - DX) }
function eur(v, d) { return txtCourt(v, d === undefined ? 2 : d) + ' €' }
function xTex(v) { return v < 0 ? '(' + texCourt(v, 2) + ')' : texCourt(v, 2) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}[hidden]{display:none !important;}' +
  '.figure svg{max-width:470px;}' +
  '.serie{fill:none;stroke-width:1.6;stroke-linejoin:round;}' +
  '.serie.s0{stroke:var(--sky,#2f6fb0);}.serie.s1{stroke:var(--plan,#5b4ea3);}.serie.s2{stroke:var(--rose,#b23a7a);}' +
  '.serie.courante{stroke-width:2.4;}' +
  '.ligne-e{stroke:var(--accent,#b65c1f);stroke-width:2;stroke-dasharray:6 4;}' +
  '.ligne-0{stroke:var(--ink-soft,#51626f);stroke-width:1.2;}' +
  '.et{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.et-e{fill:var(--accent-ink,#7a3c11);}.et-0{fill:var(--ink-soft,#51626f);}' +
  '.vide{font-size:12px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);text-anchor:middle;}' +
  '.jeux .btn small{display:block;font-weight:400;font-size:0.72rem;color:var(--ink-soft,#51626f);}' +
  '.jeux .btn,.jouer .btn{font-size:0.86rem;}' +
  '.curseur .nom{min-width:96px;}' +
  '.t-e{color:var(--accent-ink,#7a3c11);font-weight:700;}' +
  '.verdict{display:inline-block;border-radius:999px;padding:2px 12px;font-weight:700;font-size:0.88rem;border:1.5px solid;}' +
  '.verdict.fav{color:var(--good,#2f7a4f);border-color:var(--good,#2f7a4f);background:var(--good-soft,#dcefe2);}' +
  '.verdict.equ{color:var(--sky-ink,#1f4e7d);border-color:var(--sky,#2f6fb0);background:var(--sky-soft,#dde9f5);}' +
  '.verdict.def{color:var(--bad,#b23a3a);border-color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dddd);}' +
  '.calc p{line-height:2;}' +
  '.defile{overflow-x:auto;margin:6px 0 0;}' +
  'table{border-collapse:collapse;font-size:0.86rem;font-variant-numeric:tabular-nums;margin:0 auto;}' +
  'th,td{border:1px solid var(--line,#ccd8e0);padding:3px 8px;text-align:center;white-space:nowrap;}' +
  'th{background:var(--surface-2,#f7f9fb);color:var(--ink-soft,#51626f);font-weight:600;white-space:normal;}' +
  '.pastille{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:middle;}' +
  '.pastille.s0{background:var(--sky,#2f6fb0);}.pastille.s1{background:var(--plan,#5b4ea3);}.pastille.s2{background:var(--rose,#b23a7a);}' +
  '</style>' +
  '<div class="rangee jeux" role="group" aria-label="Jeu">' +
  JEUX.map(function (j, i) { return '<button class="btn" data-j="' + i + '">' + j.nom + '<small>' + j.sous + '</small></button>' }).join('') +
  '</div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gain moyen en fonction du nombre de parties jouées"></svg></div>' +
  '<div class="rangee jouer" role="group" aria-label="Jouer">' +
  '<button class="btn" data-plus="10">+10 parties</button><button class="btn" data-plus="100">+100</button><button class="btn" data-plus="1000">+1 000</button>' +
  '<button class="btn" id="nouvelle">Nouvelle série</button><button class="btn" id="effacer">Tout effacer</button>' +
  '<button class="btn" id="loupe" aria-pressed="false">Loupe autour de E</button></div>' +
  curseurHTML('m', 'Mise m', 0, M_MAX, 0.05) +
  '<div class="panneau calc" id="calc" aria-live="polite"></div>'

class SimulateurJeuEsperanceWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._jeu = 0
    this._m = 0
    this._loupe = false
    this._series = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelectorAll('[data-j]').forEach(function (b) {
      b.addEventListener('click', function () {
        var j = +b.getAttribute('data-j')
        if (j === self._jeu) return
        self._jeu = j; self._m = 0; self._series = []
        self._rendre()
      })
    })
    sh.querySelectorAll('[data-plus]').forEach(function (b) {
      b.addEventListener('click', function () { self._jouer(+b.getAttribute('data-plus')) })
    })
    sh.getElementById('nouvelle').addEventListener('click', function () {
      if (self._series.length >= SERIES_MAX) self._series.shift()
      self._series.push(self._serieVide())
      self._jouer(0)
    })
    sh.getElementById('effacer').addEventListener('click', function () { self._series = []; self._rendre() })
    sh.getElementById('loupe').addEventListener('click', function () { self._loupe = !self._loupe; self._rendre() })
    lierCurseur(sh, 'm', function () { return self._m }, function (v) { self._m = arrondi(borner(v, 0, M_MAX), 2); self._rendre() }, 0.05)
    this._rendre()
  }

  _serieVide() {
    return { n: 0, cumul: new Float64Array(N_MAX + 1), compte: [0, 0, 0] }
  }

  _jouer(nb) {
    var jeu = JEUX[this._jeu]
    if (!this._series.length) this._series.push(this._serieVide())
    var s = this._series[this._series.length - 1]
    var fin = Math.min(N_MAX, s.n + nb)
    for (var i = s.n + 1; i <= fin; i++) {
      var u = Math.random(), r = 0, acc = jeu.p[0]
      while (u >= acc && r < jeu.p.length - 1) { r++; acc += jeu.p[r] }
      s.compte[r]++
      s.cumul[i] = s.cumul[i - 1] + jeu.x[r]
    }
    s.n = fin
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, jeu = JEUX[this._jeu], m = this._m, self = this
    sh.querySelectorAll('[data-j]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-j') === self._jeu)) })
    sh.getElementById('loupe').setAttribute('aria-pressed', String(this._loupe))
    majCurseur(sh, 'm', m, 'm=' + texCourt(m, 2) + '\\text{ €}')
    var cour = this._series.length ? this._series[this._series.length - 1] : null
    sh.querySelectorAll('[data-plus]').forEach(function (b) { b.disabled = !!cour && cour.n >= N_MAX })
    sh.getElementById('effacer').disabled = !this._series.length

    var EX = 0
    for (var i = 0; i < 3; i++) EX += jeu.x[i] * jeu.p[i]
    EX = arrondi(EX, 6)
    var EG = arrondi(EX - m, 6)

    // ---------- Calculs ----------
    var termes = jeu.x.map(function (x, i) { return tex((i ? '+' : '') + xTex(x) + '\\times ' + jeu.pTex[i]) }).join(' ')
    var h = '<p><span class="t-e">Espérance du jeu</span> ' + tex('E(X)=') + ' ' + termes + ' ' + tex('=' + texCourt(EX, 2)) + ' €</p>'
    if (m > 0) h += '<p>Avec la mise : ' + tex('E(X-m)=E(X)-m=' + texCourt(EX, 2) + '-' + texCourt(m, 2) + '=' + texCourt(EG, 2)) + ' €</p>'
    var cls = Math.abs(EG) < 1e-9 ? 'equ' : EG > 0 ? 'fav' : 'def'
    var mot = cls === 'equ' ? 'équitable' : cls === 'fav' ? 'favorable au joueur' : 'défavorable au joueur'
    h += '<p><span class="verdict ' + cls + '">Jeu ' + mot + '</span> ' +
      (cls === 'equ' ? (m > 0 ? 'La mise est égale à E(X) : en moyenne, on ne gagne ni ne perd rien.' : 'E(X) = 0.')
        : 'Règle la mise m pour que l’espérance du gain soit nulle.') + '</p>'
    if (cour && cour.n > 0) {
      var N = cour.n, tot = cour.cumul[N] - m * N, moy = tot / N
      h += '<p>Série en cours : <strong>' + txtCourt(N, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '</strong> partie' + (N > 1 ? 's' : '') +
        ', gain total ' + eur(tot) + ', <strong>gain moyen ' + (Math.abs(moy - arrondi(moy, 2)) < 1e-9 ? '' : '≈ ') + eur(moy) + '</strong> (E = ' + eur(EG) + ').</p>'
      h += '<div class="defile"><table><thead><tr>' + (jeu.issues ? '<th>Dé</th>' : '') + '<th>' + (m > 0 ? 'Gain − mise' : 'Gain') + '</th><th>Probabilité</th><th>Fréquence observée</th></tr></thead><tbody>' +
        jeu.x.map(function (x, i) { return '<tr>' + (jeu.issues ? '<td>' + jeu.issues[i] + '</td>' : '') + '<td>' + eur(x - m) + '</td><td>' + tex(jeu.pTex[i]) + '</td><td>' + txtFixe(cour.compte[i] / N, 3) + '</td></tr>' }).join('') +
        '</tbody></table></div>' +
        '<p>Le gain moyen est la somme des gains × leurs <strong>fréquences</strong> ; quand les fréquences se rapprochent des probabilités, le gain moyen se rapproche de E.</p>'
    } else {
      h += '<p>Joue des parties : le gain moyen va se rapprocher de E.</p>'
    }
    sh.getElementById('calc').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var ymin, ymax
    if (this._loupe) { ymin = EG - 1; ymax = EG + 1 } else {
      ymin = Math.min.apply(null, jeu.x) - m; ymax = Math.max.apply(null, jeu.x) - m
      var marge = (ymax - ymin) * 0.06; ymin -= marge; ymax += marge
    }
    var sy = function (y) { return H - BY - ((y - ymin) / (ymax - ymin)) * (H - BY - HY) }
    var clip = svgEl('clipPath', { id: 'cadre' })
    clip.appendChild(svgEl('rect', { x: GX, y: HY, width: W - GX - DX, height: H - BY - HY }))
    svg.querySelector('defs').appendChild(clip)
    var py = pasJoli(ymax - ymin, 6), dec = py < 1 ? (py < 0.1 ? 2 : 1) : 0
    for (var y = Math.ceil(ymin / py) * py; y <= ymax + 1e-9; y += py) {
      svg.appendChild(svgEl('line', { x1: GX, x2: W - DX, y1: sy(y), y2: sy(y), class: 'grille' }))
      var ty = svgEl('text', { x: GX - 5, y: sy(y) + 3.5, 'text-anchor': 'end', class: 'tick-label' })
      ty.textContent = txtFixe(y, dec)
      svg.appendChild(ty)
    }
    // Ligne 0 € et ligne E
    var etE = sy(EG), et0 = sy(0), proches = Math.abs(etE - et0) < 14
    if (0 >= ymin && 0 <= ymax && Math.abs(EG) > 1e-9) {
      svg.appendChild(svgEl('line', { x1: GX, x2: W - DX, y1: et0, y2: et0, class: 'ligne-0' }))
      var t0 = svgEl('text', { x: W - DX - 2, y: et0 + (proches && et0 > etE ? 13 : proches ? -5 : -5), 'text-anchor': 'end', class: 'et et-0' })
      if (proches && et0 > etE) t0.setAttribute('y', et0 + 13)
      t0.textContent = '0 € (jeu équitable)'
      svg.appendChild(t0)
    }
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX, y1: etE, y2: etE, class: 'ligne-e' }))
    var tE = svgEl('text', { x: GX + 6, y: proches && etE > et0 ? etE + 13 : etE - 5, 'text-anchor': 'start', class: 'et et-e' })
    tE.textContent = 'E = ' + eur(EG) + (Math.abs(EG) < 1e-9 ? ' (jeu équitable)' : '')
    svg.appendChild(tE)
    // Séries
    this._series.forEach(function (s, idx) {
      if (!s.n) return
      var d = '', n = 1, dernier = 0
      while (n <= s.n) {
        var yv = s.cumul[n] / n - m
        d += (d ? ' L' : 'M') + sx(n).toFixed(1) + ',' + sy(yv).toFixed(1)
        dernier = n
        n = n < 60 ? n + 1 : Math.max(n + 1, Math.round(n * 1.02))
      }
      if (dernier !== s.n) d += ' L' + sx(s.n).toFixed(1) + ',' + sy(s.cumul[s.n] / s.n - m).toFixed(1)
      svg.appendChild(svgEl('path', { d: d, class: 'serie ' + CLS_SERIES[idx] + (idx === self._series.length - 1 ? ' courante' : ''), 'clip-path': 'url(#cadre)' }))
    })
    if (!cour || !cour.n) {
      var tv = svgEl('text', { x: (GX + W - DX) / 2, y: HY + 24, class: 'vide' })
      tv.textContent = 'Aucune partie jouée'
      svg.appendChild(tv)
    }
    // Axes (abscisse logarithmique)
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: H - BY, y2: H - BY, class: 'axe', 'marker-end': 'url(#fleche)' }))
    svg.appendChild(svgEl('line', { x1: GX, x2: GX, y1: H - BY, y2: HY - 6, class: 'axe', 'marker-end': 'url(#fleche)' }))
    ;[1, 10, 100, 1000, 10000].forEach(function (v) {
      svg.appendChild(svgEl('line', { x1: sx(v), x2: sx(v), y1: H - BY, y2: H - BY + 4, class: 'tick' }))
      var tx = svgEl('text', { x: sx(v), y: H - BY + 15, 'text-anchor': v === 10000 ? 'end' : 'middle', class: 'tick-label' })
      tx.textContent = v === 10000 ? '10 000' : v === 1000 ? '1 000' : String(v)
      svg.appendChild(tx)
    })
    var na = svgEl('text', { x: (GX + W - DX) / 2, y: H - 4, 'text-anchor': 'middle', class: 'tick-label' })
    na.textContent = 'nombre de parties (échelle logarithmique)'
    svg.appendChild(na)
    var ny = svgEl('text', { x: GX + 4, y: HY - 4, class: 'tick-label' })
    ny.textContent = 'gain moyen (€)'
    svg.appendChild(ny)
  }
}

if (!customElements.get('simulateur-jeu-esperance-widget')) customElements.define('simulateur-jeu-esperance-widget', SimulateurJeuEsperanceWidget)
