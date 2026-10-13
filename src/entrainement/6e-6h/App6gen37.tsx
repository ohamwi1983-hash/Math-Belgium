import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFormeTrigonometrique } from "./generateurs6e/formeTrigonometrique";
import type { IdVarianteFormeTrigonometrique } from "./generateurs6e/formeTrigonometrique";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionFormeTrigonometrique, soumettreReponseEcran } from "./moteur6e/sessionFormeTrigonometrique";
import type { EtatSessionFormeTrigonometrique } from "./moteur6e/typesFormeTrigonometrique";
import { diagnostiquerEcran } from "./moteur6e/verificationFormeTrigonometrique";
import { Katex } from "./components/Katex";
import { EtapeChampsFormeTrigonometrique } from "./components6e/EtapeChampsFormeTrigonometrique";
import { EtapeChoixCongruenceFormeTrigonometrique } from "./components6e/EtapeChoixCongruenceFormeTrigonometrique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatFormeTrigonometrique";
import { calculerRecapitulatifFormeTrigonometrique, calculerSegmentsProgressionFormeTrigonometrique } from "./ui6e/recapitulatifFormeTrigonometrique";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen37` — Forme trigonométrique, module, argument et opérations (chapitre 7, "Nombres
 * complexes", DEUXIÈME générateur de ce chapitre après `6gen34`). Même patron que `App6gen34.tsx` :
 * un dispatcher générique piloté par `ui6e/formatFormeTrigonometrique.ts`/
 * `moteur6e/verificationFormeTrigonometrique.ts`, PAS de JSX par famille/écran — SAUF `dEcran2`
 * (famille D, écran 2), seul écran de CHOIX (jamais de saisie libre) de ce générateur, rendu par
 * `EtapeChoixCongruenceFormeTrigonometrique` plutôt que le composant générique à champs texte.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionFormeTrigonometrique {
  return demarrerSessionFormeTrigonometrique(REGLAGES_DEMO, genererExerciceFormeTrigonometrique);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionFormeTrigonometrique;
  revele: boolean;
}

export function App6gen37() {
  const [etat, setEtat] = useState<EtatSessionFormeTrigonometrique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionFormeTrigonometrique) {
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
    setEtat(demarrerSessionFormeTrigonometrique(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteFormeTrigonometrique)));
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
  // `App6gen34.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen37?: unknown }).__debug6gen37 = { exercice, phase };
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

  const estEcranChoixCongruence = exercice.famille === "D" && phase === "dEcran2";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Forme trigonométrique, module, argument et opérations</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionFormeTrigonometrique(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifFormeTrigonometrique(etat)} />
        {estEcranChoixCongruence ? (
          <EtapeChoixCongruenceFormeTrigonometrique
            key={phase}
            estPremierEcran={estPremierEcran}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(condition) => terminerEtape(soumettreReponseEcran(etat, [condition]))}
            validation={validation}
          />
        ) : (
          <EtapeChampsFormeTrigonometrique
            key={phase}
            estPremierEcran={estPremierEcran}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
            validation={validation}
          />
        )}
      </main>
    </div>
  );
}
