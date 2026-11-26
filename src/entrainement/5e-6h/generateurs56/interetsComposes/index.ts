import { auCentime, entier, melanger, parmi, PRENOMS, tauxEntre } from "../finance/commun";

/**
 * `56gen25` « Intérêts composés » (5e (6h), étape 11) — modèle et tirage. Cours : Cₙ = C₀(1 + i)ⁿ (suite
 * géométrique de raison 1 + i), valeur actuelle C₀ = Cₙ(1 + i)⁻ⁿ, taux par la racine n-ième, durée
 * ENTIÈRE par la table de la calculatrice (premier n qui atteint le montant visé — jamais de logarithme),
 * doublement, durée non entière par la convention mixte (intérêts composés pour les années entières,
 * intérêt simple pour la fraction d'année). Montants imprimés au centime ; calculs exacts.
 */

export type VarianteInteretsComposes = "valeurAcquise" | "valeurActuelle" | "taux" | "duree" | "doublement" | "dureeMixte";
export type PhaseInteretsComposes = "suite" | "valeur" | "interets" | "formule" | "capital" | "taux" | "inequation" | "annees" | "montant" | "composes" | "simple" | "total";

export interface ExerciceInteretsComposes {
  variante: VarianteInteretsComposes;
  prenom: string;
  C0: number;
  tauxPct: number;
  /** Années entières. */
  n: number;
  /** Mois en plus (convention mixte). */
  mois: number;
  /** Montant visé (valeur actuelle, durée). */
  cible: number;
  /** Contexte de la variante « valeurActuelle » / « duree » (indice dans la banque de phrases). */
  contexte: number;
  /** Ordre mélangé des quatre options de l'écran de choix (rejoué par le `?code=`). */
  ordre: number[];
}

export const tauxDecimal = (e: ExerciceInteretsComposes) => e.tauxPct / 100;
export const facteur = (e: ExerciceInteretsComposes) => 1 + tauxDecimal(e);
export const valeurAcquise = (e: ExerciceInteretsComposes, n = e.n) => e.C0 * Math.pow(facteur(e), n);
/** Variante « taux » : la valeur acquise est imprimée au centime. */
export const valeurDonnee = (e: ExerciceInteretsComposes) => auCentime(valeurAcquise(e));
export const tauxRetrouve = (e: ExerciceInteretsComposes) => 100 * (Math.pow(valeurDonnee(e) / e.C0, 1 / e.n) - 1);
export const valeurActuelle = (e: ExerciceInteretsComposes) => e.cible * Math.pow(facteur(e), -e.n);
/** Premier n entier tel que C₀(1 + i)ⁿ ≥ cible (doublement : cible = 2C₀). */
export function premiereAnnee(e: ExerciceInteretsComposes): number {
  const c = e.variante === "doublement" ? 2 * e.C0 : e.cible;
  let n = 0;
  while (valeurAcquise(e, n) < c && n < 500) n++;
  return n;
}
export const interetMixte = (e: ExerciceInteretsComposes) => valeurAcquise(e) * tauxDecimal(e) * (e.mois / 12);
export const totalMixte = (e: ExerciceInteretsComposes) => valeurAcquise(e) + interetMixte(e);

export function phasesInteretsComposes(e: ExerciceInteretsComposes): PhaseInteretsComposes[] {
  switch (e.variante) {
    case "valeurAcquise":
      return ["suite", "valeur", "interets"];
    case "valeurActuelle":
      return ["formule", "capital"];
    case "taux":
      return ["formule", "taux"];
    case "duree":
      return ["inequation", "annees", "montant"];
    case "doublement":
      return ["inequation", "annees"];
    case "dureeMixte":
      return ["composes", "simple", "total"];
  }
}

const capital = () => parmi([entier(4, 60) * 250, entier(10, 90) * 100, entier(2, 30) * 1000]);
const taux = () => tauxEntre(0.5, 5, 0.05);

function base(v: VarianteInteretsComposes, extra: Partial<ExerciceInteretsComposes> = {}): ExerciceInteretsComposes {
  return { variante: v, prenom: parmi(PRENOMS), C0: capital(), tauxPct: taux(), n: entier(2, 15), mois: 0, cible: 0, contexte: entier(0, 2), ordre: melanger([0, 1, 2, 3]), ...extra };
}

function construire(v: VarianteInteretsComposes): ExerciceInteretsComposes {
  switch (v) {
    case "valeurAcquise":
      return base(v);
    case "valeurActuelle": {
      const cible = parmi([entier(4, 80) * 500, entier(2, 40) * 1000]);
      return base(v, { cible, n: entier(3, 18) });
    }
    case "taux":
      for (let k = 0; k < 500; k++) {
        const e = base(v, { C0: entier(8, 80) * 250, n: entier(2, 12) });
        if (Math.abs(tauxRetrouve(e) - e.tauxPct) <= 0.002) return e;
      }
      return base(v, { C0: 2500, tauxPct: 2.4, n: 2 });
    case "duree":
      for (let k = 0; k < 2000; k++) {
        const e = base(v, { tauxPct: tauxEntre(1, 5, 0.1) });
        const visee = auCentime(e.C0 * (1 + 0.15 + Math.random() * 0.7));
        const cible = visee >= 10000 ? Math.round(visee / 100) * 100 : Math.round(visee / 50) * 50;
        const f = { ...e, cible };
        const n = premiereAnnee(f);
        if (n < 3 || n > 25) continue;
        if (valeurAcquise(f, n) - cible < 1 || cible - valeurAcquise(f, n - 1) < 1) continue;
        return f;
      }
      return base(v, { C0: 1200, tauxPct: 2.3, cible: 1500 });
    case "doublement":
      for (let k = 0; k < 500; k++) {
        const e = base(v, { tauxPct: tauxEntre(1.5, 8, 0.5) });
        const n = premiereAnnee(e);
        if (valeurAcquise(e, n) / e.C0 - 2 > 0.002 && 2 - valeurAcquise(e, n - 1) / e.C0 > 0.002) return e;
      }
      return base(v, { tauxPct: 3 });
    case "dureeMixte":
      return base(v, { n: entier(1, 6), mois: parmi([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) });
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteInteretsComposes; label: string }[] = [
  { id: "valeurAcquise", label: "Valeur acquise et intérêts" },
  { id: "valeurActuelle", label: "Valeur actuelle (capital à placer)" },
  { id: "taux", label: "Retrouver le taux (racine n-ième)" },
  { id: "duree", label: "Durée entière par la table" },
  { id: "doublement", label: "Temps de doublement" },
  { id: "dureeMixte", label: "Durée non entière (convention mixte)" },
];

export function construireAvecVarianteId(id: string): ExerciceInteretsComposes {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id)?.id ?? parmi(CATALOGUE_VARIANTES).id;
  return construire(v);
}

export function genererExerciceInteretsComposes(): ExerciceInteretsComposes {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
