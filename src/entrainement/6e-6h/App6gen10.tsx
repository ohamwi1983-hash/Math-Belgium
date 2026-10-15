import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInequationExponentielle } from "./generateurs6e/inequationsExponentielles";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionInequationExponentielle,
  soumettreReponseAReconnaitre,
  soumettreReponseAResoudre,
  soumettreReponseBReconnaitre,
  soumettreReponseCfReconnaitre,
  soumettreReponseCkConclure,
  soumettreReponseCkRegrouper,
  soumettreReponseDConstantResoudre,
  soumettreReponseDConstantSigne,
  soumettreReponseDVariableSigne1,
  soumettreReponseDVariableSigne2,
  soumettreReponseDVariableTableau,
  soumettreReponseERegrouper,
  soumettreReponseEResoudre,
} from "./moteur6e/sessionInequationsExponentielles";
import { phaseApres, phaseInitiale } from "./moteur6e/typesInequationsExponentielles";
import type { EtatSessionInequationExponentielle, PhaseInequationExponentielle } from "./moteur6e/typesInequationsExponentielles";
import { EtapeChampSimpleIneqExpo } from "./components6e/EtapeChampSimpleIneqExpo";
import { EtapeChoixDeuxIneqExpo } from "./components6e/EtapeChoixDeuxIneqExpo";
import { EtapeIntervalleIneqExpo } from "./components6e/EtapeIntervalleIneqExpo";
import { EtapeSigneUnZeroIneqExpo } from "./components6e/EtapeSigneUnZeroIneqExpo";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { LIBELLE_PHASE_INEQ, aideNiveau1, aideNiveau2, consigneEcran, contenuRecapPhase, formatEnonceLatex } from "./ui6e/formatInequationsExponentielles";
import { formatEnsembleReelLatex } from "./ui6e/formatEnsembleReel";
import { calculerRecapitulatifInequationsExponentielles, calculerSegmentsProgressionInequationsExponentielles } from "./ui6e/recapitulatifInequationsExponentielles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/** Séquence RÉELLEMENT traversée par la famille de l'exercice courant — même reconstruction que
 * `sequencePourExercice` (`ui6e/recapitulatifInequationsExponentielles.ts`, non exporté), répliquée
 * ICI à partir de `phaseInitiale`/`phaseApres` (déjà exportés par `typesInequationsExponentielles.ts`)
 * pour aligner l'index des segments de `ProgressionPuces` sur celui de `historique`/`aideUtiliseeParPhase`. */
function sequencePourExercice(exercice: Parameters<typeof phaseInitiale>[0]): PhaseInequationExponentielle[] {
  const phases: PhaseInequationExponentielle[] = [];
  let phase: PhaseInequationExponentielle | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionInequationExponentielle {
  return demarrerSessionInequationExponentielle(REGLAGES_DEMO, genererExerciceInequationExponentielle);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionInequationExponentielle;
  revele: boolean;
}

export function App6gen10() {
  const [etat, setEtat] = useState<EtatSessionInequationExponentielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionInequationExponentielle`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice (mêmes endroits que `enAttente`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Aide utilisée PAR PHASE DÉJÀ CLOSE — le moteur ne garde aucune trace persistante de l'aide une
   * fois la phase refermée (`niveauAide` est remis à 0 à chaque transition), capturé ICI au moment
   * exact de la clôture réelle (même garde que `terminerEtape`). Remis à vide comme `historique`. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseInequationExponentielle, boolean>>>({});

  function terminerEtape(nouvelEtat: EtatSessionInequationExponentielle, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereRevelee;
      // `votreReponse`/`niveauAide` : UNIQUEMENT capturés dans la branche de transition RÉELLE —
      // jamais à chaque clic sur "Valider" (voir le garde ci-dessus).
      if (votreReponse !== undefined) {
        const contenu = contenuRecapPhase(exercice, etat.phase);
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE_INEQ[etat.phase],
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
      demarrerSessionInequationExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
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

  // Hook de debug dev-only (même patron que `App6gen23.tsx` et les autres générateurs 6e) — expose
  // l'exercice/la phase pour une vérification Playwright réelle sans re-parser le LaTeX affiché.
  // Jamais consommé par le code applicatif, seulement par un script de test externe.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen10?: unknown }).__debug6gen10 = { exercice, phase };
  }

  const contenuRecap = contenuRecapPhase(exercice, phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: contenuRecap.latex !== null ? <Katex expression={contenuRecap.latex} /> : contenuRecap.texte,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  // "aide" (puce jaune) : post-traite les segments déjà calculés par `calculerSegmentsProgressionInequationsExponentielles`
  // (qui ne connaît que `etat`, pas l'aide déjà utilisée sur une phase désormais close) avec
  // `aideUtiliseeParPhase` capturé localement ci-dessus.
  const sequence = sequencePourExercice(exercice);
  const segments: EtatPuceProgression[] = calculerSegmentsProgressionInequationsExponentielles(etat).map((segment, index) =>
    segment === "correcte" && aideUtiliseeParPhase[sequence[index]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Résoudre une inéquation exponentielle</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifInequationsExponentielles(etat)} />
        <div className="card-body">
          {phase === "aReconnaitre" && (
                <EtapeChampSimpleIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 3, -2, 1/2..."
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(texte) => terminerEtape(soumettreReponseAReconnaitre(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "aResoudre" && (
                <EtapeIntervalleIneqExpo
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

              {phase === "bReconnaitre" && (
                <EtapeChoixDeuxIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  optionGauche={{ id: "existe", label: "Il existe une solution" }}
                  optionDroite={{ id: "vide", label: "∅ — Aucune solution" }}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(id) => terminerEtape(soumettreReponseBReconnaitre(etat, id === "vide"), id === "vide" ? "∅ — Aucune solution" : "Il existe une solution")}
                  validation={validation}
                />
              )}

              {phase === "cfReconnaitre" && (
                <EtapeChoixDeuxIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  optionGauche={{ id: "reel", label: "Vraie pour tout x réel (ℝ)" }}
                  optionDroite={{ id: "pasToujours", label: "Ce n'est pas toujours vrai" }}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(id) => terminerEtape(soumettreReponseCfReconnaitre(etat, id === "reel"), id === "reel" ? "Vraie pour tout x réel (ℝ)" : "Ce n'est pas toujours vrai")}
                  validation={validation}
                />
              )}

              {phase === "ckRegrouper" && (
                <EtapeChampSimpleIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : (2/9)^(x^2+5)<=1"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(texte) => terminerEtape(soumettreReponseCkRegrouper(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "ckConclure" && (
                <EtapeChoixDeuxIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  optionGauche={{ id: "reel", label: "Vraie pour tout x réel (ℝ)" }}
                  optionDroite={{ id: "pasToujours", label: "Ce n'est pas toujours vrai" }}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(id) => terminerEtape(soumettreReponseCkConclure(etat, id === "reel"), id === "reel" ? "Vraie pour tout x réel (ℝ)" : "Ce n'est pas toujours vrai")}
                  validation={validation}
                />
              )}

              {phase === "dConstantSigne" && (
                <EtapeChoixDeuxIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  optionGauche={{ id: "positif", label: "Toujours positif" }}
                  optionDroite={{ id: "negatif", label: "Toujours négatif" }}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(id) => terminerEtape(soumettreReponseDConstantSigne(etat, id as "positif" | "negatif"), id === "positif" ? "Toujours positif" : "Toujours négatif")}
                  validation={validation}
                />
              )}
              {phase === "dConstantResoudre" && (
                <EtapeIntervalleIneqExpo
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
                  onValider={(reponse) => terminerEtape(soumettreReponseDConstantResoudre(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                  validation={validation}
                />
              )}

              {phase === "dVariableSigne1" && (
                <EtapeSigneUnZeroIneqExpo
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
                      soumettreReponseDVariableSigne1(etat, reponse),
                      `zéro = ${reponse.zeroTexte} ; ${reponse.sens === "negatif_puis_positif" ? "Négatif avant, positif après" : "Positif avant, négatif après"}`,
                    )
                  }
                  validation={validation}
                />
              )}
              {phase === "dVariableSigne2" && (
                <EtapeSigneUnZeroIneqExpo
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
                      soumettreReponseDVariableSigne2(etat, reponse),
                      `zéro = ${reponse.zeroTexte} ; ${reponse.sens === "negatif_puis_positif" ? "Négatif avant, positif après" : "Positif avant, négatif après"}`,
                    )
                  }
                  validation={validation}
                />
              )}
              {phase === "dVariableTableau" && (
                <EtapeIntervalleIneqExpo
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
                  onValider={(reponse) => terminerEtape(soumettreReponseDVariableTableau(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
                  validation={validation}
                />
              )}

              {phase === "eRegrouper" && (
                <EtapeChampSimpleIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  placeholder="ex : (2/5)^x<1"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(texte) => terminerEtape(soumettreReponseERegrouper(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "eResoudre" && (
                <EtapeIntervalleIneqExpo
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
                  onValider={(reponse) => terminerEtape(soumettreReponseEResoudre(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
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
