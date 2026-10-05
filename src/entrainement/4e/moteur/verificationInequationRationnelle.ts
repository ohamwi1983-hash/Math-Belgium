import type { Symbole } from "../core/inequation.types";
import type { Exercice } from "../core/generateur.types";
import type {
  ExerciceInequationRationnelleDenominateurCarre,
  ExerciceInequationRationnelleNiveau2,
  ExerciceInequationRationnelleNiveau3,
  ExerciceInequationRationnelleNiveau4,
  ExerciceInequationRationnelleSansFacteurCommun,
  GrilleQuotient,
  GrilleQuotientCubique,
  GrilleQuotientNiveau3,
  GrilleQuotientNiveau4,
} from "../core/inequationRationnelle.types";
import type { PolynomeLineaire } from "../core/simplification.types";
import { evaluerExpression } from "./expressionAlgebrique";
import type { StatutVerification } from "./statutVerification";
import { evaluerPolynomeOriginal } from "./verificationSimplification";

/**
 * Étape "grille" (niveaux 1-2) : comparaison structurelle des 3 lignes (numérateur, dénominateur,
 * quotient), notée en un seul essai global (même principe que verifierGrille — signesProduit). Ne
 * connaît rien de la signification des lignes, une simple égalité terme à terme suffit.
 */
export function verifierGrilleQuotient(saisie: GrilleQuotient, attendu: GrilleQuotient): boolean {
  return (
    ligneEgale(saisie.ligneNumerateur, attendu.ligneNumerateur) &&
    ligneEgale(saisie.ligneDenominateur, attendu.ligneDenominateur) &&
    ligneEgale(saisie.ligneQuotient, attendu.ligneQuotient)
  );
}

function ligneEgale<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * Étape "grille" (niveau 3) : même principe que verifierGrilleQuotient, généralisé aux 2 lignes N
 * (une par racine de P2_1) en plus de la ligne D et de la ligne quotient. `ligneCoefficient`
 * (promptgenerateur6inequationRationnelle.md, point 7 — présente uniquement pour denominateurCarre
 * avec un coefficient dominant négatif, jamais pour niveau3 lui-même) : comparée seulement quand
 * `attendu` en porte une ; la saisie doit alors aussi en porter une identique — jamais de ligne
 * fantôme acceptée ni manquante.
 */
export function verifierGrilleQuotientNiveau3(saisie: GrilleQuotientNiveau3, attendu: GrilleQuotientNiveau3): boolean {
  const coefficientOk =
    attendu.ligneCoefficient === undefined
      ? saisie.ligneCoefficient === undefined
      : saisie.ligneCoefficient !== undefined && ligneEgale(saisie.ligneCoefficient, attendu.ligneCoefficient);
  return (
    coefficientOk &&
    ligneEgale(saisie.lignesNumerateur[0], attendu.lignesNumerateur[0]) &&
    ligneEgale(saisie.lignesNumerateur[1], attendu.lignesNumerateur[1]) &&
    ligneEgale(saisie.ligneDenominateur, attendu.ligneDenominateur) &&
    ligneEgale(saisie.ligneQuotient, attendu.ligneQuotient)
  );
}

/**
 * Étape "grille" (niveau 4) : même principe que verifierGrilleQuotientNiveau3, généralisé aux 2
 * lignes D (une par dénominateur, P1_2 et P1_4) en plus des 2 lignes N et de la ligne quotient.
 */
export function verifierGrilleQuotientNiveau4(saisie: GrilleQuotientNiveau4, attendu: GrilleQuotientNiveau4): boolean {
  return (
    ligneEgale(saisie.lignesNumerateur[0], attendu.lignesNumerateur[0]) &&
    ligneEgale(saisie.lignesNumerateur[1], attendu.lignesNumerateur[1]) &&
    ligneEgale(saisie.lignesDenominateur[0], attendu.lignesDenominateur[0]) &&
    ligneEgale(saisie.lignesDenominateur[1], attendu.lignesDenominateur[1]) &&
    ligneEgale(saisie.ligneQuotient, attendu.ligneQuotient)
  );
}

/**
 * Étape "grille" (variante cubique, item b) : même principe que verifierGrilleQuotientNiveau3,
 * généralisé à 3 lignes N (le facteur x, plus les 2 racines du facteur quadratique restant) au
 * lieu de 2, avec une seule ligne D (P1_D, linéaire).
 */
export function verifierGrilleQuotientCubique(saisie: GrilleQuotientCubique, attendu: GrilleQuotientCubique): boolean {
  return (
    ligneEgale(saisie.lignesNumerateur[0], attendu.lignesNumerateur[0]) &&
    ligneEgale(saisie.lignesNumerateur[1], attendu.lignesNumerateur[1]) &&
    ligneEgale(saisie.lignesNumerateur[2], attendu.lignesNumerateur[2]) &&
    ligneEgale(saisie.ligneDenominateur, attendu.ligneDenominateur) &&
    ligneEgale(saisie.ligneQuotient, attendu.ligneQuotient)
  );
}

/**
 * Suffixes textuels acceptés pour chaque symbole, à la toute fin de la saisie (avant le "0" final)
 * — en plus du caractère unicode natif du projet (≤/≥, déjà utilisé partout ailleurs), on tolère
 * la forme ASCII "<="/">=" (plus simple à taper au clavier). "≤"/"<=" ne peuvent jamais être
 * confondus avec le symbole "<" seul : "<=0" ne termine pas par "<" immédiatement suivi de "0"
 * (le "=" s'intercale), donc aucun risque de faux positif entre symboles voisins.
 */
const SUFFIXES_PAR_SYMBOLE: Record<Symbole, RegExp[]> = {
  "<": [/<\s*0\s*$/],
  ">": [/>\s*0\s*$/],
  "≤": [/≤\s*0\s*$/, /<=\s*0\s*$/],
  "≥": [/≥\s*0\s*$/, />=\s*0\s*$/],
};

/** Retire le suffixe "◇ 0" attendu et retourne le préfixe (l'expression à évaluer), ou null si absent/mauvais symbole. */
function retirerSuffixeSymboleZero(texte: string, symbole: Symbole): string | null {
  for (const regex of SUFFIXES_PAR_SYMBOLE[symbole]) {
    if (regex.test(texte)) return texte.replace(regex, "");
  }
  return null;
}

/**
 * Retire N'IMPORTE QUEL suffixe de comparaison connu (les 4 symboles confondus, pas seulement
 * celui attendu) — utilisée uniquement pour la vérification de lisibilité en cas d'échec de
 * `retirerSuffixeSymboleZero` : un élève qui se trompe de symbole (ex. "≤" au lieu du "≥" attendu)
 * a écrit une algèbre par ailleurs lisible, ce n'est pas un texte illisible — jamais confondre les
 * deux (promptcorrectionsgenerateurs76complement.md, point 2.2).
 */
function retirerNimporteQuelSuffixeSymbole(texte: string): string {
  for (const suffixes of Object.values(SUFFIXES_PAR_SYMBOLE)) {
    for (const regex of suffixes) {
      if (regex.test(texte)) return texte.replace(regex, "");
    }
  }
  return texte;
}

/** Points d'échantillonnage non entiers — jamais égaux à une CE (toujours un entier par construction). */
const POINTS_ISOLEMENT = [-6.5, -4.25, -3.5, -2.25, -1.5, 1.25, 2.75, 4.5, 6.25];

/**
 * Vérification "isoler" générique, partagée entre niveaux 2 et 3 : exige le symbole donné suivi de
 * "0" en fin de saisie (jamais recalculé, voir verifierFormeCanonique — exercice 1), puis compare
 * par échantillonnage numérique (evaluerExpression, qui supporte déjà la division) l'expression
 * saisie à `reference(x)`, fournie par l'appelant. "Flexible" signifie : n'importe quelle écriture
 * algébriquement équivalente de la MÊME expression est acceptée — contrairement à
 * coefficientsProportionnels (exercice 1), aucune mise à l'échelle n'est tolérée : multiplier une
 * inéquation par un facteur peut en inverser le sens, ce qui la rendrait différente de celle
 * demandée si le symbole affiché reste inchangé.
 */
function diagnostiquerIsolementGenerique(
  expressionSaisie: string,
  symbole: Symbole,
  reference: (x: number) => number,
  tolerance: number,
): StatutVerification {
  // Suffixe "◇ 0" absent/mauvais symbole : un manquement à la consigne d'isolement, pas
  // nécessairement une syntaxe illisible (voir diagnostiquerFormeCanonique, exercice 1, même
  // principe) — mais un texte réellement illisible (ex. "Jui", aucun symbole de comparaison nulle
  // part) doit rester signalé parse_error même sans le bon suffixe : les deux manquements sont
  // distincts, donc le texte est encore vérifié syntaxiquement (après retrait d'un éventuel
  // suffixe, même incorrect) avant de conclure "not_equivalent".
  const texte = expressionSaisie.trim();
  const prefixe = retirerSuffixeSymboleZero(texte, symbole);
  if (prefixe === null) {
    try {
      evaluerExpression(retirerNimporteQuelSuffixeSymbole(texte), 0);
    } catch {
      return "parse_error";
    }
    return "not_equivalent";
  }

  try {
    evaluerExpression(prefixe, 0);
  } catch {
    return "parse_error";
  }
  const equivalent = POINTS_ISOLEMENT.every((x) => Math.abs(evaluerExpression(prefixe, x) - reference(x)) < tolerance);
  return equivalent ? "correct" : "not_equivalent";
}

/** Étape "isoler" (niveau 2) : P1_1/P1_2 - k ◇ 0. */
export function diagnostiquerIsolementRationnelle(
  expressionSaisie: string,
  exercice: ExerciceInequationRationnelleNiveau2,
  tolerance = 1e-6,
): StatutVerification {
  const { numerateurAvantCombinaison, denominateur, k } = exercice;
  return diagnostiquerIsolementGenerique(
    expressionSaisie,
    exercice.symbole,
    (x) => (numerateurAvantCombinaison.k * (x - numerateurAvantCombinaison.p)) / (denominateur.k * (x - denominateur.p)) - k,
    tolerance,
  );
}

export function verifierIsolementRationnelle(
  expressionSaisie: string,
  exercice: ExerciceInequationRationnelleNiveau2,
  tolerance = 1e-6,
): boolean {
  return diagnostiquerIsolementRationnelle(expressionSaisie, exercice, tolerance) === "correct";
}

/** Étape "isoler" (niveau 3) : P1_1/P1_2 - P1_3(x) ◇ 0 (P1_3 un polynôme du 1er degré, pas une constante). */
export function diagnostiquerIsolementRationnelleNiveau3(
  expressionSaisie: string,
  exercice: ExerciceInequationRationnelleNiveau3,
  tolerance = 1e-6,
): StatutVerification {
  const { numerateurAvantCombinaison, denominateur, p1_3 } = exercice;
  return diagnostiquerIsolementGenerique(
    expressionSaisie,
    exercice.symbole,
    (x) =>
      (numerateurAvantCombinaison.k * (x - numerateurAvantCombinaison.p)) / (denominateur.k * (x - denominateur.p)) -
      p1_3.k * (x - p1_3.p),
    tolerance,
  );
}

export function verifierIsolementRationnelleNiveau3(
  expressionSaisie: string,
  exercice: ExerciceInequationRationnelleNiveau3,
  tolerance = 1e-6,
): boolean {
  return diagnostiquerIsolementRationnelleNiveau3(expressionSaisie, exercice, tolerance) === "correct";
}

/** Étape "isoler" (niveau 4) : P1_1/P1_2 - P1_3/P1_4 ◇ 0 (quatre polynômes du 1er degré). */
export function diagnostiquerIsolementRationnelleNiveau4(
  expressionSaisie: string,
  exercice: ExerciceInequationRationnelleNiveau4,
  tolerance = 1e-6,
): StatutVerification {
  const { numerateurGaucheAvantCombinaison: p1_1, denominateurGauche: p1_2, numerateurDroitAvantCombinaison: p1_3, denominateurDroit: p1_4 } =
    exercice;
  return diagnostiquerIsolementGenerique(
    expressionSaisie,
    exercice.symbole,
    (x) => (p1_1.k * (x - p1_1.p)) / (p1_2.k * (x - p1_2.p)) - (p1_3.k * (x - p1_3.p)) / (p1_4.k * (x - p1_4.p)),
    tolerance,
  );
}

export function verifierIsolementRationnelleNiveau4(
  expressionSaisie: string,
  exercice: ExerciceInequationRationnelleNiveau4,
  tolerance = 1e-6,
): boolean {
  return diagnostiquerIsolementRationnelleNiveau4(expressionSaisie, exercice, tolerance) === "correct";
}

/**
 * Étape "isoler" (variante dénominateur au carré) : A/(P1_2)² - k ◇ 0. P1_2 étant toujours monique
 * (k=1, voir core/inequationRationnelle.types.ts), (P1_2(x))² = (x-p)² directement.
 */
export function diagnostiquerIsolementDenominateurCarre(
  expressionSaisie: string,
  exercice: ExerciceInequationRationnelleDenominateurCarre,
  tolerance = 1e-6,
): StatutVerification {
  const { A, k, denominateur } = exercice;
  return diagnostiquerIsolementGenerique(
    expressionSaisie,
    exercice.symbole,
    (x) => A / (denominateur.k * (x - denominateur.p)) ** 2 - k,
    tolerance,
  );
}

export function verifierIsolementDenominateurCarre(
  expressionSaisie: string,
  exercice: ExerciceInequationRationnelleDenominateurCarre,
  tolerance = 1e-6,
): boolean {
  return diagnostiquerIsolementDenominateurCarre(expressionSaisie, exercice, tolerance) === "correct";
}

/**
 * Étape "isoler" (variante sans facteur commun, item f) : N(x)/D(x) - k ◇ 0, où N et D sont tous
 * deux du 2nd degré (`numerateurAvantCombinaison`/`denominateur.enonce`) — même principe que
 * verifierIsolementDenominateurCarre, juste une évaluation quadratique/quadratique au lieu de
 * A/(x-p)².
 */
export function diagnostiquerIsolementSansFacteurCommun(
  expressionSaisie: string,
  exercice: ExerciceInequationRationnelleSansFacteurCommun,
  tolerance = 1e-6,
): StatutVerification {
  const { numerateurAvantCombinaison: n, denominateur, k } = exercice;
  const d = denominateur.enonce;
  return diagnostiquerIsolementGenerique(
    expressionSaisie,
    exercice.symbole,
    (x) => (n.a * x * x + n.b * x + n.c) / (d.a * x * x + d.b * x + d.c) - k,
    tolerance,
  );
}

export function verifierIsolementSansFacteurCommun(
  expressionSaisie: string,
  exercice: ExerciceInequationRationnelleSansFacteurCommun,
  tolerance = 1e-6,
): boolean {
  return diagnostiquerIsolementSansFacteurCommun(expressionSaisie, exercice, tolerance) === "correct";
}

const POINTS_COMBINER = [-4, -3, -2, -1, 1, 2, 3, 4];

/**
 * Étape "combiner" (niveau 2) : le dénominateur P1_2 est affiché fixe (non saisi) ; l'élève ne
 * saisit que le numérateur une fois les termes combinés sur ce même dénominateur — vérifié par
 * développement/comparaison numérique à P1_3, jamais par comparaison de chaîne (même principe que
 * verifierSimplification/verifierFractionSimplifiee ailleurs).
 *
 * VIGILANCE (aucun changement de logique ici — documentation uniquement) : cette vérification
 * n'a AUCUNE garde structurelle, seulement une équivalence numérique à `p1_3`. Sa sûreté actuelle
 * dépend entièrement du fait que `p1_3` (le numérateur combiné attendu) est mathématiquement
 * DISTINCT de tout ce qui a déjà été montré à l'élève à cette étape (les numérateurs non combinés
 * des fractions de départ) — si un futur changement de ce générateur en venait à afficher, à une
 * étape antérieure, une expression algébriquement identique à `p1_3`, une recopie de cette
 * expression serait acceptée à tort ici, exactement le défaut trouvé sur "Centre et rayon d'un
 * cercle depuis l'équation développée"/"Sommet, foyer, p et directrice d'une parabole depuis
 * l'équation développée" — voir l'audit du 2026-08-10 sur gen50/gen52 pour un exemple du même
 * défaut ailleurs sur la plateforme (`docs/historique-chapitre6.md`).
 */
export function diagnostiquerCombiner(expressionSaisie: string, p1_3: PolynomeLineaire, tolerance = 1e-6): StatutVerification {
  try {
    evaluerExpression(expressionSaisie, 0);
  } catch {
    return "parse_error";
  }
  const equivalent = POINTS_COMBINER.every((x) => Math.abs(evaluerExpression(expressionSaisie, x) - p1_3.k * (x - p1_3.p)) < tolerance);
  return equivalent ? "correct" : "not_equivalent";
}

export function verifierCombiner(expressionSaisie: string, p1_3: PolynomeLineaire, tolerance = 1e-6): boolean {
  return diagnostiquerCombiner(expressionSaisie, p1_3, tolerance) === "correct";
}

/**
 * Étape "combiner" (niveau 3) : même principe que verifierCombiner, mais le numérateur combiné
 * (P2_1) est du 2nd degré — l'élève saisit "ax²+bx+c" développé, comparé par échantillonnage à
 * l'évaluation directe des coefficients réels de P2_1 (evaluerPolynomeOriginal, déjà réutilisée
 * pour l'exercice "Simplifier").
 *
 * VIGILANCE (aucun changement de logique ici — documentation uniquement) : même remarque que
 * `diagnostiquerCombiner` ci-dessus — équivalence numérique pure, aucune garde structurelle, sûre
 * uniquement tant que `p2_1` reste distinct de tout ce qui est déjà affiché à l'élève avant cette
 * étape — voir l'audit du 2026-08-10 sur gen50/gen52 pour un exemple du même défaut ailleurs sur
 * la plateforme (`docs/historique-chapitre6.md`).
 */
export function diagnostiquerCombinerQuadratique(expressionSaisie: string, p2_1: Exercice, tolerance = 1e-6): StatutVerification {
  try {
    evaluerExpression(expressionSaisie, 0);
  } catch {
    return "parse_error";
  }
  const equivalent = POINTS_COMBINER.every(
    (x) => Math.abs(evaluerExpression(expressionSaisie, x) - evaluerPolynomeOriginal(p2_1, x)) < tolerance,
  );
  return equivalent ? "correct" : "not_equivalent";
}

export function verifierCombinerQuadratique(expressionSaisie: string, p2_1: Exercice, tolerance = 1e-6): boolean {
  return diagnostiquerCombinerQuadratique(expressionSaisie, p2_1, tolerance) === "correct";
}
