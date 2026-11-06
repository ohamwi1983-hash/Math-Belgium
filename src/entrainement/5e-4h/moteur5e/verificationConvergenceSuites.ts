/**
 * Couche B (5e) — vérification pour 5gen16 ("Convergence et divergence des suites"). N'importe
 * jamais rien de `src/generateurs5e/`. Réutilise DIRECTEMENT (moteur→moteur) `diagnostiquerNombre`
 * (`verificationSuiteArithmetique.ts`, 5gen14) pour la valeur numérique de la limite quand
 * `degP===degQ`.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre } from "./verificationSuiteArithmetique";
import type { ClassificationArithmetique, ClassificationGeometrique, ClassificationQuelconque, ExerciceConvergenceArithmetique, ExerciceConvergenceGeometrique, ExerciceConvergenceQuelconque, PolynomeConvergence } from "../core5e/convergenceSuites.types";

export function verifierClassificationArithmetique(choix: ClassificationArithmetique, exercice: ExerciceConvergenceArithmetique): boolean {
  return choix === exercice.classification;
}

export function verifierClassificationGeometrique(choix: ClassificationGeometrique, exercice: ExerciceConvergenceGeometrique): boolean {
  return choix === exercice.classification;
}

function evaluerPolynome(p: PolynomeConvergence, n: number): number {
  return p.a * n * n + p.b * n + p.c;
}

const POINTS_ECHANTILLON = [1, 2, 3, 5, -2, -3, 7];

/** Renomme "n" en "x" par un lookaround "ni précédé ni suivi d'une lettre" — jamais `\bn\b` (`\b` ne
 * matche jamais entre un chiffre et une lettre, donc casse silencieusement "2n"), même technique
 * déjà en place ailleurs sur ce chantier pour ce genre de renommage de variable (`substituerHParX`,
 * `verificationDefinitionDerivee.ts` ; `substituerVariable`, `verificationOptimisationGeometrique.ts`). */
function substituerNParX(texte: string): string {
  return texte.replace(/(?<![a-zA-Z])n(?![a-zA-Z])/gi, "x");
}

/** Écran "diviserQuelconque" — équivalence algébrique EXACTE (pas asymptotique) entre le texte
 * soumis et P(n)/Q(n) évalué directement depuis les coefficients : diviser numérateur ET
 * dénominateur par la MÊME quantité non nulle préserve la valeur pour tout n≠0, quelle que soit la
 * puissance choisie — seule une division INCOHÉRENTE entre les 2 membres (le vrai piège) change la
 * valeur et est donc détectée ici. Variable "n" substituée en "x" avant délégation à
 * `evaluerExpressionGenerale` (qui ne reconnaît que "x", même piège déjà rencontré côté 5gen14). */
export function diagnostiquerDiviserQuelconque(texte: string, exercice: ExerciceConvergenceQuelconque): StatutVerification {
  const statut = equivalenceDiviserQuelconque(texte, exercice);
  if (statut !== "correct") return statut;
  // Équivalente : encore faut-il que ce soit LA division demandée (décision J).
  return erreurDivisionQuelconque(texte) === null ? "correct" : "not_equivalent";
}

/** Erreur de MÉTHODE seulement : saisie équivalente à uₙ mais qui n'est pas la division demandée.
 * `null` si la saisie est juste, illisible ou simplement fausse (message générique dans ces cas). */
export function erreurMethodeDiviserQuelconque(texte: string, exercice: ExerciceConvergenceQuelconque): ErreurDivision | null {
  return equivalenceDiviserQuelconque(texte, exercice) === "correct" ? erreurDivisionQuelconque(texte) : null;
}

/** Équivalence algébrique exacte de la saisie avec P(n)/Q(n) (voir le commentaire ci-dessus). */
function equivalenceDiviserQuelconque(texte: string, exercice: ExerciceConvergenceQuelconque): StatutVerification {
  try {
    const expr = substituerNParX(texte);
    for (const n of POINTS_ECHANTILLON) {
      const qn = evaluerPolynome(exercice.Q, n);
      if (Math.abs(qn) < 1e-6) continue; // point pathologique (racine de Q), échantillon suivant
      const cible = evaluerPolynome(exercice.P, n) / qn;
      const valeur = evaluerExpressionGenerale(expr, n);
      if (!Number.isFinite(valeur)) return "parse_error";
      if (Math.abs(valeur - cible) > 1e-4 * Math.max(1, Math.abs(cible))) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/**
 * Découpe la saisie en `numérateur / dénominateur` au niveau 0 des parenthèses — le dernier « / »
 * de niveau 0 (la division est associative à gauche : `a/b/c` = `(a/b)/c`, le dénominateur est `c`).
 * `null` si la saisie n'est pas UNE fraction : aucun « / » de niveau 0, ou un « + »/« − » binaire de
 * niveau 0 (somme de plusieurs fractions). Un signe en tête (`-(…)/(…)`) est accepté.
 */
export function decouperFraction(texte: string): { numerateur: string; denominateur: string } | null {
  const t = texte.replace(/[\u2212\u2013]/g, "-").trim();
  let profondeur = 0;
  let dernierSlash = -1;
  let precedentSignificatif = "";
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "(" || c === "[") profondeur++;
    else if (c === ")" || c === "]") profondeur--;
    else if (profondeur === 0) {
      if (c === "/") dernierSlash = i;
      // « + »/« − » binaire de niveau 0 : précédé d'un opérande (chiffre, lettre, parenthèse fermante),
      // et pas d'une notation scientifique (« 2e-3 »).
      if ((c === "+" || c === "-") && /[0-9a-zA-Z)\]]/.test(precedentSignificatif) && !/[0-9][eE]$/.test(t.slice(0, i).replace(/\s+/g, ""))) return null;
    }
    if (!/\s/.test(c)) precedentSignificatif = c;
  }
  if (dernierSlash < 0) return null;
  const numerateur = t.slice(0, dernierSlash).trim();
  const denominateur = t.slice(dernierSlash + 1).trim();
  if (numerateur === "" || denominateur === "") return null;
  return { numerateur, denominateur };
}

/** Erreur de méthode détectée à l'écran « Diviser » — chaque cas a son message ciblé à l'écran. */
export type ErreurDivision = "pasUneFraction" | "pasDivise" | "puissanceTropElevee";

/**
 * Décision J (audit 5c3b point 4) : l'écran « Diviser » vérifie la COMPÉTENCE (diviser par la plus
 * haute puissance de n du dénominateur), plus seulement l'équivalence. Une fois l'équivalence
 * acquise, on lit le dénominateur saisi pour n très grand :
 * - il tend vers l'infini → rien n'a été divisé, ou par une puissance trop basse (énoncé recopié) ;
 * - il tend vers 0 → division par une puissance trop élevée (n³, ou n² quand Q est de degré 1) ;
 * - il tend vers un nombre non nul → division par la bonne puissance (à un facteur constant près,
 *   ex. numérateur et dénominateur ensuite multipliés par 2 : toujours juste).
 * `null` = aucune erreur de méthode.
 */
export function erreurDivisionQuelconque(texte: string): ErreurDivision | null {
  const fraction = decouperFraction(texte);
  if (fraction === null) return "pasUneFraction";
  try {
    const den = substituerNParX(fraction.denominateur);
    const d6 = evaluerExpressionGenerale(den, 1e6);
    const d7 = evaluerExpressionGenerale(den, 1e7);
    if (!Number.isFinite(d6) || !Number.isFinite(d7)) return "pasDivise";
    if (Math.abs(d7) > 2 * Math.abs(d6) && Math.abs(d6) > 1e3) return "pasDivise";
    if (Math.abs(d6) < 1e-3 && Math.abs(d7) <= Math.abs(d6) + 1e-12) return "puissanceTropElevee";
    return null;
  } catch {
    return "pasUneFraction";
  }
}

export const MESSAGE_ERREUR_DIVISION: Record<ErreurDivision, string> = {
  pasUneFraction: "Écris uₙ sous la forme d'une seule fraction : (numérateur)/(dénominateur).",
  pasDivise: "Ton dénominateur tend encore vers l'infini : divise chaque terme par la plus haute puissance de n du dénominateur.",
  puissanceTropElevee: "Ton dénominateur tend vers 0 : tu as divisé par une puissance de n trop élevée. Prends la plus haute puissance de n du dénominateur.",
};

export interface ReponseClassifierQuelconque {
  classification: ClassificationQuelconque;
  valeur?: string;
}

/** Écran "classifierQuelconque" — la classification catégorielle doit correspondre EXACTEMENT ;
 * pour `limiteValeur` (degP=degQ), une valeur numérique est EN PLUS exigée (piège : répondre juste
 * "converge" sans le rapport des coefficients dominants). */
export function diagnostiquerClassifierQuelconque(reponse: ReponseClassifierQuelconque, exercice: ExerciceConvergenceQuelconque): StatutVerification {
  if (reponse.classification !== exercice.classification) return "not_equivalent";
  if (exercice.classification === "limiteValeur") {
    return diagnostiquerNombre(reponse.valeur ?? "", exercice.limiteValeur as number);
  }
  return "correct";
}
