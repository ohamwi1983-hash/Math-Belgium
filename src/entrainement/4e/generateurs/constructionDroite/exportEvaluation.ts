import type { ExerciceConstructionDroite } from "../../core/constructionDroite.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatPointLatex } from "../../ui/formatEquationDroite";
import { consignePoints, formatEnonceLatex, texteAidePointsNiveau1 } from "../../ui/formatConstructionDroite";
import { construireSvgConstructionDroite, secondPoint } from "./figure";
import { correctionDetailleeConstructionDroite } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConstructionDroite } from "./index";
import { LIBELLE_CAS_PARALLELE_AXE, profilConstructionDroite } from "../profilsEvaluation4eCh7Droites";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceConstructionDroite>` pour gen44 ("Construction
 * graphique — tracer une droite depuis son équation", `AppConstructionDroite.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/constructionVectorielle/exportEvaluation.ts` pour l'analogue le plus proche déjà
 * porté (même famille de problème : un graphique vierge imprimé, l'élève y trace quelque chose —
 * ici une droite entière plutôt qu'un vecteur borné entre 2 points).
 *
 * Chapitre Math-Belgium "Géométrie analytique plane" (4e), section "Lire et tracer une droite"
 * (`lire-tracer`, `src/content/chapters/4e/geometrie-analytique-plane.ts`). **Cette section est
 * servie par DEUX générateurs** : gen44 (celui-ci, construction = tracer une droite donnée) ET
 * gen43 (`lectureGraphiqueDroite`, lecture = lire l'équation d'une droite déjà tracée), porté par
 * un autre agent en parallèle — seul `generateurs/constructionDroite/` est touché ici.
 *
 * **Écran → question** : `AppConstructionDroite.tsx` a 2 phases séquentielles
 * (`moteur/sessionConstructionDroite.ts`, `PhaseConstructionDroite`) — écran "points" (l'élève
 * donne 2 points entiers de la droite) PUIS écran "trace" (il place ces 2 points sur un graphe
 * interactif, `ConstructionDroiteGraph.tsx`, `MovablePoint` + `Line.ThroughPoints` en temps réel).
 * Cette séquence en 2 temps n'a de sens QUE parce que l'écran vérifie chaque étape indépendamment
 * (droite mal choisie détectée avant même le placement). Sur papier, il n'y a aucune vérification
 * intermédiaire possible : les 2 écrans se réduisent donc à UNE seule question — donner l'équation,
 * demander de tracer directement la droite sur un graphique vierge déjà imprimé — même simplification
 * que `constructionVectorielle/exportEvaluation.ts` (qui fusionne de la même façon son unique écran
 * en une seule question, cf. son commentaire de tête).
 *
 * **Représentation papier** : grille + axes vierges (aucune droite tracée — ce serait donner la
 * réponse) sous l'équation donnée (`construireEnonceConstructionDroite`), une droite ENTIÈRE
 * (prolongée jusqu'aux bords du graphique, pas un simple segment/vecteur borné — `clipLigneAuViewBox`
 * ci-dessous) tracée en bleu (même couleur que `ConstructionDroiteGraph.tsx::COULEUR_DROITE` =
 * `#1971c2`) en correction. Aucun moteur de tracé SVG générique n'existe dans `export/` pour ce cas
 * (grille + droite complète clippée à un rectangle) — même constat que `constructionVectorielle`
 * ("chacun le sien" — `boiteMoustaches`/`triangleLies`/`constructionVectorielle` ont chacun le leur) :
 * ce fichier écrit donc le sien, mais réutilise la géométrie pure déjà partagée par l'écran
 * interactif plutôt que de la dupliquer — `ui/vecteurGraph.ts::calculerViewBoxVecteurs` (même calcul
 * de viewBox — marge fixe + ratio `RATIO_GRAPHE` — que `viewBoxConstructionDroite`, qui l'appelle
 * aussi) et `ui/mafsTransformation.ts::calculerPasGrille` (même pas de grille "nombre rond" que
 * `GrilleAdaptative`). Le viewBox est calculé à partir de `exercice.point` et
 * `exercice.point + exercice.vecteur` — 2 points ENTIERS de la droite, garantis distincts et
 * toujours valides quelle que soit `variante` (voir `core/constructionDroite.types.ts`, champ
 * `point`/`vecteur` — jamais montrés numériquement à l'élève, mais utilisables ici comme n'importe
 * quelle autre valeur déjà connue et correcte de l'instance tirée). Le même viewBox sert à l'énoncé
 * ET à la correction (comme `constructionVectorielle`) : la grille imprimée dans l'énoncé doit déjà
 * montrer assez d'espace pour que l'élève puisse y tracer sa droite sans en sortir.
 *
 * **Deux points, pas un vecteur** : contrairement à `constructionVectorielle` (qui trace un segment
 * borné entre 2 points précis), une droite est en principe infinie — `clipLigneAuViewBox` calcule
 * donc l'intersection de la droite (point, vecteur directeur) avec le rectangle du viewBox
 * (algorithme de clipping paramétrique classique, borne `t` par les 4 côtés du rectangle) et trace
 * le segment résultant, qui occupe tout le graphique plutôt que de s'arrêter à A/B — geste bien plus
 * proche de ce qu'un élève trace réellement à la règle sur un graphique imprimé.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.point`, `exercice.vecteur` — jamais recalculées indépendamment) : `texteAidePointsNiveau1`
 * (`ui/formatConstructionDroite.ts`, déjà partagée avec l'écran 1) est RÉUTILISÉE telle quelle pour
 * la méthode ("substitue une valeur, calcule l'autre coordonnée, recommence") — seul le second point
 * d'exemple diffère : l'écran ne montre jamais qu'UN point d'exemple (`formatAidePointsNiveau2Latex`,
 * aide niveau 2 seulement), alors que la correction papier a besoin des 2 points explicitement pour
 * justifier le tracé — `exercice.point` et `exercice.point + exercice.vecteur` sont TOUJOURS deux
 * points distincts et valides de la droite quelle que soit `variante` (vérifié algébriquement pour
 * les 4 formes en lisant `generateurs/droite/geometrieDroite.ts` : chaque forme de sortie est
 * dérivée directement de ce couple point/vecteur, donc les deux lui appartiennent par construction).
 *
 * **PAS `regroupable`** — les 2 conditions disqualifiantes de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) sont TOUTES DEUX réunies : (1) la consigne
 * (`consigneTraceExport` ci-dessous) dépend de `variante` (texte différent pour "parametrique" vs les
 * 3 formes cartésiennes) — jamais générique/indépendante de l'instance ; (2) `enteteHtml` (le
 * graphique) est utilisé, ce qui disqualifie `regroupable` à lui seul, quelle que soit la consigne
 * (voir la doc du champ). Même décision que `constructionVectorielle/exportEvaluation.ts`.
 *
 * **Consigne propre à l'export, jamais celle de l'écran** : `consigneGeneraleTrace`
 * (`ui/formatConstructionDroite.ts`) suppose l'équation affichée SOUS la consigne ("... ci-dessous"),
 * cohérent avec l'ordre d'affichage de l'écran (consigne puis équation). Le pipeline HTML évaluation
 * affiche systématiquement `enteteFragments` (ici l'équation) AVANT `enteteHtml`/les questions
 * (`assemblerEvaluationHtml.ts::corpsQuestionHtml`) — l'ordre inverse. Réutiliser tel quel le texte de
 * l'écran produirait donc un contresens spatial ("ci-dessous" pointant vers un graphique, pas vers
 * l'équation déjà affichée au-dessus) ; `consigneTraceExport` ci-dessous est donc une variante de
 * formulation ADAPTÉE à cet ordre d'affichage inversé, pas une réécriture arbitraire.
 *
 * Pas de zone de réponse vierge (`reponse` omis sur l'unique question, comportement par défaut,
 * SANS AUCUN EFFET sur le pipeline HTML évaluation qui n'affiche jamais de zone de réponse — voir le
 * commentaire de tête de `corpsQuestionHtml`) : la réponse attendue est un TRACÉ sur la grille déjà
 * imprimée dans l'énoncé, jamais une ligne de texte à remplir en dessous — même raison que
 * `constructionVectorielle`/`boiteMoustaches`/`triangleLies`.
 */

/** Consigne de l'unique question — voir le commentaire de tête pour pourquoi ce n'est PAS
 * `consigneGeneraleTrace` (`ui/formatConstructionDroite.ts`), écrite pour l'ordre d'affichage inverse
 * de l'écran. Dépend de `variante` (paramétrique vs cartésienne) — disqualifie `regroupable`. */
/** Étapes du corrigé (une par écran) : jamais de repère vierge imprimé — l'élève trace sur sa
 * feuille (même décision que la boîte à moustaches à construire, `boiteMoustaches/exportEvaluation.ts`). */
const CONSIGNE_TRACE_PAPIER = "Place ces deux points dans un repère orthonormé, puis trace la droite qui les relie, prolongée de part et d'autre.";

function construireEnonceConstructionDroite(exercice: ExerciceConstructionDroite): SectionExercice {
  return {
    enteteFragments: [texte("Équation de la droite : "), latex(formatEnonceLatex(exercice))],
    questions: [{ consigne: [texte(consignePoints(exercice))] }, { consigne: [texte(CONSIGNE_TRACE_PAPIER)] }],
  };
}

function construireCorrectionConstructionDroite(exercice: ExerciceConstructionDroite): BlocCorrection[] {
  const { point, vecteur } = exercice;
  const pointB = secondPoint(point, vecteur);

  return [
    { type: "html", html: construireSvgConstructionDroite(exercice, true) },
    { type: "paragraphe", fragments: [texte(texteAidePointsNiveau1(exercice))] },
    {
      type: "paragraphe",
      fragments: [
        texte("Deux points de la droite ainsi obtenus : "),
        latex(`A${formatPointLatex(point)}`),
        texte(" et "),
        latex(`B${formatPointLatex(pointB)}`),
        texte(" — il suffit de les relier par une droite complète, prolongée jusqu'aux bords du graphique."),
      ],
    },
  ];
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les 2 écrans (deux points entiers, puis placement) sont les étapes d'APPRENTISSAGE : sur papier,
// l'énoncé donne l'équation et UNE consigne (tracer la droite sur sa feuille). Le corrigé montre
// les deux points trouvés (étape a) puis la droite attendue (étape b, figure `figureHtml`).

function enoncePapier(exercice: ExerciceConstructionDroite): EnoncePapier {
  const intro =
    exercice.variante === "parametrique"
      ? "Trace, dans un repère orthonormé sur ta feuille, la droite d dont des équations paramétriques sont :"
      : "Trace, dans un repère orthonormé sur ta feuille, la droite d d'équation :";
  return { section: { enteteFragments: [texte(intro), latex(formatEnonceLatex(exercice))], questions: [] } };
}

function reponseBreve(exercice: ExerciceConstructionDroite): FragmentConsigne[] {
  const pointB = secondPoint(exercice.point, exercice.vecteur);
  return [texte("Droite passant par "), latex(`A${formatPointLatex(exercice.point)}`), texte(" et "), latex(`B${formatPointLatex(pointB)}`), texte(" (tout autre couple de points de d convient).")];
}

function bareme(exercice: ExerciceConstructionDroite): BaremeExercice {
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Premier point de d correct (coordonnées vérifiant l'équation)")], points: 1 },
      { sousQuestion: "a", critere: [texte("Second point de d correct, distinct du premier")], points: 1 },
      { sousQuestion: "b", critere: [texte("Points placés correctement dans le repère")], points: 1 },
      { sousQuestion: "b", critere: [texte("Droite tracée à la règle et prolongée des deux côtés")], points: 1 },
    ],
    erreursFrequentes: [
      exercice.vecteur.x === 0 || exercice.vecteur.y === 0
        ? { description: [texte("Droite parallèle à l'autre axe (horizontale et verticale confondues)")], cout: "0 pt sur b)" }
        : { description: [texte("Point dont les coordonnées ne vérifient pas l'équation (erreur de calcul)")], cout: "−1 par point" },
      { description: [texte("Segment [AB] tracé au lieu de la droite entière")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Toute construction exacte de la même droite, quels que soient les deux points choisis")]],
  };
}

/** Niveau : écran a (deux points calculés depuis l'équation) qui transforme, écran b (placer les
 * points, tracer) de pure lecture ; méthode imposée, aucun piège dans les données. */
function criteresDifficulte(exercice: ExerciceConstructionDroite): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeConstructionDroite(exercice), ["b"]), methode: 0, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationConstructionDroite: AdaptateurFeuilleExercices<ExerciceConstructionDroite> = {
  titreDocument: "Construction graphique — tracer une droite — Évaluation",
  nomFichierBase: "construction-droite",
  genererInstance: genererExerciceConstructionDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceConstructionDroite,
  construireCorrection: construireCorrectionConstructionDroite,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: (e: ExerciceConstructionDroite) => correctionDetailleeConstructionDroite(e),
  bareme,
  enoncePapier,
  profilInstance: profilConstructionDroite,
  libelleCasParticulier: LIBELLE_CAS_PARALLELE_AXE,
  // PAS regroupable — consigne dépendante de `variante` (paramétrique vs cartésienne, jamais
  // générique) ET `enteteHtml` (le graphique) utilisé, qui disqualifie `regroupable` à lui seul :
  // voir le commentaire de tête.
};
