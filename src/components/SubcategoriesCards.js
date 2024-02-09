import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import axios from 'axios';

const SubcategoriesCards = ({ categoryId }) => {
    const [subcategories, setSubcategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`https://backoffice.gjstylelb.com/items/subcategory?fields=*&filter[category][_eq]=${categoryId}`)
            .then(response => {
                const fetchedSubcategories = response.data.data || [];
                if (fetchedSubcategories.length === 0) {
                    // Redirect to products page if no subcategories
                    navigate(`/products/${categoryId}`);
                } else {
                    setSubcategories(fetchedSubcategories);
                }
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
            });
    }, [categoryId, navigate]);

    const handleCardClick = (subcategory) => {
        navigate(`/products/${categoryId}/${subcategory.id}`);
    };




    return (
        <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 w-full max-w-7xl mx-auto">
                {subcategories.map((subcategory) => (
                    <Card
                        key={subcategory.id}
                        heading={subcategory.title}
                        imgSrc={`https://backoffice.gjstylelb.com/assets/${subcategory.image}`}
                        onClick={() => handleCardClick(subcategory)}
                    />
                ))}
            </div>
        </div>
    );
};

const Card = ({ heading, imgSrc, onClick }) => {
    return (
        <motion.div
            transition={{ staggerChildren: 0.035 }}
            whileHover="hover"
            className="w-full h-64 bg-slate-300 overflow-hidden cursor-pointer group relative rounded-md"
            onClick={onClick}
        >
            <div
                className="absolute inset-0 md:group-hover:saturate-100 group-hover:scale-110 transition-all duration-500"
                style={{ backgroundImage: `url(${imgSrc})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div className="p-4 relative z-20 h-full text-white group-hover:text-white transition-colors duration-500 flex flex-col justify-between">
                <FiArrowRight className="text-3xl group-hover:-rotate-45 transition-transform duration-500 ml-auto" />
                <h4>
                    {heading.split("").map((l, i) => (
                        <ShiftLetter letter={l} key={i} />
                    ))}
                </h4>
            </div>
        </motion.div>
    );
};

const ShiftLetter = ({ letter }) => {
    return (
        <div className="inline-block overflow-hidden h-[36px] font-semibold text-3xl">

            <span>{letter}</span>

        </div>
    );
};
export default SubcategoriesCards;
