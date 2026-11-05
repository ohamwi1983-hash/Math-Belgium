import type { ExerciceDispersion } from "../../core/dispersion.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte, latex } from "../../../export/fragmentsDocx";
import {
  LABEL_ECART_TYPE,
  LABEL_EFFECTIF_NI,
  LABEL_PRODUIT,
  LABEL_SOMME_N,
  LABEL_SOMME_PRODUIT,
  LABEL_VALEUR_XI,
  LABEL_VARIANCE,
  LABEL_XBAR,
  formatEcartTypeAttendueTexte,
  formatNombreLatex,
  formatVarianceAttendueTexte,
} from "../../ui/formatDispersion";
import { genererExerciceDispersion } from "./index";
import { aupresDesPopulationMajuscule } from "../../ui/phrasesContexteStatistique";
import { avecVirgulesBelges, nombreFrLatex, segmentEnVirgules } from "../../ui/nombreFr";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDispersion>` pour gen34 (Paramètres de dispersion —
 * étendue/variance/écart-type, `AppDispersion.tsx`) — voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence.
 *
 * Pas de `CATALOGUE_VARIANTES`/`construireAvecVarianteId` ici : `generateurs/dispersion/index.ts`
 * n'exporte QUE `genererExerciceDispersion`, sans argument — confirmé par lecture directe du fichier
 * (aucun `CATALOGUE_VARIANTES` exporté), et explicitement documenté en tête de
 * `core/dispersion.types.ts` ("pas de variante avec classes groupées ... aucun `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId` nécessaire, même exemption que 'Caractéristiques d'une fonction'/
 * 'Étendue et écart interquartile' — pas d'axe de technique/méthode discret, seule la variété
 * numérique du tirage"). `catalogueVariantes`/`genererInstanceAvecVariante` restent donc omis
 * (contrat optionnel, voir `genererFeuilleExercices.ts`).
 *
 * NB : malgré son ancien nom de couche ("Paramètres de dispersion") et le libellé générique du lot
 * de portage, ce générateur précis ne couvre PAS l'étendue — vérifié en lisant
 * `core/dispersion.types.ts`/`generateurs/dispersion/index.ts`/`moteur/verificationDispersion.ts` :
 * `ExerciceDispersion` n'expose que `xBar` (donné), le tableau `lignes` (x_i/n_i), les deux sommes
 * intermédiaires (`n`, `sommeProduits`) et les deux résultats finaux (`varianceAttendue`,
 * `ecartTypeAttendu`). L'étendue est couverte par un AUTRE générateur du même chapitre ("Étendue et
 * écart interquartile", cité ci-dessus) — jamais dupliquée ici.
 *
 * Écran → question — 2 phases FIXES de `moteur/sessionDispersion.ts`, toujours dans le même ordre,
 * reproduites en 2 questions papier (jamais fusionnées, contrairement à
 * `histogramme/exportEvaluation.ts` où "classement" pouvait fusionner avec "trace") :
 * - a) écran "tableau" (`EtapeTableauDispersion.tsx`) : un produit `(x_i-x̄)²·n_i` par ligne de
 *   données, plus les deux totaux `Σn_i`/`Σ(x_i-x̄)²·n_i`.
 * - b) écran "varianceEcartType" (`EtapeVarianceEcartTypeDispersion.tsx`) : la variance `V`, puis
 *   l'écart-type `σ=√V`, à partir des deux totaux de a) — toujours la phase terminale.
 *
 * PAS `regroupable` : 2 questions par instance (déjà, à elle seule, une des 2 conditions qui
 * désactivent ce mécanisme — voir la doc de `AdaptateurFeuilleExercices.regroupable` dans
 * `genererFeuilleExercices.ts`) ; la consigne de b) mentionne en outre `contexte.unite` (ex.
 * "en années²"/"en kg"), donc jamais GÉNÉRIQUE au sens de ce mécanisme (dépend de l'instance tirée).
 *
 * Aucune `ZoneReponse` sur les 2 questions (contrat par défaut : 1 ligne vierge, jamais davantage) —
 * même décision que `histogramme/exportEvaluation.ts` (même chapitre, même esprit : reconstruire un
 * tableau à colonnes variables (ici, une colonne par ligne de données — 4 à 6 selon l'instance, voir
 * `K_MIN`/`K_MAX` dans `generateurs/dispersion/index.ts`) ne peut de toute façon pas être contraint à
 * une largeur imprimée fixe (`ZoneReponse.tableau` suppose un nombre de colonnes connu À L'AVANCE
 * par l'adaptateur, pas par question papier ouverte) — l'élève répond entièrement sur une copie
 * séparée, y compris pour le tableau et les deux calculs finaux.
 *
 * Corrigé RESYNTHÉTISÉ depuis les valeurs déjà connues de l'instance (`instance.lignes`,
 * `instance.n`, `instance.sommeProduits`, `instance.varianceAttendue`, `instance.ecartTypeAttendu`),
 * jamais recalculé indépendamment ici : le tableau complété (a) réutilise directement
 * `ligne.produitAttendu` par colonne (même orientation "grandeurs en lignes, valeurs en colonnes"
 * que `analyseFonction/exportWord.ts`/`tableauFrequences/exportEvaluation.ts`, une colonne
 * supplémentaire "Σ" portant les deux totaux — même convention que les colonnes -∞/+∞ dédiées de
 * `analyseFonction/exportWord.ts`) ; le calcul de b) réutilise directement
 * `formatVarianceAttendueTexte`/`formatEcartTypeAttendueTexte` (`ui/formatDispersion.ts`), déjà les
 * textes de RÉVÉLATION affichés côté écran dans le panneau de résultat après échec
 * (`ResultatPanelDispersion.tsx`) — même source de vérité que l'écran pour le signe "="/"≈" (aucun
 * arrondi réel n'a réellement eu lieu vs un arrondi qui a changé la valeur), jamais une nouvelle
 * synthèse ad hoc.
 */

function formatNombre(valeur: number): string {
  return String(valeur);
}

const CONSIGNE_TABLEAU = [
  texte("Reconstruis le tableau ci-dessous : une colonne par donnée (dans l'ordre où elles sont données ci-dessus), plus une dernière colonne pour les totaux. Pour chaque colonne de donnée, recopie "),
  latex(LABEL_VALEUR_XI),
  texte(" et "),
  latex(LABEL_EFFECTIF_NI),
  texte(", puis calcule "),
  latex(LABEL_PRODUIT),
  texte(". Dans la dernière colonne, donne les deux totaux "),
  latex(LABEL_SOMME_N),
  texte(" et "),
  latex(LABEL_SOMME_PRODUIT),
  texte("."),
];

function consigneVarianceEcartType(instance: ExerciceDispersion) {
  const { unite } = instance.contexte;
  return [
    texte("Calcule la variance "),
    latex(LABEL_VARIANCE),
    texte(` à partir des deux totaux trouvés ci-dessus (arrondie à la 2e décimale, en ${unite}²), puis déduis-en l'écart-type `),
    latex(`${LABEL_ECART_TYPE}=\\sqrt{${LABEL_VARIANCE}}`),
    texte(` (arrondi à la 2e décimale, en ${unite}).`),
  ];
}

function construireEnonceDispersion(instance: ExerciceDispersion): SectionExercice {
  const { contexte, xBar, lignes } = instance;
  const listeDonnees = lignes.map((l) => `x = ${formatNombre(l.valeur)} (n = ${formatNombre(l.effectif)})`).join(", ");

  return {
    enteteFragments: [
      texte(`${aupresDesPopulationMajuscule(contexte)}, ${contexte.caractereDefini} ${contexte.moyenAccord} est `),
      latex(`${LABEL_XBAR} = ${xBar}\\text{ ${contexte.unite}}`),
      texte(`. Voici les données (valeur observée x, effectif n) : ${listeDonnees}.`),
    ],
    questions: [{ consigne: CONSIGNE_TABLEAU }, { consigne: consigneVarianceEcartType(instance) }],
  };
}

function construireCorrectionDispersion(instance: ExerciceDispersion): BlocCorrection[] {
  const { lignes, n, sommeProduits, varianceAttendue } = instance;

  const ligneX = lignes.map((l) => formatNombre(l.valeur)).concat("");
  const ligneN = lignes.map((l) => formatNombre(l.effectif)).concat(formatNombre(n));
  const ligneProduit = lignes.map((l) => formatNombre(l.produitAttendu)).concat(formatNombre(sommeProduits));

  return [
    { type: "paragraphe", fragments: [texte("a) Tableau complété (dernière colonne = totaux) :")] },
    {
      type: "tableau",
      libellesLignes: ["xᵢ", "nᵢ", "(xᵢ-x̄)²·nᵢ"],
      valeursParLigne: [ligneX, ligneN, ligneProduit],
    },
    {
      type: "paragraphe",
      fragments: [texte(`Donc `), latex(`${LABEL_SOMME_N} = ${n}`), texte(" et "), latex(`${LABEL_SOMME_PRODUIT} = ${sommeProduits}`), texte(".")],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("b) "),
        latex(`${LABEL_VARIANCE} = \\dfrac{${LABEL_SOMME_PRODUIT}}{${LABEL_SOMME_N}} = \\dfrac{${sommeProduits}}{${n}}`),
        texte(`, donc ${formatVarianceAttendueTexte(instance)} ${instance.contexte.unite}². `),
        latex(`${LABEL_ECART_TYPE} = \\sqrt{${LABEL_VARIANCE}} = \\sqrt{${formatNombreLatex(varianceAttendue)}}`),
        texte(`, donc ${formatEcartTypeAttendueTexte(instance)} ${instance.contexte.unite}.`),
      ],
    },
  ];
}

// ============================================================================
// Feuilles enrichies (énoncé papier, réponse brève, corrigé détaillé, barème) — voir
// `.claude/rules/feuilles-evaluations.md`. Étapes du corrigé = les 2 questions de
// `construireEnonce` (a : tableau et totaux ; b : variance et écart-type). Valeurs de l'instance
// (produits entiers, variance puis écart-type arrondis en cascade, comme à l'écran).
// ============================================================================

function enVirgules(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map(segmentEnVirgules);
}

/** Tableau DONNÉ x_i / n_i (une colonne par valeur), pour l'énoncé papier. */
function tableauDonneesLatex(instance: ExerciceDispersion): string {
  const colonnes = "c".repeat(instance.lignes.length);
  const ligneX = instance.lignes.map((l) => nombreFrLatex(l.valeur)).join(" & ");
  const ligneN = instance.lignes.map((l) => nombreFrLatex(l.effectif)).join(" & ");
  return `\\begin{array}{c|${colonnes}}${LABEL_VALEUR_XI} & ${ligneX}\\\\\\hline ${LABEL_EFFECTIF_NI} & ${ligneN}\\end{array}`;
}

/** Tableau complété du corrigé (dernière colonne = totaux). */
function tableauCompleteLatex(instance: ExerciceDispersion): string {
  const colonnes = "c".repeat(instance.lignes.length + 1);
  const ligneX = instance.lignes.map((l) => nombreFrLatex(l.valeur)).join(" & ");
  const ligneN = instance.lignes.map((l) => nombreFrLatex(l.effectif)).join(" & ");
  const ligneP = instance.lignes.map((l) => nombreFrLatex(l.produitAttendu)).join(" & ");
  return `\\begin{array}{c|${colonnes}}${LABEL_VALEUR_XI} & ${ligneX} & \\text{Total}\\\\\\hline ${LABEL_EFFECTIF_NI} & ${ligneN} & ${instance.n}\\\\\\hline ${LABEL_PRODUIT} & ${ligneP} & ${instance.sommeProduits}\\end{array}`;
}

function egalOuEnviron(valeurArrondie: number, valeurExacte: number): string {
  return Math.abs(valeurArrondie - valeurExacte) < 1e-9 ? "=" : "\\approx";
}

function enoncePapierDispersion(instance: ExerciceDispersion): EnoncePapier {
  const { contexte, xBar } = instance;
  return {
    section: {
      enteteFragments: enVirgules([
        texte(`${aupresDesPopulationMajuscule(contexte)}, ${contexte.caractereDefini} ${contexte.moyenAccord} est `),
        latex(`${LABEL_XBAR} = ${nombreFrLatex(xBar)}`),
        texte(` ${contexte.unite}. Voici la répartition des données (valeur observée, effectif) : `),
        latex(tableauDonneesLatex(instance)),
      ]),
      questions: [
        {
          consigne: [
            texte("Calcule la variance "),
            latex(LABEL_VARIANCE),
            texte(` (en ${contexte.unite}²) puis l'écart-type `),
            latex(LABEL_ECART_TYPE),
            texte(` (en ${contexte.unite}) de cette série, arrondis à la 2e décimale.`),
          ],
        },
      ],
    },
    etapesParQuestion: [["a", "b"]],
  };
}

function reponseBreveDispersion(instance: ExerciceDispersion): FragmentConsigne[] {
  const u = instance.contexte.unite;
  const vExact = instance.sommeProduits / instance.n;
  return enVirgules([
    latex(`${LABEL_VARIANCE} ${egalOuEnviron(instance.varianceAttendue, vExact)} ${nombreFrLatex(instance.varianceAttendue)}`),
    texte(` ${u}² ; `),
    latex(`${LABEL_ECART_TYPE} ${egalOuEnviron(instance.ecartTypeAttendu, Math.sqrt(instance.varianceAttendue))} ${nombreFrLatex(instance.ecartTypeAttendu)}`),
    texte(` ${u}`),
  ]);
}

function correctionDetailleeDispersion(instance: ExerciceDispersion): EtapeCorrection[] {
  const { n, sommeProduits, varianceAttendue, ecartTypeAttendu, xBar } = instance;
  const u = instance.contexte.unite;
  const vExact = sommeProduits / n;
  const exemple = instance.lignes[0];
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte("Pour chaque valeur, on calcule "),
        latex(LABEL_PRODUIT),
        texte(", puis les totaux "),
        latex(LABEL_SOMME_N),
        texte(" et "),
        latex(LABEL_SOMME_PRODUIT),
        texte(". Par exemple, "),
        latex(`(${nombreFrLatex(exemple.valeur)}-${nombreFrLatex(xBar)})^2 \\cdot ${exemple.effectif} = ${nombreFrLatex(exemple.produitAttendu)}`),
        texte("."),
      ],
    },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(tableauCompleteLatex(instance))] },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(`${LABEL_SOMME_N} = ${n}`), texte(" et "), latex(`${LABEL_SOMME_PRODUIT} = ${sommeProduits}`), texte(".")] },
    {
      label: "Méthode",
      sousQuestion: "b",
      fragments: [latex(`${LABEL_VARIANCE} = \\dfrac{${LABEL_SOMME_PRODUIT}}{${LABEL_SOMME_N}}`), texte(" puis "), latex(`${LABEL_ECART_TYPE} = \\sqrt{${LABEL_VARIANCE}}`), texte(".")],
    },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [
        latex(`${LABEL_VARIANCE} = \\dfrac{${sommeProduits}}{${n}} ${egalOuEnviron(varianceAttendue, vExact)} ${nombreFrLatex(varianceAttendue)}`),
        texte(` ${u}² ; `),
        latex(`${LABEL_ECART_TYPE} = \\sqrt{${nombreFrLatex(varianceAttendue)}} ${egalOuEnviron(ecartTypeAttendu, Math.sqrt(varianceAttendue))} ${nombreFrLatex(ecartTypeAttendu)}`),
        texte(` ${u}.`),
      ],
    },
    {
      label: "Conclusion",
      sousQuestion: "b",
      fragments: [
        latex(`${LABEL_VARIANCE} ${egalOuEnviron(varianceAttendue, vExact)} ${nombreFrLatex(varianceAttendue)}`),
        texte(` ${u}² et `),
        latex(`${LABEL_ECART_TYPE} ${egalOuEnviron(ecartTypeAttendu, Math.sqrt(varianceAttendue))} ${nombreFrLatex(ecartTypeAttendu)}`),
        texte(` ${u}.`),
      ],
    },
    {
      label: "Piège",
      fragments: [
        texte("On divise par l'effectif total "),
        latex(LABEL_SOMME_N),
        texte(` (ici ${n}), pas par le nombre de valeurs distinctes (${instance.lignes.length}) ; et l'écart-type est la racine carrée de la variance.`),
      ],
    },
  ];
  return etapes.map((e) => ({ ...e, fragments: enVirgules(e.fragments) }));
}

function baremeDispersion(instance: ExerciceDispersion): BaremeExercice {
  return {
    reponseFinale: reponseBreveDispersion(instance),
    criteres: [
      { sousQuestion: "a", critere: enVirgules([texte("Produits "), latex(LABEL_PRODUIT), texte(" corrects")]), points: 1 },
      { sousQuestion: "a", critere: enVirgules([texte("Totaux "), latex(`${LABEL_SOMME_N} = ${instance.n}`), texte(" et "), latex(`${LABEL_SOMME_PRODUIT} = ${instance.sommeProduits}`)]), points: 1 },
      { sousQuestion: "b", critere: enVirgules([texte("Variance "), latex(`${LABEL_VARIANCE} = \\dfrac{${LABEL_SOMME_PRODUIT}}{${LABEL_SOMME_N}}`)]), points: 1 },
      { sousQuestion: "b", critere: enVirgules([texte("Écart-type "), latex(`${LABEL_ECART_TYPE} = \\sqrt{${LABEL_VARIANCE}}`)]), points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Écarts à la moyenne non élevés au carré, ou non multipliés par l'effectif")], cout: "0 pt sur les produits" },
      { description: [texte(`Division par le nombre de valeurs distinctes (${instance.lignes.length}) au lieu de l'effectif total (${instance.n})`)], cout: "0 pt sur la variance" },
      { description: [texte("Écart-type pris égal à la variance (racine oubliée)")], cout: "0 pt sur l'écart-type" },
    ],
    reponsesAcceptees: [[texte("Écart-type calculé à partir de la variance non arrondie (écart au centième près)")]],
  };
}

const adaptateurEvaluationDispersionBrut: AdaptateurFeuilleExercices<ExerciceDispersion> = {
  titreDocument: "Paramètres de dispersion (variance, écart-type) — Évaluation",
  nomFichierBase: "parametres-dispersion",
  genererInstance: genererExerciceDispersion,
  construireEnonce: construireEnonceDispersion,
  construireCorrection: construireCorrectionDispersion,
  // 2 questions substantielles par instance (tableau + totaux, puis variance/écart-type), consigne
  // de b) dépendante de `contexte.unite` — jamais un unique écran générique : voir le commentaire de
  // tête.
};

/** Notation décimale belge (virgule) dans tout l'énoncé et la correction (audit chapitre 4). */
export const adaptateurEvaluationDispersion: AdaptateurFeuilleExercices<ExerciceDispersion> = {
  ...avecVirgulesBelges(adaptateurEvaluationDispersionBrut),
  difficulte: () => 2,
  reponseBreve: reponseBreveDispersion,
  correctionDetaillee: correctionDetailleeDispersion,
  bareme: baremeDispersion,
  enoncePapier: enoncePapierDispersion,
  dureeMinutes: 7,
};
