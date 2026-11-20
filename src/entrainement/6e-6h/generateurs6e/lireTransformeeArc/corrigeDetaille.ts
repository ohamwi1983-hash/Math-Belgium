import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLireTransformee } from "../../core6e/lireTransformeeArc";
import { kV } from "../../core6e/lireTransformeeArc";
import type { PhaseLireTransformee } from "../../ui6e/formatLireTransformeeArc";
import { alpha, beta, expressionL, figure, imageQ, nQ, parX, phases, reponse, x1 } from "../../ui6e/formatLireTransformeeArc";
import { piL, q, qL } from "../../ui6e/nombresCycloLotG";

/**
 * Corrigé détaillé « comme au tableau » de `6gen158` (lire une transformée c + k·arc(mx + n)),
 * partagé par l'appli et le papier — une lettre par écran, dans l'ordre des écrans (`phases`) :
 * domaine et image LUS (une ligne par chose lue), puis m, n et k, c calculés ; figure annotée en
 * `figureHtml` sous le résultat de l'image.
 */

type E = ExerciceLireTransformee;
const t = texte;
const f = latex;
const COURS = "(cours, § 2 et § 5)";
const ent = (x: number) => (x < 0 ? `-${-x}` : String(x));

function etapeDomaine(e: E, sq: string): EtapeCorrection[] {
  if (e.variante === "arctan")
    return [
      utilise(sq, [t("arctan est définie sur "), f("\\mathbb{R}"), t(" " + COURS + " : la courbe se prolonge des deux côtés.")]),
      calcul(sq, [ligne("\\mathrm{dom}\\,f=\\mathbb{R}", "aucun bord, aucun point exclu")]),
      resultat(sq, reponse(e, "domaine")),
    ];
  return [
    utilise(sq, [t(`${e.variante} n'est définie que sur `), f("[-1\\,;\\,1]"), t(" " + COURS + " : la courbe est un arc limité par deux points pleins.")]),
    calcul(sq, [ligne(`x_{\\min}=${ent(alpha(e))}`, "point plein à gauche"), ligne(`x_{\\max}=${ent(beta(e))}`, "point plein à droite")]),
    resultat(sq, reponse(e, "domaine")),
  ];
}

function etapeImage(e: E, sq: string): EtapeCorrection[] {
  const [lo, hi] = imageQ(e);
  const lignes: LigneCalcul[] =
    e.variante === "arctan"
      ? [ligne(`y=${piL(lo)}`, "asymptote horizontale du bas"), ligne(`y=${piL(hi)}`, "asymptote horizontale du haut")]
      : [ligne(`y_{\\min}=${piL(lo)}`, "point le plus bas de l'arc"), ligne(`y_{\\max}=${piL(hi)}`, "point le plus haut de l'arc")];
  return [
    utilise(sq, [t("L'image est l'intervalle des ordonnées atteintes ; lignes horizontales tous les "), f("\\dfrac{\\pi}{4}"), t(e.variante === "arctan" ? " ; les asymptotes ne sont jamais atteintes (crochets ouverts)." : ".")]),
    calcul(sq, lignes),
    { ...resultat(sq, reponse(e, "image")), figureHtml: figure(e, "corrige") },
  ];
}

function etapeMN(e: E, sq: string): EtapeCorrection[] {
  const m = qL(e.m);
  const n = qL(nQ(e));
  if (e.variante === "arctan") {
    const x = x1(e);
    const y1 = q(e.cPi.n * 4 * e.k.d + e.k.n * e.cPi.d, 4 * e.cPi.d * e.k.d);
    return [
      utilise(sq, [f("\\arctan 0=0"), t(" et "), f("\\arctan 1=\\dfrac{\\pi}{4}"), t(" " + COURS + " : au centre de symétrie "), f("mx+n=0"), t(" ; au point marqué à sa droite, "), f("\\arctan(mx+n)=\\dfrac{f(x)-c}{k}"), t(".")]),
      calcul(sq, [
        ligne(`m\\cdot ${parX(e.x0)}+n=0`, [t("centre "), f(`(${ent(e.x0)}\\,;\\,${piL(e.cPi)})`)]),
        ligne(`\\dfrac{${piL(y1)}-\\left(${piL(e.cPi)}\\right)}{${qL(e.k)}}=\\dfrac{\\pi}{4}`, [t("point marqué en "), f(`x=${ent(x)}`)]),
        ligne(`m\\cdot ${parX(x)}+n=1`, [f("\\arctan 1=\\dfrac{\\pi}{4}")]),
        ligne(`m\\cdot ${parX(x - e.x0)}=1`, "on soustrait les deux équations"),
        ligne(`m=${m}`),
        ligne(`n=-m\\cdot ${parX(e.x0)}`, "équation du centre"),
        ligne(`=${n}`),
      ]),
      resultat(sq, reponse(e, "mn")),
      piege(sq, [t("Prendre pour m l'écart entre le centre et le point marqué : c'est "), f("\\dfrac{1}{m}"), t(".")]),
    ];
  }
  const a = alpha(e);
  const b = beta(e);
  return [
    utilise(sq, [f(`\\${e.variante}(u)`), t(" existe pour "), f("-1\\leq u\\leq 1"), t(" ; avec "), f("u=mx+n"), t(" et "), f("m>0"), t(", u vaut −1 à la borne gauche du domaine et 1 à la borne droite.")]),
    calcul(sq, [
      ligne(`m\\cdot ${parX(a)}+n=-1`, "borne gauche"),
      ligne(`m\\cdot ${parX(b)}+n=1`, "borne droite"),
      ligne(`${b - a}\\,m=2`, "on soustrait les deux équations"),
      ligne(`m=${m}`),
      ligne(`n=1-m\\cdot ${parX(b)}`, "borne droite"),
      ligne(`=${n}`),
    ]),
    resultat(sq, reponse(e, "mn")),
    verification(sq, [t("Au centre du domaine, "), f(`m\\cdot ${parX(e.x0)}+n=0`), t(" : "), f(`\\${e.variante}(0)=${e.variante === "arcsin" ? "0" : "\\dfrac{\\pi}{2}"}`), t(".")]),
    piege(sq, [t("Écrire "), f("m=\\dfrac{\\beta-\\alpha}{2}"), t(" : c'est l'inverse.")]),
  ];
}

function etapeKC(e: E, sq: string): EtapeCorrection[] {
  const [lo, hi] = imageQ(e);
  const croissante = (kV(e) > 0) !== (e.variante === "arccos");
  const sens = croissante ? "croissante" : "décroissante";
  const absK = qL(q(Math.abs(e.k.n), e.k.d));
  const longueur = q(lo.d * hi.n - hi.d * lo.n, lo.d * hi.d);
  if (e.variante === "arccos") {
    return [
      utilise(sq, [f("\\arccos 1=0"), t(" et "), f("\\arccos(-1)=\\pi"), t(" " + COURS + " : à la borne droite ("), f("mx+n=1"), t("), "), f("f=c"), t(" ; à la borne gauche, "), f("f=c+k\\pi"), t(".")]),
      calcul(sq, [
        ligne(`c=f(${ent(beta(e))})`, "borne droite"),
        ligne(`=${piL(e.cPi)}`, "lu sur le graphique"),
        ligne(`f(${ent(alpha(e))})=c+k\\pi`, "borne gauche"),
        ligne(`k=\\dfrac{${piL(kV(e) > 0 ? hi : lo)}-\\left(${piL(e.cPi)}\\right)}{\\pi}`),
        ligne(`=${qL(e.k)}`),
      ]),
      resultat(sq, reponse(e, "kc")),
      verification(sq, [t(`f est ${sens} : `), f(kV(e) > 0 ? "k>0" : "k<0"), t(" avec arccos décroissante donne bien ce sens.")]),
      piege(sq, [t("Prendre pour c le milieu de l'image (comme pour arcsin) : pour arccos, c est la valeur à la borne droite.")]),
    ];
  }
  return [
    utilise(sq, [
      t(`${e.variante} prend ses valeurs dans un intervalle de longueur `),
      f("\\pi"),
      t(" centré en 0 " + COURS + " : l'image de f a la longueur "),
      f("|k|\\cdot\\pi"),
      t(" et pour milieu "),
      f("c"),
      t(" ; "),
      f("m>0"),
      t(", donc le signe de k est celui du sens de variation."),
    ]),
    calcul(sq, [
      ligne(`|k|\\cdot\\pi=${piL(hi)}-\\left(${piL(lo)}\\right)`, e.variante === "arctan" ? "écart des asymptotes" : "longueur de l'image"),
      ligne(`=${piL(longueur)}`),
      ligne(`|k|=${absK}`),
      ligne(`k=${qL(e.k)}`, `f est ${sens}`),
      ligne(`c=\\dfrac{1}{2}\\left(${piL(lo)}${hi.n < 0 ? "" : "+"}${piL(hi)}\\right)`, "milieu de l'image"),
      ligne(`=${piL(e.cPi)}`),
    ]),
    resultat(sq, reponse(e, "kc")),
    verification(sq, [t("Au centre, "), f(`f(${ent(e.x0)})=c`), t(" : le point marqué central a bien pour ordonnée "), f(piL(e.cPi)), t(" ; "), f(`f(x)=${expressionL(e)}`), t(".")]),
    piege(sq, [t("Oublier le signe de k quand f est décroissante.")]),
  ];
}

export function correctionDetailleeLireTransformee(e: E): EtapeCorrection[] {
  const r: EtapeCorrection[] = [];
  phases(e).forEach((p: PhaseLireTransformee, i) => {
    const sq = "abcd"[i];
    if (p === "domaine") r.push(...etapeDomaine(e, sq));
    if (p === "image") r.push(...etapeImage(e, sq));
    if (p === "mn") r.push(...etapeMN(e, sq));
    if (p === "kc") r.push(...etapeKC(e, sq));
  });
  return r;
}

