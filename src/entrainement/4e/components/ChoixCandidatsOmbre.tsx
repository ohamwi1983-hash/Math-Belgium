import { useState } from "react";
import type { ReactNode } from "react";
import type { Solide3D } from "../core/geometrieEspace.types";
import { fusionner, melangerCandidats } from "../ui/formatOmbreSoleil";
import type { ElementsCroquis, EtatCandidat } from "../ui/formatOmbreSoleil";
import { formatMessageErreur } from "../ui/messageErreur";
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
}

const STYLE_CORRECT = { borderColor: "var(--color-success)", background: "var(--color-success-bg)", color: "var(--color-success)", fontWeight: 700 };

/**
 * Écran de choix commun aux 4 écrans notés d'"Ombre au soleil" : les 4 candidats sont dessinés en
 * même temps, numérotés dans un ordre mélangé UNE fois par écran (la `key` posée par
 * `AppOmbreSoleil.tsx` change à chaque écran et à chaque exercice — audit du chapitre 8, point 28).
 * Seule l'option refusée passe en rouge (point 7) ; une fois l'écran clos, la bonne réponse est
 * montrée en vert sur le dessin et sur son bouton (points 6 et 30).
 */
export function ChoixCandidatsOmbre(props: Props) {
  const { solide, fond, consigne, information, candidats, idCorrect, libelle, aides, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation } = props;
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
    if (tentativesUtilisees > 0 && id === soumis && id === choix) return "refuse";
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

      <div className="options-grid-compact">
        {ordre.map((candidat, index) => {
          const etat = etatDe(candidat.id);
          const actif = !validation && choix === candidat.id;
          return (
            <button
              key={candidat.id}
              type="button"
              disabled={!!validation}
              className={`btn${actif || etat === "refuse" ? " toggle-active" : ""}${etat === "refuse" ? " is-erronee" : ""}`}
              style={etat === "correct" ? STYLE_CORRECT : undefined}
              onClick={() => setChoix(candidat.id)}
            >
              {libelle(index + 1)}
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
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} reponseAttendue={<p>{libelle(numeroDe(idCorrect))}, en vert sur le dessin.</p>} />}
    </div>
  );
}
