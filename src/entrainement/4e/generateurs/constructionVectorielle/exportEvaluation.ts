import type { ExerciceConstructionVectorielle } from "../../core/constructionVectorielle.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { nombreFrLatex } from "../../ui/nombreFr";
import { LIBELLE_CAS_CONSTRUCTION, profilConstructionVectorielle } from "../profilsEvaluation4eCh6";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { CONSIGNE_CONSTRUCTION_PAPIER, consigneConstructionVectorielle, formatTermesDonneesConnuesConstructionLatex } from "../../ui/formatConstructionVectorielle";
import { genererExerciceConstructionVectorielle } from "./index";
import { correctionDetailleeConstructionVectorielle } from "./corrigeDetaille";
import { construireSvgConstructionVectorielle, formatCoefficientTexte } from "./figure";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceConstructionVectorielle>` pour gen23
 * ("Construction graphique de vecteurs sur grille", `AppConstructionVectorielle.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Chapitre Math-Belgium "Calcul vectoriel" (4e), section "Multiplier un vecteur par un réel :
 * colinéarité et alignement (construction graphique)" (`multiplicationGeometrique`,
 * `src/content/chapters/4e/calcul-vectoriel.ts` côté Math-Belgium).
 *
 * **PAS de `CATALOGUE_VARIANTES`** : `generateurs/constructionVectorielle/index.ts` n'exporte qu'un
 * seul `genererExerciceConstructionVectorielle` sans notion de variante/famille forçable (tirage
 * uniforme d'un coefficient parmi {-3,-2,-1,1,2,3} et de 2 points A,B distincts sur [-4;4]²,
 * confirmé en lisant ce fichier). `catalogueVariantes`/`genererInstanceAvecVariante` sont donc
 * omis ici, même contrat "zéro-argument" que `formeCanoniqueTransformations/exportEvaluation.ts`/
 * `transformationsGraphiques/exportEvaluation.ts` (les 2 seuls autres adaptateurs déjà portés sans
 * catalogue).
 *
 * **Écran → question** : `EtapeConstructionVectorielle.tsx` n'a qu'UN seul écran (pas de `Phase`,
 * un seul essai à 2 points déplaçables départ/arrivée, `moteur/sessionConstructionVectorielle.ts`)
 * — ceci devient ici UNE seule question par instance. L'écran affiche A, B et \vec{AB} connus (bloc
 * `.equation-box-termes` + `VecteurGraph`), une consigne ("Trace k·\vec{AB} à partir du point de ton
 * choix sur la grille.") puis une grille interactive vierge sur laquelle l'élève fait glisser 2
 * points (départ/arrivée) — AUCUN point d'ancrage n'est imposé, seule la comparaison
 * `(arrivée-départ)` à `cibleComposantes` compte (`verificationConstructionVectorielle.ts`).
 *
 * **Représentation papier** : contrairement à `pointVectoriel/exportEvaluation.ts` (délibérément
 * SANS `enteteHtml`, cet exercice-là se résout par un calcul de coordonnées, le graphe n'y est que
 * redondant avec le texte), CET exercice est intrinsèquement graphique — l'élève doit ICI tracer un
 * vecteur, la grille n'est pas optionnelle. `construireSvgConstructionVectorielle` ci-dessous écrit
 * donc son propre petit moteur de tracé `<svg>` (même précédent que `boiteMoustaches`/`triangleLies`
 * — chacun le sien, aucun moteur générique point/vecteur partagé dans `export/`), mais RÉUTILISE la
 * géométrie pure déjà partagée par l'écran interactif plutôt que de la dupliquer :
 * `ui/vecteurGraph.ts::calculerViewBoxVecteurs` (même calcul de viewBox — marge fixe + ratio
 * `RATIO_GRAPHE` — que `VecteurGraph.tsx`) et `ui/mafsTransformation.ts::calculerPasGrille` (même
 * pas de grille "nombre rond" que `GrilleAdaptative`). Seule la projection réel→pixel et le tracé
 * SVG proprement dit (grille, axes, flèches) sont écrits ici, `VecteurGraph.tsx`/Mafs n'étant pas
 * instanciables hors d'un arbre React monté (même raison que `triangleLies`, voir son commentaire de
 * tête).
 *
 * Énoncé : grille + A, B + \vec{AB} tracé (bleu, même couleur que `VecteurGraph.tsx::COULEUR_VECTEUR_DEFAUT`
 * = `#1971c2`), pas de tracé élève évidemment. Correction : LA MÊME grille (même viewBox, pour rester
 * directement comparable à l'énoncé déjà imprimé — même convention que `triangleLies`/`boiteMoustaches`,
 * un seul rendu du graphique par exercice) + \vec{AB} redessiné + le vecteur cible
 * `coefficient·\vec{AB}` tracé en orange (`#e8590c`, même couleur que le tracé élève à l'écran,
 * `EtapeConstructionVectorielle.tsx`). Ce vecteur cible est délibérément dessiné depuis un point
 * d'ancrage DISTINCT de A (`ancrageCorrection` ci-dessous, décalé perpendiculairement à \vec{AB} d'une
 * distance fixe puis arrondi à la grille) plutôt que depuis A lui-même : avec coefficient=1 (une
 * valeur tirée possible, voir `index.ts::COEFFICIENTS`), un tracé depuis A serait rigoureusement
 * identique à \vec{AB} déjà affiché — invisible en superposition. Le texte qui accompagne le graphique
 * rappelle explicitement qu'AUCUN ancrage n'est imposé (seuls la direction/le sens et la longueur
 * comptent, exactement ce que vérifie `verifierConstruction`), cet ancrage précis n'étant qu'UN
 * exemple parmi une infinité de tracés valides.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance tirée
 * (`exercice.cibleComposantes`, déjà calculée à la génération — `coefficient * (pointB - pointA)`,
 * jamais recalculée indépendamment ici) : `EtapeConstructionVectorielle.tsx` n'a pas de texte d'aide
 * progressif à concaténer (aucun `niveauAide`), donc rien à réutiliser tel quel — le texte de
 * correction explicite directement la règle géométrique (même direction que \vec{AB} si
 * coefficient>0, direction opposée si coefficient<0 ; longueur multipliée par |coefficient|), plus
 * la vérification analytique (composantes) en rappel.
 *
 * **PAS `regroupable`** — les 3 conditions de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) sont TOUTES violées : (1) la consigne
 * (`consigneConstructionVectorielle`) interpole le coefficient tiré directement dans son fragment
 * LaTeX (`coefTexte\vec{AB}`) — jamais générique/indépendante de l'instance ; (2) `enteteHtml`
 * (le graphique) est utilisé, ce qui disqualifie `regroupable` à lui seul, quelle que soit la
 * consigne (voir la doc du champ).
 *
 * Pas de zone de réponse vierge (`reponse` omis sur l'unique question, comportement par défaut de
 * `construireZoneReponse`/`zoneReponseHtml` : 1 ligne en docx, mais SANS AUCUN EFFET sur le pipeline
 * HTML évaluation, qui n'affiche jamais de zone de réponse — voir le commentaire de tête de
 * `corpsQuestionHtml`, `export/assemblerEvaluationHtml.ts`) : la réponse attendue est un TRACÉ sur la
 * grille déjà imprimée dans l'énoncé, jamais une ligne de texte à remplir en dessous — même raison
 * que `boiteMoustaches`/`triangleLies`, qui laissent également `reponse` implicite pour leurs
 * questions à tracé.
 */

function construireEnonceConstructionVectorielle(exercice: ExerciceConstructionVectorielle): SectionExercice {
  const consigne = consigneConstructionVectorielle(exercice);

  return {
    enteteFragments: [texte("Données : "), latex(formatTermesDonneesConnuesConstructionLatex(exercice).join(" \\quad "))],
    enteteHtml: construireSvgConstructionVectorielle(exercice, false),
    questions: [{ consigne: [texte(consigne.avant), latex(consigne.latex), texte(consigne.apres)] }],
  };
}

function construireCorrectionConstructionVectorielle(exercice: ExerciceConstructionVectorielle): BlocCorrection[] {
  const { coefficient, cibleComposantes } = exercice;
  const coefTexte = formatCoefficientTexte(coefficient);
  const sens = coefficient > 0 ? "le même sens" : "le sens opposé";
  const longueur = Math.abs(coefficient) === 1 ? "la même longueur" : `une longueur ${Math.abs(coefficient)} fois plus grande`;

  return [
    { type: "html", html: construireSvgConstructionVectorielle(exercice, true) },
    {
      type: "paragraphe",
      fragments: [
        texte("Construction (en orange ci-dessus, tracée ici depuis un point d'ancrage choisi arbitrairement — "),
        texte("n'importe quel autre point de départ est tout aussi correct, seuls comptent la direction, le sens et la longueur) : "),
        latex(`${coefTexte}\\vec{${exercice.labelA}${exercice.labelB}}`),
        texte(` a la même direction que `),
        latex(`\\vec{${exercice.labelA}${exercice.labelB}}`),
        texte(`, ${sens} (car le coefficient est ${coefficient > 0 ? "positif" : "négatif"}), et ${longueur}.`),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("Vérification par les composantes : "),
        latex(
          `${coefTexte}\\vec{${exercice.labelA}${exercice.labelB}} = ${coefTexte}\\begin{pmatrix} ${formatNombreGraphique(exercice.pointB.x - exercice.pointA.x).replace(",", "{,}")} \\\\ ${formatNombreGraphique(exercice.pointB.y - exercice.pointA.y).replace(",", "{,}")} \\end{pmatrix} = \\begin{pmatrix} ${formatNombreGraphique(cibleComposantes.x).replace(",", "{,}")} \\\\ ${formatNombreGraphique(cibleComposantes.y).replace(",", "{,}")} \\end{pmatrix}`,
        ),
        texte("."),
      ],
    },
  ];
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Un seul écran. L'énoncé papier garde les points A et B sur leur grille (donnée de l'exercice,
// sans le vecteur demandé) et la consigne ; la construction attendue est une FIGURE : elle va dans
// le corrigé (`figureHtml`), jamais dans l'énoncé. Le vecteur demandé est libre (aucune origine
// imposée) : la figure du corrigé le trace depuis un point d'ancrage quelconque et le dit.

function vecteurDemandeLatex(exercice: ExerciceConstructionVectorielle): string {
  return `${formatCoefficientTexte(exercice.coefficient)}\\vec{${exercice.labelA}${exercice.labelB}}`;
}

function colonne(v: { x: number; y: number }): string {
  return `\\begin{pmatrix} ${nombreFrLatex(v.x)} \\\\ ${nombreFrLatex(v.y)} \\end{pmatrix}`;
}

function enoncePapier(exercice: ExerciceConstructionVectorielle): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("On donne les points "),
        latex(formatTermesDonneesConnuesConstructionLatex(exercice).join(" \\quad ")),
        texte(" ci-dessous. Construis le vecteur "),
        latex(vecteurDemandeLatex(exercice)),
        texte(` à partir du point de ton choix. ${CONSIGNE_CONSTRUCTION_PAPIER}`),
      ],
      enteteHtml: construireSvgConstructionVectorielle(exercice, false),
      questions: [],
    },
  };
}

function reponseBreve(exercice: ExerciceConstructionVectorielle): FragmentConsigne[] {
  return [latex(`${vecteurDemandeLatex(exercice)} = ${colonne(exercice.cibleComposantes)}`), texte(" (tracé depuis n'importe quel point)")];
}

function bareme(exercice: ExerciceConstructionVectorielle): BaremeExercice {
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Composantes du vecteur à tracer : "), latex(colonne(exercice.cibleComposantes))], points: 1 },
      { sousQuestion: "a", critere: [texte("Direction (parallèle à "), latex(`\\vec{${exercice.labelA}${exercice.labelB}}`), texte(")")], points: 1 },
      { sousQuestion: "a", critere: [texte(`Sens (${exercice.coefficient > 0 ? "même sens" : "sens opposé"})`)], points: 1 },
      { sousQuestion: "a", critere: [texte("Longueur et flèche correctes")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Sens non inversé pour un coefficient négatif")], cout: "−1" },
      { description: [texte("Longueur non multipliée (le vecteur donné recopié tel quel)")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte("Tracé correct depuis n'importe quel point de départ")]],
  };
}

/** Niveau : un écran ; méthode imposée (0) ; piège dans les données : coefficient négatif (sens inversé). */
function criteresDifficulte(exercice: ExerciceConstructionVectorielle): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeConstructionVectorielle(exercice)), methode: 0, piege: exercice.coefficient < 0 ? 1 : 0, nombres: 0 };
}

export const adaptateurEvaluationConstructionVectorielle: AdaptateurFeuilleExercices<ExerciceConstructionVectorielle> = {
  titreDocument: "Construction graphique de vecteurs — Évaluation",
  nomFichierBase: "construction-vectorielle",
  genererInstance: genererExerciceConstructionVectorielle,
  construireEnonce: construireEnonceConstructionVectorielle,
  construireCorrection: construireCorrectionConstructionVectorielle,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeConstructionVectorielle,
  bareme,
  enoncePapier,
  profilInstance: profilConstructionVectorielle,
  libelleCasParticulier: LIBELLE_CAS_CONSTRUCTION,
  // PAS regroupable — consigne dépendante du coefficient tiré (jamais générique) ET `enteteHtml`
  // (le graphique) utilisé, qui disqualifie `regroupable` à lui seul : voir le commentaire de tête.
};
