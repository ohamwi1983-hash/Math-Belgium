import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceEtudeComplete, ExerciceEtudeCompleteBonus, ExerciceEtudeCompletePipeline, Exclusion } from "../../core5e/etudeComplete.types";
import { ordreComplet, type PhaseEtudeComplete } from "../../moteur5e/typesEtudeComplete";
import { formatDenominateurLatex, formatNumerateurLatex, formatPenteOrdonnee, formatReponseAttenduePhaseLatex } from "../../ui5e/formatEtudeComplete";
import {
  COURS_ETUDE,
  COURS_LIMITES,
  COURS_OBLIQUE,
  cote,
  degre,
  divisionEuclidienne,
  evalP,
  facteurLatex,
  facteurNu,
  finaliser,
  fracBrute,
  fracL,
  infini,
  lignesFactoriserTrinome,
  lignesValeur,
  lim,
  monomeLatex,
  monomesDe,
  mulP,
  nbT,
  par,
  polyDepuisMonomes,
  polyFacteur,
  polyLatex,
  produitFacteurs,
  subP,
  t,
  f,
  zeroSigne,
  type Monome,
  type Poly,
} from "../../ui5e/corrigeLimites";
import { construireSvgEtudeComplete } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de 5gen24 (étude complète) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreComplet` du moteur) : domaine
 * (dénominateur factorisé : facteur lu, identité remarquable ou Δ), forme en chaque valeur exclue
 * (N(r) calculé), point vide (division de N par (x − r) tour par tour, simplification, limite par la
 * forme simplifiée), limites à gauche et à droite de chaque vraie asymptote verticale (signe de chaque
 * facteur, 0⁺ / 0⁻), asymptotes verticales (lecture), limites en ±∞ (termes de plus haut degré),
 * coefficient a (lim f(x)/x), b (lim [f(x) − ax], même dénominateur), asymptote horizontale / oblique
 * (lecture), recoupement (f(x) = asymptote, équation réduite). Graphe du corrigé (`figure.ts`) sous le
 * résultat de la dernière étape. Variante bonus « construction inverse » : une étape (asymptote + un
 * terme qui tend vers 0 et dont le dénominateur s'annule en r). SANS `docx` : importé par l'adaptateur
 * ET par `App5gen24.tsx`.
 */

const LETTRES = "abcdefghijklmnop";

export function lettrePhaseEtudeComplete(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete): string {
  return LETTRES[ordreComplet(exercice).indexOf(phase)] ?? "a";
}

/** Facteurs du dénominateur AFFICHÉ (« (x-2)(4+x^{2}-4x) », « x^{2}(x+2) », trinôme développé). */
function facteursAffiches(dLatex: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < dLatex.length) {
    if (dLatex[i] === "(") {
      let n = 0;
      let j = i;
      for (; j < dLatex.length; j++) {
        if (dLatex[j] === "(") n++;
        else if (dLatex[j] === ")") {
          n--;
          if (n === 0) break;
        }
      }
      out.push(dLatex.slice(i + 1, j));
      i = j + 1;
    } else {
      const j = dLatex.indexOf("(", i);
      const fin = j < 0 ? dLatex.length : j;
      out.push(dLatex.slice(i, fin));
      i = fin;
    }
  }
  return out.filter((x) => x !== "");
}

interface Donnees {
  nLatex: string;
  dLatex: string;
  nM: Monome[];
  N: Poly;
  D: Poly;
  /** Racines de D avec multiplicité. */
  racinesD: number[];
  pv?: Exclusion;
  vraies: Exclusion[];
  /** Forme simplifiée N₁/D₁ (= M/D_vraie s'il y a un point vide, sinon N/D). */
  N1: Poly;
  D1: Poly;
  /** Racines de D₁ avec multiplicité. */
  racinesD1: number[];
  /** Noms des polynômes de la forme utilisée pour les limites (« N », « D » ou « N_1 », « D_1 »). */
  nomN: string;
  nomD: string;
}

function donnees(e: ExerciceEtudeCompletePipeline): Donnees {
  const nLatex = formatNumerateurLatex(e);
  const dLatex = formatDenominateurLatex(e);
  const nM = monomesDe(nLatex) ?? [];
  const racinesD = e.exclusions.flatMap((x) => (x.type === "vaDouble" ? [x.position, x.position] : [x.position]));
  const pv = e.exclusions.find((x) => x.type === "pointVide");
  const vraies = e.exclusions.filter((x) => x.type !== "pointVide");
  const racinesD1 = vraies.flatMap((x) => (x.type === "vaDouble" ? [x.position, x.position] : [x.position]));
  return {
    nLatex,
    dLatex,
    nM,
    N: e.coeffsN,
    D: e.coeffsD,
    racinesD,
    pv,
    vraies,
    N1: pv && e.coeffsM ? e.coeffsM : e.coeffsN,
    D1: pv && e.coeffsDVraie ? e.coeffsDVraie : e.coeffsD,
    racinesD1,
    nomN: pv ? "N_1" : "N",
    nomD: pv ? "D_1" : "D",
  };
}

/** Phrase « avec N₁(x) = …, D₁(x) = … » (forme simplifiée), vide sans point vide. */
function introForme(d: Donnees): FragmentConsigne[] {
  if (!d.pv) return [];
  return [t("Forme simplifiée (étape du point vide) : "), f(`f(x)=\\dfrac{N_1(x)}{D_1(x)}`), t(" avec "), f(`N_1(x)=${polyLatex(d.N1)}`), t(" et "), f(`D_1(x)=${produitFacteurs(1, d.racinesD1)}`), t(" :")];
}

/** Dénominateur factorisé en entier : (x − r₁)(x − r₂)… */
function dFactorise(d: Donnees): string {
  return produitFacteurs(1, d.racinesD);
}

// ============================================================================
// Domaine.
// ============================================================================

function etapeDomaine(d: Donnees, l: string): EtapeCorrection[] {
  const facteurs = facteursAffiches(d.dLatex);
  const lignes: LigneCalcul[] = [ligne(`D(x)=${d.dLatex}`, "dénominateur de f")];
  if (facteurs.length === 1) {
    const p = polyDepuisMonomes(monomesDe(facteurs[0]) ?? []);
    if (degre(p) === 1) lignes.push(ligne(`x=${-p[0]}`, [t("le dénominateur "), f(facteurs[0]), t(" s'annule")]));
    else lignes.push(...lignesFactoriserTrinome(p, "D(x)").lignes);
  } else {
    for (const fac of facteurs) {
      const p = polyDepuisMonomes(monomesDe(fac) ?? []);
      if (degre(p) === 1) continue;
      if (p.filter((c) => c !== 0).length === 1) continue; // x² : racine 0 double, lue
      lignes.push(...lignesFactoriserTrinome(p, polyLatex(p) === fac ? fac : polyLatex(p)).lignes);
    }
    lignes.push(ligne(`D(x)=${dFactorise(d)}`, "forme factorisée"));
  }
  const exclues = [...new Set(d.racinesD)].sort((u, v) => u - v);
  return [
    utilise(l, [t("f est définie là où le dénominateur ne s'annule pas : on factorise D(x) (facteur lu, identité remarquable ou discriminant) pour trouver ses racines "), t(COURS_ETUDE), t(".")]),
    calcul(l, lignes),
    resultat(l, [f(`\\operatorname{dom} f=\\mathbb{R}\\setminus\\{${exclues.join("\\,;\\,")}\\}`)]),
    piege(l, [t("Une valeur qui annule aussi le numérateur reste exclue du domaine : f n'y est pas définie.")]),
  ];
}

// ============================================================================
// Forme en chaque valeur exclue.
// ============================================================================

function etapeTypeLimite(e: ExerciceEtudeCompletePipeline, d: Donnees, l: string): EtapeCorrection[] {
  const blocs: EtapeCorrection[] = [];
  const res: FragmentConsigne[] = [];
  e.exclusions.forEach((x, i) => {
    const v = lignesValeur(`N(${x.position})`, d.nM, x.position);
    blocs.push(calcul(l, v.lignes, [t("En "), f(`x=${x.position}`), t(", "), f(`D(${x.position})=0`), t(" (étape 1) ; numérateur :")], `En x = ${nbT(x.position)}`));
    res.push(...(i ? [t(" et ")] : []), f(`x=${x.position}`), t(" : forme "), f(v.valeur === 0 ? "\\frac{0}{0}" : `\\frac{${v.valeur}}{0}`), t(v.valeur === 0 ? " (point vide à simplifier)" : " (limite infinie)"));
  });
  return [
    utilise(l, [t("On remplace x par chaque valeur exclue dans le numérateur : si N(r) = 0, forme "), f("\\frac{0}{0}"), t(" (on simplifie) ; sinon forme "), f("\\frac{k}{0}"), t(` avec k ≠ 0 : limite infinie ${COURS_LIMITES}.`)]),
    ...blocs,
    resultat(l, [...res, t(".")]),
  ];
}

// ============================================================================
// Point vide.
// ============================================================================

function etapesPointVide(e: ExerciceEtudeCompletePipeline, d: Donnees, lS: string, lL: string): EtapeCorrection[] {
  const pv = d.pv as Exclusion;
  const r = pv.position;
  const diviseur: Poly = [-r, 1];
  const { quotient, tours } = divisionEuclidienne(d.N, diviseur);
  const fac = facteurLatex(r);
  const produitNM = degre(quotient) === 0 ? `${quotient[0] === 1 ? "" : quotient[0] === -1 ? "-" : quotient[0]}${fac}` : `${fac}(${polyLatex(quotient)})`;
  const lignes: LigneCalcul[] = [ligne(`N(x)=${polyLatex(d.N)}`, polyLatex(d.N) === d.nLatex ? "numérateur" : "numérateur, termes ordonnés")];
  // Une ligne par produit « terme du quotient × (x − r) », une ligne par reste (R₁, R₂…) : membres de
  // gauche courts, la colonne du milieu garde sa largeur (0 formule coupée sur papier).
  tours.forEach((tour, k) => {
    const terme = polyLatex(tour.terme);
    const facteurProduit = r === 0 ? "x" : `(${facteurNu(r)})`;
    const gaucheProduit = terme === "1" ? facteurProduit : terme === "-1" ? `-${facteurProduit}` : `${terme}\\cdot ${facteurProduit}`;
    lignes.push(ligne(`${gaucheProduit}=${polyLatex(tour.produit)}`, k === 0 ? "terme de plus haut degré de N divisé par x, multiplié par le diviseur" : [t("même chose avec le terme de plus haut degré de "), f(`R_${k}(x)`)]));
    lignes.push(ligne(`R_${k + 1}(x)=${polyLatex(tour.reste)}`, [t("on soustrait ce produit de "), f(k === 0 ? "N(x)" : `R_${k}(x)`), t(k === tours.length - 1 ? " : reste nul" : "")]));
  });
  lignes.push(ligne(`N(x)=${produitNM}`, [t("reste nul : N est divisible par "), f(fac), t(" ; quotient : la somme des termes trouvés")]));
  const d1 = produitFacteurs(1, d.racinesD1);
  const simplN = polyLatex(d.N1);
  const reponse = formatReponseAttenduePhaseLatex(e, "pointVideSimplification")[0];
  const facProduit = r === 0 ? "x" : fac;
  const lignesSimpl: LigneCalcul[] = [
    ligne(`N_1(x)=${simplN}`, "quotient de la division"),
    ligne(`D_1(x)=${d1}`, [t("car "), f(`D(x)=${produitFacteurs(1, d.racinesD)}`), t(" (étape 1)")]),
    ligne(`f(x)=\\dfrac{${facProduit}\\cdot N_1(x)}{${facProduit}\\cdot D_1(x)}`, "formes factorisées"),
    ligne(`=\\dfrac{N_1(x)}{D_1(x)}`, [t("on simplifie par "), f(fac), t(", car "), f(`x\\neq ${r}`)]),
  ];
  const vN = lignesValeur(`N_1(${r})`, monomesDe(simplN) ?? [], r);
  const vD = lignesValeur(`D_1(${r})`, monomesDe(polyLatex(d.D1)) ?? [], r);
  const valeur = fracL(vN.valeur, vD.valeur);
  const pointVide = formatReponseAttenduePhaseLatex(e, "pointVideLimite")[0];
  return [
    utilise(lS, [t(`N et D s'annulent en x = ${nbT(r)} : `), f(fac), t(" est un facteur commun. On divise N(x) par "), f(fac), t(" (division euclidienne, un terme du quotient à la fois), puis on simplifie la fraction "), t(COURS_ETUDE), t(".")]),
    calcul(lS, lignes, [], "Numérateur"),
    calcul(lS, lignesSimpl, [t("On nomme les facteurs restants :")]),
    resultat(lS, [f(`f(x)=${reponse}`), t(" pour "), f(`x\\neq ${r}`), t(".")]),
    utilise(lL, [t("La forme simplifiée est définie en "), f(`x=${r}`), t(" : on y remplace x (jamais dans la forme de départ, qui donne "), f("\\frac{0}{0}"), t(`) ${COURS_LIMITES}.`)]),
    calcul(lL, vN.lignes, [f(`N_1(x)=${simplN}`), t(" :")], "Numérateur"),
    calcul(lL, vD.lignes, [f(`D_1(x)=${polyLatex(d.D1)}`), t(" :")], "Dénominateur"),
    calcul(lL, [ligne(`${lim(r)} f(x)=\\dfrac{N_1(${r})}{D_1(${r})}`, "forme simplifiée"), ligne(`=${fracBrute(vN.valeur, vD.valeur)}`), ligne(`=${valeur}`, "on simplifie")], [], "Limite"),
    resultat(lL, [f(`${lim(r)} f(x)=${pointVide}`), t(" : limite finie, pas d'asymptote verticale en "), f(`x=${r}`), t(" ; la courbe a un point retiré "), f(`(${r}\\,;\\,${pointVide})`), t(".")]),
    piege(lL, [t("Une forme "), f("\\frac{0}{0}"), t(" n'est pas une asymptote verticale : après simplification, la limite est finie.")]),
  ];
}

// ============================================================================
// Limites à gauche et à droite d'une vraie asymptote verticale.
// ============================================================================

function etapeLimitesGD(d: Donnees, x: Exclusion, l: string): EtapeCorrection[] {
  const r = x.position;
  const double = x.type === "vaDouble";
  const valN = evalP(d.N1, r);
  const autres = d.racinesD1.filter((y) => y !== r);
  const facteurR = double ? (r === 0 ? "x^{2}" : `(${facteurNu(r)})^{2}`) : r === 0 ? "x" : `(${facteurNu(r)})`;
  const lignes: LigneCalcul[] = [ligne(`${lim(r)} ${d.nomN}(x)=${valN}`, [t("numérateur : il garde le signe de "), f(`${valN}`), t(` près de ${nbT(r)}`)])];
  let valQ = 1;
  if (autres.length) {
    const q = produitFacteurs(1, autres);
    valQ = autres.reduce((p, y) => p * (r - y), 1);
    lignes.push(ligne(`${lim(r)} ${q}=${valQ}`, [t("autres facteurs du dénominateur : signe de "), f(`${valQ}`)]));
  }
  const fracJ = (s: number) => (autres.length ? `\\frac{${valN}}{${zeroSigne(s)}\\cdot ${par(valQ)}}` : `\\frac{${valN}}{${zeroSigne(s)}}`);
  const sg = x.signeGauche as 1 | -1;
  const sd = x.signeDroit as 1 | -1;
  if (double) {
    lignes.push(ligne(`${lim(r)} ${facteurR}=0^{+}`, "un carré est positif des deux côtés"));
    lignes.push(ligne(`${lim(r)} f(x)=${infini(sg)}`, [f(fracJ(1)), t(sg > 0 ? " : quotient positif" : " : quotient négatif")]));
  } else {
    for (const sens of ["gauche", "droite"] as const) {
      const s = sens === "gauche" ? -1 : 1;
      const sl = sens === "gauche" ? sg : sd;
      lignes.push(ligne(`${lim(cote(r, sens))} ${facteurR}=${zeroSigne(s)}`, s < 0 ? `x < ${nbT(r)}` : `x > ${nbT(r)}`));
      lignes.push(ligne(`${lim(cote(r, sens))} f(x)=${infini(sl)}`, [f(fracJ(s)), t(sl > 0 ? " : quotient positif" : " : quotient négatif")]));
    }
  }
  return [
    utilise(l, [t("Près de "), f(`${r}`), t(", le numérateur et les autres facteurs gardent leur signe ; seul "), f(facteurR), t(double ? " tend vers 0, en restant positif (racine double)" : " tend vers 0, négatif à gauche et positif à droite (racine simple)"), t(" : un nombre non nul divisé par 0⁺ ou 0⁻ donne ±∞ selon la règle des signes "), t(COURS_LIMITES), t(".")]),
    calcul(l, lignes, d.pv ? introForme(d) : [t("Avec "), f(`f(x)=\\dfrac{N(x)}{${dFactorise(d)}}`), t(" :")]),
    resultat(l, double ? [f(`${lim(r)} f(x)=${infini(sg)}`)] : [f(`${lim(cote(r, "gauche"))} f(x)=${infini(sg)}`), t(" et "), f(`${lim(cote(r, "droite"))} f(x)=${infini(sd)}`), t(".")]),
    piege(l, double ? [t("Racine double : le carré ne change pas de signe, les limites à gauche et à droite sont les mêmes.")] : [t("Racine simple : le facteur change de signe en "), f(`x=${r}`), t(", il faut étudier les deux côtés.")]),
  ];
}

// ============================================================================
// Asymptotes verticales (lecture).
// ============================================================================

function etapeAV(e: ExerciceEtudeCompletePipeline, d: Donnees, l: string): EtapeCorrection[] {
  const lignes: LigneCalcul[] = e.exclusions.map((x) => {
    if (x.type === "pointVide") return ligne(`${lim(x.position)} f(x)=${formatReponseAttenduePhaseLatex(e, "pointVideLimite")[0]}`, `limite finie : pas d'asymptote en x = ${nbT(x.position)} (point retiré)`);
    if (x.type === "vaDouble") return ligne(`${lim(x.position)} f(x)=${infini(x.signeGauche as number)}`, `limite infinie : la droite x = ${nbT(x.position)} est asymptote verticale`);
    return ligne(`${lim(cote(x.position, "gauche"))} f(x)=${infini(x.signeGauche as number)}`, `limite infinie : la droite x = ${nbT(x.position)} est asymptote verticale`);
  });
  const avs = d.vraies.map((x) => `x=${x.position}`);
  return [
    utilise(l, [t("La droite "), f("x=r"), t(" est asymptote verticale quand f(x) tend vers ±∞ (d'un côté au moins) quand x tend vers r ; une limite finie (point vide) n'en donne pas "), t(COURS_ETUDE), t(".")]),
    calcul(l, lignes),
    resultat(l, [t("AV : "), ...avs.flatMap((a, i) => [...(i ? [t(" et ")] : []), f(a)]), t(".")]),
  ];
}

// ============================================================================
// À l'infini.
// ============================================================================

/** k·x^n pour n ≥ 0, k/x^{−n} pour n < 0. */
function monomeRapport(k: number, n: number): string {
  if (n >= 0) return monomeLatex(k, n, true);
  const den = n === -1 ? "x" : `x^{${-n}}`;
  return `${k < 0 ? "-" : ""}\\dfrac{${Math.abs(k)}}{${den}}`;
}

/** Argument d'une limite : entre parenthèses s'il commence par « − ». */
function arg(expr: string): string {
  return expr.startsWith("-") ? `\\left(${expr}\\right)` : expr;
}

function signeInfini(k: number, n: number, plus: boolean): number {
  return Math.sign(k) * (plus || n % 2 === 0 ? 1 : -1);
}

function etapeInfini(d: Donnees, l: string): EtapeCorrection[] {
  const dN = degre(d.N);
  const dD = degre(d.D);
  const k = d.N[dN];
  const n = dN - dD;
  const L = lim("\\pm\\infty");
  const domN = monomeLatex(k, dN, true);
  const domD = monomeLatex(d.D[dD], dD, true);
  const lignes: LigneCalcul[] = [ligne(`${L} f(x)=${L}\\dfrac{${domN}}{${domD}}`, "termes de plus haut degré de N et de D")];
  const res: FragmentConsigne[] = [];
  if (n === 0) {
    lignes.push(ligne(`=${fracBrute(k, d.D[dD])}`, [t("on simplifie par "), f(dD === 1 ? "x" : `x^{${dD}}`)]));
    lignes.push(ligne(`=${fracL(k, d.D[dD])}`));
    res.push(f(`${L} f(x)=${fracL(k, d.D[dD])}`));
  } else if (n < 0) {
    lignes.push(ligne(`=${L} ${arg(monomeRapport(k, n))}`, "on simplifie"));
    lignes.push(ligne("=0", [t("limite de référence "), f("\\frac{k}{x^n}\\to 0")]));
    res.push(f(`${L} f(x)=0`));
  } else {
    lignes.push(ligne(`=${L} ${arg(monomeRapport(k, n))}`, "on simplifie"));
    for (const plus of [false, true]) {
      const s = signeInfini(k, n, plus);
      lignes.push(ligne(`${lim(plus ? "+\\infty" : "-\\infty")} f(x)=${infini(s)}`, n % 2 === 0 ? [t("comme "), f(monomeRapport(k, n)), t(" : puissance paire")] : [t("comme "), f(monomeRapport(k, n)), t(plus ? "" : " : puissance impaire, signe changé en −∞")]));
    }
    res.push(f(`${lim("-\\infty")} f(x)=${infini(signeInfini(k, n, false))}`), t(" et "), f(`${lim("+\\infty")} f(x)=${infini(signeInfini(k, n, true))}`), t("."));
  }
  return [
    utilise(l, [t("En "), f("\\pm\\infty"), t(", une fonction rationnelle a la même limite que le quotient des termes de plus haut degré de son numérateur et de son dénominateur "), t(COURS_LIMITES), t(".")]),
    calcul(l, lignes),
    resultat(l, res),
  ];
}

function etapeCoefDirecteur(d: Donnees, l: string): EtapeCorrection[] {
  const dN = degre(d.N);
  const dD = degre(d.D);
  const k = d.N[dN];
  const n = dN - dD - 1;
  const L = lim("\\pm\\infty");
  const domN = monomeLatex(k, dN, true);
  const lignes: LigneCalcul[] = [
    ligne(`\\dfrac{f(x)}{x}=\\dfrac{N(x)}{x\\cdot D(x)}`, "on divise f(x) par x"),
    ligne(`${L}\\dfrac{f(x)}{x}=${L}\\dfrac{${domN}}{x^{${dD + 1}}}`, [t("termes de plus haut degré : "), f(domN), t(" et "), f(`x\\cdot x^{${dD}}`)]),
  ];
  let res: FragmentConsigne[];
  if (n === 0) {
    lignes.push(ligne(`=${k}`, [t("on simplifie par "), f(`x^{${dD + 1}}`)]));
    res = [f(`a=${k}`), t(" : fini et non nul, une asymptote oblique est possible.")];
  } else {
    lignes.push(ligne(`=${L} ${arg(monomeRapport(k, n))}`, "on simplifie"));
    for (const plus of [false, true]) lignes.push(ligne(`${lim(plus ? "+\\infty" : "-\\infty")}\\dfrac{f(x)}{x}=${infini(signeInfini(k, n, plus))}`, [t("comme "), f(monomeRapport(k, n))]));
    res = [t("La limite de "), f("\\frac{f(x)}{x}"), t(" est infinie : pas d'asymptote oblique.")];
  }
  return [
    utilise(l, [t("Coefficient directeur d'une éventuelle asymptote oblique : "), f(`a=${L}\\dfrac{f(x)}{x}`), t(" ; elle existe si a est fini et non nul "), t(COURS_OBLIQUE), t(".")]),
    calcul(l, lignes),
    resultat(l, res),
  ];
}

function etapeCoefB(e: ExerciceEtudeCompletePipeline, d: Donnees, l: string): EtapeCorrection[] {
  if (e.infini.type !== "oblique") return [];
  const a = e.infini.pente;
  const b = e.infini.ordonnee;
  const ax = monomeLatex(a, 1, true);
  const moinsAx = a > 0 ? `-${a === 1 ? "" : a}x` : `+${a === -1 ? "" : -a}x`;
  const axD = mulP([0, a], d.D1);
  const num = subP(d.N1, axD);
  const L = lim("\\pm\\infty");
  const dn = degre(num);
  const dd = degre(d.D1);
  const tn = monomeLatex(num[dn], dn, true);
  const td = monomeLatex(d.D1[dd], dd, true);
  const lignes: LigneCalcul[] = [
    ligne(`${ax}\\cdot ${d.nomD}(x)=${polyLatex(axD)}`, "on développe"),
    ligne(`${d.nomN}(x)${moinsAx}\\cdot ${d.nomD}(x)=${polyLatex(num)}`, "on soustrait terme à terme"),
    ligne(`b=${L}\\left[f(x)${moinsAx}\\right]`, "définition"),
    ligne(`=${L}\\dfrac{${polyLatex(num)}}{${polyLatex(d.D1)}}`, "même dénominateur"),
  ];
  if (dn === dd) {
    lignes.push(ligne(`=${L}\\dfrac{${tn}}{${td}}`, "termes de plus haut degré"));
    lignes.push(ligne(`=${b}`, [t("on simplifie par "), f(dd === 1 ? "x" : `x^{${dd}}`)]));
  } else lignes.push(ligne(`=${b}`, "numérateur de degré inférieur : le quotient tend vers 0"));
  const intro: FragmentConsigne[] = d.pv ? introForme(d).map((x) => (x.type === "latex" && x.valeur.startsWith("D_1(x)=") ? f(`D_1(x)=${polyLatex(d.D1)}`) : x)) : [t("Avec "), f(`N(x)=${polyLatex(d.N)}`), t(" et "), f(`D(x)=${polyLatex(d.D)}`), t(" :")];
  return [
    utilise(l, [t("Ordonnée à l'origine de l'asymptote : "), f(`b=${L}\\left[f(x)-ax\\right]`), t(" avec "), f(`a=${a}`), t(" ; on réduit au même dénominateur, puis on compare les termes de plus haut degré "), t(COURS_OBLIQUE), t(".")]),
    calcul(l, lignes, intro),
    resultat(l, [f(`b=${b}`)]),
    piege(l, [t("b n'est pas l'ordonnée à l'origine de f : c'est la limite de "), f("f(x)-ax"), t(".")]),
  ];
}

function etapeAsymptoteInfini(e: ExerciceEtudeCompletePipeline, d: Donnees, l: string): EtapeCorrection[] {
  const inf = e.infini;
  const L = lim("\\pm\\infty");
  let lignes: LigneCalcul[];
  let res: FragmentConsigne[];
  if (inf.type === "horizontale") {
    lignes = [ligne(`${L} f(x)=${inf.limite}`, "limite finie en −∞ et en +∞ (étape des limites à l'infini)")];
    res = [f(`\\text{AH : }y=${inf.limite}`), t(", en −∞ et en +∞.")];
  } else if (inf.type === "oblique") {
    lignes = [ligne("y=ax+b", "asymptote oblique"), ligne(`=${formatPenteOrdonnee(inf.pente, inf.ordonnee)}`, [t("on remplace "), f(`a=${inf.pente}`), t(" et "), f(`b=${inf.ordonnee}`)])];
    res = [f(`\\text{AO : }y=${formatPenteOrdonnee(inf.pente, inf.ordonnee)}`), t(", en −∞ et en +∞.")];
  } else {
    lignes = [
      ligne(`${lim("+\\infty")} f(x)=${infini(inf.signePlusInfini)}`, "limite infinie : pas d'asymptote horizontale"),
      ligne(`${lim("+\\infty")}\\dfrac{f(x)}{x}=${infini(inf.signeCoefDirecteurPlus)}`, "a infini : pas d'asymptote oblique"),
    ];
    res = [t("Ni asymptote horizontale ni asymptote oblique.")];
  }
  void d;
  return [
    utilise(l, [t("Limite finie L en ±∞ : asymptote horizontale "), f("y=L"), t(" ; limite infinie mais a fini et non nul : asymptote oblique "), f("y=ax+b"), t(" ; sinon aucune "), t(COURS_ETUDE), t(".")]),
    calcul(l, lignes),
    resultat(l, res),
  ];
}

function etapeCasSpecial(e: ExerciceEtudeCompletePipeline, d: Donnees, l: string): EtapeCorrection[] {
  const cs = e.casSpecial;
  if (!cs || e.infini.type === "aucune") return [];
  const asym: Poly = e.infini.type === "horizontale" ? [e.infini.limite] : [e.infini.ordonnee, e.infini.pente];
  const expr = polyLatex(asym);
  const exprF = polyFacteur(asym);
  const reste = subP(d.N1, mulP(asym, d.D1));
  const kR = reste[1] ?? 0;
  const lignes: LigneCalcul[] = [
    ligne(`f(x)=${expr}`, "la courbe rencontre son asymptote"),
    ligne(`${d.nomN}(x)=${exprF}\\cdot ${d.nomD}(x)`, [t("on multiplie par "), f(`${d.nomD}(x)\\neq 0`)]),
    ligne(`${d.nomN}(x)-${exprF}\\cdot ${d.nomD}(x)=0`, "on regroupe dans le premier membre"),
    ligne(`${polyLatex(reste)}=0`, "on développe et on réduit"),
    ligne(`x=${cs.x}`, kR === 1 ? "on isole x" : `on isole x : on divise par ${nbT(kR)}`),
  ];
  if (e.infini.type === "oblique") lignes.push(ligne(`y=${e.infini.pente === 1 ? "" : e.infini.pente === -1 ? "-" : `${e.infini.pente}\\cdot `}${par(cs.x)}${e.infini.ordonnee === 0 ? "" : e.infini.ordonnee > 0 ? `+${e.infini.ordonnee}` : e.infini.ordonnee}`, "point de l'asymptote d'abscisse x"), ligne(`=${cs.y}`));
  else lignes.push(ligne(`y=${cs.y}`, "ordonnée sur l'asymptote horizontale"));
  const vN = evalP(d.N1, cs.x);
  const vD = evalP(d.D1, cs.x);
  return [
    utilise(l, [t("La courbe recoupe son asymptote là où "), f(`f(x)=${expr}`), t(" : on multiplie par le dénominateur, on réduit, et il reste le reste de la division euclidienne égal à 0 "), t(COURS_ETUDE), t(".")]),
    calcul(l, lignes, d.pv ? introForme(d).map((x) => (x.type === "latex" && x.valeur.startsWith("D_1(x)=") ? f(`D_1(x)=${polyLatex(d.D1)}`) : x)) : [t("Avec "), f(`N(x)=${polyLatex(d.N)}`), t(" et "), f(`D(x)=${polyLatex(d.D)}`), t(" :")]),
    resultat(l, [t("La courbe recoupe son asymptote au point "), f(formatReponseAttenduePhaseLatex(e, "casSpecial")[0]), t(".")]),
    verification(l, [t("On recalcule "), f(`f(${cs.x})`), t(" :")], [ligne(`f(${cs.x})=${fracBrute(vN, vD)}`, `on remplace x par ${nbT(cs.x)} dans la forme ${d.pv ? "simplifiée" : "de départ"}`), ligne(`=${fracL(vN, vD)}`)]),
  ];
}

// ============================================================================
// Assemblage.
// ============================================================================

function correctionEtude(e: ExerciceEtudeCompletePipeline): EtapeCorrection[] {
  const d = donnees(e);
  const ordre = ordreComplet(e);
  const lettre = (p: PhaseEtudeComplete) => LETTRES[ordre.indexOf(p)];
  const etapes: EtapeCorrection[] = [];
  for (const phase of ordre) {
    const l = lettre(phase);
    if (phase === "domaine") etapes.push(...etapeDomaine(d, l));
    else if (phase === "typeLimite") etapes.push(...etapeTypeLimite(e, d, l));
    else if (phase === "pointVideSimplification") etapes.push(...etapesPointVide(e, d, l, lettre("pointVideLimite")));
    else if (phase === "limitesGD1") etapes.push(...etapeLimitesGD(d, e.exclusions[0], l));
    else if (phase === "limitesGD2") etapes.push(...etapeLimitesGD(d, e.exclusions[1], l));
    else if (phase === "av") etapes.push(...etapeAV(e, d, l));
    else if (phase === "infini") etapes.push(...etapeInfini(d, l));
    else if (phase === "coefDirecteur") etapes.push(...etapeCoefDirecteur(d, l));
    else if (phase === "coefB") etapes.push(...etapeCoefB(e, d, l));
    else if (phase === "asymptoteInfini") etapes.push(...etapeAsymptoteInfini(e, d, l));
    else if (phase === "casSpecial") etapes.push(...etapeCasSpecial(e, d, l));
  }
  // Graphe de l'étude sous le résultat de la dernière étape.
  const derniere = lettre(ordre[ordre.length - 1]);
  const i = etapes.map((x) => x.type === "resultat" && x.sousQuestion === derniere).lastIndexOf(true);
  if (i >= 0) etapes[i] = { ...etapes[i], figureHtml: construireSvgEtudeComplete(e) };
  const rang = (x: EtapeCorrection) => LETTRES.indexOf(x.sousQuestion ?? "a");
  return finaliser(
    etapes
      .map((x, j) => ({ x, j }))
      .sort((u, v) => rang(u.x) - rang(v.x) || u.j - v.j)
      .map(({ x }) => x),
  );
}

// ============================================================================
// Variante bonus — construction inverse.
// ============================================================================

function facteurDen(r: number): string {
  return facteurNu(r);
}

export function exempleConstructionInverseLatex(e: ExerciceEtudeCompleteBonus): string {
  const { racineDenominateur: r, asymptote } = e.proprietes;
  const partie = asymptote.type === "horizontale" ? `${asymptote.limite}` : formatPenteOrdonnee(asymptote.pente, asymptote.ordonnee);
  return `f(x)=${partie}+\\dfrac{1}{${facteurDen(r)}}`;
}

function correctionBonus(e: ExerciceEtudeCompleteBonus): EtapeCorrection[] {
  const { racineDenominateur: r, asymptote } = e.proprietes;
  const asym: Poly = asymptote.type === "horizontale" ? [asymptote.limite] : [asymptote.ordonnee, asymptote.pente];
  const partie = polyLatex(asym);
  const den = facteurDen(r);
  const numerateur = subP(mulP(asym, [-r, 1]), [-1]);
  const L = lim("\\pm\\infty");
  return finaliser([
    utilise("a", [t("On part de l'asymptote demandée et on lui ajoute un terme qui tend vers 0 en ±∞ et dont le dénominateur s'annule en "), f(`x=${r}`), t(" : "), f(`\\dfrac{1}{${den}}`), t(` ${COURS_ETUDE}.`)]),
    calcul("a", [
      ligne(`f(x)=${partie}+\\dfrac{1}{${den}}`, "asymptote + un terme qui tend vers 0"),
      ligne(`=\\dfrac{${polyFacteur(asym)}${r === 0 ? "\\cdot x" : `(${den})`}+1}{${den}}`, "même dénominateur"),
      ligne(`=\\dfrac{${polyLatex(numerateur)}}{${den}}`, "on développe"),
    ]),
    resultat("a", [t("Par exemple "), f(exempleConstructionInverseLatex(e)), t(" (toute autre fonction rationnelle qui vérifie les deux propriétés est acceptée).")]),
    verification("a", [t("Les deux propriétés :")], [
      ligne(`f(x)-${polyFacteur(asym)}=\\dfrac{1}{${den}}`, "écart entre f et la droite"),
      ligne(`${L}\\dfrac{1}{${den}}=0`, asymptote.type === "horizontale" ? "asymptote horizontale demandée" : "asymptote oblique demandée"),
      ligne(`${lim(cote(r, "droite"))}\\dfrac{1}{${den}}=+\\infty`, `le dénominateur s'annule en ${nbT(r)} et pas le numérateur : asymptote verticale`),
    ]),
    piege("a", [t("Un terme ajouté qui ne tend pas vers 0 en ±∞ (par exemple x divisé par un polynôme de même degré) déplace l'asymptote.")]),
  ]);
}

export function correctionDetailleeEtudeComplete(e: ExerciceEtudeComplete): EtapeCorrection[] {
  return e.mode === "constructionInverse" ? correctionBonus(e) : correctionEtude(e);
}
