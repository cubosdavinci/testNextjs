'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { consoleLog } from "@/lib/utils";

interface Category {
    id: number;
    name: string;
    slug: string;
    level: number;
    parentId: number | null;
    productType: string;
    subcategoriesCount?: number;
}

interface CardSelectCategoryProps {
    cardTitle?: string;
    selectedCategory?: string | number | null;
    productType: string; // REQUIRED NOW
    onSelectCategory?: (value: string | number | null) => void;
    returnId?: boolean;
}

export default function CardSelectCategory({
    cardTitle = "Product Category",
    selectedCategory,
    productType,
    onSelectCategory,
    returnId = false
}: CardSelectCategoryProps) {
  consoleLog("💡 Component Start - components/products/CardProductType.tsx");
  

    const [levels, setLevels] = useState<Category[][]>([]);
    const [selectedIds, setSelectedIds] = useState<(number | null)[]>([]);
    const [error, setError] = useState<string | null>(null);

    // -----------------------------
    // FETCH FROM /api/categories
    // -----------------------------
    const fetchCategories = async (
        level: number,
        parentId: number | null = null
    ) => {
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    operationName: "getCategoriesList",
                    variables: {
                        first: 50,
                        level,
                        productType,
                        parentId
                    }
                })
            });

            const json = await res.json();

            if (!res.ok || json.error) {
                throw new Error(json.error?.message || "API error");
            }

            return json as Category[];
        } catch (err) {
            console.error("Error fetching categories:", err);
            return [];
        }
    };

    // -----------------------------
    // RESET WHEN PRODUCT TYPE CHANGES
    // -----------------------------
    useEffect(() => {
        if (!productType) return;

        (async () => {
            const rootCats = await fetchCategories(1, null);
            setLevels([rootCats]);
            setSelectedIds([null]);
        })();
    }, [productType]);

    // -----------------------------
    // HELPERS
    // -----------------------------
    const getSlugById = (id: number | null) => {
        for (const level of levels) {
            const cat = level.find(c => c.id === id);
            if (cat) return cat.slug;
        }
        return null;
    };

    const handleSelect = async (levelIndex: number, value: string) => {
        const id = value ? Number(value) : null;

        const newSelected = [...selectedIds.slice(0, levelIndex), id];
        setSelectedIds(newSelected);

        // If cleared
        if (id === null) {
            setLevels(levels.slice(0, levelIndex + 1));
            const last = newSelected.slice(0, levelIndex).reverse().find(Boolean) || null;
            onSelectCategory?.(returnId ? last : getSlugById(last));
            return;
        }

        // Fetch subcategories
        const nextLevel = (levels[levelIndex][0]?.level ?? 0) + 1;
        const subcats = await fetchCategories(nextLevel, id);

        if (subcats.length) {
            setLevels([...levels.slice(0, levelIndex + 1), subcats]);
            setSelectedIds([...newSelected, null]);
        } else {
            setLevels(levels.slice(0, levelIndex + 1));
        }

        const last = [...newSelected].reverse().find(Boolean) || null;
        onSelectCategory?.(returnId ? last : getSlugById(last));
    };

    // -----------------------------
    // VALIDATION
    // -----------------------------
    useEffect(() => {
        const last = selectedIds.filter(Boolean).pop() || null;
        if (levels.length && last == null) setError("Please select a category");
        else setError(null);
    }, [selectedIds, levels]);

    return (
        <section id="product-category">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>{cardTitle}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {levels.map((cats, i) => (
                        <div key={i}>
                            <label className="block mb-1 font-semibold">
                                {i === 0 ? "Category" : `Subcategory Level ${i}`}
                            </label>

                            <select
                                className={`w-full border rounded px-2 py-1 ${error ? "border-red-500" : ""}`}
                                value={selectedIds[i] ?? ""}
                                onChange={(e) => handleSelect(i, e.target.value)}
                            >
                                <option value="">
                                    Select {i === 0 ? "Root Category" : "Subcategory"}
                                </option>

                                {cats.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="mt-2 text-sm">
                        <strong>Selected Category:</strong>{" "}
                        {returnId
                            ? selectedIds.filter(Boolean).pop() ?? "None"
                            : getSlugById(selectedIds.filter(Boolean).pop() ?? null) ??
                            "None"}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
