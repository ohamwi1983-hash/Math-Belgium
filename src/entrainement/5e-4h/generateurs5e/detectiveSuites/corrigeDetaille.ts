import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege as lignePiege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { DonneesDetectiveSuites, ExerciceDetectiveSuites } from "../../core5e/detectiveSuites.types";
import type { FractionQ } from "../../core5e/suitesGeometriques.types";
import {
  affineNLatex,
  anneeDemandee,
  calculArithmetique,
  calculGeometrique,
  calculPourcentage,
  calculSommeInfinie,
  degre,
  descriptionCorrecte,
  fractionLatex,
  indiceLigneFausse,
  nombreLatex,
  par,
  polynomeLatex,
  pourcentLatex,
  puissanceLatex,
  puissanceN,
  raisonPourcentage,
  rapportDominants,
  troisTermes,
  u2Geometrique,
  valeurLatex,
} from "../../moteur5e/modeleDetectiveSuites";
import { diviserFractionQ, fractionQ, multiplierFractionQ, puissanceFractionQ, soustraireFractionQ } from "../../moteur5e/fractionQ";
import { descriptionFragments, piege, reponseFragments, souderPonctuation } from "../../ui5e/formatDetectiveSuites";
import { COURS_ARITHMETIQUES, COURS_CONVERGENCE, COURS_GEOMETRIQUES, COURS_PROBLEMES, sansRepetition } from "../../ui5e/corrigeSuites2";

/**
 * Corrigé détaillé « comme au tableau » de `5gen49` (détective d'erreurs : suites) — règle
 * `.claude/rules/feuilles-evaluations.md`, sur le modèle de 6gen84. Étapes : a) la ligne fausse
 * (contrôle écrit en calcul : la formule de la copie testée pour n = 1, le compte des rangs, la
 * raison remultipliée…), b) le nom de l'erreur (la règle du cours face à ce qu'a écrit l'élève),
 * c) la résolution reprise à partir de la ligne fausse, une opération par ligne, avec les valeurs
 * du modèle (`modeleDetectiveSuites.ts`, mêmes fonctions que la copie et l'écran).
 */

const t = texte;
const f = latex;
type E = ExerciceDetectiveSuites;
const q = (num: number, den = 1) => fractionQ(num, den);

/** Fraction entre parenthèses si elle est négative ou fractionnaire (facteur, terme soustrait). */
function parF(x: FractionQ): string {
  if (x.den === 1) return par(nombreLatex(x.num));
  return `\\left(${fractionLatex(x)}\\right)`;
}

/** Valeur exacte lisible, entre parenthèses si négative. */
function parV(x: FractionQ): string {
  return par(valeurLatex(x));
}

function renvoi(e: DonneesDetectiveSuites): string {
  switch (e.variante) {
    case "arithmetique":
      return COURS_ARITHMETIQUES;
    case "geometrique":
      return COURS_GEOMETRIQUES;
    case "pourcentage":
      return COURS_PROBLEMES;
    case "convergence":
      return COURS_CONVERGENCE;
  }
}

/** Chaque terme c·nᵖ divisé par nᵏ : « 3n », « 3 », « \frac{3}{n^{2}} » (même écriture que la copie). */
function diviseLatex(coefs: number[], k: number): string {
  const d = degre(coefs);
  let s = "";
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const p = d - i - k;
    const abs = Math.abs(c);
    let corps: string;
    if (p === 0) corps = nombreLatex(abs);
    else if (p > 0) corps = `${abs === 1 ? "" : nombreLatex(abs)}${p === 1 ? "n" : `n^{${p}}`}`;
    else corps = `\\frac{${nombreLatex(abs)}}{${p === -1 ? "n" : `n^{${-p}}`}}`;
    if (s === "") s = `${c < 0 ? "-" : ""}${corps}`;
    else s += ` ${c < 0 ? "-" : "+"} ${corps}`;
  });
  return s;
}

// ============================================================================
// a) Contrôle de la ligne fausse.
// ============================================================================

function lignesControle(e: E): LigneCalcul[] {
  switch (descriptionCorrecte(e)) {
    case "rangFormule": {
      if (e.variante !== "arithmetique") return [];
      const c = calculArithmetique(e, true);
      return [
        ligne(`${nombreLatex(c.a)}\\times 1${c.b < 0 ? "-" : "+"}${nombreLatex(Math.abs(c.b))}=${nombreLatex(c.a + c.b)}`, "formule de la copie pour n = 1"),
        ligne(`${nombreLatex(c.a + c.b)}\\neq ${nombreLatex(e.u1)}`, [t("ce n'est pas "), f(`u_1=${nombreLatex(e.u1)}`)]),
      ];
    }
    case "nombreTermes": {
      if (e.variante !== "arithmetique" && e.variante !== "geometrique") return [];
      return [ligne(`${e.m}-${e.p}+1=${e.m - e.p + 1}`, [t("nombre de rangs de "), f(`${e.p}`), t(" à "), f(`${e.m}`)]), ligne(`${e.m - e.p + 1}\\neq ${e.m - e.p}`, "nombre de termes de la copie")];
    }
    case "rangAnnee": {
      if (e.variante !== "pourcentage") return [];
      const Y = anneeDemandee(e);
      return [ligne(`${Y}-${e.annee1}+1=${e.rang}`, `l'année ${e.annee1} a le rang 1`), ligne(`${e.rang}\\neq ${e.rang - 1}`, "rang de la copie")];
    }
    case "exposant": {
      if (e.variante === "geometrique") {
        const u1q = multiplierFractionQ(q(e.u1), e.q);
        return [ligne(`u_1\\times q^{1}=${nombreLatex(e.u1)}\\times ${parF(e.q)}`, "formule de la copie pour n = 1"), ligne(`=${fractionLatex(u1q)}`), ligne(`${fractionLatex(u1q)}\\neq ${nombreLatex(e.u1)}`, [t("ce n'est pas "), f("u_1")])];
      }
      if (e.variante === "pourcentage") {
        const qv = raisonPourcentage(e);
        return [ligne(`u_1\\times q^{1}=${nombreLatex(e.u1)}\\times ${nombreLatex(qv, 4)}`, "formule de la copie pour n = 1"), ligne(`=${nombreLatex(e.u1 * qv, 4)}`), ligne(`${nombreLatex(e.u1 * qv, 4)}\\neq ${nombreLatex(e.u1)}`, [t("ce n'est pas "), f("u_1")])];
      }
      return [];
    }
    case "sommeInfinie": {
      if (e.variante !== "convergence" || e.support !== "sommeInfinie") return [];
      return [ligne(`|q|=${fractionLatex(q(Math.abs(e.q.num), e.q.den))}\\geq 1`, "la condition porte sur la valeur absolue de q")];
    }
    case "taux": {
      if (e.variante !== "pourcentage") return [];
      const fausse = calculPourcentage(e, true).q;
      return [ligne(`1${e.t > 0 ? "+" : "-"}\\dfrac{${pourcentLatex(e)}}{100}=${nombreLatex(raisonPourcentage(e), 4)}`, `coefficient multiplicateur d'une ${e.t > 0 ? "hausse" : "baisse"}`), ligne(`${nombreLatex(raisonPourcentage(e), 4)}\\neq ${nombreLatex(fausse, 4)}`, "raison de la copie")];
    }
    case "puissance": {
      if (e.variante !== "convergence" || e.support !== "limite") return [];
      const dp = degre(e.P);
      const dq = degre(e.Q);
      return [
        ligne(`\\dfrac{${diviseLatex(e.P, dp)}}{${diviseLatex(e.Q, dq)}}=u_n\\times\\dfrac{${puissanceN(dq)}}{${puissanceN(dp)}}`, "numérateur et dénominateur divisés par des puissances différentes"),
        ligne(`\\dfrac{${puissanceN(dq)}}{${puissanceN(dp)}}\\neq 1`, "la fraction de la copie n'est donc pas égale à uₙ"),
      ];
    }
    case "raisonInversee": {
      if (!(e.variante === "geometrique" || (e.variante === "convergence" && e.support === "sommeInfinie"))) return [];
      const [ua, ub] = e.variante === "geometrique" ? [e.u1, u2Geometrique(e)] : troisTermes(e);
      const inv = q(e.q.den, e.q.num);
      const prod = multiplierFractionQ(q(ua!), inv);
      return [ligne(`${nombreLatex(ua!)}\\times ${parF(inv)}=${fractionLatex(prod)}`, [f("u_1"), t(" multiplié par la raison de la copie")]), ligne(`${fractionLatex(prod)}\\neq ${nombreLatex(ub!)}`, [t("ce n'est pas "), f("u_2")])];
    }
    default:
      return [];
  }
}

// ============================================================================
// b) La règle du cours face à ce qu'a écrit l'élève.
// ============================================================================

function lignesErreur(e: E): LigneCalcul[] {
  switch (descriptionCorrecte(e)) {
    case "rangFormule":
      return [ligne("u_1+n\\times r\\neq u_1+(n-1)\\times r", "la copie ajoute la raison une fois de trop")];
    case "nombreTermes":
      return e.variante === "arithmetique" || e.variante === "geometrique" ? [ligne(`${e.m}-${e.p}\\neq ${e.m}-${e.p}+1`, "la copie compte les écarts entre les rangs, pas les termes")] : [];
    case "rangAnnee":
      return e.variante === "pourcentage" ? [ligne(`${anneeDemandee(e)}-${e.annee1}\\neq ${anneeDemandee(e)}-${e.annee1}+1`, "la copie oublie l'année de rang 1")] : [];
    case "exposant": {
      const k = e.variante === "geometrique" ? e.p : e.variante === "pourcentage" ? e.rang : 1;
      return [ligne(`u_1\\times q^{${k}}\\neq u_1\\times q^{${k - 1}}`, "l'exposant est le rang moins 1")];
    }
    case "sommeInfinie":
      if (e.variante !== "convergence" || e.support !== "sommeInfinie") return [];
      return [ligne(`q=${fractionLatex(e.q)}<1`, "vrai, mais ne suffit pas"), ligne(`|q|=${fractionLatex(q(Math.abs(e.q.num), e.q.den))}\\geq 1`, "la condition du cours n'est pas remplie")];
    case "taux":
      return e.variante === "pourcentage" ? [ligne(`\\dfrac{${pourcentLatex(e)}}{100}\\neq 1${e.t > 0 ? "+" : "-"}\\dfrac{${pourcentLatex(e)}}{100}`, "la copie ne garde que la variation")] : [];
    case "puissance":
      return e.variante === "convergence" && e.support === "limite" ? [ligne(`${puissanceN(degre(e.P))}\\neq ${puissanceN(degre(e.Q))}`, "deux diviseurs différents : la fraction change de valeur")] : [];
    case "raisonInversee":
      return [ligne("\\dfrac{u_1}{u_2}\\neq\\dfrac{u_2}{u_1}", "la copie prend le quotient à l'envers")];
    default:
      return [];
  }
}

// ============================================================================
// c) Résolution reprise à partir de la ligne fausse.
// ============================================================================

function lignesCorrection(e: E): LigneCalcul[] {
  const i = indiceLigneFausse(e);
  const lignes: LigneCalcul[] = [];
  const depuis = (k: number, ls: LigneCalcul[]) => {
    if (k >= i) lignes.push(...ls);
  };
  switch (e.variante) {
    case "arithmetique": {
      const c = calculArithmetique(e, false);
      const b = c.b === 0 ? "" : `${c.b < 0 ? "-" : "+"}${nombreLatex(Math.abs(c.b))}`;
      depuis(0, [
        ligne("u_n=u_1+(n-1)\\times r", "la raison est ajoutée n − 1 fois"),
        ligne(`=${nombreLatex(e.u1)}+(n-1)\\times ${par(nombreLatex(e.r))}`, [t("avec "), f(`u_1=${nombreLatex(e.u1)}`), t(" et "), f(`r=${nombreLatex(e.r)}`)]),
        ligne(`=${affineNLatex(c.a, c.b)}`, "on distribue et on regroupe"),
      ]);
      depuis(1, [
        ligne(`u_{${e.p}}=${nombreLatex(c.a)}\\times ${e.p}${b}`, `on remplace n par ${e.p}`),
        ligne(`=${nombreLatex(c.up)}`),
        ligne(`u_{${e.m}}=${nombreLatex(c.a)}\\times ${e.m}${b}`, `on remplace n par ${e.m}`),
        ligne(`=${nombreLatex(c.um)}`),
      ]);
      depuis(2, [ligne(`N=${e.m}-${e.p}+1`, [t("de "), f(`u_{${e.p}}`), t(" à "), f(`u_{${e.m}}`)]), ligne(`=${c.N}`)]);
      const moyenne = fractionQ(c.up + c.um, 2);
      depuis(3, [
        ligne(`S=N\\times\\dfrac{u_{${e.p}}+u_{${e.m}}}{2}`, "N fois la moyenne des termes extrêmes"),
        ligne(`=${c.N}\\times\\dfrac{${nombreLatex(c.up)}+${par(nombreLatex(c.um))}}{2}`),
        ligne(`=${c.N}\\times ${parV(moyenne)}`, "on calcule la moyenne"),
        ligne(`=${valeurLatex(c.S)}`),
      ]);
      break;
    }
    case "geometrique": {
      const c = calculGeometrique(e, false);
      const u1 = nombreLatex(e.u1);
      const qp = puissanceFractionQ(c.q, c.exposant);
      depuis(0, [ligne("q=\\dfrac{u_2}{u_1}", "le terme suivant divisé par le précédent"), ligne(`=\\dfrac{${nombreLatex(u2Geometrique(e))}}{${u1}}`), ligne(`=${fractionLatex(c.q)}`)]);
      depuis(1, [
        ligne(`u_{${e.p}}=u_1\\times q^{${c.exposant}}`, "l'exposant est le rang moins 1"),
        ligne(`=${u1}\\times ${puissanceLatex(c.q, c.exposant)}`),
        ligne(`=${u1}\\times ${parF(qp)}`, "on calcule la puissance"),
        ligne(`=${valeurLatex(c.up)}`),
      ]);
      depuis(2, [ligne(`N=${e.m}-${e.p}+1`, [t("de "), f(`u_{${e.p}}`), t(" à "), f(`u_{${e.m}}`)]), ligne(`=${c.N}`)]);
      const unMoinsQN = soustraireFractionQ(q(1), puissanceFractionQ(c.q, c.N));
      const unMoinsQ = soustraireFractionQ(q(1), c.q);
      const rapport = diviserFractionQ(unMoinsQN, unMoinsQ);
      depuis(3, [
        ligne(`S=u_{${e.p}}\\times\\dfrac{1-q^{${c.N}}}{1-q}`, "devant la fraction, le premier terme de la somme"),
        ligne(`=${parV(c.up)}\\times\\dfrac{1-${puissanceLatex(c.q, c.N)}}{1-${parF(c.q)}}`),
        ligne(`=${parV(c.up)}\\times\\dfrac{${fractionLatex(unMoinsQN)}}{${fractionLatex(unMoinsQ)}}`, "on calcule la puissance et les différences"),
        ligne(`=${parV(c.up)}\\times ${parF(rapport)}`, "on divise"),
        ligne(`=${valeurLatex(c.S)}`),
      ]);
      break;
    }
    case "pourcentage": {
      const c = calculPourcentage(e, false);
      const Y = anneeDemandee(e);
      const s = e.t > 0 ? "+" : "-";
      depuis(0, [ligne(`q=1${s}\\dfrac{${pourcentLatex(e)}}{100}`, `${e.t > 0 ? "hausse" : "baisse"} de ${pourcentLatex(e).replace("{,}", ",")} % : on multiplie par ce coefficient`), ligne(`=1${s}${nombreLatex(Math.abs(e.t) / 100, 4)}`), ligne(`=${nombreLatex(c.q, 4)}`)]);
      depuis(1, [ligne(`n=${Y}-${e.annee1}+1`, `l'année ${e.annee1} a le rang 1`), ligne(`=${c.rang}`)]);
      const p = c.q ** c.exposant;
      const court = Math.abs(p * 1e4 - Math.round(p * 1e4)) < 1e-6;
      depuis(2, [
        ligne(`u_{${c.rang}}=u_1\\times q^{${c.exposant}}`, "l'exposant est le rang moins 1"),
        ligne(`=${nombreLatex(e.u1)}\\times ${nombreLatex(c.q, 4)}^{${c.exposant}}`),
        ...(e.mode === "exact" && court ? [ligne(`=${nombreLatex(e.u1)}\\times ${nombreLatex(p, 4)}`, "on calcule la puissance")] : []),
        ligne(e.mode === "calcul" ? `\\approx ${nombreLatex(Math.round(c.valeur), 0)}` : `=${nombreLatex(c.valeur, 4)}`, e.mode === "calcul" ? "à la calculatrice, arrondi à l'unité" : undefined),
      ]);
      break;
    }
    case "convergence": {
      if (e.support === "sommeInfinie") {
        const c = calculSommeInfinie(e, false);
        const [u1, u2] = troisTermes(e).map((v) => nombreLatex(v));
        depuis(0, [ligne("q=\\dfrac{u_2}{u_1}", "le terme suivant divisé par le précédent"), ligne(`=\\dfrac{${u2}}{${u1}}`), ligne(`=${fractionLatex(c.q)}`)]);
        const abs = q(Math.abs(c.q.num), c.q.den);
        depuis(1, [ligne(`|q|=${fractionLatex(abs)}${c.existe ? "<" : "\\geq "}1`, c.existe ? "la somme infinie existe" : "la somme infinie n'existe pas")]);
        if (c.existe && c.S) {
          const unMoinsQ = soustraireFractionQ(q(1), c.q);
          depuis(2, [
            ligne("S_\\infty=\\dfrac{u_1}{1-q}", "formule de la somme infinie"),
            ligne(`=\\dfrac{${u1}}{1-${parF(c.q)}}`),
            ligne(`=\\dfrac{${u1}}{${fractionLatex(unMoinsQ)}}`, "on calcule le dénominateur"),
            ligne(`=${valeurLatex(c.S)}`, "diviser par une fraction, c'est multiplier par son inverse"),
          ]);
        }
        break;
      }
      const dp = degre(e.P);
      const dq = degre(e.Q);
      depuis(1, [
        ligne(`u_n=\\dfrac{${polynomeLatex(e.P)}}{${polynomeLatex(e.Q)}}`, "énoncé"),
        ligne(`=\\dfrac{${diviseLatex(e.P, dq)}}{${diviseLatex(e.Q, dq)}}`, [t("numérateur ET dénominateur divisés par "), f(puissanceN(dq))]),
      ]);
      const r = rapportDominants(e);
      const lim = "\\lim\\limits_{n\\to+\\infty} u_n";
      if (dp < dq) depuis(2, [ligne(`${lim}=\\dfrac{0}{${nombreLatex(e.Q[0]!)}}`, [t("chaque terme du numérateur tend vers 0, le dénominateur vers "), f(nombreLatex(e.Q[0]!))]), ligne("=0")]);
      else depuis(2, [ligne(`${lim}=${r.num > 0 ? "+" : "-"}\\infty`, [t("le numérateur tend vers "), f(`${r.num > 0 ? "+" : "-"}\\infty`), t(", le dénominateur vers "), f(nombreLatex(e.Q[0]!))])]);
      break;
    }
  }
  return sansRepetition(lignes);
}

export function correctionDetailleeDetectiveSuites(e: E): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const cours = renvoi(e);
  const reponse = souderPonctuation(reponseFragments(e));
  return [
    utilise("a", [t("On refait chaque ligne de la copie à partir de la précédente (en testant une formule pour n = 1, en recomptant les rangs, en remultipliant par la raison) : la ligne fausse est la première qui n'en découle pas ; les suivantes n'en sont que les conséquences.")]),
    calcul("a", lignesControle(e), [t(`Contrôle de la ligne ${i + 1} :`)]),
    resultat("a", [t(`La ligne ${i + 1} est fausse.`)]),
    utilise("b", [t(`On nomme la règle du cours qui n'a pas été respectée à cette ligne ${cours}.`)]),
    calcul("b", lignesErreur(e), [t("Ce qu'a écrit l'élève, face à la règle :")]),
    resultat("b", descriptionFragments(descriptionCorrecte(e), e)),
    lignePiege("b", piege(e)),
    utilise("c", [t(`On reprend la résolution à partir de la ligne ${i + 1}, avec la règle correcte ; les lignes suivantes sont recalculées ${cours}.`)]),
    calcul("c", lignesCorrection(e)),
    resultat("c", reponse),
  ];
}
