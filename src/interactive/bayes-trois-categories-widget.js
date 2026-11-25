/* ================================================================
 * <bayes-trois-categories-widget> — atelier « Bayes à 3 catégories »
 * (6e, ch. 8, § 7). Une population de 1 000 carrés (grille 40 × 25,
 * remplie colonne par colonne) partagée en trois catégories C₁, C₂, C₃
 * (couleurs bleu, violet, orange). On règle P(C₁), P(C₂) (pas de 0,05 ;
 * P(C₃) = 1 − P(C₁) − P(C₂)) et P(S | Cᵢ) (pas de 0,02) : dans chaque
 * catégorie, les carrés où S survient s'allument (couleur pleine), les
 * autres restent pâles. Avec ces pas, 1 000 × P(Cᵢ) × P(S | Cᵢ) est
 * toujours entier : les carrés allumés donnent les probabilités EXACTES.
 * Sous la grille, les carrés allumés sont regroupés en une barre :
 * P(Cⱼ | S) = part de la catégorie j dans cette barre. « Ne garder que
 * S » efface les carrés non allumés. Notation du cours : C₁, C₂, C₃, S,
 * P(S | Cᵢ), probabilités totales, formule de Bayes.
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE, svgEl } from './katex-shadow.js'
import { arrondi, texCourt, estExact, curseurHTML, lierCurseur, majCurseur, borner } from './variables-aleatoires-commun.js'

var W = 400, GX = 10, DX = 10, COLS = 40, ROWS = 25, CEL = (W - GX - DX) / COLS
var Y_GRILLE = 18, Y_BARRE = Y_GRILLE + ROWS * CEL + 34, H_BARRE = 24, H = Y_BARRE + H_BARRE + 8
var IND = ['₁', '₂', '₃']
var EXEMPLES = [
  { nom: 'Assurance (cours)', sous: '30 %, 45 %, 25 %', c: [0.3, 0.45, 0.25], s: [0.1, 0.2, 0.4], j: 2 },
  { nom: 'Trois machines', sous: 'défauts 2 %, 4 %, 10 %', c: [0.5, 0.3, 0.2], s: [0.02, 0.04, 0.1], j: 2 },
  { nom: 'Même taux partout', sous: 'S : 20 % dans chacune', c: [0.3, 0.45, 0.25], s: [0.2, 0.2, 0.2], j: 0 },
]
function egal(x, d) { return (estExact(x, d) ? '=' : '\\approx ') + texCourt(x, d) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}[hidden]{display:none !important;}' +
  '.figure svg{max-width:460px;}' +
  '.k1{fill:var(--sky-soft,#dde9f5);}.k2{fill:var(--plan-soft,#ece9f8);}.k3{fill:var(--accent-soft,#f4e3d1);}' +
  '.k1.on{fill:var(--sky,#2f6fb0);}.k2.on{fill:var(--plan,#5b4ea3);}.k3.on{fill:var(--accent,#b65c1f);}' +
  '.filtre rect.carre:not(.on){opacity:0.12;}' +
  'rect.seg{stroke:var(--surface-2,#f7f9fb);stroke-width:1;}' +
  'rect.seg.choisi{stroke:var(--ink,#182430);stroke-width:2.5;}' +
  '.et{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.et-c1{fill:var(--sky-ink,#1f4e7d);}.et-c2{fill:var(--plan-ink,#443a80);}.et-c3{fill:var(--accent-ink,#7a3c11);}.et-n{fill:var(--ink-soft,#51626f);font-weight:600;}' +
  '.et-in{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);fill:#fff;}' +
  '.t-c1{color:var(--sky-ink,#1f4e7d);font-weight:700;}.t-c2{color:var(--plan-ink,#443a80);font-weight:700;}.t-c3{color:var(--accent-ink,#7a3c11);font-weight:700;}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.curseur .nom{min-width:126px;}' +
  '.exemples .btn small{display:block;font-weight:400;font-size:0.72rem;color:var(--ink-soft,#51626f);}' +
  '.exemples .btn,.choix .btn{font-size:0.86rem;}' +
  '.calc p{line-height:2;}' +
  '.defile{overflow-x:auto;margin:0 0 8px;}' +
  '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}table{border-collapse:collapse;font-size:0.84rem;font-variant-numeric:tabular-nums;margin:0 auto;}' +
  'th,td{border:1px solid var(--line,#ccd8e0);padding:3px 5px;text-align:center;white-space:nowrap;}' +
  'thead th{background:var(--surface-2,#f7f9fb);color:var(--ink-soft,#51626f);font-weight:600;}' +
  'tr.choisi td,tr.choisi th{background:var(--attn-soft,#f7ecd6);}' +
  '.p3{font-size:0.86rem;color:var(--ink-soft,#51626f);text-align:center;margin:-4px 0 8px;}' +
  '</style>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="1 000 carrés colorés par catégorie ; les carrés où S survient sont allumés"></svg></div>' +
  '<div class="rangee choix" role="group" aria-label="Catégorie étudiée">' +
  '<button class="btn" data-j="0"></button><button class="btn" data-j="1"></button><button class="btn" data-j="2"></button>' +
  '<button class="btn" id="filtre" aria-pressed="false">Ne garder que S</button></div>' +
  '<div class="panneau calc" id="calc" aria-live="polite"></div>' +
  '<div class="reglages">' +
  '<div>' + curseurHTML('c0', 'Probabilité de la catégorie 1', 0.05, 0.9, 0.05) + curseurHTML('c1', 'Probabilité de la catégorie 2', 0.05, 0.9, 0.05) +
  '<p class="p3" id="p3"></p></div>' +
  '<div>' + curseurHTML('s0', 'Probabilité de S dans la catégorie 1', 0, 1, 0.02) + curseurHTML('s1', 'Probabilité de S dans la catégorie 2', 0, 1, 0.02) +
  curseurHTML('s2', 'Probabilité de S dans la catégorie 3', 0, 1, 0.02) + '</div>' +
  '</div>' +
  '<div class="rangee exemples" role="group" aria-label="Exemples">' +
  EXEMPLES.map(function (x, i) { return '<button class="btn" data-i="' + i + '">' + x.nom + '<small>' + x.sous + '</small></button>' }).join('') +
  '</div>'

class BayesTroisCategoriesWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._c = [0.3, 0.45, 0.25]
    this._s = [0.1, 0.2, 0.4]
    this._j = 2
    this._filtre = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    // Grille de 1 000 carrés (créée une fois)
    var svg = sh.getElementById('svg'), g = svgEl('g', { id: 'grille' })
    this._carres = []
    for (var i = 0; i < COLS * ROWS; i++) {
      var col = Math.floor(i / ROWS), lig = i % ROWS
      var r = svgEl('rect', { x: (GX + col * CEL + 0.6).toFixed(2), y: (Y_GRILLE + lig * CEL + 0.6).toFixed(2), width: (CEL - 1.2).toFixed(2), height: (CEL - 1.2).toFixed(2), rx: 1, class: 'carre' })
      g.appendChild(r)
      this._carres.push(r)
    }
    svg.appendChild(g)
    this._deco = svgEl('g', {})
    svg.appendChild(this._deco)
    sh.querySelectorAll('[data-j]').forEach(function (b) {
      var j = +b.getAttribute('data-j')
      b.innerHTML = tex('P(C_' + (j + 1) + '\\mid S)')
      b.addEventListener('click', function () { self._j = j; self._rendre() })
    })
    sh.getElementById('filtre').addEventListener('click', function () { self._filtre = !self._filtre; self._rendre() })
    var regC = function (idx) {
      return function (v) {
        var x = arrondi(borner(v, 0.05, arrondi(0.95 - (idx === 1 ? self._c[0] : 0), 2)), 2)
        self._c[idx] = x
        if (idx === 0 && arrondi(1 - x - self._c[1], 2) < 0.05) self._c[1] = arrondi(0.95 - x, 2)
        self._c[2] = arrondi(1 - self._c[0] - self._c[1], 2)
        self._rendre()
      }
    }
    lierCurseur(sh, 'c0', function () { return self._c[0] }, regC(0), 0.05)
    lierCurseur(sh, 'c1', function () { return self._c[1] }, regC(1), 0.05)
    ;[0, 1, 2].forEach(function (i) {
      lierCurseur(sh, 's' + i, function () { return self._s[i] }, function (v) { self._s[i] = arrondi(borner(Math.round(v * 50) / 50, 0, 1), 2); self._rendre() }, 0.02)
    })
    sh.querySelectorAll('.exemples .btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var x = EXEMPLES[+b.getAttribute('data-i')]
        self._c = x.c.slice(); self._s = x.s.slice(); self._j = x.j
        self._rendre()
      })
    })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, c = this._c, s = this._s, jj = this._j
    majCurseur(sh, 'c0', c[0], 'P(C_1)=' + texCourt(c[0], 2))
    majCurseur(sh, 'c1', c[1], 'P(C_2)=' + texCourt(c[1], 2))
    sh.getElementById('c1').max = String(arrondi(0.95 - c[0], 2))
    majCurseur(sh, 'c1', c[1], 'P(C_2)=' + texCourt(c[1], 2))
    sh.getElementById('p3').innerHTML = 'donc ' + tex('P(C_3)=1-' + texCourt(c[0], 2) + '-' + texCourt(c[1], 2) + '=' + texCourt(c[2], 2))
    for (var i = 0; i < 3; i++) majCurseur(sh, 's' + i, s[i], 'P(S\\mid C_' + (i + 1) + ')=' + texCourt(s[i], 2))
    sh.querySelectorAll('[data-j]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-j') === jj)) })
    sh.getElementById('filtre').setAttribute('aria-pressed', String(this._filtre))
    sh.querySelectorAll('.exemples .btn').forEach(function (b) {
      var x = EXEMPLES[+b.getAttribute('data-i')], meme = true
      for (var q = 0; q < 3; q++) if (x.c[q] !== c[q] || x.s[q] !== s[q]) meme = false
      b.setAttribute('aria-pressed', String(meme))
    })

    // ---------- Effectifs (entiers exacts) ----------
    var n = c.map(function (x) { return Math.round(1000 * x) })
    var nS = n.map(function (x, q) { return Math.round(x * s[q]) })
    var tot = nS[0] + nS[1] + nS[2]

    // ---------- Grille ----------
    sh.getElementById('grille').setAttribute('class', this._filtre ? 'filtre' : '')
    var debut = 0
    for (var q = 0; q < 3; q++) {
      for (var t = 0; t < n[q]; t++) this._carres[debut + t].setAttribute('class', 'carre k' + (q + 1) + (t < nS[q] ? ' on' : ''))
      debut += n[q]
    }
    var deco = this._deco
    deco.innerHTML = ''
    var et = function (x, y, txt, cls, anc) {
      var e = svgEl('text', { x: x, y: y, 'text-anchor': anc || 'middle', class: cls })
      e.textContent = txt
      deco.appendChild(e)
    }
    debut = 0
    for (q = 0; q < 3; q++) {
      var x0 = GX + (debut / ROWS) * CEL, x1 = GX + ((debut + n[q]) / ROWS) * CEL
      var lab = (x1 - x0 >= 60 ? 'C' + IND[q] + ' : ' + n[q] : 'C' + IND[q])
      et((x0 + x1) / 2, Y_GRILLE - 5, lab, 'et et-c' + (q + 1))
      debut += n[q]
    }
    et(GX, Y_BARRE - 8, tot ? 'Les ' + tot + ' carrés allumés (S), regroupés :' : 'Aucun carré allumé : S ne survient jamais.', 'et et-n', 'start')
    if (tot) {
      var xc = GX
      for (q = 0; q < 3; q++) {
        if (!nS[q]) continue
        var lw = (W - GX - DX) * nS[q] / tot
        deco.appendChild(svgEl('rect', { x: xc, y: Y_BARRE, width: lw, height: H_BARRE, class: 'seg k' + (q + 1) + ' on' + (q === jj ? ' choisi' : '') }))
        if (lw >= 26) et(xc + lw / 2, Y_BARRE + H_BARRE / 2 + 4, String(nS[q]), 'et-in')
        xc += lw
      }
    }

    // ---------- Calculs ----------
    var h = '<div class="defile"><table><thead><tr><th><span class="sr">Catégorie</span></th><th>' + tex('P(C_i)') + '</th><th>' + tex('P(S\\mid C_i)') + '</th><th>Allumés</th><th>' + tex('P(C_i\\mid S)') + '</th></tr></thead><tbody>'
    for (q = 0; q < 3; q++) {
      h += '<tr' + (q === jj ? ' class="choisi"' : '') + '><th class="t-c' + (q + 1) + '">' + tex('C_' + (q + 1)) + '</th><td>' + tex(texCourt(c[q], 2)) + '</td><td>' + tex(texCourt(s[q], 2)) + '</td>' +
        '<td>' + nS[q] + '</td><td>' + (tot ? tex(egal(nS[q] / tot, 4)) : '—') + '</td></tr>'
    }
    h += '</tbody></table></div>'
    var termes = [0, 1, 2].map(function (q) { return tex((q ? '+\\,' : '') + texCourt(c[q], 2) + '\\times ' + texCourt(s[q], 2)) }).join(' ')
    h += '<p><strong>Probabilités totales</strong> : ' + tex('P(S)=') + ' ' + termes + ' ' + tex('=' + texCourt(tot / 1000, 3)) + ', soit ' + tot + ' carrés sur 1 000.</p>'
    var J = jj + 1, cls = 't-c' + J
    if (tot) {
      h += '<p><strong>Bayes</strong> : <span class="' + cls + '">' + texEgalites(['P(C_' + J + '\\mid S)', '\\dfrac{P(C_' + J + ')\\,P(S\\mid C_' + J + ')}{P(S)}',
        '\\dfrac{' + texCourt(c[jj] * s[jj], 3) + '}{' + texCourt(tot / 1000, 3) + '}', '\\dfrac{' + nS[jj] + '}{' + tot + '}']) + ' ' + tex(egal(nS[jj] / tot, 4)) + '</span> : la part des carrés ' +
        (jj === 0 ? 'bleus' : jj === 1 ? 'violets' : 'orange') + ' parmi les carrés allumés.</p>'
      var avant = c[jj], apres = nS[jj] / tot
      var sens = Math.abs(apres - avant) < 1e-9 ? 'ne change pas : S arrive aussi souvent dans chaque catégorie, savoir que S est survenu n’apprend rien.'
        : apres > avant ? 'augmente : S arrive plus souvent dans ' + 'C' + IND[jj] + ' qu’en moyenne.' : 'diminue : S arrive moins souvent dans ' + 'C' + IND[jj] + ' qu’en moyenne.'
      h += '<p>A priori ' + tex('P(C_' + J + ')=' + texCourt(avant, 2)) + ' ; a posteriori ' + tex('P(C_' + J + '\\mid S)' + egal(apres, 4)) + '. La probabilité ' + sens + '</p>'
    } else {
      h += '<p>' + tex('P(S)=0') + ' : on ne peut pas conditionner par S (division par 0).</p>'
    }
    sh.getElementById('calc').innerHTML = h
  }
}

if (!customElements.get('bayes-trois-categories-widget')) customElements.define('bayes-trois-categories-widget', BayesTroisCategoriesWidget)
