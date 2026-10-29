/**
 * Couche B — vérification propre à "Équation d'une droite". Dispatch fin sur les primitives
 * partagées de `verificationDroite.ts` (moteur→moteur, toujours autorisé) — jamais de logique de
 * comparaison réécrite ici.
 */
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import type { Composantes, Point } from "../core/vecteur.types";
import type { StatutVerification } from "./statutVerification";
import {
  combinerStatuts,
  diagnostiquerEquationDroiteLibre,
  diagnostiquerPointVecteurParametrique,
  diagnostiquerRepresentationParametriqueTexte,
  parserExpressionLineaireXY,
  statutNumerique,
  statutTripletProportionnel,
} from "./verificationDroite";

/** Signes moins typographiques (« − », « – », « — », produits par un clavier mobile ou un
 * copier-coller du cours) et point médian « · » de multiplication : ramenés à « - » et « * » avant
 * toute lecture — sinon « y = −2x + 1 » était jugé illisible (audit chapitre 7, point 4). */
export function normaliserSaisieEquation(texte: string): string {
  return texte.replace(/[\u2212\u2013\u2014]/g, "-").replace(/\u00b7/g, "*");
}

// ============================================================================
// Écran 1 — extraction commune (point + vecteur directeur).
// ============================================================================

export interface ReponseExtraction {
  x0: number;
  y0: number;
  a: number;
  b: number;
}

export function diagnostiquerExtraction(exercice: ExerciceEquationDroite, reponse: ReponseExtraction): StatutVerification {
  const point: Point = { x: reponse.x0, y: reponse.y0 };
  const vecteur: Composantes = { x: reponse.a, y: reponse.b };
  return diagnostiquerPointVecteurParametrique(point, vecteur, exercice.referenceImplicite, exercice.vecteur);
}

export function verifierExtraction(exercice: ExerciceEquationDroite, reponse: ReponseExtraction): boolean {
  return diagnostiquerExtraction(exercice, reponse) === "correct";
}

// ============================================================================
// Écran fusionné "possibilité + équation" — formes explicite_y/explicite_x uniquement
// (`promptgen42modificationsv2.md`, partie A) : remplace l'ancien couple "possibilite" +
// "coefficients" séparés par un seul écran. Le champ texte libre est vérifié par
// `diagnostiquerEquationDroiteLibre` (module frère, déjà réutilisé par "Lecture graphique —
// équation d'une droite"/"Relations entre droites"/"Distance point-droite et droite-droite") — il
// accepte N'IMPORTE QUELLE forme valide de la droite. Si l'élève répond "possible", la forme testée
// est en plus EXIGÉE (`formeExpliciteRespectee` — audit chapitre 7, point 11 : « 4x−3y+13=0 » était
// accepté alors que y = mx + p était demandé). Si l'élève répond "impossible", toute équation de la
// droite reste acceptée (la forme implicite de secours, ou x = k / y = k).
// ============================================================================

/** Vrai si `texte` (équation déjà lisible) est écrit sous la forme explicite demandée : un membre
 * réduit à la variable isolée (`y` pour explicite_y, `x` pour explicite_x, coefficient 1, sans
 * constante), l'autre membre sans cette variable. Les deux sens d'écriture sont admis
 * (« y = 2x + 1 » comme « 2x + 1 = y »). */
export function formeExpliciteRespectee(texte: string, forme: "explicite_y" | "explicite_x"): boolean {
  const cotes = normaliserSaisieEquation(texte).split("=");
  if (cotes.length !== 2) return false;
  const membres = cotes.map((cote) => parserExpressionLineaireXY(cote));
  if (membres[0] === null || membres[1] === null) return false;
  const coefIsole = (m: { coefX: number; coefY: number }) => (forme === "explicite_y" ? m.coefY : m.coefX);
  const coefAutre = (m: { coefX: number; coefY: number }) => (forme === "explicite_y" ? m.coefX : m.coefY);
  const estVariableSeule = (m: { coefX: number; coefY: number; constante: number }) => coefIsole(m) === 1 && coefAutre(m) === 0 && m.constante === 0;
  const [gauche, droite] = membres;
  return (estVariableSeule(gauche) && coefIsole(droite) === 0) || (estVariableSeule(droite) && coefIsole(gauche) === 0);
}

export interface ReponsePossibiliteCoefficients {
  choix: "possible" | "impossible";
  texte: string;
}

export function diagnostiquerPossibiliteCoefficients(exercice: ExerciceEquationDroite, reponse: ReponsePossibiliteCoefficients): StatutVerification {
  const statutTexte = diagnostiquerEquationDroiteLibre(normaliserSaisieEquation(reponse.texte), exercice.referenceImplicite);
  if (statutTexte === "parse_error") return "parse_error";
  const choixCorrect = (reponse.choix === "possible") === exercice.possible;
  if (!choixCorrect || statutTexte !== "correct") return "not_equivalent";
  if (reponse.choix === "possible" && (exercice.formeCible === "explicite_y" || exercice.formeCible === "explicite_x")) {
    return formeExpliciteRespectee(reponse.texte, exercice.formeCible) ? "correct" : "not_equivalent";
  }
  return "correct";
}

/** Bonne droite, bon choix « Possible », mais pas écrite sous la forme demandée — sert uniquement à
 * un message d'erreur plus précis à l'écran (`EtapePossibiliteCoefficientsEquationDroite.tsx`). */
export function estBonneDroiteMauvaiseForme(exercice: ExerciceEquationDroite, reponse: ReponsePossibiliteCoefficients): boolean {
  if (reponse.choix !== "possible" || !exercice.possible) return false;
  if (exercice.formeCible !== "explicite_y" && exercice.formeCible !== "explicite_x") return false;
  return diagnostiquerEquationDroiteLibre(normaliserSaisieEquation(reponse.texte), exercice.referenceImplicite) === "correct" && !formeExpliciteRespectee(reponse.texte, exercice.formeCible);
}

export function verifierPossibiliteCoefficients(exercice: ExerciceEquationDroite, reponse: ReponsePossibiliteCoefficients): boolean {
  return diagnostiquerPossibiliteCoefficients(exercice, reponse) === "correct";
}

// ============================================================================
// Écran 3 — coefficients de la forme cible.
// ============================================================================

/** Saisie en 2 champs de texte libre (`promptgen42modifications.md`, point 2) — plus une
 * comparaison numérique de 4 valeurs par proportionnalité, `x0`/`y0`/`a`/`b` sont désormais
 * EXTRAITS de chaque expression par `diagnostiquerRepresentationParametriqueTexte`, jamais saisis
 * directement. */
export interface ReponseParametrique {
  texteX: string;
  texteY: string;
}
export interface ReponseImplicite {
  a: number;
  b: number;
  c: number;
}
export interface ReponseExpliciteY {
  m: number;
  p: number;
}
export interface ReponseExpliciteX {
  n: number;
  q: number;
}

export function diagnostiquerParametrique(exercice: ExerciceEquationDroite, reponse: ReponseParametrique): StatutVerification {
  return diagnostiquerRepresentationParametriqueTexte(normaliserSaisieEquation(reponse.texteX), normaliserSaisieEquation(reponse.texteY), exercice.referenceImplicite, exercice.vecteur);
}

export function diagnostiquerImplicite(exercice: ExerciceEquationDroite, reponse: ReponseImplicite): StatutVerification {
  return statutTripletProportionnel(reponse, exercice.referenceImplicite);
}

export function diagnostiquerExpliciteY(exercice: ExerciceEquationDroite, reponse: ReponseExpliciteY): StatutVerification {
  if (exercice.refExpliciteY === null) return "parse_error";
  return combinerStatuts(statutNumerique(reponse.m, exercice.refExpliciteY.m), statutNumerique(reponse.p, exercice.refExpliciteY.p));
}

export function diagnostiquerExpliciteX(exercice: ExerciceEquationDroite, reponse: ReponseExpliciteX): StatutVerification {
  if (exercice.refExpliciteX === null) return "parse_error";
  return combinerStatuts(statutNumerique(reponse.n, exercice.refExpliciteX.n), statutNumerique(reponse.q, exercice.refExpliciteX.q));
}
