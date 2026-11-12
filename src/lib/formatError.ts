/**
 * PeltaPay Centralized Error Humanizer
 * Converts technical API exceptions, network errors, and database/Joi validation strings
 * into polite, actionable, human-readable messages for clients.
 */
export function formatHumanError(error: any): string {
  if (!error) {
    return "An unexpected error occurred. Please try again.";
  }

  const status = error.response?.status || error.status;
  const rawMsg =
    error.response?.data?.message ||
    error.message ||
    (typeof error === "string" ? error : "");

  const lowerMsg = typeof rawMsg === "string" ? rawMsg.toLowerCase() : "";

  // 1. Network & Connectivity Errors
  if (
    error.code === "ERR_NETWORK" ||
    lowerMsg.includes("network error") ||
    lowerMsg.includes("failed to fetch") ||
    lowerMsg.includes("econnrefused") ||
    lowerMsg.includes("enotfound")
  ) {
    return "Unable to connect to PeltaPay secure servers. Please check your internet connection and try again.";
  }

  // 2. Timeout Errors
  if (
    error.code === "ECONNABORTED" ||
    lowerMsg.includes("timeout") ||
    lowerMsg.includes("timed out")
  ) {
    return "The server took longer than expected to respond. Please check your connection and try again.";
  }

  // 3. 404 / Missing Route Errors (Graceful handling during deployments or invalid endpoints)
  if (
    status === 404 ||
    lowerMsg.startsWith("not found - /api") ||
    lowerMsg.startsWith("cannot post /api") ||
    lowerMsg.startsWith("cannot get /api")
  ) {
    if (lowerMsg.includes("claim")) {
      return "Unable to process account verification at this time. Please try again shortly or contact support@peltapay.com.";
    }
    return "The requested service or page is momentarily unavailable while updating. Please refresh or try again in a few moments.";
  }

  // 4. Rate Limiting (429)
  if (status === 429 || lowerMsg.includes("too many requests")) {
    return "Too many requests. For your security, please wait a minute before trying again.";
  }

  // 5. Gateway & Server Transitions (502, 503, 504)
  if (status === 502 || status === 503 || status === 504) {
    return "PeltaPay secure services are briefly updating. Please wait a moment and try again.";
  }

  // 6. Generic 500 Server Errors
  if (
    status === 500 &&
    (lowerMsg.includes("internal server error") ||
      lowerMsg.includes("sequelize") ||
      lowerMsg.includes("syntaxerror"))
  ) {
    return "We encountered a temporary processing issue on our servers. Our team has been notified. Please try again shortly.";
  }

  // 7. Humanize Joi and Validation Strings
  if (typeof rawMsg === "string") {
    // Strip quotes around property names (e.g. "password" -> password)
    let clean = rawMsg.replace(/"/g, "").trim();

    // Specific validation conflict resolutions
    if (clean.includes("contains a conflict between exclusive peers")) {
      return "Please provide either email or phone number, not both.";
    }
    if (
      clean.includes("must contain at least one of [buyerEmail, buyerPhone]") ||
      clean.includes("buyerEmail, buyerPhone")
    ) {
      return "Please provide a valid buyer email address or WhatsApp/phone number.";
    }
    if (clean.includes("must be a valid email")) {
      return "Please enter a valid email address (e.g. name@example.com).";
    }
    if (clean.includes("is not allowed to be empty")) {
      const field = clean.replace(/is not allowed to be empty.*/i, "").trim();
      const friendly = field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      return `${friendly} cannot be empty. Please provide this detail or leave it blank.`;
    }
    if (clean.includes("fails to match the required pattern")) {
      return "One of the provided fields does not match the required format. Please check your details.";
    }
    if (clean.includes("length must be at least")) {
      return clean.replace(
        /length must be at least (\d+) characters.*/i,
        "Must be at least $1 characters long."
      );
    }
    if (clean.includes("User with this email or phone already exists")) {
      return "An account with this email address or phone number already exists. Please sign in or use another contact.";
    }
    if (clean.includes("already exists")) {
      return clean.charAt(0).toUpperCase() + clean.slice(1) + ". Please check your information or sign in.";
    }
    if (clean.includes("Invalid verification code")) {
      return "The verification code you entered is incorrect. Please check the 6-digit code and try again.";
    }
    if (clean.includes("Verification code has expired")) {
      return "Your verification code has expired. Please request a new code.";
    }
    if (clean.includes("Invalid email or password")) {
      return "The email or password you entered is incorrect. Please check your credentials and try again.";
    }
    if (clean.includes("Account restricted under statutory fiduciary freeze")) {
      return "Your account is temporarily restricted under fiduciary compliance review. Please contact PeltaPay Support at support@peltapay.com.";
    }

    // Capitalize first character
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return "An unexpected error occurred. Please try again.";
}

export default formatHumanError;
