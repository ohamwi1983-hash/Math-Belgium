import type {
  ConditionExistence,
  ExerciceCaracteristiquesAlgebriques,
  ExerciceCaracteristiquesAlgebriquesNiveau1,
  ExerciceNiveau2RacineCarree,
  ExerciceNiveau2ValeurAbsolue,
  FactorisationP3,
  ReponseCE,
  ReponseCondition,
  ReponseDomaine,
  ReponseExistence,
  ReponseIsolement,
  ReponseResolutionBranches,
  ReponseSeparation,
  ReponseZerosCaracteristiques,
} from "../core/caracteristiquesAlgebriques.types";
import type { Borne, Crochet, Morceau } from "../core/inequation.types";
import type { FamilleReference } from "../core/fonctionsReference.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import type { StatutVerification } from "./statutVerification";
import { racinesDistinctes } from "./verificationEquationRationnelle";
import { diagnostiquerIsolement } from "./verification";

const TOLERANCE = 0.005;
const TOLERANCE_ALGEBRE = 1e-4;
const EPSILON = 1e-9;

/**
 * Couche B — implémentation de "Caractéristiques algébriques d'une fonction de référence" (niveau
 * 1, `spec-caracteristiquesalgebriquesniveau1.md`). Structure : `f(x) = [base](P1) + k`,
 * `P1 = ax+b`. Contrairement à l'ancienne version (parité, `TH/TV/CH/EH/EV/CV/SOX/SOY`), il n'y a
 * ici qu'un seul argument linéaire — pas de facteur externe (`SOX·(EV/CV)`) à combiner : résoudre
 * `f(x)=0` revient directement à `[base](P1) = -k`, sans division supplémentaire.
 */

/** `[base](u)` par famille — NaN hors domaine (racine_carree si u<0, inverse si u=0), jamais une
 * exception (même contrat que `appliquerG`, `verificationFonctionsReference.ts`, dixième exercice
 * — dupliquée ici plutôt qu'importée : ce module n'a besoin que d'un seul argument linéaire, pas
 * de la formule complète à 8 paramètres). */
function appliquerBase(famille: FamilleReference, u: number): number {
  switch (famille) {
    case "carre":
      return u * u;
    case "cube":
      return u * u * u;
    case "racine_carree":
      return u < 0 ? NaN : Math.sqrt(u);
    case "racine_cubique":
      return Math.sign(u) * Math.pow(Math.abs(u), 1 / 3);
    case "inverse":
      return Math.abs(u) < EPSILON ? NaN : 1 / u;
    case "valeur_absolue":
      return Math.abs(u);
  }
}

function kValeur(exercice: ExerciceCaracteristiquesAlgebriquesNiveau1): number {
  return exercice.k.num / exercice.k.den;
}

/** `k` évalué EN `x` — constant au niveau 1 (indépendant de `x`), linéaire (`cx+d`) au niveau 2.
 * Généralisation strictement rétro-compatible : au niveau 1, `k(x)` vaut `kValeur(exercice)` quel
 * que soit `x`, donc `evaluerNiveau1` ci-dessous garde un comportement identique à avant l'ajout du
 * niveau 2. */
function kEnX(exercice: ExerciceCaracteristiquesAlgebriques, x: number): number {
  return exercice.niveau === "niveau1" ? kValeur(exercice) : exercice.c * x + exercice.d;
}

/** Seule source de vérité pour f(x), consommée par toutes les vérifications ci-dessous. */
export function evaluerNiveau1(exercice: ExerciceCaracteristiquesAlgebriques, x: number): number {
  const u = exercice.a * x + exercice.b;
  const base = appliquerBase(exercice.famille, u);
  if (!Number.isFinite(base)) return NaN;
  return base + kEnX(exercice, x);
}

export function appartientAuDomaineNiveau1(exercice: ExerciceCaracteristiquesAlgebriques, x: number): boolean {
  const u = exercice.a * x + exercice.b;
  if (exercice.famille === "inverse") return Math.abs(u) > EPSILON;
  if (exercice.famille === "racine_carree") return u >= -EPSILON;
  return true;
}

export function existeOrdonneeNiveau1(exercice: ExerciceCaracteristiquesAlgebriques): boolean {
  return appartientAuDomaineNiveau1(exercice, 0);
}

export function verifierOrdonneeNiveau1(exercice: ExerciceCaracteristiquesAlgebriques, saisie: ReponseExistence): boolean {
  const existe = existeOrdonneeNiveau1(exercice);
  if (!existe) return saisie.existe === false;
  if (!saisie.existe || saisie.valeur === null) return false;
  return Math.abs(saisie.valeur - evaluerNiveau1(exercice, 0)) < TOLERANCE;
}

/**
 * Conditions d'existence — dérivées directement de `ax+b` (pas de "pente" séparée à considérer,
 * contrairement à l'ancienne version : ici l'argument EST `x` directement, jamais mis à l'échelle) :
 * - `valeur_absolue`/`carre`/`cube`/`racine_cubique` : aucune CE (domaine illimité).
 * - `inverse` : `x ≠ p` où `p = -b/a` (le pôle).
 * - `racine_carree` : `x ≥ p` si `a>0`, `x ≤ p` si `a<0` (division de `ax+b≥0` par `a`, symbole
 *   inversé si `a` est négatif).
 */
export function ceAttendues(exercice: ExerciceCaracteristiquesAlgebriques): ConditionExistence[] {
  const { famille, a, b } = exercice;
  const p = -b / a;
  if (famille === "inverse") return [{ symbole: "≠", valeur: p }];
  if (famille === "racine_carree") return [{ symbole: a > 0 ? "≥" : "≤", valeur: p }];
  return [];
}

function memesConditions(saisie: ReponseCE, attendu: ConditionExistence[]): boolean {
  if (saisie.length !== attendu.length) return false;
  const restants = [...attendu];
  for (const c of saisie) {
    const index = restants.findIndex((a) => a.symbole === c.symbole && Math.abs(a.valeur - c.valeur) < TOLERANCE);
    if (index === -1) return false;
    restants.splice(index, 1);
  }
  return true;
}

export function verifierCENiveau1(exercice: ExerciceCaracteristiquesAlgebriques, saisie: ReponseCE): boolean {
  return memesConditions(saisie, ceAttendues(exercice));
}

/**
 * Domaine — dérivé directement des CE ci-dessus (section 4, point 3 de la spec : "déduite des CE
 * de l'étape précédente") : `reel` (aucune CE), `prive_points` (`inverse`, un point exclu),
 * `intervalles` (`racine_carree`, une demi-droite fermée). `vide` n'est jamais la bonne réponse
 * pour ce générateur (chaque famille garde toujours un domaine non vide) — conservée comme forme
 * sélectionnable dans l'interface pour rester un mécanisme de construction complet, jamais
 * atteinte par la génération.
 */
export function domaineAttendu(exercice: ExerciceCaracteristiquesAlgebriques): ReponseDomaine {
  const { famille, a, b } = exercice;
  const p = -b / a;

  if (famille === "inverse") {
    return { forme: "prive_points", points: [p], intervalles: [] };
  }

  if (famille === "racine_carree") {
    const intervalle: Morceau =
      a > 0
        ? { crochetGauche: "[" as Crochet, borneGauche: p, crochetDroit: "[" as Crochet, borneDroite: "+inf" as Borne }
        : { crochetGauche: "]" as Crochet, borneGauche: "-inf" as Borne, crochetDroit: "]" as Crochet, borneDroite: p };
    return { forme: "intervalles", points: [], intervalles: [intervalle] };
  }

  return { forme: "reel", points: [], intervalles: [] };
}

function borneEgale(a: Borne, b: Borne): boolean {
  if (a === "-inf" || a === "+inf" || b === "-inf" || b === "+inf") return a === b;
  return Math.abs(a - b) < TOLERANCE;
}

function morceauEgal(a: Morceau, b: Morceau): boolean {
  return a.crochetGauche === b.crochetGauche && a.crochetDroit === b.crochetDroit && borneEgale(a.borneGauche, b.borneGauche) && borneEgale(a.borneDroite, b.borneDroite);
}

/** Comparaison en multi-ensemble, TOLÉRANTE sur les bornes finies (contrairement à
 * `memesMorceaux` des exercices précédents, qui comparait des entiers exacts) — les frontières de
 * ce générateur (`-b/a`) sont des rationnels quelconques, potentiellement non décimaux propres
 * (ex. `-1/3`), jamais garantis entiers par construction ici. */
function memesPoints(saisie: number[], attendu: number[]): boolean {
  if (saisie.length !== attendu.length) return false;
  const restants = [...attendu];
  for (const v of saisie) {
    const index = restants.findIndex((a) => Math.abs(a - v) < TOLERANCE);
    if (index === -1) return false;
    restants.splice(index, 1);
  }
  return true;
}

function memesIntervalles(saisie: Morceau[], attendu: Morceau[]): boolean {
  if (saisie.length !== attendu.length) return false;
  const restants = [...attendu];
  for (const m of saisie) {
    const index = restants.findIndex((a) => morceauEgal(a, m));
    if (index === -1) return false;
    restants.splice(index, 1);
  }
  return true;
}

export function verifierDomaineNiveau1(exercice: ExerciceCaracteristiquesAlgebriques, saisie: ReponseDomaine): boolean {
  const attendu = domaineAttendu(exercice);
  if (saisie.forme !== attendu.forme) return false;
  if (attendu.forme === "prive_points") return memesPoints(saisie.points, attendu.points);
  if (attendu.forme === "intervalles") return memesIntervalles(saisie.intervalles, attendu.intervalles);
  return true;
}

/** Points d'échantillonnage relatifs au pivot `p=-b/a` (même principe que
 * `verificationFonctionsReference.ts`, dixième exercice) — le pivot peut s'éloigner de l'origine,
 * des décalages ancrés dessus restent pertinents quelle que soit la position de `p`. */
const DECALAGES_ECHANTILLON = [0.4, 0.7, 1.1, 1.6, 2.3, 3.1, 4.2, 5.6, 7.4, 9.8];
const POINTS_MINIMUM = 6;

function pivot(exercice: ExerciceCaracteristiquesAlgebriques): number {
  return -exercice.b / exercice.a;
}

/** Vérifie qu'une expression texte est algébriquement équivalente, par échantillonnage numérique,
 * à `cible(x)` — même principe que `verifierEquationFonctionReference` (dixième exercice). Statut
 * à 3 valeurs (convention CLAUDE.md). */
function diagnostiquerExpressionEgaleFonction(expression: string, p: number, cible: (x: number) => number): StatutVerification {
  const decalages = [...DECALAGES_ECHANTILLON, ...DECALAGES_ECHANTILLON.map((d) => -d)];
  let comparaisons = 0;
  for (const d of decalages) {
    const x = p + d;
    const attendu = cible(x);
    if (!Number.isFinite(attendu)) continue;
    let val: number;
    try {
      val = evaluerExpressionGenerale(expression, x);
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(val)) return "not_equivalent";
    if (Math.abs(val - attendu) > TOLERANCE_ALGEBRE) return "not_equivalent";
    comparaisons++;
  }
  return comparaisons >= POINTS_MINIMUM ? "correct" : "not_equivalent";
}

/** Une expression est "constante" si elle vaut la même chose à 2 abscisses différentes — vérifie
 * en plus que cette valeur constante égale la cible attendue. Statut à 3 valeurs. */
function diagnostiquerExpressionEgaleConstante(expression: string, cible: number): StatutVerification {
  let v0: number;
  let v1: number;
  try {
    v0 = evaluerExpressionGenerale(expression, 0);
    v1 = evaluerExpressionGenerale(expression, 1);
  } catch {
    return "parse_error";
  }
  if (!Number.isFinite(v0) || !Number.isFinite(v1)) return "not_equivalent";
  if (Math.abs(v0 - v1) > TOLERANCE_ALGEBRE) return "not_equivalent";
  return Math.abs(v0 - cible) < TOLERANCE_ALGEBRE ? "correct" : "not_equivalent";
}

/** Points d'échantillonnage pour la vérification par échantillonnage numérique des équations
 * développées niveau 2 (`verifierEquationEgaleZero`/`verifierDeveloppementEgaleZero`/
 * `verifierRegroupe`, familles `carre`/`cube` à l'étape "isolement" et `racine_cubique` à l'étape
 * "regroupe") — décalages non ronds fixes (pas ancrés sur un pivot, contrairement à
 * `DECALAGES_ECHANTILLON` : ces familles n'ont pas de domaine restreint, aucun besoin de rester
 * proche d'un point particulier). */
const POINTS_DEVELOPPEMENT = [0.3, 0.7, 1.3, 1.9, 2.6, -0.4, -1.1, -1.8];

/**
 * Vérifie qu'un texte représente `k·cible(x) = 0` pour un `k` non nul QUELCONQUE (n'importe quel
 * multiple non nul de l'équation développée est accepté, jamais l'égalité stricte des coefficients
 * — même tolérance que `coefficientsProportionnels`, exercice "méthode la plus rapide") — exige
 * explicitement `... = 0` : le membre droit doit s'échantillonner à 0 partout, jamais une
 * expression qui dépend réellement de `x`. Primitive partagée par `verifierDeveloppementEgaleZero`
 * (`cube`, cible = `evaluerNiveau1`) et `verifierRegroupe` (`racine_cubique`, cible = le polynôme
 * obtenu en élevant le membre `k(x)` au cube — voir sa section dédiée, jamais `evaluerNiveau1`
 * directement pour cette famille).
 */
function diagnostiquerEquationEgaleZero(texte: string, cible: (x: number) => number): StatutVerification {
  const parties = texte.split("=");
  // Structure "... = 0" manquante : manquement à la consigne, pas une syntaxe illisible (même
  // principe que diagnostiquerFormeCanonique, exercice 1).
  if (parties.length !== 2) return "not_equivalent";
  const [gauche, droite] = parties;

  let ratio: number | null = null;
  let comparaisons = 0;
  for (const x of POINTS_DEVELOPPEMENT) {
    const c = cible(x);
    if (!Number.isFinite(c) || Math.abs(c) < TOLERANCE_ALGEBRE) continue;
    let g: number;
    let d: number;
    try {
      g = evaluerExpressionGenerale(gauche, x);
      d = evaluerExpressionGenerale(droite, x);
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(g) || !Number.isFinite(d)) return "not_equivalent";
    if (Math.abs(d) > TOLERANCE_ALGEBRE) return "not_equivalent";
    const r = g / c;
    if (ratio === null) ratio = r;
    else if (Math.abs(r - ratio) > TOLERANCE_ALGEBRE) return "not_equivalent";
    comparaisons++;
  }
  const correct = comparaisons >= POINTS_MINIMUM && ratio !== null && Math.abs(ratio) > TOLERANCE_ALGEBRE;
  return correct ? "correct" : "not_equivalent";
}

/**
 * Vérifie qu'un texte représente `k·f(x) = 0` — utilisée pour la famille `cube` (niveau 2), qui n'a
 * pas d'équation `Exercice` embarquée (degré 3, hors du contrat de l'exercice "méthode la plus
 * rapide") : vérification par échantillonnage numérique contre `evaluerNiveau1` (la seule source de
 * vérité pour `f(x)`) plutôt que par comparaison de coefficients extraits — valide ici car
 * `f(x)=(ax+b)³+(cx+d)` EST déjà, telle quelle, le polynôme développé recherché (élever le côté
 * base au cube ne fait qu'exposer sa propre expression). **Jamais réutilisée telle quelle pour
 * `racine_cubique`** (voir `verifierRegroupe`) : `f(x)=∛(ax+b)+(cx+d)` contient encore une racine
 * cubique, elle n'est PAS proportionnelle au polynôme obtenu après élévation au cube du membre
 * `k(x)` — ce sont deux fonctions différentes qui ne partagent que leurs zéros, jamais leurs valeurs.
 */
export function diagnostiquerDeveloppementEgaleZero(exercice: ExerciceCaracteristiquesAlgebriques, texte: string): StatutVerification {
  return diagnostiquerEquationEgaleZero(texte, (x) => evaluerNiveau1(exercice, x));
}

export function verifierDeveloppementEgaleZero(exercice: ExerciceCaracteristiquesAlgebriques, texte: string): boolean {
  return diagnostiquerDeveloppementEgaleZero(exercice, texte) === "correct";
}

/**
 * Étape "isolement" (section 4, point 4 de la spec) — dispatch en 3 voies
 * (`prompt-corrections-niveau2-tests.md`) :
 * - niveau 2 `carre` : réutilise **telle quelle** `verifierIsolement` (exercice "méthode la plus
 *   rapide") contre l'équation du 2nd degré déjà embarquée (`exercice.zeros`) — cette étape ne
 *   demande plus d'isoler `[base](P1)=-k(x)` mais de DÉVELOPPER et regrouper, exactement ce que
 *   `verifierIsolement`/`verifierFormeCanonique` vérifient déjà (exige `...=0`, tolère tout multiple
 *   non nul).
 * - niveau 2 `cube` : `verifierDeveloppementEgaleZero` ci-dessus (aucune équation `Exercice`
 *   embarquée pour cette famille, degré 3).
 * - tous les autres cas (niveau 1, niveau 2 `inverse`/`racine_carree`/`valeur_absolue`/
 *   `racine_cubique`) : comportement historique inchangé — l'équation de départ `[base](P1)+k=0`
 *   réécrite `[base](P1) = -k` (niveau 1, membre droit CONSTANT) ou `[base](P1) = -k(x)` (niveau 2,
 *   membre droit LINÉAIRE).
 */
export function diagnostiquerIsolementNiveau1(
  exercice: ExerciceCaracteristiquesAlgebriques,
  saisie: ReponseIsolement | string,
): StatutVerification {
  const texte = typeof saisie === "string" ? saisie : saisie.texte;

  if (exercice.niveau === "niveau2" && exercice.famille === "carre") {
    return diagnostiquerIsolement(exercice.zeros, texte);
  }
  if (exercice.niveau === "niveau2" && exercice.famille === "cube") {
    return diagnostiquerDeveloppementEgaleZero(exercice, texte);
  }

  const parties = texte.split("=");
  // Structure "... = ..." manquante : manquement à la consigne, pas une syntaxe illisible.
  if (parties.length !== 2) return "not_equivalent";
  const [gauche, droite] = parties;

  const p = pivot(exercice);
  const cibleGauche = (x: number) => appliquerBase(exercice.famille, exercice.a * x + exercice.b);
  const statutGauche = diagnostiquerExpressionEgaleFonction(gauche, p, cibleGauche);
  if (statutGauche !== "correct") return statutGauche;

  if (exercice.niveau === "niveau1") {
    return diagnostiquerExpressionEgaleConstante(droite, -kValeur(exercice));
  }
  return diagnostiquerExpressionEgaleFonction(droite, p, (x) => -(exercice.c * x + exercice.d));
}

export function verifierIsolementNiveau1(exercice: ExerciceCaracteristiquesAlgebriques, saisie: ReponseIsolement | string): boolean {
  return diagnostiquerIsolementNiveau1(exercice, saisie) === "correct";
}

/**
 * Vérifie qu'un texte représente une équation LINÉAIRE dont la racine unique égale
 * `racineAttendue` — tolère n'importe quelle formulation algébriquement équivalente (multiplier
 * les deux membres par -1, développer, etc., ce qui ne change jamais la racine d'une équation,
 * contrairement à une inéquation) : évalue `gauche(x) - droite(x)` en 3 points, vérifie que c'est
 * bien affine (colinéaire) et non dégénéré (pente non nulle), puis en déduit la racine trouvée.
 */
function diagnostiquerEquationLineaire(texte: string, racineAttendue: number): StatutVerification {
  const parties = texte.split("=");
  if (parties.length !== 2) return "not_equivalent";
  const [gauche, droite] = parties;

  try {
    evaluerExpressionGenerale(gauche, 0);
    evaluerExpressionGenerale(droite, 0);
  } catch {
    return "parse_error";
  }

  function valeur(x: number): number | null {
    const g = evaluerExpressionGenerale(gauche, x);
    const d = evaluerExpressionGenerale(droite, x);
    if (!Number.isFinite(g) || !Number.isFinite(d)) return null;
    return g - d;
  }

  const v0 = valeur(0);
  const v1 = valeur(1);
  const v2 = valeur(2.5);
  if (v0 === null || v1 === null || v2 === null) return "not_equivalent";

  const pente = v1 - v0;
  if (Math.abs(pente) < 1e-6) return "not_equivalent";

  const ordonnee = v0;
  const attenduEnDeuxCinq = pente * 2.5 + ordonnee;
  if (Math.abs(v2 - attenduEnDeuxCinq) > TOLERANCE_ALGEBRE) return "not_equivalent";

  const racine = -ordonnee / pente;
  return Math.abs(racine - racineAttendue) < TOLERANCE_ALGEBRE ? "correct" : "not_equivalent";
}

/**
 * Étape "séparation" (section 4, point 5 de la spec) — `valeur_absolue`/`carre` uniquement, niveau
 * 1 seul (le niveau 2 a son propre mécanisme de branches, voir `ExerciceNiveau2ValeurAbsolue` et
 * `verifierResolutionBranches` ci-dessous — `k` n'y est plus une constante, les formules de racine
 * ci-dessous ne s'appliqueraient plus).
 * `valeur_absolue` : `P1 = -k` (racine `x=(-k-b)/a`) et `-P1 = -k` (racine `x=(k-b)/a`).
 * `carre` : `P1 = √(-k)` et `P1 = -√(-k)` (`√(-k)` toujours rationnel exact par construction).
 */
/** Statut à 3 valeurs pour les deux équations soumises ensemble (tout ou rien) : "parse_error" si
 * l'une des deux ne peut pas être lue (prioritaire, quel que soit l'ordre), sinon "not_equivalent"
 * si l'une des deux est fausse, sinon "correct". */
export function diagnostiquerSeparationNiveau1(
  exercice: ExerciceCaracteristiquesAlgebriquesNiveau1,
  saisie: ReponseSeparation,
): StatutVerification {
  const { famille, a, b } = exercice;
  const k = kValeur(exercice);
  let racine1: number;
  let racine2: number;

  if (famille === "valeur_absolue") {
    racine1 = (-k - b) / a;
    racine2 = (k - b) / a;
  } else {
    const racineMoinsK = Math.sqrt(-k);
    racine1 = (racineMoinsK - b) / a;
    racine2 = (-racineMoinsK - b) / a;
  }

  const statut1 = diagnostiquerEquationLineaire(saisie.equation1, racine1);
  const statut2 = diagnostiquerEquationLineaire(saisie.equation2, racine2);
  if (statut1 === "parse_error" || statut2 === "parse_error") return "parse_error";
  return statut1 === "correct" && statut2 === "correct" ? "correct" : "not_equivalent";
}

export function verifierSeparationNiveau1(exercice: ExerciceCaracteristiquesAlgebriquesNiveau1, saisie: ReponseSeparation): boolean {
  return diagnostiquerSeparationNiveau1(exercice, saisie) === "correct";
}

/**
 * Zéros — résolution algébrique directe de `[base](u)=K` où `K=-k` (pas de facteur externe à
 * diviser, contrairement à l'ancienne version) :
 * - `carre`/`valeur_absolue` (`u²=K`/`|u|=K`) : 0 zéro si `K<0`, 2 si `K>0` (jamais `K=0` — `k≠0`
 *   toujours, donc jamais de racine double ici).
 * - `cube`/`racine_cubique` : toujours exactement 1 zéro (bijections sur ℝ).
 * - `racine_carree` (`√u=K`, domaine `u≥0`) : 0 zéro si `K<0`, 1 sinon (`u=K²`, toujours ≥0).
 * - `inverse` (`1/u=K`) : toujours exactement 1 zéro (`K≠0` toujours, `u=1/K`).
 * Chaque `u` est reconverti en `x=(u-b)/a`.
 */
function zerosU(famille: FamilleReference, K: number): number[] {
  switch (famille) {
    case "carre":
      return K < 0 ? [] : [-Math.sqrt(K), Math.sqrt(K)];
    case "valeur_absolue":
      return K < 0 ? [] : Math.abs(K) < EPSILON ? [0] : [-K, K];
    case "cube":
      return [Math.sign(K) * Math.pow(Math.abs(K), 1 / 3)];
    case "racine_carree":
      return K < 0 ? [] : [K * K];
    case "racine_cubique":
      return [K * K * K];
    case "inverse":
      return Math.abs(K) < EPSILON ? [] : [1 / K];
  }
}

export function zerosNiveau1(exercice: ExerciceCaracteristiquesAlgebriquesNiveau1): number[] {
  const K = -kValeur(exercice);
  return zerosU(exercice.famille, K)
    .map((u) => (u - exercice.b) / exercice.a)
    .sort((a, b) => a - b);
}

function memesValeurs(saisie: number[], attendu: number[]): boolean {
  if (saisie.length !== attendu.length) return false;
  const restants = [...attendu];
  for (const v of saisie) {
    const index = restants.findIndex((a) => Math.abs(a - v) < TOLERANCE);
    if (index === -1) return false;
    restants.splice(index, 1);
  }
  return true;
}

/**
 * Zéros ATTENDUS à l'étape finale "zéros" — dispatch niveau/famille. Depuis
 * `prompt-corrections-niveau2-vague2.md` (suppression complète de l'écran "Zéros — méthode"), les
 * 6 familles niveau 2 atteignent désormais toutes l'écran "zéros" — plus aucune famille ne se clôt
 * ailleurs. Toujours la liste DISTINCTE (une racine double ou triple n'y apparaît qu'une seule
 * fois) — voir `multipliciteZeros` ci-dessous pour le nombre de répétitions valides à chaque
 * valeur, consommé par `verifierZerosNiveau1`.
 * - niveau 1 : `zerosNiveau1` (inchangé — jamais de racine répétée à ce niveau, `k≠0` garanti).
 * - niveau 2 `carre`/`inverse` : les racines DISTINCTES de l'équation du 2nd degré déjà embarquée
 *   (`zeros`, confirmée à l'étape "isolement" pour `carre`, à l'étape "regroupe" pour `inverse`) —
 *   `racinesDistinctes` dédoublonne une racine double (`prompt-corrections-niveau2-tests.md`,
 *   point 3).
 * - niveau 2 `racine_carree` : les racines de l'équation du 2nd degré embarquée (`zeros`), déjà
 *   confirmées à l'étape "regroupe", FILTRÉES par la condition de validité — jamais les racines
 *   brutes (le carré peut introduire des solutions étrangères).
 * - niveau 2 `valeur_absolue` : les deux racines de branche (`racineBranche1`/`racineBranche2`),
 *   filtrées de la même façon.
 * - niveau 2 `racine_cubique`/`cube` : `racinesP3(exercice.factorisationP3)`, déjà dédoublonnée
 *   (racine triple ou double+simple possibles, voir `racinesAvecMultipliciteP3`) — aucune condition
 *   de validité pour ces deux familles (élévation au cube = bijection).
 */
export function zerosAttendus(exercice: ExerciceCaracteristiquesAlgebriques): number[] {
  if (exercice.niveau === "niveau1") return zerosNiveau1(exercice);
  if (exercice.famille === "carre" || exercice.famille === "inverse") return racinesDistinctes(exercice.zeros.solution.racines);
  if (exercice.famille === "racine_carree") return racinesValidesNiveau2(exercice);
  if (exercice.famille === "valeur_absolue") return racinesValidesValeurAbsolue(exercice);
  if (exercice.famille === "racine_cubique" || exercice.famille === "cube") return racinesP3(exercice.factorisationP3);
  throw new Error(`zerosAttendus : famille ${exercice.famille} inattendue au niveau 2`);
}

/**
 * Multiplicité de chaque zéro DISTINCT renvoyé par `zerosAttendus` (même ordre, même longueur) —
 * seuls `carre` (racine double possible) et `racine_cubique`/`cube` (racine triple, ou double +
 * simple distincte, possibles — `prompt-corrections-niveau2-tests.md`, point 4) peuvent renvoyer une
 * multiplicité `>1` ; toutes les autres familles/niveaux renvoient toujours `1` pour chaque zéro
 * (jamais de racine répétée par construction ailleurs). Consommée uniquement par
 * `verifierZerosNiveau1` — jamais utilisée pour la révélation (`formatZerosAttendusLatex` continue
 * d'afficher chaque valeur DISTINCTE une seule fois, la multiplicité n'a pas besoin d'être montrée à
 * l'élève, seulement acceptée en saisie).
 */
function multipliciteZeros(exercice: ExerciceCaracteristiquesAlgebriques): number[] {
  if (exercice.niveau === "niveau1") return zerosNiveau1(exercice).map(() => 1);
  if (exercice.famille === "carre" || exercice.famille === "inverse") {
    const [r1, r2] = exercice.zeros.solution.racines;
    return Math.abs(r1 - r2) < TOLERANCE ? [2] : [1, 1];
  }
  if (exercice.famille === "racine_carree") return racinesValidesNiveau2(exercice).map(() => 1);
  if (exercice.famille === "valeur_absolue") return racinesValidesValeurAbsolue(exercice).map(() => 1);
  if (exercice.famille === "racine_cubique" || exercice.famille === "cube") {
    return racinesAvecMultipliciteP3(exercice.factorisationP3).map((g) => g.multiplicite);
  }
  throw new Error(`multipliciteZeros : famille ${exercice.famille} inattendue au niveau 2`);
}

/**
 * Vérifie les zéros saisis, tolérant DEUX conventions de comptage équivalentes lorsqu'une
 * multiplicité `>1` existe (`prompt-corrections-niveau2-tests.md`, point 4) : "sans répétition"
 * (chaque racine distincte une seule fois — ex. "1 zéro" pour une racine double) ou "avec
 * répétition" (chaque racine répétée selon sa multiplicité — ex. "2 zéros", la même valeur deux
 * fois) — jamais un compte intermédiaire partiel. Les deux conventions coïncident déjà pour le cas
 * courant (toutes les multiplicités valent 1), donc ce comportement reste strictement inchangé pour
 * le niveau 1 et pour les familles niveau 2 qui n'ont jamais de racine répétée.
 */
export function verifierZerosNiveau1(exercice: ExerciceCaracteristiquesAlgebriques, saisie: ReponseZerosCaracteristiques): boolean {
  const sansRepetition = zerosAttendus(exercice);
  if (sansRepetition.length === 0) return saisie.aucun === true;
  if (saisie.aucun) return false;

  const multiplicites = multipliciteZeros(exercice);
  const avecRepetition = sansRepetition.flatMap((v, i) => Array(multiplicites[i]).fill(v) as number[]);

  return memesValeurs(saisie.valeurs, sansRepetition) || memesValeurs(saisie.valeurs, avecRepetition);
}

/**
 * Étape "zéros" (CANDIDATS), `racine_carree` niveau 2 UNIQUEMENT — `prompt-corrections-niveau2-
 * vague3.md`, point 2 : l'ordre des écrans était incohérent (l'élève validait Oui/Non une solution
 * avant même d'avoir déterminé les valeurs candidates lui-même). Corrigé en faisant précéder
 * "validation" par "zéros" — mais l'écran "zéros", à cette position, ne peut plus demander les
 * zéros FINAUX (filtrés par la condition de validité, `zerosAttendus`/`racinesValidesNiveau2` —
 * cette filtration est précisément ce que "validation" détermine, qui n'a pas encore eu lieu) : il
 * demande les racines CANDIDATES du polynôme du 2nd degré obtenu à l'étape "regroupe", c'est-à-dire
 * exactement `racinesAValiderRacineCarree(exercice)` — jamais encore filtrées. Comparaison en
 * multi-ensemble simple (`memesValeurs`), aucune notion de multiplicité supplémentaire nécessaire
 * ici (`racinesAValiderRacineCarree` dédoublonne déjà une racine double).
 */
export function verifierZerosCandidatsRacineCarree(exercice: ExerciceNiveau2RacineCarree, saisie: ReponseZerosCaracteristiques): boolean {
  const candidats = racinesAValiderRacineCarree(exercice);
  if (candidats.length === 0) return saisie.aucun === true;
  if (saisie.aucun) return false;
  return memesValeurs(saisie.valeurs, candidats);
}

/** `true` uniquement pour les familles nécessitant l'étape "séparation" (section 4, point 5) —
 * niveau 1 seul (voir `necessiteRegroupe`/`necessiteValidite` pour les branchements propres au
 * niveau 2). */
export function necessiteSeparation(exercice: ExerciceCaracteristiquesAlgebriquesNiveau1): boolean {
  return exercice.famille === "valeur_absolue" || exercice.famille === "carre";
}

/** `true` pour les 4 familles nécessitant l'étape "se débarrasser de..." (`inverse`/
 * `racine_carree`/`racine_cubique`/`cube`) — miroir exact de `necessiteSeparation` : chaque
 * famille traverse EXACTEMENT l'une des deux étapes intermédiaires après `isolement`, jamais
 * aucune ni les deux (`prompt-3-ameliorations-finales.md`, point 2). Niveau 1 seul. */
export function necessiteDebarrasser(exercice: ExerciceCaracteristiquesAlgebriquesNiveau1): boolean {
  return !necessiteSeparation(exercice);
}

/**
 * Étape "se débarrasser de..." (`prompt-3-ameliorations-finales.md`, point 2) — `inverse`/
 * `racine_carree`/`racine_cubique`/`cube` uniquement, niveau 1 seul. Chacune de ces 4 familles a
 * toujours EXACTEMENT 1 zéro (garanti par construction, voir `zerosNiveau1`) : l'équation obtenue
 * en "se débarrassant" de la fonction de référence (multiplier par le dénominateur pour `inverse`,
 * élever au carré/cube pour `racine_carree`/`racine_cubique`, extraire la racine cubique pour
 * `cube`) est TOUJOURS une équation linéaire dont l'unique racine égale exactement ce zéro déjà
 * calculé — vérifiée via `verifierEquationLineaire`, même principe flexible que `verifierSeparationNiveau1`.
 */
export function diagnostiquerDebarrasserNiveau1(
  exercice: ExerciceCaracteristiquesAlgebriquesNiveau1,
  saisie: string,
): StatutVerification {
  const [racine] = zerosNiveau1(exercice);
  return diagnostiquerEquationLineaire(saisie, racine);
}

export function verifierDebarrasserNiveau1(exercice: ExerciceCaracteristiquesAlgebriquesNiveau1, saisie: string): boolean {
  return diagnostiquerDebarrasserNiveau1(exercice, saisie) === "correct";
}

/* ==========================================================================================
 * NIVEAU 2 — condition de validité, validation par solution, résolution des branches, zéros de P3
 * (`prompt-niveau2caracteristiquesalgebriques.md`)
 * ========================================================================================== */

/** `true` uniquement pour les 2 familles niveau 2 nécessitant une "condition de validité de
 * l'équation" avant de résoudre (`racine_carree`/`valeur_absolue` — voir leurs types dédiés). */
export function necessiteValidite(exercice: ExerciceCaracteristiquesAlgebriques): exercice is ExerciceNiveau2RacineCarree | ExerciceNiveau2ValeurAbsolue {
  return exercice.niveau === "niveau2" && (exercice.famille === "racine_carree" || exercice.famille === "valeur_absolue");
}

/**
 * `true` uniquement pour les 3 familles niveau 2 nécessitant une étape "regroupe" — un champ libre
 * où l'élève écrit l'équation obtenue après avoir éliminé la fonction de référence (multiplier par
 * le dénominateur pour `inverse`, élever au carré pour `racine_carree`, élever au cube pour
 * `racine_cubique`) — `prompt-corrections-niveau2-vague2.md`, point 2 : cette étape existait déjà
 * pour `carre`/`cube` (directement à l'étape "isolement", qui EST l'étape "regroupe" pour ces deux
 * familles — leur `[base]` n'a rien à isoler séparément puisque développer ET isoler ne font qu'un
 * geste) et pour `racine_carree` (l'ancienne étape "élève au carré", renommée ici) ; manquait
 * entièrement pour `inverse` et `racine_cubique`, qui passaient jusqu'ici directement par l'écran
 * "Zéros — méthode" (retiré, voir `PhaseCaracteristiquesAlgebriques`) ou directement par "zéros"
 * sans jamais faire produire l'équation intermédiaire à l'élève. Jamais `valeur_absolue`, dont le
 * regroupement se fait implicitement à l'étape "résolution des branches" (les deux racines
 * demandées directement, pas une équation intermédiaire) — ni `carre`/`cube`, dont l'étape
 * "isolement" joue déjà ce rôle.
 */
export function necessiteRegroupe(exercice: ExerciceCaracteristiquesAlgebriques): boolean {
  return exercice.niveau === "niveau2" && (exercice.famille === "inverse" || exercice.famille === "racine_carree" || exercice.famille === "racine_cubique");
}

/**
 * Étape "regroupe" — vérifie l'équation regroupée que l'élève doit produire lui-même, dispatch par
 * famille :
 * - `inverse`/`racine_carree` : réutilisent **telle quelle** `verifierIsolement` (exercice "méthode
 *   la plus rapide") contre l'équation du 2nd degré déjà embarquée (`exercice.zeros.enonce`) — même
 *   mécanisme que `carre` à l'étape "isolement" (voir `verifierIsolementNiveau1`), la génération
 *   ayant déjà calculé cette équation par produit en croix (`inverse`) ou élévation au carré
 *   (`racine_carree`).
 * - `racine_cubique` : élever au cube LES DEUX MEMBRES de `∛(ax+b) = -(cx+d)` donne
 *   `ax+b = -(cx+d)³`, jamais proportionnel à `f(x) = ∛(ax+b)+(cx+d)` lui-même (qui contient encore
 *   une racine cubique) — vérifié contre la fonction cible `ax+b+(cx+d)³` calculée directement ici,
 *   PAS via `verifierDeveloppementEgaleZero`/`evaluerNiveau1` (réservée à `cube`, où élever le côté
 *   BASE au cube redonne exactement `f(x)` lui-même, voir sa section dédiée).
 *
 *   VIGILANCE (aucun changement de logique ici — documentation uniquement) : cet appel à
 *   `diagnostiquerEquationEgaleZero` n'a AUCUNE garde structurelle, seulement une équivalence
 *   numérique (à un multiple `k` près) à `ax+b+(cx+d)³`. Sa sûreté actuelle dépend entièrement du
 *   fait que cette cible reste mathématiquement DISTINCTE de tout ce qui a déjà été montré à
 *   l'élève à cette étape (l'équation `∛(ax+b)=-(cx+d)` elle-même, qui contient encore une racine
 *   cubique) — si un futur changement de cette famille en venait à afficher une forme déjà
 *   algébriquement égale à `ax+b+(cx+d)³`, une recopie serait acceptée à tort ici, exactement le
 *   défaut trouvé sur "Centre et rayon d'un cercle depuis l'équation développée"/"Sommet, foyer, p
 *   et directrice d'une parabole depuis l'équation développée" — voir l'audit du 2026-08-10 sur
 *   gen50/gen52 pour un exemple du même défaut ailleurs sur la plateforme
 *   (`docs/historique-chapitre6.md`).
 */
export function diagnostiquerRegroupe(exercice: ExerciceCaracteristiquesAlgebriques, texte: string): StatutVerification {
  if (exercice.niveau === "niveau2" && (exercice.famille === "inverse" || exercice.famille === "racine_carree")) {
    return diagnostiquerIsolement(exercice.zeros, texte);
  }
  if (exercice.niveau === "niveau2" && exercice.famille === "racine_cubique") {
    return diagnostiquerEquationEgaleZero(texte, (x) => exercice.a * x + exercice.b + Math.pow(exercice.c * x + exercice.d, 3));
  }
  throw new Error(`diagnostiquerRegroupe : famille ${exercice.famille} n'a pas d'étape "regroupe"`);
}

export function verifierRegroupe(exercice: ExerciceCaracteristiquesAlgebriques, texte: string): boolean {
  return diagnostiquerRegroupe(exercice, texte) === "correct";
}

function morceauContient(m: Morceau, valeur: number): boolean {
  const borneGauche = m.borneGauche;
  const okGauche =
    typeof borneGauche !== "number" || (m.crochetGauche === "[" ? valeur >= borneGauche - TOLERANCE : valeur > borneGauche + TOLERANCE);
  const borneDroite = m.borneDroite;
  const okDroite =
    typeof borneDroite !== "number" || (m.crochetDroit === "]" ? valeur <= borneDroite + TOLERANCE : valeur < borneDroite - TOLERANCE);
  return okGauche && okDroite;
}

/**
 * Étape "condition de validité de l'équation" (niveau 2, `racine_carree`/`valeur_absolue`) —
 * TOUJOURS une demi-droite fermée à son extrémité finie (`c`/`a` jamais nuls par construction),
 * jamais `ℝ`/`∅` : `saisie.forme` doit valoir `"intervalle"`, comparé à `exercice.conditionValidite`
 * via `morceauEgal` (déjà défini plus haut pour `verifierDomaineNiveau1`, même tolérance sur les
 * bornes finies).
 */
export function verifierConditionValidite(
  exercice: ExerciceNiveau2RacineCarree | ExerciceNiveau2ValeurAbsolue,
  saisie: ReponseCondition,
): boolean {
  if (saisie.forme !== "intervalle" || saisie.intervalle === null) return false;
  return morceauEgal(saisie.intervalle, exercice.conditionValidite);
}

/** Racines DISTINCTES à valider individuellement pour `racine_carree` — dérivées de l'équation du
 * 2nd degré embarquée une fois confirmée, dédupliquées comme `racinesDistinctes` (exercice
 * "l'inconnue au dénominateur") : une racine double ne compte qu'une seule fois. */
export function racinesAValiderRacineCarree(exercice: ExerciceNiveau2RacineCarree): number[] {
  return racinesDistinctes(exercice.zeros.solution.racines);
}

/** `true` si la racine à l'index donné (dans `racinesAValiderRacineCarree`) respecte la condition
 * de validité — la vraie réponse Oui/Non attendue à l'étape "validationSolution". */
export function racineRespecteCondition(exercice: ExerciceNiveau2RacineCarree, racine: number): boolean {
  return morceauContient(exercice.conditionValidite, racine);
}

function racinesValidesNiveau2(exercice: ExerciceNiveau2RacineCarree): number[] {
  return racinesAValiderRacineCarree(exercice).filter((r) => racineRespecteCondition(exercice, r));
}

function racineBranche(exercice: ExerciceNiveau2ValeurAbsolue, indexBranche: 0 | 1): number {
  const f = indexBranche === 0 ? exercice.racineBranche1 : exercice.racineBranche2;
  return f.num / f.den;
}

/**
 * `true` si la branche `indexBranche` (0 = `P1≥0`, 1 = `P1<0`) respecte sa PROPRE condition de
 * signe — la branche 0 est validée directement contre `conditionValidite` (`P1≥0`), la branche 1
 * contre sa NÉGATION (`P1<0`, jamais représentée comme un `Morceau` séparé : la négation d'une
 * demi-droite fermée est l'autre demi-droite, ouverte à la même borne — testée directement ici
 * plutôt que construite comme un second `Morceau`).
 */
export function brancheEstValide(exercice: ExerciceNiveau2ValeurAbsolue, indexBranche: 0 | 1): boolean {
  const dansCondition = morceauContient(exercice.conditionValidite, racineBranche(exercice, indexBranche));
  return indexBranche === 0 ? dansCondition : !dansCondition;
}

function racinesValidesValeurAbsolue(exercice: ExerciceNiveau2ValeurAbsolue): number[] {
  const valides: number[] = [];
  if (brancheEstValide(exercice, 0)) valides.push(racineBranche(exercice, 0));
  if (brancheEstValide(exercice, 1)) valides.push(racineBranche(exercice, 1));
  return valides;
}

/** Étape "validation d'une solution" (niveau 2, `racine_carree`/`valeur_absolue`) — comparaison
 * triviale Oui/Non, isolée dans sa propre fonction pour rester cohérente avec le reste du module
 * (une fonction `verifierXxx` par étape). */
export function verifierValidationSolution(reponseAttendue: boolean, saisie: boolean): boolean {
  return reponseAttendue === saisie;
}

/** Étape "résolution des branches" (niveau 2, `valeur_absolue`) — les deux racines exactes déjà
 * connues (`racineBranche1`/`racineBranche2`), comparées avec la même tolérance que le reste du
 * projet sur les valeurs rationnelles exactes. */
export function verifierResolutionBranches(exercice: ExerciceNiveau2ValeurAbsolue, saisie: ReponseResolutionBranches): boolean {
  const attendu1 = racineBranche(exercice, 0);
  const attendu2 = racineBranche(exercice, 1);
  return Math.abs(saisie.racineBranche1 - attendu1) < TOLERANCE && Math.abs(saisie.racineBranche2 - attendu2) < TOLERANCE;
}

function racinesQuadratiqueReelles(A: number, B: number, C: number): number[] {
  const discriminant = B * B - 4 * A * C;
  if (discriminant < -EPSILON) return [];
  if (Math.abs(discriminant) < EPSILON) return [-B / (2 * A)];
  const racineDiscriminant = Math.sqrt(discriminant);
  return [(-B - racineDiscriminant) / (2 * A), (-B + racineDiscriminant) / (2 * A)];
}

/**
 * Racines réelles de `P3` (niveau 2, `racine_cubique`/`cube`), groupées par valeur DISTINCTE avec
 * leur MULTIPLICITÉ (`prompt-corrections-niveau2-tests.md`, point 4 : x³ peut produire une racine
 * triple, ou une racine double + une racine simple distincte, en plus du cas 3 racines distinctes
 * déjà couvert) — dispatch sur la forme de factorisation stockée (voir `FactorisationP3`) :
 * - `sansX` (forme 4, `P3=(x²+1)(Ax+B)`) : `x²+1` jamais nul pour `x` réel, l'unique racine réelle
 *   est celle du facteur linéaire restant (multiplicité 1, jamais de racine répétée sous cette
 *   forme).
 * - `avecX` (formes 2/3, `P3=x·(Ax²+Bx+C)`) : `x=0` toujours racine, plus les racines réelles
 *   éventuelles (0, 1 ou 2 — la racine double comptée deux fois quand le discriminant du facteur
 *   quadratique est nul) du facteur quadratique restant. Le regroupement par valeur (au lieu d'une
 *   simple déduplication) gère uniformément, sans branche spéciale, les 3 configurations possibles :
 *   3 racines distinctes (aucun regroupement), racine double + racine simple distincte (le
 *   discriminant du facteur quadratique est nul mais sa racine double diffère de 0 — dédupliqué
 *   entre les deux occurrences de la racine double, `0` reste séparé), racine triple (la racine
 *   double du facteur quadratique vaut aussi 0 — les trois occurrences se regroupent en une seule
 *   entrée de multiplicité 3, la forme 3/`C=0` en est le cas structurel).
 */
function racinesAvecMultipliciteP3(factorisation: FactorisationP3): { valeur: number; multiplicite: number }[] {
  const brutes =
    factorisation.type === "sansX"
      ? [-factorisation.lineaire.B / factorisation.lineaire.A]
      : (() => {
          const { A, B, C } = factorisation.quadratique;
          const racinesQuad = racinesQuadratiqueReelles(A, B, C);
          // racinesQuadratiqueReelles ne renvoie qu'UNE valeur pour une racine double (discriminant
          // nul) — la répéter ici pour que le regroupement par valeur ci-dessous lui attribue bien
          // une multiplicité de 2, jamais 1.
          const racinesQuadAvecMultiplicite = racinesQuad.length === 1 ? [racinesQuad[0], racinesQuad[0]] : racinesQuad;
          return [0, ...racinesQuadAvecMultiplicite];
        })();

  const groupes: { valeur: number; multiplicite: number }[] = [];
  for (const racine of brutes) {
    const existant = groupes.find((g) => Math.abs(g.valeur - racine) < EPSILON);
    if (existant) existant.multiplicite++;
    else groupes.push({ valeur: racine, multiplicite: 1 });
  }
  return groupes.sort((a, b) => a.valeur - b.valeur);
}

/** Racines réelles DISTINCTES de `P3` (niveau 2, `racine_cubique`/`cube`) — voir
 * `racinesAvecMultipliciteP3` pour le détail de la construction et des multiplicités associées. */
export function racinesP3(factorisation: FactorisationP3): number[] {
  return racinesAvecMultipliciteP3(factorisation).map((g) => g.valeur);
}

/**
 * Étape 1/étape "zéros" — accepte des EXPRESSIONS COMPLÈTES (pas seulement des fractions
 * `p/q`), avec la même syntaxe que les champs "équation" de ce générateur (`sqrt(...)`,
 * `cbrt(...)`) — nécessaire pour les familles `racine_carree`/`racine_cubique`, dont `f(0)`/les
 * zéros peuvent être irrationnels (ex. `sqrt(5)-3/5`). Réutilise `evaluerExpressionGenerale`
 * (`prompt-3-ameliorations-finales.md`, point 1). Évalue à 2 abscisses différentes et exige la
 * même valeur aux deux : un champ numérique ne doit jamais dépendre de `x` (contrairement aux
 * champs "équation" du projet, qui en dépendent structurellement) — une expression qui en dépend
 * réellement (ex. `x+1`) est donc rejetée comme n'importe quelle syntaxe invalide.
 */
/**
 * Statut à 3 valeurs (convention CLAUDE.md) pour un champ numérique simple accepté en expression
 * complète (`f(0)`, chaque zéro) — cette fonction n'a pas de "réponse attendue" à ce niveau (la
 * comparaison à la cible a lieu ensuite, sur le nombre déjà produit par `parserExpressionNumerique`)
 * : "correct" signifie ici "s'est lu comme une constante bien formée", "not_equivalent" une
 * expression lisible mais pas une constante valide (dépend de `x`, ou hors domaine), jamais confondu
 * avec "parse_error" (exception de tokenisation) — c'est exactement le signal que
 * `parserExpressionNumerique` calcule déjà en interne puis aplatit en `null`, récupéré ici plutôt
 * que recalculé (AUDIT-comparaison-reponses.md).
 */
export function diagnostiquerExpressionNumerique(texte: string): StatutVerification {
  if (texte.trim() === "") return "not_equivalent";
  let v0: number;
  let v1: number;
  try {
    v0 = evaluerExpressionGenerale(texte, 0);
    v1 = evaluerExpressionGenerale(texte, 1);
  } catch {
    return "parse_error";
  }
  if (!Number.isFinite(v0) || !Number.isFinite(v1)) return "not_equivalent";
  if (Math.abs(v0 - v1) > TOLERANCE_ALGEBRE) return "not_equivalent";
  return "correct";
}

export function parserExpressionNumerique(texte: string): number | null {
  if (texte.trim() === "") return null;
  let v0: number;
  let v1: number;
  try {
    v0 = evaluerExpressionGenerale(texte, 0);
    v1 = evaluerExpressionGenerale(texte, 1);
  } catch {
    return null;
  }
  if (!Number.isFinite(v0) || !Number.isFinite(v1)) return null;
  if (Math.abs(v0 - v1) > TOLERANCE_ALGEBRE) return null;
  return v0;
}
