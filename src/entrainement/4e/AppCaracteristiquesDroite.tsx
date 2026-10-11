import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCaracteristiquesDroite } from "./generateurs/caracteristiquesDroite";
import type { VarianteCaracteristiquesDroite } from "./core/caracteristiquesDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionCaracteristiquesDroite, soumettreReponseCaracteristiques, soumettreReponseExtraction } from "./moteur/sessionCaracteristiquesDroite";
import type { EtatSessionCaracteristiquesDroite, PhaseCaracteristiquesDroite } from "./moteur/typesCaracteristiquesDroite";
import { EtapeCaracteristiquesDroite } from "./components/EtapeCaracteristiquesDroite";
import { EtapeExtractionCaracteristiquesDroite } from "./components/EtapeExtractionCaracteristiquesDroite";
import { Katex } from "./components/Katex";
import { formatCaracteristiquesAttenduesLatex, formatEtatActuelPointVecteurLatex } from "./ui/formatCaracteristiquesDroite";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionCaracteristiquesDroite {
  return demarrerSessionCaracteristiquesDroite(REGLAGES_DEMO, genererExerciceCaracteristiquesDroite);
}

const LIBELLE_PHASE: Record<PhaseCaracteristiquesDroite, string> = {
  extraction: "Extraction du point et du vecteur directeur",
  caracteristiques: "Pente ou angle, et ordonnée à l'origine",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCaracteristiquesDroite;
  revele: boolean;
}

export function AppCaracteristiquesDroite() {
  const [etat, setEtat] = useState<EtatSessionCaracteristiquesDroite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionCaracteristiquesDroite) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "extraction" ? nouvelEtat.extractionRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.caracteristiquesRevele;
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

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionCaracteristiquesDroite(REGLAGES_DEMO, () => construireAvecVarianteId(id as VarianteCaracteristiquesDroite)));
  }

  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : etat.phase === "extraction" ? (
          <Katex expression={formatEtatActuelPointVecteurLatex(exercice)} />
        ) : (
          <Katex expression={formatCaracteristiquesAttenduesLatex(exercice)} />
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Caractéristiques d'une droite</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        {etat.phase === "extraction" ? (
          <EtapeExtractionCaracteristiquesDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideExtraction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseExtraction(etat, reponse))}
            validation={validation}
          />
        ) : (
          <EtapeCaracteristiquesDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCaracteristiques}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCaracteristiques(etat, reponse))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
