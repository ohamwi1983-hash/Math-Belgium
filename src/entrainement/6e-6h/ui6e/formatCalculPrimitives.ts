import type {
  ExerciceCalculPrimitives,
  ExerciceFamilleA,
  ExerciceFamilleB,
  ExerciceFamilleC,
  ExerciceFamilleD,
  ExerciceFamilleE,
  ExerciceFamilleF,
  ExerciceFamilleG,
  TermeA,
  TypeGFamilleB,
  TypeTermeA,
} from "../core6e/calculPrimitives.types";
import type { PhaseCalculPrimitives } from "../moteur6e/typesCalculPrimitives";
import { coefDevant, fractionLatex, monome, polynomeLatex, puissanceX, sommeLatex, xPlus } from "./formatMonome";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen23` (réutilisé tel quel par
 * `6gen24`/`6gen25` pour les familles A, B, C, G). Dispatch sur `exercice.famille` PUIS `phase`.
 *
 * **Champs génériques** (`ChampDef[]`) : chaque écran expose 1 à 3 champs texte libre, consommés
 * par le composant UNIQUE `EtapeChampsCalculPrimitives` — l'ORDRE des champs retournés par
 * `champsEcran` correspond à l'ordre attendu par `moteur6e/verificationCalculPrimitives.ts`.
 *
 * Audit du chapitre 4 de 6e (corrections) :
 * - toutes les écritures passent par `formatMonome.ts` (plus de « 1x », « x^{1} », « x + 0 », « /1² »,
 *   « 2·−1 », « 3/3 ») ;
 * - chaque écran a sa VRAIE réponse attendue (`reponseIntermediaire…`), affichée après les essais
 *   et dans le récapitulatif — plus un simple libellé « Étape 1 (réécriture) » ;
 * - aides : le texte est une phrase terminée par « : », la formule va dans la partie LaTeX ; les
 *   aides de niveau 2 donnent un vrai pas (plus de « Continue le calcul… ») ;
 * - placeholders hors de l'espace de tirage (jamais la réponse d'une instance possible) ;
 * - « IBP » → « IPP » (vocabulaire du cours).
 */

export interface ChampDef {
  label: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Texte brut mêlé à du LaTeX inline court — rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Fraction irréductible LaTeX pour un rationnel EXACT num/den — conservé pour les appelants. */
export function formatFractionLatex(num: number, den: number): string {
  return fractionLatex(num, den);
}

/** Signe + magnitude (« -\dfrac{3}{x} », « + \dfrac{3}{x} »). */
function signer(negatif: boolean, magnitude: string, premier: boolean): string {
  if (premier) return negatif ? `-${magnitude}` : magnitude;
  return negatif ? ` - ${magnitude}` : ` + ${magnitude}`;
}

/** Facteur affine entre parenthèses (« (x-2) »), ou « x » seul si la constante est nulle. */
function facteurAffine(c: number): string {
  return c === 0 ? "x" : `(${xPlus(c)})`;
}

// ============================================================================
// Famille A.
// ============================================================================

function termeFLatexA(t: TermeA, premier: boolean): string {
  const negatif = t.coef < 0;
  const abs = Math.abs(t.coef);
  switch (t.type) {
    case "invX":
      return signer(negatif, `\\dfrac{${abs}}{x}`, premier);
    case "puissance":
      return monome(t.coef, 1, puissanceX(t.n as number), premier);
    case "expX":
      return monome(t.coef, 1, "e^{x}", premier);
    case "cosX":
      return monome(t.coef, 1, "\\cos(x)", premier);
    case "baseX":
      return signer(negatif, `${abs === 1 ? "" : `${abs}\\cdot `}${t.base}^{x}`, premier);
    case "arctanTerme":
      return signer(negatif, `\\dfrac{${abs}}{1+x^2}`, premier);
    case "arcsinTerme":
      return signer(negatif, `\\dfrac{${abs}}{\\sqrt{1-x^2}}`, premier);
    case "constante":
      return monome(t.coef, 1, "", premier);
  }
}

function termePrimitiveLatexA(t: TermeA, premier: boolean): string {
  const negatif = t.coef < 0;
  const abs = Math.abs(t.coef);
  switch (t.type) {
    case "invX":
      return monome(t.coef, 1, "\\ln|x|", premier);
    case "puissance": {
      const n = t.n as number;
      return monome(t.coef, n + 1, puissanceX(n + 1), premier);
    }
    case "expX":
      return monome(t.coef, 1, "e^{x}", premier);
    case "cosX":
      return monome(t.coef, 1, "\\sin(x)", premier);
    case "baseX":
      return signer(negatif, `\\dfrac{${abs === 1 ? "" : `${abs}\\cdot `}${t.base}^{x}}{\\ln(${t.base})}`, premier);
    case "arctanTerme":
      return monome(t.coef, 1, "\\arctan(x)", premier);
    case "arcsinTerme":
      return monome(t.coef, 1, "\\arcsin(x)", premier);
    case "constante":
      return monome(t.coef, 1, "x", premier);
  }
}

const FORMULE_PRIMITIVE_TERME: Record<TypeTermeA, string> = {
  invX: "\\dfrac{1}{x}\\to\\ln|x|",
  puissance: "x^n\\to\\dfrac{x^{n+1}}{n+1}",
  expX: "e^x\\to e^x",
  cosX: "\\cos(x)\\to\\sin(x)",
  baseX: "a^x\\to\\dfrac{a^x}{\\ln(a)}",
  arctanTerme: "\\dfrac{1}{1+x^2}\\to\\arctan(x)",
  arcsinTerme: "\\dfrac{1}{\\sqrt{1-x^2}}\\to\\arcsin(x)",
  constante: "k\\to kx",
};

function formeReecriteA(exercice: Exclude<ExerciceFamilleA, { sousType: "direct" }>): string {
  if (exercice.sousType === "diviserFraction") {
    const { a, p, b, q, r } = exercice;
    return sommeLatex([
      { num: a, corps: puissanceX(p - r) },
      { num: b, corps: puissanceX(q - r) },
    ]);
  }
  return monome(exercice.c, 1, puissanceX(2 * exercice.k + 1, 2), true);
}

/** Primitive CONNUE (correcte), constante nulle. */
export function primitiveLatexA(exercice: ExerciceFamilleA): string {
  if (exercice.sousType === "direct") return exercice.termes.map((t, i) => termePrimitiveLatexA(t, i === 0)).join("");
  if (exercice.sousType === "diviserFraction") {
    const { a, p, b, q, r } = exercice;
    const pr = p - r;
    const qr = q - r;
    return sommeLatex([
      { num: a, den: pr + 1, corps: puissanceX(pr + 1) },
      { num: b, den: qr + 1, corps: puissanceX(qr + 1) },
    ]);
  }
  const { c, k } = exercice;
  return monome(2 * c, 2 * k + 3, puissanceX(2 * k + 3, 2), true);
}

function integrandeLatexA(exercice: ExerciceFamilleA): string {
  if (exercice.sousType === "direct") return exercice.termes.map((t, i) => termeFLatexA(t, i === 0)).join("");
  if (exercice.sousType === "diviserFraction") {
    const { a, p, b, q, r } = exercice;
    const num = sommeLatex([
      { num: a, corps: puissanceX(p) },
      { num: b, corps: puissanceX(q) },
    ]);
    return `\\dfrac{${num}}{${puissanceX(r)}}`;
  }
  return monome(exercice.c, 1, `${puissanceX(exercice.k)}\\sqrt{x}`, true);
}

export function consigneGeneraleA(): FragmentConsigne[] {
  return [texte("Calcule une primitive F de la fonction f définie ci-dessous.")];
}
export function blocDonneesA(exercice: ExerciceFamilleA): string[] {
  return [`f(x)=${integrandeLatexA(exercice)}`];
}
export function consigneEcranA(exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): FragmentConsigne[] {
  if (phase === "aEcranDirect") return [texte("Primitive chaque terme de la somme, puis assemble le résultat.")];
  if (phase === "aEcran1") {
    if (exercice.sousType === "diviserFraction") return [texte("Divise chaque terme du numérateur par le dénominateur pour réécrire f en somme de puissances de x.")];
    return [texte("Combine x et "), latex("\\sqrt{x}"), texte(" en une seule puissance pour réécrire "), latex("f(x)"), texte(" sous la forme "), latex("cx^k"), texte(".")];
  }
  return [texte("Primitive la forme réécrite trouvée à l'étape précédente.")];
}
export function etatActuelA(exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): string[] | null {
  if (phase !== "aEcran2" || exercice.sousType === "direct") return null;
  return [`f(x)=${formeReecriteA(exercice)}`];
}
export function champsA(exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "aEcranDirect" || phase === "aEcran2") return [{ label: "F(x) =", placeholder: "ex : 7x^9+sin(x)+C" }];
  return [{ label: "Forme réécrite =", placeholder: exercice.sousType === "diviserProduit" ? "ex : 7x^(9/2)" : "ex : 7x^6+9x" }];
}
export function aideNiveau1A(exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "aEcran1") {
    if (exercice.sousType === "diviserProduit") return { texte: "Écris la racine comme une puissance, puis additionne les exposants :", latex: "\\sqrt{x}=x^{1/2},\\qquad x^a\\cdot x^b=x^{a+b}" };
    return { texte: "Divise séparément chaque terme du numérateur par le dénominateur, avec la règle des exposants :", latex: "\\dfrac{x^a}{x^b}=x^{a-b}" };
  }
  if (exercice.sousType === "direct") {
    const types = [...new Set(exercice.termes.map((t) => t.type))];
    return { texte: "Primitives immédiates utiles ici :", latex: types.map((t) => FORMULE_PRIMITIVE_TERME[t]).join(",\\qquad ") };
  }
  return { texte: "Primitive d'une puissance de x :", latex: "x^n\\to\\dfrac{x^{n+1}}{n+1}\\quad(n\\neq-1)" };
}
export function aideNiveau2A(exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (exercice.sousType === "direct") {
    const t0 = exercice.termes[0];
    return { texte: "Le premier terme et sa primitive (fais de même pour les autres) :", latex: `${termeFLatexA(t0, true)}\\ \\longrightarrow\\ ${termePrimitiveLatexA(t0, true)}` };
  }
  if (phase === "aEcran1") {
    if (exercice.sousType === "diviserFraction") {
      const { a, p, r } = exercice;
      return { texte: "Le premier terme, déjà divisé :", latex: `\\dfrac{${monome(a, 1, puissanceX(p), true)}}{${puissanceX(r)}}=${monome(a, 1, puissanceX(p - r), true)}` };
    }
    return { texte: "Les deux facteurs en x, écrits comme puissances :", latex: `${puissanceX(exercice.k)}\\cdot\\sqrt{x}=${puissanceX(exercice.k)}\\cdot x^{1/2}` };
  }
  return { texte: "Forme réécrite, à primitiver terme à terme :", latex: `f(x)=${formeReecriteA(exercice)}` };
}
function reponseIntermediaireA(exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): string[] {
  if (phase === "aEcran1" && exercice.sousType !== "direct") return [`f(x)=${formeReecriteA(exercice)}`];
  return [];
}

// ============================================================================
// Famille B.
// ============================================================================

function uLatexB(exercice: ExerciceFamilleB): string {
  if (exercice.typeU === "affine") {
    return sommeLatex([
      { num: exercice.mAffine as number, corps: "x" },
      { num: exercice.nAffine as number, corps: "" },
    ]);
  }
  return sommeLatex([
    { num: 1, corps: puissanceX(exercice.pPuissance as number) },
    { num: exercice.cPuissance as number, corps: "" },
  ]);
}

function uPrimeLatexB(exercice: ExerciceFamilleB): string {
  return monome(exercice.mCoef, 1, exercice.expPart === 0 ? "" : puissanceX(exercice.expPart), true);
}

/** g(u) avec u littéral (« u ») ou son expression. */
function gCorpsLatex(typeG: TypeGFamilleB, u: string, nG?: number): string {
  switch (typeG) {
    case "puissance":
      return `\\left(${u}\\right)^{${nG}}`;
    case "expU":
      return `e^{${u}}`;
    case "cosU":
      return `\\cos\\left(${u}\\right)`;
    case "sinU":
      return `\\sin\\left(${u}\\right)`;
    case "invU":
      return `\\dfrac{1}{${u}}`;
    case "invUsq":
      return `\\dfrac{1}{1+\\left(${u}\\right)^2}`;
    case "invSqrtU":
      return `\\dfrac{1}{\\sqrt{1-\\left(${u}\\right)^2}}`;
  }
}

function gPrimitiveLatexB(typeG: TypeGFamilleB, u: string, nG?: number): string {
  switch (typeG) {
    case "puissance":
      return `\\dfrac{\\left(${u}\\right)^{${(nG as number) + 1}}}{${(nG as number) + 1}}`;
    case "invU":
      return `\\ln\\left|${u}\\right|`;
    case "expU":
      return `e^{${u}}`;
    case "cosU":
      return `\\sin\\left(${u}\\right)`;
    case "sinU":
      return `-\\cos\\left(${u}\\right)`;
    case "invUsq":
      return `\\arctan\\left(${u}\\right)`;
    case "invSqrtU":
      return `\\arcsin\\left(${u}\\right)`;
  }
}

export function primitiveLatexB(exercice: ExerciceFamilleB): string {
  const { k, mCoef, typeG, nG } = exercice;
  const u = uLatexB(exercice);
  if (typeG === "puissance") return monome(k, mCoef * ((nG as number) + 1), `\\left(${u}\\right)^{${(nG as number) + 1}}`, true);
  if (typeG === "sinU") return monome(-k, mCoef, `\\cos\\left(${u}\\right)`, true);
  const corps: Record<Exclude<TypeGFamilleB, "puissance" | "sinU">, string> = {
    invU: `\\ln\\left|${u}\\right|`,
    expU: `e^{${u}}`,
    cosU: `\\sin\\left(${u}\\right)`,
    invUsq: `\\arctan\\left(${u}\\right)`,
    invSqrtU: `\\arcsin\\left(${u}\\right)`,
  };
  return monome(k, mCoef, corps[typeG], true);
}

function integrandeLatexB(exercice: ExerciceFamilleB): string {
  const { k, expPart, typeG, nG } = exercice;
  const u = uLatexB(exercice);
  const xPart = expPart === 0 ? "" : puissanceX(expPart);
  const negatif = k < 0;
  const abs = Math.abs(k);
  if (typeG === "invU" || typeG === "invUsq" || typeG === "invSqrtU") {
    const numerateur = xPart === "" ? `${abs}` : abs === 1 ? xPart : `${abs}${xPart}`;
    const denominateur = typeG === "invU" ? u : typeG === "invUsq" ? `1+\\left(${u}\\right)^2` : `\\sqrt{1-\\left(${u}\\right)^2}`;
    return signer(negatif, `\\dfrac{${numerateur}}{${denominateur}}`, true);
  }
  return `${monome(k, 1, xPart, true).replace(/^1$/, "").replace(/^-1$/, "-")}${gCorpsLatex(typeG, u, nG)}`;
}

function facteurLatexB(exercice: ExerciceFamilleB): string {
  return fractionLatex(exercice.k, exercice.mCoef);
}

export function consigneGeneraleB(): FragmentConsigne[] {
  return [texte("Calcule une primitive F de la fonction f définie ci-dessous (fonction composée).")];
}
export function blocDonneesB(exercice: ExerciceFamilleB): string[] {
  return [`f(x)=${integrandeLatexB(exercice)}`];
}
export function consigneEcranB(phase: PhaseCalculPrimitives): FragmentConsigne[] {
  if (phase === "bEcran1") return [texte("Identifie la fonction intérieure "), latex("u(x)"), texte(" et calcule "), latex("u'(x)"), texte(".")];
  if (phase === "bEcran2")
    return [
      texte("Compare le coefficient affiché dans "),
      latex("f(x)"),
      texte(" à "),
      latex("u'(x)"),
      texte(" : par quel facteur faut-il multiplier pour que la formule composée s'applique exactement ?"),
    ];
  return [texte("Applique la formule de primitive composée, multipliée par le facteur trouvé.")];
}
export function etatActuelB(exercice: ExerciceFamilleB, phase: PhaseCalculPrimitives): string[] | null {
  const lignes: string[] = [];
  if (phase === "bEcran2" || phase === "bEcran3") lignes.push(`u(x)=${uLatexB(exercice)}`, `u'(x)=${uPrimeLatexB(exercice)}`);
  if (phase === "bEcran3") lignes.push(`\\lambda=${facteurLatexB(exercice)}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsB(phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "bEcran1") return [{ label: "u(x) =", placeholder: "ex : 7x-9" }, { label: "u'(x) =", placeholder: "ex : 7" }];
  if (phase === "bEcran2") return [{ label: "Facteur λ =", placeholder: "ex : 5/9" }];
  return [{ label: "F(x) =", placeholder: "ex : (1/7)e^(7x-9)+C" }];
}
export function aideNiveau1B(phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "u(x) est l'expression placée à l'intérieur de la fonction composée (dans le cosinus, l'exponentielle, la puissance…). Dérive-la ensuite.", latex: null };
  if (phase === "bEcran2") return { texte: "La formule de primitive composée exige exactement u′(x) en facteur ; tout écart se compense par une constante λ :", latex: "\\int u'(x)\\,g\\big(u(x)\\big)\\,dx=G\\big(u(x)\\big)+C" };
  return { texte: "Multiplie la primitive G de g, évaluée en u(x), par le facteur λ trouvé :", latex: "F(x)=\\lambda\\,G\\big(u(x)\\big)" };
}
export function aideNiveau2B(exercice: ExerciceFamilleB, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Fonction intérieure (il reste à la dériver) :", latex: `u(x)=${uLatexB(exercice)}` };
  if (phase === "bEcran2") return { texte: `Coefficient numérique affiché dans f(x) : ${exercice.k < 0 ? "−" : ""}${Math.abs(exercice.k)}. Dérivée de u, à comparer :`, latex: `u'(x)=${uPrimeLatexB(exercice)}` };
  return { texte: "Facteur trouvé et primitive de g, à évaluer en u(x) :", latex: `\\lambda=${facteurLatexB(exercice)},\\qquad G(u)=${gPrimitiveLatexB(exercice.typeG, "u", exercice.nG)}` };
}
function reponseIntermediaireB(exercice: ExerciceFamilleB, phase: PhaseCalculPrimitives): string[] {
  if (phase === "bEcran1") return [`u(x)=${uLatexB(exercice)}`, `u'(x)=${uPrimeLatexB(exercice)}`];
  if (phase === "bEcran2") return [`\\lambda=${facteurLatexB(exercice)}`];
  return [];
}

// ============================================================================
// Famille C.
// ============================================================================

interface PiecesC {
  u: string;
  xDeU: string | null;
  dx: string;
  integrandeU: string;
  primitiveU: string;
  formuleAide: string;
}

function radicalC1(exercice: Extract<ExerciceFamilleC, { sousType: "1" }>): string {
  return sommeLatex([
    { num: exercice.a, corps: "x" },
    { num: exercice.b, corps: "" },
  ]);
}

function cycloLatex(cyclo: "arctan" | "arcsin"): string {
  return cyclo === "arctan" ? "\\arctan(x)" : "\\arcsin(x)";
}

function piecesC(exercice: ExerciceFamilleC): PiecesC {
  switch (exercice.sousType) {
    case "1": {
      const { a, b, k } = exercice;
      const radical = radicalC1(exercice);
      const a2 = a * a;
      const parenthese = `u^{3/2}${b > 0 ? " - " : " + "}${Math.abs(b) === 1 ? "" : Math.abs(b)}u^{1/2}`;
      const prefixe = coefDevant(k, a2);
      return {
        u: radical,
        xDeU: a === 1 ? xPlus(-b, "u") : `\\dfrac{${xPlus(-b, "u")}}{${a}}`,
        dx: a === 1 ? "du" : `\\dfrac{du}{${a}}`,
        integrandeU: prefixe === "" ? parenthese : `${prefixe}\\left(${parenthese}\\right)`,
        primitiveU: sommeLatex([
          { num: 2 * k, den: 5 * a2, corps: "u^{5/2}" },
          { num: -2 * b * k, den: 3 * a2, corps: "u^{3/2}" },
        ]),
        formuleAide: "u^n\\to\\dfrac{u^{n+1}}{n+1}\\quad(n\\neq-1)",
      };
    }
    case "2": {
      const { k, cyclo } = exercice;
      return {
        u: cycloLatex(cyclo),
        xDeU: null,
        dx: cyclo === "arctan" ? "(1+x^2)\\,du" : "\\sqrt{1-x^2}\\,du",
        integrandeU: monome(k, 1, "u^{2}", true),
        primitiveU: monome(k, 3, "u^{3}", true),
        formuleAide: "u^n\\to\\dfrac{u^{n+1}}{n+1}",
      };
    }
    case "3": {
      const { k } = exercice;
      return {
        u: "\\sqrt{x}",
        xDeU: "u^{2}",
        dx: "2u\\,du",
        integrandeU: signer(k < 0, `\\dfrac{${2 * Math.abs(k)}}{1+u^2}`, true),
        primitiveU: monome(2 * k, 1, "\\arctan(u)", true),
        formuleAide: "\\dfrac{1}{1+u^2}\\to\\arctan(u)",
      };
    }
    case "4": {
      const { k } = exercice;
      return {
        u: "e^{x}+1",
        xDeU: null,
        dx: "\\dfrac{du}{e^{x}}",
        integrandeU: signer(k < 0, `\\dfrac{${Math.abs(k)}}{\\sqrt{u}}`, true),
        primitiveU: monome(2 * k, 1, "\\sqrt{u}", true),
        formuleAide: "\\dfrac{1}{\\sqrt{u}}\\to 2\\sqrt{u}",
      };
    }
  }
}

export function primitiveLatexC(exercice: ExerciceFamilleC): string {
  switch (exercice.sousType) {
    case "1": {
      const { a, b, k } = exercice;
      const radical = radicalC1(exercice);
      return sommeLatex([
        { num: 2 * k, den: 5 * a * a, corps: `\\left(${radical}\\right)^{5/2}` },
        { num: -2 * b * k, den: 3 * a * a, corps: `\\left(${radical}\\right)^{3/2}` },
      ]);
    }
    case "2":
      return monome(exercice.k, 3, `\\left(${cycloLatex(exercice.cyclo)}\\right)^{3}`, true);
    case "3":
      return monome(2 * exercice.k, 1, "\\arctan\\left(\\sqrt{x}\\right)", true);
    case "4":
      return monome(2 * exercice.k, 1, "\\sqrt{e^{x}+1}", true);
  }
}

function integrandeLatexC(exercice: ExerciceFamilleC): string {
  switch (exercice.sousType) {
    case "1":
      return `${coefDevant(exercice.k)}x\\sqrt{${radicalC1(exercice)}}`;
    case "2": {
      const { k, cyclo } = exercice;
      const num = `${Math.abs(k) === 1 ? "" : Math.abs(k)}\\left(${cycloLatex(cyclo)}\\right)^2`;
      const den = cyclo === "arctan" ? "1+x^2" : "\\sqrt{1-x^2}";
      return signer(k < 0, `\\dfrac{${num}}{${den}}`, true);
    }
    case "3":
      return signer(exercice.k < 0, `\\dfrac{${Math.abs(exercice.k)}}{(1+x)\\sqrt{x}}`, true);
    case "4":
      return signer(exercice.k < 0, `\\dfrac{${Math.abs(exercice.k) === 1 ? "" : Math.abs(exercice.k)}e^{x}}{\\sqrt{e^{x}+1}}`, true);
  }
}

export function consigneGeneraleC(): FragmentConsigne[] {
  return [texte("Calcule une primitive F de la fonction f définie ci-dessous, par changement de variable.")];
}
export function blocDonneesC(exercice: ExerciceFamilleC): string[] {
  return [`f(x)=${integrandeLatexC(exercice)}`];
}
export function consigneEcranC(exercice: ExerciceFamilleC, phase: PhaseCalculPrimitives): FragmentConsigne[] {
  if (phase === "cEcran1") {
    const besoinX = exercice.sousType === "1" || exercice.sousType === "3";
    return [texte(besoinX ? "Pose u égal à l'expression intérieure pertinente, isole x en fonction de u, puis exprime dx en fonction de du." : "Pose u égal à l'expression intérieure pertinente et exprime dx en fonction de du.")];
  }
  if (phase === "cEcran2") return [texte("Réécris complètement l'intégrale en fonction de u uniquement.")];
  if (phase === "cEcran3") return [texte("Calcule la primitive en u.")];
  return [texte("Reviens à la variable x en remplaçant u par son expression.")];
}
export function etatActuelC(exercice: ExerciceFamilleC, phase: PhaseCalculPrimitives): string[] | null {
  if (phase === "cEcran1") return null;
  const p = piecesC(exercice);
  const lignes: string[] = [`u=${p.u},\\quad ${p.xDeU ? `x=${p.xDeU},\\quad ` : ""}dx=${p.dx}`];
  if (phase === "cEcran3" || phase === "cEcran4") lignes.push(`\\displaystyle\\int ${p.integrandeU}\\,du`);
  if (phase === "cEcran4") lignes.push(`${p.primitiveU}`);
  return lignes;
}
export function champsC(exercice: ExerciceFamilleC, phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "cEcran1") {
    const besoinX = exercice.sousType === "1" || exercice.sousType === "3";
    const base: ChampDef[] = [{ label: "u =", placeholder: "ex : 5x-7" }];
    if (besoinX) base.push({ label: "x (en fonction de u) =", placeholder: "ex : (u+7)/5" });
    base.push({ label: "dx (en fonction de du) =", placeholder: "ex : du/5" });
    return base;
  }
  if (phase === "cEcran2") return [{ label: "Intégrande en u =", placeholder: "ex : 7u^4" }];
  if (phase === "cEcran3") return [{ label: "Primitive en u =", placeholder: "ex : u^5/5" }];
  return [{ label: "F(x) =", placeholder: "ex : (5x-7)^(3/2)/3+C" }];
}
export function aideNiveau1C(exercice: ExerciceFamilleC, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Pose u, calcule sa dérivée, puis isole dx :", latex: "du=u'(x)\\,dx\\quad\\Longrightarrow\\quad dx=\\dfrac{du}{u'(x)}" };
  if (phase === "cEcran2") return { texte: "Remplace chaque occurrence de x, et dx, par son expression en u : il ne doit plus rester de x.", latex: null };
  if (phase === "cEcran3") return { texte: "Primitive immédiate à utiliser, en u :", latex: piecesC(exercice).formuleAide };
  return { texte: "Remplace u par son expression en x dans la primitive trouvée.", latex: null };
}
export function aideNiveau2C(exercice: ExerciceFamilleC, phase: PhaseCalculPrimitives): AideAvecLatex {
  const p = piecesC(exercice);
  if (phase === "cEcran1") return { texte: "Expression à poser égale à u :", latex: `u=${p.u}` };
  if (phase === "cEcran2") return { texte: "Substitution trouvée à l'étape 1 :", latex: `u=${p.u},\\quad ${p.xDeU ? `x=${p.xDeU},\\quad ` : ""}dx=${p.dx}` };
  if (phase === "cEcran3") return { texte: "Intégrande en u, à primitiver :", latex: p.integrandeU };
  return { texte: "Primitive en u et expression de u :", latex: `${p.primitiveU},\\qquad u=${p.u}` };
}
function reponseIntermediaireC(exercice: ExerciceFamilleC, phase: PhaseCalculPrimitives): string[] {
  const p = piecesC(exercice);
  if (phase === "cEcran1") return [`u=${p.u}`, ...(p.xDeU ? [`x=${p.xDeU}`] : []), `dx=${p.dx}`];
  if (phase === "cEcran2") return [`\\displaystyle\\int ${p.integrandeU}\\,du`];
  if (phase === "cEcran3") return [p.primitiveU];
  return [];
}

// ============================================================================
// Famille D.
// ============================================================================

type ExerciceFamilleDIpp = Exclude<ExerciceFamilleD, { sousType: "5" }>;

interface PiecesD {
  u: string;
  dv: string;
  du: string;
  v: string;
  uv: string;
  vDu: string;
}

function argumentK(k: number): string {
  return k === 1 ? "x" : `${k}x`;
}

function piecesD(exercice: ExerciceFamilleDIpp): PiecesD {
  switch (exercice.sousType) {
    case "1": {
      const { a, b, kTrig, trig } = exercice;
      const poly = sommeLatex([
        { num: a, corps: "x" },
        { num: b, corps: "" },
      ]);
      const arg = argumentK(kTrig);
      const autre = trig === "cos" ? "\\sin" : "\\cos";
      const signeV = trig === "cos" ? 1 : -1;
      return {
        u: poly,
        dv: `\\${trig}(${arg})\\,dx`,
        du: a === 1 ? "dx" : `${a}\\,dx`,
        v: monome(signeV, kTrig, `${autre}(${arg})`, true),
        uv: monome(signeV, kTrig, `\\left(${poly}\\right)${autre}(${arg})`, true),
        vDu: monome(signeV * a, kTrig, `${autre}(${arg})`, true),
      };
    }
    case "2": {
      const { c, kExp } = exercice;
      const poly = xPlus(c);
      const e = `e^{${argumentK(kExp)}}`;
      return {
        u: `\\left(${poly}\\right)^{2}`,
        dv: `${e}\\,dx`,
        du: `2\\left(${poly}\\right)dx`,
        v: monome(1, kExp, e, true),
        uv: monome(1, kExp, `\\left(${poly}\\right)^{2}${e}`, true),
        vDu: monome(2, kExp, `\\left(${poly}\\right)${e}`, true),
      };
    }
    case "3": {
      const { k, cyclo } = exercice;
      if (cyclo === "ln") {
        return {
          u: monome(k, 1, "\\ln(x)", true),
          dv: "dx",
          du: `\\dfrac{${k}}{x}\\,dx`,
          v: "x",
          uv: monome(k, 1, "x\\ln(x)", true),
          vDu: `${k}`,
        };
      }
      return {
        u: monome(k, 1, "\\arctan(x)", true),
        dv: "dx",
        du: `\\dfrac{${k}}{1+x^2}\\,dx`,
        v: "x",
        uv: monome(k, 1, "x\\arctan(x)", true),
        vDu: `\\dfrac{${k === 1 ? "" : k}x}{1+x^2}`,
      };
    }
    case "4": {
      const { kExp, trig } = exercice;
      const e = `e^{${argumentK(kExp)}}`;
      const derivee = trig === "sin" ? "\\cos(x)" : "\\sin(x)";
      const signeDu = trig === "sin" ? 1 : -1;
      return {
        u: `\\${trig}(x)`,
        dv: `${e}\\,dx`,
        du: `${signeDu < 0 ? "-" : ""}${derivee}\\,dx`,
        v: monome(1, kExp, e, true),
        uv: monome(1, kExp, `${e}\\${trig}(x)`, true),
        vDu: monome(signeDu, kExp, `${e}${derivee}`, true),
      };
    }
  }
}

export function primitiveLatexD(exercice: ExerciceFamilleD): string {
  switch (exercice.sousType) {
    case "5": {
      const { base, k } = exercice;
      return `\\dfrac{${k === 1 ? "" : k}(${base}e)^{x}}{1+\\ln(${base})}`;
    }
    case "1": {
      const { a, b, kTrig, trig } = exercice;
      const poly = sommeLatex([
        { num: a, corps: "x" },
        { num: b, corps: "" },
      ]);
      const arg = argumentK(kTrig);
      if (trig === "cos")
        return sommeLatex([
          { num: 1, den: kTrig, corps: `\\left(${poly}\\right)\\sin(${arg})` },
          { num: a, den: kTrig * kTrig, corps: `\\cos(${arg})` },
        ]);
      return sommeLatex([
        { num: -1, den: kTrig, corps: `\\left(${poly}\\right)\\cos(${arg})` },
        { num: a, den: kTrig * kTrig, corps: `\\sin(${arg})` },
      ]);
    }
    case "2": {
      const { c, kExp } = exercice;
      const poly = xPlus(c);
      const interieur = sommeLatex([
        { num: 1, den: kExp, corps: `\\left(${poly}\\right)^{2}` },
        { num: -2, den: kExp * kExp, corps: `\\left(${poly}\\right)` },
        { num: 2, den: kExp * kExp * kExp, corps: "" },
      ]);
      return `e^{${argumentK(kExp)}}\\left(${interieur}\\right)`;
    }
    case "3": {
      const { cyclo, k } = exercice;
      const corps = cyclo === "ln" ? "x\\ln(x)-x" : "x\\arctan(x)-\\dfrac{1}{2}\\ln(1+x^2)";
      return k === 1 ? corps : `${k}\\left(${corps}\\right)`;
    }
    case "4": {
      const { kExp, trig } = exercice;
      const e = `e^{${argumentK(kExp)}}`;
      const interieur =
        trig === "sin"
          ? sommeLatex([
              { num: kExp, corps: "\\sin(x)" },
              { num: -1, corps: "\\cos(x)" },
            ])
          : sommeLatex([
              { num: kExp, corps: "\\cos(x)" },
              { num: 1, corps: "\\sin(x)" },
            ]);
      return `\\dfrac{${e}\\left(${interieur}\\right)}{${kExp * kExp + 1}}`;
    }
  }
}

function integrandeLatexD(exercice: ExerciceFamilleD): string {
  switch (exercice.sousType) {
    case "5":
      return `${exercice.k === 1 ? "" : `${exercice.k}\\cdot `}${exercice.base}^{x}\\cdot e^{x}`;
    case "1": {
      const poly = sommeLatex([
        { num: exercice.a, corps: "x" },
        { num: exercice.b, corps: "" },
      ]);
      return `\\left(${poly}\\right)\\${exercice.trig}(${argumentK(exercice.kTrig)})`;
    }
    case "2":
      return `\\left(${xPlus(exercice.c)}\\right)^2 e^{${argumentK(exercice.kExp)}}`;
    case "3":
      return monome(exercice.k, 1, exercice.cyclo === "ln" ? "\\ln(x)" : "\\arctan(x)", true);
    case "4":
      return `e^{${argumentK(exercice.kExp)}}\\${exercice.trig}(x)`;
  }
}

export function consigneGeneraleD(): FragmentConsigne[] {
  return [texte("Calcule une primitive F de la fonction f définie ci-dessous.")];
}
export function blocDonneesD(exercice: ExerciceFamilleD): string[] {
  return [`f(x)=${integrandeLatexD(exercice)}`];
}
export function consigneEcranD(exercice: ExerciceFamilleD, phase: PhaseCalculPrimitives): FragmentConsigne[] {
  if (phase === "dEcranDirect") return [texte("Avant de te lancer dans une intégration par parties, regarde si l'expression peut se simplifier : est-ce vraiment nécessaire ici ?")];
  if (phase === "dEcran1") return [texte("Choisis u et dv pour l'intégration par parties (IPP). Pour u, priorité au logarithme, puis à la fonction cyclométrique, au polynôme, et enfin à la fonction trigonométrique ou exponentielle.")];
  if (phase === "dEcran2") return [texte("Calcule du (différentielle de u) et v (primitive de dv), à partir du choix de l'étape précédente.")];
  if (phase === "dEcran3") return [texte("Applique la formule "), latex("\\int u\\,dv = uv - \\int v\\,du"), texte(".")];
  if (exercice.sousType === "4") return [texte("Calcule la primitive finale : une deuxième IPP fait réapparaître l'intégrale de départ, qu'il faut alors isoler.")];
  if (exercice.sousType === "2") return [texte("Calcule la primitive finale : une deuxième IPP est nécessaire pour la nouvelle intégrale.")];
  return [texte("Calcule la primitive finale, à partir de la nouvelle intégrale de l'étape précédente.")];
}
export function etatActuelD(exercice: ExerciceFamilleD, phase: PhaseCalculPrimitives): string[] | null {
  if (exercice.sousType === "5") return null;
  const p = piecesD(exercice);
  const lignes: string[] = [];
  if (phase === "dEcran2" || phase === "dEcran3" || phase === "dEcran4") lignes.push(`u=${p.u},\\quad dv=${p.dv}`);
  if (phase === "dEcran3" || phase === "dEcran4") lignes.push(`du=${p.du},\\quad v=${p.v}`);
  if (phase === "dEcran4") lignes.push(`uv=${p.uv},\\quad \\displaystyle\\int v\\,du=\\int ${p.vDu}\\,dx`);
  return lignes.length > 0 ? lignes : null;
}
export function champsD(phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "dEcranDirect" || phase === "dEcran4") return [{ label: "F(x) =", placeholder: "ex : x·e^x − e^x + C" }];
  if (phase === "dEcran1") return [{ label: "u =", placeholder: "ex : 7x" }, { label: "dv (second facteur, dv = … dx) =", placeholder: "ex : sin(7x)" }];
  if (phase === "dEcran2") return [{ label: "du =", placeholder: "ex : 7dx" }, { label: "v =", placeholder: "ex : −cos(7x)/7" }];
  return [{ label: "uv =", placeholder: "ex : x·sin(7x)/7" }, { label: "Intégrande de la nouvelle intégrale (v·u′, sans le signe) =", placeholder: "ex : sin(7x)/7" }];
}
export function aideNiveau1D(exercice: ExerciceFamilleD, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "dEcranDirect") return { texte: "Deux exponentielles multipliées se combinent en une seule :", latex: "a^x\\cdot e^x=(ae)^x" };
  if (phase === "dEcran1") return { texte: "u doit être la partie qui se SIMPLIFIE en la dérivant (ou qui n'a pas de primitive immédiate, comme ln ou arctan) ; dv est le reste, facile à primitiver.", latex: null };
  if (phase === "dEcran2") return { texte: "Dérive u, et primitive dv (avec une constante nulle) :", latex: "du=u'(x)\\,dx" };
  if (phase === "dEcran3") return { texte: "Le premier terme est le produit uv ; la nouvelle intégrale porte sur v·u′ (le signe − reste devant l'intégrale) :", latex: "\\int u\\,dv=uv-\\int v\\,du" };
  if (exercice.sousType === "4") return { texte: "Après la deuxième IPP, l'intégrale de départ I réapparaît ; pose une équation en I et résous-la :", latex: "I=\\ldots-k\\,I\\quad\\Longrightarrow\\quad(1+k)\\,I=\\ldots" };
  if (exercice.sousType === "2") return { texte: "La nouvelle intégrale contient encore un polynôme : refais une IPP en dérivant ce polynôme.", latex: null };
  return { texte: "Calcule la nouvelle intégrale, puis assemble :", latex: "F(x)=uv-\\int v\\,du" };
}
export function aideNiveau2D(exercice: ExerciceFamilleD, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (exercice.sousType === "5") {
    return { texte: "Primitive d'une exponentielle de base quelconque :", latex: `b^x\\to\\dfrac{b^x}{\\ln(b)},\\qquad \\ln(${exercice.base}e)=1+\\ln(${exercice.base})` };
  }
  const p = piecesD(exercice);
  if (phase === "dEcran1") return { texte: "Partie à dériver :", latex: `u=${p.u}` };
  if (phase === "dEcran2") return { texte: "Choix de l'étape 1 :", latex: `u=${p.u},\\qquad dv=${p.dv}` };
  if (phase === "dEcran3") return { texte: "Valeurs à utiliser :", latex: `u=${p.u},\\quad v=${p.v},\\quad du=${p.du}` };
  if (exercice.sousType === "4") {
    const { kExp, trig } = exercice;
    const e = `e^{${argumentK(kExp)}}`;
    const equation =
      trig === "sin"
        ? sommeLatex([
            { num: 1, den: kExp, corps: `${e}\\sin(x)` },
            { num: -1, den: kExp * kExp, corps: `${e}\\cos(x)` },
            { num: -1, den: kExp * kExp, corps: "I" },
          ])
        : sommeLatex([
            { num: 1, den: kExp, corps: `${e}\\cos(x)` },
            { num: 1, den: kExp * kExp, corps: `${e}\\sin(x)` },
            { num: -1, den: kExp * kExp, corps: "I" },
          ]);
    return { texte: "Équation obtenue après les deux IPP (I désigne l'intégrale de départ) :", latex: `I=${equation}` };
  }
  return { texte: "Il reste à calculer cette intégrale :", latex: `F(x)=${p.uv}-\\displaystyle\\int ${p.vDu}\\,dx` };
}
function reponseIntermediaireD(exercice: ExerciceFamilleD, phase: PhaseCalculPrimitives): string[] {
  if (exercice.sousType === "5") return [];
  const p = piecesD(exercice);
  if (phase === "dEcran1") return [`u=${p.u}`, `dv=${p.dv}`];
  if (phase === "dEcran2") return [`du=${p.du}`, `v=${p.v}`];
  if (phase === "dEcran3") return [`uv=${p.uv}`, `\\displaystyle\\int v\\,du=\\int ${p.vDu}\\,dx`];
  return [];
}

// ============================================================================
// Famille E.
// ============================================================================

interface PiecesE {
  xTheta: string;
  dx: string;
  simplifiee: string;
  integrandeTheta: string;
  primitiveTheta: string;
}

function piecesE(exercice: ExerciceFamilleE): PiecesE {
  const { a } = exercice;
  const a2 = a * a;
  if (exercice.sousType === "sinus") {
    return {
      xTheta: `${a}\\sin(\\theta)`,
      dx: `${a}\\cos(\\theta)\\,d\\theta`,
      simplifiee: `${a}\\cos(\\theta)`,
      integrandeTheta: `${a2}\\cos^2(\\theta)`,
      primitiveTheta: sommeLatex([
        { num: a2, den: 2, corps: "\\theta" },
        { num: a2, den: 4, corps: "\\sin(2\\theta)" },
      ]),
    };
  }
  return {
    xTheta: `${a}\\tan(\\theta)`,
    dx: `\\dfrac{${a}}{\\cos^2(\\theta)}\\,d\\theta`,
    simplifiee: `\\dfrac{${a}}{\\cos(\\theta)}`,
    integrandeTheta: `\\dfrac{\\cos(\\theta)}{${a2}\\sin^2(\\theta)}`,
    primitiveTheta: `-\\dfrac{1}{${a2}\\sin(\\theta)}`,
  };
}

export function primitiveLatexE(exercice: ExerciceFamilleE): string {
  const { a } = exercice;
  const a2 = a * a;
  if (exercice.sousType === "sinus")
    return sommeLatex([
      { num: a2, den: 2, corps: `\\arcsin\\left(\\dfrac{x}{${a}}\\right)` },
      { num: 1, den: 2, corps: `x\\sqrt{${a2}-x^2}` },
    ]);
  return `-\\dfrac{\\sqrt{${a2}+x^2}}{${a2}x}`;
}

function integrandeLatexE(exercice: ExerciceFamilleE): string {
  const a2 = exercice.a * exercice.a;
  if (exercice.sousType === "sinus") return `\\sqrt{${a2}-x^2}`;
  return `\\dfrac{1}{x^2\\sqrt{${a2}+x^2}}\\quad(x>0)`;
}

export function consigneGeneraleE(): FragmentConsigne[] {
  return [texte("Calcule une primitive F de la fonction f définie ci-dessous, par substitution trigonométrique.")];
}
export function blocDonneesE(exercice: ExerciceFamilleE): string[] {
  return [`f(x)=${integrandeLatexE(exercice)}`];
}
export function consigneEcranE(phase: PhaseCalculPrimitives): FragmentConsigne[] {
  if (phase === "eEcran1") return [texte("Pose la substitution trigonométrique appropriée et exprime dx en fonction de dθ.")];
  if (phase === "eEcran2") return [texte("Simplifie l'expression sous la racine grâce à l'identité pythagoricienne.")];
  if (phase === "eEcran3") return [texte("Intègre en θ : multiplie l'expression simplifiée par le facteur de dθ trouvé à l'étape 1.")];
  return [texte("Reviens à la variable x (un triangle rectangle de référence exprime les fonctions de θ en fonction de x).")];
}
export function etatActuelE(exercice: ExerciceFamilleE, phase: PhaseCalculPrimitives): string[] | null {
  if (phase === "eEcran1") return null;
  const p = piecesE(exercice);
  const lignes = [`x=${p.xTheta},\\quad dx=${p.dx}`];
  if (phase === "eEcran3" || phase === "eEcran4") lignes.push(`\\sqrt{\\ldots}=${p.simplifiee}`);
  if (phase === "eEcran4") lignes.push(p.primitiveTheta);
  return lignes;
}
export function champsE(phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "eEcran1") return [{ label: "x (en fonction de θ) =", placeholder: "ex : 7sin(theta)" }, { label: "dx (en fonction de dθ) =", placeholder: "ex : 7cos(theta)·dtheta" }];
  if (phase === "eEcran2") return [{ label: "Expression simplifiée en θ =", placeholder: "ex : 7cos(theta)" }];
  if (phase === "eEcran3") return [{ label: "Primitive en θ =", placeholder: "ex : theta/7" }];
  return [{ label: "F(x) =", placeholder: "ex : arcsin(x/7)+C" }];
}
export function aideNiveau1E(exercice: ExerciceFamilleE, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Choisis la substitution selon la racine :", latex: "\\sqrt{a^2-x^2}:\\ x=a\\sin(\\theta)\\qquad\\sqrt{a^2+x^2}:\\ x=a\\tan(\\theta)" };
  if (phase === "eEcran2") return { texte: "Identités utiles :", latex: "1-\\sin^2(\\theta)=\\cos^2(\\theta),\\qquad 1+\\tan^2(\\theta)=\\dfrac{1}{\\cos^2(\\theta)}" };
  if (phase === "eEcran3")
    return exercice.sousType === "sinus"
      ? { texte: "Pour intégrer un carré de cosinus, abaisse le degré :", latex: "\\cos^2(\\theta)=\\dfrac{1+\\cos(2\\theta)}{2}" }
      : { texte: "Reconnais une forme u′/u² avec u = sin(θ) :", latex: "\\dfrac{\\cos(\\theta)}{\\sin^2(\\theta)}\\to-\\dfrac{1}{\\sin(\\theta)}" };
  const { a } = exercice;
  return exercice.sousType === "sinus"
    ? { texte: "Pour revenir à x :", latex: `\\theta=\\arcsin\\left(\\dfrac{x}{${a}}\\right),\\qquad\\cos(\\theta)=\\dfrac{\\sqrt{${a * a}-x^2}}{${a}}` }
    : { texte: "Pour revenir à x (triangle de référence) :", latex: `\\sin(\\theta)=\\dfrac{x}{\\sqrt{${a * a}+x^2}}` };
}
export function aideNiveau2E(exercice: ExerciceFamilleE, phase: PhaseCalculPrimitives): AideAvecLatex {
  const p = piecesE(exercice);
  const a2 = exercice.a * exercice.a;
  if (phase === "eEcran1") return { texte: "Substitution à poser :", latex: `x=${p.xTheta}` };
  if (phase === "eEcran2")
    return exercice.sousType === "sinus"
      ? { texte: "Après substitution :", latex: `\\sqrt{${a2}-${a2}\\sin^2(\\theta)}=\\sqrt{${a2}\\cos^2(\\theta)}` }
      : { texte: "Après substitution :", latex: `\\sqrt{${a2}+${a2}\\tan^2(\\theta)}=\\sqrt{\\dfrac{${a2}}{\\cos^2(\\theta)}}` };
  if (phase === "eEcran3") return { texte: "Intégrande complet en θ :", latex: p.integrandeTheta };
  return exercice.sousType === "sinus"
    ? { texte: "Primitive en θ à réécrire en x :", latex: `${p.primitiveTheta},\\qquad\\sin(2\\theta)=2\\sin(\\theta)\\cos(\\theta)` }
    : { texte: "Primitive en θ à réécrire en x :", latex: p.primitiveTheta };
}
function reponseIntermediaireE(exercice: ExerciceFamilleE, phase: PhaseCalculPrimitives): string[] {
  const p = piecesE(exercice);
  if (phase === "eEcran1") return [`x=${p.xTheta}`, `dx=${p.dx}`];
  if (phase === "eEcran2") return [p.simplifiee];
  if (phase === "eEcran3") return [p.primitiveTheta];
  return [];
}

// ============================================================================
// Famille F.
// ============================================================================

function formeReecriteF(exercice: ExerciceFamilleF): string {
  const k = exercice.k;
  const c = coefDevant(k);
  switch (exercice.sousType) {
    case "tan":
      return `\\dfrac{${c}\\sin(x)}{\\cos(x)}`;
    case "angleDoubleSin":
      return monome(k, 2, "\\left(1-\\cos(2x)\\right)", true);
    case "angleDoubleCos":
      return monome(k, 2, "\\left(1+\\cos(2x)\\right)", true);
    case "pythagoreanFactor":
      return `${c}\\left(1+\\cos(x)\\right)`;
    case "oddPowerSin":
      return `${c}\\sin(x)\\left(1-\\cos^2(x)\\right)`;
    case "oddPowerCos":
      return `${c}\\cos(x)\\left(1-\\sin^2(x)\\right)`;
  }
}

export function primitiveLatexF(exercice: ExerciceFamilleF): string {
  const k = coefDevant(exercice.k);
  switch (exercice.sousType) {
    case "tan":
      return `-${k}\\ln|\\cos(x)|`;
    case "angleDoubleSin":
      return `${k}\\left(\\dfrac{x}{2}-\\dfrac{\\sin(2x)}{4}\\right)`.replace(/^\\left\((.*)\\right\)$/, "$1");
    case "angleDoubleCos":
      return `${k}\\left(\\dfrac{x}{2}+\\dfrac{\\sin(2x)}{4}\\right)`.replace(/^\\left\((.*)\\right\)$/, "$1");
    case "pythagoreanFactor":
      return k === "" ? "x+\\sin(x)" : `${k}\\left(x+\\sin(x)\\right)`;
    case "oddPowerSin":
      return k === "" ? "-\\cos(x)+\\dfrac{\\cos^3(x)}{3}" : `${k}\\left(-\\cos(x)+\\dfrac{\\cos^3(x)}{3}\\right)`;
    case "oddPowerCos":
      return k === "" ? "\\sin(x)-\\dfrac{\\sin^3(x)}{3}" : `${k}\\left(\\sin(x)-\\dfrac{\\sin^3(x)}{3}\\right)`;
  }
}

function integrandeLatexF(exercice: ExerciceFamilleF): string {
  const k = coefDevant(exercice.k);
  switch (exercice.sousType) {
    case "tan":
      return `${k}\\tan(x)`;
    case "angleDoubleSin":
      return `${k}\\sin^2(x)`;
    case "angleDoubleCos":
      return `${k}\\cos^2(x)`;
    case "pythagoreanFactor":
      return `${k}\\dfrac{\\sin^2(x)}{1-\\cos(x)}`;
    case "oddPowerSin":
      return `${k}\\sin^3(x)`;
    case "oddPowerCos":
      return `${k}\\cos^3(x)`;
  }
}

export function consigneGeneraleF(): FragmentConsigne[] {
  return [texte("Calcule une primitive F de la fonction f définie ci-dessous, à l'aide d'une identité trigonométrique.")];
}
export function blocDonneesF(exercice: ExerciceFamilleF): string[] {
  return [`f(x)=${integrandeLatexF(exercice)}`];
}
export function consigneEcranF(exercice: ExerciceFamilleF, phase: PhaseCalculPrimitives): FragmentConsigne[] {
  if (phase === "fEcran2") return [texte("Intègre la forme réécrite trouvée à l'étape précédente.")];
  const debut = [texte("Réécris "), latex("f(x)"), texte(" sous une forme intégrable, ")];
  switch (exercice.sousType) {
    case "tan":
      return [...debut, texte("en écrivant la tangente comme un quotient de deux fonctions trigonométriques.")];
    case "angleDoubleSin":
    case "angleDoubleCos":
      return [...debut, texte("à l'aide de la formule de duplication du cosinus.")];
    case "pythagoreanFactor":
      return [...debut, texte("en factorisant le numérateur grâce à l'identité pythagoricienne.")];
    case "oddPowerSin":
      return [...debut, texte("en séparant un facteur "), latex("\\sin(x)"), texte(", puis en utilisant l'identité pythagoricienne.")];
    case "oddPowerCos":
      return [...debut, texte("en séparant un facteur "), latex("\\cos(x)"), texte(", puis en utilisant l'identité pythagoricienne.")];
  }
}
export function etatActuelF(exercice: ExerciceFamilleF, phase: PhaseCalculPrimitives): string[] | null {
  return phase === "fEcran2" ? [`f(x)=${formeReecriteF(exercice)}`] : null;
}
export function champsF(phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "fEcran1") return [{ label: "Forme réécrite =", placeholder: "ex : 7(1+sin(3x))" }];
  return [{ label: "F(x) =", placeholder: "ex : 7sin(3x)+C" }];
}
export function aideNiveau1F(exercice: ExerciceFamilleF, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "fEcran2") {
    switch (exercice.sousType) {
      case "tan":
        return { texte: "Le quotient est de la forme u′/u, au signe près :", latex: "\\int\\dfrac{u'}{u}\\,dx=\\ln|u|+C" };
      case "angleDoubleSin":
      case "angleDoubleCos":
        return { texte: "Primitive d'un cosinus d'argument 2x :", latex: "\\cos(2x)\\to\\dfrac{\\sin(2x)}{2}" };
      case "pythagoreanFactor":
        return { texte: "Primitives immédiates :", latex: "1\\to x,\\qquad\\cos(x)\\to\\sin(x)" };
      case "oddPowerSin":
        return { texte: "Le second terme est de la forme u′·u², avec u = cos(x) :", latex: "\\sin(x)\\cos^2(x)\\to-\\dfrac{\\cos^3(x)}{3}" };
      case "oddPowerCos":
        return { texte: "Le second terme est de la forme u′·u², avec u = sin(x) :", latex: "\\cos(x)\\sin^2(x)\\to\\dfrac{\\sin^3(x)}{3}" };
    }
  }
  switch (exercice.sousType) {
    case "tan":
      return { texte: "La tangente s'écrit comme le quotient du sinus par le cosinus.", latex: null };
    case "angleDoubleSin":
    case "angleDoubleCos":
      return { texte: "Formule de duplication du cosinus — isoles-y le carré :", latex: "\\cos(2x)=1-2\\sin^2(x)=2\\cos^2(x)-1" };
    case "pythagoreanFactor":
    case "oddPowerSin":
    case "oddPowerCos":
      return { texte: "Identité pythagoricienne :", latex: "\\sin^2(x)+\\cos^2(x)=1" };
  }
}
export function aideNiveau2F(exercice: ExerciceFamilleF, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "fEcran2") return { texte: "Forme réécrite, à intégrer :", latex: `f(x)=${formeReecriteF(exercice)}` };
  const amorce: Record<ExerciceFamilleF["sousType"], string> = {
    tan: "\\tan(x)=\\dfrac{\\sin(x)}{\\cos(x)}",
    angleDoubleSin: "\\sin^2(x)=\\dfrac{1-\\cos(2x)}{2}",
    angleDoubleCos: "\\cos^2(x)=\\dfrac{1+\\cos(2x)}{2}",
    pythagoreanFactor: "\\sin^2(x)=1-\\cos^2(x)=\\big(1-\\cos(x)\\big)\\big(1+\\cos(x)\\big)",
    oddPowerSin: "\\sin^3(x)=\\sin(x)\\cdot\\sin^2(x)=\\sin(x)\\left(1-\\cos^2(x)\\right)",
    oddPowerCos: "\\cos^3(x)=\\cos(x)\\cdot\\cos^2(x)=\\cos(x)\\left(1-\\sin^2(x)\\right)",
  };
  return { texte: "Identité à appliquer :", latex: amorce[exercice.sousType] };
}
function reponseIntermediaireF(exercice: ExerciceFamilleF, phase: PhaseCalculPrimitives): string[] {
  if (phase === "fEcran1") return [`f(x)=${formeReecriteF(exercice)}`];
  return [];
}

// ============================================================================
// Famille G.
// ============================================================================

function numerateurG1(exercice: Extract<ExerciceFamilleG, { sousType: "1" }>): string {
  const { A, B, r1, r2 } = exercice;
  return polynomeLatex([A + B, -(A * r2 + B * r1)]);
}
function denominateurG1(exercice: Extract<ExerciceFamilleG, { sousType: "1" }>): string {
  const { r1, r2 } = exercice;
  return polynomeLatex([1, -(r1 + r2), r1 * r2]);
}
function numerateurG3(exercice: Extract<ExerciceFamilleG, { sousType: "3" }>): string {
  return polynomeLatex([exercice.A + exercice.B, exercice.C, exercice.A]);
}
function denominateurG4(exercice: Extract<ExerciceFamilleG, { sousType: "4" }>): string {
  return polynomeLatex([1, exercice.p, exercice.q]);
}
function carreCompleteG4(exercice: Extract<ExerciceFamilleG, { sousType: "4" }>): string {
  const { h, m } = exercice;
  return `${h === 0 ? "x^2" : `(${xPlus(h)})^2`}+${m * m}`;
}
/** Fraction signée « \dfrac{num}{den} » / « -\dfrac{|num|}{den} » (num entier). */
function fractionSignee(num: number, den: string): string {
  return signer(num < 0, `\\dfrac{${Math.abs(num)}}{${den}}`, true);
}

function decompositionPoseeG(exercice: ExerciceFamilleG): string {
  switch (exercice.sousType) {
    case "1":
      return `\\dfrac{A}{${xPlus(-exercice.r1)}}+\\dfrac{B}{${xPlus(-exercice.r2)}}`;
    case "2":
      return `\\dfrac{A}{${xPlus(-exercice.r)}}`;
    case "3":
      return "\\dfrac{A}{x}+\\dfrac{Bx+C}{x^2+1}";
    case "4":
      return `${fractionSignee(exercice.gamma, "(x+h)^2+m^2")}`;
  }
}

function decompositionNumeriqueG(exercice: ExerciceFamilleG): string {
  switch (exercice.sousType) {
    case "1":
      return `${fractionSignee(exercice.A, xPlus(-exercice.r1))}${exercice.B < 0 ? "" : "+"}${fractionSignee(exercice.B, xPlus(-exercice.r2))}`;
    case "2":
      return `${xPlus(exercice.d)}${exercice.e < 0 ? "" : "+"}${fractionSignee(exercice.e, xPlus(-exercice.r))}`;
    case "3": {
      const { A, B, C } = exercice;
      return `${fractionSignee(A, "x")}+\\dfrac{${sommeLatex([
        { num: B, corps: "x" },
        { num: C, corps: "" },
      ])}}{x^2+1}`;
    }
    case "4":
      return fractionSignee(exercice.gamma, carreCompleteG4(exercice));
  }
}

export function primitiveLatexG(exercice: ExerciceFamilleG): string {
  switch (exercice.sousType) {
    case "1": {
      const { A, B, r1, r2 } = exercice;
      return sommeLatex([
        { num: A, corps: `\\ln|${xPlus(-r1)}|` },
        { num: B, corps: `\\ln|${xPlus(-r2)}|` },
      ]);
    }
    case "2": {
      const { d, e, r } = exercice;
      return sommeLatex([
        { num: 1, den: 2, corps: "x^{2}" },
        { num: d, corps: "x" },
        { num: e, corps: `\\ln|${xPlus(-r)}|` },
      ]);
    }
    case "3": {
      const { A, B, C } = exercice;
      return sommeLatex([
        { num: A, corps: "\\ln|x|" },
        { num: B, den: 2, corps: "\\ln(x^2+1)" },
        { num: C, corps: "\\arctan(x)" },
      ]);
    }
    case "4": {
      const { gamma, h, m } = exercice;
      const argument = m === 1 ? xPlus(h) : `\\dfrac{${xPlus(h)}}{${m}}`;
      return monome(gamma, m, `\\arctan\\left(${argument}\\right)`, true);
    }
  }
}

function integrandeLatexG(exercice: ExerciceFamilleG): string {
  switch (exercice.sousType) {
    case "1":
      // Numérateur ET dénominateur développés-réduits (audit) : la forme A(x−r₂)+B(x−r₁) donnait
      // directement les coefficients, et le dénominateur factorisé rendait l'écran « factorise »
      // sans objet.
      return `\\dfrac{${numerateurG1(exercice)}}{${denominateurG1(exercice)}}`;
    case "2":
      return `\\dfrac{${polynomeLatex([1, exercice.d - exercice.r, exercice.e - exercice.r * exercice.d])}}{${xPlus(-exercice.r)}}`;
    case "3":
      return `\\dfrac{${numerateurG3(exercice)}}{x^3+x}`;
    case "4":
      return fractionSignee(exercice.gamma, denominateurG4(exercice));
  }
}

export function consigneGeneraleG(): FragmentConsigne[] {
  return [texte("Calcule une primitive F de la fonction f définie ci-dessous, par décomposition en éléments simples.")];
}
export function blocDonneesG(exercice: ExerciceFamilleG): string[] {
  return [`f(x)=${integrandeLatexG(exercice)}`];
}
export function consigneEcranG(exercice: ExerciceFamilleG, phase: PhaseCalculPrimitives): FragmentConsigne[] {
  if (phase === "gEcran1") return [texte("Cette fraction est impropre (degré du numérateur ≥ degré du dénominateur) : effectue la division euclidienne et écris le reste sous forme de fraction propre.")];
  if (phase === "gEcran2") {
    if (exercice.sousType === "4")
      return [texte("Complète le carré au dénominateur, puis pose la décomposition sous la forme "), latex("\\dfrac{\\gamma}{(x+h)^2+m^2}"), texte(" (h et m à déterminer).")];
    return [texte("Factorise le dénominateur et pose la décomposition en éléments simples, avec des coefficients indéterminés (A, B, C).")];
  }
  if (phase === "gEcran3") return [texte("Détermine la valeur de chaque coefficient indéterminé.")];
  return [texte("Intègre chaque terme de la décomposition trouvée.")];
}
export function etatActuelG(exercice: ExerciceFamilleG, phase: PhaseCalculPrimitives): string[] | null {
  const lignes: string[] = [];
  if (exercice.sousType === "2" && (phase === "gEcran2" || phase === "gEcran3" || phase === "gEcran4")) {
    lignes.push(`f(x)=${xPlus(exercice.d)}${exercice.e < 0 ? "" : "+"}${fractionSignee(exercice.e, xPlus(-exercice.r))}`);
  }
  if (phase === "gEcran3") lignes.push(decompositionPoseeG(exercice));
  if (phase === "gEcran4") lignes.push(`f(x)=${decompositionNumeriqueG(exercice)}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsG(exercice: ExerciceFamilleG, phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "gEcran1") return [{ label: "Quotient =", placeholder: "ex : x+7" }, { label: "Fraction propre restante =", placeholder: "ex : 9/(x+7)" }];
  if (phase === "gEcran2") return [{ label: "Décomposition posée =", placeholder: exercice.sousType === "4" ? "ex : 5/((x+h)^2+m^2)" : "ex : A/(x-7)+B/(x+9)" }];
  if (phase === "gEcran3") {
    if (exercice.sousType === "1") return [{ label: "A =", placeholder: "ex : 7" }, { label: "B =", placeholder: "ex : −9" }];
    if (exercice.sousType === "2") return [{ label: "A =", placeholder: "ex : 7" }];
    if (exercice.sousType === "3") return [{ label: "A =", placeholder: "ex : 7" }, { label: "B =", placeholder: "ex : −9" }, { label: "C =", placeholder: "ex : 8" }];
    return [{ label: "h =", placeholder: "ex : 7" }, { label: "m =", placeholder: "ex : 9" }];
  }
  return [{ label: "F(x) =", placeholder: "ex : 7ln|x-9|+C" }];
}
export function aideNiveau1G(exercice: ExerciceFamilleG, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "gEcran1") return { texte: "Effectue la division euclidienne du numérateur par le dénominateur, comme pour des nombres entiers.", latex: null };
  if (phase === "gEcran2") {
    if (exercice.sousType === "4") return { texte: "Complète le carré :", latex: "x^2+px+q=\\left(x+\\dfrac{p}{2}\\right)^2+q-\\dfrac{p^2}{4}" };
    return { texte: "Forme des éléments simples, pour un facteur du premier degré puis pour un facteur du second degré irréductible :", latex: "\\dfrac{A}{x-r}\\qquad\\dfrac{Bx+C}{x^2+px+q}" };
  }
  if (phase === "gEcran3") return { texte: "Réduis au même dénominateur puis identifie les coefficients (ou remplace x par des valeurs bien choisies).", latex: null };
  if (exercice.sousType === "3") return { texte: "Primitives des éléments simples :", latex: "\\dfrac{1}{x}\\to\\ln|x|,\\quad\\dfrac{2x}{x^2+1}\\to\\ln(x^2+1),\\quad\\dfrac{1}{x^2+1}\\to\\arctan(x)" };
  if (exercice.sousType === "4") return { texte: "Primitive de l'élément simple :", latex: "\\dfrac{1}{(x+h)^2+m^2}\\to\\dfrac{1}{m}\\arctan\\left(\\dfrac{x+h}{m}\\right)" };
  return { texte: "Primitive d'un élément simple du premier degré :", latex: "\\dfrac{A}{x-r}\\to A\\ln|x-r|" };
}
export function aideNiveau2G(exercice: ExerciceFamilleG, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "gEcran1" && exercice.sousType === "2") return { texte: "Quotient de la division :", latex: xPlus(exercice.d) };
  if (phase === "gEcran2") {
    switch (exercice.sousType) {
      case "1":
        return { texte: "Dénominateur factorisé :", latex: `${denominateurG1(exercice)}=${facteurAffine(-exercice.r1)}${facteurAffine(-exercice.r2)}` };
      case "2":
        return { texte: "Fraction propre trouvée à l'étape 1 :", latex: fractionSignee(exercice.e, xPlus(-exercice.r)) };
      case "3":
        return { texte: "Dénominateur factorisé :", latex: "x^3+x=x(x^2+1)" };
      case "4":
        return { texte: "Carré complété :", latex: `${denominateurG4(exercice)}=${carreCompleteG4(exercice)}` };
    }
  }
  if (phase === "gEcran3") {
    switch (exercice.sousType) {
      case "1":
        return { texte: "Identité à exploiter (remplace x par chacune des racines) :", latex: `A${facteurAffine(-exercice.r2)}+B${facteurAffine(-exercice.r1)}=${numerateurG1(exercice)}` };
      case "2":
        return { texte: "Compare avec la fraction propre de l'étape 1 :", latex: fractionSignee(exercice.e, xPlus(-exercice.r)) };
      case "3":
        return { texte: "Identité à exploiter :", latex: `A(x^2+1)+(Bx+C)\\,x=${numerateurG3(exercice)}` };
      case "4":
        return { texte: "Identifie avec le carré complété :", latex: `${denominateurG4(exercice)}=(x+h)^2+m^2` };
    }
  }
  return { texte: "Décomposition à intégrer :", latex: `f(x)=${decompositionNumeriqueG(exercice)}` };
}
function reponseIntermediaireG(exercice: ExerciceFamilleG, phase: PhaseCalculPrimitives): string[] {
  // Quotient et reste réunis en une seule égalité (deux fragments isolés « x+2 » et « 3/(x−3) » ne
  // disaient pas lequel était le quotient).
  if (phase === "gEcran1" && exercice.sousType === "2") return [`f(x)=${xPlus(exercice.d)}${exercice.e < 0 ? "" : "+"}${fractionSignee(exercice.e, xPlus(-exercice.r))}`];
  if (phase === "gEcran2") return [decompositionPoseeG(exercice)];
  if (phase === "gEcran3") {
    switch (exercice.sousType) {
      case "1":
        return [`A=${exercice.A}`, `B=${exercice.B}`];
      case "2":
        return [`A=${exercice.e}`];
      case "3":
        return [`A=${exercice.A}`, `B=${exercice.B}`, `C=${exercice.C}`];
      case "4":
        return [`h=${exercice.h}`, `m=${exercice.m}`];
    }
  }
  return [];
}

// ============================================================================
// Dispatch commun.
// ============================================================================

/** Rappel commun ajouté à toutes les consignes générales de 6gen23 : la constante est facultative
 * (audit : « + C » était refusé alors que le cours l'écrit toujours). */
const RAPPEL_CONSTANTE: FragmentConsigne[] = [texte(" La constante "), latex("+C"), texte(" est facultative dans tes réponses.")];

export function consigneGenerale(exercice: ExerciceCalculPrimitives): FragmentConsigne[] {
  const base = (() => {
    switch (exercice.famille) {
      case "A":
        return consigneGeneraleA();
      case "B":
        return consigneGeneraleB();
      case "C":
        return consigneGeneraleC();
      case "D":
        return consigneGeneraleD();
      case "E":
        return consigneGeneraleE();
      case "F":
        return consigneGeneraleF();
      case "G":
        return consigneGeneraleG();
    }
  })();
  return [...base, ...RAPPEL_CONSTANTE];
}

export function integrandeLatex(exercice: ExerciceCalculPrimitives): string {
  switch (exercice.famille) {
    case "A":
      return integrandeLatexA(exercice);
    case "B":
      return integrandeLatexB(exercice);
    case "C":
      return integrandeLatexC(exercice);
    case "D":
      return integrandeLatexD(exercice);
    case "E":
      return integrandeLatexE(exercice);
    case "F":
      return integrandeLatexF(exercice);
    case "G":
      return integrandeLatexG(exercice);
  }
}

export function blocDonnees(exercice: ExerciceCalculPrimitives): string[] {
  return [`f(x)=${integrandeLatex(exercice)}`];
}

export function consigneEcran(exercice: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(exercice, phase);
    case "D":
      return consigneEcranD(exercice, phase);
    case "E":
      return consigneEcranE(phase);
    case "F":
      return consigneEcranF(exercice, phase);
    case "G":
      return consigneEcranG(exercice, phase);
  }
}

export function etatActuel(exercice: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(exercice, phase);
    case "F":
      return etatActuelF(exercice, phase);
    case "G":
      return etatActuelG(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(exercice, phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(exercice, phase);
    case "D":
      return champsD(phase);
    case "E":
      return champsE(phase);
    case "F":
      return champsF(phase);
    case "G":
      return champsG(exercice, phase);
  }
}

export function aideNiveau1(exercice: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(exercice, phase);
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(exercice, phase);
    case "D":
      return aideNiveau1D(exercice, phase);
    case "E":
      return aideNiveau1E(exercice, phase);
    case "F":
      return aideNiveau1F(exercice, phase);
    case "G":
      return aideNiveau1G(exercice, phase);
  }
}

export function aideNiveau2(exercice: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
    case "E":
      return aideNiveau2E(exercice, phase);
    case "F":
      return aideNiveau2F(exercice, phase);
    case "G":
      return aideNiveau2G(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseCalculPrimitives, string> = {
  aEcranDirect: "Primitive",
  aEcran1: "Étape 1 (réécriture)",
  aEcran2: "Étape 2 (primitive)",
  bEcran1: "Étape 1 (u, u')",
  bEcran2: "Étape 2 (facteur λ)",
  bEcran3: "Étape 3 (primitive)",
  cEcran1: "Étape 1 (substitution)",
  cEcran2: "Étape 2 (intégrale en u)",
  cEcran3: "Étape 3 (primitive en u)",
  cEcran4: "Étape 4 (retour à x)",
  dEcranDirect: "Primitive directe",
  dEcran1: "Étape 1 (u, dv)",
  dEcran2: "Étape 2 (du, v)",
  dEcran3: "Étape 3 (uv, nouvelle intégrale)",
  dEcran4: "Étape 4 (primitive finale)",
  eEcran1: "Étape 1 (substitution)",
  eEcran2: "Étape 2 (simplification)",
  eEcran3: "Étape 3 (primitive en θ)",
  eEcran4: "Étape 4 (retour à x)",
  fEcran1: "Étape 1 (réécriture)",
  fEcran2: "Étape 2 (primitive)",
  gEcran1: "Étape 1 (division euclidienne)",
  gEcran2: "Étape 2 (décomposition posée)",
  gEcran3: "Étape 3 (coefficients)",
  gEcran4: "Étape 4 (primitive finale)",
};

const PHASES_FINALES: PhaseCalculPrimitives[] = ["aEcranDirect", "aEcran2", "bEcran3", "cEcran4", "dEcranDirect", "dEcran4", "eEcran4", "fEcran2", "gEcran4"];

export function estPhaseFinalePrimitive(phase: PhaseCalculPrimitives): boolean {
  return PHASES_FINALES.includes(phase);
}

/**
 * Réponse ATTENDUE d'un écran — la primitive pour un écran final, la VRAIE valeur de l'étape pour un
 * écran intermédiaire (audit : seuls des libellés s'affichaient, l'élève n'avait jamais vu la
 * réponse dont l'écran suivant part). Toujours la valeur correcte connue, jamais recalculée depuis la
 * saisie de l'élève. Utilisée après les essais, dans le récapitulatif et dans la fiche des puces.
 */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): string[] {
  if (estPhaseFinalePrimitive(phase)) return [`F(x)=${primitiveLatex(exercice)}+C`];
  const valeurs = (() => {
    switch (exercice.famille) {
      case "A":
        return reponseIntermediaireA(exercice, phase);
      case "B":
        return reponseIntermediaireB(exercice, phase);
      case "C":
        return reponseIntermediaireC(exercice, phase);
      case "D":
        return reponseIntermediaireD(exercice, phase);
      case "E":
        return reponseIntermediaireE(exercice, phase);
      case "F":
        return reponseIntermediaireF(exercice, phase);
      case "G":
        return reponseIntermediaireG(exercice, phase);
    }
  })();
  return valeurs.length > 0 ? valeurs : [`\\text{${LIBELLE_PHASE[phase]}}`];
}

export function primitiveLatex(exercice: ExerciceCalculPrimitives): string {
  switch (exercice.famille) {
    case "A":
      return primitiveLatexA(exercice);
    case "B":
      return primitiveLatexB(exercice);
    case "C":
      return primitiveLatexC(exercice);
    case "D":
      return primitiveLatexD(exercice);
    case "E":
      return primitiveLatexE(exercice);
    case "F":
      return primitiveLatexF(exercice);
    case "G":
      return primitiveLatexG(exercice);
  }
}

export const LIBELLE_FAMILLE: Record<ExerciceCalculPrimitives["famille"], string> = {
  A: "A — Primitives immédiates",
  B: "B — Fonctions composées",
  C: "C — Substitution algébrique",
  D: "D — Intégration par parties",
  E: "E — Substitution trigonométrique",
  F: "F — Identités trigonométriques",
  G: "G — Décomposition en éléments simples",
};
