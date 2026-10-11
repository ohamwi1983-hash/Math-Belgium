import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAideSuivante, demarrerSessionCombinaisonVecteurs, soumettreReponseComposantes, soumettreReponseSimplification } from "./moteur/sessionCombinaisonVecteurs";
import type { EtatSessionCombinaisonVecteurs, PhaseCombinaisonVecteurs } from "./moteur/typesCombinaisonVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCombinaisonVecteurs } from "./generateurs/combinaisonVecteurs";
import type { VarianteCombinaisonVecteurs } from "./core/combinaisonVecteurs.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSimplificationCombinaisonVecteurs } from "./components/EtapeSimplificationCombinaisonVecteurs";
import { EtapeComposantesCombinaisonVecteurs } from "./components/EtapeComposantesCombinaisonVecteurs";
import { Katex } from "./components/Katex";
import { formatEquationReduiteLatex, formatResultatLatex, formatVecteurColonneLatex } from "./ui/formatCombinaisonVecteurs";
import { calculerRecapitulatifCombinaisonVecteurs } from "./ui/recapitulatifCombinaisonVecteurs";

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

const LIBELLE_PHASE: Record<PhaseCombinaisonVecteurs, string> = {
  simplification: "Réduction symbolique",
  composantes: "Composantes",
};

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

  function terminerEtape(nouvelEtat: EtatSessionCombinaisonVecteurs) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "simplification" ? nouvelEtat.simplificationRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.composantesRevele;
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

  const recapitulatif = calculerRecapitulatifCombinaisonVecteurs(etat);
  const exercice = etat.exerciceCourant;

  function forcerVariante(id: string) {
    setEnAttente(null);
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
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        {etat.phase === "simplification" ? (
          <EtapeSimplificationCombinaisonVecteurs
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideSimplification}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseSimplification(etat, texte))}
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
    </div>
  );
}
