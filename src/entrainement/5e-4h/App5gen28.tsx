import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import type { ExerciceTangenteDoubleTangence, ExerciceTangenteHorizontale, ExerciceTangentePointDonne } from "./core5e/tangentes.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangente } from "./generateurs5e/tangentes/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { formatReponseAttenduePhaseLatex, labelTangenteEquiv, PLACEHOLDER_EQUATION_TANGENTE } from "./ui5e/formatTangentes";
import {
  activerAideSuivante,
  demarrerSessionTangentes,
  niveauAideMaxTangentes,
  soumettreReponseCoordonnees,
  soumettreReponseResoudre,
  soumettreReponseSubstituer,
  soumettreReponseTangenteEnP,
  soumettreReponseTangentePointDonne,
  soumettreReponseTrouverQ,
  soumettreReponseVerifierPente,
} from "./moteur5e/sessionTangentes";
import type { EcranTangente, EtatSessionTangente } from "./moteur5e/typesTangentes";
import { ordreEcransTangente } from "./moteur5e/typesTangentes";
import {
  diagnostiquerCoordonneeChamp,
  diagnostiquerEquationTangentePointDonne,
  diagnostiquerEquationTangenteP,
  diagnostiquerFAPointDonne,
  diagnostiquerFPrimeAPointDonne,
  diagnostiquerFPrimeP,
  diagnostiquerFPrimeQ,
  diagnostiquerQ,
  diagnostiquerRacineChamp,
  equationTangentePointDonneApprochee,
  estValeurApprochee,
  pointsApproches,
  problemeListePoints,
  problemeListeRacines,
  substitutionApprochee,
} from "./moteur5e/verificationTangentes";
import type { StatutVerification } from "./moteur/statutVerification";
import { EtapeSubstituerTangente } from "./components5e/EtapeSubstituerTangente";
import { EtapeChampUniqueTangente } from "./components5e/EtapeChampUniqueTangente";
import { EtapeRacinesTangente } from "./components5e/EtapeRacinesTangente";
import { EtapeCoordonneesTangente } from "./components5e/EtapeCoordonneesTangente";
import { EtapeTangenteEnP } from "./components5e/EtapeTangenteEnP";
import { calculerRecapitulatifTangentes } from "./ui5e/recapitulatifTangentes";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionTangente {
  return demarrerSessionTangentes(REGLAGES_DEMO, genererExerciceTangente);
}

// ============================================================================
// Contrôles de FORME avant soumission — la tentative n'est pas décomptée (audit 5e ch. 5, points 6,
// 32, 33).
// ============================================================================

const MESSAGE_ILLISIBLE = "Écriture non reconnue : vérifie ta saisie (cette tentative n'est pas décomptée).";
const MESSAGE_ARRONDI = "Valeur arrondie : donne la valeur exacte (racines carrées et fractions acceptées). Cette tentative n'est pas décomptée.";
const MESSAGE_DOUBLON = "Valeur répétée : chaque solution ne s'écrit qu'une fois, même une racine double. Cette tentative n'est pas décomptée.";
const MESSAGE_INCOMPLET = "Tes valeurs sont justes, mais il manque une solution. Cette tentative n'est pas décomptée.";

function contientIllisible(statuts: StatutVerification[]): boolean {
  return statuts.includes("parse_error");
}

/** `-3` → « −3 » (texte brut des fiches). */
function nombreTexte(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

function reponseAttendueTangentes(exercice: EtatSessionTangente["exerciceCourant"], phase: EcranTangente) {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionTangente;
  revele: boolean;
}

/** Même source que `calculerRecapitulatifTangentes` (`etat.revelesPartiels[ecran]`, jamais
 * `scoresPartiels[ecran] === 0` — point A, balayage générique) — `ordreEcransTangente(exercice)`
 * donne la séquence RÉELLE (2 ou 3 écrans selon la variante, fixée dès le tirage). */
function calculerSegmentsProgression(
  etat: EtatSessionTangente,
  aideParPhase: Partial<Record<EcranTangente, boolean>>,
): EtatPuceProgression[] {
  return ordreEcransTangente(etat.exerciceCourant).map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[ecran]) return "revele";
    return aideParPhase[ecran] ? "aide" : "correcte";
  });
}

export function App5gen28() {
  const [etat, setEtat] = useState<EtatSessionTangente>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionTangente`, jamais dans le moteur (même principe que `AppAnalyseFonction.tsx`, 4e). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Niveau d'aide RÉELLEMENT utilisé par écran close — capturé ici (présentation), `niveauAide`
   * (moteur) étant remis à 0 à chaque transition (même patron que `App5gen31.tsx::aideParPhase`). */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<EcranTangente, boolean>>>({});
  /** Compteur de génération dans la clé d'écran : les champs repartent vides après « Nouvel
   * exercice » ou « Générer » (même patron que `App5gen20.tsx`). */
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionTangente) {
    const recap = calculerRecapitulatifTangentes(nouvelEtat);
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

  function terminerEtape(nouvelEtat: EtatSessionTangente, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(votreReponse, nouvelEtat);
      if (etat.niveauAide > 0) setAideParPhase((m) => ({ ...m, [etat.phase]: true }));
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
      setAideParPhase({});
      setNumeroGeneration((g) => g + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setNumeroGeneration((g) => g + 1);
    setEtat(demarrerSessionTangentes(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${numeroGeneration}-${etat.indexExercice}-${etat.phase}`;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueTangentes(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Tangentes</h1>
        <p className="app-subtitle">Chapitre 5 — Dérivées et applications</p>
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifTangentes(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={etat.phase}
            etat={etat}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cleEcran={cleEcran}
            terminerEtape={terminerEtape}
            setEtat={setEtat}
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

interface EcranProps {
  exercice: EtatSessionTangente["exerciceCourant"];
  phase: EcranTangente;
  etat: EtatSessionTangente;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionTangente, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionTangente) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxTangentes();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "substituer": {
      const ex = exercice as ExerciceTangentePointDonne;
      return (
        <EtapeSubstituerTangente
          key={cleEcran}
          exercice={ex}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) =>
            terminerEtape(soumettreReponseSubstituer(etat, reponse), `f(${nombreTexte(ex.a)}) = ${reponse.fA} ; f'(${nombreTexte(ex.a)}) = ${reponse.fPrimeA}`)
          }
          diagnostiquer={(r) => ({ fA: diagnostiquerFAPointDonne(r.fA, ex), fPrimeA: diagnostiquerFPrimeAPointDonne(r.fPrimeA, ex) })}
          controlerSaisie={(r) => {
            if (contientIllisible([diagnostiquerFAPointDonne(r.fA, ex), diagnostiquerFPrimeAPointDonne(r.fPrimeA, ex)])) return MESSAGE_ILLISIBLE;
            return substitutionApprochee(r, ex) ? MESSAGE_ARRONDI : null;
          }}
          validation={validation}
        />
      );
    }

    case "tangente": {
      const ex = exercice as ExerciceTangentePointDonne;
      return (
        <EtapeChampUniqueTangente
          key={cleEcran}
          exercice={ex}
          phase="tangente"
          labelChamp={labelTangenteEquiv(ex.a)}
          placeholder={PLACEHOLDER_EQUATION_TANGENTE}
          avecCalculatrice={false}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseTangentePointDonne(etat, texte), texte)}
          diagnostiquer={(t) => diagnostiquerEquationTangentePointDonne(t, ex)}
          estApprochee={(t) => equationTangentePointDonneApprochee(t, ex)}
          validation={validation}
        />
      );
    }

    case "resoudre": {
      const ex = exercice as ExerciceTangenteHorizontale;
      return (
        <EtapeRacinesTangente
          key={cleEcran}
          exercice={ex}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseResoudre(etat, reponses), reponses.join(" ; "))}
          diagnostiquer={(t) => diagnostiquerRacineChamp(t, ex)}
          controlerSaisie={(reponses) => {
            if (contientIllisible(reponses.map((t) => diagnostiquerRacineChamp(t, ex)))) return MESSAGE_ILLISIBLE;
            const probleme = problemeListeRacines(reponses, ex);
            if (probleme === "doublon") return MESSAGE_DOUBLON;
            if (probleme === "incomplet") return MESSAGE_INCOMPLET;
            return reponses.some((t) => ex.racines.some((r) => estValeurApprochee(t, r))) ? MESSAGE_ARRONDI : null;
          }}
          validation={validation}
        />
      );
    }

    case "coordonnees": {
      const ex = exercice as ExerciceTangenteHorizontale;
      return (
        <EtapeCoordonneesTangente
          key={cleEcran}
          exercice={ex}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) =>
            terminerEtape(soumettreReponseCoordonnees(etat, reponses), reponses.map((p) => `(${p.x} ; ${p.y})`).join(" ; "))
          }
          diagnostiquer={(point) => diagnostiquerCoordonneeChamp(point, ex)}
          controlerSaisie={(points) => {
            if (contientIllisible(points.flatMap((pt) => { const d = diagnostiquerCoordonneeChamp(pt, ex); return [d.x, d.y]; }))) return MESSAGE_ILLISIBLE;
            const probleme = problemeListePoints(points, ex);
            if (probleme === "doublon") return MESSAGE_DOUBLON.replace("chaque solution", "chaque point");
            if (probleme === "incomplet") return MESSAGE_INCOMPLET.replace("une solution", "un point");
            return pointsApproches(points, ex) ? MESSAGE_ARRONDI : null;
          }}
          validation={validation}
        />
      );
    }

    case "tangenteEnP": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return (
        <EtapeTangenteEnP
          key={cleEcran}
          exercice={ex}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) =>
            terminerEtape(soumettreReponseTangenteEnP(etat, reponse), `f'(${nombreTexte(ex.p)}) = ${reponse.fPrimeP} ; tangente : ${reponse.tangente}`)
          }
          diagnostiquer={(r) => ({ fPrimeP: diagnostiquerFPrimeP(r.fPrimeP, ex), tangente: diagnostiquerEquationTangenteP(r.tangente, ex) })}
          controlerSaisie={(r) =>
            contientIllisible([diagnostiquerFPrimeP(r.fPrimeP, ex), diagnostiquerEquationTangenteP(r.tangente, ex)]) ? MESSAGE_ILLISIBLE : null
          }
          validation={validation}
        />
      );
    }

    case "trouverQ": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return (
        <EtapeChampUniqueTangente
          key={cleEcran}
          exercice={ex}
          phase="trouverQ"
          labelChamp="q="
          placeholder="ex : 0,5"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseTrouverQ(etat, texte), `q = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerQ(t, ex)}
          validation={validation}
        />
      );
    }

    case "verifierPente": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return (
        <EtapeChampUniqueTangente
          key={cleEcran}
          exercice={ex}
          phase="verifierPente"
          labelChamp={`f'(${ex.q})=`}
          placeholder="ex : 0,5"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseVerifierPente(etat, texte), `f'(${nombreTexte(ex.q)}) = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerFPrimeQ(t, ex)}
          validation={validation}
        />
      );
    }
  }
}
