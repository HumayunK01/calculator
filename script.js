// Function to append clicked button value to the display
function appendValue(value) {
    document.getElementById("display").value += value;
}

// Function to clear the entire display
function clearDisplay() {
    document.getElementById("display").value = "";
}

// Function to delete the last entered character
function deleteLast() {
    let display = document.getElementById("display");
    display.value = display.value.toString().slice(0, -1);
}

// Function to evaluate the expression safely with error handling
function calculateResult() {
    try {
        let expression = document.getElementById("display").value;

        // Prevent division by zero
        if (/\/0(?!\d)/.test(expression)) {
            throw new Error("Cannot divide by zero");
        }

        // Use Function constructor to evaluate the expression safely
        let result = new Function(`return ${expression}`)();

        // Check for invalid results (NaN, undefined, Infinity)
        if (!isFinite(result) || isNaN(result)) {
            throw new Error("Math Error");
        }

        document.getElementById("display").value = result;
    } catch (error) {
        document.getElementById("display").value = error.message;
    }
}
