import { useState, type ReactNode } from "react";
import type { OrientationParabole } from "./core/equationParabole.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParabole } from "./generateurs/equationParabole";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionEquationParabole, soumettreReponseEquation, soumettreReponseSommetFoyer } from "./moteur/sessionEquationParabole";
import type { EtatSessionEquationParabole, PhaseEquationParabole } from "./moteur/typesEquationParabole";
import { EtapeEquationEquationParabole } from "./components/EtapeEquationEquationParabole";
import { EtapeSommetFoyerEquationParabole } from "./components/EtapeSommetFoyerEquationParabole";
import { Katex } from "./components/Katex";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifEquationParabole } from "./ui/recapitulatifEquationParabole";
import { formatEquationAttendueLatex, formatFoyerLatex, formatSommetLatex } from "./ui/formatEquationParabole";
import type { ReponseSommetFoyer } from "./moteur/verificationEquationParabole";
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

function nouvelleSession(): EtatSessionEquationParabole {
  return demarrerSessionEquationParabole(REGLAGES_DEMO, genererExerciceEquationParabole);
}

/** 2 phases fixes, toujours le même ordre — "equation" (dernière phase) n'a jamais besoin de sa
 * propre branche "close" : jamais consultée comme phase passée. Puces cliquables : l'écran clos
 * ouvre sa fiche de consultation (`FicheReponseEcran`, même patron que gen5/gen37/gen44). */
const ORDRE_PHASES: PhaseEquationParabole[] = ["sommetFoyer", "equation"];

function calculerSegmentsProgression(etat: EtatSessionEquationParabole): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    if (etat.sommetFoyerRevele) return "revele";
    return etat.niveauAideSommetFoyer > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationParabole;
  revele: boolean;
}

const TITRES_ECRANS: Record<PhaseEquationParabole, string> = {
  sommetFoyer: "Sommet et foyer",
  equation: "Équation",
};

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue » (jamais « Sommet attendu : » en double). */
function construireReponseAttendue(exercice: EtatSessionEquationParabole["exerciceCourant"], phase: PhaseEquationParabole): ReactNode {
  return phase === "sommetFoyer" ? (
    <Katex expression={`S${formatSommetLatex(exercice.sommet)} \\quad F${formatFoyerLatex(exercice.foyer)}`} />
  ) : (
    <Katex expression={formatEquationAttendueLatex(exercice)} />
  );
}

function sommetFoyerSaisis(reponse: ReponseSommetFoyer): ReactNode {
  return <Katex expression={`S${formatSommetLatex({ x: reponse.sx, y: reponse.sy })} \\quad F${formatFoyerLatex({ x: reponse.fx, y: reponse.fy })}`} />;
}

/** Saisie libre de l'élève, telle quelle (jamais réinterprétée) — champ vide affiché « — ». */
function saisieBrute(texte: string): ReactNode {
  return texte.trim() === "" ? "—" : texte;
}

export function AppEquationParabole() {
  const [etat, setEtat] = useState<EtatSessionEquationParabole>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — tenue ici, jamais dans le
   * moteur ; un écran clos = une entrée, dans l'ordre de `ORDRE_PHASES` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionEquationParabole, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "sommetFoyer" ? nouvelEtat.sommetFoyerRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.equationRevele;
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
    setEtat(demarrerSessionEquationParabole(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as OrientationParabole)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const recapitulatif = calculerRecapitulatifEquationParabole(etat);

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
        <h1 className="app-title">Équation d'une parabole depuis un graphe</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          {phase === "sommetFoyer" ? (
            <EtapeSommetFoyerEquationParabole
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSommetFoyer}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSommetFoyer(etat, reponse), sommetFoyerSaisis(reponse))}
              validation={validation}
            />
          ) : (
            <EtapeEquationEquationParabole
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideEquation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseEquation(etat, reponse), saisieBrute(reponse))}
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
