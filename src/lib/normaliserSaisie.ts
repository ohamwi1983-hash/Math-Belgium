/**
 * Normalisation d'un champ de saisie libre — AUCUN blocage de frappe.
 *
 * Règle (demande de l'utilisateur) : un champ libre ne filtre jamais les caractères tapés et
 * n'impose jamais un clavier numérique (`inputMode="numeric"`/`"decimal"`) — sur téléphone, ces
 * claviers n'ont souvent pas de touche « − », ce qui empêchait d'écrire une valeur négative.
 * L'ancien module `bloquerSaisieNonNumerique` (onKeyDown + filtre onChange) a été supprimé.
 *
 * La seule transformation conservée convertit les signes moins typographiques (« − » U+2212,
 * « – » U+2013, « — » U+2014, fréquents sur clavier mobile ou au copier-coller) en « - », pour
 * que la lecture `Number(…)` des générateurs reconnaisse le nombre négatif. Tout autre caractère
 * reste dans le champ : une saisie illisible est jugée par la vérification, jamais effacée.
 */
const SIGNES_MOINS = /[−–—]/g;

export function normaliserSigneMoins(valeur: string): string {
  return valeur.replace(SIGNES_MOINS, "-");
}
