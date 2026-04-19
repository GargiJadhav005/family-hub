/** Last 10 digits for /api/enquiry (India-style input). */
export function normalizeEnquiryPhoneDigits(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits.length <= 10 ? digits : digits.slice(-10);
}

export function buildAdmissionEnquiryPayload(input: {
  studentName: string;
  dob: string;
  grade: string;
  gender: string;
  parentName: string;
  phone: string;
  email: string;
  message: string;
}): { name: string; email: string; phone: string; message: string } | { error: string } {
  const phone = normalizeEnquiryPhoneDigits(input.phone);
  if (phone.length !== 10) {
    return { error: "कृपया १० अंकी वैध फोन नंबर टाका." };
  }
  const email = input.email.trim();
  if (!email) {
    return { error: "कृपया ईमेल पत्ता भरा." };
  }
  const name = input.studentName.trim() || input.parentName.trim();
  if (!name) {
    return { error: "कृपया विद्यार्थ्याचे किंवा पालकाचे नाव भरा." };
  }
  const parts = [
    "प्रवेश अर्ज / चौकशी",
    `विद्यार्थी: ${input.studentName.trim()}`,
    input.parentName.trim() ? `पालक: ${input.parentName.trim()}` : "",
    input.grade ? `इयत्ता: ${input.grade}` : "",
    input.dob ? `जन्मतारीख: ${input.dob}` : "",
    input.gender ? `लिंग: ${input.gender}` : "",
    input.message.trim() ? `अतिरिक्त: ${input.message.trim()}` : "",
  ].filter(Boolean);
  let message = parts.join("\n");
  if (message.length < 10) {
    message = `${message}\n— शाळेशी संपर्क विनंती`;
  }
  return { name, email, phone, message };
}
