import { entier, melanger, parmi, PRENOMS, tauxEntre } from "../finance/commun";

/**
 * `56gen26` « Taux équivalents et taux réel » (5e (6h), étape 12) — modèle et tirage. Cours : deux taux
 * sont équivalents s'ils donnent la même valeur acquise sur la même durée : (1 + i_s)² = (1 + i_t)⁴ =
 * (1 + i_m)¹² = 1 + i_a ; le taux annuel équivalent à un taux périodique est le taux réel. Variantes :
 * périodique → annuel, annuel → périodique, comparer deux offres (VERDICT tiré à parts égales AVANT les
 * nombres, contexte placement / emprunt tiré indépendamment), taux net d'un précompte (DONNÉE de
 * l'énoncé, jamais présentée comme le taux en vigueur), dépréciation mensuelle → annuelle, évolution sur
 * plusieurs années → taux annuel moyen. Taux annuels au centième de pour cent, taux périodiques au
 * millième.
 */

export type VarianteTauxEquivalents = "versAnnuel" | "depuisAnnuel" | "comparer" | "precompte" | "depreciation" | "longuePeriode";
export type PhaseTauxEquivalents = "relation" | "taux" | "tauxA" | "tauxB" | "choix" | "brut" | "net" | "tauxNet" | "valeur";

/** Périodes : 2 semestres, 4 trimestres, 12 mois dans une année. */
export type Periode = 2 | 4 | 12;

export interface ExerciceTauxEquivalents {
  variante: VarianteTauxEquivalents;
  prenom: string;
  /** Période du taux donné (ou cherché) ; offre A en « comparer ». */
  k: Periode;
  /** Taux en % : périodique (versAnnuel, comparer A, dépréciation mensuelle), annuel (depuisAnnuel,
   * précompte : taux brut), variation totale P en % (longuePeriode). */
  taux: number;
  /** Offre B (comparer). */
  kB: Periode;
  tauxB: number;
  /** comparer : l'offre la plus avantageuse ; contexte placement ou emprunt. */
  gagnante: "A" | "B";
  emprunt: boolean;
  /** Précompte en % (donnée) ; capital (précompte, dépréciation). */
  precompte: number;
  C0: number;
  /** Dépréciation : nombre de mois ; longue période : nombre d'années. */
  duree: number;
  /** longuePeriode : baisse (glacier, valeur) ou hausse (prix, population) ; contexte. */
  baisse: boolean;
  contexte: number;
  ordre: number[];
}

export const facteurAnnuel = (k: number, pPct: number) => Math.pow(1 + pPct / 100, k);
/** Taux annuel équivalent (en %) à un taux périodique p % sur k périodes par an. */
export const annuelDe = (k: number, pPct: number) => 100 * (facteurAnnuel(k, pPct) - 1);
/** Taux périodique équivalent (en %) à un taux annuel a %. */
export const periodiqueDe = (k: number, aPct: number) => 100 * (Math.pow(1 + aPct / 100, 1 / k) - 1);
export const tauxNet = (e: ExerciceTauxEquivalents) => e.taux * (1 - e.precompte / 100);
export const depreciationAnnuelle = (e: ExerciceTauxEquivalents) => 100 * (1 - Math.pow(1 - e.taux / 100, 12));
export const valeurDepreciee = (e: ExerciceTauxEquivalents) => e.C0 * Math.pow(1 - e.taux / 100, e.duree);
/** Taux annuel moyen (en %) d'une évolution de ±P % en N ans (positif : hausse ou baisse annuelle). */
export const tauxMoyen = (e: ExerciceTauxEquivalents) => (e.baisse ? 100 * (1 - Math.pow(1 - e.taux / 100, 1 / e.duree)) : 100 * (Math.pow(1 + e.taux / 100, 1 / e.duree) - 1));

export function phasesTauxEquivalents(e: ExerciceTauxEquivalents): PhaseTauxEquivalents[] {
  switch (e.variante) {
    case "versAnnuel":
    case "depuisAnnuel":
    case "longuePeriode":
      return ["relation", "taux"];
    case "comparer":
      return ["tauxA", "tauxB", "choix"];
    case "precompte":
      return ["brut", "net", "tauxNet"];
    case "depreciation":
      return ["relation", "taux", "valeur"];
  }
}

const tauxPeriodique = (k: Periode) => (k === 2 ? tauxEntre(0.5, 2.5, 0.05) : k === 4 ? tauxEntre(0.3, 1.2, 0.05) : tauxEntre(0.1, 0.4, 0.01));

function base(v: VarianteTauxEquivalents, extra: Partial<ExerciceTauxEquivalents> = {}): ExerciceTauxEquivalents {
  return {
    variante: v,
    prenom: parmi(PRENOMS),
    k: parmi([2, 4, 12] as Periode[]),
    taux: 0,
    kB: 12,
    tauxB: 0,
    gagnante: "A",
    emprunt: false,
    precompte: 0,
    C0: 0,
    duree: 0,
    baisse: true,
    contexte: entier(0, 2),
    ordre: melanger([0, 1, 2, 3]),
    ...extra,
  };
}

function construire(v: VarianteTauxEquivalents): ExerciceTauxEquivalents {
  switch (v) {
    case "versAnnuel": {
      const k = parmi([2, 4, 12] as Periode[]);
      return base(v, { k, taux: tauxPeriodique(k) });
    }
    case "depuisAnnuel":
      return base(v, { k: parmi([2, 4, 12] as Periode[]), taux: tauxEntre(1, 5, 0.1) });
    case "comparer": {
      // Verdict et contexte tirés AVANT les nombres.
      const gagnante: "A" | "B" = Math.random() < 0.5 ? "A" : "B";
      const emprunt = Math.random() < 0.5;
      for (let essai = 0; essai < 2000; essai++) {
        const [k, kB] = melanger([2, 4, 12] as Periode[]).slice(0, 2) as [Periode, Periode];
        const taux = emprunt ? (k === 2 ? tauxEntre(1.5, 4, 0.05) : k === 4 ? tauxEntre(0.8, 2, 0.05) : tauxEntre(0.25, 0.7, 0.01)) : tauxPeriodique(k);
        const tauxB = emprunt ? (kB === 2 ? tauxEntre(1.5, 4, 0.05) : kB === 4 ? tauxEntre(0.8, 2, 0.05) : tauxEntre(0.25, 0.7, 0.01)) : tauxPeriodique(kB);
        const aA = annuelDe(k, taux);
        const aB = annuelDe(kB, tauxB);
        const ecart = Math.abs(aA - aB);
        if (ecart < 0.05 || ecart > 0.6) continue;
        const meilleure = emprunt ? (aA < aB ? "A" : "B") : aA > aB ? "A" : "B";
        if (meilleure !== gagnante) continue;
        return base(v, { k, taux, kB, tauxB, gagnante, emprunt });
      }
      return base(v, { k: 4, taux: 1.4, kB: 12, tauxB: 0.47, gagnante: "B", emprunt: false });
    }
    case "precompte":
      return base(v, { taux: tauxEntre(1, 5, 0.05), precompte: parmi([25, 30]), C0: parmi([entier(4, 80) * 250, entier(2, 30) * 1000]) });
    case "depreciation":
      return base(v, { taux: tauxEntre(0.8, 3, 0.1), C0: entier(80, 400) * 100, duree: entier(6, 36) });
    case "longuePeriode": {
      const baisse = Math.random() < 0.5;
      return base(v, { baisse, taux: baisse ? entier(5, 45) : entier(8, 60), duree: entier(5, 30) });
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteTauxEquivalents; label: string }[] = [
  { id: "versAnnuel", label: "Taux périodique → taux annuel (taux réel)" },
  { id: "depuisAnnuel", label: "Taux annuel → taux périodique" },
  { id: "comparer", label: "Comparer deux offres" },
  { id: "precompte", label: "Taux net d'un précompte" },
  { id: "depreciation", label: "Dépréciation mensuelle → annuelle" },
  { id: "longuePeriode", label: "Évolution sur plusieurs années → taux annuel moyen" },
];

export function construireAvecVarianteId(id: string): ExerciceTauxEquivalents {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id)?.id ?? parmi(CATALOGUE_VARIANTES).id;
  return construire(v);
}

export function genererExerciceTauxEquivalents(): ExerciceTauxEquivalents {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
