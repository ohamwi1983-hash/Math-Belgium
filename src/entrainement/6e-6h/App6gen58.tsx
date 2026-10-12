import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIdentificationConiques } from "./generateurs6e/identificationConiques";
import type { IdVarianteIdentificationConiques } from "./generateurs6e/identificationConiques";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionIdentificationConiques, soumettreReponseEcran } from "./moteur6e/sessionIdentificationConiques";
import type { EtatSessionIdentificationConiques } from "./moteur6e/typesIdentificationConiques";
import { diagnostiquerEcran } from "./moteur6e/verificationIdentificationConiques";
import { EtapeChampsIdentificationConiques } from "./components6e/EtapeChampsIdentificationConiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatIdentificationConiques";
import { calculerRecapitulatifIdentificationConiques, calculerSegmentsProgressionIdentificationConiques } from "./ui6e/recapitulatifIdentificationConiques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen58` — Identification d'une conique et de ses éléments caractéristiques. GÉNÉRATEUR
 * D'OUVERTURE du chapitre "Les coniques" (voir `docs/historique-6e.md`). Même patron que
 * `App6gen43.tsx`/`App6gen50.tsx` : un dispatcher générique piloté par
 * `ui6e/formatIdentificationConiques.ts`/`moteur6e/verificationIdentificationConiques.ts`, PAS de
 * JSX par famille/écran — un SEUL composant écran (`EtapeChampsIdentificationConiques`) gère à la
 * fois les champs texte libre (y compris les réponses algébriques gardées structurellement) et les
 * écrans de choix, piloté entièrement par `champs: ChampDef[]`.
 *
 * Validation INLINE même écran (rollout UX approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`,
 * mirroir exact `App6gen13.tsx`/`App6gen12.tsx` : plus de `ResultatPanelIdentificationConiques`/
 * `ResumeSessionIdentificationConiques` séparés.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionIdentificationConiques {
  return demarrerSessionIdentificationConiques(REGLAGES_DEMO, genererExerciceIdentificationConiques);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionIdentificationConiques;
  revele: boolean;
}

export function App6gen58() {
  const [etat, setEtat] = useState<EtatSessionIdentificationConiques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionIdentificationConiques) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen26/6gen43 répliqué à
    // l'identique.
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
    setEtat(demarrerSessionIdentificationConiques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIdentificationConiques)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    // `champs` inclus (en plus de `exercice`/`phase`) — permet à un script Playwright de
    // reconstruire les boutons de choix par leur VALEUR technique (`option.valeur`), jamais par le
    // texte du bouton (fragile, dépend du libellé français affiché).
    (window as unknown as { __debug6gen58?: unknown }).__debug6gen58 = { exercice, phase, champs: champsEcran(exercice, phase) };
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
        <h1 className="app-title">Identification d'une conique et de ses éléments caractéristiques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionIdentificationConiques(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifIdentificationConiques(etat)} />
        <EtapeChampsIdentificationConiques
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
