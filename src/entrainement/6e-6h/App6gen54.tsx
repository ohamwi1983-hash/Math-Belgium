import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointsDroitesRemarquablesTriangle } from "./generateurs6e/pointsDroitesRemarquablesTriangle";
import type { IdVariantePointsDroitesRemarquablesTriangle } from "./generateurs6e/pointsDroitesRemarquablesTriangle";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionPointsDroitesRemarquablesTriangle, soumettreReponseEcran } from "./moteur6e/sessionPointsDroitesRemarquablesTriangle";
import type { EtatSessionPointsDroitesRemarquablesTriangle, PhasePointsDroitesRemarquablesTriangle, ResultatExercicePointsDroitesRemarquablesTriangle } from "./moteur6e/typesPointsDroitesRemarquablesTriangle";
import { diagnostiquerEcran } from "./moteur6e/verificationPointsDroitesRemarquablesTriangle";
import { EtapeChampsPointsDroitesRemarquablesTriangle } from "./components6e/EtapeChampsPointsDroitesRemarquablesTriangle";
import { ResultatPanelPointsDroitesRemarquablesTriangle } from "./components6e/ResultatPanelPointsDroitesRemarquablesTriangle";
import { ResumeSessionPointsDroitesRemarquablesTriangle } from "./components6e/ResumeSessionPointsDroitesRemarquablesTriangle";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, consigneEcran, consigneGenerale, definitionEcran, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatPointsDroitesRemarquablesTriangle";

/**
 * `6gen54` — Points et droites remarquables du triangle. GÉNÉRATEUR D'OUVERTURE du chapitre "Lieux
 * géométriques" (voir `docs/historique-6e.md`). Même patron que `App6gen43.tsx`/`App6gen53.tsx` :
 * un dispatcher générique piloté par `ui6e/formatPointsDroitesRemarquablesTriangle.ts`/
 * `moteur6e/verificationPointsDroitesRemarquablesTriangle.ts`, PAS de JSX par famille/écran — un
 * SEUL composant écran (`EtapeChampsPointsDroitesRemarquablesTriangle`) gère À LA FOIS les champs
 * texte libre, les écrans de choix simple/multiple ET le mode liste add-as-needed (famille C),
 * piloté entièrement par `definition: DefinitionEcran`.
 *
 * **Pas de `QuestionFinale`** — convention RÉELLE déjà établie pour ce chantier (voir en-tête
 * `App6gen49.tsx`/`App6gen53.tsx` : 0 générateur 6e ne l'utilise) : ce composant appartient au
 * patron narratif "1 seul problème long" du chantier 4e, jamais adopté par le chantier 6e
 * (dispatcher générique par écrans courts, `consigneEcran` change à chaque phase — le rôle de
 * rappel persistant est déjà rempli par `blocDonnees`, réaffiché identique sur chaque écran).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionPointsDroitesRemarquablesTriangle {
  return demarrerSessionPointsDroitesRemarquablesTriangle(REGLAGES_DEMO, genererExercicePointsDroitesRemarquablesTriangle);
}

type AideParPhase = Partial<Record<PhasePointsDroitesRemarquablesTriangle, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExercicePointsDroitesRemarquablesTriangle;
  aideParPhase: AideParPhase;
}


export function App6gen54() {
  const [etat, setEtat] = useState<EtatSessionPointsDroitesRemarquablesTriangle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionPointsDroitesRemarquablesTriangle) {
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
    setEtat(demarrerSessionPointsDroitesRemarquablesTriangle(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVariantePointsDroitesRemarquablesTriangle)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même —
  // mirroir `App6gen43.tsx`/`App6gen37.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen54?: unknown }).__debug6gen54 = { exercice, phase };
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
        <h1 className="app-title">Points et droites remarquables du triangle</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsPointsDroitesRemarquablesTriangle
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            definition={definitionEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {dernierBilan && <ResultatPanelPointsDroitesRemarquablesTriangle resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionPointsDroitesRemarquablesTriangle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
