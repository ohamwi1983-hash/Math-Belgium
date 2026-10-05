import type { Arcfonction } from "../../../core6e/cyclometrique.types";
import type { ExerciceMemeArcfonction } from "../../../core6e/equationsCyclometriques.types";
import { CE_REEL, appartient, domaineArcsinArccosLineaire, intersection, versGuide } from "../domaines";

const ARCFONCTIONS: Arcfonction[] = ["arcsin", "arccos", "arctan"];
const CANDIDATS_A = [-3, -2, -1, 1, 2, 3] as const;
const TENTATIVES_MAX = 500;

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Variante 2 — arcfonction(ax+b) = arcfonction(cx+d), MÊME arcfonction des deux côtés. Injectivité
 * ⟹ équation non cyclométrique directe `ax+b=cx+d` — TOUJOURS exactement 1 solution algébrique
 * (`a≠c` garanti par construction, jamais de reroll nécessaire sur ce point : les deux tirages sont
 * DISTINCTS par construction). "Cible d'abord" (comme l'ancienne `construireEgaliteAvecCE`) pour
 * `arcsin`/`arccos` : `x0` et `vouluValide` (la solution doit-elle vérifier la CE — ~50/50, seul
 * endroit où une CE peut effectivement REJETER la solution pour cette variante) choisis en premier,
 * `a,b1` tirés puis `b2` DÉRIVÉ pour que `x0` soit exactement la solution — reroll BORNÉ tant que la
 * CE (intersection des 2 domaines) est vide ou que `vouluValide` n'est pas satisfait. Pour `arctan`,
 * CE=ℝ triviale ⟹ toujours valide, aucun reroll nécessaire.
 */
export function construireMemeArcfonction(): ExerciceMemeArcfonction {
  const arcfonction = tirerParmi(ARCFONCTIONS);

  if (arcfonction === "arctan") {
    const a = tirerParmi(CANDIDATS_A);
    const c = tirerParmi(CANDIDATS_A.filter((v) => v !== a));
    const b = tirerEntier(-4, 4);
    const d = tirerEntier(-4, 4);
    const x0 = (d - b) / (a - c);
    return { variante: "memeArcfonction", arcfonction, arg1: { a, b }, arg2: { a: c, b: d }, ce: CE_REEL, candidats: [{ x: x0, accepteAttendu: true }] };
  }

  const vouluValide = Math.random() < 0.5;
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const x0 = tirerEntier(-4, 4);
    const a = tirerParmi(CANDIDATS_A);
    const c = tirerParmi(CANDIDATS_A.filter((v) => v !== a));
    const b = tirerEntier(-4, 4);
    const d = (a - c) * x0 + b;

    const dom1 = domaineArcsinArccosLineaire(a, b);
    const dom2 = domaineArcsinArccosLineaire(c, d);
    const domaineCommun = intersection(dom1, dom2);
    if (domaineCommun === null) continue;

    const valide = appartient(x0, domaineCommun);
    if (valide !== vouluValide) continue;

    return {
      variante: "memeArcfonction",
      arcfonction,
      arg1: { a, b },
      arg2: { a: c, b: d },
      ce: versGuide(domaineCommun),
      candidats: [{ x: x0, accepteAttendu: valide }],
    };
  }
  throw new Error("construireMemeArcfonction : aucune combinaison valide trouvée après retirage");
}
