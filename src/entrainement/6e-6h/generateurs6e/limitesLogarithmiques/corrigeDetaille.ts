import type { ExerciceLimiteLogD } from "../../core6e/limitesLogarithmiques.types";
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

/**
 * Corrigé détaillé « comme au tableau » de la famille D de `6gen17` (puissances f(x)^{g(x)}) —
 * règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). SOURCE
 * UNIQUE : importé par l'adaptateur papier (`exportEvaluation.ts`) ET par l'appli (`App6gen17.tsx`,
 * `CorrigeDetailleEcran` après une étape échouée). Étapes a, b, c = les trois écrans (forme, limite de
 * l'exposant g·ln f, conclusion). Toutes les écritures viennent de `ui6e/formatLimitesPuissances.ts`
 * (mêmes fonctions que l'énoncé, les aides et les réponses attendues de l'écran). Les familles A–C
 * gardent leur corrigé historique (`exportEvaluation.ts`).
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
