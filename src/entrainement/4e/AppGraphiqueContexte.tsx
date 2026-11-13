import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { IdContexteGraphique, QuestionGraphique, ReponseLectureGraphique, TypeQuestionGraphique } from "./core/graphiqueContexte.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceGraphiqueContexte } from "./generateurs/graphiqueContexte";
import { TEXTES_CONTEXTES } from "./generateurs/graphiqueContexte/contextes";
import {
  activerAide,
  demarrerSessionGraphiqueContexte,
  nombreEcrans,
  questionCourante,
  soumettreLecture,
  soumettreType,
  TENTATIVES_LECTURE,
} from "./moteur/sessionGraphiqueContexte";
import type { EtatSessionGraphiqueContexte } from "./moteur/sessionGraphiqueContexte";
import {
  formatMorceauxTexte,
  guideAideNiveau2,
  justificationType,
  LIBELLE_TYPE,
  questionTexte,
  reponseAttendueTexte,
  titreEcran,
} from "./ui/formatGraphiqueContexte";
import { construireSvgGraphiqueContexte } from "./ui/svgGraphiqueContexte";
import type { GuideSvg } from "./ui/svgGraphiqueContexte";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { EtapeLectureGraphique, EtapeTypeGraphique } from "./components/EtapesGraphiqueContexte";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * gen70 — Lire un graphique en contexte (4e, chapitre 3, processus TRANSFÉRER).
 *
 * 4 questions en langage courant sur une situation réelle ; pour chacune, deux écrans :
 * « quelle caractéristique ? » (choix fermé, une seule tentative) puis la lecture (3 tentatives,
 * 2 aides : méthode, puis repère tracé sur le graphique). Le graphique, statique, reste dans
 * l'en-tête pendant tout l'exercice. Aucun point ni pénalité affichés.
 */

function nouvelleSession(): EtatSessionGraphiqueContexte {
  return demarrerSessionGraphiqueContexte(genererExerciceGraphiqueContexte);
}

/** Première session : avec `?code=XXXXXX` (QR code d'une feuille imprimée), le premier exercice est
 * tiré avec les MÊMES fonctions que l'adaptateur (`generateurs/graphiqueContexte/exportEvaluation.ts`). */
function sessionInitiale(): EtatSessionGraphiqueContexte {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionGraphiqueContexte(() =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceGraphiqueContexte, (id) => construireAvecVarianteId(id as IdContexteGraphique)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionGraphiqueContexte;
  revele: boolean;
}

function formatReponseLecture(etat: EtatSessionGraphiqueContexte, reponse: ReponseLectureGraphique): string {
  const t = TEXTES_CONTEXTES[etat.exercice.contexte];
  switch (reponse.type) {
    case "image":
    case "tendance":
      return t.valeurY(reponse.valeur);
    case "antecedent":
      return reponse.valeurs.map(t.valeurX).join(" et ");
    case "extremum":
      return `${t.valeurY(reponse.valeur)}, ${t.moment(reponse.moment)}`;
    case "inequation":
    case "variation":
      return `${formatMorceauxTexte(reponse.morceaux)} (en ${t.uniteX})`;
  }
}

function reponseAttendueEcran(etat: EtatSessionGraphiqueContexte, q: QuestionGraphique): ReactNode {
  if (etat.indexEcran % 2 === 0) {
    return (
      <>
        <p>
          <strong>{LIBELLE_TYPE[q.type]}</strong>
        </p>
        <p>{justificationType(etat.exercice, q)}</p>
      </>
    );
  }
  return <p>{reponseAttendueTexte(etat.exercice, q)}</p>;
}

function calculerSegments(etat: EtatSessionGraphiqueContexte): EtatPuceProgression[] {
  return Array.from({ length: nombreEcrans(etat.exercice) }, (_, i) =>
    i < etat.bilans.length ? etat.bilans[i]! : i === etat.indexEcran ? "courante" : "a-venir",
  );
}

export function AppGraphiqueContexte() {
  const [etat, setEtat] = useState<EtatSessionGraphiqueContexte>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé de montage des écrans : un nouvel exercice (même tiré au même rang) remet les champs à vide. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  const exercice = etat.exercice;
  const question = questionCourante(etat);
  const numero = Math.floor(etat.indexEcran / 2) + 1;
  const total = exercice.questions.length;
  const ecranLecture = etat.indexEcran % 2 === 1;
  const texteQuestion = questionTexte(exercice, question);

  function terminerEcran(nouvelEtat: EtatSessionGraphiqueContexte, votreReponse: string) {
    if (nouvelEtat.indexEcran === etat.indexEcran) {
      setEtat(nouvelEtat);
      return;
    }
    const bilan = nouvelEtat.bilans[nouvelEtat.bilans.length - 1]!;
    const index = etat.indexEcran;
    setHistorique((h) => {
      const copie = [...h];
      copie[index] = { titre: titreEcran(index), votreReponse, correcte: bilan !== "revele", reponseAttendue: reponseAttendueEcran(etat, question) };
      return copie;
    });
    setEnAttente({ etatSuivant: nouvelEtat, revele: bilan === "revele" });
  }

  function demarrer(session: EtatSessionGraphiqueContexte) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
    setEtat(session);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      demarrer(nouvelleSession());
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    demarrer(demarrerSessionGraphiqueContexte(() => construireAvecVarianteId(varianteId as IdContexteGraphique)));
  }

  function validerType(type: TypeQuestionGraphique) {
    terminerEcran(soumettreType(etat, type), LIBELLE_TYPE[type]);
  }

  function validerLecture(reponse: ReponseLectureGraphique) {
    terminerEcran(soumettreLecture(etat, reponse), formatReponseLecture(etat, reponse));
  }

  const guide = ecranLecture && etat.niveauAide >= 2 ? guideAideNiveau2(exercice, question) : null;
  const cleGuide = guide ? JSON.stringify(guide) : "";
  const svg = useMemo(() => construireSvgGraphiqueContexte(exercice, { theme: "ecran", guide: cleGuide ? (JSON.parse(cleGuide) as GuideSvg) : null }), [exercice, cleGuide]);

  const blocDonnees = <div className="graphique-contexte-figure" style={{ margin: "12px 0 4px" }} dangerouslySetInnerHTML={{ __html: svg }} />;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueEcran(etat, question),
        messageRevele: ecranLecture ? undefined : "Ce n'était pas la caractéristique demandée.",
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const cle = `${numeroExercice}-${etat.indexEcran}`;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Lire un graphique en contexte</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegments(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={TEXTES_CONTEXTES[exercice.contexte].situation} blocDonnees={blocDonnees} />
          {ecranLecture ? (
            <EtapeLectureGraphique
              key={cle}
              numero={numero}
              total={total}
              exercice={exercice}
              question={question}
              texteQuestion={texteQuestion}
              tentativesUtilisees={etat.tentativesUtilisees}
              tentativesMax={TENTATIVES_LECTURE}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={validerLecture}
              validation={validation}
            />
          ) : (
            <EtapeTypeGraphique key={cle} numero={numero} total={total} question={question} texteQuestion={texteQuestion} onValider={validerType} validation={validation} />
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]!} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
