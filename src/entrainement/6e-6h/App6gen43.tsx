import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementFondamental } from "./generateurs6e/denombrementFondamental";
import type { IdVarianteDenombrementFondamental } from "./generateurs6e/denombrementFondamental";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionDenombrementFondamental, soumettreReponseEcran } from "./moteur6e/sessionDenombrementFondamental";
import type { EtatSessionDenombrementFondamental } from "./moteur6e/typesDenombrementFondamental";
import { diagnostiquerEcran } from "./moteur6e/verificationDenombrementFondamental";
import { EtapeChampsDenombrementFondamental } from "./components6e/EtapeChampsDenombrementFondamental";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import {
  blocDonnees,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  niveauAideMaxEcran,
  formatReponseAttenduePhaseLatex,
  LIBELLE_PHASE,
  aideNiveau1 as formatAideNiveau1,
  aideNiveau2 as formatAideNiveau2,
} from "./ui6e/formatDenombrementFondamental";
import { calculerRecapitulatifDenombrementFondamental, calculerSegmentsProgressionDenombrementFondamental } from "./ui6e/recapitulatifDenombrementFondamental";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen43` — Dénombrement fondamental et arrangements. GÉNÉRATEUR D'OUVERTURE du chapitre "Analyse
 * combinatoire" (voir `docs/historique-6e.md`). Même patron que `App6gen26.tsx`/`App6gen37.tsx` :
 * un dispatcher générique piloté par `ui6e/formatDenombrementFondamental.ts`/
 * `moteur6e/verificationDenombrementFondamental.ts`, PAS de JSX par famille/écran — un SEUL
 * composant écran (`EtapeChampsDenombrementFondamental`) gère À LA FOIS les champs texte libre ET
 * les 2 écrans de choix (famille C écran 1, famille E écran 1), piloté entièrement par
 * `champs: ChampDef[]` (mirroir `EtapeChampsCalculAires.tsx`/`App6gen26.tsx`, jamais besoin d'un
 * composant séparé pour un écran de choix ici).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionDenombrementFondamental {
  return demarrerSessionDenombrementFondamental(REGLAGES_DEMO, genererExerciceDenombrementFondamental);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDenombrementFondamental;
  revele: boolean;
}

export function App6gen43() {
  const [etat, setEtat] = useState<EtatSessionDenombrementFondamental>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionDenombrementFondamental` (voir `App6gen39.tsx`, même mécanisme). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [aideUtiliseeFermees, setAideUtiliseeFermees] = useState<boolean[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionDenombrementFondamental, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        const revele = nouvelEtat.derniereTransitionRevelee;
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[etat.phase],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? (
              <span className="equation-box-termes">
                {formatReponseAttenduePhaseLatex(etat.exerciceCourant, etat.phase).map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            ) : undefined,
          },
        ]);
        setAideUtiliseeFermees((a) => [...a, etat.niveauAide > 0]);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeFermees([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeFermees([]);
    setEtat(demarrerSessionDenombrementFondamental(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteDenombrementFondamental)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen37.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen43?: unknown }).__debug6gen43 = { exercice, phase };
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

  const segmentsBase = calculerSegmentsProgressionDenombrementFondamental(etat);
  const segments = segmentsBase.map((s, i) => (s === "correcte" && aideUtiliseeFermees[i] ? ("aide" as const) : s));

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Dénombrement fondamental et arrangements</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifDenombrementFondamental(etat)} />
        <EtapeChampsDenombrementFondamental
          key={phase}
          {...aideCommun}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          champs={champsEcran(exercice, phase)}
          aideNiveau1={formatAideNiveau1(exercice, phase)}
          aideNiveau2={formatAideNiveau2(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          onValider={(valeurs) =>
            terminerEtape(
              soumettreReponseEcran(etat, valeurs),
              champsEcran(exercice, phase)
                .map((c, i) => `${c.label} ${c.options?.find((o) => o.valeur === valeurs[i])?.label ?? valeurs[i]}`)
                .join(" ; "),
            )
          }
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
