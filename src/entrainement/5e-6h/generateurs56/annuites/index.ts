import { entier, melanger, parmi, PRENOMS, tauxEntre } from "../finance/commun";

/**
 * `56gen27` « Annuités : placement et remboursement » (5e (6h), étape 13) — modèle et tirage. Cours :
 * valeur acquise au moment du dernier versement Vₙ = a·((1 + i)ⁿ − 1)/i (somme géométrique), une période
 * après le dernier versement Vₙ(1 + i) (versements en début de période, valeur en fin de dernière
 * période), valeur actuelle (une période avant le premier versement) V₀ = a·(1 − (1 + i)⁻ⁿ)/i ;
 * retrouver le versement a ; versements mensuels avec le taux mensuel équivalent au taux annuel.
 */

export type VarianteAnnuites = "placementDernier" | "placementApres" | "valeurActuelle" | "versement" | "mensuel";
export type PhaseAnnuites = "formule" | "moment" | "valeur" | "cherchee" | "interets" | "capital" | "versement" | "tauxMensuel";

export interface ExerciceAnnuites {
  variante: VarianteAnnuites;
  prenom: string;
  /** Versement (placement, valeur actuelle, mensuel). */
  a: number;
  /** Nombre de versements (années ; mensuel : nombre d'ANNÉES, 12 versements par an). */
  n: number;
  /** Taux annuel en %. */
  tauxPct: number;
  /** Variante « versement » : montant visé et moment (au dernier versement, ou une période après). */
  cible: number;
  apres: boolean;
  /** Première année (dates de l'énoncé). */
  annee: number;
  ordre: number[];
}

export const iDe = (e: ExerciceAnnuites) => e.tauxPct / 100;
/** Taux par période : annuel, ou mensuel équivalent (variante « mensuel »). */
export const iPeriode = (e: ExerciceAnnuites) => (e.variante === "mensuel" ? Math.pow(1 + iDe(e), 1 / 12) - 1 : iDe(e));
export const nbVersements = (e: ExerciceAnnuites) => (e.variante === "mensuel" ? 12 * e.n : e.n);
export const facteurVn = (i: number, n: number) => (Math.pow(1 + i, n) - 1) / i;
export const facteurV0 = (i: number, n: number) => (1 - Math.pow(1 + i, -n)) / i;
export const Vn = (e: ExerciceAnnuites) => e.a * facteurVn(iPeriode(e), nbVersements(e));
export const VnApres = (e: ExerciceAnnuites) => Vn(e) * (1 + iPeriode(e));
export const V0 = (e: ExerciceAnnuites) => e.a * facteurV0(iDe(e), e.n);
/** Variante « versement » : versement qui constitue `cible` au moment voulu. */
export const versementCherche = (e: ExerciceAnnuites) => e.cible / (facteurVn(iDe(e), e.n) * (e.apres ? 1 + iDe(e) : 1));

export function phasesAnnuites(e: ExerciceAnnuites): PhaseAnnuites[] {
  switch (e.variante) {
    case "placementDernier":
      return ["formule", "valeur", "interets"];
    case "placementApres":
      return ["moment", "valeur", "cherchee"];
    case "valeurActuelle":
      return ["formule", "capital", "interets"];
    case "versement":
      return ["formule", "versement", "interets"];
    case "mensuel":
      return ["tauxMensuel", "valeur", "interets"];
  }
}

function base(v: VarianteAnnuites, extra: Partial<ExerciceAnnuites> = {}): ExerciceAnnuites {
  return {
    variante: v,
    prenom: parmi(PRENOMS),
    a: entier(6, 60) * 50,
    n: entier(4, 20),
    tauxPct: tauxEntre(1, 5, 0.1),
    cible: 0,
    apres: false,
    annee: parmi([2026, 2027, 2028]),
    ordre: melanger([0, 1, 2, 3]),
    ...extra,
  };
}

function construire(v: VarianteAnnuites): ExerciceAnnuites {
  switch (v) {
    case "placementDernier":
    case "placementApres":
      return base(v);
    case "valeurActuelle":
      return base(v, { a: entier(10, 100) * 50, n: entier(3, 15), tauxPct: tauxEntre(2, 7, 0.1) });
    case "versement":
      return base(v, { cible: parmi([entier(10, 120) * 500, entier(5, 60) * 1000]), n: entier(5, 20), apres: Math.random() < 0.5 });
    case "mensuel":
      return base(v, { a: entier(2, 30) * 10, n: entier(3, 15), tauxPct: tauxEntre(1, 4, 0.1) });
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteAnnuites; label: string }[] = [
  { id: "placementDernier", label: "Valeur acquise au dernier versement" },
  { id: "placementApres", label: "Valeur une période après le dernier versement" },
  { id: "valeurActuelle", label: "Valeur actuelle (remboursement)" },
  { id: "versement", label: "Retrouver le versement" },
  { id: "mensuel", label: "Versements mensuels (taux mensuel équivalent)" },
];

export function construireAvecVarianteId(id: string): ExerciceAnnuites {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id)?.id ?? parmi(CATALOGUE_VARIANTES).id;
  return construire(v);
}

export function genererExerciceAnnuites(): ExerciceAnnuites {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
