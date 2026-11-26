/* ================================================================
 * <simple-compose-widget> — atelier « Intérêt simple ou intérêts
 * composés ? » (5e (6h), algèbre financière, étape « intérêts »).
 * 10 000 € placés au taux annuel i. Valeur acquise après t années :
 * à intérêt simple 10 000(1 + i·t) (une droite), à intérêts composés
 * 10 000(1 + i)ᵗ (une courbe). Elles se croisent en t = 0 et t = 1 :
 * sur ]0 ; 1[, l'intérêt simple rapporte plus (la courbe est sous sa
 * corde), au-delà les intérêts composés l'emportent. Taux de 1 % à
 * 25 % (au pas de 0,5 %), durée de 0 à 3 ans (au mois près). Repère
 * FIXE : t de 0 à 3, valeurs de 10 000 à 20 000 € (au taux maximal,
 * 10 000·1,25³ ≈ 19 531 €). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import { CSS_STAT, el, texte, repereStat } from './statistique-deux-variables-commun.js'
import { CSS_RS, nb, euros, texNb, texEuros, pct, texPct } from './nombres-reels-suites-commun.js'

var C0 = 10000, TMAX = 3
var R = repereStat({ xMin: 0, xMax: TMAX, yMin: 10000, yMax: 20000, ux: 128, uy: 0.026, pasX: 0.5, pasY: 2000, grilleX: 0.25, grilleY: 1000, nomX: 't (années)', nomY: 'valeur acquise (€)', mg: 50, mb: 40, md: 16, mh: 26, etiqX: function (v) { return nb(v, 1) }, etiqY: function (v) { return nb(v, 0) } })
/** Vue « écart » : trois échelles FIXES au choix (y de −E à 0,6E). */
var ECHELLES = [250, 25, 2.5]
var RE = ECHELLES.map(function (E) {
  return repereStat({ xMin: 0, xMax: TMAX, yMin: -E, yMax: 0.6 * E, ux: 128, uy: 260 / (1.6 * E), pasX: 0.5, pasY: E / 5, grilleX: 0.25, nomX: 't (années)', nomY: 'écart simple − composés (€)', mg: 50, mb: 40, md: 16, mh: 26, etiqX: function (v) { return nb(v, 1) }, etiqY: function (v) { return nb(v, 1) } })
})
function simple(i, t) { return C0 * (1 + i * t) }
function compose(i, t) { return C0 * Math.pow(1 + i, t) }
/** « 1 an et 3 mois », « 6 mois », « 2 ans ». */
function duree(m) {
  var a = Math.floor(m / 12), r = m % 12, s = []
  if (a) s.push(a + (a > 1 ? ' ans' : ' an'))
  if (r || !a) s.push(r + ' mois')
  return s.join(' et ')
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + CSS_RS +
  '.c-simple{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.4;}' +
  '.c-compose{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:2.4;}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;font-size:0.86rem;margin:0 0 8px;}' +
  '.legende span::before{content:"";display:inline-block;width:18px;height:3px;vertical-align:middle;margin-right:6px;}' +
  '.l-simple::before{background:var(--accent,#b65c1f);}.l-compose::before{background:var(--sky,#2f6fb0);}' +
  '</style>' +
  '<p class="consigne">10 000 € placés au taux annuel i. Règle le taux et la durée : qui rapporte le plus ?</p>' +
  '<div class="legende"><span class="l-simple">intérêt simple : 10 000(1 + i·t)</span><span class="l-compose">intérêts composés : 10 000(1 + i)ᵗ</span></div>' +
  '<div class="rangee" role="group" aria-label="Vue"><button class="btn" data-v="valeurs">Valeurs acquises</button><button class="btn" data-v="ecart">Écart</button></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Valeurs acquises à intérêt simple et à intérêts composés"></svg></div>' +
  '<div class="rangee" role="group" aria-label="Échelle de l’écart" id="echelles"><span class="etiquette">Échelle :</span>' +
  ECHELLES.map(function (E, k) { return '<button class="btn" data-e="' + k + '">±' + nb(E, 1) + ' €</button>' }).join('') + '</div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('i', 'Taux annuel en pour cent', 1, 25, 0.5) + curseurHTML('t', 'Durée en mois', 0, 36, 1) + '</div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class SimpleComposeWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._ip = 10 // taux en %
    this._m = 6 // durée en mois
    this._vue = 'valeurs'
    this._e = 1
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    function lier(id, cle, min, max, pas) {
      function regler(v) { self[cle] = borner(Math.round(v / pas) * pas, min, max); self._rendre() }
      sh.getElementById(id).addEventListener('input', function (e) { regler(parseFloat(e.target.value)) })
      sh.getElementById(id + '-moins').addEventListener('click', function () { regler(self[cle] - pas) })
      sh.getElementById(id + '-plus').addEventListener('click', function () { regler(self[cle] + pas) })
    }
    lier('i', '_ip', 1, 25, 0.5)
    lier('t', '_m', 0, 36, 1)
    sh.querySelectorAll('[data-v]').forEach(function (b) { b.addEventListener('click', function () { self._vue = b.getAttribute('data-v'); self._rendre() }) })
    sh.querySelectorAll('[data-e]').forEach(function (b) { b.addEventListener('click', function () { self._e = +b.getAttribute('data-e'); self._rendre() }) })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, i = this._ip / 100, m = this._m, t = m / 12
    majCurseur(sh, 'i', this._ip, 'i=' + texPct(i, 1))
    majCurseur(sh, 't', m, 't=' + (m % 12 === 0 ? String(m / 12) : '\\tfrac{' + m + '}{12}'))
    var s = simple(i, t), c = compose(i, t), ec = s - c

    // ---------- Figure ----------
    var self = this, vue = this._vue
    sh.querySelectorAll('[data-v]').forEach(function (bt) { bt.setAttribute('aria-pressed', String(bt.getAttribute('data-v') === vue)) })
    sh.querySelectorAll('[data-e]').forEach(function (bt) { bt.setAttribute('aria-pressed', String(+bt.getAttribute('data-e') === self._e)) })
    sh.getElementById('echelles').hidden = vue !== 'ecart'
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    if (vue === 'valeurs') this._valeurs(svg, i, t, s, c)
    else this._ecart(svg, i, t, ec)
    svg.setAttribute('aria-label', 'Taux ' + pct(i, 1) + ', durée ' + duree(m) + ' : simple ' + euros(s) + ', composés ' + euros(c))

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict'), ecart = Math.abs(Math.round(ec * 100) / 100)
    if (m === 0 || m === 12) {
      v.className = 'verdict neutre'
      v.textContent = (m === 0 ? 'Au départ' : 'Au bout d’un an') + ', les deux valeurs sont égales : ' + euros(s) + '.'
    } else {
      v.className = 'verdict ' + (m < 12 ? 'ok' : 'neutre')
      v.textContent = 'Après ' + duree(m) + ' : simple ' + euros(s) + ', composés ' + euros(c) + '. ' +
        (m < 12 ? 'L’intérêt simple rapporte ' + euros(ecart) + ' de plus.' : 'Les intérêts composés rapportent ' + euros(ecart) + ' de plus.')
    }

    // ---------- Panneau ----------
    var tt2 = m % 12 === 0 ? String(m / 12) : '\\tfrac{' + m + '}{12}'
    var h = '<p class="titre-panneau">Le calcul pour ' + duree(m) + '</p>'
    h += '<p class="ligne">Simple : ' + texEgalites(['C_t=10\\,000\\cdot(1+' + texNb(i, 3) + '\\cdot ' + tt2 + ')', (Math.abs(s * 100 - Math.round(s * 100)) < 1e-6 ? '' : '\\approx ') + texEuros(s)]) + ' €</p>'
    h += '<p class="ligne">Composés : ' + texEgalites(['C_t=10\\,000\\cdot ' + texNb(1 + i, 3) + '^{' + tt2 + '}', (Math.abs(c * 100 - Math.round(c * 100)) < 1e-6 ? '' : '\\approx ') + texEuros(c)]) + ' €</p>'
    h += '<div class="defile"><table class="tableau"><thead><tr><th>durée</th><th>simple</th><th>composés</th><th>le plus avantageux</th></tr></thead><tbody>'
    ;[1, 6, 12, 24, 36].forEach(function (mm) {
      var a1 = simple(i, mm / 12), a2 = compose(i, mm / 12), d2 = Math.round((a1 - a2) * 100) / 100
      h += '<tr' + (mm === m ? ' class="actif"' : '') + '><td class="g">' + duree(mm) + '</td><td class="d">' + euros(a1) + '</td><td class="d">' + euros(a2) + '</td><td>' + (mm === 12 ? 'égalité' : d2 > 0 ? 'simple' : 'composés') + '</td></tr>'
    })
    h += '</tbody></table></div>'
    h += '<p class="ligne">Au bout d’un an, les deux valent ' + tex('10\\,000\\cdot(1+i)') + '. Entre 0 et 1 an, la courbe des intérêts composés passe sous la droite : l’intérêt simple rapporte plus. Après un an, elle passe au-dessus.</p>'
    h += '<p class="note">C’est pourquoi, pour une durée non entière, les banques comptent les années entières à intérêts composés et la fraction d’année restante à intérêt simple : le client y gagne. Avec un taux réaliste (3 %), l’écart sur moins d’un an ne dépasse pas 1,11 € pour 10 000 € : augmente le taux pour le voir sur le graphique.</p>'
    sh.getElementById('infos').innerHTML = h
  }

  _valeurs(svg, i, t, s, c) {
    svg.setAttribute('viewBox', '0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0))
    R.fond(svg, 'cadre-sc')
    var g = R.groupe(svg, 'cadre-sc')
    // zones entre les deux courbes : vert (simple au-dessus) sur ]0 ; 1[, bleu (composés au-dessus) au-delà
    function zone(t0, t1, cls) {
      var haut = [], bas = []
      for (var k = 0; k <= 60; k++) {
        var tt = t0 + (t1 - t0) * k / 60
        haut.push(R.px(tt, simple(i, tt))); bas.push(R.px(tt, compose(i, tt)))
      }
      var d = 'M' + haut.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1) }).join(' L') + ' L' + bas.reverse().map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1) }).join(' L') + ' Z'
      el('path', { d: d, class: cls }, g)
    }
    zone(0, 1, 'zone-ok')
    zone(1, TMAX, 'zone-sky')
    var pts = []
    for (var k = 0; k <= 150; k++) { var tt = TMAX * k / 150, q = R.px(tt, compose(i, tt)); pts.push(q[0].toFixed(1) + ',' + q[1].toFixed(1)) }
    el('polyline', { points: pts.join(' '), class: 'c-compose' }, g)
    var a = R.px(0, C0), b = R.px(TMAX, simple(i, TMAX))
    el('line', { x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: b[0].toFixed(1), y2: b[1].toFixed(1), class: 'c-simple' }, g)
    // croisement en t = 1
    var x1 = R.px(1, C0 * (1 + i))
    el('line', { x1: x1[0].toFixed(1), y1: x1[1].toFixed(1), x2: x1[0].toFixed(1), y2: R.y1, class: 'trait-soft pointille fin' }, g)
    el('circle', { cx: x1[0].toFixed(1), cy: x1[1].toFixed(1), r: 4.5, class: 'pt' }, svg)
    texte(svg, x1[0] - 6, x1[1] - 10, 'croisement à 1 an', 'et et-petit', 'end')
    // durée choisie
    var ps = R.px(t, s), pc = R.px(t, c)
    el('line', { x1: ps[0].toFixed(1), y1: R.y0, x2: ps[0].toFixed(1), y2: R.y1, class: 'trait-plan fin' }, g)
    el('circle', { cx: ps[0].toFixed(1), cy: ps[1].toFixed(1), r: 5, class: 'pt-acc' }, svg)
    el('circle', { cx: pc[0].toFixed(1), cy: pc[1].toFixed(1), r: 5, class: 'pt-sky' }, svg)
  }

  _ecart(svg, i, t, ec) {
    var Re = RE[this._e], E = ECHELLES[this._e]
    svg.setAttribute('viewBox', '0 0 ' + Re.L.toFixed(0) + ' ' + Re.H.toFixed(0))
    Re.fond(svg, 'cadre-ec')
    var g = Re.groupe(svg, 'cadre-ec')
    function chemin(t0, t1) {
      var pts = []
      for (var k = 0; k <= 80; k++) { var tt = t0 + (t1 - t0) * k / 80; var q = Re.px(tt, Math.max(-3 * E, Math.min(3 * E, simple(i, tt) - compose(i, tt)))); pts.push(q[0].toFixed(1) + ',' + q[1].toFixed(1)) }
      return pts
    }
    var z0 = Re.px(0, 0)[1]
    var p1 = chemin(0, 1), p2 = chemin(1, TMAX)
    el('path', { d: 'M' + p1.join(' L') + ' L' + Re.px(1, 0)[0].toFixed(1) + ',' + z0.toFixed(1) + ' Z', class: 'zone-ok' }, g)
    el('path', { d: 'M' + p2.join(' L') + ' L' + Re.px(TMAX, 0)[0].toFixed(1) + ',' + z0.toFixed(1) + ' L' + Re.px(1, 0)[0].toFixed(1) + ',' + z0.toFixed(1) + ' Z', class: 'zone-sky' }, g)
    el('polyline', { points: p1.concat(p2).join(' '), class: 'c-simple' }, g)
    var x1 = Re.px(1, 0)
    el('circle', { cx: x1[0].toFixed(1), cy: x1[1].toFixed(1), r: 4.5, class: 'pt' }, svg)
    texte(svg, Re.px(0.5, 0)[0], z0 + 16, 'simple rapporte plus', 'et et-petit et-good')
    var pe = Re.px(t, ec), dedans = ec >= -E && ec <= 0.6 * E
    el('line', { x1: pe[0].toFixed(1), y1: Re.y0, x2: pe[0].toFixed(1), y2: Re.y1, class: 'trait-plan fin' }, g)
    if (dedans) el('circle', { cx: pe[0].toFixed(1), cy: pe[1].toFixed(1), r: 5, class: 'pt-acc' }, svg)
    var maxe = 0
    for (var k = 1; k < 100; k++) maxe = Math.max(maxe, simple(i, k / 100) - compose(i, k / 100))
    if (maxe < E / 20) texte(svg, Re.x1 - 4, Re.y0 + 16, 'écart trop petit : choisis une échelle plus fine', 'et et-petit et-bad', 'end')
    else if (maxe > 0.6 * E) texte(svg, Re.x1 - 4, Re.y0 + 16, 'l’écart sort du cadre : choisis une échelle plus large', 'et et-petit et-bad', 'end')
  }
}

if (!customElements.get('simple-compose-widget')) customElements.define('simple-compose-widget', SimpleComposeWidget)
