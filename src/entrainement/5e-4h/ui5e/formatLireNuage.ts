import type { ExerciceLireNuage, FormeNuage, IntensiteNuage, NuageGenere, SensNuage } from "../core5e/lireNuage";
import { arrondi } from "../core5e/stat2vLotH1";
import type { AideEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { nL } from "./ecrituresStat2vLotH1";
import { figureNuage, planche } from "./figureNuageLotH1";

/**
 * Couche C — textes et figures de `5gen76` « Lire un nuage de points » : consignes, options des choix
 * fermés, aides à deux niveaux (propriété du cours, puis posée pour l'instance — jamais la réponse),
 * réponses, figures (énoncé SANS courbe, corrigé AVEC la courbe d'ajustement). Source unique de l'écran,
 * du papier et du corrigé.
 */

type E = ExerciceLireNuage;
export type PhaseLireNuage = "forme" | "sens" | "sensCorr" | "intensite" | "n1" | "n2" | "n3" | "n4";

export function phases(e: E): PhaseLireNuage[] {
  if (e.variante === "forme") return ["forme", "sens"];
  if (e.variante === "intensite") return ["sensCorr", "intensite"];
  return ["n1", "n2", "n3", "n4"];
}

export const indiceNuage = (p: PhaseLireNuage): number => Number(p.slice(1)) - 1;

// ============================================================================
// Figures.
// ============================================================================

function courbeModele(n: NuageGenere): { f: (x: number) => number }[] {
  const m = n.modele;
  if (!m) return [];
  if (m.genre === "droite") return [{ f: (x) => m.a * x + m.b }];
  if (m.genre === "parabole") return [{ f: (x) => m.c[0] * x * x + m.c[1] * x + m.c[2] }];
  return [{ f: (x) => 1 + m.c * m.q ** x }];
}

function unNuage(n: NuageGenere, avecModele: boolean, petit: boolean, numero?: string): string {
  return figureNuage({
    points: n.points,
    sansGraduations: true,
    largeur: petit ? 170 : 320,
    hauteur: petit ? 140 : 230,
    numero,
    // Marge d'une demi-unité : aucun point posé sur un axe (figures sans graduations).
    fenetre: { xmin: -0.5, xmax: 10.5, ymin: Math.min(-0.5, ...n.points.map((q) => q.y - 0.5)), ymax: Math.max(10, ...n.points.map((q) => q.y + 0.5)) },
    courbes: avecModele ? courbeModele(n) : [],
  });
}

/** Figure de l'énoncé : le nuage seul (ou les quatre nuages numérotés), aucune courbe. */
export function figureEnonce(e: E): string {
  if (e.variante !== "associer") return unNuage(e.nuages[0]!, false, false);
  return planche(e.nuages.map((n, i) => unNuage(n, false, true, `${i + 1}`)));
}

/** Écran « associer » : le nuage de l'écran seul, en grand et numéroté (la planche des quatre nuages, trop
 * petite sous le bandeau replié, reste celle du papier). */
export function figureNuageSeul(e: E, i: number): string {
  return unNuage(e.nuages[i]!, false, false, `${i + 1}`);
}

/** Corrigé : le même nuage avec sa courbe d'ajustement (droite des moindres carrés, parabole, exponentielle). */
export function figureCorrige(e: E, i = 0): string {
  return unNuage(e.nuages[i]!, true, false);
}

// ============================================================================
// Options.
// ============================================================================

const TEXTE_FORME: Record<FormeNuage, string> = {
  affine: "Les points sont à peu près alignés : ajustement affine (une droite).",
  arc: "Les points forment un arc : fonction du second degré (une parabole).",
  decolle: "Les points « décollent » : fonction exponentielle.",
  aucune: "Les points n'ont aucune forme : pas de relation entre x et y.",
};
const TEXTE_SENS: Record<SensNuage, string> = {
  croissant: "Quand x augmente, y a tendance à augmenter.",
  decroissant: "Quand x augmente, y a tendance à diminuer.",
  montePuisDescend: "y augmente puis diminue (ou diminue puis augmente).",
  aucun: "Aucune tendance : y ne varie pas régulièrement avec x.",
};
const TEXTE_INTENSITE: Record<IntensiteNuage | "nulle", string> = {
  forte: "Forte : les points sont très proches d'une droite.",
  moyenne: "Moyenne : les points suivent une droite, avec un écart net.",
  faible: "Faible : on devine à peine une tendance.",
  nulle: "Nulle : aucune tendance linéaire.",
};

const rL = (v: number): string => `r=${nL(v, 2)}`;

export function options(e: E, p: PhaseLireNuage): OptionEcran[] {
  if (p === "forme") return (Object.keys(TEXTE_FORME) as FormeNuage[]).map((id) => ({ id, fragments: [tx(TEXTE_FORME[id])] }));
  if (p === "sens") return (Object.keys(TEXTE_SENS) as SensNuage[]).map((id) => ({ id, fragments: [tx(TEXTE_SENS[id])] }));
  if (p === "sensCorr")
    return [
      { id: "positif", fragments: [tx("Corrélation positive : x et y varient dans le même sens.")] },
      { id: "negatif", fragments: [tx("Corrélation négative : quand x augmente, y diminue.")] },
    ];
  if (p === "intensite") return (Object.keys(TEXTE_INTENSITE) as (IntensiteNuage | "nulle")[]).map((id) => ({ id, fragments: [tx(TEXTE_INTENSITE[id])] }));
  return e.valeursR!.map((v, i) => ({ id: `v${i}`, fragments: [lx(rL(v))] }));
}

export function bonneOption(e: E, p: PhaseLireNuage): string {
  if (p === "forme") return e.forme!;
  if (p === "sens") return e.sens!;
  if (p === "sensCorr") return e.positif ? "positif" : "negatif";
  if (p === "intensite") return e.intensite!;
  return `v${e.bonnes![indiceNuage(p)]}`;
}

// ============================================================================
// Textes des écrans.
// ============================================================================

export const libelle = (_e: E, p: PhaseLireNuage): string => {
  if (p === "forme") return "Forme du nuage";
  if (p === "sens") return "Sens de variation";
  if (p === "sensCorr") return "Sens de la corrélation";
  if (p === "intensite") return "Intensité de la corrélation";
  return `Nuage ${indiceNuage(p) + 1}`;
};

/** Consigne générale ; `papier` : la planche des quatre nuages est sous l'énoncé (à l'écran, un nuage par écran). */
export function consigneGenerale(e: E, papier = false): Frag[] {
  if (e.variante === "forme") return [tx("Observe le nuage de points ci-dessous (une série statistique à deux variables x et y).")];
  if (e.variante === "intensite") return [tx("Observe le nuage de points ci-dessous : ses points sont à peu près alignés, un ajustement affine est justifié.")];
  const valeurs = e.valeursR!.flatMap((v, i) => [...(i > 0 ? [tx(i === 3 ? " et " : ", ")] : []), lx(rL(v))]);
  if (papier) return [tx("Voici quatre nuages de points, numérotés de 1 à 4, et quatre coefficients de corrélation : "), ...valeurs, tx(".")];
  return [
    tx("Quatre nuages de points, numérotés de 1 à 4, ont pour coefficients de corrélation, dans le désordre, "),
    ...valeurs,
    tx(". Chaque écran montre un de ces nuages."),
  ];
}

export function consigne(_e: E, p: PhaseLireNuage): Frag[] {
  if (p === "forme") return [tx("Y a-t-il une relation entre x et y ? Si oui, quelle fonction pourrait ajuster ce nuage ?")];
  if (p === "sens") return [tx("Comment y varie-t-il quand x augmente ?")];
  if (p === "sensCorr") return [tx("Quel est le sens de la corrélation entre x et y ?")];
  if (p === "intensite") return [tx("À l'œil, quelle est l'intensité de cette corrélation ?")];
  return [tx(`Quel est le coefficient de corrélation du nuage ${indiceNuage(p) + 1} ?`)];
}

export function aide1(_e: E, p: PhaseLireNuage): AideEcran {
  if (p === "forme") return { texte: [tx("Regarde l'allure générale des points, pas un point isolé : une droite, un arc comme une parabole, une courbe qui monte de plus en plus vite, ou rien de régulier.")] };
  if (p === "sens") return { texte: [tx("Parcours le nuage de gauche à droite (x augmente) et suis la hauteur des points.")] };
  if (p === "sensCorr") return { texte: [tx("Corrélation positive : le nuage monte de gauche à droite ; négative : il descend.")] };
  if (p === "intensite")
    return {
      texte: [tx("Plus les points sont serrés autour d'une droite, plus "), lx("|r|"), tx(" est proche de 1. Tableau du cours :")],
      latex: "|r|<0{,}35\\text{ nulle};\\ 0{,}35\\text{ à }0{,}60\\text{ faible};\\ 0{,}60\\text{ à }0{,}80\\text{ moyenne};\\ 0{,}80\\text{ à }0{,}98\\text{ forte}",
    };
  return { texte: [tx("Le signe de r donne le sens (nuage qui monte : "), lx("r>0"), tx(" ; qui descend : "), lx("r<0"), tx(") ; "), lx("|r|"), tx(" proche de 1 : points serrés autour d'une droite ; proche de 0 : aucune tendance.")] };
}

export function aide2(_e: E, p: PhaseLireNuage): AideEcran | null {
  if (p === "forme") return { texte: [tx("Imagine le trait qui passe au plus près des points : est-il droit ? Compare la montée (ou la descente) au début et à la fin du nuage.")] };
  if (p === "sens") return { texte: [tx("Compare la hauteur des points de gauche, du milieu et de droite du nuage.")] };
  if (p === "sensCorr") return { texte: [tx("Compare la hauteur des points les plus à gauche et celle des points les plus à droite.")] };
  if (p === "intensite") return { texte: [tx("Trace mentalement la droite qui passe au plus près des points : en sont-ils tout proches, un peu écartés, ou très dispersés autour d'elle ?")] };
  const k = indiceNuage(p) + 1;
  return { texte: [tx(`Nuage ${k} : regarde d'abord s'il monte ou descend (le signe), puis s'il est serré ou dispersé autour d'une droite. Compare-le aux trois autres nuages.`)] };
}

export function reponse(e: E, p: PhaseLireNuage): Frag[] {
  if (p === "forme") return [tx(TEXTE_FORME[e.forme!])];
  if (p === "sens") return [tx(TEXTE_SENS[e.sens!])];
  if (p === "sensCorr") return [tx(e.positif ? "Corrélation positive." : "Corrélation négative.")];
  if (p === "intensite") return [tx(`Corrélation ${e.intensite} (`), lx(`r\\approx${nL(arrondi(e.nuages[0]!.r, 2), 2)}`), tx(").")];
  const i = indiceNuage(p);
  return [tx(`Nuage ${i + 1} : `), lx(rL(e.valeursR![e.bonnes![i]!]!))];
}

/** Réponse courte de l'écran (rappels « Ce qu'on sait déjà », brève du papier). */
export function recap(e: E, p: PhaseLireNuage): Frag[] {
  if (p === "forme") return [tx({ affine: "ajustement affine", arc: "en arc (second degré)", decolle: "qui décolle (exponentielle)", aucune: "aucune relation" }[e.forme!])];
  if (p === "sens") return [tx({ croissant: "y augmente", decroissant: "y diminue", montePuisDescend: "augmente puis diminue (ou l'inverse)", aucun: "aucune tendance" }[e.sens!])];
  if (p === "sensCorr") return [tx(e.positif ? "positive" : "négative")];
  if (p === "intensite") return [tx(e.intensite!)];
  const i = indiceNuage(p);
  return [lx(rL(e.valeursR![e.bonnes![i]!]!))];
}

export function explicationChoix(e: E, p: PhaseLireNuage): string {
  if (p === "forme") return e.forme === "aucune" ? "Aucune courbe régulière ne suit ces points." : "Regarde le corrigé : la courbe d'ajustement y est tracée.";
  if (p === "intensite") return `Le coefficient réel de ce nuage vaut environ ${nL(arrondi(e.nuages[0]!.r, 2), 2).replace("{,}", ",").replace("-", "−")}.`;
  return "";
}
