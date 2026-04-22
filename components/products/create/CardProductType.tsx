import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRODUCT_TYPE, ProductType } from "@/types/db/products/ProductType";
import ErrorAlert from "@/components/banners/ErrorAlert";

// Interface for props
interface CardProductTypeProps {
  cardTitle?: string;
  selectedProductType: ProductType;
  onProductTypeChange: (value: ProductType) => void;
}

export default function CardProductType({
  cardTitle = "Product Type",
  selectedProductType,
  onProductTypeChange,
}: CardProductTypeProps) {
  const [productType, setProductType] = useState<ProductType>(selectedProductType);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false); // For toggling dropdown visibility

  // Lift trimmed value to parent form automatically
  useEffect(() => {
    if (onProductTypeChange) {
      onProductTypeChange(productType); // Pass only the selected value to parent
    }
  }, [productType, onProductTypeChange]);

  // Handle option selection
  const handleSelectOption = (value: ProductType) => {
    setProductType(value); // Update the state with the selected value
    setIsOpen(false); // Close the dropdown after selection
  };

  // Map of product types to icons
const iconMap: Record<ProductType, string> = {
  [PRODUCT_TYPE.ThreeD]: "/images/root-categories/3d_64x64.png",
  [PRODUCT_TYPE.Image]: "/images/root-categories/image_64x64.png",
  [PRODUCT_TYPE.Video]: "/images/root-categories/video_64x64.png",
  [PRODUCT_TYPE.Music]: "/images/root-categories/audio_64x64.png",
  [PRODUCT_TYPE.EBooks]: "/images/root-categories/books2_64x64.png",
  [PRODUCT_TYPE.ABooks]: "/images/root-categories/books2_64x64.png",
  [PRODUCT_TYPE.Apps]: "/images/root-categories/apps_64x64.png",
  [PRODUCT_TYPE.Games]: "/images/root-categories/games_64x64.png",
  [PRODUCT_TYPE.Courses]: "/images/root-categories/courses_64x64.png",
  [PRODUCT_TYPE.Fonts]: "/images/root-categories/fonts_64x64.png",
  [PRODUCT_TYPE.Icons]: "/images/root-categories/logos_64x64.png",
  [PRODUCT_TYPE.Templates]: "/images/root-categories/templates_64x64.png",
  [PRODUCT_TYPE.Vector]: "/images/root-categories/tools_64x64.png",

  [PRODUCT_TYPE.ARVR]: "/images/root-categories/arvr_64x64.png",
  [PRODUCT_TYPE.IoT]: "/images/root-categories/iot_64x64.png",
  [PRODUCT_TYPE.Technical]: "/images/root-categories/technical_64x64.png",

  [PRODUCT_TYPE.Other]: "/images/root-categories/other_64x64.png",
};

  return (
    <section id="product-type">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            {cardTitle} <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {/* Custom dropdown */}
          <div
            className={`relative border p-2 rounded w-full ${error ? "border-red-500" : ""}`}
            onClick={() => setIsOpen(!isOpen)} // Toggle dropdown visibility on click
          >
            <div className="flex justify-between items-center">
              <span>{productType.charAt(0).toUpperCase() + productType.slice(1)}</span> {/* Display the selected value */}
              <span className="text-gray-500">▼</span> {/* Dropdown arrow */}
            </div>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded mt-1 shadow-lg z-10">
                {Object.entries(productType).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSelectOption(value as ProductType)} // Pass value on selection
                  >
                    <img
                      src={iconMap[value as ProductType]} // Display icon for each option
                      alt={value}
                      className="w-6 h-6 mr-2"
                    />
                    <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span> {/* Display option text */}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        </CardContent>
      </Card>
    </section>
  );
}
