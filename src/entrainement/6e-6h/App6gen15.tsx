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
  soumettreReponseEResoudre,
  soumettreReponseFCE,
  soumettreReponseFConclure,
  soumettreReponseFSimplifier,
  tentativesMaxPhase,
} from "./moteur6e/sessionInequationsLogarithmiques";
import { diagnostiquerCCombiner, diagnostiquerDReecrire, diagnostiquerFConclureParCas, diagnostiquerFSimplifier } from "./moteur6e/verificationInequationsLogarithmiques";
import { phaseApres, phaseInitiale } from "./moteur6e/typesInequationsLogarithmiques";
import type { EtatSessionInequationLogarithmique, PhaseInequationLogarithmique } from "./moteur6e/typesInequationsLogarithmiques";
import { EtapeChampSimpleIneqLog } from "./components6e/EtapeChampSimpleIneqLog";
import { EtapeChoixDeuxIneqLog } from "./components6e/EtapeChoixDeuxIneqLog";
import { EtapeDeuxCasIneqLog } from "./components6e/EtapeDeuxCasIneqLog";
import { EtapeIntervalleIneqLog } from "./components6e/EtapeIntervalleIneqLog";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { LIBELLE_PHASE_LOG, OPTION_E_POSSIBLE, OPTION_E_VIDE, aideNiveau1, aideNiveau2, consigneEcran, contenuRecapPhase, formatEnonceLatex } from "./ui6e/formatInequationsLogarithmiques";
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
    phase = phaseApres(phase, exercice);
  }
  return phases;
}

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

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

/** Exemples de saisie — choisis HORS de l'espace des tirages (audit 6e ch. 3, point 8) : jamais une
 * réponse possible d'un exercice. `cCombiner` : n1∈[−4;4] et |n|≤6 dans les familles, donc 7/−9
 * n'apparaissent jamais ; `dReecrire` : racines 5 et −1/2 hors de [−3;3] ; `fSimplifier` : r≤10. */
const PLACEHOLDERS = {
  cCombiner: "ex : (x+7)*(2x-9)  ou  (x+7)/(2x-9)",
  dReecrire: "ex : 2y^2-9y-5<0",
  fSimplifier: "ex : (x+12)^2",
};

export function App6gen15() {
  const [etat, setEtat] = useState<EtatSessionInequationLogarithmique>(nouvelleSession);
  /** Compteur d'exercices — entre dans la `key` de chaque écran pour que « Nouvel exercice » ou
   * « Générer » remonte toujours un écran vierge, même quand la phase ne change pas (audit 6e ch. 3,
   * point 3 : un choix de la famille E survivait d'un exercice E au suivant). */
  const [numeroExercice, setNumeroExercice] = useState(0);
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
      setNumeroExercice((n) => n + 1);
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
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionInequationLogarithmique(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const enonceLatex = formatEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxPhase(etat);
  const cle = `${numeroExercice}-${phase}`;
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
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifInequationsLogarithmiques(etat)} />
        {phase === "aCE" && (
              <EtapeIntervalleIneqLog
                key={cle}
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
                key={cle}
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
                key={cle}
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
                key={cle}
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
                key={cle}
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
                key={cle}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                placeholder={PLACEHOLDERS.cCombiner}
                diagnostiquer={(texte) => (exercice.famille === "C" ? diagnostiquerCCombiner(exercice, texte) : "parse_error")}
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
                key={cle}
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
                key={cle}
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
                key={cle}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                placeholder={PLACEHOLDERS.dReecrire}
                diagnostiquer={(texte) => (exercice.famille === "D" ? diagnostiquerDReecrire(exercice, texte) : "parse_error")}
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
                key={cle}
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
                key={cle}
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
                key={cle}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                optionGauche={{ id: "vide", label: OPTION_E_VIDE }}
                optionDroite={{ id: "possible", label: OPTION_E_POSSIBLE }}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(id) => terminerEtape(soumettreReponseEReconnaitre(etat, id === "vide"), id === "vide" ? OPTION_E_VIDE : OPTION_E_POSSIBLE)}
                validation={validation}
              />
            )}
            {phase === "eResoudre" && (
              <EtapeIntervalleIneqLog
                key={cle}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseEResoudre(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                validation={validation}
              />
            )}

            {phase === "fCE" && (
              <EtapeIntervalleIneqLog
                key={cle}
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
                key={cle}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                placeholder={PLACEHOLDERS.fSimplifier}
                diagnostiquer={(texte) => (exercice.famille === "F" ? diagnostiquerFSimplifier(exercice, texte) : "parse_error")}
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
                key={cle}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                evaluerCas={(reponse) => (exercice.famille === "F" ? diagnostiquerFConclureParCas(exercice, reponse) : { superieur: false, inferieur: false })}
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
