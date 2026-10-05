import { useState } from "react";
import type { ExerciceEquationCercleDeveloppee } from "./core/equationCercleDeveloppee.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercleDeveloppee } from "./generateurs/equationCercleDeveloppee";
import type { VarianteEquationCercleDeveloppee } from "./core/equationCercleDeveloppee.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import {
  activerAideSuivante,
  demarrerSessionEquationCercleDeveloppee,
  soumettreReponseCentreRayon,
  soumettreReponseCompletion,
  soumettreReponseRegroupement,
} from "./moteur/sessionEquationCercleDeveloppee";
import type { EtatSessionEquationCercleDeveloppee, PhaseEquationCercleDeveloppee, ResultatExerciceEquationCercleDeveloppee } from "./moteur/typesEquationCercleDeveloppee";
import { EtapeCentreRayonEquationCercleDeveloppee } from "./components/EtapeCentreRayonEquationCercleDeveloppee";
import { EtapeCompletionEquationCercleDeveloppee } from "./components/EtapeCompletionEquationCercleDeveloppee";
import { EtapeRegroupementEquationCercleDeveloppee } from "./components/EtapeRegroupementEquationCercleDeveloppee";
import { ResultatPanelEquationCercleDeveloppee } from "./components/ResultatPanelEquationCercleDeveloppee";
import { ResumeSessionEquationCercleDeveloppee } from "./components/ResumeSessionEquationCercleDeveloppee";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationCercleDeveloppee {
  return demarrerSessionEquationCercleDeveloppee(REGLAGES_DEMO, genererExerciceEquationCercleDeveloppee);
}

interface Bilan {
  resultat: ResultatExerciceEquationCercleDeveloppee;
  exercice: ExerciceEquationCercleDeveloppee;
}

const LIBELLE_PHASE: Record<PhaseEquationCercleDeveloppee, string> = {
  regroupement: "Regroupement et factorisation",
  completion: "Complétion du carré",
  centreRayon: "Centre et rayon",
};

export function AppEquationCercleDeveloppee() {
  const [etat, setEtat] = useState<EtatSessionEquationCercleDeveloppee>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceEquationCercleDeveloppee, nouvelEtat: EtatSessionEquationCercleDeveloppee) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionEquationCercleDeveloppee(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteEquationCercleDeveloppee)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Centre et rayon d'un cercle depuis l'équation développée</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
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
      </header>

      <main className="card">
        <div className="card-body">
        {enCoursDeSession && etat.phase === "centreRayon" && exercice.variante === "irrationnel" && <CalculatriceScientifique />}
        {dernierBilan ? (
          <ResultatPanelEquationCercleDeveloppee
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionEquationCercleDeveloppee resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "regroupement" ? (
          <EtapeRegroupementEquationCercleDeveloppee
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideRegroupement}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseRegroupement(etat, reponse))}
          />
        ) : etat.phase === "completion" ? (
          <EtapeCompletionEquationCercleDeveloppee
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCompletion}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseCompletion(etat, reponse))}
          />
        ) : (
          <EtapeCentreRayonEquationCercleDeveloppee
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCentreRayon}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseCentreRayon(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
