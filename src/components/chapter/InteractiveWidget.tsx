import { useEffect, useRef, useState } from 'react'
import type { InteractiveWidgetTag } from '../../content/types'

/** Charge (à la demande, `import()` dynamique) le module qui enregistre le Web Component
 * correspondant — l'ordre interne de chaque module gère lui-même ses propres dépendances
 * (ex. gen8-widget a besoin de Gen7Core déjà chargé), voir `src/interactive/register-*.js`. */
const REGISTER: Record<InteractiveWidgetTag, () => Promise<unknown>> = {
  'gen7-widget': () => import('../../interactive/register-gen7-widget.js'),
  'gen8-widget': () => import('../../interactive/register-gen8-widget.js'),
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
  'transformation-8-parametres-widget': () => import('../../interactive/register-transformation-8-parametres-widget.js'),
  'familles-parite-widget': () => import('../../interactive/register-familles-parite-widget.js'),
  'inverse-monotonie-widget': () => import('../../interactive/register-inverse-monotonie-widget.js'),
  'seuil-cumule-widget': () => import('../../interactive/register-seuil-cumule-widget.js'),
  'frontiere-classe-widget': () => import('../../interactive/register-frontiere-classe-widget.js'),
  'dispersion-comparee-widget': () => import('../../interactive/register-dispersion-comparee-widget.js'),
  'point-vide-ou-asymptote-widget': () => import('../../interactive/register-point-vide-ou-asymptote-widget.js'),
  'degre-asymptote-widget': () => import('../../interactive/register-degre-asymptote-widget.js'),
  'plancher-plafond-widget': () => import('../../interactive/register-plancher-plafond-widget.js'),
  'famille-primitives-widget': () => import('../../interactive/register-famille-primitives-widget.js'),
  'condition-initiale-widget': () => import('../../interactive/register-condition-initiale-widget.js'),
  'sommes-riemann-widget': () => import('../../interactive/register-sommes-riemann-widget.js'),
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
