import type { DemandeEcran3FamilleC } from "../../core6e/independanceBayes.types";
import type { ExerciceFamilleEMixte, ExerciceFamilleEParametrique } from "../../core6e/probabilitesProblemes.types";
import { construireFamilleC as construireBayesNumerique, genererFamilleC as genererBayesNumerique } from "../independanceBayes/familleC";

/**
 * Couche A (6e) — génération famille E ("Bayes numérique et paramétrique") pour `6gen33`. 2
 * sous-types (spec).
 *
 * **Sous-type "mixte"** — réutilise INTÉGRALEMENT `genererFamilleC`/`construireFamilleC` de
 * `generateurs6e/independanceBayes/familleC.ts` (6gen32, Couche A ↔ Couche A, réutilisation libre au
 * sein du chantier 6e — CLAUDE.md) comme `base`. Ajoute seulement `ordreAffichage` (permutation des 3
 * données présentées à l'écran 1) — jamais de logique Bayes réimplémentée.
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

function permutation3(): [number, number, number] {
  const indices = [0, 1, 2];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices as [number, number, number];
}

export function construireFamilleEMixte(): ExerciceFamilleEMixte {
  return { famille: "E", sousType: "mixte", base: genererBayesNumerique(), ordreAffichage: permutation3() };
}

export function genererFamilleEMixte(): ExerciceFamilleEMixte {
  return construireFamilleEMixte();
}

/** Construction déterministe (`demandeEcran3` de `base` fixée) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. */
export function construireFamilleEMixteAvecDemande(demandeEcran3: DemandeEcran3FamilleC): ExerciceFamilleEMixte {
  return { famille: "E", sousType: "mixte", base: construireBayesNumerique(demandeEcran3), ordreAffichage: permutation3() };
}

// ============================================================================
// Sous-type "paramétrique".
// ============================================================================

const CONTEXTES_PARAMETRIQUE: readonly string[] = [
  "Dans une population, une proportion INCONNUE x de personnes est porteuse d'une maladie. Un test de dépistage a une sensibilité et une spécificité connues.",
  "Dans un lot de pièces, une proportion INCONNUE x est défectueuse. Un contrôle qualité automatique détecte les défauts avec une fiabilité connue.",
];

/** Candidats (a,b) — P(test+|malade)=a (sensibilité), P(test+|non malade)=b (taux de faux positifs),
 * TOUJOURS a>b (un test discriminant, spec implicite : sinon le test n'apporte aucune information). */
const CANDIDATS_AB: readonly [number, number][] = [
  [0.9, 0.1],
  [0.85, 0.15],
  [0.8, 0.2],
  [0.95, 0.05],
  [0.9, 0.2],
];

const CANDIDATS_SEUIL: readonly number[] = [0.5, 0.6, 0.7];

/** Borne de la solution de x>bound (voir `moteur6e/verificationInequationProbabilites.ts`) — utilisée
 * ici SEULEMENT pour re-tirer si la borne calculée tombe hors de ]0,1[ ou trop près d'un bord (0 ou 1)
 * — un exercice où la réponse serait "tout x" ou "aucun x" est dégénéré, jamais présenté à l'élève. */
function borneInterieure(a: number, b: number, seuil: number): number {
  // P(x) = a·x / (b + (a-b)·x) > seuil ⟺ x·(a - seuil·(a-b)) > seuil·b (dénominateur toujours >0
  // sur ]0,1[, voir `verificationInequationProbabilites.ts`).
  const coeffX = a - seuil * (a - b);
  return (seuil * b) / coeffX;
}

const MARGE_MIN = 0.05;

/** Construction déterministe ((a,b,seuil) fixés si donnés) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. Retirage borné (200 tentatives, même patron que `6gen32` familleC) si
 * la borne calculée est dégénérée (hors ]0,1[ à `MARGE_MIN` près). */
export function construireFamilleEParametrique(abFixe?: [number, number], seuilFixe?: number): ExerciceFamilleEParametrique {
  for (let tentative = 0; tentative < 200; tentative++) {
    const [a, b] = abFixe ?? tirerParmi(CANDIDATS_AB);
    const seuil = seuilFixe ?? tirerParmi(CANDIDATS_SEUIL);
    const bound = borneInterieure(a, b, seuil);
    if (bound > MARGE_MIN && bound < 1 - MARGE_MIN) {
      return { famille: "E", sousType: "parametrique", contexte: { texte: tirerParmi(CONTEXTES_PARAMETRIQUE) }, a, b, seuil };
    }
    if (abFixe && seuilFixe) break; // paramètres explicitement fixés : pas de retirage possible.
  }
  throw new Error("construireFamilleEParametrique : aucun jeu de paramètres valide trouvé");
}

export function genererFamilleEParametrique(): ExerciceFamilleEParametrique {
  return construireFamilleEParametrique();
}

// ============================================================================
// Calculs purs (sous-type paramétrique) — réutilisés par les TESTS et par `moteur6e/
// verificationProbabilitesProblemes.ts` (recalculés indépendamment côté Couche B).
// ============================================================================

/** Écran 1 — P(malade∩test+) = a·x. */
export function coeffMaladeEtTestPositif(a: number): number {
  return a;
}
/** Écran 1 — P(test+) = a·x + b·(1-x) = b + (a-b)·x. */
export function pTestPositifDeX(a: number, b: number, x: number): number {
  return a * x + b * (1 - x);
}
/** Écran 2 — P(x) = P(malade|test+) = a·x / (a·x+b·(1-x)). */
export function pXBayes(a: number, b: number, x: number): number {
  return (a * x) / pTestPositifDeX(a, b, x);
}
export { borneInterieure };
