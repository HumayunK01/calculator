export class Calculator {
  private currentValue: string = '0';
  private previousValue: string = '';
  private operation: string | null = null;
  private shouldResetDisplay: boolean = false;
  private calculationHistory: string = '';
  private fullExpression: string = '';
  private lastResult: number | null = null;
  private errorState: boolean = false;
  private errorMessage: string = '';

  // Error messages
  private static readonly ERROR_DIVISION_BY_ZERO = 'Cannot divide by zero';
  private static readonly ERROR_INVALID_OPERATION = 'Invalid operation';
  private static readonly ERROR_OVERFLOW = 'Number too large';
  private static readonly ERROR_SYNTAX = 'Syntax error';

  constructor() {}

  public getCurrentValue(): string {
    return this.currentValue;
  }

  public getPreviousValue(): string {
    return this.previousValue;
  }

  public getOperation(): string | null {
    return this.operation;
  }

  public getCalculationHistory(): string {
    return this.calculationHistory;
  }

  public isError(): boolean {
    return this.errorState;
  }

  public getErrorMessage(): string {
    return this.errorMessage;
  }

  private setError(message: string): void {
    this.errorState = true;
    this.errorMessage = message;
    this.currentValue = 'Error';
  }

  private clearError(): void {
    this.errorState = false;
    this.errorMessage = '';
  }

  public appendNumber(number: string): void {
    // If in error state, clear it when starting a new number
    if (this.errorState) {
      this.clear();
    }

    if (this.currentValue === '0' || this.shouldResetDisplay) {
      this.currentValue = number;
      this.shouldResetDisplay = false;
    } else {
      // Check if adding this digit would cause an overflow
      if (this.currentValue.length >= 16 && !this.currentValue.includes('.')) {
        this.setError(Calculator.ERROR_OVERFLOW);
        return;
      }
      this.currentValue += number;
    }

    // If we have a completed calculation and start typing a new number,
    // clear the history and start fresh
    if (this.lastResult !== null && !this.operation) {
      this.fullExpression = '';
      this.calculationHistory = '';
      this.lastResult = null;
    }
  }

  public appendDecimal(): void {
    // If in error state, clear it when starting a new number
    if (this.errorState) {
      this.clear();
    }

    if (this.shouldResetDisplay) {
      this.currentValue = '0.';
      this.shouldResetDisplay = false;
    } else if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
    }
  }

  public setOperation(operation: string): void {
    // If in error state, don't allow operations
    if (this.errorState) {
      return;
    }

    try {
      // If we already have an operation pending, calculate the intermediate result
      if (this.operation !== null) {
        this.calculateIntermediateResult();
      } else {
        // If this is the first operation, add the current value to the expression
        if (this.fullExpression === '') {
          this.fullExpression = this.currentValue;
        }
      }

      // If an error occurred during calculation, don't proceed
      if (this.errorState) {
        return;
      }

      this.operation = operation;
      this.previousValue = this.currentValue;
      this.shouldResetDisplay = true;

      // Update calculation history
      this.updateCalculationHistory();
    } catch (error) {
      this.setError(Calculator.ERROR_INVALID_OPERATION);
    }
  }

  private calculateIntermediateResult(): void {
    if (this.operation === null || this.previousValue === '') {
      return;
    }

    try {
      const prev = parseFloat(this.previousValue);
      const current = parseFloat(this.currentValue);

      // Check for NaN values
      if (isNaN(prev) || isNaN(current)) {
        this.setError(Calculator.ERROR_SYNTAX);
        return;
      }

      let result: number;

      // Perform the operation
      switch (this.operation) {
        case '+':
          result = prev + current;
          break;
        case '-':
          result = prev - current;
          break;
        case '*':
          result = prev * current;
          break;
        case '÷':
          // Check for division by zero
          if (current === 0) {
            this.setError(Calculator.ERROR_DIVISION_BY_ZERO);
            return;
          }
          result = prev / current;
          break;
        default:
          this.setError(Calculator.ERROR_INVALID_OPERATION);
          return;
      }

      // Check for overflow or invalid result
      if (!isFinite(result)) {
        this.setError(Calculator.ERROR_OVERFLOW);
        return;
      }

      // Update the full expression
      this.fullExpression += ` ${this.getOperationSymbol(this.operation)} ${this.currentValue}`;

      // Update the current value with the result
      this.currentValue = result.toString();

    } catch (error) {
      this.setError(Calculator.ERROR_INVALID_OPERATION);
    }
  }

  public percentage(): void {
    // If in error state, don't allow operations
    if (this.errorState) {
      return;
    }

    try {
      const current = parseFloat(this.currentValue);

      // Check for NaN
      if (isNaN(current)) {
        this.setError(Calculator.ERROR_SYNTAX);
        return;
      }

      let result: number;

      if (this.operation !== null && this.previousValue !== '') {
        // If in the middle of an operation, calculate percentage of the first number
        const prev = parseFloat(this.previousValue);

        // Check for NaN
        if (isNaN(prev)) {
          this.setError(Calculator.ERROR_SYNTAX);
          return;
        }

        result = (prev * current / 100);
      } else {
        // Otherwise just convert to percentage (divide by 100)
        result = (current / 100);
      }

      // Check for overflow or invalid result
      if (!isFinite(result)) {
        this.setError(Calculator.ERROR_OVERFLOW);
        return;
      }

      this.currentValue = result.toString();
    } catch (error) {
      this.setError(Calculator.ERROR_INVALID_OPERATION);
    }
  }

  public negate(): void {
    // If in error state, don't allow operations
    if (this.errorState) {
      return;
    }

    if (this.currentValue !== '0') {
      try {
        const current = parseFloat(this.currentValue);

        // Check for NaN
        if (isNaN(current)) {
          this.setError(Calculator.ERROR_SYNTAX);
          return;
        }

        // Negate the value
        const result = -current;

        // Check for overflow or invalid result
        if (!isFinite(result)) {
          this.setError(Calculator.ERROR_OVERFLOW);
          return;
        }

        this.currentValue = result.toString();
      } catch (error) {
        this.setError(Calculator.ERROR_INVALID_OPERATION);
      }
    }
  }

  public calculate(): void {
    // If in error state, don't allow operations
    if (this.errorState) {
      return;
    }

    // If there's no operation, nothing to calculate
    if (this.operation === null) {
      return;
    }

    try {
      // Calculate the final result
      this.calculateIntermediateResult();

      // If an error occurred during calculation, don't proceed
      if (this.errorState) {
        return;
      }

      // Store the result for potential future operations
      const result = parseFloat(this.currentValue);

      // Check for NaN
      if (isNaN(result)) {
        this.setError(Calculator.ERROR_SYNTAX);
        return;
      }

      this.lastResult = result;

      // Format the calculation history to show the full expression and result
      this.calculationHistory = `${this.fullExpression} = `;

      // Reset for next calculation
      this.operation = null;
      this.previousValue = '';
      this.fullExpression = this.currentValue;
    } catch (error) {
      this.setError(Calculator.ERROR_INVALID_OPERATION);
    }
  }

  /**
   * Evaluates a mathematical expression following BODMAS/BIDMAS rules
   * This is a more advanced method that could replace the current calculation logic
   * to handle complex expressions with proper order of operations
   */
  public evaluateExpression(expression: string): number {
    // Clear any previous errors
    this.clearError();

    // Remove all spaces
    expression = expression.replace(/\s+/g, '');

    // Check for empty expression
    if (!expression) {
      this.setError(Calculator.ERROR_SYNTAX);
      return NaN;
    }

    // Replace visual symbols with JavaScript operators
    expression = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

    // Check for division by zero
    if (/\/\s*0(?![0-9.])/g.test(expression)) {
      this.setError(Calculator.ERROR_DIVISION_BY_ZERO);
      return NaN;
    }

    try {
      // Use Function constructor to evaluate the expression
      // This is safer than eval() and follows proper order of operations
      const result = Function(`'use strict'; return (${expression})`)();

      // Check for NaN or infinity
      if (isNaN(result)) {
        this.setError(Calculator.ERROR_SYNTAX);
        return NaN;
      }

      if (!isFinite(result)) {
        this.setError(Calculator.ERROR_OVERFLOW);
        return NaN;
      }

      return result;
    } catch (error) {
      console.error('Error evaluating expression:', error);
      this.setError(Calculator.ERROR_SYNTAX);
      return NaN;
    }
  }

  private getOperationSymbol(operation: string): string {
    switch (operation) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '÷': return '÷';
      default: return operation;
    }
  }

  private updateCalculationHistory(): void {
    if (this.operation && this.previousValue) {
      // If we have a previous calculation, show the full expression
      this.calculationHistory = this.fullExpression
        ? `${this.fullExpression} ${this.getOperationSymbol(this.operation)}`
        : `${this.previousValue} ${this.getOperationSymbol(this.operation)}`;
    }
  }

  public clear(): void {
    this.currentValue = '0';
    this.previousValue = '';
    this.operation = null;
    this.shouldResetDisplay = false;
    this.calculationHistory = '';
    this.fullExpression = '';
    this.lastResult = null;
    this.clearError();
  }
}
