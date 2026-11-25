/**
 * Choix « Lire ligne par ligne » du corrigé des générateurs, RETENU sur l'appareil (décision du
 * professeur, 25/11/2026). Rien n'est envoyé. Module séparé : le panneau « Aa » l'oublie sans charger
 * le composant du corrigé.
 */
export const CLE_LIGNE_PAR_LIGNE = 'corrige:ligne-par-ligne'

export function ligneParLigneRetenue(): boolean {
  try {
    return localStorage.getItem(CLE_LIGNE_PAR_LIGNE) === '1'
  } catch {
    return false
  }
}

export function retenirLigneParLigne(oui: boolean) {
  try {
    if (oui) localStorage.setItem(CLE_LIGNE_PAR_LIGNE, '1')
    else localStorage.removeItem(CLE_LIGNE_PAR_LIGNE)
  } catch {
    /* stockage indisponible : le choix vaut pour ce corrigé seulement */
  }
}

/** « Revenir au réglage du site » (panneau « Aa ») : le corrigé s'ouvre de nouveau complet. */
export function oublierLigneParLigne() {
  retenirLigneParLigne(false)
}
