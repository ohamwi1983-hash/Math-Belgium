/**
 * Couche core (5e) — contrat pour 5gen24 ("Étude complète", DERNIER générateur du chapitre "Limites
 * et asymptotes", capstone après 5gen20/5gen21/5gen22/5gen23). Synthétise domaine + limites aux
 * bornes + classification complète des asymptotes d'une fraction rationnelle GÉNÉRÉE VIA DIMENSIONS
 * COMBINABLES (même principe que 5gen22, mais ici une vraie fonction algébrique — coefficients
 * entiers exacts — et non une simple lecture graphique qualitative).
 *
 * Construction TOUJOURS "à l'envers" : la configuration voulue (nombre/type d'exclusions,
 * comportement à l'infini, cas spécial) est choisie EN PREMIER, les coefficients de N(x)/D(x) sont
 * ENSUITE dérivés algébriquement — jamais de tirage aléatoire suivi d'un rejet/reclassification.
 * Détail complet de la construction (pourquoi `M(x)/D_vraie(x)` sépare proprement le "point vide"
 * du reste) : `docs/historique-5e-limites.md`.
 *
 * f(x) est TOUJOURS présentée NON simplifiée : N(x) = D_pointVide(x)·M(x), D(x) = D_pointVide(x)·
 * D_vraie(x) — les facteurs "point vide" restent visibles dans les deux polynômes affichés (jamais
 * pré-simplifiés), pour que l'élève les découvre lui-même (0/0) plutôt que de les recevoir tout
 * factorisés.
 *
 * Contrainte de construction (documentée, jamais un cas réel exclu arbitrairement) : une exclusion
 * "pointVide" isolée (1 seule exclusion au total) est exclue — sans second facteur au dénominateur,
 * la fraction se réduirait à une fonction polynomiale constante partout (cas dégénéré, aucune vraie
 * AV ne pourrait jamais subsister). Si 2 exclusions sont tirées, elles ne sont JAMAIS toutes deux
 * "pointVide" (même raison). Un point vide, quand il existe, est TOUJOURS de multiplicité 1 des deux
 * côtés (voir `Exclusion` ci-dessous) — garanti structurellement par construction (`D_pointVide` est
 * toujours UN SEUL facteur linéaire, jamais élevé au carré).
 *
 * Règles d'affichage de D(x) (refonte `prompt5gen24refontecomplete.md`, remplace l'ancienne
 * convention "toujours factorisé" — désormais l'inverse : l'élève doit DÉCOUVRIR la factorisation,
 * jamais la recevoir toute faite, sauf scaffold explicite pour les degrés élevés) :
 * - deg(D) ≤ 2 : complètement DÉVELOPPÉ, aucune racine révélée (l'élève factorise lui-même un
 *   polynôme de degré ≤2, toujours à sa portée).
 * - deg(D) = 3 : affiché comme produit P2·P1 — P1 = LE SEUL facteur linéaire isolé présent (celui de
 *   `D_pointVide` s'il existe, sinon celui de l'exclusion "vaSimple" de la paire "vaSimple"+
 *   "vaDouble", seule combinaison sans point vide atteignant ce degré), sous forme (x−r) racine
 *   explicite ; P2 = le facteur restant (une "vaDouble" seule, degré 2) développé, ses racines non
 *   révélées — scaffold : sans lui, l'élève devrait factoriser un cubique à la main.
 * - deg(D) = 4 : atteint UNIQUEMENT par 2 exclusions "vaDouble"+"vaDouble" (jamais de point vide
 *   possible à ce degré — 2 exclusions déjà occupées) — affiché comme produit P2·P2, les DEUX blocs
 *   développés séparément (jamais combinés en un seul polynôme de degré 4, jamais l'un ou l'autre
 *   pré-factorisé/racine révélée) — scaffold symétrique : factoriser 2 quadratiques indépendantes
 *   plutôt qu'un quartique.
 * N(x) est TOUJOURS complètement développé, quel que soit son degré (jamais de scaffold — l'élève
 * n'a jamais besoin de le factoriser, seul D(x) doit l'être pour trouver le domaine).
 */

export type TypeExclusion = "vaSimple" | "vaDouble" | "pointVide";

/**
 * Une exclusion du domaine (racine du dénominateur AFFICHÉ, D_pointVide·D_vraie).
 * - "vaSimple"/"vaDouble" : racine de `D_vraie` UNIQUEMENT — vraie asymptote verticale, jamais
 *   simplifiable. `signeGauche`/`signeDroit` = signe de la limite (+∞/−∞) de CHAQUE côté ; pour
 *   "vaDouble" `signeGauche===signeDroit` TOUJOURS (une seule limite bilatérale — piège central de
 *   ce sous-cas, jamais deux limites distinctes).
 * - "pointVide" : racine commune à N et D, de multiplicité 1 des deux côtés (jamais une VA cachée
 *   révélée après simplification par des multiplicités différentes — voir contrainte de génération
 *   en en-tête) — forme 0/0, se simplifie entièrement, `valeurPointVide` = l'ordonnée du point
 *   retiré du graphe (limite finie en ce point, jamais ±∞).
 */
export interface Exclusion {
  position: number;
  type: TypeExclusion;
  /** Présent uniquement si `type !== "pointVide"`. */
  signeGauche?: 1 | -1;
  signeDroit?: 1 | -1;
  /** Présent uniquement si `type === "pointVide"`. */
  valeurPointVide?: number;
}

/**
 * Comportement à l'infini — dérivé de `deg(M)` vs `deg(D_vraie)` (jamais de `deg(N)`/`deg(D)`
 * affichés directement, qui incluent les facteurs "point vide" sans intérêt pour cette dimension).
 * "aucune" : la courbe diverge sans jamais s'approcher d'une droite (écart de degré ≥2) — `signe*`
 * = signe de f(x) à chaque borne, `signeCoefDirecteur*` = signe de a=lim f(x)/x à chaque borne
 * (toujours ±∞ lui aussi dans ce sous-cas, jamais une vraie pente finie — c'est justement ce qui
 * distingue "aucune" de "oblique" à l'écran 6, "Coefficient directeur a").
 */
export type ComportementInfiniEtude =
  | { type: "horizontale"; limite: number }
  | { type: "oblique"; pente: number; ordonnee: number }
  | { type: "aucune"; signePlusInfini: 1 | -1; signeMoinsInfini: 1 | -1; signeCoefDirecteurPlus: 1 | -1; signeCoefDirecteurMoins: 1 | -1 };

/**
 * Cas spécial (rare) — la courbe recoupe réellement son asymptote (AH ou AO) en un point. N'existe
 * QUE si `infini.type` est "horizontale" ou "oblique" (jamais "aucune", qui n'a pas d'asymptote à
 * recouper), et exige dans les DEUX cas `deg(D_vraie) ≥ 2` : le "reste" qui porte la racine du
 * recoupement doit rester de degré STRICTEMENT inférieur à `deg(D_vraie)` (pas seulement inférieur
 * au degré du numérateur M) pour que le quotient annoncé (kAH, ou (pente,ordonnee)) reste
 * réellement l'asymptote — sinon ce n'en serait plus une (voir générateur). `x` est TOUJOURS
 * distinct de toute position d'exclusion (sinon le recoupement tomberait sur un point retiré du
 * graphe, invisible).
 */
export interface CasSpecial {
  x: number;
  y: number;
}

export interface ExerciceEtudeCompletePipeline {
  mode: "etude";
  /** N(x) affiché, indice = degré (jamais pré-simplifié — voir en-tête). */
  coeffsN: number[];
  /** D(x) affiché, indice = degré. */
  coeffsD: number[];
  /** M(x) = N(x) / D_pointVide(x) — présent UNIQUEMENT si `exclusions` contient un point vide,
   * cible de vérification de l'écran spécial A "Simplification" (forme simplifiée après annulation
   * du facteur commun). */
  coeffsM?: number[];
  /** D_vraie(x) = D(x) / D_pointVide(x) — présent UNIQUEMENT si `exclusions` contient un point vide,
   * pendant de `coeffsM` pour la même vérification. */
  coeffsDVraie?: number[];
  /** 1 ou 2 éléments, TOUJOURS triés par position croissante. */
  exclusions: Exclusion[];
  infini: ComportementInfiniEtude;
  /** Présent uniquement si un recoupement réel a été construit pour ce tirage. */
  casSpecial?: CasSpecial;
}

/**
 * Variante bonus "construction inverse" (ex.15 du corrigé source) — propriétés données en langage
 * naturel côté UI (`ui5e/formatEtudeComplete.ts`), l'élève CONSTRUIT une fonction rationnelle qui
 * les satisfait. Vérification par PROPRIÉTÉS (jamais égalité stricte à une fonction unique — voir
 * `moteur5e/verificationEtudeComplete.ts`) : plusieurs fonctions différentes peuvent être correctes.
 * INCHANGÉE par la refonte `prompt5gen24refontecomplete.md` (hors scope explicite).
 */
export interface ProprietesConstructionInverse {
  racineDenominateur: number;
  asymptote: { type: "horizontale"; limite: number } | { type: "oblique"; pente: number; ordonnee: number };
}

export interface ExerciceEtudeCompleteBonus {
  mode: "constructionInverse";
  proprietes: ProprietesConstructionInverse;
}

export type ExerciceEtudeComplete = ExerciceEtudeCompletePipeline | ExerciceEtudeCompleteBonus;

export type GenerateurExerciceEtudeComplete = () => ExerciceEtudeComplete;
