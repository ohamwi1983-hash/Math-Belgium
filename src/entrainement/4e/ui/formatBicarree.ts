import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceBicarree } from "../core/bicarree.types";
import { solutionsX, tGardees, trinomeT } from "../generateurs/bicarree";
import { ensembleLatex, ensemblePoints, nombreLatex, type Poly2 } from "../moteur/algebreTransfertSecondDegre";
import type { EcranTSD, Fragments } from "./ecransTransfertSecondDegre";
import { polynome } from "./corrigeChapitre3";

/**
 * Textes et écrans de gen116 (« Bicarrées et changement de variable »). Écrans : 1. l'équation en t
 * (après t = x² ou t = x² + k ; toute équation proportionnelle acceptée) ; 2. ses solutions ;
 * 3. les valeurs de t gardées (choix fermé, une tentative : un carré n'est jamais négatif) ;
 * 4. les solutions en x (« aucune » possible).
 */

type E = ExerciceBicarree;
const n = nombreLatex;

export const CONSIGNE_GENERALE = "Résous l'équation (E) dans ℝ, en posant une nouvelle inconnue t.";

/** u en LaTeX : « x^2 », « x^2-1 ». */
export function uLatex(e: E): string {
  return e.k === 0 ? "x^2" : `x^2${e.k > 0 ? "+" : "-"}${Math.abs(e.k)}`;
}

export function equationLatex(e: E): string {
  const [a, b, c] = trinomeT(e);
  if (e.variante === "bicarree") return `${polynome([a, 0, b, 0, c])}=0`;
  const u = `(${uLatex(e)})`;
  const t1 = `${a === 1 ? "" : a === -1 ? "-" : a}${u}^2`;
  const t2 = b === 1 ? `+${u}` : b === -1 ? `-${u}` : `${b > 0 ? "+" : ""}${b}${u}`;
  const t3 = c > 0 ? `+${c}` : `${c}`;
  return `${t1}${t2}${t3}=0`;
}

export function equationTLatex(e: E): string {
  return `${polynome(trinomeT(e), "t")}=0`;
}

export function poseLatex(e: E): string {
  return `t=${uLatex(e)}`;
}

/** x² en fonction de t : « t », « t+1 ». */
export function x2DeT(e: E, t: number): number {
  return t - e.k;
}

export function solutionLatex(e: E): string {
  return `S=${ensembleLatex(ensemblePoints(solutionsX(e)))}`;
}

function optionGarde(e: E, garde: number[]): Fragments {
  const autres = [e.t1, e.t2].filter((t) => !garde.includes(t));
  if (garde.length === 0) return [texte("On rejette les deux valeurs : (E) n'a aucune solution.")];
  if (garde.length === 2) return [texte("On garde les deux valeurs, "), latex(`t=${n(e.t1)}`), texte(" et "), latex(`t=${n(e.t2)}\\text{.}`)];
  return [texte("On garde seulement "), latex(`t=${n(garde[0]!)}`), texte(" et on rejette "), latex(`t=${n(autres[0]!)}\\text{.}`)];
}

export function ecrans(e: E): EcranTSD[] {
  const p = trinomeT(e);
  const inverse: Poly2 = [p[0], p[2], p[1]];
  const gardees = tGardees(e);
  const sousEnsembles = [[], [e.t1], [e.t2], [e.t1, e.t2]];
  const bonne = sousEnsembles.findIndex((s) => s.length === gardees.length && s.every((t) => gardees.includes(t)));
  const xs = solutionsX(e);
  const condition = e.k === 0 ? "t=x^2\\geq 0" : `x^2=t${e.k > 0 ? "-" : "+"}${Math.abs(e.k)}\\geq 0`;
  return [
    {
      type: "champs",
      titre: "Changer d'inconnue",
      consigne: [texte("Pose "), latex(poseLatex(e)), texte(" et écris l'équation obtenue, d'inconnue t.")],
      champs: [{ type: "equation", id: "eqt", libelle: [texte("Équation en t :")], variable: "t", cible: p, pieges: inverse.some((c, i) => c !== p[i]) ? [{ poly: inverse, message: e.k === 0 ? "$x^4=(x^2)^2=t^2$ et $x^2=t$ : chaque terme garde son coefficient." : "Remplace chaque $(\\ldots)$ par t : le carré devient $t^2$." }] : [], messageSiFaux: e.k === 0 ? "Remplace $x^4$ par $t^2$ et $x^2$ par t." : `Remplace chaque $(${uLatex(e)})$ par t.` }],
      aides: [
        e.k === 0 ? [texte("Écris "), latex("x^4"), texte(" comme un carré : "), latex("x^4=(x^2)^2")] : [texte("La même expression apparaît deux fois : "), latex(`(${uLatex(e)})`), texte(".")],
        [texte("Remplace-la par t : "), latex(e.k === 0 ? "x^4=t^2" : `(${uLatex(e)})^2=t^2`), texte(".")],
      ],
      reponse: [latex(equationTLatex(e))],
    },
    {
      type: "champs",
      titre: "Résoudre en t",
      consigne: [texte("Résous l'équation "), latex(`${equationTLatex(e)}\\text{.}`)],
      champs: [{ type: "liste", id: "t", libelle: [texte("Solutions : "), latex("t=")], cibles: [e.t1, e.t2], videPermis: false, pieges: [{ valeurs: [-e.t1, -e.t2], message: "Ce sont les opposées : dans la formule, c'est $-b$." }], messageSiFaux: "Calcule $\\Delta=b^2-4ac$ (ou cherche une racine évidente)." }],
      aides: [[texte("C'est une équation du second degré en t : "), latex("\\Delta=b^2-4ac")], [texte("Vérifie tes deux valeurs en les remplaçant dans l'équation en t.")]],
      reponse: [latex(`t=${n(e.t1)}`), texte(" ou "), latex(`t=${n(e.t2)}`)],
    },
    {
      type: "choix",
      titre: "Garder ou rejeter",
      consigne: [texte("Quelles valeurs de t garde-t-on ? Rappel : "), latex(`${condition}\\text{.}`)],
      options: sousEnsembles.map((s) => optionGarde(e, s)),
      bonne,
      aides: [[texte("Un carré n'est jamais négatif : "), latex("x^2\\geq 0"), texte(".")], [texte("Pour chaque t, calcule "), latex(e.k === 0 ? "x^2=t" : `x^2=t${e.k > 0 ? "-" : "+"}${Math.abs(e.k)}`), texte(" et regarde son signe.")]],
      messageFaux: "Ce n'est pas le bon tri : une valeur de t est gardée seulement si x² est positif.",
    },
    {
      type: "champs",
      titre: "Revenir à x",
      consigne: [texte("Donne les solutions de (E), en revenant à x.")],
      champs: [{ type: "liste", id: "x", libelle: [texte("Solutions : "), latex("x=")], cibles: xs, videPermis: true, pieges: xs.length ? [{ valeurs: xs.filter((x) => x > 0), message: "Il manque les valeurs négatives : $x^2=a$ donne $x=\\sqrt{a}$ ou $x=-\\sqrt{a}$." }] : [], messageSiFaux: "Pour chaque t gardé, résous $x^2=$ (valeur positive) : deux solutions opposées." }],
      aides: [[texte("Si "), latex("x^2=a"), texte(" avec a > 0, alors "), latex("x=\\sqrt{a}"), texte(" ou "), latex("x=-\\sqrt{a}"), texte(".")], [texte("Une valeur de t rejetée ne donne aucune solution. Écris « ±√3 » pour deux valeurs opposées, et « aucune » s'il n'y en a pas.")]],
      reponse: [latex(solutionLatex(e))],
    },
  ];
}
