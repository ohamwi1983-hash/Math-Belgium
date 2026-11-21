import type { ExerciceReductionVectorielle } from "../../core/reductionVectorielle.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, SectionExercice } from "../../../export/genererFeuilleExercices";
import { PARAMETRES_REDUCTION, profilReductionVectorielle } from "../profilsEvaluation4eCh6";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatExpressionLatex, libelleFigure } from "../../ui/formatReductionVectorielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceReductionVectorielle } from "./index";
import { correctionDetailleeReductionVectorielle, detecterAnnulations, formatTermeLatex, formatTermesArbitraires, reconstituerChemin } from "./corrigeDetaille";
import { construireFigureReductionHtml } from "./figureHtml";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceReductionVectorielle>` pour gen27 (Réduction d'une
 * somme de vecteurs — relation de Chasles, `AppReductionVectorielle.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence et
 * `generateurs/triangleLies/exportEvaluation.ts` pour un 2e exemple de croquis SVG autonome
 * (`enteteHtml`) réutilisant un moteur géométrique déjà utilisé côté écran.
 *
 * **Écran unique, reporté tel quel** : `EtapeReductionVectorielle.tsx`/`sessionReductionVectorielle.ts`
 * n'ont qu'une seule phase ("reduction") — une figure fixe (4 variantes, `figures.ts`), une expression
 * à réduire (`termes`, déjà mélangée) affichée terme par terme, et un champ libre où l'élève entre une
 * paire de lettres désignant le vecteur qu'il propose comme réduction (ex. "MA" pour `\vec{MA}`,
 * `moteur/verificationReductionVectorielle.ts` accepte TOUTE paire de points de la figure dont le
 * vecteur réel coïncide avec la cible, pas seulement `(pointDepart, pointArrivee)`). Une seule
 * question papier par instance, donc — pas de découpage a)/b)/c).
 *
 * **Croquis (`enteteHtml`)** : réutilise tel quel le moteur géométrique pur déjà utilisé par le rendu
 * écran (`ui/figureReductionSketch.ts::calculerGeometrieFigureReduction`, partagé par
 * `FigureReductionSketch.tsx` ET `OutilTraceVecteurs.tsx`) — jamais recalculé indépendamment.
 * `FigureReductionSketch.tsx` est un composant React (non instanciable dans ce pipeline texte/HTML,
 * `export/genererFeuilleExercicesHtml.ts`/`assemblerEvaluationHtml.ts`) : les mêmes éléments (arêtes,
 * points, étiquettes) sont donc réémis ici en SVG brut, avec les mêmes couleurs que `App.css`
 * (`--color-border: #e6e6f0`, `--color-text: #1b1c2b`, voir `src/index.css`) recopiées en attributs SVG
 * littéraux plutôt qu'en `var(...)` (sans effet dans le document HTML autonome de l'évaluation) — même
 * patron que `construireSvgBoiteMoustaches`/`construireCroquisHtml` (`generateurs/boiteMoustaches/exportEvaluation.ts`,
 * `generateurs/triangleLies/exportEvaluation.ts`). L'outil de traçage FACULTATIF (`OutilTraceVecteurs.tsx`)
 * n'a pas d'équivalent papier : c'est une aide interactive à la visualisation, jamais consommée par la
 * vérification (voir son commentaire de tête) — rien à reporter sur une feuille imprimée.
 *
 * **Correction RESYNTHÉTISÉE, jamais une transcription** : `sessionReductionVectorielle.ts` n'a pas de
 * texte d'aide à concaténer (vérifié : sa seule étape est `etapeTentatives`, sans `niveauAide` textuel —
 * la vérification est binaire, `verifierReduction`). La correction ci-dessous reconstruit donc le
 * raisonnement de Chasles complet à partir des seules valeurs déjà connues et correctes de l'instance
 * (`termes`, `pointDepart`, `pointArrivee`) :
 * 1. Les paires de termes qui s'annulent exactement (même 2 points, sens opposé, même coefficient —
 *    corollaire de Chasles `k·\vec{RS}+k·\vec{SR}=\vec 0`, voir l'en-tête de
 *    `generateurs/reductionVectorielle/index.ts`) sont repérées algébriquement (`detecterAnnulations`,
 *    ci-dessous) : deux termes s'annulent DÈS QUE la condition ci-dessus est vérifiée, qu'ils aient ou
 *    non été construits comme une "paire annulante" par le générateur — l'identité reste vraie dans tous
 *    les cas, donc cette détection n'a besoin d'aucune information sur la construction interne de
 *    l'instance (jamais exposée par `ExerciceReductionVectorielle`), seulement de `termes` lui-même.
 * 2. Les termes restants sont réordonnés en une chaîne télescopique continue de `pointDepart` à
 *    `pointArrivee` (`reconstituerChemin`, une marche dans le graphe des arêtes restantes) — toujours
 *    possible avec les 4 figures actuelles (chaque terme non annulé a un coefficient ±1, un unique
 *    segment de la chaîne d'origine, jamais partagé entre 2 termes — vérifié par le smoke test sur des
 *    dizaines de tirages des 4 variantes) : garde défensive (`reconstituerChemin` retourne `null`) si un
 *    futur changement de génération invalidait cette hypothèse, avec un repli textuel générique plutôt
 *    qu'une exception.
 * `formatTermeLatex`/`formatTermesArbitraires` ci-dessous reproduisent la convention de
 * `ui/formatReductionVectorielle.ts::formatTerme` (coefficient signé + `\vec{origine arrivee}`), non
 * réexportée (privée) car cette dernière n'opère que sur `instance.termes` tel quel — jamais sur un
 * sous-ensemble réordonné (paires isolées, chaîne reconstituée) comme il en faut ici.
 *
 * **PAS `regroupable`** : `enteteHtml` (croquis) est présent — disqualifie `regroupable` à lui seul,
 * quelle que soit la généricité de la consigne (voir la doc de `AdaptateurFeuilleExercices.regroupable`
 * dans `export/genererFeuilleExercices.ts`).
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }`, même décision documentée
 * que `quelAngle/exportEvaluation.ts`/`comparaisonSeries/exportEvaluation.ts`) : la réponse attendue est
 * une simple paire de lettres, jamais un calcul à dérouler sur plusieurs lignes.
 */


function construireEnonceReductionVectorielle(instance: ExerciceReductionVectorielle): SectionExercice {
  return {
    enteteFragments: [texte(`${libelleFigure(instance)}. Réduis l'expression suivante en un seul vecteur : `), latex(formatExpressionLatex(instance)), texte(".")],
    enteteHtml: construireFigureReductionHtml(instance),
    questions: [
      {
        consigne: [
          texte("Donne le vecteur réduit, désigné par deux points de la figure."),
        ],
      },
    ],
  };
}

function construireCorrectionReductionVectorielle(instance: ExerciceReductionVectorielle): BlocCorrection[] {
  const { termes, pointDepart, pointArrivee } = instance;
  const { annulations, restants } = detecterAnnulations(termes);
  const chemin = reconstituerChemin(restants, pointDepart, pointArrivee);

  const blocs: BlocCorrection[] = [];

  blocs.push({
    type: "paragraphe",
    fragments: [texte("Expression de départ : "), latex(formatExpressionLatex(instance)), texte(".")],
  });

  if (annulations.length > 0) {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          annulations.length > 1
            ? "On repère d'abord les paires de termes qui s'annulent exactement (relation de Chasles : "
            : "On repère d'abord la paire de termes qui s'annule exactement (relation de Chasles : ",
        ),
        latex("k\\vec{RS}+k\\vec{SR}=\\vec 0"),
        texte(") :"),
      ],
    });
    for (const [a, b] of annulations) {
      blocs.push({ type: "paragraphe", fragments: [latex(`${formatTermeLatex(a, false)} ${formatTermeLatex(b, true)} = \\vec 0`)] });
    }
  }

  if (chemin) {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(annulations.length > 0 ? "Il reste : " : "Tous les termes forment déjà une chaîne continue : "),
        latex(formatTermesArbitraires(chemin)),
        texte(", que l'on relie point par point (relation de Chasles) :"),
      ],
    });
    blocs.push({
      type: "paragraphe",
      fragments: [latex(`${formatTermesArbitraires(chemin)} = \\vec{${pointDepart}${pointArrivee}}`)],
    });
  } else {
    // Garde défensive — jamais rencontrée avec les 4 figures actuelles (voir le commentaire de tête) :
    // conclusion directe sans détail du télescopage.
    blocs.push({
      type: "paragraphe",
      fragments: [texte("Les termes restants se relient bout à bout (relation de Chasles) jusqu'à former un unique vecteur.")],
    });
  }

  const fragmentsConclusion: FragmentConsigne[] = [
    texte("Vecteur réduit : "),
    latex(`\\vec{${pointDepart}${pointArrivee}}`),
    texte(" (toute autre paire de points de la figure représentant ce même vecteur est également une réponse correcte)."),
  ];
  blocs.push({ type: "paragraphe", fragments: fragmentsConclusion });

  return blocs;
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Un seul écran. L'énoncé papier garde la figure (donnée), l'expression et la consigne « réduis en
// un seul vecteur », sans la syntaxe de saisie de l'écran (« paire de lettres »). Le corrigé
// reprend les annulations puis la chaîne de Chasles (mêmes fonctions que `construireCorrection`).

/** Description de la figure en phrase (le libellé de l'écran, « Hexagone régulier + centre », est un
 * titre de catalogue). */
const FIGURE_PAPIER: Record<ExerciceReductionVectorielle["figure"], string> = {
  hexagone: "un hexagone régulier et son centre",
  etoile: "une étoile à six branches",
  trapeze: "un trapèze et ses diagonales",
  triangleMedianes: "un triangle et ses médianes",
};

function enoncePapier(instance: ExerciceReductionVectorielle): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(`On considère la figure ci-dessous (${FIGURE_PAPIER[instance.figure]}). Réduis l'expression suivante en un seul vecteur, désigné par deux points de la figure : `), latex(formatExpressionLatex(instance)), texte(".")],
      enteteHtml: construireFigureReductionHtml(instance),
      questions: [],
    },
  };
}

function reponseBreve(instance: ExerciceReductionVectorielle): FragmentConsigne[] {
  return [latex(`\\vec{${instance.pointDepart}${instance.pointArrivee}}`)];
}

function bareme(instance: ExerciceReductionVectorielle): BaremeExercice {
  const { annulations } = detecterAnnulations(instance.termes);
  const critereFinal = { sousQuestion: "a", critere: [texte("Vecteur réduit : "), latex(`\\vec{${instance.pointDepart}${instance.pointArrivee}}`)], points: 1.5 };
  const criteres = annulations.length > 0
    ? [
        { sousQuestion: "a", critere: [texte("Termes opposés éliminés")], points: 1 },
        { sousQuestion: "a", critere: [texte("Termes précédés de « − » réécrits dans l'autre sens")], points: 0.5 },
        { sousQuestion: "a", critere: [texte("Chaîne de Chasles reconstituée")], points: 1 },
        critereFinal,
      ]
    : [
        { sousQuestion: "a", critere: [texte("Termes précédés de « − » réécrits dans l'autre sens")], points: 1 },
        { sousQuestion: "a", critere: [texte("Chaîne de Chasles reconstituée")], points: 1.5 },
        critereFinal,
      ];
  return {
    reponseFinale: reponseBreve(instance),
    criteres,
    erreursFrequentes: [
      { description: [texte("Signe « − » ignoré (vecteur gardé dans le mauvais sens)")], cout: "−1,5" },
      { description: [texte("Termes de coefficients différents annulés à tort")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte("Toute autre paire de points de la figure représentant le même vecteur (même direction, même sens, même longueur)")]],
  };
}

/** Niveau : un écran ; méthode imposée (Chasles, 0) ; piège dans les données : un vecteur précédé de
 * « − » à retourner, ou une paire de termes opposés à annuler. */
function criteresDifficulte(instance: ExerciceReductionVectorielle): CriteresDifficulte {
  const piege = instance.termes.some((t) => t.coefficient < 0) || detecterAnnulations(instance.termes).annulations.length > 0 ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeReductionVectorielle(instance)), methode: 0, piege, nombres: 0 };
}

export const adaptateurEvaluationReductionVectorielle: AdaptateurFeuilleExercices<ExerciceReductionVectorielle> = {
  titreDocument: "Réduction d'une somme de vecteurs (Chasles) — Évaluation",
  nomFichierBase: "reduction-vectorielle-chasles",
  genererInstance: genererExerciceReductionVectorielle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceReductionVectorielle,
  construireCorrection: construireCorrectionReductionVectorielle,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeReductionVectorielle,
  bareme,
  enoncePapier,
  profilInstance: profilReductionVectorielle,
  parametresAuChoix: PARAMETRES_REDUCTION,
  // PAS regroupable — `enteteHtml` (croquis) présent, disqualifie à lui seul : voir le commentaire de
  // tête.
};
