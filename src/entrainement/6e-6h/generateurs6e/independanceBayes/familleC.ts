import type { ContexteFamilleC, DemandeEcran3FamilleC, ExerciceFamilleC } from "../../core6e/independanceBayes.types";

/**
 * Couche A (6e) — génération famille C ("Arbre de probabilité et théorème de Bayes") pour `6gen32`.
 * Deux causes (p, 1−p), probabilité conditionnelle d'un effet sachant chaque cause (q1, q2) — valeurs
 * DÉCIMALES directement (voir en-tête de `core6e/independanceBayes.types.ts`).
 *
 * Audit 6e ch. 6 : q1 et q2 étaient tirés dans {0,1 ; … ; 0,4} — un « test » qui ne détecte le défaut
 * qu'une fois sur 5 et donne autant de faux positifs n'a aucun sens. Désormais q1 ∈ [0,7 ; 0,99]
 * (sensibilité) et q2 ∈ [0,01 ; 0,3] (faux positifs).
 *
 * **Réutilisé par `6gen33`** (famille E « mixte », `generateurs6e/probabilitesProblemes/familleE.ts`) :
 * garder les signatures exportées `construireFamilleC(demandeEcran3)` et `genererFamilleC()`.
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const CONTEXTES_C: readonly ContexteFamilleC[] = [
  { id: "freins", texte: "Dans un lot de voitures d'occasion, une voiture a soit des freins défectueux, soit des freins en bon état. On soumet la voiture à un test de freinage.", labelCause1: "les freins sont défectueux", labelCause2: "les freins sont en bon état", labelEffet: "le test de freinage détecte une anomalie" },
  { id: "medical", texte: "Dans une population, une personne est soit porteuse d'une maladie, soit non porteuse. On lui fait passer un test de dépistage.", labelCause1: "la personne est porteuse de la maladie", labelCause2: "la personne n'est pas porteuse de la maladie", labelEffet: "le test est positif" },
  { id: "composant", texte: "À la sortie d'une chaîne de production, un composant électronique est soit défectueux, soit conforme. On le soumet à un contrôle qualité.", labelCause1: "le composant est défectueux", labelCause2: "le composant est conforme", labelEffet: "le contrôle détecte un défaut" },
];

/** p∈{0,1; 0,15; 0,2; 0,25} — spec. */
const CANDIDATS_P: readonly number[] = [0.1, 0.15, 0.2, 0.25];

/** q1 = P(effet | cause1) ∈ [0,7 ; 0,99] — sensibilité d'un test réaliste. */
const CANDIDATS_Q1: readonly number[] = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.98, 0.99];

/** q2 = P(effet | cause2) ∈ [0,01 ; 0,3] — taux de faux positifs. */
const CANDIDATS_Q2: readonly number[] = [0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3];

/** Écart minimal exigé entre le résultat de Bayes (écran 3) et la valeur "piège" (le sens
 * inversé de la conditionnelle — confondre P(cause1|effet) avec P(effet|cause1)=q1, ou
 * P(cause1|pas effet) avec P(pas effet|cause1)=1−q1) — garantit que le piège documenté par la spec
 * (écran 3) reste TOUJOURS détectable par la vérification, jamais une coïncidence numérique où les
 * deux quantités se retrouveraient accidentellement proches. Retirage
 * borné (200 tentatives) si l'écart est trop faible — même patron que `ECART_MINIMAL_CONDITIONNELLES`
 * de `6gen30` familleA.ts. */
const ECART_MINIMAL_BAYES = 0.05;

function pEffet(p: number, q1: number, q2: number): number {
  return p * q1 + (1 - p) * q2;
}

function resultatBayes(p: number, q1: number, q2: number, demandeEcran3: DemandeEcran3FamilleC): number {
  const pe = pEffet(p, q1, q2);
  return demandeEcran3 === "cause1SachantEffet" ? (p * q1) / pe : (p * (1 - q1)) / (1 - pe);
}

function valeurPiegeSensInverse(q1: number, demandeEcran3: DemandeEcran3FamilleC): number {
  return demandeEcran3 === "cause1SachantEffet" ? q1 : 1 - q1;
}

/** Construction déterministe (demandeEcran3 fixée) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. */
export function construireFamilleC(demandeEcran3: DemandeEcran3FamilleC): ExerciceFamilleC {
  for (let tentative = 0; tentative < 200; tentative++) {
    const p = tirerParmi(CANDIDATS_P);
    const q1 = tirerParmi(CANDIDATS_Q1);
    const q2 = tirerParmi(CANDIDATS_Q2);
    const bayes = resultatBayes(p, q1, q2, demandeEcran3);
    const piege = valeurPiegeSensInverse(q1, demandeEcran3);
    if (Math.abs(bayes - piege) < ECART_MINIMAL_BAYES) continue;
    const contexte = tirerParmi(CONTEXTES_C);
    return { famille: "C", contexte, p, q1, q2, demandeEcran3 };
  }
  throw new Error("construireFamilleC : aucun jeu de paramètres valide trouvé après 200 tentatives");
}

const DEMANDES_C: readonly DemandeEcran3FamilleC[] = ["cause1SachantEffet", "cause1SachantPasEffet"];

/** Tirage ÉQUIPROBABLE de la demande écran 3. */
export function genererFamilleC(): ExerciceFamilleC {
  return construireFamilleC(tirerParmi(DEMANDES_C));
}
