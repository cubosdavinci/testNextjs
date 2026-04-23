"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { consoleLog } from "@/lib/utils";
import ErrorAlert from "../banners/ErrorAlert";

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
    productType: string;
    onSelectCategory?: (value: string | number | null) => void;
    returnId?: boolean;
}

export default function CardSelectCategory({
    cardTitle = "Product Category",
    selectedCategory,
    productType,
    onSelectCategory,
    returnId = false,
}: CardSelectCategoryProps) {
    consoleLog("💡 Component Start - CardSelectCategory");

    const [levels, setLevels] = useState<Category[][]>([]);
    const [selectedIds, setSelectedIds] = useState<(number | null)[]>([]);
    const [error, setError] = useState<string | null>(null);

    // -----------------------------
    // FETCH CATEGORIES
    // -----------------------------
    const fetchCategories = async (level: number, parentId: number | null = null): Promise<Category[]> => {
        try {
            const res = await fetch("/api/supabase/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    operationName: "getCategoriesList",
                    variables: {
                        first: 50,
                        level,
                        productType,
                        parentId,
                    },
                }),
            });

            let json;
            try {
                json = await res.json();
            } catch {
                json = {};
            }

            if (!res.ok) {
                const errorMessage = json?.error?.message || `Server error (${res.status})`;
                throw new Error(errorMessage);
            }

            if (json.error) {
                throw new Error(json.error.message || "API returned error");
            }

            return json as Category[];
        } catch (err) {
            console.error(`Failed to fetch categories (level=${level}, parentId=${parentId}):`, err);

            // Only set generic network error if it's not already a meaningful message
            if (!error) {  // avoid overwriting specific errors
                setError(err.message || "Network error while fetching categories");
            }

            throw err;        // ← Important: re-throw so caller knows it failed
        }
    };
    // -----------------------------
    // RESET ON PRODUCT TYPE CHANGE
    // -----------------------------
    useEffect(() => {
        if (!productType) return;

        (async () => {
            setError(null);
            setLevels([]);
            setSelectedIds([]);

            const rootCats = await fetchCategories(1, null);

            if (rootCats.length > 0) {
                setLevels([rootCats]);
                setSelectedIds([null]);
            } else {
                // Optional: show a friendlier message if no categories at all
                setError("No categories available for this product type");
            }
        })();
    }, [productType]);

    // -----------------------------
    // HELPERS
    // -----------------------------
    const getSlugById = (id: number | null) => {
        for (const level of levels) {
            const cat = level.find((c) => c.id === id);
            if (cat) return cat.slug;
        }
        return null;
    };

    const handleSelect = async (levelIndex: number, value: string) => {
        try {
            const id = value ? Number(value) : null;

            // Update selected IDs up to this level
            const newSelected = [...selectedIds.slice(0, levelIndex), id];
            setSelectedIds(newSelected);

            // If user cleared the selection (chose placeholder)
            if (id === null) {
                setLevels(levels.slice(0, levelIndex + 1));

                const lastSelected = newSelected.slice(0, levelIndex).reverse().find(Boolean) || null;

                onSelectCategory?.(returnId ? lastSelected : getSlugById(lastSelected));
                return;
            }

            // Fetch next level subcategories
            const nextLevel = (levels[levelIndex][0]?.level ?? 0) + 1;
            const subcats = await fetchCategories(nextLevel, id);

            if (subcats.length > 0) {
                // Add next level only if there are subcategories
                setLevels([...levels.slice(0, levelIndex + 1), subcats]);
                setSelectedIds([...newSelected, null]);
            } else {
                // Leaf category selected → don't add empty next level
                setLevels(levels.slice(0, levelIndex + 1));
            }

            // Notify parent with final selected value
            const finalSelection = [...newSelected].reverse().find(Boolean) || null;
            onSelectCategory?.(returnId ? finalSelection : getSlugById(finalSelection));

        } catch (err) {
            console.error("Error in handleSelect:", err);
            setError("Something went wrong while selecting category");
        }
    };

    // -----------------------------
    // VALIDATION
    // -----------------------------
    useEffect(() => {
        const last = selectedIds.filter(Boolean).pop() || null;

        if (levels.length && last == null) {
            setError("Please select a category");
        } else {
            setError(null);
        }
    }, [selectedIds, levels]);

    return (
        <section id="product-category">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>{cardTitle}</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                    {/* Only render selects for levels that exist */}
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

                                {cats.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}

                    {/* ERROR ALERT */}
                    {error && (
                        <ErrorAlert
                            message={error}
                            onClose={() => setError(null)}
                        />
                    )}

                    {/* SELECTED RESULT */}
                    <div className="mt-2 text-sm">
                        <strong>Selected Category:</strong>{" "}
                        {returnId
                            ? selectedIds.filter(Boolean).pop() ?? "None"
                            : getSlugById(selectedIds.filter(Boolean).pop() ?? null) ?? "None"}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}