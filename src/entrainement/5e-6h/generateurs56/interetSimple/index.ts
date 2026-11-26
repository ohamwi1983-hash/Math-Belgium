import type { DateSimple } from "../finance/commun";
import { auCentime, deuxDates, entier, melanger, parmi, PRENOMS, tauxEntre } from "../finance/commun";

/**
 * `56gen24` « Intérêt simple » (5e (6h), étape 11 « Intérêt simple, intérêts composés ») — modèle et
 * tirage. Cours : I = C₀·i·t, Cₜ = C₀(1 + i·t), année de 365 jours, jours EXACTS entre deux dates (on
 * ne compte pas le jour du dépôt), un mois = 1/12 d'année, une quinzaine = 1/24 d'année ; durée d'au
 * plus un an. Variantes : valeur acquise sur des jours (dates), des mois, des quinzaines ; retrouver le
 * capital, le taux (dates) ou la durée (en mois). Pour les trois dernières, les données sont tirées
 * pour que l'intérêt tombe juste au centime : la grandeur retrouvée est alors EXACTE (aucune ambiguïté
 * d'arrondi). `Math.random()` seul (le `?code=` rejoue le tirage).
 */

export type VarianteInteretSimple = "jours" | "mois" | "quinzaines" | "capital" | "taux" | "duree";
export type UniteDuree = "jours" | "mois" | "quinzaines";
export type PhaseInteretSimple = "jours" | "duree" | "interet" | "valeur" | "formule" | "capital" | "taux" | "dureeMois";

export interface ExerciceInteretSimple {
  variante: VarianteInteretSimple;
  prenom: string;
  C0: number;
  /** Taux annuel en %. */
  tauxPct: number;
  unite: UniteDuree;
  /** Nombre de jours, de mois ou de quinzaines. */
  nb: number;
  debut?: DateSimple;
  fin?: DateSimple;
  /** Variante « capital » : l'énoncé donne l'intérêt ou la valeur acquise. */
  donnee: "interet" | "valeur";
  /** Ordre (mélangé, rejoué par le `?code=`) des quatre options de l'écran « formule ». */
  ordreFormule: number[];
}

export const tauxDecimal = (e: ExerciceInteretSimple) => e.tauxPct / 100;
export const dureeAnnees = (e: ExerciceInteretSimple) => (e.unite === "jours" ? e.nb / 365 : e.unite === "mois" ? e.nb / 12 : e.nb / 24);
export const interet = (e: ExerciceInteretSimple) => e.C0 * tauxDecimal(e) * dureeAnnees(e);
export const valeurAcquise = (e: ExerciceInteretSimple) => e.C0 + interet(e);
/** Valeur acquise imprimée dans l'énoncé (au centime) — exacte pour « capital », « taux », « duree ». */
export const valeurDonnee = (e: ExerciceInteretSimple) => auCentime(valeurAcquise(e));
export const interetDonne = (e: ExerciceInteretSimple) => auCentime(interet(e));
/** Variante « taux » : intérêt et taux tirés de la valeur acquise IMPRIMÉE (au centime). */
export const interetDepuisDonnee = (e: ExerciceInteretSimple) => valeurDonnee(e) - e.C0;
export const tauxRetrouve = (e: ExerciceInteretSimple) => (100 * interetDepuisDonnee(e)) / (e.C0 * dureeAnnees(e));

export function phasesInteretSimple(e: ExerciceInteretSimple): PhaseInteretSimple[] {
  switch (e.variante) {
    case "jours":
      return ["jours", "interet", "valeur"];
    case "mois":
    case "quinzaines":
      return ["duree", "interet", "valeur"];
    case "capital":
      return ["duree", "formule", "capital"];
    case "taux":
      return ["jours", "interet", "formule", "taux"];
    case "duree":
      return ["interet", "formule", "dureeMois"];
  }
}

const capitalRond = () => parmi([entier(5, 40) * 100, entier(10, 80) * 50, entier(2, 15) * 1000]);
const tauxPlausible = () => tauxEntre(0.5, 4, 0.05);
/** L'intérêt tombe-t-il juste au centime ? */
const auCentimePres = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

function base(variante: VarianteInteretSimple, unite: UniteDuree, nb: number, extra: Partial<ExerciceInteretSimple> = {}): ExerciceInteretSimple {
  return { variante, prenom: parmi(PRENOMS), C0: capitalRond(), tauxPct: tauxPlausible(), unite, nb, donnee: "interet", ordreFormule: melanger([0, 1, 2, 3]), ...extra };
}

function construire(v: VarianteInteretSimple): ExerciceInteretSimple {
  switch (v) {
    case "jours": {
      const d = deuxDates(30, 330);
      return base(v, "jours", d.jours, { debut: d.debut, fin: d.fin });
    }
    case "mois":
      return base(v, "mois", entier(2, 11));
    case "quinzaines":
      return base(v, "quinzaines", parmi([3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]));
    case "capital":
      for (let k = 0; k < 2000; k++) {
        const e = base(v, "mois", entier(2, 11), { donnee: Math.random() < 0.5 ? "interet" : "valeur" });
        if (auCentimePres(interet(e))) return e;
      }
      return base(v, "mois", 7, { C0: 1200, tauxPct: 3 });
    case "taux":
      // Valeur acquise imprimée au centime : le taux retrouvé diffère du taux tiré d'au plus
      // 0,002 point (il s'arrondit donc au même centième).
      for (let k = 0; k < 4000; k++) {
        const d = deuxDates(60, 330);
        const e = base(v, "jours", d.jours, { debut: d.debut, fin: d.fin, C0: entier(8, 80) * 250 });
        if (Math.abs(tauxRetrouve(e) - e.tauxPct) <= 0.002) return e;
      }
      return base(v, "jours", 73, { C0: 5000, tauxPct: 2, debut: { jour: 1, mois: 2, annee: 2026 }, fin: { jour: 15, mois: 3, annee: 2026 } });
    case "duree":
      for (let k = 0; k < 2000; k++) {
        const e = base(v, "mois", entier(2, 11));
        if (auCentimePres(interet(e))) return e;
      }
      return base(v, "mois", 7, { C0: 1200, tauxPct: 3 });
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteInteretSimple; label: string }[] = [
  { id: "jours", label: "Valeur acquise (jours exacts entre deux dates)" },
  { id: "mois", label: "Valeur acquise (durée en mois)" },
  { id: "quinzaines", label: "Valeur acquise (durée en quinzaines)" },
  { id: "capital", label: "Retrouver le capital placé" },
  { id: "taux", label: "Retrouver le taux (dates)" },
  { id: "duree", label: "Retrouver la durée (en mois)" },
];

export function construireAvecVarianteId(id: string): ExerciceInteretSimple {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id)?.id ?? parmi(CATALOGUE_VARIANTES).id;
  return construire(v);
}

export function genererExerciceInteretSimple(): ExerciceInteretSimple {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
