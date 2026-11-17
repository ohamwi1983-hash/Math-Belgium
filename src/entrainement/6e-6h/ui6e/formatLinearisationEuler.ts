import { coefficientsProduit, enSinus, facteurK, formeLineaire, fois, fr, integraleExacte, primitive, puissances, termesRegroupes, valeur } from "../core6e/linearisationEuler";
import type { BornePi, ExerciceLinearisation, Fraction, NombreExact } from "../core6e/linearisationEuler";
import type { PhaseLinearisation } from "../moteur6e/typesLinearisationEuler";

/**
 * Couche C (6e) — textes de `6gen93` « Linéariser avec les formules d'Euler ». SOURCE UNIQUE des
 * consignes, aides et réponses attendues : l'écran, le récapitulatif et l'adaptateur de feuilles
 * (`generateurs6e/linearisationEuler/exportEvaluation.ts`) en dérivent.
 *
 * Notations du cours (section « Formule de Moivre », sous-partie « Le chemin inverse : linéariser
 * cosⁿx ») : `\cos^2x`, `\cos x` (sans parenthèses quand k = 1), `\cos(2x)`, formules d'Euler
 * `\cos x=\dfrac{e^{ix}+e^{-ix}}{2}` et `\sin x=\dfrac{e^{ix}-e^{-ix}}{2i}`, regroupement
 * `e^{ikx}+e^{-ikx}=2\cos(kx)`, forme linéarisée au dénominateur commun (`\dfrac{3\cos x+\cos(3x)}{4}`).
 * Aides : phrase terminée par « : » puis la formule, jamais la réponse finale.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  /** Texte brut (aria-label, et libellé quand `labelLatex` est absent). */
  label: string;
  labelLatex?: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Briques d'écriture.
// ============================================================================

/** cosᵖ(ax) : `\cos^2x`, `\cos^3(2x)`, `\cos x`, `\sin(3x)`. */
function facteurNom(f: "cos" | "sin", puissanceF: number, a: number): string {
  const exposant = puissanceF === 1 ? "" : `^${puissanceF}`;
  return a === 1 ? `\\${f}${exposant}${puissanceF === 1 ? " x" : "x"}` : `\\${f}${exposant}(${a}x)`;
}

/** f(x) en LaTeX : `\cos^2x\,\sin x`, `\sin^3(2x)`, `\cos(3x)\,\sin^2(3x)`. */
export function nomLatex(e: ExerciceLinearisation): string {
  const { p, q } = puissances(e);
  const facteurs: string[] = [];
  if (p > 0) facteurs.push(facteurNom("cos", p, e.a));
  if (q > 0) facteurs.push(facteurNom("sin", q, e.a));
  return facteurs.join("\\,");
}

/** Formules d'Euler pour l'argument ax. */
export function eulerLatex(a: number): string {
  return `${trigLatex("cos", a)}=\\dfrac{${expoLatex(a)}+${expoLatex(-a)}}{2}\\qquad ${trigLatex("sin", a)}=\\dfrac{${expoLatex(a)}-${expoLatex(-a)}}{2i}`;
}

/** `\cos x`, `\cos(3x)`, `\sin x`… */
export function trigLatex(f: "cos" | "sin", k: number): string {
  return k === 1 ? `\\${f} x` : `\\${f}(${k}x)`;
}

/** e^{3ix}, e^{ix}, e^{-ix}, 1. */
export function expoLatex(k: number): string {
  if (k === 0) return "1";
  if (k === 1) return "e^{ix}";
  if (k === -1) return "e^{-ix}";
  return `e^{${k}ix}`;
}

function puissance(base: string, n: number): string {
  return n === 1 ? base : `${base}^{${n}}`;
}

/** (e^{iax}+e^{-iax}) ou (e^{iax}-e^{-iax}). */
function binome(a: number, signe: "+" | "-"): string {
  return `\\left(${expoLatex(a)}${signe}${expoLatex(-a)}\\right)`;
}

/** P = (e^{iax}+e^{-iax})^p (e^{iax}-e^{-iax})^q. */
export function produitLatex(e: ExerciceLinearisation): string {
  const { p, q } = puissances(e);
  const facteurs: string[] = [];
  if (p > 0) facteurs.push(puissance(binome(e.a, "+"), p));
  if (q > 0) facteurs.push(puissance(binome(e.a, "-"), q));
  return facteurs.join("");
}

/** e^{iax}·e^{-iax} = 1. */
export function produitConjuguesLatex(a: number): string {
  return `${expoLatex(a)}\\cdot ${expoLatex(-a)}=1`;
}

/** Identité remarquable (e^{iax}+e^{-iax})(e^{iax}-e^{-iax}) = e^{2iax}-e^{-2iax}. */
export function identiteLatex(a: number): string {
  return `${binome(a, "+")}${binome(a, "-")}=${expoLatex(2 * a)}-${expoLatex(-2 * a)}`;
}

/** Dénominateur de Euler : 2^{p}\cdot(2i)^{q}. */
export function denominateurLatex(e: ExerciceLinearisation): string {
  const { p, q } = puissances(e);
  const morceaux: string[] = [];
  if (p > 0) morceaux.push(p === 1 ? "2" : `2^{${p}}`);
  if (q > 0) morceaux.push(q === 1 ? "2i" : `(2i)^{${q}}`);
  return morceaux.join("\\cdot ");
}

/** a/b en LaTeX (`\dfrac{3}{4}`, `-\dfrac{1}{8}`, `5`). */
export function fractionLatex(f: Fraction): string {
  if (f.den === 1) return `${f.num}`;
  return `${f.num < 0 ? "-" : ""}\\dfrac{${Math.abs(f.num)}}{${f.den}}`;
}

/** Terme « coefficient × symbole » sous la forme \dfrac{a\,s}{b} (s vide = nombre seul), signe en tête. */
function termeFraction(c: Fraction, symbole: string): string {
  const a = Math.abs(c.num);
  const signe = c.num < 0 ? "-" : "+";
  const numerateur = symbole === "" ? `${a}` : a === 1 ? symbole : `${a}${symbole}`;
  return `${signe}${c.den === 1 ? numerateur : `\\dfrac{${numerateur}}{${c.den}}`}`;
}

function joindre(termes: string[]): string {
  if (termes.length === 0) return "0";
  const s = termes.join("");
  return s.startsWith("+") ? s.slice(1) : s;
}

/** Terme entier × symbole, signe en tête (« +3e^{ix} », « -e^{-3ix} », « -2 »). */
function termeEntier(c: number, symbole: string): string {
  const signe = c < 0 ? "-" : "+";
  const a = Math.abs(c);
  if (symbole === "" || symbole === "1") return `${signe}${a}`;
  return `${signe}${a === 1 ? "" : a}${symbole}`;
}

/** K simplifié : `\dfrac{1}{8}`, `-\dfrac{i}{8}`, `\dfrac{i}{16}`, `-\dfrac{1}{4}`. */
export function KLatex(e: ExerciceLinearisation): string {
  const K = facteurK(e);
  const imaginaire = K.im.num !== 0;
  const f = imaginaire ? K.im : K.re;
  return `${f.num < 0 ? "-" : ""}\\dfrac{${imaginaire ? "i" : "1"}}{${f.den}}`;
}

/** Développement P = Σ c_k e^{ikx} (termes nuls omis). */
export function developpementLatex(e: ExerciceLinearisation): string {
  return joindre(coefficientsProduit(e).filter((x) => x.c !== 0).map((x) => termeEntier(x.c, expoLatex(x.k))));
}

/** Regroupement : 2\cos(3x)+6\cos x  /  2i\sin(3x)-6i\sin x  /  2\cos(4x)-2. */
export function regroupementLatex(e: ExerciceLinearisation): string {
  const sinus = enSinus(e);
  return joindre(
    termesRegroupes(e)
      .filter((x) => x.coef !== 0)
      .map((x) => (x.k === 0 ? termeEntier(x.coef, "") : termeEntier(x.coef, `${sinus ? "i" : ""}${trigLatex(sinus ? "sin" : "cos", x.k)}`))),
  );
}

/** Regroupement écrit avec les exponentielles appariées : 1(e^{3ix}+e^{-3ix})+3(e^{ix}+e^{-ix}). */
export function appariementLatex(e: ExerciceLinearisation): string {
  const sinus = enSinus(e);
  const termes: string[] = [];
  for (const x of coefficientsProduit(e)) {
    if (x.c === 0 || x.k < 0) continue;
    termes.push(x.k === 0 ? termeEntier(x.c, "") : termeEntier(x.c, `\\left(${expoLatex(x.k)}${sinus ? "-" : "+"}${expoLatex(-x.k)}\\right)`));
  }
  return joindre(termes);
}

function ppcm(a: number, b: number): number {
  let x = a;
  let y = b;
  while (y !== 0) [x, y] = [y, x % y];
  return (a * b) / x;
}

/** Forme linéarisée au dénominateur commun, comme le cours : \dfrac{3\cos x+\cos(3x)}{4}. */
export function lineaireLatex(e: ExerciceLinearisation): string {
  const termes = formeLineaire(e);
  const D = termes.reduce((d, x) => ppcm(d, x.coef.den), 1);
  const numerateur = joindre(termes.map((x) => termeEntier((x.coef.num * D) / x.coef.den, x.fonction === null ? "" : trigLatex(x.fonction, x.k))));
  return D === 1 ? numerateur : `\\dfrac{${numerateur}}{${D}}`;
}

/** Forme linéarisée terme à terme : \dfrac{3\cos x}{4}+\dfrac{\cos(3x)}{4}. */
export function lineaireTermesLatex(e: ExerciceLinearisation): string {
  return joindre(formeLineaire(e).map((x) => termeFraction(x.coef, x.fonction === null ? "" : trigLatex(x.fonction, x.k))));
}

/** Primitive : \dfrac{x}{2}+\dfrac{\sin(2x)}{4}. */
export function primitiveLatex(e: ExerciceLinearisation): string {
  return joindre(primitive(e).map((x) => termeFraction(x.coef, x.fonction === "x" ? "x" : trigLatex(x.fonction, x.k))));
}

/** Borne : 0, \pi, \frac{\pi}{3}, \frac{2\pi}{3}. */
export function borneLatex(b: BornePi, petit = true): string {
  if (b.num === 0) return "0";
  const num = b.num === 1 ? "\\pi" : `${b.num}\\pi`;
  if (b.den === 1) return num;
  return petit ? `\\frac{${num}}{${b.den}}` : `\\dfrac{${num}}{${b.den}}`;
}

export function integraleLatex(e: ExerciceLinearisation): string {
  const iv = e.intervalle;
  if (!iv) return "";
  return `I=\\displaystyle\\int_{${borneLatex(iv.a)}}^{${borneLatex(iv.b)}}${nomLatex(e)}\\,dx`;
}

/** Nombre exact : \dfrac{\pi}{6}+\dfrac{\sqrt{3}}{8}. */
export function exactLatex(x: NombreExact): string {
  const termes: string[] = [];
  if (x.pi.num !== 0) termes.push(termeFraction(x.pi, "\\pi"));
  if (x.un.num !== 0) termes.push(termeFraction(x.un, ""));
  if (x.r2.num !== 0) termes.push(termeFraction(x.r2, "\\sqrt{2}"));
  if (x.r3.num !== 0) termes.push(termeFraction(x.r3, "\\sqrt{3}"));
  return joindre(termes);
}

/** Valeur exacte de l'intégrale, suivie de son approximation. */
export function valeurIntegraleLatex(e: ExerciceLinearisation): string {
  const I = integraleExacte(e);
  const v = valeur(I.pi) * Math.PI + valeur(I.un) + valeur(I.r2) * Math.SQRT2 + valeur(I.r3) * Math.sqrt(3);
  const approx = (Math.round(v * 1000) / 1000).toString().replace(".", "{,}");
  return `${exactLatex(I)}\\approx ${approx}`;
}

/** F(b) − F(a) avec les sinus/cosinus des bornes écrits (\sin\left(\frac{2\pi}{3}\right)…). */
export function primitiveEnBorneLatex(e: ExerciceLinearisation, b: BornePi): string {
  if (b.num === 0) {
    const termes = primitive(e).filter((x) => x.fonction === "cos");
    return termes.length === 0 ? "0" : joindre(termes.map((x) => termeFraction(x.coef, "")));
  }
  return joindre(
    primitive(e).map((x) => {
      if (x.fonction === "x") return termeFraction(fois(x.coef, b), "\\pi");
      const angle = fr(x.k * b.num, b.den);
      return termeFraction(x.coef, `\\${x.fonction}\\left(${borneLatex(angle)}\\right)`);
    }),
  );
}

/** F(b) − F(a) valeurs des bornes écrites ; sans « −(0) » quand F(a) = 0. */
export function differenceBornesLatex(e: ExerciceLinearisation): string {
  const iv = e.intervalle!;
  const haut = primitiveEnBorneLatex(e, iv.b);
  const bas = primitiveEnBorneLatex(e, iv.a);
  return bas === "0" ? haut : `\\left(${haut}\\right)-\\left(${bas}\\right)`;
}

// ============================================================================
// Consignes.
// ============================================================================

const SOMME_COS_SIN = [t("une somme de termes en "), l("\\cos(kx)"), t(" ou "), l("\\sin(kx)"), t(" (et d'une constante éventuelle)")];

export function consigneGenerale(e: ExerciceLinearisation): FragmentConsigne[] {
  if (e.variante === "application") {
    return [t("On considère la fonction "), l(`f(x)=${nomLatex(e)}`), t(". Une puissance de cos ou de sin ne s'intègre pas directement : on la linéarise d'abord grâce aux formules d'Euler.")];
  }
  return [t("Linéarise "), l(`f(x)=${nomLatex(e)}`), t(" : écris-la sans puissance ni produit de cos et de sin, comme "), ...SOMME_COS_SIN, t(", grâce aux formules d'Euler.")];
}

export function libellePhase(phase: PhaseLinearisation): string {
  switch (phase) {
    case "euler":
      return "Formules d'Euler";
    case "developper":
      return "Binôme de Newton";
    case "regrouper":
      return "Regroupement";
    case "lineaire":
      return "Forme linéarisée";
    case "primitive":
      return "Primitive";
    case "integrale":
      return "Intégrale";
  }
}

export function consigneEcran(e: ExerciceLinearisation, phase: PhaseLinearisation): FragmentConsigne[] {
  const { q } = puissances(e);
  const sinus = enSinus(e);
  switch (phase) {
    case "euler":
      return [
        t("Remplace "),
        ...(q === 0
          ? [l(trigLatex("cos", e.a)), t(" par sa formule d'Euler")]
          : puissances(e).p === 0
            ? [l(trigLatex("sin", e.a)), t(" par sa formule d'Euler")]
            : [l(trigLatex("cos", e.a)), t(" et "), l(trigLatex("sin", e.a)), t(" par leurs formules d'Euler")]),
        t(". Tu obtiens "),
        l(`f(x)=K\\,${produitLatex(e)}`),
        t(", où "),
        l("K"),
        t(" est un nombre constant, éventuellement complexe. Calcule "),
        l("K"),
        t(" sous forme simplifiée."),
      ];
    case "developper":
      return [
        t("Développe "),
        l(`P=${produitLatex(e)}`),
        t(" à l'aide du binôme de Newton, sachant que "),
        l(produitConjuguesLatex(e.a)),
        t(". Donne le coefficient de chaque exponentielle (0 si elle n'apparaît pas)."),
      ];
    case "regrouper":
      return [
        t("Dans "),
        l(`P=${developpementLatex(e)}`),
        t(", regroupe les termes deux à deux (exposants opposés) pour écrire "),
        l("P"),
        t(" à l'aide de "),
        l(sinus ? "\\sin(kx)" : "\\cos(kx)"),
        t(sinus ? " : donne chaque coefficient (il peut contenir i)." : " : donne chaque coefficient."),
      ];
    case "lineaire":
      if (e.variante === "application") return [t("Linéarise "), l(`f(x)=${nomLatex(e)}`), t(" à l'aide des formules d'Euler : écris-la comme "), ...SOMME_COS_SIN, t(".")];
      return [t("Conclus : "), l(`f(x)=K\\cdot P`), t(" avec "), l(`K=${KLatex(e)}`), t(". Écris "), l("f(x)"), t(" sous forme linéarisée.")];
    case "primitive":
      return [t("Déduis-en une primitive "), l("F"), t(" de "), l("f"), t(".")];
    case "integrale":
      return [t("Calcule la valeur exacte de "), l(integraleLatex(e)), t(".")];
  }
}

export function champsEcran(e: ExerciceLinearisation, phase: PhaseLinearisation): ChampDef[] {
  const sinus = enSinus(e);
  switch (phase) {
    case "euler":
      return [{ label: "K", labelLatex: "K", placeholder: "ex : 2 − 3i ou 3/4" }];
    case "developper":
      return coefficientsProduit(e).map((x) => (x.k === 0 ? { label: "Terme constant", placeholder: "ex : 5" } : { label: `Coefficient de e^(${x.k}ix)`, labelLatex: expoLatex(x.k), placeholder: "ex : 5" }));
    case "regrouper":
      return termesRegroupes(e).map((x) =>
        x.k === 0 ? { label: "Terme constant", placeholder: "ex : 5" } : { label: `Coefficient de ${sinus ? "sin" : "cos"}(${x.k}x)`, labelLatex: trigLatex(sinus ? "sin" : "cos", x.k), placeholder: sinus ? "ex : 5i" : "ex : 5" },
      );
    case "lineaire":
      return [{ label: "f(x)", labelLatex: "f(x)", placeholder: "ex : 2 − sin(5x)/3" }];
    case "primitive":
      return [{ label: "F(x)", labelLatex: "F(x)", placeholder: "ex : 3x − cos(2x)/5" }];
    case "integrale":
      return [{ label: "I", labelLatex: "I", placeholder: "valeur exacte, ex : 3pi/2 − sqrt(2)/5" }];
  }
}

// ============================================================================
// Réponses attendues (validation, récapitulatif, corrigé).
// ============================================================================

export function reponseFragments(e: ExerciceLinearisation, phase: PhaseLinearisation): FragmentConsigne[] {
  switch (phase) {
    case "euler": {
      const { q } = puissances(e);
      // Le dénominateur effectué n'est écrit que s'il diffère de celui de K (i ou signe −).
      return [l(q % 4 === 0 ? `K=\\dfrac{1}{${denominateurLatex(e)}}=${KLatex(e)}` : `K=\\dfrac{1}{${denominateurLatex(e)}}=\\dfrac{1}{${denominateurSimplifie(e)}}=${KLatex(e)}`)];
    }
    case "developper":
      return [l(`P=${developpementLatex(e)}`)];
    case "regrouper":
      return [l(`P=${regroupementLatex(e)}`)];
    case "lineaire":
      return [l(`f(x)=${lineaireLatex(e)}`)];
    case "primitive":
      return [l(`F(x)=${primitiveLatex(e)}`), t(" (à une constante près).")];
    case "integrale":
      return [l(`I=F\\left(${borneLatex(e.intervalle!.b)}\\right)-F\\left(${borneLatex(e.intervalle!.a)}\\right)=${valeurIntegraleLatex(e)}`)];
  }
}

/** Dénominateur 2ᵖ(2i)ᑫ effectué : 8i, −8i, −16, 16… */
export function denominateurSimplifie(e: ExerciceLinearisation): string {
  const { q, n } = puissances(e);
  const d = 2 ** n;
  switch (q % 4) {
    case 0:
      return `${d}`;
    case 1:
      return `${d}i`;
    case 2:
      return `-${d}`;
    default:
      return `-${d}i`;
  }
}

export function reponseRecap(e: ExerciceLinearisation, phase: PhaseLinearisation): string {
  switch (phase) {
    case "euler":
      return `K=${KLatex(e)}`;
    case "developper":
      return `P=${developpementLatex(e)}`;
    case "regrouper":
      return `P=${regroupementLatex(e)}`;
    case "lineaire":
      return `f(x)=${lineaireLatex(e)}`;
    case "primitive":
      return `F(x)=${primitiveLatex(e)}`;
    case "integrale":
      return `I=${exactLatex(integraleExacte(e))}`;
  }
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

const REGROUPEMENT = "e^{ikx}+e^{-ikx}=2\\cos(kx)\\qquad e^{ikx}-e^{-ikx}=2i\\sin(kx)";

/** Développement générique (a+b)ⁿ avec ses coefficients binomiaux. */
function binomeLatex(n: number): string {
  const lignes: Record<number, string> = {
    2: "(a+b)^{2}=a^{2}+2ab+b^{2}",
    3: "(a+b)^{3}=a^{3}+3a^{2}b+3ab^{2}+b^{3}",
    4: "(a+b)^{4}=a^{4}+4a^{3}b+6a^{2}b^{2}+4ab^{3}+b^{4}",
  };
  return lignes[n];
}

export function aideNiveau1(e: ExerciceLinearisation, phase: PhaseLinearisation): AideAvecLatex {
  const { p, q, n } = puissances(e);
  switch (phase) {
    case "euler":
      return { texte: "Les formules d'Euler :", latex: eulerLatex(e.a) };
    case "developper":
      if (p > 0 && q > 0) return { texte: "Le produit d'une somme par une différence se simplifie (identité remarquable) :", latex: identiteLatex(e.a) };
      return {
        texte: q > 0 ? "Le binôme de Newton, où a est la première exponentielle et b l'opposé de la seconde (le signe − fait alterner les signes) :" : "Le binôme de Newton, où a et b sont les deux exponentielles :",
        latex: `${binomeLatex(n)},\\qquad a=${expoLatex(e.a)},\\ b=${q > 0 ? "-" : ""}${expoLatex(-e.a)}`,
      };
    case "regrouper":
      return { texte: "Deux exponentielles d'exposants opposés se regroupent ainsi :", latex: REGROUPEMENT };
    case "lineaire":
      if (e.variante === "application") return { texte: "Les formules d'Euler, puis le regroupement des exponentielles d'exposants opposés :", latex: `${eulerLatex(e.a)}\\qquad ${REGROUPEMENT}` };
      return { texte: "Il reste à distribuer K sur chaque terme de P :", latex: `f(x)=${KLatex(e)}\\left(${regroupementLatex(e)}\\right)` };
    case "primitive":
      return { texte: "Une primitive de cos(kx) et de sin(kx) :", latex: "\\displaystyle\\int\\cos(kx)\\,dx=\\dfrac{\\sin(kx)}{k}+C\\qquad \\int\\sin(kx)\\,dx=-\\dfrac{\\cos(kx)}{k}+C" };
    case "integrale":
      return { texte: "Calcule F(b) − F(a) avec ta primitive :", latex: `I=\\left[${primitiveLatex(e)}\\right]_{${borneLatex(e.intervalle!.a)}}^{${borneLatex(e.intervalle!.b)}}` };
  }
}

export function aideNiveau2(e: ExerciceLinearisation, phase: PhaseLinearisation): AideAvecLatex {
  const { p, q, n } = puissances(e);
  const sinus = enSinus(e);
  switch (phase) {
    case "euler":
      if (q === 0) return { texte: `Chaque facteur cos x apporte un dénominateur 2 ; il y en a ${n}, et K est l'inverse de leur produit :`, latex: `K=\\dfrac{1}{${denominateurLatex(e)}}` };
      return { texte: "K est l'inverse du produit des dénominateurs ; calcule ce produit avec i² = −1, puis, s'il reste un i au dénominateur, multiplie le numérateur et le dénominateur par i :", latex: `K=\\dfrac{1}{${denominateurLatex(e)}}` };
    case "developper": {
      if (p > 0 && q > 0) {
        const carre = binome(2 * e.a, "-");
        if (p === q) return { texte: "Le produit devient donc un carré, que tu développes :", latex: `P=${carre}^{2}` };
        const reste = binome(e.a, p > q ? "+" : "-");
        return { texte: "Il reste à multiplier ce résultat par le dernier facteur ; les exposants s'additionnent :", latex: `P=${carre}${reste},\\qquad ${expoLatex(2 * e.a)}\\cdot ${expoLatex(-e.a)}=${expoLatex(e.a)}` };
      }
      return {
        texte: "Dans chaque terme, les exposants s'additionnent :",
        latex: q > 0
          ? `\\left(${expoLatex(e.a)}\\right)^{k}\\left(-${expoLatex(-e.a)}\\right)^{${n}-k}=(-1)^{${n}-k}\\,e^{${e.a === 1 ? "" : e.a}i(2k-${n})x}`
          : `\\left(${expoLatex(e.a)}\\right)^{k}\\left(${expoLatex(-e.a)}\\right)^{${n}-k}=e^{${e.a === 1 ? "" : e.a}i(2k-${n})x}`,
      };
    }
    case "regrouper":
      return { texte: "Mets en facteur le coefficient commun de chaque paire, puis applique la formule :", latex: `P=${appariementLatex(e)}` };
    case "lineaire":
      if (e.variante === "application") return { texte: "Après les formules d'Euler et le binôme, tu dois obtenir :", latex: `f(x)=${KLatex(e)}\\left(${developpementLatex(e)}\\right)` };
      return sinus ? { texte: "Pour les coefficients en i, pense à :", latex: "i\\cdot i=i^{2}=-1" } : { texte: "Simplifie ensuite chaque fraction ; par exemple, pour le premier terme de P :", latex: premierTermeLatex(e) };
    case "primitive": {
      const premier = formeLineaire(e)[formeLineaire(e).length - 1];
      const k = premier.k;
      const f = premier.fonction;
      if (f === null) return { texte: "Une constante a se primitive en ax :", latex: "\\displaystyle\\int a\\,dx=ax+C" };
      return { texte: "Par exemple, pour le terme de plus haute fréquence :", latex: `\\displaystyle\\int ${fractionLatex(premier.coef)}\\,${trigLatex(f, k)}\\,dx=${fractionLatex(premier.coef)}\\cdot\\left(${f === "cos" ? "" : "-"}\\dfrac{${trigLatex(f === "cos" ? "sin" : "cos", k)}}{${k}}\\right)+C` };
    }
    case "integrale":
      return { texte: "En remplaçant x par les bornes :", latex: `I=${differenceBornesLatex(e)}` };
  }
}

/** « K · (2c_n) cos(nx) = \dfrac{2c_n}{2^n} cos(nx) » non simplifié (aide de l'écran lineaire, q pair). */
function premierTermeLatex(e: ExerciceLinearisation): string {
  const premier = termesRegroupes(e)[0];
  const K = facteurK(e);
  const numerateur = K.re.num * premier.coef;
  return `${KLatex(e)}\\cdot ${premier.coef}${trigLatex("cos", premier.k)}=${numerateur < 0 ? "-" : ""}\\dfrac{${Math.abs(numerateur)}}{${K.re.den}}${trigLatex("cos", premier.k)}`;
}
