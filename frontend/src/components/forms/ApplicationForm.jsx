/**
 * Application Form Component
 * 
 * Unified form for both Market Entry and Export Program applications.
 * Includes validation, rate limiting handling, and success/error states.
 */

import React, { useState } from 'react';
import { useGeo } from '../../context/GeoContext';
import { applicationsAPI } from '../../services/api';
import './ApplicationForm.css';

const ApplicationForm = ({ applicationType = 'market_entry' }) => {
    const { visitorType } = useGeo();

    const [formData, setFormData] = useState({
        application_type: applicationType,
        company_name: '',
        country: '',
        contact_name: '',
        email: '',
        phone: '',
        website_url: '',
        product_category: '',
        product_description: '',
        current_markets: '',
        annual_production_capacity: '',
        target_markets: '',
        certifications: '',
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [referenceId, setReferenceId] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // Required fields
        if (!formData.company_name.trim()) {
            newErrors.company_name = visitorType === 'LOCAL'
                ? 'Şirket adı gereklidir'
                : 'Company name is required';
        }

        if (!formData.contact_name.trim()) {
            newErrors.contact_name = visitorType === 'LOCAL'
                ? 'İletişim kişisi gereklidir'
                : 'Contact name is required';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = visitorType === 'LOCAL'
                ? 'E-posta gereklidir'
                : 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = visitorType === 'LOCAL'
                ? 'Geçerli bir e-posta adresi girin'
                : 'Please enter a valid email';
        }

        if (!formData.product_category.trim()) {
            newErrors.product_category = visitorType === 'LOCAL'
                ? 'Ürün kategorisi gereklidir'
                : 'Product category is required';
        }

        if (!formData.product_description.trim()) {
            newErrors.product_description = visitorType === 'LOCAL'
                ? 'Ürün açıklaması gereklidir'
                : 'Product description is required';
        } else if (formData.product_description.length < 20) {
            newErrors.product_description = visitorType === 'LOCAL'
                ? 'En az 20 karakter gereklidir'
                : 'At least 20 characters required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setSubmitting(true);
        setErrors({});

        try {
            const response = await applicationsAPI.submit(formData);

            if (response.success) {
                setSubmitted(true);
                setReferenceId(response.reference_id);

                // Reset form
                setFormData({
                    application_type: applicationType,
                    company_name: '',
                    country: '',
                    contact_name: '',
                    email: '',
                    phone: '',
                    website_url: '',
                    product_category: '',
                    product_description: '',
                    current_markets: '',
                    annual_production_capacity: '',
                    target_markets: '',
                    certifications: '',
                });

                // Scroll to success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            if (error.message.includes('Rate limit')) {
                setErrors({
                    submit: visitorType === 'LOCAL'
                        ? 'Çok fazla başvuru gönderdiniz. Lütfen daha sonra tekrar deneyin.'
                        : 'You have submitted too many applications. Please try again later.',
                });
            } else {
                setErrors({
                    submit: error.message || (visitorType === 'LOCAL'
                        ? 'Bir hata oluştu. Lütfen tekrar deneyin.'
                        : 'An error occurred. Please try again.'),
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="application-success">
                <div className="success-icon">✅</div>
                <h2>
                    {visitorType === 'LOCAL'
                        ? 'Başvurunuz Alındı!'
                        : 'Application Received!'}
                </h2>
                <p>
                    {visitorType === 'LOCAL'
                        ? 'Başvuru referans numaranız:'
                        : 'Your application reference number:'}
                </p>
                <div className="reference-id">{referenceId}</div>
                <p>
                    {visitorType === 'LOCAL'
                        ? 'En kısa sürede size geri dönüş yapacağız.'
                        : 'We will get back to you as soon as possible.'}
                </p>
            </div>
        );
    }

    return (
        <form className="application-form" onSubmit={handleSubmit}>
            <div className="form-section">
                <h3>
                    {visitorType === 'LOCAL'
                        ? 'Şirket Bilgileri'
                        : 'Company Information'}
                </h3>

                <div className="form-group">
                    <label htmlFor="company_name">
                        {visitorType === 'LOCAL' ? 'Şirket Adı' : 'Company Name'} *
                    </label>
                    <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        className={errors.company_name ? 'error' : ''}
                        required
                    />
                    {errors.company_name && <span className="error-message">{errors.company_name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="country">
                        {visitorType === 'LOCAL' ? 'Ülke' : 'Country'} *
                    </label>
                    <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="contact_name">
                        {visitorType === 'LOCAL' ? 'İletişim Kişisi' : 'Contact Person'} *
                    </label>
                    <input
                        type="text"
                        id="contact_name"
                        name="contact_name"
                        value={formData.contact_name}
                        onChange={handleChange}
                        className={errors.contact_name ? 'error' : ''}
                        required
                    />
                    {errors.contact_name && <span className="error-message">{errors.contact_name}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="email">
                            {visitorType === 'LOCAL' ? 'E-posta' : 'Email'} *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            required
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">
                            {visitorType === 'LOCAL' ? 'Telefon' : 'Phone'}
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="website_url">
                        {visitorType === 'LOCAL' ? 'Web Sitesi' : 'Website'}
                    </label>
                    <input
                        type="url"
                        id="website_url"
                        name="website_url"
                        value={formData.website_url}
                        onChange={handleChange}
                        placeholder="https://"
                    />
                </div>
            </div>

            <div className="form-section">
                <h3>
                    {visitorType === 'LOCAL'
                        ? 'Ürün Bilgileri'
                        : 'Product Information'}
                </h3>

                <div className="form-group">
                    <label htmlFor="product_category">
                        {visitorType === 'LOCAL' ? 'Ürün Kategorisi' : 'Product Category'} *
                    </label>
                    <input
                        type="text"
                        id="product_category"
                        name="product_category"
                        value={formData.product_category}
                        onChange={handleChange}
                        className={errors.product_category ? 'error' : ''}
                        placeholder={visitorType === 'LOCAL'
                            ? 'Örn: Elektronik, Makine, Kimyasal'
                            : 'e.g., Electronics, Machinery, Chemicals'}
                        required
                    />
                    {errors.product_category && <span className="error-message">{errors.product_category}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="product_description">
                        {visitorType === 'LOCAL' ? 'Ürün Açıklaması' : 'Product Description'} *
                    </label>
                    <textarea
                        id="product_description"
                        name="product_description"
                        value={formData.product_description}
                        onChange={handleChange}
                        className={errors.product_description ? 'error' : ''}
                        rows="5"
                        placeholder={visitorType === 'LOCAL'
                            ? 'Ürünleriniz hakkında detaylı bilgi verin...'
                            : 'Please provide detailed information about your products...'}
                        required
                    />
                    {errors.product_description && <span className="error-message">{errors.product_description}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="certifications">
                        {visitorType === 'LOCAL' ? 'Sertifikalar' : 'Certifications'}
                    </label>
                    <input
                        type="text"
                        id="certifications"
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleChange}
                        placeholder={visitorType === 'LOCAL'
                            ? 'ISO 9001, CE, TSE vb.'
                            : 'ISO 9001, CE, TSE, etc.'}
                    />
                </div>
            </div>

            {errors.submit && (
                <div className="error-banner">
                    {errors.submit}
                </div>
            )}

            <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
            >
                {submitting
                    ? (visitorType === 'LOCAL' ? 'Gönderiliyor...' : 'Submitting...')
                    : (visitorType === 'LOCAL' ? 'Başvuru Yap' : 'Submit Application')}
            </button>

            <p className="form-disclaimer">
                {visitorType === 'LOCAL'
                    ? '* İşaretli alanlar zorunludur. Başvurunuz 48 saat içinde değerlendirilecektir.'
                    : '* Required fields. Your application will be reviewed within 48 hours.'}
            </p>
        </form>
    );
};

export default ApplicationForm;
