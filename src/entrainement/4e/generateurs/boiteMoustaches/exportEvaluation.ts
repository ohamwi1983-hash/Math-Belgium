import type {
  CinqNombres,
  ExerciceBoiteMoustaches,
  ExerciceBoiteMoustachesComparaison,
  ExerciceBoiteMoustachesConstruction,
  ExerciceBoiteMoustachesLecture,
} from "../../core/boiteMoustaches.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeBoiteMoustaches } from "./corrigeDetaille";
import { latex, texte } from "../../../export/fragmentsDocx";
import { LABEL_Q1, LABEL_Q2, LABEL_Q3, LABEL_X_MAX, LABEL_X_MIN, formatEnonceTexte, formatTermesCinqNombresLatex } from "../../ui/formatBoiteMoustaches";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBoiteMoustaches } from "./index";
import { avecVirgulesBelges, segmentEnVirgules } from "../../ui/nombreFr";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceBoiteMoustaches>` pour gen36 (Boîte à moustaches,
 * `AppBoiteMoustaches.tsx`) — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme
 * générique de référence, et `generateurs/caracteristiquesFonction/exportEvaluation.ts` pour le
 * précédent le plus proche d'un adaptateur pilotant un graphique statique (`enteteHtml`).
 *
 * **3 variantes, 3 formes papier très différentes** (`CATALOGUE_VARIANTES`, `generateurs/boiteMoustaches/index.ts`) :
 * - `construction` — l'écran interactif donne les 5 nombres et fait glisser 5 marqueurs sur un
 *   graphe Mafs vierge. Sur papier : les 5 nombres sont imprimés (texte + KaTeX, comme
 *   `formatTermesCinqNombresLatex`, déjà utilisé côté écran) au-dessus d'un axe gradué VIERGE (même
 *   viewBox que l'écran, mais sans aucune boîte tracée — juste une ligne de base à `y=0` comme repère
 *   horizontal) sur lequel l'élève dessine sa boîte à la main ; la correction montre la boîte
 *   attendue tracée, étiquetée des 5 valeurs.
 * - `lecture` — l'écran affiche une boîte déjà tracée (SANS aucune valeur visible) et fait saisir les
 *   5 nombres. Sur papier : la boîte est imprimée dans l'énoncé exactement de la même façon (aucune
 *   étiquette numérique — sans quoi l'exercice n'aurait plus de sens), la correction réimprime la
 *   MÊME boîte cette fois étiquetée des 5 valeurs (repère de correction direct, même principe que
 *   `caracteristiquesFonction/exportEvaluation.ts` qui réimprime son graphique en tête de correction).
 * - `comparaison` — l'écran affiche 2 boîtes (séries A/B, mêmes 2 questions catégorielles
 *   `comparaisonMedianes`/`comparaisonDispersions` toujours posées dans cet ordre, jamais une seule
 *   des deux — voir `AppBoiteMoustaches.tsx`). Sur papier : les 2 boîtes sur un seul graphique
 *   (étiquetées "A"/"B", sans valeur numérique dans l'énoncé — seul l'ordre relatif importe), 2
 *   questions papier consécutives reprenant ces 2 comparaisons ; la correction réimprime le
 *   graphique étiqueté des valeurs puis répond aux 2 questions en relisant directement
 *   `medianePlusGrande`/`ecartInterquartilePlusGrand` (déjà calculés et garantis univoques à la
 *   construction, voir `core/boiteMoustaches.types.ts`), jamais recalculés indépendamment ici.
 *
 * **Graphique** (`construireSvgBoiteMoustaches`) : AUCUN générateur existant ne trace de boîte à
 * moustaches en SVG statique — `export/svgGraph.ts::construireSvgFonction` est un moteur de tracé de
 * COURBE (échantillonnage d'une fonction réelle), inapplicable ici (une boîte à moustaches n'est pas
 * le graphe d'une fonction). Ce fichier écrit donc son propre petit moteur de tracé, mais **réutilise
 * la géométrie déjà pure et testée de `ui/boiteMoustachesGraph.ts`** (`calculerViewBoxBoiteMoustaches`,
 * `ratioGraphe`, `yLigne`, `DEMI_HAUTEUR_BOITE`, `DEMI_HAUTEUR_MOUSTACHE`, `MANTISSES_GRILLE_BOITE`,
 * `cibleNombreLignesXAdaptative`) et le calcul de pas de grille "nombre rond" déjà partagé par le
 * reste du projet (`ui/mafsTransformation.ts::calculerPasGrille`/`etendreLargeurXPourEtiquettes`) —
 * aucune de ces fonctions ne dépend de React/Mafs (pur calcul), seul `components/BoiteMoustachesGraph.tsx`
 * (non réutilisable ici, JSX Mafs) construit le rendu ÉCRAN à partir des mêmes briques. Le tracé
 * lui-même (moustaches, boîte, bords colorés Q1/médiane/Q3) recopie fidèlement le code couleur et la
 * disposition de `BoiteMoustachesGraph.tsx` (vert `#2f9e44`/violet `#7048e8`/bleu `#1971c2`/neutre
 * `#212529`) pour rester visuellement cohérent avec l'écran. Étiquette de série ("A"/"B") toujours
 * affichée à GAUCHE de la boîte (jamais au-dessus, comme à l'écran) : au-dessus aurait pu chevaucher
 * l'étiquette numérique de la médiane (`avecEtiquettes: true`, corrections uniquement) qui partage la
 * même abscisse — déplacer la lettre de série évite tout risque de collision sans complexifier le
 * calcul de position des 5 étiquettes numériques (qui reste, lui, identique à
 * `BoiteMoustachesGraph.tsx` : alternance haut/bas par index pour éviter que 2 marqueurs ADJACENTS,
 * parfois distants d'une seule unité de donnée, ne se chevauchent).
 *
 * `avecEtiquettes: true` (correction uniquement, jamais l'énoncé — cf. `lecture`/`construction`
 * ci-dessus) ajoute les 5 valeurs numériques à côté de chaque marqueur, en couleur assortie
 * (min/max neutres, Q1 vert, médiane violette, Q3 bleue) — jamais dans l'énoncé, où ces valeurs sont
 * précisément ce que l'élève doit deviner/tracer.
 *
 * **PAS `regroupable`** : `AdaptateurFeuilleExercices.regroupable` exige À LA FOIS une seule question
 * par instance ET une consigne GÉNÉRIQUE (indépendante des valeurs tirées) ET l'absence
 * d'`enteteHtml` (voir sa doc, `export/genererFeuilleExercices.ts`) — aucune des 3 variantes ne
 * remplit ces conditions : `construction`/`lecture` ont chacune un `enteteHtml` (le graphique, vierge
 * ou tracé), et `comparaison` a EN PLUS 2 questions par instance. Contrairement à
 * `tableauFrequences/exportEvaluation.ts` (seul précédent `regroupable: true` du projet), aucune des
 * 3 formes papier de ce générateur n'est un simple texte + une consigne fixe.
 *
 * Correction toujours RESYNTHÉTISÉE depuis les champs déjà connus de l'instance
 * (`exercice.valeurs`/`serieA`/`serieB`/`medianePlusGrande`/`ecartInterquartilePlusGrand`), jamais
 * recalculée indépendamment — même principe que tous les autres adaptateurs du projet.
 */

import { construireSvgBoiteMoustaches, type LigneBoiteEvaluation } from "./figure";

/** Réexportés pour les importeurs historiques (figure déplacée dans `figure.ts`, sans `docx`). */
export { construireSvgBoiteMoustaches, type LigneBoiteEvaluation };

// ============================================================================
// Variante "construction".
// ============================================================================

function construireEnonceConstruction(exercice: ExerciceBoiteMoustachesConstruction): SectionExercice {
  const valeursLatex = formatTermesCinqNombresLatex(exercice.valeurs).join(";\\ ");
  return {
    enteteFragments: [texte(formatEnonceTexte(exercice)), texte(" Voici les 5 valeurs qui la caractérisent : "), latex(valeursLatex), texte(".")],
    enteteHtml: construireSvgBoiteMoustaches(exercice.bornePlage, []),
    questions: [
      {
        consigne: [
          texte(`Trace la boîte à moustaches correspondante sur l'axe gradué ci-dessus (en ${exercice.contexte.unite}).`),
        ],
      },
    ],
  };
}

function construireCorrectionConstruction(exercice: ExerciceBoiteMoustachesConstruction): BlocCorrection[] {
  const valeursLatex = formatTermesCinqNombresLatex(exercice.valeurs).join(";\\ ");
  return [
    { type: "html", html: construireSvgBoiteMoustaches(exercice.bornePlage, [{ valeurs: exercice.valeurs }], true) },
    { type: "paragraphe", fragments: [texte("Boîte à moustaches attendue : "), latex(valeursLatex), texte(".")] },
  ];
}

// ============================================================================
// Variante "lecture".
// ============================================================================

function construireEnonceLecture(exercice: ExerciceBoiteMoustachesLecture): SectionExercice {
  return {
    enteteFragments: [texte(formatEnonceTexte(exercice)), texte(" La boîte à moustaches ci-dessous représente cette série.")],
    enteteHtml: construireSvgBoiteMoustaches(exercice.bornePlage, [{ valeurs: exercice.valeurs }]),
    questions: [
      {
        consigne: [
          texte("Relève les 5 valeurs ("),
          latex(LABEL_X_MIN),
          texte(", "),
          latex(LABEL_Q1),
          texte(" médiane ("),
          latex(LABEL_Q2),
          texte("), "),
          latex(LABEL_Q3),
          texte(", "),
          latex(LABEL_X_MAX),
          texte(`) de cette boîte à moustaches (en ${exercice.contexte.unite}).`),
        ],
        reponse: { type: "lignes", nombre: 2 },
      },
    ],
  };
}

function construireCorrectionLecture(exercice: ExerciceBoiteMoustachesLecture): BlocCorrection[] {
  const valeursLatex = formatTermesCinqNombresLatex(exercice.valeurs).join(";\\ ");
  return [
    { type: "html", html: construireSvgBoiteMoustaches(exercice.bornePlage, [{ valeurs: exercice.valeurs }], true) },
    { type: "paragraphe", fragments: [texte("Valeurs attendues : "), latex(valeursLatex), texte(".")] },
  ];
}

// ============================================================================
// Variante "comparaison".
// ============================================================================

function construireLignesComparaison(exercice: ExerciceBoiteMoustachesComparaison): LigneBoiteEvaluation[] {
  return [
    { valeurs: exercice.serieA, label: "A" },
    { valeurs: exercice.serieB, label: "B" },
  ];
}

function construireEnonceComparaison(exercice: ExerciceBoiteMoustachesComparaison): SectionExercice {
  return {
    enteteFragments: [texte(formatEnonceTexte(exercice)), texte(" Le graphique ci-dessous représente les boîtes à moustaches des 2 séries.")],
    enteteHtml: construireSvgBoiteMoustaches(exercice.bornePlage, construireLignesComparaison(exercice)),
    questions: [
      { consigne: [texte("Laquelle des deux séries (A ou B) a la plus grande médiane ("), latex(LABEL_Q2), texte(") ?")], reponse: { type: "lignes", nombre: 1 } },
      {
        consigne: [
          texte("Laquelle des deux séries (A ou B) est la plus dispersée (le plus grand écart interquartile, "),
          latex(`${LABEL_Q3}-${LABEL_Q1}`),
          texte(") ?"),
        ],
        reponse: { type: "lignes", nombre: 1 },
      },
    ],
  };
}

function construireCorrectionComparaison(exercice: ExerciceBoiteMoustachesComparaison): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgBoiteMoustaches(exercice.bornePlage, construireLignesComparaison(exercice), true) },
    {
      type: "paragraphe",
      fragments: [texte("a) La série "), texte(exercice.medianePlusGrande), texte(" a la plus grande médiane ("), latex(LABEL_Q2), texte(").")],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("b) La série "),
        texte(exercice.ecartInterquartilePlusGrand),
        texte(" a le plus grand écart interquartile ("),
        latex(`${LABEL_Q3}-${LABEL_Q1}`),
        texte(").")
      ],
    },
  ];
}

// ============================================================================
// Adaptateur.
// ============================================================================

function construireEnonceBoiteMoustaches(exercice: ExerciceBoiteMoustaches): SectionExercice {
  if (exercice.variante === "construction") return construireEnonceConstruction(exercice);
  if (exercice.variante === "lecture") return construireEnonceLecture(exercice);
  return construireEnonceComparaison(exercice);
}

function construireCorrectionBoiteMoustaches(exercice: ExerciceBoiteMoustaches): BlocCorrection[] {
  if (exercice.variante === "construction") return construireCorrectionConstruction(exercice);
  if (exercice.variante === "lecture") return construireCorrectionLecture(exercice);
  return construireCorrectionComparaison(exercice);
}

// ============================================================================
// Feuilles enrichies (énoncé papier, réponse brève, corrigé détaillé, barème) — voir
// `.claude/rules/feuilles-evaluations.md`.
// - construction : sur papier, l'élève TRACE la boîte sur sa propre feuille (aucun axe vierge
//   imprimé : pas de zone de réponse) ; le corrigé garde la figure attendue (`construireCorrection`,
//   bloc HTML), donc `correctionDetaillee` est vide pour cette variante.
// - lecture : une consigne, la boîte est donnée.
// - comparaison : une consigne globale (médianes, puis dispersion au sens de l'écart
//   interquartile) ; les 2 écrans deviennent les 2 étapes du corrigé.
// ============================================================================

function enVirgules(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map(segmentEnVirgules);
}

/** Phrase d'ouverture de l'énoncé papier : « On étudie la répartition … . » — la phrase d'écran
 * (« Voici la répartition … : ») annonce un tableau qui n'existe pas sur papier. */
function phraseEtude(exercice: ExerciceBoiteMoustaches): string {
  return formatEnonceTexte(exercice).replace(/^Voici la répartition/, "On étudie la répartition").replace(/\s*:\s*$/, ".");
}

function cinqNombresLatex(valeurs: CinqNombres): string {
  return formatTermesCinqNombresLatex(valeurs).join(";\\ ");
}

function enoncePapierBoiteMoustaches(exercice: ExerciceBoiteMoustaches): EnoncePapier {
  const u = exercice.contexte.unite;
  if (exercice.variante === "construction") {
    return {
      section: {
        enteteFragments: enVirgules([texte(phraseEtude(exercice)), texte(" Voici les 5 valeurs qui la caractérisent : "), latex(cinqNombresLatex(exercice.valeurs)), texte(".")]),
        questions: [
          {
            consigne: enVirgules([
              texte(`Trace sur ta feuille la boîte à moustaches de cette série, sur un axe gradué (en ${u}) allant au moins de ${String(exercice.bornePlage.min).replace("-", "−")} à ${String(exercice.bornePlage.max).replace("-", "−")}.`),
            ]),
          },
        ],
      },
      etapesParQuestion: [["a"]],
    };
  }
  if (exercice.variante === "lecture") {
    return {
      section: {
        enteteFragments: enVirgules([texte(phraseEtude(exercice)), texte(" La boîte à moustaches ci-dessous représente cette série.")]),
        enteteHtml: construireSvgBoiteMoustaches(exercice.bornePlage, [{ valeurs: exercice.valeurs }]),
        questions: [
          {
            consigne: [
              texte("Relève les cinq nombres de cette boîte à moustaches : "),
              latex(LABEL_X_MIN),
              texte(", "),
              latex(LABEL_Q1),
              texte(", la médiane "),
              latex(LABEL_Q2),
              texte(", "),
              latex(LABEL_Q3),
              texte(" et "),
              latex(LABEL_X_MAX),
              texte(` (en ${u}).`),
            ],
          },
        ],
      },
      etapesParQuestion: [["a"]],
    };
  }
  return {
    section: {
      enteteFragments: enVirgules([texte(phraseEtude(exercice)), texte(" Le graphique ci-dessous représente les boîtes à moustaches des 2 séries.")]),
      enteteHtml: construireSvgBoiteMoustaches(exercice.bornePlage, construireLignesComparaison(exercice)),
      questions: [
        {
          consigne: [
            texte("Compare les deux séries : laquelle a la plus grande médiane "),
            latex(LABEL_Q2),
            texte(", et laquelle est la plus dispersée au sens de l'écart interquartile "),
            latex(`${LABEL_Q3}-${LABEL_Q1}`),
            texte(" ? Justifie à l'aide du graphique."),
          ],
        },
      ],
    },
    etapesParQuestion: [["a", "b"]],
  };
}

function reponseBreveBoiteMoustaches(exercice: ExerciceBoiteMoustaches): FragmentConsigne[] {
  if (exercice.variante === "comparaison") {
    return [texte(`Plus grande médiane : série ${exercice.medianePlusGrande} ; plus dispersée : série ${exercice.ecartInterquartilePlusGrand}`)];
  }
  return enVirgules([latex(cinqNombresLatex(exercice.valeurs))]);
}

function baremeBoiteMoustaches(exercice: ExerciceBoiteMoustaches): BaremeExercice {
  let criteres: CritereBareme[];
  let erreurs: ErreurFrequente[];
  if (exercice.variante === "construction") {
    criteres = [
      { sousQuestion: "a", critere: [texte("Axe gradué régulièrement, avec son unité")], points: 0.5 },
      { sousQuestion: "a", critere: [texte("Moustaches de "), latex(LABEL_X_MIN), texte(" à "), latex(LABEL_X_MAX)], points: 1 },
      { sousQuestion: "a", critere: [texte("Boîte de "), latex(LABEL_Q1), texte(" à "), latex(LABEL_Q3)], points: 1.5 },
      { sousQuestion: "a", critere: [texte("Trait de la médiane "), latex(LABEL_Q2), texte(" à sa valeur")], points: 1 },
    ];
    erreurs = [
      { description: [texte("Médiane placée au milieu de la boîte au lieu de sa valeur")], cout: "0 pt sur la médiane" },
      { description: [texte("Axe non gradué régulièrement (valeurs placées à intervalles égaux)")], cout: "0 pt sur l'axe" },
    ];
  } else if (exercice.variante === "lecture") {
    criteres = [
      { sousQuestion: "a", critere: [latex(LABEL_X_MIN), texte(" et "), latex(LABEL_X_MAX)], points: 1 },
      { sousQuestion: "a", critere: [latex(LABEL_Q1)], points: 1 },
      { sousQuestion: "a", critere: [latex(LABEL_Q3)], points: 1 },
      { sousQuestion: "a", critere: [texte("Médiane "), latex(LABEL_Q2)], points: 1 },
    ];
    erreurs = [
      { description: [texte("Médiane prise au milieu de la boîte")], cout: "0 pt sur la médiane" },
      { description: [latex("Q_1"), texte(" et "), latex("Q_3"), texte(" inversés")], cout: "0 pt sur les deux quartiles" },
    ];
  } else {
    criteres = [
      { sousQuestion: "a", critere: [texte("Médianes lues sur le graphique")], points: 1 },
      { sousQuestion: "a", critere: [texte(`Conclusion : série ${exercice.medianePlusGrande}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Écarts interquartiles "), latex(`${LABEL_Q3}-${LABEL_Q1}`), texte(" des deux séries")], points: 1 },
      { sousQuestion: "b", critere: [texte(`Conclusion : série ${exercice.ecartInterquartilePlusGrand}`)], points: 1 },
    ];
    erreurs = [{ description: [texte("Dispersion jugée sur la longueur totale (étendue) au lieu de l'écart interquartile")], cout: "0 pt sur b)" }];
  }
  return {
    reponseFinale: reponseBreveBoiteMoustaches(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: exercice.variante === "comparaison" ? [[texte("Justification par la largeur des boîtes, sans calcul, si elle est explicite")]] : [[texte("Valeurs données dans un autre ordre si chacune est nommée")]],
  };
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`). Écrans de pure
 * lecture : tracer (placer cinq valeurs données), relever les cinq nombres, lire et comparer deux
 * médianes ; seul l'écart interquartile (comparaison, b) transforme. Méthode imposée ; piège dans
 * les données quand la série la plus étendue n'est PAS la plus dispersée au sens de Q₃ − Q₁. */
function criteresDifficulte(exercice: ExerciceBoiteMoustaches): CriteresDifficulte {
  let piege: 0 | 1 = 0;
  if (exercice.variante === "comparaison") {
    const etA = exercice.serieA.max - exercice.serieA.min;
    const etB = exercice.serieB.max - exercice.serieB.min;
    piege = etA !== etB && (etA > etB ? "A" : "B") !== exercice.ecartInterquartilePlusGrand ? 1 : 0;
  }
  return { ...etapesDuCorrige(correctionDetailleeBoiteMoustaches(exercice), ["a"]), methode: 0, piege };
}

const adaptateurEvaluationBoiteMoustachesBrut: AdaptateurFeuilleExercices<ExerciceBoiteMoustaches> = {
  titreDocument: "Boîte à moustaches — Évaluation",
  nomFichierBase: "boite-moustaches",
  genererInstance: genererExerciceBoiteMoustaches,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceBoiteMoustaches,
  construireCorrection: construireCorrectionBoiteMoustaches,
  // PAS regroupable : chaque variante a un enteteHtml (graphique), et "comparaison" a en plus 2
  // questions par instance — voir le commentaire de tête de fichier.
};

/** Notation décimale belge (virgule) dans tout l'énoncé et la correction (audit chapitre 4). */
export const adaptateurEvaluationBoiteMoustaches: AdaptateurFeuilleExercices<ExerciceBoiteMoustaches> = {
  ...avecVirgulesBelges(adaptateurEvaluationBoiteMoustachesBrut),
  criteresDifficulte,
  reponseBreve: reponseBreveBoiteMoustaches,
  correctionDetaillee: correctionDetailleeBoiteMoustaches,
  bareme: baremeBoiteMoustaches,
  enoncePapier: enoncePapierBoiteMoustaches,
};
