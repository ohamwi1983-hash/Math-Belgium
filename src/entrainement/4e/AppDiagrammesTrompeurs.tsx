import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceCirculaire, ExerciceDiagrammesTrompeurs, ExerciceTrompeurBarres, ExerciceTrompeurCirculaire, Manipulation } from "./core/diagrammesTrompeurs.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDiagrammesTrompeurs } from "./generateurs/diagrammesTrompeurs";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeDiagrammesTrompeurs } from "./generateurs/diagrammesTrompeurs/corrigeDetaille";
import { activerAide, demarrer, ecranSuivant, nombreEcrans, soumettre, tentativesMaxEcran, type EtatDiagrammesTrompeurs } from "./moteur/sessionDiagrammesTrompeurs";
import { statutChamp } from "./moteur/verificationDiagrammesTrompeurs";
import type { StatutVerification } from "./moteur/statutVerification";
import { LIBELLES_MANIPULATIONS, consigneGenerale, ecransExercice, enonceExercice, explicationManipulation, reponseEcran } from "./ui/formatDiagrammesTrompeurs";
import { figureBarresSvg, figureBatonsSvg, figureCirculaireSvg, figurePictogrammesSvg, figureTotalFauxSvg } from "./ui/figureDiagrammesTrompeurs";
import { nombreAffiche } from "./ui/formatNombreDiagrammes";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { Katex } from "./components/Katex";
import { EtapeChampsDiagrammes, EtapeChoixDiagrammes } from "./components/EtapesDiagrammesTrompeurs";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen111 — « Diagrammes et graphiques trompeurs » (4e, chapitre 4 « Statistique descriptive »,
 * section « frequences », processus 2 APPLIQUER). Trois variantes :
 * - diagramme circulaire : fréquences ↔ angles (fᵢ × 360°), dans les deux sens ;
 * - lire un diagramme en bâtons ou un diagramme circulaire en pourcentages ;
 * - graphique trompeur : repérer la manipulation (choix fermé, UNE tentative), lire les vraies
 *   valeurs, corriger la conclusion chiffrée (champs : 3 tentatives).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDiagrammesTrompeurs {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDiagrammesTrompeurs();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDiagrammesTrompeurs, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function lignes(contenu: ReactNode[]): ReactNode {
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {contenu.map((c, i) => (
        <li key={i}>{c}</li>
      ))}
    </ul>
  );
}

function reponseAttendue(e: ExerciceDiagrammesTrompeurs, ecran: number): ReactNode {
  return lignes(reponseEcran(e, ecran).map((f, i) => <RenduFragments key={i} fragments={f} />));
}

function TableauDonnees({ e }: { e: ExerciceCirculaire }) {
  return (
    <div className="tf-table-scroll">
      <table className="tf-table">
        <thead>
          <tr>
            <th>{e.contexte.colonne}</th>
            <th>
              Effectif <Katex expression="n_i" />
            </th>
          </tr>
        </thead>
        <tbody>
          {e.secteurs.map((s) => (
            <tr key={s.nom}>
              <td>{s.nom}</td>
              <td>{nombreAffiche(s.effectif)}</td>
            </tr>
          ))}
          <tr>
            <td>
              <strong>Total</strong>
            </td>
            <td>
              <strong>{nombreAffiche(e.n)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function figureEnonce(e: ExerciceDiagrammesTrompeurs): string | null {
  switch (e.sousType) {
    case "direct":
      return null;
    case "inverse":
      return figureCirculaireSvg(e as ExerciceCirculaire, "angles");
    case "circulaire":
      return figureCirculaireSvg(e as ExerciceCirculaire, "pourcentages");
    case "batons":
      return figureBatonsSvg(e);
    case "total-faux":
      return figureTotalFauxSvg(e);
    case "pictogrammes":
      return figurePictogrammesSvg(e);
    default:
      return figureBarresSvg(e);
  }
}

export function AppDiagrammesTrompeurs() {
  const [etat, setEtat] = useState<EtatDiagrammesTrompeurs>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutVerification[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const ecrans = ecransExercice(e);
  const total = nombreEcrans(e);
  const courant = ecrans[ecran]!;

  function recommencer(exercice: ExerciceDiagrammesTrompeurs) {
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
    setHistorique((h) => [...h, ecranClos(courant.titre, votreReponse, resultat.revele, etat.niveauAide > 0, attendue, corrigeDetailleEcranCourant())]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: courant.genre === "choix" ? "Ce n'était pas la bonne manipulation." : undefined,
      derniere: ecran >= total - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDiagrammesTrompeurs());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setEnAttente(null);
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeDiagrammesTrompeurs(e), lettreEtape(ecran))} />;
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  const communs = { aides: courant.aides, niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  function ecranCourant(): ReactNode {
    if (courant.genre === "choix") {
      return (
        <EtapeChoixDiagrammes<Manipulation>
          {...communs}
          consigne={<RenduFragments fragments={courant.consigne} />}
          options={courant.options}
          attendue={courant.attendue}
          explication={explicationManipulation(e as ExerciceTrompeurBarres | ExerciceTrompeurCirculaire)}
          onValider={(id) => conclure(id === courant.attendue, <p style={{ margin: 0 }}>{LIBELLES_MANIPULATIONS[id]}</p>)}
        />
      );
    }
    return (
      <EtapeChampsDiagrammes
        {...communs}
        ecran={courant}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(etat)}
        statuts={statuts}
        erreurLecture={erreurLecture}
        onValider={(saisies) => {
          const diagnostic = courant.champs.map((c, i) => statutChamp(saisies[i] ?? "", c));
          if (diagnostic.includes("parse_error")) {
            setErreurLecture(true);
            return;
          }
          setStatuts(diagnostic);
          conclure(
            diagnostic.every((s) => s === "correct"),
            lignes(courant.champs.map((c, i) => `${c.libelle.map((f) => f.valeur).join("").replace(/ : \+$/, "").replace(/ =$/, "")} : ${saisies[i]}`)),
          );
        }}
      />
    );
  }

  const figure = figureEnonce(e);
  const diagrammeFinal = e.sousType === "direct" && enAttente?.derniere ? figureCirculaireSvg(e as ExerciceCirculaire, "corrige") : null;
  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceExercice(e)} />
      </p>
      {e.sousType === "direct" && <TableauDonnees e={e as ExerciceCirculaire} />}
      {figure && <div style={{ maxWidth: 440, margin: "10px auto 0" }} dangerouslySetInnerHTML={{ __html: figure }} />}
      {diagrammeFinal && (
        <>
          <p style={{ margin: "10px 0 0" }}>Le diagramme circulaire obtenu :</p>
          <div style={{ maxWidth: 440, margin: "4px auto 0" }} dangerouslySetInnerHTML={{ __html: diagrammeFinal }} />
        </>
      )}
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Diagrammes et graphiques trompeurs</h1>
        <p className="app-subtitle">Chapitre 4 — Statistique descriptive</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigneGenerale(e)} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
