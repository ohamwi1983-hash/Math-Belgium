import type { AngleReference, ExerciceValeurExacte, FonctionTrig, Operateur, QuadrantStrict, TermeTrig, VarianteValeurExacte } from "../../core/valeurExacte.types";
import { angleReduit, valeurExpression, valeurFonction } from "../../moteur/modeleValeurExacte";
import { denominateurCommun, nombreComposantes } from "../../moteur/corpsValeurExacte";

/**
 * Générateur de « Valeur exacte sans calculatrice » (gen76). Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) :
 * - angles multiples de 30° ou 45°, STRICTEMENT dans un quadrant (jamais 0°, 90°, 180°, 270° à un
 *   tour près) : une tangente n'est jamais indéfinie ;
 * - jamais deux termes de même fonction sur le même angle réduit ;
 * - au plus un produit, au plus une tangente pour 2 termes et deux pour 3 termes ;
 * - au plus UN terme du premier quadrant, tiré une fois sur cinq environ (cas particulier des
 *   évaluations : aucune symétrie, signe positif) ;
 * - « grands angles » : au moins un angle négatif ou ≥ 360° ;
 * - le résultat final reste lisible : au plus deux « morceaux » parmi 1, √2, √3, √6 et un
 *   dénominateur commun d'au plus 12.
 */

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function choisirPondere<T>(options: readonly [T, number][]): T {
  const total = options.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [v, p] of options) {
    r -= p;
    if (r < 0) return v;
  }
  return options[options.length - 1]![0];
}

const REFERENCES: AngleReference[] = [30, 45, 60];
const PROBA_PREMIER_QUADRANT = 0.2;

function angleDansQuadrant(ref: AngleReference, q: QuadrantStrict): number {
  return q === "I" ? ref : q === "II" ? 180 - ref : q === "III" ? 180 + ref : 360 - ref;
}

/** Ajoute ou retire des tours : angle négatif (−360° < θ < 0°) ou supérieur à 360°. */
function horsIntervalle(angle: number): number {
  const tours = choisirPondere<number>([
    [-1, 0.45],
    [1, 0.4],
    [2, 0.15],
  ]);
  return angle + 360 * tours;
}

function tirerFonction(): FonctionTrig {
  return choisirPondere<FonctionTrig>([
    ["sin", 0.37],
    ["cos", 0.37],
    ["tan", 0.26],
  ]);
}

function tirerOperateurs(n: number): Operateur[] {
  for (;;) {
    const ops = Array.from({ length: n - 1 }, () =>
      choisirPondere<Operateur>([
        ["+", 0.36],
        ["-", 0.34],
        ["*", 0.3],
      ]),
    );
    if (ops.filter((o) => o === "*").length <= 1) return ops;
  }
}

function resultatLisible(e: ExerciceValeurExacte): boolean {
  const v = valeurExpression(e);
  return nombreComposantes(v) <= 2 && denominateurCommun(v) <= 12;
}

export function genererValeurExacte(variante: VarianteValeurExacte, options?: { nombreTermes?: number; premierQuadrant?: boolean }): ExerciceValeurExacte {
  const n = options?.nombreTermes ?? (variante === "trois-termes" ? 3 : variante === "grands-angles" ? choisir([2, 3]) : 2);
  const avecPremierQuadrant = options?.premierQuadrant ?? Math.random() < PROBA_PREMIER_QUADRANT;
  for (;;) {
    const indicePQ = avecPremierQuadrant ? Math.floor(Math.random() * n) : -1;
    const termes: TermeTrig[] = [];
    for (let i = 0; i < n; i++) {
      const q: QuadrantStrict = i === indicePQ ? "I" : choisir(["II", "III", "IV"] as const);
      let angle = angleDansQuadrant(choisir(REFERENCES), q);
      if (variante === "grands-angles" && Math.random() < 0.5) angle = horsIntervalle(angle);
      termes.push({ fonction: tirerFonction(), angle, carre: false });
    }
    if (variante === "grands-angles" && !termes.some((t) => t.angle < 0 || t.angle >= 360)) continue;
    if (variante === "carre") {
      const lequel = choisirPondere<number>([
        [0, 0.4],
        [1, 0.4],
        [2, 0.2],
      ]);
      termes.forEach((t, i) => (t.carre = lequel === 2 || lequel === i));
    }
    if (termes.filter((t) => t.fonction === "tan").length > (n === 2 ? 1 : 2)) continue;
    const cles = termes.map((t) => `${t.fonction}${angleReduit(t.angle)}`);
    if (new Set(cles).size !== cles.length) continue;
    const e: ExerciceValeurExacte = { variante, termes, operateurs: tirerOperateurs(n) };
    // Sécurité : chaque terme a bien une valeur (jamais d'angle sur un axe).
    termes.forEach(valeurFonction);
    if (!resultatLisible(e)) continue;
    return e;
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteValeurExacte; label: string }[] = [
  { id: "deux-termes", label: "2 termes" },
  { id: "trois-termes", label: "3 termes" },
  { id: "grands-angles", label: "Avec angles > 360° ou négatifs" },
  { id: "carre", label: "Avec un carré" },
];

export function construireAvecVariante(id: string): ExerciceValeurExacte {
  const variante = CATALOGUE_VARIANTES.find((v) => v.id === id)?.id;
  return variante ? genererValeurExacte(variante) : genererExerciceValeurExacte();
}

/** Tirage libre : surtout 2 ou 3 termes dans [0° ; 360°[, parfois de grands angles ou un carré. */
export function genererExerciceValeurExacte(): ExerciceValeurExacte {
  return genererValeurExacte(
    choisirPondere<VarianteValeurExacte>([
      ["deux-termes", 0.35],
      ["trois-termes", 0.3],
      ["grands-angles", 0.2],
      ["carre", 0.15],
    ]),
  );
}
