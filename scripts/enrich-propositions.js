/**
 * Script to enrich all 213 proposition markdown files with content
 * sourced from the existing site pages (mesures, projets, timeline, gouvernance, pouvoir-achat, outils).
 *
 * Run: node scripts/enrich-propositions.js
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'propositions');

// ─────────────────────────────────────────────────────────────────────────────
// DATA: FICHES_A (priority A measures with full detail)
// ─────────────────────────────────────────────────────────────────────────────
const FICHES_A = {
  1:  { besoin: 'Les habitants n\'ont aucune visibilité sur l\'avancement des promesses de campagne.', action: 'Déployer un tableau Kanban public en ligne pour chacune des 213 mesures. Lancer une consultation : « C\'est quoi une mesure réussie pour vous ? » — co-construction de la Definition of Done avec les habitants.', livrable: 'Plateforme PSE opérationnelle — mois 3.', kpi: '100 % des mesures publiées à M3 ; ≥ 500 visites/mois à M6.', dependances: 'Hébergement, développement (vague 1 MVP numérique).', cout: 'Inclus dans le budget outils numériques.' },
  3:  { besoin: 'Le budget municipal est illisible pour les habitants.', action: 'Publier le budget en version pédagogique + marchés publics en open data.', livrable: 'PTB en ligne — mois 3.', kpi: 'Budget simplifié consulté ≥ 1 000 fois/an ; 100 % des marchés publiés.', dependances: 'Données comptables de la ville.', cout: 'Inclus dans le budget outils numériques.' },
  4:  { besoin: 'Restaurer la confiance dans l\'intégrité des élus.', action: 'Rédiger et faire voter une charte en conseil municipal.', livrable: 'Charte adoptée — mois 2.', kpi: 'Adoption unanime visée ; publication sur le site de la ville.', dependances: 'Aucune.', cout: 'Négligeable (rédaction interne).' },
  13: { besoin: 'Opacité perçue dans l\'attribution des logements sociaux.', action: 'Publier les critères de scoring et les statistiques d\'attribution.', livrable: 'Grille de critères publiée — mois 4.', kpi: 'Réclamations liées à l\'opacité réduites de 50 % en 12 mois.', dependances: 'Coordination bailleurs sociaux.', cout: 'Négligeable.' },
  15: { besoin: 'Parcours administratif fragmenté pour les demandeurs de logement.', action: 'Ouvrir un guichet unique physique + numérique avec référent et suivi personnalisé.', livrable: 'Guichet opérationnel — mois 6.', kpi: 'Délai moyen de traitement < 15 jours ; satisfaction usagers ≥ 70 %.', dependances: 'Locaux, recrutement référent.', cout: 'À définir après audit (fonctionnement annuel).' },
  18: { besoin: 'Absence d\'inventaire exhaustif de l\'état du parc immobilier.', action: 'Commander un audit technique et énergétique du parc dégradé.', livrable: 'Rapport d\'audit livré — mois 9.', kpi: '100 % des immeubles dégradés identifiés et cartographiés.', dependances: 'Prestataire externe, accès bailleurs.', cout: 'À définir après audit.' },
  21: { besoin: 'Charges élevées et passoires thermiques dans les logements.', action: 'Lancer un programme de rénovation (logements sociaux + pavillons). Audit énergétique gratuit des pavillons.', livrable: 'Premiers chantiers lancés — mois 12 ; 200 logements rénovés à M30.', kpi: 'Nombre de logements rénovés/an ; économies d\'énergie moyennes.', dependances: 'Audit (mesure 18), financements ANRU/ADEME.', cout: 'Financements externes majoritaires (ANRU, ADEME, CEE, emprunts bonifiés).' },
  22: { besoin: 'Logements indignes non repérés ni traités.', action: 'Créer une cellule dédiée (agents + juriste) coordonnée avec la préfecture.', livrable: 'Cellule opérationnelle — mois 4.', kpi: 'Nombre de signalements traités ; délai moyen d\'intervention < 30 jours.', dependances: 'Recrutement, coordination préfecture.', cout: 'À définir après audit (fonctionnement annuel).' },
  30: { besoin: 'Présence insuffisante de la police municipale sur le terrain.', action: 'Recruter des agents, déployer l\'îlotage par quartier, renforcer la visibilité quotidienne.', livrable: 'Effectif cible atteint — mois 12.', kpi: 'Heures de présence terrain/semaine ; taux de couverture des quartiers.', dependances: 'Recrutement, formation.', cout: 'À définir après audit (masse salariale + équipement).' },
  31: { besoin: 'Sentiment d\'insécurité dans certains quartiers.', action: 'Déployer des patrouilles visibles couplées à des médiateurs de quartier.', livrable: 'Premières patrouilles opérationnelles — mois 3.', kpi: 'Réduction du nombre d\'incivilités signalées ; satisfaction habitants (enquête annuelle).', dependances: 'Mesure 30 (effectifs police).', cout: 'Inclus dans mesure 30.' },
  34: { besoin: 'Zones sombres générant un sentiment d\'insécurité.', action: 'Diagnostic complet + plan de rénovation de l\'éclairage public.', livrable: 'Diagnostic — mois 6 ; premiers points noirs traités — mois 12.', kpi: 'Nombre de points noirs éliminés ; consommation énergétique éclairage (en baisse).', dependances: 'Diagnostic terrain, budget investissement.', cout: 'À définir après diagnostic.' },
  35: { besoin: 'Mise en danger des enfants aux heures d\'entrée et sortie des écoles.', action: 'Aménagements physiques (barrières, ralentisseurs) + présence d\'agents aux heures de pointe.', livrable: '100 % des écoles sécurisées — mois 12.', kpi: 'Zéro accident aux abords scolaires ; présence agents constatée aux horaires clés.', dependances: 'Diagnostic voirie, coordination Éducation nationale.', cout: 'À définir après diagnostic.' },
  44: { besoin: 'Difficulté d\'accès aux soins de premier recours dans tous les quartiers.', action: 'Identifier les locaux et constituer l\'équipe pluridisciplinaire (médecins, infirmiers, psychologues, sages-femmes…).', livrable: 'Locaux identifiés — mois 6 ; ouverture — mois 18.', kpi: 'Nombre de patients suivis ; délai moyen de rendez-vous < 48h.', dependances: 'ARS, professionnels de santé, locaux.', cout: 'À définir (investissement + fonctionnement, ARS).' },
  47: { besoin: 'Habitants modestes sans couverture complémentaire santé suffisante.', action: 'Négocier un contrat groupe avec un organisme mutualiste.', livrable: 'Mutuelle ouverte aux adhésions — mois 6.', kpi: 'Nombre d\'adhérents ; économies moyennes par ménage.', dependances: 'Négociation prestataire mutualiste.', cout: 'Pilotage municipal ; cotisations portées par les adhérents.' },
  74: { besoin: 'CCAS peu visible et difficilement accessible dans les quartiers.', action: 'Renforcer la présence dans les quartiers (permanences délocalisées, agents de terrain).', livrable: 'Permanences de proximité ouvertes — mois 6.', kpi: 'Nombre de personnes reçues/mois ; taux de non-recours en baisse.', dependances: 'Locaux, agents sociaux.', cout: 'À définir après audit (fonctionnement annuel).' },
  75: { besoin: 'Parcours administratif éclaté entre services (CCAS, CAF, Pôle emploi…).', action: 'Centraliser l\'orientation sociale en un point d\'entrée unique.', livrable: 'Guichet opérationnel — mois 6.', kpi: 'Délai d\'orientation < 5 jours ; satisfaction usagers ≥ 70 %.', dependances: 'Coordination CCAS, CAF, Pôle emploi.', cout: 'Inclus dans mesure 74.' },
  87: { besoin: 'Bâtiments scolaires vétustes et inadaptés aux apprentissages.', action: 'Diagnostic complet des écoles + plan pluriannuel de travaux.', livrable: 'Diagnostic livré — mois 6 ; premiers chantiers — mois 12.', kpi: 'Nombre d\'écoles rénovées/an ; satisfaction enseignants et parents.', dependances: 'Diagnostic technique, financements ANRU/DSIL.', cout: 'Investissement pluriannuel, financements externes.' },
  88: { besoin: 'Projet hérité à sécuriser : financements OIM à vérifier, calendrier à confirmer.', action: 'Audit immédiat de l\'existant + décision Go/No-Go + pilotage scénario A (rentrée 2028) ou B (36 mois de reprise).', livrable: 'Rapport d\'audit — mois 3 ; décision formelle — mois 4.', kpi: 'Audit livré dans les délais ; financements confirmés (oui/non).', dependances: 'Métropole du Grand Paris, Région IDF, État, groupement partenaire.', cout: 'Financements OIM, État, Région, partenaires éducatifs.' },
  101: { besoin: 'Les jeunes les plus engagés n\'ont pas de cadre de valorisation.', action: 'Sélectionner et accompagner une première cohorte de jeunes ambassadeurs (excellence, moralité, fibre sociale). Engagement en retour : service à la ville.', livrable: 'Première cohorte lancée — mois 9.', kpi: 'Nombre de jeunes sélectionnés ; taux de réalisation de leurs projets.', dependances: 'Sélection, partenaires associatifs.', cout: 'À définir.' },
  116: { besoin: 'Pas de lieu central d\'accompagnement à l\'emploi et à la création d\'entreprise.', action: 'Identifier un site (ZI du Coudray), aménager les locaux, recruter l\'équipe.', livrable: 'Ouverture — mois 15.', kpi: 'Nombre de porteurs de projet accompagnés ; taux de création à 12 mois.', dependances: 'Locaux, Région IDF, FSE+, sponsors privés.', cout: 'À définir (Région IDF, FSE+, autofinancement).' },
  121: { besoin: 'Les marchés publics ne profitent pas assez à l\'emploi local.', action: 'Intégrer des clauses d\'insertion dans tous les marchés publics > 100 k€.', livrable: 'Premières clauses intégrées — mois 3.', kpi: '% de marchés avec clauses ; nombre d\'heures d\'insertion réalisées.', dependances: 'Service marchés publics.', cout: 'Négligeable (ingénierie interne).' },
  131: { besoin: 'Coût du transport pèse lourdement sur les familles.', action: 'Mettre en place le remboursement de la carte Imagin\'R pour tous les mineurs.', livrable: 'Dispositif opérationnel — mois 3.', kpi: 'Nombre de bénéficiaires ; taux de couverture estimé.', dependances: 'Île-de-France Mobilités, budget municipal.', cout: 'À définir.' },
  140: { besoin: 'Trottoirs dangereux, plaintes récurrentes des habitants.', action: 'Diagnostic de voirie + plan de rénovation priorisé (abords écoles, quartiers seniors, PMR).', livrable: 'Premiers trottoirs rénovés — mois 9.', kpi: 'Mètres linéaires rénovés/an ; réclamations en baisse.', dependances: 'Diagnostic voirie, budget investissement.', cout: 'À définir après diagnostic.' },
  179: { besoin: 'Déficit de nature en ville et îlots de chaleur dans les quartiers.', action: 'Identifier les sites prioritaires et lancer les premières plantations.', livrable: 'Plan adopté — mois 6 ; premières plantations — mois 9.', kpi: 'm² végétalisés/an ; nombre d\'arbres plantés.', dependances: 'Services techniques, agences de l\'eau.', cout: 'À définir (agences de l\'eau, ADEME, autofinancement).' },
  194: { besoin: 'Obligation légale non remplie ; absence de préparation aux crises.', action: 'Rédiger le Plan Communal de Sauvegarde en alignement avec le dispositif ORSEC départemental.', livrable: 'PCS adopté en conseil municipal — mois 9.', kpi: 'PCS testé par exercice annuel (oui/non) ; délai d\'activation PCC < 2h.', dependances: 'Préfecture, SDIS 93, services municipaux.', cout: 'À définir.' },
  201: { besoin: 'Faible sentiment de prise en compte des habitants dans les décisions locales.', action: 'Allouer une enveloppe dédiée + déployer une plateforme de vote citoyen.', livrable: 'Premier budget participatif voté — mois 12.', kpi: 'Taux de participation ; nombre de projets réalisés.', dependances: 'Plateforme numérique (vague 1).', cout: 'Enveloppe projets à définir.' },
  208: { besoin: 'État réel des finances inconnues après le changement de majorité.', action: 'Commander un audit externe indépendant dès le mois 0.', livrable: 'Rapport d\'audit livré — mois 4 ; publié intégralement.', kpi: 'Rapport publié intégralement ; recommandations suivies à ≥ 80 %.', dependances: 'Cabinet d\'audit externe.', cout: 'À définir.' },
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA: Chapter info (vision + objectifs + miseEnOeuvre)
// ─────────────────────────────────────────────────────────────────────────────
const CHAPITRES = [
  { id: 1, titre: 'Gouvernance, éthique et exemplarité', range: [1, 12], vision: 'L\'utopie devient crédible lorsqu\'elle est organisée, mesurée et assumée.', miseEnOeuvre: 'PSE — Tableau Kanban public, co-construction de la Definition of Done avec les habitants. ENQ — 21 espaces de quartier : covoiturage local, petits travaux entre voisins, aide aux devoirs, vigilance de quartier, boîte à idées avec vote pour/contre. Développement open source par une association locale de jeunes, code réutilisable par toutes les communes. PTB — Budget simplifié + détaillé, marchés publics en open data. PIPC — Interpellations déposées, qualifiées, répondues publiquement. RGPI — Avancement, coûts, bénéfices par projet. SEAD — Tableaux de bord, IA, audits externes, vote de confiance annuel.' },
  { id: 2, titre: 'Logement et urbanisme', range: [13, 29], vision: 'Un logement dégradé coûte plus cher à la collectivité qu\'un logement bien entretenu. La contrainte mal conçue produit de la pénurie ; l\'incitation intelligente produit de la qualité.', miseEnOeuvre: 'Accès au logement — Guichet unique (physique + numérique) avec référent et suivi personnalisé, commission renforcée, publication du scoring d\'attribution. Régulation — Pas d\'encadrement rigide ; régulation par l\'offre : garantie locative, sécurisation des propriétaires, stabilité fiscale, rénovation pour réduire les charges. Logements vacants — Agence sociale municipale : remise en état, loyer garanti, mixité sociale. Rénovation — Audit du parc, programme énergétique (logements sociaux + pavillons), audit énergétique gratuit des pavillons, plan ascenseurs/parties communes. Lutte contre la dégradation — Cellule habitat indigne, relogement d\'urgence, plan grand froid. Urbanisme — Charte des promoteurs, révision concertée du PLU, intégration des syndicats de copropriétaires. Anticipation GPE — Deux nouvelles stations de métro en construction ; centralités autour des gares préparées dès maintenant.' },
  { id: 3, titre: 'Sécurité, prévention et tranquillité publique', range: [30, 43], vision: 'Une ville sûre est une ville où chacun se sent membre d\'une même communauté, protégé par des adultes de confiance et responsabilisé dans ses actes.', miseEnOeuvre: 'Sécurité de proximité — Police municipale renforcée (îlotage, visibilité quotidienne) couplée à des adultes référents dans l\'espace public. Projet de quartier — Créer un sentiment d\'appartenance fort ; habitants qui se connaissent, responsabilité partagée, fierté locale. Tranquillité — Sécurisation des abords scolaires, halls, parkings, éclairage renforcé. Responsabilisation — Travaux d\'intérêt général pour les jeunes. Prévention jeunesse — Plan local de prévention de la délinquance, médiation anti-rixes, prévention des addictions. Protection victimes — Lutte renforcée contre les violences faites aux femmes. Coordination — Police nationale + médiateurs + vidéoprotection encadrée. Transparence — Bilans annuels de sécurité partagés avec les habitants.' },
  { id: 4, titre: 'Santé et accès aux soins', range: [44, 58], vision: 'Une ville en bonne santé prend soin de ses habitants avant que la maladie ne s\'installe.', miseEnOeuvre: 'Offre de soins — Maison de santé pluridisciplinaire 360 ; cabinets de proximité dans les quartiers ; plan d\'attractivité ; accueil des jeunes professionnels de santé. Accès financier — Mutuelle communale à tarifs négociés. Prévention — Centres de dépistage mobiles ; campagnes vaccination/dépistage ; programme de prévention santé. Santé mentale — Dispositif municipal de repérage précoce et d\'orientation. Addictions — Plan local articulé avec la prévention jeunesse. Télémédecine — Complément encadré, jamais un substitut. Aidants — Reconnaissance officielle, prévention de l\'épuisement. Observatoire — Suivi des indicateurs de santé par quartier.' },
  { id: 5, titre: 'Égalité, lutte contre les discriminations et violences', range: [59, 73], vision: 'L\'égalité repose sur l\'égalité des droits, des devoirs et du respect — et non sur une discrimination positive qui divise.', miseEnOeuvre: 'Égalité femmes-hommes — Plan municipal, cellule dédiée, parcours global d\'accompagnement, lieux d\'accueil sécurisés, accès prioritaire au logement pour les victimes. Formation systématique des agents municipaux. Harcèlement — Dispositif contre le harcèlement scolaire · Lutte contre le cyber-harcèlement. Discriminations — Sensibilisation contre le racisme, l\'antisémitisme, les discriminations religieuses, sociales et territoriales. Observatoire local. Soutien — Associations spécialisées conventionnées, espaces de parole pour les jeunes. Bilan — Publication annuelle des résultats.' },
  { id: 6, titre: 'Solidarité, action sociale et famille', range: [74, 85], vision: 'Une ville solidaire est une ville où personne n\'est invisible, où l\'aide est accessible sans humiliation.', miseEnOeuvre: 'CCAS renforcé — Présence dans les quartiers, accueil humain, guichet social unique. Pouvoir d\'achat — Tarification sociale ; aide alimentaire renforcée ; achats groupés hebdomadaires de produits essentiels. Familles — Soutien aux familles monoparentales · Plan « Enfance et familles ». Lutte contre l\'isolement — Vie de quartier inclusive, entraide intergénérationnelle. Aidants — Reconnaissance, information, prévention de l\'épuisement. Solidarité de proximité — Réseaux d\'alerte pour canicule/grand froid/urgences.' },
  { id: 7, titre: 'Enfance et éducation', range: [86, 100], vision: 'Chaque enfant doit maîtriser les savoirs fondamentaux le plus tôt possible, et chaque talent doit pouvoir atteindre l\'excellence.', miseEnOeuvre: 'MAM — Maisons d\'assistantes maternelles. Rénovation — Plan global des écoles. Fondamentaux — Méthodes structurées dès la maternelle : lecture, écriture, calcul. Continuité — Périscolaire renforcé, maisons de quartier. Excellence — Détection des élèves à fort potentiel. Cantine — Qualité améliorée, tarification adaptée, gratuite pour les plus vulnérables. Alliance éducative — Parents et école co-éducateurs.' },
  { id: 8, titre: 'Jeunesse, insertion et émancipation', range: [101, 115], vision: 'Aucun jeune ne doit être laissé sans perspective. Zéro jeune contraint à la délinquance faute d\'alternative.', miseEnOeuvre: 'Les Ambassadeurs — Programme d\'excellence pour les jeunes les plus engagés. Orientation — Accompagnement personnalisé 16-25 ans, parcours d\'insertion par l\'utilité locale. Mentorat — Suivi individualisé. Autonomie — Accès emploi, formation, alternance. Soutien logement, mobilité, démarches. Engagement citoyen — Conseil municipal des jeunes, projets de quartier. Éducation financière — Dès le plus jeune âge. Prévention — Accompagnement des jeunes en rupture.' },
  { id: 9, titre: 'Emploi, entrepreneuriat et commerce local', range: [116, 130], vision: 'Créer de la valeur localement et permettre aux habitants de créer eux-mêmes leur emploi.', miseEnOeuvre: 'Maison de l\'Emploi — Lieu central, accompagnement ciblé, coworking, incubateur. Emploi local — Clauses d\'insertion dans tous les marchés > 100 k€, plateforme de recrutement, partenariats entreprises. Commerce de proximité — Baux à loyers réduits, rénovation de locaux, animation commerciale. Entrepreneuriat — Concours de création, reconversions, ESS, forums annuels. Observatoire — Suivi de l\'emploi local et de la vacance commerciale.' },
  { id: 10, titre: 'Mobilités et transports', range: [131, 143], vision: 'Une ville où l\'on peut se déplacer en sécurité, quel que soit son âge, son quartier ou son mode de transport.', miseEnOeuvre: 'Solidarité — Gratuité des transports pour les mineurs (Imagin\'R), aide à la mobilité pour les publics fragiles. Sécurité — Trottoirs praticables partout, abords scolaires sécurisés. Mobilités douces — Plan vélo, marche et trottinette. Voitures partagées — Dispositif par quartier. Transports en commun — Négociation avec ÎdFM, navettes municipales. Nuisances — Zones piétonnes en centres de quartier.' },
  { id: 11, titre: 'Culture, sport et vie associative', range: [144, 161], vision: 'Placer les associations au cœur de la ville, faire de la culture et du sport des biens communs accessibles à tous.', miseEnOeuvre: 'Maison des Associations — Lieu central, accompagnement, mise en réseau. Financement — Subventions simplifiées et transparentes, conventions pluriannuelles. Culture — Programmation de proximité, festival culturel et cinématographique annuel. Sport — Pass\'Sport & Culture, plan « Savoir nager », rénovation d\'équipements, sport-santé. Bénévolat — Reconnaissance officielle, parcours citoyen. Animation — Blanc-Mesnil Plage, épiceries sociales et solidaires.' },
  { id: 12, titre: 'Seniors, handicap et intergénérationnel', range: [162, 176], vision: 'Ne pas séparer les âges ni les fragilités, mais organiser la proximité, l\'autonomie et l\'entraide au cœur des quartiers.', miseEnOeuvre: 'Maisons intergénérationnelles — Activités partagées. Lutte contre l\'isolement — Navettes sur réservation, services de livraison. Maintien à domicile — Soutien renforcé. Ville inclusive — Accessibilité 100 % bâtiments municipaux, référent handicap. Aidants — Solutions de répit. Fracture numérique — Accompagnement humain. Intergénérationnel — Projets communs, transmission de savoirs.' },
  { id: 13, titre: 'Écologie, cadre de vie et protection animale', range: [177, 193], vision: 'Faire de l\'écologie un projet de qualité de vie, fondé sur la propreté, la proximité, la responsabilité et le respect du vivant.', miseEnOeuvre: 'Végétalisation — Jardins partagés, plan de végétalisation, préservation des espaces verts, îlots de fraîcheur. Propreté — Objectifs par quartier, lutte contre les dépôts sauvages. Économie circulaire — Ateliers réparation, espaces d\'échange. Adaptation climatique — Désimperméabilisation, gestion de l\'eau. Sensibilisation — Écogestes, circuits courts. Protection animale — Bien-être animal, lutte contre l\'abandon.' },
  { id: 14, titre: 'Prévention des risques, résilience et gestion de crise', range: [194, 200], vision: 'Une ville résiliente est une ville préparée, organisée et capable de protéger ses habitants sans improvisation.', miseEnOeuvre: 'PCS — Plan communal de sauvegarde actualisé, aligné sur le dispositif ORSEC départemental. PCC — Poste de commandement communal activable immédiatement, chaîne de décision claire. Réserve communale — Citoyens volontaires formés. Aléas climatiques — Plans canicule et grand froid renforcés. Continuité — Plan de continuité des services publics essentiels. DICRIM — Distribué à chaque foyer. Coordination — Convention avec SDIS 93 et préfecture.' },
  { id: 15, titre: 'Démocratie locale, finances et transparence', range: [201, 213], vision: 'La confiance publique se construit par la transparence, la participation et l\'évaluation, pas par les discours.', miseEnOeuvre: 'Budgets participatifs — Plateforme en ligne, dépôt, instruction, vote citoyen. Conseils de quartier — Renforcés et dotés de moyens. Plateforme citoyenne — Participation, interpellations, suivi des engagements. Finances — Audits indépendants, maîtrise des dépenses, financements externes. Évaluation — Suivi public, indicateurs accessibles, évaluation permanente. Rapports — Mi-mandat et fin de mandat publics.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA: Detailed descriptions per measure (from projets, outils, pouvoir-achat, timeline, gouvernance)
// ─────────────────────────────────────────────────────────────────────────────
const DESCRIPTIONS = {
  1: `Mettre en place une Plateforme de Suivi des Engagements (PSE) — un tableau Kanban public en ligne pour chacune des 213 mesures du mandat. Chaque mesure affiche son statut (à faire / en cours / livré), le responsable, les dates et la Definition of Done co-construite avec les habitants.\n\nDès la mise en ligne, une consultation est lancée : « C'est quoi une mesure réussie pour vous ? ». Chaque Blanc-Mesnilois peut proposer ses critères de réussite. L'objectif est d'avoir la Definition of Done de chaque mesure co-construite avec les habitants avant la rentrée scolaire.`,
  2: `Organiser des bilans annuels citoyens dans chacun des 21 quartiers de la ville. Présentation publique de l'avancement des engagements, des résultats concrets et des ajustements décidés. Les habitants posent des questions, interpellent et contribuent à l'évaluation de l'action municipale.`,
  3: `Publier le budget municipal en version pédagogique accessible à tous, avec des visualisations claires. Mettre en open data l'ensemble des marchés publics. Le Portail de Transparence Budgétaire (PTB) permet aux habitants de consulter, commenter et proposer des optimisations.\n\nVersion simplifiée consultable en ligne dès le mois 3 ; marchés publics 100 % publiés.`,
  4: `Rédiger et faire voter une charte éthique des élus municipaux dès le premier conseil municipal (J1). La charte engage chaque élu sur la transparence, l'intégrité, la probité, le désintéressement et la redevabilité. Publication sur le site de la ville.`,
  5: `Instaurer une participation citoyenne permanente via les outils numériques (PSE, ENQ, PIPC) et les dispositifs physiques (conseils de quartier, permanences en mairie). Les habitants peuvent contribuer en continu à la fabrique de l'action municipale, pas seulement lors des élections.`,
  6: `Publier de manière transparente l'ensemble des marchés publics de la ville sur le Portail de Transparence Budgétaire (PTB) : montants, attributaires, critères de sélection, clauses d'insertion. Open data intégral pour permettre le contrôle citoyen.`,
  7: `Créer un droit d'interpellation citoyenne via la Plateforme d'Interpellation et de Participation Citoyenne (PIPC). Circuit : dépôt de l'interpellation → qualification → réponse publique dans un délai défini → suivi. Chaque interpellation reçoit une réponse argumentée et publique.`,
  8: `Rendre les conseils municipaux accessibles à tous : retransmission en direct, comptes rendus simplifiés, vocabulaire explicatif, droit de parole pour les citoyens sur inscription. L'objectif est que chaque habitant puisse comprendre et suivre les décisions prises en son nom.`,
  9: `Créer un comité citoyen des grands projets, associant des habitants tirés au sort, des représentants associatifs et des experts indépendants. Le comité suit chaque grand projet (ZAC Molette, campus trilingue, rénovation des Tilleuls…) via le Registre des Grands Projets et Investissements (RGPI).`,
  10: `Publier un plan pluriannuel d'investissement transparent sur le RGPI : calendrier, coûts prévisionnels, sources de financement, bénéfices attendus pour chaque investissement. Mise à jour trimestrielle. Les habitants peuvent commenter et contribuer.`,
  11: `Mettre en place un programme de formation continue pour les élus et les cadres de la collectivité : gestion financière, participation citoyenne, évaluation des politiques publiques, management, gestion de crise. Deux cycles de formation sur le mandat.`,
  12: `Commander une évaluation indépendante à mi-mandat (mois 30) : cabinet externe, rapport publié intégralement, recommandations suivies et publiées sur la PSE. Transparence totale sur les résultats.`,
  13: `Mettre fin à l'opacité perçue dans l'attribution des logements sociaux. Publier les critères de scoring, les statistiques d'attribution (délais, profils, quartiers). Chaque demandeur comprend les règles et peut suivre son dossier via le guichet unique.`,
  14: `Installer une commission municipale renforcée du logement, associant élus, bailleurs sociaux, représentants des locataires et experts du logement. Elle supervise les attributions, veille à l'équité et formule des recommandations publiques.`,
  15: `Ouvrir un guichet unique du logement (physique + numérique) avec un référent par dossier et un suivi personnalisé. Un seul interlocuteur pour toutes les démarches liées au logement : demande sociale, signalement, recours, accompagnement.\n\nObjectif : délai moyen de traitement < 15 jours.`,
  16: `Chaque demandeur de logement bénéficie d'un suivi personnalisé de son dossier via le guichet unique : référent attitré, tableau de bord personnel, notifications d'avancement, transparence sur les étapes restantes.`,
  17: `Réguler le marché locatif par l'offre et la qualité — pas par un encadrement rigide. Garantie locative pour sécuriser les propriétaires, stabilité fiscale, rénovation pour réduire les charges, remise sur le marché des logements vacants via une agence sociale municipale (remise en état, loyer garanti, mixité sociale).`,
  18: `Commander un audit technique et énergétique complet du parc immobilier dégradé : identifier tous les immeubles en mauvais état, cartographier les problèmes, prioriser les interventions. L'audit nourrit directement le programme de rénovation énergétique (mesure 21) et la cellule habitat indigne (mesure 22).`,
  19: `Auditer les programmes de construction massive lancés sous les mandats précédents : vérifier la conformité, l'impact sur la densité, les infrastructures de la ville (écoles, transports, services). En tirer les leçons pour la révision du PLU.`,
  20: `Lancer un plan prioritaire de réparation des ascenseurs et de rénovation des parties communes dans les immeubles collectifs. Coordination avec les bailleurs sociaux et les syndicats de copropriétaires. Objectif : zéro ascenseur en panne plus de 48h.`,
  21: `Lancer un programme municipal de rénovation énergétique ambitieux : logements sociaux + pavillons privés. Audit énergétique gratuit pour les propriétaires de pavillons. Objectif : 200 logements rénovés d'ici 30 mois.\n\nFinancements : ANRU, ADEME, CEE, emprunts bonifiés. Réduction concrète des charges pour les habitants.`,
  22: `Créer une cellule dédiée de lutte contre l'habitat indigne : agents de terrain + juriste, coordonnée avec la préfecture et l'ARS. Repérage actif, signalement facilité, intervention dans un délai < 30 jours. Activation dès le mois 4.`,
  23: `Mettre en place un dispositif de relogement d'urgence pour les habitants victimes d'insalubrité grave, d'incendie ou de péril. Parc de logements-relais identifié, convention avec les bailleurs, procédure d'activation rapide.`,
  24: `Actualiser et renforcer le plan grand froid : repérage des personnes vulnérables dans chaque quartier, activation de lieux d'accueil chauffés, coordination CCAS + associations + police municipale. Information proactive des habitants.`,
  25: `Rédiger une charte municipale des promoteurs : engagements sur la qualité architecturale, les espaces verts, la mixité, le logement abordable, l'emploi local. Tout promoteur intervenant sur le territoire s'engage contractuellement.`,
  26: `Créer un conseil municipal des syndicats de copropriétaires : lieu d'échange entre la ville et les copropriétés, remontée des problèmes, mutualisation des solutions (entretien, rénovation, gestion des parties communes).`,
  27: `Engager une révision concertée du Plan Local d'Urbanisme (PLU) avec les habitants, les associations, les professionnels. Objectifs : maîtriser la densité, préserver les espaces verts, préparer l'arrivée du Grand Paris Express, améliorer la qualité urbaine.`,
  28: `Accompagner l'arrivée des nouvelles stations de métro du Grand Paris Express : préparer les centralités autour des gares, anticiper les flux, protéger les riverains, créer de l'activité et des services sans densification résidentielle excessive.`,
  29: `Dynamiser les places et espaces urbains du Blanc-Mesnil : aménagements conviviaux, mobilier urbain, végétalisation, programmation culturelle ponctuelle. Créer des lieux de vie et de rencontre dans chaque quartier.`,
  30: `Renforcer significativement la police municipale : recruter des agents, déployer l'îlotage par quartier, assurer une visibilité quotidienne sur le terrain. Effectif cible atteint à 12 mois. Heures de présence terrain en hausse chaque trimestre.`,
  31: `Déployer des patrouilles de proximité visibles dès le mois 3 : police municipale couplée à des médiateurs de quartier. Présence rassurante, connaissance fine du terrain, lien humain avec les habitants. Premiers déploiements dans les quartiers les plus en demande.`,
  32: `Former les agents municipaux (police, médiateurs, accueil) à la médiation et à la gestion des conflits. Techniques de désescalade, posture professionnelle, écoute active. Formation continue, pas ponctuelle.`,
  33: `Formaliser et renforcer la coordination avec la police nationale : réunions régulières, partage d'information, opérations conjointes ciblées, protocole d'intervention coordonné. Un partenariat structuré, pas de la bonne volonté ponctuelle.`,
  34: `Réaliser un diagnostic complet de l'éclairage public et traiter les points noirs en priorité. Zones sombres = sentiment d'insécurité. Objectif : supprimer les zones non éclairées, rénover l'éclairage vétuste, réduire la consommation énergétique (LED).`,
  35: `Sécuriser 100 % des abords scolaires en 12 mois : barrières, ralentisseurs, passages piétons renforcés, présence d'agents aux heures de pointe. Zéro accident aux abords des écoles est l'objectif non négociable.`,
  36: `Déployer un réseau de médiateurs de quartier : adultes référents identifiés et formés, présents dans l'espace public aux heures sensibles. Lien entre les habitants, la police municipale et les services sociaux. Recrutement prioritaire de profils du territoire.`,
  37: `Créer un point municipal d'écoute et d'accompagnement pour les victimes d'insécurité, de violences ou de troubles de voisinage. Orientation vers les services compétents, suivi personnalisé, confidentialité garantie.`,
  38: `Élaborer un plan local contre les violences faites aux femmes : accueil dédié, protection, orientation, hébergement d'urgence, suivi. Coordination avec les associations spécialisées et les services de l'État.`,
  39: `Lutter contre les incivilités du quotidien et sécuriser les parkings souterrains et de surface : éclairage, vidéoprotection encadrée, présence humaine, verbalisation systématique. Rendre les espaces communs sûrs et respectés.`,
  40: `Sécuriser les halls d'immeubles et les parties communes : présence d'adultes référents, aménagements dissuasifs, coordination avec les bailleurs, médiation avant répression.`,
  41: `Mettre en place un programme de prévention du décrochage et de la délinquance juvénile : repérage précoce, accompagnement individualisé, alternatives concrètes (emploi, formation, sport, projets). Travaux d'intérêt général pour les jeunes.`,
  42: `Développer des actions contre les conduites à risque chez les jeunes : prévention des addictions (alcool, drogues, écrans), médiation anti-rixes, sensibilisation dès le plus jeune âge dans les écoles et les structures de quartier.`,
  43: `Publier un bilan annuel de sécurité transparent : incivilités signalées/traitées, présence terrain, opérations menées, résultats obtenus. Partagé avec les habitants en réunion de quartier. Ajustements continus.`,
  44: `Ouvrir une maison de santé pluridisciplinaire 360 : médecins, infirmiers, psychologues, sages-femmes, kinésithérapeutes. Locaux identifiés mois 6, ouverture mois 18. Délai moyen de rendez-vous < 48h. Accès aux soins de premier recours pour tous les quartiers.`,
  45: `Lancer un plan municipal d'attractivité médicale : locaux adaptés mis à disposition, aide à l'installation, conditions d'exercice favorables, partenariats avec les universités de médecine. Faire venir et garder les professionnels de santé sur le territoire.`,
  46: `Déployer des cabinets médicaux de proximité dans les quartiers les plus sous-dotés, en complément de la maison de santé. Objectif : aucun habitant à plus de 10 minutes à pied d'un professionnel de santé.`,
  47: `Négocier et lancer une mutuelle communale : contrat groupe avec un organisme mutualiste pour les habitants modestes sans couverture complémentaire suffisante. Cotisations portées par les adhérents, tarifs négociés collectivement.\n\nObjectif : ≥ 2 000 adhérents.`,
  48: `Structurer l'accueil des jeunes professionnels de santé sur le territoire : logement temporaire, conditions d'exercice, accompagnement administratif. Rendre le Blanc-Mesnil attractif pour les internes et les jeunes diplômés.`,
  49: `Nouer des partenariats durables avec les hôpitaux et universités de médecine de proximité : conventions de coopération, accueil de stagiaires, filières de soins coordonnées, recherche appliquée.`,
  50: `Déployer des centres de dépistage mobiles dans les quartiers : campagnes régulières de dépistage (cancer, diabète, hypertension) et de vaccination. Partenariats ARS et hôpitaux. Aller vers les habitants plutôt que d'attendre qu'ils viennent.`,
  51: `Lancer un programme municipal de prévention santé : campagnes de sensibilisation, promotion de l'activité physique et de l'alimentation saine, prévention des maladies chroniques. Coordination avec la restauration scolaire et les activités sportives.`,
  52: `Créer un dispositif local de santé mentale : repérage précoce des troubles psychiques, orientation vers les professionnels, coordination des acteurs (médecins, psychologues, travailleurs sociaux). Briser le tabou de la santé mentale.`,
  53: `Mettre en place un parcours d'accompagnement des maladies chroniques : coordination médecin traitant / spécialiste / infirmier / pharmacien, éducation thérapeutique, suivi à domicile si nécessaire.`,
  54: `Élaborer un plan local de lutte contre les addictions articulé avec la prévention jeunesse : sensibilisation dès l'école, repérage, accompagnement, orientation vers les structures de soins. Tolérance zéro pour la vente aux mineurs.`,
  55: `Développer la télémédecine de manière encadrée : un complément pour améliorer l'accès aux soins (consultations à distance, suivi de patients chroniques), jamais un substitut à la présence physique. Cabines de télémédecine dans les maisons de quartier.`,
  56: `Assurer une information claire et continue sur l'offre de soins disponible dans la ville : site web actualisé, affichage en maison de quartier, numéro d'orientation. Chaque habitant sait où trouver un médecin, un spécialiste, un service de garde.`,
  57: `Structurer un soutien aux aidants familiaux : reconnaissance officielle, information sur les droits, solutions de répit, prévention de l'épuisement. Partenariats avec les associations spécialisées.`,
  58: `Créer un observatoire municipal de la santé : collecte et publication d'indicateurs de santé par quartier (accès aux soins, délais, prévention, santé mentale). Pilotage de la politique de santé locale par la donnée.`,
  59: `Adopter un plan municipal pour l'égalité femmes-hommes : sensibilisation au respect mutuel, relations équilibrées, parité dans les instances, formation systématique des agents municipaux, campagnes de communication.`,
  60: `Activer une cellule municipale de lutte contre les violences faites aux femmes : accueil, écoute, protection, orientation, hébergement d'urgence. Coordination avec les associations spécialisées et la justice.`,
  61: `Structurer un parcours d'accompagnement global des victimes de violences : accueil → écoute → protection → hébergement → accompagnement juridique → réinsertion. Coordination de tous les acteurs sur un même parcours.`,
  62: `Renforcer les lieux d'accueil sécurisés pour les victimes de violences : places d'hébergement d'urgence, appartements relais, accueil de jour. Partenariats avec les bailleurs et les associations.`,
  63: `Former systématiquement les agents municipaux à la détection des situations de violence, de harcèlement et de discrimination. Protocole d'alerte et d'orientation. Chaque agent sait comment réagir et vers qui orienter.`,
  64: `Mettre en place un dispositif municipal contre le harcèlement scolaire, quartier par quartier : repérage, médiation, accompagnement des victimes et des familles, sensibilisation des élèves. Tolérance zéro.`,
  65: `Lutter contre le cyber-harcèlement : sensibilisation des parents et des jeunes, détection, accompagnement des victimes, coordination avec les plateformes numériques et la justice. Interventions dans les écoles et les structures de quartier.`,
  66: `Prévenir activement les discriminations à l'emploi et au logement : testing, sensibilisation des employeurs et des bailleurs, accompagnement des victimes, signalement facilité. Les conseils de quartier comme premiers lieux d'alerte.`,
  67: `Créer un observatoire local des discriminations : collecte et publication de données sur les discriminations constatées (emploi, logement, services), recommandations, suivi des actions correctives.`,
  68: `Soutenir les associations spécialisées dans la lutte contre les discriminations et l'accompagnement des victimes : conventions pluriannuelles, moyens renforcés, coordination avec les services municipaux.`,
  69: `Garantir un accès prioritaire au logement pour les victimes de violences : partenariat avec les bailleurs sociaux, logements-relais identifiés, procédure d'activation rapide dès signalement.`,
  70: `Lancer des campagnes municipales de sensibilisation contre le racisme, l'antisémitisme, les discriminations religieuses, sociales et territoriales. Affichage, événements, interventions scolaires, contenus numériques.`,
  71: `Créer des espaces de parole pour les jeunes : lieux sécurisés où ils peuvent s'exprimer librement sur les violences, le harcèlement, les discriminations qu'ils subissent. Encadrés par des professionnels formés.`,
  72: `Promouvoir l'égalité dans tous les équipements municipaux : accès égal aux activités sportives et culturelles, mixité dans la programmation, sensibilisation des encadrants.`,
  73: `Publier un bilan annuel égalité et protection : indicateurs (signalements traités, victimes accompagnées, formations réalisées), résultats, ajustements. Transparence totale.`,
  74: `Renforcer le CCAS et le rapprocher des habitants : permanences délocalisées dans les quartiers, agents de terrain, accueil humain et bienveillant. Objectif : que personne ne renonce à ses droits par méconnaissance ou éloignement.`,
  75: `Ouvrir un guichet social unique : un seul point d'entrée pour toutes les démarches sociales (CCAS, CAF, Pôle emploi, aide alimentaire, logement). Orientation rapide vers le bon service. Délai d'orientation < 5 jours.`,
  76: `Réviser la tarification sociale des services municipaux pour une plus grande justice : cantine, activités périscolaires, sport, culture. Chaque famille paie selon ses moyens réels. Simplification administrative.`,
  77: `Lancer un plan municipal de lutte contre la précarité énergétique : repérage des foyers en difficulté, accompagnement vers les aides (chèque énergie, MaPrimeRénov'), rénovation énergétique prioritaire des logements les plus énergivores.`,
  78: `Renforcer l'accès à l'aide alimentaire et aux droits : épiceries sociales, achats groupés hebdomadaires de produits essentiels via le service cantine (prix sous le marché, sans grande distribution, produits sains). Lutte contre le gaspillage alimentaire.`,
  79: `Soutenir les familles monoparentales : accompagnement dédié, aide à la garde d'enfants, tarification adaptée, accès prioritaire aux dispositifs municipaux. Reconnaissance de la charge particulière de ces familles.`,
  80: `Mettre en place un dispositif municipal de lutte contre l'isolement : repérage des personnes isolées (seniors, personnes en situation de handicap, familles), visites régulières, activités de quartier, coordination avec les associations.`,
  81: `Structurer le soutien aux aidants familiaux : reconnaissance officielle, information sur les droits, solutions de répit (accueil de jour, aide temporaire à domicile), prévention de l'épuisement. Partenariats avec les associations spécialisées.`,
  82: `Faciliter l'accès aux services municipaux pour les personnes en difficulté : navettes sur réservation, aide aux démarches administratives, accompagnement personnalisé, simplification des formulaires.`,
  83: `Élaborer un plan municipal « Enfance et familles » : coordination de l'ensemble des dispositifs (petite enfance, périscolaire, loisirs, soutien à la parentalité). Vision globale et cohérente de l'accompagnement des familles.`,
  84: `Organiser la solidarité de proximité en cas de crise : réseaux d'alerte par quartier pour canicule, grand froid, urgences sanitaires. Coordination avec le PCS et la réserve communale de sécurité civile.`,
  85: `Publier un bilan annuel de l'action sociale : nombre de personnes accompagnées, taux de non-recours, dispositifs activés, budgets mobilisés. Transparence et évaluation continue.`,
  86: `Développer les Maisons d'Assistantes Maternelles (MAM) pour renforcer l'offre de garde de la petite enfance : regroupement d'assistantes maternelles dans des locaux adaptés, mutualisation des moyens, souplesse horaire pour les familles.`,
  87: `Lancer un plan global de rénovation des écoles : diagnostic complet de tous les bâtiments scolaires, plan pluriannuel de travaux (sécurité, confort, performance énergétique, adaptation pédagogique). Premiers chantiers dès le mois 12.\n\nObjectif : des écoles sûres, calmes et adaptées aux apprentissages.`,
  88: `Le campus trilingue (français, anglais, chinois) s'inscrit dans une Opération d'Intérêt Métropolitain (OIM) lancée sous le mandat précédent. Audit immédiat de l'existant dès le mois 0 : avancement des études, engagements contractuels, marchés signés, autorisations obtenues, financements.\n\nDécision Go/No-Go à mois 4 :\n- Scénario A (Continuité) : financements confirmés → maintien de l'objectif rentrée 2028.\n- Scénario B (Reprise) : financements à resécuriser → 36 mois de reprise avec construction optimisée.`,
  89: `Assurer un équipement numérique équitable dans toutes les écoles : diagnostic de l'existant, plan d'équipement (tablettes, ordinateurs, tableaux interactifs), formation des enseignants. Aucun élève ne doit être pénalisé par le manque d'outils.`,
  90: `Améliorer la restauration scolaire : qualité des repas (produits locaux, bio, diversité), tarification adaptée aux revenus, gratuité pour les familles les plus vulnérables. Apprentissage d'une alimentation saine et diversifiée. Achats groupés pour réduire les coûts.`,
  91: `Déployer un accompagnement éducatif de proximité : aide aux devoirs dans les maisons de quartier, tutorat par des étudiants et des retraités, méthodes structurées (type Kumon) pour les fondamentaux. Continuité éducative entre l'école et le quartier.`,
  92: `Renforcer les activités périscolaires : qualité de l'encadrement, diversité des activités (sport, culture, numérique, langues), continuité avec le projet éducatif de l'école. Le périscolaire comme temps éducatif à part entière.`,
  93: `Ouvrir les centres de loisirs le samedi pour offrir aux familles une solution de qualité le week-end : activités sportives, culturelles, sorties éducatives. Tarification sociale appliquée.`,
  94: `Lutter contre le décrochage scolaire dès les premiers signes : repérage précoce par les enseignants et les animateurs, accompagnement individualisé, lien avec les familles. Chaque enfant qui décroche est identifié et accompagné.`,
  95: `Réouvrir le centre de vacances « La Barre-de-Monts » pour permettre aux enfants du Blanc-Mesnil de partir en vacances dans un cadre éducatif de qualité, à un coût accessible pour toutes les familles.`,
  96: `Soutenir la parentalité : espaces parents-enfants, conférences, ateliers pratiques, médiation familiale. Aider les parents à accompagner la scolarité et l'éducation de leurs enfants. Parents et école sont co-éducateurs.`,
  97: `Prévenir les inégalités éducatives dès la petite enfance : accès égal aux activités, tenues scolaires simples et résistantes en achats groupés, sensibilisation à l'investissement dans l'éducation plutôt que dans les marques.`,
  98: `Promouvoir la lecture et la culture dès le plus jeune âge : partenariat avec les bibliothèques, prix littéraires scolaires, interventions d'auteurs, Bibliobus 2.0 dans les quartiers éloignés.`,
  99: `Encourager la participation des élèves à la vie scolaire : conseils d'élèves, projets collectifs, responsabilités confiées. Apprendre la citoyenneté par la pratique dès l'école primaire.`,
  100: `Publier un bilan annuel éducatif : indicateurs de réussite scolaire, taux de maîtrise des fondamentaux, décrochage, satisfaction des familles et des enseignants. Évaluation transparente et ajustements continus.`,
  101: `Lancer le programme « Les Ambassadeurs » : sélection et accompagnement d'une première cohorte de jeunes d'excellence du Blanc-Mesnil. Critères : excellence scolaire, moralité, fibre sociale. En retour : service à la ville (mentorat, animation, transmission).\n\nPremière cohorte lancée mois 9.`,
  102: `Mettre en place un plan mentorat : chaque jeune en difficulté est accompagné par un adulte référent (entrepreneur, professionnel, retraité engagé). Suivi individualisé, objectifs partagés, lien durable.`,
  103: `Installer un conseil municipal des jeunes actif et doté de moyens : budget dédié, projets concrets portés par les jeunes, lien direct avec le conseil municipal adulte. Participation réelle, pas symbolique.`,
  104: `Accompagner individuellement chaque jeune de 16 à 25 ans en difficulté : orientation, formation, emploi, logement, mobilité. Un référent unique par jeune. Parcours d'insertion par l'utilité locale (électricité, bâtiment, vente, services municipaux).`,
  105: `Créer des espaces jeunesse de proximité dans les quartiers : lieux ouverts le soir et le week-end, activités encadrées, espace de travail, accès internet, accompagnement social léger.`,
  106: `Soutenir les projets portés par les jeunes : fonds d'aide, accompagnement méthodologique, espaces de réalisation. Chaque jeune avec une idée viable peut la concrétiser avec l'appui de la ville.`,
  107: `Faciliter l'accès au logement des jeunes : garantie locative municipale, logements-relais, partenariat avec les bailleurs sociaux. Autonomie réelle dès que possible.`,
  108: `Aider à la mobilité des jeunes : permis de conduire (financement partiel en échange de bénévolat), aide au transport, prêt de vélos, covoiturage organisé.`,
  109: `Prévenir les ruptures de parcours chez les jeunes : détection précoce des signaux faibles (absentéisme, décrochage, isolement), coordination des acteurs (école, famille, services sociaux, justice), solutions concrètes immédiates.`,
  110: `Promouvoir l'engagement citoyen des jeunes : service civique local, projets de quartier, actions solidaires, reconnaissance de l'engagement dans le parcours scolaire et professionnel.`,
  111: `Développer le volontariat local : missions proposées par la ville et les associations, encadrement, valorisation. Toute personne le pouvant contribue à la vie de la cité par le bénévolat.`,
  112: `Soutenir l'entrepreneuriat jeune : accompagnement dédié à la Maison de l'Emploi, ateliers de création d'entreprise, mise en réseau avec des entrepreneurs expérimentés, accès au fonds municipal d'amorçage.`,
  113: `Lutter contre les discriminations à l'insertion : testing, sensibilisation des employeurs, accompagnement renforcé des jeunes discriminés, partenariats avec les entreprises engagées.`,
  114: `Renforcer l'information sur les droits des jeunes : guide municipal, permanences dédiées, campagnes ciblées (logement, santé, emploi, mobilité, aide sociale). Que chaque jeune connaisse ses droits.`,
  115: `Publier un bilan annuel jeunesse et insertion : nombre de jeunes accompagnés, taux d'insertion à 12 mois, projets réalisés, entreprises créées. Évaluation et ajustement continus.`,
  116: `Ouvrir une Maison de l'Emploi et de l'Entrepreneuriat à proximité de la zone d'activité du Coudray. Lieu central, sélectif et ambitieux : accompagnement ciblé des profils capables de créer leur activité, coworking, incubateur de startups, fonds municipal d'amorçage.\n\nRecherche active de sponsors privés et partenaires institutionnels (Région IDF, FSE+).`,
  117: `Mettre à disposition des salles municipales équipées pour les entrepreneurs et indépendants : espaces de coworking accessibles, salles de réunion, connexion internet haut débit. Intégrés à la Maison de l'Emploi.`,
  118: `Créer un fonds municipal de soutien à la création d'entreprise : amorçage financier pour les projets viables, cofinancé avec la Région Île-de-France et le FSE+. Sélection sur dossier et accompagnement.`,
  119: `Mettre en place un incubateur de projets locaux au sein de la Maison de l'Emploi : accompagnement 360° de l'idée à la création. Sessions de formation, mentorat par des entrepreneurs expérimentés, mise en réseau.`,
  120: `Déployer une plateforme locale de recrutement : mise en relation directe entre entreprises du territoire et demandeurs d'emploi du Blanc-Mesnil. Stages, alternance, emplois. Partenariats avec les entreprises de la ZI du Coudray.`,
  121: `Intégrer des clauses d'insertion dans tous les marchés publics > 100 k€ : heures d'insertion obligatoires, emploi local prioritaire. Activation dès les premiers marchés (mois 3). Suivi du nombre d'heures réalisées.`,
  122: `Accompagner les reconversions professionnelles : diagnostic des compétences, formations qualifiantes, orientation vers les métiers en tension sur le territoire. Partenariat avec Pôle emploi et les organismes de formation.`,
  123: `Organiser un concours annuel de création d'entreprise : visibilité pour les lauréats, prix financiers, accompagnement renforcé, mise en réseau avec les partenaires de la Maison de l'Emploi.`,
  124: `Lutter contre la vacance commerciale : repérage des locaux vides, baux à loyers réduits sécurisés par la mairie, rénovation des vitrines, incitation à l'installation de commerces de proximité. Objectif : commerces essentiels à moins de 10 min à pied dans chaque quartier.`,
  125: `Animer la vie commerciale du territoire : marchés de producteurs, événements commerçants, mise en valeur des artisans locaux, coordination des associations de commerçants.`,
  126: `Adopter une politique d'achats responsables : critères environnementaux et sociaux dans les marchés publics, circuits courts privilégiés, entreprises locales favorisées à qualité égale.`,
  127: `Soutenir l'économie sociale et solidaire (ESS) : conventionnement avec les structures ESS du territoire, aide au démarrage, mise en réseau, promotion auprès des habitants.`,
  128: `Développer l'apprentissage local : partenariat avec les CFA, les entreprises du territoire et la Maison de l'Emploi. Objectif : chaque jeune qui le souhaite trouve une place d'apprentissage.`,
  129: `Organiser des forums emploi et entrepreneuriat annuels : rencontre directe entre employeurs, formateurs et habitants. Ateliers CV, simulations d'entretien, présentation des dispositifs d'aide.`,
  130: `Créer un observatoire local de l'emploi : suivi de la vacance commerciale, du taux d'emploi, des créations d'entreprise, des offres non pourvues. Publication trimestrielle. Pilotage de la politique économique locale par la donnée.`,
  131: `Mettre en place la gratuité des transports pour tous les mineurs du Blanc-Mesnil via le remboursement de la carte Imagin'R. Dispositif opérationnel dès le mois 3. Objectif : un passe Navigo annuel pour chaque enfant et adolescent.\n\nImpact pouvoir d'achat direct pour les familles.`,
  132: `Déployer une aide à la mobilité pour les publics fragiles : seniors, personnes en situation de handicap, familles en difficulté. Navettes municipales sur réservation, aide financière ciblée pour les abonnements de transport.`,
  133: `Négocier avec Île-de-France Mobilités pour l'amélioration de l'offre de transport au Blanc-Mesnil : fréquences, amplitudes horaires, nouvelles lignes, correspondances. Inciter les habitants à valider systématiquement pour démontrer le besoin.`,
  134: `Sécuriser les arrêts de bus et les pôles d'échange : éclairage, aménagement, présence humaine aux heures de pointe. Un transport sûr encourage son utilisation.`,
  135: `Élaborer un plan municipal vélo : pistes cyclables continues et sécurisées, réseau cohérent à l'échelle de la ville. Diagnostic terrain terminé mois 9, premières réalisations mois 18.`,
  136: `Installer des stationnements vélos et trottinettes sécurisés : abris fermés près des écoles, des gares, des équipements publics. Lutte contre le vol et les dégradations.`,
  137: `Proposer une aide à l'achat de vélos et vélos électriques pour les habitants : subvention municipale cumulable avec les aides régionales. Encourager les mobilités douces pour les trajets quotidiens.`,
  138: `Élaborer un plan de circulation concerté avec les habitants : zones apaisées, sens de circulation optimisés, zones piétonnes en centres de quartier. Cartographie en temps réel des prix du carburant sur le site de la ville.`,
  139: `Mettre en place une gestion intelligente du stationnement municipal : règles claires, zéro voiture sur les trottoirs, stationnement résidentiel protégé, horodateurs adaptés.`,
  140: `Lancer la rénovation des trottoirs et des voiries dégradées : diagnostic complet, plan de rénovation priorisé (abords écoles, quartiers seniors, zones PMR). Premiers trottoirs rénovés mois 9. Objectif : des trottoirs praticables partout.`,
  141: `Déployer des navettes municipales de proximité : lignes courtes reliant les quartiers aux équipements (écoles, mairie, marchés, centres de soins). Fréquence adaptée. Réservation possible pour les seniors et PMR.`,
  142: `Assurer l'accessibilité universelle des transports : arrêts accessibles PMR, information adaptée, signalétique claire. Coordination avec les opérateurs de transport.`,
  143: `Publier un bilan annuel des mobilités : km de pistes cyclables créées, trottoirs rénovés, fréquentation des navettes, évolution de la part modale vélo/marche/TC. Ajustements continus.`,
  144: `Renforcer la Maison des Associations : lieu central d'accompagnement administratif et logistique, espace de répétition/création/transmission, mise en réseau des associations. Point d'ancrage citoyen et intergénérationnel.\n\nNouvelle Maison des Associations prévue aux Tilleuls dans le cadre de la rénovation du quartier.`,
  145: `Simplifier et rendre transparentes les procédures de subventions aux associations : critères publiés, formulaires allégés, décisions motivées, suivi des résultats. Accompagnement vers l'autonomie financière.`,
  146: `Proposer des conventions pluriannuelles de partenariat aux associations structurantes : visibilité pluriannuelle, objectifs partagés, évaluation régulière. Stabilité pour les associations, exigence pour la collectivité.`,
  147: `Créer un fonds municipal pour l'innovation associative : financement de projets innovants portés par les associations locales, appels à projets thématiques, accompagnement méthodologique.`,
  148: `Développer une programmation culturelle de proximité dans tous les quartiers : spectacles locaux (théâtre, musique, danse, arts de rue), initiatives associatives, projets impliquant les jeunes. L'activité culturelle devient un standard du quotidien.\n\nÀ la ZAC de la Molette : arène à ciel ouvert avec programmation hebdomadaire — chaque samedi, un pays à l'honneur (danses, musiques, gastronomie, artisanat).`,
  149: `Lancer un festival culturel et cinématographique annuel : programmation ambitieuse, cinéma en plein air gratuit à l'arène, concerts, événements culturels tout au long de l'année. Abonnements cinéma négociés pour les jeunes.`,
  150: `Soutenir les pratiques artistiques amateurs : espaces de répétition, ateliers, accompagnement, scènes ouvertes. Chaque habitant qui le souhaite peut pratiquer un art dans de bonnes conditions.`,
  151: `Rénover les équipements culturels de la ville et déployer un Bibliobus 2.0 : bibliothèque itinérante moderne dans les quartiers éloignés, offre numérique, animations hors les murs.`,
  152: `Mettre en place un Pass'Sport & Culture : tarification sociale pour accéder aux activités sportives et culturelles de la ville. Aucun enfant ne doit renoncer à une activité faute de moyens.`,
  153: `Déployer un plan « Savoir nager » : chaque enfant du Blanc-Mesnil doit savoir nager avant l'entrée au collège. Sessions encadrées, créneaux dédiés, transport vers les piscines organisé.`,
  154: `Rénover, entretenir et créer des équipements sportifs : gymnases, terrains, city stades, piscines. Diagnostic de l'existant, plan pluriannuel, priorité aux quartiers sous-équipés.`,
  155: `Appliquer une tarification sociale pour toutes les activités sportives et culturelles municipales : sport, musique, danse, arts plastiques. Chaque famille paie selon ses moyens.`,
  156: `Déployer un « Bus de la mobilité » : véhicule itinérant proposant information sur les droits, aide aux démarches, orientation vers les dispositifs de mobilité. Présence dans les quartiers les plus éloignés des services.`,
  157: `Développer le sport-santé : activités physiques adaptées pour les seniors, les personnes en situation de handicap, les patients atteints de maladies chroniques. Partenariat avec la maison de santé et les associations sportives.`,
  158: `Valoriser le bénévolat : reconnaissance officielle (certificats, événements), parcours citoyen pour les jeunes, mise en valeur des bénévoles dans la communication municipale. Toute personne le pouvant contribue à la vie de la cité.`,
  159: `Organiser « Blanc-Mesnil Plage » : événement estival convivial (activités nautiques, sportives, culturelles, détente) accessible à tous. Animation du territoire pendant les vacances d'été.`,
  160: `Développer les épiceries sociales et solidaires : accès à des produits de qualité à prix réduit, lutte contre le gaspillage alimentaire, lien social. Implantation dans les quartiers prioritaires.`,
  161: `Publier un bilan annuel culture, sport et vie associative : nombre d'associations conventionnées, Pass'Sport distribués, fréquentation des équipements, satisfaction des usagers.`,
  162: `Ouvrir une Maison des Seniors : lieu de vie, d'activités et de rencontre dédié aux personnes âgées. Activités sociales, culturelles, sportives adaptées, ateliers pratiques, lien intergénérationnel.`,
  163: `Proposer des activités seniors accessibles avec une tarification adaptée aux revenus : sport-santé, ateliers mémoire, sorties culturelles, activités manuelles. Aucun senior ne doit renoncer faute de moyens.`,
  164: `Renforcer les liens intergénérationnels : projets communs entre jeunes et seniors (ateliers de transmission, aide informatique, jardinage partagé, activités culturelles). Privilégier les lieux intergénérationnels plutôt que les structures exclusivement seniors.`,
  165: `Mettre en place un programme municipal de lutte contre l'isolement des personnes âgées : repérage par les voisins, les commerçants, les facteurs, visites régulières, appels téléphoniques, activités de quartier.`,
  166: `Soutenir le maintien à domicile des personnes âgées : adaptation du logement, aide ménagère, portage de repas, téléassistance. Coordination avec les services sociaux et les professionnels de santé.`,
  167: `Assurer l'accessibilité renforcée de tous les bâtiments municipaux : rampes, ascenseurs, signalétique adaptée, places réservées. Objectif : 100 % des bâtiments municipaux accessibles.`,
  168: `Élaborer un plan « Ville inclusive » pour les personnes en situation de handicap : accessibilité des voiries, des transports, des services numériques, de l'emploi. Plan d'actions concret avec calendrier.`,
  169: `Nommer un référent municipal handicap : interlocuteur unique pour les personnes en situation de handicap et leurs familles. Coordination des actions municipales, suivi des engagements, médiation.`,
  170: `Garantir un accès prioritaire aux équipements et services municipaux pour les personnes en situation de handicap : créneaux dédiés, tarifs adaptés, accompagnement personnalisé.`,
  171: `Soutenir les aidants de personnes dépendantes : reconnaissance, information, solutions de répit (accueil de jour, aide temporaire), groupes de parole, prévention de l'épuisement.`,
  172: `Développer l'habitat adapté : logements conçus ou aménagés pour les personnes en situation de handicap et les seniors. Partenariat avec les bailleurs sociaux. Offre identifiée et accessible.`,
  173: `Structurer des projets intergénérationnels : colocation solidaire (seniors/étudiants), ateliers de transmission de savoirs, jardins partagés intergénérationnels. Le lien entre générations comme politique publique.`,
  174: `Lutter contre la fracture numérique des seniors : accompagnement humain en mairie, en bibliothèque et en maison de quartier. Ateliers pratiques, tutoriels vidéo, aide individuelle. Personne n'est exclu des services numériques.`,
  175: `Encourager la participation des seniors à la vie locale : conseils de quartier, bénévolat, transmission de savoirs, activités associatives. Les seniors comme ressource pour la communauté, pas seulement comme public à accompagner.`,
  176: `Publier un bilan annuel autonomie et inclusion : seniors suivis, accessibilité des bâtiments, satisfaction des usagers, projets intergénérationnels réalisés. Évaluation et ajustement.`,
  177: `Développer des jardins partagés dans chaque quartier : parcelles cultivables accessibles à tous, animation par des jardiniers urbains, lien social, production alimentaire locale. Outil de verdissement et de cohésion.`,
  178: `Soutenir les collectifs de jardiniers urbains : mise à disposition de terrains, fourniture de matériel, formation, mise en réseau. Valoriser les initiatives citoyennes en faveur de la nature en ville.`,
  179: `Lancer un plan municipal de végétalisation ambitieux : identification des sites prioritaires (îlots de chaleur, cours d'écoles, parkings), plantations d'arbres, désimperméabilisation des sols. Premières plantations mois 9.\n\nObjectif : +5 000 m² végétalisés sur le mandat.`,
  180: `Préserver les espaces verts existants : protection dans le PLU, entretien renforcé, interdiction de construire sur les espaces de respiration. Le vert ne se sacrifie pas.`,
  181: `Rendre les écoles et les équipements municipaux écoresponsables : gestion de l'énergie, tri des déchets, potagers pédagogiques, matériaux durables dans les rénovations.`,
  182: `Créer une ferme pédagogique sur le territoire : lieu d'éducation à la nature, aux animaux et à l'alimentation pour les enfants et les familles. Partenariat avec les écoles.`,
  183: `Sensibiliser à la transition écologique : écogestes, ateliers pratiques, campagnes de communication, événements (semaine du développement durable, fête de la nature). Éducation populaire environnementale.`,
  184: `Lutter contre les nuisances environnementales : bruit (trafic, chantiers), pollution de l'air (monitoring), dépôts sauvages (verbalisation + nettoyage). Signalement facilité via les ENQ.`,
  185: `Mettre en place une gestion responsable de l'eau : récupération d'eau de pluie dans les équipements publics, désimperméabilisation progressive, sensibilisation à la consommation sobre.`,
  186: `Mobiliser les citoyens pour la propreté : objectifs par quartier, opérations collectives régulières, incitation (réduction TEOM conditionnée), lutte contre les dépôts sauvages, verbalisation systématique des récidivistes.`,
  187: `Développer l'économie circulaire locale : ateliers « apprendre à réparer », espaces d'échange/dons/réemploi, brocantes de quartier, plateforme locale d'échange de meubles et équipements. Réduire les déchets, créer du lien.`,
  188: `Élaborer un plan municipal d'adaptation climatique : îlots de fraîcheur, végétalisation, gestion de l'eau, bâtiments bioclimatiques. Intégration systématique du changement climatique dans tous les projets urbains.`,
  189: `Promouvoir les circuits courts alimentaires : marché de producteurs locaux, partenariat avec les AMAP, approvisionnement de la cantine scolaire en produits locaux et de saison.`,
  190: `Créer un observatoire local de l'environnement : suivi de la qualité de l'air, de la biodiversité, des surfaces végétalisées, des déchets par quartier. Publication trimestrielle. Pilotage de la politique écologique par la donnée.`,
  191: `Publier un bilan annuel écologique : surface végétalisée, volume de déchets/habitant, indice de propreté, consommation énergétique des bâtiments publics. Transparence et trajectoire vérifiable.`,
  192: `Intégrer le bien-être animal dans les politiques municipales : gestion des animaux errants, stérilisation, partenariat avec les associations de protection animale, sensibilisation à la responsabilité des propriétaires.`,
  193: `Renforcer la protection animale : lutte contre l'abandon et la maltraitance, convention avec la SPA ou équivalent local, refuges et familles d'accueil, sensibilisation dans les écoles.`,
  194: `Rédiger et adopter un Plan Communal de Sauvegarde (PCS) : document opérationnel couvrant les risques climatiques, sanitaires, industriels et sociaux. Aligné sur le dispositif ORSEC départemental, interopérable avec les plans du SDIS 93 et de l'État.\n\nPCS adopté en conseil municipal mois 9. Testé annuellement par exercice.`,
  195: `Créer un Poste de Commandement Communal (PCC) : lieu d'activation immédiate en cas de crise, chaîne de décision claire, outils de communication, coordonnées à jour. Objectif : activation < 2h. Exercice de déclenchement au moins une fois par an.`,
  196: `Renforcer les plans canicule et grand froid : repérage anticipé des personnes vulnérables, activation de lieux d'accueil climatisés/chauffés, distribution d'eau, coordination CCAS + associations + police municipale.`,
  197: `Créer une Réserve Communale de Sécurité Civile (RCSC) : citoyens volontaires formés aux premiers secours et à l'assistance en cas de crise. Exercices réguliers. RETEX systématique après chaque exercice ou crise réelle.`,
  198: `Élaborer un plan de continuité des services publics essentiels : eau, aide sociale, sécurité, information en cas de crise majeure (pandémie, catastrophe naturelle, panne électrique). Chaque service sait fonctionner en mode dégradé.`,
  199: `Former les élus et les agents municipaux à la gestion de crise : exercices, simulations, procédures, communication de crise. Chaque responsable sait quoi faire et qui contacter en situation d'urgence.`,
  200: `Rédiger et distribuer un Document d'Information Communal sur les Risques Majeurs (DICRIM) à chaque foyer : risques identifiés, consignes de sécurité, numéros d'urgence. Mis à jour annuellement (cadre légal : articles L. 125-2 et R. 125-11 du Code de l'environnement).`,
  201: `Déployer des budgets participatifs renforcés : enveloppe dédiée, plateforme de vote citoyen, processus transparent (dépôt → instruction → suivi → réalisation). Le premier budget participatif est voté par les habitants dès le mois 12.\n\nLes habitants décident directement de l'allocation d'une part du budget d'investissement.`,
  202: `Doter les conseils de quartier de moyens réels : budget propre, droit de saisine, réunions trimestrielles minimum, fonctionnement hybride (numérique + présentiel). Les conseils sont des lieux de décision, pas de consultation cosmétique.`,
  203: `Déployer une plateforme numérique de participation : espace central regroupant budgets participatifs, interpellations citoyennes, suivi des engagements, consultations. Interface simple, accessible à tous.`,
  204: `Organiser des consultations citoyennes régulières sur les sujets structurants : urbanisme, mobilités, école, sécurité. Méthodologies variées (en ligne, en présentiel, ateliers). Résultats publiés et pris en compte explicitement.`,
  205: `Assurer une maîtrise durable des dépenses de fonctionnement : revue systématique des postes de dépenses, suppression des gaspillages, optimisation des achats. Le mandat s'achève avec des comptes sains et un budget de fonctionnement maîtrisé.`,
  206: `Rechercher activement les financements externes : État (DSIL, DETR), Région IDF, Métropole du Grand Paris, Union Européenne (FSE+), ANRU, ADEME, ANCT, mécénat. Chaque projet identifie ses sources de financement externes avant engagement.`,
  207: `Donner la priorité à l'investissement utile : chaque euro investi doit produire un résultat mesurable pour les habitants. Pas de dépenses de prestige, pas de projets sans bénéfice prouvé. Évaluation coût/bénéfice systématique.`,
  208: `Commander un audit financier externe indépendant dès le mois 0 (J7). Rapport livré à mois 4, publié intégralement. Évaluation de la situation financière héritée, recommandations. Second audit à mi-mandat.\n\nObjectif : recommandations suivies à ≥ 80 %.`,
  209: `Lutter contre le gaspillage public : identifier et supprimer les dépenses inutiles, les doublons, les prestations sous-utilisées. Revue annuelle avec publication des économies réalisées.`,
  210: `Adopter une charte de transparence administrative : délais de réponse garantis, traçabilité des décisions, publication proactive des informations d'intérêt public. L'administration est au service des habitants, pas l'inverse.`,
  211: `Mettre en place une évaluation permanente des politiques publiques : indicateurs accessibles, suivi public, ajustements continus. Chaque politique est évaluée par ses résultats, pas par ses intentions.`,
  212: `Mettre en place la prime de Complément Indemnitaire Annuel (CIA) pour les agents municipaux : reconnaissance de l'engagement individuel, critères objectifs, évaluation annuelle. Motivation et valorisation des agents.`,
  213: `Publier un rapport de fin de mandat complet, détaillé et argumenté : bilan financier, bilan par chapitre, mesures livrées/non livrées, indicateurs de résultat, recommandations pour le prochain mandat. Transparence intégrale en sortie de mandat.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA: Pouvoir d'achat links
// ─────────────────────────────────────────────────────────────────────────────
const POUVOIR_ACHAT_LINKS = {
  17: 'Loyer / crédit immobilier — Réduction des charges par la rénovation ; stabilité fiscale.',
  21: 'Charges (gaz, électricité, eau) — Rénovation énergétique ; incitation à une consommation sobre.',
  77: 'Charges (gaz, électricité, eau) — Plan municipal de lutte contre la précarité énergétique.',
  188: 'Charges (gaz, électricité, eau) — Adaptation climatique et gestion de l\'énergie.',
  78: 'Alimentation — Achats groupés via le service cantine (prix sous le marché, sans grande distribution).',
  90: 'Alimentation et restauration scolaire — Cantine de qualité à tarifs adaptés, gratuite pour les plus vulnérables.',
  189: 'Alimentation — Circuits courts alimentaires, marché de producteurs.',
  148: 'Vacances / loisirs — Programmation culturelle abondante, cinéma en plein air gratuit à l\'arène.',
  149: 'Vacances / loisirs — Festival culturel et cinématographique.',
  152: 'Vacances / loisirs — Pass\'Sport & Culture, tarification sociale.',
  159: 'Vacances / loisirs — Blanc-Mesnil Plage.',
  131: 'Transports en commun — Remboursement Imagin\'R pour les mineurs.',
  132: 'Transports en commun — Aide à la mobilité pour les publics fragiles.',
  133: 'Transports en commun — Négociation pour améliorer l\'offre.',
  47: 'Assurance / mutuelle — Mutuelle communale à tarifs négociés.',
  138: 'Carburant — Cartographie des prix à la pompe sur le site de la ville.',
  135: 'Voiture — Ville accessible sans voiture ; mobilités douces.',
  141: 'Voiture — Navettes municipales de proximité.',
  97: 'Habillement — Tenues scolaires simples, achats groupés par la ville.',
  187: 'Équipement / meubles — Économie circulaire locale, espaces d\'échange.',
  144: 'Bénévolat / vie communautaire — Maison des associations, vie de quartier.',
  158: 'Bénévolat / vie communautaire — Valorisation du bénévolat.',
  201: 'Services financiers — Éducation financière, budget participatif.',
  155: 'Restauration / loisirs — Tarification sociale des activités.',
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA: Cent jours actions
// ─────────────────────────────────────────────────────────────────────────────
const CENT_JOURS = {
  4: 'J1 — Installation du maire et adoption de la charte éthique des élus en conseil municipal.',
  208: 'J7 — Commande de l\'audit financier externe.',
  13: 'J15 — Publication des critères d\'attribution des logements sociaux.',
  1: 'J30 — PSE en ligne : les 213 mesures visibles avec statut, responsable, dates.',
  5: 'J30 — Lancement de la consultation citoyenne : « C\'est quoi une mesure réussie pour vous ? »',
  3: 'J30 — Budget pédagogique publié sur le site de la ville.',
  31: 'J30 — Premières patrouilles de proximité déployées.',
  47: 'J45 — Lancement de la mutuelle communale — appel à candidatures.',
  121: 'J45 — Clauses d\'insertion intégrées dans les premiers marchés publics.',
  131: 'J60 — Dispositif Imagin\'R (remboursement transports mineurs) opérationnel.',
  22: 'J60 — Cellule habitat indigne activée.',
  88: 'J75 — Audit campus trilingue lancé — comité de pilotage installé.',
  15: 'J90 — Guichet unique du logement ouvert.',
  75: 'J90 — Guichet social unique opérationnel.',
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Get chapter for a given measure id
// ─────────────────────────────────────────────────────────────────────────────
function getChapter(id) {
  return CHAPITRES.find(ch => id >= ch.range[0] && id <= ch.range[1]);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: Process each file
// ─────────────────────────────────────────────────────────────────────────────
const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).sort();

let enriched = 0;

for (const file of files) {
  const filePath = path.join(CONTENT_DIR, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Parse frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;

  const frontmatter = fmMatch[1];
  const idMatch = frontmatter.match(/^id:\s*(\d+)/m);
  if (!idMatch) continue;
  const id = parseInt(idMatch[1], 10);

  const titreMatch = frontmatter.match(/^titre:\s*"(.+)"/m);
  const titre = titreMatch ? titreMatch[1] : `Proposition ${id}`;

  const chapter = getChapter(id);
  const fiche = FICHES_A[id];
  const description = DESCRIPTIONS[id];
  const pouvoirAchat = POUVOIR_ACHAT_LINKS[id];
  const centJour = CENT_JOURS[id];

  // Build enriched body
  let body = `# ${titre}\n\n`;
  body += `> Proposition issue du programme municipal pour la ville du Blanc-Mesnil.\n\n`;

  // Category
  if (chapter) {
    body += `## Catégorie\n\n`;
    body += `${chapter.titre}\n\n`;
  }

  // Vision
  if (chapter && chapter.vision) {
    body += `## Vision\n\n`;
    body += `${chapter.vision}\n\n`;
  }

  // Description
  body += `## Description\n\n`;
  if (description) {
    body += `${description}\n\n`;
  } else {
    body += `À compléter par la communauté.\n\n`;
  }

  // Fiche A (detailed)
  if (fiche) {
    body += `## Fiche détaillée\n\n`;
    body += `**Priorité** : A — Impact immédiat (0–12 mois)\n\n`;
    body += `| | |\n|---|---|\n`;
    body += `| **Besoin identifié** | ${fiche.besoin} |\n`;
    body += `| **Action** | ${fiche.action} |\n`;
    body += `| **Livrable** | ${fiche.livrable} |\n`;
    body += `| **Indicateurs (KPI)** | ${fiche.kpi} |\n`;
    body += `| **Dépendances** | ${fiche.dependances} |\n`;
    body += `| **Coût estimé** | ${fiche.cout} |\n\n`;
  }

  // 100 jours
  if (centJour) {
    body += `## Calendrier — 100 premiers jours\n\n`;
    body += `${centJour}\n\n`;
  }

  // Pouvoir d'achat
  if (pouvoirAchat) {
    body += `## Impact pouvoir d'achat\n\n`;
    body += `${pouvoirAchat}\n\n`;
  }

  // Mise en œuvre (from chapter)
  if (chapter && chapter.miseEnOeuvre) {
    body += `## Mise en œuvre\n\n`;
    body += `${chapter.miseEnOeuvre}\n\n`;
  }

  // Discussion
  body += `## Discussion\n\n`;
  body += `Participez à la discussion sur cette proposition via Pol.is (lien à venir).\n`;

  // Rebuild file
  const newContent = `---\n${frontmatter}\n---\n\n${body}`;
  fs.writeFileSync(filePath, newContent, 'utf-8');
  enriched++;
}

console.log(`✅ ${enriched} propositions enrichies sur ${files.length} fichiers.`);
