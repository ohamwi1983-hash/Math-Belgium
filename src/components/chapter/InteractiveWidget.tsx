import { useEffect, useRef, useState } from 'react'
import type { InteractiveWidgetTag } from '../../content/types'

/** Charge (à la demande, `import()` dynamique) le module qui enregistre le Web Component
 * correspondant — l'ordre interne de chaque module gère lui-même ses propres dépendances
 * (un widget dépendant d'un module partagé doit l'importer avant son propre fichier), voir
 * `src/interactive/register-*.js`. */
const REGISTER: Record<InteractiveWidgetTag, () => Promise<unknown>> = {
  'parabole-widget': () => import('../../interactive/register-parabole-widget.js'),
  'transformations-widget': () => import('../../interactive/register-transformations-widget.js'),
  'archimede-widget': () => import('../../interactive/register-archimede-widget.js'),
  'sinusoide-widget': () => import('../../interactive/register-sinusoide-widget.js'),
  'cercle-trigo-widget': () => import('../../interactive/register-cercle-trigo-widget.js'),
  'exponentielle-widget': () => import('../../interactive/register-exponentielle-widget.js'),
  'tangente-exponentielle-widget': () => import('../../interactive/register-tangente-exponentielle-widget.js'),
  'reciproque-miroir-widget': () => import('../../interactive/register-reciproque-miroir-widget.js'),
  'cyclometrique-miroir-widget': () => import('../../interactive/register-cyclometrique-miroir-widget.js'),
  'cyclometrique-tangente-widget': () => import('../../interactive/register-cyclometrique-tangente-widget.js'),
  'discriminant-racines-widget': () => import('../../interactive/register-discriminant-racines-widget.js'),
  'signe-trinome-widget': () => import('../../interactive/register-signe-trinome-widget.js'),
  'signe-produit-widget': () => import('../../interactive/register-signe-produit-widget.js'),
  'composition-machine-widget': () => import('../../interactive/register-composition-machine-widget.js'),
  'domaine-composee-widget': () => import('../../interactive/register-domaine-composee-widget.js'),
  'parite-derivee-widget': () => import('../../interactive/register-parite-derivee-widget.js'),
  'inequation-exponentielle-widget': () => import('../../interactive/register-inequation-exponentielle-widget.js'),
  'croissance-saturation-widget': () => import('../../interactive/register-croissance-saturation-widget.js'),
  'log-exp-miroir-widget': () => import('../../interactive/register-log-exp-miroir-widget.js'),
  'inequation-logarithmique-widget': () => import('../../interactive/register-inequation-logarithmique-widget.js'),
  'parametres-graphiques-widget': () => import('../../interactive/register-parametres-graphiques-widget.js'),
  'extremums-sinusoide-widget': () => import('../../interactive/register-extremums-sinusoide-widget.js'),
  'modele-sinusoidal-widget': () => import('../../interactive/register-modele-sinusoidal-widget.js'),
  'equation-trig-widget': () => import('../../interactive/register-equation-trig-widget.js'),
  'secteur-segment-widget': () => import('../../interactive/register-secteur-segment-widget.js'),
  'suite-recurrente-affine-widget': () => import('../../interactive/register-suite-recurrente-affine-widget.js'),
  'convergence-suite-widget': () => import('../../interactive/register-convergence-suite-widget.js'),
  'comparaison-suites-widget': () => import('../../interactive/register-comparaison-suites-widget.js'),
  'optimisation-enclos-widget': () => import('../../interactive/register-optimisation-enclos-widget.js'),
  'trois-formes-widget': () => import('../../interactive/register-trois-formes-widget.js'),
  'parabole-par-points-widget': () => import('../../interactive/register-parabole-par-points-widget.js'),
  'differences-secondes-widget': () => import('../../interactive/register-differences-secondes-widget.js'),
  'galilee-trajectoire-widget': () => import('../../interactive/register-galilee-trajectoire-widget.js'),
  'viete-racines-widget': () => import('../../interactive/register-viete-racines-widget.js'),
  'parametre-m-widget': () => import('../../interactive/register-parametre-m-widget.js'),
  'seuil-ballon-widget': () => import('../../interactive/register-seuil-ballon-widget.js'),
  'completer-le-carre-widget': () => import('../../interactive/register-completer-le-carre-widget.js'),
  'simplification-trou-widget': () => import('../../interactive/register-simplification-trou-widget.js'),
  'racine-etrangere-rationnelle-widget': () => import('../../interactive/register-racine-etrangere-rationnelle-widget.js'),
  'fonction-aire-widget': () => import('../../interactive/register-fonction-aire-widget.js'),
  'aire-signee-widget': () => import('../../interactive/register-aire-signee-widget.js'),
  'rectangle-valeur-moyenne-widget': () => import('../../interactive/register-rectangle-valeur-moyenne-widget.js'),
  'solide-revolution-widget': () => import('../../interactive/register-solide-revolution-widget.js'),
  'distance-deplacement-widget': () => import('../../interactive/register-distance-deplacement-widget.js'),
  'longueur-polygonale-widget': () => import('../../interactive/register-longueur-polygonale-widget.js'),
  'ipp-choix-widget': () => import('../../interactive/register-ipp-choix-widget.js'),
  'regle-a-calcul-widget': () => import('../../interactive/register-regle-a-calcul-widget.js'),
  'solution-parasite-log-widget': () => import('../../interactive/register-solution-parasite-log-widget.js'),
  'f-et-fprime-widget': () => import('../../interactive/register-f-et-fprime-widget.js'),
  'echelle-semi-log-widget': () => import('../../interactive/register-echelle-semi-log-widget.js'),
  'croissance-comparee-log-widget': () => import('../../interactive/register-croissance-comparee-log-widget.js'),
  'datation-carbone14-widget': () => import('../../interactive/register-datation-carbone14-widget.js'),
  'chainette-widget': () => import('../../interactive/register-chainette-widget.js'),
  'gauss-double-echelle-widget': () => import('../../interactive/register-gauss-double-echelle-widget.js'),
  'arithmetique-ou-geometrique-widget': () => import('../../interactive/register-arithmetique-ou-geometrique-widget.js'),
  'somme-infinie-zenon-widget': () => import('../../interactive/register-somme-infinie-zenon-widget.js'),
  'echiquier-widget': () => import('../../interactive/register-echiquier-widget.js'),
  'fibonacci-nombre-d-or-widget': () => import('../../interactive/register-fibonacci-nombre-d-or-widget.js'),
  'angle-d-or-widget': () => import('../../interactive/register-angle-d-or-widget.js'),
  'transformation-8-parametres-widget': () => import('../../interactive/register-transformation-8-parametres-widget.js'),
  'familles-parite-widget': () => import('../../interactive/register-familles-parite-widget.js'),
  'pas-a-pas-transformations-widget': () => import('../../interactive/register-pas-a-pas-transformations-widget.js'),
  'lire-courbe-widget': () => import('../../interactive/register-lire-courbe-widget.js'),
  'combien-zeros-widget': () => import('../../interactive/register-combien-zeros-widget.js'),
  'solution-etrangere-widget': () => import('../../interactive/register-solution-etrangere-widget.js'),
  'inverse-monotonie-widget': () => import('../../interactive/register-inverse-monotonie-widget.js'),
  'seuil-cumule-widget': () => import('../../interactive/register-seuil-cumule-widget.js'),
  'choix-classes-widget': () => import('../../interactive/register-choix-classes-widget.js'),
  'deux-courbes-cumulees-widget': () => import('../../interactive/register-deux-courbes-cumulees-widget.js'),
  'frontiere-classe-widget': () => import('../../interactive/register-frontiere-classe-widget.js'),
  'dispersion-comparee-widget': () => import('../../interactive/register-dispersion-comparee-widget.js'),
  'valeur-aberrante-widget': () => import('../../interactive/register-valeur-aberrante-widget.js'),
  'boite-moustaches-vivante-widget': () => import('../../interactive/register-boite-moustaches-vivante-widget.js'),
  'tchebychev-garantie-widget': () => import('../../interactive/register-tchebychev-garantie-widget.js'),
  'point-vide-ou-asymptote-widget': () => import('../../interactive/register-point-vide-ou-asymptote-widget.js'),
  'degre-asymptote-widget': () => import('../../interactive/register-degre-asymptote-widget.js'),
  'plancher-plafond-widget': () => import('../../interactive/register-plancher-plafond-widget.js'),
  'famille-primitives-widget': () => import('../../interactive/register-famille-primitives-widget.js'),
  'condition-initiale-widget': () => import('../../interactive/register-condition-initiale-widget.js'),
  'sommes-riemann-widget': () => import('../../interactive/register-sommes-riemann-widget.js'),
  'identite-signe-widget': () => import('../../interactive/register-identite-signe-widget.js'),
  'equation-trig-cas-limite-widget': () => import('../../interactive/register-equation-trig-cas-limite-widget.js'),
  'triangle-cas-ambigu-widget': () => import('../../interactive/register-triangle-cas-ambigu-widget.js'),
  'point-critique-signe-widget': () => import('../../interactive/register-point-critique-signe-widget.js'),
  'extrema-bornes-widget': () => import('../../interactive/register-extrema-bornes-widget.js'),
  'recette-benefice-widget': () => import('../../interactive/register-recette-benefice-widget.js'),
  'racines-niemes-widget': () => import('../../interactive/register-racines-niemes-widget.js'),
  'produit-modules-arguments-widget': () => import('../../interactive/register-produit-modules-arguments-widget.js'),
  'transformation-az-b-widget': () => import('../../interactive/register-transformation-az-b-widget.js'),
  'test-colinearite-widget': () => import('../../interactive/register-test-colinearite-widget.js'),
  'milieu-piege-widget': () => import('../../interactive/register-milieu-piege-widget.js'),
  'resultante-vecteurs-widget': () => import('../../interactive/register-resultante-vecteurs-widget.js'),
  'venn-double-entree-widget': () => import('../../interactive/register-venn-double-entree-widget.js'),
  'bayes-test-medical-widget': () => import('../../interactive/register-bayes-test-medical-widget.js'),
  'binomiale-positions-widget': () => import('../../interactive/register-binomiale-positions-widget.js'),
}

/**
 * Monte un Web Component autonome (Shadow DOM) porté depuis l'artifact d'origine. Le composant
 * gère entièrement son propre état interne (React ne fait que le poser dans le DOM une fois) —
 * jamais capturé par l'export HTML (A4) (voir `.no-export` sur le conteneur appelant : un Shadow
 * DOM n'est de toute façon pas repris par un `cloneNode`/`outerHTML` classique).
 */
export function InteractiveWidget({ tag }: { tag: InteractiveWidgetTag }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    REGISTER[tag]().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [tag])

  useEffect(() => {
    const host = hostRef.current
    if (!ready || !host) return
    host.replaceChildren(document.createElement(tag))
  }, [ready, tag])

  return <div ref={hostRef} className="widget-host" />
}
