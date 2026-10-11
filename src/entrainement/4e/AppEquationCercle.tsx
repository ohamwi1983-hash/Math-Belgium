import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercle } from "./generateurs/equationCercle";
import type { VarianteEquationCercle } from "./core/equationCercle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionEquationCercle, soumettreReponseCentre, soumettreReponseEquation, soumettreReponseRayon } from "./moteur/sessionEquationCercle";
import type { EtatSessionEquationCercle, PhaseEquationCercle } from "./moteur/typesEquationCercle";
import { EtapeCentreEquationCercle } from "./components/EtapeCentreEquationCercle";
import { EtapeEquationEquationCercle } from "./components/EtapeEquationEquationCercle";
import { EtapeRayonEquationCercle } from "./components/EtapeRayonEquationCercle";
import { Katex } from "./components/Katex";
import { formatEquationAttendueLatex, formatEtatActuelCentreLatex } from "./ui/formatEquationCercle";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationCercle {
  return demarrerSessionEquationCercle(REGLAGES_DEMO, genererExerciceEquationCercle);
}

const LIBELLE_PHASE: Record<PhaseEquationCercle, string> = {
  centre: "Centre du cercle",
  rayon: "Rayon du cercle",
  equation: "Équation du cercle",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationCercle;
  revele: boolean;
}

export function AppEquationCercle() {
  const [etat, setEtat] = useState<EtatSessionEquationCercle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEquationCercle) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "centre"
          ? nouvelEtat.centreRevele
          : etat.phase === "rayon"
            ? nouvelEtat.rayonRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.equationRevele;
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
    setEtat(demarrerSessionEquationCercle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteEquationCercle)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "centre" ? (
            <>Centre attendu : <Katex expression={formatEtatActuelCentreLatex(exercice)} /></>
          ) : etat.phase === "rayon" ? (
            <>Rayon attendu : <Katex expression={`R = ${exercice.rayon}`} /></>
          ) : (
            <>Équation attendue : <Katex expression={formatEquationAttendueLatex(exercice)} /></>
          ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équation d'un cercle (non développée) à partir d'un graphe</h1>
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
        {etat.phase === "centre" ? (
          <EtapeCentreEquationCercle
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCentre}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCentre(etat, reponse))}
            validation={validation}
          />
        ) : etat.phase === "rayon" ? (
          <EtapeRayonEquationCercle
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideRayon}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseRayon(etat, reponse))}
            validation={validation}
          />
        ) : (
          <EtapeEquationEquationCercle
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideEquation}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseEquation(etat, reponse))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
