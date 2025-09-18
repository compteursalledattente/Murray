import { signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, getDocs, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { db, auth } from './config.js'; // Assurez-vous que ce chemin est correct

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Utilisateur est connecté, afficher le contenu
        document.body.classList.remove('hidden');
        const userEmail = user.email;
        const userDoc = doc(db, 'Techniciens', userEmail); // Utilisez userEmail ici
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const isAdmin = userData.isAdmin;

            // Afficher/Masquer la barre de navigation en fonction des droits
            const navBar = document.querySelector('.nav-bar'); // Assurez-vous que la classe correspond à votre barre de navigation
            if (isAdmin) {
                navBar.classList.remove('hidden');
            } else {
                navBar.classList.add('hidden');
            }
        } else {
            console.log("Aucun document trouvé pour l'utilisateur.");
        }

        // Retirer "@gmail.com" de l'adresse e-mail
        let displayEmail = userEmail.split("@")[0];
        // Met à jour le texte dans l'élément HTML
        document.getElementById('userEmail').textContent = displayEmail;
    } else {
        // Utilisateur n'est pas connecté, rediriger vers la page de connexion ou afficher un message
        alert('Vous êtes déconnecté');
        // Optionnel: Redirection vers une page de connexion
        window.location.href = "login.html";
    }
});


async function logout() {
    try {
        await signOut(auth);
        window.location.href = "login.html"; // Rediriger vers la page de connexion
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        alert('Erreur lors de la déconnexion. Veuillez réessayer.');
    }
}

// Expose la fonction logout à l'extérieur si nécessaire
window.logout = logout;
