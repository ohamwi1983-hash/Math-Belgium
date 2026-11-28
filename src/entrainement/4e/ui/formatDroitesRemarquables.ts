import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceDroitesRemarquables } from "../core/droitesRemarquables.types";
import type { EcranTSD } from "./ecransTransfertSecondDegre";
import { q } from "./corrigeChapitre3";
import { figureLotG } from "./figureLotG";
import {
  champDroite,
  champExact,
  champsPoint,
  droiteDirectrice,
  droiteLatex,
  droiteNormale,
  droitePoints,
  milieu,
  pointLatex,
  racine,
  vecteur,
  type Droite,
  type Fragments,
  type Pt,
} from "./geometrieLotG";

/**
 * Textes et écrans de gen94 « Droites remarquables d'un triangle » — SOURCE UNIQUE pour l'écran, les
 * aides, le papier et le corrigé. Médiatrice : milieu + vecteur normal (le côté) ; hauteur : sommet +
 * vecteur normal (le côté opposé) ; médiane : sommet + milieu du côté opposé ; aire : base × hauteur / 2,
 * la hauteur étant la distance du sommet à la droite du côté (§ 6, sans formule toute faite).
 */

type E = ExerciceDroitesRemarquables;

export const TITRES: Record<E["variante"], string[]> = {
  mediatrices: ["Médiatrice de [AB]", "Médiatrice de [BC]", "Centre du cercle circonscrit"],
  hauteurs: ["Hauteur issue de A", "Hauteur issue de B", "Orthocentre"],
  medianes: ["Médiane issue de A", "Médiane issue de B", "Centre de gravité"],
  aire: ["La base BC", "La droite (BC)", "Le pied H", "La hauteur AH", "L'aire"],
};

export function enonceFragments(e: E): Fragments {
  return [texte("On donne le triangle ABC de sommets "), latex(pointLatex("A", e.a)), texte(", "), latex(pointLatex("B", e.b)), texte(" et "), latex(pointLatex("C", e.c)), texte(".")];
}

export const CONSIGNES_GLOBALES: Record<E["variante"], string> = {
  mediatrices: "Détermine une équation cartésienne des médiatrices des côtés [AB] et [BC], puis les coordonnées du centre O du cercle circonscrit au triangle.",
  hauteurs: "Détermine une équation cartésienne des hauteurs issues de A et de B, puis les coordonnées de l'orthocentre H du triangle.",
  medianes: "Détermine une équation cartésienne des médianes issues de A et de B, puis les coordonnées du centre de gravité G du triangle.",
  aire: "Calcule l'aire du triangle en prenant [BC] comme base : la hauteur correspondante est la distance du sommet A à la droite (BC). Donne les longueurs en valeur exacte.",
};

export function consigneGlobale(e: E): string {
  return CONSIGNES_GLOBALES[e.variante];
}

export function figure(e: E): string {
  const sommets = [
    { p: e.a, nom: "A" },
    { p: e.b, nom: "B" },
    { p: e.c, nom: "C" },
  ];
  const cotes = [
    { a: e.a, b: e.b, couleur: "encre" as const },
    { a: e.b, b: e.c, couleur: "encre" as const },
    { a: e.c, b: e.a, couleur: "encre" as const },
  ];
  const droites = Object.entries(e.droites)
    .filter(([id]) => id !== "BCd")
    .map(([, d]) => ({ d, pointilles: true, couleur: "gris" as const }));
  const pts: { p: Pt; nom: string; couleur?: "vert"; position?: "so" | "ne" }[] = sommets.map((s) => ({ ...s }));
  if (e.variante === "aire") {
    const h = e.points.H!;
    return figureLotG({
      segments: [...cotes, { a: e.a, b: h, couleur: "vert", pointilles: true }],
      droites: [{ d: e.droites.BCd!, couleur: "gris", pointilles: true }],
      anglesDroits: [{ sommet: h, vers1: e.a, vers2: e.c.x === h.x && e.c.y === h.y ? e.b : e.c }],
      points: [...pts, { p: h, nom: "H", couleur: "vert", position: "so" }],
    });
  }
  const [nom, p] = Object.entries(e.points)[0]!;
  return figureLotG({ segments: cotes, droites, points: [...pts, { p, nom, couleur: "vert", position: "so" }] });
}

/* ---------------------------------------------------------------------------------------------
 * Écrans
 * ------------------------------------------------------------------------------------------- */

const LIB: Record<string, string> = { m1: "m_1", m2: "m_2", h1: "h_A", h2: "h_B", md1: "g_A", md2: "g_B" };

function ecranMediatrice(e: E, id: "m1" | "m2", p: Pt, q0: Pt, np: string, nq: string): EcranTSD {
  const m = milieu(p, q0);
  const v = vecteur(p, q0);
  const seg = `[${np}${nq}]`;
  return {
    type: "champs",
    titre: `Médiatrice de ${seg}`,
    consigne: [texte(`Écris une équation cartésienne de la médiatrice `), latex(LIB[id]!), texte(` du côté ${seg}.`)],
    champs: [
      champDroite(
        id,
        [latex(`${LIB[id]}\\equiv`)],
        e.droites[id]!,
        [
          { d: droiteDirectrice(m, v), message: `Tu as pris $\\vec{${np}${nq}}$ comme vecteur directeur : la médiatrice est perpendiculaire au côté, ce vecteur est un vecteur normal.` },
          { d: droiteNormale(p, v), message: "Ta droite ne passe pas par le milieu du côté : la médiatrice passe par le milieu." },
          { d: droiteNormale(q0, v), message: "Ta droite ne passe pas par le milieu du côté : la médiatrice passe par le milieu." },
        ],
        "La médiatrice d'un côté passe par son milieu et a pour vecteur normal le vecteur du côté.",
      ),
    ],
    aides: [
      [texte(`La médiatrice de ${seg} passe par le milieu M de ${seg} et a pour vecteur normal `), latex(`\\vec{${np}${nq}}`), texte(" : "), latex("a(x-x_M)+b(y-y_M)=0")],
      [texte("Ici, calcule M (moyenne des coordonnées) et les composantes de "), latex(`\\vec{${np}${nq}}`), texte(", puis remplace et développe.")],
    ],
    reponse: [latex(`${LIB[id]}\\equiv ${droiteLatex(e.droites[id]!)}`)],
  };
}

function ecranHauteur(e: E, id: "h1" | "h2", s: Pt, p: Pt, q0: Pt, ns: string, np: string, nq: string): EcranTSD {
  const v = vecteur(p, q0);
  return {
    type: "champs",
    titre: `Hauteur issue de ${ns}`,
    consigne: [texte(`Écris une équation cartésienne de la hauteur `), latex(LIB[id]!), texte(` issue de ${ns} (perpendiculaire à (${np}${nq})).`)],
    champs: [
      champDroite(
        id,
        [latex(`${LIB[id]}\\equiv`)],
        e.droites[id]!,
        [
          { d: droiteDirectrice(s, v), message: `Tu as pris $\\vec{${np}${nq}}$ comme vecteur directeur : la hauteur est perpendiculaire au côté (${np}${nq}), ce vecteur est un vecteur normal.` },
          { d: droiteNormale(milieu(p, q0), v), message: `Cette droite passe par le milieu de [${np}${nq}] : c'est la médiatrice. La hauteur issue de ${ns} passe par le sommet ${ns}.` },
          { d: droiteNormale(p, v), message: `Ta droite passe par ${np}. La hauteur issue de ${ns} passe par le sommet ${ns}.` },
        ],
        `La hauteur issue de ${ns} passe par ${ns} et a pour vecteur normal le vecteur du côté opposé.`,
      ),
    ],
    aides: [
      [texte(`La hauteur issue de ${ns} passe par ${ns} et est perpendiculaire au côté opposé (${np}${nq}) : `), latex(`\\vec{${np}${nq}}`), texte(" en est un vecteur normal, donc "), latex(`a(x-x_${ns})+b(y-y_${ns})=0`), texte(".")],
      [texte("Ici, calcule les composantes de "), latex(`\\vec{${np}${nq}}`), texte(", puis remplace avec "), latex(pointLatex(ns, s)), texte(".")],
    ],
    reponse: [latex(`${LIB[id]}\\equiv ${droiteLatex(e.droites[id]!)}`)],
  };
}

function ecranMediane(e: E, id: "md1" | "md2", s: Pt, p: Pt, q0: Pt, ns: string, np: string, nq: string): EcranTSD {
  const m = milieu(p, q0);
  return {
    type: "champs",
    titre: `Médiane issue de ${ns}`,
    consigne: [texte(`Écris une équation cartésienne de la médiane `), latex(LIB[id]!), texte(` issue de ${ns}.`)],
    champs: [
      champDroite(
        id,
        [latex(`${LIB[id]}\\equiv`)],
        e.droites[id]!,
        [
          { d: droitePoints(s, p), message: `Ta droite passe par ${ns} et ${np} : c'est le côté. La médiane issue de ${ns} passe par le milieu de [${np}${nq}].` },
          { d: droitePoints(s, q0), message: `Ta droite passe par ${ns} et ${nq} : c'est le côté. La médiane issue de ${ns} passe par le milieu de [${np}${nq}].` },
          { d: droiteNormale(m, vecteur(p, q0)), message: `Cette droite est la médiatrice de [${np}${nq}]. La médiane passe par le sommet ${ns} et par le milieu du côté opposé.` },
        ],
        `La médiane issue de ${ns} passe par ${ns} et par le milieu du côté opposé [${np}${nq}].`,
      ),
    ],
    aides: [
      [texte(`La médiane issue de ${ns} passe par ${ns} et par le milieu M de [${np}${nq}] : `), latex(`\\vec{${ns}M}`), texte(" en est un vecteur directeur.")],
      [texte(`Ici, calcule M (moyenne des coordonnées de ${np} et ${nq}), puis les composantes de `), latex(`\\vec{${ns}M}`), texte(" ; écris enfin l'équation de la droite par "), latex(ns), texte(" de ce vecteur directeur.")],
    ],
    reponse: [latex(`${LIB[id]}\\equiv ${droiteLatex(e.droites[id]!)}`)],
  };
}

function ecranPoint(e: E, nom: string, titre: string, consigne: Fragments, d1: string, d2: string): EcranTSD {
  const p = e.points[nom]!;
  return {
    type: "champs",
    titre,
    consigne,
    champs: champsPoint(nom, p, [], [], "Ton point doit vérifier les deux équations : remplace pour contrôler."),
    aides: [
      [texte("Le point de concours est sur les deux droites : résous le système de leurs équations, par substitution ou par combinaison (cours, point 5).")],
      [texte("Ici, résous le système formé par "), latex(`${LIB[d1]}\\equiv ${droiteLatex(e.droites[d1]!)}`), texte(" et "), latex(`${LIB[d2]}\\equiv ${droiteLatex(e.droites[d2]!)}`), texte(".")],
    ],
    reponse: [latex(pointLatex(nom, p))],
  };
}

function ecransAire(e: E): EcranTSD[] {
  const bc2 = e.longueurs.BC!;
  const ah2 = e.longueurs.AH!;
  const h = e.points.H!;
  const d = e.droites.BCd!;
  const u = vecteur(e.b, e.c);
  return [
    {
      type: "champs",
      titre: TITRES.aire[0]!,
      consigne: [texte("Calcule la longueur de la base BC (valeur exacte).")],
      champs: [champExact("BC", [latex("BC=")], Math.sqrt(bc2), [{ valeur: bc2, message: "C'est $BC^2$ : la longueur est sa racine carrée." }], "BC est la norme du vecteur $\\vec{BC}$.")],
      aides: [
        [texte("La longueur BC est la norme du vecteur "), latex("\\vec{BC}"), texte(" : "), latex("BC=\\sqrt{(x_C-x_B)^2+(y_C-y_B)^2}")],
        [texte("Ici, calcule les composantes de "), latex("\\vec{BC}"), texte(" à partir de "), latex(pointLatex("B", e.b)), texte(" et "), latex(pointLatex("C", e.c)), texte(", puis la norme.")],
      ],
      reponse: [latex(`BC=${racine(bc2)}`)],
    },
    {
      type: "champs",
      titre: TITRES.aire[1]!,
      consigne: [texte("Écris une équation cartésienne de la droite (BC).")],
      champs: [
        champDroite(
          "BCd",
          [latex("(BC)\\equiv")],
          d,
          [{ d: droiteNormale(e.b, u), message: "Tu as pris $\\vec{BC}$ comme vecteur normal : c'est un vecteur directeur de la droite (BC)." }],
          "La droite (BC) passe par B et a pour vecteur directeur $\\vec{BC}$.",
        ),
      ],
      aides: [
        [texte("La droite (BC) passe par B et a pour vecteur directeur "), latex("\\vec{BC}"), texte(" ; un vecteur normal s'obtient en le tournant d'un quart de tour : "), latex("\\begin{pmatrix}a\\\\b\\end{pmatrix}\\to\\begin{pmatrix}-b\\\\a\\end{pmatrix}")],
        [texte("Ici, "), latex(`\\vec{BC}\\begin{pmatrix}${q(u.x)}\\\\${q(u.y)}\\end{pmatrix}`), texte(" (étape a) : tourne-le, puis écris "), latex("a(x-x_B)+b(y-y_B)=0"), texte(".")],
      ],
      reponse: [latex(`(BC)\\equiv ${droiteLatex(d)}`)],
    },
    {
      type: "champs",
      titre: TITRES.aire[2]!,
      consigne: [texte("Calcule les coordonnées du pied H de la hauteur issue de A (perpendiculaire à (BC) passant par A).")],
      champs: champsPoint("H", h, [], [], "H doit être sur (BC) et $\\vec{AH}$ perpendiculaire à (BC)."),
      aides: [
        [texte("Méthode du cours (point 6) : la perpendiculaire à "), latex("ax+by+c=0"), texte(" passant par A a pour vecteur directeur "), latex("\\begin{pmatrix}a\\\\b\\end{pmatrix}"), texte(" ; H est son intersection avec (BC).")],
        [texte("Ici, écris la perpendiculaire par "), latex(pointLatex("A", e.a)), texte(" sous forme paramétrique, puis remplace x et y dans "), latex(`(BC)\\equiv ${droiteLatex(d)}`), texte(" pour trouver t.")],
      ],
      reponse: [latex(pointLatex("H", h))],
    },
    {
      type: "champs",
      titre: TITRES.aire[3]!,
      consigne: [texte("Calcule la hauteur AH, distance de A à la droite (BC) (valeur exacte).")],
      champs: [champExact("AH", [latex("AH=")], Math.sqrt(ah2), [{ valeur: ah2, message: "C'est $AH^2$ : la longueur est sa racine carrée." }], "AH est la norme du vecteur $\\vec{AH}$.")],
      aides: [
        [texte("La hauteur est la longueur AH, norme du vecteur "), latex("\\vec{AH}"), texte(" : "), latex("AH=\\sqrt{(x_H-x_A)^2+(y_H-y_A)^2}")],
        [texte("Ici, "), latex(pointLatex("A", e.a)), texte(" et "), latex(pointLatex("H", h)), texte(" : calcule les composantes de "), latex("\\vec{AH}"), texte(", puis la norme.")],
      ],
      reponse: [latex(`AH=${racine(ah2)}`)],
    },
    {
      type: "champs",
      titre: TITRES.aire[4]!,
      consigne: [texte("Calcule l'aire du triangle ABC (valeur exacte).")],
      champs: [
        champExact(
          "aire",
          [latex("\\mathcal{A}=")],
          e.aire!,
          [
            { valeur: 2 * e.aire!, message: "Tu as calculé base × hauteur : l'aire d'un triangle est la moitié, $\\dfrac{BC\\cdot AH}{2}$." },
            { valeur: (bc2 * ah2) / 2, message: "Tu as multiplié les carrés : utilise les longueurs BC et AH elles-mêmes." },
          ],
          "L'aire d'un triangle est $\\dfrac{\\text{base}\\cdot\\text{hauteur}}{2}=\\dfrac{BC\\cdot AH}{2}$.",
        ),
      ],
      aides: [
        [texte("L'aire d'un triangle vaut base fois hauteur divisé par 2 : "), latex("\\mathcal{A}=\\dfrac{BC\\cdot AH}{2}")],
        [texte("Ici, "), latex(`BC=${racine(bc2)}`), texte(" et "), latex(`AH=${racine(ah2)}`), texte(" : multiplie les racines ("), latex("\\sqrt{a}\\cdot\\sqrt{b}=\\sqrt{ab}"), texte("), puis divise par 2.")],
      ],
      reponse: [latex(`\\mathcal{A}=${q(e.aire!)}`)],
      figureApres: figure(e),
    },
  ];
}

export function ecrans(e: E): EcranTSD[] {
  const { a, b, c } = e;
  if (e.variante === "mediatrices") {
    return [
      ecranMediatrice(e, "m1", a, b, "A", "B"),
      ecranMediatrice(e, "m2", b, c, "B", "C"),
      { ...ecranPoint(e, "O", TITRES.mediatrices[2]!, [texte("Le centre O du cercle circonscrit est le point de concours des médiatrices. Calcule ses coordonnées.")], "m1", "m2"), figureApres: figure(e) },
    ];
  }
  if (e.variante === "hauteurs") {
    return [
      ecranHauteur(e, "h1", a, b, c, "A", "B", "C"),
      ecranHauteur(e, "h2", b, c, a, "B", "C", "A"),
      { ...ecranPoint(e, "H", TITRES.hauteurs[2]!, [texte("L'orthocentre H est le point de concours des hauteurs. Calcule ses coordonnées.")], "h1", "h2"), figureApres: figure(e) },
    ];
  }
  if (e.variante === "medianes") {
    return [
      ecranMediane(e, "md1", a, b, c, "A", "B", "C"),
      ecranMediane(e, "md2", b, c, a, "B", "C", "A"),
      { ...ecranPoint(e, "G", TITRES.medianes[2]!, [texte("Le centre de gravité G est le point de concours des médianes. Calcule ses coordonnées.")], "md1", "md2"), figureApres: figure(e) },
    ];
  }
  return ecransAire(e);
}

export function reponseBreveFragments(e: E): Fragments {
  if (e.variante === "aire") {
    return [latex(`BC=${racine(e.longueurs.BC!)}`), texte(" ; "), latex(`(BC)\\equiv ${droiteLatex(e.droites.BCd!)}`), texte(" ; "), latex(`${pointLatex("H", e.points.H!)},\\ AH=${racine(e.longueurs.AH!)}`), texte(" ; "), latex(`\\mathcal{A}=${q(e.aire!)}`), texte(".")];
  }
  const out: Fragments = [];
  for (const [id, d] of Object.entries(e.droites) as [string, Droite][]) out.push(latex(`${LIB[id]}\\equiv ${droiteLatex(d)}`), texte(" ; "));
  const [nom, p] = Object.entries(e.points)[0]!;
  out.push(latex(pointLatex(nom, p)), texte("."));
  return out;
}

export { LIB };
