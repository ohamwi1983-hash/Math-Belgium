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
import type { StatutVerification } from "../moteur/statutVerification";
import type { ParametresSinusoideBase } from "../core5e/parametresSinusoide.types";
import type { PhaseParametresSinusoideGraphique } from "./typesParametresSinusoideGraphique";
import { TOLERANCE_SINUSOIDE, cibleAmplitude, cibleDecalage, cibleFrequence, ciblePeriode, diagnostiquerValeurModulo, diagnostiquerValeurSinusoide, verifierValeurSinusoide } from "./verificationParametresSinusoide";

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
 * le graphique affiche plusieurs cycles et donc plusieurs passages ascendants valides. Même logique
 * que `diagnostiquerValeurModulo` (5gen8), réutilisée telle quelle. */
export function diagnostiquerPhiModuloT(texte: string, phiCible: number, periode: number): StatutVerification {
  return diagnostiquerValeurModulo(texte, phiCible, periode);
}

export function verifierPhiModuloT(texte: string, phiCible: number, periode: number): boolean {
  return diagnostiquerPhiModuloT(texte, phiCible, periode) === "correct";
}

/** Pulsation ω = 2π/T. */
export function ciblePulsationGraphique(exercice: ParametresSinusoideBase): number {
  return (2 * Math.PI) / ciblePeriode(exercice);
}

/** Phase φ = −ω·x₀, x₀ = passage ascendant retenu (amplitude prise POSITIVE, comme l'amplitude
 * demandée |A| : f(x) = |A|·sin(ωx + φ) + b) — acceptée à 2π près (tout autre passage ascendant
 * x₀ + kT donne φ − 2kπ). */
export function cibleDephasageGraphique(exercice: ParametresSinusoideBase): number {
  return -ciblePulsationGraphique(exercice) * cibleAscendantPrincipal(exercice);
}

/** Diagnostic d'UNE saisie pour l'écran `phase` — source unique pour le score (session) ET pour le
 * message d'erreur affiché (appli). */
export function diagnostiquerPhaseParametresSinusoideGraphique(exercice: ParametresSinusoideBase, phase: PhaseParametresSinusoideGraphique, texte: string): StatutVerification {
  switch (phase) {
    case "decalage":
      return diagnostiquerValeurSinusoide(texte, cibleDecalage(exercice));
    case "amplitude":
      return diagnostiquerValeurSinusoide(texte, cibleAmplitude(exercice));
    case "periode":
      return diagnostiquerValeurSinusoide(texte, ciblePeriode(exercice));
    case "pulsation":
      return diagnostiquerValeurSinusoide(texte, ciblePulsationGraphique(exercice));
    case "frequence":
      return diagnostiquerValeurSinusoide(texte, cibleFrequence(exercice));
    case "phi":
      return diagnostiquerPhiModuloT(texte, cibleAscendantPrincipal(exercice), ciblePeriode(exercice));
    case "dephasage":
      return diagnostiquerValeurModulo(texte, cibleDephasageGraphique(exercice), 2 * Math.PI);
  }
}
