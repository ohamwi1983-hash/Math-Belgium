import type { ExerciceIntegralesDefinies } from "../../core6e/integralesDefinies.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, formatReponseAttenduePhaseLatex } from "../../ui6e/formatIntegralesDefinies";
import { decimalLatex, valeurExacteLatex } from "../../ui6e/formatMonome";
import { phasesPourExercice } from "../../moteur6e/typesIntegralesDefinies";
import type { PhaseIntegralesDefinies } from "../../moteur6e/typesIntegralesDefinies";
import type { PhaseCalculPrimitives } from "../../moteur6e/typesCalculPrimitives";
import { phasesPourExercice as phasesPrimitive } from "../../moteur6e/typesCalculPrimitives";
import {
  definitionFPrimitive,
  jugementPrimitive,
  erreursFrequentesPrimitive,
  methodePapierPrimitive,
  poidsEtapesPrimitive,
  reponseEtapePrimitive,
  titreEtapePrimitive,
} from "../calculPrimitives/exportEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegralesDefinies } from "./index";
import type { IdVarianteIntegralesDefinies } from "./index";
import { LIBELLE_CAS_INTEGRALES_DEFINIES, profilIntegralesDefinies } from "./profilEvaluation";
import { correctionDetailleeIntegralesDefinies, piegeIntegralesDefinies } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIntegralesDefinies>` pour `6gen25` (Intégrales
 * définies) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (écrans de 6gen23 pour la primitive, puis
 *   l'évaluation de l'intégrale, la valeur moyenne, ou l'équation en m et sa résolution) — titres
 *   « Étape n — … » du corrigé.
 * - `enoncePapier` :
 *   - simple : « Calcule ∫ₐᵇ f(x) dx » (une seule demande) ;
 *   - moyenne : deux VRAIES questions, a) l'intégrale, b) la valeur moyenne ;
 *   - paramètre : « Détermine m tel que ∫ … = cible » (une seule demande).
 * - Figure du corrigé : l'aire signée sous f sur l'intervalle (et le rectangle de hauteur égale à la
 *   valeur moyenne), `ui6e/figureIntegralesDefinies.ts`.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const PRECISION = " Donne le résultat sous forme exacte, ou arrondi au centième.";

function estEmpruntee(e: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): phase is PhaseCalculPrimitives {
  return phasesPrimitive(e.primitive).includes(phase as PhaseCalculPrimitives);
}

function reponse(e: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

function borne(x: number): string {
  return valeurExacteLatex(x) ?? decimalLatex(x, 2);
}

/** « (calcule une primitive de f à l'aide d'un changement de variable) » quand la famille l'impose. */
function methode(e: ExerciceIntegralesDefinies): string {
  const m = methodePapierPrimitive(e.primitive);
  return m ? ` (calcule une primitive de f${m})` : "";
}

/** Ligne de l'intégrale telle qu'affichée par l'appli (bornes, et valeur cible en scénario paramètre). */
function ligneIntegrale(e: ExerciceIntegralesDefinies): string {
  return blocDonnees(e)[1];
}

function entetePapier(e: ExerciceIntegralesDefinies): FragmentConsigne[] {
  const def = definitionFPrimitive(e.primitive);
  if (e.scenario === "simple") return [t("Calcule "), f(ligneIntegrale(e)), t(", où "), f(def), t(`${methode(e)}.`), t(PRECISION)];
  if (e.scenario === "moyenne") return [t("On considère la fonction f définie par "), f(def), t(`${methode(e)}.`), t(PRECISION)];
  const domaine = domaineM(e);
  return [
    t("On considère la fonction f définie par "),
    f(def),
    t(`${methode(e)}. Détermine la ou les valeurs du réel m`),
    ...domaine,
    t(" telles que "),
    f(ligneIntegrale(e)),
    t("."),
    t(PRECISION),
  ];
}

function questionsMoyenne(e: Extract<ExerciceIntegralesDefinies, { scenario: "moyenne" }>): QuestionExercice[] {
  return [
    { consigne: [t("Calcule "), f(ligneIntegrale(e)), t(".")] },
    { consigne: [t("Déduis-en la valeur moyenne de f sur "), f(`\\left[${borne(e.a)}\\,;${borne(e.b)}\\right]`), t(".")] },
  ];
}

/** Domaine de m écrit en LaTeX (le texte d'écran l'écrit au clavier : « [−π/2 ; π/2] »). */
function domaineM(e: ExerciceIntegralesDefinies): FragmentConsigne[] {
  if (e.scenario !== "parametre" || !e.domaineMTexte) return [];
  return [t(" appartenant à l'intervalle "), f(e.domaineMTexte.includes("−π/2") ? "\\left[-\\dfrac{\\pi}{2}\\,;\\dfrac{\\pi}{2}\\right]" : "\\left[0\\,;\\pi\\right]")];
}

/** Titres d'étapes : l'écran parlait de « l'intégrale définie ci-dessus » (bloc de données de l'écran). */
function titreEtape(e: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): FragmentConsigne[] {
  if (estEmpruntee(e, phase)) return titreEtapePrimitive(e.primitive, phase);
  if (phase === "resoudreM" && domaineM(e).length > 0) return [t("Résous l'équation posée à l'étape précédente pour m"), ...domaineM(e), t(".")];
  return consigneEcran(e, phase).map((fr) => (fr.type === "texte" ? { ...fr, valeur: fr.valeur.replace("l'intégrale définie ci-dessus", "l'intégrale définie") } : fr));
}

function construireEnonce(e: ExerciceIntegralesDefinies): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(e: ExerciceIntegralesDefinies): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function phaseFinale(e: ExerciceIntegralesDefinies): PhaseIntegralesDefinies {
  const phases = phasesPourExercice(e);
  return phases[phases.length - 1];
}

function enoncePapier(e: ExerciceIntegralesDefinies): EnoncePapier {
  if (e.scenario !== "moyenne") return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponse(e, phaseFinale(e)) };
  const lettres = phasesPourExercice(e).map((_, i) => LETTRES[i]);
  return {
    section: { enteteFragments: entetePapier(e), questions: questionsMoyenne(e) },
    // a) couvre la primitive et l'évaluation de l'intégrale ; b) la valeur moyenne (dernière étape).
    etapesParQuestion: [lettres.slice(0, -1), lettres.slice(-1)],
    reponseBreve: [t("a) "), ...reponse(e, "finalIntegrale"), t(" ; b) "), ...reponse(e, "valeurMoyenne")],
  };
}

const piegePropre = piegeIntegralesDefinies;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceIntegralesDefinies): CriteresDifficulte {
  const jugement = e.scenario === "parametre" ? { methode: 1 as const, piege: 1 as const } : jugementPrimitive(e.primitive);
  return { ...etapesDuCorrige(correctionDetailleeIntegralesDefinies(e)), ...jugement };
}

function reponseBreve(e: ExerciceIntegralesDefinies): FragmentConsigne[] {
  return enoncePapier(e).reponseBreve ?? reponse(e, phaseFinale(e));
}

function bareme(e: ExerciceIntegralesDefinies): BaremeExercice {
  const phases = phasesPourExercice(e);
  const nBase = phasesPrimitive(e.primitive).length;
  const nPropres = phases.length - nBase;
  const poids = [...poidsEtapesPrimitive(nBase, 2), ...Array.from({ length: nPropres }, () => 2 / nPropres)];
  const erreurs = [
    ...phases.map((phase) => piegePropre(e, phase)).filter((p): p is string => !!p).map((p) => ({ texte: p, cout: "−1" })),
    ...erreursFrequentesPrimitive(e.primitive),
  ];
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({
      sousQuestion: LETTRES[i],
      critere: estEmpruntee(e, phase) ? reponseEtapePrimitive(e.primitive, phase) : reponse(e, phase),
      points: poids[i],
    })),
    erreursFrequentes: erreurs.map((x) => ({ description: [t(x.texte)], cout: x.cout })),
    reponsesAcceptees: [
      [t("Valeur exacte, ou arrondie au centième")],
      [t("Toute primitive de f (la constante disparaît dans la différence F(b) − F(a))")],
    ],
  };
}

export const adaptateurEvaluationIntegralesDefinies: AdaptateurFeuilleExercices<ExerciceIntegralesDefinies> = {
  titreDocument: "Intégrales définies — Évaluation",
  nomFichierBase: "integrales-definies",
  genererInstance: genererExerciceIntegralesDefinies,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteIntegralesDefinies),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeIntegralesDefinies,
  bareme,
  enoncePapier,
  profilInstance: profilIntegralesDefinies,
  libelleCasParticulier: LIBELLE_CAS_INTEGRALES_DEFINIES,
  // Résultat irrationnel dans 5 000 tirages sur 5 000.
  calculatriceIndispensable: ["simple_C2", "simple_C3", "simple_C4", "simple_G4", "moyenne_A_diviserProduit", "moyenne_C2", "moyenne_C3", "moyenne_C4", "moyenne_G2", "moyenne_G3", "moyenne_G4"],
};
