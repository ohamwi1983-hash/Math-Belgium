import { useRef, useState } from "react";
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

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionDistanceDroite {
  return demarrerSessionDistanceDroite(REGLAGES_DEMO, genererExerciceDistanceDroite);
}

const LIBELLE_PHASE: Record<PhaseDistanceDroite, string> = {
  choixPoint: "Choix d'un point sur la droite",
  equationB: "Équation de la perpendiculaire b",
  intersectionQ: "Coordonnées de Q",
  distancePQ: "Distance PQ",
};

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
  const phase = etat.phase;
  const recapitulatif = calculerRecapitulatifDistanceDroite(etat);

  /** `estPremierEcran` : vrai uniquement sur le premier écran vu pour CET `exercice` (voir
   * `EnTeteExercice.tsx`, option 1B "plein puis compact"). */
  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

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
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {etat.phase === "distancePQ" && <CalculatriceScientifique />}
        {etat.phase === "choixPoint" && exercice.variante === "paralleles" ? (
          <EtapeChoixPointDistanceDroite
            exercice={exercice}
            estPremierEcran={estPremierEcran}
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
            estPremierEcran={estPremierEcran}
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
            estPremierEcran={estPremierEcran}
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
                estPremierEcran={estPremierEcran}
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
