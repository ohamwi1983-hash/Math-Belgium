import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLimitesRef } from "../../core6e/limitesReference.types";
import {
  baseA,
  COURS_LIMITES,
  coefLnL,
  evaluer,
  expKx,
  expressionL,
  formeAttendue,
  fracBrute,
  limite,
  limExprL,
  limL,
  monome,
  morceaux,
  puissanceX,
  REFERENCES_L,
  referencesAcceptees,
  reponse,
  valeurLimiteL,
} from "../../ui6e/formatLimitesReference";
import { coefL, decL, q, qL } from "../../ui6e/nombresExp";

/**
 * Corrigé détaillé « comme au tableau » de 6gen145, une lettre par écran : a) la limite de chaque
 * morceau, puis la forme ; b) l'expression réécrite pour faire apparaître la limite de référence
 * (identités vraies pour tout x du domaine) ; c) le passage à la limite, puis (en 0) un contrôle
 * numérique pour x = 0,001. La règle de L'Hôpital n'est pas employée (le générateur entraîne les
 * limites de référence).
 */

type E = ExerciceLimitesRef;
const t = texte;
const f = latex;

/** Coefficient rationnel devant un produit (« \dfrac{3}{2}\cdot », « 3\cdot », rien pour 1, « - » pour −1). */
function coefDevant(n: number, d: number): string {
  const c = q(n, d);
  if (c.n === c.d) return "";
  if (c.n === -c.d) return "-";
  return `${qL(c)}\\cdot `;
}

function etapeForme(e: E): EtapeCorrection[] {
  const lignes: LigneCalcul[] = [];
  for (const m of morceaux(e)) {
    if (m.via) {
      lignes.push(ligne(`${limL(e)}\\left(${m.expr}\\right)=${m.via}`, [t("on remplace "), f("x"), t(" par 0 : "), f("a^{0}=1")]));
      lignes.push(ligne(`=${m.lim}`, m.role));
    } else lignes.push(ligne(`${limL(e)}${/[+-]/.test(m.expr.slice(1)) ? `\\left(${m.expr}\\right)` : m.expr}=${m.lim}`, m.role));
  }
  const fa = formeAttendue(e);
  return [
    utilise("a", [t("On calcule séparément la limite de chaque morceau ; les formes indéterminées sont "), f("\\dfrac{0}{0}"), t(", "), f("\\dfrac{\\infty}{\\infty}"), t(", "), f("0\\cdot\\infty"), t(" et "), f("\\infty-\\infty"), t(` ${COURS_LIMITES}.`)]),
    calcul("a", lignes),
    resultat("a", reponse(e, "forme")),
    piege("a", fa === "aucune" ? [t("Croire à une forme indéterminée dès qu'un infini apparaît : ici les règles de calcul concluent.")] : [t("Conclure trop vite (« 0 », « 1 » ou « ∞ ») sans transformer l'expression.")]),
  ];
}

/** Réécriture qui fait apparaître la référence (écran 2), ou la règle de calcul (pas une FI). */
function lignesReference(e: E): LigneCalcul[] {
  const A = baseA(e.a);
  const F = expressionL(e);
  switch (`${e.variante}/${e.sousType}`) {
    case "expo0/quotient":
      return [ligne(`${F}=${fracBrute(e.k, e.m)}\\cdot\\dfrac{${expKx(e.k)}-1}{${coefL(e.k)}x}`, [t("on multiplie et on divise par "), f(`${e.k}`), t(" ; "), f(`u=${coefL(e.k)}x`), t(" tend vers 0")])];
    case "expo0/inverse":
      return [
        ligne(`${F}=${fracBrute(e.m, e.k)}\\cdot\\dfrac{${coefL(e.k)}x}{${expKx(e.k)}-1}`, [t("on multiplie et on divise par "), f(`${e.k}`)]),
        ligne(`=${fracBrute(e.m, e.k)}\\cdot\\dfrac{1}{\\frac{${expKx(e.k)}-1}{${coefL(e.k)}x}}`, [t("inverse du quotient de référence, "), f(`u=${coefL(e.k)}x`)]),
      ];
    case "expo0/difference": {
      const tk = `\\dfrac{${expKx(e.k)}-1}{${coefL(e.k)}x}`;
      const tj = `\\dfrac{${expKx(e.j)}-1}{${coefL(e.j)}x}`;
      const second = fracBrute(e.j, e.m);
      return [
        ligne(`${F}=\\dfrac{(${expKx(e.k)}-1)-(${expKx(e.j)}-1)}{${coefL(e.m)}x}`, "on retranche et on ajoute 1"),
        ligne(`=${fracBrute(e.k, e.m)}\\cdot ${tk}${second.startsWith("-") ? "+" + second.slice(1) : "-" + second}\\cdot ${tj}`, "on coupe en deux quotients de référence"),
      ];
    }
    case "base0/quotient":
      return [ligne(`${F}=${fracBrute(e.k, e.m)}\\cdot\\dfrac{${e.a}^{${coefL(e.k)}x}-1}{${coefL(e.k)}x}`, [t("on multiplie et on divise par "), f(`${e.k}`), t(" ; "), f(`u=${coefL(e.k)}x`), t(" tend vers 0")])];
    case "base0/difference":
      return [ligne(`${F}=\\dfrac{(${e.a}^{x}-1)-(${e.b}^{x}-1)}{x}`, "on retranche et on ajoute 1"), ligne(`=\\dfrac{${e.a}^{x}-1}{x}-\\dfrac{${e.b}^{x}-1}{x}`, "on coupe en deux quotients de référence")];
    case "plusInfini/quotient":
      return [ligne(`${F}=${e.c}\\cdot\\dfrac{${puissanceX(e.n)}}{${A}^{x}}`, `on sort la constante ; base ${A === "e" ? "e" : A} > 1`)];
    case "plusInfini/inverse":
      return [ligne(`${F}=\\dfrac{1}{${e.c}}\\cdot\\dfrac{1}{\\frac{${puissanceX(e.n)}}{${A}^{x}}}`, "inverse du quotient de référence")];
    case "plusInfini/produit": {
      const l = [ligne(`${F}=${e.c}\\cdot\\dfrac{${puissanceX(e.n)}}{e^{${e.k === 1 ? "" : e.k}x}}`, [f("e^{-u}=\\dfrac{1}{e^{u}}")])];
      if (e.k !== 1) l.push(ligne(`=${e.c}\\cdot\\dfrac{${puissanceX(e.n)}}{\\left(e^{${e.k}}\\right)^{x}}`, [t("base "), f(`e^{${e.k}}>1`)]));
      return l;
    }
    case "plusInfini/difference":
      return [ligne(`${F}=${A}^{x}\\left(1-${e.c}\\cdot\\dfrac{${puissanceX(e.n)}}{${A}^{x}}\\right)`, [t("on met "), f(`${A}^{x}`), t(" en évidence")])];
    case "moinsInfini/produit":
    case "moinsInfini/produitPlusD": {
      const l: LigneCalcul[] = [];
      if (e.a === 0 && e.k !== 1) l.push(ligne(`${expKx(e.k)}=\\left(e^{${e.k}}\\right)^{x}`, "règle (4)"));
      l.push(ligne(`${e.a === 0 ? `e^{${e.k === 1 ? 1 : e.k}}` : e.a}>1`, "la base est plus grande que 1"));
      return l;
    }
    case "pasFI/produitInfini":
      return [ligne(`${F}\\geq ${A}^{x}`, [t("pour "), f("x\\geq 1"), t(" : le facteur "), f(monome(e.c, e.n)), t(" vaut au moins 1")])];
    case "pasFI/sommeInfini":
      return [ligne(`${F}\\geq ${A}^{x}`, [t("pour "), f("x>0"), t(" : on ajoute un nombre positif")])];
    case "pasFI/quotientMoins":
      return [ligne(`${F}=${monome(e.c, e.n)}\\cdot\\left(\\dfrac{1}{${A}}\\right)^{x}`, [f(`\\dfrac{1}{${A}^{x}}=\\left(\\dfrac{1}{${A}}\\right)^{x}`), t(", base plus petite que 1 : tend vers "), f("+\\infty"), t(" en "), f("-\\infty")])];
    default:
      return [ligne(`${F}=\\left(${expKx(e.k)}${e.c < 0 ? e.c : "+" + e.c}\\right)\\cdot\\dfrac{1}{x}`, [f("\\dfrac{1}{x}"), t(" tend vers 0")])];
  }
}

function etapeReference(e: E): EtapeCorrection[] {
  const ref = referencesAcceptees(e)[0];
  const pasFI = e.variante === "pasFI";
  return [
    utilise("b", pasFI ? [t("La forme n'est pas indéterminée : on conclut par les règles de calcul des limites (produit, somme, quotient).")] : [t("On réécrit l'expression (identité vraie pour tout "), f("x"), t(" du domaine) pour faire apparaître une limite de référence du cours : "), ...REFERENCES_L[ref].map((x) => (x.type === "texte" ? t(x.valeur) : f(x.valeur)))]),
    calcul("b", lignesReference(e)),
    resultat("b", REFERENCES_L[ref].map((x) => (x.type === "texte" ? t(x.valeur) : f(x.valeur)))),
    ...(e.variante === "moinsInfini" ? [piege("b", [t("Croire que "), f("x^{n}"), t(" l'emporte parce que son exposant est grand : en "), f("-\\infty"), t(", l'exponentielle de base > 1 tend vers 0 et gagne.")])] : []),
    ...(e.variante === "plusInfini" ? [piege("b", [t("Croire que "), f("x^{n}"), t(" l'emporte quand "), f("n"), t(" est grand : toute exponentielle de base > 1 finit par dominer.")])] : []),
  ];
}

function lignesValeur(e: E): LigneCalcul[] {
  const L = limL(e);
  const LF = limExprL(e);
  const A = baseA(e.a);
  const val = valeurLimiteL(limite(e));
  switch (`${e.variante}/${e.sousType}`) {
    case "expo0/quotient":
      return [ligne(`${LF}=${coefDevant(e.k, e.m)}\\displaystyle\\lim_{u\\to 0}\\dfrac{e^{u}-1}{u}`, [f(`u=${coefL(e.k)}x`)]), ligne(`=${coefDevant(e.k, e.m)}1`, "limite de référence"), ligne(`=${val}`)];
    case "expo0/inverse":
      return [ligne(`${LF}=${coefDevant(e.m, e.k)}\\dfrac{1}{1}`, "inverse de la limite de référence"), ligne(`=${val}`)];
    case "expo0/difference":
      return [ligne(`${LF}=${fracBrute(e.k, e.m)}\\cdot 1${fracBrute(e.j, e.m).startsWith("-") ? "+" + fracBrute(e.j, e.m).slice(1) : "-" + fracBrute(e.j, e.m)}\\cdot 1`, "chaque quotient tend vers 1"), ligne(`=${val}`)];
    case "base0/quotient":
      return [ligne(`${LF}=${coefDevant(e.k, e.m)}\\displaystyle\\lim_{u\\to 0}\\dfrac{${e.a}^{u}-1}{u}`, [f(`u=${coefL(e.k)}x`)]), ligne(`=${coefLnL(q(e.k, e.m), e.a)}`, [t("limite de référence : "), f(`\\ln ${e.a}`)])];
    case "base0/difference":
      return [ligne(`${LF}=${val}`, "chaque quotient de référence donne le logarithme de sa base"), ligne(`=\\ln\\dfrac{${e.a}}{${e.b}}`, [f("\\ln a-\\ln b=\\ln\\dfrac{a}{b}")])];
    case "plusInfini/quotient":
      return [ligne(`${LF}=${e.c}\\cdot 0`, "règle de dominance"), ligne(`=0`)];
    case "plusInfini/produit":
      return [ligne(`${LF}=${e.c}\\cdot 0`, [t("dominance, base "), f(e.k === 1 ? "e" : `e^{${e.k}}`), t(" > 1")]), ligne(`=0`)];
    case "plusInfini/inverse":
      return [ligne(`${LF}=+\\infty`, [t("le quotient de référence tend vers 0 en restant positif ; son inverse tend vers "), f("+\\infty")])];
    case "plusInfini/difference":
      return [
        ligne(`${L}\\left(1-${e.c}\\cdot\\dfrac{${puissanceX(e.n)}}{${A}^{x}}\\right)=1-${e.c}\\cdot 0`, "règle de dominance"),
        ligne(`=1`),
        ligne(`${LF}=+\\infty`, [f(`${A}^{x}\\to+\\infty`), t(" multiplié par un facteur qui tend vers 1")]),
      ];
    case "moinsInfini/produit":
      return [ligne(`${LF}=${e.c}\\cdot 0`, "limite de référence en −∞"), ligne(`=0`)];
    case "moinsInfini/produitPlusD":
      return [ligne(`${LF}=${e.c}\\cdot 0${e.d < 0 ? e.d : "+" + e.d}`, "le produit tend vers 0, le terme constant reste"), ligne(`=${e.d}`)];
    case "pasFI/produitInfini":
    case "pasFI/sommeInfini":
      return [ligne(`${LF}=+\\infty`, [t("minoré par "), f(`${A}^{x}`), t(", qui tend vers "), f("+\\infty")])];
    case "pasFI/quotientMoins":
      return [ligne(`${LF}=${val}`, [f(monome(e.c, e.n)), t(` tend vers ${val.startsWith("+") ? "+" : "−"}∞ et `), f(`\\left(\\dfrac{1}{${A}}\\right)^{x}`), t(" vers +∞")])];
    default:
      return [ligne(`${LF}=${e.c}\\cdot 0`, [t("le numérateur tend vers "), f(`${e.c}`), t(", "), f("\\dfrac{1}{x}"), t(" vers 0")]), ligne(`=0`)];
  }
}

function etapeValeur(e: E): EtapeCorrection[] {
  const verif: EtapeCorrection[] = [];
  if (e.point === "0") {
    const x = 0.001;
    const v = evaluer(e, x);
    const xl = decL(x);
    verif.push(verification("c", [t("Contrôle numérique, pour "), f(`x=${xl}`), t(" :")], [ligne(`${expressionLEn(e, xl)}\\approx ${decL(Math.round(v * 1e4) / 1e4, 4)}`, "proche de la limite")]));
  }
  const pieges: Record<string, FragmentConsigne[]> = {
    expo0: [t("Inverser le rapport des coefficients, ou oublier le facteur constant devant la limite de référence.")],
    base0: [t("Oublier le facteur "), f("\\ln a"), t(" : seule la base e donne 1.")],
    plusInfini: valeurLimiteL(limite(e)) === "0" ? [t("Répondre "), f("+\\infty"), t(" parce que le degré de "), f("x^{n}"), t(" est grand.")] : [t("Répondre 0 ou "), f("-\\infty"), t(" : c'est l'exponentielle (base > 1) qui l'emporte, pas "), f("x^{n}"), t(".")],
    moinsInfini: [t("Répondre "), f("\\pm\\infty"), t(" en suivant "), f("x^{n}"), t(e.d === 0 ? "." : ", ou oublier le terme constant.")],
    pasFI: [t("Chercher une limite de référence alors que les règles de calcul suffisent ; attention au signe de "), f("x^{n}"), t(" en "), f("-\\infty"), t(".")],
  };
  return [
    utilise("c", e.variante === "pasFI" ? [t("Règles de calcul des limites "), t(`${COURS_LIMITES}.`)] : [t("On passe à la limite dans l'expression réécrite, en remplaçant la limite de référence par sa valeur "), t(`${COURS_LIMITES}.`)]),
    calcul("c", lignesValeur(e)),
    resultat("c", reponse(e, "valeur")),
    ...verif,
    piege("c", pieges[e.variante]),
  ];
}

/** L'expression avec x remplacé par une valeur décimale (contrôle numérique en 0). */
function expressionLEn(e: E, xl: string): string {
  const X = `${xl}`;
  const mul = (c: number) => (c === 1 ? X : c === -1 ? `-${X}` : `${c}\\cdot ${X}`);
  switch (`${e.variante}/${e.sousType}`) {
    case "expo0/quotient":
      return `\\dfrac{e^{${mul(e.k)}}-1}{${mul(e.m)}}`;
    case "expo0/inverse":
      return `\\dfrac{${mul(e.m)}}{e^{${mul(e.k)}}-1}`;
    case "expo0/difference":
      return `\\dfrac{e^{${mul(e.k)}}-e^{${mul(e.j)}}}{${mul(e.m)}}`;
    case "base0/quotient":
      return `\\dfrac{${e.a}^{${mul(e.k)}}-1}{${mul(e.m)}}`;
    default:
      return `\\dfrac{${e.a}^{${X}}-${e.b}^{${X}}}{${X}}`;
  }
}

export function correctionDetailleeLimitesRef(e: E): EtapeCorrection[] {
  return [...etapeForme(e), ...etapeReference(e), ...etapeValeur(e)];
}
