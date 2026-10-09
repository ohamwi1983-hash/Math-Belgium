import type { CasValeurAbsolue, ExerciceLieuxA, ExerciceLieuxA_Losange, ExerciceLieuxA_NonBorne, ExerciceLieuxA_Paralleles } from "../../core6e/lieuxGeometriquesParametres.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Lieux définis par une équation à valeurs absolues") de
 * `6gen56`. 3 sous-types :
 * - "paralleles" : |αx+βy+γ|=k → 2 droites parallèles distinctes (2 écrans).
 * - "nonBorne" : |x-p|-|y-q|=k → lieu NON BORNÉ, 4 rayons formant un "nœud papillon" — 4 cas selon
 *   signe(x-p), signe(y-q) (2 écrans).
 * - "losange" : |x-p|+|y-q|=k → LOSANGE borné, mêmes 4 cas mais issus d'une SOMME (3 écrans, le 3e
 *   assemble les 4 sommets).
 *
 * **Piège central de la famille** (voir mission) : "nonBorne" (différence) et "losange" (somme) se
 * ressemblent superficiellement (2 valeurs absolues, mêmes 4 cas de signe) mais donnent des natures
 * de lieu OPPOSÉES — non borné vs borné — uniquement à cause du signe relatif des deux termes. Les 2
 * sous-types partagent donc leur mécanique de cas (`casValeurAbsolue` ci-dessous, factorisée une
 * seule fois) mais restent des sous-types SÉPARÉS avec des écrans différents (aucune fusion — voir
 * CLAUDE.md, "familles B et E ... ne pas fusionner" : même principe appliqué ici en interne à la
 * famille A).
 */

// Unicode "≥" BRUT (jamais `\geq`/`\geqslant`, commandes MATH-mode qui échouent — "Undefined
// control sequence" — une fois insérées telles quelles à l'intérieur d'un bloc `\text{...}`, où ce
// label entier est toujours embarqué par l'appelant — trouvé par échec RÉEL de
// `katex.renderToString`, jamais anticipé par relecture de code — voir
// `formatLieuxGeometriquesParametres.test.ts`).
const LABELS_CAS = ["x-p≥0,\\ y-q≥0", "x-p≥0,\\ y-q<0", "x-p<0,\\ y-q≥0", "x-p<0,\\ y-q<0"] as const;
const SIGNES: readonly (1 | -1)[] = [1, -1];

/** |u|±|v|=k (u=x-p,v=y-q), 4 cas selon signe(u),signe(v) — voir en-tête de fichier pour la preuve
 * de correction (dérivation manuelle croisée avec le test par force brute `familleA.test.ts`). */
function casValeurAbsolue(p: number, q: number, k: number, mode: "somme" | "difference"): CasValeurAbsolue[] {
  const cas: CasValeurAbsolue[] = [];
  let i = 0;
  for (const su of SIGNES) {
    for (const sv of SIGNES) {
      const a = su;
      const b = mode === "somme" ? sv : -sv;
      const c = mode === "somme" ? -su * p - sv * q - k : -su * p + sv * q - k;
      cas.push({ label: LABELS_CAS[i], a, b, c });
      i++;
    }
  }
  return cas;
}

function construireParalleles(): ExerciceLieuxA_Paralleles {
  const alpha = tirerParmi([1, 1, 1, 2] as const);
  const beta = tirerParmi([1, -1, 2, -2] as const);
  const gamma = tirerEntier(-6, 6);
  const k = tirerEntier(2, 9);
  return { famille: "A", sousType: "paralleles", alpha, beta, gamma, k, constante1: gamma - k, constante2: gamma + k };
}

function construireNonBorne(): ExerciceLieuxA_NonBorne {
  const p = tirerEntier(-4, 4);
  const q = tirerEntier(-4, 4);
  const k = tirerEntier(1, 6);
  return { famille: "A", sousType: "nonBorne", p, q, k, cas: casValeurAbsolue(p, q, k, "difference") };
}

function construireLosange(): ExerciceLieuxA_Losange {
  const p = tirerEntier(-4, 4);
  const q = tirerEntier(-4, 4);
  const k = tirerEntier(1, 6);
  const sommets = [
    { x: p + k, y: q },
    { x: p - k, y: q },
    { x: p, y: q + k },
    { x: p, y: q - k },
  ];
  return { famille: "A", sousType: "losange", p, q, k, cas: casValeurAbsolue(p, q, k, "somme"), sommets };
}

export function nombreDeCasA(exercice: ExerciceLieuxA): number {
  return exercice.sousType === "paralleles" ? 2 : 4;
}

export function construireFamilleA(): ExerciceLieuxA {
  return tirerParmi([construireParalleles, construireNonBorne, construireLosange] as const)();
}

export { construireParalleles, construireNonBorne, construireLosange, casValeurAbsolue };
