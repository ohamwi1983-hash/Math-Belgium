import type { Exercice124, Phase124 } from "../core6e/pointsRemarquablesEuler";
import { G124, H124, N124, PHASES_124, hauteurA, hauteurC, mediatriceAB, mediatriceBC } from "../core6e/pointsRemarquablesEuler";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { P } from "./outilsLieuxLotH1";
import { ILLISIBLE, apercuDroite, apercuPoint, coordL, equationCours, figureAuto, l, milieu, nb, t, vec } from "./outilsLieuxLotH1";

/**
 * Couche C — textes de `6gen124` « Points remarquables et droite d'Euler » : énoncé (trois sommets
 * entiers), six écrans à champ (G, médiatrice de [AB], O, hauteur issue de C, H, N), aides à deux
 * niveaux (propriété du cours, puis posée pour l'instance — jamais le résultat), réponses attendues,
 * figure du repère (triangle, puis les objets DÉJÀ confirmés : jamais la réponse de l'écran).
 */

type E = Exercice124;
type Ph = Phase124;

export const pt = (nom: string, p: P) => `${nom}${coordL(p)}`;
export const colonneL = (v: P) => `\\begin{pmatrix}${nb(v.x)}\\\\${nb(v.y)}\\end{pmatrix}`;

export const phases124 = (): Ph[] => PHASES_124;

export function situation124(e: E): Frag[] {
  return [t("Dans un repère orthonormé, on donne les points "), l(pt("A", e.A)), t(", "), l(pt("B", e.B)), t(" et "), l(pt("C", e.C)), t(".")];
}

export function consigneGlobale124(): Frag[] {
  return [
    t("Calcule les coordonnées du centre de gravité G du triangle ABC. Établis une équation cartésienne de la médiatrice de [AB] et de la hauteur issue de C. Calcule ensuite les coordonnées du centre O du cercle circonscrit, de l'orthocentre H et du centre N du cercle des neuf points, puis vérifie que O, G et H sont alignés."),
  ];
}

export const consigneGenerale124 = (e: E): Frag[] => [...situation124(e), t(" "), ...consigneGlobale124()];

const LIBELLES: Record<Ph, string> = {
  G: "Centre de gravité G",
  mediatrice: "Médiatrice de [AB]",
  O: "Centre O du cercle circonscrit",
  hauteur: "Hauteur issue de C",
  H: "Orthocentre H",
  N: "Centre N du cercle des neuf points",
};
export const libelle124 = (_e: E, p: Ph) => LIBELLES[p];

export function consigne124(_e: E, p: Ph): Frag[] {
  switch (p) {
    case "G":
      return [t("Calcule les coordonnées du centre de gravité G du triangle ABC.")];
    case "mediatrice":
      return [t("Établis une équation cartésienne de la médiatrice de [AB].")];
    case "O":
      return [t("Calcule les coordonnées du centre O du cercle circonscrit au triangle ABC.")];
    case "hauteur":
      return [t("Établis une équation cartésienne de la hauteur issue de C.")];
    case "H":
      return [t("Calcule les coordonnées de l'orthocentre H du triangle ABC.")];
    case "N":
      return [t("Calcule les coordonnées du centre N du cercle des neuf points (cercle d'Euler).")];
  }
}

export const estPhasePoint = (p: Ph) => p === "G" || p === "O" || p === "H" || p === "N";

export function champs124(_e: E, p: Ph): ChampEcran[] {
  if (estPhasePoint(p)) return [{ label: `Coordonnées de ${p}`, labelLatex: `${p}=`, placeholder: "(… ; …)", apercuLatex: apercuPoint }];
  return [{ label: LIBELLES[p], placeholder: "équation, avec « = »", apercuLatex: apercuDroite }];
}

export const messageIllisible124 = (_e: E, p: Ph) => (estPhasePoint(p) ? ILLISIBLE.point : ILLISIBLE.droite);

export function pointAttendu(e: E, p: Ph): P {
  return p === "G" ? G124(e) : p === "O" ? e.O : p === "H" ? H124(e) : N124(e);
}

export function reponse124(e: E, p: Ph): Frag[] {
  if (estPhasePoint(p)) return [l(pt(p, pointAttendu(e, p)))];
  const d = p === "mediatrice" ? mediatriceAB(e) : hauteurC(e);
  return [l(equationCours(d))];
}

export const recap124 = reponse124;

export function aide1_124(_e: E, p: Ph): AideEcran {
  switch (p) {
    case "G":
      return { texte: [t(`Cours, point 1 : le centre de gravité a pour coordonnées la moyenne des coordonnées des trois sommets :`)], latex: "G\\left(\\dfrac{x_A+x_B+x_C}{3}\\,;\\dfrac{y_A+y_B+y_C}{3}\\right)" };
    case "mediatrice":
      return { texte: [t(`Cours, point 1 : la médiatrice de [AB] passe par le milieu M de [AB] et elle est perpendiculaire à (AB) ; le vecteur `), l("\\vec{AB}"), t(" en est donc un vecteur normal :")], latex: "x_{\\vec{AB}}\\,(x-x_M)+y_{\\vec{AB}}\\,(y-y_M)=0" };
    case "O":
      return { texte: [t(`Cours, point 1 : le centre du cercle circonscrit est le point de concours des médiatrices ; il suffit d'en couper deux.`)] };
    case "hauteur":
      return { texte: [t(`Cours, point 1 : la hauteur issue de C passe par C et elle est perpendiculaire à (AB) ; le vecteur `), l("\\vec{AB}"), t(" en est un vecteur normal :")], latex: "x_{\\vec{AB}}\\,(x-x_C)+y_{\\vec{AB}}\\,(y-y_C)=0" };
    case "H":
      return { texte: [t(`Cours, point 1 : l'orthocentre est le point de concours des hauteurs ; il suffit d'en couper deux.`)] };
    case "N":
      return { texte: [t(`Cours, point 1 : le centre du cercle des neuf points est le milieu du segment [OH] ; il est sur la droite d'Euler.`)] };
  }
}

export function aide2_124(e: E, p: Ph): AideEcran | null {
  const M = milieu(e.A, e.B);
  switch (p) {
    case "G":
      return { texte: [t("Ici, additionne les trois abscisses, puis les trois ordonnées :")], latex: `x_G=\\dfrac{${nb(e.A.x)}+${nbS(e.B.x)}+${nbS(e.C.x)}}{3}` };
    case "mediatrice":
      return { texte: [t("Ici, le milieu de [AB] est "), l(pt("M", M)), t(" et "), l(`\\vec{AB}${colonneL(vec(e.A, e.B))}`), t(" : remplace dans l'équation, puis développe.")] };
    case "O":
      return { texte: [t("Ici, la médiatrice de [BC] passe par "), l(coordL(milieu(e.B, e.C))), t(" et a pour vecteur normal "), l(`\\vec{BC}${colonneL(vec(e.B, e.C))}`), t(" ; résous le système qu'elle forme avec la médiatrice de [AB] (écran précédent).")] };
    case "hauteur":
      return { texte: [t("Ici, la hauteur passe par "), l(pt("C", e.C)), t(" et a pour vecteur normal "), l(`\\vec{AB}${colonneL(vec(e.A, e.B))}`), t(".")] };
    case "H":
      return { texte: [t("Ici, la hauteur issue de A passe par "), l(pt("A", e.A)), t(" et a pour vecteur normal "), l(`\\vec{BC}${colonneL(vec(e.B, e.C))}`), t(" ; coupe-la avec la hauteur issue de C (écran précédent).")] };
    case "N":
      return { texte: [t("Ici, prends le milieu de "), l(pt("O", e.O)), t(" et de "), l(pt("H", H124(e))), t(".")] };
  }
}

/** « +3 » ou « +(−2) » dans une somme écrite. */
function nbS(v: number): string {
  return v < 0 ? `(${nb(v)})` : nb(v);
}

/** Figure de l'écran : le triangle, puis les objets confirmés aux écrans précédents. */
export function figure124(e: E, p: Ph | "fin"): string {
  const idx = p === "fin" ? PHASES_124.length : PHASES_124.indexOf(p);
  const fait = (q: Ph) => PHASES_124.indexOf(q) < idx;
  const G = G124(e);
  const H = H124(e);
  const N = N124(e);
  const cadre = [e.A, e.B, e.C, H, e.O];
  const points: { P: P; label?: string; couleur?: string }[] = [
    { P: e.A, label: "A" },
    { P: e.B, label: "B" },
    { P: e.C, label: "C" },
  ];
  const droites: { d: { a: number; b: number; c: number }; couleur?: string; pointille?: boolean; epaisseur?: number }[] = [];
  if (fait("G")) points.push({ P: G, label: "G", couleur: "#2f7d32" });
  if (fait("mediatrice")) droites.push({ d: mediatriceAB(e), couleur: "#1f5fa8", pointille: true, epaisseur: 1.4 });
  if (fait("O")) points.push({ P: e.O, label: "O", couleur: "#1f5fa8" });
  if (fait("hauteur")) droites.push({ d: hauteurC(e), couleur: "#c2410c", pointille: true, epaisseur: 1.4 });
  if (fait("H")) points.push({ P: H, label: "H", couleur: "#c2410c" });
  const fin = p === "fin";
  if (fin) {
    droites.push({ d: mediatriceBC(e), couleur: "#1f5fa8", pointille: true, epaisseur: 1.1 }, { d: hauteurA(e), couleur: "#c2410c", pointille: true, epaisseur: 1.1 });
    points.push({ P: N, label: "N", couleur: "#6b7280" });
  }
  const euler = fin ? [{ d: { a: -(H.y - e.O.y), b: H.x - e.O.x, c: (H.y - e.O.y) * e.O.x - (H.x - e.O.x) * e.O.y }, couleur: "#1b1d22", epaisseur: 1.6 }] : [];
  return figureAuto(
    {
      segments: [
        { A: e.A, B: e.B, epaisseur: 2 },
        { A: e.B, B: e.C, epaisseur: 2 },
        { A: e.C, B: e.A, epaisseur: 2 },
      ],
      droites: [...droites, ...euler],
      cercles: fin ? [{ centre: e.O, rayon: Math.sqrt(e.R2), couleur: "#9db7d8" }] : [],
      points,
    },
    fin ? [...cadre, { x: e.O.x - Math.sqrt(e.R2), y: e.O.y - Math.sqrt(e.R2) }, { x: e.O.x + Math.sqrt(e.R2), y: e.O.y + Math.sqrt(e.R2) }] : [e.A, e.B, e.C, ...(idx > 2 ? [e.O] : []), ...(idx > 4 ? [H] : [])],
  );
}
