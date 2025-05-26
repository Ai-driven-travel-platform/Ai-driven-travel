from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PackageBooking, PackagePayment, PackageReview
from packages.serializers import PackageListSerializer

User = get_user_model()

class PackageBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackageBooking
        fields = ['id', 'package', 'number_of_people', 'special_requests', 'status']
        read_only_fields = ['id', 'status']

    def validate(self, data):
        if not data.get('package'):
            raise serializers.ValidationError("Package is required for booking.")
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'pending'
        return super().create(validated_data)

    def to_representation(self, instance):
        return {
            'id': str(instance.id),
            'package': instance.package.id,
            'number_of_people': instance.number_of_people,
            'special_requests': instance.special_requests,
            'status': instance.status
        }

class PackagePaymentSerializer(serializers.ModelSerializer):
    booking = PackageBookingSerializer(read_only=True)

    class Meta:
        model = PackagePayment
        fields = [
            'id', 'booking', 'amount', 'payment_method', 'status',
            'transaction_id', 'stripe_payment_intent_id', 'stripe_client_secret',
            'currency', 'created_at'
        ]
        read_only_fields = [
            'id', 'status', 'transaction_id', 'stripe_payment_intent_id',
            'stripe_client_secret', 'created_at'
        ]

    def validate_booking(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("You can only make payments for your own bookings.")
        return value

class PackageReviewSerializer(serializers.ModelSerializer):
    booking = PackageBookingSerializer(read_only=True)

    class Meta:
        model = PackageReview
        fields = ['id', 'booking', 'rating', 'title', 'content', 'helpful', 'reported', 'created_at']
        read_only_fields = ['id', 'helpful', 'reported', 'created_at']

    def validate(self, data):
        if data['booking'].user != self.context['request'].user:
            raise serializers.ValidationError("You can only review your own bookings.")
        if data['rating'] < 1 or data['rating'] > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return data