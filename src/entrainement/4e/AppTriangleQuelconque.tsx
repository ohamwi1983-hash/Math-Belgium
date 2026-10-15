import { useState } from "react";
import type { ReactNode } from "react";
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
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Résous ce triangle quelconque.";

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

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases du
 * générateur (voir `PhaseTriangleQuelconque`/les branches de `terminerEtape` ci-dessous). */
const ORDRE_PHASES: PhaseTriangleQuelconque[] = ["donneeManquante", "aire"];

/** Même ternaire que `terminerEtape` (ci-dessous) et `recapitulatifTriangleQuelconque.ts` pour lire
 * `scoreXxxExercice`/`xxxRevele` — jamais une valeur recalculée séparément. "aire" (dernière phase)
 * n'a pas de score tracké dans `EtatSessionTriangleQuelconque` : tant que l'exercice n'est pas
 * terminé elle est forcément "courante" (dernière phase active), et une fois terminé un nouvel
 * exercice démarre (l'état entier est remis à zéro). */
function calculerSegmentsProgression(etat: EtatSessionTriangleQuelconque): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = phase === "donneeManquante" ? etat.scoreDonneeManquanteExercice : null;
    if (score === null) return "a-venir";
    if (etat.donneeManquanteRevele) return "revele";
    return etat.niveauAideDonneeManquante > 0 ? "aide" : "correcte";
  });
}

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
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionTriangleQuelconque`, jamais dans le moteur (voir
   * AppAnalyseFonction.tsx). Remis à vide à chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const recapitulatif = calculerRecapitulatifTriangleQuelconque(etat);

  /** Même mécanisme que AppAnalyseFonction.tsx::ajouterHistorique — réutilise
   * `calculerRecapitulatifTriangleQuelconque` pour la réponse ATTENDUE ; cette fonction ne produit
   * jamais d'entrée pour "aire" (dernière phase), comme ailleurs sur ce chantier. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionTriangleQuelconque) {
    const recap = calculerRecapitulatifTriangleQuelconque(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      { titre: derniere.libelle, votreReponse, correcte: !derniere.revele, reponseAttendue: derniere.revele ? derniere.valeur : undefined },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (voir le commentaire détaillé
   * de AppAnalyseFonction.tsx::terminerEtape, même garde reproduit ici à l'identique). */
  function terminerEtape(nouvelEtat: EtatSessionTriangleQuelconque, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      const revele = etat.phase === "donneeManquante" ? nouvelEtat.donneeManquanteRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.aireRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
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
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <CalculatriceScientifique />
          {etat.phase === "donneeManquante" ? (
            <EtapeDonneeManquante
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDonneeManquante}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur, unite) => terminerEtape(soumettreReponseDonneeManquante(etat, valeur, unite), `${valeur} ${unite}`)}
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

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
