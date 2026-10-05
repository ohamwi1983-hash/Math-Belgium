import type { ExerciceDeriveeB, VTypeFamilleB } from "../../../core6e/deriveesCyclometriques.types";
import { ARCFONCTIONS, tirerEntier, tirerParmi } from "../aleatoire";
import { MARGE_ARCFONCTION } from "../constantes";
import { chercherPointsValides } from "../pointsEchantillon";

const TENTATIVES_MAX = 300;
const V_TYPES: readonly VTypeFamilleB[] = ["simple", "quadratique"];
const M = [2, 3, 4, 5] as const;
const A_QUAD = [3, 4, 5, 6, 7, 8, 9] as const;

function argumentV(vType: VTypeFamilleB, a: number, b: number, x: number): number {
  return vType === "simple" ? x : a * x * x + b;
}

/**
 * Famille B — f(x) = u(x)·arcfonction(v(x)), u(x)=m·x, v tiré parmi {x, a·x²+b}. Reroll BORNÉ
 * uniquement pour garantir une fenêtre de points d'échantillonnage valide (`b` négatif requis
 * pour que `a·x²+b` puisse redescendre sous `MARGE_ARCFONCTION`, sinon toujours ≥ b et donc hors
 * domaine pour un `b` positif trop grand — le retirage l'élimine naturellement).
 */
export function construireB(): ExerciceDeriveeB {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const arcfonction = tirerParmi(ARCFONCTIONS);
    const m = tirerParmi(M);
    const vType = tirerParmi(V_TYPES);
    const a = vType === "quadratique" ? tirerParmi(A_QUAD) : 0;
    const b = vType === "quadratique" ? tirerEntier(-3, 3) : 0;

    const pointsEchantillonnage = chercherPointsValides((x) => Math.abs(argumentV(vType, a, b, x)) < MARGE_ARCFONCTION);
    if (pointsEchantillonnage === null) continue;

    return { famille: "B", arcfonction, m, vType, a, b, pointsEchantillonnage };
  }
  throw new Error("construireB : aucune combinaison valide trouvée après retirage");
}
