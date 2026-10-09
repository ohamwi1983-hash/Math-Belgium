import type { ExerciceLogProbA, ExerciceLogProbA_ResoudreT, ExerciceLogProbA_ResoudreTaux, ExerciceLogProbA_TauxDecroissance } from "../../../core6e/logarithmesProblemes.types";
import { CONTEXTES_A_CROISSANCE, CONTEXTES_A_DECROISSANCE, CONTEXTES_A_TAUX, CONTEXTES_A_TAUX_DECROISSANCE } from "../contextes";
import { arrondir, tirerDeuxEntiersDistinctsTries, tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille A — 3 sous-types (voir en-tête `core6e/logarithmesProblemes.types.ts`).
 *
 * **"génération par construction"** pour le sous-type "resoudreT" : on tire d'abord un temps
 * "propre" `tCibleVoulu`, on EN DÉDUIT le seuil brut `Q0·r^tCibleVoulu`, puis on arrondit ce seuil
 * pour l'affichage (`cibleAffiche`, seule valeur montrée) — la réponse EXACTE de l'écran 3 est
 * ensuite RECALCULÉE depuis `cibleAffiche` (jamais depuis `tCibleVoulu`), conformément au principe
 * "toute référence dérive de la valeur réellement affichée". `Math.ceil` du temps continu ainsi
 * recalculé donne le nombre ENTIER de périodes — mathématiquement correct dans les deux sens
 * (croissance ET décroissance, la formule `ln(cible/Q0)/ln(r)` gérant nativement le changement de
 * sens de l'inégalité quand `r<1`, voir démonstration dans le prompt/`docs/historique-6e.md`).
 */

const T_CIBLE_MIN = 2;
const T_CIBLE_MAX = 15;

function resoudreEntierPeriodes(Q0: number, r: number, tCibleVoulu: number): { cibleAffiche: number; tExact: number; tReponse: number } {
  const cibleBrute = Q0 * Math.pow(r, tCibleVoulu);
  const cibleAffiche = arrondir(cibleBrute, 0);
  const tExact = Math.log(cibleAffiche / Q0) / Math.log(r);
  return { cibleAffiche, tExact, tReponse: Math.ceil(tExact) };
}

export function construireA_resoudreT(varianteForcee?: "simple" | "fenetre"): ExerciceLogProbA_ResoudreT {
  const variante = varianteForcee ?? tirerParmi(["simple", "fenetre"] as const);
  const croissance = tirerParmi([true, false]);
  const Q0 = tirerEntier(500, 5000);
  const p = tirerEntier(2, 10);
  const r = croissance ? 1 + p / 100 : 1 - p / 100;
  const contexte = tirerParmi(croissance ? CONTEXTES_A_CROISSANCE : CONTEXTES_A_DECROISSANCE);

  const [tCible1, tCible2] = tirerDeuxEntiersDistinctsTries(T_CIBLE_MIN, T_CIBLE_MAX);
  const un = resoudreEntierPeriodes(Q0, r, tCible1);
  const deux = resoudreEntierPeriodes(Q0, r, tCible2);

  return {
    famille: "A",
    sousType: "resoudreT",
    variante,
    contexteId: contexte.id,
    Q0,
    p,
    croissance,
    r,
    sens: croissance ? ">=" : "<=",
    cible1Affiche: un.cibleAffiche,
    t1Exact: un.tExact,
    t1Reponse: un.tReponse,
    cible2Affiche: deux.cibleAffiche,
    t2Exact: deux.tExact,
    t2Reponse: deux.tReponse,
  };
}

const FACTEURS_TAUX = [1.2, 1.5, 1.8, 2, 2.5, 3] as const;

export function construireA_resoudreTaux(): ExerciceLogProbA_ResoudreTaux {
  const Q0 = tirerEntier(1000, 10000);
  const n = tirerEntier(3, 10);
  const facteur = tirerParmi(FACTEURS_TAUX);
  const cibleAffiche = arrondir(Q0 * facteur, 0);
  const contexte = tirerParmi(CONTEXTES_A_TAUX);
  const i = Math.pow(cibleAffiche / Q0, 1 / n) - 1;

  return { famille: "A", sousType: "resoudreTaux", contexteId: contexte.id, Q0, n, cibleAffiche, i };
}

const POURCENT_BAISSE = [10, 20, 25, 30, 40, 50] as const;

export function construireA_tauxDecroissance(): ExerciceLogProbA_TauxDecroissance {
  const Q0 = tirerEntier(50, 2000);
  const pourcentBaisse = tirerParmi(POURCENT_BAISSE);
  const fraction = 1 - pourcentBaisse / 100;
  const h = tirerEntier(2, 20);
  const contexte = tirerParmi(CONTEXTES_A_TAUX_DECROISSANCE);
  const k = -Math.log(fraction) / h;

  return { famille: "A", sousType: "tauxDecroissance", contexteId: contexte.id, Q0, fraction, h, k };
}

export function construireA(): ExerciceLogProbA {
  const sousType = tirerParmi(["resoudreT", "resoudreTaux", "tauxDecroissance"] as const);
  if (sousType === "resoudreT") return construireA_resoudreT();
  if (sousType === "resoudreTaux") return construireA_resoudreTaux();
  return construireA_tauxDecroissance();
}
