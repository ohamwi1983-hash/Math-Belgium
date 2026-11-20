import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceLectureParabole, FenetreParabole, IdOptionImage, IdOptionSignes, Signe, TripleSignes, VarianteLectureParabole } from "../../core/lectureParabole.types";
import { choisir, entierAlea, melanger } from "../../moteur/algebreTransfertSecondDegre";
import { coefC, signe, signesJustes } from "../../moteur/modeleLectureParabole";

/**
 * Générateur de gen123 « Lire une parabole sur un graphique ». Tout le hasard passe par
 * `Math.random` (`genererAvecCode` : le QR code rouvre le même graphique).
 *
 * f(x) = a(x − x_S)² + y_S avec a ∈ {±1 ; ±2 ; ±1/2}, x_S entier (0 dans ≈ 12 % des tirages : b = 0),
 * y_S entier choisi pour que les zéros soient ENTIERS (deux zéros : y_S = −a·d², x_S ± d ; un zéro :
 * y_S = 0) ou qu'il n'y en ait aucun (y_S du signe de a). |a| = 1/2 impose x_S et d pairs (c et y_S
 * entiers). Fenêtre aux bornes entières contenant l'origine, le sommet, les zéros et (0 ; c), avec
 * une marge d'une unité, au plus 12 unités de large et 14 de haut, la parabole ouverte sur au moins
 * 3 unités au-delà du sommet : tout ce qui se lit est sur un nœud de la grille.
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "deuxZeros", label: "Parabole qui coupe l'axe des x en deux points" },
  { id: "unZero", label: "Sommet sur l'axe des x (un zéro)" },
  { id: "aucunZero", label: "Parabole qui ne coupe pas l'axe des x" },
];

const LARGEUR_MIN = 8;
const LARGEUR_MAX = 12;
const HAUTEUR_MIN = 7;
const HAUTEUR_MAX = 14;

function fenetre(e: Omit<ExerciceLectureParabole, "fenetre" | "optionsSignes" | "optionsImage">): FenetreParabole | null {
  const c = coefC(e as ExerciceLectureParabole);
  const xs = [0, e.xS, ...e.zeros];
  let xMin = Math.min(...xs) - 1;
  let xMax = Math.max(...xs) + 1;
  // Bras de la parabole visibles : au moins 2 unités de part et d'autre du sommet.
  xMin = Math.min(xMin, e.xS - 2);
  xMax = Math.max(xMax, e.xS + 2);
  while (xMax - xMin < LARGEUR_MIN) {
    if (e.xS - xMin <= xMax - e.xS) xMin--;
    else xMax++;
  }
  if (xMax - xMin > LARGEUR_MAX) return null;
  const ys = [0, e.yS, c];
  let yMin = Math.min(...ys) - 1;
  let yMax = Math.max(...ys) + 1;
  if (e.a > 0) yMax = Math.max(yMax, e.yS + 3);
  else yMin = Math.min(yMin, e.yS - 3);
  while (yMax - yMin < HAUTEUR_MIN) {
    if (e.a > 0) yMax++;
    else yMin--;
  }
  if (yMax - yMin > HAUTEUR_MAX) return null;
  return { xMin, xMax, yMin, yMax };
}

function autreSigne(s: Signe, prefere: Signe): Signe {
  if (s !== 0) return (-s) as Signe;
  return prefere === 0 ? 1 : prefere;
}

/** Les 4 combinaisons de l'écran 1 : la juste et trois erreurs typiques, chacune sur UNE lecture. */
function optionsSignes(e: Omit<ExerciceLectureParabole, "fenetre" | "optionsSignes" | "optionsImage">): { id: IdOptionSignes; signes: TripleSignes }[] {
  const [sa, sb, sc] = signesJustes(e as ExerciceLectureParabole);
  // b lu « seul » (côté de l'axe pris pour le signe de b, sans tenir compte de a) : b inversé ;
  // axe sur l'axe des y (b = 0) : « b du signe de a ».
  const bSeul: TripleSignes = [sa, sb === 0 ? sa : ((-sb) as Signe), sc];
  // c lu sur le sommet : signe de y_S s'il diffère de celui de c, sinon c inversé.
  const sy = signe(e.yS);
  const cSommet: TripleSignes = [sa, sb, sy !== sc ? sy : autreSigne(sc, (-sa) as Signe)];
  // Ouverture mal lue : a inversé, donc b aussi (la règle des signes est appliquée correctement).
  const ouverture: TripleSignes = [(-sa) as Signe, (sb === 0 ? 0 : -sb) as Signe, sc];
  return melanger([
    { id: "juste" as const, signes: [sa, sb, sc] as TripleSignes },
    { id: "bSeul" as const, signes: bSeul },
    { id: "cSommet" as const, signes: cSommet },
    { id: "ouverture" as const, signes: ouverture },
  ]);
}

function optionsImage(e: Omit<ExerciceLectureParabole, "fenetre" | "optionsSignes" | "optionsImage">): IdOptionImage[] {
  const c = coefC(e as ExerciceLectureParabole);
  const troisieme: IdOptionImage = e.xS !== e.yS ? "abscisse" : c !== e.yS ? "origine" : "reels";
  return melanger<IdOptionImage>(["juste", "sens", troisieme, "ouvert"]);
}

function tirer(variante: VarianteLectureParabole): ExerciceLectureParabole {
  for (;;) {
    const a = choisir([1, -1, 2, -2, 0.5, -0.5]);
    const demi = Math.abs(a) === 0.5;
    // Un seul zéro avec x_S = 0 : sommet à l'origine (b = c = 0, rien à lire) — rare.
    const xS = Math.random() < (variante === "unZero" ? 0.04 : 0.12) ? 0 : demi ? choisir([-4, -2, 2, 4]) : choisir([-4, -3, -2, -1, 1, 2, 3, 4]);
    let yS: number;
    let zeros: number[];
    if (variante === "deuxZeros") {
      const d = demi ? choisir([2, 4]) : Math.abs(a) === 2 ? choisir([1, 2]) : choisir([1, 2, 3]);
      yS = -a * d * d;
      zeros = [xS - d, xS + d];
    } else if (variante === "unZero") {
      yS = 0;
      zeros = [xS];
    } else {
      yS = (a > 0 ? 1 : -1) * entierAlea(1, 4);
      zeros = [];
    }
    const base = { variante, a, xS, yS, zeros };
    const c = coefC(base as ExerciceLectureParabole);
    if (!Number.isInteger(c) || !Number.isInteger(yS)) continue;
    // Un zéro en 0 (c = 0) sortait dans ≈ 39 % des « deux zéros » (petites fenêtres favorisées) :
    // ramené vers ≈ 12 %, comme b = 0.
    if (variante === "deuxZeros" && c === 0 && xS !== 0 && Math.random() < 0.8) continue;
    const fen = fenetre(base);
    if (!fen) continue;
    // Les quatre combinaisons doivent être distinctes.
    const opts = optionsSignes(base);
    const cles = new Set(opts.map((o) => o.signes.join(",")));
    if (cles.size !== 4) continue;
    return { ...base, fenetre: fen, optionsSignes: opts, optionsImage: optionsImage(base) };
  }
}

export function construireAvecVariante(id: string): ExerciceLectureParabole {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceLectureParabole();
  return tirer(id as VarianteLectureParabole);
}

export function genererExerciceLectureParabole(): ExerciceLectureParabole {
  return tirer(choisir(CATALOGUE_VARIANTES).id as VarianteLectureParabole);
}
