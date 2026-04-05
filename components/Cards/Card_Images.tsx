"use client";

import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface CardImagesProps {
  title: string;
  description: string;
  price: number; // 0 = Free
  thumbnail: string;
}

const Card_Images: React.FC<CardImagesProps> = ({ title, description, price, thumbnail }) => {
  return (
    <Card className="overflow-hidden relative">
      {/* Header */}
      <CardHeader className="flex justify-between items-center p-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Info className="w-5 h-5 text-gray-400" />
      </CardHeader>

      {/* Thumbnail */}
      <CardContent className="p-0">
        <img src={thumbnail} alt={title} className="w-full h-48 object-cover" />
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-2 flex justify-center">
        <Button className="w-full bg-black/50 text-white hover:bg-black/60">
          Get for {price === 0 ? "Free" : `$${price}`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Card_Images;
