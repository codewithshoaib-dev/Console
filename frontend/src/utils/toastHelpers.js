import { useUIStore } from "../stores/useUIStore";

const ui = () => useUIStore.getState();

export const successToast = (message) => {
  ui().addToast({ message, type: "success" });
  ui().setSuccess(true);
};

export const errorToast = (err, fallback) => {
  const data = err?.response?.data || {};

  
  let message =
    data.detail || data.error || data.message || data.non_field_errors?.[0];

if (!message && typeof data === "object" && data !== null) {
 
  const [field, errors] = Object.entries(data)[0];

  const errorMessage = Array.isArray(errors) ? errors[0] : errors;

  if (typeof errorMessage === "string") {
   
    const isGeneric = field === "non_field_errors" || field === "detail";

    message = isGeneric
      ? errorMessage
      : `${formatFieldName(field)}: ${errorMessage}`;
  }
}

// Simple helper to turn "workspace_id" into "Workspace Id"
function formatFieldName(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

  // 3. Final fallback
  const finalMessage = message || fallback || "Something went wrong";

  ui().addToast({ message: finalMessage, type: "error" });
};
