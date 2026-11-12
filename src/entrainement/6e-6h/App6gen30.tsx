import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabilitesEnsembles } from "./generateurs6e/probabilitesEnsembles";
import type { IdVarianteProbabilitesEnsembles } from "./generateurs6e/probabilitesEnsembles";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProbabilitesEnsembles, soumettreReponseEcran, tentativesMaxPhase } from "./moteur6e/sessionProbabilitesEnsembles";
import { phasesPourExercice } from "./moteur6e/typesProbabilitesEnsembles";
import type { EtatSessionProbabilitesEnsembles, PhaseProbabilitesEnsembles } from "./moteur6e/typesProbabilitesEnsembles";
import { diagnostiquerEcran } from "./moteur6e/verificationProbabilitesEnsembles";
import { Katex } from "./components/Katex";
import { EtapeChampsProbabilitesEnsembles } from "./components6e/EtapeChampsProbabilitesEnsembles";
import { EtapeChoixProbabilitesEnsembles } from "./components6e/EtapeChoixProbabilitesEnsembles";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { LIBELLE_PHASE, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2, blocDonnees, champsEcran, choixEcran, consigneEcran, consigneGenerale, estEcranChoix, formatReponseAttenduePhaseLatex, libelleChoixCorrect, tableauEcran } from "./ui6e/formatProbabilitesEnsembles";
import { calculerRecapitulatifProbabilitesEnsembles, calculerSegmentsProgressionProbabilitesEnsembles } from "./ui6e/recapitulatifProbabilitesEnsembles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen30` — Probabilités et ensembles (chapitre 8, "Probabilités", PREMIER générateur de ce
 * chapitre). Même patron que `App6gen23.tsx` (6gen23) : aucun bloc JSX par famille/écran, un seul
 * dispatch piloté par `ui6e/formatProbabilitesEnsembles.ts` (`champsEcran`/`choixEcran`, selon
 * `estEcranChoix`) et `moteur6e/verificationProbabilitesEnsembles.ts` (`diagnostiquerEcran`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionProbabilitesEnsembles {
  return demarrerSessionProbabilitesEnsembles(REGLAGES_DEMO, genererExerciceProbabilitesEnsembles);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions de génération que l'adaptateur
 * d'export (`generateurs6e/probabilitesEnsembles/exportEvaluation.ts`) ; la suite reste un tirage normal. */
function sessionInitiale(): EtatSessionProbabilitesEnsembles {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionProbabilitesEnsembles(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceProbabilitesEnsembles, (id) => construireAvecVarianteId(id as IdVarianteProbabilitesEnsembles)));
}

/** Réponse attendue d'un écran : libellé du choix correct (texte, écran à choix) puis valeurs ou
 * justification en KaTeX. */
function ReponseAttendue({ exercice, phase }: { exercice: EtatSessionProbabilitesEnsembles["exerciceCourant"]; phase: PhaseProbabilitesEnsembles }) {
  const libelle = libelleChoixCorrect(exercice, phase);
  return (
    <span className="equation-box-termes">
      {libelle && <strong>{libelle}</strong>}
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionProbabilitesEnsembles;
  revele: boolean;
}

export function App6gen30() {
  const [etat, setEtat] = useState<EtatSessionProbabilitesEnsembles>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Compteur de tirages : entre dans la `key` des écrans pour vider les champs à chaque nouvel
   * exercice, y compris quand « Générer » relance la MÊME variante (même phase initiale). */
  const [generation, setGeneration] = useState(0);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionProbabilitesEnsembles`, jamais dans le moteur : la saisie de
   * l'élève n'a aucune autre utilité une fois l'étape close. Remis à vide à chaque nouvel exercice,
   * comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Puce "aide" (jaune) : le moteur ne garde `niveauAide` que pour l'écran COURANT (remis à 0 au
   * changement de phase) — on la persiste donc nous-mêmes ici, phase par phase, au même point que
   * `historique`. */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseProbabilitesEnsembles, boolean>>>({});

  /** `votreReponse` : UNIQUEMENT formaté/poussé dans l'historique quand l'étape se clôt RÉELLEMENT
   * (même garde que la transition d'écran elle-même) — jamais à chaque tentative ratée. */
  function terminerEtape(nouvelEtat: EtatSessionProbabilitesEnsembles, votreReponse?: ReactNode) {
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
            reponseAttendue: revele ? <ReponseAttendue exercice={exercice} phase={phaseFermee} /> : undefined,
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
      setGeneration((g) => g + 1);
      setHistorique([]);
      setAideParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setGeneration((g) => g + 1);
    setHistorique([]);
    setAideParPhase({});
    setEtat(demarrerSessionProbabilitesEnsembles(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteProbabilitesEnsembles)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le LaTeX affiché.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen30?: unknown }).__debug6gen30 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: tentativesMaxPhase(etat),
    niveauAide: etat.niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <ReponseAttendue exercice={exercice} phase={phase} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const propsCommun = {
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    ...aideCommun,
    validation,
  };

  /** Surcharge locale de `calculerSegmentsProgressionProbabilitesEnsembles` : "correcte" devient
   * "aide" quand `aideParPhase` montre que l'écran a été fermé avec de l'aide active. */
  const segmentsBase = calculerSegmentsProgressionProbabilitesEnsembles(etat);
  const segments: EtatPuceProgression[] = phasesPourExercice(exercice).map((p, i) =>
    segmentsBase[i] === "correcte" && aideParPhase[p] ? "aide" : segmentsBase[i],
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Probabilités et ensembles</h1>
        <p className="app-subtitle">Chapitre 6 — Les probabilités</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifProbabilitesEnsembles(etat)} />
        {estEcranChoix(phase) ? (
          <EtapeChoixProbabilitesEnsembles
            key={`${generation}-${phase}`}
            {...propsCommun}
            options={choixEcran(exercice, phase)}
            diagnostiquer={(choixId) => diagnostiquerEcran(exercice, phase, [choixId])}
            onValider={(choixId) =>
              terminerEtape(soumettreReponseEcran(etat, [choixId]), choixEcran(exercice, phase).find((o) => o.id === choixId)?.label ?? choixId)
            }
          />
        ) : (
          <EtapeChampsProbabilitesEnsembles
            key={`${generation}-${phase}`}
            {...propsCommun}
            champs={champsEcran(exercice, phase)}
            tableau={tableauEcran(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) =>
              terminerEtape(soumettreReponseEcran(etat, valeurs), champsEcran(exercice, phase).map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; "))
            }
          />
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
