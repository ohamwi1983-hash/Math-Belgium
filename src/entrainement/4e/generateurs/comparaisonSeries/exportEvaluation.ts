import type {
  ExerciceComparaisonSeries,
  QuestionComparaisonSeries,
  QuestionSeuil,
  SerieComparaison,
} from "../../core/comparaisonSeries.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, ErreurFrequente, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  formatEnonceTexte,
  segmentsCentrageAttendu,
  segmentsConsigneCentrage,
  segmentsConsigneDispersion,
  segmentsConsigneInterpretation,
  segmentsConsigneSeuil,
  segmentsDispersionAttendu,
  segmentsInterpretationAttendu,
  segmentsSeuilAttendu,
  texteProfilSerie,
  type SegmentTexte,
} from "../../ui/formatComparaisonSeries";
import { construireSvgCourbesCumulees, type MarqueurCourbeCumulee } from "../../ui/figureComparaisonSeries";
import { correctionDetailleeComparaisonSeries, texteReponseSeuil } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparaisonSeries } from "./index";
import { avecVirgulesBelges, segmentEnVirgules } from "../../ui/nombreFr";
import { profilComparaisonSeries, LIBELLE_CAS_COMPARAISON } from "../profilsEvaluationStatistique";


/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComparaisonSeries>` pour gen38 (Comparaison de
 * deux séries statistiques, `AppComparaisonSeries.tsx`) — voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence.
 *
 * **Deux axes de variation indépendants sur `ExerciceComparaisonSeries`** (voir
 * `core/comparaisonSeries.types.ts`, en tête) :
 * - `variante` (le catalogue forçable, `CATALOGUE_VARIANTES` réexporté tel quel) — pilote
 *   uniquement la PRÉSENTATION des données déjà tirées (tableaux x_i/n_i bruts, tableau
 *   récapitulatif déjà calculé, ou courbes cumulées) ; jamais les données elles-mêmes, toujours
 *   les MÊMES pour les 3 variantes (voir `construireAvecVarianteId`, `generateurs/comparaisonSeries/index.ts`).
 * - `question.type` (`"centrage" | "dispersion" | "seuil" | "interpretation"`, tiré par
 *   `construireQuestion` PARMI les types compatibles avec la variante active, `TYPES_COMPATIBLES`)
 *   — pilote la consigne/la correction. Ce n'est PAS un second catalogue forçable exposé côté
 *   `/admin` de Math-Belgium (pas d'entrée `CatalogueVarianteEntree` dédiée) : seule `variante` est
 *   forçable via `catalogueVariantes`/`genererInstanceAvecVariante` ci-dessous, exactement comme
 *   côté écran (`SelecteurVarianteDev` de `AppComparaisonSeries.tsx` ne force, lui non plus, que
 *   `varianteId`, jamais le type de question tiré à l'intérieur).
 *
 * **Consignes/réponses "attendues" RÉUTILISÉES telles quelles** depuis `ui/formatComparaisonSeries.ts`
 * (`segmentsConsigneXxx`/`segmentsXxxAttendu`, déjà la formulation exacte vue par l'élève à l'écran
 * et déjà couverte par les tests de ce module) plutôt que réécrites ici — seul un petit adaptateur
 * `segmentVersFragment` fait le pont entre `SegmentTexte` (texte/katex, écran) et `FragmentConsigne`
 * (texte/latex, export), les deux étant structurellement le même contrat texte+LaTeX sous des noms
 * de tag différents. Le reste de la correction (comparaisons numériques σ/écart interquartile,
 * lecture de seuil détaillée, profils des deux séries) est RESYNTHÉTISÉ depuis les champs déjà
 * connus de l'instance (`SerieComparaison`), jamais recalculé indépendamment — même principe que
 * `simplification/exportEvaluation.ts`.
 *
 * **Graphique (`variante==="graphique"`)** — aucun helper de tracé "courbe cumulée" existant dans
 * `export/svgGraph.ts` (conçu pour UNE fonction réelle échantillonnée `x=>y`, pas pour un polygone
 * de points discrets ni pour 2 séries superposées) : `construireSvgCourbesCumulees` ci-dessous est
 * un moteur de tracé dédié, mais qui RÉUTILISE la géométrie déjà pure et testée de
 * `ui/comparaisonSeriesGraph.ts` (`pointsCourbeCumulee`/`calculerViewBoxComparaisonSeries`, la MÊME
 * source que `ComparaisonSeriesGraph.tsx` côté écran) — seul le rendu SVG (grille, cadre, polyligne,
 * étiquettes) est nouveau, jamais la géométrie. Couleurs alignées sur l'écran
 * (`ComparaisonSeriesGraph.tsx::COULEUR_A/COULEUR_B`, dupliquées ici — petites constantes locales,
 * même principe que le reste du projet). Contrairement à `svgGraph.ts` (axes tracés à x=0/y=0, la
 * fonction traversant toujours l'origine visuellement), les valeurs `x` d'un contexte narratif (ex.
 * "taille en cm") ne croisent quasiment jamais 0 : un CADRE rectangulaire (ticks bas/gauche) est
 * utilisé à la place d'axes à l'origine, seule adaptation structurelle par rapport au moteur
 * existant. Pour la variante "seuil" uniquement, le corrigé réaffiche ce même graphique avec les
 * points lus explicitement marqués/étiquetés (`marqueursSeuilCorrection`) — même convention que
 * `transformationsGraphiques/exportEvaluation.ts` (`estCorrige`, sommet+point croix étiquetés
 * uniquement côté corrigé, jamais énoncé). Les 3 autres types de question, en variante "graphique",
 * réaffichent le graphique NU (sans marqueur) : leurs valeurs de référence (médiane, σ, écart
 * interquartile, profil) sont déjà données en toutes lettres dans le paragraphe de justification qui
 * précède — inutile d'alourdir le tracé.
 *
 * **PAS `regroupable`** — deux raisons INDÉPENDANTES, chacune suffisante seule (voir la doc de
 * `AdaptateurFeuilleExercices.regroupable` dans `genererFeuilleExercices.ts`) : (1) la consigne
 * n'est JAMAIS générique, elle dépend systématiquement des valeurs tirées (bornes de la question
 * "seuil", nombre d'arguments de "dispersion", phrase de profil de "interpretation" — seule
 * "centrage" a une formulation fixe, mais ce n'est qu'UN des 4 types possibles, jamais garanti) ;
 * (2) les variantes "tableaux"/"recapitulatif"/"graphique" utilisent TOUTES `enteteHtml` (tableaux
 * HTML ou graphique SVG, aucun n'est représentable en `FragmentConsigne`), explicitement exclu par
 * la documentation de `regroupable`.
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur l'unique question
 * de chaque instance, décision explicite du prompt de portage) : les 4 formes de réponse sont
 * toutes très courtes (une lettre A/B, un nombre, 1-2 arguments cochés) et l'espace utile de la
 * page est déjà occupé par les tableaux/le graphique de données — pas de ligne vide à réserver en
 * plus, contrairement à `analyseFonction`/`simplification` qui laissent de la place à un calcul
 * écrit.
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function echapperHtml(valeur: string): string {
  return valeur.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Pont `SegmentTexte` (écran, `ui/formatComparaisonSeries.ts`) → `FragmentConsigne` (export) —
 * même contrat texte+LaTeX sous des noms de tag différents ("katex"/"latex"), voir commentaire de
 * tête de fichier. */
function segmentVersFragment(segment: SegmentTexte): FragmentConsigne {
  return segment.type === "katex" ? latex(segment.valeur) : texte(segment.valeur);
}

function segmentsVersFragments(segments: SegmentTexte[]): FragmentConsigne[] {
  return segments.map(segmentVersFragment);
}

// ============================================================================
// Variantes "tableaux"/"recapitulatif" — tableaux HTML de données DÉJÀ CONNUES (jamais une zone à
// remplir : `enteteHtml`, comme le graphique de la variante "graphique", réservé aux contenus non
// représentables en `FragmentConsigne` — ici 2 tableaux, jamais une simple prose+LaTeX).
// ============================================================================

// Même style de tableau que les données de gen32 (`moyennePonderee`) : bordures fines, colonnes
// centrées — sans lui, le tableau HTML s'imprime en colonnes collées (« 33 1 1 »).
const TD = 'style="border:1px solid #b9bec7;padding:3px 10px;text-align:center"';
const TH = 'style="border:1px solid #b9bec7;padding:3px 10px;text-align:center;font-weight:600"';

function ligneTableauBrutHtml(serie: SerieComparaison): string {
  return serie.lignes
    .map((ligne) => `<tr><td ${TD}>${formatNombre(ligne.valeur)}</td><td ${TD}>${formatNombre(ligne.effectif)}</td><td ${TD}>${formatNombre(ligne.effectifCumule)}</td></tr>`)
    .join("");
}

function tableauBrutHtml(serie: SerieComparaison, label: string): string {
  return (
    `<table style="display:inline-table;border-collapse:collapse;margin:0 24px 8px 0;">` +
    `<caption style="caption-side:top;text-align:left;font-weight:bold;padding-bottom:3px;">${echapperHtml(label)}</caption>` +
    `<tr><th ${TH}>xᵢ</th><th ${TH}>nᵢ</th><th ${TH}>effectif cumulé</th></tr>${ligneTableauBrutHtml(serie)}</table>`
  );
}

function construireTablesBruttesHtml(serieA: SerieComparaison, serieB: SerieComparaison): string {
  return `<div style="display:flex;flex-wrap:wrap;align-items:flex-start;">${tableauBrutHtml(serieA, "Série A")}${tableauBrutHtml(serieB, "Série B")}</div>`;
}

function construireTableRecapitulatifHtml(serieA: SerieComparaison, serieB: SerieComparaison, unite: string): string {
  const lignes: { libelle: string; a: number; b: number }[] = [
    { libelle: "x̄", a: serieA.xBar, b: serieB.xBar },
    { libelle: "σ", a: serieA.sigma, b: serieB.sigma },
    { libelle: "min", a: serieA.min, b: serieB.min },
    { libelle: "Q1", a: serieA.q1, b: serieB.q1 },
    { libelle: "Q2 (médiane)", a: serieA.mediane, b: serieB.mediane },
    { libelle: "Q3", a: serieA.q3, b: serieB.q3 },
    { libelle: "max", a: serieA.max, b: serieB.max },
  ];
  const corps = lignes.map((ligne) => `<tr><th ${TH}>${echapperHtml(ligne.libelle)}</th><td ${TD}>${formatNombre(ligne.a)}</td><td ${TD}>${formatNombre(ligne.b)}</td></tr>`).join("");
  return (
    `<table style="border-collapse:collapse;margin:6px 0"><tr><th ${TH}></th><th ${TH}>Série A</th><th ${TH}>Série B</th></tr>${corps}</table>` +
    `<p style="font-size:0.85em;color:#555;">(valeurs en ${echapperHtml(unite)})</p>`
  );
}

// ============================================================================
// Variante "graphique" — courbes cumulées : `ui/figureComparaisonSeries.ts` (partagé avec le corrigé détaillé).
// ============================================================================

// ============================================================================
// Consigne — dispatch sur `question.type`, réutilise `ui/formatComparaisonSeries.ts` (voir
// commentaire de tête).
// ============================================================================

function segmentsConsignePourQuestion(question: QuestionComparaisonSeries, exercice: ExerciceComparaisonSeries): SegmentTexte[] {
  if (question.type === "centrage") return segmentsConsigneCentrage();
  if (question.type === "dispersion") return segmentsConsigneDispersion(question);
  if (question.type === "seuil") return segmentsConsigneSeuil(question, exercice);
  return segmentsConsigneInterpretation(question, exercice);
}

function construireEnonceComparaisonSeries(instance: ExerciceComparaisonSeries): SectionExercice {
  const { variante, serieA, serieB, cumul, question, contexte } = instance;

  const enteteHtml =
    variante === "tableaux"
      ? construireTablesBruttesHtml(serieA, serieB)
      : variante === "recapitulatif"
        ? construireTableRecapitulatifHtml(serieA, serieB, contexte.unite)
        : construireSvgCourbesCumulees(serieA, serieB, cumul ?? "effectif", contexte.unite);

  return {
    enteteFragments: [texte(formatEnonceTexte(instance))],
    enteteHtml,
    questions: [{ consigne: segmentsVersFragments(segmentsConsignePourQuestion(question, instance)), reponse: { type: "lignes", nombre: 0 } }],
  };
}

// ============================================================================
// Correction — resynthétisée depuis les valeurs déjà connues de l'instance (voir commentaire de
// tête de fichier), jamais recalculée indépendamment.
// ============================================================================

function symboleComparaison(a: number, b: number): "<" | ">" | "=" {
  return a < b ? "<" : a > b ? ">" : "=";
}

function fragmentsExplicationSeuil(question: QuestionSeuil, exercice: ExerciceComparaisonSeries): FragmentConsigne[] {
  const serie = question.serie === "A" ? exercice.serieA : exercice.serieB;
  const ligneHaut = serie.lignes[question.indexHaut];
  const cumuleHaut = question.estFrequence ? ligneHaut.frequenceCumulee : ligneHaut.effectifCumule;
  const suffixe = question.estFrequence ? " %" : "";

  if (question.indexBas === null) {
    return [
      texte(
        `À la valeur ${formatNombre(ligneHaut.valeur)} ${exercice.contexte.unite} de la série ${question.serie}, le cumul vaut ${formatNombre(cumuleHaut)}${suffixe} — c'est directement la réponse.`,
      ),
    ];
  }

  const ligneBas = serie.lignes[question.indexBas];
  const cumuleBas = question.estFrequence ? ligneBas.frequenceCumulee : ligneBas.effectifCumule;
  return [
    texte(
      `Cumul de la série ${question.serie} à la valeur ${formatNombre(ligneBas.valeur)} : ${formatNombre(cumuleBas)}${suffixe} ; à la valeur ${formatNombre(ligneHaut.valeur)} : ${formatNombre(cumuleHaut)}${suffixe}. ` +
        `La tranche recherchée vaut donc ${formatNombre(cumuleHaut)}${suffixe} − ${formatNombre(cumuleBas)}${suffixe} = ${formatNombre(question.reponseAttendue)}${suffixe}.`,
    ),
  ];
}

/** Points à marquer/étiqueter sur le graphique corrigé d'une question "seuil" — la (les) valeur(s)
 * lue(s), étiquetées par le cumul exact déjà connu (jamais recalculé) ; `construireSvgCourbesCumulees`
 * retrouve lui-même l'ordonnée exacte (effectif/fréquence cumulé) à partir de `marqueur.valeur`, ce
 * label ne sert qu'à l'ANNOTATION textuelle affichée à côté du point. */
function marqueursSeuilCorrection(question: QuestionSeuil, exercice: ExerciceComparaisonSeries): MarqueurCourbeCumulee[] {
  const serie = question.serie === "A" ? exercice.serieA : exercice.serieB;
  const suffixe = question.estFrequence ? " %" : "";
  const cumulDe = (index: number) => {
    const ligne = serie.lignes[index];
    return question.estFrequence ? ligne.frequenceCumulee : ligne.effectifCumule;
  };

  const marqueurs: MarqueurCourbeCumulee[] = [];
  if (question.indexBas !== null) {
    marqueurs.push({ serie: question.serie, valeur: serie.lignes[question.indexBas].valeur, label: `${formatNombre(cumulDe(question.indexBas))}${suffixe}` });
  }
  marqueurs.push({ serie: question.serie, valeur: serie.lignes[question.indexHaut].valeur, label: `${formatNombre(cumulDe(question.indexHaut))}${suffixe}` });
  return marqueurs;
}

function construireCorrectionComparaisonSeries(instance: ExerciceComparaisonSeries): BlocCorrection[] {
  const { variante, contexte, serieA, serieB, cumul, question } = instance;
  const blocs: BlocCorrection[] = [];

  if (question.type === "centrage") {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          `Médiane de la série A : ${formatNombre(serieA.mediane)} ${contexte.unite}. Médiane de la série B : ${formatNombre(serieB.mediane)} ${contexte.unite}.`,
        ),
      ],
    });
    blocs.push({ type: "paragraphe", fragments: segmentsVersFragments(segmentsCentrageAttendu(question)) });
  } else if (question.type === "dispersion") {
    const symboleSigma = symboleComparaison(serieA.sigma, serieB.sigma);
    const symboleIqr = symboleComparaison(serieA.ecartInterquartile, serieB.ecartInterquartile);
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          `Écart-type : σ_A = ${formatNombre(serieA.sigma)}, σ_B = ${formatNombre(serieB.sigma)} (σ_A ${symboleSigma} σ_B). ` +
            `Écart interquartile : (Q3−Q1)_A = ${formatNombre(serieA.ecartInterquartile)}, (Q3−Q1)_B = ${formatNombre(serieB.ecartInterquartile)} ` +
            `((Q3−Q1)_A ${symboleIqr} (Q3−Q1)_B). Les deux mesures pointent vers la même série, qui vaut donc comme argument valide quel que soit le nombre demandé.`,
        ),
      ],
    });
    blocs.push({ type: "paragraphe", fragments: segmentsVersFragments(segmentsDispersionAttendu(question)) });
  } else if (question.type === "seuil") {
    blocs.push({ type: "paragraphe", fragments: fragmentsExplicationSeuil(question, instance) });
    blocs.push({ type: "paragraphe", fragments: segmentsVersFragments(segmentsSeuilAttendu(question)) });
  } else {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(`Profil de la série A : ${texteProfilSerie(instance, "A")}. Profil de la série B : ${texteProfilSerie(instance, "B")}.`),
      ],
    });
    blocs.push({ type: "paragraphe", fragments: segmentsVersFragments(segmentsInterpretationAttendu(question)) });
  }

  if (variante === "graphique") {
    const marqueurs = question.type === "seuil" ? marqueursSeuilCorrection(question, instance) : [];
    blocs.push({ type: "html", html: construireSvgCourbesCumulees(serieA, serieB, cumul ?? "effectif", contexte.unite, marqueurs) });
  }

  return blocs;
}

// ============================================================================
// Feuilles enrichies (énoncé papier, réponse brève, corrigé détaillé, barème) — voir
// `.claude/rules/feuilles-evaluations.md`. Une seule question par instance : elle EST la consigne
// globale (aucune étape d'apprentissage à retirer) ; le corrigé détaille la démarche.
// Les champs enrichis ne passent pas par `avecVirgulesBelges` (qui n'enveloppe que
// `construireEnonce`/`construireCorrection`) : `enVirgules` les convertit ici.
// ============================================================================

function enVirgules(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map(segmentEnVirgules);
}

function reponseBreveComparaisonSeries(instance: ExerciceComparaisonSeries): FragmentConsigne[] {
  const { question } = instance;
  if (question.type === "seuil") return [texte(texteReponseSeuil(question))];
  return segmentsVersFragments(segmentsReponseAttendueCourte(question));
}

function segmentsReponseAttendueCourte(question: Exclude<QuestionComparaisonSeries, QuestionSeuil>): SegmentTexte[] {
  if (question.type === "centrage") return segmentsCentrageAttendu(question);
  if (question.type === "dispersion") return segmentsDispersionAttendu(question);
  return segmentsInterpretationAttendu(question);
}

/** Niveau (grille commune) : un seul écran ; tableau récapitulatif ou lecture d'un cumul = lecture
 * pure ; méthode à choisir (quel indicateur comparer) pour centrage, dispersion et interprétation ;
 * aucun piège dans les données. */
function criteresDifficulte(instance: ExerciceComparaisonSeries): CriteresDifficulte {
  const { question, variante } = instance;
  const lecture = variante === "recapitulatif" || (question.type === "seuil" && question.indexBas === null) ? ["a"] : [];
  return { ...etapesDuCorrige(correctionDetailleeComparaisonSeries(instance), lecture), methode: question.type === "seuil" ? 0 : 1, piege: 0 };
}

function baremeComparaisonSeries(instance: ExerciceComparaisonSeries): BaremeExercice {
  const { question } = instance;
  const c = (texteCritere: string, points: number): CritereBareme => ({ critere: [texte(texteCritere)], points });
  let criteres: CritereBareme[];
  const erreurs: ErreurFrequente[] = [];
  const acceptees: FragmentConsigne[][] = [];
  if (question.type === "centrage") {
    criteres = [c("Médiane de la série A", 1), c("Médiane de la série B", 1), c("Comparaison des médianes et conclusion", 2)];
    erreurs.push({ description: [texte("Comparer les moyennes, les étendues ou les maximums au lieu des médianes")], cout: "0 pt sur la conclusion" });
  } else if (question.type === "dispersion") {
    criteres =
      question.nombreArguments === 2
        ? [c("Écarts-types comparés", 1.5), c("Écarts interquartiles comparés", 1.5), c("Conclusion : série la plus homogène", 1)]
        : [c("Une mesure de dispersion pertinente (écart-type ou écart interquartile) comparée", 2), c("Conclusion : série la plus homogène", 2)];
    erreurs.push({ description: [texte("Étendue utilisée comme argument")], cout: "0 pt pour cet argument" });
    erreurs.push({ description: [texte("Série la plus dispersée désignée comme la plus homogène")], cout: "0 pt sur la conclusion" });
    acceptees.push([texte("Justification par l'écart-type ou par l'écart interquartile, au choix si un seul argument est demandé")]);
  } else if (question.type === "seuil") {
    criteres =
      question.indexBas === null
        ? [c("Lecture du cumul à la bonne valeur", 2), c("Réponse", 2)]
        : [c("Cumul à la borne haute", 1), c("Cumul à la borne basse", 1), c("Différence des deux cumuls", 2)];
    erreurs.push({ description: [texte("Effectif de la seule ligne lu au lieu de l'effectif cumulé")], cout: "0 pt sur la lecture" });
    if (question.indexBas !== null) erreurs.push({ description: [texte("Cumul de la borne haute donné sans soustraire celui de la borne basse")], cout: "−2" });
    if (question.estFrequence) acceptees.push([texte("Pourcentage écrit avec ou sans le symbole %")]);
  } else {
    criteres = [c("Comparaison des niveaux (médianes)", 1.5), c("Comparaison des dispersions", 1.5), c("Série correspondant au profil", 1)];
    erreurs.push({ description: [texte("Niveau et dispersion confondus (série la plus homogène prise pour la plus élevée)")], cout: "0 pt sur la conclusion" });
  }
  return {
    reponseFinale: reponseBreveComparaisonSeries(instance),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees.length > 0 ? acceptees : undefined,
  };
}

const adaptateurEvaluationComparaisonSeriesBrut: AdaptateurFeuilleExercices<ExerciceComparaisonSeries> = {
  titreDocument: "Comparaison de deux séries statistiques — Évaluation",
  nomFichierBase: "comparaison-series-statistiques",
  genererInstance: genererExerciceComparaisonSeries,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceComparaisonSeries,
  construireCorrection: construireCorrectionComparaisonSeries,
  criteresDifficulte,
  reponseBreve: (instance) => enVirgules(reponseBreveComparaisonSeries(instance)),
  correctionDetaillee: (instance) => correctionDetailleeComparaisonSeries(instance).map((e) => ({ ...e, fragments: enVirgules(e.fragments) })),
  bareme: (instance) => {
    const b = baremeComparaisonSeries(instance);
    return { ...b, reponseFinale: enVirgules(b.reponseFinale) };
  },
};

/** Notation décimale belge (virgule) dans tout l'énoncé et la correction (audit chapitre 4). */
const adaptateurVirgules = avecVirgulesBelges(adaptateurEvaluationComparaisonSeriesBrut);

export const adaptateurEvaluationComparaisonSeries: AdaptateurFeuilleExercices<ExerciceComparaisonSeries> = {
  ...adaptateurVirgules,
  profilInstance: profilComparaisonSeries,
  libelleCasParticulier: LIBELLE_CAS_COMPARAISON,
  // Énoncé papier tiré de l'énoncé DÉJÀ en virgules (tableaux et graphique compris).
  enoncePapier: (instance) => {
    const section = adaptateurVirgules.construireEnonce(instance);
    return { section: { ...section, questions: section.questions.map((q) => ({ consigne: q.consigne })) }, etapesParQuestion: [["a"]] };
  },
};
