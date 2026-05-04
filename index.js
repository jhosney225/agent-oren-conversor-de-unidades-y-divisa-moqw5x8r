
```javascript
import Anthropic from "@anthropic-ai/sdk";
import readline from "readline";

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// Datos de conversión de divisas (tasas actuales aproximadas)
const exchangeRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.1,
  MXN: 17.05,
};

// Unidades de conversión
const lengthUnits = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.34,
};

const weightUnits = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  ton: 1000000,
};

const temperatureUnits = {
  C: "celsius",
  F: "fahrenheit",
  K: "kelvin",
};

function convertLength(value, fromUnit, toUnit) {
  const valueInMeters = value * lengthUnits[fromUnit];
  return valueInMeters / lengthUnits[toUnit];
}

function convertWeight(value, fromUnit, toUnit) {
  const valueInGrams = value * weightUnits[fromUnit];
  return valueInGrams / weightUnits[toUnit];
}

function convertTemperature(value, fromUnit, toUnit) {
  let celsius;

  if (fromUnit === "C") {
    celsius = value;
  } else if (fromUnit === "F") {
    celsius = (value - 32) * (5 / 9);
  } else if (fromUnit === "K") {
    celsius = value - 273.15;
  }

  if (toUnit === "C") {
    return celsius;
  } else if (toUnit === "F") {
    return celsius * (9 / 5) + 32;
  } else if (toUnit === "K") {
    return celsius + 273.15;
  }
}

function convertCurrency(amount, fromCurrency, toCurrency) {
  const amountInUSD = amount / exchangeRates[fromCurrency];
  return amountInUSD * exchangeRates[toCurrency];
}

const tools = [
  {
    name: "convert_length",
    description:
      "Convierte entre unidades de longitud (mm, cm, m, km, in, ft, yd, mi)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "El valor a convertir",
        },
        from_unit: {
          type: "string",
          description:
            "Unidad de origen (mm, cm, m, km, in, ft, yd, mi o similares)",
        },
        to_unit: {
          type: "string",
          description:
            "Unidad destino (mm, cm, m, km, in, ft, yd, mi o similares)",
        },
      },
      required: ["value", "from_unit", "to_unit"],
    },
  },
  {
    name: "convert_weight",
    description:
      "Convierte entre unidades de peso (mg, g, kg, oz, lb, ton)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "El valor a convertir",
        },
        from_unit: {
          type: "string",
          description: "Unidad de origen (mg, g, kg, oz, lb, ton o similares)",
        },
        to_unit: {
          type: "string",
          description: "Unidad destino (mg, g, kg, oz, lb, ton o similares)",
        },
      },
      required: ["value", "from_unit", "to_unit"],
    },
  },
  {
    name: "convert_temperature",
    description:
      "Convierte entre escalas de temperatura (Celsius, Fahrenheit, Kelvin)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "El valor de temperatura a convertir",
        },
        from_unit: {
          type: "string",
          description: "Escala de origen (C, F, K)",
        },
        to_unit: {
          type: "string",
          description: "Escala destino (C, F, K)",
        },
      },
      required: ["value", "from_unit", "to_unit"],
    },
  },
  {
    name: "convert_currency",
    description: `Convierte entre monedas (${Object.keys(exchangeRates).join(", ")})`,
    input_schema: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "Cantidad de dinero a convertir",
        },
        from_currency: {
          type: "string",
          description: "Moneda de origen (ej: USD, EUR, MXN, etc)",
        },
        to_currency: {
          type: "string",
          description: "Moneda destino (