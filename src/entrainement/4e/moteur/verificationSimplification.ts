import type { ExerciceSimplification, PolynomeLineaire } from "../core/simplification.types";
import type { Exercice } from "../core/generateur.types";
import { diagnostiquerFormeFactorisee, diagnostiquerMiseEnEvidenceConstante, evaluerExpression } from "./expressionAlgebrique";
import { enonceSimplifie } from "./simplificationEquation";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 1e-6;
/** 8 points suffisent à prouver l'identité de deux polynômes de degré ≤ 4 (P2×P2) par échantillonnage. */
const POINTS_ECHANTILLONNAGE = [-4, -3, -2, -1, 1, 2, 3, 4];

function estPolynomeLineaire(poly: Exercice | PolynomeLineaire): poly is PolynomeLineaire {
  return "k" in poly;
}

/** Exportée : réutilisée par verifierCombinerQuadratique (verificationInequationRationnelle.ts, niveau 3). */
export function evaluerPolynomeOriginal(poly: Exercice | PolynomeLineaire, x: number): number {
  if (estPolynomeLineaire(poly)) return poly.k * (x - poly.p);
  const { a, b, c } = poly.enonce;
  return a * x * x + b * x + c;
}

/**
 * Étapes "denomReduction"/"numReduction" (nouvelles, prompt utilisateur du 26/09 — généralise à ce
 * générateur l'étape déjà présente sur gen1/gen2) : réduit UN polynôme P2 seul (numérateur ou
 * dénominateur, avant sa propre reconnaissance/factorisation) à pgcd(|a|,|b|,|c|)=1 — jamais "=0",
 * jamais la fraction entière, contrairement à diagnostiquerSimplification ci-dessous. Réutilise
 * directement diagnostiquerFormeFactorisee (expressionAlgebrique.ts, déjà partagée par plusieurs
 * générateurs) et enonceSimplifie (simplificationEquation.ts, gen1 — même contrat Exercice/Enonce,
 * Couche B ↔ Couche B, autorisé par CLAUDE.md).
 */
export function diagnostiquerReductionCoefficients(poly: Exercice, valeurSaisie: string): StatutVerification {
  return diagnostiquerFormeFactorisee(valeurSaisie, enonceSimplifie(poly.enonce));
}

/**
 * Pendant de `diagnostiquerReductionCoefficients` ci-dessus, mais pour un polynôme qui est le
 * numérateur/dénominateur d'une FRACTION dont la valeur doit rester exactement celle de l'énoncé
 * (gen3 "Simplifier une fraction rationnelle", gen4 fractionGauche, gen6 facteurCommun) —
 * contrairement à une équation/inéquation "...◇0" (gen1/gen2/gen5, et gen6 hors facteurCommun),
 * où diviser tout le polynôme par le facteur commun ne change ni les racines ni le signe et donc
 * jamais la solution, diviser SEULEMENT le numérateur ou SEULEMENT le dénominateur d'une fraction
 * change sa valeur réelle pour tout x : demande donc une MISE EN ÉVIDENCE (facteur conservé,
 * visible dans la réponse), jamais une division qui le ferait disparaître. Bug confirmé
 * empiriquement (capture d'écran utilisateur du 26/09, gen3) : (x+4)/(2x²-4x-48) affichait
 * silencieusement, à l'écran suivant, "D(x) = x²-2x-24" — soit (x+4)/(x²-2x-24), une fraction
 * différente (valeur multipliée par 2). N'appelle donc jamais `exerciceSimplifie` : le polynôme
 * n'est jamais remplacé, seule cette étape de mise en évidence est ajoutée avant la
 * reconnaissance/factorisation habituelle, qui continue de travailler sur le polynôme d'origine
 * exactement comme avant l'ajout de cette étape.
 */
export function diagnostiquerMiseEnEvidenceFraction(poly: Exercice, valeurSaisie: string): StatutVerification {
  return diagnostiquerMiseEnEvidenceConstante(valeurSaisie, poly.enonce);
}

/**
 * true ssi le P1 a un facteur commun réel à mettre en évidence (k≠±1) — même principe que
 * necessiteSimplification (pgcd trivial) côté P2 : pilote si l'étape "denomReductionP1"/
 * "numReductionP1" a lieu pour cet exercice (sessionSimplification.ts).
 */
export function necessiteMiseEnEvidenceP1(poly: PolynomeLineaire): boolean {
  return Math.abs(poly.k) !== 1;
}

/**
 * Pendant de `diagnostiquerMiseEnEvidenceFraction` ci-dessus, mais pour un P1 (gen3 image 6/7 du
 * prompt du 27/09) : le numérateur/dénominateur "k(x-p)" d'une fraction n'était jusqu'ici jamais
 * affiché développé ni mis en évidence par l'élève lui-même (`PolynomeLineaire` porte directement
 * la forme factorisée, "pas de technique à reconnaître" — voir core/simplification.types.ts) ;
 * demande désormais la même démarche que pour un P2 avant toute autre question sur ce côté.
 * Construit l'Enonce {a:0, b:k, c:-kp} correspondant à la forme développée "kx-kp" pour réutiliser
 * diagnostiquerMiseEnEvidenceConstante telle quelle (déjà compatible degré 1, voir
 * expressionAlgebrique.ts::extraireCoefficientsSiPolynomeDegre2, qui n'exige pas a≠0).
 */
export function diagnostiquerMiseEnEvidenceP1(poly: PolynomeLineaire, valeurSaisie: string): StatutVerification {
  return diagnostiquerMiseEnEvidenceConstante(valeurSaisie, { a: 0, b: poly.k, c: -poly.k * poly.p });
}

/** Étape "CE directe" (type P2/P1) : comparaison numérique exacte à la racine du dénominateur P1. */
export function verifierCEDirecte(valeurSaisie: string, racineAttendue: number): boolean {
  // Virgule décimale française normalisée vers le point (AUDIT-comparaison-réponses.md).
  const valeur = Number(valeurSaisie.trim().replace(",", "."));
  return Number.isFinite(valeur) && Math.abs(valeur - racineAttendue) < TOLERANCE;
}

/**
 * Étape "Simplification" (section 4 de la spec) : vérifie par produit en croix que la fraction
 * saisie est équivalente à la fraction d'origine (développement par échantillonnage plutôt que
 * développement symbolique — même style que expressionAlgebrique.ts), puis vérifie
 * structurellement qu'une vraie simplification a eu lieu (le dénominateur saisi ne doit plus
 * s'annuler en la racine commune).
 */
/**
 * Statut à 3 valeurs (convention CLAUDE.md) : les deux champs (numérateur/dénominateur saisis)
 * sont validés syntaxiquement une seule fois, à un point arbitraire (x=0) — un échec de
 * tokenisation ne dépend jamais de x, seule l'évaluation en dépend et celle-ci ne lève jamais
 * d'exception (division par zéro → Infinity/NaN, jamais un throw). Valider une fois en amont
 * évite de dupliquer la distinction try/catch à chaque point d'échantillonnage.
 */
export function diagnostiquerSimplification(
  exercice: ExerciceSimplification,
  numerateurSaisi: string,
  denominateurSaisi: string,
): StatutVerification {
  try {
    evaluerExpression(numerateurSaisi, 0);
    evaluerExpression(denominateurSaisi, 0);
  } catch {
    return "parse_error";
  }

  const equivalente = POINTS_ECHANTILLONNAGE.every((x) => {
    const gauche = evaluerExpression(numerateurSaisi, x) * evaluerPolynomeOriginal(exercice.denominateur, x);
    const droite = evaluerExpression(denominateurSaisi, x) * evaluerPolynomeOriginal(exercice.numerateur, x);
    return Math.abs(gauche - droite) < TOLERANCE;
  });
  if (!equivalente) return "not_equivalent";

  const denominateurEnP = evaluerExpression(denominateurSaisi, exercice.racineCommune);
  return Math.abs(denominateurEnP) >= TOLERANCE ? "correct" : "not_equivalent";
}

export function verifierSimplification(
  exercice: ExerciceSimplification,
  numerateurSaisi: string,
  denominateurSaisi: string,
): boolean {
  return diagnostiquerSimplification(exercice, numerateurSaisi, denominateurSaisi) === "correct";
}
