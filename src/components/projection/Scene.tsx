import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { MessageProjection, Projection, Trait } from './useProjection'

export const LARGEUR = 1280
export const HAUTEUR = 720

/** Taille d'un conteneur (ResizeObserver). */
export function useTaille(ref: React.RefObject<HTMLElement | null>) {
  const [taille, setTaille] = useState({ l: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const lire = () => setTaille({ l: el.clientWidth, h: el.clientHeight })
    lire()
    const ro = new ResizeObserver(lire)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return taille
}

/**
 * Scène 16:9 : la diapo (1 280 × 720 logiques) est mise à l'échelle pour remplir son conteneur, centrée
 * (bandes de la couleur du fond). `transform` ne change pas la mise en page : toutes les mesures
 * (ajustement, découpage) restent en pixels logiques.
 */
export function Scene({ children, className, marge = 0 }: { children: (echelle: number) => ReactNode; className?: string; marge?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { l, h } = useTaille(ref)
  const echelle = l && h ? Math.min((l - marge) / LARGEUR, (h - marge) / HAUTEUR) : 0
  return (
    <div ref={ref} className={`projection-scene${className ? ` ${className}` : ''}`}>
      {echelle > 0 && (
        <div className="projection-scene-cadre" style={{ width: LARGEUR * echelle, height: HAUTEUR * echelle }}>
          <div className="projection-scene-diapo" style={{ transform: `scale(${echelle})` }}>
            {children(echelle)}
          </div>
        </div>
      )}
    </div>
  )
}

export type OutilStylo = 'stylo' | 'gomme'

/**
 * Stylo d'annotation : un canvas par-dessus la diapo, en coordonnées de la diapo ; les traits sont
 * gardés en mémoire pour être redessinés à l'échelle, effacés au changement de diapo, et envoyés à
 * l'autre fenêtre (deux écrans) : ce qu'on écrit sur l'écran du professeur apparaît au tableau.
 */
export function Annotations({ projection, actif, outil, couleur, echelle }: { projection: Projection; actif: boolean; outil: OutilStylo; couleur: string; echelle: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const traits = useRef<Trait[]>([])
  const courant = useRef<Trait | null>(null)
  const { etat, envoyer, ecouter, id } = projection
  const index = etat.index

  const dessiner = useCallback(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const k = c.width / LARGEUR
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.setTransform(k, 0, 0, k, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const t of traits.current) {
      ctx.globalCompositeOperation = t.gomme ? 'destination-out' : 'source-over'
      ctx.strokeStyle = t.couleur
      ctx.lineWidth = t.gomme ? 44 : 5
      ctx.beginPath()
      t.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
      if (t.points.length === 1) ctx.lineTo(t.points[0][0] + 0.1, t.points[0][1])
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  }, [])

  // Résolution du canvas = taille réelle à l'écran (net à toute échelle).
  useEffect(() => {
    const c = canvas.current
    if (!c || !echelle) return
    const dpr = window.devicePixelRatio || 1
    c.width = Math.round(LARGEUR * echelle * dpr)
    c.height = Math.round(HAUTEUR * echelle * dpr)
    dessiner()
  }, [echelle, dessiner])

  // Changement de diapo : tout est effacé.
  useEffect(() => {
    traits.current = []
    courant.current = null
    dessiner()
  }, [index, dessiner])

  useEffect(
    () =>
      ecouter((m: MessageProjection) => {
        if (!('index' in m) || m.index !== index) return
        if (m.type === 'effacer') traits.current = []
        else if (m.type === 'trait') traits.current.push({ ...m.trait, points: [...m.trait.points] })
        else if (m.type === 'point') traits.current.find((t) => t.id === m.id)?.points.push([m.x, m.y])
        dessiner()
      }),
    [ecouter, index, dessiner],
  )

  useEffect(() => {
    const effacer = () => {
      traits.current = []
      dessiner()
      envoyer({ type: 'effacer', de: id, index })
    }
    window.addEventListener('projection:effacer', effacer)
    return () => window.removeEventListener('projection:effacer', effacer)
  }, [dessiner, envoyer, id, index])

  const position = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect()
    return [Math.round(((e.clientX - r.left) / r.width) * LARGEUR * 10) / 10, Math.round(((e.clientY - r.top) / r.height) * HAUTEUR * 10) / 10]
  }

  return (
    <canvas
      ref={canvas}
      className={`projection-annotations${actif ? ' actif' : ''}${actif && outil === 'gomme' ? ' gomme' : ''}`}
      aria-hidden="true"
      onPointerDown={(e) => {
        if (!actif) return
        e.preventDefault()
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        const t: Trait = { id: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, couleur, gomme: outil === 'gomme', points: [position(e)] }
        courant.current = t
        traits.current.push(t)
        envoyer({ type: 'trait', de: id, index, trait: t })
        dessiner()
      }}
      onPointerMove={(e) => {
        const t = courant.current
        if (!actif || !t) return
        const [x, y] = position(e)
        t.points.push([x, y])
        envoyer({ type: 'point', de: id, index, id: t.id, x, y })
        dessiner()
      }}
      onPointerUp={() => {
        courant.current = null
      }}
      onPointerCancel={() => {
        courant.current = null
      }}
      onClick={(e) => actif && e.stopPropagation()}
    />
  )
}
