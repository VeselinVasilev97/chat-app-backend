export const decodeCookie = (cookieValue: string) => {
    try {
        const decoded = decodeURIComponent(cookieValue);
        const jsonString = decoded.startsWith("j:") ? decoded.slice(2) : decoded;
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error decoding cookie:", error);
        return null;
    }
};