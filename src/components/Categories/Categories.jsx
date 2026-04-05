import React, { useState } from 'react';
import './Categories.css';

const Categories = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    'All',
    'Trending',
    'Comedy',
    'Education',
    'Entertainment',
    'Fashion',
    'Finance',
    'Food',
    'Gaming',
    'Lifestyle',
    'Live',
    'Motivation'
  ];

  return (
    <div className="categories-container">
      <div className="categories-wrapper">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-item ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;
