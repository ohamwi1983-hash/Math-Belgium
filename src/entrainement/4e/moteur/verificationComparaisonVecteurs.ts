/**
 * Couche B — vérification pour "Comparaison visuelle de vecteurs sur figure" (chapitre "Calcul
 * vectoriel", deuxième générateur). L'étape "égalité" a son propre petit lecteur d'égalité
 * (`parserMembre`) : l'égalité peut être écrite dans les deux sens et avec une division
 * (`a = d/2`), ce que la grammaire de `parserCombinaisonVecteurs` ne couvre pas.
 */
import type { ExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 1e-6;

/** Étape "sélection" — comparaison en multi-ensemble, jamais sensible à l'ordre ; aucun risque de
 * parse_error (sélection sur la figure, pas une saisie libre). */
export function verifierSelection(exercice: ExerciceComparaisonVecteurs, labelsSelectionnes: string[]): boolean {
  const attendus = [...new Set(exercice.labelsCorrects)].sort();
  const soumis = [...new Set(labelsSelectionnes)].sort();
  return attendus.length === soumis.length && attendus.every((l, i) => l === soumis[i]);
}

/** Normalise une saisie d'égalité : casse, signe moins typographique, symboles de produit. */
function normaliserEgalite(texte: string): string {
  return texte.toLowerCase().replace(/[−–]/g, "-").replace(/[·×]/g, "*").replace(/\s+/g, "");
}

const NOMBRE = String.raw`\d+(?:[.,]\d+)?`;
/** Un terme : `[signe][coefficient][*]nom[/diviseur]` ou `[signe]nom*coefficient`, coefficient
 * décimal ou fraction `p/q` (ex. « -2a », « 2*a », « 1/2a », « a/2 », « a*3 »), ou une constante 0. */
const REGEX_TERME_EGALITE = new RegExp(
  String.raw`([+-]?)(?:([a-z])\*(${NOMBRE})|(${NOMBRE}(?:\/${NOMBRE})?)?\*?([a-z])(?:\/(${NOMBRE}))?|(0))`,
  "g",
);

function nombre(texte: string): number {
  return Number(texte.replace(",", "."));
}

/** Membre d'égalité → coefficients par nom de vecteur (`null` si illisible). */
function parserMembre(texte: string): Record<string, number> | null {
  if (texte === "") return null;
  const coefficients: Record<string, number> = {};
  REGEX_TERME_EGALITE.lastIndex = 0;
  let position = 0;
  let premier = true;
  let m: RegExpExecArray | null;
  while ((m = REGEX_TERME_EGALITE.exec(texte)) !== null) {
    if (m[0].length === 0 || m.index !== position) return null;
    const [, signe, nomAvantCoef, coefApresNom, coefAvantNom, nom, diviseur, zero] = m;
    if (!premier && signe === "") return null;
    position = m.index + m[0].length;
    premier = false;
    if (zero !== undefined) continue;
    const sens = signe === "-" ? -1 : 1;
    let valeur = 1;
    if (coefApresNom) valeur = nombre(coefApresNom);
    if (coefAvantNom) {
      const [num, den] = coefAvantNom.split("/");
      valeur = den === undefined ? nombre(num) : nombre(num) / nombre(den);
    }
    if (diviseur) valeur /= nombre(diviseur);
    if (!Number.isFinite(valeur)) return null;
    const lettre = nomAvantCoef ?? nom;
    coefficients[lettre] = (coefficients[lettre] ?? 0) + sens * valeur;
  }
  return position === texte.length ? coefficients : null;
}

/** Étape "égalité" — toute égalité équivalente à `cible = k·référence` est acceptée, quel que soit
 * le sens d'écriture (`c = 2h`, `2h = c`, `h = c/2`, `c - 2h = 0`, `c = 2·h`, `C = −2H`…) : on
 * ramène tout dans un membre (`α·cible + β·référence = 0`) et on vérifie `−β/α = k`. Un autre
 * vecteur de la figure dans l'égalité, ou la cible absente, donne `not_equivalent`. */
export function diagnostiquerEgalite(exercice: ExerciceComparaisonVecteurs, texte: string): StatutVerification {
  const parties = normaliserEgalite(texte).split("=");
  if (parties.length !== 2) return "parse_error";
  const gauche = parserMembre(parties[0]);
  const droite = parserMembre(parties[1]);
  if (gauche === null || droite === null) return "parse_error";

  const cible = exercice.cibleEgalite.toLowerCase();
  const reference = exercice.labelReference.toLowerCase();
  const total: Record<string, number> = { ...gauche };
  for (const [nom, valeur] of Object.entries(droite)) total[nom] = (total[nom] ?? 0) - valeur;

  const alpha = total[cible] ?? 0;
  const beta = total[reference] ?? 0;
  const autres = Object.entries(total).some(([nom, valeur]) => nom !== cible && nom !== reference && Math.abs(valeur) > TOLERANCE);
  if (autres || Math.abs(alpha) < TOLERANCE) return "not_equivalent";
  return Math.abs(-beta / alpha - exercice.coefficientEgalite) < TOLERANCE ? "correct" : "not_equivalent";
}

export function verifierEgalite(exercice: ExerciceComparaisonVecteurs, texte: string): boolean {
  return diagnostiquerEgalite(exercice, texte) === "correct";
}
