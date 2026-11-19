import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceEquationParametre } from "../../core/equationParametre.types";
import { racineDouble, valeur } from "./index";
import { affineLatex, deltaLatex, discussionJuste, ensembleLatexM, figureDelta, solutionPremierDegre, zones } from "../../ui/formatEquationParametre";
import { nombreLatex, pgcd } from "../../moteur/algebreTransfertSecondDegre";
import { polynome, q, qp } from "../../ui/corrigeChapitre3";
import { COURS_RESOUDRE, COURS_SIGNE_TRINOME, lignesDelta, lignesRacines } from "../../ui/corrigeTransfertSecondDegre";

/**
 * Corrigé détaillé « comme au tableau » de gen115 — règle `.claude/rules/feuilles-evaluations.md`.
 * a) Δ(m) (coefficients en m, substitution, développement, réduction) ; b) Δ(m) = 0 (équation en m)
 * et la racine double −b/(2a) pour chaque valeur ; c) signe de Δ(m) (coefficient de m², parabole en
 * figure) ; d) discussion zone par zone (et m = 0 en `a-egal-m`). Partagé par l'adaptateur et l'appli.
 */

type E = ExerciceEquationParametre;
const n = nombreLatex;

function paren(s: string): string {
  return /^-?\d+$/.test(s) || /^-?m$/.test(s) ? (s.startsWith("-") ? `(${s})` : s) : `(${s})`;
}

function etapeA(e: E): EtapeCorrection[] {
  const [b1, b0] = e.b;
  const [a1, a0] = e.a;
  const [c1, c0] = e.c;
  const carre = polynome([b1 * b1, 2 * b1 * b0, b0 * b0], "m");
  const produit = polynome([4 * a1 * c1, 4 * (a1 * c0 + a0 * c1), 4 * a0 * c0], "m");
  const lignes: LigneCalcul[] = [
    ligne(`a=${affineLatex(e.a)}`, "coefficient de x²"),
    ligne(`b=${affineLatex(e.b)}`, "coefficient de x"),
    ligne(`c=${affineLatex(e.c)}`, "terme constant"),
    ligne(`\\Delta(m)=b^2-4ac`, "discriminant"),
    ligne(`=${paren(affineLatex(e.b))}^2-4\\cdot ${paren(affineLatex(e.a))}\\cdot ${paren(affineLatex(e.c))}`, "on remplace a, b et c"),
  ];
  const p0 = 4 * a0 * c0;
  const produitSeul = a1 * c1 === 0 && a1 * c0 + a0 * c1 === 0;
  const moinsProduit = produit === "0" ? "" : produitSeul ? (p0 < 0 ? `+${q(-p0)}` : `-${q(p0)}`) : `-(${produit})`;
  const developpe = carre === "0" ? `=${moinsProduit.replace(/^\+/, "")}` : `=${carre}${moinsProduit}`;
  if (developpe !== `=${deltaLatex(e)}` && developpe !== "=") lignes.push(ligne(developpe, b1 !== 0 && b0 !== 0 ? [texte("on développe : "), latex("(u+v)^2=u^2+2uv+v^2")] : "on calcule chaque produit"));
  lignes.push(ligne(`=${deltaLatex(e)}`, "on réduit"));
  return [
    utilise("a", [texte("Le discriminant "), latex("\\Delta=b^2-4ac"), texte(` ${COURS_RESOUDRE}, avec des coefficients qui dépendent de m : on garde les parenthèses.`)]),
    calcul("a", lignes),
    resultat("a", [latex(`\\Delta(m)=${deltaLatex(e)}`)]),
    piege("a", [texte("Le carré porte sur toute l'expression de b, et le produit 4ac est soustrait en entier.")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const lignes: LigneCalcul[] = [ligne(`${deltaLatex(e)}=0`, "Δ(m) = 0 : équation du second degré en m")];
  const g = pgcd(pgcd(e.delta[0], e.delta[1]), e.delta[2]) * Math.sign(e.delta[0]);
  const [L, M, N] = e.delta.map((c) => c / g + 0) as [number, number, number];
  if (g !== 1) lignes.push(ligne(`${polynome([L, M, N], "m")}=0`, `on divise les deux membres par ${String(g).replace("-", "−")}`));
  if (N === 0) {
    lignes.push(ligne(`m(${polynome([L, M], "m")})=0`, "on met m en évidence"), ligne(`m=0\\text{ ou }${polynome([L, M], "m")}=0`, "un produit est nul si un de ses facteurs est nul"), ligne(`m=${n(-M / L)}`, "second facteur"));
  } else if (M === 0) {
    lignes.push(ligne(`m^2=${q(-N / L)}`, L === 1 ? `on ajoute ${q(-N).replace("-", "−")}` : `on isole m²`), ligne(`m=\\pm ${n(Math.sqrt(-N / L))}`, "racine carrée des deux côtés"));
  } else {
    lignes.push(...lignesDelta([L, M, N], "\\delta").map((l) => ({ ...l, justification: l.justification === "discriminant" ? "discriminant de l'équation en m" : l.justification })));
    lignes.push(...lignesRacines([L, M, N], "m", "\\delta", "δ"));
  }
  for (const [i, m] of [e.m1, e.m2].entries()) {
    const am = valeur(e.a, m);
    const bm = valeur(e.b, m);
    lignes.push(ligne(`x=-\\dfrac{${n(bm)}}{2\\cdot ${qp(am)}}`, [texte(`pour m = ${String(m).replace("-", "−")} (m${i === 0 ? "₁" : "₂"}), racine double `), latex("-\\dfrac{b}{2a}")]), ligne(`=${n(racineDouble(e, m))}`));
  }
  return [
    utilise("b", [texte("(E) a une racine double quand "), latex("\\Delta(m)=0"), texte(" ; cette racine vaut "), latex("-\\dfrac{b}{2a}"), texte(` ${COURS_RESOUDRE}.`)]),
    calcul("b", lignes),
    resultat("b", [latex(`m_1=${n(e.m1)}`), texte(" : "), latex(`x=${n(racineDouble(e, e.m1))}`), texte(" ; "), latex(`m_2=${n(e.m2)}`), texte(" : "), latex(`x=${n(racineDouble(e, e.m2))}`)]),
    verification("b", [texte("On remplace m par "), latex(`m_1=${n(e.m1)}`), texte(" dans Δ(m) : ")], [ligne(`\\Delta(${n(e.m1)})=${polynome(e.delta, `(${n(e.m1)})`).replace(/\(\((-?\d+)\)\)/g, "($1)")}=0`, "c'est bien une racine")]),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const L = e.delta[0];
  const pos = L > 0;
  return [
    utilise("c", [texte(`Δ(m) est un trinôme en m : il a le signe de son coefficient de m² à l'extérieur de ses racines, le signe contraire entre elles ${COURS_SIGNE_TRINOME}.`)]),
    {
      ...calcul("c", [
        ligne(`${n(L)}${pos ? ">" : "<"}0`, `coefficient de m² : Δ(m) est ${pos ? "positif" : "négatif"} à l'extérieur de [m₁ ; m₂]`),
        ligne(`\\Delta(m)>0\\iff m\\in ${ensembleLatexM(e)}`, pos ? "à l'extérieur des racines" : "entre les racines"),
      ]),
      figureHtml: figureDelta(e),
    },
    resultat("c", [latex(`\\Delta(m)>0\\iff m\\in ${ensembleLatexM(e)}`)]),
  ];
}

function etapeD(e: E): EtapeCorrection[] {
  const z = zones(e);
  const frag = (f: typeof z.positif) => f.map((x) => (x.type === "latex" ? x.valeur.replace(/^\{(.*)\}$/, "$1") : x.valeur === " ou " ? "\\text{ ou }" : x.valeur)).join("");
  const lignes: LigneCalcul[] = [
    ligne(frag(z.positif), "Δ(m) > 0 : deux solutions"),
    ligne(`m=${n(e.m1)}\\text{ ou }m=${n(e.m2)}`, "Δ(m) = 0 : une racine double"),
    ligne(frag(z.negatif), "Δ(m) < 0 : aucune solution"),
  ];
  if (e.variante === "a-egal-m") {
    const [b1, b0] = e.b;
    const [, c0] = e.c;
    void b1;
    lignes.push(ligne("m=0", [texte("a = 0 : (E) devient "), latex(`${polynome([0, b0, c0])}=0`), texte(", du premier degré")]), ligne(`x=${n(solutionPremierDegre(e))}`, "une seule solution"));
  }
  return [
    utilise("d", [texte(`Selon le signe de Δ : deux solutions si Δ > 0, une racine double si Δ = 0, aucune si Δ < 0 ${COURS_RESOUDRE}.`)]),
    calcul("d", lignes),
    resultat("d", discussionJuste(e)),
    ...(e.variante === "a-egal-m" ? [piege("d", [texte("Pour "), latex("m=0"), texte(", le coefficient de "), latex("x^2"), texte(" est nul : la formule du discriminant ne s'applique plus, (E) est du premier degré.")])] : []),
  ];
}

export function correctionDetailleeEquationParametre(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e), ...etapeD(e)];
}
