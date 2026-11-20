import type { ExerciceGrapheReciproque } from "../core6e/grapheReciproque.types";
import { domaineReciproque, imageReciproque, intervalleL, LETTRES_GRAPHES, lettreReciproque, penteFL, penteRecL, pointA } from "../moteur6e/modeleGrapheReciproque";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransExp.types";
import { lx, tx } from "./ecransExp.types";

/**
 * Couche C — textes de `6gen154` « Graphe de la réciproque » : consignes, champs, options, aides à
 * deux niveaux (propriété du cours, puis application à la figure — jamais la réponse), réponses.
 * Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceGrapheReciproque;
export type PhaseGrapheReciproque = "point" | "ensembles" | "graphe" | "pente";
export const PHASES_GRAPHE: PhaseGrapheReciproque[] = ["point", "ensembles", "graphe", "pente"];
const t = tx;
const l = lx;

export function consigneGenerale(e: E): Frag[] {
  return [
    t(`Le graphe complet d'une fonction `),
    l("f"),
    t(e.variante === "croissante" ? " strictement croissante" : " strictement décroissante"),
    t(" est tracé ci-dessous (un carreau = une unité ; point plein : extrémité comprise, rond vide : exclue). Le point "),
    l("A"),
    t(", les extrémités et les points de la tangente tracée en "),
    l("A"),
    t(" sont sur des nœuds du quadrillage."),
  ];
}

export function questionsPapier(): Frag[][] {
  return [
    [t("Donne les coordonnées du point "), l("A'"), t(" de la courbe de "), l("f^{-1}"), t(" qui correspond à "), l("A"), t(".")],
    [t("Donne le domaine et l'image de "), l("f^{-1}"), t(".")],
    [t("Lequel des graphes A, B, C, D représente "), l("f^{-1}"), t(" ?")],
    [t("Lis la pente de la tangente à "), l("f"), t(" en "), l("A"), t(", puis déduis-en la pente de la tangente à "), l("f^{-1}"), t(" en "), l("A'"), t(".")],
  ];
}

export function libelle(_e: E, phase: PhaseGrapheReciproque): string {
  return phase === "point" ? "Point A′" : phase === "ensembles" ? "Domaine et image de f⁻¹" : phase === "graphe" ? "Graphe de f⁻¹" : "Pentes";
}

export function consigne(_e: E, phase: PhaseGrapheReciproque): Frag[] {
  if (phase === "point") return [t("Donne les coordonnées du point "), l("A'"), t(" de la courbe de "), l("f^{-1}"), t(" qui correspond au point "), l("A"), t(" de la courbe de "), l("f"), t(".")];
  if (phase === "ensembles") return [t("Donne le domaine et l'image de "), l("f^{-1}"), t(" (intervalles, crochets compris).")];
  if (phase === "graphe") return [t("Lequel de ces graphes représente "), l("f^{-1}"), t(" ? (la courbe de "), l("f"), t(" est rappelée en gris pointillé)")];
  return [t("La tangente à "), l("f"), t(" en "), l("A"), t(" est tracée en pointillé orange. Lis sa pente, puis donne la pente de la tangente à "), l("f^{-1}"), t(" en "), l("A'"), t(".")];
}

export function champs(_e: E, phase: PhaseGrapheReciproque): ChampEcran[] {
  if (phase === "point") return [
    { label: "abscisse de A′", labelLatex: "x_{A'}=", placeholder: "ex. : 7" },
    { label: "ordonnée de A′", labelLatex: "y_{A'}=", placeholder: "ex. : −7" },
  ];
  if (phase === "ensembles") return [
    { label: "domaine de f⁻¹", labelLatex: "\\mathrm{dom}\\,f^{-1}=", placeholder: "ex. : ]0 ; 7]" },
    { label: "image de f⁻¹", labelLatex: "\\mathrm{im}\\,f^{-1}=", placeholder: "ex. : [−7 ; 0[" },
  ];
  return [
    { label: "pente de la tangente à f en A", labelLatex: "m_{f}=", placeholder: "ex. : 4/5" },
    { label: "pente de la tangente à f⁻¹ en A′", labelLatex: "m_{f^{-1}}=", placeholder: "ex. : 5/4" },
  ];
}

export function optionsGraphe(): OptionEcran[] {
  return LETTRES_GRAPHES.map((x) => ({ id: x, fragments: [t(`Graphe ${x}`)] }));
}

export function reponse(e: E, phase: PhaseGrapheReciproque): Frag[] {
  const [a, b] = pointA(e);
  if (phase === "point") return [l(`A'=(${b}\\,;\\,${a})`)];
  if (phase === "ensembles") return [l(`\\mathrm{dom}\\,f^{-1}=${intervalleL(domaineReciproque(e))}`), t(" ; "), l(`\\mathrm{im}\\,f^{-1}=${intervalleL(imageReciproque(e))}`)];
  if (phase === "graphe") return [t(`Graphe ${lettreReciproque(e)}`)];
  return [l(`m_{f}=${penteFL(e)}`), t(" ; "), l(`m_{f^{-1}}=${penteRecL(e)}`)];
}

export const recap = reponse;

export function messageIllisible(_e: E, phase: PhaseGrapheReciproque): string {
  if (phase === "ensembles") return "Je n'arrive pas à lire un intervalle (exemples d'écritures : [−2 ; 3], ]1 ; 4], [0;5[). Cela ne compte pas comme une tentative.";
  if (phase === "pente") return "Je n'arrive pas à lire une pente (exemples d'écritures : 3/2, −2, 0,5). Cela ne compte pas comme une tentative.";
  return "Je n'arrive pas à lire une coordonnée (exemples d'écritures : 3, −2). Cela ne compte pas comme une tentative.";
}

export function aide1(_e: E, phase: PhaseGrapheReciproque): AideEcran {
  if (phase === "point") return { texte: [t("Les courbes de "), l("f"), t(" et de "), l("f^{-1}"), t(" sont symétriques par rapport à la droite "), l("y=x"), t(" (cours, § 1) :")], latex: "(a\\,;\\,b)\\in\\mathcal{G}_f\\iff(b\\,;\\,a)\\in\\mathcal{G}_{f^{-1}}" };
  if (phase === "ensembles") return { texte: [t("La réciproque échange les rôles des deux axes (cours, § 1) :")], latex: "\\mathrm{dom}\\,f^{-1}=\\mathrm{im}\\,f\\qquad\\mathrm{im}\\,f^{-1}=\\mathrm{dom}\\,f" };
  if (phase === "graphe") return { texte: [t("Le graphe de "), l("f^{-1}"), t(" est le symétrique de celui de "), l("f"), t(" par rapport à la droite "), l("y=x"), t(" (la diagonale en pointillé gris).")] };
  return { texte: [t("Pente d'une droite qui passe par deux nœuds : "), l("m=\\dfrac{\\Delta y}{\\Delta x}"), t(". La symétrie par rapport à "), l("y=x"), t(" échange "), l("\\Delta x"), t(" et "), l("\\Delta y"), t(" (cours, § 1) :")], latex: "(f^{-1})'(b)=\\dfrac{1}{f'(a)}" };
}

export function aide2(e: E, phase: PhaseGrapheReciproque): AideEcran {
  if (phase === "point") return { texte: [t("Lis d'abord les coordonnées de "), l("A"), t(" sur la grille (abscisse, puis ordonnée), puis échange-les.")] };
  if (phase === "ensembles") return { texte: [t("Lis "), l("\\mathrm{dom}\\,f"), t(" sur l'axe horizontal (de l'extrémité gauche à l'extrémité droite) et "), l("\\mathrm{im}\\,f"), t(" sur l'axe vertical (de la plus petite ordonnée à la plus grande) ; un rond vide exclut la borne, de part et d'autre.")] };
  if (phase === "graphe") return { texte: [t("Contrôle un point : le symétrique "), l("A'"), t(" de "), l("A"), t(" (coordonnées échangées) doit être sur le bon graphe, et les extrémités aussi.")] };
  return { texte: [t("Depuis "), l("A"), t(", compte les carreaux jusqu'au nœud suivant de la tangente : "), l("\\Delta x"), t(` carreaux vers la droite, puis `), l("\\Delta y"), t(e.variante === "croissante" ? " carreaux vers le haut." : " carreaux vers le bas (pente négative).")] };
}

export function explicationChoix(e: E): string {
  return `Le graphe ${lettreReciproque(e)} est le symétrique de la courbe de f par rapport à y = x.`;
}
