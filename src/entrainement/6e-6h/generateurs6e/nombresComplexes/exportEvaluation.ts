import type { ExerciceNombresComplexes, ValeurComplexe } from "../../core6e/nombresComplexes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { LIBELLE_PHASE, blocDonnees, complexeLatex, consigneEcran, entierComplexeLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatNombresComplexes";
import { phasesPourExercice } from "../../moteur6e/typesNombresComplexes";
import { diviserComplexeExact } from "./fractionComplexe";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceNombresComplexes, type IdVarianteNombresComplexes } from "./index";
import { LIBELLE_CAS_NOMBRES_COMPLEXES, profilNombresComplexes } from "../profilsEvaluationComplexes34-36";

/**
 * Adaptateur feuille d'exercices / évaluation de `6gen34` (« Nombres complexes : opérations de base
 * et puissances de i ») — méthode `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier = l'expression à calculer + la consigne globale (« Calcule et écris le résultat
 *   sous la forme a+bi »), sans les étapes de guidage de l'écran ni rappel de méthode.
 * - Les écrans (`phasesPourExercice`, `consigneEcran`) deviennent les étapes du corrigé
 *   (`sousQuestion` = lettre de l'écran) ; les valeurs intermédiaires et finales sont celles de
 *   l'écran (`formatReponseAttenduePhaseLatex`, mêmes paramètres bruts de l'instance).
 */

type Exo<F extends ExerciceNombresComplexes["famille"]> = Extract<ExerciceNombresComplexes, { famille: F }>;

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Entier entre parenthèses s'il est négatif (facteur d'un produit écrit en clair). */
const p = (n: number) => (n < 0 ? `(${n})` : `${n}`);

const z = (re: number, im: number) => entierComplexeLatex(re, im);
const zv = (v: ValeurComplexe) => entierComplexeLatex(v.re, v.im);

/** Terme c·i² écrit réduit (« i^2 », « -i^2 », « 3i^2 »), précédé de son signe s'il n'est pas en tête. */
function termeI2(c: number, enTete: boolean): string {
  const mag = Math.abs(c) === 1 ? "" : `${Math.abs(c)}`;
  return `${c < 0 ? "-" : enTete ? "" : "+"}${mag}i^2`;
}

/** Valeur attendue de l'écran n°`i` (même fonction que le récapitulatif de l'écran). */
function attendu(e: ExerciceNombresComplexes, i: number): string {
  return formatReponseAttenduePhaseLatex(e, phasesPourExercice(e)[i]).join(",\\ ");
}

function resultatFinal(e: ExerciceNombresComplexes): string {
  const phases = phasesPourExercice(e);
  return attendu(e, phases.length - 1);
}

/** Produit développé de 2 complexes : (a+bi)(c+di) = (ac−bd)+(ad+bc)i, en clair. */
function produitDetaille(u: ValeurComplexe, v: ValeurComplexe): string {
  return `(${u.re}\\cdot${p(v.re)}-${p(u.im)}\\cdot${p(v.im)})+(${u.re}\\cdot${p(v.im)}+${p(u.im)}\\cdot${p(v.re)})\\,i`;
}

/** Carré développé : (a+bi)² = (a²−b²)+2ab·i, en clair. */
function carreDetaille(a: number, b: number): string {
  return `(${p(a)}^2-${p(b)}^2)+2\\cdot${p(a)}\\cdot${p(b)}\\,i`;
}

/** Fraction (num)/(den) mise sous la forme a+bi par le conjugué du dénominateur, en clair. */
function divisionParConjugue(num: ValeurComplexe, den: ValeurComplexe): string {
  const conj = z(den.re, -den.im);
  const nd = { re: num.re * den.re + num.im * den.im, im: num.im * den.re - num.re * den.im };
  const n2 = den.re * den.re + den.im * den.im;
  const { reFrac, imFrac } = diviserComplexeExact(num, den);
  return `\\dfrac{${zv(num)}}{${zv(den)}}=\\dfrac{(${zv(num)})(${conj})}{(${zv(den)})(${conj})}=\\dfrac{${zv(nd)}}{${n2}}=${complexeLatex(reFrac, imFrac)}`;
}

function expressionLatex(e: ExerciceNombresComplexes): string {
  return blocDonnees(e).join(",\\ ");
}

// ============================================================================
// Énoncé
// ============================================================================

function entetePapier(e: ExerciceNombresComplexes): FragmentConsigne[] {
  return [texte("Calcule et écris le résultat sous la forme "), latex("a+bi"), texte(" : "), latex(expressionLatex(e)), texte(".")];
}

/** Énoncé « par écrans » : ses questions donnent les titres d'étapes du corrigé (« Étape n — … »). */
function construireEnonce(e: ExerciceNombresComplexes): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEcran(e, phase) })) };
}

function enoncePapier(e: ExerciceNombresComplexes): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] } };
}

function construireCorrection(e: ExerciceNombresComplexes): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${LETTRES[i]}) ${LIBELLE_PHASE[phase]} : `), latex(formatReponseAttenduePhaseLatex(e, phase).join(",\\ "))],
  }));
}

// ============================================================================
// Corrigé détaillé
// ============================================================================

function correctionA(e: Exo<"A">): EtapeCorrection[] {
  const op = e.operation;
  const res = attendu(e, 0);
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte(op === "+" ? "On additionne" : "On soustrait"), texte(" les parties réelles entre elles et les parties imaginaires entre elles : "), latex(op === "+" ? "(a+bi)+(c+di)=(a+c)+(b+d)i" : "(a+bi)-(c+di)=(a-c)+(b-d)i")],
    },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`(${z(e.a, e.b)})${op}(${z(e.c, e.d)})=(${e.a}${op}${p(e.c)})+(${e.b}${op}${p(e.d)})\\,i=${res}`)] },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(`${expressionLatex(e)}=${res}`)] },
    {
      label: "Piège",
      fragments:
        op === "-"
          ? [texte("Le signe « − » devant la parenthèse porte sur les deux parties : "), latex(`-(${z(e.c, e.d)})=${z(-e.c, -e.d)}`), texte(".")]
          : [texte("Parties réelles et parties imaginaires ne se mélangent jamais : "), latex("3+2i"), texte(" ne se simplifie pas en "), latex("5i"), texte(".")],
    },
  ];
}

function correctionBProduit(e: Extract<Exo<"B">, { sousType: "produit" }>): EtapeCorrection[] {
  const res = attendu(e, 0);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On développe (double distributivité) puis on remplace "), latex("i^2"), texte(" par "), latex("-1"), texte(" : "), latex("(a+bi)(c+di)=(ac-bd)+(ad+bc)i")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`(${z(e.a, e.b)})(${z(e.c, e.d)})=${produitDetaille({ re: e.a, im: e.b }, { re: e.c, im: e.d })}=${res}`)] },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(`${expressionLatex(e)}=${res}`)] },
    e.c === e.a && e.d === -e.b
      ? { label: "Piège", fragments: [texte("Les deux facteurs sont conjugués : leur produit est le réel "), latex("a^2+b^2"), texte(" (le terme "), latex("-b^2i^2"), texte(" donne "), latex("+b^2"), texte(").")] }
      : { label: "Piège", fragments: [texte("Le produit des parties imaginaires donne un réel de signe changé : "), latex(`(${z(0, e.b)})(${z(0, e.d)})=${termeI2(e.b * e.d, true)}=${-e.b * e.d}`), texte(".")] },
  ];
}

function correctionBCarre(e: Extract<Exo<"B">, { sousType: "carre" }>): EtapeCorrection[] {
  const res = attendu(e, 0);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Identité remarquable, avec "), latex("i^2=-1"), texte(" : "), latex("(a+bi)^2=a^2+2abi+b^2i^2=(a^2-b^2)+2ab\\,i")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`(${z(e.a, e.b)})^2=${carreDetaille(e.a, e.b)}=${res}`)] },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(`${expressionLatex(e)}=${res}`)] },
    { label: "Piège", fragments: [texte("Ne pas oublier le double produit, ni le signe de "), latex("b^2i^2=-b^2"), texte(" : "), latex("(a+bi)^2\\neq a^2+b^2"), texte(".")] },
  ];
}

function correctionBCube(e: Extract<Exo<"B">, { sousType: "cube" }>): EtapeCorrection[] {
  const carre = attendu(e, 0);
  const cube = attendu(e, 1);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On calcule d'abord le carré, puis on le multiplie par le nombre de départ : "), latex("(a+bi)^3=(a+bi)^2\\cdot(a+bi)")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`(${z(e.a, e.b)})^2=${carreDetaille(e.a, e.b)}=${carre}`)] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`(${carre})(${z(e.a, e.b)})=${produitDetaille(e.carre, { re: e.a, im: e.b })}=${cube}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`${expressionLatex(e)}=${cube}`)] },
    { label: "Piège", fragments: [latex("(a+bi)^3\\neq a^3+b^3i^3"), texte(" ; et "), latex("i^3=i^2\\cdot i=-i"), texte(".")] },
  ];
}

function correctionC(e: Exo<"C">): EtapeCorrection[] {
  const conj = z(e.c, -e.d);
  const num = zv(e.numerateurDeveloppe);
  const den = e.denominateurDeveloppe;
  const nr = e.numerateurDeveloppe.re;
  const ni = e.numerateurDeveloppe.im;
  const res = attendu(e, 1);
  const separee =
    nr !== 0 && ni !== 0 ? `=\\dfrac{${nr}}{${den}}${ni < 0 ? "-" : "+"}\\dfrac{${Math.abs(ni)}}{${den}}\\,i` : "";
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On multiplie le numérateur et le dénominateur par le conjugué du dénominateur, "), latex(conj), texte(" : le dénominateur devient réel.")] },
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments:
        e.a === 1 && e.b === 0
          ? [texte("Numérateur : "), latex(`1\\cdot(${conj})=${num}`)]
          : [texte("Numérateur : "), latex(`(${z(e.a, e.b)})(${conj})=(${e.a}\\cdot${p(e.c)}+${p(e.b)}\\cdot${p(e.d)})+(${e.b}\\cdot${p(e.c)}-${p(e.a)}\\cdot${p(e.d)})\\,i=${num}`)],
    },
    { label: "Calcul", sousQuestion: "a", fragments: [texte("Dénominateur : "), latex(`(${z(e.c, e.d)})(${conj})=${p(e.c)}^2+${p(e.d)}^2=${den}`)] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`\\dfrac{${num}}{${den}}${separee}=${res}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`${expressionLatex(e)}=${res}`)] },
    { label: "Piège", fragments: [texte("Le dénominateur vaut "), latex("c^2+d^2"), texte(" (et non "), latex("c^2-d^2"), texte(") : "), latex("(c+di)(c-di)=c^2-d^2i^2=c^2+d^2"), texte(".")] },
  ];
}

function correctionD(e: Exo<"D">): EtapeCorrection[] {
  const ki = e.k === 1 ? "i" : `${e.k}i`;
  const zz = z(e.a, e.b);
  const produit = z(e.b, -e.a);
  const res = attendu(e, 0);
  const chaine =
    e.k === 1
      ? `\\dfrac{${zz}}{i}=\\dfrac{(${zz})\\cdot(-i)}{i\\cdot(-i)}=${produit}`
      : `\\dfrac{${zz}}{${ki}}=\\dfrac{(${zz})\\cdot(-i)}{${ki}\\cdot(-i)}=\\dfrac{${produit}}{${e.k}}=${res}`;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On multiplie le numérateur et le dénominateur par "), latex("-i"), texte(", car "), latex("i\\cdot(-i)=-i^2=1"), texte(" : le dénominateur devient réel.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [texte("Numérateur : "), latex(`(${zz})\\cdot(-i)=${e.a !== 0 && e.b !== 0 ? `${z(0, -e.a)}${termeI2(-e.b, false)}=` : ""}${produit}`)] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(chaine)] },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(`${expressionLatex(e)}=${res}`)] },
    { label: "Piège", fragments: [latex("\\dfrac{1}{i}=-i"), texte(" (et non "), latex("i"), texte(") : diviser par "), latex("i"), texte(" revient à multiplier par "), latex("-i"), texte(".")] },
  ];
}

function correctionE(e: Exo<"E">): EtapeCorrection[] {
  const { reFrac: r1, imFrac: i1 } = diviserComplexeExact({ re: e.a1, im: e.b1 }, { re: e.c1, im: e.d1 });
  const { reFrac: r2, imFrac: i2 } = diviserComplexeExact({ re: e.a2, im: e.b2 }, { re: e.c2, im: e.d2 });
  const q1 = complexeLatex(r1, i1);
  const q2 = complexeLatex(r2, i2);
  const res = attendu(e, 1);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On met chaque fraction sous la forme "), latex("a+bi"), texte(" avec le conjugué de son propre dénominateur, puis on additionne.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [texte("1re fraction : "), latex(divisionParConjugue({ re: e.a1, im: e.b1 }, { re: e.c1, im: e.d1 }))] },
    { label: "Calcul", sousQuestion: "a", fragments: [texte("2e fraction : "), latex(divisionParConjugue({ re: e.a2, im: e.b2 }, { re: e.c2, im: e.d2 }))] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`(${q1})+(${q2})=${res}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`${expressionLatex(e)}=${res}`)] },
    { label: "Piège", fragments: [texte("On n'additionne jamais numérateurs et dénominateurs entre eux : "), latex("\\dfrac{A}{B}+\\dfrac{C}{D}\\neq\\dfrac{A+C}{B+D}"), texte(".")] },
  ];
}

function correctionF(e: Exo<"F">): EtapeCorrection[] {
  const num = { re: e.numRe, im: e.numIm };
  const den = { re: e.c, im: e.d };
  const q = attendu(e, 0);
  const res = attendu(e, 1);
  const calculQuotient = e.d === 0 ? `\\dfrac{${zv(num)}}{${e.c}}=${q}` : divisionParConjugue(num, den);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On simplifie d'abord le quotient entre parenthèses"), texte(e.d === 0 ? " (dénominateur réel : on divise chaque partie)" : " (conjugué du dénominateur)"), texte(", puis on élève au carré le résultat.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(calculQuotient)] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`(${q})^2=${carreDetaille(e.quotientSimplifie.re, e.quotientSimplifie.im)}=${res}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`${expressionLatex(e)}=${res}`)] },
    { label: "Piège", fragments: [texte("Élever séparément numérateur et dénominateur au carré n'est pas faux, mais bien plus long : on simplifie le quotient avant la mise au carré.")] },
  ];
}

function correctionG(e: Exo<"G">): EtapeCorrection[] {
  const quotient = Math.floor(e.n / 4);
  const valeur = attendu(e, 1);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Comme "), latex("i^4=1"), texte(", les puissances de "), latex("i"), texte(" se répètent tous les 4 exposants : seul compte le reste de la division de l'exposant par 4 (un reste toujours dans "), latex("\\{0;1;2;3\\}"), texte(").")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`${e.n}=4\\times${p(quotient)}+${e.reste}`), texte(" : le reste vaut "), latex(`${e.reste}`), texte(".")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`i^{${e.n}}=\\left(i^4\\right)^{${quotient}}\\cdot i^{${e.reste}}=i^{${e.reste}}=${valeur}`), texte(", car "), latex("i^0=1,\\ i^1=i,\\ i^2=-1,\\ i^3=-i"), texte(".")] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`i^{${e.n}}=${valeur}`)] },
    e.n < 0
      ? { label: "Piège", fragments: [texte("Pour un exposant négatif, le reste se prend aussi dans "), latex("\\{0;1;2;3\\}"), texte(" : "), latex("i^{-1}=-i"), texte(" (et non "), latex("i"), texte(").")] }
      : { label: "Piège", fragments: [texte("Ne pas confondre le quotient et le reste : c'est le reste de la division par 4 qui donne la puissance.")] },
  ];
}

function correctionDetaillee(e: ExerciceNombresComplexes): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return correctionA(e);
    case "B":
      if (e.sousType === "produit") return correctionBProduit(e);
      if (e.sousType === "carre") return correctionBCarre(e);
      return correctionBCube(e);
    case "C":
      return correctionC(e);
    case "D":
      return correctionD(e);
    case "E":
      return correctionE(e);
    case "F":
      return correctionF(e);
    case "G":
      return correctionG(e);
  }
}

// ============================================================================
// Réponse brève, difficulté, barème
// ============================================================================

function reponseBreve(e: ExerciceNombresComplexes): FragmentConsigne[] {
  return [latex(`${expressionLatex(e)}=${resultatFinal(e)}`)];
}

function difficulte(e: ExerciceNombresComplexes): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
      return 1;
    case "B":
      return e.sousType === "cube" ? 2 : 1;
    case "C":
    case "D":
      return 2;
    case "E":
    case "F":
      return 3;
    case "G":
      return e.n < 0 ? 2 : 1;
  }
}

const crit = (sousQuestion: string, points: number, ...critere: FragmentConsigne[]) => ({ sousQuestion, points, critere });

function bareme(e: ExerciceNombresComplexes): BaremeExercice {
  const reponseFinale = reponseBreve(e);
  switch (e.famille) {
    case "A":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Parties réelles regroupées : "), latex(`${e.a}${e.operation}${p(e.c)}=${e.resultat.re}`)),
          crit("a", 1.5, texte("Parties imaginaires regroupées : "), latex(`${e.b}${e.operation}${p(e.d)}=${e.resultat.im}`)),
          crit("a", 1, texte("Résultat écrit sous la forme "), latex("a+bi")),
        ],
        erreursFrequentes:
          e.operation === "-"
            ? [{ description: [texte("Signe « − » non distribué sur la partie imaginaire")], cout: "−1,5" }]
            : [{ description: [texte("Parties réelle et imaginaire additionnées ensemble")], cout: "−2" }],
      };
    case "B":
      if (e.sousType === "cube")
        return {
          reponseFinale,
          criteres: [
            crit("a", 1, texte("Carré développé (double produit, "), latex("i^2=-1"), texte(")")),
            crit("a", 1, texte("Carré : "), latex(attendu(e, 0))),
            crit("b", 1, texte("Produit du carré par "), latex(z(e.a, e.b)), texte(" développé")),
            crit("b", 1, texte("Cube : "), latex(attendu(e, 1))),
          ],
          erreursFrequentes: [{ description: [latex("(a+bi)^3"), texte(" calculé comme "), latex("a^3+b^3i^3")], cout: "0 pt sur b)" }],
        };
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte(e.sousType === "carre" ? "Identité remarquable appliquée avec le double produit" : "Développement complet (4 produits)")),
          crit("a", 1, texte("Remplacement de "), latex("i^2"), texte(" par "), latex("-1")),
          crit("a", 1, texte("Parties réelles et imaginaires regroupées")),
          crit("a", 0.5, texte("Résultat : "), latex(attendu(e, 0))),
        ],
        erreursFrequentes: [
          { description: [latex("i^2"), texte(" remplacé par "), latex("1"), texte(" (ou laissé tel quel)")], cout: "−1" },
          ...(e.sousType === "carre" ? [{ description: [texte("Double produit oublié")], cout: "−1,5" }] : []),
        ],
      };
    case "C":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1, texte("Multiplication par le conjugué "), latex(z(e.c, -e.d))),
          crit("a", 1, texte("Numérateur : "), latex(zv(e.numerateurDeveloppe))),
          crit("a", 1, texte("Dénominateur : "), latex(`${e.denominateurDeveloppe}`)),
          crit("b", 1, texte("Forme "), latex("a+bi"), texte(" : "), latex(attendu(e, 1))),
        ],
        erreursFrequentes: [
          { description: [texte("Dénominateur "), latex("c^2-d^2")], cout: "−1" },
          { description: [texte("Numérateur et dénominateur divisés partie par partie sans conjugué")], cout: "0 pt sur a)" },
        ],
        reponsesAcceptees: [[latex(`\\dfrac{${zv(e.numerateurDeveloppe)}}{${e.denominateurDeveloppe}}`), texte(" (forme non séparée), si la simplification est juste")]],
      };
    case "D":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Multiplication par "), latex("-i"), texte(" (ou par "), latex("i"), texte(") en haut et en bas")),
          crit("a", 1.5, texte("Numérateur : "), latex(`(${z(e.a, e.b)})\\cdot(-i)=${z(e.b, -e.a)}`)),
          crit("a", 1, texte("Résultat : "), latex(attendu(e, 0))),
        ],
        erreursFrequentes: [{ description: [latex("\\dfrac{1}{i}"), texte(" remplacé par "), latex("i")], cout: "−2" }],
      };
    case "E":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("1re fraction sous la forme "), latex("a+bi")),
          crit("a", 1.5, texte("2e fraction sous la forme "), latex("a+bi")),
          crit("b", 1, texte("Somme : "), latex(attendu(e, 1))),
        ],
        erreursFrequentes: [{ description: [texte("Numérateurs et dénominateurs additionnés entre eux")], cout: "0 pt" }],
      };
    case "F":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1, texte(e.d === 0 ? "Division de chaque partie par le dénominateur réel" : "Multiplication par le conjugué du dénominateur")),
          crit("a", 1.5, texte("Quotient simplifié : "), latex(attendu(e, 0))),
          crit("b", 1.5, texte("Carré : "), latex(attendu(e, 1))),
        ],
        erreursFrequentes: [{ description: [texte("Carré calculé sans simplifier : erreur de calcul dans le développement")], cout: "−1" }],
      };
    case "G":
      return {
        reponseFinale,
        criteres: [
          crit("a", 2, texte("Reste de la division par 4 : "), latex(`${e.reste}`)),
          crit("b", 2, texte("Valeur : "), latex(`i^{${e.n}}=${attendu(e, 1)}`)),
        ],
        erreursFrequentes: [
          { description: [texte("Quotient utilisé à la place du reste")], cout: "0 pt" },
          ...(e.n < 0 ? [{ description: [texte("Reste négatif (ou cycle parcouru à l'envers)")], cout: "−2" }] : []),
        ],
      };
  }
}

export const adaptateurEvaluationNombresComplexes: AdaptateurFeuilleExercices<ExerciceNombresComplexes> = {
  profilInstance: profilNombresComplexes,
  libelleCasParticulier: LIBELLE_CAS_NOMBRES_COMPLEXES,
  titreDocument: "Nombres complexes : opérations de base et puissances de i — Évaluation",
  nomFichierBase: "nombres-complexes-base",
  genererInstance: genererExerciceNombresComplexes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteNombresComplexes),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 5,
};
