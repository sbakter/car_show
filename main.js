"use strict";

// Select the forms and create an array to store car objects
const addCarForm = document.querySelector("#addCar");
const searchCarForm = document.querySelector("#searchCar");
const cars = [];

// Define a Car class to represent car objects
class Car {
    constructor(license, maker, model, owner, price, color, year) {
        this.license = license; // License plate of the car
        this.maker = maker; // Maker of the car
        this.model = model; // Model of the car
        this.owner = owner; // Owner of the car
        this.price = parseFloat(price); // Price of the car
        this.color = color; // Color of the car
        this.year = parseInt(year); // Year of manufacture
    }

    // Method to calculate the age of the car
    getCarAge() {
        const currentYear = new Date().getFullYear(); // Get the current year
        return currentYear - this.year; // Return the age
    }

    // Method to get the discounted price of the car if eligible
    getDiscountedPrice() {
        return this.getCarAge() > 10 ? this.price * 0.85 : this.price; // Apply discount if car is older than 10 years
    }

    // Method to check if the car is eligible for a discount
    isEligibleForDiscount() {
        return this.getCarAge() > 10; // Returns true if the car is older than 10 years
    }
}

// Function to display messages to the user
const displayMessage = (message, type = "success") => {
    const messageElement = document.querySelector("#message"); // Select the message display element
    messageElement.textContent = message; // Set the message content
    messageElement.className = type; // Set the type of message (success or error)
    // Clear the message after 3 seconds
    setTimeout(() => {
        messageElement.textContent = "";
        messageElement.className = "";
    }, 3000);
};

// Function to add a new car
const addCar = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
        // Retrieve and validate form input values
        const license = document.querySelector("#license").value.trim();
        const maker = document.querySelector("#maker").value.trim();
        const model = document.querySelector("#model").value.trim();
        const owner = document.querySelector("#owner").value.trim();
        const price = parseFloat(document.querySelector("#price").value.trim());
        const color = document.querySelector("#color").value.trim();
        const year = parseInt(document.querySelector("#year").value.trim());
        const currentYear = new Date().getFullYear(); // Get the current year

        // Validate the form inputs
        if (!license || !maker || !model || !owner || isNaN(price) || !color || isNaN(year)) {
            throw new Error("All fields are required and must be valid."); // Throw an error if validation fails
        }

        if (price <= 0) {
            throw new Error("Price must be a positive number."); // Validate price
        }

        if (year < 1886 || year > currentYear) {
            throw new Error(`Year must be between 1886 and ${currentYear}.`); // Validate year
        }

        // Create a new Car instance and add it to the cars array
        const newCar = new Car(license, maker, model, owner, price, color, year);
        addCarForm.reset(); // Reset the form
        cars.push(newCar); // Add the new car to the array

        // Save the cars array to localStorage
        localStorage.setItem('cars', JSON.stringify(cars));

        // Update the car table and display a success message
        displayTable();
        displayMessage("Car added successfully!");

    } catch (error) {
        displayMessage(error.message, "error"); // Display error message if validation fails
    }
};

// Function to load cars from localStorage on page load
const loadCarsFromLocalStorage = () => {
    const storedCars = localStorage.getItem('cars');
    if (storedCars) {
        const parsedCars = JSON.parse(storedCars);
        // Create Car objects from the parsed data and push them to the cars array
        parsedCars.forEach(carData => {
            cars.push(new Car(carData.license, carData.maker, carData.model, carData.owner, carData.price, carData.color, carData.year));
        });
        displayTable(); // Display the table with loaded cars
    }
};

// Function to display the cars in a table format
const displayTable = () => {
    const table = document.querySelector("#carsTable"); // Select the cars table element

    // Clear existing table rows, except for the header row
    table.innerHTML = table.rows[0].innerHTML;

    // Loop through the cars array and create table rows
    cars.forEach((car, index) => {
        const row = table.insertRow(-1); // Insert a new row at the end of the table

        // Destructure car properties
        const { license, maker, model, owner, year, color, price } = car;

        // Create an array of car details for easy iteration
        const carDetails = [license, maker, model, owner, year, color];

        // Populate the row with car details
        carDetails.forEach(detail => {
            row.insertCell(-1).textContent = detail ?? 'N/A'; // Use 'N/A' if detail is undefined
        });

        // Add price to the row
        row.insertCell(-1).textContent = `${price.toFixed(2)}€`; // Format the price

        // Check if the car is eligible for a discount and display it
        const discountedPrice = car.isEligibleForDiscount()
            ? `$${car.getDiscountedPrice().toFixed(2)}` // Display discounted price
            : "No Discount"; // Display message if no discount
        row.insertCell(-1).textContent = discountedPrice; // Add discounted price to the row

        // Create a delete button for each car row
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete"; // Button text
        deleteButton.classList.add("delete"); // Add a class for styling
        // Add event listener to delete the car from the array
        deleteButton.addEventListener("click", () => deleteCar(index));
        row.insertCell(-1).appendChild(deleteButton); // Add button to the row
    });
};

// Function to delete a car from the cars array and update the table
const deleteCar = (index) => {
    cars.splice(index, 1); // Remove the car at the given index
    localStorage.setItem('cars', JSON.stringify(cars)); // Update localStorage
    displayTable(); // Refresh the displayed table
    displayMessage("Car deleted successfully!"); // Show a success message
};

// Function to search for a car by license plate
const searchCar = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    const searchInput = document.querySelector("#search").value.trim(); // Get the search input
    const foundCar = cars.find((car) => car.license.toLowerCase() === searchInput.toLowerCase()); // Search for the car

    const searchResult = document.querySelector("#searchResult"); // Select the search result display element

    if (foundCar) {
        // If car is found, display its details
        const originalPrice = foundCar.price.toFixed(2);
        const discountedPrice = foundCar.isEligibleForDiscount()
            ? `$${foundCar.getDiscountedPrice().toFixed(2)}`
            : "No Discount";

        searchResult.innerHTML = `
            <p>Maker: ${foundCar.maker}</p>
            <p>Model: ${foundCar.model}</p>
            <p>Owner: ${foundCar.owner}</p>
            <p>Year: ${foundCar.year}</p>
            <p>Original Price: $${originalPrice}</p>
            <p>Discounted Price: ${discountedPrice}</p>
            <p>Color: ${foundCar.color}</p>
        `;
    } else {
        // If no car is found, display a not found message
        searchResult.innerHTML = "<p>No car found with the given license plate.</p>";
    }
};

// Add event listeners for form submissions and loading cars from localStorage
addCarForm.addEventListener("submit", addCar);
searchCarForm.addEventListener("submit", searchCar);
window.addEventListener('load', loadCarsFromLocalStorage);
