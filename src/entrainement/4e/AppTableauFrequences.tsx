import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionTableauFrequences,
  soumettreReponseCumules,
  soumettreReponseFrequences,
  soumettreReponseFrequencesCumulees,
  soumettreReponseIdentification,
} from "./moteur/sessionTableauFrequences";
import type { EtatSessionTableauFrequences, PhaseTableauFrequences } from "./moteur/typesTableauFrequences";
import { genererExerciceTableauFrequences } from "./generateurs/tableauFrequences";
import { EtapeIdentificationTableauFrequences } from "./components/EtapeIdentificationTableauFrequences";
import { EtapeFrequencesTableauFrequences } from "./components/EtapeFrequencesTableauFrequences";
import { EtapeCumulesTableauFrequences } from "./components/EtapeCumulesTableauFrequences";
import { EtapeFrequencesCumuleesTableauFrequences } from "./components/EtapeFrequencesCumuleesTableauFrequences";
import {
  formatEnonceTexte,
  formatTableCumulesTexte,
  formatTableFrequencesCumuleesTexte,
  formatTableFrequencesTexte,
  formatTableIdentificationTexte,
} from "./ui/formatTableauFrequences";
import { EnTeteExercice } from "./components/EnTeteExercice";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTableauFrequences {
  return demarrerSessionTableauFrequences(REGLAGES_DEMO, genererExerciceTableauFrequences);
}

const LIBELLE_PHASE: Record<PhaseTableauFrequences, string> = {
  identification: "Identification",
  frequences: "Fréquences",
  cumules: "Effectifs cumulés",
  frequencesCumulees: "Fréquences cumulées",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionTableauFrequences;
  revele: boolean;
}

export function AppTableauFrequences() {
  const [etat, setEtat] = useState<EtatSessionTableauFrequences>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionTableauFrequences) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "identification"
          ? nouvelEtat.identificationRevele
          : etat.phase === "frequences"
            ? nouvelEtat.frequencesRevele
            : etat.phase === "cumules"
              ? nouvelEtat.cumulesRevele
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.frequencesCumuleesRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
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

  const reponseAttendue =
    etat.phase === "identification" ? (
      <>Valeurs/effectifs attendus : {formatTableIdentificationTexte(exercice)}</>
    ) : etat.phase === "frequences" ? (
      <>Fréquences attendues : {formatTableFrequencesTexte(exercice)}</>
    ) : etat.phase === "cumules" ? (
      <>Effectifs cumulés attendus : {formatTableCumulesTexte(exercice)}</>
    ) : (
      <>Fréquences cumulées attendues : {formatTableFrequencesCumuleesTexte(exercice)}</>
    );

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Tableau de fréquences</h1>
        <p className="app-subtitle">Chapitre 5</p>
      </header>

      <main className="card">
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>

        <div className="card-body">
          <EnTeteExercice consigneGenerale={formatEnonceTexte(exercice)} blocDonnees={null} />
          {etat.phase === "identification" ? (
            <EtapeIdentificationTableauFrequences
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideIdentification}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIdentification(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "frequences" ? (
            <EtapeFrequencesTableauFrequences
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideFrequences}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseFrequences(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "cumules" ? (
            <EtapeCumulesTableauFrequences
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCumules}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCumules(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeFrequencesCumuleesTableauFrequences
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideFrequencesCumulees}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseFrequencesCumulees(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
