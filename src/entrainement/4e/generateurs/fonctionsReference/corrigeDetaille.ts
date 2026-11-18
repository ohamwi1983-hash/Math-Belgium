import type { ExerciceFonctionReference, FamilleReference } from "../../core/fonctionsReference.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { pointUnitaire } from "../../moteur/verificationFonctionsReference";
import { formatEquationFonctionReferenceLatex } from "../../ui/formatFonctionsReference";
import { COURS_FAMILLES, COURS_TRANSFORMATIONS, nombreTexte, plusQ, q, qp, sansDoublons } from "../../ui/corrigeChapitre3";
import { construireGrapheFonctionReference } from "./figures";

/**
 * Corrigé détaillé « comme au tableau » de gen10 (transformer une fonction de référence, lecture
 * d'un graphique) — règle `.claude/rules/feuilles-evaluations.md`. Étapes : a) famille (écran
 * « reconnaissance »), b) translations, c) facteurs et symétries, d) équation (b, c et d forment
 * l'écran « exercice »). Équation tirée de `formatEquationFonctionReferenceLatex` (la réponse de
 * l'écran), points de `pointUnitaire` (le graphe de l'écran) ; partagé par l'adaptateur papier et
 * l'appli.
 */

type E = ExerciceFonctionReference;

export const FAMILLES_PAIRES: FamilleReference[] = ["carre", "valeur_absolue"];
export const FAMILLES_IMPAIRES: FamilleReference[] = ["cube", "racine_cubique", "inverse"];

export const BASE_LATEX: Record<FamilleReference, string> = {
  carre: "y = x^2",
  cube: "y = x^3",
  racine_carree: "y = \\sqrt{x}",
  racine_cubique: "y = \\sqrt[3]{x}",
  inverse: "y = \\dfrac{1}{x}",
  valeur_absolue: "y = |x|",
};

const NOM: Record<FamilleReference, string> = {
  carre: "la fonction carré",
  cube: "la fonction cube",
  racine_carree: "la fonction racine carrée",
  racine_cubique: "la fonction racine cubique",
  inverse: "la fonction inverse",
  valeur_absolue: "la fonction valeur absolue",
};

/** Mêmes paramètres sous la forme la plus simple : g paire → SOY inutile ; g impaire → SOY devient SOX. */
export function exerciceSimplifie(e: E): E {
  if (!e.soy) return e;
  if (FAMILLES_PAIRES.includes(e.famille)) return { ...e, soy: false };
  if (FAMILLES_IMPAIRES.includes(e.famille)) return { ...e, soy: false, sox: !e.sox };
  return e;
}

export function equationLatex(e: E): string {
  return formatEquationFonctionReferenceLatex(exerciceSimplifie(e));
}

function coord(x: number, y: number): string {
  return `(${q(x)}\\,;\\,${q(y)})`;
}

function translationTexte(valeur: number, sens: string, positif: string, negatif: string): string {
  if (valeur === 0) return `pas de translation ${sens}`;
  return `translation ${sens} de ${nombreTexte(Math.abs(valeur))} unité${Math.abs(valeur) > 1 ? "s" : ""} vers ${valeur > 0 ? positif : negatif}`;
}

function etapeFamille(e: E): EtapeCorrection[] {
  const { th, tv } = e;
  const lignes: LigneCalcul[] = (() => {
    switch (e.famille) {
      case "carre":
        return [ligne(`x=${q(th)}`, "axe de symétrie vertical ; creux arrondi, sans asymptote : une parabole")];
      case "valeur_absolue":
        return [ligne(`x=${q(th)}`, "axe de symétrie vertical ; la pointe du V est sur cet axe")];
      case "cube":
        return [ligne(`\\text{centre}=${coord(th, tv)}`, "centre de symétrie ; la courbe y a un replat horizontal (courbe en S)")];
      case "racine_cubique":
        return [ligne(`\\text{centre}=${coord(th, tv)}`, "centre de symétrie ; la courbe y est verticale (S couché)")];
      case "racine_carree":
        return [ligne(`x${e.soy ? "\\leq" : "\\geq"}${q(th)}`, "la courbe n'existe que d'un côté de ce point : une demi-branche qui part du point")];
      case "inverse":
        return [ligne(`x=${q(th)}`, "asymptote verticale"), ligne(`y=${q(tv)}`, "asymptote horizontale : deux branches, une hyperbole")];
    }
  })();
  const pieges: Record<FamilleReference, FragmentConsigne[]> = {
    carre: [texte("Parabole ou V ? La parabole a un creux arrondi, le V une pointe : ne pas confondre "), latex("x^2"), texte(" et "), latex("|x|"), texte(".")],
    valeur_absolue: [texte("V ou parabole ? Une pointe (deux demi-droites) signe "), latex("|x|"), texte(", un creux arrondi "), latex("x^2"), texte(".")],
    cube: [texte("Replat horizontal au centre : "), latex("x^3"), texte(" ; la courbe verticale au centre serait "), latex("\\sqrt[3]{x}"), texte(".")],
    racine_cubique: [texte("Courbe verticale au centre : "), latex("\\sqrt[3]{x}"), texte(" ; un replat horizontal serait "), latex("x^3"), texte(".")],
    racine_carree: [texte("Une seule demi-branche, qui part d'un point : "), latex("\\sqrt{x}"), texte(", pas "), latex("\\dfrac{1}{x}"), texte(" (deux branches) ni "), latex("\\sqrt[3]{x}"), texte(" (courbe des deux côtés).")],
    inverse: [texte("Le point caractéristique de "), latex("\\dfrac{1}{x}"), texte(" n'est pas sur la courbe : c'est le centre, intersection des asymptotes.")],
  };
  return [
    utilise("a", [texte(`Chaque fonction de référence a une allure propre : axe ou centre de symétrie, pointe ou creux arrondi, demi-branche, asymptotes ${COURS_FAMILLES}.`)]),
    calcul("a", lignes, [texte("Ce qu'on lit sur la courbe :")]),
    resultat("a", [texte(`La courbe est issue de ${NOM[e.famille]} `), latex(BASE_LATEX[e.famille]), texte(".")]),
    piege("a", pieges[e.famille]),
  ];
}

function etapeTranslations(e: E): EtapeCorrection[] {
  const { th, tv } = e;
  const inverse = e.famille === "inverse";
  return [
    utilise("b", [
      ...(inverse
        ? [texte("Le centre "), latex("(0\\,;\\,0)"), texte(" de "), latex("y = \\dfrac{1}{x}"), texte(", intersection des asymptotes, est amené par les translations au point caractéristique")]
        : [texte("Le point "), latex("(0\\,;\\,0)"), texte(" de "), latex(BASE_LATEX[e.famille]), texte(" est amené par les translations au point caractéristique")]),
      texte(` ; un étirement, une compression ou une symétrie ne le déplace pas ${COURS_TRANSFORMATIONS}.`),
    ]),
    {
      ...calcul("b", [
        ligne(`(\\text{TH}\\,;\\,\\text{TV})=${coord(th, tv)}`, inverse ? "centre lu à l'intersection des asymptotes" : "point caractéristique lu sur le graphique"),
        ligne(`\\text{TH}=${q(th)}`, `abscisse : ${translationTexte(th, "horizontale", "la droite", "la gauche")}`),
        ligne(`\\text{TV}=${q(tv)}`, `ordonnée : ${translationTexte(tv, "verticale", "le haut", "le bas")}`),
      ]),
      figureHtml: construireGrapheFonctionReference(e, true),
    },
    resultat("b", [latex(`\\text{TH}=${q(th)} \\qquad \\text{TV}=${q(tv)}`)]),
    piege(
      "b",
      th !== 0
        ? [texte(`La translation de ${nombreTexte(Math.abs(th))} vers ${th > 0 ? "la droite" : "la gauche"} s'écrit `), latex(th > 0 ? `x-${q(th)}` : `x+${q(-th)}`), texte(" dans l'argument : le signe est l'opposé du sens du déplacement.")]
        : [texte("Une translation de 3 unités vers la droite s'écrit "), latex("x - 3"), texte(" dans l'argument : le signe est l'opposé du sens du déplacement.")],
    ),
  ];
}

function etapeFacteurs(e: E): EtapeCorrection[] {
  const croix = pointUnitaire(e);
  const dx = croix.x - e.th;
  const dy = croix.y - e.tv;
  const lignes: LigneCalcul[] = [
    ligne(`\\Delta x=${q(croix.x)}-${qp(e.th)}`, dx < 0 ? "écart horizontal du point croix au point caractéristique, négatif : symétrie d'axe vertical (SOY)" : "écart horizontal du point croix au point caractéristique"),
    ligne(`=${q(dx)}`),
    ligne(`\\Delta y=${q(croix.y)}-${qp(e.tv)}`, dy < 0 ? "écart vertical, négatif : symétrie d'axe horizontal (SOX)" : "écart vertical"),
    ligne(`=${q(dy)}`),
  ];
  if (e.eh > 1) lignes.push(ligne(`\\text{EH}=|\\Delta x|=${e.eh}`, "écart plus grand que 1 : étirement horizontal"));
  else if (e.ch > 1) lignes.push(ligne(`\\text{CH}=\\dfrac{1}{|\\Delta x|}=${e.ch}`, "écart plus petit que 1 : compression horizontale"));
  else lignes.push(ligne("|\\Delta x|=1", "ni étirement ni compression horizontale"));
  if (e.ev > 1) lignes.push(ligne(`\\text{EV}=|\\Delta y|=${e.ev}`, "écart plus grand que 1 : étirement vertical"));
  else if (e.cv > 1) lignes.push(ligne(`\\text{CV}=\\dfrac{1}{|\\Delta y|}=${e.cv}`, "écart plus petit que 1 : compression verticale"));
  else lignes.push(ligne("|\\Delta y|=1", "ni étirement ni compression verticale"));
  const items: string[] = [];
  if (e.eh > 1) items.push(`\\text{EH}=${e.eh}`);
  if (e.ch > 1) items.push(`\\text{CH}=${e.ch}`);
  if (e.soy) items.push("\\text{SOY}");
  if (e.ev > 1) items.push(`\\text{EV}=${e.ev}`);
  if (e.cv > 1) items.push(`\\text{CV}=${e.cv}`);
  if (e.sox) items.push("\\text{SOX}");
  const etapes: EtapeCorrection[] = [
    utilise("c", [
      texte("Le point "),
      latex("(1\\,;\\,1)"),
      texte(" de la fonction de référence est à 1 unité à droite et 1 unité au-dessus de "),
      latex("(0\\,;\\,0)"),
      texte(". Sur la courbe de f, son image (le point croix) est à "),
      latex("\\Delta x"),
      texte(" et "),
      latex("\\Delta y"),
      texte(" du point caractéristique : "),
      latex("|\\Delta x|"),
      texte(" vaut EH ou "),
      latex("\\dfrac{1}{\\text{CH}}"),
      texte(", "),
      latex("|\\Delta y|"),
      texte(" vaut EV ou "),
      latex("\\dfrac{1}{\\text{CV}}"),
      texte(`, un écart négatif signale une symétrie ${COURS_TRANSFORMATIONS}.`),
    ]),
    calcul("c", lignes, [texte("Point croix lu : "), latex(coord(croix.x, croix.y)), texte(" ; point caractéristique : "), latex(coord(e.th, e.tv)), texte(".")]),
    resultat("c", items.length === 0 ? [texte("Aucun étirement, aucune compression, aucune symétrie.")] : [latex(items.join(",\\ "))]),
  ];
  if (e.soy && FAMILLES_PAIRES.includes(e.famille)) {
    etapes.push(verification("c", [texte("La fonction de référence est paire : la symétrie d'axe vertical autour du point caractéristique ne change pas la courbe, on peut ne pas l'écrire.")]));
  } else if (e.soy && FAMILLES_IMPAIRES.includes(e.famille)) {
    etapes.push(verification("c", [texte("La fonction de référence est impaire : "), latex("g(-u)=-g(u)"), texte(", le signe « − » de l'argument peut sortir devant la fonction.")]));
  }
  etapes.push(
    piege(
      "c",
      e.ch > 1 || e.cv > 1
        ? [texte("Un écart de "), latex(e.ch > 1 ? `\\dfrac{1}{${e.ch}}` : `\\dfrac{1}{${e.cv}}`), texte(" signale une compression de facteur "), latex(String(e.ch > 1 ? e.ch : e.cv)), texte(", pas un étirement.")]
        : [texte("Le facteur se lit sur l'écart au point caractéristique, pas sur les coordonnées du point croix elles-mêmes.")],
    ),
  );
  return etapes;
}

const NEUTRE = { th: 0, tv: 0, ch: 1, eh: 1, ev: 1, cv: 1, sox: false, soy: false };

function corps(e: E): string {
  return formatEquationFonctionReferenceLatex(e).replace(/^f\(x\) = /, "").replace(/\\frac/g, "\\dfrac");
}

function etapeEquation(e: E): EtapeCorrection[] {
  // Construction de l'équation dans l'ordre de la formule unifiée : une transformation par ligne.
  const etats: { ex: E; justification: string }[] = [];
  let courant: E = { famille: e.famille, ...NEUTRE };
  const ajouter = (modif: Partial<E>, justification: string) => {
    courant = { ...courant, ...modif };
    etats.push({ ex: courant, justification });
  };
  if (e.th !== 0) ajouter({ th: e.th }, `TH = ${nombreTexte(e.th)} : x devient ${e.th > 0 ? `x − ${nombreTexte(e.th)}` : `x + ${nombreTexte(-e.th)}`}`);
  if (e.ch > 1) ajouter({ ch: e.ch }, `CH = ${e.ch} : l'argument est multiplié par ${e.ch}`);
  if (e.eh > 1) ajouter({ eh: e.eh }, `EH = ${e.eh} : l'argument est divisé par ${e.eh}`);
  if (e.soy) ajouter({ soy: true }, "SOY : l'argument change de signe");
  if (e.ev > 1) ajouter({ ev: e.ev }, `EV = ${e.ev} : la fonction est multipliée par ${e.ev}`);
  if (e.cv > 1) ajouter({ cv: e.cv }, `CV = ${e.cv} : la fonction est divisée par ${e.cv}`);
  if (e.sox) ajouter({ sox: true }, "SOX : signe « − » devant la fonction");
  if (e.tv !== 0) ajouter({ tv: e.tv }, `TV = ${nombreTexte(e.tv)} : on ${e.tv > 0 ? "ajoute" : "soustrait"} ${nombreTexte(Math.abs(e.tv))}`);
  if (etats.length === 0) etats.push({ ex: e, justification: "aucune transformation : f est la fonction de référence" });
  const lignes: LigneCalcul[] = [ligne(BASE_LATEX[e.famille], "fonction de référence")];
  etats.forEach(({ ex, justification }, i) => lignes.push(ligne(`${i === etats.length - 1 ? "f(x)" : "y"}=${corps(ex)}`, justification)));
  const simple = equationLatex(e);
  if (simple !== formatEquationFonctionReferenceLatex(e)) {
    lignes.push(ligne(`=${simple.replace(/^f\(x\) = /, "").replace(/\\frac/g, "\\dfrac")}`, FAMILLES_PAIRES.includes(e.famille) ? "g paire : g(−u) = g(u)" : "g impaire : g(−u) = −g(u), le signe sort devant"));
  }
  const croix = pointUnitaire(e);
  const k = e.ch / e.eh;
  const argument = `${e.soy ? "-" : ""}${k === 1 ? "" : `${q(k)}\\cdot `}(${q(croix.x)}${e.th >= 0 ? "-" : "+"}${q(Math.abs(e.th))})`;
  const facteur = (e.sox ? -1 : 1) * (e.ev / e.cv);
  return [
    utilise("d", [
      texte("Formule unifiée : "),
      latex("f(x)=\\text{SOX}\\cdot\\dfrac{\\text{EV}}{\\text{CV}}\\cdot g\\!\\left(\\text{SOY}\\cdot\\dfrac{\\text{CH}}{\\text{EH}}\\cdot(x-\\text{TH})\\right)+\\text{TV}"),
      texte(` ; on applique les transformations à g une à une, de l'intérieur vers l'extérieur ${COURS_TRANSFORMATIONS}.`),
    ]),
    calcul("d", sansDoublons(lignes)),
    resultat("d", [latex(simple)]),
    verification(
      "d",
      [texte("Le point croix "), latex(coord(croix.x, croix.y)), texte(" doit vérifier l'équation : l'argument y vaut 1, et "), latex("g(1)=1"), texte(".")],
      [ligne(`${argument}=1`, "argument en x = abscisse du point croix"), ligne(`f\\left(${q(croix.x)}\\right)=${facteur === 1 ? "" : facteur === -1 ? "-" : `${q(facteur)}\\cdot `}1${plusQ(e.tv)}`), ligne(`=${q(croix.y)}`, "ordonnée du point croix ✓")],
    ),
  ];
}

export function correctionDetailleeFonctionsReference(e: E): EtapeCorrection[] {
  return [...etapeFamille(e), ...etapeTranslations(e), ...etapeFacteurs(e), ...etapeEquation(e)];
}
