import type { ExerciceContenanceObjets } from "../../core6e/contenanceObjets.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { contenanceUnite, rayonProfil, uniteContenance, valeur, volumeCm3, volumeSecond } from "../../core6e/contenanceObjetsCalcul";
import { PHASES_CONTENANCE } from "../../moteur6e/typesContenanceObjets";
import type { PhaseContenance } from "../../moteur6e/typesContenanceObjets";
import {
  consigneEcran,
  consigneGenerale,
  contenanceLatex,
  formatReponseAttenduePhaseLatex,
  hauteurLatex,
  texteTransfert,
  verdictComparaison,
  volumeLatex,
  volumeSecondLatex,
} from "../../ui6e/formatContenanceObjets";
import { figureEnonceHtml } from "../../ui6e/figureContenanceObjets";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceContenanceObjets } from "./index";
import type { IdVarianteContenanceObjets } from "./index";
import { profilContenanceObjets } from "./profilEvaluation";
import { correctionDetailleeContenanceObjets } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceContenanceObjets>` de `6gen83` (« Contenance
 * d'objets de révolution ») — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par ÉCRAN (titres « Étape n — … » du corrigé) ;
 * - `enoncePapier` : énoncé (objet, cotes, profil, convention du repère) + figure (silhouette cotée
 *   et profil, `enteteHtml`) et DEUX vraies questions : a) la contenance (en cm³ puis en L ou cL),
 *   b) la question de transfert. Modèle, bornes, carré, calcul et conversion sont les étapes de a)
 *   dans le corrigé ;
 * - résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli) ; figure du solide (disques,
 *   liquide jusqu'à t) sous la dernière étape.
 */

const LETTRES = "abcde";
const f = (v: string): FragmentConsigne => latex(v);
const t = (v: string): FragmentConsigne => texte(v);

/** Consigne d'étape (corrigé papier) : celle de l'écran, sauf le modèle (pas de choix sur papier). */
function consigneEtape(e: ExerciceContenanceObjets, phase: PhaseContenance): FragmentConsigne[] {
  if (phase === "modele") return [t("Identifie le modèle (disques ou rondelles, quel profil) qui donne la contenance, et écris la formule du volume.")];
  return consigneEcran(e, phase);
}

/** Énoncé : la consigne générale contient déjà le profil (pas de répétition des données). */
function entete(e: ExerciceContenanceObjets): FragmentConsigne[] {
  return consigneGenerale(e);
}

function construireEnonce(e: ExerciceContenanceObjets): SectionExercice {
  // Sans `enteteHtml` : l'énoncé imprimé vient d'`enoncePapier` (qui porte la figure) ; la figure
  // contient des identifiants uniques par appel et rendrait l'empreinte anti-doublon du pipeline
  // (`evaluationLocal.ts::empreinteSection`) différente à chaque tirage.
  return { enteteFragments: entete(e), questions: PHASES_CONTENANCE.map((phase) => ({ consigne: consigneEtape(e, phase) })) };
}

function reponse(e: ExerciceContenanceObjets, phase: PhaseContenance): FragmentConsigne[] {
  const formules = [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
  if (phase === "transfert" && e.transfert === "comparer") return [...formules, t(" — "), ...verdictComparaison(e)];
  if (phase === "transfert" && e.transfert === "nombre") return [f(`n=${e.nombre}`)];
  return formules;
}

function construireCorrection(e: ExerciceContenanceObjets): BlocCorrection[] {
  return PHASES_CONTENANCE.map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

// ============================================================================
// Énoncé papier.
// ============================================================================

function questionContenance(e: ExerciceContenanceObjets): FragmentConsigne[] {
  const u = uniteContenance(e);
  const unite = u === "cL" ? "en centilitres (arrondie au dixième)" : "en litres (arrondie au centième)";
  return [t(`Calcule la contenance de l'objet en cm³ (valeur exacte, puis arrondie à l'unité), puis exprime-la ${unite}.`)];
}

function enoncePapier(e: ExerciceContenanceObjets): EnoncePapier {
  return {
    section: { enteteFragments: entete(e), enteteHtml: figureEnonceHtml(e), questions: [{ consigne: questionContenance(e) }, { consigne: texteTransfert(e) }] },
    etapesParQuestion: [["a", "b", "c", "d"], ["e"]],
    reponseBreve: reponseBreve(e),
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

const correctionDetaillee = correctionDetailleeContenanceObjets;

// ============================================================================
// Difficulté, réponse brève, barème.
// ============================================================================

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceContenanceObjets): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 1, piege: 1 };
}

function reponseTransfertBreve(e: ExerciceContenanceObjets): FragmentConsigne[] {
  if (e.transfert === "hauteur") return [f(hauteurLatex(e))];
  if (e.transfert === "nombre") return [f(`n=${e.nombre}`)];
  return [f(volumeSecondLatex(e)), t(" — "), ...verdictComparaison(e)];
}

function reponseBreve(e: ExerciceContenanceObjets): FragmentConsigne[] {
  return [t("a) "), f(volumeLatex(e)), t(" ; "), f(contenanceLatex(e)), t(" ; b) "), ...reponseTransfertBreve(e)];
}

const POIDS: Record<PhaseContenance, number> = { modele: 0.5, poser: 1, calculer: 1, convertir: 0.5, transfert: 1 };

function bareme(e: ExerciceContenanceObjets): BaremeExercice {
  // Erreurs fréquentes : les pièges du corrigé détaillé (une par étape).
  const erreurs = correctionDetailleeContenanceObjets(e)
    .filter((x) => x.type === "piege")
    .map((x) => ({ description: x.fragments, cout: "−0,5" }));
  return {
    reponseFinale: reponseBreve(e),
    criteres: PHASES_CONTENANCE.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(e, phase), points: POIDS[phase] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Volume exact (multiple de π) ou arrondi ; contenance exacte ou arrondie ; hauteur exacte ou arrondie au millimètre ; un carré non développé mais juste est accepté")]],
  };
}

/** Vérifications de cohérence pour les scripts (jamais affiché). */
export function valeursControle(e: ExerciceContenanceObjets) {
  return { V: volumeCm3(e), C: contenanceUnite(e), V2: volumeSecond(e), t: e.hauteurLiquide, n: e.nombre, rBas: rayonProfil(e.profil, e.a), surPi: valeur(e.volumeSurPi) };
}

export const adaptateurEvaluationContenanceObjets: AdaptateurFeuilleExercices<ExerciceContenanceObjets> = {
  titreDocument: "Contenance d'objets de révolution — Évaluation",
  nomFichierBase: "contenance-objets-revolution",
  genererInstance: genererExerciceContenanceObjets,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteContenanceObjets),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  // Tonneau et pot : aucune instance à valeur exacte → exclus d'une évaluation sans calculatrice.
  calculatriceIndispensable: ["tonneau", "pot"],
  profilInstance: profilContenanceObjets,
};
