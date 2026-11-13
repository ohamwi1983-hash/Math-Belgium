import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceTraverserRiviere } from "../../core/traverserRiviere.types";
import { abscisseAccostage, duree, estDecimalCourt, estExacte, normeVitesseReelle, valeurAffichee, vitesseReelle } from "../../moteur/modeleTraverserRiviere";
import {
  colonne,
  consignesEcrans,
  enonceFragments,
  etapesParQuestionPapier,
  membreDroit,
  n,
  questionsPapier,
  radicande,
  resultatFragments,
  SOMME,
  sujet,
  VC,
  VP,
  VR,
} from "../../ui/formatTraverserRiviere";
import { construireFigureTraverserRiviere } from "../../ui/figureTraverserRiviere";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTraverserRiviere } from "./index";
import { profilTraverserRiviere } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen87. Énoncé papier = situation + figure (« ? »
 * sur les inconnues) + les VRAIES questions : a) la durée, b) le point d'accostage, c) la vitesse
 * réelle ou la distance parcourue (ou, pour « juste en face » : a) les composantes de la vitesse
 * propre, b) la durée). Les écrans d'apprentissage (vitesse réelle en composantes, compensation…)
 * deviennent les étapes a, b, c, d du corrigé ; la figure à l'échelle (triangle des vitesses,
 * trajectoire) accompagne la dernière conclusion (`figureHtml`).
 */

const NBSP = "\u00a0";

function figureEnonce(e: ExerciceTraverserRiviere): string {
  return construireFigureTraverserRiviere(e, { theme: "papier" });
}

function figureCorrige(e: ExerciceTraverserRiviere): string {
  return construireFigureTraverserRiviere(e, { theme: "papier", resolue: true });
}

function enonceAvecConsigne(e: ExerciceTraverserRiviere): FragmentConsigne[] {
  return [...enonceFragments(e), texte(" Travaille avec les composantes des vitesses dans ce repère.")];
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceTraverserRiviere): SectionExercice {
  return {
    enteteFragments: enonceAvecConsigne(e),
    enteteHtml: figureEnonce(e),
    questions: consignesEcrans(e, "papier").map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceTraverserRiviere): EnoncePapier {
  return {
    section: {
      enteteFragments: enonceAvecConsigne(e),
      enteteHtml: figureEnonce(e),
      questions: questionsPapier(e).map((consigne) => ({ consigne })),
    },
    etapesParQuestion: etapesParQuestionPapier(e),
  };
}

/** Norme de la vitesse réelle en LaTeX : « 2{,}5 » si décimale, sinon « \\sqrt{10{,}25} ». */
function normeLatex(e: ExerciceTraverserRiviere): string {
  return estExacte(e, "vitesse") ? n(valeurAffichee(e, "vitesse")) : `\\sqrt{${n(radicande(e, "vitesse"))}}`;
}

/** « = \\sqrt{16{,}25} \\approx 4{,}03 » ou « = \\sqrt{25} = 5 » : suite d'un calcul de norme. */
function apresRacine(e: ExerciceTraverserRiviere, g: "vitesse" | "distance"): string {
  return `= \\sqrt{${n(radicande(e, g))}} ${estExacte(e, g) ? "=" : "\\approx"} ${n(valeurAffichee(e, g))}`;
}

function reponseBreve(e: ExerciceTraverserRiviere): FragmentConsigne[] {
  if (e.variante === "enFace") {
    return [latex(`${VP}${colonne(n(-e.courant), estExacte(e, "pythagore") ? n(valeurAffichee(e, "pythagore")) : `\\approx ${n(valeurAffichee(e, "pythagore"))}`)}`), texte(" ; "), ...resultatFragments(e, "dureeEnFace")];
  }
  return [...resultatFragments(e, "duree"), texte(" ; "), ...resultatFragments(e, "accostage"), texte(" ; "), ...resultatFragments(e, e.quatrieme)];
}

function correctionAccostage(e: ExerciceTraverserRiviere): EtapeCorrection[] {
  const c = n(e.courant);
  const vR = vitesseReelle(e);
  const t = duree(e);
  const xA = abscisseAccostage(e);
  const s = sujet(e);
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte(e.perpendiculaire ? "Vitesse propre perpendiculaire aux rives : " : "Vitesse propre donnée : "),
        latex(`${VP}${colonne(n(e.px), n(e.py))}`),
        texte(" ; courant parallèle aux rives, dans le sens de l'axe x : "),
        latex(`${VC}${colonne(c, "0")}`),
        texte(". On additionne composante par composante."),
      ],
    },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`${SOMME} = ${colonne(`${n(e.px)} + ${c}`, `${n(e.py)} + 0`)} = ${colonne(n(vR.x), n(vR.y))}`)] },
    {
      label: "Méthode",
      sousQuestion: "b",
      fragments: [
        texte("Seule la composante y de la vitesse réelle rapproche de l'autre rive ; la composante x fait glisser le long de la rive. Il faut parcourir la largeur L selon y : "),
        latex(`t = \\dfrac{L}{y_{${VR}}}`),
        texte("."),
      ],
    },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`t = \\dfrac{${n(e.largeur)}}{${n(vR.y)}} = ${n(t)}`), texte(`${NBSP}s.`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [texte("La traversée dure "), latex(n(t)), texte(`${NBSP}s.`)] },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [
        texte("Pendant ce temps, la composante x de la vitesse réelle fait glisser vers l'aval : "),
        latex(`x_A = x_{${VR}} \\cdot t = ${n(vR.x)} \\cdot ${n(t)} = ${n(xA)}`),
        texte(`${NBSP}m.`),
      ],
    },
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [texte(`${s.replace(/^./, (x) => x.toUpperCase())} accoste au point `), latex(`A(${n(xA)}\\,;\\,${n(e.largeur)})`), texte(", à "), latex(n(xA)), texte(`${NBSP}m en aval du point F.`)],
    },
  ];
  if (e.quatrieme === "vitesse") {
    etapes.push(
      { label: "Méthode", sousQuestion: "d", fragments: [texte("Norme à partir des composantes : "), latex(`\\|${VR}\\| = \\sqrt{x_{${VR}}^2 + y_{${VR}}^2}`), texte(".")] },
      { label: "Calcul", sousQuestion: "d", fragments: [latex(`\\|${VR}\\| = \\sqrt{${n(vR.x)}^2 + ${n(vR.y)}^2} ${apresRacine(e, "vitesse")}`), texte(`${NBSP}m/s.`)] },
      { label: "Conclusion", sousQuestion: "d", fragments: [texte("Vitesse réelle : "), ...resultatFragments(e, "vitesse"), texte("."), texte(" Figure : triangle des vitesses et trajectoire réelle [DA].")], figureHtml: figureCorrige(e) },
    );
  } else {
    etapes.push(
      {
        label: "Méthode",
        sousQuestion: "d",
        fragments: [texte("Le trajet réel est le segment [DA], avec "), latex("D(0\\,;\\,0)"), texte(" et "), latex(`A(${n(xA)}\\,;\\,${n(e.largeur)})`), texte(" : "), latex("DA = \\sqrt{x_A^2 + L^2}"), texte(".")],
      },
      {
        label: "Calcul",
        sousQuestion: "d",
        fragments: [latex(`DA = \\sqrt{${n(xA)}^2 + ${n(e.largeur)}^2} ${apresRacine(e, "distance")}`), texte(`${NBSP}m.`)],
      },
      {
        label: "Contrôle",
        sousQuestion: "d",
        fragments: [texte("Même résultat avec la vitesse réelle : "), latex(`DA = \\|${VR}\\| \\cdot t = ${normeLatex(e)} \\cdot ${n(t)} ${estExacte(e, "distance") ? "=" : "\\approx"} ${n(valeurAffichee(e, "distance"))}`), texte(`${NBSP}m.`)],
      },
      { label: "Conclusion", sousQuestion: "d", fragments: [texte("Distance réellement parcourue : "), ...resultatFragments(e, "distance"), texte("."), texte(" Figure : triangle des vitesses et trajectoire réelle [DA].")], figureHtml: figureCorrige(e) },
    );
  }
  etapes.push({
    label: "Piège",
    sousQuestion: "b",
    fragments: [
      texte("Le courant ne change pas la durée de la traversée : il ne fait que déporter le long de la rive. Diviser L par la vitesse réelle donnerait "),
      latex(`\\dfrac{${n(e.largeur)}}{${normeLatex(e)}} ${estDecimalCourt(e.largeur / normeVitesseReelle(e)) ? "=" : "\\approx"} ${n(Math.round((e.largeur / normeVitesseReelle(e)) * 10) / 10)}`),
      texte(`${NBSP}s, ce qui est faux.`),
    ],
  });
  return etapes;
}

function correctionEnFace(e: ExerciceTraverserRiviere): EtapeCorrection[] {
  const c = n(e.courant);
  const v = n(e.normePropre);
  const exacte = estExacte(e, "pythagore");
  const y = valeurAffichee(e, "pythagore");
  const s = sujet(e);
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte("Pour arriver en F, la vitesse réelle "),
        latex(SOMME),
        texte(" est dirigée selon l'axe y : sa composante x est nulle. Le courant a pour composantes "),
        latex(`${VC}${colonne(c, "0")}`),
        texte("."),
      ],
    },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`x_{${VP}} + ${c} = 0`), texte(", donc "), latex(`x_{${VP}} = ${n(-e.courant)}`), texte(`${NBSP}m/s.`)] },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`${s.replace(/^./, (x) => x.toUpperCase())} doit viser vers l'amont, contre le courant.`)] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("La norme de la vitesse propre est connue (Pythagore dans le repère) : "), latex(`x_{${VP}}^2 + y_{${VP}}^2 = \\|${VP}\\|^2`), texte(".")] },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [latex(`y_{${VP}} = \\sqrt{${v}^2 - (${n(-e.courant)})^2} = \\sqrt{${n(radicande(e, "pythagore"))}} ${exacte ? "=" : "\\approx"} ${n(y)}`), texte(`${NBSP}m/s (positive : vers l'autre rive).`)],
    },
    { label: "Conclusion", sousQuestion: "b", fragments: [texte("Vitesse propre à adopter : "), latex(`${VP}${colonne(n(-e.courant), exacte ? n(y) : `\\approx ${n(y)}`)}`), texte(" (en m/s).")] },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [
        texte("La vitesse réelle est "),
        latex(`${VR}${colonne("0", `y_{${VP}}`)}`),
        texte(" : "),
        latex(`t = \\dfrac{L}{y_{${VP}}} = \\dfrac{${n(e.largeur)}}{${exacte ? n(y) : `\\sqrt{${n(radicande(e, "pythagore"))}}`}} ${membreDroit(e, "dureeEnFace")}`),
        texte(`${NBSP}s${exacte ? "" : " (valeur exacte de la composante gardée en mémoire)"}.`),
      ],
    },
    { label: "Conclusion", sousQuestion: "c", fragments: [texte("Durée de la traversée : "), ...resultatFragments(e, "dureeEnFace"), texte("."), texte(" Figure : triangle des vitesses.")], figureHtml: figureCorrige(e) },
    {
      label: "Piège",
      sousQuestion: "b",
      fragments: [
        texte("La composante y n'est pas "),
        latex(`${v} - ${c} = ${n(e.normePropre - e.courant)}`),
        texte(" : on ne soustrait pas les normes, les composantes se combinent par Pythagore. Et viser juste en face (vitesse propre selon y) ne suffit pas : le courant ferait accoster en aval."),
      ],
    },
  ];
}

function correctionDetaillee(e: ExerciceTraverserRiviere): EtapeCorrection[] {
  return e.variante === "enFace" ? correctionEnFace(e) : correctionAccostage(e);
}

function construireCorrection(e: ExerciceTraverserRiviere): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceTraverserRiviere): BaremeExercice {
  if (e.variante === "enFace") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Composante x de la vitesse propre : opposée au courant (signe compris)")], points: 1 },
        { sousQuestion: "b", critere: [texte("Composante y par Pythagore, avec l'unité")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Durée : largeur divisée par la composante y")], points: 1.5 },
      ],
      erreursFrequentes: [
        { description: [texte("Composante x égale au courant (signe oublié : la vitesse propre irait vers l'aval)")], cout: "0 pt sur l'étape a" },
        { description: [texte("Composante y obtenue par une différence des normes")], cout: "0 pt sur l'étape b" },
        { description: [texte("Durée calculée avec la norme de la vitesse propre")], cout: "0 pt sur l'étape c" },
        { description: [texte("Unité absente ou fausse")], cout: "−0,5 pt" },
      ],
      reponsesAcceptees: [[texte("Valeur exacte avec une racine carrée")], [texte("Écart d'environ 1 % dû aux arrondis intermédiaires")], [texte("Résultat juste à partir d'une valeur intermédiaire fausse : points de méthode accordés (pas de double sanction)")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Vitesse réelle en composantes (courant sur la composante x)")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Durée : largeur divisée par la composante y")], points: 1 },
      { sousQuestion: "c", critere: [texte("Point d'accostage : composante x multipliée par la durée")], points: 1.5 },
      { sousQuestion: "d", critere: [texte(e.quatrieme === "vitesse" ? "Vitesse réelle : norme par Pythagore, avec l'unité" : "Distance parcourue : Pythagore (ou vitesse réelle multipliée par la durée), avec l'unité")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Durée calculée avec la vitesse réelle (le courant ne change pas la durée)")], cout: "0 pt sur l'étape b" },
      ...(e.perpendiculaire ? [] : [{ description: [texte("Point d'accostage calculé avec le seul courant, sans la composante x de la vitesse propre")], cout: "moitié des points de l'étape c" }]),
      { description: [texte(e.quatrieme === "vitesse" ? "Norme obtenue en additionnant les composantes" : "Distance obtenue en additionnant la largeur et la dérive")], cout: "0 pt sur l'étape d" },
      { description: [texte("Unité absente ou fausse")], cout: "−0,5 pt" },
    ],
    reponsesAcceptees: [[texte("Valeur exacte avec une racine carrée")], [texte("Résultat juste à partir d'une valeur intermédiaire fausse : points de méthode accordés (pas de double sanction)")]],
  };
}

function difficulte(e: ExerciceTraverserRiviere): 1 | 2 | 3 {
  if (e.variante === "enFace") return 3;
  return e.perpendiculaire ? 2 : 3;
}

export const adaptateurEvaluationTraverserRiviere: AdaptateurFeuilleExercices<ExerciceTraverserRiviere> = {
  profilInstance: profilTraverserRiviere,
  titreDocument: "Traverser une rivière : vitesses en composantes — Évaluation",
  nomFichierBase: "traverser-riviere-composantes",
  genererInstance: genererExerciceTraverserRiviere,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 7,
};
