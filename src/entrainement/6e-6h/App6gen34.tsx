import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceNombresComplexes } from "./generateurs6e/nombresComplexes";
import type { IdVarianteNombresComplexes } from "./generateurs6e/nombresComplexes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionNombresComplexes, soumettreReponseEcran } from "./moteur6e/sessionNombresComplexes";
import type { EtatSessionNombresComplexes } from "./moteur6e/typesNombresComplexes";
import { diagnostiquerEcran } from "./moteur6e/verificationNombresComplexes";
import { Katex } from "./components/Katex";
import { EtapeChampsNombresComplexes } from "./components6e/EtapeChampsNombresComplexes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatNombresComplexes";
import { calculerRecapitulatifNombresComplexes, calculerSegmentsProgressionNombresComplexes } from "./ui6e/recapitulatifNombresComplexes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

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

interface TransitionEnAttente {
  etatSuivant: EtatSessionNombresComplexes;
  revele: boolean;
}

export function App6gen34() {
  const [etat, setEtat] = useState<EtatSessionNombresComplexes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionNombresComplexes) {
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
    setEtat(demarrerSessionNombresComplexes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteNombresComplexes)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

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
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, niveauAideMaxEcran(exercice, phase)),
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Nombres complexes : opérations de base et puissances de i</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionNombresComplexes(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifNombresComplexes(etat)} />
        <EtapeChampsNombresComplexes
          key={phase}
          estPremierEcran={estPremierEcran}
          {...aideCommun}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          etatActuel={null}
          consigneEcran={consigneEcran(exercice, phase)}
          champs={champsEcran(exercice, phase)}
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
