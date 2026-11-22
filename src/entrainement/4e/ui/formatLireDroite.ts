import type { DroiteTracee, EquationDonnee, ExerciceLireDroite } from "../core/lireDroite.types";
import { plusQ, q, somme } from "./corrigeChapitre3";
import type { ChampNombre, EcranTSD } from "./ecransTransfertSecondDegre";
import { reduireDroite } from "./geometrieLotG";
import { COULEURS, figureRepere, l, nombreTexte, parametriquesL, t, type Fr, type D } from "./outilsAnalytiqueLotG";

/**
 * Textes, écrans et figures de gen132 « Lire une droite : associer droites et équations » — SOURCE
 * UNIQUE (écran, aides, papier, corrigé). Notations du cours (§ 1–3) : quatre écritures d'une droite
 * (implicite ax + by + c = 0, explicite y = mx + p, explicite x = ny + q, paramétrique), pente m lue
 * « en escalier » (on avance, on compte de combien la droite monte ou descend), ordonnée à
 * l'origine p lue sur l'axe Oy. Quadrillage d'une unité, même échelle sur les deux axes.
 */

type E = ExerciceLireDroite;

export const NOMS = ["A", "B", "C", "D"];

// ---------------------------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------------------------

export const pente = (d: Extract<DroiteTracee, { type: "oblique" }>) => d.num / d.den;

/** Coefficients a, b, c de la droite (forme implicite, entiers premiers entre eux). */
export function coefficients(d: DroiteTracee): D {
  if (d.type === "horizontale") return { a: 0, b: 1, c: -d.k };
  if (d.type === "verticale") return { a: 1, b: 0, c: -d.k };
  return reduireDroite({ a: d.num, b: -d.den, c: d.den * d.p });
}

const membre = (d: D) =>
  somme([
    [d.a, "x"],
    [d.b, "y"],
    [d.c, ""],
  ]);

/** « y=\dfrac{2}{3}x-1 », « y=2 ». */
export function expliciteY(d: DroiteTracee): string {
  if (d.type === "horizontale") return `y=${q(d.k)}`;
  if (d.type === "verticale") throw new Error("verticale : pas de forme y = mx + p");
  return `y=${somme([
    [pente(d), "x"],
    [d.p, ""],
  ])}`;
}

/** « x=\dfrac{1}{2}y-\dfrac{1}{2} », « x=-3 ». */
export function expliciteX(d: DroiteTracee): string {
  if (d.type === "verticale") return `x=${q(d.k)}`;
  if (d.type === "horizontale") throw new Error("horizontale : pas de forme x = ny + q");
  return `x=${somme([
    [d.den / d.num, "y"],
    [(-d.p * d.den) / d.num, ""],
  ])}`;
}

export function equationL(eq: EquationDonnee): string {
  switch (eq.forme) {
    case "implicite":
      return `${membre(coefficients(eq.droite))}=0`;
    case "explicite-y":
      return expliciteY(eq.droite);
    case "explicite-x":
      return expliciteX(eq.droite);
    case "parametrique":
      return parametriquesL(eq.P0, eq.dir);
  }
}

/** Équation nommée pour une option ou l'énoncé : « A : 2x−y+1=0 ». */
export function equationNommee(e: E, i: number): Fr {
  return [t(`${NOMS[i]} : `), l(equationL(e.equations[i]!))];
}

/** Écriture texte d'une droite tracée (« la droite de pente m = 2 … »), avec formules « $…$ ». */
function descriptionDroite(d: DroiteTracee): string {
  if (d.type === "horizontale") return `la droite horizontale $y=${q(d.k)}$`;
  if (d.type === "verticale") return `la droite verticale $x=${q(d.k)}$`;
  return `la droite de pente $m=${q(pente(d))}$ et d'ordonnée à l'origine $p=${q(d.p)}$`;
}
function lectureDroite(d: DroiteTracee): string {
  if (d.type === "horizontale") return `est horizontale ($y=${q(d.k)}$)`;
  if (d.type === "verticale") return `est verticale ($x=${q(d.k)}$)`;
  return `a pour pente $m=${q(pente(d))}$ et coupe l'axe Oy en $p=${q(d.p)}$`;
}

export function explicationChoix(e: E, n: number, choisi: number): string {
  const vraie = e.equations[e.ordre[n]!]!.droite;
  const autre = e.equations[choisi]!.droite;
  return `L'équation ${NOMS[choisi]} est celle de ${descriptionDroite(autre)}, alors que la droite ${n + 1} ${lectureDroite(vraie)}.`;
}

// ---------------------------------------------------------------------------------------------
// Figures (fenêtre [−5 ; 5], quadrillage d'une unité, aucun identifiant SVG)
// ---------------------------------------------------------------------------------------------

const FENETRE = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };

/** Ajoute un titre au-dessus du repère (bande de 20 px). */
function avecTitre(svg: string, titre: string): string {
  const m = /<svg([^>]*?) width="(\d+)" height="(\d+)" viewBox="0 0 (\d+) (\d+)"([^>]*)>([\s\S]*)<\/svg>$/.exec(svg);
  if (!m) return svg;
  const [, avant, w, h, vw, vh, apres, corps] = m;
  const H = Number(h) + 20;
  return `<svg${avant} width="${w}" height="${H}" viewBox="0 0 ${vw} ${Number(vh) + 20}"${apres}><rect x="0" y="0" width="${vw}" height="20" fill="#ffffff"/><text x="${Number(vw) / 2}" y="15" font-size="13" text-anchor="middle" fill="#1b1d22" font-family="sans-serif" font-weight="600">${titre}</text><g transform="translate(0,20)">${corps}</g></svg>`;
}

/** Une droite tracée ; `escalier` : l'escalier (0 ; p) → (den ; p) → (den ; p + num) et les points lus. */
export function figureDroite(d: DroiteTracee, titre: string, escalier = false): string {
  const c = coefficients(d);
  const segments: { A: { x: number; y: number }; B: { x: number; y: number }; couleur?: string; pointille?: boolean; epaisseur?: number }[] = [];
  const points: { P: { x: number; y: number }; label?: string; couleur?: string; position?: "ne" | "no" | "se" | "so" | "n" | "s" | "e" | "o" }[] = [];
  if (escalier) {
    if (d.type === "oblique") {
      const A = { x: 0, y: d.p };
      const C = { x: d.den, y: d.p };
      const B = { x: d.den, y: d.p + d.num };
      segments.push({ A, B: C, couleur: COULEURS.vert, epaisseur: 2.2 }, { A: C, B, couleur: COULEURS.bleu, epaisseur: 2.2 });
      points.push({ P: A, label: `(0 ; ${nombreTexte(d.p)})`, couleur: COULEURS.noir, position: d.num > 0 ? "no" : "so" }, { P: B, couleur: COULEURS.noir });
    } else if (d.type === "horizontale") points.push({ P: { x: 0, y: d.k }, label: `(0 ; ${nombreTexte(d.k)})`, couleur: COULEURS.noir, position: "ne" });
    else points.push({ P: { x: d.k, y: 0 }, label: `(${nombreTexte(d.k)} ; 0)`, couleur: COULEURS.noir, position: "ne" });
  }
  return avecTitre(figureRepere({ fenetre: FENETRE, unite: 20, graduationsLisibles: true, droites: [{ d: c, couleur: COULEURS.accent, epaisseur: 2.2 }], segments, points }), titre);
}

export const titreFigure = (n: number) => `Droite ${n + 1}`;

export function figureAssociation(e: E, n: number, escalier = false): string {
  return figureDroite(e.equations[e.ordre[n]!]!.droite, titreFigure(n), escalier);
}
export function figureLecture(e: E, escalier = false): string {
  return figureDroite({ type: "oblique", ...e.lecture }, "Droite d", escalier);
}
export function figureImpossible(e: E, annotee = false): string {
  return figureDroite(e.impossible, "Droite g", annotee);
}

/** Les six figures de l'énoncé papier, côte à côte. */
export function figuresHtml(e: E): string {
  const figs = [0, 1, 2, 3].map((n) => figureAssociation(e, n)).concat([figureLecture(e), figureImpossible(e)]);
  const cellules = figs.map((f) => `<div style="flex:1 1 4.8cm;max-width:6cm;min-width:0">${f.replace(/width="(\d+)" height="(\d+)"/, 'style="width:100%;max-width:$1px;height:auto;display:block;margin:0 auto"')}</div>`);
  return `<div style="display:flex;flex-wrap:wrap;gap:6px 10px;justify-content:center">${cellules.join("")}</div>`;
}

// ---------------------------------------------------------------------------------------------
// Énoncé, consignes, réponses
// ---------------------------------------------------------------------------------------------

export const CONSIGNE_GENERALE = "Lis chaque droite sur le quadrillage : pente, ordonnée à l'origine, direction — puis reconnais son équation.";

export function listeEquations(e: E): Fr {
  return e.equations.flatMap((_, i) => (i === 0 ? equationNommee(e, i) : [t(" ; "), ...equationNommee(e, i)]));
}

export function enonceFragments(e: E): Fr {
  return [t("Voici quatre équations de droites, "), ...listeEquations(e), t(", et six droites tracées sur un quadrillage (droites 1 à 4, d et g).")];
}

export function consigneEcran(n: number): Fr {
  return [t(`Quelle équation a pour graphique la droite ${n + 1} ?`)];
}
export const CONSIGNE_LECTURE: Fr = [t("Lis la pente m et l'ordonnée à l'origine p de la droite d.")];
export const CONSIGNE_IMPOSSIBLE: Fr = [t("Quelle écriture est impossible pour la droite g ?")];

export function questionsPapier(): Fr[] {
  return [
    [t("Associe chacune des droites 1 à 4 à son équation (A, B, C ou D) ; justifie chaque choix par une lecture sur le quadrillage.")],
    [t("Lis la pente m et l'ordonnée à l'origine p de la droite d.")],
    [t("Quelle écriture d'équation est impossible pour la droite g ? Justifie.")],
  ];
}

export function reponseAssociation(e: E, n: number): Fr {
  return [t(`La droite ${n + 1} a pour équation ${NOMS[e.ordre[n]!]} : `), l(equationL(e.equations[e.ordre[n]!]!)), t(".")];
}

export function reponseLecture(e: E): Fr {
  return [l(`m=${q(e.lecture.num / e.lecture.den)}`), t(" et "), l(`p=${q(e.lecture.p)}`)];
}

export const OPTIONS_FORMES: Fr[] = [
  [t("une équation implicite "), l("ax+by+c=0")],
  [t("une équation explicite "), l("y=mx+p")],
  [t("une équation explicite "), l("x=ny+q")],
  [t("des équations paramétriques")],
  [t("aucune : les quatre écritures existent")],
];

export const bonneForme = (e: E) => (e.impossible.type === "verticale" ? 1 : 2);

export function reponseImpossible(e: E): Fr {
  return e.impossible.type === "verticale" ? [t("l'explicite "), l("y=mx+p"), t(" (g est verticale)")] : [t("l'explicite "), l("x=ny+q"), t(" (g est horizontale)")];
}

export function reponseBreveFragments(e: E): Fr {
  const sortie: Fr = [t("a) ")];
  e.ordre.forEach((i, n) => sortie.push(t(`${n ? " ; " : ""}droite ${n + 1} : ${NOMS[i]}`)));
  sortie.push(t(" ; b) "), ...reponseLecture(e), t(" ; c) "), ...reponseImpossible(e));
  return sortie;
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

function aidesAssociation(e: E): Fr[] {
  const eqA = e.equations[0]!;
  return [
    [
      t("Pour chaque équation, retrouve la pente et l'ordonnée à l'origine : "),
      l("y=mx+p"),
      t(" se lit directement ; pour "),
      l("ax+by+c=0"),
      t(" ou "),
      l("x=ny+q"),
      t(", isole y ; pour une paramétrique de vecteur directeur "),
      l("\\begin{pmatrix}\\alpha\\\\\\beta\\end{pmatrix}"),
      t(", la pente vaut "),
      l("\\dfrac{\\beta}{\\alpha}"),
      t(". Une équation sans y est verticale, une équation sans x horizontale."),
    ],
    [t("Sur la figure, lis p là où la droite coupe l'axe Oy, puis avance de quelques carreaux et compte de combien elle monte ou descend. Commence par l'équation A : "), l(equationL(eqA)), t(" ; quelle pente et quelle ordonnée à l'origine donne-t-elle ?")],
  ];
}

/** Ligne « Piège » du corrigé, selon le rôle de la droite lue dans sa famille. */
export function piegeRole(eq: EquationDonnee, axe: boolean): Fr {
  const d = eq.droite;
  switch (eq.role) {
    case "base":
      return [t(axe ? "Une autre équation a la même ordonnée à l'origine ou une pente voisine : contrôle la pente (montée divisée par l'avancée) et l'ordonnée à l'origine." : "Les trois autres équations ont la même pente ou la même ordonnée à l'origine que celle-ci : il faut contrôler les deux, la pente en escalier (montée divisée par l'avancée).")];
    case "pente-opposee":
      return d.type === "oblique" ? [t("Une autre équation a la même ordonnée à l'origine et la pente opposée : c'est le sens qui tranche ; ici la droite " + (d.num > 0 ? "monte" : "descend") + ", donc "), l(d.num > 0 ? "m>0" : "m<0"), t(".")] : [];
    case "p-oppose":
      return d.type === "oblique" ? [t("L'ordonnée à l'origine se lit avec son signe : ici la droite coupe l'axe Oy " + (d.p > 0 ? "au-dessus" : "en dessous") + " de l'origine.")] : [];
    case "composantes-echangees":
      return [t("Pour un vecteur directeur "), l("\\begin{pmatrix}\\alpha\\\\\\beta\\end{pmatrix}"), t(", la pente vaut "), l("\\dfrac{\\beta}{\\alpha}"), t(" : des composantes échangées donnent la pente inverse.")];
    case "horizontale":
      return [t("Une équation sans x, "), l("y=k"), t(", est une droite horizontale, pas verticale.")];
    case "verticale":
      return [t("Une équation sans y, "), l("x=k"), t(", est une droite verticale, pas horizontale.")];
  }
}

function champsLecture(e: E): ChampNombre[] {
  const { num, den, p } = e.lecture;
  const m = num / den;
  return [
    {
      type: "nombre",
      id: "m",
      libelle: [l("m=")],
      cible: m,
      pieges: [
        { valeur: -m, message: `Attention au sens : la droite ${m > 0 ? "monte" : "descend"} quand on avance vers la droite.` },
        { valeur: den / num, message: "Tu as divisé l'avancée par la montée : la pente est $m=\\dfrac{\\Delta y}{\\Delta x}$, la montée divisée par l'avancée." },
        { valeur: -den / num, message: "La pente est la montée divisée par l'avancée : $m=\\dfrac{\\Delta y}{\\Delta x}$ (avec son signe)." },
        ...(p !== m ? [{ valeur: p, message: "C'est l'ordonnée à l'origine : la pente se lit en escalier, pas sur l'axe Oy." }] : []),
      ].filter((x) => Math.abs(x.valeur - m) > 1e-9),
      messageSiFaux: "Avance de quelques carreaux vers la droite et compte de combien la droite monte ou descend : m = montée ÷ avancée.",
    },
    {
      type: "nombre",
      id: "p",
      libelle: [l("p=")],
      cible: p,
      pieges: [
        { valeur: -p, message: `p se lit avec son signe : la droite coupe l'axe Oy ${p > 0 ? "au-dessus" : "en dessous"} de l'origine.` },
        { valeur: -p / m, message: "C'est l'abscisse du point où la droite coupe l'axe Ox : p se lit sur l'axe Oy." },
      ].filter((x) => Math.abs(x.valeur - p) > 1e-9),
      messageSiFaux: "L'ordonnée à l'origine est l'ordonnée du point où la droite coupe l'axe Oy.",
    },
  ];
}

function explicationsImpossible(e: E): string[] {
  const g = e.impossible;
  const k = q(g.k);
  if (g.type === "verticale") {
    return [
      `L'implicite existe toujours : ici $x${plusQ(-g.k)}=0$ (avec b = 0).`,
      "",
      `L'explicite en x existe pour une verticale : $x=${k}$ (avec n = 0).`,
      `Les paramétriques existent toujours : ici $x=${k}$ et $y=t$.`,
      "Une droite verticale n'a pas de pente : elle ne peut pas s'écrire $y=mx+p$.",
    ];
  }
  return [
    `L'implicite existe toujours : ici $y${plusQ(-g.k)}=0$ (avec a = 0).`,
    `L'explicite en y existe pour une horizontale : $y=${k}$ (avec m = 0).`,
    "",
    `Les paramétriques existent toujours : ici $x=t$ et $y=${k}$.`,
    "Une droite horizontale ne peut pas s'écrire $x=ny+q$ : l'ordonnée y est constante et ne détermine pas x.",
  ];
}

export function ecrans(e: E): EcranTSD[] {
  const association: EcranTSD[] = [0, 1, 2, 3].map((n) => ({
    type: "choix",
    titre: titreFigure(n),
    consigne: consigneEcran(n),
    options: e.equations.map((_, i) => equationNommee(e, i)),
    bonne: e.ordre[n]!,
    aides: aidesAssociation(e),
    messageFaux: "Ce n'était pas la bonne équation (une seule tentative sur un choix fermé).",
    explications: e.equations.map((_, i) => (i === e.ordre[n] ? "" : explicationChoix(e, n, i))),
    figure: figureAssociation(e, n),
    figureApres: figureAssociation(e, n, true),
  }));
  const { num, den } = e.lecture;
  const expl = explicationsImpossible(e);
  return [
    ...association,
    {
      type: "champs",
      titre: "Pente et ordonnée à l'origine",
      consigne: CONSIGNE_LECTURE,
      champs: champsLecture(e),
      aides: [
        [t("p se lit là où la droite coupe l'axe Oy ; m se lit « en escalier » : on avance vers la droite et on compte de combien la droite monte ou descend, "), l("m=\\dfrac{\\Delta y}{\\Delta x}"), t(".")],
        [t(`Ici, pars du point où d coupe l'axe Oy et avance de ${den} carreau${den > 1 ? "x" : ""} vers la droite jusqu'à un nœud de la droite : compte de combien elle ${num > 0 ? "monte" : "descend"}${den > 1 ? `, puis divise par ${den}` : ""}.`)],
      ],
      reponse: reponseLecture(e),
      figure: figureLecture(e),
      figureApres: figureLecture(e, true),
    },
    {
      type: "choix",
      titre: "Une écriture impossible",
      consigne: CONSIGNE_IMPOSSIBLE,
      options: e.ordreFormes.map((i) => OPTIONS_FORMES[i]!),
      bonne: e.ordreFormes.indexOf(bonneForme(e)),
      aides: [
        [t("Une droite verticale n'a pas de forme "), l("y=mx+p"), t(" (elle n'a pas de pente), une droite horizontale pas de forme "), l("x=ny+q"), t(" ; l'implicite et la paramétrique existent toujours.")],
        [t("Regarde la droite g : est-elle verticale ou horizontale ? Lis alors une équation de g, puis demande-toi quelle écriture ne peut pas l'exprimer.")],
      ],
      messageFaux: "Ce n'était pas la bonne écriture (une seule tentative sur un choix fermé).",
      explications: e.ordreFormes.map((i) => expl[i]!),
      figure: figureImpossible(e),
    },
  ];
}
