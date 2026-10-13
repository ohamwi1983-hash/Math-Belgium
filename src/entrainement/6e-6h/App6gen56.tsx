import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLieuxGeometriquesParametres } from "./generateurs6e/lieuxGeometriquesParametres";
import type { IdVarianteLieuxGeometriquesParametres } from "./generateurs6e/lieuxGeometriquesParametres";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionLieuxGeometriquesParametres, soumettreReponseEcran } from "./moteur6e/sessionLieuxGeometriquesParametres";
import type { EtatSessionLieuxGeometriquesParametres } from "./moteur6e/typesLieuxGeometriquesParametres";
import { diagnostiquerEcran } from "./moteur6e/verificationLieuxGeometriquesParametres";
import { EtapeChampsLieuxGeometriquesParametres } from "./components6e/EtapeChampsLieuxGeometriquesParametres";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatLieuxGeometriquesParametres";
import { calculerRecapitulatifLieuxGeometriquesParametres, calculerSegmentsProgressionLieuxGeometriquesParametres } from "./ui6e/recapitulatifLieuxGeometriquesParametres";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen56` — Lieux géométriques et élimination de paramètre (révisé). GÉNÉRATEUR D'OUVERTURE du
 * nouveau chapitre "Lieux géométriques" (6e FWB, 6h) — voir `docs/historique-6e.md`. Même patron
 * que `App6gen43.tsx`/`App6gen53.tsx` : un dispatcher générique piloté par `ui6e/
 * formatLieuxGeometriquesParametres.ts`/`moteur6e/verificationLieuxGeometriquesParametres.ts`, PAS
 * de JSX par famille/écran — un SEUL composant écran (`EtapeChampsLieuxGeometriquesParametres`) gère
 * À LA FOIS les champs texte libre ET les champs `choix` (nature du lieu, configuration, stratégie,
 * régime), piloté entièrement par `champs: ChampDef[]`.
 *
 * Validation INLINE même écran (rollout UX approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`,
 * mirroir exact `App6gen13.tsx`/`App6gen12.tsx` : plus de `ResultatPanelLieuxGeometriquesParametres`/
 * `ResumeSessionLieuxGeometriquesParametres` séparés.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLieuxGeometriquesParametres {
  return demarrerSessionLieuxGeometriquesParametres(REGLAGES_DEMO, genererExerciceLieuxGeometriquesParametres);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLieuxGeometriquesParametres;
  revele: boolean;
}

export function App6gen56() {
  const [etat, setEtat] = useState<EtatSessionLieuxGeometriquesParametres>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionLieuxGeometriquesParametres) {
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
    setEtat(demarrerSessionLieuxGeometriquesParametres(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLieuxGeometriquesParametres)));
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
  // re-parsant le LaTeX affiché (fragile). `champs` (en plus de `exercice`/`phase`) expose aussi les
  // `options: {valeur,label}[]` des champs `choix` de l'écran courant — permet au script Playwright
  // de retrouver le LABEL du bon bouton à cliquer depuis la `valeur` technique attendue, sans
  // dupliquer les tables d'options de `ui6e/formatLieuxGeometriquesParametres.ts` dans le script de
  // vérification. Jamais consommé par le code applicatif lui-même — mirroir `App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen56?: unknown }).__debug6gen56 = { exercice, phase, champs: champsEcran(exercice, phase) };
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
        <h1 className="app-title">Lieux géométriques et élimination de paramètre</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLieuxGeometriquesParametres(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLieuxGeometriquesParametres(etat)} />
        <EtapeChampsLieuxGeometriquesParametres
          key={phase}
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
