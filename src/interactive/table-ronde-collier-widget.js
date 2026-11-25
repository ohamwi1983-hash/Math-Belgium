/* ================================================================
 * <table-ronde-collier-widget> — atelier « Table ronde et collier »
 * (6e, ch. 7, § 1, permutations circulaires). n personnes ou perles
 * (2 à 6), toutes différentes (A, B, C…), autour d'un cercle.
 * « Tourner » : tout le monde avance d'une place ; « Retourner » :
 * miroir autour de l'axe vertical (la place du haut ne bouge pas) ;
 * toucher deux perles les échange ; « Au hasard ». Deux modes :
 *   - table : seules les rotations sont équivalentes, (n − 1)! tables ;
 *   - collier : rotations ET retournements, (n − 1)! ÷ 2 colliers
 *     (n ≥ 3 ; pour n = 2, retourner ne change rien : 1 collier).
 * La classe de la disposition (toutes les files obtenues en lisant à
 * partir du haut, dans le sens des aiguilles d'une montre) est listée ;
 * toutes les classes sont ÉNUMÉRÉES (n ≤ 5) en petits cercles
 * cliquables et comptées par le widget : le compte retrouve (n − 1)! et
 * (n − 1)! ÷ 2. Figure à géométrie FIXE (même cercle pour tout n).
 * Défaut : n = 4, mode table. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, CSS_BASE, svgEl } from './katex-shadow.js'

var LETTRES = ['A', 'B', 'C', 'D', 'E', 'F']
var COULEURS = ['accent', 'sky', 'good', 'plan', 'rose', 'tip']
var N_MIN = 2, N_MAX = 6, N_ENUM = 5
var W = 280, H = 236, CX = 140, CY = 118, R = 82, RP = 19

function fact(k) { var f = 1; for (var i = 2; i <= k; i++) f *= i; return f }
function tourner(arr) { var n = arr.length, r = []; for (var i = 0; i < n; i++) r[(i + 1) % n] = arr[i]; return r }
function miroir(arr) { var n = arr.length, r = []; for (var i = 0; i < n; i++) r[i] = arr[(n - i) % n]; return r }
function canonTable(arr) {
  var i = arr.indexOf('A'), r = []
  for (var j = 0; j < arr.length; j++) r.push(arr[(i + j) % arr.length])
  return r.join('')
}
function canonCollier(arr) {
  var a = canonTable(arr), b = canonTable(miroir(arr))
  return a < b ? a : b
}
function permsDe(liste) {
  if (liste.length <= 1) return [liste.slice()]
  var res = []
  liste.forEach(function (x, i) {
    var reste = liste.slice(0, i).concat(liste.slice(i + 1))
    permsDe(reste).forEach(function (p) { res.push([x].concat(p)) })
  })
  return res
}
/** Classes énumérées : représentants (A en haut), dans l'ordre alphabétique. */
function classes(n, collier) {
  var vus = {}, res = []
  permsDe(LETTRES.slice(1, n)).forEach(function (p) {
    var arr = ['A'].concat(p), c = collier ? canonCollier(arr) : canonTable(arr)
    if (!vus[c]) { vus[c] = true; res.push(c) }
  })
  return res.sort()
}
/** Files (lectures à partir du haut) de la classe d'une disposition. */
function orbite(arr, collier) {
  var rot = [], ret = [], a = arr.slice(), b = miroir(arr)
  for (var i = 0; i < arr.length; i++) { rot.push(a.join('')); ret.push(b.join('')); a = tourner(a); b = tourner(b) }
  return { rot: rot, ret: collier ? ret : null }
}
function angle(i, n) { return -Math.PI / 2 + (2 * Math.PI * i) / n }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.figure svg{max-width:340px;user-select:none;-webkit-user-select:none;}' +
  '.plateau{fill:var(--surface,#fff);stroke:var(--line,#ccd8e0);stroke-width:1.5;}' +
  '.fil{fill:none;stroke:var(--ink-soft,#51626f);stroke-width:2;}' +
  '.axe-miroir{stroke:var(--ink-faint,#8a97a1);stroke-width:1.2;stroke-dasharray:5 4;}' +
  '.sens{fill:none;stroke:var(--ink-faint,#8a97a1);stroke-width:1.5;}' +
  '.sens-pointe{fill:var(--ink-faint,#8a97a1);}' +
  '.perle{cursor:pointer;outline:none;}' +
  '.perle circle{stroke:var(--surface,#fff);stroke-width:2;}' +
  '.perle text{font-family:var(--sans,sans-serif);font-size:15px;font-weight:700;fill:var(--surface,#fff);text-anchor:middle;' +
  'dominant-baseline:central;pointer-events:none;}' +
  '.perle.choisie circle,.perle:focus-visible circle{stroke:var(--ink,#182430);stroke-width:3.5;}' +
  '.haut{font-family:var(--sans,sans-serif);font-size:10.5px;fill:var(--ink-soft,#51626f);}' +
  '.f-accent{fill:var(--accent,#b65c1f);}.f-sky{fill:var(--sky,#2f6fb0);}.f-good{fill:var(--good,#2f7a4f);}' +
  '.f-plan{fill:var(--plan,#5b4ea3);}.f-rose{fill:var(--rose,#b23a7a);}.f-tip{fill:var(--tip,#8a7200);}' +
  '.c-accent{background:var(--accent,#b65c1f);}.c-sky{background:var(--sky,#2f6fb0);}.c-good{background:var(--good,#2f7a4f);}' +
  '.c-plan{background:var(--plan,#5b4ea3);}.c-rose{background:var(--rose,#b23a7a);}.c-tip{background:var(--tip,#8a7200);}' +
  '.modes{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 10px;}' +
  '.modes .btn{width:100%;}' +
  '.message{text-align:center;min-height:1.6em;margin:0 0 8px;font-size:0.95rem;}' +
  '.files{display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 6px;}' +
  '.file{display:inline-flex;gap:1px;padding:2px;border-radius:4px;border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);}' +
  '.file.actuelle{border:2px solid var(--ink,#182430);padding:1px;}' +
  '.file.double{opacity:0.45;}' +
  '.puce{display:inline-flex;align-items:center;justify-content:center;width:18px;height:20px;border-radius:3px;font-weight:700;' +
  'font-size:0.78rem;color:var(--surface,#fff);}' +
  '.titre-prop{font-weight:700;color:var(--ink-soft,#51626f);font-size:0.85rem;display:block;}' +
  '.grille{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 0;}' +
  '.mini{width:60px;height:60px;padding:0;border:1px solid var(--line,#ccd8e0);border-radius:6px;background:var(--surface,#fff);cursor:pointer;' +
  'touch-action:manipulation;}' +
  '.mini svg{display:block;width:100%;height:100%;}' +
  '.mini.actuelle{border:2.5px solid var(--ink,#182430);background:var(--accent-soft,#f4e3d1);}' +
  '.mini:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
  '.mini text{font-family:var(--sans,sans-serif);font-size:13px;font-weight:700;fill:var(--surface,#fff);text-anchor:middle;dominant-baseline:central;}' +
  '.mini .anneau{fill:none;stroke:var(--line,#ccd8e0);stroke-width:2;}' +
  '</style>' +
  '<div class="modes" role="group" aria-label="Ce qui est équivalent">' +
  '<button class="btn" id="m-table" aria-pressed="true">Table ronde</button>' +
  '<button class="btn" id="m-collier" aria-pressed="false">Collier</button>' +
  '</div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Disposition en cercle"></svg></div>' +
  '<p class="message" id="message" aria-live="polite"></p>' +
  '<div class="rangee">' +
  '<button class="btn" id="tourner">Tourner ↻</button>' +
  '<button class="btn" id="retourner">Retourner ⇄</button>' +
  '<button class="btn" id="hasard">Au hasard</button>' +
  '</div>' +
  '<div class="curseur"><span class="nom" id="nom-n"></span>' +
  '<button class="btn" id="moins" aria-label="Un élément de moins">−</button>' +
  '<input type="range" id="n" min="' + N_MIN + '" max="' + N_MAX + '" step="1" aria-label="Nombre d’éléments n">' +
  '<button class="btn" id="plus" aria-label="Un élément de plus">+</button></div>' +
  '<div class="panneau" id="classe"></div>' +
  '<div class="panneau" id="compte"></div>'

class TableRondeCollierWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._n = 4
    this._arr = ['A', 'B', 'C', 'D']
    this._collier = false
    this._choisie = -1
    this._occupe = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var input = sh.getElementById('n')
    var fixerN = function (v) {
      var n = Math.max(N_MIN, Math.min(N_MAX, Math.round(v)))
      if (n === self._n) { input.value = String(n); return }
      self._n = n
      self._arr = LETTRES.slice(0, n)
      self._choisie = -1
      self._rendre('')
    }
    input.addEventListener('input', function () { fixerN(parseFloat(input.value)) })
    sh.getElementById('moins').addEventListener('click', function () { fixerN(self._n - 1) })
    sh.getElementById('plus').addEventListener('click', function () { fixerN(self._n + 1) })
    sh.getElementById('m-table').addEventListener('click', function () { self._collier = false; self._rendre('') })
    sh.getElementById('m-collier').addEventListener('click', function () { self._collier = true; self._rendre('') })
    sh.getElementById('tourner').addEventListener('click', function () { self._action('tourner') })
    sh.getElementById('retourner').addEventListener('click', function () { self._action('retourner') })
    sh.getElementById('hasard').addEventListener('click', function () {
      var a = self._arr.slice()
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t }
      self._comparer(a, 'Nouvelle disposition au hasard.')
    })
    var svg = sh.getElementById('svg')
    var toucher = function (cible) {
      var g = cible && cible.closest ? cible.closest('.perle') : null
      if (!g || self._occupe) return
      var i = +g.getAttribute('data-i')
      if (self._choisie < 0) { self._choisie = i; self._rendre('Touche une deuxième ' + self._mot(false) + ' pour l’échanger avec ' + self._arr[i] + '.'); return }
      if (self._choisie === i) { self._choisie = -1; self._rendre(''); return }
      var a = self._arr.slice(), j = self._choisie, t = a[i]
      a[i] = a[j]; a[j] = t
      self._choisie = -1
      self._comparer(a, a[i] + ' et ' + a[j] + ' échangées.')
    }
    svg.addEventListener('click', function (ev) { toucher(ev.target) })
    svg.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toucher(ev.target) }
    })
    sh.getElementById('compte').addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('.mini')
      if (!b) return
      self._choisie = -1
      self._comparer(b.getAttribute('data-rep').split(''), 'Disposition ' + b.getAttribute('data-rep') + ' (lue à partir du haut).')
    })
    this._rendre('')
  }

  _mot(pluriel) { return this._collier ? (pluriel ? 'perles' : 'perle') : (pluriel ? 'personnes' : 'personne') }
  _canon(arr) { return this._collier ? canonCollier(arr) : canonTable(arr) }

  /** Nouvelle disposition : dit si elle est équivalente à la précédente. */
  _comparer(nouv, debut) {
    var meme = this._canon(nouv) === this._canon(this._arr)
    var nom = this._collier ? 'collier' : 'table'
    this._arr = nouv
    this._rendre(debut + ' ' + (meme ? 'Même ' + nom + ' qu’avant.' : (this._collier ? 'Autre collier.' : 'Autre table.')))
  }

  _action(type) {
    if (this._occupe) return
    var self = this, sh = this._sh
    this._choisie = -1
    var nouv = type === 'tourner' ? tourner(this._arr) : miroir(this._arr)
    var texte
    if (type === 'tourner') {
      texte = 'Tout le monde avance d’une place. Une rotation ne change ni les voisins ni l’ordre :'
    } else if (this._n <= 2) {
      texte = 'Avec 2 ' + this._mot(true) + ', retourner redonne exactement la même disposition :'
    } else if (this._collier) {
      texte = 'Le collier est retourné (comme on le retourne dans la main) :'
    } else {
      texte = 'Miroir : chacun échange son voisin de gauche et celui de droite. À table, personne ne peut se retourner ainsi :'
    }
    var fin = function () { self._occupe = false; self._comparer(nouv, texte) }
    var g = sh.getElementById('perles')
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduit || !g || !g.animate) { fin(); return }
    this._occupe = true
    var anim = type === 'tourner'
      ? g.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + (360 / this._n) + 'deg)' }], { duration: 450, easing: 'ease-in-out' })
      : g.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.05)' }, { transform: 'scaleX(1)' }], { duration: 550, easing: 'ease-in-out' })
    if (type !== 'tourner') {
      // À mi-course, la disposition retournée remplace l'ancienne (le dessin ne s'affiche jamais en miroir).
      window.setTimeout(function () { self._dessiner(nouv) }, 275)
    }
    anim.onfinish = fin
    anim.oncancel = fin
  }

  _rendre(message) {
    var sh = this._sh, n = this._n
    sh.getElementById('n').value = String(n)
    sh.getElementById('nom-n').innerHTML = tex('n=' + n)
    sh.getElementById('moins').disabled = n <= N_MIN
    sh.getElementById('plus').disabled = n >= N_MAX
    sh.getElementById('m-table').setAttribute('aria-pressed', String(!this._collier))
    sh.getElementById('m-collier').setAttribute('aria-pressed', String(this._collier))
    sh.getElementById('message').textContent = message || ('Touche deux ' + this._mot(true) + ' pour les échanger, ou tourne et retourne.')
    this._dessiner(this._arr)
    this._panneaux()
  }

  _dessiner(arr) {
    var svg = this._sh.getElementById('svg'), n = arr.length, self = this
    svg.innerHTML = ''
    if (this._collier) {
      svg.appendChild(svgEl('line', { x1: CX, y1: 8, x2: CX, y2: H - 8, class: 'axe-miroir' }))
      svg.appendChild(svgEl('circle', { cx: CX, cy: CY, r: R, class: 'fil' }))
    } else {
      svg.appendChild(svgEl('circle', { cx: CX, cy: CY, r: R - RP - 8, class: 'plateau' }))
    }
    // Sens de lecture : petit arc fléché à droite de l'axe, sous la place du haut (sens des aiguilles d'une montre).
    var rs = R - RP - 18, a0 = -Math.PI / 2 + 0.17, a1 = -Math.PI / 2 + 0.85
    var p0 = [CX + rs * Math.cos(a0), CY + rs * Math.sin(a0)], p1 = [CX + rs * Math.cos(a1), CY + rs * Math.sin(a1)]
    svg.appendChild(svgEl('path', { d: 'M' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1) + ' A' + rs + ',' + rs + ' 0 0 1 ' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1), class: 'sens' }))
    var t = a1 + Math.PI / 2, px = p1[0], py = p1[1]
    svg.appendChild(svgEl('path', {
      d: 'M' + (px + 6 * Math.cos(t)).toFixed(1) + ',' + (py + 6 * Math.sin(t)).toFixed(1) +
        ' L' + (px - 3 * Math.cos(t) + 4 * Math.cos(t - Math.PI / 2)).toFixed(1) + ',' + (py - 3 * Math.sin(t) + 4 * Math.sin(t - Math.PI / 2)).toFixed(1) +
        ' L' + (px - 3 * Math.cos(t) - 4 * Math.cos(t - Math.PI / 2)).toFixed(1) + ',' + (py - 3 * Math.sin(t) - 4 * Math.sin(t - Math.PI / 2)).toFixed(1) + ' Z',
      class: 'sens-pointe',
    }))
    var lec = svgEl('text', { x: CX + 8, y: CY - 10, class: 'haut', 'text-anchor': 'start' })
    lec.textContent = 'lecture'
    svg.appendChild(lec)
    var g = svgEl('g', { id: 'perles' })
    g.style.transformBox = 'view-box'
    g.style.transformOrigin = CX + 'px ' + CY + 'px'
    arr.forEach(function (c, i) {
      var a = angle(i, n), x = CX + R * Math.cos(a), y = CY + R * Math.sin(a), idx = LETTRES.indexOf(c)
      var p = svgEl('g', {
        class: 'perle' + (i === self._choisie ? ' choisie' : ''), 'data-i': i, tabindex: '0', role: 'button',
        'aria-label': self._mot(false) + ' ' + c + (i === 0 ? ', place du haut' : ''),
      })
      p.appendChild(svgEl('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: RP, class: 'f-' + COULEURS[idx] }))
      var tx = svgEl('text', { x: x.toFixed(1), y: (y + 0.5).toFixed(1) })
      tx.textContent = c
      p.appendChild(tx)
      g.appendChild(p)
    })
    svg.appendChild(g)
  }

  _file(mot, actuelle, double) {
    return '<span class="file' + (actuelle ? ' actuelle' : '') + (double ? ' double' : '') + '" aria-label="' + mot.split('').join(' ') + '">' +
      mot.split('').map(function (c) { return '<span class="puce c-' + COULEURS[LETTRES.indexOf(c)] + '">' + c + '</span>' }).join('') + '</span>'
  }

  _panneaux() {
    var sh = this._sh, n = this._n, collier = this._collier, self = this, arr = this._arr
    var actuel = arr.join(''), o = orbite(arr, collier)
    var distinctes = {}
    o.rot.forEach(function (m) { distinctes[m] = true })
    var h = '<span class="titre-prop">' + (collier ? 'Ce collier, lu à partir du haut' : 'Cette table, lue à partir du haut') + '</span>' +
      '<p>En tournant :</p><div class="files">' + o.rot.map(function (m) { return self._file(m, m === actuel, false) }).join('') + '</div>'
    if (collier) {
      var doublons = 0
      h += '<p>En retournant, puis en tournant :</p><div class="files">' + o.ret.map(function (m) {
        var d = !!distinctes[m]
        if (d) doublons++
        distinctes[m] = true
        return self._file(m, m === actuel, d)
      }).join('') + '</div>'
      if (doublons) h += '<p>Les files pâles sont déjà dans la première ligne : ici, retourner ne donne rien de nouveau.</p>'
    }
    var nbFiles = Object.keys(distinctes).length
    h += '<p>' + nbFiles + ' files différentes pour ' + (collier ? 'un seul collier' : 'une seule table') + '.</p>'
    sh.getElementById('classe').innerHTML = h

    // Comptage : par énumération (n ≤ 5) et par la formule.
    var f = fact(n), t = fact(n - 1)
    var c = '<p>' + tex(n + '!=' + f) + (f > 1 ? ' files' : ' file') + ' en ligne. Chaque table se lit de ' + n + ' façons (on coupe le cercle devant chacun) : ' +
      tex('\\dfrac{' + n + '!}{' + n + '}=(' + n + '-1)!=' + t) + (t > 1 ? ' tables.' : ' table.') + '</p>'
    if (collier) {
      if (n >= 3) {
        c += '<p>Chaque collier rassemble 2 tables, une par sens de lecture : ' + tex('\\dfrac{(' + n + '-1)!}{2}=\\dfrac{' + t + '}{2}=' + (t / 2)) +
          (t / 2 > 1 ? ' colliers.' : ' collier.') + '</p>'
      } else {
        c += '<p>Avec 2 perles, retourner ne change rien : la table et son miroir sont la même disposition. Il y a 1 collier, et non ' +
          tex('\\dfrac{1}{2}') + ' : la division par 2 ne vaut que pour ' + tex('n\\geq 3') + '.</p>'
      }
    }
    if (n <= N_ENUM) {
      var cl = classes(n, collier), courant = this._canon(arr)
      c += '<span class="titre-prop">' + (collier ? 'Tous les colliers' : 'Toutes les tables') + ' (énumération complète) : ' + cl.length + '</span>' +
        '<div class="grille">' + cl.map(function (rep) { return self._mini(rep, rep === courant) }).join('') + '</div>'
    } else {
      c += '<p>Avec ' + n + ' ' + this._mot(true) + ', ' + (collier ? (t / 2) + ' colliers' : t + ' tables') + ' : trop pour les dessiner. Reviens à ' +
        tex('n\\leq 5') + ' pour les voir toutes.</p>'
    }
    sh.getElementById('compte').innerHTML = c
  }

  _mini(rep, actuelle) {
    var n = rep.length, r = 20, s = '<svg viewBox="0 0 60 60" aria-hidden="true"><circle class="anneau" cx="30" cy="30" r="' + r + '"></circle>'
    for (var i = 0; i < n; i++) {
      var a = angle(i, n), x = 30 + r * Math.cos(a), y = 30 + r * Math.sin(a), c = rep[i]
      s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="9" class="f-' + COULEURS[LETTRES.indexOf(c)] + '"></circle>' +
        '<text x="' + x.toFixed(1) + '" y="' + (y + 0.5).toFixed(1) + '" style="font-size:10px">' + c + '</text>'
    }
    s += '</svg>'
    return '<button class="mini' + (actuelle ? ' actuelle' : '') + '" data-rep="' + rep + '" aria-label="Disposition ' + rep.split('').join(' ') +
      (actuelle ? ', celle de la figure' : '') + '" aria-pressed="' + actuelle + '">' + s + '</button>'
  }
}

if (!customElements.get('table-ronde-collier-widget')) customElements.define('table-ronde-collier-widget', TableRondeCollierWidget)
