import { useState } from "react";
import type { ReactNode } from "react";
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
import type { ExerciceDistanceDroite } from "./core/distanceDroite.types";
import type { Point } from "./core/vecteur.types";
import { EtapeChoixPointDistanceDroite } from "./components/EtapeChoixPointDistanceDroite";
import { EtapeDistancePQDistanceDroite } from "./components/EtapeDistancePQDistanceDroite";
import { EtapeEquationBDistanceDroite } from "./components/EtapeEquationBDistanceDroite";
import { EtapeIntersectionQDistanceDroite } from "./components/EtapeIntersectionQDistanceDroite";
import { Katex } from "./components/Katex";
import { formatPointLatex } from "./ui/formatEquationDroite";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifDistanceDroite } from "./ui/recapitulatifDistanceDroite";
import { formatAideDistancePQNiveau2Latex, formatAideIntersectionQNiveau2Latex, formatDistanceAttendueLatex, formatEquationDroiteLatex } from "./ui/formatDistanceDroite";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";

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

/** Titre de la fiche de consultation — mêmes libellés que le récapitulatif
 * (`ui/recapitulatifDistanceDroite.ts`). */
const TITRES_ECRANS: Record<PhaseDistanceDroite, string> = {
  choixPoint: "Point choisi",
  equationB: "Équation de b",
  intersectionQ: "Point Q",
  distancePQ: "Distance PQ",
};

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue » (audit chapitre 7, point 5 : « Réponse
 * attendue : Distance attendue : 30 »). `pointSuivant` : écran « choisir un point », le point
 * RÉELLEMENT retenu pour la suite (celui de l'élève, ou le repli tiré par le moteur) — jamais le
 * système {d₁ ; d₂} affiché auparavant (point 28). */
function construireReponseAttendue(etat: EtatSessionDistanceDroite, exercice: ExerciceDistanceDroite, phase: PhaseDistanceDroite, pointSuivant: Point | null): ReactNode {
  if (phase === "choixPoint") {
    return pointSuivant ? (
      <>
        par exemple <Katex expression={`P${formatPointLatex(pointSuivant)}`} />
      </>
    ) : null;
  }
  if (phase === "equationB") return <Katex expression={`b \\equiv ${formatEquationDroiteLatex(etat.bAttendue!)}`} />;
  if (phase === "intersectionQ") {
    return (
      <>
        <Katex expression={`Q${formatPointLatex(etat.qAttendu!)}`} />
        <br />
        Méthode : <Katex expression={formatAideIntersectionQNiveau2Latex(etat.bAttendue!, etat.droiteCible!)} />
      </>
    );
  }
  return (
    <>
      <Katex expression={`PQ = ${formatDistanceAttendueLatex(exercice.distanceCarree)}`} />
      <br />
      Méthode : <Katex expression={formatAideDistancePQNiveau2Latex(etat.point!, etat.qAttendu!)} />
    </>
  );
}

/** Saisie libre de l'élève, telle quelle — champ vide affiché « — ». */
function saisieBrute(texte: string): string {
  return texte.trim() === "" ? "—" : texte;
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
  /** Consultation en lecture seule des écrans clos (puces cliquables) — un écran clos = une entrée,
   * dans l'ordre de `sequencePourExercice` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Entre dans la `key` des écrans : aucune saisie ne survit à « Générer » ou « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionDistanceDroite, votreReponse: ReactNode) {
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
      setHistorique((h) => [
        ...h,
        {
          titre: TITRES_ECRANS[etat.phase],
          votreReponse,
          correcte: !revele,
          reponseAttendue: construireReponseAttendue(etat, etat.exerciceCourant, etat.phase, nouvelEtat.point),
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
  const recapitulatif = calculerRecapitulatifDistanceDroite(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionDistanceDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteDistanceDroite)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: construireReponseAttendue(etat, exercice, etat.phase, enAttente.etatSuivant.point),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;
  const cle = `${numeroExercice}-${etat.phase}`;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Distance point-droite et droite-droite (méthode géométrique)</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {etat.phase === "distancePQ" && <CalculatriceScientifique />}
        {etat.phase === "choixPoint" && exercice.variante === "paralleles" ? (
          <EtapeChoixPointDistanceDroite
            key={cle}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideChoixPoint}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse, saisie) =>
              terminerEtape(soumettreReponseChoixPoint(etat, reponse), `P(${saisieBrute(saisie.x)} ; ${saisieBrute(saisie.y)})`)
            }
            validation={validation}
          />
        ) : etat.phase === "equationB" && etat.point !== null && etat.droiteCible !== null && etat.bAttendue !== null ? (
          <EtapeEquationBDistanceDroite
            key={cle}
            exercice={exercice}
            point={etat.point}
            droiteCible={etat.droiteCible}
            bAttendue={etat.bAttendue}
            qAttendu={etat.qAttendu!}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideEquationB}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseEquationB(etat, reponse), saisieBrute(reponse))}
            validation={validation}
          />
        ) : etat.phase === "intersectionQ" && etat.point !== null && etat.bAttendue !== null && etat.droiteCible !== null && etat.qAttendu !== null ? (
          <EtapeIntersectionQDistanceDroite
            key={cle}
            exercice={exercice}
            point={etat.point}
            bAttendue={etat.bAttendue}
            droiteCible={etat.droiteCible}
            qAttendu={etat.qAttendu}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideIntersectionQ}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse, saisie) =>
              terminerEtape(soumettreReponseIntersectionQ(etat, reponse), `Q(${saisieBrute(saisie.x)} ; ${saisieBrute(saisie.y)})`)
            }
            validation={validation}
          />
        ) : etat.phase === "distancePQ" && etat.point !== null && etat.droiteCible !== null && etat.bAttendue !== null && etat.qAttendu !== null ? (
          (() => {
            const { point, droiteCible, bAttendue, qAttendu } = etat;
            return (
              <EtapeDistancePQDistanceDroite
                key={cle}
                exercice={exercice}
                point={point}
                droiteCible={droiteCible}
                bAttendue={bAttendue}
                qAttendu={qAttendu}
                tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                tentativesMax={etat.reglages.tentativesMax}
                niveauAide={etat.niveauAideDistancePQ}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseDistancePQ(etat, reponse), saisieBrute(reponse))}
                validation={validation}
              />
            );
          })()
        ) : null}
        </div>
      </main>
      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
