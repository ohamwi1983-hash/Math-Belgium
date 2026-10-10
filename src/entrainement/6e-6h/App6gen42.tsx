import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComplexesAvances } from "./generateurs6e/complexesAvances";
import type { IdVarianteComplexesAvances } from "./generateurs6e/complexesAvances";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionComplexesAvances, soumettreReponseEcran } from "./moteur6e/sessionComplexesAvances";
import type { EtatSessionComplexesAvances, PhaseComplexesAvances, ResultatExerciceComplexesAvances } from "./moteur6e/typesComplexesAvances";
import { diagnostiquerEcran } from "./moteur6e/verificationComplexesAvances";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { EtapeChampsComplexesAvances } from "./components6e/EtapeChampsComplexesAvances";
import { EtapeConclusionC } from "./components6e/EtapeConclusionC";
import { EtapeListeComplexesAvances } from "./components6e/EtapeListeComplexesAvances";
import { EtapeLocusComplexesAvances } from "./components6e/EtapeLocusComplexesAvances";
import { EtapeQcmComplexesAvances } from "./components6e/EtapeQcmComplexesAvances";
import { ResultatPanelComplexesAvances } from "./components6e/ResultatPanelComplexesAvances";
import { ResumeSessionComplexesAvances } from "./components6e/ResumeSessionComplexesAvances";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  blocDonnees,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  etatActuel,
  niveauAideMaxEcran,
  optionsEcran1A,
  optionsEcran2A,
  optionsEcran3A,
  optionsReciproqueC,
  optionsStatutC,
  optionsStatutE,
  aideNiveau1 as formatAideNiveau1,
  aideNiveau2 as formatAideNiveau2,
} from "./ui6e/formatComplexesAvances";

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

type AideParPhase = Partial<Record<PhaseComplexesAvances, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceComplexesAvances;
  aideParPhase: AideParPhase;
}


export function App6gen42() {
  const [etat, setEtat] = useState<EtatSessionComplexesAvances>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionComplexesAvances) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen34/6gen37/6gen40 répliqué à
    // l'identique.
    const miseAJour: AideParPhase = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereTransitionRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setAideParPhase({});
    setEtat(demarrerSessionComplexesAvances(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteComplexesAvances)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen40.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen42?: unknown }).__debug6gen42 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
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
      </header>
      <main className="card">
        {enCoursDeSession && estEcranQcmA && exercice.famille === "A" && (
          <EtapeQcmComplexesAvances
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            options={phase === "aEcran1" ? optionsEcran1A(exercice.n) : phase === "aEcran2" ? optionsEcran2A(exercice.n) : optionsEcran3A(exercice)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))}
          />
        )}

        {enCoursDeSession && estEcranQcmE && (
          <EtapeQcmComplexesAvances
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            options={optionsStatutE()}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))}
          />
        )}

        {enCoursDeSession && estEcranLocusB && exercice.famille === "B" && "resultat" in exercice && (
          <EtapeLocusComplexesAvances
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            demandePoleExclu={exercice.poleExclu !== null}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {enCoursDeSession && estEcranConclusionC && (
          <EtapeConclusionC
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            optionsStatut={optionsStatutC()}
            optionsReciproque={optionsReciproqueC()}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {enCoursDeSession && estEcranListe && (
          <EtapeListeComplexesAvances
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            nombreMaxLignes={nombreMaxListe()}
            placeholder={placeholderListe()}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {enCoursDeSession && !estEcranDedie && (
          <EtapeChampsComplexesAvances
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}
        {enCoursDeSession && calculatriceVisible && <CalculatriceScientifique />}

        {dernierBilan && <ResultatPanelComplexesAvances resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionComplexesAvances resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
