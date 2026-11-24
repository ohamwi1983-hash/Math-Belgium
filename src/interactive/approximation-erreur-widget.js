/* ================================================================
 * <approximation-erreur-widget> — atelier « Approximation affine : l'erreur
 * et h » (5e, ch. 5, § 2 ; lien avec 5gen68). Trois fonctions du cours
 * (√x en 4, x⁵ en 1, 1/x en 1). Un curseur h déplace le point d'abscisse
 * a + h : la courbe, la tangente en a, et le segment rouge entre f(a + h)
 * et f(a) + f′(a)·h (l'erreur commise). Panneau KaTeX : valeur exacte,
 * approximation, erreur, erreur ÷ h². Tableau fixe pour h de plus en plus
 * petit : l'erreur ÷ h² se stabilise — l'erreur est à peu près
 * proportionnelle à h². Fenêtre FIXE par fonction (jamais recalculée
 * depuis le curseur). Figure seule dans son conteneur (épinglage).
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre, svgEl } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, point, texte, curseur, choix, texPetit } from './limites-commun.js'

var FONCTIONS = {
  racine: {
    bouton: '\\sqrt{x}', nom: 'f(x)=\\sqrt{x}', a: 4, f: function (x) { return Math.sqrt(Math.max(0, x)) }, fa: 2, fpa: 0.25,
    texFa: '2', texFpa: '\\tfrac{1}{4}', hMin: -3, hMax: 3, pas: 0.1, h0: 3,
    vue: { x0: 0, x1: 7.6, y0: -0.3, y1: 3.2, gx: [1, 2, 3, 4, 5, 6, 7], gy: [1, 2, 3] },
    table: [2, 1, 0.5, 0.1, 0.01],
  },
  puissance: {
    bouton: 'x^5', nom: 'f(x)=x^5', a: 1, f: function (x) { return Math.pow(x, 5) }, fa: 1, fpa: 5,
    texFa: '1', texFpa: '5', hMin: -0.4, hMax: 0.4, pas: 0.02, h0: 0.2,
    vue: { x0: 0.45, x1: 1.5, y0: -0.6, y1: 6, gx: [0.6, 0.8, 1, 1.2, 1.4], gy: [1, 2, 3, 4, 5] },
    table: [0.4, 0.2, 0.1, 0.02, 0.01],
  },
  inverse: {
    bouton: '\\tfrac{1}{x}', nom: 'f(x)=\\dfrac{1}{x}', a: 1, f: function (x) { return 1 / x }, fa: 1, fpa: -1,
    texFa: '1', texFpa: '-1', hMin: -0.5, hMax: 0.5, pas: 0.02, h0: 0.2,
    vue: { x0: 0.35, x1: 1.65, y0: -0.3, y1: 2.4, gx: [0.5, 1, 1.5], gy: [1, 2] },
    table: [0.5, 0.2, 0.1, 0.02, 0.01],
  },
}

/** Nombre à 3 chiffres significatifs, pour KaTeX. */
function texSig(v) {
  if (v === 0) return '0'
  var e = Math.floor(Math.log10(Math.abs(v)))
  var dec = Math.max(0, 2 - e)
  return texNombre(v, Math.min(dec, 6))
}

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES +
  '.erreur{stroke:var(--bad,#b23a3a);stroke-width:3.4;stroke-linecap:round;}' +
  '.pt-tan{fill:var(--sky,#2f6fb0);stroke:var(--surface,#fff);stroke-width:1.5;}' +
  '.etiq-tan{fill:var(--sky,#2f6fb0);}' +
  'table.tab td.courant{background:var(--accent-soft,#f4e3d1);font-weight:700;}' +
  '</style>' +
  '<div id="c-f"></div>' +
  '<div class="legende"><span><i></i>courbe de f</span><span><i class="l2"></i>tangente en a</span>' +
  '<span><i class="lko"></i>erreur commise</span></div>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe, tangente et erreur de l’approximation affine"></svg></div>' +
  '<div id="reg"></div>' +
  '<div class="panneau" id="pan"></div>' +
  '<div class="tab-zone" id="tab"></div>' +
  '<div class="panneau" id="conclusion"></div>'

class ApproximationErreurWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._cle = 'racine'
    this._h = FONCTIONS.racine.h0
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    choix(sh.getElementById('c-f'), Object.keys(FONCTIONS).map(function (k) {
      var F = FONCTIONS[k]
      return { id: k, html: tex(F.bouton) + ' en ' + tex('a=' + F.a) }
    }), this._cle, function (id) { self._choisir(id) }, 'Fonction')
    this._construireCurseur()
    this._rendre()
  }

  _construireCurseur() {
    var self = this, F = FONCTIONS[this._cle], zone = this._sh.getElementById('reg')
    zone.innerHTML = ''
    this._curseur = curseur(zone, {
      min: F.hMin, max: F.hMax, pas: F.pas, valeur: this._h, aria: 'Écart h', largeurNom: '86px',
      nom: function (v) { return tex('h=' + texNombre(v, 2)) },
      changer: function (v) { self._h = v; self._rendre() },
    })
  }

  _choisir(cle) {
    this._cle = cle
    this._h = FONCTIONS[cle].h0
    this._construireCurseur()
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, F = FONCTIONS[this._cle], h = this._h, a = F.a, v = F.vue
    var t = function (x) { return F.fa + F.fpa * (x - a) }
    var R = repere(sh.getElementById('svg'), { x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y1, gx: v.gx, gy: v.gy })
    courbe(R, F.f, Math.max(v.x0, 0.02), v.x1, 'courbe')
    courbe(R, t, v.x0, v.x1, 'courbe-2')
    var x = a + h, yf = F.f(x), yt = t(x)
    R.zone.appendChild(svgEl('line', { x1: R.px(x), x2: R.px(x), y1: R.py(yf), y2: R.py(yt), class: 'erreur' }))
    point(R, a, F.fa, 'pt', 5)
    texte(R.svg, R.px(a) - 6, R.py(F.fa) - 8, 'A', 'etiq', 'end')
    if (Math.abs(h) > 1e-9) {
      point(R, x, yf, 'pt', 4.5)
      point(R, x, yt, 'pt-tan', 4.5)
    }

    var err = Math.abs(yf - yt)
    var lignes = '<p>' + tex(F.nom) + ', ' + tex('a=' + a) + ' : ' + tex('f(a)=' + F.texFa) + ' et ' + tex("f'(a)=" + F.texFpa) + '.</p>'
    if (Math.abs(h) < 1e-9) {
      lignes += '<p>Pour ' + tex('h=0') + ', on est au point de contact : aucune erreur. Fais glisser ' + tex('h') + '.</p>'
    } else {
      lignes +=
        '<p>Valeur exacte : ' + tex('f(a+h)=f(' + texNombre(x, 2) + ')\\approx ' + texNombre(yf, 5)) + '</p>' +
        '<p>Approximation : ' + tex("f(a)+f'(a)\\,h=" + texNombre(yt, 5)) + '</p>' +
        '<p><span class="ko">Erreur commise</span> : ' + tex('\\approx ' + texPetit(err)) + ' ; ' +
        tex('\\dfrac{\\text{erreur}}{h^2}\\approx ' + texSig(err / (h * h))) + '</p>'
    }
    sh.getElementById('pan').innerHTML = lignes

    var hCourant = Math.abs(h)
    var corps = F.table.map(function (hh) {
      var e = Math.abs(F.f(a + hh) - t(a + hh))
      var cl = Math.abs(hh - hCourant) < 1e-9 ? ' class="courant"' : ''
      return '<tr><td' + cl + '>' + tex(texNombre(hh, 2)) + '</td><td' + cl + '>' + tex(texPetit(e)) + '</td><td' + cl + '>' + tex(texSig(e / (hh * hh))) + '</td></tr>'
    }).join('')
    sh.getElementById('tab').innerHTML =
      '<table class="tab"><thead><tr><th>' + tex('h') + '</th><th>erreur</th><th>' + tex('\\dfrac{\\text{erreur}}{h^2}') + '</th></tr></thead><tbody>' + corps + '</tbody></table>'
    var dernier = F.table[F.table.length - 1]
    var limite = Math.abs(F.f(a + dernier) - t(a + dernier)) / (dernier * dernier)
    sh.getElementById('conclusion').innerHTML =
      '<p>Quand ' + tex('h') + ' se rapproche de 0, ' + tex('\\dfrac{\\text{erreur}}{h^2}') + ' se stabilise (vers ' +
      tex('\\approx ' + texSig(limite)) + ') : l’erreur est à peu près proportionnelle à ' + tex('h^2') +
      '. Diviser ' + tex('h') + ' par 10 divise l’erreur par environ 100 : l’approximation est excellente pour ' + tex('h') + ' petit.</p>'
  }
}

if (!customElements.get('approximation-erreur-widget')) customElements.define('approximation-erreur-widget', ApproximationErreurWidget)
