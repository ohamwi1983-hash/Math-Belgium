import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMethodeGeneratrices } from "./generateurs6e/methodeGeneratrices";
import type { IdVarianteMethodeGeneratrices } from "./generateurs6e/methodeGeneratrices";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionMethodeGeneratrices, soumettreReponseEcran } from "./moteur6e/sessionMethodeGeneratrices";
import type { EtatSessionMethodeGeneratrices, PhaseMethodeGeneratrices, ResultatExerciceMethodeGeneratrices } from "./moteur6e/typesMethodeGeneratrices";
import { diagnostiquerEcran } from "./moteur6e/verificationMethodeGeneratrices";
import { EtapeChampsMethodeGeneratrices } from "./components6e/EtapeChampsMethodeGeneratrices";
import { ResultatPanelMethodeGeneratrices } from "./components6e/ResultatPanelMethodeGeneratrices";
import { ResumeSessionMethodeGeneratrices } from "./components6e/ResumeSessionMethodeGeneratrices";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatMethodeGeneratrices";

/**
 * `6gen57` — Problèmes de lieux : méthode des génératrices. Générateur D'OUVERTURE du chapitre
 * "Lieux géométriques" (voir `docs/historique-6e.md`). Même patron que `App6gen43.tsx`/
 * `App6gen50.tsx` : un dispatcher générique piloté par `ui6e/formatMethodeGeneratrices.ts`/
 * `moteur6e/verificationMethodeGeneratrices.ts`, PAS de JSX par famille/écran — un SEUL composant
 * écran (`EtapeChampsMethodeGeneratrices`), rendu avec `key={phase}` (les 5 écrans sont FIXES pour
 * ce générateur, `phase` seul suffit à identifier l'écran de façon unique — pas de `generationId`
 * supplémentaire nécessaire ici, contrairement à 6gen50).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionMethodeGeneratrices {
  return demarrerSessionMethodeGeneratrices(REGLAGES_DEMO, genererExerciceMethodeGeneratrices);
}

type AideParPhase = Partial<Record<PhaseMethodeGeneratrices, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceMethodeGeneratrices;
  aideParPhase: AideParPhase;
}


export function App6gen57() {
  const [etat, setEtat] = useState<EtatSessionMethodeGeneratrices>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionMethodeGeneratrices) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen43/6gen50 répliqué à l'identique.
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
    setEtat(demarrerSessionMethodeGeneratrices(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteMethodeGeneratrices)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés — mirroir
  // `App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen57?: unknown }).__debug6gen57 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran() : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Problèmes de lieux : méthode des génératrices</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsMethodeGeneratrices
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale()}
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

        {dernierBilan && <ResultatPanelMethodeGeneratrices resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionMethodeGeneratrices resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
