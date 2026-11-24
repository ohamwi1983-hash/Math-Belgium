import type { ExerciceGraphiqueDerivee } from "../core5e/graphiqueDerivee";
import { ensembleConcave, ensembleConvexe, ensembleNegatif, ensemblePositif, extremums, FENETRE_FP, fp, morceaux } from "../core5e/graphiqueDerivee";
import { apercuEnsemble, ensembleL, RACCOURCIS_ENSEMBLE } from "../moteur5e/ensemblesReels";
import type { AideEcran, ChampEcran, Frag } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import type { SpecRepere } from "./figureLotHDerivees";
import { COULEUR_REPERE, COULEUR_TANGENTE, repereSvg } from "./figureLotHDerivees";

/**
 * Couche C — textes et figures de `5gen74` « Du graphique de f′ aux variations de f » : consignes,
 * champs (ensembles et listes d'abscisses), aides à deux niveaux, réponses, figures (énoncé ET
 * corrigé). Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceGraphiqueDerivee;
export type PhaseGraphiqueDerivee = "signe" | "extremums" | "concavite" | "inflexion";
export const PHASES: PhaseGraphiqueDerivee[] = ["signe", "extremums", "concavite", "inflexion"];

// ============================================================================
// Écritures.
// ============================================================================

/** Liste d'abscisses : « −1 et 3 », « aucun ». */
export function listeL(xs: number[], vide = "aucun"): Frag[] {
  if (xs.length === 0) return [tx(vide)];
  const out: Frag[] = [];
  xs.forEach((x, i) => {
    if (i > 0) out.push(tx(i === xs.length - 1 ? " et " : ", "));
    out.push(lx(`x=${x}`));
  });
  return out;
}

export const nomSigne = (s: number): string => (s > 0 ? "+" : "-");

/** Tableau de signes de f′ (LaTeX `array`), du MÊME découpage que l'écran. */
export function tableauSignesL(e: E): string {
  const bornes = e.zeros.map((z) => z.x);
  const m = morceaux(bornes);
  const cellsX = ["-\\infty"];
  const cellsS = [""];
  m.forEach((mc, i) => {
    cellsX.push("");
    cellsS.push(nomSigne(fp(e, mc.test)));
    if (i < bornes.length) {
      cellsX.push(`${bornes[i]}`);
      cellsS.push("0");
    }
  });
  cellsX.push("+\\infty");
  cellsS.push("");
  const col = "c".repeat(cellsX.length);
  return `\\begin{array}{c|${col}}x&${cellsX.join("&")}\\\\\\hline f'(x)&${cellsS.join("&")}\\end{array}`;
}

// ============================================================================
// Figures.
// ============================================================================

function specFp(e: E): SpecRepere {
  const w = FENETRE_FP;
  return { xmin: -w, xmax: w, ymin: -w, ymax: w, sx: 1, sy: 1, carreau: 26, police: 11, courbes: [{ f: (x) => fp(e, x), couleur: "#2f9e44" }], titre: "y = f′(x)", nomY: "y" };
}

/** Figure de l'énoncé : le graphique de f′ seul (aucun point marqué). */
export const figureEnonce = (e: E): string => repereSvg(specFp(e));

/** Corrigé, étapes a et b : zéros de f′ marqués. */
export function figureZeros(e: E): string {
  const s = specFp(e);
  s.points = e.zeros.map((z) => ({ x: z.x, y: 0, label: `${z.x}`.replace("-", "−"), couleur: COULEUR_TANGENTE, position: "ne" as const }));
  return repereSvg(s);
}

/** Corrigé, étapes c et d : extremums de f′ marqués, verticales aux points d'inflexion. */
export function figureExtremumsFp(e: E): string {
  const s = specFp(e);
  s.points = e.inflexions.map((x) => ({ x, y: fp(e, x), label: `${x}`.replace("-", "−"), couleur: COULEUR_REPERE, position: (fp(e, x) >= 0 ? "ne" : "se") as "ne" | "se" }));
  s.verticales = e.inflexions.map((x) => ({ x }));
  return repereSvg(s);
}

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseGraphiqueDerivee, string> = {
  signe: "Signe de f′",
  extremums: "Extremums de f",
  concavite: "Concavité de f",
  inflexion: "Points d'inflexion de f",
};

export const libelle = (_e: E, p: PhaseGraphiqueDerivee): string => LIBELLES[p];

export const consigneGenerale = (_e: E): Frag[] => [
  tx("Le graphique ci-dessous est celui de la DÉRIVÉE "),
  lx("f'"),
  tx(" d'une fonction f définie et dérivable sur "),
  lx("\\mathbb{R}"),
  tx(" (pas celui de f). Tous les zéros et tous les extremums de "),
  lx("f'"),
  tx(" sont visibles ; au-delà de la fenêtre, "),
  lx("f'"),
  tx(" garde le même sens de variation."),
];

export function consigne(_e: E, p: PhaseGraphiqueDerivee): Frag[] {
  if (p === "signe") return [tx("Donne le signe de "), lx("f'"), tx(" : sur quel ensemble "), lx("f'(x)>0"), tx(", sur quel ensemble "), lx("f'(x)<0"), tx(" ?")];
  if (p === "extremums") return [tx("Déduis-en les extremums locaux de f : en quelles abscisses f a-t-elle un maximum local, un minimum local ? (Écris « aucun » s'il n'y en a pas.)")];
  if (p === "concavite") return [tx("Sur quel ensemble f est-elle convexe, et sur quel ensemble est-elle concave ?")];
  return [tx("Donne les abscisses des points d'inflexion de f.")];
}

const ENSEMBLE = (label: string, labelLatex: string): ChampEcran => ({ label, labelLatex, placeholder: "ex. : ]−∞ ; 2[ ∪ ]5 ; +∞[ ou ∅", apercuLatex: apercuEnsemble, raccourcis: RACCOURCIS_ENSEMBLE });

export function champs(_e: E, p: PhaseGraphiqueDerivee): ChampEcran[] {
  if (p === "signe") return [ENSEMBLE("f′(x) > 0 sur", "f'(x)>0\\text{ sur}"), ENSEMBLE("f′(x) < 0 sur", "f'(x)<0\\text{ sur}")];
  if (p === "extremums")
    return [
      { label: "Maximum local en x =", labelLatex: "\\text{maximum local en }x=", placeholder: "ex. : −1 ou aucun" },
      { label: "Minimum local en x =", labelLatex: "\\text{minimum local en }x=", placeholder: "ex. : 2 ou aucun" },
    ];
  if (p === "concavite") return [ENSEMBLE("f convexe sur", "f\\text{ convexe sur}"), ENSEMBLE("f concave sur", "f\\text{ concave sur}")];
  return [{ label: "Points d'inflexion en x =", labelLatex: "x=", placeholder: "ex. : 1 ou −2 ; 1" }];
}

export function aide1(_e: E, p: PhaseGraphiqueDerivee): AideEcran {
  if (p === "signe") return { texte: [lx("f'(x)>0"), tx(" là où la courbe de f′ est AU-DESSUS de l'axe des abscisses, "), lx("f'(x)<0"), tx(" là où elle est en dessous ; aux zéros de f′, ni l'un ni l'autre (crochets ouverts).")] };
  if (p === "extremums") return { texte: [tx("Un extremum de f se trouve en un zéro de f′ où f′ CHANGE DE SIGNE : de + à −, maximum ; de − à +, minimum. Un zéro sans changement de signe donne un palier, pas un extremum.")] };
  if (p === "concavite") return { texte: [tx("La concavité se lit sur les VARIATIONS de f′ (f″ est la dérivée de f′) : f convexe là où f′ croît, concave là où f′ décroît.")] };
  return { texte: [tx("Un point d'inflexion de f est là où f″ change de signe : à un EXTREMUM de f′ (là où f′ passe de croissante à décroissante, ou l'inverse).")] };
}

export function aide2(e: E, p: PhaseGraphiqueDerivee): AideEcran | null {
  if (p === "signe") {
    if (e.zeros.length === 0) return { texte: [tx("Ici la courbe de f′ ne touche jamais l'axe des abscisses : regarde de quel côté de l'axe elle se trouve.")] };
    return { texte: [tx("Ici la courbe de f′ touche l'axe des abscisses en "), ...listeL(e.zeros.map((z) => z.x)), tx(" : regarde de quel côté de l'axe elle est entre ces points (et si elle traverse l'axe ou le touche seulement).")] };
  }
  if (p === "extremums") {
    if (e.zeros.length === 0) return { texte: [tx("Ici f′ ne s'annule jamais : f′ peut-elle changer de signe ?")] };
    return { texte: [tx("Pour chacun des zéros "), ...listeL(e.zeros.map((z) => z.x)), tx(", regarde le signe de f′ juste avant et juste après (ton tableau de signes).")] };
  }
  if (p === "concavite") return { texte: [tx("Repère le point le plus haut ou le plus bas de la courbe de f′ "), ...(e.inflexions.length > 1 ? [tx("(il y en a deux)")] : []), tx(" : avant et après, f′ monte-t-elle ou descend-elle ?")] };
  return { texte: [tx("Cherche les sommets (points le plus haut ou le plus bas localement) de la courbe de f′ — pas ses zéros.")] };
}

export function reponse(e: E, p: PhaseGraphiqueDerivee): Frag[] {
  if (p === "signe") return [lx(`f'(x)>0\\text{ sur }${ensembleL(ensemblePositif(e))}`), tx(" ; "), lx(`f'(x)<0\\text{ sur }${ensembleL(ensembleNegatif(e))}`)];
  if (p === "extremums") {
    const { maxima, minima } = extremums(e);
    return [tx("maximum local : "), ...listeL(maxima), tx(" ; minimum local : "), ...listeL(minima)];
  }
  if (p === "concavite") return [tx("f convexe sur "), lx(ensembleL(ensembleConvexe(e))), tx(" ; f concave sur "), lx(ensembleL(ensembleConcave(e)))];
  return [tx("points d'inflexion en "), ...listeL(e.inflexions)];
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhaseGraphiqueDerivee): string {
  if (p === "signe" || p === "concavite") return "Ensemble non reconnu : écris une réunion d'intervalles, par exemple ]−∞ ; 2[ ∪ ]5 ; +∞[, ou ℝ, ℝ \\ {1}, ∅. Cette saisie ne compte pas comme une tentative.";
  return "Abscisses non reconnues : écris un ou plusieurs nombres séparés par « ; » (par exemple −1 ; 3), ou « aucun ». Cette saisie ne compte pas comme une tentative.";
}
