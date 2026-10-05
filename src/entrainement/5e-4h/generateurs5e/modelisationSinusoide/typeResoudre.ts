/**
 * Couche A (5e) — Phase 2, Type 1 de 5gen13 ("Résoudre f(t)=k"). Réutilise le PRINCIPE du pipeline
 * de 5gen10 (2 branches en u pour `sin(u)=m`, `m=(k-b)/A`, cas "aucune solution" si |m|>1) mais
 * filtré dans [0;fenêtre] au lieu de [0;2π[ — `resoudreDansFenetre`/`construireBrancheT`
 * (`phase2Commun.ts`, module frère) portent tout le balayage/filtrage.
 */
import type { BrancheModelisation, FonctionModelisationSinusoide, QuestionResoudre } from "../../core5e/modelisationSinusoide.types";
import { construireBrancheT, resoudreDansFenetre } from "./phase2Commun";

const PROBABILITE_SOLVABLE = 0.75;

function reelAleatoire(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** 2 branches standard pour sin(u)=m : u=arcsin(m)+2nπ OU u=π-arcsin(m)+2nπ. */
function branchesUPourM(m: number): BrancheModelisation[] {
  const arc = Math.asin(m);
  return [
    { constante: arc, periode: 2 * Math.PI },
    { constante: Math.PI - arc, periode: 2 * Math.PI },
  ];
}

export function genererQuestionResoudre(fonction: FonctionModelisationSinusoide, fenetre: number): QuestionResoudre {
  const { A, omega, phi, b } = fonction;
  if (phi === null) throw new Error("genererQuestionResoudre : phi doit être numériquement connu (jamais tiré pour la technique 'b1')");

  const solvable = Math.random() < PROBABILITE_SOLVABLE;
  const m = solvable ? reelAleatoire(-0.9, 0.9) : reelAleatoire(1.05, 1.6) * (Math.random() < 0.5 ? 1 : -1);
  const k = A * m + b;

  if (!solvable) {
    return { type: "resoudre", k, fenetre, aucuneSolution: true, branchesU: [], branchesT: [], solutions: [] };
  }

  const branchesU = branchesUPourM(m);
  const branchesT = branchesU.map((br) => construireBrancheT(br, omega, phi));
  const solutions = resoudreDansFenetre(branchesT, fenetre);

  return { type: "resoudre", k, fenetre, aucuneSolution: false, branchesU, branchesT, solutions };
}
