/**
 * Couche B — vérification pour "Problèmes d'optimisation" (gen55, `promptimplementationgen55.md`).
 * N'importe jamais rien de `src/generateurs/` (voir `verificationOptimisation.test.ts`, fixtures
 * locales, même principe que les 54 autres moteurs) — `evaluerQuadratiqueLocal` ci-dessous est donc
 * une PETITE fonction dupliquée depuis `generateurs/optimisation/optimum.ts::evaluerQuadratique`,
 * jamais importée (règle d'architecture non négociable).
 *
 * Écran "contrainteEtGrandeur" (`modelisation` uniquement, sauf `rectangleInscrit` —
 * `promptreconstructiongen55.md`) : équation à 2 variables, vérifiée à un facteur scalaire près
 * (`diagnostiquerEquivalenceQuadratiqueXY`, `verificationEquationCercle.ts` — import moteur→moteur).
 * Écran "systeme" (`modelisation` uniquement) : texte libre, statut à 3 valeurs par échantillonnage
 * numérique (`evaluerExpressionGenerale`), même patron que
 * `verificationFonctionsReference.ts`/`verificationCaracteristiquesAlgebriques.ts` — mais sans
 * pivot relatif (ces fonctions sont des polynômes, définis partout, jamais d'asymptote à éviter).
 * Écrans "domaine"/"sommet"/"decision" : champs numériques, tolérance standard
 * (`parserNombreOuFraction`, réutilisée depuis `verificationAnalyseFonction.ts` — import
 * moteur→moteur, explicitement autorisé). Écran "interpretation" (QCM) : vérification par
 * sélection, jamais par équivalence.
 */
import type { CoefficientsQuadratiques, ExerciceOptimisation, ExerciceOptimisationModelisation } from "../core/optimisation.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import { diagnostiquerEquivalenceQuadratiqueXY } from "./verificationEquationCercle";
import type { StatutVerification } from "./statutVerification";

function evaluerQuadratiqueLocal(fonction: CoefficientsQuadratiques, x: number): number {
  return fonction.a * x * x + fonction.b * x + fonction.c;
}

const POINTS_ECHANTILLON = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
const TOLERANCE_EQUATION = 1e-4;
const TOLERANCE = 0.005;

function diagnostiquerExpressionDeX(texte: string, cible: (x: number) => number): StatutVerification {
  let comparaisons = 0;
  for (const x of POINTS_ECHANTILLON) {
    let candidat: number;
    try {
      candidat = evaluerExpressionGenerale(texte, x);
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(candidat)) return "not_equivalent";
    if (Math.abs(candidat - cible(x)) > TOLERANCE_EQUATION) return "not_equivalent";
    comparaisons++;
  }
  return comparaisons === POINTS_ECHANTILLON.length ? "correct" : "not_equivalent";
}

function statutValeur(texte: string, cible: number): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

// ============================================================================
// Écran "contrainte" (modelisation uniquement, sauf rectangleInscrit — voir
// moteur/sessionOptimisation.ts::phaseInitiale) — poser la relation NON isolée reliant
// labelVariable/lettreCherchee, avant de l'isoler à l'écran suivant.
// ============================================================================

/**
 * Équation à 2 variables, vérifiée à un facteur scalaire près (`diagnostiquerEquivalenceQuadratiqueXY`,
 * `verificationEquationCercle.ts`, déjà généralisée à "une cible quadratique à 2 variables
 * quelconque" — une relation linéaire est un cas particulier, aucune nouvelle infrastructure de
 * parsing nécessaire, même précédent de réutilisation moteur→moteur que gen50→gen49/gen52→gen51/
 * gen56→gen49). `cible(x,y) = pente·x - y + ordonnee` s'annule exactement sur la vraie relation
 * (`y = pente·x + ordonnee`) — le point d'ancrage `(x0,y0)` est un point quelconque qui la
 * satisfait, jamais une valeur fournie par l'élève.
 */
export function diagnostiquerContrainte(exercice: ExerciceOptimisationModelisation, texte: string): StatutVerification {
  const { pente, ordonnee } = exercice.contrainte;
  const x0 = exercice.sommet.x;
  const y0 = pente * x0 + ordonnee;
  return diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, (x, y) => pente * x - y + ordonnee);
}

export function verifierContrainte(exercice: ExerciceOptimisationModelisation, texte: string): boolean {
  return diagnostiquerContrainte(exercice, texte) === "correct";
}

/**
 * Sous-étape "identifier x et y" (`core/optimisation.types.ts::IdentificationXY`) — vérification par
 * SÉLECTION, jamais par équivalence (même motif que l'écran "interpretation") ; `true` quand la
 * sous-étape est absente de l'exercice (`identificationXY` alors `undefined`), jamais bloquante dans
 * ce cas — voir `ReponseContrainte`/`diagnostiquerContrainteComplete` ci-dessous, qui la combine avec
 * le statut de l'équation en UN SEUL écran/score (motif déjà établi par l'écran "decision", qui
 * combine de même un choix binaire et 2 champs numériques).
 */
export interface ReponseContrainte {
  indexX: number | null;
  indexY: number | null;
  texteEquation: string;
}

export interface StatutContrainte {
  identificationX: boolean;
  identificationY: boolean;
  equation: StatutVerification;
}

export function diagnostiquerContrainteComplete(exercice: ExerciceOptimisationModelisation, reponse: ReponseContrainte): StatutContrainte {
  const identification = exercice.identificationXY;
  return {
    identificationX: identification ? reponse.indexX === identification.indexCorrectX : true,
    identificationY: identification ? reponse.indexY === identification.indexCorrectY : true,
    equation: diagnostiquerContrainte(exercice, reponse.texteEquation),
  };
}

export function verifierContrainteComplete(exercice: ExerciceOptimisationModelisation, reponse: ReponseContrainte): boolean {
  const statut = diagnostiquerContrainteComplete(exercice, reponse);
  return statut.identificationX && statut.identificationY && statut.equation === "correct";
}

// ============================================================================
// Écran "identification" (`prompt-restructuration-architecture-modelisation.md` — désormais un écran
// à part entière, RETIRÉ de l'écran "contrainte" ci-dessus ; `ReponseContrainte`/`StatutContrainte`/
// `diagnostiquerContrainteComplete`/`verifierContrainteComplete` ci-dessus restent définies pour la
// compatibilité mais ne sont plus appelées par ce générateur — gen55 utilise désormais
// `ReponseIdentification` seule ici, puis `ReponseContrainteEtGrandeur` plus bas pour l'équation).
// ============================================================================

export interface ReponseIdentification {
  indexX: number | null;
  indexY: number | null;
}

export interface StatutIdentification {
  x: boolean;
  y: boolean;
}

export function diagnostiquerIdentification(exercice: ExerciceOptimisationModelisation, reponse: ReponseIdentification): StatutIdentification {
  const identification = exercice.identificationXY;
  return {
    x: identification ? reponse.indexX === identification.indexCorrectX : true,
    y: identification ? reponse.indexY === identification.indexCorrectY : true,
  };
}

export function verifierIdentification(exercice: ExerciceOptimisationModelisation, reponse: ReponseIdentification): boolean {
  const statut = diagnostiquerIdentification(exercice, reponse);
  return statut.x && statut.y;
}

// ============================================================================
// Écran "contrainteEtGrandeur" (`prompt-restructuration-architecture-modelisation.md`) — 2 champs, 2
// statuts : (1) la relation NON isolée reliant x et y (même vérification que l'ancien écran
// "contrainte", MOINS l'identification, devenue son propre écran ci-dessus — `diagnostiquerContrainte`
// réutilisée telle quelle) ; (2) la grandeur exprimée avec x ET y encore présents (NOUVEAU champ,
// jamais demandé séparément avant cette restructuration).
// ============================================================================

export interface ReponseContrainteEtGrandeur {
  texteEquation: string;
  texteGrandeur: string;
}

export interface StatutContrainteEtGrandeur {
  equation: StatutVerification;
  grandeur: StatutVerification;
}

const POINTS_ECHANTILLON_Y = [-2, -1, 0, 1, 2, 3];

/** Généralisation à 2 variables de `diagnostiquerExpressionDeX` ci-dessus — x ET y sont traités
 * comme des variables INDÉPENDANTES ici (la formule de la grandeur doit tenir pour n'importe quel
 * couple (x,y), la contrainte qui les relie est vérifiée SÉPARÉMENT par `diagnostiquerContrainte`) :
 * "y" est passé comme variable nommée à `evaluerExpressionGenerale`, déjà générale à un nom
 * arbitraire (voir `expressionGenerale.ts`), jamais une pré-substitution textuelle fragile. */
function diagnostiquerExpressionDeXY(texte: string, cible: (x: number, y: number) => number): StatutVerification {
  let comparaisons = 0;
  for (const x of POINTS_ECHANTILLON) {
    for (const y of POINTS_ECHANTILLON_Y) {
      let candidat: number;
      try {
        candidat = evaluerExpressionGenerale(texte, x, { y });
      } catch {
        return "parse_error";
      }
      if (!Number.isFinite(candidat)) return "not_equivalent";
      if (Math.abs(candidat - cible(x, y)) > TOLERANCE_EQUATION) return "not_equivalent";
      comparaisons++;
    }
  }
  return comparaisons === POINTS_ECHANTILLON.length * POINTS_ECHANTILLON_Y.length ? "correct" : "not_equivalent";
}

/**
 * `exercice.formuleGrandeurXYTexte` sert de cible ET de source de vérité unique (voir
 * `core/optimisation.types.ts`) — non-null assertion justifiée : seules les 4 familles de CE
 * générateur (A/B/T/V) appellent jamais cette fonction (via l'écran "contrainteEtGrandeur", absent
 * de la séquence des familles exclusives au 57e exercice), et elles l'alimentent TOUJOURS.
 */
export function diagnostiquerGrandeurXY(exercice: ExerciceOptimisationModelisation, texte: string): StatutVerification {
  return diagnostiquerExpressionDeXY(texte, (x, y) => evaluerExpressionGenerale(exercice.formuleGrandeurXYTexte as string, x, { y }));
}

export function diagnostiquerContrainteEtGrandeur(
  exercice: ExerciceOptimisationModelisation,
  reponse: ReponseContrainteEtGrandeur,
): StatutContrainteEtGrandeur {
  return {
    equation: diagnostiquerContrainte(exercice, reponse.texteEquation),
    grandeur: diagnostiquerGrandeurXY(exercice, reponse.texteGrandeur),
  };
}

export function verifierContrainteEtGrandeur(exercice: ExerciceOptimisationModelisation, reponse: ReponseContrainteEtGrandeur): boolean {
  const statut = diagnostiquerContrainteEtGrandeur(exercice, reponse);
  return statut.equation === "correct" && statut.grandeur === "correct";
}

// ============================================================================
// Écran "systeme" (`prompt-restructuration-architecture-modelisation.md`) — les 2 équations de
// l'écran "contrainteEtGrandeur" sont résolues ENSEMBLE (isoler puis substituer puis développer), en
// UNE seule réponse : la grandeur développée en fonction de x — EXACTEMENT la même cible que
// l'ancien écran "construction" ci-dessus (`diagnostiquerConstruction`/`verifierConstruction`,
// RÉUTILISÉES telles quelles — restent exportées SANS renommage ni changement de comportement, le
// 57e exercice les appelle directement pour ses propres familles, voir en-tête de fichier). Simples
// alias pour lire "systeme" au lieu de "construction" côté gen55, jamais une seconde implémentation.
// ============================================================================

export function diagnostiquerSysteme(exercice: ExerciceOptimisationModelisation, texte: string): StatutVerification {
  return diagnostiquerConstruction(exercice, texte);
}

export function verifierSysteme(exercice: ExerciceOptimisationModelisation, texte: string): boolean {
  return diagnostiquerSysteme(exercice, texte) === "correct";
}

// ============================================================================
// Écran "construction" (RETIRÉ de toute séquence réelle depuis la restructuration
// `promptimplementationgen57.md` — `diagnostiquerConstruction`/`verifierConstruction` restent
// définies uniquement parce que `diagnostiquerSysteme`/`verifierSysteme` ci-dessus les appellent en
// interne comme alias ; jamais appelées directement par un écran).
// ============================================================================

export function diagnostiquerConstruction(exercice: ExerciceOptimisationModelisation, texte: string): StatutVerification {
  return diagnostiquerExpressionDeX(texte, (x) => evaluerQuadratiqueLocal(exercice.fonction, x));
}

export function verifierConstruction(exercice: ExerciceOptimisationModelisation, texte: string): boolean {
  return diagnostiquerConstruction(exercice, texte) === "correct";
}

// ============================================================================
// Écran "domaine" (modelisation uniquement) — bornes inf/sup.
// ============================================================================

export interface ReponseDomaine {
  inf: string;
  sup: string;
}

export interface StatutDomaine {
  inf: StatutVerification;
  sup: StatutVerification;
}

export function diagnostiquerDomaine(exercice: ExerciceOptimisationModelisation, reponse: ReponseDomaine): StatutDomaine {
  return {
    inf: statutValeur(reponse.inf, exercice.domaine.inf),
    sup: statutValeur(reponse.sup, exercice.domaine.sup),
  };
}

export function verifierDomaine(exercice: ExerciceOptimisationModelisation, reponse: ReponseDomaine): boolean {
  const statut = diagnostiquerDomaine(exercice, reponse);
  return statut.inf === "correct" && statut.sup === "correct";
}

// ============================================================================
// Écran "sommet" (les 2 variantes) — x_S/y_S.
// ============================================================================

export interface ReponseSommet {
  x: string;
  y: string;
}

export interface StatutSommet {
  x: StatutVerification;
  y: StatutVerification;
}

export function diagnostiquerSommet(exercice: ExerciceOptimisation, reponse: ReponseSommet): StatutSommet {
  return {
    x: statutValeur(reponse.x, exercice.sommet.x),
    y: statutValeur(reponse.y, exercice.sommet.y),
  };
}

export function verifierSommet(exercice: ExerciceOptimisation, reponse: ReponseSommet): boolean {
  const statut = diagnostiquerSommet(exercice, reponse);
  return statut.x === "correct" && statut.y === "correct";
}

// ============================================================================
// Écran "decision" (les 2 variantes) — sommet-ou-borne, puis x_optimal/y_optimal.
// ============================================================================

export interface ReponseDecision {
  dansDomaine: boolean | null;
  x: string;
  y: string;
}

export interface StatutDecision {
  dansDomaine: boolean;
  x: StatutVerification;
  y: StatutVerification;
}

export function diagnostiquerDecision(exercice: ExerciceOptimisation, reponse: ReponseDecision): StatutDecision {
  return {
    dansDomaine: reponse.dansDomaine === exercice.sommetDansDomaine,
    x: statutValeur(reponse.x, exercice.optimal.x),
    y: statutValeur(reponse.y, exercice.optimal.y),
  };
}

export function verifierDecision(exercice: ExerciceOptimisation, reponse: ReponseDecision): boolean {
  const statut = diagnostiquerDecision(exercice, reponse);
  return statut.dansDomaine && statut.x === "correct" && statut.y === "correct";
}

// ============================================================================
// Écran "interpretation" (les 2 variantes, QCM) — vérification par sélection.
// ============================================================================

export function verifierInterpretation(exercice: ExerciceOptimisation, indexChoisi: number | null): boolean {
  if (indexChoisi === null) return false;
  return exercice.optionsInterpretation[indexChoisi]?.correcte === true;
}
