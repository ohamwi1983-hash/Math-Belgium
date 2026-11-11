import type { ExerciceVolumesRevolution } from "../core6e/volumesRevolution.types";
import { COULEURS, etiquetteNombre, fenetreY, repereSvg } from "./figureRepereIntegrales";
import type { CourbeRepere, EllipseRepere, RegionRepere, SegmentRepere } from "./figureRepereIntegrales";

/**
 * Figure de `6gen27` (audit chapitre 4 de 6e, point 23) : la région qui tourne (hachurée), son
 * symétrique par rapport à l'axe des abscisses en pointillés et quelques ellipses — un croquis du
 * solide de révolution, avec une tranche (disque, ou rondelle pour la famille C) au milieu de
 * l'intervalle. Chaîne SVG autonome : écran de validation du dernier écran, et `figureHtml` du
 * corrigé papier (phase 2).
 *
 * Le croquis utilise |f| : la partie de la région située sous l'axe engendre le même solide que sa
 * symétrique (cohérent avec l'aide de l'étape 1).
 */
export function figureVolumesRevolutionSvg(exercice: ExerciceVolumesRevolution): string {
  const regions: RegionRepere[] = [];
  const courbes: CourbeRepere[] = [];
  const ellipses: EllipseRepere[] = [];
  const segments: SegmentRepere[] = [];
  const rx = 7;

  if (exercice.famille === "D") {
    const k = exercice.kNum / exercice.kDen;
    const L = exercice.L;
    const f = (x: number) => k * Math.sqrt(Math.max(x, 0));
    const R = f(L);
    regions.push({ de: 0, a: L, haut: f, bas: () => 0, remplissage: COULEURS.accentDoux, contour: COULEURS.accent });
    courbes.push({ fn: f, de: 0, a: L, couleur: COULEURS.accent, etiquette: "f" });
    courbes.push({ fn: (x) => -f(x), de: 0, a: L, couleur: COULEURS.accent, pointilles: true, epaisseur: 1.3 });
    segments.push(
      { x1: 0, y1: R, x2: L, y2: R, couleur: COULEURS.ciel, pointilles: true },
      { x1: 0, y1: -R, x2: L, y2: -R, couleur: COULEURS.ciel, pointilles: true },
      { x1: 0, y1: -R, x2: 0, y2: R, couleur: COULEURS.ciel, pointilles: true },
    );
    ellipses.push({ cx: L, ry: R, rxPixels: rx * 1.4, couleur: COULEURS.ciel, moitieArrierePointillee: true });
    ellipses.push({ cx: L / 2, ry: f(L / 2), rxPixels: rx, couleur: COULEURS.accent, remplissage: COULEURS.accentDoux });
    return repereSvg({
      xMin: -L * 0.08,
      xMax: L * 1.15,
      yMin: -R * 1.3,
      yMax: R * 1.3,
      graduationsX: [{ x: L, etiquette: etiquetteNombre(L) }],
      graduationsY: [{ y: R, etiquette: etiquetteNombre(R) }],
      regions,
      courbes,
      segments,
      ellipses,
      libelle: "Paraboloïde engendré par la rotation de la courbe de f, et cylindre englobant en pointillés",
    });
  }

  let de: number;
  let a: number;
  let dessus: (x: number) => number;
  let dessous: (x: number) => number;
  if (exercice.famille === "C") {
    de = exercice.r1;
    a = exercice.r2;
    const f = exercice.fReference;
    const g = exercice.gReference;
    dessus = (x) => Math.max(f(x), g(x));
    dessous = (x) => Math.min(f(x), g(x));
    courbes.push({ fn: f, de, a, couleur: COULEURS.accent, etiquette: "f" });
    courbes.push({ fn: g, de, a, couleur: COULEURS.ciel, etiquette: "g" });
  } else {
    de = exercice.famille === "A" ? exercice.a : exercice.r1;
    a = exercice.famille === "A" ? exercice.b : exercice.r2;
    const f = exercice.fReference;
    dessus = (x) => Math.abs(f(x));
    dessous = () => 0;
    courbes.push({ fn: f, de, a, couleur: COULEURS.accent, etiquette: "f" });
  }
  regions.push({ de, a, haut: dessus, bas: dessous, remplissage: COULEURS.accentDoux, contour: COULEURS.accent });
  courbes.push({ fn: (x) => -dessus(x), de, a, couleur: COULEURS.doux, pointilles: true, epaisseur: 1.2 });
  if (exercice.famille === "C") courbes.push({ fn: (x) => -dessous(x), de, a, couleur: COULEURS.doux, pointilles: true, epaisseur: 1.2 });
  for (const x of [de, a]) {
    if (dessus(x) > 1e-9) ellipses.push({ cx: x, ry: dessus(x), rxPixels: rx, couleur: COULEURS.doux, moitieArrierePointillee: true });
  }
  const milieu = (de + a) / 2;
  ellipses.push({ cx: milieu, ry: dessus(milieu), rxPixels: rx, couleur: COULEURS.accent, remplissage: COULEURS.accentDoux });
  if (exercice.famille === "C" && dessous(milieu) > 1e-9) {
    ellipses.push({ cx: milieu, ry: dessous(milieu), rxPixels: rx * 0.7, couleur: COULEURS.accent, remplissage: "var(--surface, #ffffff)" });
  }
  const { yMax } = fenetreY([dessus], de, a, true);
  const largeur = a - de;
  return repereSvg({
    xMin: de - largeur * 0.18,
    xMax: a + largeur * 0.18,
    yMin: -yMax,
    yMax,
    graduationsX: [de, a].filter((v) => Math.abs(v) > 1e-9).map((v) => ({ x: v, etiquette: etiquetteNombre(v) })),
    regions,
    courbes,
    ellipses,
    libelle:
      exercice.famille === "C"
        ? "Région comprise entre les courbes de f et de g, et croquis du solide obtenu par rotation autour de l'axe des abscisses (une rondelle au milieu)"
        : "Région comprise entre la courbe de f et l'axe des abscisses, et croquis du solide obtenu par rotation autour de cet axe (un disque au milieu)",
  });
}
