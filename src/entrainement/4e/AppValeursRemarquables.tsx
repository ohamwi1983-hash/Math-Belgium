import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAide,
  demarrerSessionValeursRemarquables,
  soumettreReponseAnglePremierQuadrant,
  soumettreReponseQuadrant,
  soumettreReponseValeursExactes,
} from "./moteur/sessionValeursRemarquables";
import type { EtatSessionValeursRemarquables, PhaseValeursRemarquables } from "./moteur/typesValeursRemarquables";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceValeursRemarquables } from "./generateurs/valeursRemarquables";
import type { AngleRemarquable } from "./core/valeursRemarquables.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuadrantVR } from "./components/EtapeQuadrantVR";
import { EtapeAnglePremierQuadrantVR } from "./components/EtapeAnglePremierQuadrantVR";
import { EtapeValeursExactesVR } from "./components/EtapeValeursExactesVR";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Détermine les valeurs trigonométriques remarquables de cet angle.";
import { libelleQuadrant } from "./ui/formatCercleTrigonometrique";
import { formatEnonceCercleTrigLatex } from "./ui/formatValeursRemarquables";
import { Katex } from "./components/Katex";
import { calculerRecapitulatifValeursRemarquables } from "./ui/recapitulatifValeursRemarquables";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionValeursRemarquables {
  return demarrerSessionValeursRemarquables(REGLAGES_DEMO, genererExerciceValeursRemarquables);
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases du
 * générateur (voir `PhaseValeursRemarquables`/les branches de `terminerEtape` ci-dessous). */
const ORDRE_PHASES: PhaseValeursRemarquables[] = ["quadrant", "anglePremierQuadrant", "valeursExactes"];

/** Même ternaire que `terminerEtape` (ci-dessous) et `recapitulatifValeursRemarquables.ts` pour lire
 * `scoreXxxExercice`/`xxxRevele` — jamais une valeur recalculée séparément. `valeursExactes`
 * (dernière phase) n'a pas de score tracké dans `EtatSessionValeursRemarquables` : tant que
 * l'exercice n'est pas terminé elle est forcément "courante" (dernière phase active), et une fois
 * terminé un nouvel exercice démarre (l'état entier est remis à zéro). */
function calculerSegmentsProgression(etat: EtatSessionValeursRemarquables): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = phase === "quadrant" ? etat.scoreQuadrantExercice : phase === "anglePremierQuadrant" ? etat.scoreAnglePremierQuadrantExercice : null;
    if (score === null) return "a-venir";
    const revele = phase === "quadrant" ? etat.quadrantRevele : etat.anglePremierQuadrantRevele;
    if (revele) return "revele";
    const aideUtilisee = phase === "quadrant" ? etat.aideQuadrantUtilisee : etat.aideAnglePremierQuadrantUtilisee;
    return aideUtilisee ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionValeursRemarquables;
  revele: boolean;
}

export function AppValeursRemarquables() {
  const [etat, setEtat] = useState<EtatSessionValeursRemarquables>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionValeursRemarquables`, jamais dans le moteur (voir
   * AppAnalyseFonction.tsx). Remis à vide à chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Même mécanisme que AppAnalyseFonction.tsx::ajouterHistorique — réutilise
   * `calculerRecapitulatifValeursRemarquables` pour la réponse ATTENDUE ; cette fonction ne produit
   * jamais d'entrée pour "valeursExactes" (dernière phase), comme ailleurs sur ce chantier. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionValeursRemarquables) {
    const recap = calculerRecapitulatifValeursRemarquables(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      { titre: derniere.libelle, votreReponse, correcte: !derniere.revele, reponseAttendue: derniere.revele ? derniere.valeur : undefined },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (voir le commentaire détaillé
   * de AppAnalyseFonction.tsx::terminerEtape, même garde reproduit ici à l'identique). */
  function terminerEtape(nouvelEtat: EtatSessionValeursRemarquables, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      const revele =
        etat.phase === "quadrant"
          ? nouvelEtat.quadrantRevele
          : etat.phase === "anglePremierQuadrant"
            ? nouvelEtat.anglePremierQuadrantRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.valeursExactesRevele;
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

  function forcerVariante(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setEtat(demarrerSessionValeursRemarquables(REGLAGES_DEMO, () => construireAvecVarianteId(Number(varianteId) as AngleRemarquable)));
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifValeursRemarquables(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : etat.phase === "quadrant" ? (
          <>Quadrant attendu : {libelleQuadrant(exercice.quadrant)}</>
        ) : etat.phase === "anglePremierQuadrant" ? (
          <>Angle du premier quadrant attendu : {exercice.anglePremierQuadrant}°</>
        ) : (
          <>
            Valeurs attendues : sin(θ) = <Katex expression={exercice.sinLatex} /> ; cos(θ) = <Katex expression={exercice.cosLatex} /> ;
            tan(θ) = {exercice.tanLatex === "n'existe pas" ? "n'existe pas" : <Katex expression={exercice.tanLatex} />}
          </>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Valeurs trigonométriques remarquables</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES.map((v) => ({ id: String(v.id), label: v.label }))} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={formatEnonceCercleTrigLatex(exercice.angleDepart)} block />
              </div>
            }
          />
          {etat.phase === "quadrant" ? (
            <EtapeQuadrantVR
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideQuadrantUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(quadrant) => terminerEtape(soumettreReponseQuadrant(etat, quadrant), libelleQuadrant(quadrant))}
              validation={validation}
            />
          ) : etat.phase === "anglePremierQuadrant" ? (
            <EtapeAnglePremierQuadrantVR
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideAnglePremierQuadrantUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(valeur) => terminerEtape(soumettreReponseAnglePremierQuadrant(etat, valeur), `${valeur}°`)}
              validation={validation}
            />
          ) : (
            <EtapeValeursExactesVR
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideValeursExactesUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseValeursExactes(etat, reponse))}
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
