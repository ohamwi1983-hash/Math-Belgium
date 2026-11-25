import type { ExerciceModeliserPrevoir } from "../core5e/modeliserPrevoir";
import { abscisseSeuil, prevision, xMax, xMin } from "../core5e/modeliserPrevoir";
import { arrondi, mayer } from "../core5e/statistiqueLotH2";
import type { AideEcran, ChampEcran, Frag, OptionEcran, TableauDonnees } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import type { SpecNuage } from "./figureNuageLotH2";
import { COULEUR_DROITE, COULEUR_DROITE2, nuageSvg } from "./figureNuageLotH2";
import { droiteL, egalOuEnviron, nL, nP, nT, precisionTexte } from "./nombresStatLotH2";

/**
 * Couche C — textes de `5gen78` « Modéliser et prévoir en contexte » : situation, tableau, consignes
 * des six écrans, champs, options, aides à deux niveaux, réponses, figure. Source unique de l'écran,
 * du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceModeliserPrevoir;
export type PhaseModeliser = "equation" | "correlation" | "fiabilite" | "prevision" | "nature" | "seuil";
export const PHASES_MODELISER: PhaseModeliser[] = ["equation", "correlation", "fiabilite", "prevision", "nature", "seuil"];

interface Contexte {
  situation: string;
  enteteX: Frag[];
  enteteY: Frag[];
  titreX: string;
  titreY: string;
  uniteX: string;
  uniteY: string;
}

export function contexte(e: E): Contexte {
  switch (e.variante) {
    case "dilatation":
      return {
        situation: "Lors d'un laboratoire, on chauffe une barre métallique qui mesure 10 m avant d'être chauffée, et on relève son allongement à différentes températures.",
        enteteX: [tx("Température (°C)")],
        enteteY: [tx("Allongement (mm)")],
        titreX: "Température (°C)",
        titreY: "Allongement (mm)",
        uniteX: "°C",
        uniteY: "mm",
      };
    case "grue":
      return {
        situation: "Pour louer la grue adaptée à son prochain chantier, une entreprise étudie plusieurs longueurs de flèche d'un même type de grue et la charge maximale que la grue peut alors soulever.",
        enteteX: [tx("Longueur de la flèche (m)")],
        enteteY: [tx("Charge maximale (t)")],
        titreX: "Longueur de la flèche (m)",
        titreY: "Charge maximale (t)",
        uniteX: "m",
        uniteY: "t",
      };
    case "defectueuses":
      return {
        situation: "Une machine qui fabrique des pièces pour appareils électroménagers se dérègle au fil du temps. Toutes les deux semaines, on relève le pourcentage de pièces défectueuses qu'elle produit.",
        enteteX: [tx("Semaine")],
        enteteY: [tx("Pièces défectueuses (%)")],
        titreX: "Semaine",
        titreY: "Pièces défectueuses (%)",
        uniteX: "",
        uniteY: "%",
      };
    case "ventes":
      return {
        situation: "Une société d'informatique a mis au point un nouveau matériel. Elle a demandé à 300 entreprises à quel prix elles seraient prêtes à l'acheter. Le tableau donne, pour chaque prix proposé (en milliers d'euros), le nombre d'entreprises prêtes à l'acheter à ce prix.",
        enteteX: [tx("Prix (milliers d'€)")],
        enteteY: [tx("Entreprises")],
        titreX: "Prix (milliers d'€)",
        titreY: "Nombre d'entreprises",
        uniteX: "milliers d'€",
        uniteY: "entreprises",
      };
    case "population":
      return {
        situation: "Le tableau donne la population d'une commune au 1er janvier de quelques années ; x est le nombre d'années écoulées depuis 2010.",
        enteteX: [tx("x (années depuis 2010)")],
        enteteY: [tx("Population")],
        titreX: "Années depuis 2010",
        titreY: "Population",
        uniteX: "ans",
        uniteY: "habitants",
      };
    case "consommation":
      return {
        situation: "Dans un souci d'économie d'énergie, on a relevé la consommation d'essence (en litres aux 100 km) de voitures neuves selon leur puissance (en chevaux, ch).",
        enteteX: [tx("Puissance (ch)")],
        enteteY: [tx("Consommation (l/100 km)")],
        titreX: "Puissance (ch)",
        titreY: "Consommation (l/100 km)",
        uniteX: "ch",
        uniteY: "l/100 km",
      };
  }
}

export const xT = (_e: E, x: number) => nT(x, 2);
export const xL = (_e: E, x: number) => nL(x, 2);
export const yL = (e: E, y: number, dec = e.decY) => nL(y, dec);

/** Valeurs arrondies demandées. */
export const aArr = (e: E) => arrondi(e.stats.a, e.da);
export const bArr = (e: E) => arrondi(e.stats.b, e.db);
export const rArr = (e: E) => arrondi(e.stats.r, 3);
export const equationArrondieL = (e: E) => droiteL(e.stats.a, e.stats.b, e.da, e.db, "y", "x", true);

export function tableau(e: E): TableauDonnees {
  const c = contexte(e);
  const entetes: Frag[][] = e.variante === "population" ? [[tx("Année")], c.enteteX, c.enteteY] : [c.enteteX, c.enteteY];
  const lignes = e.points.map((p) => [...(e.variante === "population" ? [String(2010 + p.x)] : []), nT(p.x, 2), nT(p.y, e.decY, true)]);
  return { horizontal: true, entetes, lignes };
}

export function situation(e: E): Frag[] {
  return [tx(`${contexte(e).situation} On ajuste le nuage de points par la droite des moindres carrés `), lx("y=ax+b"), tx(".")];
}

export function consigneGenerale(e: E): Frag[] {
  return [...situation(e), tx(" Utilise ta calculatrice (mode « 2-Var Stats »).")];
}

export function libelle(_e: E, p: PhaseModeliser): string {
  switch (p) {
    case "equation":
      return "Droite des moindres carrés";
    case "correlation":
      return "Coefficient r";
    case "fiabilite":
      return "Modèle fiable ?";
    case "prevision":
      return "Prévision";
    case "nature":
      return "Interpolation ou extrapolation";
    case "seuil":
      return "Seuil";
  }
}

const anneeT = (e: E, x: number) => String((e.annee0 ?? 2010) + x);

export function questionPrevision(e: E): Frag[] {
  const x = xT(e, e.x0);
  const pr = precisionTexte(e.dp);
  switch (e.variante) {
    case "dilatation":
      return [tx(`D'après le modèle, quel est l'allongement de la barre à ${x} °C (en mm, ${pr}) ?`)];
    case "grue":
      return [tx(`D'après le modèle, quelle charge maximale une grue de ce type peut-elle soulever avec une flèche de ${x} m (en tonnes, ${pr}) ?`)];
    case "defectueuses":
      return [tx(`D'après le modèle, quel pourcentage de pièces défectueuses la machine produira-t-elle la semaine ${x} (${pr}) ?`)];
    case "ventes":
      return [tx(`D'après le modèle, combien d'entreprises seraient prêtes à acheter le matériel au prix de ${x} milliers d'euros (${pr}) ?`)];
    case "population":
      return [tx(`D'après le modèle, quelle sera la population au 1er janvier ${anneeT(e, e.x0)}, c'est-à-dire pour x = ${x} (${pr}) ?`)];
    case "consommation":
      return [tx(`D'après le modèle, quelle est la consommation d'une voiture de ${x} ch (en l/100 km, ${pr}) ?`)];
  }
}

export const longueurT = (e: E) => nT(e.longueurSeuil ?? 10, 3);

export function questionSeuil(e: E): Frag[] {
  const pr = precisionTexte(e.ds);
  const s = nT(e.seuil, 2);
  switch (e.variante) {
    case "dilatation":
      return [tx(`D'après le modèle, à quelle température la barre mesurera-t-elle ${longueurT(e)} m (en °C, ${pr}) ?`)];
    case "grue":
      return [tx(`Le chantier demande de soulever des charges de ${s} t. D'après le modèle, quelle est la plus grande longueur de flèche qui le permet (en m, ${pr}) ?`)];
    case "defectueuses":
      return [tx(`Un entretien de la machine s'impose dès qu'elle produit 5 % de pièces défectueuses. D'après le modèle, quand faut-il le prévoir ? Donne le numéro de semaine x, ${pr}.`)];
    case "ventes":
      return [tx(`À quel prix (en milliers d'euros, ${pr}) la société doit-elle proposer son matériel pour que ${s} entreprises soient prêtes à l'acheter ?`)];
    case "population":
      return [tx(`D'après le modèle, quand la commune atteindra-t-elle ${s} habitants ? Donne x (années depuis 2010), ${pr}.`)];
    case "consommation":
      return [tx(`D'après le modèle, quelle puissance correspond à une consommation de ${s} l/100 km (en ch, ${pr}) ?`)];
  }
}

export function consigne(e: E, p: PhaseModeliser): Frag[] {
  switch (p) {
    case "equation":
      return [tx("Détermine l'équation de la droite des moindres carrés "), lx("y=ax+b"), tx(` : a ${precisionTexte(e.da)}, b ${precisionTexte(e.db)}.`)];
    case "correlation":
      return [tx("Donne le coefficient de corrélation linéaire "), lx("r"), tx(", au millième.")];
    case "fiabilite":
      return [tx("Le modèle affine est-il fiable ? Choisis la bonne justification (tableau d'interprétation du cours).")];
    case "prevision":
      return questionPrevision(e);
    case "nature":
      return [tx("Cette prévision (pour "), lx(`x=${xL(e, e.x0)}`), tx(") est-elle une interpolation ou une extrapolation ?")];
    case "seuil":
      return questionSeuil(e);
  }
}

export function champs(e: E, p: PhaseModeliser): ChampEcran[] {
  const c = contexte(e);
  switch (p) {
    case "equation":
      return [
        { label: "a", labelLatex: "a=", placeholder: e.stats.a < 0 ? "ex. : −0,153" : "ex. : 0,153" },
        { label: "b", labelLatex: "b=", placeholder: "ex. : 2,47" },
      ];
    case "correlation":
      return [{ label: "r", labelLatex: "r=", placeholder: "ex. : 0,912" }];
    case "prevision":
      return [{ label: "prévision", labelLatex: "y\\approx", unite: c.uniteY || undefined, placeholder: "ex. : 12,4" }];
    case "seuil":
      return [{ label: "x", labelLatex: "x\\approx", unite: c.uniteX || undefined, placeholder: "ex. : 23,5" }];
    default:
      return [];
  }
}

export function optionsFiabilite(e: E): OptionEcran[] {
  const neg = e.stats.r < 0;
  return [
    { id: "fiable", fragments: [tx("Oui : "), lx("|r|\\geq 0{,}80"), tx(", la corrélation est forte (ou très forte) : les points sont proches de la droite.")] },
    { id: "pasFiable", fragments: [tx("Non : "), lx("|r|<0{,}80"), tx(", la corrélation est au mieux moyenne : les points sont trop dispersés autour de la droite.")] },
    { id: "exact", fragments: [tx("Non : un modèle affine n'est fiable que si "), lx("r=1"), tx(" ou "), lx("r=-1"), tx(".")] },
    neg
      ? { id: "signe", fragments: [tx("Non : "), lx("r"), tx(" est négatif, donc les deux grandeurs ne sont pas liées.")] }
      : { id: "nonNul", fragments: [tx("Oui : dès que "), lx("r\\neq 0"), tx(", la droite résume bien le nuage.")] },
  ];
}

export function optionsNature(e: E): OptionEcran[] {
  return [
    { id: "interpolation", fragments: [tx("Interpolation : "), lx(`x=${xL(e, e.x0)}`), tx(" est dans l'intervalle des données ; la prévision est raisonnable si le modèle est fiable.")] },
    { id: "extrapolation", fragments: [tx("Extrapolation : "), lx(`x=${xL(e, e.x0)}`), tx(" sort de l'intervalle des données ; la prévision demande de la prudence.")] },
    { id: "absentI", fragments: [tx("Interpolation, parce que "), lx(`x=${xL(e, e.x0)}`), tx(" ne figure pas dans le tableau.")] },
    { id: "absentE", fragments: [tx("Extrapolation, parce que "), lx(`x=${xL(e, e.x0)}`), tx(" ne figure pas dans le tableau.")] },
  ];
}

export const bonneFiabilite = (e: E) => (e.fiable ? "fiable" : "pasFiable");
export const bonneNature = (e: E) => (e.interpolation ? "interpolation" : "extrapolation");

/** Catégorie du tableau d'interprétation (seuils du cours). */
export function categorieR(r: number): string {
  const v = Math.abs(r);
  if (v === 1) return "parfaite";
  if (v >= 0.98) return "très forte";
  if (v >= 0.8) return "forte";
  if (v >= 0.6) return "moyenne";
  if (v >= 0.35) return "faible";
  return "nulle";
}

export const TABLEAU_R_LATEX = "\\begin{array}{ll}|r|\\geq 0{,}98 & \\text{très forte}\\\\ 0{,}80\\leq |r|<0{,}98 & \\text{forte}\\\\ 0{,}60\\leq |r|<0{,}80 & \\text{moyenne}\\\\ 0{,}35\\leq |r|<0{,}60 & \\text{faible}\\\\ |r|<0{,}35 & \\text{nulle}\\end{array}";

export function aide1(_e: E, p: PhaseModeliser): AideEcran {
  switch (p) {
    case "equation":
      return { texte: [tx("Touche « data » : tape les x dans la liste L1 et les y dans L2 ; puis « 2nd » et « data », « 2-Var Stats » avec L1 pour les x et L2 pour les y (cours, § 4). La calculatrice affiche a et b de la droite des moindres carrés "), lx("y=ax+b"), tx(".")] };
    case "correlation":
      return { texte: [tx("« 2-Var Stats » affiche r avec a et b (cours, § 5). Il est compris entre −1 et 1 et il a le même signe que a.")] };
    case "fiabilite":
      return { texte: [tx("La droite est un bon modèle quand la corrélation est forte ou très forte. Tableau d'interprétation du cours :")], latex: TABLEAU_R_LATEX };
    case "prevision":
      return { texte: [tx("On connaît x et on cherche y : remplace x par la valeur donnée dans l'équation de la droite (avec a et b non arrondis si ta calculatrice les garde en mémoire).")] };
    case "nature":
      return { texte: [tx("Interpolation : la valeur de x est entre la plus petite et la plus grande valeur de x du tableau. Extrapolation : elle est en dehors.")] };
    case "seuil":
      return { texte: [tx("Cette fois, on connaît y et on cherche x : résous l'équation "), lx("ax+b=\\text{seuil}"), tx(".")] };
  }
}

export function aide2(e: E, p: PhaseModeliser): AideEcran | null {
  const s = e.stats;
  switch (p) {
    case "equation":
      return { texte: [tx("Contrôle d'abord que ta calculatrice affiche les bonnes moyennes ; puis :")], latex: `\\bar{x}${egalOuEnviron(s.mx, 3)}\\qquad\\bar{y}${egalOuEnviron(s.my, 3)}\\qquad a=\\dfrac{\\operatorname{Cov}(x,y)}{V(x)}\\qquad b=\\bar{y}-a\\,\\bar{x}` };
    case "correlation":
      return { texte: [tx(`Ici, a est ${s.a < 0 ? "négatif" : "positif"} : r aussi. Formule du cours :`)], latex: `r=\\dfrac{\\operatorname{Cov}(x,y)}{\\sigma_x\\,\\sigma_y}\\quad\\text{avec}\\quad\\sigma_x\\approx ${nL(s.sx, 3)},\\ \\sigma_y\\approx ${nL(s.sy, 3)}` };
    case "fiabilite":
      return { texte: [tx("Ici, "), lx(`|r|\\approx ${nL(Math.abs(s.r), 3, true)}`), tx(" : place cette valeur dans le tableau d'interprétation.")] };
    case "prevision":
      return { texte: [tx("Ici :")], latex: `y=${nL(aArr(e), e.da)}\\cdot ${nP(e.x0, 2)}${nL(bArr(e), e.db).startsWith("-") ? "" : "+"}${nL(bArr(e), e.db)}` };
    case "nature":
      return { texte: [tx("Ici, les x du tableau vont de "), lx(xL(e, xMin(e))), tx(" à "), lx(xL(e, xMax(e))), tx(".")] };
    case "seuil": {
      const sl = e.variante === "dilatation" ? nL(e.seuil, 0) : nL(e.seuil, 2);
      const intro: Frag[] = e.variante === "dilatation" ? [tx(`Ici, ${longueurT(e)} m, c'est un allongement de ${nT(e.seuil, 0)} mm :`)] : [tx("Ici :")];
      return { texte: intro, latex: `${nL(aArr(e), e.da)}\\,x${nL(bArr(e), e.db).startsWith("-") ? "" : "+"}${nL(bArr(e), e.db)}=${sl}\\iff x=\\dfrac{${sl}-${nP(bArr(e), e.db)}}{${nL(aArr(e), e.da)}}` };
    }
  }
}

export function messageIllisible(_e: E, _p: PhaseModeliser): string {
  return "Nombre non reconnu : écris un nombre décimal comme 0,153 ou −2,47 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, p: PhaseModeliser): Frag[] {
  const c = contexte(e);
  switch (p) {
    case "equation":
      return [lx(`a\\approx ${nL(e.stats.a, e.da, true)}`), tx(" ; "), lx(`b\\approx ${nL(e.stats.b, e.db, true)}`), tx(", d'où "), lx(equationArrondieL(e))];
    case "correlation":
      return [lx(`r\\approx ${nL(e.stats.r, 3, true)}`), tx(` (corrélation ${categorieR(e.stats.r)})`)];
    case "fiabilite":
      return optionsFiabilite(e).find((o) => o.id === bonneFiabilite(e))!.fragments;
    case "prevision":
      return [lx(`y\\approx ${nL(prevision(e), e.dp, true)}`), tx(c.uniteY ? ` ${c.uniteY}` : "")];
    case "nature":
      return optionsNature(e).find((o) => o.id === bonneNature(e))!.fragments;
    case "seuil":
      return [lx(`x\\approx ${nL(abscisseSeuil(e), e.ds, true)}`), tx(c.uniteX ? ` ${c.uniteX}` : "")];
  }
}

export function recap(e: E, p: PhaseModeliser): Frag[] {
  if (p === "fiabilite") return [tx(e.fiable ? "Oui : corrélation forte, modèle fiable" : "Non : corrélation trop faible, modèle peu fiable")];
  if (p === "nature") return [tx(e.interpolation ? "Interpolation" : "Extrapolation (prudence)")];
  return reponse(e, p);
}

export function explicationChoix(e: E, p: PhaseModeliser): string {
  if (p === "fiabilite") return `Ici |r| ≈ ${nT(Math.abs(e.stats.r), 3, true)} : corrélation ${categorieR(e.stats.r)}.`;
  if (p === "nature") return `Les x du tableau vont de ${xT(e, xMin(e))} à ${xT(e, xMax(e))}.`;
  return "";
}

/* ----------------------------------------------------------------------------------------------
 * Figure
 * -------------------------------------------------------------------------------------------- */

export function specNuage(e: E, avecDroite: boolean, extra: Partial<SpecNuage> = {}): SpecNuage {
  const c = contexte(e);
  return {
    points: e.points,
    titreX: c.titreX,
    titreY: c.titreY,
    droites: avecDroite ? [{ a: e.stats.a, b: e.stats.b, couleur: COULEUR_DROITE }] : [],
    ...extra,
  };
}

/** Figure de l'écran : le nuage, puis la droite une fois l'équation trouvée. */
export function figure(e: E, p: PhaseModeliser): string {
  return nuageSvg(specNuage(e, p !== "equation"));
}

/** Figure du corrigé de la prévision : bande des données, verticale en x₀ et point prévu. */
export function figurePrevision(e: E): string {
  return nuageSvg(
    specNuage(e, true, {
      bande: { de: xMin(e), a: xMax(e), texte: "données" },
      verticales: [{ x: e.x0, couleur: COULEUR_DROITE2 }],
      marques: [{ x: e.x0, y: prevision(e), label: "prévision", couleur: COULEUR_DROITE2, position: e.stats.a > 0 ? "no" : "ne" }],
    }),
  );
}

/** Figure du corrigé du seuil : point de la droite d'ordonnée « seuil ». */
export function figureSeuil(e: E): string {
  return nuageSvg(specNuage(e, true, { marques: [{ x: abscisseSeuil(e), y: e.seuil, label: "seuil", couleur: COULEUR_DROITE2, position: e.stats.a > 0 ? "no" : "ne" }] }));
}

/** Point de Mayer (piège : pente de Mayer donnée à la place de celle des moindres carrés). */
export const penteMayer = (e: E) => mayer(e.points).droite.a;
