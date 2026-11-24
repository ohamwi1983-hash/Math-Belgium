import { useEffect, useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceContexteEconomique } from "../core5e/contexteEconomique.types";
import type { EcranContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { consigneEcranRiche, consigneGenerale, formatTermesDonneesLatex, questionFinale } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import { TexteRiche5e } from "./TexteRiche5e";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceContexteEconomique;
  ecran: EcranContexteEconomique;
  labels: string[];
  placeholders: string[];
  /** Ajoutée à la fin de la consigne d'écran si non nulle — voir CLAUDE.md, "Annonce de
   * précision = tolérance réellement vérifiée". Un seul texte pour TOUS les champs de l'écran
   * (jamais 2 champs avec 2 précisions différentes dans ce générateur). */
  precisionAnnoncee: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: string[]) => void;
  /** Diagnostic PAR CHAMP, dans le même ordre que `labels`. */
  diagnostiquer: (reponses: string[]) => StatutVerification[];
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (lot B). */
  cible?: (valeurs: string[]) => FragmentConsigne[] | null;
  /** Aides à deux niveaux (niveau 2 posé pour l'instance). */
  aides: AideTrig[];
  /** Message d'illisible par nature de champ (déjà terminé par « … ne compte pas comme une tentative. »). */
  texteIllisible?: string;
}

/** Écran générique "N champs NUMÉRIQUES" — réutilisé par tous les écrans à réponse chiffrée de
 * 5gen33 (coût marginal discret, valeur de C'_T(q0), écart absolu+%, bénéfice maximum, racine
 * approchée du bonus). Même patron que `EtapeChampsNumeriquesEtudeLocale.tsx` (5gen29). */
export function EtapeChampsNumeriquesCE({
  exercice,
  ecran,
  labels,
  placeholders,
  precisionAnnoncee,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  validation, cible, aides, texteIllisible }: Props) {
  const nb = labels.length;
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(nb).fill(""));
  useEffect(() => {
    setValeurs(new Array(nb).fill(""));
  }, [nb]);
  /** Saisie illisible (parse_error) : signalée sans consommer de tentative (audit 5e ch. 5). */
  const [soumises, setSoumises] = useState<string[] | null>(null);
  const [ecritureIllisible, setEcritureIllisible] = useState(false);
  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && complet ? diagnostiquer(valeurs) : null;

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    const s = diagnostiquer(valeurs);
    if (s.some((x) => x === "parse_error")) {
      setEcritureIllisible(true);
      return;
    }
    setEcritureIllisible(false);
    setSoumises(valeurs);
    onValider(valeurs);
  }

  const consigne = precisionAnnoncee ? `${consigneEcranRiche(exercice, ecran)} ${precisionAnnoncee}` : consigneEcranRiche(exercice, ecran);

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
        <TexteRiche5e texte={consigne} />
      </p>
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={label} />
          </label>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={placeholders[i] ?? ""}
          />
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
