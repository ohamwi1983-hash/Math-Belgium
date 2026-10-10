import { useState } from "react";
import type { ExerciceCercleTrigonometrique } from "./core/cercleTrigonometrique.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAide,
  demarrerSessionCercleTrigonometrique,
  soumettreReponseAnglePremierQuadrant,
  soumettreReponseQuadrant,
  soumettreReponseReduction,
  soumettreReponseSignes,
} from "./moteur/sessionCercleTrigonometrique";
import type {
  EtatSessionCercleTrigonometrique,
  PhaseCercleTrigonometrique,
  ResultatExerciceCercleTrigonometrique,
} from "./moteur/typesCercleTrigonometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercleTrigonometrique } from "./generateurs/cercleTrigonometrique";
import type { VarianteCercleTrigId } from "./core/cercleTrigonometrique.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReductionCercleTrig } from "./components/EtapeReductionCercleTrig";
import { EtapeQuadrantCercleTrig } from "./components/EtapeQuadrantCercleTrig";
import { EtapeAnglePremierQuadrantCercleTrig } from "./components/EtapeAnglePremierQuadrantCercleTrig";
import { EtapeSignesCercleTrig } from "./components/EtapeSignesCercleTrig";
import { ResultatPanelCercleTrigonometrique } from "./components/ResultatPanelCercleTrigonometrique";
import { ResumeSessionCercleTrigonometrique } from "./components/ResumeSessionCercleTrigonometrique";
import { calculerRecapitulatifCercleTrigonometrique } from "./ui/recapitulatifCercleTrigonometrique";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionCercleTrigonometrique {
  return demarrerSessionCercleTrigonometrique(REGLAGES_DEMO, genererExerciceCercleTrigonometrique);
}

interface Bilan {
  resultat: ResultatExerciceCercleTrigonometrique;
  exercice: ExerciceCercleTrigonometrique;
}

const LIBELLE_PHASE: Record<PhaseCercleTrigonometrique, string> = {
  reduction: "Réduction",
  quadrant: "Quadrant",
  anglePremierQuadrant: "Angle du premier quadrant",
  signes: "Signes",
};

export function AppCercleTrigonometrique() {
  const [etat, setEtat] = useState<EtatSessionCercleTrigonometrique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceCercleTrigonometrique, nouvelEtat: EtatSessionCercleTrigonometrique) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifCercleTrigonometrique(etat);

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionCercleTrigonometrique(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteCercleTrigId)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Placement et lecture sur le cercle trigonométrique</h1>
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
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelCercleTrigonometrique
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionCercleTrigonometrique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "reduction" ? (
            <EtapeReductionCercleTrig
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideReductionUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(valeur) => setEtat(soumettreReponseReduction(etat, valeur))}
            />
          ) : etat.phase === "quadrant" ? (
            <EtapeQuadrantCercleTrig
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(quadrant) => setEtat(soumettreReponseQuadrant(etat, quadrant))}
            />
          ) : etat.phase === "anglePremierQuadrant" ? (
            <EtapeAnglePremierQuadrantCercleTrig
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideAnglePremierQuadrantUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(valeur) => setEtat(soumettreReponseAnglePremierQuadrant(etat, valeur))}
            />
          ) : (
            <EtapeSignesCercleTrig
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideSignesUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponseSignes(etat, reponse));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
