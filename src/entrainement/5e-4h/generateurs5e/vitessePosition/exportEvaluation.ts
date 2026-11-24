import type { ExerciceVitessePosition } from "../../core5e/vitessePosition.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneEcranRiche, formatReponseAttenduePhaseLatex, phraseEnonce } from "../../ui5e/formatVitessePosition";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeVitessePosition, lettresLectureVitessePosition } from "./corrigeDetaille";
import type { EcranVitessePosition } from "../../moteur5e/typesVitessePosition";
import { ordreEcransVitessePosition } from "../../moteur5e/typesVitessePosition";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVitessePosition } from "./index";
import { PARAMETRES_VITESSE_POSITION, profilVitessePosition } from "../profilsEvaluationDerivees34-35";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceVitessePosition>` pour 5gen35 (« Vitesse et
 * position ») — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = le récit (s(t), distances — la distance TOTALE est dite explicitement en
 * variante B) et les VRAIES questions du problème :
 * - A : a) accélération ; b) temps pour parcourir D (avec justification du rejet) ; c) vitesse
 *   atteinte, en m/s puis en km/h.
 * - B : a) accélération ; b) temps pour atteindre D₁ (justification) ; c) vitesse atteinte à ce
 *   repère ; d) durée du parcours complet (second segment à vitesse constante).
 * Les écrans du générateur (`ordreEcransVitessePosition` : dérivée, accélération, résolution, rejet,
 * vitesse atteinte, conversion — ou second segment et temps total en B) deviennent les étapes du
 * corrigé (« Étape n — consigne »), chaque question papier couvrant ses étapes (`etapesParQuestion`).
 *
 * Valeurs : `formatReponseAttenduePhaseLatex`, `consigneEcranRiche`, `texteAideNiveau1` (écran) et
 * les champs de l'instance (`tCible`, `racineRejetee`, `D2`…) — jamais recalculées autrement.
 *
 * `regroupable` : non — plusieurs questions par instance, consignes dépendantes des valeurs tirées.
 */

const LETTRES = "abcdefgh";

function fragmentsRiches(source: string): FragmentConsigne[] {
  return source
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? latex(morceau) : texte(morceau.replace(/ \?/g, "\u00a0?"))))
    .filter((f) => f.valeur !== "");
}

function lettreDe(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): string {
  return LETTRES[ordreEcransVitessePosition(exercice).indexOf(ecran)];
}

/** « du sprinteur », « de la cycliste », « du tram ». */
function deSujet(sujet: string): string {
  if (sujet.startsWith("le ")) return `du ${sujet.slice(3)}`;
  if (sujet.startsWith("les ")) return `des ${sujet.slice(4)}`;
  return `de ${sujet}`;
}

/** Consigne d'étape = celle de l'écran, sans ses tournures propres à la saisie. */
function consigneEtape(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): FragmentConsigne[] {
  const brute = consigneEcranRiche(exercice, ecran)
    .replace(/ Une seule tentative\.$/, "");
  return fragmentsRiches(brute);
}

function entete(exercice: ExerciceVitessePosition): FragmentConsigne[] {
  return fragmentsRiches(phraseEnonce(exercice));
}

function construireEnonceVitessePosition(exercice: ExerciceVitessePosition): SectionExercice {
  return { enteteFragments: entete(exercice), questions: ordreEcransVitessePosition(exercice).map((ecran) => ({ consigne: consigneEtape(exercice, ecran) })) };
}

function questionsPapier(exercice: ExerciceVitessePosition): { questions: QuestionExercice[]; etapes: string[][] } {
  const l = (ecran: EcranVitessePosition) => lettreDe(exercice, ecran);
  const acceleration: QuestionExercice = { consigne: [texte(`Détermine l'accélération ${deSujet(exercice.contexte.sujet)} pendant la phase d'accélération, en m/s².`)] };
  const temps = (distance: number): QuestionExercice => ({
    consigne: [texte(`Au bout de combien de secondes la distance parcourue atteint-elle ${distance} m ? Justifie le choix de la solution retenue.`)],
  });
  if (exercice.variante === "A") {
    return {
      questions: [acceleration, temps(exercice.D), { consigne: [texte("Quelle est la vitesse atteinte à cet instant, en m/s puis en km/h ?")] }],
      etapes: [
        [l("derivee"), l("acceleration")],
        [l("resoudre"), l("rejet")],
        [l("vitessePointe"), l("conversion")],
      ],
    };
  }
  return {
    questions: [
      acceleration,
      temps(exercice.distanceCible),
      { consigne: [texte("Quelle est la vitesse atteinte à cet instant, en m/s ?")] },
      { consigne: [texte(`Combien de temps dure le parcours complet de ${exercice.D} m ? Arrondis au dixième de seconde.`)] },
    ],
    etapes: [[l("derivee"), l("acceleration")], [l("resoudre"), l("rejet")], [l("vitessePointe")], [l("segmentConstant"), l("tempsTotal")]],
  };
}

function enoncePapierVitessePosition(exercice: ExerciceVitessePosition): EnoncePapier {
  const { questions, etapes } = questionsPapier(exercice);
  return { section: { enteteFragments: entete(exercice), questions }, etapesParQuestion: etapes, reponseBreve: reponseBreveVitessePosition(exercice) };
}

function reponse(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): string {
  return formatReponseAttenduePhaseLatex(exercice, ecran)[0];
}

function reponseBreveVitessePosition(exercice: ExerciceVitessePosition): FragmentConsigne[] {
  const debut: FragmentConsigne[] = [
    texte("a) "),
    latex(`a=${exercice.a}\\text{ m/s}^2`),
    texte(" ; b) "),
    latex(`t=${exercice.tCible}\\text{ s}`),
    texte(" ; c) "),
    latex(reponse(exercice, "vitessePointe")),
  ];
  if (exercice.variante === "A") return [...debut, texte(", soit "), latex(reponse(exercice, "conversion"))];
  return [...debut, texte(" ; d) "), latex(reponse(exercice, "tempsTotal"))];
}

function baremeVitessePosition(exercice: ExerciceVitessePosition): BaremeExercice {
  const l = (ecran: EcranVitessePosition) => lettreDe(exercice, ecran);
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const communs = [
    c(l("derivee"), "Vitesse v(t) = s′(t)", 0.5),
    c(l("acceleration"), "Accélération a(t) = v′(t), avec l'unité", 0.5),
  ];
  const criteres =
    exercice.variante === "A"
      ? [
          ...communs,
          c(l("resoudre"), "Équation du second degré posée et résolue (deux solutions)", 1.5),
          c(l("rejet"), "Rejet de la solution négative, justifié", 0.5),
          c(l("vitessePointe"), "Vitesse atteinte v(t) en m/s", 0.5),
          c(l("conversion"), "Conversion en km/h", 0.5),
        ]
      : [
          ...communs,
          c(l("resoudre"), "Équation du second degré posée et résolue (deux solutions)", 1),
          c(l("rejet"), "Rejet de la solution négative, justifié", 0.5),
          c(l("vitessePointe"), "Vitesse atteinte v(t) en m/s", 0.5),
          c(l("segmentConstant"), "Durée du second segment, à vitesse constante", 0.5),
          c(l("tempsTotal"), "Durée totale du parcours", 0.5),
        ];
  return {
    reponseFinale: reponseBreveVitessePosition(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte("Garder la solution négative, ou la rejeter sans justification")], cout: "0 pt sur la justification" },
      { description: [texte("Évaluer s au lieu de v à l'instant trouvé")], cout: "0 pt sur la vitesse" },
      ...(exercice.variante === "B" ? [{ description: [texte("Appliquer encore s(t) sur le second segment")], cout: "0 pt sur la durée du second segment" }] : []),
    ],
    reponsesAcceptees: exercice.variante === "B" ? [[texte("Durées arrondies au dixième de seconde")]] : [[texte("Vitesse en km/h écrite avec une virgule ou un point décimal")]],
  };
}

/** Niveau 1–7 : méthode 0 en A (questions guidées, modèle donné), 1 en B (changement de modèle à
 * décider : vitesse constante sur le second segment) ; piège 1 (une solution négative à rejeter,
 * toujours dans les données) ; l'écran « rejet » (décision sans calcul) est compté comme une lecture. */
function criteresDifficulteVitessePosition(exercice: ExerciceVitessePosition): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeVitessePosition(exercice), lettresLectureVitessePosition(exercice)), methode: exercice.variante === "B" ? 1 : 0, piege: 1 };
}

/** Ancien corrigé (repli, documents Word) : les étapes du corrigé détaillé, en paragraphes. */
function construireCorrectionVitessePosition(exercice: ExerciceVitessePosition): BlocCorrection[] {
  return correctionDetailleeVitessePosition(exercice)
    .filter((l) => l.label !== "Piège" && l.label !== "Méthode")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationVitessePosition: AdaptateurFeuilleExercices<ExerciceVitessePosition> = {
  titreDocument: "Vitesse et position — Évaluation",
  nomFichierBase: "vitesse-position",
  genererInstance: genererExerciceVitessePosition,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceVitessePosition,
  construireCorrection: construireCorrectionVitessePosition,
  criteresDifficulte: criteresDifficulteVitessePosition,
  reponseBreve: reponseBreveVitessePosition,
  correctionDetaillee: correctionDetailleeVitessePosition,
  bareme: baremeVitessePosition,
  enoncePapier: enoncePapierVitessePosition,
  profilInstance: profilVitessePosition,
  parametresAuChoix: PARAMETRES_VITESSE_POSITION,
};
