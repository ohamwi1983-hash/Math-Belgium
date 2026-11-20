import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioAConteneur } from "../core5e/problemesContexte.types";
import { diagnostiquerCelluleTableauA, type ReponseTableauA } from "../moteur5e/verificationProblemesContexte";
import { CONSIGNE_TABLEAU_A } from "../ui5e/formatProblemesContexte";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { TexteRiche5e } from "./TexteRiche5e";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, lireNombre5e, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

interface Props {
  exercice: ExerciceScenarioAConteneur;
  /** Bloc "données" persistant (contexte du scénario A) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données → question, jamais l'inverse). */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauA) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

export function EtapeTableauA({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [lignes, setLignes] = useState(() => exercice.lignesTableau.map(() => ({ h: "", aireBases: "", aireLaterale: "" })));
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const complet = lignes.every((l) => l.h.trim() !== "" && l.aireBases.trim() !== "" && l.aireLaterale.trim() !== "");

  function modifier(i: number, champ: "h" | "aireBases" | "aireLaterale", valeur: string) {
    setLignes((arr) => arr.map((l, j) => (j === i ? { ...l, [champ]: normaliserSigneMoins(valeur) } : l)));
  }

  function celluleErronee(i: number, champ: "h" | "aireBases" | "aireLaterale"): boolean {
    const brut = lignes[i][champ];
    if (!montrerErreurs || brut.trim() === "") return false;
    return diagnostiquerCelluleTableauA(exercice, i, champ, lireNombre5e(brut)) !== "correct";
  }

  function valider() {
    if (!complet) return;
    const reponseSoumise = lignes.map((l) => ({ h: lireNombre5e(l.h), aireBases: lireNombre5e(l.aireBases), aireLaterale: lireNombre5e(l.aireLaterale) }));
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("tableau", exercice, reponseSoumise)) {
      setIllisible(true);
      return;
    }
    setIllisible(false);
    setSoumise(reponseSoumise);
    onValider(reponseSoumise);
  }

  return (
    <div>
      {donnees}
      <p className="prompt-text"><TexteRiche5e texte={CONSIGNE_TABLEAU_A} /></p>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>r (cm)</th>
            <th>h (cm)</th>
            <th>Aire des bases (cm²)</th>
            <th>Aire latérale (cm²)</th>
          </tr>
        </thead>
        <tbody>
          {exercice.lignesTableau.map((ligne, i) => (
            <tr key={i}>
              <td>{ligne.r}</td>
              <td>
                <input
                  type="text"
                  className={`text-input${celluleErronee(i, "h") ? " is-erronee" : ""}`}
                  value={lignes[i].h}
                  onChange={(e) => modifier(i, "h", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={`text-input${celluleErronee(i, "aireBases") ? " is-erronee" : ""}`}
                  value={lignes[i].aireBases}
                  onChange={(e) => modifier(i, "aireBases", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={`text-input${celluleErronee(i, "aireLaterale") ? " is-erronee" : ""}`}
                  value={lignes[i].aireLaterale}
                  onChange={(e) => modifier(i, "aireLaterale", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PiedEcranFonctions
        aides={aidesContexte("tableau", exercice, {})}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("tableau")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("tableau", exercice, soumise, {}) : null}
        validation={validation}
      />
    </div>
  );
}
