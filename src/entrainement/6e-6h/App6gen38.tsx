import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFormuleMoivre } from "./generateurs6e/formuleMoivre";
import type { IdVarianteFormuleMoivre } from "./generateurs6e/formuleMoivre";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionFormuleMoivre, soumettreReponseEcran } from "./moteur6e/sessionFormuleMoivre";
import type { EtatSessionFormuleMoivre } from "./moteur6e/typesFormuleMoivre";
import { diagnostiquerEcran } from "./moteur6e/verificationFormuleMoivre";
import { Katex } from "./components/Katex";
import { EtapeChampsFormuleMoivre } from "./components6e/EtapeChampsFormuleMoivre";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatFormuleMoivre";
import { calculerRecapitulatifFormuleMoivre, calculerSegmentsProgressionFormuleMoivre } from "./ui6e/recapitulatifFormuleMoivre";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen38` — Formule de Moivre : développer cos(nx) et sin(nx) (chapitre 7, "Nombres complexes",
 * suite de `6gen34`). Même patron que `App6gen34.tsx` : un dispatcher générique piloté par
 * `ui6e/formatFormuleMoivre.ts`/`moteur6e/verificationFormuleMoivre.ts`, PAS de JSX par écran. Tous
 * les écrans sont de la saisie libre à arité FIXE (1 à 2 champs), donc `EtapeChampsFormuleMoivre`
 * suffit.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionFormuleMoivre {
  return demarrerSessionFormuleMoivre(REGLAGES_DEMO, genererExerciceFormuleMoivre);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionFormuleMoivre;
  revele: boolean;
}

export function App6gen38() {
  const [etat, setEtat] = useState<EtatSessionFormuleMoivre>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionFormuleMoivre) {
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
    setEtat(demarrerSessionFormuleMoivre(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteFormuleMoivre)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen34.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen38?: unknown }).__debug6gen38 = { exercice, phase };
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
        <h1 className="app-title">Formule de Moivre : développer cos(nx) et sin(nx)</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionFormuleMoivre(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifFormuleMoivre(etat)} />
        <EtapeChampsFormuleMoivre
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
          validation={validation}
        />
      </main>
    </div>
  );
}
