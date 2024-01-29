import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import SubcategoriesCards from "../components/SubcategoriesCards";

export default function Subcategories() {
    const { id } = useParams();

    return (
        <div>
            <SubcategoriesCards categoryId={id} />
        </div>
    );
}
