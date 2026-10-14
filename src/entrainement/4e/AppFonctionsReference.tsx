import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesFamillesFonctionReference } from "./core/fonctionsReference.types";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionFonctionReference, soumettreChoixFamille, soumettreReponse } from "./moteur/sessionFonctionsReference";
import type { EtatSessionFonctionReference } from "./moteur/typesFonctionsReference";
import { CATALOGUE_VARIANTES, construireAvecFamille, creerGenerateurFonctionReference } from "./generateurs/fonctionsReference";
import type { FamilleReference } from "./core/fonctionsReference.types";
import { calculerRecapitulatifFonctionReference } from "./ui/recapitulatifFonctionsReference";
import { formatEquationFonctionReferenceLatex } from "./ui/formatFonctionsReference";
import { libelleFamille } from "./ui/famillesReferenceLabels";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReglagesFonctionsReference } from "./components/EtapeReglagesFonctionsReference";
import { EtapeReconnaissanceFonction } from "./components/EtapeReconnaissanceFonction";
import { EtapeFonctionsReferenceExercice } from "./components/EtapeFonctionsReferenceExercice";
import { Katex } from "./components/Katex";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Étudie les transformations graphiques de cette fonction de référence.";

const NOMBRE_EXERCICES_ALEATOIRE = 5;

const REGLAGES_BASE = {
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
} as const;

/**
 * Démarre (ou redémarre) une session à partir du réglage de sélection des familles
 * (`prompt-reglage-nombre-par-famille.md`) — `nombreExercices` se déduit de la somme des
 * quantités en mode "personnalisé" (aucun réglage séparé), reste la constante historique en mode
 * "aléatoire".
 */
function demarrer(reglagesFamilles: ReglagesFamillesFonctionReference): EtatSessionFonctionReference {
  const nombreExercices =
    reglagesFamilles.mode === "aleatoire"
      ? NOMBRE_EXERCICES_ALEATOIRE
      : Object.values(reglagesFamilles.quantites).reduce((total: number, quantite: number) => total + quantite, 0);
  const reglagesSession: ReglagesSession = { ...REGLAGES_BASE, nombreExercices };
  return demarrerSessionFonctionReference(reglagesSession, creerGenerateurFonctionReference(reglagesFamilles));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionFonctionReference;
  revele: boolean;
}

/** Reproduit exactement ce que `ResultatPanelFonctionsReference.tsx` affichait pour UNE phase
 * donnée, scopé à l'exercice/phase qui vient juste de se terminer (`etatAvant.exerciceCourant`/
 * `etatAvant.phase`, jamais l'état suivant) — "exercice" clôture TOUJOURS l'exercice (2 notes
 * indépendantes, équation/curseurs), donc son `xxxRevele` ne se lit que sur le dernier
 * `resultats[...]` de `nouvelEtat` (jamais sur `nouvelEtat.etapeEquation`/`etapeCurseurs`,
 * remis à zéro dès que l'exercice suivant démarre). */
function reponseAttenduePhase(etatAvant: EtatSessionFonctionReference, nouvelEtat: EtatSessionFonctionReference): ReactNode {
  const exercice = etatAvant.exerciceCourant;
  if (etatAvant.phase === "reconnaissance") {
    return <>Famille attendue : {libelleFamille(exercice.famille)}</>;
  }

  const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
  return (
    <>
      {resultat.equationRevele && (
        <div>
          Fonction attendue : <Katex expression={formatEquationFonctionReferenceLatex(exercice)} />
        </div>
      )}
      {resultat.curseursRevele && (
        <p>
          Curseurs attendus : TH = {exercice.th} ; TV = {exercice.tv} ; CH = {exercice.ch} ; EH = {exercice.eh} ; EV = {exercice.ev} ; CV ={" "}
          {exercice.cv} ; SOX = {exercice.sox ? "Oui" : "Non"} ; SOY = {exercice.soy ? "Oui" : "Non"}
        </p>
      )}
    </>
  );
}

/** Signal `revele` de la phase qui vient JUSTE de se terminer (`etatAvant.phase`, avant la
 * transition) — "reconnaissance" l'expose directement sur `nouvelEtat.etapeReconnaissance.revelee`
 * (jamais clôturante) ; "exercice" clôture TOUJOURS l'exercice (2 notes indépendantes), donc lu sur
 * le dernier `resultats[...]` de `nouvelEtat`. */
function releveRevelePhase(etatAvant: EtatSessionFonctionReference, nouvelEtat: EtatSessionFonctionReference): boolean {
  if (etatAvant.phase === "reconnaissance") return nouvelEtat.etapeReconnaissance.revelee;
  const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
  return resultat.equationRevele || resultat.curseursRevele;
}

/**
 * Segments de la barre de puces pour les 2 phases FIXES de l'exercice courant (`PhaseFonctionReference`,
 * typesFonctionsReference.ts) : "reconnaissance" (jamais sautée) puis "exercice". "reconnaissance"
 * reprend exactement la même heuristique que `calculerRecapitulatifFonctionReference`
 * (ui/recapitulatifFonctionsReference.ts) : pas de `reconnaissanceRevele` tracké au niveau de
 * l'exercice par le moteur, donc `scoreReconnaissanceExercice === 0` ⟺ révélée. "exercice" (dernière
 * phase) n'a pas de branche "close" propre : une fois notée, un nouvel exercice démarre (ou la
 * session se termine) — même principe que la dernière phase d'AppAnalyseFonction.tsx. Ce indicateur
 * est ORTHOGONAL au bloc "Exercice N / Total" ci-dessous (`.card-progress-step`/`.progress-track`,
 * partagé avec les générateurs AppQuiz*) : celui-ci mesure la progression dans la SESSION (plusieurs
 * exercices), jamais remplacé ici — voir le rapport de migration pour ce choix.
 */
function calculerSegmentsProgression(etat: EtatSessionFonctionReference): EtatPuceProgression[] {
  return [
    etat.phase === "reconnaissance" ? "courante" : etat.scoreReconnaissanceExercice === 0 ? "revele" : "correcte",
    etat.phase === "exercice" ? "courante" : "a-venir",
  ];
}

export function AppFonctionsReference() {
  const [reglagesFamilles, setReglagesFamilles] = useState<ReglagesFamillesFonctionReference | null>(null);
  const [etat, setEtat] = useState<EtatSessionFonctionReference | null>(null);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function commencerSession(reglages: ReglagesFamillesFonctionReference) {
    setReglagesFamilles(reglages);
    setEtat(demarrer(reglages));
  }

  function onGenererDev(familleId: string) {
    setEnAttente(null);
    const reglagesSession: ReglagesSession = { ...REGLAGES_BASE, nombreExercices: NOMBRE_EXERCICES_ALEATOIRE };
    setEtat(demarrerSessionFonctionReference(reglagesSession, () => construireAvecFamille(familleId as FamilleReference)));
  }

  function terminerEtape(nouvelEtat: EtatSessionFonctionReference) {
    if (!etat) return;
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: releveRevelePhase(etat, nouvelEtat) });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      // Session ENTIÈREMENT terminée (les N exercices configurés) — redémarre avec les mêmes
      // réglages (même principe que l'ancien bouton "Recommencer" de
      // `ResumeSessionFonctionsReference`) ; `reglagesFamilles` est toujours non nul ici sauf
      // session forcée par le panneau dev, où l'on retourne à l'écran de réglages.
      setEtat(reglagesFamilles ? demarrer(reglagesFamilles) : null);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  if (!etat) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <p className="app-eyebrow">4e — Entraînement</p>
          <h1 className="app-title">Transformations graphiques — fonctions de référence</h1>
          <p className="app-subtitle">Chapitre 2</p>
          <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        </header>
        <main className="card">
          <div className="card-body">
            <EtapeReglagesFonctionsReference onCommencer={commencerSession} />
          </div>
        </main>
      </div>
    );
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(etat, enAttente.etatSuivant),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Transformations graphiques — fonctions de référence</h1>
        <p className="app-subtitle">Chapitre 2</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-step">
              Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
          </div>
        </div>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          {etat.phase === "reconnaissance" ? (
            <EtapeReconnaissanceFonction
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeReconnaissance.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onChoisir={(choix) => terminerEtape(soumettreChoixFamille(etat, choix))}
              validation={validation}
            />
          ) : (
            <EtapeFonctionsReferenceExercice
              exercice={etat.exerciceCourant}
              recapitulatif={calculerRecapitulatifFonctionReference(etat)}
              tentativesEquation={etat.etapeEquation.tentativesUtilisees}
              tentativesCurseurs={etat.etapeCurseurs.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              equationFermee={etat.etapeEquation.terminee}
              curseursFermee={etat.etapeCurseurs.terminee}
              aideActivee={etat.aideUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponse(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
