// =========================
// 4. Build full file objects (IMPORTANT STEP)
// =========================
const builtFiles = await buildProductFiles(newProductFiles);

// Validate built files
const validatedFiles = builtFiles.map((f) =>
    CreateProductFileSchema.parse(f)
);