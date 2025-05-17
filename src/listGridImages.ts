import fetch from "node-fetch";

export type GridImage = {
  url: string;
  alt: string;
};

export async function listGridImages(): Promise<GridImage[]> {
  try {
    const response = await fetch("https://www.a-ok.shop/api/gallery");
    const data = await response.json();
    // Convert relative URLs to absolute URLs
    const images: GridImage[] = data.images.map((image: any) => ({
      url: `https://www.a-ok.shop${image.url}`,
      alt: image.alt || image.altText || "",
    }));
    return images;
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }
}
