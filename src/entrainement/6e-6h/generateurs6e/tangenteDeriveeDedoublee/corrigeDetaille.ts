import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTD } from "../../core6e/tangenteDeriveeDedoublee";
import { pente, tangenteP } from "../../core6e/tangenteDeriveeDedoublee";
import { carreSurL, coefL, nL, nPL, sgL, pL } from "../../ui6e/outilsConiquesLotH2";
import { droiteL } from "../../ui6e/outilsLieuxLotH2";
import { figureTD, fL, optionL, tangentePL, tangenteQL } from "../../ui6e/formatTangenteDeriveeDedoublee";
import { branche } from "../../core6e/tangenteDeriveeDedoublee";

/**
 * Corrigé détaillé « comme au tableau » de `6gen138`, une lettre par écran : a) y isolé, deux fonctions,
 * choix par le signe de y_P (et P vérifié sur Γ) ; b) dérivée de cette fonction et pente en x_P,
 * contrôlée par la formule du cours ; c) équation de la tangente en P, contrôlée par la forme dédoublée,
 * avec la figure ; d) forme dédoublée en Q (sommet : tangente verticale), figure des deux tangentes.
 */

type E = ExerciceTD;
const ft = texte;
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function lignesA(e: E): LigneCalcul[] {
  const c = e.conique;
  const { x, y } = e.P;
  const lignes: LigneCalcul[] = [];
  if (c.type === "parabole") {
    lignes.push(ligne(`${pL(y)}^2=${nL(y * y)}\\quad\\text{et}\\quad ${nL(2 * c.p)}\\cdot ${nPL(x)}=${nL(2 * c.p * x)}`, "P est bien sur Γ"));
    lignes.push(ligne(`y^2=${nL(2 * c.p)}x\\iff y=\\pm${fL(e)}`, "on isole y"));
  } else {
    const a2 = c.a * c.a;
    const b2 = c.b * c.b;
    const s = c.type === "ellipse" ? "+" : "-";
    lignes.push(ligne(`${carreSurL(pL(x), a2)}${s}${carreSurL(pL(y), b2)}=${nL((x * x) / a2)}${s}${nL((y * y) / b2)}=1`, "P est bien sur Γ"));
    lignes.push(ligne(`y^2=${b2 / a2 === 1 ? "" : `\\dfrac{${b2}}{${a2}}`}\\left(${c.type === "ellipse" ? `${a2}-x^2` : `x^2-${a2}`}\\right)`, [ft("on isole "), L("y^2")]));
    lignes.push(ligne(`y=\\pm${fL(e)}`, "deux fonctions opposées"));
  }
  lignes.push(ligne(`y_P=${nL(y)}${y > 0 ? ">0" : "<0"}`, y > 0 ? "branche supérieure" : "branche inférieure"));
  return lignes;
}

/** √(…) évaluée en x_P (sans signe). */
function racineEnP(e: E): { sous: string; valeur: number } {
  const c = e.conique;
  const x = e.P.x;
  if (c.type === "parabole") return { sous: `${nL(2 * c.p)}\\cdot ${nPL(x)}`, valeur: Math.abs(e.P.y) };
  if (c.type === "ellipse") return { sous: `${c.a * c.a}-${pL(x)}^2`, valeur: Math.sqrt(c.a * c.a - x * x) };
  return { sous: `${pL(x)}^2-${c.a * c.a}`, valeur: Math.sqrt(x * x - c.a * c.a) };
}

function lignesB(e: E): LigneCalcul[] {
  const c = e.conique;
  const haut = e.P.y > 0;
  const sg = haut ? "" : "-";
  const m = pente(e);
  const r = racineEnP(e);
  const x = e.P.x;
  if (c.type === "parabole") {
    return [
      ligne(`f(x)=${sg}\\sqrt{${nL(2 * c.p)}x}`, "fonction qui contient P"),
      ligne(`f'(x)=${sg}\\dfrac{${nL(2 * c.p)}}{2\\sqrt{${nL(2 * c.p)}x}}=${sg}\\dfrac{${nL(c.p)}}{\\sqrt{${nL(2 * c.p)}x}}`, [ft("dérivée de "), L("\\sqrt{u}"), ft(" : "), L("\\dfrac{u'}{2\\sqrt{u}}")]),
      ligne(`f'(${nL(x)})=${sg}\\dfrac{${nL(c.p)}}{\\sqrt{${r.sous}}}=${sg}${Math.abs(r.valeur - 1) < 1e-9 ? nL(c.p) : `\\dfrac{${nL(c.p)}}{${nL(r.valeur)}}`}`, [ft("en "), L(`x_P=${nL(x)}`)]),
      ligne(`=${nL(m)}`),
    ];
  }
  const k0 = coefL(c.b / c.a);
  const k = k0 === "" ? "" : `${k0}\\cdot `;
  const signeDerivee = c.type === "ellipse" ? (haut ? "-" : "") : haut ? "" : "-";
  return [
    ligne(`f(x)=${sg}${fL(e)}`, "fonction qui contient P"),
    ligne(`f'(x)=${signeDerivee}${k}\\dfrac{x}{\\sqrt{${c.type === "ellipse" ? `${c.a * c.a}-x^2` : `x^2-${c.a * c.a}`}}}`, [ft("dérivée de "), L("\\sqrt{u}"), ft(" : "), L("\\dfrac{u'}{2\\sqrt{u}}")]),
    ligne(`f'(${nL(x)})=${signeDerivee}${k}\\dfrac{${nL(x)}}{\\sqrt{${r.sous}}}=${signeDerivee}${Math.abs(r.valeur - 1) < 1e-9 ? `${k}${nPL(x)}` : `${k}\\dfrac{${nL(x)}}{${nL(r.valeur)}}`}`, [ft("en "), L(`x_P=${nL(x)}`)]),
    ligne(`=${nL(m)}`),
  ];
}

function lignesC(e: E): LigneCalcul[] {
  const m = pente(e);
  const { x, y } = e.P;
  const p = y - m * x;
  return [ligne(`y${sgL(-y)}=${nPL(m)}\\,(x${sgL(-x)})`, [L("y-y_P=m(x-x_P)")]), ligne(`y=${coefL(m) === "" ? "" : coefL(m)}x${sgL(p)}`, "on développe"), ligne(tangentePL(e), "forme implicite")];
}

function dedoubleeSubstL(e: E, P = e.Q): string {
  const c = e.conique;
  if (c.type === "parabole") return `y\\cdot ${nPL(P.y)}=${nL(c.p)}\\,(x${sgL(P.x)})`;
  const s = c.type === "ellipse" ? "+" : "-";
  const terme = (v: string, w: number, n: number) => (n === 1 ? `${v}\\cdot ${nPL(w)}` : `\\dfrac{${v}\\cdot ${nPL(w)}}{${n}}`);
  return `${terme("x", P.x, c.a * c.a)}${s}${terme("y", P.y, c.b * c.b)}=1`;
}

export function correctionDetailleeTD(e: E): EtapeCorrection[] {
  const c = e.conique;
  const m = pente(e);
  const formuleCours = c.type === "parabole" ? (Math.abs(e.P.y) === 1 ? "\\dfrac{p}{y_P}" : `\\dfrac{p}{y_P}=\\dfrac{${nL(c.p)}}{${nPL(e.P.y)}}`) : c.type === "ellipse" ? `-\\dfrac{b^2x_P}{a^2y_P}=-\\dfrac{${c.b * c.b}\\cdot ${nPL(e.P.x)}}{${c.a * c.a}\\cdot ${nPL(e.P.y)}}` : `\\dfrac{b^2x_P}{a^2y_P}=\\dfrac{${c.b * c.b}\\cdot ${nPL(e.P.x)}}{${c.a * c.a}\\cdot ${nPL(e.P.y)}}`;
  const verifTan = droiteL(tangenteP(e));
  return [
    utilise("a", [ft("Une conique est la réunion de deux graphiques de fonctions opposées ; on garde celle qui contient "), L("P"), ft(" (cours, point 5).")]),
    calcul("a", lignesA(e)),
    resultat("a", [L(optionL(e, branche(e))), ft(".")]),
    piege("a", [ft("Prendre la branche "), L("y=f(x)"), ft(" pour un point d'ordonnée négative : la pente change de signe.")]),
    utilise("b", [ft("La pente de la tangente en "), L("P"), ft(" est le nombre dérivé "), L("f'(x_P)"), ft(" (cours, point 5).")]),
    calcul("b", lignesB(e)),
    resultat("b", [ft("La pente vaut "), L(nL(m)), ft(".")]),
    verification("b", [ft("Formule du cours : "), L(`${formuleCours}=${nL(m)}`), ft(".")]),
    utilise("c", [ft("Droite de pente "), L("m"), ft(" passant par "), L("P"), ft(" : "), L("y-y_P=m\\,(x-x_P)"), ft(".")]),
    calcul("c", lignesC(e)),
    { ...resultat("c", [ft("Tangente en "), L("P"), ft(" : "), L(tangentePL(e)), ft(".")]), figureHtml: figureTD(e, true, false) },
    verification("c", [ft("Forme dédoublée en "), L("P"), ft(" : "), L(dedoubleeSubstL(e, e.P)), ft(", qui se simplifie en "), L(verifTan), ft(" : même droite.")]),
    utilise("d", [ft("Forme dédoublée (cours, point 5) : dans l'équation de "), L("\\Gamma"), ft(", "), L("x^2\\to x\\,x_Q"), ft(", "), L("y^2\\to y\\,y_Q"), ft(c.type === "parabole" ? ", " : "."), ...(c.type === "parabole" ? [L("x\\to\\dfrac{x+x_Q}{2}"), ft(".")] : [])]),
    calcul("d", [ligne(dedoubleeSubstL(e), [ft("avec "), L(`Q(${nL(e.Q.x)}\\,;${nL(e.Q.y)})`)]), ligne(tangenteQL(e), "on simplifie")]),
    { ...resultat("d", [ft("Tangente en "), L("Q"), ft(" : "), L(tangenteQL(e)), ft(e.qSommet ? " (droite verticale)." : ".")]), figureHtml: figureTD(e, true, true) },
    piege("d", e.qSommet ? [ft("Dériver en "), L("Q"), ft(" : "), L("y_Q=0"), ft(", la formule de la pente divise par zéro ; la tangente au sommet de l'axe focal est verticale.")] : c.type === "parabole" ? [ft("Remplacer "), L("x"), ft(" par "), L("x\\,x_Q"), ft(" : il devient "), L("\\dfrac{x+x_Q}{2}"), ft(", d'où le coefficient "), L("p"), ft(" et non "), L("2p"), ft(".")] : [ft("Remplacer "), L("x^2"), ft(" par "), L("x_Q^2"), ft(" : on garde une lettre, "), L("x^2\\to x\\,x_Q"), ft(".")]),
  ];
}
