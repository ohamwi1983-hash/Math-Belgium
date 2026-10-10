import { useState } from "react";
import type { ExerciceTriangleLies } from "./core/triangleLies.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionTriangleLies,
  soumettreReponseAngles,
  soumettreReponseCible,
  soumettreReponseInterpretation,
  soumettreReponsePont,
  soumettreReponsePontSommetPartage,
  soumettreReponseSoustraction,
} from "./moteur/sessionTriangleLies";
import type { EtatSessionTriangleLies, PhaseTriangleLies, ResultatExerciceTriangleLies } from "./moteur/typesTriangleLies";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceTriangleLies } from "./generateurs/triangleLies";
import type { FamilleTriangleLies } from "./core/triangleLies.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapePontTriangleLies } from "./components/EtapePontTriangleLies";
import { EtapeAnglesTriangleLies } from "./components/EtapeAnglesTriangleLies";
import { EtapeSoustractionTriangleLies } from "./components/EtapeSoustractionTriangleLies";
import { EtapeCibleTriangleLies } from "./components/EtapeCibleTriangleLies";
import { EtapeInterpretationTriangleLies } from "./components/EtapeInterpretationTriangleLies";
import { ResultatPanelTriangleLies } from "./components/ResultatPanelTriangleLies";
import { ResumeSessionTriangleLies } from "./components/ResumeSessionTriangleLies";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTriangleLies {
  return demarrerSessionTriangleLies(REGLAGES_DEMO, genererExerciceTriangleLies);
}

interface Bilan {
  resultat: ResultatExerciceTriangleLies;
  exercice: ExerciceTriangleLies;
}

/** Écrans nécessitant un calcul décimal non fourni par l'énoncé (résolution du triangle pont/cible
 * par loi des sinus/cosinus ou SOH-CAH-TOA) — "angles"/"soustraction" restent de l'arithmétique
 * triviale sur des données déjà affichées, "interpretation" un QCM. */
const PHASES_CALCULATRICE = new Set<PhaseTriangleLies>(["pont", "cible"]);

const LIBELLE_PHASE: Record<PhaseTriangleLies, string> = {
  pont: "Triangle pont",
  angles: "Angles du triangle cible",
  soustraction: "Côtés du triangle cible",
  cible: "Triangle cible",
  interpretation: "Interprétation",
};

export function AppTriangleLies() {
  const [etat, setEtat] = useState<EtatSessionTriangleLies>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceTriangleLies, nouvelEtat: EtatSessionTriangleLies) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(familleId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionTriangleLies(REGLAGES_DEMO, () => construireAvecFamilleId(familleId as FamilleTriangleLies)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Triangles liés (triangulation, côté ou angle partagé)</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={onGenererDev} />
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
          {enCoursDeSession && PHASES_CALCULATRICE.has(etat.phase) && <CalculatriceScientifique />}
          {dernierBilan ? (
            <ResultatPanelTriangleLies
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionTriangleLies resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "pont" ? (
            <EtapePontTriangleLies
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePont}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur) => setEtat(soumettreReponsePont(etat, valeur))}
              onValiderSommetPartage={(reponse) => setEtat(soumettreReponsePontSommetPartage(etat, reponse))}
            />
          ) : etat.phase === "angles" ? (
            <EtapeAnglesTriangleLies
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideAngles}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseAngles(etat, reponse))}
            />
          ) : etat.phase === "soustraction" ? (
            <EtapeSoustractionTriangleLies
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSoustraction}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseSoustraction(etat, reponse))}
            />
          ) : etat.phase === "cible" ? (
            <EtapeCibleTriangleLies
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCible}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur) => setEtat(soumettreReponseCible(etat, valeur))}
            />
          ) : etat.phase === "interpretation" ? (
            <EtapeInterpretationTriangleLies
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideInterpretation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(indexChoisi) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseInterpretation(etat, indexChoisi));
              }}
            />
          ) : null}{" "}
        </div>
      </main>
    </div>
  );
}
