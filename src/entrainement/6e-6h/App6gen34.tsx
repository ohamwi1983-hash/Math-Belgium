import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceNombresComplexes } from "./generateurs6e/nombresComplexes";
import type { IdVarianteNombresComplexes } from "./generateurs6e/nombresComplexes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionNombresComplexes, soumettreReponseEcran } from "./moteur6e/sessionNombresComplexes";
import type { EtatSessionNombresComplexes, PhaseNombresComplexes, ResultatExerciceNombresComplexes } from "./moteur6e/typesNombresComplexes";
import { diagnostiquerEcran } from "./moteur6e/verificationNombresComplexes";
import { EtapeChampsNombresComplexes } from "./components6e/EtapeChampsNombresComplexes";
import { ResultatPanelNombresComplexes } from "./components6e/ResultatPanelNombresComplexes";
import { ResumeSessionNombresComplexes } from "./components6e/ResumeSessionNombresComplexes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatNombresComplexes";

/**
 * `6gen34` — Nombres complexes : opérations de base et puissances de i (chapitre 7, "Nombres
 * complexes", PREMIER générateur de ce chapitre). Même patron que `App6gen28.tsx`/`App6gen23.tsx` :
 * un dispatcher générique piloté par `ui6e/formatNombresComplexes.ts`/
 * `moteur6e/verificationNombresComplexes.ts`, PAS de JSX par famille/écran. Tous les écrans sont de
 * la saisie libre à arité FIXE (1 à 2 champs), donc `EtapeChampsNombresComplexes` (mirroir
 * `EtapeChampsLongueurArc.tsx`) suffit.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionNombresComplexes {
  return demarrerSessionNombresComplexes(REGLAGES_DEMO, genererExerciceNombresComplexes);
}

type AideParPhase = Partial<Record<PhaseNombresComplexes, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceNombresComplexes;
  aideParPhase: AideParPhase;
}


export function App6gen34() {
  const [etat, setEtat] = useState<EtatSessionNombresComplexes>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionNombresComplexes) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen28 répliqué à l'identique.
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
    setEtat(demarrerSessionNombresComplexes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteNombresComplexes)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen28.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen34?: unknown }).__debug6gen34 = { exercice, phase };
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
        <h1 className="app-title">Nombres complexes : opérations de base et puissances de i</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsNombresComplexes
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

        {dernierBilan && <ResultatPanelNombresComplexes resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionNombresComplexes resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
