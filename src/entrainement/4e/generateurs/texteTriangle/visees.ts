import type { CalculTriangle, ConversionAngle, ElementTriangle, ExerciceTexteTriangleStandard, Precision } from "../../core/texteTriangle.types";
import { rad, valeurCalcul } from "../../moteur/modeleTexteTriangle";
import { choisir, conversion, entier, fr, melanger, optionsReponse, type Phrase } from "./outils";

/**
 * Situations « visées » de gen77 : un sommet vu sous deux angles d'élévation depuis deux points
 * alignés avec son pied (UN triangle quelconque ABS : la distance oblique, jamais la hauteur, qui
 * demanderait un second triangle), deux points vus sous deux angles de dépression depuis un point
 * haut (angles alternes-internes), distance inaccessible depuis une base mesurée (angles avec la
 * base, ou relèvements). Toujours la loi des sinus (un côté, deux angles).
 */

const M_DIXIEME: Precision = { decimales: 1, texte: "au dixième de mètre près" };
const M_UNITE: Precision = { decimales: 0, texte: "au mètre près" };

function cot(a: number): number {
  return 1 / Math.tan(rad(a));
}

/** Loi des sinus : côté connu (et son angle opposé), angle opposé au côté cherché. */
function sinus(coteLatex: string, cote: number, opposeConnuLatex: string, opposeConnu: number, opposeChercheLatex: string, opposeCherche: number): Extract<CalculTriangle, { loi: "sinus" }> {
  return {
    loi: "sinus",
    coteConnu: { latex: coteLatex, valeur: cote },
    angleOpposeConnu: { latex: opposeConnuLatex, valeur: opposeConnu },
    angleOpposeCherche: { latex: opposeChercheLatex, valeur: opposeCherche },
  };
}

// ---------------------------------------------------------------------------------------------
// Élévation et dépression : deux points alignés avec le pied F, B le plus proche
// ---------------------------------------------------------------------------------------------

interface ContexteVisee {
  /** Nom du point haut (sommet visé ou observateur). */
  haut: string;
  min: number;
  max: number;
  pas: number;
  angleA: [number, number];
  ecartAngles: [number, number];
  betaMax: number;
  hauteur: [number, number];
  precision: Precision;
  /** Côté cherché : depuis B (le plus proche) ou depuis A. */
  cherche: "B" | "A";
  texte: (alpha: number, beta: number, d: string) => string;
  question: (p: Precision) => string;
  phrase: Phrase;
}

const CONTEXTES_ELEVATION: ContexteVisee[] = [
  {
    haut: "S",
    min: 20,
    max: 80,
    pas: 1,
    angleA: [18, 36],
    ecartAngles: [12, 36],
    betaMax: 68,
    hauteur: [15, 120],
    precision: M_DIXIEME,
    cherche: "B",
    texte: (a, b, d) =>
      `Pour installer une tyrolienne, on veut tendre un câble entre le sommet S d'un rocher et le point d'arrivée B, au sol. ` +
      `Depuis un point A, on voit le sommet S sous un angle d'élévation de ${a}°. On avance de ${d} m en direction du rocher, jusqu'au point B : l'angle d'élévation vaut alors ${b}°. ` +
      `(Les points A et B et le pied F du rocher sont alignés, sur un sol horizontal.)`,
    question: (p) => `Quelle longueur de câble faut-il ? Donne la longueur BS ${p.texte}.`,
    phrase: { avant: "Le câble [BS] mesure environ ", apres: "." },
  },
  {
    haut: "N",
    min: 30,
    max: 90,
    pas: 1,
    angleA: [20, 34],
    ecartAngles: [12, 32],
    betaMax: 64,
    hauteur: [60, 140],
    precision: M_DIXIEME,
    cherche: "A",
    texte: (a, b, d) =>
      `Une technicienne veut connaître la distance entre son appareil de mesure, placé en A, et la nacelle N d'une éolienne. ` +
      `Depuis A, elle voit la nacelle sous un angle d'élévation de ${a}°. Elle avance de ${d} m en direction de l'éolienne, jusqu'au point B : l'angle d'élévation vaut alors ${b}°. ` +
      `(Les points A et B et le pied F de l'éolienne sont alignés, sur un sol horizontal.)`,
    question: (p) => `Calcule la distance AN entre le point A et la nacelle, ${p.texte}.`,
    phrase: { avant: "La nacelle est à environ ", apres: " du point A." },
  },
  {
    haut: "S",
    min: 300,
    max: 900,
    pas: 10,
    angleA: [10, 24],
    ecartAngles: [8, 22],
    betaMax: 45,
    hauteur: [100, 900],
    precision: M_UNITE,
    cherche: "B",
    texte: (a, b, d) =>
      `Depuis le point A d'une route rectiligne et horizontale, une randonneuse voit le sommet S d'une colline sous un angle d'élévation de ${a}°. ` +
      `Après avoir parcouru ${d} m sur cette route en direction de la colline, jusqu'au point B, elle voit le sommet sous un angle d'élévation de ${b}°. ` +
      `(La route passe par le pied F de la colline, à la verticale du sommet.)`,
    question: (p) => `À quelle distance, en ligne droite, le point B se trouve-t-il du sommet ? Donne la distance BS ${p.texte}.`,
    phrase: { avant: "Le sommet est à environ ", apres: " du point B, en ligne droite." },
  },
];

const CONTEXTES_DEPRESSION: ContexteVisee[] = [
  {
    haut: "D",
    min: 80,
    max: 400,
    pas: 5,
    angleA: [6, 18],
    ecartAngles: [6, 26],
    betaMax: 50,
    hauteur: [25, 120],
    precision: M_UNITE,
    cherche: "B",
    texte: (a, b, d) =>
      `Du sommet D d'une falaise, une garde-côte observe deux bateaux A et B, alignés avec le pied F de la falaise ; B est le plus proche. ` +
      `Elle voit le bateau A sous un angle de dépression de ${a}° et le bateau B sous un angle de dépression de ${b}°. Les deux bateaux sont distants de ${d} m. ` +
      `(Un angle de dépression se mesure entre l'horizontale et la visée, vers le bas.)`,
    question: (p) => `À quelle distance de la garde-côte se trouve le bateau B ? Donne la distance DB ${p.texte}.`,
    phrase: { avant: "Le bateau B est à environ ", apres: " de la garde-côte." },
  },
  {
    haut: "D",
    min: 200,
    max: 900,
    pas: 10,
    angleA: [12, 28],
    ecartAngles: [10, 30],
    betaMax: 62,
    hauteur: [150, 800],
    precision: M_UNITE,
    cherche: "A",
    texte: (a, b, d) =>
      `Depuis une montgolfière immobile D, un passager voit deux bornes A et B d'une route rectiligne et horizontale, alignées avec le point F du sol situé à la verticale de la montgolfière ; B est la plus proche. ` +
      `Il voit la borne A sous un angle de dépression de ${a}° et la borne B sous un angle de dépression de ${b}°. Les deux bornes sont distantes de ${d} m. ` +
      `(Un angle de dépression se mesure entre l'horizontale et la visée, vers le bas.)`,
    question: (p) => `À quelle distance de la montgolfière se trouve la borne A ? Donne la distance DA ${p.texte}.`,
    phrase: { avant: "La borne A est à environ ", apres: " de la montgolfière." },
  },
];

function tirerVisee(ctx: ContexteVisee): { alpha: number; beta: number; d: number; h: number } {
  for (;;) {
    const alpha = entier(ctx.angleA[0], ctx.angleA[1]);
    const beta = alpha + entier(ctx.ecartAngles[0], ctx.ecartAngles[1]);
    if (beta > ctx.betaMax) continue;
    const d = entier(Math.ceil(ctx.min / ctx.pas), Math.floor(ctx.max / ctx.pas)) * ctx.pas;
    const h = d / (cot(alpha) - cot(beta));
    if (h < ctx.hauteur[0] || h > ctx.hauteur[1]) continue;
    return { alpha, beta, d, h };
  }
}

function construireVisee(variante: "elevation" | "depression", ctx: ContexteVisee): ExerciceTexteTriangleStandard {
  const { alpha, beta, d, h } = tirerVisee(ctx);
  const X = ctx.haut;
  const angA = `\\widehat{BA${X}}`;
  const angB = `\\widehat{AB${X}}`;
  const angX = `\\widehat{A${X}B}`;
  const angleB = 180 - beta;
  const angleX = beta - alpha;
  // Même écriture que la question (« BS », « AN » ; « DB », « DA » depuis l'observateur).
  const cherche = variante === "depression" ? `${X}${ctx.cherche}` : `${ctx.cherche}${X}`;
  const calcul = ctx.cherche === "B" ? sinus("AB", d, angX, angleX, angA, alpha) : sinus("AB", d, angX, angleX, angB, angleB);
  const valeur = valeurCalcul(calcul);
  // Piège : β pris tel quel comme angle en B → angle en haut 180° − α − β.
  const faux = { ...calcul, angleOpposeConnu: { ...calcul.angleOpposeConnu, valeur: 180 - alpha - beta } };
  const piege = valeurCalcul(faux);
  const xF = d + h * cot(beta);
  const conversionB = conversion(
    angB,
    angleB,
    "supplementaire",
    `180^\\circ - ${beta}^\\circ`,
    variante === "elevation"
      ? `En B, l'angle d'élévation (${beta}°) est mesuré entre le sol, du côté du pied F, et la visée. L'angle intérieur en B, du côté de A, est son supplémentaire :`
      : `En B, l'angle de dépression (${beta}°) se retrouve entre le sol, du côté de F, et la visée (angles alternes-internes). L'angle intérieur en B, du côté de A, est son supplémentaire :`,
  );
  const conversionX = conversion(angX, angleX, "differenceVisees", `${beta}^\\circ - ${alpha}^\\circ`, `Somme des angles du triangle AB${X} : l'angle en ${X} vaut 180° − ${alpha}° − (180° − ${beta}°), c'est-à-dire la différence des deux angles :`);
  const conversions: ConversionAngle[] =
    variante === "elevation"
      ? [conversionB, conversionX]
      : [
          conversion(
            angA,
            alpha,
            "alternes",
            `\\widehat{H${X}A}`,
            `L'horizontale passant par ${X} est parallèle au sol : l'angle de dépression vers A, entre l'horizontale (point H) et la visée, et l'angle intérieur en A sont alternes-internes, donc égaux :`,
          ),
          conversionB,
          conversionX,
        ];
  const elements: ElementTriangle[] = [
    { latex: "AB", role: "donne" },
    { latex: angA, role: variante === "elevation" ? "donne" : "convertir" },
    { latex: angB, role: "convertir" },
    { latex: angX, role: "convertir" },
    { latex: cherche, role: "cherche" },
  ];
  const points = [
    { nom: "A", x: 0, y: 0 },
    { nom: "B", x: d, y: 0 },
    { nom: "F", x: xF, y: 0 },
    { nom: X, x: xF, y: h },
    ...(variante === "depression" ? [{ nom: "H", x: 0, y: h }] : []),
  ];
  return {
    variante,
    sousType: "direct",
    contexte: ctx.texte(alpha, beta, fr(d)),
    question: ctx.question(ctx.precision),
    triangle: `AB${X}`,
    points,
    avecNord: false,
    unite: "m",
    precision: ctx.precision,
    elements: melanger(elements),
    conversions,
    calcul,
    inconnue: { latex: cherche, valeur },
    piege: {
      valeur: piege,
      description:
        `Prendre l'angle ${variante === "elevation" ? "d'élévation" : "de dépression"} ${beta}° comme angle intérieur en B : l'angle en ${X} deviendrait 180° − ${alpha}° − ${beta}° = ${180 - alpha - beta}° au lieu de ${beta}° − ${alpha}° = ${angleX}°. ` +
        `En B, l'angle du triangle est le supplémentaire, 180° − ${beta}° = ${angleB}°.`,
    },
    angles: { alpha, beta },
    longueurs: [["A", "B", d]],
    segmentCherche: ctx.cherche === "B" ? ["B", X] : ["A", X],
    options: optionsReponse(valeur, [piege, (d * Math.sin(rad(alpha))) / Math.sin(rad(beta))], "m", "km", ctx.precision, ctx.phrase),
  };
}

export function construireElevation(): ExerciceTexteTriangleStandard {
  return construireVisee("elevation", choisir(CONTEXTES_ELEVATION));
}

export function construireDepression(): ExerciceTexteTriangleStandard {
  return construireVisee("depression", choisir(CONTEXTES_DEPRESSION));
}

// ---------------------------------------------------------------------------------------------
// Distance inaccessible : base [AB] mesurée, point C inaccessible
// ---------------------------------------------------------------------------------------------

interface ContexteBase {
  min: number;
  max: number;
  pas: number;
  precision: Precision;
  /** Nom de l'objet visé en C (« l'arbre »), pour la question et la phrase. */
  objet: string;
  texte: (d: string, a: number, b: number) => string;
}

const CONTEXTES_SOMME: ContexteBase[] = [
  {
    min: 30,
    max: 120,
    pas: 1,
    precision: M_DIXIEME,
    objet: "l'arbre",
    texte: (d, a, b) =>
      `Pour estimer la largeur d'une rivière, un géomètre plante deux jalons A et B sur une rive, à ${d} m l'un de l'autre. Sur l'autre rive pousse un arbre C. ` +
      `Il mesure l'angle entre la base [AB] et la visée vers l'arbre : ${a}° depuis A et ${b}° depuis B.`,
  },
  {
    min: 40,
    max: 200,
    pas: 2,
    precision: M_DIXIEME,
    objet: "la statue",
    texte: (d, a, b) =>
      `Une statue C se dresse sur une île, au milieu d'un étang. Depuis la berge, on mesure une base [AB] de ${d} m, puis les angles entre cette base et les visées vers la statue : ${a}° en A et ${b}° en B.`,
  },
];

const CONTEXTES_RELEVE: ContexteBase[] = [
  {
    min: 300,
    max: 1500,
    pas: 10,
    precision: M_UNITE,
    objet: "le clocher",
    texte: (d, a, b) =>
      `Deux observateurs se tiennent sur une route rectiligne orientée est-ouest, au bord d'un lac : A, et B situé ${d} m plein est de A. Tous deux visent le clocher C d'un village, de l'autre côté du lac. ` +
      `Depuis A, le clocher est au cap ${a}° ; depuis B, il est au cap ${b}°. (Un cap se mesure depuis le nord, dans le sens des aiguilles d'une montre.)`,
  },
  {
    min: 200,
    max: 900,
    pas: 10,
    precision: M_UNITE,
    objet: "la bouée",
    texte: (d, a, b) =>
      `Sur une digue rectiligne orientée est-ouest, deux sauveteurs se placent en A et en B, B étant ${d} m plein est de A. Ils repèrent une bouée C en mer, au nord de la digue. ` +
      `Depuis A, la bouée est au cap ${a}° ; depuis B, elle est au cap ${b}°. (Un cap se mesure depuis le nord, dans le sens des aiguilles d'une montre.)`,
  },
];

export function construireDistanceInaccessible(releve: boolean = Math.random() < 0.5): ExerciceTexteTriangleStandard {
  const ctx = choisir(releve ? CONTEXTES_RELEVE : CONTEXTES_SOMME);
  let angA = 0;
  let angB = 0;
  let capA = 0;
  let capB = 0;
  for (;;) {
    if (releve) {
      capA = entier(15, 68);
      capB = entier(292, 345);
      angA = 90 - capA;
      angB = capB - 270;
    } else {
      angA = entier(35, 82);
      angB = entier(35, 82);
    }
    const angC = 180 - angA - angB;
    if (angC >= 28 && Math.abs(angA - angB) >= 4 && Math.abs(angC - 90) > 6) break;
  }
  const angC = 180 - angA - angB;
  const d = entier(Math.ceil(ctx.min / ctx.pas), Math.floor(ctx.max / ctx.pas)) * ctx.pas;
  const cherche: "AC" | "BC" = Math.random() < 0.5 ? "AC" : "BC";
  const LA = "\\widehat{BAC}";
  const LB = "\\widehat{ABC}";
  const LC = "\\widehat{ACB}";
  const calcul = cherche === "AC" ? sinus("AB", d, LC, angC, LB, angB) : sinus("AB", d, LC, angC, LA, angA);
  const valeur = valeurCalcul(calcul);
  let piege: number;
  let description: string;
  if (releve) {
    // Caps pris pour les angles du triangle : θA en A, 360° − θB en B.
    const fauxA = capA;
    const fauxB = 360 - capB;
    const fauxC = 180 - fauxA - fauxB;
    piege = (d * Math.sin(rad(cherche === "AC" ? fauxB : fauxA))) / Math.sin(rad(fauxC));
    description =
      `Un cap se mesure depuis le nord, pas depuis la base : en A, l'angle du triangle est 90° − ${capA}° = ${angA}° (la base [AB] est orientée plein est), ` +
      `et en B, ${capB}° − 270° = ${angB}° (de B, la base [BA] est orientée plein ouest, au cap 270°).`;
  } else {
    piege = (d * Math.sin(rad(cherche === "AC" ? angA : angB))) / Math.sin(rad(angC));
    description =
      cherche === "AC"
        ? "Dans la loi des sinus, chaque côté s'associe à l'angle qui lui fait face : [AC] est opposé à l'angle en B, pas à l'angle en A."
        : "Dans la loi des sinus, chaque côté s'associe à l'angle qui lui fait face : [BC] est opposé à l'angle en A, pas à l'angle en B.";
  }
  const ac = (d * Math.sin(rad(angB))) / Math.sin(rad(angC));
  const pC = { x: ac * Math.cos(rad(angA)), y: ac * Math.sin(rad(angA)) };
  const conversionC = conversion(
    LC,
    angC,
    "somme",
    releve ? `180^\\circ - ${LA} - ${LB}` : `180^\\circ - ${angA}^\\circ - ${angB}^\\circ`,
    "La somme des angles du triangle ABC vaut 180° :",
    releve ? `180^\\circ - ${angA}^\\circ - ${angB}^\\circ` : undefined,
  );
  const conversions: ConversionAngle[] = releve
    ? [
        conversion(LA, angA, "releveOuest", `90^\\circ - ${capA}^\\circ`, `De A, la base [AB] est orientée plein est (cap 90°) et la visée vers C au cap ${capA}° : l'angle entre elles est la différence des caps :`),
        conversion(LB, angB, "releveEst", `${capB}^\\circ - 270^\\circ`, `De B, la base [BA] est orientée plein ouest (cap 270°) et la visée vers C au cap ${capB}° : l'angle entre elles est la différence des caps :`),
        conversionC,
      ]
    : [conversionC];
  const objet = ctx.objet;
  const nomPoint = cherche === "AC" ? "A" : "B";
  return {
    variante: "distanceInaccessible",
    sousType: releve ? "releve" : "somme",
    contexte: releve ? ctx.texte(fr(d), capA, capB) : ctx.texte(fr(d), angA, angB),
    question: `Calcule la distance ${cherche} entre le point ${nomPoint} et ${objet}, ${ctx.precision.texte}.`,
    triangle: "ABC",
    points: [
      { nom: "A", x: 0, y: 0 },
      { nom: "B", x: d, y: 0 },
      { nom: "C", ...pC },
    ],
    avecNord: releve,
    unite: "m",
    precision: ctx.precision,
    elements: melanger([
      { latex: "AB", role: "donne" as const },
      { latex: LA, role: releve ? ("convertir" as const) : ("donne" as const) },
      { latex: LB, role: releve ? ("convertir" as const) : ("donne" as const) },
      { latex: LC, role: "convertir" as const },
      { latex: cherche, role: "cherche" as const },
    ]),
    conversions,
    calcul,
    inconnue: { latex: cherche, valeur },
    piege: { valeur: piege, description },
    angles: releve ? { capA, capB, A: angA, B: angB } : { A: angA, B: angB },
    longueurs: [["A", "B", d]],
    segmentCherche: cherche === "AC" ? ["A", "C"] : ["B", "C"],
    options: optionsReponse(
      valeur,
      [piege, (d * Math.sin(rad(angC))) / Math.sin(rad(cherche === "AC" ? angB : angA))],
      "m",
      "km",
      ctx.precision,
      { avant: `${objet.charAt(0).toUpperCase()}${objet.slice(1)} est à environ `, apres: ` du point ${nomPoint}.` },
    ),
  };
}
