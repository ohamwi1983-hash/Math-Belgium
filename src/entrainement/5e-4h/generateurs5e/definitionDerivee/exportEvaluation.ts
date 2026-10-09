import type { ExerciceDefinitionDerivee } from "../../core5e/definitionDerivee.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGenerale, formatFDeXLatex, formatReponseAttendueEcranLatex, LIBELLE_ECRAN } from "../../ui5e/formatDefinitionDerivee";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDefinitionDerivee } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDefinitionDerivee>` pour 5gen26 (Calculer f'(a)
 * par la définition) — feuille d'évaluation. L'écran interactif traverse TOUJOURS 3 écrans dans le
 * même ordre (`App5gen26.tsx`/`moteur5e/typesDefinitionDerivee.ts::ORDRE_COMPLET`, jamais importé
 * ici) : "developper" (calculer f(a), développer f(a+h) en fonction de h), "quotient" (former puis
 * simplifier le taux d'accroissement [f(a+h)-f(a)]/h), "limite" (faire h→0 pour obtenir f'(a)). La
 * version papier condense cela en UNE SEULE question ("calcule f'(a) par la définition, en
 * détaillant chaque étape") — même principe que `limites/exportEvaluation.ts` et
 * `asymptoteOblique/exportEvaluation.ts` (Branche A du chapitre précédent) : on demande le résultat
 * justifié plutôt que de rejouer chaque écran guidé séparément. La consigne reprend `consigneGenerale()`
 * TELLE QUELLE (déjà utilisée côté écran comme titre de l'exercice) — elle substitue directement la
 * valeur de `a` tirée ("Calcule le nombre dérivé f'(5)…"), donc PAS de rappel redondant de `a` dans
 * `enteteFragments` (seule f(x) y figure).
 *
 * Le corrigé RESYNTHÉTISE les 3 étapes, une par écran, via `formatReponseAttendueEcranLatex`
 * (`ui5e/formatDefinitionDerivee.ts`, déjà la fonction utilisée côté écran par
 * `ResultatPanelDefinitionDerivee.tsx` pour le récapitulatif final) — jamais recalculé
 * indépendamment ici. Chaque étape reste un unique fragment `latex()` (fragments internes joints
 * par `\quad`), jamais plusieurs fragments latex courts mêlés à du texte dans un même bloc.
 *
 * `regroupable` : PAS activé. Bien qu'il n'y ait qu'UNE question par instance et aucun `enteteHtml`,
 * la consigne condensée (`consigneGenerale(exercice)`) n'est PAS générique : elle interpole
 * directement la valeur de `a` tirée pour CETTE instance ("f'(5)", "f'(-2)"…), ce qui viole la 2e
 * condition non négociable de `AdaptateurFeuilleExercices.regroupable` (voir
 * `export/genererFeuilleExercices.ts`) — le mécanisme de regroupement n'affiche la consigne qu'UNE
 * SEULE fois pour toutes les instances réunies, ce qui serait faux dès que deux instances tirent un
 * `a` différent (le cas général). `regroupable` reste donc `false`/absent, comme
 * `limites/exportEvaluation.ts` (disqualifié pour une raison différente, la même conclusion).
 *
 * N'importe RIEN de `moteur5e/` : `"developper" | "quotient" | "limite"` sont passés en littéraux de
 * chaîne à `formatReponseAttendueEcranLatex`/`LIBELLE_ECRAN` (typés `EcranDefinitionDerivee` côté
 * `ui5e/formatDefinitionDerivee.ts`, qui lui-même importe ce type de `moteur5e/typesDefinitionDerivee.ts`)
 * — TypeScript vérifie ces littéraux structurellement contre le type du paramètre sans qu'un import
 * du type lui-même soit nécessaire ici.
 */

const NOMBRE_LIGNES_REPONSE = 6;

const ECRANS_ORDRE = ["developper", "quotient", "limite"] as const;

function construireEnonceDefinitionDerivee(exercice: ExerciceDefinitionDerivee): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatFDeXLatex(exercice)), texte(".")],
    questions: [
      {
        consigne: [texte(consigneGenerale(exercice))],
        reponse: { type: "lignes", nombre: NOMBRE_LIGNES_REPONSE },
      },
    ],
  };
}

function construireCorrectionDefinitionDerivee(exercice: ExerciceDefinitionDerivee): BlocCorrection[] {
  return ECRANS_ORDRE.map((ecran) => ({
    type: "paragraphe",
    fragments: [texte(`${LIBELLE_ECRAN[ecran]} : `), latex(formatReponseAttendueEcranLatex(exercice, ecran).join(" \\quad "))],
  }));
}

export const adaptateurEvaluationDefinitionDerivee: AdaptateurFeuilleExercices<ExerciceDefinitionDerivee> = {
  titreDocument: "Calculer f'(a) par la définition — Évaluation",
  nomFichierBase: "definition-derivee",
  genererInstance: genererExerciceDefinitionDerivee,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceDefinitionDerivee,
  construireCorrection: construireCorrectionDefinitionDerivee,
};
