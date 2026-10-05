/**
 * Couche B — vérifications partagées entre les générateurs "triangle quelconque" du chapitre 3
 * (loi des sinus, loi des cosinus, aire, problèmes contextualisés — et le futur générateur 6,
 * cas ambigu SSA). Même principe de partage que `verifierChampPrincipal`/`verifierRacines`
 * (exercice 1) réutilisées par cinq autres générateurs : une seule primitive de vérification par
 * substitution algébrique, plutôt que redéveloppée indépendamment dans chaque générateur.
 *
 * Les étapes "écriture de la relation"/"formule"/"isoler l'inconnue" de ces générateurs demandent à
 * l'élève d'écrire une ÉQUATION en LETTRES (a,b,c,A,B,C — voir `core/triangle.types.ts`), jamais une
 * valeur numérique directement. Vérifiée en deux temps : (1) les lettres attendues doivent
 * apparaître explicitement (une relation numériquement vraie mais qui n'utilise pas les bonnes
 * lettres — ex. `a/sin(A)=c/sin(C)` alors que l'exercice porte sur b — est rejetée, même si les
 * trois rapports a/sinA=b/sinB=c/sinC sont TOUJOURS égaux entre eux pour un triangle valide) ; (2)
 * une fois les vraies valeurs numériques du triangle substituées à la place de chaque lettre
 * (jamais celles saisies par l'élève à une étape précédente), l'égalité doit être vraie —
 * `evaluerExpressionGenerale` (étendu au sin/cos/tan en degrés pour ce chapitre) accepte alors
 * n'importe quelle formulation algébriquement équivalente (ordre des membres, forme croisée
 * `a·sinB=b·sinA`, etc.), jamais une comparaison de chaînes.
 *
 * Une étape "substitution" distincte (loi des cosinus, aire — voir `diagnostiquerSubstitutionTriangle`)
 * exige au contraire que le membre droit ne contienne PLUS aucune lettre — l'élève y a déjà
 * remplacé chaque grandeur par sa vraie valeur numérique, contrairement aux deux étapes ci-dessus
 * qui restent purement symboliques.
 */
import { evaluerExpressionGenerale } from "./expressionGenerale";
import type { Triangle } from "../core/triangle.types";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE_EQUATION = 1e-6;
const LETTRES_TRIANGLE: (keyof Triangle)[] = ["a", "b", "c", "A", "B", "C"];

/**
 * Remplace chaque lettre AUTONOME (a,b,c,A,B,C) par la vraie valeur numérique du triangle —
 * jamais une lettre imbriquée dans un nom de fonction (`sin`/`cos`/`tan`/`abs`/`sqrt`/`cbrt`,
 * dont aucune lettre isolée ne peut être confondue avec a/b/c/A/B/C grâce au lookaround : `cos`
 * contient bien un `c`, mais toujours suivi d'une autre lettre, donc jamais capturé).
 */
function substituerLettresTriangle(texte: string, triangle: Triangle): string {
  let resultat = texte;
  for (const lettre of LETTRES_TRIANGLE) {
    const regex = new RegExp(`(?<![a-zA-Z])${lettre}(?![a-zA-Z])`, "g");
    resultat = resultat.replace(regex, `(${triangle[lettre]})`);
  }
  return resultat;
}

function echapperRegex(texte: string): string {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** `lettres` peut contenir de simples lettres ("a") ou une expression complète ("sin(B)", pour
 * l'étape "isoler l'inconnue" d'un angle) — les caractères spéciaux de regex (parenthèses...) sont
 * échappés avant construction du pattern, sans quoi "sin(B)" serait interprété comme "sin" suivi
 * d'un groupe capturant "B" (donc cherchant "sinB", jamais "sin(B)" littéral). */
function contientLettres(texte: string, lettres: string[]): boolean {
  return lettres.every((lettre) => new RegExp(`(?<![a-zA-Z])${echapperRegex(lettre)}(?![a-zA-Z])`).test(texte));
}

/**
 * Vérifie une équation en lettres contre le triangle réel : exige la structure "... = ...", les
 * lettres requises (`lettresRequises`, ex. `["a","A","b","B"]` pour une relation de la loi des
 * sinus portant sur a/A et b/B), puis l'égalité numérique une fois les lettres substituées.
 * Structure absente ou lettres manquantes ⟹ "not_equivalent" (rejet structurel délibéré, jamais un
 * échec de parsing — l'expression a bien pu être lue). Seule une exception de tokenisation/parsing
 * (parenthèse manquante, identifiant inconnu...) produit "parse_error".
 */
export function diagnostiquerEquationTriangle(texte: string, triangle: Triangle, lettresRequises: string[]): StatutVerification {
  const parties = texte.split("=");
  if (parties.length !== 2) return "not_equivalent";
  // Insensible aux espaces (ex. "sin( B )" doit être reconnu au même titre que "sin(B)").
  if (!contientLettres(texte.replace(/\s+/g, ""), lettresRequises)) return "not_equivalent";

  let gauche: number;
  let droite: number;
  try {
    gauche = evaluerExpressionGenerale(substituerLettresTriangle(parties[0], triangle), 0);
    droite = evaluerExpressionGenerale(substituerLettresTriangle(parties[1], triangle), 0);
  } catch {
    return "parse_error";
  }

  if (!Number.isFinite(gauche) || !Number.isFinite(droite)) return "not_equivalent";
  return Math.abs(gauche - droite) <= TOLERANCE_EQUATION ? "correct" : "not_equivalent";
}

export function verifierEquationTriangle(texte: string, triangle: Triangle, lettresRequises: string[]): boolean {
  return diagnostiquerEquationTriangle(texte, triangle, lettresRequises) === "correct";
}

/**
 * Étape "isoler l'inconnue" : en plus de l'égalité numérique (`diagnostiquerEquationTriangle`),
 * exige que `lettre` (l'inconnue — une simple lettre, ex. "b", ou une expression complète comme
 * "sin(B)" pour un angle dont on isole d'abord le sinus, voir "Loi des sinus", variante "angle")
 * soit seule d'un côté du "=" (comparaison insensible aux espaces, ex. "sin( B )" reste accepté) —
 * une équation vraie mais où l'inconnue reste mêlée à d'autres termes (ex. `b/sin(B) = a/sin(A)`
 * recopié tel quel plutôt que réellement isolé, `b = a·sin(B)/sin(A)`) ne compte pas comme "isolée".
 */
export function diagnostiquerIsolementTriangle(texte: string, triangle: Triangle, lettre: string): StatutVerification {
  const parties = texte.split("=");
  if (parties.length !== 2) return "not_equivalent";
  const cible = lettre.replace(/\s+/g, "");
  const isole = parties[0].replace(/\s+/g, "") === cible || parties[1].replace(/\s+/g, "") === cible;
  if (!isole) return "not_equivalent";
  return diagnostiquerEquationTriangle(texte, triangle, [lettre]);
}

export function verifierIsolementTriangle(texte: string, triangle: Triangle, lettre: string): boolean {
  return diagnostiquerIsolementTriangle(texte, triangle, lettre) === "correct";
}

/** "²"/"³" normalisés en "^2"/"^3" pour une comparaison littérale du membre gauche (ex. "a²" doit
 * être reconnu au même titre que "a^2") — `evaluerExpressionGenerale` les traite déjà de façon
 * équivalente à l'évaluation, mais une comparaison de CHAÎNE (membre gauche de "isoler"/
 * "substitution") a besoin de cette normalisation explicite au préalable. */
function normaliserExposant(texte: string): string {
  return texte.replace(/²/g, "^2").replace(/³/g, "^3");
}

function contientEncoreDesLettresTriangle(texte: string): boolean {
  return LETTRES_TRIANGLE.some((lettre) => new RegExp(`(?<![a-zA-Z])${lettre}(?![a-zA-Z])`).test(texte));
}

/**
 * Étape "substitution" (loi des cosinus, aire — jamais la loi des sinus, qui n'a pas cette étape
 * dédiée) : contrairement à `diagnostiquerEquationTriangle`/`diagnostiquerIsolementTriangle`, le
 * membre DROIT ne doit plus contenir AUCUNE lettre — l'élève a déjà remplacé chaque grandeur par sa
 * valeur numérique réelle (ex. `a² = 5² + 7² - 2·5·7·cos(60°)`, jamais `a² = b²+c²-2bc·cos(A)`
 * recopié tel quel). Le membre GAUCHE doit être structurellement identique à `cibleGauche` (ex.
 * `"a^2"` pour un côté, `"cos(A)"` pour un angle — reste symbolique, l'élève ne peut pas encore
 * connaître l'inconnue à ce stade), comparaison insensible aux espaces et aux exposants unicode.
 */
export function diagnostiquerSubstitutionTriangle(
  texte: string,
  cibleGauche: string,
  valeurCibleDroite: number,
): StatutVerification {
  const parties = texte.split("=");
  if (parties.length !== 2) return "not_equivalent";

  const gaucheNormalisee = normaliserExposant(parties[0]).replace(/\s+/g, "");
  const cibleNormalisee = normaliserExposant(cibleGauche).replace(/\s+/g, "");
  if (gaucheNormalisee !== cibleNormalisee) return "not_equivalent";

  if (contientEncoreDesLettresTriangle(parties[1])) return "not_equivalent";

  let droite: number;
  try {
    droite = evaluerExpressionGenerale(parties[1], 0);
  } catch {
    return "parse_error";
  }

  if (!Number.isFinite(droite)) return "not_equivalent";
  return Math.abs(droite - valeurCibleDroite) <= TOLERANCE_EQUATION ? "correct" : "not_equivalent";
}

export function verifierSubstitutionTriangle(texte: string, cibleGauche: string, valeurCibleDroite: number): boolean {
  return diagnostiquerSubstitutionTriangle(texte, cibleGauche, valeurCibleDroite) === "correct";
}

const TOLERANCE_ABSOLUE_MIN = 0.05;
const TOLERANCE_RELATIVE = 0.01;

/**
 * Calcul final : champ purement numérique, tolérance généreuse — l'élève arrondit ses calculs
 * intermédiaires (angle, sinus...) avant d'obtenir un résultat final, contrairement à
 * `diagnostiquerEquationTriangle` qui compare des expressions substituées avec les vraies valeurs
 * exactes. Tolérance relative (1% de la valeur attendue) en plus d'un plancher absolu (0,05), pour
 * rester cohérente aussi bien sur un petit angle que sur un grand côté/une grande aire.
 */
export function diagnostiquerCalculNumeriqueTriangle(valeur: number, attendu: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  const tolerance = Math.max(TOLERANCE_ABSOLUE_MIN, Math.abs(attendu) * TOLERANCE_RELATIVE);
  return Math.abs(valeur - attendu) <= tolerance ? "correct" : "not_equivalent";
}

export function verifierCalculNumeriqueTriangle(valeur: number, attendu: number): boolean {
  return diagnostiquerCalculNumeriqueTriangle(valeur, attendu) === "correct";
}
