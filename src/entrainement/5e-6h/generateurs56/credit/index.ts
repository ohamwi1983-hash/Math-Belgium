import { auCentime, entier, melanger, parmi, PRENOMS, tauxEntre } from "../finance/commun";

/**
 * `56gen28` « Crédit et tableau d'amortissement » (5e (6h), étape 14) — modèle et tirage. Cours : taux
 * mensuel équivalent au TAEG i = (1 + TAEG)^(1/12) − 1, mensualité m = C·i / (1 − (1 + i)⁻ⁿ) (depuis la
 * valeur actuelle), montant empruntable C = m·(1 − (1 + i)⁻ⁿ)/i, coût du crédit = total payé − montant
 * emprunté (avec la mensualité ARRONDIE au centime, comme la banque ; la valeur exacte est dite dans le
 * corrigé), lignes du tableau d'amortissement (intérêts = capital restant dû × i, amortissement =
 * mensualité − intérêts), amortissement constant (suites arithmétiques : exercice « prêt particulier »).
 */

export type VarianteCredit = "mensualite" | "montantEmprunte" | "tableau" | "amortissementConstant";
export type PhaseCredit = "tauxMensuel" | "mensualite" | "capital" | "cout" | "ligne1" | "ligne2" | "amortissement" | "interet1" | "nature" | "mensualiteK" | "totalInterets";

export interface ExerciceCredit {
  variante: VarianteCredit;
  prenom: string;
  /** Objet du crédit (indice dans la banque de contextes). */
  objet: number;
  /** Montant emprunté (montantEmprunte : calculé depuis m). */
  C: number;
  /** TAEG en %. */
  taeg: number;
  /** Nombre de mensualités. */
  n: number;
  /** Mensualité donnée (montantEmprunte) ; tableau : mensualité de la banque (arrondie au centime). */
  m: number;
  /** tableau : première ligne à compléter (k ≥ 1). */
  k: number;
  /** amortissementConstant : taux mensuel en % sur le capital restant dû, rang de la mensualité demandée. */
  r: number;
  rang: number;
  ordre: number[];
}

export const iMensuel = (e: ExerciceCredit) => Math.pow(1 + e.taeg / 100, 1 / 12) - 1;
/** Taux mensuel arrondi au millième de % (ce qu'on lit souvent : « 0,286 % »). */
export const iMensuelArrondi = (e: ExerciceCredit) => Math.round(100000 * iMensuel(e)) / 100000;
export const mensualiteDe = (C: number, i: number, n: number) => (C * i) / (1 - Math.pow(1 + i, -n));
export const capitalDe = (m: number, i: number, n: number) => (m * (1 - Math.pow(1 + i, -n))) / i;
export const mensualiteExacte = (e: ExerciceCredit) => mensualiteDe(e.C, iMensuel(e), e.n);
export const capitalEmpruntable = (e: ExerciceCredit) => capitalDe(e.m, iMensuel(e), e.n);

/** Capital restant dû après la ligne j (mensualité de la banque `m`, calcul exact). */
export function restantDu(e: ExerciceCredit, j: number, i = iMensuel(e)): number {
  let crd = e.C;
  for (let q = 1; q <= j; q++) crd -= e.m - crd * i;
  return crd;
}
/** Capital restant dû IMPRIMÉ avant la première ligne à compléter (au centime). */
export const restantDuDonne = (e: ExerciceCredit) => auCentime(restantDu(e, e.k - 1));

export interface LigneTableau {
  interet: number;
  amortissement: number;
  restant: number;
}
export function ligneDepuis(crd: number, m: number, i: number): LigneTableau {
  const interet = crd * i;
  const amortissement = m - interet;
  return { interet, amortissement, restant: crd - amortissement };
}

/* Amortissement constant */
export const amortissementConstant = (e: ExerciceCredit) => e.C / e.n;
export const interetRang = (e: ExerciceCredit, j: number) => (e.r / 100) * (e.C - (j - 1) * amortissementConstant(e));
export const mensualiteRang = (e: ExerciceCredit, j: number) => amortissementConstant(e) + interetRang(e, j);
export const totalInterets = (e: ExerciceCredit) => (e.n * (interetRang(e, 1) + interetRang(e, e.n))) / 2;

export function phasesCredit(e: ExerciceCredit): PhaseCredit[] {
  switch (e.variante) {
    case "mensualite":
      return ["tauxMensuel", "mensualite", "cout"];
    case "montantEmprunte":
      return ["tauxMensuel", "capital", "cout"];
    case "tableau":
      return ["tauxMensuel", "ligne1", "ligne2"];
    case "amortissementConstant":
      return ["amortissement", "interet1", "nature", "mensualiteK", "totalInterets"];
  }
}

function base(v: VarianteCredit, extra: Partial<ExerciceCredit> = {}): ExerciceCredit {
  return {
    variante: v,
    prenom: parmi(PRENOMS),
    objet: entier(0, 3),
    C: parmi([entier(10, 60) * 100, entier(4, 30) * 500]),
    taeg: tauxEntre(2, 12, 0.1),
    n: parmi([12, 18, 24, 30, 36, 48, 60]),
    m: 0,
    k: 1,
    r: 0,
    rang: 1,
    ordre: melanger([0, 1, 2, 3]),
    ...extra,
  };
}

function construire(v: VarianteCredit): ExerciceCredit {
  switch (v) {
    case "mensualite":
      return base(v);
    case "montantEmprunte":
      return base(v, { C: 0, m: entier(4, 60) * 25 });
    case "tableau": {
      const e = base(v);
      const m = auCentime(mensualiteExacte(e));
      const k = Math.random() < 0.4 ? 1 : entier(2, Math.min(12, e.n - 2));
      return { ...e, m, k };
    }
    case "amortissementConstant": {
      const n = parmi([24, 36, 48, 60]);
      const A = parmi([50, 100, 125, 150, 200, 250, 300]);
      return base(v, { n, C: n * A, r: parmi([0.2, 0.25, 0.3, 0.4, 0.5]), rang: entier(5, n - 1) });
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteCredit; label: string }[] = [
  { id: "mensualite", label: "Mensualité et coût du crédit" },
  { id: "montantEmprunte", label: "Montant empruntable" },
  { id: "tableau", label: "Deux lignes du tableau d'amortissement" },
  { id: "amortissementConstant", label: "Amortissement constant (suites arithmétiques)" },
];

export function construireAvecVarianteId(id: string): ExerciceCredit {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id)?.id ?? parmi(CATALOGUE_VARIANTES).id;
  return construire(v);
}

export function genererExerciceCredit(): ExerciceCredit {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
