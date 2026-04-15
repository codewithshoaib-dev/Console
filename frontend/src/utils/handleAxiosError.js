export function handleAxiosError(error) {
  if (!error.response) {
    if (
      error.message?.includes("Couldn't connect to server. Please try again.")
    )
      return "Network error. Please check your connection.";
    if (error.message?.includes("timeout"))
      return "Request timed out. Please try again.";
    return "Something went wrong. Please try again later.";
  }

  const { data, status } = error.response;

  if (status >= 500) return "Server error. Please try again in a few minutes.";
  if (status === 404) return "Requested resource not found.";
  if (status === 403)
    return "You don’t have permission to perform this action.";
  if (status === 401) return "You’re not authorized. Please sign in.";

  if (typeof data === "string") return data;

  if (data?.detail) return data.detail;
  if (data?.message) return data.message;

  if (data && typeof data === "object") {
    const messages = [];
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) messages.push(`${key}: ${value.join(" ")}`);
      else if (typeof value === "string") messages.push(`${key}: ${value}`);
    }
    if (messages.length) return messages.join(" | ");
  }

  return "Unexpected error occurred. Please try again.";
}
