import { useState } from "react";
import type { ReactNode } from "react";
import type { ExercicePolygonesArcsSecteurs } from "./core5e/polygonesArcsSecteurs.types";
import type { EtatSessionPolygonesArcsSecteurs, PhasePolygonesArcsSecteurs } from "./moteur5e/typesPolygonesArcsSecteurs";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { construireAvecPresence, genererExercicePolygonesArcsSecteurs } from "./generateurs5e/polygonesArcsSecteurs";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_PRESENCE = [
  { id: "00", label: "Aucun écran optionnel" },
  { id: "10", label: "Arc multi-pas seul" },
  { id: "01", label: "Secteur multi-pas seul" },
  { id: "11", label: "Arc ET secteur multi-pas" },
];
import {
  activerAideSuivante,
  demarrerSessionPolygonesArcsSecteurs,
  niveauAideMax,
  soumettreReponseCercleEntier,
  soumettreReponseEcranUnChamp,
} from "./moteur5e/sessionPolygonesArcsSecteurs";
import { cibleEcranUnChamp, diagnostiquerCercleEntier } from "./moteur5e/verificationPolygonesArcsSecteurs";
import { diagnostiquerValeurArcSecteur } from "./moteur5e/verificationArcsSecteurs";
import { EtapeCercleEntier } from "./components5e/EtapeCercleEntier";
import { EtapeEcranUnChampPolygone } from "./components5e/EtapeEcranUnChampPolygone";
import {
  consigneGenerale,
  formatAireTotaleAttendueLatex,
  formatArcElementaireAttendueLatex,
  formatArcMultiPasAttendueLatex,
  formatCirconferenceAttendueLatex,
  formatSecteurElementaireAttendueLatex,
  formatSecteurMultiPasAttendueLatex,
} from "./ui5e/formatPolygonesArcsSecteurs";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components5e/EnTeteExercice";
import { calculerRecapitulatifPolygonesArcsSecteurs } from "./ui5e/recapitulatifPolygonesArcsSecteurs";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionPolygonesArcsSecteurs {
  return demarrerSessionPolygonesArcsSecteurs(REGLAGES_DEMO, genererExercicePolygonesArcsSecteurs);
}

/** Révèle le champ `xxxRevele` de la phase qui vient de se terminer (`phase` = `etat.phase`, AVANT
 * la mise à jour). Non terminal : lu directement sur `nouvelEtat` (posé par `transitionApresEcran`
 * à la clôture de la phase). Terminal ("secteurElementaire" quand `secteurMultiPas` est absent, ou
 * "secteurMultiPas") : `cloturerExerciceOuSuivant` ne pose ce champ que DANS le `resultats` ajouté. */
function releveDeLaPhase(phase: PhasePolygonesArcsSecteurs, nouvelEtat: EtatSessionPolygonesArcsSecteurs): boolean {
  if (nouvelEtat.terminee) {
    const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
    if (phase === "secteurMultiPas") return resultat.secteurMultiPasRevele;
    return resultat.secteurElementaireRevele;
  }
  switch (phase) {
    case "cercleEntier":
      return nouvelEtat.cercleEntierRevele;
    case "arcElementaire":
      return nouvelEtat.arcElementaireRevele;
    case "arcMultiPas":
      return nouvelEtat.arcMultiPasRevele;
    case "secteurElementaire":
      return nouvelEtat.secteurElementaireRevele;
    default:
      throw new Error("releveDeLaPhase : phase non-terminale inattendue");
  }
}

/** Réponse attendue de la phase qui vient de se terminer — réplique exactement la `LigneRecap`
 * correspondante de l'ancien `ResultatPanelPolygone.tsx`. Dérivée PUREMENT de `exercice`. */
function reponseAttenduePhase(exercice: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): ReactNode {
  switch (phase) {
    case "cercleEntier":
      return (
        <>
          <Katex expression={`\\text{Circonférence} = ${formatCirconferenceAttendueLatex(exercice)}`} />{" "}
          <Katex expression={`\\text{Aire} = ${formatAireTotaleAttendueLatex(exercice)}`} />
        </>
      );
    case "arcElementaire":
      return <Katex expression={formatArcElementaireAttendueLatex(exercice)} />;
    case "arcMultiPas":
      return <Katex expression={formatArcMultiPasAttendueLatex(exercice) as string} />;
    case "secteurElementaire":
      return <Katex expression={formatSecteurElementaireAttendueLatex(exercice)} />;
    case "secteurMultiPas":
      return <Katex expression={formatSecteurMultiPasAttendueLatex(exercice) as string} />;
  }
}

/** Séquence RÉELLE des écrans traversés par CET exercice (3 à 5 écrans selon la présence des 2
 * écrans optionnels) — même ordre que `phaseApres` (`moteur5e/typesPolygonesArcsSecteurs.ts`),
 * jamais un unique `ORDRE_PHASES` fixe (2 écrans optionnels indépendants l'un de l'autre, même
 * esprit que les 2 variantes d'`AppRelationVectorielle.tsx`, 4e). */
function sequenceDesPhases(exercice: ExercicePolygonesArcsSecteurs): PhasePolygonesArcsSecteurs[] {
  const sequence: PhasePolygonesArcsSecteurs[] = ["cercleEntier", "arcElementaire"];
  if (exercice.arcMultiPas !== null) sequence.push("arcMultiPas");
  sequence.push("secteurElementaire");
  if (exercice.secteurMultiPas !== null) sequence.push("secteurMultiPas");
  return sequence;
}

/** Même ternaire que `releveDeLaPhase` (ci-dessus) pour lire `scoreXxxExercice`/`xxxRevele` —
 * jamais une valeur recalculée séparément. "secteurMultiPas" (toujours terminal quand présent,
 * voir `transitionApresEcran`, `moteur5e/sessionPolygonesArcsSecteurs.ts`) n'a pas de champ
 * `scoreSecteurMultiPasExercice` à la racine — jamais atteint ici puisque la 1re garde
 * (`phase === etat.phase`) le capture déjà comme "courante" tant que l'exercice est en cours. */
function calculerSegmentsProgression(
  etat: EtatSessionPolygonesArcsSecteurs,
  aideUtiliseeParPhase: Partial<Record<string, boolean>>,
): EtatPuceProgression[] {
  return sequenceDesPhases(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    const score =
      phase === "cercleEntier"
        ? etat.scoreCercleEntierExercice
        : phase === "arcElementaire"
          ? etat.scoreArcElementaireExercice
          : phase === "arcMultiPas"
            ? etat.scoreArcMultiPasExercice
            : etat.scoreSecteurElementaireExercice;
    if (score === null) return "a-venir";
    const revele =
      phase === "cercleEntier"
        ? etat.cercleEntierRevele
        : phase === "arcElementaire"
          ? etat.arcElementaireRevele
          : phase === "arcMultiPas"
            ? etat.arcMultiPasRevele
            : etat.secteurElementaireRevele;
    if (revele) return "revele";
    return aideUtiliseeParPhase[phase] ? "aide" : "correcte";
  });
}

/** Libellés courts pour la fiche de consultation — jamais de second vocabulaire pour les phases déjà
 * nommées par `consigneGenerale`/les `Etape*.tsx` (phrases complètes, pas de libellé court dédié
 * existant à réutiliser). */
const LIBELLE_PHASE: Record<PhasePolygonesArcsSecteurs, string> = {
  cercleEntier: "Cercle entier",
  arcElementaire: "Arc élémentaire",
  arcMultiPas: "Arc multi-pas",
  secteurElementaire: "Secteur élémentaire",
  secteurMultiPas: "Secteur multi-pas",
};

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionPolygonesArcsSecteurs;
  revele: boolean;
}

export function App5gen7() {
  const [etat, setEtat] = useState<EtatSessionPolygonesArcsSecteurs>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionPolygonesArcsSecteurs`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<string, boolean>>>({});

  /** Réutilise `reponseAttenduePhase` — EXACTEMENT la même source que la bannière `validation`
   * ci-dessous pour l'écran COURANT revélé. */
  function ajouterHistorique(votreReponse: ReactNode, phaseClose: PhasePolygonesArcsSecteurs, nouvelEtat: EtatSessionPolygonesArcsSecteurs) {
    const revele = releveDeLaPhase(phaseClose, nouvelEtat);
    setHistorique((h) => [
      ...h,
      {
        titre: LIBELLE_PHASE[phaseClose],
        votreReponse,
        correcte: !revele,
        reponseAttendue: revele ? reponseAttenduePhase(nouvelEtat.exerciceCourant, phaseClose) : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT poussée dans l'historique quand l'écran se clôt RÉELLEMENT (même
   * garde `transitionDEcran` que celui qui déclenche déjà `setEnAttente`), et JAMAIS pour la
   * DERNIÈRE phase de l'exercice (variable selon la présence des écrans optionnels — "secteurMultiPas"
   * ou "secteurElementaire", voir `sequenceDesPhases`) : détectée dynamiquement via
   * `nouvelEtat.resultats.length > etat.resultats.length` plutôt que par un nom de phase fixe. */
  function terminerEtape(nouvelEtat: EtatSessionPolygonesArcsSecteurs, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      const exerciceTermine = nouvelEtat.resultats.length > etat.resultats.length;
      if (!exerciceTermine && votreReponse !== undefined) {
        ajouterHistorique(votreReponse, etat.phase, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: releveDeLaPhase(etat.phase, nouvelEtat) });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeParPhase({});
      setFicheOuverteIndex(null);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionPolygonesArcsSecteurs(REGLAGES_DEMO, () => construireAvecPresence(id[0] === "1", id[1] === "1")));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAideMaxEcran = niveauAideMax(etat.phase);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Polygones, arcs et secteurs</h1>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
      </header>
      <SelecteurVarianteDev options={OPTIONS_PRESENCE} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigneGenerale(exercice)} blocDonnees={null} />
          <RecapitulatifPanel entrees={calculerRecapitulatifPolygonesArcsSecteurs(etat)} />
          {etat.phase === "cercleEntier" ? (
            <EtapeCercleEntier
              exercice={exercice}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEcran}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(r) => terminerEtape(soumettreReponseCercleEntier(etat, r), `Circonférence = ${r.circonference} ; Aire = ${r.aire}`)}
              diagnostiquer={(r) => diagnostiquerCercleEntier(exercice, r)}
              validation={validation}
            />
          ) : (
            <EtapeEcranUnChampPolygone
              key={etat.phase}
              exercice={exercice}
              phase={etat.phase as Exclude<PhasePolygonesArcsSecteurs, "cercleEntier">}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEcran}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseEcranUnChamp(etat, texte), `${LIBELLE_PHASE[etat.phase]} = ${texte}`)}
              diagnostiquer={(texte) =>
                diagnostiquerValeurArcSecteur(
                  texte,
                  cibleEcranUnChamp(exercice, etat.phase as Exclude<PhasePolygonesArcsSecteurs, "cercleEntier">),
                )
              }
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
