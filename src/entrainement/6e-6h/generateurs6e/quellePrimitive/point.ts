import type { ExerciceBaseQuellePrimitive } from "../../core6e/quellePrimitive.types";
import { valeurExacteLatex } from "../../ui6e/formatMonome";

/**
 * Couche A (6e) — génération du point (a,b) pour `6gen24`, prolongement de 6gen23. Technique
 * GÉNÉRIQUE, indépendante de la famille/sous-type : plutôt que de dériver à la main le domaine de f
 * pour chacun des sous-types A/B/C/G empruntés, on teste des CANDIDATS et on retient un point où
 * `integrandeReference` ET `primitiveReference` sont finis (au point et juste autour, pour que a soit
 * à l'INTÉRIEUR du domaine).
 *
 * Audit du chapitre 4 (décision C) :
 * - candidats PRÉFÉRÉS {0, 1, −1, 2, −2}, puis {1/2, −1/2, 3, −3} — fini les F(−11/4) ; parmi eux,
 *   priorité aux points pour lesquels C = b − F(a) a une forme exacte reconnue (`valeurExacteLatex`),
 *   pour pouvoir afficher et accepter la valeur exacte de C ;
 * - l'ancien balayage fin (dénominateur 20) ne sert plus que de filet de sécurité ;
 * - `intervalleDeValidite` : le plus grand intervalle ]p ; q[ contenant a où f est définie, détecté
 *   par balayage (pas 0,01 sur [−10 ; 10]) + bissection, bornes reconnues en fraction (dénominateur
 *   ≤ 12) — affiché dans les données quand f n'est pas définie sur ℝ.
 */

export interface PointQuellePrimitive {
  aNum: number;
  aDen: number;
  a: number;
  b: number;
  intervalleGauche?: number | null;
  intervalleDroite?: number | null;
}

function melanger<T>(tableau: readonly T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

const PALIER_1: [number, number][] = [
  [0, 1],
  [1, 1],
  [-1, 1],
  [2, 1],
  [-2, 1],
];
const PALIER_2: [number, number][] = [
  [1, 2],
  [-1, 2],
  [3, 1],
  [-3, 1],
];

/** Filet de sécurité — balayage fin dénominateur 20, trié par magnitude croissante. */
const CANDIDATS_FILET: [number, number][] = (() => {
  const paires: [number, number][] = [];
  for (let num = 1; num <= 160; num++) paires.push([num, 20], [-num, 20]);
  paires.sort((p1, p2) => Math.abs(p1[0] / p1[1]) - Math.abs(p2[0] / p2[1]));
  return paires;
})();

const CANDIDATS_B = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 0];

const SEUIL_POLE = 1e6;

function finiModere(v: number): boolean {
  return Number.isFinite(v) && Math.abs(v) < SEUIL_POLE;
}

function estSurPourA(exerciceBase: ExerciceBaseQuellePrimitive, a: number): boolean {
  const f = exerciceBase.integrandeReference;
  return finiModere(f(a)) && finiModere(f(a - 0.01)) && finiModere(f(a + 0.01)) && Number.isFinite(exerciceBase.primitiveReference(a));
}

/** Borne reconnue en fraction simple (dénominateur ≤ 12), sinon la valeur telle quelle. */
function arrondirBorne(x: number): number {
  for (let d = 1; d <= 12; d++) {
    const n = Math.round(x * d);
    if (Math.abs(x - n / d) < 1e-6) return n / d;
  }
  return x;
}

/** Entre x1 (f défini) et x2 (f non défini ou changement de signe vers un pôle), bissection. */
function bissection(test: (x: number) => boolean, x1: number, x2: number): number {
  let gauche = x1;
  let droite = x2;
  for (let i = 0; i < 60; i++) {
    const milieu = (gauche + droite) / 2;
    if (test(milieu)) gauche = milieu;
    else droite = milieu;
  }
  return (gauche + droite) / 2;
}

/** Cherche, en partant de a dans la direction `sens`, la première singularité de f (point hors
 * domaine, ou pôle détecté par un changement de signe avec |f| qui explose). null si aucune avant
 * ±10. */
function premiereSingularite(f: (x: number) => number, a: number, sens: 1 | -1): number | null {
  const pas = 0.01 * sens;
  let precedent = a;
  let fPrecedent = f(a);
  for (let k = 1; Math.abs(precedent - a) < 10 + 1e-9 && Math.abs(a + k * pas) <= 10; k++) {
    const x = a + k * pas;
    const fx = f(x);
    // Seule une VRAIE singularité compte (valeur non définie ou infinie) : une croissance rapide
    // (e^{5x+2}, 5^x) n'est pas un bord du domaine.
    if (!Number.isFinite(fx)) {
      // Dépassement de capacité (e^{x³} pour x grand) : infini ici ET un peu plus loin — ce n'est
      // pas un pôle, on arrête simplement le balayage.
      const auDela = f(x + 5 * pas);
      if (!Number.isNaN(fx) && !Number.isNaN(auDela) && !Number.isFinite(auDela)) return null;
      return arrondirBorne(bissection((t) => Number.isFinite(f(t)), precedent, x));
    }
    if (Math.sign(fx) !== Math.sign(fPrecedent) && fx !== 0 && fPrecedent !== 0) {
      // Zéro ou pôle ? On resserre sur le changement de signe et on regarde |f|.
      let g = precedent;
      let d = x;
      for (let i = 0; i < 60; i++) {
        const m = (g + d) / 2;
        if (Math.sign(f(m)) === Math.sign(fPrecedent)) g = m;
        else d = m;
      }
      const m = (g + d) / 2;
      if (!Number.isFinite(f(m)) || Math.abs(f(m)) > 1e4) return arrondirBorne(m);
    }
    precedent = x;
    fPrecedent = fx;
  }
  return null;
}

export function intervalleDeValidite(exerciceBase: ExerciceBaseQuellePrimitive, a: number): { gauche: number | null; droite: number | null } {
  const f = exerciceBase.integrandeReference;
  return { gauche: premiereSingularite(f, a, -1), droite: premiereSingularite(f, a, 1) };
}

/** Choisit un point (a,b) domaine-sûr pour `exerciceBase` — voir en-tête de fichier. */
export function choisirPointSur(exerciceBase: ExerciceBaseQuellePrimitive): PointQuellePrimitive {
  const b = CANDIDATS_B[Math.floor(Math.random() * CANDIDATS_B.length)];
  const finaliser = (num: number, den: number): PointQuellePrimitive => {
    const a = num / den;
    const { gauche, droite } = intervalleDeValidite(exerciceBase, a);
    const point: PointQuellePrimitive = { aNum: num, aDen: den, a, b };
    if (gauche !== null || droite !== null) {
      point.intervalleGauche = gauche;
      point.intervalleDroite = droite;
    }
    return point;
  };

  const preferes = [...melanger(PALIER_1), ...melanger(PALIER_2)].filter(([n, d]) => estSurPourA(exerciceBase, n / d));
  const avecCExact = preferes.find(([n, d]) => valeurExacteLatex(b - exerciceBase.primitiveReference(n / d)) !== null);
  const choix = avecCExact ?? preferes[0];
  if (choix) return finaliser(choix[0], choix[1]);

  for (const [num, den] of CANDIDATS_FILET) {
    if (estSurPourA(exerciceBase, num / den)) return finaliser(num, den);
  }
  throw new Error("choisirPointSur : aucun point sûr trouvé dans le domaine de f");
}
