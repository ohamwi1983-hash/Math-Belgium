import type { ExerciceEqLogE } from "../../../core6e/equationsExpLog.types";
import { tirerDeuxDistincts, tirerParmi } from "../aleatoire";

const BASES_E = [2, 3, 5, 10] as const;
const P_Q_POOL = [1, 2, 3, 4, 5] as const;
const R_POOL = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/**
 * Famille E — `log_base(x-p) + log_base(x-q) = log_base(e·x+d)`, `p≠q`. "Génération par
 * construction depuis les racines cibles" (CLAUDE.md/prompt) : `p`,`q` fixés en premier (ils
 * définissent 2 des 3 conditions de la CE), puis 2 racines ALGÉBRIQUES cibles `r1≠r2` tirées
 * LIBREMENT, puis `e=r1+r2-(p+q)` et `d=pq-r1·r2` DÉRIVÉS pour que `x²-(p+q+e)x+(pq-d)=0` — le
 * second degré obtenu en combinant les 2 logs de gauche et en développant `(x-p)(x-q)=e·x+d` — ait
 * EXACTEMENT `r1`,`r2` comme racines.
 *
 * **Piège évité (retenu par une première version, corrigé après preuve algébrique)** : forcer
 * `e>0` ET `d≥0` (pour garder une CE toujours en demi-droite entière `x>max(p,q)`) revient à
 * imposer `φ(max(p,q)) = -e·max(p,q)-d < 0` — TOUJOURS négatif — ce qui place STRUCTURELLEMENT
 * `max(p,q)` ENTRE les 2 racines, donc EXACTEMENT 1 racine survit à tout coup, jamais 0 ni 2 :
 * contradiction directe avec la "variabilité assumée" du prompt (vérifié empiriquement avant
 * correction, 20000 tirages, 0 occurrence de 0 ou 2). Retenu à la place : `e` tiré LIBREMENT
 * (positif ou négatif, retry si `e=0`) — `e<0` donne une CE bornée `]max(p,q);-d/e[` (au lieu d'une
 * demi-droite), ce qui brise la preuve ci-dessus et restaure une vraie variabilité 0/1/2 (vérifié
 * empiriquement après correction : les 3 cas apparaissent).
 */
export function construireE(): ExerciceEqLogE {
  const base = tirerParmi(BASES_E);
  const [p, q] = tirerDeuxDistincts(P_Q_POOL);
  const M = Math.max(p, q);

  let r1 = 0;
  let r2 = 0;
  let e = 0;
  let d = 0;
  let ceInf = M;
  let ceSup: number | null = null;
  let ok = false;
  for (let essai = 0; essai < 500 && !ok; essai++) {
    [r1, r2] = tirerDeuxDistincts(R_POOL);
    e = r1 + r2 - (p + q);
    if (e === 0) continue;
    d = p * q - r1 * r2;
    if (e > 0) {
      ceInf = Math.max(M, -d / e);
      ceSup = null;
      ok = true;
    } else {
      const U = -d / e;
      if (U > M + 1e-9) {
        ceInf = M;
        ceSup = U;
        ok = true;
      }
    }
  }
  if (!ok) {
    // Filet de sécurité déterministe (n'arrive jamais en pratique sur ce pool, gardé par prudence).
    r1 = M + 1;
    r2 = M + 2;
    e = r1 + r2 - (p + q);
    d = p * q - r1 * r2;
    ceInf = M;
    ceSup = null;
  }

  const racinesAlgebriques = [r1, r2].sort((a, b) => a - b);
  const solutionsFinales = racinesAlgebriques.filter((r) => r > ceInf + 1e-9 && (ceSup === null || r < ceSup - 1e-9));

  return { famille: "E", base, p, q, e, d, racinesAlgebriques, ceInf, ceSup, solutionsFinales };
}
