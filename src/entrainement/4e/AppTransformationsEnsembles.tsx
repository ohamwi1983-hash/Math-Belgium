import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { Axe, ExerciceTransformationsEnsembles } from "./core/transformationsEnsembles.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTransformationsEnsembles } from "./generateurs/transformationsEnsembles";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatTransformationsEnsembles } from "./moteur/sessionTransformationsEnsembles";
import { diagnostiquerChaine, intervallesAttendus, lireIntervalle, verifierClassement, type SaisieIntervalle, type StatutIntervalle } from "./moteur/verificationTransformationsEnsembles";
import {
  CONSIGNE_GENERALE,
  NOMBRE_ECRANS,
  TITRES_ECRANS,
  aidesAxe,
  aidesClassement,
  chaineLatex,
  classementAttendu,
  consignesEcrans,
  donneesFragments,
  libelleAxe,
  libellesLignes,
  listeTransformations,
} from "./ui/formatTransformationsEnsembles";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChaineIntervalles, EtapeClassementTransformations } from "./components/EtapesTransformationsEnsembles";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen72 — « Domaine et ensemble image après transformations » (4e, chapitre 3, section
 * « transformer », processus 3 TRANSFÉRER). On ne connaît de f que son domaine et son ensemble
 * image ; son graphique subit 2 à 5 transformations successives. Trois écrans :
 * 1. classer chaque transformation (domaine ou ensemble image) — choix fermé, une tentative ;
 * 2. suivre le domaine (un intervalle après chaque transformation horizontale) ;
 * 3. suivre l'ensemble image (un intervalle après chaque transformation verticale).
 * Chaque ligne est jugée sur l'intervalle CORRECT de la chaîne. Aucun point affiché. `?code=` (QR
 * code d'une feuille) : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceTransformationsEnsembles {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceTransformationsEnsembles();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceTransformationsEnsembles, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

const AXE_DE_L_ECRAN: Record<number, Axe> = { 1: "H", 2: "V" };

function ListeClassement({ e, axes }: { e: ExerciceTransformationsEnsembles; axes: Axe[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {listeTransformations(e).map((fragments, i) => (
        <li key={i}>
          <RenduFragments fragments={fragments.slice(1, -1)} /> — {libelleAxe(axes[i]!).toLowerCase()}
        </li>
      ))}
    </ul>
  );
}

function reponseAttendue(e: ExerciceTransformationsEnsembles, ecran: number): ReactNode {
  if (ecran === 0) return <ListeClassement e={e} axes={classementAttendu(e)} />;
  return <Katex expression={chaineLatex(intervallesAttendus(e, AXE_DE_L_ECRAN[ecran]!))} />;
}

export function AppTransformationsEnsembles() {
  const [etat, setEtat] = useState<EtatTransformationsEnsembles>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutIntervalle[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceTransformationsEnsembles) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setErreurLecture(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setErreurLecture(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: ecran === 0 ? "Ce n'était pas le bon classement." : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceTransformationsEnsembles());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setEnAttente(null);
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
      }
    : null;

  const consigne = <RenduFragments fragments={consignesEcrans(e)[ecran]!} />;
  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <EtapeClassementTransformations
          {...communs}
          aides={aidesClassement(e)}
          consigne={consigne}
          transformations={listeTransformations(e)}
          attendu={classementAttendu(e)}
          onValider={(choix) => conclure(verifierClassement(e, choix), <ListeClassement e={e} axes={choix} />)}
        />
      );
    }
    const axe = AXE_DE_L_ECRAN[ecran]!;
    return (
      <EtapeChaineIntervalles
        {...communs}
        axe={axe}
        aides={aidesAxe(e, axe)}
        consigne={consigne}
        libelles={libellesLignes(e, axe)}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        statuts={statuts}
        erreurLecture={erreurLecture}
        onValider={(saisies: SaisieIntervalle[]) => {
          const diagnostic = diagnostiquerChaine(e, axe, saisies);
          if (diagnostic.includes("parse_error")) {
            setErreurLecture(true);
            return;
          }
          setStatuts(diagnostic);
          const lus = saisies.map((s) => lireIntervalle(s)!);
          conclure(
            diagnostic.every((s) => s === "correct"),
            <Katex expression={chaineLatex(lus)} />,
          );
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={donneesFragments(e)} />
      </p>
      <ul style={{ margin: "6px 0 0", paddingLeft: 0, listStyle: "none", display: "grid", gap: 4 }}>
        {listeTransformations(e).map((fragments, i) => (
          <li key={i}>
            <RenduFragments fragments={fragments} />
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Domaine et ensemble image après transformations</h1>
        <p className="app-subtitle">Chapitre 3 — Caractéristiques d'une fonction et fonctions de référence</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

