import { useState } from "react";
import type { ExerciceNormeDistance } from "./core/normeDistance.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionNormeDistance,
  soumettreReponseCalculDistance,
  soumettreReponseCalculIsocele,
  soumettreReponseCalculPythagore,
  soumettreReponseConclusionIsocele,
  soumettreReponseConstructionDistance,
  soumettreReponseConstructionIsocele,
  soumettreReponseConstructionPythagore,
  soumettreReponseNormeVecteur,
  soumettreReponseReductionParametreNorme,
  soumettreReponseResolutionParametreNorme,
  soumettreReponseTestPythagore,
} from "./moteur/sessionNormeDistance";
import type { EtatSessionNormeDistance, PhaseNormeDistance, ResultatExerciceNormeDistance } from "./moteur/typesNormeDistance";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceNormeDistance } from "./generateurs/normeDistance";
import type { VarianteNormeDistance } from "./core/normeDistance.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeNormeVecteur } from "./components/EtapeNormeVecteur";
import { EtapeConstructionDistance } from "./components/EtapeConstructionDistance";
import { EtapeCalculDistance } from "./components/EtapeCalculDistance";
import { EtapeConstructionIsocele } from "./components/EtapeConstructionIsocele";
import { EtapeCalculIsocele } from "./components/EtapeCalculIsocele";
import { EtapeConclusionIsocele } from "./components/EtapeConclusionIsocele";
import { EtapeReductionParametreNorme } from "./components/EtapeReductionParametreNorme";
import { EtapeResolutionParametreNorme } from "./components/EtapeResolutionParametreNorme";
import { EtapeConstructionPythagore } from "./components/EtapeConstructionPythagore";
import { EtapeCalculPythagore } from "./components/EtapeCalculPythagore";
import { EtapeTestPythagore } from "./components/EtapeTestPythagore";
import { ResultatPanelNormeDistance } from "./components/ResultatPanelNormeDistance";
import { ResumeSessionNormeDistance } from "./components/ResumeSessionNormeDistance";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionNormeDistance {
  return demarrerSessionNormeDistance(REGLAGES_DEMO, genererExerciceNormeDistance);
}

interface Bilan {
  resultat: ResultatExerciceNormeDistance;
  exercice: ExerciceNormeDistance;
}

const LIBELLE_PHASE: Record<PhaseNormeDistance, string> = {
  normeVecteur: "Norme",
  constructionDistance: "Construction du vecteur",
  calculDistance: "Calcul de la distance",
  constructionIsocele: "Construction des côtés",
  calculIsocele: "Calcul des longueurs",
  conclusionIsocele: "Conclusion",
  reductionParametreNorme: "Réduction",
  resolutionParametreNorme: "Résolution",
  constructionPythagore: "Construction des côtés",
  calculPythagore: "Calcul des longueurs",
  testPythagore: "Rectangle en...",
};

export function AppNormeDistance() {
  const [etat, setEtat] = useState<EtatSessionNormeDistance>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceNormeDistance, nouvelEtat: EtatSessionNormeDistance) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionNormeDistance(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteNormeDistance)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Norme d'un vecteur et distance entre 2 points</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
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
        {enCoursDeSession && etat.phase === "calculPythagore" && <CalculatriceScientifique />}
        {dernierBilan ? (
          <ResultatPanelNormeDistance
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionNormeDistance resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "normeVecteur" && exercice.variante === "vecteur" ? (
          <EtapeNormeVecteur
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseNormeVecteur(etat, texte));
            }}
          />
        ) : etat.phase === "constructionDistance" && exercice.variante === "distance" ? (
          <EtapeConstructionDistance
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseConstructionDistance(etat, reponse))}
          />
        ) : etat.phase === "calculDistance" && exercice.variante === "distance" ? (
          <EtapeCalculDistance
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseCalculDistance(etat, texte));
            }}
          />
        ) : etat.phase === "constructionIsocele" && exercice.variante === "isocele" ? (
          <EtapeConstructionIsocele
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseConstructionIsocele(etat, reponse))}
          />
        ) : etat.phase === "calculIsocele" && exercice.variante === "isocele" ? (
          <EtapeCalculIsocele
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseCalculIsocele(etat, reponse))}
          />
        ) : etat.phase === "conclusionIsocele" && exercice.variante === "isocele" ? (
          <EtapeConclusionIsocele
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseConclusionIsocele(etat, reponse));
            }}
          />
        ) : etat.phase === "reductionParametreNorme" && exercice.variante === "parametre" ? (
          <EtapeReductionParametreNorme
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => setEtat(soumettreReponseReductionParametreNorme(etat, texte))}
          />
        ) : etat.phase === "resolutionParametreNorme" && exercice.variante === "parametre" ? (
          <EtapeResolutionParametreNorme
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeurs) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseResolutionParametreNorme(etat, valeurs));
            }}
          />
        ) : etat.phase === "constructionPythagore" && exercice.variante === "pythagore" ? (
          <EtapeConstructionPythagore
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseConstructionPythagore(etat, reponse))}
          />
        ) : etat.phase === "calculPythagore" && exercice.variante === "pythagore" ? (
          <EtapeCalculPythagore
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseCalculPythagore(etat, reponse))}
          />
        ) : etat.phase === "testPythagore" && exercice.variante === "pythagore" ? (
          <EtapeTestPythagore
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseTestPythagore(etat, reponse));
            }}
          />
        ) : null}
        </div>
      </main>
    </div>
  );
}
