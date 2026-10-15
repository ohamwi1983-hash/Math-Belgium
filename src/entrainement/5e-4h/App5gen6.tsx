import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceArcSecteur, QuantiteArcSecteur } from "./core5e/arcsSecteurs.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { genererExerciceArcSecteur, genererExerciceConversion, genererExerciceDeuxVersTrois } from "./generateurs5e/arcsSecteurs";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_MODE = [
  { id: "deuxVersTrois", label: "2 données → 3 inconnues" },
  { id: "conversion", label: "Conversion pure (deg ↔ rad)" },
];
import {
  NIVEAU_AIDE_MAX_ARC_SECTEUR,
  activerAideSuivante,
  demarrerSessionArcSecteur,
  soumettreReponseArcSecteur,
} from "./moteur5e/sessionArcsSecteurs";
import type { EtatSessionArcSecteur, PhaseArcSecteur } from "./moteur5e/typesArcsSecteurs";
import { quantitesManquantes } from "./moteur5e/typesArcsSecteurs";
import { diagnostiquerValeurArcSecteur } from "./moteur5e/verificationArcsSecteurs";
import { EtapeConversionArcSecteur } from "./components5e/EtapeConversionArcSecteur";
import { EtapeQuantiteArcSecteur } from "./components5e/EtapeQuantiteArcSecteur";
import { formatValeurCibleConversionLatex, formatValeurQuantiteLatex, LABELS, segmentsDonneesConnues } from "./ui5e/formatArcsSecteurs";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components5e/EnTeteExercice";

const CONSIGNE_GENERALE = "Calcule la longueur de cet arc ou l'aire de ce secteur.";
import { calculerRecapitulatifArcSecteur } from "./ui5e/recapitulatifArcSecteur";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionArcSecteur {
  return demarrerSessionArcSecteur(REGLAGES_DEMO, genererExerciceArcSecteur);
}

/** Révèle le champ `revele` de la phase qui vient de se terminer (`phase` = `etat.phase`, AVANT la
 * mise à jour). Non terminal (mode "deuxVersTrois", encore des quantités à traiter) : lu
 * directement sur `nouvelEtat.revelesPartiels` (mis à jour par le moteur). Terminal (dernière
 * quantité du mode "deuxVersTrois", ou unique écran du mode "conversion") :
 * `cloturerExerciceOuSuivant` ne pose ce champ que DANS le `resultats` ajouté. */
function releveDeLaPhase(phase: PhaseArcSecteur, nouvelEtat: EtatSessionArcSecteur): boolean {
  if (nouvelEtat.terminee) {
    const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
    return resultat.mode === "conversion" ? resultat.revele : (resultat.reveles[phase as QuantiteArcSecteur] ?? false);
  }
  return nouvelEtat.revelesPartiels[phase as QuantiteArcSecteur] ?? false;
}

/** Réponse attendue de la phase qui vient de se terminer — réplique exactement la `LigneRecap`
 * correspondante de l'ancien `ResultatPanelArcSecteur.tsx`. Dérivée PUREMENT de `exercice` (aucune
 * valeur RETENUE par continuité dans ce générateur, contrairement à 5gen5). */
function reponseAttenduePhase(exercice: ExerciceArcSecteur, phase: PhaseArcSecteur): ReactNode {
  if (exercice.mode === "conversion") return <Katex expression={formatValeurCibleConversionLatex(exercice)} />;
  return <Katex expression={formatValeurQuantiteLatex(phase as QuantiteArcSecteur, exercice)} />;
}

/** Une puce par quantité manquante (mode "deuxVersTrois", séquence dynamique — voir
 * `quantitesManquantes`) — une seule puce toujours "courante" pour le mode "conversion" (unique
 * écran, jamais de séquence à proprement parler). */
function calculerSegmentsProgression(
  etat: EtatSessionArcSecteur,
  aideUtiliseeParPhase: Partial<Record<string, boolean>>,
): EtatPuceProgression[] {
  const exercice = etat.exerciceCourant;
  if (exercice.mode === "conversion") return ["courante"];
  return quantitesManquantes(exercice).map((quantite) => {
    if (quantite === etat.phase) return "courante";
    const revele = etat.revelesPartiels[quantite];
    if (revele === undefined) return "a-venir";
    if (revele) return "revele";
    return aideUtiliseeParPhase[quantite] ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionArcSecteur;
  revele: boolean;
}

export function App5gen6() {
  const [etat, setEtat] = useState<EtatSessionArcSecteur>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des quantités déjà closes (puces cliquables de
   * `ProgressionPuces`, mode "deuxVersTrois" uniquement — le mode "conversion" n'a qu'un seul écran,
   * toujours "courante", jamais clos ni consultable) — tenu ICI, à part de
   * `EtatSessionArcSecteur`, jamais dans le moteur. Remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<string, boolean>>>({});

  /** Réutilise `reponseAttenduePhase` — EXACTEMENT la même source que la bannière `validation`
   * ci-dessous pour l'écran COURANT revélé. */
  function ajouterHistorique(votreReponse: ReactNode, phaseClose: PhaseArcSecteur, nouvelEtat: EtatSessionArcSecteur) {
    const revele = releveDeLaPhase(phaseClose, nouvelEtat);
    setHistorique((h) => [
      ...h,
      {
        titre: LABELS[phaseClose as QuantiteArcSecteur],
        votreReponse,
        correcte: !revele,
        reponseAttendue: revele ? reponseAttenduePhase(nouvelEtat.exerciceCourant, phaseClose) : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT poussée dans l'historique quand l'écran se clôt RÉELLEMENT (même
   * garde `transitionDEcran` que celui qui déclenche déjà `setEnAttente`), et JAMAIS pour la
   * DERNIÈRE quantité de l'exercice (mode "deuxVersTrois") — jamais consultable, même principe que
   * les autres générateurs 5e déjà migrés. Le mode "conversion" ne passe JAMAIS de `votreReponse`
   * du tout (son unique appelant, ci-dessous, ne passe que l'argument `nouvelEtat`) : son unique
   * écran n'est jamais clos tant qu'il est affiché (`calculerSegmentsProgression` le garde toujours
   * "courante"), donc rien à consulter. */
  function terminerEtape(nouvelEtat: EtatSessionArcSecteur, votreReponse?: ReactNode) {
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
    setEtat(demarrerSessionArcSecteur(REGLAGES_DEMO, id === "conversion" ? genererExerciceConversion : genererExerciceDeuxVersTrois));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

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
        <h1 className="app-title">Arcs et secteurs</h1>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
      </header>
      <SelecteurVarianteDev options={OPTIONS_MODE} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              exercice.mode === "deuxVersTrois" ? (
                <div className="equation-box equation-box-donnees">
                  {segmentsDonneesConnues(exercice, exercice.connues).map((s, i) => (
                    <Katex key={i} expression={s} />
                  ))}
                </div>
              ) : null
            }
          />
          <RecapitulatifPanel entrees={calculerRecapitulatifArcSecteur(etat)} />
          {exercice.mode === "deuxVersTrois" && (
            <EtapeQuantiteArcSecteur
              key={etat.phase}
              exercice={exercice}
              phase={etat.phase as QuantiteArcSecteur}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX_ARC_SECTEUR}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseArcSecteur(etat, texte), `${LABELS[etat.phase as QuantiteArcSecteur]} = ${texte}`)}
              diagnostiquer={(texte) => diagnostiquerValeurArcSecteur(texte, exercice.valeurs[etat.phase as QuantiteArcSecteur])}
              validation={validation}
            />
          )}
          {exercice.mode === "conversion" && (
            <EtapeConversionArcSecteur
              exercice={exercice}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX_ARC_SECTEUR}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseArcSecteur(etat, texte))}
              diagnostiquer={(texte) => diagnostiquerValeurArcSecteur(texte, exercice.valeurCible)}
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
