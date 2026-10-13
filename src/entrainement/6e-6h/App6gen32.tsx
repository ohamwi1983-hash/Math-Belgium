import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIndependanceBayes } from "./generateurs6e/independanceBayes";
import type { IdVarianteIndependanceBayes } from "./generateurs6e/independanceBayes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionIndependanceBayes, soumettreReponseEcran } from "./moteur6e/sessionIndependanceBayes";
import type { EtatSessionIndependanceBayes } from "./moteur6e/typesIndependanceBayes";
import { diagnostiquerEcran } from "./moteur6e/verificationIndependanceBayes";
import { Katex } from "./components/Katex";
import { EtapeChampsIndependanceBayes } from "./components6e/EtapeChampsIndependanceBayes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2, blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, tableauDonnees } from "./ui6e/formatIndependanceBayes";
import { calculerRecapitulatifIndependanceBayes, calculerSegmentsProgressionIndependanceBayes } from "./ui6e/recapitulatifIndependanceBayes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen32` — Indépendance, conditionnement et Bayes (chapitre 8, "Probabilités", 3e générateur du
 * chapitre après `6gen30`). Même patron que `App6gen30.tsx` : aucun bloc JSX par famille/écran, un
 * seul dispatch piloté par `ui6e/formatIndependanceBayes.ts` et `moteur6e/
 * verificationIndependanceBayes.ts` (`diagnostiquerEcran`). AUCUN écran à choix dans ce générateur
 * (voir en-tête de `ui6e/formatIndependanceBayes.ts`) — un seul composant écran suffit
 * (`EtapeChampsIndependanceBayes`), jamais de dispatch choix/champs comme `App6gen30.tsx`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionIndependanceBayes {
  return demarrerSessionIndependanceBayes(REGLAGES_DEMO, genererExerciceIndependanceBayes);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionIndependanceBayes;
  revele: boolean;
}

export function App6gen32() {
  const [etat, setEtat] = useState<EtatSessionIndependanceBayes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionIndependanceBayes) {
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
    setEtat(demarrerSessionIndependanceBayes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIndependanceBayes)));
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

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le rendu affiché.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen32?: unknown }).__debug6gen32 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
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

  const propsCommun = {
    estPremierEcran,
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    tableauDonnees: tableauDonnees(exercice),
    etatActuel: null,
    tableauEtatActuel: null,
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    ...aideCommun,
    validation,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Indépendance, conditionnement et Bayes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionIndependanceBayes(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifIndependanceBayes(etat)} />
        <EtapeChampsIndependanceBayes key={phase} {...propsCommun} champs={champsEcran(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />
      </main>
    </div>
  );
}
