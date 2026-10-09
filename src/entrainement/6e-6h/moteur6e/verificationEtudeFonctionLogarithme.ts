import type {
  CibleAsymptote,
  CibleConcaviteLog,
  CibleCroissanceGrilleC,
  ComportementInfiniE,
  ExerciceEtudeFonctionLogarithme,
  ExerciceEtudeLogE,
  ExerciceEtudeLogNonE,
  SigneCroissance,
  StatutLimiteQualitatif,
  TypeConcaviteLog,
} from "../core6e/etudeFonctionLogarithme.types";
import type { CibleCroissance, TypeCroissance } from "../core6e/etudeFonctionExponentielle.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquivalenceFonction, diagnostiquerValeur, evaluerExpressionExponentielle } from "./equivalenceExponentielle";
import { verifierReponseLimite } from "./verificationLimitesExponentielles";
import type { ReponseLimite } from "./verificationLimitesExponentielles";

/**
 * Couche B (6e) — vérification pour `6gen21`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationEtudeFonctionLogarithme.test.ts` pour la preuve avec des exercices factices définis
 * localement.
 *
 * **Réutilisation directe (moteur→moteur, même chantier, même principe que `6gen11`)** —
 * `verifierEnsembleReelGuide` (domaine), `verifierReponseLimite`/`ReponseLimite` (limites),
 * `diagnostiquerValeur`/`diagnostiquerEquivalenceFonction`/`diagnostiquerEnsembleValeurs`
 * (équivalence numérique, "Algebrite/mathjs" des specs source) — jamais réimplémentés.
 *
 * **`limites`/`asymptotes` — écrans à ARITÉ VARIABLE (2 à 6 directions), vérifiés par un SEUL
 * mécanisme générique** (zip tableau réponse ↔ tableau cible) plutôt que 3 fonctions dupliquées par
 * nombre de directions (voir la note de conception de `core6e/etudeFonctionLogarithme.types.ts`).
 *
 * **Asymptotes — équation TEXTE LIBRE, jamais les mécanismes ∅/ℝ/intervalle** — même décision de
 * conception que `6gen11` (`verifierEquationAsymptoteLog`, réplique locale).
 */

const TOLERANCE = 0.01;
const POINTS_OBLIQUE = [-3.3, -1.7, 1.1, 2.9];

// ============================================================================
// Écran "domaine" — délégation directe à `verifierEnsembleReelGuide` (les 5 familles ont un écran
// domaine, y compris E).
// ============================================================================

export function verifierEcranDomaine(exercice: ExerciceEtudeFonctionLogarithme, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.domaine);
}

// ============================================================================
// Écran "limites" — arité variable (2 pour A/B/D, 6 pour C). Famille E n'a pas cet écran (son
// équivalent qualitatif est `verifierEcranComportementInfiniE`, plus bas).
// ============================================================================

export function verifierEcranLimites(exercice: ExerciceEtudeLogNonE, reponse: ReponseLimite[]): boolean {
  const cibles = exercice.limites;
  if (reponse.length !== cibles.length) return false;
  return cibles.every((c, i) => verifierReponseLimite(c, reponse[i]));
}

// ============================================================================
// Écran "asymptotes" — arité variable (1 pour B, 2 pour A/C/D). Réponse GUIDÉE "existe/n'existe
// pas" + équation texte libre conditionnelle, comme `6gen11`.
// ============================================================================

export interface ReponseAsymptoteDirection {
  existe: boolean;
  /** ignoré si `existe===false`. */
  texte: string;
}

function verifierEquationAsymptoteLog(texte: string, cible: CibleAsymptote): boolean {
  const i = texte.indexOf("=");
  if (i === -1) return false;
  const gauche = texte.slice(0, i).trim().toLowerCase();
  const droite = texte.slice(i + 1);
  if (cible.type === "horizontale") {
    return gauche === "y" && diagnostiquerValeur(droite, cible.valeur, TOLERANCE) === "correct";
  }
  if (cible.type === "verticale") {
    return gauche === "x" && diagnostiquerValeur(droite, cible.p, TOLERANCE) === "correct";
  }
  if (cible.type === "oblique") {
    if (gauche !== "y") return false;
    return diagnostiquerEquivalenceFonction(droite, (x) => cible.a * x + cible.b, POINTS_OBLIQUE, TOLERANCE) === "correct";
  }
  return false; // cible.type === "aucune" — jamais atteint, traité avant l'appel.
}

export function verifierEcranAsymptotes(exercice: ExerciceEtudeLogNonE, reponse: ReponseAsymptoteDirection[]): boolean {
  const cibles = exercice.asymptotes;
  if (reponse.length !== cibles.length) return false;
  return cibles.every((c, i) => {
    if (c.type === "aucune") return reponse[i].existe === false;
    if (!reponse[i].existe) return false;
    return verifierEquationAsymptoteLog(reponse[i].texte, c);
  });
}

// ============================================================================
// Écran "croissance" — 2 formes structurellement distinctes : "standard" (catégorie + position
// d'extremum optionnelle, familles A/B/D, même contrat `CibleCroissance` que `6gen11`) et "grilleC"
// (tableau de signe à 4 cases fixes, famille C uniquement).
// ============================================================================

export interface ReponseCroissanceStandard {
  type: TypeCroissance;
  /** texte libre, ignoré si `cible.position===null`. */
  position: string;
}

export function verifierEcranCroissanceStandard(cible: CibleCroissance, reponse: ReponseCroissanceStandard): boolean {
  if (reponse.type !== cible.type) return false;
  if (cible.position === null) return true;
  return diagnostiquerValeur(reponse.position, cible.position, TOLERANCE) === "correct";
}

export interface ReponseCroissanceGrilleC {
  signes: SigneCroissance[];
  positionMax: string;
}

export function verifierEcranCroissanceGrilleC(cible: CibleCroissanceGrilleC, reponse: ReponseCroissanceGrilleC): boolean {
  if (reponse.signes.length !== cible.signes.length) return false;
  if (!cible.signes.every((s, i) => s === reponse.signes[i])) return false;
  return diagnostiquerValeur(reponse.positionMax, cible.positionMax, TOLERANCE) === "correct";
}

// ============================================================================
// Écran "concavité" — généralise `6gen11` à 0..N points d'inflexion (pattern add-as-needed côté
// écran, `diagnostiquerEnsembleValeurs` déjà taillé pour une comparaison de LISTE ordre-indifférent
// — jamais réimplémenté).
// ============================================================================

export interface ReponseConcaviteLog {
  type: TypeConcaviteLog;
  /** texte libre par position, ignoré si `cible.type !== "inflexions"`. */
  positionsTexte: string[];
}

export function verifierEcranConcavite(cible: CibleConcaviteLog, reponse: ReponseConcaviteLog): boolean {
  if (reponse.type !== cible.type) return false;
  if (cible.type !== "inflexions") return true;
  return diagnostiquerEnsembleValeurs(reponse.positionsTexte, cible.positions, TOLERANCE) === "correct";
}

// ============================================================================
// Écran "graphique" — QCM, familles A-D uniquement (E n'a pas de QCM graphique, spec explicite).
// ============================================================================

export function verifierEcranGraphique(exercice: ExerciceEtudeLogNonE, indexChoisi: number): boolean {
  return indexChoisi === exercice.indexCorrect;
}

// ============================================================================
// Écran "comportementInfini" — famille E uniquement. Comparaison catégorielle pure (2 statuts par
// direction), aucune vérification d'expression/intervalle nécessaire.
// ============================================================================

export interface ReponseComportementInfiniE {
  moinsInfini: StatutLimiteQualitatif;
  plusInfini: StatutLimiteQualitatif;
}

export function verifierEcranComportementInfiniE(exercice: ExerciceEtudeLogE, reponse: ReponseComportementInfiniE): boolean {
  const cible: ComportementInfiniE = exercice.comportement;
  return reponse.moinsInfini === cible.moinsInfini && reponse.plusInfini === cible.plusInfini;
}

export { evaluerExpressionExponentielle };
