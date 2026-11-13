import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { ExerciceChoisirModele } from "./types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceChoisirModele } from "./index";
import { expressionModeleLatex, INFOS_CONTEXTE, modeleLatex, nombreLatex, uneSeuleTransformation } from "./modele";
import {
  aidesEcran4,
  CONSIGNE_FAMILLES,
  justificationFamille,
  justificationSens,
  lectureTransformations,
  m,
  QUESTION_ECRAN_1,
  QUESTION_ECRAN_2,
  questionEcran3,
  questionEcran4,
  questionPapierC,
  REFERENCE_LATEX,
  reponseUtilisationLatex,
  situation,
  t,
} from "./textes";
import { construireFigureModele, PALETTE_PAPIER } from "./figure";
import { LIBELLE_CAS_CHOISIR_MODELE, profilChoisirModele } from "./profil";

/**
 * Adaptateur papier de gen69 (« Choisir le bon modèle », `AppChoisirModele.tsx`), au contrat de
 * `.claude/rules/feuilles-evaluations.md`.
 *
 * Processus 3 (transférer) : l'énoncé papier est la situation, la figure et les VRAIES questions
 * d'un problème — a) trouver le modèle, b) s'en servir, c) interpréter un paramètre. Les écrans de
 * guidage (famille, transformations, expression) sont les étapes 1 à 3 du corrigé, toutes couvertes
 * par a) (`etapesParQuestion`). L'écran 5 est un choix fermé à l'écran ; sur papier, c) est une
 * question ouverte et la bonne option sert de réponse attendue.
 *
 * Étapes (lettres du corrigé et du barème, ordre des écrans) : a) famille, b) transformations,
 * c) expression, d) utilisation, e) sens du paramètre. Toutes les valeurs viennent des mêmes
 * fonctions que l'écran (`modele.ts`, `textes.ts`, `figure.ts`).
 */

function figureEnonce(e: ExerciceChoisirModele): string {
  return construireFigureModele(e, { palette: PALETTE_PAPIER, classe: "figure-choisir-modele" });
}

function figureCorrige(e: ExerciceChoisirModele): string {
  return construireFigureModele(e, { palette: PALETTE_PAPIER, annoter: true, classe: "figure-corrige" });
}

function entete(e: ExerciceChoisirModele): FragmentConsigne[] {
  return [...situation(e), t(" "), ...CONSIGNE_FAMILLES];
}

function consigneA(e: ExerciceChoisirModele): FragmentConsigne[] {
  const info = INFOS_CONTEXTE[e.contexte];
  return [t(`Détermine le modèle : exprime ${info.fonction} en fonction de ${info.variable}.`)];
}

/** Étapes d'apprentissage, dans l'ordre des écrans (sous-questions du générateur). */
function construireEnonceChoisirModele(e: ExerciceChoisirModele): SectionExercice {
  return {
    enteteFragments: entete(e),
    enteteHtml: figureEnonce(e),
    questions: [
      { consigne: [t(QUESTION_ECRAN_1)] },
      { consigne: [t(QUESTION_ECRAN_2)] },
      { consigne: questionEcran3(e) },
      { consigne: questionEcran4(e) },
      { consigne: questionPapierC(e) },
    ],
  };
}

function enoncePapierChoisirModele(e: ExerciceChoisirModele): EnoncePapier {
  return {
    section: {
      enteteFragments: entete(e),
      enteteHtml: figureEnonce(e),
      questions: [{ consigne: consigneA(e) }, { consigne: questionEcran4(e) }, { consigne: questionPapierC(e) }],
    },
    etapesParQuestion: [["a", "b", "c"], ["d"], ["e"]],
    reponseBreve: [t("a) "), m(modeleLatex(e)), t(" ; b) "), m(reponseUtilisationLatex(e)), t(" ; c) "), ...sensBref(e)],
  };
}

function sensBref(e: ExerciceChoisirModele): FragmentConsigne[] {
  return e.options5.find((o) => o.correcte)?.fragments ?? [];
}

function construireCorrectionChoisirModele(e: ExerciceChoisirModele): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: justificationFamille(e) },
    { type: "paragraphe", fragments: lectureTransformations(e) },
    { type: "html", html: figureCorrige(e) },
    { type: "paragraphe", fragments: [t("Modèle : "), m(modeleLatex(e)), t(".")] },
    { type: "paragraphe", fragments: [t("Réponse : "), m(reponseUtilisationLatex(e)), t(".")] },
    { type: "paragraphe", fragments: [...sensBref(e), t(" "), ...justificationSens(e)] },
  ];
}

// ---------------------------------------------------------------------------------------------
// Feuilles enrichies
// ---------------------------------------------------------------------------------------------

function difficulteChoisirModele(e: ExerciceChoisirModele): 1 | 2 | 3 {
  if (uneSeuleTransformation(e)) return 1;
  const deuxSolutions = e.question4.type === "resoudre" && e.question4.solutions.length === 2;
  if (e.a < 0 || deuxSolutions) return 3;
  return 2;
}

function reponseBreveChoisirModele(e: ExerciceChoisirModele): FragmentConsigne[] {
  return [
    t("a) "),
    m(REFERENCE_LATEX[e.famille]),
    t(" ; b) "),
    m(`\\text{TH} = ${nombreLatex(e.th)},\\ \\text{TV} = ${nombreLatex(e.tv)},\\ \\text{facteur } ${nombreLatex(Math.abs(e.a))}${e.a < 0 ? "\\text{, symétrie}" : ""}`),
    t(" ; c) "),
    m(modeleLatex(e)),
    t(" ; d) "),
    m(reponseUtilisationLatex(e)),
    t(" ; e) "),
    ...sensBref(e),
  ];
}

/** Calcul de b) en LaTeX (étapes du corrigé). */
function calculUtilisation(e: ExerciceChoisirModele): FragmentConsigne[] {
  const info = INFOS_CONTEXTE[e.contexte];
  const q = e.question4;
  if (q.type === "predire") {
    const substitue = expressionModeleLatex(e, nombreLatex(q.x));
    return [m(`${info.fonction}(${nombreLatex(q.x)}) = ${substitue} = ${nombreLatex(q.y)}`)];
  }
  // Résoudre : l'aide de niveau 2 de l'écran donne déjà l'équation isolée ; on la reprend.
  const equation = `${expressionModeleLatex(e)} = ${nombreLatex(q.y)}`;
  const isolee = aidesEcran4(e)[1].find((f) => f.type === "latex");
  const etapeIsolee = isolee && isolee.valeur !== equation ? [t(" donne "), isolee] : [];
  return [m(equation), ...etapeIsolee, t(", d'où "), m(reponseUtilisationLatex(e)), t(".")];
}

function piege(e: ExerciceChoisirModele): FragmentConsigne[] {
  const v = INFOS_CONTEXTE[e.contexte].variable;
  if (e.th !== 0) {
    return [
      t("Le point caractéristique est en "),
      m(`${v} = ${nombreLatex(e.th)}`),
      t(" : la translation vers la droite s'écrit "),
      m(`(${v}-${nombreLatex(e.th)})`),
      t(", avec un signe « − », et non "),
      m(`(${v}+${nombreLatex(e.th)})`),
      t("."),
    ];
  }
  if (e.famille === "inverse") {
    return [t("Le point caractéristique de l'hyperbole n'est pas sur la courbe : c'est le centre, à l'intersection des asymptotes. Le facteur se lit en comparant un point de la courbe à ce centre.")];
  }
  return [t("Le point caractéristique ne bouge qu'avec les translations : un étirement ne le déplace pas. Ici, seule la translation verticale l'a déplacé.")];
}

function correctionDetailleeChoisirModele(e: ExerciceChoisirModele): EtapeCorrection[] {
  const q = e.question4;
  return [
    { label: "Famille", sousQuestion: "a", fragments: justificationFamille(e) },
    { label: "Lecture", sousQuestion: "b", fragments: lectureTransformations(e), figureHtml: figureCorrige(e) },
    { label: "Conclusion", sousQuestion: "c", fragments: [m(modeleLatex(e))] },
    { label: q.type === "predire" ? "Calcul" : "Équation", sousQuestion: "d", fragments: calculUtilisation(e) },
    { label: "Interprétation", sousQuestion: "e", fragments: [...sensBref(e), t(" "), ...justificationSens(e)] },
    { label: "Piège", fragments: piege(e) },
  ];
}

function baremeChoisirModele(e: ExerciceChoisirModele): BaremeExercice {
  const v = INFOS_CONTEXTE[e.contexte].variable;
  const erreurs: ErreurFrequente[] = [];
  if (e.th !== 0) {
    erreurs.push({ description: [t("Signe de la translation horizontale inversé : "), m(`(${v}+${nombreLatex(e.th)})`), t(" au lieu de "), m(`(${v}-${nombreLatex(e.th)})`)], cout: "0 pt sur b), modèle noté sans double pénalité" });
  }
  if (Math.abs(e.a) !== 1) {
    erreurs.push({ description: [t("Facteur vertical inversé (écart de la référence divisé par l'écart observé) ou lu comme une compression horizontale")], cout: "0 pt sur le facteur" });
  }
  if (e.a < 0) erreurs.push({ description: [t("Symétrie oubliée : la courbe descend alors que la référence monte")], cout: "0 pt sur le facteur" });
  if (e.question4.type === "resoudre" && e.question4.solutions.length === 2) erreurs.push({ description: [t("Une seule des deux solutions donnée")], cout: "0,5 pt sur d)" });
  erreurs.push({ description: [t("Paramètre interprété sans unité, ou dans l'unité de l'autre axe")], cout: "0 pt sur e)" });
  return {
    reponseFinale: [m(modeleLatex(e)), t(" ; "), m(reponseUtilisationLatex(e))],
    criteres: [
      { sousQuestion: "a", critere: [t("Fonction de référence reconnue : "), m(REFERENCE_LATEX[e.famille])], points: 0.5 },
      { sousQuestion: "b", critere: [t("Translations lues au point caractéristique : "), m(`\\text{TH} = ${nombreLatex(e.th)}`), t(", "), m(`\\text{TV} = ${nombreLatex(e.tv)}`)], points: 0.5 },
      { sousQuestion: "b", critere: [t("Facteur vertical et symétrie déduits d'un point marqué")], points: 0.5 },
      { sousQuestion: "c", critere: [t("Modèle complet et correct, dans la variable de la situation")], points: 0.5 },
      { sousQuestion: "d", critere: [t("Modèle utilisé : "), m(reponseUtilisationLatex(e))], points: 1 },
      { sousQuestion: "e", critere: [t("Paramètre interprété dans la situation, avec son unité")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [t("Toute écriture équivalente du modèle (fraction ou décimal, facteur placé dans la parenthèse)")],
      [t("Pour c), toute formulation équivalente de l'interprétation, avec la bonne unité")],
    ],
  };
}

export const adaptateurEvaluationChoisirModele: AdaptateurFeuilleExercices<ExerciceChoisirModele> = {
  profilInstance: profilChoisirModele,
  libelleCasParticulier: LIBELLE_CAS_CHOISIR_MODELE,
  titreDocument: "Choisir le bon modèle — Évaluation",
  nomFichierBase: "choisir-modele",
  genererInstance: genererExerciceChoisirModele,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce: construireEnonceChoisirModele,
  construireCorrection: construireCorrectionChoisirModele,
  difficulte: difficulteChoisirModele,
  reponseBreve: reponseBreveChoisirModele,
  correctionDetaillee: correctionDetailleeChoisirModele,
  bareme: baremeChoisirModele,
  enoncePapier: enoncePapierChoisirModele,
  dureeMinutes: 10,
};
