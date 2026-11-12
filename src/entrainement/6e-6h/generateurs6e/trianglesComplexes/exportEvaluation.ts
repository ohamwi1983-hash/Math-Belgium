import type { ExerciceTrianglesB, ExerciceTrianglesComplexes, Longueur, PointComplexe } from "../../core6e/trianglesComplexes.types";
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
import { aideNiveau1, aideNiveau2, blocDonnees, formatReponseAttenduePhaseLatex } from "../../ui6e/formatTrianglesComplexes";
import { phasesPourExercice } from "../../moteur6e/typesTrianglesComplexes";
import type { PhaseTrianglesComplexes } from "../../moteur6e/typesTrianglesComplexes";
import { pointEntierLatex } from "./construction";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTrianglesComplexes } from "./index";
import type { IdVarianteTrianglesComplexes } from "./index";
import { profilTrianglesComplexes } from "../profilsEvaluationComplexes40-42";
import { COULEURS, planComplexeSvg, positionLoinDe } from "../figuresPlanComplexe40-42";
import type { Coord, PointPlan, SegmentPlan } from "../figuresPlanComplexe40-42";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTrianglesComplexes>` pour `6gen41` (Triangles et
 * nombres complexes) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (titres « Étape n — … » du corrigé), reformulées pour
 *   le papier (plus de « une seule tentative », de « confirmées », de saisie « sqrt(10) »).
 * - `enoncePapier` — AUCUN verdict n'est annoncé avant d'être démontré (ni « isocèle », ni « rectangle »,
 *   ni « centre », ni « image »), et AUCUNE figure dans l'énoncé (elle trahirait les verdicts) :
 *   - A, C, E : une seule demande (« Ce triangle est-il isocèle ? Est-il rectangle ? ») ;
 *   - B : a) isocèle ? rectangle ? b) les trois angles (loi des cosinus, calculatrice) ;
 *   - D : a) rapport et angle de la similitude qui envoie A sur C, b) envoie-t-elle B sur D ?,
 *     c) le nombre complexe k·e^{iθ} sous la forme a + bi.
 * - Figure du corrigé (`figureHtml`) : le ou les triangles, sous la conclusion de la dernière étape.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

const QUESTION_ISOCELE_RECTANGLE = "Ce triangle est-il isocèle ? Est-il rectangle ? Justifie et précise, le cas échéant, en quel sommet.";

/** « z_A = …, z_B = … et z_C = … » (dernière donnée précédée de « et »). */
function listeDonnees(e: ExerciceTrianglesComplexes): FragmentConsigne[] {
  const lignes = blocDonnees(e);
  return lignes.flatMap((l, i) => (i === 0 ? [f(l)] : [t(i === lignes.length - 1 ? " et " : ", "), f(l)]));
}

function entetePapier(e: ExerciceTrianglesComplexes): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [t("Dans le plan complexe, on considère le triangle ABC dont les sommets ont pour affixes "), ...listeDonnees(e), t(`. ${QUESTION_ISOCELE_RECTANGLE}`)];
    case "B":
      return [t("Dans le plan complexe, on considère le triangle OAB dont les sommets ont pour affixes "), ...listeDonnees(e), t(".")];
    case "C":
      return [
        t("Dans le plan complexe, on donne les points O, B, F et A d'affixes "),
        ...listeDonnees(e),
        t(". Vérifie que le triangle OBF est équilatéral, puis détermine si le point A est le centre de ce triangle, c'est-à-dire s'il est à égale distance de ses trois sommets. Justifie."),
      ];
    case "D":
      return [t("Dans le plan complexe, on donne les points O, A, B, C et D d'affixes "), ...listeDonnees(e), t(".")];
    case "E":
      return [
        t("Dans le plan complexe, on donne les points A, B et C d'affixes "),
        ...listeDonnees(e),
        t(". Les points A, B et C sont-ils alignés ? Les droites (AB) et (AC) sont-elles perpendiculaires ? Réponds à l'aide du quotient "),
        f("\\dfrac{z_C-z_A}{z_B-z_A}"),
        t("."),
      ];
  }
}

function questionsPapier(e: ExerciceTrianglesComplexes): QuestionExercice[] {
  if (e.famille === "B") return [{ consigne: [t(QUESTION_ISOCELE_RECTANGLE)] }, { consigne: [t("Calcule les trois angles de ce triangle, en degrés, arrondis au dixième.")] }];
  if (e.famille === "D")
    return [
      { consigne: [t("Détermine le rapport k et l'angle θ de la similitude de centre O qui envoie A sur C.")] },
      { consigne: [t("Cette similitude envoie-t-elle aussi B sur D ? Justifie.")] },
      { consigne: [t("Écris sous la forme a + bi le nombre complexe "), f("k\\cdot e^{i\\theta}"), t(" qui caractérise cette similitude.")] },
    ];
  return [];
}

function etapesParQuestion(e: ExerciceTrianglesComplexes): string[][] | undefined {
  if (e.famille === "B") return [["a", "b", "c"], ["d"]];
  if (e.famille === "D") return [["a"], ["b"], ["c"]];
  return undefined;
}

/** Titres d'étapes du corrigé — reformulation papier des consignes d'écran (`consigneEcran`). */
function titreEtape(phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  switch (phase) {
    case "aEcran1":
      return [t("Calcule les longueurs des trois côtés, par le module d'une différence d'affixes (par exemple "), f("AB=|z_B-z_A|"), t(").")];
    case "aEcran2":
    case "bEcran2":
      return [t("Le triangle est-il isocèle ? En quel sommet ?")];
    case "aEcran3":
    case "bEcran3":
      return [t("Teste la relation de Pythagore : le triangle est-il rectangle ? En quel sommet ?")];
    case "bEcran1":
      return [t("Calcule les longueurs OA, OB et AB (valeurs exactes).")];
    case "bEcran4":
      return [t("Applique la loi des cosinus pour trouver l'angle au sommet principal, puis déduis les deux autres (égaux, la somme des angles valant 180°).")];
    case "cEcran1":
      return [t("Calcule les longueurs OB, BF et OF.")];
    case "cEcran2":
      return [t("Calcule les distances AO, AB et AF (valeurs exactes).")];
    case "cEcran3":
      return [t("Conclus : A est-il le centre du triangle OBF ?")];
    case "dEcran1":
      return [t("Calcule le rapport "), f("\\dfrac{|z_C|}{|z_A|}"), t(" et l'angle "), f("\\arg z_C-\\arg z_A"), t(" de la similitude de centre O qui envoie A sur C.")];
    case "dEcran2":
      return [t("Calcule de même "), f("\\dfrac{|z_D|}{|z_B|}"), t(" et "), f("\\arg z_D-\\arg z_B"), t(", puis conclus.")];
    case "dEcran3":
      return [t("Écris sous la forme a + bi le nombre complexe "), f("k\\cdot e^{i\\theta}"), t(" qui caractérise cette similitude.")];
    case "eEcran1":
      return [t("Calcule le quotient "), f("q=\\dfrac{z_C-z_A}{z_B-z_A}"), t(" sous la forme a + bi.")];
    case "eEcran2":
      return [t("Conclus à partir de ce quotient.")];
  }
}

function construireEnonce(e: ExerciceTrianglesComplexes): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(phase) })) };
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(e: ExerciceTrianglesComplexes): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

/** Réponse finale sans sous-question papier : les verdicts (et non les longueurs intermédiaires). */
function reponseFinaleSimple(e: ExerciceTrianglesComplexes): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [...reponse(e, "aEcran2"), t(" ; "), ...reponse(e, "aEcran3")];
    case "C":
      return reponse(e, "cEcran3");
    case "E":
      return [...reponse(e, "eEcran1"), t(" : "), ...reponse(e, "eEcran2")];
    default:
      return [];
  }
}

function enoncePapier(e: ExerciceTrianglesComplexes): EnoncePapier {
  const questions = questionsPapier(e);
  if (questions.length === 0) return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseFinaleSimple(e) };
  const reponseB =
    e.famille === "B"
      ? [t("a) "), ...reponse(e, "bEcran2"), t(" ; "), ...reponse(e, "bEcran3"), t(" ; b) "), ...reponse(e, "bEcran4")]
      : [t("a) "), ...reponse(e, "dEcran1"), t(` ; b) ${e.famille === "D" && e.coherent ? "oui (même rapport, même angle)" : "non"} ; c) `), ...reponse(e, "dEcran3")];
  return { section: { enteteFragments: entetePapier(e), questions }, etapesParQuestion: etapesParQuestion(e), reponseBreve: reponseB };
}

// ---------------------------------------------------------------------------------------------
// Figures du corrigé
// ---------------------------------------------------------------------------------------------

const c = (p: PointComplexe): Coord => [p.re, p.im];

function centre(pts: Coord[]): Coord {
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
}

function pointsNommes(liste: [string, PointComplexe, string?][], g: Coord): PointPlan[] {
  return liste.map(([nom, p, couleur]) => ({ x: p.re, y: p.im, etiquette: nom, couleur: couleur ?? COULEURS.encre, position: positionLoinDe(c(p), g) }));
}

function figure(e: ExerciceTrianglesComplexes): string {
  switch (e.famille) {
    case "A": {
      const g = centre([c(e.A), c(e.B), c(e.C)]);
      return planComplexeSvg({
        polygones: [{ sommets: [c(e.A), c(e.B), c(e.C)], couleur: COULEURS.accent, remplissage: COULEURS.accentDoux }],
        points: pointsNommes([["A", e.A], ["B", e.B], ["C", e.C]], g),
        libelle: "Le triangle ABC",
      });
    }
    case "B": {
      const g = centre([c(e.O), c(e.A), c(e.B)]);
      return planComplexeSvg({
        polygones: [{ sommets: [c(e.O), c(e.A), c(e.B)], couleur: COULEURS.accent, remplissage: COULEURS.accentDoux }],
        points: pointsNommes([["O", e.O], ["A", e.A], ["B", e.B]], g),
        libelle: "Le triangle OAB",
      });
    }
    case "C": {
      const g = centre([c(e.O), c(e.B), c(e.F)]);
      const segments: SegmentPlan[] = [c(e.O), c(e.B), c(e.F)].map((s) => ({ de: c(e.A), a: s, pointilles: true, couleur: COULEURS.ciel }));
      return planComplexeSvg({
        polygones: [{ sommets: [c(e.O), c(e.B), c(e.F)], couleur: COULEURS.accent, remplissage: COULEURS.accentDoux }],
        segments,
        points: [...pointsNommes([["O", e.O], ["B", e.B], ["F", e.F]], g), { x: e.A.re, y: e.A.im, etiquette: "A", couleur: COULEURS.ciel, position: "se" }],
        libelle: "Le triangle OBF et le point A",
      });
    }
    case "D": {
      const g = centre([c(e.O), c(e.A), c(e.B), c(e.C), c(e.D)]);
      return planComplexeSvg({
        polygones: [
          { sommets: [c(e.O), c(e.A), c(e.B)], couleur: COULEURS.encre },
          { sommets: [c(e.O), c(e.C), c(e.D)], couleur: COULEURS.accent, pointilles: !e.coherent },
        ],
        points: pointsNommes(
          [
            ["O", e.O],
            ["A", e.A],
            ["B", e.B],
            ["C", e.C, COULEURS.accent],
            ["D", e.D, COULEURS.accent],
          ],
          g,
        ),
        libelle: "Les triangles OAB et OCD",
      });
    }
    case "E": {
      const g = centre([c(e.A), c(e.B), c(e.C)]);
      return planComplexeSvg({
        droites: [
          { p1: c(e.A), p2: c(e.B), couleur: COULEURS.accent },
          { p1: c(e.A), p2: c(e.C), couleur: COULEURS.ciel },
        ],
        points: pointsNommes([["A", e.A], ["B", e.B], ["C", e.C]], g),
        libelle: "Les droites (AB) et (AC)",
      });
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

const carre = (l: Longueur) => Math.round(l.numerique * l.numerique);

/** « AB = |z_B − z_A| = |3+i| = √10 » quand les deux affixes sont entières. */
function ligneLongueur(nom: string, p: PointComplexe, q: PointComplexe, l: Longueur): string {
  const entiers = [p.re, p.im, q.re, q.im].every((v) => Number.isInteger(v));
  const zp = nom[0];
  const zq = nom[1];
  const diff = entiers ? `=|${pointEntierLatex(q.re - p.re, q.im - p.im)}|=\\sqrt{(${q.re - p.re})^2+(${q.im - p.im})^2}` : "";
  return `${nom}=|z_${zq}-z_${zp}|${diff}=${l.latex}`;
}

/** Côtés autour du sommet principal S du triangle isocèle OAB (carrés entiers) — mêmes données que
 * l'aide de l'écran 4 (`aideNiveau1B`/`aideNiveau2B`). */
function cosinusB(e: ExerciceTrianglesB): FragmentConsigne[] {
  const s = e.sommetIsocele;
  const [l1, l2, lo] = s === "O" ? [carre(e.OA), carre(e.OB), carre(e.AB)] : s === "A" ? [carre(e.OA), carre(e.AB), carre(e.OB)] : [carre(e.OB), carre(e.AB), carre(e.OA)];
  const num = l1 + l2 - lo;
  // Triangle isocèle en S : les deux côtés adjacents sont égaux, leur produit vaut l1.
  const den = 2 * l1;
  let a = Math.abs(num);
  let b = den;
  while (b) [a, b] = [b, a % b];
  const g = a || 1;
  const frac = num === 0 ? "0" : `${num < 0 ? "-" : ""}\\dfrac{${Math.abs(num) / g}}{${den / g}}`;
  const autres = (["O", "A", "B"] as const).filter((x) => x !== s);
  const deg = (v: number) => `${(Math.round(v * 10) / 10).toString().replace(".", "{,}")}^{\\circ}`;
  return [
    f(`\\cos\\widehat{${s}}=\\dfrac{${l1}+${l2}-${lo}}{2\\cdot ${l1}}=${frac}`),
    t(", donc "),
    f(`\\widehat{${s}}\\approx ${deg(e.anglesDeg[s])}`),
    t(" et "),
    f(`\\widehat{${autres[0]}}=\\widehat{${autres[1]}}=\\dfrac{180^{\\circ}-\\widehat{${s}}}{2}\\approx ${deg(e.anglesDeg[autres[0]])}`),
    t("."),
  ];
}

function calcul(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): FragmentConsigne[] | null {
  switch (phase) {
    case "aEcran1":
      if (e.famille !== "A") return null;
      return [f(ligneLongueur("AB", e.A, e.B, e.AB)), t(" ; "), f(ligneLongueur("AC", e.A, e.C, e.AC)), t(" ; "), f(ligneLongueur("BC", e.B, e.C, e.BC))];
    case "bEcran1":
      if (e.famille !== "B") return null;
      return [f(ligneLongueur("OA", e.O, e.A, e.OA)), t(" ; "), f(ligneLongueur("OB", e.O, e.B, e.OB)), t(" ; "), f(ligneLongueur("AB", e.A, e.B, e.AB))];
    case "cEcran2":
      if (e.famille !== "C") return null;
      return [f(`AO=|z_O-z_A|=${e.AO.latex}`), t(" ; "), f(`AB=|z_B-z_A|=${e.AB.latex}`), t(" ; "), f(`AF=|z_F-z_A|=${e.AF.latex}`)];
    case "eEcran1": {
      if (e.famille !== "E") return null;
      // q = u/v = u·v̄/|v|² (affixes entières).
      const [ua, ub] = [e.C.re - e.A.re, e.C.im - e.A.im];
      const [va, vb] = [e.B.re - e.A.re, e.B.im - e.A.im];
      const u = pointEntierLatex(ua, ub);
      const v = pointEntierLatex(va, vb);
      const vBarre = pointEntierLatex(va, -vb);
      return [f(`q=\\dfrac{${u}}{${v}}=\\dfrac{(${u})(${vBarre})}{${va * va + vb * vb}}=${formatReponseAttenduePhaseLatex(e, "eEcran1")[0].replace(/^q=/, "")}`)];
    }
    case "aEcran3":
    case "dEcran1": {
      const aide = aideNiveau2(e, phase);
      return aide.latex ? [t(`${aide.texte.replace(/ ?\((comparaison|les 2 autres|angle|division) non (faite|calculées?|calculé)\)/, "")} `), f(aide.latex)] : null;
    }
    case "bEcran3": {
      if (e.famille !== "B") return null;
      return [f(`OA^2=${carre(e.OA)}\\qquad OB^2=${carre(e.OB)}\\qquad AB^2=${carre(e.AB)}`)];
    }
    case "bEcran4":
      return e.famille === "B" ? cosinusB(e) : null;
    default:
      return null;
  }
}

function methode(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): FragmentConsigne[] | null {
  const aide = aideNiveau1(e, phase);
  if (aide.texte) return [t(`${aide.texte} `), ...(aide.latex ? [f(aide.latex)] : [])];
  switch (phase) {
    case "aEcran1":
    case "bEcran1":
    case "cEcran1":
      return [t("La distance entre deux points est le module de la différence de leurs affixes : "), f("MN=|z_N-z_M|"), t(".")];
    case "aEcran2":
    case "bEcran2":
      return [t("Un triangle est isocèle quand deux de ses côtés ont la même longueur ; le sommet principal est le sommet commun à ces deux côtés.")];
    case "bEcran3":
      return [t("Un triangle est rectangle si le carré du plus grand côté est égal à la somme des carrés des deux autres ; l'angle droit est opposé à ce plus grand côté.")];
    case "cEcran3":
      return [t("Le centre d'un triangle équilatéral est le seul point situé à égale distance de ses trois sommets.")];
    case "dEcran2":
      return [t("D est l'image de B par la même similitude si et seulement si B et D donnent le même rapport et le même angle que A et C.")];
    case "dEcran3":
      return [t("La similitude de centre O de rapport k et d'angle θ multiplie les affixes par "), f("k\\cdot e^{i\\theta}=k\\cos\\theta+i\\,k\\sin\\theta"), t(".")];
    default:
      return null;
  }
}

/** Conclusion en phrase pour les verdicts D (l'écran affiche « Cohérent » / « Incohérent »). */
function conclusion(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  if (e.famille === "D" && phase === "dEcran2")
    return e.coherent ? [t("Oui : B et D donnent le même rapport et le même angle, donc la similitude envoie B sur D.")] : [t("Non : B et D donnent un autre rapport ou un autre angle, donc la similitude n'envoie pas B sur D.")];
  return reponse(e, phase);
}

function piege(phase: PhaseTrianglesComplexes): FragmentConsigne[] | null {
  switch (phase) {
    case "aEcran1":
    case "bEcran1":
      return [t("Additionner les modules au lieu de prendre le module de la différence : "), f("|z_B-z_A|\\neq|z_B|-|z_A|"), t(".")];
    case "aEcran2":
    case "bEcran2":
      return [t("Se tromper de sommet principal : c'est le sommet commun aux deux côtés égaux.")];
    case "aEcran3":
    case "bEcran3":
      return [t("Conclure sans comparer le carré du plus grand côté à la somme des carrés des deux autres.")];
    case "bEcran4":
      return [t("Calculer l'arccosinus avec la calculatrice réglée en radians : les angles sont demandés en degrés.")];
    case "cEcran3":
      return [t("Conclure « centre » dès que deux distances sont égales : il faut les trois égales.")];
    case "dEcran2":
      return [t("Ne comparer que les rapports (ou que les angles) : il faut le même rapport et le même angle.")];
    case "eEcran2":
      return [t("Inverser les deux critères : quotient réel → points alignés ; quotient imaginaire pur → droites perpendiculaires.")];
    default:
      return null;
  }
}

function lignesEtape(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes, sousQuestion: string, avecFigure: boolean): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [];
  const m = methode(e, phase);
  if (m) lignes.push({ label: "Méthode", sousQuestion, fragments: m });
  const cl = calcul(e, phase);
  if (cl) lignes.push({ label: "Calcul", sousQuestion, fragments: cl });
  lignes.push({ label: "Conclusion", sousQuestion, fragments: conclusion(e, phase), ...(avecFigure ? { figureHtml: figure(e) } : {}) });
  const p = piege(phase);
  if (p) lignes.push({ label: "Piège", sousQuestion, fragments: p });
  return lignes;
}

/** La figure va APRÈS les verdicts : dernière étape (D : étape 2, le verdict de cohérence). */
function phaseFigure(e: ExerciceTrianglesComplexes): PhaseTrianglesComplexes {
  if (e.famille === "D") return "dEcran2";
  const phases = phasesPourExercice(e);
  return phases[phases.length - 1];
}

function correctionDetaillee(e: ExerciceTrianglesComplexes): EtapeCorrection[] {
  const avecFig = phaseFigure(e);
  return phasesPourExercice(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i], phase === avecFig));
}

function difficulte(e: ExerciceTrianglesComplexes): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
    case "E":
      return 2;
    case "C":
      return 2;
    case "B":
    case "D":
      return 3;
  }
}

function reponseBreve(e: ExerciceTrianglesComplexes): FragmentConsigne[] {
  return enoncePapier(e).reponseBreve ?? reponseFinaleSimple(e);
}

const POIDS: Record<ExerciceTrianglesComplexes["famille"], number[]> = { A: [1.5, 1, 1.5], B: [1, 0.5, 0.5, 2], C: [1, 2, 1], D: [1.5, 1.5, 1], E: [2.5, 1.5] };

function bareme(e: ExerciceTrianglesComplexes): BaremeExercice {
  const phases = phasesPourExercice(e);
  const erreurs = phases.map((phase) => piege(phase)).filter((p): p is FragmentConsigne[] => !!p);
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: conclusion(e, phase), points: POIDS[e.famille][i] })),
    erreursFrequentes: erreurs.map((description) => ({ description, cout: "−1" })),
    reponsesAcceptees: [[t("Longueurs sous forme exacte (radical simplifié ou non)")], ...(e.famille === "B" ? [[t("Angles arrondis au dixième de degré, à 0,1° près")]] : []), [t("Verdict justifié par un calcul : un verdict sans justification ne rapporte pas de point")]],
  };
}

export const adaptateurEvaluationTrianglesComplexes: AdaptateurFeuilleExercices<ExerciceTrianglesComplexes> = {
  titreDocument: "Triangles et nombres complexes — Évaluation",
  nomFichierBase: "triangles-complexes",
  genererInstance: genererExerciceTrianglesComplexes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteTrianglesComplexes),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilTrianglesComplexes,
  // Angles en degrés (loi des cosinus) : calculatrice dans 5 000 tirages sur 5 000.
  calculatriceIndispensable: ["B"],
};
