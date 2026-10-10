import { useState } from "react";
import type { ExerciceCaracteristiquesDroite } from "./core/caracteristiquesDroite.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCaracteristiquesDroite } from "./generateurs/caracteristiquesDroite";
import type { VarianteCaracteristiquesDroite } from "./core/caracteristiquesDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionCaracteristiquesDroite, soumettreReponseCaracteristiques, soumettreReponseExtraction } from "./moteur/sessionCaracteristiquesDroite";
import type { EtatSessionCaracteristiquesDroite, PhaseCaracteristiquesDroite, ResultatExerciceCaracteristiquesDroite } from "./moteur/typesCaracteristiquesDroite";
import { EtapeCaracteristiquesDroite } from "./components/EtapeCaracteristiquesDroite";
import { EtapeExtractionCaracteristiquesDroite } from "./components/EtapeExtractionCaracteristiquesDroite";
import { ResultatPanelCaracteristiquesDroite } from "./components/ResultatPanelCaracteristiquesDroite";
import { ResumeSessionCaracteristiquesDroite } from "./components/ResumeSessionCaracteristiquesDroite";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionCaracteristiquesDroite {
  return demarrerSessionCaracteristiquesDroite(REGLAGES_DEMO, genererExerciceCaracteristiquesDroite);
}

interface Bilan {
  resultat: ResultatExerciceCaracteristiquesDroite;
  exercice: ExerciceCaracteristiquesDroite;
}

const LIBELLE_PHASE: Record<PhaseCaracteristiquesDroite, string> = {
  extraction: "Extraction du point et du vecteur directeur",
  caracteristiques: "Pente ou angle, et ordonnée à l'origine",
};

export function AppCaracteristiquesDroite() {
  const [etat, setEtat] = useState<EtatSessionCaracteristiquesDroite>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceCaracteristiquesDroite, nouvelEtat: EtatSessionCaracteristiquesDroite) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionCaracteristiquesDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteCaracteristiquesDroite)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Caractéristiques d'une droite</h1>
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
        {dernierBilan ? (
          <ResultatPanelCaracteristiquesDroite
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionCaracteristiquesDroite resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "extraction" ? (
          <EtapeExtractionCaracteristiquesDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideExtraction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseExtraction(etat, reponse))}
          />
        ) : (
          <EtapeCaracteristiquesDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCaracteristiques}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseCaracteristiques(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
