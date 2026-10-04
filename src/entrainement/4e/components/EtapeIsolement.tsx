import { useState } from "react";
import type { Exercice } from "../core/generateur.types";
import { Katex } from "./Katex";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { formatEnonceAffichage } from "../ui/formatEquation";
import { formatMessageErreur } from "../ui/messageErreur";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import type { StatutVerification } from "../moteur/statutVerification";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";

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
  /** Bloc "état actuel" (prompt-corrections-moteur-partage.md, point 1) — absent/null par défaut : rien de rendu. */
  etatActuel?: string | null;
  /**
   * Bloc "Énoncé" fixe (promptcorrectionsgenerateurs764transversal.md, générateur 6, point 2.1) —
   * absent par défaut : comportement historique strictement inchangé (`expressionAffichee` reste le
   * seul bloc, rendu en premier, suivi de l'état actuel). Fourni : restructure en 3 blocs empilés —
   * `enonceFixe` (l'énoncé de départ complet, fixe) en premier, puis `EtatActuelPanel`, puis
   * `expressionAffichee` en dernier (le "bloc de travail" de cette étape) — omis automatiquement
   * s'il est littéralement identique à `enonceFixe` (aucun bloc de travail distinct sur cette
   * étape, ex. l'étape "isoler" elle-même, où travailler consiste justement à transformer l'énoncé).
   */
  enonceFixe?: string;
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
  onValider: (reponse: string) => void;
}

export function EtapeIsolement({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  expressionAffichee,
  question,
  label,
  etatActuel,
  enonceFixe,
  diagnostiquer,
  aideActivee,
  onActiverAide,
  texteAide = "Rassemble tous les termes du même côté, pour obtenir 0 de l'autre côté.",
  onValider,
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
          <div className="equation-box">
            <Katex expression={enonceFixe} block />
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} />
          {expressionAffichee !== undefined && expressionAffichee !== enonceFixe && (
            <div className="equation-box">
              <Katex expression={expressionAffichee} block />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="equation-box">
            <Katex expression={expressionParDefaut()} block />
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} />
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
        <input id="isolement" className="text-input" value={reponse} onChange={(e) => setReponse(e.target.value)} />
      </div>
      <div>
        {aideActivee && <p className="prompt-text">{texteAide}</p>}
        <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
          {aideActivee ? "Aide utilisée" : "Aide"}
        </button>
      </div>
      <button type="button" className="btn btn-primary" disabled={reponse.trim() === ""} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, diagnostiquer?.(reponse))}
        </p>
      )}
    </div>
  );
}
