/**
 * Couche A — "Paramètres de dispersion" (remplace "Mode et classe modale", `promptgen34remplacement.md`).
 * Aucun autre générateur importé pour la construction elle-même, sauf la banque de contextes déjà
 * partagée pour "Inégalité de Bienaymé-Tchebychev" (`generateurs/bienaymeTchebychev/contextes.ts`,
 * import générateur→générateur, explicitement autorisé par l'architecture du projet — voir CLAUDE.md).
 *
 * **Construction "offsets à somme pondérée nulle", jamais un tirage-puis-vérification indépendant
 * ligne par ligne.** Pour que `xBar` (toujours un entier DONNÉ) soit exactement la vraie moyenne du
 * tableau x_i/n_i (Σ(x_i·n_i)/n = xBar), chaque valeur est construite comme `x_i = xBar + d_i` (un
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
import type { ExerciceDispersion, LigneDispersion } from "../../core/dispersion.types";
import { CONTEXTES } from "../bienaymeTchebychev/contextes";
import { randomInt } from "./aleatoire";

const K_MIN = 4;
const K_MAX = 6;
const OFFSET_MAX = 6;
const EFFECTIF_MIN = 2;
const EFFECTIF_MAX = 8;
const MAX_TENTATIVES = 2000;

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

export function genererExerciceDispersion(): ExerciceDispersion {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const contexte = CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
    const [plageMin, plageMax] = contexte.plageXBar;
    const xBar = Math.round(plageMin + Math.random() * (plageMax - plageMin));
    const k = randomInt(K_MIN, K_MAX);

    const offsetMin = Math.max(-OFFSET_MAX, -xBar);
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
      .map((d, i) => ({ valeur: xBar + d, effectif: tousEffectifs[i] }))
      .sort((a, b) => a.valeur - b.valeur);

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
