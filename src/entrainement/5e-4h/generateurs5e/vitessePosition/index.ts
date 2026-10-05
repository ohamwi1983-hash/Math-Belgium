/**
 * Couche A (5e) — génération pour 5gen35 ("Vitesse et position"), DERNIER générateur du chapitre
 * "Dérivées et applications". N'importe jamais rien de `moteur5e/`.
 *
 * Réutilise DIRECTEMENT `entierAleatoire` (`generateurs5e/limites/fraction.ts`, Couche A ↔ Couche A
 * autorisé).
 *
 * ============================================================================================
 * PREUVE ARITHMÉTIQUE (vérifiée symboliquement ET empiriquement sur 500 000 tirages flottants
 * AVANT tout câblage — voir la tâche, "ne fais pas confiance à mon algèbre sans vérification" —
 * puis testée sur les tirages ENTIERS réels de ce générateur dans `index.test.ts`) :
 *
 * e(t) = (a/2)t² + b·t = D  ⟺  a·t² + 2b·t - 2D = 0 (équation multipliée par 2, coefficients
 * entiers). Construction "à l'envers" : `tCible` (le temps recherché) et `a`,`b` sont choisis EN
 * PREMIER, puis D = (a/2)·tCible² + b·tCible est DÉRIVÉ — garantit que tCible est UNE racine
 * exacte de l'équation. Par les relations coefficients-racines d'une équation du second degré
 * a·t²+2b·t-2D=0 (somme des racines = -2b/a), l'AUTRE racine vaut :
 *
 *     racineRejetee = -2b/a - tCible
 *
 * (PAS `-b/a - tCible` — c'est l'erreur initiale de la consigne de tâche, CORRIGÉE ici après
 * vérification empirique : avec racineRejetee=-b/a-tCible, la somme des racines vaudrait
 * -b/a alors que la relation coefficients-racines de a·t²+2bt-2D=0 impose -2b/a. Confirmé par un
 * script Node autonome AVANT d'écrire ce fichier : `-b/a-tCible` produit ~89% de "root mismatch"
 * sur 200 000 tirages flottants aléatoires, `-2b/a-tCible` produit 0 violation sur 500 000).
 *
 * Comme b≥0, a>0, tCible>0 : racineRejetee = -2b/a - tCible ≤ -tCible < 0, TOUJOURS strictement
 * négative (jamais nulle, même si b=0 : racineRejetee=-tCible<0 puisque tCible>0 strictement).
 *
 * `a` restreint à {1,2} (jamais un entier "simple" plus grand) : garantit que racineRejetee=-2b/a-
 * tCible est TOUJOURS un entier exact (2b/1=2b et 2b/2=b sont entiers pour tout b entier) — évite
 * à l'élève de devoir manier une fraction en RÉSOLVANT une équation dont le seul objectif
 * pédagogique est REJETER la racine négative, pas calculer avec des fractions (compétence déjà
 * couverte ailleurs sur la plateforme). Pour que D=(a/2)tCible²+b·tCible reste un entier avec a=1
 * (a/2=0,5), `tCible` est alors forcé PAIR ; avec a=2 (a/2=1, entier), `tCible` est libre.
 * ============================================================================================
 */
import type {
  ContexteVitessePosition,
  ExerciceVitessePosition,
  ExerciceVitessePositionA,
  ExerciceVitessePositionB,
  OptionJustification,
} from "../../core5e/vitessePosition.types";
import { entierAleatoire } from "../limites/fraction";
import { CONTEXTES_VITESSE_POSITION } from "./contextes";

// ============================================================================
// Évaluation numérique pure — nécessaire à la génération/l'affichage ET, RÉPLIQUÉE (jamais
// importée), à `moteur5e/verificationVitessePosition.ts` (règle non négociable CLAUDE.md).
// ============================================================================

/** e(t) = (a/2)t² + b·t — position. */
export function valeurPosition(exercice: ExerciceVitessePosition, t: number): number {
  return (exercice.a / 2) * t * t + exercice.b * t;
}

/** v(t) = e'(t) = a·t + b — vitesse, formule EXACTE (jamais demandée en formule à l'élève : c'est
 * ce que l'écran "derivee" lui fait dériver lui-même ; réutilisée ici uniquement pour évaluer une
 * valeur numérique aux écrans suivants). */
export function valeurVitesseExacte(exercice: ExerciceVitessePosition, t: number): number {
  return exercice.a * t + exercice.b;
}

// ============================================================================
// Construction "à l'envers" — a, b, tCible choisis EN PREMIER ; D (et pour B, D1/D2) DÉRIVÉS.
// ============================================================================

function melanger<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function tirerContexte(): ContexteVitessePosition {
  return CONTEXTES_VITESSE_POSITION[entierAleatoire(0, CONTEXTES_VITESSE_POSITION.length - 1)];
}

function tirerA(): 1 | 2 {
  return entierAleatoire(0, 1) === 0 ? 1 : 2;
}

/** tCible entier — pair OBLIGATOIREMENT si a=1 (garantit D entier, voir preuve en en-tête), libre
 * si a=2. `borneMax` distingue la variante A (tTotal, plage large) de la variante B (t1, point de
 * passage intermédiaire, plage plus resserrée pour laisser de la place au segment restant). */
function tirerTCible(a: 1 | 2, borneMin: number, borneMax: number): number {
  if (a === 2) return entierAleatoire(borneMin, borneMax);
  const min = borneMin % 2 === 0 ? borneMin : borneMin + 1;
  const max = borneMax % 2 === 0 ? borneMax : borneMax - 1;
  const nbPairs = (max - min) / 2 + 1;
  return min + 2 * entierAleatoire(0, nbPairs - 1);
}

/** t0 — entier ou décimal simple (multiple de 0,5), STRICTEMENT dans ]0,borne[ (borne = tCible :
 * fin du régime quadratique, seul domaine où v(t)=e'(t) a un sens — voir CLAUDE.md variante B,
 * "changement de modèle"). Nécessite borne≥2 (toujours vrai : tCible≥3 par construction). */
function tirerT0(borne: number): number {
  const base = entierAleatoire(1, borne - 1);
  const avecDemi = Math.random() < 0.4 && base + 0.5 < borne;
  return avecDemi ? base + 0.5 : base;
}

// ============================================================================
// QCM "pourquoi rejette-t-on la racine négative" — 4 options CONTEXTE-INDÉPENDANTES (aucune ne
// référence de valeur numérique précise), ordre mélangé À LA CONSTRUCTION, fixe pour l'instance —
// même motif que `optionsInterpretation`/`optionsVASens` (core5e/limitesContexte.types.ts).
// ============================================================================

const OPTIONS_REJET_BASE: OptionJustification[] = [
  { texte: "Parce qu'un temps ne peut pas être négatif : cette solution n'a pas de sens dans ce contexte.", correcte: true },
  { texte: "Parce que cette solution n'est pas un nombre entier.", correcte: false },
  { texte: "Parce que cette solution est trop petite comparée à la durée totale attendue.", correcte: false },
  { texte: "Parce qu'une équation du second degré ne peut avoir qu'une seule solution mathématique.", correcte: false },
];

function construireOptionsRejetRacine(): OptionJustification[] {
  return melanger(OPTIONS_REJET_BASE);
}

// ============================================================================
// Variante A — "course simple" : une seule équation à résoudre, e(t)=D (distance totale).
// ============================================================================

const A_TCIBLE_MIN = 4;
const A_TCIBLE_MAX = 10;
const A_B_MAX = 5;

export function genererVitessePositionA(): ExerciceVitessePositionA {
  const contexte = tirerContexte();
  const a = tirerA();
  const b = entierAleatoire(0, A_B_MAX);
  const tCible = tirerTCible(a, A_TCIBLE_MIN, A_TCIBLE_MAX);
  const D = (a / 2) * tCible * tCible + b * tCible;
  const racineRejetee = -((2 * b) / a) - tCible;
  const t0 = tirerT0(tCible);
  return { variante: "A", contexte, a, b, D, t0, distanceCible: D, tCible, racineRejetee, optionsRejetRacine: construireOptionsRejetRacine() };
}

// ============================================================================
// Variante B — "course en segments" : e(t)=D1 (distance INTERMÉDIAIRE) résolue en premier, puis
// changement de modèle explicite (vitesse constante sur le segment restant D2=D-D1).
// ============================================================================

const B_TCIBLE_MIN = 3;
const B_TCIBLE_MAX = 7;
const B_B_MAX = 5;
const B_D_SUPPLEMENT_MIN = 15;
const B_D_SUPPLEMENT_MAX = 60;

export function genererVitessePositionB(): ExerciceVitessePositionB {
  const contexte = tirerContexte();
  const a = tirerA();
  const b = entierAleatoire(0, B_B_MAX);
  const tCible = tirerTCible(a, B_TCIBLE_MIN, B_TCIBLE_MAX);
  const D1 = (a / 2) * tCible * tCible + b * tCible;
  const racineRejetee = -((2 * b) / a) - tCible;
  const t0 = tirerT0(tCible);
  const D = D1 + entierAleatoire(B_D_SUPPLEMENT_MIN, B_D_SUPPLEMENT_MAX);
  const D2 = D - D1;
  return {
    variante: "B",
    contexte,
    a,
    b,
    D,
    t0,
    distanceCible: D1,
    tCible,
    racineRejetee,
    optionsRejetRacine: construireOptionsRejetRacine(),
    D2,
  };
}

// ============================================================================
// Dispatch (50/50, aucune fréquence particulière demandée par la tâche) + panneau dev.
// ============================================================================

export function genererExerciceVitessePosition(): ExerciceVitessePosition {
  return Math.random() < 0.5 ? genererVitessePositionA() : genererVitessePositionB();
}

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "A", label: "A. Course simple" },
  { id: "B", label: "B. Course en segments" },
];

export function construireAvecVarianteId(id: string): ExerciceVitessePosition {
  switch (id) {
    case "A":
      return genererVitessePositionA();
    case "B":
      return genererVitessePositionB();
    default:
      throw new Error(`construireAvecVarianteId : id inconnu "${id}"`);
  }
}
