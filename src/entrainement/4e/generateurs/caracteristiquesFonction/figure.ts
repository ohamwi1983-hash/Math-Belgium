import type { ExerciceCaracteristiquesFonction } from "../../core/caracteristiquesFonction.types";
import type { Morceau } from "../../core/inequation.types";
import { construireSvgFonction, type GrilleSvg, type ViewBoxSvg } from "../../../export/svgGraph";
import { calculerViewBoxCaracteristiques } from "../../ui/mafsCaracteristiquesFonction";
import {
  evaluerCourbeCaracteristiques,
  existeOrdonneeCaracteristiques,
  existeValeurEnVCaracteristiques,
  valeurHyperboleEnB5,
  valeurNaturelleEnB5,
} from "../../moteur/verificationCaracteristiquesFonction";

/**
 * Graphique papier de gen12 (énoncé et corrigé annoté) — sans dépendance à `docx`, pour être
 * importé par le corrigé détaillé partagé avec l'appli (`corrigeDetaille.ts`).
 */

const COULEUR_COURBE = "#d6336c";
/** Même valeur que la constante interne (non exportée) `MARGE` de `export/svgGraph.ts` — nécessaire
 * pour dupliquer localement sa transformation x/y→pixel (voir commentaire de tête de fichier). */
const MARGE_SVG = 10;
/** Cadre du graphique papier : fenêtre aux bornes ENTIÈRES, quadrillage d'une unité, carreaux
 * carrés assez grands pour lire (décision de l'utilisateur : toutes les valeurs à lire — bornes,
 * zéros, extremums, f(0), f(v), asymptotes, toutes entières — tombent sur les lignes de la grille ;
 * le pas automatique « nombre rond » de 5 ou 10 les laissait entre deux lignes). */
interface CadreCaracteristiques {
  viewBox: ViewBoxSvg;
  largeur: number;
  hauteur: number;
  grille: GrilleSvg;
}

const LARGEUR_UTILE_MAX = 600;
const HAUTEUR_UTILE_MAX = 420;

function cadreCaracteristiques(exercice: ExerciceCaracteristiquesFonction): CadreCaracteristiques {
  const v = calculerViewBoxCaracteristiques(exercice);
  const viewBox: ViewBoxSvg = { xMin: Math.floor(v.x[0]), xMax: Math.ceil(v.x[1]), yMin: Math.floor(v.y[0]), yMax: Math.ceil(v.y[1]) };
  const carreauxX = viewBox.xMax - viewBox.xMin;
  const carreauxY = viewBox.yMax - viewBox.yMin;
  const carreau = Math.max(11, Math.min(18, Math.floor(Math.min(LARGEUR_UTILE_MAX / carreauxX, HAUTEUR_UTILE_MAX / carreauxY))));
  // Graduation écrite toutes les 1, 2 ou 5 unités selon la place (≥ 16 px entre deux nombres).
  const etiquette = carreau >= 16 ? 1 : 2 * carreau >= 16 ? 2 : 5;
  return {
    viewBox,
    largeur: carreauxX * carreau + 2 * MARGE_SVG,
    hauteur: carreauxY * carreau + 2 * MARGE_SVG,
    grille: { pasX: 1, pasY: 1, etiquetteX: etiquette, etiquetteY: etiquette },
  };
}

export function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function formatBorneLatex(borne: number | "-inf" | "+inf"): string {
  if (borne === "-inf") return "-\\infty";
  if (borne === "+inf") return "+\\infty";
  return formatNombre(borne);
}

/** Notation française à crochets inversés, en LaTeX — même convention que `ui/formatSolutionEnsemble.ts`
 * (dupliquée ici en LaTeX plutôt que texte brut, jamais réexportée : cette dernière n'a pas de
 * variante LaTeX déjà écrite). */
export function formatMorceauLatex(morceau: Morceau): string {
  return `${morceau.crochetGauche}${formatBorneLatex(morceau.borneGauche)}\\,;\\,${formatBorneLatex(morceau.borneDroite)}${morceau.crochetDroit}`;
}

export function formatMorceauxLatex(morceaux: Morceau[]): string {
  return morceaux.map(formatMorceauLatex).join(" \\cup ");
}

/**
 * Évaluateur passé à `construireSvgFonction` — délègue entièrement à `evaluerCourbeCaracteristiques`
 * (seule source de vérité pour f(x), partagée avec l'écran), en forçant `null` (coupure de tracé)
 * dans une fenêtre autour de `b5` et de `AV` :
 * - `AV` : la branche hyperbolique diverge vers ±∞ des deux côtés — sans coupure explicite, deux
 *   échantillons voisins de part et d'autre de l'asymptote (l'un très grand positif, l'autre très
 *   grand négatif) seraient reliés par une ligne quasi verticale traversant tout le cadre, comme si
 *   les deux branches se rejoignaient (elles ne se rejoignent jamais).
 * - `b5` : discontinuité de saut (3 cas possibles, voir `core/caracteristiquesFonction.types.ts`) —
 *   la zone 5 (x<b5) approche `y5Naturel` sans jamais l'atteindre, tandis que la formule pour x>=b5
 *   utilisée par `evaluerCourbeCaracteristiques` bascule sur la branche hyperbolique ; sans coupure,
 *   les deux seraient reliées par une ligne droite qui n'existe pas sur la vraie courbe, quel que
 *   soit le cas tiré (même piège que documenté en tête de `ui/mafsCaracteristiquesFonction.ts`,
 *   fonction `calculerSegmentsCaracteristiquesVisibles`).
 * La fenêtre (`epsilonRupture`) est volontairement large par rapport à l'écart entre deux échantillons
 * consécutifs de `construireSvgFonction` (`NB_POINTS_ECHANTILLON=240` sur toute la largeur visible) :
 * garantit qu'au moins un échantillon tombe dedans quelle que soit la phase du quadrillage régulier,
 * sans distordre visuellement le reste de la courbe (fenêtre <2% de la largeur visible totale).
 */
function evaluerPourSvgCaracteristiques(exercice: ExerciceCaracteristiquesFonction, viewBox: ViewBoxSvg): (x: number) => number | null {
  const epsilonRupture = (viewBox.xMax - viewBox.xMin) / 60;
  return (x: number) => {
    if (Math.abs(x - exercice.b5) < epsilonRupture) return null;
    if (Math.abs(x - exercice.AV) < epsilonRupture) return null;
    const y = evaluerCourbeCaracteristiques(exercice, x);
    return Number.isFinite(y) ? y : null;
  };
}

/** Réplique locale (voir commentaire de tête de fichier) de la transformation x/y→pixel interne de
 * `construireSvgFonction` — nécessaire pour placer les marqueurs supplémentaires (cercles, asymptotes
 * en pointillé) exactement sur la même grille que la courbe tracée par cette fonction. */
function construireTransformSvg(viewBox: ViewBoxSvg, largeur: number, hauteur: number) {
  const zoneX = largeur - 2 * MARGE_SVG;
  const zoneY = hauteur - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - viewBox.xMin) / (viewBox.xMax - viewBox.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((viewBox.yMax - y) / (viewBox.yMax - viewBox.yMin)) * zoneY;
  return { sx, sy };
}

function cercleVide(sx: (x: number) => number, sy: (y: number) => number, x: number, y: number): string {
  return `<circle cx="${sx(x).toFixed(1)}" cy="${sy(y).toFixed(1)}" r="3" fill="#ffffff" stroke="${COULEUR_COURBE}" stroke-width="1.5"/>`;
}

function cerclePlein(sx: (x: number) => number, sy: (y: number) => number, x: number, y: number): string {
  return `<circle cx="${sx(x).toFixed(1)}" cy="${sy(y).toFixed(1)}" r="3" fill="${COULEUR_COURBE}"/>`;
}

/**
 * Marqueurs qui n'ont pas d'équivalent dans `PointMarqueSvg` (cercles VIDES, asymptotes en
 * pointillé) — voir commentaire de tête de fichier. Reproduit fidèlement `MafsGraphCaracteristiquesFonction.tsx` :
 * cercle vide au point creux (c, valeurNaturelleC), point plein à chaque borne de gap, cercle vide
 * TOUJOURS côté zone 5 en b5 (y5Naturel), second marqueur en b5 plein pour "pointPlein"/vide sinon,
 * 3e point plein isolé pour "pointRedefini", segment pointillé reliant les deux marqueurs de la
 * discontinuité, asymptotes x=AV et y=L en pointillé.
 */
function construireMarqueursSupplementaires(exercice: ExerciceCaracteristiquesFonction, cadre: CadreCaracteristiques): string {
  const { largeur: LARGEUR_SVG, hauteur: HAUTEUR_SVG } = cadre;
  const { sx, sy } = construireTransformSvg(cadre.viewBox, LARGEUR_SVG, HAUTEUR_SVG);
  const morceaux: string[] = [];

  const xAV = sx(exercice.AV).toFixed(1);
  morceaux.push(`<line x1="${xAV}" y1="${MARGE_SVG}" x2="${xAV}" y2="${HAUTEUR_SVG - MARGE_SVG}" stroke="${COULEUR_COURBE}" stroke-width="1" stroke-dasharray="4 3" opacity="0.55"/>`);
  const yL = sy(exercice.L).toFixed(1);
  morceaux.push(`<line x1="${MARGE_SVG}" y1="${yL}" x2="${LARGEUR_SVG - MARGE_SVG}" y2="${yL}" stroke="${COULEUR_COURBE}" stroke-width="1" stroke-dasharray="4 3" opacity="0.55"/>`);

  const yCreux = valeurNaturelleEnB5(exercice);
  const yHyperboleNaturel = valeurHyperboleEnB5(exercice);
  const xB5 = sx(exercice.b5).toFixed(1);
  morceaux.push(`<line x1="${xB5}" y1="${sy(yCreux).toFixed(1)}" x2="${xB5}" y2="${sy(yHyperboleNaturel).toFixed(1)}" stroke="${COULEUR_COURBE}" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.7"/>`);

  morceaux.push(cercleVide(sx, sy, exercice.c, exercice.valeurNaturelleC));

  for (const gap of exercice.gaps) {
    morceaux.push(cerclePlein(sx, sy, gap.g1, evaluerCourbeCaracteristiques(exercice, gap.g1)));
    morceaux.push(cerclePlein(sx, sy, gap.g2, evaluerCourbeCaracteristiques(exercice, gap.g2)));
  }

  morceaux.push(cercleVide(sx, sy, exercice.b5, yCreux));
  morceaux.push(
    exercice.discontinuite.type === "pointPlein" ? cerclePlein(sx, sy, exercice.b5, yHyperboleNaturel) : cercleVide(sx, sy, exercice.b5, yHyperboleNaturel),
  );
  if (exercice.discontinuite.type === "pointRedefini") {
    morceaux.push(cerclePlein(sx, sy, exercice.b5, exercice.discontinuite.valeur));
  }

  return morceaux.join("");
}

export function construireGrapheCaracteristiques(exercice: ExerciceCaracteristiquesFonction, annote = false): string {
  const cadre = cadreCaracteristiques(exercice);
  const { viewBox } = cadre;
  const svgBase = construireSvgFonction(evaluerPourSvgCaracteristiques(exercice, viewBox), viewBox, {
    largeur: cadre.largeur,
    hauteur: cadre.hauteur,
    couleurCourbe: COULEUR_COURBE,
    classe: annote ? "figure-corrige" : "graphe-caracteristiques",
    grille: cadre.grille,
  });
  const marqueurs = construireMarqueursSupplementaires(exercice, cadre) + (annote ? construireAnnotationsCorrige(exercice, cadre) : "");
  return svgBase.replace("</svg>", `${marqueurs}</svg>`);
}

const COULEUR_LECTURE = "#9a3b12";

/** Nombre écrit dans le SVG du corrigé : virgule décimale et vrai signe moins. */
function nombreSvg(valeur: number): string {
  return formatNombre(valeur).replace(".", ",").replace("-", "−");
}

function texteLecture(x: number, y: number, contenu: string, ancre: "start" | "middle" | "end" = "middle"): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="9" font-weight="bold" fill="${COULEUR_LECTURE}" text-anchor="${ancre}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke" font-family="Archivo, Arial, Helvetica, sans-serif">${contenu}</text>`;
}

/**
 * Corrigé détaillé : les lectures attendues repérées SUR le graphique de l'énoncé — zéros (losanges
 * sur l'axe des abscisses), ordonnée à l'origine, valeur en x = v (si elle existe) et équations des
 * deux asymptotes. Mêmes valeurs que les conclusions du corrigé (`exercice.zeros`,
 * `evaluerCourbeCaracteristiques`).
 */
function construireAnnotationsCorrige(exercice: ExerciceCaracteristiquesFonction, cadre: CadreCaracteristiques): string {
  const { largeur: LARGEUR_SVG, hauteur: HAUTEUR_SVG } = cadre;
  const { viewBox } = cadre;
  const { sx, sy } = construireTransformSvg(viewBox, LARGEUR_SVG, HAUTEUR_SVG);
  const m: string[] = [];
  const dansX = (x: number) => x >= viewBox.xMin && x <= viewBox.xMax;
  const dansY = (y: number) => y >= viewBox.yMin && y <= viewBox.yMax;
  const yAxe = Math.min(Math.max(sy(0), MARGE_SVG + 10), HAUTEUR_SVG - MARGE_SVG - 4);

  for (const z of exercice.zeros) {
    if (!dansX(z)) continue;
    const X = sx(z);
    m.push(`<path d="M ${X.toFixed(1)},${(yAxe - 4.5).toFixed(1)} l 4.5,4.5 l -4.5,4.5 l -4.5,-4.5 z" fill="${COULEUR_LECTURE}"/>`);
    m.push(texteLecture(X, yAxe + 15, nombreSvg(z)));
  }

  if (existeOrdonneeCaracteristiques(exercice)) {
    const y0 = evaluerCourbeCaracteristiques(exercice, 0);
    if (dansY(y0)) {
      m.push(`<circle cx="${sx(0).toFixed(1)}" cy="${sy(y0).toFixed(1)}" r="4.5" fill="none" stroke="${COULEUR_LECTURE}" stroke-width="1.6"/>`);
      m.push(texteLecture(sx(0) + 7, sy(y0) - 6, `f(0) = ${nombreSvg(y0)}`, "start"));
    }
  }

  if (existeValeurEnVCaracteristiques(exercice)) {
    const yv = evaluerCourbeCaracteristiques(exercice, exercice.v);
    if (dansX(exercice.v) && dansY(yv)) {
      const X = sx(exercice.v);
      const Y = sy(yv);
      m.push(`<rect x="${(X - 5).toFixed(1)}" y="${(Y - 5).toFixed(1)}" width="10" height="10" fill="none" stroke="${COULEUR_LECTURE}" stroke-width="1.4"/>`);
      const aGauche = X > LARGEUR_SVG - 80;
      m.push(texteLecture(aGauche ? X - 8 : X + 8, Y + 14, `f(${nombreSvg(exercice.v)}) = ${nombreSvg(yv)}`, aGauche ? "end" : "start"));
    }
  }

  if (dansX(exercice.AV)) {
    const X = sx(exercice.AV);
    const aGauche = X > LARGEUR_SVG - 60;
    m.push(texteLecture(aGauche ? X - 4 : X + 4, MARGE_SVG + 10, `x = ${nombreSvg(exercice.AV)}`, aGauche ? "end" : "start"));
  }
  if (dansY(exercice.L)) {
    m.push(texteLecture(LARGEUR_SVG - MARGE_SVG - 4, sy(exercice.L) - 4, `y = ${nombreSvg(exercice.L)}`, "end"));
  }
  return m.join("");
}

