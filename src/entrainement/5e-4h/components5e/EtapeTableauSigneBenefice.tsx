import { useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceContexteEconomiqueB } from "../core5e/contexteEconomique.types";
import type { ReponseTableauSigneBenefice } from "../moteur5e/verificationContexteEconomique";
import { diagnostiquerBPrimePointTest, valeursBPrimePointsTest } from "../moteur5e/verificationContexteEconomique";
import { consigneEcranRiche, consigneGenerale, formatTermesDonneesLatex, questionFinale } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteRiche5e } from "./TexteRiche5e";

interface Props {
  exercice: ExerciceContexteEconomiqueB;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauSigneBenefice) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (lot B). */
  cible?: (valeurs: { avant: string; apres: string }) => FragmentConsigne[] | null;
  /** Aides à deux niveaux (niveau 2 posé pour l'instance). */
  aides: AideTrig[];
  /** Message d'illisible par nature de champ (déjà terminé par « … ne compte pas comme une tentative. »). */
  texteIllisible?: string;
}

/** Écran "tableauSigneBenefice" — l'élève calcule B'(x) en deux points test entiers de part et
 * d'autre de la quantité retenue (audit 5e ch. 5, décision B : les boutons « + / − » avaient
 * toujours la même réponse « + puis − »). Le signe et la conclusion (maximum) sont affichés dans la
 * réponse attendue. */
export function EtapeTableauSigneBenefice({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, cible, aides, texteIllisible }: Props) {
  const [avant, setAvant] = useState("");
  const [apres, setApres] = useState("");
  const [soumises, setSoumises] = useState<{ avant: string; apres: string } | null>(null);
  const [ecritureIllisible, setEcritureIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = avant.trim() !== "" && apres.trim() !== "";
  const cibles = valeursBPrimePointsTest(exercice);
  const statutAvant = montrerErreurs ? diagnostiquerBPrimePointTest(avant, cibles.avant) : null;
  const statutApres = montrerErreurs ? diagnostiquerBPrimePointTest(apres, cibles.apres) : null;

  function valider() {
    if (!complet) return;
    if (diagnostiquerBPrimePointTest(avant, cibles.avant) === "parse_error" || diagnostiquerBPrimePointTest(apres, cibles.apres) === "parse_error") {
      setEcritureIllisible(true);
      return;
    }
    setEcritureIllisible(false);
    setSoumises({ avant, apres });
    onValider({ avant, apres });
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<TexteRiche5e texte={consigneGenerale(exercice)} />}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="question-finale">
        <TexteRiche5e texte={questionFinale(exercice)} />
      </p>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneEcranRiche(exercice, "tableauSigneBenefice")} />
      </p>

      {[
        { label: `B'(${exercice.pointTestAvant})=`, valeur: avant, modifier: setAvant, statut: statutAvant },
        { label: `B'(${exercice.pointTestApres})=`, valeur: apres, modifier: setApres, statut: statutApres },
      ].map((c) => (
        <div key={c.label} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={c.label} />
          </label>
          <input type="text" className={`text-input${c.statut && c.statut !== "correct" ? " is-erronee" : ""}`} value={c.valeur} onChange={(e) => c.modifier(e.target.value)} placeholder="valeur" disabled={Boolean(validation)} />
        </div>
      ))}

      <CalculatriceScientifique />
      <PiedEcranFonctions
        aides={aides}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={ecritureIllisible}
        texteIllisible={texteIllisible ?? "Écriture non reconnue : vérifie les nombres, les parenthèses et la place de la variable. Cette saisie ne compte pas comme une tentative."}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumises !== null && tentativesUtilisees > 0 && cible ? cible(soumises) : null}
        validation={validation}
      />
    </div>
  );
}
