import { useSyncExternalStore } from 'react'

/** Ouverture du panneau « Confort de lecture » : un seul panneau pour tous les boutons « Aa » (en-tête
 * du site, barre de l'étape, outils du chapitre ; plus tard la barre des générateurs). Le bouton qui
 * l'a ouvert reçoit le focus à la fermeture. */
let ouvert = false
let declencheur: HTMLElement | null = null
const abonnes = new Set<() => void>()
const prevenir = () => abonnes.forEach((f) => f())

export function ouvrirPanneauLecture(depuis?: HTMLElement | null) {
  declencheur = depuis ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
  if (ouvert) return
  ouvert = true
  prevenir()
}

export function fermerPanneauLecture() {
  if (!ouvert) return
  ouvert = false
  prevenir()
  const cible = declencheur
  declencheur = null
  // Retour du focus : le bouton d'origine s'il est encore affiché, sinon un autre « Aa » visible.
  requestAnimationFrame(() => {
    const visible = (el: HTMLElement | null) => !!el && el.isConnected && el.getClientRects().length > 0
    const repli = Array.from(document.querySelectorAll<HTMLElement>('[data-bouton-lecture]')).find(visible) ?? null
    ;(visible(cible) ? cible : repli)?.focus({ preventScroll: true })
  })
}

function abonner(f: () => void) {
  abonnes.add(f)
  return () => abonnes.delete(f)
}

export function usePanneauLectureOuvert(): boolean {
  return useSyncExternalStore(abonner, () => ouvert, () => false)
}
