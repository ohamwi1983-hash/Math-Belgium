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
} from "../core6e/calculPrimitives.types";
import type { PhaseCalculPrimitives, ResultatExerciceCalculPrimitives } from "../moteur6e/typesCalculPrimitives";
import { phasesPourExercice } from "../moteur6e/typesCalculPrimitives";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen23`. Dispatch sur
 * `exercice.famille` PUIS `phase` (et `sousType` où pertinent) — même principe que les générateurs
 * précédents du chantier (`formatDeterminerParametresLogarithme.ts`, 6gen18).
 *
 * **Champs génériques** (`ChampDef[]`) : chaque écran expose 1 à 3 champs texte libre, consommés
 * par le composant UNIQUE `EtapeChampsCalculPrimitives` (voir en-tête de ce composant) — l'ORDRE des
 * champs retournés par `champsEcran` doit toujours correspondre à l'ordre attendu par
 * `moteur6e/verificationCalculPrimitives.ts` (documenté phase par phase là-bas).
 */

export interface ChampDef {
  label: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction irréductible LaTeX pour un rationnel EXACT num/den — jamais de décimal (CLAUDE.md). */
export function formatFractionLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const signe = num < 0 !== den < 0 ? "-" : "";
  let n = Math.abs(num);
  let d = Math.abs(den);
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? `${signe}${n}` : `${signe}\\dfrac{${n}}{${d}}`;
}

/** Un terme signé "+ 3x^2" / "- \dfrac12" pour assembler une somme — `premier` omet le "+" initial.
 * Renvoie UNIQUEMENT le symbole de signe — JAMAIS la magnitude : tout appelant qui veut afficher
 * une constante additive complète (ex. "x + 3", pas juste "x + ") doit soit accoler
 * `Math.abs(coef)` (ou une fraction) juste après — voir `termeFLatexA`/`termePrimitiveLatexA` pour
 * ce patron — soit utiliser `termeAdditif` ci-dessous. */
function signe(coef: number, premier: boolean): string {
  if (coef < 0) return premier ? "-" : " - ";
  return premier ? "" : " + ";
}

/** Terme additif signé COMPLET (signe + magnitude) — " + 3" / " - 3", jamais seulement le signe.
 * Toujours en position non-première (`signe(coef, false)`) : réservé aux constantes ajoutées APRÈS
 * un premier terme déjà posé (ex. "x" + termeAdditif(n) → "x + 3"), jamais en tête d'expression
 * (`termeFLatexA` gère ce cas séparément, où le signe négatif peut ouvrir l'expression).
 *
 * **Bug trouvé en revue (corrigé ici)** : plusieurs call sites de `signe(coef, false)` à travers ce
 * fichier omettaient d'accoler la magnitude ensuite — `x${signe(b, false)}` produit "x + " ou
 * "x - " avec la valeur de `b` silencieusement absente (ex. D1 `f(x)=(x+)sin(2x)`, G1
 * `f(x)=` complètement vide). Tout call site qui voulait un terme additif complet utilise
 * maintenant `termeAdditif`, jamais `signe(...)` seule — voir la régression
 * `formatCalculPrimitives.test.ts`, "aucun signe orphelin dans le LaTeX généré". */
function termeAdditif(coef: number): string {
  return `${signe(coef, false)}${Math.abs(coef)}`;
}

function joindre(fragments: string[]): string {
  return fragments.join("").trim();
}

// ============================================================================
// Famille A.
// ============================================================================

function corpsPuissanceX(exposant: number): string {
  if (exposant === 0) return "1";
  if (exposant === 1) return "x";
  return `x^{${exposant}}`;
}

function termeFLatexA(t: TermeA, premier: boolean): string {
  const s = signe(t.coef, premier);
  const abs = Math.abs(t.coef);
  switch (t.type) {
    case "invX":
      return `${s}${abs === 1 ? "" : abs}\\dfrac{1}{x}`;
    case "puissance":
      return `${s}${abs === 1 ? "" : abs}${corpsPuissanceX(t.n as number)}`;
    case "expX":
      return `${s}${abs === 1 ? "" : abs}e^x`;
    case "cosX":
      return `${s}${abs === 1 ? "" : abs}\\cos(x)`;
    case "baseX":
      // Comme `termePrimitiveLatexA`/baseX (ligne ~131) : le "\cdot" doit disparaître EN MÊME
      // TEMPS que la magnitude quand abs===1, jamais laissé seul (même classe de bug que le signe
      // orphelin — un "\cdot" sans opérande à gauche, ex. "+ ⋅3^x" au lieu de "+3^x").
      return `${s}${abs === 1 ? "" : abs + "\\cdot "}${t.base}^x`;
    case "arctanTerme":
      return `${s}\\dfrac{${abs}}{1+x^2}`;
    case "arcsinTerme":
      return `${s}\\dfrac{${abs}}{\\sqrt{1-x^2}}`;
    case "constante":
      return `${s}${abs}`;
  }
}

function termePrimitiveLatexA(t: TermeA, premier: boolean): string {
  switch (t.type) {
    case "invX":
      return `${signe(t.coef, premier)}${Math.abs(t.coef) === 1 ? "" : Math.abs(t.coef)}\\ln|x|`;
    case "puissance": {
      const n = t.n as number;
      return `${signe(t.coef, premier)}${formatFractionLatex(Math.abs(t.coef), n + 1).replace(/^-/, "")}${corpsPuissanceX(n + 1)}`;
    }
    case "expX":
      return `${signe(t.coef, premier)}${Math.abs(t.coef) === 1 ? "" : Math.abs(t.coef)}e^x`;
    case "cosX":
      return `${signe(t.coef, premier)}${Math.abs(t.coef) === 1 ? "" : Math.abs(t.coef)}\\sin(x)`;
    case "baseX":
      return `${signe(t.coef, premier)}\\dfrac{${Math.abs(t.coef) === 1 ? "" : Math.abs(t.coef) + "\\cdot "}${t.base}^x}{\\ln(${t.base})}`;
    case "arctanTerme":
      return `${signe(t.coef, premier)}${Math.abs(t.coef) === 1 ? "" : Math.abs(t.coef)}\\arctan(x)`;
    case "arcsinTerme":
      return `${signe(t.coef, premier)}${Math.abs(t.coef) === 1 ? "" : Math.abs(t.coef)}\\arcsin(x)`;
    case "constante":
      return `${signe(t.coef, premier)}${Math.abs(t.coef)}x`;
  }
}

/** Primitive CONNUE (correcte), affichée uniquement au récapitulatif final (jamais recalculée
 * depuis une saisie élève — CLAUDE.md). */
export function primitiveLatexA(exercice: ExerciceFamilleA): string {
  if (exercice.sousType === "direct") return joindre(exercice.termes.map((t, i) => termePrimitiveLatexA(t, i === 0)));
  if (exercice.sousType === "diviserFraction") {
    const { a, p, b, q, r } = exercice;
    const pr = p - r;
    const qr = q - r;
    const t1 = `${formatFractionLatex(a, pr + 1)}${corpsPuissanceX(pr + 1)}`;
    const t2 = `${signe(b, false)}${formatFractionLatex(Math.abs(b), qr + 1)}${corpsPuissanceX(qr + 1)}`;
    return joindre([t1, t2]);
  }
  const { c, k } = exercice;
  const coef = formatFractionLatex(2 * c, 2 * k + 3);
  const expo = formatFractionLatex(2 * k + 3, 2);
  return `${coef}x^{${expo}}`;
}

function integrandeLatexA(exercice: ExerciceFamilleA): string {
  if (exercice.sousType === "direct") {
    return joindre(exercice.termes.map((t, i) => termeFLatexA(t, i === 0)));
  }
  if (exercice.sousType === "diviserFraction") {
    const { a, p, b, q, r } = exercice;
    const num = joindre([`${a === -1 ? "-" : a === 1 ? "" : a}x^{${p}}`, `${signe(b, false)}${Math.abs(b) === 1 ? "" : Math.abs(b)}x^{${q}}`]);
    return `\\dfrac{${num}}{x^{${r}}}`;
  }
  const { c, k } = exercice;
  return `${c === -1 ? "-" : c === 1 ? "" : c}x^{${k}}\\sqrt{x}`;
}

export function consigneGeneraleA(): string {
  return "Calcule une primitive F de la fonction f définie ci-dessous.";
}
export function blocDonneesA(exercice: ExerciceFamilleA): string[] {
  return [`f(x)=${integrandeLatexA(exercice)}`];
}
export function consigneEcranA(exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): string {
  if (phase === "aEcranDirect") return "Primitive chaque terme de la somme, puis assemble le résultat.";
  if (phase === "aEcran1") {
    return exercice.sousType === "diviserFraction" ? "Divise chaque terme du numérateur par le dénominateur pour réécrire f en somme de puissances de x." : "Combine x et √x en un seul exposant pour réécrire f(x) sous la forme cx^k.";
  }
  return "Primitive la forme réécrite trouvée à l'étape précédente.";
}
export function etatActuelA(exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): string[] | null {
  if (phase !== "aEcran2" || exercice.sousType === "direct") return null;
  return [`f(x)=${integrandeLatexA(exercice)}`];
}
export function champsA(exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "aEcranDirect" || phase === "aEcran2") return [{ label: "F(x) =", placeholder: "ex : 3x²+cos(x)" }];
  return [{ label: "Forme réécrite =", placeholder: exercice.sousType === "diviserProduit" ? "ex : 2x^1.5" : "ex : 3x+2/x" }];
}
export function aideNiveau1A(_exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Divise séparément chaque terme du numérateur par le dénominateur (règle des exposants xᵃ/xᵇ=xᵃ⁻ᵇ).", latex: null };
  return { texte: "Rappel des primitives immédiates : xⁿ → xⁿ⁺¹/(n+1) ; 1/x → ln|x| ; eˣ → eˣ ; cos(x) → sin(x).", latex: null };
}
export function aideNiveau2A(exercice: ExerciceFamilleA, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "aEcran1" && exercice.sousType === "diviserFraction") {
    return { texte: "Un des deux termes, déjà réécrit :", latex: `${exercice.a === 1 ? "" : exercice.a}x^{${exercice.p - exercice.r}} + \\ldots` };
  }
  return { texte: "Applique la formule de primitive terme à terme sur la forme réécrite.", latex: null };
}

// ============================================================================
// Famille B.
// ============================================================================

function gLatexB(typeG: TypeGFamilleB, uLatex: string, nG?: number): string {
  switch (typeG) {
    case "puissance":
      return `\\left(${uLatex}\\right)^{${nG}}`;
    case "invU":
      return `\\dfrac{1}{${uLatex}}`;
    case "expU":
      return `e^{${uLatex}}`;
    case "cosU":
      return `\\cos\\left(${uLatex}\\right)`;
    case "sinU":
      return `\\sin\\left(${uLatex}\\right)`;
    case "invUsq":
      return `\\dfrac{1}{1+\\left(${uLatex}\\right)^2}`;
    case "invSqrtU":
      return `\\dfrac{1}{\\sqrt{1-\\left(${uLatex}\\right)^2}}`;
  }
}

function gPrimitiveLatexB(typeG: TypeGFamilleB, uLatex: string, nG?: number): string {
  switch (typeG) {
    case "puissance":
      return `\\dfrac{\\left(${uLatex}\\right)^{${(nG as number) + 1}}}{${(nG as number) + 1}}`;
    case "invU":
      return `\\ln\\left|${uLatex}\\right|`;
    case "expU":
      return `e^{${uLatex}}`;
    case "cosU":
      return `\\sin\\left(${uLatex}\\right)`;
    case "sinU":
      return `-\\cos\\left(${uLatex}\\right)`;
    case "invUsq":
      return `\\arctan\\left(${uLatex}\\right)`;
    case "invSqrtU":
      return `\\arcsin\\left(${uLatex}\\right)`;
  }
}

export function primitiveLatexB(exercice: ExerciceFamilleB): string {
  const facteur = formatFractionLatex(exercice.k, exercice.mCoef);
  const corps = gPrimitiveLatexB(exercice.typeG, uLatexB(exercice), exercice.nG);
  if (facteur === "1") return corps;
  if (facteur === "-1") return `-${corps}`;
  return `${facteur}\\cdot ${corps}`;
}

function uLatexB(exercice: ExerciceFamilleB): string {
  if (exercice.typeU === "affine") {
    return `${exercice.mAffine}x${termeAdditif(exercice.nAffine as number)}`.replace(/\+\s*-/, "- ").replace(/\s\+\s0$/, "");
  }
  return `x^{${exercice.pPuissance}}${termeAdditif(exercice.cPuissance as number)}`;
}

function integrandeLatexB(exercice: ExerciceFamilleB): string {
  const k = exercice.k;
  const xPart = exercice.expPart === 0 ? "" : exercice.expPart === 1 ? "x" : `x^{${exercice.expPart}}`;
  const kPart = k === 1 && xPart !== "" ? "" : k === -1 && xPart !== "" ? "-" : `${k}`;
  const sep = xPart !== "" && kPart !== "" && kPart !== "-" ? "\\cdot " : "";
  return `${kPart}${sep}${xPart}${gLatexB(exercice.typeG, uLatexB(exercice), exercice.nG)}`;
}

export function consigneGeneraleB(): string {
  return "Calcule une primitive F de la fonction f définie ci-dessous (fonction composée).";
}
export function blocDonneesB(exercice: ExerciceFamilleB): string[] {
  return [`f(x)=${integrandeLatexB(exercice)}`];
}
export function consigneEcranB(phase: PhaseCalculPrimitives): string {
  if (phase === "bEcran1") return "Identifie la fonction intérieure u(x) et calcule u'(x).";
  if (phase === "bEcran2") return "Compare le coefficient affiché dans f(x) à u'(x) — quel facteur multiplicatif faut-il sortir de l'intégrale pour que la formule composée s'applique exactement ?";
  return "Applique la formule de primitive composée, ajustée par le facteur trouvé.";
}
export function etatActuelB(exercice: ExerciceFamilleB, phase: PhaseCalculPrimitives): string[] | null {
  const lignes: string[] = [];
  if (phase === "bEcran2" || phase === "bEcran3") lignes.push(`u(x)=${uLatexB(exercice)}`, `u'(x)=\\ldots`);
  if (phase === "bEcran3") lignes.push(`\\text{facteur}=${formatFractionLatex(exercice.k, exercice.mCoef)}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsB(phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "bEcran1") return [{ label: "u(x) =", placeholder: "ex : 3x+1" }, { label: "u'(x) =", placeholder: "ex : 3" }];
  if (phase === "bEcran2") return [{ label: "Facteur d'ajustement =", placeholder: "ex : 1 ou 2/3" }];
  return [{ label: "F(x) =", placeholder: "ex : (1/3)e^(3x+1)" }];
}
export function aideNiveau1B(phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "u(x) est l'expression à l'intérieur de la fonction composée (dans cos(...), e^(...), (...)ⁿ, etc.).", latex: null };
  if (phase === "bEcran2") return { texte: "La formule de primitive composée exige EXACTEMENT u'(x) en facteur — tout écart doit être compensé par une constante multiplicative sortie de l'intégrale.", latex: null };
  return { texte: "Multiplie la primitive composée standard (en u) par le facteur d'ajustement trouvé.", latex: null };
}
export function aideNiveau2B(exercice: ExerciceFamilleB, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "bEcran2") {
    return { texte: `Coefficient affiché : ${exercice.k}. u'(x) calculé : ${exercice.mCoef}${exercice.expPart > 0 ? `x^{${exercice.expPart}}` : ""}. Quel est leur rapport ?`, latex: null };
  }
  return { texte: "Rappel : ∫k·x^p·g(u(x))dx = facteur·G(u(x)) où G est la primitive de g.", latex: null };
}

// ============================================================================
// Famille C.
// ============================================================================

export function primitiveLatexC(exercice: ExerciceFamilleC): string {
  if (exercice.sousType === "1") {
    const { a, b, k } = exercice;
    const radical = `${a === 1 ? "" : a}x${termeAdditif(b)}`;
    return `\\dfrac{${k}}{${a}^2}\\left(\\dfrac{2}{5}\\left(${radical}\\right)^{5/2}${termeAdditif(-b)}\\cdot\\dfrac{2}{3}\\left(${radical}\\right)^{3/2}\\right)`;
  }
  if (exercice.sousType === "2") {
    const corps = exercice.cyclo === "arctan" ? "\\arctan(x)" : "\\arcsin(x)";
    return `\\dfrac{${exercice.k}}{3}${corps}^3`;
  }
  if (exercice.sousType === "3") return `2\\cdot ${exercice.k}\\arctan\\left(\\sqrt{x}\\right)`;
  return `2\\cdot ${exercice.k}\\sqrt{e^x+1}`;
}

function integrandeLatexC(exercice: ExerciceFamilleC): string {
  if (exercice.sousType === "1") return `${exercice.k === 1 ? "" : exercice.k}x\\sqrt{${exercice.a === 1 ? "" : exercice.a}x${termeAdditif(exercice.b)}}`;
  if (exercice.sousType === "2") {
    const f = exercice.cyclo === "arctan" ? `\\arctan(x)^2}{1+x^2}` : `\\arcsin(x)^2}{\\sqrt{1-x^2}}`;
    return `${exercice.k === 1 ? "" : exercice.k}\\dfrac{${f}`;
  }
  if (exercice.sousType === "3") return `\\dfrac{${exercice.k}}{(1+x)\\sqrt{x}}`;
  return `\\dfrac{${exercice.k}e^x}{\\sqrt{e^x+1}}`;
}

export function consigneGeneraleC(): string {
  return "Calcule une primitive F de la fonction f définie ci-dessous, par changement de variable.";
}
export function blocDonneesC(exercice: ExerciceFamilleC): string[] {
  return [`f(x)=${integrandeLatexC(exercice)}`];
}
export function consigneEcranC(exercice: ExerciceFamilleC, phase: PhaseCalculPrimitives): string {
  if (phase === "cEcran1") {
    const besoinX = exercice.sousType === "1" || exercice.sousType === "3";
    return besoinX ? "Pose u égal à l'expression interne pertinente, isole x en fonction de u, puis exprime dx en fonction de du." : "Pose u égal à l'expression interne pertinente et exprime dx en fonction de du.";
  }
  if (phase === "cEcran2") return "Réécris complètement l'intégrale en fonction de u uniquement.";
  if (phase === "cEcran3") return "Calcule la primitive en u.";
  return "Reviens à la variable x en substituant u par son expression.";
}
export function etatActuelC(_exercice: ExerciceFamilleC, phase: PhaseCalculPrimitives): string[] | null {
  if (phase === "cEcran1") return null;
  const lignes: string[] = [`u=\\ldots,\\ dx=\\ldots\\,du`];
  if (phase === "cEcran3" || phase === "cEcran4") lignes.push(`\\int(\\ldots)\\,du`);
  if (phase === "cEcran4") lignes.push(`F(u)=\\ldots`);
  return lignes;
}
export function champsC(exercice: ExerciceFamilleC, phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "cEcran1") {
    const besoinX = exercice.sousType === "1" || exercice.sousType === "3";
    const base: ChampDef[] = [{ label: "u =", placeholder: "ex : 2x+3" }];
    if (besoinX) base.push({ label: "x (en fonction de u) =", placeholder: "ex : (u-3)/2" });
    base.push({ label: "dx (en fonction de du) =", placeholder: "ex : du/2" });
    return base;
  }
  if (phase === "cEcran2") return [{ label: "Intégrale réécrite en u =", placeholder: "ex : u^2" }];
  if (phase === "cEcran3") return [{ label: "Primitive en u =", placeholder: "ex : u^3/3" }];
  return [{ label: "F(x) =", placeholder: "ex : (2x+3)^1.5/3" }];
}
export function aideNiveau1C(phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Calcule d'abord du/dx, puis isole dx en fonction de du.", latex: null };
  if (phase === "cEcran2") return { texte: "Remplace CHAQUE occurrence de x (et de dx) par son expression en u — rien ne doit rester en x.", latex: null };
  if (phase === "cEcran3") return { texte: "Utilise les formules de primitives immédiates (puissance, 1/u, arctan, etc.) sur l'expression en u.", latex: null };
  return { texte: "Remplace u par son expression en x dans la primitive trouvée à l'étape précédente.", latex: null };
}
export function aideNiveau2C(_exercice: ExerciceFamilleC, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "du/dx calculé — il reste à isoler dx :", latex: `du=u'(x)\\,dx` };
  return { texte: "Continue le calcul à partir de l'étape précédente.", latex: null };
}

// ============================================================================
// Famille D.
// ============================================================================

export function primitiveLatexD(exercice: ExerciceFamilleD): string {
  if (exercice.sousType === "5") {
    const { base, k } = exercice;
    return `\\dfrac{${k === 1 ? "" : k}(${base}e)^x}{\\ln(${base}e)}`;
  }
  if (exercice.sousType === "1") {
    const { a, b, kTrig, trig } = exercice;
    const poly = `${a === 1 ? "" : a}x${termeAdditif(b)}`;
    if (trig === "cos") return `\\dfrac{\\left(${poly}\\right)\\sin(${kTrig === 1 ? "" : kTrig}x)}{${kTrig}}+\\dfrac{${a}\\cos(${kTrig === 1 ? "" : kTrig}x)}{${kTrig}^2}`;
    return `-\\dfrac{\\left(${poly}\\right)\\cos(${kTrig === 1 ? "" : kTrig}x)}{${kTrig}}+\\dfrac{${a}\\sin(${kTrig === 1 ? "" : kTrig}x)}{${kTrig}^2}`;
  }
  if (exercice.sousType === "2") {
    const { c, kExp } = exercice;
    const poly = `x${termeAdditif(c)}`;
    return `e^{${kExp === 1 ? "" : kExp}x}\\left(\\dfrac{\\left(${poly}\\right)^2}{${kExp}}-\\dfrac{2\\left(${poly}\\right)}{${kExp}^2}+\\dfrac{2}{${kExp}^3}\\right)`;
  }
  if (exercice.sousType === "3") {
    const { cyclo, k } = exercice;
    const kLatex = k === 1 ? "" : `${k}`;
    return cyclo === "ln" ? `${kLatex}\\left(x\\ln(x)-x\\right)` : `${kLatex}\\left(x\\arctan(x)-\\dfrac{1}{2}\\ln(1+x^2)\\right)`;
  }
  const { kExp, trig } = exercice;
  return trig === "sin" ? `\\dfrac{e^{${kExp === 1 ? "" : kExp}x}\\left(${kExp}\\sin(x)-\\cos(x)\\right)}{${kExp}^2+1}` : `\\dfrac{e^{${kExp === 1 ? "" : kExp}x}\\left(${kExp}\\cos(x)+\\sin(x)\\right)}{${kExp}^2+1}`;
}

function integrandeLatexD(exercice: ExerciceFamilleD): string {
  if (exercice.sousType === "5") return `${exercice.k === 1 ? "" : `${exercice.k}\\cdot `}${exercice.base}^x\\cdot e^x`;
  if (exercice.sousType === "1") {
    const poly = `${exercice.a === 1 ? "" : exercice.a === -1 ? "-" : exercice.a}x${termeAdditif(exercice.b)}`;
    const trig = exercice.trig === "cos" ? `\\cos(${exercice.kTrig === 1 ? "" : exercice.kTrig}x)` : `\\sin(${exercice.kTrig === 1 ? "" : exercice.kTrig}x)`;
    return `\\left(${poly}\\right)${trig}`;
  }
  if (exercice.sousType === "2") return `\\left(x${termeAdditif(exercice.c)}\\right)^2 e^{${exercice.kExp === 1 ? "" : exercice.kExp}x}`;
  if (exercice.sousType === "3") return `${exercice.k === 1 ? "" : exercice.k}${exercice.cyclo === "ln" ? "\\ln(x)" : "\\arctan(x)"}`;
  const trig = exercice.trig === "sin" ? "\\sin(x)" : "\\cos(x)";
  return `e^{${exercice.kExp === 1 ? "" : exercice.kExp}x}${trig}`;
}

export function consigneGeneraleD(): string {
  return "Calcule une primitive F de la fonction f définie ci-dessous.";
}
export function blocDonneesD(exercice: ExerciceFamilleD): string[] {
  return [`f(x)=${integrandeLatexD(exercice)}`];
}
export function consigneEcranD(_exercice: ExerciceFamilleD, phase: PhaseCalculPrimitives): string {
  if (phase === "dEcranDirect") return "Avant de te lancer dans une intégration par parties, regarde si l'expression peut se simplifier — est-ce vraiment nécessaire ici ?";
  if (phase === "dEcran1") return "Choisis u et dv pour l'intégration par parties (priorité pour u : logarithme > cyclométrique > polynôme > trig/exp).";
  if (phase === "dEcran2") return "Calcule du (dérivée de u) et v (primitive de dv), à partir du choix de l'étape précédente.";
  if (phase === "dEcran3") return "Applique la formule ∫u dv = uv − ∫v du.";
  return "Calcule la primitive finale, à partir de la nouvelle intégrale de l'étape précédente (une 2e IBP ou une résolution algébrique en I peuvent être nécessaires — voir l'aide si besoin).";
}
export function etatActuelD(_exercice: ExerciceFamilleD, phase: PhaseCalculPrimitives): string[] | null {
  const lignes: string[] = [];
  if (phase === "dEcran2" || phase === "dEcran3" || phase === "dEcran4") lignes.push(`u=\\ldots,\\ dv=\\ldots`);
  if (phase === "dEcran3" || phase === "dEcran4") lignes.push(`du=\\ldots,\\ v=\\ldots`);
  if (phase === "dEcran4") lignes.push(`uv=\\ldots,\\ \\text{nouvel intégrande}=\\ldots`);
  return lignes.length > 0 ? lignes : null;
}
export function champsD(phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "dEcranDirect" || phase === "dEcran4") return [{ label: "F(x) =", placeholder: "ex : x·e^x - e^x" }];
  if (phase === "dEcran1") return [{ label: "u =", placeholder: "ex : x" }, { label: "dv (second facteur, dv=…dx) =", placeholder: "ex : cos(2x)" }];
  if (phase === "dEcran2") return [{ label: "du =", placeholder: "ex : dx" }, { label: "v =", placeholder: "ex : sin(2x)/2" }];
  return [{ label: "uv =", placeholder: "ex : x·sin(2x)/2" }, { label: "Nouvel intégrande (v·u', sans le signe) =", placeholder: "ex : sin(2x)/2" }];
}
export function aideNiveau1D(_exercice: ExerciceFamilleD, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "dEcranDirect") return { texte: "Deux exponentielles de bases différentes multipliées entre elles peuvent parfois se combiner en une seule.", latex: null };
  if (phase === "dEcran1") return { texte: "u doit être la partie qui se SIMPLIFIE par dérivation (ou qui n'a pas de primitive immédiate, comme ln ou arctan) ; dv est le reste, facile à primitiver.", latex: null };
  if (phase === "dEcran2") return { texte: "du = u'(x)dx. v s'obtient en primitivant dv (constante nulle).", latex: null };
  if (phase === "dEcran3") return { texte: "uv est simplement le produit de u et v ; la nouvelle intégrale est v·du (sans le signe −, qui apparaît devant l'intégrale entière).", latex: null };
  return { texte: "Si le polynôme est de degré ≥2, une 2e IBP peut être nécessaire. Si l'intégrale de départ réapparaît (cas cyclique), pose une équation I=…−k·I et résous pour I.", latex: null };
}
export function aideNiveau2D(exercice: ExerciceFamilleD, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "dEcran4" && exercice.sousType === "4") {
    const k = exercice.kExp;
    return { texte: "Équation formée par la 2e IBP (I désigne l'intégrale de départ) :", latex: `I=\\text{expression}-${k * k}I` };
  }
  return { texte: "Continue le calcul à partir de l'étape précédente.", latex: null };
}

// ============================================================================
// Famille E.
// ============================================================================

export function primitiveLatexE(exercice: ExerciceFamilleE): string {
  const { a } = exercice;
  if (exercice.sousType === "sinus") return `\\dfrac{${a}^2}{2}\\arcsin\\left(\\dfrac{x}{${a}}\\right)+\\dfrac{x}{2}\\sqrt{${a}^2-x^2}`;
  return `-\\dfrac{\\sqrt{${a}^2+x^2}}{${a}^2x}`;
}

function integrandeLatexE(exercice: ExerciceFamilleE): string {
  if (exercice.sousType === "sinus") return `\\sqrt{${exercice.a}^2-x^2}`;
  return `\\dfrac{1}{x^2\\sqrt{${exercice.a}^2+x^2}}\\quad(x>0)`;
}

export function consigneGeneraleE(): string {
  return "Calcule une primitive F de la fonction f définie ci-dessous, par substitution trigonométrique.";
}
export function blocDonneesE(exercice: ExerciceFamilleE): string[] {
  return [`f(x)=${integrandeLatexE(exercice)}`];
}
export function consigneEcranE(phase: PhaseCalculPrimitives): string {
  if (phase === "eEcran1") return "Pose la substitution trigonométrique appropriée et exprime dx en fonction de dθ.";
  if (phase === "eEcran2") return "Simplifie l'expression sous la racine via l'identité pythagoricienne.";
  if (phase === "eEcran3") return "Intègre la forme trouvée à l'étape précédente (en θ).";
  return "Reviens à la variable x (utilise un triangle de référence pour exprimer les fonctions de θ en fonction de x si besoin).";
}
export function etatActuelE(exercice: ExerciceFamilleE, phase: PhaseCalculPrimitives): string[] | null {
  if (phase === "eEcran1") return null;
  const sub = exercice.sousType === "sinus" ? `x=${exercice.a}\\sin\\theta` : `x=${exercice.a}\\tan\\theta`;
  const lignes = [sub];
  if (phase === "eEcran3" || phase === "eEcran4") lignes.push(`\\text{expression simplifiée en }\\theta=\\ldots`);
  if (phase === "eEcran4") lignes.push(`\\text{primitive en }\\theta=\\ldots`);
  return lignes;
}
export function champsE(phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "eEcran1") return [{ label: "x (en fonction de θ) =", placeholder: "ex : a·sin(theta)" }, { label: "dx (en fonction de dθ) =", placeholder: "ex : a·cos(theta)·dtheta" }];
  if (phase === "eEcran2") return [{ label: "Expression simplifiée en θ =", placeholder: "ex : a·cos(theta)" }];
  if (phase === "eEcran3") return [{ label: "Primitive en θ =", placeholder: "ex : theta/2" }];
  return [{ label: "F(x) =", placeholder: "ex : arcsin(x/a)" }];
}
export function aideNiveau1E(phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "√(a²−x²) → substitution x=a·sinθ ; √(a²+x²) ou (a²+x²) au dénominateur → substitution x=a·tanθ.", latex: null };
  if (phase === "eEcran2") return { texte: "Utilise 1−sin²θ=cos²θ (substitution sinus) ou 1+tan²θ=1/cos²θ (substitution tangente).", latex: null };
  if (phase === "eEcran3") return { texte: "Multiplie l'expression simplifiée par le dx trouvé à l'étape 1, puis intègre en θ.", latex: null };
  return { texte: "θ=arcsin(x/a) ou θ=arctan(x/a) selon le cas — un triangle rectangle de référence donne les autres fonctions trigonométriques de θ en fonction de x.", latex: null };
}
export function aideNiveau2E(_phase: PhaseCalculPrimitives): AideAvecLatex {
  return { texte: "Continue le calcul à partir de l'étape précédente.", latex: null };
}

// ============================================================================
// Famille F.
// ============================================================================

export function primitiveLatexF(exercice: ExerciceFamilleF): string {
  const k = exercice.k === 1 ? "" : `${exercice.k}`;
  switch (exercice.sousType) {
    case "tan":
      return `-${k}\\ln|\\cos(x)|`;
    case "angleDoubleSin":
      return `${k}\\left(\\dfrac{x}{2}-\\dfrac{\\sin(2x)}{4}\\right)`;
    case "angleDoubleCos":
      return `${k}\\left(\\dfrac{x}{2}+\\dfrac{\\sin(2x)}{4}\\right)`;
    case "pythagoreanFactor":
      return `${k}\\left(x+\\sin(x)\\right)`;
    case "oddPowerSin":
      return `${k}\\left(-\\cos(x)+\\dfrac{\\cos^3(x)}{3}\\right)`;
    case "oddPowerCos":
      return `${k}\\left(\\sin(x)-\\dfrac{\\sin^3(x)}{3}\\right)`;
  }
}

function integrandeLatexF(exercice: ExerciceFamilleF): string {
  const k = exercice.k === 1 ? "" : `${exercice.k}`;
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

const NOM_IDENTITE: Record<ExerciceFamilleF["sousType"], string> = {
  tan: "réécriture tan(x)=sin(x)/cos(x)",
  angleDoubleSin: "formule d'angle double (duplication du cosinus)",
  angleDoubleCos: "formule d'angle double (duplication du cosinus)",
  pythagoreanFactor: "identité pythagoricienne (factorisation de sin²)",
  oddPowerSin: "séparation d'un facteur sin(x) et identité pythagoricienne",
  oddPowerCos: "séparation d'un facteur cos(x) et identité pythagoricienne",
};

export function consigneGeneraleF(): string {
  return "Calcule une primitive F de la fonction f définie ci-dessous, via une identité trigonométrique.";
}
export function blocDonneesF(exercice: ExerciceFamilleF): string[] {
  return [`f(x)=${integrandeLatexF(exercice)}`];
}
export function consigneEcranF(exercice: ExerciceFamilleF, phase: PhaseCalculPrimitives): string {
  if (phase === "fEcran1") return `Réécris f(x) sous une forme intégrable, en utilisant ${NOM_IDENTITE[exercice.sousType]}.`;
  return "Intègre la forme réécrite trouvée à l'étape précédente.";
}
export function etatActuelF(_exercice: ExerciceFamilleF, phase: PhaseCalculPrimitives): string[] | null {
  return phase === "fEcran2" ? [`f(x)=\\ldots\\text{(forme réécrite)}`] : null;
}
export function champsF(phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "fEcran1") return [{ label: "Forme réécrite =", placeholder: "ex : sin(x)/cos(x)" }];
  return [{ label: "F(x) =", placeholder: "ex : -ln|cos(x)|" }];
}
export function aideNiveau1F(exercice: ExerciceFamilleF): AideAvecLatex {
  return { texte: `Famille d'identités concernée : ${NOM_IDENTITE[exercice.sousType]}.`, latex: null };
}
export function aideNiveau2F(exercice: ExerciceFamilleF): AideAvecLatex {
  const amorce: Record<ExerciceFamilleF["sousType"], string> = {
    tan: "\\tan(x)=\\dfrac{\\sin(x)}{\\cos(x)}",
    angleDoubleSin: "\\cos(2x)=1-2\\sin^2(x)",
    angleDoubleCos: "\\cos(2x)=2\\cos^2(x)-1",
    pythagoreanFactor: "\\sin^2(x)=(1-\\cos x)(1+\\cos x)",
    oddPowerSin: "\\sin^3(x)=\\sin(x)\\left(1-\\cos^2(x)\\right)",
    oddPowerCos: "\\cos^3(x)=\\cos(x)\\left(1-\\sin^2(x)\\right)",
  };
  return { texte: "Identité à appliquer :", latex: amorce[exercice.sousType] };
}

// ============================================================================
// Famille G.
// ============================================================================

export function primitiveLatexG(exercice: ExerciceFamilleG): string {
  if (exercice.sousType === "1") {
    const { A, B, r1, r2 } = exercice;
    return joindre([`${A}\\ln|x${termeAdditif(-r1)}|`, `${signe(B, false)}${Math.abs(B)}\\ln|x${termeAdditif(-r2)}|`]);
  }
  if (exercice.sousType === "2") {
    const { d, e, r } = exercice;
    return joindre([`\\dfrac{x^2}{2}`, `${signe(d, false)}${Math.abs(d)}x`, `${signe(e, false)}${Math.abs(e)}\\ln|x${termeAdditif(-r)}|`]);
  }
  if (exercice.sousType === "3") {
    const { A, B, C } = exercice;
    return joindre([`${A}\\ln|x|`, `${signe(B, false)}${formatFractionLatex(Math.abs(B), 2)}\\ln(x^2+1)`, `${signe(C, false)}${Math.abs(C)}\\arctan(x)`]);
  }
  const { gamma, h, m } = exercice;
  return `${formatFractionLatex(gamma, m)}\\arctan\\left(\\dfrac{x${termeAdditif(h)}}{${m}}\\right)`;
}

function integrandeLatexG(exercice: ExerciceFamilleG): string {
  if (exercice.sousType === "1") {
    const num = joindre([`${exercice.A}(x${termeAdditif(-exercice.r2)})`, `${termeAdditif(exercice.B)}(x${termeAdditif(-exercice.r1)})`]);
    return `\\dfrac{${num}}{(x${termeAdditif(-exercice.r1)})(x${termeAdditif(-exercice.r2)})}`;
  }
  if (exercice.sousType === "2") {
    return `\\dfrac{x^2${termeAdditif(exercice.d - exercice.r)}x${termeAdditif(exercice.e - exercice.r * exercice.d)}}{x${termeAdditif(-exercice.r)}}`;
  }
  if (exercice.sousType === "3") {
    const num = joindre([`${exercice.A + exercice.B}x^2`, `${termeAdditif(exercice.C)}x`, `${termeAdditif(exercice.A)}`]);
    return `\\dfrac{${num}}{x(x^2+1)}`;
  }
  return `\\dfrac{${exercice.gamma}}{x^2${termeAdditif(exercice.p)}x${termeAdditif(exercice.q)}}`;
}

export function consigneGeneraleG(): string {
  return "Calcule une primitive F de la fonction f définie ci-dessous, par décomposition en éléments simples.";
}
export function blocDonneesG(exercice: ExerciceFamilleG): string[] {
  return [`f(x)=${integrandeLatexG(exercice)}`];
}
export function consigneEcranG(exercice: ExerciceFamilleG, phase: PhaseCalculPrimitives): string {
  if (phase === "gEcran1") return "Cette fraction est impropre (degré du numérateur ≥ degré du dénominateur) : effectue la division polynomiale et isole le reste sous forme de fraction propre.";
  if (phase === "gEcran2") {
    if (exercice.sousType === "4") return "Complète le carré au dénominateur, puis pose la décomposition sous la forme γ/((x+h)²+m²) (h, m indéterminés).";
    return "Factorise le dénominateur et pose la décomposition en éléments simples avec coefficients indéterminés.";
  }
  if (phase === "gEcran3") return "Détermine la valeur de chaque coefficient indéterminé.";
  return "Intègre chaque terme de la décomposition trouvée à l'étape précédente.";
}
export function etatActuelG(exercice: ExerciceFamilleG, phase: PhaseCalculPrimitives): string[] | null {
  const lignes: string[] = [];
  const aEcranDivision = exercice.sousType === "2";
  if (aEcranDivision && (phase === "gEcran2" || phase === "gEcran3" || phase === "gEcran4")) {
    lignes.push(`\\text{quotient}=\\ldots,\\ \\text{reste}=\\ldots`);
  }
  if (phase === "gEcran3" || phase === "gEcran4") lignes.push(`\\text{décomposition posée}=\\ldots`);
  if (phase === "gEcran4") lignes.push(`\\text{coefficients}=\\ldots`);
  return lignes.length > 0 ? lignes : null;
}
export function champsG(exercice: ExerciceFamilleG, phase: PhaseCalculPrimitives): ChampDef[] {
  if (phase === "gEcran1") return [{ label: "Quotient entier =", placeholder: "ex : x+2" }, { label: "Fraction propre restante =", placeholder: "ex : 3/(x-1)" }];
  if (phase === "gEcran2") return [{ label: "Décomposition posée =", placeholder: exercice.sousType === "4" ? "ex : g/((x+h)^2+m^2)" : "ex : A/(x-2)+B/(x+1)" }];
  if (phase === "gEcran3") {
    if (exercice.sousType === "1") return [{ label: "A =", placeholder: "ex : 2" }, { label: "B =", placeholder: "ex : -1" }];
    if (exercice.sousType === "2") return [{ label: "A =", placeholder: "ex : 3" }];
    if (exercice.sousType === "3") return [{ label: "A =", placeholder: "ex : 1" }, { label: "B =", placeholder: "ex : 2" }, { label: "C =", placeholder: "ex : -1" }];
    return [{ label: "h =", placeholder: "ex : -1" }, { label: "m =", placeholder: "ex : 2" }];
  }
  return [{ label: "F(x) =", placeholder: "ex : ln|x-2|+2ln|x+1|" }];
}
export function aideNiveau1G(phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "gEcran1") return { texte: "Effectue la division polynomiale (numérateur ÷ dénominateur) comme une division euclidienne classique.", latex: null };
  if (phase === "gEcran2") return { texte: "Facteur linéaire distinct → A/(x−r) ; facteur quadratique irréductible → (Ax+B)/(dénominateur).", latex: null };
  if (phase === "gEcran3") return { texte: "Réduis au même dénominateur puis identifie les coefficients (par identification, ou en substituant des valeurs de x bien choisies).", latex: null };
  return { texte: "Un terme A/(x−r) se primitive en A·ln|x−r| ; un terme quadratique irréductible mène à un arctan.", latex: null };
}
export function aideNiveau2G(exercice: ExerciceFamilleG, phase: PhaseCalculPrimitives): AideAvecLatex {
  if (phase === "gEcran2") {
    if (exercice.sousType === "1") return { texte: "Dénominateur déjà factorisé :", latex: `(x${termeAdditif(-exercice.r1)})(x${termeAdditif(-exercice.r2)})` };
    if (exercice.sousType === "3") return { texte: "Dénominateur déjà factorisé :", latex: `x(x^2+1)` };
    if (exercice.sousType === "4") return { texte: "Carré déjà complété :", latex: `(x${termeAdditif(exercice.h)})^2+${exercice.m}^2` };
  }
  return { texte: "Continue le calcul à partir de l'étape précédente.", latex: null };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceCalculPrimitives): string {
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
}

export function blocDonnees(exercice: ExerciceCalculPrimitives): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
    case "F":
      return blocDonneesF(exercice);
    case "G":
      return blocDonneesG(exercice);
  }
}

export function consigneEcran(exercice: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): string {
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
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(exercice, phase);
    case "E":
      return aideNiveau1E(phase);
    case "F":
      return aideNiveau1F(exercice);
    case "G":
      return aideNiveau1G(phase);
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
      return aideNiveau2E(phase);
    case "F":
      return aideNiveau2F(exercice);
    case "G":
      return aideNiveau2G(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseCalculPrimitives, string> = {
  aEcranDirect: "Primitive",
  aEcran1: "Étape 1 (réécriture)",
  aEcran2: "Étape 2 (primitive)",
  bEcran1: "Étape 1 (u, u')",
  bEcran2: "Étape 2 (facteur d'ajustement)",
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
  gEcran1: "Étape 1 (division polynomiale)",
  gEcran2: "Étape 2 (décomposition posée)",
  gEcran3: "Étape 3 (coefficients)",
  gEcran4: "Étape 4 (primitive finale)",
};

/** Récapitulatif final : affiche toujours la primitive/forme CORRECTE connue de l'exercice —
 * jamais recalculée depuis la saisie élève (CLAUDE.md, "récapitulatif final... jamais recalculée
 * depuis un score"). Les écrans intermédiaires (u, décomposition, coefficients...) affichent leur
 * propre libellé (pas de formule fermée aussi lisible qu'un simple F(x) pour ces étapes-là — la
 * consigne de l'écran, déjà affichée pendant l'exercice, suffit à situer la ligne du récapitulatif).
 * Libellé enveloppé en `\text{...}` (jamais passé nu) : `ResultatPanelCalculPrimitives.tsx` rend ce
 * fragment dans un `<Katex>` nu — un libellé texte non enveloppé s'affiche en mode MATH, collant
 * les mots et gommant les espaces ("Écran1(substitution)"). Bug trouvé lors de la revue transversale
 * chapitre 4 (audit 6gen23-29) : `formatQuellePrimitive.ts` (6gen24) avait déjà contourné ce même
 * défaut dans son propre wrapper (`\\text{${frag}}`) sans jamais corriger la source — corrigé ici
 * directement, plutôt que de laisser chaque futur réutilisateur recontourner le même défaut. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): string[] {
  const phasesFinales: PhaseCalculPrimitives[] = ["aEcranDirect", "aEcran2", "bEcran3", "cEcran4", "dEcranDirect", "dEcran4", "eEcran4", "fEcran2", "gEcran4"];
  if (phasesFinales.includes(phase)) {
    return [`F(x)=${primitiveLatex(exercice)}+C`];
  }
  return [`\\text{${LIBELLE_PHASE[phase]}}`];
}

function primitiveLatex(exercice: ExerciceCalculPrimitives): string {
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

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice, de 100 à 400 selon la famille/le sous-type). */
export function calculerTotalPointsCalculPrimitives(resultat: ResultatExerciceCalculPrimitives): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
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
