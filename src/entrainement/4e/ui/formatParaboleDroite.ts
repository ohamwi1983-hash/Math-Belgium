import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceParaboleDroite } from "../core/paraboleDroite.types";
import { evaluerG } from "../generateurs/paraboleDroite";
import { ensembleLatex, ensembleRelation, nombreLatex, symboleLatex, type Poly2 } from "../moteur/algebreTransfertSecondDegre";
import type { Champ, EcranTSD } from "./ecransTransfertSecondDegre";
import { figureParaboleDroiteSvg } from "./figuresTransfertSecondDegre";
import { polynome } from "./corrigeChapitre3";

/**
 * Textes et écrans de gen118 (« Parabole et droite : intersection et position »). Écrans :
 * 1. f(x) = g(x) ramené à 0 (toute équation proportionnelle acceptée) ; 2. ses solutions (abscisses
 * des points communs, « aucune » possible) ; 3. les ordonnées des points communs (écran absent s'il
 * n'y en a pas) ; 4. f(x) ◇ g(x) par le signe de f − g (ensemble construit), puis la figure.
 */

type E = ExerciceParaboleDroite;

export const CONSIGNE_GENERALE = "Détermine les points communs à la parabole d'équation y = f(x) et à la droite d'équation y = g(x), puis résous l'inéquation demandée.";

export function fLatex(e: E): string {
  return polynome(e.f);
}

export function gLatex(e: E): string {
  return polynome([e.g[0], e.g[1]]);
}

export function hLatex(e: E): string {
  return polynome(e.h);
}

export function inequationLatex(e: E): string {
  return `f(x)${symboleLatex(e.symbole)}g(x)`;
}

export function solutionInequation(e: E) {
  return ensembleRelation(e.h, e.symbole);
}

export function pointLatex(e: E, x: number): string {
  return `(${nombreLatex(x)}\\,;${nombreLatex(evaluerG(e.g, x))})`;
}

export function pointsLatex(e: E): string {
  return e.communs.map((x) => pointLatex(e, x)).join("\\ \\text{et}\\ ");
}

export function figure(e: E): string {
  return figureParaboleDroiteSvg(e.f, e.g, e.communs, "parabole y = f(x)", "droite y = g(x)");
}

export function ecrans(e: E): EcranTSD[] {
  const [m, p] = e.g;
  const somme: Poly2 = [e.f[0], e.f[1] + m, e.f[2] + p];
  const signeP: Poly2 = [e.f[0], e.f[1] - m, e.f[2] + p];
  const signeM: Poly2 = [e.f[0], e.f[1] + m, e.f[2] - p];
  const piegesEq = [
    { poly: somme, message: "Pour ramener à 0, on soustrait g(x) des deux membres : $f(x)-g(x)=0$." },
    { poly: signeP, message: "Attention au signe du terme constant de g : la parenthèse $-(mx+p)$ change les deux signes." },
    { poly: signeM, message: "Attention au signe du terme en x de g : la parenthèse $-(mx+p)$ change les deux signes." },
  ].filter((x) => x.poly.some((c, i) => c !== e.h[i]) && !x.poly.every((c, i) => c === e.h[i]));
  const S = solutionInequation(e);
  const fig = figure(e);
  const tous: EcranTSD[] = [
    {
      type: "champs",
      titre: "Ramener à 0",
      consigne: [texte("Les points communs vérifient "), latex("f(x)=g(x)"), texte(". Ramène cette équation à la forme "), latex("ax^2+bx+c=0\\text{.}")],
      champs: [{ type: "equation", id: "eq", libelle: [texte("Équation :")], variable: "x", cible: e.h, pieges: piegesEq, messageSiFaux: "Écris $f(x)=g(x)$, puis soustrais g(x) des deux membres et réduis." }],
      aides: [
        [texte("Écris l'égalité des deux expressions : "), latex(`${fLatex(e)}=${gLatex(e)}`)],
        [texte("Soustrais g(x) des deux membres, en mettant g(x) entre parenthèses : "), latex(`${fLatex(e)}-(${gLatex(e)})=0`)],
      ],
      reponse: [latex(`${hLatex(e)}=0`)],
    },
    {
      type: "champs",
      titre: "Résoudre",
      consigne: [texte("Résous l'équation "), latex(`${hLatex(e)}=0\\text{.}`), texte(" Ses solutions sont les abscisses des points communs.")],
      champs: [{ type: "liste", id: "x", libelle: [texte("Solutions : "), latex("x=")], cibles: e.communs, videPermis: true, pieges: e.communs.length ? [{ valeurs: e.communs.map((x) => -x), message: "Ce sont les opposées des solutions : dans la formule, c'est $-b$." }] : [], messageSiFaux: "Calcule $\\Delta=b^2-4ac$ ; s'il est négatif, écris « aucune »." }],
      aides: [[texte("Calcule le discriminant : "), latex("\\Delta=b^2-4ac")], [texte("Δ > 0 : deux points communs ; Δ = 0 : un seul (la droite est tangente) ; Δ < 0 : aucun.")]],
      reponse: e.communs.length ? [latex(`x=${e.communs.map(nombreLatex).join("\\ \\text{ou}\\ x=")}`)] : [texte("Aucune solution : la parabole et la droite n'ont aucun point commun.")],
    },
  ];
  if (e.communs.length) {
    const champs: Champ[] = e.communs.map((x, i) => ({
      type: "nombre",
      id: `y${i}`,
      libelle: [texte("ordonnée pour "), latex(`x=${nombreLatex(x)}`), texte(" : "), latex("y=")],
      cible: evaluerG(e.g, x),
      pieges: evaluerG(e.g, x) !== 0 ? [{ valeur: 0, message: "C'est f(x) − g(x) qui vaut 0 ; l'ordonnée se calcule avec g(x) (ou f(x))." }] : [],
      messageSiFaux: `Remplace x par ${nombreLatex(x).replace("-", "−")} dans g(x) (plus simple que f(x)).`,
    }));
    tous.push({
      type: "champs",
      titre: "Les points communs",
      consigne: [texte(e.communs.length === 2 ? "Calcule l'ordonnée de chaque point commun." : "Calcule l'ordonnée du point commun (la droite est tangente à la parabole).")],
      champs,
      aides: [[texte("Un point commun est sur la droite : son ordonnée vaut g(x).")], [texte("Remplace x par l'abscisse trouvée dans "), latex(`g(x)=${gLatex(e)}`)]],
      reponse: [latex(pointsLatex(e))],
    });
  }
  tous.push({
    type: "champs",
    titre: "La position",
    consigne: [texte("Résous l'inéquation "), latex(`${inequationLatex(e)}\\text{.}`)],
    champs: [{ type: "ensemble", id: "S", libelle: [texte("Ensemble des solutions :")], variable: "x", cible: S, pieges: [], messageSiFaux: "$f(x)\\lozenge g(x)$ revient à $f(x)-g(x)\\lozenge 0$ : étudie le signe de ce trinôme." }],
    aides: [
      [texte("Ramène à 0 : "), latex(`${inequationLatex(e)}\\iff ${hLatex(e)}${symboleLatex(e.symbole)}0`)],
      e.communs.length === 0
        ? [texte("Ce trinôme n'a aucune racine : il a partout le signe de son coefficient de "), latex("x^2"), texte(` (${nombreLatex(e.h[0]).replace("-", "−")}).`)]
        : [texte("Ce trinôme a le signe de son coefficient de "), latex("x^2"), texte(` (${nombreLatex(e.h[0]).replace("-", "−")}) à l'extérieur de ses racines.`)],
    ],
    reponse: [latex(`S=${ensembleLatex(S)}`)],
    figureApres: fig,
  });
  return tous;
}
