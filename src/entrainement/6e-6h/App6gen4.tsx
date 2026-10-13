import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
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
import type { EtatSessionDeriveesCyclometriques } from "./moteur6e/typesDeriveesCyclometriques";
import { EtapeChampDeriveeCyclo } from "./components6e/EtapeChampDeriveeCyclo";
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
  texteAideADeriveeFinaleNiveau1,
  texteAideADeriveeFinaleNiveau2,
  texteAideADeriveeUNiveau1,
  texteAideADeriveeUNiveau2,
  texteAideBDeriveeArcNiveau1,
  texteAideBDeriveeArcNiveau2,
  texteAideBDeriveeFinaleNiveau1,
  texteAideBDeriveeFinaleNiveau2,
  texteAideBDeriveeUNiveau1,
  texteAideBDeriveeUNiveau2,
  texteAideCDenominateurNiveau1,
  texteAideCDenominateurNiveau2,
  texteAideCDeriveeFinaleNiveau1,
  texteAideCDeriveeFinaleNiveau2,
  texteAideCNumerateurNiveau1,
  texteAideCNumerateurNiveau2,
  texteAideDBrutNiveau1,
  texteAideDBrutNiveau2,
  texteAideDDenominateurNiveau1,
  texteAideDDenominateurNiveau2,
  texteAideDNumerateurNiveau1,
  texteAideDNumerateurNiveau2,
  texteAideDSimplifieeNiveau1,
  texteAideDSimplifieeNiveau2,
  texteAideEDeriveeFinaleNiveau1,
  texteAideEDeriveeFinaleNiveau2,
  texteAideEDeriveeInterneNiveau1,
  texteAideEDeriveeInterneNiveau2,
  texteAideFBruteNiveau1,
  texteAideFBruteNiveau2,
  texteAideFSimplifieeNiveau1,
  texteAideFSimplifieeNiveau2,
  texteAideGDeriveeFinaleNiveau1,
  texteAideGDeriveeFinaleNiveau2,
  texteAideGDeriveeInterneNiveau1,
  texteAideGDeriveeInterneNiveau2,
} from "./ui6e/formatDeriveesCyclometriques";
import { calculerRecapitulatifDeriveesCyclometriques, calculerSegmentsProgressionDeriveesCyclometriques } from "./ui6e/recapitulatifDeriveesCyclometriques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDeriveesCyclometriques {
  return demarrerSessionDeriveesCyclometriques(REGLAGES_DEMO, genererExerciceDeriveesCyclometriques);
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
  const [etat, setEtat] = useState<EtatSessionDeriveesCyclometriques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  /** `nouvelEtat.derniereCloture` porte l'aide/révélation de l'écran qui vient PRÉCISÉMENT de se
   * fermer, capturée côté moteur (jamais reconstruite depuis un `etat` React déjà obsolète — voir
   * `typesDeriveesCyclometriques.ts`). */
  function terminerEtape(nouvelEtat: EtatSessionDeriveesCyclometriques) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereCloture!.info.revele });
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
    setEtat(demarrerSessionDeriveesCyclometriques(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const placeholderGenerique = "ex : -2/sqrt(1-4*x^2)...";

  const reponseAttenduePhase = () => {
    // Narrowe `exercice.famille` avant d'appeler les `texteAideXxxNiveau2` typés par famille —
    // `etat.phase` seul ne suffit pas à TypeScript pour prouver la correspondance phase/famille,
    // même si elle est garantie à l'exécution (chaque famille a ses phases dédiées, jamais de nom
    // partagé entre familles — voir `typesDeriveesCyclometriques.ts`).
    if (exercice.famille === "A") {
      if (etat.phase === "aDeriveeU") return <Katex expression={texteAideADeriveeUNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "aDeriveeFinale") return <Katex expression={texteAideADeriveeFinaleNiveau2(exercice).latex ?? ""} />;
    }
    if (exercice.famille === "B") {
      if (etat.phase === "bDeriveeU") return <Katex expression={texteAideBDeriveeUNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "bDeriveeArc") return <Katex expression={texteAideBDeriveeArcNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "bDeriveeFinale") return <Katex expression={texteAideBDeriveeFinaleNiveau2(exercice).latex ?? ""} />;
    }
    if (exercice.famille === "C") {
      if (etat.phase === "cNumerateur") return <Katex expression={texteAideCNumerateurNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "cDenominateur") return <Katex expression={texteAideCDenominateurNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "cDeriveeFinale") return <Katex expression={texteAideCDeriveeFinaleNiveau2(exercice).latex ?? ""} />;
    }
    if (exercice.famille === "D") {
      if (etat.phase === "dNumerateur") return <Katex expression={texteAideDNumerateurNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "dDenominateur") return <Katex expression={texteAideDDenominateurNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "dBrut") return <Katex expression={texteAideDBrutNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "dSimplifiee") return <Katex expression={texteAideDSimplifieeNiveau2(exercice).latex ?? ""} />;
    }
    if (exercice.famille === "E") {
      if (etat.phase === "eDeriveeInterne") return <Katex expression={texteAideEDeriveeInterneNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "eDeriveeFinale") return <Katex expression={texteAideEDeriveeFinaleNiveau2(exercice).latex ?? ""} />;
    }
    if (exercice.famille === "F") {
      if (etat.phase === "fBrute") return <Katex expression={texteAideFBruteNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "fSimplifiee")
        return "Forme simplifiée via l'identité trigonométrique adéquate (plusieurs écritures équivalentes acceptées).";
    }
    if (exercice.famille === "G") {
      if (etat.phase === "gDeriveeInterne") return <Katex expression={texteAideGDeriveeInterneNiveau2(exercice).latex ?? ""} />;
      if (etat.phase === "gDeriveeFinale") return <Katex expression={texteAideGDeriveeFinaleNiveau2(exercice).latex ?? ""} />;
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
        <h1 className="app-title">Dérivées de fonctions cyclométriques</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionDeriveesCyclometriques(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifDeriveesCyclometriques(etat)} />
        <div className="card-body">
          {etat.phase === "aDeriveeU" && exercice.famille === "A" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Dérive u(x) seul."
                  fonctionLatex={formatFonctionALatex(exercice)}
                  aideNiveau1={{ texte: texteAideADeriveeUNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideADeriveeUNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseADeriveeU(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "aDeriveeFinale" && exercice.famille === "A" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Assemble f'(x) — utilise le u(x) et le u'(x) corrects, simplifie si possible."
                  fonctionLatex={formatFonctionALatex(exercice)}
                  aideNiveau1={texteAideADeriveeFinaleNiveau1(exercice)}
                  aideNiveau2={texteAideADeriveeFinaleNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseADeriveeFinale(etat, texte))}
                  validation={validation}
                />
              )}

              {etat.phase === "bDeriveeU" && exercice.famille === "B" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Dérive u(x)."
                  fonctionLatex={formatFonctionBLatex(exercice)}
                  aideNiveau1={{ texte: texteAideBDeriveeUNiveau1(), latex: null }}
                  aideNiveau2={texteAideBDeriveeUNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseBDeriveeU(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "bDeriveeArc" && exercice.famille === "B" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Dérive arcfonction(v(x)) séparément."
                  fonctionLatex={formatFonctionBLatex(exercice)}
                  aideNiveau1={{ texte: texteAideBDeriveeArcNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideBDeriveeArcNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseBDeriveeArc(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "bDeriveeFinale" && exercice.famille === "B" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Assemble f'(x) via la règle du produit."
                  fonctionLatex={formatFonctionBLatex(exercice)}
                  aideNiveau1={{ texte: texteAideBDeriveeFinaleNiveau1(), latex: null }}
                  aideNiveau2={texteAideBDeriveeFinaleNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseBDeriveeFinale(etat, texte))}
                  validation={validation}
                />
              )}

              {etat.phase === "cNumerateur" && exercice.famille === "C" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Dérive le numérateur."
                  fonctionLatex={formatFonctionCLatex(exercice)}
                  aideNiveau1={{ texte: texteAideCNumerateurNiveau1(), latex: null }}
                  aideNiveau2={texteAideCNumerateurNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCNumerateur(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "cDenominateur" && exercice.famille === "C" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Dérive le dénominateur."
                  fonctionLatex={formatFonctionCLatex(exercice)}
                  aideNiveau1={{ texte: texteAideCDenominateurNiveau1(), latex: null }}
                  aideNiveau2={texteAideCDenominateurNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCDenominateur(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "cDeriveeFinale" && exercice.famille === "C" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Assemble f'(x) via la formule du quotient."
                  fonctionLatex={formatFonctionCLatex(exercice)}
                  aideNiveau1={{ texte: texteAideCDeriveeFinaleNiveau1(), latex: null }}
                  aideNiveau2={texteAideCDeriveeFinaleNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCDeriveeFinale(etat, texte))}
                  validation={validation}
                />
              )}

              {etat.phase === "dNumerateur" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Dérive le numérateur."
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  aideNiveau1={{ texte: texteAideDNumerateurNiveau1(), latex: null }}
                  aideNiveau2={texteAideDNumerateurNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDNumerateur(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "dDenominateur" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Dérive le dénominateur."
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  aideNiveau1={{ texte: texteAideDDenominateurNiveau1(), latex: null }}
                  aideNiveau2={texteAideDDenominateurNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDDenominateur(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "dBrut" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Assemble f'(x) via la formule du quotient — résultat BRUT, ne simplifie pas encore."
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  aideNiveau1={{ texte: texteAideDBrutNiveau1(), latex: null }}
                  aideNiveau2={texteAideDBrutNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDBrut(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "dSimplifiee" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Simplifie le résultat précédent grâce à l'identité arcsin(u)+arccos(u)=π/2."
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  aideNiveau1={texteAideDSimplifieeNiveau1()}
                  aideNiveau2={texteAideDSimplifieeNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDSimplifiee(etat, texte))}
                  validation={validation}
                />
              )}

              {etat.phase === "eDeriveeInterne" && exercice.famille === "E" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Dérive l'arcfonction interne complète."
                  fonctionLatex={formatFonctionELatex(exercice)}
                  aideNiveau1={{ texte: texteAideEDeriveeInterneNiveau1(), latex: null }}
                  aideNiveau2={texteAideEDeriveeInterneNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseEDeriveeInterne(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "eDeriveeFinale" && exercice.famille === "E" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Assemble f'(x) via la chaîne extérieure."
                  fonctionLatex={formatFonctionELatex(exercice)}
                  aideNiveau1={{ texte: texteAideEDeriveeFinaleNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideEDeriveeFinaleNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseEDeriveeFinale(etat, texte))}
                  validation={validation}
                />
              )}

              {etat.phase === "fBrute" && exercice.famille === "F" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Dérive f(x) via la chaîne standard — résultat brut accepté."
                  fonctionLatex={formatFonctionFLatex(exercice)}
                  aideNiveau1={{ texte: texteAideFBruteNiveau1(), latex: null }}
                  aideNiveau2={texteAideFBruteNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseFBrute(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "fSimplifiee" && exercice.famille === "F" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Donne la forme finale simplifiée via l'identité trigonométrique adéquate."
                  fonctionLatex={formatFonctionFLatex(exercice)}
                  aideNiveau1={texteAideFSimplifieeNiveau1()}
                  aideNiveau2={{ texte: texteAideFSimplifieeNiveau2(exercice), latex: null }}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseFSimplifiee(etat, texte))}
                  validation={validation}
                />
              )}

              {etat.phase === "gDeriveeInterne" && exercice.famille === "G" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran={exercice.sousCas === "h" ? "Dérive v(x)." : "Dérive la fraction interne u(x)."}
                  fonctionLatex={formatFonctionGLatex(exercice)}
                  aideNiveau1={{ texte: texteAideGDeriveeInterneNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideGDeriveeInterneNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGDeriveeInterne(etat, texte))}
                  validation={validation}
                />
              )}
              {etat.phase === "gDeriveeFinale" && exercice.famille === "G" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  estPremierEcran={estPremierEcran}
                  consigneEcran="Assemble f'(x)."
                  fonctionLatex={formatFonctionGLatex(exercice)}
                  aideNiveau1={{ texte: texteAideGDeriveeFinaleNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideGDeriveeFinaleNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGDeriveeFinale(etat, texte))}
                  validation={validation}
                />
              )}
        </div>
      </main>
    </div>
  );
}
