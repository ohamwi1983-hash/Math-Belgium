// Un bloc de contenu sémantique = un enfant direct de l'en-tête de chapitre, de chaque
// <section>, ou du bloc de synthèse finale — jamais coupé, par construction, puisqu'il est
// capturé et posé en une seule image indivisible.
const CONTAINER_SELECTOR = '.page > header.chapter-head, .page > section, .page > .synthese'
const SKIP_SELECTOR = '.no-export, iframe'

/** Collecte les éléments DOM à exporter, dans l'ordre de lecture de la page. */
export function collectBlocks(): HTMLElement[] {
  const blocks: HTMLElement[] = []
  document.querySelectorAll<HTMLElement>(CONTAINER_SELECTOR).forEach((container) => {
    Array.from(container.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return
      if (child.matches(SKIP_SELECTOR)) return
      blocks.push(child)
    })
  })
  return blocks
}
