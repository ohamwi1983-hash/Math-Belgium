import { useState } from "react";
import type { ReactNode } from "react";
import type { RacineEtudeLocale } from "./core5e/etudeLocale.types";
import type { EnsembleReelGuide } from "./core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudeLocale } from "./generateurs5e/etudeLocale/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionEtudeLocale,
  niveauAideMaxEtudeLocale,
  soumettreReponseDomaine,
  soumettreReponseExtremums,
  soumettreReponseInflexions,
  soumettreReponseResoudreFPrime,
  soumettreReponseResoudreFSeconde,
  soumettreReponseTableauFPrime,
  soumettreReponseTableauFSeconde,
  tentativesMaxEcranEtudeLocale,
} from "./moteur5e/sessionEtudeLocale";
import type { EcranEtudeLocale, EtatSessionEtudeLocale } from "./moteur5e/typesEtudeLocale";
import { ordreEcransEtudeLocale, structureFixeEtudeLocale } from "./moteur5e/typesEtudeLocale";
import {
  ciblesRacinesFPrime,
  ciblesRacinesFSeconde,
  ciblesValeursExtremums,
  ciblesValeursInflexions,
  contientArrondiRationnel,
  diagnostiquerChampParmiCiblesExactes,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
} from "./moteur5e/verificationEtudeLocale";
import type { CibleNumerique } from "./moteur5e/verificationEtudeLocale";
import type { ReponseTableauEtudeLocale } from "./moteur5e/verificationEtudeLocale";
import { formatTermesEnsembleReelLatex } from "./ui5e/formatDomaineDefinition";
import { EtapeDomaineEtudeLocale } from "./components5e/EtapeDomaineEtudeLocale";
import { EtapeChampsNumeriquesEtudeLocale } from "./components5e/EtapeChampsNumeriquesEtudeLocale";
import { EtapeZerosDeriveeEtudeLocale } from "./components5e/EtapeZerosDeriveeEtudeLocale";
import { EtapeTableauEtudeLocale } from "./components5e/EtapeTableauEtudeLocale";
import { TableauEtudeLocaleRecap } from "./components5e/TableauEtudeLocaleRecap";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { calculerRecapitulatifEtudeLocale } from "./ui5e/recapitulatifEtudeLocale";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import {
  formatEnteteColonnesTableau,
  formatReponseAttenduePhaseLatex,
  labelsChampsValeurF,
  PLACEHOLDER_VALEUR_F,
  precisionAnnonceeCibles,
} from "./ui5e/formatEtudeLocale";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionEtudeLocale {
  return demarrerSessionEtudeLocale(REGLAGES_DEMO, genererExerciceEtudeLocale);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions que l'adaptateur d'export
 * (`generateurs5e/etudeLocale/exportEvaluation.ts`) ; la suite reste un tirage normal. */
function sessionInitiale(): EtatSessionEtudeLocale {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionEtudeLocale(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceEtudeLocale, (id) => construireAvecVarianteId(id)));
}

function racinesExtremumsRetenues(exercice: EtatSessionEtudeLocale["exerciceCourant"]): RacineEtudeLocale[] {
  return exercice.racinesFPrime.filter((_, i) => exercice.classificationFPrime[i] !== "ni_lun_ni_lautre");
}

function racinesInflexionsRetenues(exercice: EtatSessionEtudeLocale["exerciceCourant"]): RacineEtudeLocale[] {
  return exercice.racinesFSeconde.filter((_, i) => exercice.classificationFSeconde[i] === "pi");
}

/** Réponse réellement attendue de l'écran qui vient de se clore — même dispatch que l'ancien
 * `ResultatPanelEtudeLocale.tsx` (supprimé, remplacé par la validation inline) : les écrans
 * "tableauFPrime"/"tableauFSeconde" rendent le tableau étendu en lecture seule plutôt qu'une simple
 * ligne de fragments Katex. */
function reponseAttendueEtudeLocale(exercice: EtatSessionEtudeLocale["exerciceCourant"], ecran: EcranEtudeLocale) {
  if (ecran === "tableauFPrime" || ecran === "tableauFSeconde") {
    const mode = ecran === "tableauFPrime" ? "fprime" : "fseconde";
    const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
    const enteteColonnes = formatEnteteColonnesTableau(exercice, attendu.colonnes, mode);
    return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={enteteColonnes} mode={mode} attendu={attendu} />;
  }
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, ecran).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

const MESSAGE_ILLISIBLE = "Écriture non reconnue : vérifie ta saisie (cette tentative n'est pas décomptée).";
const MESSAGE_ARRONDI = "Valeur arrondie : donne la valeur exacte (fraction ou décimal exact). Cette tentative n'est pas décomptée.";

/** Contrôle de FORME avant soumission (saisie illisible, arrondi d'une valeur rationnelle) : la
 * tentative n'est pas décomptée (audit 5e ch. 5, décision I). */
function controlerSaisieNumerique(reponses: string[], cibles: CibleNumerique[]): string | null {
  if (reponses.some((t) => diagnostiquerChampParmiCiblesExactes(t, cibles) === "parse_error")) return MESSAGE_ILLISIBLE;
  return contientArrondiRationnel(reponses, cibles) ? MESSAGE_ARRONDI : null;
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionEtudeLocale;
  revele: boolean;
}

/** Puces de progression — structure FIXE (`structureFixeEtudeLocale`, déduite du type de f et de
 * la présence de f'', donc de ce que l'élève voit déjà) : leur nombre ne révèle plus la structure
 * (2 puces = racine double…) dès le premier écran (audit 5e ch. 5, décision J). Un écran prévu mais
 * sans objet pour cet exercice (aucun extremum à évaluer) n'apparaît comme « sans-objet » qu'une
 * fois dépassé — ou dès la validation du dernier écran réel (`exerciceTermine`). Icône "revele"
 * pilotée par `etat.revelesPartiels[ecran]` (jamais `scoresPartiels[ecran] === 0`, point A). */
function calculerSegmentsProgression(
  etat: EtatSessionEtudeLocale,
  aideParPhase: Partial<Record<EcranEtudeLocale, boolean>>,
  exerciceTermine: boolean,
): EtatPuceProgression[] {
  const structure = structureFixeEtudeLocale(etat.exerciceCourant);
  const reels = ordreEcransEtudeLocale(etat.exerciceCourant);
  const indexCourant = structure.indexOf(etat.phase);
  return structure.map((ecran, i) => {
    if (!reels.includes(ecran)) return i < indexCourant || exerciceTermine ? "sans-objet" : "a-venir";
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[ecran]) return "revele";
    return aideParPhase[ecran] ? "aide" : "correcte";
  });
}

/** Index dans l'historique (écrans RÉELLEMENT clos, dans l'ordre) d'une puce de la structure fixe —
 * `null` pour une puce sans objet. */
function indexHistoriquePourPuce(etat: EtatSessionEtudeLocale, indexPuce: number): number | null {
  const ecran = structureFixeEtudeLocale(etat.exerciceCourant)[indexPuce];
  const reels = ordreEcransEtudeLocale(etat.exerciceCourant);
  const i = reels.indexOf(ecran);
  return i === -1 ? null : i;
}

/** Texte court pour un ensemble réel saisi par l'élève (écran "domaine") — réutilise
 * `formatTermesEnsembleReelLatex` (même source que `App5gen3.tsx::LigneDomaineTermes`), affiché via
 * KaTeX plutôt que du LaTeX brut. */
function TexteEnsembleReel({ ensemble }: { ensemble: EnsembleReelGuide }) {
  const termes = formatTermesEnsembleReelLatex(ensemble);
  return (
    <span className="equation-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </span>
  );
}

/** Texte court pour une réponse de tableau de signes/variations (écrans "tableauFPrime"/
 * "tableauFSeconde") — énumère les valeurs saisies colonne par colonne, jamais recalculé depuis
 * l'attendu (qui reste dans `reponseAttendueEtudeLocale`, jamais ici). */
function texteTableauEtudeLocale(reponse: ReponseTableauEtudeLocale): string {
  const signes = reponse.signes.map((s) => s ?? "?").join(" ");
  const ligne2 = reponse.ligne2.map((v) => v ?? "·").join(" ");
  return `signes : ${signes} ; ligne 2 : ${ligne2}`;
}

export function App5gen29() {
  const [etat, setEtat] = useState<EtatSessionEtudeLocale>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionEtudeLocale`, jamais dans le moteur (même principe que `AppAnalyseFonction.tsx`, 4e). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Niveau d'aide RÉELLEMENT utilisé par écran close — capturé ici (présentation), `niveauAide`
   * (moteur) étant remis à 0 à chaque transition (même patron que `App5gen31.tsx::aideParPhase`). */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<EcranEtudeLocale, boolean>>>({});
  /** Compteur de génération dans la clé d'écran : les champs repartent vides après « Nouvel
   * exercice » ou « Générer » (même patron que `App5gen20.tsx`). */
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionEtudeLocale) {
    const recap = calculerRecapitulatifEtudeLocale(nouvelEtat);
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

  function terminerEtape(nouvelEtat: EtatSessionEtudeLocale, votreReponse?: ReactNode) {
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
    setEtat(demarrerSessionEtudeLocale(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxEcranEtudeLocale(etat);
  const cleEcran = `${numeroGeneration}-${etat.indexExercice}-${etat.phase}`;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueEtudeLocale(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Étude locale (extremums et points critiques)</h1>
        <p className="app-subtitle">Chapitre 5 — Dérivées et applications</p>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideParPhase, enAttente?.etatSuivant.terminee ?? false)}
          onSegmentClick={(index) => setFicheOuverteIndex(indexHistoriquePourPuce(etat, index))}
        />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifEtudeLocale(etat)} />
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
  exercice: EtatSessionEtudeLocale["exerciceCourant"];
  phase: EcranEtudeLocale;
  etat: EtatSessionEtudeLocale;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionEtudeLocale, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionEtudeLocale) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxEtudeLocale();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "domaine":
      return (
        <EtapeDomaineEtudeLocale
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse), <TexteEnsembleReel ensemble={reponse} />)}
          validation={validation}
        />
      );

    case "resoudreFPrime": {
      return (
        <EtapeZerosDeriveeEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="resoudreFPrime"
          precisionAnnoncee={precisionAnnonceeCibles(ciblesRacinesFPrime(exercice))}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseResoudreFPrime(etat, reponses), reponses.join(" ; "))}
          diagnostiquer={(t) => diagnostiquerChampParmiCiblesExactes(t, ciblesRacinesFPrime(exercice))}
          controlerSaisie={(reponses) => controlerSaisieNumerique(reponses, ciblesRacinesFPrime(exercice))}
          validation={validation}
        />
      );
    }

    case "tableauFPrime":
      return (
        <EtapeTableauEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="tableauFPrime"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFPrime(etat, reponse), texteTableauEtudeLocale(reponse))}
          validation={validation}
        />
      );

    case "extremums": {
      const racines = racinesExtremumsRetenues(exercice);
      return (
        <EtapeChampsNumeriquesEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="extremums"
          labels={labelsChampsValeurF(racines)}
          placeholders={racines.map(() => PLACEHOLDER_VALEUR_F)}
          precisionAnnoncee={precisionAnnonceeCibles(ciblesValeursExtremums(exercice))}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseExtremums(etat, reponses), reponses.join(" ; "))}
          diagnostiquer={(t) => diagnostiquerChampParmiCiblesExactes(t, ciblesValeursExtremums(exercice))}
          controlerSaisie={(reponses) => controlerSaisieNumerique(reponses, ciblesValeursExtremums(exercice))}
          validation={validation}
        />
      );
    }

    case "resoudreFSeconde": {
      return (
        <EtapeZerosDeriveeEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="resoudreFSeconde"
          precisionAnnoncee={precisionAnnonceeCibles(ciblesRacinesFSeconde(exercice))}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseResoudreFSeconde(etat, reponses), reponses.join(" ; "))}
          diagnostiquer={(t) => diagnostiquerChampParmiCiblesExactes(t, ciblesRacinesFSeconde(exercice))}
          controlerSaisie={(reponses) => controlerSaisieNumerique(reponses, ciblesRacinesFSeconde(exercice))}
          validation={validation}
        />
      );
    }

    case "tableauFSeconde":
      return (
        <EtapeTableauEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="tableauFSeconde"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFSeconde(etat, reponse), texteTableauEtudeLocale(reponse))}
          validation={validation}
        />
      );

    case "inflexions": {
      const racines = racinesInflexionsRetenues(exercice);
      return (
        <EtapeChampsNumeriquesEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="inflexions"
          labels={labelsChampsValeurF(racines)}
          placeholders={racines.map(() => PLACEHOLDER_VALEUR_F)}
          precisionAnnoncee={precisionAnnonceeCibles(ciblesValeursInflexions(exercice))}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseInflexions(etat, reponses), reponses.join(" ; "))}
          diagnostiquer={(t) => diagnostiquerChampParmiCiblesExactes(t, ciblesValeursInflexions(exercice))}
          controlerSaisie={(reponses) => controlerSaisieNumerique(reponses, ciblesValeursInflexions(exercice))}
          validation={validation}
        />
      );
    }
  }
}
