// Initialize variables to display the timeline, JSON-Data and the images from the API
const timelineList = document.querySelector('.timeline-list');
const timelineListByID = document.getElementById("timelineID");
const min_year = 1901;      // Is used to limit the timeline to a fixed startingpoint
const max_year = 2022;      // Is used to limit the timeline to a fixed endgpoint
let activeYear = 2000;      // Defines the year which is shown on startup
let passiveYear = [];       // Contains all the years which are shown next to the currently selected year "activeYear"
let nobelPrizeData = null;  // Initialize a variable/array to store Nobel Prize data

/* Animate.css from https://animate.style/
Animate.css is a library of ready-to-use, cross-browser animations for use in your web projects.
Great for emphasis, home pages, sliders, and attention-guiding hints. 
Code adapted from documentaion*/
const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.querySelector(element);
    node.classList.add(`${prefix}animated`, animationName);
    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      node.style.setProperty('--animate-duration', '0.15s');
      resolve('Animation ended');
    }
    node.addEventListener('animationend', handleAnimationEnd, {once: true});
  });

// Debounce your searchByYear function
const debouncedSearchByYear = debounce(searchByYear, 500); // 500ms delay

// Define an asynchronous function to search for Nobel Prize winners by year
async function searchByYear() {

  // Get the results element to display search results
  const results = document.getElementById("results");

  // Assign variables to the checkboxes
  var maleCheckbox = document.getElementById("gender_male");
  var femaleCheckbox = document.getElementById("gender_female");
  var physicsCheckbox = document.getElementById("physics");
  var chemistryCheckbox = document.getElementById("chemistry");
  var medicineCheckbox = document.getElementById("medicine");
  var literatureCheckbox = document.getElementById("literature");
  var economicsCheckbox = document.getElementById("economics");
  var peaceCheckbox = document.getElementById("peace");

  // Get the year input value from the activeYear variable and convert it to a string
  const yearInputNumber = activeYear;
  const yearInputString = yearInputNumber.toString();
  
  // Filter the Nobel Prize data to get only the winners from the specified year
  const nobelPrizeWinners = nobelPrizeData.filter((d) => d.Year === yearInputString);

  // Create arays for both the selected categories and the selected genders
  const selectedCategories = [];
  const selectedGenders = [];

  // Clear any existing search results from the element
  results.innerHTML = "";

  // Checks if the filter checkboxes are selected and if yes, pushes the selected categories to the array
  if (physicsCheckbox.checked) selectedCategories.push("Physics");
  if (chemistryCheckbox.checked) selectedCategories.push("Chemistry");
  if (medicineCheckbox.checked) selectedCategories.push("Medicine");
  if (literatureCheckbox.checked) selectedCategories.push("Literature");
  if (economicsCheckbox.checked) selectedCategories.push("Economics");
  if (peaceCheckbox.checked) selectedCategories.push("Peace");
  if (maleCheckbox.checked) selectedGenders.push("male");
  if (femaleCheckbox.checked) selectedGenders.push("female");

  // Checks which genders are selected. If both or none are selected gender "org" will be pushed in the array.
  // If the user selects a gender, organisation wont be shown as prize winners.
  if (maleCheckbox.checked == false && femaleCheckbox.checked == false) {
    selectedGenders.push("org");
  } else if (maleCheckbox.checked && femaleCheckbox.checked) {
    selectedGenders.push("org");
  }

  // Filter the winners of the specified year by selected categories and genders
  const nobelPrizeSorted = nobelPrizeWinners.filter((entry) => {
    const isCategorySelected = selectedCategories.length ? selectedCategories.includes(entry.Category) : true;
    const isGenderSelected = selectedGenders.length ? selectedGenders.includes(entry.Gender) || selectedGenders.includes("org") : true;
    return isCategorySelected && isGenderSelected;
  });
  
  // Loop through the Nobel Prize winners for the specified year and category
  for (let i = 0; i < nobelPrizeSorted.length; i++) {
    const d = nobelPrizeSorted[i];
 
    // Checks if every entry has a surname. If not "", is added. (Reason: Organisations have no surname in the json and undifined was declared and shown in the html)
    if(!d.Surname){d.Surname = ""}

    // Create a div element to display the search result
    const divItem = document.createElement("div");
    divItem.className = "result-item";
  
    // Create a list item element to display the winner's name
    const listItem = document.createElement("li");
    const text = document.createTextNode(`${d.Firstname} ${d.Surname}`);
    listItem.appendChild(text);
    divItem.appendChild(listItem);

    try {
      let thumbnailUrl = null;
  
      // Use the Wikipedia API to get the thumbnail image for the winner's English Wikipedia page
      const responseEng = await fetch(`https://en.wikipedia.org/w/api.php?origin=*&action=query&titles=${d.Firstname}_${d.Surname}&prop=pageimages&format=json&pithumbsize=300`);
      const dataEng = await responseEng.json();
      const pagesEng = dataEng.query.pages;
      const firstPageIdEng = Object.keys(pagesEng)[0];
      thumbnailUrl = pagesEng[firstPageIdEng].thumbnail?.source;
  
      // If no thumbnail image was found for the English Wikipedia page, try the German Wikipedia page
      if (!thumbnailUrl) {
        const responseDe = await fetch(`https://de.wikipedia.org/w/api.php?origin=*&action=query&titles=${d.Firstname}_${d.Surname}&prop=pageimages&format=json&pithumbsize=300`);
        const dataDe = await responseDe.json();
        const pagesDe = dataDe.query.pages;
        const firstPageIdDe = Object.keys(pagesDe)[0];
        thumbnailUrl = pagesDe[firstPageIdDe].thumbnail?.source;
      }

      if (!thumbnailUrl) {
        thumbnailUrl = "assets/img/placeholder.png";
      }
    

      // If a thumbnail image was found, create an img element to display it
      if (thumbnailUrl) {
        const thumbnailImage = document.createElement("img");
        thumbnailImage.src = thumbnailUrl;
        divItem.insertBefore(thumbnailImage, listItem);
      }
    } catch (err) {
      console.error(err); // Log any errors to the console
    }
  
      // Create a list item element for the Nobel prize winner's category
      const categoryItem = document.createElement("li");
      // Create a text node with the category of the Nobel prize winner
      const categoryText = document.createTextNode(d.Category);
      // Append the category text to the list item
      categoryItem.appendChild(categoryText);
      // Append the category list item to the result item
      divItem.appendChild(categoryItem);
      // Append the result item to the results list
      results.appendChild(divItem);
    }
    console.log("Data has been shown.")         // Log the status to the console
}

// Create the list items containing the years of the timeline 
for (let year = min_year; year <= max_year; year++) {
  // Create li elements with the content "year" e.g. "2001"
  const listItem = document.createElement('li');
  listItem.textContent = year;
  // Defines the class "timeline-item" to the li elements
  listItem.setAttribute("class", "timeline-item");
  timelineList.appendChild(listItem);

  // Assing an eventlistener to the li-elements, which fires when a click on a year in the timewheel is recongnized
  listItem.addEventListener("click", () => {
  if (year > max_year){activeYear = max_year;}              // Checks if the clicked year is outside or inside the maximal number in the timeline
  else if (year < min_year){activeYear = min_year;}         // Checks if the clicked year is outside or inside the minimal number in the timeline
  else {activeYear = year;}                                 // Changes the selected year to the clicked year

  console.log("User jumped to different year.") // Log the status to the console
  calculatePassiveYears(activeYear);
});
}

// Selects als li elements containing the years from the timeline
const timelineItems = document.querySelectorAll('.timeline-item');

//Calculates which li elements should be shown and assings diffrent classes to each. Those are used to differentiate each other and to hide those currently not shown.
function calculatePassiveYears(activeYear) {
  let i = 1;
  //Empty array "passiveYear"
  passiveYear = []
  // Adds 4 years befor and after the selected year (activeYear) into the array.
  while(i < 5){
    passiveYear.push(activeYear -i);
    passiveYear.push(activeYear +i);
    i++;
  }
  // Sort "function" for numbers from: https://www.w3schools.com/js/js_array_sort.asp
  passiveYear.sort(function(a, b){return a - b});
  for (i = 0; i < timelineItems.length; i++) {
    //Checks if the years inside the array are values from li elements on the page and adds further html classes o those
    let ckeckVar = Number(timelineItems[i].innerHTML);
    if(passiveYear.includes(ckeckVar)){
      timelineItems[i].setAttribute("class", "timeline-item passive");
    } else {
      timelineItems[i].setAttribute("class", "timeline-item invisible");
    }
    if (ckeckVar == activeYear){
      timelineItems[i].setAttribute("class", "timeline-item active");
    }
  }
  debouncedSearchByYear()
}

calculatePassiveYears(activeYear);

// Use the fetch API to load Nobel Prize data from a local JSON file
fetch('./data.json')
  .then(response => response.json()) // Parse the response as JSON
  .then(data => {
    nobelPrizeData = data; // Store the parsed data in the `nobelPrizeData` variable
    console.log("JSON-Data has been read."); // Log the status in the console.
  });


/*Defines a function to increase or decrease the timespan which should be displayed in the timeline.
Part of the code addapted from: https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event */
function scroll_event(event) {
  event.preventDefault(); 
  
  // Increasing / Decreasing the variable
  if (event.deltaY < 0) {
  animateCSS('.timeline', 'fadeOutDown').then((message) => {
  activeYear -= 1;
  animateCSS('.timeline', 'fadeInDown').then((message) => {
	});
  // Do something after the animation
	});
  } // Scrolling up
  else {
  animateCSS('.timeline', 'fadeOutUp').then((message) => {
  activeYear += 1;
  animateCSS('.timeline', 'fadeInUp').then((message) => {
	});
  // Do something after the animation
	});
  } // Scrolling down
  
  // Checking if the value is bigger/smaller than the max/min value. If yes, values gets set to max/min
  if (activeYear > max_year) {activeYear = max_year;}
  if (activeYear < min_year) {activeYear = min_year;}
  
  calculatePassiveYears(activeYear);
	
  // Log the status to the console
  console.log("Scroll Event has occured.") 
}

/* Define a debounce function for the SearchByYearFunction
Code addapted from https://www.freecodecamp.org/news/javascript-debounce-example/ */
function debounce(func, delayTime) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delayTime);
  };
}

/* Global Eventhandler functions
Gets all filter-checkboxes and assigns an eventlistener to each */
const checkboxes = document.querySelectorAll(".form-check");
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("click", debouncedSearchByYear);
});

// Assigns an eventlistener to the search button
//document.getElementById("searchButton").addEventListener("click", debouncedSearchByYear);

// Creates an eventlistener for the "enter" key. 
document.getElementById("yearInput").addEventListener('keypress', function (press) {
  if (press.key === "Enter") {
    //activeYear = document.getElementById("yearInput").value;
    //console.log(activeYear);
    //create_timeline();
    //debouncedSearchByYear();
  }
});

// Creates an eventlistener for the "wheel" event 
document.getElementById("timelineID").addEventListener("wheel", scroll_event, { passive: false });


//EH for modal https://www.freecodecamp.org/news/how-to-build-a-modal-with-javascript/
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".btn-open");
const closeModalBtn = document.querySelector(".btn-close");

const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

openModalBtn.addEventListener("click", openModal);

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal)
//document.addEventListener("keydown");

/* document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    modalClose();
  }
}); */