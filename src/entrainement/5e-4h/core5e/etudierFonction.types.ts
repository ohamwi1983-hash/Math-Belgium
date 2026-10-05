/**
 * Couche core (5e) — contrat pour 5gen31 ("Étudier une fonction"), CAPSTONE du chapitre "Dérivées et
 * applications", implémenté depuis la consigne de tâche du même nom. Réunit les dimensions de 5gen24
 * ("Étude complète" — comportement asymptotique AV/AH/AO/aucune) et 5gen29 ("Étude locale" — type de
 * fonction/nature des racines de f') en un pipeline unique : domaine → limites/asymptotes → f' →
 * tableau f'/variations → f'' → tableau f''/concavité → récap fusionné → graphique.
 *
 * 4 familles :
 * - `{famille:"etudeLocale"; noyau}` — DÉLÈGUE tout f/f'/f'' à `ExerciceEtudeLocale` (5gen29,
 *   `core5e/etudeLocale.types.ts`), restreint aux 3 valeurs `"polynomiale"|"rationnelleSansCE"|
 *   "rationnelleAvecCE"` (JAMAIS une 4e famille — le champ `noyau.type` de `ExerciceEtudeLocale`
 *   admet ces 3 valeurs, restées inchangées : ce générateur ne les élargit jamais, il se contente de
 *   ne construire que ces 3-là via `generateurs5e/etudierFonction/index.ts`). Couvre l'asymptotique
 *   "aucune" (polynomiale, un polynôme diverge simplement) et "AH y=0" (rationnelleSansCE/AvecCE).
 * - `ExerciceRationnelleAO` — famille NOUVELLE (inexistante dans 5gen29), seule à produire une
 *   asymptote OBLIQUE. f(x)=a·x+b+c/(x-e), 1 AV en x=e. Réutilise le vocabulaire
 *   `RacineEtudeLocale`/`ClassificationExtremum` de 5gen29 (import direct, contrat purement pur —
 *   n'étend JAMAIS l'union `ExerciceEtudeLocale` elle-même, ce qui coupleraît 5gen29 à 5gen31).
 *
 * `ExerciceEtudierFonction` reste volontairement HORS de l'union `ExerciceEtudeLocale` — voir
 * ci-dessus, règle non négociable de la consigne source.
 */
import type { ClassificationExtremum, RacineEtudeLocale, ExerciceEtudeLocale } from "./etudeLocale.types";

/**
 * f(x) = a·x + b + c/(x-e) — a,b,e entiers non nuls, c entier non nul (jamais 0 : c=a·Δ² ou
 * c=a·radicande, Δ/radicande toujours >0 ; ou c=-a·k, k>0). Asymptote oblique y=ax+b (limite de
 * f(x)-(ax+b)=c/(x-e)→0 en ±∞, AUCUNE asymptote horizontale — l'AO exclut l'AH par définition), 1
 * seule AV en x=e (CE réelle, domaine=ℝ\{e}).
 *
 * f'(x) = a - c/(x-e)² ⟺ racines ssi (x-e)²=c/a>0 — TOUJOURS vrai par construction ici (c/a=Δ² ou
 * radicande, structurellement positif) quand `racinesFPrime` est non vide ; `racinesFPrime` VIDE
 * ssi c/a<0 (c choisi de signe opposé à `a`), auquel cas f' ne s'annule JAMAIS (f strictement
 * monotone sur chaque morceau du domaine, 0 extremum). Jamais de racine DOUBLE pour cette famille
 * (les 3 familles "etudeLocale" couvrent déjà ce cas — voir tête de fichier de
 * `generateurs5e/etudierFonction/index.ts` pour la preuve).
 *
 * f''(x) = 2c/(x-e)³ — ne s'annule JAMAIS (signe constant de chaque côté de l'AV, opposé d'un côté
 * à l'autre) ⟹ AUCUN point d'inflexion pour cette famille, jamais un cas particulier côté UI :
 * simplement `racinesFSeconde`/`classificationFSeconde` toujours vides côté vérification
 * (`moteur5e/verificationEtudierFonction.ts`).
 */
export interface ExerciceRationnelleAO {
  famille: "rationnelleAO";
  a: number;
  b: number;
  e: number;
  c: number;
  /** Racines de f'(x)=0, `e-Δ` puis `e+Δ` (triées croissant) — VIDE ssi c/a<0 (f' jamais nulle). */
  racinesFPrime: RacineEtudeLocale[];
  /** Même longueur/ordre que `racinesFPrime` — TOUJOURS "max"/"min" ici, jamais "ni_lun_ni_lautre"
   * (pas de racine double dans cette famille). Signe de `a` détermine l'ordre (voir en-tête de
   * `generateurs5e/etudierFonction/index.ts` pour la preuve par étude de signe de f'). */
  classificationFPrime: ClassificationExtremum[];
}

export type ExerciceEtudierFonction = { famille: "etudeLocale"; noyau: ExerciceEtudeLocale } | ExerciceRationnelleAO;

export type GenerateurExerciceEtudierFonction = () => ExerciceEtudierFonction;
