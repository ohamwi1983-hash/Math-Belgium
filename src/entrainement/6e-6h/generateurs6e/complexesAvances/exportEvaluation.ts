import type { ExerciceComplexesAvances, ExerciceComplexesB, ExerciceComplexesD, ExerciceComplexesE } from "../../core6e/complexesAvances.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { affixeLatex, affixeLatexRationnel, aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, consigneGenerale, equationDReelles, formatReponseAttenduePhaseLatex } from "../../ui6e/formatComplexesAvances";
import { phasesPourExercice } from "../../moteur6e/typesComplexesAvances";
import type { PhaseComplexesAvances } from "../../moteur6e/typesComplexesAvances";
import { ratioE, solutionsDModules } from "../../moteur6e/verificationComplexesAvances";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComplexesAvances } from "./index";
import type { IdVarianteComplexesAvances } from "./index";
import { profilComplexesAvances } from "../profilsEvaluationComplexes40-42";
import { COULEURS, planComplexeSvg } from "../figuresPlanComplexe40-42";
import type { Coord, PointPlan } from "../figuresPlanComplexe40-42";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComplexesAvances>` pour `6gen42` (Compléments sur
 * les nombres complexes) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (titres « Étape n — … » du corrigé), nettoyées des
 *   tournures d'écran (« une seule tentative », « confirmé », saisie « zb », « une ligne par
 *   solution »…).
 * - `enoncePapier` : énoncé + consigne globale (A, B, C, D coef/modules, E) ; deux vraies questions
 *   pour D ratio (résoudre uⁿ = k, puis z) et D réelles (la valeur de m, puis les solutions). Les QCM
 *   d'écran (A, C, E) deviennent des questions ouvertes ; le verdict de C (|z′| = 1 ou non) n'est
 *   jamais annoncé.
 * - Figures du corrigé (`figureHtml`) : le lieu géométrique (droite, cercle, demi-droite(s), points
 *   exclus), l'intersection droite-cercle, la condition de A (demi-droites hors d'un disque), le
 *   cercle unité et la médiatrice (D modules), les droites (AB) et (CD) (E).
 * - Les variantes « approfondissement » (Thalès, Apollonius) restent hors du tirage libre
 *   (`genererExerciceComplexesAvances`) : elles ne sortent que si le professeur les choisit.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

/** Tournures d'écran → papier, appliquées aux consignes d'écran réutilisées comme titres d'étapes. */
const REECRITURES: [RegExp, string][] = [
  [/ \(une seule tentative\)/g, ""],
  [/ \(un champ par condition\)/g, ""],
  [/ \(une ligne par solution\)/g, ""],
  [/ \(expression en z et zb\)/g, ""],
  [/ \(calculatrice autorisée\)/g, ""],
  [/confirmées/g, "obtenues"],
  [/confirmée/g, "obtenue"],
  [/confirmés/g, "obtenus"],
  [/confirmé/g, "obtenu"],
  [/donnes-en/g, "donne-en"],
  [/\bzb\b/g, "z̄"],
];

function papier(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map((fr) => (fr.type === "texte" ? { ...fr, valeur: REECRITURES.reduce((s, [re, par]) => s.replace(re, par), fr.valeur) } : fr));
}

/** Données d'écran, séparées par des virgules (l'écran les espace seulement par « \quad »). */
const virgules = (l: string) => l.replace(/\\quad /g, ",\\quad ");
const donnees = (e: ExerciceComplexesAvances): FragmentConsigne[] => [t(" Données : "), f(blocDonnees(e).map(virgules).join(",\\quad ")), t(".")];

// ---------------------------------------------------------------------------------------------
// Énoncé papier
// ---------------------------------------------------------------------------------------------

function entetePapier(e: ExerciceComplexesAvances): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [
        t("On considère un nombre complexe non nul "),
        f("z=a+bi"),
        t(" (a et b réels) d'argument θ, et les entiers "),
        f(`n=${e.n}`),
        t(" et "),
        f(`k=${e.k}`),
        t(". Détermine la condition sur a et b pour que "),
        f("z^n"),
        t(" soit un réel strictement supérieur à k."),
      ];
    case "B":
      return [
        ...consigneGenerale(e),
        ...(e.sousType === "intersection" ? [] : [t(" Précise ses éléments caractéristiques (points, centre et rayon, origine…) et les points exclus éventuels.")]),
        ...donnees(e),
      ];
    case "C": {
      const [ligneP, transformation] = blocDonnees(e);
      const [p, pBarre] = ligneP.split("\\quad ");
      return [
        t("Le point d'affixe z appartient au cercle unité ("),
        f("|z|=1"),
        t(", donc "),
        f("z\\cdot\\bar z=1"),
        t("), et on pose "),
        f(transformation),
        t(" avec "),
        f(p),
        t(" (donc "),
        f(pBarre),
        t("). Le point d'affixe z′ est-il lui aussi sur le cercle unité ? Justifie sans poser z = x + yi."),
      ];
    }
    case "D":
      return entetePapierD(e);
    case "E":
      return [...consigneGenerale(e), ...donnees(e), t(" Donne l'argument en valeur exacte, ou arrondi au centième si ce n'est pas un angle remarquable.")];
  }
}

function entetePapierD(e: ExerciceComplexesD): FragmentConsigne[] {
  switch (e.sousType) {
    case "ratio":
      return [t("On considère l'équation "), f("(z+c)^n=k\\cdot z^n"), t(" d'inconnue complexe z ≠ 0, avec "), f(virgules(blocDonnees(e)[0])), t(". On pose "), f("u=\\dfrac{z+c}{z}"), t(".")];
    case "reelles":
      return [t("L'équation suivante, d'inconnue complexe z, dépend d'un paramètre réel m : "), f(equationDReelles(e)), t(".")];
    case "coef":
    case "modules":
      return [...consigneGenerale(e), ...donnees(e)];
  }
}

function questionsPapier(e: ExerciceComplexesAvances): QuestionExercice[] {
  if (e.famille !== "D") return [];
  if (e.sousType === "ratio")
    return [
      { consigne: [t("Résous l'équation "), f("u^n=k"), t(" dans ℂ.")] },
      { consigne: [t("Déduis-en la solution z associée à la solution réelle "), f(`u=${e.m}`), t(".")] },
    ];
  if (e.sousType === "reelles")
    return [{ consigne: [t("Trouve la valeur de m pour laquelle cette équation admet deux solutions réelles.")] }, { consigne: [t("Donne alors ces deux solutions.")] }];
  return [];
}

function etapesParQuestion(e: ExerciceComplexesAvances): string[][] | undefined {
  if (e.famille === "D" && e.sousType === "ratio") return [["a"], ["b"]];
  if (e.famille === "D" && e.sousType === "reelles") return [["a", "b"], ["c"]];
  return undefined;
}

function titreEtape(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] {
  switch (phase) {
    case "aEcran1":
      return [t("Quelle condition sur θ garantit que "), f("z^n"), t(" est un réel strictement positif, et pas seulement un réel ?")];
    case "aEcran2":
      return [t("Traduis cette condition sur θ en une condition sur a et b.")];
    case "aEcran3":
      return [t("Ajoute la condition sur le module pour que "), f("z^n"), t(" dépasse strictement k : écris la condition complète.")];
    case "cEcran3":
      return [t("Remplace "), f("z\\cdot\\bar z"), t(" par 1 dans les deux développements et compare-les. Conclus sur "), f("|z'|"), t(".")];
    case "eEcran3":
      return [t("Conclus : les droites (AB) et (CD) sont-elles parallèles, perpendiculaires, ou ni l'un ni l'autre ?")];
    default:
      return papier(consigneEcran(e, phase));
  }
}

function construireEnonce(e: ExerciceComplexesAvances): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(e: ExerciceComplexesAvances): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function phaseFinale(e: ExerciceComplexesAvances): PhaseComplexesAvances {
  const phases = phasesPourExercice(e);
  return phases[phases.length - 1];
}

function reponseFinaleSimple(e: ExerciceComplexesAvances): FragmentConsigne[] {
  if (e.famille === "B" && e.sousType !== "intersection") return [...reponse(e, "bEcran1"), t(" : "), ...reponse(e, "bEcran2")];
  if (e.famille === "E") return [...reponse(e, "eEcran2"), t(" : "), ...reponse(e, "eEcran3")];
  return reponse(e, phaseFinale(e));
}

function enoncePapier(e: ExerciceComplexesAvances): EnoncePapier {
  const questions = questionsPapier(e);
  if (questions.length === 0) return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseFinaleSimple(e) };
  const phases = phasesPourExercice(e);
  const groupes = etapesParQuestion(e) ?? [];
  const rep = groupes.flatMap((lettres, q) => [t(`${q === 0 ? "" : " ; "}${LETTRES[q]}) `), ...reponse(e, phases[LETTRES.indexOf(lettres[lettres.length - 1])])]);
  return { section: { enteteFragments: entetePapier(e), questions }, etapesParQuestion: groupes, reponseBreve: rep };
}

// ---------------------------------------------------------------------------------------------
// Figures du corrigé
// ---------------------------------------------------------------------------------------------

const xy = (z: { a: number; b: number }): Coord => [z.a, z.b];

function figureA(e: Extract<ExerciceComplexesAvances, { famille: "A" }>): string {
  const R = Math.pow(e.k, 1 / e.n);
  const angles = e.n === 4 ? [0, Math.PI / 2, Math.PI, -Math.PI / 2] : [0, (2 * Math.PI) / 3, (-2 * Math.PI) / 3];
  return planComplexeSvg({
    cercles: [{ cx: 0, cy: 0, r: R, pointilles: true, couleur: COULEURS.doux, epaisseur: 1.1 }],
    demiDroites: angles.map((angle) => ({ origine: [0, 0] as Coord, angle, depuis: R, couleur: COULEURS.accent })),
    points: angles.map((angle) => ({ x: R * Math.cos(angle), y: R * Math.sin(angle), creux: true, couleur: COULEURS.accent })),
    inclure: [
      [-3.2, -3.2],
      [3.2, 3.2],
    ],
    libelle: "Points M dont l'affixe z vérifie la condition",
  });
}

function figureB(e: ExerciceComplexesB): string {
  if (e.sousType === "intersection") {
    return planComplexeSvg({
      droites: [{ p1: xy(e.q1), p2: xy(e.q2), couleur: COULEURS.ciel }],
      cercles: [{ cx: 0, cy: 0, r: Math.sqrt(e.kCercleO), couleur: COULEURS.accent }],
      points: [
        { x: e.q1.a, y: e.q1.b, etiquette: affixeLatexTexte(e.q1), couleur: COULEURS.bon },
        { x: e.q2.a, y: e.q2.b, etiquette: affixeLatexTexte(e.q2), couleur: COULEURS.bon, position: "so" },
      ],
      libelle: "La droite, le cercle et leurs points d'intersection",
    });
  }
  const r = e.resultat;
  const points: PointPlan[] = [];
  const pole = e.poleExclu ? [{ x: e.poleExclu.a, y: e.poleExclu.b, creux: true, couleur: COULEURS.mauvais, etiquette: "exclu" } as PointPlan] : [];
  if (r.nature === "droite") {
    return planComplexeSvg({
      droites: [{ p1: xy(r.point1), p2: xy(r.point2), couleur: COULEURS.accent }],
      points: [...points, ...[r.point1, r.point2].filter((p) => !e.poleExclu || p.a !== e.poleExclu.a || p.b !== e.poleExclu.b).map((p) => ({ x: p.a, y: p.b, couleur: COULEURS.encre })), ...pole],
      libelle: "Le lieu de M : une droite",
    });
  }
  if (r.nature === "cercle") {
    return planComplexeSvg({
      cercles: [{ cx: r.centre.a, cy: r.centre.b, r: r.rayon, couleur: COULEURS.accent }],
      points: [{ x: r.centre.a, y: r.centre.b, etiquette: "centre", couleur: COULEURS.encre, position: "s" }, ...pole],
      libelle: "Le lieu de M : un cercle",
    });
  }
  return planComplexeSvg({
    demiDroites: r.angles.map((a) => ({ origine: xy(r.origine), angle: a.numerique, couleur: COULEURS.accent })),
    points: [{ x: r.origine.a, y: r.origine.b, creux: true, couleur: COULEURS.accent, etiquette: "origine exclue", position: "s" }, ...pole],
    libelle: "Le lieu de M : demi-droite(s)",
  });
}

/** Étiquette texte d'une affixe entière (« 2−i ») pour la figure : signe moins typographique. */
function affixeLatexTexte(z: { a: number; b: number }): string {
  return affixeLatex(z).replace(/-/g, "−");
}

function figureDModules(e: Extract<ExerciceComplexesD, { sousType: "modules" }>): string {
  const num = 2 * (e.dImaginaire ? e.q : e.p);
  const d: Coord = e.dImaginaire ? [0, num / e.r] : [num / e.r, 0];
  const milieu: Coord = [d[0] / 2, d[1] / 2];
  const sol = solutionsDModules(e);
  return planComplexeSvg({
    cercles: [{ cx: 0, cy: 0, r: 1, couleur: COULEURS.accent }],
    droites: [{ p1: milieu, p2: e.dImaginaire ? [milieu[0] + 1, milieu[1]] : [milieu[0], milieu[1] + 1], couleur: COULEURS.ciel }],
    segments: [{ de: [0, 0], a: d, pointilles: true, couleur: COULEURS.doux }],
    points: [{ x: d[0], y: d[1], etiquette: "d", couleur: COULEURS.encre, position: "se" }, ...sol.map((z) => ({ x: z.re, y: z.im, couleur: COULEURS.bon }))],
    inclure: [
      [-1.5, -1.5],
      [1.5, 1.5],
    ],
    libelle: "Cercle unité et médiatrice du segment joignant O au point d'affixe d",
  });
}

function figureE(e: ExerciceComplexesE): string {
  return planComplexeSvg({
    droites: [
      { p1: xy(e.zA), p2: xy(e.zB), couleur: COULEURS.accent },
      { p1: xy(e.zC), p2: xy(e.zD), couleur: COULEURS.ciel },
    ],
    points: [
      { x: e.zA.a, y: e.zA.b, etiquette: "A", couleur: COULEURS.accent },
      { x: e.zB.a, y: e.zB.b, etiquette: "B", couleur: COULEURS.accent },
      { x: e.zC.a, y: e.zC.b, etiquette: "C", couleur: COULEURS.ciel },
      { x: e.zD.a, y: e.zD.b, etiquette: "D", couleur: COULEURS.ciel },
    ],
    libelle: "Les droites (AB) et (CD)",
  });
}

function figure(e: ExerciceComplexesAvances): string | null {
  switch (e.famille) {
    case "A":
      return figureA(e);
    case "B":
      return figureB(e);
    case "D":
      return e.sousType === "modules" ? figureDModules(e) : null;
    case "E":
      return figureE(e);
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

function methode(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] | null {
  const aide = aideNiveau1(e, phase);
  if (aide.texte) return [t(`${aide.texte} `), ...(aide.latex ? [f(aide.latex)] : [])];
  switch (phase) {
    case "aEcran2":
      return [t("Un argument de z se lit sur la position du point (a ; b) : θ = 0 sur la demi-droite des réels positifs, et "), f("\\tan\\theta=\\dfrac{b}{a}"), t(" en tenant compte du signe de a.")];
    case "aEcran3":
      return [t("Le module d'une puissance est la puissance du module :"), f("\\ |z^n|=|z|^n"), t(".")];
    case "bEcran2":
      return [t("On reconnaît l'équation : ax + by + c = 0 pour une droite, "), f("(x-x_0)^2+(y-y_0)^2=r^2"), t(" pour un cercle de centre "), f("x_0+y_0\\,i"), t(" et de rayon r ; une condition de signe ou d'argument ne garde qu'une partie (demi-droite, origine exclue).")];
    case "bInterEcran1":
      return [t("Rapport réel : M est sur la droite passant par les points d'affixes "), f("q_1"), t(" et "), f("q_2"), t(" ; "), f("z\\cdot\\bar z=x^2+y^2"), t(".")];
    case "bInterEcran2":
      return [t("On lit les deux lieux sur leurs équations.")];
    case "bInterEcran3":
      return [t("On remplace, dans l'équation du cercle, une inconnue tirée de l'équation de la droite.")];
    case "cEcran2":
      return [t("Même méthode : "), f("|w|^2=w\\,\\bar w"), t(" et le conjugué d'un produit est le produit des conjugués.")];
    case "cEcran3":
      return [t("Sur le cercle unité, "), f("z\\cdot\\bar z=1"), t(". Le module d'un quotient est le quotient des modules : "), f("|z'|=1"), t(" si et seulement si le carré du module du numérateur est égal à celui du dénominateur.")];
    case "dRatioEcran1":
      return [t("Les solutions de "), f("u^n=m^n"), t(" sont "), f("u=m\\cdot e^{\\frac{2ik\\pi}{n}}"), t(", pour "), f("k=0,\\ldots,n-1"), t(".")];
    case "dRatioEcran2":
      return [f("u=\\dfrac{z+c}{z}\\iff z(u-1)=c\\iff z=\\dfrac{c}{u-1}"), t(" (u ≠ 1).")];
    case "dReellesEcran1":
      return [t("Si z = x est réel, l'équation est nulle si et seulement si sa partie réelle et sa partie imaginaire sont nulles.")];
    case "dReellesEcran2":
      return [t("Les deux racines réelles de la première équation doivent aussi vérifier la seconde, qui est un produit : son facteur indépendant de x doit être nul.")];
    case "dReellesEcran3":
      return [t("Les deux solutions sont les racines de la première équation.")];
    case "dCoefEcran1":
      return [t("On remplace z par "), f("z_0"), t(" ; α et β étant réels, on identifie partie réelle et partie imaginaire.")];
    case "dCoefEcran2":
      return [t("La seconde équation donne α, la première β.")];
    case "dModulesEcran1":
      return [f("\\left|\\dfrac{1}{z}\\right|=\\dfrac{1}{|z|}"), t(", donc "), f("|z|^2=1"), t(".")];
    case "dModulesEcran2":
      return [t("|z| = |z − d| : M est à égale distance de O et du point d'affixe d, donc sur la médiatrice de ce segment ; on l'intersecte avec le cercle unité.")];
    case "eEcran1":
      return [t("On calcule les deux différences, puis on divise en multipliant par le conjugué du dénominateur : "), f("\\dfrac{u}{v}=\\dfrac{u\\cdot\\bar v}{|v|^2}"), t(".")];
    case "eEcran2":
      return [t("Un argument de a + bi se lit sur la position du point (a ; b) : "), f("\\tan\\theta=\\dfrac{b}{a}"), t(", en tenant compte du quadrant.")];
    default:
      return null;
  }
}

function calcul(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] | null {
  if (e.famille === "A") {
    if (phase === "aEcran1") return aideNiveau2(e, phase).latex ? [t("Un réel a pour argument 0 ou π : "), f(aideNiveau2(e, phase).latex as string), t(", et seuls les multiples pairs de π donnent un réel positif.")] : null;
    if (phase === "aEcran2")
      return e.n === 4
        ? [f("4\\theta\\equiv 0\\pmod{2\\pi}\\iff\\theta\\equiv 0\\pmod{\\frac{\\pi}{2}}"), t(" : z est sur l'un des deux axes.")]
        : [f("3\\theta\\equiv 0\\pmod{2\\pi}\\iff\\theta\\in\\left\\{0\\,;\\,\\frac{2\\pi}{3}\\,;\\,-\\frac{2\\pi}{3}\\right\\}"), t(" ; pour "), f("\\theta=\\pm\\frac{2\\pi}{3}"), t(", "), f("a<0"), t(" et "), f("\\tan\\theta=\\mp\\sqrt{3}"), t(".")];
    return [f(`|z^{${e.n}}|=|z|^{${e.n}}>${e.k}\\iff\\sqrt{a^2+b^2}>\\sqrt[${e.n}]{${e.k}}`)];
  }
  if (e.famille === "B" && phase === "bEcran1") {
    const aide = aideNiveau2(e, phase);
    return aide.latex ? [t(`${aide.texte.replace(" (simplification non faite)", "")} `), f(aide.latex)] : null;
  }
  if (e.famille === "C" && phase === "cEcran3") {
    const p2 = e.a * e.a + e.b * e.b;
    const [num] = formatReponseAttenduePhaseLatex(e, "cEcran1");
    const [den] = formatReponseAttenduePhaseLatex(e, "cEcran2");
    const numSubst = num.replace(/^z\\bar z/, "1");
    const denSubst = den.replace(`+${p2}\\,z\\bar z`, `+${p2}`);
    return [t("Avec "), f("z\\cdot\\bar z=1"), t(" : "), f(`|z-p|^2=${numSubst}`), t(" et "), f(`|${e.conjugue ? "1-\\bar p z" : "1-pz"}|^2=${denSubst}`), t(".")];
  }
  if (e.famille === "D" && e.sousType === "ratio" && phase === "dRatioEcran2") return [f(`z=\\dfrac{${e.c}}{${e.m}-1}`)];
  if (e.famille === "E") {
    if (phase === "eEcran1") {
      const num = affixeLatex({ a: e.zD.a - e.zC.a, b: e.zD.b - e.zC.b });
      const den = affixeLatex({ a: e.zB.a - e.zA.a, b: e.zB.b - e.zA.b });
      const r = ratioE(e);
      return [f(`\\dfrac{z_D-z_C}{z_B-z_A}=\\dfrac{${num}}{${den}}=${affixeLatexRationnel(r.re, r.im)}`)];
    }
    if (phase === "eEcran3") {
      const aide = aideNiveau2(e, phase);
      return aide.latex ? [f(aide.latex)] : null;
    }
  }
  return null;
}

function piege(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] | null {
  switch (phase) {
    case "aEcran1":
      return [t("S'arrêter à "), f("n\\theta\\equiv 0\\pmod{\\pi}"), t(" : un multiple impair de π donne un réel négatif.")];
    case "aEcran3":
      return [t("Comparer |z| à k au lieu de "), f(e.famille === "A" ? `\\sqrt[${e.n}]{${e.k}}` : "\\sqrt[n]{k}"), t(" : c'est "), f("|z|^n"), t(" qui doit dépasser k.")];
    case "bEcran2": {
      if (e.famille !== "B" || e.sousType === "intersection") return null;
      if (e.resultat.nature === "demiDroite") return [t("Donner la droite entière : la condition de signe (ou d'argument modulo 2π) ne garde qu'une partie, origine exclue.")];
      if (e.poleExclu) return [t("Oublier d'exclure le point d'affixe "), f(affixeLatex(e.poleExclu)), t(", où la condition n'est pas définie.")];
      if (e.sousType === "cercleO") return [t("Prendre k pour rayon : le rayon est "), f("\\sqrt{k}"), t(".")];
      if (e.sousType === "cercleA") return [t("Confondre k et "), f("k^2"), t(" : le rayon est k.")];
      return [t("Se tromper de centre : regrouper les termes en x et en y, puis compléter les carrés.")];
    }
    case "bInterEcran3":
      return [t("Ne garder qu'une des deux solutions de l'équation du second degré obtenue.")];
    case "cEcran2":
      return [t("Mal conjuguer : le conjugué de "), f("pz"), t(" est "), f("\\bar p\\,\\bar z"), t(".")];
    case "dRatioEcran1":
      return [t("Ne donner que la solution réelle : "), f("u^n=k"), t(" a n solutions complexes.")];
    case "dReellesEcran2":
      return [t("N'utiliser que la partie réelle et oublier la condition donnée par la partie imaginaire.")];
    case "dCoefEcran1":
      return [t("Oublier que α et β sont réels : c'est ce qui permet d'identifier parties réelle et imaginaire.")];
    case "dModulesEcran2":
      return [t("Oublier l'un des deux points d'intersection de la médiatrice avec le cercle unité.")];
    case "eEcran3":
      return [t("Inverser les critères : rapport réel → parallèles ; rapport imaginaire pur → perpendiculaires.")];
    default:
      return null;
  }
}

/** Étape qui porte la figure : la dernière (le lieu, la condition complète, les solutions…). */
function lignesEtape(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances, sousQuestion: string, derniere: boolean): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [];
  const m = methode(e, phase);
  if (m) lignes.push({ label: "Méthode", sousQuestion, fragments: m });
  const c = calcul(e, phase);
  if (c) lignes.push({ label: "Calcul", sousQuestion, fragments: c });
  const fig = derniere ? figure(e) : null;
  lignes.push({ label: "Conclusion", sousQuestion, fragments: reponse(e, phase), ...(fig ? { figureHtml: fig } : {}) });
  const p = piege(e, phase);
  if (p) lignes.push({ label: "Piège", sousQuestion, fragments: p });
  return lignes;
}

function correctionDetaillee(e: ExerciceComplexesAvances): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i], i === phases.length - 1));
}

function difficulte(e: ExerciceComplexesAvances): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
    case "C":
      return 3;
    case "B":
      return e.sousType === "cercleO" || e.sousType === "cercleA" ? 2 : 3;
    case "D":
      return e.sousType === "coef" || e.sousType === "modules" ? 2 : 3;
    case "E":
      return 2;
  }
}

function reponseBreve(e: ExerciceComplexesAvances): FragmentConsigne[] {
  return enoncePapier(e).reponseBreve ?? reponseFinaleSimple(e);
}

function poids(e: ExerciceComplexesAvances): number[] {
  switch (e.famille) {
    case "A":
      return [1.5, 1.5, 1];
    case "B":
      return e.sousType === "intersection" ? [1.5, 1, 1.5] : [2, 2];
    case "C":
      return [1.5, 1.5, 1];
    case "D":
      return { ratio: [2.5, 1.5], reelles: [1.5, 1.5, 1], coef: [2, 2], modules: [1, 3] }[e.sousType];
    case "E":
      return [2, 1, 1];
  }
}

function bareme(e: ExerciceComplexesAvances): BaremeExercice {
  const phases = phasesPourExercice(e);
  const p = poids(e);
  const erreurs = phases.map((phase) => piege(e, phase)).filter((x): x is FragmentConsigne[] => !!x);
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(e, phase), points: p[i] })),
    erreursFrequentes: erreurs.map((description) => ({ description, cout: "−1" })),
    reponsesAcceptees: [[t("Toute équation équivalente (forme développée ou réduite)")], [t("Tout argument égal à 2π près (à π près pour un argument modulo π)")]],
  };
}

export const adaptateurEvaluationComplexesAvances: AdaptateurFeuilleExercices<ExerciceComplexesAvances> = {
  titreDocument: "Compléments sur les nombres complexes — Évaluation",
  nomFichierBase: "complexes-avances",
  genererInstance: genererExerciceComplexesAvances,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteComplexesAvances),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilComplexesAvances,
};
