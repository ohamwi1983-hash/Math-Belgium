/**
 * Contrat — "Paramètres de position" (nom d'affichage depuis `promptgen33modifications.md`,
 * renommé depuis "Médiane" — renommage strictement d'INTERFACE, les identifiants de code internes
 * — ce fichier, `generateurs/mediane/`, `PhaseMediane`... — restent inchangés, même convention que
 * le reste du projet quand un renommage n'affecte que l'affichage), trente-troisième générateur du
 * projet, quatrième du chapitre 5 ("Statistiques") — voir `promptgen33creation.md`. Comme "Moyenne
 * pondérée", part d'un tableau DÉJÀ CONSTRUIT (x_i/n_i/effectif cumulé v_i, ou classes déjà
 * définies) — jamais de reconstruction depuis une liste brute.
 *
 * **Règle unifiée de localisation de la médiane, les deux variantes** : le premier x_i (variante
 * `"discrete"`) ou la première classe (variante `"classes"`, avant interpolation) dont l'effectif
 * cumulé v_i est STRICTEMENT SUPÉRIEUR à n/2 — jamais `>=`. Élimine tout branchement pair/impair et
 * résout le cas limite où l'effectif cumulé tombe exactement sur n/2 : dans ce cas, c'est la valeur/
 * classe SUIVANTE qui est prise, jamais celle où l'égalité se produit. `indexMediane`/
 * `indexClasseMediane` sont donc toujours calculés une seule fois à la génération (jamais recalculés
 * différemment côté vérification).
 *
 * **Exactitude par construction** — variante `"discrete"` : la médiane est toujours EXACTEMENT une
 * valeur `x_i` de la table (un entier), aucun arrondi n'est jamais nécessaire. Variante `"classes"` :
 * la médiane INTERPOLÉE (`L + ((n/2-CFavant)/fClasse)·amplitude`) est, comme "Moyenne pondérée",
 * garantie arrondie proprement à 2 décimales par une boucle de secours à la génération — la
 * vérification finale n'utilise donc qu'une tolérance MINIME (`1e-9`, bruit de virgule flottante
 * résiduel), jamais une vraie marge d'arrondi.
 *
 * **`promptgen33modifications.md` — variante "discrete" étendue de Q1/Q3/min/max/mode(s)** : Q1
 * (seuil n/4) et Q3 (seuil 3n/4) réutilisent EXACTEMENT la même règle stricte `>` que la médiane
 * (jamais `>=`), calculée directement sur le tableau COMPLET — indépendamment de la position de la
 * médiane, jamais une règle en cascade (contrairement à "Étendue et écart interquartile", gen35,
 * qui dérive Q1/Q3 de la position médiane `m` — divergence assumée entre les deux générateurs,
 * documentée explicitement dans la spec pour qu'une session future ne "corrige" jamais l'un vers
 * l'autre). `min`/`max`/`modes` sont dérivés de `lignes`, jamais un second tirage — `modes` contient
 * TOUTES les valeurs x_i dont l'effectif est maximal (1 ou plusieurs, jamais 0 : la génération
 * exclut le cas où tous les effectifs sont égaux).
 *
 * **Variante "classes" — écran "Identifie la classe médiane" remplacé par "Polygone"** (même
 * prompt) : `identificationClasse` (Couche B, `PhaseMediane`) devient `polygone` — l'élève construit
 * le polygone des effectifs cumulés par glissement de points sur un graphe Mafs plutôt que de
 * choisir la classe médiane dans un QCM ; aucun nouveau champ Couche A nécessaire, les coordonnées
 * cibles (borne supérieure de chaque classe, son propre effectif cumulé) sont déjà entièrement
 * portées par `classes: ClasseMediane[]`.
 *
 * **`promptgen33modifications2.md` — les écrans "composantsFormule"/"calculFinal" sont retirés,
 * remplacés par 3 écrans de LECTURE GRAPHIQUE (Q1, Q2/médiane, Q3) puis un écran final "Synthèse"** :
 * `L`/`CFavant`/`fClasse`/`indexClasseMediane` (les 4 composants de la formule d'interpolation,
 * consommés uniquement par l'ancien écran "composantsFormule") disparaissent du contrat, devenus
 * inutiles — `mediane` reste, généralisée à `q1`/`q3` via la MÊME formule d'interpolation (seuils
 * n/4 et 3n/4 plutôt que n/2), désormais appliquée UNIFORMÉMENT aux 3 valeurs par une fonction
 * interne partagée (`interpolerSeuil`, jamais 3 calculs dupliqués). Les 3 valeurs sont arrondies à 1
 * décimale de façon INCONDITIONNELLE (`arrondi1`, jamais une boucle de secours "arrondi propre") —
 * la vérification des 3 nouveaux écrans de lecture tolère ±0,1 (lecture graphique par interpolation
 * continue, jamais une correspondance exacte comme le reste du chapitre), donc l'exactitude
 * mathématique au-delà de cette précision n'a plus aucune importance ; arrondir à 1 décimale évite
 * simplement d'afficher un nombre bruité de virgule flottante dans la révélation après échec.
 *
 * **Écran "Synthèse"** — `xMin`/`xMax`/`etendue` (lecture directe sur `classes`, même principe que
 * `min`/`max` de la variante "discrete") ; `indexClasseModale`/`modeCentreClasseModale` — même
 * garantie de construction que "Mode et classe modale" (gen34, variante D, dupliquée pas importée) :
 * un effectif de classe forcé strictement au-dessus du maximum des autres, garantissant PAR
 * CONSTRUCTION qu'il n'existe jamais d'ex-aequo entre classes modales candidates. `modeCentreClasseModale`
 * = centre de cette classe (`(borneInf+borneSup)/2`) — convention PROPRE à cet écran, jamais la
 * formule mémorisée d'un autre générateur : demande explicitement le centre comme estimation
 * ponctuelle du mode, contrairement à gen34/variante D qui ne demande que l'intervalle catégoriel
 * seul, jamais de valeur numérique. Le champ "Mode" est vérifié INDÉPENDAMMENT de la réponse donnée
 * au champ "Classe modale" — toujours comparé à la vraie valeur de l'exercice, jamais dérivé de la
 * saisie de l'élève à l'autre champ (contrairement au chaînage habituel d'autres écrans du chapitre,
 * ex. "Colinéarité").
 */
export type VarianteMediane = "discrete" | "classes";

import type { ContexteBienaymeTchebychev } from "./bienaymeTchebychev.types";

export interface LigneMedianeDiscrete {
  valeur: number;
  effectif: number;
  /** v_i — effectif cumulé jusqu'à et y compris cette ligne. */
  effectifCumule: number;
}

export interface ClasseMediane {
  borneInf: number;
  borneSup: number;
  effectif: number;
  /** v_i — effectif cumulé jusqu'à et y compris cette classe. */
  effectifCumule: number;
}

interface ExerciceMedianeCommun {
  /** Banque de contextes narratifs déjà intégrée pour "Inégalité de Bienaymé-Tchebychev"
   * (`generateurs/bienaymeTchebychev/contextes.ts`), réutilisée telle quelle — jamais une seconde
   * banque dupliquée pour ce générateur (`promptgen33contexte.md`). Habille le tableau initial
   * d'une narration (population + caractère mesuré + unité), sans jamais changer la mécanique de
   * génération/vérification des 2 variantes. */
  contexte: ContexteBienaymeTchebychev;
  n: number;
  /** n/2 — le seuil de comparaison, jamais recalculé différemment à la vérification. */
  seuil: number;
}

export interface ExerciceMedianeDiscrete extends ExerciceMedianeCommun {
  variante: "discrete";
  lignes: LigneMedianeDiscrete[];
  /** Index dans `lignes` du premier v_i strictement supérieur à `seuil`. */
  indexMediane: number;
  /** = lignes[indexMediane].valeur — toujours un entier exact, jamais arrondi. */
  mediane: number;
  /** n/4 — seuil de Q1, jamais recalculé différemment à la vérification. */
  seuilQ1: number;
  /** Index dans `lignes` du premier v_i strictement supérieur à `seuilQ1` — calculé DIRECTEMENT sur
   * le tableau complet, indépendamment de `indexMediane` (pas de règle en cascade). */
  indexQ1: number;
  /** = lignes[indexQ1].valeur — toujours un entier exact. */
  q1: number;
  /** 3n/4 — seuil de Q3. */
  seuilQ3: number;
  /** Index dans `lignes` du premier v_i strictement supérieur à `seuilQ3` — même principe que
   * `indexQ1`, direct sur le tableau complet. */
  indexQ3: number;
  /** = lignes[indexQ3].valeur — toujours un entier exact. */
  q3: number;
  /** = lignes[0].valeur — lecture directe, `lignes` toujours triée croissant. */
  min: number;
  /** = lignes[lignes.length-1].valeur — lecture directe. */
  max: number;
  /** Toutes les valeurs x_i dont l'effectif est MAXIMAL — 1 ou plusieurs, jamais 0 (la génération
   * exclut le cas où tous les effectifs sont égaux, qui rendrait "aucun mode" la seule réponse
   * valable — hors périmètre de cet écran). Triées croissant (ordre hérité de `lignes`). */
  modes: number[];
}

export interface ExerciceMedianeClasses extends ExerciceMedianeCommun {
  variante: "classes";
  /** Amplitude possiblement DIFFÉRENTE d'une classe à l'autre (`promptgen32gen33corrections.md`,
   * point 1 — au moins deux classes ont toujours des amplitudes différentes, jamais une amplitude
   * commune à toutes) — jamais de champ `amplitude` global sur le contrat, chaque classe porte la
   * sienne (`borneSup-borneInf`). */
  classes: ClasseMediane[];
  /** = classes[0].borneInf — lecture directe, `classes` toujours triée croissant. */
  xMin: number;
  /** = classes[classes.length-1].borneSup — lecture directe. */
  xMax: number;
  /** = xMax - xMin. */
  etendue: number;
  /** Médiane interpolée sur le polygone des effectifs cumulés (seuil n/2) — arrondie à 1 décimale
   * de façon inconditionnelle (voir en-tête du fichier ; la tolérance de vérification est ±0,1). */
  mediane: number;
  /** n/4 — seuil de Q1. */
  seuilQ1: number;
  /** Q1 interpolé sur le polygone — même formule générale que `mediane`, seuil n/4. */
  q1: number;
  /** 3n/4 — seuil de Q3. */
  seuilQ3: number;
  /** Q3 interpolé sur le polygone — même formule générale, seuil 3n/4. */
  q3: number;
  /** Index dans `classes` de l'unique classe modale — garanti sans ex-aequo par construction. */
  indexClasseModale: number;
  /** Centre de la classe modale = (borneInf+borneSup)/2 — réponse attendue au champ "Mode" de
   * l'écran Synthèse. */
  modeCentreClasseModale: number;
}

export type ExerciceMediane = ExerciceMedianeDiscrete | ExerciceMedianeClasses;

export type GenerateurExerciceMediane = () => ExerciceMediane;
