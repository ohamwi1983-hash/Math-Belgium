import { useState } from "react";
import type { ExerciceTangenteHorizontale } from "../core5e/tangentes.types";
import { consigneGenerale, formatTermesDonneesLatex, labelPointCoordonnees, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatTangentes";
import type { PointSaisi } from "../moteur5e/verificationTangentes";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelTangente } from "./EtatActuelTangente";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceTangenteHorizontale;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: PointSaisi[]) => void;
  /** Diagnostic PAR CHAMP (x et y indépendamment) — correct si la composante saisie correspond à
   * N'IMPORTE LEQUEL des points de tangence attendus (ensemble, ordre indifférent). */
  diagnostiquer?: (point: PointSaisi) => { x: StatutVerification; y: StatutVerification };
}

/** Écran "coordonnees" (variante B, "horizontale") — pattern ADD-AS-NEEDED de points COMPLETS,
 * chaque point saisi comme 2 CHAMPS SÉPARÉS x/y côte à côte (convention 5gen24,
 * `EtapeCasSpecialEtudeComplete.tsx`), jamais un champ combiné "(x;y)" en texte libre —
 * `prompt5gen28variantesabc.md`. Labels dynamiques "Point :" (1 point) / "Point 1 :","Point 2 :"...
 * (plusieurs). Vérifiée comme un ENSEMBLE, ordre indifférent (`verifierCoordonneesHorizontale`).
 * Calculatrice PRÉSENTE (calcul de l'ordonnée f(x)). */
export function EtapeCoordonneesTangente({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [points, setPoints] = useState<PointSaisi[]>([{ x: "", y: "" }]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = points.length > 0 && points.every((p) => p.x.trim() !== "" && p.y.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? points.map((p) => diagnostiquer(p)) : null;
  const aide2 = texteAideNiveau2("coordonnees");
  const question = questionSpecifiqueEcran(exercice, "coordonnees");

  function ajouter() {
    setPoints((arr) => [...arr, { x: "", y: "" }]);
  }
  function retirer(i: number) {
    setPoints((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierX(i: number, valeur: string) {
    setPoints((arr) => arr.map((p, j) => (j === i ? { ...p, x: valeur } : p)));
  }
  function modifierY(i: number, valeur: string) {
    setPoints((arr) => arr.map((p, j) => (j === i ? { ...p, y: valeur } : p)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) {
      const tous = points.map((p) => diagnostiquer(p));
      const pire = tous.flatMap((s) => [s.x, s.y]).find((s) => s !== "correct") ?? "correct";
      setDernierStatut(pire);
    }
    onValider(points);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelTangente exercice={exercice} phase="coordonnees" />
      <p className="prompt-text">{question.texteAvant}</p>
      {points.map((p, i) => {
        const statut = statuts ? statuts[i] : null;
        return (
          <div key={i} className="tangente-point-groupe">
            <p className="field-label field-label-minuscule tangente-point-label">{labelPointCoordonnees(points.length, i)}</p>
            <div className="field-row">
              <div className="field field-inline">
                <label className="field-label field-label-minuscule" htmlFor={`tangente-coord-x-${i}`}>
                  x
                </label>
                <input
                  id={`tangente-coord-x-${i}`}
                  type="text"
                  className={`text-input${statut && statut.x !== "correct" ? " is-erronee" : ""}`}
                  value={p.x}
                  onChange={(e) => modifierX(i, e.target.value)}
                  placeholder="ex : 2"
                />
              </div>
              <div className="field field-inline">
                <label className="field-label field-label-minuscule" htmlFor={`tangente-coord-y-${i}`}>
                  y
                </label>
                <input
                  id={`tangente-coord-y-${i}`}
                  type="text"
                  className={`text-input${statut && statut.y !== "correct" ? " is-erronee" : ""}`}
                  value={p.y}
                  onChange={(e) => modifierY(i, e.target.value)}
                  placeholder="ex : 5"
                />
              </div>
              {points.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirer(i)}>
                  ×
                </button>
              )}
            </div>
          </div>
        );
      })}
      <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouter}>
        + Ajouter un point
      </button>
      <CalculatriceScientifique />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1("coordonnees")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
