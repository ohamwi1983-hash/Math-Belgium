import { useState, type ReactNode } from "react";
import type { OrientationParabole } from "./core/equationParabole.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParaboleDeveloppee } from "./generateurs/equationParaboleDeveloppee";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionEquationParaboleDeveloppee,
  soumettreReponseCaracteristiques,
  soumettreReponseCompletion,
  soumettreReponseRegroupement,
} from "./moteur/sessionEquationParaboleDeveloppee";
import type { EtatSessionEquationParaboleDeveloppee, PhaseEquationParaboleDeveloppee } from "./moteur/typesEquationParaboleDeveloppee";
import { EtapeCaracteristiquesEquationParaboleDeveloppee } from "./components/EtapeCaracteristiquesEquationParaboleDeveloppee";
import { EtapeCompletionEquationParaboleDeveloppee } from "./components/EtapeCompletionEquationParaboleDeveloppee";
import { EtapeRegroupementEquationParaboleDeveloppee } from "./components/EtapeRegroupementEquationParaboleDeveloppee";
import { Katex } from "./components/Katex";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifEquationParaboleDeveloppee } from "./ui/recapitulatifEquationParaboleDeveloppee";
import { formatCompletionLatex, formatDirectriceLatex, formatFoyerLatex, formatRegroupementLatex, formatSommetLatex } from "./ui/formatEquationParaboleDeveloppee";
import type { ExerciceEquationParaboleDeveloppee } from "./core/equationParaboleDeveloppee.types";
import type { ReponseEcranCaracteristiques } from "./moteur/typesEquationParaboleDeveloppee";
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

function nouvelleSession(): EtatSessionEquationParaboleDeveloppee {
  return demarrerSessionEquationParaboleDeveloppee(REGLAGES_DEMO, genererExerciceEquationParaboleDeveloppee);
}

/** 3 phases fixes, toujours le même ordre — "caracteristiques" (dernière phase) n'a jamais besoin
 * de sa propre branche "close" : jamais consultée comme phase passée. Puces cliquables : chaque
 * écran clos ouvre sa fiche de consultation (`FicheReponseEcran`, même patron que gen5/gen37). */
const ORDRE_PHASES: PhaseEquationParaboleDeveloppee[] = ["regroupement", "completion", "caracteristiques"];

function calculerSegmentsProgression(etat: EtatSessionEquationParaboleDeveloppee): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "regroupement" ? etat.regroupementRevele : etat.completionRevele;
    if (revele) return "revele";
    const niveauAide = phase === "regroupement" ? etat.niveauAideRegroupement : etat.niveauAideCompletion;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationParaboleDeveloppee;
  revele: boolean;
}

/** Mêmes libellés que le récapitulatif (`ui/recapitulatifEquationParaboleDeveloppee.ts`). */
const TITRES_ECRANS: Record<PhaseEquationParaboleDeveloppee, string> = {
  regroupement: "Regroupement",
  completion: "Complétion du carré",
  caracteristiques: "Caractéristiques",
};

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue » (jamais « Regroupement attendu : » en
 * double). */
function construireReponseAttendue(exercice: ExerciceEquationParaboleDeveloppee, phase: PhaseEquationParaboleDeveloppee): ReactNode {
  if (phase === "regroupement") return <Katex expression={formatRegroupementLatex(exercice)} />;
  if (phase === "completion") return <Katex expression={formatCompletionLatex(exercice)} />;
  return (
    <Katex
      expression={`S${formatSommetLatex(exercice.sommet)} \\quad F${formatFoyerLatex(exercice.foyer)} \\quad p = ${exercice.p} \\quad d \\equiv ${formatDirectriceLatex(exercice)}`}
    />
  );
}

function nombreSaisi(valeur: number): string {
  return Number.isFinite(valeur) ? String(valeur).replace(".", ",") : "?";
}

function caracteristiquesSaisies(reponse: ReponseEcranCaracteristiques): ReactNode {
  return (
    <>
      <p>
        S({nombreSaisi(reponse.sx)} ; {nombreSaisi(reponse.sy)}) — F({nombreSaisi(reponse.fx)} ; {nombreSaisi(reponse.fy)}) — p = {nombreSaisi(reponse.p)}
      </p>
      <p>Directrice : {saisieBrute(reponse.directrice)}</p>
    </>
  );
}

/** Saisie libre de l'élève, telle quelle (jamais réinterprétée) — champ vide affiché « — ». */
function saisieBrute(texte: string): ReactNode {
  return texte.trim() === "" ? "—" : texte;
}

export function AppEquationParaboleDeveloppee() {
  const [etat, setEtat] = useState<EtatSessionEquationParaboleDeveloppee>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — tenue ici, jamais dans le
   * moteur ; un écran clos = une entrée, dans l'ordre de `ORDRE_PHASES` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionEquationParaboleDeveloppee, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "regroupement"
          ? nouvelEtat.regroupementRevele
          : etat.phase === "completion"
            ? nouvelEtat.completionRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.caracteristiquesRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      setHistorique((h) => [
        ...h,
        { titre: TITRES_ECRANS[etat.phase], votreReponse, correcte: !revele, reponseAttendue: construireReponseAttendue(etat.exerciceCourant, etat.phase) },
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

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionEquationParaboleDeveloppee(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as OrientationParabole)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const recapitulatif = calculerRecapitulatifEquationParaboleDeveloppee(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: construireReponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Sommet, foyer, p et directrice d'une parabole depuis l'équation développée</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          {phase === "regroupement" ? (
            <EtapeRegroupementEquationParaboleDeveloppee
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideRegroupement}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseRegroupement(etat, reponse), saisieBrute(reponse))}
              validation={validation}
            />
          ) : phase === "completion" ? (
            <EtapeCompletionEquationParaboleDeveloppee
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCompletion}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCompletion(etat, reponse), saisieBrute(reponse))}
              validation={validation}
            />
          ) : (
            <EtapeCaracteristiquesEquationParaboleDeveloppee
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCaracteristiques}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCaracteristiques(etat, reponse), caracteristiquesSaisies(reponse))}
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
