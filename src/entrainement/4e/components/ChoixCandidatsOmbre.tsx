import { useState } from "react";
import type { ReactNode } from "react";
import type { Solide3D } from "../core/geometrieEspace.types";
import { fusionner, melangerCandidats } from "../ui/formatOmbreSoleil";
import type { ElementsCroquis, EtatCandidat } from "../ui/formatOmbreSoleil";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../ui/choixFige";
import { Solide3DSketch } from "./Solide3DSketch";
import { BoutonAide } from "./BoutonAide";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

export interface CandidatOmbre {
  id: string;
  /** Dessin du candidat sous son numéro d'affichage, dans l'état voulu. */
  dessin: (numero: number, etat: EtatCandidat) => ElementsCroquis;
}

export interface FicheChoixOmbre {
  votreReponse: ReactNode;
  reponseAttendue: ReactNode;
}

interface Props {
  solide: Solide3D;
  /** Tout ce qui ne dépend pas des candidats (sol, obstacles, bâtons, exemple). */
  fond: ElementsCroquis;
  consigne: string;
  /** Ligne d'information sous la consigne (ex. « Sommet 1/2 »). */
  information?: string;
  candidats: CandidatOmbre[];
  idCorrect: string;
  libelle: (numero: number) => string;
  /** Un texte par niveau d'aide, et le dessin ajouté à partir de ce niveau. */
  aides: { texte: string; dessin?: ElementsCroquis }[];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (id: string, fiche: FicheChoixOmbre) => void;
  validation?: ValidationEtapeProps | null;
  /** Message propre au candidat choisi faux (une tentative, audit 4e ch. 8, lot B) — remplace
   * « Tentatives épuisées ». */
  messageFaux?: (id: string) => string;
}

/**
 * Écran de choix commun aux 4 écrans notés d'"Ombre au soleil" : les 4 candidats sont dessinés en
 * même temps, numérotés dans un ordre mélangé UNE fois par écran (la `key` posée par
 * `AppOmbreSoleil.tsx` change à chaque écran et à chaque exercice — audit du chapitre 8, point 28).
 * Choix fermé à UNE tentative, jugé puis figé (audit 4e ch. 8, lot B, `ui/choixFige.ts`) : une fois
 * l'écran clos, le candidat choisi faux est en rouge ✗ (dessin et bouton), le bon en vert ✓, et le
 * message dit l'erreur de construction trahie par le choix (`messageFaux`).
 */
export function ChoixCandidatsOmbre(props: Props) {
  const { solide, fond, consigne, information, candidats, idCorrect, libelle, aides, niveauAide, onActiverAide, onValider, validation, messageFaux } = props;
  const [ordre] = useState(() => melangerCandidats(candidats));
  const [choix, setChoix] = useState<string | null>(null);
  const [soumis, setSoumis] = useState<string | null>(null);

  const numeroDe = (id: string) => ordre.findIndex((c) => c.id === id) + 1;

  function etatDe(id: string): EtatCandidat {
    if (validation) {
      if (id === idCorrect) return "correct";
      if (validation.revele && id === soumis) return "refuse";
      return "neutre";
    }
    if (id === choix) return "selectionne";
    return "neutre";
  }

  // Les candidats « neutres » sont dessinés d'abord, la sélection et la correction par-dessus.
  const priorite = (etat: EtatCandidat) => (etat === "neutre" ? 0 : 1);
  const dessins = [...ordre]
    .map((c, i) => ({ etat: etatDe(c.id), dessin: c.dessin(i + 1, etatDe(c.id)) }))
    .sort((a, b) => priorite(a.etat) - priorite(b.etat))
    .map((d) => d.dessin);
  const dessinsAide = aides.slice(0, niveauAide).flatMap((a) => (a.dessin ? [a.dessin] : []));
  const croquis = fusionner(fond, ...dessinsAide, ...dessins);

  function miniCroquis(id: string, etat: EtatCandidat) {
    const candidat = ordre.find((c) => c.id === id)!;
    const elements = fusionner(fond, candidat.dessin(numeroDe(id), etat));
    return (
      <div>
        <p>{libelle(numeroDe(id))}</p>
        <Solide3DSketch solide={solide} pointsExtra={elements.points} segmentsExtra={elements.segments} labelsSommets={false} />
      </div>
    );
  }

  function valider() {
    if (choix === null) return;
    setSoumis(choix);
    onValider(choix, {
      votreReponse: miniCroquis(choix, choix === idCorrect ? "correct" : "refuse"),
      reponseAttendue: miniCroquis(idCorrect, "correct"),
    });
  }

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      {information && <p className="prompt-fact">{information}</p>}

      <Solide3DSketch solide={solide} pointsExtra={croquis.points} segmentsExtra={croquis.segments} labelsSommets={false} />

      <div className="options-grid-compact" role="radiogroup">
        {ordre.map((candidat, index) => {
          const etatOptions = { selection: choix, choisie: validation ? soumis : null, bonne: idCorrect };
          const aria = ariaOptionChoixFerme(candidat.id, etatOptions);
          return (
            <button
              key={candidat.id}
              type="button"
              role="radio"
              aria-checked={choix === candidat.id}
              disabled={!!validation}
              className={classeOptionChoixFerme(candidat.id, etatOptions)}
              onClick={() => setChoix(candidat.id)}
            >
              {libelle(index + 1)}
              {aria && <span className="sr-only"> — {aria}</span>}
            </button>
          );
        })}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          {aides.slice(0, niveauAide).map((a, i) => (
            <p key={i}>{a.texte}</p>
          ))}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={valider}>
            Valider
          </button>
        </>
      )}
      {validation && (
        <ValidationEcran
          {...validation}
          messageRevele={validation.revele && soumis && soumis !== idCorrect && messageFaux ? messageFaux(soumis) : validation.messageRevele}
          reponseAttendue={<p>{libelle(numeroDe(idCorrect))}, en vert sur le dessin.</p>}
        />
      )}
    </div>
  );
}
