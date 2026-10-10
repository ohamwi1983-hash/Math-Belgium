import { useState } from "react";
import type { Exercice } from "../core/generateur.types";
import { Katex } from "./Katex";
import { formatEnonceAffichage } from "../ui/formatEquation";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { BoutonAide } from "./BoutonAide";

type Choix = "pasDe" | "auMoins";

/** Un P2 de ce générateur a toujours au plus 2 racines réelles distinctes (jamais irreductible). */
const MAX_VALEURS = 2;

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** Remplace l'expression affichée par défaut (ax²+bx+c=0). */
  expressionAffichee?: string;
  /** Version "bloc fitter" de `expressionAffichee` (`promptblocfittertousgenerateurs.md`) —
   * prioritaire sur `expressionAffichee` quand fourni ; absent par défaut, comportement historique
   * inchangé pour tous les autres appelants. Voir `EtapeChamp1.tsx` pour le même patron. */
  expressionAfficheeTermes?: string[];
  /** Libellé du champ — "Conditions d'existence (CE)" ou "Racines" selon l'écran. */
  labelChamp?: string;
  /** Libellé du bouton "aucune valeur" — "Pas de CE" ou "Pas de racine" selon le contexte. */
  libellePasDe?: string;
  /** Libellé du bouton "au moins une valeur" — "Au moins une CE" ou "Au moins une racine". */
  libelleAuMoins?: string;
  /** Préfixe du placeholder de chaque champ — "CE" ou "racine". */
  placeholderPrefixe?: string;
  /**
   * Préfixe LaTeX affiché devant chaque champ (ex. "x \\neq" pour une CE, "x =" pour une racine) —
   * absent par défaut : aucun préfixe rendu, comportement historique inchangé. Rend explicite ce
   * que représente la valeur saisie (bug utilisateur du 27/09 : un champ nu "CE 1"/"racine 1" ne
   * dit pas si la valeur exclut ou vaut x).
   */
  prefixeChamp?: string;
  /**
   * Question affichée avant les boutons de choix — absente par défaut (aucun texte, comportement
   * historique inchangé pour l'écran "Racines (numérateur)") ; ex: "Quelle est la condition
   * d'existence ?" pour l'écran CE (prompt-generateurs123vague2.md, générateur 3, point 5).
   */
  question?: string;
  etatActuel?: string | null;
  /** Remplace le libellé par défaut ("État actuel") du bloc ci-dessus — voir EtatActuelPanel. */
  etatActuelLabel?: string;
  /**
   * Bloc "Énoncé" fixe (générateur 6, restructuration en 3 blocs) — absent par défaut :
   * comportement historique inchangé. Fourni : 3 blocs empilés (enonceFixe → EtatActuelPanel →
   * expressionAffichee, ce dernier omis s'il duplique enonceFixe) — voir EtapeIsolement.tsx.
   */
  enonceFixe?: string;
  /**
   * Aide à sens unique (1 seul niveau, ×0,5 sur le score) — absente par défaut : aucun bouton
   * rendu (comportement historique inchangé pour les appelants qui ne fournissent pas
   * `onActiverAide`, ex. le générateur "Analyse d'une fonction du second degré" qui réutilise ce
   * composant hors du périmètre de conceptionaidescomposantspartageshistorique.md).
   */
  aideActivee?: boolean;
  onActiverAide?: () => void;
  /**
   * Texte de l'aide — par défaut adapté aux racines ; les écrans "CE" (même composant, contexte
   * dénominateur) le remplacent (conceptionaidescomposantspartageshistorique.md, point 6).
   */
  texteAide?: string;
  onValider: (racines: [number, number]) => void;
}

/**
 * Remplace les champs fixes x1/x2 (EtapeChamp2) par le pattern "Pas de.../Au moins un(e)..." +
 * liste extensible déjà implémenté par `caracteristiquesAlgebriques`
 * (prompt-generateurs123groupe.md, générateur 3, point 1) — pour les deux écrans de ce générateur
 * qui en avaient encore besoin (CE du dénominateur, racines du numérateur). `EtapeChamp2` lui-même
 * reste inchangé (encore utilisé tel quel par les exercices 1/4/6). `verifierRacines` (moteur de
 * l'exercice 1, réutilisé tel quel par ce générateur) attend toujours `[number, number]` : une
 * seule valeur saisie (racine double) est dupliquée en [v, v] avant l'appel à onValider ; "Pas
 * de..." — jamais la bonne réponse ici, un P2 de ce générateur ayant toujours au moins une racine
 * réelle — soumet un couple [NaN, NaN], rejeté naturellement par la comparaison numérique sans
 * cas spécial côté moteur.
 */
export function EtapeRacinesFlexibles({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  expressionAffichee,
  expressionAfficheeTermes,
  labelChamp = "Racines",
  libellePasDe = "Pas de racine",
  libelleAuMoins = "Au moins une racine",
  placeholderPrefixe = "racine",
  prefixeChamp,
  question,
  etatActuel,
  etatActuelLabel,
  enonceFixe,
  aideActivee,
  onActiverAide,
  texteAide = "Une fois l'expression factorisée, chaque facteur égalé à 0 donne une racine.",
  onValider,
}: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const erronee = tentativesUtilisees > 0;

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setValeurs([""]);
  }

  function ajouterChamp() {
    if (valeurs.length >= MAX_VALEURS) return;
    setValeurs([...valeurs, ""]);
  }

  function retirerChamp(index: number) {
    if (valeurs.length <= 1) return;
    setValeurs(valeurs.filter((_, i) => i !== index));
  }

  function modifierChamp(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  function construireReponse(): [number, number] | null {
    if (choix === "pasDe") return [NaN, NaN];
    if (choix === "auMoins") {
      const nombres = valeurs.map((v) => Number(v.trim().replace(",", ".")));
      if (valeurs.some((v) => v.trim() === "") || nombres.some((n) => !Number.isFinite(n))) return null;
      return nombres.length === 1 ? [nombres[0], nombres[0]] : [nombres[0], nombres[1]];
    }
    return null;
  }

  const reponse = construireReponse();

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {enonceFixe !== undefined ? (
        <>
          <div className="equation-box">
            <Katex expression={enonceFixe} block />
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} label={etatActuelLabel} />
          {expressionAffichee !== undefined && expressionAffichee !== enonceFixe && (
            <div className="equation-box">
              <Katex expression={expressionAffichee} block />
            </div>
          )}
        </>
      ) : expressionAfficheeTermes !== undefined ? (
        <>
          <div className="equation-box equation-box-termes">
            {expressionAfficheeTermes.map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} label={etatActuelLabel} />
        </>
      ) : (
        <>
          <div className="equation-box">
            <Katex
              expression={
                expressionAffichee ?? formatEnonceAffichage(exercice.enonce, exercice.formeAffichage, exercice.parametresAffichage)
              }
              block
            />
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} label={etatActuelLabel} />
        </>
      )}
      {question !== undefined && <p className="prompt-text">{question}</p>}
      <div className="options-grid">
        <button type="button" className={choix === "pasDe" ? "btn toggle-active" : "btn"} onClick={() => choisir("pasDe")}>
          {libellePasDe}
        </button>
        <button type="button" className={choix === "auMoins" ? "btn toggle-active" : "btn"} onClick={() => choisir("auMoins")}>
          {libelleAuMoins}
        </button>
      </div>

      {choix === "auMoins" && (
        <div className="liste-morceaux contenu-conditionnel">
          <span className="field-label">{labelChamp}</span>
          {valeurs.map((valeur, index) => (
            <div key={index} className="liste-morceaux-ligne">
              {prefixeChamp !== undefined && (
                <span className="ce-slot-latex">
                  <Katex expression={prefixeChamp} />
                </span>
              )}
              <input
                className={`text-input${erronee ? " is-erronee" : ""}`}
                value={valeur}
                onChange={(e) => modifierChamp(index, filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
                placeholder={`${placeholderPrefixe} ${index + 1}`}
                aria-label={`${placeholderPrefixe} ${index + 1}`}
              />
              {valeurs.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer ${placeholderPrefixe} ${index + 1}`}
                  onClick={() => retirerChamp(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {valeurs.length < MAX_VALEURS && (
            <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterChamp}>
              + Ajouter une {placeholderPrefixe}
            </button>
          )}
        </div>
      )}

      {onActiverAide && (
        <div>
          {aideActivee && <p className="prompt-text">{texteAide}</p>}
          <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        disabled={reponse === null}
        onClick={() => reponse !== null && onValider(reponse)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
