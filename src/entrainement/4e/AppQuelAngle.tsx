import { useState } from "react";
import type { ExerciceQuelAngle } from "./core/quelAngle.types";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionQuelAngle, soumettreReponse } from "./moteur/sessionQuelAngle";
import type { EtatSessionQuelAngle, ResultatExerciceQuelAngle } from "./moteur/typesQuelAngle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceQuelAngle } from "./generateurs/quelAngle";
import type { FonctionTrig } from "./core/quelAngle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuelAngle } from "./components/EtapeQuelAngle";
import { ResultatPanelQuelAngle } from "./components/ResultatPanelQuelAngle";
import { ResumeSessionQuelAngle } from "./components/ResumeSessionQuelAngle";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionQuelAngle {
  return demarrerSessionQuelAngle(REGLAGES_DEMO, genererExerciceQuelAngle);
}

interface Bilan {
  resultat: ResultatExerciceQuelAngle;
  exercice: ExerciceQuelAngle;
}

/** Pas de `Phase` (comme "Transformations graphiques", générateur 8) : un seul écran, une seule
 * note — voir `sessionQuelAngle.ts`. */
export function AppQuelAngle() {
  const [etat, setEtat] = useState<EtatSessionQuelAngle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceQuelAngle, nouvelEtat: EtatSessionQuelAngle) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionQuelAngle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as FonctionTrig)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Trouver l'angle connaissant sin, cos ou tan</h1>
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
            <ResultatPanelQuelAngle
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuelAngle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : (
            <EtapeQuelAngle
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponse(etat, reponse));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
