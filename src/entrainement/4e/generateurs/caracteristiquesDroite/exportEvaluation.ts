import type { ExerciceCaracteristiquesDroite, VarianteCaracteristiquesDroite } from "../../core/caracteristiquesDroite.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  type FragmentConsigne,
  formatCaracteristiquesAttenduesLatex,
  formatCorrectionCaracteristiquesLatex,
  formatDroiteEntreeLatex,
  formatPointLatex,
  formatVecteurLatex,
  LIBELLE_CARACTERISTIQUE,
  segmentsAideExtractionNiveau1,
  segmentsConsigneExtraction,
} from "../../ui/formatCaracteristiquesDroite";
import { correctionDetailleeCaracteristiquesDroite } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCaracteristiquesDroite } from "./index";
import { LIBELLE_CAS_PARALLELE_AXE, profilCaracteristiquesDroite } from "../profilsEvaluation4eCh7Droites";

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
 * `formatVecteurLatex` (valeurs finales, question a), `formatCorrectionCaracteristiquesLatex`
 * (chaîne de calcul complète, question b — gère elle-même le cas vertical) et
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
  const precision = exercice.caracteristiqueDemandee === "pente" ? "" : " (en degrés, arrondi à l'unité)";
  return [texte(`${prefixe}${libelle}${precision} et l'ordonnée à l'origine de cette droite ?`)];
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

/** Question b) — chaîne de calcul complète depuis le point et le vecteur de la question a)
 * (`formatCorrectionCaracteristiquesLatex` : pente substituée puis simplifiée, angle avec la
 * correction « +180° » d'un arctan négatif, ordonnée à l'origine avec facteurs entre parenthèses),
 * puis les valeurs finales attendues. Cas vertical : la conclusion seule (pente et ordonnée
 * n'existent pas ; angle 90° avec Ox, 0° avec Oy). */
function construireCorrectionCaracteristiques(exercice: ExerciceCaracteristiquesDroite): BlocCorrection {
  if (exercice.verticale) {
    return {
      type: "paragraphe",
      fragments: [texte("b) "), latex(formatCorrectionCaracteristiquesLatex(exercice)), texte(".")],
    };
  }
  return {
    type: "paragraphe",
    fragments: [
      texte("b) En reprenant le point et le vecteur directeur de la question a) : "),
      latex(formatCorrectionCaracteristiquesLatex(exercice)),
      texte(". Réponse : "),
      latex(formatCaracteristiquesAttenduesLatex(exercice)),
      texte("."),
    ],
  };
}

function construireCorrectionCaracteristiquesDroite(exercice: ExerciceCaracteristiquesDroite): BlocCorrection[] {
  return [construireCorrectionExtraction(exercice), construireCorrectionCaracteristiques(exercice)];
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les 2 écrans (point + vecteur directeur, puis caractéristiques) sont les étapes d'APPRENTISSAGE :
// sur papier, l'énoncé donne l'équation et UNE consigne (la caractéristique demandée et l'ordonnée
// à l'origine, « si elles existent » pour TOUTES les instances : la droite verticale n'est jamais
// annoncée). Valeurs : `formatCorrectionCaracteristiquesLatex`/`formatCaracteristiquesAttenduesLatex`,
// les mêmes que la révélation de l'écran.

function libelleDemande(exercice: ExerciceCaracteristiquesDroite): string {
  switch (exercice.caracteristiqueDemandee) {
    case "pente":
      return "la pente";
    case "angleOx":
      return "l'angle que d forme avec l'axe Ox (en degrés, arrondi à l'unité si nécessaire)";
    case "angleOy":
      return "l'angle que d forme avec l'axe Oy (en degrés, arrondi à l'unité si nécessaire)";
  }
}

function enoncePapier(exercice: ExerciceCaracteristiquesDroite): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(exercice.variante === "parametrique" ? "On donne la droite d d'équations paramétriques :" : "On donne la droite d d'équation :"), latex(formatDroiteEntreeLatex(exercice))],
      questions: [{ consigne: [texte(`Détermine ${libelleDemande(exercice)} et l'ordonnée à l'origine de d, si elles existent. Justifie.`)] }],
    },
    etapesParQuestion: [["a", "b"]],
  };
}

function reponseBreve(exercice: ExerciceCaracteristiquesDroite): FragmentConsigne[] {
  return [latex(formatCaracteristiquesAttenduesLatex(exercice))];
}

function bareme(exercice: ExerciceCaracteristiquesDroite): BaremeExercice {
  const extraction = [
    { sousQuestion: "a", critere: [texte("Un point de d")], points: 0.5 },
    { sousQuestion: "a", critere: [texte("Un vecteur directeur : "), latex(`\\vec{u}${formatVecteurLatex(exercice.vecteur)}`), texte(" (ou un multiple)")], points: 1 },
  ];
  const nom = exercice.caracteristiqueDemandee === "pente" ? "Pente" : "Angle";
  const criteresB = exercice.verticale
    ? [
        { sousQuestion: "b", critere: [texte("Droite verticale reconnue")], points: 1 },
        { sousQuestion: "b", critere: [texte(exercice.caracteristiqueDemandee === "pente" ? "Pente : n'existe pas" : `Angle : ${exercice.caracteristiqueDemandee === "angleOx" ? "90°" : "0°"}`)], points: 0.5 },
        { sousQuestion: "b", critere: [texte("Ordonnée à l'origine : n'existe pas")], points: 1 },
      ]
    : [
        { sousQuestion: "b", critere: [texte(`${nom} : `), latex(formatCaracteristiquesAttenduesLatex(exercice).split(", \\quad p")[0])], points: 1.5 },
        { sousQuestion: "b", critere: [texte("Ordonnée à l'origine : "), latex(`p = ${formatCaracteristiquesAttenduesLatex(exercice).split("p = ")[1] ?? ""}`)], points: 1 },
      ];
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [...extraction, ...criteresB],
    erreursFrequentes: [
      exercice.caracteristiqueDemandee === "angleOx"
        ? { description: [texte("Angle négatif laissé tel quel (sans ajouter 180°)")], cout: "−1" }
        : exercice.caracteristiqueDemandee === "angleOy"
          ? { description: [texte("Angle avec Ox donné à la place de l'angle avec Oy")], cout: "−1" }
          : { description: [texte("Pente inversée (x sur y)")], cout: "−1" },
      { description: [texte("Ordonnée à l'origine confondue avec la constante de l'équation cartésienne")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte("Angle à 1° près ; pente et ordonnée sous forme de fraction ou de décimal exact")]],
  };
}

/** Niveau : deux écrans (lecture pour des équations paramétriques : point et vecteur recopiés) ;
 * méthode imposée ; piège dans les données : une pente négative quand l'angle avec Ox est demandé
 * (+ 180°) ; nombres : angle non remarquable (calculatrice, arrondi). La droite verticale (verdict
 * « n'existe pas ») garde le niveau de son tirage. */
function criteresDifficulte(exercice: ExerciceCaracteristiquesDroite): CriteresDifficulte {
  const angle = exercice.caracteristiqueDemandee !== "pente";
  const exact = Math.abs(exercice.angleDeg - Math.round(exercice.angleDeg)) < 1e-9;
  return {
    ...etapesDuCorrige(correctionDetailleeCaracteristiquesDroite(exercice), exercice.variante === "parametrique" ? ["a"] : []),
    methode: 0,
    piege: exercice.caracteristiqueDemandee === "angleOx" && exercice.pente !== null && exercice.pente < 0 ? 1 : 0,
    nombres: angle && !exact ? 1 : 0,
  };
}

export const adaptateurEvaluationCaracteristiquesDroite: AdaptateurFeuilleExercices<ExerciceCaracteristiquesDroite> = {
  titreDocument: "Caractéristiques d'une droite — Évaluation",
  nomFichierBase: "caracteristiques-droite",
  genererInstance: genererExerciceCaracteristiquesDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteCaracteristiquesDroite),
  construireEnonce: construireEnonceCaracteristiquesDroite,
  construireCorrection: construireCorrectionCaracteristiquesDroite,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeCaracteristiquesDroite,
  bareme,
  enoncePapier,
  profilInstance: profilCaracteristiquesDroite,
  libelleCasParticulier: LIBELLE_CAS_PARALLELE_AXE,
};
