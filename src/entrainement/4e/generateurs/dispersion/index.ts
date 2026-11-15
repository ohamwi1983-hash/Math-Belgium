/**
 * Couche A — "Paramètres de dispersion" (remplace "Mode et classe modale", `promptgen34remplacement.md`).
 * Deux familles (`CATALOGUE_VARIANTES`) : "valeurs" (construction historique ci-dessous, inchangée,
 * `construireValeurs`) et "classes" (données groupées en classes, centres et x̄ à calculer —
 * `construireClasses`, en fin de fichier). Le tirage libre choisit une famille sur deux.
 * Aucun autre générateur importé pour la construction elle-même, sauf la banque de contextes déjà
 * partagée pour "Inégalité de Bienaymé-Tchebychev" (`generateurs/bienaymeTchebychev/contextes.ts`,
 * import générateur→générateur, explicitement autorisé par l'architecture du projet — voir CLAUDE.md).
 *
 * **Construction "offsets à somme pondérée nulle", jamais un tirage-puis-vérification indépendant
 * ligne par ligne.** Pour que `xBar` (toujours un multiple DONNÉ de l'unité d'échelle) soit exactement la vraie moyenne du
 * tableau x_i/n_i (Σ(x_i·n_i)/n = xBar), chaque valeur est construite comme `x_i = xBar + d_i·unité` (un
 * écart entier signé) — `k-1` écarts et leurs effectifs sont tirés librement, puis le DERNIER écart
 * est dérivé pour annuler exactement Σ(d_i·n_i) sur l'ensemble des k lignes :
 * - si la somme partielle S des k-1 premiers termes est nulle, le dernier écart est simplement 0
 *   (une ligne légitimement égale à la moyenne — jamais un cas dégénéré, juste une valeur de plus) ;
 * - sinon, un effectif candidat est tiré pour la dernière ligne et le dernier écart en est déduit
 *   (`-S/effectif`) — retiré et retenté (boucle de secours bornée, même principe que
 *   `construireDeuxDenominateurs`/`chercherParametreEtRacines` ailleurs dans le projet) tant que
 *   cette division n'est pas exacte, que l'écart obtenu collisionne avec un écart déjà tiré, ou
 *   sort de la plage autorisée.
 *
 * Cette construction garantit PAR ELLE-MÊME (jamais par un test de rejet a posteriori sur la vraie
 * moyenne) que `xBar` reste exactement cohérent avec le tableau généré — et, `xBar`/x_i/n_i étant
 * TOUS des entiers, chaque produit `(x_i-xBar)²·n_i` est lui aussi TOUJOURS un entier exact, sans
 * qu'aucune contrainte supplémentaire ne soit nécessaire pour l'écran 1 (contrairement à "Moyenne
 * pondérée", qui a besoin d'une boucle "arrondiPropre" séparée pour sa moyenne elle-même).
 */
import type { ClasseDispersion, ExerciceDispersion, FamilleDispersion, LigneDispersion } from "../../core/dispersion.types";
import { CONTEXTES } from "../bienaymeTchebychev/contextes";
import { tirerEchelle, tirerEchelleCentree, valeurEchelle, valeursRealistes } from "../bienaymeTchebychev/echelleContexte";
import { randomInt } from "./aleatoire";

const K_MIN = 4;
const K_MAX = 6;
const OFFSET_MAX = 6;
const EFFECTIF_MIN = 2;
const EFFECTIF_MAX = 8;
const MAX_TENTATIVES = 2000;

/** Mise à l'échelle (audit chapitre 4) : les écarts entiers ±OFFSET_MAX sont multipliés par une
 * unité ronde (`tirerEchelleCentree`), pour couvrir au plus ±2σ d'un x̄ réaliste du contexte — plus
 * jamais des kilométrages à quelques km près. Unité ≥ 1 (produits (x_i − x̄)²·n_i toujours entiers)
 * et ≤ UNITE_MAX (au-delà, le tableau ne se calcule plus raisonnablement à la main : le contexte est
 * écarté, ex. kilométrages). */
const UNITE_MAX = 100;

function arrondir2(x: number): number {
  return Math.round(x * 100) / 100;
}

/** Tire `count` écarts entiers DISTINCTS dans `[min,max]` — `null` si la plage est trop étroite
 * pour en contenir autant (jamais un tirage infini). */
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

/** Famille historique "valeurs" (série discrète, x̄ donné) — construction inchangée. */
function construireValeurs(): ExerciceDispersion {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const contexte = CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
    const echelle = tirerEchelleCentree(contexte, OFFSET_MAX, { uniteMin: 1, uniteMax: UNITE_MAX });
    if (echelle === null) continue;
    const { xBar, unite } = echelle;
    const k = randomInt(K_MIN, K_MAX);

    const offsetMin = -OFFSET_MAX;
    const offsetMax = OFFSET_MAX;

    const offsetsLibres = tirerOffsetsDistincts(k - 1, offsetMin, offsetMax);
    if (offsetsLibres === null) continue;
    const effectifsLibres = Array.from({ length: k - 1 }, () => randomInt(EFFECTIF_MIN, EFFECTIF_MAX));
    const sommePartielle = offsetsLibres.reduce((acc, d, i) => acc + d * effectifsLibres[i], 0);

    let dernierOffset: number;
    let dernierEffectif: number;
    if (sommePartielle === 0) {
      dernierOffset = 0;
      dernierEffectif = randomInt(EFFECTIF_MIN, EFFECTIF_MAX);
    } else {
      dernierEffectif = randomInt(EFFECTIF_MIN, EFFECTIF_MAX);
      if (sommePartielle % dernierEffectif !== 0) continue;
      dernierOffset = -sommePartielle / dernierEffectif;
      if (dernierOffset < offsetMin || dernierOffset > offsetMax) continue;
    }
    if (offsetsLibres.includes(dernierOffset)) continue;

    const tousOffsets = [...offsetsLibres, dernierOffset];
    const tousEffectifs = [...effectifsLibres, dernierEffectif];

    const paires = tousOffsets
      .map((d, i) => ({ valeur: xBar + d * unite, effectif: tousEffectifs[i] }))
      .sort((a, b) => a.valeur - b.valeur);

    if (!valeursRealistes(contexte, paires.map((p) => p.valeur))) continue;

    const n = paires.reduce((acc, p) => acc + p.effectif, 0);
    const lignes: LigneDispersion[] = paires.map((p) => ({
      valeur: p.valeur,
      effectif: p.effectif,
      produitAttendu: (p.valeur - xBar) ** 2 * p.effectif,
    }));
    const sommeProduits = lignes.reduce((acc, l) => acc + l.produitAttendu, 0);

    const varianceAttendue = arrondir2(sommeProduits / n);
    const ecartTypeAttendu = arrondir2(Math.sqrt(varianceAttendue));

    return { contexte, n, xBar, lignes, sommeProduits, varianceAttendue, ecartTypeAttendu };
  }

  throw new Error(`genererExerciceDispersion : impossible de construire un exercice valide après ${MAX_TENTATIVES} tentatives`);
}

// ============================================================================
// Famille "classes" (fiche validée « Famille ajoutée à gen34 ») — données groupées en classes de
// même amplitude, l'élève calcule les centres et x̄, puis variance et écart-type avec les centres.
// ============================================================================

const NOMBRE_CLASSES_MIN = 4;
const NOMBRE_CLASSES_MAX = 5;
/** Amplitude d'une classe en unités de l'échelle (unité entière ≥ 1) : PAIRE, pour que chaque
 * centre tombe sur une unité entière (centres entiers, jamais « ,5 »). */
const AMPLITUDE_UNITES = 2;
const EFFECTIF_CLASSE_MIN = 2;
const EFFECTIF_CLASSE_MAX = 12;
const MAX_TENTATIVES_CLASSES = 4000;

/** Arrondi au dixième, sans bruit flottant. */
function arrondir1(x: number): number {
  return Math.round(x * 10) / 10;
}

/**
 * Valeurs « propres » par construction :
 * - bornes = origine + j·unité (unité ronde ≥ 1, `tirerEchelle`), amplitude 2 unités → centres
 *   entiers, Σ(centre·nᵢ) entier ;
 * - x̄ = Σ(centre·nᵢ)/n gardé seulement s'il a AU PLUS UNE décimale (rejet sinon) ;
 * - donc chaque écart (centre − x̄) a au plus 1 décimale, son carré au plus 2, et chaque produit
 *   (xᵢ − x̄)²·nᵢ ainsi que leur somme sont des décimaux EXACTS à au plus 2 décimales (stockés
 *   arrondis au centième pour effacer le bruit flottant) ;
 * - V et σ : même cascade d'arrondis à 2 décimales que la famille "valeurs" (convention du cours).
 * Rejetés aussi : les tirages où la moyenne SIMPLE des centres égale x̄ (effectifs symétriques —
 * le piège « x̄ non pondéré » serait invisible), et ceux où elle égale une moyenne calculée avec
 * les bornes (les deux pièges ne seraient plus distinguables).
 */
function construireClasses(): ExerciceDispersion {
  for (let tentative = 0; tentative < MAX_TENTATIVES_CLASSES; tentative++) {
    const contexte = CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
    const k = randomInt(NOMBRE_CLASSES_MIN, NOMBRE_CLASSES_MAX);
    const echelle = tirerEchelle(contexte, k * AMPLITUDE_UNITES, { uniteMin: 1, uniteMax: UNITE_MAX });
    if (echelle === null) continue;
    const effectifs = Array.from({ length: k }, () => randomInt(EFFECTIF_CLASSE_MIN, EFFECTIF_CLASSE_MAX));
    const classes: ClasseDispersion[] = effectifs.map((effectif, j) => ({
      borneInf: valeurEchelle(echelle, AMPLITUDE_UNITES * j),
      borneSup: valeurEchelle(echelle, AMPLITUDE_UNITES * (j + 1)),
      effectif,
      centre: valeurEchelle(echelle, AMPLITUDE_UNITES * j + AMPLITUDE_UNITES / 2),
    }));
    if (!valeursRealistes(contexte, [classes[0].borneInf, classes[k - 1].borneSup])) continue;

    const n = effectifs.reduce((acc, e) => acc + e, 0);
    const sommeCentresN = classes.reduce((acc, c) => acc + c.centre * c.effectif, 0);
    const xBarBrut = sommeCentresN / n;
    const xBar = arrondir1(xBarBrut);
    if (Math.abs(xBar - xBarBrut) > 1e-9) continue;
    const moyenneNonPonderee = classes.reduce((acc, c) => acc + c.centre, 0) / k;
    if (Math.abs(moyenneNonPonderee - xBar) < 0.05) continue;
    const demiAmplitude = classes[0].centre - classes[0].borneInf;
    // Les deux pièges doivent rester distinguables : la moyenne simple des centres ne doit pas
    // coïncider avec une moyenne « avec les bornes » (x̄ ∓ demi-amplitude).
    if (Math.abs(moyenneNonPonderee - (xBar - demiAmplitude)) < 0.06 || Math.abs(moyenneNonPonderee - (xBar + demiAmplitude)) < 0.06) continue;

    const lignes: LigneDispersion[] = classes.map((c) => ({
      valeur: c.centre,
      effectif: c.effectif,
      produitAttendu: arrondir2((c.centre - xBar) ** 2 * c.effectif),
    }));
    const sommeProduits = arrondir2(lignes.reduce((acc, l) => acc + l.produitAttendu, 0));
    const varianceAttendue = arrondir2(sommeProduits / n);
    const ecartTypeAttendu = arrondir2(Math.sqrt(varianceAttendue));

    return {
      contexte,
      n,
      xBar,
      lignes,
      sommeProduits,
      varianceAttendue,
      ecartTypeAttendu,
      enClasses: {
        classes,
        sommeCentresN,
        moyenneBornesInf: arrondir2(xBar - demiAmplitude),
        moyenneBornesSup: arrondir2(xBar + demiAmplitude),
        moyenneNonPonderee,
      },
    };
  }

  throw new Error(`construireClasses (dispersion) : impossible de construire un exercice valide après ${MAX_TENTATIVES_CLASSES} tentatives`);
}

// ============================================================================
// Catalogue de variantes (`SelecteurVarianteDev`, adaptateur d'export, `?code=`).
// ============================================================================

export const CATALOGUE_VARIANTES: { id: FamilleDispersion; label: string }[] = [
  { id: "valeurs", label: "Valeurs discrètes, x̄ donné" },
  { id: "classes", label: "Données en classes, x̄ à calculer" },
];

export function construireAvecVarianteId(varianteId: FamilleDispersion): ExerciceDispersion {
  return varianteId === "classes" ? construireClasses() : construireValeurs();
}

/** Tirage libre : une famille au hasard (une chance sur deux), puis sa construction. */
export function genererExerciceDispersion(): ExerciceDispersion {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
