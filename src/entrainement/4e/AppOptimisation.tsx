import { useState } from "react";
import type { ExerciceOptimisation } from "./core/optimisation.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionOptimisation,
  soumettreReponseContrainteEtGrandeur,
  soumettreReponseDecision,
  soumettreReponseDomaine,
  soumettreReponseIdentification,
  soumettreReponseInterpretation,
  soumettreReponseSommet,
  soumettreReponseSysteme,
} from "./moteur/sessionOptimisation";
import type { EtatSessionOptimisation, PhaseOptimisation, ResultatExerciceOptimisation } from "./moteur/typesOptimisation";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceOptimisation } from "./generateurs/optimisation";
import { EtapeIdentificationOptimisation } from "./components/EtapeIdentificationOptimisation";
import { EtapeContrainteEtGrandeurOptimisation } from "./components/EtapeContrainteEtGrandeurOptimisation";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSystemeOptimisation } from "./components/EtapeSystemeOptimisation";
import { EtapeDomaineOptimisation } from "./components/EtapeDomaineOptimisation";
import { EtapeSommetOptimisation } from "./components/EtapeSommetOptimisation";
import { EtapeDecisionOptimisation } from "./components/EtapeDecisionOptimisation";
import { EtapeInterpretationOptimisation } from "./components/EtapeInterpretationOptimisation";
import { ResultatPanelOptimisation } from "./components/ResultatPanelOptimisation";
import { ResumeSessionOptimisation } from "./components/ResumeSessionOptimisation";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionOptimisation {
  return demarrerSessionOptimisation(REGLAGES_DEMO, genererExerciceOptimisation);
}

interface Bilan {
  resultat: ResultatExerciceOptimisation;
  exercice: ExerciceOptimisation;
}

const LIBELLE_PHASE: Record<PhaseOptimisation, string> = {
  identification: "Identifier x et y",
  contrainteEtGrandeur: "Poser la contrainte et exprimer la grandeur",
  systeme: "Résoudre le système",
  domaine: "Domaine de validité",
  sommet: "Sommet",
  decision: "Décision — sommet ou borne",
  interpretation: "Interprétation",
};

export function AppOptimisation() {
  const [etat, setEtat] = useState<EtatSessionOptimisation>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceOptimisation, nouvelEtat: EtatSessionOptimisation) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  function onGenererDev(familleId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionOptimisation(REGLAGES_DEMO, () => construireAvecFamilleId(familleId as (typeof CATALOGUE_FAMILLES)[number]["id"])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Problèmes d'optimisation (fonction du second degré)</h1>
        <p className="app-subtitle">Chapitre 1</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={onGenererDev} />
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
            <ResultatPanelOptimisation
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionOptimisation resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "identification" && exercice.variante === "modelisation" ? (
            <EtapeIdentificationOptimisation
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => setEtat(soumettreReponseIdentification(etat, reponse))}
            />
          ) : etat.phase === "contrainteEtGrandeur" && exercice.variante === "modelisation" ? (
            <EtapeContrainteEtGrandeurOptimisation
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideContrainteEtGrandeur}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseContrainteEtGrandeur(etat, reponse))}
            />
          ) : etat.phase === "systeme" && exercice.variante === "modelisation" ? (
            <EtapeSystemeOptimisation
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseSysteme(etat, texte))}
            />
          ) : etat.phase === "domaine" && exercice.variante === "modelisation" ? (
            <EtapeDomaineOptimisation
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDomaine}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseDomaine(etat, reponse))}
            />
          ) : etat.phase === "sommet" ? (
            <EtapeSommetOptimisation
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSommet}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseSommet(etat, reponse))}
            />
          ) : etat.phase === "decision" ? (
            <EtapeDecisionOptimisation
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDecision}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseDecision(etat, reponse))}
            />
          ) : etat.phase === "interpretation" ? (
            <EtapeInterpretationOptimisation
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideInterpretation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(indexChoisi) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseInterpretation(etat, indexChoisi));
              }}
            />
          ) : null}{" "}
        </div>
      </main>
    </div>
  );
}
