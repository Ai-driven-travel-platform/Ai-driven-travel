from rest_framework import serializers
from django.core.validators import URLValidator
from .models import Destination, DestinationReview, SavedDestination
from users.serializers import UserSerializer
from decimal import Decimal

class DestinationSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.CharField(validators=[URLValidator()]),
        help_text="A list of primary image URLs",
        required=False
    )
    gallery_images = serializers.ListField(
        child=serializers.CharField(validators=[URLValidator()]),
        help_text="A list of gallery image URLs",
        required=False
    )
    latitude = serializers.CharField(allow_null=True, required=False)
    longitude = serializers.CharField(allow_null=True, required=False)

    class Meta:
        model = Destination
        fields = [
            'id', 'user', 'title', 'slug', 'description', 'category', 'region',
            'city', 'address', 'latitude', 'longitude', 'featured', 'status',
            'rating', 'review_count', 'images', 'gallery_images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'slug', 'rating', 'review_count', 'created_at', 'updated_at']
    
    def validate(self, data):
        # Convert latitude and longitude to Decimal
        if 'latitude' in data and data['latitude'] is not None:
            try:
                data['latitude'] = Decimal(data['latitude'])
                if not -90 <= data['latitude'] <= 90:
                    raise serializers.ValidationError("Latitude must be between -90 and 90")
            except (ValueError, TypeError):
                raise serializers.ValidationError("Latitude must be a valid number")
        if 'longitude' in data and data['longitude'] is not None:
            try:
                data['longitude'] = Decimal(data['longitude'])
                if not -180 <= data['longitude'] <= 180:
                    raise serializers.ValidationError("Longitude must be between -180 and 180")
            except (ValueError, TypeError):
                raise serializers.ValidationError("Longitude must be a valid number")
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class DestinationDetailSerializer(DestinationSerializer):
    reviews = serializers.SerializerMethodField()
    
    class Meta(DestinationSerializer.Meta):
        fields = DestinationSerializer.Meta.fields + ['reviews']
    
    def get_reviews(self, obj):
        reviews = obj.reviews.all().order_by('-created_at')[:5]
        return DestinationReviewSerializer(reviews, many=True).data

class DestinationReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    destination = serializers.PrimaryKeyRelatedField(queryset=Destination.objects.all())
    rating = serializers.IntegerField(min_value=1, max_value=5)
    title = serializers.CharField(max_length=200)
    content = serializers.CharField()
    helpful = serializers.IntegerField(read_only=True)
    reported = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = DestinationReview
        fields = ['id', 'destination', 'user', 'rating', 'title', 'content', 
                 'helpful', 'reported', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'helpful', 'reported', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class SavedDestinationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    destination = DestinationSerializer(read_only=True)
    
    class Meta:
        model = SavedDestination
        fields = ['id', 'user', 'destination', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)