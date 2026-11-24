/* ================================================================
 * <etude-complete-widget> — atelier « Construis l'étude complète » (5e,
 * ch. 5, § 7). Les deux fonctions étudiées dans le cours :
 * x³ − 3x² + 4 et (x − 1) + 4/(x − 1). Sept étapes, dans l'ordre du
 * cours : domaine, limites et asymptotes, f′ et son signe, variations et
 * extremums, f″ et concavité, points remarquables, courbe. À chaque étape,
 * une question ; « Montrer » révèle la réponse, complète le tableau
 * (lignes x, f′, variations, f″, concavité) et ajoute à la figure ce que
 * l'étape apporte (valeur exclue, asymptotes, tangentes horizontales,
 * points, courbe, morceau par morceau). Fenêtre FIXE par fonction. Figure
 * seule dans son conteneur (épinglage). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, svgEl } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, verticale, droite, point, texte, choix } from './limites-commun.js'

var CUBIQUE = {
  bouton: 'x^3-3x^2+4', nom: 'f(x)=x^3-3x^2+4', f: function (x) { return x * x * x - 3 * x * x + 4 },
  vue: { x0: -1.8, x1: 3.6, y0: -2.5, y1: 6.5, gx: [-1, 1, 2, 3], gy: [-2, 2, 4, 6] },
  colonnes: ['-\\infty', '', '0', '', '1', '', '2', '', '+\\infty'],
  lignes: {
    fp: ['', '+', '0', '-', '', '-', '0', '+', ''],
    var: ['', '\\nearrow', '4', '\\searrow', '', '\\searrow', '0', '\\nearrow', ''],
    fpp: ['', '-', '', '-', '0', '+', '', '+', ''],
    conc: ['', '\\cap', '', '\\cap', '\\text{PI}', '\\cup', '', '\\cup', ''],
  },
  etapes: [
    { titre: 'Domaine', question: 'Quelles valeurs de x sont interdites ?', reponse: tex('\\text{dom}\\,f=\\mathbb{R}') + ' : un polynôme est défini partout.' },
    { titre: 'Limites et asymptotes', question: 'Que devient f(x) en −∞ et en +∞ ? Y a-t-il des asymptotes ?',
      reponse: tex('\\lim\\limits_{x\\to-\\infty}f(x)=-\\infty') + ' et ' + tex('\\lim\\limits_{x\\to+\\infty}f(x)=+\\infty') + ' (terme dominant ' + tex('x^3') + ') : aucune asymptote.' },
    { titre: 'Dérivée et signe', question: 'Calcule f′(x) et étudie son signe.', reponse: tex("f'(x)=3x^2-6x=3x(x-2)") + ' : positive, nulle en 0, négative, nulle en 2, positive.', ligne: 'fp' },
    { titre: 'Variations et extremums', question: 'Où f croît-elle, où décroît-elle ? Quels extremums ?', reponse: 'Maximum local ' + tex('(0\\,;4)') + ', minimum local ' + tex('(2\\,;0)') + ' : f′ y change de signe.', ligne: 'var' },
    { titre: 'Dérivée seconde et concavité', question: 'Calcule f″(x) : où la courbe est-elle convexe, concave ?', reponse: tex("f''(x)=6x-6") + ' : concave avant 1, convexe après ; point d’inflexion ' + tex('(1\\,;2)') + '.', ligne: 'fpp' },
    { titre: 'Points remarquables', question: 'Où la courbe coupe-t-elle les axes ?', reponse: tex('f(x)=(x+1)(x-2)^2') + ' : elle coupe l’axe en ' + tex('-1') + ', le touche en 2 (racine double) ; ' + tex('f(0)=4') + '.' },
    { titre: 'Courbe', question: 'Trace l’allure de la courbe avec tout ce qui précède.', reponse: 'Croissante jusqu’à ' + tex('(0\\,;4)') + ', décroissante jusqu’à ' + tex('(2\\,;0)') + ', puis croissante ; inflexion en ' + tex('(1\\,;2)') + '.' },
  ],
  dessiner: function (R, n) {
    if (n >= 4) {
      droite0(R, 0, 4); droite0(R, 2, 0)
      point(R, 0, 4, 'pt-ok', 5); point(R, 2, 0, 'pt-ko', 5)
      texte(R.svg, R.px(0) + 6, R.py(4) - 8, 'max (0 ; 4)', 'etiq etiq-ok', 'start')
      texte(R.svg, R.px(2) + 8, R.py(0) + 30, 'min (2 ; 0)', 'etiq etiq-ko', 'start')
    }
    if (n >= 5) {
      point(R, 1, 2, 'pt', 5)
      texte(R.svg, R.px(1) + 7, R.py(2) - 6, 'PI (1 ; 2)', 'etiq etiq-acc', 'start')
      texte(R.svg, R.px(-0.8), R.py(5.6), '∩', 'etiq etiq-acc signe-conc', 'middle')
      texte(R.svg, R.px(2.8), R.py(5.6), '∪', 'etiq etiq-acc signe-conc', 'middle')
    }
    if (n >= 6) point(R, -1, 0, 'pt', 4.5)
    if (n >= 7) courbe(R, this.f, R.x0, R.x1, 'courbe')
  },
}

var RATIONNELLE = {
  bouton: '(x-1)+\\dfrac{4}{x-1}', nom: 'f(x)=(x-1)+\\dfrac{4}{x-1}', f: function (x) { return x - 1 + 4 / (x - 1) },
  vue: { x0: -4, x1: 6, y0: -9, y1: 9, gx: [-3, -1, 1, 3, 5], gy: [-8, -4, 4, 8] },
  colonnes: ['-\\infty', '', '-1', '', '1', '', '3', '', '+\\infty'],
  lignes: {
    fp: ['', '+', '0', '-', '\\nexists', '-', '0', '+', ''],
    var: ['', '\\nearrow', '-4', '\\searrow', '\\nexists', '\\searrow', '4', '\\nearrow', ''],
    fpp: ['', '-', '', '-', '\\nexists', '+', '', '+', ''],
    conc: ['', '\\cap', '', '\\cap', '\\nexists', '\\cup', '', '\\cup', ''],
  },
  etapes: [
    { titre: 'Domaine', question: 'Quelle valeur de x est interdite ?', reponse: tex('x-1=0\\iff x=1') + ' : ' + tex('\\text{dom}\\,f=\\mathbb{R}\\setminus\\{1\\}') + ' ; la colonne de 1 portera ' + tex('\\nexists') + '.' },
    { titre: 'Limites et asymptotes', question: 'Que se passe-t-il près de 1, et en ±∞ ?',
      reponse: tex('\\lim\\limits_{x\\to1^-}f(x)=-\\infty') + ', ' + tex('\\lim\\limits_{x\\to1^+}f(x)=+\\infty') + ' : asymptote verticale ' + tex('x=1') + ' ; ' + tex('\\dfrac{4}{x-1}\\to0') + ' en ' + tex('\\pm\\infty') + ' : asymptote oblique ' + tex('y=x-1') + '.' },
    { titre: 'Dérivée et signe', question: 'Calcule f′(x) et étudie son signe.', reponse: tex("f'(x)=1-\\dfrac{4}{(x-1)^2}=\\dfrac{(x+1)(x-3)}{(x-1)^2}") + ' : nulle en ' + tex('-1') + ' et en 3, ' + tex('\\nexists') + ' en 1.', ligne: 'fp' },
    { titre: 'Variations et extremums', question: 'Quels extremums ? (La flèche n’enjambe jamais 1.)', reponse: 'Maximum local ' + tex('(-1\\,;-4)') + ', minimum local ' + tex('(3\\,;4)') + ' : le maximum est plus bas que le minimum !', ligne: 'var' },
    { titre: 'Dérivée seconde et concavité', question: 'Calcule f″(x) : où la courbe est-elle convexe, concave ?', reponse: tex("f''(x)=\\dfrac{8}{(x-1)^3}") + ' : concave avant 1, convexe après, mais <strong>pas de point d’inflexion</strong> : 1 est exclu.', ligne: 'fpp' },
    { titre: 'Points remarquables', question: 'Où la courbe coupe-t-elle les axes ?', reponse: tex('f(0)=-1-4=-5') + ' ; ' + tex('f(x)=0\\iff(x-1)^2=-4') + ' : impossible, la courbe ne coupe pas l’axe des abscisses.' },
    { titre: 'Courbe', question: 'Trace l’allure de la courbe, morceau par morceau.', reponse: 'Deux morceaux, de part et d’autre de ' + tex('x=1') + ', qui se resserrent contre les deux asymptotes.' },
  ],
  dessiner: function (R, n) {
    if (n >= 1) verticale(R, 1, 'courbe-faible')
    if (n >= 2) { verticale(R, 1, 'asym'); droite(R, 1, -1, 'asym'); texte(R.svg, R.px(5.6), R.py(4.6) - 10, 'y = x − 1', 'etiq etiq-plan', 'end'); texte(R.svg, R.px(1) + 4, R.py(8.6), 'x = 1', 'etiq etiq-plan', 'start') }
    if (n >= 4) {
      droite0(R, -1, -4); droite0(R, 3, 4)
      point(R, -1, -4, 'pt-ok', 5); point(R, 3, 4, 'pt-ko', 5)
      texte(R.svg, R.px(-1), R.py(-4) + 18, 'max (−1 ; −4)', 'etiq etiq-ok', 'middle')
      texte(R.svg, R.px(3), R.py(4) - 9, 'min (3 ; 4)', 'etiq etiq-ko', 'middle')
    }
    if (n >= 5) { texte(R.svg, R.px(-3), R.py(6), '∩', 'etiq etiq-acc signe-conc', 'middle'); texte(R.svg, R.px(4.8), R.py(-6), '∪', 'etiq etiq-acc signe-conc', 'middle') }
    if (n >= 6) point(R, 0, -5, 'pt', 4.5)
    if (n >= 7) courbe(R, this.f, R.x0, R.x1, 'courbe', [1])
  },
}
var FONCTIONS = { cubique: CUBIQUE, rationnelle: RATIONNELLE }

/** Petite tangente horizontale en (a ; b). */
function droite0(R, a, b) {
  R.zone.appendChild(svgEl('line', { x1: R.px(a - 0.45), x2: R.px(a + 0.45), y1: R.py(b), y2: R.py(b), class: 'courbe-ok' }))
}

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES +
  'table.tab td.lab{font-weight:600;text-align:left;}' +
  'table.tab td{min-width:26px;}' +
  '.q{font-weight:600;}' +
  '.etapes{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:0 0 8px;font-size:0.72rem;}' +
  '.signe-conc{font-size:18px;font-weight:700;}' +
  '.etapes span{padding:2px 7px;border-radius:999px;background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);}' +
  '.etapes span.fait{background:var(--good,#2f7a4f);border-color:var(--good,#2f7a4f);color:var(--surface,#fff);}' +
  '.etapes span.courante{border-color:var(--accent,#b65c1f);font-weight:700;}' +
  '</style>' +
  '<div id="c-f"></div>' +
  '<p class="formule" id="nom"></p>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Figure de l’étude, complétée étape par étape"></svg></div>' +
  '<div class="etapes" id="puces"></div>' +
  '<div class="panneau" id="pan"></div>' +
  '<div class="rangee"><button class="btn" id="prec" type="button">‹ Étape précédente</button>' +
  '<button class="btn" id="montrer" type="button">Montrer la réponse</button>' +
  '<button class="btn" id="suiv" type="button">Étape suivante ›</button></div>' +
  '<div class="tab-zone" id="tab"></div>'

class EtudeCompleteWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._cle = 'cubique'
    this._etape = 0 // étape en cours (0 à 6)
    this._faites = 0 // nombre d'étapes révélées
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    choix(sh.getElementById('c-f'), [
      { id: 'cubique', html: tex(CUBIQUE.bouton) }, { id: 'rationnelle', html: tex(RATIONNELLE.bouton) },
    ], this._cle, function (id) { self._cle = id; self._etape = 0; self._faites = 0; self._rendre() }, 'Fonction étudiée')
    sh.getElementById('montrer').addEventListener('click', function () { self._faites = Math.max(self._faites, self._etape + 1); self._rendre() })
    sh.getElementById('suiv').addEventListener('click', function () { if (self._etape < 6) self._etape++; self._rendre() })
    sh.getElementById('prec').addEventListener('click', function () { if (self._etape > 0) self._etape--; self._rendre() })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, F = FONCTIONS[this._cle], v = F.vue, n = this._faites, e = this._etape
    sh.getElementById('nom').innerHTML = tex(F.nom)
    var R = repere(sh.getElementById('svg'), { x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y1, gx: v.gx, gy: v.gy })
    F.dessiner(R, n)

    sh.getElementById('puces').innerHTML = F.etapes.map(function (et, i) {
      return '<span class="' + (i < n ? 'fait' : '') + (i === e ? ' courante' : '') + '">' + (i + 1) + '. ' + et.titre + '</span>'
    }).join('')
    var et = F.etapes[e]
    sh.getElementById('pan').innerHTML = '<p class="q">' + (e + 1) + '. ' + et.titre + ' — ' + et.question + '</p>' +
      (n > e ? '<p>' + et.reponse + '</p>' : '<p>Réfléchis, puis clique « Montrer la réponse ».</p>')
    sh.getElementById('montrer').disabled = n > e
    sh.getElementById('prec').disabled = e === 0
    sh.getElementById('suiv').disabled = e === 6 || n <= e

    var lignes = [['x', null]]
    if (n >= 3) lignes.push(["f'(x)", 'fp'])
    if (n >= 4) lignes.push(['f', 'var'])
    if (n >= 5) { lignes.push(["f''(x)", 'fpp']); lignes.push(['\\text{concavité}', 'conc']) }
    var html = '<table class="tab"><tbody>'
    lignes.forEach(function (l) {
      var cellules = l[1] ? F.lignes[l[1]] : F.colonnes
      html += '<tr><td class="lab">' + tex(l[0]) + '</td>' + cellules.map(function (c) { return '<td>' + (c ? tex(c) : '') + '</td>' }).join('') + '</tr>'
    })
    sh.getElementById('tab').innerHTML = n >= 1 ? html + '</tbody></table>' : ''
  }
}

if (!customElements.get('etude-complete-widget')) customElements.define('etude-complete-widget', EtudeCompleteWidget)
