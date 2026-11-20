import type { ExerciceOptimisation, ExerciceOptimisationModelisation } from "../../core/optimisation.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { consigneEtapeOptimisation, correctionDetailleeOptimisation, etapesOptimisation, lettreEtapeOptimisation, lettresLectureOptimisation, type EtapeGen55 } from "./corrigeDetaille";
import {
  formatDomaineLatex,
  segmentsPhraseEnonce,
} from "../../ui/formatOptimisation";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { croquisOptimisationSvg } from "../croquisPapierSecondDegre";
import { profilOptimisation } from "../profilsEvaluation4eCh1";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceOptimisation } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceOptimisation>` pour gen55 (Problèmes
 * d'optimisation, chapitre 1, `AppOptimisation.tsx`) — feuille d'exercices et évaluation.
 *
 * Écrans : identification de x et y (si l'énoncé ne les nomme pas), relation + grandeur en x et y,
 * système (isoler, substituer, développer), domaine de validité, sommet, décision (le sommet
 * est-il dans le domaine ?), phrase de conclusion — pour une fonction DONNÉE, seulement les trois
 * derniers. Tous sont des étapes de guidage d'UN seul problème : sur papier, l'énoncé est le
 * contexte (avec son croquis), la variable x nommée (l'écran d'identification la fixe, sans quoi le
 * corrigé n'aurait pas de référence commune) et la question finale ; les écrans deviennent les
 * étapes du corrigé.
 *
 * Valeurs : celles de l'instance et des fonctions de l'écran (`consigne*`, `formatIsolementLatex`,
 * `formatGrandeurXYLatex`, `formatDomaineLatex`, phrase de conclusion correcte). Exception : la
 * fonction développée est écrite en valeurs EXACTES (fractions) — l'écran arrondit les coefficients
 * au centième (5/48 affiché « 0,1 » pour la famille « somme répartie en deux »).
 */

/** Nombre exact (entier, décimal court ou fraction irréductible) en LaTeX. */
function nombreLatex(valeur: number): string {
  const brut = formatFractionIrreductible(valeur);
  const m = /^(-?)(\d+)\/(\d+)$/.exec(brut);
  if (m) {
    const d = Number(m[3]);
    // Dénominateur 2, 4, 5, 10… : écriture décimale exacte (« 0,5 »), comme les énoncés.
    if ([2, 4, 5, 10, 20, 25, 50, 100].includes(d)) return String(Math.round(valeur * 100) / 100).replace(".", "{,}");
    return `${m[1]}\\dfrac{${m[2]}}{${m[3]}}`;
  }
  return brut;
}


/** f(x) développée, coefficients exacts. */
function fonctionLatex(e: ExerciceOptimisation): string {
  const v = e.contexte.labelVariable;
  const termes = [
    { c: e.fonction.a, s: `${v}^2` },
    { c: e.fonction.b, s: v },
    { c: e.fonction.c, s: "" },
  ].filter((t) => Math.abs(t.c) > 1e-12);
  return termes
    .map((t, i) => {
      const abs = Math.abs(t.c);
      const corps = abs === 1 && t.s ? t.s : `${nombreLatex(abs)}${t.s}`;
      return i === 0 ? `${t.c < 0 ? "-" : ""}${corps}` : ` ${t.c < 0 ? "-" : "+"} ${corps}`;
    })
    .join("");
}

function nomFonction(e: ExerciceOptimisation): string {
  return `f(${e.contexte.labelVariable})`;
}

function phraseFragments(phrase: string): FragmentConsigne[] {
  return segmentsPhraseEnonce(phrase).map((s) => (s.type === "katex" ? latex(s.valeur) : texte(s.valeur)));
}

function nomY(e: ExerciceOptimisationModelisation): string | undefined {
  return e.identificationXY?.candidatsY[e.identificationXY.indexCorrectY];
}

/** « (en m) » — omis pour une unité de dénombrement déjà dans le nom (« le nombre de bovins »). */
function unite(u: string, nom: string): string {
  return u && !nom.includes(u) ? ` (en ${u})` : "";
}

/** Énoncé commun (papier) : contexte, variable nommée, question finale. */
function enteteEnonce(e: ExerciceOptimisation, avecConsigne: boolean): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = phraseFragments(e.contexte.phraseEnonce);
  if (e.variante === "modelisation" && e.identificationXY) {
    const y = nomY(e);
    fragments.push(texte(` On note ${e.contexte.labelVariable} ${e.contexte.nomVariable}${unite(e.contexte.uniteVariable, e.contexte.nomVariable)}${e.contexte.croquis && y ? ` et ${e.contrainte.lettreCherchee} ${y}` : ""}.`));
  }
  if (!avecConsigne) return fragments;
  const atteint = e.contexte.genreGrandeur === "feminin" ? "est-elle atteinte" : "est-il atteint";
  fragments.push(texte(` ${e.contexte.questionFinale ?? "Quelle est la valeur optimale ?"} Pour quelle valeur de ${e.contexte.labelVariable} ${atteint} ?`));
  if (e.variante === "modelisation") fragments.push(texte(` Justifie en exprimant la grandeur à optimiser en fonction de ${e.contexte.labelVariable} et en précisant le domaine de validité.`));
  return fragments;
}

function construireEnonceOptimisation(e: ExerciceOptimisation): SectionExercice {
  return {
    enteteFragments: enteteEnonce(e, false),
    enteteHtml: croquisOptimisationSvg(e.contexte.croquis),
    questions: etapesOptimisation(e).map((etape) => ({ consigne: consigneEtapeOptimisation(e, etape) })),
  };
}

function enoncePapierOptimisation(e: ExerciceOptimisation): EnoncePapier {
  return { section: { enteteFragments: enteteEnonce(e, true), enteteHtml: croquisOptimisationSvg(e.contexte.croquis), questions: [] } };
}

function phraseConclusion(e: ExerciceOptimisation): string {
  return e.optionsInterpretation.find((o) => o.correcte)?.texte ?? "";
}

function construireCorrectionOptimisation(e: ExerciceOptimisation): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [latex(`${nomFonction(e)} = ${fonctionLatex(e)}`), texte(" ; "), latex(formatDomaineLatex(e.domaine, e.contexte.labelVariable))] },
    { type: "paragraphe", fragments: [texte(phraseConclusion(e))] },
  ];
}


function reponseBreveOptimisation(e: ExerciceOptimisation): FragmentConsigne[] {
  return [texte(phraseConclusion(e))];
}

function baremeOptimisation(e: ExerciceOptimisation): BaremeExercice {
  const L = (etape: EtapeGen55) => lettreEtapeOptimisation(e, etape);
  const v = e.contexte.labelVariable;
  const criteres: CritereBareme[] =
    e.variante === "modelisation"
      ? [
          { sousQuestion: L("relation"), critere: [texte("Relation entre les variables et grandeur exprimée : "), latex(e.contrainte.enonceLatex)], points: 1 },
          { sousQuestion: L("systeme"), critere: [texte("Fonction développée : "), latex(`${nomFonction(e)} = ${fonctionLatex(e)}`)], points: 0.5 },
          { sousQuestion: L("domaine"), critere: [texte("Domaine de validité : "), latex(formatDomaineLatex(e.domaine, v))], points: 0.5 },
          { sousQuestion: L("sommet"), critere: [texte("Sommet : "), latex(`${v}_S = ${nombreLatex(e.sommet.x)}`), texte(", "), latex(`f(${v}_S) = ${nombreLatex(e.sommet.y)}`)], points: 1 },
          { sousQuestion: L("decision"), critere: [texte(e.sommetDansDomaine ? "Sommet dans le domaine vérifié" : "Sommet hors du domaine, comparaison aux bornes")], points: 0.5 },
          { sousQuestion: L("conclusion"), critere: [texte("Conclusion rédigée avec l'unité et la valeur de la variable")], points: 0.5 },
        ]
      : [
          { sousQuestion: L("sommet"), critere: [texte("Sommet : "), latex(`${v}_S = ${nombreLatex(e.sommet.x)}`), texte(", "), latex(`f(${v}_S) = ${nombreLatex(e.sommet.y)}`)], points: 1.5 },
          { sousQuestion: L("decision"), critere: [texte(e.sommetDansDomaine ? "Sommet dans le domaine vérifié, optimum au sommet" : "Sommet hors du domaine, valeurs aux bornes comparées")], points: 1.5 },
          { sousQuestion: L("conclusion"), critere: [texte("Conclusion rédigée avec l'unité et la valeur de la variable")], points: 1 },
        ];
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Valeur de la variable et valeur optimale confondues dans la conclusion")], cout: "0 pt sur la conclusion" },
    { description: [texte("Unité de la grandeur oubliée ou fausse")], cout: "−0,5" },
  ];
  if (!e.sommetDansDomaine) erreurs.unshift({ description: [texte("Optimum lu au sommet alors qu'il est hors du domaine")], cout: "0 pt sur la décision et la conclusion" });
  if (e.variante === "modelisation") erreurs.push({ description: [texte("Erreur de développement après substitution")], cout: "−0,5, suite notée sans double pénalité" });
  return {
    reponseFinale: [texte(phraseConclusion(e))],
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Sommet obtenu par la forme canonique ou par la symétrie des racines plutôt qu'avec la formule de l'abscisse")], [texte("Autre choix d'inconnue, si la modélisation est cohérente et la conclusion juste")]],
  };
}

/** Critères du niveau : étapes = écrans du corrigé ; lectures : identification de x et y, phrase de
 * conclusion (choix fermés) ; méthode 2 en modélisation (l'élève construit le modèle), 1 pour une
 * fonction donnée (décider sommet ou borne) ; piège constant 0 : le sommet hors du domaine est le
 * VERDICT de l'écran « décision » (il ne doit pas transparaître dans le niveau). */
function criteresDifficulteOptimisation(e: ExerciceOptimisation): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeOptimisation(e), lettresLectureOptimisation(e)), methode: e.variante === "modelisation" ? 2 : 1, piege: 0 };
}

export const adaptateurEvaluationOptimisation: AdaptateurFeuilleExercices<ExerciceOptimisation> = {
  profilInstance: profilOptimisation,
  titreDocument: "Problèmes d'optimisation — Évaluation",
  nomFichierBase: "optimisation-second-degre",
  genererInstance: genererExerciceOptimisation,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as (typeof CATALOGUE_FAMILLES)[number]["id"]),
  construireEnonce: construireEnonceOptimisation,
  construireCorrection: construireCorrectionOptimisation,
  criteresDifficulte: criteresDifficulteOptimisation,
  reponseBreve: reponseBreveOptimisation,
  correctionDetaillee: correctionDetailleeOptimisation,
  bareme: baremeOptimisation,
  enoncePapier: enoncePapierOptimisation,
};
