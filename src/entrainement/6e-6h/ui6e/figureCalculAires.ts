import type { ExerciceCalculAires } from "../core6e/calculAires.types";
import { COULEURS, etiquetteNombre, fenetreY, repereSvg } from "./figureRepereIntegrales";
import type { CourbeRepere, PointRepere, RegionRepere } from "./figureRepereIntegrales";

/**
 * Figure de `6gen26` (audit chapitre 4 de 6e, point 23) : la région dont on calcule l'aire,
 * hachurée, avec ses bornes (racines ou intersections) marquées. Chaîne SVG autonome — affichée à
 * l'écran de validation du dernier écran et réutilisable telle quelle comme `figureHtml` du corrigé
 * papier. Jamais affichée pendant la résolution : elle montrerait les racines et le signe.
 *
 * Famille C (signe changeant) : la partie où f > 0 en vert, la partie où f < 0 en rouge — la
 * compensation de l'intégrale saute aux yeux.
 */
export function figureCalculAiresSvg(exercice: ExerciceCalculAires): string {
  const regions: RegionRepere[] = [];
  const courbes: CourbeRepere[] = [];
  const points: PointRepere[] = [];
  let de: number;
  let a: number;
  let bornes: number[];
  let fns: ((x: number) => number)[];
  let libelle: string;

  if (exercice.famille === "A") {
    const f = exercice.integrandeReference;
    de = exercice.a;
    a = exercice.b;
    bornes = [de, a];
    const marge = Math.max(0.6, (a - de) * 0.35);
    const xMin = exercice.type === "rationnelle" && de > 0 ? Math.max(0.25, de - marge) : de - marge;
    const xMax = exercice.type === "rationnelle" && a < 0 ? Math.min(-0.25, a + marge) : a + marge;
    regions.push({ de, a, haut: (x) => Math.max(f(x), 0), bas: (x) => Math.min(f(x), 0), remplissage: COULEURS.accentDoux, contour: COULEURS.accent });
    courbes.push({ fn: f, de: xMin, a: xMax, couleur: COULEURS.accent, etiquette: "f" });
    fns = [f];
    libelle = "Région délimitée par la courbe de f et l'axe des abscisses";
    return finir(xMin, xMax, fns, bornes, regions, courbes, points, libelle, de, a);
  }

  if (exercice.famille === "B") {
    const f = exercice.integrandeReference;
    de = exercice.r1;
    a = exercice.r2;
    bornes = [de, a];
    regions.push({ de, a, haut: (x) => Math.max(f(x), 0), bas: (x) => Math.min(f(x), 0), remplissage: COULEURS.accentDoux, contour: COULEURS.accent });
    const marge = Math.max(0.8, (a - de) * 0.3);
    courbes.push({ fn: f, de: de - marge, a: a + marge, couleur: COULEURS.accent, etiquette: "f" });
    for (const r of bornes) points.push({ x: r, y: 0, couleur: COULEURS.encre });
    fns = [f];
    libelle = "Région délimitée par la courbe de f et l'axe des abscisses, entre ses racines";
    return finir(de - marge, a + marge, fns, bornes, regions, courbes, points, libelle, de, a);
  }

  if (exercice.famille === "C") {
    const f = exercice.integrandeReference;
    const { r1, r2, r3 } = exercice;
    bornes = [r1, r2, r3];
    for (const [x0, x1, signe] of [
      [r1, r2, exercice.signeGauche],
      [r2, r3, exercice.signeDroit],
    ] as const) {
      const positif = signe === "positif";
      regions.push({
        de: x0,
        a: x1,
        haut: (x) => Math.max(f(x), 0),
        bas: (x) => Math.min(f(x), 0),
        remplissage: positif ? COULEURS.bonDoux : COULEURS.mauvaisDoux,
        contour: positif ? COULEURS.bon : COULEURS.mauvais,
      });
    }
    const marge = Math.max(0.6, (r3 - r1) * 0.2);
    courbes.push({ fn: f, de: r1 - marge, a: r3 + marge, couleur: COULEURS.accent, etiquette: "f" });
    for (const r of bornes) points.push({ x: r, y: 0, couleur: COULEURS.encre });
    fns = [f];
    libelle = "Région délimitée par la courbe de f et l'axe des abscisses : partie positive en vert, partie négative en rouge";
    return finir(r1 - marge, r3 + marge, fns, bornes, regions, courbes, points, libelle, r1, r3);
  }

  // Famille D — entre deux courbes.
  let f: (x: number) => number;
  let g: (x: number) => number;
  if (exercice.sousType === "parametre") {
    const m = exercice.m;
    f = (x) => x * x;
    g = exercice.motif === "droiteParOrigine" ? (x) => m * x : () => m;
    de = exercice.motif === "droiteParOrigine" ? 0 : -Math.sqrt(m);
    a = exercice.motif === "droiteParOrigine" ? m : Math.sqrt(m);
  } else {
    f = exercice.fReference;
    g = exercice.gReference;
    de = exercice.r1;
    a = exercice.r2;
  }
  bornes = [de, a];
  regions.push({ de, a, haut: (x) => Math.max(f(x), g(x)), bas: (x) => Math.min(f(x), g(x)), remplissage: COULEURS.accentDoux, contour: COULEURS.accent });
  const marge = Math.max(0.8, (a - de) * 0.3);
  courbes.push({ fn: f, de: de - marge, a: a + marge, couleur: COULEURS.accent, etiquette: "f" });
  courbes.push({ fn: g, de: de - marge, a: a + marge, couleur: COULEURS.ciel, etiquette: "g" });
  for (const x of bornes) points.push({ x, y: f(x), couleur: COULEURS.encre });
  fns = [f, g];
  libelle = "Région comprise entre les courbes de f et de g";
  return finir(de - marge, a + marge, fns, bornes, regions, courbes, points, libelle, de, a);
}

function finir(
  xMin: number,
  xMax: number,
  fns: ((x: number) => number)[],
  bornes: number[],
  regions: RegionRepere[],
  courbes: CourbeRepere[],
  points: PointRepere[],
  libelle: string,
  de: number,
  a: number,
): string {
  // Fenêtre verticale calculée sur l'intervalle utile (élargi d'un tiers), pas sur toute la largeur :
  // une branche qui file vers l'infini hors de la région ne doit pas écraser la région elle-même.
  const largeur = a - de;
  const { yMin, yMax } = fenetreY(fns, de - largeur * 0.15, a + largeur * 0.15);
  return repereSvg({
    xMin,
    xMax,
    yMin,
    yMax,
    graduationsX: bornes.filter((b) => Math.abs(b) > 1e-9).map((b) => ({ x: b, etiquette: etiquetteBorne(b) })),
    regions,
    courbes,
    points,
    libelle,
  });
}

/** Les bornes ±√m (famille D, paramètre) s'écrivent « √m » ; les autres, en décimal court. */
function etiquetteBorne(b: number): string {
  const carre = Math.round(b * b);
  if (Math.abs(b * b - carre) < 1e-9 && Math.abs(b - Math.round(b)) > 1e-9) return `${b < 0 ? "-" : ""}√${carre}`;
  return etiquetteNombre(b);
}
