import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceLectureCercle, Grandeur, PositionCercle } from "../core/lectureCercle.types";
import {
  GRADUATIONS_AXES,
  GRADUATIONS_TANGENTE,
  LATEX_GRANDEUR,
  VALEUR_GRANDEUR,
  angleLatex,
  angleReference,
  candidatsCosinus,
  coordonneesM,
  cosExact,
  position,
  sinExact,
  tanExact,
  valeurLatex,
  valeurNumerique,
} from "../moteur/modeleLectureCercle";
import type { PiegeAngle, PiegeCoordonnees, PiegeTangente } from "../moteur/verificationLectureCercle";
import { souderPonctuation } from "./formatDetectiveVecteurs";

/**
 * Textes et figure de gen122 « Lire sur le cercle trigonométrique » — écran ET papier : une seule
 * source (consignes, aides, messages ciblés, réponses attendues, figure SVG).
 *
 * Figure : cercle de rayon 1 dans le carré [−1 ; 1]², quadrillé par les lignes x = 0, ±1/2, ±√2/2,
 * ±√3/2, ±1 (et de même en y) : M(θ) tombe TOUJOURS à l'intersection de deux lignes, et la lecture
 * est honnête (√2/2 ≈ 0,71 et √3/2 ≈ 0,87 ne tombent sur aucune grille au dixième, d'où ce
 * quadrillage « remarquable »). Les graduations ne sont écrites que sur les demi-axes POSITIFS :
 * la valeur se lit sur la ligne symétrique, le signe au quadrant. La tangente x = 1 (écran 3 et
 * papier) porte des graduations en ±√3/3, ±1, ±√3, écrites du côté positif. La droite (OM) et le
 * point T n'apparaissent qu'avec l'aide 2 de l'écran 3, une fois l'écran clos, et au corrigé.
 */

type E = ExerciceLectureCercle;
type Fragments = FragmentConsigne[];
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const TITRES_ECRANS = ["Lire cos θ et sin θ", "Retrouver θ", "Lire tan θ"];

export const CONSIGNE_GENERALE =
  "Lis sur la figure les coordonnées de M(θ), déduis-en l'angle θ, puis lis tan θ sur la tangente au cercle en (1 ; 0).";

export function intervalleLatex(e: E): string {
  return e.variante === "degres" ? "[0^\\circ\\,;\\,360^\\circ\\mathclose{[}" : "[0\\,;\\,2\\pi\\mathclose{[}";
}

export function enonceFragments(e: E): Fragments {
  return souderPonctuation([
    t("Le point "),
    l("M"),
    t(" est l'image de l'angle "),
    l("\\theta"),
    t(" ("),
    l(`\\theta\\in ${intervalleLatex(e)}`),
    t(") sur le cercle trigonométrique. Les lignes du quadrillage passent par les valeurs remarquables ; elles sont graduées sur les demi-axes positifs."),
  ]);
}

export function consignesEcrans(e: E): Fragments[] {
  return [
    [t("Lis sur la figure les valeurs exactes de "), l("\\cos\\theta"), t(" et de "), l("\\sin\\theta"), t(".")],
    souderPonctuation([t(`Donne l'angle `), l("\\theta"), t(e.variante === "degres" ? " en degrés, dans " : " en radians, dans "), l(intervalleLatex(e)), t(".")]),
    souderPonctuation([t("La droite verticale "), l("x=1"), t(" est la tangente au cercle en "), l("(1\\,;\\,0)"), t(". Lis "), l("\\tan\\theta"), t(" sur cette tangente, ou indique que "), l("\\tan\\theta"), t(" n'est pas définie.")]),
  ];
}

/** Rappel des valeurs de l'écran 1 (affiché aux écrans 2 et 3, une fois l'écran 1 clos). */
export function rappelCoordonnees(e: E): Fragments {
  return souderPonctuation([t("Lu à l'écran 1 : "), l(`\\cos\\theta=${valeurLatex(cosExact(e))}`), t(" et "), l(`\\sin\\theta=${valeurLatex(sinExact(e))}`), t(".")]);
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues (écran, papier, corrigé)
// ---------------------------------------------------------------------------------------------

export function reponseCoordonnees(e: E): Fragments {
  return [l(`\\cos\\theta=${valeurLatex(cosExact(e))}`), t(" et "), l(`\\sin\\theta=${valeurLatex(sinExact(e))}`)];
}

export function reponseAngle(e: E): Fragments {
  return [l(`\\theta=${angleLatex(e)}`)];
}

export function reponseTangente(e: E): Fragments {
  const v = tanExact(e);
  return v === null ? [l("\\tan\\theta"), t(" n'est pas définie : "), l("(OM)"), t(" est parallèle à la tangente.")] : [l(`\\tan\\theta=${valeurLatex(v)}`)];
}

export function reponsesEcrans(e: E): Fragments[] {
  return [reponseCoordonnees(e), reponseAngle(e), reponseTangente(e)].map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Positions en mots
// ---------------------------------------------------------------------------------------------

export function libellePosition(p: PositionCercle): string {
  return p === "axe-horizontal" ? "sur l'axe horizontal" : p === "axe-vertical" ? "sur l'axe vertical" : `dans le quadrant ${p}`;
}

function cote(e: E): { horizontal: string; vertical: string } {
  const { x, y } = coordonneesM(e);
  return {
    horizontal: Math.abs(x) < 1e-9 ? "sur l'axe vertical" : x > 0 ? "à droite de l'axe vertical" : "à gauche de l'axe vertical",
    vertical: Math.abs(y) < 1e-9 ? "sur l'axe horizontal" : y > 0 ? "au-dessus de l'axe horizontal" : "en dessous de l'axe horizontal",
  };
}

function quadrantsCandidats(e: E): string {
  const p = position(e);
  return p === "I" || p === "IV" ? "un dans le quadrant I, un dans le quadrant IV" : "un dans le quadrant II, un dans le quadrant III";
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux : propriété du cours, puis application à l'instance — jamais la réponse)
// ---------------------------------------------------------------------------------------------

function formulesQuadrant(e: E): Fragments {
  const d = e.variante === "degres";
  const [a, b, c, z] = d ? ["180^\\circ-\\alpha", "180^\\circ+\\alpha", "360^\\circ-\\alpha", "0^\\circ,\\ 90^\\circ,\\ 180^\\circ"] : ["\\pi-\\alpha", "\\pi+\\alpha", "2\\pi-\\alpha", "0,\\ \\dfrac{\\pi}{2},\\ \\pi"];
  return [
    l("\\alpha"),
    t(" (I), "),
    l(a),
    t(" (II), "),
    l(b),
    t(" (III), "),
    l(c),
    t(" (IV) ; sur un axe, "),
    l("\\theta"),
    t(" vaut "),
    l(z),
    t(" ou "),
    l(d ? "270^\\circ" : "\\dfrac{3\\pi}{2}"),
    t("."),
  ];
}

export function aidesEcran(e: E, ecran: number): Fragments[] {
  const p = position(e);
  const c = cote(e);
  if (ecran === 0) {
    const n2: Fragments = p.startsWith("axe")
      ? [t(`M est ${libellePosition(p)} : une de ses coordonnées est nulle, l'autre vaut `), l("1"), t(" ou "), l("-1"), t(".")]
      : [
          t(`M est ${libellePosition(p)} : ${c.horizontal} (signe de `),
          l("\\cos\\theta"),
          t(`), ${c.vertical} (signe de `),
          l("\\sin\\theta"),
          t("). Les graduations ne sont écrites que sur les demi-axes positifs : lis celle de la ligne symétrique, puis mets le signe."),
        ];
    return [
      [t("Le point M(θ) a pour coordonnées "), l("(\\cos\\theta\\,;\\,\\sin\\theta)"), t(" : "), l("\\cos\\theta"), t(" est son abscisse (lue sur l'axe horizontal), "), l("\\sin\\theta"), t(" son ordonnée (lue sur l'axe vertical).")],
      n2,
    ].map(souderPonctuation);
  }
  if (ecran === 1) {
    const n1: Fragments = [
      t("Commence par l'angle du premier quadrant "),
      l("\\alpha"),
      t(" : l'angle aigu dont le cosinus vaut "),
      l("|\\cos\\theta|"),
      t(" (valeurs remarquables). Ensuite, le quadrant de M donne "),
      l("\\theta"),
      t(" : "),
      ...formulesQuadrant(e),
    ];
    const cos = cosExact(e);
    let n2: Fragments;
    if (p === "axe-vertical") {
      n2 = [t("Ici "), l("\\cos\\theta=0"), t(" : deux angles de "), l(intervalleLatex(e)), t(" conviennent, ceux des deux points du cercle sur l'axe vertical. Regarde si M est en haut ou en bas.")];
    } else if (p === "axe-horizontal") {
      n2 = [t("Ici "), l(`\\cos\\theta=${valeurLatex(cos)}`), t(" : un seul angle de "), l(intervalleLatex(e)), t(` a ce cosinus, celui du point du cercle le plus à ${cos.signe > 0 ? "droite" : "gauche"}.`)];
    } else if (p === "I") {
      // Quadrant I : θ = α, donner α reviendrait à donner la réponse.
      n2 = [
        t("Deux angles de "),
        l(intervalleLatex(e)),
        t(" ont pour cosinus "),
        l(valeurLatex(cos)),
        t(` : ${quadrantsCandidats(e)}. M est ${c.vertical} (signe de `),
        l("\\sin\\theta"),
        t(") : c'est celui du quadrant I, donc "),
        l("\\theta=\\alpha"),
        t(", l'angle aigu dont le cosinus vaut "),
        l(LATEX_GRANDEUR[cos.grandeur]),
        t("."),
      ];
    } else {
      n2 = [
        t("Ici "),
        l(`|\\cos\\theta|=${LATEX_GRANDEUR[cos.grandeur]}`),
        t(", donc "),
        l(`\\alpha=${angleLatex(e, angleReference(e))}`),
        t(". Deux angles de "),
        l(intervalleLatex(e)),
        t(" ont pour cosinus "),
        l(valeurLatex(cos)),
        t(` : ${quadrantsCandidats(e)}. M est ${c.vertical} (signe de `),
        l("\\sin\\theta"),
        t(") : garde celui du quadrant "),
        t(`${p}.`),
      ];
    }
    return [n1, n2].map(souderPonctuation);
  }
  const n1: Fragments = [
    l("\\tan\\theta"),
    t(" est l'ordonnée du point T où la droite "),
    l("(OM)"),
    t(" coupe la tangente "),
    l("x=1"),
    t(". Si "),
    l("(OM)"),
    t(" est parallèle à cette tangente, il n'y a pas de point T : "),
    l("\\tan\\theta"),
    t(" n'est pas définie."),
  ];
  const n2: Fragments = [t("La droite "), l("(OM)"), t(" est maintenant tracée en pointillés sur la figure. ")];
  if (tanExact(e) === null) n2.push(t("Suis-la et regarde si elle rencontre la droite "), l("x=1"), t("."));
  else {
    if (p === "II" || p === "III") n2.push(t("M est à gauche de l'axe vertical : suis "), l("(OM)"), t(" de l'autre côté de O. "));
    n2.push(t("Lis la graduation du point T sur la tangente, puis son signe (au-dessus ou en dessous de l'axe horizontal)."));
  }
  return [n1, n2].map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Messages (saisies non comptées, pièges ciblés)
// ---------------------------------------------------------------------------------------------

export const MESSAGE_ILLISIBLE_VALEUR = "Valeur non reconnue : écris un nombre exact (entier, fraction, racine). Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_ILLISIBLE_ANGLE = "Angle non reconnu : écris un nombre (en degrés) ou une expression avec π (en radians). Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_APPROCHEE = "C'est une valeur approchée : écris la valeur exacte de la graduation (fraction ou racine). Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_APPROCHEE_ANGLE = "C'est une valeur approchée : écris l'angle exact, avec π. Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_RECOPIE = "Écris seulement la valeur, sans sin, cos ni tan. Cette saisie ne compte pas comme une tentative.";

export function aideSaisie(ecran: number, e: E): string {
  if (ecran === 1) return e.variante === "degres" ? "Un nombre de degrés, sans π (par exemple 75)." : "Un angle avec π (par exemple 5π/12, ou 5pi/12).";
  return "Valeur exacte : entier, fraction (5/2), racine (√5/3 ou sqrt(5)/3) ; « − » devant un nombre négatif.";
}

export function messageCoordonnees(e: E, piege: PiegeCoordonnees | undefined, champ: 0 | 1 | undefined): Fragments | null {
  const c = cote(e);
  const nom = champ === 1 ? "\\sin\\theta" : "\\cos\\theta";
  switch (piege) {
    case "echange":
      return [t("Tu as échangé les deux : "), l("\\cos\\theta"), t(" est l'abscisse de M (axe horizontal), "), l("\\sin\\theta"), t(" son ordonnée (axe vertical).")];
    case "signe":
      return champ === 1
        ? [t("Revois le signe de "), l(nom), t(` : M est ${c.vertical}.`)]
        : [t("Revois le signe de "), l(nom), t(` : M est ${c.horizontal}.`)];
    case "graduation":
      return champ === 1
        ? [t("Revois la graduation de "), l(nom), t(" : suis la ligne horizontale qui passe par M jusqu'à l'axe vertical, puis lis la graduation de la ligne symétrique sur le demi-axe positif.")]
        : [t("Revois la graduation de "), l(nom), t(" : suis la ligne verticale qui passe par M jusqu'à l'axe horizontal, puis lis la graduation de la ligne symétrique sur le demi-axe positif.")];
    case "coordonnee-nulle":
      return [t("Une coordonnée de M n'est nulle que si M est sur un axe : regarde où est M, puis revois "), l(nom), t(".")];
    default:
      return null;
  }
}

export function messageAngle(e: E, piege: PiegeAngle | undefined): Fragments | null {
  const c = cote(e);
  switch (piege) {
    case "unite":
      return e.variante === "degres" ? [t("On demande "), l("\\theta"), t(" en degrés : écris un nombre de degrés, sans "), l("\\pi"), t(".")] : [t("On demande "), l("\\theta"), t(" en radians : écris-le avec "), l("\\pi"), t(" ("), l("180^\\circ=\\pi"), t(").")];
    case "hors-intervalle":
      return [t("Ton angle donne bien le point M, mais il n'est pas dans "), l(intervalleLatex(e)), t(" : ajoute ou retire un tour.")];
    case "reference":
      return [t("C'est l'angle du premier quadrant (l'angle aigu entre "), l("(OM)"), t(" et l'axe horizontal). M n'est pas dans le quadrant I : utilise la formule de son quadrant.")];
    case "candidat-cos":
      return [t("Cet angle a bien le même cosinus, mais son point est de l'autre côté de l'axe horizontal : M est "), t(`${c.vertical} (regarde le signe de `), l("\\sin\\theta"), t(").")];
    case "candidat-sin":
      return [t("Cet angle a le même sinus, mais son point est de l'autre côté de l'axe vertical : M est "), t(`${c.horizontal} (regarde le signe de `), l("\\cos\\theta"), t(").")];
    case "oppose":
      return [t("C'est l'angle du point diamétralement opposé à M : son cosinus et son sinus ont les signes contraires.")];
    default:
      return null;
  }
}

export function messageTangente(e: E, piege: PiegeTangente | undefined): Fragments | null {
  const p = position(e);
  switch (piege) {
    case "non-definie-a-tort":
      return [l("(OM)"), t(" n'est pas parallèle à la tangente "), l("x=1"), t(" : prolonge-la (au-delà de O si besoin), elle la coupe en un point T.")];
    case "definie-a-tort":
      return [t("La droite "), l("(OM)"), t(" coupe-t-elle vraiment la tangente "), l("x=1"), t(" ? Regarde sa direction.")];
    case "sinus":
      return [t("Tu as lu l'ordonnée de M : c'est "), l("\\sin\\theta"), t(". "), l("\\tan\\theta"), t(" est l'ordonnée du point T où "), l("(OM)"), t(" coupe la tangente "), l("x=1"), t(".")];
    case "signe":
      return p === "II" || p === "III"
        ? [t("M est à gauche de l'axe vertical : "), l("(OM)"), t(" coupe la tangente de l'autre côté de O, donc T n'est pas du même côté de l'axe horizontal que M.")]
        : [t("Revois le signe : M est à droite de l'axe vertical, donc T est du même côté de l'axe horizontal que M.")];
    case "inverse":
      return [t("Tu as pris l'inverse : "), l("\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}"), t(". Lis la graduation du point T sur la tangente.")];
    case "cosinus":
      return [t("C'est "), l("\\cos\\theta"), t(" (l'abscisse de M) : "), l("\\tan\\theta"), t(" se lit sur la tangente "), l("x=1"), t(".")];
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Figure SVG (écran et papier)
// ---------------------------------------------------------------------------------------------

const S = 100;
const COULEUR_GRILLE = "#c7d0dc";
const COULEUR_AXE = "#334155";
const COULEUR_CERCLE = "#111827";
const COULEUR_M = "#1d4ed8";
const COULEUR_TANGENTE = "#9a3412";
const COULEUR_OM = "#1d4ed8";
const POLICE = 'font-family="Helvetica, Arial, sans-serif"';

export interface OptionsFigure {
  /** Tangente x = 1 graduée (écran 3, papier, corrigé). */
  tangente: boolean;
  /** Droite (OM) en pointillés et point T (aide 2 de l'écran 3, écran clos, corrigé). */
  droiteOM: boolean;
}

interface Cadre {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function f2(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

/** Étiquette d'une graduation : fraction empilée (numérateur avec radical) ou entier. */
function etiquette(g: Grandeur, cx: number, cy: number): string {
  const halo = `stroke="#ffffff" stroke-width="3" paint-order="stroke" stroke-linejoin="round"`;
  if (g === "1") return `<text x="${f2(cx)}" y="${f2(cy + 4)}" font-size="11" text-anchor="middle" ${POLICE} ${halo} fill="${COULEUR_AXE}">1</text>`;
  const radical = (chiffre: string, x: number, y: number) =>
    `<text x="${f2(x)}" y="${f2(y)}" font-size="10" text-anchor="middle" ${POLICE} ${halo} fill="${COULEUR_AXE}">√${chiffre}</text><line x1="${f2(x - 0.4)}" y1="${f2(y - 8)}" x2="${f2(x + 6)}" y2="${f2(y - 8)}" stroke="${COULEUR_AXE}" stroke-width="0.8"/>`;
  if (g === "r3") return `<rect x="${f2(cx - 8)}" y="${f2(cy - 8)}" width="16" height="13" fill="#ffffff"/>${radical("3", cx, cy + 4)}`;
  const [num, den] = g === "1/2" ? ["1", "2"] : g === "r2/2" ? ["r2", "2"] : g === "r3/2" ? ["r3", "2"] : ["r3", "3"];
  const haut = num === "1" ? `<text x="${f2(cx)}" y="${f2(cy - 2.5)}" font-size="10" text-anchor="middle" ${POLICE} fill="${COULEUR_AXE}">1</text>` : radical(num!.slice(1), cx, cy - 2.5);
  return (
    `<rect x="${f2(cx - 8)}" y="${f2(cy - 12)}" width="16" height="24" fill="#ffffff"/>` +
    haut +
    `<line x1="${f2(cx - 6)}" y1="${f2(cy)}" x2="${f2(cx + 6)}" y2="${f2(cy)}" stroke="${COULEUR_AXE}" stroke-width="0.9"/>` +
    `<text x="${f2(cx)}" y="${f2(cy + 10)}" font-size="10" text-anchor="middle" ${POLICE} fill="${COULEUR_AXE}">${den}</text>`
  );
}

/** Segment de la droite passant par O et (cx, cy), coupé au cadre. */
function droiteParO(cx: number, cy: number, cadre: Cadre): [number, number, number, number] {
  if (Math.abs(cx) < 1e-9) return [0, cadre.yMin, 0, cadre.yMax];
  const m = cy / cx;
  const pts: [number, number][] = [];
  for (const x of [cadre.xMin, cadre.xMax]) {
    const y = m * x;
    if (y >= cadre.yMin - 1e-9 && y <= cadre.yMax + 1e-9) pts.push([x, y]);
  }
  if (Math.abs(m) > 1e-9)
    for (const y of [cadre.yMin, cadre.yMax]) {
      const x = y / m;
      if (x > cadre.xMin + 1e-9 && x < cadre.xMax - 1e-9) pts.push([x, y]);
    }
  pts.sort((a, b) => a[0] - b[0]);
  const a = pts[0]!;
  const b = pts[pts.length - 1]!;
  return [a[0], a[1], b[0], b[1]];
}

export function figureSvg(e: E, options: OptionsFigure): string {
  const cadre: Cadre = options.tangente ? { xMin: -1.34, xMax: 1.62, yMin: -1.98, yMax: 1.98 } : { xMin: -1.34, xMax: 1.24, yMin: -1.24, yMax: 1.24 };
  const W = (cadre.xMax - cadre.xMin) * S;
  const H = (cadre.yMax - cadre.yMin) * S;
  const X = (x: number) => (x - cadre.xMin) * S;
  const Y = (y: number) => (cadre.yMax - y) * S;
  const parts: string[] = [];
  parts.push(`<rect x="0" y="0" width="${f2(W)}" height="${f2(H)}" fill="#ffffff"/>`);
  // Quadrillage remarquable dans le carré [−1 ; 1]²
  const lignes = [0, ...GRADUATIONS_AXES.map((g) => VALEUR_GRANDEUR[g])].flatMap((v) => (v === 0 ? [0] : [v, -v]));
  for (const v of lignes) {
    if (v === 0) continue;
    parts.push(`<line x1="${f2(X(v))}" y1="${f2(Y(-1))}" x2="${f2(X(v))}" y2="${f2(Y(1))}" stroke="${COULEUR_GRILLE}" stroke-width="0.8"/>`);
    parts.push(`<line x1="${f2(X(-1))}" y1="${f2(Y(v))}" x2="${f2(X(1))}" y2="${f2(Y(v))}" stroke="${COULEUR_GRILLE}" stroke-width="0.8"/>`);
  }
  // Axes (flèches)
  const ax = options.tangente ? 1.55 : 1.18;
  const ay = options.tangente ? 1.2 : 1.18;
  parts.push(`<line x1="${f2(X(-1.22))}" y1="${f2(Y(0))}" x2="${f2(X(ax))}" y2="${f2(Y(0))}" stroke="${COULEUR_AXE}" stroke-width="1.2"/>`);
  parts.push(`<path d="M ${f2(X(ax))} ${f2(Y(0))} l -7 -3.5 l 0 7 z" fill="${COULEUR_AXE}"/>`);
  parts.push(`<line x1="${f2(X(0))}" y1="${f2(Y(-ay))}" x2="${f2(X(0))}" y2="${f2(Y(ay))}" stroke="${COULEUR_AXE}" stroke-width="1.2"/>`);
  parts.push(`<path d="M ${f2(X(0))} ${f2(Y(ay))} l -3.5 7 l 7 0 z" fill="${COULEUR_AXE}"/>`);
  // Cercle
  parts.push(`<circle cx="${f2(X(0))}" cy="${f2(Y(0))}" r="${S}" fill="none" stroke="${COULEUR_CERCLE}" stroke-width="1.6"/>`);
  // Tangente x = 1 et ses graduations
  if (options.tangente) {
    parts.push(`<line x1="${f2(X(1))}" y1="${f2(Y(cadre.yMin + 0.04))}" x2="${f2(X(1))}" y2="${f2(Y(cadre.yMax - 0.04))}" stroke="${COULEUR_TANGENTE}" stroke-width="1.5"/>`);
    parts.push(`<text x="${f2(X(1) - 5)}" y="${f2(Y(cadre.yMax - 0.04) + 11)}" font-size="10" text-anchor="end" font-style="italic" ${POLICE} fill="${COULEUR_TANGENTE}">x = 1</text>`);
    for (const g of GRADUATIONS_TANGENTE) {
      for (const s of [1, -1]) {
        const y = s * VALEUR_GRANDEUR[g];
        parts.push(`<line x1="${f2(X(1) - 5)}" y1="${f2(Y(y))}" x2="${f2(X(1) + 5)}" y2="${f2(Y(y))}" stroke="${COULEUR_TANGENTE}" stroke-width="1.5"/>`);
      }
      parts.push(etiquette(g, X(1) + 17, Y(VALEUR_GRANDEUR[g])));
    }
  }
  const { x: mx, y: my } = coordonneesM(e);
  // Droite (OM) et point T
  if (options.droiteOM) {
    const [x1, y1, x2, y2] = droiteParO(mx, my, cadre);
    parts.push(`<line x1="${f2(X(x1))}" y1="${f2(Y(y1))}" x2="${f2(X(x2))}" y2="${f2(Y(y2))}" stroke="${COULEUR_OM}" stroke-width="1.3" stroke-dasharray="6 4"/>`);
  }
  // Rayon [OM] et point M
  parts.push(`<line x1="${f2(X(0))}" y1="${f2(Y(0))}" x2="${f2(X(mx))}" y2="${f2(Y(my))}" stroke="${COULEUR_M}" stroke-width="1.6"/>`);
  // Arc de l'angle θ (sens trigonométrique)
  if (e.angle > 0) {
    const r = 0.2;
    const a = (e.angle * Math.PI) / 180;
    const grand = e.angle > 180 ? 1 : 0;
    const fx = r * Math.cos(a);
    const fy = r * Math.sin(a);
    parts.push(`<path d="M ${f2(X(r))} ${f2(Y(0))} A ${r * S} ${r * S} 0 ${grand} 0 ${f2(X(fx))} ${f2(Y(fy))}" fill="none" stroke="${COULEUR_M}" stroke-width="1.2"/>`);
    // Pointe de flèche tangente à l'arc, au bout
    const tx = -Math.sin(a);
    const ty = Math.cos(a);
    const px = X(fx);
    const py = Y(fy);
    const ux = tx;
    const uy = -ty;
    const nx = -uy;
    const ny = ux;
    parts.push(`<path d="M ${f2(px)} ${f2(py)} L ${f2(px - 6 * ux + 3 * nx)} ${f2(py - 6 * uy + 3 * ny)} L ${f2(px - 6 * ux - 3 * nx)} ${f2(py - 6 * uy - 3 * ny)} z" fill="${COULEUR_M}"/>`);
    const am = a / 2;
    parts.push(`<text x="${f2(X(0.32 * Math.cos(am)))}" y="${f2(Y(0.32 * Math.sin(am)) + 4)}" font-size="12" text-anchor="middle" font-style="italic" ${POLICE} stroke="#ffffff" stroke-width="3" paint-order="stroke" fill="${COULEUR_M}">θ</text>`);
  }
  // Graduations des axes (demi-axes positifs) : x sous l'axe, y à gauche en deux colonnes
  for (const g of GRADUATIONS_AXES) {
    const v = VALEUR_GRANDEUR[g];
    parts.push(`<line x1="${f2(X(v))}" y1="${f2(Y(0) - 3)}" x2="${f2(X(v))}" y2="${f2(Y(0) + 3)}" stroke="${COULEUR_AXE}" stroke-width="1.1"/>`);
    parts.push(`<line x1="${f2(X(0) - 3)}" y1="${f2(Y(v))}" x2="${f2(X(0) + 3)}" y2="${f2(Y(v))}" stroke="${COULEUR_AXE}" stroke-width="1.1"/>`);
    parts.push(g === "1" ? etiquette(g, X(v) + 8, Y(0) + 11) : etiquette(g, X(v), Y(0) + 17));
    const colonne = g === "r2/2" || g === "1" ? 30 : 12;
    parts.push(etiquette(g, X(0) - colonne, Y(v)));
  }
  parts.push(`<text x="${f2(X(0) - 5)}" y="${f2(Y(0) + 12)}" font-size="11" text-anchor="end" ${POLICE} stroke="#ffffff" stroke-width="3" paint-order="stroke" fill="${COULEUR_AXE}">O</text>`);
  if (options.droiteOM && options.tangente) {
    const tan = tanExact(e);
    if (tan !== null) {
      const ty = valeurNumerique(tan);
      parts.push(`<circle cx="${f2(X(1))}" cy="${f2(Y(ty))}" r="4" fill="${COULEUR_TANGENTE}"/>`);
      parts.push(`<text x="${f2(X(1) - 8)}" y="${f2(Y(ty) + (ty >= 0 ? -6 : 14))}" font-size="12" text-anchor="end" font-weight="bold" ${POLICE} stroke="#ffffff" stroke-width="3" paint-order="stroke" fill="${COULEUR_TANGENTE}">T</text>`);
    }
  }
  parts.push(`<circle cx="${f2(X(mx))}" cy="${f2(Y(my))}" r="4.5" fill="${COULEUR_M}"/>`);
  // Étiquette décalée de 16° (jamais sur la tangente ni sur la graduation « 1 » de l'axe vertical)
  const aM = ((e.angle + (e.angle >= 60 && e.angle <= 90 ? -16 : 16)) * Math.PI) / 180;
  const lx = X(1.15 * Math.cos(aM));
  const lyy = Y(1.15 * Math.sin(aM)) + 4;
  parts.push(`<text x="${f2(lx)}" y="${f2(lyy)}" font-size="13" text-anchor="middle" font-weight="bold" ${POLICE} stroke="#ffffff" stroke-width="3" paint-order="stroke" fill="${COULEUR_M}">M</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(W)}" height="${Math.round(H)}" viewBox="0 0 ${f2(W)} ${f2(H)}" role="img" aria-label="Cercle trigonométrique et point M">${parts.join("")}</svg>`;
}

/** Figure papier de l'énoncé : cercle, quadrillage, tangente graduée, M — ni (OM) ni T. */
export function figureEnonceSvg(e: E): string {
  return figureSvg(e, { tangente: true, droiteOM: false });
}

/** Utilisé par le corrigé pour nommer la position de M. */
export function candidatsLatex(e: E): string[] {
  return candidatsCosinus(e).map((d) => angleLatex(e, d));
}
