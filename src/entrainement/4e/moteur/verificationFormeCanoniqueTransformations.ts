import type {
  ExerciceFormeCanoniqueTransformation,
  ReponseCanonique,
  ReponseEvCvSox,
  ReponseTh,
  ReponseTv,
} from "../core/formeCanoniqueTransformations.types";
import type { StatutVerification } from "./statutVerification";
import { calculerA } from "./verificationTransformationsGraphiques";
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import { normaliserExposantsUnicode } from "./expressionAlgebrique";

const TOLERANCE_RAPPORT = 1e-9;

/**
 * Cible exacte d'une fonction canonique a(x-p)²+q, sous forme de fraction EXACTE (`numA`/`denA`,
 * jamais un flottant) pour le coefficient `a` — mêmes raisons que `calculerFormeGenerale`
 * (src/ui/formatFormeCanoniqueTransformations.ts) : `a=ev/cv` peut être un décimal périodique,
 * garder le numérateur/dénominateur exacts évite toute perte de précision au moment de comparer ou
 * d'afficher cette cible. Réutilisée à la fois par `verifierFormeCanoniqueComplete` (comparaison
 * tolérante) et par `src/ui/formatFormeCanoniqueTransformations.ts` (légendes de la trace
 * cumulative, formatage de la forme canonique complète) — d'où son export.
 */
export interface FonctionCanonique {
  numA: number;
  denA: number;
  p: number;
  q: number;
}

/** Fonction canonique réelle de l'exercice (a=±ev/cv, xS, q donné) — q vaut `exercice.yS` pour la
 * fonction finale, `0` pour une fonction intermédiaire avant la translation verticale. */
export function fonctionCanoniqueReelle(exercice: ExerciceFormeCanoniqueTransformation, q: number): FonctionCanonique {
  return { numA: exercice.sox ? -exercice.ev : exercice.ev, denA: exercice.cv, p: exercice.xS, q };
}

/** Étape 1 : xS et yS comparés exactement (valeurs entières par construction, pas de tolérance
 * flottante nécessaire — contrairement à "Analyse d'une fonction", où xS/yS peuvent être des
 * demi-entiers), plus la forme canonique complète (structurelle + algébrique, section 1b de la
 * refonte). */
export function diagnostiquerCanonique(exercice: ExerciceFormeCanoniqueTransformation, reponse: ReponseCanonique): StatutVerification {
  const statutForme = diagnostiquerFormeCanoniqueComplete(reponse.formeCanonique, fonctionCanoniqueReelle(exercice, exercice.yS));
  if (statutForme === "parse_error") return "parse_error";
  const correct = reponse.xS === exercice.xS && reponse.yS === exercice.yS && statutForme === "correct";
  return correct ? "correct" : "not_equivalent";
}

export function verifierCanonique(exercice: ExerciceFormeCanoniqueTransformation, reponse: ReponseCanonique): boolean {
  return diagnostiquerCanonique(exercice, reponse) === "correct";
}

/** Étape 2 : le curseur TH comparé à xS (déjà confirmé à l'étape précédente), plus la fonction
 * intermédiaire (x-xS)² (a=1, q=0 — aucune transformation EV/CV/SOX/TV encore appliquée). */
export function diagnostiquerTh(exercice: ExerciceFormeCanoniqueTransformation, reponse: ReponseTh): StatutVerification {
  const statutForme = diagnostiquerFormeCanoniqueComplete(reponse.fonctionIntermediaire, { numA: 1, denA: 1, p: exercice.xS, q: 0 });
  if (statutForme === "parse_error") return "parse_error";
  const correct = reponse.th === exercice.xS && statutForme === "correct";
  return correct ? "correct" : "not_equivalent";
}

export function verifierTh(exercice: ExerciceFormeCanoniqueTransformation, reponse: ReponseTh): boolean {
  return diagnostiquerTh(exercice, reponse) === "correct";
}

export interface EvaluationEvCvSox {
  ev: boolean;
  cv: boolean;
  sox: boolean;
}

/**
 * Étape 3 : même principe que `evaluerCurseurs`/`verifierCurseurs` (Transformations graphiques)
 * — seul le RAPPORT ev/cv compte (il représente |a|), jamais une comparaison de chacun à une
 * valeur canonique fixe. Réutilise `calculerA` (avec sox neutralisé à `false` des deux côtés) pour
 * dériver ce rapport sans dupliquer la division ev/cv.
 */
export function evaluerEvCvSox(exercice: ExerciceFormeCanoniqueTransformation, reponse: ReponseEvCvSox): EvaluationEvCvSox {
  const rapportAttendu = calculerA({ ev: exercice.ev, cv: exercice.cv, sox: false });
  const rapportSaisi = calculerA({ ev: reponse.ev, cv: reponse.cv, sox: false });
  const rapportCorrect = Math.abs(rapportSaisi - rapportAttendu) < TOLERANCE_RAPPORT;
  return { ev: rapportCorrect, cv: rapportCorrect, sox: reponse.sox === exercice.sox };
}

/** Étape 3 : les 3 champs (EV, CV, SOX) comparés en un seul essai (tout ou rien), plus la fonction
 * intermédiaire a(x-xS)² (translation + étirement/compression/réflexion, TV pas encore appliqué). */
export function diagnostiquerEvCvSox(exercice: ExerciceFormeCanoniqueTransformation, reponse: ReponseEvCvSox): StatutVerification {
  const statutForme = diagnostiquerFormeCanoniqueComplete(reponse.fonctionIntermediaire, fonctionCanoniqueReelle(exercice, 0));
  if (statutForme === "parse_error") return "parse_error";
  const evaluation = evaluerEvCvSox(exercice, reponse);
  const correct = evaluation.ev && evaluation.cv && evaluation.sox && statutForme === "correct";
  return correct ? "correct" : "not_equivalent";
}

export function verifierEvCvSox(exercice: ExerciceFormeCanoniqueTransformation, reponse: ReponseEvCvSox): boolean {
  return diagnostiquerEvCvSox(exercice, reponse) === "correct";
}

/** Étape 4 : le curseur TV comparé à yS (déjà confirmé à l'étape 1), plus la fonction finale
 * complète a(x-xS)²+yS. */
export function diagnostiquerTv(exercice: ExerciceFormeCanoniqueTransformation, reponse: ReponseTv): StatutVerification {
  const statutForme = diagnostiquerFormeCanoniqueComplete(reponse.fonctionIntermediaire, fonctionCanoniqueReelle(exercice, exercice.yS));
  if (statutForme === "parse_error") return "parse_error";
  const correct = reponse.tv === exercice.yS && statutForme === "correct";
  return correct ? "correct" : "not_equivalent";
}

export function verifierTv(exercice: ExerciceFormeCanoniqueTransformation, reponse: ReponseTv): boolean {
  return diagnostiquerTv(exercice, reponse) === "correct";
}

export interface FormeCanoniqueParsee {
  a: number;
  p: number;
  q: number;
}

/**
 * Analyseur structurel de la forme canonique complète (sections 1b/2/3/4 de la refonte) — exige la
 * structure `coefficient(x±p)^2±q` (ou `coefficient·x^2±q` si p=0, sans parenthèses — même
 * convention que le reste du projet : jamais "(x-0)"), jamais une forme développée même
 * algébriquement équivalente. Pivote sur la première occurrence de `^2` : tout ce qui précède doit
 * former exactement `<coef>(x<signe><p>)` ou `<coef>x` (bare), tout ce qui suit doit former
 * exactement `<signe><q>` ou rien (q=0) — un reliquat non numérique de part et d'autre (ex. un
 * terme en x supplémentaire d'une forme développée) fait échouer le parsing, `null` étant alors
 * l'unique signal de rejet structurel. Réutilise `parserNombreOuFraction`
 * (verificationAnalyseFonction.ts, "Analyse d'une fonction") pour chaque nombre/fraction isolé,
 * plutôt que de réinventer un parseur numérique.
 */
export function analyserFormeCanoniqueComplete(texteBrut: string): FormeCanoniqueParsee | null {
  const texte = normaliserExposantsUnicode(texteBrut.replace(/\s+/g, ""));
  const indexCaret = texte.indexOf("^2");
  if (indexCaret === -1) return null;

  const avant = texte.slice(0, indexCaret);
  const apres = texte.slice(indexCaret + 2);

  let coefTexte: string;
  let p: number;

  const matchParen = /^(.*)\(x([+-])([^()]+)\)$/.exec(avant);
  if (matchParen) {
    coefTexte = matchParen[1];
    const pBrut = parserNombreOuFraction(matchParen[3]);
    if (pBrut === null) return null;
    p = matchParen[2] === "-" ? pBrut : -pBrut;
  } else if (avant.endsWith("x") && !avant.includes("(") && !avant.includes(")")) {
    coefTexte = avant.slice(0, -1);
    p = 0;
  } else {
    return null;
  }

  let a: number;
  if (coefTexte === "" || coefTexte === "+") {
    a = 1;
  } else if (coefTexte === "-") {
    a = -1;
  } else {
    const aBrut = parserNombreOuFraction(coefTexte);
    if (aBrut === null) return null;
    a = aBrut;
  }

  let q = 0;
  if (apres !== "") {
    const matchQ = /^([+-])(.+)$/.exec(apres);
    if (!matchQ) return null;
    const qBrut = parserNombreOuFraction(matchQ[2]);
    if (qBrut === null) return null;
    q = matchQ[1] === "-" ? -qBrut : qBrut;
  }

  return { a, p, q };
}

const TOLERANCE_FORME_CANONIQUE = 1e-9;

/**
 * Statut à 3 valeurs (convention CLAUDE.md) : `analyserFormeCanoniqueComplete` calcule déjà en
 * interne la distinction "structure non reconnue" (`null`) vs "reconnue avec ces valeurs" (objet
 * `{a,p,q}`) — ce signal est récupéré ici directement, jamais recalculé (AUDIT-comparaison-
 * reponses.md) : `null` → "parse_error" (la saisie ne respecte pas le gabarit structurel
 * `coefficient(x±p)^2±q` attendu, jamais reconnue comme telle), objet parsé mais valeurs
 * incorrectes → "not_equivalent".
 */
export function diagnostiquerFormeCanoniqueComplete(texte: string, cible: FonctionCanonique): StatutVerification {
  const parsee = analyserFormeCanoniqueComplete(texte);
  if (!parsee) return "parse_error";
  const aCible = cible.numA / cible.denA;
  const correct =
    Math.abs(parsee.a - aCible) < TOLERANCE_FORME_CANONIQUE &&
    Math.abs(parsee.p - cible.p) < TOLERANCE_FORME_CANONIQUE &&
    Math.abs(parsee.q - cible.q) < TOLERANCE_FORME_CANONIQUE;
  return correct ? "correct" : "not_equivalent";
}

/** Compare la saisie (analysée structurellement) à une cible exacte a(x-p)²+q — rejette d'emblée
 * toute saisie que `analyserFormeCanoniqueComplete` ne reconnaît pas comme structurellement valide,
 * puis compare les 3 valeurs (a, p, q) avec tolérance (le coefficient `a` cible peut être un
 * rationnel non entier). */
export function verifierFormeCanoniqueComplete(texte: string, cible: FonctionCanonique): boolean {
  return diagnostiquerFormeCanoniqueComplete(texte, cible) === "correct";
}
