import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceConstruireSomme, Point } from "./core/construireSomme.types";
import type { FragmentConsigne } from "../export/genererFeuilleExercices";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceConstruireSomme } from "./generateurs/construireSomme";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, nombreEcrans, soumettre, tentativesMaxEcran, type EtatConstruireSomme } from "./moteur/sessionConstruireSomme";
import { ecrans, ordreOptions } from "./moteur/modeleConstruireSomme";
import { diagnostiquerLecture, lireComposante, verifierConstruction, type SaisieComposantes, type StatutComposante } from "./moteur/verificationConstruireSomme";
import {
  aidesEcrans,
  attenduConstructionLatex,
  colonneLatex,
  consigneGenerale,
  consignesEcrans,
  diagnosticConstruction,
  donneesFragments,
  titresEcrans,
  traceLatex,
} from "./ui/formatConstruireSomme";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChoixRelation, EtapeConstruction, EtapeLecture } from "./components/EtapesConstruireSomme";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen83 — « Construire une somme, une différence, un point » (4e, chapitre 6 « Calcul vectoriel »,
 * section `additionGeometrique`, processus 2 APPLIQUER). Prolonge la grille magnétique de gen23 :
 * l'origine de chaque flèche est imposée, l'élève fait glisser son extrémité (accroche aux nœuds).
 * Écrans selon la variante : l'étape intermédiaire (reporter v au bout de u, tracer −v, k·u…), puis
 * le résultat ; retourner la relation (choix fermé, une tentative) pour « MA = … » ; lecture des
 * composantes en colonne. Champs ouverts : 3 tentatives. Aucun point affiché. `?code=` (QR code
 * d'une feuille) : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceConstruireSomme {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceConstruireSomme();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceConstruireSomme, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function lectureLatex(e: ExerciceConstruireSomme): string {
  return `\\vec{u} = ${colonneLatex(e.u)} \\quad \\vec{v} = ${colonneLatex(e.v)}`;
}

function reponseAttendue(e: ExerciceConstruireSomme, indice: number): ReactNode {
  const ec = ecrans(e)[indice]!;
  if (ec.type === "choix") return <Katex expression={`\\vec{AM} = ${ec.options[ec.correct]!}`} />;
  if (ec.type === "lecture") return <Katex expression={lectureLatex(e)} />;
  return (
    <p style={{ margin: 0 }}>
      <Katex expression={attenduConstructionLatex(ec)} /> — en vert sur la figure.
    </p>
  );
}

export function AppConstruireSomme() {
  const [etat, setEtat] = useState<EtatConstruireSomme>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [diagnostic, setDiagnostic] = useState<FragmentConsigne[] | null>(null);
  const [statuts, setStatuts] = useState<StatutComposante[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const indice = etat.ecran;
  const liste = ecrans(e);
  const ec = liste[indice]!;
  const total = nombreEcrans(e);
  const aides = aidesEcrans(e)[indice]!;

  function recommencer(exercice: ExerciceConstruireSomme) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setDiagnostic(null);
    setStatuts(null);
    setErreurLecture(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode, messageRevele?: string) {
    const resultat = soumettre(etat, correct);
    setErreurLecture(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(e, indice);
    setHistorique((h) => [...h, ecranClos(titresEcrans(e)[indice]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({ revele: resultat.revele, reponseAttendue: attendue, messageRevele, derniere: indice >= total - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceConstruireSomme());
      return;
    }
    setEtat(ecranSuivant(etat));
    setDiagnostic(null);
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

  const consigne = <RenduFragments fragments={consignesEcrans(e)[indice]!} />;
  const communs = { aides, niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat, aides.length)), validation };

  function ecranCourant(): ReactNode {
    if (ec.type === "choix") {
      return (
        <EtapeChoixRelation
          {...communs}
          exercice={e}
          consigne={consigne}
          options={ec.options}
          ordre={ordreOptions(e)}
          correct={ec.correct}
          onValider={(choix) => conclure(choix === ec.correct, <Katex expression={`\\vec{AM} = ${ec.options[choix]!}`} />, "Ce n'était pas la bonne écriture.")}
        />
      );
    }
    if (ec.type === "lecture") {
      return (
        <EtapeLecture
          {...communs}
          exercice={e}
          consigne={consigne}
          tentativesUtilisees={etat.tentativesUtilisees}
          tentativesMax={tentativesMaxEcran(e, indice)}
          statuts={statuts}
          erreurLecture={erreurLecture}
          onValider={(saisies: SaisieComposantes[]) => {
            const diag = diagnostiquerLecture(e, saisies);
            if (diag.includes("parse_error")) {
              setErreurLecture(true);
              return;
            }
            setStatuts(diag);
            const lu = saisies.map((s) => ({ x: lireComposante(s.x)!, y: lireComposante(s.y)! }));
            conclure(
              diag.every((s) => s === "correct"),
              <Katex expression={`\\vec{u} = ${colonneLatex(lu[0]!)} \\quad \\vec{v} = ${colonneLatex(lu[1]!)}`} />,
            );
          }}
        />
      );
    }
    return (
      <EtapeConstruction
        {...communs}
        exercice={e}
        indexEcran={indice}
        ecran={ec}
        consigne={consigne}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(e, indice)}
        diagnostic={diagnostic}
        onValider={(extremite: Point) => {
          const correct = verifierConstruction(ec, extremite);
          if (!correct) setDiagnostic(diagnosticConstruction(e, ec, indice, extremite));
          conclure(
            correct,
            <span>
              Flèche tracée : <Katex expression={traceLatex(ec.origine, extremite)} />
            </span>,
          );
        }}
      />
    );
  }

  const blocDonnees = (
    <p style={{ margin: "6px 0 0" }}>
      <RenduFragments fragments={donneesFragments(e)} />
    </p>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Construire une somme, une différence, un point</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale(e)} />} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${indice}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
