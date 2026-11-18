import type { ExerciceFonctionReference, FamilleReference } from "../../core/fonctionsReference.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { pointUnitaire } from "../../moteur/verificationFonctionsReference";
import { formatEquationFonctionReferenceLatex } from "../../ui/formatFonctionsReference";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { CATALOGUE_VARIANTES, construireAvecFamille, genererExerciceFonctionReference } from "./index";
import { BASE_LATEX, FAMILLES_IMPAIRES, FAMILLES_PAIRES, correctionDetailleeFonctionsReference as correctionDetailleeFonctionsReferenceTableau, equationLatex } from "./corrigeDetaille";
import { profilFonctionReference, PARAMETRES_TRANSFORMATIONS } from "../profilsEvaluation4eCh2Ch3";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFonctionReference>` pour gen10 (Transformer une
 * fonction de référence — chapitre 3, `AppFonctionsReference.tsx`) — feuille d'évaluation.
 *
 * Analogue direct de gen8 (`generateurs/transformationsGraphiques/exportEvaluation.ts`), généralisé
 * aux 6 familles de référence (`FAMILLES`) : l'écran interactif fait lire TH/TV/CH/EH/EV/CV/SOX/SOY
 * séparément via 6 curseurs + 2 toggles (`EtapeFonctionsReferenceExercice.tsx`), chacun vérifié
 * indépendamment, PUIS une étape "reconnaissance" distincte (retrouver la famille parmi 6, avant
 * même d'afficher les curseurs). Un exercice papier ne peut reproduire ni l'une ni l'autre de ces
 * granularités : condensé en UNE question "lis l'équation sur le graphique" — la famille est
 * donnée implicitement par la forme de la courbe tracée (comme sur l'écran, une fois la famille
 * reconnue), exactement comme gen8 condense p/q/EV/CV/SOX en une lecture d'équation unique.
 *
 * Points marqués — mêmes deux points que `MafsGraphFonctionsReference.tsx` (légende "Point
 * caractéristique" / "Point croix") :
 * - le point caractéristique, à `x=TH` (`pivotX`, indépendant de CH/EH/SOY, voir
 *   `verificationFonctionsReference.ts`) : pour les 5 familles où `g(0)=0` (carré/cube/racine
 *   carrée/racine cubique/valeur absolue), `f(TH) = TV` exactement — et pour "inverse", où ce point
 *   n'est pas défini (pôle), l'écran affiche déjà `(TH ; TV)` comme simple repère (intersection des
 *   deux asymptotes, cercle évidé) ; les deux cas convergent donc vers le MÊME couple `(TH ; TV)`,
 *   sans branche spéciale nécessaire ici ;
 * - le second point ("point croix"), où l'argument de la fonction de base vaut exactement 1
 *   (`pointUnitaire`, calculable exactement pour les 6 familles puisque g(1)=1 pour toutes).
 *
 * Pas de tracé des asymptotes de "inverse" ici (`Line.PointAngle` côté Mafs) : `construireSvgFonction`
 * (export/svgGraph.ts) ne sait tracer qu'une courbe échantillonnée + des points, jamais une droite
 * infinie séparée — hors périmètre de ce fichier (qui ne doit toucher aucun autre fichier). La
 * coupure au pôle reste néanmoins correctement rendue (`evaluerFonctionReference` renvoie NaN au
 * pôle, `construireSvgFonction` coupe le tracé exactement comme Mafs le fait pour `Plot.OfX`).
 */

export { construireGrapheFonctionReference } from "./figures";
import { construireGrapheFonctionReference } from "./figures";

/** Nombre (entier ou fraction irréductible) rendu en LaTeX — `\dfrac` plutôt que « p/q ». */
function nombreLatex(valeur: number): string {
  const brut = formatFractionIrreductible(valeur);
  const m = /^(-?)(\d+)\/(\d+)$/.exec(brut);
  return m ? `${m[1]}\\dfrac{${m[2]}}{${m[3]}}` : brut;
}

function coordonneesLatex(x: number, y: number): string {
  return `\\left(${nombreLatex(x)}\\,;\\,${nombreLatex(y)}\\right)`;
}

const PHRASE_GRAPHIQUE = "Le graphique ci-dessous représente une fonction f obtenue en transformant l'une des fonctions de référence ";
const FONCTIONS_REFERENCE: FragmentConsigne[] = [latex("x^2"), texte(", "), latex("x^3"), texte(", "), latex("\\sqrt{x}"), texte(", "), latex("\\sqrt[3]{x}"), texte(", "), latex("\\dfrac{1}{x}"), texte(" ou "), latex("|x|"), texte(". ")];

/** Étapes du raisonnement, dans l'ordre des écrans (reconnaissance de la famille, puis lecture des
 * transformations et de l'équation) — sous-questions du générateur, reprises comme étapes du
 * corrigé sur papier (`enoncePapier`). */
function construireEnonceFonctionsReference(exercice: ExerciceFonctionReference): SectionExercice {
  return {
    enteteFragments: [texte(PHRASE_GRAPHIQUE), ...FONCTIONS_REFERENCE],
    enteteHtml: construireGrapheFonctionReference(exercice, false),
    questions: [
      { consigne: [texte("Reconnais la fonction de référence dont la courbe est issue.")] },
      { consigne: [texte("Lis les translations horizontale et verticale à l'aide du point caractéristique.")] },
      { consigne: [texte("Compare au point caractéristique le point de la courbe qui correspond au point (1 ; 1) de la fonction de référence : déduis-en l'étirement ou la compression, et les symétries.")] },
      { consigne: [texte("Écris l'équation de f, sous sa forme la plus simple.")] },
    ],
  };
}

/** Énoncé PAPIER (feuille d'exercices, évaluation) : l'énoncé et la consigne globale seulement.
 * Les sous-questions de `construireEnonce` sont les étapes d'apprentissage du générateur
 * interactif : sur papier, elles passent dans le corrigé (voir `EnoncePapier`). */
function enoncePapierFonctionsReference(exercice: ExerciceFonctionReference): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte(PHRASE_GRAPHIQUE),
        ...FONCTIONS_REFERENCE,
        texte("Détermine l'équation de f, sous sa forme la plus simple."),
      ],
      enteteHtml: construireGrapheFonctionReference(exercice, false),
      questions: [],
    },
  };
}

function construireCorrectionFonctionsReference(exercice: ExerciceFonctionReference): BlocCorrection[] {
  const croix = pointUnitaire(exercice);
  return [
    {
      type: "paragraphe",
      fragments: [
        texte("Point caractéristique lu directement sur le graphique : "),
        latex(`(${exercice.th} ; ${exercice.tv})`),
        texte(", donc TH et TV sont connus."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("Second point, sur une intersection du quadrillage (là où l'argument de la fonction vaut exactement 1) : "),
        latex(`(${formatFractionIrreductible(croix.x)} ; ${formatFractionIrreductible(croix.y)})`),
        texte(" — il permet de retrouver le rapport d'échelle et l'orientation de la courbe."),
      ],
    },
    { type: "html", html: construireGrapheFonctionReference(exercice, true) },
    { type: "paragraphe", fragments: [texte("Équation : "), latex(formatEquationFonctionReferenceLatex(exercice)), texte(".")] },
  ];
}

// ============================================================================
// Feuilles enrichies (difficulté, réponse brève, corrigé détaillé, barème). Les
// équations viennent TOUJOURS de `formatEquationFonctionReferenceLatex` (la même fonction que la
// réponse révélée de l'écran) et les points de `pointUnitaire` (le même que le graphe de l'écran).
// Étapes (lettres du corrigé et du barème) : a) famille, b) translations, c) facteur et symétries,
// d) équation — mêmes étapes que `construireEnonce`.
// ============================================================================

function difficulteFonctionsReference(exercice: ExerciceFonctionReference): 1 | 2 | 3 {
  // Compression (écart fractionnaire) : la lecture la plus délicate. Étirement ou symétrie : une
  // transformation de plus à lire que les seules translations.
  if (exercice.ch > 1 || exercice.cv > 1) return 3;
  if (exercice.eh > 1 || exercice.ev > 1 || exercice.sox || exercice.soy) return 2;
  return 1;
}

function reponseBreveFonctionsReference(exercice: ExerciceFonctionReference): FragmentConsigne[] {
  return [latex(equationLatex(exercice))];
}

const correctionDetailleeFonctionsReference = correctionDetailleeFonctionsReferenceTableau;

function baremeFonctionsReference(exercice: ExerciceFonctionReference): BaremeExercice {
  const { th, tv } = exercice;
  const erreurs: ErreurFrequente[] = [];
  if (th !== 0) {
    erreurs.push({
      description: [texte("Signe de la translation horizontale inversé : "), latex(th > 0 ? `x + ${th}` : `x - ${-th}`), texte(" au lieu de "), latex(th > 0 ? `x - ${th}` : `x + ${-th}`)],
      cout: "0 pt sur b), équation notée sans double pénalité",
    });
  }
  if (exercice.ch > 1 || exercice.eh > 1 || exercice.cv > 1 || exercice.ev > 1) {
    erreurs.push({ description: [texte("Confondre étirement et compression (facteur k au lieu de "), latex("\\dfrac{1}{k}"), texte(")")], cout: "0 pt sur c)" });
  }
  if (exercice.famille === "inverse") {
    erreurs.push({ description: [texte("Prendre le centre pour un point de la courbe")], cout: "−1" });
  }
  const acceptees: FragmentConsigne[][] = [[texte("Toute écriture équivalente de l'équation (facteur développé ou mis en évidence, fraction écrite autrement)")]];
  if (exercice.soy && FAMILLES_PAIRES.includes(exercice.famille)) {
    acceptees.push([texte("Le signe « − » laissé dans l'argument (inutile, la fonction de référence est paire) : "), latex(formatEquationFonctionReferenceLatex(exercice))]);
  } else if (exercice.soy && FAMILLES_IMPAIRES.includes(exercice.famille)) {
    acceptees.push([texte("Le signe « − » laissé dans l'argument : "), latex(formatEquationFonctionReferenceLatex(exercice))]);
  }
  return {
    reponseFinale: [latex(equationLatex(exercice))],
    criteres: [
      { sousQuestion: "a", critere: [texte("Fonction de référence reconnue : "), latex(BASE_LATEX[exercice.famille])], points: 1 },
      { sousQuestion: "b", critere: [texte("Translations lues au point caractéristique "), latex(coordonneesLatex(th, tv))], points: 1 },
      { sousQuestion: "c", critere: [texte("Facteur et symétries déduits du point correspondant à (1 ; 1)")], points: 1 },
      { sousQuestion: "d", critere: [texte("Équation complète et correcte")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

export const adaptateurEvaluationFonctionsReference: AdaptateurFeuilleExercices<ExerciceFonctionReference> = {
  profilInstance: profilFonctionReference,
  parametresAuChoix: PARAMETRES_TRANSFORMATIONS,
  titreDocument: "Transformer une fonction de référence — Évaluation",
  nomFichierBase: "fonctions-reference",
  genererInstance: genererExerciceFonctionReference,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecFamille(id as FamilleReference),
  construireEnonce: construireEnonceFonctionsReference,
  construireCorrection: construireCorrectionFonctionsReference,
  difficulte: difficulteFonctionsReference,
  reponseBreve: reponseBreveFonctionsReference,
  correctionDetaillee: correctionDetailleeFonctionsReference,
  bareme: baremeFonctionsReference,
  enoncePapier: enoncePapierFonctionsReference,
  dureeMinutes: 5,
};
