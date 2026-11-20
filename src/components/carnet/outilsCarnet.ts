/**
 * Petits outils d'interface du carnet (presse-papiers, fiche, mémoire de la classe active).
 */
/** Copie `texte` (et `html` quand le navigateur sait coller du texte riche). Faux si aucune méthode
 * n'a marché : l'appelant affiche alors le texte à copier à la main. */
export async function copierTexte(texte: string, html?: string): Promise<boolean> {
  try {
    if (html && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/plain': new Blob([texte], { type: 'text/plain' }), 'text/html': new Blob([html], { type: 'text/html' }) }),
      ])
      return true
    }
  } catch {
    // collage riche refusé : on retente en texte seul
  }
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(texte)
      return true
    }
  } catch {
    // presse-papiers indisponible (page non sécurisée, permission refusée…)
  }
  const zone = document.createElement('textarea')
  zone.value = texte
  zone.setAttribute('readonly', '')
  zone.style.position = 'fixed'
  zone.style.top = '0'
  zone.style.opacity = '0'
  document.body.appendChild(zone)
  zone.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  zone.remove()
  return ok
}

/** Ouvre la fiche dans un nouvel onglet par un lien (jamais `window.open`) ; `#imprimer` lance
 * l'impression au chargement (même mécanisme que les documents du panneau). */
export function ouvrirFiche(html: string): void {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const lien = document.createElement('a')
  lien.href = `${url}#imprimer`
  lien.target = '_blank'
  lien.rel = 'noopener'
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  // L'onglet a lu le document : l'URL peut être libérée plus tard.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Téléchargement de la fiche (`<a download>`) ; l'URL n'est libérée qu'après coup (la libérer
 * aussitôt fait perdre le nom du fichier dans certains navigateurs). */
export function telechargerFiche(html: string, nomFichier: string): void {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomFichier.replace(/[\\/:*?"<>|]/g, '-')
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

const CLE_CLASSE = 'math-belgium-carnet-classe'

export function lireClasseMemorisee(): string | null {
  try {
    return localStorage.getItem(CLE_CLASSE)
  } catch {
    return null
  }
}

export function memoriserClasse(id: string): void {
  try {
    localStorage.setItem(CLE_CLASSE, id)
  } catch {
    // stockage indisponible : simple confort perdu
  }
}
