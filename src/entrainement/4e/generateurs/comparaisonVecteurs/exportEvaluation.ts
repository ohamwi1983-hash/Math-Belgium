import type { ExerciceComparaisonVecteurs } from "../../core/comparaisonVecteurs.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, SectionExercice } from "../../../export/genererFeuilleExercices";
import { profilComparaisonVecteurs } from "../profilsEvaluation4eCh6";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { consigneSelection } from "../../ui/formatComparaisonVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparaisonVecteurs } from "./index";
import { correctionDetailleeComparaisonVecteurs, egalitesLatex } from "./corrigeDetaille";
import { construireSvgComparaison } from "./figure";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComparaisonVecteurs>` pour gen28 (Comparaison
 * visuelle de vecteurs sur figure, `AppComparaisonVecteurs.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/boiteMoustaches/exportEvaluation.ts`/`generateurs/triangleQuelconque/exportEvaluation.ts`
 * pour les 2 précédents les plus proches d'un adaptateur qui doit tracer sa propre figure statique
 * (`enteteHtml`) faute de moteur de rendu SVG déjà existant pour ce type de figure.
 *
 * **Écran → questions** : `moteur/sessionComparaisonVecteurs.ts`/`AppComparaisonVecteurs.tsx`
 * enchaînent 2 phases FIXES, toujours dans le même ordre, sur LA MÊME figure (2-3 vecteurs de base
 * + 3-5 vecteurs dérivés, tous des transformations garanties exactes — translation ou multiple
 * scalaire — d'un des vecteurs de base, voir `generateurs/comparaisonVecteurs/index.ts`) : "sélection"
 * (`EtapeSelectionComparaison.tsx` — sélectionner tous les vecteurs de même longueur/direction/sens
 * que la référence, en rouge) → "égalité" (`EtapeEgaliteComparaison.tsx` — écrire l'égalité reliant
 * un vecteur trouvé, `cibleEgalite`, à la référence, ex. `c = 2h`). Reproduit ici par UNE figure
 * (`enteteHtml`, affichée une seule fois en tête, comme `caracteristiquesFonction/exportEvaluation.ts`)
 * suivie de 2 questions a)/b) dans le même ordre, jamais recombinées.
 *
 * **3 variantes** (`CATALOGUE_VARIANTES`, `longueur`/`direction`/`sens`) : SEULE la consigne de (a)
 * change (`consigneSelection`, `ui/formatComparaisonVecteurs.ts`, déjà réutilisée telle quelle côté
 * écran ET ici — aucune reformulation locale) ; la figure et la question (b) restent structurellement
 * identiques quelle que soit la variante (`ExerciceComparaisonVecteurs` est déjà uniforme sur les 3,
 * voir `core/comparaisonVecteurs.types.ts`), donc pas de branche `if (variante)` nécessaire ici.
 *
 * **Graphique papier NÉCESSAIRE** : l'exercice EST la figure — comparer longueur/direction/sens de
 * vecteurs tracés n'a aucun sens en texte pur (contrairement à `simplification`/`triangleQuelconque`
 * question b, où seule une valeur numérique est demandée). `construireSvgComparaison` (ce fichier)
 * est le premier moteur de tracé SVG statique de VECTEURS du projet (`export/svgGraph.ts` ne trace
 * que des courbes de fonction, `generateurs/xxx/exportEvaluation.ts` d'aucun autre générateur du
 * chapitre "Calcul vectoriel" n'existe encore à ce jour) — mais ne réinvente RIEN de la géométrie :
 * il réutilise tel quel `ui/formatComparaisonVecteurs.ts::vecteursAffichesComparaison` (même fonction
 * PURE que `EtapeSelectionComparaison.tsx`/`EtapeEgaliteComparaison.tsx` à l'écran — couleurs
 * rouge/orange de référence/sélection, ET positions d'étiquettes sans chevauchement déjà résolues
 * par `ui/vecteurGraph.ts::calculerPositionsEtiquettesSansChevauchement`), `ui/vecteurGraph.ts::
 * calculerViewBoxVecteurs` (même viewBox pur que Mafs) et `ui/mafsTransformation.ts::RATIO_GRAPHE`
 * (même ratio d'aspect que tous les autres graphes Mafs du projet) ; pas de grille FIXÉ à 1 sur les
 * deux axes, comme à l'écran (`VecteurGraph pasGrille={1}`, audit chapitre 6). Seule la RASTÉRISATION en primitives `<svg>` (ligne+tête de flèche pour
 * chaque vecteur, `<text>`+petite flèche au-dessus pour chaque étiquette — reproduction fidèle, en
 * géométrie SVG inline, de `VecteurGraph.tsx::LabelVecteurFleche`, jamais un caractère Unicode, même
 * raisonnement que documenté en tête de ce composant) est écrite ici, jamais dans `ui/`. Grille
 * affichée SANS les 2 lignes d'axe ni leurs graduations numériques — même choix que
 * `masquerAxes` côté écran (`EtapeSelectionComparaison.tsx`/`EtapeEgaliteComparaison.tsx` : cet
 * exercice compare longueur/direction/sens, jamais des coordonnées ; le quadrillage reste utile
 * comme repère de proportions relatives, voir la doc de `VecteurGraph.tsx::Props.masquerAxes`).
 *
 * **PAS `regroupable`**, pour 3 raisons indépendantes, chacune déjà suffisante à elle seule (voir la
 * doc de `AdaptateurFeuilleExercices.regroupable`, `genererFeuilleExercices.ts`) : (1) 2 questions
 * par instance, jamais 1 seule ; (2) la consigne de (a) dépend de l'instance (`consigneSelection`
 * mentionne la propriété testée ET le label de la référence, jamais une consigne générique
 * constante) ; (3) `construireEnonceComparaisonVecteurs` utilise `enteteHtml` (la figure), condition
 * à elle seule déjà exclusive quel que soit le nombre de questions.
 *
 * **Correction RESYNTHÉTISÉE** depuis les champs déjà connus et garantis corrects de l'instance
 * tirée (`labelsCorrects`, `cibleEgalite`, `coefficientEgalite` — tous calculés à la construction
 * par `generateurs/comparaisonVecteurs/index.ts`, jamais redérivés indépendamment ici), en
 * réimprimant la MÊME figure avec la sélection correcte mise en évidence en orange (même principe
 * que `boiteMoustaches/exportEvaluation.ts::avecEtiquettes`/`caracteristiquesFonction/exportEvaluation.ts` :
 * réimprimer le graphique en tête de correction plutôt que décrire la réponse en texte seul, un
 * repère visuel direct pour un exercice dont la question EST visuelle). `formatCoefficientLatex`/
 * `formatVecteursAttendusLatex`/`formatEgaliteAttendueLatex` ci-dessous sont une PETITE copie locale,
 * à la lettre, des formateurs déjà utilisés côté écran par `components/ResultatPanelComparaisonVecteurs.tsx`
 * (elle-même déjà une 2ᵉ copie locale de la même convention "coefficient 1/-1 jamais explicite" que
 * `ui/formatRelationVectorielle.ts::formatCoefficientTraduction`) — jamais importées depuis ce
 * composant `.tsx` : aucun adaptateur `exportEvaluation.ts` du projet n'importe depuis `components/`
 * (seulement `ui/`/`moteur/`/son propre `generateurs/xxx/index.ts`), et ces 3 fonctions n'ont pas
 * d'équivalent exporté côté `ui/formatComparaisonVecteurs.ts` — même décision de petite fonction
 * dupliquée plutôt qu'un import inter-couches, déjà prise 2 fois avant dans ce même projet pour cette
 * même convention d'affichage.
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur les 2 questions) —
 * même décision documentée par `generateurs/triangleQuelconque/exportEvaluation.ts`/`generateurs/
 * cercleTrigonometrique/exportEvaluation.ts` : l'élève répond sur une feuille à part, jamais sur la
 * copie imprimée elle-même.
 */

// --- Rendu SVG imprimé de la figure (voir le commentaire de tête ci-dessus) ---

// --- Formateurs de correction (petite copie locale, voir le commentaire de tête) ---

function formatVecteursAttendusLatex(labels: string[]): string {
  return labels.map((label) => `\\vec{${label}}`).join(", ");
}

// --- Énoncé / correction ---

/** Énoncé = énoncé papier (mêmes deux questions, qui sont aussi les deux étapes du corrigé) : la
 * consigne d'écran « Sélectionne… » et l'égalité d'un vecteur NOMMÉ (déjà une réponse de a)) ne
 * conviennent pas au papier — voir la section « Papier » plus bas. */
function construireEnonceComparaisonVecteurs(instance: ExerciceComparaisonVecteurs): SectionExercice {
  return enoncePapier(instance).section;
}

function construireCorrectionComparaisonVecteurs(instance: ExerciceComparaisonVecteurs): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgComparaison(instance, instance.labelsCorrects) },
    { type: "paragraphe", fragments: [texte("a) Vecteurs attendus : "), latex(formatVecteursAttendusLatex(instance.labelsCorrects)), texte(".")] },
    { type: "paragraphe", fragments: [texte("b) "), latex(egalitesLatex(instance)), texte(".")] },
  ];
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Deux VRAIES questions distinctes, gardées en a) b) : citer les vecteurs qui ont la propriété,
// puis exprimer chacun de ceux qui sont parallèles à la référence comme un multiple de celle-ci.
// L'écran demandait l'égalité d'UN vecteur nommé, déjà correct : sur papier, nommer ce vecteur
// révélerait une réponse de a) — la question b) porte donc sur tous les vecteurs parallèles trouvés
// (coefficients connus par construction : la référence est un vecteur de base, chaque parallèle en
// est un multiple `coefficientBase`). La figure (donnée) reste dans l'énoncé ; la figure avec les
// vecteurs attendus mis en évidence va dans le corrigé.

function enoncePapier(exercice: ExerciceComparaisonVecteurs): EnoncePapier {
  const consigne = consigneSelection(exercice);
  return {
    section: {
      enteteFragments: [texte("Voici plusieurs vecteurs tracés sur un quadrillage (seuls comptent la longueur, la direction et le sens de chaque vecteur, pas sa position).")],
      enteteHtml: construireSvgComparaison(exercice, []),
      questions: [
        { consigne: [texte(consigne.avant.replace("Sélectionne", "Cite")), latex(consigne.latex), texte(consigne.apres)] },
        {
          consigne: [
            ...(exercice.propriete === "longueur"
              ? [texte("Parmi les vecteurs cités, exprime chacun de ceux qui sont parallèles à "), latex(`\\vec{${exercice.labelReference}}`), texte(" sous la forme ")]
              : [texte("Exprime chacun des vecteurs cités sous la forme ")]),
            latex(`k\\,\\vec{${exercice.labelReference}}`),
            texte("."),
          ],
        },
      ],
    },
    etapesParQuestion: [["a"], ["b"]],
    reponseBreve: reponseBreve(exercice),
  };
}

function reponseBreve(exercice: ExerciceComparaisonVecteurs): FragmentConsigne[] {
  return [texte("a) "), latex(formatVecteursAttendusLatex(exercice.labelsCorrects)), texte(" ; b) "), latex(egalitesLatex(exercice))];
}

function bareme(exercice: ExerciceComparaisonVecteurs): BaremeExercice {
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Vecteurs cités, sans oubli ni intrus : "), latex(formatVecteursAttendusLatex(exercice.labelsCorrects))], points: 2 },
      { sousQuestion: "b", critere: [texte("Égalités : "), latex(egalitesLatex(exercice))], points: 2 },
    ],
    erreursFrequentes: [
      { description: [texte("Un vecteur oublié ou un intrus")], cout: "−0,5 chacun" },
      { description: [texte("Signe de k faux (sens opposé non pris en compte)")], cout: "−0,5 par égalité" },
    ],
  };
}

/** Niveau : deux écrans ; la sélection (composantes lues puis la même comparaison répétée pour
 * chaque vecteur) est une étape SANS charge, comme les « termes proches » ; méthode 0 ; piège dans
 * les données : « direction » et « sens » mêlent des vecteurs parallèles de sens opposés. */
function criteresDifficulte(exercice: ExerciceComparaisonVecteurs): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetailleeComparaisonVecteurs(exercice));
  return { ...base, lettresSansCharge: ["a"], methode: 0, piege: exercice.propriete === "longueur" ? 0 : 1, nombres: 0 };
}

export const adaptateurEvaluationComparaisonVecteurs: AdaptateurFeuilleExercices<ExerciceComparaisonVecteurs> = {
  titreDocument: "Comparaison visuelle de vecteurs sur figure — Évaluation",
  nomFichierBase: "comparaison-vecteurs",
  genererInstance: genererExerciceComparaisonVecteurs,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceComparaisonVecteurs,
  construireCorrection: construireCorrectionComparaisonVecteurs,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeComparaisonVecteurs,
  bareme,
  enoncePapier,
  profilInstance: profilComparaisonVecteurs,
  // 2 questions par instance, consigne de (a) dépendante de l'instance, `enteteHtml` (figure) :
  // 3 raisons indépendantes déjà suffisantes chacune — voir le commentaire de tête de fichier.
};
