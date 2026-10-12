import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationConiqueCaracteristiques } from "./generateurs6e/equationConiqueCaracteristiques";
import type { IdVarianteEquationConiqueCaracteristiques } from "./generateurs6e/equationConiqueCaracteristiques";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionEquationConiqueCaracteristiques, soumettreReponseEcran } from "./moteur6e/sessionEquationConiqueCaracteristiques";
import type { EtatSessionEquationConiqueCaracteristiques } from "./moteur6e/typesEquationConiqueCaracteristiques";
import { diagnostiquerEcran } from "./moteur6e/verificationEquationConiqueCaracteristiques";
import { EtapeChampsEquationConiqueCaracteristiques } from "./components6e/EtapeChampsEquationConiqueCaracteristiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatEquationConiqueCaracteristiques";
import { calculerRecapitulatifEquationConiqueCaracteristiques, calculerSegmentsProgressionEquationConiqueCaracteristiques } from "./ui6e/recapitulatifEquationConiqueCaracteristiques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen59` — Équation d'une conique depuis ses caractéristiques. DEUXIÈME générateur du chapitre
 * "Les coniques" (fondation posée par `6gen58`, voir `docs/historique-6e.md`). Même patron que
 * `App6gen58.tsx` : un dispatcher générique piloté par
 * `ui6e/formatEquationConiqueCaracteristiques.ts`/`moteur6e/verificationEquationConiqueCaracteristiques.ts`,
 * PAS de JSX par famille/écran — un SEUL composant écran
 * (`EtapeChampsEquationConiqueCaracteristiques`) gère à la fois les champs texte libre et les écrans
 * de choix, piloté entièrement par `champs: ChampDef[]`.
 *
 * Validation INLINE même écran (rollout UX approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`,
 * mirroir exact `App6gen13.tsx`/`App6gen12.tsx` : plus de
 * `ResultatPanelEquationConiqueCaracteristiques`/`ResumeSessionEquationConiqueCaracteristiques`
 * séparés.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEquationConiqueCaracteristiques {
  return demarrerSessionEquationConiqueCaracteristiques(REGLAGES_DEMO, genererExerciceEquationConiqueCaracteristiques);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationConiqueCaracteristiques;
  revele: boolean;
}

export function App6gen59() {
  const [etat, setEtat] = useState<EtatSessionEquationConiqueCaracteristiques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEquationConiqueCaracteristiques) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md.
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
    setEtat(demarrerSessionEquationConiqueCaracteristiques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteEquationConiqueCaracteristiques)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen58.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen59?: unknown }).__debug6gen59 = { exercice, phase, champs: champsEcran(exercice, phase) };
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
        <h1 className="app-title">Équation d'une conique depuis ses caractéristiques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionEquationConiqueCaracteristiques(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifEquationConiqueCaracteristiques(etat)} />
        <EtapeChampsEquationConiqueCaracteristiques
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
