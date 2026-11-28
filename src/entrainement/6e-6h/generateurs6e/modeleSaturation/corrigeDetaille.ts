import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceModeleSaturation } from "../../core6e/modeleSaturation";
import { modele } from "../../core6e/modeleSaturation";
import { nbL, rat, ratL } from "../../ui6e/nombresExpoLotG";
import { modeleL, nomF, qL, rL, reponse, uniteTemps } from "../../ui6e/formatModeleSaturation";

/**
 * Corrigé détaillé « comme au tableau » de `6gen150` (modèle L + C·qᵗ), partagé par l'appli et le
 * papier — une lettre par écran : a rapport des écarts, b L et C, c q, d prévision, e seuil. Calculs
 * EXACTS jusqu'à la dernière ligne (r en fraction, q = r^{1/d}, q^t = r^{t/d}) : les valeurs
 * approchées viennent des valeurs non arrondies.
 */

type E = ExerciceModeleSaturation;
const t = texte;
const f = latex;
const n = (v: number) => (v < 0 ? `-${-v}` : String(v));
const par = (v: number) => (v < 0 ? `(${v})` : String(v));
const COURS = "(cours, point 7)";
const puissR = (e: E, exp: string) => `\\left(${rL(e)}\\right)^{${exp}}`;

function etapeRapport(e: E): EtapeCorrection[] {
  const sq = "a";
  const N = nomF(e);
  const [m0, m1, m2] = e.mesures;
  const d1 = m1 - m0;
  const d2 = m2 - m1;
  const lignes = [
    ligne(`${N}(${e.d})-${N}(0)=${m1}-${m0}=${n(d1)}`, "premier écart"),
    ligne(`${N}(${2 * e.d})-${N}(${e.d})=${m2}-${m1}=${n(d2)}`, "second écart"),
    ligne(`r=\\dfrac{${n(d2)}}{${n(d1)}}`),
  ];
  const brut = rat(d2, d1);
  if (!(d1 === e.r.den && d2 === e.r.num)) lignes.push(ligne(`=${ratL(brut)}`, "on simplifie"));
  return [
    utilise(sq, [t("Dans la différence de deux mesures, "), f("L"), t(" disparaît : "), f(`${N}(t+d)-${N}(t)=C\\,q^{t}\\,(q^{d}-1)`), t(". Deux écarts successifs sont donc dans le rapport "), f("q^{d}"), t(` ${COURS}.`)]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "rapport")),
    verification(sq, [t("Rapport compris entre 0 et 1 : les écarts rétrécissent, la grandeur se stabilise.")]),
    piege(sq, [t("Faire le rapport des mesures elles-mêmes (réflexe du modèle "), f("Q_0\\cdot r^{t}"), t(", qui n'a pas de valeur limite).")]),
  ];
}

function etapeLimite(e: E): EtapeCorrection[] {
  const sq = "b";
  const N = nomF(e);
  const [m0, m1] = e.mesures;
  return [
    utilise(sq, [t("L'écart à la valeur limite est multiplié par "), f("r"), t(" sur chaque intervalle de "), f(`${e.d}`), t(` ${uniteTemps(e)} ; `), f("C"), t(" est l'écart initial.")]),
    calcul(sq, [
      ligne(`${N}(${e.d})-L=r\\,\\big(${N}(0)-L\\big)`, "l'écart à L est multiplié par r"),
      ligne(`(1-r)\\,L=${N}(${e.d})-r\\cdot ${N}(0)`, "on développe et on regroupe les termes en L"),
      ligne(`L=\\dfrac{${m1}-${rL(e)}\\cdot ${par(m0)}}{1-${rL(e)}}`),
      ligne(`=\\dfrac{${e.r.den}\\cdot ${m1}-${e.r.num}\\cdot ${par(m0)}}{${e.r.den}-${e.r.num}}`, `on multiplie le numérateur et le dénominateur par ${e.r.den}`),
      ...(e.r.den - e.r.num === 1 ? [] : [ligne(`=\\dfrac{${e.r.den * m1 - e.r.num * m0}}{${e.r.den - e.r.num}}`)]),
      ligne(`=${e.L}`),
      ligne(`C=${N}(0)-L=${m0}-${par(e.L)}=${n(e.C)}`, "écart initial"),
    ]),
    resultat(sq, reponse(e, "limite")),
    verification(sq, [t("Le modèle redonne la deuxième mesure :")], [ligne(`L+C\\cdot r=${e.L}${e.C < 0 ? "-" : "+"}${Math.abs(e.C)}\\cdot ${rL(e)}=${m1}`)]),
    piege(sq, [t("Prendre la dernière mesure pour la valeur limite, ou "), f(`C=${N}(0)`), t(".")]),
  ];
}

function etapeQ(e: E): EtapeCorrection[] {
  const sq = "c";
  return [
    utilise(sq, [t("Sur "), f(`${e.d}`), t(` ${uniteTemps(e)}, l'écart est multiplié par `), f(`q^{${e.d}}`), t(" : "), f(`q^{${e.d}}=r`), t(", donc "), f("q"), t(" est la racine "), f(`${e.d}`), t("ᵉ de "), f("r"), t(".")]),
    calcul(sq, [ligne(`q^{${e.d}}=${rL(e)}`), ligne(`q=${puissR(e, `\\frac{1}{${e.d}}`)}`, "racine de r (touche de la calculatrice)"), ligne(`\\approx ${qL(e)}`)]),
    resultat(sq, reponse(e, "q")),
    verification(sq, [t("Le modèle complet : "), f(modeleL(e)), t(".")]),
    piege(sq, [t("Prendre "), f("q=r"), t(" : "), f("r"), t(" porte sur "), f(`${e.d}`), t(" unités de temps, pas sur une.")]),
  ];
}

function etapePrevision(e: E): EtapeCorrection[] {
  const sq = "d";
  const N = nomF(e);
  return [
    utilise(sq, [t("On remplace "), f("t"), t(` par ${e.tPrev} dans le modèle complet, avec q non arrondi : `), f(`q^{t}=r^{\\frac{t}{${e.d}}}`), t(".")]),
    calcul(sq, [
      ligne(`${N}(${e.tPrev})=${e.L}${e.C < 0 ? "-" : "+"}${Math.abs(e.C)}\\cdot q^{${e.tPrev}}`, "le modèle"),
      ligne(`=${e.L}${e.C < 0 ? "-" : "+"}${Math.abs(e.C)}\\cdot ${puissR(e, `\\frac{${e.tPrev}}{${e.d}}`)}`, [f(`q^{${e.d}}=r`)]),
      ligne(`\\approx ${nbL(e.prevision, 1, true)}`),
    ]),
    resultat(sq, reponse(e, "prevision")),
    verification(sq, [t(`La prévision est entre la valeur limite et la mesure initiale${e.tPrev < 2 * e.d ? ", et entre les deux mesures qui l'encadrent" : ""}.`)]),
    piege(sq, [t("Oublier "), f("L"), t(" (calculer seulement "), f("C\\cdot q^{t}"), t(") ou utiliser "), f("r"), t(" au lieu de "), f("q"), t(".")]),
  ];
}

function etapeSeuil(e: E): EtapeCorrection[] {
  const sq = "e";
  const N = nomF(e);
  const u = rat(e.seuil - e.L, e.C);
  const uL = ratL(u, "\\frac");
  const qExact = puissR(e, `\\frac{1}{${e.d}}`);
  return [
    utilise(sq, [t("On isole le terme exponentiel, puis on utilise la touche ln de la calculatrice "), t(COURS), t(" : "), f("q^{t}=A\\iff t=\\dfrac{\\ln A}{\\ln q}"), t(".")]),
    calcul(sq, [
      ligne(`${e.L}${e.C < 0 ? "-" : "+"}${Math.abs(e.C)}\\cdot q^{t}=${e.seuil}`, [f(`${N}(t)=${e.seuil}`)]),
      ligne(`${n(e.C)}\\cdot q^{t}=${e.seuil - e.L}`, [t("on retire "), f(`L=${e.L}`)]),
      ligne(`q^{t}=${uL}`, [t("on divise par "), f(`C=${n(e.C)}`)]),
      ligne(`t=\\dfrac{\\ln\\left(${uL}\\right)}{\\ln q}`, "touche ln"),
      ligne(`=\\dfrac{\\ln\\left(${uL}\\right)}{\\ln\\left(${qExact}\\right)}`, "q non arrondi"),
      ligne(`\\approx ${nbL(e.tSeuil, 1, true)}`),
    ]),
    resultat(sq, reponse(e, "seuil")),
    verification(sq, [t("Le modèle donne bien le seuil à cet instant :")], [ligne(`${N}(${nbL(e.tSeuil, 1, true)})\\approx ${nbL(modele(e, Math.round(e.tSeuil * 10) / 10), 1, true)}`, "à un dixième près")]),
    piege(sq, [t("Diviser "), f("S"), t(" par "), f("C"), t(" sans retirer "), f("L"), t(", ou utiliser "), f("r"), t(" à la place de "), f("q"), t(".")]),
  ];
}

export function correctionDetailleeModeleSaturation(e: E): EtapeCorrection[] {
  return [...etapeRapport(e), ...etapeLimite(e), ...etapeQ(e), ...etapePrevision(e), ...etapeSeuil(e)];
}
