import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabilitesProblemes } from "./generateurs6e/probabilitesProblemes";
import type { IdVarianteProbabilitesProblemes } from "./generateurs6e/probabilitesProblemes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProbabilitesProblemes, soumettreReponseEcran } from "./moteur6e/sessionProbabilitesProblemes";
import type { EtatSessionProbabilitesProblemes } from "./moteur6e/typesProbabilitesProblemes";
import { diagnostiquerEcran, typeEcran } from "./moteur6e/verificationProbabilitesProblemes";
import { Katex } from "./components/Katex";
import { EtapeChampsProbabilitesProblemes } from "./components6e/EtapeChampsProbabilitesProblemes";
import { EtapeChoixProbabilitesProblemes } from "./components6e/EtapeChoixProbabilitesProblemes";
import { EtapeIntervalleProbabilitesProblemes } from "./components6e/EtapeIntervalleProbabilitesProblemes";
import { EtapeListeConfigurationsProbabilitesProblemes } from "./components6e/EtapeListeConfigurationsProbabilitesProblemes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2, blocDonnees, champsEcran, choixEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, placeholderListe } from "./ui6e/formatProbabilitesProblemes";
import { calculerRecapitulatifProbabilitesProblemes, calculerSegmentsProgressionProbabilitesProblemes } from "./ui6e/recapitulatifProbabilitesProblemes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen33` — Probabilités : problèmes (chapitre 8, "Probabilités", générateur de CLÔTURE du
 * chapitre, après `6gen30`/`6gen31`/`6gen32`). Même patron que `App6gen30.tsx` (dispatch
 * champs/choix) ÉTENDU à 4 types d'écran (`typeEcran` de `moteur6e/
 * verificationProbabilitesProblemes.ts` : "champs"/"liste"/"choix"/"intervalle") — aucun bloc JSX
 * par famille/écran, un seul dispatch piloté par `ui6e/formatProbabilitesProblemes.ts` et
 * `moteur6e/verificationProbabilitesProblemes.ts`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProbabilitesProblemes {
  return demarrerSessionProbabilitesProblemes(REGLAGES_DEMO, genererExerciceProbabilitesProblemes);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionProbabilitesProblemes;
  revele: boolean;
}

export function App6gen33() {
  const [etat, setEtat] = useState<EtatSessionProbabilitesProblemes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionProbabilitesProblemes) {
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
    setEtat(demarrerSessionProbabilitesProblemes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteProbabilitesProblemes)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le LaTeX affiché.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen33?: unknown }).__debug6gen33 = { exercice, phase };
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
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    ...aideCommun,
    validation,
  };

  const type = typeEcran(exercice, phase);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Probabilités : problèmes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionProbabilitesProblemes(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifProbabilitesProblemes(etat)} />
        {type === "champs" && <EtapeChampsProbabilitesProblemes key={phase} {...propsCommun} champs={champsEcran(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />}

        {type === "liste" && <EtapeListeConfigurationsProbabilitesProblemes key={phase} {...propsCommun} placeholder={placeholderListe(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />}

        {type === "choix" && <EtapeChoixProbabilitesProblemes key={phase} {...propsCommun} options={choixEcran()} diagnostiquer={(choixId) => diagnostiquerEcran(exercice, phase, [choixId])} onValider={(choixId) => terminerEtape(soumettreReponseEcran(etat, [choixId]))} />}

        {type === "intervalle" && <EtapeIntervalleProbabilitesProblemes key={phase} {...propsCommun} onValider={(ensemble) => terminerEtape(soumettreReponseEcran(etat, [JSON.stringify(ensemble)]))} />}
      </main>
    </div>
  );
}
