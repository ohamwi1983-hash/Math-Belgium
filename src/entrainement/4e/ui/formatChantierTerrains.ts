import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { Affine, ExerciceChantierTerrains, OutilVectoriel, PointPlan, SituationChantier } from "../core/chantierTerrains.types";
import { OUTIL_ATTENDU, demiVecteur, equationPiquet, lettreInconnue, point, valeurCritere, valeurInconnue, vecteursUtiles, type VecteurUtile } from "../moteur/modeleChantierTerrains";

/**
 * Textes de gen88 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; signe moins typographique. Les mots du contexte ne nomment JAMAIS
 * l'outil (« colinéaire », « orthogonal », « milieu » n'apparaissent pas dans l'énoncé) : c'est
 * l'élève qui traduit « alignés », « d'équerre », « parallèles », « à mi-chemin »… (TRANSFÉRER).
 */

export const NOMBRE_ECRANS = 4;
export const TITRES_ECRANS = ["L'outil adapté", "Les vecteurs utiles", "Le critère", "La réponse"];

export const CONSIGNE_GENERALE = "Plan d'un terrain, repéré en mètres. Lis la situation, puis réponds à la question à l'aide du calcul vectoriel.";

// ---------------------------------------------------------------------------------------------
// Nombres, points, vecteurs
// ---------------------------------------------------------------------------------------------

export function nombreLatex(n: number): string {
  const arrondi = Math.round(n * 1e9) / 1e9;
  return String(arrondi === 0 ? 0 : arrondi).replace(".", "{,}");
}

/** Facteur dans un produit : parenthèses autour d'un négatif. */
function facteur(n: number): string {
  return n < 0 ? `(${nombreLatex(n)})` : nombreLatex(n);
}

export function pointLatex(p: PointPlan): string {
  return `${p.nom}(${nombreLatex(p.x)}\\,;\\,${nombreLatex(p.y)})`;
}

export function vecLatex(de: string, a: string): string {
  return `\\vec{${de}${a}}`;
}

export function affineLatex(a: Affine, lettre: string | null): string {
  if (a.coef === 0 || lettre === null) return nombreLatex(a.cst);
  const terme = a.coef === 1 ? lettre : a.coef === -1 ? `-${lettre}` : `${nombreLatex(a.coef)}${lettre}`;
  if (a.cst === 0) return terme;
  return `${terme} ${a.cst > 0 ? "+" : "-"} ${nombreLatex(Math.abs(a.cst))}`;
}

export function colonneLatex(x: string, y: string): string {
  return `\\begin{pmatrix} ${x} \\\\ ${y} \\end{pmatrix}`;
}

export function vecteurAvecComposantesLatex(v: VecteurUtile, lettre: string | null): string {
  return `${vecLatex(v.origine, v.extremite)}${colonneLatex(affineLatex(v.x, lettre), affineLatex(v.y, lettre))}`;
}

/** Composantes « arrivée moins départ », non calculées : (9 − 2 ; 7 − 3). */
export function soustractionLatex(e: ExerciceChantierTerrains, v: VecteurUtile): string {
  const p = point(e, v.origine);
  const lettre = lettreInconnue(e);
  const q = v.extremite === "P" && e.ligne ? { x: e.ligne.axe === "x" ? nombreLatex(e.ligne.valeur) : lettre!, y: e.ligne.axe === "y" ? nombreLatex(e.ligne.valeur) : lettre! } : { x: nombreLatex(point(e, v.extremite).x), y: nombreLatex(point(e, v.extremite).y) };
  return `${vecLatex(v.origine, v.extremite)}${colonneLatex(`${q.x} - ${facteur(p.x)}`, `${q.y} - ${facteur(p.y)}`)}`;
}

// ---------------------------------------------------------------------------------------------
// Contextes
// ---------------------------------------------------------------------------------------------

/** Objets dessinés sur le plan (vue de dessus). */
export type ObjetPlan = "piquet" | "arbre" | "poteau" | "dalle" | "terrain" | "mur" | "vigne" | "route" | "bordure" | "maison" | "banc" | "enclos" | "parterre";

interface Contexte {
  objet: ObjetPlan;
  recit: string;
  question: string;
  /** Sujet des phrases-réponses (« les trois piquets », « le coin A de la dalle »…). */
  sujet: string;
}

const CONTEXTES: Record<SituationChantier, Contexte[]> = {
  alignement: [
    { objet: "piquet", recit: "Pour tendre le cordeau d'une future clôture, un jardinier a planté trois piquets A, B et C.", question: "Les trois piquets sont-ils alignés ?", sujet: "les trois piquets" },
    { objet: "arbre", recit: "Une commune aménage une allée bordée d'arbres. Trois arbres A, B et C sont déjà plantés.", question: "Ces trois arbres sont-ils alignés ?", sujet: "les trois arbres" },
    { objet: "poteau", recit: "Un électricien doit tendre un câble entre trois poteaux A, B et C.", question: "Les trois poteaux sont-ils alignés ?", sujet: "les trois poteaux" },
  ],
  equerre: [
    { objet: "dalle", recit: "Un maçon coffre une dalle de terrasse. Depuis le coin A, un bord de la dalle va vers B, l'autre vers C.", question: "Le coin A de la dalle est-il d'équerre ?", sujet: "le coin A de la dalle" },
    { objet: "terrain", recit: "Pour tracer un terrain de football, on a marqué le coin A ; la ligne de but part vers B et la ligne de touche vers C.", question: "Le coin A du terrain est-il d'équerre ?", sujet: "le coin A du terrain" },
    { objet: "mur", recit: "Les fondations d'un abri de jardin partent du coin A : un mur va de A à B, l'autre de A à C.", question: "Le coin A de l'abri est-il d'équerre ?", sujet: "le coin A de l'abri" },
  ],
  paralleles: [
    { objet: "vigne", recit: "Dans un vignoble, une première rangée de vigne passe par les ceps A et B, une seconde par les ceps C et D.", question: "Les deux rangées de vigne sont-elles parallèles ?", sujet: "les deux rangées" },
    { objet: "route", recit: "Deux routes rectilignes traversent le terrain : la première passe par les bornes A et B, la seconde par les bornes C et D.", question: "Les deux routes sont-elles parallèles ?", sujet: "les deux routes" },
    { objet: "bordure", recit: "Les deux bordures d'une allée sont rectilignes : l'une passe par les repères A et B, l'autre par les repères C et D.", question: "Les deux bordures sont-elles parallèles ?", sujet: "les deux bordures" },
  ],
  milieu: [
    { objet: "maison", recit: "Deux amis habitent les maisons A et B, reliées par un chemin en ligne droite. Ils se donnent rendez-vous au point M du chemin situé à mi-chemin entre leurs deux maisons.", question: "Où se trouve le point de rendez-vous M ?", sujet: "le point de rendez-vous" },
    { objet: "banc", recit: "Dans un parc, une allée droite relie le banc A au banc B. On veut installer un lampadaire L sur l'allée, à mi-chemin entre les deux bancs.", question: "Où installer le lampadaire L ?", sujet: "le lampadaire" },
  ],
  enclos: [
    { objet: "enclos", recit: "Un éleveur construit un enclos à moutons en forme de parallélogramme ABCD. Les piquets des coins A, B et C sont déjà plantés.", question: "Où planter le piquet du coin D ?", sujet: "le coin D" },
    { objet: "parterre", recit: "Un jardinier dessine un parterre de fleurs en forme de parallélogramme ABCD ; les bornes A, B et C sont déjà posées.", question: "Où poser la borne D ?", sujet: "la borne D" },
  ],
  piquet: [
    { objet: "piquet", recit: "Deux piquets A et B sont déjà plantés. On veut planter un troisième piquet P le long de la clôture du terrain, pour tendre un même cordeau à travers A, B et P.", question: "Où planter le piquet P pour qu'il soit aligné avec A et B ?", sujet: "le piquet P" },
    { objet: "arbre", recit: "Deux arbres A et B sont déjà plantés. Un troisième arbre P doit être planté au bord du chemin, dans l'alignement des deux premiers.", question: "Où planter l'arbre P pour qu'il soit aligné avec A et B ?", sujet: "l'arbre P" },
  ],
};

export function contexte(e: ExerciceChantierTerrains): Contexte {
  return CONTEXTES[e.situation][e.contexte]!;
}

/** Description de la ligne du piquet : « ses points ont tous pour abscisse 7 ». */
function ligneFragments(e: ExerciceChantierTerrains): FragmentConsigne[] {
  const l = e.ligne!;
  const nom = contexte(e).objet === "arbre" ? "Le chemin" : "La clôture";
  const p = l.axe === "x" ? `P(${nombreLatex(l.valeur)}\\,;\\,y)` : `P(x\\,;\\,${nombreLatex(l.valeur)})`;
  return [texte(`${nom} est rectiligne : tous ses points ont pour ${l.axe === "x" ? "abscisse" : "ordonnée"} `), latex(nombreLatex(l.valeur)), texte(". On note donc "), latex(p), texte(".")];
}

/** Récit + données (coordonnées) — sans la question. */
export function recitFragments(e: ExerciceChantierTerrains): FragmentConsigne[] {
  const c = contexte(e);
  const donnees: FragmentConsigne[] = [];
  e.points.forEach((p, i) => {
    if (i > 0) donnees.push(texte(i === e.points.length - 1 ? " et " : ", "));
    donnees.push(latex(pointLatex(p)));
  });
  return [texte(`${c.recit} Sur le plan : `), ...donnees, texte("."), ...(e.ligne ? [texte(" "), ...ligneFragments(e)] : [])];
}

export function questionFragments(e: ExerciceChantierTerrains): FragmentConsigne[] {
  return [texte(contexte(e).question)];
}

export function consignePapier(e: ExerciceChantierTerrains): FragmentConsigne[] {
  const c = contexte(e);
  if (e.cherche) return [texte(`${c.question} Donne ses coordonnées et justifie par un calcul vectoriel.`)];
  return [texte(`${c.question} Justifie ta réponse par un calcul vectoriel.`)];
}

// ---------------------------------------------------------------------------------------------
// Écran 1 — l'outil
// ---------------------------------------------------------------------------------------------

export const OUTILS: { id: OutilVectoriel; libelle: string }[] = [
  { id: "colinearite", libelle: "Colinéarité de deux vecteurs (déterminant nul)" },
  { id: "orthogonalite", libelle: "Orthogonalité de deux vecteurs (produit scalaire nul)" },
  { id: "distance", libelle: "Distance entre deux points (norme d'un vecteur)" },
  { id: "milieu", libelle: "Milieu d'un segment" },
  { id: "egalite", libelle: "Égalité de deux vecteurs (mêmes composantes)" },
];

export function indiceOutilAttendu(e: ExerciceChantierTerrains): number {
  return OUTILS.findIndex((o) => o.id === OUTIL_ATTENDU[e.situation]);
}

/** Pourquoi cet outil : le mot du contexte traduit en relation vectorielle (corrigé). */
export function traductionOutil(e: ExerciceChantierTerrains): FragmentConsigne[] {
  switch (e.situation) {
    case "alignement":
      return [texte("« Alignés » : les trois points sont sur une même droite, donc "), latex(vecLatex("A", "B")), texte(" et "), latex(vecLatex("A", "C")), texte(" ont la même direction — ils sont colinéaires (déterminant nul).")];
    case "equerre":
      return [texte("« D'équerre » : les deux bords forment un angle droit en A, donc "), latex(vecLatex("A", "B")), texte(" et "), latex(vecLatex("A", "C")), texte(" sont orthogonaux (produit scalaire nul).")];
    case "paralleles":
      return [texte("« Parallèles » : deux droites parallèles ont des vecteurs directeurs de même direction, donc "), latex(vecLatex("A", "B")), texte(" et "), latex(vecLatex("C", "D")), texte(" doivent être colinéaires (déterminant nul).")];
    case "milieu":
      return [texte(`« À mi-chemin » sur un chemin droit : ${e.cherche!.nom} est le milieu du segment [AB], donc `), latex(`${vecLatex("A", e.cherche!.nom)} = \\frac{1}{2}\\,${vecLatex("A", "B")}`), texte(".")];
    case "enclos":
      return [texte("« Parallélogramme ABCD » : les côtés opposés [AB] et [DC] sont parallèles, de même longueur et de même sens — c'est une égalité de vecteurs.")];
    case "piquet":
      return [texte("« Aligné avec A et B » : "), latex(vecLatex("A", "B")), texte(" et "), latex(vecLatex("A", "P")), texte(" doivent être colinéaires (déterminant nul).")];
  }
}

function aidesOutil(e: ExerciceChantierTerrains): FragmentConsigne[][] {
  const premiere = [texte("Repère le mot qui porte la question (« alignés », « d'équerre », « parallèles », « à mi-chemin », « parallélogramme »…) et demande-toi quelle relation entre vecteurs il décrit.")];
  const seconde: Record<SituationChantier, string> = {
    alignement: "Des points alignés sont sur une même droite : les vecteurs qui les relient ont alors la même direction.",
    equerre: "Un coin d'équerre forme un angle droit entre les deux bords qui en partent.",
    paralleles: "Deux droites parallèles ont des vecteurs directeurs de même direction.",
    milieu: "Le point cherché coupe le segment [AB] en deux moitiés égales.",
    enclos: "Dans un parallélogramme, deux côtés opposés sont parallèles, de même longueur et parcourus dans le même sens.",
    piquet: "Le point P doit se trouver sur la même droite que A et B.",
  };
  return [premiere, [texte(seconde[e.situation])]];
}

// ---------------------------------------------------------------------------------------------
// Écrans 2 à 4
// ---------------------------------------------------------------------------------------------

export type Attendu =
  /** Nombre (coef = 0) ou expression du premier degré en `lettre`. `signe` : le déterminant —
   * l'opposé est signalé (ordre des vecteurs inversé). */
  | { type: "valeur"; cible: Affine; lettre: "x" | "y" | null; signe?: boolean }
  /** Équation équivalente à `cible = 0` (tout multiple non nul, toute écriture). */
  | { type: "equation"; cible: Affine; lettre: "x" | "y" };

export interface Champ {
  id: string;
  libelle: FragmentConsigne[];
  attendu: Attendu;
}

export type Ecran =
  | { type: "choix"; titre: string; consigne: FragmentConsigne[]; options: FragmentConsigne[][]; bonne: number; aides: FragmentConsigne[][]; messageFaux: string }
  | { type: "champs"; titre: string; consigne: FragmentConsigne[]; champs: Champ[]; aides: FragmentConsigne[][]; indication: string; reponseLatex: string };

function champsVecteurs(e: ExerciceChantierTerrains): Champ[] {
  const lettre = lettreInconnue(e);
  return vecteursUtiles(e).flatMap((v) => {
    const nom = `${v.origine}${v.extremite}`;
    return [
      { id: `x${nom}`, libelle: [latex(`x_{${vecLatex(v.origine, v.extremite)}} =`)], attendu: { type: "valeur" as const, cible: v.x, lettre } },
      { id: `y${nom}`, libelle: [latex(`y_{${vecLatex(v.origine, v.extremite)}} =`)], attendu: { type: "valeur" as const, cible: v.y, lettre } },
    ];
  });
}

function nomsVecteurs(e: ExerciceChantierTerrains): FragmentConsigne[] {
  const v = vecteursUtiles(e);
  if (v.length === 1) return [texte("du vecteur "), latex(vecLatex(v[0]!.origine, v[0]!.extremite))];
  return [texte("des vecteurs "), latex(vecLatex(v[0]!.origine, v[0]!.extremite)), texte(" et "), latex(vecLatex(v[1]!.origine, v[1]!.extremite))];
}

export function vecteursLatex(e: ExerciceChantierTerrains): string {
  const lettre = lettreInconnue(e);
  return vecteursUtiles(e).map((v) => vecteurAvecComposantesLatex(v, lettre)).join(" \\qquad ");
}

function ecranVecteurs(e: ExerciceChantierTerrains): Ecran {
  const consigne: FragmentConsigne[] = [texte("Calcule les composantes "), ...nomsVecteurs(e), texte(".")];
  if (e.situation === "piquet") consigne.push(texte(` La coordonnée inconnue de P reste la lettre ${lettreInconnue(e)}.`));
  const premier = vecteursUtiles(e)[0]!;
  return {
    type: "champs",
    titre: TITRES_ECRANS[1]!,
    consigne,
    champs: champsVecteurs(e),
    aides: [
      [texte("Composantes d'un vecteur : arrivée moins départ :"), latex(`${vecLatex("A", "B")}${colonneLatex("x_B - x_A", "y_B - y_A")}`)],
      [texte("Pour le premier vecteur, cela donne :"), latex(soustractionLatex(e, premier)), texte(vecteursUtiles(e).length > 1 ? " — même démarche pour l'autre vecteur." : "")],
    ],
    indication: e.situation === "piquet" ? `Un nombre, ou une expression avec ${lettreInconnue(e)} comme ${lettreInconnue(e)} − 3.` : "Un nombre entier, positif ou négatif.",
    reponseLatex: vecteursLatex(e),
  };
}

export function formuleCritereLatex(e: ExerciceChantierTerrains): string {
  const [u, v] = vecteursUtiles(e);
  const nu = vecLatex(u!.origine, u!.extremite);
  const nv = vecLatex(v!.origine, v!.extremite);
  if (e.situation === "equerre") return `x_{${nu}} \\cdot x_{${nv}} + y_{${nu}} \\cdot y_{${nv}}`;
  return `x_{${nu}} \\cdot y_{${nv}} - y_{${nu}} \\cdot x_{${nv}}`;
}

/** Critère avec les nombres, non calculé : 7 × 5 − 4 × 9. */
export function critereSubstitueLatex(e: ExerciceChantierTerrains): string {
  const [u, v] = vecteursUtiles(e);
  const lettre = lettreInconnue(e);
  const f = (a: Affine) => (a.coef !== 0 ? `(${affineLatex(a, lettre)})` : facteur(a.cst));
  if (e.situation === "equerre") return `${f(u!.x)} \\times ${f(v!.x)} + ${f(u!.y)} \\times ${f(v!.y)}`;
  return `${f(u!.x)} \\times ${f(v!.y)} - ${f(u!.y)} \\times ${f(v!.x)}`;
}

/** Calcul complet du critère : 7 × 5 − 4 × 9 = 35 − 36 = −1. */
export function critereCalculLatex(e: ExerciceChantierTerrains): string {
  const [u, v] = vecteursUtiles(e);
  const p1 = e.situation === "equerre" ? u!.x.cst * v!.x.cst : u!.x.cst * v!.y.cst;
  const p2 = e.situation === "equerre" ? u!.y.cst * v!.y.cst : u!.y.cst * v!.x.cst;
  const milieu = e.situation === "equerre" ? `${nombreLatex(p1)} ${p2 < 0 ? "-" : "+"} ${nombreLatex(Math.abs(p2))}` : `${nombreLatex(p1)} ${p2 < 0 ? "+" : "-"} ${nombreLatex(Math.abs(p2))}`;
  return `${critereSubstitueLatex(e)} = ${milieu} = ${nombreLatex(valeurCritere(e))}`;
}

export function nomCritere(e: ExerciceChantierTerrains): string {
  return e.situation === "equerre" ? "produit scalaire" : "déterminant";
}

export function equationLatex(e: ExerciceChantierTerrains): string {
  return `${affineLatex(equationPiquet(e), lettreInconnue(e))} = 0`;
}

/** Les quatre égalités proposées pour l'enclos (indice 0 = la bonne). */
const EGALITES = [
  `${vecLatex("A", "B")} = ${vecLatex("D", "C")}`,
  `${vecLatex("A", "B")} = ${vecLatex("C", "D")}`,
  `${vecLatex("A", "D")} = ${vecLatex("C", "B")}`,
  `${vecLatex("A", "C")} = ${vecLatex("B", "D")}`,
];

export const EGALITE_ENCLOS = EGALITES[0]!;

function ecranCritere(e: ExerciceChantierTerrains): Ecran {
  const titre = TITRES_ECRANS[2]!;
  const [u, v] = vecteursUtiles(e);
  if (e.situation === "enclos") {
    return {
      type: "choix",
      titre,
      consigne: [texte("Quelle égalité de vecteurs traduit « ABCD est un parallélogramme » ?")],
      options: e.ordreOptions.map((i) => [latex(EGALITES[i]!)]),
      bonne: e.ordreOptions.indexOf(0),
      aides: [
        [texte("Dans un parallélogramme ABCD, on parcourt les sommets dans l'ordre : A, puis B, puis C, puis D.")],
        [texte("Deux vecteurs égaux ont même direction, même longueur et même sens : suis le côté [AB] de A vers B, puis le côté opposé dans le même sens.")],
      ],
      messageFaux: "Ce n'est pas la bonne égalité.",
    };
  }
  if (e.situation === "milieu") {
    const nom = e.cherche!.nom;
    const am = demiVecteur(e);
    return {
      type: "champs",
      titre,
      consigne: [texte("Calcule les composantes du vecteur "), latex(vecLatex("A", nom)), texte(".")],
      champs: [
        { id: "xAM", libelle: [latex(`x_{${vecLatex("A", nom)}} =`)], attendu: { type: "valeur", cible: { coef: 0, cst: am.x }, lettre: null } },
        { id: "yAM", libelle: [latex(`y_{${vecLatex("A", nom)}} =`)], attendu: { type: "valeur", cible: { coef: 0, cst: am.y }, lettre: null } },
      ],
      aides: [
        [texte(`Le point ${nom} est à mi-chemin sur le segment [AB] :`), latex(`${vecLatex("A", nom)} = \\frac{1}{2}\\,${vecLatex("A", "B")}`)],
        [texte("Avec les composantes de l'étape précédente :"), latex(`${vecLatex("A", nom)}${colonneLatex(`\\frac{1}{2} \\times ${facteur(u!.x.cst)}`, `\\frac{1}{2} \\times ${facteur(u!.y.cst)}`)}`)],
      ],
      indication: "Un nombre décimal (virgule) ou une fraction comme 7/2.",
      reponseLatex: `${vecLatex("A", nom)}${colonneLatex(nombreLatex(am.x), nombreLatex(am.y))}`,
    };
  }
  if (e.situation === "piquet") {
    const lettre = lettreInconnue(e)!;
    return {
      type: "champs",
      titre,
      consigne: [texte(`Écris la condition d'alignement de A, B et P sous la forme d'une équation d'inconnue ${lettre}.`)],
      champs: [{ id: "equation", libelle: [texte("Équation :")], attendu: { type: "equation", cible: equationPiquet(e), lettre } }],
      aides: [
        [texte("A, B et P sont alignés quand le déterminant de "), latex(vecLatex("A", "B")), texte(" et "), latex(vecLatex("A", "P")), texte(" est nul :"), latex(`${formuleCritereLatex(e)} = 0`)],
        [texte("Ici, avec les composantes de l'étape précédente :"), latex(vecteursLatex(e)), texte(" — remplace dans la formule, puis développe.")],
      ],
      indication: `Une équation avec « = », par exemple 2${lettre} − 6 = 0.`,
      reponseLatex: equationLatex(e),
    };
  }
  const nomU = vecLatex(u!.origine, u!.extremite);
  const nomV = vecLatex(v!.origine, v!.extremite);
  const ortho = e.situation === "equerre";
  return {
    type: "champs",
    titre,
    consigne: [texte(`Calcule le ${nomCritere(e)} de `), latex(nomU), texte(" et "), latex(nomV), texte(".")],
    champs: [{ id: "critere", libelle: [texte(ortho ? "Produit scalaire :" : "Déterminant :")], attendu: { type: "valeur", cible: { coef: 0, cst: valeurCritere(e) }, lettre: null, signe: !ortho } }],
    aides: [
      [texte(ortho ? "Produit scalaire de deux vecteurs :" : "Déterminant de deux vecteurs, dans cet ordre :"), latex(formuleCritereLatex(e))],
      [texte("Avec les composantes de l'étape précédente :"), latex(critereSubstitueLatex(e)), texte(" — il reste à calculer.")],
    ],
    indication: "Un nombre entier, positif ou négatif.",
    reponseLatex: critereCalculLatex(e),
  };
}

/** Les quatre phrases-réponses d'un verdict (indice 0 : oui justifié, 1 : non justifié, 2 et 3 :
 * pièges — « à l'œil », confusion d'outil). */
export function phrasesConclusion(e: ExerciceChantierTerrains): FragmentConsigne[][] {
  const s = contexte(e).sujet;
  const [u, v] = vecteursUtiles(e);
  const nu = latex(vecLatex(u!.origine, u!.extremite));
  const nv = latex(vecLatex(v!.origine, v!.extremite));
  switch (e.situation) {
    case "alignement":
      return [
        [texte(`Oui, ${s} sont alignés : le déterminant de `), nu, texte(" et "), nv, texte(" est nul.")],
        [texte(`Non, ${s} ne sont pas alignés : le déterminant de `), nu, texte(" et "), nv, texte(" n'est pas nul.")],
        [texte(`Oui, ${s} sont alignés : sur le plan, ils semblent sur une même ligne droite.`)],
        [texte(`Non, ${s} ne sont pas alignés : `), nu, texte(" et "), nv, texte(" n'ont pas les mêmes composantes.")],
      ];
    case "equerre":
      return [
        [texte(`Oui, ${s} est d'équerre : le produit scalaire de `), nu, texte(" et "), nv, texte(" est nul.")],
        [texte(`Non, ${s} n'est pas d'équerre : le produit scalaire de `), nu, texte(" et "), nv, texte(" n'est pas nul.")],
        [texte(`Oui, ${s} est d'équerre : sur le plan, l'angle en A a l'air droit.`)],
        [texte(`Non, ${s} n'est pas d'équerre : le déterminant de `), nu, texte(" et "), nv, texte(" n'est pas nul.")],
      ];
    default:
      return [
        [texte(`Oui, ${s} sont parallèles : le déterminant de `), nu, texte(" et "), nv, texte(" est nul.")],
        [texte(`Non, ${s} ne sont pas parallèles : le déterminant de `), nu, texte(" et "), nv, texte(" n'est pas nul.")],
        [texte(`Oui, ${s} sont parallèles : sur le plan, l'écart entre elles semble constant.`)],
        [texte(`Non, ${s} ne sont pas parallèles : `), nu, texte(" et "), nv, texte(" n'ont pas la même longueur.")],
      ];
  }
}

export function indicePhraseJuste(e: ExerciceChantierTerrains): number {
  return e.verdict ? 0 : 1;
}

function ecranReponse(e: ExerciceChantierTerrains): Ecran {
  const titre = TITRES_ECRANS[3]!;
  if (e.verdict !== null) {
    const phrases = phrasesConclusion(e);
    return {
      type: "choix",
      titre,
      consigne: [texte("Choisis la phrase qui répond correctement à la question.")],
      options: e.ordreOptions.map((i) => phrases[i]!),
      bonne: e.ordreOptions.indexOf(indicePhraseJuste(e)),
      aides: [
        [texte(`Le critère est une égalité exacte : seul un ${nomCritere(e)} égal à 0 permet de répondre « oui ».`)],
        [texte("Un résultat non nul, même petit, suffit à répondre « non » : sur le terrain, l'écart se verrait au bout de quelques mètres. Et l'aspect du plan ne prouve rien.")],
      ],
      messageFaux: "Ce n'était pas la bonne phrase.",
    };
  }
  const c = e.cherche!;
  if (e.situation === "piquet") {
    const lettre = lettreInconnue(e)!;
    return {
      type: "champs",
      titre,
      consigne: [texte(`Résous l'équation pour trouver ${lettre} : où planter ${contexte(e).sujet} ?`)],
      champs: [{ id: "inconnue", libelle: [latex(`${lettre} =`)], attendu: { type: "valeur", cible: { coef: 0, cst: valeurInconnue(e) }, lettre: null } }],
      aides: [
        [texte(`Équation du premier degré : isole ${lettre}.`)],
        [texte("L'équation de l'étape précédente, réduite :"), latex(equationLatex(e)), texte(` — il reste à isoler ${lettre}.`)],
      ],
      indication: "Un nombre entier, positif ou négatif.",
      reponseLatex: `${lettre} = ${nombreLatex(valeurInconnue(e))} \\;\\Rightarrow\\; ${pointLatex(c)}`,
    };
  }
  const a = point(e, "A");
  const champs: Champ[] = [
    { id: "xR", libelle: [latex(`x_${c.nom} =`)], attendu: { type: "valeur", cible: { coef: 0, cst: c.x }, lettre: null } },
    { id: "yR", libelle: [latex(`y_${c.nom} =`)], attendu: { type: "valeur", cible: { coef: 0, cst: c.y }, lettre: null } },
  ];
  if (e.situation === "milieu") {
    const am = demiVecteur(e);
    return {
      type: "champs",
      titre,
      consigne: [texte(`Donne les coordonnées de ${c.nom} : ${contexte(e).question.charAt(0).toLowerCase()}${contexte(e).question.slice(1)}`)],
      champs,
      aides: [
        [texte(`${c.nom} est l'image de A par le vecteur `), latex(vecLatex("A", c.nom)), texte(" :"), latex(`x_${c.nom} = x_A + x_{${vecLatex("A", c.nom)}}`)],
        [texte("Pour l'abscisse, cela donne :"), latex(`x_${c.nom} = ${nombreLatex(a.x)} + ${facteur(am.x)}`), texte(" — même démarche pour l'ordonnée.")],
      ],
      indication: "Un nombre décimal (virgule) ou une fraction comme 7/2.",
      reponseLatex: pointLatex(c),
    };
  }
  const pc = point(e, "C");
  const ab = vecteursUtiles(e)[0]!;
  return {
    type: "champs",
    titre,
    consigne: [texte("Donne les coordonnées du coin D.")],
    champs,
    aides: [
      [texte("Écris l'égalité composante par composante :"), latex(`x_C - x_D = x_{${vecLatex("A", "B")}}`)],
      [texte("Pour l'abscisse, cela donne :"), latex(`${nombreLatex(pc.x)} - x_D = ${nombreLatex(ab.x.cst)}`), texte(" — même démarche pour l'ordonnée.")],
    ],
    indication: "Un nombre entier, positif ou négatif.",
    reponseLatex: pointLatex(c),
  };
}

export function ecrans(e: ExerciceChantierTerrains): Ecran[] {
  const outil = indiceOutilAttendu(e);
  return [
    {
      type: "choix",
      titre: TITRES_ECRANS[0]!,
      consigne: [texte("Quel outil du calcul vectoriel permet de répondre à la question ?")],
      options: OUTILS.map((o) => [texte(o.libelle)]),
      bonne: outil,
      aides: aidesOutil(e),
      messageFaux: "Ce n'était pas l'outil adapté.",
    },
    ecranVecteurs(e),
    ecranCritere(e),
    ecranReponse(e),
  ];
}
