import { useState } from "react";
import type { ExerciceAnglesAssocies } from "./core/anglesAssocies.types";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionAnglesAssocies, soumettreReponse } from "./moteur/sessionAnglesAssocies";
import type { EtatSessionAnglesAssocies, ResultatExerciceAnglesAssocies } from "./moteur/typesAnglesAssocies";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAnglesAssocies } from "./generateurs/anglesAssocies";
import type { IdVarianteAnglesAssocies } from "./core/anglesAssocies.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeAnglesAssocies } from "./components/EtapeAnglesAssocies";
import { ResultatPanelAnglesAssocies } from "./components/ResultatPanelAnglesAssocies";
import { ResumeSessionAnglesAssocies } from "./components/ResumeSessionAnglesAssocies";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionAnglesAssocies {
  return demarrerSessionAnglesAssocies(REGLAGES_DEMO, genererExerciceAnglesAssocies);
}

interface Bilan {
  resultat: ResultatExerciceAnglesAssocies;
  exercice: ExerciceAnglesAssocies;
}

/** Refonte écran unique (`promptgen17refontecomplete.md`) — plus de routage par phase, un seul
 * composant d'écran (`EtapeAnglesAssocies`) par exercice. */
export function AppAnglesAssocies() {
  const [etat, setEtat] = useState<EtatSessionAnglesAssocies>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceAnglesAssocies, nouvelEtat: EtatSessionAnglesAssocies) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionAnglesAssocies(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as IdVarianteAnglesAssocies)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Angles associés</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelAnglesAssocies
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionAnglesAssocies resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : (
            <EtapeAnglesAssocies
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(valeur) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponse(etat, valeur));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
