// Initialize variables to display the timeline, JSON-Data and the images from the API
const timelineList = document.querySelector('.timeline-list');
const timelineListByID = document.getElementById("timelineID");
const min_year = 1901;      // Is used to limit the timeline to a fixed startingpoint
const max_year = 2022;      // Is used to limit the timeline to a fixed endgpoint
let activeYear = 2002;      // Defines the year which is shown on startup
let passiveYear = [];       // Contains all the years which are shown next to the currently selected year "activeYear"
let nobelPrizeData = null;  // Initialize a variable/array to store Nobel Prize data
const infoModal = document.querySelector(".info_modal");      // Initialize a variable to store the info modal element
const infoOverlay = document.querySelector(".info_overlay");  // Initialize a variable to store the info overlay element
const debouncedSearchByYear = debounce(searchByYear, 750);    // Debounce your searchByYear function: 750ms delay
// Eventhandler for modal addapted from: https://www.freecodecamp.org/news/how-to-build-a-modal-with-javascript/
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeModalBtn = document.querySelector(".btn-close");


// Initialize the timeline
createTimeline();

// Creaters the data and shows the modal for each result div (Nobelprice winner)
function createModal(name, born, died, motivation, country, thumbnailUrlModal) {
  document.querySelector("#modal-name").textContent = name;
  document.querySelector("#modal-country").textContent = country;
  document.querySelector("#modal-born").textContent = born;
  document.querySelector("#modal-dead").textContent = died;
  document.querySelector("#modal-motivation").textContent = motivation;
  document.querySelector("#modal-image").src = thumbnailUrlModal;
  openModal();
}

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

  // Checks if there is anydata found. If not, placeholder text is shown to the user.
  if (nobelPrizeSorted.length == 0){
    let resultsPlaceholder = document.getElementById("results");
    resultsPlaceholder.innerHTML = "No data available.";
  }

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

    let thumbnailUrlModal = "";
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

      // If still no img is found the url to the local placeholder image is used
      if (!thumbnailUrl) {
        thumbnailUrl = "assets/img/placeholder.png";
      }
    
      // If a thumbnail image was found, create an img element to display it
      const thumbnailImage = document.createElement("img");
      thumbnailImage.src = thumbnailUrl;
      divItem.insertBefore(thumbnailImage, listItem);
      thumbnailUrlModal = thumbnailUrl

    } catch (err) {
      // Log any errors to the console
      console.error(err); 
    }
      // Add an event listener to the div element
      divItem.addEventListener("click", function() {
        // Get the data of for the form from the array
        const name = `${d.Firstname} ${d.Surname}`;
        let motivation = "Motivation: " + `${d.Motivation}`;
        let born = "";
        let died = "";
        let country = "";
        // Check if the data is available and if not, set the variable to an empty string
        if(!d.Born){born = ""}else{born = "Born: " + `${d.Born}`;};
        if(!d.Died){d.Died = ""}else{died = "Died: " + `${d.Died}`;};
        if(!d.Country){d.Country = ""}else{country = "Born in: " + `${d.Country}`;};
        // Call createModal function with with the according data
        createModal(name, born, died, motivation, country, thumbnailUrlModal);
      });

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
}

// Creates  the li items for the timeline (10 years, scrollable, with buttons)
function createTimeline() {
  // Creates an empty text element, befor the list elements.
  const listItemSelectorLeft = document.createElement("a");
  listItemSelectorLeft.setAttribute("class", "left selector");
  timelineList.appendChild(listItemSelectorLeft);
  // Assing an eventlistener to the selector text element
  listItemSelectorLeft.addEventListener("click", () => {
    selectorAction("left");
  });
  
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
  // Creates an empty text element, after the list elements.
  const listItemSelectorRight = document.createElement("a");
  listItemSelectorRight.setAttribute("class", "right selector");
  timelineList.appendChild(listItemSelectorRight);
  // Assing an eventlistener to the selector text element
  listItemSelectorRight.addEventListener("click", () => {
    selectorAction("right");
  });
}

// Checks if the selectors (Html text elements) should be visible or invisible on the page.
function selectorCheck(){
  // Gets the html elements and assigns them to variables
  const listItemSelectorRight = document.querySelector(".right");
  const listItemSelectorLeft = document.querySelector(".left")
  // Checks the right element
  listItemSelectorRight.classList.toggle("hidden", activeYear > 2016);
  listItemSelectorRight.classList.toggle("selector", activeYear <= 2016);
  // Checks the left element
  listItemSelectorLeft.classList.toggle("hidden", activeYear < 1906);
  listItemSelectorLeft.classList.toggle("selector", activeYear >= 1906);
}

// Is callend when the selector text elment in the timeine is clicked. Checks the current year and changes the activeYear by plus/minus 5
function selectorAction(direction){
  // Increasing / Decreasing the variable
  if (direction=="left") {activeYear -= 5;} 
  else {activeYear += 5;}
  // Checking if the value is bigger/smaller than the max/min value. If yes, values gets set to max/min
  if (activeYear > max_year) {activeYear = max_year;}
  if (activeYear < min_year) {activeYear = min_year;}
  calculatePassiveYears(activeYear);
}

//Calculates which li elements should be shown and assings diffrent classes to each. Those are used to differentiate each other and to hide those currently not shown.
function calculatePassiveYears(activeYear) {
  // Selects all li elements containing the years from the timeline
  const timelineItems = document.querySelectorAll('.timeline-item');
  // Empty array "passiveYear"
  const passiveYear = [];
  // Adds 4 years before and after the selected year (activeYear) into the array.
  for (let i = 1; i < 5; i++) {
    passiveYear.push(activeYear - i);
    passiveYear.push(activeYear + i);
  }
  // Sort the array in ascending order addapted from: https://www.w3schools.com/js/js_array_sort.asp
  passiveYear.sort((a, b) => a - b);

  for (let i = 0; i < timelineItems.length; i++) {
    // Checks if the years inside the array are values from li elements on the page and adds further HTML classes to those
    const timelineItem = timelineItems[i];
    const yearValue = Number(timelineItem.innerHTML);
    
    if (passiveYear.includes(yearValue)) {
      timelineItem.setAttribute("class", "timeline-item passive");
    } else if (yearValue === activeYear) {
      timelineItem.setAttribute("class", "timeline-item active");
    } else {
      timelineItem.setAttribute("class", "timeline-item invisible");
    }
  }
  // Call other functions
fullProzess();
}

// Initializes the passive years and the active year
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
  // Prevent the default action of scrolling the page
  event.preventDefault(); 

  // Increasing / Decreasing the variable
  if (event.deltaY < 0) {activeYear += 1;} // Scrolling up
  else {activeYear -= 1;} // Scrolling down
  
  // Checking if the value is bigger/smaller than the max/min value. If yes, values gets set to max/min
  if (activeYear > max_year) {activeYear = max_year;}
  if (activeYear < min_year) {activeYear = min_year;}
  
  // Call calculatePassiveYears function to calculate which years should be shown
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

// Defines a function to animate the progressbar
function progress(){
  // Calculate the distance between the min_year and the max_year, the distance between the min_year and the activeYear and convert them to a percentage
  let scale = Number(max_year-min_year);
  let distance = Number(activeYear-min_year);
  let distancePerc = 100/scale*distance;

  // Gets the progressbar and the current width of the progressbar
  let progress = document.querySelector(".timebar_progress");
  let startPosProg = progress.style.width;
  let endPosProg = distancePerc+"%";
  
  // Animates the progressbar
  // Code addapted from https://www.sitepoint.com/get-started-anime-js/ and https://animejs.com/documentation/#fromToValues
  anime({
    targets: ".timebar_progress",
    width: [startPosProg, endPosProg],
    duration: 750,
    easing: 'linear',
    delay: function(el, i) {
      return i * 500;
    },
  });   

}

// Creates the indicators on the progressbar and assigns eventhandlers
function colorBar(){
/*Define variables
  sliderYears contains the values of the year for the progressbar
  timebarDiv contains the span elements, which are created/allready created */
  let sliderYears = [1901, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  let timebarDiv = document.querySelector(".text_nodes");

  // Remove the span elements
  timebarDiv.innerHTML = "";

  // Adds 13 new span elements, defines their apperence via classes and assigns eventhandlers
  for(let i = 0; i < sliderYears.length; i++){
    const spanItem = document.createElement("span");
    const spanItemText = document.createTextNode(sliderYears[i]);

    spanItem.appendChild(spanItemText);
    spanItem.setAttribute("class", "slider_item plain");
    spanItem.setAttribute("data-year", sliderYears[i]);

    // Checks if activeYears is bigger than the value of the span element. If yes adds an additional class
    if (activeYear >= sliderYears[i]){
      spanItem.setAttribute("class", "slider_item bright");
    }
    timebarDiv.appendChild(spanItem);

    // Add an event listener to the span element
    spanItem.addEventListener("click", function(event) {
      let newYear = event.target.textContent;
      activeYear = parseInt(newYear); // Value of newYear was sometimes handled as string. Dont know why. This fixes it.
      // Call calculatePassiveYear function
      calculatePassiveYears(activeYear);
    });
  }
}

// Global Eventhandler functions
function setupEventHandlers() {
  // Eventhandler for the timeline is handled seperatly in colorBar() function
  //Gets all filter-checkboxes and assigns an event listener to each
  const checkboxes = document.querySelectorAll(".form-check");
    checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("click", debouncedSearchByYear);
  });

  // Creates an event listener for the "wheel" event
  document.getElementById("timelineID").addEventListener("wheel", scroll_event, { passive: false });

  // Creates an event listener for the "click" event to the close button and the modal
  closeModalBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal)

  // Add event listener to the info button
  document.getElementById("info_button").addEventListener("click", function() {
    // Add the "info_hidden" class to hide the info modal and overlay
    infoModal.classList.add("info_hidden");
    infoOverlay.classList.add("hidden");
  });

  // Add event listener to the about button to show the info modal
  document.getElementById("about").addEventListener("click", function() {
    // Remove the "info_hidden" class to show the info modal and overlay
    infoModal.classList.remove("info_hidden");
    infoOverlay.classList.remove("hidden");
  });
}

// Function to open the result modal
const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};
// Function to close the result modal
const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

// Function to close the info modal
function showInfoModal() {
  // Remove the "info_hidden" class to show the info modal and overlay
  infoModal.classList.remove("info_hidden");
  infoOverlay.classList.remove("hidden");
}

// Function to call all part of the process in order
function fullProzess(){
  debouncedSearchByYear();
  progress();
  colorBar();
  selectorCheck();
}

// Is called when page is laoded. Shows the info modal and assigns eventhandler to the close button
window.onload = function() {
  showInfoModal();
  setupEventHandlers();
}

