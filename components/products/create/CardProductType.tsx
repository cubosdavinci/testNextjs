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
  [PRODUCT_TYPE.ThreeD]: "/icons/product-type/streamline-ultimate-color--shape-cube.svg",
  [PRODUCT_TYPE.Image]: "/icons/product-type/streamline-ultimate-color:picture-sun.svg",
  [PRODUCT_TYPE.Video]: "/icons/product-type/streamline-ultimate-color:video-player.svg",
  [PRODUCT_TYPE.Music]: "/icons/product-type/streamline-ultimate-color:voice-id-approved.svg",
  [PRODUCT_TYPE.EBooks]: "/icons/product-type/streamline-ultimate-color:book-close-bookmark-1.svg",
  [PRODUCT_TYPE.ABooks]: "/icons/product-type/streamline-ultimate-color:vinyl-record.svg",
  [PRODUCT_TYPE.Apps]: "/icons/product-type/streamline-ultimate-color:app-window-two.svg",
  [PRODUCT_TYPE.Games]: "/icons/product-type/streamline-ultimate-color:skiing-snow-scooter-person.svg",
  [PRODUCT_TYPE.Courses]: "/icons/product-type/streamline-ultimate-color:archive-books.svg",
  [PRODUCT_TYPE.Fonts]: "/icons/product-type/streamline-ultimate-color:font-size.svg",
  [PRODUCT_TYPE.Icons]: "/icons/product-type/streamline-ultimate-color:shape-triangle-circle.svg",
  [PRODUCT_TYPE.Templates]: "/icons/product-type/streamline-ultimate-color:shapes.svg",
  [PRODUCT_TYPE.Vector]: "/icons/product-type/streamline-ultimate-color:vectors-pen-draw.svg",

  [PRODUCT_TYPE.ARVR]: "/icons/product-type/streamline-ultimate-color:composition-window-human.svg",
  [PRODUCT_TYPE.IoT]: "/icons/product-type/streamline-ultimate-color:hard-drive-1.svg",
  [PRODUCT_TYPE.Technical]: "/icons/product-type/streamline-ultimate-color:project-blueprint-home.svg",

  [PRODUCT_TYPE.Other]: "/icons/product-type/streamline-ultimate-color:human-resources-rating-woman.svg",
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
              <div className="flex items-center gap-2">
                <img
                  src={iconMap[productType]}
                  alt={productType}
                  className="w-6 h-6"
                />
                <span>
                  {productType.charAt(0).toUpperCase() + productType.slice(1)}
                </span>
              </div>
              <span className="text-gray-500">▼</span>
            </div>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded mt-1 shadow-lg z-10">
                {Object.entries(PRODUCT_TYPE).map(([key, value]) => (
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
