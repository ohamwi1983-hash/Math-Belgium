/* ================================================================
 * <ordre-repetition-widget> — atelier « Ordre ou pas, répétition ou
 * pas » (6e, ch. 7, § 1, après le tableau de classification).
 * n lettres (2 à 5), groupements de p lettres (1 à 3), deux
 * interrupteurs : l'ordre compte ? la répétition est permise ?
 * Le widget LISTE réellement tous les groupements, en tuiles.
 * Quand l'ordre compte, les mots qui utilisent les mêmes lettres sont
 * rangés dans un même cadre ; couper l'ordre fait fusionner chaque
 * cadre en une seule tuile (animation), marquée « × nombre d'ordres » :
 * on voit Aₙᵖ = Cₙᵖ · p!. Avec répétition, les cadres n'ont pas tous
 * la même taille (AAB n'a que 3 ordres) : c'est pourquoi Γₙᵖ n'est
 * pas nᵖ / p!. Compteurs A, C, B, Γ dans un tableau 2 × 2 (cases
 * cliquables). Notation du tableau de classification du cours (n, p).
 * Pas de figure SVG : aucun épinglage. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, CSS_BASE } from './katex-shadow.js'

var LETTRES = ['A', 'B', 'C', 'D', 'E']
var COULEURS = ['accent', 'sky', 'good', 'plan', 'rose']

function fact(k) { var f = 1; for (var i = 2; i <= k; i++) f *= i; return f }
function comb(n, k) { if (k < 0 || k > n) return 0; return fact(n) / (fact(k) * fact(n - k)) }

// Tous les mots de longueur p sur les n premières lettres.
function mots(n, p, rep) {
  var res = []
  ;(function construire(pref, util) {
    if (pref.length === p) { res.push(pref); return }
    for (var i = 0; i < n; i++) {
      if (!rep && util[i]) continue
      util[i] = true
      construire(pref + LETTRES[i], util)
      util[i] = false
    }
  })('', [])
  return res
}
function canonique(m) { return m.split('').sort().join('') }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:0 18px;}' +
  '.interrupteurs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:6px;margin:0 0 10px;}' +
  '.interrupteurs .btn{width:100%;}' +
  '.compteurs{width:100%;border-collapse:collapse;font-size:0.88rem;margin:0 0 10px;table-layout:fixed;}' +
  '.compteurs th,.compteurs td{border:1px solid var(--line,#ccd8e0);padding:4px 6px;text-align:center;vertical-align:middle;}' +
  '.compteurs th{font-weight:600;color:var(--ink-soft,#51626f);background:var(--surface-2,#f7f9fb);}' +
  '.compteurs td{cursor:pointer;line-height:1.5;}' +
  '.compteurs td.actif{background:var(--accent-soft,#f4e3d1);outline:2px solid var(--accent,#b65c1f);outline-offset:-2px;}' +
  '.compteurs td .nb{display:block;font-weight:700;font-size:1.02rem;font-variant-numeric:tabular-nums;}' +
  '.compteurs td.vide{color:var(--ink-faint,#8a97a1);}' +
  '.zone{position:relative;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start;margin:0 0 10px;padding:8px;' +
  'background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);min-height:60px;}' +
  '.cadre{display:flex;flex-wrap:wrap;gap:4px;padding:4px;border:1.5px dashed var(--line,#ccd8e0);border-radius:6px;}' +
  '.tuile{display:inline-flex;gap:2px;padding:3px;border-radius:5px;background:var(--surface,#fff);border:1px solid var(--line,#ccd8e0);' +
  'position:relative;}' +
  '.tuile.fusion{padding-right:3px;}' +
  '.badge{position:absolute;top:-8px;right:-8px;min-width:22px;height:18px;padding:0 4px;border-radius:9px;font-size:0.72rem;font-weight:700;' +
  'line-height:18px;text-align:center;background:var(--ink,#182430);color:var(--surface,#fff);font-variant-numeric:tabular-nums;}' +
  '.puce{display:inline-flex;align-items:center;justify-content:center;width:22px;height:24px;border-radius:3px;font-weight:700;' +
  'font-size:0.9rem;color:var(--surface,#fff);}' +
  '.c-accent{background:var(--accent,#b65c1f);}.c-sky{background:var(--sky,#2f6fb0);}.c-good{background:var(--good,#2f7a4f);}' +
  '.c-plan{background:var(--plan,#5b4ea3);}.c-rose{background:var(--rose,#b23a7a);}' +
  '.fantome{position:absolute;pointer-events:none;margin:0;z-index:2;}' +
  '.total{font-weight:700;}' +
  '</style>' +
  '<div class="reglages">' +
  '<div class="curseur"><span class="nom" id="nom-n"></span><button class="btn" id="n-moins" aria-label="Une lettre de moins">−</button>' +
  '<input type="range" id="n" min="2" max="5" step="1" aria-label="Nombre de lettres n"><button class="btn" id="n-plus" aria-label="Une lettre de plus">+</button></div>' +
  '<div class="curseur"><span class="nom" id="nom-p"></span><button class="btn" id="p-moins" aria-label="Groupements plus courts">−</button>' +
  '<input type="range" id="p" min="1" max="3" step="1" aria-label="Longueur des groupements p"><button class="btn" id="p-plus" aria-label="Groupements plus longs">+</button></div>' +
  '</div>' +
  '<div class="interrupteurs">' +
  '<button class="btn" id="ordre" aria-pressed="true"></button>' +
  '<button class="btn" id="rep" aria-pressed="false"></button>' +
  '</div>' +
  '<p class="total" id="total" aria-live="polite"></p>' +
  '<div class="zone" id="zone"></div>' +
  '<div class="panneau" id="panneau"></div>' +
  '<table class="compteurs" id="compteurs" aria-label="Les quatre compteurs"></table>'

class OrdreRepetitionWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._n = 4
    this._p = 3
    this._ordre = true
    this._rep = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var regler = function (cle, v) {
      var min = cle === 'n' ? 2 : 1, max = cle === 'n' ? 5 : self._pMax()
      var nv = Math.max(min, Math.min(max, Math.round(v)))
      if (cle === 'n') { self._n = nv; self._p = Math.min(self._p, self._pMax()) } else self._p = nv
      self._rendre(null)
    }
    ;['n', 'p'].forEach(function (cle) {
      var input = sh.getElementById(cle)
      input.addEventListener('input', function () { regler(cle, parseFloat(input.value)) })
      sh.getElementById(cle + '-moins').addEventListener('click', function () { regler(cle, self['_' + cle] - 1) })
      sh.getElementById(cle + '-plus').addEventListener('click', function () { regler(cle, self['_' + cle] + 1) })
    })
    sh.getElementById('ordre').addEventListener('click', function () { self._basculer(!self._ordre, self._rep) })
    sh.getElementById('rep').addEventListener('click', function () { self._basculer(self._ordre, !self._rep) })
    sh.getElementById('compteurs').addEventListener('click', function (ev) {
      var td = ev.target.closest && ev.target.closest('td[data-ordre]')
      if (!td) return
      self._basculer(td.getAttribute('data-ordre') === '1', td.getAttribute('data-rep') === '1')
    })
    this._rendre(null)
  }

  _pMax() { return this._rep ? 3 : Math.min(3, this._n) }

  _basculer(ordre, rep) {
    if (ordre === this._ordre && rep === this._rep) return
    var animer = rep === this._rep // seule la bascule de l'ordre s'anime (fusion / séparation)
    var avant = animer ? this._positions() : null
    var zone = this._sh.getElementById('zone')
    // Pendant la fusion, la zone garde sa hauteur : les tuiles qui filent vers leur groupe ne
    // passent jamais sur le texte placé dessous.
    if (animer && ordre === false) zone.style.minHeight = zone.getBoundingClientRect().height + 'px'
    this._ordre = ordre
    this._rep = rep
    if (!rep && this._p > this._n) this._p = this._n // sans répétition, au plus n lettres
    this._rendre(avant)
  }

  // Positions des tuiles (relatives à la zone), par mot affiché.
  _positions() {
    var zone = this._sh.getElementById('zone'), zr = zone.getBoundingClientRect(), pos = {}
    zone.querySelectorAll('.tuile').forEach(function (t) {
      var r = t.getBoundingClientRect()
      pos[t.getAttribute('data-mot')] = { x: r.left - zr.left, y: r.top - zr.top, w: r.width, h: r.height, el: t }
    })
    return pos
  }

  _tuile(mot, badge) {
    var h = '<span class="tuile' + (badge ? ' fusion' : '') + '" data-mot="' + mot + '" aria-label="' + mot.split('').join(' ') + '">'
    for (var i = 0; i < mot.length; i++) {
      var idx = LETTRES.indexOf(mot[i])
      h += '<span class="puce c-' + COULEURS[idx] + '">' + mot[i] + '</span>'
    }
    if (badge) h += '<span class="badge" title="nombre d’ordres fusionnés">×' + badge + '</span>'
    return h + '</span>'
  }

  _rendre(avant) {
    var sh = this._sh, n = this._n, p = this._p, ordre = this._ordre, rep = this._rep, self = this
    sh.getElementById('n').value = String(n)
    sh.getElementById('p').value = String(p)
    sh.getElementById('p').max = String(this._pMax())
    sh.getElementById('nom-n').innerHTML = tex('n=' + n)
    sh.getElementById('nom-p').innerHTML = tex('p=' + p)
    sh.getElementById('n-moins').disabled = n <= 2
    sh.getElementById('n-plus').disabled = n >= 5
    sh.getElementById('p-moins').disabled = p <= 1
    sh.getElementById('p-plus').disabled = p >= this._pMax()
    var bo = sh.getElementById('ordre'), br = sh.getElementById('rep')
    bo.setAttribute('aria-pressed', String(ordre))
    bo.textContent = ordre ? 'L’ordre compte : oui' : 'L’ordre compte : non'
    br.setAttribute('aria-pressed', String(rep))
    br.textContent = rep ? 'Répétition permise : oui' : 'Répétition permise : non'

    // Compteurs 2 × 2.
    var A = p <= n ? fact(n) / fact(n - p) : 0, Cc = comb(n, p), B = Math.pow(n, p), G = comb(n + p - 1, p)
    var cellule = function (o, r, formule, nb, possible) {
      var actif = o === ordre && r === rep
      return '<td data-ordre="' + (o ? 1 : 0) + '" data-rep="' + (r ? 1 : 0) + '" class="' + (actif ? 'actif' : '') + (possible ? '' : ' vide') + '">' +
        tex(formule) + '<span class="nb">' + (possible ? nb : 'impossible') + '</span></td>'
    }
    var formA = p === n ? 'P_{' + n + '}=' + n + '!' : 'A_{' + n + '}^{' + p + '}'
    sh.getElementById('compteurs').innerHTML =
      '<tr><th></th><th>sans répétition</th><th>avec répétition</th></tr>' +
      '<tr><th>ordre compte</th>' + cellule(true, false, formA, A, p <= n) + cellule(true, true, 'B_{' + n + '}^{' + p + '}=' + n + '^{' + p + '}', B, true) + '</tr>' +
      '<tr><th>ordre libre</th>' + cellule(false, false, 'C_{' + n + '}^{' + p + '}', Cc, p <= n) + cellule(false, true, '\\Gamma_{' + n + '}^{' + p + '}=C_{' + (n + p - 1) + '}^{' + p + '}', G, true) + '</tr>'

    // Groupements : cadres (ordre) ou tuiles fusionnées (sans ordre).
    var liste = mots(n, p, rep), groupes = {}, ordreGroupes = []
    liste.forEach(function (m) {
      var c = canonique(m)
      if (!groupes[c]) { groupes[c] = []; ordreGroupes.push(c) }
      groupes[c].push(m)
    })
    ordreGroupes.sort()
    var h = ''
    if (ordre) {
      ordreGroupes.forEach(function (c) {
        var ms = groupes[c].slice().sort()
        h += ms.length > 1 ? '<span class="cadre">' + ms.map(function (m) { return self._tuile(m, 0) }).join('') + '</span>' : self._tuile(ms[0], 0)
      })
    } else {
      ordreGroupes.forEach(function (c) { h += self._tuile(c, groupes[c].length > 1 ? groupes[c].length : 0) })
    }
    var zone = sh.getElementById('zone')
    zone.innerHTML = h
    var nb = ordre ? liste.length : ordreGroupes.length
    sh.getElementById('total').textContent = nb + (nb > 1 ? ' groupements' : ' groupement') + ' affichés.'

    this._panneau(groupes, ordreGroupes, A, Cc, B, G)
    if (avant) this._animer(avant, groupes, ordre)
  }

  _animer(avant, groupes, versOrdre) {
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduit || !Element.prototype.animate) { this._sh.getElementById('zone').style.minHeight = ''; return }
    var zone = this._sh.getElementById('zone'), apres = this._positions()
    var duree = 650
    window.clearTimeout(this._finFusion)
    this._finFusion = window.setTimeout(function () { zone.style.minHeight = '' }, duree + 50)
    Object.keys(groupes).forEach(function (c) {
      var ms = groupes[c]
      if (!versOrdre) {
        // Fusion : chaque mot du groupe file vers la tuile unique.
        var cible = apres[c]
        if (!cible) return
        var depart = avant[c] || avant[ms[0]]
        if (depart) cible.el.animate([{ transform: 'translate(' + (depart.x - cible.x) + 'px,' + (depart.y - cible.y) + 'px)' }, { transform: 'none' }], { duration: duree, easing: 'ease-in-out' })
        ms.forEach(function (m) {
          var a = avant[m]
          if (!a || m === c) return
          var f = a.el.cloneNode(true)
          f.classList.add('fantome')
          f.style.left = a.x + 'px'
          f.style.top = a.y + 'px'
          zone.appendChild(f)
          var anim = f.animate([
            { transform: 'none', opacity: 1 },
            { transform: 'translate(' + (cible.x - a.x) + 'px,' + (cible.y - a.y) + 'px)', opacity: 0 },
          ], { duration: duree, easing: 'ease-in-out' })
          anim.onfinish = function () { f.remove() }
        })
      } else {
        // Séparation : les mots sortent de la tuile fusionnée.
        var src = avant[c]
        if (!src) return
        ms.forEach(function (m) {
          var b = apres[m]
          if (!b) return
          b.el.animate([
            { transform: 'translate(' + (src.x - b.x) + 'px,' + (src.y - b.y) + 'px)', opacity: m === c ? 1 : 0.2 },
            { transform: 'none', opacity: 1 },
          ], { duration: duree, easing: 'ease-in-out' })
        })
      }
    })
  }

  _panneau(groupes, ordreGroupes, A, Cc, B, G) {
    var n = this._n, p = this._p, ordre = this._ordre, rep = this._rep
    var h = ''
    if (!rep) {
      if (p === 1) {
        h = '<p>Avec une seule lettre, l’ordre ne joue aucun rôle : ' + tex('A_{' + n + '}^{1}=C_{' + n + '}^{1}=' + n) + '. Augmente ' + tex('p') + ' pour voir la fusion.</p>'
      } else if (ordre) {
        h = '<p>Chaque cadre regroupe les mots qui utilisent les <strong>mêmes</strong> ' + p + ' lettres : il en contient ' +
          tex(p + '!=' + fact(p)) + ', un par ordre possible. Coupe l’ordre : chaque cadre fusionne en une seule tuile.</p>' +
          '<p>' + tex((p === n ? 'P_{' + n + '}' : 'A_{' + n + '}^{' + p + '}') + '=' + A) + ' mots, rangés en ' + Cc + (Cc > 1 ? ' cadres' : ' cadre') + ' de ' + fact(p) + '.</p>'
      } else {
        h = '<p>Chaque tuile remplace les ' + tex(p + '!=' + fact(p)) + ' mots de son cadre (badge ' + tex('\\times' + fact(p)) + ') : tous les cadres ont la même taille, donc</p>' +
          '<p class="formule">' + tex('A_{' + n + '}^{' + p + '}=C_{' + n + '}^{' + p + '}\\times ' + p + '!') + ' ' +
          tex('\\text{soit } ' + A + '=' + Cc + '\\times' + fact(p)) + ' ' + tex('\\text{et } C_{' + n + '}^{' + p + '}=\\dfrac{A_{' + n + '}^{' + p + '}}{' + p + '!}') + '</p>'
      }
    } else {
      // Tailles des cadres avec répétition.
      var tailles = {}
      ordreGroupes.forEach(function (c) { var t = groupes[c].length; tailles[t] = (tailles[t] || 0) + 1 })
      var cles = Object.keys(tailles).map(Number).sort(function (a, b) { return b - a })
      var detail = cles.map(function (t) {
        var q = tailles[t]
        if (t === 1) return q + (q > 1 ? ' mots seuls' : ' mot seul') + ' (une seule lettre répétée)'
        return q + (q > 1 ? ' cadres' : ' cadre') + ' de ' + t + ' mots'
      }).join(', ')
      var badges = cles.map(function (t) {
        var q = tailles[t]
        if (t === 1) return q + (q > 1 ? ' tuiles' : ' tuile') + ' sans badge (une seule lettre, répétée)'
        return q + (q > 1 ? ' tuiles ' : ' tuile ') + '×' + t
      }).join(', ')
      if (p === 1) {
        h = '<p>Avec une seule lettre, répéter n’a pas de sens : ' + tex('B_{' + n + '}^{1}=\\Gamma_{' + n + '}^{1}=' + n) + '. Augmente ' + tex('p') + '.</p>'
      } else if (ordre) {
        h = '<p>' + tex('B_{' + n + '}^{' + p + '}=' + n + '^{' + p + '}=' + B) + ' mots. Les cadres n’ont plus tous la même taille : ' + detail +
          '. Un mot comme ' + (p === 2 ? '« AA »' : '« AAB »') + ' a moins d’ordres possibles, parce que deux lettres pareilles échangées donnent le même mot.</p>' +
          '<p>Coupe l’ordre et regarde les badges.</p>'
      } else {
        var div = B / fact(p)
        h = '<p>' + tex('\\Gamma_{' + n + '}^{' + p + '}=C_{' + (n + p - 1) + '}^{' + p + '}=' + G) + ' groupes. Badges : ' + badges + '.</p>' +
          '<p>Les tuiles ne remplacent pas toutes ' + fact(p) + ' mots : diviser ' + tex(n + '^{' + p + '}') + ' par ' + tex(p + '!') + ' donnerait ' +
          (Number.isInteger(div) ? tex(String(div)) + ', et non ' + G : tex('\\dfrac{' + B + '}{' + fact(p) + '}') + ', qui n’est même pas un entier') +
          '. C’est pour cela que la combinaison avec répétition a sa propre formule.</p>'
      }
    }
    this._sh.getElementById('panneau').innerHTML = h
  }
}

if (!customElements.get('ordre-repetition-widget')) customElements.define('ordre-repetition-widget', OrdreRepetitionWidget)
