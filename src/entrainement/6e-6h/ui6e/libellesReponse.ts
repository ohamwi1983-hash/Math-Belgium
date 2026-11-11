/**
 * Réponse de l'élève telle qu'elle s'affiche dans l'historique des puces (`FicheReponseEcran`) —
 * audit chapitre 4 de 6e, point 13 : un champ à choix montre le LIBELLÉ de l'option choisie
 * (« f(x) ≥ g(x) »), jamais sa valeur interne (« fSurG », « positif »). Commun à 6gen26–28 (même
 * forme de `ChampDef` dans les trois `format*.ts`).
 */
interface ChampAvecOptions {
  type: string;
  options?: { valeur: string; label: string }[];
}

export function libellesReponse(champs: ChampAvecOptions[], valeurs: string[]): string {
  return valeurs
    .map((v, i) => {
      const champ = champs[i];
      if (champ?.type === "choix") return champ.options?.find((o) => o.valeur === v)?.label ?? v;
      return v;
    })
    .join(" ; ");
}
