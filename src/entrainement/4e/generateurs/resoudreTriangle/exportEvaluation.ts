import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  CriteresDifficulte,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceResoudreTriangle } from "../../core/resoudreTriangle.types";
import { positionObtus } from "../../moteur/resolutionTriangle";
import { etapeControle, planExercice } from "../../moteur/verificationResoudreTriangle";
import { svgFigureResoudreTriangle } from "../../ui/croquisResoudreTriangle";
import {
  CONSIGNE_CALCULS,
  CONSIGNE_GENERALE,
  CONSIGNE_PAPIER,
  LIBELLES_CONFIGURATION,
  consignesEcrans,
  donneesFragments,
  elementLatex,
  resultatsLatex,
  egalOuEnvironElement,
  valeurLatex,
} from "../../ui/formatResoudreTriangle";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceResoudreTriangle } from "./index";
import { profilResoudreTriangle } from "./profil";
import { correctionDetailleeResoudreTriangle } from "./corrigeDetaille";

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
      ...plan.map((etape, i) => ({ sousQuestion: "c", critere: [texte(`${i + 1}. `), latex(`${elementLatex(etape.inconnue)} ${egalOuEnvironElement(e, etape.inconnue)} ${valeurLatex(e, etape.inconnue)}`), texte(", calcul montré")], points: i === 0 ? 1 : 0.75 })),
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

/** Niveau : l'écran « configuration » est une lecture des données ; méthode 1 (choisir les lois) ;
 * piège seulement dans les données — un angle OBTUS à calculer en SAS/SSS (la loi des sinus
 * donnerait l'angle aigu) ; nombres : calculatrice. */
/** Groupe à verdict (audit 4e ch. 5, lot D) : la configuration est la réponse de l'écran 1 — le
 * niveau et la durée imprimés ne doivent pas la trahir (SSS : 14 min, angle obtus calculé : niveau 5).
 * Niveau ET durée CONSTANTS, comme gen74 : 4 · difficile, 12 min (trois calculs, une lecture,
 * méthode à choisir, calculatrice). */
function criteresDifficulte(e: ExerciceResoudreTriangle): CriteresDifficulte {
  void e;
  return { etapesTransformation: 4, etapesLecture: 1, sansCharge: true, methode: 1, piege: 0, nombres: 1 };
}

/** Groupe à verdict (décision 2, audit 4e ch. 5, V5) : la configuration (AAS, SAS, SSS, SSA) est
 * reconnue à l'écran 1 — panneau d'évaluation seulement. */
const GROUPES_VERDICT = [{ id: "groupe_configuration", label: "Configuration à reconnaître (AAS, SAS, SSS ou SSA, au hasard)", variantes: ["AAS", "SAS", "SSS", "SSA"] }];

export const adaptateurEvaluationResoudreTriangle: AdaptateurFeuilleExercices<ExerciceResoudreTriangle> = {
  profilInstance: profilResoudreTriangle,
  calculatriceIndispensable: true,
  titreDocument: "Résoudre complètement un triangle — Évaluation",
  nomFichierBase: "resoudre-triangle",
  genererInstance: genererExerciceResoudreTriangle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  groupesVerdict: GROUPES_VERDICT,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeResoudreTriangle,
  bareme,
  enoncePapier,
};
