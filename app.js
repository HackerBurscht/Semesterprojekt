// Initialize a variable to store Nobel Prize data
let nobelPrizeData = null;

// Use the fetch API to load Nobel Prize data from a local JSON file
fetch('./data.json')
  .then(response => response.json()) // Parse the response as JSON
  .then(data => {
    nobelPrizeData = data; // Store the parsed data in the `nobelPrizeData` variable
    console.log(nobelPrizeData); // Log the data to the console
  });

// Define an asynchronous function to search for Nobel Prize winners by year
async function searchByYear() {

  // Finden Sie die Checkboxen nach ID
  var maleCheckbox = document.getElementById("gender_male");
  var femaleCheckbox = document.getElementById("gender_female");
  var physicsCheckbox = document.getElementById("physics");
  var chemistryCheckbox = document.getElementById("chemistry");
  var medicineCheckbox = document.getElementById("medicine");
  var literatureCheckbox = document.getElementById("literature");
  var economicsCheckbox = document.getElementById("economics");
  var peaceCheckbox = document.getElementById("peace");

  // Get the year input value from the input element with ID "yearInput"
  const yearInput = document.getElementById("yearInput").value;

  // Write selected year to html-file
  document.getElementById('s_year').innerHTML = yearInput;

  // Get the results element to display search results
  const results = document.getElementById("results");
  // Clear any existing search results from the element
  results.innerHTML = "";
  
  // Filter the Nobel Prize data to get only the winners from the specified year
  const nobelPrizeWinners = nobelPrizeData.filter((d) => d.Year === yearInput);

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


// Creates an eventhandler for the scrollwheel and defines a function to increase or decrease the timespan which should be displayed in the timeline.
// Part of the code addapted from: https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event

document.getElementById("main-timeline").addEventListener("wheel", scroll_event, { passive: false });

let w_year = 2005
const min_year = 1900
const max_year = 2020


function scroll_event(event) {
  event.preventDefault();
  // Increasing / Decreasing the variable
  if (event.deltaY < 0) {    // Scrolling up
    w_year -= 10;
  } else {                  // Scrolling down
    w_year += 10;
  }
  // Checking if the value is bigger/smaller than the max/min value. If yes, values gets set to max/min.
  if (w_year > max_year) {
    w_year = max_year;
  }

  if (w_year < min_year) {
    w_year = min_year;
  }
  console.log("w_year: " +w_year);
  create_timeline()
}

function create_timeline() {
  let time_span1 = w_year - 5;
  let time_span2 = w_year + 5;

  const  timespan = []

  while (time_span1 <= time_span2){
    timespan.push(time_span1)
    time_span1 += 1
  }

  console.log(timespan)

  const listItemUl = document.createElement("ul");
  listItemUl.setAttribute("id", "ul_id")

  timespan.forEach((item) => {
  const listItemLi = document.createElement("li");
  listItemLi.textContent = item;
  listItemUl.appendChild(listItemLi);

  listItemLi.addEventListener("click", () => {
    w_year = item;
    console.log("Jump to new w_year:" + w_year)
    create_timeline()
  });

  });

  const timewheel = document.getElementById("timewheel_id");
  timewheel.innerHTML = "";
  timewheel.appendChild(listItemUl);

}

