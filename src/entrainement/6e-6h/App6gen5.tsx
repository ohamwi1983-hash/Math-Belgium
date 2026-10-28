import { useEffect, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiquesCyclometriques } from "./generateurs6e/graphiquesCyclometriques/index";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionGraphiquesCyclometriques,
  soumettreReponseEcranUnique,
} from "./moteur6e/sessionGraphiquesCyclometriques";
import type { EtatSessionGraphiquesCyclometriques } from "./moteur6e/typesGraphiquesCyclometriques";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { EtapeApparierGraphiqueCyclo } from "./components6e/EtapeApparierGraphiqueCyclo";
import { GrapheOptionCyclo } from "./components6e/GrapheOptionCyclo";
import { LigneRecap } from "./components6e/LigneRecap";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import {
  LIBELLE_PARITE,
  calculerViewBoxGraphique,
  formatEnsembleReelApproxLatex,
  formatExtremumLatex,
  formatOrdonneeLatex,
  texteAideNiveau1,
  texteAideNiveau2,
} from "./ui6e/formatGraphiquesCyclometriques";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionGraphiquesCyclometriques {
  return demarrerSessionGraphiquesCyclometriques(REGLAGES_DEMO, genererExerciceGraphiquesCyclometriques);
}

/** État tenu en attente dès que l'écran unique se termine (bonne réponse, ou tentatives
 * épuisées) — l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le
 * bouton de `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/
 * invalidation avant de passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionGraphiquesCyclometriques;
  revele: boolean;
}

/**
 * `6gen5` — REFONTE COMPLÈTE : un seul écran par tirage, toutes familles confondues (remplace
 * l'ancienne séquence "calcul (C-F) → sélection (A-F)" à 1 ou 2 écrans). Voir
 * `components6e/EtapeApparierGraphiqueCyclo.tsx` pour le détail de l'écran unique et
 * `moteur6e/sessionGraphiquesCyclometriques.ts` pour le moteur simplifié en conséquence (plus de
 * notion de phase).
 */
export function App6gen5() {
  const [etat, setEtat] = useState<EtatSessionGraphiquesCyclometriques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  // Hook de debug pour la vérification Playwright (`?dev=1`) — expose l'exercice courant (dont
  // `proprietes`, la vérité terrain calculée par la Couche A) pour remplir les 7 sous-réponses avec
  // les vraies valeurs plutôt qu'à l'aveugle. Ne concerne jamais un élève en usage normal (lecture
  // seule, aucun effet sur la logique de session).
  useEffect(() => {
    (window as unknown as { __debug6gen5?: unknown }).__debug6gen5 = {
      exercice: etat.exerciceCourant,
      phase: etat.terminee ? "terminee" : enAttente ? "bilan" : "ecran",
    };
  }, [etat, enAttente]);

  function terminerEtape(nouvelEtat: EtatSessionGraphiquesCyclometriques) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereRevelee });
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
    setEtat(
      demarrerSessionGraphiquesCyclometriques(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  // Rendu à plat des 7 sous-réponses de l'écran unique (lettre + 6 propriétés de justification) —
  // jamais un score fractionnaire. Réutilise `LigneRecap` avec un statut "rouge" fixe : ce bloc
  // n'est jamais affiché par `ValidationEcran` sauf si `revele===true` (réponse révélée après
  // tentatives épuisées), donc toujours rouge quand il apparaît.
  const reponseAttendue = enAttente ? (
    <>
      <LigneRecap label="Graphique" statut="rouge">
        <GrapheOptionCyclo exercice={exercice} index={exercice.indexCorrect} viewBox={calculerViewBoxGraphique(exercice)} largeur={150} hauteur={150} />
      </LigneRecap>
      <LigneRecap label="Ordonnée à l'origine" statut="rouge">
        <Katex expression={formatOrdonneeLatex(exercice.proprietes.ordonnee)} />
      </LigneRecap>
      <LigneRecap label="Domaine de f" statut="rouge">
        <Katex expression={`\\text{dom} f = ${formatEnsembleReelApproxLatex(exercice.proprietes.domf)}`} />
      </LigneRecap>
      <LigneRecap label="Image de f" statut="rouge">
        <Katex expression={`\\text{Im}(f) = ${formatEnsembleReelApproxLatex(exercice.proprietes.imf)}`} />
      </LigneRecap>
      <LigneRecap label="Parité" statut="rouge">
        {LIBELLE_PARITE[exercice.proprietes.parite]}
      </LigneRecap>
      <LigneRecap label="Maximum" statut="rouge">
        <Katex expression={formatExtremumLatex(exercice.proprietes.maximum)} />
      </LigneRecap>
      <LigneRecap label="Minimum" statut="rouge">
        <Katex expression={formatExtremumLatex(exercice.proprietes.minimum)} />
      </LigneRecap>
    </>
  ) : null;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Apparier graphiques et expressions de fonctions cyclométriques</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          <EtapeApparierGraphiqueCyclo
            key={etat.indexExercice}
            exercice={exercice}
            // Écran unique par exercice (pas de notion de `phase` ici, voir `6gen5`
            // REFONTE COMPLÈTE ci-dessus) : chaque montage de ce composant EST le premier
            // (et seul) écran de l'exercice — constante, pas besoin de `useRef`.
            aideNiveau1={texteAideNiveau1(exercice)}
            aideNiveau2={texteAideNiveau2(exercice)}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseEcranUnique(etat, reponse))}
            validation={validation}
          />
          {/* Les 6 propriétés justifiées peuvent porter une valeur irrationnelle (arctan/arcsin/arccos
            d'un argument quelconque, ordonnée, bornes de l'image famille D...) — TOUJOURS visible sur
            l'écran unique, jamais conditionnée par famille (contrairement à `necessiteCalculatrice`
            ailleurs sur ce chantier) puisque les 6 familles A-F peuvent chacune l'exiger. */}
          <CalculatriceScientifique />
        </div>
      </main>
    </div>
  );
}
