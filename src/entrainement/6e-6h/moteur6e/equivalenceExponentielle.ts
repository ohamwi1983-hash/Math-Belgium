import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerExpressionExponentielle, evaluerValeurExponentielle } from "./expressionExponentielle";

/**
 * Couche B (6e) — vérifications par ÉCHANTILLONNAGE NUMÉRIQUE (jamais de bibliothèque d'algèbre
 * symbolique — aucune n'est installée sur ce projet, "Algebrite/mathjs" des specs source désigne
 * en réalité cette même convention déjà en place partout ailleurs sur la plateforme). Partagées
 * par les générateurs du chapitre 2 (6gen6 à 6gen11).
 */

const TOLERANCE_DEFAUT = 0.01;

/**
 * Compare un texte (fonction de `variable`) à une référence fermée `reference(v)`, en
 * échantillonnant à plusieurs points. Un point où la RÉFÉRENCE n'est pas finie (hors domaine réel)
 * est SAUTÉ (jamais comparé, quel que soit ce que produit la soumission à ce même point) —
 * vérifié en PREMIER, avant même de regarder la soumission : ce chapitre manipule beaucoup de
 * fonctions à domaine restreint (ln, sqrt, arccos), contrairement à `expressionCyclometrique.ts`
 * (chapitre 1) où ce cas n'était jamais rencontré en pratique. Si la référence EST finie à ce
 * point mais que la soumission ne l'est pas (NaN/Infinity), c'est un vrai désaccord —
 * `"not_equivalent"`, jamais `"parse_error"` (réservé aux erreurs de SYNTAXE, une exception levée
 * par le parseur).
 *
 * `variable` (additif, défaut `"x"`) — nom de la variable liée lors de l'évaluation ; absent chez
 * tous les appelants existants (6gen7/6gen8), comportement bit pour bit inchangé pour eux.
 * Introduit pour `6gen9` (famille B, écran "simplifier" — reste en x, n'en a pas besoin — voir
 * `diagnostiquerEquationDifference` ci-dessous pour le vrai besoin en variable `t`, famille C).
 */
export function diagnostiquerEquivalenceFonction(
  texte: string,
  reference: (x: number) => number,
  points: number[],
  tolerance: number = TOLERANCE_DEFAUT,
  variable: string = "x",
): StatutVerification {
  let comparables = 0;
  for (const x of points) {
    const attendu = reference(x);
    if (!Number.isFinite(attendu)) continue;
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(texte, { [variable]: x });
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(soumis)) return "not_equivalent";
    comparables++;
    if (Math.abs(soumis - attendu) > tolerance) return "not_equivalent";
  }
  const minimumRequis = Math.min(3, points.length);
  if (comparables < minimumRequis) return "parse_error";
  return "correct";
}

/** Compare une valeur numérique pure (texte sans variable) à une cible, tolérance fixe. */
export function diagnostiquerValeur(texte: string, cible: number, tolerance: number = TOLERANCE_DEFAUT): StatutVerification {
  const v = evaluerValeurExponentielle(texte);
  if (v === null) return "parse_error";
  return Math.abs(v - cible) <= tolerance ? "correct" : "not_equivalent";
}

/** Écart entre deux angles (radians) ramené dans ]−π ; π] : 0 ⟺ mêmes angles à 2kπ près. */
export function ecartAngulaire(a: number, b: number): number {
  const deuxPi = 2 * Math.PI;
  let d = (a - b) % deuxPi;
  if (d <= -Math.PI) d += deuxPi;
  if (d > Math.PI) d -= deuxPi;
  return d;
}

/** Diagnostic d'un ANGLE saisi (radians) : `correct` s'il désigne le même angle que la cible à 2kπ
 * près (audit 6e ch. 5 : θ + 2π, nθ non réduit, θ dans [0 ; 2π[ étaient refusés). `nonReduit` :
 * même angle mais hors de ]−π ; π] — à n'utiliser comme refus QUE si la consigne exige cet
 * intervalle (message sans tentative). `degres` : la saisie vaut la cible convertie en degrés. */
export function diagnostiquerAngle(
  texte: string,
  cible: number,
  tolerance: number = TOLERANCE_DEFAUT,
): { statut: StatutVerification; nonReduit: boolean; degres: boolean } {
  const v = evaluerValeurExponentielle(texte);
  if (v === null) return { statut: "parse_error", nonReduit: false, degres: false };
  if (Math.abs(ecartAngulaire(v, cible)) <= tolerance) {
    return { statut: "correct", nonReduit: v <= -Math.PI + 1e-9 || v > Math.PI + 1e-9, degres: false };
  }
  const enDegres = (cible * 180) / Math.PI;
  const degres = Math.abs(ecartAngulaire((v * Math.PI) / 180, cible)) <= tolerance && Math.abs(v - cible) > tolerance && Math.abs(enDegres) > 1e-9;
  return { statut: "not_equivalent", nonReduit: false, degres };
}

/** Compare un ENSEMBLE de textes (valeurs numériques pures) à un ensemble de valeurs cibles —
 * ordre indifférent, gère nativement le cas liste vide (0 solution). */
export function diagnostiquerEnsembleValeurs(textes: string[], cible: number[], tolerance: number = TOLERANCE_DEFAUT): StatutVerification {
  if (textes.length !== cible.length) return "not_equivalent";
  const valeurs: number[] = [];
  for (const t of textes) {
    const v = evaluerValeurExponentielle(t);
    if (v === null) return "parse_error";
    valeurs.push(v);
  }
  const restantes = [...cible];
  for (const v of valeurs) {
    const index = restantes.findIndex((c) => Math.abs(c - v) <= tolerance);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

const SYMBOLES_COMPARAISON = ["<=", ">=", "≤", "≥", "=", "<", ">"] as const;

/** Sépare un texte "A op B" en `{gauche, droite, symbole}` — cherche le PREMIER symbole de
 * comparaison rencontré (`<=`/`>=` avant `<`/`>` pour ne jamais couper un opérateur à 2
 * caractères en deux). `null` si aucun symbole trouvé. */
export function separerEquationTexte(texte: string): { gauche: string; droite: string; symbole: string } | null {
  for (const s of SYMBOLES_COMPARAISON) {
    const i = texte.indexOf(s);
    if (i !== -1) {
      return { gauche: texte.slice(0, i), droite: texte.slice(i + s.length), symbole: s };
    }
  }
  return null;
}

/** Compare une équation/inéquation TEXTE ("A op B") à une référence des deux côtés — vérifie que
 * les DEUX membres sont algébriquement équivalents à `referenceGauche`/`referenceDroite`
 * (échantillonnage), indépendamment du symbole (voir `verifierSymboleEquation` séparée pour ça) —
 * jamais un seul champ combiné, pour pouvoir diagnostiquer côté gauche/droit séparément si besoin
 * un jour ; ici combinés en un seul statut, `"parse_error"` prioritaire. */
export function diagnostiquerEquationTexte(
  texte: string,
  referenceGauche: (x: number) => number,
  referenceDroite: (x: number) => number,
  points: number[],
  tolerance: number = TOLERANCE_DEFAUT,
): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";
  const statutGauche = diagnostiquerEquivalenceFonction(separe.gauche, referenceGauche, points, tolerance);
  if (statutGauche === "parse_error") return "parse_error";
  const statutDroite = diagnostiquerEquivalenceFonction(separe.droite, referenceDroite, points, tolerance);
  if (statutDroite === "parse_error") return "parse_error";
  if (statutGauche === "not_equivalent" || statutDroite === "not_equivalent") return "not_equivalent";
  return "correct";
}

/**
 * Compare une équation TEXTE ("A op B") à une référence exprimée comme la DIFFÉRENCE gauche−droite
 * — contrairement à `diagnostiquerEquationTexte` (qui exige que gauche/droite correspondent
 * SÉPARÉMENT à 2 références fixes), cette variante accepte n'importe quel déplacement de termes
 * d'un côté à l'autre de l'égalité (ex. "A=B" aussi bien que "A-B=0"), tant que gauche−droite reste
 * ALGÉBRIQUEMENT IDENTIQUE à `referenceDifference` — nécessaire pour l'écran "poser l'équation en
 * t" de `6gen9` (famille C, "Changement de variable") : le second membre affiché à l'élève varie
 * selon le style de présentation (0 pour "direct"/"carreDeguise", D pour "regroupement") sans que
 * cela change la substitution algébrique attendue, et la comparaison gauche/droite séparée de
 * `diagnostiquerEquationTexte` rejetterait à tort un simple déplacement de terme légitime.
 * `variable` (jamais implicite "x" comme `diagnostiquerEquationTexte`) : nom de la variable liée
 * lors de l'évaluation des deux membres (ex. "t").
 */
export function diagnostiquerEquationDifference(
  texte: string,
  variable: string,
  referenceDifference: (v: number) => number,
  points: number[],
  tolerance: number = TOLERANCE_DEFAUT,
): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";
  let comparables = 0;
  for (const v of points) {
    const attendu = referenceDifference(v);
    if (!Number.isFinite(attendu)) continue;
    let gauche: number;
    let droite: number;
    try {
      gauche = evaluerExpressionExponentielle(separe.gauche, { [variable]: v });
      droite = evaluerExpressionExponentielle(separe.droite, { [variable]: v });
    } catch {
      return "parse_error";
    }
    const diff = gauche - droite;
    if (!Number.isFinite(diff)) return "not_equivalent";
    comparables++;
    if (Math.abs(diff - attendu) > tolerance) return "not_equivalent";
  }
  const minimumRequis = Math.min(3, points.length);
  if (comparables < minimumRequis) return "parse_error";
  return "correct";
}

/**
 * Variante de `diagnostiquerEquationDifference` qui accepte aussi tout MULTIPLE NON NUL de la
 * différence de référence : gauche−droite doit valoir λ·`referenceDifference` pour un même λ≠0 à
 * tous les points échantillonnés. Couvre les membres inversés (λ=−1) et une équation divisée ou
 * multipliée par une constante (« t²−4t+3=0 » pour « 2t²−8t+6=0 ») — ajoutée pour `6gen14`, les
 * fonctions existantes ci-dessus restent inchangées pour leurs autres appelants.
 * λ est estimé par moindres carrés, puis chaque point est contrôlé avec une tolérance mise à
 * l'échelle de |λ|. Si la référence est identiquement nulle (identité « 0=0 »), la différence doit
 * l'être aussi.
 */
export function diagnostiquerEquationProportionnelle(
  texte: string,
  variable: string,
  referenceDifference: (v: number) => number,
  points: number[],
  tolerance: number = TOLERANCE_DEFAUT,
): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";
  const diffs: number[] = [];
  const refs: number[] = [];
  for (const v of points) {
    const attendu = referenceDifference(v);
    if (!Number.isFinite(attendu)) continue;
    let gauche: number;
    let droite: number;
    try {
      gauche = evaluerExpressionExponentielle(separe.gauche, { [variable]: v });
      droite = evaluerExpressionExponentielle(separe.droite, { [variable]: v });
    } catch {
      return "parse_error";
    }
    const diff = gauche - droite;
    if (!Number.isFinite(diff)) return "not_equivalent";
    diffs.push(diff);
    refs.push(attendu);
  }
  if (diffs.length < Math.min(3, points.length)) return "parse_error";
  const normeRef = Math.max(...refs.map((r) => Math.abs(r)));
  if (normeRef <= tolerance) {
    return diffs.every((d) => Math.abs(d) <= tolerance) ? "correct" : "not_equivalent";
  }
  let produit = 0;
  let carre = 0;
  for (let i = 0; i < refs.length; i++) {
    produit += diffs[i] * refs[i];
    carre += refs[i] * refs[i];
  }
  const lambda = produit / carre;
  if (Math.abs(lambda) < 1e-6) return "not_equivalent";
  const toleranceEchelle = tolerance * Math.max(1, Math.abs(lambda));
  for (let i = 0; i < refs.length; i++) {
    if (Math.abs(diffs[i] - lambda * refs[i]) > toleranceEchelle) return "not_equivalent";
  }
  return "correct";
}

export { evaluerExpressionExponentielle };
