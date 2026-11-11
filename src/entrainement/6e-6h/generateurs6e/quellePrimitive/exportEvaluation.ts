import type { ExerciceQuellePrimitive } from "../../core6e/quellePrimitive.types";
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
import {
  aideNiveau1QuellePrimitive,
  aideNiveau2QuellePrimitive,
  consigneEcranQuellePrimitive,
  formatReponseAttenduePhaseLatexQuellePrimitive,
  intervalleLatexQuellePrimitive,
} from "../../ui6e/formatQuellePrimitive";
import { formatFractionLatex } from "../../ui6e/formatCalculPrimitives";
import { phasesPourExercice } from "../../moteur6e/typesQuellePrimitive";
import type { PhaseQuellePrimitive } from "../../moteur6e/typesQuellePrimitive";
import type { PhaseCalculPrimitives } from "../../moteur6e/typesCalculPrimitives";
import {
  definitionFPrimitive,
  difficultePrimitive,
  erreursFrequentesPrimitive,
  lignesEtapePrimitive,
  methodePapierPrimitive,
  poidsEtapesPrimitive,
  reponseEtapePrimitive,
  titreEtapePrimitive,
} from "../calculPrimitives/exportEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, construireQuellePrimitive } from "./index";
import type { IdVarianteQuellePrimitive } from "./index";
import { LIBELLE_CAS_QUELLE_PRIMITIVE, profilQuellePrimitive } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceQuellePrimitive>` pour `6gen24` (Trouver la
 * primitive vérifiant une condition initiale) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (les écrans de 6gen23 pour la primitive générale,
 *   puis l'écran final de la condition initiale) — titres « Étape n — … » du corrigé.
 * - `enoncePapier` : « Détermine la primitive F de f telle que F(a) = b », avec l'intervalle de
 *   validité quand f n'est pas définie sur ℝ, la méthode imposée par la famille et la précision
 *   demandée pour C. Une seule question : les étapes passent au corrigé.
 * - Résultats : ceux de l'appli (`formatReponseAttenduePhaseLatexQuellePrimitive`, forme exacte de C
 *   quand elle existe), jamais recalculés à part.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function estFinale(phase: PhaseQuellePrimitive): boolean {
  return phase === "final";
}

function reponse(e: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatexQuellePrimitive(e, phase).join(",\\quad "))];
}

function entetePapier(e: ExerciceQuellePrimitive): FragmentConsigne[] {
  const base = e.exerciceBase;
  const intervalle = intervalleLatexQuellePrimitive(e);
  return [
    t("Détermine la primitive F de la fonction f définie par "),
    f(definitionFPrimitive(base)),
    ...(intervalle ? [t(" sur l'intervalle "), f(intervalle.replace(/^x\\in\\,/, ""))] : []),
    t(" qui vérifie "),
    f(`F(${formatFractionLatex(e.aNum, e.aDen)})=${e.b}`),
    t(`${methodePapierPrimitive(base) ? `, en calculant une primitive de f${methodePapierPrimitive(base)}` : ""}.`),
    t(" Donne la valeur exacte de la constante, ou une valeur arrondie au centième."),
  ];
}

function titreEtape(e: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): FragmentConsigne[] {
  return estFinale(phase) ? consigneEcranQuellePrimitive(e, phase) : titreEtapePrimitive(e.exerciceBase, phase as PhaseCalculPrimitives);
}

function construireEnonce(e: ExerciceQuellePrimitive): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(e: ExerciceQuellePrimitive): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function enoncePapier(e: ExerciceQuellePrimitive): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponse(e, "final") };
}

const PIEGE_FINAL = "Fixer C à 0 dans la primitive générale, ou remplacer x par a dans f au lieu de F.";

function correctionDetaillee(e: ExerciceQuellePrimitive): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, i) => {
    const sousQuestion = LETTRES[i];
    if (!estFinale(phase)) {
      const derniereBase = i === phases.length - 2;
      // Dernier écran de la chaîne empruntée : la primitive GÉNÉRALE (avec C), vérifiée par dérivation.
      return lignesEtapePrimitive(e.exerciceBase, phase as PhaseCalculPrimitives, sousQuestion, derniereBase, false);
    }
    const aide1 = aideNiveau1QuellePrimitive(e, phase);
    const aide2 = aideNiveau2QuellePrimitive(e, phase);
    const lignes: EtapeCorrection[] = [
      { label: "Méthode", sousQuestion, fragments: [t(`${aide1.texte.trim()} `), ...(aide1.latex ? [f(aide1.latex)] : [])] },
    ];
    if (aide2.latex) lignes.push({ label: "Calcul", sousQuestion, fragments: [t("Valeur de la primitive (sans C) au point de la condition, puis C isolé : "), f(aide2.latex)] });
    lignes.push({ label: "Conclusion", sousQuestion, fragments: reponse(e, phase) });
    lignes.push({ label: "Piège", sousQuestion, fragments: [t(PIEGE_FINAL)] });
    return lignes;
  });
}

function difficulte(e: ExerciceQuellePrimitive): 1 | 2 | 3 {
  return Math.max(2, difficultePrimitive(e.exerciceBase)) as 2 | 3;
}

function bareme(e: ExerciceQuellePrimitive): BaremeExercice {
  const phases = phasesPourExercice(e);
  const nBase = phases.length - 1;
  const poids = [...poidsEtapesPrimitive(nBase, 2.5), 1.5];
  return {
    reponseFinale: reponse(e, "final"),
    criteres: phases.map((phase, i) => ({
      sousQuestion: LETTRES[i],
      critere: estFinale(phase) ? reponse(e, phase) : reponseEtapePrimitive(e.exerciceBase, phase as PhaseCalculPrimitives),
      points: poids[i],
    })),
    erreursFrequentes: [{ texte: PIEGE_FINAL, cout: "−1,5" }, ...erreursFrequentesPrimitive(e.exerciceBase)].map((x) => ({ description: [t(x.texte)], cout: x.cout })),
    reponsesAcceptees: [
      [t("C sous forme exacte, ou arrondi au centième")],
      [t("Toute écriture équivalente de F (développée, factorisée, logarithmes regroupés)")],
    ],
  };
}

export const adaptateurEvaluationQuellePrimitive: AdaptateurFeuilleExercices<ExerciceQuellePrimitive> = {
  titreDocument: "Trouver la primitive (condition initiale) — Évaluation",
  nomFichierBase: "quelle-primitive",
  genererInstance: construireQuellePrimitive,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteQuellePrimitive),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve: (e) => reponse(e, "final"),
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilQuellePrimitive,
  libelleCasParticulier: LIBELLE_CAS_QUELLE_PRIMITIVE,
  // C irrationnel dans 5 000 tirages sur 5 000 (ln, racine ou arctan au point imposé).
  calculatriceIndispensable: ["C3", "C4", "G3"],
};
