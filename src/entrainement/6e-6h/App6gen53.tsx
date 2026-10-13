import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiPoisson } from "./generateurs6e/loiPoisson";
import type { IdVarianteLoiPoisson } from "./generateurs6e/loiPoisson";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionLoiPoisson, soumettreReponseEcran } from "./moteur6e/sessionLoiPoisson";
import type { EtatSessionLoiPoisson } from "./moteur6e/typesLoiPoisson";
import { diagnostiquerEcran } from "./moteur6e/verificationLoiPoisson";
import { EtapeChampsLoiPoisson } from "./components6e/EtapeChampsLoiPoisson";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, niveauAideMaxEcran, formatReponseAttenduePhaseLatex, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatLoiPoisson";
import { calculerRecapitulatifLoiPoisson, calculerSegmentsProgressionLoiPoisson } from "./ui6e/recapitulatifLoiPoisson";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen53` — Loi de Poisson. Même patron que `App6gen50.tsx` : un dispatcher générique piloté par
 * `ui6e/formatLoiPoisson.ts`/`moteur6e/verificationLoiPoisson.ts`, PAS de JSX par famille/écran — un
 * SEUL composant écran (`EtapeChampsLoiPoisson`) gère À LA FOIS les champs texte libre et la
 * checklist à 3 conditions (famille A), piloté entièrement par `champs: ChampDef[]`.
 *
 * **Pas de `QuestionFinale`** — convention RÉELLE déjà établie pour ce chantier (voir en-tête
 * `App6gen49.tsx` : 0 générateur 6e ne l'utilise) : ce composant appartient au patron narratif "1
 * seul problème long" du chantier 4e, jamais adopté par le chantier 6e (dispatcher générique par
 * écrans courts, `consigneEcran` change à chaque phase — le rôle de rappel persistant est déjà
 * rempli par `blocDonnees`, réaffiché identique sur chaque écran).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLoiPoisson {
  return demarrerSessionLoiPoisson(REGLAGES_DEMO, genererExerciceLoiPoisson);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLoiPoisson;
  revele: boolean;
}

export function App6gen53() {
  const [etat, setEtat] = useState<EtatSessionLoiPoisson>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionLoiPoisson) {
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
    setEtat(demarrerSessionLoiPoisson(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLoiPoisson)));
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
  // `App6gen50.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen53?: unknown }).__debug6gen53 = { exercice, phase };
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
        <h1 className="app-title">Loi de Poisson</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLoiPoisson(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLoiPoisson(etat)} />
        <EtapeChampsLoiPoisson
          // `${etat.generationId}-${phase}`, JAMAIS `phase` seul — voir `generationId`
          // (`moteur6e/typesLoiPoisson.ts`/`sessionLoiPoisson.ts`) : la famille B (écran
          // d'identification) peut avoir un nombre de champs variable à phase de départ identique
          // entre 2 exercices consécutifs — mirroir du bug trouvé/corrigé sur 6gen48.
          key={`${etat.generationId}-${phase}`}
          {...aideCommun}
          estPremierEcran={estPremierEcran}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
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
