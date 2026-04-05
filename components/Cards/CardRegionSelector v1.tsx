import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegionEnum } from "@/lib/db/licenses/types/enums/RegionEnum";
import { RegionEnumIcons } from "@/lib/db/licenses/types/enums/RegionEnumIcons"; // Import the mapping
import 'flag-icons/css/flag-icons.min.css'; // Import flag icons
import ErrorAlert from "@/components/banners/ErrorAlert";
import { MembershipEnum } from "@/lib/enum/MembershipEnum";

interface CardRegionSelectorProps {
  cardTitle?: string;
  value: RegionEnum; // Enum value for selected region
  setValue?: (value: RegionEnum) => void; // Function to set the value in the parent component
  regionIcons: RegionEnumIcons; // Custom region-to-icon mapping
  regionsAllowed?: RegionEnum[]; // Subset of RegionEnum to limit the dropdown options
  membership?: MembershipEnum;
  userRegion?: RegionEnum;
}

export default function CardRegionSelector({
  cardTitle = "Region",
  value,
  setValue,
  regionIcons,
  regionsAllowed = [], // Default to an empty array if not provided
  membership = MembershipEnum.Free,
  userRegion = RegionEnum.UnitedStates,
}: CardRegionSelectorProps) {
  const [region, setRegion] = useState<RegionEnum>(
  membership === MembershipEnum.Free 
    ? userRegion 
    : (value && Object.values(RegionEnum).includes(value) ? value : RegionEnum.Global)
);
  const [error, setError] = useState<string | null>(null); // Error handling (if needed)
  const [isOpen, setIsOpen] = useState(false); // Dropdown visibility state

  // Sync selected region with the parent component via setValue
  useEffect(() => {      
      setRegion // Pass region to parent via setValue if it exists
  }, [region, setValue]);

  // Handle selection from dropdown
  const handleSelectOption = (value: RegionEnum) => {
    setRegion(value); // Update local state with selected region
    setIsOpen(false); // Close dropdown after selection
  };

  // Determine the regions to display (use `regionsAllowed` if provided, otherwise show all regions)
  const regionsToDisplay = regionsAllowed.length > 0 ? regionsAllowed : Object.values(RegionEnum);

  return (
    <section id="region-selector">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            {cardTitle} <span className="text-red-500">* </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {/* Dropdown for selecting region */}
          <div
            className={`relative border p-2 rounded w-full ${error ? "border-red-500" : ""}`}
            onClick={() => setIsOpen(!isOpen)} // Toggle dropdown visibility
          >
            <div className="flex justify-between items-center">
              <span>
                {/* Display selected region and flag */}
                <span className={region === RegionEnum.Global ? "text-xl" : regionIcons[region] || ""}>
                  {/* Conditional: Display globe emoji if the region is Global */}
                  {region === RegionEnum.Global ? "🌐" : ""}
                </span>
                <span className="ml-2">{region === RegionEnum.Global ? "Global" : region}</span> {/* Country name */}
              </span>
              <span className="text-gray-500">▼</span> {/* Dropdown arrow */}
            </div>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded mt-1 shadow-lg z-10">
                {regionsToDisplay.map((value) => (
                  <div
                    key={value}
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSelectOption(value)} // Update region on click
                  >
                    {/* Flag icon or space if there's no icon */}
                    <span className={regionIcons[value as RegionEnum] || "mr-2"}></span>
                    <span className="ml-2">
                      {value === RegionEnum.Global ? "Global" : value} {/* Country name */}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error handling if necessary */}
          {error && <ErrorAlert message={error} />}
        </CardContent>
      </Card>
    </section>
  );
}
