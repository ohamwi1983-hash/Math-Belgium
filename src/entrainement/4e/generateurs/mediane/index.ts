/**
 * Couche A — "Médiane". N'importe que la banque de contextes déjà partagée pour "Inégalité de
 * Bienaymé-Tchebychev" (`generateurs/bienaymeTchebychev/contextes.ts`, import générateur→générateur,
 * explicitement autorisé — voir CLAUDE.md, `promptgen33contexte.md`) ; sinon totalement
 * indépendant, comme les trois autres générateurs du chapitre 5.
 */
import type {
  ClasseMediane,
  ExerciceMediane,
  ExerciceMedianeClasses,
  ExerciceMedianeDiscrete,
  LigneMedianeDiscrete,
  VarianteMediane,
} from "../../core/mediane.types";
import type { ContexteBienaymeTchebychev } from "../../core/bienaymeTchebychev.types";
import { CONTEXTES } from "../bienaymeTchebychev/contextes";
import { randomInt } from "./aleatoire";
import { calculerParametreDePosition } from "./parametreDePosition";

/** Boucle de secours (`promptgen33modifications.md`) — retire un nouveau jeu d'effectifs tant que
 * tous sont égaux (garantit qu'au moins une valeur x_i se distingue comme mode) ; jamais atteinte en
 * pratique (probabilité infime avec 4 à 6 tirages indépendants dans [2,9]). */
const MAX_TENTATIVES_MODE = 50;

const NOMBRE_VALEURS_MIN = 4;
const NOMBRE_VALEURS_MAX = 6;
const EFFECTIF_MIN = 2;
const EFFECTIF_MAX = 9;

/** Largeur minimale garantie de la plage de tirage des valeurs discrètes — même principe et même
 * étendue historique que "Tableau de fréquences"/"Moyenne pondérée" (dupliqué, pas importé) :
 * certains contextes de la banque ont un `plageXBar` trop étroit pour y tirer 4 à 6 entiers
 * distincts. */
const LARGEUR_MIN_PLAGE = 14;

/** Élargit `[min,max]` symétriquement autour de son centre jusqu'à `largeurMin`, jamais en dessous
 * de 0 — dupliqué (pas importé) dans chaque générateur qui en a besoin. */
function elargirPlage(min: number, max: number, largeurMin: number): [number, number] {
  const largeur = max - min;
  if (largeur >= largeurMin) return [min, max];
  const centre = (min + max) / 2;
  const nouveauMin = Math.max(0, Math.round(centre - largeurMin / 2));
  return [nouveauMin, nouveauMin + largeurMin];
}

const NOMBRE_CLASSES_MIN = 4;
const NOMBRE_CLASSES_MAX = 5;
const AMPLITUDE_MIN = 2;
const AMPLITUDE_MAX = 5;
/** Jitter (unités entières) autour du centre de `contexte.plageXBar` pour la borne de départ des
 * classes — même principe que "Regroupement en classes et histogramme"/"Moyenne pondérée"
 * (dupliqué, pas importé). */
const JITTER_BORNE_DEPART = 3;

/** Tire une amplitude PAR CLASSE (`promptgen32gen33corrections.md`, point 1 — remplace l'ancienne
 * amplitude unique commune à toutes les classes, même principe et même duplication que "Moyenne
 * pondérée") — retire tant que toutes les amplitudes tirées sont identiques, pour garantir PAR
 * CONSTRUCTION au moins deux amplitudes distinctes dans le tableau généré. */
function tirerAmplitudes(nombreClasses: number): number[] {
  let amplitudes: number[];
  let tentative = 0;
  do {
    tentative++;
    amplitudes = Array.from({ length: nombreClasses }, () => randomInt(AMPLITUDE_MIN, AMPLITUDE_MAX));
  } while (new Set(amplitudes).size < 2 && tentative < MAX_TENTATIVES_MODE);
  return amplitudes;
}
/** Marge forcée entre la classe modale et le maximum des autres classes (`promptgen33modifications2.md`
 * — même principe que "Mode et classe modale", gen34, dupliqué pas importé : garantit PAR
 * CONSTRUCTION une classe modale unique, jamais d'ex-aequo, sans aucune boucle de secours. */
const MARGE_MODE_MIN = 1;
const MARGE_MODE_MAX = 3;

export const CATALOGUE_VARIANTES: { id: VarianteMediane; label: string }[] = [
  { id: "discrete", label: "Données discrètes (x_i / n_i)" },
  { id: "classes", label: "Données groupées en classes (interpolation)" },
];

/** Palier de précision de lecture selon l'amplitude du caractère — dupliqué depuis
 * `moteur/verificationMediane.ts::precisionLecture` (jamais importé, règle Couche A↔B non
 * négociable), voir sa documentation pour le détail complet des 4 paliers et de leur justification
 * (`promptgen33gen35precisionlecture.md`). **Amplitude toujours bornée à [8,25] sous la génération
 * actuelle** (`AMPLITUDE_MIN`/`AMPLITUDE_MAX` ci-dessus, `nombreClasses` 4 ou 5) — vérifié
 * empiriquement sur 5000 tirages du **vrai** générateur (`promptgen33gen35precisionlecture.md`,
 * vérification navigateur/tests) : le palier "0,1" (≤20) domine (~94%), mais le palier "1" (20–100)
 * est bel et bien atteint (~6%) — jamais un cas purement théorique. Seuls les paliers "5"
 * (100–1000) et "20" (>1000) restent hors de portée d'une instance RÉELLEMENT générée aujourd'hui,
 * décision de scope assumée (voir CLAUDE.md, section dédiée) plutôt qu'un oubli : cette fonction
 * reste malgré tout correcte pour n'importe quelle amplitude, testée exhaustivement de façon
 * indépendante de ce que la génération produit réellement — un futur élargissement de
 * `AMPLITUDE_MAX`/une mise à l'échelle sur `contexte.plageXBar`, si jamais souhaité, en bénéficierait
 * automatiquement sans aucun changement supplémentaire ici. */
function precisionLecture(amplitude: number): number {
  if (amplitude <= 20) return 0.1;
  if (amplitude <= 100) return 1;
  if (amplitude <= 1000) return 5;
  return 20;
}

/** Arrondit au pas de précision du palier applicable (`promptgen33gen35precisionlecture.md`) —
 * remplace l'ancien arrondi INCONDITIONNEL à 1 décimale (`arrondi1`) : le palier ≤20 (0,1) reste une
 * branche spéciale reproduisant EXACTEMENT l'ancien `arrondi1` — jamais `Math.round(x/0.1)*0.1`, qui
 * introduirait du bruit de virgule flottante (ex. `7.35/0.1` ≈ 73,49999... en JS) ; les paliers 1/5/
 * 20 sont des entiers exacts, `Math.round(x/p)*p` y est sans risque. */
function arrondirSelonPrecisionLecture(valeur: number, precision: number): number {
  if (precision === 0.1) return Math.round(valeur * 10) / 10;
  return Math.round(valeur / precision) * precision;
}

/** Tire `k` valeurs distinctes dans `[min,max]`, triées croissant — même principe que "Tableau de
 * fréquences"/"Moyenne pondérée" (dupliqué, pas importé — contrats indépendants entre générateurs
 * du chapitre). */
function tirerValeursDistinctes(k: number, min: number, max: number): number[] {
  const valeurs = new Set<number>();
  while (valeurs.size < k) {
    valeurs.add(randomInt(min, max));
  }
  return [...valeurs].sort((a, b) => a - b);
}

function tirerEffectifsLibres(k: number): number[] {
  return Array.from({ length: k }, () => randomInt(EFFECTIF_MIN, EFFECTIF_MAX));
}

/** Effectifs cumulés v_i — un seul calcul, jamais recalculé différemment côté vérification (les
 * exercices générés portent déjà `effectifCumule` figé une fois pour toutes). */
function cumuler(effectifs: number[]): number[] {
  const cumules: number[] = [];
  let acc = 0;
  for (const e of effectifs) {
    acc += e;
    cumules.push(acc);
  }
  return cumules;
}

/** Toutes les valeurs x_i dont l'effectif est maximal — 1 ou plusieurs, jamais 0 (garanti par la
 * boucle de secours de `construireDiscrete`, qui exclut le cas "tous les effectifs égaux"). */
function calculerModes(lignes: LigneMedianeDiscrete[]): number[] {
  const effectifMax = Math.max(...lignes.map((l) => l.effectif));
  return lignes.filter((l) => l.effectif === effectifMax).map((l) => l.valeur);
}

function construireDiscrete(contexte: ContexteBienaymeTchebychev): ExerciceMedianeDiscrete {
  let valeurs: number[] = [];
  let effectifs: number[] = [];
  let tentative = 0;
  const [min, max] = elargirPlage(contexte.plageXBar[0], contexte.plageXBar[1], LARGEUR_MIN_PLAGE);

  // Retire tant que tous les effectifs sont égaux (`promptgen33modifications.md`, contrainte de
  // génération de l'écran "Min, max et mode(s)" — garantit qu'au moins une valeur se distingue).
  do {
    tentative++;
    const k = randomInt(NOMBRE_VALEURS_MIN, NOMBRE_VALEURS_MAX);
    valeurs = tirerValeursDistinctes(k, min, max);
    effectifs = tirerEffectifsLibres(k);
  } while (new Set(effectifs).size === 1 && tentative < MAX_TENTATIVES_MODE);

  const cumules = cumuler(effectifs);
  const n = cumules[cumules.length - 1];
  const seuil = n / 2;
  const seuilQ1 = n / 4;
  const seuilQ3 = (3 * n) / 4;
  const donneesPosition = { type: "discrete" as const, valeurs, cumules };
  const { index: indexMediane, valeur: mediane } = calculerParametreDePosition(donneesPosition, seuil);
  const { index: indexQ1, valeur: q1 } = calculerParametreDePosition(donneesPosition, seuilQ1);
  const { index: indexQ3, valeur: q3 } = calculerParametreDePosition(donneesPosition, seuilQ3);

  const lignes: LigneMedianeDiscrete[] = valeurs.map((valeur, i) => ({
    valeur,
    effectif: effectifs[i],
    effectifCumule: cumules[i],
  }));

  return {
    contexte,
    variante: "discrete",
    n,
    seuil,
    lignes,
    indexMediane,
    mediane,
    seuilQ1,
    indexQ1,
    q1,
    seuilQ3,
    indexQ3,
    q3,
    min: lignes[0].valeur,
    max: lignes[lignes.length - 1].valeur,
    modes: calculerModes(lignes),
  };
}

function construireClasses(contexte: ContexteBienaymeTchebychev): ExerciceMedianeClasses {
  const nombreClasses = randomInt(NOMBRE_CLASSES_MIN, NOMBRE_CLASSES_MAX);
  // Amplitude PROPRE à chaque classe (`promptgen32gen33corrections.md`, point 1 — remplace
  // l'ancienne amplitude unique commune à toutes) — `tirerAmplitudes` garantit déjà au moins deux
  // valeurs distinctes, jamais un tableau uniforme.
  const amplitudes = tirerAmplitudes(nombreClasses);
  // Bornes centrées sur le milieu de la plage réaliste du contexte (jamais en dessous de 0), avec
  // un léger jitter pour ne pas figer systématiquement le même point de départ — même principe que
  // "Regroupement en classes et histogramme"/"Moyenne pondérée".
  const centre = (contexte.plageXBar[0] + contexte.plageXBar[1]) / 2;
  const etendueTotale = amplitudes.reduce((acc, a) => acc + a, 0);
  const borneDepart = Math.max(0, Math.round(centre - etendueTotale / 2) + randomInt(-JITTER_BORNE_DEPART, JITTER_BORNE_DEPART));

  // Classe modale forcée unique, sans ex-aequo — même principe que "Mode et classe modale" (gen34,
  // variante D) : un index tiré au hasard, son effectif forcé strictement au-dessus du maximum des
  // autres, jamais de boucle de secours nécessaire (la stricte supériorité est garantie par
  // construction, pas par un tirage-puis-vérification).
  const indexClasseModale = randomInt(0, nombreClasses - 1);
  const effectifs = tirerEffectifsLibres(nombreClasses);
  const autres = effectifs.filter((_, i) => i !== indexClasseModale);
  const maxAutres = Math.max(...autres);
  effectifs[indexClasseModale] = maxAutres + randomInt(MARGE_MODE_MIN, MARGE_MODE_MAX);

  // n toujours PAIR (`promptgen33gen35precisionlecture.md`, Correction 1) — sinon les seuils Q1
  // (n/4) et Q3 (3n/4) tombent parfois sur une valeur à 2 décimales exactes (",25"/",75"), jamais
  // positionnable exactement sur le pas de snap 0,1 de la barre de seuil (`PAS_SNAP_BARRE`,
  // `LectureQuartileGraph.tsx`) ; un n pair garantit au contraire n/2 toujours entier et n/4 toujours
  // multiple de 0,5. Le bit manquant éventuel est absorbé par la classe modale déjà strictement
  // supérieure aux autres — l'augmenter d'une unité de plus ne remet jamais en cause cette
  // supériorité stricte, aucune boucle de secours nécessaire.
  if (effectifs.reduce((acc, e) => acc + e, 0) % 2 !== 0) {
    effectifs[indexClasseModale] += 1;
  }

  const cumules = cumuler(effectifs);
  const n = cumules[cumules.length - 1];
  const seuil = n / 2;
  const seuilQ1 = n / 4;
  const seuilQ3 = (3 * n) / 4;

  let borneCourante = borneDepart;
  const classes: ClasseMediane[] = amplitudes.map((amplitude, i) => {
    const borneInf = borneCourante;
    const borneSup = borneInf + amplitude;
    borneCourante = borneSup;
    return { borneInf, borneSup, effectif: effectifs[i], effectifCumule: cumules[i] };
  });

  const xMin = classes[0].borneInf;
  const xMax = classes[classes.length - 1].borneSup;
  const classeModale = classes[indexClasseModale];

  const donneesPosition = { type: "classes" as const, classes };
  const etendue = xMax - xMin;
  const precision = precisionLecture(etendue);

  return {
    contexte,
    variante: "classes",
    n,
    seuil,
    classes,
    xMin,
    xMax,
    etendue,
    mediane: arrondirSelonPrecisionLecture(calculerParametreDePosition(donneesPosition, seuil).valeur, precision),
    seuilQ1,
    q1: arrondirSelonPrecisionLecture(calculerParametreDePosition(donneesPosition, seuilQ1).valeur, precision),
    seuilQ3,
    q3: arrondirSelonPrecisionLecture(calculerParametreDePosition(donneesPosition, seuilQ3).valeur, precision),
    indexClasseModale,
    modeCentreClasseModale: (classeModale.borneInf + classeModale.borneSup) / 2,
  };
}

/** Construit un exercice pour une variante forcée (convention CLAUDE.md, "Catalogue de
 * variantes..."). `overrides?.contexte` permet de forcer aussi le contexte narratif
 * (`promptgen33contexte.md`) — sans lui, un contexte est tiré aléatoirement dans la banque
 * partagée, comme le générateur brut (les fixtures de test construisent directement un
 * `ExerciceMediane` à la main plutôt que de passer par ce générateur pour leurs autres besoins,
 * même principe que "Moyenne pondérée"). */
export function construireAvecVarianteId(
  varianteId: VarianteMediane,
  overrides?: { contexte?: ContexteBienaymeTchebychev },
): ExerciceMediane {
  const contexte = overrides?.contexte ?? CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
  return varianteId === "discrete" ? construireDiscrete(contexte) : construireClasses(contexte);
}

export function genererExerciceMediane(): ExerciceMediane {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
