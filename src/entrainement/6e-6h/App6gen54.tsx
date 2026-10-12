import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointsDroitesRemarquablesTriangle } from "./generateurs6e/pointsDroitesRemarquablesTriangle";
import type { IdVariantePointsDroitesRemarquablesTriangle } from "./generateurs6e/pointsDroitesRemarquablesTriangle";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionPointsDroitesRemarquablesTriangle, soumettreReponseEcran } from "./moteur6e/sessionPointsDroitesRemarquablesTriangle";
import type { EtatSessionPointsDroitesRemarquablesTriangle } from "./moteur6e/typesPointsDroitesRemarquablesTriangle";
import { diagnostiquerEcran } from "./moteur6e/verificationPointsDroitesRemarquablesTriangle";
import { Katex } from "./components/Katex";
import { EtapeChampsPointsDroitesRemarquablesTriangle } from "./components6e/EtapeChampsPointsDroitesRemarquablesTriangle";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, consigneEcran, consigneGenerale, definitionEcran, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatPointsDroitesRemarquablesTriangle";
import { calculerRecapitulatifPointsDroitesRemarquablesTriangle, calculerSegmentsProgressionPointsDroitesRemarquablesTriangle } from "./ui6e/recapitulatifPointsDroitesRemarquablesTriangle";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

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

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionPointsDroitesRemarquablesTriangle {
  return demarrerSessionPointsDroitesRemarquablesTriangle(REGLAGES_DEMO, genererExercicePointsDroitesRemarquablesTriangle);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionPointsDroitesRemarquablesTriangle;
  revele: boolean;
}

export function App6gen54() {
  const [etat, setEtat] = useState<EtatSessionPointsDroitesRemarquablesTriangle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionPointsDroitesRemarquablesTriangle) {
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
    setEtat(demarrerSessionPointsDroitesRemarquablesTriangle(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVariantePointsDroitesRemarquablesTriangle)));
  }

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

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, niveauAideMaxEcran(exercice, phase)),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Points et droites remarquables du triangle</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionPointsDroitesRemarquablesTriangle(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifPointsDroitesRemarquablesTriangle(etat)} />
        <EtapeChampsPointsDroitesRemarquablesTriangle
          key={phase}
          {...aideCommun}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          etatActuel={null}
          consigneEcran={consigneEcran(exercice, phase)}
          definition={definitionEcran(exercice, phase)}
          aideNiveau1={formatAideNiveau1(exercice, phase)}
          aideNiveau2={formatAideNiveau2(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          validation={validation}
        />
      </main>
    </div>
  );
}
