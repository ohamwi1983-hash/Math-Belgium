import type { ExerciceBaseQuellePrimitive } from "../../core6e/quellePrimitive.types";

/**
 * Couche A (6e) — génération du point (a,b) pour `6gen24`, prolongement de 6gen23. Technique
 * GÉNÉRIQUE, indépendante de la famille/sous-type (CLAUDE.md, clarification 2 de la spec) : plutôt
 * que de dériver à la main le domaine de f pour chacun des ~13 sous-types A/B/C/G empruntés
 * (dénominateurs qui s'annulent, racine négative, arcsin/arctan composé hors domaine, u(x) hors
 * (-1,1) pour B "invSqrtU"...), on génère plusieurs CANDIDATS et on retient le premier pour lequel
 * `exerciceBase.integrandeReference(a)` ET `.primitiveReference(a)` sont tous deux FINIS — jamais de
 * logique de domaine dupliquée depuis `familles/*.ts`.
 *
 * Deux paliers de candidats :
 * 1. "Jolis" (fractions exactes, dénominateurs 1/2/4, magnitude ≤3) — couvre la quasi-totalité des
 *    sous-types, produit un `a` agréable à afficher/manipuler.
 * 2. Filet de sécurité — balayage fin (dénominateur 20, pas 0,05, plage [-8,8], trié par magnitude
 *    croissante) pour les domaines EXIGUS que le palier 1 pourrait manquer par résolution trop
 *    grossière (ex. B "invSqrtU" : u(x)∈(-1,1) peut être une fenêtre de largeur ~0,4 mal alignée sur
 *    la grille du palier 1 — voir `moteur6e/verificationCalculPrimitives.ts`, commentaire
 *    `pointsBEcran3`, même phénomène déjà rencontré et documenté côté 6gen23).
 *
 * `b` (valeur imposée F(a)=b) est tiré librement parmi de petits entiers — aucune contrainte de
 * domaine ne s'applique à b (spec : une constante C non entière/fractionnaire qui en résulte est
 * acceptée sans difficulté).
 */

export interface PointQuellePrimitive {
  aNum: number;
  aDen: number;
  a: number;
  b: number;
}

function melanger<T>(tableau: readonly T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Palier 1 — candidats "jolis" : entiers 1..3 et quarts/demis jusqu'à 3, signés. */
const CANDIDATS_JOLIS: [number, number][] = (() => {
  const paires: [number, number][] = [];
  for (const den of [1, 2, 4]) {
    for (let num = 1; num <= 3 * den; num++) {
      if (den !== 1 && num % den === 0) continue; // déjà couvert par den=1 (évite les doublons 2/2=1 etc.)
      paires.push([num, den], [-num, den]);
    }
  }
  return paires;
})();

/** Palier 2 — filet de sécurité : balayage fin dénominateur 20, trié par magnitude croissante (les
 * valeurs proches de 0 sont testées en premier, gardent un `a` aussi "sobre" que possible même dans
 * ce palier). */
const CANDIDATS_FILET: [number, number][] = (() => {
  const paires: [number, number][] = [];
  for (let num = 1; num <= 160; num++) {
    paires.push([num, 20], [-num, 20]);
  }
  paires.sort((p1, p2) => Math.abs(p1[0] / p1[1]) - Math.abs(p2[0] / p2[1]));
  return paires;
})();

const CANDIDATS_B = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 0];

function estSurPourA(exerciceBase: ExerciceBaseQuellePrimitive, a: number): boolean {
  return Number.isFinite(exerciceBase.integrandeReference(a)) && Number.isFinite(exerciceBase.primitiveReference(a));
}

/** Choisit un point (a,b) domaine-sûr pour `exerciceBase` — voir en-tête de fichier. Lève seulement
 * si AUCUN des ~330 candidats testés (jolis + filet) n'est dans le domaine — ne devrait jamais
 * arriver en pratique pour A/B/C/G (voir `point.test.ts`, 30 tirages × 12 sous-types). */
export function choisirPointSur(exerciceBase: ExerciceBaseQuellePrimitive): PointQuellePrimitive {
  const b = CANDIDATS_B[Math.floor(Math.random() * CANDIDATS_B.length)];

  for (const candidats of [melanger(CANDIDATS_JOLIS), CANDIDATS_FILET]) {
    for (const [num, den] of candidats) {
      const a = num / den;
      if (estSurPourA(exerciceBase, a)) {
        return { aNum: num, aDen: den, a, b };
      }
    }
  }

  throw new Error("choisirPointSur : aucun point sûr trouvé dans le domaine de f");
}
