import type { BaseExpo, ExerciceEqExpoA, ExerciceEqExpoB, ExerciceEqExpoC, ExerciceEqExpoD, ExerciceEquationExponentielle, ValeurExacteExpo } from "../../core6e/equationsExponentielles.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { PhaseEquationExponentielle } from "../../moteur6e/typesEquationsExponentielles";
import { baseEquExpoLatex, baseEquExpoPourExposant, estExactExpo, exposantLineaireEquExpoLatex, formatEnonceLatex, nombreExactEquExpoLatex, sommeTermesEquExpo, valeurExacteEquExpoLatex } from "../../ui6e/formatEquationsExponentielles";
import { baseValeur } from "./rationnel";
import { COURS_EQUATIONS, finaliser, frac, justif, parN, sansRepetition } from "../../ui6e/corrigeExponentielles1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen9` (résoudre une équation exponentielle) — règle
 * `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : adaptateur papier ET appli
 * (`App6gen9.tsx`). Une lettre par ÉCRAN (`phaseInitiale` → `phaseApres`) : même base (valeur
 * réécrite comme une puissance, exposants égaux, équation du premier ou du second degré), radical
 * nul, racine d'une puissance (exposant divisé par 2, contradiction éventuelle), substitution
 * t = bˣ (équation du second degré en t, racine t ≤ 0 rejetée), positivité d'une exponentielle.
 * Aucun logarithme : une valeur t qui n'est pas une puissance de la base donne x « à la
 * calculatrice » (décision de l'utilisateur : pas de log au chapitre 2).
 */

type Fragments = FragmentConsigne[];

/** Étapes du corrigé papier (une lettre par écran de résolution) : l'écran de verdict
 * « existence » des familles A, B, C n'en fait pas partie (son corrigé à l'écran :
 * `etapesExistenceEquExpo`) ; pour la famille D, c'est l'unique étape. */
export function sequenceEquationsExponentielles(e: ExerciceEquationExponentielle): PhaseEquationExponentielle[] {
  switch (e.famille) {
    case "A":
      return ["aEcran1", "aEcran2"];
    case "B":
      return ["bEcran1", "bEcran2"];
    case "C":
      return ["cEcran1", "cEcran2", "cEcran3"];
    case "D":
      return ["dEcran"];
  }
}

/** Corrigé de l'écran « existence » (familles A, B, C), lettre « a » : positivité des termes. */
export function etapesExistenceEquExpo(e: ExerciceEquationExponentielle): EtapeCorrection[] {
  const regle = utilise("a", [texte("Une exponentielle de base positive est toujours strictement positive "), texte(`${COURS_EQUATIONS}.`)]);
  if (e.famille === "C" && e.solutionsT.every((t) => t < 0)) {
    const bp = baseEquExpoPourExposant(e.base);
    return [
      regle,
      calcul("a", [ligne(`${bp}^{x}>0`, "exponentielle strictement positive"), ligne(`${formatEnonceLatex(e).replace(/\s*=\s*0$/, "")}>0`, "tous les coefficients sont positifs : somme de nombres strictement positifs")]),
      resultat("a", [texte("Aucune solution : "), latex("S=\\varnothing")]),
    ];
  }
  if (e.famille === "D") return etapesD(e);
  const raison =
    e.famille === "A" && e.sousType === "A2"
      ? "Une racine carrée peut être nulle : le signe ne permet pas de conclure, il faut résoudre."
      : e.famille === "A"
        ? "Les deux membres sont strictement positifs : le signe ne permet pas de conclure, il faut résoudre."
        : e.famille === "B"
          ? "Les deux membres sont des exponentielles strictement positives : le signe ne permet pas de conclure, il faut résoudre."
          : "Un coefficient est négatif : la somme peut s'annuler, il faut résoudre.";
  return [regle, resultat("a", [texte(raison)])];
}

const INJECTIVITE: Fragments = [texte("Deux puissances d'une même base (positive, différente de 1) sont égales si et seulement si leurs exposants sont égaux "), texte(`${COURS_EQUATIONS}.`)];

/** Valeur numérique → puissance de la base, ligne à ligne (`val = … = b^p`). */
function lignesPuissance(base: BaseExpo, v: ValeurExacteExpo, p: number): LigneCalcul[] {
  const bp = baseEquExpoPourExposant(base);
  const val = valeurExacteEquExpoLatex(v);
  const lignes: LigneCalcul[] = [];
  const fracV = v.den === 1 ? `${v.num}` : `\\dfrac{${v.num}}{${v.den}}`;
  if (val.includes("{,}")) lignes.push(ligne(`${val}=${fracV}`, "on écrit le décimal en fraction"));
  const gauche = lignes.length ? "" : val;
  if (p === 0) {
    lignes.push(ligne(`${gauche}=${bp}^{0}`, justif("car ", { l: "a^{0}=1" })));
    return lignes;
  }
  const n = Math.abs(p);
  if (base.den === 1) {
    if (p > 0) {
      if (n > 1) lignes.push(ligne(`${gauche}=${Array(n).fill(base.num).join("\\times ")}`, `produit de ${n} facteurs égaux à ${base.num}`));
      lignes.push(ligne(`${lignes.length || gauche === "" ? "" : gauche}=${bp}^{${p}}`, n > 1 ? "définition de la puissance" : undefined));
    } else {
      if (n > 1) lignes.push(ligne(`${gauche}=\\dfrac{1}{${base.num}^{${n}}}`, justif("car ", { l: `${Math.pow(base.num, n)}=${base.num}^{${n}}` })));
      lignes.push(ligne(`${lignes.length || gauche === "" ? "" : gauche}=${bp}^{${p}}`, justif("car ", { l: "\\dfrac{1}{a^{n}}=a^{-n}" })));
    }
    return lignes;
  }
  // Base fractionnaire a/b.
  const [haut, bas] = p > 0 ? [base.num, base.den] : [base.den, base.num];
  if (n > 1) {
    lignes.push(ligne(`${gauche}=\\dfrac{${haut}^{${n}}}{${bas}^{${n}}}`, "numérateur et dénominateur en puissances"));
    lignes.push(ligne(`=\\left(\\dfrac{${haut}}{${bas}}\\right)^{${n}}`, justif("car ", { l: "\\dfrac{a^{n}}{b^{n}}=\\left(\\dfrac{a}{b}\\right)^{n}" })));
  } else lignes.push(ligne(`${gauche}=\\left(\\dfrac{${haut}}{${bas}}\\right)^{1}`, "puissance d'exposant 1"));
  if (p < 0) lignes.push(ligne(`=${bp}^{${p}}`, justif("car ", { l: "\\left(\\dfrac{b}{a}\\right)^{n}=\\left(\\dfrac{a}{b}\\right)^{-n}" })));
  return lignes;
}

/** a·x + b = V (entiers) résolue ligne à ligne, jusqu'à la valeur exacte de x. */
function lignesPremierDegre(a: number, b: number, V: number): LigneCalcul[] {
  const L: LigneCalcul[] = [];
  const gauche = exposantLineaireEquExpoLatex(a, b);
  L.push(ligne(`${gauche}=${V}`, "exposants égaux"));
  if (b !== 0) L.push(ligne(`${exposantLineaireEquExpoLatex(a, 0)}=${V - b}`, b > 0 ? `on soustrait ${b}` : `on ajoute ${-b}`));
  if (a !== 1) L.push(ligne(`x=${frac(V - b, a)}`, `on divise par ${a}`));
  return L;
}

function ensembleLatex(valeurs: number[]): string {
  if (valeurs.length === 0) return "S=\\varnothing";
  return `S=\\left\\{${valeurs.map((v) => nombreExactEquExpoLatex(v)).join("\\,;\\,")}\\right\\}`;
}

// ============================================================================
// Famille A — même base.
// ============================================================================

function etapesA(e: ExerciceEqExpoA): EtapeCorrection[] {
  const bp = baseEquExpoPourExposant(e.base);
  const val = valeurExacteEquExpoLatex(e.valeurNumerique);
  if (e.sousType === "A2") {
    const expo = exposantLineaireEquExpoLatex(e.m, e.n);
    return [
      utilise("a", [texte("Une racine carrée est nulle si et seulement si son radicande est nul "), texte(`${COURS_EQUATIONS}.`)]),
      calcul("a", [ligne(`${bp}^{${expo}}-${val}=0`, "radicande égal à 0")]),
      resultat("a", [latex(`${bp}^{${expo}}-${val}=0`)]),
      utilise("b", [texte("On isole la puissance, on écrit le nombre comme une puissance de la même base, puis : "), ...INJECTIVITE]),
      calcul("b", [ligne(`${bp}^{${expo}}=${val}`, justif("on ajoute ", { l: val })), ...lignesPuissance(e.base, e.valeurNumerique, e.c)], [], "Même base"),
      calcul("b", lignesPremierDegre(e.m, e.n, e.c), [], "Exposants"),
      resultat("b", [latex(`x=${nombreExactEquExpoLatex(e.x)}`)]),
      verification("b", [texte("On remplace x dans l'exposant :")], [ligne(`${e.m}\\cdot ${parN(e.x)}${e.n === 0 ? "" : e.n > 0 ? `+${e.n}` : `-${-e.n}`}=${e.c}`, "on retrouve l'exposant cherché")]),
    ];
  }
  const p = e.sousType === "A1" ? e.p : e.d;
  const expo = e.sousType === "A1" ? exposantLineaireEquExpoLatex(e.m, e.n) : sommeTermesEquExpo([{ valeur: e.a, suffixe: "x^2" }, { valeur: e.b, suffixe: "x" }, { valeur: e.c, suffixe: "" }]);
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("On écrit le second membre comme une puissance de la même base que le premier membre "), texte(`${COURS_EQUATIONS}.`)]),
    calcul("a", lignesPuissance(e.base, e.valeurNumerique, p)),
    resultat("a", [latex(`${val}=${bp}^{${p}}`)]),
    utilise("b", INJECTIVITE),
  ];
  if (e.sousType === "A1") {
    etapes.push(
      calcul("b", [ligne(`${bp}^{${expo}}=${bp}^{${p}}`, "même base"), ...lignesPremierDegre(e.m, e.n, p)]),
      resultat("b", [latex(`x=${nombreExactEquExpoLatex(e.x)}`)]),
      verification("b", [texte("On remplace x dans l'exposant :")], [ligne(`${e.m}\\cdot ${parN(e.x)}${e.n === 0 ? "" : e.n > 0 ? `+${e.n}` : `-${-e.n}`}=${p}`, "on retrouve l'exposant cherché")]),
    );
    return etapes;
  }
  // A3 : équation du second degré a·x² + b·x + (c − d) = 0.
  const k = e.c - e.d;
  const tri = sommeTermesEquExpo([{ valeur: e.a, suffixe: "x^2" }, { valeur: e.b, suffixe: "x" }, { valeur: k, suffixe: "" }]);
  const delta = e.b * e.b - 4 * e.a * k;
  const lignes: LigneCalcul[] = [ligne(`${bp}^{${expo}}=${bp}^{${e.d}}`, "même base"), ligne(`${expo}=${e.d}`, "exposants égaux")];
  if (k !== e.c) lignes.push(ligne(`${tri}=0`, e.d > 0 ? `on soustrait ${e.d}` : `on ajoute ${-e.d}`));
  const lignesDelta: LigneCalcul[] = [ligne(`\\Delta=${parN(e.b)}^2-4\\cdot ${parN(e.a)}\\cdot ${parN(k)}`, "Δ = b² − 4ac"), ligne(`=${delta}`)];
  if (delta > 0) {
    const r = Math.sqrt(delta);
    // x₁ < x₂ : avec a < 0, c'est le « + √Δ » qui donne la plus petite racine.
    const num = (signe: string) => `${e.b === 0 ? "" : -e.b}${signe}${r}`.replace(/^\+/, "");
    const [s1, s2] = e.a > 0 ? ["-", "+"] : ["+", "-"];
    const val1 = (-e.b + (s1 === "+" ? r : -r)) / (2 * e.a);
    const val2 = (-e.b + (s2 === "+" ? r : -r)) / (2 * e.a);
    lignesDelta.push(ligne(`x_1=\\dfrac{${num(s1)}}{${2 * e.a}}=${nombreExactEquExpoLatex(val1)}`, "formule des racines"), ligne(`x_2=\\dfrac{${num(s2)}}{${2 * e.a}}=${nombreExactEquExpoLatex(val2)}`));
  } else if (delta === 0) lignesDelta.push(ligne(`x=\\dfrac{${-e.b}}{${2 * e.a}}=${nombreExactEquExpoLatex(-e.b / (2 * e.a))}`, "Δ = 0 : une racine double"));
  else lignesDelta.push(ligne("\\Delta<0", "aucune racine réelle"));
  etapes.push(calcul("b", lignes, [], "Exposants"), calcul("b", lignesDelta.map((l) => ({ ...l, latex: l.latex.replace(/--/g, "+") })), [], "Second degré"), resultat("b", [latex(ensembleLatex(e.solutions))]));
  return etapes;
}

// ============================================================================
// Famille B — racine d'une puissance.
// ============================================================================

function etapesB(e: ExerciceEqExpoB): EtapeCorrection[] {
  const bp = baseEquExpoPourExposant(e.base);
  const e1 = exposantLineaireEquExpoLatex(e.m1, e.n1);
  const e2 = exposantLineaireEquExpoLatex(e.m2, e.n2);
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("Racine carrée d'une puissance : "), latex("\\sqrt{a^{u}}=a^{\\frac{u}{2}}"), texte(" (la puissance est positive, la racine existe toujours) "), texte(`${COURS_EQUATIONS}.`)]),
    calcul("a", [ligne(`\\sqrt{${bp}^{${e1}}}=${bp}^{\\frac{${e1}}{2}}`, justif("car ", { l: "\\sqrt{a^{u}}=a^{\\frac{u}{2}}" }))]),
    resultat("a", [latex(`\\sqrt{${bp}^{${e1}}}=${bp}^{\\frac{${e1}}{2}}`)]),
    utilise("b", INJECTIVITE),
  ];
  const lignes: LigneCalcul[] = [ligne(`\\dfrac{${e1}}{2}=${e2}`, "exposants égaux"), ligne(`${e1}=${exposantLineaireEquExpoLatex(2 * e.m2, 2 * e.n2)}`, "on multiplie par 2")];
  if (e.contradictoire) {
    lignes.push(ligne(`${e.n1}\\neq ${2 * e.n2}`, "les termes en x s'annulent : il reste une égalité impossible"));
    etapes.push(calcul("b", lignes), resultat("b", [latex("S=\\varnothing")]));
    return etapes;
  }
  const a = e.m1 - 2 * e.m2;
  const c = 2 * e.n2 - e.n1;
  lignes.push(ligne(`${exposantLineaireEquExpoLatex(a, 0)}=${c}`, "on regroupe les termes en x"));
  if (a !== 1) lignes.push(ligne(`x=${frac(c, a)}`, `on divise par ${a}`));
  etapes.push(calcul("b", sansRepetition(lignes)), resultat("b", [latex(`x=${nombreExactEquExpoLatex(e.x as number)}`)]));
  return etapes;
}

// ============================================================================
// Famille C — substitution t = bˣ.
// ============================================================================

function etapesC(e: ExerciceEqExpoC): EtapeCorrection[] {
  const b = baseEquExpoLatex(e.base);
  const bp = baseEquExpoPourExposant(e.base);
  const enT = `${sommeTermesEquExpo([{ valeur: e.A, suffixe: "t^2" }, { valeur: e.B, suffixe: "t" }, { valeur: e.C, suffixe: "" }])}=0`;
  const la: LigneCalcul[] = [ligne(`t=${bp}^{x}`, "changement de variable, avec t > 0")];
  if (e.style === "direct") la.push(ligne(`${bp}^{2x}=\\left(${bp}^{x}\\right)^{2}`, justif("car ", { l: "a^{2x}=(a^{x})^{2}" })), ligne("=t^2"));
  else if (e.style === "carreDeguise") {
    const b2 = Math.round(baseValeur(e.base) * baseValeur(e.base));
    la.push(ligne(`${b2}^{x}=\\left(${bp}^{2}\\right)^{x}`, justif("car ", { l: `${b2}=${b}^{2}` })), ligne(`=\\left(${bp}^{x}\\right)^{2}`, justif("car ", { l: "(a^{2})^{x}=(a^{x})^{2}" })), ligne("=t^2"));
  } else {
    la.push(ligne(`${bp}^{2x+1}=${b}\\cdot(${bp}^{x})^{2}`, justif("car ", { l: "a^{2x+1}=a\\cdot a^{2x}" })), ligne(`=${b}t^2`), ligne(`\\left(${bp}^{2}\\right)^{x}=t^2`, justif("car ", { l: "(a^{2})^{x}=(a^{x})^{2}" })), ligne(`${b}t^2+t^2=${-e.C}`, "on remplace"), ligne(`${e.A}t^2=${-e.C}`, "on regroupe"));
  }
  la.push(ligne(enT, e.style === "regroupement" ? `on soustrait ${-e.C}` : "on remplace dans l'équation"));
  const delta = e.B * e.B - 4 * e.A * e.C;
  const r = Math.sqrt(delta);
  const [t1, t2] = e.solutionsT;
  const lt: LigneCalcul[] = [
    ligne(`\\Delta=${parN(e.B)}^2-4\\cdot ${e.A}\\cdot ${parN(e.C)}`, "Δ = b² − 4ac"),
    ligne(`=${delta}`),
    ligne(`t_1=\\dfrac{${-e.B}-${r}}{${2 * e.A}}=${t1}`, "formule des racines"),
    ligne(`t_2=\\dfrac{${-e.B}+${r}}{${2 * e.A}}=${t2}`),
  ].map((l) => ({ ...l, latex: l.latex.replace(/\{0-/g, "{-").replace(/\{0\+/g, "{") }));
  const lx: LigneCalcul[] = [];
  const solutions: string[] = [];
  e.solutionsT.forEach((t, i) => {
    const nom = `t_${i + 1}`;
    if (t <= 0) {
      lx.push(ligne(`${nom}=${t}`, `rejetée : t = ${b}ˣ est toujours strictement positif`.replace(`${b}ˣ`, b === "e" ? "eˣ" : `${b}ˣ`)));
      return;
    }
    const x = Math.log(t) / Math.log(baseValeur(e.base));
    const k = Math.round(x);
    if (Math.abs(x - k) < 1e-9) {
      lx.push(ligne(`${bp}^{x}=${t}`, `on revient à x avec ${nom}`), ligne(`${bp}^{x}=${bp}^{${k}}`, k === 0 ? justif("car ", { l: "a^{0}=1" }) : `${t} est une puissance de ${b}`), ligne(`x=${k}`, "exposants égaux"));
      solutions.push(String(k));
    } else {
      lx.push(ligne(`${bp}^{x}=${t}`, `on revient à x avec ${nom}`), ligne(`x\\approx ${nombreExactEquExpoLatex(x)}`, "valeur cherchée à la calculatrice (une seule, l'exponentielle est strictement monotone)"));
      solutions.push(nombreExactEquExpoLatex(x));
    }
  });
  const exacts = e.solutionsX.every((x) => estExactExpo(x));
  const resC = e.solutionsX.length === 0 ? "S=\\varnothing" : exacts ? `S=\\left\\{${solutions.join("\\,;\\,")}\\right\\}` : e.solutionsX.map((x) => `x${estExactExpo(x) ? "=" : "\\approx"} ${nombreExactEquExpoLatex(x)}`).join("\\quad\\text{ou}\\quad ");
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("Changement de variable "), latex(`t=${bp}^{x}`), texte(" : l'équation devient une équation du second degré en t "), texte(`${COURS_EQUATIONS}.`)]),
    calcul("a", la),
    resultat("a", [latex(enT)]),
    utilise("b", [texte("Équation du second degré en t : discriminant et formule des racines, sans condition de signe à ce stade.")]),
    calcul("b", lt),
    resultat("b", [latex(`t=${t1}`), texte(" ou "), latex(`t=${t2}`)]),
    verification("b", [texte("Produit des racines : ")], [ligne(`t_1\\cdot t_2=${parN(t1)}\\cdot ${parN(t2)}=${t1 * t2}`, [texte("égal à "), latex(`\\dfrac{c}{a}=${frac(e.C, e.A)}`)])]),
    utilise("c", [texte("Une exponentielle est toujours strictement positive : on rejette toute valeur "), latex("t\\leq 0"), texte(", puis on revient à x avec "), latex(`${bp}^{x}=t`), texte(` ${COURS_EQUATIONS}.`)]),
    calcul("c", lx),
    resultat("c", [latex(resC)]),
  ];
  if (e.solutionsT.some((t) => t <= 0)) etapes.push(piege("c", [texte("Une valeur négative de t est une vraie racine de l'équation en t, mais "), latex(`${bp}^{x}`), texte(" ne peut pas la prendre : elle est rejetée.")]));
  return etapes;
}

// ============================================================================
// Famille D — positivité d'une exponentielle.
// ============================================================================

function etapesD(e: ExerciceEqExpoD): EtapeCorrection[] {
  const lignes: LigneCalcul[] = [];
  if (e.sousType === "D1") {
    const pu = `${baseEquExpoPourExposant(e.base)}^{${exposantLineaireEquExpoLatex(e.m, e.n)}}`;
    lignes.push(ligne(`${pu}>0`, "une exponentielle est strictement positive"), ligne(`${e.c === 1 ? "" : e.c === -1 ? "-" : `${e.c}\\cdot `}${pu}\\neq 0`, `produit d'un nombre non nul (${String(e.c).replace("-", "−")}) par un nombre strictement positif`));
  } else {
    const p1 = `${baseEquExpoPourExposant(e.base1)}^{${exposantLineaireEquExpoLatex(e.m1, e.n1)}}`;
    const p2 = `${baseEquExpoPourExposant(e.base2)}^{${exposantLineaireEquExpoLatex(e.m2, e.n2)}}`;
    lignes.push(ligne(`${p1}>0`, "exponentielle strictement positive"), ligne(`${p2}>0`, "exponentielle strictement positive"), ligne(`${formatEnonceLatex(e).replace(/\s*=\s*0$/, "")}>0`, `somme de deux nombres positifs et de ${e.k} ≥ 0`));
  }
  return [
    utilise("a", [texte("Une exponentielle de base positive est toujours strictement positive, quel que soit l'exposant "), texte(`${COURS_EQUATIONS}.`)]),
    calcul("a", lignes),
    resultat("a", [texte("Aucune solution : "), latex("S=\\varnothing")]),
  ];
}

export function correctionDetailleeEquationsExponentielles(e: ExerciceEquationExponentielle): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliser(etapesA(e));
    case "B":
      return finaliser(etapesB(e));
    case "C":
      return finaliser(etapesC(e));
    case "D":
      return finaliser(etapesD(e));
  }
}

/** Ensemble des solutions de l'équation (réponse brève, barème). */
export function ensembleSolutionsEquExpoLatex(e: ExerciceEquationExponentielle): string {
  switch (e.famille) {
    case "A":
      return ensembleLatex(e.sousType === "A3" ? e.solutions : [e.x]);
    case "B":
      return ensembleLatex(e.contradictoire ? [] : [e.x as number]);
    case "C":
      return e.solutionsX.length === 0 ? "S=\\varnothing" : e.solutionsX.every((x) => estExactExpo(x)) ? ensembleLatex(e.solutionsX) : e.solutionsX.map((x) => `x${estExactExpo(x) ? "=" : "\\approx"} ${nombreExactEquExpoLatex(x)}`).join("\\quad\\text{ou}\\quad ");
    case "D":
      return "S=\\varnothing";
  }
}

