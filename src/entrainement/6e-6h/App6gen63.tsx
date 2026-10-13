import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesOptiquesConiques } from "./generateurs6e/proprietesOptiquesConiques";
import type { IdVarianteProprietesOptiquesConiques } from "./generateurs6e/proprietesOptiquesConiques";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProprietesOptiquesConiques, soumettreReponseEcran } from "./moteur6e/sessionProprietesOptiquesConiques";
import type { EtatSessionProprietesOptiquesConiques } from "./moteur6e/typesProprietesOptiquesConiques";
import { diagnostiquerEcran } from "./moteur6e/verificationProprietesOptiquesConiques";
import { EtapeChampsProprietesOptiquesConiques } from "./components6e/EtapeChampsProprietesOptiquesConiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatProprietesOptiquesConiques";
import { calculerRecapitulatifProprietesOptiquesConiques, calculerSegmentsProgressionProprietesOptiquesConiques } from "./ui6e/recapitulatifProprietesOptiquesConiques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen63` — Propriétés optiques des coniques. Chapitre "Les coniques", 6e FWB (6h) — générateur DE
 * CLÔTURE du chapitre (voir `docs/historique-6e.md`). Même patron que `App6gen62.tsx` : un
 * dispatcher générique piloté par `ui6e/formatProprietesOptiquesConiques.ts`/`moteur6e/
 * verificationProprietesOptiquesConiques.ts`, PAS de JSX par écran — un SEUL composant écran
 * (`EtapeChampsProprietesOptiquesConiques`) gère tous les champs texte/choix, piloté entièrement par
 * `champs: ChampDef[]`.
 *
 * Validation INLINE même écran (rollout UX approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`,
 * mirroir exact `App6gen13.tsx`/`App6gen12.tsx` : plus de `ResultatPanelProprietesOptiquesConiques`/
 * `ResumeSessionProprietesOptiquesConiques` séparés.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProprietesOptiquesConiques {
  return demarrerSessionProprietesOptiquesConiques(REGLAGES_DEMO, genererExerciceProprietesOptiquesConiques);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionProprietesOptiquesConiques;
  revele: boolean;
}

export function App6gen63() {
  const [etat, setEtat] = useState<EtatSessionProprietesOptiquesConiques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionProprietesOptiquesConiques) {
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
    setEtat(demarrerSessionProprietesOptiquesConiques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteProprietesOptiquesConiques)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  /** `estPremierEcran` : vrai uniquement sur le premier écran vu pour CET `exercice` (change de
   * valeur quand un nouvel exercice est tiré, jamais au fil des écrans d'un même exercice) — voir
   * `EnTeteExercice.tsx`, option 1B ("plein puis compact"). */
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
  // `App6gen62.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen63?: unknown }).__debug6gen63 = { exercice, phase, champs: champsEcran(exercice, phase) };
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
        <h1 className="app-title">Propriétés optiques des coniques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionProprietesOptiquesConiques(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifProprietesOptiquesConiques(etat)} />
        <EtapeChampsProprietesOptiquesConiques
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
        />
      </main>
    </div>
  );
}
