import type { ExerciceMeilleurAjustement } from "../core5e/meilleurAjustement";
import { droiteSans, previsionSans, resumeSans, resumeTous, sommes } from "../core5e/meilleurAjustement";
import type { Droite } from "../core5e/statistiqueLotH2";
import { moyenne, resume } from "../core5e/statistiqueLotH2";
import type { AideEcran, ChampEcran, Frag, OptionEcran, TableauDonnees } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import type { SpecNuage } from "./figureNuageLotH2";
import { COULEUR_DROITE, COULEUR_DROITE2, nuageSvg } from "./figureNuageLotH2";
import { nPlus, droiteL, egalOuEnviron, nL, nP, nT, precisionTexte } from "./nombresStatLotH2";

/**
 * Couche C — textes de `5gen79` « Quel est le meilleur ajustement ? » : contextes, tableau, consignes,
 * champs, options, aides à deux niveaux, réponses, figure. Source unique de l'écran, du récapitulatif,
 * du corrigé et du papier.
 */

type E = ExerciceMeilleurAjustement;
export type PhaseMeilleur = "ecart" | "pointMoyen" | "somme1" | "somme2" | "verdict" | "repere" | "correlations" | "droite" | "prevision";

export function phases(e: E): PhaseMeilleur[] {
  if (e.variante === "deuxDroites") return ["ecart", "somme1", "somme2", "verdict"];
  if (e.variante === "mayerMoindres") return ["pointMoyen", "somme1", "somme2", "verdict"];
  return ["repere", "correlations", "droite", "prevision"];
}

interface Contexte {
  texte: string;
  enteteX: string;
  enteteY: string;
  titreX: string;
  titreY: string;
}

const CONTEXTES_DEUX: Contexte[] = [
  { texte: "Le comité culturel d'une petite ville veut créer un club de cinéma. On a demandé à 100 parents le prix qu'ils seraient prêts à payer pour une place : le tableau donne, pour chaque prix x (en €), le nombre y de parents d'accord.", enteteX: "Prix x (€)", enteteY: "Parents y", titreX: "Prix (€)", titreY: "Parents" },
  { texte: "Le tableau donne le nombre x d'heures de révision et la note y (sur 20) obtenue par six élèves à une interrogation.", enteteX: "Révision x (h)", enteteY: "Note y", titreX: "Révision (h)", titreY: "Note" },
  { texte: "Le tableau donne l'âge x (en années) et le prix de revente y (en milliers d'euros) de six voitures d'un même modèle.", enteteX: "Âge x (ans)", enteteY: "Prix y (milliers d'€)", titreX: "Âge (ans)", titreY: "Prix (milliers d'€)" },
];

const CONTEXTES_MAYER: Contexte[] = [
  { texte: "Le tableau donne le nombre x d'heures de révision et la note y (sur 30) obtenue par six élèves à une interrogation.", enteteX: "Révision x (h)", enteteY: "Note y (sur 30)", titreX: "Révision (h)", titreY: "Note (sur 30)" },
  { texte: "Dans une école, l'économe a relevé, pour six journées d'hiver, la température moyenne x (en °C) et le nombre y de boissons fraîches vendues.", enteteX: "Température x (°C)", enteteY: "Boissons y", titreX: "Température (°C)", titreY: "Boissons" },
  { texte: "Un magasin a relevé, pendant six mois, son budget de publicité x (en centaines d'euros) et ses ventes y (en centaines d'articles).", enteteX: "Publicité x", enteteY: "Ventes y", titreX: "Publicité (centaines d'€)", titreY: "Ventes (centaines)" },
];

export interface ContexteAberrant extends Contexte {
  da: number;
  db: number;
  dp: number;
  unite: string;
  question: (x: string, pr: string) => string;
}

export const CONTEXTES_ABERRANT: ContexteAberrant[] = [
  {
    texte: "Un glacier relève, pendant huit semaines d'été, la température maximale moyenne x (en °C) et le nombre moyen y de glaces vendues par jour. L'une de ces semaines, des travaux ont bloqué la rue devant la boutique.",
    enteteX: "Température x (°C)", enteteY: "Glaces par jour y", titreX: "Température (°C)", titreY: "Glaces par jour",
    da: 2, db: 1, dp: 0, unite: "glaces",
    question: (x, pr) => `Avec cette droite, estime le nombre moyen de glaces vendues par jour lors d'une semaine à ${x} °C (${pr}).`,
  },
  {
    texte: "Une agence immobilière relève la superficie x (en m²) et le loyer mensuel y (en €) de huit appartements d'un même quartier. L'un d'eux est un logement à loyer modéré, loué moins cher par la commune.",
    enteteX: "Superficie x (m²)", enteteY: "Loyer y (€)", titreX: "Superficie (m²)", titreY: "Loyer (€)",
    da: 2, db: 1, dp: 0, unite: "€",
    question: (x, pr) => `Avec cette droite, estime le loyer d'un appartement de ${x} m² de ce quartier (en €, ${pr}).`,
  },
  {
    texte: "Un professeur relève, pour huit élèves, le temps x (en heures) consacré à préparer une interrogation et la note y obtenue (sur 20). L'un des élèves était malade le jour de l'interrogation.",
    enteteX: "Préparation x (h)", enteteY: "Note y", titreX: "Préparation (h)", titreY: "Note (sur 20)",
    da: 3, db: 2, dp: 1, unite: "",
    question: (x, pr) => `Avec cette droite, estime la note d'un élève qui a préparé l'interrogation pendant ${x} h (${pr}).`,
  },
  {
    texte: "Un garage relève le kilométrage x (en milliers de km) et le prix de vente y (en €) de huit voitures d'occasion du même modèle. L'une d'elles a été accidentée.",
    enteteX: "Kilométrage x (milliers de km)", enteteY: "Prix y (€)", titreX: "Kilométrage (milliers de km)", titreY: "Prix (€)",
    da: 1, db: 0, dp: 0, unite: "€",
    question: (x, pr) => `Avec cette droite, estime le prix d'une voiture de ce modèle qui a roulé ${x} milliers de km (en €, ${pr}).`,
  },
];

export function contexte(e: E): Contexte {
  if (e.variante === "deuxDroites") return CONTEXTES_DEUX[e.contexte]!;
  if (e.variante === "mayerMoindres") return CONTEXTES_MAYER[e.contexte]!;
  return CONTEXTES_ABERRANT[e.contexte]!;
}
export const contexteAberrant = (e: E): ContexteAberrant => CONTEXTES_ABERRANT[e.contexte]!;

/** Équation d'une droite proposée (coefficients au dixième ou au centième, exacts). */
export const droitePL = (d: Droite) => droiteL(d.a, d.b, 2, 2);
export const nomD = (i: number) => `d_${i + 1}`;
export const pointL = (x: number, y: number) => `(${nL(x, 2)}\\,;${nL(y, 2)})`;

export function tableau(e: E): TableauDonnees {
  const c = contexte(e);
  return { horizontal: true, entetes: [[tx(c.enteteX)], [tx(c.enteteY)]], lignes: e.points.map((p) => [nT(p.x, 2), nT(p.y, 2)]) };
}

export function situation(e: E): Frag[] {
  const c = contexte(e);
  if (e.variante === "deuxDroites")
    return [tx(`${c.texte} Pour ajuster le nuage, Léa propose la droite `), lx(`d_1 : ${droitePL(e.droites[0])}`), tx(" et Tom la droite "), lx(`d_2 : ${droitePL(e.droites[1])}`), tx(".")];
  if (e.variante === "mayerMoindres")
    return [tx(`${c.texte} Deux droites ajustent ce nuage : `), lx(`d_1 : ${droitePL(e.droites[0])}`), tx(" et "), lx(`d_2 : ${droitePL(e.droites[1])}`), tx(". L'une est la droite de Mayer, l'autre la droite des moindres carrés.")];
  return [tx(c.texte)];
}

export function consigneGenerale(e: E): Frag[] {
  if (e.variante === "deuxDroites") return [...situation(e), tx(" Laquelle ajuste le mieux le nuage au sens des moindres carrés ?")];
  if (e.variante === "mayerMoindres") return [...situation(e), tx(" Laquelle est la droite des moindres carrés ?")];
  return [...situation(e), tx(" Utilise ta calculatrice (mode « 2-Var Stats »).")];
}

export function libelle(e: E, p: PhaseMeilleur): string {
  switch (p) {
    case "ecart":
      return "Écart vertical d'un point";
    case "pointMoyen":
      return "Point moyen G";
    case "somme1":
      return "S₁ (droite d₁)";
    case "somme2":
      return "S₂ (droite d₂)";
    case "verdict":
      return e.variante === "deuxDroites" ? "Meilleur ajustement" : "Droite des moindres carrés";
    case "repere":
      return "Point aberrant";
    case "correlations":
      return "r avec et sans le point";
    case "droite":
      return "Droite sans le point";
    case "prevision":
      return "Prévision";
  }
}

export const pointEcart = (e: E) => e.points[e.indiceEcart]!;
export const ecartAttendu = (e: E) => {
  const p = pointEcart(e);
  return p.y - (e.droites[0].a * p.x + e.droites[0].b);
};

export function consigne(e: E, p: PhaseMeilleur): Frag[] {
  const ca = contexteAberrant(e);
  switch (p) {
    case "ecart": {
      const q = pointEcart(e);
      return [tx("Pour le point "), lx(pointL(q.x, q.y)), tx(", calcule l'écart vertical à "), lx("d_1"), tx(", c'est-à-dire la différence "), lx("y-(ax+b)"), tx(" entre son ordonnée et celle du point de "), lx("d_1"), tx(" de même abscisse.")];
    }
    case "pointMoyen":
      return [tx("Calcule les coordonnées du point moyen "), lx("G(\\bar{x}\\,;\\bar{y})"), tx(" du nuage.")];
    case "somme1":
      return [tx("Calcule "), lx("S_1"), tx(", la somme des carrés des écarts verticaux des six points à la droite "), lx("d_1"), tx(e.variante === "mayerMoindres" ? " (au centième)." : ".")];
    case "somme2":
      return [tx("Calcule de même "), lx("S_2"), tx(" pour la droite "), lx("d_2"), tx(e.variante === "mayerMoindres" ? " (au centième)." : ".")];
    case "verdict":
      return e.variante === "deuxDroites" ? [tx("Quelle droite ajuste le mieux le nuage ?")] : [tx("Laquelle des deux droites est la droite des moindres carrés ?")];
    case "repere":
      return [tx("Regarde le nuage : quel point semble aberrant (expliqué par le contexte) ?")];
    case "correlations":
      return [tx("Calcule le coefficient de corrélation "), lx("r"), tx(" avec les huit points, puis sans le point aberrant (au millième).")];
    case "droite":
      return [tx("Détermine la droite des moindres carrés "), lx("y=ax+b"), tx(` des sept autres points : a ${precisionTexte(ca.da)}, b ${precisionTexte(ca.db)}.`)];
    case "prevision":
      return [tx(ca.question(nT(e.x0, 2), precisionTexte(ca.dp)))];
  }
}

export function champs(e: E, p: PhaseMeilleur): ChampEcran[] {
  switch (p) {
    case "ecart":
      return [{ label: "écart", labelLatex: "y-(ax+b)=", placeholder: "ex. : −0,7" }];
    case "pointMoyen":
      return [
        { label: "x̄", labelLatex: "\\bar{x}=", placeholder: "ex. : 5,5" },
        { label: "ȳ", labelLatex: "\\bar{y}=", placeholder: "ex. : 11,25" },
      ];
    case "somme1":
      return [{ label: "S₁", labelLatex: "S_1=", placeholder: "ex. : 4,86" }];
    case "somme2":
      return [{ label: "S₂", labelLatex: "S_2=", placeholder: "ex. : 4,86" }];
    case "correlations":
      return [
        { label: "r avec les huit points", labelLatex: "r_{\\text{tous}}=", placeholder: "ex. : 0,812" },
        { label: "r sans le point aberrant", labelLatex: "r_{\\text{sans}}=", placeholder: "ex. : 0,975" },
      ];
    case "droite":
      return [
        { label: "a", labelLatex: "a=", placeholder: "ex. : 9,84" },
        { label: "b", labelLatex: "b=", placeholder: "ex. : 215,3" },
      ];
    case "prevision":
      return [{ label: "prévision", labelLatex: "y\\approx", unite: contexteAberrant(e).unite || undefined, placeholder: "ex. : 640" }];
    default:
      return [];
  }
}

export function optionsVerdict(e: E): OptionEcran[] {
  if (e.variante === "deuxDroites")
    return [
      { id: "d1", fragments: [tx("La droite "), lx("d_1"), tx(" de Léa, car "), lx("S_1<S_2"), tx(".")] },
      { id: "d2", fragments: [tx("La droite "), lx("d_2"), tx(" de Tom, car "), lx("S_2<S_1"), tx(".")] },
      { id: "plusPoints", fragments: [tx("Celle qui passe exactement par le plus grand nombre de points du tableau.")] },
      { id: "sansCarres", fragments: [tx("On ne peut pas conclure : il faudrait comparer les sommes des écarts, sans les élever au carré.")] },
    ];
  return [
    { id: "d1", fragments: [lx("d_1"), tx(", car "), lx("S_1<S_2"), tx(" : la droite des moindres carrés a la plus petite somme possible.")] },
    { id: "d2", fragments: [lx("d_2"), tx(", car "), lx("S_2<S_1"), tx(" : la droite des moindres carrés a la plus petite somme possible.")] },
    { id: "G", fragments: [tx("On ne peut pas savoir : les deux droites passent par le point moyen "), lx("G"), tx(".")] },
    { id: "grandeS", fragments: [tx("Celle qui a la plus grande somme : elle tient mieux compte des points éloignés.")] },
  ];
}

export function optionsRepere(e: E): OptionEcran[] {
  return e.candidats.map((i) => ({ id: `P${i}`, fragments: [tx("Le point "), lx(pointL(e.points[i]!.x, e.points[i]!.y))] }));
}

export const bonneVerdict = (e: E) => (e.gagnante === 0 ? "d1" : "d2");
export const bonneRepere = (e: E) => `P${e.indiceAberrant}`;

export function aide1(e: E, p: PhaseMeilleur): AideEcran {
  switch (p) {
    case "ecart":
      return { texte: [tx("Calcule d'abord l'ordonnée du point de la droite de même abscisse (remplace x dans l'équation), puis retire-la de l'ordonnée du point.")] };
    case "pointMoyen":
      return { texte: [tx("Le point moyen a pour coordonnées la moyenne des x et la moyenne des y :")], latex: "\\bar{x}=\\dfrac{x_1+\\cdots+x_n}{n}\\qquad\\bar{y}=\\dfrac{y_1+\\cdots+y_n}{n}" };
    case "somme1":
    case "somme2":
      return { texte: [tx("Pour chaque point, calcule l'écart vertical, élève-le au carré, puis additionne les six carrés :")], latex: "S=\\sum_{i=1}^{n}\\bigl(y_i-(ax_i+b)\\bigr)^2" };
    case "verdict":
      return e.variante === "deuxDroites"
        ? { texte: [tx("Au sens des moindres carrés, le meilleur ajustement est celui dont la somme des carrés des écarts verticaux est la plus petite.")] }
        : { texte: [tx("La droite des moindres carrés est, par définition, celle qui rend la somme des carrés des écarts verticaux minimale. Les deux droites passent par G : ce n'est pas ce qui les distingue.")] };
    case "repere":
      return { texte: [tx("Un point aberrant est loin de la tendance des autres points ; ici, le contexte annonce un événement exceptionnel qui le fait baisser.")] };
    case "correlations":
      return { texte: [tx("Saisis les huit points (x dans L1, y dans L2) et lance « 2-Var Stats » ; puis supprime le point aberrant des deux listes et recommence.")] };
    case "droite":
      return { texte: [tx("Avec les sept points restants, « 2-Var Stats » affiche a et b de la droite des moindres carrés.")] };
    case "prevision":
      return { texte: [tx("Remplace x par la valeur donnée dans l'équation de la droite obtenue sans le point aberrant.")] };
  }
}

export function aide2(e: E, p: PhaseMeilleur): AideEcran | null {
  switch (p) {
    case "ecart": {
      const q = pointEcart(e);
      const d = e.droites[0];
      return { texte: [tx("Ici :")], latex: `${nL(q.y, 2)}-\\bigl(${nL(d.a, 2)}\\cdot ${nP(q.x, 2)}${nPlus(d.b, 2)}\\bigr)` };
    }
    case "pointMoyen":
      return { texte: [tx("Ici :")], latex: `\\bar{x}=\\dfrac{${e.points.map((q) => nL(q.x, 2)).join("+")}}{6}\\qquad\\bar{y}=\\dfrac{${e.points.map((q) => nL(q.y, 2)).join("+")}}{6}` };
    case "somme1":
    case "somme2": {
      const d = e.droites[p === "somme1" ? 0 : 1];
      const q = e.points[0]!;
      return { texte: [tx("Premier terme de la somme, pour le point "), lx(pointL(q.x, q.y)), tx(" :")], latex: `\\bigl(${nL(q.y, 2)}-(${nL(d.a, 2)}\\cdot ${nP(q.x, 2)}${nPlus(d.b, 2)})\\bigr)^2=${nP(q.y - (d.a * q.x + d.b), 2)}^2` };
    }
    case "verdict": {
      const [s1, s2] = sommes(e);
      return { texte: [tx("Compare les deux sommes trouvées : "), lx(`S_1\\approx ${nL(s1, 2)}`), tx(" et "), lx(`S_2\\approx ${nL(s2, 2)}`), tx(".")] };
    }
    case "repere":
      return { texte: [tx("Cherche le point le plus éloigné de la droite que dessineraient les sept autres points.")] };
    case "correlations":
      return { texte: [tx(`Ici, le point aberrant est ${nT(e.points[e.indiceAberrant]!.x, 2)} ; ${nT(e.points[e.indiceAberrant]!.y, 2)} : retire-le. Sans lui, r doit se rapprocher de 1 ou de −1.`)] };
    case "droite":
      return { texte: [tx("Formules du cours, avec les sept points :")], latex: "a=\\dfrac{\\operatorname{Cov}(x,y)}{V(x)}\\qquad b=\\bar{y}-a\\,\\bar{x}" };
    case "prevision": {
      const ca = contexteAberrant(e);
      const d = droiteSans(e);
      return { texte: [tx("Ici :")], latex: `y=${nL(d.a, ca.da, true)}\\cdot ${nP(e.x0, 2)}${nPlus(d.b, ca.db, true)}` };
    }
  }
}

export function messageIllisible(_e: E, _p: PhaseMeilleur): string {
  return "Nombre non reconnu : écris un nombre décimal comme 4,86 ou −0,7 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, p: PhaseMeilleur): Frag[] {
  const [s1, s2] = sommes(e);
  switch (p) {
    case "ecart":
      return [lx(`y-(ax+b)=${nL(ecartAttendu(e), 2)}`)];
    case "pointMoyen": {
      const s = resume(e.points);
      return [lx(`G(${nL(s.mx, 2)}\\,;${nL(s.my, 2)})`)];
    }
    case "somme1":
      return [lx(`S_1${egalOuEnviron(s1, 2)}`)];
    case "somme2":
      return [lx(`S_2${egalOuEnviron(s2, 2)}`)];
    case "verdict":
      return optionsVerdict(e).find((o) => o.id === bonneVerdict(e))!.fragments;
    case "repere": {
      const q = e.points[e.indiceAberrant]!;
      return [tx("Le point "), lx(pointL(q.x, q.y))];
    }
    case "correlations":
      return [lx(`r_{\\text{tous}}\\approx ${nL(resumeTous(e).r, 3, true)}`), tx(" ; "), lx(`r_{\\text{sans}}\\approx ${nL(resumeSans(e).r, 3, true)}`)];
    case "droite": {
      const ca = contexteAberrant(e);
      const d = droiteSans(e);
      return [lx(droiteL(d.a, d.b, ca.da, ca.db, "y", "x", true))];
    }
    case "prevision": {
      const ca = contexteAberrant(e);
      return [lx(`y\\approx ${nL(previsionSans(e), ca.dp, true)}`), tx(ca.unite ? ` ${ca.unite}` : "")];
    }
  }
}

export function recap(e: E, p: PhaseMeilleur): Frag[] {
  if (p === "verdict") return e.variante === "deuxDroites" ? [lx(e.gagnante === 0 ? "d_1" : "d_2"), tx(" (plus petite somme)")] : [lx(e.gagnante === 0 ? "d_1" : "d_2"), tx(" est la droite des moindres carrés")];
  return reponse(e, p);
}

export function explicationChoix(e: E, p: PhaseMeilleur): string {
  if (p === "verdict") {
    const [s1, s2] = sommes(e);
    return `S₁ ≈ ${nT(s1, 2)} et S₂ ≈ ${nT(s2, 2)} : la plus petite somme désigne ${e.variante === "deuxDroites" ? "le meilleur ajustement" : "la droite des moindres carrés"}.`;
  }
  if (p === "repere") return "C'est le point le plus éloigné de la tendance des sept autres.";
  return "";
}

/* ----------------------------------------------------------------------------------------------
 * Figure
 * -------------------------------------------------------------------------------------------- */

export function specFigure(e: E, p: PhaseMeilleur | "fin"): SpecNuage {
  const c = contexte(e);
  const base: SpecNuage = { points: e.points, titreX: c.titreX, titreY: c.titreY };
  if (e.variante !== "aberrant")
    return {
      ...base,
      droites: [
        { ...e.droites[0], couleur: COULEUR_DROITE, label: "d₁" },
        { ...e.droites[1], couleur: COULEUR_DROITE2, label: "d₂", pointilles: true },
      ],
      ...(p === "fin" && e.variante === "mayerMoindres" ? { marques: [{ x: moyenne(e.points.map((q) => q.x)), y: moyenne(e.points.map((q) => q.y)), label: "G", croix: true, couleur: "#212529" }] } : {}),
    };
  const ordre = phases(e);
  const k = p === "fin" ? ordre.length : ordre.indexOf(p);
  const tous = resumeTous(e);
  const sans = droiteSans(e);
  return {
    ...base,
    entoures: k >= 1 ? [e.indiceAberrant] : [],
    droites: k >= 3 ? [
      { a: tous.a, b: tous.b, couleur: "#868e96", pointilles: true, label: "avec" },
      { ...sans, couleur: COULEUR_DROITE, label: "sans" },
    ] : [],
    ...(p === "fin" ? { marques: [{ x: e.x0, y: previsionSans(e), label: "prévision", couleur: COULEUR_DROITE2 }] } : {}),
  };
}

export const figure = (e: E, p: PhaseMeilleur) => nuageSvg(specFigure(e, p));
export const figureFin = (e: E) => nuageSvg(specFigure(e, "fin"));
