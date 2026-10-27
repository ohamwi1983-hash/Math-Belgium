import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOptimisation } from "./generateurs5e/optimisationGeometrique/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionOptimisation,
  niveauAideMaxOptimisation,
  soumettreReponseEcran,
} from "./moteur5e/sessionOptimisationGeometrique";
import type { EcranOptimisation, EtatSessionOptimisation } from "./moteur5e/typesOptimisationGeometrique";
import { ordreEcransOptimisation } from "./moteur5e/typesOptimisationGeometrique";
import { EtapeGeneriqueOptimisation } from "./components5e/EtapeGeneriqueOptimisation";
import { champsEcran, formatReponseAttendueEcranLatex, LIBELLE_ECRAN } from "./ui5e/formatOptimisationGeometrique";
import { calculerRecapitulatifOptimisation } from "./ui5e/recapitulatifOptimisation";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionOptimisation {
  return demarrerSessionOptimisation(REGLAGES_DEMO, genererExerciceOptimisation);
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionOptimisation;
  revele: boolean;
}

/** Même source que `calculerRecapitulatifOptimisation` (`revelesPartiels[ecran]`) —
 * `ordreEcransOptimisation(exercice)` donne la séquence RÉELLE (4 écrans pour "cubique", 6-7 pour
 * les autres familles, fixée dès le tirage).
 *
 * `aideUtiliseeParPhase` : état local dédié (voir `App5gen32`, ci-dessous) — rien dans
 * `EtatSessionOptimisation` ne trace le niveau d'aide d'un écran déjà clos (`niveauAide` est remis
 * à 0 à l'écran suivant). Écrit une seule fois, au moment exact de la clôture réelle de chaque
 * écran (`terminerEtape`), donc fiable pour tout écran déjà clos. */
function calculerSegmentsProgression(
  etat: EtatSessionOptimisation,
  aideUtiliseeParPhase: Partial<Record<string, boolean>>,
): EtatPuceProgression[] {
  return ordreEcransOptimisation(etat.exerciceCourant).map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[ecran]) return "revele";
    return aideUtiliseeParPhase[ecran] ? "aide" : "correcte";
  });
}

/** Format court de la réponse de l'élève pour UN écran — même structure que
 * `calculerRecapitulatifOptimisation` (ui5e/recapitulatifOptimisation.ts), réutilisée ici TELLE
 * QUELLE plutôt que recopiée séparément : un terme "label=valeur" par champ rempli, séparés par
 * `\quad`. */
function formatReponsesEcranLatex(exercice: EtatSessionOptimisation["exerciceCourant"], ecran: EcranOptimisation, reponses: Record<string, string>): string {
  const valeurs: string[] = [];
  for (const champ of champsEcran(exercice, ecran)) {
    const valeur = reponses[champ.id];
    if (valeur === undefined || valeur === "") continue;
    const labelPropre = champ.label.replace(/=$/, "");
    const valeurAffichee = champ.kind === "choix" ? (champ.options.find((o) => o.id === valeur)?.label ?? valeur) : valeur;
    valeurs.push(`${labelPropre}=${champ.kind === "choix" ? `\\text{${valeurAffichee}}` : valeurAffichee}`);
  }
  return valeurs.join("\\quad");
}

export function App5gen32() {
  const [etat, setEtat] = useState<EtatSessionOptimisation>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionOptimisation`, jamais dans le moteur (même principe que
   * `AppAnalyseFonction.tsx`, 4e). Remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<string, boolean>>>({});

  /** Réponse ATTENDUE : jamais `calculerRecapitulatifOptimisation` (qui réaffiche la dernière
   * réponse SOUMISE par l'élève, pas la vraie réponse — voir son commentaire de tête de fichier,
   * trompeur pour un écran révélé où cette réponse soumise est FAUSSE) — `
   * formatReponseAttendueEcranLatex` est la vraie source ATTENDUE, déjà réutilisée telle quelle par
   * le bloc `validation` ci-dessous pour l'écran COURANT revélé. */
  function ajouterHistorique(votreReponse: ReactNode, ecranClos: EcranOptimisation, nouvelEtat: EtatSessionOptimisation) {
    setHistorique((h) => [
      ...h,
      {
        titre: LIBELLE_ECRAN[ecranClos],
        votreReponse,
        correcte: !nouvelEtat.derniereEtapeRevelee,
        reponseAttendue: nouvelEtat.derniereEtapeRevelee ? (
          <Katex expression={formatReponseAttendueEcranLatex(nouvelEtat.exerciceCourant, ecranClos)} />
        ) : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'écran se clôt
   * RÉELLEMENT (même garde `transitionDEcran` que celui qui déclenche déjà `setEnAttente`), et
   * JAMAIS pour le DERNIER écran de l'exercice (`nouvelEtat.resultats.length > etat.resultats.length`)
   * — jamais consultable : sa puce reste "courante" tant que `enAttente` est actif (calculée depuis
   * `etat`, pas encore transitionné), puis l'exercice entier redémarre à zéro dès "Nouvel exercice"
   * (`nouvelleSession()`), comme pour la dernière étape ("tableauSignes"/"graphique") des autres
   * générateurs déjà migrés. */
  function terminerEtape(nouvelEtat: EtatSessionOptimisation, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      const exerciceTermine = nouvelEtat.resultats.length > etat.resultats.length;
      if (!exerciceTermine && votreReponse !== undefined) {
        ajouterHistorique(votreReponse, etat.phase, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
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
    setEtat(demarrerSessionOptimisation(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const niveauAideMax = niveauAideMaxOptimisation();

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <Katex expression={formatReponseAttendueEcranLatex(exercice, etat.phase)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Optimisation géométrique</h1>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifOptimisation(etat)} />
          <EtapeGeneriqueOptimisation
            key={cleEcran}
            exercice={exercice}
            phase={etat.phase}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponses) =>
              terminerEtape(soumettreReponseEcran(etat, reponses), <Katex expression={formatReponsesEcranLatex(exercice, etat.phase, reponses)} />)
            }
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
