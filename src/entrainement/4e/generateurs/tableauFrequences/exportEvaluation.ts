import type { ExerciceTableauFrequences } from "../../core/tableauFrequences.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { formatEnonceTexte } from "../../ui/formatTableauFrequences";
import { genererExerciceTableauFrequences } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTableauFrequences>` pour gen30 (Tableau de
 * fréquences, `AppTableauFrequences.tsx`) — voir `generateurs/analyseFonction/exportWord.ts` pour
 * le mécanisme générique de référence.
 *
 * Pas de `CATALOGUE_VARIANTES`/`construireAvecVarianteId` ici : `generateurs/tableauFrequences/index.ts`
 * n'exporte qu'un `genererExerciceTableauFrequences` sans argument (contrat lui-même documenté
 * "Aucun catalogue de variantes" en tête de `core/tableauFrequences.types.ts`, même exemption que
 * `caracteristiquesFonction/exportEvaluation.ts` pour gen12) — `catalogueVariantes`/
 * `genererInstanceAvecVariante` restent donc omis (contrat optionnel, voir `genererFeuilleExercices.ts`).
 *
 * L'écran interactif (`AppTableauFrequences.tsx`/`moteur/sessionTableauFrequences.ts`) déroule 4
 * phases successives sur la MÊME liste brute affichée en permanence (`identification` : valeurs
 * distinctes + effectifs ; `frequences` : fréquence % de chaque ligne ; `cumules` : effectif cumulé
 * de chaque ligne ; `frequencesCumulees` : fréquence cumulée de chaque ligne) — 4 colonnes d'UN seul
 * tableau de référence construites une par une (voir `core/tableauFrequences.types.ts::LigneFrequence`
 * et `ui/formatTableauFrequences.ts`). Contrairement à `simplification/exportEvaluation.ts` (3
 * sous-tâches à la consigne dépendante des valeurs tirées), ces 4 phases forment ICI une seule tâche
 * cohérente et indivisible sur papier — reconstruire le tableau de fréquences complet à partir de la
 * liste brute — donc UNE seule question par instance, à consigne GÉNÉRIQUE (jamais dépendante des
 * valeurs tirées : ni la liste brute ni le contexte n'apparaissent dans la consigne elle-même, qui
 * reste dans `enteteFragments`).
 *
 * `regroupable: true` : conséquence directe de ce qui précède (voir la doc de
 * `AdaptateurFeuilleExercices.regroupable` dans `genererFeuilleExercices.ts`) — une seule question
 * par instance, consigne générique et identique pour toutes les instances par construction, aucun
 * `enteteHtml` (le contexte + la liste brute suffisent en texte pur, comme à l'écran — voir
 * `EnonceTableauFrequences.tsx`). `/admin` de Math-Belgium peut donc regrouper plusieurs séries
 * demandées sous UNE seule consigne imprimée, chaque série devenant une ligne a)/b)/c)…
 *
 * Corrigé RESYNTHÉTISÉ depuis `instance.lignes` — seule source de vérité déjà calculée par
 * `genererExerciceTableauFrequences` (`generateurs/tableauFrequences/index.ts::construireLignes`),
 * jamais recalculée indépendamment ici : un tableau à 5 lignes (Valeur/Effectif/Fréquence/Effectif
 * cumulé/Fréquence cumulée) et une colonne par valeur distincte — même orientation (grandeurs en
 * lignes, valeurs/intervalles en colonnes) que `analyseFonction/exportWord.ts` et
 * `signesProduit/exportEvaluation.ts`, la plus lisible sur une feuille imprimée pour ce type de
 * tableau. Les pourcentages sont des décimales exactes par construction (voir le commentaire de
 * tête de `core/tableauFrequences.types.ts`), donc affichés tels quels via `formatNombre`, jamais
 * arrondis.
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

const CONSIGNE_GENERALE =
  "À partir de la liste brute ci-dessus, construis le tableau de fréquences complet de cette série : classe les valeurs distinctes par ordre croissant, puis donne, pour chacune, son effectif, sa fréquence (%), son effectif cumulé et sa fréquence cumulée (%).";

function construireEnonceTableauFrequences(instance: ExerciceTableauFrequences): SectionExercice {
  return {
    enteteFragments: [texte(`${formatEnonceTexte(instance)} ${instance.donneesBrutes.join(", ")}.`)],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }],
  };
}

function construireCorrectionTableauFrequences(instance: ExerciceTableauFrequences): BlocCorrection[] {
  const { lignes, n } = instance;

  const ligneValeur = lignes.map((l) => formatNombre(l.valeur));
  const ligneEffectif = lignes.map((l) => formatNombre(l.effectif));
  const ligneFrequence = lignes.map((l) => `${formatNombre(l.frequencePourcent)} %`);
  const ligneCumule = lignes.map((l) => formatNombre(l.effectifCumule));
  const ligneFrequenceCumulee = lignes.map((l) => `${formatNombre(l.frequenceCumulee)} %`);

  return [
    {
      type: "tableau",
      libellesLignes: ["Valeur", "Effectif", "Fréquence (%)", "Effectif cumulé", "Fréquence cumulée (%)"],
      valeursParLigne: [ligneValeur, ligneEffectif, ligneFrequence, ligneCumule, ligneFrequenceCumulee],
    },
    {
      type: "paragraphe",
      fragments: [
        texte(
          `Vérification : la somme des effectifs vaut ${n} (taille de l'échantillon) et le dernier effectif cumulé comme la dernière fréquence cumulée valent respectivement ${n} et 100 %.`,
        ),
      ],
    },
  ];
}

export const adaptateurEvaluationTableauFrequences: AdaptateurFeuilleExercices<ExerciceTableauFrequences> = {
  titreDocument: "Tableau de fréquences — Évaluation",
  nomFichierBase: "tableau-frequences",
  genererInstance: genererExerciceTableauFrequences,
  construireEnonce: construireEnonceTableauFrequences,
  construireCorrection: construireCorrectionTableauFrequences,
  regroupable: true,
};
