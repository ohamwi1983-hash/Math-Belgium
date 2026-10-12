import { useState } from "react";
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
import type { EtatSessionLimiteLogarithmique } from "./moteur6e/typesLimitesLogarithmiques";
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
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

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

  function terminerEtape(nouvelEtat: EtatSessionLimiteLogarithmique) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // La phase qui vient PRÉCISÉMENT de se fermer est `etat.phase` (pas `nouvelEtat.phase`) — son
      // détail vit soit dans `detailsPartiels` (écran intermédiaire), soit dans le `resultats` qui
      // vient d'être poussé (dernier écran de l'exercice), même principe que `App6gen6.tsx`.
      const exerciceVientDeFinir = nouvelEtat.resultats.length > etat.resultats.length;
      const detail = exerciceVientDeFinir
        ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1].details[etat.phase]
        : nouvelEtat.detailsPartiels[etat.phase];
      setEnAttente({ etatSuivant: nouvelEtat, revele: detail?.revele ?? false });
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Calculer des limites (fonctions logarithmes)</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLimiteLogarithmique(etat)} />
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
                onValider={(reponse) => terminerEtape(soumettreReponseADominance(etat, reponse))}
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
                onValider={(reponse) => terminerEtape(soumettreReponseAConclure(etat, reponse))}
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
                onValider={(texte) => terminerEtape(soumettreReponseBReformuler(etat, texte))}
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
                onValider={(texte) => terminerEtape(soumettreReponseBConclure(etat, texte))}
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
                onValider={(reponse) => terminerEtape(soumettreReponseCDiagnostic(etat, reponse))}
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
                onValider={(reponse) => terminerEtape(soumettreReponseCConclure(etat, reponse))}
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
                onValider={(texte) => terminerEtape(soumettreReponseDExposant(etat, texte))}
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
                onValider={(texte) => terminerEtape(soumettreReponseDLimiteExposant(etat, texte))}
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
                onValider={(texte) => terminerEtape(soumettreReponseDConclure(etat, texte))}
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
                onValider={(texte) => terminerEtape(soumettreReponseEDevelopper(etat, texte))}
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
                onValider={(texte) => terminerEtape(soumettreReponseESimplifier(etat, texte))}
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
                onValider={(texte) => terminerEtape(soumettreReponseEConclure(etat, texte))}
                validation={validation}
              />
            )}
      </main>
    </div>
  );
}
