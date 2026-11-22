import type { ExerciceLectureGraphiqueDroite } from "../../core/lectureGraphiqueDroite.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGeneraleLecture, consigneLecture, formatReponseAttendueLatex } from "../../ui/formatLectureGraphiqueDroite";
import { formatPointLatex, formatVecteurLatex } from "../../ui/formatEquationDroite";
import { pointsEntiersVisibles } from "../../ui/lectureGraphiqueDroiteGraph";
import { construireSvgLectureGraphiqueDroite } from "./figure";
import { correctionDetailleeLectureGraphiqueDroite } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureGraphiqueDroite } from "./index";
import { LIBELLE_CAS_PARALLELE_AXE, profilLectureGraphiqueDroite } from "../profilsEvaluation4eCh7Droites";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLectureGraphiqueDroite>` pour gen43 (Lecture
 * graphique — équation d'une droite, `AppLectureGraphiqueDroite.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/constructionVectorielle/exportEvaluation.ts` pour l'exemple jumeau d'un graphique
 * papier écrit à la main (moteur `<svg>` propre à chaque adaptateur, aucun moteur générique
 * point/vecteur partagé dans `export/`).
 *
 * Chapitre Math-Belgium "Géométrie analytique plane" (4e), section "Lire et tracer une droite"
 * (`lire-tracer`, `src/content/chapters/4e/geometrie-analytique-plane.ts` côté Math-Belgium) — cette
 * section est servie par DEUX générateurs, gen43 (celui-ci, lecture d'une droite déjà tracée) ET
 * gen44 (`constructionDroite`, tracer une droite depuis son équation, porté séparément).
 *
 * **Écran → question** : `moteur/sessionLectureGraphiqueDroite.ts` n'a qu'UN seul écran par
 * exercice (pas de `Phase`), dispatché directement sur `exercice.variante` — `EtapeLectureCartesienne.tsx`
 * (champ de texte libre, n'importe quelle forme cartésienne équivalente acceptée — implicite ou
 * explicite en x/en y, voir `verificationLectureGraphiqueDroite.ts::diagnostiquerCartesienne`) ou
 * `EtapeLectureParametrique.tsx` (2 champs de texte libre x(t)/y(t), n'importe quel point de la
 * droite + vecteur colinéaire accepté, voir `diagnostiquerParametriqueLecture`). Ceci devient ici UNE
 * seule question par instance, dont la consigne dépend de la variante (`consigneLecture`, réutilisée
 * telle quelle depuis `ui/formatLectureGraphiqueDroite.ts` — jamais reformulée ici).
 *
 * **Graphique papier NÉCESSAIRE** : l'exercice EST une lecture graphique — la droite tracée sur le
 * quadrillage est la SEULE donnée de l'énoncé (aucune donnée textuelle, contrairement à
 * `equationDroite`), impossible à remplacer par du texte sans vider l'exercice de son sens.
 * `construireSvgLectureGraphiqueDroite` ci-dessous réécrit son propre petit moteur de tracé `<svg>`
 * (même précédent que `constructionVectorielle`/`triangleQuelconque` — chacun le sien), mais
 * RÉUTILISE la géométrie pure déjà partagée par l'écran interactif plutôt que de la dupliquer :
 * `ui/lectureGraphiqueDroiteGraph.ts::viewBoxLectureGraphiqueDroite`/`pointsEntiersVisibles` (même
 * viewBox et mêmes points à coordonnées entières que `LectureGraphiqueDroiteGraph.tsx`, dérivés du
 * SEUL `point`/`vecteur` de l'instance) et `ui/mafsTransformation.ts::calculerPasGrille` (même pas de
 * grille "nombre rond" que `GrilleAdaptative`). Seuls le découpage de la droite (infinie) aux bords
 * du viewBox (`decouperDroiteDansViewBox`, absent à l'écran — Mafs `Line.PointAngle` le fait déjà en
 * interne, jamais exposé comme géométrie pure réutilisable) et la projection réel→pixel/le tracé
 * `<svg>` proprement dit sont écrits ici.
 *
 * **PAS `regroupable`** — 2 des 3 conditions de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) sont violées, chacune déjà suffisante à elle seule : (1)
 * `enteteHtml` (le graphique) est utilisé, ce qui disqualifie `regroupable` quelle que soit la
 * consigne ; (2) la consigne dépend en outre de la variante (`consigneLecture` : cartésienne vs
 * paramétrique), jamais une seule et même constante `CONSIGNE_GENERALE` — même si elle est par
 * ailleurs indépendante des VALEURS tirées au sein d'une variante donnée.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues de l'instance tirée (`exercice.point`,
 * `exercice.vecteur`, `exercice.referenceImplicite` — jamais recalculées indépendamment ici) : la
 * méthode de lecture est reconstituée en repérant deux points à coordonnées entières EFFECTIVEMENT
 * visibles sur le graphe imprimé (`pointsEntiersVisibles(exercice)[1]`/`[2]`, qui valent exactement
 * `exercice.point` et `exercice.point + exercice.vecteur` — voir `lectureGraphiqueDroiteGraph.ts`,
 * `K_MIN=-1`), jamais un couple de points arbitraire recalculé ailleurs. `EtapeLecture*.tsx` n'a pas
 * de texte d'aide progressif à concaténer (`texteAideNiveau1` reste un rappel de méthode générique,
 * jamais une valeur réelle de l'exercice) : la correction explicite donc directement la méthode
 * (repérer deux points entiers → vecteur directeur par différence → équation), puis la réponse finale
 * via `formatReponseAttendueLatex` (`ui/formatLectureGraphiqueDroite.ts`, LA MÊME fonction que la
 * révélation de réponse déjà utilisée côté écran après échec — jamais une resynthèse indépendante de
 * la forme finale), en rappelant que toute forme/tout point/vecteur équivalent reste accepté (même
 * tolérance que `verificationLectureGraphiqueDroite.ts`).
 *
 * Aucune zone de réponse vierge (`reponse` omis sur l'unique question, comportement par défaut —
 * sans effet sur le pipeline HTML évaluation, qui n'affiche jamais de zone de réponse, voir le
 * commentaire de tête de `corpsQuestionHtml`, `export/assemblerEvaluationHtml.ts`) : l'élève répond
 * sur une feuille à part.
 */

function construireEnonceLectureGraphiqueDroite(exercice: ExerciceLectureGraphiqueDroite): SectionExercice {
  return {
    enteteFragments: [texte(consigneGeneraleLecture(exercice))],
    enteteHtml: construireSvgLectureGraphiqueDroite(exercice),
    questions: [{ consigne: [texte(consigneLecture(exercice))] }],
  };
}

function construireCorrectionLectureGraphiqueDroite(exercice: ExerciceLectureGraphiqueDroite): BlocCorrection[] {
  const points = pointsEntiersVisibles(exercice);
  // Index 1/2 valent exactement `exercice.point`/`exercice.point + exercice.vecteur` (voir le
  // commentaire de tête — `K_MIN=-1` dans `lectureGraphiqueDroiteGraph.ts`), jamais un couple
  // recalculé indépendamment.
  const [pointA, pointB] = [points[1], points[2]];

  const blocs: BlocCorrection[] = [
    {
      type: "paragraphe",
      fragments: [
        texte("On repère deux points à coordonnées entières sur la droite, par exemple "),
        latex(formatPointLatex(pointA)),
        texte(" et "),
        latex(formatPointLatex(pointB)),
        texte(", puis on calcule un vecteur directeur par différence des coordonnées : "),
        latex(`\\vec{u}${formatVecteurLatex(exercice.vecteur)}`),
        texte("."),
      ],
    },
  ];

  if (exercice.variante === "cartesienne") {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte("Équation cartésienne (toute forme équivalente — implicite ou explicite en "),
        latex("x"),
        texte(" ou en "),
        latex("y"),
        texte(" — est acceptée) : "),
        latex(formatReponseAttendueLatex(exercice)),
        texte("."),
      ],
    });
  } else {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte("En prenant "),
        latex(formatPointLatex(exercice.point)),
        texte(" comme point de référence, les équations paramétriques sont (tout point de la droite associé à un vecteur colinéaire est également accepté) : "),
        latex(formatReponseAttendueLatex(exercice)),
        texte("."),
      ],
    });
  }

  return blocs;
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Un seul écran : l'énoncé papier est le graphique (figure de l'énoncé, gardée) et la consigne. Le
// corrigé montre la lecture de deux points (même figure, points A et B étiquetés), le vecteur
// directeur puis l'équation — valeurs issues de l'instance et des mêmes formateurs que l'écran.

function enoncePapier(exercice: ExerciceLectureGraphiqueDroite): EnoncePapier {
  const consigne =
    exercice.variante === "cartesienne"
      ? "Détermine une équation cartésienne de la droite représentée ci-dessous (sous la forme de ton choix)."
      : "Détermine des équations paramétriques de la droite représentée ci-dessous.";
  return { section: { enteteFragments: [texte(consigne)], enteteHtml: construireSvgLectureGraphiqueDroite(exercice), questions: [] } };
}

function reponseBreve(exercice: ExerciceLectureGraphiqueDroite): FragmentConsigne[] {
  return [latex(formatReponseAttendueLatex(exercice))];
}

function bareme(exercice: ExerciceLectureGraphiqueDroite): BaremeExercice {
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Deux points de la droite lus correctement")], points: 1 },
      { sousQuestion: "a", critere: [texte("Vecteur directeur : "), latex(`\\vec{u}${formatVecteurLatex(exercice.vecteur)}`), texte(" (ou un multiple non nul)")], points: 1 },
      { sousQuestion: "a", critere: [texte(exercice.variante === "cartesienne" ? "Point et vecteur remplacés dans l'équation cartésienne" : "Point et vecteur remplacés dans les équations paramétriques")], points: 1 },
      { sousQuestion: "a", critere: [texte("Équation finale : "), latex(formatReponseAttendueLatex(exercice))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Coordonnées d'un point lues à l'envers (ordonnée avant abscisse)")], cout: "−1" },
      { description: [texte("Vecteur directeur de signe faux (soustraction dans le désordre)")], cout: "−1" },
    ],
    reponsesAcceptees: [
      exercice.variante === "cartesienne"
        ? [texte("Toute équation équivalente, implicite ou explicite (multiple non nul)")]
        : [texte("Tout autre point de la droite et tout vecteur directeur colinéaire")],
    ],
  };
}

/** Niveau : un seul écran (deux points lus, vecteur directeur, équation) ; méthode imposée, aucun
 * piège dans les données (une droite parallèle à un axe se voit sur le graphique). */
function criteresDifficulte(exercice: ExerciceLectureGraphiqueDroite): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeLectureGraphiqueDroite(exercice)), methode: 0, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationLectureGraphiqueDroite: AdaptateurFeuilleExercices<ExerciceLectureGraphiqueDroite> = {
  titreDocument: "Lecture graphique — équation d'une droite — Évaluation",
  nomFichierBase: "lecture-graphique-droite",
  genererInstance: genererExerciceLectureGraphiqueDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceLectureGraphiqueDroite,
  construireCorrection: construireCorrectionLectureGraphiqueDroite,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLectureGraphiqueDroite,
  bareme,
  enoncePapier,
  profilInstance: profilLectureGraphiqueDroite,
  libelleCasParticulier: LIBELLE_CAS_PARALLELE_AXE,
  // PAS regroupable — `enteteHtml` (le graphique) utilisé ET consigne dépendante de la variante
  // (cartésienne/paramétrique) : 2 raisons indépendantes déjà suffisantes chacune, voir le
  // commentaire de tête.
};
