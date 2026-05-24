import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function OrderReviewScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    fetchOrderProducts();
  }, [orderId]);

  const fetchOrderProducts = async () => {
    try {
      // Fetch order items with product details
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          product_id,
          product_name,
          quantity,
          price,
          products (
            id,
            name,
            images,
            brand
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Initialize all products as reviewable
      // Database unique constraint will prevent duplicate reviews
      const initialReviews = {};
      orderItems.forEach(item => {
        initialReviews[item.product_id] = {
          rating: 0,
          comment: '',
          alreadyReviewed: false,
        };
      });

      setProducts(orderItems);
      setReviews(initialReviews);
    } catch (err) {
      console.error('Failed to fetch order products:', err);
      window.alert(t('product.reviewLoadError'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateRating = (productId, rating) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const updateComment = (productId, comment) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment },
    }));
  };

  const handleSubmitReviews = async () => {
    // Validate: at least one product must have a rating
    const hasAnyRating = Object.values(reviews).some(r => r.rating > 0);

    if (!hasAnyRating) {
      window.alert(t('product.rateAtLeastOne'));
      return;
    }

    // Confirm submission with appreciative message
    const confirmed = window.confirm(
      `${t('product.confirmSubmitTitle')}\n\n${t('product.confirmSubmitMessage')}`
    );

    if (!confirmed) return;

    setSubmitting(true);
    try {
      // Prepare reviews to insert (only ones with ratings)
      const reviewsToInsert = Object.entries(reviews)
        .filter(([_, review]) => review.rating > 0)
        .map(([productId, review]) => ({
          product_id: productId,
          user_id: user.id,
          rating: review.rating,
          comment: review.comment.trim() || null,
        }));

      if (reviewsToInsert.length === 0) {
        window.alert(t('product.noNewReviews'));
        setSubmitting(false);
        return;
      }

      // Insert reviews
      const { error } = await supabase
        .from('reviews')
        .insert(reviewsToInsert);

      if (error) {
        // Check if it's a duplicate key error (unique constraint violation)
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          window.alert(t('product.alreadyReviewed'));
          navigation.goBack();
          return;
        }
        throw error;
      }

      window.alert(t('product.reviewsSubmitted', { count: reviewsToInsert.length }));
      navigation.goBack();
    } catch (err) {
      console.error('Failed to submit reviews:', err);
      window.alert(t('product.reviewSubmitError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          <Text style={styles.loadingText}>{t('product.loadingProducts')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('product.writeReview')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            {t('product.reviewSubtitle')}
          </Text>

          {/* Appreciation Message */}
          <View style={styles.appreciationBox}>
            <Sparkles size={24} color="#3B82F6" style={styles.appreciationIcon} />
            <View style={styles.appreciationTextContainer}>
              <Text style={styles.appreciationTitle}>{t('product.thankYouPurchase')}</Text>
              <Text style={styles.appreciationText}>
                {t('product.feedbackAppreciation')}
              </Text>
            </View>
          </View>

          {/* Products List */}
          {products.map((item, index) => {
            const product = item.products;
            const review = reviews[item.product_id] || { rating: 0, comment: '', alreadyReviewed: false };
            const productImage = product?.images?.[0] || 'https://via.placeholder.com/80';

            return (
              <View key={item.id} style={styles.productCard}>
                {/* Product Info */}
                <View style={styles.productHeader}>
                  <Image source={{ uri: productImage }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product?.name || item.product_name}
                    </Text>
                    {product?.brand && (
                      <Text style={styles.productBrand}>{product.brand}</Text>
                    )}
                    <Text style={styles.productQty}>{t('product.qty', { quantity: item.quantity })}</Text>
                  </View>
                </View>


                {/* Rating Stars */}
                <View style={styles.ratingSection}>
                  <Text style={styles.ratingLabel}>{t('product.yourRating')}</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => updateRating(item.product_id, star)}
                        activeOpacity={0.7}
                      >
                        <Star
                          size={32}
                          color={star <= review.rating ? '#F59E0B' : '#D1D5DB'}
                          fill={star <= review.rating ? '#F59E0B' : 'transparent'}
                          style={{ marginHorizontal: 4 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Comment Input */}
                <View style={styles.commentSection}>
                  <Text style={styles.commentLabel}>{t('product.yourReview')}</Text>
                  <TextInput
                    style={styles.commentInput}
                    placeholder={t('product.reviewPlaceholder')}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    value={review.comment}
                    onChangeText={(text) => updateComment(item.product_id, text)}
                  />
                  <Text style={styles.charCount}>{t('product.charCount', { count: review.comment.length })}</Text>
                </View>

                {index < products.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmitReviews}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <CheckCircle2 size={20} color="#fff" />
                <Text style={styles.submitButtonText}>{t('product.submitReviews')}</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            {t('product.reviewFooterNote')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  appreciationBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  appreciationIcon: {
    marginTop: 2,
  },
  appreciationTextContainer: {
    flex: 1,
  },
  appreciationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  appreciationText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  productQty: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alreadyReviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    gap: 4,
  },
  alreadyReviewedText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentSection: {
    marginBottom: 8,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  footerNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
});
