import type { ConsigneRelationVectorielle } from "../../ui/formatRelationVectorielle";
import type { ExerciceRelationVectorielle } from "../../core/relationVectorielle.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { LIBELLE_CAS_ORIGINE, profilRelationVectorielle } from "../profilsEvaluation4eCh6";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { consigneRelationVectorielle, formatDonneesConnuesLatex, formatTraductionAttendueLatex, formeTraductionLatex } from "../../ui/formatRelationVectorielle";
import { nombreFrLatex } from "../../ui/nombreFr";
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

/** Virgule décimale, valeurs exactes (audit chapitre 6, point 14). */
function formatNombre(valeur: number): string {
  return nombreFrLatex(valeur);
}

/** Terme d'une somme : négatif entre parenthèses (« 6 + (−4) », jamais « 6 + -4 »). */
function formatTerme(valeur: number): string {
  return valeur < 0 ? `(${formatNombre(valeur)})` : formatNombre(valeur);
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
          latex(formeTraductionLatex(instance)),
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
            ` = (${formatNombre(point.x)} + ${formatTerme(translation.x)} ; ${formatNombre(point.y)} + ${formatTerme(translation.y)}) ` +
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

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Translation : un seul écran, l'énoncé papier est celui de l'écran. Relation générale : les deux
// écrans (traduction en différences de points, puis coordonnées) sont des étapes d'APPRENTISSAGE —
// sur papier l'énoncé garde les données, la relation et la seule question « coordonnées de F » ;
// la traduction devient l'étape 1 du corrigé. Valeurs : celles de l'instance (`reponse`).

/** Coefficient en LaTeX (fraction en \tfrac, jamais « 1/2 »), vide pour 1, « - » pour −1. */
function coefficientLatex(coef: number): string {
  if (coef === 1) return "";
  if (coef === -1) return "-";
  if (Number.isInteger(coef)) return String(coef);
  const [num, den] = formatFractionIrreductible(Math.abs(coef)).split("/");
  return `${coef < 0 ? "-" : ""}\\tfrac{${num}}{${den}}`;
}

/** Coefficient en facteur d'un produit : « \tfrac{1}{2} », « \left(-\tfrac{1}{3}\right) », « (−2) ». */
function facteurLatex(coef: number): string {
  if (Number.isInteger(coef)) return formatTerme(coef);
  const f = coefficientLatex(Math.abs(coef));
  return coef < 0 ? `\\left(-${f}\\right)` : f;
}

function pointLatex(label: string, p: { x: number; y: number }): string {
  return `${label}(${formatNombre(p.x)}\\,;\\,${formatNombre(p.y)})`;
}

function enoncePapier(instance: ExerciceRelationVectorielle): EnoncePapier {
  const consigne = consigneRelationVectorielle(instance);
  return {
    section: {
      enteteFragments: [texte("On donne "), latex(formatDonneesConnuesLatex(instance)), texte(". "), ...fragmentsDepuisConsigne(consigne)],
      questions: [],
    },
  };
}

function reponseBreve(instance: ExerciceRelationVectorielle): FragmentConsigne[] {
  return [latex(pointLatex(instance.pointCherche, instance.reponse))];
}

function correctionDetaillee(instance: ExerciceRelationVectorielle): EtapeCorrection[] {
  if (instance.variante === "translation") {
    const { labelPoint, point, translation, pointCherche } = instance;
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte("L'image d'un point par une translation s'obtient en ajoutant les composantes du vecteur aux coordonnées du point.")] },
      {
        label: "Calcul",
        sousQuestion: "a",
        fragments: [
          latex(
            `${pointCherche} = ${labelPoint} + \\begin{pmatrix} ${formatNombre(translation.x)} \\\\ ${formatNombre(translation.y)} \\end{pmatrix} = (${formatNombre(point.x)} + ${formatTerme(translation.x)}\\,;\\,${formatNombre(point.y)} + ${formatTerme(translation.y)})`,
          ),
        ],
      },
      { label: "Conclusion", sousQuestion: "a", fragments: reponseBreve(instance) },
      { label: "Piège", sousQuestion: "a", fragments: [texte("On AJOUTE le vecteur au point de départ : une composante négative se met entre parenthèses, sans changer de signe une seconde fois.")] },
    ];
  }
  const { labelOrigine, pointOrigine, labelConnu, pointConnu, coefficient, pointCherche } = instance;
  const dx = pointConnu.x - pointOrigine.x;
  const dy = pointConnu.y - pointOrigine.y;
  const k = coefficientLatex(coefficient);
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte("Un vecteur est la différence « extrémité moins origine » : "),
        latex(`\\vec{${labelOrigine}${pointCherche}} = ${pointCherche} - ${labelOrigine}`),
        texte(" et "),
        latex(`\\vec{${labelOrigine}${labelConnu}} = ${labelConnu} - ${labelOrigine}`),
        texte("."),
      ],
    },
    { label: "Traduction", sousQuestion: "a", fragments: [latex(`${pointCherche} - ${labelOrigine} = ${k}(${labelConnu} - ${labelOrigine})`)] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`${labelConnu} - ${labelOrigine} = (${formatNombre(dx)}\\,;\\,${formatNombre(dy)})`)] },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [
        latex(
          `${pointCherche} = ${labelOrigine} ${coefficient < 0 ? "-" : "+"} ${coefficientLatex(Math.abs(coefficient))}(${labelConnu} - ${labelOrigine}) = (${formatNombre(pointOrigine.x)} + ${facteurLatex(coefficient)} \\times ${formatTerme(dx)}\\,;\\,${formatNombre(pointOrigine.y)} + ${facteurLatex(coefficient)} \\times ${formatTerme(dy)})`,
        ),
      ],
    },
    { label: "Conclusion", sousQuestion: "b", fragments: reponseBreve(instance) },
    {
      label: "Piège",
      sousQuestion: "b",
      fragments: [
        texte("Le multiple de "),
        latex(`\\vec{${labelOrigine}${labelConnu}}`),
        texte(" s'ajoute aux coordonnées de "),
        latex(labelOrigine),
        texte(" (origine commune des deux vecteurs), jamais à celles de "),
        latex(labelConnu),
        texte("."),
      ],
    },
  ];
}

function bareme(instance: ExerciceRelationVectorielle): BaremeExercice {
  const x = latex(`x_{${instance.pointCherche}} = ${formatNombre(instance.reponse.x)}`);
  const y = latex(`y_{${instance.pointCherche}} = ${formatNombre(instance.reponse.y)}`);
  if (instance.variante === "translation") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Relation point de départ + vecteur de translation")], points: 1 },
        { sousQuestion: "a", critere: [texte("Abscisse : "), x], points: 1.5 },
        { sousQuestion: "a", critere: [texte("Ordonnée : "), y], points: 1.5 },
      ],
      erreursFrequentes: [
        { description: [texte("Vecteur soustrait au lieu d'être ajouté")], cout: "0 pt aux coordonnées" },
        { description: [texte("Erreur de signe sur une composante négative")], cout: "−1,5" },
      ],
      reponsesAcceptees: [[texte("Coordonnées en colonne ou sous forme de couple")]],
    };
  }
  return {
    reponseFinale: reponseBreve(instance),
    criteres: [
      { sousQuestion: "a", critere: [texte("Traduction : "), latex(`${instance.pointCherche} - ${instance.labelOrigine} = ${coefficientLatex(instance.coefficient)}(${instance.labelConnu} - ${instance.labelOrigine})`)], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Composantes de "), latex(`\\vec{${instance.labelOrigine}${instance.labelConnu}}`)], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Abscisse : "), x], points: 1 },
      { sousQuestion: "b", critere: [texte("Ordonnée : "), y], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Multiple du vecteur ajouté au mauvais point (l'extrémité au lieu de l'origine commune)")], cout: "−2" },
      { description: [texte("Coefficient fractionnaire ou négatif mal appliqué à une composante")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte("Calcul direct par les composantes, sans écrire la différence de points, s'il est correct")]],
  };
}

/** ★ translation ; ★★ relation générale (coefficient entier) ; ★★★ coefficient fractionnaire négatif. */
function difficulte(instance: ExerciceRelationVectorielle): 1 | 2 | 3 {
  if (instance.variante === "translation") return 1;
  return instance.coefficient < 0 && !Number.isInteger(instance.coefficient) ? 3 : 2;
}

export const adaptateurEvaluationRelationVectorielle: AdaptateurFeuilleExercices<ExerciceRelationVectorielle> = {
  titreDocument: "Point à partir d'une relation vectorielle — Évaluation",
  nomFichierBase: "relation-vectorielle",
  genererInstance: genererExerciceRelationVectorielle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceRelationVectorielle,
  construireCorrection: construireCorrectionRelationVectorielle,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 3,
  profilInstance: profilRelationVectorielle,
  libelleCasParticulier: LIBELLE_CAS_ORIGINE,
  // PAS regroupable — voir le commentaire de tête (consigne toujours dépendante de l'instance,
  // nombre de questions variable entre les 2 variantes).
};
