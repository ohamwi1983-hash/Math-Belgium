import { useState } from "react";
import type { ReactNode } from "react";
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
import { nombreFrLatex } from "./ui/nombreFr";
import { Katex } from "./components/Katex";
import { calculerRecapitulatifRelationVectorielle } from "./ui/recapitulatifRelationVectorielle";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Détermine les coordonnées de ce point à partir de la relation vectorielle.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionRelationVectorielle {
  return demarrerSessionRelationVectorielle(REGLAGES_DEMO, genererExerciceRelationVectorielle);
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases du
 * générateur (voir `PhaseRelationVectorielle`/les branches de `terminerEtape` ci-dessous).
 * Particularité de ce générateur (contrairement au gabarit) : la phase "traduction" n'existe que
 * pour la variante `relationGenerale` — `phaseInitiale` démarre directement à "coordonnees" pour
 * `translation`, qui n'a jamais cette étape (voir `typesRelationVectorielle.ts`). Un seul segment
 * ("coordonnees") est donc affiché pour cette variante. */
const ORDRE_PHASES: PhaseRelationVectorielle[] = ["traduction", "coordonnees"];

/** Même ternaire que `terminerEtape` (ci-dessous) et `recapitulatifRelationVectorielle.ts` pour lire
 * `scoreTraductionExercice`/`traductionRevele` — jamais une valeur recalculée séparément.
 * "coordonnees" (dernière phase) n'a pas de score tracké dans `EtatSessionRelationVectorielle` :
 * tant que l'exercice n'est pas terminé elle est forcément "courante" (dernière phase active), et
 * une fois terminé un nouvel exercice démarre (l'état entier est remis à zéro). */
function calculerSegmentsProgression(etat: EtatSessionRelationVectorielle): EtatPuceProgression[] {
  const phases = etat.exerciceCourant.variante === "translation" ? ORDRE_PHASES.filter((phase) => phase !== "traduction") : ORDRE_PHASES;
  return phases.map((phase) => {
    if (phase === etat.phase) return "courante";
    if (phase !== "traduction") return "a-venir";
    if (etat.scoreTraductionExercice === null) return "a-venir";
    if (etat.traductionRevele) return "revele";
    return etat.traductionAideUtiliseeExercice ? "aide" : "correcte";
  });
}

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
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionRelationVectorielle`, jamais dans le moteur (voir
   * AppAnalyseFonction.tsx). Remis à vide à chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice » ou « Générer ») : avec la phase, il
   * sert de `key` aux écrans, pour que leurs champs repartent vides. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  /** Même mécanisme que AppAnalyseFonction.tsx::ajouterHistorique — réutilise
   * `calculerRecapitulatifRelationVectorielle` pour la réponse ATTENDUE ; cette fonction ne produit
   * une entrée que pour "traduction", jamais pour "coordonnees" (dernière phase) — voir son
   * commentaire. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionRelationVectorielle) {
    const recap = calculerRecapitulatifRelationVectorielle(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (voir le commentaire détaillé
   * de AppAnalyseFonction.tsx::terminerEtape, même garde reproduit ici à l'identique). */
  function terminerEtape(nouvelEtat: EtatSessionRelationVectorielle, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      const revele =
        etat.phase === "traduction" ? nouvelEtat.traductionRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.coordonneesRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setNumeroExercice((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setNumeroExercice((n) => n + 1);
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
          <Katex expression={`${exercice.pointCherche}(${nombreFrLatex(exercice.reponse.x)} \\,;\\, ${nombreFrLatex(exercice.reponse.y)})`} />
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
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel (version guidée)</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
        {exercice.variante === "translation" ? (
          <EtapeTranslationVectorielle
            key={`${numeroExercice}-translation`}
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
            key={`${numeroExercice}-traduction`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseTraduction(etat, texte), texte)}
            validation={validation}
          />
        ) : (
          <EtapeCoordonneesRelationVectorielle
            key={`${numeroExercice}-coordonnees`}
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

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
