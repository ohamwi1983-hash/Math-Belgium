import type { ExerciceLoiBinomialeB } from "../../core6e/loiBinomiale.types";
import { combinaisonBig, rationnel } from "../../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../../moteur6e/saisieCombinatoire";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { CONTEXTES_B, virgule } from "./contextes";

/**
 * 6gen50, famille B (décision 3 de l'utilisateur) : loi COMPLÈTE de 𝓑(n ; p), diagramme en barres à
 * reconnaître parmi trois (le juste, son miroir 𝓑(n ; 1 − p), et 𝓑(n ; 0,5)), puis E(X), V(X), σ(X).
 * n de 3 à 5 (au plus six probabilités à calculer), p en dixièmes sauf 0,5.
 */

export function construireFamilleB(): ExerciceLoiBinomialeB {
  const n = tirerEntier(3, 5);
  const c = tirerParmi(CONTEXTES_B);
  const p = tirerParmi(c.p);
  const ordre: ExerciceLoiBinomialeB["ordreDiagrammes"] = ["juste", "miroir", "autre"];
  for (let i = ordre.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
  }
  return { famille: "B", texte: c.texte(n, virgule(p)), succes: c.succes, n, p, ordreDiagrammes: ordre };
}

/** P(X = k) exacte pour p en dixièmes. */
export function probabiliteBinomiale(n: number, p: number, k: number): Rationnel {
  const P = BigInt(Math.round(p * 10));
  return rationnel(combinaisonBig(n, k) * P ** BigInt(k) * (10n - P) ** BigInt(n - k), 10n ** BigInt(n));
}

export function loiBinomialeExacte(n: number, p: number): Rationnel[] {
  return Array.from({ length: n + 1 }, (_, k) => probabiliteBinomiale(n, p, k));
}

export function pDiagramme(e: ExerciceLoiBinomialeB, quoi: "juste" | "miroir" | "autre"): number {
  return quoi === "juste" ? e.p : quoi === "miroir" ? Math.round((1 - e.p) * 10) / 10 : 0.5;
}
