import type { ExerciceCaracteristiquesDroite, VarianteCaracteristiquesDroite } from "../../core/caracteristiquesDroite.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  type FragmentConsigne,
  formatAideCaracteristiquesNiveau2Latex,
  formatCaracteristiquesAttenduesLatex,
  formatDroiteEntreeLatex,
  formatPointLatex,
  formatVecteurLatex,
  LIBELLE_CARACTERISTIQUE,
  segmentsAideExtractionNiveau1,
  segmentsConsigneExtraction,
} from "../../ui/formatCaracteristiquesDroite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCaracteristiquesDroite } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCaracteristiquesDroite>` pour gen46
 * (Caractéristiques d'une droite — chapitre "Géométrie analytique plane", `AppCaracteristiquesDroite.tsx`,
 * section "Pente, angle et ordonnée à l'origine" de `geometrie-analytique-plane.ts` côté Math-Belgium)
 * — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Écran → question papier (mapping 1:1, aucune fusion ni éclatement) :
 * - Écran "extraction" (`sessionCaracteristiquesDroite.ts`, `EtapeExtractionCaracteristiquesDroite.tsx`) :
 *   extraire/recopier un point A et un vecteur directeur u de la droite donnée → question a),
 *   consigne reprise TELLE QUELLE (`segmentsConsigneExtraction`, déjà distincte "Extrais..."/
 *   "Recopie..." selon `variante === "parametrique"`).
 * - Écran "caracteristiques" (`EtapeCaracteristiquesDroite.tsx`) : pente OU angle (Ox/Oy selon
 *   `caracteristiqueDemandee`) + ordonnée à l'origine → question b). La consigne écran
 *   (`segmentsConsigneCaracteristiques`) suppose l'équation réaffichée juste en dessous à l'écran ;
 *   ici l'équation n'est montrée QU'UNE FOIS, dans `enteteFragments` (même principe que
 *   `analyseFonction/exportWord.ts`) — la consigne papier est donc reconstruite ci-dessous
 *   (`segmentsConsigneCaracteristiquesPapier`) avec la même alternative "Quelle est la pente"/"Quel
 *   est l'angle avec l'axe Ox/Oy" (même petite fonction `prefixe` dupliquée depuis
 *   `formatCaracteristiquesDroite.ts`, non exportée là-bas — même principe de duplication assumée
 *   qu'ailleurs dans le projet, ex. `formatDroiteEntreeLatex` lui-même dupliqué depuis
 *   `formatRelationsDroites.ts`), mais sans la portion finale "...de la droite d'équation :" qui
 *   n'a de sens que si l'équation est réaffichée juste après.
 *
 * PAS `regroupable` : 2 questions par instance (jamais une seule), et la consigne de CHACUNE dépend
 * de l'instance tirée — a) de la variante (`explicite`/`implicite`/`parametrique`, "Extrais"
 * vs "Recopie"), b) de `caracteristiqueDemandee` (pente / angle Ox / angle Oy) — jamais une
 * consigne GÉNÉRIQUE indépendante des valeurs tirées comme l'exige `regroupable` (voir sa
 * documentation dans `genererFeuilleExercices.ts`).
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.point`/`vecteur`/`pente`/`angleDeg`/`angleOyDeg`/`ordonneeOrigine`), en réutilisant
 * directement les formateurs déjà utilisés côté écran interactif plutôt que d'en reconstruire de
 * nouveaux : `segmentsAideExtractionNiveau1` (texte de méthode, question a), `formatPointLatex`/
 * `formatVecteurLatex` (valeurs finales, question a), `formatAideCaracteristiquesNiveau2Latex`
 * (formule substituée, question b — gère déjà elle-même le cas vertical) et
 * `formatCaracteristiquesAttenduesLatex` (valeurs finales, question b — idem). Pour la variante
 * `parametrique`, l'écran 1 n'a rien à extraire (point/vecteur déjà donnés tels quels) : la
 * correction a) le rappelle simplement plutôt que de dérouler une méthode qui n'existe pas.
 *
 * Aucune zone de réponse vierge (`QuestionExercice.reponse` jamais renseigné) : le pipeline HTML
 * de l'évaluation (`export/assemblerEvaluationHtml.ts::corpsQuestionHtml`) n'en affiche de toute
 * façon aucune — l'élève répond sur une feuille à part, jamais sur la copie imprimée elle-même.
 */

/** Dupliquée depuis `formatCaracteristiquesDroite.ts` (`segmentsConsigneCaracteristiques`, non
 * exportée telle quelle) — voir le commentaire de tête pour la raison de cette petite duplication
 * assumée : la version écran suppose l'équation réaffichée juste après, jamais le cas ici. */
function segmentsConsigneCaracteristiquesPapier(exercice: ExerciceCaracteristiquesDroite): FragmentConsigne[] {
  const prefixe = exercice.caracteristiqueDemandee === "pente" ? "Quelle est " : "Quel est ";
  const libelle = LIBELLE_CARACTERISTIQUE[exercice.caracteristiqueDemandee];
  return [texte(`${prefixe}${libelle} et l'ordonnée à l'origine de cette droite ?`)];
}

function construireEnonceCaracteristiquesDroite(exercice: ExerciceCaracteristiquesDroite): SectionExercice {
  return {
    enteteFragments: [texte("On considère la droite d'équation "), latex(formatDroiteEntreeLatex(exercice)), texte(".")],
    questions: [
      { consigne: segmentsConsigneExtraction(exercice) },
      { consigne: segmentsConsigneCaracteristiquesPapier(exercice) },
    ],
  };
}

/** Question a) — méthode (texte, sauf `parametrique` : rien à extraire) puis point/vecteur
 * canoniques obtenus, en rappelant que tout autre point/tout autre multiple non nul du vecteur
 * reste une réponse valable (même tolérance que l'écran, `verifierExtraction`/
 * `diagnostiquerPointVecteurParametrique`). */
function construireCorrectionExtraction(exercice: ExerciceCaracteristiquesDroite): BlocCorrection {
  const valeurs: FragmentConsigne[] = [
    texte("On obtient par exemple "),
    latex(`A${formatPointLatex(exercice.point)}`),
    texte(" et "),
    latex(`\\vec{u}${formatVecteurLatex(exercice.vecteur)}`),
    texte(" (tout autre point de la droite, ou tout autre vecteur directeur non nul proportionnel à "),
    latex("\\vec{u}"),
    texte(", est également accepté)."),
  ];

  if (exercice.variante === "parametrique") {
    return {
      type: "paragraphe",
      fragments: [
        texte("a) Le point "),
        latex("A"),
        texte(" et le vecteur directeur "),
        latex("\\vec{u}"),
        texte(" sont déjà donnés directement dans la représentation paramétrique. "),
        ...valeurs,
      ],
    };
  }

  return {
    type: "paragraphe",
    fragments: [texte("a) "), ...segmentsAideExtractionNiveau1(exercice), texte(" "), ...valeurs],
  };
}

/** Question b) — formule substituée avec le point/vecteur de la question a), puis les valeurs
 * finales attendues. Cas vertical à part : `formatAideCaracteristiquesNiveau2Latex` et
 * `formatCaracteristiquesAttenduesLatex` énoncent alors TOUS LES DEUX, intégralement, la même
 * conclusion ("m et p n'existent pas, α=90°") — les combiner comme dans le cas général répéterait
 * donc deux fois la même phrase ; une seule des deux suffit ici. */
function construireCorrectionCaracteristiques(exercice: ExerciceCaracteristiquesDroite): BlocCorrection {
  if (exercice.verticale) {
    return {
      type: "paragraphe",
      fragments: [
        texte("b) Vecteur directeur "),
        latex(`\\vec{u}${formatVecteurLatex(exercice.vecteur)}`),
        texte(" : "),
        latex(formatCaracteristiquesAttenduesLatex(exercice)),
        texte("."),
      ],
    };
  }
  return {
    type: "paragraphe",
    fragments: [
      texte("b) En reprenant le point et le vecteur directeur de la question a) : "),
      latex(formatAideCaracteristiquesNiveau2Latex(exercice)),
      texte(", donc "),
      latex(formatCaracteristiquesAttenduesLatex(exercice)),
      texte("."),
    ],
  };
}

function construireCorrectionCaracteristiquesDroite(exercice: ExerciceCaracteristiquesDroite): BlocCorrection[] {
  return [construireCorrectionExtraction(exercice), construireCorrectionCaracteristiques(exercice)];
}

export const adaptateurEvaluationCaracteristiquesDroite: AdaptateurFeuilleExercices<ExerciceCaracteristiquesDroite> = {
  titreDocument: "Caractéristiques d'une droite — Évaluation",
  nomFichierBase: "caracteristiques-droite",
  genererInstance: genererExerciceCaracteristiquesDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteCaracteristiquesDroite),
  construireEnonce: construireEnonceCaracteristiquesDroite,
  construireCorrection: construireCorrectionCaracteristiquesDroite,
};
