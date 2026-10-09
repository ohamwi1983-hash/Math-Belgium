import type { ExerciceLimitesContexte } from "../../core5e/limitesContexte.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consignePhase,
  formatContexteTexte,
  formatReponseAttendueTexte,
  formatReponseAttenduePhaseLatex,
  formatTermesDonneesLatex,
  labelsChampsLatex,
} from "../../ui5e/formatLimitesContexte";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimitesContexte } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimitesContexte>` pour 5gen23 ("Limites et
 * asymptotes en contexte", `App5gen23.tsx`/`moteur5e/sessionLimitesContexte.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence et
 * `generateurs5e/problemesContexte/exportEvaluation.ts` pour un exemple direct de condensation
 * d'un déroulé "en contexte" en questions papier.
 *
 * **4 familles, chacune sa propre séquence d'écrans** (`moteur5e/typesLimitesContexte.ts::ordreComplet`,
 * jamais un ordre variable dérivé de dimensions comme 5gen22) — condensées ici en 2 questions
 * papier par famille (une question par "thème" de l'écran, jamais une question par micro-écran) :
 * - `prixRevient` (3 écrans) → a) `asymptoteHorizontale` + `interpreter` fusionnés (calculer PUIS
 *   interpréter le même résultat, sans rupture) ; b) `vaSens`.
 * - `eauSalee` (3 écrans) → a) `construireC` + `limiteC` fusionnés (chaîne de calcul continue,
 *   même principe que le Système+Formule+Évaluation de `problemesContexte`) ; b) `interpreter`.
 * - `clubLoisirs` (4 écrans, AUCUN QCM) → a) `evaluer` + `inequation` fusionnés (évaluer f PUIS
 *   résoudre une inéquation sur f) ; b) `asymptoteOblique` + `interpreterPente` fusionnés (trouver
 *   l'asymptote PUIS interpréter sa pente).
 * - `population` (3 écrans) → a) `identification` + `interpreter` fusionnés (identifier a/b PUIS
 *   conclure croissance/régression à partir de b) ; b) `evaluerSeuil`.
 *
 * Contexte narratif (`formatContexteTexte`) et bloc de données (`formatTermesDonneesLatex`)
 * réutilisés TELS QUELS en tête d'énoncé (`enteteFragments`) — jamais reformulés. `enteteFragments`
 * est TOUJOURS rendu en mode KaTeX "bloc" (`assemblerEvaluationHtml.ts`) : chaque famille n'y place
 * qu'un texte narratif suivi d'UNE ou DEUX formules COMPLÈTES (jamais des fragments LaTeX courts
 * entrelacés avec du texte — voir le commentaire de tête de
 * `generateurs/distanceDroite/exportEvaluation.ts` pour le bug que ce motif éviterait). Le motif à 2
 * formules complètes séparées par un texte court (`eauSalee` : V(t) et Q(t)) suit le même patron
 * déjà utilisé par `generateurs5e/composerFonctions/exportEvaluation.ts` (deux fonctions définies
 * dans le même bloc d'entête), jamais une innovation risquée.
 *
 * **Écueil : les consignes `consignePhase(exercice, "interpreter"/"vaSens")` sont rédigées pour un
 * QCM** ("Choisis la phrase qui interprète correctement ce résultat.", "Choisis la justification
 * correcte.", etc.) — inutilisables telles quelles sur papier, où aucune liste d'options n'est
 * imprimée (voir `core5e/limitesContexte.types.ts::OptionInterpretation`, motif UNIQUEMENT
 * QCM/écran). Plutôt que d'omettre purement et simplement l'interprétation (ce que fait
 * `generateurs/triangleLies/exportEvaluation.ts` pour son propre écran QCM redondant), on la
 * transforme ici en question ouverte : `versJustificationEcrite` réutilise TEL QUEL le texte de
 * `consignePhase` (la question posée à l'écran ne change pas) et ne remplace QUE la dernière phrase
 * ("Choisis...") par une consigne de justification écrite — l'interprétation en contexte est le
 * cœur pédagogique de ce générateur ("Limites et asymptotes EN CONTEXTE"), elle ne peut pas être
 * simplement supprimée comme le fait triangleLies pour un écran secondaire. Le corrigé réutilise
 * `formatReponseAttendueTexte` (déjà le texte de l'option correcte, jamais reformulé) pour la
 * justification attendue.
 *
 * **Écueil secondaire** : `formatReponseAttenduePhaseLatex` omet le label pour 2 des 11 phases
 * (`clubLoisirs` "inequation"/"interpreterPente" renvoient la valeur seule, ex. `7\text{ mois}`,
 * sans le "x=" que `labelsChampsLatex` porte séparément — à la différence des 9 autres phases, déjà
 * rendues sous forme d'équation complète, ex. `f(0)\times100=400`). `avecLabel` ci-dessous zippe les
 * deux pour ces 2 cas précis, sans dupliquer aucun texte (labels ET valeurs viennent de `ui5e/`).
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues de l'instance tirée via les
 * formateurs déjà utilisés côté écran pour le récapitulatif final (`formatReponseAttenduePhaseLatex`/
 * `formatReponseAttendueTexte`, `ui5e/formatLimitesContexte.ts`) — jamais recalculée indépendamment.
 *
 * **PAS `regroupable`** : chaque famille produit 2 questions par instance (jamais une seule) avec
 * une consigne DÉPENDANTE des valeurs tirées (b, seuil, facteur, contexte narratif...), jamais une
 * constante générique — les 2 conditions requises sont donc violées, même raison que
 * `generateurs/triangleLies/exportEvaluation.ts`/`generateurs/distanceDroite/exportEvaluation.ts`.
 */

/** Remplace la fin "Choisis la/l'... ." (rédigée pour un QCM écran) par une consigne de
 * justification écrite — la question elle-même (tout ce qui précède) reste le texte EXACT de
 * `consignePhase`, jamais reformulée. Voir le commentaire de tête pour le détail de cet écueil. */
function versJustificationEcrite(consigneEcran: string): string {
  return consigneEcran.replace(/Choisis (la|l')[^.]*\.$/, "Justifie ta réponse en une phrase.");
}

/** Zippe un label (`labelsChampsLatex`) avec sa valeur (`formatReponseAttenduePhaseLatex`) quand
 * cette dernière ne porte pas déjà le label — voir "Écueil secondaire" ci-dessus. */
function avecLabel(label: string, valeur: string): string {
  return `${label}${valeur}`;
}

function construireEnonceLimitesContexte(exercice: ExerciceLimitesContexte): SectionExercice {
  const contexteTexte = formatContexteTexte(exercice);
  const [formule1, formule2] = formatTermesDonneesLatex(exercice);
  const enteteFragments = formule2
    ? [texte(`${contexteTexte} `), latex(formule1), texte(" ; "), latex(formule2)]
    : [texte(`${contexteTexte} `), latex(formule1)];

  switch (exercice.famille) {
    case "prixRevient": {
      const consigneA = `${consignePhase(exercice, "asymptoteHorizontale")} ${versJustificationEcrite(consignePhase(exercice, "interpreter"))}`;
      const consigneB = versJustificationEcrite(consignePhase(exercice, "vaSens"));
      return {
        enteteFragments,
        questions: [
          { consigne: [texte(consigneA)], reponse: { type: "lignes", nombre: 4 } },
          { consigne: [texte(consigneB)], reponse: { type: "lignes", nombre: 2 } },
        ],
      };
    }
    case "eauSalee": {
      const consigneA = `${consignePhase(exercice, "construireC")} ${consignePhase(exercice, "limiteC")}`;
      const consigneB = versJustificationEcrite(consignePhase(exercice, "interpreter"));
      return {
        enteteFragments,
        questions: [
          { consigne: [texte(consigneA)], reponse: { type: "lignes", nombre: 4 } },
          { consigne: [texte(consigneB)], reponse: { type: "lignes", nombre: 2 } },
        ],
      };
    }
    case "clubLoisirs": {
      const consigneA = `${consignePhase(exercice, "evaluer")} ${consignePhase(exercice, "inequation")}`;
      const consigneB = `${consignePhase(exercice, "asymptoteOblique")} ${consignePhase(exercice, "interpreterPente")}`;
      return {
        enteteFragments,
        questions: [
          { consigne: [texte(consigneA)], reponse: { type: "lignes", nombre: 6 } },
          { consigne: [texte(consigneB)], reponse: { type: "lignes", nombre: 4 } },
        ],
      };
    }
    case "population": {
      const consigneA = `${consignePhase(exercice, "identification")} ${versJustificationEcrite(consignePhase(exercice, "interpreter"))}`;
      const consigneB = consignePhase(exercice, "evaluerSeuil");
      return {
        enteteFragments,
        questions: [
          { consigne: [texte(consigneA)], reponse: { type: "lignes", nombre: 4 } },
          { consigne: [texte(consigneB)], reponse: { type: "lignes", nombre: 3 } },
        ],
      };
    }
  }
}

function construireCorrectionLimitesContexte(exercice: ExerciceLimitesContexte): BlocCorrection[] {
  switch (exercice.famille) {
    case "prixRevient": {
      const [limite] = formatReponseAttenduePhaseLatex(exercice, "asymptoteHorizontale");
      const interpretation = formatReponseAttendueTexte(exercice, "interpreter") ?? "";
      const vaSens = formatReponseAttendueTexte(exercice, "vaSens") ?? "";
      return [
        { type: "paragraphe", fragments: [texte("a) "), latex(limite), texte(" — " + interpretation)] },
        { type: "paragraphe", fragments: [texte("b) " + vaSens)] },
      ];
    }
    case "eauSalee": {
      const [construireC] = formatReponseAttenduePhaseLatex(exercice, "construireC");
      const [limiteC] = formatReponseAttenduePhaseLatex(exercice, "limiteC");
      const interpretation = formatReponseAttendueTexte(exercice, "interpreter") ?? "";
      return [
        { type: "paragraphe", fragments: [texte("a) "), latex(construireC), texte(", donc "), latex(limiteC), texte(".")] },
        { type: "paragraphe", fragments: [texte("b) " + interpretation)] },
      ];
    }
    case "clubLoisirs": {
      const [f0, fX] = formatReponseAttenduePhaseLatex(exercice, "evaluer");
      const [labelInequation] = labelsChampsLatex(exercice, "inequation");
      const [valeurInequation] = formatReponseAttenduePhaseLatex(exercice, "inequation");
      const [asymptoteOblique] = formatReponseAttenduePhaseLatex(exercice, "asymptoteOblique");
      const [labelPente] = labelsChampsLatex(exercice, "interpreterPente");
      const [valeurPente] = formatReponseAttenduePhaseLatex(exercice, "interpreterPente");
      return [
        {
          type: "paragraphe",
          fragments: [
            texte("a) "),
            latex(f0),
            texte(", "),
            latex(fX),
            texte(" — inéquation : "),
            latex(avecLabel(labelInequation, valeurInequation)),
            texte("."),
          ],
        },
        {
          type: "paragraphe",
          fragments: [texte("b) "), latex(asymptoteOblique), texte(" — pente interprétée : "), latex(avecLabel(labelPente, valeurPente)), texte(".")],
        },
      ];
    }
    case "population": {
      const [aLatex, bLatex] = formatReponseAttenduePhaseLatex(exercice, "identification");
      const interpretation = formatReponseAttendueTexte(exercice, "interpreter") ?? "";
      const [fLatex, comparaisonLatex] = formatReponseAttenduePhaseLatex(exercice, "evaluerSeuil");
      const positionSeuil = comparaisonLatex.includes(">") ? " (au-dessus du seuil)." : " (en dessous du seuil).";
      return [
        { type: "paragraphe", fragments: [texte("a) "), latex(aLatex), texte(", "), latex(bLatex), texte(" — " + interpretation)] },
        { type: "paragraphe", fragments: [texte("b) "), latex(fLatex), texte(", donc "), latex(comparaisonLatex), texte(positionSeuil)] },
      ];
    }
  }
}

export const adaptateurEvaluationLimitesContexte: AdaptateurFeuilleExercices<ExerciceLimitesContexte> = {
  titreDocument: "Limites et asymptotes en contexte — Évaluation",
  nomFichierBase: "limites-asymptotes-contexte",
  genererInstance: genererExerciceLimitesContexte,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceLimitesContexte,
  construireCorrection: construireCorrectionLimitesContexte,
  // PAS regroupable — 2 questions par instance (jamais une seule), consigne dépendante des valeurs
  // tirées (b, seuil, facteur, contexte narratif...) : voir le commentaire de tête.
};
