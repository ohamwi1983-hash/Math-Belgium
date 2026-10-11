import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionTriangleQuelconque,
  soumettreReponseAire,
  soumettreReponseDonneeManquante,
} from "./moteur/sessionTriangleQuelconque";
import type { EtatSessionTriangleQuelconque, PhaseTriangleQuelconque } from "./moteur/typesTriangleQuelconque";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTriangleQuelconque } from "./generateurs/triangleQuelconque";
import type { ConfigurationTriangleQuelconque } from "./core/triangleQuelconque.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeDonneeManquante } from "./components/EtapeDonneeManquante";
import { EtapeAireTriangleQuelconque } from "./components/EtapeAireTriangleQuelconque";
import { calculerRecapitulatifTriangleQuelconque } from "./ui/recapitulatifTriangleQuelconque";
import { libelleDonneeManquante, valeurAffichageDonneeManquante } from "./ui/formatTriangleQuelconque";
import { valeurAire } from "./moteur/verificationTriangleQuelconque";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTriangleQuelconque {
  return demarrerSessionTriangleQuelconque(REGLAGES_DEMO, genererExerciceTriangleQuelconque);
}

const LIBELLE_PHASE: Record<PhaseTriangleQuelconque, string> = {
  donneeManquante: "Donnée manquante",
  aire: "Aire",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionTriangleQuelconque;
  revele: boolean;
}

export function AppTriangleQuelconque() {
  const [etat, setEtat] = useState<EtatSessionTriangleQuelconque>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const recapitulatif = calculerRecapitulatifTriangleQuelconque(etat);

  function terminerEtape(nouvelEtat: EtatSessionTriangleQuelconque) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = etat.phase === "donneeManquante" ? nouvelEtat.donneeManquanteRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.aireRevele;
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

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionTriangleQuelconque(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as ConfigurationTriangleQuelconque)));
  }

  const exercice = etat.exerciceCourant;

  const reponseAttendue =
    etat.phase === "donneeManquante" ? (
      <>
        {libelleDonneeManquante(exercice)} attendu(e) : {valeurAffichageDonneeManquante(exercice)}
      </>
    ) : (
      <>
        Aire attendue : {Math.round(valeurAire(exercice) * 100) / 100} {exercice.unite}²
      </>
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
        <h1 className="app-title">Triangle quelconque</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
          <CalculatriceScientifique />
          {etat.phase === "donneeManquante" ? (
            <EtapeDonneeManquante
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDonneeManquante}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur, unite) => terminerEtape(soumettreReponseDonneeManquante(etat, valeur, unite))}
              validation={validation}
            />
          ) : (
            <EtapeAireTriangleQuelconque
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              niveauAide={etat.niveauAideAire}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur, unite) => terminerEtape(soumettreReponseAire(etat, valeur, unite))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
