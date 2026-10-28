import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIndependanceBayes } from "./generateurs6e/independanceBayes";
import type { IdVarianteIndependanceBayes } from "./generateurs6e/independanceBayes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionIndependanceBayes, soumettreReponseEcran } from "./moteur6e/sessionIndependanceBayes";
import { phasesPourExercice } from "./moteur6e/typesIndependanceBayes";
import type { EtatSessionIndependanceBayes, PhaseIndependanceBayes } from "./moteur6e/typesIndependanceBayes";
import { diagnostiquerEcran } from "./moteur6e/verificationIndependanceBayes";
import { Katex } from "./components/Katex";
import { EtapeChampsIndependanceBayes } from "./components6e/EtapeChampsIndependanceBayes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { LIBELLE_PHASE, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2, blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, tableauDonnees } from "./ui6e/formatIndependanceBayes";
import { calculerRecapitulatifIndependanceBayes, calculerSegmentsProgressionIndependanceBayes } from "./ui6e/recapitulatifIndependanceBayes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen32` — Indépendance, conditionnement et Bayes (chapitre 8, "Probabilités", 3e générateur du
 * chapitre après `6gen30`). Même patron que `App6gen30.tsx` : aucun bloc JSX par famille/écran, un
 * seul dispatch piloté par `ui6e/formatIndependanceBayes.ts` et `moteur6e/
 * verificationIndependanceBayes.ts` (`diagnostiquerEcran`). AUCUN écran à choix dans ce générateur
 * (voir en-tête de `ui6e/formatIndependanceBayes.ts`) — un seul composant écran suffit
 * (`EtapeChampsIndependanceBayes`), jamais de dispatch choix/champs comme `App6gen30.tsx`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionIndependanceBayes {
  return demarrerSessionIndependanceBayes(REGLAGES_DEMO, genererExerciceIndependanceBayes);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionIndependanceBayes;
  revele: boolean;
}

export function App6gen32() {
  const [etat, setEtat] = useState<EtatSessionIndependanceBayes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionIndependanceBayes`, jamais dans le moteur : la saisie de
   * l'élève n'a aucune autre utilité une fois l'étape close. Remis à vide à chaque nouvel exercice,
   * comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Puce "aide" (jaune) : le moteur ne garde `niveauAide` que pour l'écran COURANT (remis à 0 au
   * changement de phase) — on la persiste donc nous-mêmes ici, phase par phase, au même point que
   * `historique`. */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseIndependanceBayes, boolean>>>({});

  /** `votreReponse` : UNIQUEMENT formaté/poussé dans l'historique quand l'étape se clôt RÉELLEMENT
   * (même garde que la transition d'écran elle-même) — jamais à chaque tentative ratée. */
  function terminerEtape(nouvelEtat: EtatSessionIndependanceBayes, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const phaseFermee = etat.phase;
      const revele = nouvelEtat.derniereTransitionRevelee;
      setAideParPhase((prev) => ({ ...prev, [phaseFermee]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[phaseFermee],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? (
              <span className="equation-box-termes">
                {formatReponseAttenduePhaseLatex(exercice, phaseFermee).map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            ) : undefined,
          },
        ]);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setEtat(demarrerSessionIndependanceBayes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIndependanceBayes)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le rendu affiché.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen32?: unknown }).__debug6gen32 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
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

  const propsCommun = {
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    tableauDonnees: tableauDonnees(exercice),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    ...aideCommun,
    validation,
  };

  /** Surcharge locale de `calculerSegmentsProgressionIndependanceBayes` : "correcte" devient "aide"
   * quand `aideParPhase` montre que l'écran a été fermé avec de l'aide active. */
  const segmentsBase = calculerSegmentsProgressionIndependanceBayes(etat);
  const segments: EtatPuceProgression[] = phasesPourExercice(exercice).map((p, i) =>
    segmentsBase[i] === "correcte" && aideParPhase[p] ? "aide" : segmentsBase[i],
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Indépendance, conditionnement et Bayes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifIndependanceBayes(etat)} />
        <EtapeChampsIndependanceBayes
          key={phase}
          {...propsCommun}
          champs={champsEcran(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          onValider={(valeurs) =>
            terminerEtape(soumettreReponseEcran(etat, valeurs), champsEcran(exercice, phase).map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; "))
          }
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
