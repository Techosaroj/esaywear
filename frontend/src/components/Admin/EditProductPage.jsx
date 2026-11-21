import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductDetails, updateProduct } from '../../redux/slices/productsSlice';
import axios from 'axios';
import { toast } from 'sonner';

const EditProductPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedProduct, loading, error } = useSelector((state) => state.products)


    const [productData, setProductData] = useState({
        name: "",
        price: 0,
        description: "",
        countInStock: 0,
        category: "",
        brand: "",
        sizes: [],
        colors: [],
        collections: "",
        material: "",
        gender: "",
        images: []
    })

    const [uploading, setUploading] = useState(false) //Image uploading state

    useEffect(() => {
        if (id) {
            dispatch(fetchProductDetails(id))
        }

    }, [dispatch, id])

    useEffect(() => {
        if (selectedProduct) {
            setProductData(selectedProduct)
        }
    }, [selectedProduct])



    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({
            ...prevData, [name]: value
        }))
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/upload`, formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            )
            setProductData((prevData) => ({
                ...prevData,
                images: [...prevData.images, { url: data.imageUrl, altText: "" }],

            }))
            setUploading(false)

        } catch (error) {
            console.error(error);
            setUploading(false)
        }

    }

    const handleRemoveImage = (indexToRemove) => {
        setProductData((prevData) => ({
            ...prevData,
            images: (prevData.images || []).filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...productData,
            price: productData.price === "" ? "" : Number(productData.price),
            discountPrice: productData.discountPrice === "" ? undefined : Number(productData.discountPrice),
            countInStock: Number(productData.countInStock || 0),
        };

        try {
            await dispatch(updateProduct({ id, productData: payload })).unwrap();
            toast.success("Product updated successfully!");
            navigate("/admin/products");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update product");
        }
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>
    return (
        <div className='max-w-5xl mx-auto p-6 shadow-md rounded-md'>
            <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
            <form onSubmit={handleSubmit} >
                {/* Name */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Product Name</label>
                    <input type="text" name='name' value={productData.name} onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2 ' required />
                </div>
                {/* Description */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Description</label>
                    <textarea name="description" value={productData.description} onChange={handleChange} className='w-full border border-gray-300 rounded-md p-2' rows={4} required></textarea>
                </div>

                {/* Price */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Price (Current)</label>
                    <input type="number" name='price' value={productData.price} onChange={handleChange} className='w-full border border-gray-300 rounded-md p-2' />
                </div>
                {/* Discount Price */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Discount Price (Original Price)</label>
                    <input type="number" name='discountPrice' value={productData.discountPrice || ""} onChange={handleChange} className='w-full border border-gray-300 rounded-md p-2' />
                </div>
                {/* Count In */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Count in Stock</label>
                    <input type="number" name='countInStock' value={productData.countInStock} onChange={handleChange} className='w-full border border-gray-300 rounded-md p-2' />
                </div>
                {/* SKU */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>SKU</label>
                    <input type="text" name='sku' value={productData.sku} onChange={handleChange} className='w-full border border-gray-300 rounded-md p-2' />
                </div>
                {/* Category */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Category *</label>
                    <select name="category" value={productData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required>
                        <option value="">Select Category</option>
                        <option value="Top Wear">Top Wear</option>
                        <option value="Bottom Wear">Bottom Wear</option>
                        <option value="Winter Wear">Winter Wear</option>
                        <option value="Inner Wear">Inner Wear</option>
                    </select>
                </div>
                {/* Collections */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Collections *</label>
                    <select name="collections" value={productData.collections} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required>
                        <option value="">Select Collection</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                        <option value="Autumn">Autumn</option>
                        <option value="Winter">Winter</option>
                    </select>
                </div>
                {/* Brand */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Brand</label>
                    <select name="brand" value={productData.brand} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2">
                        <option value="">Select Brand</option>
                        <option value="Nike">Nike</option>
                        <option value="Adidas">Adidas</option>
                        <option value="Puma">Puma</option>
                        <option value="Reebok">Reebok</option>
                        <option value="Karma">Karma</option>
                        <option value="Urban">Urban</option>
                    </select>
                </div>
                {/* Gender */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Gender</label>
                    <select name="gender" value={productData.gender} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2">
                        <option value="">Select Gender</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                    </select>
                </div>
                {/* Material */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Material</label>
                    <select name="material" value={productData.material} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2">
                        <option value="">Select Material</option>
                        <option value="Cotton">Cotton</option>
                        <option value="Polyester">Polyester</option>
                        <option value="Denim">Denim</option>
                        <option value="Linen">Linen</option>
                        <option value="Fleece">Fleece</option>
                        <option value="Wool">Wool</option>
                        <option value="Silk">Silk</option>
                    </select>
                </div>
                {/* Sizes */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Sizes</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                            <button
                                type="button"
                                key={size}
                                onClick={() => setProductData((prev) => ({
                                    ...prev,
                                    sizes: prev.sizes?.includes(size)
                                        ? prev.sizes.filter((s) => s !== size)
                                        : [...(prev.sizes || []), size],
                                }))}
                                className={`px-4 py-2 border rounded cursor-pointer ${productData.sizes?.includes(size)
                                        ? 'bg-black text-white border-black'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Colors */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Colors</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {["Red", "Maroon", "Orange", "Yellow", "Green", "Blue", "Navy", "Teal", "Purple", "Pink", "Black", "White", "Grey", "Brown", "Beige", "Khaki", "Multi"].map((color) => (
                            <button
                                type="button"
                                key={color}
                                onClick={() => setProductData((prev) => ({
                                    ...prev,
                                    colors: prev.colors?.includes(color)
                                        ? prev.colors.filter((c) => c !== color)
                                        : [...(prev.colors || []), color],
                                }))}
                                className={`px-4 py-2 border rounded cursor-pointer ${productData.colors?.includes(color)
                                        ? 'bg-black text-white border-black'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image Upload */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Uplaod Image</label>
                    <input type="file" onChange={handleImageUpload} />
                    {uploading && <p>Uploading image</p>}
                    {/* Display Images */}
                    <div className="flex gap-4 mt-4">
                        {(productData.images || []).map((image, index) => (
                            <div key={`${image?.url || "image"}-${index}`} className="relative">
                                <img
                                    src={image.url}
                                    alt={image.altText || "Product Image"}
                                    className="w-20 h-20 object-cover rounded-md shadow-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black text-white flex items-center justify-center leading-none hover:bg-red-600"
                                    aria-label="Remove image"
                                    title="Remove image"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
                <button type='submit' className="w-full bg-green-500 text-white py-2 roundedmd hover:bg-green-600 transition-colors cursor-pointer">Update Product</button>
            </form>

        </div>
    )
}

export default EditProductPage
