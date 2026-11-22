import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { DroiteDonneeRelation, ExerciceRelationsDroites } from "../../core/relationsDroites.types";
import type { Composantes } from "../../core/vecteur.types";
import { q, qp } from "../../ui/corrigeChapitre3";
import {
  COURS_DROITE,
  COURS_RELATIONS,
  col,
  lignesCartesienneParNormale,
  lignesCritereColinearite,
  lignesCritereOrthogonalite,
  lignesMultipleEntier,
  lignesParametriques,
  pt,
  type Fragments,
} from "../../ui/corrigeAnalytique1";
import { lignesPointSurDroite } from "../../ui/corrigeLotG";
import { reduireDroite } from "../../ui/geometrieLotG";
import { finaliserVecteurs } from "../../ui/corrigeVecteurs2";
import { figureLotG } from "../../ui/figureLotG";
import { droiteDonnee1, formatEquationAttendueLatex, LIBELLE_CRITERE } from "../../ui/formatRelationsDroites";

/**
 * Corrigé détaillé « comme au tableau » de gen45 « Relations entre droites (parallèles /
 * perpendiculaires) » — règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN
 * (`SEQUENCES_RELATIONS_DROITES`) : construction = vecteur directeur de d, vecteur directeur de d′
 * (parallèle : le même ; perpendiculaire : composantes échangées, un signe changé), équation de d′ ;
 * reconnaissance = vecteur de d₁, vecteur de d₂, critères (colinéarité d'abord, orthogonalité
 * ensuite). Jamais « déterminant ». Figure de d et d′ sous l'équation. Partagé par l'adaptateur et
 * l'appli.
 */

type E = ExerciceRelationsDroites;

/** Vecteur lu sur l'équation affichée (règle de l'écran) — peut être fractionnaire (y = mx + p). */
function vecteurLu(d: DroiteDonneeRelation): Composantes {
  switch (d.formeEntree) {
    case "implicite":
      return { x: d.impliciteEntree!.b === 0 ? 0 : -d.impliciteEntree!.b, y: d.impliciteEntree!.a };
    case "explicite_y":
      return { x: 1, y: d.expliciteYEntree!.m };
    case "explicite_x":
      return { x: d.expliciteXEntree!.n, y: 1 };
    case "parametrique":
      return { x: d.parametriqueEntree!.a, y: d.parametriqueEntree!.b };
  }
}

function regle(d: DroiteDonneeRelation, nom: string): Fragments {
  switch (d.formeEntree) {
    case "implicite":
      return [texte("Pour "), latex("ax+by+c=0"), texte(", un vecteur directeur est "), latex("\\begin{pmatrix}-b\\\\a\\end{pmatrix}")];
    case "explicite_y":
      return [texte("Pour "), latex("y=mx+p"), texte(", un vecteur directeur est "), latex("\\begin{pmatrix}1\\\\m\\end{pmatrix}")];
    case "explicite_x":
      return [texte("Pour "), latex("x=ny+q"), texte(", un vecteur directeur est "), latex("\\begin{pmatrix}n\\\\1\\end{pmatrix}")];
    case "parametrique":
      return [texte("Dans des équations paramétriques, les coefficients de t sont les composantes d'un vecteur directeur de "), latex(nom)];
  }
}

function lignesLecture(d: DroiteDonneeRelation, nomV: string, retenu: Composantes): LigneCalcul[] {
  const lu = vecteurLu(d);
  const v = `\\vec{${nomV}}`;
  let premiere: LigneCalcul;
  switch (d.formeEntree) {
    case "implicite": {
      const { a, b } = d.impliciteEntree!;
      premiere = ligne(`${v}=\\begin{pmatrix}-${qp(b)}\\\\${q(a)}\\end{pmatrix}${b < 0 ? `=${col(lu)}` : ""}`, [latex(`a=${q(a)}`), texte(", "), latex(`b=${q(b)}`)]);
      if (b === 0) premiere = ligne(`${v}=${col(lu)}`, [latex(`a=${q(a)}`), texte(", "), latex("b=0")]);
      break;
    }
    case "explicite_y":
      premiere = ligne(`${v}=${col(lu)}`, [texte("pente "), latex(`m=${q(lu.y)}`)]);
      break;
    case "explicite_x":
      premiere = ligne(`${v}=${col(lu)}`, [latex(`n=${q(lu.x)}`)]);
      break;
    case "parametrique":
      premiere = ligne(`${v}=${col(lu)}`, "coefficients de t, lus dans les équations");
      break;
  }
  return [premiere, ...lignesMultipleEntier(lu, retenu)];
}

function etapesExtraction(l: string, d: DroiteDonneeRelation, nomDroite: string, nomV: string, retenu: Composantes): EtapeCorrection[] {
  const lu = vecteurLu(d);
  const egal = lu.x === retenu.x && lu.y === retenu.y;
  return [
    utilise(l, [...regle(d, nomDroite), texte(" ; tout multiple non nul convient "), texte(`${COURS_DROITE}.`)]),
    calcul(l, lignesLecture(d, nomV, retenu)),
    resultat(l, [texte(`Vecteur directeur de `), latex(nomDroite), texte(" : "), latex(`\\vec{${nomV}}=${col(retenu)}`), texte(egal ? "." : " (multiple à composantes entières).")]),
    piege(l, d.formeEntree === "implicite" ? [texte("Les coefficients a et b ne sont pas les composantes du vecteur directeur : il faut "), latex("\\begin{pmatrix}-b\\\\a\\end{pmatrix}"), texte(", pas "), latex("\\begin{pmatrix}a\\\\b\\end{pmatrix}"), texte(" (vecteur normal).")] : d.formeEntree === "parametrique" ? [texte("Les constantes des équations paramétriques donnent un POINT de la droite, pas son vecteur directeur.")] : [texte("Le coefficient se place dans la bonne composante : "), latex(d.formeEntree === "explicite_y" ? "\\begin{pmatrix}1\\\\m\\end{pmatrix}" : "\\begin{pmatrix}n\\\\1\\end{pmatrix}"), texte(".")]),
  ];
}

function figure(e: E): string {
  const r1 = reduireDroite({ a: e.vecteurReference.y, b: -e.vecteurReference.x, c: 0 });
  // d : depuis l'équation donnée (référence implicite de d recalculée par un de ses points).
  const d1 = droiteDonnee1(e);
  const p0 = pointDe(d1);
  const d = reduireDroite({ a: r1.a, b: r1.b, c: -(r1.a * p0.x + r1.b * p0.y) });
  const dp = reduireDroite(e.referenceImpliciteSortie);
  return figureLotG({
    droites: [
      { d, couleur: "bleu", nom: "d" },
      { d: dp, couleur: "accent", nom: "d'" },
    ],
    points: [{ p: e.pointCherche, nom: "A", couleur: "accent" }],
  });
}

function pointDe(d: DroiteDonneeRelation): { x: number; y: number } {
  switch (d.formeEntree) {
    case "implicite": {
      const { a, b, c } = d.impliciteEntree!;
      return b !== 0 ? { x: 0, y: -c / b } : { x: -c / a, y: 0 };
    }
    case "explicite_y":
      return { x: 0, y: d.expliciteYEntree!.p };
    case "explicite_x":
      return { x: d.expliciteXEntree!.q, y: 0 };
    case "parametrique":
      return { x: d.parametriqueEntree!.x0, y: d.parametriqueEntree!.y0 };
  }
}

function etapesConstruction(e: E): EtapeCorrection[] {
  const u = e.vecteurReference;
  const v = e.vecteurCherche;
  const para = e.critere === "parallele";
  return [
    utilise("b", para ? [texte("Deux droites parallèles ont le même vecteur directeur (ou des vecteurs colinéaires) "), texte(`${COURS_RELATIONS}.`)] : [texte("Deux droites sont perpendiculaires si leurs vecteurs directeurs sont orthogonaux ; "), latex("\\begin{pmatrix}-y_{\\vec{u}}\\\\x_{\\vec{u}}\\end{pmatrix}"), texte(" est orthogonal à "), latex("\\vec{u}"), texte(` ${COURS_RELATIONS}.`)]),
    calcul(
      "b",
      para
        ? [ligne(`\\vec{v}=${col(v)}`, [texte("même direction que "), latex("\\vec{u}"), texte(" : on garde le même vecteur")])]
        : [ligne(`\\vec{v}=\\begin{pmatrix}-${qp(u.y)}\\\\${q(u.x)}\\end{pmatrix}`, "on échange les composantes et on change le signe de la première"), ...(u.y === 0 || u.y < 0 ? [ligne(`=${col(v)}`)] : [])],
    ),
    resultat("b", [texte(`Vecteur directeur de d′ (${LIBELLE_CRITERE[e.critere]} à d) : `), latex(`\\vec{v}=${col(v)}`), texte(".")]),
    verification("b", [texte(para ? "Le critère de colinéarité de " : "Le critère d'orthogonalité de "), latex("\\vec{u}"), texte(" et "), latex("\\vec{v}"), texte(" est nul : ")], para ? lignesCritereColinearite(u, v) : lignesCritereOrthogonalite(u, v)),
    piege(
      "b",
      u.x === 0 || u.y === 0
        ? [texte(para ? "La parallèle à une droite horizontale (verticale) est elle aussi horizontale (verticale) : seule sa constante change, imposée par A." : "La perpendiculaire à une droite horizontale est verticale (et inversement) : son équation est du type "), ...(para ? [] : [latex("x=k"), texte(" ou "), latex("y=k"), texte(".")])]
        : para
          ? [texte("d′ a le même vecteur directeur que d mais passe par A : recopier l'équation de d donnerait d elle-même, pas d′.")]
          : [texte("Pour un vecteur perpendiculaire, on échange les composantes ET on change le signe d'une seule : "), latex("\\begin{pmatrix}x\\\\y\\end{pmatrix}\\to\\begin{pmatrix}-y\\\\x\\end{pmatrix}"), texte(".")],
    ),
  ];
}

function etapesEquation(e: E): EtapeCorrection[] {
  const v = e.vecteurCherche;
  const a = e.pointCherche;
  const cart = e.formeSortie === "cartesienne";
  const finale = reduireDroite(e.referenceImpliciteSortie);
  return [
    utilise("c", cart ? [texte("Droite par A de vecteur directeur "), latex("\\vec{v}"), texte(" : "), latex("y_{\\vec{v}}\\,(x-x_A)-x_{\\vec{v}}\\,(y-y_A)=0"), texte(` ${COURS_DROITE}.`)] : [texte("Équations paramétriques par A, de vecteur directeur "), latex("\\vec{v}"), texte(" : "), latex("x=x_A+x_{\\vec{v}}\\,t"), texte(", "), latex("y=y_A+y_{\\vec{v}}\\,t"), texte(` ${COURS_DROITE}.`)]),
    calcul("c", cart ? lignesCartesienneParNormale(v, a, [texte("vecteur normal "), latex("\\begin{pmatrix}y_{\\vec{v}}\\\\-x_{\\vec{v}}\\end{pmatrix}"), texte(", point A")], true).lignes : lignesParametriques(a, v, "A", "v")),
    { ...resultat("c", [latex(`d'\\equiv ${formatEquationAttendueLatex(e)}`)]), figureHtml: figure(e) },
    ...(cart ? [verification("c", [texte("Le point "), latex(pt("A", a)), texte(" vérifie l'équation de d′ : ")], lignesPointSurDroite(finale, a, "A"))] : [verification("c", [texte("Pour "), latex("t=0"), texte(", on retrouve "), latex(pt("A", a)), texte(" : d′ passe bien par A.")])]),
    piege("c", [texte("La droite d′ passe par A, pas par un point de d : on remplace les coordonnées de A, avec le vecteur directeur de d′ (pas celui de d si elles sont perpendiculaires).")]),
  ];
}

function etapesRelation(e: E): EtapeCorrection[] {
  const u = e.vecteurReference;
  const v = e.droite2!.vecteur;
  const colin = u.x * v.y - u.y * v.x;
  const ortho = u.x * v.x + u.y * v.y;
  const blocs: EtapeCorrection[] = [calcul("c", lignesCritereColinearite(u, v), [], "Colinéarité")];
  if (colin !== 0) blocs.push(calcul("c", [...lignesCritereOrthogonalite(u, v)], [], "Orthogonalité"));
  const res: Fragments =
    e.relation === "paralleles"
      ? [latex("d_1"), texte(" et "), latex("d_2"), texte(" sont parallèles : leur critère de colinéarité est nul.")]
      : e.relation === "perpendiculaires"
        ? [latex("d_1"), texte(" et "), latex("d_2"), texte(" sont perpendiculaires : critère de colinéarité "), latex(`${q(colin)}\\neq 0`), texte(", critère d'orthogonalité nul.")]
        : [latex("d_1"), texte(" et "), latex("d_2"), texte(" ne sont ni parallèles ni perpendiculaires : critères "), latex(`${q(colin)}\\neq 0`), texte(" et "), latex(`${q(ortho)}\\neq 0`), texte(".")];
  return [
    utilise("c", [texte("D'abord le critère de colinéarité "), latex("x_{\\vec{u}}\\cdot y_{\\vec{v}}-y_{\\vec{u}}\\cdot x_{\\vec{v}}"), texte(" (nul : parallèles) ; sinon le critère d'orthogonalité "), latex("x_{\\vec{u}}\\cdot x_{\\vec{v}}+y_{\\vec{u}}\\cdot y_{\\vec{v}}"), texte(` (nul : perpendiculaires) ${COURS_RELATIONS}.`)]),
    ...blocs,
    resultat("c", res),
    piege("c", [texte("Les deux critères ne se confondent pas : la colinéarité « croise » les composantes, l'orthogonalité multiplie les composantes de même nom.")]),
  ];
}

export function correctionDetailleeRelationsDroites(e: E): EtapeCorrection[] {
  if (e.famille === "reconnaissance") {
    const d2 = e.droite2!;
    return finaliserVecteurs([...etapesExtraction("a", droiteDonnee1(e), "d_1", "u", e.vecteurReference), ...etapesExtraction("b", d2, "d_2", "v", d2.vecteur), ...etapesRelation(e)]);
  }
  return finaliserVecteurs([...etapesExtraction("a", droiteDonnee1(e), "d", "u", e.vecteurReference), ...etapesConstruction(e), ...etapesEquation(e)]);
}
