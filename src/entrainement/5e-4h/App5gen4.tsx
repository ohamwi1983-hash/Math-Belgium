import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_RESTREINTE, construireAvecRestreinte, genererExerciceComposeeGraphique } from "./generateurs5e/composeeGraphique";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_RESTREINTE = [
  { id: "f", label: "Domaine restreint sur f" },
  { id: "g", label: "Domaine restreint sur g" },
];
import {
  activerAideSuivante,
  demarrerSessionComposeeGraphique,
  niveauAideMaxQuestion,
  soumettreReponseQuestion,
} from "./moteur5e/sessionComposeeGraphique";
import type { EtatSessionComposeeGraphique } from "./moteur5e/typesComposeeGraphique";
import type { QuestionComposeeGraphique } from "./core5e/composeeGraphique.types";
import { diagnostiquerReponseQuestion } from "./moteur5e/verificationComposeeGraphique";
import type { ReponseQuestionComposeeGraphique } from "./moteur5e/verificationComposeeGraphique";
import { PaireGraphesComposeeGraphique } from "./components5e/PaireGraphesComposeeGraphique";
import { EtapeQuestionComposeeGraphique } from "./components5e/EtapeQuestionComposeeGraphique";
import { nomInterne, texteResultat } from "./ui5e/formatComposeeGraphique";
import { calculerRecapitulatifComposeeGraphique } from "./ui5e/recapitulatifComposeeGraphique";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionComposeeGraphique {
  return demarrerSessionComposeeGraphique(REGLAGES_DEMO, genererExerciceComposeeGraphique);
}

/** `?code=` (QR code des feuilles) : rouvre EXACTEMENT l'instance imprimée — même catalogue et mêmes
 * fonctions de génération que l'adaptateur des feuilles (`composeeGraphique/exportEvaluation.ts`). */
function sessionInitiale(): EtatSessionComposeeGraphique {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionComposeeGraphique(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_RESTREINTE, genererExerciceComposeeGraphique, (id) => construireAvecRestreinte(id as "f" | "g")),
  );
}


/** Une puce par question de l'exercice courant — "courante" pour `indexQuestion`, "correcte"/"revele"
 * pour les questions déjà closes (`resultatsQuestionsExercice`, un élément par question close, dans
 * l'ordre), "a-venir" au-delà. */
function calculerSegmentsProgression(
  etat: EtatSessionComposeeGraphique,
  aideUtiliseeParQuestion: Partial<Record<number, boolean>>,
): EtatPuceProgression[] {
  return etat.exerciceCourant.questions.map((_, index) => {
    if (index === etat.indexQuestion) return "courante";
    const resultat = etat.resultatsQuestionsExercice[index];
    if (resultat === undefined) return "a-venir";
    if (resultat.revele) return "revele";
    return aideUtiliseeParQuestion[index] ? "aide" : "correcte";
  });
}

/** Réponse de l'élève rédigée comme la réponse attendue (« f(g(−7)) n'existe pas », « f(g(−7)) = 3 »). */
function formatReponseQuestionTexte(question: QuestionComposeeGraphique, reponse: ReponseQuestionComposeeGraphique): string {
  return texteResultat(question, reponse.resultatExiste ? (reponse.resultatValeur ?? "?").replace(/-/g, "−") : null);
}

/** État tenu en attente dès qu'une question se termine (bonne réponse, ou tentatives épuisées) —
 * l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionComposeeGraphique;
  revele: boolean;
}

export function App5gen4() {
  const [etat, setEtat] = useState<EtatSessionComposeeGraphique>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des questions déjà closes (puces cliquables de
   * `ProgressionPuces`) — tenu ICI, à part de `EtatSessionComposeeGraphique`, jamais dans le moteur
   * (même principe que `AppAnalyseFonction.tsx`, 4e). Remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParQuestion, setAideUtiliseeParQuestion] = useState<Partial<Record<number, boolean>>>({});
  /** Incrémenté à chaque nouvel exercice (« Générer », « Nouvel exercice ») : entre dans la `key` de
   * l'écran pour vider choix et champ — `indexQuestion` seul valait 0 avant et après. */
  const [generation, setGeneration] = useState(0);

  /** Réutilise `calculerRecapitulatifComposeeGraphique` (même mécanisme que `RecapitulatifPanel`)
   * pour la réponse ATTENDUE : la question qui vient de se clore est toujours la DERNIÈRE entrée du
   * tableau, les questions se closent dans l'ordre. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionComposeeGraphique) {
    const recap = calculerRecapitulatifComposeeGraphique(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      { titre: derniere.libelle, votreReponse, correcte: !derniere.revele, reponseAttendue: derniere.revele ? derniere.valeur : undefined },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT poussée dans l'historique quand la question se clôt RÉELLEMENT
   * (même garde `transitionDEcran` que celui qui déclenche déjà `setEnAttente`). Contrairement aux
   * générateurs à phases nommées fixes, PAS de garde "dernière question jamais poussée" ici :
   * `calculerRecapitulatifComposeeGraphique` lit `nouvelEtat.resultatsQuestionsExercice`, qui reste
   * peuplé même quand `nouvelEtat.terminee` devient vrai (contrairement à `scoresPartiels`, remis à
   * `{}` ailleurs) — la dernière question EST donc visible, correctement, jusqu'au prochain
   * exercice (où `historique` est de toute façon remis à vide). */
  function terminerEtape(nouvelEtat: EtatSessionComposeeGraphique, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.indexQuestion !== etat.indexQuestion || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setAideUtiliseeParQuestion((m) => ({ ...m, [etat.indexQuestion]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      const resultatsQuestionsATerme = nouvelEtat.terminee
        ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1].resultatsQuestions
        : nouvelEtat.resultatsQuestionsExercice;
      const revele = resultatsQuestionsATerme[resultatsQuestionsATerme.length - 1].revele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setGeneration((g) => g + 1);
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeParQuestion({});
      setFicheOuverteIndex(null);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setGeneration((g) => g + 1);
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParQuestion({});
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionComposeeGraphique(REGLAGES_DEMO, () => construireAvecRestreinte(id as "f" | "g")));
  }

  const exercice = etat.exerciceCourant;
  const question = exercice.questions[etat.indexQuestion];
  const niveauAideMax = niveauAideMaxQuestion(question);
  // Aide niveau 2 (E.7) : révèle le point (a;bAttendu) sur le graphe de la fonction INTERNE.
  const pointRevele = etat.niveauAide >= 2 ? { fonction: nomInterne(question.composition), point: { x: question.a, y: question.bAttendu } } : null;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <span>{texteResultat(question, question.resultatAttendu)}</span>,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Composée de fonctions — lecture graphique</h1>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideUtiliseeParQuestion)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
      </header>
      <SelecteurVarianteDev options={OPTIONS_RESTREINTE} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifComposeeGraphique(etat)} />
          <p className="prompt-text">
            Question {etat.indexQuestion + 1}/{exercice.questions.length}
          </p>
          <EtapeQuestionComposeeGraphique
            key={`${generation}-${etat.indexQuestion}`}
            question={question}
            donnees={<PaireGraphesComposeeGraphique exercice={exercice} pointRevele={pointRevele} />}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) =>
              terminerEtape(
                soumettreReponseQuestion(etat, reponse),
                <>{formatReponseQuestionTexte(question, reponse)}</>,
              )
            }
            diagnostiquer={(reponse) => diagnostiquerReponseQuestion(question, reponse)}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
