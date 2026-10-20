const display = document.getElementById('display');
let expression = '';

function updateDisplay() {
  display.value = expression || '0';
}

function appendNumber(value) {
  if (expression === 'Error') {
    expression = '';
  }

  if (value === '.' && expression.includes('.')) {
    return;
  }

  if (expression === '0') {
    expression = value === '.' ? '0.' : value;
  } else if (value === '.' && /[+\-*/]$/.test(expression)) {
    expression += '0.';
  } else {
    expression += value;
  }

  updateDisplay();
}

function appendOperator(operator) {
  if (expression === 'Error') {
    expression = '';
  }

  if (!expression) {
    if (operator === '-') {
      expression = '-';
    }
    updateDisplay();
    return;
  }

  const lastChar = expression.slice(-1);
  if (/[+\-*/]/.test(lastChar)) {
    expression = expression.slice(0, -1) + operator;
  } else {
    expression += operator;
  }

  updateDisplay();
}

function deleteLast() {
  if (expression === 'Error') {
    expression = '';
    updateDisplay();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
}

function clearAll() {
  expression = '';
  updateDisplay();
}

function applyOperator(a, b, operator) {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) {
        throw new Error('Division by zero');
      }
      return a / b;
    default:
      throw new Error('Invalid operator');
  }
}

function evaluateExpression(input) {
  const tokens = input.match(/\d*\.?\d+|[+\-*/]/g);

  if (!tokens || tokens.length === 0) {
    return '0';
  }

  const values = [];
  const operators = [];

  const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
  };

  const applyPendingOperator = () => {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();
    values.push(applyOperator(left, right, operator));
  };

  for (const token of tokens) {
    if (/^\d*\.?\d+$/.test(token)) {
      values.push(Number(token));
      continue;
    }

    while (
      operators.length &&
      precedence[operators[operators.length - 1]] >= precedence[token]
    ) {
      applyPendingOperator();
    }

    operators.push(token);
  }

  while (operators.length) {
    applyPendingOperator();
  }

  if (values.length !== 1 || !Number.isFinite(values[0])) {
    throw new Error('Invalid expression');
  }

  return String(values[0]);
}

function calculateResult() {
  if (!expression || expression === 'Error') {
    return;
  }

  try {
    const result = evaluateExpression(expression);
    expression = Number(result).toString();
  } catch (error) {
    expression = 'Error';
  }

  updateDisplay();
}

function handleButtonClick(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const value = button.dataset.value;
  const action = button.dataset.action;

  if (value) {
    if (/[0-9.]/.test(value)) {
      appendNumber(value);
    } else {
      appendOperator(value);
    }
    return;
  }

  if (action === 'clear') {
    clearAll();
  }

  if (action === 'delete') {
    deleteLast();
  }

  if (action === 'calculate') {
    calculateResult();
  }
}

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', handleButtonClick);
});

updateDisplay();
