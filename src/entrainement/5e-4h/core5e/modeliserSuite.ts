/**
 * Contrat core — `5gen47` « Modéliser une situation par une suite » (chapitre 3 de 5e, section
 * `problemes-classiques`). Une situation concrète (salaire, abonnés, prix, population, déchets…)
 * évolue chaque année d'une quantité constante (suite ARITHMÉTIQUE) ou d'un pourcentage constant
 * (suite GÉOMÉTRIQUE) ; l'élève reconnaît la nature, trouve u₁ avec la convention de rang de
 * l'énoncé (« l'année 2025 a le rang 1 »), la raison (r, ou q = 1 ± t/100), puis répond à la
 * question posée : un terme (une année → son rang), un total sur plusieurs années (somme) ou la
 * première année où l'on franchit un seuil (par tableau de valeurs, sans logarithme en 5e).
 *
 * Notation du cours : rang 1 = u₁, uₙ = u₁ + (n − 1)r, uₙ = u₁·qⁿ⁻¹,
 * Sₙ = n(u₁ + uₙ)/2, Sₙ = u₁(1 − qⁿ)/(1 − q).
 */

export type NatureSuite = "arithmetique" | "geometrique";
export type QuestionModelisation = "terme" | "somme" | "seuil";
/** `exact` : valeurs entières rondes / raisons remarquables (2, 1,5, 1,25, 0,75, 0,5), faisable sans
 * calculatrice ; `calcul` : pourcentages quelconques ou données « lourdes » (calculatrice). */
export type ModeCalcul = "exact" | "calcul";
/** `rang1` : l'énoncé donne la valeur de l'année de rang 1 ; `avant` : il donne celle de l'année
 * PRÉCÉDENTE (u₁ s'obtient en appliquant une fois l'évolution annuelle). */
export type DepartModelisation = "rang1" | "avant";
export type SensEvolution = "hausse" | "baisse";

/** Écriture de l'évolution annuelle dans l'énoncé. */
export type FormulationEvolution =
  /** « augmente de 150 abonnés » (arithmétique). */
  | "montant"
  /** « des intérêts égaux à 3 % de la somme déposée au départ » (arithmétique : toujours le même montant). */
  | "pourcentInitial"
  /** « augmente de 4 % » / « diminue de 25 % » (géométrique). */
  | "pourcent"
  /** « double chaque année » (géométrique, q = 2). */
  | "double"
  /** « diminue de moitié chaque année » (géométrique, q = 1/2). */
  | "moitie";

/** Contexte narratif (données seulement, sérialisable). Les gabarits utilisent `{annee}` et `{v}`. */
export interface ContexteModelisation {
  id: string;
  /** Phrase des données : « En {annee}, la médiathèque compte {v} abonnés. » */
  donnee: string;
  /** Groupe nominal AVEC article, utilisé dans la définition de uₙ et les questions. */
  grandeur: string;
  genre: "m" | "f";
  /** Reprise dans la phrase d'évolution : « Chaque année, ce nombre augmente de … ». */
  pronom: string;
  /** Unité écrite après un nombre (« abonnés », « € », « t »). */
  unite: string;
  /** « en euros », « en tonnes »… ; `null` pour un nombre d'objets (l'unité suit le champ). */
  enUnite: string | null;
  /** Précision des réponses arrondies (mode calculatrice) : 0 unité, 1 dixième, 2 centime. */
  decimales: 0 | 1 | 2;
  /** Ordre de grandeur de la valeur de départ. */
  echelle: [number, number];
  /** Quantité ajoutée/retirée par an (arithmétique), selon le sens. */
  arith: Partial<Record<SensEvolution, [number, number]>>;
  /** Pourcentage annuel (géométrique, mode calculatrice), selon le sens. */
  geom: Partial<Record<SensEvolution, [number, number]>>;
  /** Raisons remarquables admises en mode exact (2, 1,5, 1,25 en hausse ; 0,75, 0,5 en baisse). */
  geomExact?: number[];
  /** Question « au total » (somme) : seulement pour un FLUX annuel (salaire, production…). */
  total?: { texte: string };
  /** Placement à intérêts : phrasé « x % de la somme déposée au départ » possible (arithmétique). */
  interets?: boolean;
}

interface ExerciceModeliserCommun {
  contexte: ContexteModelisation;
  nature: NatureSuite;
  mode: ModeCalcul;
  depart: DepartModelisation;
  sens: SensEvolution;
  formulation: FormulationEvolution;
  /** Année de rang 1. */
  annee1: number;
  /** Valeur donnée par l'énoncé : u₁ (`rang1`) ou la valeur de l'année précédente (`avant`). */
  valeurDonnee: number;
  /** Raison arithmétique (signée) ; 0 pour une suite géométrique. */
  r: number;
  /** Raison géométrique ; 0 pour une suite arithmétique. */
  q: number;
  /** Pourcentage de l'énoncé (`pourcent`, `pourcentInitial`), sinon `null`. */
  pct: number | null;
}

export interface ExerciceModeliserTerme extends ExerciceModeliserCommun {
  variante: "terme";
  /** Rang de l'année demandée. */
  rang: number;
}

export interface ExerciceModeliserSomme extends ExerciceModeliserCommun {
  variante: "somme";
  /** Nombre d'années (de termes) de la période, de l'année de rang 1 à l'année de rang N. */
  nombre: number;
}

export interface ExerciceModeliserSeuil extends ExerciceModeliserCommun {
  variante: "seuil";
  seuil: number;
  /** Premier rang où le seuil est franchi (dépassé en hausse, « passe sous » en baisse). */
  rangSeuil: number;
  /** Quatre rangs consécutifs du tableau ; `rangSeuil` en 2e, 3e ou 4e position. */
  rangsTable: number[];
}

export type ExerciceModeliserSuite = ExerciceModeliserTerme | ExerciceModeliserSomme | ExerciceModeliserSeuil;

/** Nettoie le bruit flottant (1,05ⁿ, sommes de décimaux). */
export function propre(x: number): number {
  return Math.round(x * 1e8) / 1e8;
}

export function premierTerme(e: ExerciceModeliserCommun): number {
  if (e.depart === "rang1") return e.valeurDonnee;
  return propre(e.nature === "arithmetique" ? e.valeurDonnee + e.r : e.valeurDonnee * e.q);
}

/** uₖ (valeur exacte, non arrondie). */
export function terme(e: ExerciceModeliserCommun, k: number): number {
  const u1 = premierTerme(e);
  return propre(e.nature === "arithmetique" ? u1 + (k - 1) * e.r : u1 * e.q ** (k - 1));
}

/** Sₙ = u₁ + … + uₙ (valeur exacte). */
export function somme(e: ExerciceModeliserCommun, n: number): number {
  const u1 = premierTerme(e);
  if (e.nature === "arithmetique") return propre((n * (u1 + terme(e, n))) / 2);
  return propre((u1 * (1 - e.q ** n)) / (1 - e.q));
}

/** Valeur de la raison de l'écran « raison » (r ou q). */
export function raison(e: ExerciceModeliserCommun): number {
  return e.nature === "arithmetique" ? e.r : e.q;
}

/** Année du rang k. */
export function anneeDuRang(e: ExerciceModeliserCommun, k: number): number {
  return e.annee1 + k - 1;
}

/** Année donnée par l'énoncé (rang 1, ou l'année précédente). */
export function anneeDonnee(e: ExerciceModeliserCommun): number {
  return e.depart === "rang1" ? e.annee1 : e.annee1 - 1;
}

/** Pas de tolérance des réponses : une unité de la précision demandée en mode calculatrice
 * (écart d'arrondi admis), valeur exacte sinon. */
export function tolerance(e: ExerciceModeliserCommun): number {
  return e.mode === "calcul" ? 10 ** -e.contexte.decimales + 1e-9 : 1e-6;
}

/** Arrondi à la précision demandée (mode calculatrice) ; valeur telle quelle sinon. */
export function arrondiDemande(e: ExerciceModeliserCommun, x: number): number {
  if (e.mode !== "calcul") return x;
  const f = 10 ** e.contexte.decimales;
  return Math.round(x * f) / f;
}

/** Condition « seuil franchi » au rang k. */
export function seuilFranchi(e: ExerciceModeliserSeuil, k: number): boolean {
  const v = terme(e, k);
  return e.sens === "hausse" ? v > e.seuil : v < e.seuil;
}

/** Réponse finale (écran e) : uₙ, Sₙ ou l'année du premier franchissement. */
export function reponseFinale(e: ExerciceModeliserSuite): number {
  switch (e.variante) {
    case "terme":
      return terme(e, e.rang);
    case "somme":
      return somme(e, e.nombre);
    case "seuil":
      return anneeDuRang(e, e.rangSeuil);
  }
}
