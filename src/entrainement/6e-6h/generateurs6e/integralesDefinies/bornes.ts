import type { ExerciceCalculPrimitives } from "../../core6e/calculPrimitives.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — choix de bornes a<b VALIDES (F(a) et F(b) finis) pour un exercice de calcul de
 * primitive emprunté QUELCONQUE (famille A/B/C/G, tout sous-type) pour `6gen25`, scénarios
 * `simple`/`moyenne`.
 *
 * **Domaine auto-détecté par ESSAI, jamais recalculé à la main par sous-type** — même principe que
 * `moteur6e/verificationCalculPrimitives.ts` (voir son en-tête, "Échantillonnage") : plutôt que de
 * dupliquer ici la connaissance du domaine de chacun des ~12 sous-types empruntables (pôle de
 * `1/x`, domaine de `arcsin`, exposant fractionnaire nécessitant x>0...), on teste un pool de
 * candidats "propres" (petits entiers puis petites fractions) et on ne retient que ceux où
 * `primitiveReference` est réellement fini — le filtre generique fonctionne identiquement quel que
 * soit le sous-type, sans jamais connaître sa formule.
 */

const CANDIDATS_ENTIERS: number[] = [1, 2, 3, -1, -2, -3];
const CANDIDATS_FRACTIONS: number[] = [0.5, -0.5, 0.25, -0.25, 0.75, -0.75, 1.5, -1.5];

function estFini(v: number): boolean {
  return Number.isFinite(v);
}

/** Restriction de magnitude documentée dans `moteur6e/verificationCalculPrimitives.ts`
 * (`pointsBEcran3`) : famille B avec u de type "puissance" (u=x^p+c) combiné à typeG="expU" produit
 * des primitives de magnitude ASTRONOMIQUE (e^(x³)) dès que |x| dépasse 1 — bornes restreintes aux
 * petites fractions dans ce cas précis, jamais les entiers ≥2. */
function primitiveEstAMagnitudeSure(primitive: ExerciceCalculPrimitives): boolean {
  return !(primitive.famille === "B" && primitive.typeU === "puissance");
}

/** Balayage fin de repli — même technique que `moteur6e/verificationCalculPrimitives.ts`
 * (`pointsBEcran3`, cas `invSqrtU`) : certains sous-types (typeG="invSqrtU"→arcsin(u) ou
 * typeG="invU"→ln|u|, combinés à un u affine dont le domaine sûr peut être un intervalle ÉTROIT
 * dépendant des paramètres tirés) ne laissent aucun point du petit pool "propre" ci-dessus dans leur
 * domaine — un balayage fin (pas 0.1) filtré directement sur `primitiveReference` retrouve un
 * intervalle sûr QUELS QUE SOIENT les paramètres tirés, sans jamais dupliquer ici la formule de
 * domaine d'un sous-type précis. */
function balayageFin(primitive: ExerciceCalculPrimitives): number[] {
  const points: number[] = [];
  for (let x = -8; x <= 8; x += 0.1) {
    const arrondi = Math.round(x * 10) / 10;
    if (estFini(primitive.primitiveReference(arrondi))) points.push(arrondi);
  }
  return points;
}

/**
 * Audit du chapitre 4 (P1) : avec le seul test « F(a) et F(b) finis », 19 à 61 % des tirages de
 * certaines variantes plaçaient un PÔLE de f entre les bornes (ex. ∫₋₃³ 1/(x−2) dx « calculée »
 * par ln|1| − ln|5|), une intégrale qui n'existe pas. On vérifie désormais l'intégrande sur TOUT
 * [a ; b] :
 * - balayage fin (pas ≤ 0,005) : f finie et |f| < 10⁴ (au-delà, on considère qu'on frôle un pôle) ;
 * - toutes les fractions p/q (q ≤ 6) de [a ; b], où tombent les pôles des sous-types empruntés ;
 * - changement de signe entre deux points du balayage : bissection, et pôle si |f| explose ;
 * - bornes elles-mêmes dans le domaine (arcsin : u strictement entre −1 et 1, sinon f infinie).
 */
const SEUIL_POLE = 1e4;

function valeurSure(f: (x: number) => number, x: number): boolean {
  const v = f(x);
  return Number.isFinite(v) && Math.abs(v) < SEUIL_POLE;
}

export function intervalleSansSingularite(primitive: ExerciceCalculPrimitives, a: number, b: number): boolean {
  const f = primitive.integrandeReference;
  if (!estFini(primitive.primitiveReference(a)) || !estFini(primitive.primitiveReference(b))) return false;
  const pas = Math.min(0.005, (b - a) / 400);
  let precedent = f(a);
  if (!valeurSure(f, a)) return false;
  for (let x = a + pas; x < b + pas / 2; x += pas) {
    const xx = Math.min(x, b);
    const v = f(xx);
    if (!Number.isFinite(v) || Math.abs(v) >= SEUIL_POLE) return false;
    if (v !== 0 && precedent !== 0 && Math.sign(v) !== Math.sign(precedent)) {
      let g = xx - pas;
      let d = xx;
      for (let i = 0; i < 60; i++) {
        const m = (g + d) / 2;
        if (Math.sign(f(m)) === Math.sign(precedent)) g = m;
        else d = m;
      }
      if (!valeurSure(f, (g + d) / 2)) return false;
    }
    precedent = v;
  }
  for (let q = 1; q <= 6; q++) {
    for (let p = Math.ceil(a * q); p <= Math.floor(b * q); p++) {
      if (!valeurSure(f, p / q)) return false;
    }
  }
  return true;
}

export interface OptionsBornes {
  /** Mode « valeur moyenne » (audit P21) : éviter b − a = 1, qui rend le facteur 1/(b − a) invisible. */
  eviterLargeurUn?: boolean;
}

function pairesValides(primitive: ExerciceCalculPrimitives, points: number[]): [number, number][] {
  const tries = [...new Set(points)].sort((x, y) => x - y);
  const paires: [number, number][] = [];
  for (let i = 0; i < tries.length; i++) {
    for (let j = i + 1; j < tries.length; j++) {
      if (intervalleSansSingularite(primitive, tries[i], tries[j])) paires.push([tries[i], tries[j]]);
    }
  }
  return paires;
}

/** Choisit 2 bornes a < b telles que f soit définie et bornée sur tout [a ; b] — voir ci-dessus. */
export function choisirBornesValides(primitive: ExerciceCalculPrimitives, options: OptionsBornes = {}): [number, number] {
  const magnitudeSure = primitiveEstAMagnitudeSure(primitive);
  const entiers = magnitudeSure ? CANDIDATS_ENTIERS.concat([0]) : [];
  const preferer = (paires: [number, number][]): [number, number][] => {
    if (!options.eviterLargeurUn) return paires;
    const larges = paires.filter(([x, y]) => Math.abs(y - x - 1) > 1e-9);
    return larges.length > 0 ? larges : paires;
  };
  let paires = preferer(pairesValides(primitive, entiers));
  if (paires.length === 0) paires = preferer(pairesValides(primitive, [...entiers, ...CANDIDATS_FRACTIONS, 0]));
  if (paires.length === 0) {
    // Filet : balayage fin, limité à une trentaine de points régulièrement espacés.
    const fins = balayageFin(primitive);
    const echantillon = fins.filter((_, i) => i % Math.max(1, Math.floor(fins.length / 30)) === 0);
    paires = preferer(pairesValides(primitive, echantillon));
  }
  if (paires.length === 0) {
    throw new Error("choisirBornesValides : impossible de trouver 2 bornes valides pour cet exercice");
  }
  return tirerParmi(paires);
}
