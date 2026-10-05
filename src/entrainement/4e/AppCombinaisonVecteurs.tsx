import { useState } from "react";
import type { ExerciceCombinaisonVecteurs } from "./core/combinaisonVecteurs.types";
import type { ReglagesSession } from "./core/session.types";
import { activerAideSuivante, demarrerSessionCombinaisonVecteurs, soumettreReponseComposantes, soumettreReponseSimplification } from "./moteur/sessionCombinaisonVecteurs";
import type { EtatSessionCombinaisonVecteurs, PhaseCombinaisonVecteurs, ResultatExerciceCombinaisonVecteurs } from "./moteur/typesCombinaisonVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCombinaisonVecteurs } from "./generateurs/combinaisonVecteurs";
import type { VarianteCombinaisonVecteurs } from "./core/combinaisonVecteurs.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSimplificationCombinaisonVecteurs } from "./components/EtapeSimplificationCombinaisonVecteurs";
import { EtapeComposantesCombinaisonVecteurs } from "./components/EtapeComposantesCombinaisonVecteurs";
import { ResultatPanelCombinaisonVecteurs } from "./components/ResultatPanelCombinaisonVecteurs";
import { ResumeSessionCombinaisonVecteurs } from "./components/ResumeSessionCombinaisonVecteurs";
import { calculerRecapitulatifCombinaisonVecteurs } from "./ui/recapitulatifCombinaisonVecteurs";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionCombinaisonVecteurs {
  return demarrerSessionCombinaisonVecteurs(REGLAGES_DEMO, genererExerciceCombinaisonVecteurs);
}

interface Bilan {
  resultat: ResultatExerciceCombinaisonVecteurs;
  exercice: ExerciceCombinaisonVecteurs;
}

const LIBELLE_PHASE: Record<PhaseCombinaisonVecteurs, string> = {
  simplification: "Réduction symbolique",
  composantes: "Composantes",
};

/**
 * "Calcul de composantes de combinaisons linéaires" — **remplace en place** (même position, 22e
 * bouton) l'ancienne version plus simple de ce générateur (`promptcreationgenerateur21combinaisonslineaires.md`,
 * consultation utilisateur explicite face à un chevauchement de nom détecté avant implémentation —
 * voir CLAUDE.md et `core/combinaisonVecteurs.types.ts`).
 */
export function AppCombinaisonVecteurs() {
  const [etat, setEtat] = useState<EtatSessionCombinaisonVecteurs>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceCombinaisonVecteurs, nouvelEtat: EtatSessionCombinaisonVecteurs) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifCombinaisonVecteurs(etat);

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionCombinaisonVecteurs(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteCombinaisonVecteurs)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Calcul de composantes de combinaisons linéaires</h1>
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
          <ResultatPanelCombinaisonVecteurs
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionCombinaisonVecteurs resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "simplification" ? (
          <EtapeSimplificationCombinaisonVecteurs
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideSimplification}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => setEtat(soumettreReponseSimplification(etat, texte))}
          />
        ) : (
          <EtapeComposantesCombinaisonVecteurs
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideComposantes}
            recapitulatif={recapitulatif}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseComposantes(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
