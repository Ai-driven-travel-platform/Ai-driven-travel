from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class Destination(models.Model):
    CATEGORY_CHOICES = (
        ('historical', 'Historical'),
        ('natural', 'Natural'),
        ('cultural', 'Cultural'),
        ('religious', 'Religious'),
        ('adventure', 'Adventure'),
        ('beach', 'Beach'),
        ('mountain', 'Mountain'),
        ('city', 'City'),
    )
    
    REGION_CHOICES = (
        ('addis_ababa', 'Addis Ababa'),
        ('afar', 'Afar'),
        ('amhara', 'Amhara'),
        ('benishangul_gumuz', 'Benishangul-Gumuz'),
        ('diredawa', 'Dire Dawa'),
        ('gambela', 'Gambela'),
        ('harari', 'Harari'),
        ('oromia', 'Oromia'),
        ('sidama', 'Sidama'),
        ('somali', 'Somali'),
        ('south_west', 'South West'),
        ('southern', 'Southern'),
        ('tigray', 'Tigray'),
    )

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='destinations', null=True, blank=True)
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    region = models.CharField(max_length=1000, choices=REGION_CHOICES)
    city = models.CharField(max_length=1000)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    featured = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    review_count = models.IntegerField(default=0)
    images = models.JSONField(default=list)  # List of primary image URLs
    gallery_images = models.JSONField(default=list)  # List of gallery image URLs
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Ensure slug uniqueness
            original_slug = self.slug
            counter = 1
            while Destination.objects.filter(slug=self.slug).exclude(id=self.id).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
            # Cast longitude and latitude to 6 decimal places if they are not None
        if self.latitude is not None:
            self.latitude = round(float(self.latitude), 6)
        if self.longitude is not None:
            self.longitude = round(float(self.longitude), 6)
        
        super().save(*args, **kwargs)
    
    class Meta:
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
            models.Index(fields=['region']),
            models.Index(fields=['featured']),
            models.Index(fields=['status']),
        ]

class DestinationReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='reviews', null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='destination_reviews', null=True)
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])  # 1 to 5
    title = models.CharField(max_length=200)
    content = models.TextField()
    helpful = models.IntegerField(default=0)
    reported = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'}'s review of {self.destination.title if self.destination else 'Unknown'}"
    
    class Meta:
        indexes = [
            models.Index(fields=['destination']),
            models.Index(fields=['user']),
            models.Index(fields=['rating']),
        ]

class SavedDestination(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='saved_destinations', null=True)
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} saved {self.destination.title if self.destination else 'Unknown'}"
    
    class Meta:
        unique_together = ('user', 'destination')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['destination']),
        ]