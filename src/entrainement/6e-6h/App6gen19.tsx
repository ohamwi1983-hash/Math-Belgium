import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHyperboliques } from "./generateurs6e/hyperboliques";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionHyperboliques,
  soumettreReponseAParite,
  soumettreReponseBValeurs,
  soumettreReponseCDerivee,
  soumettreReponseCDeriveeSeconde,
  soumettreReponseDLimites,
  soumettreReponseDReecriture,
} from "./moteur6e/sessionHyperboliques";
import { tentativesMaxPhase } from "./moteur6e/typesHyperboliques";
import type { EtatSessionHyperboliques, PhaseHyperboliques } from "./moteur6e/typesHyperboliques";
import { diagnostiquerBValeurs, diagnostiquerCDerivee, diagnostiquerCDeriveeSeconde, diagnostiquerDReecriture, estApproximationB } from "./moteur6e/verificationHyperboliques";
import { formatMessageErreur } from "./ui/messageErreur";
import { Katex } from "./components/Katex";
import { EtapeChampHyperboliques } from "./components6e/EtapeChampHyperboliques";
import { EtapeLimitesHyperboliquesD } from "./components6e/EtapeLimitesHyperboliquesD";
import { EtapeListeValeursHyperboliques } from "./components6e/EtapeListeValeursHyperboliques";
import { EtapeStatutPariteHyperboliques } from "./components6e/EtapeStatutPariteHyperboliques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { CONSIGNE_GENERALE, aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, etatActuel, reponseAttendueLatex } from "./ui6e/formatHyperboliques";
import { LIBELLE_PHASE_HYPERBOLIQUES, calculerRecapitulatifHyperboliques, calculerSegmentsProgressionHyperboliques, sequenceReelleHyperboliques } from "./ui6e/recapitulatifHyperboliques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionHyperboliques {
  return demarrerSessionHyperboliques(REGLAGES_DEMO, genererExerciceHyperboliques);
}

/** Première session : l'exercice imprimé sur une feuille (`?code=XXXXXX`) s'il y en a un — MÊMES
 * fonctions de génération que l'adaptateur d'export (`generateurs6e/hyperboliques/exportEvaluation.ts`). */
function sessionInitiale(): EtatSessionHyperboliques {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionHyperboliques(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceHyperboliques, (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
}

/** Exemples de saisie HORS de l'espace des tirages (k ≤ 3 et |a|,|b| ≤ 3 en C ; a+b ≤ 7 en D ;
 * √7 n'est jamais une valeur de B) — un exemple ne doit jamais être la réponse. */
const PLACEHOLDER_VALEUR_B = "ex : sqrt(7)";
const PLACEHOLDERS: Partial<Record<PhaseHyperboliques, string>> = {
  cDerivee: "ex : 5*ch(5*x)+sh(5*x)",
  cDeriveeSeconde: "ex : 25*sh(5*x)",
  dReecriture: "ex : 9*exp(x)+exp(-x)",
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
  const [etat, setEtat] = useState<EtatSessionHyperboliques>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionHyperboliques`, jamais dans le moteur. Remis à vide à chaque
   * nouvel exercice (mêmes endroits que `enAttente`). L'aide PAR PHASE DÉJÀ CLOSE n'a pas besoin
   * d'être trackée ici séparément : elle est déjà persistée côté moteur
   * (`detailsPartiels[phase].niveauAide`, voir `DetailPhaseHyperboliques`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice », panneau dev) — fait partie de la
   * `key` des écrans pour qu'aucune saisie/sélection ne survive d'un exercice au suivant, même
   * quand la phase est identique (famille A : un seul écran). */
  const [numeroExercice, setNumeroExercice] = useState(0);

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
            titre: LIBELLE_PHASE_HYPERBOLIQUES[etat.phase],
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
      setNumeroExercice((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
    setFicheOuverteIndex(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionHyperboliques(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const donnees = blocDonnees(exercice);
  const etatAct = etatActuel(exercice, phase);
  const consigne = consigneEcran(exercice, phase);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxPhase(phase, etat.reglages.tentativesMax);
  const cle = `${numeroExercice}-${phase}`;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(exercice, phase);
  const aide2 = aideNiveau2(exercice, phase);

  function diagnostiquerChampUnique(texte: string) {
    switch (phase) {
      case "cDerivee":
        return exercice.famille === "C" ? diagnostiquerCDerivee(exercice, texte) : "parse_error";
      case "cDeriveeSeconde":
        return exercice.famille === "C" ? diagnostiquerCDeriveeSeconde(exercice, texte) : "parse_error";
      case "dReecriture":
        return exercice.famille === "D" ? diagnostiquerDReecriture(exercice, texte) : "parse_error";
      default:
        return "parse_error" as const;
    }
  }

  function onValiderChampUnique(texte: string) {
    if (phase === "cDerivee") return terminerEtape(soumettreReponseCDerivee(etat, texte), texte);
    if (phase === "cDeriveeSeconde") return terminerEtape(soumettreReponseCDeriveeSeconde(etat, texte), texte);
    return terminerEtape(soumettreReponseDReecriture(etat, texte), texte);
  }

  function messageErreurB(textes: string[], utilisees: number, max: number): string {
    if (exercice.famille !== "B") return formatMessageErreur(utilisees, max);
    if (estApproximationB(exercice, textes)) return `Valeur approchée — donne la valeur EXACTE, avec une racine (sqrt(…)). Tentative ${utilisees}/${max}.`;
    return formatMessageErreur(utilisees, max, diagnostiquerBValeurs(exercice, textes));
  }

  /** Réponse attendue de l'écran courant, en LaTeX — la même que le récapitulatif et le corrigé. */
  const reponseAttenduePhase = () => <Katex expression={reponseAttendueLatex(exercice, phase)} block />;

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
  const sequence = sequenceReelleHyperboliques(exercice);
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
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifHyperboliques(etat)} />
        {phase === "aParite" && (
              <EtapeStatutPariteHyperboliques
                key={cle}
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
                key={cle}
                consigneGenerale={CONSIGNE_GENERALE}
                blocDonnees={donnees}
                etatActuel={etatAct}
                consigneEcran={consigne}
                placeholder={PLACEHOLDER_VALEUR_B}
                labelAjout="+ Ajouter une valeur"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(textes) => terminerEtape(soumettreReponseBValeurs(etat, textes), textes.join(" ; "))}
                messageErreur={messageErreurB}
                validation={validation}
              />
            )}

            {phase === "dLimites" && (
              <EtapeLimitesHyperboliquesD
                key={cle}
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
                key={cle}
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
