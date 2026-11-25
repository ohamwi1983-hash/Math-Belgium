import type { DecompositionSommeDes, ExerciceDenombCombPurA, ExerciceDenombCombPurB, ExerciceDenombCombPurC, ExerciceDenombCombPurD, ExerciceDenombrementCombinatoirePur, SousTypeDenombCombPurA } from "../../core6e/denombrementCombinatoirePur.types";
import { coefficientBinomial, factorielle } from "../combinatoire";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — `6gen46` « Problèmes de dénombrement » (6e ch. 7, § 4).
 * Catalogue : ordre et identifiants figés (codes imprimés) ; « B_repartition » désigne désormais les
 * groupes non nommés (décision de l'utilisateur). Tirage libre : chaque variante à parts égales ; en D,
 * le verdict (S₁, S₂, égales) est tiré d'abord, à parts égales.
 */

// ============================================================================
// Famille A — poker sur un jeu de h hauteurs × c couleurs
// ============================================================================

function construireMain(sousType: SousTypeDenombCombPurA): ExerciceDenombCombPurA {
  const hauteurs = tirerEntier(6, 13);
  const couleurs = sousType === "carre" ? 4 : tirerParmi([3, 4] as const);
  const h = hauteurs;
  const c = couleurs;
  let etape1: number;
  let etape2: number;
  switch (sousType) {
    case "carre":
      etape1 = h * coefficientBinomial(c, 4);
      etape2 = (h - 1) * c;
      break;
    case "brelan":
      etape1 = h * coefficientBinomial(c, 3);
      etape2 = coefficientBinomial(h - 1, 2) * c * c;
      break;
    case "paire":
      etape1 = h * coefficientBinomial(c, 2);
      etape2 = coefficientBinomial(h - 1, 3) * c ** 3;
      break;
    case "deuxPaires":
      etape1 = coefficientBinomial(h, 2) * coefficientBinomial(c, 2) ** 2;
      etape2 = (h - 2) * c;
      break;
  }
  return { famille: "A", sousType, hauteurs, couleurs, etape1, etape2, resultatFinal: etape1 * etape2 };
}

export const construireCarre = () => construireMain("carre");
export const construireBrelan = () => construireMain("brelan");
export const construirePaire = () => construireMain("paire");
export const construireDeuxPaires = () => construireMain("deuxPaires");

// ============================================================================
// Famille B — groupes non nommés de même taille : n!/((t!)ᵐ · m!)
// ============================================================================

const CONTEXTES_B = [
  "{n} élèves se répartissent en {m} groupes de {t} pour un travail ; les groupes ne portent ni nom ni numéro.",
  "{n} joueurs forment {m} équipes de {t} pour un tournoi amical ; les équipes n'ont ni nom ni couleur.",
  "{n} amis se répartissent dans {m} voitures identiques, {t} par voiture ; seule compte la composition des groupes.",
];

export function construireFamilleB(): ExerciceDenombCombPurB {
  const [t, m] = tirerParmi([
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [3, 2],
    [3, 3],
    [4, 2],
    [4, 3],
    [5, 2],
    [6, 2],
  ] as const);
  const n = t * m;
  const nommes = factorielle(n) / factorielle(t) ** m;
  const contexte = tirerParmi(CONTEXTES_B).replace("{n}", String(n)).replace("{m}", String(m)).replace("{t}", String(t));
  return { famille: "B", n, m, t, contexte, nommes, resultat: nommes / factorielle(m) };
}

// ============================================================================
// Famille C — nᵏ (k éléments indépendants, n positions chacun)
// ============================================================================

export function construireFamilleC(): ExerciceDenombCombPurC {
  for (;;) {
    const n = tirerEntier(2, 10);
    const k = tirerEntier(2, 6);
    if (n === k || (n === 2 && k === 4) || (n === 4 && k === 2) || n ** k > 1_000_000) continue;
    const contexte = tirerParmi([
      `Un tableau de commande comporte ${k} boutons ; chaque bouton peut être mis sur ${n} positions différentes.`,
      `Un questionnaire compte ${k} questions ; à chaque question, on choisit une réponse parmi ${n} propositions.`,
      `Un code est une suite de ${k} pastilles ; chaque pastille est d'une couleur choisie parmi ${n}, et une couleur peut revenir.`,
    ]);
    return { famille: "C", n, k, contexte, resultat: n ** k };
  }
}

// ============================================================================
// Famille D — trois dés : triplets ordonnés pour deux sommes
// ============================================================================

export function decompositionsSomme(somme: number, n: number, f: number): DecompositionSommeDes[] {
  if (n !== 3) throw new Error("decompositionsSomme : seul n = 3 dés est implémenté");
  const r: DecompositionSommeDes[] = [];
  for (let a = 1; a <= f; a++)
    for (let b = a; b <= f; b++) {
      const c = somme - a - b;
      if (c < b || c > f) continue;
      const distinctes = new Set([a, b, c]).size;
      r.push({ valeurs: [a, b, c], arrangements: distinctes === 3 ? 6 : distinctes === 2 ? 3 : 1 });
    }
  return r;
}

function total(s: number): number {
  return decompositionsSomme(s, 3, 6).reduce((acc, d) => acc + d.arrangements, 0);
}

const PAIRES_PAR_VERDICT: Record<ExerciceDenombCombPurD["comparaison"], [number, number][]> = { s1: [], s2: [], egal: [] };
for (let s1 = 7; s1 <= 14; s1++)
  for (let s2 = 7; s2 <= 14; s2++) {
    if (s1 === s2) continue;
    const t1 = total(s1);
    const t2 = total(s2);
    if (t1 === t2) PAIRES_PAR_VERDICT.egal.push([s1, s2]);
    else if (Math.abs(s1 - s2) <= 2) PAIRES_PAR_VERDICT[t1 > t2 ? "s1" : "s2"].push([s1, s2]);
  }

export function construireFamilleD(verdict: ExerciceDenombCombPurD["comparaison"] = tirerParmi(["s1", "s2", "egal"] as const)): ExerciceDenombCombPurD {
  const [s1, s2] = tirerParmi(PAIRES_PAR_VERDICT[verdict]);
  const decompositionsS1 = decompositionsSomme(s1, 3, 6);
  const decompositionsS2 = decompositionsSomme(s2, 3, 6);
  const totalS1 = total(s1);
  const totalS2 = total(s2);
  return { famille: "D", n: 3, f: 6, s1, s2, decompositionsS1, decompositionsS2, totalS1, totalS2, comparaison: totalS1 > totalS2 ? "s1" : totalS1 < totalS2 ? "s2" : "egal" };
}

// ============================================================================
// Catalogue
// ============================================================================

export type IdVarianteDenombrementCombinatoirePur = "A_carre" | "A_brelan" | "A_paire" | "A_deuxPaires" | "B_repartition" | "C_affichages" | "D_sommeTriplets";

export const CATALOGUE_VARIANTES: { id: IdVarianteDenombrementCombinatoirePur; label: string }[] = [
  { id: "A_carre", label: "A — Poker : carré" },
  { id: "A_brelan", label: "A — Poker : brelan" },
  { id: "A_paire", label: "A — Poker : une seule paire" },
  { id: "A_deuxPaires", label: "A — Poker : deux paires" },
  { id: "B_repartition", label: "B — Groupes non nommés de même taille" },
  { id: "C_affichages", label: "C — Réglages indépendants (nᵏ)" },
  { id: "D_sommeTriplets", label: "D — Trois dés : quelle somme est la plus fréquente ?" },
];

const CONSTRUCTEURS: Record<IdVarianteDenombrementCombinatoirePur, () => ExerciceDenombrementCombinatoirePur> = {
  A_carre: construireCarre,
  A_brelan: construireBrelan,
  A_paire: construirePaire,
  A_deuxPaires: construireDeuxPaires,
  B_repartition: construireFamilleB,
  C_affichages: construireFamilleC,
  D_sommeTriplets: () => construireFamilleD(),
};

export function construireAvecVarianteId(id: IdVarianteDenombrementCombinatoirePur): ExerciceDenombrementCombinatoirePur {
  return CONSTRUCTEURS[id]();
}

export function genererExerciceDenombrementCombinatoirePur(): ExerciceDenombrementCombinatoirePur {
  return CONSTRUCTEURS[tirerParmi(CATALOGUE_VARIANTES).id]();
}

export type { ExerciceDenombCombPurA, ExerciceDenombCombPurB, ExerciceDenombCombPurC, ExerciceDenombCombPurD };
