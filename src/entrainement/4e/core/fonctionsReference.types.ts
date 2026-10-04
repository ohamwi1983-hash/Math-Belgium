/**
 * Couche core — contrat propre au générateur "Transformations graphiques — fonctions de
 * référence" (chapitre 2). Généralise "Transformations graphiques" (chapitre 1, x² seul,
 * core/transformationsGraphiques.types.ts) à 6 familles de référence, toutes exprimées sous la
 * forme unique :
 *
 *   f(x) = SOX · (EV/CV) · g(SOY · (CH/EH) · (x - TH)) + TV
 *
 * où g dépend de la famille (u², u³, √u, ∛u, 1/u, |u|) — voir
 * src/moteur/verificationFonctionsReference.ts pour l'implémentation de g. Cette formule reflète
 * l'ordre exact des 7 transformations géométriques appliquées
 * (`prompt-nouvel-ordre-transformations.md`) : TH soustrait directement à x (translation pure),
 * puis CH/EH met le résultat à l'échelle, puis SOY le réfléchit (horizontalement), puis g
 * s'applique, puis SOX réfléchit le résultat (verticalement), puis EV/CV met à l'échelle, puis TV
 * est ajouté en tout dernier — TH est donc toujours soustrait à x AVANT tout le reste (CH/EH, SOY
 * compris), si bien que le point caractéristique de la courbe (là où l'argument de g s'annule) se
 * trouve toujours exactement à `x=TH`, quels que soient CH, EH **et** SOY (voir `pivotX`,
 * verificationFonctionsReference.ts — une restructuration antérieure,
 * `prompt-restructuration-formule-th-ch.md`, avait déjà découplé ce point de CH/EH, mais gardait
 * encore SOY combiné à x avant la soustraction de TH, le rendant dépendant du signe de SOY). TH et
 * TV sont des entiers SIGNÉS dans [-5,5] (comme p/q du chapitre 1,
 * core/transformationsGraphiques.types.ts) — CH/EH/EV/CV sont des entiers POSITIFS dans [1,5]
 * (`prompt-croix-et-elargissement-plage.md`, point 2, remis à [1,5] après une réduction temporaire à
 * [1,3] par `prompt-reduction-plage-ch-eh-cv-ev.md` — l'élargissement est sûr grâce à deux
 * corrections déjà en place : "un seul canal actif à la fois" et le second point marqué qui rend
 * l'équation résoluble exactement quelle que soit l'ampleur du facteur) ; SOX et SOY portent chacun
 * un signe indépendant en plus (spec section 1 : "SOX, SOY ∈ {-1, 1} indépendamment").
 */

export type FamilleReference = "carre" | "cube" | "racine_carree" | "racine_cubique" | "inverse" | "valeur_absolue";

export interface ExerciceFonctionReference {
  famille: FamilleReference;
  /** TH — translation horizontale (appliquée comme "x - TH" dans la formule, la toute première
   * transformation, avant la mise à l'échelle CH/EH et la réflexion SOY), entier signé dans [-5,5]. */
  th: number;
  /** TV — translation verticale (appliquée comme "... + TV"), entier signé dans [-5,5]. */
  tv: number;
  /** CH — compression horizontale, entier dans [1,5] (1 = neutre). */
  ch: number;
  /** EH — étirement horizontal, entier dans [1,5] (1 = neutre). Seul le rapport CH/EH compte. */
  eh: number;
  /** EV — étirement vertical, entier dans [1,5] (1 = neutre). */
  ev: number;
  /** CV — compression verticale, entier dans [1,5] (1 = neutre). Seul le rapport EV/CV compte. */
  cv: number;
  /** SOX — symétrie orthogonale d'axe Ox (signe du facteur global). */
  sox: boolean;
  /** SOY — symétrie d'axe Oy, réfléchit l'argument déjà translaté-et-mis-à-l'échelle avant que g ne
   * s'applique (jamais combinée à x avant la soustraction de TH — voir le contrat ci-dessus). */
  soy: boolean;
}

export type GenerateurExerciceFonctionReference = () => ExerciceFonctionReference;

/**
 * Réglage professeur du mode de sélection des familles (`prompt-reglage-nombre-par-famille.md`) —
 * même principe que `ReglagesInequationRationnelle` (`core/inequationRationnelle.types.ts`,
 * `niveauxActifs`/`repartition`), adapté ici à 6 familles plutôt qu'à des niveaux de difficulté :
 * un objet de réglage consommé par une fabrique (`creerGenerateurFonctionReference`,
 * `generateurs/fonctionsReference/index.ts`) qui retourne un générateur sans argument, pour que la
 * Couche B reste agnostique de ce réglage. `"aleatoire"` (par défaut) reproduit exactement le
 * comportement historique (tirage uniforme parmi les 6 familles à chaque exercice) ; en mode
 * `"personnalise"`, `quantites[famille]` fixe le nombre exact d'exercices de cette famille pour
 * toute la série — le nombre total d'exercices de la session se déduit de la somme de ces 6
 * valeurs, aucun réglage séparé de `nombreExercices` n'existe dans ce mode.
 */
export type ModeSelectionFamilles = "aleatoire" | "personnalise";

export interface ReglagesFamillesFonctionReference {
  mode: ModeSelectionFamilles;
  quantites: Record<FamilleReference, number>;
}

/** Position des 6 curseurs + les 2 toggles, telle que soumise par l'élève (ou telle qu'affichée en
 * temps réel pour la courbe manipulable du bouton "Aide"). */
export interface ReponseCurseursFonctionReference {
  th: number;
  tv: number;
  ch: number;
  eh: number;
  ev: number;
  cv: number;
  sox: boolean;
  soy: boolean;
}

/** Soumission complète de l'écran "exercice" (étape 1 de la spec) : le champ équation ET la
 * position des curseurs, toujours envoyés ensemble par le même bouton "Valider". */
export interface ReponseFonctionReference {
  equation: string;
  curseurs: ReponseCurseursFonctionReference;
}
