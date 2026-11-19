import type { ExerciceQuellePrimitive } from "../../core6e/quellePrimitive.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
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
  jugementPrimitive,
  erreursFrequentesPrimitive,
  methodePapierPrimitive,
  poidsEtapesPrimitive,
  reponseEtapePrimitive,
  titreEtapePrimitive,
} from "../calculPrimitives/exportEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, construireQuellePrimitive } from "./index";
import type { IdVarianteQuellePrimitive } from "./index";
import { LIBELLE_CAS_QUELLE_PRIMITIVE, profilQuellePrimitive } from "./profilEvaluation";
import { PIEGE_FINAL_QUELLE_PRIMITIVE, correctionDetailleeQuellePrimitive } from "./corrigeDetaille";

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

const PIEGE_FINAL = PIEGE_FINAL_QUELLE_PRIMITIVE;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceQuellePrimitive): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeQuellePrimitive(e)), ...jugementPrimitive(e.exerciceBase) };
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
  criteresDifficulte,
  reponseBreve: (e) => reponse(e, "final"),
  correctionDetaillee: correctionDetailleeQuellePrimitive,
  bareme,
  enoncePapier,
  profilInstance: profilQuellePrimitive,
  libelleCasParticulier: LIBELLE_CAS_QUELLE_PRIMITIVE,
  // C irrationnel dans 5 000 tirages sur 5 000 (ln, racine ou arctan au point imposé).
  calculatriceIndispensable: ["C3", "C4", "G3"],
};
