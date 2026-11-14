import type { ExerciceFonctionAire, MorceauF, VarianteFonctionAire } from "../../core6e/fonctionAire.types";
import {
  aireNumerique,
  bornesDomaine,
  candidatGraphique,
  candidatsExtremums,
  evaluerF,
  extremumsA,
  intervallesSens,
  pointsDeCoupe,
  sommets,
  zerosChangementSigne,
  zerosInterieurs,
} from "../../moteur6e/modeleFonctionAire";

/**
 * Couche A (6e) — générateur de `6gen78` « La fonction aire ». N'utilise QUE `Math.random()` : le
 * `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement le même tirage, dans l'appli
 * comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Construction de f par « lobes » de signe alterné (k changements de signe → k + 1 lobes) : les
 * changements de signe ont toujours lieu en un sommet d'ordonnée nulle (abscisse entière), jamais au
 * milieu d'un segment — les aires restent des multiples de 1/2 (ou de π/4 avec un demi-disque) et
 * l'abscisse d'un extremum de A se lit sur le quadrillage. Un lobe peut contenir un zéro de
 * « contact » (f s'annule sans changer de signe : pas d'extremum de A). Tout lobe positif d'au moins
 * deux unités contient une partie où f DÉCROÎT en restant positive : le piège « A décroît quand f
 * décroît » est toujours présent.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

function melange<T>(t: readonly T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

type Position = "gauche" | "interne" | "droite";

/** Un lobe : soit une suite de valeurs (en valeur absolue) aux abscisses entières successives,
 * soit un demi-disque de rayon r. */
type Lobe = { type: "poly"; valeurs: number[] } | { type: "disque"; rayon: 1 | 2 };

function largeurLobe(l: Lobe): number {
  return l.type === "disque" ? 2 * l.rayon : l.valeurs.length - 1;
}

function lobePoly(position: Position, contact: boolean): Lobe {
  const h = () => entier(1, 3);
  const v = () => entier(1, 3);
  if (position === "interne") {
    if (contact) return { type: "poly", valeurs: [0, h(), 0, h(), 0] };
    return choisir([{ type: "poly", valeurs: [0, h(), 0] }, { type: "poly", valeurs: [0, h(), h(), 0] }] as Lobe[]);
  }
  // Lobe d'extrémité : la valeur au bord du domaine peut être non nulle.
  let valeurs: number[];
  if (contact) valeurs = [v(), 0, h(), 0];
  else valeurs = choisir([[v(), 0], [v(), h(), 0], [entier(0, 3), h(), 0], [v(), h(), h(), 0]]);
  return { type: "poly", valeurs: position === "gauche" ? valeurs : [...valeurs].reverse() };
}

export interface OptionsConstruction {
  changements: 1 | 2;
  disque: boolean;
  aInterieur: boolean;
  contact: boolean;
  /** Variante `graphique` : f(a) ≠ 0 (sinon le distracteur « f(a) + A » coïnciderait avec A). */
  faNonNul: boolean;
}

/** Courbe de f et borne a ; `null` si les contraintes ne sont pas tenues (on recommence). */
function construireCourbe(o: OptionsConstruction): { morceaux: MorceauF[]; a: number } | null {
  const nLobes = o.changements + 1;
  const positions: Position[] = Array.from({ length: nLobes }, (_, i) => (i === 0 ? "gauche" : i === nLobes - 1 ? "droite" : "interne"));
  const indiceDisque = o.disque ? entier(0, nLobes - 1) : -1;
  const indiceContact = o.contact ? entier(0, nLobes - 1) : -1;
  const lobes: Lobe[] = positions.map((p, i) => (i === indiceDisque ? { type: "disque", rayon: choisir([1, 2] as const) } : lobePoly(p, i === indiceContact)));
  if (o.contact && indiceContact === indiceDisque) return null;
  const largeur = lobes.reduce((s, l) => s + largeurLobe(l), 0);
  if (largeur < 5 || largeur > 8) return null;

  const x0 = entier(-3, Math.min(0, 5 - largeur));
  const premierSigne: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const morceaux: MorceauF[] = [];
  let x = x0;
  lobes.forEach((l, i) => {
    const signe = (i % 2 === 0 ? premierSigne : -premierSigne) as 1 | -1;
    if (l.type === "disque") {
      morceaux.push({ type: "demiDisque", centre: x + l.rayon, rayon: l.rayon, signe });
      x += 2 * l.rayon;
      return;
    }
    for (let j = 0; j + 1 < l.valeurs.length; j++) {
      morceaux.push({ type: "segment", x0: x, y0: signe * l.valeurs[j], x1: x + 1, y1: signe * l.valeurs[j + 1] });
      x += 1;
    }
  });
  // Normalise les −0 (valeur nulle d'un lobe négatif).
  for (const m of morceaux) if (m.type === "segment") Object.assign(m, { y0: m.y0 + 0, y1: m.y1 + 0 });

  const xs = sommets({ variante: "valeurs", morceaux, a: x0, points: [], ordre: [] });
  const xn = x0 + largeur;
  let candidatsA: number[];
  if (o.aInterieur) candidatsA = xs.filter((s) => s.x > x0 && s.x < xn && (!o.faNonNul || s.y !== 0)).map((s) => s.x);
  else candidatsA = o.faNonNul && xs[0].y === 0 ? [] : [x0];
  if (candidatsA.length === 0) return null;
  return { morceaux, a: choisir(candidatsA) };
}

function tirerOptions(variante: VarianteFonctionAire): OptionsConstruction {
  const contactProba = variante === "extremums" || variante === "variations" ? 0.35 : 0.15;
  return {
    changements: Math.random() < 0.5 ? 1 : 2,
    disque: variante !== "graphique" && Math.random() < 0.3,
    aInterieur: variante !== "graphique" && Math.random() < 0.35,
    contact: Math.random() < contactProba,
    faNonNul: variante === "graphique",
  };
}

/** Écart minimal entre deux candidats du graphique (sinon deux graphiques se confondraient). */
function graphiquesDistincts(e: ExerciceFonctionAire): boolean {
  const { x0, xn } = bornesDomaine(e);
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      let ecart = 0;
      for (let k = 0; k <= 40; k++) {
        const x = x0 + ((xn - x0) * k) / 40;
        ecart = Math.max(ecart, Math.abs(candidatGraphique(e, i, x) - candidatGraphique(e, j, x)));
      }
      if (ecart < 1) return false;
    }
  }
  return true;
}

function completer(variante: VarianteFonctionAire, morceaux: MorceauF[], a: number): ExerciceFonctionAire | null {
  const base: ExerciceFonctionAire = { variante, morceaux, a, points: [], ordre: [] };
  const { x0 } = bornesDomaine(base);
  // Valeurs de A raisonnables pour le quadrillage du corrigé.
  for (const s of sommets(base)) if (Math.abs(aireNumerique(base, s.x)) > 9) return null;

  switch (variante) {
    case "valeurs": {
      // 3 sommets ≠ a (jamais à l'intérieur d'un demi-disque), dont un à gauche de a si a est intérieur.
      const pool = sommets(base)
        .map((s) => s.x)
        .filter((x) => x !== a);
      if (pool.length < 3) return null;
      for (let essai = 0; essai < 20; essai++) {
        const pts = melange(pool).slice(0, 3).sort((p, q) => p - q);
        if (a > x0 && !pts.some((p) => p < a)) continue;
        if (!pts.some((p) => p > a)) continue;
        // Au moins un intervalle de calcul franchit un zéro où f change de signe (compensation).
        const coupes = [...pts, a].sort((p, q) => p - q);
        const zeros = zerosChangementSigne(base);
        const compense = coupes.some((c, i) => i > 0 && zeros.some((z) => z > coupes[i - 1] && z < c));
        if (!compense) continue;
        return { ...base, points: pts };
      }
      return null;
    }
    case "variations": {
      const n = intervallesSens(base).length;
      return n >= 3 && n <= 7 ? base : null;
    }
    case "extremums": {
      const n = candidatsExtremums(base).length;
      if (n < 2 || n > 5 || extremumsA(base).length === 0) return null;
      return base;
    }
    case "pente": {
      const coupes = pointsDeCoupe(base);
      const p1s = coupes.filter((x) => x !== a && Math.abs(evaluerF(base, x)) > 1e-9);
      if (p1s.length === 0) return null;
      const p1 = choisir(p1s);
      const signe1 = Math.sign(evaluerF(base, p1));
      // p₂ : f(p₂) de signe opposé (pente négative si l'autre est positive), ou un zéro de f.
      const p2s = coupes.filter((x) => x !== p1 && Math.sign(evaluerF(base, x)) !== signe1);
      if (p2s.length === 0) return null;
      const p2 = choisir(p2s);
      return { ...base, points: [p1, p2] };
    }
    case "graphique": {
      const e = { ...base, ordre: melange([0, 1, 2, 3]) };
      return graphiquesDistincts(e) ? e : null;
    }
  }
}

export function construireAvecOptions(variante: VarianteFonctionAire, o: OptionsConstruction): ExerciceFonctionAire | null {
  const courbe = construireCourbe(o);
  if (!courbe) return null;
  const e = completer(variante, courbe.morceaux, courbe.a);
  if (!e) return null;
  // Contrôles de cohérence : le nombre de changements de signe et la présence du contact tirés.
  if (zerosChangementSigne(e).length !== o.changements) return null;
  if (o.contact !== zerosInterieurs(e).some((z) => !z.changeSigne)) return null;
  return e;
}

export function construireVariante(variante: VarianteFonctionAire): ExerciceFonctionAire {
  for (;;) {
    const e = construireAvecOptions(variante, tirerOptions(variante));
    if (e) return e;
  }
}

export type IdVarianteFonctionAire = VarianteFonctionAire;

export const CATALOGUE_VARIANTES: { id: IdVarianteFonctionAire; label: string }[] = [
  { id: "valeurs", label: "Valeurs de A par des aires signées" },
  { id: "variations", label: "Sens de variation de A (tableau de variations)" },
  { id: "extremums", label: "Extremums de A aux zéros de f" },
  { id: "pente", label: "A′ = f : pente et tangente" },
  { id: "graphique", label: "Reconnaître le graphique de A" },
];

export function construireAvecVarianteId(id: IdVarianteFonctionAire): ExerciceFonctionAire {
  return construireVariante(id);
}

/** Tirage libre : variante équiprobable. */
export function genererExerciceFonctionAire(): ExerciceFonctionAire {
  return construireVariante(choisir(CATALOGUE_VARIANTES).id);
}
