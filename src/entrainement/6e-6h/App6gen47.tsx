import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabiliteHypergeometrique } from "./generateurs6e/probabiliteHypergeometrique";
import type { IdVarianteProbabiliteHypergeometrique } from "./generateurs6e/probabiliteHypergeometrique";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProbabiliteHypergeometrique, soumettreReponseEcran } from "./moteur6e/sessionProbabiliteHypergeometrique";
import type { EtatSessionProbabiliteHypergeometrique } from "./moteur6e/typesProbabiliteHypergeometrique";
import { diagnostiquerEcran } from "./moteur6e/verificationProbabiliteHypergeometrique";
import { EtapeChampsProbabiliteHypergeometrique } from "./components6e/EtapeChampsProbabiliteHypergeometrique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, niveauAideMaxEcran, formatReponseAttenduePhaseLatex, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatProbabiliteHypergeometrique";
import { calculerRecapitulatifProbabiliteHypergeometrique, calculerSegmentsProgressionProbabiliteHypergeometrique } from "./ui6e/recapitulatifProbabiliteHypergeometrique";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen47` — Probabilité hypergéométrique (tirage sans remise). Chapitre "Analyse combinatoire".
 * Même patron que `App6gen43.tsx`/`App6gen44.tsx` : un dispatcher générique piloté par
 * `ui6e/formatProbabiliteHypergeometrique.ts`/`moteur6e/verificationProbabiliteHypergeometrique.ts`,
 * PAS de JSX par famille/écran — un SEUL composant écran (`EtapeChampsProbabiliteHypergeometrique`)
 * gère tous les écrans (uniquement des champs texte libre ici — aucun écran de choix), piloté
 * entièrement par `champs: ChampDef[]`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProbabiliteHypergeometrique {
  return demarrerSessionProbabiliteHypergeometrique(REGLAGES_DEMO, genererExerciceProbabiliteHypergeometrique);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionProbabiliteHypergeometrique;
  revele: boolean;
}

export function App6gen47() {
  const [etat, setEtat] = useState<EtatSessionProbabiliteHypergeometrique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionProbabiliteHypergeometrique) {
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
    setEtat(demarrerSessionProbabiliteHypergeometrique(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteProbabiliteHypergeometrique)));
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
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même —
  // mirroir `App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen47?: unknown }).__debug6gen47 = { exercice, phase };
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
    validation,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Probabilité hypergéométrique (tirage sans remise)</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionProbabiliteHypergeometrique(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifProbabiliteHypergeometrique(etat)} />
        <EtapeChampsProbabiliteHypergeometrique
          key={phase}
          {...aideCommun}
          estPremierEcran={estPremierEcran}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          etatActuel={null}
          consigneEcran={consigneEcran(exercice, phase)}
          champs={champsEcran(exercice, phase)}
          aideNiveau1={formatAideNiveau1(exercice, phase)}
          aideNiveau2={formatAideNiveau2(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
        />
      </main>
    </div>
  );
}
