import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceDeriveesCyclometriques } from "./core6e/deriveesCyclometriques.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDeriveesCyclometriques } from "./generateurs6e/deriveesCyclometriques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionDeriveesCyclometriques,
  soumettreReponseADeriveeFinale,
  soumettreReponseADeriveeU,
  soumettreReponseBDeriveeArc,
  soumettreReponseBDeriveeFinale,
  soumettreReponseBDeriveeU,
  soumettreReponseCDenominateur,
  soumettreReponseCDeriveeFinale,
  soumettreReponseCNumerateur,
  soumettreReponseDBrut,
  soumettreReponseDDenominateur,
  soumettreReponseDNumerateur,
  soumettreReponseDSimplifiee,
  soumettreReponseEDeriveeFinale,
  soumettreReponseEDeriveeInterne,
  soumettreReponseFBrute,
  soumettreReponseFSimplifiee,
  soumettreReponseGDeriveeFinale,
  soumettreReponseGDeriveeInterne,
} from "./moteur6e/sessionDeriveesCyclometriques";
import type { EtatSessionDeriveesCyclometriques, PhaseDeriveesCyclometriques } from "./moteur6e/typesDeriveesCyclometriques";
import { EtapeChampDeriveeCyclo } from "./components6e/EtapeChampDeriveeCyclo";
import { aidesDerivee, cibleDerivee, diagnostiquerPhaseDerivee } from "./ui6e/aidesDeriveesCyclometriques";

/** Placeholder hors tirage (audit du 6e ch. 1, G8 : l'ancien « −2/√(1 − 4x²) » était la réponse
 * d'un écran dans 5 % des tirages) : une forme, jamais une valeur. */
const PLACEHOLDER_DERIVEE = "expression en x";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import {
  formatFonctionALatex,
  formatFonctionBLatex,
  formatFonctionCLatex,
  formatFonctionDLatex,
  formatFonctionELatex,
  formatFonctionFLatex,
  formatFonctionGLatex,
  consigneEcranDerivee,
} from "./ui6e/formatDeriveesCyclometriques";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeDeriveesCyclometriques, resultatsEcransDerivees, sequenceDeriveesCyclometriques } from "./generateurs6e/deriveesCyclometriques/corrigeDetaille";
import { calculerRecapitulatifDeriveesCyclometriques, calculerSegmentsProgressionDeriveesCyclometriques } from "./ui6e/recapitulatifDeriveesCyclometriques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/** Titre court par écran — même mapping (math-expression, ex. "u'(x)") que le helper privé
 * `libellePourPhase` de `ui6e/recapitulatifDeriveesCyclometriques.ts`, non exporté : dupliqué ICI
 * plutôt qu'exposé, cette tâche ne touchant que `App6gen4.tsx` (voir consigne). */
function titrePhase(phase: PhaseDeriveesCyclometriques, exercice: ExerciceDeriveesCyclometriques): string {
  switch (phase) {
    case "aDeriveeU":
    case "bDeriveeU":
      return "u'(x)";
    case "aDeriveeFinale":
    case "bDeriveeFinale":
    case "cDeriveeFinale":
    case "eDeriveeFinale":
    case "gDeriveeFinale":
      return "f'(x)";
    case "bDeriveeArc":
      return "[arcfonction(v(x))]'";
    case "cNumerateur":
    case "dNumerateur":
      return "N'(x)";
    case "cDenominateur":
    case "dDenominateur":
      return "D'(x)";
    case "dBrut":
    case "fBrute":
      return "f'(x) (brut)";
    case "dSimplifiee":
    case "fSimplifiee":
      return "f'(x) (simplifié)";
    case "eDeriveeInterne":
      return "w'(x)";
    case "gDeriveeInterne":
      return exercice.famille === "G" && exercice.sousCas === "h" ? "v'(x)" : "u'(x)";
  }
}

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionDeriveesCyclometriques {
  return demarrerSessionDeriveesCyclometriques(REGLAGES_DEMO, genererExerciceDeriveesCyclometriques);
}

/** Première session : `?code=XXXXXX` (QR code d'une feuille) rouvre l'exercice imprimé — mêmes
 * fonctions de tirage que l'adaptateur d'export, comme `App6gen14.tsx`. */
function sessionInitiale(): EtatSessionDeriveesCyclometriques {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionDeriveesCyclometriques(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceDeriveesCyclometriques, (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDeriveesCyclometriques;
  revele: boolean;
}

export function App6gen4() {
  const [etat, setEtat] = useState<EtatSessionDeriveesCyclometriques>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionDeriveesCyclometriques`, jamais dans le moteur (même mécanisme
   * que les autres `App6genXx.tsx` de ce chantier, voir `App6gen39.tsx`). `aideUtiliseeFermees` est
   * directement lu depuis `derniereCloture.info.niveauAide` (déjà capturé côté moteur à l'instant
   * précis de la fermeture, jamais reconstruit après coup). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [aideUtiliseeFermees, setAideUtiliseeFermees] = useState<boolean[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** `nouvelEtat.derniereCloture` porte l'aide/révélation de l'écran qui vient PRÉCISÉMENT de se
   * fermer, capturée côté moteur (jamais reconstruite depuis un `etat` React déjà obsolète — voir
   * `typesDeriveesCyclometriques.ts`). `votreReponse` : UNIQUEMENT formatée/poussée dans
   * l'historique quand l'étape se clôt RÉELLEMENT (même garde `transitionDEcran` qui déclenche déjà
   * `setEnAttente`) — jamais à chaque clic sur "Valider" (bug déjà rencontré sur la référence 4e,
   * voir `AppAnalyseFonction.tsx`). `reponseAttenduePhase()` est appelée ici alors que `etat`/
   * `exercice` (capturés par closure) désignent encore l'écran qui vient de se fermer — jamais
   * l'écran suivant. */
  function terminerEtape(nouvelEtat: EtatSessionDeriveesCyclometriques, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const info = nouvelEtat.derniereCloture!.info;
      if (votreReponse !== undefined) {
        setHistorique((h) => [
          ...h,
          {
            corrigeDetaille: corrigeDetailleEcranCourant(),
            titre: titrePhase(etat.phase, etat.exerciceCourant),
            votreReponse,
            correcte: !info.revele,
            reponseAttendue: info.revele ? reponseAttenduePhase() : undefined,
          },
        ]);
        setAideUtiliseeFermees((a) => [...a, info.niveauAide > 0]);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: info.revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeFermees([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeFermees([]);
    setEtat(demarrerSessionDeriveesCyclometriques(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;

  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aides = aidesDerivee(exercice, etat.phase);

  // Réponse attendue = « Résultat » de l'étape du corrigé détaillé (source unique avec le papier) :
  // forme substituée puis simplifiée, jamais l'aide de niveau 2 brute.
  const indexEcran = sequenceDeriveesCyclometriques(exercice).indexOf(etat.phase);
  const reponseAttenduePhase = () => <Katex expression={resultatsEcransDerivees(exercice)[indexEcran] ?? ""} />;

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeDeriveesCyclometriques(exercice), lettreEtape(indexEcran))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        corrigeDetaille: corrigeDetailleEcranCourant(),
        reponseAttendue: reponseAttenduePhase(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const segmentsBase = calculerSegmentsProgressionDeriveesCyclometriques(etat);
  const segments = segmentsBase.map((s, i) => (s === "correcte" && aideUtiliseeFermees[i] ? ("aide" as const) : s));

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Dérivées de fonctions cyclométriques</h1>
        <p className="app-subtitle">Chapitre 1 — Fonctions réciproques & cyclométriques</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifDeriveesCyclometriques(etat)} />
        <div className="card-body">
          {etat.phase === "aDeriveeU" && exercice.famille === "A" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionALatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseADeriveeU(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "aDeriveeFinale" && exercice.famille === "A" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionALatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseADeriveeFinale(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {etat.phase === "bDeriveeU" && exercice.famille === "B" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionBLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseBDeriveeU(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "bDeriveeArc" && exercice.famille === "B" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionBLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseBDeriveeArc(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "bDeriveeFinale" && exercice.famille === "B" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionBLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseBDeriveeFinale(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {etat.phase === "cNumerateur" && exercice.famille === "C" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionCLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCNumerateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "cDenominateur" && exercice.famille === "C" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionCLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCDenominateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "cDeriveeFinale" && exercice.famille === "C" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionCLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCDeriveeFinale(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {etat.phase === "dNumerateur" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDNumerateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "dDenominateur" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDDenominateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "dBrut" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDBrut(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "dSimplifiee" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDSimplifiee(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {etat.phase === "eDeriveeInterne" && exercice.famille === "E" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionELatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseEDeriveeInterne(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "eDeriveeFinale" && exercice.famille === "E" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionELatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseEDeriveeFinale(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {etat.phase === "fBrute" && exercice.famille === "F" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionFLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseFBrute(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "fSimplifiee" && exercice.famille === "F" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionFLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseFSimplifiee(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {etat.phase === "gDeriveeInterne" && exercice.famille === "G" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionGLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGDeriveeInterne(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {etat.phase === "gDeriveeFinale" && exercice.famille === "G" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={consigneEcranDerivee(exercice, etat.phase)}
                  fonctionLatex={formatFonctionGLatex(exercice)}
                  aideNiveau1={aides[0]}
                  aideNiveau2={aides[1]}
                  placeholder={PLACEHOLDER_DERIVEE}
                  diagnostiquer={(t) => diagnostiquerPhaseDerivee(exercice, etat.phase, t)}
                  cible={(t) => cibleDerivee(exercice, etat.phase, t)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGDeriveeFinale(etat, texte), texte)}
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
