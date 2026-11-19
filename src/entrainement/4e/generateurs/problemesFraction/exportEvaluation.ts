import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceProblemesFraction } from "../../core/problemesFraction.types";
import { equationLatex, recit } from "../../ui/formatProblemesFraction";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceProblemesFraction } from "./index";
import { profilProblemesFraction } from "./profil";
import { correctionDetailleeProblemesFraction } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen119 (problèmes avec une fraction). Énoncé
 * papier = la situation et sa question, avec la consigne globale ; les cinq écrans (équation, CE,
 * résolution, rejet, réponse) sont des étapes d'apprentissage, qui vont dans le corrigé
 * (« Étape n — … »). Séries équilibrées : `profil.ts`.
 */

const CONSIGNE_PAPIER = "Résous ce problème : choisis l'inconnue, mets le problème en équation, pose la condition d'existence, résous l'équation, puis réponds par une phrase.";

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function donneesHtml(e: ExerciceProblemesFraction): string {
  const r = recit(e);
  return `<p class="paragraphe">${echapper(r.phrases.join(" "))}</p><p class="paragraphe"><strong>${echapper(r.question)}</strong></p>`;
}

function construireEnonce(e: ExerciceProblemesFraction): SectionExercice {
  const r = recit(e);
  const consignes: FragmentConsigne[][] = [
    [texte(`On note x ${r.inconnue}. Écris l'équation qui traduit la situation.`)],
    [texte("Écris la condition d'existence de l'équation.")],
    [texte("Résous l'équation.")],
    [texte("Garde les valeurs qui respectent la CE et le contexte.")],
    [texte("Réponds à la question par une phrase.")],
  ];
  return { enteteFragments: [texte(CONSIGNE_PAPIER)], enteteHtml: donneesHtml(e), questions: consignes.map((consigne) => ({ consigne })) };
}

function reponseBreve(e: ExerciceProblemesFraction): FragmentConsigne[] {
  return [texte(recit(e).phraseReponse)];
}

function enoncePapier(e: ExerciceProblemesFraction): EnoncePapier {
  return { section: { enteteFragments: [texte(CONSIGNE_PAPIER)], enteteHtml: donneesHtml(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: ExerciceProblemesFraction): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("Équation : "), latex(equationLatex(e))] },
    { type: "paragraphe", fragments: reponseBreve(e) },
  ];
}

function bareme(e: ExerciceProblemesFraction): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Équation correcte (chaque grandeur traduite avec x)")], points: 1 },
      { sousQuestion: "b", critere: [texte("Condition d'existence (deux valeurs interdites)")], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Multiplication par le dénominateur commun et résolution du second degré")], points: 1.5 },
      { sousQuestion: "d", critere: [texte("Valeur rejetée par le contexte, avec la raison")], points: 0.5 },
      { sousQuestion: "e", critere: [texte("Réponse à la question posée, avec l'unité")], points: 0.5 },
    ],
    erreursFrequentes: [
      {
        description: [
          texte(
            e.variante === "prix"
              ? "Différence des prix dans le mauvais sens"
              : e.variante === "trajet"
                ? "Durée laissée en heures-minutes décimales (3,30 pour 3 h 30 min) ou moyenne des vitesses"
                : "Durées additionnées au lieu des fractions du travail",
          ),
        ],
        cout: "0 pt sur l'étape 1",
      },
      { description: [texte("Racine négative (ou vitesse au retour négative) gardée")], cout: "−0,5" },
      ...(e.forme === "deduite" ? [{ description: [texte("Réponse donnée par la valeur de x au lieu de la grandeur demandée")], cout: "−0,5" }] : []),
    ],
    reponsesAcceptees: [[texte("Toute équation équivalente (par exemple obtenue en réduisant d'abord au même dénominateur)")]],
  };
}

/** Niveau (grille commune) : cinq écrans qui transforment ; méthode 2 (l'élève construit le modèle
 * rationnel) ; piège dans les données : une racine est à rejeter par le contexte. */
function criteresDifficulte(e: ExerciceProblemesFraction): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeProblemesFraction(e)), methode: 2, piege: 1 };
}

export const adaptateurEvaluationProblemesFraction: AdaptateurFeuilleExercices<ExerciceProblemesFraction> = {
  profilInstance: profilProblemesFraction,
  titreDocument: "Problèmes avec une fraction — Évaluation",
  nomFichierBase: "problemes-fraction",
  genererInstance: genererExerciceProblemesFraction,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVariante(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeProblemesFraction,
  bareme,
  enoncePapier,
};
