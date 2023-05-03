// Initialize variables to display the timeline
let w_year = 2005           // Is used to determine the currently selected year in the timeline.
const min_year = 1900       // Is used to limit the timeline to a fixed startingpoint.
const max_year = 2020       // Is used to limit the timeline to a fixed endgpoint.
let nobelPrizeData = null;  // Initialize a variable to store Nobel Prize data

// Use the fetch API to load Nobel Prize data from a local JSON file
fetch('./data.json')
  .then(response => response.json()) // Parse the response as JSON
  .then(data => {
    nobelPrizeData = data; // Store the parsed data in the `nobelPrizeData` variable
    console.log("JSON-Data has been read."); // Log the status in the console.
  });

// Define an asynchronous function to search for Nobel Prize winners by year
async function searchByYear() {

  // Assign variables to the checkboxes
  var maleCheckbox = document.getElementById("gender_male");
  var femaleCheckbox = document.getElementById("gender_female");
  var physicsCheckbox = document.getElementById("physics");
  var chemistryCheckbox = document.getElementById("chemistry");
  var medicineCheckbox = document.getElementById("medicine");
  var literatureCheckbox = document.getElementById("literature");
  var economicsCheckbox = document.getElementById("economics");
  var peaceCheckbox = document.getElementById("peace");

  // Get the year input value from the w_year variable and convert it to a string
  const yearInputNumber = w_year;
  const yearInputString = yearInputNumber.toString();

  // Get the results element to display search results
  const results = document.getElementById("results");
  // Clear any existing search results from the element
  results.innerHTML = "";
  
  // Filter the Nobel Prize data to get only the winners from the specified year
  const nobelPrizeWinners = nobelPrizeData.filter((d) => d.Year === yearInputString);

  // Create arays for both the selected categories and the selected genders
  const selectedCategories = [];
  const selectedGenders = [];

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

}
  

// Defines a function to increase or decrease the timespan which should be displayed in the timeline.
// Part of the code addapted from: https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event
function scroll_event(event) {
  event.preventDefault();
  // Increasing / Decreasing the variable
  if (event.deltaY < 0) {w_year -= 10;} // Scrolling up
  else {w_year += 10;}                  // Scrolling down
  // Checking if the value is bigger/smaller than the max/min value. If yes, values gets set to max/min
  if (w_year > max_year) { w_year = max_year;}
  if (w_year < min_year) {w_year = min_year;}
  // Log the status to the console
  console.log("Scroll Event has occured.") 
  create_timeline()
}

function create_timeline() {
  // Initialize variables to display the timeline
  let time_span1 = w_year - 5;  // Is used to determine the startingpoint of the currently displayed timespan
  let time_span2 = w_year + 5;  // Is used to determine the endpoint of the currently displayed timespan
  const  timespan = []          // Is used to store the years of the current timespan in an array, which is used to create the li elements on the page

  // Add the years of the current timespan to the array
  while (time_span1 <= time_span2){
    timespan.push(time_span1)
    time_span1 += 1
  }

  // Create an ul-element and assign attribute "id"
  const listItemUl = document.createElement("ul");
  listItemUl.setAttribute("id", "ul_id")

  // Create an li-elements for all items in the array "timespan"
  timespan.forEach((item) => {
  const listItemLi = document.createElement("li");
  listItemLi.textContent = item;
  listItemUl.appendChild(listItemLi);

  // Assing an eventlistener to the li-elements, which fires when a click on a year in the timewheel is recongnized
  listItemLi.addEventListener("click", () => {
    if (item > 2025){w_year = 2025;}              // Checks if the clicked year is outside or inside the maximal number in the timeline
    else if (item < 1900){w_year = 1900;}         // Checks if the clicked year is outside or inside the minimal number in the timeline
    else {w_year = item;}                         // Changes the selected year to the clicked year

    console.log("User jumped to different year.") // Log the status to the console
    create_timeline()
  });

  });

  const timewheel = document.getElementById("timewheel_id");
  timewheel.innerHTML = "";                       // Delete the content of the timewheel div
  timewheel.appendChild(listItemUl);              // Append the newly created li-elements to the div
  searchByYear();
  console.log("Timeline has been created.")       // Log the status to the console
}

window.onload = () => {
  create_timeline();
};


// Global Eventhandler functions

// Gets all filter-checkboxes and assigns an eventlistener to each
const checkboxes = document.querySelectorAll(".form-check");
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("click", searchByYear);
});

// Assigns an eventlistener to the search button
document.getElementById("searchButton").addEventListener("click", searchByYear);

// Creates an eventlistener for the "enter" key. 
document.getElementById("yearInput").addEventListener('keypress', function (press) {
  if (press.key === "Enter") {
    searchByYear();
  }
});

// Assigns an eventlistener to the scrollwheel.
document.getElementById("main-timeline").addEventListener("wheel", scroll_event, { passive: false });