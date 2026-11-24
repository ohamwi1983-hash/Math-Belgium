import type { ExerciceProbaGeo, PhaseProbaGeo } from "../core6e/probabilitesGeometriques";
import { phasesProbaGeo, probaDonnee, valeurAttendue, valPiL } from "../core6e/probabilitesGeometriques";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { qL } from "../../5e-4h/ui5e/nombresTrigo";

/**
 * Couche C — textes de `6gen162` « Probabilités géométriques » : énoncé, consignes d'écran, champs,
 * aides à deux niveaux (propriété du cours, puis posée pour l'instance — jamais le résultat), réponses.
 * Source unique de l'écran, du papier et du corrigé. Notation du cours : P(A), aire notée 𝒜.
 */

type E = ExerciceProbaGeo;
type P = PhaseProbaGeo;
const t = tx;
const l = lx;

export const phases = (e: E): P[] => phasesProbaGeo(e);

/** Unité d'aire / de longueur de l'écran (LaTeX). */
function uniteL(e: E, p: P): string {
  if (p === "proba") return "";
  if (e.variante === "segment" || p === "rayon") return "\\ \\text{cm}";
  if (e.variante === "rendezVous") return "\\ \\text{min}^2";
  return "\\ \\text{cm}^2";
}

const fin = (h: number, T: number) => (T === 60 ? `${h + 1} h` : `${h} h ${T}`);

/** Description de la zone grisée / de l'événement (sans la consigne). */
function evenement(e: E): Frag[] {
  switch (e.variante) {
    case "cible":
      return e.r1 === 0 ? [t("que la fléchette tombe dans le disque central (zone grisée)")] : [t("que la fléchette tombe dans la couronne grisée")];
    case "cibleInverse":
      return [t("que la fléchette tombe dans le disque central")];
    case "carreDisque":
      return e.hors ? [t("que la goutte tombe hors du disque (zone grisée)")] : [t("que la goutte tombe dans le disque (zone grisée)")];
    case "rectangleQuart":
      return e.hors ? [t("que le point soit hors du quart de disque (zone grisée)")] : [t("que le point soit dans le quart de disque (zone grisée)")];
    case "segment":
      if (e.type === "entre") return [t("que la distance "), l("AM"), t(" soit comprise entre "), l(`${e.a}`), t(" cm et "), l(`${e.b}`), t(" cm")];
      if (e.type === "loin") return [t("que "), l("M"), t(" soit à plus de "), l(`${e.a}`), t(" cm de "), l("A"), t(" et à plus de "), l(`${e.a}`), t(" cm de "), l("B")];
      return [t("que le plus long des deux morceaux mesure au moins "), l(`${e.a}`), t(" cm")];
    case "rendezVous":
      return [t(e.rencontre ? "qu'ils se rencontrent" : "qu'ils ne se rencontrent pas")];
  }
}

/** Situation (texte avant la figure), sans la consigne globale. */
export function situation(e: E): Frag[] {
  switch (e.variante) {
    case "cible":
      return [
        t("Une fléchette atteint toujours une cible circulaire de rayon "),
        l(`${e.R}`),
        t(" cm, et chaque point de la cible a la même chance d'être atteint. "),
        ...(e.r1 === 0
          ? [t("La zone grisée est le disque central de rayon "), l(`${e.r2}`), t(" cm.")]
          : [t("La zone grisée est la couronne comprise entre les cercles de rayons "), l(`${e.r1}`), t(" cm et "), l(`${e.r2}`), t(" cm.")]),
      ];
    case "cibleInverse":
      return [
        t("On fabrique une cible circulaire de rayon "),
        l(`${e.R}`),
        t(" cm ; une fléchette l'atteint toujours, et chaque point de la cible a la même chance d'être atteint. On veut y peindre un disque central (zone grisée) de rayon "),
        l("r"),
        t(" dans lequel la fléchette tombe avec une probabilité de "),
        l(qL(probaDonnee(e))),
        t("."),
      ];
    case "carreDisque":
      return [t("Une goutte de pluie tombe au hasard sur un carreau carré de côté "), l(`${e.c}`), t(" cm, dans lequel est dessiné le disque inscrit. Chaque point du carreau a la même chance d'être touché.")];
    case "rectangleQuart":
      return [
        t("On choisit un point au hasard dans un rectangle de "),
        l(`${e.L}`),
        t(" cm sur "),
        l(`${e.l}`),
        t(" cm (chaque point a la même chance). Un quart de disque de rayon "),
        l(`${e.r}`),
        t(" cm est centré en un sommet du rectangle."),
      ];
    case "segment":
      return [t("On choisit au hasard un point "), l("M"), t(" sur un segment "), l("[AB]"), t(" de longueur "), l(`${e.L}`), t(" cm : chaque point du segment a la même chance d'être choisi."), ...(e.type === "grandMorceau" ? [t(" On coupe le segment en "), l("M"), t(", ce qui donne deux morceaux.")] : [])];
    case "rendezVous":
      return [
        t(`${e.noms[0]} et ${e.noms[1]} se donnent rendez-vous entre ${e.heure} h et ${fin(e.heure, e.T)}. Chacun arrive à un instant choisi au hasard dans ce créneau, indépendamment de l'autre, attend `),
        l(`${e.t}`),
        t(" minutes puis s'en va. On note "), l("x"), t(" et "), l("y"), t(` leurs instants d'arrivée, en minutes après ${e.heure} h : le point `), l("(x\\,;y)"), t(" est choisi au hasard dans le carré ci-dessous, et la bande grisée contient les arrivées pour lesquelles ils se rencontrent, "),
        l(`|x-y|\\le ${e.t}`),
        t("."),
      ];
  }
}

/** Consigne globale (papier et en-tête de l'écran). */
export function consigneGlobale(e: E): Frag[] {
  if (e.variante === "cibleInverse") return [t("Détermine le rayon "), l("r"), t(" de ce disque central.")];
  return [t("Calcule la probabilité "), ...evenement(e), t(". Donne la valeur exacte.")];
}

export const consigneGenerale = (e: E): Frag[] => [...situation(e), t(" "), ...consigneGlobale(e)];

export function libelle(e: E, p: P): string {
  if (p === "totale") return e.variante === "rendezVous" ? "Aire du carré" : e.variante === "carreDisque" ? "Aire du carré" : e.variante === "rectangleQuart" ? "Aire du rectangle" : "Aire de la cible";
  if (p === "favorable") {
    if (e.variante === "segment") return "Longueur favorable";
    if (e.variante === "rendezVous") return "Aire sans rencontre";
    if (e.variante === "cibleInverse") return "Aire du disque central";
    return "Aire de la zone grisée";
  }
  if (p === "rayon") return "Rayon r";
  return "Probabilité";
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "totale":
      if (e.variante === "rendezVous") return [t("Calcule l'aire du carré des arrivées possibles.")];
      if (e.variante === "carreDisque") return [t("Calcule l'aire du carreau.")];
      if (e.variante === "rectangleQuart") return [t("Calcule l'aire du rectangle.")];
      return [t("Calcule l'aire de la cible (valeur exacte, avec "), l("\\pi"), t(").")];
    case "favorable":
      if (e.variante === "segment") return [t("Quelle est la longueur totale de la partie de "), l("[AB]"), t(" où doit se trouver "), l("M"), t(" pour "), ...evenement(e), t(" ?")];
      if (e.variante === "rendezVous") return [t("Calcule l'aire de la zone où ils ne se rencontrent pas (les deux triangles blancs).")];
      if (e.variante === "cibleInverse") return [t("Quelle doit être l'aire du disque central ? Donne la valeur exacte, avec "), l("\\pi"), t(".")];
      return [t("Calcule l'aire de la zone grisée (valeur exacte).")];
    case "rayon":
      return [t("Déduis-en le rayon "), l("r"), t(" du disque central.")];
    case "proba":
      return [t("Calcule la probabilité "), ...evenement(e), t(" (valeur exacte).")];
  }
}

const RACCOURCI_PI = [{ libelle: "π", texte: "π" }];
const avecPi = (e: E) => e.variante !== "segment" && e.variante !== "rendezVous";

export function champs(e: E, p: P): ChampEcran[] {
  const raccourcis = avecPi(e) && p !== "rayon" ? RACCOURCI_PI : undefined;
  if (p === "proba") return [{ label: "Probabilité", labelLatex: "P=", placeholder: "ex. : 3/8 ou π/6", raccourcis }];
  if (p === "rayon") return [{ label: "Rayon r", labelLatex: "r=", unite: "cm", placeholder: "ex. : 4" }];
  if (e.variante === "segment") return [{ label: libelle(e, p), labelLatex: "\\ell=", unite: "cm", placeholder: "ex. : 7" }];
  return [{ label: libelle(e, p), labelLatex: "\\mathcal{A}=", unite: e.variante === "rendezVous" ? "min²" : "cm²", placeholder: avecPi(e) ? "ex. : 36π" : "ex. : 900", raccourcis }];
}

/** Réponse attendue de l'écran (LaTeX). */
export function reponse(e: E, p: P): Frag[] {
  const v = valPiL(valeurAttendue(e, p));
  if (p === "proba") return [l(`P=${v}`)];
  if (p === "rayon") return [l(`r=${v}${uniteL(e, p)}`)];
  if (e.variante === "segment") return [l(`\\ell=${v}${uniteL(e, p)}`)];
  return [l(`\\mathcal{A}=${v}${uniteL(e, p)}`)];
}
export const recap = reponse;

export function messageIllisible(e: E, p: P): string {
  if (p === "rayon" || e.variante === "segment") return "Nombre non reconnu : écris un nombre, par exemple 4 ou 7,5. Cette saisie ne compte pas comme une tentative.";
  if (p === "proba") return "Probabilité non reconnue : écris un nombre exact, par exemple 3/8, 0,25 ou 1 − π/6. Cette saisie ne compte pas comme une tentative.";
  return "Aire non reconnue : écris un nombre exact, par exemple 36π, 48 ou 64 − 16π. Cette saisie ne compte pas comme une tentative.";
}

export const MESSAGE_APPROCHEE = "C'est une valeur approchée : la consigne demande la valeur exacte (garde π et les fractions). Cette saisie ne compte pas comme une tentative.";

const COURS = "(cours, § 1)";

export function aide1(e: E, p: P): AideEcran {
  switch (p) {
    case "totale":
      if (e.variante === "carreDisque") return { texte: [t("Aire d'un carré de côté "), l("c"), t(" :")], latex: "\\mathcal{A}=c^2" };
      if (e.variante === "rectangleQuart") return { texte: [t("Aire d'un rectangle de longueur "), l("L"), t(" et de largeur "), l("l"), t(" :")], latex: "\\mathcal{A}=L\\times l" };
      if (e.variante === "rendezVous") return { texte: [t("Les arrivées possibles forment un carré dont le côté est la durée du créneau, en minutes :")], latex: "\\mathcal{A}=\\text{côté}^2" };
      return { texte: [t("Aire d'un disque de rayon "), l("r"), t(" :")], latex: "\\mathcal{A}=\\pi r^2" };
    case "favorable":
      switch (e.variante) {
        case "cible":
          return e.r1 === 0
            ? { texte: [t("La zone grisée est un disque :")], latex: "\\mathcal{A}=\\pi r^2" }
            : { texte: [t("Aire d'une couronne = aire du grand disque moins aire du petit disque :")], latex: "\\mathcal{A}=\\pi r_2^2-\\pi r_1^2" };
        case "cibleInverse":
          return { texte: [t(`Probabilité géométrique ${COURS} : la probabilité est le quotient des aires, donc l'aire du disque central vaut la probabilité multipliée par l'aire de la cible :`)], latex: "\\mathcal{A}_{\\text{disque}}=P\\times\\mathcal{A}_{\\text{cible}}" };
        case "carreDisque":
          return e.hors
            ? { texte: [t("La zone grisée est le carré privé du disque inscrit, dont le rayon est la moitié du côté :")], latex: "\\mathcal{A}=c^2-\\pi\\left(\\dfrac{c}{2}\\right)^2" }
            : { texte: [t("Le disque inscrit a pour rayon la moitié du côté du carré :")], latex: "\\mathcal{A}=\\pi\\left(\\dfrac{c}{2}\\right)^2" };
        case "rectangleQuart":
          return e.hors
            ? { texte: [t("La zone grisée est le rectangle privé du quart de disque (un quart de l'aire d'un disque) :")], latex: "\\mathcal{A}=L\\times l-\\dfrac{\\pi r^2}{4}" }
            : { texte: [t("Un quart de disque a le quart de l'aire du disque :")], latex: "\\mathcal{A}=\\dfrac{\\pi r^2}{4}" };
        case "segment":
          return { texte: [t("Sur un segment, on compare des longueurs : repère sur "), l("[AB]"), t(" toutes les positions de "), l("M"), t(" qui conviennent ("), l("AM"), t(" est la distance de "), l("A"), t(" à "), l("M"), t(", "), l("MB"), t(" celle de "), l("M"), t(" à "), l("B"), t(").")] };
        case "rendezVous":
          return { texte: [t("Hors de la bande, il reste deux triangles rectangles isocèles ; l'aire d'un triangle rectangle est la moitié du produit des côtés de l'angle droit :")], latex: "\\mathcal{A}=\\dfrac{a\\times a}{2}" };
      }
      break;
    case "rayon":
      return { texte: [t("L'aire du disque central est "), l("\\pi r^2"), t(" : on résout l'équation, en gardant la solution positive (un rayon).")] };
    case "proba":
      if (e.variante === "segment") return { texte: [t(`Probabilité géométrique sur un segment ${COURS} :`)], latex: "P=\\dfrac{\\text{longueur favorable}}{\\text{longueur totale}}" };
      return { texte: [t(`Probabilité géométrique ${COURS} :`)], latex: "P=\\dfrac{\\text{aire favorable}}{\\text{aire totale}}" };
  }
  return { texte: [] };
}

export function aide2(e: E, p: P): AideEcran | null {
  switch (p) {
    case "totale":
      if (e.variante === "carreDisque") return { texte: [t("Ici, le côté vaut "), l(`${e.c}`), t(" cm :")], latex: `\\mathcal{A}=${e.c}^2` };
      if (e.variante === "rectangleQuart") return { texte: [t("Ici :")], latex: `\\mathcal{A}=${e.L}\\times ${e.l}` };
      if (e.variante === "rendezVous") return { texte: [t("Le créneau dure "), l(`${e.T}`), t(" minutes :")], latex: `\\mathcal{A}=${e.T}^2` };
      return { texte: [t("Ici, le rayon de la cible vaut "), l(`${e.variante === "cible" || e.variante === "cibleInverse" ? e.R : 0}`), t(" cm :")], latex: `\\mathcal{A}=\\pi\\cdot ${e.variante === "cible" || e.variante === "cibleInverse" ? e.R : 0}^2` };
    case "favorable":
      switch (e.variante) {
        case "cible":
          return e.r1 === 0 ? { texte: [t("Ici :")], latex: `\\mathcal{A}=\\pi\\cdot ${e.r2}^2` } : { texte: [t("Ici :")], latex: `\\mathcal{A}=\\pi\\cdot ${e.r2}^2-\\pi\\cdot ${e.r1}^2` };
        case "cibleInverse":
          return { texte: [t("Ici :")], latex: `\\mathcal{A}=${qL(probaDonnee(e))}\\times ${e.R * e.R}\\pi` };
        case "carreDisque":
          return { texte: [t("Ici, le rayon vaut "), l(`\\dfrac{${e.c}}{2}=${e.c / 2}`), t(" cm :")], latex: e.hors ? `\\mathcal{A}=${e.c}^2-\\pi\\cdot ${e.c / 2}^2` : `\\mathcal{A}=\\pi\\cdot ${e.c / 2}^2` };
        case "rectangleQuart":
          return { texte: [t("Ici :")], latex: e.hors ? `\\mathcal{A}=${e.L}\\times ${e.l}-\\dfrac{\\pi\\cdot ${e.r}^2}{4}` : `\\mathcal{A}=\\dfrac{\\pi\\cdot ${e.r}^2}{4}` };
        case "segment":
          if (e.type === "entre") return { texte: [l("M"), t(" doit se trouver entre les points situés à "), l(`${e.a}`), t(" cm et à "), l(`${e.b}`), t(" cm de "), l("A"), t(" :")], latex: `${e.a}\\le AM\\le ${e.b}` };
          if (e.type === "loin") return { texte: [t("« À plus de "), l(`${e.a}`), t(" cm de "), l("B"), t(" » s'écrit "),l(`MB>${e.a}`), t(", c'est-à-dire "), l(`AM<${e.L}-${e.a}`), t(" :")], latex: `${e.a}<AM<${e.L}-${e.a}` };
          return { texte: [t("Le plus long morceau mesure au moins "), l(`${e.a}`), t(" cm si "), l(`AM\\ge ${e.a}`), t(" ou si "), l(`MB\\ge ${e.a}`), t(", c'est-à-dire "), l(`AM\\le ${e.L}-${e.a}`), t(" : deux parties du segment conviennent.")] };
        case "rendezVous":
          return { texte: [t("Chaque triangle blanc a deux côtés de "), l(`${e.T}-${e.t}`), t(" minutes ; il y a deux triangles :")], latex: `\\mathcal{A}=2\\times\\dfrac{(${e.T}-${e.t})^2}{2}` };
      }
      break;
    case "rayon":
      return e.variante === "cibleInverse" ? { texte: [t("Ici :")], latex: `\\pi r^2=${e.r * e.r}\\pi` } : null;
    case "proba": {
      const fav = valPiL(valeurAttendue(e, "favorable"));
      const tot = valPiL(valeurAttendue(e, "totale"));
      if (e.variante === "rendezVous")
        return e.rencontre
          ? { texte: [t("Les deux triangles sont les cas où ils ne se rencontrent pas : passe par l'événement contraire.")], latex: `P=1-\\dfrac{${fav}}{${tot}}` }
          : { texte: [t("Les deux triangles sont exactement les cas où ils ne se rencontrent pas :")], latex: `P=\\dfrac{${fav}}{${tot}}` };
      return { texte: [t("Ici (puis simplifie) :")], latex: `P=\\dfrac{${fav}}{${tot}}` };
    }
  }
  return null;
}
