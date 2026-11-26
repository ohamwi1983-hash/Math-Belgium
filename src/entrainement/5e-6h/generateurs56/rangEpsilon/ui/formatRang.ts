import type { AideEcran, ChampEcran, Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { pgcd } from "../../../../5e-4h/ui5e/nombresTrigo";
import type { Epsilon, ExerciceGeometrique, ExerciceRang, ExerciceRationnelle } from "../index";
import { ecart, fibonacci } from "../index";
import { affineVarL, exactAvec, exposantT, fractionL, nbL, nbT, scientifiqueL } from "../../nombres56";

/**
 * Couche C — textes de `56gen22` « Rang à partir duquel |uₙ − ℓ| < ε » (notations du cours, étape 9 :
 * (∀ε ∈ ℝ₀⁺)(∃m ∈ ℕ₀) : n > m ⇒ |uₙ − ℓ| < ε ; Φ = (1 + √5)/2, vₙ = Fₙ₊₁/Fₙ). Source unique de l'écran,
 * des aides, du corrigé et du papier.
 */

type E = ExerciceRang;
export type PhaseRang = "limite" | "ecart" | "inequation" | "premier" | "rang" | "terme";
export const COURS_LIMITE = "(cours, § 9)";

export function phasesRang(e: E): PhaseRang[] {
  if (e.variante === "rationnelle") return ["limite", "ecart", "inequation", "rang"];
  if (e.variante === "geometrique") return ["limite", "ecart", "premier", "rang"];
  return ["terme", "limite", "premier", "rang"];
}

/* ------------------------------------------------------------------------------------------------
 * Écritures
 * ---------------------------------------------------------------------------------------------- */

export const epsL = (x: Epsilon) => (x.mu === 1 ? `10^{-${x.k}}` : nbL(x.mu * 10 ** -x.k, x.k));
export const epsT = (x: Epsilon) => (x.mu === 1 ? `10${exposantT(-x.k)}` : nbT(x.mu * 10 ** -x.k, x.k));
/** 1/ε (entier). */
export const inverseEps = (x: Epsilon) => Math.round(10 ** x.k / x.mu);

/** Nom de la suite et de sa limite. */
export const nomU = (e: E) => (e.variante === "fibonacci" ? "v" : "u");
export const nomL = (e: E) => (e.variante === "fibonacci" ? "\\Phi" : "\\ell");
export const ecartNomL = (e: E, n = "n") => `|${nomU(e)}_{${n}}-${nomL(e)}|`;

/** Limite ℓ en LaTeX. */
export function limiteL(e: E): string {
  if (e.variante === "rationnelle") {
    const g = pgcd(Math.abs(e.a), e.c);
    return fractionL(e.a / g, e.c / g);
  }
  if (e.variante === "geometrique") return `${e.ell}`;
  return "\\dfrac{1+\\sqrt{5}}{2}";
}

const rL = (q: number) => nbL(q, 2);

/** Terme qui tend vers 0 (uₙ − ℓ), sans signe devant : « \dfrac{5}{2^{n}} », « 3\cdot 0{,}8^{n} ». */
function partieL(e: ExerciceGeometrique, k: number): string {
  if (e.forme === "fraction") return `\\dfrac{${k}}{${e.q}^{n}}`;
  if (e.forme === "alterne") return `\\dfrac{${k}}{(-${e.q})^{n}}`;
  return `${k === 1 ? "" : `${k}\\cdot `}${rL(e.q)}^{n}`;
}

/** Terme général uₙ. */
export function termeL(e: E): string {
  if (e.variante === "rationnelle") return `\\dfrac{${affineVarL(e.a, e.b, "n")}}{${affineVarL(e.c, e.d, "n")}}`;
  if (e.variante === "geometrique") {
    const p = partieL(e, Math.abs(e.k));
    if (e.ell === 0) return e.k < 0 ? `-${p}` : p;
    return `${e.ell}${e.k < 0 ? "-" : "+"}${p}`;
  }
  return "\\dfrac{F_{n+1}}{F_n}";
}

/** uₙ − ℓ (signé) en LaTeX — géométrique. */
export function ecartSigneGeoL(e: ExerciceGeometrique): string {
  const p = partieL(e, Math.abs(e.k));
  return e.k < 0 ? `-${p}` : p;
}

/** |uₙ − ℓ| sans valeur absolue. */
export function ecartL(e: E): string {
  if (e.variante === "rationnelle") {
    const g = pgcd(e.K, e.c);
    const K = e.K / g;
    const c = e.c / g;
    const den = affineVarL(e.c, e.d, "n");
    return c === 1 ? `\\dfrac{${K}}{${den}}` : `\\dfrac{${K}}{${c}(${den})}`;
  }
  if (e.variante === "geometrique") return partieL(e, Math.abs(e.k)).replace(`(-${e.q})^{n}`, `${e.q}^{n}`);
  return `\\left|\\dfrac{F_{n+1}}{F_n}-\\Phi\\right|`;
}

/** Borne B (n > B) : entier ou fraction. */
export function borneL(e: ExerciceRationnelle): string {
  return fractionL(e.bNum, e.bDen);
}
export const borneValeur = (e: ExerciceRationnelle) => e.bNum / e.bDen;

/** Écart écrit pour la table : décimal ou notation scientifique. */
export function ecartValeurL(x: number): string {
  if (exactAvec(x, 5)) return `=${nbL(x, 5)}`;
  return x >= 0.001 ? `\\approx ${nbL(x, 5, true)}` : `\\approx ${scientifiqueL(x, 3)}`;
}

/* ------------------------------------------------------------------------------------------------
 * Énoncé
 * ---------------------------------------------------------------------------------------------- */

export function situation(e: E): Frag[] {
  if (e.variante === "fibonacci") {
    return [
      tx("La suite de Fibonacci est définie par "),
      lx("F_1=F_2=1"),
      tx(" et "),
      lx("F_{n+2}=F_{n+1}+F_n"),
      tx(". La suite des rapports "),
      lx("v_n=\\dfrac{F_{n+1}}{F_n}"),
      tx(" converge vers le nombre d'or "),
      lx("\\Phi"),
      tx(". Soit "),
      lx(`\\varepsilon=${epsL(e.eps)}`),
      tx("."),
    ];
  }
  return [tx("On considère la suite définie par "), lx(`u_n=${termeL(e)}`), tx(" pour "), lx("{n\\in\\mathbb{N}_0}"), tx(", et le réel "), lx(`\\varepsilon=${epsL(e.eps)}`), tx(".")];
}

export function consigneGenerale(e: E): Frag[] {
  return [
    ...situation(e),
    tx(" On cherche le plus petit rang "),
    lx("m"),
    tx(" tel que, pour tout "),
    lx("n>m"),
    tx(", "),
    lx(`${ecartNomL(e)}<\\varepsilon`),
    tx(e.variante === "fibonacci" ? "." : ", où "),
    ...(e.variante === "fibonacci" ? [] : [lx("\\ell"), tx(" est la limite de la suite.")]),
  ];
}

export function libelle(e: E, phase: PhaseRang): string {
  switch (phase) {
    case "limite":
      return e.variante === "fibonacci" ? "Valeur de Φ" : "Limite ℓ";
    case "ecart":
      return "Écart |uₙ − ℓ|";
    case "inequation":
      return "Inéquation";
    case "premier":
      return "Premier rang qui convient";
    case "rang":
      return "Rang m";
    case "terme":
      return e.variante === "fibonacci" ? `Rapport v${["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"][e.n0]}` : "Terme";
  }
}

export function consigne(e: E, phase: PhaseRang): Frag[] {
  const n = nomU(e);
  switch (phase) {
    case "limite":
      return e.variante === "fibonacci"
        ? [tx("Donne la valeur exacte du nombre d'or "), lx("\\Phi"), tx(", limite de "), lx("(v_n)"), tx(".")]
        : [tx("Calcule la limite "), lx("\\ell"), tx(" de la suite (valeur exacte).")];
    case "ecart":
      return [tx("Écris "), lx(`|u_n-\\ell|`), tx(" en fonction de "), lx("n"), tx(", sans valeur absolue.")];
    case "inequation":
      return [tx("Résous l'inéquation "), lx(`|u_n-\\ell|<${epsL(e.eps)}`), tx(" : elle équivaut à "), lx("n>B"), tx(". Donne "), lx("B"), tx(".")];
    case "premier":
      return [tx(`Avec la ${e.variante === "fibonacci" ? "table du menu Récurrence" : "table de la calculatrice"}, détermine le premier rang `), lx("n"), tx(" pour lequel "), lx(`${ecartNomL(e)}<${epsL(e.eps)}`), tx(" (l'écart diminue quand "), lx("n"), tx(" augmente).")];
    case "rang":
      return [tx("Déduis-en le plus petit rang "), lx("m"), tx(" tel que, pour tout "), lx("n>m"), tx(", "), lx(`|${n}_n-${nomL(e)}|<\\varepsilon`), tx(".")];
    case "terme":
      return [tx("Calcule "), lx(`v_{${(e as { n0: number }).n0}}`), tx(" sous forme de fraction.")];
  }
}

export function champs(e: E, phase: PhaseRang): ChampEcran[] {
  switch (phase) {
    case "limite":
      return e.variante === "fibonacci" ? [{ label: "Φ", labelLatex: "\\Phi=", placeholder: "ex. : (1 + √5)/2" }] : [{ label: "limite ℓ", labelLatex: "\\ell=", placeholder: "ex. : 3/2" }];
    case "ecart":
      return [{ label: "écart en fonction de n", labelLatex: "|u_n-\\ell|=", placeholder: "ex. : 5/(2n + 1)", apercu: true }];
    case "inequation":
      return [{ label: "B", labelLatex: "n>", placeholder: "ex. : 999" }];
    case "premier":
      return [{ label: "premier rang n", labelLatex: "n=", placeholder: "ex. : 12" }];
    case "rang":
      return [{ label: "rang m", labelLatex: "m=", placeholder: "ex. : 11" }];
    case "terme":
      return [{ label: `v${(e as { n0: number }).n0}`, labelLatex: `v_{${(e as { n0: number }).n0}}=`, placeholder: "ex. : 8/5" }];
  }
}

/* ------------------------------------------------------------------------------------------------
 * Aides (deux niveaux : propriété du cours, puis posée pour l'instance — jamais la réponse)
 * ---------------------------------------------------------------------------------------------- */

export function aide1(e: E, phase: PhaseRang): AideEcran {
  switch (phase) {
    case "limite":
      if (e.variante === "rationnelle") return { texte: [tx(`Divise le numérateur et le dénominateur par n : les termes en 1/n tendent vers 0 ${COURS_LIMITE}.`)], latex: "\\lim\\limits_{n\\to+\\infty}\\dfrac{an+b}{cn+d}=\\dfrac{a}{c}" };
      if (e.variante === "geometrique") return { texte: [tx(`Une suite géométrique de raison comprise strictement entre −1 et 1 tend vers 0 ${COURS_LIMITE} : le terme en n disparaît à l'infini.`)] };
      return { texte: [tx(`Si la suite converge vers Φ, on peut remplacer vₙ₊₁ et vₙ par Φ dans la relation de récurrence ${COURS_LIMITE} :`)], latex: "v_{n+1}=1+\\dfrac{1}{v_n}\\ \\Rightarrow\\ \\Phi=1+\\dfrac{1}{\\Phi}" };
    case "ecart":
      return e.variante === "rationnelle"
        ? { texte: [tx("Réduis "), lx("u_n-\\ell"), tx(" au même dénominateur ; la valeur absolue enlève le signe (le dénominateur est positif pour tout naturel n non nul).")] }
        : { texte: [lx("u_n-\\ell"), tx(" est le terme qui tend vers 0 ; la valeur absolue enlève le signe : "), lx("|-x|=x"), tx(" et "), lx("|(-q)^n|=q^n"), tx(".")] };
    case "inequation":
      return { texte: [tx("Les deux membres sont positifs : en passant aux inverses, l'inégalité change de sens. Isole ensuite n.")], latex: "\\dfrac{A}{X}<\\varepsilon\\iff X>\\dfrac{A}{\\varepsilon}\\quad(A>0,\\ X>0)" };
    case "premier":
      return e.variante === "fibonacci"
        ? { texte: [tx("Dans le menu Récurrence, entre "), lx("v_{n+1}=1+\\dfrac{1}{v_n}"), tx(" avec "), lx("v_1=1"), tx(", affiche la table, puis compare chaque terme à "), lx("\\Phi"), tx(".")] }
        : { texte: [tx("Entre l'écart "), lx("|u_n-\\ell|"), tx(" comme fonction de n dans le menu Table, avec un pas de 1 : l'écart diminue, cherche le premier rang où il passe sous "), lx("\\varepsilon"), tx(".")] };
    case "rang":
      return { texte: [tx(`Dans la définition, « n > m » : tous les rangs strictement plus grands que m doivent convenir ${COURS_LIMITE}. Le plus petit m est donc le rang juste avant le premier rang qui convient.`)] };
    case "terme":
      return { texte: [tx("Écris les nombres de Fibonacci (chacun est la somme des deux précédents), puis divise "), lx("F_{n+1}"), tx(" par "), lx("F_n"), tx(".")] };
  }
}

export function aide2(e: E, phase: PhaseRang): AideEcran | null {
  switch (phase) {
    case "limite":
      if (e.variante === "rationnelle") {
        const num = `${e.a}${e.b === 0 ? "" : e.b < 0 ? `-\\frac{${-e.b}}{n}` : `+\\frac{${e.b}}{n}`}`;
        return { texte: [tx("Ici, en divisant par n :")], latex: `u_n=\\dfrac{${num}}{${e.c}+\\frac{${e.d}}{n}}` };
      }
      if (e.variante === "geometrique") return { texte: [tx("Ici, "), lx(`u_n=${termeL(e)}`), tx(" : le terme qui contient n tend vers 0.")] };
      return { texte: [tx("Ici, multiplie par "), lx("\\Phi"), tx(" : "), lx("\\Phi^2-\\Phi-1=0"), tx(" ; garde la solution positive.")] };
    case "ecart":
      if (e.variante === "rationnelle") return { texte: [tx("Ici :")], latex: `u_n-\\ell=\\dfrac{${affineVarL(e.a, e.b, "n")}}{${affineVarL(e.c, e.d, "n")}}-${e.a < 0 ? `\\left(${limiteL(e)}\\right)` : limiteL(e)}` };
      return { texte: [tx("Ici, "), lx(`\\ell=${limiteL(e)}`), tx(" : écris "), lx("u_n-\\ell"), tx(", puis enlève le signe éventuel.")] };
    case "inequation": {
      const r = e as ExerciceRationnelle;
      const g = pgcd(r.K, r.c);
      return { texte: [tx("Ici :")], latex: `${ecartL(r)}<${epsL(r.eps)}\\iff ${r.c / g === 1 ? "" : r.c / g}${r.c / g === 1 ? affineVarL(r.c, r.d, "n") : `(${affineVarL(r.c, r.d, "n")})`}>\\dfrac{${r.K / g}}{${epsL(r.eps)}}` };
    }
    case "premier":
      return e.variante === "fibonacci"
        ? { texte: [tx("Ici, "), lx("\\Phi\\approx 1{,}6180340"), tx(" ; compare "), lx(`|v_n-\\Phi|`), tx(" à "), lx(epsL(e.eps)), tx(".")] }
        : { texte: [tx("Ici, entre "), lx(`f(x)=${ecartL(e).replace(/n/g, "x")}`), tx(" et compare chaque valeur à "), lx(epsL(e.eps)), tx(".")] };
    case "rang":
      return null;
    case "terme": {
      const n0 = (e as { n0: number }).n0;
      return { texte: [tx("Ici : "), lx(Array.from({ length: n0 + 1 }, (_, i) => `F_{${i + 1}}=${fibonacci(i + 1)}`).slice(0, 4).join(",\\ ")), tx("…")] };
    }
  }
}

export function messageIllisible(_e: E, phase: PhaseRang): string {
  if (phase === "ecart") return "Expression non reconnue : écris une expression en n, par exemple 5/(2n + 1) ou 3·0,8^n. Cette saisie ne compte pas comme une tentative.";
  if (phase === "premier" || phase === "rang") return "Nombre non reconnu : écris un rang entier, par exemple 27. Cette saisie ne compte pas comme une tentative.";
  if (phase === "terme") return "Fraction non reconnue : écris-la avec une barre, par exemple 8/5. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre, une fraction comme 3/2 ou une racine comme (1 + √5)/2. Cette saisie ne compte pas comme une tentative.";
}

/* ------------------------------------------------------------------------------------------------
 * Réponses
 * ---------------------------------------------------------------------------------------------- */

export function reponse(e: E, phase: PhaseRang): Frag[] {
  switch (phase) {
    case "limite":
      return [lx(`${nomL(e)}=${limiteL(e)}`)];
    case "ecart":
      return [lx(`|u_n-\\ell|=${ecartL(e)}`)];
    case "inequation":
      return [lx(`n>${borneL(e as ExerciceRationnelle)}`), ...((e as ExerciceRationnelle).bDen === 1 ? [] : [tx(" (environ "), lx(nbL(borneValeurR(e), 2, true)), tx(")")])];
    case "premier":
      return [tx(`À partir du rang ${e.N}.`)];
    case "rang":
      return [lx(`m=${e.m}`)];
    case "terme": {
      const n0 = (e as { n0: number }).n0;
      return [lx(`v_{${n0}}=\\dfrac{${fibonacci(n0 + 1)}}{${fibonacci(n0)}}`)];
    }
  }
}

const borneValeurR = (e: E) => borneValeur(e as ExerciceRationnelle);
export const recap = reponse;
export { ecart };
