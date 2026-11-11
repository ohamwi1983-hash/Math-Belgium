import type { ExerciceIntegralesDefinies } from "../core6e/integralesDefinies.types";
import { COULEURS, etiquetteNombre, fenetreY, repereSvg } from "./figureRepereIntegrales";
import type { CourbeRepere, RegionRepere, SegmentRepere } from "./figureRepereIntegrales";

/**
 * Figure du corrigé papier de `6gen25` (refonte papier, chapitre 4 de 6e) : l'aire SIGNÉE sous la
 * courbe de f entre les bornes — partie où f > 0 en vert (comptée positivement), partie où f < 0 en
 * rouge (comptée négativement). En mode « valeur moyenne », la droite y = valeur moyenne en
 * pointillés sur [a ; b] : le rectangle de base [a ; b] et de cette hauteur a la même aire signée.
 * Scénario « paramètre » : la région entre la borne fixe et la (première) valeur de m trouvée.
 *
 * Chaîne SVG autonome (`figureHtml` d'une ligne du corrigé détaillé) — jamais dans l'énoncé : elle
 * montrerait le signe de f et, en mode moyenne, la réponse.
 */
export function figureIntegralesDefiniesSvg(exercice: ExerciceIntegralesDefinies): string {
  const f = exercice.primitive.integrandeReference;
  let de: number;
  let a: number;
  if (exercice.scenario === "parametre") {
    const m = exercice.solutionsM[0] ?? exercice.m;
    de = Math.min(exercice.borneFixe, m);
    a = Math.max(exercice.borneFixe, m);
  } else {
    de = exercice.a;
    a = exercice.b;
  }
  const largeur = Math.max(a - de, 1e-6);
  const marge = Math.max(0.5, largeur * 0.25);
  const regions: RegionRepere[] = [
    { de, a, haut: (x) => Math.max(f(x), 0), bas: () => 0, remplissage: COULEURS.bonDoux, contour: COULEURS.bon },
    { de, a, haut: () => 0, bas: (x) => Math.min(f(x), 0), remplissage: COULEURS.mauvaisDoux, contour: COULEURS.mauvais },
  ];
  const courbes: CourbeRepere[] = [{ fn: f, de: de - marge, a: a + marge, couleur: COULEURS.accent, etiquette: "f" }];
  const segments: SegmentRepere[] = [];
  const fns: ((x: number) => number)[] = [f];
  let libelle = "Aire signée sous la courbe de f entre les bornes : partie positive en vert, partie négative en rouge";
  if (exercice.scenario === "moyenne") {
    const moyenne = (exercice.primitive.primitiveReference(a) - exercice.primitive.primitiveReference(de)) / largeur;
    segments.push({ x1: de, y1: moyenne, x2: a, y2: moyenne, couleur: COULEURS.ciel, pointilles: true, epaisseur: 2 });
    segments.push({ x1: de, y1: 0, x2: de, y2: moyenne, couleur: COULEURS.ciel, pointilles: true });
    segments.push({ x1: a, y1: 0, x2: a, y2: moyenne, couleur: COULEURS.ciel, pointilles: true });
    fns.push(() => moyenne);
    libelle += " ; en pointillés bleus, le rectangle de base [a ; b] et de hauteur égale à la valeur moyenne";
  }
  // Fenêtre verticale calculée sur l'intervalle d'intégration (légèrement élargi) : une branche qui
  // file vers l'infini hors de [a ; b] ne doit pas écraser la région.
  const { yMin, yMax } = fenetreY(fns, de - largeur * 0.1, a + largeur * 0.1);
  return repereSvg({
    xMin: de - marge,
    xMax: a + marge,
    yMin,
    yMax,
    graduationsX: [de, a].filter((b) => Math.abs(b) > 1e-9).map((b) => ({ x: b, etiquette: etiquetteBorne(b) })),
    regions,
    courbes,
    segments,
    libelle,
  });
}

/** Borne lisible : π/k reconnues, sinon décimal court. */
function etiquetteBorne(b: number): string {
  for (const d of [1, 2, 3, 4, 6]) {
    const n = (b * d) / Math.PI;
    if (Math.abs(n - Math.round(n)) < 1e-9 && Math.round(n) !== 0) {
      const k = Math.round(n);
      const num = Math.abs(k) === 1 ? "π" : `${Math.abs(k)}π`;
      return `${k < 0 ? "−" : ""}${d === 1 ? num : `${num}/${d}`}`;
    }
  }
  return etiquetteNombre(b);
}
