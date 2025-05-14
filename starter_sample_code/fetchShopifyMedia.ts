import { request } from "graphql-request";

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

export async function getProductMedia() {
  const res = await request(
    `https://${process.env.SHOPIFY_DOMAIN}/api/2024-10/graphql.json`,
    query,
    { first: 250 },
    {
      "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN,
    }
  );
  return res.products.edges.flatMap((e) =>
    e.node.media.edges.map((m) => ({
      url: m.node.image.url,
      alt: m.node.image.altText || e.node.title,
    }))
  );
}
