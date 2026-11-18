import type { ExerciceImpedances } from "../../core6e/impedancesComplexes";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, lignesDepuisChaine, piege, resultat as resultatBrut, texte, utilise } from "../../../export/corrigeTableau";
import {
  UN_SUR_J_LATEX,
  calculArgumentLatex,
  calculBobineLatex,
  calculCondensateurLatex,
  calculIntensiteLatex,
  calculModuleLatex,
  calculTotaleLatex,
  justificationNature,
  nomReactif,
  reponseFragments,
} from "../../ui6e/formatImpedances";

/**
 * Corrigé détaillé « comme au tableau » de `6gen96` (électricité : impédances complexes) — règle
 * `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Les chaînes de
 * calcul sont celles de l'écran (`ui6e/formatImpedances.ts`), éclatées en une transformation par
 * ligne ; étapes a–e = écrans (composants, impédance totale, module et déphasage, intensité, nature).
 */

const COURS = "(cours, § 9)";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

/** Résultat encadré : la chaîne de l'écran réduite à son premier et à son dernier membre. */
function court(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map((fr) => {
    if (fr.type !== "latex") return fr;
    const lignes = lignesDepuisChaine(fr.valeur);
    if (lignes.length < 2) return fr;
    const premier = lignes[0].latex.slice(0, lignes[0].latex.indexOf("="));
    return { ...fr, valeur: `${premier}${lignes[lignes.length - 1].latex}` };
  });
}

function resultat(sq: string, fragments: FragmentConsigne[]): EtapeCorrection {
  return resultatBrut(sq, court(fragments));
}

function chaine(latexChaine: string, justifs: (string | undefined)[] = []): LigneCalcul[] {
  return lignesDepuisChaine(latexChaine, justifs);
}

export function correctionDetailleeImpedances(e: ExerciceImpedances): EtapeCorrection[] {
  const parallele = e.variante === "parallele";
  const lignesA: LigneCalcul[] = [];
  if (e.xL !== null) lignesA.push(...chaine(calculBobineLatex(e), ["", "on remplace L (en henrys) et ω", "on calcule"]));
  if (e.xC !== null) lignesA.push(...chaine(calculCondensateurLatex(e), ["", "1/j = −j", "on remplace C (en farads) et ω", "on calcule"]));
  const L: EtapeCorrection[] = [
    utilise("a", [
      ...(e.xC === null
        ? [t("Impédance d'une bobine : "), f("Z_L=jL\\omega"), t(", avec L converti en henrys")]
        : [t(e.xL !== null ? "Impédances : " : "Impédance d'un condensateur : "), ...(e.xL !== null ? [f("Z_L=jL\\omega"), t(" et ")] : []), f("Z_C=\\dfrac{1}{jC\\omega}"), t(" (C en farads), avec "), f("j^2=-1"), t(" et "), f(UN_SUR_J_LATEX)]),
      t(` ${COURS}.`),
    ]),
    calcul("a", lignesA),
    resultat("a", reponseFragments(e, "composants")),
    ...(e.xC !== null && !parallele
      ? [piege("a", [t("Le signe de l'impédance du condensateur : "), f("\\dfrac{1}{j}=-j"), t(", donc "), f("Z_C=-\\dfrac{j}{C\\omega}"), t(" a une partie imaginaire négative ; l'écrire positive change la nature du circuit.")])]
      : []),
    parallele
      ? utilise("b", [t("En parallèle, avec "), f("Z_1=R"), t(" et "), f(`Z_2=${nomReactif(e)}`), t(" : "), f("\\dfrac{1}{Z}=\\dfrac{1}{Z_1}+\\dfrac{1}{Z_2}"), t(", c'est-à-dire "), f("Z=\\dfrac{Z_1Z_2}{Z_1+Z_2}"), t(" ; on multiplie ensuite par le conjugué du dénominateur.")])
      : utilise("b", [t("En série, les impédances s'additionnent : parties réelles entre elles, parties imaginaires entre elles.")]),
    calcul("b", chaine(calculTotaleLatex(e), parallele ? ["", "on remplace Z₁ et Z₂", "on multiplie haut et bas par le conjugué", "on calcule", "on simplifie"] : ["", "on remplace", "on regroupe", "on calcule"])),
    resultat("b", reponseFragments(e, "totale")),
    ...(parallele ? [piege("b", [t("Additionner directement les impédances des deux branches : "), f("Z\\neq Z_1+Z_2"), t(" en parallèle, ce sont les inverses qui s'additionnent.")])] : []),
    utilise("c", [t("Pour "), f("Z=a+bj"), t(" avec "), f("a>0"), t(" : "), f("|Z|=\\sqrt{a^2+b^2}"), t(" et "), f("\\varphi=\\arctan\\dfrac{b}{a}"), t(" (calculatrice en degrés).")]),
    calcul("c", [...chaine(calculModuleLatex(e), ["|a + bj| = √(a² + b²)", "on calcule", "on arrondit"]), ...chaine(calculArgumentLatex(e), ["tan φ = b / a", "calculatrice en degrés"])]),
    resultat("c", reponseFragments(e, "polaire")),
    utilise("d", [t("Loi d'Ohm en alternatif, avec le module de l'impédance : "), f("I=\\dfrac{U}{|Z|}"), t(".")]),
    calcul("d", chaine(calculIntensiteLatex(e), ["", "on remplace U et |Z|", "on arrondit"])),
    resultat("d", reponseFragments(e, "intensite")),
    ...(e.xC === null && !parallele ? [piege("d", [t("Diviser la tension par la seule résistance : "), f(`\\dfrac{U}{R}=\\dfrac{${e.U}}{${e.R}}`), t(" ignore la bobine ; c'est le module "), f("|Z|"), t(" qui intervient.")])] : []),
    utilise("e", [t("Le signe du déphasage donne la nature : "), f("\\varphi>0"), t(" circuit inductif, "), f("\\varphi<0"), t(" capacitif, "), f("\\varphi=0"), t(" résistif.")]),
    resultat("e", justificationNature(e)),
  ];
  return L;
}
