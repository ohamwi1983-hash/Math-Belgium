import { useState } from "react";
import type { ExerciceComparaisonVecteurs, ProprieteComparaison } from "./core/comparaisonVecteurs.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionComparaisonVecteurs, soumettreReponseEgalite, soumettreReponseSelection } from "./moteur/sessionComparaisonVecteurs";
import type { EtatSessionComparaisonVecteurs, PhaseComparaisonVecteurs, ResultatExerciceComparaisonVecteurs } from "./moteur/typesComparaisonVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparaisonVecteurs } from "./generateurs/comparaisonVecteurs";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSelectionComparaison } from "./components/EtapeSelectionComparaison";
import { EtapeEgaliteComparaison } from "./components/EtapeEgaliteComparaison";
import { ResultatPanelComparaisonVecteurs } from "./components/ResultatPanelComparaisonVecteurs";
import { ResumeSessionComparaisonVecteurs } from "./components/ResumeSessionComparaisonVecteurs";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionComparaisonVecteurs {
  return demarrerSessionComparaisonVecteurs(REGLAGES_DEMO, genererExerciceComparaisonVecteurs);
}

interface Bilan {
  resultat: ResultatExerciceComparaisonVecteurs;
  exercice: ExerciceComparaisonVecteurs;
}

const LIBELLE_PHASE: Record<PhaseComparaisonVecteurs, string> = {
  selection: "Sélection",
  egalite: "Égalité",
};

export function AppComparaisonVecteurs() {
  const [etat, setEtat] = useState<EtatSessionComparaisonVecteurs>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceComparaisonVecteurs, nouvelEtat: EtatSessionComparaisonVecteurs) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionComparaisonVecteurs(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as ProprieteComparaison)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Comparaison visuelle de vecteurs sur figure</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
          </div>
        )}
      </header>

      <main className="card">
        <div className="card-body">
        {dernierBilan ? (
          <ResultatPanelComparaisonVecteurs
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionComparaisonVecteurs resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "selection" ? (
          <EtapeSelectionComparaison
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(labels) => setEtat(soumettreReponseSelection(etat, labels))}
          />
        ) : (
          <EtapeEgaliteComparaison
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(texte) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseEgalite(etat, texte));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
