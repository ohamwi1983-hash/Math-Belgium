import { useState } from "react";
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
import type { EtatSessionLimiteExponentielle, PhaseLimiteExponentielle } from "./moteur6e/typesLimitesExponentielles";
import { phaseApres, phaseInitiale } from "./moteur6e/typesLimitesExponentielles";
import type { ReponseFacteursC, ReponseLimite } from "./moteur6e/verificationLimitesExponentielles";
import type { CategorieFI } from "./core6e/limitesExponentielles.types";
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
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

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

/** Reconstitue la séquence RÉELLEMENT traversée par CET exercice en bouclant `phaseInitiale`/
 * `phaseApres` jusqu'à "termine" — même technique que `ui6e/recapitulatifLimitesExponentielles.ts`
 * (non exportée depuis ce fichier, reconstruite ici pour la puce "aide"). */
function sequenceDesPhases(exercice: EtatSessionLimiteExponentielle["exerciceCourant"]): PhaseLimiteExponentielle[] {
  const phases: PhaseLimiteExponentielle[] = [];
  let phase: PhaseLimiteExponentielle | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

/** Formate la réponse catégorielle/texte libre de l'écran pour la fiche de consultation — même
 * primitive `ReponseLimite` que les 7 écrans catégoriels (A×2, B×3, C-facteurs, voir
 * `verificationLimitesExponentielles.ts`). */
function formatReponseLimiteTexte(r: ReponseLimite): string {
  if (r.type === "plus_infini") return "+∞";
  if (r.type === "moins_infini") return "-∞";
  if (r.type === "zero") return "0";
  return r.texte;
}

function formatCategorieFITexte(c: CategorieFI): string {
  return c === "zero_sur_zero" ? "0/0" : c === "infini_sur_infini" ? "∞/∞" : "Pas une FI";
}

export function App6gen6() {
  const [etat, setEtat] = useState<EtatSessionLimiteExponentielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionLimiteExponentielle`, jamais dans le moteur (même principe que la référence 4e,
   * `AppAnalyseFonction.tsx`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function ajouterHistorique(votreReponse: string, nouvelEtat: EtatSessionLimiteExponentielle) {
    const recap = calculerRecapitulatifLimitesExponentielles(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionLimiteExponentielle, votreReponse?: string) {
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
      // `nouvelEtat.phase !== etat.phase` (jamais seulement `exerciceVientDeFinir`/`terminee`) —
      // quand l'écran qui vient de clore est le DERNIER de l'exercice, `nouvelEtat.phase`/
      // `detailsPartiels` restent ceux d'AVANT cette soumission (voir `exerciceVientDeFinir`
      // ci-dessus) : `calculerRecapitulatifLimitesExponentielles(nouvelEtat)` y verrait alors
      // l'écran précédent, pas celui qui vient de clore. Sans incidence pratique : cet écran est le
      // dernier, sa puce reste "courante" jusqu'au reset du nouvel exercice (jamais cliquable), même
      // principe que `App6gen58.tsx`/la référence 4e (`tableauSignes`, jamais de `votreReponse`
      // passé).
      if (votreReponse !== undefined && nouvelEtat.phase !== etat.phase) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: detail?.revele ?? false });
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
    setEtat(demarrerSessionLimiteExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
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

  // "aide" (puce jaune) remplace "correcte" pour tout écran clos avec `niveauAide>0` —
  // `detailsPartiels[phase].niveauAide` (jamais recalculé depuis le score, voir le commentaire de
  // `DetailPhaseLimiteExponentielle`, `typesLimitesExponentielles.ts`).
  const sequencePhases = sequenceDesPhases(exercice);
  const segments = calculerSegmentsProgressionLimitesExponentielles(etat).map((segment, i) =>
    segment === "correcte" && (etat.detailsPartiels[sequencePhases[i]]?.niveauAide ?? 0) > 0 ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Calcul de limites (fonctions exponentielles)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLimitesExponentielles(etat)} />
        <div className="card-body">
          {(phase === "aExposant" || phase === "aGlobale") && (
                <EtapeReponseLimite
                  key={phase}
                  consigneEcran={consigne}
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
                    terminerEtape(
                      phase === "aExposant" ? soumettreReponseAExposant(etat, reponse) : soumettreReponseAGlobale(etat, reponse),
                      formatReponseLimiteTexte(reponse),
                    )
                  }
                  validation={validation}
                />
              )}

              {phase === "bExponentielle" && (
                <EtapeReponseLimite
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(reponse) => terminerEtape(soumettreReponseBExponentielle(etat, reponse), formatReponseLimiteTexte(reponse))}
                  validation={validation}
                />
              )}
              {(phase === "bPolynomiale" || phase === "bGlobale") && (
                <EtapeReponseLimite
                  key={phase}
                  consigneEcran={consigne}
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
                    terminerEtape(
                      phase === "bPolynomiale" ? soumettreReponseBPolynomiale(etat, reponse) : soumettreReponseBGlobale(etat, reponse),
                      formatReponseLimiteTexte(reponse),
                    )
                  }
                  validation={validation}
                />
              )}

              {phase === "cFacteurs" && (
                <EtapeFacteursC
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
                  onValider={(reponse: ReponseFacteursC) =>
                    terminerEtape(
                      soumettreReponseCFacteurs(etat, reponse),
                      `${formatReponseLimiteTexte(reponse.facteur1)} ; ${formatReponseLimiteTexte(reponse.facteur2)}`,
                    )
                  }
                  validation={validation}
                />
              )}
              {phase === "cGlobale" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 0"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCGlobale(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "gCombiner" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : (1-exp(pi/2-x)+cos(x))/(cos(x)*(1-exp(pi/2-x)))"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGCombiner(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "gOrdre1" && (
                <EtapeOrdre1G
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
                  onValider={(ordre1Suffit) => terminerEtape(soumettreReponseGOrdre1(etat, ordre1Suffit), ordre1Suffit ? "Oui" : "Non")}
                  validation={validation}
                />
              )}
              {phase === "gConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 1/2, 0.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "hForme" && (
                <EtapeFormeFI
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
                  onValider={(reponse) => terminerEtape(soumettreReponseHForme(etat, reponse), formatCategorieFITexte(reponse))}
                  validation={validation}
                />
              )}
              {phase === "hNumerateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder={exercice.famille === "H" && exercice.expAuNumerateur ? `ex : 3*ln(${exercice.base})*${exercice.base}^(3*x)` : "ex : 2"}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHNumerateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "hDenominateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(texte) => terminerEtape(soumettreReponseHDenominateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "hConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 3/2, 1.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "iForme" && (
                <EtapeFormeFI
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
                  onValider={(reponse) => terminerEtape(soumettreReponseIForme(etat, reponse), formatCategorieFITexte(reponse))}
                  validation={validation}
                />
              )}
              {phase === "iNumerateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(texte) => terminerEtape(soumettreReponseINumerateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "iDenominateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(texte) => terminerEtape(soumettreReponseIDenominateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "iConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 3/2, 1.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseIConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "jForme" && (
                <EtapeFormeFI
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
                  onValider={(reponse) => terminerEtape(soumettreReponseJForme(etat, reponse), formatCategorieFITexte(reponse))}
                  validation={validation}
                />
              )}
              {phase === "jNumerateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(texte) => terminerEtape(soumettreReponseJNumerateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "jDenominateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(texte) => terminerEtape(soumettreReponseJDenominateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "jConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 3/2, 1.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseJConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "kForme" && (
                <EtapeFormeFI
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
                  onValider={(reponse) => terminerEtape(soumettreReponseKForme(etat, reponse), formatCategorieFITexte(reponse))}
                  validation={validation}
                />
              )}
              {phase === "kNumerateur1" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(texte) => terminerEtape(soumettreReponseKNumerateur1(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "kDenominateur1" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(texte) => terminerEtape(soumettreReponseKDenominateur1(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "kNumerateur2" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(texte) => terminerEtape(soumettreReponseKNumerateur2(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "kDenominateur2" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(texte) => terminerEtape(soumettreReponseKDenominateur2(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "kConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 9/4, 2.25"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "lReformuler" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
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
                  onValider={(texte) => terminerEtape(soumettreReponseLReformuler(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "lConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : e^6, exp(6)"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseLConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "nCombiner" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder={exercice.famille === "N" ? `ex : ${exercice.base}^(6+3*x)` : "ex : 2^(6+3*x)"}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseNCombiner(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "nConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder={exercice.famille === "N" ? `ex : ${exercice.base}^6` : "ex : 2^6"}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseNConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}
        </div>
      </main>
      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
