import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { construireAvecRestreinte, genererExerciceComposeeGraphique } from "./generateurs5e/composeeGraphique";
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
import { diagnostiquerReponseQuestion } from "./moteur5e/verificationComposeeGraphique";
import { PaireGraphesComposeeGraphique } from "./components5e/PaireGraphesComposeeGraphique";
import { EtapeQuestionComposeeGraphique } from "./components5e/EtapeQuestionComposeeGraphique";
import { labelChampResultat, nomInterne } from "./ui5e/formatComposeeGraphique";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionComposeeGraphique {
  return demarrerSessionComposeeGraphique(REGLAGES_DEMO, genererExerciceComposeeGraphique);
}

function formatResultatAttendu(resultatAttendu: number | null): string {
  return resultatAttendu === null ? "n'existe pas" : String(resultatAttendu);
}

/** État tenu en attente dès qu'une question se termine (bonne réponse, ou tentatives épuisées) —
 * l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionComposeeGraphique;
  revele: boolean;
}

export function App5gen4() {
  const [etat, setEtat] = useState<EtatSessionComposeeGraphique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionComposeeGraphique) {
    const transitionDEcran = nouvelEtat.indexQuestion !== etat.indexQuestion || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
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
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
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
        reponseAttendue: (
          <span>
            {labelChampResultat(question)} {formatResultatAttendu(question.resultatAttendu)}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Composée de fonctions — lecture graphique</h1>
      </header>
      <SelecteurVarianteDev options={OPTIONS_RESTREINTE} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <p className="prompt-text">
            Question {etat.indexQuestion + 1}/{exercice.questions.length}
          </p>
          <EtapeQuestionComposeeGraphique
            key={etat.indexQuestion}
            question={question}
            donnees={<PaireGraphesComposeeGraphique exercice={exercice} pointRevele={pointRevele} />}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseQuestion(etat, reponse))}
            diagnostiquer={(reponse) => diagnostiquerReponseQuestion(question, reponse)}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
