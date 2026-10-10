import { useState } from "react";
import type { ExerciceOmbreSoleil } from "./core/ombreSoleil.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionOmbreSoleil,
  soumettreConclusion,
  soumettreReponseDirection,
  soumettreReponseDirectionInconnue,
  soumettreReponsePoint,
  soumettreReponsePointSimple,
} from "./moteur/sessionOmbreSoleil";
import type { EtatSessionOmbreSoleil, PhaseOmbreSoleil, ResultatExerciceOmbreSoleil } from "./moteur/typesOmbreSoleil";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOmbreSoleil } from "./generateurs/ombreSoleil";
import type { VarianteOmbreSoleil } from "./core/ombreSoleil.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeConclusionOmbreSoleil } from "./components/EtapeConclusionOmbreSoleil";
import { EtapeDirectionInconnue } from "./components/EtapeDirectionInconnue";
import { EtapeDirectionOmbre } from "./components/EtapeDirectionOmbre";
import { EtapePointOmbre } from "./components/EtapePointOmbre";
import { EtapePointSimple } from "./components/EtapePointSimple";
import { ResultatPanelOmbreSoleil } from "./components/ResultatPanelOmbreSoleil";
import { ResumeSessionOmbreSoleil } from "./components/ResumeSessionOmbreSoleil";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionOmbreSoleil {
  return demarrerSessionOmbreSoleil(REGLAGES_DEMO, genererExerciceOmbreSoleil);
}

interface Bilan {
  resultat: ResultatExerciceOmbreSoleil;
  exercice: ExerciceOmbreSoleil;
}

/** Libellé de la phase COURANTE — même principe que "Section plane d'un solide" : le nombre
 * d'écrans varie par exercice (variante + nombre d'obstacles/de piquets), la progression AU SEIN de
 * la boucle est portée par `texteProgressionBoucle`, pas par ce libellé fixe. */
const LIBELLE_PHASE: Record<PhaseOmbreSoleil, string> = {
  pointSimple: "Point d'ombre",
  directionInconnue: "Direction inconnue",
  direction: "Direction",
  point: "Point d'ombre",
  conclusion: "Conclusion",
};

export function AppOmbreSoleil() {
  const [etat, setEtat] = useState<EtatSessionOmbreSoleil>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceOmbreSoleil, nouvelEtat: EtatSessionOmbreSoleil) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionOmbreSoleil(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteOmbreSoleil)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Ombre au soleil</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie dans l'espace</p>
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
          <ResultatPanelOmbreSoleil
            resultat={dernierBilan.resultat}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionOmbreSoleil resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "pointSimple" && exercice.variante === "simple" ? (
          <EtapePointSimple
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(id) => setEtat(soumettreReponsePointSimple(etat, id))}
          />
        ) : etat.phase === "directionInconnue" && exercice.variante === "directionInconnue" ? (
          <EtapeDirectionInconnue
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(id) => setEtat(soumettreReponseDirectionInconnue(etat, id))}
          />
        ) : etat.phase === "direction" && exercice.variante !== "simple" ? (
          <EtapeDirectionOmbre
            key={etat.resolus.length}
            exercice={exercice}
            resolus={etat.resolus}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(id) => setEtat(soumettreReponseDirection(etat, id))}
          />
        ) : etat.phase === "point" && exercice.variante !== "simple" ? (
          <EtapePointOmbre
            key={etat.resolus.length}
            exercice={exercice}
            resolus={etat.resolus}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(id) => setEtat(soumettreReponsePoint(etat, id))}
          />
        ) : (
          <EtapeConclusionOmbreSoleil
            exercice={exercice}
            onContinuer={() => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreConclusion(etat));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
