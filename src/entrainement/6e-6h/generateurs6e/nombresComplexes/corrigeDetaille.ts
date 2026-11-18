import type { ExerciceNombresComplexes } from "../../core6e/nombresComplexes.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { blocDonnees, formatReponseAttenduePhaseLatex } from "../../ui6e/formatNombresComplexes";
import { phasesPourExercice } from "../../moteur6e/typesNombresComplexes";
import { type Fraction, cq, cz, lignesCarre, lignesDivisionConjugue, lignesProduit, lignesProduitQ, lignesSomme, mono, par, parP, pn, quotientExact, somme } from "../../ui6e/corrigeComplexes";

/**
 * Corrigé détaillé « comme au tableau » de `6gen34` (opérations de base et puissances de i) — règle
 * `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau ») : pour chaque
 * écran (lettre d'étape), ce qu'on utilise, le calcul ligne à ligne aligné sur « = » avec la règle
 * utilisée, le résultat encadré, une vérification quand elle est parlante, le piège. Valeurs
 * calculées depuis les paramètres de l'instance ; résultats = ceux de l'écran
 * (`formatReponseAttenduePhaseLatex`). Partagé par l'adaptateur papier et par l'écran (étape
 * échouée), sans dépendance à `docx`.
 */

type Exo<F extends ExerciceNombresComplexes["famille"]> = Extract<ExerciceNombresComplexes, { famille: F }>;

const COURS = "(cours, § 1)";

function attendu(e: ExerciceNombresComplexes, i: number): string {
  return formatReponseAttenduePhaseLatex(e, phasesPourExercice(e)[i]).join(",\\ ");
}

function expression(e: ExerciceNombresComplexes): string {
  return blocDonnees(e).join(",\\ ");
}

/** Lignes de calcul dont la première continue une chaîne déjà commencée (membre de gauche retiré). */
function suite(lignes: LigneCalcul[]): LigneCalcul[] {
  return lignes.map((l, i) => (i === 0 ? { ...l, latex: l.latex.slice(l.latex.indexOf("=")) } : l));
}

/** Vérification par les modules : |z₁|²·|z₂|² = |z₁z₂|². */
function verificationModules(a: number, b: number, c: number, d: number, re: number, im: number, sq: string): EtapeCorrection {
  const n1 = a * a + b * b;
  const n2 = c * c + d * d;
  return verification(sq, [texte("Le carré du module d'un produit est le produit des carrés des modules :")], [
    ligne(`|${cz(a, b)}|^2\\cdot|${cz(c, d)}|^2=${n1}\\cdot ${n2}=${n1 * n2}`, "|z|² = a² + b²"),
    ligne(`|${cz(re, im)}|^2=${pn(re)}^2+${pn(im)}^2=${re * re + im * im}`, "même valeur ✓"),
  ]);
}

/** Vérification d'une division : quotient × dénominateur = numérateur. */
function verificationProduit(re: Fraction, im: Fraction, c: number, d: number, numerateur: string, sq: string): EtapeCorrection {
  const lignes = lignesProduitQ(re, im, c, d);
  const derniere = lignes[lignes.length - 1];
  lignes[lignes.length - 1] = { ...derniere, justification: `${derniere.justification ? `${derniere.justification} : ` : ""}c'est bien le numérateur ${numerateur.replace(/-/g, "−")} ✓` };
  return verification(sq, [texte("Le résultat multiplié par le dénominateur doit redonner le numérateur :")], lignes);
}

function correctionA(e: Exo<"A">): EtapeCorrection[] {
  const op = e.operation;
  const res = attendu(e, 0);
  const u = cz(e.a, e.b);
  const v = cz(e.c, e.d);
  const lignes: LigneCalcul[] = [];
  if (op === "-") {
    lignes.push(ligne(`${par(u)}-${par(v)}=${somme([mono(e.a), mono(e.b, "i"), mono(-e.c), mono(-e.d, "i")])}`, "le « − » change le signe des deux parties"));
    lignes.push(ligne(`=(${e.a}-${pn(e.c)})+(${e.b}-${pn(e.d)})\\,i`, "on regroupe parties réelles et parties imaginaires"));
  } else {
    lignes.push(ligne(`${par(u)}+${par(v)}=(${e.a}+${pn(e.c)})+(${e.b}+${pn(e.d)})\\,i`, "on regroupe parties réelles et parties imaginaires"));
  }
  lignes.push(ligne(`=${res}`));
  return [
    utilise("a", [
      texte(op === "+" ? "On additionne" : "On soustrait"),
      texte(` les parties réelles entre elles, puis les parties imaginaires entre elles ${COURS} : `),
      latex(op === "+" ? "(a+bi)+(c+di)=(a+c)+(b+d)i" : "(a+bi)-(c+di)=(a-c)+(b-d)i"),
      texte("."),
    ]),
    calcul("a", lignes),
    resultat("a", [latex(`${expression(e)}=${res}`)]),
    piege(
      "a",
      op === "-"
        ? [texte("Le signe « − » devant la parenthèse porte sur les deux parties : "), latex(`-(${v})=${cz(-e.c, -e.d)}`), texte(".")]
        : [texte("Parties réelles et parties imaginaires ne se mélangent jamais : "), latex("3+2i"), texte(" ne se simplifie pas en "), latex("5i"), texte(".")],
    ),
  ];
}

function correctionBProduit(e: Extract<Exo<"B">, { sousType: "produit" }>): EtapeCorrection[] {
  const res = attendu(e, 0);
  const conjugues = e.c === e.a && e.d === -e.b;
  return [
    utilise("a", [
      texte("On développe (double distributivité), puis on remplace "),
      latex("i^2"),
      texte(" par "),
      latex("-1"),
      texte(` et on regroupe ${COURS} : `),
      latex("(a+bi)(c+di)=(ac-bd)+(ad+bc)i"),
      texte("."),
    ]),
    calcul("a", lignesProduit(e.a, e.b, e.c, e.d)),
    resultat("a", [latex(`${expression(e)}=${res}`)]),
    verificationModules(e.a, e.b, e.c, e.d, e.resultat.re, e.resultat.im, "a"),
    conjugues
      ? piege("a", [texte("Les deux facteurs sont conjugués : leur produit est le réel "), latex("a^2+b^2"), texte(" (le terme "), latex("-b^2i^2"), texte(" donne "), latex("+b^2"), texte(").")])
      : piege("a", [texte("Le produit des parties imaginaires donne un réel de signe changé : "), latex(`${parP(mono(e.b, "i"))}${parP(mono(e.d, "i"))}=${mono(e.b * e.d, "i^2")}=${-e.b * e.d}`), texte(".")]),
  ];
}

function correctionBCarre(e: Extract<Exo<"B">, { sousType: "carre" }>): EtapeCorrection[] {
  const res = attendu(e, 0);
  const n = e.a * e.a + e.b * e.b;
  return [
    utilise("a", [texte(`Identité remarquable ${COURS} `), latex("(x+y)^2=x^2+2xy+y^2"), texte(" avec "), latex("x=a"), texte(" et "), latex("y=bi"), texte(", puis "), latex("i^2=-1"), texte(".")]),
    calcul("a", lignesCarre(e.a, e.b)),
    resultat("a", [latex(`${expression(e)}=${res}`)]),
    verification("a", [texte("Le module d'un carré est le carré du module :")], [
      ligne(`|${cz(e.a, e.b)}|^2=${pn(e.a)}^2+${pn(e.b)}^2=${n}`, "|z|² = a² + b²"),
      ligne(`|${res}|=\\sqrt{${pn(e.resultat.re)}^2+${pn(e.resultat.im)}^2}=${n}`, "même valeur ✓"),
    ]),
    piege("a", [texte("Ne pas oublier le double produit, ni le signe de "), latex("b^2i^2=-b^2"), texte(" : "), latex("(a+bi)^2\\neq a^2+b^2"), texte(".")]),
  ];
}

function correctionBCube(e: Extract<Exo<"B">, { sousType: "cube" }>): EtapeCorrection[] {
  const carre = attendu(e, 0);
  const cube = attendu(e, 1);
  const z = cz(e.a, e.b);
  return [
    utilise("a", [texte(`On calcule d'abord le carré, avec l'identité `), latex("(x+y)^2=x^2+2xy+y^2"), texte(` et `), latex("i^2=-1"), texte(` ${COURS}.`)]),
    calcul("a", lignesCarre(e.a, e.b)),
    resultat("a", [latex(`${parP(z)}^2=${carre}`)]),
    e.a === 0
      ? piege("a", [texte("Le carré d'un imaginaire pur est un réel négatif : "), latex("(bi)^2=b^2i^2=-b^2"), texte(".")])
      : piege("a", [texte("Ne pas oublier le double produit, ni le signe de "), latex("b^2i^2=-b^2"), texte(".")]),
    utilise("b", [texte("Le cube est le carré multiplié par le nombre de départ : "), latex("(a+bi)^3=(a+bi)^2\\cdot(a+bi)"), texte(". On développe ce produit.")]),
    calcul("b", [ligne(`${parP(z)}^3=${parP(z)}^2\\cdot ${parP(z)}`, "x³ = x² · x"), ligne(`=${parP(carre)}${parP(z)}`, "carré de l'étape 1"), ...suite(lignesProduit(e.carre.re, e.carre.im, e.a, e.b))]),
    resultat("b", [latex(`${expression(e)}=${cube}`)]),
    piege("b", [latex("(a+bi)^3\\neq a^3+b^3i^3"), texte(" : on ne met pas chaque terme au cube séparément. Et "), latex("i^3=i^2\\cdot i=-i"), texte(".")]),
  ];
}

function correctionC(e: Exo<"C">): EtapeCorrection[] {
  const conj = cz(e.c, -e.d);
  const N = cz(e.a, e.b);
  const D = cz(e.c, e.d);
  const num = cz(e.numerateurDeveloppe.re, e.numerateurDeveloppe.im);
  const den = e.denominateurDeveloppe;
  const nr = e.numerateurDeveloppe.re;
  const ni = e.numerateurDeveloppe.im;
  const res = attendu(e, 1);
  const q = quotientExact(e.a, e.b, e.c, e.d);
  const numerateur: LigneCalcul[] =
    e.a === 1 && e.b === 0 ? [ligne(`1\\cdot ${parP(conj)}=${conj}`)] : lignesProduit(e.a, e.b, e.c, -e.d, `${parP(N)}${parP(conj)}`);
  const lignesB: LigneCalcul[] = [ligne(`\\dfrac{${N}}{${D}}=\\dfrac{${num}}{${den}}`, "numérateur et dénominateur de l'étape 1")];
  if (nr !== 0 && ni !== 0) lignesB.push(ligne(`=\\dfrac{${nr}}{${den}}${ni < 0 ? "-" : "+"}\\dfrac{${Math.abs(ni)}}{${den}}\\,i`, "on sépare partie réelle et partie imaginaire"));
  lignesB.push(ligne(`=${res}`, "on simplifie chaque fraction"));
  return [
    utilise("a", [
      texte("Pour diviser par un complexe, on multiplie le numérateur et le dénominateur par le conjugué du dénominateur : le dénominateur devient un réel "),
      texte(COURS),
      texte(". Le conjugué de "),
      latex(D),
      texte(" est "),
      latex(conj),
      texte("."),
    ]),
    calcul("a", [ligne(`\\dfrac{${N}}{${D}}=\\dfrac{${parP(N)}${parP(conj)}}{${parP(D)}${parP(conj)}}`, "on multiplie haut et bas par le conjugué"), ...numerateur], [], "Numérateur"),
    calcul("a", [ligne(`${parP(D)}${parP(conj)}=${pn(e.c)}^2+${pn(e.d)}^2`, "(c + di)(c − di) = c² + d²"), ligne(`=${den}`)], [], "Dénominateur"),
    resultat("a", [texte("Numérateur "), latex(num), texte(", dénominateur "), latex(`${den}`), texte(".")]),
    piege("a", [texte("Le dénominateur vaut "), latex("c^2+d^2"), texte(" (et non "), latex("c^2-d^2"), texte(") : "), latex("(c+di)(c-di)=c^2-d^2i^2=c^2+d^2"), texte(".")]),
    utilise("b", [texte("On divise chaque partie du numérateur par le dénominateur réel, puis on simplifie.")]),
    calcul("b", lignesB),
    resultat("b", [latex(`${expression(e)}=${res}`)]),
    verificationProduit(q.re, q.im, e.c, e.d, N, "b"),
  ];
}

function correctionD(e: Exo<"D">): EtapeCorrection[] {
  const ki = e.k === 1 ? "i" : `${e.k}i`;
  const z = cz(e.a, e.b);
  const produit = cz(e.b, -e.a);
  const res = attendu(e, 0);
  const q = quotientExact(e.a, e.b, 0, e.k);
  const lignes: LigneCalcul[] = [
    ligne(`\\dfrac{${z}}{${ki}}=\\dfrac{${parP(z)}\\cdot(-i)}{${ki}\\cdot(-i)}`, "on multiplie haut et bas par −i"),
    ligne(`${parP(z)}\\cdot(-i)=${somme([mono(-e.a, "i"), mono(-e.b, "i^2")])}`, "on distribue"),
  ];
  if (e.b !== 0) lignes.push(ligne(`=${produit}`, "car i² = −1, on ordonne"));
  lignes.push(ligne(`${ki}\\cdot(-i)=${mono(-e.k, "i^2")}=${e.k}`, "car i² = −1"));
  if (e.k === 1) lignes.push(ligne(`\\dfrac{${z}}{i}=\\dfrac{${produit}}{1}=${res}`));
  else {
    lignes.push(ligne(`\\dfrac{${z}}{${ki}}=\\dfrac{${produit}}{${e.k}}`));
    lignes.push(ligne(`=${res}`, "on divise chaque partie par " + e.k));
  }
  return [
    utilise("a", [texte("On multiplie le numérateur et le dénominateur par "), latex("-i"), texte(", car "), latex("i\\cdot(-i)=-i^2=1"), texte(` : le dénominateur devient réel ${COURS}.`)]),
    calcul("a", lignes),
    resultat("a", [latex(`${expression(e)}=${res}`)]),
    verificationProduit(q.re, q.im, 0, e.k, z, "a"),
    piege("a", [latex("\\dfrac{1}{i}=-i"), texte(" (et non "), latex("i"), texte(") : diviser par "), latex("i"), texte(" revient à multiplier par "), latex("-i"), texte(".")]),
  ];
}

function correctionE(e: Exo<"E">): EtapeCorrection[] {
  const q1 = quotientExact(e.a1, e.b1, e.c1, e.d1);
  const q2 = quotientExact(e.a2, e.b2, e.c2, e.d2);
  const Q1 = cq(q1.re, q1.im);
  const Q2 = cq(q2.re, q2.im);
  const res = attendu(e, 1);
  const f1 = `\\dfrac{${cz(e.a1, e.b1)}}{${cz(e.c1, e.d1)}}`;
  const f2 = `\\dfrac{${cz(e.a2, e.b2)}}{${cz(e.c2, e.d2)}}`;
  return [
    utilise("a", [
      texte(`Pour diviser par un complexe, on multiplie le numérateur et le dénominateur par le conjugué du dénominateur : le dénominateur devient un réel ${COURS}. Chaque fraction avec le conjugué de son propre dénominateur.`),
    ]),
    calcul("a", lignesDivisionConjugue(e.a1, e.b1, e.c1, e.d1), [texte("Le conjugué de "), latex(cz(e.c1, e.d1)), texte(" est "), latex(cz(e.c1, -e.d1)), texte(".")], "1ʳᵉ fraction"),
    calcul("a", lignesDivisionConjugue(e.a2, e.b2, e.c2, e.d2), [texte("Le conjugué de "), latex(cz(e.c2, e.d2)), texte(" est "), latex(cz(e.c2, -e.d2)), texte(".")], "2ᵉ fraction"),
    resultat("a", [latex(`${f1}=${Q1}`), texte(" et "), latex(`${f2}=${Q2}`)]),
    utilise("b", [texte("On additionne les parties réelles entre elles, puis les parties imaginaires entre elles.")]),
    calcul("b", lignesSomme(q1, q2, "+")),
    resultat("b", [latex(`${expression(e)}=${res}`)]),
    piege("b", [texte("On n'additionne jamais numérateurs et dénominateurs entre eux : "), latex("\\dfrac{A}{B}+\\dfrac{C}{D}\\neq\\dfrac{A+C}{B+D}"), texte(".")]),
  ];
}

function correctionF(e: Exo<"F">): EtapeCorrection[] {
  const num = cz(e.numRe, e.numIm);
  const den = cz(e.c, e.d);
  const q = attendu(e, 0);
  const res = attendu(e, 1);
  const lignesA: LigneCalcul[] =
    e.d === 0
      ? [ligne(`\\dfrac{${num}}{${e.c}}=\\dfrac{${e.numRe}}{${e.c}}${e.numIm < 0 ? "-" : "+"}\\dfrac{${Math.abs(e.numIm)}}{${e.c}}\\,i`, "on divise chaque partie"), ligne(`=${q}`)]
      : lignesDivisionConjugue(e.numRe, e.numIm, e.c, e.d);
  const qs = e.quotientSimplifie;
  const sq = qs.re * qs.re + qs.im * qs.im;
  return [
    utilise("a", [
      texte("On simplifie d'abord le quotient entre parenthèses"),
      texte(e.d === 0 ? " : son dénominateur est réel, on divise chaque partie." : ` : on multiplie le numérateur et le dénominateur par le conjugué du dénominateur ${COURS}.`),
    ]),
    calcul("a", lignesA),
    resultat("a", [latex(`\\dfrac{${num}}{${den}}=${q}`)]),
    utilise("b", [texte("On élève au carré le quotient simplifié avec "), latex("(x+y)^2=x^2+2xy+y^2"), texte(" et "), latex("i^2=-1"), texte(".")]),
    calcul("b", lignesCarre(qs.re, qs.im)),
    resultat("b", [latex(`${expression(e)}=${res}`)]),
    verification("b", [texte("Le module d'un carré est le carré du module :")], [
      ligne(`|${q}|^2=${pn(qs.re)}^2+${pn(qs.im)}^2=${sq}`, "|z|² = a² + b²"),
      ligne(`|${res}|=\\sqrt{${pn(e.resultat.re)}^2+${pn(e.resultat.im)}^2}=${sq}`, "même valeur ✓"),
    ]),
    piege("b", [texte("Élever séparément numérateur et dénominateur au carré n'est pas faux, mais bien plus long : on simplifie le quotient avant la mise au carré.")]),
  ];
}

function correctionG(e: Exo<"G">): EtapeCorrection[] {
  const quotient = Math.floor(e.n / 4);
  const valeur = attendu(e, 1);
  const lignesA: LigneCalcul[] = [ligne(`${e.n}=4\\times ${pn(quotient)}+${e.reste}`, e.n < 0 ? "reste toujours entre 0 et 3" : "division euclidienne par 4")];
  return [
    utilise("a", [
      texte("Comme "),
      latex("i^4=1"),
      texte(", les puissances de "),
      latex("i"),
      texte(` se répètent tous les 4 exposants ${COURS} : seul compte le reste de la division de l'exposant par 4 (un reste toujours dans `),
      latex("\\{0;1;2;3\\}"),
      texte(")."),
    ]),
    calcul("a", lignesA),
    resultat("a", [texte("Le reste vaut "), latex(`${e.reste}`), texte(".")]),
    utilise("b", [texte("On remplace l'exposant par 4 × quotient + reste, puis on utilise "), latex("i^4=1"), texte(" et le cycle "), latex("i^0=1,\\ i^1=i,\\ i^2=-1,\\ i^3=-i"), texte(".")]),
    calcul("b", [
      ligne(`i^{${e.n}}=i^{4\\times ${pn(quotient)}+${e.reste}}`, "décomposition de l'étape 1"),
      ligne(`=\\left(i^4\\right)^{${quotient}}\\cdot i^{${e.reste}}`, [latex("a^{4q+r}=(a^4)^q\\cdot a^r")]),
      ligne(`=1^{${quotient}}\\cdot i^{${e.reste}}`, "car i⁴ = 1"),
      ligne(`=${valeur}`, [texte("car "), latex(`i^{${e.reste}}=${valeur}`)]),
    ]),
    resultat("b", [latex(`i^{${e.n}}=${valeur}`)]),
    e.n < 0
      ? piege("b", [texte("Pour un exposant négatif, le reste se prend aussi dans "), latex("\\{0;1;2;3\\}"), texte(" : "), latex("i^{-1}=-i"), texte(" (et non "), latex("i"), texte(").")])
      : piege("b", [texte("Ne pas confondre le quotient et le reste : c'est le reste de la division par 4 qui donne la puissance.")]),
  ];
}

export function correctionDetailleeNombresComplexes(e: ExerciceNombresComplexes): EtapeCorrection[] {
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
