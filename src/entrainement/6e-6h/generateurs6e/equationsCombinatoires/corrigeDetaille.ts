import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice101 } from "../../core6e/equationsCombinatoires";
import { coefficients, equationReduite, nMin, phases101, racines101, solutionSymetrie } from "../../core6e/equationsCombinatoires";
import { AL, CL, comb, mil } from "../../ui6e/nombresCombinatoireLotH";
import { equationSecondDegre, membreGauche, nPlus, polynomeFactorise, polynomeLatex, reponse101 } from "../../ui6e/formatEquationsCombinatoires";

/**
 * Corrigé détaillé « comme au tableau » de `6gen101`, une lettre par écran : factorielles écrites
 * jusqu'au plus petit facteur puis simplifiées, polynôme ; équation ramenée à n² + bn + c = 0
 * (× 2 s'il y a un dénominateur), discriminant, racines ; tri par la condition (n naturel, membre
 * défini) et vérification par substitution. Symétrie : indices complémentaires, somme = haut.
 */

type E = Exercice101;
const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
const t = tx;
const l = lx;
const par = (s: number) => (s === 0 ? "n" : `(${nPlus(s)})`);
const fac = (s: number) => (s === 0 ? "n!" : `(${nPlus(s)})!`);

function lignesPolynome(e: E): LigneCalcul[] {
  switch (e.variante) {
    case "quotient":
      return [
        ligne(`${membreGauche(e)}=\\dfrac{${par(e.s)}\\times ${par(e.s - 1)}\\times ${fac(e.s - 2)}}{${fac(e.s - 2)}}`, "factorielle écrite jusqu'au dénominateur"),
        ligne(`=${polynomeFactorise(e)}`, `on simplifie par ${e.s - 2 === 0 ? "n!" : `(${nPlus(e.s - 2)})!`}`),
        ligne(`=${polynomeLatex(e)}`, "on développe"),
      ];
    case "arrangement":
      return [ligne(`${AL("n", 2)}=\\dfrac{n!}{(n-2)!}`, "définition"), ligne(`=\\dfrac{n(n-1)\\times(n-2)!}{(n-2)!}`), ligne("=n(n-1)", "on simplifie par (n − 2)!"), ligne(`=${polynomeLatex(e)}`)];
    case "combinaison":
      return [ligne(`${CL("n", 2)}=\\dfrac{n!}{2!\\times(n-2)!}`, "définition"), ligne(`=\\dfrac{n(n-1)\\times(n-2)!}{2\\times(n-2)!}`), ligne("=\\dfrac{n(n-1)}{2}", "on simplifie par (n − 2)!"), ligne(`=${polynomeLatex(e)}`)];
    case "mixte":
      return [ligne(`${CL("n", 2)}+n=\\dfrac{n(n-1)}{2}+n`, "définition de la combinaison"), ligne("=\\dfrac{n^2-n+2n}{2}", "même dénominateur"), ligne(`=${polynomeLatex(e)}`)];
    case "symetrie":
      return [];
  }
}

function lignesRacines(e: E): LigneCalcul[] {
  const { alpha } = coefficients(e);
  const { b, c } = equationReduite(e);
  const D = b * b - 4 * c;
  const d = Math.sqrt(D);
  const [r1, r2] = racines101(e);
  const lignes: LigneCalcul[] = [ligne(`${polynomeLatex(e)}=${mil(e.V)}`)];
  if (alpha === 0.5) lignes.push(ligne(`${polynomeLatex(e).replace("\\dfrac{", "").replace("}{2}", "")}=${mil(2 * e.V)}`, "on multiplie par 2"));
  lignes.push(ligne(equationSecondDegre(e), "tout dans le membre de gauche"));
  lignes.push(ligne(`\\Delta=${b < 0 ? `(${b})` : b}^2-4\\times 1\\times ${c < 0 ? `(${mil(c)})` : mil(c)}=${mil(D)}`));
  lignes.push(ligne(`\\sqrt{\\Delta}=${mil(d)}`));
  lignes.push(ligne(`n_1=\\dfrac{${-b}-${mil(d)}}{2}=${mil(r1)}`));
  lignes.push(ligne(`n_2=\\dfrac{${-b}+${mil(d)}}{2}=${mil(r2)}`));
  return lignes;
}

function substitution(e: E): string {
  const m = e.sol;
  switch (e.variante) {
    case "quotient":
      return `\\dfrac{${m + e.s}!}{${m + e.s - 2}!}=${m + e.s}\\times ${m + e.s - 1}=${mil(e.V)}`;
    case "arrangement":
      return `${AL(m, 2)}=${m}\\times ${m - 1}=${mil(e.V)}`;
    case "combinaison":
      return `${CL(m, 2)}=\\dfrac{${m}\\times ${m - 1}}{2}=${mil(e.V)}`;
    case "mixte":
      return `${CL(m, 2)}+${m}=${mil(comb(m, 2))}+${m}=${mil(e.V)}`;
    case "symetrie":
      return "";
  }
}

export function correctionDetaillee101(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  phases101(e).forEach((ph, i) => {
    const sq = lettreEtape(i);
    switch (ph) {
      case "polynome":
        out.push(
          utilise(sq, fr(e.variante === "quotient" ? [t("Factorielle (cours, point 1) : "), l("(m+1)!=(m+1)\\times m!"), t(" ; on descend jusqu'à la factorielle du dénominateur.")] : [t("Définitions (cours, point 1) : "), l(`${AL("n", "k")}=\\dfrac{n!}{(n-k)!}`), t(", "), l(`${CL("n", "k")}=\\dfrac{${AL("n", "k")}}{k!}`), t(".")])),
          calcul(sq, lignesPolynome(e)),
          resultat(sq, fr(reponse101(e, ph))),
        );
        break;
      case "racines":
        out.push(utilise(sq, fr([t("Équation du second degré : tout dans un membre, discriminant "), l("\\Delta=b^2-4ac"), t(", solutions "), l("\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), t(".")])), calcul(sq, lignesRacines(e)), resultat(sq, fr(reponse101(e, ph))));
        break;
      case "admissible": {
        const [r1, r2] = racines101(e);
        out.push(
          utilise(sq, fr([t("Condition : "), l("n"), t(" est un nombre naturel et le membre de gauche est défini, donc "), l(`n\\ge ${nMin(e)}`), t(".")])),
          calcul(sq, [ligne(`n_1=${mil(r1)}<0`, "rejetée : négative"), ligne(`n_2=${mil(r2)}\\ge ${nMin(e)}`, "convient")]),
          resultat(sq, fr(reponse101(e, ph))),
          verification(sq, fr([l(substitution(e))]), undefined),
          piege(sq, fr([t("Garder aussi "), l(`n=${mil(r1)}`), t(" : une factorielle ou un coefficient d'indice négatif n'existe pas.")])),
        );
        break;
      }
      case "propriete":
        out.push(
          utilise(sq, fr([t("Symétrie (cours, point 1) : "), l(`${CL("n", "k")}=${CL("n", "n-k")}`), t(" ; deux indices différents donnent le même coefficient seulement s'ils sont complémentaires.")])),
          calcul(
            sq,
            e.inconnue === "n"
              ? [ligne(`${e.p}\\neq ${e.q}`, "indices différents"), ligne(`${e.q}=n-${e.p}`, "complémentaires"), ligne(`n=${e.p}+${e.q}`)]
              : [ligne(`k\\neq k+${e.q}`, "indices différents"), ligne(`k+${e.q}=${e.p}-k`, "complémentaires"), ligne(`k+(k+${e.q})=${e.p}`)],
          ),
          resultat(sq, fr(reponse101(e, ph))),
        );
        break;
      case "valeur": {
        const v = solutionSymetrie(e);
        out.push(
          utilise(sq, fr([t("On résout la relation de l'étape précédente.")])),
          calcul(sq, e.inconnue === "n" ? [ligne(`n=${e.p}+${e.q}=${v}`)] : [ligne(`2k+${e.q}=${e.p}`), ligne(`2k=${e.p - e.q}`), ligne(`k=${v}`)]),
          resultat(sq, fr(reponse101(e, ph))),
          verification(
            sq,
            fr(
              e.inconnue === "n"
                ? [l(`${CL(v, e.p)}=${CL(v, e.q)}=${mil(comb(v, e.p))}`), t(" et "), l(`${v}\\ge ${e.q}`), t(" : les deux coefficients sont définis.")]
                : [l(`${CL(e.p, v)}=${CL(e.p, v + e.q)}=${mil(comb(e.p, v))}`), t(", car "), l(`${v}+${v + e.q}=${e.p}`), t(".")],
            ),
          ),
          piege(sq, fr([t("Conclure « aucune solution » parce que les deux indices sont différents : la symétrie donne justement des indices différents.")])),
        );
        break;
      }
    }
  });
  return out;
}
