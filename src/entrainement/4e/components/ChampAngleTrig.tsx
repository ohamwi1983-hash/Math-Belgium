import { useState } from "react";
import type { ReactNode } from "react";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { AidesNiveaux, MESSAGE_ANGLE_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { lireAngle } from "../moteur/verificationValeurExacte";

interface Props {
  id: string;
  question: string;
  label: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aides: FragmentConsigne[][];
  /** Figure d'aide (cercle) — affichée à partir du niveau 2. */
  figure?: (niveau: number) => ReactNode;
  onPremiereAide: () => void;
  messageCible: (valeur: number) => FragmentConsigne[] | null;
  onValider: (valeur: number) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Champ d'angle en degrés des générateurs 14 et 15 (réduction, angle du premier quadrant) — règles
 * communes (audit 4e ch. 5, lot B) : « − » normalisé, saisie illisible jamais transmise au moteur
 * (aucune tentative), message adapté à un angle, message ciblé, aides à deux niveaux.
 */
export function ChampAngleTrig({ id, question, label, tentativesUtilisees, tentativesMax, recapitulatif, aides, figure, onPremiereAide, messageCible, onValider, validation }: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<number>();
  const complet = texte.trim() !== "";
  const derniere = saisie.soumise;
  const enErreur = tentativesUtilisees > 0 && !saisie.illisible;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">{question}</p>
      <div className="field">
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
        <input id={id} className={`text-input${enErreur ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))} />
      </div>
      {!validation && (
        <>
          <AidesNiveaux aides={aides} figure={figure} onPremiereAide={onPremiereAide} />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!complet}
            onClick={() => {
              const v = lireAngle(texte);
              saisie.tenter(v ?? 0, v !== null, onValider);
            }}
          >
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            texteIllisible={MESSAGE_ANGLE_ILLISIBLE}
            cible={derniere !== null ? messageCible(derniere) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
