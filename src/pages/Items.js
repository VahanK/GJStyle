import React from 'react';

const collections = [
    {
        title: 'Business Causual',
        category: 'Men',
        imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&q=75&fit=crop&crop=top&w=600&h=700',
    },
    {
        title: 'Summer Season',
        category: 'Women',
        imageUrl: 'https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?auto=format&q=75&fit=crop&crop=top&w=600&h=700',
    },
    {
        title: 'Streetwear',
        category: 'Men',
        imageUrl: 'https://images.unsplash.com/photo-1552668693-d0738e00eca8?auto=format&q=75&fit=crop&crop=top&w=600&h=700',
    },
    {
        title: 'Sale',
        category: 'Women',
        imageUrl: 'https://images.unsplash.com/photo-1560269999-cef6ebd23ad3?auto=format&q=75&fit=crop&w=600&h=700',
    },

];

export default function Items() {
    return (
        <div className="bg-white py-6 sm:py-8 lg:py-12">
            <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
                <h2 className="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12 lg:text-3xl">Collections</h2>
                <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                    {collections.map((collection, index) => (
                        <div key={index}>
                            <a href="#" className="group relative flex h-96 items-end overflow-hidden rounded-lg bg-gray-100 p-4 shadow-lg">
                                <img
                                    src={collection.imageUrl}
                                    loading="lazy"
                                    alt={`Photo for ${collection.title} by Austin Wade`}
                                    className="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110"
                                />
                                <div className="relative flex w-full flex-col rounded-lg bg-white p-1 text-center">
                                    <span className="text-gray-500">{collection.category}</span>
                                    <span className="text-lg font-bold text-gray-800 lg:text-xl">{collection.title}</span>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
