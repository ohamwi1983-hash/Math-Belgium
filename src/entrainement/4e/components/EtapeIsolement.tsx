import { useState } from "react";
import type { Exercice } from "../core/generateur.types";
import { Katex } from "./Katex";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { formatEnonceAffichage } from "../ui/formatEquation";
import { formatMessageErreur } from "../ui/messageErreur";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import type { StatutVerification } from "../moteur/statutVerification";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  /** Requis sauf si expressionAffichee est fourni (voir plus bas) — sert uniquement au fallback d'affichage par défaut. */
  exercice?: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Récapitulatif des étapes précédentes — absent par défaut (l'exercice 1 n'a rien à récapituler avant l'isolement). */
  recapitulatif?: EntreeRecapitulatif[];
  /** Remplace l'expression affichée par défaut (ax²+bx+c isolé) — ex: "A/(x-p) = x-q" pour "L'inconnue au dénominateur". */
  expressionAffichee?: string;
  /** Remplace la question par défaut ("Réécris cette équation sous la forme ax²+bx+c=0"). */
  question?: string;
  /**
   * Remplace le libellé par défaut ("Équation sous forme générale") ; `null` masque entièrement
   * le libellé (prompt-generateurs123vague2.md, générateur 1, point 2 — n'a de sens que pour
   * cas_general et produit_remarquable, où un vrai "ax²+bx+c=0" est attendu ; les autres
   * catégories, qui ne font que regrouper les termes sans développer, n'ont pas de forme générale
   * à nommer).
   */
  label?: string | null;
  /**
   * Bloc "Énoncé" fixe (promptcorrectionsgenerateurs764transversal.md, générateur 6, point 2.1) —
   * absent par défaut : comportement historique strictement inchangé (`expressionAffichee` reste le
   * seul bloc). Fourni : restructure en 2 blocs empilés — `enonceFixe` (l'énoncé de départ complet,
   * fixe) en premier, puis `expressionAffichee` en dernier (le "bloc de travail" de cette étape) —
   * omis automatiquement s'il est littéralement identique à `enonceFixe` (aucun bloc de travail
   * distinct sur cette étape, ex. l'étape "isoler" elle-même, où travailler consiste justement à
   * transformer l'énoncé).
   */
  enonceFixe?: string;
  /**
   * Masque le bloc "énoncé" local (enonceFixe / expression par défaut) — absent/false par défaut :
   * comportement historique inchangé. `true` : l'appelant affiche déjà cette donnée de façon
   * centralisée (`EnTeteExercice`, blocDonnees) et ce bloc serait redondant ici. Un `expressionAffichee`
   * réellement distinct d'`enonceFixe` reste affiché — seul le bloc "fixe" disparaît.
   */
  masquerBlocDonnees?: boolean;
  /**
   * Statut à 3 valeurs (convention CLAUDE.md) — fournit le diagnostic correspondant à ce champ
   * (`diagnostiquerIsolement`). Absent par défaut : message générique inchangé, comme avant
   * l'introduction de ce statut (prompt-generateurs123vague2.md, générateur 1, point 3).
   */
  diagnostiquer?: (valeur: string) => StatutVerification;
  aideActivee: boolean;
  onActiverAide: () => void;
  /**
   * Texte de l'aide (1 seul niveau, ×0,5 sur le score de l'étape) — par défaut la consigne pour
   * regrouper les termes (gen1) ; gen4/gen6 le remplacent par la consigne "élimine les
   * dénominateurs" (conceptionaidescomposantspartageshistorique.md, point 2).
   */
  texteAide?: string;
  /** Exemple de saisie affiché dans le champ vide — absent par défaut (comportement inchangé). */
  placeholder?: string;
  onValider: (reponse: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeIsolement({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  expressionAffichee,
  question,
  label,
  enonceFixe,
  masquerBlocDonnees = false,
  diagnostiquer,
  aideActivee,
  onActiverAide,
  texteAide = "Rassemble tous les termes du même côté, pour obtenir 0 de l'autre côté.",
  placeholder,
  onValider,
  validation,
}: Props) {
  const [reponse, setReponse] = useState("");
  const expressionParDefaut = () =>
    expressionAffichee ??
    formatEnonceAffichage(
      (exercice as Exercice).enonce,
      (exercice as Exercice).formeAffichage,
      (exercice as Exercice).parametresAffichage,
      (exercice as Exercice).irrationnel,
    );

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif ?? []} />
      {enonceFixe !== undefined ? (
        <>
          {!masquerBlocDonnees && (
            <div className="equation-box">
              <Katex expression={enonceFixe} block />
            </div>
          )}
          {expressionAffichee !== undefined && expressionAffichee !== enonceFixe && (
            <div className="equation-box">
              <Katex expression={expressionAffichee} block />
            </div>
          )}
        </>
      ) : (
        <>
          {!masquerBlocDonnees && (
            <div className="equation-box">
              <Katex expression={expressionParDefaut()} block />
            </div>
          )}
        </>
      )}
      <p className="prompt-text">{question ?? "Réécris cette équation sous la forme ax² + bx + c = 0."}</p>
      <ApercuExpressionLatex texte={reponse} label={label === null ? undefined : `${label ?? "Équation sous forme générale"} =`} />
      <div className="field">
        {label !== null && (
          <label className="field-label" htmlFor="isolement">
            {label ?? "Équation sous forme générale"}
          </label>
        )}
        <input id="isolement" className="text-input" value={reponse} placeholder={placeholder} onChange={(e) => setReponse(e.target.value)} />
      </div>
      {!validation && (
        <>
          <div>
            {aideActivee && (
              <div className="triangle-quelconque-aide">
                <p>{texteAide}</p>
              </div>
            )}
            <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
          </div>
          <button type="button" className="btn btn-primary" disabled={reponse.trim() === ""} onClick={() => onValider(reponse)}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, diagnostiquer?.(reponse))}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
