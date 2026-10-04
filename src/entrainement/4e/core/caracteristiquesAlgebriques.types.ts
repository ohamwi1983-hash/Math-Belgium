import type { Categorie, Exercice } from "./generateur.types";
import type { FamilleReference, ModeSelectionFamilles, ReglagesFamillesFonctionReference } from "./fonctionsReference.types";
import type { Morceau } from "./inequation.types";
import type { ReponseExistence, ReponseZerosCaracteristiques } from "./caracteristiquesFonction.types";

/**
 * Couche core — contrat propre à "Caractéristiques algébriques d'une fonction de référence"
 * (chapitre 2). **Niveau 1** (`spec-caracteristiquesalgebriquesniveau1.md`) : `f(x) = [base](P1) +
 * k`, `P1 = ax+b` (`a≠0`, `a,b` entiers), `k` un rationnel non nul CONSTANT, stocké comme fraction
 * irréductible exacte (`Fraction`) — jamais un flottant. **Niveau 2**
 * (`prompt-niveau2caracteristiquesalgebriques.md`) coexiste avec le niveau 1 sans en changer le
 * comportement (voir `niveau: "niveau1"`, discriminant ajouté a posteriori mais qui ne change
 * aucune valeur ni fonction déjà en place pour ce niveau) : même structure `f(x) = [base](P1) + k`,
 * mais `k` devient lui aussi un polynôme du 1er degré, `k(x) = cx+d` (`c≠0` — sinon k dégénère en
 * niveau 1), au lieu d'une constante. `[base]` reste l'une des 6 fonctions de référence du dixième
 * exercice (`FamilleReference`) : `valeur_absolue` (`|P1|`), `carre` (`P1²`), `cube` (`P1³`),
 * `inverse` (`1/P1`), `racine_carree` (`√P1`), `racine_cubique` (`∛P1`).
 *
 * Résoudre `[base](P1) + k(x) = 0` avec `k` linéaire ramène à des situations structurellement très
 * différentes selon la famille (voir `generateurs/caracteristiquesAlgebriques/` pour le détail
 * complet de chaque construction) :
 * - `carre`/`inverse` : après développement/mise au même dénominateur, une équation du 2nd degré
 *   CLASSIQUE — réutilise directement `Exercice` (contrat de l'exercice "méthode la plus rapide")
 *   comme structure de données interne (`.enonce`/`.solution.racines`/`.categorie`), jamais
 *   surfacée via un écran de reconnaissance/factorisation guidée depuis
 *   `prompt-corrections-niveau2-vague2.md` (cette compétence est jugée déjà couverte par
 *   l'exercice "méthode la plus rapide" lui-même) — seulement comme cible de vérification pour
 *   l'équation regroupée que l'élève doit produire, et comme source des vraies racines.
 * - `racine_carree` : élévation au carré → équation du 2nd degré (même mécanisme que ci-dessus),
 *   mais SOUS UNE CONDITION DE VALIDITÉ (`-k(x)≥0`, le carré n'étant réversible que dans ce sens) —
 *   chaque racine trouvée doit être individuellement validée contre cette condition avant d'être
 *   retenue comme zéro réel.
 * - `valeur_absolue` : deux branches linéaires (`P1=-k` si `P1≥0` ; `P1=k` si `P1<0`), chacune sous
 *   sa propre condition de signe — même principe de validation individuelle.
 * - `racine_cubique`/`cube` : élévation au cube ne produit PLUS une équation linéaire comme au
 *   niveau 1 (`k` n'est plus une constante) mais un polynôme du 3e degré `P3`, construit
 *   délibérément factorisable (mise en évidence de `x`, ou groupement en `(x²+1)(...)`) — voir
 *   `FactorisationP3`. Aucune condition de validité ici (élever au cube est une bijection, jamais de
 *   solution étrangère).
 */
export interface Fraction {
  num: number;
  den: number;
}

export type NiveauCaracteristiquesAlgebriques = "niveau1" | "niveau2";

export interface ExerciceCaracteristiquesAlgebriquesNiveau1 {
  niveau: "niveau1";
  famille: FamilleReference;
  a: number;
  b: number;
  k: Fraction;
}

/** Champs réellement communs aux 6 familles du niveau 2 : `P1=ax+b` (le même argument qu'au niveau
 * 1), `k(x)=cx+d` (désormais un vrai polynôme du 1er degré, `c` toujours non nul). */
interface ExerciceNiveau2Commun {
  niveau: "niveau2";
  a: number;
  b: number;
  c: number;
  d: number;
}

/**
 * `carre`/`inverse` — `zeros` embarque l'équation du 2nd degré obtenue après développement
 * (`carre` : `(ax+b)²+(cx+d)=0` développé) ou mise au même dénominateur (`inverse` :
 * `1=-(cx+d)(ax+b)` développé), réutilisant tel quel le contrat `Exercice` (exercice "méthode la
 * plus rapide") — usage purement INTERNE depuis `prompt-corrections-niveau2-vague2.md` (cible de
 * vérification pour l'étape "isolement"/"regroupe", source des vraies racines pour "zéros"), jamais
 * surfacé à l'élève via un écran de reconnaissance/factorisation guidée. Ses racines SONT
 * directement les zéros de f (aucune condition de validité pour ces deux familles).
 */
export interface ExerciceNiveau2Quadratique extends ExerciceNiveau2Commun {
  famille: "carre" | "inverse";
  zeros: Exercice;
}

/**
 * `racine_carree` — `zeros` embarque l'équation du 2nd degré obtenue en élevant `√(P1)=-k(x)` au
 * carré (`P1 = k(x)²`, développée), même usage purement interne que `ExerciceNiveau2Quadratique`.
 * `conditionValidite` est l'intervalle exact de `-k(x) ≥ 0` (toujours une demi-droite fermée, `c`
 * étant non nul) — chaque racine de `zeros` doit être validée individuellement contre cette
 * condition (une racine peut être une solution du carré sans être une solution de l'équation
 * originale sous racine).
 *
 * Contrairement à `carre`/`inverse`, l'écran "zéros" de cette famille précède désormais l'écran
 * "validation" plutôt que de le suivre (`prompt-corrections-niveau2-vague3.md`, point 2) : les
 * racines de `zeros.solution.racines`, DISTINCTES et NON FILTRÉES par `conditionValidite`, sont
 * donc les valeurs CANDIDATES que l'élève doit lui-même déterminer et saisir à l'écran "zéros" —
 * avant que l'écran "validation" (Oui/Non, une fois par candidat) ne détermine lesquelles sont
 * réellement des zéros de `f`.
 */
export interface ExerciceNiveau2RacineCarree extends ExerciceNiveau2Commun {
  famille: "racine_carree";
  zeros: Exercice;
  conditionValidite: Morceau;
}

/**
 * `valeur_absolue` — deux branches linéaires, chacune sa propre racine EXACTE (toujours
 * rationnelle, `a,b,c,d` entiers) : `racineBranche1` résout `P1=-k(x)` (branche `P1≥0`) ;
 * `racineBranche2` résout `P1=k(x)` (branche `P1<0`). `conditionValidite` est l'intervalle exact de
 * `P1(x) ≥ 0` (la frontière entre les deux branches) — `racineBranche1` doit être validée contre
 * cette condition, `racineBranche2` contre sa négation.
 */
export interface ExerciceNiveau2ValeurAbsolue extends ExerciceNiveau2Commun {
  famille: "valeur_absolue";
  conditionValidite: Morceau;
  racineBranche1: Fraction;
  racineBranche2: Fraction;
}

/**
 * Factorisation de `P3` (le polynôme du 3e degré obtenu en développant `(P1)+k³` pour
 * `racine_cubique`, ou `(P1)³+k` pour `cube`) — TOUJOURS l'une de deux formes, jamais un cas
 * générique (voir la construction, formes 2/3/4 de la spec ; la forme 1 est exclue) :
 * - `avecX` (formes 2/3) : `P3 = x·(Ax²+Bx+C)` — `x=0` est toujours racine, plus les racines
 *   réelles éventuelles (0, 1 ou 2, selon signe du discriminant) du facteur quadratique restant.
 * - `sansX` (forme 4) : `P3 = (x²+1)(Ax+B)` — `x²+1` n'est jamais nul pour `x` réel, la SEULE
 *   racine réelle de `P3` est donc celle du facteur linéaire restant.
 */
export type FactorisationP3 =
  | { type: "avecX"; quadratique: { A: number; B: number; C: number } }
  | { type: "sansX"; lineaire: { A: number; B: number } };

export interface ExerciceNiveau2Cubique extends ExerciceNiveau2Commun {
  famille: "racine_cubique" | "cube";
  factorisationP3: FactorisationP3;
}

export type ExerciceCaracteristiquesAlgebriquesNiveau2 =
  | ExerciceNiveau2Quadratique
  | ExerciceNiveau2RacineCarree
  | ExerciceNiveau2ValeurAbsolue
  | ExerciceNiveau2Cubique;

export type ExerciceCaracteristiquesAlgebriques = ExerciceCaracteristiquesAlgebriquesNiveau1 | ExerciceCaracteristiquesAlgebriquesNiveau2;

export type GenerateurExerciceCaracteristiquesAlgebriques = () => ExerciceCaracteristiquesAlgebriques;

export type { ModeSelectionFamilles, ReglagesFamillesFonctionReference };

/**
 * Étape 2 (conditions d'existence) — nombre variable (0 ou plusieurs, section 4 point 2 de la
 * spec), chaque CE porte un symbole (`≠` ou une inégalité) et une valeur numérique (rationnelle,
 * ex. `-1/3`) — jamais un texte libre pour la valeur, un champ numérique tolérant aux fractions
 * (`parserNombreOuFraction`, voir Couche B), même principe que les autres champs "valeur qui peut
 * être une fraction" du projet (`x_S`/`y_S`, `AH`/`AV`...). Identique aux deux niveaux : les CE ne
 * dépendent que de `P1=ax+b`, jamais de `k` (constant ou linéaire, peu importe).
 */
export type SymboleCE = "≠" | ">" | "≥" | "<" | "≤";

export interface ConditionExistence {
  symbole: SymboleCE;
  valeur: number;
}

export type ReponseCE = ConditionExistence[];

/**
 * Étape 3 (domaine de définition) — construction guidée à 4 formes mutuellement exclusives
 * (section 4 point 3 de la spec) : `ℝ`, `ℝ \ {points}` (liste de points exclus, extensible),
 * `intervalles` (union d'intervalles, extensible — réutilise `Morceau`, exercice 2), `∅`. Jamais
 * de valeur numérique attachée aux formes `reel`/`vide`. Identique aux deux niveaux (même raison
 * que `ReponseCE` ci-dessus).
 */
export type FormeDomaine = "reel" | "prive_points" | "intervalles" | "vide";

export interface ReponseDomaine {
  forme: FormeDomaine;
  points: number[];
  intervalles: Morceau[];
}

/** Étape 4 (isolement) : un seul champ libre, l'équation complète `[base](P1) = -k` (niveau 1,
 * membre droit CONSTANT) ou `[base](P1) = -k(x)` (niveau 2, membre droit LINÉAIRE en x) — même
 * structure de réponse aux deux niveaux, seule la vérification du membre droit diffère. */
export interface ReponseIsolement {
  texte: string;
}

/** Étape 5 (niveau 1), famille `valeur_absolue`/`carre` uniquement : les deux équations séparées
 * soumises ensemble, en une seule tentative (même principe "tout ou rien" que le reste du projet
 * pour un écran à plusieurs champs). */
export interface ReponseSeparation {
  equation1: string;
  equation2: string;
}

/** Étape 5 (niveau 1), familles `inverse`/`racine_carree`/`racine_cubique`/`cube` uniquement
 * (miroir de `separation` pour les 2 autres familles, `prompt-3-ameliorations-finales.md`, point
 * 2) : "se débarrasser de" la fonction de référence en un seul champ libre — le dénominateur
 * (`inverse`), la racine carrée (`racine_carree`), la racine cubique (`racine_cubique`), ou le
 * cube (`cube`). Vérifiée par équivalence algébrique flexible, comme le reste des étapes de ce
 * type du projet (voir `verifierDebarrasserNiveau1`). N'existe qu'au niveau 1 : au niveau 2, `k`
 * n'est plus une constante, "se débarrasser de" la fonction de référence produirait un polynôme de
 * degré 2 ou 3 selon la famille, jamais une équation linéaire immédiate.
 */
export interface ReponseDebarrasser {
  texte: string;
}

/**
 * Étape "condition de validité de l'équation" (niveau 2, `racine_carree`/`valeur_absolue`
 * uniquement — `prompt-niveau2caracteristiquesalgebriques.md`, section UX). Même principe de
 * construction guidée que le domaine (3 des 4 formes : `ℝ`, `∅`, un intervalle — jamais
 * `ℝ privé de points`, qui ne correspond à aucune inéquation linéaire) — réutilise le même
 * composant fraction-compatible (`ListeMorceauxFractionInput`/`morceauFraction.ts`) déjà en place
 * pour le domaine, restreint à UN SEUL intervalle (la condition est toujours une demi-droite,
 * jamais une union). Nom d'étape et intitulé délibérément distincts de "Conditions d'existence"
 * (CE) — ce n'est pas le domaine de `f`, mais une condition supplémentaire propre à l'équation en
 * cours de résolution.
 */
export type FormeCondition = "reel" | "vide" | "intervalle";

export interface ReponseCondition {
  forme: FormeCondition;
  intervalle: Morceau | null;
}

/**
 * Étape "validation d'une solution" (niveau 2, `racine_carree`/`valeur_absolue` uniquement) —
 * répétée une fois par racine à valider (jusqu'à 2 pour `racine_carree`, selon le nombre de racines
 * distinctes de l'équation du 2nd degré ; toujours exactement 2 pour `valeur_absolue`, une par
 * branche), même principe que `signeIrreductible` (exercice "tableau de signes à plusieurs
 * facteurs") : Oui/Non, formulation "la solution trouvée respecte-t-elle la condition [rappelée en
 * toutes lettres] ?".
 */
export type ReponseValidationSolution = boolean;

/** Étape "résolution des branches" (niveau 2, `valeur_absolue` uniquement) : les deux racines
 * algébriques trouvées, une par branche, soumises ensemble (même principe "tout ou rien" que
 * `ReponseSeparation`) — un champ numérique par branche (tolérant aux fractions), jamais un champ
 * texte d'équation ici : les deux branches sont déjà AFFICHÉES (données), seule leur résolution
 * (le nombre) est demandée. */
export interface ReponseResolutionBranches {
  racineBranche1: number;
  racineBranche2: number;
}

export type { ReponseExistence, ReponseZerosCaracteristiques };
export type { Categorie };

/**
 * Phases possibles, réunies pour les deux niveaux (voir `phaseInitiale`/les fonctions
 * `soumettreXxx`, `src/moteur/sessionCaracteristiquesAlgebriques.ts`, pour le détail exact de
 * l'enchaînement par niveau/famille) :
 * - Niveau 1 : `ordonnee → ce → domaine → isolement → [separation | debarrasser] → zeros` (7
 *   phases, chaque famille traverse EXACTEMENT une des deux étapes intermédiaires).
 * - Niveau 2 (`prompt-corrections-niveau2-vague2.md` — 2e vague de corrections, retire
 *   **entièrement** l'ancien mécanisme reconnaissance/champ1/champ2/factorisation, qui subsistait
 *   encore pour `inverse`/`racine_carree` malgré la décision déjà prise pour `carre` en 1re vague —
 *   toutes les familles rejoignent désormais directement `zeros` via une unique étape "regroupe"
 *   partagée, jamais de détour par un écran de choix de méthode) :
 *   - `carre`/`cube` : `... → isolement → zeros` — `isolement` y demande de DÉVELOPPER `[base](P1)`
 *     et de regrouper tous les termes d'un même côté (jamais d'isoler `[base](P1) = -k(x)` comme
 *     pour les 4 autres familles) : `isolement` **est** l'étape "regroupe" pour ces deux familles,
 *     aucune étape séparée n'est nécessaire (développer et isoler ne font qu'un seul geste ici).
 *   - `inverse` : `... → isolement → regroupe → zeros` — `isolement` garde son sens habituel
 *     (isoler `[base](P1) = -k(x)`), puis `regroupe` (nouvelle étape) demande de multiplier par le
 *     dénominateur et de regrouper, vérifié via `verifierIsolement` contre le polynôme du 2nd degré
 *     déjà embarqué (`zeros.enonce`).
 *   - `racine_carree` : `... → isolement → validite → regroupe → zeros → validationSolution×N` —
 *     `regroupe` (l'ancienne étape `elevationCarre`, renommée pour partager le même nom de phase
 *     que les 2 autres familles ci-dessous) demande d'élever chaque membre au carré et de
 *     regrouper, vérifié via `verifierIsolement` contre le même polynôme embarqué (`zeros.enonce`) ;
 *     `zeros` demande ensuite les racines CANDIDATES (non filtrées), et `validationSolution`
 *     clôture l'exercice — ordre corrigé par `prompt-corrections-niveau2-vague3.md`, point 2 (voir
 *     `ExerciceNiveau2RacineCarree` ci-dessus pour le détail).
 *   - `valeur_absolue` : `... → isolement → validite → resolutionBranches → validationSolution×2
 *     → zeros` (inchangé — aucune étape "regroupe" ici, le regroupement est implicite dans
 *     `resolutionBranches`, qui demande directement les deux racines).
 *   - `racine_cubique` : `... → isolement → regroupe → zeros` — `isolement` garde son sens habituel
 *     (isoler `∛(P1) = -k(x)`), puis `regroupe` (nouvelle étape) demande d'élever au cube et de
 *     regrouper, vérifié par échantillonnage numérique contre le polynôme réellement obtenu en
 *     élevant le membre `k(x)` au cube (`verifierRegroupe`, jamais contre `f(x)` lui-même — voir sa
 *     section dédiée pour la distinction avec `cube`).
 * Aucune étape de reconnaissance de FAMILLE (contrairement aux dixième/onzième exercices) : la
 * famille est toujours donnée directement (choisie par le réglage professeur), jamais devinée par
 * l'élève. Plus aucune étape de reconnaissance/factorisation guidée D'ÉQUATION non plus depuis
 * cette 2e vague — cette compétence est jugée déjà couverte par un autre générateur de la
 * plateforme (exercice "méthode la plus rapide") ; l'équation du 2nd degré embarquée
 * (`ExerciceNiveau2Quadratique.zeros`/`ExerciceNiveau2RacineCarree.zeros`, contrat de cet exercice)
 * ne sert plus qu'en INTERNE, comme cible de vérification pour `isolement`/`regroupe` et comme
 * source des vraies racines pour `zeros`/`validationSolution` — jamais surfacée à l'élève via un
 * écran de choix de méthode.
 */
export type PhaseCaracteristiquesAlgebriques =
  | "ordonnee"
  | "ce"
  | "domaine"
  | "isolement"
  | "separation"
  | "debarrasser"
  | "validite"
  | "regroupe"
  | "validationSolution"
  | "resolutionBranches"
  | "zeros";
