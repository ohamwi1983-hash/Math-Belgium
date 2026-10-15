import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeFonctionExponentielle } from "./generateurs6e/etudeFonctionExponentielle";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionEtudeFonctionExponentielle,
  soumettreReponseAsymptotes,
  soumettreReponseConcavite,
  soumettreReponseCroissance,
  soumettreReponseDomaine,
  soumettreReponseGraphique,
  soumettreReponseLimites,
} from "./moteur6e/sessionEtudeFonctionExponentielle";
import { phaseApres, phaseInitiale } from "./moteur6e/typesEtudeFonctionExponentielle";
import type { EtatSessionEtudeFonctionExponentielle, PhaseEtudeFonctionExponentielle } from "./moteur6e/typesEtudeFonctionExponentielle";
import type { ReponseAsymptoteDirection, ReponseAsymptotes, ReponseCroissance, ReponseConcavite, ReponseLimites } from "./moteur6e/verificationEtudeFonctionExponentielle";
import type { ReponseLimite } from "./moteur6e/verificationLimitesExponentielles";
import { formatEnsembleReelLatex } from "./ui6e/formatEnsembleReel";
import { EtapeAsymptotesB } from "./components6e/EtapeAsymptotesB";
import { EtapeAsymptotesDeux } from "./components6e/EtapeAsymptotesDeux";
import { EtapeConcavite } from "./components6e/EtapeConcavite";
import { EtapeCroissance } from "./components6e/EtapeCroissance";
import { EtapeDomaineEtudeFonction } from "./components6e/EtapeDomaineEtudeFonction";
import { EtapeLimitesDeux } from "./components6e/EtapeLimitesDeux";
import { EtapeLimitesQuatre } from "./components6e/EtapeLimitesQuatre";
import { EtapeSelectionGraphiqueEtudeFonction } from "./components6e/EtapeSelectionGraphiqueEtudeFonction";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import {
  aideAsymptotesBNiveau1,
  aideAsymptotesBNiveau2,
  aideAsymptotesNiveau1,
  aideAsymptotesNiveau2,
  aideConcaviteNiveau1,
  aideConcaviteNiveau2,
  aideCroissanceNiveau1,
  aideCroissanceNiveau2,
  aideDomaineNiveau1,
  aideDomaineNiveau2,
  aideGraphiqueNiveau1,
  aideGraphiqueNiveau2,
  aideLimitesNiveau1,
  aideLimitesNiveau2,
  consigneAsymptotes,
  consigneLimites,
  contenuRecapPhase,
  directionLabels,
  formatFonctionLatex,
} from "./ui6e/formatEtudeFonctionExponentielle";
import { calculerRecapitulatifEtudeFonctionExponentielle, calculerSegmentsProgressionEtudeFonctionExponentielle } from "./ui6e/recapitulatifEtudeFonctionExponentielle";
import { LIBELLE_PHASE_ETUDE } from "./ui6e/formatEtudeFonctionExponentielle";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEtudeFonctionExponentielle {
  return demarrerSessionEtudeFonctionExponentielle(REGLAGES_DEMO, genererExerciceEtudeFonctionExponentielle);
}

/** Séquence FIXE à 6 écrans (`typesEtudeFonctionExponentielle.ts`) — répliquée ICI à partir de
 * `phaseInitiale`/`phaseApres` (même reconstruction que `sequenceComplete`, non exportée par
 * `ui6e/recapitulatifEtudeFonctionExponentielle.ts`) pour aligner l'index des segments de
 * `ProgressionPuces` sur celui de `historique`/`aideUtiliseeParPhase`. */
function sequenceComplete(): PhaseEtudeFonctionExponentielle[] {
  const phases: PhaseEtudeFonctionExponentielle[] = [];
  let phase: PhaseEtudeFonctionExponentielle | "termine" = phaseInitiale();
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

/** Formats "votre réponse" courts pour la fiche de consultation — mêmes champs que les types déjà
 * exportés par `verificationEtudeFonctionExponentielle.ts`/`verificationLimitesExponentielles.ts`,
 * jamais une forme recalculée différemment. */
function formatReponseLimiteCourt(r: ReponseLimite): string {
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

function formatReponseLimitesCourt(r: ReponseLimites): string {
  if (r.type === "quatre") {
    return `x→x₀⁻ : ${formatReponseLimiteCourt(r.pointMoins)} ; x→x₀⁺ : ${formatReponseLimiteCourt(r.pointPlus)} ; +∞ : ${formatReponseLimiteCourt(r.plusInfini)} ; −∞ : ${formatReponseLimiteCourt(r.moinsInfini)}`;
  }
  return `+∞ : ${formatReponseLimiteCourt(r.plusInfini)} ; −∞ : ${formatReponseLimiteCourt(r.moinsInfini)}`;
}

function formatDirectionCourt(d: ReponseAsymptoteDirection): string {
  return d.existe ? d.texte : "aucune";
}

function formatReponseAsymptotesCourt(r: ReponseAsymptotes): string {
  if (r.type === "b") return `y = ${r.texteHorizontale} (côté ${r.cote === "plus" ? "+∞" : "−∞"})`;
  return `+∞ : ${formatDirectionCourt(r.plusInfini)} ; −∞ : ${formatDirectionCourt(r.moinsInfini)}`;
}

function formatReponseTypePositionCourt(r: ReponseCroissance | ReponseConcavite): string {
  return r.position ? `${r.type} (en ${r.position})` : r.type;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEtudeFonctionExponentielle;
  revele: boolean;
}

export function App6gen11() {
  const [etat, setEtat] = useState<EtatSessionEtudeFonctionExponentielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionEtudeFonctionExponentielle`, jamais dans le moteur. Remis à
   * vide à chaque nouvel exercice (mêmes endroits que `enAttente`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Aide utilisée PAR PHASE DÉJÀ CLOSE — le moteur ne garde aucune trace persistante de l'aide une
   * fois la phase refermée (`niveauAide` est remis à 0 à chaque transition), capturé ICI au moment
   * exact de la clôture réelle (même garde que `terminerEtape`). Remis à vide comme `historique`. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseEtudeFonctionExponentielle, boolean>>>({});

  function terminerEtape(nouvelEtat: EtatSessionEtudeFonctionExponentielle, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereRevelee;
      // `votreReponse`/`niveauAide` : UNIQUEMENT capturés dans la branche de transition RÉELLE —
      // jamais à chaque clic sur "Valider".
      if (votreReponse !== undefined) {
        const contenu = contenuRecapPhase(exercice, etat.phase);
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE_ETUDE[etat.phase],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? (contenu.latex !== null ? <Katex expression={contenu.latex} /> : contenu.texte) : undefined,
          },
        ]);
      }
      if (etat.niveauAide > 0) {
        setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: true }));
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
      setAideUtiliseeParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setEtat(
      demarrerSessionEtudeFonctionExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const exercice = etat.exerciceCourant;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen3.tsx` et la plupart des générateurs 6e récents.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen11?: unknown }).__debug6gen11 = { exercice, phase: etat.phase };
  }

  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const enonceLatex = formatFonctionLatex(exercice);
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  // Inclut `indexExercice` dans la clé — la phase seule peut rester identique entre 2 exercices
  // consécutifs, ce qui empêcherait React de remonter le composant et laisserait la saisie/
  // sélection de l'exercice précédent persister visuellement (leçon retenue à de nombreuses
  // reprises sur ce chantier — voir CLAUDE.md, "5gen6/5gen7", "6gen8").
  const cle = `${etat.indexExercice}-${etat.phase}`;

  const contenuRecap = contenuRecapPhase(exercice, etat.phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: contenuRecap.latex !== null ? <Katex expression={contenuRecap.latex} /> : contenuRecap.texte,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  // "aide" (puce jaune) : post-traite les segments déjà calculés par `calculerSegmentsProgressionEtudeFonctionExponentielle`
  // avec `aideUtiliseeParPhase` capturé localement ci-dessus.
  const sequence = sequenceComplete();
  const segments: EtatPuceProgression[] = calculerSegmentsProgressionEtudeFonctionExponentielle(etat).map((segment, index) =>
    segment === "correcte" && aideUtiliseeParPhase[sequence[index]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Étudier une fonction exponentielle (synthèse)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifEtudeFonctionExponentielle(etat)} />
        <div className="card-body">
          {etat.phase === "domaine" && (
                <EtapeDomaineEtudeFonction
                  key={cle}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aideDomaineNiveau1(exercice)}
                  aideNiveau2={aideDomaineNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                  validation={validation}
                />
              )}

              {etat.phase === "limites" && exercice.famille === "B" && (
                <EtapeLimitesQuatre
                  key={cle}
                  enonceLatex={enonceLatex}
                  consigneEcran={consigneLimites(exercice)}
                  labels={directionLabels(exercice)}
                  aideNiveau1={aideLimitesNiveau1(exercice)}
                  aideNiveau2={aideLimitesNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseLimites(etat, reponse), formatReponseLimitesCourt(reponse))}
                  validation={validation}
                />
              )}
              {etat.phase === "limites" && exercice.famille !== "B" && (
                <EtapeLimitesDeux
                  key={cle}
                  enonceLatex={enonceLatex}
                  consigneEcran={consigneLimites(exercice)}
                  labels={directionLabels(exercice)}
                  aideNiveau1={aideLimitesNiveau1(exercice)}
                  aideNiveau2={aideLimitesNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseLimites(etat, reponse), formatReponseLimitesCourt(reponse))}
                  validation={validation}
                />
              )}

              {etat.phase === "asymptotes" && exercice.famille === "B" && (
                <EtapeAsymptotesB
                  key={cle}
                  enonceLatex={enonceLatex}
                  p={exercice.p}
                  aideNiveau1={aideAsymptotesBNiveau1()}
                  aideNiveau2={aideAsymptotesBNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseAsymptotes(etat, reponse), formatReponseAsymptotesCourt(reponse))}
                  validation={validation}
                />
              )}
              {etat.phase === "asymptotes" && exercice.famille !== "B" && (
                <EtapeAsymptotesDeux
                  key={cle}
                  enonceLatex={enonceLatex}
                  consigneEcran={consigneAsymptotes(exercice)}
                  labels={directionLabels(exercice)}
                  aideNiveau1={aideAsymptotesNiveau1(exercice)}
                  aideNiveau2={aideAsymptotesNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseAsymptotes(etat, reponse), formatReponseAsymptotesCourt(reponse))}
                  validation={validation}
                />
              )}

              {etat.phase === "croissance" && (
                <EtapeCroissance
                  key={cle}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aideCroissanceNiveau1(exercice)}
                  aideNiveau2={aideCroissanceNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseCroissance(etat, reponse), formatReponseTypePositionCourt(reponse))}
                  validation={validation}
                />
              )}

              {etat.phase === "concavite" && (
                <EtapeConcavite
                  key={cle}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aideConcaviteNiveau1(exercice)}
                  aideNiveau2={aideConcaviteNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseConcavite(etat, reponse), formatReponseTypePositionCourt(reponse))}
                  validation={validation}
                />
              )}

              {etat.phase === "graphique" && (
                <EtapeSelectionGraphiqueEtudeFonction
                  key={cle}
                  exercice={exercice}
                  aideNiveau1={aideGraphiqueNiveau1(exercice)}
                  aideNiveau2={aideGraphiqueNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(index) => terminerEtape(soumettreReponseGraphique(etat, index), `Graphique n°${index + 1}`)}
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
