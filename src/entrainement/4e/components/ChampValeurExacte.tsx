import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { AidesNiveaux, MESSAGE_VALEUR_APPROCHEE, MESSAGE_VALEUR_EXACTE_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { sansTentative, valeurSaisieExacte, type StatutExactNumerique } from "../moteur/saisieExacteTrigo";

const MESSAGE_RECOPIE =
  "Remplace sin, cos et tan par des nombres : le champ attend une valeur, comme √3/2 ou −4/5. Cette saisie ne compte pas comme une tentative.";

interface Props {
  id: string;
  /** Bloc au-dessus de la question (résultats des écrans précédents). */
  enTete?: ReactNode;
  question: ReactNode;
  placeholder: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  diagnostiquer: (texte: string) => StatutExactNumerique;
  messageCible: (valeur: number) => FragmentConsigne[] | null;
  aides: FragmentConsigne[][];
  onPremiereAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Champ de valeur EXACTE (gen16 — décision de l'utilisateur, audit 4e ch. 5 question 3) : forme
 * exacte ou décimal exact seulement. Une valeur approchée, une saisie illisible ou un sin/cos/tan
 * recopié ne sont jamais transmis au moteur (aucune tentative) et reçoivent chacun leur message.
 */
export function ChampValeurExacte({ id, enTete, question, placeholder, tentativesUtilisees, tentativesMax, diagnostiquer, messageCible, aides, onPremiereAide, onValider, validation }: Props) {
  const [texte, setTexte] = useState("");
  const [messageSans, setMessageSans] = useState(MESSAGE_VALEUR_EXACTE_ILLISIBLE);
  const saisie = useTentativeLisible<string>();
  const complet = texte.trim() !== "";
  const v = saisie.soumise !== null ? valeurSaisieExacte(saisie.soumise) : null;

  return (
    <div>
      {enTete}
      <p className="prompt-text">{question}</p>
      <div className="field">
        <label className="field-label" htmlFor={id}>
          Réponse
        </label>
        <input
          id={id}
          className={`text-input${tentativesUtilisees > 0 && !saisie.illisible ? " is-erronee" : ""}`}
          placeholder={placeholder}
          value={texte}
          onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
        />
      </div>
      {!validation && (
        <>
          <AidesNiveaux aides={aides} onPremiereAide={onPremiereAide} />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!complet}
            onClick={() => {
              const statut = diagnostiquer(texte);
              if (sansTentative(statut)) setMessageSans(statut === "approchee" ? MESSAGE_VALEUR_APPROCHEE : statut === "recopie" ? MESSAGE_RECOPIE : MESSAGE_VALEUR_EXACTE_ILLISIBLE);
              saisie.tenter(texte, !sansTentative(statut), onValider);
            }}
          >
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            texteIllisible={messageSans}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={v !== null ? messageCible(v) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
