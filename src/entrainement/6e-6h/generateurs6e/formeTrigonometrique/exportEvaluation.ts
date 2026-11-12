import type { ValeurExacte } from "../../core6e/cyclometrique.types";
import type { AngleRemarquable, ConditionD, ExerciceFormeTrigonometrique, FacteurComplexe } from "../../core6e/formeTrigonometrique.types";
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
import {
  LIBELLE_CONDITION,
  aideNiveau1,
  assembleAPlusBI,
  assembleValeurExacteAPlusBI,
  blocDonnees,
  congruenceLatex,
  consigneEcran,
  formatReponseAttenduePhaseLatex,
} from "../../ui6e/formatFormeTrigonometrique";
import { phasesPourExercice } from "../../moteur6e/typesFormeTrigonometrique";
import type { PhaseFormeTrigonometrique } from "../../moteur6e/typesFormeTrigonometrique";
import { anglePiLatex, avecFractionsNormalisees, planComplexeSvg } from "../racinesNiemes/exportEvaluation";
import { LIBELLE_CAS_FORME_TRIGONOMETRIQUE, profilFormeTrigonometrique } from "../profilsEvaluationComplexes37-39";
import { POINTS_REMARQUABLES } from "./familleA";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFormeTrigonometrique } from "./index";
import type { IdVarianteFormeTrigonometrique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFormeTrigonometrique>` pour `6gen37` (Forme
 * trigonométrique, module, argument et opérations) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la donnée et la consigne globale (« Écris z sous forme trigonométrique et
 *   exponentielle », « Calcule zⁿ sous la forme a + bi »…), avec la convention d'angle (radians,
 *   ]−π ; π]) ; les écrans du générateur deviennent les étapes du corrigé.
 * - Corrigé : valeurs substituées (module, cos θ = a/r…), sommes d'arguments écrites avant d'être
 *   ramenées dans ]−π ; π], et, en famille A, le point z dans le plan avec son module et son argument.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

const CONVENTION: FragmentConsigne[] = [t(" Les arguments sont exprimés en radians, dans l'intervalle "), f("]-\\pi\\,;\\pi]"), t(".")];

// ============================================================================
// Écriture des valeurs.
// ============================================================================

/** Valeur entre parenthèses si elle est négative ou n'est pas un entier simple (carré, produit). */
function par(v: string): string {
  return /^\d+$/.test(v) ? v : `\\left(${v}\\right)`;
}
/** Angle entre parenthèses s'il est négatif (somme d'arguments). */
function parAngle(v: string): string {
  return v.startsWith("-") ? `\\left(${v}\\right)` : v;
}

function point(angle: AngleRemarquable): { cos: ValeurExacte; sin: ValeurExacte } {
  const p = POINTS_REMARQUABLES.find((pt) => pt.angle.p === angle.p && pt.angle.q === angle.q);
  if (!p) throw new Error(`Angle non remarquable : ${angle.latex}`);
  return { cos: p.cos, sin: p.sin };
}

/** Lignes du récapitulatif de l'écran en fragments : `\text{, }` et `\text{ ;}` deviennent du texte. */
function reponse(e: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): FragmentConsigne[] {
  const morceaux = formatReponseAttenduePhaseLatex(e, phase).flatMap((l) => l.replace(/\\text\{ ;\}$/, "").replace(/^n=0\+/, "n=").split("\\text{, }"));
  const sortie = morceaux.flatMap((m, i) => (i === 0 ? [f(m)] : [t(" ; "), f(m)]));
  if (e.famille === "C" && phase === "cEcran3") return [f(`z^{${e.n}}=${morceaux[0]}`)];
  return sortie;
}

/** Module r = √(a² + b²) avec a et b substitués. */
function calculModule(a: string, b: string, carre: number, r: string, nom = "r"): string {
  const racine = `\\sqrt{${carre}}`;
  return `${nom}=\\sqrt{${par(a)}^2+${par(b)}^2}=${racine}${racine === r ? "" : `=${r}`}`;
}

function positionPoint(a: number, b: number): string {
  if (b === 0) return a > 0 ? "sur la partie positive de l'axe réel" : "sur la partie négative de l'axe réel";
  if (a === 0) return b > 0 ? "sur la partie positive de l'axe imaginaire" : "sur la partie négative de l'axe imaginaire";
  const q = a > 0 ? (b > 0 ? 1 : 4) : b > 0 ? 2 : 3;
  return `dans le quadrant ${q} (a ${a > 0 ? ">" : "<"} 0 et b ${b > 0 ? ">" : "<"} 0)`;
}

/** cos θ = a/r et sin θ = b/r (valeurs remarquables), puis la position du point. */
function calculArgument(z: FacteurComplexe): FragmentConsigne[] {
  const { cos, sin } = point(z.angle);
  const quot = (v: ValeurExacte, res: ValeurExacte) => {
    const neg = v.latex.startsWith("-");
    const brut = `${neg ? "-" : ""}\\frac{${neg ? v.latex.slice(1) : v.latex}}{${z.r}}`;
    return z.r === 1 || brut === res.latex ? "" : `=\\dfrac{${v.latex}}{${z.r}}`;
  };
  return [
    f(`\\cos\\theta${quot(z.a, cos)}=${cos.latex}`),
    t(" et "),
    f(`\\sin\\theta${quot(z.b, sin)}=${sin.latex}`),
    t(` : le point (a ; b) est ${positionPoint(z.a.numerique, z.b.numerique)}, d'où `),
    f(`\\theta=${z.angle.latex}`),
    t("."),
  ];
}

function facteur(r: number, a: ValeurExacte, b: ValeurExacte, angle: AngleRemarquable): FacteurComplexe {
  return { r, a, b, angle };
}

/** Somme (ou différence) d'arguments écrite brute, puis ramenée dans ]−π ; π] si besoin. */
function sommeAngles(nom: string, a: AngleRemarquable, b: AngleRemarquable, signe: 1 | -1, resultat: AngleRemarquable): string {
  const brut = anglePiLatex(a.p * b.q + signe * b.p * a.q, a.q * b.q);
  const expr = `${nom}=${a.latex}${signe === 1 ? "+" : "-"}${parAngle(b.latex)}=${brut}`;
  return brut === resultat.latex ? expr : `${expr}\\ \\longrightarrow\\ ${nom}=${resultat.latex}`;
}

function produitAngle(nom: string, n: number, a: AngleRemarquable, resultat: AngleRemarquable): string {
  const brut = anglePiLatex(n * a.p, a.q);
  const expr = `${nom}=${n}\\times${parAngle(a.latex)}=${brut}`;
  return brut === resultat.latex ? expr : `${expr}\\ \\longrightarrow\\ ${nom}=${resultat.latex}`;
}

const CIBLE_CONDITION: Record<ConditionD, { latex: string; p: number; q: number }> = {
  reelPositif: { latex: "0", p: 0, q: 1 },
  reelNegatif: { latex: "\\pi", p: 1, q: 1 },
  imaginairePurPositif: { latex: "\\frac{\\pi}{2}", p: 1, q: 2 },
  imaginairePurNegatif: { latex: "-\\frac{\\pi}{2}", p: -1, q: 2 },
};

// ============================================================================
// Énoncé papier et étapes.
// ============================================================================

function entetePapier(e: ExerciceFormeTrigonometrique): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [t("Soit "), f(`z=${assembleValeurExacteAPlusBI(e.a, e.b)}`), t(". Écris z sous forme trigonométrique et sous forme exponentielle (détermine son module r et son argument θ)."), ...CONVENTION];
    case "B": {
      if (e.sousType === "puissance") {
        return [
          t("Soit "),
          f(`z=${assembleValeurExacteAPlusBI(e.z.a, e.z.b)}`),
          t(". Calcule le module et l'argument de "),
          f(`z^{${e.n}}`),
          t(" à l'aide des propriétés du module et de l'argument, sans développer la puissance."),
          ...CONVENTION,
        ];
      }
      const op = e.sousType === "produit" ? "z_1\\cdot z_2" : "\\dfrac{z_1}{z_2}";
      return [
        t("On donne "),
        f(`z_1=${assembleValeurExacteAPlusBI(e.z1.a, e.z1.b)}`),
        t(" et "),
        f(`z_2=${assembleValeurExacteAPlusBI(e.z2.a, e.z2.b)}`),
        t(". Calcule le module et l'argument de "),
        f(op),
        t(` à l'aide des propriétés du module et de l'argument, sans calculer ${e.sousType === "produit" ? "le produit" : "le quotient"} sous la forme a + bi.`),
        ...CONVENTION,
      ];
    }
    case "C":
      return [t("Soit "), f(`z=${assembleAPlusBI(e.a, e.b)}`), t(". Calcule "), f(`z^{${e.n}}`), t(" sous la forme "), f("a+bi"), t(" en passant par la forme trigonométrique de z (formule de Moivre)."), ...CONVENTION];
    case "D":
      return [
        t("Soit "),
        f(`z=${assembleValeurExacteAPlusBI(e.z.a, e.z.b)}`),
        t(". Détermine tous les entiers n tels que "),
        f("z^n"),
        t(` soit un ${LIBELLE_CONDITION[e.condition]}. Écris les solutions sous la forme `),
        f("n=k+m\\,p"),
        t(", avec "),
        f("p\\in\\mathbb{Z}"),
        t(" et m > 0. Les arguments sont exprimés en radians."),
      ];
    case "E": {
      const op = e.operation === "produit" ? "z_1\\cdot z_2" : "\\dfrac{z_1}{z_2}";
      return [
        t("On donne "),
        f(blocDonnees(e)[0].split("\\quad")[0].trim()),
        t(" et "),
        f(blocDonnees(e)[0].split("\\quad")[1].trim()),
        t(". En calculant "),
        f(op),
        t(" de deux façons (propriétés des exposants, puis développement sous la forme a + bi), déduis-en les valeurs exactes de cos θ et sin θ, où θ est l'argument de "),
        f(op),
        t("."),
        ...CONVENTION,
      ];
    }
  }
}

const ACCORD: Record<string, string> = { "": "obtenu", e: "obtenue", s: "obtenus", es: "obtenues" };

/** Consigne d'écran réécrite pour le papier : « confirmé(e)(s) [à l'étape précédente] » → « obtenu(e)(s)
 * à l'étape n », « Choisis l'équation » → « Écris l'équation ». */
function titreEtape(e: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique, i: number): FragmentConsigne[] {
  return consigneEcran(e, phase).map((fr) => {
    if (fr.type !== "texte") return fr;
    const valeur = fr.valeur
      .replace(/confirmé(e?s?) à l'étape précédente/g, (_, x: string) => `${ACCORD[x]} à l'étape ${i}`)
      .replace(/confirmé(e?s?)/g, (_, x: string) => `${ACCORD[x]} à l'étape ${i}`)
      .replace(/^Choisis l'équation/, "Écris l'équation");
    return valeur === fr.valeur ? fr : { ...fr, valeur };
  });
}

function construireEnonce(e: ExerciceFormeTrigonometrique): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase, i) => ({ consigne: titreEtape(e, phase, i) })) };
}

function construireCorrection(e: ExerciceFormeTrigonometrique): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function phaseFinale(e: ExerciceFormeTrigonometrique): PhaseFormeTrigonometrique {
  const phases = phasesPourExercice(e);
  return phases[phases.length - 1];
}

function reponseBreve(e: ExerciceFormeTrigonometrique): FragmentConsigne[] {
  return reponse(e, phaseFinale(e));
}

function enoncePapier(e: ExerciceFormeTrigonometrique): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function piege(e: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): string | null {
  switch (phase) {
    case "aEcran1":
      return "Écrire r = a + b, ou garder un signe moins sous la racine : le module est une longueur, toujours positive.";
    case "aEcran2":
      if (e.famille === "A" && e.a.numerique < 0) return "Prendre arctan(b/a) directement : ici a < 0, l'angle de la calculatrice est faux d'un demi-tour (ajouter ou retirer π).";
      return "Confondre cos θ = a/r et sin θ = b/r, ou oublier de tenir compte du quadrant du point (a ; b).";
    case "bEcran2":
      if (e.famille !== "B") return null;
      if (e.sousType === "produit") return "Multiplier les arguments au lieu de les additionner (ou additionner les modules au lieu de les multiplier).";
      if (e.sousType === "quotient") return "Soustraire dans le mauvais ordre : l'argument de z₁/z₂ est arg z₁ − arg z₂.";
      return "Élever l'argument à la puissance n au lieu de le multiplier par n.";
    case "cEcran2":
      return "Oublier de ramener nθ dans ]−π ; π] (retirer le bon multiple de 2π).";
    case "cEcran3":
      return "Oublier le module rⁿ en revenant à la forme a + bi.";
    case "dEcran3":
      return "Oublier le terme 2pπ : on ne trouverait qu'une seule valeur de n au lieu d'une infinité.";
    case "eEcran2":
      return "Oublier que i² = −1 dans le développement : le produit des deux sinus change de signe.";
    default:
      return null;
  }
}

function lignesEtape(e: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique, sq: string): EtapeCorrection[] {
  const L: EtapeCorrection[] = [];
  const push = (label: string, fragments: FragmentConsigne[], figureHtml?: string) => L.push({ label, sousQuestion: sq, fragments, ...(figureHtml ? { figureHtml } : {}) });
  switch (e.famille) {
    case "A": {
      const z = facteur(e.r, e.a, e.b, e.angle);
      if (phase === "aEcran1") {
        push("Méthode", [f("r=|z|=\\sqrt{a^2+b^2}")]);
        push("Calcul", [f(calculModule(e.a.latex, e.b.latex, e.r * e.r, `${e.r}`))]);
      } else {
        push("Méthode", [t("On cherche θ tel que "), f("\\cos\\theta=\\dfrac{a}{r}"), t(" et "), f("\\sin\\theta=\\dfrac{b}{r}"), t(" ; le quadrant du point (a ; b) fixe le bon angle.")]);
        push("Calcul", calculArgument(z));
        const figure = planComplexeSvg({ points: [{ x: e.a.numerique, y: e.b.numerique, etiquette: "z" }], moduleArgument: { r: "r", theta: e.angle.numerique }, libelle: "Point z dans le plan, son module r et son argument θ" });
        push("Conclusion", reponse(e, phase), figure);
        break;
      }
      push("Conclusion", reponse(e, phase));
      break;
    }
    case "B": {
      const facteurs = e.sousType === "puissance" ? [{ nom: "", z: e.z }] : [{ nom: "_1", z: e.z1 }, { nom: "_2", z: e.z2 }];
      if (phase === "bEcran1") {
        push("Méthode", [t("Pour chaque nombre : "), f("r=\\sqrt{a^2+b^2}"), t(", puis θ tel que "), f("\\cos\\theta=\\dfrac{a}{r}"), t(" et "), f("\\sin\\theta=\\dfrac{b}{r}"), t(".")]);
        push(
          "Calcul",
          facteurs.flatMap(({ nom, z }, i) => [
            ...(i > 0 ? [t(" ; ")] : []),
            f(calculModule(z.a.latex, z.b.latex, z.r * z.r, `${z.r}`, `r${nom}`)),
            t(", point "),
            t(positionPoint(z.a.numerique, z.b.numerique)),
            t(", "),
            f(`\\theta${nom}=${z.angle.latex}`),
          ]),
        );
      } else {
        const a1 = aideNiveau1(e, phase);
        push("Méthode", [t(`${a1.texte} `), ...(a1.latex ? [f(a1.latex)] : [])]);
        let calcul: string[];
        if (e.sousType === "puissance") {
          calcul = [`r=${e.z.r}^{${e.n}}=${e.rResultat}`, produitAngle("\\theta", e.n, e.z.angle, e.angleResultat)];
        } else {
          const rRes = formatReponseAttenduePhaseLatex(e, "bEcran2")[0].split("\\text{, }")[0];
          calcul = [
            e.sousType === "produit" ? `r=${e.z1.r}\\times ${e.z2.r}=${e.rResultat}` : `r=\\dfrac{${e.z1.r}}{${e.z2.r}}${rRes.replace(/^r=/, "") === `\\frac{${e.z1.r}}{${e.z2.r}}` ? "" : `=${rRes.replace(/^r=/, "")}`}`,
            sommeAngles("\\theta", e.z1.angle, e.z2.angle, e.sousType === "produit" ? 1 : -1, e.angleResultat),
          ];
        }
        push("Calcul", calcul.flatMap((c, i) => (i === 0 ? [f(c)] : [t(" ; "), f(c)])));
      }
      push("Conclusion", reponse(e, phase));
      break;
    }
    case "C": {
      const rLatex = formatReponseAttenduePhaseLatex(e, "cEcran1")[0].split("\\text{, }")[0].replace(/^r=/, "");
      const rnLatex = formatReponseAttenduePhaseLatex(e, "cEcran2")[0].split("\\text{, }")[0].replace(/^r\^n=/, "");
      if (phase === "cEcran1") {
        const z = facteur(e.r, { latex: `${e.a}`, numerique: e.a }, { latex: `${e.b}`, numerique: e.b }, e.angle);
        push("Méthode", [f("r=\\sqrt{a^2+b^2}"), t(", puis θ tel que "), f("\\cos\\theta=\\dfrac{a}{r}"), t(" et "), f("\\sin\\theta=\\dfrac{b}{r}"), t(".")]);
        push("Calcul", [f(calculModule(`${e.a}`, `${e.b}`, e.a * e.a + e.b * e.b, rLatex)), t(" ; le point (a ; b) est "), t(positionPoint(e.a, e.b)), t(", d'où "), f(`\\theta=${z.angle.latex}`), t(".")]);
      } else if (phase === "cEcran2") {
        push("Méthode", [t("Formule de Moivre : "), f("\\left(r(\\cos\\theta+i\\sin\\theta)\\right)^n=r^n\\left(\\cos(n\\theta)+i\\sin(n\\theta)\\right)")]);
        push("Calcul", [f(`r^{${e.n}}=${par(rLatex)}^{${e.n}}=${rnLatex}`), t(" ; "), f(produitAngle(`${e.n}\\theta`, e.n, e.angle, e.angleFinal))]);
      } else {
        const { cos, sin } = point(e.angleFinal);
        const prefixe = rnLatex === "1" ? "" : rnLatex;
        const milieu = cos.numerique !== 0 && sin.numerique !== 0 && prefixe !== "" ? `=${prefixe}\\left(${assembleValeurExacteAPlusBI(cos, sin)}\\right)` : "";
        push("Calcul", [f(`z^{${e.n}}=${prefixe}\\left(\\cos ${parAngle(e.angleFinal.latex)}+i\\sin ${parAngle(e.angleFinal.latex)}\\right)${milieu}`)]);
      }
      push("Conclusion", reponse(e, phase));
      break;
    }
    case "D": {
      const th = e.z.angle;
      const cible = CIBLE_CONDITION[e.condition];
      if (phase === "dEcran1") {
        push("Méthode", [t("On cherche θ tel que "), f("\\cos\\theta=\\dfrac{a}{r}"), t(" et "), f("\\sin\\theta=\\dfrac{b}{r}"), t(", avec "), f(`r=${e.z.r}`), t(".")]);
        push("Calcul", calculArgument(e.z));
      } else if (phase === "dEcran2") {
        const a1 = aideNiveau1(e, phase);
        push("Méthode", [t(`${a1.texte} `), ...(a1.latex ? [f(a1.latex)] : [])]);
        push("Calcul", [t(`zⁿ est un ${LIBELLE_CONDITION[e.condition]} lorsque son argument vaut `), f(cible.latex), t(" à un multiple de 2π près.")]);
      } else {
        const Q = th.q * cible.q;
        const A = th.p * cible.q;
        const B = cible.p * th.q;
        const M = 2 * Q;
        const equation = `${A === 1 ? "" : A === -1 ? "-" : A}n=${B === 0 ? "" : `${B}+`}${M}p`;
        const { k, m } = e.congruence;
        const nVerif = k === 0 ? m : k;
        push("Calcul", [
          f(`n\\cdot ${parAngle(th.latex)}=${cible.p === 0 ? "" : `${cible.latex}+`}2p\\pi`),
          t(" ; en multipliant par "),
          f(`\\dfrac{${Q}}{\\pi}`),
          t(" : "),
          f(equation),
          t(", dont les solutions entières sont "),
          f(k === 0 ? `n=${m}p` : `n=${k}+${m}p`),
          t("."),
        ]);
        push("Vérification", [f(`n=${nVerif}`), t(" : "), f(`${nVerif}\\times${parAngle(th.latex)}=${anglePiLatex(nVerif * th.p, th.q)}`), t(", qui vaut "), f(cible.latex), t(" à un multiple de 2π près.")]);
      }
      push("Conclusion", phase === "dEcran2" ? [f(congruenceLatex(e.condition)), t(", "), f("p\\in\\mathbb{Z}")] : reponse(e, phase));
      break;
    }
    case "E": {
      const signe = e.operation === "produit" ? 1 : -1;
      if (phase === "eEcran1") {
        const loi = e.operation === "produit" ? "e^{i\\alpha}\\cdot e^{i\\beta}=e^{i(\\alpha+\\beta)}" : "\\dfrac{e^{i\\alpha}}{e^{i\\beta}}=e^{i(\\alpha-\\beta)}";
        push("Méthode", [t("Propriété des exposants : "), f(loi)]);
        push("Calcul", [f(sommeAngles("\\theta", e.alpha, e.beta, signe, e.angleResultat))]);
      } else {
        const a1 = aideNiveau1(e, phase);
        const A = point(e.alpha);
        const B = point(e.beta);
        const pv = (v: ValeurExacte) => (v.latex.startsWith("-") ? `\\left(${v.latex}\\right)` : v.latex);
        const cosExpr = `${A.cos.latex}\\cdot ${pv(B.cos)}${signe === 1 ? "-" : "+"}${pv(A.sin)}\\cdot ${pv(B.sin)}`;
        const sinExpr = `${A.sin.latex}\\cdot ${pv(B.cos)}${signe === 1 ? "+" : "-"}${pv(A.cos)}\\cdot ${pv(B.sin)}`;
        push("Méthode", [t(`${a1.texte} `), ...(a1.latex ? [f(a1.latex)] : [])]);
        push("Calcul", [t("Partie réelle : "), f(`\\cos\\theta=${cosExpr}=${e.cosResultat.latex}`), t(" ; partie imaginaire : "), f(`\\sin\\theta=${sinExpr}=${e.sinResultat.latex}`)]);
      }
      push("Conclusion", reponse(e, phase));
      break;
    }
  }
  const p = piege(e, phase);
  if (p) push("Piège", [t(p)]);
  return L;
}

function correctionDetaillee(e: ExerciceFormeTrigonometrique): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i]));
}

function difficulte(e: ExerciceFormeTrigonometrique): 1 | 2 | 3 {
  if (e.famille === "A") return 1;
  if (e.famille === "B" || e.famille === "C") return 2;
  return 3;
}

function criteres(e: ExerciceFormeTrigonometrique): { sq: string; critere: FragmentConsigne[]; points: number }[] {
  const R = (phase: PhaseFormeTrigonometrique) => reponse(e, phase);
  switch (e.famille) {
    case "A":
      return [
        { sq: "a", critere: [t("Module : "), ...R("aEcran1")], points: 1.5 },
        { sq: "b", critere: [t("Argument, quadrant pris en compte : "), f(`\\theta=${e.angle.latex}`)], points: 1.5 },
        { sq: "b", critere: [t("Formes trigonométrique et exponentielle écrites")], points: 1 },
      ];
    case "B":
      return [
        { sq: "a", critere: [t(e.sousType === "puissance" ? "Module de z" : "Modules des deux facteurs")], points: 1 },
        { sq: "a", critere: [t(e.sousType === "puissance" ? "Argument de z" : "Arguments des deux facteurs")], points: 1 },
        { sq: "b", critere: [t("Module du résultat par la propriété")], points: 1 },
        { sq: "b", critere: [t("Argument du résultat par la propriété : "), f(`\\theta=${e.angleResultat.latex}`)], points: 1 },
      ];
    case "C":
      return [
        { sq: "a", critere: [t("Forme trigonométrique de z : "), ...R("cEcran1")], points: 1 },
        { sq: "b", critere: [t("Module de zⁿ")], points: 0.5 },
        { sq: "b", critere: [t("Argument nθ ramené dans ]−π ; π] : "), f(`${e.n}\\theta=${e.angleFinal.latex}`)], points: 1 },
        { sq: "c", critere: [t("Forme a + bi : "), ...R("cEcran3")], points: 1.5 },
      ];
    case "D":
      return [
        { sq: "a", critere: [t("Argument de z : "), ...R("dEcran1")], points: 1 },
        { sq: "b", critere: [t("Équation sur nθ : "), f(congruenceLatex(e.condition))], points: 1 },
        { sq: "c", critere: [t("Résolution en nombres entiers : "), ...R("dEcran3")], points: 2 },
      ];
    case "E":
      return [
        { sq: "a", critere: [t("Angle par les exposants : "), ...R("eEcran1")], points: 1 },
        { sq: "b", critere: [t("Développement sous la forme a + bi, avec i² = −1")], points: 1 },
        { sq: "b", critere: [f(`\\cos\\theta=${e.cosResultat.latex}`)], points: 1 },
        { sq: "b", critere: [f(`\\sin\\theta=${e.sinResultat.latex}`)], points: 1 },
      ];
  }
}

function bareme(e: ExerciceFormeTrigonometrique): BaremeExercice {
  const pieges = phasesPourExercice(e)
    .map((phase) => piege(e, phase))
    .filter((p): p is string => !!p)
    .map((p) => ({ description: [t(p)], cout: "−1" }));
  const reduction = e.famille === "D" || e.famille === "C" ? [] : [{ description: [t("Argument correct mais non ramené dans "), f("]-\\pi\\,;\\pi]")], cout: "−0,5" }];
  return {
    reponseFinale: reponseBreve(e),
    criteres: criteres(e).map((c) => ({ sousQuestion: c.sq, critere: c.critere, points: c.points })),
    erreursFrequentes: [...pieges, ...reduction],
    reponsesAcceptees: [
      e.famille === "D" ? [t("Toute écriture équivalente de l'ensemble des solutions (autre valeur de k congrue modulo m)")] : [t("Valeurs exactes sous une forme équivalente (fraction non simplifiée, radical écrit autrement)")],
    ],
  };
}

export const adaptateurEvaluationFormeTrigonometrique: AdaptateurFeuilleExercices<ExerciceFormeTrigonometrique> = {
  titreDocument: "Forme trigonométrique — Évaluation",
  nomFichierBase: "forme-trigonometrique",
  genererInstance: genererExerciceFormeTrigonometrique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteFormeTrigonometrique),
  construireEnonce: avecFractionsNormalisees(construireEnonce),
  construireCorrection: avecFractionsNormalisees(construireCorrection),
  difficulte: avecFractionsNormalisees(difficulte),
  reponseBreve: avecFractionsNormalisees(reponseBreve),
  correctionDetaillee: avecFractionsNormalisees(correctionDetaillee),
  bareme: avecFractionsNormalisees(bareme),
  enoncePapier: avecFractionsNormalisees(enoncePapier),
  dureeMinutes: 10,
  profilInstance: profilFormeTrigonometrique,
  libelleCasParticulier: LIBELLE_CAS_FORME_TRIGONOMETRIQUE,
};
