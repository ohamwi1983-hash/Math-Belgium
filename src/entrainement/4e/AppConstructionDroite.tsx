import { useState, type ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConstructionDroite } from "./generateurs/constructionDroite";
import type { VarianteConstructionDroite } from "./core/constructionDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionConstructionDroite, soumettreReponsePoints, soumettreReponseTrace } from "./moteur/sessionConstructionDroite";
import type { EtatSessionConstructionDroite, PhaseConstructionDroite } from "./moteur/typesConstructionDroite";
import { EtapePointsConstructionDroite } from "./components/EtapePointsConstructionDroite";
import { EtapeTraceConstructionDroite } from "./components/EtapeTraceConstructionDroite";
import { Katex } from "./components/Katex";
import { formatEtatActuelPointsLatex } from "./ui/formatConstructionDroite";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifConstructionDroite } from "./ui/recapitulatifConstructionDroite";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import type { ExerciceConstructionDroite } from "./core/constructionDroite.types";
import type { Point } from "./core/vecteur.types";
import type { ReponsePoints } from "./moteur/verificationConstructionDroite";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionConstructionDroite {
  return demarrerSessionConstructionDroite(REGLAGES_DEMO, genererExerciceConstructionDroite);
}

const ORDRE_PHASES: PhaseConstructionDroite[] = ["points", "trace"];

function calculerSegmentsProgression(etat: EtatSessionConstructionDroite): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    if (etat.pointsRevele) return "revele";
    return etat.niveauAidePoints > 0 ? "aide" : "correcte";
  });
}

const TITRES_ECRANS: Record<PhaseConstructionDroite, string> = {
  points: "Points trouvés",
  trace: "Points placés",
};

/** Nombre saisi tel que lu par l'écran — « ? » s'il était illisible. */
function coordonnee(valeur: number): string {
  return Number.isFinite(valeur) ? String(valeur).replace(".", ",") : "?";
}

function saisiePoints(reponse: ReponsePoints): ReactNode {
  return `(${coordonnee(reponse.x1)} ; ${coordonnee(reponse.y1)}) et (${coordonnee(reponse.x2)} ; ${coordonnee(reponse.y2)})`;
}

function saisieTrace(reponse: { p1: Point; p2: Point }): ReactNode {
  return `(${coordonnee(reponse.p1.x)} ; ${coordonnee(reponse.p1.y)}) et (${coordonnee(reponse.p2.x)} ; ${coordonnee(reponse.p2.y)})`;
}

/** Réponse attendue de l'écran — VALEUR seule (le libellé « Réponse attendue » est déjà affiché par
 * `ValidationEcran`/`FicheReponseEcran`). Écran "trace" : les 2 points à placer (`cible1`/`cible2`),
 * plus l'équation de départ, qui n'était pas une réponse (audit chapitre 7). */
function construireReponseAttendue(exercice: ExerciceConstructionDroite, phase: PhaseConstructionDroite, cible1: Point | null, cible2: Point | null): ReactNode {
  if (phase === "points" || cible1 === null || cible2 === null) {
    return <Katex expression={formatEtatActuelPointsLatex(exercice.point, { x: exercice.point.x + exercice.vecteur.x, y: exercice.point.y + exercice.vecteur.y })} />;
  }
  return <Katex expression={formatEtatActuelPointsLatex(cible1, cible2)} />;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionConstructionDroite;
  revele: boolean;
}

export function AppConstructionDroite() {
  const [etat, setEtat] = useState<EtatSessionConstructionDroite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — un écran clos = une
   * entrée, dans l'ordre de `ORDRE_PHASES` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice » (audit chapitre 7,
   * point 2). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionConstructionDroite, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = etat.phase === "points" ? nouvelEtat.pointsRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.traceRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      setHistorique((h) => [
        ...h,
        {
          titre: TITRES_ECRANS[etat.phase],
          votreReponse,
          correcte: !revele,
          reponseAttendue: construireReponseAttendue(etat.exerciceCourant, etat.phase, etat.cible1, etat.cible2),
        },
      ]);
      return;
    }
    setEtat(nouvelEtat);
  }

  function reinitialiserHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) reinitialiserHistorique();
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifConstructionDroite(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionConstructionDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteConstructionDroite)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: construireReponseAttendue(exercice, etat.phase, etat.cible1, etat.cible2),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Construction graphique — tracer une droite</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {etat.phase === "points" ? (
          <EtapePointsConstructionDroite
            key={`${numeroExercice}-points`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAidePoints}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponsePoints(etat, reponse), saisiePoints(reponse))}
            validation={validation}
          />
        ) : etat.cible1 !== null && etat.cible2 !== null ? (
          <EtapeTraceConstructionDroite
            key={`${numeroExercice}-trace`}
            exercice={exercice}
            cible1={etat.cible1}
            cible2={etat.cible2}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideTrace}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseTrace(etat, reponse), saisieTrace(reponse))}
            validation={validation}
          />
        ) : null}
        </div>
      </main>
      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
