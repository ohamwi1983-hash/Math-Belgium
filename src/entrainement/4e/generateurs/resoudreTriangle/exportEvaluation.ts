import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceResoudreTriangle } from "../../core/resoudreTriangle.types";
import type { SommetTriangle } from "../../core/triangle.types";
import { autresCotes, coteOppose, estCoteElement, plusGrandAngle, positionObtus, SOMMETS } from "../../moteur/resolutionTriangle";
import { etapeControle, planExercice } from "../../moteur/verificationResoudreTriangle";
import { svgFigureResoudreTriangle } from "../../ui/croquisResoudreTriangle";
import {
  CONSIGNE_CALCULS,
  CONSIGNE_GENERALE,
  CONSIGNE_PAPIER,
  LIBELLES_CONFIGURATION,
  consignesEcrans,
  descriptionEtape,
  donneesFragments,
  elementLatex,
  reponsePremiereLoi,
  resultatLatex,
  resultatsLatex,
  substitutionLatex,
  valeurLatex,
} from "../../ui/formatResoudreTriangle";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceResoudreTriangle } from "./index";
import { profilResoudreTriangle } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen73. Énoncé papier = données + figure aux
 * proportions réelles (inconnues « ? ») + consigne globale (« Résous complètement le triangle… ») ;
 * les quatre écrans (configuration, première loi, calculs, contrôle) deviennent les étapes a, b, c,
 * d du corrigé. Toutes les valeurs viennent des fonctions de l'écran (`ui/formatResoudreTriangle.ts`,
 * `moteur/resolutionTriangle.ts`). Séries équilibrées : `profil.ts`.
 */

const CONSIGNE_CALCULS_PAPIER = CONSIGNE_CALCULS.replace(" (une valeur approchée à environ 1 % près est acceptée)", "");

function donneesHtml(e: ExerciceResoudreTriangle): string {
  return `<p class="paragraphe">${fragmentsVersHtml(donneesFragments(e))}</p>${svgFigureResoudreTriangle(e)}`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceResoudreTriangle): SectionExercice {
  const consignes = consignesEcrans(e);
  consignes[2] = [texte(CONSIGNE_CALCULS_PAPIER)];
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: donneesHtml(e),
    questions: consignes.map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceResoudreTriangle): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(CONSIGNE_GENERALE)],
      enteteHtml: donneesHtml(e),
      questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }],
    },
    etapesParQuestion: [["a", "b", "c", "d"]],
  };
}

function reponseBreve(e: ExerciceResoudreTriangle): FragmentConsigne[] {
  return [latex(resultatsLatex(e, planExercice(e).map((x) => x.inconnue)))];
}

function listeLatex(elements: string[]): FragmentConsigne[] {
  return elements.flatMap((x, i) => [...(i === 0 ? [] : [texte(i === elements.length - 1 ? " et " : ", ")]), latex(x)]);
}

const CONFIGURATION_EN_TOUTES_LETTRES: Record<ExerciceResoudreTriangle["configuration"], string> = {
  AAS: "deux angles et un côté",
  SAS: "deux côtés et l'angle compris",
  SSS: "les trois côtés",
  SSA: "deux côtés et un angle non compris",
};

function justificationConfiguration(e: ExerciceResoudreTriangle): FragmentConsigne[] {
  const angle = e.donnees.find((x) => !estCoteElement(x)) as SommetTriangle | undefined;
  switch (e.configuration) {
    case "AAS":
      return [texte(".")];
    case "SSS":
      return [texte(".")];
    case "SAS": {
      const [p, q] = autresCotes(angle!);
      return [texte(", car "), latex(elementLatex(angle!)), texte(" est formé par les côtés "), latex(p), texte(" et "), latex(q), texte(".")];
    }
    case "SSA": {
      const autre = e.donnees.find((x) => estCoteElement(x) && x !== coteOppose(angle!))!;
      return [
        texte(" ("),
        latex(elementLatex(angle!)),
        texte(" fait face au côté "),
        latex(coteOppose(angle!)),
        texte("). Comme "),
        latex(`${coteOppose(angle!)} > ${autre}`),
        texte(", l'angle donné fait face au plus grand des deux côtés : un seul triangle."),
      ];
    }
  }
}

function methodePremiereLoi(e: ExerciceResoudreTriangle): FragmentConsigne[] {
  const plan = planExercice(e);
  switch (e.configuration) {
    case "AAS":
      return [texte("Deux angles sont connus : la somme des angles donne d'abord le troisième. Le côté donné et l'angle qui lui fait face forment alors un couple complet pour la loi des sinus.")];
    case "SAS":
      return [texte("Aucun côté donné ne fait face à l'angle donné (pas de couple complet) : Al-Kashi donne d'abord le côté "), latex(plan[0]!.inconnue), texte(".")];
    case "SSS": {
      const L = plusGrandAngle(e.triangle);
      return [
        texte("Al-Kashi résolue en cosinus, en commençant par le plus grand angle "),
        latex(elementLatex(L)),
        texte(" (il fait face au plus grand côté "),
        latex(coteOppose(L)),
        texte(") : c'est le seul qui peut être obtus, et l'arc cosinus le donne sans ambiguïté."),
      ];
    }
    case "SSA":
      return [
        texte("Le couple complet "),
        latex(`(${plan[0]!.couple![0]} \\,;\\, ${elementLatex(plan[0]!.couple![1])})`),
        texte(" permet la loi des sinus pour "),
        latex(elementLatex(plan[0]!.inconnue)),
        texte(". Cet angle fait face au plus petit des deux côtés donnés : il est aigu, l'arc sinus donne la bonne valeur."),
      ];
  }
}

function piege(e: ExerciceResoudreTriangle): EtapeCorrection {
  const obtus = SOMMETS.find((s) => e.triangle[s] > 90);
  const position = positionObtus(e.triangle, e.donnees);
  if (obtus && position === "calcule" && (e.configuration === "SAS" || e.configuration === "SSS")) {
    const sinus = Math.round(Math.sin((e.triangle[obtus] * Math.PI) / 180) * 10000) / 10000;
    return {
      label: "Piège",
      sousQuestion: "c",
      fragments: [
        texte("L'angle "),
        latex(`${elementLatex(obtus)} \\approx ${valeurLatex(e, obtus)}`),
        texte(" est obtus. Par la loi des sinus, on obtiendrait "),
        latex(`\\sin ${elementLatex(obtus)} \\approx ${String(sinus).replace(".", "{,}")}`),
        texte(", et la calculatrice renverrait l'angle aigu "),
        latex(valeurLatex(e, obtus, 180 - e.triangle[obtus])),
        texte(" : faux. C'est pourquoi le plus grand angle se calcule par Al-Kashi."),
      ],
    };
  }
  switch (e.configuration) {
    case "AAS":
      return { label: "Piège", sousQuestion: "c", fragments: [texte("Chaque côté va avec l'angle qui lui fait FACE dans la loi des sinus ; et la calculatrice doit être en degrés.")] };
    case "SSA":
      return {
        label: "Piège",
        sousQuestion: "b",
        fragments: [texte("Si l'angle donné faisait face au plus PETIT des deux côtés, l'arc sinus ne suffirait plus : il faudrait tester les deux candidats, l'angle aigu et son supplément (cas ambigu).")],
      };
    default:
      return {
        label: "Piège",
        sousQuestion: "c",
        fragments: [texte("Ici aucun angle n'est obtus, mais on ne le sait qu'après le calcul : on commence toujours par le plus grand angle, par Al-Kashi. Calculatrice en degrés, sans arrondir les valeurs intermédiaires.")],
      };
  }
}

function correctionDetaillee(e: ExerciceResoudreTriangle): EtapeCorrection[] {
  const plan = planExercice(e);
  const controle = etapeControle(e);
  const L = plusGrandAngle(e.triangle);
  return [
    { label: "Conclusion", sousQuestion: "a", fragments: [texte("On connaît "), ...listeLatex(e.donnees.map(elementLatex)), texte(` : ${CONFIGURATION_EN_TOUTES_LETTRES[e.configuration]}`), ...justificationConfiguration(e)] },
    { label: "Méthode", sousQuestion: "b", fragments: methodePremiereLoi(e) },
    { label: "Conclusion", sousQuestion: "b", fragments: [texte("Première loi : "), ...reponsePremiereLoi(e), texte(".")] },
    ...plan.map(
      (etape, i): EtapeCorrection => ({
        label: "Calcul",
        sousQuestion: "c",
        fragments: [texte(`${i + 1}. `), ...descriptionEtape(etape), texte(" : "), latex(substitutionLatex(e, etape)), texte(", donc "), latex(resultatLatex(e, etape)), texte(".")],
      }),
    ),
    { label: "Remarque", sousQuestion: "c", fragments: [texte("Chaque calcul utilise les valeurs non arrondies des étapes précédentes (mémoire de la calculatrice) ; seuls les résultats affichés sont arrondis.")] },
    {
      label: "Contrôle",
      sousQuestion: "d",
      fragments: [texte("Par Al-Kashi : "), latex(substitutionLatex(e, controle)), texte(", donc "), latex(resultatLatex(e, controle)), texte(" : la même valeur que par la somme des angles. Les trois angles vérifient donc "), latex("\\hat{A} + \\hat{B} + \\hat{C} = 180^\\circ"), texte(" ; et le plus grand angle, "), latex(elementLatex(L)), texte(", fait bien face au plus grand côté, "), latex(coteOppose(L)), texte(".")],
    },
    piege(e),
  ];
}

function construireCorrection(e: ExerciceResoudreTriangle): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceResoudreTriangle): BaremeExercice {
  const plan = planExercice(e);
  const piegeObtus = positionObtus(e.triangle, e.donnees) === "calcule" && (e.configuration === "SAS" || e.configuration === "SSS");
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Calculatrice en radians")], cout: "−0,5 par résultat concerné" },
    { description: [texte("Valeurs intermédiaires arrondies, résultat hors de la précision demandée")], cout: "−0,25 par résultat" },
    { description: [texte("Loi des sinus avec un côté et un angle qui ne se font pas face")], cout: "0 pt sur l'élément concerné" },
  ];
  if (piegeObtus) erreurs.unshift({ description: [texte("Angle obtus calculé par la loi des sinus (l'arc sinus donne l'angle aigu)")], cout: "0 pt sur cet angle et sur le contrôle" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte(`Configuration reconnue : ${LIBELLES_CONFIGURATION[e.configuration].toLowerCase()}`)], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Première loi adaptée aux données, justifiée")], points: 0.5 },
      ...plan.map((etape, i) => ({ sousQuestion: "c", critere: [texte(`${i + 1}. `), latex(`${elementLatex(etape.inconnue)} \\approx ${valeurLatex(e, etape.inconnue)}`), texte(", calcul montré")], points: i === 0 ? 1 : 0.75 })),
      { sousQuestion: "d", critere: [texte("Contrôle : "), latex(elementLatex(etapeControle(e).inconnue)), texte(" recalculé par Al-Kashi, somme des angles vérifiée")], points: 0.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Un autre ordre de résolution correct (par exemple un angle AIGU calculé par la loi des sinus)")],
      [texte("Un écart sur le dernier chiffre dû à un arrondi")],
      [texte("Un résultat juste obtenu à partir d'une valeur fausse calculée avant : pas de double sanction")],
    ],
  };
}

function difficulte(e: ExerciceResoudreTriangle): 1 | 2 | 3 {
  if (e.configuration === "SSS") return 3;
  if (e.configuration === "SAS" && positionObtus(e.triangle, e.donnees) === "calcule") return 3;
  return 2;
}

export const adaptateurEvaluationResoudreTriangle: AdaptateurFeuilleExercices<ExerciceResoudreTriangle> = {
  profilInstance: profilResoudreTriangle,
  calculatriceIndispensable: true,
  titreDocument: "Résoudre complètement un triangle — Évaluation",
  nomFichierBase: "resoudre-triangle",
  genererInstance: genererExerciceResoudreTriangle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
};
