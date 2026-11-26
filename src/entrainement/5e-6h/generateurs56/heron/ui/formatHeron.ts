import type { AideEcran, ChampEcran, Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceHeron, ExerciceHeronRectangles, ExercicePuissances } from "../index";
import { ecartDe, ecartFraction, largeurDe, longueurDe } from "../index";
import { dixMoinsL, dixMoinsT, egalOuEnvironL, fractionL, nbL, parDefautA, parExcesA, scientifiqueL, tronqueL, valeurL } from "../../nombres56";

/**
 * Couche C — textes de `56gen20` « Héron et encadrements successifs » (notations du cours, étape 5 :
 * rectangle numéro n de longueur aₙ et de largeur A/aₙ, aₙ₊₁ = ½(aₙ + A/aₙ), A/aₙ ≤ √A ≤ aₙ ; méthode
 * des puissances u − v√p). Source unique de l'écran, des aides, du corrigé et du papier.
 */

type E = ExerciceHeron;
type R = ExerciceHeronRectangles;
type Pu = ExercicePuissances;

export type PhaseHeron = "rect2" | "encadrement" | "etapes" | "valeur" | "carre1" | "carre2" | "fraction" | "ecart";
export const PHASES_HERON: PhaseHeron[] = ["rect2", "encadrement", "etapes", "valeur"];
export const PHASES_PUISSANCES: PhaseHeron[] = ["carre1", "carre2", "fraction", "ecart"];
export const COURS_HERON = "(cours, § 5)";

export const phasesDe = (e: E): PhaseHeron[] => (e.type === "heron" ? PHASES_HERON : PHASES_PUISSANCES);

/** Nombre de décimales des longueurs écrites : assez pour voir l'écart à 10⁻ᵏ. */
export const decimalesHeron = (e: R) => Math.max(6, e.k + 2);
export const racineL = (e: R) => `\\sqrt{${e.A}}`;
export const recurrenceL = (e: R) => `a_{n+1}=\\dfrac{1}{2}\\left(a_n+\\dfrac{${e.A}}{a_n}\\right)`;

/** Base de la méthode des puissances : « \sqrt{3}-1 » ou « 2-\sqrt{3} ». */
export const baseL = (e: Pu) => (e.racineDAbord ? `\\sqrt{${e.P}}-${e.c}` : `${e.c}-\\sqrt{${e.P}}`);
export const formeL = (u: number, v: number, P: number) => `${u}-${v}\\sqrt{${P}}`;

/* ------------------------------------------------------------------------------------------------
 * Énoncé
 * ---------------------------------------------------------------------------------------------- */

export function situation(e: E): Frag[] {
  if (e.type === "heron") {
    const depart = e.p === 1 ? `de dimensions 1 et ${e.A}` : `de dimensions ${e.p} et ${e.q}`;
    return [
      tx("On cherche une valeur approchée de "),
      lx(racineL(e)),
      tx(` par l'algorithme de Héron. On part d'un rectangle d'aire ${e.A} ${depart} : sa longueur est `),
      lx(`a_1=${e.q}`),
      tx(". Chaque rectangle suivant, de même aire, a pour longueur la moyenne arithmétique des deux côtés du précédent : "),
      lx(recurrenceL(e)),
      tx(" ; sa largeur est "),
      lx(`\\dfrac{${e.A}}{a_n}`),
      tx("."),
    ];
  }
  return [
    tx("Pour approcher "),
    lx(`\\sqrt{${e.P}}`),
    tx(" par une fraction, on utilise la méthode des puissances. On sait que "),
    lx(`0<${baseL(e)}<1`),
    tx(" : les puissances successives de ce nombre sont de plus en plus proches de 0."),
  ];
}

export const consigneGenerale = situation;

export function libelle(e: E, phase: PhaseHeron): string {
  switch (phase) {
    case "rect2":
      return "Deuxième rectangle";
    case "encadrement":
      return "Encadrement (troisième rectangle)";
    case "etapes":
      return "Rectangle assez précis";
    case "valeur":
      return e.type === "heron" ? `Valeur approchée à ${dixMoinsT(e.k)} près` : "Valeur approchée";
    case "carre1":
      return "Premier carré";
    case "carre2":
      return "Deuxième carré";
    case "fraction":
      return "Fraction approchée";
    case "ecart":
      return "Écart avec la calculatrice";
  }
}

export function consigne(e: E, phase: PhaseHeron): Frag[] {
  if (e.type === "heron") {
    switch (phase) {
      case "rect2":
        return [tx("Calcule les dimensions du deuxième rectangle : sa longueur "), lx("a_2"), tx(" et sa largeur "), lx(`\\dfrac{${e.A}}{a_2}`), tx(" (au dix-millième).")];
      case "encadrement":
        return [
          tx("Calcule les dimensions du troisième rectangle et déduis-en un encadrement de "),
          lx(racineL(e)),
          tx(" : donne le minorant et le majorant au dix-millième (minorant arrondi par défaut, majorant par excès)."),
        ];
      case "etapes":
        return [
          tx("Poursuis l'algorithme avec le menu Récurrence de la calculatrice. À partir de quel rectangle (numéro "),
          lx("n"),
          tx(") l'écart "),
          lx(`a_n-\\dfrac{${e.A}}{a_n}`),
          tx(" entre la longueur et la largeur devient-il inférieur à "),
          lx(dixMoinsL(e.k)),
          tx(" ?"),
        ];
      default:
        return [tx("Déduis-en une valeur approchée de "), lx(racineL(e)), tx(" à "), lx(dixMoinsL(e.k)), tx(" près.")];
    }
  }
  switch (phase) {
    case "carre1":
      return [tx("Calcule "), lx(`(${baseL(e)})^2`), tx(" et écris le résultat sous la forme "), lx(`u-v\\sqrt{${e.P}}`), tx(", avec "), lx("u"), tx(" et "), lx("v"), tx(" entiers.")];
    case "carre2":
      return [tx("Calcule "), lx(`(${baseL(e)})^4`), tx(", le carré du résultat précédent, sous la même forme "), lx(`u-v\\sqrt{${e.P}}`), tx(".")];
    case "fraction":
      return [tx("Ce nombre est très proche de 0. Déduis-en une fraction irréductible proche de "), lx(`\\sqrt{${e.P}}`), tx(".")];
    default:
      return [
        tx("Avec la calculatrice, calcule l'écart entre cette fraction et "),
        lx(`\\sqrt{${e.P}}`),
        tx(" (la fraction moins "),
        lx(`\\sqrt{${e.P}}`),
        tx("). Donne-le avec deux chiffres significatifs."),
      ];
  }
}

export function champs(e: E, phase: PhaseHeron): ChampEcran[] {
  if (e.type === "heron") {
    switch (phase) {
      case "rect2":
        return [
          { label: "longueur a₂", labelLatex: "a_2=", placeholder: "ex. : 5,5" },
          { label: "largeur", labelLatex: `\\dfrac{${e.A}}{a_2}=`, placeholder: "ex. : 3,2727" },
        ];
      case "encadrement":
        return [
          { label: "minorant", labelLatex: "\\text{minorant}=", placeholder: "ex. : 4,1036" },
          { label: "majorant", labelLatex: "\\text{majorant}=", placeholder: "ex. : 4,3864" },
        ];
      case "etapes":
        return [{ label: "numéro du rectangle", labelLatex: "n=", placeholder: "ex. : 6" }];
      default:
        return [{ label: `valeur approchée de √${e.A}`, labelLatex: `${racineL(e)}\\approx`, placeholder: "ex. : 4,2426" }];
    }
  }
  switch (phase) {
    case "carre1":
    case "carre2":
      return [
        { label: "u", labelLatex: "u=", placeholder: "ex. : 4" },
        { label: "v", labelLatex: "v=", placeholder: "ex. : 2" },
      ];
    case "fraction":
      return [{ label: `fraction proche de √${e.P}`, labelLatex: `\\sqrt{${e.P}}\\approx`, placeholder: "ex. : 17/12" }];
    default:
      return [{ label: "écart", labelLatex: "\\text{écart}\\approx", placeholder: "ex. : 2,5·10^-3" }];
  }
}

/* ------------------------------------------------------------------------------------------------
 * Aides (deux niveaux : propriété du cours, puis posée pour l'instance — jamais la réponse)
 * ---------------------------------------------------------------------------------------------- */

export function aide1(e: E, phase: PhaseHeron): AideEcran {
  if (e.type === "heron") {
    switch (phase) {
      case "rect2":
        return {
          texte: [tx(`La longueur du rectangle suivant est la moyenne arithmétique des deux côtés ; sa largeur s'obtient en divisant l'aire par cette longueur ${COURS_HERON} :`)],
          latex: `a_{n+1}=\\dfrac{1}{2}\\left(a_n+\\dfrac{A}{a_n}\\right)\\qquad \\text{largeur}=\\dfrac{A}{a_{n+1}}`,
        };
      case "encadrement":
        return {
          texte: [tx(`Recommence à partir du deuxième rectangle. Dès le deuxième rectangle, la racine est comprise entre la largeur et la longueur ${COURS_HERON} :`)],
          latex: `\\dfrac{A}{a_n}\\leq\\sqrt{A}\\leq a_n`,
        };
      case "etapes":
        return {
          texte: [tx("Dans le menu Récurrence, entre la suite définie par "), lx(recurrenceL(e)), tx(" et "), lx(`a_1=${e.q}`), tx(", puis affiche la table. Pour chaque rang, calcule l'écart entre la longueur et la largeur :")],
          latex: `a_n-\\dfrac{${e.A}}{a_n}`,
        };
      default:
        return { texte: [tx("Au rectangle trouvé, la racine est entre la largeur et la longueur, qui diffèrent de moins de "), lx(dixMoinsL(e.k)), tx(" : tout nombre de cet intervalle est une valeur approchée à "), lx(dixMoinsL(e.k)), tx(" près.")] };
    }
  }
  switch (phase) {
    case "carre1":
      return { texte: [tx(`Développe le carré d'une différence et utilise le carré d'une racine ${COURS_HERON} :`)], latex: `(a-b)^2=a^2-2ab+b^2\\qquad (\\sqrt{${e.P}})^2=${e.P}` };
    case "carre2":
      return { texte: [tx("Élève au carré le résultat de l'écran précédent, avec la même identité :")], latex: `(u-v\\sqrt{${e.P}})^2=u^2-2uv\\sqrt{${e.P}}+${e.P}v^2` };
    case "fraction":
      return { texte: [tx("Si "), lx(`u-v\\sqrt{${e.P}}\\approx 0`), tx(", alors "), lx(`v\\sqrt{${e.P}}\\approx u`), tx(" : divise par "), lx("v"), tx(", puis simplifie la fraction.")] };
    default:
      return { texte: [tx("Calcule la fraction moins la racine avec la calculatrice, puis écris le résultat en notation scientifique (par exemple "), lx("2{,}5\\cdot 10^{-3}"), tx(").")] };
  }
}

export function aide2(e: E, phase: PhaseHeron): AideEcran | null {
  if (e.type === "heron") {
    const d = decimalesHeron(e);
    switch (phase) {
      case "rect2":
        return { texte: [tx("Ici, le premier rectangle mesure "), lx(`${e.q}`), tx(" sur "), lx(`${e.p}`), tx(" :")], latex: `a_2=\\dfrac{1}{2}\\left(${e.q}+${e.p}\\right)\\qquad \\dfrac{${e.A}}{a_2}` };
      case "encadrement":
        return {
          texte: [tx("Ici, garde toutes les décimales en mémoire de la calculatrice :")],
          latex: `a_3=\\dfrac{1}{2}\\left(${tronqueL(longueurDe(e, 2), d)}+${tronqueL(largeurDe(e, 2), d)}\\right)\\qquad \\dfrac{${e.A}}{a_3}\\leq\\sqrt{${e.A}}\\leq a_3`,
        };
      case "etapes":
        return {
          texte: [tx("Ici, tu connais déjà les écarts des rectangles 2 et 3 ; continue avec le rectangle 4, puis 5…")],
          latex: `a_2-\\dfrac{${e.A}}{a_2}\\approx ${valeurL(ecartDe(e, 2), 4)}\\qquad a_3-\\dfrac{${e.A}}{a_3}\\approx ${ecartDe(e, 3) < 1e-3 ? scientifiqueL(ecartDe(e, 3)) : valeurL(ecartDe(e, 3), 4)}`,
        };
      default:
        return { texte: [tx(`Ici, écris la largeur et la longueur du rectangle ${e.nPrecision} avec ${e.k + 2} décimales, puis garde ${e.k} décimales.`)] };
    }
  }
  switch (phase) {
    case "carre1":
      return { texte: [tx("Ici :")], latex: e.racineDAbord ? `(\\sqrt{${e.P}})^2-2\\cdot ${e.c}\\cdot\\sqrt{${e.P}}+${e.c}^2` : `${e.c}^2-2\\cdot ${e.c}\\cdot\\sqrt{${e.P}}+(\\sqrt{${e.P}})^2` };
    case "carre2":
      return { texte: [tx("Ici :")], latex: `(${formeL(e.u1, e.v1, e.P)})^2=${e.u1}^2-2\\cdot ${e.u1}\\cdot ${e.v1}\\sqrt{${e.P}}+${e.P}\\cdot ${e.v1}^2` };
    case "fraction":
      return { texte: [tx("Ici, "), lx(`\\sqrt{${e.P}}\\approx\\dfrac{${e.u2}}{${e.v2}}`), tx(" : cherche le plus grand diviseur commun de "), lx(`${e.u2}`), tx(" et "), lx(`${e.v2}`), tx(".")] };
    default:
      return { texte: [tx("Ici, tape directement :")], latex: `${fractionL(e.num, e.den)}-\\sqrt{${e.P}}` };
  }
}

export function messageIllisible(e: E, phase: PhaseHeron): string {
  if (phase === "etapes") return "Nombre non reconnu : écris un numéro de rectangle entier, par exemple 5. Cette saisie ne compte pas comme une tentative.";
  if (phase === "carre1" || phase === "carre2") return "Nombre non reconnu : écris des nombres entiers, par exemple 28 et 16. Cette saisie ne compte pas comme une tentative.";
  if (phase === "fraction") return "Fraction non reconnue : écris-la avec une barre, par exemple 97/56. Cette saisie ne compte pas comme une tentative.";
  if (phase === "ecart") return "Nombre non reconnu : écris par exemple 9,2·10^-5 ou 0,000092. Cette saisie ne compte pas comme une tentative.";
  void e;
  return "Nombre non reconnu : écris un nombre décimal comme 4,2426 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

/* ------------------------------------------------------------------------------------------------
 * Réponses (écran, papier, corrigé)
 * ---------------------------------------------------------------------------------------------- */

export function encadrementL(e: R, n: number, dec = 4): string {
  return `${nbL(parDefautA(largeurDe(e, n), dec), dec, true)}\\leq ${racineL(e)}\\leq ${nbL(parExcesA(longueurDe(e, n), dec), dec, true)}`;
}

/** Valeur approchée de √A à 10⁻ᵏ près (arrondi ordinaire à k décimales). */
export const valeurApprocheeL = (e: R) => nbL(Math.sqrt(e.A), e.k, true);

export function reponse(e: E, phase: PhaseHeron): Frag[] {
  if (e.type === "heron") {
    switch (phase) {
      case "rect2":
        return [lx(`a_2${egalOuEnvironL(longueurDe(e, 2), 4)}`), tx(" ; "), lx(`\\dfrac{${e.A}}{a_2}${egalOuEnvironL(largeurDe(e, 2), 4)}`)];
      case "encadrement":
        return [lx(encadrementL(e, 3))];
      case "etapes":
        return [tx(`À partir du rectangle ${e.nPrecision}.`)];
      default:
        return [lx(`${racineL(e)}\\approx ${valeurApprocheeL(e)}`)];
    }
  }
  switch (phase) {
    case "carre1":
      return [lx(`(${baseL(e)})^2=${formeL(e.u1, e.v1, e.P)}`)];
    case "carre2":
      return [lx(`(${baseL(e)})^4=${formeL(e.u2, e.v2, e.P)}`)];
    case "fraction":
      return [lx(`\\sqrt{${e.P}}\\approx ${fractionL(e.num, e.den)}`)];
    default:
      return [lx(`${fractionL(e.num, e.den)}-\\sqrt{${e.P}}\\approx ${scientifiqueL(ecartFraction(e))}`)];
  }
}

export const recap = reponse;
