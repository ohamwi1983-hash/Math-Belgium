import type { Arcfonction } from "../core6e/cyclometrique.types";
import type {
  ExerciceDeriveeA,
  ExerciceDeriveeB,
  ExerciceDeriveeC,
  ExerciceDeriveeD,
  ExerciceDeriveeE,
  ExerciceDeriveeF,
  ExerciceDeriveeG,
} from "../core6e/deriveesCyclometriques.types";
import type { ResultatExerciceDeriveesCyclometriques } from "../moteur6e/typesDeriveesCyclometriques";

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

const NOM_LATEX: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };

interface TermeAffiche {
  signe: 1 | -1;
  corps: string;
}

function formatSomme(termes: TermeAffiche[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => (i === 0 ? (t.signe < 0 ? `-${t.corps}` : t.corps) : `${t.signe < 0 ? "-" : "+"} ${t.corps}`)).join(" ");
}

function formatAffineLatex(a: number, b: number, variable = "x"): string {
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
function formatDeriveeArcfonctionLatex(arcfonction: Arcfonction, argLatex: string): string {
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

function formatULatexA(e: ExerciceDeriveeA): string {
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

const NOM_REGLE_U: Record<ExerciceDeriveeA["uType"], string> = {
  affine: "une fonction affine (dérivée constante)",
  puissance: "une puissance de x (règle : dériver x élevé à la puissance n donne n fois x élevé à la puissance n-1)",
  racine: "une racine carrée composée (règle : dériver racine(v) donne v' divisé par 2·racine(v))",
  reciproque: "un quotient k'/x (règle : dériver 1/x donne -1/x²)",
};

export function texteAideADeriveeUNiveau1(e: ExerciceDeriveeA): string {
  return `Rappel : u(x) est ${NOM_REGLE_U[e.uType]}.`;
}

export function texteAideADeriveeUNiveau2(e: ExerciceDeriveeA): AideAvecLatex {
  const uLatex = formatULatexA(e);
  const formeGenerale =
    e.uType === "affine"
      ? `u'(x) = ${e.a}`
      : e.uType === "puissance"
        ? `u'(x) = ${e.n}x^{${e.n - 1}}`
        : e.uType === "racine"
          ? `u'(x) = \\dfrac{${e.a}}{2\\sqrt{${e.a}x}}`
          : `u'(x) = -\\dfrac{${e.kPrime}}{x^{2}}`;
  return { texte: "Avec u(x) tel qu'affiché ci-dessus :", latex: `u(x) = ${uLatex} \\quad\\Rightarrow\\quad ${formeGenerale}` };
}

export function texteAideADeriveeFinaleNiveau1(e: ExerciceDeriveeA): AideAvecLatex {
  const noteSigne = e.arcfonction === "arccos" ? " Attention au signe MOINS devant la dérivée de arccos." : "";
  return {
    texte: `f'(x) = k fois la dérivée de l'arcfonction en u, fois u'(x).${noteSigne} Réutilise le u'(x) correct de l'étape précédente, pas ta propre saisie si elle était fausse.`,
    latex: "\\arcsin'(u)=\\dfrac{1}{\\sqrt{1-u^2}} \\qquad \\arccos'(u)=-\\dfrac{1}{\\sqrt{1-u^2}} \\qquad \\arctan'(u)=\\dfrac{1}{1+u^2}",
  };
}

export function texteAideADeriveeFinaleNiveau2(e: ExerciceDeriveeA): AideAvecLatex {
  const uLatex = formatULatexA(e);
  const uPrimeLatex =
    e.uType === "affine"
      ? String(e.a)
      : e.uType === "puissance"
        ? `${e.n}x^{${e.n - 1}}`
        : e.uType === "racine"
          ? `\\dfrac{${e.a}}{2\\sqrt{${e.a}x}}`
          : `-\\dfrac{${e.kPrime}}{x^{2}}`;
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, uLatex);
  return { texte: "u et u' déjà substitués (non simplifié) :", latex: `f'(x) = ${e.k}\\cdot\\left[${deriveeBase}\\right]\\cdot\\left(${uPrimeLatex}\\right)` };
}

// ============================================================================
// Famille B — f(x) = u(x)·arcfonction(v(x)), u(x)=m·x.
// ============================================================================

function formatVLatexB(e: ExerciceDeriveeB): string {
  return e.vType === "simple" ? "x" : formatSomme([{ signe: 1, corps: `${e.a}x^{2}` }, { signe: e.b >= 0 ? 1 : -1, corps: String(Math.abs(e.b)) }]);
}

export function formatFonctionBLatex(e: ExerciceDeriveeB): string {
  const uLatex = e.m === 1 ? "x" : `${e.m}x`;
  return `f(x) = ${uLatex}${NOM_LATEX[e.arcfonction]}\\left(${formatVLatexB(e)}\\right)`;
}

export function texteAideBDeriveeUNiveau1(): string {
  return "u(x) = m·x est une fonction affine, sa dérivée est constante.";
}
export function texteAideBDeriveeUNiveau2(e: ExerciceDeriveeB): AideAvecLatex {
  return { texte: "u(x) = m·x, donc :", latex: `u'(x) = ${e.m}` };
}

export function texteAideBDeriveeArcNiveau1(e: ExerciceDeriveeB): string {
  return e.vType === "simple"
    ? "Ici v(x)=x, la règle de chaîne se réduit à la dérivée directe de arcfonction."
    : "N'oublie pas la règle de la chaîne : dérivée de arcfonction(v) fois v'(x), avec v(x)=ax²+b ici non triviale.";
}
export function texteAideBDeriveeArcNiveau2(e: ExerciceDeriveeB): AideAvecLatex {
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, formatVLatexB(e));
  const vPrime = e.vType === "simple" ? "1" : `${2 * e.a}x`;
  return { texte: "v et v' déjà substitués (non simplifié) :", latex: `\\left[${deriveeBase}\\right]\\cdot\\left(${vPrime}\\right)` };
}

export function texteAideBDeriveeFinaleNiveau1(): string {
  return "Règle du produit : f'(x) = u'(x)·arcfonction(v(x)) + u(x)·[dérivée de arcfonction(v(x)), l'étape précédente] — n'oublie aucun des 2 termes.";
}
export function texteAideBDeriveeFinaleNiveau2(e: ExerciceDeriveeB): AideAvecLatex {
  const uLatex = e.m === 1 ? "x" : `${e.m}x`;
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, formatVLatexB(e));
  const vPrime = e.vType === "simple" ? "1" : `${2 * e.a}x`;
  return {
    texte: "Substitue (non simplifié) :",
    latex: `f'(x) = ${e.m}\\cdot${NOM_LATEX[e.arcfonction]}\\left(${formatVLatexB(e)}\\right) + ${uLatex}\\cdot\\left[${deriveeBase}\\right]\\cdot\\left(${vPrime}\\right)`,
  };
}

// ============================================================================
// Famille C — f(x) = k·arcfonction(ax) / √(1-(ax)²).
// ============================================================================

export function formatFonctionCLatex(e: ExerciceDeriveeC): string {
  const num = formatCoefFois(e.k, `${NOM_LATEX[e.arcfonction]}\\left(${e.a}x\\right)`);
  return `f(x) = \\dfrac{${num}}{\\sqrt{1-(${e.a}x)^{2}}}`;
}

export function texteAideCNumerateurNiveau1(): string {
  return "Numérateur : dérivée de k·arcfonction(ax) — n'oublie pas la chaîne sur l'argument ax.";
}
export function texteAideCNumerateurNiveau2(e: ExerciceDeriveeC): AideAvecLatex {
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, `${e.a}x`);
  return { texte: "k et a déjà substitués :", latex: `N'(x) = ${e.k}\\cdot\\left[${deriveeBase}\\right]\\cdot ${e.a}` };
}

export function texteAideCDenominateurNiveau1(): string {
  return "Dénominateur : D(x)=√(1-(ax)²) — écris-le sous forme (1-(ax)²)^(1/2) puis applique la chaîne.";
}
export function texteAideCDenominateurNiveau2(e: ExerciceDeriveeC): AideAvecLatex {
  return { texte: "Substitue a :", latex: `D'(x) = \\dfrac{-${e.a}^{2}x}{\\sqrt{1-(${e.a}x)^{2}}}` };
}

export function texteAideCDeriveeFinaleNiveau1(): string {
  return "Formule du quotient f'=(N'D-ND')/D² avec les N', D' CORRECTS des étapes précédentes — attention, aucune simplification supplémentaire n'est garantie ici, ne force pas une forme plus courte qui n'existe pas.";
}
export function texteAideCDeriveeFinaleNiveau2(e: ExerciceDeriveeC): AideAvecLatex {
  const arcTexteLatex = NOM_LATEX[e.arcfonction];
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, `${e.a}x`);
  const nLatex = `${e.k}${arcTexteLatex}\\left(${e.a}x\\right)`;
  const nPrimeLatex = `${e.k}\\cdot\\left[${deriveeBase}\\right]\\cdot ${e.a}`;
  const dLatex = `\\sqrt{1-(${e.a}x)^{2}}`;
  const dPrimeLatex = `\\dfrac{-${e.a}^{2}x}{${dLatex}}`;
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

export function texteAideDNumerateurNiveau1(): string {
  return "Dérive le numérateur seul, en n'oubliant pas la chaîne sur u=ax+b.";
}
export function texteAideDNumerateurNiveau2(e: ExerciceDeriveeD): AideAvecLatex {
  const uLatex = formatAffineLatex(e.a, e.b);
  const arcfonctionHaut = e.orientation === "sinSurCos" ? "arcsin" : "arccos";
  const deriveeBase = formatDeriveeArcfonctionLatex(arcfonctionHaut, uLatex);
  return { texte: "u déjà substitué :", latex: `N'(x) = \\left[${deriveeBase}\\right]\\cdot ${e.a}` };
}

export function texteAideDDenominateurNiveau1(): string {
  return "Dérive le dénominateur seul, même principe que le numérateur.";
}
export function texteAideDDenominateurNiveau2(e: ExerciceDeriveeD): AideAvecLatex {
  const uLatex = formatAffineLatex(e.a, e.b);
  const arcfonctionBas = e.orientation === "sinSurCos" ? "arccos" : "arcsin";
  const deriveeBase = formatDeriveeArcfonctionLatex(arcfonctionBas, uLatex);
  return { texte: "u déjà substitué :", latex: `D'(x) = \\left[${deriveeBase}\\right]\\cdot ${e.a}` };
}

export function texteAideDBrutNiveau1(): string {
  return "Assemble via la formule du quotient (N'D-ND')/D² avec les N,N',D,D' corrects — résultat BRUT, ne cherche pas encore à simplifier.";
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

export function texteAideDSimplifieeNiveau1(): AideAvecLatex {
  return {
    texte: "Identité NOUVELLE à connaître : pour tout u∈[-1;1],",
    latex: "\\arcsin(u) + \\arccos(u) = \\dfrac{\\pi}{2}",
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

export function texteAideEDeriveeInterneNiveau1(): string {
  return "Dérive l'arcfonction interne complète (arcfonction(v(x)), avec sa propre chaîne sur v).";
}
export function texteAideEDeriveeInterneNiveau2(e: ExerciceDeriveeE): AideAvecLatex {
  const vLatex = e.a === 1 ? "x" : `${e.a}x`;
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, vLatex);
  return { texte: "v déjà substitué :", latex: `w'(x) = \\left[${deriveeBase}\\right]\\cdot ${e.a}` };
}

export function texteAideEDeriveeFinaleNiveau1(e: ExerciceDeriveeE): string {
  const nomG = e.gType === "carre" ? "la mise au carré" : "la racine carrée";
  return `Attention : ici c'est ${nomG} qui est appliquée EN DERNIER, pas la fonction cyclométrique — identifie d'abord quelle opération encadre tout le reste.`;
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

export function texteAideFBruteNiveau1(): string {
  return "Chaîne à deux niveaux : dérivée de trig(u) fois dérivée de u=arcfonction(v) — le résultat peut contenir cos(arcfonction(v)) ou sin(arcfonction(v)) non simplifié, c'est normal à cette étape.";
}
export function texteAideFBruteNiveau2(e: ExerciceDeriveeF): AideAvecLatex {
  const vLatex = e.a === 1 ? "x" : `${e.a}x`;
  const u = `${NOM_LATEX[e.arcfonction]}\\left(${vLatex}\\right)`;
  const trigPrime = e.trig === "sin" ? `\\cos\\left(${u}\\right)` : `-\\sin\\left(${u}\\right)`;
  const uPrime = `\\left[${formatDeriveeArcfonctionLatex(e.arcfonction, vLatex)}\\right]\\cdot ${e.a}`;
  return { texte: "Substitue (non simplifié) :", latex: `f'(x) = ${trigPrime}\\cdot\\left(${uPrime}\\right)` };
}

export function texteAideFSimplifieeNiveau1(): AideAvecLatex {
  return {
    texte: "Identités NOUVELLES possibles selon la combinaison (laquelle s'applique ici dépend de trig∘arcfonction) :",
    latex: "\\cos(\\arccos u)=u \\quad \\sin(\\arccos u)=\\sqrt{1-u^2} \\quad \\cos(\\arcsin u)=\\sqrt{1-u^2} \\quad \\sin(\\arcsin u)=u",
  };
}
export function texteAideFSimplifieeNiveau2(e: ExerciceDeriveeF): string {
  return `Ici la combinaison est ${e.trig}∘${e.arcfonction} — repère laquelle des identités ci-dessus s'y applique, puis simplifie (avant OU après avoir dérivé, les deux stratégies sont acceptées).`;
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

export function texteAideGDeriveeInterneNiveau1(e: ExerciceDeriveeG): string {
  return e.sousCas === "h"
    ? "Dérive v(x) = x²+c, un simple monôme."
    : "Dérive la fraction interne u = k/(x+c) — règle du quotient ou de la puissance -1 appliquée à (x+c).";
}
export function texteAideGDeriveeInterneNiveau2(e: ExerciceDeriveeG): AideAvecLatex {
  if (e.sousCas === "h") return { texte: "v(x)=x²+c, donc :", latex: "v'(x) = 2x" };
  return { texte: "u = k/(x+c), donc :", latex: `u'(x) = -\\dfrac{${e.k}}{(x+${e.c >= 0 ? e.c : `(${e.c})`})^{2}}` };
}

export function texteAideGDeriveeFinaleNiveau1(e: ExerciceDeriveeG): string {
  return e.sousCas === "h"
    ? "Combine la règle de la puissance -1 avec la formule cyclométrique : f'=-k·v'·[dérivée-de-base]/[arcfonction(v)]² — jamais l'inverse (traiter cette structure comme arcfonction(k/v) serait une erreur)."
    : "Applique la formule cyclométrique standard avec u et u' CORRECTS de l'étape précédente — jamais la structure k/arcfonction(u), une erreur différente.";
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
  const uPrimeLatex = `-\\dfrac{${e.k}}{(x+${e.c >= 0 ? e.c : `(${e.c})`})^{2}}`;
  const deriveeBase = formatDeriveeArcfonctionLatex(e.arcfonction, uLatex);
  return { texte: "u et u' déjà substitués (non résolu) :", latex: `f'(x) = \\left[${deriveeBase}\\right]\\cdot\\left(${uPrimeLatex}\\right)` };
}

// ============================================================================
// Total de points du récapitulatif — SOMME des scores réellement calculés par le moteur
// (`moteur/etapeTentatives.ts` + pénalité d'aide, voir `sessionDeriveesCyclometriques.ts`), jamais
// une formule reconstruite ici : un écran vert (correct, mais avec une tentative ratée en cours de
// route) peut légitimement contribuer moins que 100/100 — affiché EN PLUS de `LigneRecap`, jamais à
// sa place (voir `ResultatPanelDeriveesCyclometriques.tsx`). `maximum` = 100 × nombre d'écrans
// réellement traversés pour la famille tirée (2 à 4 selon la famille — voir `typesDeriveesCyclometriques.ts`,
// la famille D étant la plus étoffée avec 4 écrans).
// ============================================================================

export interface TotalPoints {
  points: number;
  maximum: number;
}

export function calculerTotalPointsDeriveesCyclometriques(resultat: ResultatExerciceDeriveesCyclometriques): TotalPoints {
  switch (resultat.famille) {
    case "A":
      return { points: resultat.scoreDeriveeU + resultat.scoreDeriveeFinale, maximum: 200 };
    case "B":
      return { points: resultat.scoreDeriveeU + resultat.scoreDeriveeArc + resultat.scoreDeriveeFinale, maximum: 300 };
    case "C":
      return { points: resultat.scoreNumerateur + resultat.scoreDenominateur + resultat.scoreDeriveeFinale, maximum: 300 };
    case "D":
      return { points: resultat.scoreNumerateur + resultat.scoreDenominateur + resultat.scoreBrut + resultat.scoreSimplifiee, maximum: 400 };
    case "E":
      return { points: resultat.scoreDeriveeInterne + resultat.scoreDeriveeFinale, maximum: 200 };
    case "F":
      return { points: resultat.scoreBrute + resultat.scoreSimplifiee, maximum: 200 };
    case "G":
      return { points: resultat.scoreDeriveeInterne + resultat.scoreDeriveeFinale, maximum: 200 };
  }
}
