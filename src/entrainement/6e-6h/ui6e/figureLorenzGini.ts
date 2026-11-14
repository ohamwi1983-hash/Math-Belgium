import { evaluerLorenz } from "../core6e/lorenzGini";
import type { CourbeLorenz, ExerciceLorenzGini } from "../core6e/lorenzGini";
import { COULEURS, repereSvg } from "./figureRepereIntegrales";
import type { CourbeRepere, RegionRepere } from "./figureRepereIntegrales";
import { nomRepartition } from "./formatLorenzGini";

/**
 * Figures de `6gen82` — même repère SVG que les aires entre deux courbes de 6gen26
 * (`figureRepereIntegrales.ts::repereSvg`, région comprise entre deux fonctions) : carré unité,
 * diagonale d'égalité parfaite (pointillés), courbe(s) de Lorenz, légende sous la figure (toutes les
 * courbes finissent en (1 ; 1) : des étiquettes posées au bout des courbes se chevaucheraient).
 *
 * - `figureEnonceSvg` : figure de l'ÉNONCÉ — aucune aire colorée (c'est ce qu'on calcule).
 * - `figuresCorrigeSvg` : une figure par courbe, la région entre la diagonale et la courbe colorée
 *   (corrigé papier `figureHtml`, écran de fin d'exercice).
 * Chaînes autonomes : jetons du thème à l'écran, valeurs de repli littérales sur papier.
 */

/** Teintes des courbes : PAS `--accent`, que les documents imprimés redéfinissent en bleu (les deux
 * courbes d'une comparaison y seraient de la même couleur) ; `--attn` (ambre) n'y est pas redéfini,
 * sa valeur de repli orange s'applique. */
const TEINTES = ["var(--attn, #b65c1f)", COULEURS.ciel];
const TEINTES_DOUCES = ["var(--attn-soft, #f4e3d1)", COULEURS.cielDoux];

interface CourbeLegendee {
  courbe: CourbeLorenz;
  nom: string;
  couleur: string;
  pointilles?: boolean;
}

function legendeHtml(entrees: { nom: string; couleur: string; pointilles?: boolean }[]): string {
  const items = entrees
    .map(
      (e) =>
        `<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap"><svg width="24" height="8" aria-hidden="true"><line x1="1" y1="4" x2="23" y2="4" stroke="${e.couleur}" stroke-width="2.4"${e.pointilles ? ' stroke-dasharray="4 3"' : ""}/></svg>${e.nom}</span>`,
    )
    .join("");
  return `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px 16px;font-size:13px;color:${COULEURS.doux};margin-top:2px">${items}</div>`;
}

function repereLorenz(courbes: CourbeLegendee[], regions: RegionRepere[], libelle: string): string {
  const traces: CourbeRepere[] = [
    { fn: (x) => x, de: 0, a: 1, couleur: COULEURS.doux, epaisseur: 1.4, pointilles: true },
    ...courbes.map((c) => ({ fn: (x: number) => evaluerLorenz(c.courbe, x), de: 0, a: 1, couleur: c.couleur, pointilles: c.pointilles })),
  ];
  const svg = repereSvg({
    xMin: -0.06,
    xMax: 1.1,
    yMin: -0.06,
    yMax: 1.1,
    largeur: 300,
    hauteur: 290,
    graduationsX: [
      { x: 0.5, etiquette: "0,5" },
      { x: 1, etiquette: "1" },
    ],
    graduationsY: [
      { y: 0.5, etiquette: "0,5" },
      { y: 1, etiquette: "1" },
    ],
    segments: [
      { x1: 0, y1: 1, x2: 1, y2: 1, couleur: COULEURS.pale, epaisseur: 1 },
      { x1: 1, y1: 0, x2: 1, y2: 1, couleur: COULEURS.pale, epaisseur: 1 },
    ],
    regions,
    courbes: traces,
    libelle,
  });
  const legende = legendeHtml([{ nom: "égalité parfaite (y = x)", couleur: COULEURS.doux, pointilles: true }, ...courbes]);
  return `<div style="display:inline-block;max-width:100%;text-align:center">${svg}${legende}</div>`;
}

function courbesDe(e: ExerciceLorenzGini): CourbeLegendee[] {
  switch (e.variante) {
    case "lecture":
      return [{ courbe: e.courbe, nom: "courbe de Lorenz", couleur: TEINTES[0] }];
    case "comparaison":
      return e.courbes.map((courbe, i) => ({ courbe, nom: capitale(nomRepartition(e, i as 0 | 1)), couleur: TEINTES[i] }));
    case "parametre":
      return [
        { courbe: { famille: e.famille, parametre: 0.5 }, nom: "a = 0,5", couleur: TEINTES[1] },
        { courbe: { famille: e.famille, parametre: 1 }, nom: "a = 1", couleur: TEINTES[0] },
      ];
  }
}

function capitale(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function figureEnonceSvg(e: ExerciceLorenzGini): string {
  const libelle = e.variante === "parametre" ? "Carré unité, diagonale et deux courbes de la famille" : "Carré unité, diagonale d'égalité parfaite et courbe(s) de Lorenz";
  return repereLorenz(courbesDe(e), [], libelle);
}

/** Une figure par courbe de l'exercice (paramètre : la courbe obtenue avec la valeur de a trouvée). */
export function figuresCorrigeSvg(e: ExerciceLorenzGini): string[] {
  const liste: CourbeLegendee[] =
    e.variante === "parametre" ? [{ courbe: { famille: e.famille, parametre: e.a }, nom: `courbe obtenue (a = ${String(e.a).replace(".", ",")})`, couleur: TEINTES[0] }] : courbesDe(e);
  return liste.map((c, i) =>
    repereLorenz(
      [c],
      [{ de: 0, a: 1, haut: (x) => x, bas: (x) => evaluerLorenz(c.courbe, x), remplissage: TEINTES_DOUCES[i % 2], contour: c.couleur }],
      `Région comprise entre la diagonale et la courbe de Lorenz (${c.nom})`,
    ),
  );
}
