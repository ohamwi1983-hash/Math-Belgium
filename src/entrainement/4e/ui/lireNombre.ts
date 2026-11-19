import { parserExpressionNumerique } from "../moteur/verificationCaracteristiquesAlgebriques";

/** Nombre saisi dans un champ libre : décimal à virgule ou à point (« 1,5 »), sinon expression
 * numérique (fraction « 3/2 », racine « sqrt(2) »). null si illisible — jamais de blocage de frappe,
 * l'écran dit alors que la saisie ne compte pas comme une tentative. */
export function lireNombreSaisi(texte: string): number | null {
  const t = texte.trim();
  if (t === "") return null;
  const direct = Number(t.replace(",", "."));
  if (Number.isFinite(direct)) return direct;
  return parserExpressionNumerique(t);
}
