/**
 * Couche A — "Comparaison de deux séries statistiques". N'importe que la banque de contextes déjà
 * partagée pour "Inégalité de Bienaymé-Tchebychev" (`generateurs/bienaymeTchebychev/contextes.ts`,
 * import générateur→générateur, explicitement autorisé — voir CLAUDE.md) ; sinon totalement
 * indépendant, comme les autres générateurs du chapitre 5.
 *
 * **Un seul tableau x_i/n_i canonique par série** (voir `core/comparaisonSeries.types.ts`) — les 2
 * séries partagent toujours la MÊME fenêtre `[min,max]` (dérivée du contexte, jamais deux fenêtres
 * indépendantes qui pourraient finir disjointes — piège déjà rencontré et corrigé pour "Boîte à
 * moustaches", `promptgen36fixmafsechelle.md`) ; `n` toujours un diviseur exact de 100 par série
 * (`CANDIDATS_N`, dupliqué depuis "Tableau de fréquences"/"Médiane" — pas importé, contrats
 * indépendants entre générateurs du même chapitre) pour garantir des fréquences cumulées toujours
 * entières exactes.
 *
 * **Règle en cascade Q1/médiane/Q3** (`indexMedianeDepuisCumules` + logique associée) — dupliquée
 * depuis "Étendue et écart interquartile"/gen35 : le premier `x_i` dont l'effectif cumulé dépasse
 * STRICTEMENT `n/2` (jamais `≥`), Q1/Q3 dérivés en cascade depuis la position `m` de la médiane —
 * voir `etendueInterquartile/index.ts` pour la preuve mathématique complète, non répétée ici.
 *
 * **$\bar{x}$/σ — cascade de valeurs déjà arrondies**, même principe que "Paramètres de
 * dispersion"/gen34 : `variance` calculée depuis le $\bar{x}$ EXACT (non arrondi) puis arrondie à 2
 * décimales, `sigma` calculé depuis la variance DÉJÀ arrondie puis arrondi à son tour — jamais un
 * calcul intermédiaire réutilisé après coup pour garantir un arrondi "propre", contrairement à
 * "Moyenne pondérée" (aucune boucle de secours ici : ce générateur ne montre jamais $\bar{x}$/σ
 * comme une réponse à saisir, seulement à lire — voir la variante "recapitulatif").
 */
import type {
  CumulComparaisonSeries,
  ExerciceComparaisonSeries,
  LigneComparaisonSeries,
  QuestionCentrage,
  QuestionComparaisonSeries,
  QuestionDispersion,
  QuestionInterpretation,
  QuestionSeuil,
  SerieComparaison,
  TypeQuestionComparaisonSeries,
  VarianteComparaisonSeries,
} from "../../core/comparaisonSeries.types";
import type { ContexteBienaymeTchebychev } from "../../core/bienaymeTchebychev.types";
import { CONTEXTES } from "../bienaymeTchebychev/contextes";
import { randomInt } from "./aleatoire";

/** `n` toujours un DIVISEUR EXACT de 100 — même pool que "Tableau de fréquences"/"Médiane"
 * (dupliqué, pas importé) : garantit `frequenceCumulee` toujours un entier exact, quel que soit
 * l'effectif cumulé tiré. */
export const CANDIDATS_N: readonly number[] = [10, 20, 25];

const K_MIN = 4;
const K_MAX = 6;

/** Largeur minimale garantie de la fenêtre `[min,max]` PARTAGÉE par les 2 séries — même principe
 * que "Moyenne pondérée"/"Médiane" (dupliqué), élargie de 14 à 16 pour laisser un peu plus de place
 * à 2 tirages indépendants de 4 à 6 valeurs chacun dans la même fenêtre sans les forcer à se
 * chevaucher exactement. */
const LARGEUR_MIN_PLAGE = 16;

const MAX_TENTATIVES = 500;

function arrondir2(x: number): number {
  return Math.round(x * 100) / 100;
}

/** Élargit `[min,max]` symétriquement autour de son centre jusqu'à `largeurMin`, jamais en dessous
 * de 0 — dupliqué (pas importé) dans chaque générateur qui en a besoin. */
function elargirPlage(min: number, max: number, largeurMin: number): [number, number] {
  const largeur = max - min;
  if (largeur >= largeurMin) return [min, max];
  const centre = (min + max) / 2;
  const nouveauMin = Math.max(0, Math.round(centre - largeurMin / 2));
  return [nouveauMin, nouveauMin + largeurMin];
}

function tirerValeursDistinctes(k: number, min: number, max: number): number[] {
  const valeurs = new Set<number>();
  while (valeurs.size < k) {
    valeurs.add(randomInt(min, max));
  }
  return [...valeurs].sort((a, b) => a - b);
}

function tirerEffectifs(n: number, k: number): number[] {
  const effectifs = new Array(k).fill(1) as number[];
  let reste = n - k;
  while (reste > 0) {
    effectifs[randomInt(0, k - 1)] += 1;
    reste -= 1;
  }
  return effectifs;
}

/** Même règle stricte que "Médiane"/"Étendue et écart interquartile" — dupliquée, pas importée. */
function indexMedianeDepuisCumules(lignes: LigneComparaisonSeries[], n: number): number {
  const seuil = n / 2;
  return lignes.findIndex((ligne) => ligne.effectifCumule > seuil);
}

/** Construit une série complète (table + résumé) — `null` si le tirage est dégénéré (médiane à une
 * extrémité du tableau, ou écart interquartile nul), à retirer côté appelant. */
function construireSerieUneFois(min: number, max: number, n: number, k: number): SerieComparaison | null {
  const valeurs = tirerValeursDistinctes(k, min, max);
  const effectifs = tirerEffectifs(n, k);

  let cumule = 0;
  const lignes: LigneComparaisonSeries[] = valeurs.map((valeur, i) => {
    cumule += effectifs[i];
    const effectifCumule = cumule;
    return { valeur, effectif: effectifs[i], effectifCumule, frequenceCumulee: Math.round((effectifCumule * 100) / n) };
  });

  const indexMediane = indexMedianeDepuisCumules(lignes, n);
  if (indexMediane <= 0 || indexMediane >= lignes.length - 1) return null;

  const m = lignes[indexMediane].effectifCumule;
  const seuilQ1 = m / 2;
  const indexQ1 = lignes.slice(0, indexMediane + 1).findIndex((ligne) => ligne.effectifCumule > seuilQ1);

  const tailleMoitieSup = n - m + 1;
  const seuilQ3 = tailleMoitieSup / 2;
  const indexQ3Relatif = lignes.slice(indexMediane).findIndex((ligne) => ligne.effectifCumule - (m - 1) > seuilQ3);
  const indexQ3 = indexMediane + indexQ3Relatif;

  const q1 = lignes[indexQ1].valeur;
  const q3 = lignes[indexQ3].valeur;
  const ecartInterquartile = q3 - q1;
  if (ecartInterquartile <= 0) return null;

  const sommeXN = lignes.reduce((acc, ligne) => acc + ligne.valeur * ligne.effectif, 0);
  const xBarExact = sommeXN / n;
  const varianceExact = lignes.reduce((acc, ligne) => acc + (ligne.valeur - xBarExact) ** 2 * ligne.effectif, 0) / n;
  const variance = arrondir2(varianceExact);
  const sigma = arrondir2(Math.sqrt(variance));

  return {
    lignes,
    n,
    xBar: arrondir2(xBarExact),
    variance,
    sigma,
    min: lignes[0].valeur,
    q1,
    mediane: lignes[indexMediane].valeur,
    q3,
    max: lignes[lignes.length - 1].valeur,
    ecartInterquartile,
  };
}

/**
 * Construit la paire (série A, série B) — retire tant que : une des deux séries est dégénérée, les
 * 2 médianes coïncident (piège "centrage" ambigu), ou σ et l'écart interquartile ne pointent pas
 * tous deux vers la même série comme "la plus homogène" (piège "dispersion" contradictoire —
 * explicitement hors périmètre de cette version, voir le prompt de création).
 */
function construireSeriePaire(contexte: ContexteBienaymeTchebychev): { serieA: SerieComparaison; serieB: SerieComparaison } {
  const [min, max] = elargirPlage(contexte.plageXBar[0], contexte.plageXBar[1], LARGEUR_MIN_PLAGE);

  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const nA = CANDIDATS_N[randomInt(0, CANDIDATS_N.length - 1)];
    const nB = CANDIDATS_N[randomInt(0, CANDIDATS_N.length - 1)];
    const serieA = construireSerieUneFois(min, max, nA, randomInt(K_MIN, K_MAX));
    const serieB = construireSerieUneFois(min, max, nB, randomInt(K_MIN, K_MAX));
    if (serieA === null || serieB === null) continue;

    if (serieA.mediane === serieB.mediane) continue;
    if (serieA.sigma === serieB.sigma || serieA.ecartInterquartile === serieB.ecartInterquartile) continue;
    const sigmaDirection = serieA.sigma < serieB.sigma;
    const iqrDirection = serieA.ecartInterquartile < serieB.ecartInterquartile;
    if (sigmaDirection !== iqrDirection) continue;

    return { serieA, serieB };
  }

  throw new Error(`construireSeriePaire : impossible de construire une paire valide après ${MAX_TENTATIVES} tentatives`);
}

const TYPES_COMPATIBLES: Record<VarianteComparaisonSeries, TypeQuestionComparaisonSeries[]> = {
  tableaux: ["seuil", "interpretation"],
  recapitulatif: ["centrage", "dispersion", "interpretation"],
  graphique: ["centrage", "dispersion", "seuil", "interpretation"],
};

function construireQuestionCentrage(serieA: SerieComparaison, serieB: SerieComparaison): QuestionCentrage {
  return { type: "centrage", medianePlusGrande: serieA.mediane > serieB.mediane ? "A" : "B" };
}

/** `serieHomogene` — celle dont σ (et, par construction, l'écart interquartile) est le plus petit.
 * Les 2 arguments (`ArgumentDispersionComparaison`) sont TOUJOURS individuellement valables pour la
 * justifier, quel que soit `nombreArguments` — voir `verifierDispersion`, Couche B. */
function construireQuestionDispersion(serieA: SerieComparaison, serieB: SerieComparaison): QuestionDispersion {
  const serieHomogene: "A" | "B" = serieA.sigma < serieB.sigma ? "A" : "B";
  const nombreArguments: 1 | 2 = randomInt(0, 1) === 0 ? 1 : 2;
  return { type: "dispersion", serieHomogene, nombreArguments };
}

/** Les 2 bornes (`indexBas`/`indexHaut`) sont toujours de vraies valeurs `x_i` de la série choisie
 * — jamais un seuil hors-table — donc `reponseAttendue` est toujours un effectif/fréquence cumulé
 * EXACT, jamais interpolé. `indexHaut` exclut toujours la dernière ligne quand `indexBas===null`
 * (sinon la réponse triviale serait `n`/100%, sans intérêt pédagogique). */
function construireQuestionSeuil(serieA: SerieComparaison, serieB: SerieComparaison, cumul: CumulComparaisonSeries | null): QuestionSeuil {
  const serieId: "A" | "B" = randomInt(0, 1) === 0 ? "A" : "B";
  const serie = serieId === "A" ? serieA : serieB;
  const k = serie.lignes.length;
  const estFrequence = cumul === "frequence";

  const avecBorneBasse = randomInt(0, 1) === 1;
  let indexBas: number | null = null;
  let indexHaut: number;
  if (avecBorneBasse) {
    indexBas = randomInt(0, k - 2);
    indexHaut = randomInt(indexBas + 1, k - 1);
  } else {
    indexHaut = randomInt(0, k - 2);
  }

  const cumuleA = (index: number) => (estFrequence ? serie.lignes[index].frequenceCumulee : serie.lignes[index].effectifCumule);
  const cumuleHaut = cumuleA(indexHaut);
  const cumuleBas = indexBas === null ? 0 : cumuleA(indexBas);

  return { type: "seuil", serie: serieId, indexBas, indexHaut, estFrequence, reponseAttendue: cumuleHaut - cumuleBas };
}

function construireQuestionInterpretation(): QuestionInterpretation {
  return { type: "interpretation", serieDecrite: randomInt(0, 1) === 0 ? "A" : "B" };
}

function construireQuestion(
  varianteId: VarianteComparaisonSeries,
  serieA: SerieComparaison,
  serieB: SerieComparaison,
  cumul: CumulComparaisonSeries | null,
): QuestionComparaisonSeries {
  const typesPossibles = TYPES_COMPATIBLES[varianteId];
  const type = typesPossibles[randomInt(0, typesPossibles.length - 1)];
  if (type === "centrage") return construireQuestionCentrage(serieA, serieB);
  if (type === "dispersion") return construireQuestionDispersion(serieA, serieB);
  if (type === "seuil") return construireQuestionSeuil(serieA, serieB, cumul);
  return construireQuestionInterpretation();
}

export const CATALOGUE_VARIANTES: { id: VarianteComparaisonSeries; label: string }[] = [
  { id: "tableaux", label: "Tableaux x_i / n_i" },
  { id: "recapitulatif", label: "Tableau récapitulatif déjà calculé" },
  { id: "graphique", label: "Courbes cumulées (graphique)" },
];

/** Construit un exercice pour une variante forcée (convention CLAUDE.md, "Catalogue de
 * variantes..."). `overrides?.contexte` permet de forcer aussi le contexte narratif. */
export function construireAvecVarianteId(
  varianteId: VarianteComparaisonSeries,
  overrides?: { contexte?: ContexteBienaymeTchebychev },
): ExerciceComparaisonSeries {
  const contexte = overrides?.contexte ?? CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
  const { serieA, serieB } = construireSeriePaire(contexte);
  const cumul: CumulComparaisonSeries | null = varianteId === "graphique" ? (randomInt(0, 1) === 0 ? "effectif" : "frequence") : null;
  const question = construireQuestion(varianteId, serieA, serieB, cumul);
  return { variante: varianteId, contexte, serieA, serieB, cumul, question };
}

export function genererExerciceComparaisonSeries(): ExerciceComparaisonSeries {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
