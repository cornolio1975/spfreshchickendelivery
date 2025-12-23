export interface Product {
    id: string;
    name: string;
    category: "whole" | "parts" | "eggs" | "frozen";
    price: number;
    unit: string;
    image: string;
    description?: string;
    options?: string[]; // e.g. cuts
    weight_options?: number[]; // e.g. [1.5, 2.0]
}

export const products: Product[] = [
    {
        id: "p1",
        name: "Ayam Segar (Broiler)",
        category: "whole",
        price: 11.00,
        unit: "kg",
        image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800",
        description: "Freshly slaughtered daily. Cleaned and ready to cook.",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
        weight_options: [1.8, 2.2, 2.6]
    },
    {
        id: "p2",
        name: "Ayam Kampung Segar (Jantan)",
        category: "whole",
        price: 22.00,
        unit: "kg",
        image: "/ayam-kampung-jantan.jpg",
        description: "Premium free-range chicken (Male). Firmer texture.",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
        weight_options: [1.6, 2.0, 2.2]
    },
    {
        id: "p3",
        name: "Ayam Kampung Segar (Betina)",
        category: "whole",
        price: 20.00,
        unit: "kg",
        image: "/ayam-kampung-betina-v4.jpg",
        description: "Fresh Kampung Chicken (Female).",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
        weight_options: [1.6, 2.0, 2.2]
    },
    {
        id: "p4",
        name: "Ayam Tua Segar (Ayam Telor)",
        category: "whole",
        price: 18.00,
        unit: "bird",
        image: "/ayam-tua.jpg",
        description: "Fresh Old Chicken (Layer Hen). Perfect for soup.",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"]
    },
    {
        id: "p5",
        name: "Ayam Kampung Dara (800-1.1kg)",
        category: "whole",
        price: 32.90,
        unit: "set (2 birds)",
        image: "/ayam-kampung-dara.png",
        description: "Young free-range chicken. Sold in a set of 2 (approx 800g-1.1kg each).",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"]
    }
];
