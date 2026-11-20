import type { CompositionDirigee, ExerciceComposerFonctions } from "../../core5e/composerFonctions.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatEnsembleReelLatex } from "../../ui5e/formatDomaineDefinition";
import { consigneC1, consigneC2, consigneConditions, consigneDomaine, consigneFormule } from "../../ui5e/formatComposerFonctions";
import { ordreComplet } from "../../moteur5e/typesComposerFonctions";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { profilComposerFonctions } from "../profilsEvaluationFonctions3-4";
import { CATALOGUE_COMBOS, construireAvecComboSensTire, genererExerciceComposerFonctions } from "./index";
import { composeeLatex, correctionDetailleeComposerFonctions, lettresComposee, signeDevantFraction } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComposerFonctions>` pour 5gen3 (composer f et g —
 * expression et domaine) — feuille d'exercices et évaluation (méthode :
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = les deux fonctions et la consigne globale « Détermine l'expression simplifiée de
 * (f∘g)(x) et son domaine de définition » (les deux composées si le sens tiré est « les deux »). Les
 * ÉCRANS du générateur (`ordreComplet` : formule, puis conditions / c1 / c2 pour une intérieure à
 * racine, puis domaine — consignes de l'écran) sont les étapes « Étape n » du corrigé détaillé
 * (`corrigeDetaille.ts`, partagé avec App5gen3).
 *
 * Variante forcée = combinaison de familles, sens tiré (`construireAvecComboSensTire`) — la même
 * fonction que le `?code=` de l'appli (App5gen3.tsx), qui rouvre l'instance imprimée.
 */

function directionsActives(exercice: ExerciceComposerFonctions): CompositionDirigee[] {
  return [exercice.fRondG, exercice.gRondF].filter((d): d is CompositionDirigee => d !== null);
}

function nomExterieure(dir: CompositionDirigee): "f" | "g" {
  return dir.nomInterieure === "f" ? "g" : "f";
}

function domaineComposeeLatex(dir: CompositionDirigee): string {
  return `\\operatorname{dom}(${nomExterieure(dir)}\\circ ${dir.nomInterieure}) = ${formatEnsembleReelLatex(dir.domaine)}`;
}

function entete(exercice: ExerciceComposerFonctions): FragmentConsigne[] {
  return [texte("Soient les fonctions "), latex(exercice.f.latex), texte(" et "), latex(exercice.g.latex), texte(".")];
}

/** Une question par ÉCRAN (ordre du moteur), consigne de l'écran. */
function construireEnonceComposerFonctions(exercice: ExerciceComposerFonctions): SectionExercice {
  const questions: QuestionExercice[] = ordreComplet(exercice).map((phase) => {
    const dir = (phase.endsWith("FRondG") ? exercice.fRondG : exercice.gRondF)!;
    const consigne = phase.startsWith("formule")
      ? consigneFormule(dir)
      : phase.startsWith("conditions")
        ? consigneConditions(dir)
        : phase.startsWith("c1")
          ? consigneC1(dir)
          : phase.startsWith("c2")
            ? consigneC2(dir)
            : consigneDomaine(dir);
    return { consigne: [texte(consigne)] };
  });
  return { enteteFragments: entete(exercice), questions };
}

function enoncePapierComposerFonctions(exercice: ExerciceComposerFonctions): EnoncePapier {
  const dirs = directionsActives(exercice);
  const consigne: FragmentConsigne[] =
    dirs.length === 2
      ? [texte(" Détermine l'expression simplifiée de "), latex(composeeLatex(dirs[0]!)), texte(" et de "), latex(composeeLatex(dirs[1]!)), texte(", ainsi que leurs domaines de définition.")]
      : [texte(" Détermine l'expression simplifiée de "), latex(composeeLatex(dirs[0]!)), texte(" et son domaine de définition.")];
  return { section: { enteteFragments: [...entete(exercice), ...consigne], questions: [] } };
}

function reponseBreveComposerFonctions(exercice: ExerciceComposerFonctions): FragmentConsigne[] {
  return directionsActives(exercice).flatMap((dir, i) => [
    ...(i > 0 ? [texte(" ; ")] : []),
    latex(`${composeeLatex(dir)} = ${signeDevantFraction(dir.latex)}`),
    texte(", "),
    latex(domaineComposeeLatex(dir)),
  ]);
}

function piegeDomaine(dir: CompositionDirigee): string {
  return `Le domaine ne se lit pas sur l'expression simplifiée : une valeur interdite pour ${dir.nomInterieure} reste interdite pour la composée, même si elle disparaît après simplification.`;
}

function baremeComposerFonctions(exercice: ExerciceComposerFonctions): BaremeExercice {
  const lettres = lettresComposee(exercice);
  const deux = lettres.length === 2;
  const criteres: CritereBareme[] = lettres.flatMap(({ dir, formule, domaine, c2 }) => {
    const nom = `${nomExterieure(dir)}∘${dir.nomInterieure}`;
    const c = (sousQuestion: string, t: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(t)], points });
    return deux
      ? [c(formule, `Expression de ${nom} substituée et simplifiée`, 1), c(c2 ?? domaine, `Les deux conditions posées et résolues pour ${nom}`, 0.5), c(domaine, `Domaine de ${nom} (intersection)`, 0.5)]
      : [
          c(formule, `Expression de ${nom} substituée et simplifiée`, 1.5),
          c(c2 ?? domaine, `Conditions : x dans le domaine de ${dir.nomInterieure}, et ${dir.nomInterieure}(x) dans le domaine de ${nomExterieure(dir)}, résolues`, 1.5),
          c(domaine, `Domaine de ${nom} (intersection)`, 1),
        ];
  });
  const dirs = directionsActives(exercice);
  return {
    reponseFinale: reponseBreveComposerFonctions(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte(piegeDomaine(dirs[0]!))], cout: "−1" },
      { description: [texte("Composition dans le mauvais ordre (f(g(x)) et g(f(x)) confondus)")], cout: "0 pt sur l'expression" },
    ],
    reponsesAcceptees: [[texte("Toute écriture équivalente de l'expression simplifiée ; le domaine écrit comme réunion d'intervalles ou comme ℝ privé de valeurs.")]],
  };
}

/** Critères du niveau (grille commune), jugés sur l'énoncé papier : tous les écrans transforment
 * (substituer et simplifier, poser et résoudre les conditions, intersecter) — aucune lecture ;
 * méthode 1 (choisir comment traiter chaque condition : quotient par tableau de signes, élévation au
 * carré, zones de signe) ; piège dans les données : valeur interdite de l'intérieure qui disparaît
 * de l'expression simplifiée, ou racine sur fraction (signe du dénominateur avant d'élever au carré) ;
 * nombres 0 (valeurs exactes). */
function criteresDifficulteComposerFonctions(exercice: ExerciceComposerFonctions): CriteresDifficulte {
  const dirs = directionsActives(exercice);
  const piege: 0 | 1 = dirs.some((d) => d.interieure.fonction.type === "racineSurFraction" || d.interieure.fonction.type === "rationnelle") ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeComposerFonctions(exercice)), methode: 1, piege, nombres: 0 };
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, sans le piège. */
function construireCorrectionComposerFonctions(exercice: ExerciceComposerFonctions): BlocCorrection[] {
  return correctionDetailleeComposerFonctions(exercice)
    .filter((l) => l.type !== "piege")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationComposerFonctions: AdaptateurFeuilleExercices<ExerciceComposerFonctions> = {
  titreDocument: "Composer f et g — Évaluation",
  nomFichierBase: "composer-fonctions",
  genererInstance: genererExerciceComposerFonctions,
  catalogueVariantes: CATALOGUE_COMBOS,
  genererInstanceAvecVariante: (id) => construireAvecComboSensTire(id),
  construireEnonce: construireEnonceComposerFonctions,
  construireCorrection: construireCorrectionComposerFonctions,
  criteresDifficulte: criteresDifficulteComposerFonctions,
  reponseBreve: reponseBreveComposerFonctions,
  correctionDetaillee: correctionDetailleeComposerFonctions,
  bareme: baremeComposerFonctions,
  enoncePapier: enoncePapierComposerFonctions,
  profilInstance: profilComposerFonctions,
  regroupable: false,
};
