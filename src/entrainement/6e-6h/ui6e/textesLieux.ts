import type { ChampCombi } from "./fragmentsCombinatoire";
import { apercuSaisieLatex, latexDroite, latexPoint, ptNum } from "../moteur6e/algebreLieux";
import type { Droite, Pt } from "../moteur6e/algebreLieux";
import type { P2 } from "./figureLieux";

/**
 * Briques de texte communes aux écrans du 6e ch. 9 (6gen54–6gen57, audit, lot B) : libellés en KaTeX,
 * indications de FORMAT dans les champs (jamais une valeur possible, audit G3), écriture des points
 * et des droites (ax + by + c = 0 simplifiée, convention du cours).
 */

export const lp = (p: Pt) => latexPoint(p);
export const ld = (d: Droite) => latexDroite(d);
export const nomPoint = (nom: string, p: Pt) => `${nom}${latexPoint(p)}`;
export const p2 = (p: Pt): P2 => ptNum(p);
export const d3 = (d: Droite) => ({ a: Number(d.a), b: Number(d.b), c: Number(d.c) });

export const PH_POINT = "(… ; …)";
export const PH_NOMBRE = "valeur exacte";
export const PH_EQUATION = "… = …";
export const PH_DROITE = "ax + by + c = 0";

export const champPointUI = (label: string): ChampCombi => ({ type: "texte", label, placeholder: PH_POINT });
export const champNombreUI = (label: string): ChampCombi => ({ type: "texte", label, placeholder: PH_NOMBRE });
export const champDroiteUI = (label: string): ChampCombi => ({ type: "texte", label, placeholder: PH_DROITE, apercuFn: (v) => apercuSaisieLatex(v) });
export const champEquationUI = (label: string, variables?: readonly string[]): ChampCombi => ({ type: "texte", label, placeholder: PH_EQUATION, apercuFn: (v) => apercuSaisieLatex(v, variables) });
export const champListePointsUI = (label: string): ChampCombi => ({ type: "liste", label, placeholder: PH_POINT });
export const champListeNombresUI = (label: string): ChampCombi => ({ type: "liste", label, placeholder: PH_NOMBRE });
export const champListeDroitesUI = (label: string): ChampCombi => ({ type: "liste", label, placeholder: PH_DROITE });
export const champListeEquationsUI = (label: string): ChampCombi => ({ type: "liste", label, placeholder: PH_EQUATION });

/** Phrase rappelée sous un champ « liste » : une réponse par ligne. */
export const UNE_PAR_LIGNE = "une par ligne (« + Ajouter une ligne » pour la suivante)";
