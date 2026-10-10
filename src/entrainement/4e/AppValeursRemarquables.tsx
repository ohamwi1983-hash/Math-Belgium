import { useState } from "react";
import type { ExerciceValeursRemarquables } from "./core/valeursRemarquables.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAide,
  demarrerSessionValeursRemarquables,
  soumettreReponseAnglePremierQuadrant,
  soumettreReponseQuadrant,
  soumettreReponseValeursExactes,
} from "./moteur/sessionValeursRemarquables";
import type {
  EtatSessionValeursRemarquables,
  PhaseValeursRemarquables,
  ResultatExerciceValeursRemarquables,
} from "./moteur/typesValeursRemarquables";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceValeursRemarquables } from "./generateurs/valeursRemarquables";
import type { AngleRemarquable } from "./core/valeursRemarquables.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuadrantVR } from "./components/EtapeQuadrantVR";
import { EtapeAnglePremierQuadrantVR } from "./components/EtapeAnglePremierQuadrantVR";
import { EtapeValeursExactesVR } from "./components/EtapeValeursExactesVR";
import { ResultatPanelValeursRemarquables } from "./components/ResultatPanelValeursRemarquables";
import { ResumeSessionValeursRemarquables } from "./components/ResumeSessionValeursRemarquables";
import { calculerRecapitulatifValeursRemarquables } from "./ui/recapitulatifValeursRemarquables";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionValeursRemarquables {
  return demarrerSessionValeursRemarquables(REGLAGES_DEMO, genererExerciceValeursRemarquables);
}

interface Bilan {
  resultat: ResultatExerciceValeursRemarquables;
  exercice: ExerciceValeursRemarquables;
}

const LIBELLE_PHASE: Record<PhaseValeursRemarquables, string> = {
  quadrant: "Quadrant",
  anglePremierQuadrant: "Angle du premier quadrant",
  valeursExactes: "Valeurs exactes",
};

export function AppValeursRemarquables() {
  const [etat, setEtat] = useState<EtatSessionValeursRemarquables>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceValeursRemarquables, nouvelEtat: EtatSessionValeursRemarquables) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifValeursRemarquables(etat);

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionValeursRemarquables(REGLAGES_DEMO, () => construireAvecVarianteId(Number(varianteId) as AngleRemarquable)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Valeurs trigonométriques remarquables</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES.map((v) => ({ id: String(v.id), label: v.label }))} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
          </div>
        )}

        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelValeursRemarquables
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionValeursRemarquables resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "quadrant" ? (
            <EtapeQuadrantVR
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideQuadrantUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(quadrant) => setEtat(soumettreReponseQuadrant(etat, quadrant))}
            />
          ) : etat.phase === "anglePremierQuadrant" ? (
            <EtapeAnglePremierQuadrantVR
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideAnglePremierQuadrantUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(valeur) => setEtat(soumettreReponseAnglePremierQuadrant(etat, valeur))}
            />
          ) : (
            <EtapeValeursExactesVR
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideValeursExactesUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponseValeursExactes(etat, reponse));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
