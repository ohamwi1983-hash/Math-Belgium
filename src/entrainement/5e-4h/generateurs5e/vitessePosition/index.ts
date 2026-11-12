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
 * s(t) = (a/2)t² + b·t = D  ⟺  a·t² + 2b·t - 2D = 0 (équation multipliée par 2, coefficients
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

/** s(t) = (a/2)t² + b·t — distance parcourue. */
export function valeurPosition(exercice: ExerciceVitessePosition, t: number): number {
  return (exercice.a / 2) * t * t + exercice.b * t;
}

/** v(t) = s'(t) = a·t + b — vitesse, formule EXACTE (jamais demandée en formule à l'élève : c'est
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

interface Combinaison {
  a: 1 | 2;
  b: number;
  tCible: number;
}

/** Toutes les combinaisons (a, b, tCible) RÉALISTES pour un contexte : a ∈ `aValeurs`,
 * b ∈ `bValeurs`, tCible entier dans [tMin ; tMax] (pair si a = 1 : D entier, voir l'en-tête),
 * vitesse atteinte a·tCible + b dans [vMin ; vMax] (audit 5c5d point 13). */
function combinaisonsRealistes(contexte: ContexteVitessePosition, tMin: number, tMax: number): Combinaison[] {
  const combinaisons: Combinaison[] = [];
  for (const a of contexte.aValeurs) {
    for (const b of contexte.bValeurs) {
      for (let t = tMin; t <= tMax; t++) {
        if (a === 1 && t % 2 !== 0) continue;
        const v = a * t + b;
        if (v < contexte.vMin || v > contexte.vMax) continue;
        combinaisons.push({ a, b, tCible: t });
      }
    }
  }
  return combinaisons;
}

/** Tire le type de départ (arrêté b = 0 / déjà lancé b > 0) à 50/50, puis un contexte qui admet
 * au moins une combinaison réaliste de ce type dans la plage de temps voulue, puis une combinaison
 * au hasard (boucle bornée : chaque contexte de la banque admet les deux types). */
function tirerContexteEtCombinaison(tMin: number, tMax: number): { contexte: ContexteVitessePosition; combinaison: Combinaison } {
  const lance = Math.random() < 0.5;
  for (let essai = 0; essai < 50; essai++) {
    const contexte = tirerContexte();
    const combinaisons = combinaisonsRealistes(contexte, tMin, tMax).filter((c) => (c.b > 0) === lance);
    if (combinaisons.length > 0) return { contexte, combinaison: combinaisons[entierAleatoire(0, combinaisons.length - 1)] };
  }
  const contexte = CONTEXTES_VITESSE_POSITION[0];
  return { contexte, combinaison: combinaisonsRealistes(contexte, tMin, tMax)[0] };
}

// ============================================================================
// QCM "pourquoi rejette-t-on l'autre solution" — 4 options de longueur comparable, toutes
// plausibles (aucune option absurde), la bonne n'est jamais repérable à sa longueur (audit 5c5d
// point 16). Ordre mélangé À LA CONSTRUCTION, fixe pour l'instance.
// ============================================================================

const OPTIONS_REJET_BASE: OptionJustification[] = [
  { texte: "Elle est négative, or le temps est compté à partir du départ.", correcte: true },
  { texte: "Elle est négative, or une distance parcourue est toujours positive.", correcte: false },
  { texte: "Elle est la plus petite, or on garde toujours la plus grande.", correcte: false },
  { texte: "Elle ne vérifie pas l'équation de départ, contrairement à l'autre.", correcte: false },
];

function construireOptionsRejetRacine(): OptionJustification[] {
  return melanger(OPTIONS_REJET_BASE);
}

// ============================================================================
// Variante A — "course simple" : une seule équation à résoudre, s(t)=D.
// ============================================================================

const A_TCIBLE_MIN = 4;
const A_TCIBLE_MAX = 10;

export function genererVitessePositionA(): ExerciceVitessePositionA {
  const { contexte, combinaison } = tirerContexteEtCombinaison(A_TCIBLE_MIN, A_TCIBLE_MAX);
  const { a, b, tCible } = combinaison;
  const D = (a / 2) * tCible * tCible + b * tCible;
  const racineRejetee = -((2 * b) / a) - tCible;
  return { variante: "A", contexte, a, b, D, distanceCible: D, tCible, racineRejetee, optionsRejetRacine: construireOptionsRejetRacine() };
}

// ============================================================================
// Variante B — "course en segments" : s(t)=D1 résolue en premier, puis changement de modèle
// explicite (vitesse constante sur le segment restant D2=D-D1). D est une distance totale
// réaliste du contexte (60 m, 100 m, 500 m…), strictement supérieure à D1 + 10.
// ============================================================================

const B_TCIBLE_MIN = 3;
const B_TCIBLE_MAX = 7;

export function genererVitessePositionB(): ExerciceVitessePositionB {
  const { contexte, combinaison } = tirerContexteEtCombinaison(B_TCIBLE_MIN, B_TCIBLE_MAX);
  const { a, b, tCible } = combinaison;
  const D1 = (a / 2) * tCible * tCible + b * tCible;
  const racineRejetee = -((2 * b) / a) - tCible;
  const totaux = contexte.distancesTotalesB.filter((d) => d >= D1 + 10);
  const D = totaux.length > 0 ? totaux[entierAleatoire(0, totaux.length - 1)] : D1 + 50;
  const D2 = D - D1;
  return {
    variante: "B",
    contexte,
    a,
    b,
    D,
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
