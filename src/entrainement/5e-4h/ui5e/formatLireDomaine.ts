import type { ExerciceLireDomaine } from "../core5e/lireDomaineImage";
import { aDesFleches, domaine, image, valeur } from "../core5e/lireDomaineImage";
import { ensembleL } from "../moteur5e/ensemblesReels";
import type { AideEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";

/**
 * Couche C — textes de `5gen59` « Lire domaine et image sur un graphique » : consignes, aides à deux
 * niveaux (règle du cours, puis repérage sur CE graphique sans les nombres de la réponse), réponses.
 * Source unique de l'écran, du récapitulatif, du papier et du corrigé.
 */

type E = ExerciceLireDomaine;
export type PhaseLireDomaine = "domaine" | "image" | "existence";
export const PHASES: PhaseLireDomaine[] = ["domaine", "image", "existence"];

export const domL = (e: E): string => ensembleL(domaine(e));
export const imL = (e: E): string => ensembleL(image(e));
export const nb = (v: number): string => (v < 0 ? `−${-v}` : `${v}`);

/** Phrase sur le graphique (complet / prolongé par des flèches). */
export function phraseGraphique(e: E): Frag[] {
  return aDesFleches(e)
    ? [tx("Les flèches indiquent que la courbe se prolonge indéfiniment dans la même direction ; ailleurs, rien n'est tracé hors du cadre. Un point plein appartient à la courbe, un point creux non.")]
    : [tx("Le graphique est complet : rien n'est tracé hors du cadre. Un point plein appartient à la courbe, un point creux non.")];
}

export function consigneGenerale(e: E): Frag[] {
  return [tx("Voici le graphique d'une fonction f, sur un quadrillage d'une unité. "), ...phraseGraphique(e)];
}

export function libelle(_e: E, p: PhaseLireDomaine): string {
  return p === "domaine" ? "Domaine" : p === "image" ? "Image" : "Existence de f(a)";
}

export function consigne(e: E, p: PhaseLireDomaine): Frag[] {
  if (p === "domaine") return [tx("Lis le domaine de définition de f sur le graphique.")];
  if (p === "image") return [tx("Lis l'image de f sur le graphique.")];
  return [tx("Le nombre "), lx(`f(${e.a})`), tx(" existe-t-il ?")];
}

export function optionsExistence(e: E): OptionEcran[] {
  return [
    { id: "existe", fragments: [lx(`f(${e.a})`), tx(" existe")] },
    { id: "nexistepas", fragments: [lx(`f(${e.a})`), tx(" n'existe pas")] },
  ];
}

function structureDomaine(e: E): string {
  const morceaux: string[] = [];
  if (e.morceaux.length > 1) morceaux.push(e.morceaux[0]!.pts.at(-1)![0] === e.morceaux[1]!.pts[0]![0] ? "deux morceaux qui se touchent à la même abscisse (un bout plein, un bout creux)" : "deux morceaux séparés : une réunion de deux intervalles");
  if (e.trou && !e.deplace) morceaux.push("un point creux à l'intérieur de la courbe : une valeur est retirée");
  if (e.trou && e.deplace) morceaux.push("un point creux sur la courbe, mais un point plein à la même abscisse : cette abscisse a bien une image");
  const g = e.morceaux[0]!.g;
  const d = e.morceaux.at(-1)!.d;
  if (g === "fleche" || d === "fleche") morceaux.push(g === "fleche" && d === "fleche" ? "une flèche de chaque côté : les deux bornes sont infinies" : `une flèche ${g === "fleche" ? "à gauche" : "à droite"} : cette borne est infinie`);
  if (morceaux.length === 0) morceaux.push("une courbe d'un seul tenant, sans flèche : un seul intervalle borné");
  return morceaux.join(" ; ");
}

function structureImage(e: E): string {
  const ys = e.morceaux.flatMap((m) => m.pts.map((p) => p[1]));
  const bas = Math.min(...ys);
  const haut = Math.max(...ys);
  const bouts = e.morceaux.flatMap((m) => [m.pts[0]![1], m.pts.at(-1)![1]]);
  const morceaux: string[] = [];
  if (!bouts.includes(bas) || !bouts.includes(haut)) morceaux.push("le point le plus bas ou le plus haut n'est pas une extrémité de la courbe");
  if (aDesFleches(e)) morceaux.push("une flèche qui monte ou descend envoie l'image jusqu'à l'infini ; une flèche horizontale, non");
  if (e.trou) morceaux.push("le point creux ne retire une ordonnée que si aucun autre point de la courbe n'est à cette hauteur");
  if (e.morceaux.length > 1) morceaux.push("projette chaque morceau, puis réunis les ordonnées obtenues (elles peuvent se chevaucher)");
  if (morceaux.length === 0) morceaux.push("repère le point le plus bas et le point le plus haut, et regarde s'ils sont pleins ou creux");
  return morceaux.join(" ; ");
}

export function aide1(_e: E, p: PhaseLireDomaine): AideEcran {
  if (p === "domaine") return { texte: [tx("Le domaine se lit en projetant la courbe sur l'axe des x : ce sont les abscisses de tous ses points, de gauche à droite (point plein : crochet fermé ; point creux : crochet ouvert ; flèche : jusqu'à l'infini, crochet ouvert).")] };
  if (p === "image") return { texte: [tx("L'image se lit en projetant la courbe sur l'axe des y : ce sont les ordonnées atteintes, du point le plus bas au point le plus haut (mêmes règles pour les crochets).")] };
  return { texte: [tx("Le nombre "), lx("f(a)"), tx(" existe si la verticale d'abscisse "), lx("a"), tx(" rencontre la courbe en un point qui lui appartient, autrement dit :")], latex: `f(a)\\text{ existe}\\iff a\\in\\operatorname{dom}f` };
}

export function aide2(e: E, p: PhaseLireDomaine): AideEcran | null {
  if (p === "domaine") return { texte: [tx(`Sur ce graphique : ${structureDomaine(e)}.`)] };
  if (p === "image") return { texte: [tx(`Sur ce graphique : ${structureImage(e)}.`)] };
  return { texte: [tx("Trace la verticale "), lx(`x=${e.a}`), tx(" : touche-t-elle un point plein ou un trait de la courbe ? Un point creux ne compte pas. Tu peux aussi comparer "), lx(`${e.a}`), tx(" au domaine trouvé à l'écran 1.")] };
}

export function reponse(e: E, p: PhaseLireDomaine): Frag[] {
  if (p === "domaine") return [lx(`\\operatorname{dom}f=${domL(e)}`)];
  if (p === "image") return [lx(`\\operatorname{Im}f=${imL(e)}`)];
  const v = valeur(e, e.a);
  return v !== null ? [lx(`f(${e.a})`), tx(" existe : "), lx(`f(${e.a})=${v}`), tx(".")] : [lx(`f(${e.a})`), tx(" n'existe pas : "), lx(`${e.a}\\notin\\operatorname{dom}f`), tx(".")];
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhaseLireDomaine): string {
  void p;
  return "Ensemble non reconnu : écris des intervalles avec leurs crochets, par exemple [−3 ; 2[ ∪ ]2 ; 5], ]−∞ ; 4] ou ℝ. Cette saisie ne compte pas comme une tentative.";
}

/** Explication d'un choix fermé faux (écran 3), selon l'endroit où tombe a. */
export function explication(e: E): string {
  const a = nb(e.a);
  switch (e.lieu) {
    case "creux":
      return `En x = ${a}, la courbe s'arrête sur un point creux : ce point n'appartient pas au graphe.`;
    case "trou":
      return `En x = ${a}, il y a un point creux et aucun point plein à cette abscisse.`;
    case "ecart":
      return `La verticale x = ${a} passe entre les deux morceaux : elle ne rencontre pas la courbe.`;
    case "dehors":
      return `Le graphique est complet et la verticale x = ${a} ne le rencontre pas.`;
    case "plein":
      return `En x = ${a}, la courbe s'arrête sur un point plein : il appartient au graphe.`;
    case "saut":
      return `En x = ${a}, un bout est creux mais l'autre est plein : la valeur existe.`;
    case "deplace":
      return `En x = ${a}, le point de la courbe est creux, mais le point plein isolé donne la valeur.`;
    default:
      return `La verticale x = ${a} rencontre la courbe en un point.`;
  }
}
