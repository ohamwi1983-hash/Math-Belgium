/**
 * Couche core — contrat propre à "Placement et lecture sur le cercle trigonométrique" (chapitre 3,
 * premier exercice de ce chapitre). Contrat totalement indépendant des treize exercices précédents
 * (comme les exercices 8/9/10/11/12 côté Couche A) : rien à réutiliser depuis les autres chapitres,
 * ce générateur ne manipule que des angles en degrés, jamais un polynôme ou une fraction — à
 * l'exception du signe d'une cellule (`Signe`), qui réutilise directement `ValeurCellule` de
 * l'exercice "Tableau de signes à plusieurs facteurs" (correction 5,
 * promptcorrectionsgenerateurcercletrigo1.md) pour l'écran "Signes", désormais un tableau à
 * cellules cycliques sur le même modèle que les tableaux de signes déjà en place sur la
 * plateforme.
 */

import type { ValeurCellule } from "./signesProduit.types";

/**
 * "axeOx"/"axeOy" (round 2, promptcorrectionsgenerateurcercletrigo2.md, point 1.4) remplacent
 * l'ancienne valeur unique "axe" : le sélecteur interactif de l'écran "Quadrant" rend désormais Ox
 * et Oy sélectionnables indépendamment, donc ce sont deux réponses distinctes — "axeOx" pour
 * angleReduit ∈ {0°,180°}, "axeOy" pour angleReduit ∈ {90°,270°}.
 */
export type Quadrant = "I" | "II" | "III" | "IV" | "axeOx" | "axeOy";

/** Signe de sin/cos — jamais "indefini" pour ces deux lignes (toujours définies sur ℝ). */
export type Signe = ValeurCellule;

/** Signe de tan — ajoute "indefini" (∄) aux 3 valeurs de Signe, uniquement pour 90°/270°. */
export type SigneTan = Signe | "indefini";

export type VarianteCercleTrigId = "angle_negatif" | "angle_superieur_360" | "multiple_90";

/**
 * "?" est une réponse possible pour chaque champ (correction 5) : le tableau de l'écran "Signes"
 * cycle chaque cellule en boucle, y compris un retour à "?" (jamais généré côté exercice, jamais
 * égal à `signeSin`/`signeCos`/`signeTan` réels) — une cellule encore à "?" au moment de la
 * validation compte donc naturellement comme incorrecte par simple inégalité, sans cas spécial.
 */
export interface ReponseSignes {
  sin: Signe | "?";
  cos: Signe | "?";
  tan: SigneTan | "?";
}

/**
 * `angleDepart` est l'angle tel que tiré (peut être négatif, ≥360°, ou déjà dans [0°,360°[ selon la
 * variante) ; `angleReduit` est toujours sa mesure équivalente dans [0°,360°[, calculée une fois
 * pour toutes à la génération (jamais recalculée différemment côté vérification). Les champs
 * quadrant/anglePremierQuadrant/signeSin/signeCos/signeTan sont eux aussi entièrement dérivés de
 * angleReduit à la génération — la Couche B ne fait que comparer la saisie de l'élève à ces champs
 * déjà calculés, jamais une recomputation indépendante à l'exécution (même principe que
 * `exercice.solution`/`classifierSolution` de l'exercice "tableau de signes").
 */
export interface ExerciceCercleTrigonometrique {
  variante: VarianteCercleTrigId;
  angleDepart: number;
  angleReduit: number;
  quadrant: Quadrant;
  anglePremierQuadrant: number;
  signeSin: Signe;
  signeCos: Signe;
  signeTan: SigneTan;
}

export type GenerateurExerciceCercleTrigonometrique = () => ExerciceCercleTrigonometrique;

/**
 * Types structurels (générateur 15, "Valeurs remarquables") : `AideReductionCercleTrig`/
 * `AideAnglePremierQuadrantCercleTrig`/`AideSignesCercleTrig` n'utilisent jamais que ces quelques
 * champs de `ExerciceCercleTrigonometrique` — leurs props sont donc typées structurellement plutôt
 * que sur le contrat complet, pour permettre leur réutilisation LITTÉRALE (même composant, jamais
 * dupliqué) par `ExerciceValeursRemarquables`, qui partage exactement ces mêmes noms de champs sans
 * avoir besoin des autres (`variante`/`signeSin`/`signeCos`/`signeTan`, propres au premier
 * générateur). Même principe que les types structurels déjà en place ailleurs dans le projet (ex.
 * `calculerA`, `ParametresFonctionReference`).
 */
export interface AngleSurCercle {
  angleDepart: number;
  angleReduit: number;
}

export interface AngleAvecPremierQuadrant extends AngleSurCercle {
  anglePremierQuadrant: number;
  quadrant: Quadrant;
}
