import type { ExerciceTrianglesComplexes } from "../../core6e/trianglesComplexes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, formatReponseAttenduePhaseLatex } from "../../ui6e/formatTrianglesComplexes";
import { phasesPourExercice } from "../../moteur6e/typesTrianglesComplexes";
import type { PhaseTrianglesComplexes } from "../../moteur6e/typesTrianglesComplexes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTrianglesComplexes } from "./index";
import type { IdVarianteTrianglesComplexes } from "./index";
import { profilTrianglesComplexes } from "../profilsEvaluationComplexes40-42";
import { conclusion, correctionDetailleeTriangles, piege } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTrianglesComplexes>` pour `6gen41` (Triangles et
 * nombres complexes) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (titres « Étape n — … » du corrigé), reformulées pour
 *   le papier (plus de « une seule tentative », de « confirmées », de saisie « sqrt(10) »).
 * - `enoncePapier` — AUCUN verdict n'est annoncé avant d'être démontré (ni « isocèle », ni « rectangle »,
 *   ni « centre », ni « image »), et AUCUNE figure dans l'énoncé (elle trahirait les verdicts) :
 *   - A, C, E : une seule demande (« Ce triangle est-il isocèle ? Est-il rectangle ? ») ;
 *   - B : a) isocèle ? rectangle ? b) les trois angles (loi des cosinus, calculatrice) ;
 *   - D : a) rapport et angle de la similitude qui envoie A sur C, b) envoie-t-elle B sur D ?,
 *     c) le nombre complexe k·e^{iθ} sous la forme a + bi.
 * - Figure du corrigé (`figureHtml`) : le ou les triangles, sous la conclusion de la dernière étape.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

const QUESTION_ISOCELE_RECTANGLE = "Ce triangle est-il isocèle ? Est-il rectangle ? Justifie et précise, le cas échéant, en quel sommet.";

/** « z_A = …, z_B = … et z_C = … » (dernière donnée précédée de « et »). */
function listeDonnees(e: ExerciceTrianglesComplexes): FragmentConsigne[] {
  const lignes = blocDonnees(e);
  return lignes.flatMap((l, i) => (i === 0 ? [f(l)] : [t(i === lignes.length - 1 ? " et " : ", "), f(l)]));
}

function entetePapier(e: ExerciceTrianglesComplexes): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [t("Dans le plan complexe, on considère le triangle ABC dont les sommets ont pour affixes "), ...listeDonnees(e), t(`. ${QUESTION_ISOCELE_RECTANGLE}`)];
    case "B":
      return [t("Dans le plan complexe, on considère le triangle OAB dont les sommets ont pour affixes "), ...listeDonnees(e), t(".")];
    case "C":
      return [
        t("Dans le plan complexe, on donne les points O, B, F et A d'affixes "),
        ...listeDonnees(e),
        t(". Vérifie que le triangle OBF est équilatéral, puis détermine si le point A est le centre de ce triangle, c'est-à-dire s'il est à égale distance de ses trois sommets. Justifie."),
      ];
    case "D":
      return [t("Dans le plan complexe, on donne les points O, A, B, C et D d'affixes "), ...listeDonnees(e), t(".")];
    case "E":
      return [
        t("Dans le plan complexe, on donne les points A, B et C d'affixes "),
        ...listeDonnees(e),
        t(". Les points A, B et C sont-ils alignés ? Les droites (AB) et (AC) sont-elles perpendiculaires ? Réponds à l'aide du quotient "),
        f("\\dfrac{z_C-z_A}{z_B-z_A}"),
        t("."),
      ];
  }
}

function questionsPapier(e: ExerciceTrianglesComplexes): QuestionExercice[] {
  if (e.famille === "B") return [{ consigne: [t(QUESTION_ISOCELE_RECTANGLE)] }, { consigne: [t("Calcule les trois angles de ce triangle, en degrés, arrondis au dixième.")] }];
  if (e.famille === "D")
    return [
      { consigne: [t("Détermine le rapport k et l'angle θ de la similitude de centre O qui envoie A sur C.")] },
      { consigne: [t("Cette similitude envoie-t-elle aussi B sur D ? Justifie.")] },
      { consigne: [t("Écris sous la forme a + bi le nombre complexe "), f("k\\cdot e^{i\\theta}"), t(" qui caractérise cette similitude.")] },
    ];
  return [];
}

function etapesParQuestion(e: ExerciceTrianglesComplexes): string[][] | undefined {
  if (e.famille === "B") return [["a", "b", "c"], ["d"]];
  if (e.famille === "D") return [["a"], ["b"], ["c"]];
  return undefined;
}

/** Titres d'étapes du corrigé — reformulation papier des consignes d'écran (`consigneEcran`). */
function titreEtape(phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  switch (phase) {
    case "aEcran1":
      return [t("Calcule les longueurs des trois côtés, par le module d'une différence d'affixes (par exemple "), f("AB=|z_B-z_A|"), t(").")];
    case "aEcran2":
    case "bEcran2":
      return [t("Le triangle est-il isocèle ? En quel sommet ?")];
    case "aEcran3":
    case "bEcran3":
      return [t("Teste la relation de Pythagore : le triangle est-il rectangle ? En quel sommet ?")];
    case "bEcran1":
      return [t("Calcule les longueurs OA, OB et AB (valeurs exactes).")];
    case "bEcran4":
      return [t("Applique la loi des cosinus pour trouver l'angle au sommet principal, puis déduis les deux autres (égaux, la somme des angles valant 180°).")];
    case "cEcran1":
      return [t("Calcule les longueurs OB, BF et OF.")];
    case "cEcran2":
      return [t("Calcule les distances AO, AB et AF (valeurs exactes).")];
    case "cEcran3":
      return [t("Conclus : A est-il le centre du triangle OBF ?")];
    case "dEcran1":
      return [t("Calcule le rapport "), f("\\dfrac{|z_C|}{|z_A|}"), t(" et l'angle "), f("\\arg z_C-\\arg z_A"), t(" de la similitude de centre O qui envoie A sur C.")];
    case "dEcran2":
      return [t("Calcule de même "), f("\\dfrac{|z_D|}{|z_B|}"), t(" et "), f("\\arg z_D-\\arg z_B"), t(", puis conclus.")];
    case "dEcran3":
      return [t("Écris sous la forme a + bi le nombre complexe "), f("k\\cdot e^{i\\theta}"), t(" qui caractérise cette similitude.")];
    case "eEcran1":
      return [t("Calcule le quotient "), f("q=\\dfrac{z_C-z_A}{z_B-z_A}"), t(" sous la forme a + bi.")];
    case "eEcran2":
      return [t("Conclus à partir de ce quotient.")];
  }
}

function construireEnonce(e: ExerciceTrianglesComplexes): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(phase) })) };
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(e: ExerciceTrianglesComplexes): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

/** Réponse finale sans sous-question papier : les verdicts (et non les longueurs intermédiaires). */
function reponseFinaleSimple(e: ExerciceTrianglesComplexes): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [...reponse(e, "aEcran2"), t(" ; "), ...reponse(e, "aEcran3")];
    case "C":
      return reponse(e, "cEcran3");
    case "E":
      return [...reponse(e, "eEcran1"), t(" : "), ...reponse(e, "eEcran2")];
    default:
      return [];
  }
}

function enoncePapier(e: ExerciceTrianglesComplexes): EnoncePapier {
  const questions = questionsPapier(e);
  if (questions.length === 0) return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseFinaleSimple(e) };
  const reponseB =
    e.famille === "B"
      ? [t("a) "), ...reponse(e, "bEcran2"), t(" ; "), ...reponse(e, "bEcran3"), t(" ; b) "), ...reponse(e, "bEcran4")]
      : [t("a) "), ...reponse(e, "dEcran1"), t(` ; b) ${e.famille === "D" && e.coherent ? "oui (même rapport, même angle)" : "non"} ; c) `), ...reponse(e, "dEcran3")];
  return { section: { enteteFragments: entetePapier(e), questions }, etapesParQuestion: etapesParQuestion(e), reponseBreve: reponseB };
}

const correctionDetaillee = correctionDetailleeTriangles;

function difficulte(e: ExerciceTrianglesComplexes): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
    case "E":
      return 2;
    case "C":
      return 2;
    case "B":
    case "D":
      return 3;
  }
}

function reponseBreve(e: ExerciceTrianglesComplexes): FragmentConsigne[] {
  return enoncePapier(e).reponseBreve ?? reponseFinaleSimple(e);
}

const POIDS: Record<ExerciceTrianglesComplexes["famille"], number[]> = { A: [1.5, 1, 1.5], B: [1, 0.5, 0.5, 2], C: [1, 2, 1], D: [1.5, 1.5, 1], E: [2.5, 1.5] };

function bareme(e: ExerciceTrianglesComplexes): BaremeExercice {
  const phases = phasesPourExercice(e);
  const erreurs = phases.map((phase) => piege(phase)).filter((p): p is FragmentConsigne[] => !!p);
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: conclusion(e, phase), points: POIDS[e.famille][i] })),
    erreursFrequentes: erreurs.map((description) => ({ description, cout: "−1" })),
    reponsesAcceptees: [[t("Longueurs sous forme exacte (radical simplifié ou non)")], ...(e.famille === "B" ? [[t("Angles arrondis au dixième de degré, à 0,1° près")]] : []), [t("Verdict justifié par un calcul : un verdict sans justification ne rapporte pas de point")]],
  };
}

export const adaptateurEvaluationTrianglesComplexes: AdaptateurFeuilleExercices<ExerciceTrianglesComplexes> = {
  titreDocument: "Triangles et nombres complexes — Évaluation",
  nomFichierBase: "triangles-complexes",
  genererInstance: genererExerciceTrianglesComplexes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteTrianglesComplexes),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilTrianglesComplexes,
  // Angles en degrés (loi des cosinus) : calculatrice dans 5 000 tirages sur 5 000.
  calculatriceIndispensable: ["B"],
};
