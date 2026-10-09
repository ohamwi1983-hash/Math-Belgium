import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabiliteHypergeometrique } from "./generateurs6e/probabiliteHypergeometrique";
import type { IdVarianteProbabiliteHypergeometrique } from "./generateurs6e/probabiliteHypergeometrique";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProbabiliteHypergeometrique, soumettreReponseEcran } from "./moteur6e/sessionProbabiliteHypergeometrique";
import type { EtatSessionProbabiliteHypergeometrique, PhaseProbabiliteHypergeometrique, ResultatExerciceProbabiliteHypergeometrique } from "./moteur6e/typesProbabiliteHypergeometrique";
import { diagnostiquerEcran } from "./moteur6e/verificationProbabiliteHypergeometrique";
import { EtapeChampsProbabiliteHypergeometrique } from "./components6e/EtapeChampsProbabiliteHypergeometrique";
import { ResultatPanelProbabiliteHypergeometrique } from "./components6e/ResultatPanelProbabiliteHypergeometrique";
import { ResumeSessionProbabiliteHypergeometrique } from "./components6e/ResumeSessionProbabiliteHypergeometrique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatProbabiliteHypergeometrique";

/**
 * `6gen47` — Probabilité hypergéométrique (tirage sans remise). Chapitre "Analyse combinatoire".
 * Même patron que `App6gen43.tsx`/`App6gen44.tsx` : un dispatcher générique piloté par
 * `ui6e/formatProbabiliteHypergeometrique.ts`/`moteur6e/verificationProbabiliteHypergeometrique.ts`,
 * PAS de JSX par famille/écran — un SEUL composant écran (`EtapeChampsProbabiliteHypergeometrique`)
 * gère tous les écrans (uniquement des champs texte libre ici — aucun écran de choix), piloté
 * entièrement par `champs: ChampDef[]`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProbabiliteHypergeometrique {
  return demarrerSessionProbabiliteHypergeometrique(REGLAGES_DEMO, genererExerciceProbabiliteHypergeometrique);
}

type AideParPhase = Partial<Record<PhaseProbabiliteHypergeometrique, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceProbabiliteHypergeometrique;
  aideParPhase: AideParPhase;
}


export function App6gen47() {
  const [etat, setEtat] = useState<EtatSessionProbabiliteHypergeometrique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionProbabiliteHypergeometrique) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen26/6gen37/6gen43 répliqué
    // à l'identique.
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
    setAideParPhase({});
    setEtat(demarrerSessionProbabiliteHypergeometrique(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteProbabiliteHypergeometrique)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même —
  // mirroir `App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen47?: unknown }).__debug6gen47 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Probabilité hypergéométrique (tirage sans remise)</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsProbabiliteHypergeometrique
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {dernierBilan && <ResultatPanelProbabiliteHypergeometrique resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionProbabiliteHypergeometrique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
