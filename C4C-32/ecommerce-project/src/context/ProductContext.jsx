import React, { createContext, useState, useEffect, useContext } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ARTISANS, INITIAL_REVIEWS } from '../utils/constants';
import { productService } from '../services/productService';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [artisans, setArtisans] = useState(INITIAL_ARTISANS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [categoryMap, setCategoryMap] = useState({});

  const mapProduct = (p) => ({
    id: p.id,
    title: p.title,
    subtitle: `${p.category?.name?.toUpperCase() || 'CRAFT'} • ${p.seller?.district?.toUpperCase() || 'INDIA'}`,
    price: Number(p.price),
    rating: p.rating || 4.8,
    reviewCount: p.reviewCount || 12,
    category: p.category?.name || 'Pottery & Ceramics',
    district: p.seller?.district || 'Bhuj',
    artisanId: p.seller?.id || 'artisan',
    images: p.image_urls && p.image_urls.length > 0 ? p.image_urls : ["/images/earthen-sanctuary-vase.png"],
    tags: ["Handmade", "Local Craft"],
    stock: p.stock,
    stockStatus: p.stock > 0 ? `In stock (${p.stock} units)` : "Out of stock",
    description: p.description || '',
    materials: ["Natural materials"],
    process: []
  });

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      if (data && data.products) {
        const mapped = data.products.map(mapProduct);
        setProducts(mapped);
      }
    } catch (err) {
      console.error('[ProductContext] Error fetching products, falling back to local database:', err);
      const storedProducts = localStorage.getItem('karighar_db_products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('karighar_db_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      if (data && data.categories) {
        const mapping = {};
        data.categories.forEach(c => {
          mapping[c.name] = c.id;
        });
        setCategoryMap(mapping);
      }
    } catch (err) {
      console.error('[ProductContext] Error fetching categories:', err);
    }
  };

  // Fetch categories and products on mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Retrieve product by ID
  const getProductById = (id) => {
    return products.find(prod => prod.id === id);
  };

  // Retrieve artisan by ID
  const getArtisanById = (id) => {
    return artisans.find(art => art.id === id);
  };

  // Retrieve reviews for a product
  const getReviewsForProduct = (productId) => {
    return reviews.filter(rev => rev.productId === productId);
  };

  // Add a new product (Seller functionality)
  const addProduct = async (newProdData) => {
    try {
      const categoryId = categoryMap[newProdData.category] || null;
      
      const payload = {
        title: newProdData.title,
        description: newProdData.description,
        price: Number(newProdData.price),
        stock: Number(newProdData.stock || 5),
        category_id: categoryId,
        image_urls: newProdData.images || ["/images/earthen-sanctuary-vase.png"]
      };

      const res = await productService.create(payload);
      
      // Re-fetch products to ensure full joined objects (seller and category details)
      await fetchProducts();
      
      return mapProduct(res.product);
    } catch (err) {
      console.error('[ProductContext] Failed to add product to database:', err);
      // Fallback
      const newProduct = {
        ...newProdData,
        id: newProdData.id || `p-${Date.now()}`,
        rating: 5.0,
        reviewCount: 0,
        images: newProdData.images || ["/images/earthen-sanctuary-vase.png"],
        tags: newProdData.tags || ["Handmade", "Eco-friendly"],
        stockStatus: "In stock, ready to ship"
      };

      const updatedProducts = [newProduct, ...products];
      setProducts(updatedProducts);
      localStorage.setItem('karighar_db_products', JSON.stringify(updatedProducts));
      return newProduct;
    }
  };

  // Update product stock (Seller functionality)
  const updateProductStock = async (productId, newStock) => {
    try {
      await productService.update(productId, { stock: newStock });
      await fetchProducts();
      return true;
    } catch (err) {
      console.error('[ProductContext] Failed to update product stock:', err);
      // Fallback
      const updated = products.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            stock: newStock,
            stockStatus: newStock > 0 ? `In stock (${newStock} units)` : "Out of stock"
          };
        }
        return p;
      });
      setProducts(updated);
      localStorage.setItem('karighar_db_products', JSON.stringify(updated));
      return false;
    }
  };

  // Submit a customer review
  const addReview = (productId, rating, reviewerName, text) => {
    const newReview = {
      id: `r-${Date.now()}`,
      productId: productId,
      reviewerName: reviewerName || "Anonymous Collector",
      rating: Number(rating),
      verified: true,
      date: `Verified Buyer - ${new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })}`,
      text: text
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('karighar_db_reviews', JSON.stringify(updatedReviews));

    // Recompute product rating & count
    const productReviews = updatedReviews.filter(rev => rev.productId === productId);
    const avgRating = productReviews.reduce((sum, rev) => sum + rev.rating, 0) / productReviews.length;

    const updatedProducts = products.map(prod => {
      if (prod.id === productId) {
        return {
          ...prod,
          rating: Number(avgRating.toFixed(1)),
          reviewCount: productReviews.length
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    localStorage.setItem('karighar_db_products', JSON.stringify(updatedProducts));
  };

  return (
    <ProductContext.Provider value={{
      products,
      artisans,
      reviews,
      getProductById,
      getArtisanById,
      getReviewsForProduct,
      addProduct,
      updateProductStock,
      addReview,
      refreshProducts: fetchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
