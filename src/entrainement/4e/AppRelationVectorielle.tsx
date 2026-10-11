import { useState } from "react";
import type { ExerciceRelationGeneraleRV } from "./core/relationVectorielle.types";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionRelationVectorielle, soumettreReponseCoordonnees, soumettreReponseTraduction } from "./moteur/sessionRelationVectorielle";
import type { EtatSessionRelationVectorielle, PhaseRelationVectorielle } from "./moteur/typesRelationVectorielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelationVectorielle } from "./generateurs/relationVectorielle";
import type { VarianteRelationVectorielle } from "./core/relationVectorielle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeTranslationVectorielle } from "./components/EtapeTranslationVectorielle";
import { EtapeTraductionRelationVectorielle } from "./components/EtapeTraductionRelationVectorielle";
import { EtapeCoordonneesRelationVectorielle } from "./components/EtapeCoordonneesRelationVectorielle";
import { formatTraductionAttendueLatex } from "./ui/formatRelationVectorielle";
import { Katex } from "./components/Katex";
import { calculerRecapitulatifRelationVectorielle } from "./ui/recapitulatifRelationVectorielle";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionRelationVectorielle {
  return demarrerSessionRelationVectorielle(REGLAGES_DEMO, genererExerciceRelationVectorielle);
}

const LIBELLE_PHASE: Record<PhaseRelationVectorielle, string> = {
  traduction: "Traduction en coordonnées",
  coordonnees: "Coordonnées",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionRelationVectorielle;
  revele: boolean;
}

/**
 * "Point à partir d'une relation vectorielle" — version GUIDÉE (position 20, remplace "Problèmes
 * contextualisés"). Distincte du générateur homonyme en position 21 (`AppPointVectoriel.tsx`) — voir
 * `core/relationVectorielle.types.ts` pour la justification de cette coexistence assumée. Le
 * sous-titre ("version guidée") est la seule différence visible sur l'écran d'accueil entre les deux
 * générateurs, dont le libellé de bouton diffère aussi ("(guidée)", `src/App.tsx`).
 */
export function AppRelationVectorielle() {
  const [etat, setEtat] = useState<EtatSessionRelationVectorielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionRelationVectorielle) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "traduction" ? nouvelEtat.traductionRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.coordonneesRevele;
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

  function forcerVariante(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionRelationVectorielle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteRelationVectorielle)));
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifRelationVectorielle(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : etat.phase === "traduction" ? (
          <Katex expression={formatTraductionAttendueLatex(exercice as ExerciceRelationGeneraleRV)} />
        ) : (
          <>
            {exercice.pointCherche} attendu : ({exercice.reponse.x} ; {exercice.reponse.y})
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
        <h1 className="app-title">Point à partir d'une relation vectorielle</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel (version guidée)</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        {exercice.variante === "translation" ? (
          <EtapeTranslationVectorielle
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(x, y) => terminerEtape(soumettreReponseCoordonnees(etat, x, y))}
            validation={validation}
          />
        ) : etat.phase === "traduction" ? (
          <EtapeTraductionRelationVectorielle
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseTraduction(etat, texte))}
            validation={validation}
          />
        ) : (
          <EtapeCoordonneesRelationVectorielle
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            recapitulatif={recapitulatif}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(x, y) => terminerEtape(soumettreReponseCoordonnees(etat, x, y))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
