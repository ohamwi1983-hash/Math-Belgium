import { useState } from "react";
import type { DroiteImplicite } from "./core/droite.types";
import type { ExerciceDistanceDroite } from "./core/distanceDroite.types";
import type { ReglagesSession } from "./core/session.types";
import type { Point } from "./core/vecteur.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDistanceDroite } from "./generateurs/distanceDroite";
import type { VarianteDistanceDroite } from "./core/distanceDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import {
  activerAideSuivante,
  demarrerSessionDistanceDroite,
  soumettreReponseChoixPoint,
  soumettreReponseDistancePQ,
  soumettreReponseEquationB,
  soumettreReponseIntersectionQ,
} from "./moteur/sessionDistanceDroite";
import type { EtatSessionDistanceDroite, PhaseDistanceDroite, ResultatExerciceDistanceDroite } from "./moteur/typesDistanceDroite";
import { EtapeChoixPointDistanceDroite } from "./components/EtapeChoixPointDistanceDroite";
import { EtapeDistancePQDistanceDroite } from "./components/EtapeDistancePQDistanceDroite";
import { EtapeEquationBDistanceDroite } from "./components/EtapeEquationBDistanceDroite";
import { EtapeIntersectionQDistanceDroite } from "./components/EtapeIntersectionQDistanceDroite";
import { ResultatPanelDistanceDroite } from "./components/ResultatPanelDistanceDroite";
import { ResumeSessionDistanceDroite } from "./components/ResumeSessionDistanceDroite";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionDistanceDroite {
  return demarrerSessionDistanceDroite(REGLAGES_DEMO, genererExerciceDistanceDroite);
}

interface Bilan {
  resultat: ResultatExerciceDistanceDroite;
  exercice: ExerciceDistanceDroite;
  point: Point;
  droiteCible: DroiteImplicite;
  bAttendue: DroiteImplicite;
  qAttendu: Point;
}

const LIBELLE_PHASE: Record<PhaseDistanceDroite, string> = {
  choixPoint: "Choix d'un point sur la droite",
  equationB: "Équation de la perpendiculaire b",
  intersectionQ: "Coordonnées de Q",
  distancePQ: "Distance PQ",
};

export function AppDistanceDroite() {
  const [etat, setEtat] = useState<EtatSessionDistanceDroite>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceDistanceDroite, point: Point, droiteCible: DroiteImplicite, bAttendue: DroiteImplicite, qAttendu: Point, nouvelEtat: EtatSessionDistanceDroite) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({
        resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!,
        exercice: exerciceTermine,
        point,
        droiteCible,
        bAttendue,
        qAttendu,
      });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionDistanceDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteDistanceDroite)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Distance point-droite et droite-droite (méthode géométrique)</h1>
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
        {enCoursDeSession && etat.phase === "distancePQ" && <CalculatriceScientifique />}
        {dernierBilan ? (
          <ResultatPanelDistanceDroite
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            point={dernierBilan.point}
            droiteCible={dernierBilan.droiteCible}
            bAttendue={dernierBilan.bAttendue}
            qAttendu={dernierBilan.qAttendu}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionDistanceDroite resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "choixPoint" && exercice.variante === "paralleles" ? (
          <EtapeChoixPointDistanceDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideChoixPoint}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseChoixPoint(etat, reponse))}
          />
        ) : etat.phase === "equationB" && etat.point !== null && etat.droiteCible !== null && etat.bAttendue !== null ? (
          <EtapeEquationBDistanceDroite
            exercice={exercice}
            point={etat.point}
            droiteCible={etat.droiteCible}
            bAttendue={etat.bAttendue}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideEquationB}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseEquationB(etat, reponse))}
          />
        ) : etat.phase === "intersectionQ" && etat.point !== null && etat.bAttendue !== null && etat.droiteCible !== null && etat.qAttendu !== null ? (
          <EtapeIntersectionQDistanceDroite
            exercice={exercice}
            point={etat.point}
            bAttendue={etat.bAttendue}
            droiteCible={etat.droiteCible}
            qAttendu={etat.qAttendu}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideIntersectionQ}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseIntersectionQ(etat, reponse))}
          />
        ) : etat.phase === "distancePQ" && etat.point !== null && etat.droiteCible !== null && etat.bAttendue !== null && etat.qAttendu !== null ? (
          (() => {
            const { point, droiteCible, bAttendue, qAttendu } = etat;
            return (
              <EtapeDistancePQDistanceDroite
                exercice={exercice}
                point={point}
                droiteCible={droiteCible}
                bAttendue={bAttendue}
                qAttendu={qAttendu}
                tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                tentativesMax={etat.reglages.tentativesMax}
                niveauAide={etat.niveauAideDistancePQ}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => {
                  const exerciceTermine = exercice;
                  terminerEtape(exerciceTermine, point, droiteCible, bAttendue, qAttendu, soumettreReponseDistancePQ(etat, reponse));
                }}
              />
            );
          })()
        ) : null}
        </div>
      </main>
    </div>
  );
}
