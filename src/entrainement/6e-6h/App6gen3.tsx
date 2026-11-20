import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationsCyclometriques } from "./generateurs6e/equationsCyclometriques";
import type { IdVarianteDev } from "./generateurs6e/equationsCyclometriques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionEquationsCyclometriques,
  soumettreReponseAcceptRejet,
  soumettreReponseCE,
  soumettreReponseCondition,
  soumettreReponseEquation,
  soumettreReponseSolutions,
  tentativesMaxCourant,
} from "./moteur6e/sessionEquationsCyclometriques";
import { PHASE_INITIALE, phaseApres } from "./moteur6e/typesEquationsCyclometriques";
import type { EtatSessionEquationsCyclometriques, PhaseEquationsCyclometriques } from "./moteur6e/typesEquationsCyclometriques";
import type { ExerciceEquationsCyclometriques } from "./core6e/equationsCyclometriques.types";
import { EtapeAccepterRejeterEquationsCyclometriques } from "./components6e/EtapeAccepterRejeterEquationsCyclometriques";
import { EtapeEnsembleCyclo } from "./components6e/EtapeEnsembleCyclo";
import { diagnostiquerEnsembleReelGuide } from "./moteur6e/verificationEnsembleReel";
import { EtapeChampEquationCyclo } from "./components6e/EtapeChampEquationCyclo";
import { EtapeListeSolutionsCyclo } from "./components6e/EtapeListeSolutionsCyclo";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { formatEnsembleReelLatex } from "./ui6e/formatEnsembleReel";
import {
  MAX_DEN,
  formatCandidatLatex,
  formatEquationNonCycloLatex,
  formatEquationOriginaleLatex,
  CONSIGNE_GENERALE,
} from "./ui6e/formatEquationsCyclometriques";
import {
  aideCE1,
  aideCE2,
  aideCondition1,
  aideCondition2,
  aideEquation1,
  aideEquation2,
  aideSolutions1,
  aideSolutions2,
  cibleCE,
  cibleCondition,
  cibleEquation,
  cibleSolutions,
} from "./ui6e/aidesEquationsCyclometriques";
import { calculerRecapitulatifEquationsCyclometriques, calculerSegmentsProgressionEquationsCyclometriques } from "./ui6e/recapitulatifEquationsCyclometriques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CONSIGNES_ECRANS, correctionDetailleeEquationsCyclometriques } from "./generateurs6e/equationsCyclometriques/corrigeDetaille";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionEquationsCyclometriques {
  return demarrerSessionEquationsCyclometriques(REGLAGES_DEMO, genererExerciceEquationsCyclometriques);
}

/** Première session : `?code=XXXXXX` (QR code d'une feuille) rouvre l'exercice imprimé — mêmes
 * fonctions de tirage que l'adaptateur d'export, comme `App6gen14.tsx`. */
function sessionInitiale(): EtatSessionEquationsCyclometriques {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionEquationsCyclometriques(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceEquationsCyclometriques, (id) => construireAvecVarianteId(id as IdVarianteDev)));
}

/** Même libellé que `LIBELLE_PHASE` (`ui6e/recapitulatifEquationsCyclometriques.ts`, privé à ce
 * module) — dupliqué ici car cette tâche ne touche qu'à `AppXxx.tsx` (voir consigne). */
const LIBELLE_PHASE_PUCE: Record<PhaseEquationsCyclometriques, string> = {
  ce: "Condition d'existence (CE)",
  condition: "Condition de compatibilité",
  equation: "Équation non cyclométrique",
  solutions: "Solutions (avant la CE)",
  acceptRejet: "Accepter / rejeter",
};

/** Même boucle que `sequenceReelle` (`ui6e/recapitulatifEquationsCyclometriques.ts`, privée à ce
 * module) — dupliquée ici pour associer chaque segment de `calculerSegmentsProgressionEquationsCyclometriques`
 * à sa phase (nécessaire pour la puce "aide", calculée localement — voir `aideParPhase` ci-dessous). */
function sequenceReellePhases(exercice: ExerciceEquationsCyclometriques): PhaseEquationsCyclometriques[] {
  const sequence: PhaseEquationsCyclometriques[] = [];
  let phase: PhaseEquationsCyclometriques | "termine" = PHASE_INITIALE;
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase, exercice);
  }
  return sequence;
}

function ListeSolutions({ solutions }: { solutions: number[] }) {
  if (solutions.length === 0) return <>Aucune solution</>;
  return (
    <>
      {solutions.map((s, i) => (
        <span key={i}>
          {i > 0 && ", "}
          <Katex expression={formatCandidatLatex(s)} />
        </span>
      ))}
    </>
  );
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationsCyclometriques;
  revele: boolean;
}

export function App6gen3() {
  const [etat, setEtat] = useState<EtatSessionEquationsCyclometriques>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionEquationsCyclometriques`, jamais dans le moteur : la saisie de
   * l'élève n'a aucune autre utilité une fois l'étape close. Remis à vide à chaque nouvel exercice,
   * comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Puce "aide" (jaune) : contrairement à la référence 4e, ce moteur ne garde PAS un champ
   * `aideXxxUtilisee` par phase — `derniereCloture` ne porte l'info que pour l'écran qui VIENT de se
   * fermer. On la persiste donc nous-mêmes ici, phase par phase, au même point que `historique`. */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseEquationsCyclometriques, boolean>>>({});

  /** `nouvelEtat.derniereCloture` porte l'aide/révélation de l'écran qui vient PRÉCISÉMENT de se
   * fermer, capturée côté moteur (jamais reconstruite depuis un `etat` React déjà obsolète — voir
   * `typesEquationsCyclometriques.ts`). `votreReponse` n'est poussé dans l'historique QUE dans cette
   * branche de transition RÉELLE (jamais à chaque tentative ratée tant que l'écran reste ouvert). */
  function terminerEtape(nouvelEtat: EtatSessionEquationsCyclometriques, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const phaseFermee = etat.phase;
      const revele = nouvelEtat.derniereCloture!.info.revele;
      setAideParPhase((prev) => ({ ...prev, [phaseFermee]: nouvelEtat.derniereCloture!.info.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE_PUCE[phaseFermee],
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
      setAideParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setEtat(demarrerSessionEquationsCyclometriques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteDev)));
  }

  const exercice = etat.exerciceCourant;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen43.tsx` et la plupart des générateurs 6e récents.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen3?: unknown }).__debug6gen3 = { exercice, phase: etat.phase };
  }

  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxCourant(etat);
  const donnees = (
    <div className="equation-box">
      <Katex expression={formatEquationOriginaleLatex(exercice)} />
    </div>
  );
  const niveauAide = etat.niveauAide;

  const reponseAttenduePhase = () => {
    switch (etat.phase) {
      case "ce":
        return <Katex expression={formatEnsembleReelLatex(exercice.ce, MAX_DEN)} />;
      case "condition":
        return exercice.variante === "arcfonctionsDifferentes" ? (
          <Katex expression={formatEnsembleReelLatex(exercice.conditionParasite, MAX_DEN)} />
        ) : null;
      case "equation":
        return <Katex expression={formatEquationNonCycloLatex(exercice)} />;
      case "solutions":
        return <ListeSolutions solutions={exercice.candidats.map((c) => c.x)} />;
      case "acceptRejet":
        return <ListeSolutions solutions={exercice.candidats.filter((c) => c.accepteAttendu).map((c) => c.x)} />;
    }
  };

  // Corrigé détaillé « comme au tableau » de l'écran (source unique avec le papier).
  const corrigeDetaille = (
    <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeEquationsCyclometriques(exercice), lettreEtape(sequenceReellePhases(exercice).indexOf(etat.phase)))} />
  );

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        corrigeDetaille,
        reponseAttendue: reponseAttenduePhase(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  /** Surcharge locale de `calculerSegmentsProgressionEquationsCyclometriques` : "correcte" devient
   * "aide" quand `aideParPhase` (ci-dessus) montre que l'écran a été fermé avec de l'aide active. */
  const segmentsBase = calculerSegmentsProgressionEquationsCyclometriques(etat);
  const segments: EtatPuceProgression[] = sequenceReellePhases(exercice).map((phase, i) =>
    segmentsBase[i] === "correcte" && aideParPhase[phase] ? "aide" : segmentsBase[i],
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Équations avec fonctions cyclométriques</h1>
        <p className="app-subtitle">Chapitre 1 — Fonctions réciproques & cyclométriques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifEquationsCyclometriques(etat)} />
        <div className="card-body">
          {etat.phase === "ce" && (
            <EtapeEnsembleCyclo
              key={etat.phase}
              consigneGenerale={CONSIGNE_GENERALE}
              blocDonnees={donnees}
              consigneEcran={[{ type: "texte", valeur: CONSIGNES_ECRANS.ce }]}
              label="x\in"
              diagnostiquer={(r) => diagnostiquerEnsembleReelGuide(r, exercice.ce)}
              cible={(r) => cibleCE(exercice, r)}
              aide1={aideCE1(exercice)}
              aide2={aideCE2(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse, MAX_DEN)} />)}
              validation={validation}
            />
          )}

          {etat.phase === "condition" && exercice.variante === "arcfonctionsDifferentes" && (
            <EtapeEnsembleCyclo
              key={etat.phase}
              consigneGenerale={CONSIGNE_GENERALE}
              blocDonnees={donnees}
              consigneEcran={[{ type: "texte", valeur: CONSIGNES_ECRANS.condition }]}
              label="x\in"
              diagnostiquer={(r) => diagnostiquerEnsembleReelGuide(r, exercice.conditionParasite)}
              cible={(r) => cibleCondition(exercice, r)}
              aide1={aideCondition1(exercice)}
              aide2={aideCondition2(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCondition(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse, MAX_DEN)} />)}
              validation={validation}
            />
          )}

          {etat.phase === "equation" && (
            <EtapeChampEquationCyclo
              key={etat.phase}
              consigneEcran={CONSIGNES_ECRANS.equation}
              equationLatex={formatEquationOriginaleLatex(exercice)}
              aideNiveau1={aideEquation1(exercice)}
              aideNiveau2={aideEquation2(exercice)}
              cible={(t) => cibleEquation(exercice, t)}
              placeholder="membre en x = membre en x"
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseEquation(etat, texte), texte)}
              validation={validation}
            />
          )}

          {etat.phase === "solutions" && (
            <EtapeListeSolutionsCyclo
              key={etat.phase}
              consigneEcran={CONSIGNES_ECRANS.solutions}
              equationLatex={formatEquationOriginaleLatex(exercice)}
              aideNiveau1={aideSolutions1(exercice)}
              aideNiveau2={aideSolutions2(exercice)}
              cible={(t) => cibleSolutions(exercice, t)}
              placeholder="une valeur"
              labelAjout="+ Ajouter une solution"
              labelAucune="Pas de solution"
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) =>
                terminerEtape(soumettreReponseSolutions(etat, textes), textes.length === 0 ? "Pas de solution" : textes.join(", "))
              }
              validation={validation}
            />
          )}

          {etat.phase === "acceptRejet" && (
            <EtapeAccepterRejeterEquationsCyclometriques
              key={etat.phase}
              exercice={exercice}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(decisions) =>
                terminerEtape(
                  soumettreReponseAcceptRejet(etat, decisions),
                  <>
                    {exercice.candidats.map((cand, i) => (
                      <span key={i}>
                        {i > 0 && " ; "}
                        <Katex expression={formatCandidatLatex(cand.x)} /> ({decisions[i] ? "accepté" : "rejeté"})
                      </span>
                    ))}
                  </>,
                )
              }
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
