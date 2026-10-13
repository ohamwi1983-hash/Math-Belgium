import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimiteExponentielle } from "./generateurs6e/limitesExponentielles";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionLimiteExponentielle,
  soumettreReponseAExposant,
  soumettreReponseAGlobale,
  soumettreReponseBExponentielle,
  soumettreReponseBGlobale,
  soumettreReponseBPolynomiale,
  soumettreReponseCFacteurs,
  soumettreReponseCGlobale,
  soumettreReponseGCombiner,
  soumettreReponseGConclure,
  soumettreReponseGOrdre1,
  soumettreReponseHConclure,
  soumettreReponseHDenominateur,
  soumettreReponseHForme,
  soumettreReponseHNumerateur,
  soumettreReponseIConclure,
  soumettreReponseIDenominateur,
  soumettreReponseIForme,
  soumettreReponseINumerateur,
  soumettreReponseJConclure,
  soumettreReponseJDenominateur,
  soumettreReponseJForme,
  soumettreReponseJNumerateur,
  soumettreReponseKConclure,
  soumettreReponseKDenominateur1,
  soumettreReponseKDenominateur2,
  soumettreReponseKForme,
  soumettreReponseKNumerateur1,
  soumettreReponseKNumerateur2,
  soumettreReponseLConclure,
  soumettreReponseLReformuler,
  soumettreReponseNCombiner,
  soumettreReponseNConclure,
} from "./moteur6e/sessionLimitesExponentielles";
import type { EtatSessionLimiteExponentielle } from "./moteur6e/typesLimitesExponentielles";
import { EtapeChampLimiteExpo } from "./components6e/EtapeChampLimiteExpo";
import { EtapeFacteursC } from "./components6e/EtapeFacteursC";
import { EtapeFormeFI } from "./components6e/EtapeFormeFI";
import { EtapeOrdre1G } from "./components6e/EtapeOrdre1G";
import { EtapeReponseLimite } from "./components6e/EtapeReponseLimite";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { aideNiveau1, aideNiveau2, consigneEcran, formatCibleTexte, formatLimiteEnonceLatex } from "./ui6e/formatLimitesExponentielles";
import { calculerRecapitulatifLimitesExponentielles, calculerSegmentsProgressionLimitesExponentielles } from "./ui6e/recapitulatifLimitesExponentielles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLimiteExponentielle {
  return demarrerSessionLimiteExponentielle(REGLAGES_DEMO, genererExerciceLimiteExponentielle);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLimiteExponentielle;
  revele: boolean;
}

export function App6gen6() {
  const [etat, setEtat] = useState<EtatSessionLimiteExponentielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionLimiteExponentielle) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // La phase qui vient PRÉCISÉMENT de se fermer est `etat.phase` (pas `nouvelEtat.phase`) — son
      // détail (`revele`/`niveauAide`) vit soit dans `detailsPartiels` (écran intermédiaire), soit
      // dans le `resultats` qui vient d'être poussé (dernier écran de l'exercice, voir
      // `avancerPhase`/`cloturerExerciceOuSuivant`, `sessionLimitesExponentielles.ts`).
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
    setEtat(demarrerSessionLimiteExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
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

  const enonceLatex = formatLimiteEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);

  // Hook de vérification Playwright/dev — même principe que les autres générateurs 6e (ex.
  // App6gen23.tsx) : exposé UNIQUEMENT en mode dev (import.meta.env.DEV OU ?dev=1), jamais en prod.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen6?: unknown }).__debug6gen6 = { exercice, phase };
  }

  // Réplique exactement le contenu (par écran RÉELLEMENT traversé) de l'ancien
  // `ResultatPanelLimiteExponentielle.tsx` — jamais une cible recalculée séparément. Narrowe
  // `exercice.famille` avant de lire ses champs propres à la famille (ex. `limiteExposant`),
  // `etat.phase` seul ne suffisant pas à TypeScript pour prouver la correspondance phase/famille,
  // même si elle est garantie à l'exécution (préfixe de phase par lettre de famille — voir
  // `typesLimitesExponentielles.ts`).
  const reponseAttenduePhase = () => {
    if (exercice.famille === "A") {
      if (phase === "aExposant") return <Katex expression={formatCibleTexte(exercice.limiteExposant)} />;
      if (phase === "aGlobale") return <Katex expression={formatCibleTexte(exercice.limiteGlobale)} />;
    }
    if (exercice.famille === "B") {
      if (phase === "bExponentielle") return <Katex expression={formatCibleTexte(exercice.limiteExponentielle)} />;
      if (phase === "bPolynomiale") return <Katex expression={formatCibleTexte(exercice.limitePolynomiale)} />;
      if (phase === "bGlobale") return <Katex expression={formatCibleTexte(exercice.limiteGlobale)} />;
    }
    if (exercice.famille === "C") {
      if (phase === "cFacteurs")
        return <Katex expression={`${formatCibleTexte(exercice.limiteFacteur1)} \\quad , \\quad ${formatCibleTexte(exercice.limiteFacteur2)}`} />;
      if (phase === "cGlobale") return <Katex expression={String(exercice.limiteGlobale)} />;
    }
    if (exercice.famille === "G") {
      if (phase === "gCombiner") return "Les deux termes combinés en une seule fraction, équivalente à f(x).";
      if (phase === "gOrdre1") return "Non — un développement à l'ordre 1 ne suffit pas ici (les termes dominants s'annulent).";
      if (phase === "gConclure") return <Katex expression={String(exercice.limiteFinale)} />;
    }
    if (exercice.famille === "H") {
      if (phase === "hForme") return "0/0";
      if (phase === "hNumerateur")
        return exercice.expAuNumerateur ? (
          "Forme équivalente à f'(x), vérifiée par équivalence numérique."
        ) : (
          <Katex expression={String(exercice.m)} />
        );
      if (phase === "hDenominateur")
        return exercice.expAuNumerateur ? (
          <Katex expression={String(exercice.m)} />
        ) : (
          "Forme équivalente à g'(x), vérifiée par équivalence numérique."
        );
      if (phase === "hConclure") return <Katex expression={String(exercice.limiteFinale)} />;
    }
    if (exercice.famille === "I") {
      if (phase === "iForme") return "0/0";
      if (phase === "iNumerateur") return "Forme équivalente à f'(x), vérifiée par équivalence numérique.";
      if (phase === "iDenominateur") return "Forme équivalente à g'(x), vérifiée par équivalence numérique.";
      if (phase === "iConclure") return <Katex expression={String(exercice.limiteFinale)} />;
    }
    if (exercice.famille === "J") {
      if (phase === "jForme") return "0/0";
      if (phase === "jNumerateur") return "Forme équivalente à f'(x), vérifiée par équivalence numérique.";
      if (phase === "jDenominateur") return "Forme équivalente à g'(x), vérifiée par équivalence numérique.";
      if (phase === "jConclure") return <Katex expression={String(exercice.limiteFinale)} />;
    }
    if (exercice.famille === "K") {
      if (phase === "kForme") return "0/0";
      if (phase === "kNumerateur1") return "Forme équivalente à f'(x), vérifiée par équivalence numérique.";
      if (phase === "kDenominateur1") return "Forme équivalente à g'(x), vérifiée par équivalence numérique.";
      if (phase === "kNumerateur2")
        return exercice.expAuNumerateur ? (
          "Forme équivalente à f''(x), vérifiée par équivalence numérique."
        ) : (
          <Katex expression={String(2 * exercice.m)} />
        );
      if (phase === "kDenominateur2")
        return exercice.expAuNumerateur ? (
          <Katex expression={String(2 * exercice.m)} />
        ) : (
          "Forme équivalente à g''(x), vérifiée par équivalence numérique."
        );
      if (phase === "kConclure") return <Katex expression={String(exercice.limiteFinale)} />;
    }
    if (exercice.famille === "L") {
      if (phase === "lReformuler") return "Forme reformulée vers le pivot (1+1/u)^u, équivalente à f(x).";
      if (phase === "lConclure") return <Katex expression={`e^{${exercice.k * exercice.m}}`} />;
    }
    if (exercice.famille === "N") {
      if (phase === "nCombiner") return "Forme combinée via la loi des puissances, équivalente à f(x).";
      if (phase === "nConclure") return <Katex expression={`${exercice.base}^{${exercice.k * exercice.m}}`} />;
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
        <h1 className="app-title">Calcul de limites (fonctions exponentielles)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLimitesExponentielles(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLimitesExponentielles(etat)} />
        <div className="card-body">
          {(phase === "aExposant" || phase === "aGlobale") && (
                <EtapeReponseLimite
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  optionsCategorielles={phase === "aExposant" ? ["plus_infini", "moins_infini"] : ["plus_infini", "zero"]}
                  autoriserValeurLibre
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(phase === "aExposant" ? soumettreReponseAExposant(etat, reponse) : soumettreReponseAGlobale(etat, reponse))
                  }
                  validation={validation}
                />
              )}

              {phase === "bExponentielle" && (
                <EtapeReponseLimite
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  optionsCategorielles={["plus_infini", "zero"]}
                  autoriserValeurLibre
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseBExponentielle(etat, reponse))}
                  validation={validation}
                />
              )}
              {(phase === "bPolynomiale" || phase === "bGlobale") && (
                <EtapeReponseLimite
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  optionsCategorielles={["plus_infini", "moins_infini"]}
                  autoriserValeurLibre={false}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(phase === "bPolynomiale" ? soumettreReponseBPolynomiale(etat, reponse) : soumettreReponseBGlobale(etat, reponse))
                  }
                  validation={validation}
                />
              )}

              {phase === "cFacteurs" && (
                <EtapeFacteursC
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseCFacteurs(etat, reponse))}
                  validation={validation}
                />
              )}
              {phase === "cGlobale" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 0"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCGlobale(etat, texte))}
                  validation={validation}
                />
              )}

              {phase === "gCombiner" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder="ex : (1-exp(pi/2-x)+cos(x))/(cos(x)*(1-exp(pi/2-x)))"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGCombiner(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "gOrdre1" && (
                <EtapeOrdre1G
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(ordre1Suffit) => terminerEtape(soumettreReponseGOrdre1(etat, ordre1Suffit))}
                  validation={validation}
                />
              )}
              {phase === "gConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 1/2, 0.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGConclure(etat, texte))}
                  validation={validation}
                />
              )}

              {phase === "hForme" && (
                <EtapeFormeFI
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseHForme(etat, reponse))}
                  validation={validation}
                />
              )}
              {phase === "hNumerateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={exercice.famille === "H" && exercice.expAuNumerateur ? `ex : 3*ln(${exercice.base})*${exercice.base}^(3*x)` : "ex : 2"}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHNumerateur(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "hDenominateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "H" && !exercice.expAuNumerateur ? `ex : 3*ln(${exercice.base})*${exercice.base}^(3*x)` : "ex : 2"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHDenominateur(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "hConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 3/2, 1.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHConclure(etat, texte))}
                  validation={validation}
                />
              )}

              {phase === "iForme" && (
                <EtapeFormeFI
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseIForme(etat, reponse))}
                  validation={validation}
                />
              )}
              {phase === "iNumerateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "I" && !exercice.sinAuNumerateur ? `ex : 2*ln(${exercice.base})*${exercice.base}^(2*x)` : "ex : 3*cos(3*x)"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseINumerateur(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "iDenominateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "I" && exercice.sinAuNumerateur
                      ? "ex : 3*cos(3*x)"
                      : exercice.famille === "I"
                        ? `ex : 2*ln(${exercice.base})*${exercice.base}^(2*x)`
                        : "ex : 3*cos(3*x)"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseIDenominateur(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "iConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 3/2, 1.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseIConclure(etat, texte))}
                  validation={validation}
                />
              )}

              {phase === "jForme" && (
                <EtapeFormeFI
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseJForme(etat, reponse))}
                  validation={validation}
                />
              )}
              {phase === "jNumerateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "J" && exercice.arcAuNumerateur
                      ? exercice.arcFn === "arctan"
                        ? "ex : 3/(1+(3*x)^2)"
                        : "ex : 3/sqrt(1-(3*x)^2)"
                      : exercice.famille === "J"
                        ? `ex : 2*ln(${exercice.base})*${exercice.base}^(2*x)`
                        : "ex : 3/(1+(3*x)^2)"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseJNumerateur(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "jDenominateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "J" && !exercice.arcAuNumerateur
                      ? exercice.arcFn === "arctan"
                        ? "ex : 3/(1+(3*x)^2)"
                        : "ex : 3/sqrt(1-(3*x)^2)"
                      : exercice.famille === "J"
                        ? `ex : 2*ln(${exercice.base})*${exercice.base}^(2*x)`
                        : "ex : 2*exp(2*x)"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseJDenominateur(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "jConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 3/2, 1.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseJConclure(etat, texte))}
                  validation={validation}
                />
              )}

              {phase === "kForme" && (
                <EtapeFormeFI
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseKForme(etat, reponse))}
                  validation={validation}
                />
              )}
              {phase === "kNumerateur1" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "K" && exercice.expAuNumerateur ? `ex : 3*ln(${exercice.base})*(${exercice.base}^(3*x)-1)` : "ex : 4*x"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKNumerateur1(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "kDenominateur1" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "K" && !exercice.expAuNumerateur ? `ex : 3*ln(${exercice.base})*(${exercice.base}^(3*x)-1)` : "ex : 4*x"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKDenominateur1(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "kNumerateur2" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "K" && exercice.expAuNumerateur ? `ex : 9*ln(${exercice.base})^2*${exercice.base}^(3*x)` : "ex : 4"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKNumerateur2(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "kDenominateur2" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "K" && !exercice.expAuNumerateur ? `ex : 9*ln(${exercice.base})^2*${exercice.base}^(3*x)` : "ex : 4"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKDenominateur2(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "kConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 9/4, 2.25"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKConclure(etat, texte))}
                  validation={validation}
                />
              )}

              {phase === "lReformuler" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "L" && exercice.sousType === "L1"
                      ? "ex : (1+1/u)^(6*u) (en fonction de u)"
                      : "ex : (1+t)^(6/t) (en fonction de t)"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseLReformuler(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "lConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder="ex : e^6, exp(6)"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseLConclure(etat, texte))}
                  validation={validation}
                />
              )}

              {phase === "nCombiner" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={exercice.famille === "N" ? `ex : ${exercice.base}^(6+3*x)` : "ex : 2^(6+3*x)"}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseNCombiner(etat, texte))}
                  validation={validation}
                />
              )}
              {phase === "nConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={consigne}
                  etatActuel={null}
                  enonceLatex={enonceLatex}
                  placeholder={exercice.famille === "N" ? `ex : ${exercice.base}^6` : "ex : 2^6"}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseNConclure(etat, texte))}
                  validation={validation}
                />
              )}
        </div>
      </main>
    </div>
  );
}
