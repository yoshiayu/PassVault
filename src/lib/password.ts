const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*-_+?";

export type PasswordPolicy = {
  length: number;
  requireUpper?: boolean;
  requireLower?: boolean;
  requireDigit?: boolean;
  requireSymbol?: boolean;
  minClasses?: number;
  maxConsecutive?: number;
};

export type PasswordPreset = "alpha" | "alnum" | "full";

function randomChar(set: string): string {
  return set[Math.floor(Math.random() * set.length)] ?? "";
}

function shuffle(value: string): string {
  return value
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export function generatePassword(policy: PasswordPolicy): string {
  const length = Math.min(15, Math.max(6, policy.length));
  const classes = [
    { enabled: policy.requireUpper ?? true, chars: UPPER },
    { enabled: policy.requireLower ?? true, chars: LOWER },
    { enabled: policy.requireDigit ?? true, chars: DIGITS },
    { enabled: policy.requireSymbol ?? true, chars: SYMBOLS }
  ].filter((item) => item.enabled);

  const minClasses = Math.min(classes.length, policy.minClasses ?? 4);
  if (classes.length === 0) {
    throw new Error("Password policy requires at least one class");
  }

  const maxConsecutive = Math.max(1, policy.maxConsecutive ?? 2);
  const pool = classes.map((item) => item.chars).join("");

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const required = classes.slice(0, minClasses).map((item) => randomChar(item.chars)).join("");
    let result = required;
    while (result.length < length) {
      result += randomChar(pool);
    }
    result = shuffle(result);

    let streak = 1;
    let valid = true;
    for (let i = 1; i < result.length; i += 1) {
      if (result[i] === result[i - 1]) {
        streak += 1;
        if (streak > maxConsecutive) {
          valid = false;
          break;
        }
      } else {
        streak = 1;
      }
    }

    if (valid) {
      return result;
    }
  }

  throw new Error("Failed to generate password with the requested policy");
}

export function policyFromPreset(preset: PasswordPreset, length: number): PasswordPolicy {
  switch (preset) {
    case "alpha":
      return {
        length,
        requireUpper: true,
        requireLower: true,
        requireDigit: false,
        requireSymbol: false,
        minClasses: 2,
        maxConsecutive: 2
      };
    case "alnum":
      return {
        length,
        requireUpper: true,
        requireLower: true,
        requireDigit: true,
        requireSymbol: false,
        minClasses: 3,
        maxConsecutive: 2
      };
    case "full":
    default:
      return {
        length,
        requireUpper: true,
        requireLower: true,
        requireDigit: true,
        requireSymbol: true,
        minClasses: 4,
        maxConsecutive: 2
      };
  }
}
