import { useState } from "react";
import type { ExerciceApplicationPhysique } from "./core/applicationPhysique.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideNorme,
  demarrerSessionApplicationPhysique,
  soumettreReponseDeviation,
  soumettreReponseInterpretation,
  soumettreReponseModelisation,
  soumettreReponseNorme,
} from "./moteur/sessionApplicationPhysique";
import type { EtatSessionApplicationPhysique, ResultatExerciceApplicationPhysique } from "./moteur/typesApplicationPhysique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceApplicationPhysique } from "./generateurs/applicationPhysique";
import type { VarianteApplicationPhysique } from "./core/applicationPhysique.types";
import { calculerRecapitulatifApplicationPhysique } from "./ui/formatApplicationPhysique";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeModelisationApplicationPhysique } from "./components/EtapeModelisationApplicationPhysique";
import { EtapeNormeApplicationPhysique } from "./components/EtapeNormeApplicationPhysique";
import { EtapeDeviationApplicationPhysique } from "./components/EtapeDeviationApplicationPhysique";
import { EtapeInterpretationApplicationPhysique } from "./components/EtapeInterpretationApplicationPhysique";
import { ResultatPanelApplicationPhysique } from "./components/ResultatPanelApplicationPhysique";
import { ResumeSessionApplicationPhysique } from "./components/ResumeSessionApplicationPhysique";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionApplicationPhysique {
  return demarrerSessionApplicationPhysique(REGLAGES_DEMO, genererExerciceApplicationPhysique);
}

interface Bilan {
  resultat: ResultatExerciceApplicationPhysique;
  exercice: ExerciceApplicationPhysique;
}

/** Loi des cosinus (norme de la résultante) puis loi des sinus (angle de déviation) — deux calculs
 * décimaux non fournis par l'énoncé ; "modelisation" est un choix catégoriel, "interpretation" un QCM. */
const PHASES_CALCULATRICE = new Set<EtatSessionApplicationPhysique["phase"]>(["norme", "deviation"]);

const LIBELLE_PHASE: Record<EtatSessionApplicationPhysique["phase"], string> = {
  modelisation: "Configuration",
  norme: "Norme",
  deviation: "Déviation",
  interpretation: "Interprétation",
};

export function AppApplicationPhysique() {
  const [etat, setEtat] = useState<EtatSessionApplicationPhysique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceApplicationPhysique, nouvelEtat: EtatSessionApplicationPhysique) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionApplicationPhysique(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteApplicationPhysique)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Applications physiques (résultante de vecteurs)</h1>
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
        {enCoursDeSession && PHASES_CALCULATRICE.has(etat.phase) && <CalculatriceScientifique />}
        {dernierBilan ? (
          <ResultatPanelApplicationPhysique
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionApplicationPhysique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "modelisation" ? (
          <EtapeModelisationApplicationPhysique
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onChoisir={(choix) => setEtat(soumettreReponseModelisation(etat, choix))}
          />
        ) : etat.phase === "norme" ? (
          <EtapeNormeApplicationPhysique
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideNorme}
            recapitulatif={calculerRecapitulatifApplicationPhysique(etat)}
            onActiverAide={() => setEtat(activerAideNorme(etat))}
            onValider={(valeur) => setEtat(soumettreReponseNorme(etat, valeur))}
          />
        ) : etat.phase === "deviation" ? (
          <EtapeDeviationApplicationPhysique
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            recapitulatif={calculerRecapitulatifApplicationPhysique(etat)}
            onValider={(valeur) => setEtat(soumettreReponseDeviation(etat, valeur))}
          />
        ) : (
          <EtapeInterpretationApplicationPhysique
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            recapitulatif={calculerRecapitulatifApplicationPhysique(etat)}
            onValider={(direction) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseInterpretation(etat, direction));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
