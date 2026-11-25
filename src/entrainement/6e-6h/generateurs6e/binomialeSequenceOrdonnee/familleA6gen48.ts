import type { ContexteBinomialeA, ExerciceBinomialeA, StrategieBinomialeA, TypeQuestionBinomialeA } from "../../core6e/binomialeSequenceOrdonnee.types";
import { probabiliteBinomialeExacte } from "../../moteur6e/verificationBinomialeSequenceOrdonnee";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Famille A de `6gen48` (6e ch. 7, § 6) — loi binomiale, refonte de l'audit (lot C) :
 * - contexte COHÉRENT avec p (G19 : « pièce équilibrée » avec p = 3/10 dans 67 % de ces contextes) —
 *   chaque contexte a ses valeurs de p, données en décimal comme dans le cours ;
 * - stratégie (terme unique, somme, complément) tirée d'abord, à parts égales (avant : « terme unique »
 *   60 %), et toujours la plus courte (au plus trois termes, jamais d'égalité somme / complément) ;
 * - probabilités raisonnables : chaque terme ≥ 0,001, résultat entre 0,01 et 0,99 (avant, « 0 » était
 *   accepté pour P(X = 10) = 0,2¹⁰).
 * `familleA.ts` (`construireAvecTypeQuestion`) reste INCHANGÉ : 6gen50 et 6gen53 (ch. 8) l'utilisent.
 */

interface ContexteP extends ContexteBinomialeA {
  valeursP: number[];
}

const CONTEXTES: ContexteP[] = [
  { id: "tir", texte: "Un archer tire {n} flèches ; chaque tir atteint la cible avec la probabilité {p}, indépendamment des autres.", labelSucces: "la flèche atteint la cible", valeursP: [0.6, 0.7, 0.8, 0.9] },
  { id: "penalty", texte: "Une footballeuse tire {n} penalties ; elle marque chacun avec la probabilité {p}, indépendamment des autres.", labelSucces: "le penalty est marqué", valeursP: [0.6, 0.7, 0.8] },
  { id: "lancerFranc", texte: "Un basketteur tente {n} lancers francs ; chacun est réussi avec la probabilité {p}, indépendamment des autres.", labelSucces: "le lancer est réussi", valeursP: [0.4, 0.6, 0.7] },
  { id: "pieces", texte: "Une machine fabrique des pièces dont une proportion {p} est défectueuse. On prélève {n} pièces dans une très grande production (les prélèvements sont considérés comme indépendants).", labelSucces: "la pièce est défectueuse", valeursP: [0.1, 0.2, 0.3] },
  { id: "graines", texte: "Une graine germe avec la probabilité {p}. On sème {n} graines, qui germent indépendamment les unes des autres.", labelSucces: "la graine germe", valeursP: [0.7, 0.8, 0.9] },
  { id: "pileFace", texte: "On lance {n} fois une pièce de monnaie équilibrée.", labelSucces: "on obtient pile", valeursP: [0.5] },
  { id: "vraiFaux", texte: "Un élève répond au hasard aux {n} questions d'un questionnaire vrai ou faux (une chance sur deux à chaque question).", labelSucces: "la réponse est juste", valeursP: [0.5] },
];

function intervalle(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

interface Plan {
  typeQuestion: TypeQuestionBinomialeA;
  k: number;
  termes: number[];
}

/** Questions possibles pour (n, stratégie) : la stratégie est la plus courte, au plus 3 termes. */
function plansPossibles(n: number, strategie: StrategieBinomialeA, types?: TypeQuestionBinomialeA[]): Plan[] {
  const r: Plan[] = [];
  const admis = (t: TypeQuestionBinomialeA) => !types || types.includes(t);
  if (strategie === "termeUnique") {
    if (admis("exactement")) for (let k = 1; k <= n - 1; k++) r.push({ typeQuestion: "exactement", k, termes: [k] });
    if (admis("aucun")) r.push({ typeQuestion: "aucun", k: 0, termes: [0] });
    if (admis("tous")) r.push({ typeQuestion: "tous", k: n, termes: [n] });
    return r;
  }
  for (let k = 1; k <= n - 1; k++) {
    // « au moins k » : somme k..n (n − k + 1 termes) ou complément 0..k − 1 (k termes)
    if (admis("auMoins")) {
      const somme = n - k + 1;
      const comp = k;
      if (strategie === "somme" && somme < comp && somme >= 2 && somme <= 3) r.push({ typeQuestion: "auMoins", k, termes: intervalle(k, n) });
      if (strategie === "complement" && comp < somme && comp <= 3) r.push({ typeQuestion: "auMoins", k, termes: intervalle(0, k - 1) });
    }
    // « au plus k » : somme 0..k (k + 1 termes) ou complément k + 1..n (n − k termes)
    if (admis("auPlus")) {
      const somme = k + 1;
      const comp = n - k;
      if (strategie === "somme" && somme < comp && somme >= 2 && somme <= 3) r.push({ typeQuestion: "auPlus", k, termes: intervalle(0, k) });
      if (strategie === "complement" && comp < somme && comp <= 3) r.push({ typeQuestion: "auPlus", k, termes: intervalle(k + 1, n) });
    }
  }
  return r;
}

export function construireExerciceA(strategieVoulue?: StrategieBinomialeA, types?: TypeQuestionBinomialeA[]): ExerciceBinomialeA {
  const strategie = strategieVoulue ?? tirerParmi(["termeUnique", "somme", "complement"] as const);
  let dernier: ExerciceBinomialeA | null = null;
  for (let essai = 0; essai < 200; essai++) {
    const n = tirerEntier(4, 10);
    const plans = plansPossibles(n, strategie, types);
    if (plans.length === 0) continue;
    const plan = tirerParmi(plans);
    const c = tirerParmi(CONTEXTES);
    const p = tirerParmi(c.valeursP);
    const valeurs = plan.termes.map((k) => probabiliteBinomialeExacte(n, p, k));
    const nombres = valeurs.map((v) => Number(v.n) / Number(v.d));
    const somme = nombres.reduce((a, b) => a + b, 0);
    const resultatFinal = strategie === "complement" ? 1 - somme : somme;
    const contexte: ContexteBinomialeA = { id: c.id, texte: c.texte.replace("{n}", String(n)).replace("{p}", String(p).replace(".", ",")), labelSucces: c.labelSucces };
    dernier = { famille: "A", contexte, n, p, k: plan.k, typeQuestion: plan.typeQuestion, strategie, termesACalculer: plan.termes, valeursTermes: nombres, resultatFinal };
    if (nombres.every((x) => x >= 0.001) && resultatFinal >= 0.01 && resultatFinal <= 0.99) return dernier;
  }
  return dernier as ExerciceBinomialeA;
}
