import { useState } from "react";
import { Katex } from "./Katex";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { lireNombreSaisi } from "../ui/lireNombre";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Conservé pour la compatibilité : l'aide est désormais à deux niveaux (`aides`). */
  aideActivee?: boolean;
  onActiverAide: () => void;
  aides: FragmentConsigne[][];
  messageCible?: (reponse: { s: number; p: number }) => FragmentConsigne[] | null;
  onValider: (reponse: { s: number; p: number }) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "somme et produit" (relations de Viète) : première étape, jamais de récapitulatif (rien
 * n'est encore confirmé pour cet exercice). Deux champs numériques séparés, validés ensemble en
 * une seule tentative — isole le piège de signe classique sur chacun des deux (oublier le "-"
 * dans S, en ajouter un par erreur dans P) sans jamais révéler les racines individuelles : ce
 * n'est que l'écran "factorisation" qui les révèle.
 */
export function EtapeSommeProduit({ tentativesUtilisees, tentativesMax, onActiverAide, aides, messageCible, onValider, validation }: Props) {
  const [s, setS] = useState("");
  const [p, setP] = useState("");

  const saisie = useTentativeLisible<{ s: number; p: number }>();
  const complet = s.trim() !== "" && p.trim() !== "";

  /** Une saisie illisible (ni nombre, ni fraction) ne consomme pas de tentative. */
  function valider() {
    const sLu = lireNombreSaisi(s);
    const pLu = lireNombreSaisi(p);
    saisie.tenter({ s: sLu ?? Number.NaN, p: pLu ?? Number.NaN }, sLu !== null && pLu !== null, onValider);
  }

  return (
    <div>
      <p className="prompt-text">
        Calcule la somme S et le produit P des racines de cette équation, sans chercher les racines elles-mêmes.
      </p>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relrac-s">
            <Katex expression="S =" />
          </label>
          <input
            id="relrac-s"
            className="text-input"
            value={s}
            onChange={(e) => setS(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relrac-p">
            <Katex expression="P =" />
          </label>
          <input
            id="relrac-p"
            className="text-input"
            value={p}
            onChange={(e) => setP(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>
      {!validation && (
        <>
          <AidesNiveaux aides={aides} onPremiereAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            texteIllisible="Nombre non reconnu : écris un entier, un décimal ou une fraction (ex : −3 ou 5/2). Cette saisie ne compte pas comme une tentative."
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={saisie.soumise !== null ? messageCible?.(saisie.soumise) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
