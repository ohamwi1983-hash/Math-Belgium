import type { Enonce } from "../core/generateur.types";
import type {
  ChoixAllure,
  ExerciceAnalyseFonction,
  ReponseAxeSommet,
  ReponseCoefficients,
  SigneAllure,
  SigneProduitAB,
  ValeurVariation,
} from "../core/analyseFonction.types";
import type { Morceau } from "../core/inequation.types";
import type { ValeurCellule } from "../core/signesProduit.types";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.005;

export function signeReelA(enonce: Enonce): SigneAllure {
  return enonce.a > 0 ? "+" : "-";
}

export function signeReelAB(enonce: Enonce): SigneProduitAB {
  const produit = enonce.a * enonce.b;
  if (produit === 0) return "0";
  return produit > 0 ? "+" : "-";
}

/**
 * Étape 1 (statut à 3 valeurs, convention CLAUDE.md) : les 3 champs a, b, c sont convertis en
 * nombre côté composant (`Number(texte.replace(",","."))`) AVANT d'atteindre cette fonction — un
 * texte non numérique (ex. "Hh") y arrive donc déjà comme `NaN`, jamais comme la chaîne d'origine.
 * `NaN` est un signal suffisant et non ambigu d'échec de parsing pour un champ purement numérique
 * (contrairement à une expression algébrique libre, une valeur numérique valide ne peut jamais
 * elle-même valoir NaN) : aucun des 3 champs n'a besoin d'être individuellement identifié, un seul
 * NaN suffit à conclure "parse_error" pour la tentative entière.
 */
export function diagnostiquerCoefficients(exercice: ExerciceAnalyseFonction, reponse: ReponseCoefficients): StatutVerification {
  if (!Number.isFinite(reponse.a) || !Number.isFinite(reponse.b) || !Number.isFinite(reponse.c)) return "parse_error";
  const { a, b, c } = exercice.exercice.enonce;
  return reponse.a === a && reponse.b === b && reponse.c === c ? "correct" : "not_equivalent";
}

/** Étape 1 : les 3 champs a, b, c comparés en un seul essai (tout ou rien). */
export function verifierCoefficients(exercice: ExerciceAnalyseFonction, reponse: ReponseCoefficients): boolean {
  return diagnostiquerCoefficients(exercice, reponse) === "correct";
}

/** Étape 2 : les deux choix (signe de a, signe de a·b) comparés en un seul essai. */
export function verifierAllure(exercice: ExerciceAnalyseFonction, choix: ChoixAllure): boolean {
  const { enonce } = exercice.exercice;
  return choix.signeA === signeReelA(enonce) && choix.signeAB === signeReelAB(enonce);
}

const REGEX_FRACTION = /^(-?\d+)\s*\/\s*(-?\d+)$/;

/**
 * Analyseur léger (correction 5, prompt-8-corrections-analyse-fonction.md) : reconnaît soit un
 * entier/décimal (point ou virgule française), soit une fraction "entier/entier" (espaces
 * tolérés autour du "/", signe sur l'un ou l'autre terme) — sans repenser la structure de saisie
 * existante. Utilisé à la fois par analyserAxeSymetrie et par les champs x_S/y_S (composant).
 */
export function parserNombreOuFraction(texte: string): number | null {
  const t = texte.trim();
  const fraction = REGEX_FRACTION.exec(t);
  if (fraction) {
    const numerateur = Number(fraction[1]);
    const denominateur = Number(fraction[2]);
    if (denominateur === 0) return null;
    return numerateur / denominateur;
  }
  const valeur = Number(t.replace(",", "."));
  return Number.isFinite(valeur) && t !== "" ? valeur : null;
}

/**
 * Tolérant à l'espacement ("x=3", "x = 3") mais exige la structure "x=valeur" — jamais une
 * comparaison caractère par caractère. `valeur` accepte tout ce que parserNombreOuFraction
 * reconnaît (entier, décimal, ou fraction "p/q" — correction 5).
 */
const REGEX_AXE = /^x\s*=\s*(.+)$/;

export function analyserAxeSymetrie(texte: string): number | null {
  const correspondance = REGEX_AXE.exec(texte.trim());
  if (!correspondance) return null;
  return parserNombreOuFraction(correspondance[1]);
}

/**
 * Étape 3 (statut à 3 valeurs) : le texte "AS ≡" doit toujours respecter le gabarit fixe "x=valeur"
 * (contrairement à une expression algébrique libre, il n'existe pas d'autre formulation valide pour
 * un axe de symétrie) — `analyserAxeSymetrie` renvoie déjà `null` aussi bien pour un préfixe "x="
 * absent que pour une valeur illisible après le "=", les deux cas étant traités identiquement comme
 * "parse_error" ici, jamais "not_equivalent". `xS`/`yS` sont déjà convertis en `NaN` côté composant
 * pour un texte non numérique (même principe que `diagnostiquerCoefficients`).
 */
export function diagnostiquerAxeSommet(exercice: ExerciceAnalyseFonction, reponse: ReponseAxeSommet): StatutVerification {
  const axeValeur = analyserAxeSymetrie(reponse.axeTexte);
  if (axeValeur === null || !Number.isFinite(reponse.xS) || !Number.isFinite(reponse.yS)) return "parse_error";
  const correct =
    Math.abs(axeValeur - exercice.xS) <= TOLERANCE &&
    Math.abs(reponse.xS - exercice.xS) <= TOLERANCE &&
    Math.abs(reponse.yS - exercice.yS) <= TOLERANCE;
  return correct ? "correct" : "not_equivalent";
}

export function verifierAxeSommet(exercice: ExerciceAnalyseFonction, reponse: ReponseAxeSommet): boolean {
  return diagnostiquerAxeSommet(exercice, reponse) === "correct";
}

/**
 * Étape 4 (imf uniquement, domf est une information donnée) : l'ensemble-image attendu est
 * toujours un intervalle semi-infini fermé du côté de yS — [yS,+∞[ si a>0, ]-∞,yS] si a<0 (jamais
 * les 6 formes générales de l'exercice "tableau de signes", inutiles ici).
 */
export function verifierImage(exercice: ExerciceAnalyseFonction, morceau: Morceau): boolean {
  const { a } = exercice.exercice.enonce;

  if (a > 0) {
    return (
      morceau.crochetGauche === "[" &&
      typeof morceau.borneGauche === "number" &&
      Math.abs(morceau.borneGauche - exercice.yS) <= TOLERANCE &&
      morceau.crochetDroit === "[" &&
      morceau.borneDroite === "+inf"
    );
  }

  return (
    morceau.crochetGauche === "]" &&
    morceau.borneGauche === "-inf" &&
    morceau.crochetDroit === "]" &&
    typeof morceau.borneDroite === "number" &&
    Math.abs(morceau.borneDroite - exercice.yS) <= TOLERANCE
  );
}

export interface ReponseGrilleSigneVariation {
  ligneSigne: ValeurCellule[];
  ligneVariation: ValeurVariation[];
}

function tableauxEgaux<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * Étape 6 : la grille "signe et variation" (2 lignes) est soumise en une seule tentative globale,
 * tout ou rien — même principe que la grille de l'exercice 5 (verifierGrille) : comparaison
 * structurelle stricte contre exercice.grilleSigneVariation, déjà calculée à la génération.
 */
export function verifierGrilleSigneVariation(
  exercice: ExerciceAnalyseFonction,
  reponse: ReponseGrilleSigneVariation,
): boolean {
  const attendu = exercice.grilleSigneVariation;
  return tableauxEgaux(reponse.ligneSigne, attendu.ligneSigne) && tableauxEgaux(reponse.ligneVariation, attendu.ligneVariation);
}
