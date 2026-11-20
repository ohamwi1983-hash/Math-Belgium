import type { Arcfonction } from "../core6e/cyclometrique.types";
import type { ExerciceDeriveesCyclometriques } from "../core6e/deriveesCyclometriques.types";
import type { PhaseDeriveesCyclometriques } from "../moteur6e/typesDeriveesCyclometriques";
import type {
  ExerciceDeriveeA,
  ExerciceDeriveeB,
  ExerciceDeriveeC,
  ExerciceDeriveeD,
  ExerciceDeriveeE,
  ExerciceDeriveeF,
  ExerciceDeriveeG,
} from "../core6e/deriveesCyclometriques.types";

/**
 * Couche présentation (6e) — formatage LaTeX + textes de consigne/aide pour `6gen4`. Consigne
 * générale et bloc de données (f(x)) redondants sur chaque écran (spec explicite). Chaque aide
 * niveau 2 qui porte une formule utilise le motif `{texte, latex}` — jamais du LaTeX brut mêlé au
 * texte (leçon retenue de 6gen2/6gen3, voir CLAUDE.md).
 */
export const CONSIGNE_GENERALE = "Dérive la fonction suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`, rendu
 * via `components/RenduFragments.tsx`. Utilisé par les 18 `consigneEcran` de `App6gen4.tsx` (chaque
 * écran y définit sa propre consigne, jamais stockée ici — voir le composant pour le détail). */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
export function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

const NOM_LATEX: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };

interface TermeAffiche {
  signe: 1 | -1;
  corps: string;
}

function formatSomme(termes: TermeAffiche[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => (i === 0 ? (t.signe < 0 ? `-${t.corps}` : t.corps) : `${t.signe < 0 ? "-" : "+"} ${t.corps}`)).join(" ");
}

export function formatAffineLatex(a: number, b: number, variable = "x"): string {
  const termeA: TermeAffiche = { signe: a >= 0 ? 1 : -1, corps: Math.abs(a) === 1 ? variable : `${Math.abs(a)}${variable}` };
  if (b === 0) return formatSomme([termeA]);
  return formatSomme([termeA, { signe: b >= 0 ? 1 : -1, corps: String(Math.abs(b)) }]);
}

function formatCoefFois(k: number, corpsBase: string): string {
  const abs = Math.abs(k);
  return abs === 1 ? corpsBase : `${abs}${corpsBase}`;
}

/** Dérivée de arcsin/arccos/arctan par rapport à SON ARGUMENT, avec l'argument RÉEL déjà
 * substitué (jamais la lettre générique "u"/"v" seule) — "formule substituée, non simplifiée",
 * spec explicite pour toutes les aides niveau 2 du générateur. */
export function formatDeriveeArcfonctionLatex(arcfonction: Arcfonction, argLatex: string): string {
  switch (arcfonction) {
    case "arcsin":
      return `\\dfrac{1}{\\sqrt{1-\\left(${argLatex}\\right)^2}}`;
    case "arccos":
      return `-\\dfrac{1}{\\sqrt{1-\\left(${argLatex}\\right)^2}}`;
    case "arctan":
      return `\\dfrac{1}{1+\\left(${argLatex}\\right)^2}`;
  }
}

// ============================================================================
// Famille A — f(x) = c + k·arcfonction(u(x)).
// ============================================================================

export function formatULatexA(e: ExerciceDeriveeA): string {
  switch (e.uType) {
    case "affine":
      return formatAffineLatex(e.a, e.b);
    case "puissance":
      return `x^{${e.n}}`;
    case "racine":
      return e.a === 1 ? "\\sqrt{x}" : `\\sqrt{${e.a}x}`;
    case "reciproque":
      return `\\dfrac{${e.kPrime}}{x}`;
  }
}

export function formatFonctionALatex(e: ExerciceDeriveeA): string {
  const argFn = `${NOM_LATEX[e.arcfonction]}\\left(${formatULatexA(e)}\\right)`;
  const termeK: TermeAffiche = { signe: e.k >= 0 ? 1 : -1, corps: formatCoefFois(e.k, argFn) };
  const termes: TermeAffiche[] = e.c !== 0 ? [{ signe: e.c >= 0 ? 1 : -1, corps: String(Math.abs(e.c)) }, termeK] : [termeK];
  return `f(x) = ${formatSomme(termes)}`;
}



export function texteAideADeriveeUNiveau2(e: ExerciceDeriveeA): AideAvecLatex {
  const uLatex = formatULatexA(e);
  const formeGenerale =
    e.uType === "affine"
      ? `u'(x) = ${e.a}`
      : e.uType === "puissance"
        ? `u'(x) = ${e.n}x^{${e.n - 1}}`
        : e.uType === "racine"
          ? `u'(x) = \\dfrac{${e.a}}{2\\sqrt{${axL(e.a)}}}`
          : `u'(x) = -\\dfrac{${e.kPrime}}{x^{2}}`;
  return { texte: "Avec u(x) tel qu'affiché ci-dessus :", latex: `u(x) = ${uLatex} \\quad\\Rightarrow\\quad ${formeGenerale}` };
}


export function texteAideADeriveeFinaleNiveau2(e: ExerciceDeriveeA): AideAvecLatex {
  const uLatex = formatULatexA(e);
  const uPrimeLatex =
    e.uType === "affine"
      ? String(e.a)
      : e.uType === "puissance"
        ? `${e.n}x^{${e.n - 1}}`
        : e.uType === "racine"
          ? `\\dfrac{${e.a}}{2\\sqrt{${axL(e.a)}}}`
          : `-\\dfrac{${e.kPrime}}{x^{2}}`;
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, uLatex);
  return { texte: "u et u' déjà substitués (non simplifié) :", latex: `f'(x) = ${coefFacteur(e.k)}\\left[${deriveeBase}\\right]\\cdot\\left(${uPrimeLatex}\\right)` };
}

// ============================================================================
// Famille B — f(x) = u(x)·arcfonction(v(x)), u(x)=m·x.
// ============================================================================

export function formatVLatexB(e: ExerciceDeriveeB): string {
  return e.vType === "simple" ? "x" : formatSomme([{ signe: 1, corps: `${e.a}x^{2}` }, { signe: e.b >= 0 ? 1 : -1, corps: String(Math.abs(e.b)) }]);
}

export function formatFonctionBLatex(e: ExerciceDeriveeB): string {
  const uLatex = e.m === 1 ? "x" : `${e.m}x`;
  return `f(x) = ${uLatex}${NOM_LATEX[e.arcfonction]}\\left(${formatVLatexB(e)}\\right)`;
}

export function texteAideBDeriveeUNiveau2(e: ExerciceDeriveeB): AideAvecLatex {
  return { texte: "u(x) = m·x, donc :", latex: `u'(x) = ${e.m}` };
}

export function texteAideBDeriveeArcNiveau2(e: ExerciceDeriveeB): AideAvecLatex {
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, formatVLatexB(e));
  const vPrime = e.vType === "simple" ? "1" : `${2 * e.a}x`;
  return { texte: "v et v' déjà substitués (non simplifié) :", latex: e.vType === "simple" ? deriveeBase : `\\left[${deriveeBase}\\right]\\cdot\\left(${vPrime}\\right)` };
}

export function texteAideBDeriveeFinaleNiveau2(e: ExerciceDeriveeB): AideAvecLatex {
  const uLatex = e.m === 1 ? "x" : `${e.m}x`;
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, formatVLatexB(e));
  const vPrime = e.vType === "simple" ? "1" : `${2 * e.a}x`;
  return {
    texte: "Substitue (non simplifié) :",
    latex: `f'(x) = ${e.m}${NOM_LATEX[e.arcfonction]}\\left(${formatVLatexB(e)}\\right) + ${uLatex}\\cdot\\left[${deriveeBase}\\right]${e.vType === "simple" ? "" : `\\cdot\\left(${vPrime}\\right)`}`,
  };
}

// ============================================================================
// Famille C — f(x) = k·arcfonction(ax) / √(1-(ax)²).
// ============================================================================

export function formatFonctionCLatex(e: ExerciceDeriveeC): string {
  const num = formatCoefFois(e.k, `${NOM_LATEX[e.arcfonction]}\\left(${e.a}x\\right)`);
  return `f(x) = \\dfrac{${num}}{\\sqrt{1-(${e.a}x)^{2}}}`;
}

export function texteAideCNumerateurNiveau2(e: ExerciceDeriveeC): AideAvecLatex {
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, `${e.a}x`);
  return { texte: "k et a déjà substitués :", latex: `N'(x) = ${coefFacteur(e.k)}\\left[${deriveeBase}\\right]\\cdot ${e.a}` };
}

export function texteAideCDenominateurNiveau2(e: ExerciceDeriveeC): AideAvecLatex {
  return { texte: "Substitue a :", latex: `D'(x) = -\\dfrac{${e.a * e.a}x}{\\sqrt{1-(${e.a}x)^{2}}}` };
}

export function texteAideCDeriveeFinaleNiveau2(e: ExerciceDeriveeC): AideAvecLatex {
  const arcTexteLatex = NOM_LATEX[e.arcfonction];
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, `${e.a}x`);
  const nLatex = `${e.k === 1 ? "" : e.k}${arcTexteLatex}\\left(${e.a}x\\right)`;
  const nPrimeLatex = `${coefFacteur(e.k)}\\left[${deriveeBase}\\right]\\cdot ${e.a}`;
  const dLatex = `\\sqrt{1-(${e.a}x)^{2}}`;
  const dPrimeLatex = `-\\dfrac{${e.a * e.a}x}{${dLatex}}`;
  return {
    texte: "N, N', D, D' déjà substitués (non résolu) :",
    latex: `f'(x) = \\dfrac{\\left(${nPrimeLatex}\\right)\\left(${dLatex}\\right) - \\left(${nLatex}\\right)\\left(${dPrimeLatex}\\right)}{\\left(${dLatex}\\right)^{2}}`,
  };
}

// ============================================================================
// Famille D — f(x) = arcsin(u)/arccos(u) ou l'inverse, u=ax+b.
// ============================================================================

export function formatFonctionDLatex(e: ExerciceDeriveeD): string {
  const uLatex = formatAffineLatex(e.a, e.b);
  const [haut, bas] = e.orientation === "sinSurCos" ? ["\\arcsin", "\\arccos"] : ["\\arccos", "\\arcsin"];
  return `f(x) = \\dfrac{${haut}\\left(${uLatex}\\right)}{${bas}\\left(${uLatex}\\right)}`;
}

export function texteAideDNumerateurNiveau2(e: ExerciceDeriveeD): AideAvecLatex {
  const uLatex = formatAffineLatex(e.a, e.b);
  const arcfonctionHaut = e.orientation === "sinSurCos" ? "arcsin" : "arccos";
  const deriveeBase = formatDeriveeArcfonctionLatex(arcfonctionHaut, uLatex);
  return { texte: "u déjà substitué :", latex: `N'(x) = \\left[${deriveeBase}\\right]\\cdot ${e.a}` };
}

export function texteAideDDenominateurNiveau2(e: ExerciceDeriveeD): AideAvecLatex {
  const uLatex = formatAffineLatex(e.a, e.b);
  const arcfonctionBas = e.orientation === "sinSurCos" ? "arccos" : "arcsin";
  const deriveeBase = formatDeriveeArcfonctionLatex(arcfonctionBas, uLatex);
  return { texte: "u déjà substitué :", latex: `D'(x) = \\left[${deriveeBase}\\right]\\cdot ${e.a}` };
}

export function texteAideDBrutNiveau2(e: ExerciceDeriveeD): AideAvecLatex {
  const uLatex = formatAffineLatex(e.a, e.b);
  const [nomHaut, nomBas] = e.orientation === "sinSurCos" ? ["\\arcsin", "\\arccos"] : ["\\arccos", "\\arcsin"];
  const arcfonctionHaut = e.orientation === "sinSurCos" ? "arcsin" : "arccos";
  const arcfonctionBas = e.orientation === "sinSurCos" ? "arccos" : "arcsin";
  const nLatex = `${nomHaut}\\left(${uLatex}\\right)`;
  const dLatex = `${nomBas}\\left(${uLatex}\\right)`;
  const nPrimeLatex = `\\left[${formatDeriveeArcfonctionLatex(arcfonctionHaut, uLatex)}\\right]\\cdot ${e.a}`;
  const dPrimeLatex = `\\left[${formatDeriveeArcfonctionLatex(arcfonctionBas, uLatex)}\\right]\\cdot ${e.a}`;
  return {
    texte: "N, N', D, D' déjà substitués (résultat toujours BRUT) :",
    latex: `f'(x) = \\dfrac{\\left(${nPrimeLatex}\\right)\\left(${dLatex}\\right) - \\left(${nLatex}\\right)\\left(${dPrimeLatex}\\right)}{\\left(${dLatex}\\right)^{2}}`,
  };
}

export function texteAideDSimplifieeNiveau2(e: ExerciceDeriveeD): AideAvecLatex {
  const uLatex = formatAffineLatex(e.a, e.b);
  return {
    texte: "Repère cette somme dans le numérateur de l'étape précédente (non encore remplacée par π/2) :",
    latex: `N'(x)\\cdot D(x) - N(x)\\cdot D'(x) = N'(x)\\cdot\\left[\\arcsin\\left(${uLatex}\\right)+\\arccos\\left(${uLatex}\\right)\\right]`,
  };
}

// ============================================================================
// Famille E — f(x) = g(arcfonction(v(x))), v(x)=a·x, g∈{racine,carre}.
// ============================================================================

export function formatFonctionELatex(e: ExerciceDeriveeE): string {
  const vLatex = e.a === 1 ? "x" : `${e.a}x`;
  const interieur = `${NOM_LATEX[e.arcfonction]}\\left(${vLatex}\\right)`;
  return `f(x) = ${e.gType === "carre" ? `\\left(${interieur}\\right)^{2}` : `\\sqrt{${interieur}}`}`;
}

export function texteAideEDeriveeInterneNiveau2(e: ExerciceDeriveeE): AideAvecLatex {
  const vLatex = e.a === 1 ? "x" : `${e.a}x`;
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, vLatex);
  return { texte: "v déjà substitué :", latex: `w'(x) = \\left[${deriveeBase}\\right]${e.a === 1 ? "" : `\\cdot ${e.a}`}` };
}

export function texteAideEDeriveeFinaleNiveau2(e: ExerciceDeriveeE): AideAvecLatex {
  const vLatex = e.a === 1 ? "x" : `${e.a}x`;
  const w = `${NOM_LATEX[e.arcfonction]}\\left(${vLatex}\\right)`;
  return {
    texte: "Chaîne extérieure (non simplifiée) :",
    latex: e.gType === "carre" ? `f'(x) = 2\\cdot ${w}\\cdot w'(x)` : `f'(x) = \\dfrac{w'(x)}{2\\sqrt{${w}}}`,
  };
}

// ============================================================================
// Famille F — f(x) = trig(arcfonction(v(x))), v(x)=a·x.
// ============================================================================

export function formatFonctionFLatex(e: ExerciceDeriveeF): string {
  const vLatex = e.a === 1 ? "x" : `${e.a}x`;
  const trigLatex = e.trig === "sin" ? "\\sin" : "\\cos";
  return `f(x) = ${trigLatex}\\left(${NOM_LATEX[e.arcfonction]}\\left(${vLatex}\\right)\\right)`;
}

export function texteAideFBruteNiveau2(e: ExerciceDeriveeF): AideAvecLatex {
  const vLatex = e.a === 1 ? "x" : `${e.a}x`;
  const u = `${NOM_LATEX[e.arcfonction]}\\left(${vLatex}\\right)`;
  const trigPrime = e.trig === "sin" ? `\\cos\\left(${u}\\right)` : `-\\sin\\left(${u}\\right)`;
  const uPrime = `\\left[${formatDeriveeArcfonctionLatex(e.arcfonction, vLatex)}\\right]${e.a === 1 ? "" : `\\cdot ${e.a}`}`;
  return { texte: "Substitue (non simplifié) :", latex: `f'(x) = ${trigPrime}\\cdot\\left(${uPrime}\\right)` };
}


// ============================================================================
// Famille G — sous-cas h : f(x)=k/arcfonction(v(x)), v=x²+c ; sous-cas i : f(x)=arcfonction(k/(x+c)).
// ============================================================================

export function formatFonctionGLatex(e: ExerciceDeriveeG): string {
  if (e.sousCas === "h") {
    const vLatex = formatSomme([{ signe: 1, corps: "x^{2}" }, { signe: e.c >= 0 ? 1 : -1, corps: String(Math.abs(e.c)) }]);
    return `f(x) = \\dfrac{${e.k}}{${NOM_LATEX[e.arcfonction]}\\left(${vLatex}\\right)}`;
  }
  const denomLatex = e.c === 0 ? "x" : formatSomme([{ signe: 1, corps: "x" }, { signe: e.c >= 0 ? 1 : -1, corps: String(Math.abs(e.c)) }]);
  return `f(x) = ${NOM_LATEX[e.arcfonction]}\\left(\\dfrac{${e.k}}{${denomLatex}}\\right)`;
}

export function texteAideGDeriveeInterneNiveau2(e: ExerciceDeriveeG): AideAvecLatex {
  if (e.sousCas === "h") return { texte: "v(x)=x²+c, donc :", latex: "v'(x) = 2x" };
  return { texte: "On dérive la fraction interne :", latex: `u'(x) = -\\dfrac{${e.k}}{${denominateurCarreG(e.c)}}` };
}

export function texteAideGDeriveeFinaleNiveau2(e: ExerciceDeriveeG): AideAvecLatex {
  if (e.sousCas === "h") {
    const vLatex = formatSomme([{ signe: 1, corps: "x^{2}" }, { signe: e.c >= 0 ? 1 : -1, corps: String(Math.abs(e.c)) }]);
    const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, vLatex);
    const arcfonctionVLatex = `${NOM_LATEX[e.arcfonction]}\\left(${vLatex}\\right)`;
    return {
      texte: "v et v' déjà substitués (non résolu) :",
      latex: `f'(x) = \\dfrac{-${e.k}\\cdot(2x)\\cdot\\left[${deriveeBase}\\right]}{\\left[${arcfonctionVLatex}\\right]^{2}}`,
    };
  }
  const denomLatex = e.c === 0 ? "x" : formatSomme([{ signe: 1, corps: "x" }, { signe: e.c >= 0 ? 1 : -1, corps: String(Math.abs(e.c)) }]);
  const uLatex = `\\dfrac{${e.k}}{${denomLatex}}`;
  const uPrimeLatex = `-\\dfrac{${e.k}}{${denominateurCarreG(e.c)}}`;
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, uLatex);
  return { texte: "u et u' déjà substitués (non résolu) :", latex: `f'(x) = \\left[${deriveeBase}\\right]\\cdot\\left(${uPrimeLatex}\\right)` };
}

// ============================================================================
// Outils d'écriture des aides (coefficients 1, carré du dénominateur de la famille G).
// ============================================================================

/** « 2x » (a = 1 : « x »). */
function axL(a: number): string {
  return a === 1 ? "x" : `${a}x`;
}

/** Facteur numérique devant un crochet : « » (1), « - » (−1), « 3\\cdot » sinon. */
function coefFacteur(k: number): string {
  return k === 1 ? "" : k === -1 ? "-" : `${k}\\cdot`;
}

/** Carré du dénominateur x + c de la famille G (« (x - 2)^{2} », « x^{2} » si c = 0). */
function denominateurCarreG(c: number): string {
  return c === 0 ? "x^{2}" : `\\left(${formatAffineLatex(1, c)}\\right)^{2}`;
}

// ============================================================================
// Consignes des écrans — partagées par l'appli (`App6gen4.tsx`) et les titres d'étapes du corrigé papier.
// ============================================================================

export function consigneEcranDerivee(e: ExerciceDeriveesCyclometriques, phase: PhaseDeriveesCyclometriques): FragmentConsigne[] {
  const f = latex("f'(x)");
  switch (phase) {
    case "aDeriveeU":
      return e.famille === "A" ? [texte("Dérive "), latex(`u(x)=${formatULatexA(e)}`), texte(".")] : [];
    case "aDeriveeFinale":
      return [texte("Assemble "), f, texte(" avec u(x) et u′(x) de l'étape précédente ; simplifie si possible.")];
    case "bDeriveeU":
      return e.famille === "B" ? [texte("Dérive "), latex(`u(x)=${e.m === 1 ? "x" : `${e.m}x`}`), texte(".")] : [];
    case "bDeriveeArc":
      return e.famille === "B" ? [texte("Dérive "), latex(`${NOM_LATEX[e.arcfonction]}\\left(${formatVLatexB(e)}\\right)`), texte(" séparément.")] : [];
    case "bDeriveeFinale":
      return [texte("Assemble "), f, texte(" avec la règle du produit.")];
    case "cNumerateur":
    case "dNumerateur":
      return [texte("Dérive le numérateur N(x).")];
    case "cDenominateur":
    case "dDenominateur":
      return [texte("Dérive le dénominateur D(x).")];
    case "cDeriveeFinale":
      return [texte("Assemble "), f, texte(" avec la règle du quotient.")];
    case "dBrut":
      return [texte("Assemble "), f, texte(" avec la règle du quotient (résultat brut, sans simplifier).")];
    case "dSimplifiee":
      return [texte("Simplifie le résultat précédent grâce à l'identité "), latex("\\arcsin(u)+\\arccos(u)=\\dfrac{\\pi}{2}"), texte(".")];
    case "eDeriveeInterne":
      return e.famille === "E" ? [texte("Dérive la fonction intérieure "), latex(`w(x)=${NOM_LATEX[e.arcfonction]}\\left(${axL(e.a)}\\right)`), texte(".")] : [];
    case "eDeriveeFinale":
      return [texte("Assemble "), f, texte(" avec la règle de la chaîne extérieure.")];
    case "fBrute":
      return [texte("Dérive "), latex("f(x)"), texte(" avec la règle de la chaîne (résultat brut accepté).")];
    case "fSimplifiee":
      return [texte("Donne la forme simplifiée de "), f, texte(" grâce à l'identité trigonométrique adéquate.")];
    case "gDeriveeInterne":
      return e.famille === "G" && e.sousCas === "h" ? [texte("Dérive "), latex(`v(x)=${formatSomme([{ signe: 1, corps: "x^{2}" }, { signe: e.c >= 0 ? 1 : -1, corps: String(Math.abs(e.c)) }])}`), texte(".")] : e.famille === "G" ? [texte("Dérive la fraction intérieure "), latex(`u(x)=\\dfrac{${e.k}}{${e.c === 0 ? "x" : formatAffineLatex(1, e.c)}}`), texte(".")] : [];
    case "gDeriveeFinale":
      return [texte("Assemble "), f, texte(".")];
  }
}
