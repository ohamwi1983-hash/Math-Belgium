import type { EnsembleReelGuide, MorceauIntervalle } from "../core6e/ensembleReel.types";
import type { ExerciceGraphiquesCyclometriques, ParticulariteParite } from "../core6e/graphiquesCyclometriques.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerReel } from "./evaluationGraphiquesCyclometriques";

/**
 * Couche B (6e) — vérification de l'écran unique de `6gen5` : la lettre choisie (jugée sur son
 * propre mérite) + les 6 sous-réponses de justification (chacune évaluée et trackée
 * INDÉPENDAMMENT, jamais confondues entre elles). Tolérance généreuse (0.02) sur toute comparaison
 * numérique — certains domaines/images sont génériquement IRRATIONNELS (voir l'en-tête de
 * `core6e/graphiquesCyclometriques.types.ts`), jamais la tolérance 1e-6 de `verifierEnsembleReelGuide`
 * (6gen1/6gen3, domaines toujours rationnels par construction là-bas).
 */
const TOLERANCE = 0.02;

function proche(a: number, b: number): boolean {
  return Math.abs(a - b) < TOLERANCE;
}

export type ReponseExistence = { existe: false } | { existe: true; valeur: number };
export type ReponseExtremum = { existe: false } | { existe: true; x: number; y: number };

export interface ReponseEcranUniqueGraphiquesCyclometriques {
  lettre: number;
  ordonnee: ReponseExistence;
  domf: EnsembleReelGuide;
  imf: EnsembleReelGuide;
  parite: ParticulariteParite;
  maximum: ReponseExtremum;
  minimum: ReponseExtremum;
}

export interface DiagnosticEcranUniqueGraphiquesCyclometriques {
  lettre: StatutVerification;
  ordonnee: StatutVerification;
  domf: StatutVerification;
  imf: StatutVerification;
  parite: StatutVerification;
  maximum: StatutVerification;
  minimum: StatutVerification;
  global: boolean;
}

function memeValeur(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a === b;
  return Math.abs(a - b) < TOLERANCE;
}

function memeMorceau(a: MorceauIntervalle, b: MorceauIntervalle): boolean {
  return memeValeur(a.inf, b.inf) && memeValeur(a.sup, b.sup) && a.infInclus === b.infInclus && a.supInclus === b.supInclus;
}

function trierMorceaux(morceaux: MorceauIntervalle[]): MorceauIntervalle[] {
  return [...morceaux].sort((a, b) => (a.inf ?? -Infinity) - (b.inf ?? -Infinity));
}

/** Comparaison STRUCTURELLE d'un `EnsembleReelGuide` (ensembliste, ordre indifférent) à tolérance
 * généreuse — réplique le PRINCIPE de `verificationEnsembleReel.ts::verifierEnsembleReelGuide`
 * (6gen1/6gen3), réimplémentée ici avec une tolérance adaptée à ce générateur (voir en-tête de
 * fichier) plutôt qu'importée telle quelle. */
export function diagnostiquerEnsembleReelGraphiqueCyclo(saisie: EnsembleReelGuide, attendu: EnsembleReelGuide): StatutVerification {
  if (saisie.forme !== attendu.forme) return "not_equivalent";
  if (attendu.forme === "reel") return "correct";
  if (attendu.forme === "prive_points") {
    const a = [...attendu.points].sort((x, y) => x - y);
    const s = [...saisie.points].sort((x, y) => x - y);
    return a.length === s.length && a.every((v, i) => Math.abs(v - s[i]) < TOLERANCE) ? "correct" : "not_equivalent";
  }
  const a = trierMorceaux(attendu.morceaux);
  const s = trierMorceaux(saisie.morceaux);
  return a.length === s.length && a.every((m, i) => memeMorceau(m, s[i])) ? "correct" : "not_equivalent";
}

function diagnostiquerExistence(saisie: ReponseExistence, attendu: { existe: boolean; valeur: number | null }): StatutVerification {
  if (saisie.existe !== attendu.existe) return "not_equivalent";
  if (!saisie.existe || !attendu.existe) return "correct";
  return proche(saisie.valeur, attendu.valeur as number) ? "correct" : "not_equivalent";
}

/** Vérifie un extremum PAR COHÉRENCE INTERNE : la position x saisie n'est jamais comparée à une
 * position figée (peut ne pas être unique — ex. familles C/F paires où l'extremum est atteint aux 2
 * bornes du domaine) — on ré-évalue f au point x soumis et on confirme que cette valeur atteint
 * bien l'extremum attendu (`attendu.valeur`), ET que la valeur y soumise par l'élève correspond
 * elle aussi à cette ré-évaluation. */
function diagnostiquerExtremum(exercice: ExerciceGraphiquesCyclometriques, saisie: ReponseExtremum, attendu: { existe: boolean; valeur: number | null }): StatutVerification {
  if (saisie.existe !== attendu.existe) return "not_equivalent";
  if (!saisie.existe || !attendu.existe) return "correct";
  const yReel = evaluerReel(exercice, saisie.x);
  if (yReel === null || !Number.isFinite(yReel)) return "not_equivalent";
  if (!proche(yReel, saisie.y)) return "not_equivalent";
  if (!proche(yReel, attendu.valeur as number)) return "not_equivalent";
  return "correct";
}

export function diagnostiquerEcranUnique(
  exercice: ExerciceGraphiquesCyclometriques,
  reponse: ReponseEcranUniqueGraphiquesCyclometriques,
): DiagnosticEcranUniqueGraphiquesCyclometriques {
  const props = exercice.proprietes;
  const lettre: StatutVerification = reponse.lettre === exercice.indexCorrect ? "correct" : "not_equivalent";
  const ordonnee = diagnostiquerExistence(reponse.ordonnee, props.ordonnee);
  const domf = diagnostiquerEnsembleReelGraphiqueCyclo(reponse.domf, props.domf);
  const imf = diagnostiquerEnsembleReelGraphiqueCyclo(reponse.imf, props.imf);
  const parite: StatutVerification = reponse.parite === props.parite ? "correct" : "not_equivalent";
  const maximum = diagnostiquerExtremum(exercice, reponse.maximum, props.maximum);
  const minimum = diagnostiquerExtremum(exercice, reponse.minimum, props.minimum);
  const global = [lettre, ordonnee, domf, imf, parite, maximum, minimum].every((s) => s === "correct");
  return { lettre, ordonnee, domf, imf, parite, maximum, minimum, global };
}

export function verifierEcranUnique(exercice: ExerciceGraphiquesCyclometriques, reponse: ReponseEcranUniqueGraphiquesCyclometriques): boolean {
  return diagnostiquerEcranUnique(exercice, reponse).global;
}
