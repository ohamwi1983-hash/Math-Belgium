import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionPointVectoriel, soumettreReponseCoordonnees } from "./moteur/sessionPointVectoriel";
import type { EtatSessionPointVectoriel } from "./moteur/typesPointVectoriel";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointVectoriel } from "./generateurs/pointVectoriel";
import type { VariantePointVectoriel } from "./core/pointVectoriel.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapePointVectoriel } from "./components/EtapePointVectoriel";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionPointVectoriel {
  return demarrerSessionPointVectoriel(REGLAGES_DEMO, genererExercicePointVectoriel);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionPointVectoriel;
  revele: boolean;
}

/** Pas de `Phase` (comme "Quel angle ?") : un seul écran par exercice. Mono-écran : la transition
 * n'est jamais qu'une clôture d'exercice (`terminee` passe à `true`, `nombreExercices` vaut 1). */
export function AppPointVectoriel() {
  const [etat, setEtat] = useState<EtatSessionPointVectoriel>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionPointVectoriel) {
    const transitionDEcran = nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
      setEnAttente({ etatSuivant: nouvelEtat, revele: resultat.coordonneesRevele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionPointVectoriel(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VariantePointVectoriel)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <>
            {exercice.pointCherche} attendu : ({exercice.reponse.x} ; {exercice.reponse.y})
          </>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Point à partir d'une relation vectorielle (libre)</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <div className="card-body">
          <EtapePointVectoriel
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => terminerEtape(soumettreReponseCoordonnees(etat, reponse))}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
