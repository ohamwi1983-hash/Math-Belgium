import type { ExerciceScenarioAConteneur, ExerciceScenarioAStockCommande, ExerciceScenarioC } from "../../core5e/problemesContexte.types";
import { construireSvgFonction, type GrilleSvg, type ViewBoxSvg } from "../../../export/svgGraph";
import { nombreFr } from "../../ui5e/formatProblemesContexte";
import { domaineGrapheScenarioA } from "../../ui5e/scenarioAGraph";
import { domaineGrapheScenarioAReduit } from "../../ui5e/scenarioAGraphReduit";
import { domaineGrapheScenarioC } from "../../ui5e/scenarioCGraph";
import { aireBasesCylindre, aireLateraleCylindre, fStockCommande, gStockCommande } from "./scenarioA";
import { chiffreAffaires, coutProportionnel, coutTotal, coutVariable } from "./scenarioC";

/**
 * Graphiques papier de 5gen5 (énoncé : données à LIRE ; corrigé : même graphique, lecture marquée) —
 * sortis de l'adaptateur pour être partagés avec le corrigé détaillé (`corrigeDetaille.ts`, sans
 * `docx`). Quadrillage : une ligne verticale par UNITÉ de x (lectures « arrondies à l'unité » sur
 * une ligne de la grille), graduée tous les 2 ou 5.
 */

const COULEUR_F = "#1971c2";
const COULEUR_G = "#e8590c";
const COULEUR_SOMME = "#2f9e44";
const COULEUR_CV = "#7048e8";
const COULEUR_CP = "#e8590c";
const COULEUR_CT = "#2f9e44";
const COULEUR_CA = "#d6336c";

const LARGEUR_GRAPHE = 400;
const HAUTEUR_GRAPHE = 280;

function centrer(svg: string): string {
  return `<div style="display:flex;justify-content:center;margin:0.5em 0">${svg}</div>`;
}

/** Pas « rond » (1, 2, 5 × 10ⁿ) pour environ `divisions` graduations. */
function pasRond(etendue: number, divisions: number): number {
  const brut = etendue / divisions;
  const magnitude = 10 ** Math.floor(Math.log10(brut));
  const normalise = brut / magnitude;
  return (normalise < 1.5 ? 1 : normalise < 3 ? 2 : normalise < 7 ? 5 : 10) * magnitude;
}

/** Quadrillage : une ligne par unité de x (graduée tous les 2 ou 5), y automatique. */
function grilleUnite(vb: ViewBoxSvg): GrilleSvg | undefined {
  const etendue = vb.xMax - vb.xMin;
  if (etendue > 40) return undefined;
  const pasY = pasRond(vb.yMax - vb.yMin, 8);
  return { pasX: 1, pasY, etiquetteX: etendue > 20 ? 5 : 2, etiquetteY: pasY };
}

/** Une courbe coupée hors du cadre (évite les tracés géants près d'une asymptote). */
function borne(f: (x: number) => number, vb: ViewBoxSvg): (x: number) => number | null {
  return (x) => {
    if (x <= 0) return null;
    const y = f(x);
    return Number.isFinite(y) && y <= vb.yMax * 1.02 && y >= vb.yMin ? y : null;
  };
}

/** Fenêtre avec une marge à gauche et en bas pour les graduations (x ≥ 0, y ≥ 0). */
function fenetre(xMax: number, yMax: number): ViewBoxSvg {
  return { xMin: -0.1 * xMax, xMax, yMin: -0.08 * yMax, yMax };
}

export function grapheA1(e: ExerciceScenarioAConteneur, marquerMinimum: boolean): string {
  const { xMax, yMax } = domaineGrapheScenarioA(e);
  const vb = fenetre(xMax, yMax);
  const f = (x: number) => aireLateraleCylindre(e.volumeCm3, x);
  const g = (x: number) => aireBasesCylindre(x);
  const somme = (x: number) => f(x) + g(x);
  const xOpt = Math.round(e.xOptimal);
  return centrer(
    construireSvgFonction(borne(somme, vb), vb, {
      largeur: LARGEUR_GRAPHE,
      hauteur: HAUTEUR_GRAPHE,
      divisionsX: 16,
      divisionsY: 8,
      grille: grilleUnite(vb),
      couleurCourbe: COULEUR_SOMME,
      courbesSecondaires: [
        { evaluer: borne(f, vb), couleur: COULEUR_F, pointilles: false },
        { evaluer: borne(g, vb), couleur: COULEUR_G, pointilles: false },
      ],
      legende: [
        { texte: "f(x) : aire latérale (cm²)", couleur: COULEUR_F },
        { texte: "g(x) : aire des bases (cm²)", couleur: COULEUR_G },
        { texte: "(f + g)(x)", couleur: COULEUR_SOMME },
      ],
      points: marquerMinimum ? [{ x: xOpt, y: somme(xOpt), label: `minimum vers x = ${xOpt}`, couleur: COULEUR_SOMME, labelPosition: "dessous" }] : [],
      verticales: marquerMinimum ? [{ x: xOpt, couleur: COULEUR_SOMME }] : [],
    }),
  );
}

export function grapheA2(e: ExerciceScenarioAStockCommande, marquerMinimum: boolean): string {
  const { xMax, yMax } = domaineGrapheScenarioAReduit(e);
  const vb = fenetre(xMax, yMax);
  const f = (x: number) => fStockCommande(e.a, e.b, x);
  const g = (x: number) => gStockCommande(e.k, x);
  const somme = (x: number) => f(x) + g(x);
  const xExt = Math.round(e.xExtremum);
  return centrer(
    construireSvgFonction(borne(somme, vb), vb, {
      largeur: LARGEUR_GRAPHE,
      hauteur: HAUTEUR_GRAPHE,
      divisionsX: 16,
      divisionsY: 8,
      grille: grilleUnite(vb),
      couleurCourbe: COULEUR_SOMME,
      courbesSecondaires: [
        { evaluer: borne(f, vb), couleur: COULEUR_F, pointilles: false },
        { evaluer: borne(g, vb), couleur: COULEUR_G, pointilles: false },
      ],
      legende: [
        { texte: `f(x) : ${e.contexte.labelF} (€)`, couleur: COULEUR_F },
        { texte: `g(x) : ${e.contexte.labelG} (€)`, couleur: COULEUR_G },
        { texte: "(f + g)(x) : coût total (€)", couleur: COULEUR_SOMME },
      ],
      points: marquerMinimum ? [{ x: xExt, y: somme(xExt), label: `minimum vers x = ${xExt}`, couleur: COULEUR_SOMME, labelPosition: "dessous" }] : [],
      verticales: marquerMinimum ? [{ x: xExt, couleur: COULEUR_SOMME }] : [],
    }),
  );
}

export function grapheC(e: ExerciceScenarioC, marquerSeuil: boolean): string {
  const { xMax, yMax } = domaineGrapheScenarioC(e);
  const vb = fenetre(xMax, yMax);
  const ct = (x: number) => coutTotal(e.cf, e.formeCV, e.k, e.m, x);
  const ca = (x: number) => chiffreAffaires(e.formeCA, e.p, x);
  const cv = (x: number) => coutVariable(e.formeCV, e.k, x);
  const cp = (x: number) => coutProportionnel(e.m, x);
  const dansCadre = (f: (x: number) => number) => (x: number) => {
    if (x < 0) return null;
    const y = f(x);
    return Number.isFinite(y) && y <= vb.yMax * 1.02 ? y : null;
  };
  return centrer(
    construireSvgFonction(dansCadre(ct), vb, {
      largeur: LARGEUR_GRAPHE,
      hauteur: HAUTEUR_GRAPHE,
      divisionsX: 16,
      divisionsY: 8,
      grille: grilleUnite(vb),
      couleurCourbe: COULEUR_CT,
      courbesSecondaires: [
        { evaluer: dansCadre(cv), couleur: COULEUR_CV, pointilles: false },
        { evaluer: dansCadre(cp), couleur: COULEUR_CP, pointilles: false },
        { evaluer: dansCadre(ca), couleur: COULEUR_CA, pointilles: false },
      ],
      legende: [
        { texte: "CV(x)", couleur: COULEUR_CV },
        { texte: "CP(x)", couleur: COULEUR_CP },
        { texte: "CT(x)", couleur: COULEUR_CT },
        { texte: "CA(x)", couleur: COULEUR_CA },
      ],
      points: marquerSeuil ? [{ x: e.xSeuil, y: ca(e.xSeuil), label: `seuil vers x = ${nombreFr(e.xSeuil, 1)}`, couleur: COULEUR_CA, labelPosition: "dessus" }] : [],
      verticales: marquerSeuil ? [{ x: e.xSeuil, couleur: COULEUR_CA }] : [],
    }),
  );
}
