import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceExtremaBornes } from "./generateurs5e/extremaBornes/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivanteExtremaBornes,
  demarrerSessionExtremaBornes,
  niveauAideMaxExtremaBornes,
  soumettreReponseComparaisonBorne,
  soumettreReponseDeriverBorne,
  soumettreReponseTableauFPrimeBorne,
  soumettreReponseValeursBornes,
  soumettreReponseValeursExtremumsBorne,
} from "./moteur5e/sessionExtremaBornes";
import type { EcranExtremaBornes, EtatSessionExtremaBornes } from "./moteur5e/typesExtremaBornes";
import {
  candidatsComparaisonBorne,
  diagnostiquerCalculerDeriveeBorne,
  diagnostiquerChampParmiCiblesBorne,
  indexMaxAbsoluBorne,
  indexMinAbsoluBorne,
  tableauFPrimeBorneAttendu,
  valeursFAuxBornes,
  valeursFAuxExtremumsBorne,
} from "./moteur5e/verificationExtremaBornes";
import { EtapeDeriverExtremaBornes } from "./components5e/EtapeDeriverExtremaBornes";
import { EtapeTableauFPrimeExtremaBornes } from "./components5e/EtapeTableauFPrimeExtremaBornes";
import { EtapeChampsNumeriquesExtremaBornes } from "./components5e/EtapeChampsNumeriquesExtremaBornes";
import { EtapeComparaisonExtremaBornes } from "./components5e/EtapeComparaisonExtremaBornes";
import { TableauEtudeLocaleRecap } from "./components5e/TableauEtudeLocaleRecap";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import { formatReponseAttenduePhaseLatex, labelsChampsBornes, labelsChampsExtremums, placeholdersChampsBornes, placeholdersChampsExtremums } from "./ui5e/formatExtremaBornes";
import type { ReactNode } from "react";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionExtremaBornes {
  return demarrerSessionExtremaBornes(REGLAGES_DEMO, genererExerciceExtremaBornes);
}

/** Réponse attendue de l'écran qui vient de se terminer — réplique exactement `contenu(ecran)` de
 * l'ancien `ResultatPanelExtremaBornes.tsx`. */
function reponseAttendueEcran(exercice: EtatSessionExtremaBornes["exerciceCourant"], ecran: EcranExtremaBornes): ReactNode {
  if (ecran === "tableauFPrime") {
    const attendu = tableauFPrimeBorneAttendu(exercice);
    const enteteColonnes = attendu.colonnes.map((col) => (col.type === "racine" ? `${exercice.racinesFPrime[col.index]}` : ""));
    return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={enteteColonnes} mode="fprime" attendu={attendu} />;
  }
  const candidats = candidatsComparaisonBorne(exercice);
  const candidatMax = candidats[indexMaxAbsoluBorne(exercice)];
  const candidatMin = candidats[indexMinAbsoluBorne(exercice)];
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, ecran, candidatMax, candidatMin).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionExtremaBornes;
  revele: boolean;
}

export function App5gen34() {
  const [etat, setEtat] = useState<EtatSessionExtremaBornes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionExtremaBornes) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
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
    setEtat(demarrerSessionExtremaBornes(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueEcran(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Extrema en contexte borné</h1>
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
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
    </div>
  );
}

interface EcranProps {
  exercice: EtatSessionExtremaBornes["exerciceCourant"];
  phase: EcranExtremaBornes;
  etat: EtatSessionExtremaBornes;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionExtremaBornes) => void;
  setEtat: (etat: EtatSessionExtremaBornes) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxExtremaBornes();
  const onActiverAide = () => setEtat(activerAideSuivanteExtremaBornes(etat));

  switch (phase) {
    case "deriver":
      return (
        <EtapeDeriverExtremaBornes
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseDeriverBorne(etat, texte))}
          diagnostiquer={(t) => diagnostiquerCalculerDeriveeBorne(t, exercice)}
          validation={validation}
        />
      );

    case "tableauFPrime":
      return (
        <EtapeTableauFPrimeExtremaBornes
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFPrimeBorne(etat, reponse))}
          validation={validation}
        />
      );

    case "valeursExtremums":
      return (
        <EtapeChampsNumeriquesExtremaBornes
          key={cleEcran}
          exercice={exercice}
          phase="valeursExtremums"
          labels={labelsChampsExtremums(exercice)}
          placeholders={placeholdersChampsExtremums()}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseValeursExtremumsBorne(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCiblesBorne(t, valeursFAuxExtremumsBorne(exercice))}
          validation={validation}
        />
      );

    case "valeursBornes":
      return (
        <EtapeChampsNumeriquesExtremaBornes
          key={cleEcran}
          exercice={exercice}
          phase="valeursBornes"
          labels={labelsChampsBornes(exercice)}
          placeholders={placeholdersChampsBornes()}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseValeursBornes(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCiblesBorne(t, valeursFAuxBornes(exercice))}
          validation={validation}
        />
      );

    case "comparaison":
      return (
        <EtapeComparaisonExtremaBornes
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseComparaisonBorne(etat, reponse))}
          validation={validation}
        />
      );
  }
}
