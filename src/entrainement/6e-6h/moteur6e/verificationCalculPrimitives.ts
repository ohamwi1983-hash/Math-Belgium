import type {
  ExerciceCalculPrimitives,
  ExerciceFamilleA,
  ExerciceFamilleB,
  ExerciceFamilleC,
  ExerciceFamilleD,
  ExerciceFamilleE,
  ExerciceFamilleF,
  ExerciceFamilleG,
} from "../core6e/calculPrimitives.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction, diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen23` ("Calcul de primitives", chapitre 4). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `verificationCalculPrimitives.test.ts` (fixtures locales factices) et
 * `generateurs6e/calculPrimitives/session.integration.test.ts` (seul fichier autorisé Couche A +
 * Couche B) pour la preuve. Chaque `exercice: ExerciceCalculPrimitives` transporte déjà ses propres
 * closures de référence (`primitiveReference`, `uReference`, etc. — champs du contrat `core6e/`,
 * PAS un import de code) : ce fichier ne fait jamais que les ÉVALUER à des points choisis ici, sans
 * jamais recalculer la moindre formule fermée déjà connue de l'exercice.
 *
 * ============================================================================
 * **LE DÉFI CENTRAL DE CE CHAPITRE — vérifier une PRIMITIVE à une constante additive près**
 * ============================================================================
 * Une primitive n'est définie qu'à une constante près : comparer le texte élève à une chaîne fixe,
 * ou même à une référence par ÉGALITÉ point à point (comme `diagnostiquerEquivalenceFonction`,
 * conçue pour une simple EXPRESSION), rejetterait à tort toute primitive correcte à une constante
 * H≠0 près. **`diagnostiquerPrimitive`** ci-dessous est LA brique nouvelle de ce chapitre : au lieu
 * de dériver numériquement la réponse élève (bruité — pas de méthode de différences finies fiable
 * uniforme sur 7 familles aux domaines très différents : log, racines, singularités amovibles...),
 * elle exploite le fait que CE générateur connaît toujours une primitive CORRECTE fermée
 * (`referenceCorrecte`, construite par la Couche A) : elle échantillonne plusieurs points,
 * calcule l'ÉCART `texte(x) - referenceCorrecte(x)` à chacun, et vérifie que cet écart est LE MÊME
 * partout (à la tolérance près) — PAS forcément nul, juste CONSTANT. Toute primitive correcte à une
 * constante additive H près produit exactement cet écart constant=H ; toute réponse réellement
 * fausse produit un écart qui VARIE d'un point à l'autre (sauf coïncidence non générique, écartée
 * par le nombre de points échantillonnés). Voir aussi `diagnostiquerEcranFinalXxx` par famille
 * ci-dessous, tous bâtis sur cette même brique.
 *
 * ============================================================================
 * **CONTRAT DE RÉUTILISATION — familles A, B, C, G (lire avant de modifier ce fichier)**
 * ============================================================================
 * Voir l'en-tête de `core6e/calculPrimitives.types.ts` pour le contexte complet. Les fonctions
 * `diagnostiquerXxxEcranYyy`/`verifierXxxEcranYyy` pour A, B, C, G sont exportées avec des noms
 * STABLES et clairs — `6gen24`/`6gen25`/`6gen26` les importeront directement (Couche B ↔ Couche B,
 * réutilisation libre — CLAUDE.md) plutôt que de réimplémenter la logique de vérification.
 * `diagnostiquerPrimitive` elle-même (générique, indépendante de toute famille) est également
 * exportée pour un futur écran de primitive supplémentaire (ex. après ajout d'une constante C).
 *
 * ============================================================================
 * **Convention de signature — TOUS les écrans à champ(s) libre(s) prennent `string[]`, jamais un
 * objet nommé `{a,b}`** (contrairement à `verificationDeterminerParametresLogarithme.ts`, 6gen18) :
 * déviation délibérée, documentée ici — ce générateur compte ~24 écrans à travers 7 familles (contre
 * 8 pour 6gen18), une signature uniforme `string[]` permet un DISPATCHER GÉNÉRIQUE unique côté
 * `sessionCalculPrimitives.ts`/`App6gen23.tsx` (`diagnostiquerEcran(exercice, phase, valeurs)`)
 * plutôt que ~24 fonctions de soumission bespoke. Chaque fonction documente l'ORDRE attendu des
 * champs de son écran.
 *
 * ============================================================================
 * **Échantillonnage — domaine des points AUTO-DÉTECTÉ, jamais recalculé à la main par sous-type**
 * ============================================================================
 * `diagnostiquerPrimitive`/`diagnostiquerEquivalenceFonction`/`diagnostiquerExpressionMultiVariable`
 * SAUTENT déjà tout point où la RÉFÉRENCE n'est pas finie (domaine invalide) — voir leur code. Il
 * suffit donc de fournir des tableaux de candidats assez LARGES et assez NOMBREUX (`CANDIDATS_*`
 * ci-dessous) : les points hors domaine (pôle d'un 1/x, racine négative, etc. — qui dépendent des
 * paramètres TIRÉS aléatoirement, ex. le pôle `-b/a` de la famille C1) s'excluent d'eux-mêmes à
 * l'exécution, sans qu'aucune formule de domaine ne soit dupliquée ici depuis la Couche A. Seules 2
 * exceptions au besoin d'un domaine VRAIMENT différent : le sous-type "tangente" de la famille E
 * (restreint à x>0 par construction, voir `generateurs6e/calculPrimitives/familles/E.ts`) et
 * l'arcsin/√(1-u²) (nécessite u∈(-1,1)) — couverts par des tableaux de candidats dédiés
 * (`CANDIDATS_X_POSITIF`/points resserrés autour de 0).
 */

const TOLERANCE = 0.01;

// ============================================================================
// Briques génériques (voir en-tête de fichier).
// ============================================================================

/** LA brique centrale du chapitre — voir en-tête de fichier. Compare `texte` (fonction de
 * `variable`) à `referenceCorrecte` À UNE CONSTANTE ADDITIVE PRÈS : calcule l'écart à chaque point
 * comparable puis vérifie qu'il est LE MÊME PARTOUT (jamais comparé à 0). */
export function diagnostiquerPrimitive(texte: string, referenceCorrecte: (v: number) => number, points: number[], tolerance: number = TOLERANCE, variable: string = "x"): StatutVerification {
  const ecarts: number[] = [];
  for (const v of points) {
    const attendu = referenceCorrecte(v);
    if (!Number.isFinite(attendu)) continue;
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(texte, { [variable]: v });
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(soumis)) return "not_equivalent";
    ecarts.push(soumis - attendu);
  }
  const minimumRequis = Math.min(3, points.length);
  if (ecarts.length < minimumRequis) return "parse_error";
  const premier = ecarts[0];
  for (const e of ecarts) {
    if (Math.abs(e - premier) > tolerance) return "not_equivalent";
  }
  return "correct";
}

/** Compare un texte SANS "=" à une référence `(vars) => number` en plusieurs variables libres —
 * généralisation locale du même principe que `diagnostiquerExpressionMultiVariable` (6gen18),
 * réécrite ici pour rester self-contained (voir en-tête). Utilisée pour "poser la décomposition"
 * (famille G, vars {A,B[,C],x}) et pour tout champ "dx/du en fonction de x et du/dtheta" (familles
 * C/D/E). */
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

function pireStatut(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

// Candidats d'échantillonnage larges — voir en-tête de fichier ("domaine auto-détecté").
const CANDIDATS_X = [-5, -4, -3, -2, -1.7, -1.3, -0.85, -0.6, -0.35, 0.35, 0.6, 0.85, 1.3, 1.7, 2, 3, 4, 5];
const CANDIDATS_X_POSITIF = [0.15, 0.35, 0.6, 0.85, 1.2, 1.6, 2.1, 2.7, 3.4, 4.2, 5.1, 6.1, 7.2, 8.4];
const CANDIDATS_THETA = [-1.4, -1.2, -1, -0.8, -0.6, -0.4, -0.2, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4];
const CANDIDATS_DERIVEE = [1, 2, -1, 0.5, -2, 1.5];

/** Produit cartésien candA×candB — utilise la TOTALITÉ de `candA` (jamais un `.slice(0, n)`,
 * bug trouvé par TDD via `session.integration.test.ts` répété en boucle : `CANDIDATS_X` est trié
 * par ordre croissant, donc ses 8 premiers éléments sont TOUS négatifs — pour un domaine restreint
 * à x>0 comme la famille C sous-type 3, ce tronquage éliminait TOUS les points comparables du
 * couple (x,du) et produisait un `parse_error` systématique) : seul `candB` (la variable
 * différentielle, jamais contrainte par un domaine) reste limité pour garder le nombre de
 * combinaisons raisonnable. */
function echantillonsDeux(candA: number[], candB: number[], nomA: string, nomB: string): Record<string, number>[] {
  const echantillons: Record<string, number>[] = [];
  for (const a of candA) {
    for (const b of candB.slice(0, 3)) {
      echantillons.push({ [nomA]: a, [nomB]: b });
    }
  }
  return echantillons;
}

// ============================================================================
// Famille A — Primitives immédiates.
// ============================================================================

/** Sous-type "direct" — écran unique, expression F(x). */
export function diagnostiquerAEcranDirect(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, CANDIDATS_X);
}
export function verifierAEcranDirect(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcranDirect(exercice, valeurs) === "correct";
}

/** Écran 1 (sous-types "diviser*") — forme réécrite en somme de puissances de x. */
export function diagnostiquerAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "direct") return "parse_error";
  const points = exercice.sousType === "diviserProduit" ? CANDIDATS_X_POSITIF : CANDIDATS_X;
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.rewrittenReference, points);
}
export function verifierAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 (sous-types "diviser*") — primitive finale, à une constante près. */
export function diagnostiquerAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "direct") return "parse_error";
  const points = exercice.sousType === "diviserProduit" ? CANDIDATS_X_POSITIF : CANDIDATS_X;
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, points);
}
export function verifierAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B — Fonctions composées.
// ============================================================================

/** Écran 1 — valeurs[0]=u(x), valeurs[1]=u'(x). */
export function diagnostiquerBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  const su = diagnostiquerEquivalenceFonction(valeurs[0], exercice.uReference, CANDIDATS_X);
  const suP = diagnostiquerEquivalenceFonction(valeurs[1], exercice.uPrimeReference, CANDIDATS_X);
  return pireStatut(su, suP);
}
export function verifierBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — valeurs[0]=facteur d'ajustement (valeur numérique, exacte : k/mCoef). */
export function diagnostiquerBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.facteurAjustement, TOLERANCE);
}
export function verifierBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran2(exercice, valeurs) === "correct";
}

/** Points sûrs pour l'écran 3 (primitive finale) — 2 risques distincts corrigés ici (trouvés par
 * TDD, `session.integration.test.ts` répété en boucle) :
 * 1. `typeG==="invSqrtU"` (primitive en arcsin(u)) exige u(x)∈(-1,1) — un intervalle ÉTROIT,
 *    dépendant des paramètres tirés (m,n de la partie affine). `CANDIDATS_X` (large, jusqu'à ±5)
 *    n'y tombe presque jamais : balayage fin filtré sur `uReference` pour retrouver un intervalle
 *    sûr QUELS QUE SOIENT m,n, plutôt qu'une formule affine inversée dupliquée depuis la Couche A.
 * 2. `typeU==="puissance"` (u=x^p+c, p jusqu'à 3) combiné à `typeG==="expU"` produit des primitives
 *    de magnitude ASTRONOMIQUE (e^(x³) à x=4 ou 5) — `diagnostiquerPrimitive` compare les écarts à
 *    une TOLÉRANCE ABSOLUE (0,01) : à une magnitude pareille, le bruit de précision flottante
 *    (double IEEE754, ~15-17 chiffres significatifs) dépasse LARGEMENT cette tolérance à lui seul,
 *    même pour 2 évaluations de LA MÊME expression mathématique. Restreint aux petites magnitudes
 *    de x dans ce cas — aucun risque perdu pédagogiquement (le point n'est jamais la magnitude de
 *    x, juste la reconnaissance de la primitive composée). */
function pointsBEcran3(exercice: ExerciceFamilleB): number[] {
  if (exercice.typeG === "invSqrtU") {
    const candidats: number[] = [];
    for (let x = -8; x <= 8; x += 0.1) candidats.push(Math.round(x * 10) / 10);
    return candidats.filter((x) => Math.abs(exercice.uReference(x)) < 0.85);
  }
  if (exercice.typeU === "puissance") {
    return [-1.5, -1.1, -0.7, -0.3, 0.3, 0.7, 1.1, 1.5];
  }
  return CANDIDATS_X;
}

/** Écran 3 — valeurs[0]=primitive finale. */
export function diagnostiquerBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, pointsBEcran3(exercice));
}
export function verifierBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille C — Substitution algébrique manuelle.
// ============================================================================

const CANDIDATS_U_POSITIF = CANDIDATS_X_POSITIF;

function necessiteXDeU(sousType: ExerciceFamilleC["sousType"]): boolean {
  return sousType === "1" || sousType === "3";
}

/** Écran 1 — ordre des champs : [u, x(u) SI le sous-type le nécessite (1 et 3 seulement, voir
 * `necessiteXDeU`), dx] — donc `valeurs.length` vaut 3 pour les sous-types 1/3, 2 pour 2/4. `dx`
 * est vérifié en fonction de {x, du} (dx = du / u'(x), toujours exprimable ainsi quel que soit le
 * sous-type). */
export function diagnostiquerCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  const avecXDeU = necessiteXDeU(exercice.sousType);
  const texteU = valeurs[0];
  const texteDx = avecXDeU ? valeurs[2] : valeurs[1];

  const su = diagnostiquerEquivalenceFonction(texteU, exercice.uReference, CANDIDATS_X);

  let sx: StatutVerification = "correct";
  if (avecXDeU) {
    const xDeU = (exercice as { xDeUReference: (u: number) => number }).xDeUReference;
    const pointsU = exercice.sousType === "3" ? CANDIDATS_U_POSITIF : CANDIDATS_X_POSITIF;
    sx = diagnostiquerEquivalenceFonction(valeurs[1], xDeU, pointsU, TOLERANCE, "u");
  }

  const uPrime = exercice.uPrimeReference;
  const echantillonsDx = echantillonsDeux(CANDIDATS_X, CANDIDATS_DERIVEE, "x", "du");
  const sdx = diagnostiquerExpressionMultiVariable(texteDx, ({ x, du }) => du / uPrime(x), echantillonsDx);

  return pireStatut(su, sx, sdx);
}
export function verifierCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran1(exercice, valeurs) === "correct";
}

function pointsUPourC(exercice: ExerciceFamilleC): number[] {
  if (exercice.sousType === "1" || exercice.sousType === "3") return CANDIDATS_U_POSITIF;
  if (exercice.sousType === "4") return CANDIDATS_X_POSITIF;
  return CANDIDATS_X;
}

/** Écran 2 — valeurs[0] = intégrale réécrite en u (expression, variable "u"). */
export function diagnostiquerCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.integrandeEnUReference, pointsUPourC(exercice), TOLERANCE, "u");
}
export function verifierCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — valeurs[0] = primitive en u, à une constante près (variable "u"). */
export function diagnostiquerCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveEnUReference, pointsUPourC(exercice), TOLERANCE, "u");
}
export function verifierCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran3(exercice, valeurs) === "correct";
}

function pointsXPourC(exercice: ExerciceFamilleC): number[] {
  if (exercice.sousType === "1") return [-exercice.b / exercice.a + 0.3, -exercice.b / exercice.a + 0.7, -exercice.b / exercice.a + 1.2, -exercice.b / exercice.a + 2, -exercice.b / exercice.a + 3, -exercice.b / exercice.a + 4];
  if (exercice.sousType === "2") return exercice.cyclo === "arcsin" ? [-0.8, -0.4, 0.2, 0.5, 0.7] : CANDIDATS_X;
  if (exercice.sousType === "3") return CANDIDATS_X_POSITIF;
  return CANDIDATS_X;
}

/** Écran 4 — valeurs[0] = expression finale en x, à une constante près. */
export function diagnostiquerCEcran4(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, pointsXPourC(exercice));
}
export function verifierCEcran4(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran4(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille D — Intégration par parties.
// ============================================================================

type ExerciceFamilleD_NonDirect = Exclude<ExerciceFamilleD, { sousType: "5" }>;

/** Sous-type 5 — écran unique direct, valeurs[0] = F(x). */
export function diagnostiquerDEcranDirect(exercice: ExerciceFamilleD, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, CANDIDATS_X);
}
export function verifierDEcranDirect(exercice: ExerciceFamilleD, valeurs: string[]): boolean {
  return diagnostiquerDEcranDirect(exercice, valeurs) === "correct";
}

function pointsXPourD(exercice: ExerciceFamilleD_NonDirect): number[] {
  return exercice.sousType === "3" && exercice.cyclo === "ln" ? CANDIDATS_X_POSITIF : CANDIDATS_X;
}

/** Écran 1 — valeurs=[u, g] (g = second facteur, tel que dv=g(x)dx). */
export function diagnostiquerDEcran1(exercice: ExerciceFamilleD_NonDirect, valeurs: string[]): StatutVerification {
  const points = pointsXPourD(exercice);
  const su = diagnostiquerEquivalenceFonction(valeurs[0], exercice.uReference, points);
  const sg = diagnostiquerEquivalenceFonction(valeurs[1], exercice.gReference, points);
  return pireStatut(su, sg);
}
export function verifierDEcran1(exercice: ExerciceFamilleD_NonDirect, valeurs: string[]): boolean {
  return diagnostiquerDEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — valeurs=[du, v] ; du exprimé en fonction de {x, dx} (du = u'(x)·dx). */
export function diagnostiquerDEcran2(exercice: ExerciceFamilleD_NonDirect, valeurs: string[]): StatutVerification {
  const points = pointsXPourD(exercice);
  const uPrime = exercice.uPrimeReference;
  const echantillonsDu = echantillonsDeux(points, CANDIDATS_DERIVEE, "x", "dx");
  const sdu = diagnostiquerExpressionMultiVariable(valeurs[0], ({ x, dx }) => uPrime(x) * dx, echantillonsDu);
  const sv = diagnostiquerEquivalenceFonction(valeurs[1], exercice.vReference, points);
  return pireStatut(sdu, sv);
}
export function verifierDEcran2(exercice: ExerciceFamilleD_NonDirect, valeurs: string[]): boolean {
  return diagnostiquerDEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — valeurs=[uv, nouvel intégrande (v·u', SANS signe)]. */
export function diagnostiquerDEcran3(exercice: ExerciceFamilleD_NonDirect, valeurs: string[]): StatutVerification {
  const points = pointsXPourD(exercice);
  const suv = diagnostiquerEquivalenceFonction(valeurs[0], exercice.uvReference, points);
  const svdu = diagnostiquerEquivalenceFonction(valeurs[1], exercice.integrandeVduReference, points);
  return pireStatut(suv, svdu);
}
export function verifierDEcran3(exercice: ExerciceFamilleD_NonDirect, valeurs: string[]): boolean {
  return diagnostiquerDEcran3(exercice, valeurs) === "correct";
}

/** Écran 4 — valeurs[0] = expression finale, à une constante près. */
export function diagnostiquerDEcran4(exercice: ExerciceFamilleD_NonDirect, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, pointsXPourD(exercice));
}
export function verifierDEcran4(exercice: ExerciceFamilleD_NonDirect, valeurs: string[]): boolean {
  return diagnostiquerDEcran4(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille E — Substitution trigonométrique.
// ============================================================================

/** Écran 1 — valeurs=[x(θ), dx] ; dx exprimé en fonction de {theta, dtheta}. */
export function diagnostiquerEEcran1(exercice: ExerciceFamilleE, valeurs: string[]): StatutVerification {
  const sx = diagnostiquerEquivalenceFonction(valeurs[0], exercice.xDeThetaReference, CANDIDATS_THETA, TOLERANCE, "theta");
  const coef = exercice.dxCoefReference;
  const echantillons = echantillonsDeux(CANDIDATS_THETA, CANDIDATS_DERIVEE, "theta", "dtheta");
  const sdx = diagnostiquerExpressionMultiVariable(valeurs[1], ({ theta, dtheta }) => coef(theta) * dtheta, echantillons);
  return pireStatut(sx, sdx);
}
export function verifierEEcran1(exercice: ExerciceFamilleE, valeurs: string[]): boolean {
  return diagnostiquerEEcran1(exercice, valeurs) === "correct";
}

function pointsThetaPourE(exercice: ExerciceFamilleE): number[] {
  return exercice.sousType === "tangente" ? CANDIDATS_THETA.filter((t) => Math.abs(t) > 0.15) : CANDIDATS_THETA;
}

/** Écran 2 — valeurs[0] = expression simplifiée en θ (variable "theta"). */
export function diagnostiquerEEcran2(exercice: ExerciceFamilleE, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.expressionSimplifieeThetaReference, pointsThetaPourE(exercice), TOLERANCE, "theta");
}
export function verifierEEcran2(exercice: ExerciceFamilleE, valeurs: string[]): boolean {
  return diagnostiquerEEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — valeurs[0] = primitive en θ, à une constante près (variable "theta"). */
export function diagnostiquerEEcran3(exercice: ExerciceFamilleE, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveThetaReference, pointsThetaPourE(exercice), TOLERANCE, "theta");
}
export function verifierEEcran3(exercice: ExerciceFamilleE, valeurs: string[]): boolean {
  return diagnostiquerEEcran3(exercice, valeurs) === "correct";
}

function pointsXPourE(exercice: ExerciceFamilleE): number[] {
  if (exercice.sousType === "sinus") return [-0.8, -0.5, -0.2, 0.2, 0.5, 0.8].map((f) => f * exercice.a);
  return CANDIDATS_X_POSITIF;
}

/** Écran 4 — valeurs[0] = expression finale en x, à une constante près. */
export function diagnostiquerEEcran4(exercice: ExerciceFamilleE, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, pointsXPourE(exercice));
}
export function verifierEEcran4(exercice: ExerciceFamilleE, valeurs: string[]): boolean {
  return diagnostiquerEEcran4(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille F — Identités trigonométriques.
// ============================================================================

function pointsXPourF(exercice: ExerciceFamilleF): number[] {
  return exercice.sousType === "tan" ? [-0.9, -0.6, -0.3, 0.3, 0.6, 0.9] : exercice.sousType === "pythagoreanFactor" ? [0.5, 1, 1.5, 2, 2.5, 2.9] : CANDIDATS_X;
}

/** Écran 1 — valeurs[0] = forme réécrite. */
export function diagnostiquerFEcran1(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.rewrittenReference, pointsXPourF(exercice));
}
export function verifierFEcran1(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — valeurs[0] = expression finale, à une constante près. */
export function diagnostiquerFEcran2(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, pointsXPourF(exercice));
}
export function verifierFEcran2(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille G — Décomposition en éléments simples.
// ============================================================================

type ExerciceFamilleG_Propre = Exclude<ExerciceFamilleG, { sousType: "2" }>;

function pointsXPourG(exercice: ExerciceFamilleG): number[] {
  if (exercice.sousType === "1") return CANDIDATS_X.filter((x) => x !== exercice.r1 && x !== exercice.r2);
  if (exercice.sousType === "2") return CANDIDATS_X.filter((x) => x !== exercice.r);
  if (exercice.sousType === "3") return CANDIDATS_X.filter((x) => x !== 0);
  return CANDIDATS_X;
}

/** Écran 1 (sous-type "2" uniquement) — valeurs=[quotient, reste]. */
export function diagnostiquerGEcran1(exercice: ExerciceFamilleG, valeurs: string[]): StatutVerification {
  if (exercice.sousType !== "2") return "parse_error";
  const points = pointsXPourG(exercice);
  const sq = diagnostiquerEquivalenceFonction(valeurs[0], exercice.quotientReference, points);
  const sr = diagnostiquerEquivalenceFonction(valeurs[1], exercice.resteReference, points);
  return pireStatut(sq, sr);
}
export function verifierGEcran1(exercice: ExerciceFamilleG, valeurs: string[]): boolean {
  return diagnostiquerGEcran1(exercice, valeurs) === "correct";
}

/** Coefficients "libres" présents dans la décomposition posée par sous-type (utilisés pour
 * l'échantillonnage multi-variable des écrans 2/3). MINUSCULES obligatoire : le tokeniseur partagé
 * (`expressionExponentielle.ts`) met TOUT identifiant en minuscule avant de le chercher dans
 * `variables` — passer des clés majuscules ("A") ferait échouer la recherche pour un identifiant
 * élève "A" (lu "a") avec un vrai `parse_error` silencieux (bug trouvé et corrigé via TDD, voir
 * `verificationCalculPrimitives.test.ts`). Les libellés affichés à l'élève (`ui6e/
 * formatCalculPrimitives.ts`, "A =", "B =") restent en MAJUSCULE — purement cosmétique, sans effet
 * puisque l'évaluateur est insensible à la casse pour tout identifiant. */
function nomsCoefficients(sousType: ExerciceFamilleG["sousType"]): string[] {
  if (sousType === "3") return ["a", "b", "c"];
  if (sousType === "4") return ["h", "m"];
  return ["a"]; // sous-types 1 et 2 : "a","b" pour 1, juste "a" pour 2 — voir override ci-dessous.
}

/** Écran 2 — valeurs[0] = forme de décomposition posée (variables a,b[,c ou h,m],x — voir
 * `nomsCoefficients` pour la casse). */
export function diagnostiquerGEcran2(exercice: ExerciceFamilleG, valeurs: string[]): StatutVerification {
  const points = pointsXPourG(exercice);
  const noms = exercice.sousType === "1" ? ["a", "b"] : nomsCoefficients(exercice.sousType);
  const candidatsCoef = [2, -1, 3, 0.5, -2];
  const echantillons: Record<string, number>[] = [];
  for (const x of points.slice(0, 6)) {
    for (let i = 0; i < 4; i++) {
      const vars: Record<string, number> = { x };
      for (const nom of noms) vars[nom] = candidatsCoef[(i + noms.indexOf(nom)) % candidatsCoef.length];
      // Le sous-type 4 exige m>0 (rayon) — jamais nul ni négatif dans la forme posée.
      if (exercice.sousType === "4") vars.m = Math.abs(vars.m) + 0.5;
      echantillons.push(vars);
    }
  }
  return diagnostiquerExpressionMultiVariable(valeurs[0], exercice.decompositionReference, echantillons);
}
export function verifierGEcran2(exercice: ExerciceFamilleG, valeurs: string[]): boolean {
  return diagnostiquerGEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — coefficients indéterminés, un champ par coefficient réel (2 pour 1/4, 3 pour 3 — le
 * sous-type 2 réutilise l'écran 3 pour LE SEUL coefficient A, voir `sessionCalculPrimitives.ts`
 * pour l'ordre exact des champs par sous-type). Chaque champ vérifié INDÉPENDAMMENT
 * (`diagnostiquerValeur`, spec point 6) plutôt qu'en bloc — combinés ici en un seul statut (pire
 * des deux) pour rester cohérent avec le reste du fichier ; un futur écran pourrait vouloir le
 * détail par champ, laissé pour plus tard si besoin (pas demandé par la spec actuelle). */
export function diagnostiquerGEcran3(exercice: ExerciceFamilleG, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "1") return pireStatut(diagnostiquerValeur(valeurs[0], exercice.A), diagnostiquerValeur(valeurs[1], exercice.B));
  if (exercice.sousType === "2") return diagnostiquerValeur(valeurs[0], exercice.e);
  if (exercice.sousType === "3") return pireStatut(diagnostiquerValeur(valeurs[0], exercice.A), diagnostiquerValeur(valeurs[1], exercice.B), diagnostiquerValeur(valeurs[2], exercice.C));
  return pireStatut(diagnostiquerValeur(valeurs[0], exercice.h), diagnostiquerValeur(valeurs[1], exercice.m));
}
export function verifierGEcran3(exercice: ExerciceFamilleG, valeurs: string[]): boolean {
  return diagnostiquerGEcran3(exercice, valeurs) === "correct";
}

/** Écran 4 — valeurs[0] = expression finale, à une constante près. */
export function diagnostiquerGEcran4(exercice: ExerciceFamilleG, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, pointsXPourG(exercice));
}
export function verifierGEcran4(exercice: ExerciceFamilleG, valeurs: string[]): boolean {
  return diagnostiquerGEcran4(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique (voir en-tête de fichier, "Convention de signature").
// ============================================================================
import type { PhaseCalculPrimitives } from "./typesCalculPrimitives";

/** UNE SEULE fonction de vérification par écran, quel que soit `exercice.famille`/`phase` — le
 * dispatcher que `sessionCalculPrimitives.ts` ET `App6gen23.tsx` (retour visuel live) appellent
 * tous les deux, plutôt que ~24 fonctions de soumission bespoke (voir en-tête de fichier). */
export function diagnostiquerEcran(exercice: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcranDirect":
      return diagnostiquerAEcranDirect(exercice as ExerciceFamilleA, valeurs);
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceFamilleA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceFamilleA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceFamilleB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceFamilleB, valeurs);
    case "bEcran3":
      return diagnostiquerBEcran3(exercice as ExerciceFamilleB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceFamilleC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceFamilleC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceFamilleC, valeurs);
    case "cEcran4":
      return diagnostiquerCEcran4(exercice as ExerciceFamilleC, valeurs);
    case "dEcranDirect":
      return diagnostiquerDEcranDirect(exercice as ExerciceFamilleD, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceFamilleD_NonDirect, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceFamilleD_NonDirect, valeurs);
    case "dEcran3":
      return diagnostiquerDEcran3(exercice as ExerciceFamilleD_NonDirect, valeurs);
    case "dEcran4":
      return diagnostiquerDEcran4(exercice as ExerciceFamilleD_NonDirect, valeurs);
    case "eEcran1":
      return diagnostiquerEEcran1(exercice as ExerciceFamilleE, valeurs);
    case "eEcran2":
      return diagnostiquerEEcran2(exercice as ExerciceFamilleE, valeurs);
    case "eEcran3":
      return diagnostiquerEEcran3(exercice as ExerciceFamilleE, valeurs);
    case "eEcran4":
      return diagnostiquerEEcran4(exercice as ExerciceFamilleE, valeurs);
    case "fEcran1":
      return diagnostiquerFEcran1(exercice as ExerciceFamilleF, valeurs);
    case "fEcran2":
      return diagnostiquerFEcran2(exercice as ExerciceFamilleF, valeurs);
    case "gEcran1":
      return diagnostiquerGEcran1(exercice as ExerciceFamilleG, valeurs);
    case "gEcran2":
      return diagnostiquerGEcran2(exercice as ExerciceFamilleG, valeurs);
    case "gEcran3":
      return diagnostiquerGEcran3(exercice as ExerciceFamilleG, valeurs);
    case "gEcran4":
      return diagnostiquerGEcran4(exercice as ExerciceFamilleG, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}

// Réexport pour usage direct par un futur générateur (voir en-tête).
export { diagnostiquerEquivalenceFonction, diagnostiquerValeur, evaluerExpressionExponentielle };
export type { ExerciceCalculPrimitives, ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleD, ExerciceFamilleE, ExerciceFamilleF, ExerciceFamilleG, ExerciceFamilleG_Propre };
