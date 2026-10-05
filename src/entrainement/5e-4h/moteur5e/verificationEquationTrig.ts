/**
 * Couche B (5e) — vérification pour 5gen10 ("Équations trigonométriques trig(ax+b)=k").
 * `src/moteur5e/` ne peut jamais importer `src/generateurs5e/` — toute cible numérique (racines,
 * coefficients α/β/γ...) est recalculée ICI depuis les champs déjà présents des contrats core,
 * jamais recalculée via Couche A.
 *
 * Écrans famille "directe" (branches à variable libre "k", D.1/D.2/D.3 — 5gen10 uniquement, voir
 * NOTE ci-dessous) : "k"/"n" résolus NATIVEMENT par `evaluerExpressionGenerale` via son paramètre
 * `variables` (cross-chantier, `src/moteur/expressionGenerale.ts` — même mécanisme que "pi", qui
 * reconnaît nativement un nom même collé à un coefficient, depuis l'audit
 * promptauditparsingpisqrt.md, généralisé à un nom arbitraire par l'audit implicite-multiplication-
 * variable-nommée). Chaque ligne soumise est évaluée en DEUX points (0, 1) pour en extraire sa
 * propre "constante"/"période" (f(0) et f(1)-f(0)) — comparée à la branche attendue par ÉQUIVALENCE
 * MODULO LA PÉRIODE (même principe que `diagnostiquerPhiModuloT`, 5gen9). `diagnostiquerBranches`/
 * `diagnostiquerEnsembleNumerique` sont les 2 primitives PARTAGÉES par les 4 familles (matching de
 * branches à variable libre / équivalence d'ensembles numériques finales) — voir CLAUDE.md section
 * 5gen10, "Extension — 4 familles".
 *
 * NOTE — `diagnostiquerBranches`/`evaluerLigne` sont AUSSI réutilisées telles quelles par 5gen11
 * (`verificationExtremumsSinusoide.ts`) et 5gen13 (`verificationModelisationSinusoide.ts`), qui
 * gardent "n" comme nom de variable libre (jamais renommés par la correction 5gen10 D.1/D.2/D.3,
 * hors périmètre) — `variablesLibres` mappe donc LES DEUX noms ("k" ET "n") à la même valeur plutôt
 * que de n'en résoudre qu'un, pour propager le renommage à 5gen10 sans régresser ces 2 générateurs
 * qui consomment la même primitive partagée.
 *
 * Écrans nécessitant sin(x)/cos(x)/tan(x) LITTÉRALEMENT dans le texte soumis (conversion d'identité,
 * factorisation — familles 2/3/4) : `evaluerExpressionGenerale` interprète SES PROPRES sin/cos/tan
 * en DEGRÉS (convention exclusive du chapitre 3 4e, incompatible ici) — `substituerTrig` remplace
 * donc ces tokens par leur valeur NUMÉRIQUE déjà calculée en JS pur (radians), avant tout appel à
 * `evaluerExpressionGenerale`, qui n'évalue plus alors que de l'arithmétique pure.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type {
  ExerciceEgaliteExpressions,
  ExerciceEquationTrig,
  ExerciceEquationTrigonometrique,
  ExerciceProduitFacteurs,
  ExercicePythagoricienne,
  FamilleEquationTrigonometrique,
  FonctionTrig,
  RacinePythagoricienne,
  ValeurPiOuDecimale,
} from "../core5e/equationsTrigonometriques.types";

export const TOLERANCE_EQUATION_TRIG = 0.01;

export type ReponseArgument = { aucuneSolution: true } | { aucuneSolution: false; lignes: string[] };

/** Variable libre — "k" (5gen10, D.1/D.2/D.3) OU "n" (5gen11/5gen13, réutilisateurs de cette
 * primitive partagée, voir NOTE en tête de fichier) — résolue NATIVEMENT par
 * `evaluerExpressionGenerale` via son paramètre `variables` (les deux noms mappés à la même valeur,
 * l'appelant ne sachant pas lequel des deux figure réellement dans le texte). Remplace l'ancienne
 * pré-substitution textuelle par regex `\b[kn]\b` — cassait silencieusement toute saisie où la
 * variable est collée à un coefficient ("3k", "2n" : `\b` ne matche jamais entre un chiffre et une
 * lettre), même bug que l'ancien traitement de "pi" (promptauditparsingpisqrt.md). */
function variablesLibres(valeur: number): Record<string, number> {
  return { k: valeur, n: valeur };
}

interface LigneEvaluee {
  f0: number;
  periode: number;
}

/** `null` ⟺ la ligne n'a pas pu être interprétée (parse_error) — jamais un booléen aplati, pour
 * distinguer "n'a pas pu être lu" de "ne correspond à aucune branche". */
function evaluerLigne(texte: string): LigneEvaluee | null {
  try {
    const f0 = evaluerExpressionGenerale(texte, 0, variablesLibres(0));
    const f1 = evaluerExpressionGenerale(texte, 0, variablesLibres(1));
    if (!Number.isFinite(f0) || !Number.isFinite(f1)) return null;
    return { f0, periode: f1 - f0 };
  } catch {
    return null;
  }
}

interface BrancheCible {
  constante: ValeurPiOuDecimale;
  periode: ValeurPiOuDecimale;
}

/** La ligne soumise correspond à `branche` ssi sa PÉRIODE a la même magnitude (le sens de balayage
 * de n est arbitraire, ±période décrivent la même suite) ET sa constante ne diffère de celle de la
 * branche que d'un multiple ENTIER de la période (formulation décalée d'un nombre entier de tours —
 * toujours acceptée, jamais seulement une correspondance textuelle stricte). */
function correspondBranche(ligne: LigneEvaluee, branche: BrancheCible): boolean {
  const periodeAttendue = branche.periode.decimal;
  if (Math.abs(Math.abs(ligne.periode) - Math.abs(periodeAttendue)) > TOLERANCE_EQUATION_TRIG) return false;
  const ecart = ligne.f0 - branche.constante.decimal;
  const kEntier = Math.round(ecart / periodeAttendue);
  return Math.abs(ecart - kEntier * periodeAttendue) <= TOLERANCE_EQUATION_TRIG;
}

/** Comparaison en ensemble (ordre indifférent) entre les lignes soumises (déjà évaluées) et les
 * branches attendues — chaque ligne consomme EXACTEMENT une branche distincte. */
function correspondEnsemble(lignes: LigneEvaluee[], branches: BrancheCible[]): boolean {
  if (lignes.length !== branches.length) return false;
  const restantes = [...branches];
  for (const ligne of lignes) {
    const index = restantes.findIndex((b) => correspondBranche(ligne, b));
    if (index === -1) return false;
    restantes.splice(index, 1);
  }
  return true;
}

/** Primitive PARTAGÉE — matching de branches à variable libre n (add-as-needed, ordre indifférent,
 * équivalence modulo la période). Réutilisée par `diagnostiquerArgument`/`diagnostiquerIsolerX`
 * (famille "directe") ET directement par les familles 2 (2 facteurs, via `diagnostiquerArgument`/
 * `diagnostiquerIsolerX` appelés sur chaque facteur) et 4 (écran "résoudre x" fusionné). */
export function diagnostiquerBranches(lignes: string[], branches: BrancheCible[]): StatutVerification {
  const evaluations = lignes.map(evaluerLigne);
  if (evaluations.some((e) => e === null)) return "parse_error";
  return correspondEnsemble(evaluations as LigneEvaluee[], branches) ? "correct" : "not_equivalent";
}

/** Écran "argument" (famille "directe") — u=ax+b. */
export function diagnostiquerArgument(exercice: ExerciceEquationTrig, reponse: ReponseArgument): StatutVerification {
  if (reponse.aucuneSolution) {
    return exercice.aucuneSolution ? "correct" : "not_equivalent";
  }
  if (exercice.aucuneSolution) return "not_equivalent";
  return diagnostiquerBranches(reponse.lignes, exercice.branchesU);
}

export function verifierArgument(exercice: ExerciceEquationTrig, reponse: ReponseArgument): boolean {
  return diagnostiquerArgument(exercice, reponse) === "correct";
}

/** Écran "isolerX" (famille "directe") — x=(u-b)/a. Toujours `exercice.branchesX.length` lignes
 * (jamais atteint si `aucuneSolution`, écran sauté). */
export function diagnostiquerIsolerX(exercice: ExerciceEquationTrig, lignes: string[]): StatutVerification {
  return diagnostiquerBranches(lignes, exercice.branchesX);
}

export function verifierIsolerX(exercice: ExerciceEquationTrig, lignes: string[]): boolean {
  return diagnostiquerIsolerX(exercice, lignes) === "correct";
}

/** Primitive PARTAGÉE — équivalence d'ENSEMBLES numériques (ordre indifférent, tolérance ±0,01) —
 * réutilisée par `diagnostiquerSolutions` (famille "directe") ET directement par les écrans finaux
 * des familles 2/3/4 et l'écran "racines" de la famille 3. */
export function diagnostiquerEnsembleNumerique(textes: string[], cible: number[]): StatutVerification {
  if (textes.length !== cible.length) return "not_equivalent";
  const valeurs: number[] = [];
  for (const texte of textes) {
    try {
      const v = evaluerExpressionGenerale(texte, 0);
      if (!Number.isFinite(v)) return "parse_error";
      valeurs.push(v);
    } catch {
      return "parse_error";
    }
  }
  const restantes = [...cible];
  for (const v of valeurs) {
    const index = restantes.findIndex((s) => Math.abs(s - v) <= TOLERANCE_EQUATION_TRIG);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

/** Écran "solutions" (famille "directe") — solutions distinctes dans [0;2π[. */
export function diagnostiquerSolutions(exercice: ExerciceEquationTrig, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleNumerique(textes, exercice.solutions);
}

export function verifierSolutions(exercice: ExerciceEquationTrig, textes: string[]): boolean {
  return diagnostiquerSolutions(exercice, textes) === "correct";
}

// ============================================================================
// Écran 0 — Reconnaissance de la technique (commune aux 4 familles).
// ============================================================================

export function diagnostiquerReconnaissance(exercice: ExerciceEquationTrigonometrique, choix: FamilleEquationTrigonometrique): StatutVerification {
  return choix === exercice.famille ? "correct" : "not_equivalent";
}

// ============================================================================
// Évaluation trig en RADIANS — `evaluerExpressionGenerale` interprète ses PROPRES sin/cos/tan en
// DEGRÉS (convention exclusive du chapitre 3 4e, incompatible ici). `evaluerTrigRadians` substitue
// d'abord x/pi par leur valeur numérique PARTOUT dans le texte, puis résout chaque appel
// sin(...)/cos(...)/tan(...) rencontré — argument déjà purement numérique à ce stade, y compris un
// argument COMPOSÉ comme "pi/2-x-pi/4" (pas seulement "x" nu) — via Math.sin/cos/tan directement,
// jamais via le trig natif de `evaluerExpressionGenerale` (qui n'est plus utilisée que pour de
// l'arithmétique pure : l'intérieur d'un appel trig, ou l'expression finale une fois tout appel
// trig déjà résolu). Réutilisée par les familles 2 (factorisation/séparation)/3 (conversion
// pythagoricienne)/4 (conversion d'identité).
// ============================================================================

const TRIG_MATH: Record<FonctionTrig, (x: number) => number> = { cos: Math.cos, sin: Math.sin, tan: Math.tan };
const DEBUT_APPEL_TRIG = /\b(sin|cos|tan)\s*\(/i;
const GARDE_APPELS_TRIG_MAX = 10;

interface AppelTrigTrouve {
  debut: number;
  fin: number;
  fonction: FonctionTrig;
  interieur: string;
}

/** Trouve le PREMIER appel `sin(`/`cos(`/`tan(` du texte et son argument, en comptant la profondeur
 * de parenthèses pour trouver la fermeture correspondante — supporte une imbrication de parenthèses
 * ARBITRAIRE à l'intérieur de l'argument (ex. "cos(pi/2-(a*x+b))", un point d'écriture naturel pour
 * l'élève, pas seulement le niveau unique introduit par la substitution de x). `null` si aucun appel
 * trig ou parenthèse non fermée (⟹ `parse_error`, jamais une exception non rattrapée). */
function trouverAppelTrig(expr: string): AppelTrigTrouve | null {
  const debutMatch = DEBUT_APPEL_TRIG.exec(expr);
  if (debutMatch === null) return null;
  const indexParenOuvrante = debutMatch.index + debutMatch[0].length - 1;
  let profondeur = 0;
  for (let i = indexParenOuvrante; i < expr.length; i++) {
    if (expr[i] === "(") profondeur++;
    else if (expr[i] === ")") {
      profondeur--;
      if (profondeur === 0) {
        return { debut: debutMatch.index, fin: i, fonction: debutMatch[1].toLowerCase() as FonctionTrig, interieur: expr.slice(indexParenOuvrante + 1, i) };
      }
    }
  }
  return null;
}

/** "x" n'est PLUS pré-substitué par regex ici (l'ancien `texte.replace(/\bx\b/gi, ...)` cassait
 * silencieusement "3x", `\b` ne matchant jamais entre un chiffre et une lettre) : "x" est déjà un
 * token NATIF de `evaluerExpressionGenerale` (comme dans tout le reste de la plateforme), donc lui
 * passer `xRadians` directement comme 2e argument — pour l'argument intérieur d'un appel trig
 * extrait par sous-chaîne ET pour l'expression finale — suffit, et bénéficie nativement de la
 * multiplication implicite ("2x", "3x+1"...). */
function evaluerTrigRadians(texte: string, xRadians: number): number {
  let expr = texte;
  let garde = 0;
  let appel: AppelTrigTrouve | null;
  while ((appel = trouverAppelTrig(expr)) && garde < GARDE_APPELS_TRIG_MAX) {
    const valeurInterieure = evaluerExpressionGenerale(appel.interieur, xRadians);
    const valeur = TRIG_MATH[appel.fonction](valeurInterieure);
    expr = expr.slice(0, appel.debut) + `(${valeur})` + expr.slice(appel.fin + 1);
    garde++;
  }
  return evaluerExpressionGenerale(expr, xRadians);
}

const X_ECHANTILLONS_TRIG = [0.3, 0.9, 1.7, 2.6, -0.5];

/** Compare la VALEUR d'une expression soumise (contenant potentiellement sin/cos/tan) à une
 * fonction de référence RÉELLE, sur plusieurs x — jamais une vérification "solves the equation",
 * une équivalence D'EXPRESSIONS (vraie pour tout x, pas seulement les solutions). */
function diagnostiquerEquivalenceTrig(texte: string, reference: (x: number) => number): StatutVerification {
  for (const x of X_ECHANTILLONS_TRIG) {
    let valeur: number;
    try {
      valeur = evaluerTrigRadians(texte, x);
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(valeur)) return "parse_error";
    if (Math.abs(valeur - reference(x)) > TOLERANCE_EQUATION_TRIG) return "not_equivalent";
  }
  return "correct";
}

// ============================================================================
// Famille 2 — Produit de facteurs = 0.
// ============================================================================

/** Écran "pré-1" (sous-cas "nonFactoree" uniquement) — factoriser T²-k₂T=0 en T(T-k₂)=0,
 * T=trig(ax+b) — équivalence de VALEUR à l'équation développée (jamais "résout l'équation"). */
export function diagnostiquerFactorisationProduit(exercice: ExerciceProduitFacteurs, texte: string): StatutVerification {
  const { fonction, a, b, k } = exercice.facteur2;
  const aVal = a.numerateur / a.denominateur;
  const reference = (x: number) => {
    const T = TRIG_MATH[fonction](aVal * x + b.decimal);
    return T * T - k.valeur * T;
  };
  return diagnostiquerEquivalenceTrig(texte, reference);
}

function valeurEquationLigne(texte: string): number[] | null {
  const parties = texte.split("=");
  if (parties.length !== 2) return null;
  const valeurs: number[] = [];
  for (const x of X_ECHANTILLONS_TRIG) {
    try {
      const lhs = evaluerTrigRadians(parties[0], x);
      const rhs = evaluerTrigRadians(parties[1], x);
      if (!Number.isFinite(lhs) || !Number.isFinite(rhs)) return null;
      valeurs.push(lhs - rhs);
    } catch {
      return null;
    }
  }
  return valeurs;
}

function referenceFacteur(facteur: ExerciceEquationTrig): number[] {
  const aVal = facteur.a.numerateur / facteur.a.denominateur;
  return X_ECHANTILLONS_TRIG.map((x) => TRIG_MATH[facteur.fonction](aVal * x + facteur.b.decimal) - facteur.k.valeur);
}

/** Deux équations "gauche-droite=0" sont ÉQUIVALENTES ssi leurs valeurs sont PROPORTIONNELLES (un
 * même facteur d'échelle non nul à chaque échantillon) — jamais une égalité stricte de valeur, qui
 * rejetterait à tort une forme mise à l'échelle mais mathématiquement équivalente (ex.
 * "sqrt(3)*tan(x)-1=0" pour "tan(x)=1/sqrt(3)", même principe que `diagnostiquerEquationDroiteLibre`,
 * 4e — comparaison par proportionnalité). */
function equationsProportionnelles(a: number[], b: number[]): boolean {
  let pivot = -1;
  for (let i = 0; i < b.length; i++) {
    if (Math.abs(b[i]) > TOLERANCE_EQUATION_TRIG) {
      pivot = i;
      break;
    }
  }
  if (pivot === -1) return a.every((v) => Math.abs(v) <= TOLERANCE_EQUATION_TRIG);
  const facteur = a[pivot] / b[pivot];
  if (Math.abs(facteur) <= TOLERANCE_EQUATION_TRIG) return false;
  return a.every((v, i) => Math.abs(v - facteur * b[i]) <= TOLERANCE_EQUATION_TRIG * (1 + Math.abs(b[i])));
}

/** Écran "séparer en 2 équations" (famille 2) — 2 lignes "facteurN=0", ordre indifférent (échange
 * accepté, même principe que gen54 4e). */
export function diagnostiquerSeparerFacteurs(exercice: ExerciceProduitFacteurs, lignes: string[]): StatutVerification {
  if (lignes.length !== 2) return "not_equivalent";
  const evaluations = lignes.map(valeurEquationLigne);
  if (evaluations.some((e) => e === null)) return "parse_error";
  const [e1, e2] = evaluations as number[][];
  const ref1 = referenceFacteur(exercice.facteur1);
  const ref2 = referenceFacteur(exercice.facteur2);
  const direct = equationsProportionnelles(e1, ref1) && equationsProportionnelles(e2, ref2);
  const echange = equationsProportionnelles(e1, ref2) && equationsProportionnelles(e2, ref1);
  return direct || echange ? "correct" : "not_equivalent";
}

function combiner2(a: StatutVerification, b: StatutVerification): StatutVerification {
  if (a === "parse_error" || b === "parse_error") return "parse_error";
  return a === "correct" && b === "correct" ? "correct" : "not_equivalent";
}

export interface ReponseDeuxFacteursArgument {
  facteur1: ReponseArgument;
  facteur2: ReponseArgument;
}

/** Écran "résoudre l'argument pour chaque facteur" (famille 2) — les 2 facteurs traités ensemble. */
export function diagnostiquerArgumentProduit(exercice: ExerciceProduitFacteurs, reponse: ReponseDeuxFacteursArgument): StatutVerification {
  return combiner2(diagnostiquerArgument(exercice.facteur1, reponse.facteur1), diagnostiquerArgument(exercice.facteur2, reponse.facteur2));
}

export interface ReponseDeuxFacteursLignes {
  facteur1: string[];
  facteur2: string[];
}

/** Écran "isoler x pour chaque facteur" (famille 2). */
export function diagnostiquerIsolerXProduit(exercice: ExerciceProduitFacteurs, reponse: ReponseDeuxFacteursLignes): StatutVerification {
  return combiner2(diagnostiquerIsolerX(exercice.facteur1, reponse.facteur1), diagnostiquerIsolerX(exercice.facteur2, reponse.facteur2));
}

/** Écran final (famille 2) — union des solutions des 2 facteurs. */
export function diagnostiquerSolutionsProduit(exercice: ExerciceProduitFacteurs, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleNumerique(textes, exercice.solutionsUnion);
}

// ============================================================================
// Famille 3 — Substitution pythagoricienne.
// ============================================================================

/** Valeur de l'équation MIXTE d'origine à un x donné — REPLIQUÉE ici depuis `alpha/beta/gamma`
 * (jamais importée de Couche A, voir l'en-tête de fichier). */
function evaluerMixtePythagoricienne(exercice: ExercicePythagoricienne, x: number): number {
  const { alpha, beta, gamma, fonctionCible } = exercice;
  if (fonctionCible === "cos") return -alpha * Math.sin(x) ** 2 + beta * Math.cos(x) + (alpha + gamma);
  return -alpha * Math.cos(x) ** 2 + beta * Math.sin(x) + (alpha + gamma);
}

/** Écran 1 (famille 3) — convertir via sin²x+cos²x=1 pour obtenir le polynôme cible pur. */
export function diagnostiquerConversionPythagoricienne(exercice: ExercicePythagoricienne, texte: string): StatutVerification {
  return diagnostiquerEquivalenceTrig(texte, (x) => evaluerMixtePythagoricienne(exercice, x));
}

/** Écran 2 (famille 3) — racines t1/t2 du polynôme cible, équivalence d'ensembles. */
export function diagnostiquerRacinesPythagoricienne(exercice: ExercicePythagoricienne, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleNumerique(textes, [exercice.racine1.t, exercice.racine2.t]);
}

export type ReponseRacine = { rejeter: true } | { rejeter: false; lignes: string[] };

export interface ReponseRacinesPythagoricienne {
  racine1: ReponseRacine;
  racine2: ReponseRacine;
}

/** Exportée (au lieu de rester privée) pour permettre à `EtapeRacinesResolutionPythagoricienne`
 * (A.2) de diagnostiquer racine1/racine2 INDÉPENDAMMENT — `diagnostiquerRacinesResolution` les
 * combine pour le score global, jamais l'inverse. */
export function diagnostiquerUneRacine(racine: RacinePythagoricienne, reponse: ReponseRacine): StatutVerification {
  if (reponse.rejeter) return racine.invalide ? "correct" : "not_equivalent";
  if (racine.invalide) return "not_equivalent";
  return diagnostiquerBranches(reponse.lignes, racine.resolution!.branchesU);
}

/** Écran 3 (famille 3) — pour chaque racine, rejeter (|t|>1) ou résoudre trig(x)=t (a=1,b=0). */
export function diagnostiquerRacinesResolution(exercice: ExercicePythagoricienne, reponse: ReponseRacinesPythagoricienne): StatutVerification {
  return combiner2(diagnostiquerUneRacine(exercice.racine1, reponse.racine1), diagnostiquerUneRacine(exercice.racine2, reponse.racine2));
}

/** Écran final (famille 3) — union des solutions des racines VALIDES. */
export function diagnostiquerSolutionsPythagoricienne(exercice: ExercicePythagoricienne, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleNumerique(textes, exercice.solutionsUnion);
}

// ============================================================================
// Famille 4 — Égalité de deux expressions trigonométriques.
// ============================================================================

function contientFonction(texte: string, fonction: string): boolean {
  return new RegExp(`\\b${fonction}\\s*\\(`, "i").test(texte);
}

/** La forme -tan(...) NON convertie (garde structurelle spécifique à tanVersTan — cos/sinVersCos
 * ont déjà un garde suffisant via `contientFonction`, le nom de fonction cible étant ABSENT de
 * l'original ; ici la fonction "tan" est déjà présente des 2 côtés, seul le signe/argument change). */
function estTanNonConvertie(texte: string): boolean {
  return /^\s*-\s*tan\s*\(/i.test(texte.trim());
}

/** Écran 1 (famille 4) — convertir un membre pour aligner sur la même fonction, garde structurelle
 * EN PLUS de l'équivalence numérique (jamais une simple recopie du membre non converti acceptée à
 * tort — même principe que gen50/52, 4e, "garde structurelle"). */
export function diagnostiquerConversionEgalite(exercice: ExerciceEgaliteExpressions, texte: string): StatutVerification {
  const a2Val = exercice.a2.numerateur / exercice.a2.denominateur;
  const b2Val = exercice.b2.decimal;
  let reference: (x: number) => number;
  let echecStructure = false;
  if (exercice.identite === "cosVersCos") {
    reference = (x) => Math.sin(a2Val * x + b2Val);
    echecStructure = !contientFonction(texte, "cos");
  } else if (exercice.identite === "sinVersSin") {
    reference = (x) => Math.cos(a2Val * x + b2Val);
    echecStructure = !contientFonction(texte, "sin");
  } else {
    reference = (x) => -Math.tan(a2Val * x + b2Val);
    echecStructure = estTanNonConvertie(texte);
  }
  const statutNumerique = diagnostiquerEquivalenceTrig(texte, reference);
  if (statutNumerique === "parse_error") return "parse_error";
  if (echecStructure) return "not_equivalent";
  return statutNumerique;
}

/** Écran 2 (famille 4, fusionné avec l'ancien écran 3 de la spec — voir CLAUDE.md) — résoudre x
 * directement, réutilise `diagnostiquerBranches`. */
export function diagnostiquerResoudreEgalite(exercice: ExerciceEgaliteExpressions, lignes: string[]): StatutVerification {
  return diagnostiquerBranches(lignes, exercice.branches);
}

/** Écran final (famille 4). */
export function diagnostiquerSolutionsEgalite(exercice: ExerciceEgaliteExpressions, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleNumerique(textes, exercice.solutions);
}
