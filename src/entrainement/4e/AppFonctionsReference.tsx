import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesFamillesFonctionReference, ReponseCurseursFonctionReference } from "./core/fonctionsReference.types";
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
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { MafsGraphFonctionsReference } from "./components/MafsGraphFonctionsReference";

const CONSIGNE_GENERALE = "Étudie les transformations graphiques de cette fonction de référence.";

const NOMBRE_EXERCICES_ALEATOIRE = 5;

/** Valeurs par défaut des 6 curseurs + 2 toggles (écran "exercice") — jamais déjà corrects (même
 * principe que partout ailleurs dans le projet). */
const CURSEURS_INITIAUX: ReponseCurseursFonctionReference = { th: 0, tv: 0, ch: 1, eh: 1, ev: 1, cv: 1, sox: false, soy: false };

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
  /** `true` ⟺ la phase qui vient de se clore était "exercice" — la SEULE qui clôt un exercice
   * (`etat.indexExercice` avance, ou la session entière se termine) et fasse donc redémarrer
   * "reconnaissance" à vide pour l'exercice suivant. `historique`/`ficheOuverteIndex` ne doivent
   * être remis à zéro qu'à CE moment précis (jamais quand "reconnaissance" vient juste de clore
   * vers "exercice" DANS LE MÊME exercice — sinon l'entrée qu'on vient de pousser serait effacée
   * avant que la puce ne devienne cliquable). */
  nouvelExercice: boolean;
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
 * reprend exactement la même lecture que `calculerRecapitulatifFonctionReference`
 * (ui/recapitulatifFonctionsReference.ts) : `etat.etapeReconnaissance.revelee`, qui garde son état
 * terminal jusqu'à la clôture de l'exercice (voir sessionFonctionsReference.ts). "exercice" (dernière
 * phase) n'a pas de branche "close" propre : une fois notée, un nouvel exercice démarre (ou la
 * session se termine) — même principe que la dernière phase d'AppAnalyseFonction.tsx. Ce indicateur
 * est ORTHOGONAL au bloc "Exercice N / Total" ci-dessous (`.card-progress-step`/`.progress-track`,
 * partagé avec les générateurs AppQuiz*) : celui-ci mesure la progression dans la SESSION (plusieurs
 * exercices), jamais remplacé ici — voir le rapport de migration pour ce choix.
 */
function calculerSegmentsProgression(etat: EtatSessionFonctionReference): EtatPuceProgression[] {
  return [
    etat.phase === "reconnaissance" ? "courante" : etat.etapeReconnaissance.revelee ? "revele" : "correcte",
    etat.phase === "exercice" ? "courante" : "a-venir",
  ];
}

export function AppFonctionsReference() {
  const [reglagesFamilles, setReglagesFamilles] = useState<ReglagesFamillesFonctionReference | null>(null);
  const [etat, setEtat] = useState<EtatSessionFonctionReference | null>(null);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  /** Curseurs de l'écran "exercice", remontés ici (plutôt que locaux à `EtapeFonctionsReferenceExercice`)
   * pour rester visibles au moment de calculer `blocDonnees` (`live`, courbe manipulable affichée
   * uniquement si l'aide est activée). Reset explicite à chaque changement de phase — même
   * comportement que l'ancien `useState` local, remonté à chaque nouvelle occurrence de l'écran
   * "exercice" (après "reconnaissance", jamais en restant sur "exercice" après un essai raté). */
  const [curseurs, setCurseurs] = useState<ReponseCurseursFonctionReference>(CURSEURS_INITIAUX);
  const [phasePourCurseurs, setPhasePourCurseurs] = useState(etat?.phase ?? null);
  if (etat && phasePourCurseurs !== etat.phase) {
    setPhasePourCurseurs(etat.phase);
    setCurseurs(CURSEURS_INITIAUX);
  }

  /** Consultation en lecture seule de l'écran "reconnaissance" déjà clos (puce cliquable de
   * `ProgressionPuces`) — tenu ICI, à part de `EtatSessionFonctionReference`, jamais dans le
   * moteur. "exercice" (toujours courante tant que l'exercice n'est pas clos, voir
   * `calculerSegmentsProgression`) n'a jamais de puce "correcte"/"revele" : rien n'y est jamais
   * poussé (même convention que la dernière phase des autres générateurs du chantier). Remis à
   * vide à chaque nouvel exercice (voir `nouvelExercice` sur `TransitionEnAttente`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function commencerSession(reglages: ReglagesFamillesFonctionReference) {
    setReglagesFamilles(reglages);
    setEtat(demarrer(reglages));
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function onGenererDev(familleId: string) {
    setEnAttente(null);
    const reglagesSession: ReglagesSession = { ...REGLAGES_BASE, nombreExercices: NOMBRE_EXERCICES_ALEATOIRE };
    setEtat(demarrerSessionFonctionReference(reglagesSession, () => construireAvecFamille(familleId as FamilleReference)));
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  /** Appelé juste avant `terminerEtape`, avec l'état DÉJÀ mis à jour par `soumettreChoixFamille` —
   * réutilise `releveRevelePhase`/`reponseAttenduePhase`, déjà écrites pour `validation` sur ce
   * même générateur à ce même point exact (`etat`/`nouvelEtat` juste avant la transition). Jamais
   * appelée pour "exercice" (voir le commentaire de `historique` ci-dessus). */
  function ajouterHistorique(etatAvant: EtatSessionFonctionReference, votreReponse: ReactNode, nouvelEtat: EtatSessionFonctionReference) {
    const revele = releveRevelePhase(etatAvant, nouvelEtat);
    setHistorique((h) => [
      ...h,
      {
        titre: "Famille",
        votreReponse,
        correcte: !revele,
        reponseAttendue: revele ? reponseAttenduePhase(etatAvant, nouvelEtat) : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * réellement (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde-fou que
   * `AppAnalyseFonction.tsx`, bug déjà rencontré et corrigé là-bas). */
  function terminerEtape(nouvelEtat: EtatSessionFonctionReference, votreReponse?: ReactNode) {
    if (!etat) return;
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(etat, votreReponse, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: releveRevelePhase(etat, nouvelEtat), nouvelExercice: etat.phase === "exercice" });
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
    if (enAttente.nouvelExercice) {
      setHistorique([]);
      setFicheOuverteIndex(null);
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

  /** Bloc de données centralisé (`EnTeteExercice`) — la courbe cible (`cible={etat.exerciceCourant}`)
   * est identique sur les 2 écrans. `live` (courbe manipulable par les curseurs ci-dessus) ne
   * s'affiche que sur l'écran "exercice" et seulement une fois l'aide activée — `null` sinon,
   * identique au comportement d'avant sur l'écran "reconnaissance" (pas de prop `live`). */
  const live = etat.phase === "exercice" && etat.aideUtilisee ? { ...etat.exerciceCourant, ...curseurs } : null;
  const blocDonnees = <MafsGraphFonctionsReference cible={etat.exerciceCourant} live={live} />;

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
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          {etat.phase === "reconnaissance" ? (
            <EtapeReconnaissanceFonction
              tentativesUtilisees={etat.etapeReconnaissance.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onChoisir={(choix) => terminerEtape(soumettreChoixFamille(etat, choix), libelleFamille(choix))}
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
              curseurs={curseurs}
              onChangeCurseurs={setCurseurs}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponse(etat, reponse))}
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
