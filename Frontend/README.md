# Frontend SmartFarmer

## Chatbot IA (Chatbox)

Composant: `src/components/chatbox.vue`
Service: `src/services/ai.js`

### Utilisation

```vue
<!-- Exemple dans une page -->
<template>
  <chatbox />
</template>
<script setup>
import Chatbox from '@/components/chatbox.vue';
</script>
```

### Modes
- Mock (par défaut) : réponses simulées. Aucune config nécessaire.
- OpenAI : définir variables dans un fichier `.env.local` (ne pas committer).
- Groq (recommandé gratuit) : définir variables dans un fichier `.env.local` (ne pas committer).

```
# Activer Groq
VITE_AI_PROVIDER=groq
VITE_GROQ_API_KEY=grq_xxxxxxxxxxxxxxxxx

# Ou activer OpenAI
# VITE_AI_PROVIDER=openai
# VITE_OPENAI_API_KEY=sk-... # votre clé
```

Sans clé valide, fallback automatique vers mock.

### Format messages
Tableau d'objets: `{ role: 'user'|'assistant'|'system', content: 'texte' }`.

### Personnalisation rapide
- Suggestions: modifier `suggestions` dans `chatbox.vue`.
- Modèle OpenAI: changer param `model` dans `callOpenAI` (`ai.js`).
- Limite historique: constante `STORAGE_KEY` + slice(-80).

### Sécurité
Ne jamais exposer une clé dans un commit. Utiliser `.env.local` ignoré par Git.

### Améliorations futures
- Streaming réel (Server-Sent Events) backend proxy.
- Contexte localité: injecter dernières données pluie en message `system`.
- Bouton export conversation.
- Résumés automatiques longs fils.

### Documentation d'intégration rapide

1. **Installation des dépendances**:
   Assurez-vous d'avoir toutes les dépendances nécessaires installées. Exécutez la commande suivante dans votre terminal:
   ```bash
   npm install
   ```

2. **Configuration de l'environnement**:
   Créez un fichier `.env.local` à la racine de votre projet et ajoutez-y vos clés API OpenAI ou Groq. Par exemple:
   ```env
   # Activer Groq
   VITE_AI_PROVIDER=groq
   VITE_GROQ_API_KEY=grq_xxxxxxxxxxxxxxxxx

   # Ou activer OpenAI
   # VITE_AI_PROVIDER=openai
   # VITE_OPENAI_API_KEY=sk-... # Remplacez par votre clé API
   ```

3. **Utilisation du composant Chatbox**:
   Intégrez le composant `Chatbox` dans la page de votre choix. Voici un exemple d'utilisation:
   ```vue
   <template>
     <chatbox />
   </template>
   <script setup>
   import Chatbox from '@/components/chatbox.vue';
   </script>
   ```

4. **Modes de fonctionnement**:
   - En mode **Mock**, le chatbot fournira des réponses simulées. Aucune configuration supplémentaire n'est requise.
   - En mode **OpenAI**, assurez-vous d'avoir correctement configuré votre fichier `.env.local` avec vos clés API.
   - En mode **Groq**, activez-le dans le fichier `.env.local` et fournissez une clé API Groq valide.

5. **Personnalisation**:
   Adaptez le comportement du chatbot selon vos besoins:
   - Modifiez les suggestions directement dans le fichier `chatbox.vue`.
   - Changez le modèle utilisé par OpenAI en ajustant le paramètre `model` dans la fonction `callOpenAI` du fichier `ai.js`.
   - Pour limiter l'historique des messages, modifiez la constante `STORAGE_KEY` et appliquez un `slice(-80)` sur le tableau des messages.

6. **Sécurité**:
   Ne partagez jamais vos clés API publiquement. Utilisez le fichier `.env.local` pour stocker vos clés en toute sécurité. Ce fichier est automatiquement ignoré par Git grâce à la configuration de `.gitignore`.

7. **Améliorations futures**:
   Plusieurs améliorations sont envisagées pour le futur:
   - Implémentation d'un streaming réel via des événements envoyés par le serveur (Server-Sent Events) avec un proxy backend.
   - Injection des dernières données de pluie dans le message `system` pour un contexte de localité amélioré.
   - Ajout d'un bouton pour exporter la conversation.
   - Génération automatique de résumés pour les fils de conversation longs.

### Changer le modèle Groq
Dans `callGroq` (`ai.js`), modifier `model = 'llama-3.1-8b-instant'`.
Autres exemples: `llama-3.1-70b-versatile`, `mixtral-8x7b-32768`.

### Fallback
Si une erreur survient ou pas de clé => mock automatique.

## Chatbot IA Multi-fournisseurs

Le service `src/services/ai.js` gère plusieurs providers via un registre dynamique.

### Providers supportés
- mock (toujours disponible)
- groq (si `VITE_GROQ_API_KEY` présent)
- openai (si `VITE_OPENAI_API_KEY` présent)

### Variables d'environnement (.env.local)
```
# Activer Groq
VITE_GROQ_API_KEY=gsk_xxx
# Activer OpenAI
VITE_OPENAI_API_KEY=sk-xxx
```
(Aucune variable n'est nécessaire pour `mock`.)

### Sélection runtime
Dans l'UI du composant `chatbox.vue`, deux listes déroulantes permettent de choisir:
1. Provider
2. Modèle

La sélection est conservée dans localStorage (`sf_ai_runtime_v1`). Un message système apparaît à chaque changement.

### Extension d'un provider
Ajouter dans `PROVIDERS` (fichier `ai.js`):
```
newProvider: {
  label: 'Nom',
  available: () => !!import.meta.env.VITE_NEW_API_KEY,
  defaultModel: 'modele-par-defaut',
  models: ['modele-par-defaut','autre-modele'],
  call: (messages,{model,temperature}) => { /* retourner {role:'assistant', content} */ }
}
```

### Fallback
Si erreur ou provider indisponible => simulation mock annotée.

### Streaming
Actuellement: simulation côté front (`streamMockResponse`). Pour un vrai streaming SSE/WebSocket: implémenter un proxy backend qui relaie les tokens.

