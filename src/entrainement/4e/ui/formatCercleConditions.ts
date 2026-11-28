import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceCercleConditions } from "../core/cercleConditions.types";
import type { Champ, EcranTSD } from "./ecransTransfertSecondDegre";
import { figureLotG } from "./figureLotG";
import {
  cercleLatex,
  champCercle,
  champDroite,
  champExact,
  champsPoint,
  droiteDirectrice,
  droiteLatex,
  droiteNommee,
  droiteNormale,
  milieu,
  piegesPoint,
  pointLatex,
  racine,
  vecteur,
  type Droite,
  type Fragments,
  type Pt,
} from "./geometrieLotG";

/**
 * Textes et écrans de gen93 « Déterminer un cercle par des conditions » — SOURCE UNIQUE pour l'écran,
 * les aides, le papier et le corrigé. Centre noté Ω (C désigne un point donné), médiatrice construite
 * par son milieu et son vecteur normal (§ 7 : la médiatrice comme lieu), cercle (x − x₀)² + (y − y₀)² = r².
 */

type E = ExerciceCercleConditions;

export const OMEGA = "\\Omega";

export const TITRES: Record<E["variante"], string[]> = {
  diametre: ["Le centre", "Le rayon", "L'équation"],
  "trois-points": ["Médiatrice de [AB]", "Médiatrice de [BC]", "Le centre", "Le rayon", "L'équation"],
  "centre-sur-droite": ["Médiatrice de [AB]", "Le centre", "Le rayon", "L'équation"],
};

export function enonceFragments(e: E): Fragments {
  if (e.variante === "diametre") return [texte("On donne les points "), latex(pointLatex("A", e.a)), texte(" et "), latex(pointLatex("B", e.b)), texte(".")];
  if (e.variante === "trois-points") return [texte("On donne les points "), latex(pointLatex("A", e.a)), texte(", "), latex(pointLatex("B", e.b)), texte(" et "), latex(pointLatex("C", e.c!)), texte(".")];
  return [texte("On donne les points "), latex(pointLatex("A", e.a)), texte(", "), latex(pointLatex("B", e.b)), texte(" et la droite "), latex(droiteNommee("d", e.d!)), texte(".")];
}

export const CONSIGNES_GLOBALES: Record<E["variante"], string> = {
  diametre: "Détermine une équation du cercle de diamètre [AB].",
  "trois-points": "Détermine une équation du cercle qui passe par les points A, B et C.",
  "centre-sur-droite": "Détermine une équation du cercle qui passe par A et B et dont le centre est sur la droite d.",
};

export function consigneGlobale(e: E): string {
  return CONSIGNES_GLOBALES[e.variante];
}

export function figure(e: E): string {
  const r = Math.sqrt(e.r2);
  const points: { p: Pt; nom: string; couleur?: "vert" | "encre"; position?: "ne" | "so" }[] = [
    { p: e.a, nom: "A" },
    { p: e.b, nom: "B" },
  ];
  if (e.c) points.push({ p: e.c, nom: "C" });
  points.push({ p: e.centre, nom: "Ω", couleur: "vert", position: "so" });
  const droites: { d: Droite; nom?: string; pointilles?: boolean; couleur?: "accent" | "gris" }[] = [];
  if (e.droites.m1) droites.push({ d: e.droites.m1, pointilles: true, couleur: "gris" });
  if (e.droites.m2) droites.push({ d: e.droites.m2, pointilles: true, couleur: "gris" });
  if (e.d) droites.push({ d: e.d, nom: "d" });
  return figureLotG({ cercles: [{ c: e.centre, r }], droites, points, segments: e.variante === "diametre" ? [{ a: e.a, b: e.b, couleur: "accent" }] : [] });
}

/* ---------------------------------------------------------------------------------------------
 * Écrans
 * ------------------------------------------------------------------------------------------- */

const MSG_DIRECTEUR = "Tu as pris le vecteur $\\vec{AB}$ comme vecteur directeur : la médiatrice est perpendiculaire à [AB], donc $\\vec{AB}$ est un vecteur normal.";
const MSG_PAS_MILIEU = "Ta droite ne passe pas par le milieu du segment : la médiatrice passe par le milieu et a pour vecteur normal le vecteur du segment.";

function ecranMediatrice(e: E, p: Pt, q: Pt, np: string, nq: string, id: string): EcranTSD {
  const m = milieu(p, q);
  const v = vecteur(p, q);
  const cible = e.droites[id]!;
  const seg = `[${np}${nq}]`;
  return {
    type: "champs",
    titre: `Médiatrice de ${seg}`,
    consigne: [texte(`Écris une équation cartésienne de la médiatrice de ${seg}.`)],
    champs: [
      champDroite(
        id,
        [latex(`${id === "m1" ? "m_1" : "m_2"}\\equiv`)],
        cible,
        [
          { d: droiteDirectrice(m, v), message: MSG_DIRECTEUR.replace(/AB/g, `${np}${nq}`) },
          { d: droiteNormale(p, v), message: MSG_PAS_MILIEU },
          { d: droiteNormale(q, v), message: MSG_PAS_MILIEU },
        ],
        "La médiatrice d'un segment passe par son milieu et a pour vecteur normal le vecteur du segment.",
      ),
    ],
    aides: [
      [texte(`La médiatrice de ${seg} est la droite perpendiculaire à ${seg} en son milieu M : elle passe par M et a pour vecteur normal `), latex(`\\vec{${np}${nq}}`), texte(", donc son équation est "), latex("a(x-x_M)+b(y-y_M)=0"), texte(".")],
      [texte("Ici, calcule le milieu M de "), texte(seg), texte(" (moyenne des coordonnées) et les composantes de "), latex(`\\vec{${np}${nq}}`), texte(" (arrivée moins départ), puis remplace.")],
    ],
    reponse: [latex(`${id === "m1" ? "m_1" : "m_2"}\\equiv ${droiteLatex(cible)}`)],
  };
}

function ecranCentreIntersection(e: E, titre: string, consigne: Fragments, aide2: Fragments): EcranTSD {
  return {
    type: "champs",
    titre,
    consigne,
    champs: champsPoint("O", e.centre, [], [], "Ton point doit vérifier les deux équations : remplace pour contrôler.").map((c, i) => ({ ...c, libelle: [latex(i === 0 ? `x_{${OMEGA}}=` : `y_{${OMEGA}}=`)] })),
    aides: [[texte("Le centre est sur les deux droites : ses coordonnées vérifient les deux équations. Résous le système, par substitution ou par combinaison (cours, point 5).")], aide2],
    reponse: [latex(pointLatex(OMEGA, e.centre))],
  };
}

function ecranRayon(e: E, avecDiametre: boolean): EcranTSD {
  const piegesR = [{ valeur: e.r2, message: "C'est $r^2$ : le rayon est sa racine carrée." }];
  if (avecDiametre) piegesR.push({ valeur: 2 * Math.sqrt(e.r2), message: "C'est la longueur AB, le diamètre : le rayon en est la moitié." });
  return {
    type: "champs",
    titre: "Le rayon",
    consigne: avecDiametre ? [texte("Calcule le rayon r du cercle (valeur exacte).")] : [texte("Calcule le rayon r du cercle : la distance du centre Ω au point A (valeur exacte).")],
    champs: [champExact("r", [latex("r=")], Math.sqrt(e.r2), piegesR, "Le rayon est la distance du centre à un point du cercle : $r=\\Omega A=\\sqrt{(x_A-x_\\Omega)^2+(y_A-y_\\Omega)^2}$.")],
    aides: [
      avecDiametre
        ? [texte("Le rayon est la moitié du diamètre AB, ou la distance du centre Ω à A : "), latex("r=\\Omega A=\\sqrt{(x_A-x_\\Omega)^2+(y_A-y_\\Omega)^2}")]
        : [texte("Le rayon est la distance du centre à n'importe quel point du cercle : "), latex("r=\\Omega A=\\sqrt{(x_A-x_\\Omega)^2+(y_A-y_\\Omega)^2}")],
      [texte("Ici, "), latex(pointLatex(OMEGA, e.centre)), texte(" et "), latex(pointLatex("A", e.a)), texte(" : calcule les composantes de "), latex("\\vec{\\Omega A}"), texte(", puis sa norme.")],
    ],
    reponse: [latex(`r=${racine(e.r2)}`)],
  };
}

function ecranEquation(e: E): EcranTSD {
  const champ: Champ = champCercle(
    "cercle",
    e.centre,
    e.r2,
    [
      { centre: e.centre, r2: Math.sqrt(e.r2), message: "Au second membre, c'est $r^2$, pas r : $(x-x_0)^2+(y-y_0)^2=r^2$." },
      { centre: { x: -e.centre.x, y: -e.centre.y }, r2: e.r2, message: "Attention aux signes : pour le centre $(x_0\\,;y_0)$, on écrit $(x-x_0)^2$ ; pour $x_0=-2$, c'est $(x+2)^2$." },
      { centre: e.centre, r2: 4 * e.r2, message: "Tu as pris le diamètre comme rayon : au second membre, c'est le carré du rayon." },
    ],
    "Le cercle de centre $(x_0\\,;y_0)$ et de rayon r a pour équation $(x-x_0)^2+(y-y_0)^2=r^2$.",
  );
  return {
    type: "champs",
    titre: "L'équation",
    consigne: [texte("Écris une équation du cercle (non développée ou développée).")],
    champs: [champ],
    aides: [
      [texte("Le cercle de centre "), latex("(x_0\\,;y_0)"), texte(" et de rayon r a pour équation "), latex("(x-x_0)^2+(y-y_0)^2=r^2")],
      [texte("Ici, le centre est "), latex(pointLatex(OMEGA, e.centre)), texte(" et "), latex(`r=${racine(e.r2)}`), texte(" : n'oublie pas d'élever le rayon au carré.")],
    ],
    reponse: [latex(cercleLatex(e.centre, e.r2))],
    figureApres: figure(e),
  };
}

export function ecrans(e: E): EcranTSD[] {
  if (e.variante === "diametre") {
    const m = e.centre;
    const faux = piegesPoint(m, [
      { p: { x: e.a.x + e.b.x, y: e.a.y + e.b.y }, message: "Tu as additionné les coordonnées sans diviser par 2 : le milieu est la moyenne des coordonnées." },
      { p: vecteur(e.a, e.b), message: "Ce sont les composantes de $\\vec{AB}$. Le centre est le milieu de [AB] : la moyenne des coordonnées de A et de B." },
    ]);
    return [
      {
        type: "champs",
        titre: TITRES.diametre[0]!,
        consigne: [texte("Le centre Ω d'un cercle de diamètre [AB] est le milieu de [AB]. Calcule ses coordonnées.")],
        champs: champsPoint("O", m, faux.x, faux.y, "Le milieu de [AB] a pour coordonnées les moyennes des coordonnées de A et de B.").map((c, i) => ({ ...c, libelle: [latex(i === 0 ? `x_{${OMEGA}}=` : `y_{${OMEGA}}=`)] })),
        aides: [
          [texte("Le milieu de [AB] a pour coordonnées les moyennes des coordonnées de A et de B : "), latex("\\left(\\dfrac{x_A+x_B}{2}\\,;\\dfrac{y_A+y_B}{2}\\right)")],
          [texte("Ici, additionne les abscisses de A et de B, puis divise par 2 ; même chose pour les ordonnées.")],
        ],
        reponse: [latex(pointLatex(OMEGA, m))],
      },
      ecranRayon(e, true),
      ecranEquation(e),
    ];
  }
  if (e.variante === "trois-points") {
    return [
      ecranMediatrice(e, e.a, e.b, "A", "B", "m1"),
      ecranMediatrice(e, e.b, e.c!, "B", "C", "m2"),
      ecranCentreIntersection(
        e,
        TITRES["trois-points"][2]!,
        [texte("Le centre Ω est à égale distance de A, B et C : il est sur les deux médiatrices. Calcule ses coordonnées (intersection de "), latex("m_1"), texte(" et "), latex("m_2"), texte(").")],
        [texte("Ici, résous le système formé par "), latex(`m_1\\equiv ${droiteLatex(e.droites.m1!)}`), texte(" et "), latex(`m_2\\equiv ${droiteLatex(e.droites.m2!)}`), texte(".")],
      ),
      ecranRayon(e, false),
      ecranEquation(e),
    ];
  }
  return [
    ecranMediatrice(e, e.a, e.b, "A", "B", "m1"),
    ecranCentreIntersection(
      e,
      TITRES["centre-sur-droite"][1]!,
      [texte("Le centre Ω est à égale distance de A et de B (sur la médiatrice "), latex("m_1"), texte(") et sur la droite d. Calcule ses coordonnées.")],
      [texte("Ici, résous le système formé par "), latex(`m_1\\equiv ${droiteLatex(e.droites.m1!)}`), texte(" et "), latex(droiteNommee("d", e.d!)), texte(".")],
    ),
    ecranRayon(e, false),
    ecranEquation(e),
  ];
}

export function reponseBreveFragments(e: E): Fragments {
  const debut: Fragments = [];
  if (e.droites.m1) debut.push(latex(`m_1\\equiv ${droiteLatex(e.droites.m1)}`), texte(" ; "));
  if (e.droites.m2) debut.push(latex(`m_2\\equiv ${droiteLatex(e.droites.m2)}`), texte(" ; "));
  return [...debut, latex(`${pointLatex(OMEGA, e.centre)},\\ r=${racine(e.r2)}`), texte(" ; "), latex(cercleLatex(e.centre, e.r2)), texte(".")];
}
