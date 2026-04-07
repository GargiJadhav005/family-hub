/**
 * Simple Marathi to Roman Transliteration for Email Generation
 * Maps basic Marathi characters to Roman equivalents
 */

const marathiToRomanMap: { [key: string]: string } = {
  // Vowels (अ, आ, इ, ई, उ, ऊ, ए, ऐ, ओ, औ)
  अ: "a",
  आ: "aa",
  इ: "i",
  ई: "ii",
  उ: "u",
  ऊ: "uu",
  ए: "e",
  ऐ: "ai",
  ओ: "o",
  औ: "au",

  // Consonants with inherent 'a' sound
  क: "k",
  ख: "kh",
  ग: "g",
  घ: "gh",
  ङ: "ng",
  च: "ch",
  छ: "chh",
  ज: "j",
  झ: "jh",
  ञ: "ny",
  ट: "t",
  ठ: "th",
  ड: "d",
  ढ: "dh",
  ण: "n",
  त: "t",
  थ: "th",
  द: "d",
  ध: "dh",
  न: "n",
  प: "p",
  फ: "ph",
  ब: "b",
  भ: "bh",
  म: "m",
  य: "y",
  र: "r",
  ल: "l",
  व: "v",
  श: "sh",
  ष: "sh",
  स: "s",
  ह: "h",

  // Consonant clusters and ligatures
  क्ष: "ksh",
  त्र: "tr",
  ज्ञ: "gy",
  
  // Numerals
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

export function romanizeMarathi(marathiText: string): string {
  if (!marathiText) return "";

  // First try to map using the predefined map for known names
  let result = "";
  let i = 0;

  while (i < marathiText.length) {
    // Try longest match first (for clusters like क्ष)
    let matched = false;

    for (let len = 3; len >= 1; len--) {
      const substring = marathiText.substring(i, i + len);
      if (marathiToRomanMap[substring]) {
        result += marathiToRomanMap[substring];
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Skip unrecognized characters (like viramas, nuktas, etc.)
      i++;
    }
  }

  // Clean up the result
  result = result
    .toLowerCase()
    .replace(/aa/g, "a") // Simplify double vowels for emails
    .replace(/ii/g, "i")
    .replace(/uu/g, "u")
    .replace(/\s+/g, ".") // Replace spaces with dots
    .replace(/[^a-z0-9.-]/g, "") // Remove special characters
    .replace(/\.+/g, ".") // Remove consecutive dots
    .replace(/^\.+|\.+$/g, ""); // Remove leading/trailing dots

  return result;
}

/**
 * Generates an email from student name and roll number
 * Handles both English and Marathi names
 */
export function generateStudentEmail(
  studentName: string,
  roll: string
): string {
  // Check if name contains Marathi characters
  const marathiRegex = /[\u0900-\u097F]/;
  let emailName: string;

  if (marathiRegex.test(studentName)) {
    emailName = romanizeMarathi(studentName);
  } else {
    emailName = studentName
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim()
      .replace(/\s+/g, ".");
  }

  // Ensure we have a valid email name
  if (!emailName) {
    emailName = `student${roll}`;
  }

  return `${emailName}.${roll}@vainateya.edu`;
}

/**
 * Generates a parent email from student name and roll
 */
export function generateParentEmail(
  studentName: string,
  roll: string
): string {
  const studentEmail = generateStudentEmail(studentName, roll);
  return `parent.${studentEmail.split("@")[0]}@vainateya.edu`;
}
