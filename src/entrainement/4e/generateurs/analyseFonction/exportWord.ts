import type { ExerciceAnalyseFonction } from "../../core/analyseFonction.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { formatFonctionOrdreLatex } from "../../ui/formatAnalyseFonction";
import { pointLatex, q } from "../../ui/corrigeParabole";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAnalyseFonction, type VarianteAnalyseFonctionId } from "./index";
import {
  consigneEtapeAnalyseFonction,
  correctionDetailleeAnalyseFonction,
  formeFactoriseeAnalyseFonction,
  imageLatex,
  lettrePhaseAnalyseFonction,
  lettresLectureAnalyseFonction,
  phasesAnalyseFonction,
  tableauSigneVariationHtml,
  zerosAnalyseFonction,
} from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAnalyseFonction>` pour gen7 (Analyse d'une fonction
 * du second degré, chapitre 1, `AppAnalyseFonction.tsx`) — feuille d'exercices et évaluation.
 *
 * Les écrans du générateur (coefficients, signes de a et de a·b, axe et sommet, image, méthode,
 * factorisation, zéros, tableau de signes et de variation — sans les deux écrans de factorisation
 * pour une fonction non factorisable) sont des étapes d'apprentissage : sur papier, l'énoncé est la
 * fonction et la consigne globale « étudie cette fonction », rendue autosuffisante, et chaque écran
 * devient une étape du corrigé détaillé (`corrigeDetaille.ts`, partagé avec l'appli), dans le même
 * ordre (lettres a, b, c…). Aucun « Δ » ni « discriminant » (pas encore vus au chapitre 1).
 */

type E = ExerciceAnalyseFonction;

function fonctionLatex(instance: E): string {
  return formatFonctionOrdreLatex(instance.exercice.enonce, instance.ordreTermes);
}

const CONSIGNE_GLOBALE =
  " Étudie cette fonction du second degré : ouverture de la parabole (signe de a), axe de symétrie et coordonnées du sommet, image, zéros (factorise par la méthode la plus rapide, ou justifie qu'il n'y en a pas) et tableau de signes et de variation.";

function construireEnonceAnalyseFonction(instance: E): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(fonctionLatex(instance)), texte(".")],
    questions: phasesAnalyseFonction(instance).map((phase) => ({ consigne: consigneEtapeAnalyseFonction(phase) })),
  };
}

function enoncePapierAnalyseFonction(instance: E): EnoncePapier {
  return {
    section: { enteteFragments: [texte("On considère la fonction "), latex(fonctionLatex(instance)), texte("."), texte(CONSIGNE_GLOBALE)], questions: [] },
  };
}

function sommetLatex(instance: E): string {
  return pointLatex("S", instance.xS, instance.yS);
}

function zerosLatex(instance: E): string {
  const z = zerosAnalyseFonction(instance);
  return z.length === 1 ? `x=${q(z[0]!)}\\ \\text{(zéro double)}` : `x=${q(z[0]!)}\\ \\text{ou}\\ x=${q(z[1]!)}`;
}

function construireCorrectionAnalyseFonction(instance: E): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("Sommet "), latex(sommetLatex(instance)), texte(" ; "), latex(imageLatex(instance))] },
    { type: "html", html: tableauSigneVariationHtml(instance) },
  ];
}

function reponseBreveAnalyseFonction(instance: E): FragmentConsigne[] {
  const { a } = instance.exercice.enonce;
  const fragments: FragmentConsigne[] = [
    texte(`${a > 0 ? "Parabole tournée vers le haut" : "Parabole tournée vers le bas"}, axe `),
    latex(`x=${q(instance.xS)}`),
    texte(", sommet "),
    latex(sommetLatex(instance)),
    texte(", "),
    latex(imageLatex(instance)),
    texte(" ; "),
  ];
  if (instance.exercice.categorie === "irreductible") fragments.push(texte("aucun zéro (non factorisable)."));
  else fragments.push(latex(`f(x)=${formeFactoriseeAnalyseFonction(instance)}`), texte(", zéros "), latex(zerosLatex(instance)), texte("."));
  return fragments;
}

function baremeAnalyseFonction(instance: E): BaremeExercice {
  const L = (p: Parameters<typeof lettrePhaseAnalyseFonction>[1]) => lettrePhaseAnalyseFonction(instance, p);
  const irreductible = instance.exercice.categorie === "irreductible";
  const criteres: CritereBareme[] = [
    { sousQuestion: L("allure"), critere: [texte("Ouverture de la parabole justifiée par le signe de a")], points: 0.5 },
    { sousQuestion: L("axeSommet"), critere: [texte("Axe "), latex(`x=${q(instance.xS)}`), texte(" et sommet "), latex(sommetLatex(instance))], points: 1 },
    { sousQuestion: L("domaineImage"), critere: [latex(imageLatex(instance))], points: 0.5 },
    irreductible
      ? { sousQuestion: L("racinesReconnaissance"), critere: [texte("Absence de zéro justifiée (raccourcis testés, puis sommet du côté de l'ouverture)")], points: 1 }
      : { sousQuestion: L("racinesChamp1"), critere: [texte("Factorisation par la méthode la plus rapide : "), latex(`f(x)=${formeFactoriseeAnalyseFonction(instance)}`)], points: 0.5 },
    ...(irreductible ? [] : [{ sousQuestion: L("racinesChamp2"), critere: [latex(zerosLatex(instance))], points: 0.5 }]),
    { sousQuestion: L("tableauSignes"), critere: [texte("Tableau de signes et de variation complet et cohérent")], points: 1 },
  ];
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Image construite avec l'abscisse du sommet au lieu de son ordonnée")], cout: "0 pt sur l'image" },
    { description: [texte("Signe de "), latex("x_S"), texte(" faux (oubli du « − » de "), latex("-\\dfrac{b}{2a}"), texte(")")], cout: "−0,5, suite notée sans double pénalité" },
  ];
  if (instance.ordreTermes[0] !== "a") erreurs.push({ description: [texte("Coefficients lus dans l'ordre d'écriture plutôt que par degré")], cout: "suite notée sans double pénalité" });
  if (!irreductible) erreurs.push({ description: [texte("Zéros cherchés par une méthode non vue au chapitre (formule générale) au lieu de la factorisation")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreveAnalyseFonction(instance),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Valeurs exactes sous forme décimale exacte (2,5 pour 5/2)")], [texte("Sommet obtenu en complétant le carré plutôt qu'avec la formule de l'abscisse du sommet")]],
  };
}

/** Critères du niveau (grille commune, `export/niveauDifficulte.ts`) : étapes = écrans du corrigé ;
 * lectures : coefficients, signes de a et de a·b, image lue sur le sommet, zéros lus sur la forme
 * factorisée ; la reconnaissance de la méthode est une DÉCISION (une étape). Méthode 1 (choisir
 * parmi les raccourcis du cours). Piège dans les données : termes écrits dans le désordre — jamais la
 * catégorie (c'est le verdict du groupe `groupe_methode`). */
function criteresDifficulteAnalyseFonction(instance: E): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetailleeAnalyseFonction(instance), lettresLectureAnalyseFonction(instance));
  // « Non factorisable » est un VERDICT du groupe `groupe_methode` : niveau et durée ne doivent pas le
  // trahir. Sa preuve (raccourcis écartés, puis sommet du côté de l'ouverture) tient lieu de la
  // factorisation et de la lecture des zéros : comptée comme ces deux écrans (même durée, 14 min).
  const irreductible = instance.exercice.categorie === "irreductible";
  return {
    ...base,
    etapesTransformation: base.etapesTransformation + (irreductible ? 1 : 0),
    etapesLecture: base.etapesLecture + (irreductible ? 1 : 0),
    methode: 1,
    piege: instance.ordreTermes[0] !== "a" ? 1 : 0,
  };
}

export const adaptateurExportWordAnalyseFonction: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Analyse d'une fonction du second degré — Évaluation",
  nomFichierBase: "analyse-fonction-second-degre",
  genererInstance: genererExerciceAnalyseFonction,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteAnalyseFonctionId),
  construireEnonce: construireEnonceAnalyseFonction,
  construireCorrection: construireCorrectionAnalyseFonction,
  criteresDifficulte: criteresDifficulteAnalyseFonction,
  reponseBreve: reponseBreveAnalyseFonction,
  correctionDetaillee: correctionDetailleeAnalyseFonction,
  bareme: baremeAnalyseFonction,
  enoncePapier: enoncePapierAnalyseFonction,
};
