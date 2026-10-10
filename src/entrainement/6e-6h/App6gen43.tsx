import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementFondamental } from "./generateurs6e/denombrementFondamental";
import type { IdVarianteDenombrementFondamental } from "./generateurs6e/denombrementFondamental";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionDenombrementFondamental, soumettreReponseEcran } from "./moteur6e/sessionDenombrementFondamental";
import type { EtatSessionDenombrementFondamental, PhaseDenombrementFondamental, ResultatExerciceDenombrementFondamental } from "./moteur6e/typesDenombrementFondamental";
import { diagnostiquerEcran } from "./moteur6e/verificationDenombrementFondamental";
import { EtapeChampsDenombrementFondamental } from "./components6e/EtapeChampsDenombrementFondamental";
import { ResultatPanelDenombrementFondamental } from "./components6e/ResultatPanelDenombrementFondamental";
import { ResumeSessionDenombrementFondamental } from "./components6e/ResumeSessionDenombrementFondamental";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatDenombrementFondamental";

/**
 * `6gen43` — Dénombrement fondamental et arrangements. GÉNÉRATEUR D'OUVERTURE du chapitre "Analyse
 * combinatoire" (voir `docs/historique-6e.md`). Même patron que `App6gen26.tsx`/`App6gen37.tsx` :
 * un dispatcher générique piloté par `ui6e/formatDenombrementFondamental.ts`/
 * `moteur6e/verificationDenombrementFondamental.ts`, PAS de JSX par famille/écran — un SEUL
 * composant écran (`EtapeChampsDenombrementFondamental`) gère À LA FOIS les champs texte libre ET
 * les 2 écrans de choix (famille C écran 1, famille E écran 1), piloté entièrement par
 * `champs: ChampDef[]` (mirroir `EtapeChampsCalculAires.tsx`/`App6gen26.tsx`, jamais besoin d'un
 * composant séparé pour un écran de choix ici).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDenombrementFondamental {
  return demarrerSessionDenombrementFondamental(REGLAGES_DEMO, genererExerciceDenombrementFondamental);
}

type AideParPhase = Partial<Record<PhaseDenombrementFondamental, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceDenombrementFondamental;
  aideParPhase: AideParPhase;
}


export function App6gen43() {
  const [etat, setEtat] = useState<EtatSessionDenombrementFondamental>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionDenombrementFondamental) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen26/6gen37 répliqué à
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
    setEtat(demarrerSessionDenombrementFondamental(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteDenombrementFondamental)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen37.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen43?: unknown }).__debug6gen43 = { exercice, phase };
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
        <h1 className="app-title">Dénombrement fondamental et arrangements</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsDenombrementFondamental
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

        {dernierBilan && <ResultatPanelDenombrementFondamental resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionDenombrementFondamental resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
