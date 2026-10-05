/**
 * Couche core — "Problèmes d'optimisation (fonction du second degré)", cinquante-cinquième
 * générateur du projet (ajouté en fin de liste, `App.tsx` — une renumérotation globale de tous les
 * générateurs est prévue comme chantier séparé, voir CLAUDE.md). Spec : `specgen55optimisationseconddegre.md`.
 *
 * Deux variantes, séquences d'écrans DISJOINTES (même principe que "Paramètres de position",
 * `core/mediane.types.ts`) :
 * - `"modelisation"` (familles `aireEnclos`/`revenuPrix`/`sommeDeuxCarres`/`rectangleInscrit`) :
 *   l'élève CONSTRUIT la fonction depuis l'énoncé, en 7 écrans (`prompt-restructuration-
 *   architecture-modelisation.md`, remplace une version antérieure à 8 écrans) : identifie x et y
 *   (écran "identification"), pose la relation NON isolée ET exprime la grandeur avec x ET y encore
 *   présents — 2 champs, 2 statuts (écran "contrainteEtGrandeur"), résout le système ainsi posé —
 *   isole une variable, substitue, développe, EN UNE SEULE réponse (écran "systeme" ; perte assumée :
 *   les pièges "isoler" et "développer" ne sont plus diagnostiqués séparément), détermine le domaine
 *   de validité (écran "domaine"), calcule le sommet (écran "sommet"), décide sommet-ou-borne (écran
 *   "decision") et interprète (écran "interpretation"). **Applicable identiquement aux 4 familles**
 *   — `rectangleInscrit` (V) n'est plus une exception structurelle (elle avait autrefois sauté
 *   "contrainte" entièrement) : son écran "identification" et son écran "contrainteEtGrandeur"
 *   existent bien, seul le RAISONNEMENT diffère (proportion géométrique/triangles semblables, jamais
 *   une contrainte de somme comme A/B/T — voir `ui/formatOptimisation.ts`, aide dédiée).
 * - `"fonctionDonnee"` (familles `formeParabolique`/`coutProduction`/`grandeurTemps`) : fonction ET
 *   domaine DÉJÀ fournis dans l'énoncé — démarre directement à "sommet" (jamais de dérivation), même
 *   3 dernières étapes que `modelisation` (sommet → décision → interprétation).
 *
 * **Écrans "isolement"/"construction" (ancienne architecture à 8 écrans) — RETIRÉS de toute
 * séquence réelle, y compris celle du 57e exercice depuis `promptimplementationgen57.md`** : le 57e
 * exercice ("Équations/inéquations du second degré en contexte") réutilise désormais lui aussi les
 * écrans "identification"/"contrainteEtGrandeur"/"systeme" ci-dessous pour SES PROPRES familles
 * exclusives (`seuilRentabilite`/`remplissageReservoir`/etc., voir `FamilleOptimisationModelisation`
 * ci-dessous) via les composants `components/EtapeIdentificationOptimisation.tsx`/
 * `EtapeContrainteEtGrandeurOptimisation.tsx`/`EtapeSystemeOptimisation.tsx` (exactement les mêmes
 * que CE générateur, importés tels quels, jamais dupliqués). L'écran "systeme" RÉUTILISE
 * `diagnostiquerConstruction`/`verifierConstruction` (ancienne architecture, restées définies
 * uniquement pour cet usage interne) sous les alias `diagnostiquerSysteme`/`verifierSysteme` (même
 * cible : la fonction développée finale), jamais une seconde implémentation de la même vérification.
 * Les CHAMPS `contrainte`/`formuleSubstitueeTexte`/`texteAideContrainteNiveau1`/`2`/
 * `formuleGrandeurXYTexte`/`texteAideGrandeurNiveau1`/`2` du contrat ci-dessous sont donc partagés
 * par les 2 générateurs sans distinction.
 *
 * **7 familles narratives** (colonnes A/B/C/E/G/T/V de la spec) — `sommeDeuxCarres` (T) et
 * `formeParabolique` (C) sont chacune la FUSION de 2 anciennes familles de code distinctes
 * (`objetCasse`+`materiauCoupe`, `trajectoire`+`archePont`), corrigée par
 * `promptverificationfusionsmanquantesgen55.md` — la spec ne prévoyait qu'UNE seule famille de code
 * par lettre, jamais un id par ancien sous-nom.
 *
 * Famille "consommationVitesse" (F) proposée puis RETIRÉE (`promptreconstructiongen55.md`) — aucune
 * formule quadratique réelle trouvée après recherche (consommation vs vitesse dépend du rendement
 * moteur/aérodynamique, courbe mesurée empiriquement, jamais un modèle du second degré établi dans
 * un manuel), et son argument de diversité ("seule famille min") était déjà invalidé par ailleurs
 * (`coutProduction`/`sommeDeuxCarres` sont déjà `sens:"min"`). Ne pas la réintroduire sans une vraie
 * source.
 *
 * **Propreté garantie par construction** — TOUTES les valeurs générées (coefficients de la
 * fonction développée, bornes du domaine, coordonnées du sommet, valeur optimale même quand
 * l'optimum réel est à une borne) sont des ENTIERS exacts, jamais de bruit de virgule flottante ni
 * de simple rationalité approximative : `a`/`b`/`c`/`x_S`/`y_S`/`domaine.inf`/`domaine.sup` sont
 * tous entiers par construction (voir `generateurs/optimisation/optimum.ts` et chaque module de
 * famille pour le détail). Ceci répond explicitement à la contrainte de génération de la spec
 * ("f(borne) doit être tout aussi propre que la valeur au sommet") — voir CLAUDE.md.
 */

export type VarianteOptimisation = "modelisation" | "fonctionDonnee";

/**
 * `"seuilRentabilite"|"remplissageReservoir"|"rectangleDimensions"|"resistancesParallele"|
 * "achatGroupe"|"triangleRectanglePerimetre"` (voie `modelisation`) et `"chuteObjet"|
 * "distanceFreinage"` (voie `fonctionDonnee`, voir `FamilleOptimisationFonctionDonnee` ci-dessous)
 * sont exclusives au cinquante-septième exercice ("Équations/inéquations du second degré en
 * contexte") — jamais produites par aucune des 4 familles de CE générateur (gen55), qui n'utilise
 * que `"aireEnclos"`/`"revenuPrix"`/`"sommeDeuxCarres"`/`"rectangleInscrit"`. Même précédent que
 * `Categorie`/`"irreductible"` (`core/generateur.types.ts`, exclusive à "Analyse d'une fonction du
 * second degré") : le cinquante-septième exercice embarque directement un `ExerciceOptimisation`
 * comme sous-champ (`base`, écrans "isolement"/"construction"/"domaine" réutilisés tels quels pour
 * la voie `modelisation`, sautés entièrement pour `fonctionDonnee` — voir sa section CLAUDE.md
 * dédiée), donc son propre id de famille doit être un membre valide de ces mêmes unions plutôt qu'un
 * contrat parallèle dupliqué.
 */
export type FamilleOptimisationModelisation =
  | "aireEnclos"
  | "revenuPrix"
  | "sommeDeuxCarres"
  | "rectangleInscrit"
  | "seuilRentabilite"
  | "remplissageReservoir"
  | "rectangleDimensions"
  | "resistancesParallele"
  | "achatGroupe"
  | "triangleRectanglePerimetre";
/** `"chuteObjet"|"distanceFreinage"` : rerroutées de `FamilleOptimisationModelisation` vers cette
 * union (`promptrestructurationgenequationinequation.md`) — leurs coefficients (vitesse initiale,
 * hauteur, formule de freinage) sont des données PHYSIQUES directement communiquées, jamais issues
 * d'une contrainte à 2 variables à éliminer, donc jamais réellement `modelisation` malgré leur
 * ancien routage — voir CLAUDE.md, "Création — cinquante-septième exercice". */
export type FamilleOptimisationFonctionDonnee =
  | "formeParabolique"
  | "coutProduction"
  | "grandeurTemps"
  | "chuteObjet"
  | "distanceFreinage";
export type FamilleOptimisation = FamilleOptimisationModelisation | FamilleOptimisationFonctionDonnee;

export type SensOptimisation = "max" | "min";

/** Genre grammatical de `ContexteOptimisationCommun.nomGrandeur`, nécessaire pour l'accord de
 * "maximal(e)"/"minimal(e)" — "l'aire"/"la hauteur" (féminin) vs "le revenu"/"le coût" (masculin).
 * Défini ici (Couche core, jamais dans `generateurs/`) car consommé À LA FOIS par la présentation
 * (`ui/formatOptimisation.ts`, écrans 6/7 contextualisés) et par la génération
 * (`generateurs/optimisation/interpretation.ts`, qui le réexporte pour compatibilité) — un type core
 * ne doit jamais être défini dans une couche supérieure puis remonté. */
export type GenreGrandeur = "masculin" | "feminin";

/**
 * Configuration réellement tirée pour le croquis SVG du mode `cloture` d'`aireEnclos`
 * (`prompt-implementation-3-diagrammes-svg.md`) — nécessaire car mathématiquement INDISCERNABLE de
 * `contrainte`/`fonction`/`domaine` seuls : `libre` et `deuxMurs` produisent exactement les mêmes
 * `pente`/`ordonnee`/`sommet`/`domaine` pour des `quart`/`L` différents (2 côtés clôturés sur un
 * périmètre `L` restreint ≡ 4 côtés clôturés sur un périmètre `2·L`, seule la narration distingue les
 * deux — voir `generateurs/optimisation/familles/aireEnclos.ts::construireContrainte`). Seul le
 * générateur connaît la vraie configuration tirée ; sans ce champ, aucun moyen fiable de savoir quels
 * côtés hachurer côté présentation autrement qu'en re-parsant `phraseEnonce` (fragile, déjà fait une
 * fois par erreur dans `aireEnclos.test.ts`, jamais à reproduire dans du code de présentation réel).
 */
export type ConfigurationCloture = "libre" | "mur" | "deuxMurs";

/**
 * Croquis SVG optionnel associé à l'instance (`prompt-implementation-3-diagrammes-svg.md`) — motif
 * "ghost optional-prop" déjà établi sur ce contrat (voir `genreGrandeur` ci-dessous) : seules 3
 * familles le renseignent RÉELLEMENT (`rectangleInscrit` toujours ; `sommeDeuxCarres` sous-skin
 * `materiau` seulement, jamais `pierre`, qui n'a pas de forme géométrique définie ; `aireEnclos` mode
 * `cloture` seulement, jamais `direct`/`triangleRectangle`, qui n'ont pas de narration "clôture/mur")
 * — toutes les autres familles (dont les 8 exclusives au 57e exercice) le laissent `undefined`,
 * jamais un croquis affiché sans donnée réelle derrière. Rendu par `components/CroquisOptimisation.tsx`
 * — SVG sur mesure, jamais Mafs (croquis purement illustratif, l'élève n'y lit aucune coordonnée
 * chiffrée, convention CLAUDE.md "Rendu graphique").
 */
export type CroquisOptimisation =
  | { type: "rectangleInscrit" }
  | { type: "sommeDeuxCarresMateriau" }
  | { type: "aireEnclosCloture"; configuration: ConfigurationCloture };

/** Fonction développée f(x) = a·x² + b·x + c. */
export interface CoefficientsQuadratiques {
  a: number;
  b: number;
  c: number;
}

export interface DomaineOptimisation {
  inf: number;
  sup: number;
}

export interface PointOptimisation {
  x: number;
  y: number;
}

/** Une option de l'écran "interpretation" (QCM) — une seule `correcte: true` par exercice, l'ordre
 * des options (mélangé à la génération) est fixe pour l'instance, jamais retrié côté présentation. */
export interface OptionInterpretation {
  texte: string;
  correcte: boolean;
}

/** Habillage narratif partagé par les 2 variantes — labels/unités utilisés sur TOUS les écrans
 * (jamais du texte dupliqué en dur dans chaque composant d'écran). */
export interface ContexteOptimisationCommun {
  /** Phrase(s) d'introduction du contexte, affichée(s) en tête de chaque écran (même principe que
   * "Paramètres de position"/`formatEnonceTexte`). */
  phraseEnonce: string;
  /** Symbole utilisé pour la variable (x, p, t, q...). */
  labelVariable: string;
  /** Nom français de la variable (ex. "la largeur", "la hausse de prix"). */
  nomVariable: string;
  /** Nom français de la grandeur optimisée (ex. "l'aire", "le revenu"). */
  nomGrandeur: string;
  /** Accord grammatical de `nomGrandeur`, nécessaire pour contextualiser les écrans "sommet"/
   * "decision" (`ui/formatOptimisation.ts`, `spec-gen55-optimisation-second-degre.md` section 4) —
   * ex. "le revenu maximal" (masculin) vs "l'aire maximale" (féminin). OPTIONNEL — motif "ghost
   * optional-prop" déjà établi sur cette plateforme (voir CLAUDE.md) : les 8 familles exclusives au
   * cinquante-septième exercice (`seuilRentabilite`/`remplissageReservoir`/etc., voir
   * `FamilleOptimisationModelisation`/`FamilleOptimisationFonctionDonnee`) ont leurs PROPRES écrans
   * sommet/decision (jamais `EtapeSommetOptimisation`/`EtapeDecisionOptimisation` de gen55), donc
   * n'ont jamais besoin de le renseigner — absent ⇒ repli générique non genré dans les fonctions de
   * `ui/formatOptimisation.ts` concernées, jamais une erreur de compilation en cascade sur gen57. */
  genreGrandeur?: GenreGrandeur;
  uniteVariable: string;
  uniteGrandeur: string;
  /** Croquis SVG optionnel illustrant la géométrie de l'instance — voir `CroquisOptimisation`
   * ci-dessus pour le motif "ghost optional-prop" et la liste exacte des familles concernées.
   * `undefined` ⇒ aucun croquis affiché (`EnonceOptimisation.tsx`), jamais un repli générique. */
  croquis?: CroquisOptimisation;
  /** Question finale de l'exercice (ex. "Quelle est l'aire maximale ?"), affichée PERSISTANTE sur
   * chaque écran (`components/QuestionFinale.tsx`, voir CLAUDE.md "Question finale persistante") —
   * corrige un défaut où l'élève résolvait isolement/construction/domaine sans jamais voir
   * l'objectif final. `null` uniquement pour les 4 familles propres au cinquante-septième exercice
   * (`chuteObjet`/`seuilRentabilite`/`distanceFreinage`/`remplissageReservoir`, jamais produites par
   * gen55 lui-même) : leur `base` n'atteint jamais les écrans sommet/decision de gen55 (ce
   * générateur a ses propres écrans 4-7 et sa propre question finale, portée par
   * `ExerciceEquationInequationCommun.questionFinale` — jamais celle-ci), donc une question ici
   * décrivant l'optimum de gen55 serait trompeuse. */
  questionFinale: string | null;
}

/** Relation de contrainte donnée par l'énoncé (écran "isolement", `modelisation` uniquement) —
 * toujours affine en la variable choisie, jamais déjà isolée (`enonceLatex` la montre sous forme
 * additive/implicite) : `pente`/`ordonnee` sont la forme isolée ATTENDUE, `y = pente·x + ordonnee`. */
export interface ContrainteOptimisation {
  enonceLatex: string;
  lettreCherchee: string;
  pente: number;
  ordonnee: number;
}

/**
 * Écran "identification" — désormais un ÉCRAN À PART ENTIÈRE, premier de la séquence
 * `modelisation` (`prompt-restructuration-architecture-modelisation.md` ; auparavant une sous-étape
 * embarquée dans l'écran "contrainte") — 2 menus déroulants, vérifiés par sélection (statut séparé
 * de l'équation, pour isoler les 2 pièges l'un de l'autre). **Conditionnelle au skin** : présente
 * uniquement quand x/y désignent une grandeur physique à déduire du contexte, avec au moins une
 * grandeur DÉRIVÉE concurrente plausible (ex. "le côté du carré" au lieu de "la longueur du morceau
 * de fil plié en carré") ; absente (`identificationXY` alors `undefined` sur l'exercice, écran
 * "identification" sauté entièrement — voir `moteur/sessionOptimisation.ts::phaseInitiale`) quand
 * l'énoncé nomme déjà x et y sans ambiguïté (ex. `formeParabolique`/`grandeurTemps` : "sa hauteur
 * h... après t secondes" — variable et grandeur déjà nommées littéralement, aucune identification à
 * faire ; ou `aireEnclos` mode `direct`/`triangleRectangle` : "deux nombres x et y", "ses 2 côtés x
 * et y" — x/y cités tels quels dans la phrase). `candidatsX`/`candidatsY` sont déjà mélangés à la
 * génération (jamais re-triés côté présentation, même convention que `OptionInterpretation`).
 */
export interface IdentificationXY {
  candidatsX: string[];
  indexCorrectX: number;
  candidatsY: string[];
  indexCorrectY: number;
}

interface ExerciceOptimisationCommun {
  sens: SensOptimisation;
  contexte: ContexteOptimisationCommun;
  fonction: CoefficientsQuadratiques;
  domaine: DomaineOptimisation;
  sommet: PointOptimisation;
  /** Dérivé de `sommet.x`/`domaine`, jamais retiré indépendamment côté vérification. */
  sommetDansDomaine: boolean;
  /** Le VRAI optimum de la grandeur sur le domaine — égal à `sommet` si `sommetDansDomaine`,
   * sinon la borne du domaine la plus proche du sommet (voir `generateurs/optimisation/optimum.ts`). */
  optimal: PointOptimisation;
  optionsInterpretation: OptionInterpretation[];
}

export interface ExerciceOptimisationModelisation extends ExerciceOptimisationCommun {
  variante: "modelisation";
  famille: FamilleOptimisationModelisation;
  contrainte: ContrainteOptimisation;
  /** RHS texte (PAS du LaTeX — même convention que `texteAideConstructionNiveau1`/`2`, rendu en
   * texte brut, jamais `<Katex>`) de la formule substituée-mais-non-développée (aide niveau 2 de
   * l'écran "construction"), ex. `"(P0+x) · (-kx+Q0)"` — nécessaire dès que la vraie formule n'est
   * pas un simple produit `labelVariable · (isolé)` (facteur décalé, coefficient multiplicatif,
   * division, somme de carrés...). Absent/`undefined` ⇒ reconstruite génériquement par
   * `texteAideConstructionNiveau2` (`ui/formatOptimisation.ts`), le cas le plus courant (produit
   * simple, ex. `aireEnclos`/`rectangleDimensions`/`rectangleInscrit`/`achatGroupe`). */
  formuleSubstitueeTexte?: string;
  /**
   * Textes d'aide (niveaux 1/2) de l'écran "contrainte" (`promptreconstructiongen55.md`) — le piège
   * pédagogique de cet écran dépend entièrement du contexte narratif/de la configuration (ex.
   * `aireEnclos` : compter 2/3/4 côtés selon libre/mur/deuxMurs), jamais généralisable — chaque
   * famille avec écran "contrainte" fournit les deux. Absents pour `rectangleInscrit`, seule famille
   * `modelisation` SANS écran "contrainte" (raisonnement de proportion géométrique dès l'écran
   * "isolement", jamais une équation à poser d'abord).
   */
  texteAideContrainteNiveau1?: string;
  texteAideContrainteNiveau2?: string;
  /** Écran "identification" — voir `IdentificationXY` ci-dessus. `undefined` ⇒ écran sauté
   * entièrement (x et y déjà nommés sans ambiguïté par la phrase de l'exercice). */
  identificationXY?: IdentificationXY;
  /**
   * Écran "contrainteEtGrandeur", champ 2 (`prompt-restructuration-architecture-modelisation.md`) —
   * expression VALIDE de la grandeur cible en fonction de x ET y (aucune substitution : y reste `y`,
   * jamais remplacé par sa valeur isolée), ex. `"x*y"` (aireEnclos/rectangleInscrit),
   * `"(20+x)*y"` (revenuPrix, P0 déjà substitué numériquement), `"3*x^2+3*y^2"` (sommeDeuxCarres
   * pierre, k déjà substitué), `"x^2/16+y^2/24"` (sommeDeuxCarres matériau). Sert de DOUBLE source de
   * vérité : affichée telle quelle dans l'aide niveau 2, et RÉ-ÉVALUÉE par
   * `verificationOptimisation.ts::diagnostiquerGrandeurXY` (via `evaluerExpressionGenerale`, "y"
   * traité comme variable nommée) pour construire la cible de comparaison — jamais une seconde
   * formule hardcodée en parallèle qui pourrait diverger. Requis (non optionnel) : les 4 familles de
   * CE générateur (A/B/T/V) l'alimentent TOUJOURS, ainsi que les 6 familles `modelisation` du 57e
   * exercice (celui-ci réutilise le même écran "contrainteEtGrandeur", voir en-tête de fichier) —
   * seules les 2 familles `fonctionDonnee` du 57e exercice (fonction déjà donnée, écran sauté) et
   * `achatGroupe` (`voieSysteme`, écran sauté — le champ y sert uniquement à l'affichage de
   * l'accolade de l'écran "systeme") ne le lisent jamais pour la vérification. Optionnel au niveau du
   * type car TypeScript ne peut pas l'exiger conditionnellement selon la famille : voir la garde
   * d'exécution dans `diagnostiquerGrandeurXY`.
   */
  formuleGrandeurXYTexte?: string;
  /** Aides (niveaux 1/2) du champ 2 de l'écran "contrainteEtGrandeur" — même principe que
   * `texteAideContrainteNiveau1`/`2` (repli générique si absent, `ui/formatOptimisation.ts`),
   * renseignées seulement quand la règle donnant la grandeur n'est pas une formule géométrique
   * universellement connue (ex. "valeur ∝ carré de la masse" pour `sommeDeuxCarres` sous-skin
   * `pierre`). */
  texteAideGrandeurNiveau1?: string;
  texteAideGrandeurNiveau2?: string;
}

export interface ExerciceOptimisationFonctionDonnee extends ExerciceOptimisationCommun {
  variante: "fonctionDonnee";
  famille: FamilleOptimisationFonctionDonnee;
}

export type ExerciceOptimisation = ExerciceOptimisationModelisation | ExerciceOptimisationFonctionDonnee;

export type GenerateurExerciceOptimisation = () => ExerciceOptimisation;
