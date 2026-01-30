"use client";

import { useEffect, useState } from "react";
import * as Slider from "@radix-ui/react-slider";

import {
  getBNetworkBWIcons,
  getBNetworkChainIds,
  getBNetworkIcons,
  getBNetworkNames,
  getBNetworkUrls,
} from "@/lib/web3/wallets";

import TokenSlider from "./TokenSlider";

interface BNetworkSliderProps {
  sliderName: string;
  value: number; // chainId now
  iconSize?: number;
  outChainId: (val: number) => void;
  outToken: (val: string) => void;
}

export default function BNetworkSlider({
  value,
  sliderName,
  iconSize = 32,
  outChainId,
  outToken,
}: BNetworkSliderProps) {
  const chainIds = getBNetworkChainIds();
  const names = getBNetworkNames();
  const icons = getBNetworkIcons();
  const bwIcons = getBNetworkBWIcons();
  const urls = getBNetworkUrls();

  // Use chainId as the key
  const initialIndex = chainIds.indexOf(value);
  const safeInitial = initialIndex >= 0 ? initialIndex : 0;

  const [selectedIndex, setSelectedIndex] = useState(safeInitial);
  const [selectedChainId, setSelectedChainId] = useState(
    chainIds[safeInitial]
  );

  /**
   * Emit selected chainId
   */
  useEffect(() => {
    const chainId = chainIds[selectedIndex];
    setSelectedChainId(chainId);
    outChainId(chainId);
  }, [selectedIndex, chainIds, outChainId]);

  /**
   * Receive token key from TokenSlider and forward to parent
   */
  const handleTokenKey = (val: string) => {
    outToken(val);
  };

  const handleIconClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Section title */}
      <h4>{sliderName}</h4>

      {/* Selected value + link */}
      <div className="flex items-center justify-center gap-2">
        <h5>{names[selectedIndex]}</h5>

        {urls[selectedIndex] && (
          <a
            href={urls[selectedIndex]}
            target="_blank"
            rel="noopener noreferrer"
            className="info-link info-link:hover"
            aria-label="Network Explorer"
          >
            ⓘ
            <span className="tooltip">Blockchain Explorer</span>
          </a>
        )}
      </div>

      <div className="relative w-full max-w-md mx-auto px-2">
        {/* Network Slider */}
        <Slider.Root
          className="relative flex h-5 w-full touch-none select-none items-center"
          value={[selectedIndex]}
          onValueChange={(vals) => setSelectedIndex(vals[0])}
          max={chainIds.length - 1}
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

        {/* Network Icons */}
        <div className="mt-4 w-full flex items-center justify-between">
          {chainIds.map((_, index) => {
            const isSelected = index === selectedIndex;

            return (
              <div
                key={chainIds[index]}
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

      {/* Token Slider */}
      <div className="mt-10 w-full">
        <TokenSlider
          value={selectedChainId}
          sliderName="Select Token"
          iconSize={iconSize}
          outTokenKey={handleTokenKey}
        />
      </div>
    </div>
  );
}
