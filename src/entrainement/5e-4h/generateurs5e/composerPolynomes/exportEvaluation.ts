import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceComposerPolynomes } from "../../core5e/composerPolynomes";
import { consigne, fL, gL, phases, polyL, reponse } from "../../ui5e/formatComposerPolynomes";
import type { PhaseComposerPolynomes } from "../../ui5e/formatComposerPolynomes";
import type { Frag } from "../../ui5e/ecransTrigo.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComposerPolynomes } from "./index";
import type { IdVarianteComposerPolynomes } from "./index";
import { correctionDetailleeComposerPolynomes } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen61` « Composer des polynômes ». Énoncé papier : f et g, puis les VRAIES
 * questions distinctes — a) (f∘g)(x) développée (étapes « substitution » et « développement »),
 * b) (g∘f)(x), c) vérification en un point, d) (deux affines) f∘g = g∘f ? Corrigé « comme au
 * tableau » partagé avec l'appli (`corrigeDetaille.ts`), une lettre par écran.
 */

type E = ExerciceComposerPolynomes;
const t = texte;
const f = latex;
const versFrag = (x: Frag[]): FragmentConsigne[] => x.map((y) => (y.type === "texte" ? t(y.valeur) : f(y.valeur)));

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: [t("Soit "), f(fL(e)), t(" et "), f(gL(e)), t(".")], questions: phases(e).map((p) => ({ consigne: versFrag(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const r: FragmentConsigne[] = [t("a) "), f(`(f\\circ g)(x)=${polyL(e.fog)}`), t(" ; b) "), f(`(g\\circ f)(x)=${polyL(e.gof)}`), t(" ; c) "), f(`g(${e.a})=${e.ga}`), t(" et "), f(`(f\\circ g)(${e.a})=${e.fga}`)];
  if (e.variante === "affines") r.push(t(" ; d) "), ...versFrag(reponse(e, "verdict")));
  return r;
}

function enoncePapier(e: E): EnoncePapier {
  const questions = [
    { consigne: [t("Calcule "), f("(f\\circ g)(x)"), t(" sous forme développée et réduite.")] },
    { consigne: [t("Calcule "), f("(g\\circ f)(x)"), t(" sous forme développée et réduite.")] },
    { consigne: [t("Vérifie la valeur de "), f(`(f\\circ g)(${e.a})`), t(" en calculant d'abord "), f(`g(${e.a})`), t(", puis "), f(`f\\big(g(${e.a})\\big)`), t(".")] },
  ];
  const etapes = [["a", "b"], ["c"], ["d"]];
  if (e.variante === "affines") {
    questions.push({ consigne: [t("A-t-on "), f("f\\circ g=g\\circ f"), t(" ? Justifie.")] });
    etapes.push(["e"]);
  }
  return { section: { enteteFragments: [t("Soit "), f(fL(e)), t(" et "), f(gL(e)), t(".")], questions }, etapesParQuestion: etapes, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phases(e).map((p, i) => ({ type: "paragraphe", fragments: [t(`${"abcde"[i]}) `), ...versFrag(reponse(e, p))] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode imposée (substituer puis développer) ; aucun piège dans les données (l'ordre des
  // fonctions est la méthode) ; nombres entiers.
  return { ...etapesDuCorrige(correctionDetailleeComposerPolynomes(e)), methode: 0, piege: 0, nombres: 0 };
}

const LIBELLES: Record<PhaseComposerPolynomes, string> = {
  substitution: "Substitution : x de f remplacé par g(x)",
  fog: "(f∘g)(x) développée et réduite",
  gof: "(g∘f)(x) développée et réduite",
  point: "Vérification étage par étage",
  verdict: "Comparaison justifiée",
};

function poids(e: E, p: PhaseComposerPolynomes): number {
  if (e.variante === "affines") return { substitution: 0.75, fog: 1, gof: 1, point: 0.75, verdict: 0.5 }[p];
  return { substitution: 0.75, fog: 1.25, gof: 1.25, point: 0.75, verdict: 0 }[p];
}

function bareme(e: E): BaremeExercice {
  const carre = e.quadratique === "f" ? "(f∘g)" : e.quadratique === "g" ? "(g∘f)" : null;
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases(e).map((p, i) => ({ sousQuestion: "abcde"[i], critere: [t(`${LIBELLES[p]} : `), ...versFrag(reponse(e, p))], points: poids(e, p) })),
    erreursFrequentes: [
      { description: [t("Ordre inversé : "), f("g\\big(f(x)\\big)"), t(" calculé à la place de "), f("f\\big(g(x)\\big)")], cout: "0 pt sur la substitution, suite notée sans double pénalité" },
      ...(carre ? [{ description: [t(`Double produit oublié dans le carré de ${carre}(x) : `), f("(A+B)^2=A^2+B^2")], cout: "−0,5" }] : []),
      { description: [t("Facteur distribué sur le seul premier terme de la parenthèse")], cout: "−0,5" },
      { description: [t("Forme non réduite (deux termes de même degré)")], cout: "−0,25" },
    ],
    reponsesAcceptees: [[t("Termes dans n'importe quel ordre ; la vérification peut aussi partir de la forme développée, si les deux calculs sont faits")]],
  };
}

/** Aucun cas particulier : le verdict (deux affines) est tiré 50/50 dans la série. `forme` = variante
 * et place de la parabole (structure reproduite d'une série à l'autre) ; tout est exact. */
export function profilComposerPolynomes(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "exacte", forme: e.variante === "affines" ? "affines" : `second-${e.quadratique}` };
}

export const adaptateurEvaluationComposerPolynomes: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Composer des polynômes — Évaluation",
  nomFichierBase: "composer-polynomes",
  genererInstance: genererExerciceComposerPolynomes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteComposerPolynomes),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeComposerPolynomes,
  bareme,
  enoncePapier,
  profilInstance: profilComposerPolynomes,
};
