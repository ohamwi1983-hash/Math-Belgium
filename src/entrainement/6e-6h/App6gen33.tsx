import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabilitesProblemes } from "./generateurs6e/probabilitesProblemes";
import type { IdVarianteProbabilitesProblemes } from "./generateurs6e/probabilitesProblemes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProbabilitesProblemes, soumettreReponseEcran } from "./moteur6e/sessionProbabilitesProblemes";
import type { EtatSessionProbabilitesProblemes, PhaseProbabilitesProblemes, ResultatExerciceProbabilitesProblemes } from "./moteur6e/typesProbabilitesProblemes";
import { diagnostiquerEcran, typeEcran } from "./moteur6e/verificationProbabilitesProblemes";
import { EtapeChampsProbabilitesProblemes } from "./components6e/EtapeChampsProbabilitesProblemes";
import { EtapeChoixProbabilitesProblemes } from "./components6e/EtapeChoixProbabilitesProblemes";
import { EtapeIntervalleProbabilitesProblemes } from "./components6e/EtapeIntervalleProbabilitesProblemes";
import { EtapeListeConfigurationsProbabilitesProblemes } from "./components6e/EtapeListeConfigurationsProbabilitesProblemes";
import { ResultatPanelProbabilitesProblemes } from "./components6e/ResultatPanelProbabilitesProblemes";
import { ResumeSessionProbabilitesProblemes } from "./components6e/ResumeSessionProbabilitesProblemes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2, blocDonnees, champsEcran, choixEcran, consigneEcran, consigneGenerale, etatActuel, placeholderListe } from "./ui6e/formatProbabilitesProblemes";

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

type AideParPhase = Partial<Record<PhaseProbabilitesProblemes, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceProbabilitesProblemes;
  aideParPhase: AideParPhase;
}


export function App6gen33() {
  const [etat, setEtat] = useState<EtatSessionProbabilitesProblemes>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionProbabilitesProblemes) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron `6gen18`/`6gen21`/`6gen23`/`6gen30`/
    // `6gen31`/`6gen32` répliqué à l'identique.
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
    setEtat(demarrerSessionProbabilitesProblemes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteProbabilitesProblemes)));
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
    (window as unknown as { __debug6gen33?: unknown }).__debug6gen33 = { exercice, phase };
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

  const type = typeEcran(exercice, phase);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Probabilités : problèmes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && type === "champs" && <EtapeChampsProbabilitesProblemes key={phase} {...propsCommun} champs={champsEcran(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />}

        {enCoursDeSession && type === "liste" && <EtapeListeConfigurationsProbabilitesProblemes key={phase} {...propsCommun} placeholder={placeholderListe(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />}

        {enCoursDeSession && type === "choix" && <EtapeChoixProbabilitesProblemes key={phase} {...propsCommun} options={choixEcran()} diagnostiquer={(choixId) => diagnostiquerEcran(exercice, phase, [choixId])} onValider={(choixId) => terminerEtape(soumettreReponseEcran(etat, [choixId]))} />}

        {enCoursDeSession && type === "intervalle" && <EtapeIntervalleProbabilitesProblemes key={phase} {...propsCommun} onValider={(ensemble) => terminerEtape(soumettreReponseEcran(etat, [JSON.stringify(ensemble)]))} />}

        {dernierBilan && <ResultatPanelProbabilitesProblemes resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionProbabilitesProblemes resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
