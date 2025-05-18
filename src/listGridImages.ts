import fetch from "node-fetch";

export async function listGridImages() {
  try {
    const response = await fetch("https://www.a-ok.shop/api/gallery");
    const data = await response.json();
    // Convert relative URLs to absolute URLs, but don't modify absolute URLs
    const images = data.images.map((image: any) => ({
      ...image,
      url: image.url.startsWith('http') 
        ? image.url 
        : `https://www.a-ok.shop${image.url.startsWith('/') ? '' : '/'}${image.url}`,
    }));
    return images;
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }
}
