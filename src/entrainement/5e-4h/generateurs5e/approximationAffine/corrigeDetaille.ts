import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceApproximationAffine } from "../../core5e/approximationAffine";
import { approximation, erreur, fa, fpa, valeurCalculatrice } from "../../core5e/approximationAffine";
import { decL, parD, sciL } from "../../ui5e/ecrituresApplicationsDerivees";
import { aL, argumentL, calculatriceL, exprFp, fL, nombreL, nomF, relationCalculatrice, reponse, uniteL } from "../../ui5e/formatApproximationAffine";

/**
 * Corrigé détaillé « comme au tableau » de `5gen68`, une lettre par écran : a) le nombre écrit
 * f(a + h) (a remarquable, h avec son signe) ; b) f′(x) par le tableau des dérivées de référence ;
 * c) f(a) et f′(a) substitués ; d) approximation f(a) + f′(a)·h, une opération par ligne ;
 * e) erreur commise = |valeur affichée − approximation|, arrondie à deux chiffres significatifs.
 */

type E = ExerciceApproximationAffine;
const t = texte;
const f = latex;
const estTrigo = (e: E) => e.fn === "sin" || e.fn === "cos" || e.fn === "tan";

function etapeA(e: E): EtapeCorrection[] {
  const L: LigneCalcul[] = [];
  if (e.contexte) {
    L.push(ligne(`a=${aL(e)}`, "longueur de départ (cm)"));
    L.push(ligne(`h=${decL(e.h)}`, e.h > 0 ? "la longueur augmente : h > 0" : "la longueur diminue : h < 0"));
    L.push(ligne(`a+h=${argumentL(e)}`, "nouvelle longueur (cm)"));
  } else if (estTrigo(e)) {
    L.push(ligne(`a=${aL(e)}`, [t("angle remarquable : "), f(`\\${e.fn} ${aL(e)}`), t(" est connu")]));
    L.push(ligne(`h=${decL(e.h)}`, "petit écart (radians)"));
  } else {
    const justifA: (ReturnType<typeof t>)[] = e.fn === "racine" ? [t("carré parfait proche : "), f(`\\sqrt{${e.a}}=${Math.sqrt(e.a)}`)] : [t("entier le plus proche")];
    L.push(ligne(`${argumentL(e)}=${decL(e.a)}${e.h < 0 ? "-" : "+"}${decL(Math.abs(e.h))}`, "on décompose le nombre"));
    L.push(ligne(`a=${decL(e.a)}`, justifA));
    L.push(ligne(`h=${decL(e.h)}`, e.h < 0 ? "écart négatif" : "petit écart"));
  }
  return [
    utilise("a", [t("On écrit le nombre sous la forme "), f(`${nomF(e)}(a+h)`), t(" : a proche, où "), f(`${nomF(e)}(a)`), t(" et "), f(`${nomF(e)}'(a)`), t(" se calculent sans calculatrice, h petit (cours, § 2).")]),
    calcul("a", L),
    resultat("a", reponse(e, "ah")),
    piege("a", e.h < 0 ? [t("Oublier le signe de h : ici le nombre est plus petit que a, donc "), f("h<0"), t(".")] : [t("Prendre pour h le nombre lui-même : h est l'écart entre ce nombre et a.")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const F = nomF(e);
  const L: LigneCalcul[] = [ligne(fL(e))];
  if (e.fn === "puissance") L.push(ligne(`${F}'(x)=${e.n}\\cdot x^{${e.n}-1}`, "(xⁿ)′ = n xⁿ⁻¹"), ligne(`=${exprFp(e)}`));
  else if (e.fn === "racine") L.push(ligne(`${F}'(x)=${exprFp(e)}`, "dérivée de référence de √x"));
  else if (e.fn === "inverse") L.push(ligne(`${F}'(x)=${exprFp(e)}`, "dérivée de référence de 1/x"));
  else L.push(ligne(`${F}'(x)=${exprFp(e)}`, [t("dérivée de référence de "), f(`\\${e.fn} x`), t(" (x en radians)")]));
  return [
    utilise("b", [t("Le tableau des dérivées de référence (cours, § 3).")]),
    calcul("b", L),
    resultat("b", reponse(e, "derivee")),
    piege("b", e.fn === "racine" ? [t("Oublier le 2 : "), f("(\\sqrt{x})'=\\dfrac{1}{2\\sqrt{x}}"), t(".")] : e.fn === "inverse" ? [t("Oublier le signe moins de "), f("-\\dfrac{1}{x^2}"), t(".")] : e.fn === "puissance" ? [t("Garder l'exposant n au lieu de "), f("n-1"), t(".")] : e.fn === "cos" ? [t("Oublier le signe : "), f("(\\cos x)'=-\\sin x"), t(".")] : [t("Ces dérivées ne sont vraies qu'avec x en radians.")]),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const F = nomF(e);
  const a = aL(e);
  const L: LigneCalcul[] = [];
  switch (e.fn) {
    case "racine":
      L.push(ligne(`${F}(${a})=\\sqrt{${a}}=${decL(fa(e))}`));
      L.push(ligne(`${F}'(${a})=\\dfrac{1}{2\\sqrt{${a}}}`, "on remplace x par a"));
      L.push(ligne(`=\\dfrac{1}{${2 * Math.sqrt(e.a)}}`));
      L.push(ligne(`=${decL(fpa(e))}`));
      break;
    case "puissance":
      L.push(ligne(`${F}(${a})=${a}^{${e.n}}=${decL(fa(e))}`));
      L.push(ligne(`${F}'(${a})=${e.n === 2 ? `2\\cdot ${a}` : `${e.n}\\cdot ${a}^{${e.n - 1}}`}`, "on remplace x par a"));
      L.push(ligne(`=${decL(fpa(e))}`));
      break;
    case "inverse":
      L.push(ligne(`${F}(${a})=\\dfrac{1}{${a}}=${decL(fa(e))}`));
      L.push(ligne(`${F}'(${a})=-\\dfrac{1}{${a}^2}`, "on remplace x par a"));
      L.push(ligne(`=-\\dfrac{1}{${e.a * e.a}}`));
      if (e.a !== 1) L.push(ligne(`=${decL(fpa(e))}`));
      break;
    case "sin":
      L.push(ligne(`${F}(${a})=\\sin ${a}=0`));
      L.push(ligne(`${F}'(${a})=\\cos ${a}=${decL(fpa(e))}`, "on remplace x par a"));
      break;
    case "cos":
      L.push(ligne(`${F}(${a})=\\cos ${a}=0`));
      L.push(ligne(`${F}'(${a})=-\\sin ${a}=${decL(fpa(e))}`, "on remplace x par a"));
      break;
    case "tan":
      L.push(ligne(`${F}(${a})=\\tan ${a}=0`));
      L.push(ligne(`${F}'(${a})=\\dfrac{1}{\\cos^2 ${a}}=\\dfrac{1}{1}=1`, "on remplace x par a"));
      break;
  }
  return [
    utilise("c", [t("On remplace x par a dans f(x), puis dans f′(x) : "), f(`${F}'(a)`), t(" est la pente de la tangente au point d'abscisse a.")]),
    calcul("c", L),
    resultat("c", reponse(e, "valeurs")),
  ];
}

function etapeD(e: E): EtapeCorrection[] {
  const F = nomF(e);
  const A = fa(e);
  const B = fpa(e);
  const prod = B * e.h;
  const L: LigneCalcul[] = [
    ligne(`${nombreL(e)}\\approx ${F}(${aL(e)})+${F}'(${aL(e)})\\cdot h`, "tangente en a"),
    ligne(`=${decL(A)}+${parD(B)}\\cdot ${parD(e.h)}`, "on remplace"),
  ];
  if (!(A === 0 && Math.abs(B) === 1)) L.push(ligne(`=${decL(A)}${prod < 0 ? "-" : "+"}${decL(Math.abs(prod))}`, "produit d'abord"));
  L.push(ligne(`=${decL(approximation(e))}${uniteL(e)}`));
  return [
    utilise("d", [t("Près de a, la courbe se confond avec sa tangente : "), f(`${F}(a+h)\\approx ${F}(a)+${F}'(a)\\cdot h`), t(" (cours, § 2).")]),
    calcul("d", L),
    resultat("d", reponse(e, "approx")),
    piege("d", [t("Remplacer h sans son signe, ou oublier d'ajouter "), f(`${F}(a)`), t(" : "), f(`${F}'(a)\\cdot h`), t(" n'est que la variation.")]),
  ];
}

function etapeE(e: E): EtapeCorrection[] {
  const calc = valeurCalculatrice(e).valeur;
  const ap = approximation(e);
  const diff = calc - ap;
  const err = erreur(e);
  const L: LigneCalcul[] = [
    ligne(`\\text{erreur}=\\left|${calculatriceL(e)}-${parD(ap)}\\right|`, valeurCalculatrice(e).exacte ? "valeur exacte − approximation" : "valeur affichée − approximation"),
    ligne(`=\\left|${decL(diff, 9)}\\right|`),
    ligne(`=${decL(err, 9)}`),
    ligne(`\\approx ${sciL(err)}${uniteL(e)}`, "deux chiffres significatifs"),
  ];
  return [
    utilise("e", [t("L'erreur commise est l'écart entre la valeur exacte et l'approximation, pris positivement.")]),
    calcul("e", L, [t("La calculatrice affiche "), f(`${nombreL(e)}${relationCalculatrice(e)}${calculatriceL(e)}`), t(".")]),
    resultat("e", reponse(e, "erreur")),
    verification("e", [t("L'erreur est bien plus petite que "), f(`|h|=${decL(Math.abs(e.h))}`), t(diff < 0 ? " : la tangente passe au-dessus de la courbe près de a (approximation par excès)." : " : la tangente passe sous la courbe près de a (approximation par défaut).")]),
    piege("e", [t("Compter les zéros de travers : arrondir à deux chiffres significatifs, c'est garder les deux premiers chiffres NON NULS.")]),
  ];
}

export function correctionDetailleeApproximationAffine(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e), ...etapeD(e), ...etapeE(e)];
}
