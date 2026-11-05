import type { Borne, ExerciceInequation, Morceau, SolutionEnsemble } from "../../core/inequation.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatEquationAssocieeLatex, formatInequationLatex } from "../../ui/formatInequation";
import { enonceSimplifie, facteurCommun, necessiteSimplification } from "../../moteur/simplificationInequation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInequation, type VarianteInequationId } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInequation>` pour gen2 (tableau de signes d'un
 * trinôme du second degré, `AppInequation.tsx`).
 *
 * Étapes = les écrans de l'appli (`moteur/sessionInequation.ts`) : simplification (seulement si
 * `necessiteSimplification`, même condition que `phaseInitiale`) → racines de l'équation associée →
 * signe de a → ensemble-solution. Sur papier, ces étapes ne sont PAS des sous-questions : l'énoncé
 * imprimé (`enoncePapier`) ne garde que l'inéquation et la consigne globale, les étapes titrent le
 * corrigé détaillé (voir `.claude/rules/feuilles-evaluations.md`).
 *
 * Toutes les valeurs (delta, racines, a, solution) viennent de l'instance — jamais recalculées
 * indépendamment (voir classification.ts). Après simplification, la suite travaille sur la forme
 * réduite, comme l'écran (`exerciceCourant`) : a, les racines et S sont inchangés (division par un
 * réel positif), Δ est divisé par g².
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Nombre en LaTeX, virgule décimale. */
function nombreLatex(valeur: number): string {
  const brut = Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
  return brut.replace(".", "{,}");
}

function borneLatex(borne: Borne): string {
  if (borne === "-inf") return "-\\infty";
  if (borne === "+inf") return "+\\infty";
  return nombreLatex(borne);
}

function morceauLatex(m: Morceau): string {
  return `${m.crochetGauche}${borneLatex(m.borneGauche)}\\,;\\,${borneLatex(m.borneDroite)}${m.crochetDroit}`;
}

/** Ensemble-solution en LaTeX (accolades littérales, ∅, ℝ). */
function ensembleLatex(solution: SolutionEnsemble): string {
  switch (solution.forme) {
    case "vide":
      return "\\varnothing";
    case "reel":
      return "\\mathbb{R}";
    case "point":
      return `\\left\\{${nombreLatex(solution.valeur)}\\right\\}`;
    case "reel_sauf_point":
      return `\\mathbb{R} \\setminus \\left\\{${nombreLatex(solution.valeur)}\\right\\}`;
    case "intervalle":
      return morceauLatex(solution.morceau);
    case "union":
      return `${morceauLatex(solution.morceau1)} \\cup ${morceauLatex(solution.morceau2)}`;
  }
}

function descriptionSymbole(symbole: ExerciceInequation["symbole"]): string {
  switch (symbole) {
    case "<":
      return "strictement négatif";
    case ">":
      return "strictement positif";
    case "≤":
      return "négatif ou nul";
    case "≥":
      return "positif ou nul";
  }
}

type PhaseInequation = "simplification" | "racines" | "signe_a" | "intervalle";

interface EtapeResolution {
  phase: PhaseInequation;
  consigne: FragmentConsigne[];
  lignes: { label: string; fragments: FragmentConsigne[] }[];
}

function etapesResolution(instance: ExerciceInequation): EtapeResolution[] {
  const { enonce, symbole, delta, racines, solution } = instance;
  const etapes: EtapeResolution[] = [];
  let enonceEffectif = enonce;
  let deltaEffectif = delta;
  if (necessiteSimplification(instance)) {
    const g = facteurCommun(enonce);
    enonceEffectif = enonceSimplifie(enonce);
    deltaEffectif = delta / (g * g);
    etapes.push({
      phase: "simplification",
      consigne: [texte("Simplifie l'inéquation au maximum (coefficients entiers, sans facteur commun).")],
      lignes: [
        {
          label: "Calcul",
          fragments: [
            texte(`Le plus grand commun diviseur de |a|, |b| et |c| vaut ${g}. On divise les deux membres par ${g}, un nombre positif : le sens de l'inégalité ne change pas. `),
            latex(formatInequationLatex(enonceEffectif, symbole)),
          ],
        },
      ],
    });
  }

  const ligneRacines: { label: string; fragments: FragmentConsigne[] }[] = [
    { label: "Méthode", fragments: [texte("On résout l'équation associée "), latex(formatEquationAssocieeLatex(enonceEffectif)), texte(" à l'aide du discriminant.")] },
  ];
  let r1 = 0;
  let r2 = 0;
  if (deltaEffectif < 0) {
    ligneRacines.push({ label: "Conclusion", fragments: [latex(`\\Delta = ${nombreLatex(deltaEffectif)} < 0`), texte(" : aucune racine réelle.")] });
  } else {
    [r1, r2] = [...(racines as [number, number])].sort((x, y) => x - y);
    ligneRacines.push(
      r1 === r2
        ? { label: "Conclusion", fragments: [latex("\\Delta = 0"), texte(" : une racine double, "), latex(`x = ${nombreLatex(r1)}`), texte(".")] }
        : { label: "Conclusion", fragments: [latex(`\\Delta = ${nombreLatex(deltaEffectif)} > 0`), texte(" : deux racines, "), latex(`x_1 = ${nombreLatex(r1)}`), texte(" et "), latex(`x_2 = ${nombreLatex(r2)}`), texte(".")] },
    );
  }
  etapes.push({ phase: "racines", consigne: [texte("Résous l'équation associée "), latex(formatEquationAssocieeLatex(enonceEffectif)), texte(".")], lignes: ligneRacines });

  const aPositif = enonceEffectif.a > 0;
  etapes.push({
    phase: "signe_a",
    consigne: [texte("Donne le signe de a.")],
    lignes: [{ label: "Conclusion", fragments: [latex(`a = ${nombreLatex(enonceEffectif.a)}`), texte(aPositif ? " : a est positif." : " : a est négatif.")] }],
  });

  const signeA = aPositif ? "positif" : "négatif";
  const signeOppose = aPositif ? "négatif" : "positif";
  const regle: FragmentConsigne[] =
    deltaEffectif < 0
      ? [texte(`Sans racine, le trinôme garde le signe de a sur ℝ : il est toujours ${signeA}.`)]
      : r1 === r2
        ? [texte(`Le trinôme s'annule seulement en `), latex(`x = ${nombreLatex(r1)}`), texte(` et a le signe de a partout ailleurs : il est ${signeA} sur `), latex(`\\mathbb{R} \\setminus \\left\\{${nombreLatex(r1)}\\right\\}`), texte(".")]
        : [
            texte(`Le trinôme a le signe de a à l'extérieur des racines et le signe opposé entre elles : ${signeA} pour `),
            latex(`x < ${nombreLatex(r1)}`),
            texte(" ou "),
            latex(`x > ${nombreLatex(r2)}`),
            texte(`, ${signeOppose} pour `),
            latex(`${nombreLatex(r1)} < x < ${nombreLatex(r2)}`),
            texte("."),
          ];
  etapes.push({
    phase: "intervalle",
    consigne: [texte("Donne l'ensemble des solutions de l'inéquation.")],
    lignes: [
      { label: "Méthode", fragments: regle },
      { label: "Conclusion", fragments: [texte(`On garde les x pour lesquels le trinôme est ${descriptionSymbole(symbole)} : `), latex(`S = ${ensembleLatex(solution)}`), texte(".")] },
      {
        label: "Piège",
        fragments:
          deltaEffectif < 0
            ? [texte("Δ < 0 ne veut pas dire « pas de solution » : selon le signe de a et le symbole, S est ℝ tout entier ou vide.")]
            : symbole === "≤" || symbole === "≥"
              ? [texte("Inégalité large : les racines font partie de l'ensemble-solution (crochets fermés).")]
              : [texte("Inégalité stricte : les racines sont exclues (crochets ouverts).")],
      },
    ],
  });
  return etapes;
}

/** Étapes d'apprentissage (une par écran) : titres du corrigé, jamais imprimées dans l'énoncé. */
function construireEnonceInequations(instance: ExerciceInequation): SectionExercice {
  return {
    enteteFragments: [texte("Résous l'inéquation suivante : "), latex(formatInequationLatex(instance.enonce, instance.symbole))],
    questions: etapesResolution(instance).map((e) => ({ consigne: e.consigne })),
  };
}

function enoncePapierInequations(instance: ExerciceInequation): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Résous l'inéquation suivante à l'aide d'un tableau de signes : "), latex(formatInequationLatex(instance.enonce, instance.symbole)), texte(".")],
      questions: [],
    },
  };
}

/** Ancien corrigé (pipelines Word/PDF historiques) : la même résolution, en paragraphes. */
function construireCorrectionInequations(instance: ExerciceInequation): BlocCorrection[] {
  return etapesResolution(instance).flatMap((e) => e.lignes.filter((l) => l.label !== "Piège").map((l): BlocCorrection => ({ type: "paragraphe", fragments: l.fragments })));
}

function correctionDetailleeInequations(instance: ExerciceInequation): EtapeCorrection[] {
  return etapesResolution(instance).flatMap((e, i) => e.lignes.map((l): EtapeCorrection => ({ label: l.label, sousQuestion: LETTRES[i], fragments: l.fragments })));
}

function reponseBreveInequations(instance: ExerciceInequation): FragmentConsigne[] {
  return [latex(`S = ${ensembleLatex(instance.solution)}`)];
}

const POIDS: Record<PhaseInequation, number> = { simplification: 0.5, racines: 1.5, signe_a: 0.5, intervalle: 1.5 };

function baremeInequations(instance: ExerciceInequation): BaremeExercice {
  const etapes = etapesResolution(instance);
  const lettre = (phase: PhaseInequation) => LETTRES[etapes.findIndex((e) => e.phase === phase)];
  const criteres: CritereBareme[] = etapes.map((e, i) => ({
    sousQuestion: LETTRES[i],
    critere:
      e.phase === "simplification"
        ? [texte("Division par le plus grand commun diviseur, sens conservé")]
        : e.phase === "racines"
          ? [texte("Discriminant et racines de l'équation associée")]
          : e.phase === "signe_a"
            ? [texte("Signe de a")]
            : [texte("Ensemble-solution, crochets corrects : "), latex(`S = ${ensembleLatex(instance.solution)}`)],
    points: POIDS[e.phase],
  }));
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Signes intérieur/extérieur des racines inversés")], cout: `0 pt sur ${lettre("intervalle")})` },
    { description: [texte("Crochets ouverts/fermés inversés (inégalité stricte ou large)")], cout: `moitié des points sur ${lettre("intervalle")})` },
  ];
  if (instance.delta < 0) erreurs.push({ description: [texte("Δ < 0 conclu en S = ∅ sans regarder le signe de a")], cout: `0 pt sur ${lettre("intervalle")})` });
  return {
    reponseFinale: [latex(`S = ${ensembleLatex(instance.solution)}`)],
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Ensemble écrit avec des inégalités (par exemple "), latex("x < 1"), texte(" ou "), latex("x > 3"), texte(") ; tableau de signes complet à la place de la phrase de signe")]],
  };
}

/** ★ Δ < 0 ou racine double ; ★★ deux racines ; ★★★ s'il faut d'abord simplifier ou si a < 0
 * avec deux racines (signe opposé à gérer entre les racines). */
function difficulteInequations(instance: ExerciceInequation): 1 | 2 | 3 {
  const deuxRacines = instance.delta > 0;
  if (necessiteSimplification(instance) || (deuxRacines && instance.enonce.a < 0)) return 3;
  return deuxRacines ? 2 : 1;
}

export const adaptateurEvaluationInequations: AdaptateurFeuilleExercices<ExerciceInequation> = {
  titreDocument: "Tableau de signes d'un trinôme du second degré — Évaluation",
  nomFichierBase: "tableau-signes-trinome",
  genererInstance: genererExerciceInequation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteInequationId),
  construireEnonce: construireEnonceInequations,
  construireCorrection: construireCorrectionInequations,
  difficulte: difficulteInequations,
  reponseBreve: reponseBreveInequations,
  correctionDetaillee: correctionDetailleeInequations,
  bareme: baremeInequations,
  enoncePapier: enoncePapierInequations,
  dureeMinutes: 4,
};
