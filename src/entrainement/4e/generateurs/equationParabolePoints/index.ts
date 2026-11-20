import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceEquationParabolePoints, FenetreEquationParabole, IdForme, PointEntier, VarianteEquationParabole } from "../../core/equationParabolePoints.types";
import { choisir, entierAlea, melanger } from "../../moteur/algebreTransfertSecondDegre";
import { moinsH, plusQ } from "../../ui/corrigeChapitre3";

/**
 * Générateur de gen125 « Retrouver l'équation d'une parabole ». Tout le hasard passe par
 * `Math.random` (`genererAvecCode` : le QR code rouvre le même exercice).
 *
 * a ∈ {−1 ; ±2 ; ±3 ; ±1/2} — jamais a = 1, sinon la forme « sans a » (piège de l'écran 1) donnerait
 * par chance la bonne équation. Données ENTIÈRES : sommet, zéros, P (et les trois points) ; coefficients
 * développés entiers ou demi-entiers, |f(x_P)| ≤ 30.
 * - sommet : S(h ; k), P d'abscisse h ± 1, 2 ou 3 (pair si |a| = 1/2), souvent (0 ; c) ;
 * - zéros : x₁ < x₂ dans [−5 ; 5], jamais opposés (la forme « signe inversé » serait la même) ;
 * - graphique : sommet lisible et aucun zéro, OU zéros lisibles et sommet entre deux lignes
 *   (x₁ + x₂ impair) — tiré 50/50 ; P marqué sur un nœud ; fenêtre aux bornes entières, échelle
 *   unique, au plus 12 × 14 unités (`ui/figureParaboleGrille.ts`) ;
 * - trois points : (0 ; c), (1 ; f(1)) et (x₂ ; f(x₂)) avec x₂ ∈ {−1 ; 2 ; −2 ; 3}, a entier.
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "sommet", label: "Sommet et un point (forme canonique)" },
  { id: "zeros", label: "Deux zéros et un point (forme factorisée)" },
  { id: "graphique", label: "Parabole lue sur un graphique" },
  { id: "troisPoints", label: "Trois points dont l'ordonnée à l'origine (système)" },
];

const A_POSSIBLES = [-1, 2, -2, 3, -3, 0.5, -0.5];

/** « a(x − h)² + k », coefficient écrit `lettre` (« a », ou rien pour la forme « sans a »). */
export function canoniqueLatex(h: number, k: number, lettre = "a"): string {
  const carre = h === 0 ? "x^2" : `(${moinsH(h)})^2`;
  return `${lettre}${carre}${plusQ(k)}`;
}

/** « a(x − x₁)(x − x₂) » (« ax(x − 3) » si un zéro est nul). */
export function factoriseeLatex(x1: number, x2: number, lettre = "a"): string {
  const facteur = (r: number) => (r === 0 ? "x" : `(${moinsH(r)})`);
  const [f1, f2] = [facteur(x1), facteur(x2)];
  return x1 === 0 ? `${lettre}${f1}${f2}` : x2 === 0 ? `${lettre}${f2}${f1}` : `${lettre}${f1}${f2}`;
}

export function developpeeLatex(c: number, lettreA = "a"): string {
  return `${lettreA}x^2+bx${plusQ(c)}`;
}

function valeur(A: number, B: number, C: number, x: number): number {
  return A * x * x + B * x + C;
}

function fenetreGraphique(points: PointEntier[]): FenetreEquationParabole | null {
  const xs = [0, ...points.map((p) => p.x)];
  const ys = [0, ...points.map((p) => p.y)];
  let xMin = Math.floor(Math.min(...xs)) - 1;
  let xMax = Math.ceil(Math.max(...xs)) + 1;
  while (xMax - xMin < 8) {
    if (xMin % 2 === 0) xMin--;
    else xMax++;
  }
  let yMin = Math.floor(Math.min(...ys)) - 1;
  let yMax = Math.ceil(Math.max(...ys)) + 1;
  while (yMax - yMin < 7) yMax++;
  if (xMax - xMin > 12 || yMax - yMin > 14) return null;
  return { xMin, xMax, yMin, yMax };
}

function options(liste: [IdForme, string][]): { id: IdForme; latex: string }[] | null {
  if (new Set(liste.map(([, l]) => l)).size !== liste.length) return null;
  return melanger(liste.map(([id, latex]) => ({ id, latex })));
}

function tirer(variante: VarianteEquationParabole): ExerciceEquationParabolePoints {
  for (;;) {
    const a = choisir(variante === "troisPoints" ? [-1, 2, -2, 3, -3] : A_POSSIBLES);
    const demi = Math.abs(a) === 0.5;
    if (variante === "troisPoints") {
      const b = entierAlea(-5, 5);
      const c = entierAlea(-6, 6);
      const x2 = choisir([-1, 2, -2, 3]);
      const points = [0, 1, x2].map((x) => ({ x, y: valeur(a, b, c, x) }));
      if (points.some((p) => Math.abs(p.y) > 30) || points[1]!.y === c) continue;
      // B ne doit pas être le sommet : sinon l'option « B pris pour le sommet » serait juste.
      if (-b / (2 * a) === 1) continue;
      const opts = options([
        ["juste", developpeeLatex(c)],
        ["cAutre", developpeeLatex(points[1]!.y)],
        ["pointSommet", canoniqueLatex(1, points[1]!.y)],
        ["sansA", developpeeLatex(c, "")],
      ]);
      if (!opts) continue;
      const h = -b / (2 * a);
      return { variante, donnees: "troisPoints", coefficients: [a, b, c], sommet: { x: h, y: valeur(a, b, c, h) }, zeros: [], point: points[2]!, points, optionsForme: opts };
    }
    let donnees: "sommet" | "zeros" = variante === "zeros" ? "zeros" : "sommet";
    if (variante === "graphique") donnees = Math.random() < 0.5 ? "sommet" : "zeros";
    let h: number, k: number, zeros: number[];
    if (donnees === "sommet") {
      h = demi ? choisir([-4, -2, 0, 2, 4]) : entierAlea(-4, 4);
      k = entierAlea(-6, 6);
      if (h === 0 && k === 0) continue;
      // Graphique : aucun zéro (sinon ils se liraient aussi) ; sommet + point : zéros quelconques.
      if (variante === "graphique" && (k === 0 || Math.sign(k) !== Math.sign(a))) continue;
      zeros = [];
    } else {
      const x1 = entierAlea(-5, 4);
      const x2 = entierAlea(x1 + 1, Math.min(5, x1 + 7));
      if (x1 === -x2) continue;
      // Graphique : sommet entre deux lignes (x₁ + x₂ impair) ; zéros + point : quelconques.
      // Écart d'au moins 3 : l'arche se voit (avec −5 et −4, a = −1/2, elle ne montait que de 1/8).
      if (variante === "graphique" && ((x1 + x2) % 2 === 0 || x2 - x1 < 3)) continue;
      zeros = [x1, x2];
      h = (x1 + x2) / 2;
      k = -a * ((x2 - x1) / 2) ** 2;
    }
    const A = a, B = -2 * a * h, C = a * h * h + k;
    // Point P : (0 ; c) une fois sur trois quand c'est possible, sinon h ± t.
    let xP: number;
    if (Math.random() < 0.35 && h !== 0 && !zeros.includes(0)) xP = 0;
    else xP = Math.round(h) + choisir([-3, -2, -1, 1, 2, 3]) * (demi && donnees === "sommet" ? 2 : 1);
    if (Math.abs(xP - h) < 1e-9 || zeros.includes(xP)) continue;
    const yP = valeur(A, B, C, xP);
    if (!Number.isInteger(yP) || Math.abs(yP) > 30 || Math.abs(xP) > 6) continue;
    if (![A, B, C].every((v) => Number.isInteger(v * 2))) continue;
    const point = { x: xP, y: yP };
    let fenetre: FenetreEquationParabole | undefined;
    if (variante === "graphique") {
      const f = fenetreGraphique([{ x: h, y: k }, point, ...zeros.map((z) => ({ x: z, y: 0 })), { x: h - 2, y: k + 4 * a }, { x: h + 2, y: k + 4 * a }]);
      if (!f) continue;
      fenetre = f;
    }
    const opts =
      donnees === "sommet"
        ? options([
            ["juste", canoniqueLatex(h, k)],
            ["signe", h !== 0 ? canoniqueLatex(-h, k) : canoniqueLatex(h, -k)],
            ["pointSommet", canoniqueLatex(xP, yP)],
            ["sansA", canoniqueLatex(h, k, "")],
          ])
        : options([
            ["juste", factoriseeLatex(zeros[0]!, zeros[1]!)],
            ["signe", factoriseeLatex(-zeros[1]!, -zeros[0]!)],
            ["pointSommet", canoniqueLatex(xP, yP)],
            ["sansA", factoriseeLatex(zeros[0]!, zeros[1]!, "")],
          ]);
    if (!opts) continue;
    return { variante, donnees, coefficients: [A, B, C], sommet: { x: h, y: k }, zeros, point, points: [], fenetre, optionsForme: opts };
  }
}

export function construireAvecVariante(id: string): ExerciceEquationParabolePoints {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceEquationParabolePoints();
  return tirer(id as VarianteEquationParabole);
}

export function genererExerciceEquationParabolePoints(): ExerciceEquationParabolePoints {
  return tirer(choisir(CATALOGUE_VARIANTES).id as VarianteEquationParabole);
}
