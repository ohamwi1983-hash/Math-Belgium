import type { CibleLimiteLog, ExerciceLimiteLogA, ExerciceLimiteLogB, ExerciceLimiteLogC, ExerciceLimiteLogD, ExerciceLimiteLogarithmique } from "../../core6e/limitesLogarithmiques.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import {
  cibleLatexD,
  fLatexD,
  formeExacteLatexD,
  gLatexD,
  limD,
  lnFLatexD,
  lnUnPlusULatexD,
  monome,
  monomeRationnel,
  parSigne,
  parSomme,
  puissanceLatexD,
  puissanceX,
  reponseAttendueDLatex,
  uLatexD,
  xPlus,
} from "../../ui6e/formatLimitesPuissances";
import { formatBaseB, formatBaseDecimale, formatCategorieLabel, formatCibleTexte, formatDirectionC, formatKU, formatLimiteEnonceLatex, formatPuissance, formatReformulationBLatex, formatSommeTermes, formatUnPlusKU, formeFactoriseeA } from "../../ui6e/formatLimitesLogarithmiques";
import { finaliserCorrige, frac, justif, parN } from "../../ui6e/corrigeLogarithmes1";

/**
 * Corrigé détaillé « comme au tableau » de la famille D de `6gen17` (puissances f(x)^{g(x)}) —
 * règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). SOURCE
 * UNIQUE : importé par l'adaptateur papier (`exportEvaluation.ts`) ET par l'appli (`App6gen17.tsx`,
 * `CorrigeDetailleEcran` après une étape échouée). Étapes a, b, c = les trois écrans (forme, limite de
 * l'exposant g·ln f, conclusion). Toutes les écritures viennent de `ui6e/formatLimitesPuissances.ts`
 * (mêmes fonctions que l'énoncé, les aides et les réponses attendues de l'écran). Familles A–C (fin du
 * fichier, `correctionDetailleeLimitesLog`) : dominance par croissances comparées ligne à ligne, mise
 * en évidence (`formeFactoriseeA`), substitution u = x/x₀ − 1 et limite de référence, diagnostic de
 * chaque partie avant toute technique de forme indéterminée.
 */

const COURS = "(cours, § 5)";

/** Justification de la limite de l'exposant g(x) (étape a). */
function justificationExposant(e: ExerciceLimiteLogD): FragmentConsigne[] {
  switch (e.sousType) {
    case "d1":
    case "d2": {
      const coef = e.sousType === "d1" ? e.b : e.k;
      const versMoins = e.direction === "moins_infini";
      if (!versMoins) return [texte(`coefficient ${coef > 0 ? "positif" : "négatif"}, `), latex(`${puissanceX(e.q)}\\to+\\infty`)];
      return [texte(`coefficient ${coef > 0 ? "positif" : "négatif"}, `), latex(`${puissanceX(e.q)}\\to${e.q === 2 ? "+" : "-"}\\infty`)];
    }
    case "d3":
      return [texte(`numérateur ${e.c > 0 ? "positif" : "négatif"}, dénominateur qui tend vers 0 par valeurs ${e.cote === "droite" || e.q === 2 ? "positives" : "négatives"}`)];
    case "d4":
      return e.exposant === "surLn" ? [texte("car "), latex("\\ln x\\to-\\infty")] : [texte("car "), latex(`${puissanceX(e.q)}\\to0`)];
    case "d6":
      return e.exposant === "surLn" ? [texte("car "), latex("\\ln x\\to+\\infty")] : [texte("car "), latex(`${puissanceX(e.q)}\\to+\\infty`)];
    case "d5":
      return [texte("car "), latex(`${puissanceX(e.q)}\\to0`)];
    case "d7":
      return [texte("car "), latex(`${puissanceX(e.q)}\\to+\\infty`)];
  }
}

/** Justification de la limite de la base f(x) (étape a). */
function justificationBase(e: ExerciceLimiteLogD): FragmentConsigne[] | undefined {
  switch (e.sousType) {
    case "d1":
      return [texte("car "), latex(`${uLatexD(e)}\\to0`)];
    case "d2":
      return [texte("quotient des termes de plus haut degré")];
    case "d3":
      return [texte("on remplace x par 0")];
    case "d4":
    case "d6":
      return undefined;
    case "d5":
      return [texte("car "), latex(`-\\dfrac{1}{${puissanceX(e.p)}}\\to-\\infty`), texte(" et "), latex("e^{t}\\to0"), texte(" quand "), latex("t\\to-\\infty")];
    case "d7":
      return [texte("car "), latex(`${puissanceX(e.p)}\\to+\\infty`)];
  }
}

function etapeForme(e: ExerciceLimiteLogD): EtapeCorrection[] {
  const L = limD(e);
  const etapes: EtapeCorrection[] = [
    utilise("a", [
      texte(`On calcule séparément la limite de la base et celle de l'exposant ${COURS}. Les formes `),
      latex("1^{\\pm\\infty}"),
      texte(", "),
      latex("0^{0}"),
      texte(" et "),
      latex("(+\\infty)^{0}"),
      texte(" sont indéterminées."),
    ]),
    calcul("a", [ligne(`${L} ${parSomme(fLatexD(e))}=${cibleLatexD(e.limiteBase)}`, justificationBase(e)), ligne(`${L} ${parSomme(gLatexD(e))}=${cibleLatexD(e.limiteExposant)}`, justificationExposant(e))]),
    resultat("a", [texte("Forme indéterminée "), latex(formeExacteLatexD(e)), texte(".")]),
  ];
  if (e.forme === "un_infini") {
    etapes.push(piege("a", [latex("1^{\\infty}"), texte(" ne vaut pas 1 : la base n'est jamais égale à 1, elle s'en approche pendant que l'exposant grandit, et le résultat dépend de la vitesse de chacun.")]));
  } else if (e.forme === "zero_zero") {
    etapes.push(piege("a", [latex("0^{0}"), texte(" n'a pas de valeur imposée : une base presque nulle pousse vers 0, un exposant presque nul pousse vers 1.")]));
  } else {
    etapes.push(piege("a", [latex("(+\\infty)^{0}"), texte(" n'a pas de valeur imposée : une base énorme pousse vers l'infini, un exposant presque nul pousse vers 1.")]));
  }
  return etapes;
}

/** Lignes du calcul de g(x)·ln f(x) (identités, vraies pour tout x du voisinage) et lignes des
 * limites, plus l'outil utilisé. */
function calculExposant(e: ExerciceLimiteLogD): { identites: LigneCalcul[]; limites: LigneCalcul[]; outil: FragmentConsigne[] } {
  const L = limD(e);
  const debut = `g(x)\\ln f(x)=${gLatexD(e)}\\cdot ${lnFLatexD(e)}`;
  const finale = `${L} g(x)\\ln f(x)`;
  const issueLatex = cibleLatexD(e.limiteProduit);
  const referenceOutil: FragmentConsigne[] = [texte("Forme « l'infini fois 0 », levée par la limite de référence "), latex("\\lim_{u\\to0}\\dfrac{\\ln(1+u)}{u}=1"), texte(` ${COURS}.`)];
  switch (e.sousType) {
    case "d1":
    case "d3": {
      const u = uLatexD(e) as string;
      const quotient = `\\dfrac{${lnFLatexD(e)}}{${u}}`;
      // Coefficient restant devant le quotient : (b/d)·a·x^{q−p} (d1) ou c·a·x^{1−q} (d3).
      const [num, den, r] = e.sousType === "d1" ? [e.a * e.b, e.d, e.q - e.p] : [e.a * e.c, 1, 1 - e.q];
      const coef = monomeRationnel(num, den, r);
      const identites = [
        ligne(debut),
        ligne(`=${gLatexD(e)}\\cdot ${parSigne(u)}\\cdot ${quotient}`, [texte("on multiplie et on divise par "), latex(`u=${u}`)]),
        ligne(`=${coef}\\cdot ${quotient}`, "on simplifie"),
      ];
      const limites = [ligne(`${L} ${quotient}=1`, [texte("limite de référence, car "), latex(`${u}\\to0`)])];
      if (r === 0) limites.push(ligne(`${finale}=${coef}\\cdot 1=${issueLatex}`, "produit des limites"));
      else limites.push(ligne(`${finale}=${issueLatex}`, [texte("car "), latex(`${coef}\\to${issueLatex}`), texte(" et le quotient tend vers 1")]));
      return { identites, limites, outil: referenceOutil };
    }
    case "d2": {
      const u = uLatexD(e) as string;
      const lnU = lnUnPlusULatexD(e);
      const quotient = `\\dfrac{${lnU}}{${u}}`;
      const K = e.k * (e.b - e.c);
      const absK = Math.abs(K);
      const haut = absK === 1 ? puissanceX(e.q) : `${absK}${puissanceX(e.q)}`;
      // Coefficient k(b − c)·x^q/(x + c) ; sans « x + 0 » au dénominateur.
      const coef = e.c === 0 ? monomeRationnel(K, 1, e.q - 1) : `${K < 0 ? "-" : ""}\\dfrac{${haut}}{${xPlus(e.c)}}`;
      const identites = [
        ligne(debut),
        ligne(`=${gLatexD(e)}\\cdot ${lnU}`, [texte("car "), latex(`${fLatexD(e)}=1${u.startsWith("-") ? "" : "+"}${u}`)]),
        ligne(`=${gLatexD(e)}\\cdot ${parSigne(u)}\\cdot ${quotient}`, [texte("on multiplie et on divise par "), latex(`u=${u}`)]),
        ligne(`=${coef}\\cdot ${quotient}`, "on regroupe"),
      ];
      const limites = [ligne(`${L} ${quotient}=1`, [texte("limite de référence, car "), latex(`${u}\\to0`)])];
      if (e.q === 1) {
        if (e.c !== 0) limites.push(ligne(`${L} ${parSomme(coef)}=${K}`, "quotient des termes de plus haut degré"));
        limites.push(ligne(`${finale}=${K}\\cdot 1=${issueLatex}`, "produit des limites"));
      } else if (e.q === 0.5) {
        limites.push(ligne(`${L} ${parSomme(coef)}=0`, e.c === 0 ? [texte("car "), latex("\\sqrt{x}\\to+\\infty")] : "le dénominateur l'emporte sur la racine"));
        limites.push(ligne(`${finale}=0\\cdot 1=0`, "produit des limites"));
      } else {
        limites.push(ligne(`${L} ${parSomme(coef)}=${issueLatex}`, e.c === 0 ? [texte("car "), latex("x\\to+\\infty")] : "quotient des termes de plus haut degré"));
        limites.push(ligne(`${finale}=${issueLatex}`, "le quotient tend vers 1"));
      }
      return { identites, limites, outil: referenceOutil };
    }
    case "d4":
    case "d6": {
      if (e.exposant === "surLn") {
        return {
          identites: [ligne(debut), ligne(`=${e.a}`, [texte("on simplifie par "), latex("\\ln x"), texte(", non nul près de la borne")])],
          limites: [ligne(`${finale}=${e.a}`, "limite d'une constante")],
          outil: [texte("Le logarithme de la base se simplifie avec le dénominateur de l'exposant.")],
        };
      }
      if (e.sousType === "d4") {
        // a·x^q·ln x : x^q ln x = x^{q−1}·(x ln x).
        const identites = [ligne(debut)];
        if (e.q === 2) identites.push(ligne(`=${monome(e.a, 1)}\\cdot x\\ln x`, [texte("on fait apparaître "), latex("x\\ln x")]));
        const limites = [ligne("\\lim_{x\\to0^+} x\\ln x=0", `croissance comparée ${COURS}`)];
        limites.push(ligne(e.q === 2 ? `${finale}=0\\cdot 0=0` : `${finale}=${e.a}\\cdot 0=0`, "produit des limites"));
        return { identites, limites, outil: [texte("Forme « 0 fois l'infini », levée par la croissance comparée "), latex("\\lim_{x\\to0^+}x\\ln x=0"), texte(` ${COURS}.`)] };
      }
      const quotient = `\\dfrac{\\ln x}{${puissanceX(e.q)}}`;
      return {
        identites: [ligne(debut), ligne(`=${e.a}\\cdot ${quotient}`, "on réécrit le produit")],
        limites: [ligne(`\\lim_{x\\to+\\infty} ${quotient}=0`, `croissance comparée ${COURS}`), ligne(`${finale}=${e.a}\\cdot 0=0`, "produit des limites")],
        outil: [texte("Forme « 0 fois l'infini », levée par la croissance comparée "), latex("\\lim_{x\\to+\\infty}\\dfrac{\\ln x}{x^{k}}=0\\ (k>0)"), texte(` ${COURS}.`)],
      };
    }
    case "d5":
    case "d7": {
      // d5 : ln(e^{−1/x^p}) = −1/x^p ; d7 : ln(e^{x^p}) = x^p.
      const lnSimplifie = e.sousType === "d5" ? `\\left(-\\dfrac{1}{${puissanceX(e.p)}}\\right)` : puissanceX(e.p);
      const [num, r] = e.sousType === "d5" ? [-e.a, e.q - e.p] : [e.a, e.p - e.q];
      const reste = monomeRationnel(num, 1, r);
      const identites = [ligne(debut), ligne(`=${gLatexD(e)}\\cdot ${lnSimplifie}`, [texte("car "), latex("\\ln\\left(e^{t}\\right)=t")]), ligne(`=${reste}`, "on simplifie les puissances de x")];
      let limite: LigneCalcul;
      if (r === 0) limite = ligne(`${finale}=${reste}`, "limite d'une constante");
      else limite = ligne(`${finale}=${cibleLatexD(e.limiteProduit)}`, [texte("car "), latex(`${puissanceX(Math.abs(r))}\\to${e.sousType === "d5" ? "0^+" : "+\\infty"}`), texte(` et le coefficient est ${num > 0 ? "positif" : "négatif"}`)]);
      return { identites, limites: [limite], outil: [texte("Le logarithme défait l'exponentielle de la base : "), latex("\\ln\\left(e^{t}\\right)=t"), texte(".")] };
    }
  }
}

function etapeExposant(e: ExerciceLimiteLogD): EtapeCorrection[] {
  const { identites, limites, outil } = calculExposant(e);
  return [
    utilise("b", [texte("Comme la base est strictement positive, "), latex("f(x)^{g(x)}=e^{g(x)\\ln f(x)}"), texte(` ${COURS} : on calcule la limite de l'exposant. `), ...outil]),
    calcul("b", identites, [], "Réécriture"),
    calcul("b", limites, [], "Limite"),
    resultat("b", [latex(reponseAttendueDLatex(e, "dExposant"))]),
    piege("b", [texte("« L'infini fois 0 » ne vaut pas 0 : c'est justement la forme indéterminée à lever, en réécrivant le produit avant de passer à la limite.")]),
  ];
}

/** Valeur approchée « 403,4 » (4 chiffres significatifs, virgule décimale). */
export function approche(v: number): string {
  const s = v >= 100 ? v.toFixed(1) : v >= 1 ? v.toFixed(3) : v.toPrecision(4);
  return s.replace(".", "{,}");
}

function etapeConclure(e: ExerciceLimiteLogD): EtapeCorrection[] {
  const L = limD(e);
  const depart = `${L} ${puissanceLatexD(e)}=${L} e^{g(x)\\ln f(x)}`;
  const lignes: LigneCalcul[] = [ligne(depart, "la base est strictement positive")];
  switch (e.limiteProduit.type) {
    case "valeur":
      lignes.push(ligne(`=${cibleLatexD(e.limiteFinale)}`, [texte("continuité de l'exponentielle, "), latex(`L=${e.limiteProduit.latex}`)]));
      break;
    case "zero":
      lignes.push(ligne("=e^{0}", [texte("continuité de l'exponentielle, "), latex("L=0")]), ligne("=1"));
      break;
    case "plus_infini":
      lignes.push(ligne("=+\\infty", [texte("car "), latex("e^{t}\\to+\\infty"), texte(" quand "), latex("t\\to+\\infty")]));
      break;
    case "moins_infini":
      lignes.push(ligne("=0", [texte("car "), latex("e^{t}\\to0"), texte(" quand "), latex("t\\to-\\infty")]));
      break;
  }
  const etapes: EtapeCorrection[] = [
    utilise("c", [
      texte("L'exponentielle est continue : si l'exposant tend vers L fini, la puissance tend vers "),
      latex("e^{L}"),
      texte(" ; si "),
      latex("L=+\\infty"),
      texte(", elle tend vers "),
      latex("+\\infty"),
      texte(" ; si "),
      latex("L=-\\infty"),
      texte(", elle tend vers 0."),
    ]),
    calcul("c", lignes),
    resultat("c", [latex(reponseAttendueDLatex(e, "dConclure"))]),
  ];
  // Vérification numérique simple (1^∞ vers une valeur finie ≠ 1) : la puissance en un point proche.
  if (e.issue === "fini" && (e.sousType === "d1" || e.sousType === "d2" || e.sousType === "d3")) {
    const x0 = e.sousType === "d3" ? (e.cote === "droite" ? 0.001 : -0.001) : e.direction === "plus_infini" ? 1000 : -1000;
    const valeur = valeurPuissanceD(e, x0);
    const x0Latex = String(x0).replace(".", "{,}");
    etapes.push(
      verification("c", [
        texte("En "),
        latex(`x=${x0Latex}`),
        texte(", la puissance vaut environ "),
        latex(approche(valeur)),
        texte(", proche de "),
        latex(`${cibleLatexD(e.limiteFinale)}\\approx ${approche(e.limiteFinale.type === "valeur" ? e.limiteFinale.valeur : 0)}`),
        texte(" ✓"),
      ]),
    );
  }
  if (e.issue === "fini") etapes.push(piege("c", [texte("Ne pas s'arrêter à la limite de l'exposant : la limite cherchée est "), latex("e^{L}"), texte(", pas L.")]));
  if (e.issue === "un") {
    const forme = e.forme === "un_infini" ? "1^{\\infty}" : e.forme === "zero_zero" ? "0^{0}" : "(+\\infty)^{0}";
    etapes.push(piege("c", [texte("La limite vaut bien 1 ici, mais parce que l'exposant de "), latex("e"), texte(" tend vers 0 — pas en vertu d'une règle « "), latex(`${forme}=1`), texte(" », qui serait fausse dans d'autres exercices.")]));
  }
  return etapes;
}

/** f(x)^{g(x)} évaluée en x (vérification numérique du corrigé). */
export function valeurPuissanceD(e: ExerciceLimiteLogD, x: number): number {
  switch (e.sousType) {
    case "d1":
      return Math.pow(1 + e.a / Math.pow(x, e.p), (e.b / e.d) * Math.pow(x, e.q));
    case "d2":
      return Math.pow((x + e.b) / (x + e.c), e.k * Math.pow(x, e.q));
    case "d3":
      return Math.pow(1 + e.a * x, e.c / Math.pow(x, e.q));
    case "d4":
    case "d6":
      return Math.pow(x, e.exposant === "surLn" ? e.a / Math.log(x) : e.sousType === "d4" ? e.a * Math.pow(x, e.q) : e.a / Math.pow(x, e.q));
    case "d5":
      return Math.pow(Math.exp(-1 / Math.pow(x, e.p)), e.a * Math.pow(x, e.q));
    case "d7":
      return Math.pow(Math.exp(Math.pow(x, e.p)), e.a / Math.pow(x, e.q));
  }
}

/** Corrigé détaillé complet de la famille D (étapes a, b, c). */
export function correctionDetailleeD(e: ExerciceLimiteLogD): EtapeCorrection[] {
  return [...etapeForme(e), ...etapeExposant(e), ...etapeConclure(e)];
}

// ============================================================================
// Familles A, B, C (croissances comparées, limite de référence ln(1+u)/u, limites déterminées)
// ============================================================================

const P = "x\\to+\\infty";
const LIM = `\\lim_{${P}}`;
const HIERARCHIE = "\\ln(x)\\ll x^n\\ll b^x\\ (b>1)";

/** Limite (cible) en LaTeX, avec valeur approchée au centième si elle n'est pas entière. */
function cibleAvecApproche(c: CibleLimiteLog): string {
  const exacte = formatCibleTexte(c);
  return c.type === "valeur" && !Number.isInteger(c.valeur) ? `${exacte}\\approx ${c.valeur.toFixed(2).replace(".", "{,}")}` : exacte;
}

function xd(d: number): string {
  return formatPuissance("x", d);
}

/** a·xᵈ avec coefficient (« 3x^{2} », « -x »). */
function axd(a: number, d: number): string {
  return formatSommeTermes([{ valeur: a, suffixe: xd(d) }]);
}

/** Étape a (dominance) de la famille A : chaque partie, ses termes comparés ligne à ligne. */
function dominanceA(e: ExerciceLimiteLogA): LigneCalcul[] {
  switch (e.sousType) {
    case "sous1":
      return [
        ligne(`N(x)=${formatSommeTermes([{ valeur: e.k, suffixe: "\\ln(x)" }])}`, "numérateur : un seul terme, un logarithme"),
        ligne(`D(x)=${formatSommeTermes([{ valeur: e.a, suffixe: xd(e.d) }, { valeur: e.b, suffixe: "" }])}`, justif("dénominateur : terme dominant ", { l: axd(e.a, e.d) })),
        ...(e.b === 0 ? [] : [ligne(`${LIM}\\dfrac{${e.b}}{${axd(e.a, e.d)}}=0`, "la constante est négligeable devant le polynôme")]),
      ];
    case "sous2": {
      const exp = `${e.base}^x`;
      const poly = axd(e.q, e.d);
      return [
        ligne(`${e.orientation === "expSurPoly" ? "N" : "D"}(x)=${exp}`, justif("un seul terme : exponentielle de base ", { l: `${e.base}>1` })),
        ligne(`${e.orientation === "expSurPoly" ? "D" : "N"}(x)=${poly}`, "un seul terme : polynôme"),
      ];
    }
    case "sous3":
      return [
        ligne(`N(x)=${formatSommeTermes([{ valeur: e.p1, suffixe: "\\ln(x)" }, { valeur: e.c1, suffixe: "" }])}`, "numérateur : terme dominant, le logarithme"),
        ...(e.c1 === 0 ? [] : [ligne(`${LIM}\\dfrac{${e.c1}}{${formatSommeTermes([{ valeur: e.p1, suffixe: "\\ln(x)" }])}}=0`, "la constante est négligeable devant le logarithme")]),
        ligne(`D(x)=${formatSommeTermes([{ valeur: e.p2, suffixe: `\\log_{${e.base}}(x)` }, { valeur: e.c2, suffixe: "" }])}`, "dénominateur : terme dominant, le logarithme"),
        ...(e.c2 === 0 ? [] : [ligne(`${LIM}\\dfrac{${e.c2}}{${formatSommeTermes([{ valeur: e.p2, suffixe: `\\log_{${e.base}}(x)` }])}}=0`, "la constante est négligeable devant le logarithme")]),
      ];
    case "sous4": {
      const px = axd(e.a, e.d);
      const reste = (b: number) => (e.c === 0 ? `\\log_{${b}}(x)` : `${e.c}+\\log_{${b}}(x)`);
      return [
        ligne(`${LIM}\\dfrac{${reste(e.base1)}}{${px}}=0`, "croissance comparée : le polynôme l'emporte sur le logarithme et la constante"),
        ligne(`${LIM}\\dfrac{${reste(e.base2)}}{${px}}=0`, "même raison au dénominateur"),
      ];
    }
    case "sous5": {
      const b1 = formatBaseDecimale(e.base1);
      return [
        ligne(`${LIM}${e.c1 === 1 ? "" : e.c1 === -1 ? "-" : `${e.c1}\\cdot `}${b1}^x=0`, justif("base ", { l: `0<${b1}<1` }, " : l'exponentielle tend vers 0, le polynôme domine au numérateur")),
        ligne(`${LIM}\\dfrac{${axd(e.a2, e.d2)}}{${e.c2 === 1 ? "" : `${e.c2}\\cdot `}${e.base2}^x}=0`, justif("croissance comparée : l'exponentielle de base ", { l: `${e.base2}>1` }, " l'emporte au dénominateur")),
      ];
    }
  }
}

/** Étape b (conclure) de la famille A : mise en évidence puis limite de chaque facteur. */
function conclusionA(e: ExerciceLimiteLogA): LigneCalcul[] {
  const f = `f(x)`;
  const l: LigneCalcul[] = [ligne(`${f}=${formeFactoriseeA(e)}`, "on met en évidence les termes dominants")];
  const fin = formatCibleTexte(e.limiteGlobale);
  switch (e.sousType) {
    case "sous1": {
      const reste = e.b === 0 ? `\\dfrac{${e.k}}{${e.a}}` : `\\dfrac{${e.k}}{${e.a}${e.b < 0 ? "-" : "+"}\\frac{${Math.abs(e.b)}}{${xd(e.d)}}}`;
      l.push(ligne(`${LIM}\\dfrac{\\ln(x)}{${xd(e.d)}}=0`, "croissance comparée"), ...(e.b === 0 ? [] : [ligne(`${LIM}${reste}=${frac(e.k, e.a)}`, justif("", { l: `\\dfrac{${Math.abs(e.b)}}{${xd(e.d)}}\\to 0` }))]), ligne(`${LIM}f(x)=0\\cdot ${parN(e.k / e.a)}`, "produit des limites"), ligne(`=${fin}`));
      break;
    }
    case "sous2":
      if (e.orientation === "expSurPoly") l.push(ligne(`${LIM}\\dfrac{${e.base}^x}{${xd(e.d)}}=+\\infty`, "croissance comparée : l'exponentielle l'emporte"), ligne(`${LIM}f(x)=${fin}`, e.q > 0 ? "facteur positif" : "facteur négatif : le signe change"));
      else l.push(ligne(`${LIM}\\dfrac{${xd(e.d)}}{${e.base}^x}=0`, "croissance comparée : l'exponentielle l'emporte"), ligne(`${LIM}f(x)=${parN(e.q)}\\cdot 0`, "produit des limites"), ligne(`=${fin}`));
      break;
    case "sous3": {
      const haut = `${e.p1}${e.c1 === 0 ? "" : `${e.c1 < 0 ? "-" : "+"}\\dfrac{${Math.abs(e.c1)}}{\\ln(x)}`}`;
      const bas = `\\dfrac{${e.p2}}{\\ln(${e.base})}${e.c2 === 0 ? "" : `${e.c2 < 0 ? "-" : "+"}\\dfrac{${Math.abs(e.c2)}}{\\ln(x)}`}`;
      l.push(
        ligne(`=\\dfrac{${haut}}{${bas}}`, justif("on simplifie par ", { l: "\\ln(x)" })),
        ligne(`${LIM}f(x)=\\dfrac{${e.p1}}{\\frac{${e.p2}}{\\ln(${e.base})}}`, justif("", { l: "\\dfrac{c}{\\ln(x)}\\to 0" })),
        ligne(`=\\dfrac{${e.p1 === 1 ? "" : e.p1 === -1 ? "-" : e.p1}\\ln(${e.base})}{${e.p2}}`, "diviser par une fraction, c'est multiplier par son inverse"),
      );
      if (`\\dfrac{${e.p1 === 1 ? "" : e.p1 === -1 ? "-" : e.p1}\\ln(${e.base})}{${e.p2}}` !== fin) l.push(ligne(`=${fin}`, "on simplifie"));
      break;
    }
    case "sous4":
      l.push(ligne(`=\\dfrac{1+\\frac{${e.c === 0 ? "" : `${e.c}+`}\\log_{${e.base1}}(x)}{${axd(e.a, e.d)}}}{1+\\frac{${e.c === 0 ? "" : `${e.c}+`}\\log_{${e.base2}}(x)}{${axd(e.a, e.d)}}}`, justif("on simplifie par ", { l: axd(e.a, e.d) })), ligne(`${LIM}f(x)=\\dfrac{1+0}{1+0}`, "les deux quotients tendent vers 0 (étape 1)"), ligne(`=${fin}`));
      break;
    case "sous5":
      l.push(
        ligne(`${LIM}\\dfrac{${xd(e.d1)}}{${e.base2}^x}=0`, "croissance comparée"),
        ligne(`${LIM}\\dfrac{${e.a1}+\\frac{${formatSommeTermes([{ valeur: e.c1, suffixe: `${formatBaseDecimale(e.base1)}^x`, cdot: true }])}}{${xd(e.d1)}}}{${e.c2}+\\frac{${axd(e.a2, e.d2)}}{${e.base2}^x}}=${frac(e.a1, e.c2)}`, "les quotients tendent vers 0"),
        ligne(`${LIM}f(x)=0\\cdot ${parN(e.a1 / e.c2)}`, "produit des limites"),
        ligne(`=${fin}`),
      );
      break;
  }
  return l;
}

function piegeA(e: ExerciceLimiteLogA): FragmentConsigne[] {
  if (e.sousType === "sous3") return [texte("Le changement de base fait apparaître le facteur "), latex(`\\ln(${e.base})`), texte(" : "), latex(`\\log_{${e.base}}(x)=\\dfrac{\\ln(x)}{\\ln(${e.base})}`), texte(".")];
  if (e.sousType === "sous5") return [texte("Une exponentielle de base comprise entre 0 et 1 tend vers 0 : elle ne domine pas, c'est le polynôme qui l'emporte au numérateur.")];
  return [texte("Ne pas conclure « forme indéterminée » : on compare les termes dominants avec la hiérarchie "), latex(HIERARCHIE), texte(".")];
}

function correctionA(e: ExerciceLimiteLogA): EtapeCorrection[] {
  return [
    utilise("a", [texte("Croissances comparées : "), latex(HIERARCHIE), texte(` ; une exponentielle de base comprise entre 0 et 1 tend vers 0 ${COURS}. Dans chaque partie, un terme négligeable divisé par le terme dominant tend vers 0.`)]),
    calcul("a", dominanceA(e)),
    resultat("a", [texte(`Numérateur : ${formatCategorieLabel(e.dominanceNumerateur).toLowerCase()} ; dénominateur : ${formatCategorieLabel(e.dominanceDenominateur).toLowerCase()}.`)]),
    utilise("b", [texte("On met en évidence le terme dominant en haut et en bas, puis on utilise une croissance comparée du cours et la limite d'un produit / quotient "), texte(COURS), texte(".")]),
    calcul("b", sansRepetitionL(conclusionA(e))),
    resultat("b", [latex(`${formatLimiteEnonceLatex(e)}=${cibleAvecApproche(e.limiteGlobale)}`)]),
    piege(e.sousType === "sous5" ? "a" : "b", piegeA(e)),
  ];
}

function correctionB(e: ExerciceLimiteLogB): EtapeCorrection[] {
  const x0 = e.x0;
  const lx = `\\lim_{x\\to ${x0}}`;
  const lu = "\\lim_{u\\to 0}";
  const uDef = x0 === 1 ? "u=x-1" : `u=\\dfrac{x}{${x0}}-1`;
  const xDeU = x0 === 1 ? "x=1+u" : `x=${x0}(1+u)`;
  const reform = formatReformulationBLatex(e);
  const a: LigneCalcul[] = [ligne(uDef, "on pose"), ligne(xDeU, "on isole x"), ligne(`${x0 === 1 ? "x" : `\\dfrac{x}{${x0}}`}=1+u`, "base du logarithme")];
  let b: LigneCalcul[];
  if (e.sousType === "quotient") {
    const c = e.m * x0;
    const arg = formatSommeTermes([{ valeur: e.m, suffixe: "x" }, { valeur: e.n, suffixe: "" }]);
    const base = formatBaseB(x0, e.k);
    a.push(
      ligne(`${arg}=${e.m === 1 ? "" : e.m === -1 ? "-" : `${e.m}\\cdot `}${x0 === 1 ? "(1+u)" : `${x0}(1+u)`}${e.n === 0 ? "" : e.n > 0 ? `+${e.n}` : `-${-e.n}`}`, "on remplace x"),
      ligne(`=${formatUnPlusKU(c)}`, justif("on développe, et ", { l: `${e.m === 1 ? "" : e.m === -1 ? "-" : `${e.m}\\cdot `}${x0}${e.n === 0 ? "" : e.n > 0 ? `+${e.n}` : `-${-e.n}`}=1` })),
      ligne(`f(x)=\\dfrac{\\ln(${arg})}{\\ln\\left(${base}\\right)}`, justif("changement de base : ", { l: "\\log_a(X)=\\dfrac{\\ln(X)}{\\ln(a)}" })),
      ...(e.k === 1 ? [] : [ligne(`=\\dfrac{\\ln(${arg})}{${e.k}\\ln\\left(${formatBaseB(x0, 1)}\\right)}`, justif("", { l: "\\ln(a^k)=k\\ln(a)" }))]),
      ligne(`=${reform}`, "on remplace en fonction de u"),
    );
    b = [
      ligne(`f(x)=${reform}`, "forme de l'étape 1"),
      ligne(`=${frac(c, e.k)}\\cdot\\dfrac{\\dfrac{\\ln(${formatUnPlusKU(c)})}{${formatKU(c)}}}{\\dfrac{\\ln(1+u)}{u}}`, justif("on multiplie et on divise par ", { l: formatKU(c) }, " et par u")),
      ligne(`${lu}\\dfrac{\\ln(${formatUnPlusKU(c)})}{${formatKU(c)}}=1`, justif("limite de référence, car ", { l: `${formatKU(c)}\\to 0` })),
      ligne(`${lu}\\dfrac{\\ln(1+u)}{u}=1`, "limite de référence"),
      ligne(`${lx}f(x)=${frac(c, e.k)}\\cdot\\dfrac{1}{1}`, "produit et quotient des limites"),
      ...(e.limiteLatex === frac(c, e.k) ? [] : [ligne(`=${e.limiteLatex}`, "on simplifie")]),
    ];
  } else {
    a.push(
      ligne(`x-${x0}=${x0 === 1 ? "u" : `${x0}u`}`, justif("car ", { l: xDeU })),
      ligne(`\\log_{${formatBaseB(x0, 1)}}(${e.k})=\\dfrac{\\ln(${e.k})}{\\ln\\left(${formatBaseB(x0, 1)}\\right)}`, "changement de base"),
      ligne(`=\\dfrac{\\ln(${e.k})}{\\ln(1+u)}`, "base en fonction de u"),
      ligne(`f(x)=${reform}`, "on multiplie les deux facteurs"),
    );
    b = [
      ligne(`f(x)=${reform}`, "forme de l'étape 1"),
      ligne(`=${x0 === 1 ? "" : `${x0}`}\\ln(${e.k})\\cdot\\dfrac{u}{\\ln(1+u)}`, "on isole le quotient de référence"),
      ligne(`${lu}\\dfrac{u}{\\ln(1+u)}=1`, "inverse de la limite de référence"),
      ligne(`${lx}f(x)=${x0 === 1 ? "" : `${x0}`}\\ln(${e.k})`, "produit des limites"),
      ...(e.limiteLatex === `${x0 === 1 ? "" : `${x0}`}\\ln(${e.k})` ? [] : [ligne(`=${e.limiteLatex}`, "on simplifie")]),
      ligne(`\\approx ${e.limiteFinale.toFixed(2).replace(".", "{,}")}`, "valeur approchée"),
    ];
  }
  const fin = cibleAvecApproche({ type: "valeur", valeur: e.limiteFinale, latex: e.limiteLatex });
  return [
    utilise("a", [texte("La base et l'argument du logarithme tendent vers 1 : forme 0/0 déguisée. On pose "), latex("u=\\dfrac{x}{x_0}-1"), texte(" (alors "), latex("u\\to 0"), texte(") et on écrit le logarithme avec ln (changement de base) "), texte(COURS), texte(".")]),
    calcul("a", a),
    resultat("a", [latex(`f(x)=${reform}`)]),
    utilise("b", [texte("Limite de référence "), latex("\\lim_{u\\to 0}\\dfrac{\\ln(1+u)}{u}=1"), texte(` ${COURS}.`)]),
    calcul("b", sansRepetitionL(b)),
    resultat("b", [latex(`${formatLimiteEnonceLatex(e)}=${fin}`)]),
    piege("b", e.sousType === "quotient" ? [texte("Le coefficient de u compte : "), latex(`\\dfrac{\\ln(1+cu)}{u}\\to c`), texte(", pas 1.")] : [texte("Remplacer directement x par "), latex(String(x0)), texte(" donne une forme indéterminée : il faut la substitution.")]),
  ];
}

function correctionC(e: ExerciceLimiteLogC): EtapeCorrection[] {
  const L = `\\lim_{${formatDirectionC(e)}}`;
  let a: LigneCalcul[];
  let b: LigneCalcul[];
  let res1: string;
  if (e.sousType === "c1") {
    const signe = e.direction === "droite" ? "0^+" : "0^-";
    a = [
      ligne(`\\log_x(x+${e.c})=\\dfrac{\\ln(x+${e.c})}{\\ln(x)}`, "changement de base"),
      ligne(`${L}\\ln(x+${e.c})=\\ln(${1 + e.c})`, "ln est continue : on remplace x par 1"),
      ligne(`${L}\\ln(x)=\\ln(1)`, "on remplace x par 1"),
      ligne("=0", ""),
      ligne(`\\ln(x)${e.direction === "droite" ? ">" : "<"}0`, e.direction === "droite" ? "pour x > 1 : le dénominateur tend vers 0 par valeurs positives" : "pour x < 1 : le dénominateur tend vers 0 par valeurs négatives"),
    ];
    res1 = `\\text{numérateur}\\to\\ln(${1 + e.c}),\\quad\\text{dénominateur}\\to ${signe}`;
    b = [ligne(`\\ln(${1 + e.c})>0`, justif("car ", { l: `${1 + e.c}>1` })), ligne(`${L}f(x)=${formatCibleTexte(e.limiteFinale)}`, justif("constante positive divisée par ", { l: signe }))];
  } else if (e.sousType === "c2") {
    const inf = e.direction === "plus_infini" ? "+\\infty" : "-\\infty";
    a = [ligne(`${L}\\dfrac{${e.coefC}}{x}=0`, "constante divisée par un infini"), ligne(`${L}${e.base}^{\\frac{${e.coefC}}{x}}=${e.base}^{0}`, "l'exponentielle est continue"), ligne("=1", ""), ligne(`${L}x=${inf}`, "premier facteur")];
    res1 = `x\\to ${inf},\\quad ${e.base}^{\\frac{${e.coefC}}{x}}\\to 1`;
    b = [ligne(`${L}f(x)=${formatCibleTexte(e.limiteFinale)}`, "un infini multiplié par une limite strictement positive (1) garde son signe")];
  } else {
    const den = e.coefC === 1 ? "x^2" : `${e.coefC}x^2`;
    const num = `${e.base}^x${e.q < 0 ? "-" : "+"}${Math.abs(e.q)}+\\sin(x)`;
    a = [
      ligne(`${L}(${num})=${e.base}^{0}${e.q < 0 ? "-" : "+"}${Math.abs(e.q)}+\\sin(0)`, "fonctions continues : on remplace x par 0"),
      ligne(`=${1 + e.q}`, justif("", { l: `${e.base}^{0}=1` }, " et ", { l: "\\sin(0)=0" })),
      ligne(`${L}\\ln(1+${den})=\\ln(1)`, "on remplace x par 0"),
      ligne("=0", ""),
      ligne(`1+${den}\\geq 1`, justif("donc ", { l: `\\ln(1+${den})\\geq 0` }, " : le dénominateur tend vers 0 par valeurs positives")),
    ];
    res1 = `\\text{numérateur}\\to ${1 + e.q},\\quad\\text{dénominateur}\\to 0^+`;
    b = [ligne(`${1 + e.q}${1 + e.q > 0 ? ">" : "<"}0`, "signe du numérateur"), ligne(`${L}f(x)=${formatCibleTexte(e.limiteFinale)}`, justif("constante non nulle divisée par ", { l: "0^+" }, " : signe du numérateur"))];
  }
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte(`Avant toute technique de forme indéterminée, on évalue chaque partie séparément (fonctions continues, signe au voisinage) ${COURS}.`)]),
    calcul("a", a),
    resultat("a", [latex(res1)]),
    utilise("b", [texte("Règle des signes : une constante non nulle divisée par une quantité qui tend vers 0 tend vers l'infini (signe du quotient) ; un infini multiplié par une limite strictement positive reste un infini de même signe.")]),
    calcul("b", b),
    resultat("b", [latex(`${formatLimiteEnonceLatex(e)}=${formatCibleTexte(e.limiteFinale)}`)]),
  ];
  if (e.sousType === "c3") etapes.push(piege("a", [texte("Le numérateur ne s'annule pas : ce n'est pas une forme 0/0, aucune technique de forme indéterminée n'est nécessaire.")]));
  else if (e.sousType === "c1") etapes.push(piege("b", [texte("Le signe du dénominateur dépend du côté : "), latex("\\ln(x)>0"), texte(" à droite de 1, "), latex("\\ln(x)<0"), texte(" à gauche.")]));
  return etapes;
}

function sansRepetitionL(l: LigneCalcul[]): LigneCalcul[] {
  const n = (s: string) => s.replace(/\\dfrac/g, "\\frac").replace(/\s+/g, "").replace(/^=/, "");
  return l.filter((x, i) => i === 0 || n(x.latex) !== n(l[i - 1].latex));
}

function ordonner(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return [...etapes].sort((a, b) => (a.sousQuestion ?? "").localeCompare(b.sousQuestion ?? ""));
}

/** Corrigé détaillé « comme au tableau » de `6gen17`, toutes familles (A, B, C, D). */
export function correctionDetailleeLimitesLog(e: ExerciceLimiteLogarithmique): EtapeCorrection[] {
  if (e.famille === "A") return finaliserCorrige(ordonner(correctionA(e)));
  if (e.famille === "B") return finaliserCorrige(ordonner(correctionB(e)));
  if (e.famille === "C") return finaliserCorrige(ordonner(correctionC(e)));
  return finaliserCorrige(correctionDetailleeD(e));
}
