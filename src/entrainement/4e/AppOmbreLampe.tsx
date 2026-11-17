import { useState } from "react";
import type { ExerciceOmbreLampe } from "./core/ombreLampe.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceOmbreLampe } from "./generateurs/ombreLampe";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import {
  aidesEcran,
  candidatCorrect,
  consigneEcran,
  contexte,
  dessinCandidat,
  elementsConclusion,
  elementsScene,
  libelleCandidat,
  messageErreur,
  solidePourAffichage,
  texteConclusion,
  titresEcrans,
} from "./ui/formatOmbreLampe";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { ChoixCandidatsOmbre } from "./components/ChoixCandidatsOmbre";
import type { FicheChoixOmbre } from "./components/ChoixCandidatsOmbre";
import { Solide3DSketch } from "./components/Solide3DSketch";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen106 — « Ombre à la lampe : projection centrale » (4e, chapitre 8 « Géométrie dans l'espace »,
 * section `ombre`, processus 2 APPLIQUER). Prolongement de gen41 (`AppOmbreSoleil.tsx`) avec une
 * source ponctuelle : les rayons partent de la lampe L, la trace au sol de chaque rayon passe par le
 * pied L₀ de la lampe. Deux écrans de choix sur la figure (composant de gen41 `ChoixCandidatsOmbre`,
 * candidats mélangés à chaque écran), puis une conclusion qui montre la construction complète.
 * UNE tentative par écran ; après un échec, la bonne réponse est montrée en vert et l'erreur commise
 * est expliquée. Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec
 * les MÊMES fonctions que l'adaptateur (`generateurs/ombreLampe/exportEvaluation.ts`).
 */

function exerciceInitial(): ExerciceOmbreLampe {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceOmbreLampe();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceOmbreLampe, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  messageRevele: string;
}

const NOMBRE_ECRANS = 2;

export function AppOmbreLampe() {
  const [exercice, setExercice] = useState<ExerciceOmbreLampe>(exerciceInitial);
  /** 0 et 1 : écrans de choix ; 2 : conclusion. */
  const [ecran, setEcran] = useState(0);
  const [niveauAide, setNiveauAide] = useState(0);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Entre dans la `key` des écrans : chaque nouvel exercice remonte les écrans, ce qui re-mélange
   * l'ordre des candidats et efface la sélection. */
  const [generation, setGeneration] = useState(0);

  const e = exercice;

  function recommencer(ex: ExerciceOmbreLampe) {
    setExercice(ex);
    setEcran(0);
    setNiveauAide(0);
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setGeneration((g) => g + 1);
  }

  function valider(id: string, fiche: FicheChoixOmbre) {
    if (ecran > 1) return;
    const n = ecran as 0 | 1;
    const choisi = e.ecrans[n].candidats.find((c) => c.id === id)!;
    const juste = choisi.erreur === "aucune";
    setHistorique((h) => [...h, ecranClos(titresEcrans(e)[n], fiche.votreReponse, !juste, niveauAide > 0, fiche.reponseAttendue)]);
    setEnAttente({ revele: !juste, messageRevele: messageErreur(choisi.erreur) });
  }

  function passerEcranSuivant() {
    setEcran((n) => n + 1);
    setNiveauAide(0);
    setEnAttente(null);
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? { revele: enAttente.revele, labelSuivant: ecran === 1 ? "Voir la construction" : "Écran suivant", onSuivant: passerEcranSuivant, messageRevele: enAttente.messageRevele }
    : null;

  const solide = solidePourAffichage(e);
  let contenu;
  if (ecran < 2) {
    const n = ecran as 0 | 1;
    const aides = aidesEcran(e, n);
    contenu = (
      <ChoixCandidatsOmbre
        key={`${generation}-${n}`}
        solide={solide}
        fond={elementsScene(e, n)}
        consigne={consigneEcran(e, n)}
        candidats={e.ecrans[n].candidats.map((c) => ({ id: c.id, dessin: (numero, etat) => dessinCandidat(e, n, c, numero, etat) }))}
        idCorrect={candidatCorrect(e, n).id}
        libelle={libelleCandidat(e, n)}
        aides={aides}
        tentativesUtilisees={0}
        tentativesMax={1}
        niveauAide={niveauAide}
        onActiverAide={() => setNiveauAide((k) => Math.min(aides.length, k + 1))}
        onValider={valider}
        validation={validation}
      />
    );
  } else {
    const fin = elementsConclusion(e);
    contenu = (
      <div key={`${generation}-conclusion`}>
        <div className="equation-box">
          <p>{texteConclusion(e)}</p>
        </div>
        <Solide3DSketch solide={solide} pointsExtra={fin.points} segmentsExtra={fin.segments} labelsSommets={false} />
        <button type="button" className="btn btn-primary" onClick={() => recommencer(genererExerciceOmbreLampe())}>
          Nouvel exercice
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Ombre à la lampe</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente && ecran < NOMBRE_ECRANS)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice consigneGenerale={contexte(e)} blocDonnees={null} />
          {contenu}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
