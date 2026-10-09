import type { ExerciceDetermParamA, ExerciceDetermParamB, ExerciceDetermParamC } from "../core6e/determinerParametresLogarithme.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur, separerEquationTexte } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen18`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationDeterminerParametresLogarithme.test.ts` pour la preuve avec des exercices factices
 * définis localement (même principe que `verificationExponentiellesProblemes.ts`, 6gen12).
 *
 * ============================================================================
 * **Le défi technique de ce générateur — vérifier une ÉQUATION/RELATION à PLUSIEURS variables
 * libres (m,n / p,q / p,r), jamais une simple expression en x**
 * ============================================================================
 * Aucune bibliothèque d'algèbre symbolique n'est installée sur ce projet ("Algebrite/mathjs" des
 * specs source désigne, comme partout ailleurs sur la plateforme, l'échantillonnage numérique déjà
 * en place). `moteur6e/equivalenceExponentielle.ts` (partagé, JAMAIS modifié ici) ne couvre que le
 * cas à UNE variable libre (`x`, ou une autre via son paramètre `variable`) ; `6gen13`
 * (`verificationProprietesLogarithme.ts`) a déjà généralisé le principe à 2 variables libres FIXES
 * (m,n) pour une simple EXPRESSION (jamais une équation). Ce générateur a besoin de PLUS :
 *
 * 1. **`diagnostiquerExpressionMultiVariable`** — généralise `diagnostiquerEquivalenceLogarithme`
 *    (6gen13) d'un couple fixe `(m,n)` à un `Record<string,number>` ARBITRAIRE (autant de variables
 *    que nécessaire, ex. juste `{p}` pour l'écran "q,r en fonction de p" de la famille B) : compare
 *    un texte (aucun signe "=") à une référence fermée `(vars)=>number`, en échantillonnant
 *    plusieurs affectations. Utilisée pour un champ qui est une simple EXPRESSION dans une ou
 *    plusieurs variables libres — jamais une équation.
 *
 * 2. **`diagnostiquerEquationParametree`** — LE VRAI besoin nouveau : plusieurs écrans demandent une
 *    ÉQUATION (ex. "m·x0+n=0", "q=-2·p·x0") qui n'est PAS une identité vraie pour toutes les valeurs
 *    des variables libres, mais une CONTRAINTE qui n'admet qu'un sous-ensemble de solutions (une
 *    droite dans l'espace des 2-3 variables). Contrairement à `diagnostiquerEquationDifference`
 *    (equivalenceExponentielle.ts, qui compare 2 EXPRESSIONS-FONCTIONS supposées identiques
 *    PARTOUT), il faut ici accepter N'IMPORTE QUELLE forme algébriquement ÉQUIVALENTE de la MÊME
 *    contrainte — y compris un déplacement de terme, un changement de signe global, ou une mise à
 *    l'échelle par un facteur non nul (ex. "q=-2px0", "-q=2px0", "2q=-4px0", "p=-q/(2x0)" doivent
 *    TOUS être acceptés, spec explicite : "accepter q=−2p·x0 sous toute forme équivalente").
 *
 *    Méthode retenue : échantillonner des points SUR la relation de référence (paramétrer par UNE
 *    variable libre — ex. `p` — et calculer les autres depuis la formule connue, ex. `q=-2px0`) et
 *    vérifier que gauche(texte)-droite(texte) s'annule (≈0) à CHACUN de ces points ; PUIS
 *    échantillonner des points HORS de la relation (même paramétrage, une des variables dépendantes
 *    perturbée d'un écart net) et vérifier que gauche-droite s'y écarte significativement de 0. Le
 *    2e groupe est ESSENTIEL : sans lui, une équation trop permissive (ex. "0=0", ou toute tautologie
 *    qui ne code AUCUNE contrainte réelle) passerait le 1er groupe sans jamais être rejetée. Cette
 *    méthode accepte nativement tout changement de signe/mise à l'échelle car elle ne compare JAMAIS
 *    la valeur du résidu à une référence fixe — seulement son signe/sa nullité aux points choisis :
 *    multiplier toute l'équation par une constante non nulle ne change ni la nullité en un point de
 *    la relation, ni la non-nullité hors de cette relation.
 *
 * 3. **`diagnostiquerInequationParametree`** — même problème pour une INÉQUATION (ex. "p<0",
 *    "r>p·x0²") : la relation d'ordre, pas la valeur, est ce qui compte. Méthode : à chaque point
 *    échantillonné (fourni avec le booléen "la référence est-elle satisfaite ici ?"), on évalue le
 *    texte élève au même point puis on interprète son symbole de comparaison (`<,>,<=,>=,=`, ré-
 *    utilise `separerEquationTexte`, déjà partagé) comme un booléen — le statut est "correct"
 *    seulement si ce booléen coïncide avec la référence à TOUS les points. Choisir un point pile à
 *    la FRONTIÈRE de la relation (référence non satisfaite, car toutes les inéquations de ce
 *    générateur sont STRICTES) permet de distinguer une inégalité stricte correcte d'une variante
 *    large (`<=` au lieu de `<`) qu'aucun point "loin" de la frontière ne pourrait jamais démasquer.
 *    Comme pour les équations, cette approche accepte nativement tout réarrangement/changement de
 *    signe (ex. "0>p" équivalent à "p<0"), car seul le résultat booléen compte, jamais une valeur.
 *
 * **Tolérance** : `TOLERANCE` (0,01) pour toute comparaison de résidu à 0 (équations) ou de valeur
 * numérique pure (écrans "valeur de p/m/n/q/r") — même ordre de grandeur que `TOLERANCE_DEFAUT`
 * (`equivalenceExponentielle.ts`) ; `ECART_HORS_RELATION`/`ECART_FRONTIERE` (5 et 3) : écarts
 * appliqués aux points "hors relation"/"au-delà de la frontière", très supérieurs à `TOLERANCE`
 * pour ne jamais confondre un vrai désaccord avec du bruit flottant.
 */

const TOLERANCE = 0.01;
const ECART_HORS_RELATION = 5;
const ECART_FRONTIERE = 3;

/** Valeurs FIXES et variées (positives/négatives/décimales) pour échantillonner UNE variable libre
 * paramétrant une relation (m, ou p selon l'écran) — jamais liées aux plages de génération réelles,
 * ici de simples variables libres pour la vérification algébrique (même principe que
 * `POINTS_M`/`POINTS_N`, `verificationProprietesLogarithme.ts`). */
const POINTS_PARAMETRE = [1, -2, 0.5, 3, -0.75, 2.25];

// ============================================================================
// Primitives génériques (voir en-tête de fichier).
// ============================================================================

/** Compare un texte SANS "=" (simple expression) à une référence fermée `(vars)=>number`, en
 * échantillonnant plusieurs affectations `Record<string,number>` — généralisation à N variables
 * libres de `diagnostiquerEquivalenceLogarithme` (6gen13, 2 variables fixes m,n). */
export function diagnostiquerExpressionMultiVariable(texte: string, reference: (vars: Record<string, number>) => number, echantillons: Record<string, number>[], tolerance: number = TOLERANCE): StatutVerification {
  let comparables = 0;
  for (const vars of echantillons) {
    const attendu = reference(vars);
    if (!Number.isFinite(attendu)) continue;
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(texte, vars);
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(soumis)) return "not_equivalent";
    comparables++;
    if (Math.abs(soumis - attendu) > tolerance) return "not_equivalent";
  }
  const minimumRequis = Math.min(3, echantillons.length);
  if (comparables < minimumRequis) return "parse_error";
  return "correct";
}

/** Compare une ÉQUATION texte ("gauche=droite") à une contrainte de référence PARAMÉTRÉE — voir
 * en-tête de fichier pour la méthode (points SUR la relation + points HORS relation). */
export function diagnostiquerEquationParametree(texte: string, pointsSurRelation: Record<string, number>[], pointsHorsRelation: Record<string, number>[], tolerance: number = TOLERANCE): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";

  for (const vars of pointsSurRelation) {
    let g: number;
    let d: number;
    try {
      g = evaluerExpressionExponentielle(separe.gauche, vars);
      d = evaluerExpressionExponentielle(separe.droite, vars);
    } catch {
      return "parse_error";
    }
    const diff = g - d;
    if (!Number.isFinite(diff) || Math.abs(diff) > tolerance) return "not_equivalent";
  }

  for (const vars of pointsHorsRelation) {
    let g: number;
    let d: number;
    try {
      g = evaluerExpressionExponentielle(separe.gauche, vars);
      d = evaluerExpressionExponentielle(separe.droite, vars);
    } catch {
      return "parse_error";
    }
    const diff = g - d;
    if (Number.isFinite(diff) && Math.abs(diff) <= tolerance) return "not_equivalent";
  }

  return "correct";
}

interface EchantillonInequation {
  vars: Record<string, number>;
  satisfait: boolean;
}

/** Compare une INÉQUATION texte ("gauche op droite") à une contrainte de référence PARAMÉTRÉE, un
 * booléen "satisfait" attendu par point échantillonné — voir en-tête de fichier pour la méthode. */
export function diagnostiquerInequationParametree(texte: string, echantillons: EchantillonInequation[], tolerance: number = TOLERANCE): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";

  for (const { vars, satisfait } of echantillons) {
    let g: number;
    let d: number;
    try {
      g = evaluerExpressionExponentielle(separe.gauche, vars);
      d = evaluerExpressionExponentielle(separe.droite, vars);
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(g) || !Number.isFinite(d)) return "not_equivalent";
    const diff = g - d;
    let vrai: boolean;
    switch (separe.symbole) {
      case "<":
        vrai = diff < -tolerance;
        break;
      case ">":
        vrai = diff > tolerance;
        break;
      case "<=":
      case "≤":
        vrai = diff <= tolerance;
        break;
      case ">=":
      case "≥":
        vrai = diff >= -tolerance;
        break;
      case "=":
        vrai = Math.abs(diff) <= tolerance;
        break;
      default:
        return "parse_error";
    }
    if (vrai !== satisfait) return "not_equivalent";
  }
  return "correct";
}

export interface ReponseDeuxChamps {
  a: string;
  b: string;
}

function pireStatut(sa: StatutVerification, sb: StatutVerification): StatutVerification {
  if (sa === "parse_error" || sb === "parse_error") return "parse_error";
  return sa === "correct" && sb === "correct" ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A — ln(mx+n) depuis 2 conditions.
// ============================================================================

/** Points SUR/HORS la relation "m·x0+n=0" — paramétrés par m libre (`POINTS_PARAMETRE`). `x0` est
 * une CONSTANTE CONNUE de l'exercice (jamais un nom symbolique attendu dans le texte élève :
 * l'évaluateur `expressionExponentielle.ts` ne reconnaît que des identifiants purement
 * alphabétiques — "x0"/"x1"/"k1" s'y tokeniseraient en "x"/"k" suivi d'un nombre, jamais comme un
 * seul identifiant — même limite déjà en place partout ailleurs sur la plateforme, ex. 6gen13 où
 * `M`/`N` sont TOUJOURS substitués numériquement dans le texte élève, jamais tapés comme noms). Le
 * texte élève substitue donc directement la valeur numérique de `x0`, jamais son nom. */
function pointsAsymptote(x0: number): { sur: Record<string, number>[]; hors: Record<string, number>[] } {
  const sur = POINTS_PARAMETRE.map((m) => ({ m, n: -m * x0 }));
  const hors = POINTS_PARAMETRE.map((m) => ({ m, n: -m * x0 + ECART_HORS_RELATION }));
  return { sur, hors };
}

/** Points SUR/HORS la 2e condition (dépend du sous-type) — paramétrés par m libre. */
function pointsDeuxiemeCondition(exercice: ExerciceDetermParamA): { sur: Record<string, number>[]; hors: Record<string, number>[] } {
  if (exercice.sousType === "ordonnee") {
    const { k } = exercice;
    const sur = POINTS_PARAMETRE.map((m) => ({ m, n: k }));
    const hors = POINTS_PARAMETRE.map((m) => ({ m, n: k + ECART_HORS_RELATION }));
    return { sur, hors };
  }
  const { x1, k1 } = exercice;
  const cible = Math.log(k1);
  const sur = POINTS_PARAMETRE.map((m) => ({ m, n: cible - m * x1 }));
  const hors = POINTS_PARAMETRE.map((m) => ({ m, n: cible - m * x1 + ECART_HORS_RELATION }));
  return { sur, hors };
}

/** Écran 1 — système de 2 équations en (m,n) : `reponse.a`=asymptote, `reponse.b`=2e condition. */
export function diagnostiquerAEcran1(exercice: ExerciceDetermParamA, reponse: ReponseDeuxChamps): StatutVerification {
  const asymptote = pointsAsymptote(exercice.x0);
  const sa = diagnostiquerEquationParametree(reponse.a, asymptote.sur, asymptote.hors);
  const deuxieme = pointsDeuxiemeCondition(exercice);
  const sb = diagnostiquerEquationParametree(reponse.b, deuxieme.sur, deuxieme.hors);
  return pireStatut(sa, sb);
}
export function verifierAEcran1(exercice: ExerciceDetermParamA, reponse: ReponseDeuxChamps): boolean {
  return diagnostiquerAEcran1(exercice, reponse) === "correct";
}

/** Écran 2 — résoudre le système : valeurs de m et n. */
export function diagnostiquerAEcran2(exercice: ExerciceDetermParamA, reponse: ReponseDeuxChamps): StatutVerification {
  const sa = diagnostiquerValeur(reponse.a, exercice.m, TOLERANCE);
  const sb = diagnostiquerValeur(reponse.b, exercice.n, TOLERANCE);
  return pireStatut(sa, sb);
}
export function verifierAEcran2(exercice: ExerciceDetermParamA, reponse: ReponseDeuxChamps): boolean {
  return diagnostiquerAEcran2(exercice, reponse) === "correct";
}

// ============================================================================
// Famille B — ln(px²+qx+r) depuis 2 racines + 1 point.
// ============================================================================

/** Écran 1 — q(p)=-p·(r1+r2), r(p)=p·r1·r2 : simples EXPRESSIONS en p libre (jamais une équation). */
export function diagnostiquerBEcran1(exercice: ExerciceDetermParamB, reponse: ReponseDeuxChamps): StatutVerification {
  const { r1, r2 } = exercice;
  const echantillons = POINTS_PARAMETRE.map((p) => ({ p }));
  const sa = diagnostiquerExpressionMultiVariable(reponse.a, ({ p }) => -p * (r1 + r2), echantillons);
  const sb = diagnostiquerExpressionMultiVariable(reponse.b, ({ p }) => p * r1 * r2, echantillons);
  return pireStatut(sa, sb);
}
export function verifierBEcran1(exercice: ExerciceDetermParamB, reponse: ReponseDeuxChamps): boolean {
  return diagnostiquerBEcran1(exercice, reponse) === "correct";
}

/** Écran 2 — valeur de p, trouvée via le point de passage. */
export function diagnostiquerBEcran2(exercice: ExerciceDetermParamB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.p, TOLERANCE);
}
export function verifierBEcran2(exercice: ExerciceDetermParamB, texte: string): boolean {
  return diagnostiquerBEcran2(exercice, texte) === "correct";
}

/** Écran 3 — valeurs de q et r, depuis le p correct de l'écran 2. */
export function diagnostiquerBEcran3(exercice: ExerciceDetermParamB, reponse: ReponseDeuxChamps): StatutVerification {
  const sa = diagnostiquerValeur(reponse.a, exercice.q, TOLERANCE);
  const sb = diagnostiquerValeur(reponse.b, exercice.r, TOLERANCE);
  return pireStatut(sa, sb);
}
export function verifierBEcran3(exercice: ExerciceDetermParamB, reponse: ReponseDeuxChamps): boolean {
  return diagnostiquerBEcran3(exercice, reponse) === "correct";
}

// ============================================================================
// Famille C — conditions pour un extremum local.
// ============================================================================

/** Écran 1 — signe de p : p<0 (maximum) ou p>0 (minimum). Point-frontière p=0 (référence non
 * satisfaite, inéquation STRICTE) inclus pour démasquer une variante large (`<=`/`>=`). */
export function diagnostiquerCEcran1(exercice: ExerciceDetermParamC, texte: string): StatutVerification {
  const attenduNegatif = exercice.typeExtremum === "maximum";
  const echantillons: EchantillonInequation[] = [-3, -1, -0.2, 0.2, 1, 3, 0].map((p) => ({ vars: { p }, satisfait: attenduNegatif ? p < 0 : p > 0 }));
  return diagnostiquerInequationParametree(texte, echantillons);
}
export function verifierCEcran1(exercice: ExerciceDetermParamC, texte: string): boolean {
  return diagnostiquerCEcran1(exercice, texte) === "correct";
}

/** Écran 2 — relation q=-2·p·x0 (sommet de la parabole en x0), p libre paramétrant la relation.
 * `x0` (constante connue de l'exercice) est substitué NUMÉRIQUEMENT dans le texte élève — jamais
 * tapé comme nom symbolique (voir le commentaire de `pointsAsymptote` ci-dessus : "x0" tokeniserait
 * en "x" suivi de "0", pas comme un seul identifiant). */
export function diagnostiquerCEcran2(exercice: ExerciceDetermParamC, texte: string): StatutVerification {
  const { x0 } = exercice;
  const sur = POINTS_PARAMETRE.map((p) => ({ p, q: -2 * p * x0 }));
  const hors = POINTS_PARAMETRE.map((p) => ({ p, q: -2 * p * x0 + ECART_HORS_RELATION }));
  return diagnostiquerEquationParametree(texte, sur, hors);
}
export function verifierCEcran2(exercice: ExerciceDetermParamC, texte: string): boolean {
  return diagnostiquerCEcran2(exercice, texte) === "correct";
}

/** Écran 3 — inéquation r>p·x0² (domaine : u(x0)>0, q déjà substitué) — indépendante du signe de p
 * (voir en-tête `core6e/determinerParametresLogarithme.types.ts`), donc la MÊME forme quel que soit
 * `typeExtremum`. Point-frontière r=p·x0² (référence non satisfaite, inéquation STRICTE) inclus. */
export function diagnostiquerCEcran3(exercice: ExerciceDetermParamC, texte: string): StatutVerification {
  const { x0 } = exercice;
  const echantillons: EchantillonInequation[] = [];
  for (const p of [-3, -1, 0.5, 2, 4, -0.7]) {
    const frontiere = p * x0 * x0;
    echantillons.push({ vars: { p, r: frontiere }, satisfait: false });
    echantillons.push({ vars: { p, r: frontiere + ECART_FRONTIERE }, satisfait: true });
    echantillons.push({ vars: { p, r: frontiere - ECART_FRONTIERE }, satisfait: false });
  }
  return diagnostiquerInequationParametree(texte, echantillons);
}
export function verifierCEcran3(exercice: ExerciceDetermParamC, texte: string): boolean {
  return diagnostiquerCEcran3(exercice, texte) === "correct";
}
