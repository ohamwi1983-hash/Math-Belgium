import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComplexesAvances } from "./generateurs6e/complexesAvances";
import type { IdVarianteComplexesAvances } from "./generateurs6e/complexesAvances";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionComplexesAvances, soumettreReponseEcran } from "./moteur6e/sessionComplexesAvances";
import type { EtatSessionComplexesAvances } from "./moteur6e/typesComplexesAvances";
import { diagnostiquerEcran } from "./moteur6e/verificationComplexesAvances";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { EtapeChampsComplexesAvances } from "./components6e/EtapeChampsComplexesAvances";
import { EtapeConclusionC } from "./components6e/EtapeConclusionC";
import { EtapeListeComplexesAvances } from "./components6e/EtapeListeComplexesAvances";
import { EtapeLocusComplexesAvances } from "./components6e/EtapeLocusComplexesAvances";
import { EtapeQcmComplexesAvances } from "./components6e/EtapeQcmComplexesAvances";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import {
  blocDonnees,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  niveauAideMaxEcran,
  optionsEcran1A,
  optionsEcran2A,
  optionsEcran3A,
  optionsReciproqueC,
  optionsStatutC,
  optionsStatutE,
  formatReponseAttenduePhaseLatex,
  aideNiveau1 as formatAideNiveau1,
  aideNiveau2 as formatAideNiveau2,
} from "./ui6e/formatComplexesAvances";
import { calculerRecapitulatifComplexesAvances, calculerSegmentsProgressionComplexesAvances } from "./ui6e/recapitulatifComplexesAvances";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen42` — Nombres complexes : problèmes avancés (chapitre 7, "Nombres complexes", 9e et DERNIER
 * générateur de ce chapitre — générateur de CLÔTURE, mirroir 6gen29/6gen33 pour les chapitres 4/8).
 * Dispatcher générique piloté par `ui6e/formatComplexesAvances.ts`/
 * `moteur6e/verificationComplexesAvances.ts`, avec 5 composants dédiés pour les écrans qui ne sont
 * PAS de la saisie libre simple : QCM (familles A et E écran 3), lieu structuré (famille B écran 2,
 * sous-types simples), conclusion à 2 choix (famille C écran 3), liste add-as-needed (bInterEcran3,
 * dRatioEcran1, dReellesEcran3, dModulesEcran2).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionComplexesAvances {
  return demarrerSessionComplexesAvances(REGLAGES_DEMO, genererExerciceComplexesAvances);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionComplexesAvances;
  revele: boolean;
}

export function App6gen42() {
  const [etat, setEtat] = useState<EtatSessionComplexesAvances>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionComplexesAvances) {
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
    setEtat(demarrerSessionComplexesAvances(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteComplexesAvances)));
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
  // `App6gen40.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen42?: unknown }).__debug6gen42 = { exercice, phase };
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

  const estEcranQcmA = exercice.famille === "A" && (phase === "aEcran1" || phase === "aEcran2" || phase === "aEcran3");
  const estEcranQcmE = exercice.famille === "E" && phase === "eEcran3";
  const estEcranLocusB = exercice.famille === "B" && exercice.sousType !== "intersection" && phase === "bEcran2";
  const estEcranConclusionC = exercice.famille === "C" && phase === "cEcran3";
  const estEcranListeB = exercice.famille === "B" && exercice.sousType === "intersection" && phase === "bInterEcran3";
  const estEcranListeDRatio = exercice.famille === "D" && exercice.sousType === "ratio" && phase === "dRatioEcran1";
  const estEcranListeDReelles = exercice.famille === "D" && exercice.sousType === "reelles" && phase === "dReellesEcran3";
  const estEcranListeDModules = exercice.famille === "D" && exercice.sousType === "modules" && phase === "dModulesEcran2";
  const estEcranListe = estEcranListeB || estEcranListeDRatio || estEcranListeDReelles || estEcranListeDModules;
  const estEcranDedie = estEcranQcmA || estEcranQcmE || estEcranLocusB || estEcranConclusionC || estEcranListe;

  // Calculatrice flottante — SEUL écran du générateur avec un vrai calcul décimal/irrationnel : famille
  // E, statut "aucun" (`familleE.ts`) est le PREMIER endroit du chapitre 7 où le fallback décimal de
  // `calculerArgument` (6gen37) est réellement exercé (argument générique, pas un multiple rationnel de
  // π) — voir `docs/historique-6e.md`. Les statuts "paralleles"/"perpendiculaires" restent des angles
  // remarquables exacts (0/π/±π/2), aucun calcul décimal requis pour eux. Mode RAD (défaut du
  // composant) : contexte du chapitre = argument d'un nombre complexe, toujours en radians ici
  // (contrairement à `App6gen41.tsx`, seul écran DEGRÉS du chapitre).
  const calculatriceVisible = exercice.famille === "E" && exercice.statut === "aucun" && phase === "eEcran2";

  function nombreMaxListe(): number {
    if (estEcranListeDRatio && exercice.famille === "D" && exercice.sousType === "ratio") return exercice.n;
    return 2;
  }
  function placeholderListe(): string {
    if (estEcranListeDRatio) return "ex : 2";
    if (estEcranListeDReelles) return "ex : 1";
    if (estEcranListeDModules) return "ex : 3/5+4i/5";
    return "ex : 3+2i";
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Nombres complexes : problèmes avancés</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionComplexesAvances(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifComplexesAvances(etat)} />
        {estEcranQcmA && exercice.famille === "A" && (
          <EtapeQcmComplexesAvances
            key={phase}
            {...aideCommun}
            estPremierEcran={estPremierEcran}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={null}
            consigneEcran={consigneEcran(exercice, phase)}
            options={phase === "aEcran1" ? optionsEcran1A(exercice.n) : phase === "aEcran2" ? optionsEcran2A(exercice.n) : optionsEcran3A(exercice)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))}
          />
        )}

        {estEcranQcmE && (
          <EtapeQcmComplexesAvances
            key={phase}
            {...aideCommun}
            estPremierEcran={estPremierEcran}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={null}
            consigneEcran={consigneEcran(exercice, phase)}
            options={optionsStatutE()}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))}
          />
        )}

        {estEcranLocusB && exercice.famille === "B" && "resultat" in exercice && (
          <EtapeLocusComplexesAvances
            key={phase}
            {...aideCommun}
            estPremierEcran={estPremierEcran}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={null}
            consigneEcran={consigneEcran(exercice, phase)}
            demandePoleExclu={exercice.poleExclu !== null}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {estEcranConclusionC && (
          <EtapeConclusionC
            key={phase}
            {...aideCommun}
            estPremierEcran={estPremierEcran}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={null}
            consigneEcran={consigneEcran(exercice, phase)}
            optionsStatut={optionsStatutC()}
            optionsReciproque={optionsReciproqueC()}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {estEcranListe && (
          <EtapeListeComplexesAvances
            key={phase}
            {...aideCommun}
            estPremierEcran={estPremierEcran}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={null}
            consigneEcran={consigneEcran(exercice, phase)}
            nombreMaxLignes={nombreMaxListe()}
            placeholder={placeholderListe()}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {!estEcranDedie && (
          <EtapeChampsComplexesAvances
            key={phase}
            {...aideCommun}
            estPremierEcran={estPremierEcran}
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
        )}
        {calculatriceVisible && <CalculatriceScientifique />}
      </main>
    </div>
  );
}
