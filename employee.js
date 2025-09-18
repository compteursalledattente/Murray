// Importer les fonctions de Firebase Auth et Firestore depuis les URL spécifiées
import { getAuth, createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, getDocs, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { db, auth } from './config.js'; // Assurez-vous que ce chemin est correct


// Fonction pour appeler le prochain usager
async function callNextUser(tempsPause) {
    const counterNumber = document.getElementById('counterNumber1').value;
    const roomNumber = document.getElementById('roomNumber1').value;

    if (counterNumber && roomNumber) {
        const docRef = doc(db, 'waitingRoom', 'current');
        const docSnap = await getDoc(docRef);

        let currentData = docSnap.exists() ? docSnap.data() : { number: 0, oldNumbers: [], oldTimes: [], disponible: 0 };

        let newNumber = currentData.number >= 99 ? 0 : currentData.number + 1;
        if (currentData.counter == "?") newNumber = currentData.number;

        let newOldNumbers = currentData.oldNumbers;
        let newOldTimes = currentData.oldTimes;

        if (currentData.counter != "?") {
            newOldNumbers.unshift(`${currentData.number.toString().padStart(2, '0')} - ${currentData.room} - ${currentData.counter}`);
            newOldTimes.unshift(Date.now());
        }

        if (newOldNumbers.length > 5) newOldNumbers = newOldNumbers.slice(0, 5);
        if (newOldTimes.length > 5) newOldTimes = newOldTimes.slice(0, 5);

        await setDoc(docRef, {
            number: newNumber,
            counter: counterNumber,
            room: roomNumber,
            oldNumbers: newOldNumbers,
            oldTimes: newOldTimes,
        }, { merge: true });
    
          // Récupérez l'adresse courriel de l'usager connecté
            const userEmail = document.getElementById('userEmail').textContent;

            const userDocRef = doc(db, 'userCalls', userEmail);
            const userDocSnap = await getDoc(userDocRef);

let userData = userDocSnap.exists() ? userDocSnap.data() : { number: 0, lastTime: 0, totalTime: 0 };

let userlastTime = userData.lastTime;
let userOldNumber = userData.number;
let usertotalTime = userData.totalTime;
let tempsNow = Date.now();
let userMoyenne = -1;

// Vérifie si le temps écoulé est supérieur à 25 minutes (25 * 60 * 1000 millisecondes)
if (tempsNow - userlastTime > tempsPause * 60 * 1000) {
    // Vérifie si la date de lastTime est différente de la date actuelle
    if (new Date(userlastTime).toDateString() !== new Date(tempsNow).toDateString()) {
        userlastTime = tempsNow;
        userOldNumber = 1;
        userMoyenne = -1;
        usertotalTime = 0;
    } else {
        usertotalTime = usertotalTime + (usertotalTime/userOldNumber);
        userOldNumber = userOldNumber + 1;
        userlastTime = tempsNow;
        userMoyenne = usertotalTime / (userOldNumber-1);
    }
} else {
    usertotalTime = usertotalTime + (tempsNow - userlastTime);
    userOldNumber = userOldNumber + 1;
    userlastTime = tempsNow;
    userMoyenne = usertotalTime / (userOldNumber-1);
}

// Met à jour le document dans Firestore
await setDoc(userDocRef, {
    lastTime: userlastTime,
    number: userOldNumber,
    totalTime: usertotalTime
}, { merge: true });


            
        const formattedNumber = formatNumberEmployee(newNumber);
        document.getElementById('counterNumberEmployee').textContent = formattedNumber;
        setGaugeValuePersonel(userMoyenne);
        document.getElementById('counterTotalQuotidien').textContent = userOldNumber;
    }
}

async function PreviousNumber() {
    const docRef = doc(db, 'waitingRoom', 'current');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        let currentNumberA = docSnap.data().number;
        currentNumberA = (currentNumberA - 1 + 100) % 100; // Assure que le numéro reste entre 0 et 99

        await setDoc(docRef, {
            number: currentNumberA,
            counter: "?",
            room: "?",
        }, { merge: true });
    }
}

async function nextNumber() {
    const docRef = doc(db, 'waitingRoom', 'current');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        let currentNumberA = docSnap.data().number;
        currentNumberA = (currentNumberA + 1 + 100) % 100; // Assure que le numéro reste entre 0 et 99

        await setDoc(docRef, {
            number: currentNumberA,
            counter: "?",
            room: "?",
        }, { merge: true });
    }
}

async function resetCounter() {
    await setDoc(doc(db, 'waitingRoom', 'current'), {
        number: 0,
        counter: "?",
        room: "?",
        oldNumbers: [],
        oldTimes: [],
    });
}

function formatNumberEmployee(num3) {
    return num3.toString().padStart(2, '0');
}

function setGaugeValuePersonel(value) {
    const needle = document.getElementById('needle');
    const minValue = document.getElementById('highYellow').value - 5 * (document.getElementById('highYellow').value - document.getElementById('lowYellow').value) || 5;
    const maxValue = document.getElementById('highYellow').value + 5 * (document.getElementById('highYellow').value - document.getElementById('lowYellow').value) || 10;
    let value1 = 0;

    
    // Si la valeur est égale à -1, on cache l'aiguille
    if (value === -1) {
        needle.style.visibility = 'hidden';
        return;
    } else {
        needle.style.visibility = 'visible';
    }

    value1 = value/(60 * 1000);
    
    // Limite la valeur à la plage [5, 10]
    if (value1 < minValue) value1 = minValue;
    if (value1 > maxValue) value1 = maxValue;

    // Calcul de la rotation pour la nouvelle plage de valeurs
    const rotation = ((value1 - minValue) / (maxValue - minValue)) * 180 - 90;
    needle.style.transform = `rotate(${rotation}deg)`;
}


async function displayCalls() {
    const userCallsRef = collection(db, 'userCalls');
    const q = query(userCallsRef);

    getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const listItem = document.createElement('li');
            listItem.textContent = `Numéro: ${data.number}, Durée totale: ${data.totalTime} mins`;
            document.getElementById('callsList').appendChild(listItem);
        });
    }).catch((error) => {
        console.error("Erreur lors de la récupération des appels: ", error);
    });
}

async function getTechnicians() {
    // Référence à la collection 'Techniciens'
    const techniciansRef = collection(db, 'Techniciens');

    // Création de la requête avec une condition sur le champ 'Permission'
    const q = query(techniciansRef, where('Permission', '==', true));

    // Récupération des documents dans la collection avec la condition
    const snapshot = await getDocs(q);

    const userList = document.getElementById('userList2');
	
    // Vérifie s'il y a des documents
    if (snapshot.empty) {
	    userList.innerHTML = '';
      console.log('Aucun technicien trouvé.');
      return [];
    }

    // Création du tableau pour stocker les données
    const technicians = [];

    // Parcours des documents et ajout des données au tableau
    snapshot.forEach(doc => {
      const data = doc.data();
      technicians.push({
        email: doc.id, // Utilisation de l'ID du document comme email
        isAdmin: data.isAdmin // Champ 'isAdmin' dans le document
      });
    });

    // Affichage des techniciens dans la liste
    
    userList.innerHTML = '';
    technicians.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `${user.email} - ${user.isAdmin ? 'Admin' : ' '} <button onclick="deleteUser2('${user.email}')">Désactiver</button>`;
        userList.appendChild(li);
    });
}

async function getTechniciansFalse() {
    // Référence à la collection 'Techniciens'
    const techniciansRef = collection(db, 'Techniciens');

    // Création de la requête avec une condition sur le champ 'Permission'
    const q = query(techniciansRef, where('Permission', '==', false));

    // Récupération des documents dans la collection avec la condition
    const snapshot = await getDocs(q);

	const userList = document.getElementById('userList3');
	
    // Vérifie s'il y a des documents
    if (snapshot.empty) {
	    userList.innerHTML = '';
      console.log('Aucun technicien trouvé.');
      return [];
    }

    // Création du tableau pour stocker les données
    const technicians = [];

    // Parcours des documents et ajout des données au tableau
    snapshot.forEach(doc => {
      const data = doc.data();
      technicians.push({
        email: doc.id, // Utilisation de l'ID du document comme email
        isAdmin: data.isAdmin // Champ 'isAdmin' dans le document
      });
    });

    // Affichage des techniciens dans la liste
    
    userList.innerHTML = '';
    technicians.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `${user.email} - ${user.isAdmin ? 'Admin' : ' '} <button onclick="activation('${user.email}')">Activer</button>`;
        userList.appendChild(li);
    });
}



async function createUser2() {
    const email = document.getElementById('userEmail2').value + '@ssss.gouv.qc.ca';
    const password = document.getElementById('userPassword').value;
    const password2 = document.getElementById('userPassword2').value;
    const adminPassword = document.getElementById('adminPassword').value;
    const isAdmin1 = document.getElementById('userIsAdmin').checked;

    const errorMessageElement = document.getElementById('errorMessage'); // Assurez-vous d'avoir un élément pour afficher les messages d'erreur
    errorMessageElement.textContent = '';

    try {
        // Vérification du mot de passe de confirmation
        if (password !== password2) {
            throw new Error('Les mots de passe ne correspondent pas.');
        }

        // Re-authentification de l'administrateur
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, adminPassword);
        await reauthenticateWithCredential(user, credential);

        // Vérification des droits admin
        const userDoc = await getDoc(doc(db, 'Techniciens', user.email));
        if (!userDoc.exists() || userDoc.data().isAdmin !== true) {
            throw new Error('Droits administratifs insuffisants.');
        }



        // Ajout des informations dans Firestore
        const userRef = doc(db, 'Techniciens', email);
        await setDoc(userRef, {
            email: email,
            Permission: false,
            isAdmin: isAdmin1
        });

	            // Création de l'utilisateur
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
	    
        console.log('Utilisateur ajouté avec succès:', email);

        // Effacer les champs de texte
        document.getElementById('userEmail2').value = '';
        document.getElementById('userPassword').value = '';
        document.getElementById('userPassword2').value = '';
        document.getElementById('adminPassword').value = '';
        document.getElementById('userIsAdmin').checked = false;

        // Réinitialiser le message d'erreur
        errorMessageElement.textContent = '';

	    logout();

    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur:', error.message);
        errorMessageElement.textContent = `Erreur : ${error.message}`;
    }
}



async function deleteUser2(email) {
  try {
    // Référence au document de l'adresse courriel dans la collection Techniciens
    const docRef = doc(db, "Techniciens", email);

    // Mise à jour du champ Permission à false
    await updateDoc(docRef, {
      Permission: false
    });
    getTechnicians();
	getTechniciansFalse();
    console.log("Le champ 'Permission' a été mis à jour avec succès.");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du champ 'Permission':", error);
  }
}

async function activation(email) {
  try {
    // Référence au document de l'adresse courriel dans la collection Techniciens
    const docRef = doc(db, "Techniciens", email);

    // Mise à jour du champ Permission à false
    await updateDoc(docRef, {
      Permission: true
    });
    getTechnicians();
	  getTechniciansFalse();
    console.log("Le champ 'Permission' a été mis à jour avec succès.");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du champ 'Permission':", error);
  }
}

  async function fetchAndDisplayUserData() {
    const userCallsCollection = collection(db, "userCalls");
    const userCallsSnapshot = await getDocs(userCallsCollection);
    const userTableBody = document.getElementById("userTableBody");

	  userTableBody.innerHTML = "";
	  
    let totalSum = 0;
    let globalAverageSum = 0;
    let userCount = 0;

    userCallsSnapshot.forEach(doc => {
	const data = doc.data();
      const dernierefois = data.lastTime || 0;
	if (new Date(dernierefois).toDateString() == new Date(Date.now()).toDateString()) {
	const email = doc.id;
	let displayEmail = email.split("@")[0];
      const total = data.number || 0;
      let average = total !== 0 ? data.totalTime / total : 0;
	average = average/(60*1000);
	
      // Append data to the table
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${displayEmail}</td>
        <td>${total}</td>
        <td>${average.toFixed(2)}</td>
      `;
      userTableBody.appendChild(row);

      // Update totals for summary
      totalSum += total;
      globalAverageSum += average;
      userCount++;
	    };
    });

    // Calculate and display summary
    const globalAverage = userCount !== 0 ? globalAverageSum / userCount : 0;
    document.getElementById("totalSum").textContent = totalSum;
    document.getElementById("globalAverage").textContent = globalAverage.toFixed(2);
  }

async function afficherSettingsActifs() {
            try {
                // Récupération des documents Firestore
                const userSettingsDoc = await getDoc(doc(db, 'settings', 'userSettings'));

                if (userSettingsDoc.exists()) {
                    const userSettings = userSettingsDoc.data();
                    // Appliquer les bornes inférieures et supérieures
                    document.getElementById('borneInferieure').value = userSettings.basYellow;
                    document.getElementById('borneSuperieure').value = userSettings.hautYellow;

                    // Appliquer le temps de pause
                    const pauseGroupValue = userSettings.tempsPause;
                    document.querySelectorAll('input[name="pauseGroup"]').forEach(checkbox => {
                        checkbox.checked = (checkbox.id === `pause${pauseGroupValue}mins`);
                    });
                }

            } catch (error) {
                console.error("Erreur lors de la récupération des settings :", error);
            }
        }
async function changeSettings() {
    try {
	    document.getElementById('changesettingsmessage').textContent = "";
        // Lire les valeurs des checkboxes pour le temps de pause
        const pauseGroupChecked = Array.from(document.querySelectorAll('input[name="pauseGroup"]'))
            .find(checkbox => checkbox.checked)?.id.replace('pause', '').replace('mins', '');

        // Lire les bornes
        const borneInferieure = document.getElementById('borneInferieure').value;
        const borneSuperieure = document.getElementById('borneSuperieure').value;

        // Mettre à jour les paramètres dans Firestore
        await updateDoc(doc(db, 'settings', 'userSettings'), {
            tempsPause: pauseGroupChecked,
            basYellow: parseFloat(borneInferieure),
            hautYellow: parseFloat(borneSuperieure)
        });

        console.log("Paramètres mis à jour avec succès !");
	    document.getElementById('changesettingsmessage').textContent = "Paramètres mis à jour avec succès !";
    } catch (error) {
        console.error("Erreur lors de la mise à jour des paramètres :", error);
	    document.getElementById('changesettingsmessage').textContent = "Erreur lors de la mise à jour des paramètres :";
    }
}

async function Desactivation() {
	const nextButton = document.querySelector('.button5');
	let ouiounon = false;
	if (nextButton.classList.contains('button-disabled')) {
		ouiounon = true;
		nextButton.classList.remove('button-disabled');
	} else {
		ouiounon = false
		nextButton.classList.add('button-disabled');
	}

    await setDoc(doc(db, 'Activation', 'vigieActivation'), {
        active1: ouiounon
    });
}


onSnapshot(doc(db, 'Activation', 'vigieActivation'), (doc) => {
    if (doc.exists) {
        const data = doc.data();
	    if (data.active1 == true) {
		    bouttonOn();
	    } else {
		    bouttonOff();
	    }
    }
});

function bouttonOff() {
    const nextButton = document.querySelector('.button1');
    if (nextButton) {
        nextButton.disabled = true;
        nextButton.classList.add('button-disabled');
    }
}

function bouttonOn() {
    const nextButton = document.querySelector('.button1');
    if (nextButton) {
        nextButton.disabled = false;
        nextButton.classList.remove('button-disabled');
    } 
}


export { callNextUser, displayCalls, getTechnicians, createUser2, deleteUser2, getTechniciansFalse, activation, fetchAndDisplayUserData, afficherSettingsActifs, changeSettings, bouttonOn, bouttonOff, Desactivation };
// Attacher les fonctions au contexte global pour qu'elles soient accessibles depuis le HTML
window.callNextUser = callNextUser;
window.resetCounter = resetCounter;
window.PreviousNumber = PreviousNumber;
window.displayCalls = displayCalls;
window.getTechnicians = getTechnicians;
window.createUser2 = createUser2;
window.deleteUser2 = deleteUser2;
window.getTechniciansFalse = getTechniciansFalse;
window.activation = activation;
window.fetchAndDisplayUserData = fetchAndDisplayUserData;
window.afficherSettingsActifs = afficherSettingsActifs;
window.changeSettings = changeSettings;
window.nextNumber = nextNumber;
window.Desactivation = Desactivation;
window.bouttonOff = bouttonOff;
window.bouttonOn = bouttonOn;
