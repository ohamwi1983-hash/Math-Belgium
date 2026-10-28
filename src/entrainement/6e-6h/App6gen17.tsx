import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLimiteLogarithmique } from "./generateurs6e/limitesLogarithmiques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionLimiteLogarithmique,
  soumettreReponseAConclure,
  soumettreReponseADominance,
  soumettreReponseBConclure,
  soumettreReponseBReformuler,
  soumettreReponseCConclure,
  soumettreReponseCDiagnostic,
  soumettreReponseDConclure,
  soumettreReponseDExposant,
  soumettreReponseDLimiteExposant,
  soumettreReponseEConclure,
  soumettreReponseEDevelopper,
  soumettreReponseESimplifier,
} from "./moteur6e/sessionLimitesLogarithmiques";
import { phaseApres, phaseInitiale } from "./moteur6e/typesLimitesLogarithmiques";
import type { EtatSessionLimiteLogarithmique, PhaseLimiteLogarithmique } from "./moteur6e/typesLimitesLogarithmiques";
import type { ReponseLimiteLog } from "./moteur6e/verificationLimitesLogarithmiques";
import { EtapeChampLimiteLog } from "./components6e/EtapeChampLimiteLog";
import { EtapeDiagnosticC } from "./components6e/EtapeDiagnosticC";
import { EtapeDominanceA } from "./components6e/EtapeDominanceA";
import { EtapeReponseLimiteLog } from "./components6e/EtapeReponseLimiteLog";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import {
  aideNiveau1,
  aideNiveau2,
  configDiagnosticPartiesC,
  consigneEcran,
  etatActuel,
  formatCategorieLabel,
  formatCibleTexte,
  formatLimiteEnonceLatex,
} from "./ui6e/formatLimitesLogarithmiques";
import { calculerRecapitulatifLimiteLogarithmique, calculerSegmentsProgressionLimiteLogarithmique } from "./ui6e/recapitulatifLimitesLogarithmiques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/** Même libellé, phase par phase, que `LIBELLE_PHASE` (`ui6e/recapitulatifLimitesLogarithmiques.ts`,
 * non exporté) — répliqué ICI pour la fiche de consultation. */
const LIBELLE_PHASE: Record<PhaseLimiteLogarithmique, string> = {
  aDominance: "Dominance (num./dénom.)",
  aConclure: "Limite",
  bReformuler: "Forme reformulée",
  bConclure: "Limite",
  cDiagnostic: "Diagnostic (num./dénom.)",
  cConclure: "Limite",
  dExposant: "Exposant isolé",
  dLimiteExposant: "Limite de l'exposant",
  dConclure: "Limite",
  eDevelopper: "Numérateur développé",
  eSimplifier: "Forme simplifiée",
  eConclure: "Limite",
};

/** Séquence RÉELLEMENT traversée par la famille de l'exercice courant — même reconstruction que
 * `sequenceReelle` (`ui6e/recapitulatifLimitesLogarithmiques.ts`, non exporté), répliquée ICI à
 * partir de `phaseInitiale`/`phaseApres` pour aligner l'index des segments de `ProgressionPuces`
 * sur celui de `historique`. */
function sequenceReelle(exercice: Parameters<typeof phaseInitiale>[0]): PhaseLimiteLogarithmique[] {
  const sequence: PhaseLimiteLogarithmique[] = [];
  let phase: PhaseLimiteLogarithmique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase);
  }
  return sequence;
}

/** Format court "votre réponse" pour les écrans catégoriels (`ReponseLimiteLog`, miroir élève de
 * `CibleLimiteLog`, réutilisée par A-conclure/C-diagnostic/C-conclure — voir en-tête de
 * `verificationLimitesLogarithmiques.ts`). */
function formatReponseLimiteLogCourt(r: ReponseLimiteLog): string {
  switch (r.type) {
    case "plus_infini":
      return "+∞";
    case "moins_infini":
      return "−∞";
    case "zero":
      return "0";
    case "valeur":
      return r.texte;
  }
}

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionLimiteLogarithmique {
  return demarrerSessionLimiteLogarithmique(REGLAGES_DEMO, genererExerciceLimiteLogarithmique);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLimiteLogarithmique;
  revele: boolean;
}

export function App6gen17() {
  const [etat, setEtat] = useState<EtatSessionLimiteLogarithmique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionLimiteLogarithmique`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice (mêmes endroits que `enAttente`). L'aide PAR PHASE DÉJÀ CLOSE n'a pas
   * besoin d'être trackée ici séparément : elle est déjà persistée côté moteur
   * (`detailsPartiels[phase].niveauAide`, voir `DetailPhaseLimiteLogarithmique`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionLimiteLogarithmique, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // La phase qui vient PRÉCISÉMENT de se fermer est `etat.phase` (pas `nouvelEtat.phase`) — son
      // détail vit soit dans `detailsPartiels` (écran intermédiaire), soit dans le `resultats` qui
      // vient d'être poussé (dernier écran de l'exercice), même principe que `App6gen6.tsx`.
      const exerciceVientDeFinir = nouvelEtat.resultats.length > etat.resultats.length;
      const detail = exerciceVientDeFinir
        ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1].details[etat.phase]
        : nouvelEtat.detailsPartiels[etat.phase];
      const revele = detail?.revele ?? false;
      // `votreReponse` : UNIQUEMENT poussée dans l'historique dans cette branche de transition
      // RÉELLE — jamais à chaque clic sur "Valider".
      if (votreReponse !== undefined) {
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[etat.phase],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? reponseAttenduePhase() : undefined,
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
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setEtat(demarrerSessionLimiteLogarithmique(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const enonceLatex = formatLimiteEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);
  const etatAct = etatActuel(phase, exercice);

  // Réplique exactement le contenu (par écran RÉELLEMENT traversé) de l'ancien
  // `ResultatPanelLimitesLogarithmiques.tsx` — jamais une cible recalculée séparément. Narrowe
  // `exercice.famille` avant de lire ses champs propres à la famille, `phase` seul ne suffisant pas
  // à TypeScript pour prouver la correspondance phase/famille, même si elle est garantie à
  // l'exécution (préfixe de phase par lettre de famille).
  const reponseAttenduePhase = () => {
    if (exercice.famille === "A") {
      if (phase === "aDominance") {
        return (
          <>
            Numérateur : {formatCategorieLabel(exercice.dominanceNumerateur)} — Dénominateur :{" "}
            {formatCategorieLabel(exercice.dominanceDenominateur)}
          </>
        );
      }
      if (phase === "aConclure") return <Katex expression={formatCibleTexte(exercice.limiteGlobale)} />;
    }
    if (exercice.famille === "B") {
      if (phase === "bReformuler") {
        return "Forme reformulée en u=x/x0−1, faisant apparaître la limite de référence, équivalente à f(x).";
      }
      if (phase === "bConclure") return <Katex expression={String(exercice.limiteFinale)} />;
    }
    if (exercice.famille === "C") {
      if (phase === "cDiagnostic") {
        return "Numérateur et dénominateur (ou chaque facteur) évalués séparément, avant toute conclusion.";
      }
      if (phase === "cConclure") return <Katex expression={formatCibleTexte(exercice.limiteFinale)} />;
    }
    if (exercice.famille === "D") {
      if (phase === "dExposant") return "f^g réécrit e^(g·ln f), exposant g·ln(f) isolé, équivalent à la forme attendue.";
      if (phase === "dLimiteExposant") return <Katex expression={String(exercice.limiteExposant)} />;
      if (phase === "dConclure") return <Katex expression={`e^{${exercice.limiteExposant}}`} />;
    }
    if (exercice.famille === "E") {
      if (phase === "eDevelopper") return <Katex expression="x^2\left(\ln 3+\frac12\right)" />;
      if (phase === "eSimplifier") return <Katex expression="\frac{\ln 3+\frac12}{4}" />;
      if (phase === "eConclure") return <Katex expression="\frac{2\ln 3+1}{8}" />;
    }
    return null;
  };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  // "aide" (puce jaune) : post-traite les segments déjà calculés par `calculerSegmentsProgressionLimiteLogarithmique`
  // avec `detailsPartiels[phase].niveauAide`, déjà persisté côté moteur (jamais recalculé ici).
  const sequence = sequenceReelle(exercice);
  const segments: EtatPuceProgression[] = calculerSegmentsProgressionLimiteLogarithmique(etat).map((segment, index) => {
    if (segment !== "correcte") return segment;
    const detail = etat.detailsPartiels[sequence[index]];
    return detail && detail.niveauAide > 0 ? "aide" : segment;
  });

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Calculer des limites (fonctions logarithmes)</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLimiteLogarithmique(etat)} />
        {phase === "aDominance" && exercice.famille === "A" && (
              <EtapeDominanceA
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) =>
                  terminerEtape(
                    soumettreReponseADominance(etat, reponse),
                    `Numérateur : ${formatCategorieLabel(reponse.numerateur)} — Dénominateur : ${formatCategorieLabel(reponse.denominateur)}`,
                  )
                }
                validation={validation}
              />
            )}
            {phase === "aConclure" && exercice.famille === "A" && (
              <EtapeReponseLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                optionsCategorielles={["plus_infini", "moins_infini", "zero"]}
                autoriserValeurLibre
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseAConclure(etat, reponse), formatReponseLimiteLogCourt(reponse))}
                validation={validation}
              />
            )}

            {phase === "bReformuler" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : ln(1+2*u)/(2*ln(1+u)) (en fonction de u)"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseBReformuler(etat, texte), texte)}
                validation={validation}
              />
            )}
            {phase === "bConclure" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : 1/2, ln(3)..."
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseBConclure(etat, texte), texte)}
                validation={validation}
              />
            )}

            {phase === "cDiagnostic" && exercice.famille === "C" && (
              <EtapeDiagnosticC
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                partie1={configDiagnosticPartiesC(exercice).partie1}
                partie2={configDiagnosticPartiesC(exercice).partie2}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) =>
                  terminerEtape(
                    soumettreReponseCDiagnostic(etat, reponse),
                    `partie 1 : ${formatReponseLimiteLogCourt(reponse.partie1)} ; partie 2 : ${formatReponseLimiteLogCourt(reponse.partie2)}`,
                  )
                }
                validation={validation}
              />
            )}
            {phase === "cConclure" && (
              <EtapeReponseLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                optionsCategorielles={["plus_infini", "moins_infini", "zero"]}
                autoriserValeurLibre
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseCConclure(etat, reponse), formatReponseLimiteLogCourt(reponse))}
                validation={validation}
              />
            )}

            {phase === "dExposant" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : (3/x^2)*ln(cos(2*x))"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseDExposant(etat, texte), texte)}
                validation={validation}
              />
            )}
            {phase === "dLimiteExposant" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : -6"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseDLimiteExposant(etat, texte), texte)}
                validation={validation}
              />
            )}
            {phase === "dConclure" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : exp(-6)"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseDConclure(etat, texte), texte)}
                validation={validation}
              />
            )}

            {phase === "eDevelopper" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : x^2*(ln(3)+1/2)"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseEDevelopper(etat, texte), texte)}
                validation={validation}
              />
            )}
            {phase === "eSimplifier" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : (ln(3)+1/2)/4"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseESimplifier(etat, texte), texte)}
                validation={validation}
              />
            )}
            {phase === "eConclure" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : (2*ln(3)+1)/8"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseEConclure(etat, texte), texte)}
                validation={validation}
              />
            )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
