import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercleDeveloppee } from "./generateurs/equationCercleDeveloppee";
import type { VarianteEquationCercleDeveloppee } from "./core/equationCercleDeveloppee.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import {
  activerAideSuivante,
  demarrerSessionEquationCercleDeveloppee,
  soumettreReponseCentreRayon,
  soumettreReponseCompletion,
  soumettreReponseRegroupement,
} from "./moteur/sessionEquationCercleDeveloppee";
import type { EtatSessionEquationCercleDeveloppee, PhaseEquationCercleDeveloppee } from "./moteur/typesEquationCercleDeveloppee";
import { EtapeCentreRayonEquationCercleDeveloppee } from "./components/EtapeCentreRayonEquationCercleDeveloppee";
import { EtapeCompletionEquationCercleDeveloppee } from "./components/EtapeCompletionEquationCercleDeveloppee";
import { EtapeRegroupementEquationCercleDeveloppee } from "./components/EtapeRegroupementEquationCercleDeveloppee";
import { Katex } from "./components/Katex";
import { formatCentreAttenduLatex, formatCompletionLatex, formatRayonAttenduLatex, formatRegroupementLatex } from "./ui/formatEquationCercleDeveloppee";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationCercleDeveloppee {
  return demarrerSessionEquationCercleDeveloppee(REGLAGES_DEMO, genererExerciceEquationCercleDeveloppee);
}

const LIBELLE_PHASE: Record<PhaseEquationCercleDeveloppee, string> = {
  regroupement: "Regroupement et factorisation",
  completion: "Complétion du carré",
  centreRayon: "Centre et rayon",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationCercleDeveloppee;
  revele: boolean;
}

export function AppEquationCercleDeveloppee() {
  const [etat, setEtat] = useState<EtatSessionEquationCercleDeveloppee>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEquationCercleDeveloppee) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "regroupement"
          ? nouvelEtat.regroupementRevele
          : etat.phase === "completion"
            ? nouvelEtat.completionRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.centreRayonRevele;
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

  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionEquationCercleDeveloppee(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteEquationCercleDeveloppee)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "regroupement" ? (
            <>Regroupement attendu : <Katex expression={formatRegroupementLatex(exercice)} /></>
          ) : etat.phase === "completion" ? (
            <>Complétion attendue : <Katex expression={formatCompletionLatex(exercice)} /></>
          ) : (
            <>
              Centre attendu : <Katex expression={formatCentreAttenduLatex(exercice)} /> — Rayon attendu :{" "}
              <Katex expression={`R = ${formatRayonAttenduLatex(exercice)}`} />
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
        <h1 className="app-title">Centre et rayon d'un cercle depuis l'équation développée</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        {etat.phase === "centreRayon" && exercice.variante === "irrationnel" && <CalculatriceScientifique />}
        {etat.phase === "regroupement" ? (
          <EtapeRegroupementEquationCercleDeveloppee
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideRegroupement}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseRegroupement(etat, reponse))}
            validation={validation}
          />
        ) : etat.phase === "completion" ? (
          <EtapeCompletionEquationCercleDeveloppee
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCompletion}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCompletion(etat, reponse))}
            validation={validation}
          />
        ) : (
          <EtapeCentreRayonEquationCercleDeveloppee
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCentreRayon}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCentreRayon(etat, reponse))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
