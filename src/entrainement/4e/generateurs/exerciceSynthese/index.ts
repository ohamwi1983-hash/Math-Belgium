/**
 * Couche A — "Exercice de synthèse" (chapitre 5, remplace "Étendue et écart interquartile", gen35).
 * N'importe que la banque de contextes déjà partagée pour "Inégalité de Bienaymé-Tchebychev"
 * (`generateurs/bienaymeTchebychev/contextes.ts`, import générateur→générateur, explicitement
 * autorisé — voir CLAUDE.md) ; sinon totalement indépendant, comme les 5 générateurs sources.
 *
 * **Variante `"discrete"` — construction "offsets à somme pondérée nulle"** (dupliquée depuis
 * `generateurs/dispersion/index.ts::genererExerciceDispersion`, pas importée — contrats indépendants
 * entre générateurs du même chapitre, même principe que le reste du projet), **étendue** d'une
 * contrainte supplémentaire (au moins un effectif doit se distinguer, pour que l'écran "Min, max et
 * mode(s)" — repris de "Paramètres de position" — ait une réponse non triviale) et des calculs
 * médiane/Q1/Q3 (`calculerParametreDePosition`, `generateurs/mediane/parametreDePosition.ts`, import
 * générateur→générateur) : $\bar{x}$ choisi comme un ENTIER en premier, chaque $x_i$ construit comme
 * $\bar{x}+d_i$ (un écart entier signé), le dernier écart dérivé pour annuler exactement
 * $\Sigma(d_i\cdot n_i)$ — garantit PAR CONSTRUCTION $\Sigma(x_i\cdot n_i)/n=\bar{x}$ EXACTEMENT,
 * sans aucune boucle "arrondi propre".
 *
 * **Variante `"classes"` — combine 3 constructions déjà établies dans une seule boucle de secours** :
 * $\bar{x}$ = la vraie moyenne calculée sur les CENTRES de classe, arrondie proprement à 2 décimales
 * par la même boucle que "Moyenne pondérée" variante B (`n` toujours un diviseur exact de 100,
 * `CANDIDATS_N=[10,20,50]` — `tirerEffectifs` partitionne ce `n` fixé — jamais un `n` dérivé après
 * coup comme "Paramètres de position" seul) ; la classe modale est choisie comme l'unique index
 * d'effectif maximal de cette MÊME partition (`indexUniqueMax`, jamais une marge forcée séparément
 * — une simple condition de rejet ajoutée à la boucle de secours déjà nécessaire pour $\bar{x}$,
 * jamais une seconde boucle indépendante) ; médiane/Q1/Q3 interpolés sur le polygone des effectifs
 * cumulés (`calculerParametreDePosition`), arrondis au PALIER DE PRÉCISION applicable à l'amplitude
 * du caractère (`precisionLecture`/`arrondirSelonPrecisionLecture`, dupliquées depuis
 * `generateurs/mediane/index.ts` — jamais importées, contrats indépendants entre générateurs du même
 * chapitre — voir sa documentation pour le détail des 4 paliers, `promptgen33gen35precisionlecture.md`)
 * — remplace l'ancien arrondi INCONDITIONNEL à 1 décimale (`arrondi1`), désormais réservé au seul
 * palier ≤20. `n` toujours PAIR (même correctif, Correction 1 — `CANDIDATS_N` n'a d'ailleurs plus
 * besoin de `25`, remplacé par `50`, déjà pair et toujours diviseur exact de 100) — sinon les seuils
 * Q1/Q3 tomberaient parfois sur une valeur à 2 décimales exactes, jamais positionnable sur le pas de
 * snap 0,1 de la barre de seuil (`PAS_SNAP_BARRE`, `LectureQuartileGraph.tsx`, composant réutilisé
 * tel quel depuis "Paramètres de position").
 *
 * **Étapes "gen34"/"gen37" (dispersion, Bienaymé-Tchebychev)** — calculées à partir de $\bar{x}$ DÉJÀ
 * confirmé à l'étape 1 (jamais un $\bar{x}$ redonné arbitrairement, contrairement à "Paramètres de
 * dispersion"/"Inégalité de Bienaymé-Tchebychev" pris isolément) : même cascade de valeurs déjà
 * arrondies que ces deux générateurs (`sommeProduits` exact → `varianceAttendue` arrondie à 2
 * décimales → `ecartTypeAttendu` déduit de cette variance DÉJÀ arrondie). `kBT` toujours FIXÉ à 2
 * (jamais résolu comme dans "Inégalité de Bienaymé-Tchebychev") — `borneInfBT`/`borneSupBT` calculés
 * directement, `pourcentAttenduBT` toujours exactement 75.
 *
 * **Cadrage de la boîte à moustaches** (`bornePlage`) — même construction que "Boîte à moustaches"
 * (`calculerBornePlage`, dupliquée pas importée).
 *
 * **Arrondi à 2 décimales** (`varianceAttendue`/`ecartTypeAttendu`/`borneInfBT`/`borneSupBT`/
 * `pourcentAttenduBT`, et `xBar` de la variante `"classes"`) — réutilise DIRECTEMENT `arrondi2`
 * (`generateurs/bienaymeTchebychev/arrondis.ts`, import générateur→générateur, protégé par un
 * epsilon `1e-9` contre le bruit de virgule flottante), jamais une réimplémentation locale
 * (`promptcorrectionsauditgroupees.md`, point 4) — même arrondi standard que le `k` résolu de
 * "Inégalité de Bienaymé-Tchebychev", même si l'arrondi "vers l'extérieur"
 * (`arrondiVersLeBas`/`arrondiVersLeHaut`) de ce dernier n'a ici aucune raison d'être : `kBT=2`
 * est une constante exacte, jamais elle-même approximée dans cette synthèse, contrairement au `k`
 * résolu de gen37 — mais ça ne change rien à l'arrondi standard des VALEURS qui en dépendent.
 */
import type {
  ClasseSynthese,
  ExerciceSynthese,
  ExerciceSyntheseClasses,
  ExerciceSyntheseDiscrete,
  LigneSynthese,
  VarianteExerciceSynthese,
} from "../../core/exerciceSynthese.types";
import type { ContexteBienaymeTchebychev } from "../../core/bienaymeTchebychev.types";
import type { PlageAxe } from "../../core/boiteMoustaches.types";
import { arrondi2 } from "../bienaymeTchebychev/arrondis";
import { CONTEXTES } from "../bienaymeTchebychev/contextes";
import { calculerParametreDePosition } from "../mediane/parametreDePosition";
import { randomInt } from "./aleatoire";

// ============================================================================
// Constantes — variante "discrete" (offsets à somme pondérée nulle, dupliquées depuis
// "Paramètres de dispersion").
// ============================================================================

const K_LIGNES_MIN = 4;
const K_LIGNES_MAX = 6;
const OFFSET_MAX = 6;
const EFFECTIF_LIGNE_MIN = 2;
const EFFECTIF_LIGNE_MAX = 8;
const MAX_TENTATIVES_DISCRETE = 2000;

// ============================================================================
// Constantes — variante "classes" (dupliquées depuis "Moyenne pondérée"/"Paramètres de position").
// ============================================================================

/** `n` toujours un diviseur exact de 100 ET toujours PAIR (`promptgen33gen35precisionlecture.md`,
 * Correction 1 — sinon les seuils Q1/Q3 tombent parfois sur ",25"/",75", jamais positionnable
 * exactement au pas de snap 0,1 de la barre de seuil) — `50` remplace `25` (impair) dans ce pool,
 * toujours un diviseur exact de 100 comme les deux autres, aucune contrainte supplémentaire
 * nécessaire (contrairement à "Paramètres de position" seul, où `n` est dérivé APRÈS la
 * construction des effectifs — ici il est tiré directement dans ce pool déjà tout pair). */
const CANDIDATS_N: readonly number[] = [10, 20, 50];
const NOMBRE_CLASSES_MIN = 4;
const NOMBRE_CLASSES_MAX = 5;
const AMPLITUDE_MIN = 2;
const AMPLITUDE_MAX = 5;
const JITTER_BORNE_DEPART = 3;
/** Bornée plus haut que "Moyenne pondérée" seul (300) : cette construction combine DEUX conditions
 * de rejet simultanées (moyenne arrondie proprement ET classe modale unique) dans la même boucle,
 * réduisant le taux de succès par tentative. */
const MAX_TENTATIVES_CLASSES = 4000;

/** k fixé (jamais résolu) pour l'étape Bienaymé-Tchebychev — voir en-tête du fichier. */
const K_BT = 2;

/** Marge fixe de chaque côté des données réelles pour le cadrage de la boîte à moustaches —
 * dupliquée depuis "Boîte à moustaches" (`MARGE_AXE`). */
const MARGE_AXE_BOITE = 2;

function calculerBornePlage(minReel: number, maxReel: number): PlageAxe {
  return { min: Math.max(0, minReel - MARGE_AXE_BOITE), max: maxReel + MARGE_AXE_BOITE };
}

/** Palier de précision de lecture selon l'amplitude du caractère — dupliqué depuis
 * `moteur/verificationMediane.ts::precisionLecture` (jamais importé, règle Couche A↔B non
 * négociable) et depuis `generateurs/mediane/index.ts` (même duplication, entre générateurs
 * frères du même chapitre) — voir CLAUDE.md, section dédiée, pour le détail complet des 4 paliers.
 * **Amplitude toujours bornée à [8,25] sous la génération actuelle** (`AMPLITUDE_MIN`/`AMPLITUDE_MAX`
 * ci-dessus) — vérifié empiriquement sur 5000 tirages du **vrai** générateur : le palier "0,1"
 * (≤20) domine (~94%), le palier "1" (20–100) est bel et bien atteint (~6%, jamais un cas purement
 * théorique) ; seuls les paliers "5"/"20" restent hors de portée, décision de scope assumée, voir
 * CLAUDE.md. */
function precisionLecture(amplitude: number): number {
  if (amplitude <= 20) return 0.1;
  if (amplitude <= 100) return 1;
  if (amplitude <= 1000) return 5;
  return 20;
}

/** Arrondit au pas de précision du palier applicable (`promptgen33gen35precisionlecture.md`) —
 * remplace l'ancien arrondi INCONDITIONNEL à 1 décimale (`arrondi1`) : le palier ≤20 (0,1) reste une
 * branche spéciale reproduisant EXACTEMENT l'ancien `arrondi1`, jamais `Math.round(x/0.1)*0.1` (bruit
 * de virgule flottante) ; les paliers 1/5/20 sont des entiers exacts, sans risque. */
function arrondirSelonPrecisionLecture(valeur: number, precision: number): number {
  if (precision === 0.1) return Math.round(valeur * 10) / 10;
  return Math.round(valeur / precision) * precision;
}

/** Vrai si `valeur`, une fois arrondie à 2 décimales, reproduit exactement la valeur mathématique
 * réelle (à un bruit de virgule flottante minime près) — dupliqué depuis "Moyenne pondérée". */
function arrondiPropre(valeur: number): boolean {
  return Math.abs(Math.round(valeur * 100) / 100 - valeur) < 1e-9;
}

function tirerContexte(): ContexteBienaymeTchebychev {
  return CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
}

/** Effectifs cumulés v_i — dupliqué depuis "Paramètres de position". */
function cumuler(effectifs: number[]): number[] {
  const cumules: number[] = [];
  let acc = 0;
  for (const e of effectifs) {
    acc += e;
    cumules.push(acc);
  }
  return cumules;
}

/** Toutes les valeurs x_i dont l'effectif est maximal — dupliqué depuis "Paramètres de position". */
function calculerModes(lignes: LigneSynthese[]): number[] {
  const effectifMax = Math.max(...lignes.map((l) => l.effectif));
  return lignes.filter((l) => l.effectif === effectifMax).map((l) => l.valeur);
}

// ============================================================================
// Variante "discrete"
// ============================================================================

/** Tire `count` écarts entiers DISTINCTS dans `[min,max]` — `null` si la plage est trop étroite —
 * dupliqué depuis "Paramètres de dispersion". */
function tirerOffsetsDistincts(count: number, min: number, max: number): number[] | null {
  if (max - min + 1 < count) return null;
  const offsets = new Set<number>();
  let tentative = 0;
  while (offsets.size < count && tentative < 200) {
    tentative++;
    offsets.add(randomInt(min, max));
  }
  return offsets.size === count ? [...offsets] : null;
}

function construireDiscrete(contexte: ContexteBienaymeTchebychev): ExerciceSyntheseDiscrete {
  for (let tentative = 0; tentative < MAX_TENTATIVES_DISCRETE; tentative++) {
    const [plageMin, plageMax] = contexte.plageXBar;
    const xBar = Math.round(plageMin + Math.random() * (plageMax - plageMin));
    const k = randomInt(K_LIGNES_MIN, K_LIGNES_MAX);

    const offsetMin = Math.max(-OFFSET_MAX, -xBar);
    const offsetMax = OFFSET_MAX;

    const offsetsLibres = tirerOffsetsDistincts(k - 1, offsetMin, offsetMax);
    if (offsetsLibres === null) continue;
    const effectifsLibres = Array.from({ length: k - 1 }, () => randomInt(EFFECTIF_LIGNE_MIN, EFFECTIF_LIGNE_MAX));
    const sommePartielle = offsetsLibres.reduce((acc, d, i) => acc + d * effectifsLibres[i], 0);

    let dernierOffset: number;
    let dernierEffectif: number;
    if (sommePartielle === 0) {
      dernierOffset = 0;
      dernierEffectif = randomInt(EFFECTIF_LIGNE_MIN, EFFECTIF_LIGNE_MAX);
    } else {
      dernierEffectif = randomInt(EFFECTIF_LIGNE_MIN, EFFECTIF_LIGNE_MAX);
      if (sommePartielle % dernierEffectif !== 0) continue;
      dernierOffset = -sommePartielle / dernierEffectif;
      if (dernierOffset < offsetMin || dernierOffset > offsetMax) continue;
    }
    if (offsetsLibres.includes(dernierOffset)) continue;

    const tousOffsets = [...offsetsLibres, dernierOffset];
    const tousEffectifs = [...effectifsLibres, dernierEffectif];

    // Au moins un effectif doit se distinguer — sinon "Min, max et mode(s)" (repris de "Paramètres
    // de position") n'aurait aucune réponse non triviale (tous les x_i seraient modes à la fois).
    if (new Set(tousEffectifs).size === 1) continue;

    const paires = tousOffsets
      .map((d, i) => ({ valeur: xBar + d, effectif: tousEffectifs[i] }))
      .sort((a, b) => a.valeur - b.valeur);

    const n = paires.reduce((acc, p) => acc + p.effectif, 0);
    const cumules = cumuler(paires.map((p) => p.effectif));
    const lignes: LigneSynthese[] = paires.map((p, i) => ({
      valeur: p.valeur,
      effectif: p.effectif,
      effectifCumule: cumules[i],
      produitAttendu: (p.valeur - xBar) ** 2 * p.effectif,
    }));

    const sommeXN = lignes.reduce((acc, l) => acc + l.valeur * l.effectif, 0);
    const sommeProduits = lignes.reduce((acc, l) => acc + l.produitAttendu, 0);

    const seuil = n / 2;
    const seuilQ1 = n / 4;
    const seuilQ3 = (3 * n) / 4;
    const donneesPosition = { type: "discrete" as const, valeurs: lignes.map((l) => l.valeur), cumules };
    const { index: indexMediane, valeur: mediane } = calculerParametreDePosition(donneesPosition, seuil);
    const { index: indexQ1, valeur: q1 } = calculerParametreDePosition(donneesPosition, seuilQ1);
    const { index: indexQ3, valeur: q3 } = calculerParametreDePosition(donneesPosition, seuilQ3);

    const min = lignes[0].valeur;
    const max = lignes[lignes.length - 1].valeur;

    const varianceAttendue = arrondi2(sommeProduits / n);
    const ecartTypeAttendu = arrondi2(Math.sqrt(varianceAttendue));

    const borneInfBT = arrondi2(xBar - K_BT * ecartTypeAttendu);
    const borneSupBT = arrondi2(xBar + K_BT * ecartTypeAttendu);
    const pourcentAttenduBT = arrondi2(100 * (1 - 1 / K_BT ** 2));

    return {
      contexte,
      variante: "discrete",
      n,
      sommeXN,
      xBar,
      seuil,
      seuilQ1,
      seuilQ3,
      mediane,
      q1,
      q3,
      bornePlage: calculerBornePlage(min, max),
      sommeProduits,
      varianceAttendue,
      ecartTypeAttendu,
      kBT: K_BT,
      borneInfBT,
      borneSupBT,
      pourcentAttenduBT,
      lignes,
      indexMediane,
      indexQ1,
      indexQ3,
      min,
      max,
      modes: calculerModes(lignes),
    };
  }

  throw new Error(`construireDiscrete (exerciceSynthese) : impossible de construire un exercice valide après ${MAX_TENTATIVES_DISCRETE} tentatives`);
}

// ============================================================================
// Variante "classes"
// ============================================================================

/** Tire une amplitude PAR CLASSE — dupliqué depuis "Moyenne pondérée"/"Paramètres de position",
 * garantit au moins deux amplitudes distinctes. */
function tirerAmplitudes(nombreClasses: number): number[] {
  let amplitudes: number[];
  let tentative = 0;
  do {
    tentative++;
    amplitudes = Array.from({ length: nombreClasses }, () => randomInt(AMPLITUDE_MIN, AMPLITUDE_MAX));
  } while (new Set(amplitudes).size < 2 && tentative < MAX_TENTATIVES_CLASSES);
  return amplitudes;
}

/** Répartit `n` en `k` parts strictement positives — dupliqué depuis "Moyenne pondérée". */
function tirerEffectifs(n: number, k: number): number[] {
  const effectifs = new Array(k).fill(1) as number[];
  let reste = n - k;
  while (reste > 0) {
    effectifs[randomInt(0, k - 1)] += 1;
    reste -= 1;
  }
  return effectifs;
}

/** Index de l'UNIQUE effectif maximal du tableau — `null` s'il y a égalité entre 2+ classes (la
 * boucle de secours de `construireClasses` retire alors un nouveau tirage). Combine ainsi, dans une
 * seule condition de rejet, la même garantie "classe modale sans ex-aequo" que "Paramètres de
 * position" (gen33, marge forcée) — mais dérivée directement d'une partition déjà valide plutôt
 * qu'une marge additionnelle qui romprait la contrainte `n` = diviseur exact de 100. */
function indexUniqueMax(effectifs: number[]): number | null {
  const maxEffectif = Math.max(...effectifs);
  const indices: number[] = [];
  effectifs.forEach((e, i) => {
    if (e === maxEffectif) indices.push(i);
  });
  return indices.length === 1 ? indices[0] : null;
}

function construireClasses(contexte: ContexteBienaymeTchebychev): ExerciceSyntheseClasses {
  for (let tentative = 0; tentative < MAX_TENTATIVES_CLASSES; tentative++) {
    const nombreClasses = randomInt(NOMBRE_CLASSES_MIN, NOMBRE_CLASSES_MAX);
    const amplitudes = tirerAmplitudes(nombreClasses);
    const centre = (contexte.plageXBar[0] + contexte.plageXBar[1]) / 2;
    const etendueTotale = amplitudes.reduce((acc, a) => acc + a, 0);
    const borneDepart = Math.max(0, Math.round(centre - etendueTotale / 2) + randomInt(-JITTER_BORNE_DEPART, JITTER_BORNE_DEPART));
    const n = CANDIDATS_N[randomInt(0, CANDIDATS_N.length - 1)];
    const effectifs = tirerEffectifs(n, nombreClasses);

    const indexClasseModale = indexUniqueMax(effectifs);
    if (indexClasseModale === null) continue;

    const cumules = cumuler(effectifs);
    let borneCourante = borneDepart;
    const classes: ClasseSynthese[] = amplitudes.map((amplitude, i) => {
      const borneInf = borneCourante;
      const borneSup = borneInf + amplitude;
      borneCourante = borneSup;
      return { borneInf, borneSup, effectif: effectifs[i], centre: (borneInf + borneSup) / 2, effectifCumule: cumules[i] };
    });

    const sommeXN = classes.reduce((acc, c) => acc + c.centre * c.effectif, 0);
    const xBarBrut = sommeXN / n;
    if (!arrondiPropre(xBarBrut)) continue;
    const xBar = arrondi2(xBarBrut);

    const seuil = n / 2;
    const seuilQ1 = n / 4;
    const seuilQ3 = (3 * n) / 4;
    const donneesPosition = { type: "classes" as const, classes };

    const xMin = classes[0].borneInf;
    const xMax = classes[classes.length - 1].borneSup;
    const etendue = xMax - xMin;
    const precision = precisionLecture(etendue);
    const mediane = arrondirSelonPrecisionLecture(calculerParametreDePosition(donneesPosition, seuil).valeur, precision);
    const q1 = arrondirSelonPrecisionLecture(calculerParametreDePosition(donneesPosition, seuilQ1).valeur, precision);
    const q3 = arrondirSelonPrecisionLecture(calculerParametreDePosition(donneesPosition, seuilQ3).valeur, precision);

    const classeModale = classes[indexClasseModale];
    const modeCentreClasseModale = (classeModale.borneInf + classeModale.borneSup) / 2;

    // Sommes de dispersion calculées à partir du $\bar{x}$ DÉJÀ ARRONDI (celui affiché/validé à
    // l'étape 1) — jamais depuis `xBarBrut`, jamais recalculées différemment plus loin.
    const sommeProduits = classes.reduce((acc, c) => acc + (c.centre - xBar) ** 2 * c.effectif, 0);
    const varianceAttendue = arrondi2(sommeProduits / n);
    const ecartTypeAttendu = arrondi2(Math.sqrt(varianceAttendue));

    const borneInfBT = arrondi2(xBar - K_BT * ecartTypeAttendu);
    const borneSupBT = arrondi2(xBar + K_BT * ecartTypeAttendu);
    const pourcentAttenduBT = arrondi2(100 * (1 - 1 / K_BT ** 2));

    return {
      contexte,
      variante: "classes",
      n,
      sommeXN,
      xBar,
      seuil,
      seuilQ1,
      seuilQ3,
      mediane,
      q1,
      q3,
      bornePlage: calculerBornePlage(xMin, xMax),
      sommeProduits,
      varianceAttendue,
      ecartTypeAttendu,
      kBT: K_BT,
      borneInfBT,
      borneSupBT,
      pourcentAttenduBT,
      classes,
      xMin,
      xMax,
      etendue,
      indexClasseModale,
      modeCentreClasseModale,
    };
  }

  throw new Error(`construireClasses (exerciceSynthese) : impossible de construire un exercice valide après ${MAX_TENTATIVES_CLASSES} tentatives`);
}

// ============================================================================
// Catalogue de variantes (convention CLAUDE.md) + générateur brut.
// ============================================================================

export const CATALOGUE_VARIANTES: { id: VarianteExerciceSynthese; label: string }[] = [
  { id: "discrete", label: "Données discrètes (x_i / n_i)" },
  { id: "classes", label: "Données groupées en classes" },
];

/** Construit un exercice pour une variante forcée (convention CLAUDE.md, "Catalogue de
 * variantes..."). `overrides?.contexte` permet de forcer aussi le contexte narratif — sans lui, un
 * contexte est tiré aléatoirement dans la banque partagée, comme le générateur brut. */
export function construireAvecVarianteId(
  varianteId: VarianteExerciceSynthese,
  overrides?: { contexte?: ContexteBienaymeTchebychev },
): ExerciceSynthese {
  const contexte = overrides?.contexte ?? tirerContexte();
  return varianteId === "discrete" ? construireDiscrete(contexte) : construireClasses(contexte);
}

export function genererExerciceSynthese(): ExerciceSynthese {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
