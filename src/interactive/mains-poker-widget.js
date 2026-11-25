/* ================================================================
 * <mains-poker-widget> — atelier « Mains de poker » (6e, ch. 7, § 4).
 * Jeu de 32 cartes (8 hauteurs : 7, 8, 9, 10, V, D, R, A × 4 couleurs).
 * « Tirer une main » : 5 cartes au hasard, classées comme dans le cours,
 * par les hauteurs seulement (carré, full, brelan, deux paires, paire,
 * sans paire), cartes de la combinaison mises en évidence, calcul en
 * deux étapes de l'effectif de sa catégorie. « Simuler 10 000 mains » :
 * fréquences observées contre probabilités exactes (diagramme à
 * échelle FIXE 0 à 0,6 et tableau). La partition est complète :
 * 224 + 1 344 + 10 752 + 24 192 + 107 520 + 57 344 = 201 376 = C₃₂⁵.
 * Un clic sur une ligne du tableau montre le calcul de la catégorie.
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE, svgEl } from './katex-shadow.js'

var HAUTEURS = ['7', '8', '9', '10', 'V', 'D', 'R', 'A']
var NOMS_HAUTEURS = ['7', '8', '9', '10', 'valet', 'dame', 'roi', 'as']
var COULEURS = [
  { s: '♠︎', nom: 'pique', rouge: false },
  { s: '♥︎', nom: 'cœur', rouge: true },
  { s: '♦︎', nom: 'carreau', rouge: true },
  { s: '♣︎', nom: 'trèfle', rouge: false },
]
var TOTAL = 201376
var CATS = [
  {
    cle: 'carre', nom: 'Carré', eff: 224, motif: '41',
    etapes: ['8\\times C_4^4=8', '7\\times 4=28'], calc: ['8\\times 28', '224'],
    e1: 'la hauteur du carré (8 choix) et ses 4 couleurs, forcées', e2: 'la 5ᵉ carte : une des 7 autres hauteurs, une des 4 couleurs',
  },
  {
    cle: 'full', nom: 'Full', eff: 1344, motif: '32',
    etapes: ['8\\times C_4^3=32', '7\\times C_4^2=42'], calc: ['32\\times 42', '1\\,344'],
    e1: 'la hauteur du brelan et 3 de ses 4 couleurs', e2: 'la hauteur de la paire (7 restantes) et 2 de ses 4 couleurs',
    piege: 'Les deux hauteurs n’ont pas le même rôle (l’une pour trois cartes, l’autre pour deux) : on compte 8 × 7, jamais C₈².',
  },
  {
    cle: 'brelan', nom: 'Brelan', eff: 10752, motif: '311',
    etapes: ['8\\times C_4^3=32', 'C_7^2\\times 4^2=336'], calc: ['32\\times 336', '10\\,752'],
    e1: 'la hauteur du brelan et 3 de ses 4 couleurs', e2: '2 hauteurs <strong>différentes</strong> parmi les 7 restantes (ordre sans importance), une couleur pour chacune',
    piege: 'Si les deux dernières cartes avaient la même hauteur, ce serait un full : d’où C₇² et pas 7 × 7.',
  },
  {
    cle: 'deuxpaires', nom: 'Deux paires', eff: 24192, motif: '221',
    etapes: ['C_8^2\\times \\left(C_4^2\\right)^2=1\\,008', '6\\times 4=24'], calc: ['1\\,008\\times 24', '24\\,192'],
    e1: 'les 2 hauteurs des paires (même rôle : C₈²), puis 2 couleurs pour chacune', e2: 'la carte seule : une des 6 hauteurs restantes, une des 4 couleurs',
    piege: 'Les deux paires jouent le même rôle : 8 × 7 compterait chaque main deux fois.',
  },
  {
    cle: 'paire', nom: 'Paire', eff: 107520, motif: '2111',
    etapes: ['8\\times C_4^2=48', 'C_7^3\\times 4^3=2\\,240'], calc: ['48\\times 2\\,240', '107\\,520'],
    e1: 'la hauteur de la paire et 2 de ses 4 couleurs', e2: '3 hauteurs différentes parmi les 7 restantes, une couleur pour chacune',
  },
  {
    cle: 'rien', nom: 'Sans paire', eff: 57344, motif: '11111',
    etapes: ['C_8^5=56', '4^5=1\\,024'], calc: ['56\\times 1\\,024', '57\\,344'],
    e1: '5 hauteurs toutes différentes parmi les 8', e2: 'une couleur pour chacune des 5 cartes',
    piege: 'Ici, comme dans le cours, on ne classe que par hauteurs : les suites et les mains d’une seule couleur sont rangées dans « sans paire ».',
  },
]
var ECHELLE = 0.6
var LARG = 440, HAUT = 278, COL = 92, XD = 360, MH = 10, LIGNE = 38

function milliers(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') }
function dec(x, d) { return x.toFixed(d).replace('.', ',') }

function classer(main) {
  var c = {}
  main.forEach(function (carte) { c[carte.h] = (c[carte.h] || 0) + 1 })
  var mult = Object.keys(c).map(function (h) { return c[h] }).sort(function (a, b) { return b - a }).join('')
  for (var i = 0; i < CATS.length; i++) if (CATS[i].motif === mult) return { i: i, compte: c }
  return null
}
function tirer() {
  var paquet = []
  for (var h = 0; h < 8; h++) for (var s = 0; s < 4; s++) paquet.push({ h: h, s: s })
  for (var k = 0; k < 5; k++) {
    var j = k + Math.floor(Math.random() * (32 - k))
    var t = paquet[k]; paquet[k] = paquet[j]; paquet[j] = t
  }
  return paquet.slice(0, 5).sort(function (a, b) { return a.h - b.h || a.s - b.s })
}
// Version rapide pour la simulation (multiplicités seulement).
function tirerMotif() {
  var vus = [], hs = [0, 0, 0, 0, 0, 0, 0, 0]
  while (vus.length < 5) {
    var c = Math.floor(Math.random() * 32)
    if (vus.indexOf(c) >= 0) continue
    vus.push(c)
    hs[c >> 2]++
  }
  return hs.filter(Boolean).sort(function (a, b) { return b - a }).join('')
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.main{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin:0 0 8px;min-height:80px;}' +
  '.carte{width:52px;height:74px;border-radius:6px;border:1.5px solid var(--line,#ccd8e0);background:var(--surface,#fff);' +
  'display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;line-height:1.1;color:var(--ink,#182430);}' +
  '.carte .h{font-size:1.15rem;}.carte .s{font-size:1.35rem;}' +
  '.carte.rouge{color:var(--bad,#b23a3a);}' +
  '.carte.m1{border:3px solid var(--accent,#b65c1f);background:var(--accent-soft,#f4e3d1);}' +
  '.carte.m2{border:3px solid var(--sky,#2f6fb0);background:var(--sky-soft,#dde9f5);}' +
  '.carte.dos{background:repeating-linear-gradient(45deg,var(--surface-2,#f7f9fb) 0 6px,var(--line-soft,#dfe7ec) 6px 12px);}' +
  '.verdict{text-align:center;font-size:1.05rem;margin:0 0 10px;min-height:1.6em;}' +
  '.b-ex{fill:var(--accent,#b65c1f);}' +
  '.b-obs{fill:var(--sky-soft,#dde9f5);stroke:var(--sky,#2f6fb0);stroke-width:1.4;}' +
  '.nom-cat{font-size:12px;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);text-anchor:end;dominant-baseline:central;}' +
  '.nom-cat.vise{font-weight:700;fill:var(--accent-ink,#7a3c11);}' +
  '.val{font-size:10.5px;font-family:var(--sans,sans-serif);font-variant-numeric:tabular-nums;dominant-baseline:central;}' +
  '.val-ex{fill:var(--accent-ink,#7a3c11);}.val-obs{fill:var(--sky-ink,#1f4e7d);}' +
  '.bande{fill:var(--attn-soft,#f7ecd6);}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;font-size:0.86rem;margin:0 0 6px;}' +
  '.legende span{display:inline-flex;align-items:center;gap:6px;}' +
  '.legende i{display:inline-block;width:16px;height:12px;border-radius:2px;}' +
  '.l-ex{background:var(--accent,#b65c1f);}.l-obs{background:var(--sky-soft,#dde9f5);border:1.4px solid var(--sky,#2f6fb0);}' +
  '.defile{overflow-x:auto;margin:0 0 10px;}' +
  'table{border-collapse:collapse;font-size:0.85rem;font-variant-numeric:tabular-nums;margin:0 auto;}' +
  'th,td{border:1px solid var(--line,#ccd8e0);padding:4px 7px;text-align:right;white-space:nowrap;}' +
  'th{background:var(--surface-2,#f7f9fb);color:var(--ink-soft,#51626f);font-weight:600;text-align:center;white-space:normal;}' +
  'td:first-child{text-align:left;}' +
  'tbody tr{cursor:pointer;}' +
  'tr.vise td{background:var(--attn-soft,#f7ecd6);font-weight:700;}' +
  'tfoot td{font-weight:700;background:var(--surface-2,#f7f9fb);}' +
  '.somme{line-height:2.1;margin:0 0 6px;}' +
  '.etape{margin:0 0 4px;}' +
  '</style>' +
  '<div class="main" id="main"></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="rangee">' +
  '<button class="btn" id="tirer">Tirer une main</button>' +
  '<button class="btn" id="simuler">Simuler 10 000 mains</button>' +
  '<button class="btn" id="zero">Remettre à zéro</button>' +
  '</div>' +
  '<div class="legende"><span><i class="l-ex"></i>probabilité exacte</span><span><i class="l-obs"></i>fréquence observée</span></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Probabilités exactes et fréquences observées"></svg></div>' +
  '<div class="defile"><table><thead><tr><th>Main</th><th>Nombre de mains</th><th>Probabilité exacte</th><th id="th-obs">Fréquence observée</th></tr></thead>' +
  '<tbody id="tab"></tbody><tfoot id="pied"></tfoot></table></div>' +
  '<div class="panneau" id="calc"></div>' +
  '<div class="panneau" id="partition"></div>'

class MainsPokerWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._main = null
    this._vise = 4 // paire, la plus fréquente, en attendant une main
    this._obs = [0, 0, 0, 0, 0, 0]
    this._nb = 0
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.getElementById('tirer').addEventListener('click', function () {
      self._main = tirer()
      var r = classer(self._main)
      self._vise = r.i
      self._obs[r.i]++
      self._nb++
      self._rendre()
    })
    sh.getElementById('simuler').addEventListener('click', function () {
      var index = {}
      CATS.forEach(function (c, i) { index[c.motif] = i })
      for (var k = 0; k < 10000; k++) self._obs[index[tirerMotif()]]++
      self._nb += 10000
      self._rendre()
    })
    sh.getElementById('zero').addEventListener('click', function () {
      self._obs = [0, 0, 0, 0, 0, 0]
      self._nb = 0
      self._main = null
      self._rendre()
    })
    sh.getElementById('tab').addEventListener('click', function (ev) {
      var tr = ev.target.closest && ev.target.closest('tr[data-i]')
      if (!tr) return
      self._vise = +tr.getAttribute('data-i')
      self._rendre()
    })
    var partition = CATS.map(function (c) { return c.calc[1] })
    sh.getElementById('partition').innerHTML =
      '<p><strong>La partition est complète</strong> : toute main tombe dans une et une seule catégorie, donc les six effectifs remplissent exactement toutes les mains possibles.</p>' +
      '<p class="somme">' + partition.map(function (t, i) { return tex((i ? '{}+' : '') + t) }).join(' ') + ' ' + tex('=201\\,376') + ' ' + tex('=C_{32}^{5}') + '</p>'
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, self = this
    // Main.
    var zm = sh.getElementById('main'), v = sh.getElementById('verdict')
    if (!this._main) {
      var dos = ''
      for (var d = 0; d < 5; d++) dos += '<div class="carte dos" aria-hidden="true"></div>'
      zm.innerHTML = dos
      v.textContent = 'Tire une main pour la classer.'
    } else {
      var r = classer(this._main), cat = CATS[r.i]
      // Hauteurs de la combinaison : m1 (la plus nombreuse), m2 (la seconde pour full / deux paires).
      var hs = Object.keys(r.compte).map(Number).sort(function (a, b) { return r.compte[b] - r.compte[a] || b - a })
      var m1 = r.compte[hs[0]] >= 2 ? hs[0] : -1
      var m2 = r.compte[hs[1]] >= 2 ? hs[1] : -1
      zm.innerHTML = this._main.map(function (c) {
        var cls = 'carte' + (COULEURS[c.s].rouge ? ' rouge' : '') + (c.h === m1 ? ' m1' : c.h === m2 ? (cat.cle === 'deuxpaires' ? ' m1' : ' m2') : '')
        return '<div class="' + cls + '" aria-label="' + NOMS_HAUTEURS[c.h] + ' de ' + COULEURS[c.s].nom + '"><span class="h">' + HAUTEURS[c.h] +
          '</span><span class="s">' + COULEURS[c.s].s + '</span></div>'
      }).join('')
      var precis = ''
      if (cat.cle === 'carre') precis = ' de ' + NOMS_HAUTEURS[m1]
      else if (cat.cle === 'full') precis = ' : trois ' + NOMS_HAUTEURS[m1] + ' et deux ' + NOMS_HAUTEURS[m2]
      else if (cat.cle === 'brelan') precis = ' de ' + NOMS_HAUTEURS[m1]
      else if (cat.cle === 'deuxpaires') precis = ' : ' + NOMS_HAUTEURS[Math.max(m1, m2)] + ' et ' + NOMS_HAUTEURS[Math.min(m1, m2)]
      else if (cat.cle === 'paire') precis = ' de ' + NOMS_HAUTEURS[m1]
      else precis = ' : cinq hauteurs différentes'
      v.innerHTML = '<strong>' + cat.nom + '</strong>' + precis + ' — ' + milliers(cat.eff) + ' mains sur ' + milliers(TOTAL) + ' sont de ce type.'
    }

    // Tableau.
    var nb = this._nb, lignes = ''
    sh.getElementById('th-obs').innerHTML = 'Fréquence observée' + (nb ? '<br>(' + milliers(nb) + (nb > 1 ? ' mains)' : ' main)') : '')
    CATS.forEach(function (c, i) {
      lignes += '<tr data-i="' + i + '"' + (i === self._vise ? ' class="vise"' : '') + '><td>' + c.nom + '</td><td>' + milliers(c.eff) + '</td><td>' +
        dec(c.eff / TOTAL, 4) + '</td><td>' + (nb ? dec(self._obs[i] / nb, 4) : '—') + '</td></tr>'
    })
    sh.getElementById('tab').innerHTML = lignes
    sh.getElementById('pied').innerHTML = '<tr><td>Total</td><td>' + milliers(TOTAL) + '</td><td>1</td><td>' + (nb ? '1' : '—') + '</td></tr>'

    // Calcul de la catégorie visée.
    var c = CATS[this._vise]
    var h = '<p><strong>' + c.nom + '</strong> : les deux étapes de la méthode du cours.</p>' +
      '<p class="etape">Étape 1 : ' + c.e1 + ' → ' + tex(c.etapes[0]) + '</p>' +
      '<p class="etape">Étape 2 : ' + c.e2 + ' → ' + tex(c.etapes[1]) + '</p>' +
      '<p class="formule">' + texEgalites([c.calc[0], c.calc[1]]) + ' mains</p>'
    if (c.piege) h += '<p>' + c.piege + '</p>'
    sh.getElementById('calc').innerHTML = h

    this._dessiner()
  }

  _dessiner() {
    var svg = this._sh.getElementById('svg'), self = this, nb = this._nb
    svg.innerHTML = ''
    var px = function (p) { return COL + (p / ECHELLE) * (XD - COL) }
    var yBas = MH + CATS.length * LIGNE
    // Graduations fixes 0 à 0,6.
    for (var g = 0; g <= 6; g++) {
      var x = px(g / 10)
      svg.appendChild(svgEl('line', { x1: x, x2: x, y1: MH, y2: yBas, class: 'grille' }))
      var t = svgEl('text', { x: x, y: yBas + 14, 'text-anchor': 'middle', class: 'tick-label' })
      t.textContent = g === 0 ? '0' : '0,' + g
      svg.appendChild(t)
    }
    CATS.forEach(function (c, i) {
      var y0 = MH + i * LIGNE
      if (i === self._vise) svg.appendChild(svgEl('rect', { x: 2, y: y0 + 1, width: LARG - 4, height: LIGNE - 2, rx: 4, class: 'bande' }))
      var nm = svgEl('text', { x: COL - 6, y: y0 + LIGNE / 2, class: 'nom-cat' + (i === self._vise ? ' vise' : '') })
      nm.textContent = c.nom
      svg.appendChild(nm)
      var pe = c.eff / TOTAL
      svg.appendChild(svgEl('rect', { x: COL, y: y0 + 6, width: Math.max(1, px(pe) - COL), height: 12, class: 'b-ex' }))
      var ve = svgEl('text', { x: px(pe) + 5, y: y0 + 12, class: 'val val-ex' })
      ve.textContent = dec(pe, 4)
      svg.appendChild(ve)
      if (nb) {
        var po = self._obs[i] / nb
        svg.appendChild(svgEl('rect', { x: COL, y: y0 + 20, width: Math.max(1, px(po) - COL), height: 12, class: 'b-obs' }))
        var vo = svgEl('text', { x: px(po) + 5, y: y0 + 26, class: 'val val-obs' })
        vo.textContent = dec(po, 4)
        svg.appendChild(vo)
      }
    })
    svg.appendChild(svgEl('line', { x1: COL, y1: MH, x2: COL, y2: yBas, class: 'axe' }))
    var ax = svgEl('text', { x: XD, y: yBas + 30, 'text-anchor': 'end', class: 'nom-axe' })
    ax.textContent = 'probabilité ou fréquence'
    svg.appendChild(ax)
  }
}

if (!customElements.get('mains-poker-widget')) customElements.define('mains-poker-widget', MainsPokerWidget)
