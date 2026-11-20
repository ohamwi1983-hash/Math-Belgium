/**
 * Cartouche des copies (évaluation, examen, aménagée, corrigé, grille, Word) : école, adresse et
 * nom du professeur.
 *
 * Avant les comptes professeurs, ces trois textes étaient des constantes (décision prise avec
 * l'utilisateur, aucun champ dans le formulaire). Ils viennent désormais du PROFIL du professeur
 * connecté (`nom_affiche`) et de l'école choisie dans le panneau (`EnTeteEvaluation.cartouche`,
 * voir `lib/compteValidation.ts::cartoucheDepuisCompte`). Sans cartouche (pas de session : /admin
 * historique, Supabase non configuré), `CARTOUCHE_DEFAUT` s'applique et les documents sont
 * IDENTIQUES octet pour octet à ceux d'avant.
 *
 * Module pur (aucune dépendance) : textes BRUTS, l'échappement HTML reste au rendu
 * (`assemblerEvaluationHtml.ts::echapperHtml` ; le Word échappe lui-même son XML).
 */

export interface CartoucheEcole {
  /** « Collège Saint-Pierre » — vide : rien n'est imprimé à sa place. */
  ecoleNom: string;
  /** « Rue J.B. Verbeyst 25, 1090 Bruxelles » — vide : rien n'est imprimé à sa place. */
  ecoleAdresse: string;
  /** « M. Hamwi » — vide : rien n'est imprimé à sa place. */
  professeur: string;
}

/** Valeurs historiques (repli sans session ni profil : rendu inchangé). */
export const CARTOUCHE_DEFAUT: CartoucheEcole = {
  ecoleNom: "Collège Saint-Pierre",
  ecoleAdresse: "Rue J.B. Verbeyst 25, 1090 Bruxelles",
  professeur: "M. Hamwi",
};

/** Cartouche effectif : celui de l'en-tête s'il existe, sinon les valeurs historiques. Les textes
 * sont ramenés sur une ligne (un retour à la ligne saisi casserait le cartouche). */
export function cartoucheEffectif(cartouche: CartoucheEcole | undefined): CartoucheEcole {
  if (!cartouche) return CARTOUCHE_DEFAUT;
  const uneLigne = (t: string | undefined) => (t ?? "").replace(/\s+/g, " ").trim();
  return { ecoleNom: uneLigne(cartouche.ecoleNom), ecoleAdresse: uneLigne(cartouche.ecoleAdresse), professeur: uneLigne(cartouche.professeur) };
}

/** Morceaux du surtitre « École · Mathématiques 4h/sem · Professeur » (textes bruts, morceaux
 * vides retirés) — à joindre par « · » après échappement. */
export function morceauxSurtitre(cartouche: CartoucheEcole, matiere: string): string[] {
  return [cartouche.ecoleNom, matiere, cartouche.professeur].filter((m) => m !== "");
}
