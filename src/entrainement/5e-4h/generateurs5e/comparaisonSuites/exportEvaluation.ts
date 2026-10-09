import type { ExerciceComparaisonSuites, FamilleComparaisonSuites } from "../../core5e/comparaisonSuites.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneConclusion, consigneGenerale, consigneTableau, formatConclusionNLatex, formatTraductionAttendueTexte, labelU, labelV } from "../../ui5e/formatComparaisonSuites";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceComparaisonSuites } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComparaisonSuites>` pour 5gen18 (Comparaison
 * numérique de deux suites) — feuille d'évaluation. Séquence FIXE à 2 questions par instance,
 * calquée sur les 2 écrans réels de `App5gen18.tsx` (`tableau` → `conclusion`, voir
 * `EtapeTableauComparaisonSuites.tsx`/`EtapeConclusionComparaisonSuites.tsx`) :
 *   a) le tableau à 3 valeurs de n ([nSeuil-1, nSeuil, nSeuil+1]) × 2 suites (u_n, v_n) —
 *      transposé en 3 lignes (n / u_n / v_n) pour le format `ZoneReponse`/`BlocCorrection` de type
 *      "tableau" (une colonne d'étiquette + N colonnes de valeurs, même convention que
 *      `signesProduit/exportEvaluation.ts` : la ligne d'en-tête `n` devient une ligne de VALEURS,
 *      pas une ligne d'étiquettes répétée) ;
 *   b) l'indice n trouvé et sa traduction dans l'unité du contexte (année/mois) — les 2 étant
 *      exigés côté écran (`diagnostiquerConclusion`), les 2 sont redemandés ici.
 * Toutes les valeurs du corrigé sont lues directement sur l'instance (`uTable`/`vTable` arrondis à
 * l'unité près — même tolérance que `diagnostiquerTableau`, `TOLERANCE_ARRONDIE`
 * — `nSeuil`/`traductionValeur` déjà des entiers exacts), jamais recalculées indépendamment.
 * Non `regroupable` : 2 questions par instance (le mécanisme n'admet qu'UNE question générique).
 */

function construireEnonceComparaisonSuites(exercice: ExerciceComparaisonSuites): SectionExercice {
  return {
    enteteFragments: [texte(consigneGenerale(exercice))],
    questions: [
      {
        consigne: [texte(consigneTableau(exercice))],
        reponse: { type: "tableau", libellesLignes: ["n", labelU(exercice), labelV(exercice)], nombreColonnes: 3 },
      },
      {
        consigne: [texte(consigneConclusion(exercice))],
        reponse: { type: "lignes", nombre: 2 },
      },
    ],
  };
}

function construireCorrectionComparaisonSuites(exercice: ExerciceComparaisonSuites): BlocCorrection[] {
  return [
    {
      type: "tableau",
      libellesLignes: ["n", labelU(exercice), labelV(exercice)],
      valeursParLigne: [
        exercice.nTable.map((n) => String(n)),
        exercice.uTable.map((u) => String(Math.round(u))),
        exercice.vTable.map((v) => String(Math.round(v))),
      ],
    },
    {
      type: "paragraphe",
      fragments: [latex(formatConclusionNLatex(exercice)), texte(` — ${formatTraductionAttendueTexte(exercice)}`)],
    },
  ];
}

export const adaptateurEvaluationComparaisonSuites: AdaptateurFeuilleExercices<ExerciceComparaisonSuites> = {
  titreDocument: "Comparaison numérique de deux suites — Évaluation",
  nomFichierBase: "comparaison-suites",
  genererInstance: genererExerciceComparaisonSuites,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleComparaisonSuites),
  construireEnonce: construireEnonceComparaisonSuites,
  construireCorrection: construireCorrectionComparaisonSuites,
};
