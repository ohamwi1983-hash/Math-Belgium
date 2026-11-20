import { useEffect, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiquesCyclometriques } from "./generateurs6e/graphiquesCyclometriques/index";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionGraphiquesCyclometriques,
  soumettreLettre,
  soumettreReponseEcranUnique,
} from "./moteur6e/sessionGraphiquesCyclometriques";
import type { EtatSessionGraphiquesCyclometriques } from "./moteur6e/typesGraphiquesCyclometriques";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { EtapeApparierGraphiqueCyclo } from "./components6e/EtapeApparierGraphiqueCyclo";
import { GrapheOptionCyclo } from "./components6e/GrapheOptionCyclo";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { RenduFragments } from "./components/RenduFragments";
import { calculerViewBoxGraphique } from "./ui6e/formatGraphiquesCyclometriques";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeGraphiquesCyclometriques, reponseGraphiquesCyclo } from "./generateurs6e/graphiquesCyclometriques/corrigeDetaille";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionGraphiquesCyclometriques {
  return demarrerSessionGraphiquesCyclometriques(REGLAGES_DEMO, genererExerciceGraphiquesCyclometriques);
}

/** Première session : `?code=XXXXXX` (QR code d'une feuille) rouvre l'exercice imprimé — mêmes
 * fonctions de tirage que l'adaptateur d'export, comme `App6gen14.tsx`. */
function sessionInitiale(): EtatSessionGraphiquesCyclometriques {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionGraphiquesCyclometriques(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceGraphiquesCyclometriques, (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
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
  const [etat, setEtat] = useState<EtatSessionGraphiquesCyclometriques>(sessionInitiale);
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

  // Réponse attendue : le graphique (petit, graduations espacées) et les propriétés en valeurs
  // EXACTES, mêmes fragments que le résultat du corrigé (audit du 6e ch. 1, E11 : l'écran montrait
  // « [−1 ; −0,33] » au lieu de [−1 ; −1/3]).
  const reponseAttendue = enAttente ? (
    <>
      <GrapheOptionCyclo exercice={exercice} index={exercice.indexCorrect} viewBox={calculerViewBoxGraphique(exercice)} largeur={180} hauteur={180} />
      <p>
        <RenduFragments fragments={reponseGraphiquesCyclo(exercice)} />
      </p>
    </>
  ) : null;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        // Clôture « révélée » par la parité seule (choix fermé faux, le reste juste) ou par le choix
        // du graphique : le message le dit, au lieu de « Tentatives épuisées ».
        messageRevele: !enAttente.etatSuivant.resultats.length
          ? undefined
          : !etat.lettreValidee
            ? "Ce n'était pas le bon graphique (choix fermé : une seule tentative)."
            : enAttente.etatSuivant.pariteRevelee && enAttente.etatSuivant.etapeCourante.tentativesUtilisees < etat.reglages.tentativesMax
              ? "La parité était fausse (une seule tentative) ; le reste de la justification est juste."
              : undefined,
        reponseAttendue,
        // Corrigé détaillé « comme au tableau » (source unique avec le papier) — écran unique « a ».
        corrigeDetaille: <CorrigeDetailleEcran etapes={correctionDetailleeGraphiquesCyclometriques(exercice)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Apparier graphiques et expressions de fonctions cyclométriques</h1>
        <p className="app-subtitle">Chapitre 1 — Fonctions réciproques & cyclométriques</p>
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
            lettreValidee={etat.lettreValidee}
            pariteRevelee={etat.pariteRevelee}
            onValiderLettre={(lettre) => terminerEtape(soumettreLettre(etat, lettre))}
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
