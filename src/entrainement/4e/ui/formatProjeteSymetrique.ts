import type { ExerciceProjeteSymetrique } from "../core/projeteSymetrique.types";
import type { ChampNombre, EcranTSD } from "./ecransTransfertSecondDegre";
import {
  COULEURS,
  affineL,
  produitTerme,
  champDroite,
  colonne,
  droiteNommeeL,
  droitePointDirecteur,
  equationL,
  etiquette,
  fenetreAutour,
  figureRepere,
  intersection,
  l,
  n,
  nbp,
  normaliser,
  parametriquesL,
  pgcd,
  plusTerme,
  pointL,
  t,
  type D,
  type Fr,
  type P,
} from "./outilsAnalytiqueLotG";

/**
 * Textes, écrans et figures de gen96 « Projeté orthogonal, symétrique et réflexion » — SOURCE UNIQUE
 * (écran, aides, papier, corrigé). Notation du cours : d ≡ ax + by + c = 0, vecteur directeur
 * (−b ; a) en colonne, perpendiculaire construite avec le vecteur (a ; b), pied H par substitution des
 * équations paramétriques dans l'équation de d (§ 6, méthode « sans formule »).
 */

type E = ExerciceProjeteSymetrique;

export const CONSIGNE_GENERALE_SYMETRIQUE = "Construis la perpendiculaire à d passant par A, trouve son pied H (le projeté orthogonal de A sur d), puis le symétrique A′ de A par rapport à d.";
export const CONSIGNE_GENERALE_REFLEXION = "Trouve le symétrique A′ de A par rapport à d, puis le point d'impact I, sur la droite (A′B), et enfin la longueur du trajet A → I → B.";

export const UNITES: Record<string, { u: string; long: string }> = {
  billard: { u: "dm", long: "décimètres" },
  miroir: { u: "cm", long: "centimètres" },
  mur: { u: "m", long: "mètres" },
};

export function unite(e: E): string {
  return UNITES[e.contexte ?? "billard"]!.u;
}

// ---------------------------------------------------------------------------------------------
// Grandeurs (toutes calculées depuis l'instance)
// ---------------------------------------------------------------------------------------------

/** Perpendiculaire p à d par A (vecteur directeur n⃗ = (a ; b)), forme normalisée. */
export function perpendiculaire(e: E): D {
  return normaliser(droitePointDirecteur(e.A, e.nrm));
}

/** Parallèle à d par A (piège : vecteur directeur de d pris pour p). */
export function paralleleParA(e: E): D {
  return normaliser(droitePointDirecteur(e.A, e.u));
}

/** Vecteur A′B et sa forme réduite (composantes divisées par leur pgcd). */
export function vecteurApB(e: E): { v: P; g: number; w: P } {
  const v = { x: e.B!.x - e.Ap.x, y: e.B!.y - e.Ap.y };
  const g = pgcd(v.x, v.y);
  return { v, g, w: { x: v.x / g, y: v.y / g } };
}

export function droiteApB(e: E): D {
  return normaliser(droitePointDirecteur(e.Ap, vecteurApB(e).w));
}

export function droiteAB(e: E): D {
  return normaliser(droitePointDirecteur(e.A, { x: e.B!.x - e.A.x, y: e.B!.y - e.A.y }));
}

/** Longueur A′B au carré (= (AI + IB)²). */
export function longueurCarre(e: E): number {
  const { v } = vecteurApB(e);
  return v.x * v.x + v.y * v.y;
}

/** Paramètre t du pied H sur p (H = A + t·n⃗) : t = −k. */
export function parametrePied(e: E): number {
  return -e.k;
}

/** « a(x_A + a t) + b(y_A + b t) + c = 0 » : équations paramétriques de p dans celle de d. */
export function substitutionPied(e: E): string {
  return `${produitTerme(e.d.a, affineL(e.A.x, e.nrm.x), true)}${produitTerme(e.d.b, affineL(e.A.y, e.nrm.y))}${plusTerme(e.d.c)}=0`;
}

/** Même chose pour I : équations paramétriques de (A′B) dans celle de d. */
export function substitutionImpact(e: E): string {
  const { w } = vecteurApB(e);
  return `${produitTerme(e.d.a, affineL(e.Ap.x, w.x), true)}${produitTerme(e.d.b, affineL(e.Ap.y, w.y))}${plusTerme(e.d.c)}=0`;
}

/** Paramètre du point I sur (A′B) écrite A′ + t·w⃗. */
export function parametreImpact(e: E): number {
  const { w } = vecteurApB(e);
  return Math.abs(w.x) > 0 ? (e.I!.x - e.Ap.x) / w.x : (e.I!.y - e.Ap.y) / w.y;
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export function enonceFragments(e: E): Fr {
  const dL = l(droiteNommeeL("d", e.d));
  if (e.variante === "symetrique") return [t("On donne le point "), l(pointL("A", e.A)), t(" et la droite "), dL, t(".")];
  const A = l(pointL("A", e.A));
  const B = l(pointL("B", e.B!));
  switch (e.contexte) {
    case "billard":
      return [
        t("Sur une table de billard, on a placé un repère gradué en décimètres. La bande est la droite "),
        dL,
        t(". On veut que la bille "),
        A,
        t(" rebondisse une fois sur la bande, puis touche la bille "),
        B,
        t(", placée du même côté de la bande. Au rebond, la bille repart comme si elle venait du point A′, symétrique de A par rapport à la bande : le point d'impact I est donc sur la droite (A′B)."),
      ];
    case "miroir":
      return [
        t("Sur un banc d'optique muni d'un repère gradué en centimètres, un miroir plan est posé le long de la droite "),
        dL,
        t(". Un rayon lumineux part de la lampe "),
        A,
        t(", se réfléchit sur le miroir et doit atteindre le capteur "),
        B,
        t(", du même côté du miroir. Le rayon réfléchi semble venir du point A′, symétrique de A par rapport au miroir : le point I où le rayon frappe le miroir est donc sur la droite (A′B)."),
      ];
    default:
      return [
        t("Sur un terrain muni d'un repère gradué en mètres, un mur suit la droite "),
        dL,
        t(". Un joueur placé en "),
        A,
        t(" veut faire rebondir le ballon contre le mur pour qu'il arrive à son coéquipier, en "),
        B,
        t(", du même côté du mur. Après le rebond, le ballon file comme s'il venait du point A′, symétrique de A par rapport au mur : le point d'impact I est donc sur la droite (A′B)."),
      ];
  }
}

/** Question(s) papier : une consigne globale (symétrique), deux vraies questions (réflexion). */
export function questionsPapier(e: E): Fr[] {
  if (e.variante === "symetrique") return [[t("Détermine les coordonnées du projeté orthogonal H de A sur d, puis celles du symétrique A′ de A par rapport à d.")]];
  const ou = e.contexte === "billard" ? "Où la bille doit-elle frapper la bande ?" : e.contexte === "miroir" ? "Où le rayon doit-il frapper le miroir ?" : "Où le ballon doit-il frapper le mur ?";
  return [[t(`${ou} Donne les coordonnées du point d'impact I.`)], [t(`Calcule la longueur exacte du trajet A → I → B, en ${UNITES[e.contexte!]!.long}.`)]];
}

export const TITRES_SYMETRIQUE = ["La perpendiculaire", "Le projeté H", "Le symétrique A′"];
export const TITRES_REFLEXION = ["Le symétrique A′", "La droite (A′B)", "Le point d'impact I", "La longueur du trajet"];

export function consignesEcrans(e: E): Fr[] {
  if (e.variante === "symetrique")
    return [
      [t("Écris une équation de la perpendiculaire "), l("p"), t(" à "), l("d"), t(" passant par "), l("A"), t(".")],
      [t("Calcule les coordonnées du projeté orthogonal "), l("H"), t(" de "), l("A"), t(" sur "), l("d"), t(" : le point d'intersection de "), l("p"), t(" et de "), l("d"), t(".")],
      [t("Calcule les coordonnées du symétrique "), l("A'"), t(" de "), l("A"), t(" par rapport à "), l("d"), t(" : "), l("H"), t(" est le milieu de "), l("[AA']"), t(".")],
    ];
  return [
    [t("Calcule les coordonnées du symétrique "), l("A'"), t(" de "), l("A"), t(" par rapport à "), l("d"), t(" (perpendiculaire par "), l("A"), t(", pied "), l("H"), t(", puis "), l("A'"), t(").")],
    [t("Écris une équation de la droite "), l("(A'B)"), t(".")],
    [t("Calcule les coordonnées du point d'impact "), l("I"), t(", intersection de "), l("(A'B)"), t(" et de "), l("d"), t(".")],
    [t("Calcule la longueur exacte du trajet "), l("A\\to I\\to B"), t(`, en ${UNITES[e.contexte!]!.long}.`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export const reponsePerpendiculaire = (e: E): Fr => [l(droiteNommeeL("p", perpendiculaire(e)))];
export const reponseH = (e: E): Fr => [l(pointL("H", e.H))];
export const reponseAp = (e: E): Fr => [l(pointL("A'", e.Ap))];
export const reponseApB = (e: E): Fr => [l(`(A'B)\\equiv ${equationL(droiteApB(e))}`)];
export const reponseI = (e: E): Fr => [l(pointL("I", e.I!))];
export const reponseLongueur = (e: E): Fr => [l(`AI+IB=${n(Math.sqrt(longueurCarre(e)))}\\ \\text{${unite(e)}}`)];

// ---------------------------------------------------------------------------------------------
// Figures (papier = écran ; aucune valeur cherchée dans l'énoncé)
// ---------------------------------------------------------------------------------------------

function fenetre(e: E) {
  const pts = [e.A, e.Ap, e.H, { x: 0, y: 0 }];
  if (e.B) pts.push(e.B, e.I!);
  return fenetreAutour(pts);
}

/** Énoncé de la réflexion : la droite d, A et B seulement (ni A′, ni I). */
export function figureEnonce(e: E): string {
  if (e.variante !== "reflexion") return "";
  const nom = e.contexte === "billard" ? "bande d" : e.contexte === "miroir" ? "miroir d" : "mur d";
  return figureRepere({
    fenetre: fenetre(e),
    droites: [{ d: e.d, couleur: COULEURS.accent, epaisseur: 3, label: nom }],
    points: [
      { P: e.A, label: "A", position: "ne" },
      { P: e.B!, label: "B", position: "ne" },
    ],
  });
}

/** Corrigé : perpendiculaire en pointillés, H, A′ (et le trajet A → I → B pour la réflexion). */
export function figureCorrige(e: E): string {
  const p = perpendiculaire(e);
  const points = [
    { P: e.A, label: etiquette("A", e.A), position: "ne" as const },
    { P: e.H, label: "H", position: "so" as const, couleur: COULEURS.gris },
    { P: e.Ap, label: etiquette("A′", e.Ap), position: "ne" as const, couleur: COULEURS.bleu },
  ];
  if (e.variante === "symetrique") {
    points[1] = { P: e.H, label: etiquette("H", e.H), position: "so" as const, couleur: COULEURS.vert };
    return figureRepere({ fenetre: fenetre(e), droites: [{ d: e.d, label: "d" }, { d: p, couleur: COULEURS.gris, pointille: true, epaisseur: 1.4, label: "p" }], points });
  }
  return figureRepere({
    fenetre: fenetre(e),
    droites: [
      { d: e.d, epaisseur: 3, label: "d" },
      { d: p, couleur: COULEURS.gris, pointille: true, epaisseur: 1.2 },
    ],
    segments: [
      { A: e.Ap, B: e.I!, couleur: COULEURS.bleu, pointille: true },
      { A: e.A, B: e.I!, couleur: COULEURS.vert, fleche: true, epaisseur: 2 },
      { A: e.I!, B: e.B!, couleur: COULEURS.vert, fleche: true, epaisseur: 2 },
    ],
    points: [...points, { P: e.B!, label: etiquette("B", e.B!), position: "ne" as const }, { P: e.I!, label: etiquette("I", e.I!), position: "se" as const, couleur: COULEURS.vert }],
  });
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

function champsPoint(nom: string, cible: P, pieges: { P: P; message: string }[], messageSiFaux: string): ChampNombre[] {
  const champ = (coord: "x" | "y"): ChampNombre => ({
    type: "nombre",
    id: `${coord}${nom}`,
    libelle: [l(`${coord}_{${nom}}=`)],
    cible: cible[coord],
    pieges: pieges
      .map((p) => ({ valeur: p.P[coord], message: p.message }))
      .filter((p, i, tab) => Math.abs(p.valeur - cible[coord]) > 1e-9 && tab.findIndex((q) => Math.abs(q.valeur - p.valeur) < 1e-9) === i),
    messageSiFaux,
  });
  return [champ("x"), champ("y")];
}

const aideDirecteur = (): Fr => [
  t("Un vecteur directeur de "),
  l("d\\equiv ax+by+c=0"),
  t(" est "),
  l(colonne("-b", "a")),
  t(" ; un vecteur qui lui est perpendiculaire est "),
  l(colonne("a", "b")),
  t(", lu directement sur l'équation : c'est un vecteur directeur de la perpendiculaire."),
];

function ecranPerpendiculaire(e: E): EcranTSD {
  const p = perpendiculaire(e);
  return {
    type: "champs",
    titre: TITRES_SYMETRIQUE[0]!,
    consigne: consignesEcrans(e)[0]!,
    champs: [
      champDroite({
        id: "p",
        libelle: [l("p\\equiv")],
        cible: p,
        pieges: [
          { droite: paralleleParA(e), message: "Cette droite passe bien par $A$, mais elle est parallèle à $d$ : tu as pris le vecteur directeur de $d$. Pour la perpendiculaire, prends le vecteur $\\begin{pmatrix}a\\\\b\\end{pmatrix}$ lu sur l'équation de $d$." },
          { droite: e.d, message: "C'est l'équation de $d$ elle-même : la perpendiculaire passe par $A$ et coupe $d$ à angle droit." },
        ],
        point: { P: e.A, message: "Ta droite passe par $A$, mais elle n'est pas perpendiculaire à $d$ : son vecteur directeur doit être $\\begin{pmatrix}a\\\\b\\end{pmatrix}$." },
        messageDirection: "Ta droite est bien perpendiculaire à $d$, mais elle ne passe pas par $A$ : remplace les coordonnées de $A$ pour trouver le terme constant.",
        messageSiFaux: "La perpendiculaire passe par $A$ et a pour vecteur directeur $\\begin{pmatrix}a\\\\b\\end{pmatrix}$ (coefficients de $x$ et de $y$ dans l'équation de $d$).",
      }),
    ],
    aides: [aideDirecteur(), [t("Ici, "), l(`\\vec{n}=${colonne(e.d.a, e.d.b)}`), t(" et "), l(`p`), t(" passe par "), l(pointL("A", e.A)), t(" : "), l(`p\\equiv ${parametriquesL(e.A, e.nrm)}`), t(". Écris-en une équation cartésienne.")]],
    reponse: reponsePerpendiculaire(e),
  };
}

function ecranProjete(e: E): EcranTSD {
  const s = e.d.a * e.d.a + e.d.b * e.d.b;
  return {
    type: "champs",
    titre: TITRES_SYMETRIQUE[1]!,
    consigne: consignesEcrans(e)[1]!,
    champs: champsPoint(
      "H",
      e.H,
      [
        { P: { x: e.H.y, y: e.H.x }, message: "Tes coordonnées semblent inversées : $x_H$ d'abord, $y_H$ ensuite." },
        { P: { x: e.A.x + e.k * e.nrm.x, y: e.A.y + e.k * e.nrm.y }, message: "Erreur de signe sur $t$ : ton point est de l'autre côté de $A$. Refais la résolution de l'équation en $t$." },
      ],
      "Remplace $x$ et $y$ des équations paramétriques de $p$ dans l'équation de $d$ : tu obtiens $t$, puis $H$.",
    ),
    aides: [
      [t("H est sur "), l("p"), t(" et sur "), l("d"), t(" : remplace "), l("x"), t(" et "), l("y"), t(" des équations paramétriques de "), l("p"), t(" dans l'équation de "), l("d"), t(" ; on obtient une équation en "), l("t"), t(".")],
      [t("Ici : "), l(substitutionPied(e)), t(" : le coefficient de "), l("t"), t(" vaut "), l(`a^2+b^2=${s}`), t(".")],
    ],
    reponse: reponseH(e),
  };
}

function piegesSymetrique(e: E): { P: P; message: string }[] {
  return [
    { P: { x: 2 * e.A.x - e.H.x, y: 2 * e.A.y - e.H.y }, message: "Tu as calculé $2A-H$ : c'est $H$ le milieu de $[AA']$, donc $x_{A'}=2x_H-x_A$." },
    { P: e.H, message: "C'est le projeté $H$ : le symétrique est de l'autre côté de $d$, à la même distance que $A$." },
    { P: { x: (e.A.x + e.H.x) / 2, y: (e.A.y + e.H.y) / 2 }, message: "C'est le milieu de $[AH]$. Ici, c'est $H$ le milieu de $[AA']$." },
  ];
}

function ecranSymetrique(e: E, titre: string, consigne: Fr, avecConstruction: boolean): EcranTSD {
  const s = e.d.a * e.d.a + e.d.b * e.d.b;
  const aides: Fr[] = avecConstruction
    ? [
        [t("Construis la perpendiculaire à "), l("d"), t(" par "), l("A"), t(" (vecteur directeur "), l(colonne("a", "b")), t("), trouve son pied "), l("H"), t(" sur "), l("d"), t(", puis "), l("A'"), t(" : "), l("H"), t(" est le milieu de "), l("[AA']"), t(".")],
        [t("Ici : "), l(`p\\equiv ${parametriquesL(e.A, e.nrm)}`), t(" ; dans l'équation de "), l("d"), t(", le coefficient de "), l("t"), t(" vaut "), l(`a^2+b^2=${s}`), t(". Ensuite : "), l("x_{A'}=2x_H-x_A"), t(".")],
      ]
    : [
        [l("H"), t(" est le milieu de "), l("[AA']"), t(" : "), l("x_H=\\dfrac{x_A+x_{A'}}{2}"), t(" et "), l("y_H=\\dfrac{y_A+y_{A'}}{2}"), t(".")],
        [t("On isole l'inconnue : "), l("x_{A'}=2x_H-x_A"), t(" et "), l("y_{A'}=2y_H-y_A"), t(" ; remplace par les coordonnées de "), l("H"), t(" et de "), l("A"), t(".")],
      ];
  return {
    type: "champs",
    titre,
    consigne,
    champs: champsPoint("A'", e.Ap, piegesSymetrique(e), avecConstruction ? "Perpendiculaire par $A$, pied $H$ sur $d$, puis $A'$ tel que $H$ soit le milieu de $[AA']$." : "Utilise $x_{A'}=2x_H-x_A$ et $y_{A'}=2y_H-y_A$."),
    aides,
    reponse: reponseAp(e),
    figureApres: e.variante === "symetrique" ? figureCorrige(e) : undefined,
  };
}

function ecranDroiteApB(e: E): EcranTSD {
  const { v } = vecteurApB(e);
  return {
    type: "champs",
    titre: TITRES_REFLEXION[1]!,
    consigne: consignesEcrans(e)[1]!,
    champs: [
      champDroite({
        id: "apb",
        libelle: [l("(A'B)\\equiv")],
        cible: droiteApB(e),
        pieges: [{ droite: droiteAB(e), message: "C'est la droite $(AB)$ : elle ne touche pas la bande au bon endroit. Le trajet réfléchi est aligné avec $A'$, pas avec $A$." }],
        point: { P: e.B!, message: "Ta droite passe par $B$, mais pas par $A'$ : son vecteur directeur doit être $\\vec{A'B}$." },
        messageSiFaux: "La droite passe par $A'$ et par $B$ : prends $\\vec{A'B}$ comme vecteur directeur.",
      }),
    ],
    aides: [
      [t("Une droite passant par deux points a pour vecteur directeur le vecteur qui les relie : ici "), l("\\vec{A'B}"), t(".")],
      [t("Ici : "), l(`\\vec{A'B}=${colonne(v.x, v.y)}`), t(" ; écris l'équation de la droite qui passe par "), l("B"), t(" avec ce vecteur directeur (tu peux d'abord le simplifier).")],
    ],
    reponse: reponseApB(e),
  };
}

function ecranImpact(e: E): EcranTSD {
  const AB = droiteAB(e);
  const faux = intersection(AB, e.d);
  const pieges: { P: P; message: string }[] = [{ P: e.H, message: "C'est le projeté $H$ de $A$ : la bille n'arrive pas en $B$ en visant ce point. Le point d'impact est sur $(A'B)$." }];
  if (faux) pieges.push({ P: faux, message: "C'est l'intersection de $(AB)$ et de $d$ : le point d'impact est sur $(A'B)$." });
  return {
    type: "champs",
    titre: TITRES_REFLEXION[2]!,
    consigne: consignesEcrans(e)[2]!,
    champs: champsPoint("I", e.I!, pieges, "Résous le système formé par l'équation de $(A'B)$ et celle de $d$."),
    aides: [
      [t("I est sur "), l("(A'B)"), t(" et sur "), l("d"), t(" : résous le système des deux équations (substitution ou combinaison), comme pour l'intersection de deux droites.")],
      [t("Ici : "), l(`\\begin{cases}${equationL(droiteApB(e))}\\\\${equationL(e.d)}\\end{cases}`), t(".")],
    ],
    reponse: reponseI(e),
  };
}

function ecranLongueur(e: E): EcranTSD {
  const { v } = vecteurApB(e);
  const AI = Math.sqrt((e.I!.x - e.A.x) ** 2 + (e.I!.y - e.A.y) ** 2);
  const IB = Math.sqrt((e.B!.x - e.I!.x) ** 2 + (e.B!.y - e.I!.y) ** 2);
  const AB = Math.sqrt((e.B!.x - e.A.x) ** 2 + (e.B!.y - e.A.y) ** 2);
  const L = Math.sqrt(longueurCarre(e));
  const pieges = [
    { valeur: AB, message: "C'est la distance $AB$ en ligne droite : le trajet passe par $I$, sur la bande." },
    { valeur: AI, message: "C'est seulement la longueur $AI$ : il faut ajouter $IB$." },
    { valeur: IB, message: "C'est seulement la longueur $IB$ : il faut ajouter $AI$." },
    { valeur: v.x * v.x + v.y * v.y, message: "Tu as oublié la racine carrée : la longueur est $\\sqrt{x^2+y^2}$." },
  ].filter((p, i, tab) => Math.abs(p.valeur - L) > 1e-9 && tab.findIndex((q) => Math.abs(q.valeur - p.valeur) < 1e-9) === i);
  return {
    type: "champs",
    titre: TITRES_REFLEXION[3]!,
    consigne: consignesEcrans(e)[3]!,
    champs: [{ type: "nombre", id: "L", libelle: [l("AI+IB=")], unite: unite(e), cible: L, pieges, messageSiFaux: "La symétrie conserve les longueurs : $AI=A'I$, donc $AI+IB=A'B$. Calcule la norme de $\\vec{A'B}$." }],
    aides: [
      [t("La symétrie conserve les longueurs : "), l("AI=A'I"), t(". Comme "), l("A'"), t(", "), l("I"), t(" et "), l("B"), t(" sont alignés, "), l("AI+IB=A'I+IB=A'B"), t(".")],
      [t("Ici : "), l(`\\vec{A'B}=${colonne(v.x, v.y)}`), t(" ; sa norme est "), l("\\sqrt{x^2+y^2}"), t(", à simplifier si possible.")],
    ],
    reponse: reponseLongueur(e),
    figureApres: figureCorrige(e),
  };
}

export function ecrans(e: E): EcranTSD[] {
  if (e.variante === "symetrique") return [ecranPerpendiculaire(e), ecranProjete(e), ecranSymetrique(e, TITRES_SYMETRIQUE[2]!, consignesEcrans(e)[2]!, false)];
  return [ecranSymetrique(e, TITRES_REFLEXION[0]!, consignesEcrans(e)[0]!, true), ecranDroiteApB(e), ecranImpact(e), ecranLongueur(e)];
}

export { nbp };
