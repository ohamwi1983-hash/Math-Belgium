import type { ExerciceLimite } from "../../core5e/limites.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGenerale, formatBlocDonneesLatex, formatReponseAttenduePhaseLatex, LIBELLE_FAMILLE_LIMITE } from "../../ui5e/formatLimites";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimite } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimite>` pour 5gen20 (Limites, reconnaissance et
 * calcul) — feuille d'évaluation. L'écran interactif traverse jusqu'à 4 phases guidées selon la
 * famille (`App5gen20.tsx` : "reconnaissance" commune, puis "factoriser"+"simplifierEvaluer"
 * (0/0), "factoriserDenominateur"+"limitesGaucheDroite"+"conclureLimite" (infinie en un point), ou
 * "termeDominant"+"simplifierLimiteRef"+"evaluerLimiteFinale" (infini)) ; la version papier
 * condense TOUJOURS cela en UNE SEULE question ("détermine cette limite, étape par étape"), même
 * principe que `domaineDefinition`/`suitesClassiques` (Branche A) : on demande le résultat justifié
 * plutôt que de rejouer chaque écran séparément — la consigne reprend d'ailleurs `consigneGenerale()`
 * TELLE QUELLE (déjà volontairement neutre côté écran, ne révèle aucune famille).
 *
 * Le corrigé RESYNTHÉTISE les étapes clé (jamais recalculées : uniquement `formatReponseAttenduePhaseLatex`,
 * déjà la source de vérité utilisée côté écran pour la révélation) — un paragraphe par étape
 * structurante de la famille concernée (facteurs communs / dénominateur factorisé+limites
 * unilatérales+conclusion / termes dominants+rapport simplifié+valeur finale), précédé d'un rappel
 * du type de limite identifié (`LIBELLE_FAMILLE_LIMITE`).
 *
 * `regroupable` : PAS activé, bien que la consigne condensée soit générique et fixe (un seul point
 * pourrait le laisser croire). Raison spécifique à ce générateur : l'énoncé de CHAQUE instance est
 * l'expression `\lim_{x\to cible}\dfrac{N}{D}` (`formatBlocDonneesLatex`), qui a structurellement
 * besoin du mode KaTeX DISPLAY pour empiler "lim"/la cible/la fraction (voir le commentaire
 * "transversal 1" de `ui5e/formatLimites.ts` et `limNecessiteModeDisplay`) — or le mécanisme de
 * regroupement (`AppEvaluation5e.tsx::construireItemRegroupe`) verse ce contenu par-instance dans
 * `questions[i].consigne`, rendu par `assemblerEvaluationHtml.ts::corpsQuestionHtml` SANS
 * `{bloc:true}` (ligne de tableau a)/b)/c)…, toujours en ligne) : la cible "x\to a" s'afficherait
 * alors collée en indice à droite de "lim" au lieu d'empilée dessous, cassant la convention de
 * notation déjà établie pour tout le reste du chapitre. Seul le chemin NON regroupé
 * (`enteteFragments` rendu avec `{bloc:true}`, `corpsQuestionHtml` ligne 198) préserve ce rendu —
 * `regroupable` reste donc `false`/absent.
 */

const NOMBRE_LIGNES_PAR_FAMILLE: Record<ExerciceLimite["famille"], number> = {
  limiteReelle: 3,
  formeIndeterminee: 5,
  limiteInfiniePoint: 6,
  limiteInfini: 6,
};

function construireEnonceLimite(exercice: ExerciceLimite): SectionExercice {
  return {
    enteteFragments: [latex(formatBlocDonneesLatex(exercice))],
    questions: [
      {
        consigne: [texte(consigneGenerale())],
        reponse: { type: "lignes", nombre: NOMBRE_LIGNES_PAR_FAMILLE[exercice.famille] },
      },
    ],
  };
}

function construireCorrectionLimite(exercice: ExerciceLimite): BlocCorrection[] {
  const blocs: BlocCorrection[] = [{ type: "paragraphe", fragments: [texte("Type de limite : "), texte(LIBELLE_FAMILLE_LIMITE[exercice.famille])] }];

  switch (exercice.famille) {
    case "limiteReelle": {
      const finale = formatReponseAttenduePhaseLatex(exercice, "reconnaissance");
      blocs.push({ type: "paragraphe", fragments: [latex(finale.join(" \\quad "))] });
      break;
    }
    case "formeIndeterminee": {
      const facteurs = formatReponseAttenduePhaseLatex(exercice, "factoriser");
      const finale = formatReponseAttenduePhaseLatex(exercice, "simplifierEvaluer");
      blocs.push({ type: "paragraphe", fragments: [latex(facteurs.join(" \\quad "))] });
      blocs.push({ type: "paragraphe", fragments: [latex(finale.join(" \\quad "))] });
      break;
    }
    case "limiteInfiniePoint": {
      const denom = formatReponseAttenduePhaseLatex(exercice, "factoriserDenominateur");
      const gaucheDroite = formatReponseAttenduePhaseLatex(exercice, "limitesGaucheDroite");
      const conclusion = formatReponseAttenduePhaseLatex(exercice, "conclureLimite");
      blocs.push({ type: "paragraphe", fragments: [latex(denom.join(" \\quad "))] });
      blocs.push({ type: "paragraphe", fragments: [latex(gaucheDroite.join(" \\quad "))] });
      blocs.push({ type: "paragraphe", fragments: [latex(conclusion.join(" \\quad "))] });
      break;
    }
    case "limiteInfini": {
      const dominants = formatReponseAttenduePhaseLatex(exercice, "termeDominant");
      const ref = formatReponseAttenduePhaseLatex(exercice, "simplifierLimiteRef");
      const finale = formatReponseAttenduePhaseLatex(exercice, "evaluerLimiteFinale");
      blocs.push({ type: "paragraphe", fragments: [latex(dominants.join(" \\quad "))] });
      blocs.push({ type: "paragraphe", fragments: [latex(ref.join(" \\quad "))] });
      blocs.push({ type: "paragraphe", fragments: [latex(finale.join(" \\quad "))] });
      break;
    }
  }

  return blocs;
}

export const adaptateurEvaluationLimites: AdaptateurFeuilleExercices<ExerciceLimite> = {
  titreDocument: "Limites, reconnaissance et calcul — Évaluation",
  nomFichierBase: "limites",
  genererInstance: genererExerciceLimite,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceLimite,
  construireCorrection: construireCorrectionLimite,
};
