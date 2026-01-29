"use client";

import { useEffect, useMemo, useState } from "react";
import * as Slider from "@radix-ui/react-slider";

import {
  getTokenKeys,
  getTokenNames,
  getTokenIcons,
  getTokenBWIcons,
  getTokenUrls,
} from "@/lib/web3/wallets/types/SupportedBNetworks";

interface TokenSliderProps {
  value: number; // chainId
  sliderName: string;
  iconSize?: number;
  outTokenKey: (val: string) => void;
}

export default function TokenSlider({
  value: chainId,
  sliderName,
  iconSize = 32,
  outTokenKey,
}: TokenSliderProps) {
  // Pull token data for this chain
  const keys = useMemo(() => getTokenKeys(chainId), [chainId]);
  const names = useMemo(() => getTokenNames(chainId), [chainId]);
  const icons = useMemo(() => getTokenIcons(chainId), [chainId]);
  const bwIcons = useMemo(() => getTokenBWIcons(chainId), [chainId]);
  const urls = useMemo(() => getTokenUrls(chainId), [chainId]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  /**
   * Single effect:
   * - Reset index when chainId changes
   * - Emit selected token key whenever index or chain changes
   */
  useEffect(() => {
    const index = selectedIndex >= keys.length ? 0 : selectedIndex;

    if (index !== selectedIndex) {
      setSelectedIndex(0);
      return;
    }

    if (keys[index]) {
      outTokenKey(keys[index]);
    }
  }, [chainId, selectedIndex, keys, outTokenKey]);

  const handleIconClick = (index: number) => {
    setSelectedIndex(index);
  };

  if (!keys.length) return null;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Section title */}
      <h4>
        {sliderName}
      </h4>

  {/* Selected value */}
  <div className="flex items-center justify-center gap-2">
    <h5>
      {names[selectedIndex]}
    </h5>

    {urls[selectedIndex] && (
      <a
        href={urls[selectedIndex]}
        target="_blank"
        rel="noopener noreferrer"
        className="info-link info-link:hover"
        aria-label="Token Explorer"
      >
        ⓘ

        {/* Tooltip */}
        <span className="tooltip">
          Token Explorer
        </span>
      </a>
    )}
  </div>

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
        <div className="mt-4 w-full flex items-center justify-between">
          {keys.map((_, index) => {
            const isSelected = index === selectedIndex;

            return (
              <div
                key={index}
                className="flex items-center justify-center"
                style={{ width: `${iconSize}px` }}
                onClick={() => handleIconClick(index)}
              >
                <img
                  src={isSelected ? icons[index] : bwIcons[index]}
                  alt={names[index]}
                  className={`transition-all duration-300 object-contain cursor-pointer ${
                    isSelected
                      ? "scale-110 opacity-100"
                      : "scale-90 opacity-70"
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
    </div>
  );
}
