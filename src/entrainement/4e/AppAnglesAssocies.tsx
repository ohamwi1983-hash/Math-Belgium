import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionAnglesAssocies, soumettreReponse } from "./moteur/sessionAnglesAssocies";
import type { EtatSessionAnglesAssocies } from "./moteur/typesAnglesAssocies";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAnglesAssocies } from "./generateurs/anglesAssocies";
import type { IdVarianteAnglesAssocies } from "./core/anglesAssocies.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeAnglesAssocies } from "./components/EtapeAnglesAssocies";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Détermine la valeur demandée à l'aide des angles associés.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionAnglesAssocies {
  return demarrerSessionAnglesAssocies(REGLAGES_DEMO, genererExerciceAnglesAssocies);
}

/** État tenu en attente dès que l'écran unique se termine (bonne réponse, ou tentatives épuisées) —
 * l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionAnglesAssocies;
  revele: boolean;
}

/** Refonte écran unique (`promptgen17refontecomplete.md`) — plus de routage par phase, un seul
 * composant d'écran (`EtapeAnglesAssocies`) par exercice. */
export function AppAnglesAssocies() {
  const [etat, setEtat] = useState<EtatSessionAnglesAssocies>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionAnglesAssocies) {
    const transitionDEcran = nouvelEtat.resultats.length !== etat.resultats.length;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionAnglesAssocies(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteAnglesAssocies)));
  }

  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: etat.reglages.affichageReponseApresEchec ? <span>{exercice.valeurCible}</span> : undefined,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Angles associés</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapeAnglesAssocies
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(valeur) => terminerEtape(soumettreReponse(etat, valeur))}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
