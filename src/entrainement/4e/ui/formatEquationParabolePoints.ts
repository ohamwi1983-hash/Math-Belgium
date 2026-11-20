import { latex, texte } from "../../export/corrigeTableau";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceEquationParabolePoints, IdForme } from "../core/equationParabolePoints.types";
import { nombreLatex, type Poly2 } from "../moteur/algebreTransfertSecondDegre";
import type { Champ, EcranTSD } from "./ecransTransfertSecondDegre";
import { moinsH, polynome, q } from "./corrigeChapitre3";
import { figureParaboleGrille, figurePourEcran } from "./figureParaboleGrille";
import { canoniqueLatex, factoriseeLatex } from "../generateurs/equationParabolePoints";

/**
 * Textes, figure et écrans de gen125 « Retrouver l'équation d'une parabole » (écran ET papier : une
 * seule source). Notation du cours (décision de l'utilisateur) : forme canonique a(x − x_S)² + y_S,
 * factorisée a(x − x₁)(x − x₂), développée ax² + bx + c.
 */

type E = ExerciceEquationParabolePoints;
type Fragments = FragmentConsigne[];
const n = nombreLatex;

export const CONSIGNE_GENERALE = "Retrouve l'équation de la parabole : choisis la forme de départ adaptée aux données, calcule le ou les coefficients inconnus, puis écris l'équation sous forme développée.";

export const TITRES_ECRANS = ["La forme de départ", "Le coefficient", "L'équation développée"];

export function pointLatex(nom: string, p: { x: number; y: number }): string {
  return `${nom}(${n(p.x)}\\,;${n(p.y)})`;
}

/** Coefficient écrit devant une parenthèse : « », « - », « 2 », « \dfrac{1}{2} ». */
export function devant(a: number): string {
  return a === 1 ? "" : a === -1 ? "-" : q(a);
}

export function f(e: E, x: number): number {
  const [A, B, C] = e.coefficients;
  return A * x * x + B * x + C;
}

export function formeJusteLatex(e: E): string {
  return e.optionsForme.find((o) => o.id === "juste")!.latex;
}

/** La forme de départ avec la valeur de a (et de b) : « 2(x − 1)² − 3 ». */
export function formeAvecCoefficientLatex(e: E): string {
  const [A, B, C] = e.coefficients;
  if (e.donnees === "troisPoints") return polynome([A, B, C]);
  if (e.donnees === "sommet") return canoniqueLatex(e.sommet.x, e.sommet.y, devant(A));
  return factoriseeLatex(e.zeros[0]!, e.zeros[1]!, devant(A));
}

export function equationLatex(e: E): string {
  return `f(x)=${polynome(e.coefficients)}`;
}

export function enonceFragments(e: E): Fragments {
  if (e.variante === "graphique") return [texte("On a tracé une parabole ; le point "), latex("P"), texte(" marqué est sur un nœud du quadrillage. Détermine son équation, sous forme développée.")];
  if (e.donnees === "sommet") return [texte("Une parabole a pour sommet "), latex(pointLatex("S", e.sommet)), texte(" et passe par le point "), latex(pointLatex("P", e.point)), texte(". Détermine son équation, sous forme développée.")];
  if (e.donnees === "zeros") return [texte("Une parabole coupe l'axe des x en "), latex(n(e.zeros[0]!)), texte(" et en "), latex(n(e.zeros[1]!)), texte(", et passe par le point "), latex(pointLatex("P", e.point)), texte(". Détermine son équation, sous forme développée.")];
  const [A0, B0, C0] = e.points;
  return [texte("Une parabole passe par les points "), latex(pointLatex("A", A0!)), texte(", "), latex(pointLatex("B", B0!)), texte(" et "), latex(pointLatex("C", C0!)), texte(". Détermine son équation, sous forme développée.")];
}

export function consignesEcrans(e: E): Fragments[] {
  return [
    [texte("Quelle forme de départ permet de trouver l'équation ?")],
    e.donnees === "troisPoints"
      ? [texte("Remplace les coordonnées de "), latex("B"), texte(" et de "), latex("C"), texte(" dans "), latex(formeJusteLatex(e)), texte(", puis résous le système pour trouver "), latex("a"), texte(" et "), latex("b"), texte(".")]
      : [texte("Remplace les coordonnées de "), latex("P"), texte(" dans "), latex(formeJusteLatex(e)), texte(" pour trouver "), latex("a"), texte(".")],
    [texte("Écris l'équation de la parabole sous forme développée.")],
  ];
}

export function reponseForme(e: E): Fragments {
  return [latex(`f(x)=${formeJusteLatex(e)}`)];
}

export function reponseCoefficients(e: E): Fragments {
  const [A, B] = e.coefficients;
  if (e.donnees === "troisPoints") return [latex(`a=${n(A)}`), texte(" et "), latex(`b=${n(B)}`)];
  return [latex(`a=${n(A)}`)];
}

export function reponseEquation(e: E): Fragments {
  return [latex(equationLatex(e))];
}

// ---------------------------------------------------------------------------------------------
// Figure (variante graphique)
// ---------------------------------------------------------------------------------------------

export function figure(e: E): string {
  if (!e.fenetre) return "";
  return figureParaboleGrille((x) => f(e, x), e.fenetre, { points: [{ x: e.point.x, y: e.point.y, label: "P", couleur: "#1b1d22", labelPosition: e.point.y >= e.fenetre.yMax - 1.5 ? "dessous" : "dessus" }] });
}

export function figureAnnotee(e: E): string {
  if (!e.fenetre) return "";
  const lab = (x: number, y: number) => `(${n(x).replace("-", "−")} ; ${n(y).replace("-", "−")})`;
  const pts = [{ x: e.point.x, y: e.point.y, label: `P${lab(e.point.x, e.point.y)}`, couleur: "#1b1d22", labelPosition: (e.point.y >= e.fenetre.yMax - 1.5 ? "dessous" : "dessus") as "dessous" | "dessus" }];
  if (e.donnees === "sommet") pts.push({ x: e.sommet.x, y: e.sommet.y, label: `S${lab(e.sommet.x, e.sommet.y)}`, couleur: "#c2410c", labelPosition: e.coefficients[0] > 0 ? "dessous" : "dessus" });
  else for (const z of e.zeros) pts.push({ x: z, y: 0, label: lab(z, 0), couleur: "#2f9e44", labelPosition: e.coefficients[0] > 0 ? "dessus" : "dessous" });
  return figureParaboleGrille((x) => f(e, x), e.fenetre, { points: pts });
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

const MESSAGES_FORME: Record<IdForme, string | undefined> = {
  juste: undefined,
  signe: "Attention au signe dans la parenthèse : pour la valeur 2, on écrit (x − 2) ; pour −2, on écrit (x + 2).",
  pointSommet: "Ce point n'est pas le sommet : la forme canonique n'utilise que le sommet. Un point quelconque sert ensuite à trouver a.",
  sansA: "Il manque le coefficient a : sans lui, la parabole aurait la même ouverture que y = x². Le point sert justement à trouver a.",
  cAutre: "c est l'ordonnée à l'origine : il se lit sur le point d'abscisse 0, pas sur un autre point.",
};

function aidesForme(e: E): Fragments[] {
  const rappel: Fragments = [texte("Sommet connu : forme canonique "), latex("a(x-x_S)^2+y_S"), texte(" ; deux zéros connus : forme factorisée "), latex("a(x-x_1)(x-x_2)"), texte(" ; sinon "), latex("ax^2+bx+c"), texte(". Il reste toujours au moins "), latex("a"), texte(" à trouver.")];
  if (e.variante === "graphique") return [rappel, [texte("Sur le graphique, regarde si le sommet tombe sur un nœud du quadrillage, puis si la parabole coupe l'axe des x sur des nœuds : utilise ce qui se lit exactement.")]];
  if (e.donnees === "troisPoints") return [rappel, [texte("Ici, ni sommet ni zéros : mais "), latex("A"), texte(" a pour abscisse 0, et "), latex("f(0)=c"), texte(".")]];
  return [rappel, [texte(e.donnees === "sommet" ? "Ici, on connaît le sommet : remplace " : "Ici, on connaît les zéros : remplace "), latex(e.donnees === "sommet" ? "x_S" : "x_1"), texte(" et "), latex(e.donnees === "sommet" ? "y_S" : "x_2"), texte(" par leurs valeurs, en gardant le « − » de la parenthèse.")]];
}

/** Expression de f(xP) avec a en lettre : « a(0 − 2)² − 1 ». */
export function substitutionLatex(e: E, p: { x: number }): string {
  if (e.donnees === "sommet") return `a(${moinsH(e.sommet.x, n(p.x))})^2${e.sommet.y === 0 ? "" : e.sommet.y > 0 ? `+${n(e.sommet.y)}` : `-${n(-e.sommet.y)}`}`;
  return `a(${moinsH(e.zeros[0]!, n(p.x))})(${moinsH(e.zeros[1]!, n(p.x))})`;
}

export function ecrans(e: E): EcranTSD[] {
  const [A, B, C] = e.coefficients;
  const iJuste = e.optionsForme.findIndex((o) => o.id === "juste");
  let champsCoef: Champ[];
  let aidesCoef: Fragments[];
  if (e.donnees === "troisPoints") {
    const [, P1, P2] = e.points;
    champsCoef = [
      { type: "nombre", id: "a", libelle: [latex("a=")], cible: A, pieges: [{ valeur: B, message: "C'est la valeur de $b$ : vérifie quelle lettre multiplie $x^2$." }].filter((p) => p.valeur !== A), messageSiFaux: "Écris une équation par point, puis élimine $b$ (par exemple en combinant les deux équations)." },
      { type: "nombre", id: "b", libelle: [latex("b=")], cible: B, pieges: [{ valeur: A, message: "C'est la valeur de $a$." }].filter((p) => p.valeur !== B), messageSiFaux: "Une fois $a$ trouvé, remplace-le dans l'équation donnée par $B$." },
    ];
    aidesCoef = [
      [texte("Un point est sur la parabole si ses coordonnées vérifient l'équation : remplace "), latex("x"), texte(" et "), latex("f(x)"), texte(" pour chacun des points "), latex("B"), texte(" et "), latex("C"), texte(".")],
      [texte("Avec "), latex(pointLatex("B", P1!)), texte(" : "), latex(`a\\cdot 1^2+b\\cdot 1${C === 0 ? "" : C > 0 ? `+${n(C)}` : `-${n(-C)}`}=${n(P1!.y)}`), texte(" ; avec "), latex(pointLatex("C", P2!)), texte(" : "), latex(`a\\cdot (${n(P2!.x)})^2+b\\cdot (${n(P2!.x)})${C === 0 ? "" : C > 0 ? `+${n(C)}` : `-${n(-C)}`}=${n(P2!.y)}`), texte(".")],
    ];
  } else {
    const p = e.point;
    const piegesA =
      e.donnees === "sommet"
        ? [
            { valeur: p.y / (p.x - e.sommet.x) ** 2, message: "Tu as oublié $y_S$ : retire-le avant de diviser." },
            { valeur: (p.y + e.sommet.y) / (p.x - e.sommet.x) ** 2, message: "Attention au signe de $y_S$ quand tu le fais passer de l'autre côté." },
            ...(e.sommet.x !== 0 ? [{ valeur: (p.y - e.sommet.y) / (p.x + e.sommet.x) ** 2, message: "Dans la parenthèse, c'est $x_P-x_S$ : attention au signe de $x_S$." }] : []),
          ]
        : [
            { valeur: -A, message: "Vérifie le signe du produit des deux parenthèses." },
            ...(p.x + e.zeros[0]! !== 0 && p.x + e.zeros[1]! !== 0 ? [{ valeur: p.y / ((p.x + e.zeros[0]!) * (p.x + e.zeros[1]!)), message: "Dans les parenthèses, c'est $x_P-x_1$ et $x_P-x_2$ : attention aux signes." }] : []),
          ];
    champsCoef = [{ type: "nombre", id: "a", libelle: [latex("a=")], cible: A, pieges: piegesA.filter((x, i, t) => Number.isFinite(x.valeur) && Math.abs(x.valeur - A) > 1e-9 && t.findIndex((y) => Math.abs(y.valeur - x.valeur) < 1e-9) === i), messageSiFaux: "Remplace $x$ et $f(x)$ par les coordonnées de P, calcule ce qui est connu, puis isole $a$." }];
    aidesCoef = [
      [texte("Le point "), latex("P"), texte(" est sur la parabole : ses coordonnées vérifient l'équation. Remplace "), latex("x"), texte(" par son abscisse et "), latex("f(x)"), texte(" par son ordonnée.")],
      e.variante === "graphique"
        ? [texte("Lis les coordonnées de "), latex("P"), texte(" sur le quadrillage, remplace-les dans "), latex(`f(x)=${formeJusteLatex(e)}`), texte(", calcule le nombre devant "), latex("a"), texte(", puis isole "), latex("a"), texte(".")]
        : [texte("Ici : "), latex(`${substitutionLatex(e, p)}=${n(p.y)}`), texte(" ; calcule le nombre devant "), latex("a"), texte(", puis isole "), latex("a"), texte(".")],
    ];
  }
  const piegesEq: { poly: Poly2; message: string }[] = [];
  if (e.donnees === "sommet" && A !== 1) piegesEq.push({ poly: [A, -2 * e.sommet.x, e.sommet.x ** 2 + e.sommet.y], message: "Le coefficient $a$ multiplie tout le carré développé, pas seulement $x^2$." });
  if (e.donnees === "sommet" && e.sommet.x !== 0) piegesEq.push({ poly: [A, 0, -A * e.sommet.x ** 2 + e.sommet.y], message: "$(x-h)^2$ n'est pas $x^2-h^2$ : utilise $(x-h)^2=x^2-2hx+h^2$." });
  if (e.donnees === "zeros" && A !== 1) piegesEq.push({ poly: [A, -(e.zeros[0]! + e.zeros[1]!), e.zeros[0]! * e.zeros[1]!], message: "Le coefficient $a$ multiplie tout le produit développé, pas seulement $x^2$." });
  const piegesEqFiltres = piegesEq.filter((p) => p.poly.some((c, i) => Math.abs(c - e.coefficients[i]!) > 1e-9));
  return [
    {
      type: "choix",
      titre: TITRES_ECRANS[0]!,
      consigne: consignesEcrans(e)[0]!,
      options: e.optionsForme.map((o) => [latex(`f(x)=${o.latex}`)]),
      bonne: iJuste,
      aides: aidesForme(e),
      messageFaux: "Ce n'était pas la bonne forme de départ.",
      messagesOptions: e.optionsForme.map((o) => MESSAGES_FORME[o.id]),
    },
    {
      type: "champs",
      titre: TITRES_ECRANS[1]!,
      consigne: consignesEcrans(e)[1]!,
      champs: champsCoef,
      aides: aidesCoef,
      reponse: reponseCoefficients(e),
    },
    {
      type: "champs",
      titre: TITRES_ECRANS[2]!,
      consigne: consignesEcrans(e)[2]!,
      champs: [{ type: "expression", id: "f", libelle: [latex("f(x)=")], variable: "x", cible: [A, B, C], pieges: piegesEqFiltres, messageSiFaux: "Remplace $a$ dans la forme de départ, puis développe et réduis." }],
      aides: [
        [texte("Remplace "), latex("a"), texte(e.donnees === "troisPoints" ? " et " : " dans la forme de départ, puis développe : "), ...(e.donnees === "troisPoints" ? [latex("b"), texte(" dans "), latex("ax^2+bx+c"), texte(".")] : [latex(e.donnees === "sommet" ? "(x-h)^2=x^2-2hx+h^2" : "(x-p)(x-q)=x^2-px-qx+pq"), texte(", puis distribue "), latex("a"), texte(".")])],
        e.donnees === "troisPoints" ? [texte("Garde "), latex(`c=${n(C)}`), texte(", lu sur le point "), latex("A"), texte(" d'abscisse 0.")] : [texte("Ici : "), latex(`f(x)=${formeAvecCoefficientLatex(e)}`), texte(".")],
      ],
      reponse: reponseEquation(e),
      figureApres: e.variante === "graphique" ? figurePourEcran(figureAnnotee(e)) : undefined,
    },
  ];
}
