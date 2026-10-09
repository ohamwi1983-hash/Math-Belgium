import type {
  CumulComparaisonSeries,
  ExerciceComparaisonSeries,
  QuestionComparaisonSeries,
  QuestionSeuil,
  SerieComparaison,
} from "../../core/comparaisonSeries.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
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
import { calculerViewBoxComparaisonSeries, pointsCourbeCumulee, type PointCourbeCumulee } from "../../ui/comparaisonSeriesGraph";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparaisonSeries } from "./index";

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

const COULEUR_SERIE_A = "#1971c2";
const COULEUR_SERIE_B = "#f08c00";
const COULEUR_GRILLE_SVG = "#d8dee6";
const COULEUR_AXE_SVG = "#495057";
const LARGEUR_SVG_COURBES = 360;
const HAUTEUR_SVG_COURBES = 250;
const MARGE_GAUCHE_SVG = 32;
const MARGE_BAS_SVG = 24;
const MARGE_HAUT_SVG = 26;
const MARGE_DROITE_SVG = 12;
const CIBLE_DIVISIONS_SVG = 5;

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

function ligneTableauBrutHtml(serie: SerieComparaison): string {
  return serie.lignes
    .map((ligne) => `<tr><td>${formatNombre(ligne.valeur)}</td><td>${formatNombre(ligne.effectif)}</td><td>${formatNombre(ligne.effectifCumule)}</td></tr>`)
    .join("");
}

function tableauBrutHtml(serie: SerieComparaison, label: string): string {
  return (
    `<table style="display:inline-table;margin:0 16px 8px 0;">` +
    `<caption style="caption-side:top;text-align:left;font-weight:bold;">${echapperHtml(label)}</caption>` +
    `<tr><th>x</th><th>n</th><th>cumulé</th></tr>${ligneTableauBrutHtml(serie)}</table>`
  );
}

function construireTablesBruttesHtml(serieA: SerieComparaison, serieB: SerieComparaison): string {
  return `<div style="display:flex;flex-wrap:wrap;">${tableauBrutHtml(serieA, "Série A")}${tableauBrutHtml(serieB, "Série B")}</div>`;
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
  const corps = lignes.map((ligne) => `<tr><th>${echapperHtml(ligne.libelle)}</th><td>${formatNombre(ligne.a)}</td><td>${formatNombre(ligne.b)}</td></tr>`).join("");
  return (
    `<table><tr><th></th><th>Série A</th><th>Série B</th></tr>${corps}</table>` +
    `<p style="font-size:0.85em;color:#555;">(valeurs en ${echapperHtml(unite)})</p>`
  );
}

// ============================================================================
// Variante "graphique" — courbes cumulées, moteur de tracé dédié (voir commentaire de tête).
// ============================================================================

/** Pas "nombre rond" (1/2/5 × 10^n) — dupliquée depuis `export/svgGraph.ts::pasNombreRond` (non
 * exportée), même principe que le reste du projet ("dupliqué, pas importé"). */
function pasNombreRondSvg(etendue: number): number {
  const brut = etendue / CIBLE_DIVISIONS_SVG;
  const magnitude = 10 ** Math.floor(Math.log10(brut));
  const normalise = brut / magnitude;
  const nice = normalise < 1.5 ? 1 : normalise < 3 ? 2 : normalise < 7 ? 5 : 10;
  return nice * magnitude;
}

function formatNombreSvg(v: number): string {
  return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2);
}

/** Un point marqué/étiqueté sur UNE courbe (corrigé de la variante "graphique", question "seuil"
 * uniquement — voir commentaire de tête de fichier). */
interface MarqueurCourbeCumulee {
  serie: "A" | "B";
  valeur: number;
  label: string;
}

function traceCourbeSvg(points: PointCourbeCumulee[], couleur: string, sx: (x: number) => number, sy: (y: number) => number): string {
  const chemin = points.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const sommets = points.map((p) => `<circle cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="2.4" fill="${couleur}"/>`).join("");
  return `<path d="${chemin}" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round"/>${sommets}`;
}

/** Construit le `<svg>` autonome des 2 courbes cumulées (ogives) — géométrie déléguée à
 * `pointsCourbeCumulee`/`calculerViewBoxComparaisonSeries` (`ui/comparaisonSeriesGraph.ts`, source
 * unique déjà partagée avec l'écran), rendu (grille/cadre/tracé/étiquettes) propre à ce fichier. */
function construireSvgCourbesCumulees(
  serieA: SerieComparaison,
  serieB: SerieComparaison,
  cumul: CumulComparaisonSeries,
  unite: string,
  marqueurs: MarqueurCourbeCumulee[] = [],
): string {
  const pointsA = pointsCourbeCumulee(serieA, cumul);
  const pointsB = pointsCourbeCumulee(serieB, cumul);
  const viewBox = calculerViewBoxComparaisonSeries(pointsA, pointsB);
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;

  const zoneX = LARGEUR_SVG_COURBES - MARGE_GAUCHE_SVG - MARGE_DROITE_SVG;
  const zoneY = HAUTEUR_SVG_COURBES - MARGE_HAUT_SVG - MARGE_BAS_SVG;
  const sx = (x: number) => MARGE_GAUCHE_SVG + ((x - xMin) / (xMax - xMin)) * zoneX;
  const sy = (y: number) => MARGE_HAUT_SVG + ((yMax - y) / (yMax - yMin)) * zoneY;

  const pasX = pasNombreRondSvg(xMax - xMin);
  const pasY = pasNombreRondSvg(yMax - yMin);

  const grilleX: string[] = [];
  const labelsX: string[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    grilleX.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_HAUT_SVG}" x2="${px.toFixed(1)}" y2="${HAUTEUR_SVG_COURBES - MARGE_BAS_SVG}" stroke="${COULEUR_GRILLE_SVG}" stroke-width="1"/>`);
    labelsX.push(`<text x="${px.toFixed(1)}" y="${(HAUTEUR_SVG_COURBES - MARGE_BAS_SVG + 12).toFixed(1)}" font-size="8" text-anchor="middle" fill="${COULEUR_AXE_SVG}">${formatNombreSvg(v)}</text>`);
  }
  const grilleY: string[] = [];
  const labelsY: string[] = [];
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = sy(v);
    grilleY.push(`<line x1="${MARGE_GAUCHE_SVG}" y1="${py.toFixed(1)}" x2="${LARGEUR_SVG_COURBES - MARGE_DROITE_SVG}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE_SVG}" stroke-width="1"/>`);
    labelsY.push(`<text x="${(MARGE_GAUCHE_SVG - 4).toFixed(1)}" y="${(py + 3).toFixed(1)}" font-size="8" text-anchor="end" fill="${COULEUR_AXE_SVG}">${formatNombreSvg(v)}</text>`);
  }

  const cadre = `<rect x="${MARGE_GAUCHE_SVG}" y="${MARGE_HAUT_SVG}" width="${zoneX}" height="${zoneY}" fill="none" stroke="${COULEUR_AXE_SVG}" stroke-width="1.2"/>`;
  const traceA = traceCourbeSvg(pointsA, COULEUR_SERIE_A, sx, sy);
  const traceB = traceCourbeSvg(pointsB, COULEUR_SERIE_B, sx, sy);

  const marqueursHtml = marqueurs
    .map((marqueur) => {
      const serie = marqueur.serie === "A" ? serieA : serieB;
      const couleur = marqueur.serie === "A" ? COULEUR_SERIE_A : COULEUR_SERIE_B;
      const ligne = serie.lignes.find((l) => l.valeur === marqueur.valeur);
      if (!ligne) return "";
      const y = cumul === "effectif" ? ligne.effectifCumule : ligne.frequenceCumulee;
      const px = sx(marqueur.valeur);
      const py = sy(y);
      return (
        `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" fill="#ffffff" stroke="${couleur}" stroke-width="2"/>` +
        `<text x="${px.toFixed(1)}" y="${(py - 8).toFixed(1)}" font-size="8" text-anchor="middle" font-weight="bold" fill="${couleur}">${echapperHtml(marqueur.label)}</text>`
      );
    })
    .join("");

  const legende =
    `<text x="${MARGE_GAUCHE_SVG}" y="12" font-size="9" font-weight="bold" fill="${COULEUR_SERIE_A}">Série A</text>` +
    `<text x="${MARGE_GAUCHE_SVG + 58}" y="12" font-size="9" font-weight="bold" fill="${COULEUR_SERIE_B}">Série B</text>`;
  const libelleY = cumul === "effectif" ? "effectif cumulé" : "fréquence cumulée (%)";
  const legendeAxes = `<text x="${MARGE_GAUCHE_SVG}" y="${HAUTEUR_SVG_COURBES - 4}" font-size="7.5" fill="${COULEUR_AXE_SVG}">Horizontal : valeur (${echapperHtml(unite)}) — Vertical : ${echapperHtml(libelleY)}</text>`;

  return `<svg class="graphe-comparaison-series" width="${LARGEUR_SVG_COURBES}" height="${HAUTEUR_SVG_COURBES}" viewBox="0 0 ${LARGEUR_SVG_COURBES} ${HAUTEUR_SVG_COURBES}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="${LARGEUR_SVG_COURBES}" height="${HAUTEUR_SVG_COURBES}" fill="#ffffff"/>
${grilleX.join("")}${grilleY.join("")}
${cadre}
${traceA}${traceB}
${labelsX.join("")}${labelsY.join("")}
${legende}
${marqueursHtml}
${legendeAxes}
</svg>`;
}

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

export const adaptateurEvaluationComparaisonSeries: AdaptateurFeuilleExercices<ExerciceComparaisonSeries> = {
  titreDocument: "Comparaison de deux séries statistiques — Évaluation",
  nomFichierBase: "comparaison-series-statistiques",
  genererInstance: genererExerciceComparaisonSeries,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceComparaisonSeries,
  construireCorrection: construireCorrectionComparaisonSeries,
};
