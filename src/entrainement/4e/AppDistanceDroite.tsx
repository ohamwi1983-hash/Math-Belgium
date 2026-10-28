import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDistanceDroite } from "./generateurs/distanceDroite";
import type { VarianteDistanceDroite } from "./core/distanceDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import {
  activerAideSuivante,
  demarrerSessionDistanceDroite,
  soumettreReponseChoixPoint,
  soumettreReponseDistancePQ,
  soumettreReponseEquationB,
  soumettreReponseIntersectionQ,
} from "./moteur/sessionDistanceDroite";
import type { EtatSessionDistanceDroite, PhaseDistanceDroite } from "./moteur/typesDistanceDroite";
import { EtapeChoixPointDistanceDroite } from "./components/EtapeChoixPointDistanceDroite";
import { EtapeDistancePQDistanceDroite } from "./components/EtapeDistancePQDistanceDroite";
import { EtapeEquationBDistanceDroite } from "./components/EtapeEquationBDistanceDroite";
import { EtapeIntersectionQDistanceDroite } from "./components/EtapeIntersectionQDistanceDroite";
import { Katex } from "./components/Katex";
import { formatEquationImpliciteLatex, formatPointLatex } from "./ui/formatEquationDroite";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifDistanceDroite } from "./ui/recapitulatifDistanceDroite";
import { formatAideDistancePQNiveau2Latex, formatAideIntersectionQNiveau2Latex, formatDistanceAttendueLatex, formatEnonceLatex } from "./ui/formatDistanceDroite";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionDistanceDroite {
  return demarrerSessionDistanceDroite(REGLAGES_DEMO, genererExerciceDistanceDroite);
}

/** Séquence réelle de phases pour CET exercice — `"choixPoint"` n'a jamais lieu pour la variante
 * "point" (voir le commentaire de `PhaseDistanceDroite` dans `typesDistanceDroite.ts`). */
function sequencePourExercice(exercice: { variante: VarianteDistanceDroite }): PhaseDistanceDroite[] {
  return exercice.variante === "paralleles"
    ? ["choixPoint", "equationB", "intersectionQ", "distancePQ"]
    : ["equationB", "intersectionQ", "distancePQ"];
}

function calculerSegmentsProgression(etat: EtatSessionDistanceDroite): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "choixPoint" ? etat.choixPointRevele : phase === "equationB" ? etat.equationBRevele : etat.intersectionQRevele;
    if (revele) return "revele";
    const niveauAide = phase === "choixPoint" ? etat.niveauAideChoixPoint : phase === "equationB" ? etat.niveauAideEquationB : etat.niveauAideIntersectionQ;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDistanceDroite;
  revele: boolean;
}

export function AppDistanceDroite() {
  const [etat, setEtat] = useState<EtatSessionDistanceDroite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionDistanceDroite) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "choixPoint"
          ? nouvelEtat.choixPointRevele
          : etat.phase === "equationB"
            ? nouvelEtat.equationBRevele
            : etat.phase === "intersectionQ"
              ? nouvelEtat.intersectionQRevele
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.distancePQRevele;
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
  const recapitulatif = calculerRecapitulatifDistanceDroite(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionDistanceDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteDistanceDroite)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "choixPoint" ? (
            <>Une réponse possible : <Katex expression={formatEnonceLatex(exercice)} /></>
          ) : etat.phase === "equationB" ? (
            <>
              Équation attendue :{" "}
              <Katex expression={formatEquationImpliciteLatex(etat.bAttendue!.a, etat.bAttendue!.b, etat.bAttendue!.c)} />
            </>
          ) : etat.phase === "intersectionQ" ? (
            <>
              Q attendu : <Katex expression={`Q${formatPointLatex(etat.qAttendu!)}`} />
              <br />
              Méthode : <Katex expression={formatAideIntersectionQNiveau2Latex(etat.bAttendue!, etat.droiteCible!)} />
            </>
          ) : (
            <>
              Distance attendue : <Katex expression={formatDistanceAttendueLatex(exercice.distance)} />
              <br />
              Méthode : <Katex expression={formatAideDistancePQNiveau2Latex(etat.point!, etat.qAttendu!)} />
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
        <h1 className="app-title">Distance point-droite et droite-droite (méthode géométrique)</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {etat.phase === "distancePQ" && <CalculatriceScientifique />}
        {etat.phase === "choixPoint" && exercice.variante === "paralleles" ? (
          <EtapeChoixPointDistanceDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideChoixPoint}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseChoixPoint(etat, reponse))}
            validation={validation}
          />
        ) : etat.phase === "equationB" && etat.point !== null && etat.droiteCible !== null && etat.bAttendue !== null ? (
          <EtapeEquationBDistanceDroite
            exercice={exercice}
            point={etat.point}
            droiteCible={etat.droiteCible}
            bAttendue={etat.bAttendue}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideEquationB}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseEquationB(etat, reponse))}
            validation={validation}
          />
        ) : etat.phase === "intersectionQ" && etat.point !== null && etat.bAttendue !== null && etat.droiteCible !== null && etat.qAttendu !== null ? (
          <EtapeIntersectionQDistanceDroite
            exercice={exercice}
            point={etat.point}
            bAttendue={etat.bAttendue}
            droiteCible={etat.droiteCible}
            qAttendu={etat.qAttendu}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideIntersectionQ}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseIntersectionQ(etat, reponse))}
            validation={validation}
          />
        ) : etat.phase === "distancePQ" && etat.point !== null && etat.droiteCible !== null && etat.bAttendue !== null && etat.qAttendu !== null ? (
          (() => {
            const { point, droiteCible, bAttendue, qAttendu } = etat;
            return (
              <EtapeDistancePQDistanceDroite
                exercice={exercice}
                point={point}
                droiteCible={droiteCible}
                bAttendue={bAttendue}
                qAttendu={qAttendu}
                tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                tentativesMax={etat.reglages.tentativesMax}
                niveauAide={etat.niveauAideDistancePQ}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseDistancePQ(etat, reponse))}
                validation={validation}
              />
            );
          })()
        ) : null}
        </div>
      </main>
    </div>
  );
}
