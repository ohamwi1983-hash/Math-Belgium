import type {
  ExerciceDomaineDeriveeLogA,
  ExerciceDomaineDeriveeLogB,
  ExerciceDomaineDeriveeLogC,
  ExerciceDomaineDeriveeLogD,
  ExerciceDomaineDeriveeLogE,
  ExerciceDomaineDeriveeLogF,
  ExerciceDomaineDeriveeLogG,
  ExerciceDomaineDeriveeLogarithme,
} from "../core6e/domaineDeriveeLogarithme.types";
import type { PhaseDomaineDeriveeLogarithme, ResultatExerciceDomaineDeriveeLogarithme } from "../moteur6e/typesDomaineDeriveeLogarithme";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen16`. Toute aide qui embarque un symbole
 * LaTeX est retournée en `AideAvecLatex {texte, latex}` — jamais interpolée en texte brut (piège
 * déjà rencontré ailleurs sur ce chantier, voir CLAUDE.md). Structure calquée sur
 * `formatExponentiellesProblemes.ts` (`6gen12`, le plus récent des générateurs 6e) :
 * `consigneGenerale`/`blocDonnees`/`etatActuel` séparés (structure d'écran imposée par CLAUDE.md :
 * consigne générale → bloc données → bloc "état actuel" → bloc de travail).
 */
export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const CONSIGNE_DOMAINE = "Détermine le domaine de définition de cette fonction.";

export function consigneGenerale(exercice: ExerciceDomaineDeriveeLogarithme): string {
  if (exercice.famille === "G") return "Dérive la fonction suivante par dérivation logarithmique implicite (f(x)=u(x)^v(x)) :";
  return "Détermine le domaine puis calcule la dérivée de la fonction suivante :";
}

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

/** Jamais de coefficient `±1` littéral, jamais de terme nul affiché, jamais de double signe —
 * même convention que `formatDomaineDeriveeExponentielles.ts` (6gen7). */
function formatSommeTermes(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

function formatBase(base: number, baseEstE: boolean): string {
  return baseEstE ? "e" : String(base);
}

/** log_base(u) — `\ln(u)` si base=e, `\log_{base}(u)` sinon. */
function formatLog(u: string, base: number, baseEstE: boolean): string {
  return baseEstE ? `\\ln(${u})` : `\\log_{${base}}(${u})`;
}

/** `x-p` / `x+|p|` / `x` selon le signe de `p` — jamais `x+-3` ni `x-0`. */
function formatXMoins(p: number): string {
  if (p === 0) return "x";
  return p > 0 ? `x-${p}` : `x+${-p}`;
}

// ============================================================================
// Famille A
// ============================================================================

function formatFonctionA(exercice: ExerciceDomaineDeriveeLogA): string {
  const { base, baseEstE } = exercice;
  if (exercice.sousType === "puissance") return formatLog(`${exercice.k}^x`, base, baseEstE);
  if (exercice.sousType === "carre") return formatLog(`x^2+${exercice.c}`, base, baseEstE);
  return formatLog(formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]), base, baseEstE);
}

function consigneA(phase: "aDomaine" | "aDerivee"): string {
  return phase === "aDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction.";
}

function aideANiveau1(phase: "aDomaine" | "aDerivee"): AideAvecLatex {
  if (phase === "aDomaine") return { texte: "Un logarithme n'est défini que si son argument est strictement positif.", latex: null };
  return { texte: "Rappel de la formule générique (attention, ln(e)=1 si la base est e) :", latex: "\\frac{d}{dx}\\left[\\log_{\\text{base}}(u)\\right] = \\frac{u'(x)}{u(x)\\cdot\\ln(\\text{base})}" };
}

function aideANiveau2(phase: "aDomaine" | "aDerivee", exercice: ExerciceDomaineDeriveeLogA): AideAvecLatex {
  const b = formatBase(exercice.base, exercice.baseEstE);
  if (phase === "aDomaine") {
    if (exercice.sousType === "puissance" || exercice.sousType === "carre") return { texte: "L'argument est toujours strictement positif — domaine :", latex: "\\mathbb{R}" };
    const puissance = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
    return { texte: "Inéquation restante (non résolue) :", latex: `${puissance} > 0` };
  }
  if (exercice.sousType === "puissance") return { texte: "Forme substituée (non simplifiée), u=" + `${exercice.k}^x` + " :", latex: `\\dfrac{\\ln(${exercice.k})\\cdot ${exercice.k}^x}{${exercice.k}^x\\cdot\\ln(${b})}` };
  if (exercice.sousType === "carre") return { texte: "Forme substituée (non simplifiée), u=x²+c :", latex: `\\dfrac{2x}{(x^2+${exercice.c})\\cdot\\ln(${b})}` };
  const puissance = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
  return { texte: "Forme substituée (non simplifiée), u=mx+n :", latex: `\\dfrac{${exercice.m}}{(${puissance})\\cdot\\ln(${b})}` };
}

// ============================================================================
// Famille B
// ============================================================================

function formatFonctionB(exercice: ExerciceDomaineDeriveeLogB): string {
  if (exercice.sousType === "doubleContrainte") {
    const arg = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
    return `\\sqrt{1-${formatLog(arg, exercice.base, false)}}`;
  }
  if (exercice.sousType === "racineInterne") return formatLog("\\sqrt{1-x^2}", exercice.base, false);
  if (exercice.sousType === "quadratique") return formatLog(`x^2-${exercice.k}^2`, exercice.base, false);
  return formatLog(`\\sqrt{${formatXMoins(exercice.p)}}`, exercice.base, false);
}

function consigneB(phase: "bDomaine" | "bDerivee"): string {
  return phase === "bDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction.";
}

function aideBNiveau1(phase: "bDomaine" | "bDerivee", exercice: ExerciceDomaineDeriveeLogB): AideAvecLatex {
  if (phase === "bDomaine") {
    if (exercice.sousType === "doubleContrainte") return { texte: "Attention : il y a ICI DEUX conditions à croiser, pas une seule (l'argument du log ET le radicande).", latex: null };
    if (exercice.sousType === "racineInterne") return { texte: "L'argument du log (une racine) doit être strictement positif, et son intérieur doit être ≥ 0.", latex: null };
    if (exercice.sousType === "quadratique") return { texte: "L'argument du log doit être strictement positif — résous une inéquation quadratique.", latex: null };
    return { texte: "L'argument du log est une racine ; l'ensemble se ramène à une seule condition simple (voir aide 2).", latex: null };
  }
  return { texte: "Rappel de la formule générique — attention à la chaîne (dérivée de l'intérieur en plus) :", latex: "\\frac{d}{dx}\\left[\\log_{\\text{base}}(u)\\right] = \\frac{u'(x)}{u(x)\\cdot\\ln(\\text{base})}" };
}

function aideBNiveau2(phase: "bDomaine" | "bDerivee", exercice: ExerciceDomaineDeriveeLogB): AideAvecLatex {
  if (phase === "bDomaine") {
    if (exercice.sousType === "doubleContrainte") {
      const arg = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
      return { texte: "Les deux inéquations, affichées séparément (intersection non faite) :", latex: `\\begin{gathered} ${arg} > 0 \\\\ ${arg} \\leq ${exercice.base} \\end{gathered}` };
    }
    if (exercice.sousType === "racineInterne") return { texte: "Conditions séparées :", latex: "\\begin{gathered} 1-x^2 \\geq 0 \\\\ 1-x^2 > 0 \\end{gathered}" };
    if (exercice.sousType === "quadratique") return { texte: "Inéquation à résoudre :", latex: `x^2-${exercice.k}^2 > 0` };
    return { texte: `Condition simplifiée (x=${exercice.p} annule aussi bien la racine que le log, donc exclu) :`, latex: `x > ${exercice.p}` };
  }
  if (exercice.sousType === "doubleContrainte") {
    const arg = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
    return { texte: "u et u' (règle de la chaîne, pas encore assemblés) :", latex: `\\begin{gathered} u(x) = 1-\\log_{${exercice.base}}(${arg}) \\\\ u'(x) = -\\dfrac{${exercice.m}}{(${arg})\\cdot\\ln(${exercice.base})} \\end{gathered}` };
  }
  if (exercice.sousType === "racineInterne") return { texte: "Forme substituée (non simplifiée) :", latex: `\\dfrac{-x/\\sqrt{1-x^2}}{\\sqrt{1-x^2}\\cdot\\ln(${exercice.base})}` };
  if (exercice.sousType === "quadratique") return { texte: "Forme substituée (non simplifiée) :", latex: `\\dfrac{2x}{(x^2-${exercice.k}^2)\\cdot\\ln(${exercice.base})}` };
  return { texte: "Forme substituée (non simplifiée) :", latex: `\\dfrac{1}{2(${formatXMoins(exercice.p)})\\cdot\\ln(${exercice.base})}` };
}

// ============================================================================
// Famille C
// ============================================================================

function facteursLatexC(exercice: ExerciceDomaineDeriveeLogC): { u: string; uPrime: string; v: string; vPrime: string } {
  if (exercice.sousType === "produitLn") return { u: `${exercice.k}x`, uPrime: `${exercice.k}`, v: "\\ln(x)", vPrime: "\\dfrac{1}{x}" };
  if (exercice.sousType === "trigLn") {
    const trig = exercice.trig === "sin" ? "\\sin(x)" : "\\cos(x)";
    const trigPrime = exercice.trig === "sin" ? "\\cos(x)" : "-\\sin(x)";
    const trig2 = exercice.trig2 === "sin" ? "\\sin(x)" : "\\cos(x)";
    const trig2Prime = exercice.trig2 === "sin" ? "\\cos(x)" : "-\\sin(x)";
    return { u: trig, uPrime: trigPrime, v: `\\ln(2+${trig2})`, vPrime: `\\dfrac{${trig2Prime}}{2+${trig2}}` };
  }
  if (exercice.sousType === "expoLn") {
    const b = formatBase(exercice.base, exercice.baseEstE);
    const uPrime = exercice.baseEstE ? "e^x" : `\\ln(${exercice.base})\\cdot ${exercice.base}^x`;
    return { u: `${b}^x`, uPrime, v: "\\ln(x)", vPrime: "\\dfrac{1}{x}" };
  }
  if (exercice.sousType === "carreLn") {
    const arg = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
    return { u: "x^2", uPrime: "2x", v: `\\ln(${arg})`, vPrime: `\\dfrac{${exercice.m}}{${arg}}` };
  }
  const { k } = exercice;
  return { u: "\\ln(x)", uPrime: "\\dfrac{1}{x}", v: `\\sqrt{x^2-${k}^2}`, vPrime: `\\dfrac{x}{\\sqrt{x^2-${k}^2}}` };
}

function formatFonctionC(exercice: ExerciceDomaineDeriveeLogC): string {
  const { u, v } = facteursLatexC(exercice);
  return `(${u})\\cdot ${v}`;
}

function consigneC(phase: "cDomaine" | "cFacteurs" | "cAssemblage"): string {
  if (phase === "cDomaine") return CONSIGNE_DOMAINE;
  if (phase === "cFacteurs") return "Dérive chaque facteur SÉPARÉMENT (u'(x) et v'(x)).";
  return "Assemble via u'v+uv', à partir des dérivées CORRECTES de l'étape précédente.";
}

function aideCNiveau1(phase: "cDomaine" | "cFacteurs" | "cAssemblage"): AideAvecLatex {
  if (phase === "cDomaine") return { texte: "Un produit de fonctions déjà définies partout (ou sur un domaine simple) hérite du domaine le plus restrictif.", latex: null };
  if (phase === "cFacteurs") return { texte: "Identifie u(x) et v(x) séparément à partir de f(x)=u(x)·v(x), puis dérive chacun indépendamment.", latex: null };
  return { texte: "Rappel de la formule du produit (non substituée) :", latex: "(uv)' = u'v + uv'" };
}

function aideCNiveau2(phase: "cDomaine" | "cFacteurs" | "cAssemblage", exercice: ExerciceDomaineDeriveeLogC): AideAvecLatex {
  const { u, uPrime, v, vPrime } = facteursLatexC(exercice);
  if (phase === "cDomaine") {
    const dom = exercice.sousType === "produitLn" || exercice.sousType === "expoLn" ? "x>0" : exercice.sousType === "lnRacine" ? `x \\geq ${exercice.k}` : exercice.sousType === "trigLn" ? "\\mathbb{R}" : "";
    return { texte: "Domaine :", latex: dom || null };
  }
  if (phase === "cFacteurs") return { texte: "u(x) et v(x), pour t'aider à identifier ce que tu dois dériver :", latex: `\\begin{gathered} u(x) = ${u} \\\\ v(x) = ${v} \\end{gathered}` };
  return { texte: "u, v, u' et v' (déjà confirmés à l'étape précédente) :", latex: `u=${u},\\ v=${v},\\ u'=${uPrime},\\ v'=${vPrime}` };
}

// ============================================================================
// Famille D
// ============================================================================

function nDLatexD(exercice: ExerciceDomaineDeriveeLogD): { n: string; nPrime: string; d: string; dPrime: string } {
  if (exercice.sousType === "sommeLog") {
    const n = exercice.baseEstE ? "x+\\ln(x)" : `x+\\log_{${exercice.base}}(x)`;
    const nPrime = exercice.baseEstE ? "1+\\dfrac{1}{x}" : `1+\\dfrac{1}{x\\ln(${exercice.base})}`;
    return { n: `${n}`, nPrime, d: "x", dPrime: "1" };
  }
  if (exercice.sousType === "lnSurKx") return { n: "\\ln(x)", nPrime: "\\dfrac{1}{x}", d: `${exercice.k}x`, dPrime: `${exercice.k}` };
  const b = formatBase(exercice.base, exercice.baseEstE);
  const n = `${b}^x+x`;
  const nPrime = exercice.baseEstE ? "e^x+1" : `\\ln(${exercice.base})\\cdot ${exercice.base}^x+1`;
  return { n, nPrime, d: "\\ln(x)", dPrime: "\\dfrac{1}{x}" };
}

function formatFonctionD(exercice: ExerciceDomaineDeriveeLogD): string {
  const { n, d } = nDLatexD(exercice);
  return `\\frac{${n}}{${d}}`;
}

function consigneD(phase: "dDomaine" | "dND" | "dAssemblage"): string {
  if (phase === "dDomaine") return CONSIGNE_DOMAINE;
  if (phase === "dND") return "Dérive le numérateur N ET le dénominateur D SÉPARÉMENT (N'(x) et D'(x)).";
  return "Assemble via (N'D−ND')/D², à partir des valeurs N'/D' CORRECTES de l'étape précédente.";
}

function aideDNiveau1(phase: "dDomaine" | "dND" | "dAssemblage", exercice: ExerciceDomaineDeriveeLogD): AideAvecLatex {
  if (phase === "dDomaine") {
    if (exercice.sousType === "expoSurLn") return { texte: "Le dénominateur d'une fraction doit être non nul — vérifie si l'expression du dénominateur peut s'annuler, même si elle 'a l'air' toujours définie.", latex: null };
    return { texte: "N'oublie pas la condition du logarithme (argument strictement positif).", latex: null };
  }
  if (phase === "dND") return { texte: "Identifie N(x) et D(x) séparément à partir de f(x)=N(x)/D(x), puis dérive chacun indépendamment.", latex: null };
  return { texte: "Rappel de la formule du quotient (non substituée) :", latex: "\\left(\\frac{N}{D}\\right)' = \\frac{N'D - ND'}{D^2}" };
}

function aideDNiveau2(phase: "dDomaine" | "dND" | "dAssemblage", exercice: ExerciceDomaineDeriveeLogD): AideAvecLatex {
  const { n, nPrime, d, dPrime } = nDLatexD(exercice);
  if (phase === "dDomaine") {
    if (exercice.sousType === "expoSurLn") return { texte: "Équation dénominateur=0 (non résolue) :", latex: "\\ln(x) = 0" };
    return { texte: "Domaine : x>0 (déjà couvert par le log et/ou le dénominateur).", latex: null };
  }
  if (phase === "dND") return { texte: "N(x) et D(x), pour t'aider à identifier ce que tu dois dériver :", latex: `\\begin{gathered} N(x) = ${n} \\\\ D(x) = ${d} \\end{gathered}` };
  return { texte: "N, D, N' et D' (déjà confirmés à l'étape précédente) :", latex: `N=${n},\\ D=${d},\\ N'=${nPrime},\\ D'=${dPrime}` };
}

// ============================================================================
// Famille E
// ============================================================================

function formatFonctionEOrigine(exercice: ExerciceDomaineDeriveeLogE): string {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return "\\ln\\left((e^x-1)^2\\right)";
    case "quotientDifference": {
      const { m, n, p, q } = exercice;
      const num = formatSommeTermes([{ valeur: m, suffixe: "x" }, { valeur: n, suffixe: "" }]);
      const den = formatSommeTermes([{ valeur: p, suffixe: "x" }, { valeur: q, suffixe: "" }]);
      return `\\ln\\left(\\dfrac{${num}}{${den}}\\right)`;
    }
    case "puissanceSimple":
      return "\\ln(\\sqrt{x})";
    case "combinaison":
      return "(\\ln x)^3-\\ln(x^3)";
    case "valeurAbsolueQuadratique":
      return `\\ln\\left((x^2-${exercice.k}^2)^2\\right)`;
    case "dejaSimplifie":
      return "\\ln(x^x)";
  }
}

function formeSimplifieeLatexE(exercice: ExerciceDomaineDeriveeLogE): string {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return "2\\ln\\left|e^x-1\\right|";
    case "quotientDifference": {
      const { m, n, p, q } = exercice;
      const num = formatSommeTermes([{ valeur: m, suffixe: "x" }, { valeur: n, suffixe: "" }]);
      const den = formatSommeTermes([{ valeur: p, suffixe: "x" }, { valeur: q, suffixe: "" }]);
      return `\\ln(${num})-\\ln(${den})`;
    }
    case "puissanceSimple":
      return "\\dfrac{1}{2}\\ln(x)";
    case "combinaison":
      return "(\\ln x)^3-3\\ln(x)";
    case "valeurAbsolueQuadratique":
      return `2\\ln\\left|x^2-${exercice.k}^2\\right|`;
    case "dejaSimplifie":
      return "x\\ln(x)";
  }
}

function consigneE(phase: "eDomaine" | "eSimplifier" | "eDerivee"): string {
  if (phase === "eDomaine") return "Détermine le domaine de définition de cette fonction ORIGINALE (avant toute simplification).";
  if (phase === "eSimplifier") return "Simplifie l'écriture de f(x) à l'aide des propriétés du logarithme (puissance, quotient, produit).";
  return "Dérive la forme SIMPLIFIÉE et CORRECTE de l'étape précédente (nettement plus simple qu'une dérivation directe).";
}

function texteProprieteE(exercice: ExerciceDomaineDeriveeLogE): string {
  switch (exercice.sousType) {
    case "puissanceAbs":
    case "valeurAbsolueQuadratique":
      return "Propriété de la puissance : ln(u²) = 2ln|u| — ATTENTION, la valeur absolue est indispensable (u peut être négatif).";
    case "quotientDifference":
      return "Propriété du quotient : ln(a/b) = ln(a)−ln(b) — valable seulement si a ET b sont positifs SÉPARÉMENT (pas juste leur quotient).";
    case "puissanceSimple":
      return "Propriété de la puissance : ln(√x) = ln(x^(1/2)) = (1/2)ln(x).";
    case "combinaison":
      return "Propriété de la puissance : ln(x³) = 3ln(x) — n'affecte QUE ce terme, (ln x)³ reste inchangé (ce n'est pas ln d'une puissance).";
    case "dejaSimplifie":
      return "Propriété de la puissance : ln(x^x) = x·ln(x), même si x est lui-même l'exposant.";
  }
}

function aideENiveau1(phase: "eDomaine" | "eSimplifier" | "eDerivee", exercice: ExerciceDomaineDeriveeLogE): AideAvecLatex {
  if (phase === "eDomaine") return { texte: "Calcule le domaine sur l'expression ORIGINALE — n'anticipe pas la simplification.", latex: null };
  if (phase === "eSimplifier") return { texte: texteProprieteE(exercice), latex: null };
  return { texte: "La forme simplifiée est nettement plus simple à dériver — dérive-la directement.", latex: null };
}

function aideENiveau2(phase: "eDomaine" | "eSimplifier" | "eDerivee", exercice: ExerciceDomaineDeriveeLogE): AideAvecLatex {
  if (phase === "eDomaine") {
    const dom =
      exercice.sousType === "puissanceAbs" || exercice.sousType === "valeurAbsolueQuadratique"
        ? "\\mathbb{R}\\setminus\\{\\text{racine(s)}\\}"
        : exercice.sousType === "quotientDifference"
          ? "]r_1;r_2["
          : "x>0";
    return { texte: "Domaine (voir bloc données pour les valeurs exactes) :", latex: dom };
  }
  if (phase === "eSimplifier") {
    switch (exercice.sousType) {
      case "puissanceAbs":
        return { texte: "Première étape (puissance descendue, valeur absolue pas encore ajoutée) :", latex: "2\\ln(e^x-1)\\ \\text{(FAUX, il manque la valeur absolue)}" };
      case "valeurAbsolueQuadratique":
        return { texte: "Première étape (puissance descendue, valeur absolue pas encore ajoutée) :", latex: `2\\ln(x^2-${exercice.k}^2)\\ \\text{(FAUX, il manque la valeur absolue)}` };
      case "quotientDifference":
        return { texte: "Première étape (quotient séparé, pas encore les 2 termes finaux) :", latex: "\\ln(\\text{numérateur})-\\ln(\\text{dénominateur})" };
      case "puissanceSimple":
        return { texte: "Première étape (exposant 1/2 pas encore descendu) :", latex: "\\ln(x^{1/2})" };
      case "combinaison":
        return { texte: "Première étape (seul le second terme se simplifie) :", latex: "(\\ln x)^3-3\\ln(x)" };
      case "dejaSimplifie":
        return { texte: "Dernière étape laissée à toi (propriété déjà rappelée ci-dessus).", latex: null };
    }
  }
  return { texte: "Dérivée de la forme simplifiée :", latex: formeSimplifieeLatexE(exercice) };
}

// ============================================================================
// Famille F
// ============================================================================

function formatFonctionF(exercice: ExerciceDomaineDeriveeLogF): string {
  switch (exercice.sousType) {
    case "lnSurSin":
      return "\\dfrac{\\ln(2+\\sin(e^x))}{2+\\sin(e^x)}";
    case "arcsinLog":
      return `\\arcsin\\left(${formatLog(`${exercice.k}^x`, exercice.base, false)}\\right)`;
    case "racineArcsin":
      return "\\arcsin\\left(\\sqrt{1-e^x}\\right)";
    case "arctanLog":
      return "\\dfrac{\\arctan(2x)}{1-\\log_{10}(2x)}";
  }
}

function consigneF(phase: "fDomaine" | "fDerivee"): string {
  return phase === "fDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction (chaîne à plusieurs niveaux).";
}

function aideFNiveau1(phase: "fDomaine" | "fDerivee"): AideAvecLatex {
  if (phase === "fDomaine") {
    return { texte: "Énumère séparément chaque sous-expression qui impose une condition de domaine avant de les croiser.", latex: null };
  }
  return { texte: "Plusieurs niveaux de chaîne — dérive de l'extérieur vers l'intérieur, formule déjà connue des chapitres précédents.", latex: null };
}

function aideFNiveau2(phase: "fDomaine" | "fDerivee", exercice: ExerciceDomaineDeriveeLogF): AideAvecLatex {
  if (phase === "fDomaine") {
    if (exercice.sousType === "lnSurSin") return { texte: "2+sin(e^x) est toujours dans [1;3], jamais nul ni négatif — domaine :", latex: "\\mathbb{R}" };
    if (exercice.sousType === "arcsinLog") return { texte: "Condition (non résolue) :", latex: "-1 \\leq \\log_{\\text{base}}(k^x) \\leq 1" };
    if (exercice.sousType === "racineArcsin") return { texte: "Condition (non résolue) :", latex: "1-e^x \\geq 0" };
    return { texte: "Conditions individuelles (intersection non faite) :", latex: "\\begin{gathered} 2x > 0 \\\\ 1-\\log_{10}(2x) \\neq 0 \\end{gathered}" };
  }
  return { texte: "Dérivées de chaque niveau séparément — assemblage final laissé à toi.", latex: null };
}

// ============================================================================
// Famille G
// ============================================================================

interface UVLatexG {
  u: string;
  v: string;
}

function uvLatexG(exercice: ExerciceDomaineDeriveeLogG): UVLatexG {
  switch (exercice.variante) {
    case "xx":
      return { u: "x", v: "x" };
    case "xSinx":
      return { u: "x", v: "\\sin(x)" };
    case "cosTan":
      return { u: "\\cos(x)", v: "\\tan(x)" };
    case "unSurXPuissanceX":
      return { u: "1+\\dfrac{1}{x}", v: "x" };
    case "sinXInvX":
      return { u: "\\sin(x)", v: "\\dfrac{1}{x}" };
    case "racineXPuissanceX":
    case "xRacineXPuissanceX":
      return { u: "x", v: "1+\\dfrac{x}{2}" };
    case "produit":
      return { u: "x", v: "-(1+x)" };
  }
}

function formatFonctionG(exercice: ExerciceDomaineDeriveeLogG): string {
  switch (exercice.variante) {
    case "xx":
      return "x^x";
    case "xSinx":
      return "x^{\\sin(x)}";
    case "cosTan":
      return "(\\cos x)^{\\tan x}";
    case "unSurXPuissanceX":
      return "\\left(1+\\dfrac{1}{x}\\right)^x";
    case "sinXInvX":
      return "(\\sin x)^{1/x}";
    case "racineXPuissanceX":
      return "x\\cdot(\\sqrt{x})^x";
    case "xRacineXPuissanceX":
      return "x\\cdot\\sqrt{x^x}";
    case "produit":
      return "\\dfrac{1+x}{x^{1+x}}";
  }
}

function consigneG(phase: "gIdentifier" | "gFPrimeSurF" | "gIsoler"): string {
  if (phase === "gIdentifier") return "Reconnais la structure u(x)^v(x) de cette fonction (simplifie d'abord si nécessaire pour ramener à une seule base élevée à un seul exposant).";
  if (phase === "gFPrimeSurF") return "Prends le ln des deux membres et dérive implicitement : exprime f'/f à partir de la forme u^v CORRECTE de l'étape précédente.";
  return "Isole f' en multipliant par f=u^v (le cas échéant, ajoute la règle du produit pour le facteur affine restant).";
}

function aideGNiveau1(phase: "gIdentifier" | "gFPrimeSurF" | "gIsoler"): AideAvecLatex {
  if (phase === "gIdentifier") return { texte: "Cherche à ramener f(x) à une SEULE base variable élevée à un SEUL exposant variable (utilise les propriétés des puissances si besoin).", latex: null };
  if (phase === "gFPrimeSurF") return { texte: "Méthode complète : ln f = v·ln u, puis dérive les deux membres — le membre de gauche donne f'/f par dérivation implicite.", latex: null };
  return { texte: "Il faut multiplier par f (c'est-à-dire remettre u^v) pour isoler f'.", latex: null };
}

function aideGNiveau2(phase: "gIdentifier" | "gFPrimeSurF" | "gIsoler", exercice: ExerciceDomaineDeriveeLogG): AideAvecLatex {
  const { u, v } = uvLatexG(exercice);
  if (phase === "gIdentifier") return { texte: "Forme u^v attendue (base, exposant) :", latex: `u(x)=${u},\\quad v(x)=${v}` };
  if (phase === "gFPrimeSurF") return { texte: "ln f = v·ln u affiché, dérivation des deux membres non faite :", latex: `\\ln f = (${v})\\cdot\\ln(${u})` };
  return { texte: "f'/f et f=u^v rappelés côte à côte, multiplication non faite :", latex: `\\dfrac{f'}{f} = ...,\\quad f = (${u})^{${v}}` };
}

// ============================================================================
// Dispatch public.
// ============================================================================

/** Bloc de données affiché sur CHAQUE écran de l'exercice (spec : "consigne générale et bloc de
 * données... redondants sur chaque écran", "traçabilité des coefficients"). */
export function blocDonnees(exercice: ExerciceDomaineDeriveeLogarithme): string[] {
  switch (exercice.famille) {
    case "A":
      return [`f(x) = ${formatFonctionA(exercice)}`];
    case "B":
      return [`f(x) = ${formatFonctionB(exercice)}`];
    case "C":
      return [`f(x) = ${formatFonctionC(exercice)}`];
    case "D":
      return [`f(x) = ${formatFonctionD(exercice)}`];
    case "E":
      return [`f(x) = ${formatFonctionEOrigine(exercice)}`];
    case "F":
      return [`f(x) = ${formatFonctionF(exercice)}`];
    case "G":
      return [`f(x) = ${formatFonctionG(exercice)}`];
  }
}

/** État actuel — `null` sur tout écran dont la vérification ne dépend PAS d'un écran précédent
 * (domaine et dérivée sont deux tâches indépendantes pour A/B/F ; famille E : domaine calculé sur
 * l'expression ORIGINALE, indépendant de la simplification qui suit). Non-`null` uniquement quand
 * l'écran réutilise réellement la vérité mathématique confirmée d'un écran antérieur (C
 * assemblage, D assemblage, E dérivée, G écrans 2 et 3) — `gIsoler` (écran 3) cumule les DEUX
 * faits déjà confirmés (structure u^v de `gIdentifier` ET f'/f de `gFPrimeSurF`, du plus ancien au
 * plus récent), jamais seulement le dernier, puisque l'isolation de f' a réellement besoin des
 * deux. */
export function etatActuel(exercice: ExerciceDomaineDeriveeLogarithme, phase: PhaseDomaineDeriveeLogarithme): string[] | null {
  if (exercice.famille === "C" && phase === "cAssemblage") {
    const { uPrime, vPrime } = facteursLatexC(exercice);
    return [`u'(x) = ${uPrime}`, `v'(x) = ${vPrime}`];
  }
  if (exercice.famille === "D" && phase === "dAssemblage") {
    const { nPrime, dPrime } = nDLatexD(exercice);
    return [`N'(x) = ${nPrime}`, `D'(x) = ${dPrime}`];
  }
  if (exercice.famille === "E" && phase === "eDerivee") {
    return [`f(x) = ${formeSimplifieeLatexE(exercice)}\\ \\text{(forme simplifiée confirmée)}`];
  }
  if (exercice.famille === "G" && phase === "gFPrimeSurF") {
    const { u, v } = uvLatexG(exercice);
    return [`u^v = (${u})^{${v}}\\ \\text{(structure confirmée)}`];
  }
  if (exercice.famille === "G" && phase === "gIsoler") {
    const { u, v } = uvLatexG(exercice);
    return [`u^v = (${u})^{${v}}\\ \\text{(structure confirmée)}`, "\\text{f'/f confirmé à l'étape précédente}"];
  }
  return null;
}

export function consigneEcran(exercice: ExerciceDomaineDeriveeLogarithme, phase: PhaseDomaineDeriveeLogarithme): string {
  switch (exercice.famille) {
    case "A":
      return consigneA(phase as "aDomaine" | "aDerivee");
    case "B":
      return consigneB(phase as "bDomaine" | "bDerivee");
    case "C":
      return consigneC(phase as "cDomaine" | "cFacteurs" | "cAssemblage");
    case "D":
      return consigneD(phase as "dDomaine" | "dND" | "dAssemblage");
    case "E":
      return consigneE(phase as "eDomaine" | "eSimplifier" | "eDerivee");
    case "F":
      return consigneF(phase as "fDomaine" | "fDerivee");
    case "G":
      return consigneG(phase as "gIdentifier" | "gFPrimeSurF" | "gIsoler");
  }
}

export function aideNiveau1(exercice: ExerciceDomaineDeriveeLogarithme, phase: PhaseDomaineDeriveeLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideANiveau1(phase as "aDomaine" | "aDerivee");
    case "B":
      return aideBNiveau1(phase as "bDomaine" | "bDerivee", exercice);
    case "C":
      return aideCNiveau1(phase as "cDomaine" | "cFacteurs" | "cAssemblage");
    case "D":
      return aideDNiveau1(phase as "dDomaine" | "dND" | "dAssemblage", exercice);
    case "E":
      return aideENiveau1(phase as "eDomaine" | "eSimplifier" | "eDerivee", exercice);
    case "F":
      return aideFNiveau1(phase as "fDomaine" | "fDerivee");
    case "G":
      return aideGNiveau1(phase as "gIdentifier" | "gFPrimeSurF" | "gIsoler");
  }
}

export function aideNiveau2(exercice: ExerciceDomaineDeriveeLogarithme, phase: PhaseDomaineDeriveeLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideANiveau2(phase as "aDomaine" | "aDerivee", exercice);
    case "B":
      return aideBNiveau2(phase as "bDomaine" | "bDerivee", exercice);
    case "C":
      return aideCNiveau2(phase as "cDomaine" | "cFacteurs" | "cAssemblage", exercice);
    case "D":
      return aideDNiveau2(phase as "dDomaine" | "dND" | "dAssemblage", exercice);
    case "E":
      return aideENiveau2(phase as "eDomaine" | "eSimplifier" | "eDerivee", exercice);
    case "F":
      return aideFNiveau2(phase as "fDomaine" | "fDerivee", exercice);
    case "G":
      return aideGNiveau2(phase as "gIdentifier" | "gFPrimeSurF" | "gIsoler", exercice);
  }
}

/** Labels des 2 champs des écrans "cFacteurs"/"dND" (dispatch par famille). */
export function labelsDeuxChamps(exercice: ExerciceDomaineDeriveeLogarithme): { a: string; b: string } {
  if (exercice.famille === "C") return { a: "u'(x) =", b: "v'(x) =" };
  return { a: "N'(x) =", b: "D'(x) =" };
}

export interface TotalPointsRecap {
  points: number;
  maximum: number;
}

/**
 * Total de points du récapitulatif final — SOMME des scores déjà pénalisés (tentatives + aide) sur
 * chaque écran RÉELLEMENT traversé (2 ou 3 selon la famille), affiché EN COMPLÉMENT de la liste
 * colorée `LigneRecap`/`statutRecap` (jamais à sa place — convention CLAUDE.md, "récapitulatif final
 * à plat, coloré" + total). Même principe que `totalPointsDomaineDeriveeExponentielle` (`6gen7`).
 */
export function totalPointsDomaineDeriveeLogarithme(resultat: ResultatExerciceDomaineDeriveeLogarithme): TotalPointsRecap {
  switch (resultat.famille) {
    case "A":
    case "B":
    case "F":
      return { points: resultat.scoreDomaine + resultat.scoreDerivee, maximum: 200 };
    case "C":
      return { points: resultat.scoreDomaine + resultat.scoreFacteurs + resultat.scoreAssemblage, maximum: 300 };
    case "D":
      return { points: resultat.scoreDomaine + resultat.scoreND + resultat.scoreAssemblage, maximum: 300 };
    case "E":
      return { points: resultat.scoreDomaine + resultat.scoreSimplifier + resultat.scoreDerivee, maximum: 300 };
    case "G":
      return { points: resultat.scoreIdentifier + resultat.scoreFPrimeSurF + resultat.scoreIsoler, maximum: 300 };
  }
}
