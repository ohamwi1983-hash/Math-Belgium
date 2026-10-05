import type { ExerciceExpoProbD } from "../../../core6e/exponentiellesProblemes.types";
import { CONTEXTES_D } from "../contextes";
import { arrondir, tirerParmi } from "../aleatoire";

const L_POOL = [5, 10, 15, 20] as const;
const C_MAGNITUDE_POOL = [10, 15, 20, 25] as const;
const R_POOL = [0.7, 0.75, 0.8, 0.85, 0.9] as const;
const D_POOL = [1, 2, 3] as const;

/** Famille D — le SIGNE de `C` est tiré en premier (positif="approche par le haut", négatif="par
 * le bas"), le contexte est ensuite choisi PARMI CEUX dont `signe` correspond — même principe que
 * familles A/C. `a/b/c` sont arrondis À L'UNITÉ pour l'affichage (jamais la référence de
 * correction, qui reste `L`/`C`/`r` exacts). */
export function construireD(): ExerciceExpoProbD {
  const L = tirerParmi(L_POOL);
  const magnitude = tirerParmi(C_MAGNITUDE_POOL);
  const positif = tirerParmi([true, false]);
  const C = positif ? magnitude : -magnitude;
  const r = tirerParmi(R_POOL);
  const d = tirerParmi(D_POOL);
  const contexte = tirerParmi(CONTEXTES_D.filter((ctx) => ctx.signe === (positif ? "haut" : "bas")));

  const a = L + C;
  const b = L + C * Math.pow(r, d);
  const c = L + C * Math.pow(r, 2 * d);
  const rapport = Math.pow(r, d);

  const tSuppl = 3 * d;
  const valeurSuppl = L + C * Math.pow(r, tSuppl);

  return {
    famille: "D",
    contexteId: contexte.id,
    L,
    C,
    r,
    d,
    a,
    b,
    c,
    aAffiche: arrondir(a),
    bAffiche: arrondir(b),
    cAffiche: arrondir(c),
    rapport,
    tSuppl,
    valeurSuppl,
  };
}
