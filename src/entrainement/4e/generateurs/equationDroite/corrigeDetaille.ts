import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceEquationDroite } from "../../core/equationDroite.types";
import { q } from "../../ui/corrigeAnalytique1";
import {
  COURS_DROITE,
  col,
  equation,
  lignesCoefficientsCartesiens,
  lignesExpliciteX,
  lignesExpliciteY,
  lignesMultipleEntier,
  lignesParametriques,
  lignesPointSurCartesienne,
  lignesPointSurExpliciteX,
  lignesPointSurExpliciteY,
  lignesVecteurDeuxPoints,
  pt,
  simplifiee,
  type Fragments,
} from "../../ui/corrigeAnalytique1";
import { finaliserVecteurs } from "../../ui/corrigeVecteurs2";
import { TAN_REMARQUABLE } from "../droite/geometrieDroite";
import {
  formatEquationExpliciteXLatex,
  formatEquationExpliciteYLatex,
  formatEquationImpliciteLatex,
  formatRepresentationParametriqueLatex,
  segmentsAideExtractionNiveau1,
} from "../../ui/formatEquationDroite";

/**
 * Corrigé détaillé « comme au tableau » de gen42 « Équation d'une droite » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`AppEquationDroite.tsx`,
 * `sequencePourExercice`) : a = point + vecteur directeur ; b = équation sous la forme demandée (écran
 * « coefficients », ou « possible ? + équation » pour y = mx + p / x = ny + q). Partagé par l'adaptateur
 * papier et l'appli (corrigé de l'étape ratée). Valeurs de l'instance, formes finales écrites par les
 * mêmes fonctions que l'écran (`ui/formatEquationDroite.ts`).
 */

type E = ExerciceEquationDroite;

/** Second point de contrôle : B donné (deux points), sinon A + u. */
function pointControle(e: E): { p: { x: number; y: number }; nom: string; texte: Fragments } {
  if (e.donnees.type === "deux_points") return { p: e.donnees.pointB, nom: "B", texte: [texte("Le point "), latex(pt("B", e.donnees.pointB)), texte(", qui n'a pas servi au calcul, vérifie l'équation : ")] };
  const b = { x: e.point.x + e.vecteur.x, y: e.point.y + e.vecteur.y };
  return { p: b, nom: "B", texte: [texte("Le point "), latex(`B=A+\\vec{u}`), texte(", c'est-à-dire "), latex(pt("B", b)), texte(", vérifie l'équation : ")] };
}

/** Vecteur (1 ; tan θ) : nommé u s'il est gardé, v s'il est ensuite multiplié (30°, 150° : ×3). */
function nomLu(lu: { x: number; y: number }, u: { x: number; y: number }): string {
  return Math.abs(lu.x - u.x) < 1e-9 && Math.abs(lu.y - u.y) < 1e-9 ? "\\vec{u}" : "\\vec{v}";
}

/* --- Étape a : point et vecteur directeur --------------------------------------------------- */

function lignesExtraction(e: E): LigneCalcul[] {
  const d = e.donnees;
  const u = e.vecteur;
  switch (d.type) {
    case "deux_points":
      return lignesVecteurDeuxPoints("u", d.pointA, d.pointB);
    case "point_vecteur":
      return [ligne(`x_A=${q(d.point.x)}`, "lu dans l'énoncé"), ligne(`y_A=${q(d.point.y)}`), ligne(`\\vec{u}=${col(d.vecteur)}`, "donné dans l'énoncé")];
    case "angle_ox": {
      if (d.angleDeg === 90) return [ligne(`\\vec{u}=${col(u)}`, [texte("angle de 90° avec Ox : droite verticale ("), latex("\\tan 90^\\circ"), texte(" n'existe pas)")])];
      const t = TAN_REMARQUABLE[d.angleDeg] as number;
      const lu = { x: 1, y: t };
      return [
        ligne(`${nomLu(lu, u)}=\\begin{pmatrix}1\\\\\\tan ${d.angleDeg}^\\circ\\end{pmatrix}`, [texte("la pente est "), latex("m=\\tan\\theta")]),
        ligne(`=${col(lu)}`, [latex(`\\tan ${d.angleDeg}^\\circ=${q(t)}`)]),
        ...lignesMultipleEntier(lu, u).map((m) => ({ ...m, latex: `\\vec{u}=${m.latex}` })),
      ];
    }
    case "angle_oy": {
      if (d.angleDeg === 90) return [ligne(`\\vec{u}=${col(u)}`, [texte("angle de 90° avec Oy : droite horizontale ("), latex("\\tan 90^\\circ"), texte(" n'existe pas)")])];
      const t = TAN_REMARQUABLE[d.angleDeg] as number;
      const lu = { x: t, y: 1 };
      return [
        ligne(`${nomLu(lu, u)}=\\begin{pmatrix}\\tan ${d.angleDeg}^\\circ\\\\1\\end{pmatrix}`, [texte("angle "), latex("\\theta_{Oy}"), texte(" mesuré depuis Oy")]),
        ligne(`=${col(lu)}`, [latex(`\\tan ${d.angleDeg}^\\circ=${q(t)}`)]),
        ...lignesMultipleEntier(lu, u).map((m) => ({ ...m, latex: `\\vec{u}=${m.latex}` })),
      ];
    }
    case "pente":
      return [ligne(`\\vec{u}=\\begin{pmatrix}1\\\\m\\end{pmatrix}=${col(u)}`, [texte("pente "), latex(`m=${q(d.pente)}`)])];
  }
}

function piegeExtraction(e: E): Fragments {
  switch (e.donnees.type) {
    case "deux_points":
      return [texte("Le vecteur se calcule « extrémité − origine », dans le même ordre pour les deux composantes ; une coordonnée négative se met entre parenthèses.")];
    case "point_vecteur":
      return [texte("Un point s'écrit en ligne "), latex("(x\\,;\\,y)"), texte(", un vecteur en colonne : ne pas échanger leurs rôles.")];
    case "angle_ox":
      return [texte("Un angle de 90° avec Ox donne une droite verticale : "), latex("\\tan 90^\\circ"), texte(" n'existe pas, le vecteur directeur est "), latex("\\begin{pmatrix}0\\\\1\\end{pmatrix}"), texte(".")];
    case "angle_oy":
      return [texte("L'angle est donné avec l'axe Oy, pas avec Ox : le vecteur directeur est "), latex("\\begin{pmatrix}\\tan\\theta_{Oy}\\\\1\\end{pmatrix}"), texte(", et non "), latex("\\begin{pmatrix}1\\\\\\tan\\theta_{Oy}\\end{pmatrix}"), texte(".")];
    case "pente":
      return [texte("La pente donne le vecteur "), latex("\\begin{pmatrix}1\\\\m\\end{pmatrix}"), texte(" : la première composante est 1, pas m.")];
  }
}

function etapesExtraction(e: E): EtapeCorrection[] {
  return [
    utilise("a", [...segmentsAideExtractionNiveau1(e), texte(` ${COURS_DROITE}`)]),
    calcul("a", lignesExtraction(e)),
    resultat("a", [texte("La droite passe par "), latex(pt("A", e.point)), texte(" et a pour vecteur directeur "), latex(`\\vec{u}=${col(e.vecteur)}`), texte(".")]),
    piege("a", piegeExtraction(e)),
  ];
}

/* --- Étape b : la forme demandée ------------------------------------------------------------- */

function etapesCartesienne(e: E, intro: LigneCalcul[] = [], utiliseDebut: Fragments = [], resultatDebut: Fragments = []): EtapeCorrection[] {
  const { lignes, d } = lignesCoefficientsCartesiens(e.point, e.vecteur);
  const ref = e.referenceImplicite;
  const { d: r, k } = simplifiee(d);
  const controle = pointControle(e);
  return [
    utilise("b", [
      ...utiliseDebut,
      texte(utiliseDebut.length ? "équation cartésienne " : "Équation cartésienne "),
      latex("ax+by+c=0"),
      texte(" : "),
      latex("\\begin{pmatrix}a\\\\b\\end{pmatrix}=\\begin{pmatrix}y_{\\vec{u}}\\\\-x_{\\vec{u}}\\end{pmatrix}"),
      texte(" est un vecteur normal, et c s'obtient en écrivant que A est sur la droite "),
      texte(`${COURS_DROITE}.`),
    ]),
    calcul("b", [...intro, ...lignes]),
    resultat("b", [
      ...resultatDebut,
      latex(`d\\equiv ${formatEquationImpliciteLatex(ref.a, ref.b, ref.c)}`),
      ...(k !== 1 ? [texte(", ou, en divisant par "), latex(q(k)), texte(" : "), latex(equation(r))] : []),
      texte("."),
    ]),
    verification("b", controle.texte, lignesPointSurCartesienne(d, controle.p, controle.nom)),
  ];
}

function etapesB(e: E): EtapeCorrection[] {
  const controle = pointControle(e);
  if (e.formeCible === "parametrique") {
    return [
      utilise("b", [texte("Équations paramétriques : "), latex("\\begin{cases}x=x_A+x_{\\vec{u}}\\,t\\\\y=y_A+y_{\\vec{u}}\\,t\\end{cases}"), texte(", le même paramètre t dans les deux équations "), texte(`${COURS_DROITE}.`)]),
      calcul("b", lignesParametriques(e.point, e.vecteur)),
      resultat("b", [latex(`d\\equiv ${formatRepresentationParametriqueLatex(e.point.x, e.vecteur.x, e.point.y, e.vecteur.y)}`)]),
      verification("b", [texte("Pour "), latex("t=1"), texte(" : "), latex(`x=${q(e.point.x)}+${e.vecteur.x < 0 ? `(${q(e.vecteur.x)})` : q(e.vecteur.x)}=${q(controle.p.x)}`), texte(" et "), latex(`y=${q(e.point.y)}+${e.vecteur.y < 0 ? `(${q(e.vecteur.y)})` : q(e.vecteur.y)}=${q(controle.p.y)}`), ...(e.donnees.type === "deux_points" ? [texte(" : on retrouve le point B.")] : [texte(" : c'est le point "), latex("A+\\vec{u}"), texte(", bien sur la droite.")])]),
      piege("b", [texte("Chaque équation associe une coordonnée du point à la MÊME composante du vecteur : "), latex("x=x_A+x_{\\vec{u}}\\,t"), texte(", jamais "), latex("x=x_A+y_{\\vec{u}}\\,t"), texte(".")]),
    ];
  }
  if (e.formeCible === "implicite") {
    return [...etapesCartesienne(e), piege("b", [texte("Les coefficients a et b ne sont pas les composantes du vecteur directeur : "), latex("a=y_{\\vec{u}}"), texte(" et "), latex("b=-x_{\\vec{u}}"), texte(".")])];
  }
  const enY = e.formeCible === "explicite_y";
  const composante = enY ? e.vecteur.x : e.vecteur.y;
  const nomComposante = enY ? "x_{\\vec{u}}" : "y_{\\vec{u}}";
  const forme = enY ? "y=mx+p" : "x=ny+q";
  const decision = ligne(
    `${nomComposante}=${q(composante)}${e.possible ? "\\neq 0" : ""}`,
    e.possible
      ? [texte(`la droite n'est pas ${enY ? "verticale" : "horizontale"} : la forme `), latex(forme), texte(" existe")]
      : [texte(`la droite est ${enY ? "verticale" : "horizontale"} : pas de forme `), latex(forme)],
  );
  if (!e.possible) {
    return [
      ...etapesCartesienne(e, [decision], [texte(`Une droite ${enY ? "verticale" : "horizontale"} (`), latex(`${nomComposante}=0`), texte(") n'a pas de forme "), latex(forme), texte(" ; on donne alors son ")], [texte(`Forme impossible (droite ${enY ? "verticale" : "horizontale"}) : `)]),
      piege(
        "b",
        enY
          ? [texte("Une droite verticale n'a pas de pente : on ne peut pas l'écrire "), latex("y=mx+p"), texte(". Son équation est du type "), latex("x=k"), texte(".")]
          : [texte("Une droite horizontale ne s'écrit pas "), latex("x=ny+q"), texte(" (y n'y varie pas). Son équation est du type "), latex("y=k"), texte(".")],
      ),
    ];
  }
  const utiliseB: Fragments = [
    texte("La forme "),
    latex(forme),
    texte(` existe si et seulement si la droite n'est pas ${enY ? "verticale" : "horizontale"}, c'est-à-dire `),
    latex(`${nomComposante}\\neq 0`),
    texte(" ; alors "),
    latex(enY ? "m=\\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}" : "n=\\dfrac{x_{\\vec{u}}}{y_{\\vec{u}}}"),
    texte(" et "),
    latex(enY ? "p=y_A-m\\cdot x_A" : "q=x_A-n\\cdot y_A"),
    texte(` ${COURS_DROITE}.`),
  ];
  if (enY) {
    const { lignes, m, p } = lignesExpliciteY(e.point, e.vecteur);
    return [
      utilise("b", utiliseB),
      calcul("b", [decision, ...lignes]),
      resultat("b", [texte("Forme possible : "), latex(`d\\equiv ${formatEquationExpliciteYLatex(e.refExpliciteY!.m, e.refExpliciteY!.p)}`), texte(".")]),
      verification("b", controle.texte, lignesPointSurExpliciteY(m, p, controle.p, controle.nom)),
      piege("b", [texte("La pente est le quotient "), latex("m=\\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}"), texte(", pas son inverse.")]),
    ];
  }
  const { lignes, n, q: qq } = lignesExpliciteX(e.point, e.vecteur);
  return [
    utilise("b", utiliseB),
    calcul("b", [decision, ...lignes]),
    resultat("b", [texte("Forme possible : "), latex(`d\\equiv ${formatEquationExpliciteXLatex(e.refExpliciteX!.n, e.refExpliciteX!.q)}`), texte(".")]),
    verification("b", controle.texte, lignesPointSurExpliciteX(n, qq, controle.p, controle.nom)),
    piege("b", [texte("Pour la forme "), latex("x=ny+q"), texte(", le coefficient est "), latex("n=\\dfrac{x_{\\vec{u}}}{y_{\\vec{u}}}"), texte(" (l'inverse de la pente).")]),
  ];
}

export function correctionDetailleeEquationDroite(e: E): EtapeCorrection[] {
  return finaliserVecteurs([...etapesExtraction(e), ...etapesB(e)]);
}
