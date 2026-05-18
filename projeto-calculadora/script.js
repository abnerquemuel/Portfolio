const expressionEl = document.querySelector("#expression");
const resultEl = document.querySelector("#result");
const keys = document.querySelector(".keys");

let expression = "";
let justCalculated = false;

const operators = new Set(["+", "-", "*", "/", "%"]);

function formatForDisplay(value) {
  return value
    .replaceAll("*", "x")
    .replaceAll("/", "/")
    .replaceAll("-", "-")
    .replaceAll(".", ",");
}

function updateDisplay(preview = null) {
  expressionEl.textContent = expression ? formatForDisplay(expression) : "0";
  resultEl.textContent = preview ?? (expression ? formatForDisplay(expression) : "0");
}

function appendValue(value) {
  if (justCalculated && !operators.has(value)) {
    expression = "";
  }

  justCalculated = false;
  const last = expression.at(-1);

  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/%]/).at(-1);
    if (currentNumber.includes(".")) return;
    expression += currentNumber ? "." : "0.";
    updateDisplay();
    return;
  }

  if (operators.has(value)) {
    if (!expression && value !== "-") return;
    if (operators.has(last)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
    updateDisplay();
    return;
  }

  expression += value;
  updateDisplay();
}

function clearCalculator() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function backspace() {
  expression = expression.slice(0, -1);
  justCalculated = false;
  updateDisplay();
}

function calculate() {
  if (!expression || operators.has(expression.at(-1))) return;

  try {
    const value = Function(`"use strict"; return (${expression})`)();

    if (!Number.isFinite(value)) {
      throw new Error("Invalid result");
    }

    const result = Number.isInteger(value)
      ? String(value)
      : String(Number(value.toFixed(10)));

    expressionEl.textContent = formatForDisplay(expression);
    resultEl.textContent = formatForDisplay(result);
    expression = result;
    justCalculated = true;
  } catch {
    expressionEl.textContent = "Erro";
    resultEl.textContent = "0";
    expression = "";
    justCalculated = false;
  }
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "clear") clearCalculator();
  if (button.dataset.action === "backspace") backspace();
  if (button.dataset.action === "calculate") calculate();
  if (button.dataset.value) appendValue(button.dataset.value);
});

window.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^\d$/.test(key)) appendValue(key);
  if (["+", "-", "*", "/", "%", "."].includes(key)) appendValue(key);
  if (key === ",") appendValue(".");
  if (key === "Enter" || key === "=") calculate();
  if (key === "Backspace") backspace();
  if (key === "Escape") clearCalculator();
});

updateDisplay();
