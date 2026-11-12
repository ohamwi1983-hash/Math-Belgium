import type {
  ExerciceEquationsComplexes,
  ExerciceFamilleAAvecBarre,
  ExerciceFamilleASansBarre,
  ExerciceFamilleB,
  ExerciceFamilleC,
  ExerciceFamilleD,
  ExerciceFamilleE,
  ExerciceFamilleF,
  ValeurComplexe,
} from "../../core6e/equationsComplexes.types";
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
import { LIBELLE_PHASE, OPTIONS_EQUATION_B, OPTIONS_EQUATION_E, OPTIONS_SYSTEME_A, blocDonnees, consigneEcran, entierComplexeLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatEquationsComplexes";
import { phasesPourExercice, type PhaseEquationsComplexes } from "../../moteur6e/typesEquationsComplexes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationsComplexes, type IdVarianteEquationsComplexes } from "./index";
import { LIBELLE_CAS_EQUATIONS_COMPLEXES, profilEquationsComplexes } from "../profilsEvaluationComplexes34-36";

/**
 * Adaptateur feuille d'exercices / évaluation de `6gen36` (« Équations dans ℂ ») — méthode
 * `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier = l'équation + la consigne globale (« Résous dans ℂ… »), sans méthode (ni « isole
 *   z », ni « pose u = z² ») ; les écrans deviennent les étapes du corrigé.
 * - Tirage libre (`genererInstance`) : familles C (Δ réel négatif) et E réelle (bicarrée) seulement,
 *   comme le générateur ; les variantes « approfondissement » restent au choix du professeur.
 * - Les écrans « à choix » (système, équation développée, équation en u) n'ont pas d'options sur
 *   papier : leur titre d'étape demande d'ÉCRIRE le système / l'équation.
 * - Valeurs : `formatReponseAttenduePhaseLatex` et les options correctes de l'écran.
 */

const p = (n: number) => (n < 0 ? `(${n})` : `${n}`);
const zv = (v: ValeurComplexe) => entierComplexeLatex(v.re, v.im);
/** Facteur d'un produit écrit en clair : réel entre parenthèses s'il est négatif, complexe toujours. */
const zp = (v: ValeurComplexe) => (v.im === 0 ? p(v.re) : `(${zv(v)})`);
const mul = (u: ValeurComplexe, v: ValeurComplexe): ValeurComplexe => ({ re: u.re * v.re - u.im * v.im + 0, im: u.re * v.im + u.im * v.re + 0 });
const add = (u: ValeurComplexe, v: ValeurComplexe): ValeurComplexe => ({ re: u.re + v.re + 0, im: u.im + v.im + 0 });
const neg = (u: ValeurComplexe): ValeurComplexe => ({ re: -u.re + 0, im: -u.im + 0 });
const reel = (x: number): ValeurComplexe => ({ re: x, im: 0 });
const ensemble = (vs: ValeurComplexe[]) => `S=\\left\\{${vs.map(zv).join(";\\ ")}\\right\\}`;

function attendu(e: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): string {
  return formatReponseAttenduePhaseLatex(e, phase).join(",\\ ");
}

/** (num)/(den) mis sous la forme a+bi par le conjugué du dénominateur (quotient de Gauss exact). */
function divisionParConjugue(num: ValeurComplexe, den: ValeurComplexe, quotient: ValeurComplexe): string {
  if (num.re === 0 && num.im === 0) return `\\dfrac{0}{${zv(den)}}=0`;
  if (den.im === 0) return `\\dfrac{${zv(num)}}{${den.re}}=${zv(quotient)}`;
  const conj = { re: den.re, im: -den.im };
  const n2 = den.re * den.re + den.im * den.im;
  return `\\dfrac{${zv(num)}}{${zv(den)}}=\\dfrac{(${zv(num)})(${zv(conj)})}{${p(den.re)}^2+${p(den.im)}^2}=\\dfrac{${zv(mul(num, conj))}}{${n2}}=${zv(quotient)}`;
}

/** « z − r » pour une racine réelle r. */
/** Coefficient devant une lettre ou une parenthèse : « », « - », « 3 » (en tête) ou « + », « - », « +3 », « -3 ». */
function coef(c: number, enTete: boolean): string {
  const mag = Math.abs(c) === 1 ? "" : `${Math.abs(c)}`;
  return `${c < 0 ? "-" : enTete ? "" : "+"}${mag}`;
}

const zMoins = (r: number) => (r < 0 ? `z+${-r}` : `z-${r}`);

/** Polynôme d'un écran F (« \text{Quotient : }… » ou « r_2=…\text{, quotient : }… ») sans préfixe. */
function polynomeEcranF(e: ExerciceFamilleF, phase: "fEcran2" | "fEcran3"): string {
  const brut = attendu(e, phase);
  const morceaux = brut.split(/\\text\{(?:Quotient|, quotient) : \}/);
  return morceaux[morceaux.length - 1];
}

function equationLatex(e: ExerciceEquationsComplexes): string {
  return blocDonnees(e).join(",\\ ");
}

/** Consigne d'un écran, version papier : un écran « à choix » n'a pas d'options sur papier. */
function consigneEtape(e: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): FragmentConsigne[] {
  return consigneEcran(e, phase).map((f) => {
    if (f.type !== "texte") return f;
    const valeur = f.valeur
      .replace("puis choisis le système", "puis écris le système")
      .replace("puis choisis l'équation développée correcte.", "puis écris l'équation développée obtenue.")
      .replace(", et choisis-la ci-dessous.", ".");
    return valeur === f.valeur ? f : { ...f, valeur };
  });
}

// ============================================================================
// Énoncé
// ============================================================================

function entetePapier(e: ExerciceEquationsComplexes): FragmentConsigne[] {
  const precision: FragmentConsigne[] =
    e.famille === "A" && e.sousType === "avecBarre" ? [texte(", où "), latex("\\bar z"), texte(" désigne le conjugué de "), latex("z")] : [];
  const information: FragmentConsigne[] = e.famille === "F" ? [texte(" Le polynôme admet deux racines entières.")] : [];
  return [texte("Résous dans ℂ l'équation "), latex(equationLatex(e)), ...precision, texte("."), ...information, texte(" Donne les solutions sous la forme "), latex("a+bi"), texte(".")];
}

function construireEnonce(e: ExerciceEquationsComplexes): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEtape(e, phase) })) };
}

function enoncePapier(e: ExerciceEquationsComplexes): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] } };
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function construireCorrection(e: ExerciceEquationsComplexes): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [texte(`${LETTRES[i]}) ${LIBELLE_PHASE[phase]} : `), latex(attendu(e, phase))] }));
}

// ============================================================================
// Corrigé détaillé
// ============================================================================

function correctionASans(e: ExerciceFamilleASansBarre): EtapeCorrection[] {
  const den = add(e.a, neg(e.c));
  const num = add(e.d, neg(e.b));
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Comme pour une équation réelle : les termes en "), latex("z"), texte(" d'un côté, les constantes de l'autre, puis on divise (par le conjugué si le diviseur est complexe).")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`${zp(e.a)}z-${zp(e.c)}z=${zp(e.d)}-${zp(e.b)}\\iff (${zv(den)})\\,z=${zv(num)}`)] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`z=${divisionParConjugue(num, den, e.z)}`)] },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(ensemble([e.z]))] },
    { label: "Piège", fragments: [texte("Diviser par un complexe, c'est multiplier numérateur et dénominateur par son conjugué ; on ne divise pas partie réelle par partie réelle.")] },
  ];
}

function correctionAAvec(e: ExerciceFamilleAAvecBarre): EtapeCorrection[] {
  const systeme = OPTIONS_SYSTEME_A(e).find((o) => o.id === "correct")!.latex;
  const z = entierComplexeLatex(e.x, e.y);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On pose "), latex("z=x+yi"), texte(", donc "), latex("\\bar z=x-yi"), texte(", puis on identifie parties réelles et parties imaginaires.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`${coef(e.a, true)}(x+yi)${coef(e.b, false)}(x-yi)=(${e.a}+${p(e.b)})x+(${e.a}-${p(e.b)})y\\,i=${entierComplexeLatex(e.c, e.d)}`)] },
    { label: "Calcul", sousQuestion: "a", fragments: [texte("Système : "), latex(systeme)] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`x=\\dfrac{${e.c}}{${e.a + e.b}}=${e.x}`), texte(" et "), latex(`y=\\dfrac{${e.d}}{${e.a - e.b}}=${e.y}`), texte(", donc "), latex(`z=${z}`), texte(".")] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`S=\\left\\{${z}\\right\\}`)] },
    { label: "Piège", fragments: [texte("Dans "), latex(`${coef(e.b, true)}\\bar z`), texte(", la partie imaginaire est "), latex(`${coef(-e.b, true)}y\\,i`), texte(" : le conjugué change le signe de y.")] },
  ];
}

function correctionB(e: ExerciceFamilleB): EtapeCorrection[] {
  const developpee = OPTIONS_EQUATION_B(e).find((o) => o.id === "correct")!.latex;
  const affine = (coef: number, c0: number) => `${coef === 1 ? "" : coef === -1 ? "-" : coef}z${c0 === 0 ? "" : c0 < 0 ? `-${-c0}` : `+${c0}`}`;
  const pgcd = (x: number, y: number): number => (y === 0 ? Math.abs(x) : pgcd(y, x % y));
  const g = pgcd(e.d, e.c);
  const [ni, di] = e.c < 0 ? [e.d / g, -e.c / g] : [-e.d / g, e.c / g];
  const valeurInterdite = di === 1 ? `${ni}` : `${ni < 0 ? "-" : ""}\\dfrac{${Math.abs(ni)}}{${di}}`;
  const den = add(reel(e.a), neg(e.kc));
  const num = add(e.kd, reel(-e.b));
  // Facteur k devant la parenthèse : « i(…) », « 3i(…) » sans parenthèses superflues.
  const k = e.k.re === 0 && e.k.im > 0 ? zv(e.k) : zp(e.k);
  return [
    { label: "Condition", sousQuestion: "a", fragments: [latex(`${affine(e.c, e.d)}\\neq0`), texte(", c'est-à-dire "), latex(`z\\neq${valeurInterdite}`), texte(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [texte("On multiplie les 2 membres par le dénominateur : "), latex(`${affine(e.a, e.b)}=${k}(${affine(e.c, e.d)})`), texte(", soit "), latex(developpee), texte(".")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`(${zv(den)})\\,z=${zv(num)}`), texte(", puis "), latex(`z=${divisionParConjugue(num, den, e.z)}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [texte("La solution n'est pas réelle, donc différente de la valeur interdite : "), latex(ensemble([e.z]))] },
    { label: "Piège", fragments: [texte("Tout le dénominateur est multiplié par "), latex(zv(e.k)), texte(" : "), latex(`${k}(${affine(e.c, e.d)})`), texte(" donne deux termes.")] },
  ];
}

function correctionC(e: ExerciceFamilleC): EtapeCorrection[] {
  const s = Math.round(Math.sqrt(-e.delta));
  const [z1, z2] = e.racines;
  const numerateur = e.b === 0 ? `\\pm${s}i` : `${-e.b}\\pm${s}i`;
  return [
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`\\Delta=b^2-4ac=${p(e.b)}^2-4\\cdot${p(e.a)}\\cdot${p(e.c)}=${e.delta}`)] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Le discriminant est négatif : dans ℂ, il a deux racines carrées imaginaires, "), latex(`\\Delta=${e.delta}=(${s}i)^2`), texte(", et la formule du second degré s'applique.")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`z=\\dfrac{-b\\pm i\\sqrt{|\\Delta|}}{2a}=\\dfrac{${numerateur}}{${2 * e.a}}`), texte(", d'où "), latex(`z_1=${zv(z1)}`), texte(" et "), latex(`z_2=${zv(z2)}`), texte(".")] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(ensemble([z1, z2])), texte(" (deux solutions conjuguées).")] },
    { label: "Piège", fragments: [texte("Un discriminant négatif ne veut plus dire « pas de solution » : dans ℂ, "), latex("\\sqrt{\\Delta}"), texte(" se remplace par "), latex("i\\sqrt{|\\Delta|}"), texte(".")] },
  ];
}

function correctionD(e: ExerciceFamilleD): EtapeCorrection[] {
  const b2 = mul(e.b, e.b);
  const quatreAc = { re: 4 * e.a * e.c.re, im: 4 * e.a * e.c.im };
  const module = Math.round(Math.hypot(e.delta.re, e.delta.im));
  const [d1, d2] = e.racinesDelta;
  const [z1, z2] = e.racines;
  const moinsB = neg(e.b);
  const deuxA = 2 * e.a;
  return [
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`\\Delta=b^2-4ac=${zp(e.b)}^2-4\\cdot${p(e.a)}\\cdot${zp(e.c)}=${zp(b2)}-${zp(quatreAc)}=${zv(e.delta)}`)] },
    {
      label: "Méthode",
      sousQuestion: "b",
      fragments: [texte("On cherche "), latex("x+yi"), texte(" tel que "), latex(`(x+yi)^2=\\Delta`), texte(" : "), latex(`\\begin{cases}x^2-y^2=${e.delta.re}\\\\ 2xy=${e.delta.im}\\\\ x^2+y^2=|\\Delta|=${module}\\end{cases}`)],
    },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`2x^2=${e.delta.re}+${module}`), texte(" donne "), latex(`x=\\pm${Math.abs(d1.re)}`), texte(", puis "), latex("y=\\dfrac{\\operatorname{Im}(\\Delta)}{2x}"), texte(" : les racines carrées de Δ sont "), latex(zv(d1)), texte(" et "), latex(zv(d2)), texte(".")] },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [latex(`z_1=\\dfrac{${zv(moinsB)}+${zp(d1)}}{${deuxA}}=\\dfrac{${zv(add(moinsB, d1))}}{${deuxA}}=${zv(z1)}`), texte(" et "), latex(`z_2=\\dfrac{${zv(moinsB)}+${zp(d2)}}{${deuxA}}=\\dfrac{${zv(add(moinsB, d2))}}{${deuxA}}=${zv(z2)}`)],
    },
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(ensemble([z1, z2]))] },
    { label: "Piège", fragments: [latex("-b"), texte(" change le signe des deux parties de "), latex("b"), texte(" ; et les deux solutions ne sont pas conjuguées (coefficients complexes).")] },
  ];
}

function correctionE(e: ExerciceFamilleE): EtapeCorrection[] {
  const equationU = OPTIONS_EQUATION_E(e).find((o) => o.id === "correct")!.latex;
  const delta = add(mul(e.b, e.b), neg(mul({ re: 4 * e.a.re, im: 4 * e.a.im }, e.c)));
  // Racine carrée de Δ écrite avec une partie réelle positive (ou, si elle est nulle, une partie
  // imaginaire positive) : « 25 = 5² » plutôt que « (−5)² ».
  const brute = mul(e.a, add(e.u1, neg(e.u2)));
  const deltaRacine = brute.re < 0 || (brute.re === 0 && brute.im < 0) ? neg(brute) : brute;
  const moinsB = neg(e.b);
  const deuxA = { re: 2 * e.a.re, im: 2 * e.a.im };
  const ligneRacines = (u: ValeurComplexe, r: ValeurComplexe) =>
    latex(`z^2=${zv(u)}\\iff z=${zv(r)}\\ \\text{ ou }\\ z=${zv(neg(r))}\\quad\\text{car }(${zv(r)})^2=${zv(u)}`);
  const uComplexes = e.u1.im !== 0 || e.u2.im !== 0;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("L'équation ne contient que "), latex("z^4"), texte(" et "), latex("z^2"), texte(" : on pose "), latex("u=z^2"), texte(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(equationU)] },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [latex(`\\Delta=${zp(e.b)}^2-4\\cdot${zp(e.a)}\\cdot${zp(e.c)}=${zv(delta)}=${zp(deltaRacine)}^2`), texte(", donc "), latex(`u=\\dfrac{${moinsB.re === 0 && moinsB.im === 0 ? "" : zv(moinsB)}\\pm${deltaRacine.re === 0 || deltaRacine.im === 0 ? zv(deltaRacine) : `(${zv(deltaRacine)})`}}{${zv(deuxA)}}`), texte(" : "), latex(`u_1=${zv(e.u1)}`), texte(" et "), latex(`u_2=${zv(e.u2)}`), texte(".")],
    },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [
        texte(uComplexes ? "Racines carrées de chaque valeur de u (système parties réelles, imaginaires et modules) : " : "Racines carrées de chaque valeur de u (un réel négatif a des racines imaginaires) : "),
        ligneRacines(e.u1, e.racineU1),
        texte(" ; "),
        ligneRacines(e.u2, e.racineU2),
      ],
    },
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(ensemble(e.racines)), texte(" (4 solutions).")] },
    { label: "Piège", fragments: [texte("Chaque valeur de u donne deux solutions opposées en z ; et "), latex("z^2=-k"), texte(" (avec "), latex("k>0"), texte(") a pour solutions "), latex("\\pm i\\sqrt{k}"), texte(", jamais « aucune solution ».")] },
  ];
}

function correctionF(e: ExerciceFamilleF): EtapeCorrection[] {
  const q3 = polynomeEcranF(e, "fEcran2");
  const q2 = polynomeEcranF(e, "fEcran3");
  const [A, B, C] = e.quotientQuadratique;
  const delta = B * B - 4 * A * C;
  const s = Math.round(Math.sqrt(-delta));
  const complexes = [{ re: e.p, im: e.q }, { re: e.p, im: -e.q }];
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Une racine entière divise le terme constant "), latex(`${e.e}`), texte(" : on teste ces diviseurs.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`P(${e.r1})=0`), texte(", donc "), latex(`r_1=${e.r1}`), texte(" est racine (on peut aussi trouver d'abord "), latex(`${e.r2}`), texte(").")] },
    { label: "Calcul", sousQuestion: "b", fragments: [texte("Division par "), latex(`(${zMoins(e.r1)})`), texte(" (Horner) : "), latex(`P(z)=(${zMoins(e.r1)})(${q3})`)] },
    { label: "Calcul", sousQuestion: "c", fragments: [latex(`r_2=${e.r2}`), texte(" annule le quotient ; nouvelle division : "), latex(`P(z)=(${zMoins(e.r1)})(${zMoins(e.r2)})(${q2})`)] },
    { label: "Calcul", sousQuestion: "d", fragments: [latex(`\\Delta=${p(B)}^2-4\\cdot${p(A)}\\cdot${p(C)}=${delta}=(${s}i)^2`), texte(", donc "), latex(`z=\\dfrac{${-B}\\pm${s}i}{${2 * A}}`), texte(" : "), latex(`${zv(complexes[0])}`), texte(" et "), latex(`${zv(complexes[1])}`), texte(".")] },
    { label: "Conclusion", sousQuestion: "e", fragments: [latex(ensemble(e.racines))] },
    { label: "Piège", fragments: [texte("Après chaque racine trouvée, on divise par "), latex("(z-r)"), texte(" avant de chercher la suivante ; les deux dernières solutions sont conjuguées (coefficients réels).")] },
  ];
}

function correctionDetaillee(e: ExerciceEquationsComplexes): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return e.sousType === "sansBarre" ? correctionASans(e) : correctionAAvec(e);
    case "B":
      return correctionB(e);
    case "C":
      return correctionC(e);
    case "D":
      return correctionD(e);
    case "E":
      return correctionE(e);
    case "F":
      return correctionF(e);
  }
}

// ============================================================================
// Réponse brève, difficulté, barème
// ============================================================================

function solutions(e: ExerciceEquationsComplexes): ValeurComplexe[] {
  switch (e.famille) {
    case "A":
      return e.sousType === "sansBarre" ? [e.z] : [{ re: e.x, im: e.y }];
    case "B":
      return [e.z];
    case "C":
    case "D":
      return e.racines;
    case "E":
    case "F":
      return e.racines;
  }
}

function reponseBreve(e: ExerciceEquationsComplexes): FragmentConsigne[] {
  return [latex(ensemble(solutions(e)))];
}

function difficulte(e: ExerciceEquationsComplexes): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
    case "B":
    case "C":
      return 2;
    case "E":
      return e.u1.im === 0 && e.u2.im === 0 ? 2 : 3;
    case "D":
    case "F":
      return 3;
  }
}

const crit = (sousQuestion: string, points: number, ...critere: FragmentConsigne[]) => ({ sousQuestion, points, critere });

function bareme(e: ExerciceEquationsComplexes): BaremeExercice {
  const reponseFinale = reponseBreve(e);
  switch (e.famille) {
    case "A":
      if (e.sousType === "sansBarre")
        return {
          reponseFinale,
          criteres: [
            crit("a", 1.5, texte("Termes en "), latex("z"), texte(" regroupés : "), latex(`(${zv(add(e.a, neg(e.c)))})\\,z=${zv(add(e.d, neg(e.b)))}`)),
            crit("a", 1.5, texte("Division par le complexe (conjugué)")),
            crit("a", 1, texte("Solution : "), latex(`z=${zv(e.z)}`)),
          ],
          erreursFrequentes: [{ description: [texte("Division partie par partie, sans conjugué")], cout: "−1,5" }],
        };
      return {
        reponseFinale,
        criteres: [
          crit("a", 1, texte("Substitution "), latex("z=x+yi"), texte(", "), latex("\\bar z=x-yi"), texte(" et développement")),
          crit("a", 1, texte("Système : "), latex(OPTIONS_SYSTEME_A(e).find((o) => o.id === "correct")!.latex)),
          crit("b", 0.5, latex(`x=${e.x}`)),
          crit("b", 0.5, latex(`y=${e.y}`)),
          crit("b", 1, texte("Solution : "), latex(`z=${entierComplexeLatex(e.x, e.y)}`)),
        ],
        erreursFrequentes: [{ description: [texte("Signe de y non changé dans le conjugué")], cout: "−1" }],
      };
    case "B":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Équation sans fraction : "), latex(OPTIONS_EQUATION_B(e).find((o) => o.id === "correct")!.latex)),
          crit("b", 1, texte("Termes en "), latex("z"), texte(" regroupés")),
          crit("b", 1, texte("Division par le conjugué : "), latex(`z=${zv(e.z)}`)),
          crit("b", 0.5, texte("Valeur interdite écartée (condition vérifiée)")),
        ],
        erreursFrequentes: [{ description: [texte("Seul le terme en "), latex("z"), texte(" du dénominateur multiplié par "), latex(zv(e.k))], cout: "−1,5" }],
      };
    case "C":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, latex(`\\Delta=${e.delta}`)),
          crit("b", 1, latex(`\\sqrt{\\Delta}`), texte(" remplacé par "), latex(`i\\sqrt{${-e.delta}}=${Math.round(Math.sqrt(-e.delta))}i`)),
          crit("b", 1.5, texte("Les 2 solutions conjuguées : "), latex(`${zv(e.racines[0])}`), texte(" et "), latex(`${zv(e.racines[1])}`)),
        ],
        erreursFrequentes: [
          { description: [texte("« Pas de solution » car Δ < 0")], cout: "0 pt sur b)" },
          { description: [texte("Une seule solution donnée")], cout: "−1" },
        ],
      };
    case "D":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, latex(`\\Delta=${zv(e.delta)}`)),
          crit("b", 1.5, texte("Racines carrées de Δ : "), latex(`\\pm(${zv(e.racinesDelta[0])})`)),
          crit("c", 1, texte("Les 2 solutions : "), latex(`${zv(e.racines[0])}`), texte(" et "), latex(`${zv(e.racines[1])}`)),
        ],
        erreursFrequentes: [{ description: [texte("Signe de "), latex("-b"), texte(" appliqué à une seule partie")], cout: "−1" }],
      };
    case "E":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1, texte("Équation en u : "), latex(OPTIONS_EQUATION_E(e).find((o) => o.id === "correct")!.latex)),
          crit("b", 1.5, latex(`u_1=${zv(e.u1)}`), texte(" et "), latex(`u_2=${zv(e.u2)}`)),
          crit("c", 1.5, texte("Les 4 solutions (2 opposées par valeur de u)")),
        ],
        erreursFrequentes: [
          { description: [texte("Valeurs de u données comme solutions (sans revenir à z)")], cout: "0 pt sur c)" },
          { description: [texte("Une seule racine carrée par valeur de u")], cout: "−1" },
        ],
      };
    case "F":
      return {
        reponseFinale,
        criteres: [
          crit("a", 0.5, texte("Racine entière "), latex(`${e.r1}`), texte(" (ou "), latex(`${e.r2}`), texte(")")),
          crit("b", 1, texte("Première division (quotient du 3e degré)")),
          crit("c", 1, texte("Deuxième racine et quotient du 2e degré")),
          crit("d", 1, texte("Les 2 solutions complexes conjuguées")),
          crit("e", 0.5, texte("Ensemble des 4 solutions")),
        ],
        erreursFrequentes: [{ description: [texte("Racines du 2e degré oubliées (seules les racines entières données)")], cout: "−1,5" }],
      };
  }
}

export const adaptateurEvaluationEquationsComplexes: AdaptateurFeuilleExercices<ExerciceEquationsComplexes> = {
  profilInstance: profilEquationsComplexes,
  libelleCasParticulier: LIBELLE_CAS_EQUATIONS_COMPLEXES,
  titreDocument: "Équations dans ℂ — Évaluation",
  nomFichierBase: "equations-complexes",
  genererInstance: genererExerciceEquationsComplexes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteEquationsComplexes),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
};
