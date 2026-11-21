import katex from "katex";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExercicePositionAsymptote } from "../../core5e/asymptoteOblique.types";
import { cotesAttendus, ORDRE_POSITION, pointRecoupementAttendu, type PhasePositionAsymptote } from "../../moteur5e/sessionPositionAsymptote";
import { COURS_OBLIQUE, finaliser, fracL, mulP, par, polyFacteur, polyLatex, subP, t, f } from "../../ui5e/corrigeLimites";
import { dLatex, droiteLatex, ecartLatex, pLatex, phraseCotes, phraseVerdict, pointLatex, qPoly, rLatex } from "../../ui5e/formatPositionAsymptote";
import { normaliserLimites } from "../../../../lib/notationLog";

/**
 * Corrigé « comme au tableau » de la famille « position de la courbe par rapport à son asymptote »
 * (5gen21, lots B–D). Une lettre par écran (`ORDRE_POSITION`) :
 * a) f(x) − (ax + b) réduit au même dénominateur (produit développé, soustraction terme à terme) ;
 * b) signe : Δ de D(x) < 0 donc D(x) > 0, signe de R(x), tableau de signes en figure, verdict ;
 * c) point commun : R(x) = 0 (aucune solution, ou x₀ puis y₀ sur d, vérification f(x₀) = y₀) ;
 * d) côté d'approche : signe de R(x) pour x très grand, puis très négatif.
 * Les réponses viennent des MÊMES fonctions que l'écran (`formatPositionAsymptote.ts`).
 */

export function lettrePhasePosition(phase: PhasePositionAsymptote): string {
  return "abcd"[ORDRE_POSITION.indexOf(phase)] ?? "a";
}

const CELLULE = "border:1px solid #555;padding:4px 10px;text-align:center;";
const k = (s: string) => katex.renderToString(normaliserLimites(s), { throwOnError: false });
const sg = (v: number) => (v > 0 ? "+" : "−");

/** Tableau de signes de R(x), D(x) et de l'écart, avec la ligne « position » (figure du corrigé). */
export function tableauSignesPositionHtml(e: ExercicePositionAsymptote): string {
  const p = pointRecoupementAttendu(e);
  const valeurs = p ? ["-\\infty", `${p.x}`, "+\\infty"] : ["-\\infty", "+\\infty"];
  const tete = [`<th style="${CELLULE}">${k("x")}</th>`];
  valeurs.forEach((v, i) => {
    tete.push(`<th style="${CELLULE}">${k(v)}</th>`);
    if (i < valeurs.length - 1) tete.push(`<th style="${CELLULE}"></th>`);
  });
  // Cellules : [intervalle, (valeur en x₀, intervalle)…] entre les bornes infinies.
  const ligneT = (label: string, cellules: string[]) => `<tr><td style="${CELLULE}">${label}</td><td style="${CELLULE}"></td>${cellules.map((c) => `<td style="${CELLULE}">${c}</td>`).join("")}<td style="${CELLULE}"></td></tr>`;
  const c = cotesAttendus(e);
  const pos = (cote: string) => (cote === "dessus" ? "au-dessus" : "en dessous");
  const cellR = p ? [sg(-e.r), "0", sg(e.r)] : [sg(e.s)];
  const cellD = p ? ["+", "", "+"] : ["+"];
  const cellE = cellR;
  const cellPos = p ? [pos(c.moinsInfini), "point commun", pos(c.plusInfini)] : [pos(c.plusInfini)];
  return (
    `<table style="border-collapse:collapse;margin:6px auto;">` +
    `<tr>${tete.join("")}</tr>` +
    ligneT(k(`R(x)=${rLatex(e)}`), cellR) +
    ligneT(k(`D(x)=${dLatex(e)}`), cellD) +
    ligneT(k(ecartLatex(e)), cellE) +
    ligneT("courbe / d", cellPos) +
    `</table>`
  );
}

function valeurPoly(c: number[], x: number): number {
  return c.reduce((acc, v, i) => acc + v * x ** i, 0);
}

function etapes(e: ExercicePositionAsymptote): EtapeCorrection[] {
  const Q = qPoly(e);
  const QD = mulP(Q, e.coeffsD);
  const ec = ecartLatex(e);
  const qTxt = polyLatex(Q);
  const qFois = e.a === 0 ? `${par(e.b)}\\cdot D(x)` : `${polyFacteur(Q)}\\cdot D(x)`;
  const nomDroite = e.a === 0 ? `${e.b}` : "(ax+b)";
  const fracR = `\\dfrac{${rLatex(e)}}{${dLatex(e)}}`;
  const [p0, p1] = [e.coeffsD[0], e.coeffsD[1]];
  const delta = p1 * p1 - 4 * p0;
  const pt = pointRecoupementAttendu(e);

  // a) écart réduit.
  const lignesA: LigneCalcul[] = [
    ligne(`P(x)=${pLatex(e)}`, "numérateur de f"),
    ligne(`D(x)=${dLatex(e)}`, "dénominateur de f"),
    ligne(`${ec}=\\dfrac{P(x)-${qFois}}{D(x)}`, [t("même dénominateur "), f("D(x)")]),
    ligne(`${qFois}=${polyLatex(QD)}`, "on développe"),
    ligne(`P(x)-${qFois}=${polyLatex(subP(e.coeffsP, QD))}`, "on soustrait terme à terme"),
  ];
  const a: EtapeCorrection[] = [
    utilise("a", [t("Pour comparer la courbe de f à la droite "), f(`d\\ :\\ ${droiteLatex(e)}`), t(", on étudie l'écart "), f(ec), t(" ; on le réduit au même dénominateur "), f("D(x)"), t(` ${COURS_OBLIQUE}.`)]),
    calcul("a", lignesA),
    resultat("a", [f(`${ec}=${fracR}`)]),
    piege("a", [t("Le signe − porte sur tout le produit "), f(e.a === 0 ? `${par(e.b)}\\cdot D(x)` : `${nomDroite}\\cdot D(x)`), t(" : on change le signe de chacun de ses termes.")]),
  ];

  // b) signe et verdict.
  const lignesB: LigneCalcul[] = [
    ligne(`\\Delta=${p1 < 0 ? `(${p1})` : p1}^2-4\\cdot 1\\cdot ${p0}=${delta}`, "discriminant de D(x)"),
    ligne(`${delta}<0`, [t("pas de racine : "), f("D(x)"), t(" garde le signe de son coefficient dominant 1")]),
    ligne("D(x)>0", "pour tout réel x"),
  ];
  if (pt) {
    lignesB.push(ligne(`${rLatex(e)}=0\\iff x=${fracL(-e.s, e.r)}`, "le numérateur s'annule"));
    lignesB.push(ligne(`${rLatex(e)}${e.r > 0 ? ">" : "<"}0\\iff x>${pt.x}`, e.r > 0 ? "coefficient de x positif" : "coefficient de x négatif : le sens change"));
  } else {
    lignesB.push(ligne(`R(x)=${e.s}${e.s > 0 ? ">" : "<"}0`, "constante"));
    lignesB.push(ligne(`${ec}=${fracR}${e.s > 0 ? ">" : "<"}0`, "quotient de deux nombres " + (e.s > 0 ? "positifs" : "de signes contraires")));
  }
  const b: EtapeCorrection[] = [
    utilise("b", [t("Le signe de "), f(ec), t(" donne la position : positif, la courbe est au-dessus de d ; négatif, en dessous ; nul, point commun. Signe d'un quotient : celui du numérateur et celui du dénominateur "), t(COURS_OBLIQUE), t(".")]),
    calcul("b", lignesB),
    { ...resultat("b", [...phraseVerdict(e), t(" Tableau de signes :")]), figureHtml: tableauSignesPositionHtml(e) },
    piege("b", [t("Une asymptote horizontale ou oblique peut être recoupée : seule l'étude du signe le dit.")]),
  ];

  // c) point commun.
  const lignesC: LigneCalcul[] = pt
    ? [
        ligne(`f(x)=${qTxt}\\iff ${rLatex(e)}=0`, [f("D(x)\\neq 0"), t(" : seul le numérateur peut s'annuler")]),
        ligne(`x_0=${pt.x}`, "solution"),
        ...(e.a === 0
          ? [ligne(`y_0=${e.b}`, "d est horizontale")]
          : [
              ligne(`y_0=${e.a === 1 ? "" : e.a === -1 ? "-" : `${e.a}\\cdot `}${par(pt.x)}${e.b === 0 ? "" : e.b > 0 ? `+${e.b}` : `${e.b}`}`, "ordonnée lue sur d"),
              ligne(`=${pt.y}`),
            ]),
      ]
    : [ligne(`R(x)=${e.s}`, [t("seul le numérateur peut s'annuler ("), f("D(x)\\neq 0"), t(")")]), ligne(`${e.s}\\neq 0`, "constante non nulle : aucune solution")];
  const c: EtapeCorrection[] = [
    utilise("c", [t("Un point commun à la courbe et à d vérifie "), f(`f(x)=${qTxt}`), t(", donc "), f(`${ec}=0`), t(" : le numérateur s'annule.")]),
    calcul("c", lignesC),
    resultat("c", pt ? [t("La courbe recoupe d au point "), f(pointLatex(e) as string), t(".")] : [t("La courbe et d n'ont aucun point commun.")]),
  ];
  if (pt) {
    const num = valeurPoly(e.coeffsP, pt.x);
    const den = valeurPoly(e.coeffsD, pt.x);
    c.push(
      verification("c", [t("On calcule "), f(`f(${pt.x})`), t(" :")], den === 1 ? [ligne(`f(${pt.x})=${num}`, "on remplace x : même ordonnée que d")] : [ligne(`f(${pt.x})=\\dfrac{${num}}{${den}}`, "on remplace x"), ligne(`=${fracL(num, den)}`, "même ordonnée que d")]),
    );
  }

  // d) côtés.
  const lignesD: LigneCalcul[] =
    e.r === 0
      ? [ligne(`R(x)=${e.s}${e.s > 0 ? ">" : "<"}0`, "pour tout x, donc aussi pour |x| très grand")]
      : [
          ligne(`\\lim\\limits_{x\\to+\\infty}(${rLatex(e)})=${e.r > 0 ? "+" : "-"}\\infty`, `donc R(x) ${e.r > 0 ? ">" : "<"} 0 pour x très grand`),
          ligne(`\\lim\\limits_{x\\to-\\infty}(${rLatex(e)})=${e.r > 0 ? "-" : "+"}\\infty`, `donc R(x) ${e.r > 0 ? "<" : ">"} 0 pour x très négatif`),
        ];
  const d: EtapeCorrection[] = [
    utilise("d", [t("Pour x très grand en valeur absolue, la courbe est du côté de d donné par le signe de "), f(ec), t(", c'est-à-dire celui de "), f("R(x)"), t(" (car "), f("D(x)>0"), t(").")]),
    calcul("d", lignesD),
    resultat("d", phraseCotes(e)),
  ];
  return [...a, ...b, ...c, ...d];
}

export function correctionDetailleePosition(e: ExercicePositionAsymptote): EtapeCorrection[] {
  return finaliser(etapes(e));
}

/** Réponse brève (page « Je vérifie ») : écart réduit, verdict, point éventuel. */
export function reponseBrevePositionTexte(e: ExercicePositionAsymptote): string {
  return `${ecartLatex(e)}=\\dfrac{${rLatex(e)}}{${dLatex(e)}}`;
}
