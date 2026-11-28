import type { ExerciceAffixesRacines } from "../../core6e/affixesRacines.types";
import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { cd, cz, lignesCarre, nb, pn, pnb } from "../../ui6e/corrigeComplexes";
import { COUL, planComplexeSvg } from "./figurePlanAffixes";

/**
 * Corrigé détaillé « comme au tableau » de `6gen35` (affixes et racines carrées) — règle
 * `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Une étape par
 * écran (`phasesPourExercice`), valeurs calculées depuis l'instance ; partagé par l'adaptateur
 * papier et l'écran (étape échouée).
 */

type Exo<F extends ExerciceAffixesRacines["famille"]> = Extract<ExerciceAffixesRacines, { famille: F }>;

const COURS = "(cours, point 2)";

function correctionA(e: Exo<"A">): EtapeCorrection[] {
  const z = cz(e.a, e.b);
  const zb = cz(e.a, -e.b);
  return [
    utilise("a", [texte(`Le conjugué de `), latex("z=a+bi"), texte(" est "), latex("\\bar z=a-bi"), texte(` : même partie réelle, partie imaginaire de signe changé ${COURS}. Ici `), latex(`\\bar z=${zb}`), texte(".")]),
    calcul("a", [
      ligne(`z+\\bar z=(${z})+(${zb})`),
      ligne(`=(${e.a}+${pn(e.a)})+(${e.b}+${pn(-e.b)})\\,i`, "on regroupe parties réelles et parties imaginaires"),
      ligne(`=${cz(e.somme.re, e.somme.im)}`),
      ligne(`z-\\bar z=(${z})-(${zb})`),
      ligne(`=(${e.a}-${pn(e.a)})+(${e.b}-${pn(-e.b)})\\,i`, "on regroupe : le « − » porte sur les deux parties"),
      ligne(`=${cz(e.difference.re, e.difference.im)}`),
    ]),
    resultat("a", [latex(`z+\\bar z=${cz(e.somme.re, e.somme.im)}`), texte(" et "), latex(`z-\\bar z=${cz(e.difference.re, e.difference.im)}`)]),
    verification("a", [latex("z+\\bar z"), texte(" est bien un réel (deux fois la partie réelle) et "), latex("z-\\bar z"), texte(" un imaginaire pur (deux fois la partie imaginaire, fois "), latex("i"), texte(").")]),
    piege("a", [latex(`z-\\bar z=${cz(e.difference.re, e.difference.im)}`), texte(" garde son "), latex("i"), texte(" : écrire "), latex(`${2 * e.b}`), texte(" (sans "), latex("i"), texte(") est faux.")]),
  ];
}

function correctionB(e: Exo<"B">): EtapeCorrection[] {
  const zA = { re: e.reA2 / 2, im: e.imA2 / 2 };
  const zB = { re: e.reB2 / 2, im: e.imB2 / 2 };
  const zC = { re: e.reC2 / 2, im: e.imC2 / 2 };
  const zD = { re: e.reD2 / 2, im: e.imD2 / 2 };
  const A = cd(zA.re, zA.im);
  const B = cd(zB.re, zB.im);
  const C = cd(zC.re, zC.im);
  const D = cd(zD.re, zD.im);
  const M = cd((zA.re + zC.re) / 2, (zA.im + zC.im) / 2);
  const figure = planComplexeSvg({
    points: [
      { v: zA, nom: "A" },
      { v: zB, nom: "B" },
      { v: zC, nom: "C" },
      { v: zD, nom: "D", couleur: COUL.accent },
    ],
    polygone: [zA, zB, zC, zD],
    segments: [
      { de: zA, a: zC, pointilles: true, couleur: COUL.doux },
      { de: zB, a: zD, pointilles: true, couleur: COUL.doux },
    ],
    libelle: "Parallélogramme ABCD dans le plan complexe, diagonales en pointillés",
  });
  return [
    utilise("a", [texte(`Dans un parallélogramme ABCD, les diagonales [AC] et [BD] ont le même milieu ${COURS} ; l'affixe du milieu de [PQ] est `), latex("\\dfrac{z_P+z_Q}{2}"), texte(".")]),
    calcul("a", [
      ligne("\\dfrac{z_A+z_C}{2}=\\dfrac{z_B+z_D}{2}", "même milieu pour les deux diagonales"),
      ligne("z_A+z_C=z_B+z_D", "on multiplie les deux membres par 2"),
      ligne("z_D=z_A-z_B+z_C", [texte("on isole "), latex("z_D")]),
    ]),
    resultat("a", [latex("z_D=z_A-z_B+z_C")]),
    piege("a", [texte("L'ordre des sommets compte : D est opposé à B, d'où "), latex("z_D=z_A+z_C-z_B"), texte(". Le calcul "), latex("z_A+z_B-z_C"), texte(" donne un autre parallélogramme (ACBD).")]),
    utilise("b", [texte("On remplace les affixes dans la relation de l'étape 1, puis on regroupe parties réelles et parties imaginaires.")]),
    calcul("b", [
      ligne(`z_D=(${A})-(${B})+(${C})`, "relation de l'étape 1"),
      ligne(`=(${nb(zA.re)}-${pnb(zB.re)}+${pnb(zC.re)})+(${nb(zA.im)}-${pnb(zB.im)}+${pnb(zC.im)})\\,i`, "on regroupe parties réelles et parties imaginaires"),
      ligne(`=${D}`),
    ]),
    { ...resultat("b", [latex(`z_D=${D}`)]), figureHtml: figure },
    verification("b", [texte("Les deux diagonales ont bien le même milieu :")], [
      ligne(`\\dfrac{z_A+z_C}{2}=\\dfrac{${cd(zA.re + zC.re, zA.im + zC.im)}}{2}=${M}`),
      ligne(`\\dfrac{z_B+z_D}{2}=\\dfrac{${cd(zB.re + zD.re, zB.im + zD.im)}}{2}=${M}`, "même milieu ✓"),
    ]),
  ];
}

function correctionC(e: Exo<"C">): EtapeCorrection[] {
  const xP = e.xPositif;
  const y = e.yDeduit;
  const w = cz(e.a, e.b);
  const z1 = cz(xP, y);
  const z2 = cz(-xP, -y);
  const systeme = `\\begin{cases}x^2-y^2=${e.a}\\\\ 2xy=${e.b}\\\\ x^2+y^2=${e.module}\\end{cases}`;
  return [
    utilise("a", [
      texte("On cherche "),
      latex("z=x+yi"),
      texte(" tel que "),
      latex(`z^2=${w}`),
      texte(` ${COURS}. Deux complexes égaux ont la même partie réelle, la même partie imaginaire et le même module ; et le module d'un carré est le carré du module : `),
      latex("|z|^2=|z^2|"),
      texte("."),
    ]),
    calcul("a", [
      ligne("(x+yi)^2=x^2+2xyi+y^2i^2", "(x + y)² = x² + 2xy + y²"),
      ligne("=(x^2-y^2)+2xy\\,i", "car i² = −1"),
      ligne(`|z|^2=|${w}|=\\sqrt{${pn(e.a)}^2+${pn(e.b)}^2}`, "|a + bi| = √(a² + b²)"),
      ligne(`=\\sqrt{${e.a * e.a + e.b * e.b}}`),
      ligne(`=${e.module}`),
    ]),
    resultat("a", [texte("On identifie : "), latex(systeme)]),
    utilise("b", [texte("On additionne la 1ʳᵉ et la 3ᵉ équation du système : "), latex("y^2"), texte(" disparaît.")]),
    calcul("b", [
      ligne(`(x^2-y^2)+(x^2+y^2)=${e.a}+${e.module}`, "1ʳᵉ + 3ᵉ équation"),
      ligne(`2x^2=${e.a + e.module}`),
      ligne(`x^2=${(e.a + e.module) / 2}`, "on divise par 2"),
    ]),
    resultat("b", [latex(`x=${xP}`), texte(" ou "), latex(`x=${-xP}`)]),
    piege("b", [texte("Une équation "), latex(`x^2=${xP * xP}`), texte(" a deux solutions opposées : ne pas oublier "), latex(`x=${-xP}`), texte(".")]),
    utilise("c", [texte("La 2ᵉ équation "), latex(`2xy=${e.b}`), texte(" donne "), latex(`y=\\dfrac{${e.b}}{2x}`), texte(" : le signe de "), latex("y"), texte(" est imposé par celui de "), latex("x"), texte(".")]),
    calcul("c", [
      ligne(`y=\\dfrac{${e.b}}{2\\cdot ${xP}}=${y}`, `pour x = ${xP}`),
      ligne(`y=\\dfrac{${e.b}}{2\\cdot(${-xP})}=${-y}`, `pour x = ${String(-xP).replace("-", "−")}`),
    ]),
    resultat("c", [latex(`z_1=${z1}`), texte(" et "), latex(`z_2=${z2}`), texte(" (opposées l'une de l'autre)")]),
    verification("c", [texte("On élève "), latex("z_1"), texte(" au carré : on doit retrouver "), latex(w), texte(".")], lignesCarre(xP, y)),
    piege("c", [texte("Le signe de y n'est pas libre : "), latex("2xy=b"), texte(" l'impose. Associer "), latex(`x=${xP}`), texte(" à "), latex(`y=${-y}`), texte(" donne un nombre dont le carré vaut "), latex(cz(e.a, -e.b)), texte(".")]),
  ];
}

function correctionD(e: Exo<"D">): EtapeCorrection[] {
  const A = cd(e.zA.re, e.zA.im);
  const B = cd(e.zB.re, e.zB.im);
  const M = cd(e.milieu.re, e.milieu.im);
  const dx = e.difference.re;
  const dy = e.difference.im;
  const figure = planComplexeSvg({
    points: [
      { v: e.zA, nom: "A" },
      { v: e.zB, nom: "B" },
      { v: e.milieu, nom: "M", couleur: COUL.accent },
    ],
    segments: [{ de: e.zA, a: e.zB }],
    libelle: "Segment [AB] et son milieu M dans le plan complexe",
  });
  return [
    utilise("a", [texte(`L'affixe du milieu est la moyenne des affixes des extrémités ${COURS} : `), latex("z_M=\\dfrac{z_A+z_B}{2}"), texte(".")]),
    calcul("a", [
      ligne(`z_M=\\dfrac{(${A})+(${B})}{2}`),
      ligne(`=\\dfrac{${cd(e.zA.re + e.zB.re, e.zA.im + e.zB.im)}}{2}`, "on regroupe parties réelles et parties imaginaires"),
      ligne(`=${M}`, "on divise chaque partie par 2"),
    ]),
    resultat("a", [latex(`z_M=${M}`)]),
    piege("a", [texte("Les deux parties se divisent par 2, la partie imaginaire aussi.")]),
    utilise("b", [texte("La distance AB est le module de "), latex("z_B-z_A"), texte(", et "), latex("|x+yi|=\\sqrt{x^2+y^2}"), texte(".")]),
    calcul("b", [
      ligne(`z_B-z_A=(${B})-(${A})`),
      ligne(`=(${nb(e.zB.re)}-${pnb(e.zA.re)})+(${nb(e.zB.im)}-${pnb(e.zA.im)})\\,i`, "on regroupe : le « − » porte sur les deux parties"),
      ligne(`=${cd(dx, dy)}`),
      ligne(`AB=|${cd(dx, dy)}|=\\sqrt{${pn(dx)}^2+${pn(dy)}^2}`, "|x + yi| = √(x² + y²)"),
      ligne(`=\\sqrt{${dx * dx + dy * dy}}`),
      ligne(`=${e.distance}`),
    ]),
    { ...resultat("b", [latex(`z_B-z_A=${cd(dx, dy)}`), texte(" et "), latex(`AB=${e.distance}`)]), figureHtml: figure },
    piege("b", [texte("AB est le module de la différence : "), latex("|z_B-z_A|\\neq|z_B|-|z_A|"), texte(".")]),
  ];
}

export function correctionDetailleeAffixesRacines(e: ExerciceAffixesRacines): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return correctionA(e);
    case "B":
      return correctionB(e);
    case "C":
      return correctionC(e);
    case "D":
      return correctionD(e);
  }
}
