import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceFormeCanoniqueFonctionReference, FamilleReference } from "./core/formeCanoniqueFonctionsReference.types";
import type { ReglagesSession } from "./core/session.types";
import {
  demarrerSessionFormeCanoniqueFonctionReference,
  soumettreChoixFamilleFR,
  soumettreReponseCanoniqueFR,
  soumettreReponseEhChSoy,
  soumettreReponseEvCvSoxFR,
  soumettreReponseThFR,
  soumettreReponseTvFR,
} from "./moteur/sessionFormeCanoniqueFonctionsReference";
import type { EtatSessionFormeCanoniqueFonctionReference, PhaseFormeCanoniqueFonctionReference } from "./moteur/typesFormeCanoniqueFonctionsReference";
import { cibleFinale } from "./moteur/verificationFormeCanoniqueFonctionsReference";
import {
  CATALOGUE_VARIANTES,
  construireAvecFamille,
  genererExerciceFormeCanoniqueFonctionReference,
} from "./generateurs/formeCanoniqueFonctionsReference";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReconnaissanceFormeCanoniqueFR } from "./components/EtapeReconnaissanceFormeCanoniqueFR";
import { EtapeCanoniqueFR } from "./components/EtapeCanoniqueFR";
import { EtapeEhChSoy } from "./components/EtapeEhChSoy";
import { EtapeThFR } from "./components/EtapeThFR";
import { EtapeEvCvSoxFR } from "./components/EtapeEvCvSoxFR";
import { EtapeTvFR } from "./components/EtapeTvFR";
import {
  formatCibleLatex,
  formatGabaritEtape2Latex,
  formatGabaritEtape3Latex,
  formatGabaritEtape4Latex,
  formatGabaritLatex,
} from "./ui/formatFormeCanoniqueFonctionsReference";
import { libelleFamille } from "./ui/famillesReferenceLabels";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { SaisieExpressionLatex } from "./components/SaisieExpressionLatex";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

const CONSIGNE_GENERALE = "Détermine la forme canonique de cette fonction de référence transformée.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionFormeCanoniqueFonctionReference {
  return demarrerSessionFormeCanoniqueFonctionReference(REGLAGES_DEMO, genererExerciceFormeCanoniqueFonctionReference);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code des
 * feuilles d'exercices), son exercice est CETTE instance — tirée avec les MÊMES fonctions de
 * génération que l'adaptateur d'export (`generateurs/formeCanoniqueFonctionsReference/exportEvaluation.ts`) ;
 * les sessions suivantes reviennent au tirage normal. */
function sessionInitiale(): EtatSessionFormeCanoniqueFonctionReference {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionFormeCanoniqueFonctionReference(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceFormeCanoniqueFonctionReference, (id) => construireAvecFamille(id as FamilleReference)),
  );
}

/** 6 phases fixes, toujours le même ordre — pas de mécanisme d'aide sur ce générateur (aucun champ
 * `niveauAideXxx` dans `typesFormeCanoniqueFonctionsReference.ts`). "tv" (dernière phase) n'a
 * jamais besoin de sa propre branche "close" : jamais consultée comme phase passée. Les puces closes
 * sont cliquables (fiche « Ta réponse » / « Réponse attendue », historique tenu par l'appli). */
const ORDRE_PHASES: PhaseFormeCanoniqueFonctionReference[] = ["reconnaissance", "canonique", "ehChSoy", "th", "evCvSox", "tv"];

function calculerSegmentsProgression(etat: EtatSessionFormeCanoniqueFonctionReference): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele =
      phase === "reconnaissance"
        ? etat.reconnaissanceRevele
        : phase === "canonique"
          ? etat.canoniqueRevele
          : phase === "ehChSoy"
            ? etat.ehChSoyRevele
            : phase === "th"
              ? etat.thRevele
              : etat.evCvSoxRevele;
    return revele ? "revele" : "correcte";
  });
}

/** Titre de chaque écran dans la fiche des puces cliquables. */
const TITRE_PHASE: Record<PhaseFormeCanoniqueFonctionReference, string> = {
  reconnaissance: "Famille",
  canonique: "Forme canonique",
  ehChSoy: "EH, CH et SOY",
  th: "Translation horizontale",
  evCvSox: "EV, CV et SOX",
  tv: "Translation verticale",
};

/** Réponse attendue d'un écran — la même que celle affichée par `ValidationEcran` à la clôture de
 * cet écran (mêmes fonctions de formatage), réutilisée par la fiche des puces cliquables. */
function reponseAttenduePhase(phase: PhaseFormeCanoniqueFonctionReference, exercice: ExerciceFormeCanoniqueFonctionReference): ReactNode {
  switch (phase) {
    case "reconnaissance":
      return <>Famille attendue : {libelleFamille(exercice.famille)}</>;
    case "canonique":
      return <Katex expression={formatCibleLatex(exercice.famille, cibleFinale(exercice))} />;
    case "ehChSoy":
      return <Katex expression={formatGabaritEtape2Latex(exercice)} />;
    case "th":
      return <Katex expression={formatGabaritEtape3Latex(exercice)} />;
    case "evCvSox":
      return <Katex expression={formatGabaritEtape4Latex(exercice)} />;
    case "tv":
      return <Katex expression={formatGabaritLatex(exercice)} />;
  }
}

/** Expression saisie, rendue comme dans l'aperçu sous le champ. */
function fonctionSaisie(texte: string): ReactNode {
  return <SaisieExpressionLatex texte={texte} prefixeLatex="f(x) =" />;
}

function ouiNon(b: boolean): string {
  return b ? "oui" : "non";
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionFormeCanoniqueFonctionReference;
  revele: boolean;
}

export function AppFormeCanoniqueFonctionsReference() {
  const [etat, setEtat] = useState<EtatSessionFormeCanoniqueFonctionReference>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables) — tenu ICI, jamais dans
   * le moteur ; remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur de génération, dans la clé des écrans : un nouvel exercice remonte l'écran (champs vidés). */
  const [generation, setGeneration] = useState(0);

  /** `votreReponse` n'est poussée dans l'historique que lorsque l'écran se clôt réellement (jamais à
   * chaque essai), et jamais pour "tv" (dernier écran, clôt l'exercice). */
  function terminerEtape(nouvelEtat: EtatSessionFormeCanoniqueFonctionReference, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "reconnaissance"
          ? nouvelEtat.reconnaissanceRevele
          : etat.phase === "canonique"
            ? nouvelEtat.canoniqueRevele
            : etat.phase === "ehChSoy"
              ? nouvelEtat.ehChSoyRevele
              : etat.phase === "th"
                ? nouvelEtat.thRevele
                : etat.phase === "evCvSox"
                  ? nouvelEtat.evCvSoxRevele
                  : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.tvRevele;
      if (votreReponse !== undefined && !nouvelEtat.terminee) {
        const phaseClose = etat.phase;
        const exerciceClos = etat.exerciceCourant;
        setHistorique((h) => [
          ...h,
          {
            titre: TITRE_PHASE[phaseClose],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? reponseAttenduePhase(phaseClose, exerciceClos) : undefined,
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
      setGeneration((g) => g + 1);
      setHistorique([]);
      setFicheOuverteIndex(null);
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(familleId: string) {
    setEnAttente(null);
    setGeneration((g) => g + 1);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionFormeCanoniqueFonctionReference(REGLAGES_DEMO, () => construireAvecFamille(familleId as FamilleReference)));
  }

  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : reponseAttenduePhase(etat.phase, exercice),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Forme canonique et transformations — fonctions de référence</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          {etat.phase === "reconnaissance" ? (
            <EtapeReconnaissanceFormeCanoniqueFR
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={1}
              onChoisir={(choix) => terminerEtape(soumettreChoixFamilleFR(etat, choix), libelleFamille(choix))}
              validation={validation}
            />
          ) : etat.phase === "canonique" ? (
            <EtapeCanoniqueFR
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseCanoniqueFR(etat, reponse), fonctionSaisie(reponse.formeCanonique))}
              validation={validation}
            />
          ) : etat.phase === "ehChSoy" ? (
            <EtapeEhChSoy
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) =>
                terminerEtape(
                  soumettreReponseEhChSoy(etat, reponse),
                  <span className="equation-box-termes">
                    <Katex expression={`\\text{EH} = ${reponse.eh}`} />
                    <Katex expression={`\\text{CH} = ${reponse.ch}`} />
                    <Katex expression={`\\text{SOY : ${ouiNon(reponse.soy)}}`} />
                    {fonctionSaisie(reponse.fonctionIntermediaire)}
                  </span>,
                )
              }
              validation={validation}
            />
          ) : etat.phase === "th" ? (
            <EtapeThFR
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) =>
                terminerEtape(
                  soumettreReponseThFR(etat, reponse),
                  <span className="equation-box-termes">
                    <Katex expression={`\\text{TH} = ${reponse.th}`} />
                    {fonctionSaisie(reponse.fonctionIntermediaire)}
                  </span>,
                )
              }
              validation={validation}
            />
          ) : etat.phase === "evCvSox" ? (
            <EtapeEvCvSoxFR
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) =>
                terminerEtape(
                  soumettreReponseEvCvSoxFR(etat, reponse),
                  <span className="equation-box-termes">
                    <Katex expression={`\\text{EV} = ${reponse.ev}`} />
                    <Katex expression={`\\text{CV} = ${reponse.cv}`} />
                    <Katex expression={`\\text{SOX : ${ouiNon(reponse.sox)}}`} />
                    {fonctionSaisie(reponse.fonctionIntermediaire)}
                  </span>,
                )
              }
              validation={validation}
            />
          ) : (
            <EtapeTvFR
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseTvFR(etat, reponse))}
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
