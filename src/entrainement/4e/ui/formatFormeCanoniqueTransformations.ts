import type { ExerciceFormeCanoniqueTransformation } from "../core/formeCanoniqueTransformations.types";
import type { FonctionCanonique } from "../moteur/verificationFormeCanoniqueTransformations";
import type { ParametresCourbe } from "./mafsTransformation";

export interface FormeGenerale {
  a: number;
  b: number;
  c: number;
  /** ax²+bx+c = (a·x²+b·x+c)/denominateur — toujours >= 1. */
  denominateur: number;
}

/**
 * A,B,C,cv entiers tels que ax²+bx+c = (A·x²+B·x+C)/cv (section 1 de la spec : b=-2·a·xS,
 * c=a·xS²+yS avec a=±ev/cv) — exprimé ici comme une fraction EXACTE sur cv plutôt qu'en flottant
 * (a=ev/cv peut être un décimal périodique, ex. 2/3) : A=±ev, B=-2·A·xS, C=A·xS²+yS·cv sont tous
 * des entiers purs, garantissant un rendu LaTeX toujours exact et une cohérence parfaite avec la
 * forme canonique a(x-xS)²+yS (jamais un décimal arrondi, même convention que le reste du projet).
 */
export function calculerFormeGenerale(exercice: ExerciceFormeCanoniqueTransformation): FormeGenerale {
  const { xS, yS, ev, cv, sox } = exercice;
  const a = sox ? -ev : ev;
  const b = -2 * a * xS;
  const c = a * xS * xS + yS * cv;
  return { a, b, c, denominateur: cv };
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/** Réduit numerateur/denominateur par leur PGCD — 0 réduit toujours à 0/1. */
function reduireFraction(numerateur: number, denominateur: number): { n: number; d: number } {
  if (numerateur === 0) return { n: 0, d: 1 };
  const diviseur = pgcd(Math.abs(numerateur), denominateur);
  return { n: numerateur / diviseur, d: denominateur / diviseur };
}

/**
 * Rendu LaTeX d'un coefficient déjà réduit — entier nu si `d===1`, sinon `\frac{|n|}{d}` (le signe
 * est toujours géré séparément par l'appelant, jamais inclus ici). Partagé par les 3 termes de
 * `formatFormeGeneraleLatex` (chacun réduit indépendamment sur `cv`, point 1a du prompt de refonte
 * — jamais une seule fraction globale englobant toute l'expression) et par
 * `formatFonctionCanoniqueLatex` (coefficient `a` de la forme canonique).
 */
function formatCorpsFraction(n: number, d: number): string {
  const abs = Math.abs(n);
  return d === 1 ? `${abs}` : `\\frac{${abs}}{${d}}`;
}

/** ax² : coefficient 1/-1 jamais affiché littéralement (seulement si d=1, jamais si c'est une
 * vraie fraction de numérateur ±1 — ex. -1/3 doit rester "-\frac{1}{3}x^2", jamais "-x^2"). */
function formatTermeX2(n: number, d: number): string {
  const signe = n < 0 ? "-" : "";
  if (d === 1 && Math.abs(n) === 1) return `${signe}x^2`;
  return `${signe}${formatCorpsFraction(n, d)}x^2`;
}

/** bx : terme omis si b=0, coefficient 1/-1 jamais affiché littéralement (même nuance que
 * formatTermeX2 pour une vraie fraction de numérateur ±1), signe adapté. */
function formatTermeX(n: number, d: number): string {
  if (n === 0) return "";
  const signe = n > 0 ? "+" : "-";
  const coeff = d === 1 && Math.abs(n) === 1 ? "" : formatCorpsFraction(n, d);
  return ` ${signe} ${coeff}x`;
}

/** c : terme omis si c=0. */
function formatTermeConstant(n: number, d: number): string {
  if (n === 0) return "";
  return ` ${n > 0 ? "+" : "-"} ${formatCorpsFraction(n, d)}`;
}

/**
 * ax²+bx+c affiché au départ (étape 1, section 2 de la spec) — chaque coefficient (a, b, c) est
 * distribué et réduit INDÉPENDAMMENT sur `cv` (point 1a du prompt de refonte) : `A`, `B`, `C`
 * partagent le même dénominateur `cv` à la construction (`calculerFormeGenerale`), mais rien ne
 * garantit qu'ils partagent le même PGCD avec `cv` — un terme peut se réduire à un entier pendant
 * qu'un autre reste une fraction propre (voir `formatFormeCanoniqueTransformations.test.ts`, cas
 * `xS=3,yS=1,ev=2,cv=4,sox=false` : le terme en `x` devient l'entier `-3` alors que les termes en
 * `x²`/constant restent `1/2`/`11/2`). Jamais une seule fraction globale englobant toute
 * l'expression (l'ancien rendu `\frac{Ax²+Bx+C}{cv}` est abandonné).
 */
export function formatFormeGeneraleLatex(exercice: ExerciceFormeCanoniqueTransformation): string {
  const { a, b, c, denominateur } = calculerFormeGenerale(exercice);
  const termeA = reduireFraction(a, denominateur);
  const termeB = reduireFraction(b, denominateur);
  const termeC = reduireFraction(c, denominateur);
  const corps = `${formatTermeX2(termeA.n, termeA.d)}${formatTermeX(termeB.n, termeB.d)}${formatTermeConstant(termeC.n, termeC.d)}`;
  return `f(x) = ${corps}`;
}

/** (x-p)² développé : x nu si p=0 (jamais "(x-0)"), signe adapté — même convention que
 * formatTransformationsGraphiques.ts::formatCorpsCarre. */
function formatCorpsCarre(p: number): string {
  if (p === 0) return "x^2";
  const interieur = p > 0 ? `x - ${p}` : `x + ${-p}`;
  return `(${interieur})^2`;
}

/**
 * f(x) = a(x-p)²+q, rendu LaTeX à partir d'une `FonctionCanonique` exacte (`numA`/`denA` réduits
 * indépendamment du dénominateur de la forme générale — refonte, sections 2/3/4) : réutilisée pour
 * l'affichage persistant de la forme canonique complète (au-dessus du graphe, toutes étapes après
 * "canonique") et pour les légendes de la trace cumulative, qui doivent désormais toujours montrer
 * l'expression mathématique réelle de chaque courbe confirmée plutôt qu'un texte générique
 * (généralisation demandée par le prompt de refonte). Coefficient 1/-1 jamais affiché littéralement
 * SAUF s'il s'agit d'une vraie fraction de numérateur ±1 (même nuance que `formatTermeX2`), terme
 * `q` omis s'il est nul.
 */
export function formatFonctionCanoniqueLatex(fonction: FonctionCanonique): string {
  const { n, d } = reduireFraction(fonction.numA, fonction.denA);
  const signe = n < 0 ? "-" : "";
  const coeff = d === 1 && Math.abs(n) === 1 ? "" : formatCorpsFraction(n, d);
  const termeQ = fonction.q === 0 ? "" : ` ${fonction.q > 0 ? "+" : "-"} ${Math.abs(fonction.q)}`;
  return `f(x) = ${signe}${coeff}${formatCorpsCarre(fonction.p)}${termeQ}`;
}

/** Convertit une `FonctionCanonique` exacte en `ParametresCourbe` (p,q,a flottant) pour le rendu
 * numérique du graphe Mafs — `a` y perd son exactitude rationnelle (juste une valeur à tracer),
 * contrairement au numérateur/dénominateur exacts conservés par `FonctionCanonique` elle-même. */
export function fonctionCanoniqueVersParametresCourbe(fonction: FonctionCanonique): ParametresCourbe {
  return { p: fonction.p, q: fonction.q, a: fonction.numA / fonction.denA };
}
