import { useState } from "react";
import type { ExerciceMediane } from "./core/mediane.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionMediane,
  soumettreReponseLectureMediane,
  soumettreReponseLectureQ1,
  soumettreReponseLectureQ3,
  soumettreReponseMediane,
  soumettreReponseMinMaxMode,
  soumettreReponsePolygone,
  soumettreReponseQ1,
  soumettreReponseQ3,
  soumettreReponseSynthese,
} from "./moteur/sessionMediane";
import type { EtatSessionMediane, PhaseMediane, ResultatExerciceMediane } from "./moteur/typesMediane";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMediane } from "./generateurs/mediane";
import type { VarianteMediane } from "./core/mediane.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeMedianeDiscrete } from "./components/EtapeMedianeDiscrete";
import { EtapeQ1Mediane } from "./components/EtapeQ1Mediane";
import { EtapeQ3Mediane } from "./components/EtapeQ3Mediane";
import { EtapeMinMaxModeMediane } from "./components/EtapeMinMaxModeMediane";
import { EtapePolygoneMediane } from "./components/EtapePolygoneMediane";
import { EtapeLectureMediane } from "./components/EtapeLectureMediane";
import { EtapeSyntheseMediane } from "./components/EtapeSyntheseMediane";
import { ResultatPanelMediane } from "./components/ResultatPanelMediane";
import { ResumeSessionMediane } from "./components/ResumeSessionMediane";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionMediane {
  return demarrerSessionMediane(REGLAGES_DEMO, genererExerciceMediane);
}

interface Bilan {
  resultat: ResultatExerciceMediane;
  exercice: ExerciceMediane;
}

const LIBELLE_PHASE: Record<PhaseMediane, string> = {
  mediane: "Médiane",
  q1: "Premier quartile",
  q3: "Troisième quartile",
  minMaxMode: "Min, max et mode(s)",
  polygone: "Polygone des effectifs cumulés",
  lectureQ1: "Lecture — Q1",
  lectureMediane: "Lecture — médiane",
  lectureQ3: "Lecture — Q3",
  synthese: "Synthèse",
};

export function AppMediane() {
  const [etat, setEtat] = useState<EtatSessionMediane>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceMediane, nouvelEtat: EtatSessionMediane) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionMediane(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteMediane)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Paramètres de position</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelMediane
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionMediane resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "mediane" && exercice.variante === "discrete" ? (
            <EtapeMedianeDiscrete
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideMediane}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseMediane(etat, reponse))}
            />
          ) : etat.phase === "q1" && exercice.variante === "discrete" ? (
            <EtapeQ1Mediane
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideQ1}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseQ1(etat, reponse))}
            />
          ) : etat.phase === "q3" && exercice.variante === "discrete" ? (
            <EtapeQ3Mediane
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideQ3}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseQ3(etat, reponse))}
            />
          ) : etat.phase === "minMaxMode" && exercice.variante === "discrete" ? (
            <EtapeMinMaxModeMediane
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideMinMaxMode}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseMinMaxMode(etat, reponse));
              }}
            />
          ) : etat.phase === "polygone" && exercice.variante === "classes" ? (
            <EtapePolygoneMediane
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePolygone}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(points) => setEtat(soumettreReponsePolygone(etat, points))}
            />
          ) : /* Les 3 branches ci-dessous rendent le MÊME type de composant (`EtapeLectureMediane`) à
          la même position de l'arbre React — sans `key` distincte, React réutiliserait l'instance
          existante d'un écran à l'autre, reportant silencieusement l'état local (champ de réponse,
          position de la barre, zoom du graphe) d'un quartile au suivant. `key={parametre}` force un
          remontage complet à chaque transition (`promptgen33ajustements.md`, point 2 — même
          principe déjà établi par `EtapeTestSommetOrthogonalite`, keyée par sommet A/B/C). */
          etat.phase === "lectureMediane" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key="mediane"
              exercice={exercice}
              parametre="mediane"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideLectureMediane}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseLectureMediane(etat, texte))}
            />
          ) : etat.phase === "lectureQ1" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key="q1"
              exercice={exercice}
              parametre="q1"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideLectureQ1}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseLectureQ1(etat, texte))}
            />
          ) : etat.phase === "lectureQ3" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key="q3"
              exercice={exercice}
              parametre="q3"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideLectureQ3}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseLectureQ3(etat, texte))}
            />
          ) : etat.phase === "synthese" && exercice.variante === "classes" ? (
            <EtapeSyntheseMediane
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSynthese}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseSynthese(etat, reponse));
              }}
            />
          ) : null}{" "}
        </div>
      </main>
    </div>
  );
}
