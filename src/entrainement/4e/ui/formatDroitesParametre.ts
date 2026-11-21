import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceDroitesParametre, PolyM, TypeQuestionParametre } from "../core/droitesParametre.types";
import { condition, degre, valeurP } from "../generateurs/droitesParametre";
import { verifierEquationM } from "../moteur/equationXY";
import type { EcranTSD } from "./ecransTransfertSecondDegre";
import { polynome, q, qp } from "./corrigeChapitre3";
import { droiteNommee, pointLatex, type Fragments } from "./geometrieLotG";

/**
 * Textes et écrans de gen95 « Droites dépendant d'un paramètre » — SOURCE UNIQUE pour l'écran, les
 * aides, le papier et le corrigé. Notation : dₘ ≡ a(m)·x + b(m)·y + c(m) = 0, vecteur directeur
 * (−b(m) ; a(m)) ; critère de colinéarité α·β′ − β·α′ = 0 (jamais « déterminant »), produit scalaire
 * α·α′ + β·β′ = 0 (§ 4).
 */

type E = ExerciceDroitesParametre;

export const NOMS: Record<TypeQuestionParametre, string> = {
  parallele: "est parallèle à d",
  perpendiculaire: "est perpendiculaire à d",
  point: "passe par P",
  horizontale: "est horizontale",
  verticale: "est verticale",
};

/** Polynôme en m (écriture du cours). */
export function poly(p: PolyM): string {
  return polynome([...p], "m");
}

/** Facteur en m entre parenthèses s'il a plusieurs termes ou s'il est négatif. */
export function par(p: PolyM): string {
  const s = poly(p);
  const termes = p.filter((x) => x !== 0).length;
  return termes > 1 || s.startsWith("-") ? `(${s})` : s;
}

export function neg(p: PolyM): PolyM {
  return [-p[0], -p[1], -p[2]].map((x) => (x === 0 ? 0 : x)) as PolyM;
}

/** Terme « a(m)·x » en tête ou à la suite ; un facteur de tête négatif sort de la parenthèse :
 * « −(m + 3)x » plutôt que « (−m − 3)x ». */
function termeVariable(p: PolyM, v: string, premier: boolean): string {
  const nz = p.filter((x) => x !== 0).length;
  if (nz === 0) return "";
  let corps: string;
  if (nz === 1) {
    const s = poly(p);
    corps = s === "1" ? v : s === "-1" ? `-${v}` : `${s}${v}`;
  } else {
    const tete = p.find((x) => x !== 0)!;
    corps = tete < 0 ? `-(${poly(neg(p))})${v}` : `(${poly(p)})${v}`;
  }
  return premier || corps.startsWith("-") ? corps : `+${corps}`;
}

export function membreFamille(e: E): string {
  const a = termeVariable(e.A, "x", true);
  const b = termeVariable(e.B, "y", a === "");
  const c = e.C.every((x) => x === 0) ? "" : poly(e.C);
  const cTerme = c === "" ? "" : c.startsWith("-") ? c : `+${c}`;
  return `${a}${b}${cTerme}`;
}

export function familleLatex(e: E): string {
  return `d_m\\equiv ${membreFamille(e)}=0`;
}

export function enonceFragments(e: E): Fragments {
  const debut: Fragments = [texte("On considère la famille de droites "), latex(familleLatex(e)), texte(" (m réel)")];
  if (e.d) return [...debut, texte(" et la droite "), latex(droiteNommee("d", e.d)), texte(".")];
  if (e.p) return [...debut, texte(" et le point "), latex(pointLatex("P", e.p)), texte(".")];
  return [...debut, texte(".")];
}

export function consigneGlobale(e: E): string {
  return `Détermine la ou les valeurs de m pour lesquelles la droite dₘ ${NOMS[e.variante]} (s'il y en a).`;
}

/* ---------------------------------------------------------------------------------------------
 * Écrans
 * ------------------------------------------------------------------------------------------- */

export const OPTIONS_CONDITION: Fragments[] = [
  [texte("Le critère de colinéarité de leurs vecteurs directeurs est nul : "), latex("\\alpha\\beta'-\\beta\\alpha'=0")],
  [texte("Le produit scalaire de leurs vecteurs directeurs est nul : "), latex("\\alpha\\alpha'+\\beta\\beta'=0")],
  [texte("Les coordonnées de P vérifient l'équation de "), latex("d_m"), texte(".")],
  [texte("Le coefficient de x est nul (et celui de y ne l'est pas).")],
  [texte("Le coefficient de y est nul (et celui de x ne l'est pas).")],
];

const INDEX_CONDITION: Record<TypeQuestionParametre, number> = { parallele: 0, perpendiculaire: 1, point: 2, horizontale: 3, verticale: 4 };

const MESSAGES_CONDITION: string[] = [
  "Deux droites parallèles ont des vecteurs directeurs colinéaires : c'est le critère de colinéarité qui doit être nul.",
  "Deux droites perpendiculaires ont des vecteurs directeurs orthogonaux : c'est leur produit scalaire qui doit être nul.",
  "Un point appartient à une droite exactement quand ses coordonnées vérifient son équation.",
  "Une droite horizontale y = k a un vecteur directeur (1 ; 0) : dans ax + by + c = 0, c'est le coefficient a de x qui est nul.",
  "Une droite verticale x = k a un vecteur directeur (0 ; 1) : dans ax + by + c = 0, c'est le coefficient b de y qui est nul.",
];

/** Vecteur directeur (−b(m) ; a(m)) de dₘ, en colonne. */
export function directeurFamille(e: E): string {
  return `\\vec{u}_m\\begin{pmatrix}${poly(neg(e.B))}\\\\${poly(e.A)}\\end{pmatrix}`;
}

export function directeurD(e: E): string {
  return `\\vec{v}\\begin{pmatrix}${q(-e.d!.b)}\\\\${q(e.d!.a)}\\end{pmatrix}`;
}

/** Première écriture de la condition (avant développement), comme au tableau. */
export function conditionPosee(e: E): string {
  // Formule du cours écrite en entier, même quand un facteur vaut 0 (α·β′ − β·α′, α·α′ + β·β′).
  const produit = (p: PolyM, k: number) => `${par(p)}\\cdot ${qp(k)}`;
  if (e.variante === "parallele") return `${produit(neg(e.B), e.d!.a)}-${produit(e.A, -e.d!.b)}=0`;
  if (e.variante === "perpendiculaire") return `${produit(neg(e.B), -e.d!.b)}+${produit(e.A, e.d!.a)}=0`;
  if (e.variante === "point") {
    const t = [produit(e.A, e.p!.x), produit(e.B, e.p!.y), e.C.every((x) => x === 0) ? "" : par(e.C)].filter((x) => x !== "");
    return `${t.join("+")}=0`;
  }
  return `${poly(e.variante === "horizontale" ? e.A : e.B)}=0`;
}

export function equationLatex(e: E): string {
  return `${poly(e.q)}=0`;
}

export function valeursFragments(e: E): Fragments {
  if (e.valeurs.length === 0) return [texte("Aucune valeur de m.")];
  if (e.valeurs.length === 1) return [latex(`m=${q(e.valeurs[0]!)}`)];
  return [latex(`m=${q(e.valeurs[0]!)}`), texte(" ou "), latex(`m=${q(e.valeurs[1]!)}`)];
}

function piegesEquation(e: E): { poly: PolyM; message: string }[] {
  const out: { poly: PolyM; message: string }[] = [];
  const ajoute = (p: PolyM, message: string) => {
    if (degre(p) > 0 && !(p[0] * e.q[1] === p[1] * e.q[0] && p[1] * e.q[2] === p[2] * e.q[1] && p[0] * e.q[2] === p[2] * e.q[0])) out.push({ poly: p, message });
  };
  if (e.variante === "parallele") ajoute(condition("perpendiculaire", e.A, e.B, e.C, e.d), "C'est la condition de perpendicularité (produit scalaire nul). Pour des droites parallèles, c'est le critère de colinéarité $\\alpha\\beta'-\\beta\\alpha'$ qui est nul.");
  if (e.variante === "perpendiculaire") ajoute(condition("parallele", e.A, e.B, e.C, e.d), "C'est la condition de parallélisme (critère de colinéarité). Pour des droites perpendiculaires, c'est le produit scalaire $\\alpha\\alpha'+\\beta\\beta'$ qui est nul.");
  if (e.variante === "point") ajoute(condition("point", e.A, e.B, e.C, undefined, { x: e.p!.y, y: e.p!.x }), "Tu as échangé x et y : remplace x par l'abscisse de P et y par son ordonnée.");
  if (e.variante === "horizontale") ajoute(e.B, "Tu as annulé le coefficient de y : la droite serait verticale. Une droite horizontale a un coefficient de x nul.");
  if (e.variante === "verticale") ajoute(e.A, "Tu as annulé le coefficient de x : la droite serait horizontale. Une droite verticale a un coefficient de y nul.");
  return out;
}

export function ecrans(e: E): EcranTSD[] {
  const bonne = INDEX_CONDITION[e.variante];
  const aideCondition: Fragments =
    e.variante === "parallele"
      ? [texte("Vecteurs directeurs : "), latex(directeurFamille(e)), texte(" et "), latex(directeurD(e)), texte(" ; critère de colinéarité : "), latex("\\alpha\\beta'-\\beta\\alpha'=0")]
      : e.variante === "perpendiculaire"
        ? [texte("Vecteurs directeurs : "), latex(directeurFamille(e)), texte(" et "), latex(directeurD(e)), texte(" ; produit scalaire : "), latex("\\alpha\\alpha'+\\beta\\beta'=0")]
        : e.variante === "point"
          ? [texte("Remplace x par "), latex(q(e.p!.x)), texte(" et y par "), latex(q(e.p!.y)), texte(" dans l'équation de "), latex("d_m"), texte(".")]
          : [texte("Le coefficient de "), texte(e.variante === "horizontale" ? "x" : "y"), texte(" dans "), latex(familleLatex(e)), texte(" est "), latex(poly(e.variante === "horizontale" ? e.A : e.B)), texte(".")];
  const piegesValeurs: { valeurs: number[]; message: string }[] = [];
  if (e.rejetees.length > 0) {
    const r = e.rejetees.map((x) => q(x)).join(" ; ");
    const msg = `Pour $m=${r}$, les coefficients de x et de y sont tous les deux nuls : l'équation n'est plus celle d'une droite. Cette valeur est à rejeter.`;
    piegesValeurs.push({ valeurs: e.racines, message: msg });
    if (e.valeurs.length > 0) piegesValeurs.push({ valeurs: e.rejetees, message: msg });
  }
  return [
    {
      type: "choix",
      titre: "La condition",
      consigne: [texte(`Quelle condition traduit « dₘ ${NOMS[e.variante]} » ?`)],
      options: OPTIONS_CONDITION,
      bonne,
      aides: [
        [texte("Parallèles : vecteurs directeurs colinéaires. Perpendiculaires : vecteurs directeurs orthogonaux. Point sur une droite : ses coordonnées vérifient l'équation. Horizontale ou verticale : regarde le vecteur directeur "), latex("\\begin{pmatrix}-b\\\\a\\end{pmatrix}"), texte(".")],
        [texte("Demande-toi ce que la question compare : deux directions, un point et une droite, ou un seul coefficient de l'équation.")],
      ],
      messageFaux: MESSAGES_CONDITION[bonne]!,
      messagesOptions: OPTIONS_CONDITION.map(() => MESSAGES_CONDITION[bonne]),
    },
    {
      type: "champs",
      titre: "L'équation en m",
      consigne: [texte("Traduis cette condition par une équation d'inconnue m.")],
      champs: [
        {
          type: "personnalise",
          id: "eqm",
          libelle: [texte("Équation en m :")],
          apercu: true,
          aideSaisie: "Équation en m : écris m² ou m^2, les produits peuvent rester implicites (3m, 2(m − 1)) ; toute équation équivalente est acceptée.",
          verifier: (saisie: string) =>
            verifierEquationM(
              saisie,
              (m) => valeurP(e.q, m),
              piegesEquation(e).map((p) => ({ f: (m: number) => valeurP(p.poly, m), message: p.message })),
              "Écris la condition avec les coefficients de $d_m$ (qui dépendent de m), puis développe.",
            ),
        },
      ],
      aides: [
        [texte("Dans "), latex("d_m\\equiv a(m)x+b(m)y+c(m)=0"), texte(", un vecteur directeur est "), latex("\\begin{pmatrix}-b(m)\\\\a(m)\\end{pmatrix}"), texte(" : écris la condition avec ces coefficients.")],
        aideCondition,
      ],
      reponse: [latex(equationLatex(e))],
    },
    {
      type: "champs",
      titre: "La ou les valeurs de m",
      consigne: [texte("Résous l'équation, puis garde seulement les valeurs pour lesquelles dₘ est bien une droite. Sépare les valeurs par « ; », ou écris « aucune ».")],
      champs: [
        {
          type: "liste",
          id: "valeurs",
          libelle: [texte("Valeur(s) de m :")],
          cibles: e.valeurs,
          pieges: piegesValeurs,
          videPermis: true,
          messageSiFaux: "Résous l'équation en m, puis vérifie pour chaque solution que les coefficients de x et de y ne sont pas tous les deux nuls.",
        },
      ],
      aides: [
        [texte("Premier degré : isole m. Second degré : "), latex("\\Delta=b^2-4ac"), texte(" ; si "), latex("\\Delta<0"), texte(", aucune solution. Ensuite, une valeur de m qui annule à la fois le coefficient de x et celui de y ne donne pas une droite.")],
        [texte("Ici, résous "), latex(equationLatex(e)), texte(", puis calcule les coefficients de x et de y pour chaque solution.")],
      ],
      reponse: valeursFragments(e),
    },
  ];
}

export function reponseBreveFragments(e: E): Fragments {
  return [latex(equationLatex(e)), texte(" ; "), ...valeursFragments(e)];
}
