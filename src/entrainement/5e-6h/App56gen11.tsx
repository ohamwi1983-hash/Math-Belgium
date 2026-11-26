// Copie 5e (6h) de `5e-4h/App5gen18.tsx` (56gen11 ← 5gen18, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { useState } from "react";
import type { ReglagesSession5e } from "../5e-4h/core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceComparaisonSuites } from "./generateurs56/comparaisonSuites";
import type { FamilleComparaisonSuites } from "./generateurs56/comparaisonSuites/core/comparaisonSuites.types";
import { SelecteurVarianteDev } from "../5e-4h/components5e/SelecteurVarianteDev";
import {
  NIVEAU_AIDE_MAX_COMPARAISON_SUITES,
  activerAideSuivante,
  demarrerSessionComparaisonSuites,
  soumettreReponseConclusion,
  soumettreReponseTableau,
} from "./generateurs56/comparaisonSuites/moteur/sessionComparaisonSuites";
import type { EtatSessionComparaisonSuites, PhaseComparaisonSuites } from "./generateurs56/comparaisonSuites/moteur/typesComparaisonSuites";
import {
  diagnostiquerCelluleTableau,
  diagnostiquerConclusion,
  diagnostiquerNSeuil,
  diagnostiquerTableau,
  diagnostiquerTraduction,
} from "./generateurs56/comparaisonSuites/moteur/verificationComparaisonSuites";
import { EtapeConclusionComparaisonSuites } from "./generateurs56/comparaisonSuites/composants/EtapeConclusionComparaisonSuites";
import { EtapeTableauComparaisonSuites } from "./generateurs56/comparaisonSuites/composants/EtapeTableauComparaisonSuites";
import { CalculatriceScientifique } from "../5e-4h/components5e/CalculatriceScientifique";
import { formatConclusionNLatex, formatTraductionAttendueTexte } from "./generateurs56/comparaisonSuites/ui/formatComparaisonSuites";
import { Katex } from "../5e-4h/components/Katex";
import { correctionDetailleeComparaisonSuites } from "./generateurs56/comparaisonSuites/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";
import { TableComparaisonRecap } from "./generateurs56/comparaisonSuites/composants/TableComparaisonRecap";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionComparaisonSuites {
  return demarrerSessionComparaisonSuites(REGLAGES_DEMO, genererExerciceComparaisonSuites);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions et le MÊME catalogue que l'adaptateur
 * d'export (`generateurs5e/comparaisonSuites/exportEvaluation.ts`). */
function sessionInitiale(): EtatSessionComparaisonSuites {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionComparaisonSuites(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceComparaisonSuites, (id) => construireAvecFamilleId(id as FamilleComparaisonSuites)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionComparaisonSuites;
  revele: boolean;
}

/** Ordre d'affichage des puces de progression — séquence FIXE à 2 écrans (`phaseApres`,
 * `moteur5e/typesComparaisonSuites.ts`) : "tableau" puis "conclusion", identique pour les 3 familles. */
const ORDRE_PHASES: PhaseComparaisonSuites[] = ["tableau", "conclusion"];

/** Aucun booléen dédié `tableauRevele`/`conclusionRevele` ni `scoreTableauExercice` propre côté
 * session (seul `derniereEtapeRevelee`, qui se réécrit à chaque clôture de phase, et
 * `scoreTableauPartiel`, qui ne survit que jusqu'à la fin de l'exercice courant — voir
 * `sessionComparaisonSuites.ts`) : heuristique `score === 0 ⟺ révélée` (`soumettreEtapeTentatives`,
 * `moteur/etapeTentatives.ts` — score forcé à 0 exactement quand l'étape est révélée), même
 * convention que `AppMethodeRapide.tsx` (4e). "conclusion" (dernière phase) clôture toujours
 * l'exercice : jamais de champ de score qui lui survivrait une fois la phase quittée, donc toujours
 * "courante" ou "a-venir", jamais "revele"/"correcte" avant la fin. */
function calculerSegmentsProgression(etat: EtatSessionComparaisonSuites, aideUtiliseeTableau: boolean): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    if (phase !== "tableau" || etat.scoreTableauPartiel === null) return "a-venir";
    if (etat.scoreTableauPartiel === 0) return "revele";
    return aideUtiliseeTableau ? "aide" : "correcte";
  });
}

export function App56gen11() {
  const [etat, setEtat] = useState<EtatSessionComparaisonSuites>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule de l'écran "tableau" déjà clos (seule puce cliquable — voir
   * `calculerSegmentsProgression`, "conclusion" ne clôt jamais avant la fin de l'exercice) — tenu
   * ICI, à part de `EtatSessionComparaisonSuites`, jamais dans le moteur. Remis à vide à chaque
   * nouvel exercice, comme `enAttente`. Pas de fonction `calculerRecapitulatifXxx` pour ce
   * générateur : "réponse attendue" construite directement depuis `exercice`, exactement comme le
   * fait déjà `validation.reponseAttendue` ci-dessous pour la phase "tableau". */
  const [historiqueTableau, setHistoriqueTableau] = useState<EntreeHistoriqueEtape | null>(null);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  /** Capture locale de `etat.niveauAide > 0` à la clôture de l'écran "tableau" — le moteur remet
   * `niveauAide` à 0 à la transition vers "conclusion" (même mécanique que les autres générateurs
   * de ce chantier). */
  const [aideUtiliseeTableau, setAideUtiliseeTableau] = useState(false);
  /** Incrémenté à chaque nouvel exercice (« Générer », « Nouvel exercice ») : fait partie de la clé
   * des écrans, pour que leurs champs repartent vides même quand le nouvel exercice commence par le
   * même écran que le précédent (même convention qu'`App5gen10.tsx`). */
  const [numeroSession, setNumeroSession] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionComparaisonSuites, votreReponse?: string) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereEtapeRevelee;
      if (etat.phase === "tableau") {
        setAideUtiliseeTableau(etat.niveauAide > 0);
        if (votreReponse !== undefined) {
          setHistoriqueTableau({
            corrigeDetaille: corrigeDetailleEcranCourant(),
            titre: "Tableau de valeurs",
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? <TableComparaisonRecap exercice={etat.exerciceCourant} /> : undefined,
          });
        }
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistoriqueTableau(null);
      setAideUtiliseeTableau(false);
      setNumeroSession((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistoriqueTableau(null);
    setAideUtiliseeTableau(false);
    setNumeroSession((n) => n + 1);
    setEtat(demarrerSessionComparaisonSuites(REGLAGES_DEMO, () => construireAvecFamilleId(id as FamilleComparaisonSuites)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${numeroSession}-${etat.indexExercice}-${etat.phase}`;

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeComparaisonSuites(exercice), etat.phase === "tableau" ? "a" : "b")} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "tableau" ? (
            <TableComparaisonRecap exercice={exercice} />
          ) : (
            <>
              <Katex expression={formatConclusionNLatex(exercice)} /> — {formatTraductionAttendueTexte(exercice)}
            </>
          ),
        corrigeDetaille: corrigeDetailleEcranCourant(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e (6h) — Entraînement</p>
        <h1 className="app-title">Comparaison numérique de deux suites</h1>
        <p className="app-subtitle">Nombres réels et suites</p>
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideUtiliseeTableau)} onSegmentClick={() => setFicheOuverte(true)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <>
              {etat.phase === "tableau" && (
                <EtapeTableauComparaisonSuites
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPARAISON_SUITES}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseTableau(etat, textes), textes.join(" ; "))}
                  diagnostiquer={(textes) => diagnostiquerTableau(textes, exercice)}
                  diagnostiquerCellule={(index, texte) => diagnostiquerCelluleTableau(texte, index, exercice)}
                  validation={validation}
                />
              )}
              {etat.phase === "tableau" && <CalculatriceScientifique />}

              {etat.phase === "conclusion" && (
                <EtapeConclusionComparaisonSuites
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPARAISON_SUITES}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseConclusion(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerConclusion(reponse, exercice)}
                  diagnostiquerNSeuil={(texte) => diagnostiquerNSeuil(texte, exercice)}
                  diagnostiquerTraduction={(texte) => diagnostiquerTraduction(texte, exercice)}
                  validation={validation}
                />
              )}
            </>
        </div>
      </main>

      {ficheOuverte && historiqueTableau && <FicheReponseEcran entree={historiqueTableau} onFermer={() => setFicheOuverte(false)} />}
    </div>
  );
}
