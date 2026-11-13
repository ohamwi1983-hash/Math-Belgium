import type { ExerciceGraphiqueContexte, PointCle, QuestionGraphique } from "../core/graphiqueContexte.types";
import type { Morceau } from "../core/inequation.types";
import { evaluerCourbe } from "../moteur/courbeGraphiqueContexte";
import { formatNombreTexte } from "../generateurs/graphiqueContexte/contextes";

/**
 * gen70 — figure SVG statique d'un exercice « graphique en contexte », UNE seule construction pour
 * l'écran et le papier (énoncé, corrigé annoté) : axes fléchés, grille, graduations chiffrées, nom
 * et unité de chaque grandeur. À l'écran, couleurs du thème (`style="stroke:var(--…)"`, suit le mode
 * sombre) ; sur papier, couleurs fixes.
 *
 * Deux surcouches possibles :
 * - `guide` (aide 2 à l'écran) : un repère SANS la réponse (verticale passant par x, horizontale à la
 *   hauteur k, points marqués) ;
 * - `annotation` (corrigé) : la lecture complète d'une question (pointillés de lecture, intervalles
 *   solutions surlignés sur l'axe et sur la courbe, crochets pleins/vides).
 */

export type ThemeSvg = "ecran" | "papier";

export type GuideSvg = { type: "verticale"; x: number } | { type: "horizontale"; y: number } | { type: "points"; points: PointCle[] };

interface Palette {
  fond: string;
  grille: string;
  grilleForte: string;
  axe: string;
  texte: string;
  courbe: string;
  guide: string;
  solution: string;
  police: string;
}

const PALETTES: Record<ThemeSvg, Palette> = {
  ecran: {
    fond: "var(--surface)",
    grille: "var(--line-soft)",
    grilleForte: "var(--line)",
    axe: "var(--ink)",
    texte: "var(--ink-soft)",
    courbe: "var(--accent)",
    guide: "var(--sky)",
    solution: "var(--good)",
    police: "inherit",
  },
  papier: {
    fond: "#ffffff",
    grille: "#e3e8ec",
    grilleForte: "#b8c3cc",
    axe: "#1f2933",
    texte: "#3e4c59",
    courbe: "#d6336c",
    guide: "#1c7ed6",
    solution: "#2b8a3e",
    police: "Helvetica, Arial, sans-serif",
  },
};

const LARGEUR = 480;
const HAUTEUR = 300;
const MARGE_GAUCHE = 50;
const MARGE_DROITE = 24;
const MARGE_HAUT = 30;
const MARGE_BAS = 46;
const POLICE = 13;

function arrondi(v: number): string {
  return `${Math.round(v * 100) / 100}`;
}

export interface OptionsSvgGraphique {
  theme: ThemeSvg;
  guide?: GuideSvg | null;
  annotation?: QuestionGraphique | null;
}

export function construireSvgGraphiqueContexte(exercice: ExerciceGraphiqueContexte, options: OptionsSvgGraphique): string {
  const pal = PALETTES[options.theme];
  const { axeX, axeY } = exercice;
  const x0 = MARGE_GAUCHE;
  const x1 = LARGEUR - MARGE_DROITE - 10;
  const yBas = HAUTEUR - MARGE_BAS;
  const yHaut = MARGE_HAUT + 6;
  const px = (x: number) => x0 + ((x - axeX.min) / (axeX.max - axeX.min)) * (x1 - x0);
  const py = (y: number) => yBas - ((y - axeY.min) / (axeY.max - axeY.min)) * (yBas - yHaut);
  const trait = (couleur: string, epaisseur: number, extra = "") => `style="stroke:${couleur};stroke-width:${epaisseur};fill:none${extra}"`;
  const texte = (x: number, y: number, contenu: string, ancre: "start" | "middle" | "end", couleur = pal.texte, gras = false) =>
    `<text x="${arrondi(x)}" y="${arrondi(y)}" text-anchor="${ancre}" style="fill:${couleur};font-size:${POLICE}px${gras ? ";font-weight:600" : ""}">${contenu}</text>`;

  const morceaux: string[] = [];
  morceaux.push(`<rect x="0" y="0" width="${LARGEUR}" height="${HAUTEUR}" style="fill:${pal.fond};stroke:none" />`);

  // Grille (verticales puis horizontales), graduations chiffrées plus marquées.
  const nbX = Math.round((axeX.max - axeX.min) / axeX.pas);
  for (let i = 0; i <= nbX; i++) {
    const x = axeX.min + i * axeX.pas;
    const forte = Math.abs(((x - axeX.min) / axeX.pasEtiquette) % 1) < 1e-9 || Math.abs((((x - axeX.min) / axeX.pasEtiquette) % 1) - 1) < 1e-9;
    morceaux.push(`<line x1="${arrondi(px(x))}" y1="${arrondi(yBas)}" x2="${arrondi(px(x))}" y2="${arrondi(yHaut)}" ${trait(forte ? pal.grilleForte : pal.grille, forte ? 0.9 : 0.6)} />`);
  }
  const nbY = Math.round((axeY.max - axeY.min) / axeY.pas);
  for (let i = 0; i <= nbY; i++) {
    const y = axeY.min + i * axeY.pas;
    const r = (y - axeY.min) / axeY.pasEtiquette;
    const forte = Math.abs(r - Math.round(r)) < 1e-9;
    const zero = y === 0 && axeY.min < 0;
    morceaux.push(
      `<line x1="${arrondi(x0)}" y1="${arrondi(py(y))}" x2="${arrondi(x1)}" y2="${arrondi(py(y))}" ${trait(zero ? pal.texte : forte ? pal.grilleForte : pal.grille, zero ? 1.3 : forte ? 0.9 : 0.6)} />`,
    );
  }

  // Graduations chiffrées.
  for (let x = axeX.min; x <= axeX.max + 1e-9; x += axeX.pasEtiquette) {
    morceaux.push(`<line x1="${arrondi(px(x))}" y1="${arrondi(yBas)}" x2="${arrondi(px(x))}" y2="${arrondi(yBas + 4)}" ${trait(pal.axe, 1.2)} />`);
    morceaux.push(texte(px(x), yBas + 18, formatNombreTexte(x), "middle"));
  }
  for (let y = axeY.min; y <= axeY.max + 1e-9; y += axeY.pasEtiquette) {
    morceaux.push(`<line x1="${arrondi(x0 - 4)}" y1="${arrondi(py(y))}" x2="${arrondi(x0)}" y2="${arrondi(py(y))}" ${trait(pal.axe, 1.2)} />`);
    morceaux.push(texte(x0 - 7, py(y) + 4.5, formatNombreTexte(y), "end"));
  }

  // Axes fléchés (ils se croisent en (min, min) : coin inférieur gauche de la fenêtre).
  const bout = x1 + 14;
  const sommet = yHaut - 18;
  morceaux.push(`<line x1="${arrondi(x0)}" y1="${arrondi(yBas)}" x2="${arrondi(bout)}" y2="${arrondi(yBas)}" ${trait(pal.axe, 1.4)} />`);
  morceaux.push(`<polygon points="${arrondi(bout + 7)},${arrondi(yBas)} ${arrondi(bout - 2)},${arrondi(yBas - 4.5)} ${arrondi(bout - 2)},${arrondi(yBas + 4.5)}" style="fill:${pal.axe};stroke:none" />`);
  morceaux.push(`<line x1="${arrondi(x0)}" y1="${arrondi(yBas)}" x2="${arrondi(x0)}" y2="${arrondi(sommet)}" ${trait(pal.axe, 1.4)} />`);
  morceaux.push(`<polygon points="${arrondi(x0)},${arrondi(sommet - 7)} ${arrondi(x0 - 4.5)},${arrondi(sommet + 2)} ${arrondi(x0 + 4.5)},${arrondi(sommet + 2)}" style="fill:${pal.axe};stroke:none" />`);
  const nomAxe = (nom: string, unite: string) => (unite ? `${nom} (${unite})` : nom);
  morceaux.push(texte(x0 + 9, sommet + 2, nomAxe(axeY.nom, axeY.unite), "start", pal.axe, true));
  morceaux.push(texte(bout + 6, HAUTEUR - 8, nomAxe(axeX.nom, axeX.unite), "end", pal.axe, true));

  // Courbe.
  const cheminCourbe = (debut: number, fin: number) => {
    if (exercice.courbe.type === "lineaire") {
      const pts = exercice.courbe.points.filter((p) => p.x > debut + 1e-9 && p.x < fin - 1e-9);
      const tous = [{ x: debut, y: evaluerCourbe(exercice.courbe, debut) }, ...pts, { x: fin, y: evaluerCourbe(exercice.courbe, fin) }];
      return tous.map((p, i) => `${i === 0 ? "M" : "L"}${arrondi(px(p.x))} ${arrondi(py(p.y))}`).join(" ");
    }
    const n = Math.max(8, Math.round(((fin - debut) / (axeX.max - axeX.min)) * 360));
    const d: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = debut + ((fin - debut) * i) / n;
      d.push(`${i === 0 ? "M" : "L"}${arrondi(px(x))} ${arrondi(py(evaluerCourbe(exercice.courbe, x)))}`);
    }
    return d.join(" ");
  };
  morceaux.push(`<path d="${cheminCourbe(axeX.min, axeX.max)}" ${trait(pal.courbe, 2.6, ";stroke-linejoin:round;stroke-linecap:round")} />`);

  const pointieV = (x: number, yA: number, yB: number, couleur: string) =>
    `<line x1="${arrondi(px(x))}" y1="${arrondi(py(yA))}" x2="${arrondi(px(x))}" y2="${arrondi(py(yB))}" ${trait(couleur, 1.6, ";stroke-dasharray:5 4")} />`;
  const pointieH = (y: number, xA: number, xB: number, couleur: string) =>
    `<line x1="${arrondi(px(xA))}" y1="${arrondi(py(y))}" x2="${arrondi(px(xB))}" y2="${arrondi(py(y))}" ${trait(couleur, 1.6, ";stroke-dasharray:5 4")} />`;
  const point = (x: number, y: number, couleur: string) => `<circle cx="${arrondi(px(x))}" cy="${arrondi(py(y))}" r="4.2" style="fill:${couleur};stroke:${pal.fond};stroke-width:1.2" />`;

  const guide = options.guide;
  if (guide) {
    if (guide.type === "verticale") morceaux.push(pointieV(guide.x, axeY.min, axeY.max, pal.guide));
    else if (guide.type === "horizontale") morceaux.push(pointieH(guide.y, axeX.min, axeX.max, pal.guide));
    else for (const p of guide.points) morceaux.push(point(p.x, p.y, pal.guide));
  }

  const q = options.annotation;
  if (q) morceaux.push(...annotation(q));

  function surlignerIntervalles(intervalles: Morceau[]): string[] {
    const sortie: string[] = [];
    for (const m of intervalles) {
      const g = m.borneGauche as number;
      const d = m.borneDroite as number;
      sortie.push(`<path d="${cheminCourbe(g, d)}" ${trait(pal.solution, 5, ";stroke-linecap:round;stroke-linejoin:round;opacity:0.75")} />`);
      sortie.push(`<line x1="${arrondi(px(g))}" y1="${arrondi(yBas)}" x2="${arrondi(px(d))}" y2="${arrondi(yBas)}" ${trait(pal.solution, 5)} />`);
      for (const [borne, ferme] of [
        [g, m.crochetGauche === "["],
        [d, m.crochetDroit === "]"],
      ] as const) {
        sortie.push(
          `<circle cx="${arrondi(px(borne))}" cy="${arrondi(yBas)}" r="4.6" style="fill:${ferme ? pal.solution : pal.fond};stroke:${pal.solution};stroke-width:2" />`,
        );
      }
    }
    return sortie;
  }

  function annotation(question: QuestionGraphique): string[] {
    switch (question.type) {
      case "image":
        return [pointieV(question.x, axeY.min, question.y, pal.guide), pointieH(question.y, axeX.min, question.x, pal.guide), point(question.x, question.y, pal.guide)];
      case "antecedent":
        return [
          pointieH(question.k, axeX.min, axeX.max, pal.guide),
          ...question.solutions.flatMap((x) => [pointieV(x, axeY.min, question.k, pal.guide), point(x, question.k, pal.guide)]),
        ];
      case "inequation":
        return [pointieH(question.k, axeX.min, axeX.max, pal.guide), ...surlignerIntervalles(question.solution)];
      case "extremum":
        return [pointieV(question.x, axeY.min, question.y, pal.guide), pointieH(question.y, axeX.min, question.x, pal.guide), point(question.x, question.y, pal.guide)];
      case "variation":
        return surlignerIntervalles(question.intervalles);
      case "tendance":
        return [pointieH(question.L, axeX.min, axeX.max, pal.guide)];
    }
  }

  const description = `Graphique : ${nomAxe(axeY.nom, axeY.unite)} en fonction de ${nomAxe(axeX.nom, axeX.unite)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" width="${LARGEUR}" height="${HAUTEUR}" role="img" aria-label="${description}" style="max-width:100%;height:auto;display:block;margin:0 auto;font-family:${pal.police}">${morceaux.join("")}</svg>`;
}
