import type { ExerciceFormeTrigonometrique } from "../../core6e/formeTrigonometrique.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  LIBELLE_CONDITION,
  assembleAPlusBI,
  assembleValeurExacteAPlusBI,
  blocDonnees,
  congruenceLatex,
  consigneEcran,
  formatReponseAttenduePhaseLatex,
} from "../../ui6e/formatFormeTrigonometrique";
import { phasesPourExercice } from "../../moteur6e/typesFormeTrigonometrique";
import type { PhaseFormeTrigonometrique } from "../../moteur6e/typesFormeTrigonometrique";
import { avecFractionsNormalisees, } from "../../ui6e/papierComplexes";
import { LIBELLE_CAS_FORME_TRIGONOMETRIQUE, profilFormeTrigonometrique } from "../profilsEvaluationComplexes37-39";
import { correctionDetailleeFormeTrigonometrique, piegeEtape as piege } from "./corrigeDetaille";
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

/** Lignes du récapitulatif de l'écran en fragments : `\text{, }` et `\text{ ;}` deviennent du texte. */
function reponse(e: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): FragmentConsigne[] {
  const morceaux = formatReponseAttenduePhaseLatex(e, phase).flatMap((l) => l.replace(/\\text\{ ;\}$/, "").replace(/^n=0\+/, "n=").split("\\text{, }"));
  const sortie = morceaux.flatMap((m, i) => (i === 0 ? [f(m)] : [t(" ; "), f(m)]));
  if (e.famille === "C" && phase === "cEcran3") return [f(`z^{${e.n}}=${morceaux[0]}`)];
  return sortie;
}

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

const correctionDetaillee = correctionDetailleeFormeTrigonometrique;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceFormeTrigonometrique): CriteresDifficulte {
  const [methode, piege]: [0 | 1, 0 | 1] =
    e.famille === "A" ? [0, e.a.numerique < 0 ? 1 : 0] : e.famille === "B" ? [0, e.sousType === "quotient" ? 1 : 0] : e.famille === "D" ? [1, 1] : [0, 0];
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode, piege, anglesEnPi: true };
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
    .filter((p): p is FragmentConsigne[] => !!p)
    .map((p) => ({ description: p, cout: "−1" }));
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
  criteresDifficulte: avecFractionsNormalisees(criteresDifficulte),
  reponseBreve: avecFractionsNormalisees(reponseBreve),
  correctionDetaillee: avecFractionsNormalisees(correctionDetaillee),
  bareme: avecFractionsNormalisees(bareme),
  enoncePapier: avecFractionsNormalisees(enoncePapier),
  profilInstance: profilFormeTrigonometrique,
  libelleCasParticulier: LIBELLE_CAS_FORME_TRIGONOMETRIQUE,
};
