import type { CibleLimite, ExerciceLimiteA, ExerciceLimiteB, ExerciceLimiteC, ExerciceLimiteExponentielle, ExerciceLimiteH, ExerciceLimiteI, ExerciceLimiteJ, ExerciceLimiteK, ExerciceLimiteL, ExerciceLimiteN } from "../../core6e/limitesExponentielles.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { phaseApres, phaseInitiale, type PhaseLimiteExponentielle } from "../../moteur6e/typesLimitesExponentielles";
import {
  approcheLimiteLatex,
  baseLimiteLatex,
  decalageXLatex,
  formatCibleTexte,
  formatLimiteEnonceLatex,
  formatLimiteExacteLatex,
  formatLimiteFinaleLatex,
  formeReformuleeLatex,
  fractionSurXLatex,
  gDeXLatex,
  kFoisDecalageLatex,
  kxLatex,
  partiesLHopital,
} from "../../ui6e/formatLimitesExponentielles";
import { COURS_DERIVEE, COURS_LIMITES, coefDevant, finaliser, justif, lim, sansRepetition } from "../../ui6e/corrigeExponentielles1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen6` (calcul de limites, fonctions exponentielles) —
 * règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen6.tsx`, `CorrigeDetailleEcran` sous la réponse
 * attendue). Une lettre par ÉCRAN, dans l'ordre `phaseInitiale` → `phaseApres` du moteur. Toutes
 * les écritures viennent de `ui6e/formatLimitesExponentielles.ts` (énoncé, aides, réponses
 * attendues de l'écran) ; les limites finies sont écrites en forme exacte puis « ≈ » calculé depuis
 * la valeur NON arrondie.
 */

type Fragments = FragmentConsigne[];

/** Écrans réellement traversés par l'exercice (ordre du moteur). */
export function sequenceLimitesExponentielles(e: ExerciceLimiteExponentielle): PhaseLimiteExponentielle[] {
  const phases: PhaseLimiteExponentielle[] = [];
  let p: PhaseLimiteExponentielle | "termine" = phaseInitiale(e);
  while (p !== "termine") {
    phases.push(p);
    p = phaseApres(p);
  }
  return phases;
}

const cible = (c: CibleLimite) => formatCibleTexte(c);

function directionX(d: "plus_infini" | "moins_infini"): string {
  return d === "plus_infini" ? "+\\infty" : "-\\infty";
}

/** Règle de l'exponentielle de base a (a > 1 ou 0 < a < 1) quand l'exposant tend vers ±∞. */
function regleBase(base: string, superieureA1: boolean): Fragments {
  return superieureA1 ? justif("base ", { l: `${base}>1` }) : justif("base ", { l: `0<${base}<1` });
}

function utiliseRegleBase(sq: string): EtapeCorrection {
  return utilise(sq, [
    texte("Si "),
    latex("a>1"),
    texte(" : "),
    latex("a^{t}\\to+\\infty"),
    texte(" quand "),
    latex("t\\to+\\infty"),
    texte(" et "),
    latex("a^{t}\\to0"),
    texte(" quand "),
    latex("t\\to-\\infty"),
    texte(". Si "),
    latex("0<a<1"),
    texte(", c'est l'inverse "),
    texte(`${COURS_LIMITES}.`),
  ]);
}

// ============================================================================
// Famille A — limite directe.
// ============================================================================

function etapesA(e: ExerciceLimiteA): EtapeCorrection[] {
  if (e.sousCas === "puissance") {
    const L = lim(directionX(e.direction));
    const g = gDeXLatex(e);
    const b = baseLimiteLatex(e.base);
    const la: LigneCalcul[] = [];
    if (e.gAffine !== null) {
      const { m, n } = e.gAffine;
      const versPlus = (e.direction === "plus_infini") === m > 0;
      const just = justif(`coefficient de x ${m > 0 ? "positif" : "négatif"} et `, { l: `x\\to${directionX(e.direction)}` });
      if (n !== 0) {
        la.push(ligne(`${L}(${g})=${L}\\,${kxLatex(m)}`, "le terme de plus haut degré décide"));
        la.push(ligne(`=${versPlus ? "+" : "-"}\\infty`, just));
      } else la.push(ligne(`${L}\\,${g}=${versPlus ? "+" : "-"}\\infty`, just));
    } else {
      la.push(ligne(`${L}\\,x^2=+\\infty`, justif("un carré grandit sans limite, que ", { l: `x\\to+\\infty` }, " ou ", { l: `x\\to-\\infty` })));
      if (e.gCarreSigne === -1) la.push(ligne(`${L}(-x^2)=-\\infty`, "on change le signe"));
    }
    const exp = `${b}^{${g}}`;
    const etapes: EtapeCorrection[] = [
      utilise("a", [texte("Limite d'un polynôme à l'infini : son terme de plus haut degré décide "), texte(`${COURS_LIMITES}.`)]),
      calcul("a", la),
      resultat("a", [latex(`${L}${e.gAffine !== null && e.gAffine.n !== 0 ? `(${g})` : e.gCarreSigne === -1 ? `(${g})` : `\\,${g}`}=${cible(e.limiteExposant)}`)]),
      utiliseRegleBase("b"),
      calcul("b", [ligne(`${L}\\,${exp}=${lim(cible(e.limiteExposant), "t")}\\,${b}^{t}`, justif("on pose ", { l: `t=${g}` })), ligne(`=${cible(e.limiteGlobale)}`, regleBase(b, e.baseSuperieureA1))]),
      resultat("b", [latex(`${L}\\,${exp}=${cible(e.limiteGlobale)}`)]),
    ];
    if (!e.baseSuperieureA1) etapes.push(piege("b", [texte("La base est comprise entre 0 et 1 : le sens s'inverse, "), latex(`${b}^{t}`), texte(" tend vers 0 quand "), latex("t\\to+\\infty"), texte(" et vers "), latex("+\\infty"), texte(" quand "), latex("t\\to-\\infty"), texte(".")]));
    else if (e.limiteGlobale.type === "zero") etapes.push(piege("b", [texte("La limite vaut 0, pas "), latex("-\\infty"), texte(" : une puissance d'une base positive reste toujours positive.")]));
    return etapes;
  }
  // Sous-cas « fraction » : e^{N(x)/x^s}, x → 0⁺ ou 0⁻.
  const vers = e.directionZero === "zero_plus" ? "0^+" : "0^-";
  const L = lim(vers);
  const N = e.a === 0 ? `${e.b}` : `${kxLatex(e.a)}${e.b > 0 ? "+" : "-"}${Math.abs(e.b)}`;
  const xs = e.s === 1 ? "x" : `x^{${e.s}}`;
  const signeDen = e.s % 2 === 0 ? "+" : e.directionZero === "zero_plus" ? "+" : "-";
  const fraction = `\\frac{${N}}{${xs}}`;
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("Limite d'un quotient dont le numérateur tend vers un nombre non nul et le dénominateur vers 0 : le quotient tend vers l'infini, avec la règle des signes "), texte(`${COURS_LIMITES}.`)]),
    calcul("a", [
      ligne(`${L}${e.a === 0 ? `\\,${N}` : `(${N})`}=${e.b}`, "on remplace x par 0"),
      ligne(`${L}\\,${xs}=0^{${signeDen}}`, e.s % 2 === 0 ? "puissance paire : toujours positive" : e.directionZero === "zero_plus" ? "x positif" : "x négatif, puissance impaire"),
      ligne(`${L}\\dfrac{${N}}{${xs}}=${cible(e.limiteExposant)}`, justif(`numérateur ${e.b > 0 ? "positif" : "négatif"}, dénominateur qui tend vers `, { l: `0^{${signeDen}}` })),
    ]),
    resultat("a", [latex(`${L}\\dfrac{${N}}{${xs}}=${cible(e.limiteExposant)}`)]),
    utiliseRegleBase("b"),
    calcul("b", [ligne(`${L}\\,e^{${fraction}}=${lim(cible(e.limiteExposant), "t")}\\,e^{t}`, justif("on pose ", { l: `t=\\dfrac{${N}}{${xs}}` })), ligne(`=${cible(e.limiteGlobale)}`, justif("base ", { l: "e>1" }))]),
    resultat("b", [latex(`${L}\\,e^{${fraction}}=${cible(e.limiteGlobale)}`)]),
  ];
  if (e.s % 2 === 1 && e.directionZero === "zero_moins") etapes.splice(3, 0, piege("a", [texte("Avec "), latex("x\\to0^-"), texte(" et une puissance impaire, le dénominateur est négatif : il tend vers "), latex("0^-"), texte(", ce qui change le signe de l'infini.")]));
  if (e.limiteGlobale.type === "zero") etapes.push(piege("b", [texte("La limite vaut 0, pas "), latex("-\\infty"), texte(" : "), latex("e^{t}"), texte(" reste toujours positif.")]));
  return etapes;
}

// ============================================================================
// Famille B — somme, terme exponentiel dominant.
// ============================================================================

function etapesB(e: ExerciceLimiteB): EtapeCorrection[] {
  const L = lim(directionX(e.direction));
  const b = baseLimiteLatex(e.base);
  const expo = e.p === 0 ? "x^2" : `x^2${e.p > 0 ? "+" : "-"}${Math.abs(e.p)}`;
  const terme = `${b}^{${expo}}`;
  const mono = `${kxLatex(e.q).replace(/x$/, "")}${e.d === 1 ? "x" : "x^{3}"}`;
  const poly = e.r === 0 ? mono : `${mono}${e.r > 0 ? "+" : "-"}${Math.abs(e.r)}`;
  const versXd = e.d === 1 || e.direction === "plus_infini" ? directionX(e.direction) : "-\\infty";
  const etapes: EtapeCorrection[] = [
    utiliseRegleBase("a"),
    calcul("a", [
      ligne(`${L}${e.p === 0 ? "\\,x^2" : `(${expo})`}=+\\infty`, e.p === 0 ? "un carré grandit sans limite" : justif("car ", { l: "x^2\\to+\\infty" })),
      ligne(`${L}\\,${terme}=${lim("+\\infty", "t")}\\,${b}^{t}`, justif("on pose ", { l: `t=${expo}` })),
      ligne(`=${cible(e.limiteExponentielle)}`, regleBase(b, e.baseSuperieureA1)),
    ]),
    resultat("a", [latex(`${L}\\,${terme}=${cible(e.limiteExponentielle)}`)]),
    utilise("b", [texte("Limite d'un polynôme à l'infini : son terme de plus haut degré décide "), texte(`${COURS_LIMITES}.`)]),
    calcul(
      "b",
      sansRepetition([
        ligne(`${L}(${poly})=${L}\\,${mono}`, "le terme de plus haut degré décide"),
        ligne(`=${cible(e.limitePolynomiale)}`, justif(`coefficient ${e.q > 0 ? "positif" : "négatif"} et `, { l: `${e.d === 1 ? "x" : "x^{3}"}\\to${versXd}` })),
      ]).map((l, i) => (e.r === 0 && i === 0 ? ligne(`${L}\\,${mono}=${cible(e.limitePolynomiale)}`, l.justification) : l)),
    ),
    resultat("b", [latex(`${L}(${poly})=${cible(e.limitePolynomiale)}`)]),
  ];
  const f = `${terme}${poly.startsWith("-") ? "" : "+"}${poly}`;
  if (!e.baseSuperieureA1) {
    etapes.push(
      utilise("c", [texte("Somme de limites : le terme exponentiel tend vers 0, la somme suit le terme polynomial "), texte(`${COURS_LIMITES}.`)]),
      calcul("c", [ligne(`${L}\\left(${f}\\right)=${cible(e.limiteGlobale)}`, justif("car ", { l: `${terme}\\to0` }, " et ", { l: `${poly}\\to${cible(e.limitePolynomiale)}` }))]),
      resultat("c", [latex(`${L}\\left(${f}\\right)=${cible(e.limiteGlobale)}`)]),
    );
  } else if (e.limitePolynomiale.type === "plus_infini") {
    etapes.push(
      utilise("c", [texte("Somme de deux termes qui tendent vers "), latex("+\\infty"), texte(` ${COURS_LIMITES}.`)]),
      calcul("c", [ligne(`${L}\\left(${f}\\right)=+\\infty`, justif("car ", { l: "(+\\infty)+(+\\infty)=+\\infty" }))]),
      resultat("c", [latex(`${L}\\left(${f}\\right)=+\\infty`)]),
    );
  } else {
    etapes.push(
      utilise("c", [texte("Forme indéterminée "), latex("+\\infty-\\infty"), texte(" : on met le terme exponentiel en évidence, puis les croissances comparées (l'exponentielle l'emporte sur toute puissance de x) "), texte(`${COURS_LIMITES}.`)]),
      calcul("c", [
        ligne(`${f}=${terme}\\left(1+\\dfrac{${poly}}{${terme}}\\right)`, "on met le terme exponentiel en évidence"),
        ligne(`${L}\\dfrac{${poly}}{${terme}}=0`, "croissances comparées"),
        ligne(`${L}\\left(${f}\\right)=+\\infty`, justif("un facteur tend vers ", { l: "+\\infty" }, ", l'autre vers 1")),
      ]),
      resultat("c", [latex(`${L}\\left(${f}\\right)=+\\infty`)]),
      piege("c", [texte("Le terme polynomial tend vers "), latex("-\\infty"), texte(", mais la somme tend vers "), latex("+\\infty"), texte(" : l'exponentielle l'emporte toujours, quel que soit le degré.")]),
    );
  }
  return etapes;
}

// ============================================================================
// Famille C — produit, forme ∞ · 0.
// ============================================================================

function etapesC(e: ExerciceLimiteC): EtapeCorrection[] {
  const L = lim("+\\infty");
  const xr = e.r === 1 ? "x" : `x^{${e.r}}`;
  const xs = `x^{${e.s}}`;
  return [
    utilise("a", [texte("On calcule la limite de chaque facteur séparément ; "), latex("e^{t}\\to0"), texte(" quand "), latex("t\\to-\\infty"), texte(` ${COURS_LIMITES}.`)]),
    calcul("a", [
      ligne(`${L}\\,${xr}=+\\infty`, "puissance positive de x"),
      ligne(`${L}(-${xs})=-\\infty`),
      ligne(`${L}\\,e^{-${xs}}=${lim("-\\infty", "t")}\\,e^{t}`, justif("on pose ", { l: `t=-${xs}` })),
      ligne("=0", justif("base ", { l: "e>1" })),
    ]),
    resultat("a", [latex(`${L}\\,${xr}=+\\infty`), texte(" et "), latex(`${L}\\,e^{-${xs}}=0`)]),
    utilise("b", [texte("Forme indéterminée "), latex("\\infty\\cdot0"), texte(" : on écrit le produit en quotient, puis les croissances comparées (l'exponentielle l'emporte sur toute puissance de x) "), texte(`${COURS_LIMITES}.`)]),
    calcul("b", [ligne(`${xr}\\cdot e^{-${xs}}=\\dfrac{${xr}}{e^{${xs}}}`, justif("car ", { l: "e^{-t}=\\dfrac{1}{e^{t}}" })), ligne(`${L}\\dfrac{${xr}}{e^{${xs}}}=0`, "croissances comparées")]),
    resultat("b", [latex(`${L}\\,${xr}\\cdot e^{-${xs}}=0`)]),
    piege("b", [latex("\\infty\\cdot0"), texte(" n'est pas 0 d'office : c'est la croissance comparée qui le donne (l'exponentielle du dénominateur grandit plus vite).")]),
  ];
}

// ============================================================================
// Famille G — instance unique, développements à l'ordre 2.
// ============================================================================

function etapesG(): EtapeCorrection[] {
  const D = "1-e^{\\frac{\\pi}{2}-x}";
  const f = `\\dfrac{1}{\\cos(x)}+\\dfrac{1}{${D}}`;
  const combinee = formeReformuleeLatex({ famille: "G", limiteFinale: 0.5 }) as string;
  const Lu = lim("0", "u");
  return [
    utilise("a", [texte("Somme de deux fractions : on les réduit au même dénominateur "), latex(`\\cos(x)\\left(${D}\\right)`), texte(".")]),
    calcul("a", [
      ligne(`${f}=\\dfrac{${D}}{\\cos(x)\\left(${D}\\right)}+\\dfrac{\\cos(x)}{\\cos(x)\\left(${D}\\right)}`, "même dénominateur"),
      ligne(`=${combinee.replace(/\\frac\{\\left/, "\\dfrac{\\left")}`, "on additionne les numérateurs"),
    ]),
    resultat("a", [latex(`f(x)=${combinee}`)]),
    utilise("b", [texte("On pose "), latex("u=\\dfrac{\\pi}{2}-x"), texte(" ("), latex("u\\to0"), texte(") et on remplace chaque terme par son développement à l'ordre 1 : "), latex("\\sin(u)\\approx u"), texte(", "), latex("e^{u}\\approx1+u"), texte(".")]),
    calcul("b", [
      ligne("\\cos(x)=\\sin(u)", justif("car ", { l: "\\cos\\left(\\frac{\\pi}{2}-u\\right)=\\sin(u)" })),
      ligne(`${D}=1-e^{u}`),
      ligne("\\dfrac{1}{u}+\\dfrac{1}{-u}=0", justif("ordre 1 : ", { l: "\\sin(u)\\approx u" }, " et ", { l: "1-e^{u}\\approx-u" })),
    ]),
    resultat("b", [texte("Non : à l'ordre 1, les termes "), latex("\\dfrac{1}{u}"), texte(" et "), latex("-\\dfrac{1}{u}"), texte(" s'annulent, il reste une forme indéterminée ; il faut l'ordre 2.")]),
    piege("b", [texte("Une somme qui s'annule à l'ordre 1 ne prouve pas que la limite vaut 0 : les termes d'ordre 2 décident.")]),
    utilise("c", [texte("Développements à l'ordre 2 : "), latex("\\sin(u)\\approx u"), texte(", "), latex("e^{u}\\approx1+u+\\dfrac{u^2}{2}"), texte(", puis on simplifie par "), latex("u^2"), texte(".")]),
    calcul("c", [
      ligne(`${f}=\\dfrac{1-e^{u}+\\sin(u)}{\\sin(u)\\left(1-e^{u}\\right)}`, "forme de l'étape 1, écrite en u"),
      ligne("1-e^{u}+\\sin(u)\\approx1-\\left(1+u+\\dfrac{u^2}{2}\\right)+u", "ordre 2"),
      ligne("=-\\dfrac{u^2}{2}", "on réduit"),
      ligne("\\sin(u)\\left(1-e^{u}\\right)\\approx u\\cdot(-u)", "ordre 1 suffit au dénominateur"),
      ligne("=-u^2"),
      ligne(`${Lu}\\dfrac{1-e^{u}+\\sin(u)}{\\sin(u)\\left(1-e^{u}\\right)}=${Lu}\\dfrac{-\\frac{u^2}{2}}{-u^2}`, "on remplace par les développements"),
      ligne("=\\dfrac{1}{2}", justif("on simplifie par ", { l: "-u^2" })),
    ]),
    resultat("c", [latex(`${lim("\\frac{\\pi}{2}")}\\left(${f}\\right)=\\dfrac{1}{2}`)]),
  ];
}

// ============================================================================
// Familles H, I, J, K — règle de L'Hôpital.
// ============================================================================

type ExerciceLH = ExerciceLimiteH | ExerciceLimiteI | ExerciceLimiteJ | ExerciceLimiteK;

/** Nature d'une partie (numérateur ou dénominateur) d'un exercice L'Hôpital. */
type Partie = { nature: "exp" | "poly" | "sin" | "arctan" | "arcsin" | "expK" | "carre"; coef: number };

function parties(e: ExerciceLH): { num: Partie; den: Partie } {
  switch (e.famille) {
    case "H":
      return e.expAuNumerateur ? { num: { nature: "exp", coef: e.k }, den: { nature: "poly", coef: e.m } } : { num: { nature: "poly", coef: e.m }, den: { nature: "exp", coef: e.k } };
    case "I":
      return e.sinAuNumerateur ? { num: { nature: "sin", coef: e.k }, den: { nature: "exp", coef: e.m } } : { num: { nature: "exp", coef: e.m }, den: { nature: "sin", coef: e.k } };
    case "J":
      return e.arcAuNumerateur ? { num: { nature: e.arcFn, coef: e.k }, den: { nature: "exp", coef: e.m } } : { num: { nature: "exp", coef: e.m }, den: { nature: e.arcFn, coef: e.k } };
    case "K":
      return e.expAuNumerateur ? { num: { nature: "expK", coef: e.k }, den: { nature: "carre", coef: e.m } } : { num: { nature: "carre", coef: e.m }, den: { nature: "expK", coef: e.k } };
  }
}

/** f(x₀) (ou g(x₀)) substitué ligne à ligne : membres successifs de la chaîne. */
function valeurEnX0(p: Partie, base: number): string[] {
  const c = p.coef;
  switch (p.nature) {
    case "exp":
      return [`${base}^{0}-1`, "1-1", "0"];
    case "poly":
      return [`${c}\\cdot 0`, "0"];
    case "sin":
      return ["\\sin(0)", "0"];
    case "arctan":
      return ["\\arctan(0)", "0"];
    case "arcsin":
      return ["\\arcsin(0)", "0"];
    case "expK":
      return [`${base}^{0}-1${c < 0 ? "+" : "-"}${Math.abs(c)}\\cdot 0\\cdot\\ln(${base})`, "1-1-0", "0"];
    case "carre":
      return [`${c}\\cdot 0^2`, "0"];
  }
}

/** Dérivée première de la partie, ligne à ligne (`nom` = « f » ou « g »). */
function lignesDerivee(p: Partie, e: ExerciceLH, nom: string, expression: string, derivee: string): { lignes: LigneCalcul[]; outil: Fragments } {
  const x0 = e.x0;
  const u = kFoisDecalageLatex(p.coef, x0);
  const base = e.base;
  const fp = `${nom}'(x)`;
  const w = nom === "f" ? "u" : "v";
  switch (p.nature) {
    case "exp":
      return {
        outil: [latex("(a^{u})'=u'\\cdot\\ln(a)\\cdot a^{u}"), texte(" ; la constante "), latex("-1"), texte(` a une dérivée nulle ${COURS_DERIVEE}.`)],
        lignes: sansRepetition([ligne(`${w}(x)=${u}`), ligne(`${w}'(x)=${p.coef}`), ligne(`${fp}=${w}'(x)\\cdot\\ln(${base})\\cdot ${base}^{${w}(x)}`, "règle de la chaîne"), ligne(`=${derivee}`, `on remplace ${w} et ${w}′`)]),
      };
    case "poly":
      return { outil: [texte("Dérivée d'une fonction du premier degré : "), latex("\\big(m(x-x_0)\\big)'=m"), texte(` ${COURS_DERIVEE}.`)], lignes: [ligne(`${nom}(x)=${expression}`), ligne(`${fp}=${derivee}`, "dérivée d'une fonction du premier degré")] };
    case "sin":
      return {
        outil: [latex("\\big(\\sin(u)\\big)'=u'\\cdot\\cos(u)"), texte(` ${COURS_DERIVEE}.`)],
        lignes: sansRepetition([ligne(`${w}(x)=${u}`), ligne(`${w}'(x)=${p.coef}`), ligne(`${fp}=${w}'(x)\\cdot\\cos\\big(${w}(x)\\big)`, "règle de la chaîne"), ligne(`=${derivee}`, `on remplace ${w} et ${w}′`)]),
      };
    case "arctan":
    case "arcsin": {
      const formule = p.nature === "arctan" ? `\\dfrac{${w}'(x)}{1+${w}(x)^2}` : `\\dfrac{${w}'(x)}{\\sqrt{1-${w}(x)^2}}`;
      return {
        outil: [latex(p.nature === "arctan" ? "\\big(\\arctan(u)\\big)'=\\dfrac{u'}{1+u^2}" : "\\big(\\arcsin(u)\\big)'=\\dfrac{u'}{\\sqrt{1-u^2}}"), texte(` ${COURS_DERIVEE}.`)],
        lignes: sansRepetition([ligne(`${w}(x)=${u}`), ligne(`${w}'(x)=${p.coef}`), ligne(`${fp}=${formule}`, "règle de la chaîne"), ligne(`=${derivee}`, `on remplace ${w} et ${w}′`)]),
      };
    }
    case "expK": {
      return {
        outil: [latex("(a^{u})'=u'\\cdot\\ln(a)\\cdot a^{u}"), texte(" ; "), latex("\\big(k(x-x_0)\\ln(a)\\big)'=k\\ln(a)"), texte(` ${COURS_DERIVEE}.`)],
        lignes: sansRepetition([
          ligne(`${w}(x)=${u}`),
          ligne(`${w}'(x)=${p.coef}`),
          ligne(`${fp}=${w}'(x)\\cdot\\ln(${base})\\cdot ${base}^{${w}(x)}${p.coef < 0 ? "+" : "-"}${Math.abs(p.coef) === 1 ? "" : Math.abs(p.coef)}\\ln(${base})`, justif("chaîne ; dérivée de ", { l: `${u}\\ln(${base})` })),
          ligne(`=${coefDevant(p.coef)}\\ln(${base})\\cdot ${base}^{${u}}${p.coef < 0 ? "+" : "-"}${Math.abs(p.coef) === 1 ? "" : Math.abs(p.coef)}\\ln(${base})`, `on remplace ${w} et ${w}′`),
          ligne(`=${derivee}`, justif("on met ", { l: `${coefDevant(p.coef) === "-" ? "-" : coefDevant(p.coef)}\\ln(${base})` }, " en évidence")),
        ]),
      };
    }
    case "carre": {
      const dec = x0 === 0 ? "x" : decalageXLatex(x0);
      return {
        outil: [latex("\\big(m(x-x_0)^2\\big)'=2m(x-x_0)"), texte(` ${COURS_DERIVEE}.`)],
        lignes: [ligne(`${nom}(x)=${expression}`), ligne(`${fp}=${p.coef === 1 ? "" : p.coef === -1 ? "-" : `${p.coef}\\cdot `}2${dec}`, x0 === 0 ? justif("car ", { l: "(x^2)'=2x" }) : justif("car ", { l: `\\left(${dec}^2\\right)'=2${dec}` })), ligne(`=${derivee}`)],
      };
    }
  }
}

/** f'(x₀) substitué : membres successifs (`\cdot a^{0}`, puis la valeur). */
function deriveeEnX0(p: Partie, base: number): string[] {
  const c = p.coef;
  const cd = coefDevant(c);
  switch (p.nature) {
    case "exp":
      return [`${cd}\\ln(${base})\\cdot ${base}^{0}`, `${cd}\\ln(${base})`];
    case "poly":
      return [`${c}`];
    case "sin":
      return [`${cd}\\cos(0)`, `${c}`];
    case "arctan":
      return [`\\dfrac{${c}}{1+0^2}`, `${c}`];
    case "arcsin":
      return [`\\dfrac{${c}}{\\sqrt{1-0^2}}`, `${c}`];
    case "expK":
      return [`${cd}\\ln(${base})\\cdot\\left(${base}^{0}-1\\right)`, "0"];
    case "carre":
      return [`${2 * c}\\cdot 0`, "0"];
  }
}

function lignesForme(e: ExerciceLH, num: Partie, den: Partie): LigneCalcul[] {
  const x0 = e.x0;
  const chaine = (nom: string, membres: string[]) => membres.map((m, i) => ligne(i === 0 ? `${nom}(${x0})=${m}` : `=${m}`, i === 0 ? "on remplace x par " + String(x0).replace("-", "−") : undefined));
  return [...chaine("f", valeurEnX0(num, e.base)), ...chaine("g", valeurEnX0(den, e.base))];
}

function etapesLHopital(e: ExerciceLH): EtapeCorrection[] {
  const { num, den } = parties(e);
  const P = partiesLHopital(e);
  const x0 = e.x0;
  const L = lim(`${x0}`);
  const lettres = e.famille === "K" ? ["a", "b", "c", "d", "e", "f"] : ["a", "b", "c", "d"];
  const exacte = formatLimiteExacteLatex(e) as string;
  const approx = approcheLimiteLatex(e.limiteFinale);
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("On remplace x par "), latex(`${x0}`), texte(" dans le numérateur "), latex("f(x)"), texte(" et dans le dénominateur "), latex("g(x)"), texte(` ${COURS_LIMITES}.`)]),
    calcul("a", lignesForme(e, num, den)),
    resultat("a", [texte("Forme indéterminée "), latex("\\dfrac{0}{0}"), texte(" : la règle de L'Hôpital s'applique.")]),
    piege("a", [texte("On vérifie toujours la forme "), latex("\\dfrac{0}{0}"), texte(" (ou "), latex("\\dfrac{\\infty}{\\infty}"), texte(") avant d'appliquer la règle de L'Hôpital : sinon elle donne une valeur fausse.")]),
  ];
  const dNum = lignesDerivee(num, e, "f", P.f, P.f1);
  const dDen = lignesDerivee(den, e, "g", P.g, P.g1);
  etapes.push(utilise("b", dNum.outil), calcul("b", dNum.lignes), resultat("b", [latex(`f'(x)=${P.f1}`)]));
  etapes.push(utilise("c", dDen.outil), calcul("c", dDen.lignes), resultat("c", [latex(`g'(x)=${P.g1}`)]));
  if (e.famille === "K") {
    const k = e.k;
    const base = e.base;
    const ln = `\\ln(${base})`;
    const enX0 = (nom: string, membres: string[]) => membres.map((m, i) => ligne(i === 0 ? `${nom}'(${x0})=${m}` : `=${m}`));
    const derSeconde = (p: Partie, nom: string, d2: string): LigneCalcul[] => {
      if (p.nature === "expK") {
        const u = kFoisDecalageLatex(k, x0);
        return sansRepetition([
          ligne(`${nom}''(x)=${coefDevant(k)}${ln}\\cdot\\left(${base}^{${nom === "f" ? "u" : "v"}(x)}\\right)'`, justif("le facteur ", { l: `${coefDevant(k) === "-" ? "-" : coefDevant(k)}${ln}` }, " reste, la constante −1 disparaît")),
          ligne(`=${coefDevant(k)}${ln}\\cdot ${k < 0 ? `(${k})` : k}${ln}\\cdot ${base}^{${u}}`, "règle de la chaîne"),
          ligne(`=${d2}`, justif("car ", { l: `${k < 0 ? `(${k})` : k}^2=${k * k}` })),
        ]);
      }
      return [ligne(`${nom}''(x)=${d2}`, justif("dérivée de ", { l: `${2 * e.m}${x0 === 0 ? "x" : decalageXLatex(x0)}` }))];
    };
    etapes.push(
      utilise("d", [texte("Si "), latex("f'(x_0)"), texte(" et "), latex("g'(x_0)"), texte(" sont encore nuls, la forme "), latex("\\dfrac{0}{0}"), texte(" persiste : on applique une seconde fois la règle, en redérivant "), texte(`${COURS_DERIVEE}.`)]),
      calcul("d", [...enX0("f", deriveeEnX0(num, base)), ...enX0("g", deriveeEnX0(den, base))], [texte("La forme persiste :")], "Calcul"),
      calcul("d", derSeconde(num, "f", P.f2 as string), [texte("Dérivée seconde du numérateur :")], "Calcul"),
      resultat("d", [latex(`f''(x)=${P.f2}`)]),
      piege("d", [texte("Après une première application, la forme "), latex("\\dfrac{0}{0}"), texte(" peut persister : on le vérifie, puis on redérive au lieu de conclure.")]),
      utilise("e", [texte("Même règle de dérivation pour le dénominateur "), texte(`${COURS_DERIVEE}.`)]),
      calcul("e", derSeconde(den, "g", P.g2 as string)),
      resultat("e", [latex(`g''(x)=${P.g2}`)]),
    );
    const n2 = num.nature === "expK" ? [`${coefDevant(k * k)}\\ln^{2}(${base})\\cdot ${base}^{0}`, `${coefDevant(k * k)}\\ln^{2}(${base})`] : [`${2 * e.m}`];
    const d2 = den.nature === "expK" ? [`${coefDevant(k * k)}\\ln^{2}(${base})\\cdot ${base}^{0}`, `${coefDevant(k * k)}\\ln^{2}(${base})`] : [`${2 * e.m}`];
    const sub = `\\dfrac{${n2[0]}}{${d2[0]}}`;
    const simple = `\\dfrac{${n2[n2.length - 1]}}{${d2[d2.length - 1]}}`;
    etapes.push(
      utilise("f", [texte("Règle de L'Hôpital appliquée deux fois : "), latex("\\lim\\dfrac{f(x)}{g(x)}=\\lim\\dfrac{f''(x)}{g''(x)}"), texte(` ${COURS_LIMITES}, puis on remplace x par `), latex(`${x0}`), texte(".")]),
      calcul(
        "f",
        sansRepetition([
          ligne(`${L}\\dfrac{f(x)}{g(x)}=${L}\\dfrac{f''(x)}{g''(x)}`, "L'Hôpital, deux fois"),
          ligne(`=${sub}`, "on remplace x par " + String(x0).replace("-", "−")),
          ligne(`=${simple}`, justif("car ", { l: `${base}^{0}=1` })),
          ligne(`=${exacte}`, "on simplifie"),
          ligne(`\\approx ${approx}`),
        ]),
      ),
      resultat("f", [latex(`${formatLimiteEnonceLatex(e)}=${formatLimiteFinaleLatex(e)}`)]),
    );
    return etapes;
  }
  const n = deriveeEnX0(num, e.base);
  const d = deriveeEnX0(den, e.base);
  const sub = `\\dfrac{${n[0]}}{${d[0]}}`;
  const simple = `\\dfrac{${n[n.length - 1]}}{${d[d.length - 1]}}`;
  const sq = lettres[3];
  etapes.push(
    utilise(sq, [texte("Règle de L'Hôpital : pour une forme "), latex("\\dfrac{0}{0}"), texte(", "), latex("\\lim\\dfrac{f(x)}{g(x)}=\\lim\\dfrac{f'(x)}{g'(x)}"), texte(` ${COURS_LIMITES} ; on remplace ensuite x par `), latex(`${x0}`), texte(".")]),
    calcul(
      sq,
      sansRepetition([
        ligne(`${L}\\dfrac{f(x)}{g(x)}=${L}\\dfrac{f'(x)}{g'(x)}`, "règle de L'Hôpital"),
        ligne(`=${sub}`, "on remplace x par " + String(x0).replace("-", "−")),
        ligne(`=${simple}`, num.nature === "exp" || den.nature === "exp" ? justif("car ", { l: `${e.base}^{0}=1` }) : "on calcule"),
        ligne(`=${exacte}`, "on simplifie"),
        ligne(`\\approx ${approx}`),
      ]),
    ),
    resultat(sq, [latex(`${formatLimiteEnonceLatex(e)}=${formatLimiteFinaleLatex(e)}`)]),
  );
  return etapes;
}

// ============================================================================
// Famille L — forme 1^∞, pivot (1 + 1/u)^u → e.
// ============================================================================

function etapesL(e: ExerciceLimiteL): EtapeCorrection[] {
  const { k, m } = e;
  const km = k * m;
  const forme = formeReformuleeLatex(e) as string;
  const enonce = formatLimiteEnonceLatex(e);
  const fonction = enonce.replace(/^\\lim_\{[^}]*\}\s*/, "");
  const valeur = approcheLimiteLatex(e.limiteFinale);
  if (e.sousType === "L1") {
    const uDef = `${k < 0 ? "-" : ""}\\dfrac{x}{${Math.abs(k)}}`;
    const versU = k > 0 ? "+\\infty" : "-\\infty";
    return [
      utilise("a", [texte("Changement de variable "), latex(`u=${uDef}`), texte(", donc "), latex(`x=${kxLatex(k).replace(/x$/, "")}u`), texte(" ; puis "), latex("(a^{p})^{q}=a^{pq}"), texte(` ${COURS_LIMITES}.`)]),
      calcul("a", [
        ligne(`${fonction}=\\left(1+\\dfrac{1}{u}\\right)^{${km === 1 ? "" : km === -1 ? "-" : km}u}`, justif("on remplace x par ", { l: `${kxLatex(k).replace(/x$/, "")}u` }, " : ", { l: `\\dfrac{${k}}{x}=\\dfrac{1}{u}` })),
        ligne(`=${forme}`, justif("car ", { l: "a^{pq}=(a^{p})^{q}" })),
      ]),
      resultat("a", [latex(`f(x)=${forme}`)]),
      utilise("b", [texte("Limite de référence "), latex("\\left(1+\\dfrac{1}{u}\\right)^{u}\\to e"), texte(" quand "), latex("u\\to\\pm\\infty"), texte(", puis continuité de la puissance.")]),
      calcul("b", [
        ligne(`${lim(versU, "u")}\\left(1+\\dfrac{1}{u}\\right)^{u}=e`, justif("pivot ; ", { l: `u\\to${versU}` }, " quand ", { l: "x\\to+\\infty" })),
        ligne(`${enonce}=e^{${km}}`, justif("on élève à la puissance ", { l: `${km}` })),
        ligne(`\\approx ${valeur}`),
      ]),
      resultat("b", [latex(`${enonce}=${formatLimiteFinaleLatex(e)}`)]),
      piege("b", [latex("1^{\\infty}"), texte(" n'est pas 1 : la base s'approche de 1 pendant que l'exposant grandit, et le résultat dépend des deux vitesses.")]),
    ];
  }
  return [
    utilise("a", [texte("Changement de variable "), latex(`t=${kxLatex(k)}`), texte(", donc "), latex(`\\dfrac{1}{x}=\\dfrac{${k}}{t}`.replace("\\dfrac{-", "-\\dfrac{")), texte(" ; puis "), latex("(a^{p})^{q}=a^{pq}"), texte(` ${COURS_LIMITES}.`)]),
    calcul("a", [
      ligne(`${fonction}=(1+t)^{${km < 0 ? "-" : ""}\\frac{${Math.abs(km)}}{t}}`, justif("on remplace : ", { l: `${fractionSurXLatex(m)}=${km < 0 ? "-" : ""}\\frac{${Math.abs(km)}}{t}` })),
      ligne(`=${forme}`, justif("car ", { l: "a^{pq}=(a^{p})^{q}" })),
    ]),
    resultat("a", [latex(`f(x)=${forme}`)]),
    utilise("b", [texte("Limite de référence "), latex("(1+t)^{1/t}\\to e"), texte(" quand "), latex("t\\to0"), texte(", puis continuité de la puissance.")]),
    calcul("b", [
      ligne(`${lim("0", "t")}(1+t)^{1/t}=e`, justif("pivot ; ", { l: "t\\to0" }, " quand ", { l: "x\\to0" })),
      ligne(`${enonce}=e^{${km}}`, justif("on élève à la puissance ", { l: `${km}` })),
      ligne(`\\approx ${valeur}`),
    ]),
    resultat("b", [latex(`${enonce}=${formatLimiteFinaleLatex(e)}`)]),
    piege("b", [latex("1^{\\infty}"), texte(" n'est pas 1 : la base s'approche de 1 pendant que l'exposant grandit, et le résultat dépend des deux vitesses.")]),
  ];
}

// ============================================================================
// Famille N — forme ∞⁰ / 0⁰, loi des puissances.
// ============================================================================

function etapesN(e: ExerciceLimiteN): EtapeCorrection[] {
  const { base, k, m } = e;
  const km = k * m;
  const enonce = formatLimiteEnonceLatex(e);
  const forme = formeReformuleeLatex(e) as string;
  const exposantExterne = `${kxLatex(m)}+x^2`;
  const valeurExacte = Math.abs(km) <= 6 && Math.pow(base, Math.abs(km)) <= 100000 ? (km >= 0 ? `${Math.pow(base, km)}` : `\\dfrac{1}{${Math.pow(base, -km)}}`) : null;
  const finale = formatLimiteExacteLatex(e) as string;
  const termeKx = `${k > 0 ? "+" : "-"}${Math.abs(k) === 1 ? "" : Math.abs(k)}x`;
  return [
    utilise("a", [texte("Loi des puissances "), latex("(a^{p})^{q}=a^{pq}"), texte(` ${COURS_LIMITES}.`)]),
    calcul("a", [
      ligne(`\\left(${base}^{${fractionSurXLatex(k)}}\\right)^{${exposantExterne}}=${base}^{${fractionSurXLatex(k)}\\cdot\\left(${exposantExterne}\\right)}`, justif("car ", { l: "(a^{p})^{q}=a^{pq}" })),
      ligne(`=${forme}`, justif("on distribue : ", { l: `${fractionSurXLatex(k)}\\cdot ${kxLatex(m)}=${km}` }, " et ", { l: `${fractionSurXLatex(k)}\\cdot x^2=${kxLatex(k)}` })),
    ]),
    resultat("a", [latex(`f(x)=${forme}`)]),
    utilise("b", [texte("Continuité de l'exponentielle : il suffit de calculer la limite de l'exposant.")]),
    calcul("b", [
      ligne(`${lim("0")}(${km}${termeKx})=${km}`, "on remplace x par 0"),
      ligne(`${enonce}=${finale}`, "continuité"),
      ...(valeurExacte !== null && valeurExacte !== finale ? [ligne(`=${valeurExacte}`)] : []),
    ]),
    resultat("b", [latex(`${enonce}=${finale}${valeurExacte !== null && valeurExacte !== finale ? `=${valeurExacte}` : ""}`)]),
    piege("b", [latex(k > 0 ? "(+\\infty)^{0}" : "0^{0}"), texte(" n'est pas 1 d'office : une fois les exposants multipliés, il n'y a plus de forme indéterminée.")]),
  ];
}

// ============================================================================
// Dispatch public.
// ============================================================================

export function correctionDetailleeLimitesExponentielles(e: ExerciceLimiteExponentielle): EtapeCorrection[] {
  let etapes: EtapeCorrection[];
  switch (e.famille) {
    case "A":
      etapes = etapesA(e);
      break;
    case "B":
      etapes = etapesB(e);
      break;
    case "C":
      etapes = etapesC(e);
      break;
    case "G":
      etapes = etapesG();
      break;
    case "H":
    case "I":
    case "J":
    case "K":
      etapes = etapesLHopital(e);
      break;
    case "L":
      etapes = etapesL(e);
      break;
    case "N":
      etapes = etapesN(e);
      break;
  }
  return finaliser(etapes);
}

/** Réponse attendue d'un écran (affichée par l'appli et reprise par le corrigé) — LaTeX. */
export function reponseAttendueLimitesExpoLatex(e: ExerciceLimiteExponentielle, phase: PhaseLimiteExponentielle): string | null {
  const res = correctionDetailleeLimitesExponentielles(e).filter((x) => x.type === "resultat" && x.sousQuestion === String.fromCharCode(97 + sequenceLimitesExponentielles(e).indexOf(phase)));
  const f = res[0]?.fragments ?? [];
  return f.length === 1 && f[0].type === "latex" ? f[0].valeur : null;
}

