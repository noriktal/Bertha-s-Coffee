// -------------------Top bar options and all things global-------------------------

// New Game
const newGameBtn = document.getElementById("newGame");

function reload() {
	window.location.reload();
	localStorage.clear();
	if(firebase.auth().currentUser){
	db.collection("users").doc(firebase.auth().currentUser.uid).get()
	.then((doc) => {
		currentUserDiv.classList.remove("d-none");
		currentName.textContent = `${doc.data().username}`;
	})
	
	};
}


newGameBtn.addEventListener("click", reload);

//  DOM Variables

	//top-bar variables
const topbar = document.getElementById("top-bar");
const selectLevelDiv = document.getElementById("game-size-div");
const selectLevel = document.getElementById("game-size");
const recordShow = document.querySelector("#record");
const adminDiv = document.querySelector("#admin-div");
const background = document.createElement("div"); //"phantom element"

const usernameForm = document.querySelector("#username-form");
const usernameFormModal = document.querySelector("#username-form3");
const userTimeSpan = document.querySelector("#user-time");
const userDateSpan = document.querySelector("#user-date");
const adminForm = document.querySelector("#admin-form");
const loginForm = document.querySelector("#login-form");

const closingI = document.querySelector("#opened-form i");
const closingI1 = document.querySelector("#opened-form1 i");
const closingI2 = document.querySelector("#opened-form2 i");
const closingI3 = document.querySelector("#opened-form3 i");

const openedForm = document.querySelector("#opened-form");
const openedForm1 = document.querySelector("#opened-form1");
const openedForm2 = document.querySelector("#opened-form2");
const openedForm3 = document.querySelector("#opened-form3");

const loginIcon = document.querySelector("#login-icon");
const adminIcon = document.querySelector("#admin-icon");
const logoutBtn = document.querySelector("#logout-btn");

const currentUserDiv = document.querySelector("#current-user");
const currentName = document.querySelector("#current-name");

	//board variables
const board = Array.from(document.getElementsByClassName("board"));
const mainSection = document.querySelectorAll(".main");
const titleEl = document.getElementById("title");



	//sides variables

const messageBox = Array.from(document.getElementsByClassName("messages"));
const championContainer = document.querySelector("#championship");
const championDiv = document.querySelector("#champion");
const counterClock = Array.from(document.getElementsByClassName("counter-clock"));


// -------------------------USERS MANAGEMENT

// functions for user management forms

  //form shows up 

  function showForm(form, time, date){
	form.style.opacity = "1";
	form.style.zIndex = "4";

	if(form === openedForm3){ //modael signup form
		
		userTimeSpan.textContent = `זמן נוכחי: ${time} שניות`;
		userDateSpan.textContent = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
		 //using the phantom element for design
		background.style = "width:100vw; height:110vh; z-index:3; background-color: rgba(233,197,81, 0.7); filter: blur(20px);position:absolute;";
		document.body.insertBefore(background, topbar);
		
	}
  }

  //form disappears

  function closeForm(form){
	loginForm.reset();
	form.style.opacity = "0";
	form.style.zIndex = "0";

	if(form === openedForm3){
		userTimeSpan.textContent = "";
		userTimeSpan.textContent = "";
		document.body.removeChild(background);
		localStorage.removeItem("current-time");
		localStorage.removeItem("current-date");
		setTimeout(reload, 3000);
	}
  }


//signup 

	//a. signup form shows up entirely when the first field gets focus, and can be closed

	usernameForm.username.addEventListener("focus", () => {
	showForm(openedForm);
});

closingI.addEventListener("click", () => {
	closeForm(openedForm);
});

	// b. signup submission

usernameForm.addEventListener("submit", e => {
	e.preventDefault();
	
	const email = usernameForm.email.value;
	const password = usernameForm.password.value;
	const username = usernameForm.username.value;

	currentName.textContent = `${username}`;

	auth.createUserWithEmailAndPassword(email, password)
		.then(cred => {
			console.log(cred, cred.user);
			return db.collection("users").doc(cred.user.uid).set({
				username: username
			});
		}).then(() => {
			loginForm.querySelector("#response1").innerHTML = "";
			closeForm(openedForm);
		}).catch(err => {
			usernameForm.querySelector("#response").innerHTML = err.message;
		});
});


//admin form- add admin 

	//a.admin form shows up when the login icon is clicked, can be closed

adminIcon.addEventListener("click", () => {
	showForm(openedForm2);
});

closingI2.addEventListener("click", () => {
	closeForm(openedForm2);
});

	//b. admin submission- using Cloud Function

adminForm.addEventListener("submit", e => {
	
	e.preventDefault();

	const adminEmail = adminForm.email2.value;

	const addAdminRole = functions.httpsCallable("addAdminRole");

    addAdminRole({email: adminEmail})
	.then((result)=> {
        console.log(result);
		adminForm.querySelector("#response2").innerHTML = "";
		closeForm(openedForm2);
    }).catch(err => {adminForm.querySelector("#response2").innerHTML = err.message;});

});

// user logout

logoutBtn.addEventListener("click", () => {
	auth.signOut().then(() => {
		console.log("user signed out");
		reload();
	});
});


//user login

	//a. login form shows up when the login icon is clicked, can be closed

loginIcon.addEventListener("click", () => {
	showForm(openedForm1);
});

closingI1.addEventListener("click", () => {
	closeForm(openedForm1);
});

	//b. login submission

loginForm.addEventListener("submit", e => {
	e.preventDefault();

	const email = loginForm.email1.value;
	const password = loginForm.password1.value;
	

	auth.signInWithEmailAndPassword(email, password)
		.then(cred => {
			console.log(cred.user);
			loginForm.querySelector("#response1").innerHTML = "";
			closeForm(openedForm1);
		}).catch(err => {
			loginForm.querySelector("#response1").innerHTML = err.message;
		});
});

//signup modal after game finishes- opens automatically if no user is logged in
// when game ends
    

	//closing option

closingI3.addEventListener("click", () => {
	closeForm(openedForm3);
});

	//submission

usernameFormModal.addEventListener("submit", e => {

	e.preventDefault();

	const email = usernameFormModal.email3.value;
	const password = usernameFormModal.password3.value;
	const username = usernameFormModal.username3.value;

	currentName.textContent = `${username}`;

	//showing last saved result
	const currentTime = Number(localStorage.getItem("current-time"));
	const currentDate = new Date();
		//from string to number to date
	currentDate.setTime(Number(localStorage.getItem("current-date")));
		//from date to firebase timestamp
	const currentDateDB = firebase.firestore.Timestamp.fromDate(currentDate);

	auth.createUserWithEmailAndPassword(email, password)
		.then(cred => {
			console.log(cred, cred.user);
			
			if(selectLevel.value === "game-small"){

				return db.collection("users").doc(cred.user.uid).set({
					username: username,
					recordSmall: currentTime,
					recordSmallDate: currentDateDB,
				});
			}else{
				return db.collection("users").doc(cred.user.uid).set({
					username: username,
					recordMedium: currentTime,
					recordMediumDate: currentDateDB,
				});
			};
		}).then(() => {
			recordKeeping(firebase.auth().currentUser.uid);
			usernameFormModal.querySelector("#response3").innerHTML = "";
			closeForm(openedForm3);
		}).catch(err => {
			usernameFormModal.querySelector("#response3").innerHTML = err.message;
		});

});

//changes in user status

function forLoggedOuts() {
	logoutBtn.style.display = "none";
	loginIcon.style.display = "block";
	usernameForm.style.display = "block";
	currentUserDiv.classList.add("d-none");
	adminDiv.style.display = "none";
	recordKeeping(false); //no personal record shown
}

function forLoggedIns(username, admin, userID) {
	logoutBtn.style.display = "block";
	currentUserDiv.classList.remove("d-none");
	loginIcon.style.display = "none";
	usernameForm.style.display = "none";
	currentName.textContent = `${username}`;
	recordKeeping(userID); //to show personal record

	//case admin

	if(admin) {
		adminDiv.style.display = "block";
		currentUserDiv.querySelector("#admin-badge").textContent = ` (אדמין)`;
	}

}

auth.onAuthStateChanged(user => {
	console.log(user);
	if (user) {
		db.collection("users").doc(user.uid).get()
		.then((doc) =>{
			const userID = user.uid;
			const username = doc.data().username;
			
			//checking if a logged in user is an admin

			user.getIdTokenResult()
			.then(idTokenResult => {
				user.admin = idTokenResult.claims.admin;
				forLoggedIns(username, user.admin, userID);

			}).catch(err =>{console.log(err.message);});
		}).catch(err =>{console.log(err.message);});
	} else {
		forLoggedOuts();
	};
})


//-----------------------------Presenting PERSONAL record

     //auxilliary functions for personal record presentation

function flicking() {
	recordShow.classList.toggle("large");
}

let startFlicking = setInterval(flicking, 700);

function restartFlicker() {
	clearInterval(startFlicking);
	startFlicking = setInterval(flicking, 700);
}

    // main functions for personal record

function recordKeeping (userID) {

	function recordPresent (record){
		let recordM = Math.floor(record/60);
		let recordS = record % 60;
		recordShow.classList.remove("d-none");
		recordShow.textContent = `שיא אישי: ${recordM}:${recordS}`;
	}

	function recordAbsent (){
		recordShow.classList.add("d-none");
		clearInterval(startFlicking);
	}

	if(userID){

		db.collection("users").doc(userID).get()
		.then((doc) => {

			const userDetails = doc.data();

			if(selectLevel.value === "game-small" && userDetails.recordSmall){
			
				recordPresent(userDetails.recordSmall);
	
			}else if(selectLevel.value === "game-small" && !userDetails.recordSmall){
				recordAbsent();
			
			}else if(selectLevel.value === "game-medium" && userDetails.recordMedium) {
				recordPresent(userDetails.recordMedium);
			}else if(selectLevel.value === "game-medium" && !userDetails.recordMedium){
				recordAbsent();
			};
		}).catch(err => {console.log(err.message)});

	}else{  // no logged-in user
		recordAbsent();
	};
}


// Clock starts ticking 

const stopwatchView = Array.from(document.getElementsByClassName("stopwatch-view"));
let s = 0;
let m = 0;

function timing() {
	s++;
	if (s >= 60) {
		s = 0;
		m++;
	};

	if (selectLevel.value === "game-small") {
		stopwatchView[0].innerHTML = `<span>${s}</span> <span>:<span> <span>${m}</span>`;
	} else {
		stopwatchView[1].innerHTML = `<span>${s}</span> <span>:<span> <span>${m}</span>`;
	}

};

let intervalTiming = setInterval(timing, 1000);

function restartTimer() {
	clearInterval(intervalTiming);
	s = 0;
	m = 0;

	intervalTiming = setInterval(timing, 1000);
}



//------------------------- Choosing game level (default: game-small)

function gamechanger() {

	
	//restarting the game
	
		//restarting widgets

	restartTimer();
	restartFlicker();


	console.log(selectLevel.value);

	if (selectLevel.value === "game-small") {
		mainSection[1].classList.add("not-selected");
		mainSection[0].classList.remove("not-selected");
		cards.length = 12;

		board[0].addEventListener("click", firstChosen);

	} else {
		mainSection[0].classList.add("not-selected");
		mainSection[1].classList.remove("not-selected");
		cards.length = 18;

		board[1].addEventListener("click", firstChosen);
	}
	assign();
	play();
	if(firebase.auth().currentUser){recordKeeping(firebase.auth().currentUser.uid)};
	getChampion();
}

selectLevel.addEventListener("change", gamechanger);

//--------------------------------MAIN GAME--------------------------------------------------

//1. Variables for choice stage

const backImages = ["images/eye-card300.jpg", "images/justice-card300.jpg", "images/fool-card300.jpg", "images/goat-card300.jpg", "images/snake-card300.jpg", "images/tree-card300.jpg", "images/moon-card300.jpg", "images/lotus-card300.jpg", "images/fire-card300.jpg"];
const cards = [];
if (selectLevel.value === "game-small") {
	cards.length = 12;
};

let chosenCard = [];
let chosenCardInner = [];
let chosenImg;
let counter = 0;

//2. Assigning Images

function shuffler(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	array.forEach((item, index) => {
		if (index % 2 === 0) {
			item.src = backImages[index / 2];
		} else {
			item.src = backImages[Math.ceil(index / 2 - 1)];
		};
	});
}

function assign() {

	for (let x = 0; x < cards.length; x++) {
		if (selectLevel.value === "game-small") {
			cards[x] = document.querySelector(`#card${x + 1}-back img`);
		} else {
			cards[x] = document.querySelector(`#cardm${x + 1}-back img`);
		}
		console.log(cards[x]);
	}

	shuffler(cards);

	messageBox.forEach(item => {
		item.textContent = "בחרו קלף ראשון";
	});

};


window.onload = assign();

     // Card variables values depend on game level

function play() {

	if (selectLevel.value === "game-small") {
		chosenCard = Array.from(document.querySelectorAll(".flip-card-front"));
		chosenCardInner = Array.from(document.querySelectorAll(".flip-card-inner"));
		chosenImg = board[0].querySelectorAll("img");
	} else {
		chosenCard = Array.from(document.querySelectorAll(".flip-cardm-front"));
		chosenCardInner = Array.from(document.querySelectorAll(".flip-cardm-inner"));
		chosenImg = board[1].querySelectorAll("img");
	};
}

window.onload = play();

//3. Choosing the first card

function firstChosen(event) {
	if (event.target.className === "flip-card-front" || event.target.className === "flip-cardm-front") {

		selectLevel.setAttribute("disabled", "disabled");
		selectLevelDiv.style.display = "none";
		
		const chosenIndex = chosenCard.indexOf(event.target);
		console.log(chosenIndex);
		chosenCardInner[chosenIndex].classList.add("chosen");

		const chosenImgFirst = chosenImg[chosenIndex];
		console.log(chosenImgFirst);

		if (selectLevel.value === "game-small") {
			messageBox[0].textContent = "בחרו קלף שני";
		} else {
			messageBox[1].textContent = "בחרו קלף שני";
		};

		const info1 = { chosenImgFirst, chosenIndex };

		console.log(info1);

		board.forEach(item => {
			item.removeEventListener("click", firstChosen);
			item.addEventListener("click", (event) => { secondChosen(event, info1) }, { once: true });
		});

	};
};


//4. Choosing the second card 

function secondChosen(event, info1) {

	if (event.target.className === "flip-card-front" || event.target.className === "flip-cardm-front") {

		const chosenIndex2 = chosenCard.indexOf(event.target);
		console.log(chosenIndex2);
		chosenCardInner[chosenIndex2].classList.add("chosen");

		const chosenImgSecond = chosenImg[chosenIndex2];
		console.log(chosenImgSecond);


		const chosenImgFirst = info1.chosenImgFirst;
		const chosenIndex = info1.chosenIndex;

		const infoAll = { chosenImgFirst, chosenIndex, chosenImgSecond, chosenIndex2 };
		console.log(infoAll);

		setTimeout(compare, 1500, infoAll);

	} else {
		board.forEach(item => {
			item.addEventListener("click", (event) => { secondChosen(event, info1) }, { once: true });
		});
	};
}



//5. Comparing Cards



function compare(infoAll) {

	const { chosenImgFirst, chosenIndex, chosenImgSecond, chosenIndex2 } = infoAll;

	if (chosenImgFirst.src === chosenImgSecond.src) {

		console.log("it's a match!");
		messageBox.forEach(item => {
			item.textContent = "זיווג משמיים,שימו עשירייה בצד!";
		});
		chosenCardInner[chosenIndex].classList.add("match");
		chosenCardInner[chosenIndex2].classList.add("match");

		counter++;
		const coffeeBean = document.createElement("img");
		coffeeBean.src = "images/coffee-bean.png";

		if (selectLevel.value === "game-small") {
			counterClock[0].appendChild(coffeeBean);
		} else {
			counterClock[1].appendChild(coffeeBean);
		};

		board.forEach(item => {
			item.addEventListener("click", firstChosen);
		});

	} else { goingOn(infoAll); };

	if (selectLevel.value === "game-small" && counter === 6) {
		gameOver(1);
	} else if (selectLevel.value === "game-medium" && counter === 9) {
		gameOver(2);
	};
}



//6. Game Over Case

function gameOver(num) {


	let time = m * 60 + s;
	const n = new Date();
	const now = n.valueOf();
	const nowDB = firebase.firestore.Timestamp.fromDate(n);

	localStorage.setItem("current-time", time);
	localStorage.setItem("current-date", now);

	clearInterval(intervalTiming);

	mainSection[num - 1].outerHTML = `<div id="bertha-div">
	<p id="bertha-p">כל הכבוד! התרשמתי מהאינטואיציות העל-טבעיות שלכם. <br>אולי תשתו עוד כוס קפה?</p>
	<div id="bertha-wrapper"><img id="bertha" src="images/bertha-passport.jpg"></div>
	</div>`
	
	//'<img id="bertha" src="images/end-game-slide.jpg" style="width:100%;height:100%;object-fit: cover"; z-index: 2;>';
	titleEl.style.display = "none";
	championContainer.style.display = "none";


	if (num === 1) {                             //small game over

		if(firebase.auth().currentUser){


			db.collection("users").doc(firebase.auth().currentUser.uid).get()
			.then(async doc => {
						//case new personal record
					if(time < doc.data().recordSmall || !doc.data().recordSmall ){
						const username = doc.data().username;
						//comparing to champion
						queryChampionSmall()
						.then(snapshot => {
							const championTime = snapshot.docs[0].data().recordSmall;
							if(time < championTime){
								console.log("new champion");
								newChampion(username);
							}else{
								console.log("not a new champion");
							}
						}).then (() => {
						//updating DB
							db.collection("users").doc(firebase.auth().currentUser.uid)
							.set({
								"recordSmall": time,
								"recordSmallDate": nowDB
							}, { merge: true })
						//preparing for new game
							.then(() => {
								console.log("user-doc successfully updated");
								getChampion();
								setTimeout(reload, 6000);
							}).catch(err => {console.log(err.message);});
						}).catch (err => {console.log(err.message);})

					}else{setTimeout(reload, 6000);}
			}).catch(err => {console.log(err);});
		
		}else{
			showForm(openedForm3, time, n); //if no user- prompted to sign up

		};

	} else if (num === 2) {                 //medium game over

		if(firebase.auth().currentUser){

			db.collection("users").doc(firebase.auth().currentUser.uid).get()
			.then(async doc => {
						//case new record
					if(time < doc.data().recordMedium || !doc.data().recordMedium ){
						const username = doc.data().username;
						//comapring to champion
						queryChampionMedium()
						.then(snapshot => {
							const championTime = snapshot.docs[0].data().recordMedium;
							if(time < championTime){
								console.log("new champion");
								newChampion(username);
							}else{
								console.log("not a new champion");
							}
						}).then (() => {

							//updating DB
							db.collection("users").doc(firebase.auth().currentUser.uid)
								.set({
									"recordMedium": time,
									"recordMediumDate": nowDB
								}, { merge: true })
							//preparing for new game

								.then(() => {
									
									console.log("user-doc successfully updated");
									getChampion();
									setTimeout(reload, 6000);
								}).catch(err => {console.log(err.message);});
							}).catch(err => {console.log(err.message);});

					}else{setTimeout(reload, 6000);}
			}).catch(err => {console.log(err);});

		}else{
			showForm(openedForm3, time, n); // if no user- prompted to sign up
		};
		

	};
}


//---------------------------------------Presnting all users record---------------------

// 2. Presenting champion to UI

function addChampion(champion) {


	if (selectLevel.value === "game-small") {

		if(champion.recordSmall){
			
			const recordSmallM = Math.floor(champion.recordSmall/ 60);
			const recordSmallS = champion.recordSmall % 60;
			const timeSmall = champion.recordSmallDate.toDate();
			const timeSmallString = `${timeSmall.getDate()}.${timeSmall.getMonth() + 1}.${timeSmall.getFullYear()}`;

			championContainer.style.display = "flex";
			championDiv.innerHTML = `${champion.username}<br>שיא: ${recordSmallM}:${recordSmallS}<br>
									${timeSmallString}`;
		}else{
			championContainer.style.display = "none";
		};

	} else if (selectLevel.value === "game-medium"){

		if(champion.recordMedium){

			const recordMediumM = Math.floor(champion.recordMedium/ 60);
			const recordMediumS = champion.recordMedium % 60;
			const timeMedium = champion.recordMediumDate.toDate();
			const timeMediumString = `${timeMedium.getDate()}.${timeMedium.getMonth() + 1}.${timeMedium.getFullYear()}`;

			championContainer.style.display = "flex";
			championDiv.innerHTML = `${champion.username}<br>שיא: ${recordMediumM}:${recordMediumS}<br>
									${timeMediumString}`;
		}else{
			championContainer.style.display =" none";
		};
	};
}

// 1.Getting champion details from DB

function queryChampionSmall(){
	return db.collection("users")
		.orderBy("recordSmall")
		.orderBy("recordSmallDate")
		.limit(1)
		.get();
}	

function queryChampionMedium(){
	return db.collection("users")
		.orderBy("recordMedium")
		.orderBy("recordMediumDate")
		.limit(1)
		.get();
}
			


function getChampion() {

	if (selectLevel.value === "game-small"){
		queryChampionSmall()
		.then(snapshot => {
			console.log(snapshot.docs[0].data());
			addChampion(snapshot.docs[0].data());

		}).catch(err => {
			console.log(err);
		});
	}else{
		queryChampionMedium()
		.then(snapshot => {
			console.log(snapshot.docs[0].data());
			addChampion(snapshot.docs[0].data());
		}).catch(err => {
			console.log(err);
		});
	};
}

window.onload = getChampion();

// if user's new time is a new general record

function newChampion(championName){
	
	// animated title added
	document.body.innerHTML = '<img  src="images/new-sun.jpg" style="position: relative; width:100vw;height: 100vh; object-fit: cover"; z-index: 2;>';
	titleEl.style.display = "none";
	const newChampionContainer = document.createElement("div");
	newChampionContainer.classList.add("new-champion-container");
	const newChampionTitle = document.createElement("h1");
	newChampionTitle.classList.add("champion-title");
	const newChampionText = document.createTextNode(`ברכותיי! קבעת שיא עולמי חדש `);
	newChampionTitle.appendChild(newChampionText);
	newChampionContainer.appendChild(newChampionTitle);
	const newChampionDiv = document.createElement("div");
	const newChampionDivText = document.createTextNode(`${championName}`);
	newChampionDiv.appendChild(newChampionDivText);
	newChampionDiv.classList.add("new-champion-div");
	newChampionContainer.appendChild(newChampionDiv);
	document.body.appendChild(newChampionContainer);

	
	//confetti for the winner

	confetti({
		particleCount: 300,
		spread: 180,
		origin: {
			x: 0.5,
			// since they fall down, start a bit higher
			y: 0.3
		  },
		colors: ["#E9C551", "#5c0e00", "FFFFFF", "E29705" ],
		gravity: 0.2
	});
	
}

//-------------------------BACK TO MAIN GAME- continue case (game not over)-------

function goingOn(infoAll) {

	console.log("try again");

	messageBox.forEach(item => {
		item.textContent = "אחרי כמה צרות קטנות, בסוף יהיה נפלא";
	});

	const chosenIndex = infoAll.chosenIndex;
	const chosenIndex2 = infoAll.chosenIndex2;


	chosenCardInner[chosenIndex].classList.remove("chosen");
	chosenCardInner[chosenIndex2].classList.remove("chosen");


	board.forEach(item => {
		item.addEventListener("click", firstChosen);
	});

};

//----------------------Basic event listeners for main game---------------------
board[0].addEventListener("click", firstChosen);
board[1].addEventListener("click", firstChosen);

