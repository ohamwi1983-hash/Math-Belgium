import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomeNewton } from "./generateurs6e/binomeNewton";
import type { IdVarianteBinomeNewton } from "./generateurs6e/binomeNewton";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionBinomeNewton, soumettreReponseEcran } from "./moteur6e/sessionBinomeNewton";
import type { EtatSessionBinomeNewton, PhaseBinomeNewton, ResultatExerciceBinomeNewton } from "./moteur6e/typesBinomeNewton";
import { diagnostiquerEcran } from "./moteur6e/verificationBinomeNewton";
import { EtapeChampsBinomeNewton } from "./components6e/EtapeChampsBinomeNewton";
import { ResultatPanelBinomeNewton } from "./components6e/ResultatPanelBinomeNewton";
import { ResumeSessionBinomeNewton } from "./components6e/ResumeSessionBinomeNewton";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatBinomeNewton";

/**
 * `6gen45` — Binôme de Newton. Chapitre "Analyse combinatoire" (mirroir 6gen43/6gen44 : réutilise
 * `coefficientBinomial` de `generateurs6e/combinatoire.ts`). Même patron que `App6gen43.tsx` : un
 * dispatcher générique piloté par `ui6e/formatBinomeNewton.ts`/`moteur6e/verificationBinomeNewton.ts`,
 * PAS de JSX par famille/écran — un SEUL composant écran (`EtapeChampsBinomeNewton`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionBinomeNewton {
  return demarrerSessionBinomeNewton(REGLAGES_DEMO, genererExerciceBinomeNewton);
}

type AideParPhase = Partial<Record<PhaseBinomeNewton, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceBinomeNewton;
  aideParPhase: AideParPhase;
}


export function App6gen45() {
  const [etat, setEtat] = useState<EtatSessionBinomeNewton>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionBinomeNewton) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen26/6gen37/6gen43 répliqué à
    // l'identique.
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
    setEtat(demarrerSessionBinomeNewton(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteBinomeNewton)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen45?: unknown }).__debug6gen45 = { exercice, phase };
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
        <h1 className="app-title">Binôme de Newton</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsBinomeNewton
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

        {dernierBilan && <ResultatPanelBinomeNewton resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionBinomeNewton resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
