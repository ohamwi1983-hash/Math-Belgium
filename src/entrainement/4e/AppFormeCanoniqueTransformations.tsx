import { useState } from "react";
import type {
  ExerciceFormeCanoniqueTransformation,
  ReponseCanonique,
  ReponseEvCvSox,
  ReponseTh,
  ReponseTv,
} from "./core/formeCanoniqueTransformations.types";
import type { ReglagesSession } from "./core/session.types";
import {
  demarrerSessionFormeCanoniqueTransformation,
  soumettreReponseCanonique,
  soumettreReponseEvCvSox,
  soumettreReponseTh,
  soumettreReponseTv,
} from "./moteur/sessionFormeCanoniqueTransformations";
import type {
  EtatSessionFormeCanoniqueTransformation,
  PhaseFormeCanoniqueTransformation,
  ResultatExerciceFormeCanoniqueTransformation,
} from "./moteur/typesFormeCanoniqueTransformations";
import { genererExerciceFormeCanoniqueTransformation } from "./generateurs/formeCanoniqueTransformations";
import { EtapeCanonique } from "./components/EtapeCanonique";
import { EtapeTh } from "./components/EtapeTh";
import { EtapeEvCvSox } from "./components/EtapeEvCvSox";
import { EtapeTv } from "./components/EtapeTv";
import { ResultatPanelFormeCanoniqueTransformations } from "./components/ResultatPanelFormeCanoniqueTransformations";
import { ResumeSessionFormeCanoniqueTransformations } from "./components/ResumeSessionFormeCanoniqueTransformations";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionFormeCanoniqueTransformation {
  return demarrerSessionFormeCanoniqueTransformation(REGLAGES_DEMO, genererExerciceFormeCanoniqueTransformation);
}

interface Bilan {
  resultat: ResultatExerciceFormeCanoniqueTransformation;
  exercice: ExerciceFormeCanoniqueTransformation;
}

const LIBELLE_PHASE: Record<PhaseFormeCanoniqueTransformation, string> = {
  canonique: "Forme canonique",
  th: "Translation horizontale",
  evCvSox: "Étirement / compression / symétrie",
  tv: "Translation verticale",
};

export function AppFormeCanoniqueTransformations() {
  const [etat, setEtat] = useState<EtatSessionFormeCanoniqueTransformation>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function validerCanonique(reponse: ReponseCanonique) {
    setEtat(soumettreReponseCanonique(etat, reponse));
  }

  function validerTh(reponse: ReponseTh) {
    setEtat(soumettreReponseTh(etat, reponse));
  }

  function validerEvCvSox(reponse: ReponseEvCvSox) {
    setEtat(soumettreReponseEvCvSox(etat, reponse));
  }

  function validerTv(reponse: ReponseTv) {
    const exerciceTermine = etat.exerciceCourant;
    const nouvelEtat = soumettreReponseTv(etat, reponse);
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Forme canonique et transformations — second degré</h1>
        <p className="app-subtitle">Chapitre 1</p>
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
            <ResultatPanelFormeCanoniqueTransformations
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionFormeCanoniqueTransformations resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "canonique" ? (
            <EtapeCanonique
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerCanonique}
            />
          ) : etat.phase === "th" ? (
            <EtapeTh
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerTh}
            />
          ) : etat.phase === "evCvSox" ? (
            <EtapeEvCvSox
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerEvCvSox}
            />
          ) : (
            <EtapeTv
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerTv}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
