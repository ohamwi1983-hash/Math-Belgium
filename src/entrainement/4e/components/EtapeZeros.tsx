import { useState } from "react";
import type { Exercice } from "../core/generateur.types";
import type { ReponseZeros } from "../moteur";
import { diagnostiquerExpressionNumerique, parserExpressionNumerique } from "../moteur/verificationCaracteristiquesAlgebriques";
import { formatEnonceAffichage } from "../ui/formatEquation";
import { expressionLibreVersLatex } from "../ui/formatExpressionLatex";
import { formatMessageErreur } from "../ui/messageErreur";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

type Choix = "aucun" | "auMoinsUn";

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  etatActuel?: string | null;
  /**
   * Bloc "Énoncé" fixe (voir EtapeIsolement.tsx) — absent par défaut : comportement historique
   * inchangé (l'équation-box affiche directement `exercice`). Fourni : l'équation-box affiche
   * `enonceFixe` à la place, jamais `exercice` (qui peut avoir été réduit par la simplification —
   * bug utilisateur du 26/09, voir historique).
   */
  enonceFixe?: string;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: ReponseZeros) => void;
}

/**
 * Étape "Zéros" (prompt-generateurs123groupe.md, points 3-6) — remplace les champs fixes x1/x2
 * (EtapeChamp2) par le pattern "Aucun/Au moins un zéro" + liste extensible déjà implémenté par
 * `EtapeZerosAlgebrique.tsx` (générateur "Caractéristiques algébriques", chapitre 2). Chaque champ
 * accepte une expression libre complète (`parserExpressionNumerique`, réutilisé tel quel — jamais
 * une nouvelle logique de parsing) : un simple entier pour les 4 catégories rationnelles, une
 * expression radicale équivalente (`6*sqrt(5)`, `6sqrt(5)`...) pour la variante irrationnelle.
 * `verifierZeros` (moteur/verification.ts) compare alors directement à la vraie valeur réelle,
 * jamais au coefficient rationnel du gabarit — voir sa documentation.
 */
export function EtapeZeros({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  etatActuel,
  enonceFixe,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setValeurs([""]);
  }

  function ajouterChamp() {
    setValeurs([...valeurs, ""]);
  }

  function retirerChamp(index: number) {
    if (valeurs.length <= 1) return;
    setValeurs(valeurs.filter((_, i) => i !== index));
  }

  function modifierChamp(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  function construireReponse(): ReponseZeros | null {
    if (choix === "aucun") return { aucun: true, valeurs: [] };
    if (choix === "auMoinsUn") {
      const nombres = valeurs.map(parserExpressionNumerique);
      if (nombres.some((n) => n === null)) return null;
      return { aucun: false, valeurs: nombres as number[] };
    }
    return null;
  }

  const reponse = construireReponse();
  const placeholderExemple = exercice.irrationnel ? "ex : 6*sqrt(5)" : "ex : -3";

  /**
   * Aperçu en direct de l'ensemble solution "S = {...}" (bug utilisateur du 27/09) — même principe
   * que ApercuExpressionLatex (jamais de rendu partiel : masqué tant qu'une valeur remplie ne
   * parse pas), mais combine plusieurs champs en un seul ensemble plutôt qu'un seul champ, donc
   * réplique la logique ici plutôt que de réutiliser ce composant tel quel.
   */
  function apercuEnsembleSolutions(): string | null {
    if (choix !== "auMoinsUn") return null;
    const remplies = valeurs.map((v) => v.trim()).filter((v) => v !== "");
    if (remplies.length === 0) return null;
    try {
      const rendus = remplies.map((v) => expressionLibreVersLatex(v));
      return `S = \\{${rendus.join(" ; ")}\\}`;
    } catch {
      return null;
    }
  }
  const apercuEnsemble = apercuEnsembleSolutions();

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex
          expression={
            enonceFixe ??
            formatEnonceAffichage(exercice.enonce, exercice.formeAffichage, exercice.parametresAffichage, exercice.irrationnel)
          }
          block
        />
      </div>
      <EtatActuelPanel latex={etatActuel ?? null} />
      <p className="prompt-text">Quelles sont les solutions de cette équation ?</p>
      <div className="options-grid">
        <button type="button" className={choix === "aucun" ? "btn toggle-active" : "btn"} onClick={() => choisir("aucun")}>
          Aucune solution
        </button>
        <button
          type="button"
          className={choix === "auMoinsUn" ? "btn toggle-active" : "btn"}
          onClick={() => choisir("auMoinsUn")}
        >
          Au moins une solution
        </button>
      </div>

      {choix === "aucun" && (
        <div className="apercu-expression-latex contenu-conditionnel">
          <Katex expression="S = \varnothing" />
        </div>
      )}

      {choix === "auMoinsUn" && (
        <div className="liste-morceaux contenu-conditionnel">
          {apercuEnsemble !== null && (
            <div className="apercu-expression-latex">
              <Katex expression={apercuEnsemble} />
            </div>
          )}
          {valeurs.map((valeur, index) => (
            <div key={index} className="liste-morceaux-ligne">
              <input
                className="text-input"
                value={valeur}
                onChange={(e) => modifierChamp(index, e.target.value)}
                placeholder={`solution ${index + 1}, ${placeholderExemple}`}
                aria-label={`Solution ${index + 1}`}
              />
              {valeurs.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer la solution ${index + 1}`}
                  onClick={() => retirerChamp(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterChamp}>
            + Ajouter une solution
          </button>
        </div>
      )}

      <div>
        {aideActivee && (
          <p className="prompt-text">Une fois l'équation factorisée, chaque facteur égalé à 0 donne une solution.</p>
        )}
        <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
          {aideActivee ? "Aide utilisée" : "Aide"}
        </button>
      </div>

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
          {formatMessageErreur(
            tentativesUtilisees,
            tentativesMax,
            choix === "auMoinsUn" && valeurs.some((v) => diagnostiquerExpressionNumerique(v) === "parse_error")
              ? "parse_error"
              : undefined,
          )}
        </p>
      )}
    </div>
  );
}
