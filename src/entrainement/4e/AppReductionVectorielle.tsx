import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionReductionVectorielle, soumettreReponseReduction } from "./moteur/sessionReductionVectorielle";
import type { EtatSessionReductionVectorielle } from "./moteur/typesReductionVectorielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceReductionVectorielle } from "./generateurs/reductionVectorielle";
import type { FigureReduction } from "./core/reductionVectorielle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReductionVectorielle } from "./components/EtapeReductionVectorielle";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionReductionVectorielle {
  return demarrerSessionReductionVectorielle(REGLAGES_DEMO, genererExerciceReductionVectorielle);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionReductionVectorielle;
  revele: boolean;
}

/** Pas de `Phase` : un seul écran par exercice. Mono-écran : la transition n'est jamais qu'une
 * clôture d'exercice (`terminee` passe à `true`, `nombreExercices` vaut 1). */
export function AppReductionVectorielle() {
  const [etat, setEtat] = useState<EtatSessionReductionVectorielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionReductionVectorielle) {
    const transitionDEcran = nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
      setEnAttente({ etatSuivant: nouvelEtat, revele: resultat.reductionRevele });
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
    setEtat(demarrerSessionReductionVectorielle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as FigureReduction)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <>
            Réponse attendue : {exercice.pointDepart}
            {exercice.pointArrivee}
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
        <h1 className="app-title">Réduction d'une somme de vecteurs (Chasles)</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <div className="card-body">
          <EtapeReductionVectorielle
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(texte) => terminerEtape(soumettreReponseReduction(etat, texte))}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
