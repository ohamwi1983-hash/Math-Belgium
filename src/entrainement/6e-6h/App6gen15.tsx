import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInequationLogarithmique } from "./generateurs6e/inequationsLogarithmiques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionInequationLogarithmique,
  soumettreReponseACE,
  soumettreReponseAResoudre,
  soumettreReponseBCE,
  soumettreReponseBResoudre,
  soumettreReponseCCE,
  soumettreReponseCCombiner,
  soumettreReponseCComparer,
  soumettreReponseDCE,
  soumettreReponseDConvertirX,
  soumettreReponseDReecrire,
  soumettreReponseDResoudreY,
  soumettreReponseEReconnaitre,
  soumettreReponseFCE,
  soumettreReponseFConclure,
  soumettreReponseFSimplifier,
} from "./moteur6e/sessionInequationsLogarithmiques";
import { phaseApres, phaseInitiale } from "./moteur6e/typesInequationsLogarithmiques";
import type { EtatSessionInequationLogarithmique, PhaseInequationLogarithmique } from "./moteur6e/typesInequationsLogarithmiques";
import { EtapeChampSimpleIneqLog } from "./components6e/EtapeChampSimpleIneqLog";
import { EtapeChoixDeuxIneqLog } from "./components6e/EtapeChoixDeuxIneqLog";
import { EtapeDeuxCasIneqLog } from "./components6e/EtapeDeuxCasIneqLog";
import { EtapeIntervalleIneqLog } from "./components6e/EtapeIntervalleIneqLog";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { LIBELLE_PHASE_LOG, aideNiveau1, aideNiveau2, consigneEcran, contenuRecapPhase, formatEnonceLatex } from "./ui6e/formatInequationsLogarithmiques";
import { formatEnsembleReelLatex } from "./ui6e/formatEnsembleReel";
import { calculerRecapitulatifInequationsLogarithmiques, calculerSegmentsProgressionInequationsLogarithmiques } from "./ui6e/recapitulatifInequationsLogarithmiques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/** Séquence RÉELLEMENT traversée par la famille de l'exercice courant — même reconstruction que
 * `sequencePourExercice` (`ui6e/recapitulatifInequationsLogarithmiques.ts`, non exporté), répliquée
 * ICI à partir de `phaseInitiale`/`phaseApres` pour aligner l'index des segments de
 * `ProgressionPuces` sur celui de `historique`/`aideUtiliseeParPhase`. */
function sequencePourExercice(exercice: Parameters<typeof phaseInitiale>[0]): PhaseInequationLogarithmique[] {
  const phases: PhaseInequationLogarithmique[] = [];
  let phase: PhaseInequationLogarithmique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionInequationLogarithmique {
  return demarrerSessionInequationLogarithmique(REGLAGES_DEMO, genererExerciceInequationLogarithmique);
}

/** Format court "votre réponse" pour l'écran "fConclure" (`ReponseCasBaseLog`, `core6e/inequationsLogarithmiques.types.ts`). */
function formatCasBaseLog(r: { estVide: boolean; ensemble: import("./core6e/ensembleReel.types").EnsembleReelGuide | null }): ReactNode {
  return r.estVide ? "∅" : r.ensemble ? <Katex expression={formatEnsembleReelLatex(r.ensemble)} /> : "";
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionInequationLogarithmique;
  revele: boolean;
}

export function App6gen15() {
  const [etat, setEtat] = useState<EtatSessionInequationLogarithmique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionInequationLogarithmique`, jamais dans le moteur. Remis à vide
   * à chaque nouvel exercice (mêmes endroits que `enAttente`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Aide utilisée PAR PHASE DÉJÀ CLOSE — le moteur ne garde aucune trace persistante de l'aide une
   * fois la phase refermée (`niveauAide` est remis à 0 à chaque transition), capturé ICI au moment
   * exact de la clôture réelle (même garde que `terminerEtape`). Remis à vide comme `historique`. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseInequationLogarithmique, boolean>>>({});

  function terminerEtape(nouvelEtat: EtatSessionInequationLogarithmique, votreReponse?: ReactNode) {
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
            titre: LIBELLE_PHASE_LOG[etat.phase],
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
    setEtat(demarrerSessionInequationLogarithmique(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const enonceLatex = formatEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  const contenuRecap = contenuRecapPhase(exercice, phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: contenuRecap.latex !== null ? <Katex expression={contenuRecap.latex} /> : contenuRecap.texte,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  // "aide" (puce jaune) : post-traite les segments déjà calculés par `calculerSegmentsProgressionInequationsLogarithmiques`
  // avec `aideUtiliseeParPhase` capturé localement ci-dessus.
  const sequence = sequencePourExercice(exercice);
  const segments: EtatPuceProgression[] = calculerSegmentsProgressionInequationsLogarithmiques(etat).map((segment, index) =>
    segment === "correcte" && aideUtiliseeParPhase[sequence[index]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Résoudre une inéquation logarithmique</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifInequationsLogarithmiques(etat)} />
        {phase === "aCE" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseACE(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}
            {phase === "aResoudre" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseAResoudre(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}

            {phase === "bCE" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseBCE(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}
            {phase === "bResoudre" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseBResoudre(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}

            {phase === "cCE" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseCCE(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}
            {phase === "cCombiner" && (
              <EtapeChampSimpleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                placeholder="ex : (x+1)*(x-3)  ou  (x+1)/(x-3)"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(texte) => terminerEtape(soumettreReponseCCombiner(etat, texte), texte)}
                validation={validation}
              />
            )}
            {phase === "cComparer" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseCComparer(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}

            {phase === "dCE" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseDCE(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}
            {phase === "dReecrire" && (
              <EtapeChampSimpleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                placeholder="ex : y^2-y-2<0"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(texte) => terminerEtape(soumettreReponseDReecrire(etat, texte), texte)}
                validation={validation}
              />
            )}
            {phase === "dResoudreY" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseDResoudreY(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}
            {phase === "dConvertirX" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseDConvertirX(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}

            {phase === "eReconnaitre" && (
              <EtapeChoixDeuxIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                optionGauche={{ id: "vide", label: "∅ — CE incompatible, aucune solution" }}
                optionDroite={{ id: "possible", label: "La CE est satisfiable" }}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(id) => terminerEtape(soumettreReponseEReconnaitre(etat, id === "vide"), id === "vide" ? "∅ — CE incompatible, aucune solution" : "La CE est satisfiable")}
                validation={validation}
              />
            )}

            {phase === "fCE" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseFCE(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}
            {phase === "fSimplifier" && (
              <EtapeChampSimpleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                placeholder="ex : (x-3)^2"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(texte) => terminerEtape(soumettreReponseFSimplifier(etat, texte), texte)}
                validation={validation}
              />
            )}
            {phase === "fConclure" && (
              <EtapeDeuxCasIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) =>
                  terminerEtape(
                    soumettreReponseFConclure(etat, reponse),
                    <>
                      Cas &gt;1 : {formatCasBaseLog(reponse.casSuperieur)} ; Cas &lt;1 : {formatCasBaseLog(reponse.casInferieur)}
                    </>,
                  )
                }
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
