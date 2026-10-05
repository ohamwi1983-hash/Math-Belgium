/**
 * Couche core — contrat propre à l'exercice "inéquations rationnelles" (18, série 2).
 *
 * Niveau 1 : P1_1/P1_2 ◇ 0, racines distinctes, aucun facteur commun.
 * Niveau 2 : P1_1/P1_2 ◇ k (k constante non nulle) — isoler (P1_1/P1_2 - k ◇ 0) puis combiner en
 * une seule fraction (P1_3/P1_2 ◇ 0, où P1_3 = P1_1 - k·P1_2), après quoi la suite (CE, racine du
 * numérateur, grille, intervalle) est structurellement identique au niveau 1.
 * Niveau 3 : P1_1/P1_2 ◇ P1_3(x) (P1_3 un polynôme du 1er degré, pas une constante) — la
 * combinaison produit cette fois un numérateur du 2nd degré (P2_1), donc la suite réutilise le
 * moteur complet de reconnaissance+factorisation+racines de l'exercice "méthode la plus rapide"
 * (via `Exercice`) plutôt que la simple étape "racine du numérateur" des niveaux 1-2, et la grille
 * de signes gagne une ligne N supplémentaire (une par racine de P2_1).
 *
 * Réutilise délibérément plusieurs contrats déjà en place (même principe que l'exercice "tableau
 * de signes à plusieurs facteurs", voir CLAUDE.md) : `PolynomeLineaire` de l'exercice "Simplifier"
 * pour chaque polynôme linéaire (k(x-p), rien à reconnaître), `Exercice` de l'exercice "méthode la
 * plus rapide" pour le numérateur du 2nd degré du niveau 3, `Symbole`/`Morceau` de l'exercice
 * "tableau de signes" pour le symbole d'inégalité et les bornes d'un morceau, et
 * `Signe`/`ValeurCellule`/`SolutionEnsembleProduit` de l'exercice "tableau de signes à plusieurs
 * facteurs" pour les lignes du tableau (3 états, comme n'importe quel facteur simple) et pour
 * l'ensemble-solution final (déjà généralisé à un nombre variable de morceaux).
 *
 * Niveau 4 : P1_1/P1_2 ◇ P1_3/P1_4 (quatre polynômes du 1er degré) — approche directe (les 4
 * racines de P1_1..P1_4 pairwise distinctes choisies d'abord, jamais devinée par familles comme
 * secondDegre/index.ts) : le numérateur combiné P2_1 = P1_1·P1_4 - P1_3·P1_2 est calculé puis
 * classifié a posteriori (comme la construction `deux_denominateurs` de l'exercice "équations
 * rationnelles", cas 3c) plutôt que choisi a priori. Deux dénominateurs (P1_2, P1_4) au lieu d'un
 * seul ⇒ deux valeurs de CE et deux lignes D dans la grille — `denominateur`/`ce` (singuliers) ne
 * conviennent donc plus : le niveau 4 n'étend PAS `ExerciceInequationRationnelleBase` mais
 * directement `ExerciceInequationRationnelleBaseCommun` (les 3 champs réellement identiques aux 4
 * niveaux), avec ses propres champs `denominateurGauche`/`denominateurDroit`/`ce: [number, number]`.
 *
 * `numerateur`/`grille` ne sont volontairement PAS dans `ExerciceInequationRationnelleBase` : leur
 * TYPE diffère selon le niveau (PolynomeLineaire + GrilleQuotient pour les niveaux 1-2, `Exercice`
 * + GrilleQuotientNiveau3/4 pour les niveaux 3-4), donc chaque niveau les redéclare avec son propre
 * type — contrairement à `symbole`/`racines`/`solution`, identiques aux 4 niveaux et donc réellement
 * partageables (`ExerciceInequationRationnelleBaseCommun`) ; `denominateur`/`ce` (singuliers)
 * s'ajoutent à ce socle commun pour les niveaux 1-3 uniquement (`ExerciceInequationRationnelleBase`),
 * le niveau 4 les redéclarant lui aussi avec sa propre forme. C'est ce qui permet aux étapes
 * intervalle de rester niveau-agnostiques (Couche B), tandis que CE/grille/racine/reconnaissance y
 * branchent explicitement sur `exercice.niveau`.
 */

import type { Enonce, Exercice } from "./generateur.types";
import type { ExerciceSimplification, PolynomeLineaire } from "./simplification.types";
import type { Symbole } from "./inequation.types";
import type { SolutionEnsembleProduit, ValeurCellule } from "./signesProduit.types";

/**
 * Valeur de la ligne "signe du quotient" : les 3 états habituels d'une ligne de tableau de signes,
 * plus "∄" à la colonne correspondant à la racine du dénominateur (quotient non défini) — jamais
 * "0" à cette colonne, jamais "∄" ailleurs (toutes les racines sont toujours distinctes).
 */
export type ValeurCelluleQuotient = ValeurCellule | "∄";

/**
 * Grille de signes attendue (niveaux 1-2) : une ligne par polynôme (numérateur/dénominateur, 3
 * états chacune), plus la ligne finale du quotient (4 états, calculée par DIVISION des deux
 * précédentes — pas multiplication comme le tableau de signes produit, voir grilleQuotient.ts).
 * Toujours 3 colonnes de contenu × 5 colonnes (2 racines distinctes ⇒ 2×2+1).
 */
export interface GrilleQuotient {
  ligneNumerateur: ValeurCellule[];
  ligneDenominateur: ValeurCellule[];
  ligneQuotient: ValeurCelluleQuotient[];
}

/**
 * Grille de signes attendue (niveau 3 uniquement) : le numérateur combiné P2_1 étant du 2nd degré,
 * il apporte 2 lignes N (une par racine, toujours moniques — voir la note sur le signe de `a`
 * imposé positif à la construction) au lieu d'une seule ; la ligne D et la ligne quotient restent
 * structurellement identiques aux niveaux 1-2. 3 racines distinctes ⇒ 7 colonnes (2×3+1).
 *
 * `ligneCoefficient` (promptgenerateur6inequationRationnelle.md, point 7) : ligne optionnelle
 * dédiée au facteur constant du numérateur combiné, présente UNIQUEMENT quand ce facteur est
 * négatif (même règle que l'exercice "tableau de signes à plusieurs facteurs", voir
 * `ordreLignesGrille`/signesProduit.types.ts) — jamais pour niveau3 lui-même (coefficient dominant
 * toujours positif par construction, voir construireNiveau3.ts), uniquement pour la variante
 * `denominateurCarre` qui réutilise ce même type et où ce coefficient peut être négatif. Valeur
 * constante à chaque colonne (ce n'est pas fonction de x) — cyclée cellule par cellule comme
 * n'importe quelle autre ligne, par cohérence d'interface, même si la valeur attendue y est
 * toujours la même partout.
 */
export interface GrilleQuotientNiveau3 {
  ligneCoefficient?: ValeurCellule[];
  lignesNumerateur: [ValeurCellule[], ValeurCellule[]];
  ligneDenominateur: ValeurCellule[];
  ligneQuotient: ValeurCelluleQuotient[];
}

/**
 * Grille de signes attendue (niveau 4 uniquement) : 2 lignes N (racines de P2_1, comme le niveau 3)
 * + 2 lignes D (une par dénominateur, P1_2 et P1_4) + la ligne quotient. 4 racines distinctes ⇒ 9
 * colonnes (2×4+1).
 */
export interface GrilleQuotientNiveau4 {
  lignesNumerateur: [ValeurCellule[], ValeurCellule[]];
  lignesDenominateur: [ValeurCellule[], ValeurCellule[]];
  ligneQuotient: ValeurCelluleQuotient[];
}

/**
 * Grille de signes attendue (variante "sans facteur commun" — mêmes noms de champs que
 * GrilleQuotientNiveau4, mais rôles différents : le numérateur combiné ET le dénominateur sont ici
 * deux polynômes du 2nd degré indépendants — voir ExerciceInequationRationnelleSansFacteurCommun.
 * Type structurellement identique à GrilleQuotientNiveau4, réutilisé littéralement.
 */
export type GrilleQuotientSansFacteurCommun = GrilleQuotientNiveau4;

/**
 * Grille de signes attendue (variante "cubique", item b) : 3 lignes N (le facteur "x" mis en
 * évidence, puis les 2 racines du facteur quadratique restant, toutes moniques) + 1 ligne D (le
 * dénominateur linéaire) + la ligne quotient. 4 racines distinctes (0, q1, q2, p) ⇒ 9 colonnes
 * (2×4+1) — même nombre de colonnes que GrilleQuotientNiveau4, mais répartition différente des
 * lignes (3 N + 1 D au lieu de 2 N + 2 D), donc un type dédié est nécessaire.
 */
export interface GrilleQuotientCubique {
  lignesNumerateur: [ValeurCellule[], ValeurCellule[], ValeurCellule[]];
  ligneDenominateur: ValeurCellule[];
  ligneQuotient: ValeurCelluleQuotient[];
}

/** Niveaux/variantes implémentés. */
export type NiveauInequationRationnelle =
  | "niveau1"
  | "niveau2"
  | "niveau3"
  | "niveau4"
  | "denominateurCarre"
  | "facteurCommun"
  | "sansFacteurCommun"
  | "cubique";

/** Champs réellement identiques aux 4 niveaux — voir la note de tête de fichier. */
export interface ExerciceInequationRationnelleBaseCommun {
  symbole: Symbole;
  /** toutes les racines (numérateur(s) et dénominateur(s) confondus), triées croissant — 2 en niveaux 1-2, 3 en niveau 3, 4 en niveau 4. */
  racines: number[];
  solution: SolutionEnsembleProduit;
}

/**
 * Champs communs aux niveaux 1 à 3 uniquement (un seul dénominateur, une seule CE) — voir la note
 * de tête de fichier sur pourquoi `numerateur`/`grille` en sont volontairement exclus, et pourquoi
 * le niveau 4 (deux dénominateurs) n'étend pas cette interface.
 */
export interface ExerciceInequationRationnelleBase extends ExerciceInequationRationnelleBaseCommun {
  denominateur: PolynomeLineaire;
  /** racine du dénominateur — seule valeur interdite. */
  ce: number;
}

export interface ExerciceInequationRationnelleNiveau1 extends ExerciceInequationRationnelleBase {
  niveau: "niveau1";
  numerateur: PolynomeLineaire;
  grille: GrilleQuotient;
}

/**
 * `numerateurAvantCombinaison` (P1_1) et `k` ne servent qu'aux étapes "isoler"/"combiner" et à
 * l'affichage de l'énoncé de départ — jamais aux étapes CE/racine du numérateur/grille/intervalle,
 * qui utilisent exclusivement `numerateur` (P1_3, déjà combiné).
 */
export interface ExerciceInequationRationnelleNiveau2 extends ExerciceInequationRationnelleBase {
  niveau: "niveau2";
  numerateur: PolynomeLineaire;
  grille: GrilleQuotient;
  numerateurAvantCombinaison: PolynomeLineaire;
  /** constante non nulle du membre de droite de l'énoncé d'origine (P1_1/P1_2 ◇ k). */
  k: number;
}

/**
 * `numerateur` est ici `Exercice` (P2_1, le numérateur combiné du 2nd degré) — réutilise tel quel
 * le mécanisme reconnaissance+factorisation+racines de l'exercice "méthode la plus rapide".
 * `numerateurAvantCombinaison` (P1_1, toujours du 1er degré par construction — voir
 * construireNiveau3.ts) et `p1_3` (le polynôme du 1er degré au membre de droite de l'énoncé
 * d'origine) ne servent qu'aux étapes "isoler"/"combiner"/affichage de l'énoncé de départ.
 */
export interface ExerciceInequationRationnelleNiveau3 extends ExerciceInequationRationnelleBase {
  niveau: "niveau3";
  numerateur: Exercice;
  grille: GrilleQuotientNiveau3;
  numerateurAvantCombinaison: PolynomeLineaire;
  p1_3: PolynomeLineaire;
}

/**
 * `numerateur` est ici `Exercice` (P2_1 = P1_1·P1_4 - P1_3·P1_2, classifié a posteriori — voir
 * construireNiveau4.ts), comme le niveau 3. `numerateurGaucheAvantCombinaison`/
 * `numerateurDroitAvantCombinaison` (P1_1/P1_3, les deux numérateurs d'origine, jamais réduits à un
 * seul type puisqu'aucun des deux n'est "le" numérateur combiné) ne servent qu'aux étapes
 * "isoler"/"combiner"/affichage de l'énoncé de départ. `denominateurGauche`/`denominateurDroit`
 * (P1_2/P1_4) remplacent le `denominateur` singulier des niveaux 1-3 ; `ce` devient un tuple des
 * deux racines triées.
 */
export interface ExerciceInequationRationnelleNiveau4 extends ExerciceInequationRationnelleBaseCommun {
  niveau: "niveau4";
  numerateur: Exercice;
  grille: GrilleQuotientNiveau4;
  denominateurGauche: PolynomeLineaire;
  denominateurDroit: PolynomeLineaire;
  numerateurGaucheAvantCombinaison: PolynomeLineaire;
  numerateurDroitAvantCombinaison: PolynomeLineaire;
  ce: [number, number];
}

/**
 * Variante "dénominateur au carré" (A/(P1_2)² ◇ k) — orthogonale à l'axe niveau1-4 (indépendante de
 * "que vaut le membre de droite ?"), mais structurellement très proche du niveau 3 : un seul
 * dénominateur ⇒ étend `ExerciceInequationRationnelleBase` (denominateur/ce singuliers, comme les
 * niveaux 1-3), un numérateur combiné du 2nd degré ⇒ réutilise `Exercice` et **littéralement**
 * `GrilleQuotientNiveau3` (même forme exacte : 2 lignes N + 1 ligne D + quotient, jamais besoin
 * d'un type dédié). `denominateur` est toujours monique (k=1) par construction — voir
 * construireDenominateurCarre.ts, le carré efface de toute façon le signe du coefficient dominant
 * dans l'affichage. `A`/`k` (les deux constantes non nulles de l'énoncé d'origine) ne servent qu'aux
 * étapes "isoler"/"combiner"/affichage de l'énoncé de départ, comme `k` au niveau 2.
 *
 * Contrairement aux niveaux 3-4, le coefficient dominant du numérateur combiné n'est PAS forcé
 * positif ici : l'identité A - k·(P1_2)² impose A = -a·d² (où d = écart entre les racines choisies
 * et la racine de P1_2), donc `a` et `A` ont toujours des signes opposés — les forcer positifs
 * forcerait A négatif, ce qui contredirait l'exemple du PDF (A=4>0, a=-1<0). La ligne "quotient" de
 * la grille est donc calculée par évaluation DIRECTE du polynôme réel (jamais via le raccourci
 * "produit des 2 signes moniques N1×N2", qui suppose implicitement a>0) — voir
 * construireGrilleQuotientDenominateurCarre.ts.
 */
export interface ExerciceInequationRationnelleDenominateurCarre extends ExerciceInequationRationnelleBase {
  niveau: "denominateurCarre";
  numerateur: Exercice;
  grille: GrilleQuotientNiveau3;
  A: number;
  k: number;
}

/**
 * Variante "facteur commun" (N(x)/D(x) ◇ 0, N et D tous deux du 2nd degré, partageant exactement
 * une racine commune p) — seconde extension orthogonale à l'axe niveau1-4, réutilisant cette fois
 * la construction "P2/P2 racine commune" de l'exercice "Simplifier" (`fraction:
 * ExerciceSimplification`, toujours `type: "P2/P2"`) plutôt que de dupliquer cette logique.
 * `numerateurSimplifie`/`denominateurSimplifie` sont les facteurs moniques (x-q)/(x-s) dérivés une
 * fois à la construction (voir construireGrilleFacteurCommun.ts) — mêmes rôle et convention que les
 * lignes N moniques du niveau 3 (le signe réel de a_N/a_D ne compte pas : les deux sont toujours
 * positifs par construction, voir construireP2Impose/secondDegre/categories — donc jamais besoin du
 * vrai coefficient pour l'analyse de signe, seulement pour l'affichage de l'énoncé, qui reste lui
 * réellement développé/réduit via `fraction`/formatFractionSimplifiee). `grille` réutilise
 * **littéralement** `GrilleQuotient` (même forme que les niveaux 1-2 : après simplification, N/D
 * redevient une vraie fraction P1/P1) — jamais besoin d'un type dédié. `ce` est un tuple des 2
 * racines de D **avant** simplification (p et s) : c'est le dénominateur d'origine qui définit le
 * domaine, la simplification à venir ne change pas cette contrainte (spec section 2) — donc la
 * colonne de p reste présente dans la grille (`racines` inclut p, q ET s, jamais seulement q et s)
 * même si p n'est la racine d'aucune ligne affichée après simplification : sa colonne "point" est
 * dite orpheline (∄ sur la ligne quotient, sans ligne de facteur qui vaille "0" à cette colonne) —
 * voir construireGrilleFacteurCommun.ts pour le détail de cette règle, qui réutilise directement le
 * principe déjà en place "∄ à toute colonne de CE" plutôt que d'ajouter un cas spécial.
 */
export interface ExerciceInequationRationnelleFacteurCommun extends ExerciceInequationRationnelleBaseCommun {
  niveau: "facteurCommun";
  fraction: ExerciceSimplification;
  numerateurSimplifie: PolynomeLineaire;
  denominateurSimplifie: PolynomeLineaire;
  grille: GrilleQuotient;
  /** racines de D avant simplification (p et s), triées — voir la note ci-dessus. */
  ce: [number, number];
}

/**
 * Variante "sans facteur commun" (item f) : N(x)/D(x) ◇ k, N et D tous deux du 2nd degré, aucune
 * racine partagée (contrairement à `facteurCommun`, qui est ici son exact miroir). Contrairement
 * aux niveaux 1-3, D lui-même est du 2nd degré ⇒ nécessite sa propre séquence
 * reconnaissance+factorisation+racines (`denomReconnaissance`/`denomChamp1`, puis `ce` — voir
 * sessionInequationRationnelle.ts) avant celle, déjà existante, du numérateur combiné
 * (`reconnaissance`/`champ1`/`champ2`, réutilisée telle quelle sur `numerateur: Exercice`, comme
 * les niveaux 3-4/denominateurCarre). `numerateurAvantCombinaison` (N(x) d'origine, du 2nd degré
 * lui aussi, jamais factorisé — seul son développé sert à l'énoncé de départ et à l'étape
 * isoler/combiner) est un simple `Enonce` {a,b,c}, pas un `Exercice` complet : contrairement à
 * `numerateur`, l'élève n'a jamais à le factoriser. `grille` réutilise **littéralement**
 * `GrilleQuotientNiveau4` (même forme exacte : 2 lignes N + 2 lignes D + quotient) — construite ici
 * à partir de deux polynômes du 2nd degré indépendants plutôt que de deux `PolynomeLineaire`
 * (P1_2/P1_4 du niveau 4), voir construireGrilleQuotientSansFacteurCommun.ts. `ce` (racines de D,
 * 2 valeurs) est produit par `denomChamp1`→`ce` exactement comme le reste de la racine de D une
 * fois factorisé — pas une étape distincte redemandant la même chose (contrairement à
 * `facteurCommun`, où le "ce" initial précède un mécanisme "Simplifier" par ailleurs redondant) :
 * ici, factoriser D EST la façon d'obtenir la CE, donc `soumettreReponseCEListe` (déjà existante,
 * réutilisée telle quelle) est appelée directement après `denomChamp1`, sans nouvelle vérification.
 */
export interface ExerciceInequationRationnelleSansFacteurCommun extends ExerciceInequationRationnelleBaseCommun {
  niveau: "sansFacteurCommun";
  numerateur: Exercice;
  denominateur: Exercice;
  grille: GrilleQuotientSansFacteurCommun;
  numerateurAvantCombinaison: Enonce;
  k: number;
  ce: [number, number];
}

/**
 * Variante "cubique" (item b) : N(x)/P1_D(x) ◇ 0, où N(x) = x·(ax²+bx+c) est un polynôme du 3e
 * degré sans terme constant, obtenu par mise en évidence de x (jamais affiché factorisé — voir
 * formatEnonceCubiqueLatex). `numerateur` porte ici le facteur quadratique **restant** après mise
 * en évidence de x (ax²+bx+c), pas N(x) tout entier — c'est délibéré : ça permet de réutiliser
 * telles quelles les étapes reconnaissance/champ1/champ2 déjà existantes (elles ne connaissent que
 * `exercice.numerateur: Exercice`, sans savoir qu'il ne représente ici qu'un facteur de N(x)).
 * `denominateur: PolynomeLineaire` (P1_D) et `ce: number` (sa racine p, valeur unique) suivent
 * exactement la convention des niveaux 1-3 (`ExerciceInequationRationnelleBase`), mais cette
 * variante n'étend pas cette interface : la nouvelle étape "miseEnEvidence" (entre `ce` et
 * `reconnaissance`, voir sessionInequationRationnelle.ts) n'a pas sa place dans le socle partagé,
 * donc `denominateur`/`ce` sont redéclarés ici directement, comme le fait déjà `denominateurCarre`
 * pour une raison différente. `grille` a besoin d'un type dédié (`GrilleQuotientCubique`, 3 lignes
 * N + 1 ligne D) : aucun type existant n'a cette répartition (2N+1D pour GrilleQuotientNiveau3,
 * 2N+2D pour GrilleQuotientNiveau4).
 */
export interface ExerciceInequationRationnelleCubique extends ExerciceInequationRationnelleBaseCommun {
  niveau: "cubique";
  numerateur: Exercice;
  denominateur: PolynomeLineaire;
  grille: GrilleQuotientCubique;
  ce: number;
}

export type ExerciceInequationRationnelle =
  | ExerciceInequationRationnelleNiveau1
  | ExerciceInequationRationnelleNiveau2
  | ExerciceInequationRationnelleNiveau3
  | ExerciceInequationRationnelleNiveau4
  | ExerciceInequationRationnelleDenominateurCarre
  | ExerciceInequationRationnelleFacteurCommun
  | ExerciceInequationRationnelleSansFacteurCommun
  | ExerciceInequationRationnelleCubique;

/**
 * Alias pour le sous-ensemble "numérateur linéaire" (niveaux 1-2) — utilisé partout où le code
 * (grille/CE/racine du numérateur/affichage) suppose `numerateur: PolynomeLineaire` et
 * `grille: GrilleQuotient`, incompatibles avec la forme du niveau 3 (`numerateur: Exercice`,
 * `grille: GrilleQuotientNiveau3`). Le niveau 3 a ses propres fonctions/composants dédiés.
 */
export type ExerciceInequationRationnelleNumerateurLineaire =
  | ExerciceInequationRationnelleNiveau1
  | ExerciceInequationRationnelleNiveau2;

export type GenerateurExerciceInequationRationnelle = () => ExerciceInequationRationnelle;

/**
 * Réglage de complexité : `niveauxActifs` peut contenir "niveau1"/"niveau2"/"niveau3"/"niveau4"/
 * "denominateurCarre"/"facteurCommun"/"sansFacteurCommun"/"cubique", et `repartition` détermine
 * comment le générateur choisit entre eux à chaque exercice (voir
 * choisirNiveau.ts) — "fixe" répète toujours le premier niveau actif, "equilibre" tire uniformément
 * parmi tous les niveaux actifs. Objet de réglages propre à cet exercice, distinct de
 * `ReglagesSession` (session.types.ts, partagé par tous les exercices) : ce réglage n'a de sens que
 * pour cette verticale, les autres exercices n'ont pas de notion de niveau.
 */
export interface ReglagesInequationRationnelle {
  niveauxActifs: NiveauInequationRationnelle[];
  repartition: "fixe" | "equilibre";
}
