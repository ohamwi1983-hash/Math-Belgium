import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDomaineDefinition, FamilleDomaineDefinition, SlotCE } from "./core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDefinition } from "./generateurs5e/domaineDefinition";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionDomaineDefinition,
  niveauAideMaxCE,
  niveauAideMaxDomf,
  soumettreReponseCE,
  soumettreReponseDomf,
  soumettreReponseResolution,
} from "./moteur5e/sessionDomaineDefinition";
import type { ReponseResolution } from "./moteur5e/sessionDomaineDefinition";
import type { ReponseCE } from "./moteur5e/verificationDomaineDefinition";
import type { EtatSessionDomaineDefinition, PhaseDomaineDefinition } from "./moteur5e/typesDomaineDefinition";
import { EtapeCEDomaineDefinition } from "./components5e/EtapeCEDomaineDefinition";
import { EtapeResolutionDomaineDefinition } from "./components5e/EtapeResolutionDomaineDefinition";
import { EtapeDomfDomaineDefinition } from "./components5e/EtapeDomfDomaineDefinition";
import { GrilleQuotientDomfRecap } from "./components5e/GrilleQuotientDomfRecap";
import { formatCEAttendueLatex, formatDomfLatex, formatEnsembleReelLatex, formatResolutionAttendueLatex } from "./ui5e/formatDomaineDefinition";
import { Katex } from "./components/Katex";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDomaineDefinition {
  return demarrerSessionDomaineDefinition(REGLAGES_DEMO, genererExerciceDomaineDefinition);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDomaineDefinition;
  revele: boolean;
}

/** Reproduit exactement ce que `ResultatPanelDomaineDefinition` affichait pour UNE phase donnée,
 * scopé à l'exercice/phase qui vient juste de se terminer (`etat.exerciceCourant`/`etat.phase`,
 * jamais `enAttente.etatSuivant`). */
function reponseAttenduePhase(exercice: ExerciceDomaineDefinition, phase: PhaseDomaineDefinition): ReactNode {
  if (phase === "ce") return <Katex expression={formatCEAttendueLatex(exercice)} />;
  if (phase === "resolution") {
    if (exercice.famille === "fractionSousRacine") return <GrilleQuotientDomfRecap exercice={exercice} />;
    return <Katex expression={formatResolutionAttendueLatex(exercice) ?? ""} />;
  }
  return <Katex expression={formatDomfLatex(exercice.domf)} />;
}

/** Signal `revele` de la phase qui vient JUSTE de se terminer (`phaseFinie` = `etat.phase` AVANT
 * la transition) — "ce"/"resolution" l'exposent directement sur `nouvelEtat` ; "domf" clôture
 * toujours l'exercice (`cloturerExerciceOuSuivant`), donc seul le dernier `resultats[...]` le
 * porte encore. */
function releveRevelePhase(nouvelEtat: EtatSessionDomaineDefinition, phaseFinie: PhaseDomaineDefinition): boolean {
  if (phaseFinie === "ce") return nouvelEtat.ceRevele;
  if (phaseFinie === "resolution") return nouvelEtat.resolutionRevele;
  return nouvelEtat.resultats[nouvelEtat.resultats.length - 1].domfRevele;
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases du
 * générateur (`phaseApresCE`, `moteur5e/typesDomaineDefinition.ts`, et les affectations `phase:` de
 * `moteur5e/sessionDomaineDefinition.ts`) : "ce" toujours en premier, puis "resolution" (sautée pour
 * la plupart des familles/instances — reste alors "a-venir" indéfiniment pour cet exercice, aucun
 * score n'étant jamais posé), puis "domf" (dernière phase, clôture toujours l'exercice — pas de
 * champ `scoreDomfExercice` dédié au niveau session, donc toujours "courante" ou "a-venir", jamais
 * "revele"/"correcte" avant la fin). */
const ORDRE_PHASES: PhaseDomaineDefinition[] = ["ce", "resolution", "domf"];

/** Même lecture que `releveRevelePhase` ci-dessus pour `scoreXxxExercice`/`xxxRevele` — jamais une
 * valeur recalculée séparément. "aide" (3e état, jaune) dès que l'aide a été utilisée
 * (`niveauAideXxx > 0`) sur une étape close correcte — "domf" n'a pas de champ `scoreDomfExercice`
 * dédié au niveau session (voir commentaire au-dessus de `ORDRE_PHASES`), donc jamais "aide" ici
 * (toujours "courante"/"a-venir" avant la fin, comme déjà noté). */
function calculerSegmentsProgression(etat: EtatSessionDomaineDefinition): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = phase === "ce" ? etat.scoreCEExercice : phase === "resolution" ? etat.scoreResolutionExercice : null;
    if (score === null) return "a-venir";
    const revele = phase === "ce" ? etat.ceRevele : etat.resolutionRevele;
    if (revele) return "revele";
    const aideUtilisee = phase === "ce" ? etat.niveauAideCE > 0 : etat.niveauAideResolution > 0;
    return aideUtilisee ? "aide" : "correcte";
  });
}

/** Titre affiché sur la fiche de consultation en lecture seule (`FicheReponseEcran`) — "domf"
 * n'apparaît jamais ici en pratique (dernière phase, jamais poussée dans l'historique, voir
 * `terminerEtape` ci-dessous), mais le type doit couvrir les 4 valeurs de `PhaseDomaineDefinition`. */
const TITRE_PHASE: Record<PhaseDomaineDefinition, string> = {
  ce: "Conditions d'existence",
  resolution: "Résolution",
  domf: "Domaine de définition",
  termine: "",
};

function slotsDeLExercice(exercice: ExerciceDomaineDefinition): SlotCE[] {
  return exercice.famille === "pasDeCE" ? [] : exercice.slots;
}

/** Formate la réponse de l'élève à l'écran "ce", même style que `formatSlotConditionLatex`
 * (ui5e/formatDomaineDefinition.ts) mais en texte brut (pas de KaTeX nécessaire, un symbole suffit). */
function formatReponseCE(exercice: ExerciceDomaineDefinition, reponse: ReponseCE): string {
  if (reponse.aucuneCE) return "Aucune CE";
  const slots = slotsDeLExercice(exercice);
  return reponse.lignes.map((l) => `${slots.find((s) => s.id === l.slotId)?.texte ?? l.slotId} ${l.symbole} 0`).join(" ; ");
}

/** Formate la réponse de l'élève à l'écran "resolution" — n'est en pratique jamais appelée que
 * pour "fractionSousRacine"/"racineSurFraction" (seules familles à garder cet écran, voir
 * `phaseApresCE`) ; les 2 autres branches ("ensemble" simple) sont un repli défensif jamais
 * atteint pour ce générateur dans sa configuration actuelle. */
function formatReponseResolution(reponse: ReponseResolution): ReactNode {
  if (reponse.famille === "fractionSousRacine") {
    return `N : ${reponse.grille.ligneNumerateur.join(" ")} ; D : ${reponse.grille.ligneDenominateur.join(" ")} ; Q : ${reponse.grille.ligneQuotient.join(" ")}`;
  }
  if (reponse.famille === "racineSurFraction") {
    return <Katex expression={`x\\in ${formatEnsembleReelLatex(reponse.radicande)} \\text{ et } x\\in ${formatEnsembleReelLatex(reponse.denominateur)}`} />;
  }
  return <Katex expression={`x\\in ${formatEnsembleReelLatex(reponse.ensemble)}`} />;
}

export function App5gen1() {
  const [etat, setEtat] = useState<EtatSessionDomaineDefinition>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  // Compteur de génération — le panneau dev "forcer une variante" peut remplacer `exerciceCourant`
  // sans jamais changer `phase` (toujours "ce" avant ET après, les 6 familles démarrant toutes sur
  // cet écran) : sans clé dédiée, React réutilise l'instance déjà montée d'`EtapeCEDomaineDefinition`
  // au lieu de la remonter, laissant son état interne (`lignes`, notamment `slotId`) figé sur
  // l'exercice PRÉCÉDENT — même classe de bug que gen53 (4e)/5gen6/5gen7 ("composant d'écran partagé
  // non remonté entre phases"), ici entre deux exercices plutôt qu'entre deux écrans.
  const [generationExercice, setGenerationExercice] = useState(0);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionDomaineDefinition`, jamais dans le moteur : la saisie de
   * l'élève n'a aucune autre utilité une fois l'étape close. Remis à vide à chaque nouvel exercice,
   * comme `enAttente`/`generationExercice`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (voir le commentaire
   * équivalent d'`AppAnalyseFonction.tsx`, même garde). Jamais appelée pour "domf" (dernière phase,
   * jamais visible comme puce close avant la fin de l'exercice — voir `calculerSegmentsProgression`
   * — donc jamais passée à l'historique par son `onValider` ci-dessous). */
  function terminerEtape(nouvelEtat: EtatSessionDomaineDefinition, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = releveRevelePhase(nouvelEtat, etat.phase);
      if (votreReponse !== undefined) {
        setHistorique((h) => [
          ...h,
          {
            titre: TITRE_PHASE[etat.phase],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? reponseAttenduePhase(etat.exerciceCourant, etat.phase) : undefined,
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

  const exercice: ExerciceDomaineDefinition = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Domaine de définition</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setEnAttente(null);
          setHistorique([]);
          setGenerationExercice((g) => g + 1);
          setEtat(demarrerSessionDomaineDefinition(REGLAGES_DEMO, () => construireAvecFamilleId(id as FamilleDomaineDefinition)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {etat.phase === "ce" && (
            <EtapeCEDomaineDefinition
              key={generationExercice}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCE}
              niveauAideMax={niveauAideMaxCE(exercice)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              donnees={
                <div className="equation-box">
                  <Katex expression={exercice.fLatex} block />
                </div>
              }
              onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, reponse), formatReponseCE(exercice, reponse))}
              validation={validation}
            />
          )}
          {etat.phase === "resolution" && (
            <EtapeResolutionDomaineDefinition
              key={generationExercice}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              donnees={
                <div className="equation-box">
                  <Katex expression={exercice.fLatex} block />
                </div>
              }
              onValider={(reponse) => terminerEtape(soumettreReponseResolution(etat, reponse), formatReponseResolution(reponse))}
              validation={validation}
            />
          )}
          {etat.phase === "domf" && (
            <EtapeDomfDomaineDefinition
              key={generationExercice}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDomf}
              niveauAideMax={niveauAideMaxDomf(exercice)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              donnees={
                <div className="equation-box">
                  <Katex expression={exercice.fLatex} block />
                </div>
              }
              onValider={(reponse) => terminerEtape(soumettreReponseDomf(etat, reponse))}
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
