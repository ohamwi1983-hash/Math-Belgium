import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDerivabilite, PolyU } from "../../core5e/derivabilite";
import { deriveeEnA, enX, fa, limDroite, limTauxDroite, limTauxGauche, unilaterale, verdict } from "../../core5e/derivabilite";
import { COURS_DEFINITION, COURS_DERIVEE, COURS_SIGNE, COURS_TANGENTES } from "../../ui5e/corrigeDerivees1";
import { polyL } from "../../ui5e/ecrituresLimitesLotG";
import { aPlusH, figureVerdict, limD, limG, limiteL, reponse, tangenteL, tauxL, xMoinsA } from "../../ui5e/formatDerivabilite";

/**
 * Corrigé détaillé « comme au tableau » de `5gen75`, une lettre par écran : a) f(a) et limites
 * latérales (le bon morceau de chaque côté) ; b) / c) f(a + h) développé en h, f(a + h) − f(a),
 * division par h, limite (saut : terme k/h → ±∞ ; valeur absolue : |h| = ∓h ; racine : c/√h) ;
 * d) verdict justifié par les deux nombres dérivés, figure (demi-tangentes, point creux d'un saut) ;
 * e) tangente remplie, distribuée, réduite (verdict dérivable seulement).
 */

type E = ExerciceDerivabilite;
const t = texte;
const f = latex;
const par = (v: number): string => (v < 0 ? `(${v})` : `${v}`);

/** Substitution x = a dans un polynôme en x (« 2\cdot 3^2-3+1 »). */
function substitutionX(coefs: number[], x: number): string {
  const deg = coefs.length - 1;
  let s = "";
  coefs.forEach((c, i) => {
    const p = deg - i;
    if (c === 0) return;
    const abs = Math.abs(c);
    const signe = c < 0 ? "-" : s === "" ? "" : "+";
    const puiss = p === 0 ? "" : p === 1 ? par(x) : `${par(x)}^${p}`;
    const corps = p === 0 ? `${abs}` : abs === 1 ? puiss : `${abs}\\cdot ${puiss}`;
    s += `${signe}${corps}`;
  });
  return s === "" ? "0" : s;
}

function etapeA(e: E): EtapeCorrection[] {
  const a = e.a;
  const L: LigneCalcul[] = [];
  if (e.variante === "racine") {
    L.push(ligne(`f(${a})=${e.c === 1 ? "" : e.c === -1 ? "-" : `${e.c}\\cdot `}\\sqrt{${a}-${par(a)}}${e.b === 0 ? "" : e.b > 0 ? `+${e.b}` : e.b}`, "on remplace x par a"), ligne(`=${fa(e)}`, "√0 = 0"));
    L.push(ligne(`\\lim\\limits_{x\\to ${a}^+}f(x)=${fa(e)}`, "x − a tend vers 0, la racine aussi"));
  } else if (e.variante === "absolue") {
    const q = e.q;
    const sq = a === 0 ? `${q[2]}` : substitutionX(q, a);
    const suite = sq === "0" ? "" : sq.startsWith("-") ? sq : `+${sq}`;
    L.push(ligne(`f(${a})=${e.c}\\cdot\\left|${a}-${par(a)}\\right|${suite}`, "on remplace x par a"), ligne(`=${fa(e)}`, "|0| = 0"));
    L.push(ligne(`\\lim\\limits_{x\\to ${a}^-}f(x)=\\lim\\limits_{x\\to ${a}^+}f(x)=${fa(e)}`, "|x − a| tend vers 0 des deux côtés"));
  } else {
    const g = enX(e.gauche, a);
    const d = enX(e.droite, a);
    if (a === 0) L.push(ligne(`f(0)=${fa(e)}`, "x = 0 vérifie x ≤ 0 : premier morceau, il reste le terme constant"));
    else L.push(ligne(`f(${a})=${substitutionX(g, a)}`, "x = a vérifie x ≤ a : premier morceau"), ligne(`=${fa(e)}`));
    L.push(ligne(`\\lim\\limits_{x\\to ${a}^-}f(x)=${fa(e)}`, "même morceau, polynôme : on remplace"));
    if (a === 0) L.push(ligne(`\\lim\\limits_{x\\to 0^+}f(x)=${limDroite(e)}`, "second morceau (x > 0) : il reste le terme constant"));
    else L.push(ligne(`\\lim\\limits_{x\\to ${a}^+}f(x)=${substitutionX(d, a)}`, "second morceau (x > a)"), ligne(`=${limDroite(e)}`));
  }
  const continue_ = verdict(e) !== "discontinue";
  return [
    utilise("a", [t("f est continue en a si "), f("\\lim\\limits_{x\\to a^-}f(x)=\\lim\\limits_{x\\to a^+}f(x)=f(a)"), t(` ; une fonction dérivable en a y est continue ${COURS_SIGNE}.`)]),
    calcul("a", L),
    resultat("a", [...reponse(e, "continuite"), t(continue_ ? " : f est continue en a." : " : f n'est pas continue en a (saut).")]),
    piege("a", [t(e.variante.startsWith("morceaux") ? "Calculer la limite à droite avec le premier morceau, ou f(a) avec le second." : "Croire qu'une fonction continue est forcément dérivable : c'est la suite qui décide.")]),
  ];
}

/** Lignes du taux d'un côté (polynômes). */
function lignesTauxPoly(e: E, p: PolyU, cote: "g" | "d"): LigneCalcul[] {
  const a = e.a;
  const saut = cote === "d" ? e.droite[2] - e.gauche[2] : 0;
  const L: LigneCalcul[] = [];
  L.push(ligne(`f(${aPlusH(a)})=${polyL([p[0], p[1], p[2]], "h")}`, cote === "g" ? "morceau de gauche, développé en h (x = a + h)" : "morceau de droite, développé en h"));
  const num = polyL([p[0], p[1], saut], "h");
  L.push(ligne(`f(${aPlusH(a)})-f(${a})=${num}`, `on retire f(${a}) = ${fa(e)}`.replace(/-(\d)/g, "−$1")));
  if (num !== "0") {
    L.push(ligne(`\\dfrac{f(${aPlusH(a)})-f(${a})}{h}=${tauxL(e, cote)}`, saut === 0 ? "on simplifie par h" : "on divise chaque terme par h"));
  }
  const lim = cote === "g" ? limTauxGauche(e) : limTauxDroite(e);
  L.push(ligne(`${cote === "g" ? limG : limD}\\dfrac{f(${aPlusH(a)})-f(${a})}{h}=${limiteL(lim)}`, saut === 0 ? "h remplacé par 0" : `${Math.abs(saut)}/h tend vers ${saut > 0 ? "+∞" : "−∞"} (h > 0)`));
  return L;
}

function etapeTaux(e: E, cote: "g" | "d", lettre: string): EtapeCorrection[] {
  const a = e.a;
  const lim = cote === "g" ? limTauxGauche(e) : limTauxDroite(e);
  let L: LigneCalcul[];
  if (e.variante === "racine") {
    const c = e.c === 1 ? "" : e.c === -1 ? "-" : `${e.c}`;
    L = [
      ligne(`f(${aPlusH(a)})-f(${a})=${c}\\sqrt{h}`, `√(a + h − a) = √h, le terme ${e.b} s'en va`.replace(/-(\d)/g, "−$1")),
      ligne(`\\dfrac{f(${aPlusH(a)})-f(${a})}{h}=${c}\\dfrac{\\sqrt{h}}{h}`, "on divise par h"),
      ligne(`=${tauxL(e, "d")}`, "h = √h · √h"),
      ligne(`${limD}${tauxL(e, "d")}=${limiteL(lim)}`, "√h tend vers 0⁺"),
    ];
  } else if (e.variante === "absolue") {
    const signe = cote === "g" ? "-h" : "h";
    const p = cote === "g" ? e.gauche : e.droite;
    L = [
      ligne(`\\left|${aPlusH(a)}-${par(a)}\\right|=|h|=${signe}`, cote === "g" ? "h < 0" : "h > 0"),
      ligne(`f(${aPlusH(a)})-f(${a})=${polyL([p[0], p[1], 0], "h")}`, "on remplace |h|, on retire f(a) et on réduit"),
      ligne(`\\dfrac{f(${aPlusH(a)})-f(${a})}{h}=${tauxL(e, cote)}`, "on simplifie par h"),
      ligne(`${cote === "g" ? limG : limD}\\dfrac{f(${aPlusH(a)})-f(${a})}{h}=${limiteL(lim)}`, "h remplacé par 0"),
    ];
  } else L = lignesTauxPoly(e, cote === "g" ? e.gauche : e.droite, cote);
  return [
    utilise(lettre, [t(`Le nombre dérivé à ${cote === "g" ? "gauche" : "droite"} est la limite du taux d'accroissement quand h tend vers 0 ${cote === "g" ? "par valeurs négatives" : "par valeurs positives"} : `), f(`${cote === "g" ? limG : limD}\\dfrac{f(a+h)-f(a)}{h}`), t(` ${COURS_DEFINITION}.`)]),
    calcul(lettre, L),
    resultat(lettre, reponse(e, cote === "g" ? "gauche" : "droite")),
    ...(Number.isFinite(lim) ? [] : [piege(lettre, [t("Prendre cette limite infinie pour un nombre dérivé : f′(a) doit être un NOMBRE.")])]),
  ];
}

function etapeVerdict(e: E, lettre: string): EtapeCorrection[] {
  const v = verdict(e);
  const L: LigneCalcul[] = [];
  if (!unilaterale(e)) L.push(ligne(`${limG}\\dfrac{f(a+h)-f(a)}{h}=${limiteL(limTauxGauche(e))}`, "nombre dérivé à gauche"));
  L.push(ligne(`${limD}\\dfrac{f(a+h)-f(a)}{h}=${limiteL(limTauxDroite(e))}`, unilaterale(e) ? "f n'est définie qu'à droite de a" : "nombre dérivé à droite"));
  const justification: Record<string, string> = {
    derivable: "deux limites finies et égales : f′(a) existe",
    anguleux: "deux limites finies différentes : deux demi-tangentes",
    verticale: "limite infinie : tangente verticale, pas de nombre dérivé",
    discontinue: `f(a) = ${fa(e)} mais f tend vers ${limDroite(e)} à droite : saut`.replace(/-(\d)/g, "−$1"),
  };
  L.push(ligne(v === "derivable" ? `f'(${e.a})=${deriveeEnA(e)}` : `f'(${e.a})\\text{ n'existe pas}`, justification[v]));
  return [
    utilise(lettre, [t("f est dérivable en a si les nombres dérivés à gauche et à droite existent (finis) et sont égaux ; deux pentes différentes : point anguleux ; taux qui tend vers l'infini : tangente verticale ; pas continue : pas dérivable "), t(`${COURS_SIGNE}.`)]),
    { ...calcul(lettre, L), figureHtml: figureVerdict(e) },
    resultat(lettre, reponse(e, "verdict")),
    ...(v === "anguleux" ? [verification(lettre, [t("f est pourtant continue en a (étape 1) : continue ne veut pas dire dérivable.")])] : []),
    piege(lettre, [t(v === "verticale" ? "Conclure « dérivable » parce que la tangente existe : elle est verticale, sa pente n'est pas un nombre." : "Conclure « dérivable » parce que f est continue.")]),
  ];
}

function etapeTangente(e: E, lettre: string): EtapeCorrection[] {
  const a = e.a;
  const m = deriveeEnA(e);
  const b = fa(e);
  const L: LigneCalcul[] = [ligne(`y=f'(${a})\\,${a === 0 ? "x" : `(${xMoinsA(a)})`}+f(${a})`, "équation de la tangente en a")];
  const plusB = b === 0 ? "" : b > 0 ? `+${b}` : `${b}`;
  const coef = m === 1 ? "" : m === -1 ? "-" : `${m}`;
  if (a !== 0 && m !== 0) {
    L.push(ligne(`y=${coef}(${xMoinsA(a)})${plusB}`, "on remplace"));
    L.push(ligne(tangenteL(e), "on distribue et on réduit"));
  } else L.push(ligne(tangenteL(e), "on remplace"));
  return [
    utilise(lettre, [t("La tangente en a a pour équation "), f("y=f'(a)\\,(x-a)+f(a)"), t(` ${COURS_TANGENTES} ; ici f′(a) est le nombre dérivé commun ${COURS_DERIVEE}.`)]),
    calcul(lettre, L),
    resultat(lettre, reponse(e, "tangente")),
    verification(lettre, [t("En "), f(`x=${a}`), t(", on retrouve "), f(`y=${b}`), t(" = f(a).")]),
  ];
}

export function correctionDetailleeDerivabilite(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [...etapeA(e)];
  if (unilaterale(e)) {
    out.push(...etapeTaux(e, "d", "b"), ...etapeVerdict(e, "c"));
    return out;
  }
  out.push(...etapeTaux(e, "g", "b"), ...etapeTaux(e, "d", "c"), ...etapeVerdict(e, "d"));
  if (verdict(e) === "derivable") out.push(...etapeTangente(e, "e"));
  return out;
}

