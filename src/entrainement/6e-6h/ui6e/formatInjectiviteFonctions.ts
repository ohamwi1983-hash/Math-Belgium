import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import { formatAffineLatex, formatPuissanceMonomeLatex } from "../generateurs6e/injectiviteFonctions/formatFLatex";
import type { CoteBranche } from "../moteur6e/typesInjectiviteFonctions";
import { approxFractionLatex } from "./formatFraction";

// ============================================================================
// Affichage de f(x) — exposant entier négatif (familles a/c) affiché en fraction, exposant
// fractionnaire 1/n (famille b) affiché en racine n-ième, cumul (famille b, n<0) imbriquant les
// deux — jamais un exposant négatif ou fractionnaire littéral à l'écran (complément ciblé, voir
// historique-6e.md). `exercice.fLatex` (Couche A) reste la forme ALGÉBRIQUE brute — utilisée telle
// quelle par `membreDroiteAvecYPourX` ci-dessous (remplacement littéral "x"→"y", étape "après
// l'échange x/y" de la méthode de la réciproque) : cette fonction ne change QUE le rendu KaTeX, à
// appeler PARTOUT où `exercice.fLatex` serait sinon rendu directement — bloc données de l'écran 1
// ET chacune de ses réapparitions aux écrans 2 à 5 (jamais seulement le premier appel).
// ============================================================================

function formatPuissanceAffineAffichage(a: number, b: number, n: number): string {
  const base = formatAffineLatex(a, b);
  return n >= 0 ? `(${base})^{${n}}` : `\\dfrac{1}{(${base})^{${-n}}}`;
}

/** Racine |n|-ième : « \\sqrt{…} » pour l'indice 2 (jamais « \\sqrt[2]{…} »), « \\sqrt[3]{…} »… sinon. */
export function racineIndice(n: number, contenu: string): string {
  const m = Math.abs(n);
  return m === 2 ? `\\sqrt{${contenu}}` : `\\sqrt[${m}]{${contenu}}`;
}

function formatRacineNiemeAffichage(a: number, b: number, n: number): string {
  const base = formatAffineLatex(a, b);
  const racine = racineIndice(n, base);
  return n > 0 ? racine : `\\dfrac{1}{${racine}}`;
}

function formatPuissanceMonomeAffichage(a: number, b: number, n: number): string {
  if (n >= 0) return formatPuissanceMonomeLatex(a, b, n);
  const abs = Math.abs(a);
  const corpsFraction = abs === 1 ? `\\dfrac{1}{x^{${-n}}}` : `\\dfrac{${abs}}{x^{${-n}}}`;
  const premierTerme = a < 0 ? `-${corpsFraction}` : corpsFraction;
  if (b === 0) return premierTerme;
  return `${premierTerme} ${b > 0 ? "+" : "-"} ${Math.abs(b)}`;
}

/** Forme à AFFICHER de `f(x)` — à utiliser dans tout `<Katex expression={...} />` qui montrerait
 * sinon `exercice.fLatex` brut (voir en-tête ci-dessus). Familles d/e/f : aucun exposant entier
 * négatif ni fractionnaire possible, `exercice.fLatex` déjà correct tel quel. */
export function formatFLatexAffichage(exercice: ExerciceInjectiviteFonctions): string {
  const p = exercice.parametres;
  switch (p.famille) {
    case "puissanceAffine":
      return `f(x) = ${formatPuissanceAffineAffichage(p.a, p.b, p.n)}`;
    case "racineNieme":
      return `f(x) = ${formatRacineNiemeAffichage(p.a, p.b, p.n)}`;
    case "puissanceMonome":
      return `f(x) = ${formatPuissanceMonomeAffichage(p.a, p.b, p.n)}`;
    default:
      return exercice.fLatex;
  }
}

/**
 * Textes de consigne/aide pour `6gen1` (refonte totale — 5 écrans domaine → injective →
 * réciproque → image → bijection). `src/ui6e/` peut dépendre de `src/generateurs6e/` (Couche
 * présentation → Couche A, sens autorisé — voir CLAUDE.md, Architecture) : réutilise directement
 * `formatAffineLatex` déjà écrit côté générateur pour poser une équation/inéquation SANS la
 * résoudre (voir chaque fonction d'aide écran 1 ci-dessous).
 */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };
function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const CONSIGNE_GENERALE: FragmentConsigne[] = [texte("Étudie la fonction f suivante : domaine, injectivité, réciproque, image et bijection.")];

export const CONSIGNE_ECRAN_DOMAINE: FragmentConsigne[] = [texte("Détermine le domaine de définition de f.")];
export const CONSIGNE_ECRAN_INJECTIVE: FragmentConsigne[] = [texte("f est-elle injective sur son domaine de définition ?")];
export const CONSIGNE_SOUS_QUESTION_INTERVALLE: FragmentConsigne[] = [texte("Quel est le plus grand intervalle sur lequel f est injective ?")];
export const CONSIGNE_ECRAN_RECIPROQUE: FragmentConsigne[] = [texte("Détermine l'expression de la fonction réciproque "), latex("f^{-1}(x)"), texte(".")];
export const CONSIGNE_ECRAN_IMAGE: FragmentConsigne[] = [texte("Détermine l'image de f.")];
export const CONSIGNE_ECRAN_BIJECTION: FragmentConsigne[] = [texte("Complète la phrase suivante :")];
// échantillonnage numérique, `moteur6e/verificationInjectiviteFonctions.ts::diagnostiquerReciproque`,
// jamais une comparaison littérale — même principe que `referenceBReformuler`,
// `ui6e/formatLimitesLogarithmiques.ts`). Réplique EXACTEMENT la formule déjà documentée en
// en-tête de chaque `generateurs6e/injectiviteFonctions/familles/*.ts` (jamais une ré-dérivation
// indépendante) — utilisée UNIQUEMENT pour le bloc "état actuel" des écrans 4/5, jamais pour la
// vérification elle-même (qui reste `fInverseGauche`/`fInverseDroite`, Couche A).
// ============================================================================

/** x^{1/n} — racine n-ième de x si n>0, inverse de la racine |n|-ième si n<0. */
export function reciproqueRacineDeX(n: number): string {
  const racine = racineIndice(n, "x");
  return n > 0 ? racine : `\\dfrac{1}{${racine}}`;
}

/** Enveloppe `inner` dans une racine n-ième réelle (n>0) ou son inverse (n<0). */
export function reciproqueEnvelopperRacine(inner: string, n: number): string {
  const racine = racineIndice(n, inner);
  return n > 0 ? racine : `\\dfrac{1}{${racine}}`;
}

/** x^{n} — jamais un exposant négatif littéral (fraction si n<0, comme `formatFLatexAffichage`). */
export function reciproqueXPuissanceN(n: number): string {
  return n > 0 ? `x^{${n}}` : `\\dfrac{1}{x^{${-n}}}`;
}

/** `terme` (déjà signé) moins la constante b — jamais de double signe : "- b" si b>0, "+ |b|" si
 * b<0, rien si b=0. */
export function reciproqueMoinsConstante(terme: string, b: number): string {
  if (b === 0) return terme;
  return b > 0 ? `${terme} - ${b}` : `${terme} + ${Math.abs(b)}`;
}

/** Même principe que `reciproqueMoinsConstante`, mais pour une constante non nécessairement
 * entière — `k=c-b²/(4a)` (borne de l'image d'une famille "quadratique") a un dénominateur ALLANT
 * JUSQU'À `4|a|` (≤20 ici, a∈[-5;5]\{0}), au-delà du maxDenominateur par défaut de
 * `approxFractionLatex` (12) : sans ce paramètre explicite, certains tirages retombaient sur le
 * filet de sécurité flottant brut de `approxFractionLatex` (ex. `k=-3.0625=-49/16`), violation de
 * CLAUDE.md ("Fraction irréductible, jamais de décimal") détectée par
 * `formatReciproqueLatex.test.ts`. */
export const MAX_DENOMINATEUR_IMAGE_QUADRATIQUE = 24;

export function reciproqueMoinsConstanteFraction(terme: string, valeur: number): string {
  if (Math.abs(valeur) < 1e-9) return terme;
  return valeur > 0
    ? `${terme} - ${approxFractionLatex(valeur, MAX_DENOMINATEUR_IMAGE_QUADRATIQUE)}`
    : `${terme} + ${approxFractionLatex(-valeur, MAX_DENOMINATEUR_IMAGE_QUADRATIQUE)}`;
}

/** `numerateur` divisé par l'entier a — jamais de "/1" ni de double signe pour a=-1, jamais de
 * dénominateur littéralement négatif pour a<0 (signe reporté au numérateur à la place — sinon
 * `\dfrac{...}{-4}` reste affiché tel quel, non simplifié, voir `formatReciproqueLatex.test.ts`). */
export function reciproqueDiviserParA(numerateur: string, a: number): string {
  if (a === 1) return numerateur;
  if (a === -1) return `-\\left(${numerateur}\\right)`;
  // Signe devant la fraction (« −\\dfrac{x + 1}{5} », jamais « \\dfrac{−(x + 1)}{5} »).
  if (a < 0) return `-\\dfrac{${numerateur}}{${Math.abs(a)}}`;
  return `\\dfrac{${numerateur}}{${a}}`;
}

/** Borne de `exercice.image` côté fini (identique au calcul déjà fait par `aideImageNiveau2`
 * ci-dessous pour la forme "intervalles" — seul cas pertinent ici, famille quadratique). */
function reciproqueBorneImage(image: EnsembleReelGuide): number {
  const m = image.morceaux[0];
  return m.inf !== null ? m.inf : (m.sup as number);
}

/** Forme canonique de f⁻¹(x) — voir en-tête ci-dessus. `cote` sans effet sur les familles à
 * branche unique (b, d, e, et a/c à n impair) — voir `core6e/injectiviteFonctions.types.ts`. */
export function formatReciproqueLatex(exercice: ExerciceInjectiviteFonctions, cote: CoteBranche): string {
  const p = exercice.parametres;
  switch (p.famille) {
    case "puissanceAffine": {
      const { a, b, n } = p;
      if (n % 2 !== 0) {
        return reciproqueDiviserParA(reciproqueMoinsConstante(reciproqueRacineDeX(n), b), a);
      }
      const s = Math.sign(a);
      const signeRacine = cote === "droite" ? s : -s;
      const racine = reciproqueRacineDeX(n);
      const terme = signeRacine === 1 ? racine : `-${racine}`;
      return reciproqueDiviserParA(reciproqueMoinsConstante(terme, b), a);
    }
    case "racineNieme": {
      const { a, b, n } = p;
      return reciproqueDiviserParA(reciproqueMoinsConstante(reciproqueXPuissanceN(n), b), a);
    }
    case "puissanceMonome": {
      const { a, b, n } = p;
      const u = reciproqueDiviserParA(formatAffineLatex(1, -b), a);
      const racine = reciproqueEnvelopperRacine(u, n);
      if (n % 2 !== 0) return racine;
      return cote === "droite" ? racine : `-${racine}`;
    }
    case "racinePlusConstante": {
      const { a, b, c } = p;
      const carre = `\\left(${formatAffineLatex(1, -c)}\\right)^{2}`;
      return reciproqueDiviserParA(reciproqueMoinsConstante(carre, b), a);
    }
    case "homographique": {
      const { a, b, c, d } = p;
      return `\\dfrac{${formatAffineLatex(-d, b)}}{${formatAffineLatex(c, -a)}}`;
    }
    case "quadratique": {
      const { a } = p;
      const pivot = exercice.pivot as number;
      const k = reciproqueBorneImage(exercice.image);
      const racine = `\\sqrt{${reciproqueDiviserParA(reciproqueMoinsConstanteFraction("x", k), a)}}`;
      if (Math.abs(pivot) < 1e-9) return cote === "droite" ? racine : `-${racine}`;
      const pivotLatex = approxFractionLatex(pivot);
      return cote === "droite" ? `${pivotLatex} + ${racine}` : `${pivotLatex} - ${racine}`;
    }
  }
}

