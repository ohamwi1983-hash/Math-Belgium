import type { ExerciceInteretsComposes } from "../core6e/interetsComposes";
import { capital, capitalLimite, tauxDecimal, tauxEquivalent } from "../core6e/interetsComposes";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { egalApprox, milliersL, milliersT, nbL, nbT } from "./nombresExpoLotG";

/**
 * Couche C — textes de `6gen151` « Intérêts composés et nombre e ». Source unique de l'écran, des
 * aides, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceInteretsComposes;
export type PhaseInteretsComposes = "capitaux" | "limite" | "taux";
export const PHASES_INTERETS: PhaseInteretsComposes[] = ["capitaux", "limite", "taux"];

export const monnaie = (e: E) => (e.variante === "bernoulli" ? "florins" : "€");
export const rL = (e: E) => nbL(tauxDecimal(e), 3);
export const rPctT = (e: E) => `${nbT(e.tauxPourcent, 1)} %`;
const NOMS_FREQ: Record<number, string> = { 1: "une fois par an", 2: "deux fois par an (semestriellement)", 4: "quatre fois par an (trimestriellement)", 12: "chaque mois", 52: "chaque semaine", 365: "chaque jour" };
export const nomFrequence = (n: number) => NOMS_FREQ[n] ?? `${n} fois par an`;
export const kL = (e: E) => milliersL(e.K0, 0);
const centimes = (x: number) => milliersL(x, 2, true);

/** K₀(1 + r/n)^{nt} substitué (exposant calculé). */
export function capitalSubstL(e: E, n: number): string {
  const base = n === 1 ? `(1+${rL(e)})` : `\\left(1+\\dfrac{${rL(e)}}{${n}}\\right)`;
  return `${kL(e)}\\cdot ${base}^{${n * e.t}}`;
}

export function consigneGenerale(e: E): Frag[] {
  const formule: Frag[] = [tx(" Avec "), lx("n"), tx(" capitalisations par an au taux annuel "), lx("r"), tx(", le capital après "), lx("t"), tx(" ans vaut "), lx("K_n=K_0\\left(1+\\dfrac{r}{n}\\right)^{n\\,t}"), tx(".")];
  if (e.variante === "bernoulli")
    return [tx(`En 1683, Jacob Bernoulli se demande ce que devient un capital de ${milliersT(e.K0, 0)} florins placé un an au taux annuel de 100 %, si la banque verse les intérêts de plus en plus souvent.`), ...formule];
  return [tx(`On place ${milliersT(e.K0, 0)} € pendant ${e.t} an${e.t > 1 ? "s" : ""} au taux annuel de ${rPctT(e)}, intérêts composés.`), ...formule];
}

export function libelle(_e: E, phase: PhaseInteretsComposes): string {
  return { capitaux: "Trois capitaux", limite: "Capitalisation continue", taux: "Taux équivalent" }[phase];
}

export const questionCapitaux = (e: E): string =>
  `Calcule le capital final si les intérêts sont versés ${nomFrequence(e.frequences[0])}, ${nomFrequence(e.frequences[1])}, puis ${nomFrequence(e.frequences[2])} (au centime).`;
export const questionLimite = (_e: E): string => "Vers quel capital tend-on quand les intérêts sont versés de plus en plus souvent (n → +∞) ? Donne la valeur exacte, puis au centime.";
export const questionTaux = (_e: E): string => "Avec cette capitalisation continue, quel taux annuel simple (versé une fois par an) donnerait le même capital au bout d'un an ? Exprime-le en %, au centième.";

export function consigne(e: E, phase: PhaseInteretsComposes): Frag[] {
  switch (phase) {
    case "capitaux":
      return [tx(questionCapitaux(e))];
    case "limite":
      return [tx("Vers quel capital tend-on quand les intérêts sont versés de plus en plus souvent ("), lx("{n\\to+\\infty}"), tx(") ? Valeur exacte, ou au centime.")];
    case "taux":
      return [tx(questionTaux(e))];
  }
}

export function champs(e: E, phase: PhaseInteretsComposes): ChampEcran[] {
  const u = monnaie(e);
  switch (phase) {
    case "capitaux":
      return e.frequences.map((n) => ({ label: `K${n}`, labelLatex: `K_{${n}}\\approx`, unite: u, placeholder: "ex. : 1 234,56" }));
    case "limite":
      return [{ label: "limite", labelLatex: "K_{\\infty}=", unite: u, placeholder: "ex. : 700e^0,3 ou 944,90", apercu: true }];
    case "taux":
      return [{ label: "taux", labelLatex: "\\text{taux}\\approx", unite: "%", placeholder: "ex. : 7,25" }];
  }
}

export function aide1(_e: E, phase: PhaseInteretsComposes): AideEcran {
  switch (phase) {
    case "capitaux":
      return { texte: [tx("À chaque versement, le taux appliqué est "), lx("\\dfrac{r}{n}"), tx(" ; en "), lx("t"), tx(" ans, il y a "), lx("n\\cdot t"), tx(" versements (le taux en décimal : 5 % = 0,05) :")], latex: "K_n=K_0\\left(1+\\dfrac{r}{n}\\right)^{n\\,t}" };
    case "limite":
      return { texte: [tx("Définition de e (cours, § 2) : "), lx("{\\lim\\limits_{m\\to+\\infty}\\left(1+\\frac{1}{m}\\right)^{m}=e}"), tx(". Pose "), lx("m=\\dfrac{n}{r}"), tx(", qui tend vers l'infini avec "), lx("n"), tx(" :")], latex: "\\left(1+\\dfrac{r}{n}\\right)^{n\\,t}=\\left[\\left(1+\\dfrac{1}{m}\\right)^{m}\\right]^{r\\,t}" };
    case "taux":
      return { texte: [tx("En capitalisation continue, le capital est multiplié par "), lx("e^{r}"), tx(" en un an ; un taux annuel simple "), lx("i"), tx(" le multiplie par "), lx("1+i"), tx(" :")], latex: "1+i=e^{r}" };
  }
}

export function aide2(e: E, phase: PhaseInteretsComposes): AideEcran {
  switch (phase) {
    case "capitaux":
      return { texte: [tx(`Ici, pour un versement ${nomFrequence(e.frequences[1])} :`)], latex: `K_{${e.frequences[1]}}=${capitalSubstL(e, e.frequences[1])}` };
    case "limite":
      return { texte: [tx("Ici, "), lx(`r=${rL(e)}`), tx(" et "), lx(`t=${e.t}`), tx(" : multiplie le capital initial par "), lx("e^{r\\,t}"), tx(" (touche "), lx("e^{x}"), tx(").")] };
    case "taux":
      return { texte: [tx("Ici, "), lx(`r=${rL(e)}`), tx(" ; calcule "), lx("i"), tx(", puis multiplie par 100 pour l'exprimer en %.")] };
  }
}

export function messageIllisible(_e: E, _phase: PhaseInteretsComposes): string {
  return "Nombre non reconnu : écris par exemple 1 234,56, 700e^0,3 ou 7,25 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

export function limiteExacteL(e: E): string {
  const rt = tauxDecimal(e) * e.t;
  return `${kL(e)}\\,${rt === 1 ? "e" : `e^{${nbL(rt, 3)}}`}`;
}

export function reponse(e: E, phase: PhaseInteretsComposes): Frag[] {
  const u = monnaie(e);
  switch (phase) {
    case "capitaux": {
      const r: Frag[] = [];
      e.frequences.forEach((n, i) => {
        if (i > 0) r.push(tx(" ; "));
        r.push(lx(`K_{${n}}${egalApprox(capital(e, n), 2)}`), tx(` ${u}`));
      });
      return r;
    }
    case "limite":
      return [lx(`K_{\\infty}=${limiteExacteL(e)}\\approx ${centimes(capitalLimite(e))}`), tx(` ${u}`)];
    case "taux":
      return [lx(`i=e^{${rL(e)}}-1\\approx ${nbL(tauxEquivalent(e) / 100, 4, true)}`), tx(", soit "), lx(`${nbL(tauxEquivalent(e), 2, true)}\\,\\%`)];
  }
}

export const recap = reponse;
