import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { createProduct, deleteProduct, fetchAdminProducts } from '../../redux/slices/adminProductSlice';
import axios from 'axios'
import { toast } from 'sonner';

const ProductManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading, error } = useSelector((state) => state.adminProducts)
    const { user } = useSelector((state) => state.auth);

    const [showAddForm, setShowAddForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formError, setFormError] = useState(null);

    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        countInStock: 0,
        category: "",
        brand: "",
        sizes: [],
        colors: [],
        collections: "",
        material: "",
        gender: "",
        sku: "",
        images: [],
    });

    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/");
        }
    }, [user, navigate])

    useEffect(() => {
        dispatch(fetchAdminProducts());

    }, [dispatch])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setProductData((prev) => ({
                ...prev,
                images: [...(prev.images || []), { url: data.imageUrl, altText: "" }],
            }));
        } catch (error) {
            console.error(error);
            setFormError("Image upload failed");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    }

    const handleRemoveImage = (indexToRemove) => {
        setProductData((prev) => ({
            ...prev,
            images: (prev.images || []).filter((_, idx) => idx !== indexToRemove),
        }));
    };

    const resetForm = () => {
        setProductData({
            name: "",
            description: "",
            price: "",
            discountPrice: "",
            countInStock: 0,
            category: "",
            brand: "",
            sizes: [],
            colors: [],
            collections: "",
            material: "",
            gender: "",
            sku: "",
            images: [],
        });
        setFormError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        const payload = {
            ...productData,
            price: productData.price === "" ? "" : Number(productData.price),
            discountPrice: productData.discountPrice === "" ? undefined : Number(productData.discountPrice),
            countInStock: Number(productData.countInStock || 0),
            sizes: productData.sizes,
            colors: productData.colors,
        };

        // basic front-end validation for required fields (mirrors backend)
        if (!payload.name || !payload.description || !payload.price || !payload.category || !payload.sizes?.length || !payload.colors?.length || !payload.collections || !payload.sku) {
            setFormError("Please fill all required fields (name, description, price, category, sizes, colors, collections, sku).");
            return;
        }

        try {
            await dispatch(createProduct(payload)).unwrap();
            toast.success("Product created successfully!");
            resetForm();
            setShowAddForm(false);
        } catch (err) {
            setFormError(err?.message || "Failed to create product");
            toast.error(err?.message || "Failed to create product");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product")) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
                toast.success("Product deleted successfully!");
            } catch (err) {
                console.error(err);
                toast.error("Failed to delete product");
            }
        }
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>
    return (
        <div className='max-w-7xl mx-auto p-6'>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Product Management</h2>
                <button
                    type="button"
                    onClick={() => setShowAddForm((v) => !v)}
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 cursor-pointer"
                >
                    {showAddForm ? "Close" : "Add New Product"}
                </button>
            </div>

            {showAddForm && (
                <div className="p-6 rounded-lg mb-6 border border-gray-200 bg-white">
                    <h3 className="text-lg font-bold mb-4">Add New Product</h3>
                    {formError && <p className="text-red-600 mb-4">Error: {formError}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700">Name *</label>
                                <input type="text" name="name" value={productData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
                            </div>
                            <div>
                                <label className="block text-gray-700">SKU *</label>
                                <input type="text" name="sku" value={productData.sku} onChange={handleChange} className="w-full p-2 border rounded" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-700">Description *</label>
                                <textarea name="description" value={productData.description} onChange={handleChange} className="w-full p-2 border rounded" rows={3} required />
                            </div>
                            <div>
                                <label className="block text-gray-700">Price (Current) *</label>
                                <input type="number" name="price" value={productData.price} onChange={handleChange} className="w-full p-2 border rounded" required />
                            </div>
                            <div>
                                <label className="block text-gray-700">Discount Price (Original Price)</label>
                                <input type="number" name="discountPrice" value={productData.discountPrice} onChange={handleChange} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-gray-700">Count in Stock</label>
                                <input type="number" name="countInStock" value={productData.countInStock} onChange={handleChange} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-gray-700">Category *</label>
                                <select name="category" value={productData.category} onChange={handleChange} className="w-full p-2 border rounded" required>
                                    <option value="">Select Category</option>
                                    <option value="Top Wear">Top Wear</option>
                                    <option value="Bottom Wear">Bottom Wear</option>
                                    <option value="Winter Wear">Winter Wear</option>
                                    <option value="Inner Wear">Inner Wear</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700">Collections *</label>
                                <select name="collections" value={productData.collections} onChange={handleChange} className="w-full p-2 border rounded" required>
                                    <option value="">Select Collection</option>
                                    <option value="Spring">Spring</option>
                                    <option value="Summer">Summer</option>
                                    <option value="Autumn">Autumn</option>
                                    <option value="Winter">Winter</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700">Gender</label>
                                <select name="gender" value={productData.gender} onChange={handleChange} className="w-full p-2 border rounded">
                                    <option value="">Select</option>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Unisex">Unisex</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700">Brand</label>
                                <select name="brand" value={productData.brand} onChange={handleChange} className="w-full p-2 border rounded">
                                    <option value="">Select Brand</option>
                                    <option value="Nike">Nike</option>
                                    <option value="Adidas">Adidas</option>
                                    <option value="Puma">Puma</option>
                                    <option value="Reebok">Reebok</option>
                                    <option value="Karma">Karma</option>
                                    <option value="Urban">Urban</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700">Material</label>
                                <select name="material" value={productData.material} onChange={handleChange} className="w-full p-2 border rounded">
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
                            <div>
                                <label className="block text-gray-700">Sizes *</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                                        <button
                                            type="button"
                                            key={size}
                                            onClick={() => setProductData((prev) => ({
                                                ...prev,
                                                sizes: prev.sizes.includes(size)
                                                    ? prev.sizes.filter((s) => s !== size)
                                                    : [...prev.sizes, size],
                                            }))}
                                            className={`px-4 py-2 border rounded cursor-pointer ${productData.sizes.includes(size)
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700">Colors *</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {["Red", "Maroon", "Orange", "Yellow", "Green", "Blue", "Navy", "Teal", "Purple", "Pink", "Black", "White", "Grey", "Brown", "Beige", "Khaki", "Multi"].map((color) => (
                                        <button
                                            type="button"
                                            key={color}
                                            onClick={() => setProductData((prev) => ({
                                                ...prev,
                                                colors: prev.colors.includes(color)
                                                    ? prev.colors.filter((c) => c !== color)
                                                    : [...prev.colors, color],
                                            }))}
                                            className={`px-4 py-2 border rounded cursor-pointer ${productData.colors.includes(color)
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-gray-700">Upload Images</label>
                            <input type="file" onChange={handleImageUpload} />
                            {uploading && <p className="text-sm text-gray-600 mt-2">Uploading image...</p>}
                            <div className="flex gap-4 mt-4 flex-wrap">
                                {(productData.images || []).map((image, index) => (
                                    <div key={`${image?.url || "image"}-${index}`} className="relative">
                                        <img src={image.url} alt={image.altText || "Product Image"} className="w-20 h-20 object-cover rounded-md shadow-md" />
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

                        <div className="mt-6 flex gap-3">
                            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 cursor-pointer">Create Product</button>
                            <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-900 py-2 px-4 rounded hover:bg-gray-300 cursor-pointer">Reset</button>
                        </div>
                    </form>
                </div>
            )}
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="min-w-full text-left text-gray-500">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">SKU</th>
                            <th className="py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? products.map((product) => (
                            <tr key={product._id} className="border-b bg-gray-50 cursor-pointer">
                                <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                                    {product.name}
                                </td>
                                <td className="p-4">${product.price}</td>
                                <td className="p-4">{product.sku}</td>
                                <td className="p-4">
                                    <Link to={`/admin/products/${product._id}/edit`} className='bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 cursor-pointer'>
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(product._id)} className='bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 cursor-pointer'>Delete</button>
                                </td>
                            </tr>
                        )) : (<tr>
                            <td colSpan={4} className='p-4 text-center text-gray-500'>No Products Found</td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ProductManagement
