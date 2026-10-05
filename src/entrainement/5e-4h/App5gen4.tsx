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
import type { EtatSessionComposeeGraphique, ResultatExerciceComposeeGraphique } from "./moteur5e/typesComposeeGraphique";
import { diagnostiquerReponseQuestion } from "./moteur5e/verificationComposeeGraphique";
import { PaireGraphesComposeeGraphique } from "./components5e/PaireGraphesComposeeGraphique";
import { EtapeQuestionComposeeGraphique } from "./components5e/EtapeQuestionComposeeGraphique";
import { ResultatPanelComposeeGraphique } from "./components5e/ResultatPanelComposeeGraphique";
import { ResumeSessionComposeeGraphique } from "./components5e/ResumeSessionComposeeGraphique";
import { nomInterne } from "./ui5e/formatComposeeGraphique";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionComposeeGraphique {
  return demarrerSessionComposeeGraphique(REGLAGES_DEMO, genererExerciceComposeeGraphique);
}

interface Bilan {
  resultat: ResultatExerciceComposeeGraphique;
  /** Niveau d'aide utilisé PAR QUESTION — capturé côté présentation (`etat.niveauAide` juste avant
   * chaque soumission qui clôture une question), puisque `ResultatQuestionComposeeGraphique` ne le
   * porte pas lui-même. Même index que `resultat.resultatsQuestions`, consommé par `statutRecap`
   * dans `ResultatPanelComposeeGraphique` (même convention que 5gen1/5gen2). */
  niveauAidesQuestions: number[];
}

export function App5gen4() {
  const [etat, setEtat] = useState<EtatSessionComposeeGraphique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [niveauAidesQuestions, setNiveauAidesQuestions] = useState<number[]>([]);

  function terminerEtape(nouvelEtat: EtatSessionComposeeGraphique) {
    // Une question est résolue soit quand on passe à la question suivante du même exercice, soit
    // quand on clôture le dernier exercice (indexQuestion est alors réinitialisé à 0 par
    // `etatInitialExercice`/`cloturerExerciceOuSuivant`) — dans les deux cas, capturer le niveau
    // d'aide qui était actif juste avant CETTE soumission.
    const questionResolue = nouvelEtat.indexQuestion !== etat.indexQuestion || nouvelEtat.resultats.length > etat.resultats.length;
    const aidesMaJour = questionResolue ? [...niveauAidesQuestions, etat.niveauAide] : niveauAidesQuestions;

    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], niveauAidesQuestions: aidesMaJour });
      setNiveauAidesQuestions([]);
    } else {
      setNiveauAidesQuestions(aidesMaJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const question = exercice.questions[etat.indexQuestion];
  const niveauAideMax = enCoursDeSession ? niveauAideMaxQuestion(question) : 0;
  // Aide niveau 2 (E.7) : révèle le point (a;bAttendu) sur le graphe de la fonction INTERNE.
  const pointRevele =
    enCoursDeSession && etat.niveauAide >= 2 ? { fonction: nomInterne(question.composition), point: { x: question.a, y: question.bAttendu } } : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Composée de fonctions — lecture graphique</h1>
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_RESTREINTE}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionComposeeGraphique(REGLAGES_DEMO, () => construireAvecRestreinte(id as "f" | "g")));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
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
              />
            </>
          )}
          {dernierBilan && (
            <ResultatPanelComposeeGraphique
              resultat={dernierBilan.resultat}
              niveauAidesQuestions={dernierBilan.niveauAidesQuestions}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionComposeeGraphique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
