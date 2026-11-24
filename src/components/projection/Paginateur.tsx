import { useEffect, useRef } from 'react'
import type { ChapterContent } from '../../content/types'
import type { Diapo as DonneesDiapo } from '../../lib/projection/diapos'
import { estPaginable, pageDeDiapo } from '../../lib/projection/diapos'
import { Diapo } from './Diapo'

const attendreImage = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))

/**
 * Découpe les exemples résolus et démonstrations trop longs pour une diapo : chaque diapo paginable
 * est rendue hors écran, entièrement révélée, à sa taille réelle (1 280 × 720) ; ses lignes / blocs
 * sont répartis, sans jamais en couper un, sur autant de diapos que nécessaire (« · suite »). Le même
 * calcul (mêmes polices, même taille logique) donne le même résultat dans les deux fenêtres et dans
 * l'export PowerPoint.
 */
export function Paginateur({ diapos, chapter, onFini }: { diapos: DonneesDiapo[]; chapter: ChapterContent; onFini: (d: DonneesDiapo[]) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const fini = useRef(onFini)
  fini.current = onFini
  const aMesurer = diapos.filter(estPaginable)

  useEffect(() => {
    let vivant = true
    void (async () => {
      await document.fonts?.ready
      await attendreImage()
      await document.fonts?.ready
      if (!vivant) return
      const decoupes = new Map<string, [number, number][]>()
      for (const el of Array.from(ref.current?.querySelectorAll<HTMLElement>('.diapo[data-cle]') ?? [])) {
        const cle = el.dataset.cle!
        const zone = el.querySelector<HTMLElement>('[data-zone-mesure]')
        const contenu = el.querySelector<HTMLElement>('.diapo-contenu')
        if (!zone || !contenu) continue
        const reserve = el.classList.contains('diapo--libre') ? 34 : 4
        // Tolérance de 12 % : un léger dépassement est absorbé par l'ajustement de la diapo (caractères
        // ramenés au plus à 88 %, soit 28 px pour le corps de 32 px) plutôt que d'isoler une ligne.
        const dispo = (contenu.getBoundingClientRect().bottom - zone.getBoundingClientRect().top - reserve) / 0.88
        const items = Array.from(zone.querySelectorAll<HTMLElement>(':scope > [data-mesure]'))
        const ecart = parseFloat(getComputedStyle(zone).rowGap) || 0
        const pages: [number, number][] = []
        let debut = 0
        let utilise = 0
        items.forEach((it, i) => {
          const h = it.getBoundingClientRect().height
          if (i > debut && utilise + ecart + h > dispo) {
            pages.push([debut, i])
            debut = i
            utilise = h
          } else utilise += (i > debut ? ecart : 0) + h
        })
        pages.push([debut, items.length])
        // Jamais une page avec le seul résultat : la ligne qui le précède l'accompagne.
        const der = pages[pages.length - 1]
        if (pages.length > 1 && der[1] - der[0] === 1 && pages[pages.length - 2][1] - pages[pages.length - 2][0] > 1) {
          pages[pages.length - 2][1]--
          der[0]--
        }
        decoupes.set(cle, pages)
      }
      const finales = diapos.flatMap((d) => {
        const pages = decoupes.get(d.cle)
        if (!pages || pages.length <= 1) return [d]
        return pages.map(([a, b], rang) => pageDeDiapo(d, a, b, rang))
      })
      fini.current(finales)
    })()
    return () => {
      vivant = false
    }
  }, [diapos])

  return (
    <div ref={ref} className="projection-mesure" aria-hidden="true">
      {aMesurer.map((d) => (
        <Diapo key={d.cle} diapo={d} chapter={chapter} pas={d.pas} mode="mesure" />
      ))}
    </div>
  )
}
