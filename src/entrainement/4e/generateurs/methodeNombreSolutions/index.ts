import type { ExerciceMethodeNombreSolutions, IdAffirmation, MethodeRapide, VarianteMethodeNombreSolutions } from "../../core/methodeNombreSolutions.types";
import { affirmationAttendue, affirmationVraie, racineEvidente } from "../../moteur/modeleMethodeNombreSolutions";

/**
 * Générateur de gen113 « Reconnaître la méthode et le nombre de solutions ». Tout le hasard passe par
 * `Math.random` (`genererAvecCode` le remplace par une graine : le QR code rouvre le même exercice).
 *
 * Variante = allure de l'équation ; la MÉTHODE (verdict de l'écran 1) est tirée uniformément parmi
 * les trois de la variante AVANT les nombres :
 * - incompletes : mise en évidence (c = 0) | différence de deux carrés (b = 0, ac < 0) | aucune
 *   solution (b = 0, ac > 0) ;
 * - completes : carré parfait (Δ = 0) | racine évidente (a ± b + c = 0) | discriminant (aucun
 *   raccourci ; Δ > 0 ou Δ < 0 à parts égales).
 * Une seule méthode s'applique à chaque équation (cas mêlés exclus : c = 0 avec a = ±b, x² − 1 = 0,
 * carré parfait de racine ±1…), sauf la décision 1 (racine évidente : discriminant accepté aussi).
 * Présentation réduite ou déplacée (un terme dans le membre de droite) à parts égales.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function nonNul(min: number, max: number): number {
  for (;;) {
    const v = entier(min, max);
    if (v !== 0) return v;
  }
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

export const METHODES_PAR_VARIANTE: Record<VarianteMethodeNombreSolutions, readonly MethodeRapide[]> = {
  incompletes: ["miseEnEvidence", "differenceCarres", "aucuneSolution"],
  completes: ["carreParfait", "racineEvidente", "discriminant"],
};

function coefficients(methode: MethodeRapide): [number, number, number] {
  for (;;) {
    let a: number;
    let b: number;
    let c: number;
    switch (methode) {
      case "miseEnEvidence":
        a = nonNul(-5, 5);
        b = nonNul(-12, 12);
        c = 0;
        if (Math.abs(a) === Math.abs(b)) continue;
        break;
      case "differenceCarres": {
        // a·(x − r)(x + r) : r entier ≥ 2, ou r = k/2 avec a = ±4.
        if (Math.random() < 0.25) {
          a = choisir([4, -4]);
          const k = choisir([1, 3, 5, 7]);
          b = 0;
          c = (-a * k * k) / 4;
        } else {
          a = nonNul(-4, 4);
          const r = entier(2, 6);
          b = 0;
          c = -a * r * r;
        }
        break;
      }
      case "aucuneSolution":
        a = nonNul(-5, 5);
        b = 0;
        c = Math.sign(a) * entier(1, 20);
        break;
      case "carreParfait": {
        if (Math.random() < 0.25) {
          a = choisir([4, -4]);
          const k = choisir([-5, -3, 3, 5]);
          // 4(x − k/2)² = 4x² − 4kx + k²
          b = (-a * k) / 1;
          c = (a * k * k) / 4;
        } else {
          a = choisir([1, 2, 3, -1, -2, -3]);
          const r = choisir([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]);
          b = -2 * a * r;
          c = a * r * r;
        }
        break;
      }
      case "racineEvidente": {
        a = nonNul(-5, 5);
        c = nonNul(-12, 12);
        if (c === a || c === -a) continue;
        b = Math.random() < 0.5 ? -(a + c) : a + c;
        break;
      }
      case "discriminant": {
        a = nonNul(-4, 4);
        b = nonNul(-9, 9);
        c = nonNul(-12, 12);
        const d = b * b - 4 * a * c;
        if (d === 0 || a + b + c === 0 || a - b + c === 0) continue;
        break;
      }
    }
    if (pgcd(pgcd(a, b), c) !== 1) continue;
    return [a, b, c];
  }
}

const TOUTES: IdAffirmation[] = ["facteurX", "moinsCaPositif", "moinsCaNegatif", "deltaNul", "deltaPositif", "deltaNegatif", "racineEvidente1", "racineEvidenteMoins1", "produitNegatif"];

function tirer(variante: VarianteMethodeNombreSolutions, methode: MethodeRapide): ExerciceMethodeNombreSolutions {
  for (;;) {
    const [a, b, c] = coefficients(methode);
    const base = { variante, methode, a, b, c, affirmations: [] as IdAffirmation[] };
    // Présentation : déplacer un terme NON nul.
    const presentation = Math.random() < 0.5 ? ("reduite" as const) : ("deplacee" as const);
    const termeDeplace: 0 | 1 = b === 0 ? 0 : c === 0 ? 1 : choisir([0, 1] as const);
    const e: ExerciceMethodeNombreSolutions = { ...base, presentation, termeDeplace };
    if (methode === "racineEvidente" && racineEvidente(e) === null) continue;
    const vraie = affirmationAttendue(e);
    const fausses = TOUTES.filter((id) => !affirmationVraie(id, e));
    if (fausses.length < 3) continue;
    return { ...e, affirmations: melanger([vraie, ...melanger(fausses).slice(0, 3)]) };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteMethodeNombreSolutions; label: string }[] = [
  { id: "incompletes", label: "Équations incomplètes (c = 0 ou b = 0)" },
  { id: "completes", label: "Équations complètes (carré parfait, racine évidente, discriminant)" },
];

export function genererMethodeNombreSolutions(variante: VarianteMethodeNombreSolutions): ExerciceMethodeNombreSolutions {
  return tirer(variante, choisir(METHODES_PAR_VARIANTE[variante]));
}

export function construireAvecVariante(id: string): ExerciceMethodeNombreSolutions {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceMethodeNombreSolutions();
  return genererMethodeNombreSolutions(id as VarianteMethodeNombreSolutions);
}

/** Tirage libre : une variante au hasard (donc chacune des six méthodes avec la probabilité 1/6). */
export function genererExerciceMethodeNombreSolutions(): ExerciceMethodeNombreSolutions {
  return genererMethodeNombreSolutions(choisir(CATALOGUE_VARIANTES).id);
}
