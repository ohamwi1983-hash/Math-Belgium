import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAideSuivante, demarrerSessionCombinaisonVecteurs, soumettreReponseComposantes, soumettreReponseSimplification } from "./moteur/sessionCombinaisonVecteurs";
import type { EtatSessionCombinaisonVecteurs, PhaseCombinaisonVecteurs } from "./moteur/typesCombinaisonVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCombinaisonVecteurs } from "./generateurs/combinaisonVecteurs";
import type { VarianteCombinaisonVecteurs } from "./core/combinaisonVecteurs.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSimplificationCombinaisonVecteurs } from "./components/EtapeSimplificationCombinaisonVecteurs";
import { EtapeComposantesCombinaisonVecteurs } from "./components/EtapeComposantesCombinaisonVecteurs";
import { Katex } from "./components/Katex";
import { formatEquationReduiteLatex, formatResultatLatex, formatTermesDonneesLatex, formatVecteurColonneLatex } from "./ui/formatCombinaisonVecteurs";
import { calculerRecapitulatifCombinaisonVecteurs } from "./ui/recapitulatifCombinaisonVecteurs";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Calcule les composantes de cette combinaison linéaire de vecteurs.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionCombinaisonVecteurs {
  return demarrerSessionCombinaisonVecteurs(REGLAGES_DEMO, genererExerciceCombinaisonVecteurs);
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases du
 * générateur (voir `PhaseCombinaisonVecteurs`/les branches de `terminerEtape` ci-dessous). */
const ORDRE_PHASES: PhaseCombinaisonVecteurs[] = ["simplification", "composantes"];

/** Même ternaire que `terminerEtape` (ci-dessous) et `recapitulatifCombinaisonVecteurs.ts` pour
 * lire `scoreXxxExercice`/`xxxRevele` — jamais une valeur recalculée séparément. "composantes"
 * (dernière phase) n'a pas de score tracké dans `EtatSessionCombinaisonVecteurs` : tant que
 * l'exercice n'est pas terminé elle est forcément "courante" (dernière phase active), et une fois
 * terminé un nouvel exercice démarre (l'état entier est remis à zéro). */
function calculerSegmentsProgression(etat: EtatSessionCombinaisonVecteurs): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = phase === "simplification" ? etat.scoreSimplificationExercice : null;
    if (score === null) return "a-venir";
    if (etat.simplificationRevele) return "revele";
    return etat.niveauAideSimplification > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCombinaisonVecteurs;
  revele: boolean;
}

/**
 * "Calcul de composantes de combinaisons linéaires" — **remplace en place** (même position, 22e
 * bouton) l'ancienne version plus simple de ce générateur (`promptcreationgenerateur21combinaisonslineaires.md`,
 * consultation utilisateur explicite face à un chevauchement de nom détecté avant implémentation —
 * voir CLAUDE.md et `core/combinaisonVecteurs.types.ts`).
 */
export function AppCombinaisonVecteurs() {
  const [etat, setEtat] = useState<EtatSessionCombinaisonVecteurs>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionCombinaisonVecteurs`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Appelé juste avant `terminerEtape`, avec l'état DÉJÀ mis à jour par `soumettreReponseXxx` —
   * réutilise `calculerRecapitulatifCombinaisonVecteurs` pour la réponse ATTENDUE (l'entrée qui
   * vient d'être ajoutée est toujours la dernière du tableau). Jamais appelée pour "composantes"
   * (dernière phase, clôture toujours immédiatement l'exercice — aucune entrée de récapitulatif, et
   * sa puce de progression n'est jamais "correcte"/"revele" dans `calculerSegmentsProgression`, donc
   * jamais cliquable — même convention que `AppAnalyseFonction.tsx`/"tableauSignes"). */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionCombinaisonVecteurs) {
    const recap = calculerRecapitulatifCombinaisonVecteurs(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * réellement (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde-fou que
   * `AppAnalyseFonction.tsx`, bug déjà rencontré et corrigé là-bas). */
  function terminerEtape(nouvelEtat: EtatSessionCombinaisonVecteurs, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      const revele =
        etat.phase === "simplification" ? nouvelEtat.simplificationRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.composantesRevele;
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

  const recapitulatif = calculerRecapitulatifCombinaisonVecteurs(etat);
  const exercice = etat.exerciceCourant;

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setEtat(demarrerSessionCombinaisonVecteurs(REGLAGES_DEMO, () => construireAvecVarianteId(id as VarianteCombinaisonVecteurs)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : etat.phase === "simplification" ? (
          <Katex expression={formatEquationReduiteLatex(exercice)} />
        ) : (
          <>
            <Katex expression={formatResultatLatex(exercice)} /> attendu{" "}
            <Katex expression={`= ${formatVecteurColonneLatex(exercice.reponse)}`} />
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
        <h1 className="app-title">Calcul de composantes de combinaisons linéaires</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice
          consigneGenerale={CONSIGNE_GENERALE}
          blocDonnees={
            <div className="equation-box equation-box-termes">
              {formatTermesDonneesLatex(exercice).map((terme, i) => (
                <Katex key={i} expression={terme} />
              ))}
            </div>
          }
        />
        {etat.phase === "simplification" ? (
          <EtapeSimplificationCombinaisonVecteurs
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideSimplification}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseSimplification(etat, texte), texte)}
            validation={validation}
          />
        ) : (
          <EtapeComposantesCombinaisonVecteurs
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideComposantes}
            recapitulatif={recapitulatif}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseComposantes(etat, reponse))}
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
