import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabilitesEnsembles } from "./generateurs6e/probabilitesEnsembles";
import type { IdVarianteProbabilitesEnsembles } from "./generateurs6e/probabilitesEnsembles";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProbabilitesEnsembles, soumettreReponseEcran } from "./moteur6e/sessionProbabilitesEnsembles";
import type { EtatSessionProbabilitesEnsembles } from "./moteur6e/typesProbabilitesEnsembles";
import { diagnostiquerEcran } from "./moteur6e/verificationProbabilitesEnsembles";
import { Katex } from "./components/Katex";
import { EtapeChampsProbabilitesEnsembles } from "./components6e/EtapeChampsProbabilitesEnsembles";
import { EtapeChoixProbabilitesEnsembles } from "./components6e/EtapeChoixProbabilitesEnsembles";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2, blocDonnees, champsEcran, choixEcran, consigneEcran, consigneGenerale, estEcranChoix, formatReponseAttenduePhaseLatex } from "./ui6e/formatProbabilitesEnsembles";
import { calculerRecapitulatifProbabilitesEnsembles, calculerSegmentsProgressionProbabilitesEnsembles } from "./ui6e/recapitulatifProbabilitesEnsembles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen30` — Probabilités et ensembles (chapitre 8, "Probabilités", PREMIER générateur de ce
 * chapitre). Même patron que `App6gen23.tsx` (6gen23) : aucun bloc JSX par famille/écran, un seul
 * dispatch piloté par `ui6e/formatProbabilitesEnsembles.ts` (`champsEcran`/`choixEcran`, selon
 * `estEcranChoix`) et `moteur6e/verificationProbabilitesEnsembles.ts` (`diagnostiquerEcran`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProbabilitesEnsembles {
  return demarrerSessionProbabilitesEnsembles(REGLAGES_DEMO, genererExerciceProbabilitesEnsembles);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionProbabilitesEnsembles;
  revele: boolean;
}

export function App6gen30() {
  const [etat, setEtat] = useState<EtatSessionProbabilitesEnsembles>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionProbabilitesEnsembles) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
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
    setEtat(demarrerSessionProbabilitesEnsembles(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteProbabilitesEnsembles)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le LaTeX affiché.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen30?: unknown }).__debug6gen30 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const propsCommun = {
    estPremierEcran,
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    ...aideCommun,
    validation,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Probabilités et ensembles</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionProbabilitesEnsembles(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifProbabilitesEnsembles(etat)} />
        {estEcranChoix(phase) ? (
          <EtapeChoixProbabilitesEnsembles key={phase} {...propsCommun} options={choixEcran(exercice, phase)} diagnostiquer={(choixId) => diagnostiquerEcran(exercice, phase, [choixId])} onValider={(choixId) => terminerEtape(soumettreReponseEcran(etat, [choixId]))} />
        ) : (
          <EtapeChampsProbabilitesEnsembles key={phase} {...propsCommun} champs={champsEcran(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />
        )}
      </main>
    </div>
  );
}
