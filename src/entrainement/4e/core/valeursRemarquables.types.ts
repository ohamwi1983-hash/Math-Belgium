/**
 * Couche core — "Valeurs remarquables" (chapitre 3, deuxième générateur). Réutilise directement
 * `Quadrant` de `cercleTrigonometrique.types.ts` (premier générateur du chapitre) — même couplage
 * assumé que les exercices 3/4/5/6 qui embarquent `Exercice` de l'exercice 1 : ce générateur
 * réutilise tout le mécanisme du sélecteur de quadrant interactif (`CercleQuadrantSelecteur`) et,
 * depuis la refonte `promptcreationgenerateur15.md`, les aides géométriques du générateur 14
 * (`AideReductionCercleTrig`/`AideAnglePremierQuadrantCercleTrig`/`AideSignesCercleTrig`, toutes
 * réutilisées telles quelles grâce à leurs props désormais typées structurellement — voir
 * `AngleSurCercle`/`AngleAvecPremierQuadrant`, `cercleTrigonometrique.types.ts`) plutôt que de les
 * redévelopper.
 */
import type { Quadrant } from "./cercleTrigonometrique.types";

/** Les 5 angles du premier quadrant à valeur exacte connue. */
export type AngleRemarquable = 0 | 30 | 45 | 60 | 90;

/**
 * `angleDepart` est toujours dans `]90°,360°]` (refonte `promptcreationgenerateur15.md` — jamais
 * dans `[0°,90°]`, le quadrant I n'est plus couvert par ce générateur) ; `angleReduit` est sa
 * mesure équivalente dans `[0°,360°[` (`angleDepart % 360`, donc `angleReduit=0` exactement quand
 * `angleDepart=360`) — nécessaire pour réutiliser telles quelles les fonctions/aides du premier
 * générateur du chapitre (`calculerQuadrant`/`calculerTrajetCercleTrig`/`calculerAideSignes`...),
 * qui attendent toutes un angle déjà dans `[0°,360°[`. Aucun écran "Réduction" ne montre cette
 * distinction à l'élève (contrairement au premier générateur) : `angleDepart` est directement
 * utilisable pour identifier le quadrant, la normalisation modulo 360 n'est qu'un détail interne de
 * calcul. `tanValeur`/`tanLatex` : `null`/"n'existe pas" ssi `anglePremierQuadrant===90` ET
 * `quadrant==="axeOy"` (tan(90°) et tan(270°) ne sont pas définies) — tous les autres champs sont
 * entièrement dérivés à la génération, jamais recalculés différemment côté vérification.
 */
export interface ExerciceValeursRemarquables {
  angleDepart: number;
  angleReduit: number;
  anglePremierQuadrant: AngleRemarquable;
  quadrant: Quadrant;
  sinValeur: number;
  cosValeur: number;
  tanValeur: number | null;
  sinLatex: string;
  cosLatex: string;
  tanLatex: string;
}

/**
 * Valeurs exactes possibles pour une cellule sin/cos — refonte `promptcreationgenerateur15.md` :
 * remplace les 2 champs libres évalués par expression (`sinTexte`/`cosTexte`) par un cycle de
 * valeurs discrètes, sur le modèle du tableau cyclique de l'écran "Signes" du générateur 14
 * (`cycleSigneCercleTrigonometrique.ts`) mais avec un domaine de valeurs bien plus riche, propre à
 * ce générateur — voir `cycleValeurTrigonometrique.ts` pour le cycle et le rendu LaTeX.
 */
export type ValeurSinCos = "0" | "1/2" | "-1/2" | "rac2/2" | "-rac2/2" | "rac3/2" | "-rac3/2" | "1" | "-1";
export type CelluleSinCos = ValeurSinCos | "?";

/** `"indefini"` = `∄` (tan(90°)/tan(270°)) — jamais une 10e valeur numérique, dernière étape du
 * cycle avant le retour à `"?"` (même principe que `SigneTan` du premier générateur). */
export type ValeurTan = "0" | "rac3/3" | "-rac3/3" | "1" | "-1" | "rac3" | "-rac3" | "indefini";
export type CelluleTan = ValeurTan | "?";

/** Réponse de l'étape "Valeurs exactes" : 3 cellules cycliques, soumises en un seul essai global
 * (tout ou rien) — même principe que l'écran "Signes" du premier générateur du chapitre. */
export interface ReponseValeursExactes {
  sin: CelluleSinCos;
  cos: CelluleSinCos;
  tan: CelluleTan;
}

export type GenerateurExerciceValeursRemarquables = () => ExerciceValeursRemarquables;
