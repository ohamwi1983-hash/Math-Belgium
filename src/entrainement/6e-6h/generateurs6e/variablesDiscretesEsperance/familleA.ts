import type { EvenementLoiA, ExerciceEsperanceA, TypeEvenementA } from "../../core6e/variablesDiscretesEsperance.types";
import { genererPoids, tirerBooleen, tirerEntier } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Loi discrète donnée : cumuls et événements contraires")
 * de `6gen49`. Table de loi `xs`/`ps` (`m`∈[5,8] valeurs) — `xs` toujours une plage d'ENTIERS
 * CONSÉCUTIFS (`xs[i]=depart+i`) : propriété exploitée partout dans ce fichier (tout événement
 * couvre un intervalle CONTIGU d'indices) et par `ui6e/formatVariablesDiscretesEsperance.ts` pour
 * un affichage compact. `ps` : décimales "propres" sommant EXACTEMENT à 1 — `genererPoids(m,20)`
 * (`aleatoire.ts`), chaque `ps[i]` un multiple exact de 0,05.
 *
 * ============================================================================
 * **Piège central — "contraires" décidé par VÉRITÉ STRUCTURELLE, jamais par somme de
 * probabilités**
 * ============================================================================
 * Deux événements sont contraires ssi (1) leur intersection (en indices de `xs`) est VIDE ET (2)
 * leur union couvre TOUS les indices `[0,m-1]` — vérifié directement sur les ENSEMBLES D'INDICES
 * `indices1`/`indices2` (`sontContraires` ci-dessous), jamais en comparant `probabilite1+
 * probabilite2` à 1 : avec `ps[i]>0` pour tout `i` (garanti par construction, aucun poids nul),
 * un chevauchement non vide fait TOUJOURS strictement dépasser 1 la somme des 2 probabilités — la
 * condition "somme=1" est donc bien nécessaire mais son évaluation NUMÉRIQUE (potentiellement
 * approximative côté élève) n'est jamais la vérité de référence utilisée ici ; la vérité de
 * référence reste structurelle, insensible à tout arrondi.
 *
 * `genererPaireEvenements` tire, à ~50/50 :
 * - une VRAIE PARTITION (`contraires=true`) : coupure `i0`∈[0,m-2], `auPlus(i0)` (indices
 *   `[0,i0]`) / `auMoins(i0+1)` (indices `[i0+1,m-1]`) — ou la même coupure habillée en 2
 *   `intervalle` complémentaires (variété d'énoncé, mêmes indices).
 * - un CHEVAUCHEMENT (`contraires=false`), 2 habillages : (a) `auMoins(i0)`/`auPlus(i0)` — LE piège
 *   central de la mission ("au moins k" / "au plus k" partagent X=k, intuition verbale trompeuse) ;
 *   (b) `exact(i0)` contre `auMoins(i0)` ou `auPlus(i0)` — chevauchement ET union incomplète (les 2
 *   conditions échouent, pas seulement l'une).
 */

function rangeIdx(debut: number, fin: number): number[] {
  const r: number[] = [];
  for (let i = debut; i <= fin; i++) r.push(i);
  return r;
}

export function indicesEvenementA(e: EvenementLoiA, m: number): number[] {
  switch (e.type) {
    case "auMoins":
      return rangeIdx(e.iMin, m - 1);
    case "auPlus":
      return rangeIdx(0, e.iMin);
    case "exact":
      return [e.iMin];
    case "intervalle":
      return rangeIdx(e.iMin, e.iMax ?? e.iMin);
  }
}

export function probabiliteIndices(indices: number[], ps: number[]): number {
  return indices.reduce((acc, i) => acc + ps[i], 0);
}

/** Numérateur EXACT (entier) de la probabilité couverte par `indices`, sur `psDenominateur` — somme
 * entière, jamais un arrondi décimal (voir en-tête de fichier). */
export function numerateurIndices(indices: number[], psNumerateurs: number[]): number {
  return indices.reduce((acc, i) => acc + psNumerateurs[i], 0);
}

export function sontContrairesA(indices1: number[], indices2: number[], m: number): boolean {
  const set1 = new Set(indices1);
  const intersectionVide = indices2.every((i) => !set1.has(i));
  const union = new Set([...indices1, ...indices2]);
  return intersectionVide && union.size === m;
}

interface PaireEvenements {
  evenement1: EvenementLoiA;
  evenement2: EvenementLoiA;
  contraires: boolean;
}

function evenement(type: TypeEvenementA, iMin: number, iMax?: number): EvenementLoiA {
  return iMax === undefined ? { type, iMin } : { type, iMin, iMax };
}

export function genererPaireEvenements(m: number): PaireEvenements {
  const chevauche = tirerBooleen(0.5);

  if (!chevauche) {
    const i0 = tirerEntier(0, m - 2);
    if (tirerBooleen(0.5)) {
      return { evenement1: evenement("auPlus", i0), evenement2: evenement("auMoins", i0 + 1), contraires: true };
    }
    return { evenement1: evenement("intervalle", 0, i0), evenement2: evenement("intervalle", i0 + 1, m - 1), contraires: true };
  }

  const i0 = tirerEntier(0, m - 1);
  const style = tirerEntier(0, 2);
  if (style === 0) {
    return { evenement1: evenement("auMoins", i0), evenement2: evenement("auPlus", i0), contraires: false };
  }
  if (style === 1) {
    return { evenement1: evenement("exact", i0), evenement2: evenement("auMoins", i0), contraires: false };
  }
  return { evenement1: evenement("exact", i0), evenement2: evenement("auPlus", i0), contraires: false };
}

const TAILLE_MIN = 5;
const TAILLE_MAX = 8;
const DENOMINATEUR_POIDS = 20;

export function construireFamilleA(): ExerciceEsperanceA {
  const m = tirerEntier(TAILLE_MIN, TAILLE_MAX);
  const depart = tirerEntier(0, 3);
  const xs = rangeIdx(0, m - 1).map((i) => depart + i);
  const psNumerateurs = genererPoids(m, DENOMINATEUR_POIDS);
  const ps = psNumerateurs.map((p) => p / DENOMINATEUR_POIDS);

  const { evenement1, evenement2, contraires } = genererPaireEvenements(m);
  const indices1 = indicesEvenementA(evenement1, m);
  const indices2 = indicesEvenementA(evenement2, m);
  const probabilite1Numerateur = numerateurIndices(indices1, psNumerateurs);
  const probabilite2Numerateur = numerateurIndices(indices2, psNumerateurs);
  const probabilite1 = probabiliteIndices(indices1, ps);
  const probabilite2 = probabiliteIndices(indices2, ps);

  return { famille: "A", xs, psNumerateurs, psDenominateur: DENOMINATEUR_POIDS, ps, evenement1, evenement2, indices1, indices2, probabilite1Numerateur, probabilite2Numerateur, probabilite1, probabilite2, contraires };
}
