import type { ConfigurationFamilleF, ContexteFamilleF, DemandeEcran3FamilleF, ExerciceFamilleF } from "../../core6e/probabilitesProblemes.types";

/**
 * Couche A (6e) — génération famille F ("Fiabilité de circuits") pour `6gen33`. 3 composants
 * indépendants, probabilités de FONCTIONNEMENT p1,p2,p3 données. Configuration tirée parmi série
 * (tous doivent fonctionner), parallèle (au moins un doit fonctionner), mixte (un composant en série
 * avec deux autres en parallèle, position tirée). Piège central de la spec : confondre "en série"
 * (produit) et "en parallèle" (complément du produit des probabilités de panne) — JAMAIS
 * interchangeables.
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const CONTEXTES_F: readonly ContexteFamilleF[] = [
  { id: "electronique", texte: "Un système électronique est composé de 3 composants indépendants, chacun ayant sa propre probabilité de fonctionner correctement.", labelComposants: ["Composant 1", "Composant 2", "Composant 3"] },
  { id: "alimentation", texte: "Un système d'alimentation de secours comporte 3 modules indépendants, chacun ayant sa propre probabilité de fonctionner en cas de coupure.", labelComposants: ["Module 1", "Module 2", "Module 3"] },
];

const CANDIDATS_P: readonly number[] = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95];
const CONFIGURATIONS: readonly ConfigurationFamilleF[] = ["serie", "parallele", "mixte"];

function tirerProbabilites(): [number, number, number] {
  return [tirerParmi(CANDIDATS_P), tirerParmi(CANDIDATS_P), tirerParmi(CANDIDATS_P)];
}

/** Valeur de fiabilité d'une configuration donnée (série/parallèle/mixte) avec les probabilités `p`
 * — LA fonction réutilisée par écran 2 ET écran 3 (variante "comparerValeur"), jamais recalculée
 * indépendamment (CLAUDE.md). */
export function valeurConfiguration(p: [number, number, number], configuration: ConfigurationFamilleF, positionMixte?: 0 | 1 | 2): number {
  if (configuration === "serie") return p[0] * p[1] * p[2];
  if (configuration === "parallele") return 1 - (1 - p[0]) * (1 - p[1]) * (1 - p[2]);
  const solo = positionMixte ?? 0;
  const autres = [0, 1, 2].filter((i) => i !== solo);
  const fiabiliteParallele = 1 - (1 - p[autres[0]]) * (1 - p[autres[1]]);
  return p[solo] * fiabiliteParallele;
}

/** Valeur obtenue en appliquant la formule de l'AUTRE configuration de base (série↔parallèle) au même
 * jeu de probabilités — LE piège central de la spec, utilisé pour construire une affirmation FAUSSE
 * plausible (variante "verifierAffirmation") ou pour un test de rejet (Playwright). */
export function valeurAvecFormuleInversee(p: [number, number, number], configuration: ConfigurationFamilleF): number {
  if (configuration === "serie") return valeurConfiguration(p, "parallele");
  if (configuration === "parallele") return valeurConfiguration(p, "serie");
  return valeurConfiguration(p, "serie"); // mixte : confondre avec "tout en série" (piège plausible).
}

function positionMixteAlternative(position: 0 | 1 | 2): 0 | 1 | 2 {
  const candidats: (0 | 1 | 2)[] = [0, 1, 2].filter((i) => i !== position) as (0 | 1 | 2)[];
  return tirerParmi(candidats);
}

function configurationAlternativePour(configuration: ConfigurationFamilleF): ConfigurationFamilleF {
  if (configuration === "serie") return "parallele";
  if (configuration === "parallele") return "serie";
  return "mixte";
}

/** Construction déterministe (`configuration`/`demandeEcran3` fixés) — utilisée par
 * `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. */
export function construireFamilleF(configuration: ConfigurationFamilleF, demandeEcran3: DemandeEcran3FamilleF): ExerciceFamilleF {
  const contexte = tirerParmi(CONTEXTES_F);
  const p = tirerProbabilites();
  const positionMixte: 0 | 1 | 2 | undefined = configuration === "mixte" ? tirerParmi([0, 1, 2] as const) : undefined;

  const base: ExerciceFamilleF = { famille: "F", contexte, p, configuration, positionMixte, demandeEcran3 };

  if (demandeEcran3 === "comparerValeur") {
    const configurationAlternative = configurationAlternativePour(configuration);
    const positionMixteAlt = configurationAlternative === "mixte" ? tirerParmi([0, 1, 2] as const) : configuration === "mixte" && positionMixte !== undefined ? positionMixteAlternative(positionMixte) : undefined;
    return { ...base, configurationAlternative, positionMixteAlternative: positionMixteAlt };
  }

  // "verifierAffirmation" — une fois sur deux, l'affirmation reprend la valeur CORRECTE (arrondie),
  // l'autre fois la valeur obtenue par la formule INVERSÉE (piège série/parallèle) — jamais la même
  // moitié à chaque appel (spec : l'élève doit vraiment JUGER, pas deviner un motif fixe).
  const valeurCorrecte = valeurConfiguration(p, configuration, positionMixte);
  const valeurFausse = valeurAvecFormuleInversee(p, configuration);
  // Garde : si la formule inversée retombe (par coïncidence numérique) trop près de la valeur
  // correcte, ce n'est plus un piège détectable — on retient alors la valeur correcte (jamais un
  // "faux" indétectable présenté comme tel).
  const ecartSuffisant = Math.abs(valeurFausse - valeurCorrecte) >= 0.02;
  const affirmationValeur = Math.random() < 0.5 || !ecartSuffisant ? valeurCorrecte : valeurFausse;
  return { ...base, affirmationValeur };
}

export function genererFamilleF(): ExerciceFamilleF {
  return construireFamilleF(tirerParmi(CONFIGURATIONS), tirerParmi(["comparerValeur", "verifierAffirmation"] as const));
}

// ============================================================================
// Calculs purs supplémentaires — réutilisés par les TESTS et par `moteur6e/
// verificationProbabilitesProblemes.ts`.
// ============================================================================

/** Écran 3, variante "comparerValeur" — valeur de la configuration ALTERNATIVE. */
export function valeurEcran3Comparaison(exercice: ExerciceFamilleF): number {
  const config = exercice.configurationAlternative ?? exercice.configuration;
  return valeurConfiguration(exercice.p, config, exercice.positionMixteAlternative);
}

/** Écran 3, variante "verifierAffirmation" — l'affirmation est-elle vraie (à tolérance près) ? */
export function affirmationEstVraie(exercice: ExerciceFamilleF, tolerance = 0.01): boolean {
  const valeurCorrecte = valeurConfiguration(exercice.p, exercice.configuration, exercice.positionMixte);
  return Math.abs((exercice.affirmationValeur ?? Number.NaN) - valeurCorrecte) <= tolerance;
}
