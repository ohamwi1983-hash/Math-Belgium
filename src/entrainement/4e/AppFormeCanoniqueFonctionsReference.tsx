import { useState } from "react";
import type { FamilleReference } from "./core/formeCanoniqueFonctionsReference.types";
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

const CONSIGNE_GENERALE = "Détermine la forme canonique de cette fonction de référence transformée.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionFormeCanoniqueFonctionReference {
  return demarrerSessionFormeCanoniqueFonctionReference(REGLAGES_DEMO, genererExerciceFormeCanoniqueFonctionReference);
}

const LIBELLE_PHASE: Record<PhaseFormeCanoniqueFonctionReference, string> = {
  reconnaissance: "Reconnaissance de la famille",
  canonique: "Forme canonique",
  ehChSoy: "Étirement / compression / symétrie horizontale",
  th: "Translation horizontale",
  evCvSox: "Étirement / compression / symétrie verticale",
  tv: "Translation verticale",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionFormeCanoniqueFonctionReference;
  revele: boolean;
}

export function AppFormeCanoniqueFonctionsReference() {
  const [etat, setEtat] = useState<EtatSessionFormeCanoniqueFonctionReference>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionFormeCanoniqueFonctionReference) {
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
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(familleId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionFormeCanoniqueFonctionReference(REGLAGES_DEMO, () => construireAvecFamille(familleId as FamilleReference)));
  }

  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : etat.phase === "reconnaissance" ? (
          <>Famille attendue : {libelleFamille(exercice.famille)}</>
        ) : etat.phase === "canonique" ? (
          <Katex expression={formatCibleLatex(exercice.famille, cibleFinale(exercice))} />
        ) : etat.phase === "ehChSoy" ? (
          <Katex expression={formatGabaritEtape2Latex(exercice)} />
        ) : etat.phase === "th" ? (
          <Katex expression={formatGabaritEtape3Latex(exercice)} />
        ) : etat.phase === "evCvSox" ? (
          <Katex expression={formatGabaritEtape4Latex(exercice)} />
        ) : (
          <Katex expression={formatGabaritLatex(exercice)} />
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Forme canonique et transformations — fonctions de référence</h1>
        <p className="app-subtitle">Chapitre 2</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          {etat.phase === "reconnaissance" ? (
            <EtapeReconnaissanceFormeCanoniqueFR
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onChoisir={(choix) => terminerEtape(soumettreChoixFamilleFR(etat, choix))}
              validation={validation}
            />
          ) : etat.phase === "canonique" ? (
            <EtapeCanoniqueFR
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseCanoniqueFR(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "ehChSoy" ? (
            <EtapeEhChSoy
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseEhChSoy(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "th" ? (
            <EtapeThFR
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseThFR(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "evCvSox" ? (
            <EtapeEvCvSoxFR
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseEvCvSoxFR(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeTvFR
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseTvFR(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
