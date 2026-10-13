import type { EtatSessionInequationRationnelle } from "../moteur/sessionInequationRationnelle";

/**
 * Un côté P2 est "factorisé" une fois que sa véritable forme factorisée est confirmée : pour
 * cas_general, ce n'est qu'à l'étape "simplifierDenomFactorisation"/"simplifierNumFactorisation"
 * (prompt-corrections-etat-actuel-et-duplication.md, point 3) — les racines seules (champ2) ne
 * donnent pas encore la forme factorisée elle-même, contrairement aux 3 autres techniques où
 * champ1 EST déjà cette forme.
 */
function coteFactorise(categorie: string, scoreChamp2: number | null, scoreFactorisation: number | null): boolean {
  return categorie === "cas_general" ? scoreFactorisation !== null : scoreChamp2 !== null;
}

/**
 * Le numérateur combiné (`exercice.numerateur`, un P2 — le facteur quadratique restant pour
 * `cubique`) est-il déjà entièrement factorisé à cet instant de la session ? Exportée pour être
 * réutilisée par le bloc de travail N(x) lui-même (`blocNumerateurQuadratique`,
 * AppInequationRationnelle.tsx).
 */
export function numerateurCombineEstFactorise(exercice: { numerateur: { categorie: string } }, etat: EtatSessionInequationRationnelle): boolean {
  return coteFactorise(exercice.numerateur.categorie, etat.scoreChamp2Exercice, etat.scoreFactorisationExercice);
}
