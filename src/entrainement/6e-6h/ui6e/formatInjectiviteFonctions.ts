import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import { formatAffineLatex, formatPuissanceMonomeLatex } from "../generateurs6e/injectiviteFonctions/formatFLatex";
import type { CoteBranche, ResultatExerciceInjectiviteFonctions } from "../moteur6e/typesInjectiviteFonctions";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";
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

function formatRacineNiemeAffichage(a: number, b: number, n: number): string {
  const base = formatAffineLatex(a, b);
  const racine = `\\sqrt[${Math.abs(n)}]{${base}}`;
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
export const CONSIGNE_GENERALE = "Étudie la fonction f suivante : domaine, injectivité, réciproque, image et bijection.";

export const CONSIGNE_ECRAN_DOMAINE = "Détermine le domaine de définition de f.";
export const CONSIGNE_ECRAN_INJECTIVE = "f est-elle injective sur son domaine de définition ?";
export const CONSIGNE_SOUS_QUESTION_INTERVALLE = "Quel est le plus grand intervalle sur lequel f est injective ?";
export const CONSIGNE_ECRAN_RECIPROQUE = "Détermine l'expression de la fonction réciproque f⁻¹(x).";
export const CONSIGNE_ECRAN_IMAGE = "Détermine le plus grand intervalle dans lequel f est surjective.";
export const CONSIGNE_ECRAN_BIJECTION = "Complète la phrase suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

// ============================================================================
// Écran 1 — domaine, 2 niveaux d'aide.
// ============================================================================

export function texteAideDomaineNiveau1(exercice: ExerciceInjectiviteFonctions): string {
  const p = exercice.parametres;
  switch (p.famille) {
    case "puissanceAffine":
      return p.n < 0
        ? "Un exposant négatif équivaut à une division : la base ne peut jamais être nulle."
        : "Cette expression n'a ni radicande (sous une racine) ni dénominateur ni exposant négatif : réfléchis s'il existe une valeur de x qui la rendrait indéfinie.";
    case "racineNieme":
      return p.n % 2 === 0
        ? "Le radicande (l'expression élevée à la puissance 1/n, n pair) doit être positif ou nul."
        : p.n < 0
          ? "Un exposant négatif équivaut à une division : la base ne peut jamais être nulle."
          : "Cette expression n'a ni radicande à condition (n impair, toute base convient) ni dénominateur : réfléchis s'il existe une valeur de x qui la rendrait indéfinie.";
    case "puissanceMonome":
      return p.n < 0
        ? "Un exposant négatif équivaut à une division : la base (ici x) ne peut jamais être nulle."
        : "Cette expression n'a ni radicande ni dénominateur ni exposant négatif : réfléchis s'il existe une valeur de x qui la rendrait indéfinie.";
    case "racinePlusConstante":
      return "Le radicande (l'expression sous la racine) doit être positif ou nul : pose l'inéquation correspondante pour trouver le domaine.";
    case "homographique":
      return "Le dénominateur doit être différent de 0 : pose l'équation correspondante pour trouver la valeur exclue.";
    case "quadratique":
      return "Cette expression n'a ni radicande ni dénominateur ni exposant négatif : réfléchis s'il existe une valeur de x qui la rendrait indéfinie.";
  }
}

export function aideDomaineNiveau2(exercice: ExerciceInjectiviteFonctions): AideAvecLatex {
  const p = exercice.parametres;
  switch (p.famille) {
    case "puissanceAffine":
      return p.n < 0
        ? { texte: "Résous cette équation pour trouver la valeur exclue du domaine.", latex: `${formatAffineLatex(p.a, p.b)} = 0` }
        : { texte: "Il n'existe aucune valeur interdite : le domaine est ℝ tout entier.", latex: null };
    case "racineNieme":
      if (p.n % 2 === 0) return { texte: "Résous cette inéquation pour trouver le domaine.", latex: `${formatAffineLatex(p.a, p.b)} \\geq 0` };
      if (p.n < 0) return { texte: "Résous cette équation pour trouver la valeur exclue du domaine.", latex: `${formatAffineLatex(p.a, p.b)} = 0` };
      return { texte: "Il n'existe aucune valeur interdite : le domaine est ℝ tout entier.", latex: null };
    case "puissanceMonome":
      return p.n < 0 ? { texte: "La base interdite est immédiate ici.", latex: "x = 0" } : { texte: "Il n'existe aucune valeur interdite : le domaine est ℝ tout entier.", latex: null };
    case "racinePlusConstante":
      return { texte: "Résous cette inéquation pour trouver le domaine.", latex: `${formatAffineLatex(p.a, p.b)} \\geq 0` };
    case "homographique":
      return { texte: "Résous cette équation pour trouver la valeur exclue du domaine.", latex: `${formatAffineLatex(p.c, p.d)} = 0` };
    case "quadratique":
      return { texte: "Il n'existe aucune valeur interdite : le domaine est ℝ tout entier.", latex: null };
  }
}

// ============================================================================
// Écran 2 — injective (Oui/Non) + sous-question intervalle, 2 niveaux d'aide CHACUN (le composant
// choisit quelle paire afficher selon que "Non" est actuellement sélectionné ou non).
// ============================================================================

export function texteAideOuiNonNiveau1(exercice: ExerciceInjectiviteFonctions): string {
  return exercice.injective
    ? "Le graphique de f possède-t-il un axe de symétrie vertical ? Vérifie plutôt si f est strictement monotone (toujours croissante, ou toujours décroissante) sur tout son domaine."
    : "Représente-toi le graphique de f : semble-t-il symétrique par rapport à une droite verticale x=... ? Si deux valeurs distinctes de x donnent la même image, f n'est pas injective.";
}

export function aideOuiNonNiveau2(exercice: ExerciceInjectiviteFonctions): AideAvecLatex {
  if (exercice.injective) {
    return { texte: "f est strictement monotone sur tout son domaine (jamais de partie où elle stagne ou change de sens) : deux valeurs distinctes de x donnent donc toujours 2 images distinctes.", latex: null };
  }
  const pivot = approxFractionLatex(exercice.pivot as number);
  return { texte: `f est symétrique par rapport à la droite verticale d'équation :`, latex: `x = ${pivot}` };
}

export const TEXTE_AIDE_INTERVALLE_NIVEAU1 = "Rappel : le plus grand intervalle d'injectivité est délimité par le pivot de symétrie déjà identifié — une seule des deux moitiés convient, l'autre contenant 2 valeurs symétriques de même image.";

export function aideIntervalleNiveau2(exercice: ExerciceInjectiviteFonctions): AideAvecLatex {
  const pivot = approxFractionLatex(exercice.pivot as number);
  return { texte: "Le pivot est déjà connu — il ne reste plus qu'à choisir de quel côté (gauche ou droite) construire l'intervalle (les deux sont acceptés).", latex: `x = ${pivot}` };
}

// ============================================================================
// Bloc "état actuel" — ACCUMULATION (correctif transversal, voir CLAUDE.md/`docs/historique-6e.md`
// pour le pattern général) : jusqu'ici chaque écran ≥3 n'affichait QUE l'info de l'écran
// immédiatement précédent (écran "réciproque" : rien du tout côté injective ; écran "image" :
// seulement l'intervalle d'injectivité, sans le domaine de l'écran 1 ; écran "bijection" : aucun
// bloc état actuel du tout). Corrigé en 2 fonctions qui GRANDISSENT d'un écran à l'autre, plus
// anciennes en premier, jamais un remplacement de la ligne précédente.
// ============================================================================

/** Une ligne de l'état déjà confirmé à un écran précédent (jamais la saisie brute de l'élève —
 * `exercice.domaine`/`exercice.injective`/`intervalleConfirme` sont tous des valeurs canoniques
 * déjà déterminées par la Couche A/B, jamais recalculées depuis une réponse élève). */
export interface LigneEtatActuelInjectivite {
  label: string;
  latex: string;
}

/** Lignes accumulées disponibles à partir de l'écran 3 ("réciproque") : domaine (écran 1) puis
 * injectivité (écran 2) — Oui/Non, plus l'intervalle retenu si "Non". */
export function lignesEtatActuelApresInjective(exercice: ExerciceInjectiviteFonctions, intervalleConfirme: EnsembleReelGuide): LigneEtatActuelInjectivite[] {
  const lignes: LigneEtatActuelInjectivite[] = [
    { label: "Domaine (étape 1)", latex: formatEnsembleReelLatex(exercice.domaine) },
    { label: "f est-elle injective ? (étape 2)", latex: exercice.injective ? "\\text{Oui}" : "\\text{Non}" },
  ];
  if (!exercice.injective) {
    lignes.push({ label: "Intervalle d'injectivité retenu (étape 2)", latex: formatEnsembleReelLatex(intervalleConfirme) });
  }
  return lignes;
}

/** Lignes accumulées disponibles à partir de l'écran 4 ("image") : tout ce qui précède (domaine +
 * injectivité), plus la réciproque confirmée à l'écran 3 — BUG RÉSIDUEL corrigé ici :
 * `lignesEtatActuelApresImage` (ci-dessous) enchaînait directement `lignesEtatActuelApresInjective`
 * + Image, sautant complètement la réciproque (l'écran "réciproque" lui-même l'affichait
 * correctement via `lignesEtatActuelApresInjective`, mais aucun écran suivant ne la reprenait).
 * `formatReciproqueLatex` (ci-dessous, écran 3) fournit la forme canonique — jamais la saisie
 * brute de l'élève, conforme à CLAUDE.md. */
export function lignesEtatActuelApresReciproque(exercice: ExerciceInjectiviteFonctions, intervalleConfirme: EnsembleReelGuide, cote: CoteBranche): LigneEtatActuelInjectivite[] {
  return [
    ...lignesEtatActuelApresInjective(exercice, intervalleConfirme),
    { label: "Réciproque confirmée (étape 3)", latex: `f^{-1}(x) = ${formatReciproqueLatex(exercice, cote)}` },
  ];
}

/** Lignes accumulées disponibles à partir de l'écran 5 ("bijection") : tout ce qui précède
 * (domaine + injectivité + réciproque), plus l'image confirmée à l'écran 4. */
export function lignesEtatActuelApresImage(exercice: ExerciceInjectiviteFonctions, intervalleConfirme: EnsembleReelGuide, cote: CoteBranche): LigneEtatActuelInjectivite[] {
  return [
    ...lignesEtatActuelApresReciproque(exercice, intervalleConfirme, cote),
    { label: "Image (étape 4)", latex: formatEnsembleReelLatex(exercice.image) },
  ];
}

// ============================================================================
// Écran 3 — réciproque, 2 niveaux d'aide.
// ============================================================================

export const TEXTE_AIDE_RECIPROQUE_NIVEAU1 = "Méthode : pose y=f(x), échange les rôles de x et de y, puis isole y en fonction de x.";

/** Remplace la variable "x" par "y" dans le membre de droite de `fLatex` — étape "après l'échange
 * x/y", isolement final volontairement PAS fait (spec explicite). Fiable ici car la seule lettre
 * de variable produite par les 6 familles est "x" (jamais un autre fragment contenant la lettre
 * "x" dans le LaTeX généré). */
function membreDroiteAvecYPourX(fLatex: string): string {
  const rhs = fLatex.split("=")[1]?.trim() ?? fLatex;
  return rhs.replace(/x/g, "y");
}

export function aideReciproqueNiveau2(exercice: ExerciceInjectiviteFonctions): AideAvecLatex {
  return {
    texte: "On pose y=f(x), puis on échange x et y (étape déjà faite ci-dessous) — il ne reste plus qu'à isoler y :",
    latex: `x = ${membreDroiteAvecYPourX(exercice.fLatex)}`,
  };
}

// ============================================================================
// Forme canonique de f⁻¹(x) — UNE des formes acceptées (la vérification à l'écran 3 reste par
// échantillonnage numérique, `moteur6e/verificationInjectiviteFonctions.ts::diagnostiquerReciproque`,
// jamais une comparaison littérale — même principe que `referenceBReformuler`,
// `ui6e/formatLimitesLogarithmiques.ts`). Réplique EXACTEMENT la formule déjà documentée en
// en-tête de chaque `generateurs6e/injectiviteFonctions/familles/*.ts` (jamais une ré-dérivation
// indépendante) — utilisée UNIQUEMENT pour le bloc "état actuel" des écrans 4/5, jamais pour la
// vérification elle-même (qui reste `fInverseGauche`/`fInverseDroite`, Couche A).
// ============================================================================

/** x^{1/n} — racine n-ième de x si n>0, inverse de la racine |n|-ième si n<0. */
function reciproqueRacineDeX(n: number): string {
  const racine = `\\sqrt[${Math.abs(n)}]{x}`;
  return n > 0 ? racine : `\\dfrac{1}{${racine}}`;
}

/** Enveloppe `inner` dans une racine n-ième réelle (n>0) ou son inverse (n<0). */
function reciproqueEnvelopperRacine(inner: string, n: number): string {
  const racine = `\\sqrt[${Math.abs(n)}]{${inner}}`;
  return n > 0 ? racine : `\\dfrac{1}{${racine}}`;
}

/** x^{n} — jamais un exposant négatif littéral (fraction si n<0, comme `formatFLatexAffichage`). */
function reciproqueXPuissanceN(n: number): string {
  return n > 0 ? `x^{${n}}` : `\\dfrac{1}{x^{${-n}}}`;
}

/** `terme` (déjà signé) moins la constante b — jamais de double signe : "- b" si b>0, "+ |b|" si
 * b<0, rien si b=0. */
function reciproqueMoinsConstante(terme: string, b: number): string {
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
const MAX_DENOMINATEUR_IMAGE_QUADRATIQUE = 24;

function reciproqueMoinsConstanteFraction(terme: string, valeur: number): string {
  if (Math.abs(valeur) < 1e-9) return terme;
  return valeur > 0
    ? `${terme} - ${approxFractionLatex(valeur, MAX_DENOMINATEUR_IMAGE_QUADRATIQUE)}`
    : `${terme} + ${approxFractionLatex(-valeur, MAX_DENOMINATEUR_IMAGE_QUADRATIQUE)}`;
}

/** `numerateur` divisé par l'entier a — jamais de "/1" ni de double signe pour a=-1, jamais de
 * dénominateur littéralement négatif pour a<0 (signe reporté au numérateur à la place — sinon
 * `\dfrac{...}{-4}` reste affiché tel quel, non simplifié, voir `formatReciproqueLatex.test.ts`). */
function reciproqueDiviserParA(numerateur: string, a: number): string {
  if (a === 1) return numerateur;
  if (a === -1) return `-\\left(${numerateur}\\right)`;
  if (a < 0) return `\\dfrac{-\\left(${numerateur}\\right)}{${Math.abs(a)}}`;
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

// ============================================================================
// Écran 4 — image, 2 niveaux d'aide.
// ============================================================================

export const TEXTE_AIDE_IMAGE_NIVEAU1 =
  "Rappel : l'image de f correspond au domaine de f⁻¹ — déductible du comportement de f aux bornes de son domaine (restreint le cas échéant, voir l'étape précédente).";

export function aideImageNiveau2(exercice: ExerciceInjectiviteFonctions): AideAvecLatex {
  if (exercice.image.forme === "prive_points") {
    // `.map((v) => approxFractionLatex(v))`, JAMAIS `.map(approxFractionLatex)` — l'index passé en
    // 2e argument par `Array.prototype.map` écraserait silencieusement `maxDenominateur` (voir le
    // même piège documenté dans `ui6e/formatEnsembleReel.ts`).
    return {
      texte: "La valeur exclue de l'image (l'asymptote horizontale) est déjà identifiée — il ne reste plus qu'à l'écrire sous forme d'ensemble :",
      latex: `\\mathbb{R} \\setminus \\{${exercice.image.points.map((v) => approxFractionLatex(v)).join("\\,;\\,")}\\}`,
    };
  }
  if (exercice.image.forme === "reel") {
    return { texte: "Aucune restriction : l'image est ℝ tout entier (f prend toutes les valeurs réelles).", latex: null };
  }
  const m = exercice.image.morceaux[0];
  const borne = m.inf !== null ? m.inf : (m.sup as number);
  // `MAX_DENOMINATEUR_IMAGE_QUADRATIQUE` (voir sa définition ci-dessous, écran 3) : la borne d'une
  // famille "quadratique" (k=c-b²/(4a)) peut avoir un dénominateur jusqu'à 4|a| (≤20 ici),
  // au-delà du maxDenominateur par défaut de `approxFractionLatex` (12) — sans ce paramètre
  // explicite, certains tirages retombaient sur le flottant brut (violation CLAUDE.md, "Fraction
  // irréductible, jamais de décimal"). Sans effet sur les familles a/c (borne toujours entière,
  // `Number.isInteger` court-circuite `approxFractionLatex` avant même de consulter ce paramètre).
  return {
    texte: "La valeur-pivot de l'image (atteinte au pivot du domaine, ou l'asymptote) est déjà identifiée — reste à déterminer le sens (croissant ou décroissant) pour savoir de quel côté se prolonge l'image :",
    latex: `y = ${approxFractionLatex(borne, MAX_DENOMINATEUR_IMAGE_QUADRATIQUE)}`,
  };
}

// ============================================================================
// Écran 5 — bijection (double combobox), 1 SEUL niveau d'aide (complément ciblé — le 2e palier,
// qui révélait Y en exemple, a été supprimé ; voir `moteur6e/sessionInjectiviteFonctions.ts::
// NIVEAU_AIDE_MAX` et historique-6e.md).
// ============================================================================

export const TEXTE_AIDE_BIJECTION_NIVEAU1 = "Rappel : X doit être EXACTEMENT l'intervalle trouvé à l'étape 2 et Y celui trouvé à l'étape 4 — jamais recalculés indépendamment à ce stade.";

// ============================================================================
// Total points du récapitulatif final — COMPLÉMENT de `LigneRecap`/`statutRecap`, jamais un
// remplacement (voir CLAUDE.md). Réutilise la formule RÉELLE déjà calculée par
// `moteur/etapeTentatives.ts` (pénalité par tentative + par aide, forcée à 0 sur révélation).
// ============================================================================

/** Séquence FIXE à 5 écrans : maximum toujours 500. */
export function calculerTotalPointsInjectiviteFonctions(resultat: ResultatExerciceInjectiviteFonctions): { points: number; maximum: number } {
  const points = resultat.scoreDomaine + resultat.scoreInjective + resultat.scoreReciproque + resultat.scoreImage + resultat.scoreBijection;
  return { points, maximum: 500 };
}
