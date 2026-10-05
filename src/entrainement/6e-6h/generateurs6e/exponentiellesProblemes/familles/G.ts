import type { ExerciceExpoProbG } from "../../../core6e/exponentiellesProblemes.types";
import { CONTEXTES_G } from "../contextes";
import { arrondir, tirerEntier, tirerParmi } from "../aleatoire";

const C_POOL = [0, 1, 2] as const;
const K_POOL = [0, 1, 2] as const;
const A_POOL = [0.5, 1, 1.5, 2] as const;
const CIBLES_TSEUIL = [1, 2, 3, 4, 5] as const;

/**
 * Famille G — "génération par construction" : un temps seuil CIBLE (nice) est choisi d'abord,
 * `sAffiche` est DÉRIVÉ de lui (`c+e^(k-a·tSeuilCible)`, arrondi à 1 décimale pour l'affichage),
 * puis le VRAI `tSeuil` (réponse attendue) est RECALCULÉ depuis `sAffiche` arrondi — jamais la
 * cible elle-même, qui a pu légèrement bouger avec l'arrondi (même principe que familles C/D).
 *
 * Les cibles candidates sont filtrées pour garantir `e^(k-a·tSeuilCible) >= e^-2.5 ≈ 0,082` — sans
 * ce garde-fou, un couple (k petit, a grand, cible grande) donnerait un résidu qui arrondit à 0,0,
 * rendant `sAffiche-c` nul et `tSeuil` infini (ln(0)).
 */
export function construireG(): ExerciceExpoProbG {
  const c = tirerParmi(C_POOL);
  const k = tirerParmi(K_POOL);
  const a = tirerParmi(A_POOL);
  const contexte = tirerParmi(CONTEXTES_G);

  const candidats = CIBLES_TSEUIL.filter((t) => k - a * t >= -2.5);
  const tSeuilCible = tirerParmi(candidats.length > 0 ? candidats : [1]);
  const sAffiche = arrondir(c + Math.exp(k - a * tSeuilCible), 1);
  const tSeuil = (k - Math.log(sAffiche - c)) / a;

  // Environ la moitié des tirages donnent une durée ATTEIGNABLE (duree>=tSeuil), l'autre moitié
  // non (duree<tSeuil) — variabilité assumée (spec explicite).
  const borneOffset = Math.max(1, Math.floor(tSeuil));
  const atteignable = tSeuil <= 2 || tirerParmi([true, false]);
  const duree = atteignable ? Math.round(tSeuil) + tirerEntier(1, 4) : Math.max(1, Math.round(tSeuil) - tirerEntier(1, borneOffset));

  const borneEval = Math.max(2, Math.round(tSeuil) + 2);
  const t1 = tirerEntier(1, borneEval);
  let t2 = tirerEntier(1, borneEval);
  while (t2 === t1) t2 = tirerEntier(1, borneEval);
  const [tEval1, tEval2] = [t1, t2].sort((x, y) => x - y);

  const fEval1 = c + Math.exp(k - a * tEval1);
  const fEval2 = c + Math.exp(k - a * tEval2);

  return { famille: "G", contexteId: contexte.id, c, k, a, sAffiche, tSeuil, duree, tEval1, tEval2, fEval1, fEval2 };
}
