import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLireCourbeExpo } from "../../core6e/lireCourbeExponentielle";
import { estCroissanteBase, fZero } from "../../core6e/lireCourbeExponentielle";
import { parL, ratL } from "../../ui6e/nombresExpoLotG";
import { baseL, ecartsBase, expressionL, figure, puissanceL, rapportEcarts, reponse, yPoint } from "../../ui6e/formatLireCourbeExponentielle";
import type { PhaseLireCourbeExpo } from "../../ui6e/formatLireCourbeExponentielle";

/**
 * Corrigé détaillé « comme au tableau » de `6gen148` (lire une courbe k·aˣ + c), partagé par l'appli
 * et le papier — une lettre par écran (a asymptote, b k, c a, d expression). Conventions « Lectures
 * graphiques » : chaque chose lue est une ligne AVEC une relation (`y = c`, `f(0) = 3`, `f(1) = 7`),
 * la justification dit où on lit. Figure annotée (points et coordonnées) sous l'étape b.
 */

type E = ExerciceLireCourbeExpo;
const t = texte;
const f = latex;
const n = (v: number) => (v < 0 ? `-${-v}` : String(v));
const rep = (e: E, p: PhaseLireCourbeExpo): FragmentConsigne[] => reponse(e, p);

function etapeAsymptote(e: E): EtapeCorrection[] {
  const sq = "a";
  const cote = estCroissanteBase(e.base) ? "-\\infty" : "+\\infty";
  return [
    utilise(sq, [t("Du côté où "), f("a^{x}"), t(" tend vers 0, "), f("k\\cdot a^{x}+c"), t(" tend vers "), f("c"), t(" : la droite "), f("y=c"), t(" est une asymptote horizontale (cours, § 6).")]),
    calcul(sq, [
      ligne(`\\lim\\limits_{x\\to ${cote}} ${puissanceL(e.base)}=0`, estCroissanteBase(e.base) ? "la base est supérieure à 1" : "la base est comprise entre 0 et 1"),
      ligne(`y=${n(e.c)}`, "droite en pointillés, lue sur l'axe vertical : la courbe s'en approche sans l'atteindre"),
    ]),
    resultat(sq, rep(e, "asymptote")),
    piege(sq, [t("Confondre l'asymptote avec l'ordonnée à l'origine "), f("f(0)"), t(", ou écrire l'équation d'une droite verticale.")]),
  ];
}

function etapeK(e: E): EtapeCorrection[] {
  const sq = "b";
  const f0 = fZero(e);
  const appel: EtapeCorrection = calcul(sq, [
    ligne(`f(0)=k\\cdot a^{0}+c=k+c`, [t("car "), f("a^{0}=1")]),
    ligne(`f(0)=${n(f0)}`, `lu au point ${e.lettreZero} (0 ; ${f0 < 0 ? "−" + -f0 : f0}), sur l'axe des ordonnées`),
    ligne(`k=f(0)-c`),
    ligne(`=${n(f0)}-${parL(n(e.c))}`, "c lu en a)"),
    ligne(`=${n(e.k)}`),
  ]);
  return [
    utilise(sq, [t("En "), f("x=0"), t(", "), f("a^{0}=1"), t(" : l'ordonnée à l'origine vaut "), f("k+c"), t(" (cours, § 1).")]),
    { ...appel, figureHtml: `<div style="max-width:7cm;margin:0 auto">${figure(e, "corrige")}</div>` },
    resultat(sq, rep(e, "k")),
    verification(sq, [t(`La courbe est ${e.k > 0 ? "au-dessus" : "en dessous"} de son asymptote : `), f(e.k > 0 ? "k>0" : "k<0"), t(".")]),
    piege(sq, [t("Prendre "), f("k=f(0)"), t(" en oubliant de retirer "), f("c"), t(".")]),
  ];
}

function etapeA(e: E): EtapeCorrection[] {
  const sq = "c";
  const { xHaut, xBas } = ecartsBase(e);
  const r = rapportEcarts(e);
  const yA = yPoint(e, e.xAutre);
  const lignes: LigneCalcul[] = [
    ligne(`f(${n(e.xAutre)})=${n(yA)}`, `lu au point ${e.lettreAutre} (${e.xAutre < 0 ? "−1" : "1"} ; ${yA < 0 ? "−" + -yA : yA})`),
    ligne(`a=\\dfrac{f(${n(xHaut)})-c}{f(${n(xBas)})-c}`, "rapport des écarts à l'asymptote, une unité d'écart"),
    ligne(`=\\dfrac{${n(yPoint(e, xHaut))}-${parL(n(e.c))}}{${n(yPoint(e, xBas))}-${parL(n(e.c))}}`),
    ligne(`=\\dfrac{${n(r.haut)}}{${n(r.bas)}}`),
  ];
  const reduite = ratL(e.base);
  if (r.bas !== 1 || r.haut < 0) lignes.push(ligne(`=${reduite}`));
  return [
    utilise(sq, [t("L'écart à l'asymptote "), f("f(x)-c=k\\cdot a^{x}"), t(" est multiplié par "), f("a"), t(" quand "), f("x"), t(" augmente de 1 : le rapport ne dépend que de l'écart (cours, § 7).")]),
    calcul(sq, lignes),
    resultat(sq, rep(e, "a")),
    verification(sq, [
      f(estCroissanteBase(e.base) ? "a>1" : "0<a<1"),
      t(" et "),
      f(e.k > 0 ? "k>0" : "k<0"),
      t(` : f est ${estCroissanteBase(e.base) === e.k > 0 ? "croissante" : "décroissante"}, comme la courbe.`),
    ]),
    piege(sq, [t("Faire le rapport des ordonnées sans retirer "), f("c"), t(", ou leur différence.")]),
  ];
}

function etapeExpression(e: E): EtapeCorrection[] {
  const sq = "d";
  const xv = e.xAutre;
  const yv = yPoint(e, xv);
  const coef = e.k === 1 ? "" : e.k === -1 ? "-" : `${e.k}\\cdot `;
  const reste = e.c === 0 ? "" : e.c > 0 ? `+${e.c}` : `-${-e.c}`;
  return [
    utilise(sq, [t("On remplace "), f("k"), t(", "), f("a"), t(" et "), f("c"), t(" dans "), f("f(x)=k\\cdot a^{x}+c"), t(".")]),
    calcul(sq, [ligne(`f(x)=k\\cdot a^{x}+c`), ligne(`=${expressionL(e)}`, [f(`k=${n(e.k)}`), t(", "), f(`a=${baseL(e.base)}`), t(", "), f(`c=${n(e.c)}`)])]),
    resultat(sq, rep(e, "expression")),
    verification(sq, [t(`L'expression redonne le point ${e.lettreAutre} :`)], [ligne(`f(${n(xv)})=${coef}${puissanceL(e.base, n(xv))}${reste}=${n(yv)}`)]),
    piege(sq, [t("Écrire "), f("(k\\cdot a)^{x}"), t(" au lieu de "), f("k\\cdot a^{x}"), t(".")]),
  ];
}

export function correctionDetailleeLireCourbeExpo(e: E): EtapeCorrection[] {
  return [...etapeAsymptote(e), ...etapeK(e), ...etapeA(e), ...etapeExpression(e)];
}
