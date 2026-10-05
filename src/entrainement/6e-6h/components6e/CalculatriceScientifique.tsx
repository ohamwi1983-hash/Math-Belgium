import { useEffect, useRef, useState } from "react";
import type { ModeAngle } from "./calculatriceScientifique";
import { evaluerExpressionCalculatrice, formatExpressionAffichage, formatNombreCalculatrice } from "./calculatriceScientifique";

interface Touche {
  libelle: string;
  token: string;
  classe?: string;
}

const LIGNES_TOUCHES: Touche[][] = [
  [
    { libelle: "sin", token: "sin(" },
    { libelle: "cos", token: "cos(" },
    { libelle: "tan", token: "tan(" },
    { libelle: "π", token: "pi" },
    { libelle: ",", token: "," },
  ],
  [
    { libelle: "asin", token: "asin(" },
    { libelle: "acos", token: "acos(" },
    { libelle: "atan", token: "atan(" },
    { libelle: "(", token: "(" },
    { libelle: ")", token: ")" },
  ],
  [
    { libelle: "ln", token: "ln(" },
    { libelle: "log", token: "log10(" },
    { libelle: "xʸ", token: "^" },
    { libelle: "√", token: "sqrt(" },
    { libelle: "ⁿ√", token: "nthRoot(" },
  ],
  [
    { libelle: "7", token: "7" },
    { libelle: "8", token: "8" },
    { libelle: "9", token: "9" },
    { libelle: "÷", token: "/" },
    { libelle: "C", token: "", classe: "calculatrice-touche-danger" },
  ],
  [
    { libelle: "4", token: "4" },
    { libelle: "5", token: "5" },
    { libelle: "6", token: "6" },
    { libelle: "×", token: "*" },
    { libelle: "⌫", token: "", classe: "calculatrice-touche-danger" },
  ],
  [
    { libelle: "1", token: "1" },
    { libelle: "2", token: "2" },
    { libelle: "3", token: "3" },
    { libelle: "−", token: "-" },
    { libelle: "%", token: "/100" },
  ],
  [
    { libelle: "0", token: "0" },
    { libelle: ".", token: "." },
    { libelle: "+", token: "+" },
    { libelle: "=", token: "", classe: "calculatrice-touche-primaire calculatrice-touche-large" },
  ],
];

interface Props {
  /** Mode angle à l'ouverture — `"RAD"` par défaut (contexte historique du chantier 6e :
   * exponentielles/logarithmes, jamais d'angle en degrés). Un écran dont la réponse ATTENDUE est en
   * degrés (ex. `6gen41` famille B écran 4, loi des cosinus) passe explicitement `"DEG"` — convention
   * transversale "DEG par défaut si applicable au contexte du chapitre" (checklist chapitre 7).
   * Lu UNE SEULE FOIS, à la création de CE composant (voir doc-comment plus bas) — pas à chaque
   * ouverture de la modale, qui ne réinitialise plus l'état. */
  modeInitial?: ModeAngle;
}

/**
 * Calculatrice scientifique flottante, montée avec au plus un prop optionnel sur n'importe quel
 * écran qui en a besoin (un seul `<CalculatriceScientifique />`, bouton + modale intégrés) —
 * réplique fidèlement `components5e/CalculatriceScientifique.tsx`, jamais importée entre chantiers
 * (voir CLAUDE.md, isolation entre chantiers) — voir `docs/historique-6e.md` pour l'inventaire des
 * écrans concernés et la justification du critère d'activation.
 *
 * L'état (expression, curseur, mode DEG/RAD, mémoire) vit ICI, dans le composant TOUJOURS monté
 * tant que l'écran est actif — PAS dans `CalculatriceModale`, qui se démonte/remonte à chaque
 * fermeture/ouverture (`{ouverte && <CalculatriceModale/>}`). Fermer la calculatrice (bouton `×` ou
 * clic hors du panneau) puis la rouvrir conserve donc le travail en cours (expression, mémoire M+/
 * M−, mode DEG/RAD), comme une vraie calculatrice physique qu'on éteint/rallume — bug signalé :
 * avant ce correctif, l'état vivait dans `CalculatriceModale` et repartait de zéro à CHAQUE
 * réouverture (y compris le mode, systématiquement forcé à revenir à `modeInitial`). Ne se
 * réinitialise que lorsque CE composant est lui-même démonté par son appelant (borne naturelle :
 * fin d'exercice).
 */
export function CalculatriceScientifique({ modeInitial = "RAD" }: Props = {}) {
  const [ouverte, setOuverte] = useState(false);
  const [expression, setExpression] = useState("");
  const [curseur, setCurseur] = useState(0);
  const [mode, setMode] = useState<ModeAngle>(modeInitial);
  const [memoire, setMemoire] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);

  return (
    <>
      <button type="button" className="calculatrice-bouton-flottant" onClick={() => setOuverte(true)}>
        Calculatrice
      </button>
      {ouverte && (
        <CalculatriceModale
          expression={expression}
          setExpression={setExpression}
          curseur={curseur}
          setCurseur={setCurseur}
          mode={mode}
          setMode={setMode}
          memoire={memoire}
          setMemoire={setMemoire}
          erreur={erreur}
          setErreur={setErreur}
          onFermer={() => setOuverte(false)}
        />
      )}
    </>
  );
}

interface PropsModale {
  expression: string;
  setExpression: (v: string) => void;
  curseur: number;
  setCurseur: (v: number) => void;
  mode: ModeAngle;
  setMode: (v: ModeAngle | ((m: ModeAngle) => ModeAngle)) => void;
  memoire: number;
  setMemoire: (v: number | ((m: number) => number)) => void;
  erreur: string | null;
  setErreur: (v: string | null) => void;
  onFermer: () => void;
}

function CalculatriceModale({ expression, setExpression, curseur, setCurseur, mode, setMode, memoire, setMemoire, erreur, setErreur, onFermer }: PropsModale) {
  const refExpression = useRef<HTMLInputElement>(null);

  // Garde le curseur NATIF de l'<input> synchronisé avec `curseur` après chaque insertion/
  // suppression programmatique (les boutons du pavé, jamais le clavier) — une simple mise à jour de
  // `value` ne repositionne pas le curseur du navigateur tout seul.
  useEffect(() => {
    refExpression.current?.setSelectionRange(curseur, curseur);
  }, [expression, curseur]);

  /** Synchronise `curseur` avec la position RÉELLE du curseur natif de l'`<input>` après un clic/une
   * navigation clavier (flèches, Origine/Fin) de l'ÉLÈVE — `readOnly` empêche toute frappe de
   * caractère mais laisse le déplacement du curseur totalement natif, gratuit, donc CE bug-ci
   * ("plus aucun moyen de corriger une faute de frappe ailleurs qu'à la toute fin") est réglé sans
   * code de positionnement fait main. */
  function synchroniserCurseurDepuisInput(e: { currentTarget: HTMLInputElement }) {
    setCurseur(e.currentTarget.selectionStart ?? expression.length);
  }

  /** Insère `token` À LA POSITION DU CURSEUR (jamais systématiquement en fin de chaîne) — c'est ce
   * qui permet à `insererRacineNieme` de placer le radicande ENTRE `nthRoot(` et `,indice)` plutôt
   * qu'à la fin, et plus généralement à l'élève de corriger une faute de frappe au milieu d'une
   * expression sans devoir tout effacer depuis la fin. */
  function inserer(token: string) {
    setErreur(null);
    const nouvelle = expression.slice(0, curseur) + token + expression.slice(curseur);
    setExpression(nouvelle);
    setCurseur(curseur + token.length);
  }

  function effacerTout() {
    setExpression("");
    setCurseur(0);
    setErreur(null);
  }

  function effacerDernierCaractere() {
    if (curseur === 0) return;
    const nouvelle = expression.slice(0, curseur - 1) + expression.slice(curseur);
    setExpression(nouvelle);
    setCurseur(curseur - 1);
    setErreur(null);
  }

  function calculer() {
    const resultat = evaluerExpressionCalculatrice(expression, mode);
    if (resultat.erreur) {
      setErreur(resultat.erreur);
      return;
    }
    if (resultat.valeur !== null) {
      const texte = formatNombreCalculatrice(resultat.valeur);
      setExpression(texte);
      setCurseur(texte.length);
      setErreur(null);
    }
  }

  /** M+/M- portent sur la valeur ACTUELLEMENT AFFICHÉE (expression évaluée à la volée), jamais
   * seulement sur le dernier résultat validé par "=" — comportement standard d'une calculatrice
   * scientifique physique. */
  function ajouterMemoire(signe: 1 | -1) {
    const resultat = evaluerExpressionCalculatrice(expression, mode);
    if (resultat.valeur === null) return;
    setMemoire((m) => m + signe * (resultat.valeur as number));
  }

  function rappelerMemoire() {
    inserer(formatNombreCalculatrice(memoire));
  }

  /**
   * Bug signalé ("bouton racine n-ième impossible à utiliser") — reproduit : un élève tape
   * naturellement l'INDICE avant d'appuyer sur ⁿ√ (convention physique/notation √[n]{x}, l'indice
   * s'écrit avant le radical — c'est ainsi que les calculatrices Casio/TI l'enseignent), ex. "3" puis
   * "ⁿ√" pour la racine cubique. Avec l'ancien bouton (simple `inserer("nthRoot(")`), ceci produisait
   * "3nthRoot(" = 3 CONCATÉNÉ à un nouvel appel de fonction, interprété par mathjs comme une
   * MULTIPLICATION IMPLICITE (3×nthRoot(8)=3×√8≈8,49 au lieu de la racine cubique de 8=2) — un
   * résultat FAUX rendu SANS AUCUNE erreur affichée, le pire des deux échecs.
   *
   * Correctif : si l'expression se termine (au curseur) par un nombre, on l'extrait comme INDICE et
   * on construit directement `nthRoot(,indice)` avec le curseur positionné entre `(` et `,` — les
   * chiffres tapés ensuite (le radicande) s'insèrent donc au bon endroit. Sans indice détecté
   * (expression vide, ou curseur juste après une parenthèse/un opérateur), repli sur l'usage
   * préfixe classique `nthRoot(` (radicande d'abord, indice tapé à la main après la virgule) —
   * fonctionne déjà (`nthRoot(8,3)` typé intégralement évalue correctement), jamais un cas cassé.
   */
  function insererRacineNieme() {
    setErreur(null);
    const avantCurseur = expression.slice(0, curseur);
    const apresCurseur = expression.slice(curseur);
    const indiceMatch = avantCurseur.match(/(\d+(?:\.\d+)?)$/);
    if (!indiceMatch) return inserer("nthRoot(");
    const indice = indiceMatch[1];
    const base = avantCurseur.slice(0, avantCurseur.length - indice.length);
    setExpression(`${base}nthRoot(,${indice})${apresCurseur}`);
    setCurseur(base.length + "nthRoot(".length);
  }

  function onTouche(touche: Touche) {
    if (touche.libelle === "C") return effacerTout();
    if (touche.libelle === "⌫") return effacerDernierCaractere();
    if (touche.libelle === "=") return calculer();
    if (touche.libelle === "ⁿ√") return insererRacineNieme();
    return inserer(touche.token);
  }

  return (
    <div className="calculatrice-overlay" onClick={onFermer}>
      <div className="calculatrice-panneau" onClick={(e) => e.stopPropagation()}>
        <div className="calculatrice-entete">
          <div className="calculatrice-memoire-boutons">
            <button type="button" className="calculatrice-touche" onClick={() => setMemoire(0)}>
              MC
            </button>
            <button type="button" className="calculatrice-touche" onClick={rappelerMemoire}>
              MR
            </button>
            <button type="button" className="calculatrice-touche" onClick={() => ajouterMemoire(1)}>
              M+
            </button>
            <button type="button" className="calculatrice-touche" onClick={() => ajouterMemoire(-1)}>
              M−
            </button>
          </div>
          <button
            type="button"
            className={`calculatrice-toggle-mode ${mode === "DEG" ? "calculatrice-toggle-mode-actif" : ""}`}
            onClick={() => setMode((m) => (m === "DEG" ? "RAD" : "DEG"))}
          >
            {mode}
          </button>
          <button type="button" className="calculatrice-fermer" onClick={onFermer} aria-label="Fermer la calculatrice">
            ×
          </button>
        </div>

        <div className="calculatrice-affichage">
          <input
            ref={refExpression}
            type="text"
            inputMode="none"
            readOnly
            className="calculatrice-expression"
            value={formatExpressionAffichage(expression)}
            placeholder="0"
            aria-label="Expression en cours"
            onClick={synchroniserCurseurDepuisInput}
            onKeyUp={synchroniserCurseurDepuisInput}
            onSelect={synchroniserCurseurDepuisInput}
          />
          {erreur && <div className="calculatrice-erreur">{erreur}</div>}
        </div>

        <div className="calculatrice-pave">
          {LIGNES_TOUCHES.map((ligne, indexLigne) => (
            <div className="calculatrice-ligne" key={indexLigne}>
              {ligne.map((touche) => (
                <button
                  type="button"
                  key={touche.libelle}
                  className={`calculatrice-touche ${touche.classe ?? ""}`}
                  onClick={() => onTouche(touche)}
                >
                  {touche.libelle}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
