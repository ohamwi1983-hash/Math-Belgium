import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

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
