"use client";

import { useEffect, useState } from "react";
import * as Slider from "@radix-ui/react-slider";

interface BNetworkSliderProps {
  value: string;
  sliderName: string;
  keys: string[];
  names: string[];
  chainIds: number[];
  icons: string[];
  bwIcons: string[];
  iconSize?: number;
  returns: (val: number) => void;
}

export default function BNetworkSlider({
  value,
  sliderName,
  keys,
  names,
  chainIds,
  icons,
  bwIcons,
  iconSize = 32,
  returns,
}: BNetworkSliderProps) {
  const initialIndex = keys.indexOf(value);
  const safeInitial = initialIndex >= 0 ? initialIndex : 0;
  const [selectedIndex, setSelectedIndex] = useState(safeInitial);

  useEffect(() => {
    returns(chainIds[selectedIndex]);
  }, [selectedIndex, keys, returns]);

  // Handle image click to move slider
  const handleIconClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">{sliderName}</h3>

      <div className="relative w-full max-w-md mx-auto px-2">
        {/* Slider */}
        <Slider.Root
          className="relative flex h-5 w-full touch-none select-none items-center"
          value={[selectedIndex]}
          onValueChange={(vals) => setSelectedIndex(vals[0])}
          max={keys.length - 1}
          step={1}
        >
          <Slider.Track
            className="relative w-full rounded-full bg-gray-300"
            style={{ height: "12px" }}
          >
            <Slider.Range
              className="absolute rounded-full bg-blue-500"
              style={{ height: "12px" }}
            />
          </Slider.Track>

          <Slider.Thumb
            className="block h-5 w-3 rounded-[10px] bg-blue-400 shadow-[0_1px_5px] hover:shadow-[0_0_0_2px] hover:shadow-blue-500 focus:shadow-[0_0_0_2px] focus:shadow-blue-500 focus:outline-none"
          />
        </Slider.Root>

        {/* Icons – first/last pinned, middle evenly spaced */}
        <div className="mt-4 w-full flex items-center">
          {keys.map((_, index) => {
            const isSelected = index === selectedIndex;
            const isFirst = index === 0;
            const isLast = index === keys.length - 1;

            // Flex for middle icons to expand evenly
            const flexClass = isFirst || isLast ? "" : "flex-1";

            return (
              <div
                key={index}
                className={`flex flex-col items-center ${flexClass}`}
                onClick={() => handleIconClick(index)} // Add onClick handler here
              >
                <img
                  src={isSelected ? icons[index] : bwIcons[index]}
                  alt={names[index]}
                  className={`transition-all duration-300 object-contain cursor-pointer ${
                    isSelected ? "scale-110 opacity-100" : "scale-90 opacity-70"
                  }`}
                  style={{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected label */}
      <div className="mt-6 text-center text-lg font-medium text-gray-800 transition-colors">
        {names[selectedIndex]}
      </div>
    </div>
  );
}
