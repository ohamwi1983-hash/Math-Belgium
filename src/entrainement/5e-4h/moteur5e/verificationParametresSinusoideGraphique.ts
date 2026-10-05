/**
 * Couche B (5e) — vérification pour 5gen9 ("Paramètres d'une fonction sinusoïdale — lecture
 * graphique"). Réutilise DIRECTEMENT (moteur→moteur, explicitement autorisé) `diagnostiquerValeurSinusoide`/
 * `verifierValeurSinusoide`/`cibleAmplitude`/`ciblePeriode`/`cibleFrequence`/`cibleDecalage` de
 * 5gen8 (`verificationParametresSinusoide.ts`) — la même arithmétique exacte, jamais une 3e copie.
 *
 * Seul l'écran φ diverge du schéma générique "une seule valeur cible, tolérance ±0.01" : la
 * position lue sur le graphique n'est PAS unique (le graphique montre plusieurs cycles, donc
 * plusieurs passages ascendants valides apparaissent) — `diagnostiquerPhiModuloT` accepte toute
 * réponse φ_cible+k·T (k entier relatif quelconque), voir la spec ("vérification par équivalence
 * modulo T").
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ParametresSinusoideBase } from "../core5e/parametresSinusoide.types";
import { TOLERANCE_SINUSOIDE, cibleAmplitude, cibleDecalage, cibleFrequence, ciblePeriode, diagnostiquerValeurSinusoide, verifierValeurSinusoide } from "./verificationParametresSinusoide";

export { TOLERANCE_SINUSOIDE, cibleAmplitude, cibleDecalage, cibleFrequence, ciblePeriode, diagnostiquerValeurSinusoide, verifierValeurSinusoide };

function valeurRationnelPiLocal(numerateur: number, denominateur: number, degrePi: number): number {
  return (numerateur / denominateur) * Math.PI ** degrePi;
}

/** Position du passage ascendant le plus proche de φ — φ lui-même si A>0, φ+T/2 si A<0 (même
 * dérivation que `ui5e/sinusoideGraph.ts::xAscendantPrincipal`, dupliquée ici en pur JS/Math
 * puisque `src/moteur5e/` ne peut jamais importer `src/generateurs5e/`/`src/ui5e/`). N'importe quel
 * ancrage sur la famille des passages ascendants convient : `diagnostiquerPhiModuloT` normalise
 * ensuite modulo T. */
export function cibleAscendantPrincipal(exercice: ParametresSinusoideBase): number {
  const { A } = exercice;
  const magnitude = A.rationnelle ? A.rationnelle.numerateur / A.rationnelle.denominateur : Math.sqrt(A.radicande!);
  const signeA = A.signe * magnitude;
  const phi = valeurRationnelPiLocal(exercice.phi.numerateur, exercice.phi.denominateur, exercice.phi.degrePi);
  const T = valeurRationnelPiLocal(exercice.T.numerateur, exercice.T.denominateur, exercice.T.degrePi);
  return signeA > 0 ? phi : phi + T / 2;
}

/** Accepte toute réponse φ_cible+k·T (k entier relatif) — jamais une seule valeur exacte, puisque
 * le graphique affiche plusieurs cycles et donc plusieurs passages ascendants valides. */
export function diagnostiquerPhiModuloT(texte: string, phiCible: number, periode: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    const ecart = valeur - phiCible;
    const k = Math.round(ecart / periode);
    const reste = ecart - k * periode;
    return Math.abs(reste) <= TOLERANCE_SINUSOIDE ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

export function verifierPhiModuloT(texte: string, phiCible: number, periode: number): boolean {
  return diagnostiquerPhiModuloT(texte, phiCible, periode) === "correct";
}
