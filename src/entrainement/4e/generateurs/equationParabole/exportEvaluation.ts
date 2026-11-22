import type { ExerciceEquationParabole } from "../../core/equationParabole.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { construireSvgParabole } from "./figure";
import { correctionDetailleeEquationParabole } from "./corrigeDetaille";
import { CONSIGNE_EQUATION, CONSIGNE_SOMMET_FOYER, formatAideEquationNiveau2Latex, formatEquationAttendueLatex, formatFoyerLatex, formatSommetLatex } from "../../ui/formatEquationParabole";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParabole } from "./index";
import { PARAMETRES_SOMMET_PARABOLE, profilEquationParabole } from "../profilsEvaluation4eCh7Coniques";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationParabole>` pour **gen51** (Équation d'une
 * parabole depuis un graphe, `AppEquationParabole.tsx`) — voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence.
 *
 * Chapitre Math-Belgium "Géométrie analytique plane" (4e), section "Équation de la parabole (forme
 * graphique)" (`parabole`) : cette section est servie par TROIS générateurs, gen51 (ce fichier),
 * gen52 (`equationParaboleDeveloppee`) et gen53 (`constructionParabole`), chacun porté séparément —
 * ce fichier ne couvre que gen51.
 *
 * **2 variantes MÉLANGÉES** (`CATALOGUE_VARIANTES`, `"vertical"`/`"horizontal"` — voir
 * `core/equationParabole.types.ts`) : axe vertical, directrice horizontale, `(x-x_S)^2=2p(y-y_S)` ;
 * axe horizontal, directrice verticale, `(y-y_S)^2=2p(x-x_S)`. Jamais 4 variantes séparées pour les
 * 4 sens d'ouverture (haut/bas/gauche/droite) : le sens d'ouverture est encodé par le SIGNE de `p`
 * à l'intérieur de chacune des 2 orientations, jamais par une variante distincte (voir le
 * commentaire de tête de `generateurs/equationParabole/index.ts`).
 *
 * **Écran → questions** : `AppEquationParabole.tsx`/`moteur/sessionEquationParabole.ts` enchaînent 2
 * phases FIXES, toujours dans le même ordre, sur LE MÊME graphe — `"sommetFoyer"`
 * (`EtapeSommetFoyerEquationParabole.tsx` : lire S et F sur le graphe, 4 champs numériques) →
 * `"equation"` (`EtapeEquationEquationParabole.tsx` : écrire l'équation de la parabole, texte
 * libre). Reproduit ici par UNE figure (`enteteHtml`, affichée une seule fois en tête, même
 * principe que `comparaisonVecteurs/exportEvaluation.ts`/`caracteristiquesFonction/exportEvaluation.ts`)
 * suivie de 2 questions a)/b) dans le même ordre, jamais recombinées : a) reprend `CONSIGNE_SOMMET_FOYER`
 * (`ui/formatEquationParabole.ts`, déjà la consigne exacte affichée à l'écran), b) reprend
 * `CONSIGNE_EQUATION` (même source) — aucune reformulation locale.
 *
 * **Graphique papier NÉCESSAIRE — GÉNÉRATEUR GRAPHIQUE** : l'exercice EST la lecture d'un graphe
 * (`EquationParaboleGraph.tsx`, Mafs) : sans le tracé de la parabole, sa directrice et son foyer
 * marqué, aucune des 2 questions n'a de sens (l'élève DOIT lire S et F sur la figure, jamais des
 * valeurs numériques déjà données en texte). `construireSvgParabole` (ce fichier) est un second
 * moteur de tracé SVG statique, écrit ici plutôt que réutilisé tel quel : `export/svgGraph.ts::
 * construireSvgFonction` ne trace qu'une courbe `y=f(x)` (`Plot.OfX`), incapable de représenter la
 * variante `"horizontal"` de ce générateur (`x=f(y)`, `Plot.OfY` côté écran — une parabole couchée
 * n'est mathématiquement PAS une fonction de x). `construireSvgParabole` échantillonne donc soit en
 * x (vertical) soit en y (horizontal) selon `exercice.variante`, exactement comme
 * `EquationParaboleGraph.tsx` choisit entre `Plot.OfX`/`Plot.OfY`. Réutilise en revanche telle
 * quelle toute la géométrie déjà pure et partagée de `ui/equationParaboleGraph.ts`
 * (`viewBoxEquationParabole`/`directriceEquationParabole`, la MÊME source que l'écran interactif —
 * jamais un cadrage recalculé indépendamment) et `formatNombreGraphique` (`export/svgGraph.ts`,
 * déjà le formateur numérique générique des graphiques imprimés). Seule la rastérisation en
 * primitives `<svg>` (grille "nombre rond" + axes gradués — contrairement à
 * `comparaisonVecteurs/exportEvaluation.ts`, qui masque axes/graduations parce que seules
 * longueur/direction/sens comptent, ICI l'élève doit au contraire pouvoir LIRE des coordonnées
 * entières exactes sur le quadrillage, donc les 2 axes ET leurs graduations numériques restent
 * affichés, même choix que `export/svgGraph.ts::construireSvgFonction`) est écrite ici, jamais dans
 * `ui/`. Couleurs et conventions de tracé dupliquées à l'identique de `EquationParaboleGraph.tsx`
 * (jamais réimportées, ce composant est un `.tsx` hors du périmètre `ui/`/`moteur/`/`generateurs/xxx/index.ts`
 * des adaptateurs `exportEvaluation.ts`, même règle que documentée par
 * `comparaisonVecteurs/exportEvaluation.ts`) : courbe et sommet en bleu (`#1971c2`), foyer (croix
 * ×) ET directrice dans la MÊME couleur orange (`#f08c00`) — le sommet S n'est PAS marqué sur la
 * figure de l'énoncé (donnée à trouver visuellement, "le point le plus resserré de la courbe",
 * exactement l'état par défaut `afficherSommet=false` de l'écran interactif), mais IL L'EST sur la
 * figure de correction (`avecCorrection=true` — mêmes state que l'aide de niveau 2 à l'écran),
 * accompagnée des étiquettes texte "S(...)"/"F(...)" — un repère visuel direct, jamais seulement
 * textuel, pour un exercice dont la question EST visuelle (même principe que
 * `comparaisonVecteurs/exportEvaluation.ts`/`boiteMoustaches/exportEvaluation.ts::avecEtiquettes` :
 * réimprimer le graphique en tête de correction, sommet/foyer mis en évidence, plutôt que décrire la
 * réponse en texte seul).
 *
 * **PAS `regroupable`**, pour 2 raisons indépendantes, chacune déjà suffisante à elle seule (voir la
 * doc de `AdaptateurFeuilleExercices.regroupable`, `genererFeuilleExercices.ts`) : (1) 2 questions
 * par instance, jamais 1 seule (peu importe que `CONSIGNE_SOMMET_FOYER`/`CONSIGNE_EQUATION` soient
 * chacune, prises isolément, des consignes GÉNÉRIQUES indépendantes de l'instance — la condition (1)
 * du mécanisme, "toujours UNE seule question par instance", n'est de toute façon pas remplie) ; (2)
 * `construireEnonceEquationParabole` utilise `enteteHtml` (le graphe), condition à elle seule déjà
 * exclusive quel que soit le nombre de questions.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et garanties correctes de l'instance
 * tirée (`sommet`/`foyer`/`p`, tous entiers par construction — voir `generateurs/equationParabole/index.ts`),
 * jamais recalculée indépendamment. Réutilise directement `formatSommetLatex`/`formatFoyerLatex`/
 * `formatEquationAttendueLatex` (`ui/formatEquationParabole.ts`) — les MÊMES formateurs déjà
 * utilisés côté écran par `ResultatPanelEquationParabole.tsx` pour annoncer "Sommet attendu :
 * .../Foyer attendu : ..." et l'équation de référence — jamais une formule reconstruite localement.
 * `p` n'a pas de texte d'aide à concaténer à proprement parler (`TEXTE_AIDE_SOMMET_FOYER_NIVEAU1`/
 * `TEXTE_AIDE_SOMMET_FOYER_NIVEAU2`/`segmentsAideEquationNiveau1` sont purement méthodologiques,
 * jamais une révélation de valeur, hormis `formatAideEquationNiveau2Latex` qui révèle juste `p`) : la
 * correction ci-dessous est donc un texte de résolution nouveau (lecture de S/F, puis calcul de `p`,
 * puis substitution dans la forme générale), jamais une transcription d'aide.
 *
 * **Feuille d'exercices / évaluation (refonte papier)** : l'énoncé papier est le graphique (F et d
 * nommés, sans coordonnées) et la consigne globale « détermine l'équation » ; les 2 écrans
 * deviennent les étapes 1 et 2 du corrigé détaillé, avec le graphique annoté (S, F). Aucune place de
 * réponse. Tirage équilibré : `profilsEvaluation4eCh7Coniques.ts` (sommet sur un axe au choix).
 */

// --- Rendu SVG imprimé du graphe (voir le commentaire de tête ci-dessus) ---

function construireEnonceEquationParabole(instance: ExerciceEquationParabole): SectionExercice {
  return {
    enteteHtml: construireSvgParabole(instance, false),
    questions: [{ consigne: [texte(CONSIGNE_SOMMET_FOYER)] }, { consigne: [texte(CONSIGNE_EQUATION)] }],
  };
}

/** Forme réduite du cours, selon l'axe : jamais nommée en clair dans l'énoncé (lire l'axe sur le
 * graphe fait partie de l'exercice) — les deux formes sont rappelées. */
const FORMES_REDUITES = "(x-x_S)^2=2p(y-y_S) \\text{ ou } (y-y_S)^2=2p(x-x_S)";

/** Énoncé papier : le graphique (parabole, foyer F, directrice d) et la consigne globale — les 2
 * écrans deviennent les étapes du corrigé. */
function enoncePapierEquationParabole(instance: ExerciceEquationParabole): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Le graphique ci-dessous représente une parabole, son foyer F et sa directrice d. Détermine l'équation de cette parabole sous la forme réduite "),
        latex(FORMES_REDUITES),
        texte(" (selon son axe)."),
      ],
      enteteHtml: construireSvgParabole(instance, false),
      questions: [],
    },
  };
}

function construireCorrectionEquationParabole(instance: ExerciceEquationParabole): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgParabole(instance, true) },
    { type: "paragraphe", fragments: [texte("Sommet "), latex(`S${formatSommetLatex(instance.sommet)}`), texte(", foyer "), latex(`F${formatFoyerLatex(instance.foyer)}`), texte(".")] },
    { type: "paragraphe", fragments: [latex(formatAideEquationNiveau2Latex(instance)), texte(", donc "), latex(formatEquationAttendueLatex(instance)), texte(".")] },
  ];
}

function reponseBreveEquationParabole(instance: ExerciceEquationParabole): FragmentConsigne[] {
  return [latex(formatEquationAttendueLatex(instance))];
}

/** Niveau (« Noter un nouveau chapitre ») : l'écran « sommet et foyer » est une lecture (S au
 * milieu de F et de d), l'équation se calcule ; méthode imposée (forme réduite donnée) ; piège dans
 * les données : p négatif (parabole ouverte vers le bas ou la gauche, visible sur la figure). */
function criteresDifficulte(instance: ExerciceEquationParabole): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeEquationParabole(instance), ["a"]), methode: 0, piege: instance.p < 0 ? 1 : 0, nombres: 0 };
}

function baremeEquationParabole(instance: ExerciceEquationParabole): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Coefficient "), latex("p"), texte(" écrit à la place de "), latex("2p")], cout: "−1" },
    { description: [texte("Forme de l'autre axe utilisée (carré sur la mauvaise variable)")], cout: "−1,5" },
  ];
  if (instance.p < 0) erreurs.push({ description: [texte("Signe de p oublié (parabole ouverte vers " + (instance.variante === "vertical" ? "le bas" : "la gauche") + ")")], cout: "−1" });
  return {
    reponseFinale: [latex(formatEquationAttendueLatex(instance))],
    criteres: [
      { sousQuestion: "a", critere: [texte("Foyer "), latex(`F${formatFoyerLatex(instance.foyer)}`), texte(" et sommet "), latex(`S${formatSommetLatex(instance.sommet)}`), texte(" lus")], points: 1 },
      { sousQuestion: "b", critere: [texte("Paramètre "), latex(`p = ${instance.p}`), texte(" (signe compris)")], points: 1 },
      { sousQuestion: "b", critere: [texte("Équation correcte, forme de l'axe " + (instance.variante === "vertical" ? "vertical" : "horizontal"))], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute équation équivalente sous forme réduite (par exemple coefficient "), latex("2p"), texte(" écrit comme un produit)")]],
  };
}

export const adaptateurEvaluationEquationParabole: AdaptateurFeuilleExercices<ExerciceEquationParabole> = {
  titreDocument: "Équation d'une parabole depuis un graphe — Évaluation",
  nomFichierBase: "equation-parabole",
  genererInstance: genererExerciceEquationParabole,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationParabole,
  construireCorrection: construireCorrectionEquationParabole,
  reponseBreve: reponseBreveEquationParabole,
  correctionDetaillee: correctionDetailleeEquationParabole,
  criteresDifficulte,
  bareme: baremeEquationParabole,
  enoncePapier: enoncePapierEquationParabole,
  profilInstance: profilEquationParabole,
  parametresAuChoix: PARAMETRES_SOMMET_PARABOLE,
  // PAS regroupable : 2 étapes par instance ET un enteteHtml (le graphique).
};
