import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import type { ExerciceTroisTermes } from "./core5e/troisTermes.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTroisTermes } from "./generateurs5e/troisTermes";
import type { IdVarianteTroisTermes } from "./generateurs5e/troisTermes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionTroisTermes, soumettreReponseEcran } from "./moteur5e/sessionTroisTermes";
import { REPONSE_AUCUNE, phasesJouees, tentativesMaxPhase } from "./moteur5e/typesTroisTermes";
import type { EtatSessionTroisTermes, PhaseTroisTermes } from "./moteur5e/typesTroisTermes";
import { diagnostiquerChamps, messageIllisible, messagePiege, refusFormat } from "./moteur5e/verificationTroisTermes";
import { EtapeTroisTermes, FragmentsTroisTermes } from "./components5e/EtapeTroisTermes";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { aideNiveau1, aideNiveau2, champsEcran, consigneEcran, consigneGenerale, libellePhase, relationLatex, relationTexte, reponseFragments } from "./ui5e/formatTroisTermes";
import { calculerRecapitulatifTroisTermes, calculerSegmentsProgressionTroisTermes } from "./ui5e/recapitulatifTroisTermes";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeTroisTermes } from "./generateurs5e/troisTermes/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";

/**
 * `5gen46` — « Trois termes consécutifs » (chapitre 3 de 5e « Suites », section
 * `suites-geometriques`, processus 2 APPLIQUER). a, b, c dépendent de x : pour quelle(s) valeur(s)
 * de x sont-ils trois termes consécutifs d'une suite arithmétique (2b = a + c) ou géométrique
 * (b² = a·c, aucun terme nul) ? Relation (choix fermé, une tentative) → équation réduite → valeur(s)
 * de x (0, 1 ou 2 en géométrique) → termes et raison. Même patron que `App5gen45.tsx` ; le `?code=`
 * (QR code des feuilles) rejoue l'instance de `generateurs5e/troisTermes/exportEvaluation.ts` avec
 * les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionTroisTermes {
  return demarrerSessionTroisTermes(REGLAGES_DEMO, genererExerciceTroisTermes);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionTroisTermes {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionTroisTermes(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceTroisTermes, (id) => construireAvecVarianteId(id as IdVarianteTroisTermes)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionTroisTermes;
  revele: boolean;
}

function reponseAttendue(e: ExerciceTroisTermes, phase: PhaseTroisTermes): ReactNode {
  return (
    <span className="prompt-text" style={{ overflowX: "auto", display: "block", maxWidth: "100%" }}>
      <FragmentsTroisTermes fragments={reponseFragments(e, phase)} />
    </span>
  );
}

export function App5gen46() {
  const [etat, setEtat] = useState<EtatSessionTroisTermes>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseTroisTermes, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const champs = champsEcran(exercice, phase);

  function votreReponse(valeurs: string[]): string {
    if (phase === "relation") return relationTexte(valeurs[0]);
    if (phase === "solutions") return valeurs[0] === REPONSE_AUCUNE ? "Aucune valeur ne convient" : valeurs.map((v) => `x = ${v}`).join(" ; ");
    return champs.length === 1 ? valeurs[0] : champs.map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionTroisTermes, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setAideParPhase((prev) => ({ ...prev, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [...h, { corrigeDetaille: corrigeDetailleEcranCourant(), titre: libellePhase(phase), votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionTroisTermes) {
    setEtat(nouvelEtat);
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setFicheOuverteIndex(null);
    setCompteur((c) => c + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      reinitialiser(nouvelleSession());
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    reinitialiser(demarrerSessionTroisTermes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteTroisTermes)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug5gen46?: unknown }).__debug5gen46 = { exercice, phase };
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeTroisTermes(exercice), lettreEtape(phasesJouees(exercice).indexOf(phase)))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        // Corrigé détaillé « comme au tableau » de l'étape (même source que le papier,
        // `generateurs5e/troisTermes/corrigeDetaille.ts`), affiché sous la réponse attendue quand elle est révélée.
        corrigeDetaille: corrigeDetailleEcranCourant(),
        messageRevele: phase === "relation" ? "Ce n'était pas la bonne relation (une seule tentative sur un choix)." : undefined,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Trois termes consécutifs</h1>
        <p className="app-subtitle">Chapitre 3 — Suites</p>
        <ProgressionPuces segments={calculerSegmentsProgressionTroisTermes(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifTroisTermes(etat)} />
          <EtapeTroisTermes
            key={`${compteur}-${phase}`}
            mode={phase === "relation" ? "choix" : phase === "solutions" ? "solutions" : "champs"}
            consigneGenerale={consigneGenerale(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champs}
            options={exercice.ordreRelations.map((id) => ({ id, latex: relationLatex(id) }))}
            aideNiveau1={aideNiveau1(exercice, phase)}
            aideNiveau2={aideNiveau2(exercice, phase)}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={tentativesMaxPhase(phase, etat.reglages.tentativesMax)}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            validation={validation}
            diagnostiquer={(valeurs) => diagnostiquerChamps(exercice, phase, valeurs)}
            piege={(valeurs) => messagePiege(exercice, phase, valeurs)}
            refusFormat={(valeurs) => refusFormat(exercice, phase, valeurs)}
            messageIllisible={messageIllisible(phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
