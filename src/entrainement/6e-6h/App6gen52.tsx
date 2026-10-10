import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceExtensionsBinomialeNormaleBayes } from "./generateurs6e/extensionsBinomialeNormaleBayes";
import type { IdVarianteExtensionsBinomialeNormaleBayes } from "./generateurs6e/extensionsBinomialeNormaleBayes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionExtensionsBinomialeNormaleBayes, soumettreReponseEcran } from "./moteur6e/sessionExtensionsBinomialeNormaleBayes";
import type { EtatSessionExtensionsBinomialeNormaleBayes } from "./moteur6e/typesExtensionsBinomialeNormaleBayes";
import { diagnostiquerEcran } from "./moteur6e/verificationExtensionsBinomialeNormaleBayes";
import { EtapeChampsExtensionsBinomialeNormaleBayes } from "./components6e/EtapeChampsExtensionsBinomialeNormaleBayes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, calculerReferenceExtensionsBinomialeNormaleBayes, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, formatReponseAttenduePhaseLatex, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatExtensionsBinomialeNormaleBayes";

/**
 * `6gen52` — Extensions binomiale, normale et Bayes (problèmes). GÉNÉRATEUR DE CLÔTURE du chapitre
 * "Variables aléatoires et lois de probabilités" (après `6gen49`/`6gen50`/`6gen51`). Même patron que
 * `App6gen51.tsx` : un dispatcher générique piloté par `ui6e/formatExtensionsBinomialeNormaleBayes.ts`/
 * `moteur6e/verificationExtensionsBinomialeNormaleBayes.ts`, PAS de JSX par famille/écran — un SEUL
 * composant écran (`EtapeChampsExtensionsBinomialeNormaleBayes`) gère À LA FOIS les champs texte
 * libre ET les écrans de choix (famille B "stratégie", famille C "transformation").
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionExtensionsBinomialeNormaleBayes {
  return demarrerSessionExtensionsBinomialeNormaleBayes(REGLAGES_DEMO, genererExerciceExtensionsBinomialeNormaleBayes, calculerReferenceExtensionsBinomialeNormaleBayes);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionExtensionsBinomialeNormaleBayes;
  revele: boolean;
}

export function App6gen52() {
  const [etat, setEtat] = useState<EtatSessionExtensionsBinomialeNormaleBayes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionExtensionsBinomialeNormaleBayes) {
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
    setEtat(demarrerSessionExtensionsBinomialeNormaleBayes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteExtensionsBinomialeNormaleBayes), calculerReferenceExtensionsBinomialeNormaleBayes));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen51.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen52?: unknown }).__debug6gen52 = { exercice, phase, reference: calculerReferenceExtensionsBinomialeNormaleBayes(exercice, phase) };
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
        <h1 className="app-title">Extensions binomiale, normale et Bayes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <EtapeChampsExtensionsBinomialeNormaleBayes
          // `${generationId}-${phase}`, PAS `phase` seul — famille B a un nombre de champs
          // variable (`termesACalculer.length`) à écran de départ constant (voir
          // `typesExtensionsBinomialeNormaleBayes.ts`, `generationId`).
          key={`${etat.generationId}-${phase}`}
          {...aideCommun}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          etatActuel={etatActuel(exercice, phase)}
          consigneEcran={consigneEcran(exercice, phase)}
          champs={champsEcran(exercice, phase)}
          aideNiveau1={formatAideNiveau1(exercice, phase)}
          aideNiveau2={formatAideNiveau2(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs, calculerReferenceExtensionsBinomialeNormaleBayes(exercice, phase))}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
        />
      </main>
    </div>
  );
}
