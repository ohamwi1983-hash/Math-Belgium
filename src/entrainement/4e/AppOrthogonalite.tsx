import { useState } from "react";
import type { ExerciceOrthogonalite } from "./core/orthogonalite.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionOrthogonalite,
  soumettreReponseConclusionTriangle,
  soumettreReponseConstructionAvecXTriangle,
  soumettreReponseConstructionTriangle,
  soumettreReponseIdentificationResolution,
  soumettreReponseReductionParametre,
  soumettreReponseReductionSommet,
  soumettreReponseResolutionParametre,
  soumettreReponseTest,
  soumettreReponseTestSommet,
} from "./moteur/sessionOrthogonalite";
import type { EtatSessionOrthogonalite, PhaseOrthogonalite, ResultatExerciceOrthogonalite } from "./moteur/typesOrthogonalite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOrthogonalite } from "./generateurs/orthogonalite";
import type { VarianteOrthogonalite } from "./core/orthogonalite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeTestOrthogonalite } from "./components/EtapeTestOrthogonalite";
import { EtapeReductionParametreOrthogonalite } from "./components/EtapeReductionParametreOrthogonalite";
import { EtapeResolutionParametreOrthogonalite } from "./components/EtapeResolutionParametreOrthogonalite";
import { EtapeConstructionTriangleOrthogonalite } from "./components/EtapeConstructionTriangleOrthogonalite";
import { EtapeTestSommetOrthogonalite } from "./components/EtapeTestSommetOrthogonalite";
import { EtapeConclusionTriangleOrthogonalite } from "./components/EtapeConclusionTriangleOrthogonalite";
import { EtapeConstructionAvecXOrthogonalite } from "./components/EtapeConstructionAvecXOrthogonalite";
import { EtapeReductionSommetOrthogonalite } from "./components/EtapeReductionSommetOrthogonalite";
import { EtapeIdentificationResolutionOrthogonalite } from "./components/EtapeIdentificationResolutionOrthogonalite";
import { ResultatPanelOrthogonalite } from "./components/ResultatPanelOrthogonalite";
import { ResumeSessionOrthogonalite } from "./components/ResumeSessionOrthogonalite";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionOrthogonalite {
  return demarrerSessionOrthogonalite(REGLAGES_DEMO, genererExerciceOrthogonalite);
}

interface Bilan {
  resultat: ResultatExerciceOrthogonalite;
  exercice: ExerciceOrthogonalite;
}

const LIBELLE_PHASE: Record<PhaseOrthogonalite, string> = {
  test: "Test d'orthogonalité",
  reductionParametre: "Réduction",
  resolutionParametre: "Résolution",
  constructionTriangle: "Construction des vecteurs",
  testSommetA: "Test au sommet A",
  testSommetB: "Test au sommet B",
  testSommetC: "Test au sommet C",
  conclusionTriangle: "Conclusion",
  constructionAvecX: "Construction symbolique",
  reductionSommetA: "Réduction — sommet A",
  reductionSommetB: "Réduction — sommet B",
  reductionSommetC: "Réduction — sommet C",
  identificationResolution: "Identification et résolution",
};

export function AppOrthogonalite() {
  const [etat, setEtat] = useState<EtatSessionOrthogonalite>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceOrthogonalite, nouvelEtat: EtatSessionOrthogonalite) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionOrthogonalite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteOrthogonalite)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Orthogonalité et théorème de Pythagore généralisé</h1>
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
        {dernierBilan ? (
          <ResultatPanelOrthogonalite
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionOrthogonalite resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "test" && exercice.variante === "test" ? (
          <EtapeTestOrthogonalite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseTest(etat, reponse));
            }}
          />
        ) : etat.phase === "reductionParametre" && exercice.variante === "parametre" ? (
          <EtapeReductionParametreOrthogonalite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseReductionParametre(etat, reponse))}
          />
        ) : etat.phase === "resolutionParametre" && exercice.variante === "parametre" ? (
          <EtapeResolutionParametreOrthogonalite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(valeur) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseResolutionParametre(etat, valeur));
            }}
          />
        ) : etat.phase === "constructionTriangle" && exercice.variante === "triangle" ? (
          <EtapeConstructionTriangleOrthogonalite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseConstructionTriangle(etat, reponse))}
          />
        ) : etat.phase === "testSommetA" && exercice.variante === "triangle" ? (
          <EtapeTestSommetOrthogonalite
            key="A"
            exercice={exercice}
            sommet="A"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeur) => setEtat(soumettreReponseTestSommet(etat, "A", valeur))}
          />
        ) : etat.phase === "testSommetB" && exercice.variante === "triangle" ? (
          <EtapeTestSommetOrthogonalite
            key="B"
            exercice={exercice}
            sommet="B"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeur) => setEtat(soumettreReponseTestSommet(etat, "B", valeur))}
          />
        ) : etat.phase === "testSommetC" && exercice.variante === "triangle" ? (
          <EtapeTestSommetOrthogonalite
            key="C"
            exercice={exercice}
            sommet="C"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeur) => setEtat(soumettreReponseTestSommet(etat, "C", valeur))}
          />
        ) : etat.phase === "conclusionTriangle" && exercice.variante === "triangle" ? (
          <EtapeConclusionTriangleOrthogonalite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseConclusionTriangle(etat, reponse));
            }}
          />
        ) : etat.phase === "constructionAvecX" && exercice.variante === "triangleParametre" ? (
          <EtapeConstructionAvecXOrthogonalite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseConstructionAvecXTriangle(etat, reponse))}
          />
        ) : etat.phase === "reductionSommetA" && exercice.variante === "triangleParametre" ? (
          <EtapeReductionSommetOrthogonalite
            key="A"
            exercice={exercice}
            sommet="A"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseReductionSommet(etat, "A", reponse))}
          />
        ) : etat.phase === "reductionSommetB" && exercice.variante === "triangleParametre" ? (
          <EtapeReductionSommetOrthogonalite
            key="B"
            exercice={exercice}
            sommet="B"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseReductionSommet(etat, "B", reponse))}
          />
        ) : etat.phase === "reductionSommetC" && exercice.variante === "triangleParametre" ? (
          <EtapeReductionSommetOrthogonalite
            key="C"
            exercice={exercice}
            sommet="C"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseReductionSommet(etat, "C", reponse))}
          />
        ) : etat.phase === "identificationResolution" && exercice.variante === "triangleParametre" ? (
          <EtapeIdentificationResolutionOrthogonalite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseIdentificationResolution(etat, reponse));
            }}
          />
        ) : null}
        </div>
      </main>
    </div>
  );
}
