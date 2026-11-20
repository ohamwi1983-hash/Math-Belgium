import type { ExerciceTexteTriangleStandard, Precision } from "../../core/texteTriangle.types";
import { carreCosinus, valeurCalcul } from "../../moteur/modeleTexteTriangle";
import { capAuHasard, capLisible, choisir, conversion, direction, ecartCaps, ecartLatex, entier, fr, melanger, normaliserCap, optionsReponse, type Phrase } from "./outils";

/**
 * Situations « caps » de gen77 : deux trajets successifs (angle au virage = 180° − écart des caps),
 * deux mobiles partis du même point (angle au départ = écart des caps), parcelle relevée au
 * théodolite depuis un coin (écart des caps, puis côté ou aire). Sous-type « nord » : l'écart se
 * calcule en passant par le nord (360° − différence), piège classique.
 */

const RAPPEL_CAP = "(Un cap se mesure depuis le nord, dans le sens des aiguilles d'une montre.)";

/** Deux caps dont l'écart est confortable, avec ou sans passage par le nord. `angleInterieur` donne
 * l'angle du triangle qui en résultera (virage : 180° − écart), filtré lui aussi. */
function deuxCaps(nord: boolean, angleInterieur: (ecart: number) => number): { cap1: number; cap2: number; ecart: number } {
  for (;;) {
    const cap1 = capAuHasard();
    const ecart = entier(32, 148);
    const cap2 = normaliserCap(cap1 + (Math.random() < 0.5 ? ecart : -ecart));
    if (!capLisible(cap2)) continue;
    const e = ecartCaps(cap1, cap2);
    if (e.nord !== nord) continue;
    const interieur = angleInterieur(e.ecart);
    if (interieur < 32 || interieur > 148 || Math.abs(interieur - 90) <= 6) continue;
    return { cap1, cap2, ecart: e.ecart };
  }
}

function longueur(min: number, max: number, pas: number): number {
  return entier(Math.ceil(min / pas), Math.floor(max / pas)) * pas;
}

interface ContexteLongueurs {
  unite: string;
  uniteFautive: string;
  min: number;
  max: number;
  pas: number;
  precision: Precision;
}

const KM_DIXIEME: Precision = { decimales: 1, texte: "au dixième de kilomètre près" };
const KM_UNITE: Precision = { decimales: 0, texte: "au kilomètre près" };
const KM_CENTIEME: Precision = { decimales: 2, texte: "au centième de kilomètre près" };
const M_UNITE: Precision = { decimales: 0, texte: "au mètre près" };
const M2_UNITE: Precision = { decimales: 0, texte: "au mètre carré près" };

function piegeNord(cap1: number, cap2: number, sommet: string): string {
  const { max, min, ecart } = ecartCaps(cap1, cap2);
  return `Les deux caps sont de part et d'autre du nord : leur différence, ${max}° − ${min}° = ${max - min}°, n'est pas l'écart entre les deux directions. L'écart se mesure en passant par le nord : 360° − ${max - min}° = ${ecart}° (angle en ${sommet} à en déduire).`;
}

// ---------------------------------------------------------------------------------------------
// Deux trajets successifs
// ---------------------------------------------------------------------------------------------

const CONTEXTES_TRAJETS: (ContexteLongueurs & {
  noms: [string, string, string];
  texte: (c1: number, d1: string, c2: number, d2: string) => string;
  question: (p: Precision) => string;
  phrase: Phrase;
})[] = [
  {
    noms: ["P", "B", "A"],
    unite: "km",
    uniteFautive: "m",
    min: 6,
    max: 30,
    pas: 1,
    precision: KM_DIXIEME,
    texte: (c1, d1, c2, d2) => `Un voilier quitte le port P et navigue au cap ${c1}° sur ${d1} km, jusqu'à la bouée B. Il prend ensuite le cap ${c2}° et parcourt encore ${d2} km, jusqu'au point A. ${RAPPEL_CAP}`,
    question: (p) => `À quelle distance du port se trouve le voilier ? Donne la distance PA ${p.texte}.`,
    phrase: { avant: "Le voilier se trouve à environ ", apres: " du port." },
  },
  {
    noms: ["D", "B", "A"],
    unite: "km",
    uniteFautive: "m",
    min: 40,
    max: 160,
    pas: 1,
    precision: KM_UNITE,
    texte: (c1, d1, c2, d2) => `Un petit avion décolle de l'aérodrome D et vole au cap ${c1}° sur ${d1} km, jusqu'à la balise radio B. Il vole ensuite au cap ${c2}° sur ${d2} km, jusqu'au point A. ${RAPPEL_CAP}`,
    question: (p) => `Quelle distance sépare alors l'avion de l'aérodrome ? Donne la distance DA ${p.texte}.`,
    phrase: { avant: "L'avion se trouve à environ ", apres: " de l'aérodrome." },
  },
  {
    noms: ["D", "B", "A"],
    unite: "m",
    uniteFautive: "km",
    min: 400,
    max: 2500,
    pas: 10,
    precision: M_UNITE,
    texte: (c1, d1, c2, d2) => `Lors d'une course d'orientation, Léa part du poste de départ D. Elle marche ${d1} m au cap ${c1}°, jusqu'à la balise B, puis ${d2} m au cap ${c2}°, jusqu'à la balise A. ${RAPPEL_CAP}`,
    question: (p) => `À quelle distance du départ se trouve Léa ? Donne la distance DA ${p.texte}.`,
    phrase: { avant: "Léa se trouve à environ ", apres: " du départ." },
  },
];

/** Audit 4e ch. 5, V7 : la loi n'est plus fixée par la situation. Sous-type « relevé » : le second
 * trajet est inconnu, la position finale A est relevée depuis le départ (troisième cap) — un côté et
 * deux angles, loi des sinus pour la distance parcourue sur le second trajet. */
const QUESTIONS_RELEVE: ((p: Precision) => string)[] = [
  (p) => `Quelle distance le voilier a-t-il parcourue sur le second trajet ? Donne la distance BA ${p.texte}.`,
  (p) => `Quelle distance l'avion a-t-il parcourue depuis la balise ? Donne la distance BA ${p.texte}.`,
  (p) => `Quelle distance Léa a-t-elle parcourue depuis la balise B ? Donne la distance BA ${p.texte}.`,
];

const TEXTES_RELEVE: ((c1: number, d1: string, c2: number, c3: number) => string)[] = [
  (c1, d1, c2, c3) => `Un voilier quitte le port P et navigue au cap ${c1}° sur ${d1} km, jusqu'à la bouée B. Il prend ensuite le cap ${c2}° et navigue jusqu'au point A. Depuis le port, on relève alors sa position A au cap ${c3}°. ${RAPPEL_CAP}`,
  (c1, d1, c2, c3) => `Un petit avion décolle de l'aérodrome D et vole au cap ${c1}° sur ${d1} km, jusqu'à la balise radio B. Il vole ensuite au cap ${c2}° jusqu'au point A, où le radar de l'aérodrome le repère au cap ${c3}°. ${RAPPEL_CAP}`,
  (c1, d1, c2, c3) => `Lors d'une course d'orientation, Léa part du poste de départ D. Elle marche ${d1} m au cap ${c1}°, jusqu'à la balise B, puis au cap ${c2}° jusqu'à la balise A. Depuis le départ, la balise A se trouve au cap ${c3}°. ${RAPPEL_CAP}`,
];

const PHRASES_RELEVE: Phrase[] = [
  { avant: "Sur le second trajet, le voilier a parcouru environ ", apres: "." },
  { avant: "Depuis la balise, l'avion a parcouru environ ", apres: "." },
  { avant: "Depuis la balise B, Léa a parcouru environ ", apres: "." },
];

export function construireTrajetsReleve(): ExerciceTexteTriangleStandard {
  const i = entier(0, CONTEXTES_TRAJETS.length - 1);
  const ctx = CONTEXTES_TRAJETS[i]!;
  const [D, V, A] = ctx.noms;
  for (;;) {
    const cap1 = capAuHasard();
    const sens = Math.random() < 0.5 ? 1 : -1;
    const ecart = entier(50, 140);
    const p = entier(15, ecart - 25);
    const cap2 = normaliserCap(cap1 + sens * ecart);
    const cap3 = normaliserCap(cap1 + sens * p);
    if (!capLisible(cap2) || !capLisible(cap3)) continue;
    if (ecartCaps(cap1, cap2).nord || ecartCaps(cap1, cap3).nord) continue;
    const angleV = 180 - ecart;
    const angleD = p;
    const angleA = 180 - angleV - angleD;
    if (angleA < 25 || angleV < 30 || Math.abs(angleV - 90) <= 6) continue;
    const d1 = longueur(ctx.min, ctx.max, ctx.pas);
    const angV = `\\widehat{${D}${V}${A}}`;
    const angD = `\\widehat{${V}${D}${A}}`;
    const angA = `\\widehat{${D}${A}${V}}`;
    const calcul = { loi: "sinus" as const, coteConnu: { latex: `${D}${V}`, valeur: d1 }, angleOpposeConnu: { latex: angA, valeur: angleA }, angleOpposeCherche: { latex: angD, valeur: angleD } };
    const valeur = valeurCalcul(calcul);
    // Piège : l'écart des caps (angle dont la route tourne) pris comme angle intérieur en B.
    const angleAFaux = 180 - ecart - angleD;
    const piege = angleAFaux > 5 ? (d1 * Math.sin((angleD * Math.PI) / 180)) / Math.sin((angleAFaux * Math.PI) / 180) : 0;
    const u1 = direction(cap1);
    const u2 = direction(cap2);
    const pV = { x: d1 * u1.x, y: d1 * u1.y };
    const pA = { x: pV.x + valeur * u2.x, y: pV.y + valeur * u2.y };
    return {
      variante: "trajets",
      sousType: "releve",
      contexte: TEXTES_RELEVE[i]!(cap1, fr(d1), cap2, cap3),
      question: QUESTIONS_RELEVE[i]!(ctx.precision),
      triangle: `${D}${V}${A}`,
      points: [
        { nom: D, x: 0, y: 0 },
        { nom: V, ...pV },
        { nom: A, ...pA },
      ],
      avecNord: true,
      unite: ctx.unite,
      precision: ctx.precision,
      elements: melanger([
        { latex: `${D}${V}`, role: "donne" as const },
        { latex: angV, role: "convertir" as const },
        { latex: angD, role: "convertir" as const },
        { latex: angA, role: "convertir" as const },
        { latex: `${V}${A}`, role: "cherche" as const },
      ]),
      conversions: [
        conversion(angV, angleV, "virage", `180^\\circ - \\big(${ecartLatex(cap1, cap2)}\\big)`, `En ${V}, la route tourne de l'écart entre les deux caps. L'angle intérieur en ${V}, entre le chemin du retour vers ${D} et la nouvelle route, est le supplémentaire de cet écart :`),
        conversion(angD, angleD, "ecartCaps", ecartLatex(cap1, cap3), `En ${D}, l'angle du triangle est l'écart entre le cap du premier trajet et le cap du relèvement de ${A} :`),
        conversion(angA, angleA, "somme", `180^\\circ - ${angV} - ${angD}`, `La somme des angles du triangle ${D}${V}${A} vaut 180° :`, `180^\\circ - ${angleV}^\\circ - ${angleD}^\\circ`),
      ],
      calcul,
      inconnue: { latex: `${V}${A}`, valeur },
      piege: {
        valeur: piege,
        description: `L'écart des caps (${ecart}°) est l'angle dont la route tourne en ${V}, pas l'angle intérieur du triangle : celui-ci est son supplémentaire, 180° − ${ecart}° = ${angleV}°.`,
      },
      angles: { capDepart: cap1, capVirage: cap2, capReleve: cap3 },
      longueurs: [[D, V, d1]],
      segmentCherche: [V, A],
      options: optionsReponse(valeur, [piege, (d1 * Math.sin((angleD * Math.PI) / 180)) / Math.sin((angleV * Math.PI) / 180)], ctx.unite, ctx.uniteFautive, ctx.precision, PHRASES_RELEVE[i]!),
    };
  }
}

export function construireTrajets(nord: boolean = Math.random() < 0.45): ExerciceTexteTriangleStandard {
  const ctx = choisir(CONTEXTES_TRAJETS);
  const [D, V, A] = ctx.noms;
  const { cap1, cap2, ecart } = deuxCaps(nord, (e) => 180 - e);
  const d1 = longueur(ctx.min, ctx.max, ctx.pas);
  const d2 = longueur(ctx.min, ctx.max, ctx.pas);
  const angleV = 180 - ecart;
  const angleLatex = `\\widehat{${D}${V}${A}}`;
  const calcul = { loi: "cosinus" as const, cote1: { latex: `${D}${V}`, valeur: d1 }, cote2: { latex: `${V}${A}`, valeur: d2 }, angle: { latex: angleLatex, valeur: angleV } };
  const valeur = valeurCalcul(calcul);
  const piege = valeurCalcul({ ...calcul, angle: { ...calcul.angle, valeur: ecart } });
  const u1 = direction(cap1);
  const u2 = direction(cap2);
  const pV = { x: d1 * u1.x, y: d1 * u1.y };
  const pA = { x: pV.x + d2 * u2.x, y: pV.y + d2 * u2.y };
  return {
    variante: "trajets",
    sousType: nord ? "nord" : "direct",
    contexte: ctx.texte(cap1, fr(d1), cap2, fr(d2)),
    question: ctx.question(ctx.precision),
    triangle: `${D}${V}${A}`,
    points: [
      { nom: D, x: 0, y: 0 },
      { nom: V, ...pV },
      { nom: A, ...pA },
    ],
    avecNord: true,
    unite: ctx.unite,
    precision: ctx.precision,
    elements: melanger([
      { latex: `${D}${V}`, role: "donne" as const },
      { latex: `${V}${A}`, role: "donne" as const },
      { latex: angleLatex, role: "convertir" as const },
      { latex: `${D}${A}`, role: "cherche" as const },
    ]),
    conversions: [
      conversion(
        angleLatex,
        angleV,
        "virage",
        `180^\\circ - \\big(${ecartLatex(cap1, cap2)}\\big)`,
        nord
          ? `En ${V}, la route tourne de l'écart entre les deux caps, mesuré en passant par le nord (360° moins la différence des caps). L'angle intérieur en ${V} est le supplémentaire de cet écart :`
          : `En ${V}, la route tourne de l'écart entre les deux caps. L'angle intérieur en ${V}, entre le chemin du retour vers ${D} et la nouvelle route, est le supplémentaire de cet écart :`,
      ),
    ],
    calcul,
    inconnue: { latex: `${D}${A}`, valeur },
    piege: {
      valeur: piege,
      description: nord
        ? piegeNord(cap1, cap2, V)
        : `L'écart des caps (${ecart}°) est l'angle dont la route tourne en ${V}, pas l'angle intérieur du triangle : celui-ci est son supplémentaire, 180° − ${ecart}° = ${angleV}°.`,
    },
    angles: { capDepart: cap1, capVirage: cap2 },
    longueurs: [
      [D, V, d1],
      [V, A, d2],
    ],
    segmentCherche: [D, A],
    options: optionsReponse(valeur, [piege, Math.sqrt(d1 * d1 + d2 * d2)], ctx.unite, ctx.uniteFautive, ctx.precision, ctx.phrase),
  };
}

// ---------------------------------------------------------------------------------------------
// Deux mobiles partis du même point
// ---------------------------------------------------------------------------------------------

const CONTEXTES_DEUX_MOBILES: (ContexteLongueurs & {
  noms: [string, string, string];
  texte: (c1: number, d1: string, c2: number, d2: string) => string;
  question: (p: Precision) => string;
  phrase: Phrase;
})[] = [
  {
    noms: ["P", "A", "B"],
    unite: "km",
    uniteFautive: "m",
    min: 8,
    max: 35,
    pas: 0.5,
    precision: KM_DIXIEME,
    texte: (c1, d1, c2, d2) =>
      `Deux bateaux quittent en même temps le port P. Le bateau A suit le cap ${c1}°, le bateau B le cap ${c2}°. Une heure plus tard, A a parcouru ${d1} km et B ${d2} km, chacun en ligne droite. ${RAPPEL_CAP}`,
    question: (p) => `Quelle distance sépare alors les deux bateaux ? Donne la distance AB ${p.texte}.`,
    phrase: { avant: "Les deux bateaux sont à environ ", apres: " l'un de l'autre." },
  },
  {
    noms: ["R", "A", "B"],
    unite: "km",
    uniteFautive: "m",
    min: 1.5,
    max: 6,
    pas: 0.1,
    precision: KM_CENTIEME,
    texte: (c1, d1, c2, d2) =>
      `Deux randonneurs quittent ensemble le refuge R. Anna marche en ligne droite au cap ${c1}° et s'arrête au point A, à ${d1} km du refuge. Bruno marche au cap ${c2}° et s'arrête au point B, à ${d2} km du refuge. ${RAPPEL_CAP}`,
    question: (p) => `Quelle distance sépare Anna et Bruno ? Donne la distance AB ${p.texte}.`,
    phrase: { avant: "Anna et Bruno sont à environ ", apres: " l'un de l'autre." },
  },
  {
    noms: ["T", "A", "B"],
    unite: "km",
    uniteFautive: "m",
    min: 20,
    max: 90,
    pas: 1,
    precision: KM_UNITE,
    texte: (c1, d1, c2, d2) =>
      `Sur l'écran radar de la tour de contrôle T, l'avion A est repéré au cap ${c1}°, à ${d1} km de la tour, et l'avion B au cap ${c2}°, à ${d2} km de la tour. ${RAPPEL_CAP}`,
    question: (p) => `Quelle distance sépare les deux avions (on néglige leur différence d'altitude) ? Donne la distance AB ${p.texte}.`,
    phrase: { avant: "Les deux avions sont à environ ", apres: " l'un de l'autre." },
  },
];

export function construireDeuxBateaux(nord: boolean = Math.random() < 0.45): ExerciceTexteTriangleStandard {
  const ctx = choisir(CONTEXTES_DEUX_MOBILES);
  const [P, A, B] = ctx.noms;
  const { cap1, cap2, ecart } = deuxCaps(nord, (e) => e);
  const d1 = Number(longueur(ctx.min, ctx.max, ctx.pas).toFixed(1));
  let d2 = Number(longueur(ctx.min, ctx.max, ctx.pas).toFixed(1));
  if (d2 === d1) d2 = Number((d2 + ctx.pas * 3).toFixed(1));
  const angleLatex = `\\widehat{${A}${P}${B}}`;
  const calcul = { loi: "cosinus" as const, cote1: { latex: `${P}${A}`, valeur: d1 }, cote2: { latex: `${P}${B}`, valeur: d2 }, angle: { latex: angleLatex, valeur: ecart } };
  const valeur = valeurCalcul(calcul);
  const piege = valeurCalcul({ ...calcul, angle: { ...calcul.angle, valeur: 180 - ecart } });
  const u1 = direction(cap1);
  const u2 = direction(cap2);
  return {
    variante: "deuxBateaux",
    sousType: nord ? "nord" : "direct",
    contexte: ctx.texte(cap1, fr(d1), cap2, fr(d2)),
    question: ctx.question(ctx.precision),
    triangle: `${P}${A}${B}`,
    points: [
      { nom: P, x: 0, y: 0 },
      { nom: A, x: d1 * u1.x, y: d1 * u1.y },
      { nom: B, x: d2 * u2.x, y: d2 * u2.y },
    ],
    avecNord: true,
    unite: ctx.unite,
    precision: ctx.precision,
    elements: melanger([
      { latex: `${P}${A}`, role: "donne" as const },
      { latex: `${P}${B}`, role: "donne" as const },
      { latex: angleLatex, role: "convertir" as const },
      { latex: `${A}${B}`, role: "cherche" as const },
    ]),
    conversions: [
      conversion(
        angleLatex,
        ecart,
        "ecartCaps",
        ecartLatex(cap1, cap2),
        nord
          ? `Les deux routes partent de ${P} ; l'angle en ${P} est l'écart entre les deux caps. Ils sont de part et d'autre du nord : l'écart se mesure en passant par le nord, 360° moins la différence des caps :`
          : `Les deux routes partent de ${P} ; l'angle en ${P} est l'écart entre les deux caps, leur différence :`,
      ),
    ],
    calcul,
    inconnue: { latex: `${A}${B}`, valeur },
    piege: {
      valeur: piege,
      description: nord
        ? piegeNord(cap1, cap2, P)
        : `Les deux routes partent du même point ${P} : l'angle en ${P} est l'écart des caps lui-même (${ecart}°), pas son supplémentaire (180° − ${ecart}° sert au virage d'un trajet en deux étapes).`,
    },
    angles: { cap1, cap2 },
    longueurs: [
      [P, A, d1],
      [P, B, d2],
    ],
    segmentCherche: [A, B],
    options: optionsReponse(valeur, [piege, carreCosinus(calcul)], ctx.unite, ctx.uniteFautive, ctx.precision, ctx.phrase),
  };
}

// ---------------------------------------------------------------------------------------------
// Parcelle relevée depuis un coin
// ---------------------------------------------------------------------------------------------

export function construireParcelle(aire: boolean = Math.random() < 0.5, nord: boolean = Math.random() < 0.45): ExerciceTexteTriangleStandard {
  const { cap1: capB, cap2: capC, ecart } = deuxCaps(nord, (e) => e);
  const ab = longueur(40, 180, 1);
  let ac = longueur(40, 180, 1);
  if (ac === ab) ac += 7;
  const angleLatex = "\\widehat{BAC}";
  const uB = direction(capB);
  const uC = direction(capC);
  const contexte =
    `Une géomètre relève une parcelle triangulaire ABC. Placée au coin A, elle vise le coin B au cap ${capB}° et le coin C au cap ${capC}°. ` +
    `Elle mesure ensuite AB = ${ab} m et AC = ${ac} m. ${RAPPEL_CAP}`;
  const base = {
    variante: "parcelle" as const,
    sousType: nord ? "nord" : "direct",
    contexte,
    triangle: "ABC",
    points: [
      { nom: "A", x: 0, y: 0 },
      { nom: "B", x: ab * uB.x, y: ab * uB.y },
      { nom: "C", x: ac * uC.x, y: ac * uC.y },
    ],
    avecNord: true,
    conversions: [
      conversion(
        angleLatex,
        ecart,
        "ecartCaps" as const,
        ecartLatex(capB, capC),
        nord
          ? "Les deux visées partent de A ; l'angle en A est l'écart entre les deux caps. Ils sont de part et d'autre du nord : l'écart se mesure en passant par le nord, 360° moins la différence des caps :"
          : "Les deux visées partent de A ; l'angle en A est l'écart entre les deux caps, leur différence :",
      ),
    ],
    angles: { capB, capC },
    longueurs: [
      ["A", "B", ab],
      ["A", "C", ac],
    ] as [string, string, number][],
  };
  const descriptionPiege = nord ? piegeNord(capB, capC, "A") : `Les deux visées partent du même point A : l'angle en A est l'écart des caps lui-même (${ecart}°), pas son supplémentaire.`;
  if (aire) {
    const calcul = { loi: "aire" as const, cote1: { latex: "AB", valeur: ab }, cote2: { latex: "AC", valeur: ac }, angle: { latex: angleLatex, valeur: ecart } };
    const valeur = valeurCalcul(calcul);
    return {
      ...base,
      question: `Calcule l'aire de la parcelle, ${M2_UNITE.texte}.`,
      unite: "m²",
      precision: M2_UNITE,
      elements: melanger([
        { latex: "AB", role: "donne" as const },
        { latex: "AC", role: "donne" as const },
        { latex: angleLatex, role: "convertir" as const },
        { latex: "\\mathcal{A}_{ABC}", role: "cherche" as const },
      ]),
      calcul,
      inconnue: { latex: "\\mathcal{A}_{ABC}", valeur },
      piege: { valeur: 2 * valeur, description: descriptionPiege },
      segmentCherche: null,
      options: optionsReponse(valeur, [2 * valeur, (ab * ac) / 2], "m²", "m", M2_UNITE, { avant: "La parcelle a une aire d'environ ", apres: "." }),
    };
  }
  const calcul = { loi: "cosinus" as const, cote1: { latex: "AB", valeur: ab }, cote2: { latex: "AC", valeur: ac }, angle: { latex: angleLatex, valeur: ecart } };
  const valeur = valeurCalcul(calcul);
  const piege = valeurCalcul({ ...calcul, angle: { ...calcul.angle, valeur: 180 - ecart } });
  return {
    ...base,
    question: `Quelle longueur de clôture faut-il pour fermer le côté [BC] ? Donne la longueur BC ${M_UNITE.texte}.`,
    unite: "m",
    precision: M_UNITE,
    elements: melanger([
      { latex: "AB", role: "donne" as const },
      { latex: "AC", role: "donne" as const },
      { latex: angleLatex, role: "convertir" as const },
      { latex: "BC", role: "cherche" as const },
    ]),
    calcul,
    inconnue: { latex: "BC", valeur },
    piege: { valeur: piege, description: descriptionPiege },
    segmentCherche: ["B", "C"],
    options: optionsReponse(valeur, [piege, carreCosinus(calcul)], "m", "km", M_UNITE, { avant: "Il faut environ ", apres: " de clôture pour le côté [BC]." }),
  };
}
