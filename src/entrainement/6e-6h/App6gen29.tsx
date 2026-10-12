import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegralesProblemes } from "./generateurs6e/integralesProblemes";
import type { IdVarianteIntegralesProblemes } from "./generateurs6e/integralesProblemes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionIntegralesProblemes, soumettreReponseEcran } from "./moteur6e/sessionIntegralesProblemes";
import type { EtatSessionIntegralesProblemes } from "./moteur6e/typesIntegralesProblemes";
import { diagnostiquerEcran } from "./moteur6e/verificationIntegralesProblemes";
import { EtapeChampsCalculAires } from "./components6e/EtapeChampsCalculAires";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatIntegralesProblemes";
import { calculerRecapitulatifIntegralesProblemes, calculerSegmentsProgressionIntegralesProblemes } from "./ui6e/recapitulatifIntegralesProblemes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen29` — Intégrales et primitives : problèmes (chapitre 4, générateur DE CLÔTURE). Même patron
 * que `App6gen27.tsx` (6gen27) : un dispatcher générique piloté par
 * `ui6e/formatIntegralesProblemes.ts`/`moteur6e/verificationIntegralesProblemes.ts`, PAS de JSX par
 * famille/écran. Toutes les 7 familles n'ont que des champs de taille FIXE (1 à 2 par écran,
 * `texte` ou `choix`) — `EtapeChampsCalculAires` (6gen26, RÉUTILISÉ TEL QUEL, TypeScript à typage
 * structurel) couvre donc TOUS les écrans, jamais besoin d'un composant add-as-needed dédié.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionIntegralesProblemes {
  return demarrerSessionIntegralesProblemes(REGLAGES_DEMO, genererExerciceIntegralesProblemes);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionIntegralesProblemes;
  revele: boolean;
}

export function App6gen29() {
  const [etat, setEtat] = useState<EtatSessionIntegralesProblemes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionIntegralesProblemes) {
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
    setEtat(demarrerSessionIntegralesProblemes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIntegralesProblemes)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés — mirroir
  // `App6gen27.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen29?: unknown }).__debug6gen29 = { exercice, phase };
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
        <h1 className="app-title">Intégrales et primitives : problèmes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionIntegralesProblemes(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifIntegralesProblemes(etat)} />
        <EtapeChampsCalculAires
          key={phase}
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
        />
      </main>
    </div>
  );
}
