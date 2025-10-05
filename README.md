# 🌾 SmartFarmer – Données NASA POWER

**SmartFarmer** est une application web interactive qui permet aux agriculteurs de visualiser les données climatiques issues de la NASA (API POWER) afin de mieux gérer leurs cultures. Elle fournit des informations sur les précipitations, les risques de sécheresse et d’inondation, et propose des conseils agricoles adaptés à la région sélectionnée.

L’application est multilingue grâce à l’intégration de Google Translate et utilise Vue 3 pour l’interactivité, Leaflet pour la cartographie et Chart.js pour la visualisation des données.

---

## 🔹 Fonctionnalités

* Carte interactive permettant de cliquer sur une zone pour récupérer les données météo.
* Graphique des précipitations quotidiennes sur 7 jours.
* Modal affichant :

  * Localisation exacte
  * Pluie quotidienne et moyenne sur 7 jours
  * Total mensuel estimé
  * Risques de sécheresse et d’inondation
  * Conseils agricoles personnalisés
* Changement dynamique de la langue de l’application (français, anglais, espagnol, allemand, etc.) via Google Translate API.
* Couleurs indiquant le niveau de risque (vert = normal, jaune = faible, rouge = élevé).

---

## 🔹 Technologies Utilisées

* **Vue 3** – Framework JavaScript pour l’interface utilisateur réactive.
* **Tailwind CSS** – Pour le design moderne et responsive.
* **Leaflet.js** – Pour la cartographie interactive.
* **Chart.js** – Pour la visualisation graphique des précipitations.
* **API NASA POWER** – Pour récupérer les données climatiques quotidiennes.
* **Google Translate API** – Pour traduire dynamiquement tout le contenu de l’application.

---

## 🔹 Installation et Exécution

1. **Cloner le dépôt :**

```bash
git clone https://github.com/ton-utilisateur/SmartFarmer.git
cd SmartFarmer
```

2. **Ouvrir le projet dans un navigateur :**
   Ouvrir `index.html` directement dans votre navigateur ou via un serveur local (ex: Live Server sur VSCode).

3. **Configurer l’API Google Translate :**

   * Obtenir une clé API sur [Google Cloud Console](https://console.cloud.google.com/).
   * Remplacer `YOUR_GOOGLE_API_KEY` dans le script `<script>` par votre clé.

4. **Utilisation :**

   * Sélectionner la langue dans le menu déroulant.
   * Cliquer sur une région de la carte pour récupérer les données météo.
   * Consulter le modal pour les détails et les conseils.

---

## 🔹 Structure du Projet

```
SmartFarmer/
│
├─ index.html       # Page principale avec Vue 3, Leaflet et Chart.js
├─ README.md        # Documentation du projet
└─ assets/          # Images ou ressources éventuelles
```

---

## 🔹 Personnalisation

* **Changer les dates de récupération des données :**
  Modifier les variables `start` et `end` dans la fonction `fetchNASAData(lat, lon)`.

* **Ajouter des langues :**
  Ajouter une option dans le `<select>` et la Google Translate API s’en occupera automatiquement.

* **Modifier les conseils agricoles :**
  Modifier la fonction `generateTips()` pour ajuster les messages selon vos besoins.

---

## 🔹 Captures d’écran

*(Ajouter ici des screenshots de la carte, du modal et du graphique)*

---

## 🔹 Auteurs

* **Israël Oriadé** – Développeur principal
* Projet inspiré par les données climatiques de la NASA et les besoins des agriculteurs.

---

## 🔹 Licence

Ce projet est **open-source** et peut être utilisé librement pour des projets éducatifs ou personnels.
