import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHyperboliques } from "./generateurs6e/hyperboliques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionHyperboliques,
  soumettreReponseAParite,
  soumettreReponseBIsoler,
  soumettreReponseBValeurs,
  soumettreReponseCDerivee,
  soumettreReponseCDeriveeSeconde,
  soumettreReponseCRelation,
  soumettreReponseDLimites,
  soumettreReponseDReecriture,
} from "./moteur6e/sessionHyperboliques";
import { phaseApres, phaseInitiale } from "./moteur6e/typesHyperboliques";
import type { EtatSessionHyperboliques, PhaseHyperboliques } from "./moteur6e/typesHyperboliques";
import {
  diagnostiquerBIsoler,
  diagnostiquerCDerivee,
  diagnostiquerCDeriveeSeconde,
  diagnostiquerCRelation,
  diagnostiquerDReecriture,
} from "./moteur6e/verificationHyperboliques";
import { EtapeChampHyperboliques } from "./components6e/EtapeChampHyperboliques";
import { EtapeLimitesHyperboliquesD } from "./components6e/EtapeLimitesHyperboliquesD";
import { EtapeListeValeursHyperboliques } from "./components6e/EtapeListeValeursHyperboliques";
import { EtapeStatutPariteHyperboliques } from "./components6e/EtapeStatutPariteHyperboliques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { CONSIGNE_GENERALE, aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, etatActuel } from "./ui6e/formatHyperboliques";
import { calculerRecapitulatifHyperboliques, calculerSegmentsProgressionHyperboliques } from "./ui6e/recapitulatifHyperboliques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/** Même libellé, phase par phase, que `LIBELLE_PHASE` (`ui6e/recapitulatifHyperboliques.ts`, non
 * exporté) — répliqué ICI pour la fiche de consultation. */
const LIBELLE_PHASE: Record<PhaseHyperboliques, string> = {
  aParite: "Parité",
  bIsoler: "Inconnue isolée",
  bValeurs: "Valeur(s)",
  cDerivee: "f'(x)",
  cDeriveeSeconde: "f''(x)",
  cRelation: "Coefficient k²",
  dReecriture: "f(x) réécrite",
  dLimites: "Signes des limites",
};

/** Séquence RÉELLEMENT traversée par la famille de l'exercice courant — même reconstruction que
 * `sequenceReelle` (`ui6e/recapitulatifHyperboliques.ts`, non exporté), répliquée ICI à partir de
 * `phaseInitiale`/`phaseApres` pour aligner l'index des segments de `ProgressionPuces` sur celui de
 * `historique`. */
function sequenceReelle(exercice: Parameters<typeof phaseInitiale>[0]): PhaseHyperboliques[] {
  const sequence: PhaseHyperboliques[] = [];
  let phase: PhaseHyperboliques | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase);
  }
  return sequence;
}

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionHyperboliques {
  return demarrerSessionHyperboliques(REGLAGES_DEMO, genererExerciceHyperboliques);
}

const PLACEHOLDERS: Partial<Record<PhaseHyperboliques, string>> = {
  bIsoler: "ex : sqrt(1+3^2)",
  cDerivee: "ex : 3*(2*ch(3*x)-sh(3*x))",
  cDeriveeSeconde: "ex : 9*(2*sh(3*x)-ch(3*x))",
  cRelation: "ex : 9",
  dReecriture: "ex : ((2+3)*exp(x)+(3-2)*exp(-x))/2",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionHyperboliques;
  revele: boolean;
}

export function App6gen19() {
  const [etat, setEtat] = useState<EtatSessionHyperboliques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionHyperboliques`, jamais dans le moteur. Remis à vide à chaque
   * nouvel exercice (mêmes endroits que `enAttente`). L'aide PAR PHASE DÉJÀ CLOSE n'a pas besoin
   * d'être trackée ici séparément : elle est déjà persistée côté moteur
   * (`detailsPartiels[phase].niveauAide`, voir `DetailPhaseHyperboliques`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionHyperboliques, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // La phase qui vient PRÉCISÉMENT de se fermer est `etat.phase` (pas `nouvelEtat.phase`) — son
      // détail vit soit dans `detailsPartiels` (écran intermédiaire), soit dans le `resultats` qui
      // vient d'être poussé (dernier écran de l'exercice), même principe que `App6gen7.tsx`.
      const exerciceVientDeFinir = nouvelEtat.resultats.length > etat.resultats.length;
      const detail = exerciceVientDeFinir
        ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1].details[etat.phase]
        : nouvelEtat.detailsPartiels[etat.phase];
      const revele = detail?.revele ?? false;
      // `votreReponse` : UNIQUEMENT poussée dans l'historique dans cette branche de transition
      // RÉELLE — jamais à chaque clic sur "Valider".
      if (votreReponse !== undefined) {
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[etat.phase],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? reponseAttenduePhase() : undefined,
          },
        ]);
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
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setEtat(demarrerSessionHyperboliques(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const donnees = blocDonnees(exercice);
  const etatAct = etatActuel(exercice, phase);
  const consigne = consigneEcran(exercice, phase);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(exercice, phase);
  const aide2 = aideNiveau2(exercice, phase);

  function diagnostiquerChampUnique(texte: string) {
    switch (phase) {
      case "bIsoler":
        return exercice.famille === "B" ? diagnostiquerBIsoler(exercice, texte) : "parse_error";
      case "cDerivee":
        return exercice.famille === "C" ? diagnostiquerCDerivee(exercice, texte) : "parse_error";
      case "cDeriveeSeconde":
        return exercice.famille === "C" ? diagnostiquerCDeriveeSeconde(exercice, texte) : "parse_error";
      case "cRelation":
        return exercice.famille === "C" ? diagnostiquerCRelation(exercice, texte) : "parse_error";
      case "dReecriture":
        return exercice.famille === "D" ? diagnostiquerDReecriture(exercice, texte) : "parse_error";
      default:
        return "parse_error" as const;
    }
  }

  function onValiderChampUnique(texte: string) {
    if (phase === "bIsoler") return terminerEtape(soumettreReponseBIsoler(etat, texte), texte);
    if (phase === "cDerivee") return terminerEtape(soumettreReponseCDerivee(etat, texte), texte);
    if (phase === "cDeriveeSeconde") return terminerEtape(soumettreReponseCDeriveeSeconde(etat, texte), texte);
    if (phase === "cRelation") return terminerEtape(soumettreReponseCRelation(etat, texte), texte);
    return terminerEtape(soumettreReponseDReecriture(etat, texte), texte);
  }

  // Réplique exactement le contenu (par écran RÉELLEMENT traversé) de l'ancien
  // `ResultatPanelHyperboliques.tsx` — jamais une cible recalculée séparément.
  const reponseAttenduePhase = () => {
    if (phase === "aParite") return "Parité déterminée en comparant f(−x) à f(x) et à −f(x).";
    if (phase === "bIsoler") return "Inconnue isolée à partir de l'identité ch²(x0)−sh²(x0)=1.";
    if (phase === "bValeurs") return "Calculée(s) à partir de l'expression confirmée à l'étape précédente.";
    if (phase === "cDerivee") return "f'(x) calculée via sh'=ch et ch'=sh, avec la chaîne pour l'argument kx.";
    if (phase === "cDeriveeSeconde") return "f''(x) calculée à partir de f'(x) confirmée à l'étape précédente.";
    if (phase === "cRelation") return "Coefficient k² identifié à partir de f''(x) confirmée à l'étape précédente.";
    if (phase === "dReecriture") return "f(x) réécrite en termes de eˣ et e⁻ˣ.";
    if (phase === "dLimites") return "Signe de chaque limite déduit de la forme confirmée à l'étape précédente.";
    return null;
  };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  // "aide" (puce jaune) : post-traite les segments déjà calculés par `calculerSegmentsProgressionHyperboliques`
  // avec `detailsPartiels[phase].niveauAide`, déjà persisté côté moteur (jamais recalculé ici).
  const sequence = sequenceReelle(exercice);
  const segments: EtatPuceProgression[] = calculerSegmentsProgressionHyperboliques(etat).map((segment, index) => {
    if (segment !== "correcte") return segment;
    const detail = etat.detailsPartiels[sequence[index]];
    return detail && detail.niveauAide > 0 ? "aide" : segment;
  });

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Sinus et cosinus hyperboliques (sh, ch)</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifHyperboliques(etat)} />
        {phase === "aParite" && (
              <EtapeStatutPariteHyperboliques
                key={phase}
                consigneGenerale={CONSIGNE_GENERALE}
                blocDonnees={donnees}
                consigneEcran={consigne}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(choix) =>
                  terminerEtape(soumettreReponseAParite(etat, choix), choix === "paire" ? "Paire" : choix === "impaire" ? "Impaire" : "Ni l'une ni l'autre")
                }
                validation={validation}
              />
            )}

            {phase === "bValeurs" && (
              <EtapeListeValeursHyperboliques
                key={phase}
                consigneGenerale={CONSIGNE_GENERALE}
                blocDonnees={donnees}
                etatActuel={etatAct}
                consigneEcran={consigne}
                placeholder="ex : sqrt(8)"
                labelAjout="+ Ajouter une valeur"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(textes) => terminerEtape(soumettreReponseBValeurs(etat, textes), textes.join(" ; "))}
                validation={validation}
              />
            )}

            {phase === "dLimites" && (
              <EtapeLimitesHyperboliquesD
                key={phase}
                consigneGenerale={CONSIGNE_GENERALE}
                blocDonnees={donnees}
                etatActuel={etatAct}
                consigneEcran={consigne}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => {
                  const signe = (s: typeof reponse.plusInfini) => (s === "plus_infini" ? "+∞" : "−∞");
                  terminerEtape(soumettreReponseDLimites(etat, reponse), `+∞ : ${signe(reponse.plusInfini)} ; −∞ : ${signe(reponse.moinsInfini)}`);
                }}
                validation={validation}
              />
            )}

            {phase !== "aParite" && phase !== "bValeurs" && phase !== "dLimites" && (
              <EtapeChampHyperboliques
                key={phase}
                consigneGenerale={CONSIGNE_GENERALE}
                blocDonnees={donnees}
                etatActuel={etatAct}
                consigneEcran={consigne}
                placeholder={PLACEHOLDERS[phase] ?? "ex : sh(x)+ch(x)"}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={onValiderChampUnique}
                diagnostiquer={diagnostiquerChampUnique}
                validation={validation}
              />
            )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
