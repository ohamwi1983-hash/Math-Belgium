/**
 * Banque RÉDIGÉE (relue) de `5gen80` « Corrélation ou causalité ? » — 45 situations, 9 par type
 * d'explication. Aucun nombre tiré au hasard : chaque texte est fixe (mini-syntaxe : formules entre
 * « $ »). Pour chaque situation : le texte (deux grandeurs fortement corrélées et une conclusion
 * hâtive), la bonne explication précise et trois leurres (troisième variable qui n'explique pas les
 * deux grandeurs, mécanisme inventé, sens inversé, hasard…). Sources des corrélations réelles citées :
 * exemples du document du professeur (lapins et Dow Jones, pointure et orthographe, crèmes glacées,
 * bière et mortalité infantile, publicité décalée d'un an, alcoolémie) ; chocolat et prix Nobel
 * (F. Messerli, New England Journal of Medicine, 2012, r ≈ 0,79) ; « corrélations fallacieuses » de
 * T. Vigen (films de Nicolas Cage et noyades en piscine 1999–2009, r ≈ 0,67 ; mozzarella et doctorats
 * en génie civil 2000–2009, r ≈ 0,96 ; divorces dans le Maine et margarine 2000–2009, r ≈ 0,99) ; les
 * autres situations sont des cas d'école, sans valeur réelle prétendue (« dans une étude », « dans
 * une commune »).
 */

export type TypeExplication = "causeCommune" | "coincidence" | "causaliteInverse" | "effetDecale" | "causalitePlausible";

export interface SituationCorrelation {
  texte: string;
  conclusion: string;
  bonne: string;
  leurres: [string, string, string];
  /** Explication du corrigé (une ou deux phrases). */
  corrige: string;
}

export const BANQUE_CORRELATION: Record<TypeExplication, SituationCorrelation[]> = {
  causeCommune: [
    {
      texte: "Dans une station balnéaire, on relève chaque jour d'été les ventes de crèmes glacées et celles de crème solaire : $r\\approx 0{,}92$.",
      conclusion: "Manger des glaces donne envie de se protéger du soleil.",
      bonne: "Le temps qu'il fait : par temps chaud et ensoleillé, on achète à la fois plus de glaces et plus de crème solaire.",
      leurres: ["Le prix des glaces : moins elles coûtent, plus on achète de crème solaire.", "La crème solaire donne soif, donc elle fait acheter des glaces.", "Le nombre de vendeurs de glaces sur la plage : il ne joue que sur les ventes de glaces."],
      corrige: "Les deux ventes dépendent d'une troisième grandeur, la température (et l'ensoleillement) : aucune des deux n'agit sur l'autre.",
    },
    {
      texte: "Dans une école primaire, on relève pour chaque élève sa pointure et le nombre de fautes à une même dictée : $r\\approx -0{,}81$.",
      conclusion: "Avoir de grands pieds aide à bien écrire.",
      bonne: "L'âge des élèves : les plus âgés ont de plus grands pieds et ont appris davantage l'orthographe.",
      leurres: ["La marque des chaussures : certaines aident à se concentrer.", "Écrire sans fautes fait grandir les pieds.", "Le nombre d'élèves de la classe : il ne change ni la pointure ni l'orthographe d'un élève."],
      corrige: "L'âge fait grandir les pieds et progresser l'orthographe : c'est une cause commune, la pointure n'agit pas sur l'orthographe.",
    },
    {
      texte: "Dans les années 1950, on a observé une très forte corrélation entre la consommation de bière sur la côte ouest des États-Unis et la mortalité infantile au Japon.",
      conclusion: "La bière bue par les Américains tue des enfants japonais.",
      bonne: "Une forte vague de chaleur sur tout le Pacifique : elle a fait boire davantage les Américains et causé de graves problèmes sanitaires au Japon.",
      leurres: ["Le prix de la bière au Japon : il a fait baisser la mortalité.", "Les exportations de bière américaine vers le Japon.", "Le nombre de naissances aux États-Unis."],
      corrige: "La vague de chaleur agit sur les deux grandeurs, qui ne sont pas la conséquence l'une de l'autre (exemple du cours).",
    },
    {
      texte: "Une étude de 2012 a montré que les pays où l'on mange le plus de chocolat par habitant sont aussi ceux qui ont le plus de prix Nobel par habitant : $r\\approx 0{,}79$.",
      conclusion: "Le chocolat rend génial.",
      bonne: "La richesse du pays : les pays riches consomment plus de chocolat et financent davantage la recherche et les universités.",
      leurres: ["Le nombre de chocolatiers qui ont reçu un prix Nobel.", "Les chercheurs récompensés achètent ensuite plus de chocolat.", "La surface du pays : plus un pays est grand, plus il a de prix Nobel par habitant."],
      corrige: "La richesse explique les deux grandeurs : aucune expérience n'a montré que manger du chocolat fait gagner un prix Nobel.",
    },
    {
      texte: "Sur une année, on compare chaque mois le nombre de noyades en mer et le nombre de glaces vendues sur la côte : $r\\approx 0{,}88$.",
      conclusion: "Manger une glace avant de nager est dangereux.",
      bonne: "La saison chaude : en été, on se baigne beaucoup plus souvent et on mange plus de glaces.",
      leurres: ["Le prix des glaces : il augmente en été.", "Les noyades font peur et poussent à se consoler avec une glace.", "Le nombre de jours fériés du mois."],
      corrige: "La chaleur de l'été fait augmenter à la fois les baignades (donc les noyades) et les ventes de glaces.",
    },
    {
      texte: "Lors des incendies d'une région, on relève le nombre de pompiers envoyés et le montant des dégâts : $r\\approx 0{,}85$.",
      conclusion: "Plus on envoie de pompiers, plus ils causent de dégâts.",
      bonne: "La taille de l'incendie : un grand incendie fait beaucoup de dégâts et demande beaucoup de pompiers.",
      leurres: ["L'eau des lances abîme les bâtiments.", "La distance entre l'incendie et la caserne.", "L'heure à laquelle les pompiers ont été appelés."],
      corrige: "La gravité de l'incendie explique à la fois le nombre de pompiers et l'importance des dégâts.",
    },
    {
      texte: "Dans les villages d'une région, le nombre de couples de cigognes et le nombre de naissances par an sont corrélés : $r\\approx 0{,}7$.",
      conclusion: "Ce sont bien les cigognes qui apportent les bébés.",
      bonne: "La taille du village : un grand village a plus de toits où nicher et plus d'habitants, donc plus de naissances.",
      leurres: ["Les cigognes rendent les habitants plus heureux.", "Le nombre de naissances attire les cigognes.", "La couleur des toits du village."],
      corrige: "Le nombre d'habitants (et de maisons) fait varier les deux grandeurs : c'est une cause commune.",
    },
    {
      texte: "Dans les communes d'une province, le nombre de pharmacies et le nombre de cas de grippe déclarés chaque hiver sont corrélés : $r\\approx 0{,}95$.",
      conclusion: "Les pharmacies propagent la grippe.",
      bonne: "Le nombre d'habitants de la commune : une grande commune a plus de pharmacies et plus de malades.",
      leurres: ["Les heures d'ouverture des pharmacies.", "Les malades de la grippe ouvrent des pharmacies.", "Le prix des médicaments contre la grippe."],
      corrige: "La population de la commune explique les deux : il faudrait comparer des nombres de cas par habitant.",
    },
    {
      texte: "En été, on compare chaque semaine les ventes de lunettes de soleil et le nombre de coups de soleil soignés en pharmacie : $r\\approx 0{,}9$.",
      conclusion: "Les lunettes de soleil provoquent des coups de soleil.",
      bonne: "L'ensoleillement : les semaines très ensoleillées, on achète plus de lunettes et on attrape plus de coups de soleil.",
      leurres: ["Le prix des lunettes de soleil.", "Les coups de soleil font mal aux yeux et font acheter des lunettes.", "Le nombre d'opticiens de la ville."],
      corrige: "Le soleil fait varier les deux grandeurs : c'est une cause commune (exemple du document).",
    },
  ],
  coincidence: [
    {
      texte: "Sur une décennie, le nombre de lapins en Australie a été fortement corrélé à l'indice Dow Jones de la Bourse de New York : $r\\approx 0{,}9$.",
      conclusion: "Pour prévoir la Bourse, il suffit de compter les lapins australiens.",
      bonne: "Aucun lien : les deux grandeurs ont augmenté pendant la même période, chacune pour ses propres raisons.",
      leurres: ["Le climat australien fait monter la Bourse de New York.", "Les gains en Bourse sont dépensés en élevages de lapins.", "La population de lapins agit sur l'économie mondiale."],
      corrige: "Deux grandeurs qui évoluent chacune de leur côté pendant la même période peuvent sembler liées : c'est une coïncidence (exemple du document).",
    },
    {
      texte: "De 1999 à 2009, le nombre de films sortis chaque année avec l'acteur Nicolas Cage et le nombre de noyades dans des piscines aux États-Unis ont été corrélés : $r\\approx 0{,}67$.",
      conclusion: "Les films de Nicolas Cage poussent à se baigner imprudemment.",
      bonne: "Aucun lien : sur onze années seulement, deux séries de nombres qui n'ont rien à voir peuvent varier ensemble par hasard.",
      leurres: ["Les noyades inspirent les scénarios des films.", "L'été, on sort plus de films et on se baigne plus.", "Les acteurs de cinéma possèdent beaucoup de piscines."],
      corrige: "Il n'existe aucun mécanisme entre ces deux grandeurs : avec peu de données, une corrélation peut apparaître par pur hasard.",
    },
    {
      texte: "De 2000 à 2009, la consommation de mozzarella par habitant aux États-Unis et le nombre de doctorats en génie civil délivrés chaque année ont été corrélés : $r\\approx 0{,}96$.",
      conclusion: "Manger de la mozzarella pousse à devenir ingénieur.",
      bonne: "Aucun lien : les deux grandeurs ont augmenté pendant ces dix ans, chacune pour ses propres raisons.",
      leurres: ["Les ingénieurs diplômés mangent beaucoup de pizzas.", "Le prix du fromage finance les universités.", "La mozzarella améliore la mémoire."],
      corrige: "Deux tendances qui montent pendant la même décennie donnent un r proche de 1 sans aucun lien de cause à effet.",
    },
    {
      texte: "De 2000 à 2009, le taux de divorce dans l'État du Maine (États-Unis) et la consommation de margarine par habitant ont été corrélés : $r\\approx 0{,}99$.",
      conclusion: "Arrêter la margarine sauverait des mariages.",
      bonne: "Aucun lien : les deux grandeurs ont baissé pendant la même période, chacune pour ses propres raisons.",
      leurres: ["Les couples divorcés cuisinent moins.", "La margarine rend les gens plus irritables.", "Le prix du beurre fait varier le nombre de mariages."],
      corrige: "Même un r très proche de 1 ne prouve rien : deux grandeurs qui baissent en même temps peuvent n'avoir aucun lien.",
    },
    {
      texte: "Depuis 1800, le nombre de pirates en mer a fortement diminué pendant que la température moyenne de la Terre augmentait : $r\\approx -0{,}9$.",
      conclusion: "Les pirates protégeaient la planète du réchauffement.",
      bonne: "Aucun lien : la piraterie a reculé et le climat s'est réchauffé pendant la même période, pour des raisons sans rapport.",
      leurres: ["Le réchauffement a fait fuir les pirates.", "Les pirates brûlaient moins de charbon que les navires actuels.", "Le nombre de bateaux en mer explique les deux."],
      corrige: "Les deux grandeurs évoluent avec le temps, chacune pour ses propres raisons : la corrélation est une coïncidence.",
    },
    {
      texte: "Pendant un an, on mesure chaque mois la longueur des cheveux d'une élève et la hauteur d'un jeune arbre de la cour : $r\\approx 0{,}97$.",
      conclusion: "C'est l'arbre qui fait pousser les cheveux de l'élève.",
      bonne: "Aucun lien : les cheveux et l'arbre poussent chacun de leur côté au fil des mois.",
      leurres: ["Les cheveux de l'élève servent d'engrais à l'arbre.", "L'ombre de l'arbre fait pousser les cheveux.", "L'élève arrose l'arbre plus souvent quand ses cheveux sont longs."],
      corrige: "Deux grandeurs qui augmentent toutes les deux avec le temps sont corrélées sans être liées : coïncidence.",
    },
    {
      texte: "Sur huit années, on compare le nombre de lettres du nom du groupe vainqueur d'un concours de chanson et la température moyenne de l'été suivant en Belgique : $r\\approx 0{,}8$.",
      conclusion: "Le nom du vainqueur permet de prévoir la météo.",
      bonne: "Aucun lien : avec seulement huit valeurs, un r élevé peut apparaître par hasard.",
      leurres: ["Les chanteurs choisissent leur nom selon la météo.", "La chaleur de l'été inspire les chansons gagnantes.", "Le nombre de spectateurs du concours explique les deux."],
      corrige: "Aucun mécanisme ne relie ces grandeurs ; sur si peu de données, la corrélation est une coïncidence.",
    },
    {
      texte: "Sur dix saisons, le nombre de buts marqués par le club de football d'une ville et le nombre de chats adoptés au refuge de cette ville sont corrélés : $r\\approx 0{,}72$.",
      conclusion: "Adopter un chat porte chance à l'équipe.",
      bonne: "Aucun lien : ces deux nombres ont varié ensemble par hasard sur ces dix saisons.",
      leurres: ["Les joueurs du club adoptent des chats après leurs victoires.", "Les chats du refuge regardent les matchs.", "Le prix des billets du stade."],
      corrige: "Il n'y a pas de lien de cause à effet : sur dix valeurs, une corrélation peut naître du hasard.",
    },
    {
      texte: "Mois après mois, le nombre d'abonnés d'un youtubeur et le nombre de voitures électriques immatriculées en Belgique augmentent tous les deux : $r\\approx 0{,}94$.",
      conclusion: "Les vidéos de ce youtubeur font vendre des voitures électriques.",
      bonne: "Aucun lien : les deux grandeurs augmentent avec le temps, chacune pour ses propres raisons.",
      leurres: ["Les acheteurs de voitures électriques s'abonnent tous à cette chaîne.", "Le youtubeur parle uniquement de voitures.", "Le prix de l'essence fait gagner des abonnés au youtubeur."],
      corrige: "Deux tendances qui montent en même temps donnent une forte corrélation sans aucun lien : coïncidence.",
    },
  ],
  causaliteInverse: [
    {
      texte: "Dans un groupe d'adultes, la prise de médicaments contre l'hypertension et la tension artérielle sont corrélées : $r\\approx 0{,}6$.",
      conclusion: "Ces médicaments font monter la tension.",
      bonne: "C'est l'inverse : ce sont les personnes qui ont une tension élevée qui prennent ces médicaments.",
      leurres: ["Le prix des médicaments fait varier les deux.", "Les médicaments sont trop dosés.", "Aucun lien : c'est une coïncidence."],
      corrige: "Le sens de la causalité est inversé : une tension élevée est la raison pour laquelle on prend le médicament.",
    },
    {
      texte: "Dans un parc éolien, on relève à chaque instant la vitesse de rotation des éoliennes et la vitesse du vent : $r\\approx 0{,}95$.",
      conclusion: "Ce sont les éoliennes qui font souffler le vent.",
      bonne: "C'est l'inverse : c'est le vent qui fait tourner les éoliennes.",
      leurres: ["L'heure de la journée fait varier les deux.", "Les éoliennes poussent l'air devant elles.", "Aucun lien : c'est une coïncidence."],
      corrige: "La cause est la vitesse du vent ; la rotation des éoliennes en est la conséquence.",
    },
    {
      texte: "Dans les quartiers d'une grande ville, le nombre de policiers en patrouille et le nombre de délits signalés sont corrélés : $r\\approx 0{,}8$.",
      conclusion: "Les policiers attirent la délinquance.",
      bonne: "C'est l'inverse : la police envoie plus de patrouilles dans les quartiers où il y a le plus de délits.",
      leurres: ["L'éclairage public fait varier les deux.", "Les policiers inventent des délits.", "Aucun lien : c'est une coïncidence."],
      corrige: "Le nombre de délits détermine le nombre de patrouilles envoyées : la causalité va dans l'autre sens.",
    },
    {
      texte: "Dans une ville, les jours où l'on compte le plus de parapluies ouverts dans la rue sont aussi les plus pluvieux : $r\\approx 0{,}9$.",
      conclusion: "Ouvrir son parapluie fait pleuvoir.",
      bonne: "C'est l'inverse : c'est la pluie qui pousse les passants à ouvrir leur parapluie.",
      leurres: ["Le vent fait ouvrir les parapluies et tomber la pluie.", "Les parapluies empêchent l'eau de s'évaporer.", "Aucun lien : c'est une coïncidence."],
      corrige: "La pluie est la cause, l'ouverture des parapluies la conséquence.",
    },
    {
      texte: "Dans un magasin de bricolage, on compare chaque semaine les ventes de radiateurs d'appoint et la température extérieure : $r\\approx -0{,}85$.",
      conclusion: "Vendre des radiateurs fait baisser la température dehors.",
      bonne: "C'est l'inverse : c'est le froid qui pousse les clients à acheter des radiateurs.",
      leurres: ["Le prix de l'électricité fait varier les deux.", "Les radiateurs refroidissent l'air extérieur.", "Aucun lien : c'est une coïncidence."],
      corrige: "La température basse est la cause des achats de radiateurs, et non l'inverse.",
    },
    {
      texte: "Dans les bureaux d'une entreprise, plus il y a de ventilateurs allumés, plus il fait chaud dans la pièce : $r\\approx 0{,}8$.",
      conclusion: "Les ventilateurs réchauffent les bureaux.",
      bonne: "C'est l'inverse : c'est la chaleur qui pousse les employés à allumer les ventilateurs.",
      leurres: ["Le nombre d'employés fait varier les deux.", "Le moteur des ventilateurs chauffe toute la pièce.", "Aucun lien : c'est une coïncidence."],
      corrige: "La chaleur est la cause, l'allumage des ventilateurs la conséquence.",
    },
    {
      texte: "Dans une chaîne de restaurants, plus un restaurant emploie de serveurs, plus il sert de repas par jour : $r\\approx 0{,}9$.",
      conclusion: "Engager des serveurs suffit à attirer des clients.",
      bonne: "C'est l'inverse : un restaurant qui a beaucoup de clients engage plus de serveurs pour les servir.",
      leurres: ["Le prix des repas fait varier les deux.", "Les serveurs invitent leurs amis à manger.", "Aucun lien : c'est une coïncidence."],
      corrige: "Le nombre de clients détermine le nombre de serveurs nécessaires : la causalité est inversée.",
    },
    {
      texte: "Dans une station de ski, on compare chaque jour le nombre de pistes ouvertes et l'épaisseur de neige : $r\\approx 0{,}9$.",
      conclusion: "Ouvrir des pistes fait tomber la neige.",
      bonne: "C'est l'inverse : la station ouvre plus de pistes quand il y a beaucoup de neige.",
      leurres: ["Le nombre de skieurs fait varier les deux.", "Les skieurs tassent la neige, ce qui la fait monter.", "Aucun lien : c'est une coïncidence."],
      corrige: "L'enneigement est la cause, l'ouverture des pistes la conséquence.",
    },
    {
      texte: "Dans un supermarché, on compare heure par heure le nombre de caisses ouvertes et le nombre de clients dans le magasin : $r\\approx 0{,}93$.",
      conclusion: "Ouvrir des caisses fait venir des clients.",
      bonne: "C'est l'inverse : le magasin ouvre des caisses quand il y a beaucoup de clients.",
      leurres: ["Les promotions font varier les deux.", "Les caissières appellent leurs proches.", "Aucun lien : c'est une coïncidence."],
      corrige: "L'affluence des clients est la cause de l'ouverture des caisses.",
    },
  ],
  effetDecale: [
    {
      texte: "Une entreprise compare, sur huit ans, son budget de publicité et son bénéfice de la même année : $r\\approx 0{,}1$. En comparant le budget d'une année au bénéfice de l'année suivante, on trouve $r\\approx 0{,}9$.",
      conclusion: "Au vu du premier calcul : la publicité ne sert à rien.",
      bonne: "La publicité agit avec du retard : son effet sur le bénéfice se voit surtout l'année suivante.",
      leurres: ["La taille de l'entreprise fait varier les deux.", "Le bénéfice d'une année permet de payer la publicité de la même année.", "Aucun lien : la seconde valeur de r est une coïncidence."],
      corrige: "L'effet est décalé dans le temps : il faut comparer chaque budget au bénéfice de l'année suivante (exercice 20 du document).",
    },
    {
      texte: "On compare chaque mois la quantité de pluie tombée et le niveau d'une nappe d'eau souterraine du même mois : $r\\approx 0{,}2$. Avec le niveau de la nappe deux mois plus tard, $r\\approx 0{,}85$.",
      conclusion: "Au vu du premier calcul : la pluie ne recharge pas la nappe.",
      bonne: "L'eau de pluie met du temps à s'infiltrer dans le sol : la nappe monte quelques mois plus tard.",
      leurres: ["La température fait varier les deux.", "C'est la nappe qui fait tomber la pluie.", "Aucun lien : la seconde valeur de r est une coïncidence."],
      corrige: "La pluie agit sur la nappe avec un retard d'environ deux mois : l'effet est décalé dans le temps.",
    },
    {
      texte: "Un arboriculteur compare, année par année, le nombre de pommiers qu'il plante et sa récolte de pommes de la même année : $r\\approx 0{,}05$. Avec la récolte quatre ans plus tard, $r\\approx 0{,}9$.",
      conclusion: "Au vu du premier calcul : planter des pommiers n'augmente pas la récolte.",
      bonne: "Un jeune pommier ne donne des fruits que quelques années après avoir été planté.",
      leurres: ["Le prix des pommes fait varier les deux.", "Une bonne récolte permet d'acheter de nouveaux arbres.", "Aucun lien : la seconde valeur de r est une coïncidence."],
      corrige: "L'effet de la plantation ne se voit qu'au bout de quelques années : il faut décaler les données.",
    },
    {
      texte: "Dans un pays, on compare chaque année le prix du blé et la surface semée en blé la même année : $r\\approx 0{,}1$. Avec la surface semée l'année suivante, $r\\approx 0{,}8$.",
      conclusion: "Au vu du premier calcul : le prix du blé n'influence pas les agriculteurs.",
      bonne: "Les agriculteurs décident de leurs semis d'après le prix de l'année précédente : l'effet se voit l'année suivante.",
      leurres: ["La météo fait varier les deux.", "La surface semée fixe le prix du blé de la même année.", "Aucun lien : la seconde valeur de r est une coïncidence."],
      corrige: "Le prix agit sur les semis avec un an de retard : effet décalé dans le temps.",
    },
    {
      texte: "Dans une commune, on compare chaque année le nombre de naissances et le nombre d'inscriptions en première primaire de la même année : $r\\approx 0{,}2$. Avec les inscriptions six ans plus tard, $r\\approx 0{,}95$.",
      conclusion: "Au vu du premier calcul : les naissances n'ont rien à voir avec les inscriptions en primaire.",
      bonne: "Un enfant entre en première primaire environ six ans après sa naissance.",
      leurres: ["La taille de la commune fait varier les deux.", "Les inscriptions en primaire font augmenter les naissances.", "Aucun lien : la seconde valeur de r est une coïncidence."],
      corrige: "Les naissances agissent sur les inscriptions avec six ans de retard : il faut décaler les données.",
    },
    {
      texte: "On compare chaque année le nombre d'étudiants qui commencent des études de médecine et le nombre de nouveaux médecins diplômés la même année : $r\\approx 0{,}15$. Avec les diplômés six ans plus tard, $r\\approx 0{,}9$.",
      conclusion: "Au vu du premier calcul : former plus d'étudiants ne donne pas plus de médecins.",
      bonne: "Les études de médecine durent plusieurs années : l'effet sur le nombre de diplômés se voit environ six ans plus tard.",
      leurres: ["Le nombre d'hôpitaux fait varier les deux.", "Les nouveaux médecins deviennent professeurs et attirent des étudiants.", "Aucun lien : la seconde valeur de r est une coïncidence."],
      corrige: "L'effet des inscriptions est décalé de la durée des études.",
    },
    {
      texte: "Une entreprise compare chaque année ses dépenses de recherche et le nombre de brevets qu'elle dépose la même année : $r\\approx 0{,}1$. Avec les brevets déposés trois ans plus tard, $r\\approx 0{,}85$.",
      conclusion: "Au vu du premier calcul : la recherche ne rapporte rien.",
      bonne: "Une recherche prend plusieurs années avant d'aboutir à une invention que l'on peut breveter.",
      leurres: ["Le nombre d'employés fait varier les deux.", "Les brevets financent la recherche de la même année.", "Aucun lien : la seconde valeur de r est une coïncidence."],
      corrige: "L'effet des dépenses de recherche se voit avec plusieurs années de retard.",
    },
    {
      texte: "Un coureur compare chaque mois ses heures d'entraînement et son temps au 10 km le même mois : $r\\approx -0{,}2$. Avec son temps au 10 km le mois suivant, $r\\approx -0{,}85$.",
      conclusion: "Au vu du premier calcul : l'entraînement ne l'aide pas à courir plus vite.",
      bonne: "Le corps a besoin de temps pour progresser : l'effet de l'entraînement se voit le mois suivant.",
      leurres: ["La météo fait varier les deux.", "Un bon temps au 10 km lui donne envie de s'entraîner le même mois.", "Aucun lien : la seconde valeur de r est une coïncidence."],
      corrige: "L'entraînement agit avec un mois de retard : il faut décaler les données.",
    },
    {
      texte: "Dans une commune, on compare chaque année le nombre de maisons isolées et la consommation de gaz de chauffage de la même année : $r\\approx -0{,}1$. Avec la consommation de l'année suivante, $r\\approx -0{,}85$.",
      conclusion: "Au vu du premier calcul : isoler les maisons ne fait pas baisser la consommation de gaz.",
      bonne: "Les travaux d'isolation se font en cours d'année : les économies se voient surtout pendant l'hiver suivant.",
      leurres: ["Le prix du gaz fait varier les deux.", "Une faible consommation de gaz pousse à isoler les maisons.", "Aucun lien : la seconde valeur de r est une coïncidence."],
      corrige: "L'effet de l'isolation est décalé d'un an : il faut comparer chaque année à la consommation de l'année suivante.",
    },
  ],
  causalitePlausible: [
    {
      texte: "Dans une étude sur des conducteurs, le taux d'alcool dans le sang et le risque d'avoir un accident sont fortement corrélés : $r\\approx 0{,}9$.",
      conclusion: "L'alcool augmente le risque d'accident.",
      bonne: "Un mécanisme connu l'explique : l'alcool ralentit les réflexes et trouble la vue ; des expériences en simulateur l'ont confirmé.",
      leurres: ["L'âge des conducteurs fait varier les deux.", "Avoir un accident pousse à boire.", "Aucun lien : c'est une coïncidence."],
      corrige: "Ici la corrélation traduit une vraie causalité : un mécanisme connu, confirmé par des expériences (exemple du document).",
    },
    {
      texte: "De nombreuses études relient le nombre de cigarettes fumées par jour et le risque de cancer du poumon : $r\\approx 0{,}9$.",
      conclusion: "Fumer augmente le risque de cancer du poumon.",
      bonne: "Un mécanisme connu l'explique : la fumée contient des substances cancérigènes qui abîment les cellules des poumons.",
      leurres: ["Le stress fait fumer et provoque le cancer, sans lien entre les deux.", "Le cancer donne envie de fumer.", "Aucun lien : c'est une coïncidence."],
      corrige: "La causalité est établie : mécanisme biologique connu et confirmé par de nombreuses études.",
    },
    {
      texte: "En laboratoire, on chauffe une barre métallique et on relève sa longueur à différentes températures : $r\\approx 0{,}99$.",
      conclusion: "Chauffer la barre l'allonge.",
      bonne: "Un mécanisme connu l'explique : la chaleur fait s'écarter les atomes du métal, qui se dilate.",
      leurres: ["L'heure de la mesure fait varier les deux.", "C'est l'allongement de la barre qui la réchauffe.", "Aucun lien : c'est une coïncidence."],
      corrige: "C'est la dilatation : la température est bien la cause de l'allongement (expérience contrôlée).",
    },
    {
      texte: "Sur une piste d'essai, on mesure la distance de freinage d'une voiture lancée à différentes vitesses : $r\\approx 0{,}97$.",
      conclusion: "Rouler plus vite allonge la distance de freinage.",
      bonne: "Un mécanisme connu l'explique : plus la voiture va vite, plus elle a d'énergie à dissiper pour s'arrêter.",
      leurres: ["L'état des pneus fait varier les deux.", "Une longue distance de freinage fait accélérer la voiture.", "Aucun lien : c'est une coïncidence."],
      corrige: "La vitesse est bien la cause : c'est une expérience contrôlée et le mécanisme physique est connu.",
    },
    {
      texte: "Sur des parcelles de blé choisies au hasard, un agronome répand différentes doses d'engrais et mesure le rendement : $r\\approx 0{,}9$.",
      conclusion: "L'engrais augmente le rendement du blé.",
      bonne: "C'est une expérience contrôlée (doses attribuées au hasard) et l'engrais apporte aux plantes les éléments dont elles ont besoin.",
      leurres: ["La qualité du sol fait varier les deux.", "Un bon rendement attire l'engrais.", "Aucun lien : c'est une coïncidence."],
      corrige: "Les doses étant attribuées au hasard, aucune troisième variable ne peut expliquer la corrélation : causalité.",
    },
    {
      texte: "En montagne, on relève au même moment la température à différentes altitudes : $r\\approx -0{,}98$.",
      conclusion: "Plus on monte, plus il fait froid.",
      bonne: "Un mécanisme connu l'explique : en altitude, l'air est moins dense et se refroidit en se détendant.",
      leurres: ["L'heure de la journée fait varier les deux.", "Le froid fait monter les montagnes.", "Aucun lien : c'est une coïncidence."],
      corrige: "L'altitude est bien la cause de la baisse de température : phénomène physique connu.",
    },
    {
      texte: "On compare jour après jour la quantité de pluie tombée sur un bassin et le niveau de la rivière qui le traverse : $r\\approx 0{,}9$.",
      conclusion: "Les fortes pluies font monter la rivière.",
      bonne: "Un mécanisme connu l'explique : l'eau de pluie ruisselle vers la rivière et augmente son débit.",
      leurres: ["La température fait varier les deux.", "C'est la rivière qui fait pleuvoir.", "Aucun lien : c'est une coïncidence."],
      corrige: "La pluie est bien la cause de la montée de la rivière : mécanisme connu.",
    },
    {
      texte: "Pour une installation de panneaux solaires, on relève chaque jour la durée d'ensoleillement et l'électricité produite : $r\\approx 0{,}96$.",
      conclusion: "Plus il y a de soleil, plus les panneaux produisent d'électricité.",
      bonne: "Un mécanisme connu l'explique : les panneaux transforment la lumière du soleil en électricité.",
      leurres: ["La saison fait varier les deux, sans aucun lien entre eux.", "L'électricité produite fait briller le soleil.", "Aucun lien : c'est une coïncidence."],
      corrige: "L'ensoleillement est bien la cause de la production : c'est le principe même du panneau solaire.",
    },
    {
      texte: "Pour des voitures neuves d'un même type, la puissance du moteur et la consommation d'essence sont corrélées : $r\\approx 0{,}99$.",
      conclusion: "Un moteur plus puissant consomme plus d'essence.",
      bonne: "Un mécanisme connu l'explique : un moteur plus puissant brûle plus de carburant pour fournir plus d'énergie.",
      leurres: ["La couleur de la voiture fait varier les deux.", "Consommer beaucoup rend le moteur plus puissant.", "Aucun lien : c'est une coïncidence."],
      corrige: "La puissance agit bien sur la consommation : mécanisme connu (contexte du document).",
    },
  ],
};

export const TYPES_EXPLICATION: TypeExplication[] = ["causeCommune", "coincidence", "causaliteInverse", "effetDecale", "causalitePlausible"];
