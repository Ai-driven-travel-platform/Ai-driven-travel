from rest_framework import serializers
from .models import Package, PackageReview, SavedPackage, Departure
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
import re
from datetime import datetime, time

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = fields
        ref_name = 'PackageUserSerializer'


class PackageReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    package = serializers.PrimaryKeyRelatedField(queryset=Package.objects.all())

    class Meta:
        model = PackageReview
        fields = [
            'id', 'package', 'user', 'rating', 'comment',
            'helpful', 'reported', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'helpful', 'reported', 'created_at', 'updated_at']
        ref_name = 'PackageReviewSerializer'

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate_rating(self, value):
        if not 0 <= value <= 5:
            raise serializers.ValidationError(_("Rating must be between 0 and 5."))
        return value


class PackageListSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)

    class Meta:
        model = Package
        fields = [
            'id', 'organizer', 'title', 'slug', 'category', 'location', 'region',
            'price', 'discounted_price', 'duration', 'duration_in_days',
            'image', 'gallery_images', 'rating', 'featured', 'status',
            'description', 'short_description', 'included', 'not_included',
            'itinerary', 'departure', 'departure_time', 'return_time',
            'max_group_size', 'min_age', 'difficulty', 'tour_guide',
            'languages', 'coordinates'
        ]
        read_only_fields = ['id', 'organizer', 'slug', 'rating', 'created_at', 'updated_at']
        ref_name = 'PackageListSerializer'


class SavedPackageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    package = PackageListSerializer(read_only=True)

    class Meta:
        model = SavedPackage
        fields = ['id', 'user', 'package', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
        ref_name = 'SavedPackageSerializer'

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DepartureSerializer(serializers.ModelSerializer):
    package = serializers.PrimaryKeyRelatedField(queryset=Package.objects.all())

    class Meta:
        model = Departure
        fields = [
            'id', 'package', 'start_date', 'end_date', 'price',
            'available_slots', 'is_guaranteed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        ref_name = 'DepartureSerializer'


class PackageDetailSerializer(PackageListSerializer):
    reviews = PackageReviewSerializer(many=True, read_only=True)
    departures = DepartureSerializer(many=True, read_only=True)

    class Meta(PackageListSerializer.Meta):
        fields = PackageListSerializer.Meta.fields + ['reviews', 'departures']
        read_only_fields = PackageListSerializer.Meta.read_only_fields + ['status']
        ref_name = 'PackageDetailSerializer'


class PackageSerializer(PackageListSerializer):
    class Meta(PackageListSerializer.Meta):
        fields = PackageListSerializer.Meta.fields
        read_only_fields = PackageListSerializer.Meta.read_only_fields
        ref_name = 'PackageSerializer'

    def validate(self, data):
        """
        Validate and normalize package data based on the provided schema.
        """
        # Normalize string fields
        string_fields = [
            'title', 'location', 'region', 'description', 'short_description',
            'departure', 'tour_guide', 'duration'
        ]
        for field in string_fields:
            if field in data:
                value = data[field].strip() if isinstance(data[field], str) else data[field]
                if not value:
                    raise serializers.ValidationError({field: _("This field cannot be empty.")})
                # if len(value) > 255:  # Adjust based on model constraints
                #     raise serializers.ValidationError({field: _("This field is too long (max 255 characters).")})
                data[field] = value

        # Validate and parse coordinates
        if 'coordinates' in data:
            if isinstance(data['coordinates'], str):
                try:
                    # Handle formats like "40.7128° N, 74.0060° E" or "40.7128,74.0060"
                    coords = re.sub(r'[°NESW]', '', data['coordinates']).split(',')
                    lat = float(coords[0].strip())
                    lon = float(coords[1].strip())
                    data['coordinates'] = [lat, lon]
                except (ValueError, IndexError):
                    raise serializers.ValidationError({"coordinates": _("Invalid coordinates format. Use 'lat,lon' or 'lat° N, lon° E'.")})

        # Parse and validate list fields
        list_fields = {
            'category': lambda x: [x.strip()],
            'gallery_images': lambda x: [item.strip() for item in x.split(',')],
            'included': lambda x: [item.strip() for item in x.split(',')],
            'not_included': lambda x: [item.strip() for item in x.split(',')],
            'languages': lambda x: [item.strip() for item in x.split(',')],
            'itinerary': lambda x: [item.strip() for item in x.split(';')]
        }
        for field, parser in list_fields.items():
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = parser(data[field])
                    if not data[field] or any(not item for item in data[field]):
                        raise serializers.ValidationError({field: _("List items cannot be empty.")})
                except Exception:
                    raise serializers.ValidationError({field: _(f"Invalid format for {field}.")})

        # Validate and parse price fields
        for price_field in ['price', 'discounted_price']:
            if price_field in data:
                value = data[price_field]
                if isinstance(value, str):
                    try:
                        cleaned_value = re.sub(r'[^\d.]', '', value)  # Remove non-numeric chars
                        data[price_field] = float(cleaned_value)
                    except ValueError:
                        raise serializers.ValidationError({price_field: _("Invalid price format. Use numeric value (e.g., '100.50').")})
                if data[price_field] < 0:
                    raise serializers.ValidationError({price_field: _("Price cannot be negative.")})

        # Ensure discounted_price is less than price
        if 'price' in data and 'discounted_price' in data and data['discounted_price']:
            if data['discounted_price'] >= data['price']:
                raise serializers.ValidationError({"discounted_price": _("Discounted price must be less than regular price.")})

        # Validate time fields
        time_mappings = {
            'morning': time(8, 0),
            'afternoon': time(14, 0),
            'evening': time(18, 0)
        }
        for time_field in ['departure_time', 'return_time']:
            if time_field in data and isinstance(data[time_field], str):
                value = data[time_field].lower().strip()
                try:
                    data[time_field] = datetime.strptime(value, '%H:%M:%S').time()
                except ValueError:
                    try:
                        data[time_field] = datetime.strptime(value, '%H:%M').time()
                    except ValueError:
                        for key, time_value in time_mappings.items():
                            if key in value:
                                data[time_field] = time_value
                                break
                        else:
                            raise serializers.ValidationError({time_field: _("Invalid time format. Use HH:MM, HH:MM:SS, or descriptive time (e.g., 'Morning').")})

        # Validate numeric fields
        numeric_fields = {
            'duration_in_days': (1, 365, _("Duration must be between 1 and 365 days.")),
            'max_group_size': (1, 1000, _("Group size must be between 1 and 1000.")),
            'min_age': (0, 120, _("Minimum age must be between 0 and 120."))
        }
        for field, (min_val, max_val, error_msg) in numeric_fields.items():
            if field in data:
                if not isinstance(data[field], int) or not min_val <= data[field] <= max_val:
                    raise serializers.ValidationError({field: error_msg})

        # Validate status
        if 'status' in data and data['status'] not in ['active', 'draft']:
            raise serializers.ValidationError({"status": _("Status must be 'active' or 'draft'.")})

        # Validate difficulty
        if 'difficulty' in data and data['difficulty'] not in ['Easy', 'Moderate', 'Hard']:
            raise serializers.ValidationError({"difficulty": _("Difficulty must be 'Easy', 'Moderate', or 'Hard'.")})

        # Validate featured
        if 'featured' in data and not isinstance(data['featured'], bool):
            raise serializers.ValidationError({"featured": _("Featured must be a boolean (true/false).")})

        return data

    def create(self, validated_data):
        """
        Create a new package with the authenticated user as the organizer.
        """
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Update an existing package, preventing organizer modification.
        """
        validated_data.pop('organizer', None)
        return super().update(instance, validated_data)