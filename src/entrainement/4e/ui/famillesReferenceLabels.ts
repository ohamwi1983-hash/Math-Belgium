import type { FamilleReference } from "../core/fonctionsReference.types";

const LIBELLES_FAMILLE: Record<FamilleReference, string> = {
  carre: "Carré (x²)",
  cube: "Cube (x³)",
  racine_carree: "Racine carrée (√x)",
  racine_cubique: "Racine cubique (∛x)",
  inverse: "Inverse (1/x)",
  valeur_absolue: "Valeur absolue (|x|)",
};

const ORDRE_FAMILLES: FamilleReference[] = ["carre", "cube", "racine_carree", "racine_cubique", "inverse", "valeur_absolue"];

/** Les 6 familles proposées à l'étape de reconnaissance (spec section 3, étape 0) — toujours les 6,
 * contrairement à OPTIONS_CATEGORIE (exercice 1) qui en exclut une. */
export const OPTIONS_FAMILLE: { valeur: FamilleReference; libelle: string }[] = ORDRE_FAMILLES.map((valeur) => ({
  valeur,
  libelle: LIBELLES_FAMILLE[valeur],
}));

export function libelleFamille(famille: FamilleReference): string {
  return LIBELLES_FAMILLE[famille];
}
