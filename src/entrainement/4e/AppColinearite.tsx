import { useState } from "react";
import type { ExerciceColinearite } from "./core/colinearite.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionColinearite,
  soumettreReponseConstructionAvecX,
  soumettreReponseConstructionVecteurs,
  soumettreReponseReduction,
  soumettreReponseReductionAvecX,
  soumettreReponseResolution,
  soumettreReponseResolutionAvecX,
  soumettreReponseTest,
} from "./moteur/sessionColinearite";
import type { EtatSessionColinearite, PhaseColinearite, ResultatExerciceColinearite } from "./moteur/typesColinearite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceColinearite } from "./generateurs/colinearite";
import type { VarianteColinearite } from "./core/colinearite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeTestColinearite } from "./components/EtapeTestColinearite";
import { EtapeConstructionVecteursColinearite } from "./components/EtapeConstructionVecteursColinearite";
import { EtapeConstructionAvecXColinearite } from "./components/EtapeConstructionAvecXColinearite";
import { EtapeReductionColinearite } from "./components/EtapeReductionColinearite";
import { EtapeReductionAvecXColinearite } from "./components/EtapeReductionAvecXColinearite";
import { EtapeResolutionColinearite } from "./components/EtapeResolutionColinearite";
import { EtapeResolutionAvecXColinearite } from "./components/EtapeResolutionAvecXColinearite";
import { ResultatPanelColinearite } from "./components/ResultatPanelColinearite";
import { ResumeSessionColinearite } from "./components/ResumeSessionColinearite";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionColinearite {
  return demarrerSessionColinearite(REGLAGES_DEMO, genererExerciceColinearite);
}

interface Bilan {
  resultat: ResultatExerciceColinearite;
  exercice: ExerciceColinearite;
}

const LIBELLE_PHASE: Record<PhaseColinearite, string> = {
  constructionVecteurs: "Construction des vecteurs",
  constructionAvecX: "Construction des vecteurs",
  reduction: "Réduction",
  reductionAvecX: "Réduction",
  resolution: "Résolution",
  resolutionAvecX: "Résolution",
  test: "Test de colinéarité",
};

export function AppColinearite() {
  const [etat, setEtat] = useState<EtatSessionColinearite>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceColinearite, nouvelEtat: EtatSessionColinearite) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionColinearite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteColinearite)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Colinéarité et alignement de points</h1>
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
          <ResultatPanelColinearite
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionColinearite resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "constructionVecteurs" && exercice.variante === "points" ? (
          <EtapeConstructionVecteursColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseConstructionVecteurs(etat, reponse))}
          />
        ) : etat.phase === "constructionAvecX" && exercice.variante === "pointsParametre" ? (
          <EtapeConstructionAvecXColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseConstructionAvecX(etat, reponse))}
          />
        ) : etat.phase === "reduction" && exercice.variante === "parametre" ? (
          <EtapeReductionColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideReduction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => setEtat(soumettreReponseReduction(etat, texte))}
          />
        ) : etat.phase === "resolution" && exercice.variante === "parametre" ? (
          <EtapeResolutionColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(valeur) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseResolution(etat, valeur));
            }}
          />
        ) : etat.phase === "reductionAvecX" && exercice.variante === "pointsParametre" ? (
          <EtapeReductionAvecXColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideReduction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => setEtat(soumettreReponseReductionAvecX(etat, texte))}
          />
        ) : etat.phase === "resolutionAvecX" && exercice.variante === "pointsParametre" ? (
          <EtapeResolutionAvecXColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(valeur) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseResolutionAvecX(etat, valeur));
            }}
          />
        ) : (exercice.variante === "vecteurs" || exercice.variante === "points") && etat.phase === "test" ? (
          <EtapeTestColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideTest}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseTest(etat, reponse));
            }}
          />
        ) : null}
        </div>
      </main>
    </div>
  );
}
