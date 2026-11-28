import type { CourbeEntiere, ExerciceComposeeDiagonale } from "../core5e/composeeDiagonale";
import { finCourbe } from "../core5e/composeeDiagonale";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { figureEcran } from "./figureComposeeDiagonale";

/**
 * Couche C — textes de `5gen63` « Composée sur un seul repère (droite y = x) ». Source unique de
 * l'écran, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceComposeeDiagonale;
export type PhaseComposeeDiagonale = "premiere" | "existence" | "valeur";

export function phases(e: E): PhaseComposeeDiagonale[] {
  return e.existe ? ["premiere", "existence", "valeur"] : ["premiere", "existence"];
}

/** Noms : fonction intérieure (agit d'abord) et extérieure. */
export const nomI = (e: E) => (e.variante === "gof" ? "f" : e.variante === "ff" ? "f" : "g");
export const nomO = (e: E) => (e.variante === "fog" ? "f" : e.variante === "gof" ? "g" : "f");
export const courbeI = (e: E): CourbeEntiere => (e.variante === "gof" ? e.f : e.variante === "ff" ? e.f : e.g);
export const courbeO = (e: E): CourbeEntiere => (e.variante === "gof" ? e.g : e.f);
/** « (f\circ g)(2) ». */
export const composeeL = (e: E) => `(${nomO(e)}\\circ ${nomI(e)})(${e.a})`;
export const nombreL = (x: number) => `${x}`;

/** Domaine d'une courbe complète : « [−2 ; 4] », crochets selon les extrémités. */
export function domaineL(k: CourbeEntiere): string {
  return `${k.ouverteG ? "\\mathopen{]}" : "["}${k.debut}\\,;\\,${finCourbe(k)}${k.ouverteD ? "\\mathclose{[}" : "]"}`;
}

export function consigneGenerale(e: E): Frag[] {
  return [
    tx("Les graphes de f et de g ci-dessous sont complets (un point plein appartient au graphe, un rond vide n'y appartient pas) ; la droite "),
    lx("y=x"),
    tx(" est tracée en pointillés. À l'aide de cette droite, détermine "),
    lx(composeeL(e)),
    tx(", s'il existe."),
  ];
}

export function libelle(e: E, phase: PhaseComposeeDiagonale): string {
  const i = nomI(e);
  if (phase === "premiere") return `${i}(${e.a < 0 ? "−" + -e.a : e.a})`;
  if (phase === "existence") return "Existence";
  return `(${nomO(e)}∘${i})(${e.a < 0 ? "−" + -e.a : e.a})`;
}

export function consigne(e: E, phase: PhaseComposeeDiagonale): Frag[] {
  switch (phase) {
    case "premiere":
      return [tx("Première lecture : lis l'image de "), lx(`${e.a}`), tx(" par la fonction qui agit en premier dans "), lx(composeeL(e)), tx(".")];
    case "existence":
      return [tx("Reporte cette valeur sur l'axe horizontal en passant par la droite "), lx("y=x"), tx(" : "), lx(composeeL(e)), tx(" existe-t-il ?")];
    case "valeur":
      return [tx("Seconde lecture : donne "), lx(`${composeeL(e)}=${nomO(e)}\\big(${nomI(e)}(${e.a})\\big)`), tx(".")];
  }
}

export function champs(_e: E, phase: PhaseComposeeDiagonale): ChampEcran[] {
  if (phase === "premiere") return [{ label: "image lue", placeholder: "ex. : −3" }];
  if (phase === "valeur") return [{ label: "valeur lue", placeholder: "ex. : 4" }];
  return [];
}

export function optionsExistence(e: E): OptionEcran[] {
  return [
    { id: "existe", fragments: [lx(composeeL(e)), tx(" existe")] },
    { id: "nexistepas", fragments: [lx(composeeL(e)), tx(" n'existe pas")] },
  ];
}

export function aide1(e: E, phase: PhaseComposeeDiagonale): AideEcran {
  const i = nomI(e);
  const o = nomO(e);
  switch (phase) {
    case "premiere":
      return { texte: [tx("Une composée se lit de droite à gauche : "), lx(`${composeeL(e)}=${o}\\big(${i}(${e.a})\\big)`), tx(". La fonction écrite à droite agit en premier (cours, point 2).")] };
    case "existence":
      return {
        texte: [
          tx("La valeur "),
          lx(`v=${i}(${e.a})`),
          tx(" devient l'entrée de "),
          lx(o),
          tx(". Depuis le point "),
          lx(`(${e.a}\\,;\\,v)`),
          tx(", va horizontalement jusqu'à la droite "),
          lx("y=x"),
          tx(" : tu arrives au point "),
          lx("(v\\,;\\,v)"),
          tx(", d'abscisse "),
          lx("v"),
          tx(". La composée existe si la verticale de ce point rencontre "),
          lx(`C_${o}`),
          tx(", c'est-à-dire si "),
          lx(`v\\in\\operatorname{dom} ${o}`),
          tx(" (astuce du cours, point 4)."),
        ],
      };
    case "valeur":
      return { texte: [tx("Depuis le point "), lx(`(${e.v}\\,;\\,${e.v})`), tx(" de la diagonale, va verticalement jusqu'à "), lx(`C_${o}`), tx(" : l'ordonnée du point atteint est "), lx(`${o}(${e.v})`), tx(".")] };
  }
}

export function aide2(e: E, phase: PhaseComposeeDiagonale): AideEcran | null {
  const i = nomI(e);
  const o = nomO(e);
  switch (phase) {
    case "premiere":
      return { texte: [tx("Ici, place-toi en "), lx(`x=${e.a}`), tx(" sur l'axe horizontal, puis monte ou descends verticalement jusqu'à "), lx(`C_${i}`), tx(" : lis l'ordonnée du point atteint.")] };
    case "existence":
      return { texte: [tx("Ici, le graphe de "), lx(o), tx(" est complet : "), lx(`\\operatorname{dom} ${o}=${domaineL(courbeO(e))}`), tx(" (un rond vide exclut sa borne). Compare "), lx(`v=${e.v}`), tx(" à ce domaine.")] };
    case "valeur":
      return { texte: [tx("Ici, le report par la diagonale est tracé, avec la verticale "), lx(`x=${e.v}`), tx(" : lis où elle coupe "), lx(`C_${o}`), tx(".")], figure: figureEcran(e, { report: true, verticale: true }) };
  }
}

export function messageIllisible(): string {
  return "Nombre non reconnu : écris un entier comme −3 ou 4. Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, phase: PhaseComposeeDiagonale): Frag[] {
  const i = nomI(e);
  const o = nomO(e);
  switch (phase) {
    case "premiere":
      return [lx(`${i}(${e.a})=${e.v}`)];
    case "existence":
      return e.existe
        ? [lx(`${e.v}\\in\\operatorname{dom} ${o}`), tx(" : "), lx(composeeL(e)), tx(" existe")]
        : [lx(`${e.v}\\notin\\operatorname{dom} ${o}=${domaineL(courbeO(e))}`), tx(" : "), lx(composeeL(e)), tx(" n'existe pas")];
    case "valeur":
      return [lx(`${composeeL(e)}=${o}(${e.v})=${e.w}`)];
  }
}

export const recap = reponse;

export function explicationExistence(e: E): string {
  const o = nomO(e);
  const dom = `${courbeO(e).ouverteG ? "]" : "["}${n(courbeO(e).debut)} ; ${n(finCourbe(courbeO(e)))}${courbeO(e).ouverteD ? "[" : "]"}`;
  return e.existe ? `${nomI(e)}(${n(e.a)}) = ${n(e.v)} appartient à dom ${o} = ${dom} : la verticale x = ${n(e.v)} rencontre C${o}.` : `${nomI(e)}(${n(e.a)}) = ${n(e.v)} n'appartient pas à dom ${o} = ${dom} : ${o} ne peut pas recevoir ${n(e.v)}.`;
}
const n = (x: number) => (x < 0 ? `−${-x}` : `${x}`);
