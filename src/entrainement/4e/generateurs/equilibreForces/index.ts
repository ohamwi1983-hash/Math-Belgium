import type { ExerciceEquilibreForces, OptionCondition, SituationEquilibre, TypeIntensite, Vecteur2 } from "../../core/equilibreForces.types";
import { angleEntre, norme } from "../../moteur/modeleEquilibreForces";

/**
 * Générateur de « Équilibre de forces en composantes » (gen90). Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * On tire d'abord F₃ (selon la nature voulue de son intensité et les contraintes physiques de la
 * situation), puis F₁, et F₂ = −(F₁ + F₃). Garanties (vérifiées par tirages massifs) :
 * - composantes entières (multiples de 10 N, ou de l'échelle du quadrillage pour l'anneau) ;
 * - lustre : F₁ = poids vertical vers le bas, F₂ (câble 1) vers le haut et la gauche, F₃ (câble 2)
 *   vers le haut et la droite (horizontale dans le cas particulier) ;
 * - barque : F₁ = courant le long de l'axe x, les deux amarres tirent vers l'amont (x < 0), l'une
 *   vers chaque rive (perpendiculaire au courant dans le cas particulier) ;
 * - F₁ et F₂ ont leurs deux composantes non nulles (sauf le poids et le courant, sur un axe) ;
 * - F₃ a ses deux composantes non nulles, sauf le cas particulier `axe` ;
 * - les trois forces font deux à deux un angle d'au moins 25° et leurs intensités restent dans un
 *   rapport d'au plus 4 (figure lisible) ;
 * - question de direction : |x₃| ≠ |y₃| (jamais 45°) et l'angle avec l'axe x entre 12° et 78°.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function signe(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

const PYTHAGORE: [number, number][] = [
  [3, 4],
  [6, 8],
  [9, 12],
  [5, 12],
  [8, 15],
  [12, 16],
];

function estCarre(n: number): boolean {
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

/** Composantes de F₃ en valeur absolue (|a|, |b|), selon la nature de l'intensité. */
function tirerAbsF3(type: TypeIntensite, max: number, situation: SituationEquilibre): [number, number] | null {
  if (type === "axe") {
    const v = entier(2, max);
    // Lustre : F₃ horizontale (câble 2 horizontal) ; barque : perpendiculaire au courant.
    if (situation === "lustre") return [v, 0];
    if (situation === "barque") return [0, v];
    return Math.random() < 0.5 ? [v, 0] : [0, v];
  }
  if (type === "entier") {
    const candidats = PYTHAGORE.filter(([p, q]) => q <= max && p <= max);
    if (candidats.length === 0) return null;
    const [p, q] = choisir(candidats);
    return Math.random() < 0.5 ? [p, q] : [q, p];
  }
  const a = entier(1, max);
  const b = entier(1, max);
  if (estCarre(a * a + b * b)) return null;
  return [a, b];
}

function tirerF3(situation: SituationEquilibre, type: TypeIntensite): Vecteur2 | null {
  const max = situation === "anneau" ? 6 : 15;
  const abs = tirerAbsF3(type, max, situation);
  if (!abs) return null;
  const [a, b] = abs;
  switch (situation) {
    case "lustre":
      return { x: a, y: b };
    case "barque":
      // Amarre 2 : vers l'amont (x ≤ 0) et vers la rive du bas (y < 0).
      return { x: a === 0 ? 0 : -a, y: -b };
    default:
      return { x: a * signe(), y: b * signe() };
  }
}

function net(n: number): number {
  return n === 0 ? 0 : n;
}

function tirerF1(situation: SituationEquilibre, f3: Vecteur2): Vecteur2 {
  switch (situation) {
    case "lustre":
      // Poids : (0 ; −p), avec p > y₃ pour que le câble 1 tire vers le haut.
      return { x: 0, y: -(f3.y + entier(2, 14)) };
    case "barque":
      // Courant : (c ; 0), avec c > |x₃| pour que l'amarre 1 tire aussi vers l'amont.
      return { x: -f3.x + entier(2, 14), y: 0 };
    case "corde":
      return { x: entier(3, 15) * signe(), y: entier(3, 15) * signe() };
    case "anneau":
      return { x: entier(1, 5) * signe(), y: entier(1, 5) * signe() };
  }
}

function situationValide(situation: SituationEquilibre, f1: Vecteur2, f2: Vecteur2, f3: Vecteur2, type: TypeIntensite, direction: boolean): boolean {
  // F₂ : deux composantes non nulles.
  if (f2.x === 0 || f2.y === 0) return false;
  if (type !== "axe" && (f3.x === 0 || f3.y === 0)) return false;
  if (situation === "lustre" && !(f2.x < 0 && f2.y > 0)) return false;
  if (situation === "barque" && !(f2.x < 0 && f2.y > 0)) return false;
  const borne = situation === "anneau" ? 5 : 20;
  if (Math.abs(f2.x) > borne || Math.abs(f2.y) > borne) return false;
  if (situation === "lustre" && Math.abs(f1.y) > 25) return false;
  if (situation === "barque" && f1.x > 25) return false;
  const forces = [f1, f2, f3];
  const normes = forces.map(norme);
  if (Math.max(...normes) / Math.min(...normes) > 4) return false;
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if (angleEntre(forces[i]!, forces[j]!) < 25) return false;
  if (direction) {
    if (Math.abs(f3.x) === Math.abs(f3.y)) return false;
    const alpha = (Math.atan2(Math.abs(f3.y), Math.abs(f3.x)) * 180) / Math.PI;
    if (alpha < 12 || alpha > 78) return false;
  }
  return true;
}

const OPTIONS: OptionCondition[] = ["oppose", "somme", "difference12", "difference21"];

export function genererEquilibreForces(situation: SituationEquilibre, direction: boolean, type: TypeIntensite): ExerciceEquilibreForces {
  // Jamais de cas particulier avec la question de direction (angle de 0° ou 90°).
  const nature: TypeIntensite = direction && type === "axe" ? "racine" : type;
  for (;;) {
    const f3 = tirerF3(situation, nature);
    if (!f3) continue;
    const f1 = tirerF1(situation, f3);
    const f2 = { x: net(-(f1.x + f3.x)), y: net(-(f1.y + f3.y)) };
    if (!situationValide(situation, f1, f2, f3, nature, direction)) continue;
    const unite = situation === "anneau" ? choisir([10, 20, 50]) : 10;
    return { situation, unite, f1, f2, intensite: nature, direction, ordreConditions: melanger(OPTIONS) };
  }
}

/** Nature de l'intensité tirée librement : cas particulier une fois sur sept environ (jamais avec
 * la direction), sinon entier / racine / arrondi à parts égales. */
function tirerTypeIntensite(direction: boolean): TypeIntensite {
  if (!direction && Math.random() < 1 / 7) return "axe";
  return choisir(["entier", "racine", "arrondi"] as const);
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const SITUATIONS: SituationEquilibre[] = ["lustre", "corde", "barque", "anneau"];

const LIBELLES_SITUATION: Record<SituationEquilibre, string> = {
  lustre: "Lustre suspendu à deux câbles",
  corde: "Tir à la corde à trois",
  barque: "Barque retenue par deux amarres",
  anneau: "Anneau tiré par trois cordes (quadrillage)",
};

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = SITUATIONS.flatMap((s) => [
  { id: s, label: LIBELLES_SITUATION[s] },
  { id: `${s}-direction`, label: `${LIBELLES_SITUATION[s]} — avec la direction` },
]);

export function construireAvecVariante(id: string): ExerciceEquilibreForces {
  const m = /^(lustre|corde|barque|anneau)(-direction)?$/.exec(id);
  if (!m) return genererExerciceEquilibreForces();
  const direction = m[2] !== undefined;
  return genererEquilibreForces(m[1] as SituationEquilibre, direction, tirerTypeIntensite(direction));
}

/** Tirage libre : situation au hasard, question de direction une fois sur deux. */
export function genererExerciceEquilibreForces(): ExerciceEquilibreForces {
  const direction = Math.random() < 0.5;
  return genererEquilibreForces(choisir(SITUATIONS), direction, tirerTypeIntensite(direction));
}
