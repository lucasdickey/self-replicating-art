import { request, Variables } from "graphql-request";

const query = /* GraphQL */ `
  query ($first: Int!) {
    products(first: $first) {
      edges {
        node {
          title
          description
          media(first: 10) {
            edges {
              node {
                ... on MediaImage {
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

type ProductMedia = { url: string; alt: string };

type ShopifyResponse = {
  products: {
    edges: Array<{
      node: {
        title: string;
        media: {
          edges: Array<{
            node: {
              image: { url: string; altText: string };
            };
          }>;
        };
      };
    }>;
  };
};

export async function getProductMedia(): Promise<ProductMedia[]> {
  const res = await request<ShopifyResponse, Variables>(
    `https://${process.env.SHOPIFY_DOMAIN}/api/2024-10/graphql.json`,
    query,
    { first: 250 },
    {
      "X-Shopify-Storefront-Access-Token":
        process.env.SHOPIFY_STOREFRONT_TOKEN!,
    } as Record<string, string>
  );
  return res.products.edges.flatMap((e) =>
    e.node.media.edges.map((m) => ({
      url: m.node.image.url,
      alt: m.node.image.altText || e.node.title,
    }))
  );
}
