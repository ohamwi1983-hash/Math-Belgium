/* ================================================================
 * <simulateur-credit-widget> — atelier « Simulateur de crédit »
 * (5e (6h), algèbre financière, étape « crédit »). Capital C, TAEG,
 * durée n (en mois). Taux mensuel équivalent i = (1 + TAEG)^(1/12) − 1,
 * mensualité m = C·i / (1 − (1 + i)⁻ⁿ), arrondie au centime pour le
 * total payé et le coût du crédit (n × m arrondie − C, comme sur un
 * contrat ; le coût calculé avec la mensualité exacte, somme de la
 * colonne des intérêts, est signalé quand il diffère). Chaque mois :
 * intérêts = capital restant dû × i, amortissement = m − intérêts.
 * Barres empilées de chaque mensualité (part de capital en bas, part
 * d'intérêts en haut), en pour cent de la mensualité : repère FIXE
 * (mois 0 à 84, 0 à 100 %). Tableau d'amortissement déroulant, calculé
 * sans arrondi intermédiaire. Exemple du cours : 10 000 € au TAEG de
 * 6,4 % en 12 mois → i ≈ 0,5183 %, m ≈ 861,67 €, coût 340,04 €
 * (340,09 € avec la mensualité exacte). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import { CSS_STAT, el, texte, repereStat } from './statistique-deux-variables-commun.js'
import { CSS_RS, nb, nbFixe, euros, texNb, texEuros, texPct, pct } from './nombres-reels-suites-commun.js'

var NMAX = 84
var R = repereStat({ xMin: 0, xMax: NMAX, yMin: 0, yMax: 100, ux: 5, uy: 2.3, pasX: 12, pasY: 20, grilleX: 6, grilleY: 10, nomX: 'mois', nomY: '% de la mensualité', mg: 40, mb: 40, md: 14, mh: 26, etiqX: function (v) { return nb(v, 0) }, etiqY: function (v) { return nb(v, 0) } })

/** Plan de remboursement exact. */
function plan(C, taeg, n) {
  var i = Math.pow(1 + taeg, 1 / 12) - 1
  var m = C * i / (1 - Math.pow(1 + i, -n))
  var lignes = [], reste = C
  for (var k = 1; k <= n; k++) {
    var I = reste * i, A = m - I
    lignes.push({ mois: k, debut: reste, interets: I, amort: A, fin: Math.max(0, reste - A) })
    reste -= A
  }
  var mr = Math.round(m * 100 + 1e-7) / 100
  return { i: i, m: m, mr: mr, lignes: lignes, total: n * mr, cout: n * mr - C, coutExact: n * m - C }
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + CSS_RS +
  '.figure svg{max-width:500px;}' +
  '.b-cap{fill:var(--sky,#2f6fb0);fill-opacity:0.75;}' +
  '.b-int{fill:var(--attn,#96650c);fill-opacity:0.8;}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;font-size:0.86rem;margin:0 0 8px;}' +
  '.legende span::before{content:"";display:inline-block;width:14px;height:12px;vertical-align:middle;margin-right:6px;border-radius:2px;}' +
  '.l-cap::before{background:var(--sky,#2f6fb0);}.l-int::before{background:var(--attn,#96650c);}' +
  '.resultats{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:6px;margin:0 0 10px;}' +
  '.resultats div{border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:6px 10px;text-align:center;}' +
  '.resultats .nom{display:block;font-size:0.8rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
  '.resultats .val{display:block;font-size:1.05rem;font-weight:700;font-variant-numeric:tabular-nums;}' +
  '.defile-v .tableau{font-size:0.8rem;}' +
  '.defile-v .tableau td{white-space:nowrap;padding:3px 5px;}' +
  '.defile-v .tableau th{padding:3px 5px;line-height:1.25;}' +
  '</style>' +
  '<div class="rangee" role="group" aria-label="Exemple"><button class="btn" id="exemple">Exemple du cours : 10 000 €, 6,4 %, 12 mois</button></div>' +
  '<div class="resultats" id="resultats" aria-live="polite"></div>' +
  '<div class="legende"><span class="l-cap">part de capital remboursé</span><span class="l-int">part d’intérêts</span></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Composition de chaque mensualité"></svg></div>' +
  '<div class="reglages">' + curseurHTML('C', 'Capital emprunté en euros', 500, 30000, 500) + curseurHTML('t', 'TAEG en pour cent', 0.5, 15, 0.1) + curseurHTML('n', 'Durée en mois', 6, NMAX, 6) + '</div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>' +
  '<div class="rangee"><button class="btn" id="voir-tableau" aria-expanded="false" aria-controls="zone-tableau">Afficher le tableau d’amortissement</button></div>' +
  '<div id="zone-tableau" hidden></div>'

class SimulateurCreditWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._C = 10000
    this._tp = 6.4
    this._n = 12
    this._tableau = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    function lier(id, cle, min, max, pas) {
      function regler(v) { self[cle] = borner(Math.round(v / pas) * pas, min, max); self[cle] = Math.round(self[cle] * 10) / 10; self._rendre() }
      sh.getElementById(id).addEventListener('input', function (e) { regler(parseFloat(e.target.value)) })
      sh.getElementById(id + '-moins').addEventListener('click', function () { regler(self[cle] - pas) })
      sh.getElementById(id + '-plus').addEventListener('click', function () { regler(self[cle] + pas) })
    }
    lier('C', '_C', 500, 30000, 500)
    lier('t', '_tp', 0.5, 15, 0.1)
    lier('n', '_n', 6, NMAX, 6)
    sh.getElementById('exemple').addEventListener('click', function () { self._C = 10000; self._tp = 6.4; self._n = 12; self._rendre() })
    sh.getElementById('voir-tableau').addEventListener('click', function () { self._tableau = !self._tableau; self._rendre() })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, C = this._C, taeg = this._tp / 100, n = this._n, P = plan(C, taeg, n)
    majCurseur(sh, 'C', C, 'C=' + texNb(C, 0))
    majCurseur(sh, 't', this._tp, '\\text{TAEG}=' + texPct(taeg, 1))
    majCurseur(sh, 'n', n, 'n=' + n)
    sh.getElementById('exemple').setAttribute('aria-pressed', String(C === 10000 && this._tp === 6.4 && n === 12))

    // ---------- Résultats ----------
    sh.getElementById('resultats').innerHTML =
      '<div><span class="nom">taux mensuel</span><span class="val">≈ ' + pct(P.i, 4) + '</span></div>' +
      '<div><span class="nom">mensualité</span><span class="val">' + euros(P.mr) + '</span></div>' +
      '<div><span class="nom">total remboursé</span><span class="val">' + euros(P.total) + '</span></div>' +
      '<div><span class="nom">coût du crédit</span><span class="val">' + euros(P.cout) + '</span></div>'

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 'cadre-cr')
    var g = R.groupe(svg, 'cadre-cr')
    var larg = R.o.ux * 0.82
    P.lignes.forEach(function (l) {
      var x = R.px(l.mois - 0.5, 0)[0] - larg / 2
      var pc = 100 * l.amort / P.m
      var yc = R.px(0, pc)[1], y0 = R.y1, yt = R.px(0, 100)[1]
      el('rect', { x: x.toFixed(2), y: yc.toFixed(2), width: larg.toFixed(2), height: (y0 - yc).toFixed(2), class: 'b-cap' }, g)
      el('rect', { x: x.toFixed(2), y: yt.toFixed(2), width: larg.toFixed(2), height: (yc - yt).toFixed(2), class: 'b-int' }, g)
    })
    var p1 = 100 * P.lignes[0].interets / P.m, pn = 100 * P.lignes[n - 1].interets / P.m
    var xf = R.px(n, 0)[0]
    if (n < NMAX - 18) texte(svg, xf + 6, R.px(0, 50)[1], 'fin du crédit', 'et et-petit et-soft', 'start')
    svg.setAttribute('aria-label', n + ' mensualités : la part d’intérêts passe de ' + nb(p1, 1) + ' % à ' + nb(pn, 1) + ' % de la mensualité')

    // ---------- Panneau ----------
    var h = '<p class="titre-panneau">Les calculs</p>'
    h += '<p class="ligne">Taux mensuel équivalent : ' + texEgalites(['i=(1+\\text{TAEG})^{\\frac{1}{12}}-1', texNb(1 + taeg, 3) + '^{\\frac{1}{12}}-1', '\\approx ' + texPct(P.i, 4)]) + '</p>'
    h += '<p class="ligne">Mensualité : ' + texEgalites(['m=\\dfrac{C\\cdot i}{1-(1+i)^{-n}}', '\\dfrac{' + texNb(C, 0) + '\\cdot i}{1-(1+i)^{-' + n + '}}', '\\approx ' + texNb(P.m, 4)]) + ' €, soit ' + euros(P.mr) + ' au centime.</p>'
    h += '<p class="ligne">Coût du crédit : ' + texEgalites([String(n) + '\\cdot ' + texEuros(P.mr) + '-' + texNb(C, 0), texEuros(P.cout)]) + ' € (total remboursé moins montant emprunté).</p>'
    if (Math.abs(P.cout - P.coutExact) >= 0.005) h += '<p class="note">Avec la mensualité exacte (non arrondie), le coût vaudrait ' + euros(P.coutExact) + ' : c’est la somme de la colonne des intérêts du tableau.</p>'
    h += '<p class="note">Le premier mois, les intérêts font ' + nb(p1, 1) + ' % de la mensualité ; le dernier mois, ' + nb(pn, 1) + ' % : on rembourse d’abord surtout des intérêts, puis surtout du capital.</p>'
    sh.getElementById('infos').innerHTML = h

    // ---------- Tableau d'amortissement ----------
    var bt = sh.getElementById('voir-tableau'), zone = sh.getElementById('zone-tableau')
    bt.setAttribute('aria-expanded', String(this._tableau))
    bt.textContent = this._tableau ? 'Masquer le tableau d’amortissement' : 'Afficher le tableau d’amortissement'
    zone.hidden = !this._tableau
    if (this._tableau) {
      var t = '<p class="note">Calculé sans arrondi intermédiaire (mensualité exacte ' + nb(P.m, 4) + ' €) ; montants en euros, affichés au centime ; « amortis. » : capital remboursé ce mois-là.</p>'
      t += '<div class="defile-v"><table class="tableau"><thead><tr><th>mois</th><th>restant dû (€)</th><th>intérêts (€)</th><th>amortis. (€)</th><th>restant dû après (€)</th></tr></thead><tbody>'
      var sI = 0
      P.lignes.forEach(function (l) {
        sI += l.interets
        t += '<tr><td>' + l.mois + '</td><td class="d">' + nbFixe(l.debut, 2) + '</td><td class="d">' + nbFixe(l.interets, 2) + '</td><td class="d">' + nbFixe(l.amort, 2) + '</td><td class="d">' + nbFixe(l.fin, 2) + '</td></tr>'
      })
      t += '<tr class="actif"><td>total</td><td></td><td class="d">' + nbFixe(sI, 2) + '</td><td class="d">' + nbFixe(C, 2) + '</td><td></td></tr>'
      t += '</tbody></table></div>'
      zone.innerHTML = t
    }
  }
}

if (!customElements.get('simulateur-credit-widget')) customElements.define('simulateur-credit-widget', SimulateurCreditWidget)
