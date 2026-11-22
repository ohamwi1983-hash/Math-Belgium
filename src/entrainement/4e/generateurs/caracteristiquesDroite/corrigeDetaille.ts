import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceCaracteristiquesDroite } from "../../core/caracteristiquesDroite.types";
import { plusQ, q, qp } from "../../ui/corrigeAnalytique1";
import {
  COURS_CARACTERISTIQUES,
  COURS_DROITE,
  COURS_LIRE_TRACER,
  col,
  dedoublonner,
  equation,
  lignesMultipleEntier,
  lignesPointCartesienne,
  lignesPointSurCartesienne,
  lignesVecteurDeuxPoints,
  produit,
  pt,
  type Fragments,
} from "../../ui/corrigeAnalytique1";
import { finaliserVecteurs } from "../../ui/corrigeVecteurs2";
import { formatCaracteristiquesAttenduesLatex } from "../../ui/formatCaracteristiquesDroite";

/**
 * Corrigé détaillé « comme au tableau » de gen46 « Caractéristiques d'une droite » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`AppCaracteristiquesDroite.tsx`,
 * `ORDRE_PHASES`) : a = un point A et un vecteur directeur (deux points calculés sur l'équation
 * cartésienne, ou valeur choisie + coefficient de la forme explicite, ou lecture des équations
 * paramétriques) ; b = pente m = y_u/x_u, angle (touche tan⁻¹ de la calculatrice, + 180° si négatif ;
 * angle avec Oy = 90° − tan⁻¹ m), ordonnée à l'origine p = y_A − m·x_A — ou verticale. Angles calculés
 * avec la valeur NON arrondie (deux décimales, puis l'unité). Notations du cours (§ 3 : tan, tan⁻¹,
 * angle dans [0° ; 180°[). Partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceCaracteristiquesDroite;

const deg = (v: number) => `${String(Math.round(v * 100) / 100).replace(".", "{,}")}^\\circ`;
const estEntier = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;

function second(e: E) {
  return { x: e.point.x + e.vecteur.x, y: e.point.y + e.vecteur.y };
}

/* --- Étape a --------------------------------------------------------------------------------- */

function etapesExtraction(e: E): EtapeCorrection[] {
  const a = e.point;
  const u = e.vecteur;
  let lignes: LigneCalcul[];
  let utiliseA: Fragments;
  switch (e.variante) {
    case "implicite": {
      const b = second(e);
      utiliseA = [texte("Deux points de la droite : on fixe une coordonnée (l'abscisse, ou l'ordonnée si la droite est verticale) et on résout l'équation ; un vecteur directeur relie ces deux points "), texte(`${COURS_LIRE_TRACER}.`)];
      return [
        utilise("a", utiliseA),
        calcul("a", lignesPointCartesienne(e.impliciteEntree!, "A", a), [], "Premier point"),
        calcul("a", lignesPointCartesienne(e.impliciteEntree!, "B", b), [], "Second point"),
        calcul("a", lignesVecteurDeuxPoints("u", a, b), [], "Vecteur directeur"),
        resultat("a", [latex(pt("A", a)), texte(" est un point de la droite et "), latex(`\\vec{u}=${col(u)}`), texte(" un vecteur directeur.")]),
        piege("a", [texte("Les coefficients a et b de l'équation ne sont ni un point ni un vecteur directeur : on calcule deux points qui vérifient l'équation.")]),
      ];
    }
    case "explicite_y": {
      const { m, p } = e.expliciteYEntree!;
      utiliseA = [texte("Pour "), latex("y=mx+p"), texte(", un vecteur directeur est "), latex("\\begin{pmatrix}1\\\\m\\end{pmatrix}"), texte(" ; un point s'obtient en choisissant x "), texte(`${COURS_DROITE}.`)];
      lignes = [
        ligne(`\\vec{u}=${col({ x: 1, y: m })}`, [texte("pente "), latex(`m=${q(m)}`)]),
        ...lignesMultipleEntier({ x: 1, y: m }, u),
        ligne(`x_A=${q(a.x)}`, Number.isInteger(m) ? "on choisit l'abscisse" : "abscisse multiple du dénominateur de m : y entier"),
        ligne(m === 0 ? `y_A=${q(p)}` : `y_A=${produit(m, a.x)}${plusQ(p)}=${q(a.y)}`, "on remplace x dans y = mx + p"),
      ];
      break;
    }
    case "explicite_x": {
      const { n, q: o } = e.expliciteXEntree!;
      utiliseA = [texte("Pour "), latex("x=ny+q"), texte(", un vecteur directeur est "), latex("\\begin{pmatrix}n\\\\1\\end{pmatrix}"), texte(" ; un point s'obtient en choisissant y "), texte(`${COURS_DROITE}.`)];
      lignes = [
        ligne(`\\vec{u}=${col({ x: n, y: 1 })}`, [latex(`n=${q(n)}`)]),
        ...lignesMultipleEntier({ x: n, y: 1 }, u),
        ligne(`y_A=${q(a.y)}`, Number.isInteger(n) ? "on choisit l'ordonnée" : "ordonnée multiple du dénominateur de n : x entier"),
        ligne(n === 0 ? `x_A=${q(o)}` : `x_A=${produit(n, a.y)}${plusQ(o)}=${q(a.x)}`, "on remplace y dans x = ny + q"),
      ];
      break;
    }
    case "parametrique": {
      const d = e.parametriqueEntree!;
      utiliseA = [texte("Dans des équations paramétriques, les constantes donnent un point (t = 0) et les coefficients de t un vecteur directeur "), texte(`${COURS_DROITE}.`)];
      lignes = [ligne(`x_A=${q(d.x0)}`, "constante de la première équation"), ligne(`y_A=${q(d.y0)}`, "constante de la seconde équation"), ligne(`\\vec{u}=${col({ x: d.a, y: d.b })}`, "coefficients de t")];
      break;
    }
  }
  return [
    utilise("a", utiliseA),
    calcul("a", dedoublonner(lignes)),
    resultat("a", [latex(pt("A", a)), texte(" est un point de la droite et "), latex(`\\vec{u}=${col(u)}`), texte(" un vecteur directeur.")]),
    piege("a", e.variante === "parametrique" ? [texte("Les constantes donnent le point, les coefficients de t le vecteur : ne pas les échanger.")] : [texte("Avec un coefficient fractionnaire, on choisit une valeur multiple du dénominateur pour obtenir un point à coordonnées entières.")]),
  ];
}

/* --- Étape b --------------------------------------------------------------------------------- */

function lignesAngle(e: E, m: number): LigneCalcul[] {
  const brut = (Math.atan(m) * 180) / Math.PI;
  const exact = estEntier(brut);
  const rel = exact ? "=" : "\\approx";
  const mL = qp(m).startsWith("(") || !Number.isInteger(m) ? `\\left(${q(m)}\\right)` : q(m);
  if (e.caracteristiqueDemandee === "angleOx") {
    const L: LigneCalcul[] = [ligne(`\\tan\\theta=m=${q(m)}`, "la pente est la tangente de l'angle avec Ox")];
    if (brut >= -1e-9) {
      L.push(ligne(`\\theta=\\tan^{-1}${mL}${rel}${deg(Math.max(0, brut))}`, exact ? "angle remarquable" : "touche tan⁻¹ de la calculatrice (mode degrés)"));
    } else {
      L.push(ligne(`\\tan^{-1}${mL}${rel}${deg(brut)}<0^\\circ`, exact ? "angle remarquable, négatif" : "calculatrice (mode degrés) : angle négatif"));
      L.push(ligne(`\\theta=\\tan^{-1}${mL}+180^\\circ`, "une droite fait un angle compris entre 0° et 180° avec Ox"));
      L.push(ligne(`${rel}${deg(brut + 180)}`));
    }
    if (!exact) L.push(ligne(`\\theta\\approx ${Math.round(e.angleDeg)}^\\circ`, "arrondi à l'unité"));
    return L;
  }
  const L: LigneCalcul[] = [ligne(`\\theta_{Oy}=90^\\circ-\\tan^{-1}${mL}`, "angle avec Oy : complément de l'angle tan⁻¹ m")];
  L.push(ligne(`${rel}90^\\circ-${brut < 0 ? `(${deg(brut)})` : deg(brut)}`, exact ? "angle remarquable" : "calculatrice (mode degrés)"));
  L.push(ligne(`${rel}${deg(90 - brut)}`));
  if (!exact) L.push(ligne(`\\theta_{Oy}\\approx ${Math.round(e.angleOyDeg)}^\\circ`, "arrondi à l'unité"));
  return L;
}

function etapesCaracteristiques(e: E): EtapeCorrection[] {
  const u = e.vecteur;
  const a = e.point;
  const demande = e.caracteristiqueDemandee;
  const utiliseB: Fragments = [
    texte("Si "),
    latex("x_{\\vec{u}}=0"),
    texte(", la droite est verticale : ni pente ni ordonnée à l'origine, angle 90° avec Ox (0° avec Oy). Sinon "),
    latex("m=\\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}"),
    ...(demande === "angleOx" ? [texte(", "), latex("\\tan\\theta=m"), texte(" avec θ entre 0° et 180°")] : demande === "angleOy" ? [texte(", angle avec Oy "), latex("\\theta_{Oy}=90^\\circ-\\tan^{-1}m")] : []),
    texte(" et "),
    latex("p=y_A-m\\cdot x_A"),
    texte(` ${COURS_CARACTERISTIQUES}.`),
  ];
  if (e.verticale) {
    const L: LigneCalcul[] = [ligne(`x_{\\vec{u}}=0`, "la droite est verticale : la pente n'existe pas")];
    if (demande === "angleOx") L.push(ligne(`\\theta=90^\\circ`, "une verticale est perpendiculaire à Ox"));
    if (demande === "angleOy") L.push(ligne(`\\theta_{Oy}=0^\\circ`, "une verticale est parallèle à Oy"));
    return [
      utilise("b", utiliseB),
      calcul("b", L),
      resultat("b", [texte("Droite verticale : "), latex(formatCaracteristiquesAttenduesLatex(e).replace(/^\\text\{verticale\} : \\; /, ""))]),
      piege("b", [texte("Une droite verticale ne coupe pas l'axe Oy : son ordonnée à l'origine n'existe pas, et sa pente non plus (division par 0).")]),
    ];
  }
  const m = e.pente!;
  const p = e.ordonneeOrigine!;
  const blocs: EtapeCorrection[] = [
    calcul("b", dedoublonner([ligne(`m=\\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}=\\dfrac{${q(u.y)}}{${q(u.x)}}`, "pente : quotient des composantes"), ligne(`=${q(m)}`)]), [], "Pente"),
  ];
  if (demande !== "pente") blocs.push(calcul("b", lignesAngle(e, m), [], demande === "angleOx" ? "Angle avec Ox" : "Angle avec Oy"));
  blocs.push(
    calcul(
      "b",
      dedoublonner([
        ligne(`p=y_A-m\\cdot x_A`, [texte("A est sur la droite : "), latex("y_A=m\\cdot x_A+p")]),
        ligne(`=${q(a.y)}-${qp(m)}\\cdot ${qp(a.x)}`),
        ligne(`=${q(a.y)}${plusQ(-m * a.x)}`),
        ligne(`=${q(p)}`),
      ]),
      [],
      "Ordonnée à l'origine",
    ),
  );
  // Vérification : le point (0 ; p) de l'axe Oy vérifie l'équation cartésienne de d.
  const verif = [
    verification("b", [texte("Le point "), latex(pt("P", { x: 0, y: p })), texte(" de l'axe Oy vérifie l'équation cartésienne "), latex(equation(e.referenceImplicite)), texte(" de d : ")], lignesPointSurCartesienne(e.referenceImplicite, { x: 0, y: p }, "P")),
  ];
  const pieges: Fragments =
    u.y === 0
      ? [texte("Une droite horizontale a une pente NULLE (elle existe : "), latex("m=0"), texte(") ; seule une droite verticale n'a pas de pente.")]
      : demande === "angleOx"
        ? [texte("Quand la pente est négative, la calculatrice donne un angle négatif : on lui ajoute 180° pour obtenir l'angle de la droite, compris entre 0° et 180°.")]
        : demande === "angleOy"
          ? [texte("L'angle avec Oy n'est pas l'angle avec Ox : "), latex("\\theta_{Oy}=90^\\circ-\\tan^{-1}m"), texte(".")]
          : [texte("La pente est "), latex("\\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}"), texte(" (variation de y sur variation de x), pas son inverse.")];
  return [utilise("b", utiliseB), ...blocs, resultat("b", [latex(formatCaracteristiquesAttenduesLatex(e))]), ...verif, piege("b", pieges)];
}

export function correctionDetailleeCaracteristiquesDroite(e: E): EtapeCorrection[] {
  return finaliserVecteurs([...etapesExtraction(e), ...etapesCaracteristiques(e)]);
}
