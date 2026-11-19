import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { analyser, equationBrute, equationSimplifiee, evaluerPoly, raisonEn, termesEn } from "../../core5e/troisTermes.types";
import type { ExerciceTroisTermes, Poly } from "../../core5e/troisTermes.types";
import { phasesJouees } from "../../moteur5e/typesTroisTermes";
import { conclusionSolutions, equationBruteLatex, equationSimplifieeLatex, fractionLatex, jeton, membresDeveloppesLatex, nb, polyLatex, polySubstitueLatex, relationSubstitueeLatex, reponseBreveFragments } from "../../ui5e/formatTroisTermes";
import { COURS_ARITHMETIQUES, COURS_GEOMETRIQUES, sansRepetition } from "../../ui5e/corrigeSuites2";

/**
 * Corrigé détaillé « comme au tableau » de `5gen46` (trois termes consécutifs) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran joué (lettres a, b, c, d) :
 * a) la relation (deux raisons égales, puis 2b = a + c ou b² = a·c), b) l'équation réduite
 * (substitution, développement, tout à gauche, simplification), c) la résolution (premier degré
 * ligne à ligne, ou discriminant et formule) et le contrôle de chaque solution (aucun terme nul
 * pour une suite géométrique), d) les trois termes et la raison pour chaque valeur, vérifiés par
 * la seconde raison. Écritures produites par les fonctions de l'écran (`formatTroisTermes.ts`).
 */

const t = texte;
const f = latex;
type E = ExerciceTroisTermes;

/** Valeur d'un terme pour x, une opération par ligne : « a = 3 × 4 + 1 », « = 13 ». */
function lignesTerme(nom: string, p: Poly, x: number): LigneCalcul[] {
  const valeur = evaluerPoly(p, x) + 0;
  const nonNuls = p.filter((k) => k !== 0).length;
  if (x === 0 || (nonNuls <= 1 && p[1] === 0 && p[2] === 0)) return [ligne(`${nom}=${nb(valeur)}`, x === 0 ? "pour x = 0, le terme constant" : undefined)];
  return sansRepetition([ligne(`${nom}=${polySubstitueLatex(p, x)}`, `on remplace x par ${nb(x).replace("-", "−")}`), ligne(`=${nb(valeur)}`)]);
}

function etapeRelation(e: E): EtapeCorrection[] {
  const arith = e.variante === "arithmetique";
  return [
    utilise(
      "a",
      arith
        ? [t("Dans une suite arithmétique, la raison est la différence entre un terme et le précédent ; avec trois termes consécutifs a, b, c, on l'écrit de deux façons : "), f("r=b-a=c-b"), t(` ${COURS_ARITHMETIQUES}.`)]
        : [t("Dans une suite géométrique, la raison est le quotient d'un terme par le précédent ; avec trois termes consécutifs a, b, c (non nuls), on l'écrit de deux façons : "), f("q=\\dfrac{b}{a}=\\dfrac{c}{b}"), t(` ${COURS_GEOMETRIQUES}.`)],
    ),
    calcul(
      "a",
      arith
        ? [ligne("b-a=c-b", "deux écritures de la même raison"), ligne("2b=a+c", "on ajoute b et a aux deux membres")]
        : [ligne("\\dfrac{b}{a}=\\dfrac{c}{b}", "deux écritures de la même raison"), ligne("b^2=a\\times c", "produit en croix")],
    ),
    resultat("a", [t("Relation entre trois termes consécutifs : "), f(arith ? "2b=a+c" : "b^2=a\\times c"), t(arith ? " (b est la moyenne de a et c)." : ".")]),
    piege(
      "a",
      arith
        ? [t("Le terme du milieu n'est pas la somme de ses voisins mais leur MOYENNE : "), f("b=\\dfrac{a+c}{2}"), t(", d'où "), f("2b=a+c"), t(" (et non "), f("b=a+c"), t(").")]
        : [t("Le terme du milieu vérifie "), f("b^2=a\\times c"), t(" : pas "), f("b=a\\times c"), t(", et mieux vaut éviter "), f("b=\\sqrt{a\\times c}"), t(", fausse quand "), f("b"), t(" est négatif.")],
    ),
  ];
}

function etapeEquation(e: E): EtapeCorrection[] {
  const arith = e.variante === "arithmetique";
  const brute = equationBrute(e);
  const simple = equationSimplifiee(e);
  const contradiction = simple[1] === 0 && simple[2] === 0;
  const lignes: LigneCalcul[] = [
    ligne(relationSubstitueeLatex(e), "on remplace a, b et c par leurs expressions"),
    ligne(membresDeveloppesLatex(e), arith ? "on distribue le 2 et on réduit chaque membre" : [t("on développe : carré d'une somme, "), f("(A+B)^2=A^2+2AB+B^2"), t(", et double distributivité")]),
    ligne(equationBruteLatex(e), contradiction ? "on ramène tout dans le membre de gauche : les termes en x s'éliminent — égalité impossible" : "on ramène tous les termes dans le membre de gauche et on réduit"),
  ];
  const i0 = brute.findIndex((c) => c !== 0);
  const k = i0 >= 0 && simple[i0] !== 0 ? brute[i0] / simple[i0] : 1;
  if (!contradiction && k !== 1) lignes.push(ligne(equationSimplifieeLatex(e), k < 0 ? `on divise les deux membres par ${nb(k).replace("-", "−")} (coefficient dominant positif)` : `on divise les deux membres par ${nb(k)}`));
  return [
    utilise("b", [t("On remplace a, b et c par leurs expressions dans la relation, on développe chaque membre, puis on ramène tous les termes dans le membre de gauche ; on peut diviser l'équation par un nombre non nul.")]),
    calcul("b", sansRepetition(lignes)),
    resultat("b", contradiction ? [t("Les termes en x s'éliminent : l'équation réduite est l'égalité impossible "), f(equationBruteLatex(e)), t(".")] : [t("Équation réduite : "), f(equationSimplifieeLatex(e))]),
  ];
}

function lignesResolution(e: E): LigneCalcul[] {
  const s = equationSimplifiee(e);
  const [c0, c1, c2] = s;
  const res = analyser(e).resolution;
  switch (res.type) {
    case "contradiction":
      return [ligne(`${polyLatex(equationBrute(e))}=0`, "égalité impossible, quelle que soit la valeur de x : aucune solution")];
    case "premier-degre": {
      const x = res.racines[0];
      const lignes: LigneCalcul[] = [ligne(`${polyLatex(s)}=0`, "équation réduite, du premier degré")];
      if (c0 !== 0) lignes.push(ligne(`${c1 === 1 ? "" : c1 === -1 ? "-" : nb(c1)}x=${nb(-c0)}`, c0 > 0 ? `on retire ${c0} des deux membres` : `on ajoute ${-c0} aux deux membres`));
      if (c1 !== 1) lignes.push(ligne(`x=\\dfrac{${nb(-c0)}}{${nb(c1)}}`, `on divise par ${nb(c1).replace("-", "−")}`), ligne(`=${nb(x)}`));
      return sansRepetition(lignes);
    }
    default: {
      const delta = res.delta ?? 0;
      const lignes: LigneCalcul[] = [
        ligne(`\\Delta=${jeton(c1)}^2-4\\times ${jeton(c2)}\\times ${jeton(c0)}`, "carré du coefficient de x, moins 4 × coefficient de x² × terme constant"),
        ligne(`=${nb(c1 * c1)}${-4 * c2 * c0 >= 0 ? "+" : "-"}${nb(Math.abs(4 * c2 * c0))}`, "on calcule le carré et le produit"),
        ligne(`=${nb(delta)}`),
      ];
      if (res.type === "delta-negatif") {
        lignes.push(ligne(`\\Delta=${nb(delta)}<0`, "discriminant négatif : aucune solution réelle"));
        return lignes;
      }
      if (res.type === "delta-nul") {
        lignes.push(ligne(`x=\\dfrac{${nb(-c1)}}{${nb(2 * c2)}}`, "discriminant nul : une seule solution, l'opposé du coefficient de x divisé par le double du coefficient de x²"), ligne(`=${nb(res.racines[0])}`));
        return sansRepetition(lignes);
      }
      const r = Math.round(Math.sqrt(delta));
      const [x1, x2] = res.racines;
      lignes.push(
        ligne(`x_1=\\dfrac{${nb(-c1)}-\\sqrt{${nb(delta)}}}{${nb(2 * c2)}}`, "discriminant positif : deux solutions, formule du second degré"),
        ligne(`=\\dfrac{${nb(-c1)}-${r}}{${nb(2 * c2)}}`, [f(`\\sqrt{${nb(delta)}}=${r}`)]),
        ligne(`=${nb(x1)}`),
        ligne(`x_2=\\dfrac{${nb(-c1)}+\\sqrt{${nb(delta)}}}{${nb(2 * c2)}}`),
        ligne(`=\\dfrac{${nb(-c1)}+${r}}{${nb(2 * c2)}}`),
        ligne(`=${nb(x2)}`),
      );
      return sansRepetition(lignes);
    }
  }
}

function etapeSolutions(e: E): EtapeCorrection[] {
  const an = analyser(e);
  const res = an.resolution;
  const arith = e.variante === "arithmetique";
  const blocs: EtapeCorrection[] = [calcul("c", lignesResolution(e))];
  if (!arith) {
    for (const x of res.racines) {
      const [va, vb, vc] = termesEn(e, x);
      const lignes = [...lignesTerme("a", e.termes[0], x), ...lignesTerme("b", e.termes[1], x), ...lignesTerme("c", e.termes[2], x)];
      const nul = [va, vb, vc].some((v) => v === 0);
      const der = lignes[lignes.length - 1];
      lignes[lignes.length - 1] = { ...der, justification: nul ? "un terme est nul : cette valeur est écartée" : "aucun terme n'est nul : cette valeur convient" };
      blocs.push(calcul("c", lignes, [t("Contrôle de "), f(`x=${nb(x)}`), t(" :")]));
    }
  }
  const methode: FragmentConsigne[] =
    res.type === "contradiction"
      ? [t("Les termes en x se sont éliminés : l'équation réduite est une égalité entre deux nombres, vraie pour tout x ou pour aucun.")]
      : res.type === "premier-degre"
        ? [t("Équation du premier degré : on isole x.")]
        : [t("Équation du second degré "), f(`\\alpha x^2+\\beta x+\\gamma=0`), t(" : on calcule le discriminant "), f("\\Delta=\\beta^2-4\\alpha\\gamma"), t(" ; s'il est positif ou nul, les solutions sont "), f("x=\\dfrac{-\\beta\\pm\\sqrt{\\Delta}}{2\\alpha}"), t(" (on note α, β, γ les coefficients pour ne pas les confondre avec les termes a, b, c).")];
  const controle: FragmentConsigne[] = arith
    ? [t(" Une suite arithmétique peut contenir n'importe quels nombres : toute solution convient.")]
    : [t(" Puis on contrôle chaque solution : une suite géométrique ne contient aucun terme nul (la raison n'est jamais nulle, et on ne passe pas de 0 à un nombre non nul en multipliant).")];
  const etapes: EtapeCorrection[] = [utilise("c", [...methode, ...(res.racines.length ? controle : [])]), ...blocs, resultat("c", conclusionSolutions(e))];
  if (an.ecartees.length > 0) {
    etapes.push(piege("c", [t("Une solution de l'équation n'est pas forcément une réponse : si elle annule un terme, on l'écarte, car une suite géométrique ne contient aucun terme nul (et "), f("b^2=a\\times c"), t(" est alors vraie sans que les nombres forment une suite géométrique).")]));
  }
  return etapes;
}

function etapeTermes(e: E): EtapeCorrection[] {
  const arith = e.variante === "arithmetique";
  const an = analyser(e);
  const blocs: EtapeCorrection[] = [];
  const verifs: LigneCalcul[] = [];
  for (const x of an.valables) {
    const [va, vb, vc] = termesEn(e, x);
    const raison = raisonEn(e, x);
    const lignes = [...lignesTerme("a", e.termes[0], x), ...lignesTerme("b", e.termes[1], x), ...lignesTerme("c", e.termes[2], x)];
    if (arith) lignes.push(ligne(`r=b-a`, "raison"), ligne(`=${nb(vb)}-${jeton(va)}`), ligne(`=${fractionLatex(raison)}`));
    else {
      const brut = `\\dfrac{${nb(vb)}}{${nb(va)}}`;
      lignes.push(ligne("q=\\dfrac{b}{a}", "raison"), ligne(`=${brut}`));
      if (brut !== fractionLatex(raison)) lignes.push(ligne(`=${fractionLatex(raison)}`, "on simplifie"));
    }
    blocs.push(calcul("d", sansRepetition(lignes), an.valables.length > 1 ? [t("Pour "), f(`x=${nb(x)}`), t(" :")] : []));
    if (arith) verifs.push(...sansRepetition([ligne(`c-b=${nb(vc)}-${jeton(vb)}`, an.valables.length > 1 ? `pour x = ${nb(x).replace("-", "−")}` : undefined), ligne(`=${fractionLatex(raison)}`, "même raison ✓")]));
    else verifs.push(ligne(`b\\times q=${jeton(vb)}\\times ${raison.den === 1 ? jeton(raison.num) : `\\left(${fractionLatex(raison)}\\right)`}`, an.valables.length > 1 ? `pour x = ${nb(x).replace("-", "−")}` : undefined), ligne(`=${nb(vc)}`, "on retrouve c ✓"));
  }
  return [
    utilise("d", arith ? [t("On remplace x par la valeur trouvée dans chaque expression, puis on calcule la raison "), f("r=b-a"), t(` ${COURS_ARITHMETIQUES}.`)] : [t("Pour chaque valeur qui convient, on remplace x dans les trois expressions, puis on calcule la raison "), f("q=\\dfrac{b}{a}"), t(` ${COURS_GEOMETRIQUES}.`)]),
    ...blocs,
    resultat("d", reponseBreveFragments(e)),
    verification("d", [t(arith ? "La seconde différence donne la même raison :" : "En multipliant b par q, on doit retrouver c :")], verifs),
  ];
}

export function correctionDetailleeTroisTermes(e: E): EtapeCorrection[] {
  const phases = phasesJouees(e);
  return [...etapeRelation(e), ...etapeEquation(e), ...etapeSolutions(e), ...(phases.includes("termes") ? etapeTermes(e) : [])];
}
