import { useState } from "react";
import type { ExerciceMoyennePonderee } from "./core/moyennePonderee.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionMoyennePonderee,
  soumettreReponseCentres,
  soumettreReponseQuotient,
  soumettreReponseSommes,
} from "./moteur/sessionMoyennePonderee";
import type { EtatSessionMoyennePonderee, PhaseMoyennePonderee, ResultatExerciceMoyennePonderee } from "./moteur/typesMoyennePonderee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMoyennePonderee } from "./generateurs/moyennePonderee";
import type { VarianteMoyennePonderee } from "./core/moyennePonderee.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeCentresMoyennePonderee } from "./components/EtapeCentresMoyennePonderee";
import { EtapeSommesMoyennePonderee } from "./components/EtapeSommesMoyennePonderee";
import { EtapeQuotientMoyennePonderee } from "./components/EtapeQuotientMoyennePonderee";
import { ResultatPanelMoyennePonderee } from "./components/ResultatPanelMoyennePonderee";
import { ResumeSessionMoyennePonderee } from "./components/ResumeSessionMoyennePonderee";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionMoyennePonderee {
  return demarrerSessionMoyennePonderee(REGLAGES_DEMO, genererExerciceMoyennePonderee);
}

interface Bilan {
  resultat: ResultatExerciceMoyennePonderee;
  exercice: ExerciceMoyennePonderee;
}

const LIBELLE_PHASE: Record<PhaseMoyennePonderee, string> = {
  centres: "Centres de classe",
  sommes: "Sommes intermédiaires",
  quotient: "Moyenne pondérée",
};

export function AppMoyennePonderee() {
  const [etat, setEtat] = useState<EtatSessionMoyennePonderee>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceMoyennePonderee, nouvelEtat: EtatSessionMoyennePonderee) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionMoyennePonderee(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteMoyennePonderee)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Moyenne pondérée</h1>
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
          {enCoursDeSession && etat.phase === "quotient" && <CalculatriceScientifique />}
          {dernierBilan ? (
            <ResultatPanelMoyennePonderee
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionMoyennePonderee resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "centres" && exercice.variante === "classes" ? (
            <EtapeCentresMoyennePonderee
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCentres}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseCentres(etat, reponse))}
            />
          ) : etat.phase === "sommes" ? (
            <EtapeSommesMoyennePonderee
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSommes}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseSommes(etat, reponse))}
            />
          ) : etat.phase === "quotient" ? (
            <EtapeQuotientMoyennePonderee
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideQuotient}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseQuotient(etat, reponse));
              }}
            />
          ) : null}{" "}
        </div>
      </main>
    </div>
  );
}
