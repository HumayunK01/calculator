import './style.css'
import { Calculator } from './calculator'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="calculator">
    <div class="display">
      <div id="calculation-history" class="calculation-history"></div>
      <div id="display" class="display-text">0</div>
    </div>
    <div class="buttons">
      <button class="btn clear" data-action="clear">AC</button>
      <button class="btn function" data-action="percentage">%</button>
      <button class="btn function" data-action="negate">+/-</button>
      <button class="btn operator" data-action="operation" data-operation="÷">÷</button>

      <button class="btn number" data-number="7">7</button>
      <button class="btn number" data-number="8">8</button>
      <button class="btn number" data-number="9">9</button>
      <button class="btn operator" data-action="operation" data-operation="*">x</button>

      <button class="btn number" data-number="4">4</button>
      <button class="btn number" data-number="5">5</button>
      <button class="btn number" data-number="6">6</button>
      <button class="btn operator" data-action="operation" data-operation="-">-</button>

      <button class="btn number" data-number="1">1</button>
      <button class="btn number" data-number="2">2</button>
      <button class="btn number" data-number="3">3</button>
      <button class="btn operator" data-action="operation" data-operation="+">+</button>

      <button class="btn number zero" data-number="0">0</button>
      <button class="btn decimal" data-action="decimal">.</button>
      <button class="btn equals" data-action="calculate">=</button>
    </div>
  </div>
`

// Initialize calculator
const calculator = new Calculator();
const displayElement = document.getElementById('display') as HTMLDivElement;
const historyElement = document.getElementById('calculation-history') as HTMLDivElement;

// Update display function
function updateDisplay() {
  // Format the current value for display
  const currentValue = calculator.getCurrentValue();

  // Check if there's an error
  if (calculator.isError()) {
    // Display error state
    displayElement.textContent = 'Error';
    displayElement.classList.add('error');

    // Show error message in history area
    historyElement.textContent = calculator.getErrorMessage();
    historyElement.classList.add('error-message');
  } else {
    // Normal display
    displayElement.textContent = formatNumberForDisplay(currentValue);
    displayElement.classList.remove('error');

    // Update calculation history display
    const history = calculator.getCalculationHistory();
    historyElement.textContent = history;
    historyElement.classList.remove('error-message');

    // Add a small animation to the display when updated
    displayElement.classList.add('updated');
    setTimeout(() => {
      displayElement.classList.remove('updated');
    }, 150);
  }
}

// Helper function to format numbers for display
function formatNumberForDisplay(value: string): string {
  if (value === 'Error') return value;

  // Parse the number
  const num = parseFloat(value);
  if (isNaN(num)) return value;

  // Format with commas for thousands
  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

// Add event listeners to buttons
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', () => {
    const element = button as HTMLElement;

    // Handle number buttons
    if (element.dataset.number) {
      calculator.appendNumber(element.dataset.number);
      updateDisplay();
    }

    // Handle operation buttons
    if (element.dataset.action === 'operation' && element.dataset.operation) {
      calculator.setOperation(element.dataset.operation);
      updateDisplay();
    }

    // Handle decimal button
    if (element.dataset.action === 'decimal') {
      calculator.appendDecimal();
      updateDisplay();
    }

    // Handle equals button
    if (element.dataset.action === 'calculate') {
      calculator.calculate();
      updateDisplay();
    }

    // Handle clear button
    if (element.dataset.action === 'clear') {
      calculator.clear();
      updateDisplay();
    }

    // Handle percentage button
    if (element.dataset.action === 'percentage') {
      calculator.percentage();
      updateDisplay();
    }

    // Handle negate button
    if (element.dataset.action === 'negate') {
      calculator.negate();
      updateDisplay();
    }
  });
});
