import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ConfigurationResolution, ExerciceResoudreTriangle, LoiResolution } from "./core/resoudreTriangle.types";
import type { SommetTriangle } from "./core/triangle.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceResoudreTriangle } from "./generateurs/resoudreTriangle";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatResoudreTriangle } from "./moteur/sessionResoudreTriangle";
import { SOMMETS, plusGrandAngle, premiereLoi, type EtapeResolution } from "./moteur/resolutionTriangle";
import { nombreFrLatex } from "./ui/nombreFr";
import {
  diagnostiquerCalculs,
  diagnostiquerChamp,
  etapeControle,
  lireNombre,
  planExercice,
  verifierConfiguration,
  verifierPremiereLoi,
  type StatutChamp,
} from "./moteur/verificationResoudreTriangle";
import {
  CONSIGNE_GENERALE,
  LIBELLES_CONFIGURATION,
  LIBELLES_LOI,
  ORDRE_CONFIGURATIONS,
  ORDRE_LOIS,
  TITRES_ECRANS,
  aidesCalculs,
  aidesConfiguration,
  aidesControle,
  aidesPremiereLoi,
  consignesEcrans,
  donneesFragments,
  elementLatex,
  libelleChamp,
  reponsePremiereLoi,
  resultatsLatex,
  uniteChamp,
} from "./ui/formatResoudreTriangle";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { FigureResoudreTriangle } from "./components/FigureResoudreTriangle";
import { EtapeChampsResoudreTriangle, EtapeChoixResoudreTriangle } from "./components/EtapesResoudreTriangle";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen73 — « Résoudre complètement un triangle » (4e, chapitre 5, section « triangle », processus 2
 * APPLIQUER). Un triangle ABC donné par 3 éléments (figure aux proportions réelles). Quatre écrans :
 * 1. reconnaître la configuration (choix fermé, une tentative) ;
 * 2. choisir la première loi (choix fermé, une tentative ; pour 3 côtés, aussi l'angle : le plus grand) ;
 * 3. calculer les 3 éléments manquants dans l'ordre de la méthode (un champ chacun, jugé sur la valeur
 *    exacte, jamais sur la saisie précédente) ;
 * 4. contrôle : l'angle obtenu par la somme, recalculé par Al-Kashi.
 * Piège central : un angle obtus cherché par la loi des sinus (diagnostic ciblé). Aucun point
 * affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES fonctions que
 * l'adaptateur.
 */

function exerciceInitial(): ExerciceResoudreTriangle {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceResoudreTriangle();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceResoudreTriangle, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(e: ExerciceResoudreTriangle, ecran: number): ReactNode {
  if (ecran === 0) return <span>{LIBELLES_CONFIGURATION[e.configuration]}</span>;
  if (ecran === 1) return <RenduFragments fragments={reponsePremiereLoi(e)} />;
  if (ecran === 2) return <Katex expression={resultatsLatex(e, planExercice(e).map((x) => x.inconnue))} />;
  return <Katex expression={resultatsLatex(e, [etapeControle(e).inconnue])} />;
}

/** Saisies relues pour la fiche de consultation : « Ĉ = 41,2° ; a = 12,35 cm ». */
function saisiesLues(e: ExerciceResoudreTriangle, saisies: string[], etapes: EtapeResolution[]): ReactNode {
  const morceaux = etapes.map((etape, i) => {
    const n = nombreFrLatex(lireNombre(saisies[i] ?? "") ?? 0);
    const unite = uniteChamp(e, etape.inconnue);
    return `${elementLatex(etape.inconnue)} = ${n}${unite === "°" ? "^\\circ" : `\\text{ ${unite}}`}`;
  });
  return <Katex expression={morceaux.join(" \\;;\\; ")} />;
}

export function AppResoudreTriangle() {
  const [etat, setEtat] = useState<EtatResoudreTriangle>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceResoudreTriangle) {
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
      messageRevele: ecran === 0 ? "Ce n'était pas la bonne configuration." : ecran === 1 ? "Ce n'était pas la première loi à appliquer." : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceResoudreTriangle());
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

  function validerChamps(saisies: string[], statutsCalcules: StatutChamp[], etapes: EtapeResolution[]) {
    if (statutsCalcules.includes("parse_error")) {
      setErreurLecture(true);
      return;
    }
    setStatuts(statutsCalcules);
    conclure(statutsCalcules.every((s) => s === "correct"), saisiesLues(e, saisies, etapes));
  }

  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <EtapeChoixResoudreTriangle<ConfigurationResolution, never>
          {...communs}
          aides={aidesConfiguration(e)}
          consigne={consigne}
          groupe={{ options: ORDRE_CONFIGURATIONS.map((id) => ({ id, label: LIBELLES_CONFIGURATION[id] })), attendu: e.configuration }}
          onValider={(choix) => conclure(verifierConfiguration(e, choix), LIBELLES_CONFIGURATION[choix])}
        />
      );
    }
    if (ecran === 1) {
      const sss = e.configuration === "SSS";
      return (
        <EtapeChoixResoudreTriangle<LoiResolution, SommetTriangle>
          {...communs}
          aides={aidesPremiereLoi(e)}
          consigne={consigne}
          groupe={{ options: ORDRE_LOIS.map((id) => ({ id, label: LIBELLES_LOI[id] })), attendu: premiereLoi(e.configuration) }}
          groupeSecondaire={
            sss
              ? { question: "Pour quel angle ?", options: SOMMETS.map((s) => ({ id: s, label: <Katex expression={elementLatex(s)} /> })), attendu: plusGrandAngle(e.triangle) }
              : undefined
          }
          onValider={(loi, angle) =>
            conclure(
              verifierPremiereLoi(e, loi, angle),
              <>
                {LIBELLES_LOI[loi]}
                {angle && (
                  <>
                    {", pour "}
                    <Katex expression={elementLatex(angle)} />
                  </>
                )}
              </>,
            )
          }
        />
      );
    }
    const etapes = ecran === 2 ? planExercice(e) : [etapeControle(e)];
    return (
      <EtapeChampsResoudreTriangle
        {...communs}
        idBase={`resoudre-triangle-${ecran}`}
        aides={ecran === 2 ? aidesCalculs(e) : aidesControle(e)}
        consigne={consigne}
        champs={etapes.map((etape, i) => ({ libelle: libelleChamp(etape.inconnue, ecran === 2 ? i + 1 : undefined), unite: uniteChamp(e, etape.inconnue) }))}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        statuts={statuts}
        erreurLecture={erreurLecture}
        onValider={(saisies) => validerChamps(saisies, ecran === 2 ? diagnostiquerCalculs(e, saisies) : [diagnostiquerChamp(e, etapes[0]!, saisies[0] ?? "")], etapes)}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={donneesFragments(e)} />
      </p>
      <FigureResoudreTriangle exercice={e} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Résoudre complètement un triangle</h1>
        <p className="app-subtitle">Chapitre 5 — Cercle trigonométrique et triangles quelconques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          {ecran >= 2 && <CalculatriceScientifique />}
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
