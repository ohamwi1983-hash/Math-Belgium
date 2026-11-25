/* ================================================================
 * <table-phi-widget> — atelier « Table de Φ interactive » (6e, ch. 8,
 * § 6, loi normale). Cloche de 𝒩(0 ; 1) à fenêtre FIXE (z de −4 à 4),
 * curseur z au centième : l'aire teintée apparaît et la case de la table
 * s'allume (ligne 1,2 / colonne 0,04 pour z = 1,24). Quatre modes :
 * P(Z ≤ z), P(Z ≥ z), P(a ≤ Z ≤ b) et sens inverse (on donne p, l'élève
 * déplace z jusqu'à la case la plus proche ; à égale distance de deux
 * cases, on prend le milieu : 1,645). Les valeurs sont celles de la
 * TABLE (z arrondi au centième, Φ à 4 décimales) ; z négatif : la table
 * ne donne que z ≥ 0, on passe par Φ(−z) = 1 − Φ(z). Une case touchée
 * règle |z|. Couleurs : borne b / z = accent, borne a = bleu (texte,
 * case et trait de même couleur). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'
import { densite, arrondi, phiTable, texFixe, texCourt, txtFixe, curseurHTML, lierCurseur, majCurseur, borner } from './variables-aleatoires-commun.js'

var W = 400, H = 210, GX = 14, DX = 14, HY = 22, BY = 30
var XMIN = -4, XMAX = 4, YMAX = 0.43
var ZMAX = 3.99
var P_PRESETS = [0.95, 0.975, 0.9, 0.8, 0.05, 0.3]
function sx(z) { return GX + ((z - XMIN) / (XMAX - XMIN)) * (W - GX - DX) }
function sy(y) { return H - BY - (y / YMAX) * (H - BY - HY) }
function lig(z) { return Math.floor(arrondi(Math.abs(z), 2) * 10 + 1e-9) / 10 }
function col(z) { return Math.round((arrondi(Math.abs(z), 2) - lig(z)) * 100) }
function texZ(z) { return texFixe(z, 2) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}[hidden]{display:none !important;}' +
  '.figure svg{max-width:460px;}' +
  '.cloche{fill:none;stroke:var(--ink,#182430);stroke-width:2;}' +
  '.aire{fill:var(--accent,#b65c1f);opacity:0.35;}' +
  '.trait-b{stroke:var(--accent,#b65c1f);stroke-width:2;}.trait-a{stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
  '.trait-p{stroke:var(--good,#2f7a4f);stroke-width:2;stroke-dasharray:5 4;}' +
  '.et{font-size:11.5px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.et-b{fill:var(--accent-ink,#7a3c11);}.et-a{fill:var(--sky-ink,#1f4e7d);}.et-p{fill:var(--good,#2f7a4f);}' +
  '.t-b{color:var(--accent-ink,#7a3c11);font-weight:700;}.t-a{color:var(--sky-ink,#1f4e7d);font-weight:700;}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.curseur .nom{min-width:86px;}' +
  '.modes .btn{font-size:0.88rem;}' +
  '.boite{max-height:250px;overflow:auto;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);margin:0 0 10px;position:relative;}' +
  'table{border-collapse:separate;border-spacing:0;font-size:0.8rem;font-variant-numeric:tabular-nums;}' +
  'th,td{border-right:1px solid var(--line,#ccd8e0);border-bottom:1px solid var(--line,#ccd8e0);padding:3px 6px;text-align:center;white-space:nowrap;}' +
  'thead th{position:sticky;top:0;z-index:2;background:var(--surface-2,#f7f9fb);color:var(--ink-soft,#51626f);}' +
  'tbody th{position:sticky;left:0;z-index:1;background:var(--surface-2,#f7f9fb);color:var(--ink-soft,#51626f);}' +
  'thead th:first-child{left:0;z-index:3;}' +
  'td{cursor:pointer;background:var(--surface,#fff);}' +
  'th.allume{background:var(--attn-soft,#f7ecd6);color:var(--ink,#182430);}' +
  'td.lig,td.col{background:var(--surface-2,#f7f9fb);}' +
  'td.case-b{background:var(--accent,#b65c1f);color:var(--on-accent,#fff);font-weight:700;}' +
  'td.case-a{background:var(--sky,#2f6fb0);color:var(--on-sky,#fff);font-weight:700;}' +
  'td.case-p{outline:3px solid var(--good,#2f7a4f);outline-offset:-3px;font-weight:700;}' +
  '.note{font-size:0.84rem;color:var(--ink-soft,#51626f);margin:0 0 8px;}' +
  '.calc{line-height:2;}' +
  '.cible{font-size:1.05rem;text-align:center;margin:0 0 8px;}' +
  '</style>' +
  '<div class="rangee modes" role="group" aria-label="Ce qu’on cherche">' +
  '<button class="btn" data-mode="le"></button><button class="btn" data-mode="ge"></button>' +
  '<button class="btn" data-mode="ab"></button><button class="btn" data-mode="inv">Sens inverse</button></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe de la loi normale centrée réduite et aire teintée"></svg></div>' +
  '<div class="cible" id="cible"></div>' +
  '<div class="rangee" id="presets" role="group" aria-label="Probabilité donnée">' +
  P_PRESETS.map(function (p, i) { return '<button class="btn" data-p="' + i + '">' + txtFixe(p, p === 0.975 ? 3 : 2) + '</button>' }).join('') +
  '<button class="btn" id="hasard">Au hasard</button><button class="btn" id="montrer">Montrer la case</button></div>' +
  '<div class="reglages">' +
  '<div id="bloc-a">' + curseurHTML('a', 'Borne a', -ZMAX, ZMAX, 0.01) + '</div>' +
  '<div id="bloc-z">' + curseurHTML('z', 'Valeur de z', -ZMAX, ZMAX, 0.01) + '</div>' +
  '</div>' +
  '<div class="panneau calc" id="calc" aria-live="polite"></div>' +
  '<p class="note" id="note"></p>' +
  '<div class="boite" id="boite"><table><thead><tr><th scope="col">z</th>' +
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (c) { return '<th scope="col" data-c="' + c + '">0,0' + c + '</th>' }).join('') +
  '</tr></thead><tbody id="corps"></tbody></table></div>'

class TablePhiWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._mode = 'le'
    this._z = 1.5
    this._a = -1
    this._p = 0.95
    this._montre = false
    this._actif = 'z'
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    // Table : lignes 0,0 à 3,9, colonnes 0,00 à 0,09.
    var h = ''
    for (var r = 0; r < 40; r++) {
      h += '<tr><th scope="row" data-r="' + r + '">' + txtFixe(r / 10, 1) + '</th>'
      for (var c = 0; c < 10; c++) h += '<td data-r="' + r + '" data-c="' + c + '">' + txtFixe(phiTable(r / 10 + c / 100), 4) + '</td>'
      h += '</tr>'
    }
    sh.getElementById('corps').innerHTML = h
    sh.querySelector('[data-mode="le"]').innerHTML = tex('P(Z\\leq z)')
    sh.querySelector('[data-mode="ge"]').innerHTML = tex('P(Z\\geq z)')
    sh.querySelector('[data-mode="ab"]').innerHTML = tex('P(a\\leq Z\\leq b)')
    sh.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        self._mode = b.getAttribute('data-mode')
        self._montre = false
        if (self._mode === 'ab' && self._a > self._z) self._a = -self._z
        self._rendre(true)
      })
    })
    lierCurseur(sh, 'z', function () { return self._z }, function (v) {
      self._z = arrondi(borner(v, -ZMAX, ZMAX), 2)
      if (self._mode === 'ab' && self._a > self._z) self._a = self._z
      self._actif = 'z'
      self._rendre(true)
    }, 0.01)
    lierCurseur(sh, 'a', function () { return self._a }, function (v) {
      self._a = arrondi(borner(v, -ZMAX, ZMAX), 2)
      if (self._z < self._a) self._z = self._a
      self._actif = 'a'
      self._rendre(true)
    }, 0.01)
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () { self._p = P_PRESETS[+b.getAttribute('data-p')]; self._montre = false; self._rendre(false) })
    })
    sh.getElementById('hasard').addEventListener('click', function () {
      var p
      do { p = arrondi(0.02 + Math.random() * 0.96, 4) } while (Math.abs(p - 0.5) < 0.02 || p === self._p)
      self._p = p
      self._montre = false
      self._rendre(false)
    })
    sh.getElementById('montrer').addEventListener('click', function () { self._montre = true; self._rendre(true) })
    sh.getElementById('corps').addEventListener('click', function (ev) {
      var td = ev.target.closest && ev.target.closest('td')
      if (!td) return
      var v = +td.getAttribute('data-r') / 10 + +td.getAttribute('data-c') / 100
      var cle = self._mode === 'ab' ? self._actif : 'z'
      var signe = self['_' + cle] < 0 ? -1 : 1
      self['_' + cle] = arrondi(signe * v, 2)
      if (self._mode === 'ab') {
        if (cle === 'z' && self._z < self._a) self._a = self._z
        if (cle === 'a' && self._a > self._z) self._z = self._a
      }
      self._rendre(false)
    })
    this._rendre(true)
  }

  /** Meilleure(s) case(s) pour Φ(z) = q (q ≥ 0,5) : liste des z au centième à l'écart minimal. */
  _meilleures(q) {
    var best = Infinity, res = []
    for (var i = 0; i <= 399; i++) {
      var t = i / 100, e = Math.abs(phiTable(t) - q)
      if (e < best - 1e-9) { best = e; res = [t] } else if (Math.abs(e - best) < 1e-9) res.push(t)
    }
    return res
  }

  _rendre(defiler) {
    var sh = this._sh, mode = this._mode, z = this._z, a = this._a
    sh.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode)) })
    var inv = mode === 'inv'
    sh.getElementById('bloc-a').hidden = mode !== 'ab'
    sh.getElementById('presets').hidden = !inv
    sh.getElementById('cible').hidden = !inv
    majCurseur(sh, 'z', z, (mode === 'ab' ? 'b' : 'z') + '=' + texZ(z))
    majCurseur(sh, 'a', a, 'a=' + texZ(a))

    // ---------- Valeurs (table) ----------
    var cases = [] // { z, cls }
    var calc = '', note = '', aires = []
    var phiTxt = function (t) { return '\\Phi(' + texZ(t) + ')' }
    var lecture = function (t) { // morceaux LaTeX pour Φ(t), t quelconque
      if (t >= 0) return { valeur: phiTable(t), etapes: [phiTxt(t), '\\approx ' + texFixe(phiTable(t), 4)] }
      return { valeur: arrondi(1 - phiTable(t), 4), etapes: [phiTxt(t), '1-' + phiTxt(-t), '\\approx 1-' + texFixe(phiTable(t), 4), texFixe(1 - phiTable(t), 4)] }
    }
    if (mode === 'le') {
      var L = lecture(z)
      cases.push({ z: z, cls: 'case-b' })
      aires.push([XMIN, z])
      calc = '<p>' + texEgalites(['P(Z\\leq ' + texZ(z) + ')'].concat(L.etapes)) + '</p>'
      note = z < 0 ? 'z est négatif : la table ne donne que Φ(z) pour z ≥ 0. Par symétrie de la cloche, l’aire à gauche de ' + txtFixe(z, 2) + ' égale l’aire à droite de ' + txtFixe(-z, 2) + '.'
        : 'Φ(z) est toujours l’aire à GAUCHE de z. Ligne ' + txtFixe(lig(z), 1) + ', colonne 0,0' + col(z) + '.'
    } else if (mode === 'ge') {
      cases.push({ z: z, cls: 'case-b' })
      aires.push([z, XMAX])
      if (z >= 0) calc = '<p>' + texEgalites(['P(Z\\geq ' + texZ(z) + ')', '1-' + phiTxt(z), '\\approx 1-' + texFixe(phiTable(z), 4), texFixe(1 - phiTable(z), 4)]) + '</p>'
      else calc = '<p>' + texEgalites(['P(Z\\geq ' + texZ(z) + ')', '1-' + phiTxt(z), '1-\\bigl(1-' + phiTxt(-z) + '\\bigr)', phiTxt(-z), '\\approx ' + texFixe(phiTable(z), 4)]) + '</p>'
      note = '« Au moins » : complément de l’aire à gauche (le strict ou le large ne change rien, P(Z = z) = 0).'
    } else if (mode === 'ab') {
      var La = lecture(a), Lb = lecture(z), val = arrondi(Lb.valeur - La.valeur, 4)
      cases.push({ z: z, cls: 'case-b' })
      if (lig(a) !== lig(z) || col(a) !== col(z)) cases.push({ z: a, cls: 'case-a' })
      aires.push([a, z])
      calc = '<p>' + texEgalites(['P(' + texZ(a) + '\\leq Z\\leq ' + texZ(z) + ')', '\\Phi(' + texZ(z) + ')-\\Phi(' + texZ(a) + ')']) +
        ' ' + tex('\\approx') + ' <span class="t-b">' + tex(texFixe(Lb.valeur, 4)) + '</span> ' + tex('-') + ' <span class="t-a">' + tex(texFixe(La.valeur, 4)) + '</span> ' + tex('=' + texFixe(val, 4)) + '</p>'
      if (Math.abs(a + z) < 1e-9 && z > 0) {
        calc += '<p>Intervalle symétrique : ' + texEgalites(['P(-k\\leq Z\\leq k)', '2\\Phi(k)-1', '\\approx 2\\times ' + texFixe(phiTable(z), 4) + '-1', texFixe(2 * phiTable(z) - 1, 4)]) + '.</p>'
      }
      var det = []
      if (a < 0) det.push(tex('\\Phi(' + texZ(a) + ')=1-\\Phi(' + texZ(-a) + ')'))
      if (z < 0) det.push(tex('\\Phi(' + texZ(z) + ')=1-\\Phi(' + texZ(-z) + ')'))
      note = 'On SOUSTRAIT deux lectures, jamais on ne les additionne.' + (det.length ? ' Bornes négatives : ' : '') + det.join(' ; ') + (det.length ? '.' : '')
    } else {
      var p = this._p, q = p >= 0.5 ? p : 1 - p
      var best = this._meilleures(q), signe = p >= 0.5 ? 1 : -1
      var trouve = best.some(function (t) { return Math.abs(signe * t - z) < 1e-9 })
      var vz = z >= 0 ? phiTable(z) : arrondi(1 - phiTable(z), 4)
      sh.getElementById('cible').innerHTML = 'On cherche ' + tex('z') + ' tel que ' + tex('\\Phi(z)=' + texCourt(p, 4)) + '.'
      cases.push({ z: z, cls: 'case-b' })
      aires.push([XMIN, z])
      calc = '<p>' + tex('\\Phi(' + texZ(z) + ')' + (vz === p ? '=' : vz < p ? '<' : '>') + texCourt(p, 4)) + ' : ' +
        (trouve ? '<span class="ok">' + (best.length > 1 ? 'c’est l’une des deux cases les plus proches.' : 'c’est la case la plus proche.') + '</span>' : (vz < p ? 'augmente z.' : 'diminue z.')) + ' (Lecture : ' + tex(texFixe(vz, 4)) + '.)</p>'
      if (p < 0.5) calc += '<p>' + tex('p<0{,}5') + ' : z est négatif. On cherche ' + tex('1-p=' + texCourt(q, 4)) + ' dans la table, puis on change le signe.</p>'
      if (this._montre || trouve) {
        if (best.length > 1) {
          var milieu = (best[0] + best[best.length - 1]) / 2
          calc += '<p>' + tex(texCourt(q, 4)) + ' tombe pile entre ' + tex('\\Phi(' + texZ(best[0]) + ')\\approx ' + texFixe(phiTable(best[0]), 4)) + ' et ' +
            tex('\\Phi(' + texZ(best[best.length - 1]) + ')\\approx ' + texFixe(phiTable(best[best.length - 1]), 4)) + ' : on prend le milieu, ' + tex('z\\approx ' + texFixe(signe * milieu, 3)) + '.</p>'
        } else {
          calc += '<p>Case la plus proche : ' + tex('\\Phi(' + texZ(best[0]) + ')\\approx ' + texFixe(phiTable(best[0]), 4)) + ', donc ' + tex('z\\approx ' + texZ(signe * best[0])) + '.</p>'
        }
        best.forEach(function (t) { cases.push({ z: t, cls: 'case-p' }) })
      }
      note = 'Convention : on prend la case dont la valeur est la plus proche de la probabilité ; à égale distance de deux cases, on prend le milieu des deux valeurs de z.'
    }
    sh.getElementById('calc').innerHTML = calc
    sh.getElementById('note').innerHTML = note

    // ---------- Table : cases allumées ----------
    sh.querySelectorAll('td.case-b,td.case-a,td.case-p,td.lig,td.col,th.allume').forEach(function (el) { el.classList.remove('case-b', 'case-a', 'case-p', 'lig', 'col', 'allume') })
    var principale = null
    cases.forEach(function (cz) {
      var r = Math.round(lig(cz.z) * 10), c = col(cz.z)
      var td = sh.querySelector('td[data-r="' + r + '"][data-c="' + c + '"]')
      if (!td) return
      td.classList.add(cz.cls)
      if (cz.cls === 'case-b') {
        principale = td
        sh.querySelectorAll('td[data-r="' + r + '"]').forEach(function (x) { if (x !== td) x.classList.add('lig') })
        sh.querySelectorAll('td[data-c="' + c + '"]').forEach(function (x) { if (x !== td) x.classList.add('col') })
        sh.querySelector('th[data-r="' + r + '"]').classList.add('allume')
        sh.querySelector('thead th[data-c="' + c + '"]').classList.add('allume')
      }
    })
    if (defiler && principale) {
      var boite = sh.getElementById('boite'), tr = principale.parentNode
      boite.scrollTop = Math.max(0, tr.offsetTop - boite.clientHeight / 2 + tr.offsetHeight / 2)
      var gauche = principale.offsetLeft - 60
      if (principale.offsetLeft + principale.offsetWidth > boite.scrollLeft + boite.clientWidth || principale.offsetLeft < boite.scrollLeft + 50) boite.scrollLeft = Math.max(0, gauche)
    }

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    aires.forEach(function (ab) {
      var d = 'M' + sx(ab[0]).toFixed(1) + ',' + sy(0).toFixed(1)
      for (var i = 0; i <= 120; i++) { var t = ab[0] + (ab[1] - ab[0]) * i / 120; d += ' L' + sx(t).toFixed(1) + ',' + sy(densite(t, 0, 1)).toFixed(1) }
      d += ' L' + sx(ab[1]).toFixed(1) + ',' + sy(0).toFixed(1) + ' Z'
      svg.appendChild(svgEl('path', { d: d, class: 'aire' }))
    })
    var dc = ''
    for (var i = 0; i <= 200; i++) { var t = XMIN + (XMAX - XMIN) * i / 200; dc += (i ? ' L' : 'M') + sx(t).toFixed(1) + ',' + sy(densite(t, 0, 1)).toFixed(1) }
    svg.appendChild(svgEl('path', { d: dc, class: 'cloche' }))
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: sy(0), y2: sy(0), class: 'axe', 'marker-end': 'url(#fleche)' }))
    for (var k = -3; k <= 3; k++) {
      svg.appendChild(svgEl('line', { x1: sx(k), x2: sx(k), y1: sy(0), y2: sy(0) + 4, class: 'tick' }))
      var tl = svgEl('text', { x: sx(k), y: sy(0) + 16, 'text-anchor': 'middle', class: 'tick-label' })
      tl.textContent = String(k).replace('-', '−')
      svg.appendChild(tl)
    }
    var nz = svgEl('text', { x: W - DX - 2, y: sy(0) - 6, 'text-anchor': 'end', class: 'nom-axe' })
    nz.textContent = 'z'
    svg.appendChild(nz)
    var marque = function (t, cls, txt, haut) {
      svg.appendChild(svgEl('line', { x1: sx(t), x2: sx(t), y1: sy(0), y2: haut, class: 'trait-' + cls }))
      var anc = sx(t) < GX + 40 ? 'start' : sx(t) > W - DX - 40 ? 'end' : 'middle'
      var e = svgEl('text', { x: sx(t), y: haut - 5, 'text-anchor': anc, class: 'et et-' + cls })
      e.textContent = txt
      svg.appendChild(e)
    }
    if (mode === 'ab') {
      var serre = Math.abs(sx(z) - sx(a)) < 64
      marque(a, 'a', 'a = ' + txtFixe(a, 2), serre ? HY + 16 : HY + 2)
      marque(z, 'b', 'b = ' + txtFixe(z, 2), HY + 2)
    } else {
      marque(z, 'b', 'z = ' + txtFixe(z, 2), HY + 2)
    }
  }
}

if (!customElements.get('table-phi-widget')) customElements.define('table-phi-widget', TablePhiWidget)
