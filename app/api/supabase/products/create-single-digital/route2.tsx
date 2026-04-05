import { NextRequest, NextResponse } from "next/server";
import { GraphQLClient, gql } from "graphql-request";

const SALEOR_API_URL = process.env.SALEOR_API_URL!;
const SALEOR_API_TOKEN = process.env.SALEOR_API_TOKEN!;

const client = new GraphQLClient(SALEOR_API_URL, {
  headers: { Authorization: `Bearer ${SALEOR_API_TOKEN}` },
});

export async function POST(req: NextRequest) {
  try {
    const { title, description, category, thumbnailUrl, price, urlContentLink, productTypeId } =
      await req.json();

    if (!title || !price || !urlContentLink) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1️⃣ Create Product
    const productMutation = gql`
      mutation CreateProduct($input: ProductCreateInput!) {
        productCreate(input: $input) {
          product {
            id
            name
          }
          errors {
            field
            message
          }
        }
      }
    `;

    const productInput = {
      name: title,
      descriptionJson: JSON.stringify({
        blocks: [{ type: "paragraph", data: { text: description || "" } }],
      }),
      category: category || null,
      productType: productTypeId, // your digital product type ID
      thumbnail: thumbnailUrl || null,
      isPublished: true,
    };

    const productRes = await client.request(productMutation, { input: productInput });

    const product = productRes.productCreate.product;
    if (!product) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    // 2️⃣ Create Default Variant with digital content
    const variantMutation = gql`
      mutation CreateVariant($input: ProductVariantCreateInput!) {
        productVariantCreate(input: $input) {
          productVariant {
            id
          }
          errors {
            field
            message
          }
        }
      }
    `;

    const variantInput = {
      product: product.id,
      name: "Default",
      price: parseFloat(price),
      digitalContent: {
        contentFileUrl: urlContentLink,
        useDefaultSettings: true,
      },
    };

    const variantRes = await client.request(variantMutation, { input: variantInput });

    if (!variantRes.productVariantCreate.productVariant) {
      return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
    }

    return NextResponse.json({ success: true, productId: product.id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}