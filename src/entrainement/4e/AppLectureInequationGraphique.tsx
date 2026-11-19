import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceLectureInequation, IdLecture } from "./core/lectureInequationGraphique.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLectureInequation } from "./generateurs/lectureInequationGraphique";
import { correctionDetailleeLectureInequation } from "./generateurs/lectureInequationGraphique/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatLectureInequation } from "./moteur/sessionLectureInequation";
import { abscisses, lectureJuste, solution } from "./moteur/modeleLectureInequationGraphique";
import { CONSIGNE_GENERALE, TITRES_ECRANS, abscissesFragments, aidesEcran, consignesEcrans, enonceFragments, figureSvg, lectureFragments, reponseSolutionFragments } from "./ui/formatLectureInequationGraphique";
import { egauxEnsembles, ensembleLatex, lireValeurs, memesValeurs } from "./ui/ensembleSolutionTrinome";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { Katex } from "./components/Katex";
import { ChoixUniqueFragments } from "./components/ChoixUniqueFragments";
import { EtapeChampLibreTrinome } from "./components/EtapeChampLibreTrinome";
import { EtapeEnsembleSolutionTrinome } from "./components/EtapeEnsembleSolutionTrinome";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen117 — « Lire une inéquation sur un graphique » (4e, chapitre 2, section `signe-trinome`,
 * processus 1 CONNAÎTRE). Parabole et droite tracées sur un quadrillage d'une unité (même figure que
 * le papier, `export/svgGraph.ts`), trois écrans :
 * 1. abscisses des points communs (champ libre ou « Aucun point commun », 3 tentatives) ;
 * 2. position de la parabole (4 lectures, une seule juste, une tentative) ;
 * 3. ensemble-solution avec crochets (saisie guidée, 3 tentatives).
 * Aucun point affiché. `?code=` : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceLectureInequation {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceLectureInequation();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceLectureInequation, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(e: ExerciceLectureInequation, ecran: number): ReactNode {
  const fragments = ecran === 0 ? abscissesFragments(e) : ecran === 1 ? lectureFragments(lectureJuste(e), e) : reponseSolutionFragments(e);
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={fragments} />
    </p>
  );
}

export function AppLectureInequationGraphique() {
  const [etat, setEtat] = useState<EtatLectureInequation>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);
  const [erronee, setErronee] = useState(false);
  const [messageFaux, setMessageFaux] = useState<string | null>(null);
  const [illisible, setIllisible] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceLectureInequation) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setErronee(false);
    setMessageFaux(null);
    setIllisible(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setIllisible(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({ revele: resultat.revele, reponseAttendue: attendue, messageRevele: ecran === 1 ? "Ce n'était pas la bonne lecture." : undefined, derniere: ecran >= NOMBRE_ECRANS - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceLectureInequation());
      return;
    }
    setEtat(ecranSuivant(etat));
    setErronee(false);
    setMessageFaux(null);
    setEnAttente(null);
  }

  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debuggen117?: unknown }).__debuggen117 = { exercice: e, ecran };
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeLectureInequation(e), lettreEtape(ecran))} />,
      }
    : null;

  const consigne = <RenduFragments fragments={consignesEcrans(e)[ecran]!} />;
  const communs = { aides: aidesEcran(e, ecran), niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <EtapeChampLibreTrinome
          {...communs}
          consigne={consigne}
          idChamp="lecture-abscisses-champ"
          libelle={[{ type: "texte", valeur: "Les abscisses, séparées par « ; »" }]}
          prefixe={null}
          aideSaisie="Écris les abscisses lues (par exemple −1 ; 3), ou choisis « Aucun point commun »."
          messageIllisible="Écriture non reconnue : écris des nombres séparés par « ; »."
          tentativesUtilisees={etat.tentativesUtilisees}
          tentativesMax={tentativesMaxEcran(ecran)}
          erronee={erronee}
          messageFaux={messageFaux}
          illisible={illisible}
          boutonVide={{ libelle: "Aucun point commun", texte: "∅" }}
          onValider={(texte) => {
            const v = lireValeurs(texte);
            if (v === null) {
              setIllisible(true);
              return;
            }
            const correct = memesValeurs(v, abscisses(e));
            setErronee(!correct);
            const ordonnees = !correct && v.length > 0 && v.some((x) => !abscisses(e).includes(x));
            setMessageFaux(ordonnees ? "Lis les abscisses : descends de chaque point commun jusqu'à l'axe des x." : null);
            conclure(correct, <p style={{ margin: 0 }}>{v.length === 0 ? "Aucun point commun" : v.map((x) => String(x).replace("-", "−").replace(".", ",")).join(" ; ")}</p>);
          }}
        />
      );
    }
    if (ecran === 1) {
      return (
        <ChoixUniqueFragments<IdLecture>
          {...communs}
          consigne={consigne}
          libelleGroupe="Lecture de la position"
          options={e.lectures.map((id) => ({ id, fragments: lectureFragments(id, e) }))}
          acceptees={[lectureJuste(e)]}
          onValider={(id) =>
            conclure(
              id === lectureJuste(e),
              <p style={{ margin: 0 }}>
                <RenduFragments fragments={lectureFragments(id, e)} />
              </p>,
            )
          }
        />
      );
    }
    return (
      <EtapeEnsembleSolutionTrinome
        {...communs}
        consigne={consigne}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        erronee={erronee}
        messageFaux={messageFaux}
        illisible={illisible}
        onValider={(lecture) => {
          if (lecture.statut !== "ok") {
            setIllisible(true);
            return;
          }
          const correct = egauxEnsembles(lecture.ensemble, solution(e));
          setErronee(!correct);
          setMessageFaux(null);
          conclure(correct, <Katex expression={`S=${ensembleLatex(lecture.ensemble)}`} />);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Lire une inéquation sur un graphique</h1>
        <p className="app-subtitle">Chapitre 2 — Équations et inéquations du second degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <>
                <p style={{ margin: "6px 0" }}>
                  <RenduFragments fragments={enonceFragments(e)} />
                </p>
                <div className="figure-lecture-inequation" style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
                  <div style={{ width: "100%", maxWidth: 380 }} dangerouslySetInnerHTML={{ __html: figureSvg(e, ecran === 2 && !!enAttente).replace(/<svg ([^>]*?)width="\d+" height="\d+"/, '<svg $1style="width:100%;height:auto;display:block"') }} />
                </div>
              </>
            }
          />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
