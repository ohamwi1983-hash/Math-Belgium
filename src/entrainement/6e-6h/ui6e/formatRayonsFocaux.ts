import type { Exercice136, Phase136 } from "../core6e/rayonsFocaux";
import { aire136, conique136, cosMax136, cosTheta, P136, phases136, rayonF136, rayonFp136 } from "../core6e/rayonsFocaux";
import { exL } from "../core6e/coniquesLotH1";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { ILLISIBLE, l, nb, t } from "./outilsLieuxLotH1";
import { COULEURS } from "./outilsLieuxLotH2";
import { figureConique } from "./figureConiquesLotH1";
import { apercuLibre } from "../moteur6e/saisieConiquesLotH1";

/**
 * Couche C — textes de `6gen136` « Rayons focaux et triangle focal » : énoncés, options (ordre FIXE),
 * aides à deux niveaux (propriété du cours, puis posée pour l'instance — jamais la réponse), réponses,
 * figures (ellipse, foyers ; le point P pour `rayons` ; le sommet B pour `aire`, jamais un point P
 * qui dirait s'il existe).
 */

type E = Exercice136;
type Ph = Phase136;

export const ellipseL = (e: E) => `\\dfrac{x^2}{${e.a * e.a}}+\\dfrac{y^2}{${e.b * e.b}}=1`;
export const pointPL = (e: E) => `P\\left(${nb(e.xP!)}\\,;${exL(e.yP!)}\\right)`;

export function situation136(e: E): Frag[] {
  if (e.variante === "rayons") return [t("Dans un repère orthonormé, on donne l'ellipse "), l(ellipseL(e)), t(", ses foyers "), l(`F(${e.c}\\,;0)`), t(" et "), l(`F'(-${e.c}\\,;0)`), t(", et son point "), l(pointPL(e)), t(".")];
  return [t("Dans un repère orthonormé, on donne l'ellipse "), l(ellipseL(e)), t(" et ses foyers "), l(`F(${e.c}\\,;0)`), t(" et "), l(`F'(-${e.c}\\,;0)`), t(". On cherche un point P de l'ellipse tel que l'angle "), l("\\widehat{FPF'}"), t(` mesure ${e.theta}°.`)];
}

export function consigneGlobale136(e: E): Frag[] {
  if (e.variante === "rayons") return [t("Calcule l'excentricité de l'ellipse, puis les rayons focaux |PF| et |PF′| du point P, sans calculer de racine carrée."), ];
  return [t("Un tel point P existe-t-il ? Justifie en comparant avec l'angle "), l("\\widehat{FBF'}"), t(", où B(0 ; b) est un sommet du petit axe. S'il existe, calcule l'aire exacte du triangle FPF′.")];
}

export const consigneGenerale136 = (e: E): Frag[] => [...situation136(e), t(" "), ...consigneGlobale136(e)];

const LIBELLE: Record<Ph, string> = { excentricite: "Excentricité", rayonF: "Rayon focal |PF|", rayonFp: "Rayon focal |PF′|", cosMax: "Angle maximal", existence: "Existence du point P", aire: "Aire du triangle FPF′" };
export const libelle136 = (_e: E, p: Ph) => LIBELLE[p];

export function consigne136(e: E, p: Ph): Frag[] {
  switch (p) {
    case "excentricite":
      return [t("Calcule l'excentricité e de l'ellipse.")];
    case "rayonF":
      return [t("Calcule le rayon focal |PF| (valeur exacte, sans racine carrée).")];
    case "rayonFp":
      return [t("Calcule le rayon focal |PF′|.")];
    case "cosMax":
      return [t("Soit B(0 ; b) un sommet du petit axe. Calcule "), l("\\cos\\widehat{FBF'}"), t(" (valeur exacte).")];
    case "existence":
      return [t(`Existe-t-il un point P de l'ellipse tel que l'angle FPF′ mesure ${e.theta}° ?`)];
    case "aire":
      return [t("Calcule l'aire exacte du triangle FPF′.")];
  }
}

export const estChoix136 = (_e: E, p: Ph) => p === "existence";
export const options136 = (): OptionEcran[] => [
  { id: "oui", fragments: [t("Oui : l'angle demandé ne dépasse pas l'angle maximal FBF′.")] },
  { id: "non", fragments: [t("Non : l'angle demandé dépasse l'angle maximal FBF′.")] },
];
export const bonneOption136 = (e: E) => (e.existe ? "oui" : "non");

export function champs136(_e: E, p: Ph): ChampEcran[] {
  const labels: Partial<Record<Ph, [string, string]>> = {
    excentricite: ["Excentricité e", "e="],
    rayonF: ["Rayon |PF|", "|PF|="],
    rayonFp: ["Rayon |PF′|", "|PF'|="],
    cosMax: ["cos FBF′", "\\cos\\widehat{FBF'}="],
    aire: ["Aire du triangle FPF′", "\\mathcal{A}="],
  };
  const lb = labels[p];
  return lb ? [{ label: lb[0], labelLatex: lb[1], placeholder: "nombre exact", apercuLatex: apercuLibre }] : [];
}

export const messageIllisible136 = (): string => ILLISIBLE.nombre;

export function reponse136(e: E, p: Ph): Frag[] {
  switch (p) {
    case "excentricite":
      return [l(`e=${nb(e.c / e.a)}`)];
    case "rayonF":
      return [l(`|PF|=${nb(rayonF136(e))}`)];
    case "rayonFp":
      return [l(`|PF'|=${nb(rayonFp136(e))}`)];
    case "cosMax":
      return [l(`\\cos\\widehat{FBF'}=${nb(cosMax136(e))}`)];
    case "existence":
      return e.existe
        ? [t("Oui : "), l(`\\cos ${e.theta}^\\circ=${nb(cosTheta(e.theta!))}\\geq ${nb(cosMax136(e))}`), t(", donc l'angle demandé ne dépasse pas l'angle maximal FBF′ : P existe (deux points symétriques de chaque côté).")]
        : [t("Non : "), l(`\\cos ${e.theta}^\\circ=${nb(cosTheta(e.theta!))}< ${nb(cosMax136(e))}`), t(", donc l'angle demandé dépasse l'angle maximal FBF′ : aucun point P.")];
    case "aire":
      return [l(`\\mathcal{A}=${exL(aire136(e))}`)];
  }
}

export function recap136(e: E, p: Ph): Frag[] {
  if (p === "existence") return [t(e.existe ? "P existe" : "Aucun point P")];
  return reponse136(e, p);
}

export function aide1_136(_e: E, p: Ph): AideEcran {
  switch (p) {
    case "excentricite":
      return { texte: [t("Cours, § 2 : "), l("e=\\dfrac{c}{a}"), t(", où a est le demi-grand axe et c la demi-distance focale.")] };
    case "rayonF":
    case "rayonFp":
      return { texte: [t("Cours, § 3 : pour un point P d'abscisse x de l'ellipse, les rayons focaux valent :")], latex: "|PF|=a-e\\,x\\qquad |PF'|=a+e\\,x" };
    case "cosMax":
      return { texte: [t("Cours, § 3 : B est à la distance a des deux foyers ; applique la loi des cosinus dans le triangle FBF′ :")], latex: "\\cos\\widehat{FBF'}=\\dfrac{a^2+a^2-4c^2}{2a^2}" };
    case "existence":
      return { texte: [t("Cours, § 3 : l'angle FPF′ est le plus grand quand P est en B, sur le petit axe. Un angle plus grand que FBF′ n'est donc atteint par aucun point de l'ellipse.")] };
    case "aire":
      return { texte: [t("Cours, § 3 : avec |PF| + |PF′| = 2a et la loi des cosinus, on obtient l'aire du triangle focal d'angle θ en P :")], latex: "\\mathcal{A}=b^2\\tan\\dfrac{\\theta}{2}" };
  }
}

export function aide2_136(e: E, p: Ph): AideEcran | null {
  switch (p) {
    case "excentricite":
      return { texte: [t("Ici, lis a sur l'équation et c sur les foyers.")] };
    case "rayonF":
      return { texte: [t("Ici, "), l(`a=${e.a}`), t(" et "), l(`x=${nb(e.xP!)}`), t(" ; reprends e de l'écran précédent (F est le foyer d'abscisse positive).")] };
    case "rayonFp":
      return { texte: [t("Ici, |PF| + |PF′| = 2a : tu peux aussi l'utiliser pour vérifier.")] };
    case "cosMax":
      return { texte: [t("Ici, "), l(`a^2=${e.a * e.a}`), t(" et "), l(`4c^2=${4 * e.c * e.c}`), t(".")] };
    case "existence":
      return { texte: [t("Ici, compare "), l(`\\cos ${e.theta}^\\circ`), t(" et "), l("\\cos\\widehat{FBF'}"), t(" : un plus grand angle a un plus petit cosinus.")] };
    case "aire":
      return { texte: [t("Ici, "), l(`b^2=${e.b * e.b}`), t(" et "), l(`\\dfrac{\\theta}{2}=${e.theta! / 2}^\\circ`), t(".")] };
  }
}

export function figure136(e: E): string {
  const C = conique136(e);
  const pts = [
    { P: { x: e.c, y: 0 }, label: "F", couleur: COULEURS.accent },
    { P: { x: -e.c, y: 0 }, label: "F′", couleur: COULEURS.accent },
    ...(e.variante === "rayons" ? [{ P: P136(e), label: "P", couleur: COULEURS.noir }] : [{ P: { x: 0, y: e.b }, label: "B", couleur: COULEURS.noir }]),
  ];
  return figureConique(C, { points: pts, segments: e.variante === "rayons" ? [{ A: P136(e), B: { x: e.c, y: 0 }, couleur: COULEURS.vert }, { A: P136(e), B: { x: -e.c, y: 0 }, couleur: COULEURS.vert }] : [] });
}

/** Figure du corrigé : triangle FBF′ (aire) ou rayons focaux (rayons). */
export function figureCorrige136(e: E): string {
  if (e.variante === "rayons") return figure136(e);
  const C = conique136(e);
  const B = { x: 0, y: e.b };
  return figureConique(C, {
    points: [{ P: { x: e.c, y: 0 }, label: "F", couleur: COULEURS.accent }, { P: { x: -e.c, y: 0 }, label: "F′", couleur: COULEURS.accent }, { P: B, label: "B", couleur: COULEURS.noir }],
    segments: [{ A: B, B: { x: e.c, y: 0 }, couleur: COULEURS.vert }, { A: B, B: { x: -e.c, y: 0 }, couleur: COULEURS.vert }],
  });
}

export { phases136 };
