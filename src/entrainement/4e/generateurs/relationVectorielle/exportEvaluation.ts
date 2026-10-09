import type { ConsigneRelationVectorielle } from "../../ui/formatRelationVectorielle";
import type { ExerciceRelationVectorielle } from "../../core/relationVectorielle.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { consigneRelationVectorielle, formatDonneesConnuesLatex, formatTraductionAttendueLatex, placeholderTraduction } from "../../ui/formatRelationVectorielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelationVectorielle } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceRelationVectorielle>` pour gen21 (dossier
 * `generateurs/relationVectorielle/`, "Point à partir d'une relation vectorielle", version guidée,
 * `AppRelationVectorielle.tsx`/`moteur/sessionRelationVectorielle.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * **Distinct de gen20** (dossier `generateurs/pointVectoriel/`, même thème "Calcul vectoriel",
 * porté séparément) : deux modules totalement indépendants (aucun type ni fonction partagés, voir
 * `core/relationVectorielle.types.ts`), chacun avec son propre `exportEvaluation.ts`.
 *
 * **Écran → question(s), par variante** (`sessionRelationVectorielle.ts::phaseInitiale`) :
 * - `"translation"` : une seule phase `"coordonnees"` (pas d'étape de traduction pour un simple
 *   déplacement, `phaseInitiale` y saute directement) → **1 question** : "A a pour image A' par la
 *   translation de vecteur (a;b). Détermine les coordonnées de A'." — texte de consigne repris tel
 *   quel de `consigneRelationVectorielle` (écran), jamais reformulé indépendamment.
 * - `"relationGenerale"` (sous-formes `pointAPoint`/`milieu`, jamais distinguées côté papier — même
 *   traitement uniforme que côté écran) : deux phases successives `"traduction"` puis
 *   `"coordonnees"` → **2 questions** : a) traduire `\vec{BF}=k\vec{BE}` (ou `\vec{BM}=\frac12\vec{BE}`)
 *   en égalité entre différences de points (`F-B=k(E-B)`, ce que vérifie structurellement
 *   `verificationRelationVectorielle.ts::diagnostiquerTraduction` côté écran) ; b) en déduire les
 *   coordonnées du point cherché. Le format attendu en a) est donné via `placeholderTraduction`
 *   (mêmes lettres réelles de l'exercice, coefficient générique `k`) — exactement le placeholder du
 *   champ de saisie côté écran, jamais un nouveau texte inventé.
 *
 * **PAS `regroupable`** : deux raisons cumulatives, chacune suffisante à elle seule —
 * 1. La consigne n'est JAMAIS générique : elle mentionne toujours les valeurs tirées (labels de
 *    points, composantes de la translation ou coefficient de la relation), jamais une phrase
 *    constante indépendante de l'instance (condition explicite de `AdaptateurFeuilleExercices.regroupable`
 *    dans `genererFeuilleExercices.ts`).
 * 2. Le nombre de questions par instance n'est PAS constant : 1 pour `"translation"`, 2 pour
 *    `"relationGenerale"` — le mécanisme de regroupement suppose une question unique par instance.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`instance.reponse`, déjà calculée par `generateurs/relationVectorielle/index.ts` au tirage),
 * jamais recalculée indépendamment : réutilise directement les formateurs déjà utilisés côté écran
 * (`ui/formatRelationVectorielle.ts` — `formatDonneesConnuesLatex` pour le rappel des points connus
 * dans l'énoncé, `consigneRelationVectorielle` pour la consigne elle-même, `formatTraductionAttendueLatex`
 * pour la correction de la question a) de `"relationGenerale"`, déjà la même source que la
 * révélation du panneau de résultat après échec côté écran) plutôt que d'en reconstruire une
 * nouvelle. Seule la correction de la question b) (déduction des coordonnées à partir de la
 * traduction) est un texte nouveau : elle détaille le calcul `pointCherche = pointOrigine +
 * coefficient·(pointConnu − pointOrigine)`, exactement la formule utilisée pour calculer
 * `instance.reponse` dans `construireRelation` (`index.ts`), jamais un calcul indépendant qui
 * pourrait diverger.
 *
 * Aucune zone de réponse dédiée (`reponse` omis sur toutes les questions, même convention que
 * `generateurs/valeursRemarquables/exportEvaluation.ts`) : les réponses attendues sont courtes (un
 * couple de coordonnées, ou une égalité entre différences de points), la ligne vierge par défaut
 * d'`AdaptateurFeuilleExercices` (`genererFeuilleExercices.ts::construireZoneReponse`) suffit.
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** `{avant, latex, apres}` → `FragmentConsigne[]` — `latex` vaut toujours une chaîne non vide pour
 * ce générateur (jamais `null` en pratique, voir `consigneRelationVectorielle`), le garde `if`
 * couvre seulement le type `string | null` de l'interface, générique pour d'autres consommateurs. */
function fragmentsDepuisConsigne(c: ConsigneRelationVectorielle): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = [texte(c.avant)];
  if (c.latex) fragments.push(latex(c.latex));
  fragments.push(texte(c.apres));
  return fragments;
}

function construireEnonceRelationVectorielle(instance: ExerciceRelationVectorielle): SectionExercice {
  const consigne = consigneRelationVectorielle(instance);
  const donnees = latex(formatDonneesConnuesLatex(instance));

  if (instance.variante === "translation") {
    return {
      enteteFragments: [texte("On donne "), donnees, texte(".")],
      questions: [{ consigne: fragmentsDepuisConsigne(consigne) }],
    };
  }

  return {
    // `consigne.avant`/`consigne.latex` de `consigneRelationVectorielle` portent déjà la relation
    // vectorielle elle-même ("Sachant que \vec{BF}=k\vec{BE}") — repris ici dans l'entête (donnée
    // commune aux 2 questions), son `apres` ("détermine les coordonnées de F") en revanche N'EST
    // PAS repris : il fusionne traduction+coordonnées en une seule phrase (patron écran, une seule
    // phase visible après l'autre), jamais adapté ici où les 2 phases deviennent 2 questions papier
    // simultanément visibles — reformulées séparément ci-dessous.
    enteteFragments: [texte("On donne "), donnees, texte(". "), texte(consigne.avant), ...(consigne.latex ? [latex(consigne.latex)] : []), texte(".")],
    questions: [
      {
        consigne: [
          texte("Traduis cette relation vectorielle en une égalité entre différences de points, de la forme "),
          latex(placeholderTraduction(instance)),
          texte(" (remplace k par la valeur exacte du coefficient)."),
        ],
      },
      { consigne: [texte(`Déduis-en les coordonnées de ${instance.pointCherche}.`)] },
    ],
  };
}

function construireCorrectionRelationVectorielle(instance: ExerciceRelationVectorielle): BlocCorrection[] {
  if (instance.variante === "translation") {
    const { labelPoint, point, translation, pointCherche, reponse } = instance;
    return [
      {
        type: "paragraphe",
        fragments: [
          texte(`${pointCherche} = ${labelPoint} + `),
          latex(`\\begin{pmatrix} ${formatNombre(translation.x)} \\\\ ${formatNombre(translation.y)} \\end{pmatrix}`),
          texte(
            ` = (${formatNombre(point.x)} + ${formatNombre(translation.x)} ; ${formatNombre(point.y)} + ${formatNombre(translation.y)}) ` +
              `= (${formatNombre(reponse.x)} ; ${formatNombre(reponse.y)}).`,
          ),
        ],
      },
    ];
  }

  const { labelOrigine, pointOrigine, labelConnu, pointConnu, coefficient, pointCherche, reponse } = instance;
  // Même déplacement B→E que `construireRelation` (index.ts) — recalculé ici depuis les points déjà
  // tirés, jamais stocké séparément sur l'instance (pas de champ dupliqué dans le contrat).
  const dx = pointConnu.x - pointOrigine.x;
  const dy = pointConnu.y - pointOrigine.y;
  const coefTexte = formatFractionIrreductible(coefficient);

  return [
    {
      type: "paragraphe",
      fragments: [texte("a) "), latex(formatTraductionAttendueLatex(instance)), texte(".")],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("b) "),
        latex(`\\vec{${labelOrigine}${labelConnu}} = ${labelConnu} - ${labelOrigine} = (${formatNombre(dx)} ; ${formatNombre(dy)})`),
        texte(". Donc "),
        latex(
          `${pointCherche} - ${labelOrigine} = ${coefTexte}(${formatNombre(dx)} ; ${formatNombre(dy)}) = ` +
            `(${formatNombre(coefficient * dx)} ; ${formatNombre(coefficient * dy)})`,
        ),
        texte(", soit "),
        latex(`${pointCherche} = ${labelOrigine} + (${formatNombre(coefficient * dx)} ; ${formatNombre(coefficient * dy)}) = (${formatNombre(reponse.x)} ; ${formatNombre(reponse.y)})`),
        texte("."),
      ],
    },
  ];
}

export const adaptateurEvaluationRelationVectorielle: AdaptateurFeuilleExercices<ExerciceRelationVectorielle> = {
  titreDocument: "Point à partir d'une relation vectorielle — Évaluation",
  nomFichierBase: "relation-vectorielle",
  genererInstance: genererExerciceRelationVectorielle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceRelationVectorielle,
  construireCorrection: construireCorrectionRelationVectorielle,
  // PAS regroupable — voir le commentaire de tête (consigne toujours dépendante de l'instance,
  // nombre de questions variable entre les 2 variantes).
};
