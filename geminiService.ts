

export const getMessageInsight = async (messageText: string) => {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageText }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from backend");
    }

    return await response.json();
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
};
