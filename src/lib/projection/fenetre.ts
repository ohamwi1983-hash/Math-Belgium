/**
 * Fenêtre des diapos du mode deux écrans (`window.open`, nom fixe : la rouvrir réutilise la même).
 * La référence est gardée dans ce module : elle survit à la navigation interne du lanceur vers la vue
 * du professeur (même document). `window.open` doit être appelé DANS le geste de l'utilisateur (clic),
 * sinon le navigateur bloque la fenêtre ; `null` = bloquée.
 */
let fenetre: Window | null = null

export const NOM_FENETRE_DIAPOS = 'math-belgium-diapos'

export function ouvrirFenetreDiapos(url: string): Window | null {
  try {
    fenetre = window.open(url, NOM_FENETRE_DIAPOS, 'popup=yes,width=1280,height=760')
  } catch {
    fenetre = null
  }
  return fenetre
}

export function fenetreDiapos(): Window | null {
  return fenetre
}
