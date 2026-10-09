import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabilitesEnsembles } from "./generateurs6e/probabilitesEnsembles";
import type { IdVarianteProbabilitesEnsembles } from "./generateurs6e/probabilitesEnsembles";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProbabilitesEnsembles, soumettreReponseEcran } from "./moteur6e/sessionProbabilitesEnsembles";
import type { EtatSessionProbabilitesEnsembles, PhaseProbabilitesEnsembles, ResultatExerciceProbabilitesEnsembles } from "./moteur6e/typesProbabilitesEnsembles";
import { diagnostiquerEcran } from "./moteur6e/verificationProbabilitesEnsembles";
import { EtapeChampsProbabilitesEnsembles } from "./components6e/EtapeChampsProbabilitesEnsembles";
import { EtapeChoixProbabilitesEnsembles } from "./components6e/EtapeChoixProbabilitesEnsembles";
import { ResultatPanelProbabilitesEnsembles } from "./components6e/ResultatPanelProbabilitesEnsembles";
import { ResumeSessionProbabilitesEnsembles } from "./components6e/ResumeSessionProbabilitesEnsembles";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2, blocDonnees, champsEcran, choixEcran, consigneEcran, consigneGenerale, estEcranChoix, etatActuel } from "./ui6e/formatProbabilitesEnsembles";

/**
 * `6gen30` — Probabilités et ensembles (chapitre 8, "Probabilités", PREMIER générateur de ce
 * chapitre). Même patron que `App6gen23.tsx` (6gen23) : aucun bloc JSX par famille/écran, un seul
 * dispatch piloté par `ui6e/formatProbabilitesEnsembles.ts` (`champsEcran`/`choixEcran`, selon
 * `estEcranChoix`) et `moteur6e/verificationProbabilitesEnsembles.ts` (`diagnostiquerEcran`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProbabilitesEnsembles {
  return demarrerSessionProbabilitesEnsembles(REGLAGES_DEMO, genererExerciceProbabilitesEnsembles);
}

type AideParPhase = Partial<Record<PhaseProbabilitesEnsembles, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceProbabilitesEnsembles;
  aideParPhase: AideParPhase;
}


export function App6gen30() {
  const [etat, setEtat] = useState<EtatSessionProbabilitesEnsembles>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionProbabilitesEnsembles) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron `6gen18`/`6gen21`/`6gen23` répliqué à
    // l'identique (voir `moteur6e/sessionProbabilitesEnsembles.ts`, fonction `soumettreReponseEcran`).
    const miseAJour: AideParPhase = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereTransitionRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionProbabilitesEnsembles(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteProbabilitesEnsembles)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

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

  const propsCommun = {
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    etatActuel: etatActuel(exercice, phase),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    ...aideCommun,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Probabilités et ensembles</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession &&
          (estEcranChoix(phase) ? (
            <EtapeChoixProbabilitesEnsembles key={phase} {...propsCommun} options={choixEcran(exercice, phase)} diagnostiquer={(choixId) => diagnostiquerEcran(exercice, phase, [choixId])} onValider={(choixId) => terminerEtape(soumettreReponseEcran(etat, [choixId]))} />
          ) : (
            <EtapeChampsProbabilitesEnsembles key={phase} {...propsCommun} champs={champsEcran(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />
          ))}

        {dernierBilan && <ResultatPanelProbabilitesEnsembles resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionProbabilitesEnsembles resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
