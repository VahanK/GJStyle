import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import axios from 'axios';

const CategoriesCards = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        axios.get('http://0000:8055/items/category?fields=*')
            .then(response => {
                setCategories(response.data.data || []);
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
            });
    }, []);

    const handleCardClick = (category) => {
        if (category.has_subcategory) {
            // Navigate to Subcategories page with category ID
            navigate(`/subcategories/${category.id}`);
        } else {
            // Navigate directly to Products page with category ID
            navigate(`/products/${category.id}`);
        }
    };




    return (
        <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 w-full max-w-7xl mx-auto">
                {categories.map((category) => (
                    <Card
                        key={category.id}
                        heading={category.title}
                        imgSrc={`http://0000:8055/assets/${category.image}`}
                        onClick={() => handleCardClick(category)}
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
            <div className="p-4 relative z-20 h-full text-slate-300 group-hover:text-white transition-colors duration-500 flex flex-col justify-between">
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
            <motion.span
                className="flex flex-col min-w-[4px]"
                style={{ y: "0%" }}
                variants={{ hover: { y: "-50%" } }}
                transition={{ duration: 0.5 }}
            >
                <span>{letter}</span>
                <span>{letter}</span>
            </motion.span>
        </div>
    );
};

export default CategoriesCards;
