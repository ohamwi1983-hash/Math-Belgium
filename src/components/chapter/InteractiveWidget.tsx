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
}

/**
 * Monte un Web Component autonome (Shadow DOM) porté depuis l'artifact d'origine. Le composant
 * gère entièrement son propre état interne (React ne fait que le poser dans le DOM une fois) —
 * jamais capturé par l'export (voir `.no-export` sur le conteneur appelant, `iframe`/Shadow DOM
 * ne peuvent pas être rendus par html2canvas).
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
