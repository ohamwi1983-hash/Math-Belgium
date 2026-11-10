import type { ExerciceTableauFrequences } from "../../core/tableauFrequences.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatEnonceTexte } from "../../ui/formatTableauFrequences";
import { genererExerciceTableauFrequences } from "./index";
import { avecVirgulesBelges, nombreFr, nombreFrLatex } from "../../ui/nombreFr";
import { profilTableauFrequences } from "../profilsEvaluationStatistique";

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
  "Construis le tableau de fréquences complet de cette série : range les valeurs distinctes par ordre croissant, puis donne, pour chacune, son effectif, sa fréquence (en %), son effectif cumulé et sa fréquence cumulée (en %).";

function construireEnonceTableauFrequences(instance: ExerciceTableauFrequences): SectionExercice {
  return {
    enteteFragments: [texte(`${formatEnonceTexte(instance)} ${instance.donneesBrutes.map(nombreFr).join(" ; ")}.`)],
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

// ============================================================================
// Feuilles enrichies (difficulté, réponse brève, corrigé détaillé, barème, énoncé papier). Tout
// vient de `instance.lignes` (la table de référence du générateur, la même que celle de l'écran) ;
// nombres en notation belge (`nombreFr`/`nombreFrLatex`) — ces champs ne passent pas par
// `avecVirgulesBelges`, qui ne convertit que `construireEnonce`/`construireCorrection`.
// ============================================================================

/** Tableau de fréquences complet en LaTeX (grandeurs en lignes, valeurs en colonnes, notations de
 * l'écran x_i, n_i, f_i, v_i, φ_i). */
function tableauFrequencesLatex(instance: ExerciceTableauFrequences): string {
  const { lignes } = instance;
  const rangees: [string, string[]][] = [
    ["x_i", lignes.map((l) => nombreFrLatex(l.valeur))],
    ["n_i", lignes.map((l) => nombreFrLatex(l.effectif))],
    ["f_i\\ (\\%)", lignes.map((l) => nombreFrLatex(l.frequencePourcent))],
    ["v_i", lignes.map((l) => nombreFrLatex(l.effectifCumule))],
    ["\\varphi_i\\ (\\%)", lignes.map((l) => nombreFrLatex(l.frequenceCumulee))],
  ];
  return `\\begin{array}{l|${"c".repeat(lignes.length)}} ${rangees.map(([tete, cellules]) => [tete, ...cellules].join(" & ")).join(" \\\\ \\hline ")} \\end{array}`;
}

/** ★ : n = 10 ou 20 (fréquences « rondes ») et au plus 5 valeurs ; ★★ : n = 16 ou 25 (fréquences
 * décimales, 6,25 % ou 4 %) ou 6 valeurs distinctes à cumuler. */
function difficulteTableauFrequences(instance: ExerciceTableauFrequences): 1 | 2 | 3 {
  return (instance.n === 10 || instance.n === 20) && instance.lignes.length <= 5 ? 1 : 2;
}

function reponseBreveTableauFrequences(instance: ExerciceTableauFrequences): FragmentConsigne[] {
  return [latex(tableauFrequencesLatex(instance))];
}

function correctionDetailleeTableauFrequences(instance: ExerciceTableauFrequences): EtapeCorrection[] {
  const { lignes, n } = instance;
  const premiere = lignes[0];
  return [
    {
      label: "Valeurs",
      fragments: [
        texte(`On range les ${lignes.length} valeurs distinctes de la liste par ordre croissant et on compte les occurrences de chacune (effectif `),
        latex("n_i"),
        texte(`) ; la somme des effectifs vaut n = ${nombreFr(n)}.`),
      ],
    },
    { label: "Fréquences", fragments: [texte("Fréquence d'une valeur, en % : "), latex("f_i = \\dfrac{n_i}{n} \\times 100"), texte(".")] },
    {
      label: "Cumuls",
      fragments: [
        texte("Effectif cumulé : effectif cumulé de la ligne précédente + effectif de la ligne ; pour la première valeur, "),
        latex(`v_1 = n_1 = ${nombreFrLatex(premiere.effectif)}`),
        texte(". La fréquence cumulée se construit de la même façon avec les fréquences."),
      ],
    },
    { label: "Tableau", fragments: [latex(tableauFrequencesLatex(instance))] },
    {
      label: "Vérification",
      fragments: [texte(`Le dernier effectif cumulé vaut n = ${nombreFr(n)} et la dernière fréquence cumulée vaut 100 %.`)],
    },
    {
      label: "Piège",
      fragments: [texte("Les cumuls se calculent dans l'ordre CROISSANT des valeurs, jamais dans l'ordre de la liste brute.")],
    },
  ];
}

function baremeTableauFrequences(instance: ExerciceTableauFrequences): BaremeExercice {
  return {
    reponseFinale: [latex(tableauFrequencesLatex(instance))],
    criteres: [
      { critere: [texte("Valeurs distinctes rangées par ordre croissant, effectifs corrects (somme = n)")], points: 1 },
      { critere: [texte("Fréquences en % : "), latex("f_i = \\dfrac{n_i}{n} \\times 100")], points: 1 },
      { critere: [texte("Effectifs cumulés (le dernier vaut n)")], points: 1 },
      { critere: [texte("Fréquences cumulées (la dernière vaut 100 %)")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Cumuls calculés dans l'ordre de la liste brute, sans trier les valeurs")], cout: "0 pt sur les deux colonnes de cumuls" },
      { description: [texte(`Fréquence calculée en divisant par le nombre de valeurs distinctes (${instance.lignes.length}) au lieu de n = ${nombreFr(instance.n)}`)], cout: "0 pt sur les fréquences, cumuls notés sans double pénalité" },
      { description: [texte("Une valeur distincte oubliée")], cout: "−0,5 sur les effectifs, suite notée sans double pénalité" },
    ],
    reponsesAcceptees: [[texte("Fréquences en écriture décimale (0,15 au lieu de 15 %) si elles sont cohérentes")], [texte("Tableau disposé en colonnes plutôt qu'en lignes")]],
  };
}

/** Une seule consigne (celle de `construireEnonce`) : identifier, fréquences, cumuls et fréquences
 * cumulées ne sont qu'une tâche — reconstruire LE tableau de fréquences. */
function enoncePapierTableauFrequences(instance: ExerciceTableauFrequences): EnoncePapier {
  return { section: construireEnonceTableauFrequences(instance), etapesParQuestion: [["a"]] };
}

const adaptateurEvaluationTableauFrequencesBrut: AdaptateurFeuilleExercices<ExerciceTableauFrequences> = {
  profilInstance: profilTableauFrequences,
  titreDocument: "Tableau de fréquences — Évaluation",
  nomFichierBase: "tableau-frequences",
  genererInstance: genererExerciceTableauFrequences,
  construireEnonce: construireEnonceTableauFrequences,
  construireCorrection: construireCorrectionTableauFrequences,
  difficulte: difficulteTableauFrequences,
  reponseBreve: reponseBreveTableauFrequences,
  correctionDetaillee: correctionDetailleeTableauFrequences,
  bareme: baremeTableauFrequences,
  enoncePapier: enoncePapierTableauFrequences,
  dureeMinutes: 6,
  regroupable: true,
};

/** Notation décimale belge (virgule) dans tout l'énoncé et la correction (audit chapitre 4). */
export const adaptateurEvaluationTableauFrequences: AdaptateurFeuilleExercices<ExerciceTableauFrequences> = avecVirgulesBelges(adaptateurEvaluationTableauFrequencesBrut);
