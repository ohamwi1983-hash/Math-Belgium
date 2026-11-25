/* ================================================================
 * <anagrammes-fusion-widget> — atelier « Anagrammes » (6e, ch. 7,
 * § 2, permutation avec répétitions). L'élève tape un mot (champ
 * texte JAMAIS filtré : accents retirés, majuscules, ce qui n'est pas
 * une lettre est ignoré et signalé). Le widget compte les lettres,
 * affiche n! ÷ (n₁! × n₂! × …) en KaTeX, le nombre de permutations
 * distinctes et d'anagrammes (le mot de départ retiré). Calcul exact
 * (BigInt) jusqu'à 20 lettres (MISSISSIPPI : 34 650, soit 34 649
 * anagrammes). Pour un mot court, la LISTE des mots : lettres
 * identiques discernables (indices P₁, P₂), chaque cadre regroupe les
 * n₁! × n₂! × … permutations qui donnent le même mot ; les rendre
 * indiscernables fait FUSIONNER chaque cadre en une seule tuile
 * (animation, rien si `prefers-reduced-motion`). Option « retirer le
 * mot de départ ». Défaut : PAPA (24 permutations, 6 mots, cadres de
 * 4 = 2! × 2!). Pas de figure SVG : aucun épinglage.
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'

var N_CALCUL = 20, N_DISCERNABLES = 5, MAX_TUILES = 360
var COULEURS = ['accent', 'sky', 'good', 'plan', 'rose', 'tip']
var INDICES = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
var EXEMPLES = ['PAPA', 'RADAR', 'ANANAS', 'MATHS', 'MISSISSIPPI']

function factB(k) { var f = 1n; for (var i = 2n; i <= BigInt(k); i++) f *= i; return f }
function milliers(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') }
function texMilliers(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') }
function indice(k) { return String(k).split('').map(function (c) { return INDICES[+c] }).join('') }
function echapper(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Lettres du mot (A à Z, accents retirés), types dans l'ordre d'apparition, caractères ignorés. */
function analyser(brut) {
  var s = String(brut || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/œ/gi, 'oe').replace(/æ/gi, 'ae').toUpperCase()
  var lettres = [], ignores = []
  for (var i = 0; i < s.length; i++) {
    var c = s[i]
    if (/[A-Z]/.test(c)) lettres.push(c)
    else if (!/\s/.test(c) && ignores.indexOf(c) < 0) ignores.push(c)
  }
  var types = [], effectifs = {}
  lettres.forEach(function (c) {
    if (!effectifs[c]) { effectifs[c] = 0; types.push(c) }
    effectifs[c]++
  })
  return { lettres: lettres, types: types, effectifs: effectifs, ignores: ignores }
}

/** Toutes les permutations des positions 0..n−1, ordre lexicographique (la première = le mot de départ). */
function permutations(n) {
  var res = [], util = []
  ;(function f(pref) {
    if (pref.length === n) { res.push(pref.slice()); return }
    for (var i = 0; i < n; i++) {
      if (util[i]) continue
      util[i] = true; pref.push(i); f(pref); pref.pop(); util[i] = false
    }
  })([])
  return res
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.saisie{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin:0 0 6px;}' +
  '.saisie label{font-weight:600;}' +
  '.saisie input{flex:1 1 180px;min-width:0;min-height:44px;padding:6px 10px;font:inherit;font-size:1.05rem;letter-spacing:1px;' +
  'color:var(--ink,#182430);background:var(--surface,#fff);border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);}' +
  '.saisie input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:1px;}' +
  '.limites{font-size:0.82rem;color:var(--ink-soft,#51626f);margin:0 0 8px;}' +
  '.exemples .btn{min-width:0;font-size:0.85rem;letter-spacing:0.5px;}' +
  '.effectifs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px;}' +
  '.eff{display:inline-flex;align-items:center;gap:6px;padding:2px 8px 2px 2px;border:1px solid var(--line,#ccd8e0);border-radius:14px;' +
  'background:var(--surface,#fff);font-size:0.88rem;font-variant-numeric:tabular-nums;}' +
  '.formule{overflow-x:auto;overflow-y:hidden;padding:2px 0;}' +
  '.message{color:var(--ink-soft,#51626f);}' +
  '.zone{position:relative;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start;margin:0 0 10px;padding:8px;' +
  'background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);min-height:52px;}' +
  '.cadre{display:flex;flex-wrap:wrap;gap:4px;padding:4px;border:1.5px dashed var(--line,#ccd8e0);border-radius:6px;}' +
  '.tuile{display:inline-flex;gap:2px;padding:3px;border-radius:5px;background:var(--surface,#fff);border:1px solid var(--line,#ccd8e0);' +
  'position:relative;}' +
  '.tuile.depart{border:2px solid var(--ink,#182430);padding:2px;}' +
  '.tuile.retire{opacity:0.35;}' +
  '.tuile.retire::after{content:"";position:absolute;left:2px;right:2px;top:50%;border-top:2px solid var(--bad,#b23a3a);}' +
  '.badge{position:absolute;top:-8px;right:-8px;min-width:22px;height:18px;padding:0 4px;border-radius:9px;font-size:0.72rem;font-weight:700;' +
  'line-height:18px;text-align:center;background:var(--ink,#182430);color:var(--surface,#fff);font-variant-numeric:tabular-nums;}' +
  '.puce{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:24px;padding:0 2px;border-radius:3px;font-weight:700;' +
  'font-size:0.88rem;color:var(--surface,#fff);}' +
  '.puce sub{font-size:0.66rem;font-weight:600;vertical-align:baseline;position:relative;top:3px;}' +
  '.c-accent{background:var(--accent,#b65c1f);}.c-sky{background:var(--sky,#2f6fb0);}.c-good{background:var(--good,#2f7a4f);}' +
  '.c-plan{background:var(--plan,#5b4ea3);}.c-rose{background:var(--rose,#b23a7a);}.c-tip{background:var(--tip,#8a7200);}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:0.82rem;color:var(--ink-soft,#51626f);margin:0 0 8px;}' +
  '.legende span{display:inline-flex;align-items:center;gap:6px;}' +
  '.legende i{display:inline-block;width:16px;height:12px;border-radius:2px;border:2px solid var(--ink,#182430);background:var(--surface,#fff);}' +
  '.legende i.l-retire{border:1px solid var(--line,#ccd8e0);opacity:0.6;background:linear-gradient(transparent 45%,var(--bad,#b23a3a) 45%,var(--bad,#b23a3a) 60%,transparent 60%);}' +
  '.fantome{position:absolute;pointer-events:none;margin:0;z-index:2;}' +
  '.interrupteurs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:6px;margin:0 0 10px;}' +
  '.interrupteurs .btn{width:100%;}' +
  '.total{font-weight:700;margin:0 0 8px;}' +
  '</style>' +
  '<div class="saisie"><label for="mot">Ton mot</label>' +
  '<input type="text" id="mot" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="limites"></div>' +
  '<p class="limites" id="limites">Calcul jusqu’à ' + N_CALCUL + ' lettres ; liste des mots jusqu’à ' + MAX_TUILES +
  ' mots ; lettres discernables jusqu’à ' + N_DISCERNABLES + ' lettres. Les accents sont retirés, seules les lettres comptent.</p>' +
  '<div class="rangee exemples" role="group" aria-label="Exemples">' +
  EXEMPLES.map(function (m) { return '<button class="btn" data-mot="' + m + '">' + m + '</button>' }).join('') +
  '</div>' +
  '<div class="panneau" id="calcul" aria-live="polite"></div>' +
  '<div class="interrupteurs">' +
  '<button class="btn" id="discernables" aria-pressed="true"></button>' +
  '<button class="btn" id="retirer" aria-pressed="false">Retirer le mot de départ</button>' +
  '</div>' +
  '<p class="total" id="total"></p>' +
  '<div class="legende" id="legende"></div>' +
  '<div class="zone" id="zone"></div>' +
  '<div class="panneau" id="explication"></div>'

class AnagrammesFusionWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._brut = 'PAPA'
    this._discernables = true
    this._retirer = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var champ = sh.getElementById('mot')
    champ.value = this._brut
    // Aucune transformation pendant la frappe : la saisie est seulement LUE.
    champ.addEventListener('input', function () { self._brut = champ.value; self._rendre(null) })
    sh.querySelectorAll('.exemples .btn').forEach(function (b) {
      b.addEventListener('click', function () {
        self._brut = b.getAttribute('data-mot')
        champ.value = self._brut
        self._rendre(null)
      })
    })
    sh.getElementById('discernables').addEventListener('click', function () {
      var a = self._analyse()
      if (a.lettres.length > N_DISCERNABLES) return
      var avant = self._positions()
      var zone = sh.getElementById('zone')
      if (self._discernables) zone.style.minHeight = zone.getBoundingClientRect().height + 'px'
      self._discernables = !self._discernables
      self._rendre(avant)
    })
    sh.getElementById('retirer').addEventListener('click', function () { self._retirer = !self._retirer; self._rendre(null) })
    this._rendre(null)
  }

  _analyse() { return analyser(this._brut) }

  _positions() {
    var zone = this._sh.getElementById('zone'), zr = zone.getBoundingClientRect(), pos = []
    zone.querySelectorAll('.tuile').forEach(function (t) {
      var r = t.getBoundingClientRect()
      pos.push({ cle: t.getAttribute('data-cle'), groupe: t.getAttribute('data-groupe'), x: r.left - zr.left, y: r.top - zr.top, el: t })
    })
    return pos
  }

  _tuile(a, perm, discernables, cle, groupe, classes, badge) {
    var n = perm.length, h = '', etiq = []
    // Rang de chaque position parmi les lettres identiques du mot de départ (indice P₁, P₂…).
    var rang = [], vus = {}
    for (var i = 0; i < n; i++) { var c = a.lettres[i]; vus[c] = (vus[c] || 0) + 1; rang.push(vus[c]) }
    perm.forEach(function (pos) {
      var c = a.lettres[pos], t = a.types.indexOf(c)
      var sub = discernables && a.effectifs[c] > 1 ? '<sub>' + indice(rang[pos]) + '</sub>' : ''
      h += '<span class="puce c-' + COULEURS[t % COULEURS.length] + '">' + c + sub + '</span>'
      etiq.push(c + (sub ? ' ' + rang[pos] : ''))
    })
    if (badge) h += '<span class="badge" title="permutations fusionnées">×' + badge + '</span>'
    return '<span class="tuile' + (classes ? ' ' + classes : '') + '" data-cle="' + cle + '" data-groupe="' + groupe + '" aria-label="' +
      etiq.join(' ') + '">' + h + '</span>'
  }

  _rendre(avant) {
    var sh = this._sh, a = this._analyse(), n = a.lettres.length, self = this
    var calcul = sh.getElementById('calcul'), zone = sh.getElementById('zone')
    var bDisc = sh.getElementById('discernables'), bRet = sh.getElementById('retirer')
    sh.querySelectorAll('.exemples .btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(a.lettres.join('') === b.getAttribute('data-mot')))
    })
    var note = a.ignores.length
      ? '<p class="message">Ignoré' + (a.ignores.length > 1 ? 's' : '') + ' (pas des lettres) : ' +
        a.ignores.map(function (c) { return '« ' + echapper(c) + ' »' }).join(', ') + '.</p>'
      : ''
    var vider = function (msgCalcul) {
      calcul.innerHTML = msgCalcul + note
      zone.innerHTML = ''
      zone.style.display = 'none'
      sh.getElementById('total').textContent = ''
      sh.getElementById('legende').innerHTML = ''
      sh.getElementById('explication').style.display = 'none'
      bDisc.disabled = true
      bRet.disabled = true
      bDisc.textContent = 'Lettres identiques : discernables'
    }
    if (n === 0) { vider('<p class="message">Tape un mot dans le champ (des lettres de A à Z).</p>'); return }
    if (n > N_CALCUL) {
      vider('<p class="message">Ce mot a ' + n + ' lettres : le calcul est fait jusqu’à ' + N_CALCUL + ' lettres. Raccourcis-le.</p>')
      return
    }

    // ---------- Calcul ----------
    var nb = factB(n), denom = 1n, facteurs = [], valeurs = []
    a.types.forEach(function (c) {
      var k = a.effectifs[c], f = factB(k)
      denom *= f
      facteurs.push(k + '!')
      if (k > 1) valeurs.push(texMilliers(f))
    })
    var res = nb / denom, motDepart = a.lettres.join('')
    var eff = a.types.map(function (c, t) {
      return '<span class="eff"><span class="puce c-' + COULEURS[t % COULEURS.length] + '">' + c + '</span>' +
        a.effectifs[c] + ' fois</span>'
    }).join('')
    var membres = ['\\dfrac{' + n + '!}{' + facteurs.join('\\times ') + '}']
    if (valeurs.length === 0) membres.push(n + '!')
    else membres.push('\\dfrac{' + texMilliers(nb) + '}{' + valeurs.join('\\times ') + '}')
    membres.push(texMilliers(res))
    var h = '<p><strong>' + motDepart + '</strong> : ' + n + (n > 1 ? ' lettres' : ' lettre') + ', ' + a.types.length +
      (a.types.length > 1 ? ' lettres différentes.' : ' lettre différente.') + '</p>' +
      '<div class="effectifs">' + eff + '</div>' +
      '<p class="formule">' + texEgalites(membres) + '</p>' +
      '<p>' + milliers(res) + (res > 1n ? ' mots différents' : ' seul mot') + ' (permutations distinctes des lettres). '
    if (res > 1n) {
      h += 'Anagrammes, c’est-à-dire mots <strong>différents</strong> du mot de départ : ' +
        tex(texMilliers(res) + '-1=' + texMilliers(res - 1n)) + '.</p>'
    } else {
      h += 'Toutes les lettres sont pareilles : la seule permutation redonne ' + motDepart + ', il n’y a <strong>aucune</strong> anagramme.</p>'
    }
    if (valeurs.length === 0 && n > 1) {
      h += '<p>Aucune lettre répétée : chaque dénominateur vaut ' + tex('1!=1') + ', on retrouve la permutation simple ' + tex(n + '!') + '.</p>'
    }
    calcul.innerHTML = h + note

    // ---------- Liste ----------
    var k = Number(denom) // permutations par mot (n₁! × n₂! × …)
    var discPossible = n <= N_DISCERNABLES
    var disc = this._discernables && discPossible
    var nbTuiles = disc ? Number(nb) : Number(res)
    bRet.disabled = res <= 1n
    bRet.setAttribute('aria-pressed', String(this._retirer && res > 1n))
    bDisc.disabled = !discPossible || k === 1
    bDisc.setAttribute('aria-pressed', String(disc))
    bDisc.textContent = disc ? 'Lettres identiques : discernables' : 'Lettres identiques : indiscernables'
    var expl = sh.getElementById('explication')
    expl.style.display = ''
    if (nbTuiles > MAX_TUILES) {
      zone.innerHTML = ''
      zone.style.display = 'none'
      sh.getElementById('legende').innerHTML = ''
      sh.getElementById('total').textContent = ''
      expl.innerHTML = '<p>' + milliers(res) + ' mots : trop pour les dessiner (liste jusqu’à ' + MAX_TUILES + ' mots). ' +
        'Essaie un mot plus court, comme PAPA ou RADAR, pour voir les permutations fusionner.</p>'
      return
    }
    zone.style.display = ''
    var perms = permutations(n), groupes = [], index = {}
    perms.forEach(function (p) {
      var mot = p.map(function (i) { return a.lettres[i] }).join('')
      if (index[mot] === undefined) { index[mot] = groupes.length; groupes.push({ mot: mot, perms: [] }) }
      groupes[index[mot]].perms.push(p)
    })
    var retirer = this._retirer && res > 1n
    var html = ''
    groupes.forEach(function (g, gi) {
      var cls = gi === 0 ? 'depart' + (retirer ? ' retire' : '') : ''
      if (disc) {
        var tuiles = g.perms.map(function (p, j) { return self._tuile(a, p, true, g.mot + '|' + j, g.mot, cls, 0) }).join('')
        html += k > 1 ? '<span class="cadre">' + tuiles + '</span>' : tuiles
      } else {
        html += self._tuile(a, g.perms[0], false, g.mot, g.mot, cls, k > 1 ? k : 0)
      }
    })
    zone.innerHTML = html
    var compte = groupes.length - (retirer ? 1 : 0)
    sh.getElementById('legende').innerHTML = '<span><i></i>mot de départ</span>' + (retirer ? '<span><i class="l-retire"></i>retiré du compte</span>' : '')
    var tot
    if (disc) {
      tot = milliers(nb) + ' permutations des ' + n + ' lettres discernables' +
        (k > 1 ? ', rangées en ' + groupes.length + (groupes.length > 1 ? ' cadres' : ' cadre') + ' de ' + k : '') + '.'
    } else {
      tot = compte + (compte > 1 ? ' mots' : ' mot') + (retirer ? ' différents du mot de départ (anagrammes).' : (compte > 1 ? ' différents.' : '.'))
    }
    sh.getElementById('total').textContent = tot

    // ---------- Explication ----------
    var prodTex = a.types.filter(function (c) { return a.effectifs[c] > 1 }).map(function (c) { return a.effectifs[c] + '!' }).join('\\times ')
    var repetees = a.types.filter(function (c) { return a.effectifs[c] > 1 })
    var e
    if (k === 1) {
      e = '<p>Toutes les lettres sont différentes : chaque permutation donne un mot nouveau, rien ne fusionne. ' +
        tex(n + '!=' + texMilliers(nb)) + ' mots.</p>'
    } else if (disc) {
      var ex = repetees[0]
      e = '<p>Les lettres identiques portent un indice (' + ex + indice(1) + ', ' + ex + indice(2) + '…) : on peut les distinguer. ' +
        'Chaque cadre regroupe les permutations qui ne diffèrent que par l’ordre des lettres identiques : il en contient ' +
        tex(prodTex + '=' + k) + '. ' +
        'Rends les lettres indiscernables : chaque cadre fusionne en un seul mot.</p>'
    } else {
      e = '<p>Chaque mot remplace ' + tex(prodTex + '=' + k) + ' permutations (badge ' + tex('\\times ' + k) + ') : échanger des lettres identiques ne crée aucun mot nouveau. ' +
        'Tous les cadres ont la même taille, d’où la division : ' +
        tex('\\dfrac{' + n + '!}{' + prodTex + '}=\\dfrac{' + texMilliers(nb) + '}{' + k + '}=' + texMilliers(res)) + '.</p>'
      if (!discPossible) e += '<p>Avec ' + n + ' lettres, les ' + milliers(nb) + ' permutations discernables seraient trop nombreuses à dessiner.</p>'
    }
    if (res > 1n) {
      e += retirer
        ? '<p>Le mot de départ est barré : il reste ' + tex(texMilliers(res) + '-1=' + texMilliers(res - 1n)) + (res - 1n > 1n ? ' anagrammes.' : ' anagramme.') + '</p>'
        : '<p>Le mot encadré est le mot de départ ' + motDepart + ' : il fait partie des ' + milliers(res) + ' mots, mais ce n’est pas une anagramme de lui-même.</p>'
    }
    expl.innerHTML = e

    if (avant && avant.length) this._animer(avant, disc)
  }

  _animer(avant, versDiscernables) {
    var zone = this._sh.getElementById('zone')
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduit || !Element.prototype.animate) { zone.style.minHeight = ''; return }
    var apres = this._positions(), duree = 650
    window.clearTimeout(this._finFusion)
    this._finFusion = window.setTimeout(function () { zone.style.minHeight = '' }, duree + 50)
    var parGroupe = function (liste) {
      var m = {}
      liste.forEach(function (p) { (m[p.groupe] = m[p.groupe] || []).push(p) })
      return m
    }
    var A = parGroupe(avant), B = parGroupe(apres)
    Object.keys(B).forEach(function (g) {
      if (!A[g]) return
      if (!versDiscernables) {
        // Fusion : les permutations d'un cadre filent vers la tuile unique.
        var cible = B[g][0], dep = A[g][0]
        cible.el.animate([{ transform: 'translate(' + (dep.x - cible.x) + 'px,' + (dep.y - cible.y) + 'px)' }, { transform: 'none' }],
          { duration: duree, easing: 'ease-in-out' })
        A[g].slice(1).forEach(function (s) {
          var f = s.el.cloneNode(true)
          f.classList.add('fantome')
          f.style.left = s.x + 'px'
          f.style.top = s.y + 'px'
          zone.appendChild(f)
          var anim = f.animate([
            { transform: 'none', opacity: 1 },
            { transform: 'translate(' + (cible.x - s.x) + 'px,' + (cible.y - s.y) + 'px)', opacity: 0 },
          ], { duration: duree, easing: 'ease-in-out' })
          anim.onfinish = function () { f.remove() }
        })
      } else {
        // Séparation : les permutations sortent de la tuile fusionnée.
        var src = A[g][0]
        B[g].forEach(function (b, j) {
          b.el.animate([
            { transform: 'translate(' + (src.x - b.x) + 'px,' + (src.y - b.y) + 'px)', opacity: j === 0 ? 1 : 0.2 },
            { transform: 'none', opacity: 1 },
          ], { duration: duree, easing: 'ease-in-out' })
        })
      }
    })
  }
}

if (!customElements.get('anagrammes-fusion-widget')) customElements.define('anagrammes-fusion-widget', AnagrammesFusionWidget)
