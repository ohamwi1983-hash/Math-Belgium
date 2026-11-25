import type { AideEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceTL, PhaseTL, RaisonTL } from "../core6e/traduireLieu";
import { cercleLieu, droitesLieu, exclus, mobile, normeD, phases, pointK, polyLieu, raison } from "../core6e/traduireLieu";
import type { D, Pt, SpecFigure } from "./outilsLieuxLotH2";
import { COULEURS, coordL, droiteL, equationPolyL, fenetreLieu, figureLieu, l, listeL, milieu, normaliserPoly, nL, polyDroite, polyL, ptL, racineL, t } from "./outilsLieuxLotH2";
import { approchee, aReprendre, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationTraduireLieu";
import { correctionDetailleeTL } from "../generateurs6e/traduireLieu/corrigeDetaille";

/**
 * Couche C — textes de `6gen128` « Traduire un lieu : réciproque et points exclus » : énoncé, consignes
 * des quatre écrans (équation du lieu complet, nombre de points exclus, ces points, la raison), aides à
 * deux niveaux, réponses, figure. Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceTL;

export const CONSIGNE_GLOBALE = "Traduis la condition en une équation en x et y, puis vérifie la réciproque : précise, en justifiant, les points éventuels à exclure.";

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export const droiteNommeeL = (nom: string, d: D): string => `${nom}:\\ ${droiteL(d)}`;

export function donnees(e: E): Frag[] {
  switch (e.situation) {
    case "milieuExt":
    case "corde":
      return [
        t("Dans un repère orthonormé, on donne le cercle "),
        l("\\Gamma"),
        t(" de centre "),
        l(ptL("O", e.O)),
        t(" et de rayon "),
        l(nL(e.r)),
        t(", et le point "),
        l(ptL("M", e.M)),
        t(e.situation === "corde" ? " de " : ", extérieur à "),
        l("\\Gamma"),
        t(". "),
      ];
    case "distance":
      return [t("Dans un repère orthonormé, on donne la droite "), l(droiteNommeeL("d", e.d)), t(". ")];
    case "bissectrices":
      return [t("Dans un repère orthonormé, on donne les droites sécantes "), l(droiteNommeeL("d_1", e.d1)), t(" et "), l(droiteNommeeL("d_2", e.d2)), t(". ")];
    default:
      return [t("Dans un repère orthonormé, on donne les points "), l(ptL("A", e.A)), t(" et "), l(ptL("B", e.B)), t(". ")];
  }
}

export function question(e: E): Frag[] {
  switch (e.situation) {
    case "pythagore":
      return [t("Détermine le lieu des points "), l("P"), t(" du plan tels que "), l("PA^2+PB^2=AB^2"), t(".")];
    case "thales":
      return [t("Détermine le lieu des points "), l("P"), t(" du plan tels que le triangle "), l("APB"), t(" soit rectangle en "), l("P"), t(".")];
    case "mediatrice":
      return [t("Détermine le lieu des centres "), l("\\Omega"), t(" des cercles qui passent par "), l("A"), t(" et par "), l("B"), t(".")];
    case "isocele":
      return [t("Détermine le lieu des points "), l("P"), t(" du plan tels que le triangle "), l("PAB"), t(" soit isocèle en "), l("P"), t(".")];
    case "rectangleAB":
      return [t("Détermine le lieu des points "), l("P"), t(" du plan tels que le triangle "), l("PAB"), t(" soit rectangle en "), l("A"), t(" ou en "), l("B"), t(".")];
    case "milieuExt":
      return [t("Un point "), l("Q"), t(" parcourt "), l("\\Gamma"), t(". Détermine le lieu du milieu "), l("I"), t(" du segment "), l("[MQ]"), t(".")];
    case "corde":
      return [t("Une corde "), l("[MQ]"), t(" de "), l("\\Gamma"), t(" pivote autour de "), l("M"), t(". Détermine le lieu de son milieu "), l("I"), t(".")];
    case "distance":
      return [t("Détermine le lieu des points "), l("P"), t(" du plan situés à la distance "), l(nL(e.h)), t(" de "), l("d"), t(".")];
    case "bissectrices":
      return [t("Détermine le lieu des centres "), l("\\Omega"), t(" des cercles tangents à la fois à "), l("d_1"), t(" et à "), l("d_2"), t(".")];
  }
}

export const consigneGenerale = (e: E): Frag[] => [...donnees(e), ...question(e)];

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

/** Équation attendue, normalisée. */
export const equationAttendueL = (e: E): string => equationPolyL(normaliserPoly(polyLieu(e)));

/** Description du lieu complet (« le cercle de centre … et de rayon … »). */
export function natureComplete(e: E): Frag[] {
  if (e.variante === "cercle") {
    const { c, r2 } = cercleLieu(e);
    return [t("le cercle de centre "), l(coordL(c)), t(" et de rayon "), l(racineL(r2))];
  }
  const ds = droitesLieu(e);
  if (ds.length === 1) return [t("la droite "), l(droiteL(ds[0]!)), t(e.situation === "mediatrice" || e.situation === "isocele" ? " (médiatrice de [AB])" : "")];
  return [t("la réunion des droites "), l(droiteL(ds[0]!)), t(" et "), l(droiteL(ds[1]!))];
}

/** Équation du lieu complet, sous la forme lue par l'élève (deux droites : « … ou … »). */
export function equationLisibleL(e: E): string {
  if (e.variante === "droites") {
    const ds = droitesLieu(e);
    if (ds.length === 2) return `${droiteL(ds[0]!)}\\ \\text{ou}\\ ${droiteL(ds[1]!)}`;
  }
  return equationAttendueL(e);
}

export const NOMBRES: Record<0 | 1 | 2, string> = { 0: "aucun point", 1: "un point", 2: "deux points" };

export const RAISONS: Record<RaisonTL, string> = {
  aplati: "Le triangle serait aplati : ses sommets seraient alignés ou confondus.",
  corde: "Q serait confondu avec M : la corde [MQ] n'existerait pas.",
  rayon: "Le cercle aurait un rayon nul : ce ne serait pas un cercle.",
  hors: "L'équation trouvée ne serait pas vérifiée.",
};
export const ORDRE_RAISONS: RaisonTL[] = ["aplati", "corde", "rayon", "hors"];

/** Lieu final (« le cercle … privé de A et de B »). */
export function lieuFinal(e: E): Frag[] {
  const ex = exclus(e);
  if (ex.length === 0) return [t("Le lieu est "), ...natureComplete(e), t(", tout entier.")];
  return [t("Le lieu est "), ...natureComplete(e), t(", privé"), t(e.variante === "droites" && droitesLieu(e).length === 2 ? "e" : ""), t(ex.length === 1 ? " du point " : " des points "), l(listeL(ex)), t(".")];
}

export function reponse(e: E, p: PhaseTL): Frag[] {
  if (p === "equation") return [l(equationLisibleL(e)), t(" : "), ...natureComplete(e)];
  if (p === "nombre") return [t(`${NOMBRES[e.nbExclus]} à exclure`.replace(/^./, (c) => c.toUpperCase()))];
  if (p === "points") return [l(listeL(exclus(e)))];
  return [t(RAISONS[raison(e) ?? "hors"])];
}

export function libelle(_e: E, p: PhaseTL): string {
  return { equation: "Lieu complet", nombre: "Points à exclure", points: "Coordonnées", raison: "Raison" }[p];
}

export function consigne(e: E, p: PhaseTL): Frag[] {
  const m = mobile(e);
  if (p === "equation")
    return [
      t("Avec "),
      l(`${m}(x\\,;y)`),
      t(", traduis la condition : donne une équation de l'ensemble des points qui la vérifient (sans rien exclure pour l'instant ; pour deux droites, sépare leurs équations par « ou »)."),
    ];
  if (p === "nombre") return [t("Réciproque : combien de points de cet ensemble faut-il exclure du lieu (points pour lesquels la condition de départ n'a plus de sens) ?")];
  if (p === "points") return [t(e.nbExclus === 1 ? "Donne les coordonnées du point à exclure." : "Donne les coordonnées des deux points à exclure.")];
  return [t(e.nbExclus === 1 ? "Pourquoi faut-il exclure ce point ?" : "Pourquoi faut-il exclure ces points ?")];
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

function aideEquation1(e: E): AideEcran {
  switch (e.situation) {
    case "pythagore":
      return { texte: [t("Écris chaque carré de distance avec la formule du repère orthonormé :")], latex: "PA^2=(x-x_A)^2+(y-y_A)^2" };
    case "thales":
      return { texte: [t("Pythagore et sa réciproque : le triangle est rectangle en P exactement quand la somme des carrés des deux côtés de l'angle droit vaut le carré de l'hypoténuse :")], latex: "PA^2+PB^2=AB^2" };
    case "mediatrice":
      return { texte: [t("Le centre d'un cercle qui passe par A et par B est à la même distance de A et de B :")], latex: "\\Omega A^2=\\Omega B^2" };
    case "isocele":
      return { texte: [t("Isocèle en P : les deux côtés issus de P ont la même longueur :")], latex: "PA^2=PB^2" };
    case "rectangleAB":
      return { texte: [t("Rectangle en A : les droites (AB) et (AP) sont perpendiculaires, donc le produit scalaire est nul :")], latex: "\\vec{AB}\\cdot\\vec{AP}=0" };
    case "milieuExt":
    case "corde":
      return { texte: [t("Exprime Q à partir du milieu I(x ; y) de [MQ], puis écris que Q est sur le cercle :")], latex: "x_Q=2x-x_M,\\quad y_Q=2y-y_M" };
    case "distance":
      return { texte: [t("Distance d'un point à une droite :")], latex: "\\text{dist}(P\\,;d)=\\dfrac{|ax_P+by_P+c|}{\\sqrt{a^2+b^2}}" };
    case "bissectrices":
      return { texte: [t("Un cercle de centre Ω est tangent aux deux droites quand Ω est à la même distance des deux (cette distance est le rayon) :")], latex: "\\text{dist}(\\Omega\\,;d_1)=\\text{dist}(\\Omega\\,;d_2)" };
  }
}

function aideEquation2(e: E): AideEcran {
  switch (e.situation) {
    case "pythagore":
    case "thales":
      return { texte: [t("Avec les données, développe puis réduis (les termes en "), l("x^2"), t(" et "), l("y^2"), t(" ont le même coefficient) :")], latex: `(x${sg(-e.A.x)})^2+(y${sg(-e.A.y)})^2+(x${sg(-e.B.x)})^2+(y${sg(-e.B.y)})^2=${nL((e.B.x - e.A.x) ** 2 + (e.B.y - e.A.y) ** 2)}` };
    case "mediatrice":
    case "isocele":
      return { texte: [t("Développe les deux membres : les termes "), l("x^2"), t(" et "), l("y^2"), t(" disparaissent.")], latex: `(x${sg(-e.A.x)})^2+(y${sg(-e.A.y)})^2=(x${sg(-e.B.x)})^2+(y${sg(-e.B.y)})^2` };
    case "rectangleAB":
      return { texte: [t("Avec "), l(`\\vec{AB}=${coordL({ x: e.B.x - e.A.x, y: e.B.y - e.A.y })}`), t(", écris l'équation en A, puis la même en B (avec "), l("\\vec{BA}\\cdot\\vec{BP}=0"), t(") :")], latex: `${nL(e.B.x - e.A.x)}(x${sg(-e.A.x)})${sgCoef(e.B.y - e.A.y)}(y${sg(-e.A.y)})=0` };
    case "milieuExt":
    case "corde":
      return { texte: [t("Q est sur "), l("\\Gamma"), t(" : remplace dans l'équation du cercle, puis divise par 4 :")], latex: `(2x${sg(-e.M.x - e.O.x)})^2+(2y${sg(-e.M.y - e.O.y)})^2=${nL(e.r * e.r)}` };
    case "distance": {
      const n = normeD(e.d);
      return { texte: [t("La valeur absolue donne deux équations :")], latex: `|${polyL(polyDroite(e.d))}|=${nL(n * e.h)}` };
    }
    case "bissectrices":
      return { texte: [t("Les deux vecteurs normaux ont la même norme : il reste deux valeurs absolues égales, donc deux équations.")], latex: `|${polyL(polyDroite(e.d1))}|=|${polyL(polyDroite(e.d2))}|` };
  }
}

const sg = (c: number): string => (Math.abs(c) < 1e-12 ? "" : c > 0 ? `+${nL(c)}` : `-${nL(-c)}`);
const sgCoef = (c: number): string => (c < 0 ? `-${nL(-c)}` : `+${nL(c)}`);

export function aide1(e: E, p: PhaseTL): AideEcran {
  if (p === "equation") return aideEquation1(e);
  if (p === "nombre") return { texte: [t("Pour chaque point de l'ensemble trouvé, la condition de départ a-t-elle encore un sens ? (un triangle a trois sommets non alignés, une corde a deux extrémités distinctes, un cercle a un rayon non nul)")] };
  if (p === "points") return { texte: [t("Ce sont les points de l'ensemble pour lesquels la figure de l'énoncé n'existe plus.")] };
  return { texte: [t("Place le point exclu dans la condition de l'énoncé et regarde ce qui ne va plus.")] };
}

export function aide2(e: E, p: PhaseTL): AideEcran | null {
  if (p === "equation") return aideEquation2(e);
  if (p === "nombre") {
    if (e.variante === "cercle") return { texte: [e.situation === "milieuExt" || e.situation === "corde" ? t("Teste le point M : est-il sur l'ensemble trouvé ? Pour quel point Q l'obtiendrait-on ?") : t("Teste les points A et B : sont-ils sur l'ensemble trouvé ? La condition de l'énoncé a-t-elle un sens pour eux ?")] };
    if (e.situation === "distance" || e.situation === "bissectrices") return { texte: [t("Teste les points particuliers des droites trouvées (leur point commun s'il y en a un) : la condition de l'énoncé a-t-elle un sens pour eux ?")] };
    return { texte: [t("Teste les points A, B et le milieu de [AB] : sont-ils sur l'ensemble trouvé ? Le triangle existe-t-il pour eux ?")] };
  }
  if (p === "points") return { texte: [t(e.situation === "bissectrices" ? "Cherche le point commun des deux droites données." : e.situation === "corde" ? "Quel point I obtient-on quand Q est en M ?" : e.situation === "isocele" ? "Quel point de la médiatrice est aligné avec A et B ?" : "Pour quels points P le triangle n'a-t-il plus trois sommets distincts ?")] };
  return null;
}

// ---------------------------------------------------------------------------------------------
// Choix fermés
// ---------------------------------------------------------------------------------------------

export function optionsNombre(): OptionEcran[] {
  return ([0, 1, 2] as const).map((k) => ({ id: `n${k}`, fragments: [t(NOMBRES[k].replace(/^./, (c) => c.toUpperCase()))] }));
}
export function optionsRaison(): OptionEcran[] {
  return ORDRE_RAISONS.map((r) => ({ id: r, fragments: [t(RAISONS[r])] }));
}

export function explicationChoix(e: E, p: PhaseTL): string {
  if (p === "nombre") return e.nbExclus === 0 ? "Tout point de l'ensemble trouvé vérifie la condition : aucun point à exclure." : `${NOMBRES[e.nbExclus].replace(/^./, (c) => c.toUpperCase())} de l'ensemble trouvé ne convien${e.nbExclus === 1 ? "t" : "nent"} pas.`;
  if (p === "raison") return RAISONS[raison(e) ?? "hors"];
  return "";
}

// ---------------------------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------------------------

function pointsCadre(e: E): Pt[] {
  const pts: Pt[] = [];
  if (e.variante === "cercle") {
    const { c, r2 } = cercleLieu(e);
    const r = Math.sqrt(r2);
    pts.push({ x: c.x - r, y: c.y - r }, { x: c.x + r, y: c.y + r });
  }
  if (e.situation === "milieuExt" || e.situation === "corde") pts.push({ x: e.O.x - e.r, y: e.O.y - e.r }, { x: e.O.x + e.r, y: e.O.y + e.r }, e.M);
  else if (e.situation === "distance" || e.situation === "bissectrices") pts.push({ x: -5, y: -5 }, { x: 5, y: 5 });
  else pts.push(e.A, e.B);
  if (e.situation === "rectangleAB" || e.situation === "mediatrice" || e.situation === "isocele") pts.push({ x: Math.min(e.A.x, e.B.x) - 2, y: Math.min(e.A.y, e.B.y) - 2 }, { x: Math.max(e.A.x, e.B.x) + 2, y: Math.max(e.A.y, e.B.y) + 2 });
  return pts;
}

/** Configuration de l'énoncé (`avecLieu` : lieu complet tracé ; `final` : points exclus en creux). */
export function figureTL(e: E, avecLieu: boolean, final: boolean): string {
  const spec: SpecFigure = { fenetre: fenetreLieu(pointsCadre(e), 1, 8), points: [], droites: [], cercles: [] };
  if (e.situation === "milieuExt" || e.situation === "corde") {
    spec.cercles!.push({ centre: e.O, rayon: e.r, couleur: COULEURS.gris });
    spec.points!.push({ P: e.O, label: "O", couleur: COULEURS.noir, position: "so" });
  } else if (e.situation === "distance") {
    spec.droites!.push({ d: e.d, couleur: COULEURS.noir, label: "d" });
  } else if (e.situation === "bissectrices") {
    spec.droites!.push({ d: e.d1, couleur: COULEURS.noir, label: "d₁" }, { d: e.d2, couleur: COULEURS.gris, label: "d₂" });
  }
  if (avecLieu) {
    if (e.variante === "cercle") {
      const { c, r2 } = cercleLieu(e);
      spec.cercles!.push({ centre: c, rayon: Math.sqrt(r2), couleur: COULEURS.accent });
    } else for (const d of droitesLieu(e)) spec.droites!.push({ d, couleur: COULEURS.accent });
  }
  if (e.situation === "milieuExt" || e.situation === "corde") spec.points!.push({ P: e.M, label: "M", couleur: COULEURS.noir, position: "ne" });
  else if (e.situation !== "distance" && e.situation !== "bissectrices") {
    spec.points!.push({ P: e.A, label: "A", couleur: COULEURS.noir, position: "so" }, { P: e.B, label: "B", couleur: COULEURS.noir, position: "ne" });
  }
  if (final) for (const p of exclus(e)) spec.points!.push({ P: p, couleur: COULEURS.accent, creux: true, ...(e.situation === "bissectrices" ? { label: "K", position: "se" as const } : {}) });
  return figureLieu(spec);
}

export function figure(e: E, p: PhaseTL): string {
  return figureTL(e, p !== "equation", false);
}

// ---------------------------------------------------------------------------------------------
// Définition
// ---------------------------------------------------------------------------------------------

export const recap = reponse;

/** `6gen128` : équation du lieu complet (champ), nombre de points exclus (choix jugé ✗ / ✓, verdict),
 * ces points (champ), la raison (choix jugé). Structure fixe : quatre puces. */
export const DEFINITION_TL: DefinitionEcrans<E, PhaseTL> = {
  phases,
  estChoix: (_e, p) => p === "nombre" || p === "raison",
  mode: (_e, p) => {
    if (p === "nombre") return { type: "choix", options: optionsNombre() };
    if (p === "raison") return { type: "choix", options: optionsRaison() };
    if (p === "points") return { type: "champs", champs: [{ label: "Points exclus", placeholder: "(… ; …)" }] };
    return { type: "champs", champs: [{ label: "Équation du lieu complet", placeholder: "équation en x et y" }] };
  },
  libelle,
  consigneGenerale,
  figure,
  consigne,
  approchee,
  aReprendre,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e, p) => (p === "nombre" ? `n${e.nbExclus}` : raison(e) ?? "hors"),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeTL,
  apercuEnonce: (e) => question(e),
};

export { pointK, milieu };
