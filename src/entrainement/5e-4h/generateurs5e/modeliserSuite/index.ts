import { propre, terme } from "../../core5e/modeliserSuite";
import type {
  ContexteModelisation,
  DepartModelisation,
  ExerciceModeliserSuite,
  FormulationEvolution,
  ModeCalcul,
  NatureSuite,
  QuestionModelisation,
  SensEvolution,
} from "../../core5e/modeliserSuite";
import { CONTEXTES_MODELISATION } from "./contextes";

export type IdVarianteModeliserSuite = QuestionModelisation;

/**
 * Couche A (5e) — générateur de `5gen47` « Modéliser une situation par une suite ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement le même
 * tirage, dans l'appli comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Ordre du tirage (décisions de l'utilisateur, « tirer les verdicts AVANT la boucle de rejet ») :
 * 1. la NATURE (arithmétique / géométrique, 50/50) — c'est le verdict de l'écran a), jamais fixé par
 *    `forme`, jamais cas particulier ;
 * 2. le MODE de calcul (exact / calculatrice, 50/50), indépendant de la nature : une évaluation
 *    « calculatrice interdite » garde donc les deux natures (géométriques exactes : q = 2, 1,5,
 *    1,25, 0,75, 0,5) et une évaluation « calculatrice autorisée » aussi (arithmétiques à données
 *    lourdes : décimaux, grands nombres non ronds) ;
 * 3. le DÉPART (`rang1` 60 % / `avant` 40 %) et la question (variante) ;
 * 4. seulement ensuite le contexte et les nombres, dans une boucle de rejet qui ne touche à aucun
 *    des choix précédents.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

/** Part des énoncés qui donnent la valeur de l'année PRÉCÉDANT le rang 1. */
const PART_AVANT = 0.4;

/** Pas « rond » d'une valeur de départ : 10ᵏ⁻¹ pour un ordre de grandeur 10ᵏ. */
function pasRond(x: number): number {
  return 10 ** Math.max(0, Math.floor(Math.log10(x)) - 1);
}

/** Pas « rond » d'une quantité annuelle selon sa borne basse. */
function pasQuantite(a: number): number {
  if (a >= 500) return 100;
  if (a >= 100) return 10;
  if (a >= 20) return 5;
  return 1;
}

/** Décimal « lourd » (non entier) à `dec` décimales dans [a ; b]. */
function decimalLourd(a: number, b: number, dec: number): number {
  const f = 10 ** dec;
  for (;;) {
    const v = entier(Math.ceil(a * f), Math.floor(b * f)) / f;
    if (!Number.isInteger(v) && Math.round(v * f) % 10 !== 0) return v;
  }
}

/** Entier « lourd » (non multiple de 5) dans [a ; b]. */
function entierLourd(a: number, b: number): number {
  for (;;) {
    const v = entier(a, b);
    if (v % 5 !== 0) return v;
  }
}

interface ParametresQuestion {
  /** Plus grand rang utilisé (terme demandé, dernier terme de la somme, dernière ligne du tableau). */
  rangMax: number;
  rang?: number;
  nombre?: number;
  rangSeuil?: number;
  position?: number;
}

function parametresQuestion(variante: QuestionModelisation, geomExact: boolean): ParametresQuestion {
  switch (variante) {
    case "terme": {
      const rang = geomExact ? entier(4, 6) : entier(6, 15);
      return { rangMax: rang, rang };
    }
    case "somme": {
      const nombre = geomExact ? entier(4, 6) : entier(6, 15);
      return { rangMax: nombre, nombre };
    }
    case "seuil": {
      const rangSeuil = geomExact ? entier(3, 6) : entier(5, 14);
      // Position du rang de bascule dans le tableau de 4 lignes : 2e, 3e ou 4e (jamais la 1re,
      // pour que la ligne précédente — seuil pas encore franchi — soit toujours visible).
      const position = entier(1, Math.min(3, rangSeuil - 1));
      return { rangMax: Math.max(rangSeuil, rangSeuil - position + 3), rangSeuil, position };
    }
  }
}

/** Dénominateur de la raison remarquable (termes entiers jusqu'au rang voulu). */
function denominateur(q: number): number {
  if (q === 1.25 || q === 0.75) return 4;
  if (q === 1.5 || q === 0.5) return 2;
  return 1;
}

/** Valeur donnée en mode géométrique exact : c × den^e × 10^p, termes entiers jusqu'à `rangMax`. */
function valeurGeomExacte(c: ContexteModelisation, q: number, exposant: number): number | null {
  const base = denominateur(q) ** exposant;
  const [e0, e1] = c.echelle;
  const bas = q === 2 ? e0 / 16 : e0 / 4;
  const haut = q === 2 ? e1 : e1 * 3;
  const candidats: number[] = [];
  for (const k of [1, 3, 5, 7]) {
    for (const p of [0, 1, 2, 3]) {
      const v = k * base * 10 ** p;
      if (v >= bas && v <= haut) candidats.push(v);
    }
  }
  return candidats.length > 0 ? parmi(candidats) : null;
}

/** Plus grand multiple « rond » strictement entre lo + marge et hi − marge (seuil du problème). */
function seuilRond(lo: number, hi: number, marge: number, pasMin: number): number | null {
  for (let k = 7; k >= -2; k--) {
    for (const m of [5, 2, 1]) {
      const pas = m * 10 ** k;
      if (pas < pasMin - 1e-12) continue;
      const premier = Math.floor((lo + marge) / pas) + 1;
      const dernier = Math.ceil((hi - marge) / pas) - 1;
      if (premier <= dernier) return propre(entier(premier, dernier) * pas);
    }
  }
  return null;
}

function contextesCompatibles(variante: QuestionModelisation, nature: NatureSuite, mode: ModeCalcul): ContexteModelisation[] {
  return CONTEXTES_MODELISATION.filter((c) => {
    if (variante === "somme" && !c.total) return false;
    if (nature === "arithmetique") return Object.keys(c.arith).length > 0;
    if (mode === "exact") return (c.geomExact ?? []).length > 0;
    return Object.keys(c.geom).length > 0;
  });
}

function construire(variante: QuestionModelisation, nature: NatureSuite, mode: ModeCalcul, depart: DepartModelisation): ExerciceModeliserSuite {
  const annee1 = entier(2024, 2027);
  const geomExact = nature === "geometrique" && mode === "exact";
  const contextes = contextesCompatibles(variante, nature, mode);
  for (;;) {
    const c = parmi(contextes);
    const qp = parametresQuestion(variante, geomExact);
    let sens: SensEvolution;
    let formulation: FormulationEvolution;
    let valeurDonnee: number;
    let r = 0;
    let q = 0;
    let pct: number | null = null;

    if (nature === "arithmetique") {
      sens = parmi(Object.keys(c.arith) as SensEvolution[]);
      const [a, b] = c.arith[sens] as [number, number];
      const [e0, e1] = c.echelle;
      if (c.interets && sens === "hausse" && Math.random() < 0.6) {
        // « intérêts égaux à t % de la somme déposée au départ » : toujours le même montant.
        formulation = "pourcentInitial";
        pct = entier(2, 5);
        valeurDonnee = mode === "exact" ? entier(Math.ceil(e0 / 100), Math.floor(e1 / 100)) * 100 : entierLourd(e0, e1);
        r = propre((pct * valeurDonnee) / 100);
      } else {
        formulation = "montant";
        if (mode === "exact") {
          const pas = pasRond(e0);
          valeurDonnee = entier(Math.ceil(e0 / pas), Math.floor(e1 / pas)) * pas;
          const pr = pasQuantite(a);
          r = Math.max(a, Math.round(entier(a, b) / pr) * pr);
        } else if (c.decimales === 0) {
          valeurDonnee = entierLourd(e0, e1);
          r = entierLourd(a, b);
        } else {
          valeurDonnee = decimalLourd(e0, e1, c.decimales);
          r = decimalLourd(a, b, c.decimales);
        }
        if (sens === "baisse") r = -r;
      }
    } else if (mode === "exact") {
      q = parmi(c.geomExact as number[]);
      sens = q > 1 ? "hausse" : "baisse";
      formulation = q === 2 ? "double" : q === 0.5 && Math.random() < 0.5 ? "moitie" : "pourcent";
      pct = formulation === "pourcent" ? Math.round(Math.abs(q - 1) * 100) : null;
      const v = valeurGeomExacte(c, q, qp.rangMax - (depart === "avant" ? 0 : 1));
      if (v === null) continue;
      valeurDonnee = v;
    } else {
      sens = parmi(Object.keys(c.geom) as SensEvolution[]);
      const [a, b] = c.geom[sens] as [number, number];
      formulation = "pourcent";
      pct = entier(a, b);
      if (pct === 25 || pct === 50) continue;
      q = propre(sens === "hausse" ? 1 + pct / 100 : 1 - pct / 100);
      const [e0, e1] = c.echelle;
      const pas = pasRond(e0);
      valeurDonnee = entier(Math.ceil(e0 / pas), Math.floor(e1 / pas)) * pas;
    }

    const commun = { contexte: c, nature, mode, depart, sens, formulation, annee1, valeurDonnee, r, q, pct };
    // Toutes les valeurs utilisées restent positives et plausibles (une baisse ne s'effondre pas).
    const u1 = terme(commun, 1);
    const uMax = terme(commun, qp.rangMax);
    if (uMax <= 0 || (sens === "baisse" && nature === "arithmetique" && uMax < 0.2 * u1)) continue;

    switch (variante) {
      case "terme":
        return { ...commun, variante, rang: qp.rang as number };
      case "somme":
        return { ...commun, variante, nombre: qp.nombre as number };
      case "seuil": {
        const k = qp.rangSeuil as number;
        const avant = terme(commun, k - 1);
        const apres = terme(commun, k);
        const pasMin = mode === "calcul" ? 10 ** -c.decimales : 1;
        // Marge : aucun arrondi (ni écart d'une unité toléré) ne fait passer une valeur de l'autre
        // côté du seuil.
        const marge = mode === "calcul" ? 3 * 10 ** -c.decimales : 0.5;
        const seuil = seuilRond(Math.min(avant, apres), Math.max(avant, apres), marge, pasMin);
        if (seuil === null) continue;
        const debut = k - (qp.position as number);
        return { ...commun, variante, seuil, rangSeuil: k, rangsTable: [debut, debut + 1, debut + 2, debut + 3] };
      }
    }
  }
}

// ============================================================================
// Catalogue.
// ============================================================================

export const CATALOGUE_VARIANTES: { id: IdVarianteModeliserSuite; label: string }[] = [
  { id: "terme", label: "Valeur une année donnée (terme)" },
  { id: "somme", label: "Total sur plusieurs années (somme)" },
  { id: "seuil", label: "Première année où l'on franchit un seuil (tableau)" },
];

/** Exercice d'une variante (question) donnée ; nature, mode et départ tirés AVANT les nombres. */
export function construireAvecVarianteId(id: IdVarianteModeliserSuite): ExerciceModeliserSuite {
  const nature: NatureSuite = Math.random() < 0.5 ? "arithmetique" : "geometrique";
  const mode: ModeCalcul = Math.random() < 0.5 ? "exact" : "calcul";
  const depart: DepartModelisation = Math.random() < PART_AVANT ? "avant" : "rang1";
  return construire(id, nature, mode, depart);
}

/** Tirage libre : les trois questions à parts égales. */
export function genererExerciceModeliserSuite(): ExerciceModeliserSuite {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
