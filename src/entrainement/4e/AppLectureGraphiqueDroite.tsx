import { useState } from "react";
import type { ExerciceLectureGraphiqueDroite } from "./core/lectureGraphiqueDroite.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureGraphiqueDroite } from "./generateurs/lectureGraphiqueDroite";
import type { VarianteLectureGraphiqueDroite } from "./core/lectureGraphiqueDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLectureGraphiqueDroite,
  soumettreReponseCartesienne,
  soumettreReponseParametrique,
} from "./moteur/sessionLectureGraphiqueDroite";
import type { EtatSessionLectureGraphiqueDroite, ResultatExerciceLectureGraphiqueDroite } from "./moteur/typesLectureGraphiqueDroite";
import { EtapeLectureCartesienne } from "./components/EtapeLectureCartesienne";
import { EtapeLectureParametrique } from "./components/EtapeLectureParametrique";
import { ResultatPanelLectureGraphiqueDroite } from "./components/ResultatPanelLectureGraphiqueDroite";
import { ResumeSessionLectureGraphiqueDroite } from "./components/ResumeSessionLectureGraphiqueDroite";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionLectureGraphiqueDroite {
  return demarrerSessionLectureGraphiqueDroite(REGLAGES_DEMO, genererExerciceLectureGraphiqueDroite);
}

interface Bilan {
  resultat: ResultatExerciceLectureGraphiqueDroite;
  exercice: ExerciceLectureGraphiqueDroite;
}

export function AppLectureGraphiqueDroite() {
  const [etat, setEtat] = useState<EtatSessionLectureGraphiqueDroite>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceLectureGraphiqueDroite, nouvelEtat: EtatSessionLectureGraphiqueDroite) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionLectureGraphiqueDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteLectureGraphiqueDroite)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Lecture graphique — équation d'une droite</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <div className="card-body">
        {dernierBilan ? (
          <ResultatPanelLectureGraphiqueDroite
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionLectureGraphiqueDroite resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : exercice.variante === "cartesienne" ? (
          <EtapeLectureCartesienne
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseCartesienne(etat, texte));
            }}
          />
        ) : (
          <EtapeLectureParametrique
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseParametrique(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
