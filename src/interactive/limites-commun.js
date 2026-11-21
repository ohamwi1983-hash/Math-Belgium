/* ================================================================
 * Outils partagés par les ateliers du 5e ch. 4 « Limites et asymptotes ».
 * Repère à fenêtre FIXE (jamais recalculée depuis un curseur), axes fléchés,
 * courbes coupées aux asymptotes et rognées au cadre, curseurs ≥ 44 px avec
 * boutons − / +, rangées de boutons à choix unique. Le KaTeX vient de
 * `katex-shadow.js` (styleKatex, tex, CSS_BASE…).
 * ================================================================ */
import { svgEl, defsFleche, tex, txtNombre, CSS_BASE } from './katex-shadow.js'

/** Styles communs des figures du chapitre (en plus de CSS_BASE). */
export var CSS_LIMITES =
  CSS_BASE +
  '.courbe{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round;}' +
  '.courbe-2{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:2.4;stroke-linejoin:round;}' +
  '.courbe-faible{fill:none;stroke:var(--ink-faint,#8a97a1);stroke-width:1.8;stroke-dasharray:6 4;}' +
  '.courbe-ok{fill:none;stroke:var(--good,#2f7a4f);stroke-width:3.6;stroke-linecap:round;}' +
  '.courbe-ko{fill:none;stroke:var(--bad,#b23a3a);stroke-width:3.6;stroke-linecap:round;}' +
  '.asym{stroke:var(--plan,#6b4fa0);stroke-width:1.8;stroke-dasharray:7 5;fill:none;}' +
  '.pt{fill:var(--accent,#b65c1f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
  '.pt-ok{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
  '.pt-ko{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:1.5;}' +
  '.pt-creux{fill:var(--surface-2,#f7f9fb);stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
  '.etiq{font-size:11.5px;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);paint-order:stroke;' +
  'stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;font-variant-numeric:tabular-nums;}' +
  '.etiq-plan{fill:var(--plan,#6b4fa0);}.etiq-ok{fill:var(--good,#2f7a4f);}.etiq-ko{fill:var(--bad,#b23a3a);}' +
  '.etiq-acc{fill:var(--accent-ink,#7a3c11);}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;font-size:0.85rem;margin:0 0 8px;}' +
  '.legende span{display:inline-flex;align-items:center;gap:6px;}' +
  '.legende i{display:inline-block;width:22px;height:0;border-top:3px solid var(--accent,#b65c1f);}' +
  '.legende i.l2{border-top-color:var(--sky,#2f6fb0);}' +
  '.legende i.lf{border-top:2px dashed var(--ink-faint,#8a97a1);}' +
  '.legende i.la{border-top:2px dashed var(--plan,#6b4fa0);}' +
  '.legende i.lok{border-top-color:var(--good,#2f7a4f);}' +
  '.legende i.lko{border-top-color:var(--bad,#b23a3a);}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  'table.tab{border-collapse:collapse;margin:0 auto 8px;font-size:0.88rem;font-variant-numeric:tabular-nums;}' +
  'table.tab th,table.tab td{border:1px solid var(--line,#ccd8e0);padding:5px 8px;text-align:center;}' +
  'table.tab th{background:var(--surface-2,#f7f9fb);font-weight:600;}' +
  '.tab-zone{overflow-x:auto;margin:0 0 8px;}'

/** Repère à fenêtre fixe dans `svg` (vidé). Options : x0, x1, y0, y1 (fenêtre), L, H (viewBox),
 * marges mg, md, mh, mb, gx / gy (graduations), fx / fy (texte d'une graduation), nomX, nomY,
 * grille (lignes aux graduations). Renvoie { px, py, zone } — `zone` est un groupe rogné au cadre. */
export function repere(svg, o) {
  var L = o.L || 420, H = o.H || 300
  var mg = o.mg === undefined ? 34 : o.mg, md = o.md === undefined ? 18 : o.md
  var mh = o.mh === undefined ? 14 : o.mh, mb = o.mb === undefined ? 26 : o.mb
  var x0 = o.x0, x1 = o.x1, y0 = o.y0, y1 = o.y1
  svg.setAttribute('viewBox', '0 0 ' + L + ' ' + H)
  svg.innerHTML = ''
  defsFleche(svg)
  function px(x) { return mg + ((x - x0) / (x1 - x0)) * (L - mg - md) }
  function py(y) { return H - mb - ((y - y0) / (y1 - y0)) * (H - mh - mb) }
  var defs = svg.querySelector('defs')
  var cp = svgEl('clipPath', { id: 'zone-trace' })
  cp.appendChild(svgEl('rect', { x: px(x0), y: py(y1), width: px(x1) - px(x0), height: py(y0) - py(y1) }))
  defs.appendChild(cp)
  var gx = o.gx || [], gy = o.gy || []
  var fx = o.fx || function (v) { return txtNombre(v, 2) }
  var fy = o.fy || function (v) { return txtNombre(v, 2) }
  if (o.grille !== false) {
    gx.forEach(function (v) { svg.appendChild(svgEl('line', { x1: px(v), x2: px(v), y1: py(y0), y2: py(y1), class: 'grille' })) })
    gy.forEach(function (v) { svg.appendChild(svgEl('line', { x1: px(x0), x2: px(x1), y1: py(v), y2: py(v), class: 'grille' })) })
  }
  var ax = y0 <= 0 && y1 >= 0 ? 0 : y0 // ordonnée de l'axe horizontal
  var ay = x0 <= 0 && x1 >= 0 ? 0 : x0 // abscisse de l'axe vertical
  svg.appendChild(svgEl('line', { x1: px(x0), x2: px(x1) + 7, y1: py(ax), y2: py(ax), class: 'axe', 'marker-end': 'url(#fleche)' }))
  svg.appendChild(svgEl('line', { x1: px(ay), x2: px(ay), y1: py(y0), y2: py(y1) - 7, class: 'axe', 'marker-end': 'url(#fleche)' }))
  texte(svg, px(x1) + 4, py(ax) - 7, o.nomX || 'x', 'nom-axe', 'end')
  texte(svg, px(ay) + 8, py(y1) + 2, o.nomY || 'y', 'nom-axe', 'start')
  gx.forEach(function (v) {
    if (v === ay && ax === 0 && ay === 0) return
    svg.appendChild(svgEl('line', { x1: px(v), x2: px(v), y1: py(ax) - 3, y2: py(ax) + 3, class: 'tick' }))
    texte(svg, px(v), py(ax) + 14, fx(v), 'tick-label', 'middle')
  })
  gy.forEach(function (v) {
    if (v === ax && ax === 0 && ay === 0) return
    svg.appendChild(svgEl('line', { x1: px(ay) - 3, x2: px(ay) + 3, y1: py(v), y2: py(v), class: 'tick' }))
    texte(svg, px(ay) - 5, py(v) + 3.5, fy(v), 'tick-label', 'end')
  })
  if (ax === 0 && ay === 0) texte(svg, px(0) - 5, py(0) + 14, '0', 'tick-label', 'end')
  var zone = svgEl('g', { 'clip-path': 'url(#zone-trace)' })
  svg.appendChild(zone)
  return { px: px, py: py, zone: zone, x0: x0, x1: x1, y0: y0, y1: y1, svg: svg }
}

/** Texte SVG (contenu en texte brut : « − » typographique, pas de LaTeX). */
export function texte(parent, x, y, contenu, cls, ancre) {
  var t = svgEl('text', { x: x, y: y, class: cls || 'etiq', 'text-anchor': ancre || 'start' })
  t.textContent = contenu
  parent.appendChild(t)
  return t
}

/** Courbe y = f(x) sur [a ; b], coupée en `coupures` (asymptotes verticales) et là où f n'est pas
 * finie ; rognée au cadre par le groupe `R.zone`. */
export function courbe(R, f, a, b, cls, coupures) {
  var bornes = [a]
  ;(coupures || []).slice().sort(function (u, v) { return u - v }).forEach(function (c) { if (c > a && c < b) bornes.push(c) })
  bornes.push(b)
  var eps = (R.x1 - R.x0) / 4000, haut = R.y1 - R.y0
  var ymin = R.y0 - 8 * haut, ymax = R.y1 + 8 * haut
  for (var k = 0; k + 1 < bornes.length; k++) {
    var u = bornes[k] + (k > 0 ? eps : 0), v = bornes[k + 1] - (k + 2 < bornes.length ? eps : 0)
    var d = '', n = 500, prec = null
    for (var i = 0; i <= n; i++) {
      var x = u + ((v - u) * i) / n, y = f(x)
      if (!isFinite(y)) { prec = null; continue }
      var yc = Math.max(ymin, Math.min(ymax, y))
      d += (prec === null ? 'M' : 'L') + R.px(x).toFixed(1) + ',' + R.py(yc).toFixed(1)
      prec = yc
    }
    if (d) R.zone.appendChild(svgEl('path', { d: d, class: cls }))
  }
}

/** Droite verticale x = a (asymptote) dans le cadre. */
export function verticale(R, a, cls) {
  R.zone.appendChild(svgEl('line', { x1: R.px(a), x2: R.px(a), y1: R.py(R.y0), y2: R.py(R.y1), class: cls || 'asym' }))
}

/** Droite y = m x + p dans le cadre. */
export function droite(R, m, p, cls) {
  R.zone.appendChild(svgEl('line', { x1: R.px(R.x0), y1: R.py(m * R.x0 + p), x2: R.px(R.x1), y2: R.py(m * R.x1 + p), class: cls || 'asym' }))
}

/** Point (rond) ; `cls` : pt, pt-ok, pt-ko, pt-creux. */
export function point(R, x, y, cls, r) {
  R.zone.appendChild(svgEl('circle', { cx: R.px(x), cy: R.py(y), r: r || 5, class: cls || 'pt' }))
}

/** Curseur avec boutons − / + (cibles ≥ 44 px). o : { min, max, pas, valeur, aria, nom(v) → HTML,
 * changer(v) }. Renvoie { fixer(v), valeur() }. */
export function curseur(parent, o) {
  var ligne = document.createElement('div')
  ligne.className = 'curseur'
  ligne.innerHTML = '<span class="nom"></span><button class="btn moins" type="button">−</button>' +
    '<input type="range"><button class="btn plus" type="button">+</button>'
  var nom = ligne.querySelector('.nom'), input = ligne.querySelector('input')
  var moins = ligne.querySelector('.moins'), plus = ligne.querySelector('.plus')
  input.min = String(o.min); input.max = String(o.max); input.step = String(o.pas)
  input.setAttribute('aria-label', o.aria)
  moins.setAttribute('aria-label', 'Diminuer : ' + o.aria)
  plus.setAttribute('aria-label', 'Augmenter : ' + o.aria)
  if (o.largeurNom) nom.style.minWidth = o.largeurNom
  var v = o.valeur
  function arrondir(x) {
    var k = Math.round((x - o.min) / o.pas)
    var r = o.min + k * o.pas
    r = Math.max(o.min, Math.min(o.max, r))
    return Math.round(r * 1e9) / 1e9
  }
  function maj() {
    input.value = String(v)
    nom.innerHTML = o.nom(v)
    moins.disabled = v <= o.min + 1e-12
    plus.disabled = v >= o.max - 1e-12
  }
  function fixer(x, silencieux) {
    v = arrondir(x)
    maj()
    if (!silencieux) o.changer(v)
  }
  input.addEventListener('input', function () { fixer(parseFloat(input.value)) })
  moins.addEventListener('click', function () { fixer(v - o.pas) })
  plus.addEventListener('click', function () { fixer(v + o.pas) })
  parent.appendChild(ligne)
  maj()
  return { fixer: function (x) { fixer(x, true) }, valeur: function () { return v }, ligne: ligne, nom: nom }
}

/** Rangée de boutons à choix unique. items : [{ id, html, aria? }]. Renvoie { choisir(id) }. */
export function choix(parent, items, actif, changer, aria) {
  var zone = document.createElement('div')
  zone.className = 'rangee'
  zone.setAttribute('role', 'group')
  if (aria) zone.setAttribute('aria-label', aria)
  var boutons = items.map(function (it) {
    var b = document.createElement('button')
    b.type = 'button'
    b.className = 'btn'
    b.innerHTML = it.html
    if (it.aria) b.setAttribute('aria-label', it.aria)
    b.addEventListener('click', function () { marquer(it.id); changer(it.id) })
    zone.appendChild(b)
    return b
  })
  function marquer(id) { boutons.forEach(function (b, i) { b.setAttribute('aria-pressed', String(items[i].id === id)) }) }
  marquer(actif)
  parent.appendChild(zone)
  return { choisir: marquer }
}

/** Nombre pour KaTeX : virgule, et notation a·10ⁿ au-delà de 10⁶ (sinon espaces fines des milliers). */
export function texGrand(n, dec) {
  var d = dec === undefined ? 2 : dec
  var a = Math.abs(n)
  if (a >= 1e6) {
    var e = Math.floor(Math.log10(a) + 1e-9), m = n / Math.pow(10, e)
    if (Math.abs(Math.round(m * 1e6) / 1e6) >= 10) { m /= 10; e += 1 }
    var ms = txtNombre(m, 6).replace('−', '-').replace(',', '{,}')
    return (ms === '1' ? '' : ms === '-1' ? '-' : ms + '\\cdot ') + '10^{' + e + '}'
  }
  var s = txtNombre(n, d).replace('−', '-')
  var parts = s.split(',')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')
  return parts.join('{,}')
}

/** Petit nombre pour KaTeX : notation m·10⁻ⁿ sous 10⁻³ (jamais « 0 » pour un écart non nul). */
export function texPetit(n) {
  var a = Math.abs(n)
  if (a === 0) return '0'
  if (a >= 1e-3) return texGrand(n, 4)
  var e = Math.floor(Math.log10(a) + 1e-12), m = n / Math.pow(10, e)
  return txtNombre(m, 2).replace('−', '-').replace(',', '{,}') + '\\cdot 10^{' + e + '}'
}

/** Polynôme en LaTeX ; `c[i]` = coefficient de xⁱ (nombres décimaux acceptés). */
export function texPoly(c, lettre) {
  var x = lettre || 'x', s = ''
  for (var i = c.length - 1; i >= 0; i--) {
    var a = Math.round(c[i] * 1e9) / 1e9
    if (a === 0) continue
    var abs = Math.abs(a), sig = a < 0 ? '-' : s ? '+' : ''
    var coef = abs === 1 && i > 0 ? '' : txtNombre(abs, 3).replace(',', '{,}')
    s += sig + coef + (i === 0 ? '' : i === 1 ? x : x + '^{' + i + '}')
  }
  return s || '0'
}

/** « = » si v s'écrit exactement avec `dec` décimales, « ≈ » sinon (LaTeX). */
export function rel(v, dec) {
  var f = Math.pow(10, dec === undefined ? 2 : dec)
  return Math.abs(v * f - Math.round(v * f)) < 1e-7 ? '=' : '\\approx '
}

export { tex }
