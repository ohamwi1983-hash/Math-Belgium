import type { ExerciceExpoProbG } from "../../../core6e/exponentiellesProblemes.types";
import { CONTEXTES_G } from "../contextes";
import { arrondir, tirerEntier, tirerParmi } from "../aleatoire";

const A_POOL = [0.5, 1, 1.5, 2] as const;
const CIBLES_TSEUIL = [2, 3, 4, 5] as const;

/**
 * Famille G — "génération par construction" : un temps seuil CIBLE (entier) est choisi d'abord,
 * `sAffiche` est DÉRIVÉ de lui (`c+e^(k-a·tSeuilCible)`, arrondi à 1 décimale pour l'affichage),
 * puis le VRAI `tSeuil` (réponse attendue) est RECALCULÉ depuis `sAffiche` arrondi.
 *
 * Audit 6e ch. 2 (contextes réécrits, décision de l'utilisateur) : le contexte est tiré d'abord,
 * avec ses couples (c, k) réalistes (pneu de 2,7 à 3,7 bars, citerne de 2,7 à 7,4 m…) et un
 * OBJECTIF explicite — « rester » au-dessus du seuil pendant la durée D, ou l'« atteindre » avant
 * la fin de D. La durée D est tirée de part ou d'autre du temps seuil (au moins 0,3 unité d'écart),
 * une fois sur deux de chaque côté : le verdict oui / non est équilibré (« atteignable » sortait
 * 81 % du temps). Temps seuil cible ≥ 2 : une durée entière ≥ 1 existe des deux côtés.
 */
export function construireG(): ExerciceExpoProbG {
  const contexte = tirerParmi(CONTEXTES_G);
  const { c, k } = tirerParmi(contexte.combinaisons);
  // Côté de la durée tiré UNE fois, avant la boucle : un rejet (durée < 1) ne le retire pas, sinon
  // le verdict pencherait vers « après le seuil » (mesuré 42/58 quand il était retiré).
  const avantSeuil = tirerParmi([true, false]);
  for (;;) {
    const a = tirerParmi(A_POOL);
    const candidats = CIBLES_TSEUIL.filter((t) => k - a * t >= -2.5);
    if (candidats.length === 0) continue;
    const tSeuilCible = tirerParmi(candidats);
    const sAffiche = arrondir(c + Math.exp(k - a * tSeuilCible), 1);
    if (sAffiche - c < 0.05) continue;
    const tSeuil = (k - Math.log(sAffiche - c)) / a;
    const duree = avantSeuil ? Math.floor(tSeuil - 0.3) - tirerEntier(0, 1) : Math.ceil(tSeuil + 0.3) + tirerEntier(0, 1);
    if (duree < 1 || Math.abs(duree - tSeuil) < 0.3) continue;
    // « rester » au-dessus du seuil pendant D : oui ⟺ D ≤ temps seuil ; « atteindre » le seuil avant
    // la fin de D : oui ⟺ temps seuil ≤ D.
    const verdictOui = contexte.objectif === "rester" ? duree <= tSeuil : tSeuil <= duree;

    const borneEval = Math.max(2, Math.round(tSeuil) + 2);
    const t1 = tirerEntier(1, borneEval);
    let t2 = tirerEntier(1, borneEval);
    while (t2 === t1) t2 = tirerEntier(1, borneEval);
    const [tEval1, tEval2] = [t1, t2].sort((x, y) => x - y);
    const fEval1 = c + Math.exp(k - a * tEval1);
    const fEval2 = c + Math.exp(k - a * tEval2);

    return { famille: "G", contexteId: contexte.id, objectif: contexte.objectif, verdictOui, c, k, a, sAffiche, tSeuil, duree, tEval1, tEval2, fEval1, fEval2 };
  }
}
